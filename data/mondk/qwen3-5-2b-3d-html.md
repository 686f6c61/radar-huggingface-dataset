# mondk/Qwen3.5-2B-3D-Html

## Resumen

Qwen3.5-2B-3D-Html es un modelo de generación de texto afinado por el usuario mondk a partir de Qwen/Qwen3.5-4B, especializado en una tarea muy concreta: convertir una descripción textual en un fichero HTML autocontenido que renderiza un modelo 3D mediante Three.js. El modelo no genera mallas 3D ni formatos binarios como OBJ o GLB, sino código HTML con JavaScript y CSS embebidos que, al abrirse en un navegador, dibuja una escena tridimensional interactiva con OrbitControls.

A pesar del nombre comercial "2B", los pesos reales en safetensors suman 4.205.751.296 parámetros, coherentes con el modelo base Qwen3.5-4B del que deriva. El repositorio ocupa 11,9 GB e incluye pesos en safetensors y una cuantización GGUF Q6_K. La licencia es Apache 2.0 y el pipeline declarado es text-generation, con etiquetas específicas de 3D y HTML.

Su relevancia es acotada pero clara: resuelve el problema de generar prototipos 3D ligeros sin instalar librerías ni depender de un motor de render, algo útil para demos, educación y generación rápida de visualizaciones. Es un modelo de nicho, con 2.294 descargas y 7 likes en el momento de la consulta, y el propio autor advierte de que el proyecto se actualizará lentamente y anima a otros a continuar el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Qwen3.5-4B; familia qwen3_5_text) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors (pesos originales) y GGUF Q6_K |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

No se dispone de detalles técnicos sobre la arquitectura interna en la información proporcionada. El modelo deriva de Qwen/Qwen3.5-4B, etiquetado con la familia `qwen3_5_text`, lo que sitúa la base en un transformer de texto de la familia Qwen3.5. El autor no documenta en la model card el número de capas, la dimensión oculta, el mecanismo de atención ni la longitud de contexto del modelo base.

El ajuste fino se realizó sobre dos conjuntos de datos declarados: `mondk/Bench-3D.html` y `noodcon/3D-By-Gemini4Argon`. El primero parece un banco de ejemplos de HTML con escenas 3D; el segundo, por su nombre, contiene ejemplos generados con Gemini 4 Argon. El autor remite a un `technical-report.pdf` alojado en el repositorio para el proceso de entrenamiento completo y sus sugerencias de contribución, pero el contenido de ese informe no está incluido en la información disponible. No se documenta si hubo RLHF, DPO ni qué volumen de tokens se empleó.

La innovación destacable no es arquitectónica sino de formato de salida: el modelo produce un único fichero HTML autocontenido, con Three.js y OrbitControls cargados desde CDN con versión fijada, fondo blanco y sin elementos de interfaz adicionales. El autor recomienda una configuración de decodificación concreta: temperatura 0,65, top_p 0,95, top_k 30 y repeat penalty 1,05.

## Capacidades

- Generación de un fichero HTML único y autocontenido que renderiza un modelo 3D con Three.js, sin dependencias instaladas localmente.
- Carga de Three.js y OrbitControls desde CDN (cdnjs o jsDelivr) con versión fijada.
- Controles de cámara: zoom con rueda del ratón y rotación con botón derecho, según el system prompt recomendado.
- Fondo blanco y ausencia de elementos de interfaz (sin botones ni texto), orientado exclusivamente a la observación del modelo.
- Generación de código JavaScript y CSS embebidos en el propio HTML.
- Seguimiento de instrucciones mediante system prompt de varias líneas con restricciones de formato.
- Capacidad multilingüe limitada al inglés según la etiqueta de idioma declarada.
- No se documentan tool calling, function calling, modo thinking, visión, audio ni razonamiento multi-paso como capacidades del modelo.

## Casos de uso

