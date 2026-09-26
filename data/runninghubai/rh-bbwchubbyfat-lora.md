# RunningHubAI/rh-bbwchubbyfat-lora

## Resumen

rh-bbwchubbyfat-lora es un adaptador LoRA de generación de imágenes a partir de texto (text-to-image) publicado en Hugging Face por RunningHubAI en nombre de su autor, identificado en la model card como @公子兰, dentro del ecosistema de modelos de la plataforma RunningHub. El adaptador se distribuye como un único fichero `lanqw2.1v1_c1-st5000.safetensors` de 80 MiB (repositorio de 0,1 GB) y está pensado para cargarse sobre el modelo base declarado en la ficha: qwen-image-2.1.

El modelo no es un modelo generativo completo, sino un ajuste fino de bajo rango que modifica el comportamiento del modelo base para especializarlo en la representación de una morfología corporal concreta (cuerpo de tipo BBW con proporciones exageradas), activada mediante palabras clave específicas. Por tanto, sus capacidades, requisitos de hardware y licencia efectiva quedan supeditados al modelo base sobre el que se aplique.

Su relevancia es fundamentalmente práctica y de ecosistema: ilustra el flujo actual de publicación de adaptadores ligeros (decenas de MiB frente a decenas de GiB) entrenados en plataformas gestionadas como RunningHub y consumidos directamente desde ComfyUI, sin necesidad de reentrenar el modelo completo. No se dispone de información sobre arquitectura interna del adaptador, datos de entrenamiento, licencia explícita ni resultados de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo base de difusión text-to-image; arquitectura interna del adaptador no disponible |
| Parámetros totales | no disponible (adaptador LoRA; el fichero de pesos pesa 80 MiB) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del codificador de texto del modelo base) |
| Tipos de cuantización | no disponible; solo se publica un fichero safetensors, sin variantes GGUF ni cuantizadas documentadas |
| Idiomas soportados | no disponible (la model card no documenta idiomas de prompting) |
| Licencia | no disponible; la ficha indica que el copyright permanece en el autor y que se debe seguir la licencia del proyecto original o del modelo upstream |
| Formato de pesos | safetensors (LoRA) |
| Modelo base declarado | qwen-image-2.1 (fine-tuned from) |
| Tamaño del repositorio | 0,1 GB |
| Fichero principal | `lanqw2.1v1_c1-st5000.safetensors` (80 MiB) |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Palabras de activación | lan, extremely exaggerated massive breasts, gigantic thigh, wide hips, fat woman |
| Pipeline | text-to-image |

## Arquitectura y entrenamiento

La información proporcionada no describe la arquitectura del adaptador más allá de su naturaleza LoRA (Low-Rank Adaptation), técnica que congela los pesos del modelo base e inyecta matrices de bajo rango entrenables en determinadas capas, reduciendo drásticamente el número de parámetros a optimizar y el tamaño del artefacto resultante. No se especifican rank, alpha, capas objetivo ni el módulo exacto (atención cruzada, atención propia, bloques de proyección) sobre el que se aplica el ajuste.

Respecto al entrenamiento, la model card únicamente declara que el adaptador se ha afinado desde qwen-image-2.1 y que el entrenamiento se ha realizado en la infraestructura de RunningHub, que ofrece servicio de entrenamiento de modelos. El nombre del fichero (`...st5000...`) sugiere un checkpoint correspondiente al paso 5000 del entrenamiento, pero se trata de una inferencia a partir del nombre y no de un dato confirmado en la documentación. No hay información sobre volumen de tokens o imágenes, composición del dataset, técnicas de alineación (RLHF, DPO), resolución de entrenamiento, ni innovaciones técnicas destacables.

## Capacidades

- Generación de imágenes a partir de texto cuando se aplica sobre el modelo base qwen-image-2.1, modificando la distribución de salida hacia una morfología corporal concreta.
- Activación mediante palabras clave documentadas: `lan`, `extremely exaggerated massive breasts`, `gigantic thigh`, `wide hips`, `fat woman`.
- Integración en flujos de ComfyUI como nodo de carga de LoRA, con posibilidad de ajustar el peso del adaptador (strength).
- Compatibilidad declarada con la plataforma RunningHub, incluida la ejecución mediante API.
- No dispone de generación de texto, razonamiento, código ni matemáticas: es un adaptador de imagen, no un modelo de lenguaje.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe ni modo de pensamiento (thinking mode), visión o audio.
- No se documenta soporte de inpainting, control por pose, img2img o cualquier otro condicionamiento adicional; dichas capacidades, si existen, procederían del modelo base.

## Casos de uso

- Ilustración editorial y arte digital: generación de personajes con cuerpos no normativos para cómics, fanzines o narrativa gráfica, usando el adaptador con un peso moderado para mantener variedad sin perder el estilo objetivo.
- Previsualización de vestuario en tallas grandes: prototipado rápido de ideas de diseño o de looks sobre siluetas corporales concretas antes de pasar a producción textil o a una sesión fotográfica real.
- Producción de contenido para comunidades específicas: creación de ilustraciones para comunidades que demandan representación de corporalidades diversas, siempre que el resultado se ajuste a las políticas de contenido aplicables.
- Pipelines automatizados de generación por lotes: integración del LoRA en ComfyUI y ejecución desatendida mediante la API de RunningHub para producir variaciones de un mismo personaje con consistencia de proporciones.
- Entrenamiento y ajuste en cadena: uso del adaptador como punto de partida para un segundo LoRA que añada estilo, vestuario o identidad facial concreta, aprovechando el bajo coste del adaptador base (80 MiB).
- Investigación sobre adaptación de bajo rango: estudio comparativo de cómo un LoRA de 80 MiB modifica la distribución de salida de un modelo de difusión grande, útil para experimentos de control de sesgo y de composición de adaptadores.
- Generación de material de referencia para modelado 3D o escultura digital: producción de vistas de personaje con proporciones exageradas como referencia visual, no como sustituto de un modelado métrico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (FID, CLIP score, evaluaciones humanas), ni comparaciones cuantitativas con otros adaptadores o con el modelo base sin el LoRA.

