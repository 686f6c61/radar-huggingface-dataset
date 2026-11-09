# saggamer/orchestrator-v1.5-non-superapp-MLX

## Resumen

Orchestrator v1.5 Non Superapp (edición MLX 4-bit) es un modelo de lenguaje derivado de Orchestrator v1.5, publicado por el usuario saggamer en Hugging Face. Se trata de un derivado denso y solo de texto construido sobre la arquitectura Gemma 4 (implementación `gemma4_text`), con 7.463.013.418 parámetros almacenados antes de la cuantización. El modelo está pensado para asistencia cotidiana, ayuda a la programación, resumen sobre material aportado y flujos agénticos con uso de herramientas, y se distribuye en formato MLX cuantizado a 4 bits para Apple Silicon.

El modelo original combinaba adaptadores entrenados para las rutas de control, navegador, MCP, codificación y presentaciones de Kira, un espacio de trabajo local que aporta el bucle de ejecución, la memoria y la gestión de permisos. Esta edición traslada esas actualizaciones a un modelo Gemma 4 de texto convencional mediante una fusión estática de los adaptadores, de modo que puede ejecutarse con `mlx-lm` estándar sin cargadores personalizados ni módulos propietarios.

Es relevante porque demuestra un patrón de destilación de un sistema MoE con enrutamiento por token hacia un transformer denso portable, manteniendo decisiones de uso de herramientas y capacidades conversacionales, y porque ofrece una vía de despliegue en hardware de Apple sin depender de la aplicación anfitriona. La licencia es Apache 2.0 y el idioma declarado es únicamente inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Gemma 4 (`gemma4_text`), derivado por fusión estática de un modelo con enrutamiento por expertos |
| Parámetros totales | 7.463.013.418 (valores únicos almacenados antes de la cuantización) |
| Parámetros activos | No aplica en esta edición (modelo denso); el origen era MoE con 16 expertos por capa adaptada en cinco canales |
| Longitud de contexto | No disponible |
| Tipos de cuantización | MLX affine 4-bit en esta edición; el modelo base ofrece FP16 Safetensors y GGUF Q4_K_M |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors); el repositorio base ofrece Safetensors FP16 y GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer denso de texto con la arquitectura estándar Gemma 4. No se realizó entrenamiento nuevo: la edición se obtiene fusionando los adaptadores del modelo fuente. Para las tres capas FFN adaptadas, cada actualización de experto se forma como `B @ A`, se promedia sobre los 16 expertos de cada uno de los cinco canales de origen y se mezcla por igual entre canales con una fuerza residual de 0,5, dando lugar a proyecciones densas convencionales. Los hashes exactos de los adaptadores y los coeficientes están documentados en `merge_recipe.json`.

La fusión estática aproxima el enrutamiento por token dependiente del experto del modelo original, pero no lo reproduce exactamente. Además, el backbone de origen ya estaba cuantizado en MLX, por lo que exportar a FP16 o Q8 no recupera los pesos originales de precisión completa. El modelo conserva la base instructiva Gemma 4 E4B y los adaptadores entrenados de Kira. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional con seguimiento de peticiones de seguimiento (follow-ups) y resúmenes fundamentados en material aportado.
- Razonamiento sobre hechos suministrados en el contexto.
- Ayuda a la programación: el autor reporta comprobaciones funcionales de aritmética y codificación superadas en los runtimes probados.
- Emisión de decisiones de uso de herramientas en formato JSON, verificada en Transformers, MLX-LM, llama.cpp, Ollama y LM Studio.
- Selección del siguiente paso en flujos agénticos: el modelo decide qué herramienta suministrada debe ejecutarse a continuación; el host es quien la ejecuta.
- Integración con servicios MCP, acciones de navegador, archivos locales y otros agentes, siempre a través de un host compatible.
- Capacidad multilingüe limitada al inglés según la model card.
- No incluye codificadores de visión ni de audio, ni navegador integrado, ni credenciales de aplicación.

## Casos de uso

- Asistencia conversacional multi-turno: el modelo gestiona peticiones de seguimiento y resúmenes sobre documentos aportados por el usuario, adecuado para integrarse en asistentes de escritorio o chat donde el contexto lo proporciona la aplicación anfitriona.
- Orquestación de herramientas en agentes locales: un host compatible puede enviar al modelo el catálogo de herramientas disponibles y este devuelve una decisión JSON sobre cuál ejecutar, lo que permite construir bucles agénticos sin un controlador propietario.
- Automatización de investigación con navegador: combinado con un host que ejecute acciones de navegador (por ejemplo, el proyecto Diagonal Browser), el modelo decide la siguiente acción de recogida de información y resume los resultados.
- Ayuda a la programación en el editor: dado su soporte de decisiones estructuradas y su tamaño de 7,4 mil millones de parámetros, puede integrarse en asistentes de código que necesiten proponer parches o invocar herramientas de compilación y test.
- Conexión a servicios MCP: en entornos con servidores MCP, el modelo selecciona qué servicio invocar según la petición del usuario, actuando como capa de decisión sobre la infraestructura existente.
- Despliegue en Apple Silicon para prototipado: gracias al formato MLX 4-bit de 4,24 GB, es viable ejecutarlo en portátiles Mac para pruebas de flujos agénticos antes de pasar a producción.
- Generación de resúmenes fundamentados: en pipelines de documentación o atención interna, el modelo resume material aportado sin necesidad de acceso a red, siempre que el host limite el contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta comprobaciones funcionales de compatibilidad (carga estándar, aritmética, codificación y decisión JSON de herramienta: 3/3) en cinco runtimes, y una comparación pareada en 12 fixtures de desarrollo y 8 fixtures reservados frente al modelo de control de origen, sin regresiones en esa muestra pequeña. Estas pruebas no constituyen rankings de rendimiento ni puntuaciones de benchmarks agénticos amplios.

