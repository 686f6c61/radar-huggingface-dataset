# guan-wang/ESM-OWT-160M

## Resumen

ESM-OWT-160M es un modelo de lenguaje de tipo energy-based model (EBM) desarrollado por el usuario guan-wang dentro del proyecto OpenESM. Se distribuye como un export compatible con Hugging Face Transformers del checkpoint de preentrenamiento, pero no utiliza la arquitectura `transformers.EsmModel` integrada en la libreria, sino una implementacion propia de OpenESM (variante d12) que requiere cargar codigo remoto con `trust_remote_code=True`. El modelo tiene 160.556.544 parametros totales, 12 bloques transformer, dimension de embedding de 768, 6 cabezas de atencion y una ventana de contexto de 2048 tokens.

El modelo fue preentrenado desde cero sobre el corpus OWT (OpenWebText) y se publica en fase de preentrenamiento, sin etapas posteriores de ajuste por instrucciones, RLHF o DPO documentadas. Su tarea declarada en el pipeline es `fill-mask`, es decir, prediccion de tokens enmascarados, aunque la formulacion subyacente es la de un modelo de lenguaje basado en energia segun los tags del repositorio.

La relevancia de esta ficha es mas bien de caracter experimental: el repositorio acumula 0 descargas y 0 likes en el momento de la consulta, no declara licencia, no declara idiomas soportados y no publica resultados de benchmarks. Esto lo convierte en un artefacto de investigacion util para estudiar la familia OpenESM mas que en un candidato listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OpenESM custom (variante d12), energy-based language model, transformer de 12 bloques |
| Parametros totales | 160.556.544 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos safetensors; no se documentan variantes GGUF, AWQ, GPTQ ni int8/int4) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica explicitamente "Please add the applicable model/data license before publishing this repo") |
| Formato de pesos | safetensors (`model*.safetensors`), con `config.json`, `modeling_esm.py`, `configuration_esm.py`, `tokenizer.pkl`, `tokenizer_config.json` y `token_bytes.pt` |
| Dimension de embedding | 768 |
| Cabezas de atencion | 6 |
| Tamano de vocabulario | 32768 |
| Tamano del repositorio | 0,6 GB |
| Etapa de entrenamiento | preentrenamiento |
| Dataset de entrenamiento | OWT (OpenWebText) |

## Arquitectura y entrenamiento

El modelo sigue la implementacion personalizada de OpenESM, una familia de modelos de lenguaje basados en energia. La configuracion exportada indica 12 bloques transformer, 768 dimensiones de embedding, 6 cabezas de atencion y 2048 tokens de contexto, con un vocabulario de 32768 entradas gestionado por un tokenizador serializado propio (`tokenizer.pkl`). El repositorio incluye ademas `token_bytes.pt`, una tabla de bytes por token usada por las metricas de OpenESM. Al no tratarse de la arquitectura `EsmModel` nativa de Transformers, es obligatorio activar `trust_remote_code=True` y revisar el codigo remoto antes de la primera carga.

Los metadatos del checkpoint original aportan detalles del entrenamiento: el archivo se llama `final-s=step=8642-d12-tokens9063689276-ctx2048.ckpt` y la ruta de entrenamiento incluye la configuracion `pretrain-owt-d12-ce-gptmatched_0916_1835_d12_tokens9063689276_ctx2048_bs512_lr0.0012_1nodes_8gpus`. De ahi se deduce un entrenamiento de 8642 pasos sobre aproximadamente 9.063.689.276 tokens (unos 9 mil millones), con batch size 512, learning rate 0,0012, contexto de 2048 y ejecucion en 1 nodo con 8 GPUs. La etiqueta `ce` apunta a un objetivo de entrenamiento basado en entropia cruzada y `gptmatched` sugiere un ajuste de configuracion para igualar escalas de tipo GPT, aunque no se documenta en detalle. No se especifica composicion del dataset mas alla de OWT, ni procesos de RLHF, DPO o ajuste por instrucciones; el autor ademas indica que los recuentos de tokens de entrenamiento se omiten deliberadamente del nombre del repositorio y de los nombres de archivo.

