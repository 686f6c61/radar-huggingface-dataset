# Pushkarrrr15151/PolyVL-router-laya

## Resumen

PolyVL-router-laya es un clasificador de enrutamiento binario construido sobre el encoder ModernBERT-large de Answer.AI. Lo desarrolla el usuario Pushkarrrr15151 como componente del sistema Polyvalent, una arquitectura multi-especialista en la que un unico modelo base de vision-lenguaje convive con especialistas forenses (en este caso, deteccion de deepfakes). La funcion del modelo es decidir, a partir de un estado de dialogo estructurado de cinco campos, si la interaccion debe atenderla el modelo base (`BASE`) o el especialista en deepfakes (`DEEPFAKE`).

El modelo no genera texto ni razona de forma abierta: es un clasificador de secuencias que recibe un estado de runtime serializado (`message`, `history`, `assets`, `active_image_id`, `last_analysis`) y emite una etiqueta de ruta. Su interes practico esta en que sustituye heuristicas o prompts de enrutamiento por un cabezal supervisado con una tasa de falsos positivos hacia el especialista muy baja (1,59 %), lo que evita activar el modulo forense de forma innecesaria.

Tecnicamente es un encoder transformer denso de 22 capas (ModernBERT-large) de 421 millones de parametros, con un cabezal de clasificacion LAYA de 2 capas anadido, afinado sobre 2.000 turnos de dialogo balanceados. La licencia es Apache-2.0 y el repo ocupa 0,8 GB en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-large, 22 capas) + cabezal de clasificacion LAYA de 2 capas |
| Parametros totales | 421.293.830 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el ejemplo de carga trunca a 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), tokenizer y config de encoder en subcarpetas |

## Arquitectura y entrenamiento

El backbone es ModernBERT-large, un encoder transformer con atencion alterna global/local, RoPE y Flash Attention, del que se conservan las 22 capas. Sobre la representacion del token de clasificacion se anade un cabezal LAYA de dos capas que produce la decision binaria de ruta. El modelo consume un estado de dialogo serializado mediante `serialize_state`, que concatena el mensaje del usuario, el historial, los assets multimodales (con su estado de soporte y disponibilidad), el identificador de imagen activa y el ultimo analisis realizado.

El ajuste fino se realizo sobre el dataset `Pushkarrrr15151/PolyVL-router-requests`, con 2.000 turnos de dialogo revisados y balanceados que incluyen metadatos contextuales multimodales. El procedimiento fue de 4 epocas con optimizador AdamW, precision mixta bf16 y semilla 42. No se documenta el numero de tokens de entrenamiento ni si hubo etapas de RLHF o DPO; al tratarse de un clasificador supervisado, lo habitual es que no las haya. No se describen innovaciones tecnicas adicionales mas alla del esquema de enrutamiento por estado estructurado.

## Capacidades

- Clasificacion binaria de ruta (`BASE` frente a `DEEPFAKE`) a partir de un estado de dialogo de cinco campos.
- Interpretacion de metadatos multimodales: presencia, tipo, soporte y disponibilidad de assets, e identificacion de la imagen activa.
- Uso del historial de conversacion y del ultimo analisis como senal de decision.
- Inferencia de baja latencia: aproximadamente 12-18 ms en CPU y menos de 5 ms en GPU.
- No genera texto, no hace tool calling, no soporta agentes multi-paso ni dispone de modo de razonamiento explicito.
- Capacidades multilingues: no documentadas.

## Casos de uso

- Enrutamiento en pipelines de analisis forense de imagen: el modelo decide si una consulta del usuario sobre una imagen adjunta debe ir al especialista en deepfakes o al modelo base generalista, evitando coste computacional innecesario.
- Control de coste en sistemas multi-modelo: al reducir la tasa de falsos positivos hacia el especialista a 1,59 %, se evita invocar el modulo forense (mas caro) en conversaciones que no lo requieren.
- Moderacion de contenido visual en plataformas: integrado como paso previo, deriva a verificacion forense solo las interacciones que mencionan autenticidad, manipulacion o identidad en imagenes activas.
- Orquestacion de agentes conversacionales con estado: el clasificador consume el historial y el ultimo analisis, por lo que encaja en dialogos multi-turno donde la ruta puede cambiar segun el contexto acumulado.
- Pre-filtrado en herramientas de verificacion periodistica: cuando un redactor sube una imagen y pregunta por su autenticidad, el router activa el especialista sin necesidad de reglas manuales.
- Investigacion en arquitecturas multi-especialista: sirve como componente reproducible (seed 42, dataset publico) para estudiar esquemas de residencia dinamica de adaptadores y enrutamiento supervisado.
- Despliegue en entornos con CPU: su latencia de 12-18 ms en CPU permite usarlo como router en servicios sin GPU dedicada.

