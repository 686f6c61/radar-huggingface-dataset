# satellitedown/Inkling-2-Mini-abliterated-ingine

## Resumen

Inkling-2-Mini-abliterated-ingine es una variante "abliterated" (con el comportamiento de rechazo eliminado) del modelo thinkingmachines/Inkling-2-Mini, publicada por el usuario satellitedown. El modelo base es un transformer de tipo mixture-of-experts (MoE) con torre de visión, capaz de procesar entradas image-text-to-text. La versión abliterada mantiene los pesos originales intactos y aplica una modificación en tiempo de ejecución mediante un fichero safetensors adicional, de modo que otros motores de inferencia cargan el modelo original sin la abliteración.

El modelo tiene 26.388.646.440 parámetros totales (según los safetensors del repositorio) y un tamaño de repo de 20,2 GB, lo que sugiere cuantización en FP8/NVFP4 para su despliegue. Está empaquetado específicamente para ingine, un motor de inferencia en C++/CUDA escrito por el mismo autor y optimizado para GPUs Blackwell (compute capability 12.0, como la RTX 5090). Soporta contexto de 262.144 tokens, decodificación especulativa DSpark y una API compatible con OpenAI.

Su relevancia actual radica en dos factores: por un lado, demuestra una técnica de abliteración que preserva las capacidades del modelo original (matemáticas, código, conocimiento) mientras elimina prácticamente todos los rechazos; por otro, sirve como escaparate de un motor de inferencia especializado que alcanza velocidades de decodificación de 300-560 tokens/s en una GPU de consumo de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) con torre de visión; transformer |
| Parametros totales | 26.388.646.440 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | FP8, NVFP4 (8-bit, modelopt) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con fichero de abliteración aplicado en tiempo de ejecución) |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini es un transformer con arquitectura mixture-of-experts y una torre de visión que permite entrada image-text-to-text. La variante abliterada no entrena ni modifica pesos: el repositorio contiene los ficheros originales sin cambios más `inkling-2-mini-abliterated.safetensors`, que ingine aplica en tiempo de ejecución. Esto significa que la abliteración es un artefacto del motor de inferencia, no del checkpoint, y que otros motores cargan el modelo como el original e ignoran la modificación.

La abliteración se basa en una búsqueda previa de pesos por capa que puntuó parte de los prompts de `harmful_behaviors` y 64 prompts inocuos. No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo RLHF/DPO. La innovación técnica destacable es la decodificación especulativa DSpark, integrada en ingine, cuyos borradores son verificados por el modelo completo, de modo que devuelve el mismo resultado que la decodificación plana pero a mayor velocidad.

## Capacidades

- Generación de texto y razonamiento multi-step, con modo de razonamiento configurable (`reasoning_effort` de `none` a `max`, y `enable_thinking: false`).
- Generación de código (Python verificado con tests ejecutados) y matemáticas (GSM8K, AIME 2024).
- Comprensión de imágenes (PNG, JPEG, WebP, GIF, BMP) mediante la torre de visión del checkpoint; las imágenes se pasan como content parts con URI `data:` en base64.
- Soporte de tool calling y function calling a través de la API compatible con OpenAI.
- Soporte de agentes y conversaciones multi-turno con reutilización de contexto (solo se lee lo nuevo de cada conversación).
- Capacidades multilingües: no disponible (no se especifican idiomas).
- Streaming de respuestas y campo `reasoning_content` para separar el razonamiento de la respuesta final.
- Comportamiento de rechazo prácticamente eliminado (abliterated/uncensored).

## Casos de uso

- Asistencia técnica y atención al cliente: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 262.144 tokens, manteniendo conversaciones activas en memoria de GPU y leyendo solo los tokens nuevos en cada turno, lo que reduce la latencia en sesiones largas.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD o en agentes de codificación; en las pruebas del autor, escribe un módulo de caché LRU con tests a 301-561 tokens/s.
- Análisis de documentos técnicos extensos: con 262.144 tokens de contexto y lectura de prompts a 6.200-10.900 tokens/s, puede procesar manuales, código fuente o documentación completa y localizar información enterrada en el medio del contexto.
- Procesamiento de imágenes en flujos documentales: la torre de visión permite extraer información de capturas, diagramas o documentos escaneados (hasta 1.849 tokens por imagen de 1720x1720 píxeles, procesada en 0,17 s).
- Agentes autónomos y subagentes: la API compatible con OpenAI y el soporte de conversaciones que se mantienen calientes en memoria de GPU permiten desplegar agentes con múltiples sesiones concurrentes (el autor reporta 230 peticiones de agente en 50 s hasta el primer token).
- Investigación sobre alineación y seguridad: la variante abliterada permite estudiar el comportamiento del modelo sin filtros de rechazo, comparando sus respuestas con las del original en conjuntos como JailbreakBench o `harmful_behaviors`.
- Despliegue local en estación de trabajo: con una RTX 5090 de 32 GB y unos 22 GB de disco, se puede servir el modelo con contexto completo y API local sin infraestructura en la nube.

