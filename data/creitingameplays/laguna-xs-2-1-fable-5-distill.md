# CreitinGameplays/Laguna-XS-2.1-Fable-5-Distill

## Resumen

Laguna-XS-2.1-Fable-5-Distill es un modelo de lenguaje fine-tuneado por el usuario CreitinGameplays a partir de poolside/Laguna-XS-2.1, un modelo de arquitectura Mixture-of-Experts (MoE) de 33 442 millones de parámetros totales con 3 000 millones de parámetros activos por token, desarrollado originalmente por poolside para tareas de codificación agéntica y trabajo de larga duración en máquinas locales. Este fine-tune, denominado "Fable-5-Distill", se ha entrenado con la librería Unsloth y el TRL de Hugging Face, lo que indica un proceso de destilación o ajuste fino supervisado sobre el modelo base.

El modelo base Laguna XS 2.1 es una versión mejorada de Laguna XS.2, con un incremento del 5,4 % en SWE-bench Multilingual y un rendimiento más sólido en tareas de terminal. El fine-tune hereda estas capacidades, aunque no se han publicado métricas específicas para esta variante. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas, y su tamaño relativamente compacto (33B totales, 3B activos) lo hace adecuado para despliegue en hardware local con cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer |
| Parametros totales | 33 442 617 088 (33,4B) |
| Parametros activos | 3 000 000 000 (3B) por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors, sin GGUF publicado) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Laguna XS 2.1 emplea una arquitectura MoE con 33B parámetros totales y 3B activos por token, diseñada para maximizar la eficiencia en inferencia local. El fine-tune Fable-5-Distill se ha entrenado sobre este base utilizando Unsloth, que acelera el entrenamiento mediante kernels optimizados, y la librería TRL de Hugging Face para el ajuste fino. No se especifican los datos de entrenamiento, el número de tokens ni si se aplicaron técnicas como RLHF o DPO; el nombre "Distill" sugiere un proceso de destilación desde un modelo más grande (posiblemente Fable-5), pero no hay detalles públicos al respecto. El modelo base fue preentrenado desde cero en la "Model Factory" de poolside y posteriormente post-entrenado, con mejoras documentadas en tareas de terminal y SWE-bench Multilingual.

## Capacidades

- Generacion de texto y conversacion en ingles.
- Codificacion agéntica: capaz de manejar tareas de software engineering de larga duracion, como edicion de multiples archivos, ejecucion de comandos y razonamiento multi-paso.
- Soporte de tool calling y function calling (heredado del modelo base, aunque no se detalla en la model card).
- Razonamiento para tareas de terminal y lineas de comandos.
- Capacidades multilingues limitadas al ingles (segun la etiqueta de idioma).
- No se indica soporte de vision, audio ni modo thinking explicito.

## Casos de uso

- Asistente de codificacion en entornos locales: el modelo puede integrarse en IDEs o editores para sugerir fragmentos de codigo, refactorizar y explicar APIs, aprovechando su arquitectura MoE con 3B activos que reduce la latencia en hardware modesto.
- Agente de automatizacion de tareas de terminal: gracias a su rendimiento mejorado en tareas de terminal, puede ejecutar comandos, interpretar salidas y tomar decisiones secuenciales en scripts de automatizacion.
- Generacion de codigo en pipelines de CI/CD: con soporte de tool calling, puede generar parches, revisar diffs y proponer correcciones en repositorios, aunque requiere integracion con un orquestador externo.
- Chatbot tecnico de soporte: para documentacion interna o atencion al desarrollador, el modelo puede responder preguntas sobre APIs, depuracion y mejores practicas, con licencia Apache 2.0 que permite uso comercial.
- Educacion y formacion en programacion: como tutor interactivo que explica conceptos, genera ejemplos y evalua soluciones, dado su enfoque en codigo y razonamiento.
- Prototipado rapido de agentes conversacionales: al ser un fine-tune ligero (3B activos), puede desplegarse en una GPU consumer para experimentar con flujos agénticos sin costes elevados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para el fine-tune Laguna-XS-2.1-Fable-5-Distill. El modelo base poolside/Laguna-XS-2.1 reporta una mejora del +5,4 % en SWE-bench Multilingual respecto a su predecesor XS.2, asi como un rendimiento superior en tareas de terminal, pero no se proporcionan cifras absolutas en la informacion disponible. Se recomienda consultar el informe tecnico de poolside para datos detallados.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan 66,9 GB (probablemente en fp16/bf16), por lo que se necesitan al menos 70 GB de VRAM para cargar el modelo sin cuantizar. Con cuantizacion de 4 bits (no publicada oficialmente), se estima un uso de ~20-25 GB, lo que permitiria ejecutarlo en GPUs consumer de gama alta.
- GPU recomendadas: para uso sin cuantizar, A100 80GB, H100 80GB o RTX A6000 48GB (con cuantizacion). Para cuantizacion 4 bits, RTX 3090/4090 (24 GB) o RTX 4080 (16 GB) podrian ser suficientes, aunque no hay garantias oficiales.
- Opciones de despliegue: al ser un modelo transformers, es compatible con vLLM, TGI (text-generation-inference), llama.cpp (si se convierte a GGUF) y Ollama (mediante conversion). No se incluyen archivos GGUF en el repo.
- Latencia y throughput: no disponibles. Dado que solo se activan 3B parametros por token, la latencia por token deberia ser significativamente menor que la de un modelo denso de 33B, pero no hay mediciones publicas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Laguna-XS-2.1-Fable-5-Distill | 33,4B | 3B | no disponible | Apache 2.0 | Codificacion agéntica |
| poolside/Laguna-XS-2.1 (base) | 33,4B | 3B | no disponible | Apache 2.0 | Codificacion agéntica |
| Mixtral 8x7B (referencia) | 46,7B | 12,9B | 32k | Apache 2.0 | Generacion general y codigo |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada. La comparativa se limita a parametros y licencia; para una evaluacion real seria necesario ejecutar benchmarks propios.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un fine-tune sin informacion sobre el dataset de entrenamiento, no se pueden descartar sesgos heredados del modelo base ni alucinaciones en codigo o respuestas factuales.
- Idioma: solo soporta ingles de forma nativa; el uso en otros idiomas puede degradar la calidad.
- Contexto: la longitud de contexto no esta documentada; se recomienda asumir un valor conservador (por ejemplo, 8k-16k) hasta que se confirme.
- Produccion: no hay garantias de estabilidad ni soporte oficial; el modelo es un experimento de un usuario individual, no un lanzamiento de poolside.
- Cuantizacion: no se ofrecen archivos GGUF ni AWQ; el despliegue en hardware consumer requiere conversion manual, lo que puede introducir perdidas de precision.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base tiene su propia licencia (tambien Apache 2.0 segun la model card), por lo que no hay restricciones adicionales conocidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CreitinGameplays/Laguna-XS-2.1-Fable-5-Distill
- Modelo base poolside/Laguna-XS-2.1: https://huggingface.co/poolside/Laguna-XS-2.1
- Blog de poolside sobre Laguna XS 2.1: https://poolside.ai/blog/introducing-laguna-xs-2-1
- Blog de poolside sobre Laguna XS.2 y M.1: https://poolside.ai/blog/introducing-laguna-xs2-m1
- Pagina del modelo en NVIDIA NIM: https://build.nvidia.com/poolside/laguna-xs-2.1/modelcard
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
