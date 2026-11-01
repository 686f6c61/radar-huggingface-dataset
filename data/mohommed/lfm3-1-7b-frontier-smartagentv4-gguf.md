# mohommed/LFM3-1.7B-Frontier-SmartAgentv4-GGUF

## Resumen

LFM3-1.7B-Frontier-SmartAgentv4 es un ajuste comunitario (fine-tune) del modelo base LiquidAI/LFM3-1.7B, publicado por el usuario mohommed en Hugging Face. El modelo base pertenece a la familia LFM3 (Liquid Foundation Models) de Liquid AI, una arquitectura híbrida que combina componentes convolucionales con mecanismos de atención, optimizada para eficiencia en modelos de tamaño reducido. Este derivado se ha entrenado mediante una metodología propia del autor denominada SDT-v2 (Smart Deep Training v2), que incluye enmascaramiento de pérdida en los turnos del asistente, LoRA con estabilización de rango, un pase contrastivo SimPO sin modelo de referencia y una fase de "des-censura" mediante SVD.

El repositorio publicado contiene cuantizaciones GGUF calibradas con matriz de importancia (imatrix) mediante `llama-imatrix`, lo que lo hace especialmente adecuado para inferencia local con llama.cpp, Ollama o herramientas compatibles. El autor anuncia una ventana de contexto extendida a 512K tokens mediante reescalado ABF-RoPE, aunque esta cifra procede de la model card y no está verificada de forma independiente.

Su relevancia reside en la tendencia creciente de la comunidad a adaptar modelos base pequeños y eficientes (en este caso, de 1.7B de parámetros) para tareas conversacionales y de agentes, con licencias permisivas (Apache 2.0) que permiten uso comercial sin restricciones. Con 1.728.801.600 parámetros totales, es un modelo pensado para hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (híbrida, con convoluciones 1D `shortconv` y atención con QK-Norm), base LiquidAI/LFM3-1.7B |
| Parametros totales | 1.728.801.600 (~1.73B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE; se asume densidad completa) |
| Longitud de contexto | 512K tokens (según la model card del autor, mediante ABF-RoPE; no verificado independientemente) |
| Tipos de cuantizacion | GGUF con calibracion imatrix (niveles concretos no especificados en la informacion disponible) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio actual); el modelo base existe en safetensors |

## Arquitectura y entrenamiento

El modelo base, LiquidAI/LFM3-1.7B, pertenece a la tercera generacion de Liquid Foundation Models, caracterizada por una arquitectura hibrida que integra convoluciones 1D cortas (`shortconv.conv`) con bloques de atencion equipados con QK-Norm. Esta combinacion busca reducir el coste computacional de la atencion pura manteniendo calidad en secuencias largas, lo que resulta coherente con el anuncio de contexto de 512K tokens.

El ajuste fino descrito en la model card emplea la metodologia SDT-v2 del autor, con los siguientes componentes: enmascaramiento del 100% de la perdida a los turnos del asistente (para que el modelo solo aprenda de sus propias respuestas), un "Focal Surprise Gate" con exponente (1 - p_t)^1.5 y un refuerzo de tokens pivote de 1.85x; descongelamiento de las convoluciones nativas y las QK-Norm junto a LoRA con estabilizacion de rango (rsLoRA, r=64, alpha=128); un pase contrastivo SimPO sin modelo de referencia comparando respuestas ganadoras frente a respuestas de baja calidad; y una mezcla de vectores de tarea tipo Wise-FT (0.88/0.12) seguida de una fase de "des-censura" mediante SVD sobre tres subespacios. El entrenamiento se realizo en dos GPU T4. El contexto de 512K se consigue mediante reescalado ABF-RoPE, y las cuantizaciones GGUF se calibraron con `llama-imatrix`.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset ni metricas de perdida.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, etiqueta conversational).
- Orientacion a agentes: la denominacion "SmartAgent" y el entrenamiento con SimPO sugieren enfasis en comportamiento de asistente y seguimiento de instrucciones, aunque no hay datos publicados de tool calling.
- Contexto extendido anunciado de 512K tokens, util para documentos y conversaciones muy largas (rendimiento real en ese rango no verificado).
- Modelo etiquetado como "uncensored" por el autor: sin filtros de seguridad adicionales impuestos por el fine-tune.
- No hay informacion disponible sobre capacidades de vision, audio, razonamiento estructurado (thinking mode), soporte de function calling nativo ni rendimiento en codigo o matematicas.

