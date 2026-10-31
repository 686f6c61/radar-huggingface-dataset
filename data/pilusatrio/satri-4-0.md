# PILUSATRIO/satri-4.0

## Resumen

SATRI-4.0 es un modelo de generación de texto conversacional desarrollado por el usuario independiente Pilus (PILUSATRIO). No es un modelo desde cero, sino una adaptación parameter-efficient (rsLoRA con rango 64 y alpha 128 sobre todas las capas lineales) del modelo Qwen/Qwen3-4B, que fusiona mediante TIES merging cuatro adaptadores especializados en dominios distintos: lengua y cultura indonesia, razonamiento matemático y científico, programación (Python/SQL/web) y tool calling en formato JSON. El resultado es un modelo ligero (0,1 GB de adaptador) orientado a tareas en indonesio e inglés con soporte de llamadas a herramientas.

Su relevancia radica en demostrar cómo combinar especialistas PEFT con técnicas como NEFTune, curriculum de auto-reparación multi-turno y mapeo de honestidad (T2e) sobre un modelo base compacto, sin reentrenar los 4B parámetros completos. El modelo hereda de Qwen3-4B una arquitectura transformer de 36 capas con GQA (32 cabezas de consulta, 8 de clave-valor) y una ventana de contexto de 32.768 tokens. Se distribuye bajo licencia Apache-2.0 en formato safetensors vía la librería PEFT, y sus resultados publicados se apoyan en un conjunto de evaluación propio de tamaño reducido, por lo que deben interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3-4B), 36 capas, GQA 32 cabezas Q / 8 cabezas KV, con adaptador rsLoRA (r=64, alpha=128, all-linear) fusionado vía TIES |
| Parametros totales | ~4.000 millones (base Qwen3-4B) + adaptador PEFT (repo de 0,1 GB) |
| Parametros activos | no disponible (no es MoE; todos los parámetros activos) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible (solo pesos del adaptador en fp16; sin GGUF publicado) |
| Idiomas soportados | Indonesio (id), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador PEFT sobre Qwen3-4B) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-4B, un transformer decoder de 36 capas con atención agrupada de consultas (GQA, 32 cabezas de consulta y 8 de clave-valor) y contexto nativo de 32.768 tokens. Sobre él se entrenan cuatro adaptadores rsLoRA (r=64, alpha=128, factor de escala alpha/sqrt(r)=16,0) que cubren todas las matrices lineales del modelo, con regularización NEFTune (ruido alpha=5,0) durante el entrenamiento en fp16 sin incidentes de NaN/inf.

Los cuatro especialistas (indonesio/cultura Nusantara, matemáticas/lógica/ciencia, programación y tool calling JSON) se fusionan después mediante TIES merging uniforme en 36 capas. El curriculum de entrenamiento incluye Multi-Turn Execution-Feedback con Self-Repair y selective loss masking (labels = -100 en los turnos iniciales incorrectos), además del esquema de honestidad T2e, que clasifica los hechos en known, maybe_known y unknown para que el modelo declare su ignorancia en lugar de alucinar. El autor descartó explícitamente DoRA, Step-DPO, DE-LA merging estratificado y destilación on-policy (OPD/OPSD) tras evaluación comparativa, y mantuvo ScPO + RFT para respuestas más concisas. No se especifican el número de tokens de entrenamiento ni la composición detallada del dataset. No hay indicios de RLHF clásico ni DPO aplicados al modelo final.

## Capacidades

- Generación de texto conversacional en indonesio e inglés, con conocimiento de historia y cultura de Indonesia.
- Razonamiento matemático, lógico y científico con pasos verificados (especialista B).
- Generación de código Python, SQL y algoritmos, además de diseño de interfaces web (HTML/CSS/JS responsivas con contraste WCAG AA).
- Tool calling estructurado en formato JSON `<tool_call>` para las herramientas `generate_image`, `run_python` y `search_docs`, con 100% de validez de esquema reportada.
- Integración de documentos vía Hybrid RAG cuando se acompaña del runtime SATRI-Runtime v2 (componente de sistema, no del modelo puro).
- Ejecución de código en sandbox `run_python` con bloqueo de escapes (capacidad del sistema runtime).
- Comportamiento honesto ante preguntas fuera de su conocimiento gracias al mapeo T2e.
- Respuestas más concisas que el baseline: media de 292,6 tokens por respuesta en TEST frente a 321,2 del Qwen3-4B base.
- Cumplimiento de identidad de marca (responde correctamente que es SATRI-4.0 de Pilus en el 100% de los casos evaluados).

## Casos de uso

- **Asistentes conversacionales en indonesio**: el especialista A está afinado para lengua indonesia, historia y cultura del archipiélago, con seguimiento de instrucciones en capas, adecuado para chatbots culturales o educativos locales.
- **Agentes con llamadas a herramientas**: el especialista D genera tool calls JSON con esquema válido al 100% en las pruebas del autor, lo que permite integrarlo en pipelines de agentes que invoquen búsqueda documental, generación de imágenes o ejecución de Python.
- **Generación de código asistida**: puede producir Python, SQL y frontends web accesibles (WCAG AA), útil para prototipado rápido de consultas de datos y páginas responsivas en entornos con GPU limitada.
- **Razonamiento matemático y científico paso a paso**: el especialista B genera cadenas de razonamiento con pasos verificados, apropiado para tutores educativos o verificación de cálculos.
- **RAG sobre documentación privada**: combinado con SATRI-Runtime v2 y Hybrid RAG, responde preguntas ancladas en documentos y rechaza responder cuando no hay evidencia (100% de rechazo honesto en el test de 50 consultas sin respuesta).
- **Despliegue en hardware modesto**: al ser un adaptador PEFT sobre un modelo de 4B, puede cargarse sobre Qwen3-4B en GPUs de consumo, útil para equipos sin acceso a aceleradores de datacenter.
- **Reducción de verbosidad en producción**: el curriculum ScPO + RFT recorta la longitud media de respuesta un 8,9% respecto al baseline, relevante para reducir coste de tokens en APIs.

