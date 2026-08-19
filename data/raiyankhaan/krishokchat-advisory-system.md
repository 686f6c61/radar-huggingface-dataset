# RaiyanKhaan/KrishokChat-Advisory-System

## Resumen
KrishokChat es un sistema integral de asesoramiento agrícola y diagnóstico de enfermedades de cultivos diseñado específicamente para el ecosistema agrícola de Bangladesh. No se trata de un único modelo, sino de una suite completa que combina un modelo de lenguaje (LLM) basado en Gemma de 7.500 millones de parámetros, afinado mediante LoRA, con un pipeline de visión por computadora basado en Ultralytics YOLOv8 y un sistema de recuperación aumentada por generación (RAG) híbrido que integra FAISS (denso) y BM25 (disperso). El repositorio incluye los pesos afinados, los índices de conocimiento y los mapas de asesoramiento estructurado, todo ello con trazabilidad de procedencia.

La relevancia actual de este proyecto radica en su enfoque multidisciplinar y su orientación a un dominio muy concreto: la agricultura bengalí. Incluye normalización de dialectos regionales (Barisal, Chittagong, Sylhet, entre otros), mapas de conocimiento de enfermedades y remedios, y un sistema de verificación de cobertura. El modelo está pensado para funcionar en entornos de producción con limitaciones de hardware, ya que proporciona un GGUF en f16 de solo 1,29 GB para el LLM y modelos de visión de entre 3 y 12 MB.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Gemma (LLM base) + YOLOv8 (visión) + RAG híbrido (FAISS + BM25) |
| Parametros totales | 7.518.069.290 (base LLM) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF f16 (proporcionado), otros formatos no especificados |
| Idiomas soportados | bn (bengalí), en (inglés) |
| Licencia | MIT (repositorio), con caveat sobre la licencia del modelo base Gemma |
| Formato de pesos | safetensors (adaptador LoRA), GGUF (LLM), .pt (modelos YOLO) |

## Arquitectura y entrenamiento
El componente LLM se basa en el modelo Gemma de Google, afinado mediante LoRA (adaptador de 266,2 MB, checkpoint 4020) para el dominio agrícola bengalí. El tokenizador es una extensión bengalí de SentencePiece (30,68 MB) que permite manejar el vocabulario agrícola local. El pipeline de visión implementa un clasificador jerárquico de dos etapas: primero un clasificador raíz de 9 cultivos (brassica, maíz, patata, arroz, trigo, solanáceas, etc.) y después un clasificador especializado por cultivo para detectar enfermedades específicas (tizón del arroz, roya del trigo, etc.). El sistema RAG combina embeddings densos de BGE-M3 (1024 dimensiones) indexados con FAISS y un índice disperso BM25 Okapi, sobre un corpus de 2.135 nodos de conocimiento limpios provenientes de fuentes oficiales como BARC, BARI, BRRI, CABI y DAE. Se incluye un mapa de normalización de dialectos para seis regiones de Bangladesh.

## Capacidades
- Generación de texto conversacional en bengalí e inglés orientado a asesoramiento agrícola.
- Detección de enfermedades de cultivos mediante visión por computadora (YOLOv8) con clasificación jerárquica de cultivo y enfermedad.
- Recuperación aumentada por generación (RAG) híbrida (densa + dispersa) para respuestas fundamentadas en fuentes oficiales.
- Normalización de dialectos regionales bengalíes para mejorar la comprensión de consultas rurales.
- Soporte de conversaciones multi-turno mediante plantilla de chat Jinja2.
- Mapeo estructurado de enfermedades a remedios y dosis de pesticidas (advisory_engine).
- Trazabilidad de procedencia: manifiestos que auditan la relación entre literatura, nodos de conocimiento y respuestas generadas.

