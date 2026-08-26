# Sho278/ornith-1.5-35b-q4-k-m-mirror

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por Ornith AI, diseñado específicamente para tareas de codificacion y agentes. Forma parte de la familia Ornith-1.5, que se construye sobre los modelos Qwen3.5 y Gemma4 mediante continued pretraining, mid-training y post-training. La innovacion principal de Ornith-1.5 es su bucle de auto-mejora de extremo a extremo: el propio modelo genera nuevas tareas de entrenamiento, construye scaffolds especificos para cada tarea y produce rollouts de soluciones, que luego se utilizan para mejorar la politica mediante aprendizaje por refuerzo.

Con 35.505 millones de parametros totales y solo unos 3.000 millones activos por token, este modelo consigue un rendimiento notable en benchmarks de codificacion y agentes, superando a modelos densos de tamano similar como Gemma 4-31B y Muse Glimmer-30B, y a su competidor directo Qwen 3.6-35B-A3B. Su licencia MIT permite uso comercial sin restricciones, lo que lo convierte en una opcion atractiva para integracion en entornos de produccion.

El modelo se distribuye en formato safetensors y GGUF (este ultimo a traves de mirrors como el que se documenta aqui), lo que facilita su despliegue tanto en infraestructuras de alto rendimiento como en equipos de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) |
| Parametros totales | 35.505.251.456 |
| Parametros activos | ~3.000 millones (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (mirror); otras no disponibles |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

Ornith-1.5-35B-A3B es un modelo MoE que activa aproximadamente 3.000 millones de parametros por token, lo que permite un rendimiento computacional eficiente manteniendo una capacidad total de 35.000 millones. La arquitectura se basa en los modelos Qwen3.5 y Gemma4, sobre los cuales se aplicaron fases de continued pretraining, mid-training y post-training. La caracteristica mas distintiva es el bucle de auto-mejora: el modelo propone nuevas tareas, genera scaffolds especificos para cada tarea y produce rollouts de soluciones, que se utilizan como datos de entrenamiento para el aprendizaje por refuerzo. Este proceso continuo de generacion de tareas y soluciones permite al modelo mejorar de forma autonoma sin depender de un conjunto fijo de tareas curadas por humanos.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni las tecnicas de RLHF/DPO empleadas. La model card menciona que el entrenamiento incluye optimizacion conjunta de generacion de tareas, construccion de scaffolds y rollouts, pero no proporciona cifras concretas.

## Capacidades

- Generacion de texto y codigo de alta calidad, con especial enfasis en tareas de programacion.
- Razonamiento agente: capaz de resolver problemas complejos que requieren multiples pasos y uso de herramientas de terminal.
- Ejecucion de tareas de codificacion en entornos reales, como la resolucion de issues en repositorios (SWE-bench).
- Soporte para interacciones conversacionales y asistencia en desarrollo de software.
- Capacidad de auto-mejora: el modelo puede generar sus propias tareas y soluciones para entrenamiento, aunque esta capacidad es interna y no necesariamente expuesta al usuario final.
- Multilingue: no se ha especificado, por lo que se asume que el soporte de idiomas es limitado o no documentado.

## Casos de uso

- Asistente de programacion en IDE: el modelo puede integrarse en editores como VS Code para ofrecer autocompletado, explicaciones de codigo y refactorizacion, aprovechando su capacidad de razonamiento sobre contextos largos de codigo.
- Automatizacion de tareas de terminal: gracias a su rendimiento en Terminal-Bench, puede ejecutar comandos, interpretar salidas y resolver problemas de administracion de sistemas de forma autonoma.
- Resolucion de issues en repositorios: con un 79% en SWE-bench Verified, es adecuado para integrarse en pipelines de CI/CD que detecten y corrijan bugs de forma automatica.
- Agente de desarrollo de software: puede actuar como un agente que planifica, escribe y prueba codigo en multiples archivos, coordinando cambios en un proyecto completo.
- Generacion de tests unitarios: el modelo puede crear casos de prueba a partir de especificaciones o codigo existente, mejorando la cobertura y calidad del software.
- Chatbot tecnico de soporte: su capacidad de razonamiento y generacion de codigo permite responder consultas tecnicas de desarrolladores, ofreciendo ejemplos y soluciones concretas.
- Educacion en programacion: puede generar explicaciones paso a paso, ejemplos de codigo y ejercicios personalizados para estudiantes.

## Benchmarks y rendimiento

La model card del autor proporciona los siguientes resultados comparativos:

| Benchmark | Ornith-1.5-35B-A3B | Ornith-1.0-35B-A3B | Qwen3.6-35B-A3B | Gemma-4-31B | Muse-Glimmer-30B | Qwen3.5-397B |
|---|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 67.8 | 64.2 | 52.5 | 42.1 | 51.7 | 53.5 |
| Terminal-Bench 2.1 (Claude Code) | 68.5 | 62.8 | 49.2 | - | - | 48.6 |
| SWE-bench Verified | 79 | 75.6 | 73.4 | 52 | 76 | 76.4 |

No se han publicado resultados de benchmarks generales como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion GGUF Q4_K_M, el modelo ocupa aproximadamente 17-18 GB, por lo que cabe en GPUs de 24 GB como la RTX 4090 o la A10G. Para cuantizaciones de mayor precision (FP16/BF16), se necesitarian al menos 70 GB de VRAM.
- GPUs recomendadas: RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) para despliegues de alto rendimiento.
- En consumer GPU: si, con cuantizacion Q4_K_M en una RTX 4090 o similar.
- Opciones de despliegue: al estar disponible en GGUF, puede ejecutarse con llama.cpp, Ollama, LM Studio y otros motores compatibles. Para despliegue en produccion, se puede usar vLLM o TGI con los pesos safetensors.
- Latencia y throughput: no se han publicado datos especificos. Al ser un MoE con solo 3B parametros activos, la latencia por token deberia ser significativamente menor que la de un modelo denso de 35B, aunque depende del hardware y del motor de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | SWE-bench Verified | Terminal-Bench 2.1 (Terminus-2) |
|---|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B | 35.5B | ~3B | no disponible | MIT | 79 | 67.8 |
| Qwen3.6-35B-A3B | 35B | ~3B | no disponible | Apache 2.0 | 73.4 | 52.5 |
| Gemma-4-31B | 31B | 31B (denso) | no disponible | Gemma License | 52 | 42.1 |
| Muse-Glimmer-30B | 30B | 30B (denso) | no disponible | no disponible | 76 | 51.7 |