## Benchmarks y rendimiento

Evaluacion sobre splits dev (n=200) y test (n=300) con separacion por grupo, segun la model card:

| Metrica | Modelo afinado | Baseline zero-shot |
|---|---|---|
| Accuracy | 98,0 % | 59,0 % |
| Macro F1 | 0,9785 | 0,5806 |
| Deepfake precision | 97,3 % | no disponible |
| Deepfake recall | 97,3 % | no disponible |
| Deepfake F1 | 97,3 % | no disponible |
| Base false activation rate | 1,59 % | 65,08 % |
| Latencia CPU | ~12-18 ms | no disponible |
| Latencia GPU | <5 ms | no disponible |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible; no aplican a un clasificador de este tipo.

## Requisitos de hardware

- VRAM estimada: en precision completa (bf16), aproximadamente 0,85 GB para los 421 M de parametros; en fp32, unos 1,7 GB. Con cuantizacion int8 cabria en torno a 0,45 GB, aunque no se documentan pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo es sobradamente pequeno para RTX 3060, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: la model card solo documenta carga manual con `safetensors.torch.load_file`, `AutoTokenizer` y `AutoConfig` junto con el modulo `input_serializer` de LAYA. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI; al ser un clasificador de encoder, la via natural es `transformers` con `AutoModelForSequenceClassification` o un servidor de inferencia tipo TorchServe/Triton.
- Latencia y throughput: 12-18 ms por peticion en CPU y menos de 5 ms en GPU, segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PolyVL-router-laya | 421 M | no disponible (ejemplo a 512 tokens) | Enrutamiento binario de dialogo | Apache-2.0 | Hugging Face, 0 descargas |
| answerdotai/ModernBERT-large (base) | ~395 M | 8.192 tokens (segun ModernBERT) | Encoder generalista | Apache-2.0 | Hugging Face, ampliamente usado |
| Clasificadores DeBERTa-v3-large | ~435 M | 512 tokens | Clasificacion de texto generica | MIT | Hugging Face, muy extendido |

La comparacion es limitada: no existen alternativas publicas equivalentes de enrutamiento especifico para arquitecturas multi-especialista con estado de dialogo multimodal. El modelo base ModernBERT-large ofrece mayor contexto documentado y comunidad, pero no resuelve la tarea de enrutamiento sin ajuste adicional.

## Limitaciones y advertencias

- Modelo altamente especializado: fuera del esquema de cinco campos de estado de runtime no es utilizable; no funciona como clasificador de texto libre.
- El dataset de entrenamiento es pequeno (2.000 turnos) y de un unico autor, lo que limita la generalizacion a dominios o idiomas no representados.
- No se documentan los idiomas de entrenamiento; el rendimiento fuera del ingles (si el dataset era en ingles) es desconocido.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de clasificacion erronea: un falso negativo hacia `DEEPFAKE` deja consultas forenses sin atender por el especialista.
- Las metricas (98 % accuracy) proceden de splits del propio autor; no hay validacion externa independiente.
- Cero descargas y cero likes en el momento de la consulta: sin adopcion ni validacion por la comunidad.
- La carga requiere el modulo `input_serializer` del SDK LAYA, lo que anade una dependencia no estandar y dificulta la portabilidad.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- No se documenta la longitud de contexto real del encoder ajustado ni el comportamiento con historiales largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pushkarrrr15151/PolyVL-router-laya
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-large
- Dataset de entrenamiento: https://huggingface.co/datasets/Pushkarrrr15151/PolyVL-router-requests
- Paper de ModernBERT (referencia del backbone): https://arxiv.org/abs/2412.13663
