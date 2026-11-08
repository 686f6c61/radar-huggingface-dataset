# KATHIR2006/Zenith-4B

## Resumen

Zenith-4B es un modelo publicado en Hugging Face por el usuario KATHIR2006 (identificado en la model card como "Kathir / Zenith AI") bajo licencia Apache-2.0. Se presenta como un modelo fundacional multimodal (vision-language) orientado a síntesis de código, extracción estructurada de documentos y comprensión de diagramas. Según los pesos reales en safetensors, el modelo contiene 3.085.938.688 parámetros, aunque la model card lo describe como una arquitectura de "4.02B parámetros"; el modelo base declarado es Qwen/Qwen2.5-3B-Instruct.

La propuesta del autor es un fine-tuning multi-adaptador sobre el modelo base de Qwen, con tres adaptadores de dominio (código, extracción documental y visión) fusionados mediante la técnica TIES (Trim, Elect Sign and Merge). El repositorio incluye pesos en safetensors, un proyector multimodal en formato GGUF (`mmproj-zenith-4b.gguf`) y soporte declarado para despliegue local con Ollama en menos de 3,5 GB de VRAM.

La relevancia del modelo es limitada y debe interpretarse con cautela: no tiene descargas ni interacciones en el momento de la consulta, la model card contiene afirmaciones no verificables de forma independiente (benchmarks propios, "firmas criptográficas", atribución a un "Qwen 3.5-4B" que no coincide con el modelo base declarado en los metadatos) y los resultados publicados provienen exclusivamente del autor. Es útil como caso de estudio de fusión de adaptadores con TIES sobre un modelo pequeño, no como una alternativa consolidada a modelos multimodales de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), activación SwiGLU, RoPE theta = 1.000.000, con proyector multimodal externo |
| Parametros totales | 3.085.938.688 (pesos safetensors); la model card declara 4.02B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (según model card) |
| Tipos de cuantizacion | GGUF (proyector multimodal en GGUF); no se detallan niveles concretos (Q4, Q8, etc.) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (2 shards), GGUF (proyector `mmproj-zenith-4b.gguf`), tokenizer BPE (tokenizer.json, vocab.json, merges.txt) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder-only con activación SwiGLU y RoPE. Sobre esa base, el autor aplica un entrenamiento multi-adaptador desacoplado en tres dominios: un adaptador de código (750 pasos, pérdida final 0,5486), un adaptador de extracción documental (625 pasos, 5.000 muestras de documentos/HTML, pérdida final 1,461) y un adaptador de visión (500 pasos, 4.000 muestras multimodales de alta resolución, pérdida final 0,1725). Los tres adaptadores se fusionan en los pesos base mediante TIES (Trim, Elect Sign and Merge), una técnica de merging que recorta parámetros de baja magnitud, elige el signo mayoritario por coordenada y promedia los valores restantes.

La componente multimodal se implementa mediante un proyector externo (`mmproj-zenith-4b.gguf`, 644 MB) que proyecta características de un codificador visual al espacio de embeddings del LLM. La model card menciona "POLAR-FLASH thermal stabilization" como técnica de entrenamiento, sin más detalle técnico ni referencia publicada. No se especifican el número total de tokens de entrenamiento, la composición completa del dataset, ni si hubo RLHF o DPO adicionales sobre el modelo base.

## Capacidades

- Generación de texto y razonamiento general, heredados de Qwen2.5-3B-Instruct.
- Síntesis de código: el autor reporta una tasa de paso de tests unitarios del 100% en problemas algorítmicos tipo LeetCode en su evaluación interna.
- Extracción estructurada de documentos: generación de JSON a partir de documentos y HTML, con un adaptador específico entrenado sobre 5.000 muestras.
- Comprensión de imágenes y diagramas mediante el proyector multimodal: análisis de topología de diagramas y grounding visual según la model card.
- Soporte de conversación multi-turno y plantilla de chat (`chat_template.jinja`).
- Capacidades de agente y flujos multi-paso: la model card lo describe como "agentic foundation model", aunque no se documentan herramientas concretas ni formato de tool calling.
- Multilingüe: limitado a inglés según los metadatos.

## Casos de uso

- Extracción de datos de documentos: el adaptador de extracción, entrenado sobre documentos y HTML, permitiría convertir páginas o PDFs en JSON estructurado; adecuado para pipelines de ingesta donde se requiere salida estricta.
- Generación de código en prototipado: el modelo puede producir funciones y scripts en Python para tareas de automatización; útil en entornos locales con recursos limitados por su tamaño de 3B.
- Análisis de diagramas de arquitectura: con el proyector multimodal, se podría usar para describir diagramas técnicos o extraer relaciones entre componentes en documentación de sistemas.
- Asistente local en dispositivos de gama baja: su tamaño permite ejecución en GPUs de consumo con cuantización, útil para demos y entornos sin acceso a la nube.
- Automatización de workflows de scraping: combinado con el adaptador de extracción, puede generar y ejecutar lógica de extracción sobre páginas web en pipelines de agentes.
- Experimentación con técnicas de model merging: sirve como caso práctico para estudiar la fusión TIES de adaptadores de dominio sobre un modelo base pequeño.
- Procesamiento de documentación técnica con contexto largo: la ventana declarada de 32.768 tokens permitiría resumir o extraer información de documentos extensos en una sola pasada.