Ornith-1.5-35B-A3B supera a sus competidores directos en los benchmarks de codificacion y agentes, especialmente en tareas de terminal y resolucion de issues. Su licencia MIT es mas permisiva que la de Gemma (que tiene restricciones de uso) y comparable a la de Qwen.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos o alucinaciones especificas del modelo. Al estar entrenado principalmente para tareas de codificacion, puede tener un rendimiento inferior en dominios generales o creativos.
- La longitud de contexto no ha sido publicada, por lo que se desconoce su capacidad para manejar documentos largos o conversaciones extensas.
- El soporte de idiomas no esta documentado; es probable que el modelo este optimizado para ingles y codigo, con capacidades limitadas en otros idiomas.
- Aunque la licencia MIT permite uso comercial, el modelo se basa en Qwen3.5 y Gemma4, cuyas licencias originales pueden imponer restricciones adicionales. Se recomienda revisar las licencias de los modelos base.
- El mirror GGUF documentado aqui (Sho278/ornith-1.5-35b-q4-k-m-mirror) tiene 0 descargas y 0 likes, lo que sugiere que no ha sido ampliamente probado por la comunidad. Se recomienda verificar la integridad de los pesos antes de su uso en produccion.
- No se han publicado datos sobre latencia, throughput ni requisitos de hardware especificos, por lo que las estimaciones proporcionadas son orientativas.

## Enlaces

- Mirror GGUF en HuggingFace: https://huggingface.co/Sho278/ornith-1.5-35b-q4-k-m-mirror
- Modelo original en HuggingFace: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Blog de Ornith sobre Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Sitio web de Ornith AI: https://ornith.ai/
- Guia de Ornith AI (modelos, VRAM, benchmarks): https://ornith.online/
