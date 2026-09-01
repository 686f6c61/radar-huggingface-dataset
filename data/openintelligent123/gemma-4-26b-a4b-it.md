# Openintelligent123/gemma-4-26B-A4B-it

## Resumen

Gemma 4 26B A4B es un modelo de lenguaje multimodal de codigo abierto desarrollado por Google DeepMind, y esta ficha cubre la variante instruida `Openintelligent123/gemma-4-26B-A4B-it`, un fine-tuning del modelo base `google/gemma-4-26B-A4B`. El modelo emplea una arquitectura de Mezcla de Expertos (MoE) con 25.2B parametros totales y solo 3.8B activos, lo que permite un rendimiento de nivel frontier con un coste computacional reducido en inferencia. Forma parte de la familia Gemma 4, lanzada el 31 de marzo de 2026, que incluye cinco tamanos (E2B, E4B, 12B, 26B A4B y 31B) y esta disenada para tareas de razonamiento, codificacion, agentes autonomos y comprension multimodal.

El modelo procesa entradas de texto e imagen, con una ventana de contexto de hasta 256K tokens y soporte multilingue en mas de 140 idiomas. Su arquitectura hibrida de atencion combina ventanas deslizantes locales con atencion global, e incorpora innovaciones como Keys y Values unificados en capas globales y RoPE proporcional (p-RoPE) para optimizar la memoria en contextos largos. La licencia Apache 2.0 permite uso comercial sin restricciones significativas, lo que lo convierte en una opcion atractiva para despliegues en produccion.

La relevancia de este modelo radica en su equilibrio entre capacidad y eficiencia: al activar solo una fraccion de sus parametros, ofrece un rendimiento comparable a modelos densos mucho mayores, con requisitos de hardware moderados. Su soporte nativo de function calling y system prompts lo posiciona como una herramienta solida para construir agentes autonomos y aplicaciones empresariales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Mezcla de Expertos (MoE) |
| Parametros totales | 25.2B (25.805.936.206 segun safetensors) |
| Parametros activos | 3.8B |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Mas de 140 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo 26B A4B utiliza una arquitectura MoE con 30 capas, 128 expertos totales de los cuales 8 se activan por token, mas 1 experto compartido. La atencion es hibrida: intercala ventanas deslizantes locales de 1024 tokens con atencion global completa, garantizando que la ultima capa sea siempre global. Para optimizar el uso de memoria en contextos largos, las capas globales emplean Keys y Values unificados y aplican RoPE proporcional (p-RoPE). El vocabulario tiene un tamano de 262K tokens.

El modelo incorpora un encoder de vision de aproximadamente 550M parametros para procesar entradas de imagen, que se proyectan al espacio de embeddings del LLM. La variante `-it` es un fine-tuning instruido del modelo base, disenado para seguir instrucciones y mantener conversaciones. Los datos exactos de entrenamiento (numero de tokens, composicion del dataset, tecnicas de alineacion como RLHF o DPO) no estan disponibles en la informacion proporcionada, aunque el modelo base fue entrenado por Google DeepMind con un enfoque en razonamiento, codificacion y capacidades agénticas.

## Capacidades

- Generacion de texto y razonamiento avanzado, con modos de pensamiento configurables.
- Comprension multimodal de texto e imagen, con soporte de resolucion y relacion de aspecto variables.
- Codificacion de alto nivel, con mejoras notables en benchmarks de programacion.
- Soporte nativo de function calling para integracion con herramientas y APIs.
- Capacidades agénticas para flujos de trabajo multi-paso y autonomos.
- Soporte nativo del rol `system` para conversaciones estructuradas y controlables.
- Multilingue en mas de 140 idiomas.
- Ventana de contexto de 256K tokens para tareas de largo alcance.

## Casos de uso

