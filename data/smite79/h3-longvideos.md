# Smite79/H3-Longvideos

## Resumen

H3-Longvideos es un nodo personalizado para ComfyUI, desarrollado por el usuario Smite79, que extiende las capacidades del modelo de generación de vídeo MiniMax-H3 (MiniMaxAI/MiniMax-H3). Su función principal es superar la limitación de duración del modelo base, que renderiza como máximo unos 15 segundos por generación, permitiendo producir escenas largas de vídeo con audio sincronizado a partir de un único prompt estructurado en "beats" o compases narrativos.

El nodo no es un modelo de pesos en sí mismo, sino una capa de orquestación que descompone un guion en planos, renderiza cada plano de forma secuencial encadenando el último fotograma del plano anterior como primer fotograma del siguiente, y finalmente une todos los planos en un único vídeo con una banda sonora coherente. Mantiene la consistencia de personajes, ropa, poses y objetos entre planos mediante referencias de imagen y memoria de personajes.

Es relevante para desarrolladores e investigadores que trabajan con generación de vídeo en entornos ComfyUI y necesitan producir narrativas audiovisuales de mayor duración que las que permite el modelo base, con control explícito sobre continuidad visual, sincronización labial y transiciones entre planos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nodo de orquestación sobre MiniMax-H3 (modelo base de generación de vídeo con audio); no se especifica la arquitectura interna del modelo base en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el prompt se estructura en beats, sin límite documentado) |
| Tipos de cuantizacion | no disponible para el nodo; el modelo base puede cargarse mediante checkpoints INT8 (mencionado HyperFlow H3 Flash INT8 convrot) |
| Idiomas soportados | en (inglés) |
| Licencia | h3-longvideos-no-redistribution (licencia personalizada, "other") |
| Formato de pesos | no disponible (el repositorio tiene 0.0 GB; el nodo carga pesos del modelo base MiniMax-H3 vía UNETLoader, CLIPLoader y VAELoader de ComfyUI) |

## Arquitectura y entrenamiento

H3-Longvideos no entrena pesos propios: es un nodo de ComfyUI que envuelve y orquesta el modelo MiniMax-H3. Su lógica se organiza en cinco fases: planificación (cada párrafo del prompt es un beat que se convierte en un plano de duración real, con un mínimo de 5,2 segundos), escritura (generación del texto de cada plano combinando escena, personajes y beat, más notas de continuidad), renderizado (cada plano arranca sobre el último fotograma del anterior, con imágenes de referencia inyectadas en cada plano donde aparece el personaje), sonido (sincronización labial de cada línea hablada y paso de audio separado para tramos sin diálogo) y unión (igualación de color, contraste y nitidez entre planos, con arrastre del fondo estático para evitar deriva).

El nodo acepta un prompt estructurado con una sección `character_memory` (un personaje por línea, con referencias `<Picture 1>` a `<Picture 4>`), una descripción de escena, párrafos por beat, líneas de control como `cut`, `seconds: N` y etiquetas explícitas (`hold`, `pose`, `release`, `remove`, `wear`, `lift`, `tear`, `mark`, `unmark`, `exit`). Soporta aceleradores como PDD Acc (mediante el nodo `MiniMaxH3PDDAccApply`), LoRAs de velocidad, Hyperflow y FastH3, que detecta y aplica automáticamente. El modelo base MiniMax-H3 combina generación de vídeo con generación de audio, e incluye VAE de vídeo y VAE de audio separados.

## Capacidades

- Generación de vídeo de larga duración a partir de un prompt narrativo estructurado en beats, superando el límite de ~15 segundos por generación del modelo base.
- Audio sincronizado: cada línea hablada se sincroniza labialmente con el personaje que la pronuncia; los tramos sin diálogo reciben audio mediante una pasada separada de solo audio.
- Consistencia de personajes entre planos mediante `character_memory` e imágenes de referencia (`ref_image_1` a `ref_image_4`).
- Control explícito de continuidad física y de vestuario mediante etiquetas: sostener objetos, poses, quitar o poner prendas, romper prendas, marcar o desmarcar piel, salidas de personaje.
- Gestión de escenas múltiples mediante `cut` y definición de nuevas escenas.
- Control de duración por plano con `seconds: N` y encadenado automático del último fotograma.
- Integración con aceleradores: PDD Acc, LoRAs de velocidad, Hyperflow, FastH3 e HyperFlow H3 Flash (checkpoint INT8 convrot).
- Soporte de primer fotograma opcional (`first_frame`) para arrancar la secuencia desde una imagen dada.
- Salidas múltiples: `images`, `audio`, `info` y `script` (estos dos últimos para depuración y previsualización del guion generado).
- Capacidad de texto a vídeo (pipeline text-to-video).

## Casos de uso

