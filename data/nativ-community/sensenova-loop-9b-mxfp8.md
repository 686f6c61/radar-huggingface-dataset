# nativ-community/SenseNova-Loop-9B-mxfp8

## Resumen

SenseNova-Loop-9B-mxfp8 es una conversión cuantizada a 8 bits en formato MLX del modelo visión-lenguaje SenseNova-Loop-9B, desarrollado originalmente por SenseNova (equipo de SenseTime) y adaptado por el usuario nativ-community para su ejecución en Apple Silicon. El modelo acepta entradas de texto e imagen y produce texto, lo que lo sitúa en la categoría image-text-to-text, con soporte de plantilla de razonamiento opcional (thinking mode).

La arquitectura es un transformer con "looping": 32 capas físicas de decodificador que se ejecutan como 56 visitas, cada una con su propia caché. Incorpora un router mHC (multi-head routing) cuyos pesos se mantienen en FP32 para preservar la fidelidad respecto al checkpoint original. El modelo base declara una ventana de contexto de 512K tokens, aunque esta conversión no ha validado ese límite completo.

La relevancia de esta ficha es doble: por un lado documenta una alternativa de despliegue local en hardware Apple con cuantización mxfp8 (grupo de 32) y torre de visión en BF16; por otro, advierte de que se trata de un export comunitario validado solo mediante pruebas de humo (smoke checks), no mediante benchmarks de calidad. La licencia Apache-2.0 del modelo base se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas de decodificador reutilizadas en bucle (looped transformer), 32 capas físicas ejecutadas como 56 visitas, con router mHC |
| Parametros totales | 9.412.959.856 (9,41 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512K tokens declarados en el modelo base; no validado en esta conversión |
| Tipos de cuantizacion | mxfp8 de 8 bits, group size 32, en proyecciones y embeddings del lenguaje; torre de visión en BF16; router mHC en FP32 |
| Idiomas soportados | inglés (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), 10,159 GB en disco (9,462 GiB) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de transformer con reutilización de capas: 32 capas físicas de decodificador que se recorren en 56 visitas, cada una con caché independiente. Esta técnica, habitual en los llamados looped transformers, incrementa la profundidad efectiva sin aumentar proporcionalmente el número de parámetros. El router mHC (multi-head routing) gestiona la combinación de estados entre visitas; en esta conversión sus 96 tensores de enrutamiento se conservan byte a byte idénticos a los del checkpoint original en FP32. La puerta de bucle (loop gate) usada solo en entrenamiento se omite en el export.

La conversión se realizó directamente desde el checkpoint en coma flotante del modelo base en la revisión 329a65f, usando MLX 0.32.4 con el comando de conversión a mxfp8 de 8 bits y grupo 32. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en el modelo original. Tampoco se documenta en la información disponible ninguna innovación adicional como decodificación especulativa; de hecho, el verificador especulativo fusionado de Qwen3.5 no está soportado y la implementación lo rechaza.

## Capacidades

- Generación de texto conversacional multi-turno.
- Comprensión de imágenes y descripción de su contenido (image-text-to-text).
- Soporte de múltiples imágenes mediante lista ordenada y el parámetro num_images.
- Modo de razonamiento opcional (enable_thinking) con plantilla de pensamiento propia.
- Razonamiento aritmético básico (la validación del autor comprobó 17 + 25 = 42).
- Capacidades multilingües limitadas a inglés y chino.
- Integración con la librería mlx-vlm para inferencia en Apple Silicon.
- Soporte de chat template mediante apply_chat_template.

## Casos de uso

- Descripción automática de imágenes en local: el modelo puede generar descripciones de fotografías o capturas en un Mac con Apple Silicon, sin enviar datos a la nube, usando la torre de visión en BF16 y el decodificador cuantizado.
- Asistencia conversacional con contexto largo: gracias a la ventana declarada de 512K tokens del modelo base, puede mantener conversaciones extensas o procesar documentos largos acompañados de imágenes, aunque conviene validar el comportamiento real en esa longitud.
- Procesamiento de documentación técnica con figuras: útil para extraer explicaciones de diagramas, tablas o capturas dentro de manuales, combinando entrada de imagen y texto.
- Prototipado de agentes visión-lenguaje en macOS: desarrolladores que quieran experimentar con pipelines image-text-to-text en hardware Apple pueden usar este export como base para pruebas de concepto.
- Investigación sobre looped transformers: el modelo permite estudiar el comportamiento de arquitecturas con reutilización de capas y routers mHC en un entorno de inferencia local y cuantizado.
- Evaluación comparativa de cuantización mxfp8: sirve para medir el impacto de la cuantización de 8 bits con grupo 32 frente al checkpoint BF16 original en tareas de visión y texto.
- Generación de respuestas con razonamiento paso a paso: activando enable_thinking se puede usar para tareas que requieran cadena de pensamiento, como problemas aritméticos o analíticos sencillos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que las pruebas realizadas son smoke checks (generación greedy de texto y descripción de imagen en un Apple M5 Max con 128 GB de memoria unificada) y no un benchmark de calidad.

## Requisitos de hardware

- VRAM/unified memory estimada: los pesos ocupan 10,159 GB (9,462 GiB); se recomienda al menos 16 GB de memoria unificada para inferencia con margen para caché KV y activaciones, y 24-32 GB para contextos largos o múltiples imágenes.
- Hardware validado: Apple M5 Max con 128 GB de memoria unificada.
- GPU recomendadas: exclusivamente Apple Silicon (M1, M2, M3, M4, M5 en sus variantes Pro, Max y Ultra); no es compatible con CUDA ni ROCm al estar en formato MLX.
- ¿Cabe en GPU consumer? Sí, en equipos Apple con memoria unificada suficiente; no aplica a GPUs NVIDIA o AMD de consumo.
- Opciones de despliegue: mlx-vlm (requiere la revisión con soporte de SenseNova Loop, PR #2752, o la revisión fijada 3e90e9d). No se indica soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato/plataforma | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-mxfp8 (este) | 9,41 B | 512K declarados (no validados) | Apache-2.0 | MLX safetensors, Apple Silicon | Cuantización mxfp8 8 bits, torre visión BF16 |
| SenseNova-Loop-9B (original) | 9,41 B | 512K declarados | Apache-2.0 | Safetensors BF16, multiplataforma | Checkpoint de referencia sin cuantizar |
| Alternativas de ~9B visión-lenguaje | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información sobre benchmarks ni sobre otros modelos comparables en la documentación facilitada, por lo que la comparativa se limita al modelo base del que deriva este export.

## Limitaciones y advertencias

- Export comunitario: no es una conversión oficial del equipo SenseNova; la calidad y fidelidad dependen del proceso de conversión de nativ-community.
- Validación mínima: solo se han realizado smoke checks (una comprobación aritmética y una descripción de imagen); no hay evaluación sistemática de calidad.
- Contexto no validado: el límite de 512K tokens del modelo base no se ha probado en esta conversión; el rendimiento en contextos largos es desconocido.
- Compatibilidad restringida: requiere una versión específica de mlx-vlm con soporte de SenseNova Loop; sin ella, el modelo no carga.
- Verificador especulativo no soportado: el verificador fusionado de Qwen3.5 es rechazado por la implementación, lo que puede limitar optimizaciones de decodificación.
- Idiomas limitados: solo inglés y chino; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin benchmarks no se puede cuantificar su fiabilidad.
- Sesgos: no documentados en la información disponible; se heredan los del modelo base.
- Licencia: Apache-2.0 permite uso comercial, pero conviene revisar la model card del modelo original para condiciones adicionales.
- Plataforma: al estar en formato MLX, no es desplegable en infraestructura CUDA estándar, lo que limita su uso en producción fuera del ecosistema Apple.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nativ-community/SenseNova-Loop-9B-mxfp8
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Revisión del checkpoint original: https://huggingface.co/sensenova/SenseNova-Loop-9B/tree/329a65f701ba8c48b73c30d0cbaa6f0449733673
- PR de soporte SenseNova Loop en mlx-vlm: https://github.com/Neywa-Labs/mlx-vlm/pull/2752
- Repositorio mlx-vlm (revisión validada): https://github.com/Neywa-Labs/mlx-vlm.git@3e90e9d9628ab386ff8dfbe561b09859cad9e3b9
