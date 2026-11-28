# balllvin/LFM3-1.7B-Agent-v0.01.000

## Resumen

LFM3-1.7B-Agent-v0.01.000 es un ajuste fino (SFT) del modelo orcarouter/LFM3-1.7B-abliterated, publicado por el usuario balllvin en Hugging Face. Se trata de un modelo de generacion de texto de aproximadamente 1.730 millones de parametros, orientado especificamente a tareas de agente y tool calling, entrenado sobre el dataset nvidia/Nemotron-SFT-Agentic-v4. El prefijo "LFM3" lo vincula a la familia Liquid Foundation Models de Liquid AI, si bien esta ficha solo puede confirmar lo que figura en la informacion disponible del repositorio.

El modelo parte de una variante "abliterated", es decir, una version del modelo base a la que se le ha eliminado (o atenuado) el mecanismo de rechazo, lo que condiciona fuertemente su comportamiento y sus riesgos. Sobre esa base se aplica un ajuste supervisado con datos agenticos, buscando mejorar la capacidad de invocar herramientas y ejecutar razonamientos de varios pasos en entornos automatizados.

Su relevancia actual radica en el interes creciente por modelos pequenos (sub-2B) capaces de actuar como agentes ligeros desplegables en hardware modesto. No obstante, se trata de una version v0.01.000 de un autor individual, con acceso restringido (gated) y escasa validacion publica: no hay benchmarks publicados ni datos de rendimiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetada como "lfm3" con codigo personalizado, custom_code) |
| Parametros totales | 1.728.801.536 (~1,73 mil millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo con safetensors; se menciona compatibilidad MLX) |
| Idiomas soportados | en (segun tags del repositorio; no se detallan mas idiomas) |
| Licencia | lfm1.0 (etiquetada como "other" en los tags) |
| Formato de pesos | safetensors (libreria transformers, con custom_code; menciones a MLX) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas del repositorio: se identifica como "lfm3", requiere codigo personalizado (custom_code) para cargarse con transformers y deriva de orcarouter/LFM3-1.7B-abliterated, que a su vez procede de la familia Liquid Foundation Models. No se especifica si emplea atencion estandar, atencion lineal u otro esquema hibrido, ni la composicion exacta de capas. El numero de parametros (1.728.801.536) es el unico dato estructural confirmado.

En cuanto al entrenamiento, el modelo se ha sometido a un ajuste supervisado (SFT) sobre el dataset nvidia/Nemotron-SFT-Agentic-v4, orientado a comportamiento agentico y tool calling. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni hiperparametros. La base "abliterated" implica una modificacion previa del modelo original para reducir los comportamientos de rechazo, lo que constituye una innovacion tecnica relevante pero tambien una fuente de riesgo.

## Capacidades

- Generacion de texto conversacional en ingles (tag "conversational", idioma "en").
- Tool calling / function calling, reforzado por el ajuste sobre datos agenticos (Nemotron-SFT-Agentic-v4).
- Razonamiento multi-paso orientado a agentes, segun la finalidad declarada del ajuste.
- Capacidad de ejecucion como agente en pipelines automatizados (tags "agent", "tool-calling").
- Compatibilidad con endpoints (tag "endpoints_compatible").
- Soporte de inferencia en MLX (tag "mlx"), orientado a hardware Apple Silicon.
- Comportamiento "abliterated": ausencia o atenuacion de rechazos, lo que amplia el rango de respuestas pero elimina salvaguardas.
- Capacidades de vision, audio o thinking mode: no disponibles en la informacion proporcionada.

## Casos de uso

