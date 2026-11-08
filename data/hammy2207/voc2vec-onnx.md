# Hammy2207/voc2vec-onnx

## Resumen

voc2vec-onnx es la exportación a formato ONNX con cuantización dinámica int8 del modelo voc2vec-hubert-ls-pt, un encoder de audio desarrollado por Alkis Koudounas y colaboradores (presentado en ICASSP 2025) y publicado originalmente bajo licencia Apache 2.0. El modelo original es un transformer tipo HuBERT de 12 capas especializado en vocalizaciones no verbales (risas, suspiros, gemidos, gritos, sonidos guturales), un dominio tradicionalmente desatendido por los corpus de reconocimiento de habla. Esta versión ONNX la mantiene el usuario Hammy2207 y sirve como encoder en el navegador para Tink, una aplicación de accesibilidad que aprende los sonidos que puede emitir una persona sin habla y les asigna significado.

El modelo no genera texto ni responde a instrucciones: es un extractor de representaciones (embeddings) de audio. Recibe audio mono a 16 kHz y devuelve estados ocultos que la aplicación agrupa mediante mean pooling y normalización L2. Su relevancia actual reside en dos factores: por un lado, permite ejecutar un encoder de voz especializado íntegramente en el cliente mediante onnxruntime-web, de modo que el audio no abandona el dispositivo; por otro, el tamaño reducido del artefacto (122 MB, 12 capas) lo hace viable en entornos con recursos limitados y en escenarios de privacidad estricta.

La ficha se centra en la versión ONNX int8, pero incorpora los datos disponibles del modelo base y del proyecto voc2vec cuando resultan pertinentes para evaluar su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo HuBERT (12 capas), encoder de representaciones de audio |
| Parametros totales | no disponible (el artefacto ONNX int8 ocupa 122 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio determinada por la configuración de HuBERT del modelo base) |
| Tipos de cuantizacion | int8 dinámica (artefacto publicado); el modelo base admite otras cuantizaciones no documentadas en la información disponible |
| Idiomas soportados | no disponible (modelo acústico no verbal; no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`voc2vec-l12.int8.onnx`) |

## Arquitectura y entrenamiento

El modelo base voc2vec-hubert-ls-pt es un transformer HuBERT de 12 capas adaptado al dominio de vocalizaciones no verbales. Según la documentación del proyecto voc2vec, el preentrenamiento se realizó sobre una selección cuidadosa de conjuntos de datos de código abierto que cubren aproximadamente 125 horas de audio, escogidos específicamente para representar sonidos no verbales (risas, suspiros, vocalizaciones afectivas, gritos y similares) que aparecen de forma marginal en los corpus convencionales de habla. El sufijo "ls-pt" del identificador sugiere una etapa de preentrenamiento o ajuste sobre LibriSpeech y portugués, aunque la información disponible no detalla la composición exacta de esa fase.

La versión ONNX conserva las 12 capas completas del encoder y aplica cuantización dinámica int8, lo que reduce el peso del artefacto hasta 122 MB. Antes de la publicación, el autor verificó la exportación frente a la implementación en PyTorch con una similitud coseno media de al menos 0,99 y volvió a evaluar el modelo en los benchmarks del proyecto original. La salida del encoder son estados ocultos que la aplicación Tink agrega mediante mean pooling y normaliza con L2; esa capa de postprocesado no forma parte del grafo ONNX exportado. El SHA-256 del fichero publicado es `8b97cb362ed5445c6a4e6a8132e0238a35fcc8fb5fc23d5b059b8acf04374f9a`.

## Capacidades

- Extracción de representaciones de audio no verbal: convierte fragmentos de 16 kHz mono en embeddings de estados ocultos aptos para clasificación, agrupamiento o comparación por similitud.
- Discriminación de vocalizaciones no verbales: el preentrenamiento sobre unas 125 horas de audio específicamente seleccionado lo orienta a risas, suspiros, gritos y sonidos afectivos, frente a modelos centrados en habla.
- Ejecución en navegador: el artefacto ONNX int8 está pensado para onnxruntime-web, lo que permite inferencia en el cliente sin enviar audio a un servidor.
- Procesamiento local y privado: al ejecutarse en el dispositivo, el audio no sale del navegador, una propiedad relevante en aplicaciones de accesibilidad y salud.
- Base para aprendizaje personalizado: la aplicación Tink lo emplea para aprender los sonidos de una persona concreta y asociarles un significado, lo que exige embeddings estables y comparables entre muestras.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni capacidades multimodales más allá del audio de entrada.

## Casos de uso

