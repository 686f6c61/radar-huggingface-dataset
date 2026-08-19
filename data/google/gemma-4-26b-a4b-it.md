# google/gemma-4-26B-A4B-it

## Resumen

Gemma 4 26B A4B IT es un modelo de lenguaje multimodal de codigo abierto desarrollado por Google DeepMind, publicado en marzo de 2026 bajo licencia Apache 2.0. Se trata de la variante ajustada por instrucciones (instruction-tuned) del modelo base Gemma 4 26B A4B, y forma parte de la familia Gemma 4 junto con los modelos densos E2B, E4B, 12B y 31B. El modelo procesa texto e imagenes como entrada y genera texto como salida, con una ventana de contexto de hasta 256K tokens y soporte multilingue en mas de 140 idiomas.

La arquitectura es de tipo Mixture-of-Experts (MoE) con 25.2B parametros totales y solo 3.8B activos por token, lo que permite un rendimiento de inferencia comparable a modelos densos mucho mas grandes con un coste computacional reducido. El modelo incorpora un mecanismo de atencion hibrido que intercala ventanas deslizantes locales de 1024 tokens con atencion global completa, ademas de RoPE proporcional (p-RoPE) y Keys/Values unificados en las capas globales para optimizar el uso de memoria en contextos largos.

La relevancia de este modelo radica en su combinacion de capacidades multimodales, razonamiento configurable (thinking mode), soporte nativo de function calling y decodificacion especulativa mediante un modelo draft dedicado, lo que lo posiciona como una opcion solida para agentes autonomos, generacion de codigo y tareas de razonamiento complejo en entornos de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atencion hibrida (sliding window + global) |
| Parametros totales | 26.544.131.376 (25.2B segun model card) |
| Parametros activos | 3.8B |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Mas de 140 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE con 128 expertos mas 1 experto compartido, de los cuales se activan 8 por token. Cuenta con 30 capas y un vocabulario de 262K tokens. La atencion es hibrida: intercala capas con ventana deslizante local de 1024 tokens con capas de atencion global completa, garantizando que la ultima capa sea siempre global. Las capas globales utilizan Keys y Values unificados y RoPE proporcional (p-RoPE) para reducir el consumo de memoria en contextos largos.

Para el procesamiento multimodal, el modelo incorpora un encoder de vision dedicado de aproximadamente 550M parametros que procesa las imagenes antes de pasarlas al LLM. A diferencia del modelo 12B Unified, que es encoder-free, el 26B A4B utiliza este encoder dedicado. El modelo soporta entrada de texto e imagen con resolucion y relacion de aspecto variables.

En cuanto a innovaciones tecnicas, todos los modelos Gemma 4 incluyen un modelo draft dedicado para decodificacion especulativa (Multi-Token Prediction), lo que acelera la inferencia sin perdida de calidad. El modelo tambien soporta modos de pensamiento configurables (thinking modes) y rol de sistema nativo. Los datos de entrenamiento especificos (numero de tokens, composicion del dataset, tecnicas de alineacion como RLHF o DPO) no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto: produccion de texto coherente y contextual en mas de 140 idiomas.
- Razonamiento: disenado como razonador de alto rendimiento con modos de pensamiento configurables (thinking mode).
- Generacion de codigo: mejoras notables en benchmarks de codificacion, con soporte nativo de function calling.
- Capacidades agente: soporte de tool calling y razonamiento multi-paso para agentes autonomos.
- Multimodal: procesa texto e imagenes (con resolucion y relacion de aspecto variables); genera texto.
- Soporte de rol de sistema nativo: permite conversaciones estructuradas y controlables mediante el rol `system`.
- Decodificacion especulativa: incluye modelo draft dedicado para acelerar la inferencia sin perdida de calidad.
- Contexto largo: ventana de 256K tokens con atencion hibrida optimizada para memoria.

## Casos de uso

