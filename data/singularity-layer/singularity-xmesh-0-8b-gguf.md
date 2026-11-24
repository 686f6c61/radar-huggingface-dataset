# singularity-layer/Singularity-xMESH-0.8B-GGUF

## Resumen

Singularity xMESH 0.8B es un modelo de decisión (no conversacional) desarrollado por singularity-layer, distribuido en formato GGUF cuantizado a partir de su versión BF16 original. Con 779.717.956 parámetros (aproximadamente 0,8 mil millones), está diseñado específicamente para responder preguntas tipadas con probabilidades calibradas: `noul` (sí/no), `choice` (selección entre opciones) y `score` (puntuación numérica). Su función principal es la selección de endpoints y servicios dentro del protocolo x402, actuando como "Multi-Endpoint Selection Head".

El modelo responde a una necesidad concreta en arquitecturas de agentes: tomar decisiones de enrutamiento fiables y calibradas sobre qué servicio invocar en cada etapa de un flujo, si un flujo es válido, o si conviene solicitar aclaración al usuario. No genera texto libre ni mantiene conversaciones; se integra a través del endpoint nativo `/v1/systemone` de llama.cpp. Su reducido tamaño (menos de 800 millones de parámetros) permite ejecución en CPU y Apple Silicon, con consumo de RAM que oscila entre 919 MB y 1.455 MB según la cuantización.

La relevancia actual del modelo radica en su enfoque de "decision model" empaquetado como GGUF con cuantizaciones verificadas decisión por decisión contra el BF16 de referencia. El repositorio incluye cinco variantes (Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS) con métricas de acuerdo respecto a BF16 sobre dos suites de evaluación: una suite x402 congelada de 80 casos y 960 decisiones, y una suite general de 76 peticiones y 264 decisiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de decisión, no conversacional; se ejecuta sobre llama.cpp) |
| Parametros totales | 779.717.956 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (perfil de producción: `-c 2048`) |
| Tipos de cuantizacion | Q8_0 (8 bits), Q6_K (6 bits), Q5_K_M (5 bits), Q4_K_M (4 bits), IQ4_XS (4 bits i-quant), BF16 (referencia) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (generado con llama.cpp b11719); BF16 de referencia en el repositorio original |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base (transformer, MoE, SSM u otra). Lo que sí se especifica es su naturaleza funcional: se trata de un "decision model" que responde preguntas tipadas (`noul`, `choice`, `score`) sobre un estado, emitiendo probabilidades calibradas. El modelo se sirve exclusivamente a través del endpoint `/v1/systemone` de llama.cpp, lo que implica que su interfaz de inferencia está integrada en dicha herramienta y no sigue el formato de chat convencional.

Respecto al entrenamiento, la model card no proporciona datos sobre número de tokens, composición del dataset ni si hubo RLHF/DPO. La información disponible se centra en el proceso de cuantización: los archivos GGUF se generaron a partir del BF16 oficial (`Singularity-xMESH-0.8B-BF16.gguf`, SHA-256 `9f4c08f19c4d203059bc74ed2754e800ec472d7276d8ddb2321480e86d392fff`) usando llama.cpp b11719, y cada cuantización se validó decisión por decisión contra el BF16. Las métricas de calibración reportadas (cambio en ECE y Brier) sugieren que el modelo base fue entrenado con objetivos de calibración probabilística, aunque no se detalla el método.

## Capacidades

- Respuesta a preguntas tipadas con probabilidades calibradas: `noul` (sí/no), `choice` (selección entre opciones) y `score` (puntuación numérica, incluyendo escalas de 0 a 3).
- Selección de endpoints y servicios: identifica qué servicio elegir para cada etapa de un flujo dentro del protocolo x402.
- Validación de flujos: determina si un flujo es válido y qué etapas necesita.
- Detección de necesidad de aclaración: decide si conviene pedir clarificación al usuario antes de continuar.
- Clasificación: soporta clasificación de tickets, idioma y sentimiento.
- Verificaciones booleanas sobre listados, logs y pagos.
- Planificación de servicios bajo restricciones de presupuesto y red.
- No soporta generación de texto libre, tool calling genérico ni razonamiento multi-paso conversacional.
- Capacidades multilingües limitadas al inglés.

## Casos de uso

- Enrutamiento de peticiones en el protocolo x402: el modelo selecciona el servicio adecuado para cada etapa de un flujo, usando la pregunta tipada `choice` con probabilidades calibradas para comparar candidatos.
- Validación de flujos de pago: antes de ejecutar una transacción, el modelo responde `noul` sobre si el flujo es válido y qué etapas requiere, actuando como comprobación previa en el pipeline.
- Atención al soporte técnico: clasifica tickets entrantes por categoría, idioma y sentimiento mediante preguntas `choice` y `score`, permitiendo el enrutamiento automático al equipo correspondiente.
- Control de presupuesto y red en planificación: dado un estado con límites de presupuesto y restricciones de red, el modelo emite decisiones `choice` sobre qué servicio seleccionar sin exceder los límites.
- Verificación de listados y logs: responde preguntas de sí/no sobre la validez de listados o la presencia de condiciones en logs, con probabilidades que permiten fijar umbrales de aprobación.
- Despliegue en edge y Apple Silicon: con cuantizaciones de 487 MB (IQ4_XS) a 787 MB (Q8_0) y consumo de RAM de 919 MB a 1.455 MB, puede ejecutarse en máquinas de recursos limitados para decisiones de enrutamiento en local.
- Puerta de aprobación previa a movimientos de dinero: el propio autor recomienda mantener comprobaciones de presupuesto y aprobación delante de cualquier decisión que mueva fondos, dado que las cuantizaciones de 4 bits alteran más respuestas.

