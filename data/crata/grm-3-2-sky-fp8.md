# Crata/GRM-3.2-Sky-FP8

## Resumen

GRM-3.2-Sky-FP8 es una version cuantizada en FP8 del modelo GRM-3.2-Sky, desarrollada por Crata a partir del modelo base OrionLLM/GRM-3.2-Sky. Este modelo base es un sistema de 35 mil millones de parametros con arquitectura Mixture-of-Experts (MoE) que activa aproximadamente 3 mil millones de parametros por inferencia, disenado especificamente para tareas agénticas de horizonte largo y razonamiento complejo en codificacion, matematicas, logica, planificacion, uso de herramientas y autocorreccion. La cuantizacion FP8 reduce el tamaño del modelo de aproximadamente 70 GB en BF16 a 36.7 GB, lo que permite su ejecucion en hardware mas accesible sin sacrificar significativamente la calidad.

La relevancia de este modelo radica en su capacidad para abordar problemas de razonamiento profundo y tareas agénticas multi-paso, un area de creciente interes en la comunidad de IA open source. Al estar cuantizado en FP8, se posiciona como una opcion practica para despliegues en produccion con vLLM, manteniendo la licencia Apache 2.0 que permite uso comercial sin restricciones significativas. El modelo se publica con formato de pesos safetensors y esta optimizado para el pipeline image-text-to-text, aunque su foco principal es el procesamiento de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en Ornith-1.0-35B |
| Parametros totales | 34.692.735.488 |
| Parametros activos | ~3.000.000.000 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (float8_e4m3fn) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base GRM-3.2-Sky emplea la arquitectura Ornith-1.0-35B, un diseño MoE con 35 mil millones de parametros totales y aproximadamente 3 mil millones de parametros activos por token procesado. Esta arquitectura permite un equilibrio entre capacidad y eficiencia computacional, activando solo una fraccion de los expertos disponibles en cada paso de inferencia. La cuantizacion FP8 aplicada por Crata reduce la precision de los pesos de 16 bits a 8 bits, disminuyendo los requisitos de memoria y acelerando la inferencia en hardware compatible.

Los detalles especificos sobre el entrenamiento del modelo base, como el numero de tokens procesados, la composicion del dataset o el uso de tecnicas de RLHF o DPO, no estan disponibles en la informacion proporcionada. La cuantizacion FP8 se realiza mediante la tecnica weight-only quantization, que mantiene las activaciones en mayor precision mientras comprime los pesos, minimizando la perdida de calidad. El modelo esta optimizado para su uso con vLLM, que soporta nativamente la ejecucion de modelos cuantizados en FP8.

## Capacidades

- Razonamiento complejo en matematicas, logica y planificacion, disenado para problemas que requieren multiples pasos de deduccion.
- Generacion de codigo y soporte para tareas de programacion, incluyendo depuracion y autocorreccion.
- Uso de herramientas y function calling, lo que permite integrarse en flujos de trabajo agénticos.
- Razonamiento multi-paso y planificacion de tareas de horizonte largo, orientado a agentes autonomos.
- Capacidad de autocorreccion, identificando y corrigiendo errores en sus propias respuestas.
- Pipeline image-text-to-text declarado, aunque no se especifican capacidades concretas de vision en la informacion disponible.

## Casos de uso

- Agentes autonomos de codificacion: el modelo puede gestionar tareas de desarrollo de software de multiples pasos, desde la generacion inicial de codigo hasta la depuracion y refactorizacion, gracias a su capacidad de razonamiento prolongado y autocorreccion.
- Automatizacion de razonamiento logico y matematico: adecuado para sistemas que requieren resolver problemas complejos paso a paso, como asistentes de investigacion o plataformas educativas avanzadas.
- Planificacion de tareas y gestion de proyectos: su capacidad para razonar sobre secuencias largas de acciones lo hace util en sistemas de planificacion automatica y orquestacion de workflows.
- Integracion en pipelines de CI/CD: con soporte para tool calling, puede ejecutar comandos, analizar resultados y adaptar el codigo generado en entornos de integracion continua.
- Asistentes de soporte tecnico con razonamiento avanzado: puede diagnosticar problemas tecnicos complejos siguiendo cadenas de razonamiento largas y proponer soluciones fundamentadas.
- Investigacion y analisis de datos: su capacidad para manejar tareas de razonamiento extenso permite su uso en sistemas de analisis automatizado que requieren interpretar resultados y planificar experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 35 GB para el modelo FP8 completo, mas overhead de activaciones y memoria de contexto.
- GPU recomendadas: NVIDIA H100, A100 80GB, o GPUs consumer de 48GB como la RTX 6000 Ada. Con cuantizacion adicional o offloading, podria ejecutarse en GPUs de 24GB como la RTX 4090.
- Si cabe en consumer GPU: marginalmente, en GPUs de 24GB con tecnicas de offloading o cuantizacion adicional, aunque no es el escenario ideal.
- Opciones de despliegue: vLLM (soporte nativo de FP8), TensorRT-LLM, y potencialmente llama.cpp si se convierte a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada, aunque la cuantizacion FP8 deberia ofrecer mejoras de throughput respecto al BF16 en hardware compatible.

## Comparativa con modelos similares

La comparativa se basa en el modelo base GRM-3.2-Sky, ya que la version FP8 mantiene las mismas caracteristicas arquitectonicas:

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GRM-3.2-Sky (FP8) | 34.7B | ~3B | no disponible | Apache 2.0 | HuggingFace |
| Qwen3-30B-A3B | 30.5B | 3.3B | 32K | Apache 2.0 | HuggingFace |
| DeepSeek-V3-Lite | 16B | 2.4B | 128K | MIT | HuggingFace |

La comparativa se basa en modelos MoE de tamaño similar con parametros activos comparables. GRM-3.2-Sky se diferencia por su enfoque especifico en tareas agénticas de largo horizonte, mientras que las alternativas tienen fortalezas en otros dominios. Los datos de contexto y benchmarks comparativos no estan disponibles para una evaluacion completa.

## Limitaciones y advertencias

- La cuantizacion FP8 puede introducir una ligera degradacion en la calidad de las respuestas respecto al modelo BF16 original, especialmente en tareas de alta precision numerica.
- No se dispone de informacion sobre los idiomas soportados, lo que limita la certeza sobre su rendimiento en español u otros idiomas distintos del ingles.
- La longitud de contexto no esta documentada, por lo que no se puede garantizar su comportamiento en tareas que requieran ventanas de contexto muy largas.
- El modelo esta optimizado para vLLM; su uso con otros frameworks puede requerir conversion de formato y podria no mantener el mismo rendimiento.
- Al ser una cuantizacion reciente (creado en agosto de 2026), el ecosistema de herramientas y la comunidad alrededor del modelo son limitados.
- No se han publicado evaluaciones independientes de sesgos o riesgos de alucinacion para este modelo especifico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Crata/GRM-3.2-Sky-FP8
- Modelo base GRM-3.2-Sky: https://huggingface.co/OrionLLM/GRM-3.2-Sky
- Ficha del modelo en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/grm-3.2-sky-orionllm
