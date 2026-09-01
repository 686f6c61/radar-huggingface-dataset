# PadishahIIIXXX/latex-ocr

## Resumen

Latex-ocr es un modelo de reconocimiento óptico de fórmulas matemáticas (OCR) que convierte imágenes de fórmulas renderizadas en código fuente LaTeX. Lo desarrolla PadishahIIIXXX y se publica bajo licencia MIT, con el objetivo de ofrecer una solución ligera y accesible para digitalizar expresiones matemáticas sin necesidad de hardware especializado. El modelo se basa en la arquitectura CoCa (Contrastive Captioner), adaptada para OCR, con un encoder visual Swin-Small preentrenado en ImageNet-22k y un decodificador de texto dual. Tiene 67 millones de parámetros y acepta imágenes de 192 × 672 píxeles, produciendo secuencias LaTeX mediante búsqueda de haz autoregresiva.

La relevancia actual de este modelo radica en su capacidad para ejecutarse en una CPU de portátil sin GPU, lo que democratiza el acceso a la conversión de fórmulas matemáticas en entornos educativos y de investigación. Además, incorpora un entrenamiento en dos etapas sobre un dataset sintético de más de 1,2 millones de imágenes, con un enriquecimiento estilístico que le permite reconocer y emitir macros de fuente LaTeX como `\mathbf` o `\mathcal`. Aunque el repositorio es reciente y tiene pocas descargas, su diseño compacto y su licencia permisiva lo convierten en una alternativa interesante frente a modelos más pesados como UniMERNet.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CoCa (Swin encoder + decodificador de texto unimodal/multimodal) |
| Parametros totales | 67 millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Imagen de entrada 192 × 672 píxeles; límite de generación de 354 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo emite exclusivamente código LaTeX) |
| Licencia | MIT |
| Formato de pesos | Checkpoint PyTorch completo (`model.pth`, formato MLflow/pytorch-logged) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura CoCa, diseñada originalmente para tareas de captioning contrastivo. El encoder visual es un Swin-Small preentrenado en ImageNet-22k, que produce una cuadrícula de tokens de imagen de 384 dimensiones. Sobre esta cuadrícula se aplica un pooling atencional con 256 queries aprendidas más una query CLS, comprimiendo la información visual en una representación fija independiente del tamaño de la imagen. El texto se procesa mediante dos decodificadores: un decodificador unimodal (solo self-attention causal) que genera un embedding CLS de texto para la pérdida contrastiva, y un decodificador multimodal (self-attention + cross-attention sobre las queries de imagen) que produce los logits de captioning utilizados en inferencia. Los embeddings de entrada y la proyección de salida comparten pesos para reducir el tamaño del modelo.

El entrenamiento se realiza en dos etapas sobre el dataset `PadishahIIIXXX/latex-ocr-dataset`. Primero, un pretrain sobre la configuración `plain`, que contiene aproximadamente 1,14 millones de fórmulas re-renderizadas y saneadas procedentes de UniMER-1M y LaTeX-OCR. Después, un finetune sobre una mezcla de las configuraciones `plain` y `styled`, donde la segunda inyecta macros de fuente LaTeX (`\mathbf`, `\mathbb`, `\mathcal`, etc.) mediante heurísticas semánticas. El finetune se divide en dos subetapas: primero se congela el encoder y después se entrena de extremo a extremo. La función de pérdida combina la entropía cruzada de captioning (con λ = 2.0 y label smoothing 0.1) con una pérdida contrastiva imagen-texto (λ = 1.0) al estilo CLIP.

## Capacidades

- Conversión de imágenes de fórmulas matemáticas (renderizadas o generadas sintéticamente) a código LaTeX.
- Reconocimiento de estilos de fuente tipográfica: `\mathbf`, `\mathbb`, `\mathcal`, `\mathit`, `\mathrm`, `\mathsf`, `\mathtt`, `\mathfrak` y `\mathscr`, gracias al entrenamiento con el split `styled`.
- Generación autoregresiva con búsqueda de haz (beam size 4) y un límite de 354 tokens de salida.
- Inferencia eficiente en CPU de portátil, sin necesidad de GPU.
- Vocabulario LaTeX de 1.122 tokens gestionado con un tokenizador SentencePiece.
- No incluye soporte para tool calling, agentes ni razonamiento multi-paso; es un modelo puramente de visión a texto.

