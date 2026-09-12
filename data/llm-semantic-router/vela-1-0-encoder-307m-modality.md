# llm-semantic-router/Vela-1.0-Encoder-307M-Modality

## Resumen

Vela 1.0 Modality es un clasificador de texto encoder-only desarrollado por llm-semantic-router, construido sobre el encoder base Vela-1.0-Encoder-307M (arquitectura ModernBERT) y publicado con 307.532.547 parametros. Su funcion es leer una peticion escrita por el usuario y predecir que tipo de salida requiere: texto (etiqueta AR), generacion de imagen (etiqueta DIFFUSION) o ambas (etiqueta BOTH). No es un encoder multimodal ni genera contenido: solo enruta la intencion hacia el backend de generacion adecuado.

El modelo forma parte de la familia Vela, un conjunto de clasificadores especializados pensados para actuar como router semantico dentro de pipelines de IA generativa. Vela Modality cubre la dimension de modalidad de salida; otros modelos de la misma familia cubren dominio, deteccion de PII, seguridad, fact-checking o recuperacion de contexto. La relevancia inmediata esta en la orquestacion: separar peticiones de texto de peticiones de imagen evita invocar backends costosos innecesariamente y permite construir agentes que deciden su ruta con una senal barata (un encoder de 307M) antes de llamar a un modelo generativo grande.

Tecnicamente destaca por combinar una ventana de 32K tokens, soporte multilingue declarado en seis idiomas (ingles, chino, espanol, frances, aleman y japones) y una licencia MIT que permite uso comercial sin restricciones. La model card reporta una exactitud del 93,0 % frente al 34,6 % del modelo anterior sobre un conjunto de 1.080 peticiones de formato de salida redactadas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer, encoder-only) |
| Parametros totales | 307.532.547 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32K tokens |
| Tipos de cuantizacion | no disponible (la model card no detalla esquemas de cuantizacion; el repositorio publica pesos safetensors y ONNX y declara una relacion con la variante cuantizada del modelo base) |
| Idiomas soportados | en, zh, es, fr, de, ja |
| Licencia | MIT |
| Formato de pesos | safetensors y ONNX |
| Pipeline | text-classification |
| Etiquetas de salida | AR (texto), DIFFUSION (imagen), BOTH (ambas) |
| Tamano del repositorio | 2,5 GB |
| Modelo base | llm-semantic-router/Vela-1.0-Encoder-307M |
| Libreria | transformers |

## Arquitectura y entrenamiento

La model card identifica el modelo como ModernBERT, una familia de encoders transformer con soporte nativo de contexto largo. El modelo es encoder-only y esta especializado en clasificacion de secuencias: recibe texto y devuelve una etiqueta entre AR, DIFFUSION y BOTH. No dispone de cabeza generativa, no decodifica tokens y no inspecciona imagenes; su unica funcion es asignar una clase a la peticion. La ventana declarada es de 32K tokens, lo que permite clasificar conversaciones completas o prompts largos con historial incluido sin truncar.

No se ha publicado informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO ni el procedimiento de ajuste (fine-tuning sobre el encoder base). La unica referencia cuantitativa de evaluacion es la comparativa de exactitud frente al modelo previo: 34,6 % frente a 93,0 % sobre 1.080 peticiones de formato de salida redactadas por el autor. La propia model card advierte que esa medicion se realizo sobre patrones de peticion autorales y que la generalizacion multilingue aun varia.

## Capacidades

- Clasificacion de intencion de modalidad: distingue peticiones que requieren respuesta de texto, generacion de imagen o ambas combinadas.
- Enrutado semantico: mapea la prediccion a un backend de generacion concreto (modelo de lenguaje o modelo de difusion).
- Contexto largo: acepta entradas de hasta 32K tokens, suficiente para prompts extensos, hilos de conversacion o documentos incrustados en la peticion.
- Multilingue: soporte declarado para ingles, chino, espanol, frances, aleman y japones.
- Integracion con el ecosistema transformers mediante `pipeline("text-classification")`.
- Exportacion a ONNX para inferencia optimizada fuera del ecosistema Python.
- Compatibilidad declarada con text-embeddings-inference y con endpoints compatibles.
- No soporta tool calling ni function calling: es un clasificador, no un modelo generativo.
- No soporta razonamiento multi-paso por si mismo, aunque puede actuar como primer paso de decision dentro de un agente.
- No procesa imagenes ni audio: la model card indica explicitamente que no es un encoder multimodal.

## Casos de uso

- Enrutado de peticiones en una plataforma de IA generativa: el modelo clasifica cada prompt entrante y decide si se envia a un LLM de texto, a un modelo de difusion o a un pipeline mixto, evitando cargar un backend de imagen cuando no se necesita.
- Orquestacion de agentes multimodales: como primer paso de un agente, permite separar la fase de planificacion textual de la fase de generacion visual y encadenar las llamadas en el orden correcto.
- Reduccion de coste en produccion: al ser un encoder de 307M, ejecutar esta clasificacion antes de invocar un modelo generativo grande filtra peticiones mal enrutadas y evita gasto de tokens y de GPU en la ruta equivocada.
- Asistentes de diseno y marketing: clasifica si una peticion como "disena un logotipo minimalista" requiere solo imagen, solo texto o ambas (por ejemplo, imagen mas copy asociado) y activa el flujo correspondiente.
- Moderacion previa de flujos de generacion: combinado con el resto de la familia Vela, permite construir una cadena de decisiones (dominio, modalidad, PII, seguridad) antes de tocar el modelo generativo.
- Analitica de intencion sobre historico de peticiones: procesar en lote conversaciones de hasta 32K tokens para etiquetar la modalidad solicitada y medir la demanda real de generacion de imagen frente a texto.
- Clasificacion en entornos multilingues: atender peticiones en espanol, frances, aleman, japones o chino con el mismo modelo, sin desplegar clasificadores separados por idioma.
- Despliegue en el borde o en CPU: por tamano y por ser encoder-only, puede ejecutarse en instalaciones con recursos limitados y actuar como filtro previo antes de llamar a servicios en la nube.

