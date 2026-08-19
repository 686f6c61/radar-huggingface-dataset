# Jackrong/Qwopus3.5-9B-Coder-GGUF

## Resumen

Qwopus3.5-9B-Coder es un modelo de lenguaje denso de 9 000 millones de parámetros, desarrollado por Jackrong como una versión comunitaria experimental basada en Qwen3.5-9B-v3.5. Está específicamente afinado para tareas de codificación agéntica, llamada a herramientas compleja y razonamiento lógico estructurado. El modelo integra una técnica novedosa llamada Trace Inversion, que reconstruye cadenas de razonamiento completas a partir de "burbujas de razonamiento" comprimidas de modelos comerciales como Claude, combinadas con trazas de agentes reales de GLM-5.1.

El modelo se distribuye en formato GGUF, lo que permite su ejecución en dispositivos con 16 GB de RAM en precisión de 8 bits, como portátiles estándar o Mac mini. Además, soporta entrada multimodal (imagen y texto) mediante un archivo `mmproj.gguf` adicional, y es capaz de realizar llamadas a herramientas y razonamiento en cadena. Su relevancia actual radica en ofrecer una alternativa ligera y de código abierto para agentes de programación y automatización local, con licencia Apache 2.0.

La versión GGUF publicada cuenta con 8 953 803 264 parámetros y está diseñada para su uso con llama.cpp, LM Studio, MLX y otros backends compatibles. Aunque se presenta como un modelo experimental sin evaluación exhaustiva, los primeros resultados en el conjunto HermesAgent-20 muestran una puntuación de 85, lo que sugiere un buen rendimiento en escenarios agénticos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (basado en Qwen3.5-9B) |
| Parametros totales | 8 953 803 264 (8,95 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones no especificadas en la informacion) |
| Idiomas soportados | Ingles, chino, espanol, ruso, japones |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tambien safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo parte de Qwopus3.5-9B-v3.5, un afinamiento de Qwen3.5-9B, y se somete a un proceso de ajuste fino supervisado (SFT) que combina dos fuentes de datos principales: el dataset `lambda/hermes-agent-reasoning-traces`, que contiene trazas de razonamiento de agentes, y los datasets `Jackrong/Claude-opus-4.7-TraceInversion-5000x` y `Jackrong/Claude-opus-4.6-TraceInversion-9000x`, generados mediante la técnica de Trace Inversion. Esta técnica reconstruye cadenas de razonamiento completas a partir de versiones comprimidas de razonamientos de modelos propietarios, lo que permite al modelo aprender a desplegar procesos de pensamiento estructurados sin depender de datos etiquetados manualmente.

El entrenamiento se centra en tres objetivos: mejorar la coherencia lógica y reducir el pensamiento repetitivo, potenciar las capacidades de escritura y depuracion de codigo a nivel de repositorio, y estabilizar la llamada a herramientas para comandos de terminal, operaciones de archivos y navegacion web. No se especifica el numero de tokens de entrenamiento ni si se emplearon tecnicas de RLHF o DPO adicionales.

## Capacidades

- Generacion de codigo: escritura, depuracion y tareas a nivel de repositorio, con especial enfasis en agentes de programacion.
- Razonamiento logico estructurado: cadenas de pensamiento (chain-of-thought) que reducen la repeticion y mejoran la coherencia.
- Tool calling / function calling: soporte estable para comandos de terminal, operaciones de archivos y navegacion web.
- Capacidades de agente: disenado para ejecutar tareas multi-paso con uso de herramientas externas.
- Multimodalidad: entrada de imagen y texto (vision) mediante el archivo `mmproj.gguf` incluido en el repositorio GGUF.
- Multilingue: soporta ingles, chino, espanol, ruso y japones.
- Razonamiento con distilacion cruzada: alineacion de datos de multiples fuentes para mejorar la consistencia.

## Casos de uso

