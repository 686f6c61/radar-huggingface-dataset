# Ro551/mbart-large-50-GEC-spanish-LORA-merged-exp-dataset_v2

## Resumen

El modelo `Ro551/mbart-large-50-GEC-spanish-LORA-merged-exp-dataset_v2` es un ajuste fino de `facebook/mbart-large-50` orientado a la correccion gramatical del espanol (GEC, *Grammatical Error Correction*). Lo publica el usuario Ro551 en Hugging Face y se distribuye como un adaptador LoRA fusionado en los pesos base, por lo que se carga como un modelo Transformers estandar a traves de la libreria PEFT. El repositorio ocupa 2,1 GB y la licencia declarada es MIT.

El modelo base, mBART-large-50, es un transformer encoder-decoder multilingue de aproximadamente 610 millones de parametros con un vocabulario compartido de 250 000 tokens para 50 idiomas. Al estar basado en mBART, el modelo hereda esa cobertura multilingue, aunque el ajuste fino se ha realizado especificamente sobre datos de correccion en espanol (la model card no detalla la composicion del dataset, solo su nombre interno `dataset_v2`).

La relevancia de esta ficha es limitada pero concreta: se trata de un experimento de ajuste con LoRA para una tarea muy especifica (correccion de errores gramaticales en castellano) y con un unico resultado reportado por el autor (GLEU de 0,8376 y perdida de validacion de 6,8375). No hay benchmarks estandar publicados ni documentacion sobre el dataset de entrenamiento, por lo que debe evaluarse con cautela antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (mBART-large-50) con adaptador LoRA fusionado |
| Parametros totales | Aproximadamente 610 millones (heredados de mBART-large-50; no confirmado en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (valor por defecto de mBART-large-50; no confirmado en la model card) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; compatible con cuantizacion estandar de Transformers, no documentada por el autor) |
| Idiomas soportados | No disponible en la model card; el modelo base soporta 50 idiomas, el ajuste esta orientado al espanol |
| Licencia | MIT |
| Formato de pesos | Safetensors (adaptador LoRA fusionado, cargado via PEFT) |

## Arquitectura y entrenamiento

El modelo parte de `facebook/mbart-large-50`, un transformer encoder-decoder con atencion multi-cabeza estandar y embeddings multilingues compartidos. Sobre esa base se aplico un ajuste con LoRA (Low-Rank Adaptation) que posteriormente se fusiono en los pesos del modelo, de modo que el artefacto publicado se comporta como un modelo completo y no requiere cargar el adaptador por separado. La libreria declarada es PEFT 0.18.1, con Transformers 5.0.0, PyTorch 2.7.0+cu126, Datasets 4.8.5 y Tokenizers 0.22.2.

El entrenamiento se realizo durante 2 epocas con un batch de 32, learning rate de 0,000444, scheduler lineal con warmup del 8,3 %, semilla 42, optimizador AdamW y precision mixta AMP nativa. El autor no especifica el numero de tokens de entrenamiento ni la composicion del dataset (solo aparece como `dataset_v2`). Durante el entrenamiento se registraron dos puntos de evaluacion: en la epoca 1, perdida de validacion 6,8428 y GLEU 0,8203; en la epoca 2, perdida de validacion 6,8375 y GLEU 0,8376. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Correccion gramatical del espanol (GEC): la tarea principal para la que fue ajustado, segun el nombre del modelo y la metrica GLEU reportada.
- Generacion de texto seq2seq: al heredar la arquitectura mBART, puede realizar tareas de traduccion y parafraseo, aunque el ajuste puede haber degradado estas capacidades.
- Capacidad multilingue teorica: el vocabulario de mBART-large-50 cubre 50 idiomas, pero no hay evidencia de que el ajuste preserve el rendimiento en idiomas distintos del espanol.
- Tool calling / function calling: no disponible; no es una capacidad documentada ni esperable en un modelo encoder-decoder de este tipo.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, vision o audio: no disponible.
- Capacidades multilingues: no confirmadas tras el ajuste.

## Casos de uso

