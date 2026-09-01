# OpenVoiceOS/ovos-m2v-intents-multilingual

## Resumen

El modelo `OpenVoiceOS/ovos-m2v-intents-multilingual` es un clasificador de intenciones estático desarrollado por el equipo de OpenVoiceOS (OVOS), un asistente de voz open source. Su función es mapear una expresión de lenguaje natural a una de 210 etiquetas de intención con formato `<skill_id>:<intent_name>`, exactamente como las registra el pipeline de OVOS en tiempo de ejecución. Está pensado para integrarse en el ecosistema OVOS como motor de reconocimiento de intenciones, sustituyendo o complementando a los motores clásicos como Adapt o Padatious.

Técnicamente, no es un modelo transformer generativo sino un clasificador basado en Model2Vec, una técnica que destila embeddings estáticos de un modelo transformer preentrenado. En este caso, la base es `intfloat/multilingual-e5-small` (MIT), destilada a 128 dimensiones. El modelo tiene 31.999.872 parámetros almacenados en float16 y ocupa 73,5 MB en disco. La inferencia se reduce a una búsqueda de vectores y un promedio, por lo que no requiere red neuronal en tiempo de ejecución y puede ejecutarse en CPU sin GPU.

Su relevancia actual radica en que ofrece una clasificación de intenciones multilingüe (54 locales) con una precisión global del 0,9943 en la partición de validación, con un coste computacional mínimo. Es el modelo por defecto del pipeline OVOS para cualquier idioma que no tenga un modelo monolingüe específico, y está publicado bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Model2Vec (embeddings estáticos destilados de `intfloat/multilingual-e5-small`, 128 dimensiones) |
| Parametros totales | 31.999.872 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (clasificador de embeddings, no modelo generativo) |
| Tipos de cuantizacion | Pesos en float16 (reproducen exactamente las predicciones float32) |
| Idiomas soportados | 54 locales (se reportan métricas para 17 idiomas con suficientes datos: catalán, inglés, italiano, portugués, español, gallego, alemán, danés, neerlandés, polaco, francés, vasco, sueco, checo, húngaro, cabilio y griego) |
| Licencia | Apache-2.0 (el modelo base es MIT) |
| Formato de pesos | safetensors (exportado con `to_pipeline().save_pretrained()`) |

## Arquitectura y entrenamiento

El modelo es un clasificador de embeddings estáticos basado en Model2Vec. En lugar de un transformer completo, utiliza representaciones vectoriales fijas de 128 dimensiones obtenidas por destilación de `intfloat/multilingual-e5-small`. La inferencia consiste en proyectar la expresión de entrada al espacio de embeddings y compararla con los centroides de cada clase mediante una métrica de similitud (probablemente coseno), seguida de un promedio. Esto elimina la necesidad de una GPU o de una pila de atención en tiempo de ejecución.

El entrenamiento se realizó sobre un corpus generado por el pipeline reproducible `ovos-m2v-pipeline` (commit `173c1fe`). El conjunto de datos final contiene 284.687 filas, 210 etiquetas y 54 locales. Se aplicó una partición estratificada 80/20 para entrenamiento y validación. El clasificador es una cabeza `StaticModelForClassification` de Model2Vec, ajustada sobre la partición de entrenamiento. Los pesos se almacenan en float16, lo que reproduce exactamente las predicciones float32 en la partición completa de validación. El proceso de construcción es reproducible: cada fuente está fijada a una revisión inmutable y se generan manifiestos con hashes (el manifiesto del dataset tiene hash `c6831002352fe59ed2a2e201f057ccf75807bafcb9fa74cef2b4e4f93a3de720` y el archivo de etiquetas `fdf0abefd0db94127804763c82e2497f33ff77d5d7fe0eb739ed4df8c849bae9`).

## Capacidades

- Clasificación de intenciones: asigna expresiones de lenguaje natural a una de 210 etiquetas de intención del formato `<skill_id>:<intent_name>`.
- Multilingüe: cubre 54 locales, con buen rendimiento en idiomas con suficientes datos de entrenamiento (precisión superior a 0,95 en todos los idiomas reportados).
- Inferencia estática: al no usar red neuronal en tiempo de ejecución, la clasificación es una operación de búsqueda de vectores y promedio, extremadamente rápida y ligera.
- Compatibilidad con OVOS: se integra directamente en el pipeline de intenciones de OpenVoiceOS, considerando solo las intenciones de los skills cargados y ignorando etiquetas no registradas.
- No requiere GPU: funciona en CPU sin dependencias de aceleración.
- Reproducibilidad: el entrenamiento es reproducible gracias al pipeline versionado y a los manifiestos con hash.

## Casos de uso

- Asistente de voz doméstico (OVOS): el modelo es el motor de intenciones por defecto en dispositivos OVOS. Permite que el asistente entienda comandos como "apaga la luz de la cocina" y los asocie a la intención correspondiente del skill de domótica, sin necesidad de una GPU.
- Sistemas de control por voz en Raspberry Pi u otros dispositivos de bajos recursos: gracias a su tamaño (73,5 MB) y a que la inferencia es un lookup vectorial, se ejecuta en hardware modesto con latencia mínima, ideal para prototipos de domótica o asistentes embebidos.
- Chatbots multilingües de bajo coste: el modelo puede clasificar la intención de un usuario en varios idiomas (español, catalán, inglés, etc.) con una sola instancia, reduciendo la complejidad de desplegar múltiples modelos por idioma.
- Enrutamiento de consultas en centros de atención al cliente: se puede usar como clasificador inicial para derivar una consulta escrita o hablada a un skill o agente especializado, gracias a su soporte de 54 locales y a su precisión global del 0,9943.
- Pruebas de concepto de intención en entornos sin GPU: al no requerir red neuronal en inferencia, es adecuado para entornos de desarrollo o CI/CD donde no se dispone de aceleración por hardware.
- Complemento a motores de intenciones existentes: puede usarse como fallback o como capa de verificación en sistemas que ya usan Adapt o Padatious, mejorando la cobertura multilingüe sin añadir carga computacional significativa.