- Asistente de programacion local: el modelo puede integrarse en entornos de desarrollo como VSCode o Neovim para autocompletar, refactorizar y depurar codigo, aprovechando su capacidad de razonamiento estructurado y su ejecucion en 8 bits en maquinas con 16 GB de RAM.
- Agente de automatizacion de terminal: gracias a su soporte de tool calling, puede ejecutar comandos de shell, gestionar archivos y orquestar flujos de trabajo de CI/CD de forma autonoma.
- Generacion de codigo en produccion: puede conectarse a APIs de herramientas externas (por ejemplo, Git, Docker) para generar parches, revisar pull requests o crear tests unitarios, con un coste de inferencia reducido al ser un modelo de 9B.
- Analisis de imagenes tecnicas: al ser multimodal, puede interpretar capturas de pantalla, diagramas de arquitectura o graficos de error y proporcionar explicaciones o sugerencias de codigo asociadas.
- Chatbot de soporte tecnico multilingue: con soporte para cinco idiomas, puede atender consultas de usuarios en distintos paises, manteniendo contexto de conversacion y usando herramientas de busqueda o bases de conocimiento.
- Prototipado rapido de agentes de razonamiento: investigadores y desarrolladores pueden usar el modelo como base para experimentar con tecnicas de Trace Inversion o para construir agentes de proposito especifico sin necesidad de GPUs de alta gama.

## Benchmarks y rendimiento

La model card reporta una puntuacion de 85 en el conjunto HermesAgent-20, un benchmark de capacidades agénticas, evaluado con el framework benchlocal en Apple Silicon. Sin embargo, la tabla comparativa presentada en la documentacion esta incompleta y no se proporcionan resultados detallados de otros benchmarks estandar como MMLU, HumanEval o GSM8K. No se dispone de datos adicionales en la informacion disponible.

| Modelo | Conjunto de test | Puntuacion |
|---|---|---|
| Qwopus3.5-9B-coder | HermesAgent-20 | 85 |

## Requisitos de hardware

- VRAM estimada: para inferencia en 8 bits se requieren aproximadamente 9 GB de VRAM; en 4 bits, alrededor de 5 GB. La model card indica que funciona en dispositivos con 16 GB de RAM unificada (como Mac mini o portatiles estandar).
- GPU recomendadas: tarjetas consumer con 12 GB o mas de VRAM, como RTX 3060 12GB, RTX 4070, o Apple Silicon con 16 GB unificados.
- Compatibilidad con consumer GPU: si, el modelo cabe en GPUs de gama media y en Macs con suficiente memoria unificada.
- Opciones de despliegue: llama.cpp, LM Studio, MLX, Ollama (si se convierte a formato compatible), y cualquier backend que soporte GGUF. Tambien puede usarse con transformers si se cargan los pesos safetensors del modelo base.
- Latencia y throughput: no se proporcionan datos concretos; la model card menciona "velocidades de inferencia impresionantes" en Apple Silicon, pero sin cifras.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos en la informacion proporcionada. Sin embargo, por tamano y orientacion, podria compararse con:

- Qwen3-8B (dense, 8B): similar en parametros, pero sin afinamiento especifico para agentes ni vision.
- Llama-3.1-8B-Instruct (dense, 8B): modelo generico de instrucciones, sin soporte multimodal ni enfasis en tool calling.
- GLM-4-9B (dense, 9B): con capacidades de tool calling y razonamiento, pero sin la tecnica de Trace Inversion.

La diferencia principal de Qwopus3.5-9B-Coder es su combinacion de vision, tool calling y razonamiento estructurado en un paquete de 9B con licencia Apache 2.0, lo que lo hace especialmente atractivo para despliegues locales.

## Limitaciones y advertencias

- Version experimental comunitaria: la model card advierte explicitamente que es una version de investigacion y exploracion, no apta para produccion sin validacion previa.
- Capability decay: al estar afinado verticalmente para programacion y razonamiento agéntico, puede degradarse en tareas generales o no relacionadas con codigo.
- Evaluacion limitada: no se han realizado evaluaciones exhaustivas de rendimiento general; solo se reporta HermesAgent-20.
- Riesgo de alucinacion: como cualquier LLM, puede generar codigo o respuestas incorrectas, especialmente en contextos largos o ambiguos.
- Contexto no especificado: se desconoce la longitud maxima de contexto soportada, lo que puede afectar a tareas que requieran ventanas largas.
- Sesgos: no se han documentado sesgos especificos, pero al derivar de Qwen3.5, podria heredar sesgos del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor recomienda precaucion por su naturaleza experimental.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Jackrong/Qwopus3.5-9B-Coder-GGUF
- Modelo base: https://huggingface.co/Jackrong/Qwopus3.5-9B-v3.5
- Variante MTP: https://huggingface.co/Jackrong/Qwopus3.5-9B-Coder-MTP-GGUF
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwopus3.5-9b-coder-gguf-jackrong
- Articulo en daily.dev: https://daily.dev/posts/mizempuev
- Framework de evaluacion benchlocal: https://github.com/stevibe/benchlocal
