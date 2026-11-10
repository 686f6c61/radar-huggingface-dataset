# netprojects/Qwen-Concept-27B-MLX-8bit

## Resumen

Qwen Concept 27B MLX 8-bit es una conversión a formato MLX del modelo ConceptCountry/qwen-concept-27b, publicada por NetProjects (Internet Projects Ltd). El modelo original parte de Qwen3.8-27B, al que Concept Country ha aplicado una edición de pesos en nueve proyecciones MLP (`mlp.down_proj` de las capas 32 a 48) mediante una técnica denominada programación en espacio de pesos, con el objetivo de que el modelo llegue a la respuesta con menos tokens de razonamiento. Esta build cuantiza el modelo de lenguaje a 8 bits con cuantización afín de grupo 64 y mantiene la torre de visión en bf16.

El resultado es un modelo vision-language de 27.356.728.560 parámetros (unos 27,36 mil millones) que se ejecuta en Apple Silicon a través de mlx-lm para texto y mlx-vlm para texto e imágenes, con un tamaño de repositorio de 29,5 GB. La relevancia actual reside en que permite ejecutar localmente en hardware de Apple un modelo multimodal de razonamiento de escala media-alta, con una reducción medible del pensamiento improductivo: el autor reporta que en MATH-500 nivel 5 el modelo Concept consume un 31% menos de tokens de pensamiento (media de 1.202 frente a 1.746) y acierta el 73% frente al 55% del Qwen3.8-27B sin editar, en ambos casos a 4 bits y con un límite de 3.072 tokens.