## Requisitos de hardware

- VRAM estimada: los pesos en MLX 4-bit ocupan aproximadamente 4,24 GB; el repositorio completo pesa 4,3 GB. Para inferencia se recomienda reservar memoria adicional para caché KV y overhead del runtime.
- GPU recomendadas: hardware Apple Silicon (familias M1, M2, M3, M4 y posteriores) con `mlx-lm` compatible con Gemma 4; el autor probó MLX-LM 0.32.0 y MLX 0.32.3.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente; no está pensado para GPUs NVIDIA en este formato, para lo cual existe la edición GGUF Q4_K_M.
- Opciones de despliegue: `mlx-lm` para esta edición; llama.cpp sin modificar, Ollama 0.40.13 y LM Studio 0.4.26 o superior para la edición GGUF; Transformers 5.22.2 para la edición FP16 Safetensors.
- Latencia y throughput: no disponibles; el autor indica que el tiempo exacto de respuesta depende de la carga, la caché, el hardware y la configuración del runtime.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Orchestrator v1.5 Non Superapp MLX | 7,46 mil millones | No disponible | Apache 2.0 | MLX 4-bit | Derivado denso de un MoE con adaptadores de Kira; solo inglés; orientado a decisiones de herramientas |
| Orchestrator v1.5 Non Superapp (base) | 7,46 mil millones | No disponible | Apache 2.0 | Safetensors FP16 | Misma arquitectura; referencia para Transformers |
| Orchestrator v1.5 Non Superapp GGUF | 7,46 mil millones | No disponible | Apache 2.0 | GGUF Q4_K_M | Variante para llama.cpp, Ollama y LM Studio |
| Gemma 4 E4B (base instructiva) | No disponible en la información | No disponible | No disponible en la información | No disponible | Base sobre la que se entrenaron los adaptadores; sin las rutas de Kira |

No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- La fusión estática aproxima el enrutamiento por token del MoE original; no reproduce exactamente el comportamiento del controlador de Kira, y el autor no garantiza que las puntuaciones de benchmark del controlador original se transfieran a esta edición.
- El backbone de origen ya estaba cuantizado en MLX; exportar a FP16 o Q8 no recupera los pesos de precisión completa, lo que puede introducir pérdida de calidad acumulada.
- El modelo solo produce texto y decisiones de herramienta: no incluye navegador, credenciales, codificadores de visión o audio, ni ejecución real de herramientas; todo ello debe aportarlo el host.
- Idioma declarado únicamente inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea degradado.
- No se han publicado evaluaciones amplias de sesgo, alucinación o robustez; las comprobaciones del autor son funcionales y sobre muestras pequeñas (12 + 8 fixtures).
- La licencia Apache 2.0 permite uso comercial, pero deben conservarse la licencia y los avisos de terceros que acompañan al modelo; conviene revisar las condiciones de Gemma 4 y de los adaptadores de origen.
- El modelo se publicó en noviembre de 2026 con cero descargas y cero likes, por lo que no existe validación comunitaria independiente.
- Para producción, conviene fijar versiones exactas de runtime (MLX-LM 0.32.0, MLX 0.32.3, Transformers 5.22.2, Ollama 0.40.13, LM Studio 0.4.26+) y validar el comportamiento en el hardware objetivo.

## Enlaces

- Modelo en Hugging Face (MLX 4-bit): https://huggingface.co/saggamer/orchestrator-v1.5-non-superapp-MLX
- Modelo base Safetensors: https://huggingface.co/saggamer/orchestrator-v1.5-non-superapp
- Edición GGUF: https://huggingface.co/saggamer/orchestrator-v1.5-non-superapp-GGUF
- Modelo de origen: https://huggingface.co/saggamer/orchestrator-v1.5
- Web de Kira Superapp: https://kira-superapp.vercel.app/
- Repositorio GitHub de Kira Superapp: https://github.com/saggamer/KIRA-Superapp
- Diagonal Browser: https://github.com/saggamer/KIRA-Superapp/tree/main/diagonal_browser
