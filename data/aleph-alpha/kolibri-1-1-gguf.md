# Aleph-Alpha/Kolibri-1.1-GGUF

## Resumen

Kolibri 1.1 GGUF es la distribucion en formato GGUF de Kolibri 1.1, un modelo de razonamiento de tipo mixture-of-experts (MoE) desarrollado por Aleph Alpha para aleman e ingles. El modelo base cuenta con 75.112.665.344 parametros totales y esta pensado para generacion de texto conversacional y tareas de razonamiento, con una licencia permisiva Apache 2.0 que facilita su adopcion tanto en investigacion como en producto comercial.

Esta variante GGUF esta preparada especificamente para su uso con llama.cpp, lo que permite ejecutar el modelo en hardware local mediante cuantizacion. El repositorio incluye multiples niveles de cuantizacion (Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0, IQ4_XS, Q3_K_M y variantes GSQ-RCO de 2.25, 2.00 y 1.75 bpw), con tablas de degradacion de calidad respecto al modelo original, lo que permite ajustar el equilibrio entre VRAM ocupada y fidelidad de resultados.

Su relevancia actual radica en que ofrece un modelo de gran tamano con licencia Apache 2.0, orientado explicitamente a aleman e ingles, y con cuantizaciones optimizadas para despliegue local. No obstante, el soporte en llama.cpp depende de la fusion del PR ggml-org/llama.cpp#32891, por lo que hasta entonces es necesario compilar desde esa rama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE), transformer para generacion de texto |
| Parametros totales | 75.112.665.344 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0, IQ4_XS, Q3_K_M, GSQ-RCO 2.25 bpw, GSQ-RCO 2.00 bpw, GSQ-RCO 1.75 bpw |
| Idiomas soportados | aleman (de), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con imatrix); modelo base en safetensors |

## Arquitectura y entrenamiento

Kolibri 1.1 es un modelo de arquitectura mixture-of-experts (MoE) orientado a razonamiento y generacion de texto conversacional. La model card de esta variante GGUF no detalla el numero de expertos, la proporcion de parametros activos por token ni la composicion del dataset de entrenamiento; esa informacion se remite al modelo base Aleph-Alpha/Kolibri-1.1. El dato disponible confirma un total de 75.112.665.344 parametros.

Las cuantizaciones incluidas emplean tecnicas de cuantizacion con matriz de importancia (imatrix) y variantes GSQ-RCO en regimenes de baja precision (1.75 a 2.25 bits por peso), pensadas para reducir el espacio en memoria manteniendo la calidad. La model card publica graficas y una tabla de variacion de la metrica "Overall" (en ingles y aleman) frente al modelo sin cuantizar para cada nivel, lo que permite estimar la perdida de calidad asociada a cada tamano.

## Capacidades

- Generacion de texto conversacional en aleman e ingles.
- Razonamiento de tipo reasoning, segun la descripcion del modelo base como "reasoning model".
- Ejecucion local mediante llama.cpp con cuantizacion GGUF.
- Compatibilidad con endpoints (tag endpoints_compatible).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas a aleman e ingles segun los metadatos.

## Casos de uso

- Despliegue local de un modelo de razonamiento en aleman: usar Q4_K_M o Q5_K_M en llama.cpp para asistentes internos que operen exclusivamente en aleman, aprovechando que el modelo esta entrenado para ese idioma y su licencia Apache 2.0 permite uso comercial.
- Generacion de texto en ingles para prototipos: emplear Q8_0 cuando se disponga de VRAM suficiente para preservar la calidad casi intacta (variacion de -0.3 en la metrica Overall frente al modelo sin cuantizar).
- Entornos con VRAM limitada: recurrir a IQ4_XS o Q3_K_M para ajustar el modelo a GPUs de gama alta de consumo, asumiendo una degradacion de -0.4 y -1.2 puntos respectivamente en la metrica Overall.
- Escenarios de memoria muy restringida: usar las variantes GSQ-RCO de 2.25, 2.00 o 1.75 bpw, que reducen drasticamente el espacio ocupado a costa de una perdida de -2.6 puntos (2.25 bpw) o mayor en calidad.
- Investigacion sobre cuantizacion: comparar la degradacion de calidad entre niveles GGUF estandar y GSQ-RCO usando las tablas publicadas, para estudiar el equilibrio precision-memoria en modelos MoE de gran tamano.
- Integracion en pipelines de generacion de texto autoalojados: servir el modelo con llama-server y los parametros recomendados (temp 1.0, top-p 0.99, top-k 128) para tareas de generacion conversacional en ingles y aleman sin dependencia de APIs externas.

