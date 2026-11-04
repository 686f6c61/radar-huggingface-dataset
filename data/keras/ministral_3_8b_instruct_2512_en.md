# keras/ministral_3_8b_instruct_2512_en

## Resumen

Ministral 3 es una familia de modelos de lenguaje multimodales de pequeno tamano publicada por Mistral AI, orientada a despliegue en el borde y en entornos de bajos recursos. La familia se ofrece en tres tamanos (3B, 8B y 14B); cada uno combina un decodificador de texto (3.4B, 8.4B o 13.5B parametros) con un codificador de vision Pixtral de 0.4B parametros, de modo que los modelos aceptan imagenes junto a texto. Esta ficha concreta corresponde al checkpoint instruct de 8B en formato KerasHub, publicado por el equipo de Keras bajo el identificador `keras/ministral_3_8b_instruct_2512_en`.

El modelo resuelve el problema de disponer de un LLM multimodal con ventana de contexto muy amplia (256k tokens) y soporte de decenas de idiomas en un rango de parametros que cabe en hardware de gama alta de consumo o en una unica GPU de datacenter. Frente a los modelos frontier, el interes esta en el equilibrio entre capacidad, coste de inferencia y licencia permisiva (Apache 2.0 segun la model card).

La relevancia actual del checkpoint reside en su integracion nativa en KerasHub: se carga mediante `keras_hub.models.Mistral3CausalLM.from_preset` y se ejecuta sobre los backends de Keras 3 (JAX, PyTorch, TensorFlow), lo que facilita prototipado rapido, fine-tuning y despliegue sin salir del ecosistema Keras. La arquitectura subyacente es la Mistral3, con embeddings rotatorios escalados mediante YaRN para sostener el contexto largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral3) con codificador de vision Pixtral; RoPE con escalado YaRN |
| Parametros totales | 8.4B (decodificador de texto) + 0.4B (codificador de vision Pixtral) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256k tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (la model card solo muestra carga en `bfloat16`) |
| Idiomas soportados | Ingles, frances, espanol, aleman, italiano, portugues, neerlandes, chino, japones, coreano y arabe (segun la model card) |
| Licencia | Apache 2.0 (pesos); codigo Keras bajo Apache 2.0 |
| Formato de pesos | Pesos KerasHub (repo de 18.7 GB); no se detalla si incluye safetensors o GGUF |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only (Mistral3) para la parte de texto, acoplada a un codificador de vision Pixtral de 0.4B parametros que proyecta las imagenes al espacio del decodificador. La model card indica que los embeddings rotatorios se escalan con YaRN, tecnica que permite extender la ventana de contexto efectiva hasta 256k tokens sin reentrenar desde cero. El checkpoint es la variante *instruct*, entrenada para conversacion y seguimiento de instrucciones; la familia incluye ademas variantes *base* (para fine-tuning e investigacion) y *reasoning* (entrenada para razonamiento paso a paso en matematicas, codigo y STEM).

La informacion proporcionada no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO. Tampoco se especifican innovaciones adicionales como decodificacion especulativa o atencion lineal. Lo que si se documenta es el soporte de system prompts, function calling nativo y salida en JSON en los checkpoints instruct y reasoning, lo que indica un post-entrenamiento orientado a uso agentico.

## Capacidades

