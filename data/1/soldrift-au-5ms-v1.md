# -1/SolDrift-AU-5MS-v1

## Resumen

SolDrift-AU-5MS-v1 es un modelo de predicción probabilística a muy corto plazo (nowcasting) de la generación de plantas solares fotovoltaicas de gran escala en el Mercado Nacional de Electricidad de Australia (NEM). Lo desarrolla Trajectory Labs (Melbourne) y resuelve un problema concreto: anticipar con 10 a 60 minutos de antelación la potencia que inyectará una planta solar, con incertidumbre cuantificada, para que operadores y participantes del mercado puedan gestionar rampas, despachos y reservas.

El modelo combina imágenes recientes del satélite geoestacionario Himawari-9 (bandas visible e infrarrojo), el histórico de telemetría SCADA de la planta a resolución de 5 minutos y geometría solar. A partir de estas entradas devuelve, para cada planta y cada intervalo de despacho, cuantiles P10/P50/P90 del factor de capacidad, una predicción media, la probabilidad de rampa fuerte y, opcionalmente, trayectorias conjuntas muestreadas sobre los cinco horizontes.

Técnicamente es un ensemble de 7 redes neuronales de tres familias (codificadores convolucionales con atención y cabezas de cuantiles, y una cabeza de flujo rectificado para trayectorias), con 16.697.086 parámetros en total. Se distribuye en ONNX (67,25 MB) y pesos PyTorch, con licencia Apache-2.0, y está pensado para inferencia en CPU con solo `numpy` y `onnxruntime`, lo que facilita su despliegue en entornos operativos ligeros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de 7 redes (3 familias: flow con CNN residual + atención + rectified flow, ConvNeXt-V2, split-window) con cabezas duales de media y cuantiles |
| Parametros totales | 16.697.086 (12.086.924 en el subconjunto de 2 bandas) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica en el sentido de LLM; ventana temporal de entrada: 6 frames satelitales de t−70 a t−20 min y 1 hora de histórico SCADA a 5 min |
| Tipos de cuantizacion | No disponible (se distribuye en ONNX float y state dicts PyTorch; no se documentan variantes cuantizadas) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (67,25 MB, incluye 3 redes de velocidad) y state dicts PyTorch en `weights/` |

## Arquitectura y entrenamiento

El modelo es un ensemble de 7 miembros de tres familias entrenadas sobre los mismos datos y promediadas con igual peso. La familia *flow* (3 miembros, semillas 42, 101 y 202) usa un codificador CNN residual 3×3 con dos capas de self-attention sobre el mapa de 8×8 y una red de velocidad de flujo rectificado. La familia *ConvNeXt* (2 miembros, semillas 303 y 404) emplea bloques ConvNeXt-V2 (convolución depthwise 7×7 y GRN) con una capa de self-attention sobre el mapa 8×8. La familia *split-window* (2 miembros, semillas 505 y 606) replica el codificador de la familia flow sin la cabeza de flujo y consume 43 canales en lugar de 19.

Todos los miembros comparten el resto del diseño: atención sobre las 64 celdas del mapa de características 8×8 (celdas de 16 km), lectura de características a tres escalas cerca de la planta más una rejilla sectorial 4×4 sobre el parche completo de 128 km, modulación FiLM del mapa más profundo mediante el embedding de geometría solar, y una cabeza dual que predice media y cuantiles P10/P50/P90 como correcciones a la persistencia de cielo claro, más un logit de rampa por horizonte. En los miembros flow, una red de velocidad de 256 dimensiones condicionada por la representación de la cabeza se entrena con *rectified flow matching* sobre el residual (real menos persistencia) en los cinco horizontes; las trayectorias se generan integrando la ODE aprendida desde ruido gaussiano en 8 pasos de Heun.

El entrenamiento cubre del 28 de noviembre de 2025 al 23 de noviembre de 2026 (325 días activos), con 95 plantas solares de 15 MW o más (10.749,5 MW AC en total: 41 en NSW, 29 en QLD, 16 en VIC y 9 en SA). Las imágenes provienen de Himawari-9 AHI Level-1b (bandas B02, B13, B05, B07 y B09) del bucket NOAA `s3://noaa-himawari9`, y la telemetría de los datos de unidad a 5 minutos de AEMO (`INITIALMW`, `AVAILABILITY`, `SEMIDISPATCHCAP`) de NEMWEB Next_Day_Dispatch. Los miembros se entrenaron durante 16 épocas (14 para los de split-window) con aumento por simetría D4, media móvil exponencial de pesos y AdamW sobre una NVIDIA L4.

## Capacidades

