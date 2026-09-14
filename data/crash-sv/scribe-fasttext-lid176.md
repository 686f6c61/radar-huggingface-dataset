# crash-sv/scribe-fasttext-lid176

## Resumen

`crash-sv/scribe-fasttext-lid176` es una copia sin modificar del modelo oficial de identificación de idioma de fastText, `lid.176.bin`, publicado por Facebook AI Research (Armand Joulin, Edouard Grave, Piotr Bojanowski, Tomas Mikolov y otros). El repositorio lo mantiene el proyecto Crash-SV para que la utilidad de dictado y traducción Scribe SV pueda descargar el fichero bajo demanda desde un repositorio controlado por sus autores. El autor indica explícitamente que no se ha reentrenado, cuantizado ni convertido nada: el fichero es idéntico byte a byte al original.

Se trata de un clasificador de texto supervisado basado en fastText, no de un transformer. Recibe una cadena de texto y devuelve una distribución de probabilidad sobre 176 idiomas, etiquetados con códigos de idioma. Su función en Scribe SV es concreta: dado un par de idiomas elegido por el usuario (por ejemplo, alemán ↔ francés), el programa lee el vector completo de probabilidades y selecciona el más probable de los dos, sin usar nunca la etiqueta top-1 del modelo.

Es relevante ahora por su coste operativo: 131 266 198 bytes, ejecución en CPU y latencia de milisegundos, lo que lo hace adecuado como componente de enrutado lingüístico dentro de aplicaciones de escritorio. El repositorio acumula 0 descargas y 0 likes en el momento de redactar esta ficha, y no publica métricas de rendimiento propias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | fastText: clasificador lineal supervisado sobre representación de bolsa de n-gramas (no es un transformer) |
| Parámetros totales | no disponible (el autor no publica el recuento; el fichero ocupa 131 266 198 bytes) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; fastText no impone una ventana fija, vectoriza el texto completo como bolsa de n-gramas |
| Tipos de cuantización | no disponible; el repositorio distribuye el `.bin` original sin cuantizar ni comprimir |
| Idiomas soportados | 176 idiomas, identificados por etiquetas de código de idioma |
| Licencia | Creative Commons Attribution-ShareAlike 3.0 (CC BY-SA 3.0), la misma que indica el publicador original |
| Formato de pesos | binario propio de fastText (`.bin`), 131 266 198 bytes; MD5 `01810bc59c6a3d2b79c79e6336612f65`, SHA-256 `7e69ec5451bc261cc7844e49e4792a85d7f09c06789ec800fc4a44aec362764e` |

Datos adicionales del repositorio: ID `crash-sv/scribe-fasttext-lid176`, autor `crash-sv`, pipeline `text-classification`, librería `fasttext`, tamaño del repositorio 0,1 GB, creado el 2026-09-13 y actualizado el 2026-09-13. El autor no declara ningún idioma a nivel de metadatos del repositorio (el campo de idiomas aparece como no disponible), aunque el modelo cubre 176 lenguas.

## Arquitectura y entrenamiento

La arquitectura es la del clasificador supervisado de fastText descrito en *Bag of Tricks for Efficient Text Classification* (Joulin et al., 2016): cada texto se representa como el promedio de los vectores de sus n-gramas, sobre esa representación se aplica una capa oculta y una capa de salida lineal con softmax sobre las 176 clases. Es un modelo de bolsa de palabras enriquecido con n-gramas, con un coste de inferencia lineal respecto al número de tokens de entrada y sin mecanismo de atención ni estados recurrentes.

No hay información sobre entrenamiento en este repositorio: la model card no documenta el número de tokens, la composición del dataset, el uso de RLHF o DPO ni ningún ajuste posterior. El autor afirma de forma explícita que el fichero es una copia byte a byte del original publicado por Meta en `fasttext.cc`, sin reentrenamiento, cuantización ni conversión, y las dos referencias bibliográficas citadas (arXiv:1607.01759 y arXiv:1612.03651) corresponden a los artículos de fastText, no a un proceso de entrenamiento propio.