## Casos de uso

- Digitalización de apuntes y libros de matemáticas: el modelo puede convertir capturas de pantalla o escaneos de fórmulas en código LaTeX editable, facilitando la reutilización en documentos digitales.
- Accesibilidad para personas con discapacidad visual: al transformar fórmulas impresas en texto LaTeX, se puede integrar en lectores de pantalla o sistemas de braille para hacer accesible el contenido matemático.
- Integración en editores de documentos científicos: un plugin o extensión que permita al usuario pegar una imagen de fórmula y obtener el código LaTeX directamente en Overleaf o TeXStudio.
- Automatización de corrección de exámenes: en plataformas educativas, el modelo puede extraer las expresiones matemáticas de las respuestas manuscritas o impresas para su posterior análisis y evaluación.
- Indexación y búsqueda de documentos matemáticos: al convertir fórmulas a texto, se pueden indexar en motores de búsqueda y permitir la búsqueda por contenido matemático.
- Generación de materiales de estudio: estudiantes o docentes pueden fotografiar fórmulas de pizarras o libros y obtener versiones digitales para incluirlas en resúmenes o presentaciones.
- Asistente en entornos de investigación: extracción de fórmulas de artículos científicos escaneados para su reproducción en papers o informes técnicos.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en las particiones de test del dataset `PadishahIIIXXX/latex-ocr-dataset`. No se han publicado comparativas con otros modelos en la información disponible.

| Tarea | Dataset (split) | BLEU ↑ | Exact match ratio | Edit distance ↓ |
|---|---|---|---|---|
| LaTeX formula OCR | plain test (23.868 items) | 0,8737 | 0,5220 | 0,0695 |
| LaTeX formula OCR (styled) | styled test (2.955 items) | 0,9049 | 0,5316 | 0,0562 |

Estos valores indican un rendimiento sólido en el conjunto de datos sintético, con una ligera mejora en el split estilizado. No se dispone de resultados en conjuntos de datos reales como UniMER o LaTeX-OCR original.

## Requisitos de hardware

- Inferencia en CPU de portátil, sin GPU requerida (según el autor).
- Tamaño del checkpoint: 0,3 GB (~67M parámetros en precisión FP32).
- VRAM estimada: no aplica para CPU; si se ejecutara en GPU, cabría en cualquier GPU con al menos 2 GB de VRAM, pero no se indica soporte explícito.
- GPU recomendadas: no se especifican; el modelo está pensado para CPU.
- Opciones de despliegue: carga directa mediante PyTorch con el checkpoint `model.pth`; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la documentación.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados entre este modelo y sus alternativas. A continuación se enumeran los modelos más cercanos, pero sin métricas verificadas:

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| latex-ocr (este) | CoCa (Swin-Small + decodificador dual) | 67M | Imagen 192×672 | MIT | HuggingFace |
| LaTeX-OCR (lukas-blecher) | ViT + transformador | ~100M (estimado) | Imagen variable | MIT | GitHub |
| UniMERNet | Desconocida (modelo de opendatalab) | No disponible | No disponible | No disponible | GitHub |

No hay datos de benchmarks comparativos en la información disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente con imágenes sintéticas renderizadas; el rendimiento en fotografías reales, manuscritas o con ruido puede degradarse.
- Tamaño de entrada fijo de 192 × 672 píxeles; las imágenes fuera de esta proporción se deben redimensionar, lo que puede distorsionar fórmulas pequeñas o muy densas.
- Límite de generación de 354 tokens; fórmulas extremadamente largas pueden truncarse.
- El vocabulario LaTeX está restringido a 1.122 tokens; construcciones avanzadas o paquetes poco comunes podrían no estar soportados.
- No se han evaluado sesgos ni se ha probado en dominios fuera del dataset sintético.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento en producción.
- El repositorio tiene un número muy bajo de descargas y no se ha verificado su robustez en entornos reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PadishahIIIXXX/latex-ocr
- Dataset en HuggingFace: https://huggingface.co/datasets/PadishahIIIXXX/latex-ocr-dataset
- Código de entrenamiento (GitHub): https://github.com/PadishahIII/latex-ocr
- Documentación de benchmarks (GitHub): https://github.com/PadishahIII/latex-ocr#benchmarks
- Paper de referencia de CoCa (arXiv:2205.01917): https://arxiv.org/abs/2205.01917
