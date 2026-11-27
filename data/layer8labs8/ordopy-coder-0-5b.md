# layer8labs8/OrdoPy-Coder-0.5B

## Resumen

OrdoPy-Coder-0.5B es un ajuste fino del modelo Qwen2.5-Coder-0.5B-Instruct orientado a la generacion de codigo en Python. Lo desarrolla el usuario layer8labs8 y se distribuye bajo licencia Apache 2.0. El modelo parte de la arquitectura Qwen2ForCausalLM con 494 millones de parametros y una ventana de contexto de 32K tokens, y su objetivo es mejorar la calidad del codigo generado mediante un proceso de rejection sampling sobre problemas de programacion con tests unitarios.

La receta de entrenamiento consiste en generar cuatro soluciones por problema sobre 2.000 problemas del dataset KodCode, ejecutarlas contra sus tests unitarios y conservar unicamente las que pasan (maximo dos por problema), con soluciones de referencia de GPT-4o como relleno en los casos no resueltos (limitado al 20% de los datos). Sobre ese conjunto de 1.106 ejemplos se entrena un adaptador LoRA (r=32 sobre todas las capas lineales) que despues se fusiona en los pesos finales.

La relevancia de esta ficha es doble: por un lado, es un ejemplo de pipeline de ajuste fino con verificacion ejecutable (rejection sampling) sobre un modelo pequeno; por otro, su model card incluye una autoevaluacion honesta que reconoce que la version 2 queda practicamente a la par del modelo base y corrige errores de medicion de la version 1. Es un modelo pequeno, ligero (unos 1 GB en float16) y pensado para entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (transformer decoder-only, 24 capas, hidden size 896) |
| Parametros totales | 494.032.768 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32K tokens |
| Tipos de cuantizacion | float16 en el repositorio; no se documentan otras cuantizaciones oficiales (GGUF, AWQ, GPTQ no disponibles) |
| Idiomas soportados | ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors en float16) + tokenizer ChatML de Qwen |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2, con 24 capas, dimension oculta de 896 y 494 millones de parametros, heredado directamente de Qwen2.5-Coder-0.5B-Instruct. No incorpora innovaciones arquitectonicas propias: el trabajo se centra en el ajuste fino. El entrenamiento usa LoRA con r=32 y alpha=64 aplicado a todas las capas lineales, learning rate de 1e-4, una epoca y perdida calculada solo sobre los tokens del asistente; el adaptador se fusiona posteriormente en los pesos.

El dataset se construye con rejection sampling: el modelo base genera cuatro soluciones por cada uno de 2.000 problemas de KodCode-V1-SFT-4o, cada solucion se ejecuta contra los tests unitarios del problema y solo se conservan las que pasan (hasta dos por problema). Los problemas sin solucion valida se rellenan con soluciones de referencia de GPT-4o, con un tope del 20% del total, resultando en 1.106 ejemplos de entrenamiento. La seleccion de la epoca se hizo sobre las particiones train y validation de MBPP, nunca sobre test. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generacion de codigo en Python, incluyendo funciones con firma y docstring especificados por el usuario.
- Generacion de texto general conversacional, heredada del modelo base instruct.
- Razonamiento basico sobre problemas de programacion con tests unitarios (formato de competicion y ejercicios estilo HumanEval/MBPP).
- Soporte de plantilla de chat ChatML de Qwen (roles user/assistant), adecuada para conversaciones multi-turno.
- Capacidad multilingue limitada: la model card declara solo ingles.
- No se documenta soporte explicito de tool calling, function calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Autocompletado de funciones Python en editores: el modelo puede generar funciones completas a partir de una firma y una descripcion, con un coste de inferencia muy bajo (aproximadamente 1 GB de VRAM en float16), lo que permite ejecutarlo en local junto al IDE.
- Generacion de tests unitarios: dado un fragmento de codigo, el modelo puede proponer casos de prueba; su entrenamiento con tests ejecutables lo hace razonablemente alineado con ese formato, aunque requiere revision humana.
- Prototipado rapido de scripts de utilidades: tareas de transformacion de cadenas, parsing, manejo de ficheros o funciones de conveniencia donde la latencia y el coste importan mas que la precision absoluta.
- Ensenanza y ejercicios de programacion: al ser un modelo pequeno y con contexto de 32K, puede usarse en entornos educativos con recursos limitados para explicar o completar ejercicios, siempre con supervision.
- Filtrado y clasificacion de codigo en pipelines de CI: integrado como generador de parches candidatos que despues se validan con la suite de tests del proyecto, aprovechando la receta de rejection sampling con la que fue entrenado.
- Despliegue en dispositivos con GPU consumer: al caber en GPUs de gama baja y en CPU con cuantizacion (no oficial), sirve para demos, prototipos y entornos de desarrollo sin infraestructura dedicada.
- Base para nuevos ajustes finos: al ser Apache 2.0 y de tamano reducido, es un punto de partida economico para experimentar con LoRA y rejection sampling sobre dominios concretos.