- Prototipado rápido de escenas 3D: un desarrollador describe un objeto o escena y obtiene un HTML que puede abrir directamente en el navegador para validar la idea antes de invertir en un pipeline 3D real.
- Educación y demostraciones: útil para generar visualizaciones 3D interactivas en clase o en charlas sin instalar Blender, Unity ni librerías de render, ya que todo el resultado es un fichero HTML.
- Generación de assets para documentación técnica: incrustar un visor 3D autocontenido en una página de manual o en una wiki interna para ilustrar piezas, geometrías o conceptos.
- Pruebas de concepto en entornos con restricciones de instalación: al cargar Three.js desde CDN y no requerir dependencias locales, encaja en entornos donde no se pueden instalar paquetes pero sí abrir un navegador.
- Generación de contenido para demos comerciales: crear vistas 3D de producto en HTML para presentaciones o landings, aceptando que el modelo puede cometer errores menores de secuenciación que hay que corregir.
- Base para ajuste fino posterior: el autor publica el proceso de entrenamiento y anima a continuar el trabajo, por lo que sirve como punto de partida para quien quiera especializar aún más el modelo en dominios 3D concretos.
- Automatización de ejemplos de código Three.js: generar snippets completos y ejecutables que sirvan como plantilla para desarrolladores que aprenden la librería.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para 4.205.751.296 parámetros, una estimación orientativa en FP16 ronda los 8,4 GB solo de pesos, y en Q6_K alrededor de 3,5-4 GB, sin contar caché KV ni overhead; son cálculos derivados del número de parámetros, no datos publicados por el autor.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar funcionamiento en GPUs de 16 GB o más en FP16 y en GPUs consumer de 8 GB en Q6_K, pero no hay confirmación del autor.
- Cabe en consumer GPU: probablemente sí con la cuantización Q6_K publicada, aunque no está verificado en la información disponible.
- Opciones de despliegue: el repositorio incluye un GGUF Q6_K, lo que permite su uso con llama.cpp y herramientas compatibles con GGUF. No se documentan integraciones con vLLM, TGI, Ollama ni endpoints específicos, aunque la etiqueta `endpoints_compatible` aparece en los tags de Hugging Face.
- Latencia y throughput: no disponibles. El autor advierte de que el modelo tiende a producir salidas largas, por lo que recomienda fijar un `max_tokens` alto.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables especializados en generación de HTML con Three.js en la documentación proporcionada. Como referencia del modelo base:

| Modelo | Parametros | Contexto | Especialidad | Licencia |
|---|---|---|---|---|
| mondk/Qwen3.5-2B-3D-Html | 4.205.751.296 | no disponible | HTML + Three.js para 3D | apache-2.0 |
| Qwen/Qwen3.5-4B (base) | no disponible en la informacion | no disponible | Generacion de texto general | no disponible en la informacion |
| Alternativas especializadas en 3D | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo puede entrar en bucles al definir variables; el autor recomienda pausar la generación e indicarle que continúe con la parte de construcción 3D.
- Puede cometer errores menores, como usar librerías desactualizadas o secuenciar mal el código; hay que señalárselos para que los corrija.
- Tiende a generar salidas muy largas, lo que exige configurar un límite de `max_tokens` elevado y puede incrementar coste y latencia.
- El idioma declarado es únicamente inglés; no hay evidencia de buen rendimiento en castellano ni en otros idiomas.
- No se documentan sesgos conocidos, pero al derivar de un modelo base general y afinarse sobre datasets concretos, puede heredar sesgos del corpus original.
- Riesgo de alucinación en APIs de Three.js y en la geometría generada: el código puede ser sintácticamente válido pero producir escenas incorrectas o no deseadas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B tiene su propia licencia que conviene verificar antes de explotar el derivado en producción.
- El proyecto se actualizará lentamente según el autor, por lo que no debe esperarse soporte activo ni correcciones rápidas.
- El nombre del modelo ("2B") no coincide con el número real de parámetros (4,2 mil millones), lo que puede inducir a error al planificar recursos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mondk/Qwen3.5-2B-3D-Html
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Cuantización GGUF Q6_K: https://huggingface.co/mondk/Qwen3.5-4B-3D-Html/blob/main/model-Q6_K.gguf
- Informe técnico: https://huggingface.co/mondk/Qwen3.5-4B-3D-Html/blob/main/technical-report.pdf
- Dataset Bench-3D.html: https://huggingface.co/datasets/mondk/Bench-3D.html
- Dataset 3D-By-Argon4: https://huggingface.co/datasets/noodcon/3D-By-Gemini4Argon
