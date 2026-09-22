# MARS-Retokenization/olmo2-7b-instruct-inv-mse-lastpos-final

## Resumen

`MARS-Retokenization/olmo2-7b-instruct-inv-mse-lastpos-final` es un checkpoint de investigacion publicado por el grupo MARS-Retokenization, obtenido mediante fine-tuning de `allenai/OLMo-2-1124-7B-Instruct`. Su proposito no es el despliegue como asistente general, sino servir como artefacto experimental en el estudio de la invarianza frente a la tokenizacion (denominada "reader invariance" por los autores) y su efecto sobre la robustez ante re-tokenizacion adversarial.

El modelo conserva el tamano del base: 7.298.617.344 parametros (7,3B) almacenados en safetensors, con un repositorio de 14,6 GB, lo que corresponde aproximadamente a 2 bytes por parametro (precision de 16 bits). La licencia es Apache 2.0.

Su relevancia es acotada y de caracter academico: explora si un ajuste fino con un objetivo especifico (MSE sobre la ultima posicion, `mse_lastpos`) y entrenamiento sobre multiples codificaciones del mismo prompt puede reducir la tasa de exito de ataques basados en re-tokenizacion adversarial (Geh et al., arXiv:2503.02174). El propio autor advierte que son "artefactos de investigacion, no productos", que no hay resultados de evaluacion publicados todavia ("not yet measured") y que el repositorio acumula 0 descargas y 0 likes, por lo que no ha pasado por validacion de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia OLMo 2; detalles especificos (atencion, normalizacion, RoPE) no disponibles en la informacion proporcionada |
| Parametros totales | 7.298.617.344 (7,3B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors, sin variantes GGUF, GPTQ ni AWQ |
| Idiomas soportados | no disponible; la evaluacion documentada se limita a ingles (AdvBench, XSTest, Alpaca) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ~14,6 GB (equivalente a 2 bytes por parametro, es decir, 16 bits) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-2-1124-7B-Instruct` y se somete a un fine-tuning corto: 700 pasos maximos, learning rate de 1e-5, acumulacion de gradiente de 8 y semilla 42. El objetivo declarado es `mse_lastpos` en modo `prefix`, con 8 tokens de prefijo (`prefix_tokens = 8`), 8 codificaciones por ejemplo (`num_encodings = 8`) y una probabilidad de tokenizacion estocastica de 0,3 (`stochastok_p = 0.3`). La direccion de la divergencia KL es `forward` con ponderacion uniforme de la entropia cruzada (`ce_weighting = uniform`), sin media movil exponencial (`ema_beta = None`). La mezcla de datos nocivos es mixta con una fraccion de 0,286, y se emplea un cuantil de CVaR de 0,25, lo que sugiere una optimizacion orientada a la cola de peor caso en lugar de a la media. La generacion durante el entrenamiento se limita a 128 tokens nuevos.

| Campo de entrenamiento | Valor |
|---|---|
| `mode` | `prefix` |
| `objective` | `mse_lastpos` |
| `kl_direction` | `forward` |
| `ce_weighting` | `uniform` |
| `ema_beta` | `None` |
| `harmful_mix` | `mixed` |
| `harmful_fraction` | `0.286` |
| `num_encodings` | `8` |
| `cvar_quantile` | `0.25` |
| `max_steps` | `700` |
| `learning_rate` | `1e-05` |
| `grad_accum` | `8` |
| `seed` | `42` |
| `reference_model` | `allenai/OLMo-2-1124-7B-Instruct` |
| `max_new_tokens` | `128` |
| `prefix_tokens` | `8` |
| `stochastok_p` | `0.3` |

El autor publica ademas una tabla de deriva de parametros respecto al modelo base como garantia de que el entrenamiento efectivamente ocurrio. La mayor desviacion relativa L2 se da en las capas MLP (0,01224) y en la atencion (0,01156), seguidas de las normalizaciones (0,00249) y de los embeddings de tokens (0,00057). La cabeza de salida (`lm_head`) presenta una deriva de 0,00000, es decir, permanecio congelada o inalterada. Este patron indica que el ajuste afecta principalmente a los bloques transformers y muy poco a la representacion de entrada, coherente con un objetivo centrado en el comportamiento sobre secuencias ya embebidas y no en reasignar el vocabulario.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset mas alla de la fraccion nociva declarada, ni sobre el uso de RLHF o DPO especificos de este fine-tuning. Tampoco se documenta ninguna innovacion de decodificacion (decodificacion especulativa, atencion lineal, SSM) en la informacion proporcionada.

## Capacidades

- Generacion de texto instructiva: hereda la capacidad de seguir instrucciones del modelo base `allenai/OLMo-2-1124-7B-Instruct`, dado que el fine-tuning es corto (700 pasos) y con deriva de pesos moderada.
- Robustez ante re-tokenizacion adversarial: es el objeto explicito del ajuste. El entrenamiento con multiples codificaciones del mismo prompt busca que la respuesta del modelo no dependa de como se fragmenta el texto en tokens.
- Modo de entrenamiento con prefijos: el modo `prefix` con 8 tokens de prefijo sugiere un regimen de condicionamiento inicial, no disponible como capacidad de inferencia documentada.
- Tool calling / function calling: no disponible; no se documenta soporte en la informacion proporcionada.
- Uso como agente o razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingues: no disponible; toda la evaluacion declarada es en ingles.
- Vision, audio u otras modalidades: no disponibles; el modelo es exclusivamente de texto.
- Modo "thinking" o razonamiento explicito: no disponible.

## Casos de uso

- Investigacion sobre invarianza de tokenizacion: el modelo sirve como punto de comparacion en experimentos que midan si la respuesta de un LLM cambia al re-tokenizar la misma cadena de entrada con una codificacion alternativa.
- Red teaming y evaluacion de seguridad: permite estudiar la tasa de exito de ataques de re-tokenizacion adversarial (AdvTok ASR) frente a un modelo base no ajustado, con juicio automatizado mediante Llama-Guard-3-8B y decodificacion greedy.
- Ablation academica reproducible: la semilla fija (42), la configuracion completa y la tabla de deriva de parametros permiten reproducir el experimento y aislar el efecto del objetivo `mse_lastpos`.
- Analisis del equilibrio seguridad/utilidad: la metrica complementaria de sobre-rechazo en XSTest cuantifica el coste en falsos rechazos de prompts seguros, util para estudiar la curva de compromiso entre robustez y utilidad.
- Base para fine-tuning posterior: al ser un modelo denso de 7,3B con licencia Apache 2.0 y pesos en safetensors, puede reutilizarse como punto de partida en proyectos que necesiten un checkpoint pequeno y permisivo.
- Despliegue on-premise en entornos con requisitos de licencia: Apache 2.0 permite uso comercial sin regalias, aunque el modelo no esta pensado ni validado como producto.
- Docencia y formacion: ilustra de forma tangible como se documenta un experimento de fine-tuning con trazabilidad de hiperparametros y deriva de pesos.
- Evaluacion de pipelines de cuantizacion: un modelo denso de 7,3B es un banco de pruebas habitual para medir la perdida de calidad al pasar a 8 o 4 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card incluye una tabla de metricas con el valor "not yet measured" para las dos medidas previstas:

| Metrica | Resultado declarado |
|---|---|
| AdvTok ASR (tasa de exito de ataque bajo tokenizacion adversarial, juicio de Llama-Guard-3-8B, decodificacion greedy) | no medido ("not yet measured") |
| XSTest over-refusal (tasa de rechazo sobre prompts seguros) | no medido ("not yet measured") |
| MMLU, HumanEval, GSM8K u otros benchmarks estandar | no disponibles |

## Requisitos de hardware

- Inferencia en 16 bits: los pesos ocupan aproximadamente 14,6 GB; con cache KV y overhead de runtime es razonable reservar entre 18 y 20 GB de VRAM. Cabe en una RTX 4090 (24 GB), A100 40 GB, L40S 48 GB o H100 80 GB.
- Inferencia en 8 bits: alrededor de 8 GB de pesos, lo que permite ejecucion en GPUs de 12-16 GB.
- Inferencia en 4 bits: aproximadamente 4,5-5 GB de pesos, viable en RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070. No se publican cuantizaciones oficiales, por lo que habria que generarlas.
- GPU de consumo: si, el modelo cabe en GPUs de consumo de 16 GB o mas en 4 u 8 bits, y en 24 GB en precision de 16 bits.
- Opciones de despliegue: al estar en safetensors, es compatible con `transformers`, vLLM, TGI y SGLang. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, ya que no se distribuye ninguna variante GGUF en el repositorio.
- Latencia y throughput: no disponibles. Dependen de la longitud de contexto, que tampoco esta documentada, y del hardware utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `MARS-Retokenization/olmo2-7b-instruct-inv-mse-lastpos-final` | 7,3B | no disponible | Apache 2.0 | 0 descargas, 0 likes, sin pipeline declarado | Checkpoint de investigacion sobre robustez a re-tokenizacion adversarial |
| `allenai/OLMo-2-1124-7B-Instruct` | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | no disponible | Modelo base de referencia y `reference_model` del entrenamiento |

No se dispone de datos de otras alternativas de la misma categoria (por ejemplo, modelos densos de 7-8B de otras familias) en la informacion proporcionada, por lo que no se incluyen cifras comparativas. Cualquier comparacion de rendimiento requeriria consultar las model cards y los resultados publicados de cada alternativa por separado.

## Limitaciones y advertencias

- Artefacto de investigacion, no un producto: el autor lo declara explicitamente. No hay garantia de calidad, soporte ni mantenimiento.
- Una sola semilla: no se puede afirmar significancia estadistica de los resultados entre semillas distintas.
- Evaluacion limitada al ingles y a tres conjuntos concretos (AdvBench, XSTest y Alpaca). No hay evidencia de comportamiento en otros idiomas ni dominios.
- Ambito de seguridad restringido: las cifras de seguridad se refieren al ataque especifico estudiado y no implican robustez frente a otros tipos de jailbreak.
- Sin benchmarks publicados: las metricas previstas aparecen como "not yet measured", por lo que no existe evidencia cuantitativa de mejora frente al modelo base.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta; no se ha declarado pipeline de inferencia.
- Riesgo de alucinacion: inherente al modelo base y no mitigado por este fine-tuning; el ajuste es corto y no incorpora verificacion factual.
- Sesgos: no documentados en la informacion proporcionada, pero heredados del corpus de entrenamiento del modelo base.
- Composicion del dataset: se declara una fraccion de datos nocivos de 0,286, lo que implica exposicion deliberada a contenido perjudicial durante el entrenamiento; conviene tratarlo con cautela en entornos no controlados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la licencia no garantiza idoneidad para produccion ni exime de responsabilidad al desplegador.
- Cabeza de salida intacta (`lm_head` con deriva 0,00000): el ajuste no modifica la proyeccion al vocabulario, algo relevante si se espera un cambio en la distribucion de tokens de salida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MARS-Retokenization/olmo2-7b-instruct-inv-mse-lastpos-final
- Modelo base: https://huggingface.co/allenai/OLMo-2-1124-7B-Instruct
- Paper de referencia sobre re-tokenizacion adversarial (Geh et al.): https://arxiv.org/abs/2503.02174
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los resultados obtenidos correspondian al planeta Marte y a la empresa Mars Inc., por lo que no se incluyen como enlaces utiles.
