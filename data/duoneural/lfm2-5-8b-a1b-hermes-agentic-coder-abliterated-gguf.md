# DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-GGUF

## Resumen

DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated es un ajuste fino orientado a agentes y generación de código, distribuido en formato GGUF por el usuario DuoNeural (Aura, Archon y Jesse). Se construye sobre los pesos ablacionados DuoNeural/LFM2.5-8B-A1B-Abliterated, que a su vez derivan de la familia Liquid Foundation Model (LFM). El repositorio contiene únicamente cuantizaciones GGUF (44,1 GB en total, cinco variantes), con un recuento real de parámetros de 8.467.856.832 en safetensors según los metadatos de HuggingFace.

Arquitectónicamente, la model card describe un híbrido de espacio de estados (SSM) y mezcla de expertos (MoE): 18 capas de convolución con compuerta LIV (Linear Input Variant), 6 capas de atención con consultas agrupadas (GQA) y 32 expertos SwiGLU con enrutamiento top-4. El autor declara activar aproximadamente 1.500 millones de parámetros por token, aunque el nombre del repositorio usa la etiqueta A1B; existe una discrepancia sin resolver entre ambas cifras. El contexto declarado es de 128.000 tokens, si bien el ejemplo de despliegue de la propia model card usa 16.384 tokens.

Su relevancia práctica es doble: por un lado, propone un perfil de inferencia muy rápido en hardware de consumo (entre 380 y 395 tokens/s en una RTX 3090 y ~90 tokens/s en una GTX 1070, según el autor) con menos de 6 GB de VRAM en Q4_K_M; por otro, incorpora un bucle agéntico nativo basado en XML de Hermes con deliberación explícita y llamadas a herramientas estructuradas. Es importante señalar que el modelo está ablacionado (sin vectores de rechazo) y que todos los resultados publicados son autodeclarados, con muestras muy pequeñas y sin verificación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: SSM con convoluciones LIV (18 capas) + GQA (6 capas) + MoE con 32 expertos SwiGLU y enrutamiento top-4 |
| Parametros totales | 8.467.856.832 (8,47 B) segun metadatos de safetensors; la model card indica 8,3 B |
| Parametros activos | ~1,5 B por token segun la model card (la etiqueta del repo indica A1B) |
| Longitud de contexto | 128.000 tokens declarados; el ejemplo de despliegue usa 16.384 |
| Tipos de cuantizacion | Q4_K_M (~4,9 GB), Q5_K_M (~5,7 GB), Q6_K (~6,5 GB), Q8_0 (~8,4 GB), BF16 (~16,0 GB) |
| Idiomas soportados | no disponible |
| Licencia | liquid-foundation-model-community-license (etiquetada como "other"); enlace: https://www.liquid.ai/community-license |
| Formato de pesos | GGUF exclusivamente (no se publican safetensors en este repo) |
| Modelo base | DuoNeural/LFM2.5-8B-A1B-Abliterated |
| Libreria declarada | hermes |
| Tamano del repositorio | 44,1 GB |
| Fecha de creacion | 2026-09-17 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe una arquitectura hibrida que combina capas de espacio de estados con convoluciones lineales y capas de atención. En concreto, se declaran 18 capas de convolución con compuerta LIV, que mantienen el coste de memoria lineal durante la inferencia, y 6 capas de GQA responsables del contexto de largo alcance hasta 128.000 tokens. La parte de mezcla de expertos consta de 32 expertos SwiGLU con enrutamiento top-4, lo que concentra el coste computacional en los parámetros activos por token (~1,5 B) frente a los 8,47 B totales. Esta combinación es coherente con la familia LFM de Liquid AI, aunque la model card no documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

El ajuste específico se presenta como un entrenamiento orientado a agentes y código con formato nativo de Hermes: deliberación explícita en `<thought>...</thought>`, contenedores `<tool_call>...</tool_call>` con payload JSON, y consumo de resultados de herramientas, excepciones de compilador y trazas de error dentro de `<tool_response>...</tool_response>` para iterar sobre el código. El prefijo "Abliterated" indica que los pesos base han sido modificados para eliminar vectores de rechazo, algo que el autor presenta como una capacidad (tareas de sistemas de bajo nivel, ingeniería inversa y pruebas de penetración) y que constituye a la vez el principal riesgo del modelo. No se documenta la metodología de ablación, el volumen de datos de ajuste ni el proceso de destilación o curaduría del dataset agéntico.

## Capacidades

