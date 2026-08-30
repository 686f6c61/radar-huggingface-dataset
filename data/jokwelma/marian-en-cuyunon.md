# jokwelma/marian-en-cuyunon

## Resumen

El modelo `jokwelma/marian-en-cuyunon` es un ajuste fino (fine-tune) del modelo de traducción automática neuronal `Helsinki-NLP/opus-mt-en-tl`, desarrollado por el usuario jokwelma. El nombre del modelo sugiere que está orientado a la traducción del inglés al cuyunon, una lengua filipina minoritaria, aunque esta información no está confirmada en la documentación oficial. Se trata de un modelo de tipo encoder-decoder basado en la arquitectura MarianMT, con aproximadamente 73,5 millones de parámetros, y se distribuye bajo licencia Apache 2.0.

La relevancia de este modelo radica en su potencial para cubrir un par de idiomas poco representado en los sistemas de traducción comerciales. Al partir de un modelo base entrenado para inglés-tagalo, el fine-tune busca adaptar el conocimiento a una variante lingüística cercana. Sin embargo, la ausencia de datos de entrenamiento documentados y el bajo valor de BLEU reportado (7,92) indican que se trata de un experimento preliminar, más que de un sistema listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT (Transformer encoder-decoder) |
| Parametros totales | 73.570.845 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en fp32) |
| Idiomas soportados | no disponible (el nombre sugiere ingles-cuyunon, sin confirmar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura MarianMT, un transformer encoder-decoder desarrollado por el equipo de Marian NMT en C++. El modelo base `opus-mt-en-tl` fue entrenado por Helsinki-NLP para traducción inglés-tagalo. El fine-tune se realizó sobre un dataset no especificado (la model card indica "None dataset"), con los siguientes hiperparámetros: learning rate de 2e-05, batch size de 50, un solo epoch, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal y precisión mixta nativa. El entrenamiento se ejecutó con Transformers 5.15.1 y PyTorch 2.11.0.

No se documentan innovaciones técnicas adicionales ni detalles sobre la composición del dataset de entrenamiento. El proceso de fine-tune es estándar, sin uso de RLHF ni DPO.

## Capacidades

- Traduccion automatica: el modelo esta disenado para traducir texto, presumiblemente del ingles al cuyunon, aunque no hay confirmacion oficial del par de idiomas.
- Generacion de texto: como modelo encoder-decoder, puede generar secuencias de texto a partir de una entrada, limitado a la tarea de traduccion.
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio.
- Capacidades multilingues: limitadas al par de idiomas para el que fue ajustado (ingles-cuyunon, segun el nombre).

## Casos de uso

- Traduccion de documentos cortos: el modelo puede utilizarse para traducir textos breves (correos, noticias, descripciones) del ingles al cuyunon, siempre que el contenido no requiera un contexto extenso.
- Localizacion de software: para traducir cadenas de interfaz de usuario en aplicaciones dirigidas a hablantes de cuyunon, aunque la calidad del resultado debe validarse manualmente.
- Subtitulado de videos: traduccion de subtitulos en ingles a cuyunon, con revision posterior debido al bajo BLEU.
- Investigacion linguistica: como herramienta de apoyo para estudios sobre la lengua cuyunon, permitiendo obtener traducciones preliminares que luego se corrigen.
- Prototipos de sistemas de traduccion: sirve como punto de partida para experimentos de fine-tune con datasets mas amplios y de mejor calidad.
- Educacion: generacion de materiales bilingues para la ensenanza del ingles o del cuyunon, con supervision de un hablante nativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara un array vacio en `model-index`. Durante el entrenamiento se reporto una loss de validacion de 5,0589 y un BLEU de 7,9213 en el unico epoch, pero estos datos no constituyen un benchmark oficial y no son comparables con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 73,5 millones de parametros en fp32, el modelo ocupa aproximadamente 294 MB en memoria. En cuantizacion de 8 bits (si se aplicara) se reduciria a unos 74 MB, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1050 Ti, RTX 2060 o superiores pueden ejecutarlo sin problemas. Tambien funciona en CPU.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU consumer moderna.
- Opciones de despliegue: al ser un modelo de Transformers, puede servirse con vLLM, TGI, o mediante la libreria `transformers` directamente. Tambien es compatible con llama.cpp si se convierte a GGUF, aunque no se proporcionan archivos GGUF.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna, se espera una latencia de decenas de milisegundos por secuencia corta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| jokwelma/marian-en-cuyunon | 73,5M | no disponible | Apache 2.0 | Fine-tune de opus-mt-en-tl |
| Helsinki-NLP/opus-mt-en-tl | 73,5M (aprox.) | 512 (tipico en MarianMT) | Apache 2.0 | Modelo base, ingles-tagalo |
| Helsinki-NLP/opus-mt-en-phi | 73,5M (aprox.) | 512 | Apache 2.0 | Traduccion ingles-filipino (tagalo) |

No se dispone de datos de rendimiento comparativos. El modelo base `opus-mt-en-tl` tiene un BLEU reportado de alrededor de 30 en el par ingles-tagalo, pero el fine-tune aqui presentado obtiene un BLEU mucho menor (7,92), lo que sugiere que el dataset de ajuste fue muy pequeno o de baja calidad.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha realizado ninguna evaluacion de sesgos. Al ser un fine-tune de un modelo entrenado con datos web, puede heredar sesgos presentes en el corpus original.
- Riesgo de alucinacion: alto, especialmente con textos fuera del dominio de entrenamiento. El bajo BLEU indica que las traducciones pueden ser poco fiables.
- Limitaciones de contexto: la longitud de contexto no esta documentada, pero MarianMT tipicamente soporta hasta 512 tokens. Textos mas largos deben segmentarse.
- Limitaciones de idioma: el par de idiomas no esta confirmado oficialmente. Si el cuyunon no es el idioma objetivo real, el modelo no funcionara como se espera.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base tiene sus propias condiciones (tambien Apache 2.0). No hay restricciones adicionales conocidas.
- Caveat para produccion: el modelo no es apto para uso en produccion sin una evaluacion exhaustiva y un dataset de validacion adecuado. Se recomienda tratarlo como un experimento academico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jokwelma/marian-en-cuyunon
- Documentacion de MarianMT en Transformers: https://huggingface.co/docs/transformers/model_doc/marian
- Sitio oficial de Marian NMT: https://marian-nmt.github.io/
- Modelo base Helsinki-NLP/opus-mt-en-tl: https://huggingface.co/Helsinki-NLP/opus-mt-en-tl
