# Hexian-2001/DeepWind1.0-890M

## Resumen

DeepWind1.0-890M es el checkpoint base de 888,24 millones de parámetros de DeepWind, un modelo fundacional de tipo decoder-only Transformer diseñado para predicción probabilística de potencia eólica en régimen zero-shot. Lo desarrolla Hexian-2001 (H. Wang, T. Zhou, C. Jia, Y. Liu y L. Wang) y se presenta en el artículo "DeepWind: A foundation model for zero-shot wind power forecasting", publicado en *Energy* (vol. 360, 141793, 2026).

El modelo resuelve un problema concreto del sector energético: emitir una predicción probabilística (21 cuantiles entre 0,01 y 0,99) por emplazamiento y horizonte directamente a partir de un contexto histórico de potencia y, cuando estén disponibles, covariables meteorológicas y coordenadas del sitio. Frente a los enfoques clásicos, que requieren reentrenar un modelo por parque, DeepWind apuesta por el paradigma fundacional: un único modelo preentrenado sobre aproximadamente 562.000 millones de observaciones de viento que se aplica sin ajuste específico.

La arquitectura combina parcheado temporal, atención desacoplada entre tiempo y variables (RoPE + xPOS), capas de mezcla de expertos dispersas con top-2 de 8 expertos y una cabeza de predicción multi-cuantil directa, con una ventana máxima de 8192 (parches de 16 pasos con stride 16). Su relevancia actual radica en que traslada al dominio eólico las técnicas de los modelos fundacionales de series temporales y en que se publica bajo licencia Apache-2.0, aunque el modelo es todavía un artefacto de investigación sin validación comunitaria (0 descargas y 0 likes en el momento de redactar esta ficha).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con parcheado temporal, atención desacoplada tiempo/variable (RoPE + xPOS), capas MoE dispersas top-2 y cabeza de predicción multi-cuantil directa |
| Parámetros totales | 888.243.637 (888,24 M entrenables) |
| Parámetros activos | no disponible (MoE con 8 expertos y top-2 activos; el autor no publica el desglose de parámetros activos) |
| Longitud de contexto | 8192 (parcheado de tamaño 16 y stride 16, es decir, 512 parches) |
| Tipos de cuantización | no disponible (solo se publican pesos safetensors sin cuantizar) |
| Idiomas soportados | no disponible / no aplica (modelo de series temporales, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería `transformers`, con código de modelo personalizado) |
| Pipeline declarado | `time-series-forecasting` |
| Cuantiles de salida | 21 (0,01–0,99) por emplazamiento y horizonte |
| Normalización | RMSNorm + arcsinh |
| Codificación posicional | RoPE + xPOS |
| Tamaño del repositorio | 3,6 GB |
| Fecha de creación / actualización | 2026-09-19 / 2026-09-19 |

## Arquitectura y entrenamiento

DeepWind es un Transformer decoder-only adaptado a series temporales multivariantes. La entrada se divide en parches de 16 pasos con stride 16, lo que convierte la ventana máxima de 8192 en 512 tokens de parche. La atención está desacoplada en dos ejes (tiempo y variable) y emplea codificación posicional combinada RoPE + xPOS. Las capas de feed-forward son SwiGLU con anchura 2816 y se sustituyen por capas de mezcla de expertos dispersas: 8 expertos con enrutado top-2 por token, lo que reduce el coste de cómputo respecto a un FFN denso equivalente. El modelo tiene 12 capas, `d_model` de 1024 y 16 cabezas de atención (dimensión por cabeza de 64). La normalización usa RMSNorm junto con una transformación arcsinh, habitual para estabilizar series de potencia con colas pesadas y valores nulos. La salida no es un valor puntual, sino una cabeza de predicción directa que emite 21 cuantiles (0,01–0,99) por emplazamiento y horizonte.

El preentrenamiento se realizó sobre aproximadamente 562.000 millones de observaciones de viento, con AdamW (β₁ = 0,9, β₂ = 0,95), learning rate máximo de 1e-4, warmup lineal del 3 % de los pasos, decaimiento coseno, weight decay 0,01, recorte de gradiente en 1,0, precisión BF16 y tamaño de lote global de 256. No se documentan en la información disponible fases de RLHF, DPO u otro ajuste por preferencias, algo esperable en un modelo de forecasting numérico. El articulo menciona una decodificación "expand-collapse" propia para la inferencia completa, implementada en el repositorio del proyecto.

## Capacidades

