# Kausp11/searchlm-sft_v4cannsent_wiki17_v1

## Resumen

Search-LLM Wikipedia 1.7B SFT es un modelo de lenguaje de 1.700 millones de parámetros desarrollado por el usuario Kausp11 y publicado en Hugging Face. Se trata de un ajuste fino supervisado (SFT) sobre un modelo base preentrenado con una técnica denominada *search-enabled pretraining*, es decir, un preentrenamiento en el que el modelo aprende con bloques de búsqueda anotados integrados en los datos, con el objetivo de mejorar su capacidad para recuperar y razonar sobre información externa.

El ajuste fino se realizó durante una época sobre una mezcla de datos compuesta por SmolTalk (chat y habilidades), SmolTalk2 (llamadas a herramientas) y conversaciones SmolTalk con bloques de búsqueda procedentes del pipeline de anotación del preentrenamiento, colocados al inicio de cada frase. El modelo base procede del checkpoint `wiki6m/search_1p7B_v2_e4`, entrenado presumiblemente sobre corpus de Wikipedia de unos 6 millones de documentos.

Su relevancia radica en la creciente tendencia a entrenar modelos pequeños (sub-2B) capaces de integrar búsqueda en su flujo de conversación, útiles para despliegues ligeros con capacidades tipo RAG. El modelo usa la arquitectura LLaMA, está distribuido en safetensors y se publica bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LLaMA (transformer decoder) |
| Parámetros totales | 1.711.384.576 (1,71 B) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo pesos en bf16/fp16 implícitos) |
| Idiomas soportados | no disponible (datos de entrenamiento en inglés: SmolTalk y Wikipedia) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de una arquitectura LLaMA de aproximadamente 1,7 B de parámetros, preentrenada bajo el enfoque *search-enabled pretraining*. En este esquema, el corpus de preentrenamiento (Wikipedia, unos 6 millones de documentos según el nombre del checkpoint base) se anota con bloques de búsqueda que simulan consultas a un motor de búsqueda, de modo que el modelo aprende desde el principio a emitir y consumir resultados de búsqueda como parte de su generación. El checkpoint base utilizado es `search-lm/ckpts/init wiki6m/search_1p7B_v2_e4` (4 épocas según la nomenclatura).

Sobre ese base se aplicó un SFT de una época con la configuración `v4c-ann-sent`, en la que los bloques de búsqueda anotados se colocan al inicio de la frase. La mezcla de entrenamiento incluye:

- SmolTalk: conversaciones de chat y datos de habilidades (skills).
- SmolTalk2: datos de tool calling (llamadas a herramientas).
- Conversaciones SmolTalk con bloques de búsqueda procedentes del pipeline de anotación del preentrenamiento.

El formato de chat utilizado es `User: ...\n\nAssistant: ...`, un formato simple sin plantilla de tokens especiales documentada. No se dispone de información sobre el número total de tokens de entrenamiento, el uso de RLHF/DPO ni hiperparámetros concretos (learning rate, batch size, etc.).

## Capacidades

- Generación de texto conversacional en formato chat (`User: ... / Assistant: ...`), entrenada con el dataset SmolTalk.
- Tool calling / function calling, gracias a la inclusión de SmolTalk2 en la mezcla de SFT.
- Uso de bloques de búsqueda integrados en la conversación: el modelo está entrenado para emitir o procesar consultas de búsqueda como parte de su razonamiento (search-enabled), lo que lo hace apto para flujos tipo agente con búsqueda.
- Seguimiento de instrucciones y tareas de habilidades (skills) según el corpus SmolTalk.
- No se dispone de información sobre capacidades multimodales (visión, audio): el pipeline es text-generation.
- No se ha documentado soporte explícito de razonamiento multi-step tipo thinking mode, aunque el entrenamiento con bloques de búsqueda sugiere capacidad de razonamiento con herramientas externas.

## Casos de uso