## Capacidades

- Generacion y modelado de lenguaje: al ser un modelo de lenguaje preentrenado, puede usarse para puntuar secuencias y para prediccion de tokens, que es el pipeline declarado (`fill-mask`).
- Prediccion de tokens enmascarados: el uso documentado en la model card es `AutoModelForMaskedLM` con `outputs.logits`, es decir, obtener la distribucion sobre el vocabulario para cada posicion.
- Representaciones contextuales: los estados internos de un transformer de 12 capas y 768 dimensiones pueden emplearse como embeddings contextuales para tareas posteriores.
- Soporte de tool calling / function calling: no disponible; no hay plantilla de chat ni formato de herramientas documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible; al ser un checkpoint de preentrenamiento sin ajuste por instrucciones, no hay evidencia de estas capacidades.
- Capacidades multilingues: no disponible; el autor no declara idiomas y el corpus de entrenamiento es OWT, mayoritariamente en ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Investigacion sobre modelos de lenguaje basados en energia: el modelo permite reproducir y estudiar la formulacion EBM de OpenESM a escala 160M, comparando la funcion de energia aprendida frente a modelos de lenguaje autorregresivos equivalentes en tamano.
- Prediccion de tokens enmascarados en textos en ingles: usando `AutoModelForMaskedLM` y el tokenizador incluido se pueden rellenar huecos en frases para analisis linguistico, dado que OWT es un corpus principalmente en ingles.
- Extraccion de embeddings contextuales: las 768 dimensiones de la ultima capa oculta sirven como features para clasificacion de texto o clustering, siempre que se valide la calidad de las representaciones con datos propios.
- Puntuacion de secuencias y deteccion de anomalias textuales: la formulacion basada en energia permite asignar una puntuacion de verosimilitud a un texto, util para filtrar contenido atipico en un corpus, aunque la calibracion deberia validarse empiricamente.
- Experimentos de destilacion o inicializacion de modelos mayores: al ser un checkpoint de 160M con 9 mil millones de tokens vistos, puede servir como punto de partida o como modelo profesor en un pipeline de destilacion en investigacion.
- Benchmarking interno de infraestructura: con 0,6 GB de pesos, es util para validar pipelines de carga con `trust_remote_code`, integracion en entornos de evaluacion y pruebas de humo de despliegue sin consumir recursos significativos.
- Analisis comparativo de arquitecturas personalizadas: sirve para medir el coste de mantenimiento de depender de codigo remoto frente a arquitecturas nativas de Transformers en un entorno corporativo.

Hay que subrayar que ninguno de estos casos esta respaldado por evaluaciones publicadas del autor en la informacion disponible; son usos plausibles derivados de la configuracion tecnica del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, GLUE, perplexity ni ninguna otra metrica, y el repositorio no adjunta resultados de evaluacion. Tampoco se aportan datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 160.556.544 parametros, no confirmada por el autor): aproximadamente 0,64 GB en FP32, 0,32 GB en FP16/BF16 y 0,16 GB en int8. A estas cifras hay que sumar el coste de activaciones y del contexto de 2048 tokens, que en la practica suele anadir un margen adicional.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM dedicada es suficiente en la practica; una NVIDIA RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problemas, aunque en estas ultimas el modelo queda muy infrautilizado.
- Cabe en GPU de consumo: si, con margen amplio, en practicamente cualquier GPU de consumo moderna con al menos 4 GB de VRAM, incluidas GTX 1650 y superiores. Tambien es viable en CPU, dado el reducido tamano.
- Opciones de despliegue: la unica via documentada es `transformers` con `AutoModelForMaskedLM` y `trust_remote_code=True`. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia, y su integracion en ellos no esta garantizada al tratarse de una arquitectura personalizada con codigo remoto.
- Latencia y throughput: no disponible. No hay mediciones publicadas ni configuracion de referencia.

