# saa938/presonance-emoset-ensemble

## Resumen

Presonance EmoSet ensemble es un modelo de clasificación de emociones en imágenes desarrollado por el usuario saa938. No se trata de un transformer generativo, sino de un ensamblado de cuatro codificadores visuales (encoders) adaptados mediante fine-tuning a la tarea de predecir ocho categorías emocionales sobre el dataset EmoSet-118K. El paquete se distribuye como un repositorio timm personalizado de aproximadamente 4,2 GB, con pesos para los cuatro miembros y un script de inferencia (`predict.py`).

El modelo resuelve un problema acotado pero relevante: la clasificación automática de la emoción evocado por una imagen (amusement, awe, contentment, excitement, anger, disgust, fear, sadness) en lugar de la mera detección de objetos o escenas. Su interés actual radica en que reporta un 87,1077 % de accuracy sobre el split de test oficial de 17.716 imágenes de EmoSet, superando en 1,9982 puntos porcentuales a una reproducción del baseline PerceptCLIP publicado, con un intervalo de confianza bootstrap del 95 % de [1,6087, 2,3990].

La propuesta combina cuatro backbones de distinta procedencia (CLIP, EVA02, PE-Core y SigLIP2), todos ellos afinados y no simplemente usados como extractores congelados, y selecciona los checkpoints mediante validación sobre el split oficial de validación (5.905 imágenes). Es importante subrayar que las métricas son autoinformadas por el autor y no constituyen una verificación independiente ni un ranking certificado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ensamblado de cuatro codificadores visuales tipo transformer (ViT) con fine-tuning: EVA02-L14, PE-Core-L14, SigLIP2-giant y un cuarto miembro no especificado en la información disponible |
| Parámetros totales | No disponible (el autor no publica el recuento agregado; el repo pesa 4,2 GB) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (clasificación de imagen, no modelo de lenguaje) |
| Tipos de cuantización | Pesos servidos en FP16 tras serialización; no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible (la tarea es de clasificación visual, no lingüística) |
| Licencia | Apache-2.0 para las modificaciones propias; los componentes upstream conservan sus licencias (MIT y otras) |
| Formato de pesos | Pesos timm personalizados dentro del repositorio (no safetensors ni GGUF estándar); requiere descarga completa del repo |

## Arquitectura y entrenamiento

El sistema es un ensamblado heterogéneo de cuatro codificadores visuales. Según la model card, los fundamentos externos son OpenAI CLIP-L14, BAAI EVA02-L14, Meta PE-Core-L14 y Google SigLIP2-giant; los tags del repositorio confirman `timm/eva02_large_patch14_clip_336.merged2b`, `timm/vit_pe_core_large_patch14_336.fb` y `timm/vit_giantopt_patch16_siglip_384.v2_webli` como modelos base. Todos los backbones fueron afinados para la tarea de ocho clases, en lugar de entrenar únicamente una cabeza sobre características congeladas, lo que constituye la principal aportación técnica del autor junto con la selección del ensamblado.

El entrenamiento se realizó durante seis épocas por miembro, con los checkpoints seleccionados mediante el split oficial de validación de EmoSet (5.905 imágenes). No se documentan en la información disponible el número de tokens, la composición exacta del dataset ni el uso de RLHF o DPO (no aplicables a una tarea de clasificación). La inferencia se ejecuta de forma secuencial sobre los cuatro modelos y el autor recomienda activar TF32 (`torch.backends.cuda.matmul.allow_tf32 = True`) para la condición de ejecución validada.

## Capacidades

- Clasificación de imágenes en ocho categorías emocionales: amusement, awe, contentment, excitement, anger, disgust, fear y sadness.
- Ensemble de cuatro codificadores con fine-tuning específico de tarea, no solo extracción de características congeladas.
- Procesamiento por lotes (`batch_size` configurable, el ejemplo usa 64) mediante la API `EmoSetEnsemble.predict`.
- Ejecución secuencial de los cuatro miembros, apta para GPUs CUDA que puedan alojar al miembro de mayor tamaño.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un clasificador de imagen puro.
- No dispone de modo thinking, visión generativa, audio ni capacidades multilingües.
- Los resultados describen categorías emocionales asociadas a la imagen según el dataset, no los sentimientos reales de una persona ni inteligencia emocional.

## Casos de uso

- Moderación de contenido visual: clasificar imágenes subidas por usuarios en categorías como fear, disgust o anger para priorizar revisiones humanas en plataformas con gran volumen de contenido.
- Etiquetado automático de datasets multimedia: generar metadatos emocionales sobre grandes colecciones de imágenes para entrenar o enriquecer sistemas de recomendación y búsqueda.
- Investigación en psicología visual y afectiva: usar las predicciones como variable dependiente en estudios que analicen la respuesta emocional a estímulos visuales, con la cautela de que el modelo no mide emociones humanas reales.
- Análisis de creatividades publicitarias: evaluar de forma masiva qué emoción evoca un banner o una imagen de campaña antes de su publicación, comparando alternativas por categoría emocional.
- Curaduría de galerías y archivos fotográficos: organizar colecciones por tono emocional para experiencias de navegación o selección editorial.
- Filtrado previo en pipelines de visión por computador: como etapa de clasificación emocional dentro de un sistema mayor de análisis de imagen, aprovechando el ensemble para reducir falsos positivos frente a un único clasificador.
- Investigación sobre sesgos en modelos de emoción: servir como referencia reproducible (con los pesos exactos liberados) para estudiar cómo distintos backbones codifican categorías afectivas.

