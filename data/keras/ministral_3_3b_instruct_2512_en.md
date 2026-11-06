# keras/ministral_3_3b_instruct_2512_en

## Resumen

Ministral 3 3B Instruct es un modelo de lenguaje multimodal de pequeno tamano publicado por Mistral AI y distribuido en formato KerasHub por el equipo de Keras. Forma parte de la familia Ministral 3, que se ofrece en tres tamanos (3B, 8B y 14B) y combina un decodificador de texto con un codificador de vision Pixtral de 0,4B parametros, lo que permite procesar imagenes ademas de texto. Esta variante concreta corresponde al checkpoint instruct de 3B, orientado a conversacion y seguimiento de instrucciones.

El modelo esta pensado para despliegue en el borde y en entornos con recursos limitados, con una ventana de contexto de 256k tokens y soporte para decenas de idiomas, entre ellos el espanol. La version instruct anade soporte de system prompts, function calling nativo y salida en JSON, lo que la hace apta para flujos agenticos. En KerasHub se sirve mediante la arquitectura `Mistral3` con embeddings rotatorios escalados con YaRN.

La relevancia de esta ficha radica en que ofrece una via de acceso al modelo a traves de Keras 3, lo que permite ejecutarlo sobre backends como JAX, PyTorch o TensorFlow con el mismo codigo. Los pesos se publican bajo licencia Apache 2.0 segun la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder multimodal (Mistral3) con encoder de vision Pixtral |
| Parametros totales | 3,4B (decodificador de texto) + 0,4B (encoder de vision) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256k tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles, frances, espanol, aleman, italiano, portugues, neerlandes, chino, japones, coreano y arabe (entre otros) |
| Licencia | Apache 2.0 (pesos); Apache 2.0 (codigo Keras) |
| Formato de pesos | KerasHub (preset); tamano del repo 8,5 GB |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de transformer decoder para el componente de texto, acoplado a un encoder de vision Pixtral de 0,4B parametros que permite la entrada conjunta de imagenes y texto. En KerasHub se implementa mediante la clase `Mistral3CausalLM` y la arquitectura `Mistral3`, que utiliza embeddings rotatorios escalados con YaRN para extender la ventana de contexto hasta 256k tokens. El prompt admite marcadores `[IMG]` para insertar imagenes en la secuencia.

La model card indica que la familia Ministral 3 se distribuye en tres variantes por tamano: base (para fine-tuning e investigacion), instruct (para chat y seguimiento de instrucciones) y reasoning (entrenada para razonar paso a paso en matematicas, codigo y tareas STEM). No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se especifican innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y conversacion multi-turno con seguimiento de instrucciones.
- Procesamiento de imagenes junto a texto (multimodalidad) mediante el encoder Pixtral.
- Razonamiento y tareas de matematicas, codigo y STEM (la variante reasoning del mismo tamano esta entrenada especificamente para ello; esta variante instruct soporta el uso general).
- Soporte de system prompts para definir el comportamiento del asistente.
- Function calling nativo y salida en JSON para integracion en flujos agenticos.
- Capacidades multilingues en decenas de idiomas, incluido el espanol.
- Ventana de contexto de 256k tokens para documentos largos.
- Integracion con Keras 3 sobre backends JAX, PyTorch y TensorFlow.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 256k tokens de ventana, manteniendo el hilo de la conversacion y el historial de incidencias sin truncar.
- Generacion de codigo en produccion: soporta function calling y salida JSON, lo que permite integrarlo en pipelines de CI/CD para autocompletar, revisar o transformar codigo con llamadas a herramientas externas.
- Analisis de documentos con imagenes: al aceptar entradas `[IMG]`, puede extraer informacion de capturas, formularios escaneados o graficos y responder preguntas sobre ellos en el mismo prompt.
- Asistentes agenticos: la combinacion de system prompts, function calling y JSON lo hace adecuado para agentes que encadenan varios pasos y llaman a APIs externas.
- Despliegue en el borde: con 3,4B parametros de texto, es viable en dispositivos con recursos limitados o en entornos sin GPU de gran capacidad, segun la orientacion de Mistral AI para esta familia.
- Traduccion y localizacion: el soporte de decenas de idiomas permite usarlo para traduccion entre espanol, ingles, frances, aleman y otros idiomas europeos y asiaticos.
- Prototipado e investigacion con Keras: al cargarse como preset de KerasHub, permite experimentar con fine-tuning (`fit()`) y muestreo personalizado sobre JAX, PyTorch o TensorFlow con el mismo codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 3,4B parametros en bfloat16 requiere del orden de 7 GB solo para pesos, a lo que se suma el encoder de vision de 0,4B y la cache KV para contextos largos.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU de consumo: no confirmado oficialmente; por tamano, un modelo de 3,4B en bfloat16 es compatible con GPUs de consumo con suficiente memoria, pero no hay dato verificado en la model card.
- Opciones de despliegue: KerasHub (`keras_hub.models.Mistral3CausalLM.from_preset`), con backends JAX, PyTorch y TensorFlow. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ministral 3 3B Instruct (esta ficha) | 3,4B texto + 0,4B vision | 256k | Si | Apache 2.0 | KerasHub / Hugging Face |
| Ministral 3 8B Instruct | 8,4B texto + 0,4B vision | 256k | Si | Apache 2.0 | KerasHub / Hugging Face |
| Ministral 3 14B Instruct | 13,5B texto + 0,4B vision | 256k | Si | Apache 2.0 | KerasHub / Hugging Face |

Las alternativas de otros fabricantes en el rango de 3B no estan disponibles en la informacion proporcionada; la comparativa se limita a los otros tamanos de la misma familia.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion disponible; como todo modelo entrenado con datos web, es probable que herede sesgos, pero no hay datos oficiales.
- Riesgo de alucinacion: no cuantificado en la model card; debe validarse en produccion, especialmente en tareas de hechos y matematicas.
- Limitaciones de contexto o idioma: aunque se declaran decenas de idiomas, no se especifica el nivel de calidad por idioma; el rendimiento en espanol no esta cuantificado.
- Restricciones de licencia: los pesos se publican bajo Apache 2.0 segun la model card, lo que permite uso comercial; el codigo Keras tambien es Apache 2.0. No obstante, conviene verificar la licencia en el repositorio final antes de desplegar.
- Caveats para produccion: el modelo se distribuye como preset de KerasHub, no como safetensors estandar; la integracion con servidores de inferencia convencionales (vLLM, TGI) no esta documentada. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validacion comunitaria.
- La model card no detalla el proceso de entrenamiento ni los datos utilizados, lo que dificulta evaluar riesgos de contaminacion o sesgo.

## Enlaces

- [Hugging Face: keras/ministral_3_3b_instruct_2512_en](https://huggingface.co/keras/ministral_3_3b_instruct_2512_en)
- [Mistral AI](https://mistral.ai/)
- [Keras](https://keras.io/)
- [Keras 3: multi-backend](https://keras.io/keras_3/)
- [Licencia Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
- [Licencia de KerasHub](https://github.com/keras-team/keras-hub/blob/master/LICENSE)