- Predicción probabilística de potencia eólica con 21 cuantiles por emplazamiento y horizonte, no solo un valor puntual.
- Funcionamiento zero-shot: no requiere reentrenamiento ni ajuste por parque para emitir predicciones, según lo declarado por el autor.
- Acepta covariables meteorológicas opcionales y coordenadas del emplazamiento como entradas adicionales.
- Modelado multivariante con atención desacoplada entre el eje temporal y el eje de variables.
- Capacidad de manejar contextos largos (hasta 8192 pasos de tiempo, 512 parches) gracias al parcheado temporal.
- Enrutado disperso top-2 sobre 8 expertos, que permite especialización implícita por régimen o tipo de sitio.
- Inferencia con decodificación expand-collapse específica del proyecto para la generación completa del horizonte.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni generación de texto: es un modelo numérico de series temporales.

## Casos de uso

- Predicción operativa de parques existentes: alimentar el modelo con el histórico de potencia del parque más las covariables meteorológicas disponibles y obtener cuantiles a distintos horizontes para planificar la producción del día siguiente.
- Ofertas en mercados eléctricos: usar los cuantiles (por ejemplo, P10, P50, P90) para construir ofertas que optimicen el beneficio esperado ajustando el riesgo de desvío, en lugar de una única predicción puntual.
- Puesta en marcha de parques nuevos sin histórico: al ser zero-shot, permite obtener una primera predicción razonable usando únicamente covariables meteorológicas y coordenadas, antes de acumular datos propios suficientes.
- Gestión de reservas y despacho: las bandas de incertidumbre permiten dimensionar reservas operativas y evaluar el riesgo de incumplimiento de compromisos de entrega.
- Agregación de cartera: al emitir cuantiles por emplazamiento y horizonte, facilita combinar varios parques y estimar la incertidumbre agregada de la cartera.
- Planificación de vertido y curtailment: anticipar episodios de excedente con alta probabilidad para coordinar limitaciones de red o almacenamiento.
- Detección de anomalías en sensores: una desviación sistemática entre observación y banda cuantil calibrada puede señalar fallos de sensor, cambios de control de turbina o políticas de restricción no declaradas.
- Investigación y evaluación de modelos fundacionales: sirve como referencia reproducible (Apache-2.0) para comparar estrategias de forecasting probabilístico zero-shot en el dominio eólico, siempre que se disponga de datos propios de validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas comparativas (ni métricas como pinball loss, CRPS, MAE o RMSE frente a otras alternativas), y el artículo referenciado en *Energy* (DOI 10.1016/j.energy.2026.141793) no ha sido accesible en la búsqueda realizada. No se deben asumir cifras de rendimiento a partir de esta ficha.

## Requisitos de hardware

- Estimación de VRAM para los pesos (cálculo a partir de 888,24 M de parámetros, sin overhead de activaciones): aproximadamente 3,55 GB en FP32, 1,78 GB en BF16/FP16, 0,89 GB en INT8 y 0,44 GB en INT4. El repositorio ocupa 3,6 GB, coherente con pesos en FP32 o safetensors sin comprimir.
- Al ser un MoE con 8 expertos y top-2, todos los expertos deben estar residentes en memoria, de modo que el ahorro del enrutado disperso se produce en cómputo, no en huella de memoria.
- Cabe sin problema en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090 ejecutan el modelo en BF16 con margen amplio. Incluso tarjetas de 4-8 GB pueden alojarlo en BF16 o INT8 si el runtime lo permite.
- Para lotes grandes o evaluación masiva sobre muchos parques, GPU de centro de datos (A100, H100, L40S) aportan margen para aumentar el batch y el throughput; el modelo es lo bastante pequeño como para que el cuello de botella sea la preparación de datos, no la GPU.
- La cache KV es reducida: 12 capas × 16 cabezas × 64 dimensiones × 512 parches × 2 (clave y valor) ≈ 12,6 M de elementos, unos 25 MB en FP16.
- Opciones de despliegue: la vía soportada es `transformers` con código personalizado, instalando primero el paquete desde el repositorio de GitHub (`pip install git+https://github.com/Hexian-2001/DeepWind.git`) y cargando el modelo con `DeepWindModel.from_pretrained("Hexian-2001/DeepWind1.0-890M")`.
- No hay pesos GGUF publicados, por lo que llama.cpp y Ollama no son utilizables directamente sin una conversión propia. Tampoco hay confirmación de soporte en vLLM o TGI: al tratarse de una arquitectura personalizada (`deepwind`) no registrada en esos motores, es probable que requieran implementación adicional.
- Latencia y throughput estimados: no disponibles. No se publican medidas de tokens por segundo, latencia por petición ni tiempo de inferencia por horizonte.