## Benchmarks y rendimiento

Datos autoinformados por el autor (no verificados de forma independiente), sobre el split de test oficial de EmoSet-118K con 17.716 imágenes:

| Modelo / condición | Accuracy en TEST oficial |
|---|---:|
| Este ensemble descargable (autor) | 87,1077 % |
| PerceptCLIP publicado (externo), reproducido sobre las mismas imágenes | 85,1095 % |
| Ensemble histórico previo a la serialización FP16 (autor, distinta precisión de estado) | 87,1246 % |
| Ensemble sin 229 imágenes casi duplicadas (17.487 imágenes) | 87,0189 % |

La ganancia frente a la reproducción de PerceptCLIP es de 1,9982 puntos porcentuales, con un intervalo de confianza bootstrap pareado del 95 % de [1,6087, 2,3990]. El autor advierte que la comparación es contra ese baseline publicado concreto, no contra todos los modelos frontera actuales, y que el proyecto ha inspeccionado repetidamente resultados de TEST, por lo que no debe interpretarse como una replicación prospectiva intacta.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio completo pesa unos 4,17 GB de pesos y los modelos se ejecutan secuencialmente, por lo que el pico de memoria corresponde al miembro de mayor tamaño (el SigLIP2-giant es el candidato más exigente).
- GPU recomendadas: se requiere una GPU CUDA capaz de alojar al miembro más grande; el autor no especifica modelos concretos.
- GPU de consumo: no se confirma que quepa en GPUs de consumo; el ejemplo oficial usa `device='cuda'` sin detallar la tarjeta.
- Despliegue: no es compatible con `AutoModel` de Transformers ni con endpoints de inferencia alojados; requiere descargar el repo completo, instalar `requirements` y usar el módulo `predict.py` con la clase `EmoSetEnsemble`.
- Latencia y throughput: no disponibles; al ejecutar cuatro modelos de forma secuencial, el coste por imagen es aproximadamente la suma de los cuatro pases, mitigable con procesamiento por lotes.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Accuracy EmoSet TEST | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Presonance EmoSet ensemble | Ensemble de 4 ViT afinados | No disponible | No aplica | 87,1077 % (autoinformado) | Apache-2.0 (modificaciones) | Hugging Face, repo timm personalizado |
| PerceptCLIP (referencia del autor) | CLIP afinado | No disponible | No aplica | 85,1095 % (replay del autor) | Según su repo | Publicado externamente |
| EVA02-L14 (base) | ViT | No disponible en la información | No aplica | No disponible para EmoSet sin fine-tuning | Según timm/BAAI | timm |
| SigLIP2-giant (base) | ViT | No disponible en la información | No aplica | No disponible para EmoSet sin fine-tuning | Según Google/timm | timm |

No se dispone de datos de benchmarks de otros clasificadores de emoción comparables en la información proporcionada.

## Limitaciones y advertencias

- Las métricas son autoinformadas por el autor y no han sido verificadas de forma independiente; no constituyen un ranking de competición ni un récord certificado.
- El proyecto ha inspeccionado repetidamente resultados de TEST, por lo que la evaluación no es una replicación prospectiva intacta; puede existir sobreajuste al split de test.
- El solapamiento con datos de preentrenamiento de los backbones es desconocido; el cribado de huellas no detecta todo el solapamiento semántico o de fuente.
- Riesgo de sesgo: las categorías emocionales de EmoSet reflejan anotaciones humanas subjetivas y pueden incorporar sesgos culturales o demográficos.
- Las predicciones describen categorías emocionales del dataset asociadas a la imagen, no los sentimientos reales de una persona ni inteligencia emocional; no deben usarse para inferir estados afectivos individuales.
- Licencia: las modificaciones propias son Apache-2.0, pero los componentes upstream conservan sus licencias (MIT y otras); es necesario revisar `NOTICE` y los avisos incluidos.
- El dataset EmoSet tiene su propia licencia de código que no resuelve por sí sola los derechos sobre todas las fotografías; hay que comprobar los términos originales antes de reutilizar los datos.
- No es un modelo de lenguaje: carece de soporte multilingüe, tool calling o razonamiento; su uso está restringido a clasificación de imagen.
- Requiere descargar el repositorio completo (unos 4,17 GB) y ejecutar los cuatro modelos de forma secuencial, lo que incrementa el coste de inferencia frente a un clasificador único.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saa938/presonance-emoset-ensemble
- Repositorio de EmoSet: https://github.com/JingyuanYY/EmoSet
- Página del proyecto EmoSet: https://vcc.tech/EmoSet
- Repositorio de OpenAI CLIP: https://github.com/openai/CLIP
- Repositorio de BAAI EVA: https://github.com/baaivision/EVA
- Repositorio de Meta Perception Models: https://github.com/facebookresearch/perception_models
- Paper de referencia (arXiv 2502.14786): https://arxiv.org/abs/2502.14786
- Paper de PerceptCLIP (arXiv 2503.13260): https://arxiv.org/abs/2503.13260
