# AutomatosX/AX-Ornith-1.5-35B-A3B-MLX-AXQ-6bit-MTP

## Resumen

AX-Ornith-1.5-35B-A3B-MLX-AXQ-6bit-MTP es una cuantización de precisión mixta del modelo Ornith-1.5-35B-A3B, publicada por AutomatosX bajo el esquema propio AXQuant. El modelo base emplea una arquitectura de mezcla de expertos (MoE) con 35.107.180.016 parámetros totales y una activación de aproximadamente 3.000 millones por token (el sufijo A3B del nombre). Esta variante está empaquetada en formato MLX, por lo que está pensada para ejecución en Apple Silicon mediante MLX-VLM.

El artefacto se presenta explícitamente como un "research development artifact": no es una cuantización uniforme de 6 bits, sino un empaquetado affine de base 6 con protección de mayor precisión en determinados tensores. El almacenamiento completo de pesos ocupa 31.482.232.831 bytes, lo que arroja un BPW medido de 7,005427 y lo sitúa en la clase de presupuesto `8p5bpw` del manifiesto. Incluye pesos MTP (multi-token prediction) protegidos, aunque su ejecución, tasa de aceptación y ganancia de velocidad no han sido verificadas.

Su relevancia es acotada pero clara: permite probar un MoE de 35B en hardware Apple con un peso en disco de unos 31,5 GB, a costa de un soporte de runtime reducido y de la ausencia de cualquier certificado de calidad o benchmark publicado. El autor advierte que el tamaño de fichero no determina el pico de memoria en tiempo de ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo transformer (tag `qwen3_5_moe`); detalles internos no disponibles |
| Parametros totales | 35.107.180.016 |
| Parametros activos | no disponible (el sufijo A3B sugiere ~3B, sin confirmación oficial) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AXQuant de precisión mixta: empaquetado affine6 con pisos de protección de mayor precisión; BPW medido 7,005427; clase de presupuesto `8p5bpw` |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `mlx`), más `axquant_manifest.json`, `axquant_plan.json` y `config.json` |
| Tamano del repo | 31,5 GB (31.482.232.831 bytes de pesos) |
| Modelo base | ornith-ai/Ornith-1.5-35B-A3B (revisión `10fbf86fed7ecee4a061f8b499a618f46001cac1`) |
| Runtime probado | MLX-VLM 0.7.9 con MLX 0.32.4 |
| Descargas / likes | 296 / 0 |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos, etiquetado en el Hub con la arquitectura `qwen3_5_moe`, lo que apunta a un diseño derivado de la familia Qwen 3.5 MoE. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; la model card del artefacto cuantizado no los documenta y no se ha proporcionado la del modelo original.

La innovación técnica de esta variante es el esquema AXQuant: en lugar de almacenar todos los tensores a 6 bits uniformes, aplica empaquetado affine de base 6 con "pisos" de precisión reservados para tensores sensibles, lo que eleva el coste medio a 7,005427 BPW. La distribución exacta de precisión por módulo está registrada en `axquant_manifest.json` y `axquant_plan.json`. Adicionalmente, se incluyen pesos MTP protegidos para decodificación multi-token, pero el autor indica que su comportamiento no está verificado. No hay información sobre atención lineal, decodificación especulativa efectiva ni otras optimizaciones del modelo base.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, tags `conversational`).
- Razonamiento aritmético básico verificado en el smoke test: respondió correctamente a "19 + 23" con la salida "42".
- Seguimiento de instrucciones de formato estricto: devolvió exactamente la palabra "READY" cuando se le pidió.
- Pesos MTP incluidos para decodificación multi-token, con ejecución y tasa de aceptación no verificadas.
- Capacidades multimodales: el modelo base parece incluir un componente de visión (el autor menciona un "vision sidecar" no indexado), pero la ruta de carga de texto probada no lo soporta; la inferencia de imágenes requiere un loader o export verificado por separado.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Evaluación de MoE en Apple Silicon: cargar el modelo con MLX-VLM 0.7.9 sobre un Mac con memoria unificada suficiente permite medir latencia y consumo real de un MoE de 35B en hardware de consumo, algo imposible con pesos en fp16 (unos 70 GB).
- Prototipado de asistentes conversacionales en local: para equipos que desarrollan en macOS y quieren una alternativa sin conexión a APIs, el formato MLX y los 31,5 GB de pesos lo hacen manejable en un Mac Studio o MacBook Pro de gama alta.
- Pruebas de seguimiento de instrucciones y formato: útil como sujeto de test en pipelines de evaluación de prompts que requieren salidas exactas, como el caso "READY" del smoke test.
- Investigación sobre cuantización: el manifiesto y el plan AXQuant permiten estudiar el impacto de la precisión mixta con pisos de protección comparando contra el modelo base sin cuantizar.
- Validación de infraestructura MLX: sirve para verificar que un stack basado en MLX-VLM carga, tokeniza y genera con plantillas y procesadores preservados del modelo original.
- Experimentación con MTP: aunque no verificado, el artefacto permite a investigadores probar decodificación multi-token en MLX y medir tasas de aceptación por su cuenta.
- Base para desarrollos derivados: la licencia MIT facilita reutilizar los pesos en herramientas internas, siempre que se respeten las condiciones del repositorio upstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento es un smoke test funcional en Metal con MLX-VLM 0.7.9 y MLX 0.32.4, que superó dos casos (aritmética simple y salida exacta), sin constituir una evaluación de calidad, MTEB, código, contexto largo ni aceleración MTP.

