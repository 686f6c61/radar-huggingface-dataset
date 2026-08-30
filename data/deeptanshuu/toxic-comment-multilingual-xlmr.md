# Deeptanshuu/toxic-comment-multilingual-xlmr

## Resumen

`toxic-comment-multilingual-xlmr` es un modelo de clasificación multi‑etiqueta de toxicidad en comentarios en línea, desarrollado por Deeptanshuu. Está diseñado para detectar seis categorías de contenido tóxico —toxicidad, toxicidad severa, obscenidad, amenaza, insulto y discurso de odio— en siete idiomas: inglés, ruso, turco, español, francés, italiano y portugués. El modelo se basa en XLM‑RoBERTa‑large, al que se le añade un bloque de atención adicional cuyos scores incorporan un sesgo por idioma, seguido de una pequeña cabeza de clasificación que emite seis probabilidades independientes mediante sigmoides.

La relevancia de este modelo radica en su enfoque multilingüe y multi‑etiqueta, que permite moderar contenido en varios idiomas con una sola arquitectura, algo poco común en soluciones de moderación. Además, al tratarse de una arquitectura personalizada, requiere `trust_remote_code=True` para cargarse desde Hugging Face, lo que implica un manejo cuidadoso en entornos de producción. El modelo se distribuye bajo licencia Apache‑2.0 y su repositorio ocupa 2,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM‑RoBERTa‑large + bloque de atención con sesgo por idioma + cabeza de clasificación multi‑etiqueta |
| Parametros totales | No disponible (basado en XLM‑RoBERTa‑large, ~560M, más el bloque adicional) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (según el código de ejemplo) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en, ru, tr, es, fr, it, pt |
| Licencia | Apache‑2.0 |
| Formato de pesos | No disponible (repo de 2,3 GB, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo parte de XLM‑RoBERTa‑large, un transformer encoder pre‑entrenado multilingüe. Sobre su representación final se añade un bloque de atención extra cuyos scores de atención se modifican con un sesgo aprendido por idioma (`lang_ids`), lo que permite que el modelo adapte su comportamiento según la lengua del comentario. Tras este bloque, una cabeza de clasificación compuesta por seis sigmoides independientes produce las probabilidades para cada etiqueta, ya que las categorías no son exclusivas (un comentario puede ser tóxico y obsceno a la vez).

No se han publicado detalles sobre el corpus de entrenamiento, el número de tokens o el proceso de ajuste (si hubo RLHF, DPO, etc.). La model card menciona que el dataset es un corpus derivado de Jigsaw multilingüe con siete idiomas, pero no se especifican más datos. La arquitectura personalizada se define en el archivo `modeling_toxic_xlmr.py` del repositorio, y el forward pass requiere tres entradas: `input_ids`, `attention_mask` y `lang_ids` (un entero por secuencia que codifica el idioma).

## Capacidades

- Clasificación multi‑etiqueta de toxicidad en seis categorías: `toxic`, `severe_toxic`, `obscene`, `threat`, `insult`, `identity_hate`.
- Soporte multilingüe para siete idiomas: inglés, ruso, turco, español, francés, italiano y portugués.
- Emisión de probabilidades independientes por etiqueta mediante sigmoides, lo que permite que un comentario active varias categorías simultáneamente.
- Ajuste de umbrales por etiqueta mediante el archivo `thresholds.json`, lo que permite calibrar la sensibilidad del modelo según el caso de uso.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi‑paso; es exclusivamente un clasificador de texto.

## Casos de uso

- Moderación de comentarios en plataformas sociales: el modelo puede analizar comentarios en varios idiomas y marcar automáticamente aquellos que contengan toxicidad, insultos o discurso de odio, permitiendo a los moderadores priorizar la revisión humana.
- Filtrado de contenido en foros y comunidades en línea: integrado en un pipeline de pre‑publicación, puede bloquear o poner en cuarentena comentarios que superen los umbrales de toxicidad, reduciendo la carga de moderación manual.
- Análisis de sentimiento tóxico en encuestas o reseñas: permite identificar patrones de abuso o acoso en datos históricos, útil para estudios sociológicos o de mercado.
- Monitorización de chats en juegos multijugador: al soportar varios idiomas, puede detectar comportamientos tóxicos en tiempo real y activar sanciones automáticas.
- Cumplimiento de políticas de contenido en plataformas de streaming o redes sociales: ayuda a garantizar que el contenido generado por usuarios cumpla las normas comunitarias, con la ventaja de cubrir múltiples idiomas sin necesidad de modelos separados.
- Investigación académica sobre toxicidad multilingüe: sirve como herramienta de anotación automática para construir datasets etiquetados en varios idiomas, gracias a su capacidad multi‑etiqueta y a los umbrales ajustables.

## Benchmarks y rendimiento

Según los resultados declarados por el autor en la model card, el modelo fue evaluado en un corpus de toxicidad multilingüe derivado de Jigsaw (7 idiomas, split de test). Los resultados son los siguientes:

| Metrica | Valor |
|---|---|
| Macro AUC‑ROC | 0,9852 |
| Macro F1 (umbrales ajustados) | 0,8814 |
| Macro F1 (umbral 0,5) | 0,8821 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: al estar basado en XLM‑RoBERTa‑large (~560M parámetros), la inferencia en FP16 requiere aproximadamente 1,5‑2 GB de VRAM, más el bloque adicional y los estados intermedios. En FP32, la demanda puede superar los 3 GB. No se dispone de datos exactos del modelo final.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050) puede ejecutar el modelo en FP16. Para lotes grandes o despliegue concurrente, se recomienda una GPU con 8 GB o más (RTX 3070, A10, etc.).
- En consumer GPU: sí, cabe en GPUs de gama media con 4‑6 GB de VRAM si se usa FP16 y se limita el tamaño de lote.
- Opciones de despliegue: al ser una arquitectura personalizada, no es compatible directamente con vLLM, llama.cpp u Ollama. Se puede servir mediante Hugging Face Inference Endpoints o un contenedor propio con Transformers y `trust_remote_code=True`. También es posible exportar a ONNX para optimizar la inferencia, aunque no se documenta en el repositorio.
- Latencia y throughput: no se han publicado mediciones. Como referencia, un transformer de ~560M parámetros en una GPU moderna procesa decenas de secuencias por segundo, pero depende del hardware y del tamaño de lote.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Etiquetas | Licencia | Contexto |
|---|---|---|---|---|---|
| `toxic-comment-multilingual-xlmr` (este) | XLM‑RoBERTa‑large + atención con sesgo por idioma | 7 (en, ru, tr, es, fr, it, pt) | 6 (multi‑etiqueta) | Apache‑2.0 | 512 tokens |
| `Deeptanshuu/Multilingual_Toxic_Comment_Classifier` | XLM‑RoBERTa (probablemente base) | 6 (según tags) | No especificado | No especificada | No disponible |
| `Gowry11/multilingual-toxic-comment-classification` (proyecto) | XLM‑RoBERTa fine‑tuned | Multilingüe (no especificado) | Binaria (tóxico/no tóxico) | No especificada | No disponible |