## Requisitos de hardware

- El adaptador en sí ocupa 80 MiB en disco y en memoria, por lo que su coste adicional es despreciable frente al modelo base.
- La VRAM necesaria para inferencia viene determinada íntegramente por el modelo base qwen-image-2.1 y por la resolución de generación; no se dispone de cifras oficiales en la información proporcionada.
- Tarjetas recomendadas: no disponible. La viabilidad en GPU de consumo (RTX 3060, 4070, 4090, etc.) depende del modelo base, de la resolución y del uso de cuantizaciones o de offloading de memoria, no del adaptador.
- Opciones de despliegue documentadas: ComfyUI (local), plataforma RunningHub (ejecución alojada) y su API. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no aplican a un modelo de difusión de imagen.
- Latencia y throughput: no disponible. No se publican mediciones de tiempo por imagen ni de imágenes por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Tamaño de pesos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-bbwchubbyfat-lora | LoRA text-to-image | qwen-image-2.1 | 80 MiB | no disponible | no disponible | Hugging Face, ComfyUI, RunningHub |
| BBW body shape (RunningHub) | LoRA text-to-image | no disponible | no disponible | no disponible | no disponible | RunningHub |
| rh-2101354719968059394-lora | LoRA (ComfyUI) | no disponible | 79,4 MB | no disponible | no disponible | Hugging Face, RunningHub |
| loragirl personal face model 2 | LoRA de identidad facial | no disponible | no disponible | no disponible | no disponible | RunningHub |

No se dispone de datos de rendimiento, parámetros ni licencia de las alternativas listadas, por lo que la comparación cuantitativa no es posible con la información disponible.

## Limitaciones y advertencias

- Contenido para adultos: las palabras de activación y el propósito declarado del adaptador apuntan a la generación de contenido de carácter sexualizado y a la exageración anatómica. Debe verificarse la normativa aplicable y las políticas de la plataforma de destino antes de cualquier uso o publicación.
- Licencia no disponible: la ficha indica que el copyright permanece en el autor y remite a la licencia del proyecto original o del upstream, sin especificarla. No hay garantía documentada de uso comercial; se recomienda contactar con el autor o con RunningHub antes de un despliegue comercial.
- Licencia del modelo base: al ser un adaptador, su uso está además condicionado por la licencia de qwen-image-2.1, que no se detalla en la información proporcionada.
- Ausencia total de evaluación: cero descargas y cero likes en el momento de la consulta, sin benchmarks ni validación comunitaria publicada.
- Documentación mínima: no se especifican datos de entrenamiento, resolución, rank del LoRA, hiperparámetros ni procedimiento de uso recomendado.
- Riesgo de artefactos anatómicos: los adaptadores que fuerzan proporciones extremas tienden a producir deformaciones en manos, extremidades y transiciones entre partes del cuerpo; el autor no documenta estrategias de mitigación ni valores de peso recomendados.
- Sesgo y estereotipado: el adaptador codifica una representación muy concreta y exagerada de la corporalidad, lo que puede reforzar estereotipos si se usa sin supervisión editorial.
- Riesgo de sobreajuste al conjunto de activación: el nombre del checkpoint sugiere un entrenamiento prolongado (paso 5000), lo que habitualmente reduce la diversidad de las salidas y aumenta la dependencia de las palabras de activación exactas. No confirmado por el autor.
- Sin soporte ni mantenimiento declarados: el repositorio contiene únicamente pesos y una model card generada por la plataforma, sin issues, demos ni código de ejemplo.
- Metadatos inconsistentes: la descripción interna menciona `qwen2.1_v3` mientras que el campo de fine-tuning indica `qwen-image-2.1`; conviene verificar el modelo base exacto antes de cargar el adaptador.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-bbwchubbyfat-lora
- README en chino (relativo al repositorio): README_cn.md
- Proyecto original en RunningHub: https://www.runninghub.ai/model/public/2102577482733043714
- Página del autor: https://www.runninghub.ai/user-center/2061342532759281665
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio China): https://www.runninghub.cn
- Documentación de la API de RunningHub (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Perfil de RunningHubAI en Hugging Face: https://huggingface.co/RunningHubAI
- LoRA relacionado en RunningHub (BBW body shape): https://www.runninghub.ai/model/public/2050561359976386561
- LoRA relacionado en RunningHub (loragirl personal face model 2): https://www.runninghub.ai/model/public/1900918213285421057
- Repositorio de ejemplo de otro LoRA de RunningHubAI: https://huggingface.co/RunningHubAI/rh-2101354719968059394-lora/tree/main
- Listado de modelos gratuitos (referencia externa): https://github.com/ClawLabsAI/free-ai-models