| Runtime | Estado para este artefacto |
|---|---|
| MLX-VLM 0.7.9 | Supera el smoke test funcional |
| MLX-LM | No probado por separado |
| AX Engine | No probado |
| omlx | No soportado (solo estático) |
| mtplx | No soportado (solo estático) |

## Requisitos de hardware

- VRAM/memoria unificada: el autor advierte que el tamaño de fichero (31,5 GB) no establece el pico de memoria en runtime; hay que prever margen adicional para caché KV y buffers de activación. Como referencia orientativa, un MoE de 35B en 7 BPW ronda los 32 GB de pesos, por lo que se necesita un equipo con al menos 48-64 GB de memoria unificada para operar con comodidad.
- GPU recomendadas: Apple Silicon con memoria unificada amplia (M2/M3/M4 Max y Ultra, Mac Studio). No aplica a GPU NVIDIA o AMD en esta variante, al estar empaquetada para MLX.
- GPU de consumo: no cabe en tarjetas con 24 GB o menos; requiere equipos Apple de gama alta.
- Opciones de despliegue: MLX-VLM 0.7.9 (ruta probada); MLX-LM no verificado; AX Engine no probado; omlx y mtplx no soportados. vLLM, llama.cpp, Ollama y TGI no aplican a este formato.
- Latencia y throughput: no disponibles; el autor no publica mediciones y el MTP no está validado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| AX-Ornith-1.5-35B-A3B-MLX-AXQ-6bit-MTP | 35,1B (MoE) | no disponible | MLX safetensors, ~7 BPW | MIT | Solo MLX-VLM probado; sin benchmarks |
| ornith-ai/Ornith-1.5-35B-A3B (base) | 35,1B (MoE) | no disponible | safetensors originales | MIT | Referencia sin cuantizar; mayor peso en disco |
| Otras cuantizaciones GGUF del mismo base | 35,1B (MoE) | no disponible | GGUF | MIT | Ejecutables en llama.cpp/Ollama, ecosistema más amplio |
| Qwen3.5 MoE de escala similar | no disponible | no disponible | safetensors/GGUF | no disponible | Familia arquitectónica de referencia; datos no confirmados |

No se dispone de datos de rendimiento comparativos entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: el autor declara explícitamente que no emite certificado de calidad; no debe tratarse como un modelo listo para producción sin evaluación propia.
- No es una cuantización uniforme de 6 bits: el BPW real es 7,005427 y la distribución de precisión por módulo debe consultarse en el manifiesto.
- MTP sin verificar: los pesos están incluidos pero no se ha demostrado su ejecución, tasa de aceptación ni ganancia de velocidad.
- Visión no soportada en la ruta probada: la carga de texto por defecto omite el sidecar de visión; la inferencia de imágenes requiere un loader distinto y verificado.
- Ecosistema limitado: solo MLX-VLM 0.7.9 tiene evidencia funcional; omlx y mtplx no están soportados, y MLX-LM y AX Engine no se han probado.
- Riesgo de alucinación y sesgos: no documentados por el autor; deben asumirse los del modelo base, sobre el que no se aporta información.
- Idiomas y contexto: sin datos publicados; no se puede garantizar cobertura multilingüe ni longitud de contexto concreta.
- Licencia: MIT para este artefacto, pero el uso downstream queda regido por el repositorio upstream y su licencia; no se transfiere ninguna certificación ni benchmark del modelo original.
- Memoria en runtime: el tamaño de fichero no equivale al pico de memoria; planificar con margen para evitar fallos de asignación en Metal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AutomatosX/AX-Ornith-1.5-35B-A3B-MLX-AXQ-6bit-MTP
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Revisión inmutable del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B/tree/10fbf86fed7ecee4a061f8b499a618f46001cac1
- Manifiesto de cuantización: `axquant_manifest.json` (en el repositorio)
- Plan de cuantización: `axquant_plan.json` (en el repositorio)
- Informe estático de compatibilidad: `axquant_compatibility.json` (en el repositorio)