## Comparativa con modelos similares

No se dispone de cifras verificadas de los modelos alternativos en la información proporcionada; la comparación siguiente se limita a características generales ampliamente conocidas y debe contrastarse con las fuentes oficiales antes de tomar decisiones.

| Modelo | Desarrollador | Dominio | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DeepWind1.0-890M | Hexian-2001 (Wang et al.) | Potencia eólica (probabilístico, zero-shot) | 888,24 M | 8192 | Apache-2.0 | HuggingFace + repositorio en GitHub |
| Chronos / Chronos-Bolt | Amazon | Series temporales generales | no disponible en esta búsqueda | no disponible en esta búsqueda | Apache-2.0 | HuggingFace |
| TimesFM | Google Research | Series temporales generales | no disponible en esta búsqueda | no disponible en esta búsqueda | Apache-2.0 | HuggingFace |
| Moirai | Salesforce | Series temporales generales (incluye variante MoE) | no disponible en esta búsqueda | no disponible en esta búsqueda | Apache-2.0 | HuggingFace |
| TimeGPT | Nixtla | Series temporales generales | no disponible | no disponible | API propietaria | Servicio de pago |

Diferencias cualitativas relevantes: DeepWind está especializado en un único dominio (potencia eólica) y emite directamente 21 cuantiles, mientras que los modelos anteriores son genéricos y varios de ellos requieren estrategias de muestreo o cabezas adicionales para obtener salida probabilística. A cambio, DeepWind no ofrece la validación empírica ni el ecosistema de herramientas de los modelos de Amazon, Google o Salesforce.

## Limitaciones y advertencias

- Es un modelo de investigación: el propio autor recomienda validar y recalibrar los intervalos de predicción en el emplazamiento de despliegue antes de usarlos en producción.
- El rendimiento puede degradarse ante controles de turbina no vistos durante el preentrenamiento, políticas de curtailment, fallos de sensores o convenciones de covariables distintas de las usadas en el entrenamiento.
- El conjunto de datos propietario "Shanxi Wind" no puede redistribuirse, lo que impide reproducir el preentrenamiento y limita la auditabilidad de los datos de origen.
- Riesgo de sobreconfianza en los cuantiles: al emitir intervalos sin recalibración local, el modelo puede infrapredecir la incertidumbre real en regímenes poco representados. No es "alucinación" en sentido lingüístico, pero el efecto práctico (predicciones erróneas presentadas con aparente seguridad) es análogo.
- No es un modelo de lenguaje: no soporta idiomas, generación de texto, tool calling, agentes ni multimodalidad, pese a etiquetarse con la librería `transformers`.
- El contexto está limitado a 8192 pasos, es decir, 512 parches de 16 pasos: horizontes o históricos más largos exigen truncado, agregación o ventanas deslizantes.
- La resolución temporal de salida está fijada por el parcheado (16/16); no se documentan variantes con otros pasos temporales.
- Licencia Apache-2.0 para los pesos, pero el código del repositorio puede tener su propia licencia y `CITATION.cff`; conviene revisarlos antes de un uso comercial.
- Sin tracción comunitaria verificable: 0 descargas y 0 likes, repositorio creado en septiembre de 2026 y sin resultados de benchmarks publicados, por lo que no existe validación independiente del rendimiento declarado.
- El tag `endpoints_compatible` del repositorio no garantiza que la arquitectura personalizada funcione en endpoints gestionados sin el código del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hexian-2001/DeepWind1.0-890M
- Repositorio de código DeepWind: https://github.com/Hexian-2001/DeepWind
- Artículo: H. Wang et al., "DeepWind: A foundation model for zero-shot wind power forecasting", *Energy*, vol. 360, 141793, 2026: https://doi.org/10.1016/j.energy.2026.141793
- Cita BibTeX (según la model card):
  ```bibtex
  @article{wang2026deepwind,
    title     = {DeepWind: A foundation model for zero-shot wind power forecasting},
    author    = {Wang, Hexian and Zhou, Tongming and Jia, Chengzhen and Liu, Yushan and Wang, Lingmei},
    journal   = {Energy},
    volume    = {360},
    pages     = {141793},
    year      = {2026},
    doi       = {10.1016/j.energy.2026.141793}
  }
  ```
- No se han encontrado en la búsqueda web otros enlaces relevantes (papers alternativos, blogs, demos o espacios de HuggingFace) distintos de los anteriores.