La innovación subyacente es la del propio fastText: clasificación de texto con precisión competitiva a una fracción del coste computacional de los modelos neuronales profundos de la época, con soporte nativo de un número elevado de clases de salida. En este repositorio no se añade ninguna técnica extra: no hay decodificación especulativa, atención lineal ni ninguna modificación posterior. El valor diferencial del repositorio es de distribución, no técnico.

## Capacidades

- Identificación del idioma de un texto entre 176 lenguas, devolviendo la distribución de probabilidad completa.
- Selección de la lengua más probable restringida a un subconjunto: con `predict(texto, k=-1)` se obtiene el vector entero y la aplicación puede comparar únicamente las dos lenguas del par configurado por el usuario.
- Clasificación de texto corto: funciona sobre frases, fragmentos y cadenas breves, incluidas entradas de dictado sin puntuación.
- Capacidad multilingüe por diseño: las 176 clases de salida son lenguas distintas, no variantes de estilo ni categorías temáticas.
- No genera texto ni mantiene conversación: no es un modelo generativo y no produce respuestas.
- No soporta razonamiento multi-paso, matemáticas, código ni resolución de problemas.
- No soporta tool calling ni function calling, ni tiene capacidades de agente.
- No dispone de modo thinking, ni de visión, ni de audio: la entrada es exclusivamente texto.
- La salida es una lista de etiquetas con sus probabilidades; no hay salida en lenguaje natural.

## Casos de uso

- Detección de idioma en la utilidad Scribe SV: el programa pide al modelo la probabilidad de las dos lenguas del par activo y elige la mayor. Es el caso de uso para el que se publicó este repositorio y aprovecha la salida completa del vector de probabilidades en lugar del top-1.
- Enrutado de idioma en pipelines de traducción automática: antes de llamar al traductor, el sistema consulta el idioma detectado para seleccionar el par de traducción correcto y evitar enviar texto ya en la lengua destino.
- Limpieza y filtrado de corpus multilingües: durante la construcción de un dataset de entrenamiento se etiqueta cada documento y se descartan los que no pertenecen a los idiomas objetivo; el coste por documento es mínimo comparado con un clasificador neuronal.
- Preprocesado de sistemas de reconocimiento y síntesis de voz: se determina el idioma de la transcripción para escoger el modelo acústico, el léxico de pronunciación o la voz de síntesis adecuada.
- Enrutado de consultas en asistentes y sistemas RAG: se detecta el idioma de la pregunta del usuario para dirigirla a un índice vectorial, a un prompt o a un modelo especializado en esa lengua.
- Moderación de contenido en plataformas con usuarios internacionales: se etiqueta automáticamente el idioma de comentarios y publicaciones para aplicar las reglas de revisión o los modelos de toxicidad correspondientes a cada comunidad lingüística.
- Analítica de encuestas y formularios abiertos: se clasifican respuestas de texto libre en encuestas multinacionales para segmentar los resultados por idioma antes del análisis cualitativo.
- Normalización de datos de entrada en herramientas internas: detección automática del idioma de una consulta para configurar la interfaz, la codificación de salida o el formato de fecha y número.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye ninguna tabla de métricas, ni precisión por idioma, ni comparación con otros sistemas de identificación de lenguaje. La documentación oficial de fastText sí publica cifras de precisión para `lid.176`, pero no se han facilitado en la información proporcionada, por lo que no se reproducen aquí.

## Requisitos de hardware

- VRAM para inferencia: 0 GB; el modelo no requiere GPU.
- Memoria principal: el fichero ocupa 131 266 198 bytes y se carga íntegramente en memoria, por lo que el proceso necesita ese espacio más el sobrecoste de la biblioteca fastText.
- GPU recomendadas: ninguna. El modelo se ejecuta en CPU.
- Cabe en cualquier ordenador de consumo: procesadores x86-64 o ARM convencionales, incluidos portátiles de gama baja. No es necesario ningún acelerador.
- Opciones de despliegue: biblioteca `fasttext` (el autor recomienda `pip install fasttext-predict`) junto con `huggingface_hub.hf_hub_download` para obtener el fichero. No es compatible con vLLM, TGI, llama.cpp, Ollama ni otros servidores orientados a transformers o a formato GGUF, porque el formato `.bin` de fastText es específico de esta biblioteca.
- Latencia y throughput: no disponibles en la información proporcionada. Al tratarse de un clasificador lineal sobre bolsa de n-gramas, la inferencia se ejecuta en CPU; no se han facilitado cifras medidas de latencia ni de textos por segundo.
- Nota de despliegue: no existe una variante ONNX, GGUF ni safetensors en este repositorio; la única ruta soportada es la biblioteca fastText.