## Benchmarks y rendimiento

Los datos disponibles comparan cada cuantización contra el BF16 de referencia, no contra otros modelos. Se usaron dos suites a través de `/v1/systemone` con perfil de producción (`-c 2048 -b 2048 -ub 2048 --parallel 1`): la suite x402 congelada (80 casos, 960 decisiones; 12 decisiones por caso) y una suite general (76 peticiones, 264 decisiones).

| Archivo | Tamano | Igual que BF16, x402 | Igual que BF16, general | RAM pico en CPU | Decisiones cambiadas (de 1.224) |
|---|---:|---:|---:|---:|---:|
| Q8_0 | 787 MB | 99,9% | 99,6% | 1.455 MB | 2 |
| Q6_K | 667 MB | 99,6% | 98,1% | 1.308 MB | 9 |
| Q5_K_M | 613 MB | 99,3% | 98,1% | 1.179 MB | 12 |
| Q4_K_M | 547 MB | 98,7% | 92,0% | 1.087 MB | 34 |
| IQ4_XS | 487 MB | 98,4% | 94,7% | 919 MB | 29 |
| BF16 (referencia) | 1.572 MB | 960 (referencia) | no disponible | no disponible | 0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card incluye además métricas de deriva de probabilidad, acierto en x402 y general, flujos completos exactos, y cambios en ECE y Brier, pero la tabla citada queda truncada en la información proporcionada.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 919 MB (IQ4_XS), 1.087 MB (Q4_K_M), 1.179 MB (Q5_K_M), 1.308 MB (Q6_K), 1.455 MB (Q8_0) de RAM pico en CPU; BF16 requiere 1.572 MB de tamaño de archivo.
- GPU recomendadas: no se especifican modelos de GPU concretos; el modelo está orientado a CPU y Apple Silicon.
- Cabe en cualquier GPU consumer con más de 2 GB de memoria, así como en CPU y Apple Silicon.
- Opciones de despliegue: llama.cpp (versión b11719 o superior), a través del endpoint nativo `/v1/systemone`; los tags incluyen compatibilidad con endpoints.
- Latencia y throughput: no disponibles en la información proporcionada. El perfil de producción usa `--parallel 1`, lo que indica ejecución de una petición concurrente.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (modelos de decisión para selección de endpoints o enrutamiento con probabilidades calibradas). Las búsquedas web realizadas devuelven resultados sobre el concepto de singularidad tecnológica, Singularity University y Singularity Viewer, sin relación con este modelo.

## Limitaciones y advertencias

- No es un modelo conversacional: no genera texto libre ni mantiene diálogos multi-turno; solo responde preguntas tipadas a través de `/v1/systemone`.
- Solo soporta inglés, lo que limita su uso en entornos multilingües.
- Las cuantizaciones de 4 bits (Q4_K_M, IQ4_XS) alteran un número notablemente mayor de decisiones (34 y 29 de 1.224 respectivamente), con especial deriva en decisiones generales (Q4_K_M baja al 92,0% de acuerdo con BF16).
- El propio autor advierte de mantener comprobaciones de presupuesto y aprobación delante de cualquier decisión que mueva dinero, incluso con las cuantizaciones de mayor fidelidad.
- Riesgo de alucinación: no evaluado en la información disponible; al emitir probabilidades calibradas, el riesgo se traslada a la calibración, y la model card reporta cambios en ECE y Brier pero la tabla está truncada.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero no se detallan restricciones adicionales más allá de las estándar de dicha licencia.
- El contexto está limitado a 2048 tokens en el perfil de producción, insuficiente para estados o flujos muy extensos.
- La fecha de creación del repositorio (2026-11-16) y la actualización (2026-11-19) son recientes; el ecosistema de herramientas en torno al endpoint `/v1/systemone` puede ser limitado.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/singularity-layer/Singularity-xMESH-0.8B-GGUF
- Modelo base (BF16): https://huggingface.co/singularity-layer/Singularity-xMESH-0.8B
- Artículo de lanzamiento: https://www.x402layer.cc/blog/singularity-xmesh-0-8b
- Sitio de Singularity Layer: https://www.x402layer.cc
- Archivo Q8_0: https://huggingface.co/singularity-layer/Singularity-xMESH-0.8B-GGUF/blob/main/Singularity-xMESH-0.8B-Q8_0.gguf
- Archivo Q6_K: https://huggingface.co/singularity-layer/Singularity-xMESH-0.8B-GGUF/blob/main/Singularity-xMESH-0.8B-Q6_K.gguf
- Archivo Q5_K_M: https://huggingface.co/singularity-layer/Singularity-xMESH-0.8B-GGUF/blob/main/Singularity-xMESH-0.8B-Q5_K_M.gguf
- Archivo Q4_K_M: https://huggingface.co/singularity-layer/Singularity-xMESH-0.8B-GGUF/blob/main/Singularity-xMESH-0.8B-Q4_K_M.gguf
- Archivo IQ4_XS: https://huggingface.co/singularity-layer/Singularity-xMESH-0.8B-GGUF/blob/main/Singularity-xMESH-0.8B-IQ4_XS.gguf
