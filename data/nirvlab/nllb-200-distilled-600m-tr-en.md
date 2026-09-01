# NIRVLab/nllb-200-distilled-600M-tr-en

## Resumen

El modelo `NIRVLab/nllb-200-distilled-600M-tr-en` es un checkpoint de ajuste fino (fine-tune) del modelo base `facebook/nllb-200-distilled-600M`, especializado en la traducción automática del turco (tur_Latn) al inglés (eng_Latn). Ha sido desarrollado por NIRVLab como un baseline oficial para el congreso COLING 2027, utilizando el dataset OPUS-100 con 100 000 pares de frases turco-inglés. Su propósito es servir como punto de referencia para investigaciones en traducción automática neuronal, ofreciendo una versión destilada y eficiente del modelo NLLB-200 original, que cubre 200 idiomas, pero aquí restringida a un único par de lenguas.

La relevancia de este modelo radica en su tamaño reducido (600 millones de parámetros) frente a los modelos NLLB más grandes, lo que permite una inferencia más rápida y un menor consumo de recursos, manteniendo una calidad aceptable para tareas de traducción turco-inglés. Al ser un baseline, está pensado para comparar futuras mejoras en arquitecturas, técnicas de entrenamiento o estrategias de datos. El modelo se distribuye en formato PyTorch con pesos en safetensors, y su repositorio ocupa aproximadamente 1,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) con arquitectura NLLB |
| Parametros totales | 600 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (valor tipico de NLLB-200, no confirmado en la ficha) |
| Tipos de cuantizacion | no disponible (el modelo base tiene versiones GGUF, pero no se indica para este fine-tune) |
| Idiomas soportados | turco (tur_Latn) a ingles (eng_Latn) |
| Licencia | no disponible (el modelo base usa CC-BY-NC 4.0, pero no se confirma para este checkpoint) |
| Formato de pesos | safetensors (repositorio PyTorch) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura NLLB-200, un transformer encoder-decoder de 600 millones de parametros, que es una version destilada del modelo NLLB-200 de 3,3 mil millones de parametros. La destilacion reduce el numero de capas y la dimension de los embeddings, manteniendo la cobertura multilingue del modelo original, aunque en este caso se ha ajustado exclusivamente para el par turco-ingles. El entrenamiento se realizo mediante fine-tuning sobre el dataset OPUS-100, concretamente con 100 000 pares de frases turco-ingles, seleccionados como subconjunto del corpus OPUS. No se han publicado detalles sobre hiperparametros, tecnicas de regularizacion o si se aplicaron metodos como RLHF o DPO; la model card solo indica que se optimizo la metrica BLEU en validacion.

## Capacidades

- Traduccion automatica de turco a ingles con calidad aceptable para textos generales.
- Generacion de texto en ingles a partir de entrada en turco, manteniendo coherencia gramatical y semantica.
- Soporte de secuencias de hasta 512 tokens de longitud, adecuado para parrafos y documentos cortos.
- Capacidad de procesamiento por lotes (batch) para traduccion de multiples frases simultaneamente.
- Al ser un modelo destilado, ofrece menor latencia que los modelos NLLB completos, lo que facilita su uso en entornos con recursos limitados.
- No se ha confirmado soporte para tool calling, agentes o razonamiento multi-paso; es un modelo puramente de traduccion.

## Casos de uso