## Comparativa con modelos similares

| Modelo | Idiomas | Tamaño del artefacto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `crash-sv/scribe-fasttext-lid176` (esta ficha) | 176 | 131 266 198 bytes | CC BY-SA 3.0 | HuggingFace Hub, copia del original |
| `lid.176.bin` original (Meta / fastText) | 176 | 131 266 198 bytes (mismo fichero) | CC BY-SA 3.0 | `fasttext.cc` y `dl.fbaipublicfiles.com` |
| `lid.176.ftz` (variante comprimida oficial) | 176 | no disponible | CC BY-SA 3.0 | `fasttext.cc` |
| Otras alternativas de identificación de lenguaje (CLD3, langid.py, lingua, GlotLID) | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de parámetros, contexto ni rendimiento de las alternativas, por lo que la comparación cuantitativa no es posible. El único elemento diferencial verificable es que este repositorio redistribuye exactamente el mismo fichero que el original, con el mismo hash, y que añade una copia controlada por el proyecto Scribe SV.

## Limitaciones y advertencias

- Modelo congelado: procede de fastText y no ha recibido actualizaciones. No incorpora vocabulario, nombres propios ni neologismos posteriores a su publicación.
- Riesgo de error en textos muy cortos: palabras sueltas, nombres propios, siglas, URL o cadenas de una o dos palabras son propensas a clasificaciones incorrectas. No se documenta en la información disponible ningún umbral de longitud mínima recomendado.
- Confusión entre lenguas próximas: los pares de idiomas emparentados o con alfabetos compartidos son el escenario de mayor riesgo para cualquier sistema de identificación de lenguaje; la model card no publica precisión desglosada por idioma que permita acotar este riesgo.
- No hay distinción de variedades dialectales, registros ni variedades regionales dentro de una misma lengua.
- No es un modelo generativo: usarlo para generar texto, razonar, resumir o responder preguntas produce resultados sin sentido. Su salida es siempre una distribución de etiquetas.
- Licencia CC BY-SA 3.0: permite uso comercial, pero impone atribución y obligación de compartir las obras derivadas bajo la misma licencia. Conviene revisar el cumplimiento antes de integrarlo en un producto propietario, especialmente si se redistribuye el fichero o una versión modificada.
- Repositorio sin mantenimiento ni soporte: 0 descargas y 0 likes en el momento de redactar esta ficha. El autor no garantiza actualizaciones ni ofrece canal de soporte.
- El hash del fichero está publicado (MD5 y SHA-256), por lo que es posible verificar la integridad de la descarga; se recomienda hacerlo antes de usarlo en producción.
- Las fechas declaradas del repositorio (creación y actualización el 2026-09-13) no aportan información verificable sobre el modelo, que es anterior.
- Las búsquedas web realizadas para esta ficha no devolvieron resultados relevantes: los resultados obtenidos corresponden a la película *Crash* (2004), a noticias de motor y a prensa generalista, sin relación alguna con el repositorio ni con el proyecto Scribe SV.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/crash-sv/scribe-fasttext-lid176
- Proyecto Scribe SV: https://github.com/Crash-SV
- Documentación oficial de identificación de idioma de fastText: https://fasttext.cc/docs/en/language-identification.html
- Fichero original `lid.176.bin`: https://dl.fbaipublicfiles.com/fasttext/supervised-models/lid.176.bin
- Licencia CC BY-SA 3.0: https://creativecommons.org/licenses/by-sa/3.0/
- Artículo *Bag of Tricks for Efficient Text Classification*: https://arxiv.org/abs/1607.01759
- Artículo *FastText.zip: Compressing text classification models*: https://arxiv.org/abs/1612.03651