- Agentes autonomos con tool calling: el modelo soporta function calling nativo y razonamiento multi-paso, lo que permite construir agentes que interactuan con APIs, bases de datos y servicios externos de forma autonoma. Su ventana de 256K tokens permite mantener el historial completo de interacciones sin truncamiento.
- Generacion de codigo en produccion: con soporte de function calling y mejoras en benchmarks de codificacion, puede integrarse en pipelines de CI/CD para generar, revisar y documentar codigo, asi como en asistentes de programacion que requieran contexto largo de repositorios.
- Analisis de documentos multimodales: al aceptar entrada de texto e imagen, puede procesar documentos que combinan ambos formatos, como capturas de pantalla, diagramas, formularios escaneados o graficos, extrayendo informacion estructurada para su posterior procesamiento.
- Atencion al cliente multilingue: con soporte en mas de 140 idiomas y contexto de 256K tokens, puede gestionar conversaciones multi-turno extensas en multiples idiomas, manteniendo el contexto completo de la interaccion y derivando a agentes humanos cuando sea necesario.
- Razonamiento y analisis de datos: los modos de pensamiento configurables permiten activar un razonamiento mas profundo para tareas de analisis complejo, como interpretacion de resultados, planificacion estrategica o resolucion de problemas que requieren varios pasos de deduccion.
- Despliegue en entornos con recursos limitados: gracias a su arquitectura MoE con solo 3.8B parametros activos, ofrece un rendimiento de inferencia eficiente que permite su despliegue en GPUs de consumo y estaciones de trabajo, no solo en servidores de alta gama, reduciendo el coste por token en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 25.2B parametros totales, en precision bf16 se requieren aproximadamente 50-53 GB de VRAM. Con cuantizacion a 4 bits, se estima un consumo de 15-16 GB, y a 8 bits, de 28-30 GB. Estas son estimaciones basadas en el tamano del modelo; no se han publicado cifras oficiales.
- GPU recomendadas: para precision completa, GPUs de datacenter como A100 (80GB) o H100. Para cuantizacion Q4, GPUs de consumo como RTX 4090 (24GB) o RTX 3090 (24GB) son suficientes.
- Compatibilidad con GPUs de consumo: si, con cuantizacion. Una RTX 4090 con 24GB de VRAM puede ejecutar el modelo en Q4 sin problemas.
- Opciones de despliegue: el modelo es compatible con la libreria transformers de HuggingFace, y puede desplegarse con vLLM, llama.cpp, Ollama o TGI. Tambien esta disponible en plataformas cloud como SageMaker y Azure.
- Latencia y throughput: no disponible. La decodificacion especulativa con modelo draft dedicado deberia mejorar significativamente el throughput, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Multimodal |
|---|---|---|---|---|---|
| Gemma 4 26B A4B IT | 25.2B | 3.8B | 256K | Apache 2.0 | Texto + imagen |
| Mixtral 8x7B | 46.7B | 12.9B | 32K | Apache 2.0 | No |
| Qwen2.5-32B | 32.5B | 32.5B (denso) | 128K | Apache 2.0 | No |

Nota: la comparativa se basa en modelos conocidos de la misma categoria (MoE o tamano similar). No se dispone de datos de rendimiento comparativos publicados en la informacion proporcionada.

## Limitaciones y advertencias

- Modalidades limitadas: el modelo 26B A4B solo soporta texto e imagen como entrada. A diferencia de los modelos E2B, E4B y 12B, no soporta audio ni video de forma nativa.
- Riesgo de alucinacion: como todos los modelos de lenguaje, puede generar contenido factualmente incorrecto o inventado, especialmente en tareas de generacion libre o cuando se le pide informacion fuera de su ambito de entrenamiento.
- Sesgos: no se ha publicado informacion especifica sobre sesgos del modelo en la informacion disponible. Google DeepMind indica que los modelos Gemma 4 pasan por los mismos protocolos de seguridad que sus modelos propietarios.
- Uso en produccion: aunque la licencia Apache 2.0 permite uso comercial sin restricciones, es recomendable implementar capas de validacion y guardrails adicionales para aplicaciones criticas.
- Requisitos de hardware: aunque los parametros activos son solo 3.8B, los 25.2B parametros totales deben cargarse en memoria, lo que requiere al menos 15-16 GB de VRAM incluso con cuantizacion agresiva.
- Datos de entrenamiento: no se ha publicado informacion detallada sobre la composicion del dataset de entrenamiento ni sobre las tecnicas de alineacion utilizadas, lo que dificulta la evaluacion de posibles sesgos o limitaciones derivadas de los datos.

## Enlaces

- HuggingFace: https://huggingface.co/google/gemma-4-26B-A4B-it
- Technical report (arXiv): https://arxiv.org/abs/2607.02770
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentacion oficial: https://ai.google.dev/gemma/docs/core
- Model card de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
- Coleccion Gemma 4 en HuggingFace: https://huggingface.co/collections/google/gemma-4
- GitHub: https://github.com/google-gemma