- Comunicación aumentativa y alternativa: la aplicación Tink usa el encoder para registrar los sonidos que emite una persona sin habla y asignarles significados acordados con su entorno; el modelo es adecuado porque distingue vocalizaciones no verbales y funciona en el navegador sin infraestructura de servidor.
- Clasificación de eventos vocales en grabaciones: con los embeddings y un clasificador ligero encima, se pueden etiquetar risas, suspiros o gritos en corpus de audio para estudios de conducta o análisis de contenido.
- Análisis de afecto paralingüístico: los estados ocultos capturan información acústica no verbal útil para estimar arousal o valencia en investigación sobre emoción, siempre que se entrene la cabeza de clasificación correspondiente.
- Detección de vocalizaciones anómalas en monitorización: en un entorno de cuidado, el encoder puede alimentar un detector de sonidos inusuales (gritos, quejidos) y disparar alertas locales sin transmitir audio fuera del dispositivo.
- Prototipado de interfaces de voz sin habla: desarrolladores que construyen controladores por sonidos (soplidos, chasquidos, vocalizaciones) pueden usar los embeddings como características de entrada en lugar de diseñar descriptores manuales.
- Investigación en representaciones de audio no verbal: el modelo sirve como extractor de características congeladas para comparar espacios latentes entre corpus de vocalizaciones y evaluar la transferibilidad de HuBERT a dominios no hablados.
- Despliegue en entornos con recursos limitados: gracias a los 122 MB en int8 y a la ejecución en onnxruntime-web, cabe en aplicaciones web y dispositivos sin GPU dedicada, lo que facilita demos y despliegues de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el modelo fue reevaluado en los benchmarks del proyecto original tras la exportación y que se alcanzó una similitud coseno media de al menos 0,99 frente a PyTorch, pero no se incluyen cifras concretas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el artefacto int8 de 122 MB sugiere un consumo de memoria del orden de cientos de MB, pero no se documentan cifras oficiales.
- GPU recomendadas: no disponibles; el modelo está diseñado para ejecutarse en CPU mediante onnxruntime-web en el navegador, por lo que no requiere GPU.
- Compatibilidad con GPU de consumo: no se documenta; por tamaño, cualquier GPU de consumo moderna podría alojarlo, pero no hay datos de rendimiento publicados.
- Opciones de despliegue: onnxruntime-web (entorno previsto por el autor), ONNX Runtime en CPU o GPU, y cualquier runtime compatible con ONNX; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un encoder de audio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| voc2vec-onnx (esta ficha) | Encoder HuBERT 12 capas, ONNX int8 | no disponible (122 MB en int8) | no disponible | Apache 2.0 | Hugging Face |
| voc2vec-hubert-ls-pt | Encoder HuBERT 12 capas, PyTorch | no disponible | no disponible | Apache 2.0 | Hugging Face |
| HuBERT base | Encoder de habla, PyTorch | no disponible en la información proporcionada | no disponible | no disponible | Hugging Face |
| wav2vec 2.0 base | Encoder de habla, PyTorch | no disponible en la información proporcionada | no disponible | no disponible | Hugging Face |

La comparación con HuBERT base y wav2vec 2.0 base es pertinente por familia arquitectónica, pero la información disponible no permite contrastar parámetros, contexto ni rendimiento con rigor. La diferencia principal de voc2vec frente a esos encoders es el dominio de preentrenamiento: vocalizaciones no verbales en lugar de habla. Para el resto de filas no hay datos suficientes y se indica "no disponible".

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, etiquetas ni decisiones; requiere una cabeza de clasificación o una lógica de agrupamiento externa (como el mean pooling y la normalización L2 que aplica Tink).
- Dominio restringido: está entrenado para vocalizaciones no verbales; su rendimiento en habla convencional o en otros dominios acústicos no está documentado y probablemente sea inferior al de encoders especializados en habla.
- Sesgos de los datos de preentrenamiento: al provenir de conjuntos de audio de código abierto, puede heredar sesgos de idioma, cultura, género y edad de las personas y grabaciones incluidas; la información disponible no detalla la composición demográfica.
- Riesgo de error en aplicaciones críticas: la model card advierte explícitamente que no debe usarse para decisiones médicas ni como único medio de una persona para pedir ayuda. Cualquier despliegue en accesibilidad debe contar con vías alternativas de comunicación y supervisión humana.
- Idiomas y cobertura: no se documentan idiomas soportados ni cobertura geográfica; al ser un modelo acústico no verbal, la noción de idioma es limitada, pero la generalización a poblaciones no representadas en el entrenamiento no está garantizada.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero exige conservar los avisos de copyright y atribución; conviene revisar también las licencias de los conjuntos de datos originales, no detalladas en la información disponible.
- Cuantización int8: aunque la verificación reporta una similitud coseno media de al menos 0,99 frente a PyTorch, puede haber degradación en casos límite no cubiertos por esa comprobación.
- Madurez del artefacto: el repositorio registra cero descargas y cero likes en el momento de la consulta, y la fecha de creación indicada es 2026-11-08; se recomienda validar el fichero con su SHA-256 antes de integrarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hammy2207/voc2vec-onnx
- Modelo base: https://huggingface.co/alkiskoudounas/voc2vec-hubert-ls-pt
- Repositorio del proyecto voc2vec: https://github.com/koudounasalkis/voc2vec
- Repositorio de Tink: https://github.com/hammy229/tink
- Model card de Tink: https://github.com/hammy229/tink/blob/main/docs/model-card.md
- Resultados de Tink: https://github.com/hammy229/tink/blob/main/docs/results.md
