# AuroraSystem/Clary-0.6-0.6B

## Resumen

Clary-0.6-0.6B es un modelo multimodal ligero desarrollado por AuroraSystem, que combina el modelo de lenguaje Qwen3-0.6B con un codificador visual CLIP ViT-B/32 y un proyector propio (768→2048→2048→1024). El resultado es un sistema capaz de procesar texto e imágenes, generando descripciones, respondiendo a instrucciones y escribiendo código, todo en ruso e inglés. Se distribuye con licencia Apache-2.0, lo que permite uso comercial sin restricciones significativas.

La relevancia de este modelo radica en su tamaño reducido (596 millones de parámetros), que lo hace ejecutable en hardware modesto, y en su naturaleza multimodal, algo poco común en esa escala. Está pensado para desarrolladores que necesitan capacidades de visión y lenguaje en entornos con recursos limitados, como dispositivos periféricos o aplicaciones embebidas. Incluye un modo de razonamiento explícito (modo `/think`) heredado de Qwen3, que permite al modelo "pensar" antes de responder.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-0.6B) + CLIP ViT-B/32 + proyector multimodal |
| Parametros totales | 596.049.920 (0,6B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada en la informacion disponible (hereda la de Qwen3-0.6B, no confirmada) |
| Tipos de cuantizacion | No especificados; existe version GGUF alternativa |
| Idiomas soportados | Ruso, ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (model.safetensors, projector.safetensors) y GGUF (version alternativa) |

## Arquitectura y entrenamiento

La arquitectura es hibrida en el sentido de que combina un LLM puramente textual (Qwen3-0.6B) con un encoder de vision congelado (CLIP ViT-B/32) y un proyector entrenable que transforma las caracteristicas visuales (768 dimensiones) en 1024 dimensiones a traves de dos capas intermedias de 2048, generando 49 tokens visuales que se concatenan con los embeddings de texto antes de entrar en el transformer. El modelo base Qwen3-0.6B es un transformer denso con atencion causal, sin mecanismos de mezcla de expertos.

El entrenamiento se realizo mediante LoRA (Low-Rank Adaptation) sobre Qwen3-0.6B, y los pesos del adaptador se fusionaron en el modelo final. El encoder CLIP permanece congelado, por lo que solo se entrenaron el proyector y los adaptadores LoRA. No se proporcionan detalles sobre el dataset de entrenamiento, el numero de tokens ni si se aplicaron tecnicas de RLHF o DPO. La model card menciona que no se entrenaron system prompts, lo que sugiere que el ajuste se centro en instrucciones y dialogos directos.

## Capacidades

- Generacion de texto e instrucciones en ruso e ingles.
- Generacion de codigo Python (funciones, algoritmos, etc.).
- Razonamiento matematico basico.
- Resumen de textos en ingles y ruso.
- Descripcion de imagenes: reconoce objetos, escenas y colores.
- Modo `/think` (modo de razonamiento explicito) que genera una cadena de pensamiento antes de la respuesta final.
- Interaccion multimodal: puede recibir una imagen junto con una pregunta o instruccion textual.

## Casos de uso

- **Asistente de codigo en entornos con recursos limitados**: el modelo puede generar funciones Python y explicar algoritmos, funcionando en portatiles sin GPU dedicada. Su tamano permite ejecutarlo en CPU con cuantizacion GGUF.
- **Descripcion de imagenes para accesibilidad**: puede generar descripciones breves de fotografias o graficos, util para herramientas de lectura de pantalla o aplicaciones de ayuda a personas con discapacidad visual.
- **Chatbot bilingue ruso-ingles**: su capacidad para manejar ambos idiomas lo hace adecuado para atencion al cliente en mercados de habla rusa e inglesa, aunque con limitaciones de contexto.
- **Preprocesamiento de documentos**: aunque su OCR es debil, puede identificar colores y objetos en imagenes, lo que sirve para clasificar imagenes por contenido en pipelines automaticos.
- **Educacion y prototipado**: ideal para proyectos academicos o demos donde se necesita un modelo multimodal pequeno y de codigo abierto para experimentar con tecnicas de vision y lenguaje.
- **Edge computing**: al caber en menos de 1 GB de RAM, puede desplegarse en dispositivos IoT o sistemas embebidos para tareas de clasificacion visual basica y respuestas textuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni otros tests estandar. Tampoco se comparan resultados con otros modelos. El rendimiento practico debe evaluarse de forma empirica por el usuario.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo de 0,6B, la inferencia en FP16 requiere aproximadamente 1,2 GB de VRAM. Con cuantizacion 4-bit, puede bajar a ~0,4 GB, aunque no se especifican cuantizaciones concretas.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM (ej. GTX 1650, RTX 3050) es suficiente. Tambien puede ejecutarse en CPU con llama.cpp u Ollama.
- **Compatibilidad con consumer GPU**: si, cabe en practicamente cualquier GPU moderna e incluso en CPU con suficiente RAM.
- **Opciones de despliegue**: transformers (Python), llama.cpp, Ollama, LM Studio (via GGUF), y servidores compatibles con text-generation-inference (TGI) segun los tags del repositorio.
- **Latencia y throughput**: no se han publicado datos. En CPU, se esperan velocidades de unos pocos tokens por segundo; en GPU, decenas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Idiomas | Licencia |
|---|---|---|---|---|---|
| Clary-0.6-0.6B | 0,6B | No especificado | Si (CLIP) | RU, EN | Apache-2.0 |
| Qwen3-0.6B (base) | 0,6B | No especificado (tipicamente 32K) | No | Multilingue | Apache-2.0 |
| SmolLM2-0.6B | 0,6B | 2K (tipico) | No | EN, ES, FR, etc. | Apache-2.0 |

La principal diferencia de Clary frente a sus alternativas de tamano similar es la incorporacion de vision, que lo hace unico en su categoria. Sin embargo, carece de datos de contexto y rendimiento publicados, por lo que su idoneidad debe validarse con pruebas propias.

## Limitaciones y advertencias

- **OCR debil**: el modelo no reconoce texto pequeno en imagenes, por lo que no es adecuado para extraccion de informacion de documentos escaneados.
- **Sin entrenamiento con system prompts**: no se han ajustado comportamientos de sistema, lo que puede afectar a la coherencia en dialogos largos o a la adherencia a instrucciones de alto nivel.
- **Techo de capacidad limitado**: al basarse en Qwen3-0.6B, su rendimiento en tareas complejas (razonamiento avanzado, codigo extenso) esta limitado por el tamano del modelo base.
- **Sesgos y alucinaciones**: no se han publicado evaluaciones de sesgos; como cualquier LLM pequeno, es propenso a alucinar en temas poco representados en sus datos de entrenamiento.
- **Idiomas restringidos**: solo soporta ruso e ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- **Sin garantias de produccion**: el repositorio tiene cero descargas y cero likes, lo que sugiere un proyecto joven o sin validacion comunitaria. Se recomienda probar exhaustivamente antes de usarlo en entornos criticos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AuroraSystem/Clary-0.6-0.6B
- Version GGUF: https://huggingface.co/AuroraSystem/Clary-0.6-0.6B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
