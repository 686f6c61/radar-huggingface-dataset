# KexuanShi/sft_gemma2_2b_layerdrop_p020

## Resumen

sft_gemma2_2b_layerdrop_p020 es un ajuste fino supervisado (SFT) publicado por el usuario KexuanShi en HuggingFace. El identificador del repositorio sugiere que se parte de un modelo de la familia Gemma 2 de 2B parametros y que se aplica una tecnica de layer drop con probabilidad 0,20 durante el entrenamiento, aunque la model card no confirma ninguno de estos dos extremos: el campo de modelo base aparece como `None` y no se documenta el dataset ni la receta de entrenamiento.

El modelo tiene 2.614.341.888 parametros reales (segun los pesos en safetensors) y un repositorio de 5,3 GB, lo que es coherente con pesos en precision de 16 bits. Se entrenó con la libreria TRL en su version 1.13.0, sobre Transformers 5.17.0, PyTorch 2.13.0, Datasets 5.0.1 y Tokenizers 0.23.2. La model card se generó automaticamente con la plantilla `generated_from_trainer` y esta practicamente vacia: no incluye datos de entrenamiento, hiperparametros, evaluacion ni ejemplos de uso reales.

Su relevancia es limitada por el momento: acumula 0 descargas y 0 likes, la licencia es un marcador de posicion sin contenido (`licence: license`) y no se declaran idiomas soportados. Se trata, por tanto, de un artefacto de experimentacion util como referencia para reproducir recetas de SFT con layer drop sobre modelos pequenos, pero no de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 2, segun el identificador del repositorio; no confirmado en la model card) |
| Parametros totales | 2.614.341.888 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors en el momento de la consulta) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye el marcador de posicion `licence: license`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura en la model card. El nombre del repositorio apunta a Gemma 2 en su variante de 2B parametros, un transformer decoder-only con atencion por ventanas alternada y atencion global, normalizacion RMSNorm y activacion GeGLU. El sufijo `layerdrop_p020` sugiere la aplicacion de layer drop con probabilidad 0,20, una regularizacion que desactiva capas completas de forma estocastica durante el entrenamiento para mejorar la robustez y permitir la poda posterior de capas. Ninguno de estos extremos se verifica en la documentacion publicada.

El entrenamiento se realizo mediante SFT con TRL 1.13.0. No se especifica el numero de tokens, la composicion del dataset, la longitud de secuencia, el numero de epocas, la tasa de aprendizaje ni si hubo etapas posteriores de alineacion como RLHF o DPO. La model card no incluye curvas de perdida ni metricas de evaluacion. Tampoco se detalla si la tecnica de layer drop se aplico durante el entrenamiento o si el checkpoint final tiene capas efectivamente eliminadas; dado que el recuento de parametros coincide con el de un modelo de 2B sin poda aparente, lo mas probable es que se trate de un entrenamiento con regularizacion por layer drop y no de un modelo podado.

## Capacidades

- Generacion de texto autoregresiva en el pipeline `text-generation` de Transformers.
- Conversacion multi-turno: la model card incluye un ejemplo con formato de mensajes (`{"role": "user", "content": ...}`), lo que indica soporte de plantilla de chat, aunque no se documenta la plantilla concreta.
- Ajuste por instrucciones: al ser un modelo entrenado con SFT, se espera cierta capacidad de seguir instrucciones, sin datos publicados que la cuantifiquen.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Experimentacion academica con regularizacion layer drop: el checkpoint permite estudiar el efecto de desactivar capas durante el SFT sobre un modelo pequeno, comparando la estabilidad del entrenamiento y la degradacion del modelo resultante frente a un SFT sin layer drop.
- Base para destilacion o poda: si el layer drop se aplico con exito, el modelo es un candidato para probar tecnicas de pruning de capas completas y medir la caida de calidad por capa eliminada.
- Prototipado rapido en local: con 2,6B parametros, el modelo se puede ejecutar en una GPU de consumo en cuantizacion de 8 o 4 bits, lo que permite validar pipelines de generacion antes de escalar a modelos mayores.
- Evaluacion de la plantilla `generated_from_trainer` de TRL: sirve como caso de prueba de extremo a extremo de un flujo de SFT con `hf_jobs` y publicacion automatica en el Hub.
- Reproduccion de recetas: dado que se conocen las versiones exactas de TRL, Transformers, PyTorch, Datasets y Tokenizers, se puede intentar reproducir el entrenamiento para comparar resultados.
- Benchmarking interno de modelos pequenos: util como punto de comparacion en una bateria de pruebas propia frente a Gemma 2 2B base u otros modelos de ~2B, siempre que se acepte que no hay resultados publicados de referencia.
- Generacion de texto generica con instrucciones simples, asumiendo la necesidad de validacion manual por la ausencia de evaluacion publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la busqueda web no ha devuelto resultados relacionados con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 2,61B parametros; son estimaciones, no datos publicados por el autor):
  - FP16/BF16: aproximadamente 5,2 GB solo de pesos, mas 1-2 GB de activaciones y cache KV segun longitud de secuencia.
  - INT8: aproximadamente 2,6 GB de pesos.
  - INT4 (GPTQ, AWQ, bitsandbytes): aproximadamente 1,3-1,6 GB de pesos.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para FP16 en secuencias cortas; RTX 3060 12 GB, RTX 4070, RTX 4090, A10G, L4, A100 o H100 para mayor throughput.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en FP16 para contextos cortos, y en tarjetas con 4-6 GB usando cuantizacion de 4 bits.
