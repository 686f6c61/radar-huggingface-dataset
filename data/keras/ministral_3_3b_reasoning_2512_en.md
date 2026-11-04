# keras/ministral_3_3b_reasoning_2512_en

## Resumen

Ministral 3 3B Reasoning es la variante orientada a razonamiento del modelo pequeno de la familia Ministral 3 publicada por Mistral AI, distribuida en este repositorio como pesos compatibles con KerasHub bajo el identificador `keras/ministral_3_3b_reasoning_2512_en`. La familia Ministral 3 se disena para despliegue en el borde y en entornos de bajos recursos, y se ofrece en tres tamanos (3B, 8B y 14B); esta ficha corresponde al menor de ellos, con un decodificador de texto de 3.4B parametros acoplado a un codificador visual Pixtral de 0.4B, lo que da un total aproximado de 3.8B parametros. El modelo es, por tanto, multimodal: acepta imagenes junto con texto.

La relevancia de esta variante concreta radica en su caracter de *reasoning checkpoint*: segun la model card, esta entrenada para razonar paso a paso en tareas de matematicas, codigo y STEM, y admite system prompts, function calling nativo y salida en JSON, lo que la hace apta para flujos agenticos. Ademas declara una ventana de contexto de 256k tokens y soporte de decenas de idiomas (entre ellos castellano, ingles, frances, aleman, italiano, portugues, neerlandes, chino, japones, coreano y arabe), con embeddings rotatorios escalados mediante YaRN.

El repositorio lo publica la organizacion `keras` como preset de KerasHub, no como checkpoint nativo de PyTorch, de modo que su consumo natural es a traves de `keras_hub.models.Mistral3CausalLM`. El peso del repositorio es de 8.5 GB, coherente con pesos en precision alta (bfloat16 o similar) para un modelo de ~3.8B parametros mas el codificador visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (Mistral3) con encoder visual Pixtral y RoPE escalado con YaRN |
| Parametros totales | ~3.8B (3.4B decodificador de texto + 0.4B encoder visual) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256k tokens |
| Tipos de cuantizacion | no disponible (el repositorio se distribuye en formato KerasHub, presumiblemente bfloat16) |
| Idiomas soportados | Ingles, frances, castellano, aleman, italiano, portugues, neerlandes, chino, japones, coreano, arabe y "decenas" adicionales segun la model card |
| Licencia | Apache 2.0 (pesos y codigo Keras) |
| Formato de pesos | KerasHub preset (no safetensors ni GGUF en este repositorio) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo Mistral3, con un decodificador de texto de 3.4B parametros y un encoder visual Pixtral de 0.4B que procesa imagenes intercaladas con texto mediante marcadores `[IMG]` en el prompt. Los embeddings posicionales usan RoPE con escalado YaRN, lo que permite extender la ventana de contexto hasta 256k tokens. La model card indica que la familia se ofrece en tres variantes (base, instruct y reasoning); este repositorio corresponde a la variante reasoning del tamano 3B.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o RL especificas para el modo de razonamiento. La model card remite a la model card original de Mistral AI para benchmarks, fuentes de datos y casos de uso previstos, pero esos datos no se han incluido en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento paso a paso (modo *thinking*) orientado a matematicas, codigo y STEM.
- Procesamiento multimodal: acepta imagenes junto con texto mediante marcadores `[IMG]` y una lista de imagenes por prompt.
- Function calling nativo y salida en formato JSON para integracion en flujos agenticos.
- Soporte de system prompts para definir rol y comportamiento.
- Capacidades multilingues en decenas de idiomas, incluidos castellano, ingles, frances, aleman, italiano, portugues, neerlandes, chino, japones, coreano y arabe.
- Generacion por lotes (batched prompts) y muestreo configurable (greedy, top-k, temperatura) a traves de `keras_hub.samplers`.
- Fine-tuning sobre un solo lote o sobre datasets completos mediante `fit()` en KerasHub.

## Casos de uso

