# AlexJupiter/monlam-melong-mlx-english-adapter-preview

## Resumen

Monlam Melong MLX English Adapter es un adaptador LoRA experimental de 20,6 MB en formato MLX, publicado por AlexJupiter, que se aplica sobre una conversión cuantizada a 4 bits del modelo Monlam Melong preview (TenzinGayche/Monlam_Melong_preview). Su linaje documentado es Google Gemma 2 9B → buddhist-nlp/gemma2-mitra-base → Monlam Melong preview. El adaptador no constituye un modelo completo: añade pesos adicionales y herramientas de inferencia local para modificar la selección de idioma de respuesta.

El problema que aborda es acotado: forzar respuestas en inglés en un modelo orientado al tibetano, mediante un conmutador de modo explícito. En modo inglés se activa el adaptador; en modo tibetano su contribución se anula y se usa el cómputo original del modelo base. No se trata de un asistente general en inglés ni de una mejora demostrada en generación tibetana. El autor lo describe como una vista previa de investigación sobre adaptación del idioma de respuesta.

La relevancia es limitada y muy específica: sirve para experimentación local en Macs con Apple Silicon mediante MLX, no como endpoint alojado ni como adaptador Transformers/PEFT. El contexto máximo es de 8.192 tokens y el modelo base requiere cuantización afín de 4 bits con grupo de tamaño 64 y parámetros no cuantizados en float16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder-only (linaje Gemma 2 9B), formato MLX LM |
| Parametros totales | no disponible (adaptador LoRA de 20,6 MB; base no incluida) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | 4 bits afín, grupo de tamaño 64, parámetros no cuantizados en float16 (requisito del base) |
| Idiomas soportados | inglés (en), tibetano (bo) |
| Licencia | no disponible (campo del Hub sin especificar; se aplican los términos de Gemma según el autor) |
| Formato de pesos | MLX (adaptador LoRA específico de MLX LM; no es Transformers/PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA en formato MLX LM que se carga sobre una conversión 4-bit del modelo base fijada en la revisión `663b1e876362d51324bbd4ac8e7c77fecf4f90f4`. El base se reconstruye con cuantización afín de 4 bits, grupo 64 y parámetros no cuantizados en float16; el autor verificó los 1.054 tensores convertidos contra la fuente cacheada, con valores idénticos independientemente del particionado en shards. El adaptador no incluye los pesos del base: la descarga original ronda los 18,5 GB y la conversión unos 5,2 GB adicionales.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. El mecanismo de control de idioma es un conmutador de modo en tiempo de ejecución: en inglés se carga el adaptador con `adapter_path`; en tibetano se carga el base sin adaptador o se usa `runtime.LanguageAdapter` para anular todas las contribuciones. Al cambiar de modo deben limpiarse y recalcularse las cachés KV. El runner suministrado recalcula la conversación en cada turno y la generación por defecto es greedy con hasta 384 tokens nuevos (`--max-tokens 1024` para salidas más largas). Las instrucciones de idioma deben ir en mensajes de usuario porque la plantilla de chat original de Gemma rechaza mensajes de sistema.

## Capacidades

- Generación de texto en inglés y tibetano sobre el modelo base Gemma 2 9B, con selección de idioma de respuesta mediante conmutador de modo explícito.
- Modo automático (`/auto`) basado en patrones explícitos de petición de idioma y en el sistema de escritura del prompt, no en un clasificador aprendido.
- Conversación multi-turno con contexto de hasta 8.192 tokens y recálculo de la conversación en cada turno.
- Herramientas locales de inferencia: lanzadores `English.command` y `Tibetan.command`, scripts de preparación y verificación del base (`prepare_base.py`, `--verify-only`).
- Comandos de sesión: `/en`, `/bo`, `/auto`, `/clear`, `quit`.
- No dispone de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido documentados.

## Casos de uso

- Experimentación local en Apple Silicon: ejecutar el adaptador con MLX en un Mac con memoria unificada (entorno inicial: M3 MacBook Air con 24 GB y Python 3.12) para estudiar adaptación del idioma de respuesta sin infraestructura GPU.
- Investigación sobre enrutado de idioma: comparar el comportamiento del base y del adaptador con el mismo prompt y el mismo límite de 64 tokens, usando el conjunto congelado de 50 prompts (`evaluation_cases.py`) como protocolo reproducible.
- Evaluación de preservación del tibetano: verificar que en modo tibetano las respuestas coinciden exactamente con las del modelo original, gracias a la anulación explícita de las contribuciones del adaptador.
- Pruebas de conversación bilingüe: validar secuencias inglés → tibetano → inglés con selección de idioma por turno mediante `/en`, `/bo` y `/auto`.
- Auditoría de conversiones cuantizadas: usar `prepare_base.py --verify-only --output /path/to/base` para comprobar que una conversión 4-bit existente coincide tensor a tensor con la base esperada.
- Docencia y demostración de LoRA en MLX: ilustrar el ciclo completo de descarga, preparación del base, carga del adaptador y ejecución con un adaptador de 20,6 MB sobre un modelo de 9B cuantizado.
- Pruebas de regresión de contenido: reproducir las comprobaciones de publicación documentadas (varias respuestas aritméticas que repiten la premisa, identidad no soportada, peticiones en inglés respondidas en tibetano) para medir la degradación introducida por el adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor reporta únicamente comprobaciones internas:

| Prueba | Resultado |
|---|---|
| Seis comprobaciones iniciales en inglés | de 3/6 a 6/6 respuestas en inglés |
| Seis respuestas en modo tibetano | coincidencia exacta con las salidas del modelo original |
| Conversación inglés → tibetano → inglés | idioma solicitado en los tres turnos |
| Conjunto congelado de publicación | 50 prompts (30 objetivo inglés, 20 objetivo tibetano), límite de 64 tokens, mismas condiciones para base y adaptador |
| Métrica del conjunto congelado | heurística de selección de sistema de escritura; no mide fluidez, calidad del tibetano, precisión de traducción ni corrección factual |

Los prompts de las seis comprobaciones iniciales se usaron durante el desarrollo y la selección del adaptador, por lo que no constituyen un benchmark general imparcial.

## Requisitos de hardware

- VRAM/memoria: el base original pesa aproximadamente 18,5 GB y la conversión 4-bit aproximadamente 5,2 GB; el adaptador añade 20,6 MB. Entorno de referencia: Apple M3 MacBook Air con 24 GB de memoria unificada.
- GPU recomendadas: no se documentan GPU NVIDIA; el formato es MLX, orientado a Apple Silicon. Para el base en otros entornos no hay datos disponibles.
- GPU de consumo: cabe en Macs con memoria unificada suficiente para alojar la conversión 4-bit (unos 5,2 GB) más el runtime; no hay datos para GPUs de consumo NVIDIA con este formato.
- Despliegue: MLX LM 0.32.2 / MLX 0.32.4, con los scripts incluidos (`setup.command`, `prepare_base.py`, `English.command`, `Tibetan.command`). No es compatible como adaptador Transformers/PEFT ni como endpoint alojado; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Monlam Melong MLX English Adapter (este) | Adaptador de 20,6 MB sobre base 9B | 8.192 tokens | MLX LoRA | no disponible | Hugging Face, 0 descargas |
| TenzinGayche/Monlam_Melong_preview (base directo) | 9B (linaje Gemma 2) | no disponible | no disponible | no disponible | Hugging Face |
| buddhist-nlp/gemma2-mitra-base (linaje) | 9B (Gemma 2) | no disponible | no disponible | términos de Gemma | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Calidad de contenido deficiente reconocida por el autor: varias respuestas aritméticas repiten la premisa, el prompt de identidad produce una identidad no soportada y algunas peticiones en inglés reciben respuesta en tibetano.
- Regresión funcional: dos preguntas aritméticas que el modelo original respondía correctamente dejaron de responderse con el adaptador en inglés.
- Aplicar el adaptador de forma permanente acortó algunas respuestas en tibetano durante las pruebas de desarrollo; la preservación del tibetano depende del conmutador de modo explícito.
- El adaptador por sí solo no es una mejora demostrada para la generación en tibetano.
- El conjunto de evaluación de 50 prompts incluye peticiones entre sistemas de escritura y prompts nativos en tibetano redactados por el asistente de programación, sin revisión de hablantes fluidos; la métrica mide selección de escritura, no fluidez ni corrección.
- Licencia sin especificar en el Hub: los términos adicionales de Monlam no están confirmados y no se ha obtenido permiso separado del autor; se aplican los términos de Gemma. El uso comercial queda condicionado a esa incertidumbre legal.
- Requisito estricto de base: solo funciona con la conversión 4-bit afín, grupo 64, float16 no cuantizado, verificada tensor a tensor; otras conversiones pueden producir resultados incorrectos.
- Limitaciones de plantilla: la plantilla de chat original rechaza mensajes de sistema, por lo que las instrucciones de idioma deben ir en mensajes de usuario.
- El modo automático es heurístico (patrones y escritura del prompt), no un clasificador aprendido; conviene usar modo explícito con instrucciones ambiguas o entrecomilladas.
- Riesgo de alucinación y sesgos: no documentados de forma específica en la información disponible; el autor califica el artefacto como vista previa de investigación, no como asistente general recomendado.

## Enlaces

- Hugging Face: https://huggingface.co/AlexJupiter/monlam-melong-mlx-english-adapter-preview
- Modelo base directo: https://huggingface.co/TenzinGayche/Monlam_Melong_preview
- Estado legal (referenciado en la model card): LEGAL_STATUS.md
- Revisión de contenido (referenciada): evaluation/ASSISTANT_CONTENT_REVIEW.md
- Casos de evaluación (referenciados): evaluation_cases.py, directorio evaluation/
- Procedencia y huella del base (referenciados): provenance.json, base_fingerprint.json
- Documentación de la CLI de Hugging Face: https://huggingface.co/docs/huggingface_hub/guides/cli