- Localizacion de contenido web: traducir articulos, blogs o paginas de turco a ingles para audiencias internacionales, aprovechando la ventana de 512 tokens para parrafos completos.
- Traduccion de documentacion tecnica: convertir manuales, guias o especificaciones de productos turcos al ingles, con un modelo ligero que puede ejecutarse en servidores modestos.
- Atencion al cliente bilingue: integrar el modelo en un sistema de traduccion en tiempo real para conversaciones de soporte entre hablantes de turco e ingles, reduciendo la necesidad de agentes bilingues.
- Preprocesamiento de datos para NLP: traducir corpus turcos al ingles para entrenar otros modelos (por ejemplo, clasificadores o sistemas de extraccion de informacion) que solo funcionan en ingles.
- Investigacion academica: servir como baseline en experimentos de traduccion automatica, comparando nuevas arquitecturas o tecnicas de entrenamiento contra este checkpoint de referencia.
- Traduccion de subtitulos o transcripciones: convertir contenido audiovisual turco a ingles, aunque la longitud de 512 tokens limita el procesamiento a segmentos cortos, por lo que se requeriria dividir el texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que se optimizo la metrica BLEU en validacion, pero no se proporcionan valores numericos. Tampoco se ofrecen comparaciones con otros modelos de traduccion turco-ingles. Por tanto, no es posible presentar una tabla de rendimiento sin inventar datos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 600 millones de parametros, en FP16 se requieren aproximadamente 1,2 GB de VRAM, y en FP32 unos 2,4 GB. Con cuantizacion int8, podria reducirse a unos 0,6 GB, aunque no se confirman cuantizaciones disponibles para este checkpoint.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 2060) puede ejecutar el modelo en FP16. Para mayor velocidad, se recomienda una RTX 3060 o superior.
- Compatibilidad con GPUs de consumo: si, el modelo cabe en GPUs de gama media como la RTX 3060 (12 GB) o incluso en la RTX 4060 (8 GB) con cuantizacion.
- Opciones de despliegue: al ser un modelo de HuggingFace con formato safetensors, se puede servir con vLLM, TGI (Text Generation Inference), o mediante la libreria transformers de Python. Tambien es posible convertirlo a GGUF para usarlo con llama.cpp u Ollama, aunque no se proporcionan dichos archivos en el repositorio.
- Latencia y throughput: no se han publicado mediciones. Como referencia, un modelo de 600M en una GPU moderna (RTX 3090) puede traducir decenas de frases por segundo, pero depende del hardware y del tamaño del lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NIRVLab/nllb-200-distilled-600M-tr-en | 600M | 512 (estimado) | tur-en | no disponible | HuggingFace |
| facebook/nllb-200-distilled-600M | 600M | 512 | 200 idiomas | CC-BY-NC 4.0 | HuggingFace |
| Helsinki-NLP/opus-mt-tr-en | ~70M | 512 | tur-en | Apache 2.0 | HuggingFace |
| facebook/nllb-200-1.3B | 1.3B | 512 | 200 idiomas | CC-BY-NC 4.0 | HuggingFace |

El modelo de NIRVLab es un fine-tune del modelo base de 600M, por lo que su rendimiento en turco-ingles deberia ser superior al del modelo base sin ajuste, pero inferior al de modelos mas grandes como el de 1.3B. El modelo Helsinki-NLP es mucho mas pequeño y rapido, pero con menor calidad. No se dispone de datos comparativos de BLEU para confirmar estas diferencias.

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en traduccion turco-ingles; no soporta otros idiomas ni la direccion inversa (ingles-turco) de forma nativa.
- La licencia no esta especificada en la ficha del autor. El modelo base usa CC-BY-NC 4.0, que restringe el uso comercial, por lo que se debe asumir la misma restriccion hasta que se confirme lo contrario.
- El entrenamiento se realizo con solo 100 000 pares de frases, lo que puede limitar la cobertura de vocabulario y la robustez ante dominios especializados (tecnico, medico, legal).
- Al ser un modelo destilado, puede presentar mas errores de traduccion que los modelos NLLB completos, especialmente en frases complejas o con matices culturales.
- No se han publicado evaluaciones de sesgos o alucinaciones. Es probable que herede sesgos del dataset OPUS-100, que proviene de fuentes web y puede contener desequilibrios de genero o temas.
- La longitud de contexto de 512 tokens (estimada) limita la traduccion de documentos largos, requiriendo segmentacion previa.
- No se proporcionan instrucciones de uso ni ejemplos de codigo en la model card, lo que puede dificultar su integracion para desarrolladores noveles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NIRVLab/nllb-200-distilled-600M-tr-en
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-600M
- Dataset OPUS-100: https://huggingface.co/datasets/Helsinki-NLP/opus-100
- Articulo de referencia de NLLB (no confirmado): https://arxiv.org/abs/2207.04672 (No Language Left Behind)
