# Jig09/onomatron-rnn

## Resumen

Jig09/onomatron-rnn es un modelo de lenguaje a nivel de caracter que genera nombres ficticios de personajes con estilo de la literatura francesa. Lo desarrolla Vincent Le Meur (usuario Jig09) como parte del proyecto onomatron, un banco de pruebas que compara once arquitecturas de redes neuronales sobre el mismo corpus de nombres, siguiendo el espiritu pedagogico de makemore de Andrej Karpathy. El modelo no pretende modelar lenguaje natural: aprende estadisticas de caracteres para producir cadenas verosimiles en frances.

La relevancia es acotada y experimental. Con 7.657 parametros y un tamano de 0,03 MB, es el modelo con mejor NLL de validacion (2,3592) de todo el benchmark onomatron, por delante de mlp, wavenet, gru, lstm, rwkv, transformer o mamba. Su interes es comparativo y didactico: demuestra que, en un corpus pequeno y una tarea de generacion corta a nivel de caracter, una RNN simple puede superar a arquitecturas mas modernas y mucho mas grandes.

No es un modelo de proposito general, no tiene ventana de contexto conversacional ni soporte multilingue, y su licencia MIT cubre codigo y pesos, aunque los datos de entrenamiento tienen atribuciones por fuente. Su publicacion en Hugging Face data de noviembre de 2026 y no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RNN (`RNNName`), red neuronal recurrente a nivel de caracter |
| Parametros totales | 7.657 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo a nivel de caracter, sin ventana definida en la informacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | frances (fr) |
| Licencia | MIT (codigo y pesos); datos de entrenamiento bajo `license: other` con atribucion por fuente |
| Formato de pesos | `model.pt` (state_dict de PyTorch) + `config.json` |

## Arquitectura y entrenamiento

El modelo es una RNN basica implementada en PyTorch con embedding de dimension 22 y estado oculto de dimension 57, sobre un vocabulario de 38 caracteres mas un token centinela `.`. El bundle incluye `config.json` con hiperparametros, semilla, vocabulario y metricas, junto con `model.pt` y una copia vendorizada del paquete `onomatron` con el cargador y un CLI de muestreo (`generate.py`).

El entrenamiento se realizo en dos fases. Primero, un estudio de hiperparametros con Optuna (muestreador TPE, poda ASHA, objetivo NLL de validacion, estudios persistentes en SQLite) con cada trial registrado en MLflow. Despues, un reentrenamiento final de 10.000 pasos con los mejores parametros: AdamW con lr 0,0003511356313970409, weight_decay 0,001, sin recorte de gradiente, batch_size 256, semilla 42, dispositivo mps y parada temprana con paciencia 20. El tiempo de entrenamiento fue de 54,7 segundos con un pico de 395 MB de memoria.

Los datos provienen del dataset Jig09/onomatron-names, con un nombre saneado por linea, y se dividen por nombre (no por n-grama, para evitar fuga de informacion) en 80/10/10 con semilla fija; el conjunto de test se evalua una sola vez. No hay RLHF, DPO ni ajuste por instrucciones: es un modelo autoregresivo de caracteres entrenado con entropia cruzada.

## Capacidades

- Generacion de nombres ficticios de personajes con ortografia y diacriticos propios del frances.
- Muestreo por lotes con semilla configurable (`net.sample(n=20, seed=42)`).
- Ejecucion en CPU con throughput de 4.962 nombres por segundo y en MPS para entrenamiento.
- Carga desde Hugging Face Hub mediante `load_bundle_from_hub` y generacion por linea de comandos con `generate.py`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking.
- No tiene capacidades de vision, audio ni comprension semantica.
- No es multilingue: solo modela estadisticas de caracteres del frances.

## Casos de uso

- Generacion de nombres para personajes en obras de ficcion ambientadas en Francia: el modelo produce cadenas como `sabomeste`, `féliansaï` o `poéginine` que respetan la fonotactica francesa y sirven como punto de partida para autores.
- Pruebas de integracion y CI en proyectos de ML: con 0,03 MB y 54,7 segundos de entrenamiento, es util como modelo de juguete para validar pipelines de serializacion, carga desde Hub y muestreo sin coste de computo.
- Docencia y divulgacion: reproduce el flujo de makemore (tokenizacion a nivel de caracter, entrenamiento autoregresivo, muestreo con temperatura) en un caso concreto y con metricas publicadas.
- Benchmarking de arquitecturas: sirve como referencia RNN en comparaciones controladas frente a mlp, wavenet, gru, lstm, rwkv, transformer o mamba sobre el mismo corpus y protocolo de evaluacion.
- Generacion de datasets sinteticos de nombres para pruebas de software: permite poblar bases de datos de prueba con identificadores verosimiles y no reales, evitando usar datos personales.
- Analisis de sesgo y memorizacion en modelos pequenos: al ser un modelo de 7.657 parametros sobre pocos miles de nombres, es un caso de estudio manejable para medir reproduccion literal de ejemplos de entrenamiento.
- Prototipado de interfaces de generacion creativa: el CLI `generate.py --bundle . --n 20 --seed 42` permite experimentar con semillas y cantidades sin escribir codigo.

## Benchmarks y rendimiento

Resultados del benchmark onomatron publicado en la model card, ordenado por NLL de validacion:

| Modelo | val_nll | test_nll | Parametros | Tamano (MB) | Wall (s) | Nombres/s |
|---|---|---|---|---|---|---|
| rnn (este modelo) | 2,3592 | 2,3491 | 7.657 | 0,03 | 54,7 | 4.962 |
| mlp | 2,3759 | 2,3679 | 39.291 | 0,16 | 12,8 | 7.688 |
| wavenet | 2,4002 | 2,3632 | 37.624 | 0,15 | 19,5 | 1.396 |
| dilated_wavenet | 2,4557 | 2,4275 | 13.016 | 0,05 | 28,8 | 445 |
| ngram | 2,4706 | 2,4632 | 0 | 0,44 | 0,1 | 19.243 |
| rwkv | 2,4849 | 2,3446 | 120.998 | 0,48 | 37,2 | 1.085 |
| gru | 2,5292 | 2,4013 | 8.012 | 0,03 | 23,3 | 3.739 |
| lstm | 2,5381 | 2,3703 | 10.062 | 0,04 | 7,7 | 3.846 |
| linear | 2,5918 | 2,5928 | 1.444 | 0,01 | 3,7 | 7.018 |
| transformer | 3,1470 | 2,3757 | 805.158 | 3,22 | 66,6 | 253 |
| mamba | NaN | 2,3653 | 56.102 | 0,22 | 716,6 | 87 |

Este modelo obtiene el mejor NLL de validacion (2,3592) y el segundo mejor de test (2,3491, por detras de rwkv con 2,3446). El throughput se midio en CPU. No se han publicado resultados en benchmarks estandar de NLP (MMLU, HumanEval, GSM8K) porque el modelo no esta disenado para esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos (0,03 MB); el pico de memoria registrado durante el entrenamiento fue de 395 MB en MPS.
- GPU recomendadas: ninguna en particular; el modelo se ejecuta sin problema en CPU. Para entrenamiento se uso un dispositivo Apple MPS.
- Cabe en cualquier GPU consumer, incluso en GPUs integradas o en un entorno sin acelerador.
- Opciones de despliegue: PyTorch nativo con el paquete `onomatron` vendorizado o el CLI `generate.py`; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 4.962 nombres por segundo en CPU segun la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | val_nll | test_nll | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| onomatron-rnn | 7.657 | no disponible | 2,3592 | 2,3491 | MIT | Hugging Face |
| onomatron-mlp | 39.291 | no disponible | 2,3759 | 2,3679 | MIT (mismo proyecto) | Hugging Face |
| onomatron-gru | 8.012 | no disponible | 2,5292 | 2,4013 | MIT (mismo proyecto) | Hugging Face |
| onomatron-transformer | 805.158 | no disponible | 3,1470 | 2,3757 | MIT (mismo proyecto) | Hugging Face |

La comparacion natural es dentro del propio benchmark onomatron, ya que no existen alternativas publicas equivalentes para generacion de nombres franceses a nivel de caracter con estas caracteristicas. Frente a mlp y gru, la rnn logra mejor NLL de validacion con menos parametros que mlp y con un coste de entrenamiento mayor (54,7 s frente a 12,8 s y 23,3 s respectivamente). Frente al transformer, la rnn usa dos ordenes de magnitud menos parametros y obtiene mejor NLL de validacion, aunque el transformer generaliza algo mejor en test (2,3757 frente a 2,3491).

## Limitaciones y advertencias

- Corpus de entrenamiento pequeno (unos pocos miles de nombres) y modelo a nivel de caracter: puede reproducir literalmente nombres del conjunto de entrenamiento.
- Los nombres generados pueden coincidir con personas reales; son ficticios por construccion y no deben usarse para nombrar individuos ni para tomar decisiones sobre ellos.
- Sesgo hacia la literatura francesa; los acentos se conservan pero el resto de caracteres se descarta en la normalizacion.
- Sin semantica ni gramatica: no es un modelo de lenguaje general y no debe emplearse para tareas de comprension, traduccion o generacion de texto libre.
- Solo idioma frances; no hay soporte multilingue.
- Los nombres extraidos del dataset de resolucion de alias de ObTIC (`compnet-renard/7-romans-alias-resolution`) no tienen licencia declarada; debe citarse a Maurel et al., "Du reperage a l'analyse", Digital Humanities 2025 (ObTIC, Sorbonne Universite).
- Los ficheros locales `data/external/*.txt` estan en gitignore y no declaran licencia; los nombres derivados son hechos, pero su seleccion no es del autor. Consultar la model card del dataset.
- La licencia MIT cubre codigo y pesos, pero el uso comercial de los datos de entrenamiento requiere revisar las atribuciones por fuente del dataset.
- Sin datos publicados de sesgos medidos, robustez o evaluacion en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jig09/onomatron-rnn
- Dataset de entrenamiento: https://huggingface.co/datasets/Jig09/onomatron-names
- Benchmark onomatron: https://huggingface.co/Jig09/onomatron-benchmark
- Repositorio del proyecto: https://github.com/vlemeur/onomatron
- makemore (referencia): https://github.com/karpathy/makemore
- Dataset de resolucion de alias de ObTIC: https://huggingface.co/datasets/compnet-renard/7-romans-alias-resolution
