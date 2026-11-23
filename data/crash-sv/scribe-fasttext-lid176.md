# crash-sv/scribe-fasttext-lid176

## Resumen

`crash-sv/scribe-fasttext-lid176` es una república sin modificaciones del modelo oficial de identificación de idioma de fastText, `lid.176.bin`, desarrollado originalmente por Facebook AI Research (Armand Joulin, Edouard Grave, Piotr Bojanowski y Tomas Mikolov). No se trata de un modelo nuevo ni reentrenado: es una copia byte a byte del binario original distribuido por Meta en `dl.fbaipublicfiles.com`, publicada por el autor `crash-sv` para que su utilidad de dictado y traducción Scribe SV pueda descargarlo bajo demanda desde un repositorio controlado.

El modelo resuelve una tarea muy concreta: clasificación de texto en 176 idiomas mediante un clasificador lineal con representaciones de bolsa de n-gramas de caracteres. No es un transformer ni un modelo generativo; es un clasificador fastText de aproximadamente 131 MB (0,1 GB en el repositorio) que devuelve una distribución de probabilidad sobre etiquetas de idioma.

Su relevancia práctica es acotada pero clara: es un componente ligero, rápido y determinista para enrutamiento lingüístico en pipelines de NLP, detección previa a traducción, filtrado de datasets multilingües o selección de idioma en aplicaciones de dictado. La licencia CC-BY-SA-3.0 permite uso comercial con atribución y compartir igual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | fastText: clasificador lineal sobre bolsa de n-gramas de caracteres (no transformer) |
| Parametros totales | no disponible (modelo de 131 266 198 bytes; número exacto de parámetros no publicado en la información disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de bolsa de n-gramas, sin ventana de contexto definida; procesa la cadena de entrada completa) |
| Tipos de cuantizacion | no disponible (binario fastText nativo, no cuantizado) |
| Idiomas soportados | 176 idiomas según el nombre del modelo (`lid.176`) |
| Licencia | CC-BY-SA-3.0 |
| Formato de pesos | `.bin` (formato nativo fastText) |

## Arquitectura y entrenamiento

El modelo es un clasificador fastText estándar: representación de texto como suma de embeddings de n-gramas de caracteres y palabras, seguida de una capa lineal con softmax sobre las etiquetas de idioma. La innovación descrita en los papers de referencia (Joulin et al., 2016, "Bag of Tricks for Efficient Text Classification", y Joulin et al., 2016, "FastText.zip") es precisamente la eficiencia: entrenamiento e inferencia en tiempo lineal con precisión competitiva frente a clasificadores más profundos.

No hay información en la model card sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo ajuste con RLHF/DPO (no aplica a un clasificador de este tipo). El autor indica explícitamente que el binario no fue reentrenado, cuantizado ni convertido. Los datos de integridad publicados son: tamaño 131 266 198 bytes, MD5 `01810bc59c6a3d2b79c79e6336612f65` y SHA-256 `7e69ec5451bc261cc7844e49e4792a85d7f09c06789ec800fc4a44aec362764e`.

## Capacidades

- Identificación de idioma en 176 lenguas a partir de texto de entrada.
- Salida de distribución de probabilidad completa sobre etiquetas (`predict(..., k=-1)`), no solo top-1.
- Clasificación de texto genérica mediante el pipeline `text-classification`.
- Inferencia muy rápida y con huella de memoria reducida (modelo de ~131 MB).
- Selección de idioma restringida a un subconjunto: la aplicación Scribe SV lee el vector de probabilidades completo y elige el más probable entre los dos idiomas del par configurado por el usuario, en lugar de usar la etiqueta top-1.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades de visión, audio ni modo de pensamiento.

## Casos de uso

