# sca255/serenity26ba4b_requant

## Resumen

`sca255/serenity26ba4b_requant` es una requantización con matriz de importancia (imatrix) del modelo `ReadyArt/Serenity-26B-A4B-GGUF`, publicada por el usuario sca255 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una redistribución de pesos ya cuantizados, recuantizados con llama.cpp empleando datos de calibración estadística para reducir la pérdida de calidad respecto a una cuantización uniforme.

El modelo subyacente es un MoE (mixture of experts) de aproximadamente 26 mil millones de parámetros totales (25.233.142.046 según los safetensors reportados) con unos 4 mil millones de parámetros activos por token, a juzgar por la nomenclatura «A4B» del nombre. Esa relación entre parámetros totales y activos lo sitúa en la categoría de MoE disperso eficiente en cómputo, adecuado para inferencia en hardware de gama alta de consumo si se emplean cuantizaciones agresivas.

La relevancia de esta ficha es práctica: el repositorio ofrece únicamente dos ficheros GGUF (IQ3_M e IQ4_XS) más el fichero de calibración imatrix, lo que permite desplegar el modelo en llama.cpp con un consumo de VRAM moderado. La información pública disponible es muy escasa: no hay model card descriptiva del entrenamiento, ni benchmarks, ni licencia declarada, ni idiomas especificados, por lo que buena parte de los apartados siguientes se limita a lo verificable en los metadatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) tipo transformer; detalles de capas y atención no disponibles |
| Parametros totales | 25.233.142.046 (≈25,2 B) |
| Parametros activos | ≈4 B (inferido de la nomenclatura «A4B»; no confirmado en documentación) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ3_M e IQ4_XS (GGUF), generadas con imatrix |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); fichero auxiliar `.imat.dat` de calibración |
| Tamano del repo | 24,1 GB |
| Modelo base | ReadyArt/Serenity-26B-A4B-GGUF |
| Descargas / likes | 60 / 0 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base: no se especifican número de capas, dimensión oculta, número de expertos, tipo de atención ni estrategia de enrutamiento. Lo único deducible es que se trata de un transformer con mezcla de expertos, dado el tag `moe` y la convención de nombres «26B-A4B», que en la práctica habitual indica 26 mil millones de parámetros totales y 4 mil millones activos.

Tampoco hay datos sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset ni si se aplicaron fases de alineación como RLHF o DPO. El autor de esta publicación (sca255) no ha entrenado el modelo: su aportación es la requantización. El proceso consiste en ejecutar la cuantización de llama.cpp con una matriz de importancia generada a partir de datos de calibración (`serenity26b.imat.dat`), de modo que los pesos con mayor impacto en la salida conservan más bits efectivos y los menos relevantes se comprimen más. Esto suele traducirse en una perplejidad menor que la de una cuantización estándar del mismo tamaño nominal, especialmente en modelos MoE donde la distribución de magnitudes entre expertos es heterogénea.

## Capacidades