## Benchmarks y rendimiento

Los datos siguientes proceden de la model card del autor y corresponden a conjuntos de evaluación propios (DEV de 15 preguntas, TEST de 16, y 60 tareas verificables), no a benchmarks públicos estándar como MMLU o GSM8K, por lo que no son directamente comparables con otros modelos.

| Evaluacion | Qwen3-4B base | SATRI-4.0 (modelo polvo) | SATRI-4.0 + Runtime v1 | SATRI-4.0 + Runtime v2 |
|---|---|---|---|---|
| Set DEV (15 preguntas) | 100,00% | 100,00% | 100,00% | 100,00% |
| Set TEST (16 preguntas) | 93,75% | 93,75% | 93,75% | 100,00% |
| 60 tareas verificables (código/mates/JSON/QA) | no disponible | 71,67% | 86,67% | 96,67% |
| Hybrid RAG (grounded / rechazo honesto) | no disponible | no disponible | no disponible | 92,0% / 100,0% |
| Sandbox run_python (escapes bloqueados / válidos) | no disponible | no disponible | no disponible | 100,0% / 100,0% |
| Needle-in-a-haystack 32k | 95,00% | 95,00% | 95,00% | 95,00% |
| Validez de esquema JSON `<tool_call>` | 85,00% | 100,00% | 100,00% | 100,00% |
| Tokens medios por respuesta (TEST) | 321,2 | 292,6 | 285,0 | 264,0 |

No se han publicado resultados en benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con modelos de terceros.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador PEFT de 0,1 GB sobre Qwen3-4B, la inferencia requiere aproximadamente la VRAM del modelo base: en torno a 8-9 GB en fp16/bf16 y unos 3-4 GB con cuantización de 4 bits del base (no hay cuantizaciones oficiales publicadas).
- GPUs recomendadas: una RTX 3060 de 12 GB, RTX 4060 Ti 16 GB o RTX 4090 son suficientes para fp16; en datacenter, cualquier GPU con 16 GB o más (A10G, L4, A100) funciona sin problema.
- Cabe holgadamente en GPUs de consumo modernas de 12 GB o más en precisión completa; en 8 GB sería necesario cuantizar el modelo base por cuenta del usuario.
- Opciones de despliegue: al ser un adaptador PEFT, se carga con la librería `peft` de Hugging Face sobre `Qwen/Qwen3-4B` (transformers, vLLM con soporte LoRA, TGI). No hay pesos GGUF publicados, por lo que llama.cpp y Ollama no son viables directamente sin conversión propia.
- Latencia y throughput: no disponibles; al no añadir parámetros activos significativos, el rendimiento esperado es similar al de Qwen3-4B base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| SATRI-4.0 | ~4B + adaptador LoRA | 32.768 | Apache-2.0 | Safetensors (PEFT) | Especialistas fusionados: indonesio, código, mates, tool calling |
| Qwen/Qwen3-4B (base) | 4B | 32.768 | Apache-2.0 | Safetensors | Modelo generalista multilingüe de Qwen |
| Qwen/Qwen3-1.7B | 1,7B | no disponible | Apache-2.0 | Safetensors | Versión anterior del proyecto (SATRI-1B se basó en él) |

SATRI-4.0 se diferencia del base en su especialización en indonesio y tool calling verificado, a costa de un alcance de evaluación mucho más reducido y sin benchmarks públicos que respalden mejoras generales.

## Limitaciones y advertencias

- Los resultados de evaluación provienen de conjuntos propios muy pequeños (15-60 preguntas) creados por el propio autor, con riesgo de sobreajuste a esos tests y sin validación independiente.
- No hay benchmarks estandarizados (MMLU, GSM8K, HumanEval), por lo que el rendimiento general frente a otros modelos de 4B es desconocido.
- El modelo está orientado a indonesio e inglés; el rendimiento en castellano u otros idiomas no está evaluado y probablemente sea el heredado del base sin garantías.
- Las capacidades de RAG, sandbox de Python y auto-reparación pertenecen al sistema SATRI-Runtime v2, no al modelo puro: desplegar solo los pesos no reproduce esos resultados.
- Solo 24 descargas y 1 like en el momento de la ficha: proyecto con adopción mínima y sin comunidad de revisión.
- No hay pesos GGUF ni cuantizaciones oficiales, lo que limita el despliegue en CPU y en herramientas como llama.cpp u Ollama.
- Riesgo de alucinación mitigado por el esquema T2e según el autor, pero sin evaluación externa que lo confirme.
- Licencia Apache-2.0: sin restricciones relevantes para uso comercial, aunque conviene respetar la licencia del modelo base Qwen3-4B.
- Las herramientas soportadas (`generate_image`, `run_python`, `search_docs`) son específicas del ecosistema del autor; la integración con otros frameworks de agentes requeriría adaptación.

## Enlaces

- Modelo: https://huggingface.co/PILUSATRIO/satri-4.0
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Colección de adaptadores: https://huggingface.co/PILUSATRIO/satri-4b-adapters
- Generación anterior (referencia): https://huggingface.co/PILUSATRIO/satri-1b
- Paper, blog o demo: no disponible