La ficha se centra en la build de 8 bits, que conserva el 99,0% del mismo siguiente token que la build bf16 de referencia sobre 12 prompts y 96 tokens forzados por profesor. La licencia es Apache-2.0, heredada del modelo original y de Qwen3.8-27B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (Qwen3.8), con torre de visión; edición de pesos en 9 proyecciones MLP |
| Parametros totales | 27.356.728.560 (27,36 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | 8 bits afín, grupo 64 (modelo de lenguaje); torre de visión en bf16. Existen builds 4-bit, 6-bit, 8-bit y bf16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (librería mlx) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3.8 con capacidad de visión (pipeline image-text-to-text), en el que la torre de visión se mantiene en bf16 y el cuerpo lingüístico se cuantiza a 8 bits con cuantización afín de grupo 64. La modificación respecto al Qwen3.8-27B original es quirúrgica: de los 851 tensores del modelo de lenguaje, 842 son idénticos al original y exactamente nueve difieren, correspondientes a `mlp.down_proj` de las capas 32, 34, ..., 48, con una variación de norma de entre el 0,4% y el 0,6%. Esta edición se documenta en el archivo `EDIT_SPEC.json` que acompaña al modelo y proviene del trabajo de Concept Country sobre programación en espacio de pesos (weight-space programming).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base. La innovación destacable no es arquitectónica sino de edición de pesos: la modificación busca acortar las cadenas de pensamiento sin degradar la precisión, y el autor verifica que el efecto persiste tras la cuantización en todas las builds (4, 6 y 8 bits). La build de 8 bits conserva el 99,0% del mismo siguiente token que la bf16 sobre 12 prompts con y sin thinking, 96 tokens forzados por profesor cada uno.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con modo thinking (cadena de pensamiento explícita), con cadenas más cortas que el Qwen3.8-27B sin editar.
- Razonamiento matemático: evaluado en MATH-500 nivel 5 con decodificación greedy.
- Comprensión de imágenes y texto (image-text-to-text) mediante mlx-vlm.
- Capacidad de visión verificada: las builds 4, 6 y 8 bits describen correctamente una imagen de prueba en mlx-vlm.
- Ejecución local en Apple Silicon con mlx-lm (texto) y mlx-vlm (texto e imágenes).
- Servido con API compatible con OpenAI mediante `mlx_lm.server` y `mlx_vlm.server`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Razonamiento matemático local en Apple Silicon: el modelo está pensado para resolver problemas de matemáticas con thinking activado; en MATH-500 nivel 5 a 4 bits reduce el tiempo de ejecución de 19 a 12 minutos frente al Qwen3.8-27B sin editar, lo que lo hace adecuado para iterar sobre problemas con límites de tokens ajustados.
- Análisis de imágenes en local: mediante mlx-vlm se puede pasar una imagen y un prompt de descripción o pregunta; el modelo mantiene la torre de visión en bf16, por lo que la calidad visual no se ve afectada por la cuantización del cuerpo lingüístico.
- Asistente de razonamiento con presupuesto de tokens limitado: al necesitar menos tokens de pensamiento (media de 909 en la build de 8 bits frente a 1.178 del modelo sin editar en los primeros 16 problemas con límite de 2.048), encaja en entornos donde el coste por token o la latencia importan.
- Despliegue de un servidor compatible con OpenAI en una estación de trabajo Mac: `mlx_lm.server` y `mlx_vlm.server` permiten exponer el modelo a aplicaciones existentes que ya consumen la API de OpenAI, sin necesidad de GPU NVIDIA.
- Prototipado de aplicaciones multimodales en portátiles Apple: con 29,5 GB de pesos, cabe en equipos con memoria unificada amplia (el autor lo prueba en un MacBook Pro M5 Max de 128 GB), lo que permite desarrollar y validar flujos de imagen-texto sin infraestructura en la nube.
- Evaluación de técnicas de edición de pesos: el repositorio incluye `EDIT_SPEC.json` y una verificación tensor a tensor, lo que lo convierte en un caso de estudio reproducible para investigadores que quieran comparar el comportamiento del modelo editado frente al original con el mismo prompt y la misma configuración de decodificación.

## Benchmarks y rendimiento

Los datos publicados por el autor comparan el modelo editado con el Qwen3.8-27B sin editar en MATH-500 nivel 5, con thinking activado, decodificación greedy y las mismas condiciones para todos los modelos, sobre un MacBook Pro M5 Max de 128 GB (10 de noviembre de 2026). La primera tabla corresponde a 40 problemas con límite de 3.072 tokens, ambos modelos a 4 bits:

| Metrica | Qwen3.8-27B 4-bit | Qwen Concept 27B 4-bit |
|---|---|---|
| Tokens de pensamiento, media | 1.746 | 1.202 (31% menos) |
| Tokens de pensamiento, mediana | 1.477 | 673 |
| Termina el pensamiento dentro del límite | 58% | 83% |
| Respuesta final correcta | 55% | 73% |
| Tiempo de la ejecución | 19 min | 12 min |

La segunda tabla corresponde a los primeros 16 problemas con límite de 2.048 tokens, media de tokens de pensamiento:

| Modelo | Media de tokens de pensamiento |
|---|---|
| Qwen3.8-27B 4-bit (sin editar) | 1.178 |
| Qwen Concept 27B 4-bit | 876 |
| Qwen Concept 27B 6-bit | 801 |
| Qwen Concept 27B 8-bit | 909 |

Concept Country reporta entre un 27% y un 54% menos de tokens de pensamiento en sus propios benchmarks a Q8. La evaluación se puntúa por coincidencia exacta del resultado enmarcado, y la mayor parte de la diferencia de precisión proviene de terminar dentro del límite con más frecuencia. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 29,5 GB de pesos en 8 bits, más overhead de ejecución; el autor lo ejecuta en un MacBook Pro M5 Max con 128 GB de memoria unificada.
- GPU recomendadas: Apple Silicon exclusivamente (la librería es MLX); el autor cita un MacBook Pro M5 Max de 128 GB como equipo de prueba.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente; la build de 6 bits (22,8 GB, recomendada por el autor) y la de 4 bits (16,1 GB) reducen el requisito. No se indica compatibilidad con GPU NVIDIA.
- Opciones de despliegue: mlx-lm (`mlx_lm.generate`, `mlx_lm.server`) para texto y mlx-vlm (`mlx_vlm.generate`, `mlx_vlm.server`) para texto e imágenes, con API compatible con OpenAI. Probado con mlx 0.32.4, mlx-lm 0.32.2 y mlx-vlm 0.7.11.
- Latencia y throughput: no se publican tasas de tokens por segundo; sí se publica el tiempo total de ejecución de 40 problemas de matemáticas (12 min para el modelo editado a 4 bits frente a 19 min para el original).
- Configuración de muestreo recomendada para thinking: temperatura 1.0, top-p 0.95, top-k 20 (según la model card de Qwen3.8).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| netprojects/Qwen-Concept-27B-MLX-8bit | 27,36 mil millones | No disponible | MLX safetensors, 8 bits | Apache-2.0 | 99,0% mismo siguiente token que bf16; 29,5 GB |
| netprojects/Qwen-Concept-27B-MLX-6bit | 27,36 mil millones | No disponible | MLX safetensors, 6 bits | Apache-2.0 | Recomendada por el autor; 98,6% mismo siguiente token; 22,8 GB |
| netprojects/Qwen-Concept-27B-MLX-4bit | 27,36 mil millones | No disponible | MLX safetensors, 4 bits | Apache-2.0 | 95,3% mismo siguiente token; 16,1 GB |
| mlx-community/Qwen3.8-27B-4bit | 27 mil millones (aproximado) | No disponible | MLX safetensors, 4 bits | No disponible | Modelo base sin editar; referencia en los benchmarks de matemáticas |

## Limitaciones y advertencias

- La edición de pesos es una modificación no oficial del Qwen3.8-27B original; el autor de esta build (NetProjects) no está afiliado a Concept Country ni a Alibaba Cloud.
- El modelo está limitado a Apple Silicon por el uso de MLX; no es desplegable en GPU NVIDIA ni en CPU convencional sin conversión adicional.
- La cuantización a 8 bits no es sin pérdida: conserva el 99,0% del mismo siguiente token que bf16 sobre una muestra de 12 prompts y 96 tokens, por lo que puede haber divergencias en secuencias largas.
- Los benchmarks publicados se limitan a MATH-500 nivel 5 con 40 y 16 problemas y decodificación greedy; no hay datos de MMLU, HumanEval, GSM8G ni evaluaciones multilingües.
- No se dispone de información sobre sesgos conocidos, riesgo de alucinación específico del modelo ni limitaciones de idioma.
- La longitud de contexto no se documenta en la información disponible, lo que impide planificar cargas de trabajo con ventanas largas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.
- Aunque la licencia es Apache-2.0 y permite uso comercial, el `NOTICE` atribuye la conversión a NetProjects y el modelo original a Concept Country y Alibaba Cloud; conviene revisar las condiciones del modelo base antes de un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen-Concept-27B-MLX-8bit
- Modelo base: https://huggingface.co/ConceptCountry/qwen-concept-27b
- Build 6 bits: https://huggingface.co/netprojects/Qwen-Concept-27B-MLX-6bit
- Build 4 bits: https://huggingface.co/netprojects/Qwen-Concept-27B-MLX-4bit
- Build bf16: https://huggingface.co/netprojects/Qwen-Concept-27B-MLX-bf16
- Modelo de referencia sin editar: https://huggingface.co/mlx-community/Qwen3.8-27B-4bit
- Paper de programación en espacio de pesos: https://concept.country/research/weight-space-programming
- NetProjects: https://netprojects.com