## Benchmarks y rendimiento

Los únicos datos disponibles provienen de la model card del autor y no han sido verificados de forma independiente. La comparación se realiza contra un "Base Qwen3.5-4B" que no coincide con el modelo base declarado en los metadatos (Qwen2.5-3B-Instruct), lo que resta fiabilidad a la comparativa.

| Metrica | Base declarado | Zenith-4B | Delta |
|---|---|---|---|
| Razonamiento lógico y Gen AI | 43,33% | 43,33% | Paridad |
| OCR y extracción documental | 16,67% | 77,78% | +61,11% |
| Coding (tests unitarios) | 0,00% | 100,00% | +100,00% |
| Validez sintáctica AST (código) | 100,00% | 100,00% | Sin cambio |
| Análisis de imágenes y diagramas | 66,67% | 100,00% | +33,33% |
| Puntuación compuesta | 31,67% | 80,28% | +48,61% |
| Throughput | 61,37 tok/s | 84,08 tok/s | +37,0% |
| Latencia total del benchmark | 78,22 s | 24,76 s | 3,15x más rápido |

No se especifican los conjuntos de evaluación, el tamaño de las muestras ni el hardware utilizado, por lo que estos números deben tratarse como indicativos del autor y no como resultados reproducibles.

## Requisitos de hardware

- VRAM estimada: el autor declara inferencia local en menos de 3,5 GB de VRAM, lo que corresponde a cuantización de 4 bits sobre los ~3,1B parámetros. En FP16, los pesos safetensors ocupan aproximadamente 6,2 GB.
- El proyector multimodal en GGUF añade unos 644 MB adicionales cuando se usa la ruta de visión.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría en GPUs de consumo con 8 GB o más en FP16 (RTX 3060 Ti, RTX 4060, RTX 4070) y en 4-6 GB con cuantización.
- Despliegue: se documenta Ollama (`ollama run zenith-4b:latest`) y Transformers con `device_map="auto"`. No se mencionan vLLM, TGI ni llama.cpp de forma explícita, aunque el formato GGUF sugiere compatibilidad con llama.cpp.
- Latencia y throughput: el autor reporta 84,08 tok/s y 24,76 s de latencia total en su benchmark, sin especificar hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| Zenith-4B | 3,09B (declara 4,02B) | 32.768 | Apache-2.0 | Sí (proyector GGUF) | Hugging Face, 0 descargas |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 | Apache-2.0 | No | Hugging Face, ampliamente usado |
| Qwen2.5-VL-3B-Instruct | ~3B | 32.768 (extensible) | Apache-2.0 | Sí (nativo) | Hugging Face, con soporte de frameworks |
| Llama-3.2-3B-Instruct | 3,21B | 128.000 | Llama 3.2 Community License | No | Hugging Face, ecosistema amplio |

La comparación directa con Qwen2.5-VL-3B es la más relevante: ambos son modelos de ~3B con capacidad visual y licencia permisiva, pero Qwen2.5-VL cuenta con validación independiente, integración en frameworks y benchmarks públicos, mientras que Zenith-4B carece de verificación externa. No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Los benchmarks publicados son internos, no reproducibles y comparan contra un modelo base distinto del declarado en los metadatos, lo que genera inconsistencias.
- La model card atribuye el modelo a "Qwen 3.5-4B", una denominación que no corresponde al modelo base real (Qwen2.5-3B-Instruct) ni a una familia publicada conocida.
- El repositorio tiene 0 descargas y 0 interacciones, sin validación por parte de la comunidad.
- El modelo solo declara soporte de inglés; el rendimiento en castellano no está evaluado.
- Riesgo de alucinación inherente a un modelo de 3B, especialmente en extracción documental donde el autor afirma "zero-hallucination" sin evidencia independiente.
- No se documentan sesgos, datos de entrenamiento completos ni procesos de alineación adicionales (RLHF/DPO).
- La licencia Apache-2.0 permite uso comercial, pero la falta de validación externa desaconseja su uso en producción sin evaluación propia.
- El soporte multimodal depende de un proyector GGUF externo; no se detalla la integración con Transformers para visión ni el codificador visual utilizado.
- La "firma HMAC-SHA256" y los checksums de la model card no constituyen una auditoría de seguridad ni garantizan la integridad del contenido más allá de los ficheros listados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KATHIR2006/Zenith-4B
- Perfil del autor en Hugging Face: https://huggingface.co/KATHIR2006/models
- Repositorio GitHub del autor: https://github.com/ELANGKATHIR11/Zenthi-AI
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Otro modelo del autor (Zenthi-AI): https://huggingface.co/KATHIR2006/zenthi-ai