## Benchmarks y rendimiento

La model card proporciona la metrica agregada "Overall" del modelo sin cuantizar y la variacion de cada cuantizacion respecto a ella. No se detallan los benchmarks individuales que componen esa metrica.

| Evaluacion | Kolibri 1.1 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M | Q4_0 | IQ4_XS | Q3_K_M | GSQ-RCO 2.25 bpw | GSQ-RCO 2.00 bpw | GSQ-RCO 1.75 bpw |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Overall | 73.2 | -0.3 | +0.3 | +0.1 | -0.7 | -0.2 | -0.4 | -1.2 | -2.6 | no disponible | no disponible |

Los valores de las columnas Q8_0 a Q3_K_M y GSQ-RCO 2.25 bpw son variaciones respecto a la linea base de 73.2. Los datos de GSQ-RCO 2.00 y 1.75 bpw no aparecen completos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; depende de la cuantizacion elegida. El repositorio completo ocupa 416,3 GB, lo que refleja el conjunto de todas las cuantizaciones, no una sola.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Modelo de 75.112 millones de parametros totales: incluso en cuantizaciones de 4 bits el peso ocupa decenas de GB, por lo que no es apto para GPUs de consumo con menos de 24 GB salvo en las cuantizaciones mas agresivas (GSQ-RCO de baja precision).
- Opciones de despliegue: llama.cpp (llama-server), con la advertencia de que requiere compilar desde el PR ggml-org/llama.cpp#32891 hasta su fusion.
- La model card desaconseja explicitamente la ejecucion solo en CPU.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada. Como referencia estructural, el modelo base Aleph-Alpha/Kolibri-1.1 (safetensors, sin cuantizar) es la alternativa directa para maxima fidelidad, mientras que esta variante GGUF prioriza el despliegue local. No se dispone de comparaciones con otros modelos MoE de tamano similar.

| Modelo | Parametros totales | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Kolibri 1.1 GGUF | 75.112.665.344 | no disponible | Apache 2.0 | GGUF |
| Kolibri 1.1 (base) | 75.112.665.344 | no disponible | Apache 2.0 | safetensors |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idiomas limitados a aleman e ingles; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Riesgo de alucinacion inherente a los modelos de generacion de texto; no se documentan mitigaciones especificas en esta variante.
- La cuantizacion introduce degradacion de calidad medible: hasta -2.6 puntos en la metrica Overall para GSQ-RCO 2.25 bpw y -1.2 para Q3_K_M.
- La model card desaconseja el uso solo en CPU, lo que limita el despliegue a entornos con GPU o memoria unificada.
- llama.cpp no puede cargar el modelo hasta que se fusione el PR ggml-org/llama.cpp#32891; hasta entonces hay que compilar desde esa rama, lo que anade complejidad operativa.
- No se detallan sesgos conocidos ni restricciones adicionales de uso comercial mas alla de la licencia Apache 2.0.
- No se dispone de informacion sobre contexto maximo, parametros activos ni composicion del entrenamiento en esta ficha.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Aleph-Alpha/Kolibri-1.1-GGUF
- Modelo base: https://huggingface.co/Aleph-Alpha/Kolibri-1.1
- Blog de Aleph Alpha: https://aleph-alpha.com/en/blog/kolibri-1-1/
- PR de llama.cpp: https://github.com/ggml-org/llama.cpp/pull/32891