## Benchmarks y rendimiento

La model card reporta precisión y F1 ponderado sobre la partición de validación (20% del corpus) para cada idioma con al menos 50 filas de test. La precisión global sobre 56.938 filas es 0,9943.

| Idioma | Filas de test | Precisión | F1 (ponderado) |
|---|---:|---:|---:|
| Catalán (`ca`) | 19363 | 0,9986 | 0,9985 |
| Inglés (`en`) | 7504 | 0,9933 | 0,9930 |
| Italiano (`it`) | 6115 | 0,9975 | 0,9973 |
| Portugués (`pt`) | 6114 | 0,9971 | 0,9965 |
| Español (`es`) | 4652 | 0,9946 | 0,9942 |
| Gallego (`gl`) | 4326 | 0,9961 | 0,9954 |
| Alemán (`de`) | 2431 | 0,9807 | 0,9791 |
| Danés (`da`) | 1637 | 0,9841 | 0,9838 |
| Neerlandés (`nl`) | 1246 | 0,9815 | 0,9787 |
| Polaco (`pl`) | 1169 | 0,9966 | 0,9972 |
| Francés (`fr`) | 752 | 0,9614 | 0,9582 |
| Vasco (`eu`) | 579 | 0,9620 | 0,9605 |
| Sueco (`sv`) | 398 | 0,9824 | 0,9829 |
| Checo (`cs`) | 287 | 0,9895 | 0,9862 |
| Húngaro (`hu`) | 110 | 0,9545 | 0,9486 |
| Cabilio (`kab`) | 91 | 0,9670 | 0,9674 |
| Griego (`el`) | 59 | 1,0000 | 1,0000 |

No se han publicado comparaciones con otros clasificadores de intenciones en la información disponible.

## Requisitos de hardware

- VRAM estimada: no requiere VRAM; la inferencia se ejecuta en CPU.
- GPU recomendada: ninguna; funciona en cualquier CPU moderna.
- Compatible con hardware de bajo consumo: Raspberry Pi, mini-PCs, etc.
- Tamaño en disco: 73,5 MB (0,1 GB en el repositorio).
- Opciones de despliegue: se integra en el pipeline OVOS vía `ovos-m2v-pipeline`, pero también puede usarse de forma independiente con `model2vec.inference.StaticModelPipeline`.
- Latencia y throughput: al ser una operación de lookup y promedio, la latencia es del orden de microsegundos a milisegundos por consulta, aunque no se han publicado cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados contra otros clasificadores de intenciones (p. ej., modelos basados en BERT o en otros embeddings estáticos). Cualitativamente, frente a un clasificador transformer típico (como un DistilBERT fine-tuned), este modelo ofrece:

- Menor coste computacional: sin GPU y con latencia mucho menor.
- Menor tamaño: 73,5 MB frente a cientos de MB de un transformer.
- Cobertura multilingüe amplia (54 locales) con una sola instancia.
- Precisión competitiva en los idiomas con suficientes datos, aunque puede degradarse en idiomas con pocas muestras de entrenamiento.

Frente a soluciones basadas en embeddings estáticos como fastText o Sentence-BERT, Model2Vec ofrece una destilación más compacta y una integración nativa con el ecosistema OVOS.

## Limitaciones y advertencias

- Idiomas con pocos datos de entrenamiento: el modelo emite etiquetas para los 54 locales, pero la precisión solo se reporta para 17 idiomas con al menos 50 filas de test. Idiomas con pocas muestras pueden tener un rendimiento muy inferior al reportado.
- Dependencia del corpus de entrenamiento: la calidad depende de la cobertura y la calidad del dataset generado por `ovos-m2v-pipeline`. Si un skill no está en el corpus, sus intenciones no se reconocerán.
- Sin capacidad generativa: no es un modelo de lenguaje; solo clasifica intenciones. No puede generar respuestas ni mantener conversaciones.
- Riesgo de confusión entre intenciones similares: aunque la precisión global es alta, puede haber errores en expresiones ambiguas o en idiomas con pocos datos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base (multilingual-e5-small) es MIT, sin restricciones adicionales.
- No hay garantía de soporte para todos los idiomas en producción: los idiomas con menos de 50 filas de test no tienen métricas fiables y pueden fallar en escenarios reales.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/OpenVoiceOS/ovos-m2v-intents-multilingual)
- [Repositorio del pipeline (GitHub)](https://github.com/OpenVoiceOS/ovos-m2v-pipeline)
- [Manual técnico de OVOS sobre Model2Vec](https://openvoiceos.github.io/ovos-technical-manual/m2v_pipeline/)
- [README del pipeline en GitHub](https://github.com/OpenVoiceOS/ovos-m2v-pipeline/blob/dev/README.md)
- [Documentación de DeepWiki para ovos-m2v-pipeline](https://deepwiki.com/OpenVoiceOS/ovos-m2v-pipeline)
