# Haverbex/Qwen-image-2.1-ultrafast

## Resumen

Qwen-image-2.1-ultrafast es un adaptador LoRA de investigación para edición de imágenes, publicado por el usuario Haverbex sobre el modelo base Qwen/Qwen-Image-2.1. No es un modelo completo, sino un adaptador de bajo rango (rank 32, alpha 32, BF16) que se inyecta en 224 proyecciones del transformer de difusión del modelo base. Su objetivo declarado es actuar como "diagnóstico de conjunto de entrenamiento": verificar que el esquema de entrenamiento funciona sobre un conjunto mínimo de datos y un esquema de denoising de ocho pasos.

El autor es explícito sobre el alcance: se entrenó con 16 imágenes de origen y 128 intervalos de profesor extraídos de trayectorias de 40 pasos del modelo base (MagicBrush, instrucciones en inglés), con 128 actualizaciones SGD y un learning rate de 0,1. La pérdida media (velocity-MSE) bajó de 0,0284830323 a 0,0123022638 en esos mismos 128 intervalos, una reducción del 56,81 %, pero el desglose por intervalos muestra que 63 mejoraron y 65 empeoraron, y que el intervalo 0 concentra el 90,63 % de la mejora neta.

Su relevancia es acotada y de carácter metodológico: ilustra cómo se registra y publica un adaptador experimental con trazabilidad (SHA-256, revisión exacta del base, bloqueo de runtime, mediciones emparejadas), y documenta una aceleración de la pipeline de denoising de aproximadamente 3,87× (74,16 % menos tiempo) respecto a las referencias del profesor de 40 pasos. No hay evaluación en conjunto de desarrollo independiente, ni retención de calidad medida, ni destilación a cuatro pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer de difusión DiT (Qwen-Image-2.1, 32 capas single-stream, 7B en el componente de generación visual) |
| Parametros totales | 83.886.080 parámetros entrenables en el adaptador; el modelo base no se incluye en el repositorio (0,2 GB en total) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: edición image-to-image con una única imagen de referencia y salida de 1024×1024 RGB, batch 1 |
| Tipos de cuantizacion | No se distribuyen pesos cuantizados; el adaptador se guarda en BF16. El autor indica que no se incluye la implementación privada Mix-STQ ni pesos cuantizados del text encoder |
| Idiomas soportados | Inglés (instrucciones de edición en inglés) |
| Licencia | qwen-research (license: other), uso no comercial / investigación |
| Formato de pesos | Adaptador LoRA con nombres y disposición personalizados, no convertido al formato estándar PEFT/Diffusers; requiere `ultraedit_adapter.py`. El formato de serialización exacto no se detalla en la información disponible |

Otros datos registrados: revisión del base `790c92633540aa0cb11d9abf19eb46d861714758`, SHA-256 del adaptador `9d3585e6f1b4700130a12df83b2ac7a9a7440158bc9625425475c28214e59639`, revisiones de runtime de Diffusers `cc8644b447d8f11074d3df06d0ee0e3e7c91bf75` y Transformers `207fca7b5b9c5f0444dac9abc968be5d429a650d`.

## Arquitectura y entrenamiento

El adaptador se inyecta mediante una función propia (`inject_dit_lora`) en 224 proyecciones del transformer del modelo base, con rank 32 y alpha 32 en BF16. Los pesos congelados del base no se modifican. El entrenamiento utilizó 128 intervalos objetivo extraídos de ocho intervalos de cada una de las trayectorias de 40 pasos del profesor, sobre 16 casos de entrenamiento de MagicBrush (ediciones locales, instrucciones en inglés). El optimizador fue SGD con learning rate 0,1 y momentum 0,9, durante 128 actualizaciones.

El autor documenta una verificación de reproducibilidad en el mismo runtime: una repetición en proceso nuevo comparó 899 tensores más el optimizador, el RNG, el cursor y los registros de actualización, con igualdad exacta. Se advierte explícitamente de que esto no demuestra reproducibilidad en otro hardware o en otras compilaciones de CUDA. El schedule de ocho pasos está registrado en `configs/schedule.json` con los límites sigma ya desplazados, por lo que no debe aplicarse un desplazamiento adicional. La innovación técnica destacable es metodológica: registro completo del esquema de denoising, bloqueo de versiones de runtime y mediciones emparejadas por intervalo, en lugar de una arquitectura nueva.

## Capacidades