- Opciones de despliegue: transformers (verificado por la libreria declarada), text-generation-inference (etiqueta `text-generation-inference` presente), endpoints compatible (etiqueta `endpoints_compatible`), vLLM y llama.cpp/Ollama requieren conversion a GGUF o verificacion de compatibilidad, no confirmada en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este modelo, por lo que la comparativa se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sft_gemma2_2b_layerdrop_p020 | 2,61B | no disponible | no disponible | HuggingFace, 0 descargas |
| google/gemma-2-2b (base probable) | 2,61B | 8.192 tokens segun la documentacion de la familia Gemma 2 | Gemma Terms of Use | Ampliamente disponible |
| Qwen/Qwen2.5-1.5B | 1,54B | 32.768 tokens | Apache 2.0 | Ampliamente disponible |
| meta-llama/Llama-3.2-3B | 3,21B | 131.072 tokens | Llama 3.2 Community License | Ampliamente disponible |

Las cifras de contexto y licencia de los modelos de comparacion corresponden a sus fichas publicas; los datos de rendimiento comparado no estan disponibles para el modelo objeto de esta ficha.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, curvas de entrenamiento ni analisis de calidad, por lo que no se puede afirmar que el ajuste fino haya mejorado al modelo base.
- Modelo base no confirmado: la model card indica `fine-tuned version of [None]`, de modo que la procedencia exacta de los pesos no esta documentada.
- Licencia indeterminada: el campo de licencia contiene el literal `license`, sin texto legal asociado. Si el modelo deriva de Gemma 2, heredaria las restricciones de los Gemma Terms of Use, que incluyen obligaciones de atribucion y una politica de uso prohibido. No se puede asumir uso comercial libre.
- Idiomas no declarados: se desconoce si el ajuste fino conserva el multilingueismo del modelo base o si el dataset de SFT era monolingue.
- Riesgo de alucinacion: inherente a cualquier modelo de 2B entrenado con SFT y sin etapas de alineacion documentadas; sin evaluacion no se puede acotar.
- Sesgos: no documentados. No hay informacion sobre la composicion del dataset de ajuste, lo que impide evaluar sesgos demograficos, culturales o de dominio.
- Contexto desconocido: la longitud de contexto efectiva tras el ajuste no esta declarada; si se aplico layer drop, el comportamiento en secuencias largas podria degradarse.
- Reproducibilidad dudosa: aunque se listan las versiones de las librerias, faltan hiperparametros, semilla, dataset y configuracion de layer drop.
- Sin soporte de la comunidad: 0 descargas y 0 likes implican que el modelo no ha sido validado por terceros.
- No apto para produccion sin evaluacion previa: se recomienda tratarlo como artefacto experimental y validarlo con un conjunto de pruebas propio antes de cualquier uso real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KexuanShi/sft_gemma2_2b_layerdrop_p020
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentacion de TRL sobre SFT: https://huggingface.co/docs/trl/sft_trainer
- Paper de Gemma 2 (familia base probable): https://arxiv.org/abs/2408.00118
- No se han encontrado otros enlaces relevantes (papers, blogs, demos o repos) asociados a este modelo en la busqueda web realizada.
