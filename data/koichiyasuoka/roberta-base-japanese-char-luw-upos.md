# KoichiYasuoka/roberta-base-japanese-char-luw-upos

## Resumen

Este modelo es una adaptación de RoBERTa base preentrenada sobre textos del proyecto Aozora Bunko (青空文庫), especializada en el etiquetado gramatical (part-of-speech) y el análisis de dependencias sintácticas del japonés. Fue desarrollado por Koichi Yasuoka y se deriva de `roberta-base-japanese-aozora-char`, que opera a nivel de carácter. Cada palabra larga (long-unit-word) se anota con las etiquetas UPOS (Universal Part-Of-Speech) y FEATS (rasgos morfológicos universales), siguiendo el estándar de Universal Dependencies.

El modelo está pensado para tareas de token classification y se integra con la librería `esupar`, que combina tokenizador, etiquetador POS y parser de dependencias en un único pipeline. Su relevancia radica en ofrecer una alternativa robusta para el procesamiento del japonés literario y general, con una anotación morfosintáctica estandarizada que facilita la interoperabilidad con otras herramientas de PLN. El repositorio ocupa 3.2 GB y la licencia es CC-BY-SA-4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa base (transformer encoder) |
| Parametros totales | no disponible (estimacion ~125M para RoBERTa base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (tipicamente 512 tokens para RoBERTa) |
| Tipos de cuantizacion | no disponible (pesos completos en el repositorio) |
| Idiomas soportados | japones (ja) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors / pytorch_model.bin (transformers) |

## Arquitectura y entrenamiento

El modelo parte de `roberta-base-japanese-aozora-char`, un RoBERTa base preentrenado sobre textos de Aozora Bunko (biblioteca digital de literatura japonesa de dominio publico) utilizando tokenizacion a nivel de caracter. Sobre esta base se realizo un fine-tuning supervisado con el dataset Universal Dependencies para la tarea de etiquetado de partes de la oracion (UPOS y FEATS) y analisis de dependencias. La arquitectura es un transformer encoder estandar de RoBERTa, sin innovaciones estructurales destacables. El entrenamiento se documento en el articulo de Yasuoka (2022) sobre la creacion de modelos de parsing de dependencias japonesas con Transformers.

## Capacidades

- Etiquetado gramatical (POS tagging) con etiquetas UPOS y FEATS segun Universal Dependencies.
- Analisis de dependencias sintacticas (dependency parsing) sobre palabras largas (long-unit-words) del japones.
- Integracion con la libreria `esupar` para un pipeline completo de tokenizacion, POS y parsing.
- Soporte de inferencia a traves de la interfaz `TokenClassificationPipeline` de HuggingFace Transformers.
- Funciona exclusivamente con texto en japones.
- No es un modelo generativo: no produce texto, solo anotaciones.

## Casos de uso

- Analisis linguistico de corpus japoneses: el modelo puede anotar automaticamente cualquier texto en japones con etiquetas UPOS y rasgos morfologicos, lo que resulta util para estudios de sintaxis o morfologia.
- Procesamiento de literatura japonesa: al estar preentrenado sobre Aozora Bunko, es especialmente adecuado para textos literarios clasicos y modernos, donde la tokenizacion por caracteres ayuda a manejar variaciones ortograficas.
- Construccion de arboles de dependencias para entrenamiento de otros modelos: las salidas del parser pueden servir como datos de supervision debil para sistemas de traduccion automatica o extraccion de informacion.
- Enriquecimiento de bases de datos textuales: anotacion de grandes volumenes de texto japones para indizacion semantica o busqueda por estructuras gramaticales.
- Herramientas educativas de linguistica computacional: el modelo puede usarse en entornos academicos para ensenar analisis sintactico automatico del japones.
- Preprocesamiento para sistemas de QA o extraccion de relaciones: las dependencias y etiquetas POS ayudan a identificar sujetos, objetos y modificadores en frases japonesas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card no incluye metricas como LAS (labeled attachment score) o accuracy de POS. Se recomienda evaluar el modelo en corpus propios si se requiere una comparacion cuantitativa.

## Requisitos de hardware

- Tamano del repositorio: 3.2 GB, aunque los pesos del modelo ocupan aproximadamente 500 MB (RoBERTa base en precision FP32).
- Inferencia en CPU: factible para textos cortos, con latencia del orden de decenas de milisegundos por frase.
- Inferencia en GPU: recomendable para lotes grandes o procesamiento en tiempo real; una GPU con 4-6 GB de VRAM es suficiente (por ejemplo, NVIDIA GTX 1660, RTX 2060).
- Compatible con las librerias de HuggingFace Transformers, por lo que puede desplegarse con vLLM, TGI o directamente con pipelines de Transformers.
- No se requieren GPUs especializadas como A100 o H100 para este modelo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tokenizacion | Tareas | Licencia |
|---|---|---|---|---|
| KoichiYasuoka/roberta-base-japanese-char-luw-upos | RoBERTa base | Caracter | POS + dependencias | CC-BY-SA-4.0 |
| KoichiYasuoka/roberta-base-japanese-luw-upos | RoBERTa base | Palabra (MeCab) | POS + dependencias | CC-BY-SA-4.0 |
| KoichiYasuoka/bert-base-japanese-luw-upos | BERT base | Palabra (MeCab) | POS + dependencias | CC-BY-SA-4.0 |

La diferencia principal con `roberta-base-japanese-luw-upos` es la tokenizacion: el modelo char opera a nivel de caracter, lo que puede mejorar el manejo de palabras desconocidas o variaciones ortograficas, mientras que el modelo basado en palabras es mas rapido en inferencia. Ambos comparten licencia y tareas.

## Limitaciones y advertencias

- Modelo entrenado exclusivamente con textos japoneses de Aozora Bunko; puede tener un sesgo hacia el lenguaje literario y no generalizar bien a registros coloquiales o tecnicos.
- No es un modelo generativo: no puede producir texto, solo anotaciones.
- La longitud de contexto esta limitada a la tipica de RoBERTa (512 tokens), por lo que no es adecuado para documentos muy largos sin segmentacion previa.
- La licencia CC-BY-SA-4.0 implica que los usos derivados deben compartirse bajo la misma licencia, lo que puede ser restrictivo para proyectos comerciales propietarios.
- No se proporcionan datos de rendimiento cuantitativo, por lo que la calidad real debe evaluarse en cada caso de uso.
- El modelo depende de la tokenizacion por caracteres, que puede generar secuencias mas largas y mayor coste computacional que la tokenizacion por palabras.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/KoichiYasuoka/roberta-base-japanese-char-luw-upos)
- [Modelo base: roberta-base-japanese-aozora-char](https://huggingface.co/KoichiYasuoka/roberta-base-japanese-aozora-char)
- [Libreria esupar (GitHub)](https://github.com/KoichiYasuoka/esupar)
- [Referencia tecnica (articulo de Yasuoka, 2022)](http://hdl.handle.net/2433/268173)
