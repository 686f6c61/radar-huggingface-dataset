# OsaurusAI/Ornith-1.5-35B-A3B-JANG_6M

## Resumen

Ornith-1.5-35B-A3B-JANG_6M es un bundle MLX del modelo Ornith-1.5-35B-A3B, un VLM agéntico de razonamiento y codificación desarrollado por Ornith AI y cuantizado por OsaurusAI mediante el método JANG. El modelo combina un backbone híbrido de atención lineal gated-delta y atención completa (proporción 3:1) con una torre de visión de 27 capas y soporte nativo de vídeo, lo que lo sitúa en la categoría de modelos image-text-to-text con capacidades multimodales.

La denominación 35B-A3B indica 35 mil millones de parámetros totales con 3 mil millones activos por token (arquitectura MoE con 256 expertos enrutados). El bundle MLX cuantizado contiene 8.173.589.488 parámetros en safetensors y ocupa 28,11 GiB en disco. Su ventana de contexto alcanza los 262.144 tokens (256K), y el razonamiento en modo thinking está activado por defecto. Está orientado a tareas de codificación agéntica, con resultados de 79 en SWE-bench Verified y 67,8 en Terminal-Bench 2.1.

La relevancia de este bundle concreto radica en su cuantización JANG de precisión mixta (4/6/8 bits) calibrada mediante traza de Hessiana, imatrix y AWQ, diseñada específicamente para Apple Silicon. Incluye además la cabeza MTP (multi-token prediction) nativa para decodificación especulativa, lo que permite velocidades de 44,1 tokens/s en un chip M5 Max.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (Qwen3_5MoeForConditionalGeneration), híbrida gated-delta linear attention + full attention (3:1), MoE con 256 expertos enrutados |
| Parametros totales | 35B (denominación del modelo); 8.173.589.488 en safetensors del bundle MLX |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | JANG de precisión mixta: distribución {4-bit: 780 tensores, 6-bit: 313, 8-bit: 281}; 27 tensores vision linear_fc2 en fp16 |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | MLX (safetensors, 7 shards) |

## Arquitectura y entrenamiento

Ornith-1.5-35B-A3B emplea una arquitectura MoE híbrida con 40 capas, hidden size de 2048 y 256 expertos enrutados, de los cuales se activan 3 mil millones de parámetros por token. El backbone combina atención lineal gated-delta con atención completa en proporción 3:1, una innovación que reduce el coste computacional del mecanismo atencional manteniendo la capacidad de modelar dependencias de largo alcance. La torre de visión cuenta con 27 capas y el modelo soporta entrada de imagen y vídeo de forma nativa.

El bundle MLX ha sido cuantizado con el método JANG, que unifica tres técnicas de calibración en una única pasada de captura: la asignación de bits por traza de Hessiana (tr(H)·‖W‖²_F por módulo, en lugar de por nombre de tensor), el refit imatrix con ajuste afín ponderado por activaciones (error relativo medio de 0,0180) y el escalado de canales salientes AWQ (alpha=0,25) absorbido en las RMSNorm de 80 grupos de normalización y 390 proyecciones. La cabeza MTP nativa se conserva íntegramente (2341 tensores mtp.*) para decodificación especulativa.

El modelo no soporta audio: los tokens `<|audio_start|>`, `<|audio_end|>` y `<|audio_pad|>` están definidos en el tokenizador pero son vestigiales, ya que no existe configuración ni pesos de torre de audio. El razonamiento en modo thinking está activado por defecto y no admite niveles de `reasoning_effort`; desactivarlo prefill un bloque thinking vacío en lugar de eliminarlo.

## Capacidades

- Generación de texto y razonamiento multi-step con modo thinking activado por defecto.
- Codificación agéntica: soporta tool calling con parser `qwen3_coder` y ejecución de tareas multi-paso.
- Comprensión de imágenes (333 tensores de torre de visión) y procesamiento de vídeo verificado de extremo a extremo.
- Ventana de contexto de 262.144 tokens, adecuada para repositorios completos o historiales largos.
- Decodificación especulativa mediante cabeza MTP conservada (1 draft/step recomendado en Apple Silicon).
- Presets de muestreo duales: general (temp 1.0, presence 1.5) y coding por defecto (temp 0.6, presence 0.0).
- Sin soporte de audio (tokens vestigiales únicamente).

## Casos de uso

