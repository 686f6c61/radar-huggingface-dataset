# mradermacher/Quyet-1.2-Large-GGUF

## Resumen

Quyet-1.2-Large es un modelo de decisión (decision model) calibrado, publicado originalmente por chinhnc y cuantizado a formato GGUF por mradermacher. A diferencia de los modelos generativos al uso, está etiquetado como modelo de clasificación y decisión, orientado a producir salidas calibradas en tareas de clasificación. El repositorio que nos ocupa contiene únicamente las versiones cuantizadas estáticas en GGUF del modelo base, no los pesos originales en safetensors.

El modelo base cuenta con 30.697.345.596 parámetros según los metadatos de safetensors, lo que lo sitúa en la categoría de modelos de aproximadamente 30B. La licencia es Apache 2.0 y el único idioma declarado es el inglés. La información pública disponible sobre arquitectura interna, datos de entrenamiento y metodología de calibración es muy limitada: la model card del repositorio cuantizado se limita a describir el proceso de cuantización y las variantes ofrecidas.

La relevancia de esta ficha radica en documentar con precisión qué se puede y qué no se puede afirmar sobre este modelo a partir de la información disponible. La cuantización GGUF permite ejecutar un modelo de ~30B en hardware de consumo mediante llama.cpp y derivados, lo que resulta práctico para evaluación local de modelos de clasificación calibrados. No obstante, la ausencia de benchmarks publicados, de documentación sobre el entrenamiento y de detalles arquitectónicos obliga a tratar cualquier afirmación de rendimiento con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como decision-model / classification; no se detalla la arquitectura subyacente) |
| Parametros totales | 30.697.345.596 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base en formato Hugging Face/transformers |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo base chinhnc/Quyet-1.2-Large en los datos proporcionados. Las etiquetas del repositorio indican que se trata de un modelo de decisión calibrado orientado a clasificación, pero no se especifica si emplea un transformer denso, una variante MoE u otra topología. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineamiento.

La única información técnica verificable procede del proceso de cuantización realizado por mradermacher: se generaron cuantizaciones estáticas (quantize_version 2, output_tensor_quantised 1) a partir de los pesos en formato Hugging Face, con conversión de tipo hf. El autor indica que las cuantizaciones ponderadas/imatrix no estaban disponibles en el momento de la publicación. No se documenta ninguna innovación arquitectónica adicional, como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación y toma de decisiones: el modelo está etiquetado como decision-model calibrado y classification, por lo que su uso previsto es la producción de decisiones o etiquetas con probabilidades calibradas, no la generación libre de texto.
- Salidas calibradas: la etiqueta "calibrated" sugiere que las probabilidades de salida están ajustadas para reflejar frecuencias empíricas, aunque no se aporta documentación que lo cuantifique.
- Idioma: soporte declarado únicamente de inglés.
- Generación de texto, razonamiento, código, matemáticas, visión, audio: no disponible; no se documentan estas capacidades.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles más allá del inglés declarado.

## Casos de uso

- Filtrado y clasificación de contenido en inglés: el modelo puede emplearse para etiquetar textos o decidir entre categorías predefinidas en pipelines de moderación o triaje, apoyándose en su naturaleza de modelo de clasificación calibrado.
- Enrutamiento de consultas en sistemas RAG: usar las salidas del modelo para decidir qué recuperador o herramienta invocar, aprovechando la calibración de probabilidades para fijar umbrales de confianza.
- Evaluación local de modelos de decisión: las cuantizaciones GGUF permiten ejecutar un modelo de ~30B en estaciones de trabajo con GPU de consumo, facilitando la comparación de su calibración frente a alternativas antes de comprometerse con un despliegue en producción.
- Preetiquetado en anotación de datos: generar etiquetas preliminares en inglés sobre grandes volúmenes de texto para que anotadores humanos las revisen, reduciendo el coste del etiquetado manual.
- Detección de casos límite en pipelines de producción: emplear la calibración para identificar entradas con baja confianza y derivarlas a revisión humana o a un modelo mayor.
- Investigación sobre calibración de modelos: servir como referencia práctica para estudiar cómo se degrada la calibración al aplicar cuantizaciones agresivas (Q2_K, Q3_K) frente a Q8_0, dado que el repositorio ofrece el espectro completo de cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~12,0 GB; Q3_K_S ~13,9 GB; Q3_K_M ~15,4 GB; Q3_K_L ~16,7 GB; IQ4_XS ~17,0 GB; Q4_K_S ~17,9 GB; Q4_K_M ~18,8 GB; Q5_K_S ~21,4 GB; Q5_K_M ~21,9 GB; Q6_K ~25,3 GB; Q8_0 ~32,7 GB. Estas cifras corresponden al tamaño de los ficheros; la VRAM necesaria para inferencia debe añadir el espacio de contexto y overhead del runtime.
- GPU recomendadas: para Q8_0, GPUs con 40-48 GB o más (A100 40/80 GB, H100, L40S). Para Q4_K_M, GPUs de 24 GB como la RTX 4090 o A10G pueden alojar los pesos, con margen limitado para contexto. Para Q2_K y Q3_K_S, GPUs de 16 GB como la RTX 4080 o A4000.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con cuantizaciones Q4 y Q5; en GPUs de 16 GB con Q2_K y Q3_K_S; en GPUs de 12 GB no cabe ninguna cuantización completa, siendo necesario el offload parcial a CPU o el uso de RAM del sistema.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python o text-generation-webui). vLLM y TGI no soportan GGUF de forma nativa para este formato, por lo que no se recomiendan sin conversión previa.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables de la misma categoría (modelos de decisión calibrados de ~30B) ni de datos de rendimiento que permitan una comparación fundamentada.

## Limitaciones y advertencias

- Documentación insuficiente: no se publican detalles de arquitectura, entrenamiento, contexto ni evaluación, lo que impide verificar afirmaciones sobre calidad o calibración.
- Riesgo de alucinación: aunque el modelo está orientado a clasificación, no se documenta su comportamiento fuera de distribución ni su robustez ante entradas ambiguas.
- Sesgos: no se documentan sesgos conocidos ni la composición del dataset de entrenamiento, por lo que no es posible evaluar sesgos de género, raza u otros.
- Idioma: solo se declara inglés; el uso en castellano u otros idiomas no está soportado ni evaluado.
- Licencia: Apache 2.0 permite uso comercial, pero al tratarse de una cuantización de un modelo base de terceros conviene verificar la licencia y condiciones del modelo original chinhnc/Quyet-1.2-Large.
- Cuantizaciones agresivas: Q2_K y Q3_K pueden degradar la calibración de las probabilidades, que es precisamente la propiedad distintiva del modelo; para aplicaciones sensibles a la calibración se recomienda Q6_K o Q8_0.
- Madurez del repositorio: 0 descargas y 1 like en el momento de la consulta, sin cuantizaciones imatrix disponibles; no hay evidencia de uso en producción.
- Fecha de creación futura en los metadatos (2026-11-17): conviene tratar las fechas del repositorio con cautela.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Quyet-1.2-Large-GGUF
- Modelo base: https://huggingface.co/chinhnc/Quyet-1.2-Large
- Página de descargas del cuantizador: https://hf.tst.eu/model#Quyet-1.2-Large-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