## Benchmarks y rendimiento

Resultados publicados en la model card, evaluados con el harness oficial de EvalPlus en modo greedy pass@1, en la misma ejecucion sobre Kaggle 2x T4 en float16:

| Benchmark | Base, oficial | Base, misma ejecucion | v2 (este modelo) | v1 (version anterior) |
|---|---|---|---|---|
| HumanEval | 61.6 | 57.9 | 61.0 | 48.8 |
| HumanEval+ | 57.3 | 53.7 | 55.5 | 46.3 |
| MBPP | 52.4 | 52.1 | 51.1 | 48.4 |
| MBPP+ | 43.7 | 44.2 | 41.0 | 42.1 |
| Media | no disponible | 52.0 | 52.2 | 46.4 |

El autor senala que la version 2 mejora claramente a la version 1 (+5,8 puntos de media) pero queda practicamente a la par del modelo base: mejor en HumanEval y HumanEval+, peor en MBPP y MBPP+, con diferencias dentro del ruido entre ejecuciones (una sola semilla). No supera al modelo base en conjunto.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GB en float16 segun la model card; en cuantizaciones de 8 o 4 bits (no oficiales) seria inferior, aunque no se publican artefactos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en T4 (usada por el autor), RTX 3060, RTX 4060, RTX 4090, A100 y H100 sin problemas de memoria.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers (referencia oficial), text-generation-inference (etiqueta tgi en el repo), endpoints compatibles; llama.cpp y Ollama no tienen artefactos oficiales publicados, aunque seria posible convertirlos a GGUF.
- Latencia y throughput: no se publican mediciones. Por el tamano (494M) se espera una latencia baja en GPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OrdoPy-Coder-0.5B (este) | 494M | 32K | 61.0 (misma ejecucion) | Apache 2.0 | Hugging Face |
| Qwen2.5-Coder-0.5B-Instruct (base) | 494M | 32K | 57.9 (misma ejecucion) / 61.6 (oficial) | Apache 2.0 | Hugging Face |
| Qwen2.5-Coder-1.5B-Instruct | 1.5B | 32K | no disponible en la informacion | Apache 2.0 | Hugging Face |
| DeepSeek-Coder-1.3B-Instruct | 1.3B | 16K | no disponible en la informacion | Licencia propia | Hugging Face |

La comparativa con alternativas de mayor tamano no puede hacerse con datos de benchmarks verificados en la informacion disponible; se indica "no disponible" para no inventar cifras.

## Limitaciones y advertencias

- Rendimiento practicamente identico al modelo base: la mejora sobre Qwen2.5-Coder-0.5B-Instruct no es concluyente y podria estar dentro del ruido entre ejecuciones.
- La version 1 del repositorio (etiqueta `v1`) tiene peor rendimiento que el modelo base en los cuatro benchmarks y su model card original contenia un error de medicion reconocido por el autor; no debe usarse como referencia.
- Modelo pequeno: capacidad limitada para tareas de razonamiento complejo, refactorizaciones amplias o proyectos con muchas dependencias.
- Solo declara soporte de ingles; el rendimiento en castellano no esta evaluado.
- Riesgo de alucinacion de APIs, librerias o firmas de funciones, especialmente en codigo que el modelo no ha visto; se recomienda validacion con tests.
- Sesgos: no se documenta una evaluacion de sesgos; al heredar del modelo base, arrastra los sesgos de sus datos de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-Coder-0.5B-Instruct tambien es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- No hay artefactos cuantizados oficiales ni benchmarks de latencia/throughput publicados.
- La fecha de creacion del repositorio (2026-11-15) y la referencia a GPT-4o en el dataset conviene verificarlas antes de citar el modelo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/layer8labs8/OrdoPy-Coder-0.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
- Dataset KodCode-V1-SFT-4o: https://huggingface.co/datasets/KodCode/KodCode-V1-SFT-4o
- Repositorio de entrenamiento OrdoTrain: https://github.com/layer8labs8/OrdoTrain
- Harness EvalPlus: https://github.com/evalplus/evalplus
- Paper de Qwen2.5-Coder: https://arxiv.org/abs/2409.12186
