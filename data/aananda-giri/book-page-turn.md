# Aananda-giri/book-page-turn

## Resumen

Book Page Turn es un modelo experimental de visión por computador desarrollado por Aananda-giri que resuelve una tarea muy concreta dentro de un pipeline de digitalización de libros: determinar cuántos giros de 90 grados en sentido antihorario hay que aplicar a un recorte de página ya rectificado para que el texto quede en posición vertical. No recorta la página ni realiza OCR; únicamente clasifica la orientación en una de cuatro clases (0, 1, 2 o 3 cuartos de vuelta). Está pensado para encadenarse después de Book Page Cropper, del mismo autor.

Técnicamente es un clasificador de imagen ligero basado en MobileNetV3 Large a resolución 224x224, con 3.218.996 parámetros. El checkpoint distribuido es un fichero PyTorch (`pageprep-turn.pt`) acompañado de un runner de inferencia (`predict_turn.py`) que aplica test-time augmentation sobre cuatro rotaciones de entrada por defecto. El modelo se entrenó con 584 fotos de entrenamiento y 32 de validación, combinando 1.001 recortes reales de página con 2.002 páginas sintéticas generadas a partir de tiras de texto, cabeceras, tablas, figuras, números de página y ruido de papel.

Su relevancia es acotada pero práctica: automatiza un paso intermedio que en pipelines de digitalización de libros suele resolverse con heurísticas de OCR o revisión manual. El autor lo etiqueta explícitamente como experimental y el propio esquema de salida marca `requires_review: true` de forma invariable, lo que refleja que no está pensado como componente autónomo sin supervisión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MobileNetV3 Large (clasificador de imagen, entrada 224x224) |
| Parámetros totales | 3.218.996 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (independiente del idioma del texto de la página) |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch (`.pt`) |
| Tarea | Clasificación de orientación en 4 clases (giros de 90 grados en sentido antihorario) |
| Resolución de entrada | 224x224 |
| Esquema de salida | `pageprep-page-turn-v1` |

## Arquitectura y entrenamiento

El modelo es un clasificador de imagen basado en la red convolucional MobileNetV3 Large, adaptada a una entrada cuadrada de 224x224 píxeles y a una cabeza de clasificación de cuatro clases que corresponden a los giros de 90 grados en sentido antihorario necesarios para enderezar la página. La salida incluye la clase predicha (`quarter_turns_ccw`), el vector de probabilidades de las cuatro clases (`probabilities`), la confianza máxima (`confidence`) y un campo `requires_review` que siempre vale `true`. El runner aplica test-time augmentation sobre las cuatro rotaciones de la imagen de entrada por defecto, y permite desactivarla con `--no-tta` para una única pasada forward.

El entrenamiento partió de 584 fotos de entrenamiento y 32 fotos reservadas, con un total de 1.001 recortes reales de página y 2.002 páginas sintéticas. Las páginas sintéticas se construyeron a partir de tiras de página reales, cabeceras, tablas, figuras, números de página y ruido de papel. Se realizaron 15 épocas con aumentación de datos basada en rotaciones aleatorias de cuartos de vuelta, cambios de color y test-time augmentation. El checkpoint publicado se entrenó con todos los grupos de datos; las evaluaciones leave-one-group-out corresponden a modelos separados que excluyeron el grupo indicado y miden transferencia, no la puntuación del checkpoint publicado. El autor advierte que las etiquetas de giro proceden de selecciones de recorte guardadas por la aplicación, por lo que deben tratarse como supervisión débil.

## Capacidades

- Clasificación de orientación de una página rectificada en cuatro clases: 0, 1, 2 o 3 cuartos de vuelta en sentido antihorario.
- Funciona con páginas en horizontal (giradas 90 o 270 grados) y con páginas invertidas (180 grados).
- Devuelve probabilidades por clase y un nivel de confianza, lo que permite umbralizar y derivar a revisión manual.
- Test-time augmentation configurable sobre cuatro rotaciones de entrada para mejorar la robustez de la predicción.
- Integración con el recortador Book Page Cropper del mismo autor mediante la función `page_crop`.
- Ejecución en CPU o GPU CUDA mediante PyTorch.
- No realiza OCR, no recorta la página y no detecta texto: su alcance se limita a la orientación.

## Casos de uso