- Generación de texto conversacional: el tag `conversational` sugiere un ajuste orientado a diálogo, aunque no se documenta el formato de prompt ni la plantilla de chat.
- Razonamiento y conocimiento general: presumible por el tamaño del modelo base, pero sin benchmarks que lo respalden en esta publicación.
- Capacidad multilingüe: no disponible; no se declaran idiomas.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Uso como agente o razonamiento multi-paso: no disponible.
- Modo de pensamiento explícito (thinking), visión o audio: no disponible.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que el repositorio puede servirse mediante la infraestructura de inference endpoints de Hugging Face.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: los GGUF IQ3_M e IQ4_XS permiten ejecutar un MoE de 25 B totales con solo ~4 B activos por token, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamaño y hace viable la inferencia en GPUs con 12-24 GB de VRAM.
- Prototipado de asistentes conversacionales: al estar etiquetado como `conversational`, sirve para construir chatbots de prueba en llama.cpp u Ollama antes de comprometerse con un modelo mayor o con licencia comercial clara.
- Evaluación comparativa de técnicas de cuantización: el repositorio incluye el fichero imatrix y dos niveles de cuantización, lo que permite medir empíricamente la degradación de perplejidad entre IQ3_M e IQ4_XS sobre el mismo modelo base.
- Inferencia en entornos con memoria limitada: IQ3_M reduce el peso en disco y VRAM respecto a IQ4_XS, útil en portátiles con GPU de 8-12 GB o en servidores sin aceleradores de gran capacidad.
- Experimentación en investigación sobre MoE: al ser un MoE disperso, permite estudiar el comportamiento de expertos y el efecto de la cuantización selectiva en modelos con enrutamiento.
- Integración en pipelines de generación de texto por lotes: mediante llama.cpp server o bindings de Python, para tareas de resumen, clasificación o extracción sobre volúmenes moderados de documentos, siempre que se valide la calidad con datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: IQ3_M en torno a 11-12 GB de pesos; IQ4_XS en torno a 14-15 GB. El tamaño exacto por fichero no se detalla en la información disponible, aunque el repo completo ocupa 24,1 GB incluyendo ambas cuantizaciones y el fichero imatrix.
- GPU recomendadas: RTX 4090 (24 GB) para IQ4_XS con contexto amplio; RTX 4080/4070 Ti Super (16 GB) para IQ3_M; A100 o H100 si se requiere servir a múltiples usuarios con vLLM (aunque vLLM no consume GGUF de forma nativa, requiere conversión).
- GPU de consumo: sí, cabe en GPUs de 12 GB con IQ3_M y contexto moderado; en 16-24 GB con IQ4_XS.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), Ollama (importando el GGUF), LM Studio, y cualquier runtime compatible con GGUF. Para TGI o vLLM sería necesario convertir a safetensors, lo que anula la ventaja de esta publicación.
- Latencia y throughput: no disponibles. Al ser un MoE con ~4 B activos, el throughput por token debería aproximarse al de un modelo denso de 4 B, pero no hay mediciones publicadas en esta ficha.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de alternativas medidas en las mismas condiciones, por lo que la comparación se limita a características estructurales.

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| serenity26ba4b_requant (esta ficha) | ≈25,2 B | ≈4 B (inferido) | no disponible | no disponible | GGUF |
| ReadyArt/Serenity-26B-A4B-GGUF (base) | ≈26 B | ≈4 B | no disponible | no disponible | GGUF |
| Alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se identifican en la información proporcionada modelos comparables con datos verificables de parámetros, contexto y licencia.

## Limitaciones y advertencias

- Licencia no declarada: no es posible determinar si se permite uso comercial. Cualquier despliegue en producción requiere contactar con el autor del modelo base o asumir el riesgo legal.
- Trazabilidad incompleta: esta publicación es una requantización de un GGUF ya cuantizado, no del modelo original en safetensors. La recuantización de un GGUF puede acumular error respecto al modelo original, y no se documenta el pipeline exacto.
- Ausencia de benchmarks: no hay métricas de perplejidad, MMLU ni tareas específicas que permitan estimar la degradación introducida por IQ3_M o IQ4_XS.
- Idiomas desconocidos: sin declaración de idiomas, no se puede garantizar calidad en castellano ni en otras lenguas distintas del inglés.
- Riesgo de alucinación: inherente a los modelos generativos; sin evaluación específica no puede cuantificarse.
- Sesgos: no documentados; al desconocerse el corpus de entrenamiento, no es posible evaluar sesgos de género, raza o ideología.
- Formato de chat no especificado: el tag `conversational` no va acompañado de plantilla de prompt, lo que puede degradar la calidad si se usa el formato incorrecto.
- Popularidad muy baja (60 descargas, 0 likes): no hay validación comunitaria ni informes de terceros sobre su comportamiento.
- Fecha de creación futura en los metadatos (2026-08-28): conviene verificar la integridad de los ficheros antes de usarlos en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sca255/serenity26ba4b_requant
- Modelo base: https://huggingface.co/ReadyArt/Serenity-26B-A4B-GGUF
- llama.cpp (runtime compatible con GGUF): https://github.com/ggml-org/llama.cpp
- Documentación de cuantización con imatrix en llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md