- Edición de imágenes image-to-image con una imagen de referencia y una instrucción en inglés (pipeline declarada: `image-to-image`).
- Edición local de atributos: el ejemplo publicado modifica la expresión facial ("What if she had a sad face?") manteniendo composición, retrato y objetos reconocibles.
- Adición de objetos: el ejemplo publicado inserta una pegatina de flor sobre una nevera preservando la disposición principal de la cocina.
- Ejecución con un esquema de ocho pasos de denoising, con los límites sigma ya registrados en la configuración.
- Generación de salidas en 1024×1024 RGB con batch 1.
- No se documenta soporte de tool calling, function calling, agentes, multi-step reasoning, audio ni vídeo.
- No se documenta modo "thinking" ni ninguna capacidad de razonamiento textual: se trata de un adaptador de difusión para edición de imagen.
- Capacidad multilingüe: no; el autor indica únicamente inglés.
- Compatibilidad limitada: no se debe asumir funcionamiento con `load_lora_weights()` ni con el widget automático de inferencia del Hub.

## Casos de uso

- Diagnóstico de conjuntos de entrenamiento: es el uso declarado por el autor. Permite comprobar si un conjunto mínimo (16 imágenes, 128 intervalos) produce una señal de aprendizaje medible antes de escalar a un dataset completo, comparando pérdidas emparejadas por intervalo.
- Investigación sobre destilación de pasos en difusión: sirve como punto de partida para estudiar la reducción de 40 a 8 pasos de denoising, con tiempos de pipeline medidos (18,08 s y 17,69 s frente a 69,69 s y 68,77 s del profesor), aunque el propio autor señala que la destilación a cuatro pasos no se ha establecido.
- Estudio de adaptadores personalizados frente a PEFT/Diffusers: el repositorio incluye un cargador propio y un esquema de nombres no estándar, lo que lo convierte en un caso práctico para analizar compatibilidad, portabilidad y coste de mantenimiento de formatos propietarios.
- Verificación de reproducibilidad de entrenamiento: el registro de 899 tensores, optimizador, RNG y cursor permite reproducir el experimento en el mismo runtime y evaluar qué partes del pipeline son deterministas.
- Evaluación cualitativa de edición local en investigación: los dos ejemplos publicados (expresión facial y adición de objeto) permiten estudiar cuánto se conserva de la imagen original frente al profesor de 40 pasos, siempre como casos de entrenamiento y no como medida de generalización.
- Auditoría metodológica de fichas de modelos: es un ejemplo útil de model card con SHA-256, revisión del base, bloqueo de runtime, informes de pérdida por intervalo y avisos explícitos sobre lo que no se ha demostrado.
- Docencia sobre entrenamiento de LoRA en transformers de difusión: el repositorio incluye `configs/training.json`, `configs/runtime-lock.json` y scripts de carga, útiles como material didáctico sobre inyección de LoRA y evaluación por intervalos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de GenEval, T2I-CompBench, CLIP-score ni de ningún otro benchmark estándar de generación o edición de imagen, ni comparaciones con otros adaptadores de pocos pasos. Las únicas métricas publicadas son internas, medidas sobre los mismos 128 intervalos de entrenamiento:

| Metrica | Valor |
|---|---|
| Velocity-MSE media antes del entrenamiento (128 intervalos) | 0,0284830323 |
| Velocity-MSE media despues del entrenamiento (128 intervalos) | 0,0123022638 |
| Reduccion de la perdida media | 56,81 % |
| Intervalos que mejoran | 63 de 128 |
| Intervalos que empeoran | 65 de 128 |
| Variacion de los grupos de intervalos 1-4 | Empeoran entre un 25,97 % y un 39,45 % |
| Concentracion de la mejora neta | El intervalo 0 aporta el 90,63 % |
| Casos con mejora en la media (16 casos) | 16 de 16 |
| Tiempo de pipeline S8 (8 llamadas al modelo) | 18,08 s y 17,69 s, excluyendo carga del modelo, codificacion de entrada y decodificacion VAE |
| Tiempo de referencia T40 (profesor, 40 pasos) | 69,69 s y 68,77 s |
| Aceleracion historica | Aproximadamente 3,87×, un 74,16 % menos de tiempo de pipeline de denoising |