- Generación de texto conversacional multi-turno con formato ChatML y etiquetas XML de Hermes.
- Generación de código Python y otros lenguajes en modo zero-shot: el autor reporta 75,0% de Pass@1 (15/20) en HumanEval.
- Razonamiento matemático básico y deducción cuantitativa: 60,0%+ declarado en GSM8K, presentado como ausencia de olvido catastrófico.
- Llamada a funciones y herramientas (function calling) con salida estructurada en JSON y XML: 100,0% de tasa AST (25/25) en la prueba propia del autor.
- Bucle agéntico multi-paso nativo: planificación en `<thought>`, ejecución vía `<tool_call>` y reparación iterativa a partir de `<tool_response>`.
- Auto-corrección de código a partir de tracebacks, fallos de tests y errores de compilador.
- Modo "uncensored": ausencia declarada de rechazos en tareas de sistemas de bajo nivel, ingeniería inversa y seguridad ofensiva.
- Inferencia de alta velocidad por token gracias a la activación dispersa de expertos.
- Capacidades multimodales: no disponibles (modelo exclusivamente de texto).
- Soporte de audio o visión: no disponible.
- Idiomas soportados: no disponible; la model card no publica desglose multilingüe.

## Casos de uso

- Agente de reparación automática de tests: el modelo puede recibir la salida de `pytest`, interpretar el traceback dentro de `<tool_response>` y generar un nuevo `<tool_call>` para inspeccionar o editar el fichero afectado, iterando hasta que la suite pase. El bucle de deliberación explícita reduce las acciones a ciegas.
- Integración en pipelines de CI/CD: al exponer una API compatible con OpenAI mediante `llama-server`, puede conectarse a un runner que ejecute el modelo localmente para revisar diffs, sugerir parches o clasificar fallos de build sin enviar código a servicios externos.
- Asistente de línea de comandos y automatización de shell: el ejemplo de la propia model card (`execute_command` con argumento `cmd`) permite construir un agente que ejecute comandos, lea su salida y encadene acciones sobre el sistema de ficheros.
- Análisis y reversing de firmware o binarios: el sesgo ablacionado evita rechazos en tareas de desensamblado, análisis de protocolos o escritura de scripts de explotación en entornos de laboratorio autorizados.
- Generación de código en producción con revisión humana: su velocidad declarada (380-395 tokens/s en RTX 3090) permite completar funciones y tests de forma interactiva, integrándolo en el IDE mediante un endpoint local compatible con OpenAI.
- Despliegue en hardware de gama baja o edge: con Q4_K_M (~4,9 GB) cabe en GPUs de 6 GB y, según el autor, alcanza ~90 tokens/s en una GTX 1070, lo que habilita agentes locales en portátiles antiguos o estaciones sin acelerador moderno.
- Procesamiento de repositorios grandes: el contexto declarado de 128.000 tokens permite cargar varios ficheros de un mismo módulo y razonar sobre dependencias cruzadas, siempre que la VRAM disponible admita la caché KV correspondiente.
- Evaluación de seguridad ofensiva y formación: en un entorno controlado, sirve para generar y explicar técnicas de explotación con fines didácticos, dado que no aplica rechazos.

## Benchmarks y rendimiento

Todos los datos siguientes son autodeclarados por el autor en la model card, medidos sobre la compilación Q4_K_M y con muestras muy reducidas. No hay verificación independiente ni resultados de terceros en la información disponible.