## Benchmarks y rendimiento

| Metrica | Original | Esta release |
|---|---:|---:|
| Rechazos, `mlabonne/harmful_behaviors` (104), respuesta directa | 104 | 1 |
| Rechazos, JailbreakBench (100), respuesta directa | 100 | 5 |
| Rechazos, `harmful_behaviors` (48), razonamiento primero | 48 | 3 |
| Rechazos, 32 prompts límite suaves, directo / razonamiento | 15 / 8 | 1 / 0 |
| Matemáticas (20, razonamiento) | 20/20 | 20/20 |
| Python (12, tests ejecutados) | 12/12 | 12/12 |
| Elección múltiple (12) | 12/12 | 12/12 |
| GSM8K (40), esfuerzo bajo / alto, temperatura 1 | 40/40, 40/40 | 40/40, 40/40 |
| AIME 2024 (15), temperatura 1 | 13/15 | 14/15 |
| Muestras que entran en bucle (95) | 0 | 0 |
| Acuerdo con el original en 8.192 tokens de docs técnicos (top-1 / KLD medio) | 1 / 0 | 0,964 / 0,005 |
| Divergencia KL sobre respuestas del original a 64 prompts inocuos | 0 | 0,014 |

Velocidad en una RTX 5090 con perfil por defecto (contexto de 262.144 tokens, caché KV en FP8), una petición, tokens por segundo:

| Modo | chat | code | agent |
|---|---:|---:|---:|
| Decodificación plana, greedy | 306 | 301 | — |
| DSpark, greedy | 501 | 561 | 510 |
| Decodificación plana, temperatura 1 | 301 | 301 | 279 |
| DSpark, temperatura 1 (por defecto) | 487 | 554 | 501 |

Lectura de prompts: 10.900 tokens/s (20K tokens), 8.000 (131K) y 6.200 (254K, 41 s). Decodificación tras 254K tokens de contexto: 258 tokens/s. Visión: 3 ms para imágenes de hasta 64 tokens, 0,17 s para 1.849 tokens (1720x1720 píxeles) y 1,1 s para imágenes mayores (dato truncado en la información disponible).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling-2-Mini-abliterated-ingine | 26,4B (MoE) | 262.144 | Apache 2.0 | Hugging Face, motor ingine |
| thinkingmachines/Inkling-2-Mini (original) | 26,4B (MoE) | no disponible | Apache 2.0 | Hugging Face |
| Alternativas de mismo tamaño | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Filtrado de seguridad reducido: el comportamiento de rechazo se ha eliminado en gran medida; el modelo puede producir contenido que el original rechazaría. El usuario es responsable del uso y del cumplimiento legal.
- La abliteración solo se aplica con el motor ingine; otros motores cargan el modelo original sin la modificación, por lo que el comportamiento puede diferir según el entorno de despliegue.
- Requisitos de hardware muy restrictivos: GPU NVIDIA con compute capability 12.0 (Blackwell) y al menos 32 GB de VRAM; solo RTX 5090 verificada (RTX PRO 6000/5000/4500 Blackwell sin probar).
- Sistema operativo limitado a Linux x86_64 con driver para CUDA 13 y compilador C++20 (GCC 12-16).
- El motor ingine procesa una petición a la vez con una cola corta, lo que limita el throughput en despliegues con alta concurrencia.
- Las imágenes deben pasarse como URI `data:` en base64; no se descargan URLs. Las imágenes de más de 4.096 tokens se reducen.
- Riesgo de alucinación: no se han publicado métricas específicas de factualidad; los benchmarks de conocimiento son de elección múltiple (12 preguntas).
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe uniforme.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede infringir leyes o políticas de terceros; se recomienda revisión legal antes de producción.

## Enlaces

- Hugging Face: https://huggingface.co/satellitedown/Inkling-2-Mini-abliterated-ingine
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio del motor ingine: https://github.com/satellitedown/inkling-2-mini-abliterated-ingine
- README del repositorio: https://github.com/satellitedown/inkling-2-mini-abliterated-ingine#readme