- Chatbots ligeros con búsqueda integrada: el modelo puede insertar bloques de búsqueda en la conversación y continuar la respuesta con los resultados, ideal para asistentes que necesitan hechos actualizados sin depender de un modelo grande.
- Pipelines RAG de bajo coste: al estar entrenado con bloques de búsqueda al inicio de frase, puede integrarse en sistemas de generación aumentada por recuperación donde el modelo consulta y sintetiza documentos.
- Agentes con tool calling: la exposición a SmolTalk2 permite usarlo como agente pequeño que invoca funciones (APIs, buscadores, calculadoras) en flujos multi-paso.
- Asistentes de dominio enciclopédico: el preentrenamiento sobre Wikipedia lo hace adecuado para preguntas y respuestas sobre conocimiento general.
- Prototipado y investigación en search-enabled pretraining: al ser un checkpoint experimental publicado con su receta (v4c-ann-sent), sirve como base para ablation studies sobre integración de búsqueda en el preentrenamiento.
- Despliegue en hardware modesto: con 1,7 B de parámetros, puede ejecutarse en GPUs de consumo o incluso CPU para casos de inferencia ligera en aplicaciones embebidas o edge.
- Fine-tuning posterior: como modelo base compacto con licencia Apache 2.0, es candidato para ajustes adicionales en dominios específicos (salud legal, documentación técnica) manteniendo la capacidad de búsqueda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,4–4 GB para los pesos, más overhead de KV cache; en la práctica, 6–8 GB de VRAM son suficientes con contexto moderado.
- Con cuantización a 4 bits (no publicada oficialmente, pero factible con herramientas estándar), el modelo cabría cómodamente en GPUs de 4–6 GB.
- GPU recomendadas: cualquier GPU de consumo con 6 GB o más (RTX 3060, RTX 4060, RTX 4090 de sobra); no se requieren aceleradores de datacenter como A100 o H100 para inferencia.
- Compatible con consumer GPUs: sí, dada su talla de 1,7 B de parámetros; incluso viable en CPU con velocidad aceptable.
- Opciones de despliegue: la model card indica compatibilidad con `text-generation-inference` y `endpoints_compatible`, por lo que funciona con TGI y los Inference Endpoints de Hugging Face. Al usar la librería `transformers` con arquitectura LLaMA, es igualmente desplegable con vLLM y, tras conversión a GGUF, con llama.cpp u Ollama (conversión no incluida en el repositorio).
- Latencia y throughput: no disponibles; al ser un modelo de 1,7 B, cabe esperar latencias bajas y throughput alto en GPU de consumo, aunque no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool calling | Licencia | Notas |
|---|---|---|---|---|---|
| Search-LLM Wikipedia 1.7B SFT (este) | 1,71 B | no disponible | Sí (entrenado con SmolTalk2) | Apache 2.0 | Preentrenado con bloques de búsqueda integrados |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32 K (128 K con YaRN) | Sí | Apache 2.0 (algunos componentes con restricciones) | Multilingüe (29+ idiomas), benchmarks publicados |
| SmolLM2-1.7B-Instruct | 1,71 B | 8 K | Limitado | Apache 2.0 | Entrenado con SmolTalk; base de la receta de chat usada aquí |
| Llama-3.2-1B-Instruct | 1,24 B | 128 K | Sí | Llama Community License (restricciones comerciales) | Multilingüe, amplio ecosistema |

La principal diferencia de este modelo frente a las alternativas es su entrenamiento específico con bloques de búsqueda (*search-enabled pretraining*), que lo orienta a flujos agénticos con recuperación de información, mientras que los modelos comparables son chatbots generales. A cambio, carece de la documentación, benchmarks y ecosistema de los modelos corporativos.

## Limitaciones y advertencias

- Falta de documentación: la model card es mínima; no hay datos de contexto, benchmarks, idiomas ni evaluaciones de seguridad, lo que exige validación propia antes de uso en producción.
- Riesgo de alucinación: no evaluado públicamente; al ser un modelo de 1,7 B entrenado sobre Wikipedia y datos sintéticos de chat, el riesgo de alucinación es presumiblemente alto, especialmente en conocimiento de cola larga.
- Sesgos: heredados de Wikipedia y de los datasets SmolTalk/SmolTalk2 (mayoritariamente en inglés); no se ha publicado ningún análisis de sesgos.
- Idiomas: sin confirmación oficial, pero los datos de entrenamiento apuntan a predominio del inglés; el rendimiento en castellano no está garantizado ni evaluado.
- Contexto: la longitud de ventana no está documentada; debe verificarse en la configuración del modelo antes de planificar tareas con documentos largos.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución sin royalties; no se identifican restricciones de licencia relevantes.
- Formato de chat no estándar: usa `User: ...\n\nAssistant: ...` en lugar de plantillas con tokens especiales de LLaMA; un chat template mal configurado puede degradar seriamente el rendimiento.
- Proyecto experimental: descargas bajas (237) y sin comunidad activa; el mantenimiento y la corrección de errores no están garantizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kausp11/searchlm-sft_v4cannsent_wiki17_v1
- Paper, repositorio de código y demo: no disponibles en la información proporcionada.