El hardware utilizado para estas mediciones no se especifica en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no hay requisitos oficiales publicados. Como referencia, el modelo base tiene 7B parámetros en el componente de generación visual, lo que supone aproximadamente 14 GB solo en pesos si se carga en BF16, más el text encoder y el VAE, que se obtienen por separado. El adaptador añade unos 84 M de parámetros (aproximadamente 0,17 GB en BF16). Estas cifras son una estimación por tamano, no un dato verificado del repositorio.
- GPU recomendadas: no disponibles. El autor no indica la GPU empleada en las mediciones de latencia (18,08 s / 17,69 s).
- GPU de consumo: no confirmado. Por tamaño del modelo base, una GPU de 24 GB (por ejemplo RTX 4090) es un objetivo plausible en BF16, pero no hay validación publicada en este repositorio.
- Opciones de despliegue: Diffusers con el cargador incluido (`ultraedit_adapter.py`) sobre `QwenImage21Transformer2DModel`, con las revisiones exactas de Diffusers y Transformers fijadas. El runner end-to-end por etapas no se incluye en la subida. No se debe asumir compatibilidad con `load_lora_weights()` ni con el widget automático del Hub.
- ComfyUI: la información de la búsqueda web indica soporte Day-0 de ComfyUI para el modelo base Qwen-Image-2.1; no se documenta soporte de este adaptador concreto en ComfyUI.
- Latencia y throughput: los únicos datos son los tiempos de pipeline citados arriba, con hardware no especificado y excluyendo carga de modelo, codificación de entrada y decodificación VAE. No hay datos de throughput.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros adaptadores de aceleración o de edición. La comparación más directa es con el propio modelo base, que actúa como profesor de 40 pasos en las mediciones del repositorio:

| Modelo | Parametros | Pasos de denoising | Tiempo de pipeline | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-image-2.1-ultrafast (este adaptador) | 83.886.080 parametros entrenables sobre base de 7B | 8 (esquema registrado) | 18,08 s / 17,69 s (hardware no especificado) | qwen-research, no comercial | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen-Image-2.1 (profesor, T40) | 7B en el componente de generacion visual, 32 capas single-stream DiT | 40 | 69,69 s / 68,77 s | Licencia Qwen del modelo base | HuggingFace y GitHub de QwenLM |
| Otros adaptadores de pocos pasos para edicion de imagen | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia qwen-research: uso exclusivamente no comercial y de investigación. El propio autor etiqueta el proyecto como "non-commercial research project". No apto para producción ni para uso comercial.
- No es un modelo autónomo: es un adaptador que requiere descargar el modelo base por separado, bajo su propia licencia, además del text encoder, el processor, el scheduler y el VAE.
- Formato no estándar: no está convertido a PEFT/Diffusers y no debe asumirse compatibilidad con `load_lora_weights()`. Esto limita su portabilidad y su integración en herramientas estándar.
- Sin evaluación en conjunto de desarrollo: no se han establecido la calidad independiente, los porcentajes de retención de calidad, el rendimiento en producción ni la destilación a cuatro pasos.
- Evidencia de mejora desigual: de los 128 intervalos, 63 mejoran y 65 empeoran; los grupos 1-4 empeoran entre un 25,97 % y un 39,45 %, y el intervalo 0 concentra el 90,63 % de la mejora neta. No se trata de una mejora en toda la trayectoria de denoising.
- Riesgo alto de sobreajuste: el entrenamiento se realizó con solo 16 casos de MagicBrush y 128 actualizaciones. Los ejemplos publicados son casos de entrenamiento, no ejemplos de generalización.
- Reproducibilidad acotada: la verificación de igualdad exacta se realizó en el mismo runtime; el autor advierte de que no demuestra reproducibilidad en otro hardware ni en otras compilaciones de CUDA.
- Sin análisis de sesgos publicado: no se documentan evaluaciones de sesgo. Al derivar de 16 imágenes concretas de MagicBrush y de las preferencias del profesor, puede heredar sesgos de dominio, composición y representación de esas fuentes.
- Riesgo de alucinación visual: los ejemplos muestran que el diseño del objeto añadido difiere del profesor (la pegatina de flor no es idéntica píxel a píxel), por lo que no debe esperarse reproducción fiel de la instrucción.
- Idiomas: solo inglés, según la información del repositorio.
- Metadatos de uso: 0 descargas y 0 likes en el momento de la consulta; sin validación por parte de la comunidad.
- Detalles ausentes: no se especifica el formato exacto de serialización de los pesos ni el hardware de las mediciones, y no se incluye el runner end-to-end por etapas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Haverbex/Qwen-image-2.1-ultrafast
- Modelo base Qwen-Image-2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio GitHub de Qwen-Image-2.1: https://github.com/QwenLM/Qwen-Image-2.1
- Pesos e integración de ComfyUI: https://huggingface.co/Comfy-Org/Qwen-Image-2.1
- Ficha en Civitai: https://civitai.com/models/2954443/qwen-image-21
- Artículo de presentación de Qwen Image 2.1: https://qwenimages.com/blog/qwen-image-2-1-release
- Dataset de entrenamiento MagicBrush: https://huggingface.co/datasets/osunlp/MagicBrush
- Archivos citados dentro del repositorio: `LICENSE`, `ATTRIBUTION.md`, `configs/schedule.json`, `configs/training.json`, `configs/runtime-lock.json`, `reports/evaluation.json`, `reports/paired-loss.csv`, `ultraedit_adapter.py`