- Producción de cortometrajes narrativos: el nodo permite escribir una escena completa en beats y obtener un vídeo único con diálogos sincronizados, adecuado para prototipos de ficción o animática.
- Creación de contenido para redes sociales con personajes recurrentes: gracias a `character_memory` y a las imágenes de referencia, un mismo personaje mantiene aspecto y vestuario entre planos, lo que facilita series episódicas.
- Previsualización de guiones: un guionista puede convertir un texto con diálogos en una secuencia audiovisual para validar ritmo, puesta en escena y continuidad antes de producción real.
- Generación de vídeo educativo o explicativo con narración: la pasada de audio para tramos sin diálogo permite acompañar visuales con locución o ambiente sonoro coherente.
- Prototipado de escenas con continuidad de vestuario y objetos: las etiquetas `wear`, `remove`, `hold` y `release` permiten controlar cambios de vestuario y utilería dentro de una misma secuencia sin perder coherencia.
- Integración en pipelines de ComfyUI para automatización por lotes: al ser un nodo, puede encadenarse con `Create Video` y `Save Video` y ejecutarse dentro de flujos automatizados de generación y ensamblado.
- Experimentación en investigación sobre consistencia temporal: útil para estudiar cómo se comportan los modelos de vídeo con audio al encadenar planos y qué deriva aparece en color, identidad y fondo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del checkpoint de MiniMax-H3 cargado (el nodo menciona variantes INT8 como HyperFlow H3 Flash, que reducen requisitos frente a precisión completa).
- GPU recomendadas: no disponible de forma explícita; el uso de checkpoints INT8 sugiere que el modelo base puede ejecutarse en GPUs de consumo alto, pero no se confirman modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el hecho de que el nodo funcione dentro de ComfyUI y soporte checkpoints INT8 apunta a que es viable en GPUs de gama alta de consumo, sin datos oficiales.
- Opciones de despliegue: ComfyUI con soporte nativo de MiniMax-H3; carga mediante `UNETLoader`, `CLIPLoader` (tipo `minimax`), `VAELoader` (vídeo) y `VAELoader` (audio, archivo separado). Requiere el VAE de vídeo completo (un VAE solo decodificador no puede iniciar un plano sobre el último fotograma).
- Aceleradores compatibles: `MiniMaxH3PDDAccApply`, LoRAs de velocidad, Hyperflow, FastH3 y HyperFlow H3 Flash (INT8 convrot, cargable con Load Diffusion Model de ComfyUI).
- Latencia y throughput: no disponibles; dependen del modelo base, del número de planos y del hardware.

## Comparativa con modelos similares

| Modelo | Tipo | Duración por generación | Audio sincronizado | Consistencia entre planos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| H3-Longvideos (este nodo) | Orquestador ComfyUI sobre MiniMax-H3 | Escena completa en múltiples planos (mínimo 5,2 s por plano) | Sí, con lip-sync por línea | Sí, vía referencias y memoria de personajes | h3-longvideos-no-redistribution | Hugging Face (Smite79/H3-Longvideos) |
| MiniMax-H3 (modelo base) | Modelo de generación de vídeo con audio | ~15 segundos por generación | Parcial (generación conjunta de vídeo y audio) | Limitada a una generación | no disponible en la información | Hugging Face (MiniMaxAI/MiniMax-H3) |
| Otros nodos de vídeo largo en ComfyUI | Orquestadores genéricos | Variable | No disponible de forma general | Variable | Variable | Ecosistema ComfyUI |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con alternativas concretas en la información proporcionada.

## Limitaciones y advertencias

- El nodo se declara explícitamente como "constant work in progress": pueden aparecer fallos y funciones que no operan correctamente; se recomienda actualizar a la versión más reciente y recrear el nodo tras actualizar.
- La licencia `h3-longvideos-no-redistribution` es personalizada y restrictiva: prohíbe la redistribución. Debe revisarse el archivo LICENSE antes de cualquier uso comercial o de redistribución de derivados.
- El modelo está etiquetado como `not-for-all-audiences`, lo que implica que puede generar contenido no apto para todas las audiencias; requiere moderación en entornos de producción.
- Idiomas soportados: únicamente inglés (`en`); el prompt y los diálogos deben redactarse en inglés.
- Dependencia estricta de ComfyUI con soporte nativo de MiniMax-H3 y de un VAE de vídeo completo; un VAE solo decodificador impide iniciar planos sobre el último fotograma.
- La calidad de la continuidad depende de la claridad del guion y del uso correcto de etiquetas; el nodo solo interpreta lenguaje común y solicita una etiqueta explícita cuando no puede deducir la acción, lo que puede requerir iteración.
- Riesgo de deriva visual entre planos pese a la igualación de color, contraste y nitidez y al arrastre del fondo estático.
- Riesgo de alucinación y de inconsistencias en diálogos o labios sincronizados, inherente a los modelos generativos de vídeo.
- El repositorio tiene un tamaño de 0.0 GB, por lo que los pesos reales deben provenir del modelo base MiniMax-H3 y de los checkpoints complementarios; el nodo por sí solo no contiene el modelo.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información disponible.
- El autor menciona que RealRebelAI ha sido incluido en lista negra del proyecto, lo que indica disputas en la comunidad y posibles bifurcaciones no oficiales.

## Enlaces

- Hugging Face del nodo: https://huggingface.co/Smite79/H3-Longvideos
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Modelos híbridos fl2va/ref2va recomendados: https://huggingface.co/smhfacct/Minimax-H3-fl2va-ref2va-hybrid-models
- Apoyo al autor (Ko-fi): https://ko-fi.com/smite79