- Automatizacion de agentes ligeros en local: con ~1,73B de parametros, el modelo puede desplegarse en equipos de consumo y ejecutar bucles de razonamiento con invocacion de herramientas en tareas de automatizacion domestica o de laboratorio.
- Prototipado de pipelines de tool calling: util para validar rapidamente esquemas de function calling en entornos de desarrollo antes de migrar a modelos mayores, gracias a su tamano reducido y su ajuste especifico en datos agenticos.
- Asistentes de linea de comandos: integrable como motor de un CLI que traduzca instrucciones en lenguaje natural a llamadas a herramientas del sistema (ficheros, APIs, shell), con latencia baja por su tamano.
- Investigacion sobre alineacion y seguridad: al ser una variante abliterated, sirve como caso de estudio para analizar el efecto de eliminar los rechazos en modelos pequenos y su impacto en tareas agenticas.
- Evaluacion de datasets agenticos: permite reproducir y comparar el efecto del dataset Nemotron-SFT-Agentic-v4 sobre una base LFM3, como referencia para experimentos de SFT.
- Despliegue en Apple Silicon: gracias al tag MLX, puede ejecutarse en Macs con memoria unificada para tareas de generacion y agentes sin GPU dedicada.
- Generacion de texto en ingles para tareas de extraccion y clasificacion: su tamano permite procesar lotes en CPU/GPU modestas, aunque sin datos de contexto confirmados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, aproximadamente 3,5 GB solo para pesos (1,73B x 2 bytes); en cuantizacion de 8 bits, ~1,7 GB; en 4 bits, ~0,9 GB, mas overhead de contexto y runtime.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 con contexto moderado (RTX 3060/4060, RTX 4090, A100, H100). Para cuantizaciones de 4-8 bits, GPUs de 4-8 GB pueden ser suficientes.
- Cabe en GPU de consumo: si, en RTX 3060, RTX 4060, RTX 4090 y similares; tambien en Apple Silicon via MLX.
- Opciones de despliegue: transformers (requiere custom_code), potencialmente llama.cpp/Ollama si se generan pesos GGUF (no confirmado), vLLM/TGI no confirmados; MLX para Apple Silicon; endpoints compatibles segun tag.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-Agent-v0.01.000 | ~1,73B | no disponible | Agente / tool calling (SFT) | lfm1.0 | Gated en HF |
| orcarouter/LFM3-1.7B-abliterated (base) | ~1,73B | no disponible | Base abliterated | no disponible | HF |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32K (segun documentacion publica del modelo) | Instruct general | Apache 2.0 (segun su publicacion) | Abierto en HF |
| SmolLM2-1.7B-Instruct | ~1,7B | 8K (segun documentacion publica del modelo) | Instruct general | Apache 2.0 (segun su publicacion) | Abierto en HF |

Nota: los datos de contexto y licencia de los modelos comparativos corresponden a su documentacion publica habitual; los del modelo objeto de esta ficha se limitan a lo indicado en la informacion disponible. No se dispone de comparativas de rendimiento por ausencia de benchmarks.

## Limitaciones y advertencias

- Modelo "abliterated": la eliminacion de rechazos implica ausencia de salvaguardas de seguridad, con riesgo de generar contenido danino, ilegal o inseguro sin filtros.
- Riesgo elevado de alucinacion por su tamano reducido (~1,73B) y por la falta de validacion publica.
- Idiomas: solo se declara ingles ("en"); el rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Longitud de contexto desconocida: no apto para tareas que requieran ventanas largas sin verificacion previa.
- Licencia "lfm1.0" (etiquetada como "other"): es necesario revisar los terminos exactos antes de cualquier uso comercial; pueden existir restricciones derivadas de la familia LFM.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita su distribucion automatica.
- Version v0.01.000 de un autor individual: sin garantias de mantenimiento, soporte ni reproducibilidad; los resultados pueden diferir de lo esperado.
- Requiere custom_code para cargarse en transformers, lo que anade complejidad y posibles incompatibilidades con herramientas de despliegue estandar.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su calidad en tool calling ni en razonamiento multi-paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/balllvin/LFM3-1.7B-Agent-v0.01.000
- Modelo base: https://huggingface.co/orcarouter/LFM3-1.7B-abliterated
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Agentic-v4
- No se han encontrado en la informacion disponible papers, blogs, repositorios ni demos adicionales.