## Casos de uso

- Chatbots locales y privados: con ~1.7B de parametros y formato GGUF, puede ejecutarse en portatiles y PCs sin GPU dedicada, ideal para asistentes que procesan datos sensibles sin salir del equipo.
- Prototipado de agentes ligeros: su tamano reducido permite orquestar multiples instancias en paralelo para tareas de agente con presupuesto hardware minimo, aunque habra que validar el tool calling empiricamente.
- Procesamiento de documentos largos: si el contexto de 512K se comporta segun lo anunciado, permitiria resumir o consultar sobre bases de codigo o corpus extensos en una sola pasada.
- Generacion aumentada por recuperacion (RAG) en local: combinable con backends como llama.cpp para responder sobre documentos indexados con latencia baja.
- Ajustes posteriores (fine-tunes) derivados: al ser Apache 2.0 y de tamano pequeño, es una base practica para experimentar con LoRA en hardware modesto (el propio autor entreno en T4 duales).
- Integracion en aplicaciones de escritorio: compatible con Ollama, LM Studio y otras herramientas de ejecucion local de GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye metricas de MMLU, HumanEval, GSM8K ni comparativas con el modelo base, por lo que no es posible evaluar si el fine-tune mejora o degrada el rendimiento de LiquidAI/LFM3-1.7B.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de ~1.7B de parametros, la version GGUF a Q4 ocupa aproximadamente 1-1.2 GB y a Q8 unos 1.8-2 GB; con contexto largo la VRAM crece por la cache KV. El repositorio completo pesa 8.0 GB (probablemente incluye varias cuantizaciones).
- GPU recomendadas: no es necesaria GPU; cualquier GPU moderna con 4 GB de VRAM (por ejemplo, RTX 3060 o superior) ejecuta las cuantizaciones con holgura. El entrenamiento original se realizo en 2x NVIDIA T4 (16 GB cada una).
- Consumer GPUs: cabe comodamente en GPUs de consumo de gama media e incluso en CPU-only; tambien es viable en Apple Silicon con llama.cpp.
- Opciones de despliegue: llama.cpp (formato nativo GGUF con imatrix), Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF. No hay evidencia de soporte directo en vLLM o TGI para esta variante GGUF (el modelo base en safetensors podria ser compatible con transformers).
- Latencia y throughput: no disponibles; por tamano (~1.7B) cabe esperar inferencia rapida en CPU moderna y muy alta en GPU, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| LFM3-1.7B-Frontier-SmartAgentv4 (este) | 1.73B | 512K (anunciado) | Apache 2.0 | GGUF |
| LiquidAI/LFM3-1.7B (base) | 1.73B | no disponible en la informacion proporcionada | no disponible | safetensors |
| Qwen2.5-1.5B-Instruct | 1.54B | 32K (128K con YaRN) | Apache 2.0 | safetensors, GGUF |
| Llama-3.2-1B-Instruct | 1.24B | 128K | Llama 3.2 Community License | safetensors, GGUF |

Frente a sus alternativas, este modelo destaca por el contexto anunciado de 512K y la ausencia de restricciones de licencia, aunque carece de benchmarks publicados y del respaldo de un laboratorio con documentacion extensa.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: la calidad real del fine-tune frente al modelo base es desconocida y debe validarse antes de uso en produccion.
- Etiquetado como "uncensored" por el autor: el modelo puede generar contenido sin salvaguardas, lo que implica riesgo legal y de reputacion en entornos profesionales; conviene aplicar filtros externos.
- El contexto de 512K proviene de la model card y no esta verificado; en modelos pequeños, la calidad suele degradarse significativamente en contextos muy largos ("lost in the middle").
- Riesgo de alucinacion tipico de modelos de ~1.7B: capacidad de razonamiento y factualidad limitadas comparadas con modelos de 7B o superiores.
- Idiomas soportados no documentados; el rendimiento en castellano debe comprobarse empiricamente.
- Es un modelo comunitario con pocas descargas (260) y sin likes: escaso historial de auditoria por parte de la comunidad.
- Licencia Apache 2.0: sin restricciones para uso comercial, pero el autor no ofrece garantias; los metodos de "des-censura" mediante SVD pueden degradar coherencia en algunos dominios.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mohommed/LFM3-1.7B-Frontier-SmartAgentv4-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Organizacion de Liquid AI: https://huggingface.co/LiquidAI