## Benchmarks y rendimiento

| Evaluacion | Modelo anterior | Vela 1.0 Modality |
|---|---:|---:|
| Exactitud en 1.080 peticiones de formato de salida redactadas por el autor | 34,6 % | 93,0 % |

La model card indica que la medicion se realizo sobre patrones de peticion autorales y que la generalizacion multilingue varia. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16 aproximadamente 0,6 GB solo de pesos (unos 0,8-1 GB contando activaciones y overhead); en fp32 aproximadamente 1,2 GB de pesos; en int8 aproximadamente 0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; modelos como RTX 3060, RTX 4090, A10, L4, A100 o H100 pueden ejecutarlo con margen amplio y en lote.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo moderna con 4 GB o mas de VRAM, e incluso en CPU para cargas moderadas.
- Opciones de despliegue: transformers con `pipeline("text-classification")`, ONNX Runtime para la variante ONNX, text-embeddings-inference (declarado en las etiquetas) y despliegue como componente del router en el proyecto vLLM Semantic Router.
- Latencia y throughput: no disponible. Al ser un encoder sin decodificacion autorregresiva, la latencia por peticion es estructuralmente muy inferior a la de un modelo generativo del mismo numero de parametros, y el procesamiento por lotes escala bien, pero no se han publicado mediciones concretas.

## Comparativa con modelos similares

La model card referencia la coleccion completa de la familia, cuyos modelos comparten el mismo encoder base de 307M y una ventana declarada equivalente. No se dispone de datos publicados de benchmarks de los modelos hermanos ni de alternativas externas de la misma categoria (clasificadores de enrutado de modalidad) en la informacion proporcionada.

| Modelo | Rol | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| Vela 1.0 Modality | Detectar modalidad de salida (texto, imagen o ambas) | 307.532.547 | 32K | MIT | Disponible |
| Vela 1.0 Domain | Clasificar el dominio de la peticion | no disponible (mismo encoder base, 307M) | no disponible | MIT | Disponible |
| Vela 1.0 PII | Detectar datos personales identificables | no disponible (mismo encoder base, 307M) | no disponible | MIT | Disponible |
| Vela 1.0 FactCheck | Decidir cuando verificar informacion | no disponible (mismo encoder base, 307M) | no disponible | MIT | Disponible |
| Vela 1.0 Encoder 307M | Encoder base para construir nuevas capacidades | 307M | no disponible | MIT | Disponible |
| PromptGuard, Safety, Hazard, Feedback, Embedding, Reranker | Riesgo, feedback y recuperacion de contexto | no disponible | no disponible | no disponible | Anunciados como proximos |

## Limitaciones y advertencias

- No es un modelo multimodal: no inspecciona imagenes ni genera contenido. Solo clasifica la intencion expresada en texto.
- La prediccion tiene tres clases (AR, DIFFUSION, BOTH). Un error de clasificacion enruta la peticion al backend equivocado, con el coste y la mala experiencia de usuario que eso implica.
- La model card admite explicitamente que la generalizacion multilingue varia; los 93,0 % de exactitud corresponden a peticiones autorales y no a un conjunto multilingue independiente.
- No se detalla la composicion del dataset de entrenamiento, por lo que no es posible evaluar sesgos sistematicos por idioma, dominio o estilo de redaccion. Se recomienda validar con datos propios antes de produccion.
- Riesgo de alucinacion no aplica en el sentido generativo (no produce texto libre), pero si existe riesgo de sobreconfianza en la etiqueta predicha; conviene calibrar umbrales y definir un comportamiento por defecto ante baja confianza.
- La ventana de 32K tokens no implica que el modelo mantenga precision en todo el rango; no se han publicado evaluaciones de degradacion por longitud.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con escasa restriccion, pero no exime de cumplir la normativa aplicable de proteccion de datos ni de las condiciones de los servicios que consuman su salida.
- El repositorio no registra descargas ni interacciones en el momento de la ficha, por lo que no existe validacion de la comunidad sobre su comportamiento en produccion.
- Depende de un backend externo para completar la tarea: sin modelos de texto y de difusion detras, el enrutado no aporta valor por si solo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-Modality
- Modelo base: https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M
- Documentacion y evaluacion (TECHNICAL.md): https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-Modality/blob/main/TECHNICAL.md
- Coleccion de la familia Vela 1.0 Router Models: https://huggingface.co/collections/llm-semantic-router/vela-10-router-models-6aa555ba70cc6997d6d67798
- Modelo hermano Vela 1.0 Domain: https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-Domain
- Modelo hermano Vela 1.0 PII: https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-PII
- Modelo hermano Vela 1.0 FactCheck: https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-FactCheck
- Repositorio vLLM Semantic Router: https://github.com/vllm-project/semantic-router
- Las busquedas web realizadas no devolvieron fuentes especificas sobre este modelo; los resultados obtenidos eran articulos genericos sobre modelos de lenguaje y no se han utilizado como fuente.