## Casos de uso
- Diagnóstico de enfermedades en campo: un agricultor fotografía una hoja de arroz; el clasificador YOLO identifica la especie y la enfermedad (p. ej., añublo bacteriano) y devuelve síntomas y remedios desde el mapa de conocimiento.
- Chatbot de asesoramiento agrícola en bengalí: el LLM afinado con LoRA responde consultas sobre siembra, riego y fertilización, apoyándose en el índice RAG para citar fuentes de BARI o BRRI.
- Recomendación de pesticidas y dosis: el motor de asesoramiento estructurado (`disease_knowledge_map.json`) permite consultar el producto químico adecuado y la dosificación exacta para una plaga concreta.
- Normalización de consultas dialectales: un agricultor de Sylhet escribe en su dialecto local; el mapa de dialectos normaliza la consulta antes de pasarla al LLM y al RAG.
- Formación y extensión agrícola: los técnicos de extensión pueden usar el sistema para generar material educativo verificado y adaptado al contexto local.
- Auditoría de conocimiento: los manifiestos de procedencia permiten a investigadores rastrear qué documento oficial sustenta cada respuesta, útil para validar la calidad del asesoramiento.
- Integración en aplicaciones móviles de bajo consumo: el GGUF f16 de 1,29 GB permite desplegar el LLM en dispositivos con recursos limitados, mientras los modelos de visión de pocos MB se ejecutan en tiempo real.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye los archivos `verification_report.json` y `verification_report_live.md` que contienen precisiones de los modelos de visión y salidas de validación, pero sus valores numéricos no se detallan en la documentación proporcionada. Tampoco se aportan métricas estándar (MMLU, HumanEval, GSM8K) para el LLM.

## Requisitos de hardware
- El GGUF f16 del LLM pesa 1,29 GB, por lo que cabe en memoria RAM de cualquier ordenador moderno, aunque la inferencia en CPU será lenta para un modelo de 7B.
- Para una inferencia fluida del LLM se recomienda una GPU con al menos 12 GB de VRAM (p. ej., RTX 3060 12GB, RTX 4070, RTX 4090) si se usa el GGUF f16. Con cuantizaciones inferiores (q4_k_m, q8_0) generadas a partir del base Gemma, bastaría con 6-8 GB.
- Los modelos de visión YOLO pesan entre 3 y 12 MB, por lo que pueden ejecutarse en cualquier GPU o incluso en CPU para inferencia por lotes.
- Opciones de despliegue: llama.cpp y Ollama para el GGUF; vLLM o TGI pueden cargar el adaptador LoRA sobre el modelo base Gemma; los modelos de visión se integran vía Ultralytics.
- La latencia estimada no está publicada; dependerá del hardware y de si se activa la recuperación RAG, que añade una búsqueda FAISS y BM25 por consulta.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| KrishokChat (este repo) | 7,5B (base) + LoRA | no disponible | Agricultura bengalí + visión + RAG | MIT (repo) / Gemma (base) | GGUF, safetensors, .pt |
| Gemma-7B (base, sin afinado) | 7,5B | 8192 (típico) | Generalista | Gemma Terms of Use | safetensors, GGUF |
| Llama-3.1-8B (base) | 8B | 131072 | Generalista | Llama 3.1 Community License | safetensors, GGUF |

La comparativa es estructural: KrishokChat añade una capa de visión y un sistema RAG con normalización dialectal que ningún modelo generalista ofrece. Sin embargo, al no publicarse benchmarks, no es posible comparar numéricamente su rendimiento en tareas agrícolas frente a un Gemma base o un Llama afinado para el mismo dominio.

## Limitaciones y advertencias
- El ámbito está restringido a la agricultura de Bangladesh; consultas fuera de este dominio (medicina humana, finanzas, etc.) producirán respuestas no fiables.
- El corpus RAG se limita a 2.135 nodos de conocimiento; el propio repositorio incluye un `coverage_gaps_v1.json` que audita las lagunas de cobertura, lo que indica que hay temas sin cubrir.
- La normalización de dialectos solo contempla seis regiones (Barisal, Chittagong, Sylhet, etc.), por lo que otros dialectos o variantes no están soportados.
- Riesgo de alucinación inherente al modelo base Gemma; aunque el RAG mitiga parcialmente el problema, no lo elimina por completo.
- La licencia MIT se aplica a los pesos del adaptador y al código del repositorio, pero el modelo base Gemma está sujeto a la Licencia de Gemma de Google, que puede imponer restricciones adicionales para uso comercial.
- No se proporcionan resultados de benchmarks cuantitativos, lo que dificulta evaluar la calidad real del asesoramiento frente a alternativas.
- El repositorio no incluye el modelo base Gemma completo, solo el adaptador LoRA; para desplegarlo es necesario descargar el base por separado.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/RaiyanKhaan/KrishokChat-Advisory-System
- Estructura interna del repositorio: incluye `vision/` (modelos YOLO), `gemma_llm/` (adaptador LoRA y GGUF), `rag_knowledge_index/` (índices FAISS y BM25) y `advisory_engine/` (mapas de conocimiento). No se proporcionan enlaces externos a papers, blogs o demos en la documentación disponible.