- Asistentes de codigo en produccion: el modelo puede integrarse en IDEs o pipelines de CI/CD para generar, revisar y refactorizar codigo, aprovechando su soporte de function calling para interactuar con repositorios y herramientas de build.
- Agentes autonomos de soporte tecnico: con su ventana de 256K tokens, puede mantener conversaciones multi-turno con contexto extenso, consultar bases de conocimiento y ejecutar acciones via tool calling.
- Analisis de documentos multimodales: procesa informes que combinan texto, tablas e imagenes, extrayendo informacion relevante para resumir o responder preguntas sobre el contenido.
- Chatbots de atencion al cliente multilingue: su soporte en mas de 140 idiomas permite desplegar asistentes en mercados globales sin necesidad de modelos separados por region.
- Razonamiento sobre documentos legales o tecnicos extensos: la ventana de 256K tokens permite procesar contratos, patentes o manuales completos en una sola pasada, identificando clausulas o requisitos especificos.
- Prototipado rapido de aplicaciones agénticas: su capacidad de razonamiento multi-paso y function calling facilita la creacion de prototipos de agentes que planifican, ejecutan y verifican tareas complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 25.2B parametros totales y 3.8B activos, el modelo puede ejecutarse en GPUs consumer de gama alta. Una cuantizacion de 4 bits requeriria aproximadamente 13-16 GB de VRAM, mientras que en precision completa (fp16) necesitaria alrededor de 50 GB.
- GPUs recomendadas: RTX 4090 (24 GB) para cuantizacion, A100 40/80 GB o H100 para precision completa o despliegues de alta concurrencia.
- Si cabe en consumer GPU: si, con cuantizacion en GPUs de 24 GB como la RTX 4090 o RTX 3090.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) y transformers con accelerate.
- Latencia y throughput: no disponible en la informacion proporcionada, aunque la arquitectura MoE con 3.8B activos sugiere una latencia menor que un modelo denso de tamano equivalente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Modalidades |
|---|---|---|---|---|
| Gemma 4 26B A4B | 25.2B totales, 3.8B activos | 256K | Apache 2.0 | Texto, imagen |
| Gemma 4 31B Dense | 30.7B | 256K | Apache 2.0 | Texto, imagen |
| Gemma 4 12B Unified | 11.95B | 256K | Apache 2.0 | Texto, imagen, audio |

El 26B A4B ofrece un punto intermedio entre el 12B Unified y el 31B Dense: mas capacidad que el primero con menor coste de inferencia que el segundo, gracias a su arquitectura MoE. El 12B Unified destaca por su arquitectura sin encoder y soporte de audio, mientras que el 31B Dense ofrece mayor capacidad bruta a costa de mas recursos.

## Limitaciones y advertencias

- Sesgos conocidos: no se han publicado evaluaciones especificas de sesgos para este modelo en la informacion disponible.
- Riesgo de alucinacion: como todo modelo generativo, puede producir contenido falso o inventado, especialmente en tareas de razonamiento complejo o con datos poco frecuentes.
- Limitaciones de contexto: aunque la ventana es de 256K tokens, el rendimiento en contextos muy largos puede degradarse y requiere gestion cuidadosa de la memoria.
- Limitaciones de idioma: el soporte multilingue es amplio, pero la calidad puede variar significativamente entre idiomas, con mejor rendimiento en ingles y otros idiomas de alto recurso.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero es recomendable revisar los terminos completos de la licencia Gemma 4 en el enlace proporcionado.
- Caveat de produccion: al ser un fine-tuning de un tercero (`Openintelligent123`), no se garantiza el mismo nivel de robustez o seguridad que el modelo base oficial de Google DeepMind.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Openintelligent123/gemma-4-26B-A4B-it
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B
- Coleccion Gemma 4: https://huggingface.co/collections/google/gemma-4
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentacion oficial: https://ai.google.dev/gemma/docs/core
- Technical report: https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Model card oficial: https://ai.google.dev/gemma/docs/core/model_card_4
- Pagina de Gemma 4 en DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Guia completa en Comet: https://www.cometapi.com/google-releases-gemma-4-open-source-model/
- Pagina de releases: https://ai.google.dev/gemma/docs/releases