| Benchmark / metrica | Resultado declarado | Tamano de muestra | Notas |
|---|---|---|---|
| Hermes Function Calling AST Rate | 100,0% | 25/25 | Salida XML y JSON parseable sin desviacion sintactica |
| HumanEval Python (Pass@1) | 75,0% | 15/20 | Generacion zero-shot |
| GSM8K | 60,0%+ | no disponible | Valor minimo declarado, sin muestra indicada |
| Abliteration y alineacion de seguridad | 100% uncensored | no disponible | Sin rechazos en tareas de bajo nivel y seguridad |
| Throughput en RTX 3090 | ~380-395 tokens/s | no disponible | Sobre Q4_K_M |
| Throughput en GTX 1070 | ~90 tokens/s | no disponible | Sobre Q4_K_M |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: Q4_K_M ~4,9 GB; Q5_K_M ~5,7 GB; Q6_K ~6,5 GB; Q8_0 ~8,4 GB; BF16 ~16,0 GB. Hay que sumar la caché KV, que crece con el contexto y puede dominar el consumo si se usan ventanas cercanas a 128k tokens.
- El autor afirma que Q4_K_M cabe en menos de 6 GB de VRAM, lo que lo sitúa en el rango de una RTX 3060 de 6 GB, una RTX 2060 de 6 GB o una GTX 1660 de 6 GB (esta última con penalización por falta de tensor cores).
- GPU recomendadas según el propio autor: RTX 3090 para el máximo throughput declarado (~380-395 tokens/s); GTX 1070 para ejecución en hardware antiguo (~90 tokens/s). No se publican cifras para A100, H100, RTX 4090 ni para GPUs de datacenter.
- Para Q8_0 o BF16 se recomienda al menos 12-24 GB de VRAM, lo que incluye RTX 3090, RTX 4090, RTX A6000 o tarjetas profesionales equivalentes.
- Opciones de despliegue documentadas: `llama.cpp` y `llama-server` (comando de ejemplo con `-c 16384`), e integración con el CLI de Hermes Agent mediante `hermes config set model.base_url http://127.0.0.1:8000/v1`.
- Otros runners compatibles con GGUF (Ollama, LM Studio, text-generation-webui, kobold.cpp) son viables por formato, aunque no están documentados en la model card.
- vLLM y TGI no están documentados para este repositorio: solo se distribuyen pesos GGUF, no safetensors.
- Throughput declarado: ~380-395 tokens/s en RTX 3090 y ~90 tokens/s en GTX 1070, ambos sobre Q4_K_M. No se publican cifras de latencia por petición ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de terceros ni de comparativas publicadas en la informacion proporcionada. La tabla siguiente recoge unicamente lo que puede afirmarse con la informacion disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad / notas |
|---|---|---|---|---|
| DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated | 8,47 B totales, ~1,5 B activos | 128k declarados | liquid-foundation-model-community-license | GGUF en HuggingFace, 0 descargas, sin verificacion externa |
| DuoNeural/LFM2.5-8B-A1B-Abliterated (modelo base directo) | no disponible | no disponible | no disponible | Es el punto de partida de este ajuste |
| Familia Liquid Foundation Model (LFM) de Liquid AI (origen arquitectonico presumible) | no disponible | no disponible | Liquid community license | Solo referencia de familia; no se aportan datos comparativos |
| Qwen3-8B / Qwen3-30B-A3B y otros MoE pequenos de la misma categoria | no disponible | no disponible | no disponible | Categoria comparable por tamano y activacion dispersa, pero sin datos en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo ablacionado: se han eliminado los vectores de rechazo de forma deliberada. No aplica filtros de seguridad, lo que lo hace inadecuado para uso abierto a usuarios finales sin capas de moderación externas.
- Riesgo elevado de contenido peligroso: la model card promociona explícitamente usos de ingeniería inversa, pruebas de penetración y reversing de firmware. Su uso sin autorización expresa puede ser ilegal en muchas jurisdicciones.
- Benchmarks autodeclarados y con muestras diminutas: 25 y 20 ejemplos en las dos pruebas principales, sin metodología publicada, sin semilla ni harness identificables y sin replicación independiente. Las cifras no deben tratarse como fiables.
- Ambigüedad en el recuento de parámetros activos: la model card indica ~1,5 B, el nombre del repositorio usa la etiqueta A1B y el total real en safetensors es 8,47 B, no 8,3 B como afirma el texto.
- Discrepancia de contexto: se declaran 128.000 tokens, pero el único ejemplo de despliegue usa `-c 16384`. El contexto efectivo en la práctica no está verificado.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad factual ni de tasas de alucinación. En tareas de código, un 75% de Pass@1 en HumanEval sobre 20 problemas implica además una incertidumbre estadística muy amplia.
- Idiomas: no disponibles. No hay evidencia de soporte multilingüe ni de calidad en castellano.
- Licencia: liquid-foundation-model-community-license, etiquetada como "other". Es una licencia comunitaria con condiciones específicas; antes de cualquier uso comercial hay que revisar el texto en https://www.liquid.ai/community-license. No se garantiza permiso de uso comercial ni de redistribución de derivados.
- Procedencia poco verificable: el autor (DuoNeural) no es el desarrollador original de la arquitectura LFM, el repositorio tiene 0 descargas y 0 likes, y la fecha de creación indicada en los metadatos (2026-09-17) es incoherente con el calendario habitual, lo que dificulta la trazabilidad.
- Sin datos de sesgos: no se publica ningún análisis de sesgo demográfico, político o lingüístico.
- Tamaño del repositorio: 44,1 GB, lo que exige planificar el almacenamiento si se descargan todas las cuantizaciones.
- Sin soporte multimodal: solo texto; no apto para tareas de visión o audio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-GGUF
- Modelo base directo: https://huggingface.co/DuoNeural/LFM2.5-8B-A1B-Abliterated
- Licencia comunitaria de Liquid AI: https://www.liquid.ai/community-license
- Perfil del autor en HuggingFace: https://huggingface.co/DuoNeural

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo, su autor o su familia arquitectonica; las unicas entradas recuperadas corresponden a visores de ficheros de Autodesk y no guardan relacion con la ficha. No se han localizado papers, blogs tecnicos, repositorios de codigo ni demos adicionales en la informacion disponible.