- Correccion de textos academicos y periodisticos en espanol: el modelo puede recibir una frase con errores gramaticales y devolver una version corregida, aprovechando el ajuste especifico sobre GEC. Es el uso mas directo y alineado con la metrica GLEU reportada.
- Preprocesado en pipelines de datos: integrado como paso de normalizacion antes de indexar o analizar corpus en espanol, para reducir ruido gramatical en los textos de entrada.
- Asistencia a la redaccion en herramientas internas: como componente de un corrector ortografico y gramatical en editores o CMS, siempre con revision humana dado el limitado soporte documental.
- Generacion de pares error-correccion para aumentar datasets: el modelo puede producir correcciones que sirvan como datos sinteticos para entrenar otros sistemas de GEC o de evaluacion.
- Investigacion en GEC con LoRA: el repositorio sirve como punto de partida reproducible (semilla 42, hiperparametros documentados) para experimentos academicos sobre correccion gramatical en castellano.
- Evaluacion comparativa de tecnicas de ajuste eficiente: al estar fusionado con LoRA, permite comparar el rendimiento frente a un ajuste completo de mBART en la misma tarea.

## Benchmarks y rendimiento

Los unicos resultados disponibles son los reportados por el autor en la model card, sobre el conjunto de evaluacion interno (no se especifica cual es):

| Metrica | Epoca 1 (step 5550) | Epoca 2 (step 11100) |
|---|---|---|
| Perdida de entrenamiento | 10,7633 | 10,7461 |
| Perdida de validacion | 6,8428 | 6,8375 |
| GLEU | 0,8203 | 0,8376 |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, BEA-2019, CoNLL-2014, etc.) en la informacion disponible. La model-index del repositorio esta vacia (`results: []`).

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,4 GB para los pesos (610 M de parametros), mas overhead de activaciones y cache; en la practica, unos 4-6 GB.
- VRAM estimada en fp16/bf16: aproximadamente 1,2-1,5 GB para los pesos, con 3-4 GB totales incluyendo overhead.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,6-0,8 GB para los pesos.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 6 GB de VRAM es suficiente (RTX 3060, RTX 4060, RTX 4090). Para lotes grandes o entrenamiento, A100 o H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 6 GB o mas, e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: Transformers con PEFT, vLLM (soporte de encoder-decoder limitado, verificar version), TGI, y conversion a GGUF para llama.cpp u Ollama (no documentada por el autor, requeriria conversion manual).
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ro551/mbart-large-50-GEC-spanish-LORA-merged-exp-dataset_v2 | ~610 M | 1024 (por defecto) | GEC espanol | MIT | Hugging Face (18 descargas) |
| Ro551/mbart-large-50-GEC-spanish-merged-large | ~610 M | 1024 (por defecto) | GEC espanol | No disponible en la informacion | Hugging Face |
| facebook/mbart-large-50 | ~610 M | 1024 | Traduccion multilingue | MIT | Hugging Face (modelo base) |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- No hay documentacion sobre el dataset de entrenamiento (`dataset_v2`), lo que impide conocer su dominio, tamano y posibles sesgos.
- El unico resultado reportado es un GLEU de 0,8376 sobre un conjunto de evaluacion no especificado; no es comparable con resultados publicados en BEA-2019 o CoNLL-2014.
- La perdida de validacion de 6,8375 es alta en terminos absolutos, lo que sugiere que el modelo puede no haber convergido o que la tarea es especialmente dificil con este ajuste.
- El ajuste puede haber degradado las capacidades multilingues y de traduccion del modelo base mBART-large-50; no hay evidencia de que las preserve.
- Riesgo de alucinacion: como todo modelo generativo, puede introducir cambios no solicitados en el texto de entrada, especialmente en frases largas o fuera del dominio de entrenamiento.
- La licencia MIT permite uso comercial, pero al derivar de mBART-large-50 conviene verificar las condiciones del modelo base (tambien MIT en Hugging Face).
- El repositorio tiene solo 18 descargas y 0 likes, sin validacion independiente por parte de la comunidad; no se recomienda su uso en produccion sin una evaluacion propia sobre datos representativos.
- No hay informacion sobre el pipeline declarado ni sobre el tokenizador especifico utilizado tras el ajuste.
- La fecha de creacion del repositorio (2026-11-03) es posterior a la fecha actual de muchos entornos, lo que puede indicar un error de metadatos o un repositorio de pruebas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Ro551/mbart-large-50-GEC-spanish-LORA-merged-exp-dataset_v2
- Modelo relacionado del mismo autor: https://huggingface.co/Ro551/mbart-large-50-GEC-spanish-merged-large
- Modelo base: https://huggingface.co/facebook/mbart-large-50