- Generacion de texto y seguimiento de instrucciones en modo chat.
- Razonamiento multimodal: acepta imagenes junto a texto mediante marcadores `[IMG]` en el prompt.
- Ventana de contexto de 256k tokens, adecuada para documentos largos y conversaciones multi-turno extensas.
- Soporte nativo de system prompts.
- Function calling / tool calling nativo.
- Salida estructurada en JSON para integracion en pipelines y agentes.
- Capacidades multilingues en once idiomas documentados (ingles, frances, espanol, aleman, italiano, portugues, neerlandes, chino, japones, coreano y arabe).
- Control de muestreo configurable en KerasHub: greedy, top-k con temperatura y samplers personalizados.
- Fine-tuning sobre un unico batch mediante `fit()` dentro de KerasHub.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con historial largo gracias a sus 256k tokens de contexto, manteniendo coherencia en hilos extensos y soportando system prompts para definir la persona y las politicas de la empresa.
- Extraccion de informacion de documentos largos: contratos, informes o expedientes de decenas de miles de tokens pueden procesarse en una sola pasada, con salida en JSON para alimentar bases de datos o sistemas de gestion documental.
- Asistentes sobre capturas y documentos escaneados: al incorporar el codificador Pixtral, puede responder preguntas sobre imagenes (facturas, diagramas, capturas de pantalla) combinando vision y texto en el mismo prompt.
- Agentes con tool calling: el soporte nativo de function calling y JSON permite construir agentes que consulten APIs, bases de datos o servicios internos en flujos multi-paso, con el modelo decidiendo que herramienta invocar en cada turno.
- Generacion y revision de codigo asistida: utilizable en pipelines de CI/CD o en editores para explicar fragmentos, generar tests o revisar cambios, con la ventaja de poder adjuntar diagramas o capturas de errores como imagen.
- Traduccion y localizacion multilingue: con once idiomas documentados, sirve para traducir documentacion tecnica o contenido de producto manteniendo contexto largo entre segmentos.
- Prototipado e investigacion en Keras: al cargarse con `keras_hub.models.Mistral3CausalLM.from_preset`, permite experimentar con samplers, fine-tuning ligero y evaluacion sobre los backends JAX, PyTorch y TensorFlow sin cambiar de framework.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano, un modelo de 8.4B parametros en `bfloat16` requiere aproximadamente 17 GB solo para pesos, a lo que hay que sumar KV cache y activaciones; en cuantizacion de 8 bits rondaria los 9 GB y en 4 bits unos 5 GB, aunque estos valores no estan confirmados en la model card.
- El contexto de 256k tokens incrementa de forma significativa el consumo de KV cache; para aprovechar la ventana completa se recomienda hardware con memoria amplia (A100 80 GB, H100 80 GB) o tecnicas de atencion eficiente.
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 4090 (24 GB) o una L40S (48 GB) serian suficientes para inferencia en precision reducida con contexto moderado; para contexto completo, A100/H100.
- Cabe en GPU de consumo: previsiblemente si en RTX 4090 y RTX 3090 en cuantizacion de 8 o 4 bits, aunque no hay confirmacion oficial.
- Opciones de despliegue: el checkpoint esta pensado para KerasHub (`keras_hub.models.Mistral3CausalLM`), ejecutable sobre backends JAX, PyTorch y TensorFlow. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ministral 3 8B Instruct (este checkpoint) | 8.4B + 0.4B vision | 256k | Si (Pixtral) | Apache 2.0 | KerasHub / HuggingFace |
| Ministral 3 3B Instruct | 3.4B + 0.4B vision | 256k | Si (Pixtral) | Apache 2.0 | KerasHub / HuggingFace |
| Ministral 3 14B Instruct | 13.5B + 0.4B vision | 256k | Si (Pixtral) | Apache 2.0 | KerasHub / HuggingFace |

La informacion disponible no incluye datos de rendimiento comparado con modelos de otros fabricantes, por lo que la comparativa se limita a las variantes de la propia familia. No se dispone de benchmarks que permitan situar este checkpoint frente a alternativas de tamano similar de otros proveedores.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; como todo LLM entrenado con datos web, es previsible que herede sesgos de esos datos.
- Riesgo de alucinacion: no cuantificado en la model card; debe asumirse el riesgo habitual en modelos de este tamano, especialmente en tareas de hechos verificables.
- Limitaciones de contexto o idioma: aunque se declaran once idiomas, el identificador del checkpoint incluye el sufijo `_en`, lo que sugiere un enfasis en ingles; el rendimiento en el resto de idiomas no esta cuantificado.
- Restricciones de licencia: los pesos se publican bajo Apache 2.0 segun la model card, lo que permite uso comercial; conviene verificar la licencia en el repositorio de HuggingFace, ya que el campo de licencia de la plataforma aparece como "no disponible".
- El consumo de memoria con contexto de 256k tokens puede ser prohibitivo en hardware de consumo; en produccion conviene limitar la ventana efectiva o aplicar tecnicas de cache eficiente.
- No se documentan cuantizaciones oficiales ni integraciones con runners de inferencia populares (vLLM, llama.cpp, Ollama, TGI), lo que puede complicar el despliegue fuera del ecosistema Keras.
- El checkpoint esta empaquetado para KerasHub; su uso en otros frameworks requerira conversion de pesos no documentada en la informacion disponible.

## Enlaces

- HuggingFace: https://huggingface.co/keras/ministral_3_8b_instruct_2512_en
- Mistral AI: https://mistral.ai/
- Keras: https://keras.io/
- Keras 3 (multi-backend): https://keras.io/keras_3/
- Repositorio KerasHub: https://github.com/keras-team/keras-hub
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Notebook de inicio rapido de Ministral 3: enlace no disponible en la informacion proporcionada