- Predicción probabilística del factor de capacidad de plantas solares a +10, +20, +30, +45 y +60 minutos.
- Salida de cuantiles P10, P50 y P90 por horizonte, además de una predicción media.
- Estimación de la probabilidad de rampa fuerte (desviación de 0,15 o más respecto a la persistencia de cielo claro).
- Muestreo de trayectorias conjuntas coherentes sobre los cinco horizontes mediante flujo rectificado, útil para estimar el momento y la profundidad de una rampa.
- Dos modos de inferencia: `full` (7 miembros, 5 bandas satelitales) y `2band` (5 miembros, solo B02 y B13).
- Construcción de tensores de entrada desde datos en bruto mediante `build_feature_tensors_5b` y `build_feature_tensors_2b`.
- Inferencia en CPU con `numpy` y `onnxruntime`, sin necesidad de GPU.
- Alcance geográfico limitado a plantas del NEM australiano (QLD, NSW, VIC, SA).

## Casos de uso

- Despacho y oferta en el mercado mayorista: un participante del NEM puede usar los cuantiles P10/P50/P90 a 5-60 minutos para ajustar su oferta y reducir el riesgo de desvíos respecto al despacho programado, aprovechando la resolución de 5 minutos alineada con el intervalo de despacho de AEMO.
- Gestión de rampas en tiempo real: la probabilidad de rampa y las trayectorias muestreadas permiten al operador anticipar caídas o subidas bruscas de generación (por ejemplo, por paso de nubes) y preparar reservas o respuestas automáticas de control.
- Integración en sistemas de gestión de energía (EMS) de la planta: al ejecutarse en CPU con `onnxruntime`, el modelo puede desplegarse junto al SCADA de la planta para generar previsiones locales sin infraestructura GPU.
- Planificación de reservas y servicios auxiliares: los cuantiles permiten dimensionar márgenes de reserva con un nivel de confianza explícito, en lugar de usar previsiones puntuales.
- Investigación en nowcasting solar: el ensemble, las tres familias de arquitectura y las trayectorias de flujo rectificado constituyen una base reproducible (Apache-2.0) para comparar métodos de predicción probabilística con datos de Himawari-9 y AEMO.
- Evaluación de impacto de curtailment: dado que el modelo incorpora la disponibilidad AEMO y el límite de semidespacho (presente en el 41,96% de los días de entrenamiento), puede emplearse para analizar cómo la restricción de red afecta a la generación prevista.
- Alertas operativas para plantas individuales: la salida por planta y por intervalo permite generar avisos cuando la probabilidad de rampa supera un umbral configurable, integrables en sistemas de monitorización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para el modo ONNX en CPU; el modelo se ejecuta con `numpy` y `onnxruntime`. El artefacto ONNX ocupa 67,25 MB y el repositorio completo 0,2 GB.
- GPU recomendadas: no se especifican requisitos de GPU para inferencia; el entrenamiento se realizó en NVIDIA L4.
- Cabe en GPU de consumo: sí, en principio, dado el reducido tamaño (16,7 M de parámetros), aunque no se documentan requisitos ni rendimiento en GPU.
- Opciones de despliegue: ONNX Runtime (CPU) como vía principal; pesos PyTorch disponibles en `weights/` para quienes prefieran el ecosistema PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se puede señalar, como referencia cualitativa, que la mayoría de sistemas operativos de nowcasting solar combinan modelos físicos de movimiento de nubes con aprendizaje automático, pero no se aportan datos de parámetros, contexto ni rendimiento de alternativas concretas.

| Modelo | Parámetros | Contexto/ventana | Licencia | Disponibilidad |
|---|---|---|---|---|
| SolDrift-AU-5MS-v1 | 16,7 M | 6 frames satelitales + 1 h SCADA | Apache-2.0 | ONNX y PyTorch en Hugging Face |
| Alternativas | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Cobertura geográfica restringida al NEM australiano (QLD, NSW, VIC, SA); no se ha validado fuera de esa región ni con otras constelaciones satelitales.
- Dependencia de Himawari-9: las imágenes se limitan a t−20 min o anteriores para garantizar disponibilidad en tiempo real, lo que introduce un retardo mínimo en la información visual.
- El modelo predice correcciones sobre la persistencia de cielo claro, por lo que hereda los supuestos de ese anclaje y puede degradarse en condiciones muy alejadas de la persistencia.
- Riesgo de alucinación en el sentido de previsiones mal calibradas: los cuantiles y probabilidades de rampa deben validarse en la planta concreta antes de usarse en producción, ya que el entrenamiento agregado sobre 95 plantas no garantiza calibración individual.
- Sesgo potencial hacia las condiciones meteorológicas y de mercado del período de entrenamiento (noviembre de 2025 a noviembre de 2026) y hacia la distribución de plantas de la muestra.
- El idioma declarado es únicamente inglés; la documentación y las interfaces están en ese idioma.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones de las fuentes de datos subyacentes (NOAA y AEMO) para su redistribución.
- No se documentan pruebas de robustez ante huecos en la telemetría SCADA o datos satelitales faltantes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/-1/SolDrift-AU-5MS-v1
- Informe técnico: `TECHNICAL_REPORT.md` (referenciado en la model card, dentro del repositorio)
- Datos satelitales Himawari-9 (NOAA Open Data): `s3://noaa-himawari9`
- Datos de telemetría AEMO: NEMWEB Next_Day_Dispatch
- Lista de registro y exención del NEM de AEMO: NEM Registration and Exemption List (referenciada en la model card)