- Asistente de codificación en IDE: el modelo puede razonar sobre repositorios completos gracias a su contexto de 256K tokens, sugiriendo refactorizaciones y detectando bugs en proyectos de gran tamaño.
- Agente autónomo de resolución de issues: con SWE-bench Verified de 79, puede integrarse en pipelines que reciben issues de GitHub, generan parches y ejecutan tests de validación de forma autónoma.
- Automatización de terminal y operaciones: su puntuación de 67,8 en Terminal-Bench 2.1 lo hace apto para agentes que ejecutan comandos, gestionan entornos y orquestan tareas de DevOps.
- Análisis de documentación técnica multimodal: al aceptar imágenes y vídeo, puede procesar capturas de pantalla de errores, diagramas de arquitectura o grabaciones de reproducción de bugs para diagnosticar incidencias.
- Revisión de código en CI/CD: con tool calling y parser `qwen3_coder`, puede actuar como revisor automático en pipelines de integración continua, proponiendo cambios y verificando su corrección.
- RAG sobre código y documentación: la ventana de 256K tokens permite indexar y razonar sobre grandes fragmentos de código fuente o manuales técnicos sin necesidad de chunking agresivo.
- Despliegue local en Apple Silicon: al ser un bundle MLX optimizado, permite ejecutar un VLM de 35B en un Mac con M-series sin GPU dedicada, ideal para entornos de desarrollo con requisitos de privacidad.

## Benchmarks y rendimiento

Los datos disponibles provienen de la model card del bundle y de BenchLM.ai:

| Benchmark | Resultado |
|---|---|
| SWE-bench Verified | 79 |
| Terminal-Bench 2.1 | 67,8 |
| BenchLM public score | 49,27/100 (puesto 134 de 221) |

No se dispone de resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información proporcionada. El dato de BenchLM está marcado como estimado.

## Requisitos de hardware

- Tamaño en disco: 28,11 GiB; se requiere un mínimo de 32 GiB de memoria unificada para cargar los pesos y la caché KV.
- Bundle MLX diseñado para Apple Silicon: compatible con chips M-series (M1, M2, M3, M4, M5) con memoria unificada suficiente.
- Velocidad de decodificación medida: 44,1 tokens/s en un chip M5 Max.
- La caché KV para contexto completo de 256K tokens incrementa sustancialmente el consumo de memoria; para contextos largos se recomienda 64 GiB o más de memoria unificada.
- Opciones de despliegue: MLX (librería nativa del bundle), con soporte de decodificación especulativa MTP (1 draft/step recomendado).
- No es adecuado para GPUs NVIDIA sin conversión previa; el formato MLX no es directamente ejecutable en CUDA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (base) | 35B total, 3B activos | 262.144 | 79 | MIT | Transformers/vLLM |
| Ornith-1.5-397B-A3B | 397B total, 3B activos | no disponible | no disponible | MIT | no disponible |
| Ornith-1.5-9B (dense) | 9B | no disponible | no disponible | MIT | no disponible |
| OsaurusAI/Ornith-1.5-35B-A3B-JANG_6M | 35B total, 3B activos (8,17B en safetensors) | 262.144 | 79 (heredado) | MIT | MLX cuantizado |

La comparativa se limita a la familia Ornith-1.5, ya que no se dispone de datos contrastados de modelos equivalentes de otras familias en la información proporcionada. El bundle JANG_6M hereda los benchmarks del modelo base al ser una cuantización, no un reentrenamiento.

## Limitaciones y advertencias

- Soporte de audio inexistente: los tokens de audio del tokenizador son vestigiales y no hay pesos de torre de audio; cualquier intento de uso multimodal de audio fallará.
- Idioma limitado al inglés: no se garantiza rendimiento en otros idiomas, incluido el español.
- El modo thinking está activado por defecto y no se puede eliminar por completo; desactivarlo genera un bloque thinking vacío que los parsers deben detectar por contenido, no por presencia.
- Sin niveles de `reasoning_effort`: no es posible ajustar la profundidad de razonamiento como en Qwen3.8.
- La cuantización JANG deja 27 tensores de la torre de visión en fp16, lo que incrementa el uso de memoria en tareas multimodales.
- El bundle es exclusivo para Apple Silicon (MLX); no es directamente ejecutable en GPUs NVIDIA sin conversión.
- El dato de BenchLM (49,27/100) está marcado como estimado y no debe tratarse como medición oficial.
- La velocidad de 44,1 tokens/s se midió en un M5 Max; en chips M-series más antiguos o con menos memoria unificada el rendimiento será inferior.
- Licencia MIT permite uso comercial sin restricciones, pero el modelo base puede tener dependencias o pesos con orígenes que conviene auditar antes de producción.

## Enlaces

- Repositorio HuggingFace del bundle: https://huggingface.co/OsaurusAI/Ornith-1.5-35B-A3B-JANG_6M
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Colección Ornith-1.5: https://huggingface.co/collections/ornith-ai/ornith-15
- Página oficial de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Guía de Ornith AI: https://ornith.online/
- Benchmarks en BenchLM: https://benchlm.ai/models/ornith-1-5-35b-a3b
- Bundle previo de la familia (Ornith-1.0-35B-JANG_4M): https://huggingface.co/OsaurusAI/Ornith-1.0-35B-JANG_4M