- **Tutoria y resolucion de problemas STEM en el borde**: el modelo puede desplegarse en dispositivos con recursos limitados para resolver paso a paso problemas de matematicas y fisica, mostrando el razonamiento intermedio gracias a su variante *reasoning* y a un tamano de ~3.8B parametros.
- **Asistente de codigo en IDE o CLI**: con function calling nativo y salida JSON, puede integrarse en herramientas de desarrollo para generar parches, explicar errores o invocar herramientas del entorno (ejecutar tests, consultar documentacion) dentro de un bucle agentico.
- **Analisis de documentos con imagenes**: la ventana de 256k tokens y el encoder Pixtral permiten procesar capturas de pantalla, diagramas o formularios escaneados junto con texto largo, util en extraccion de datos de facturas o revision de interfaces.
- **Atencion al cliente multilingue**: al soportar castellano, ingles, frances, aleman, italiano y portugues entre otros, puede gestionar conversaciones multi-turno con contexto largo (256k tokens) en un unico modelo, reduciendo la necesidad de enrutar por idioma.
- **Generacion aumentada por recuperacion (RAG) sobre corpus extensos**: la ventana de 256k tokens permite insertar muchos fragmentos recuperados en un solo prompt sin truncar, lo que simplifica pipelines de RAG en dominios documentales densos.
- **Automatizacion de tareas agenticas con salida estructurada**: el soporte de JSON y function calling permite construir agentes que rellenen formularios, consulten APIs o ejecuten acciones multi-paso con validacion estricta de la salida.
- **Prototipado e investigacion en KerasHub**: al estar empaquetado como preset de KerasHub, es adecuado para experimentar con fine-tuning, cambiar el sampler o integrar el backbone en pipelines de Keras 3 sobre JAX, PyTorch o TensorFlow.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la model card original de Mistral AI para los datos de rendimiento, pero esos resultados no se han incluido en la informacion proporcionada, por lo que no se presentan cifras.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma oficial. Como referencia orientativa, un modelo de ~3.8B parametros en bfloat16 requiere del orden de 8 GB solo para pesos, mas memoria para el KV cache; con contexto de 256k tokens el KV cache puede crecer de forma significativa y exigir GPUs con 24 GB o mas para ventanas muy largas.
- **GPU recomendadas**: no especificadas por el autor. Para contexto corto y bfloat16, una RTX 4090 (24 GB) o A100/H100 son opciones razonables; para contexto completo de 256k se recomienda hardware con mayor memoria (A100 80 GB, H100).
- **Compatibilidad con GPU de consumo**: no confirmada oficialmente. El tamano de parametros sugiere que cabe en GPUs de consumo de 16-24 GB para contexto moderado, pero no hay datos publicados de latencia ni de soporte de cuantizacion en este repositorio.
- **Opciones de despliegue**: el repositorio esta empaquetado para KerasHub (`keras_hub.models.Mistral3CausalLM.from_preset`), ejecutable sobre backends JAX, PyTorch y TensorFlow. No se indica soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible; el formato de pesos del repositorio no es GGUF.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ministral 3 3B Reasoning (esta ficha) | ~3.8B (3.4B texto + 0.4B vision) | 256k | Texto + imagen | Apache 2.0 | KerasHub |
| Ministral 3 8B Reasoning | ~8.8B (8.4B texto + 0.4B vision) | 256k | Texto + imagen | Apache 2.0 | KerasHub / Mistral AI |
| Ministral 3 14B Reasoning | ~13.9B (13.5B texto + 0.4B vision) | 256k | Texto + imagen | Apache 2.0 | KerasHub / Mistral AI |
| Ministral 3 3B Instruct | ~3.8B | 256k | Texto + imagen | Apache 2.0 | KerasHub / Mistral AI |

La comparativa se limita a la propia familia Ministral 3 porque la informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos de otros fabricantes que permitan una comparacion rigurosa. No se dispone de cifras de benchmarks para contrastar rendimiento entre estas variantes.

## Limitaciones y advertencias

- **Sesgos**: no se documentan en la informacion disponible; como todo modelo entrenado con datos web, es probable que herede sesgos sociales y culturales, pero no hay analisis publicado en esta ficha.
- **Alucinacion**: no se han publicado evaluaciones de tasa de alucinacion para esta variante; el modo de razonamiento paso a paso no garantiza correccion factual.
- **Contexto e idioma**: aunque se declaran 256k tokens y decenas de idiomas, no se especifica el rendimiento por idioma ni la degradacion esperada en ventanas muy largas; el sufijo `_en` del identificador sugiere un enfasis en ingles que conviene validar para castellano.
- **Licencia**: los pesos se declaran bajo Apache 2.0, lo que permite uso comercial, pero la model card remite a la licencia original de Mistral AI; conviene verificar los terminos exactos en el repositorio oficial antes de un despliegue comercial.
- **Formato de pesos**: el repositorio esta empaquetado para KerasHub y no ofrece GGUF ni safetensors nativos, lo que limita su uso directo con herramientas como llama.cpp u Ollama.
- **Cuantizacion**: no se documentan recetas de cuantizacion ni soporte oficial para precisiones reducidas, lo que puede complicar el despliegue en hardware de baja memoria.
- **Datos de entrenamiento**: no se detalla la composicion del dataset ni el proceso de alineacion (RLHF/DPO), lo que dificulta evaluar riesgos de contaminacion o de comportamiento en dominios especificos.
- **Produccion**: al no haber benchmarks publicados en la informacion disponible, no es posible estimar su calidad relativa frente a alternativas; se recomienda una evaluacion propia antes de adoptarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/keras/ministral_3_3b_reasoning_2512_en
- Mistral AI: https://mistral.ai/
- Keras: https://keras.io/
- Keras 3 (multi-backend): https://keras.io/keras_3/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia del codigo KerasHub: https://github.com/keras-team/keras-hub/blob/master/LICENSE
- Wikipedia (Keras): https://en.wikipedia.org/wiki/Keras
