# AveroLabs/Avero-1B-Uncensored

## Resumen

Avero-1B-Uncensored es un modelo de lenguaje de 1.235.814.400 parametros (~1,23 mil millones) desarrollado por Avero Labs y publicado en Hugging Face bajo licencia Apache 2.0. Se presenta como una variante "sin censura" (uncensored) de un transformer tipo Llama, disenada para generar respuestas sin filtros de rechazo ni moralizacion. El modelo declara una ventana de contexto de 131.072 tokens (128K), un vocabulario BPE de 128.256 tokens y una arquitectura con Grouped-Query Attention (GQA) de 32 cabezas de consulta y 8 cabezas KV.

El modelo se orienta a conversacion multi-turno, razonamiento y generacion de texto largo, y su rasgo diferencial es la eliminacion de las direcciones de rechazo mediante ablacion de vectores de refusal. Con 16 capas y 2048 dimensiones ocultas, es un modelo compacto pensado para ejecucion en hardware modesto, incluido despliegue local via Ollama. La model card no documenta el proceso de entrenamiento (datos, tokens, RLHF/DPO), por lo que muchos detalles tecnicos permanecen sin confirmar.

Su relevancia actual radica en la combinacion de contexto largo (128K) con un tamano reducido y una licencia permisiva, lo que lo hace atractivo para experimentacion con modelos sin filtros en entornos controlados. No obstante, la ausencia de benchmarks publicados y de documentacion sobre el entrenamiento limita seriamente su evaluacion rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama, con GQA y RoPE |
| Parametros totales | 1.235.814.400 (~1,23 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (128K) |
| Tipos de cuantizacion | No disponible de forma explicita; se distribuyen pesos en safetensors y GGUF (cuantizaciones GGUF habituales presumibles, sin detallar) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, PyTorch |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con 16 capas, dimension oculta de 2048, red feedforward SwiGLU con tamano intermedio de 8192, normalizacion RMSNorm (epsilon 1e-5) y embeddings posicionales rotatorios (RoPE) con theta de 500.000, valor coherente con ventanas de contexto largas. La atencion usa Grouped-Query Attention con 32 cabezas de consulta y 8 cabezas KV (ratio 4:1), lo que reduce el coste de memoria del KV cache en inferencia. El vocabulario es de 128.256 tokens BPE y los pesos se distribuyen en bfloat16, float16 y float32.

El rasgo tecnico distintivo declarado es la "alineacion sin censura" mediante ablacion de vectores de rechazo y neutralizacion de direcciones de refusal, una tecnica de edicion de pesos que elimina las trayectorias internas asociadas a respuestas de negativa. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplico RLHF, DPO o fine-tuning supervisado. Tampoco se documenta la receta de entrenamiento a partir de un modelo base Llama-3.2, aunque la etiqueta "llama-3.2" sugiere una derivacion de la familia Llama 3.2 de Meta.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Razonamiento y generacion de texto largo (long-form) con contexto de hasta 128K tokens.
- Respuestas sin filtros de rechazo ni advertencias moralizantes, por diseno.
- Soporte de chat template con roles de sistema y usuario (formato tipo Llama).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso estructurado.
- No se documenta capacidad de vision, audio ni modo "thinking" explicito.
- Multilingue: solo ingles declarado.

## Casos de uso

- Experimentacion con modelos sin filtros: el modelo permite estudiar el comportamiento de un LLM tras ablacion de vectores de rechazo, comparando respuestas frente a la version alineada en tareas controladas de investigacion.
- Generacion de ficcion y narrativa adulta: su ausencia de filtros moralizantes y contexto de 128K lo hacen util para escribir relatos largos con continuidad de personajes y tramas a lo largo de capitulos.
- Prototipado rapido en local: con ~1,23 B de parametros y pesos GGUF, se puede ejecutar en portatiles y estaciones de trabajo sin GPU dedicada mediante Ollama o llama.cpp.
- Analisis de documentos extensos en ingles: la ventana de 128K permite resumir o extraer informacion de contratos, informes o articulos de decenas de miles de palabras en una sola pasada.
- Generacion de datos sinteticos para entrenamiento: puede producir grandes volumenes de texto diverso sin rechazos, util para aumentar datasets en pipelines de investigacion.
- Chatbot de dominio restringido en entornos cerrados: en despliegues internos donde el operador asume la responsabilidad del contenido, sirve como asistente conversacional ligero y de bajo coste.
- Educacion e investigacion en seguridad de IA: permite estudiar jailbreaks, sesgos y comportamientos no alineados en un modelo de tamano manejable y licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16/float16: aproximadamente 2,5 GB solo para pesos, mas el KV cache (que crece con el contexto; con GQA de 8 cabezas KV el coste por token es moderado, pero a 128K tokens puede superar varios GB).
- VRAM estimada en cuantizacion de 8 bits: ~1,3 GB para pesos; en 4 bits: ~0,7-0,8 GB.
- GPU recomendadas para uso comodo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para contextos muy largos.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con 4-8 GB de VRAM en cuantizaciones bajas; tambien en CPU.
- Opciones de despliegue: transformers (PyTorch), Ollama (soporte nativo via `ollama run hf.co/AveroLabs/Avero-1B-Uncensored`), llama.cpp con GGUF, y presumiblemente vLLM/TGI al ser compatible con endpoints (tag `endpoints_compatible`).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Avero-1B-Uncensored | ~1,23 B | 128K | Apache 2.0 | en | Sin censura, sin benchmarks publicados |
| Llama 3.2 1B (Meta) | ~1,24 B | 128K | Llama 3.2 Community License | multilingue | Base presumible; alineado con filtros; benchmarks publicados |
| Qwen2.5-1.5B | ~1,5 B | 32K | Apache 2.0 | multilingue | Mayor contexto multilingue, benchmarks publicados |
| SmolLM2-1.7B | ~1,7 B | 8K | Apache 2.0 | en | Alternativa compacta con evaluacion publica |

La comparativa se basa en caracteristicas declaradas; no hay datos de rendimiento de Avero-1B-Uncensored que permitan una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de su calidad en MMLU, HumanEval, GSM8K ni otras tareas.
- Modelo sin censura por diseno: puede generar contenido ofensivo, ilegal o danino; requiere supervision y filtrado externo en cualquier despliegue orientado al publico.
- Riesgo elevado de alucinacion: con solo 1,23 B de parametros, la capacidad de razonamiento factual es limitada y la model card no documenta mitigaciones.
- Solo ingles declarado: el rendimiento en castellano u otros idiomas no esta garantizado ni evaluado.
- Documentacion de entrenamiento inexistente: se desconocen datos, tokens, tecnicas de alineacion y posible contaminacion de benchmarks.
- La etiqueta "llama-3.2" sugiere derivacion de Meta, pero la licencia declarada es Apache 2.0; conviene verificar la compatibilidad legal de la derivacion antes de uso comercial.
- El contexto de 128K declarado no esta validado con pruebas de aguja en pajar (needle-in-a-haystack); el rendimiento real en contextos largos puede degradarse.
- La ablacion de vectores de rechazo puede degradar capacidades generales o introducir comportamientos erraticos no documentados.
- Fecha de creacion futura (2026-10-31) en los metadatos, lo que sugiere posible error de registro o republicacion; tratar los metadatos con cautela.

## Enlaces

- Hugging Face: https://huggingface.co/AveroLabs/Avero-1B-Uncensored
- Organizacion Avero Labs: https://huggingface.co/AveroLabs
