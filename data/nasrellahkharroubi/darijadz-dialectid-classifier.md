# nasrellahkharroubi/DarijaDZ-DialectID-Classifier

## Resumen
El modelo `DarijaDZ-DialectID-Classifier` es un clasificador de identificación de dialecto y lengua desarrollado por nasrellahkharroubi, dentro del ecosistema DarijaDZ. Resuelve la tarea de distinguir entre árabe estándar moderno (MSA), darija argelina, arabizi (árabe transcrito en alfabeto latino), francés e inglés en textos cortos de redes sociales. En lugar de ser un modelo generativo, se basa en un SVM con kernel RBF sobre características TF-IDF de n-gramas de caracteres, con dos modelos separados según el guion del texto.

Es relevante porque ofrece una solución ligera y competitiva para clasificación de dialectos, y según la model card superó a doce métodos comparados en la misma tarea. No dispone de longitud de contexto ni de parámetros masivos al tratarse de un clasificador clásico de scikit-learn.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SVM con kernel RBF sobre características TF-IDF de n-gramas de caracteres; dos modelos separados por guion (árabe y latino) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Árabe (MSA y darija), arabizi, francés e inglés |
| Licencia | MIT |
| Formato de pesos | `skops` (archivos `.skops`) |

## Arquitectura y entrenamiento
El modelo está compuesto por dos SVM independientes con kernel RBF. El texto se procesa primero por una regla determinista que detecta si contiene caracteres árabes, latinos o ambos. Si el texto contiene ambos guiones, se clasifica directamente como `code_switch` sin invocar ningún modelo. Si solo contiene escritura árabe, se envía al modelo `arabic_*`, restringido a las clases `msa` y `darija`. Si solo contiene escritura latina, se envía al modelo `latin_*`, restringido a `arabize`, `french` y `english`.

Para el entrenamiento se usó el dataset `DarijaDZ-DialectID`, compuesto por 30.000 filas, con una división estratificada 80/20 para evaluación. El modelo árabe utiliza trigramas de caracteres con TF-IDF y un vocabulario de 3.000 términos; el modelo latino utiliza bigramas de caracteres con TF-IDF y el mismo tamaño de vocabulario. La elección de n-gramas se basó en el trabajo de Baldwin y Lui (NAACL 2010). Según la model card, se compararon doce métodos diferentes en esta tarea y esta arquitectura fue la que obtuvo mejores resultados. No se aplicaron técnicas de RLHF ni DPO.

## Capacidades
- Clasificación de texto corto en cinco etiquetas: `msa`, `darija`, `arabize`, `french` y `english`.
- Detección de `code_switch` mediante una regla determinista basada en la presencia simultánea de escritura árabe y latina.
- Clasificación por guion: los textos en escritura árabe se evalúan con el modelo árabe, y los textos en escritura latina con el modelo latino.
- Cubre árabe estándar moderno, darija argelina, arabizi, francés e inglés.
- No es un modelo generativo: no puede generar texto, mantener conversaciones, razonar ni ejecutar tool calling.
- Es ligero y ejecutable en CPU, lo que lo hace adecuado para entornos con recursos limitados.

## Casos de uso
- Moderación de comentarios en redes sociales argelinas: permite filtrar automáticamente mensajes escritos en darija, francés o code-switch para aplicar políticas de contenido específicas por idioma.
- Etiquetado de corpus para entrenamiento de otros modelos de NLP: se puede usar para separar textos por dialecto o idioma antes de entrenar modelos de NER, análisis de sentimiento o traducción.
- Preprocesamiento en pipelines de traducción automática: identifica si un texto está en árabe, darija, francés o inglés, y así selecciona el modelo de traducción o el diccionario adecuado.
- Análisis de sentimiento multilingüe: clasifica primero el idioma o dialecto y después aplica un modelo de sentimiento específico para cada lengua, mejorando la precisión global.
- Enrutamiento en sistemas de atención al cliente: detecta automáticamente el idioma o dialecto de un mensaje entrante y lo dirige al agente o bot correspondiente.
- Detección de arabizi: identifica textos escritos en árabe con alfabeto latino, lo que resulta útil para pasarlos a un transliterador posterior como el `DarijaDZ Arabizi Transliterator`.
- Investigación sociolingüística: permite analizar la distribución de dialectos y lenguas en corpus de redes sociales argelinas a partir de datos de YouTube.

## Benchmarks y rendimiento
Según la model card, los resultados medidos sobre una división 80/20 del dataset completo son los siguientes:

| Grupo | Accuracy | Recall por clase |
|---|---|---|
| `arabic` (`msa`/`darija`) | 0.8271 | msa: 0.619, darija: 0.927 |
| `latin` (`arabize`/`french`/`english`) | 0.8616 | arabize: 0.923, french: 0.843, english: 0.563 |

No se han publicado resultados de benchmarks comparativos con otros clasificadores externos en la información disponible. La model card indica que esta arquitectura superó a 12 métodos internos, pero no se aportan datos cuantitativos de esas comparaciones.

## Requisitos de hardware
- VRAM estimada: 0 MB; no requiere GPU para inferencia.
- GPU recomendada: ninguna. El modelo se ejecuta completamente en CPU.
- RAM mínima: suficiente para cargar dos vectorizadores y dos SVM; los archivos son pequeños, aunque el valor exacto no está disponible.
- Despliegue: Python con `scikit-learn` y `skops`. No es compatible con `vLLM`, `llama.cpp`, `Ollama` ni `TGI`.
- Latencia y throughput: no disponible, aunque al ser un SVM con características TF-IDF se espera una respuesta muy rápida en textos cortos.

## Comparativa con modelos similares
No se dispone de benchmarks comparativos publicados con otros clasificadores de dialecto en la información proporcionada. La model card menciona que superó a 12 métodos internos del mismo estudio, pero no se detallan los resultados individuales de cada método. Por tanto, no es posible presentar una comparación cuantitativa con modelos similares.

## Limitaciones y advertencias
- Las clases minoritarias del dataset, `msa` (13.5% de los datos) y `english` (2.5%), presentan un recall menor: 0.619 y 0.563 respectivamente.
- La identificación depende de la detección de guiones por expresiones regulares. Textos sin contenido real en árabe o latino se clasifican como `other`, y no hay clase para otros idiomas.
- El modelo está entrenado con comentarios de YouTube argelinos, por lo que puede estar sesgado hacia el registro informal y los temas predominantes en ese corpus.
- Es un clasificador clásico y no puede generar explicaciones ni razonamiento. La decisión de código mixto es determinista y no se basa en el modelo.
- Al ser un modelo de n-gramas de caracteres, puede fallar con variaciones ortográficas muy atípicas, especialmente en arabizi con ortografías no convencionales.
- Licencia MIT: permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de copyright y licencia.
- El riesgo de alucinación no aplica, ya que el modelo no genera texto.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/nasrellahkharroubi/DarijaDZ-DialectID-Classifier
- Dataset de identificación de dialecto: https://huggingface.co/datasets/nasrellahkharroubi/DarijaDZ-DialectID
- Corpus DarijaDZ: https://huggingface.co/datasets/nasrellahkharroubi/DarijaDz
- Transliterador de arabizi: https://huggingface.co/spaces/nasrellahkharroubi/darija-arabizi-transliterator
- Perfil del autor en Hugging Face: https://huggingface.co/nasrellahkharroubi
- Referencia de Baldwin y Lui (NAACL 2010): https://aclanthology.org/N10-1027/