- Enrutamiento lingüístico en aplicaciones de dictado y traducción: Scribe SV usa el modelo para decidir cuál de los dos idiomas del par seleccionado (por ejemplo, alemán ↔ francés) corresponde al texto transcrito, leyendo la probabilidad de cada etiqueta en lugar de confiar en el top-1.
- Detección previa a traducción automática: clasificar el idioma de entrada antes de invocar un modelo de traducción, evitando enviar texto al par de idiomas equivocado y reduciendo costes de inferencia en modelos grandes.
- Filtrado y curación de datasets multilingües: etiquetar grandes volúmenes de texto para separar corpus por idioma o descartar muestras con idioma no deseado, aprovechando el bajo coste computacional del clasificador.
- Moderación y análisis de contenido: identificar el idioma de mensajes de usuario para aplicar reglas de moderación, plantillas de respuesta o políticas específicas por lengua.
- Preprocesado en pipelines de NLP: asignar idioma a documentos antes de tokenizar, lematizar o aplicar modelos específicos por lengua en sistemas de búsqueda y recuperación.
- Herramientas de escritorio y aplicaciones de recursos limitados: integrar detección de idioma en utilidades Windows o entornos sin GPU, dado que el modelo es de ~131 MB y la inferencia es CPU-friendly.
- Análisis de logs y atención al cliente: clasificar tickets o conversaciones por idioma para enrutarlos al equipo o al modelo de respuesta adecuado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia de fastText se ejecuta en CPU.
- Memoria RAM estimada: en torno a la huella del modelo cargado (~131 MB de pesos más overhead del runtime de fastText).
- GPU recomendadas: no aplica; no hay soporte GPU descrito en la información disponible.
- Cabe en cualquier equipo consumer: portátiles, mini-PC y contenedores con poca memoria.
- Opciones de despliegue: librería `fasttext` / `fasttext-predict` (Python) y descarga vía `huggingface_hub.hf_hub_download`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Tamaño | Licencia | Notas |
|---|---|---|---|---|---|
| `crash-sv/scribe-fasttext-lid176` | fastText (clasificador lineal) | 176 | ~131 MB | CC-BY-SA-3.0 | Copia del `lid.176.bin` oficial; inferencia en CPU |
| fastText `lid.176.ftz` (oficial) | fastText comprimido | 176 | ~917 KB | CC-BY-SA-3.0 | Versión cuantizada/comprimida del mismo modelo; no incluida en esta república |
| `papluca/xlm-roberta-base-language-detection` | Transformer (XLM-R base) | 20 | ~1,1 GB | MIT (según su model card) | Mayor coste computacional; requiere GPU para throughput alto |
| `facebook/fasttext-language-identification` | fastText | 217 | ~1,2 GB (no verificado en la información disponible) | CC-BY-SA-3.0 (según su model card) | Sucesor con más idiomas; datos no confirmados aquí |

Los datos de los modelos alternativos no provienen de la información proporcionada para esta ficha y deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- Es una copia sin modificaciones: cualquier limitación del `lid.176.bin` original aplica íntegramente.
- No es un modelo generativo: no produce texto, no razona y no soporta instrucciones ni tool calling.
- Rendimiento degradado en textos muy cortos (una o dos palabras), en idiomas cercanos entre sí y en texto con mezcla de lenguas o ruido.
- La salida es una distribución de probabilidad sobre 176 etiquetas; el uso de top-1 puede ser menos fiable que la selección restringida a un subconjunto, como hace Scribe SV.
- No hay información publicada en esta ficha sobre sesgos específicos, tasas de alucinación (no aplica) ni evaluación por idioma.
- Licencia CC-BY-SA-3.0: permite uso comercial, pero exige atribución y compartir igual las obras derivadas; conviene revisar las implicaciones para productos propietarios que distribuyan el modelo o adaptaciones.
- El repositorio es una república de terceros; para producción conviene verificar la integridad con el SHA-256 publicado y, si es posible, descargar el binario desde la fuente original de Meta.
- No se documentan límites de longitud de entrada; textos muy largos deben dividirse en fragmentos para obtener una clasificación representativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/crash-sv/scribe-fasttext-lid176
- Repositorio del autor (Scribe SV): https://github.com/Crash-SV
- Página oficial de fastText para identificación de idioma: https://fasttext.cc/docs/en/language-identification.html
- Binario original: https://dl.fbaipublicfiles.com/fasttext/supervised-models/lid.176.bin
- Paper "Bag of Tricks for Efficient Text Classification": https://arxiv.org/abs/1607.01759
- Paper "FastText.zip: Compressing text classification models": https://arxiv.org/abs/1612.03651
- Licencia CC-BY-SA-3.0: https://creativecommons.org/licenses/by-sa/3.0/