- Digitalización de libros con escáner de cámara: tras recortar y rectificar cada página con Book Page Cropper, se pasa el recorte a este modelo para obtener el giro necesario antes de enviar la imagen al motor de OCR, reduciendo errores de reconocimiento por orientación incorrecta.
- Preprocesado en pipelines de OCR masivo: el modelo actúa como paso intermedio que normaliza la orientación de lotes de imágenes antes de la extracción de texto, con un coste computacional muy bajo gracias a sus 3,2 millones de parámetros.
- Corrección de lotes fotográficos de archivo: fotografías tomadas con el móvil en orientaciones arbitrarias pueden enderezarse automáticamente antes de la revisión humana, usando el campo `confidence` para priorizar qué páginas revisar primero.
- Herramientas de edición de libros digitalizados: integración en un editor que muestra la página ya orientada al usuario, aplicando el giro devuelto por el modelo y marcando siempre la página para revisión.
- Filtrado previo en proyectos de preservación documental: descartar o marcar páginas con orientación dudosa (confianza baja) antes de procesos costosos de OCR o indexación.
- Automatización de flujos con revisión humana obligatoria: dado que `requires_review` es siempre `true`, el modelo encaja en arquitecturas de human-in-the-loop donde la predicción acelera la tarea pero no la sustituye, por ejemplo en la digitalización de fondos bibliográficos con control de calidad posterior.

## Benchmarks y rendimiento

El autor publica resultados de evaluación propios sobre exactitud de clasificación de orientación. No se han publicado resultados en benchmarks estándar de visión (ImageNet, etc.) en la información disponible.

| Conjunto de evaluación | Páginas | Rotación simple | Con páginas sintéticas |
|---|---:|---:|---:|
| Holdout de fotos familiares | 212 | 0,953 | 0,976 |
| Grupo de texto A | 397 | 0,894 | 0,975 |
| Grupo de texto B | 291 | 0,962 | - |
| Grupo con muchas tablas C | 251 | 0,638 | 0,741 |
| Grupo rotado D | 50 | 1,000 | - |
| Grupo rotado E | 16 | 1,000 | - |
| Grupo rotado F | 12 | 0,917 | - |
| Grupo G | 20 | 0,950 | 0,950 |
| Grupo H | 8 | 1,000 | - |
| Grupo I | 12 | 0,417 | 0,583 |

El checkpoint publicado obtuvo 1,000 sobre 59 páginas de 32 fotos reservadas, y la prueba en dos etapas junto con Book Page Cropper también obtuvo 1,000 sobre esas mismas fotos. El autor advierte que el grupo con muchas tablas es el caso más débil: contiene 247 páginas en posición vertical y solo 4 rotadas, de modo que una respuesta constante "vertical" obtendría 0,984 en ese grupo, lo que oculta los errores en páginas rotadas. Las filas leave-one-group-out provienen de modelos separados que excluyeron el grupo indicado y miden transferencia, no la puntuación del checkpoint publicado.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 3,2 millones de parámetros y entrada 224x224, el modelo cabe holgadamente en cualquier GPU consumer con varios GB de VRAM (estimación no publicada por el autor).
- GPU recomendadas: cualquier GPU CUDA compatible con PyTorch; el runner acepta `--device cuda`. Para CPU, la inferencia es viable dado el reducido tamaño del modelo.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (por ejemplo, series RTX 30/40 o superiores), así como en CPU.
- Opciones de despliegue: el repositorio incluye un runner propio (`predict_turn.py`) y un módulo Python (`page_turn_model`) con funciones `page_crop`, `predict_turn` y `load_turn`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El autor menciona Book Page Cropper (https://huggingface.co/Aananda-giri/book-page-cropper) como componente previo del pipeline, pero realiza una tarea distinta (recorte y rectificación de página) y no se ofrecen datos comparativos de rendimiento entre ambos.

| Modelo | Tarea | Parámetros | Licencia | Disponibilidad |
|---|---|---|---|---|
| Book Page Turn | Clasificación de orientación de página | 3.218.996 | no disponible | Hugging Face |
| Book Page Cropper | Recorte y rectificación de página | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- Modelo marcado como experimental por el propio autor; el campo `requires_review` es siempre `true` en la salida.
- Las etiquetas de entrenamiento proceden de selecciones de recorte guardadas por la aplicación y se consideran supervisión débil: un recorte guardado confirma el giro pero no prueba que un humano lo corrigiera.
- El modelo puede confundir una página con tablas en posición vertical con una página invertida; el autor lo señala como el caso más problemático y recomienda revisar cada giro, especialmente en libros nuevos con muchas tablas.
- En el grupo con muchas tablas, una respuesta constante "vertical" obtendría 0,984 de exactitud, por lo que la exactitud global oculta los errores en páginas rotadas; no es un detector de rotación validado para libros nuevos con muchas tablas.
- El modelo no recorta la página ni lee texto; requiere un recorte rectificado y cuadrado como entrada, idealmente producido por Book Page Cropper.
- No se incluyen fotos de origen en el repositorio, lo que limita la reproducibilidad de la evaluación por terceros.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido.
- No se documentan sesgos específicos ni limitaciones idiomáticas; al ser un clasificador de orientación, el idioma del texto no debería afectar a la tarea, pero no se aportan datos al respecto.
- Riesgo de alucinación no aplica en el sentido habitual de modelos generativos, pero sí existe riesgo de clasificación errónea con confianza alta en dominios no representados en el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Aananda-giri/book-page-turn
- Book Page Cropper (modelo previo del pipeline): https://huggingface.co/Aananda-giri/book-page-cropper