## Comparativa con modelos similares

La informacion disponible no incluye benchmarks comparativos, por lo que la comparacion se limita a caracteristicas estructurales y a datos publicos ampliamente conocidos de alternativas de tamano similar.

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ESM-OWT-160M | 160,6M | 2048 | fill-mask / EBM de lenguaje | no disponible | Hugging Face, requiere `trust_remote_code` |
| BERT-base (referencia) | 110M | 512 | fill-mask / encoder | Apache 2.0 (segun su publicacion original) | Transformers nativo |
| RoBERTa-base (referencia) | 125M | 512 | fill-mask / encoder | MIT (segun su publicacion original) | Transformers nativo |
| GPT-2 small (referencia) | 124M | 1024 | generacion autorregresiva | MIT (segun su publicacion original) | Transformers nativo |

Las cifras de las alternativas corresponden a especificaciones publicas conocidas de esos modelos y no a mediciones realizadas sobre este repositorio. No se dispone de comparaciones de rendimiento, perplexity ni calidad de representaciones entre ESM-OWT-160M y estas alternativas.

## Limitaciones y advertencias

- Licencia no declarada: la propia model card pide anadir una licencia aplicable antes de publicar el repositorio. Sin licencia explicita no hay autorizacion clara de uso comercial ni de redistribucion; conviene contactar con el autor antes de cualquier despliegue.
- Modelo en fase de preentrenamiento: no ha pasado por ajuste por instrucciones, RLHF ni DPO, por lo que no cabe esperar comportamiento de asistente, seguimiento de instrucciones ni formato conversacional.
- Codigo remoto obligatorio: la carga requiere `trust_remote_code=True` y la ejecucion de `modeling_esm.py` y `configuration_esm.py` descargados del repositorio. Esto implica un riesgo de seguridad y de cadena de suministro que debe evaluarse antes de usarlo en produccion.
- Ausencia de benchmarks: no hay ninguna evaluacion publicada, por lo que se desconoce la calidad real del modelo frente a alternativas de tamano similar.
- Idiomas no declarados: el entrenamiento sobre OWT hace prever un sesgo muy marcado hacia el ingles y un rendimiento pobre o inexistente en castellano.
- Riesgo de alucinacion: como cualquier modelo de lenguaje preentrenado, puede producir contenido plausible pero falso; no hay mitigaciones documentadas.
- Sesgos: no se documenta ningun analisis de sesgos, filtrado del corpus de entrenamiento ni evaluacion de toxicidad. OWT procede de enlaces compartidos en Reddit, con los sesgos de dominio y de idioma que eso implica.
- Contexto limitado a 2048 tokens, inferior al de modelos actuales de tamano comparable, lo que restringe tareas que requieran documentos largos.
- Soporte practico inexistente en el ecosistema: sin cuantizaciones publicadas, sin integracion en vLLM, llama.cpp, Ollama o TGI y con 0 descargas, es probable que aparezcan problemas de compatibilidad y que no haya comunidad que los resuelva.
- Recuento de tokens omitido deliberadamente del nombre del repositorio por decision del autor, aunque el nombre del checkpoint original lo revela; conviene tratarlo como dato no verificado de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guan-wang/ESM-OWT-160M
- Repositorio de codigo OpenESM: https://github.com/datamllab/openesm
- Paper de OpenESM: no disponible en la informacion proporcionada
- Blog o demo oficial: no disponible
- Resultados de benchmarks: no disponibles
- Los resultados de busqueda web obtenidos no contienen informacion relevante sobre el modelo (corresponden a la palabra "guan" en otros contextos: aves de la familia Cracidae, un grupo etnico de Ghana, un restaurante en Montreal y una entrada de diccionario francesa).