La comparativa se basa en la información pública de los repositorios; no se dispone de benchmarks comparativos entre ellos.

## Limitaciones y advertencias

- La model card advierte explícitamente sobre limitaciones conocidas y usos fuera de alcance, pero el contenido de esas secciones no se ha incluido en la información disponible. Se recomienda leerlas antes de desplegar el modelo.
- El modelo es exclusivamente un clasificador; no genera texto ni realiza razonamiento complejo.
- La arquitectura personalizada requiere ejecutar código remoto (`trust_remote_code=True`), lo que introduce riesgos de seguridad si el repositorio se ve comprometido. Se recomienda auditar el código antes de usarlo en producción.
- El rendimiento en idiomas no incluidos en el entrenamiento (p. ej., alemán, chino) no está garantizado y probablemente sea deficiente.
- Los umbrales por defecto en `thresholds.json` pueden no ser óptimos para todos los casos de uso; es necesario calibrarlos con datos propios.
- No se han publicado detalles sobre sesgos demográficos o culturales del modelo, aunque los modelos de toxicidad suelen presentar sesgos hacia ciertos dialectos o jergas.
- El riesgo de alucinación no aplica al ser un clasificador, pero sí existe la posibilidad de falsos positivos o negativos en la detección de toxicidad, especialmente en contextos de ironía o sarcasmo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Deeptanshuu/toxic-comment-multilingual-xlmr
- Proyecto relacionado (clasificador multilingüe anterior): https://huggingface.co/Deeptanshuu/Multilingual_Toxic_Comment_Classifier
- Página del proyecto del autor: https://www.deeptanshu.tech/projects/toxic-comment-classification
- Repositorio GitHub del proyecto: https://github.com/Deeptanshuu/Toxic-Comment-Classification-using-Deep-Learning
- Proyecto similar de otro autor: https://github.com/Gowry11/multilingual-toxic-comment-classification
