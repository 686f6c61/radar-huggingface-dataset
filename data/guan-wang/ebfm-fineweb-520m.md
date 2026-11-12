# guan-wang/EBFM-FineWeb-520M

## Resumen

EBFM-FineWeb-520M es un modelo de lenguaje de tipo *energy-based* (EBFM, energy-based foundation model) desarrollado por el autor guan-wang dentro del proyecto OpenEBFM, vinculado al grupo de investigacion datamllab. Se trata de un checkpoint de preentrenamiento de 519.462.400 parametros (etiquetado comercialmente como "520M", variante d20) entrenado sobre el corpus FineWeb. Su interes radica en que no es un transformer autoregresivo convencional, sino una implementacion de arquitectura propia basada en modelos dirigidos por energia, una linea de investigacion que busca alternativas escalables a los modelos generativos clasicos.

El modelo se distribuye como exportacion compatible con Hugging Face Transformers, pero requiere `trust_remote_code=True` porque la implementacion (`modeling_ebfm.py`, `configuration_ebfm.py`) es codigo remoto personalizado. La pipeline declarada es `fill-mask`, lo que refleja el uso previsto del checkpoint: enmascarado y puntuacion de secuencias mas que generacion autoregresiva abierta.

Es relevante ahora por dos motivos: primero, porque el informe tecnico asociado (OpenESM: Energy-Steered Models Are Scalable Foundation Learners, arXiv:2610.33005) plantea la hipotesis de que los modelos dirigidos por energia escalan como aprendices fundacionales; segundo, porque ofrece un checkpoint abierto (licencia MIT) de escala media (520M) y contexto 2048, util para reproducir y evaluar esa hipotesis sin necesidad de infraestructura masiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Implementacion custom OpenEBFM (energy-based language model), variante d20; 20 bloques transformer, dimension de embedding 1280, 10 cabezas de atencion |
| Parametros totales | 519.462.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`); tokenizer serializado en `tokenizer.pkl` y tabla de bytes en `token_bytes.pt` |

Otros datos de configuracion: vocabulario de 32768 tokens, etapa de entrenamiento de preentrenamiento (no instruido), dataset FineWeb, tamano del repo 2.1 GB, 65 descargas y 1 like en el momento de la consulta.

## Arquitectura y entrenamiento

El modelo pertenece a la familia OpenEBFM de modelos de lenguaje dirigidos por energia. La configuracion exportada indica 20 bloques transformer con dimension de embedding 1280 y 10 cabezas de atencion, sobre un vocabulario de 32768 tokens y una longitud de contexto de 2048. La innovacion central no esta en el bloque transformer en si, sino en el marco de entrenamiento y puntuacion: el modelo se formula como un modelo dirigido por energia, lo que implica que aprende una funcion de energia sobre secuencias en lugar de (o ademas de) una distribucion autoregresiva directa. La model card no detalla la funcion objetivo exacta ni el mecanismo de inferencia mas alla de la salida de `logits` en un `AutoModelForMaskedLM`.

En cuanto a datos, el checkpoint se entrena exclusivamente sobre FineWeb, un corpus web a gran escala ampliamente usado para preentrenamiento. No se especifica en la informacion disponible el numero de tokens vistos, la composicion del dataset, ni si hubo etapas de alineacion como RLHF o DPO; la model card indica explicitamente que se trata de un checkpoint de preentrenamiento. Tampoco se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal. El informe tecnico de referencia es arXiv:2610.33005 (OpenESM: Energy-Steered Models Are Scalable Foundation Learners), que es donde debe buscarse la descripcion completa del metodo.

## Capacidades

- Puntuacion y enmascarado de secuencias: la pipeline declarada es `fill-mask`, por lo que el uso natural es calcular logits sobre tokens enmascarados y puntuar secuencias completas.
- Modelado de lenguaje a nivel de token: produce `outputs.logits` con forma dependiente de la longitud de entrada y el vocabulario de 32768.
- Representacion contextual de hasta 2048 tokens por secuencia.
- Capacidad multilingue: no disponible; la model card no declara idiomas.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Soporte de agentes y razonamiento multi-paso: no disponible; es un checkpoint de preentrenamiento sin alineacion instruccional.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.
- Uso como base para fine-tuning: al ser un checkpoint de preentrenamiento con licencia MIT y pesos safetensors, es apto como punto de partida para tareas posteriores, siempre que se respete la dependencia de codigo remoto.

## Casos de uso

- Investigacion en modelos dirigidos por energia: el caso principal. Permite reproducir y extender los experimentos de OpenESM a escala 520M, comparando la funcion de energia aprendida con lineas base autoregresivas del mismo tamano.
- Evaluacion de fill-mask y puntuacion de secuencias: usar el modelo para asignar verosimilitud o energia a frases y estudiar como se comporta frente a modelos enmascarados clasicos (BERT, RoBERTa) en tareas de deteccion de anomalias textuales o ranking de candidatos.
- Fine-tuning para clasificacion de texto: partiendo del checkpoint preentrenado, anadir una cabeza de clasificacion y ajustar sobre dominios especificos (moderacion, clasificacion de tickets, etc.), aprovechando el contexto de 2048 tokens.
- Base para experimentos de escalado: al existir una etiqueta de escala ("520M", variante d20), es util para estudiar curvas de escalado dentro de la familia OpenEBFM y contrastar la hipotesis de escalabilidad del paper.
- Reproduccion academica y docencia: el repo incluye configuracion, codigo de modelado y tabla de bytes, lo que facilita usar el modelo como ejemplo didactico de arquitectura no convencional en cursos de NLP.
- Prototipado de sistemas de scoring en pipelines de datos: puntuar pares pregunta-respuesta o filtrar texto de baja calidad en un corpus, usando la salida del modelo como senal auxiliar en un pipeline de curacion de datos.
- Analisis de sesgos y calibracion en modelos no autoregresivos: comparar la calibracion de energias frente a probabilidades softmax de modelos clasicos en conjuntos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,1 GB solo para pesos (519M parametros x 4 bytes), mas activaciones y overhead del runtime; en la practica, entre 3 y 4 GB.
- VRAM estimada en fp16/bf16: alrededor de 1,1 GB para pesos; en la practica, entre 2 y 3 GB con activaciones para secuencias de 2048 tokens.
- VRAM estimada en int8: aproximadamente 0,6 GB para pesos; no se documentan checkpoints cuantizados oficiales, por lo que la cuantizacion requeriria conversion manual.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 6-8 GB es suficiente; RTX 3060, RTX 4060, RTX 4090 funcionan sin problema. Para lotes grandes, A100 o H100 aportan margen, aunque el modelo es pequeno para justificarlas.
- Cabe en GPU consumer: si, en la mayoria de GPU con 6 GB o mas.
- Opciones de despliegue: al requerir codigo remoto (`trust_remote_code=True`) y una implementacion custom, el despliegue esta limitado a Transformers con Python; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, y la conversion a GGUF no esta disponible de forma oficial.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EBFM-FineWeb-520M | 519M | 2048 | Energy-based custom (OpenEBFM d20) | MIT | Hugging Face, requiere `trust_remote_code` |
| BERT-base | 110M | 512 | Transformer encoder enmascarado | Apache 2.0 | Amplia, multiples runtimes |
| RoBERTa-base | 125M | 512 | Transformer encoder enmascarado | MIT | Amplia, multiples runtimes |
| GPT-2 (124M) | 124M | 1024 | Transformer decoder autoregresivo | MIT | Amplia, multiples runtimes |

La comparativa es aproximada: no hay benchmarks publicados del EBFM que permitan contrastar calidad frente a estas lineas base. La diferencia principal es arquitectonica (modelo dirigido por energia frente a transformers convencionales) y de escala (520M frente a 110-125M de las alternativas citadas). No se dispone de modelos comparables de la misma familia OpenEBFM en la informacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de preentrenamiento: no esta instruido ni alineado, por lo que no debe esperarse un comportamiento de asistente ni respuestas utiles a instrucciones directas.
- Requiere ejecutar codigo remoto (`trust_remote_code=True`) desde el repositorio; esto implica un riesgo de seguridad que debe evaluarse antes de usarlo en produccion.
- No hay benchmarks publicados en la informacion disponible, por lo que no se puede afirmar su calidad relativa frente a modelos consolidados.
- Idiomas soportados no declarados: se desconoce el comportamiento multilingue y el sesgo linguistico derivado de FineWeb.
- Riesgo de alucinacion y sesgos: al entrenarse sobre FineWeb, hereda los sesgos y ruido del corpus web; no se documentan mitigaciones.
- Contexto limitado a 2048 tokens, inferior al de modelos actuales de proposito general.
- No hay soporte documentado para runtimes de inferencia optimizados (vLLM, llama.cpp, TGI, Ollama), lo que limita el despliegue a produccion a traves de Transformers.
- La licencia MIT permite uso comercial, pero la dependencia de codigo remoto y la falta de garantias del autor deben tenerse en cuenta en entornos regulados.
- El numero de descargas (65) y likes (1) es bajo, lo que sugiere poca validacion externa de la comunidad hasta la fecha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guan-wang/EBFM-FineWeb-520M
- Repositorio OpenEBFM: https://github.com/datamllab/openebfm
- Informe tecnico (paper): https://huggingface.co/papers/2610.33005
- arXiv: 2610.33005 (OpenESM: Energy-Steered Models Are Scalable Foundation Learners)
