# peterpon77/qwen3-0.6b-incidencias-lora

## Resumen

El modelo `peterpon77/qwen3-0.6b-incidencias-lora` es un adaptador LoRA (Low-Rank Adaptation) construido sobre el modelo base `Qwen/Qwen3-0.6B` de Alibaba. Su proposito es clasificar incidencias ficticias de soporte al cliente y devolver un objeto JSON con tres campos: categoria (facturacion, acceso_cuenta, envio, tecnico o devolucion), prioridad (alta, media o baja) y una respuesta breve predefinida. Se trata de un ejercicio academico de la sesion 7 de un curso, no de un modelo pensado para produccion, tal y como advierte el propio autor en la model card.

El adaptador se ha entrenado con PEFT y TRL sobre un conjunto de datos 100 % sintetico generado por plantillas (200 ejemplos de entrenamiento, 30 de validacion y 30 de test, con separacion estricta por plantilla de frase para medir generalizacion a formulaciones no vistas). La innovacion metodologica no esta en la arquitectura, sino en el diseno del split: seis plantillas por clase, de las cuales cuatro van a entrenamiento, una a validacion y una a test, sin solapamiento de nucleos ni textos entre grupos.

Su relevancia es limitada fuera del ambito docente: sirve como referencia reproducible de como un adaptador LoRA pequeno puede mejorar drasticamente el cumplimiento de formato JSON y el acierto de clasificacion frente al modelo base, pasando de un 3,3 % de JSON valido en modo basico a un 96,7 % con el adaptador. Es util para quienes quieran replicar el flujo de entrenamiento o estudiar el comportamiento de modelos de 0,6B en tareas de clasificacion estructurada en espanol.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA sobre q_proj y v_proj |
| Parametros totales | no disponible (adaptador LoRA de rango 16; el modelo base Qwen3-0.6B tiene 0,6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usa longitud maxima de 512 tokens; el contexto nativo depende del modelo base Qwen3-0.6B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el dtype usado en el ejemplo de la model card es float32) |
| Idiomas soportados | espanol (unico idioma declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen3-0.6B`, un transformer decoder-only de la familia Qwen3. La configuracion LoRA utiliza rango 16, alpha 32 y dropout 0,05, con capas objetivo `q_proj` y `v_proj`. El entrenamiento se realizo con `SFTTrainer` de TRL, calculando la perdida unicamente sobre la respuesta, durante 2 epocas con learning rate 2e-4, scheduler cosine y warmup de 5 pasos, batch de 8 y longitud maxima de 512 tokens, semilla 42. No hubo busqueda de hiperparametros: se uso la configuracion fija de la sesion 7 del curso.

Los datos son 100 % sinteticos, generados mediante plantillas con `generar_datos.py` (semilla 42), sin datos personales. El split se hace por plantilla de frase: 6 plantillas por clase, asignando 4 a entrenamiento, 1 a validacion y 1 a test, de modo que ninguna plantilla, nucleo ni texto se repite entre grupos. Esto convierte el test en una prueba de generalizacion a formas de expresar la incidencia no vistas durante el entrenamiento. El chat template es el original de Qwen3 con `enable_thinking=False` tanto en entrenamiento como en inferencia. Las versiones de software registradas son Python 3.13.16, torch 2.14.1+cu130, transformers 5.22.1, datasets 4.8.5, trl 1.17.1 y peft 0.21.2, con dtype float32 y dispositivo CUDA.

## Capacidades

- Clasificacion de incidencias de soporte en cinco categorias: facturacion, acceso_cuenta, envio, tecnico y devolucion.
- Asignacion de prioridad en tres niveles: alta, media y baja.
- Generacion de una respuesta breve predefinida por clase dentro del mismo objeto JSON.
- Salida estructurada en JSON con las claves `categoria`, `prioridad` y `respuesta`.
- Inferencia determinista en modo greedy (`do_sample=False`) con `max_new_tokens=128`, tal y como se evaluo.
- Capacidad de funcionar con few-shot prompting (la model card reporta resultados con un ejemplo por categoria), aunque el adaptador supera al few-shot en acierto de categoria y prioridad.
- No soporta tool calling, function calling, agentes, vision, audio ni modos de razonamiento extendido (thinking desactivado explicitamente).
- Capacidades multilingues limitadas al espanol declarado; el autor advierte que puede fallar en otros idiomas.

## Casos de uso

- Clasificacion de tickets de soporte en un prototipo: el adaptador recibe el texto de una incidencia y devuelve la categoria y prioridad en JSON, lo que permite enrutar tickets a colas distintas en un sistema de helpdesk. Adecuado como prueba de concepto con datos sinteticos antes de invertir en anotacion real.
- Etiquetado automatico de correos de atencion al cliente: se puede usar para preetiquetar grandes volumenes de mensajes ficticios o anonimizados y revisar manualmente solo los casos de baja confianza, reduciendo el coste de anotacion inicial.
- Generacion de respuestas de primer nivel: el campo `respuesta` ofrece una plantilla de contestacion por categoria que un agente humano puede revisar y adaptar, util para estandarizar el tono en equipos de soporte.
- Docencia y formacion en NLP: sirve como ejemplo reproducible de fine-tuning con LoRA y TRL sobre un modelo de 0,6B, incluyendo el diseno de splits por plantilla para evitar fuga de datos.
- Evaluacion comparativa de estrategias de prompting: al incluir resultados de base_basico, base_fewshot y lora sobre el mismo test, permite estudiar cuando un adaptador supera al few-shot en tareas de clasificacion estructurada.
- Banco de pruebas para pipelines de validacion JSON: util para probar sistemas de parsing, reparacion de JSON y reintentos, ya que el adaptador produce salidas JSON validas en el 96,7 % de los casos de test.
- Prototipado rapido de asistentes de triaje en entornos de bajo recursos: al ser un adaptador sobre un modelo de 0,6B, se puede ejecutar en hardware modesto para demos internas sin datos reales de clientes.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 30 casos de test, con generacion greedy (`do_sample=False`), `max_new_tokens=128` y JSON solicitado solo por prompt, sin JSON mode, reparacion ni reintentos. Una salida no interpretable cuenta como error.

| Condicion | JSON valido % | Acierto categoria % | Acierto prioridad % |
|---|---|---|---|
| base_basico | 3,3 | 0,0 | 0,0 |
| base_fewshot | 100,0 | 40,0 | 46,7 |
| lora | 96,7 | 76,7 | 70,0 |

Few-shot: un ejemplo por categoria, extraidos de entrenamiento, con prompt fijado y validado antes de ver el test.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Al tratarse de un adaptador LoRA sobre un modelo de 0,6B, la huella es reducida; en float32 el modelo base ronda los 2,4 GB de pesos, y el adaptador anade una cantidad marginal. En cuantizacion de 8 o 4 bits cabria en GPUs consumer de gama baja, aunque el autor no publica cifras.
- GPU recomendadas: no disponible. El autor entreno en CUDA sin especificar el modelo de GPU; por el tamano, una GPU consumer moderna (RTX 3060 o superior) seria suficiente para inferencia, pero no hay dato confirmado.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del modelo base (0,6B), aunque no se aporta medicion concreta.
- Opciones de despliegue: la model card solo documenta el uso con `transformers` + `peft` (`AutoModelForCausalLM`, `AutoTokenizer`, `PeftModel.from_pretrained`). No se mencionan vLLM, llama.cpp, Ollama ni TGI; al ser un adaptador LoRA, requeriria fusion con el modelo base o soporte de adaptadores en el servidor de inferencia.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| peterpon77/qwen3-0.6b-incidencias-lora | 0,6B (base) + adaptador LoRA | no disponible | Clasificacion de incidencias de soporte en espanol | apache-2.0 | Hugging Face |
| subhashbs36/qwen3-0.6-ai-detector-merged | 0,6B (base) + LoRA fusionado | no disponible | Deteccion de texto generado por IA (clases humano/IA) | no disponible en la busqueda | Hugging Face |
| Qwen/Qwen3-0.6B | 0,6B | no disponible en la busqueda | Generacion de texto general | apache-2.0 | Hugging Face |

La comparativa se limita a alternativas del mismo modelo base encontradas en la busqueda web. No se dispone de datos de benchmarks comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Datos 100 % sinteticos generados con 90 plantillas: el vocabulario es limitado y los resultados no se trasladan a incidencias reales.
- La frontera entre prioridades (alta, media, baja) es una convencion del dataset, no un criterio de negocio real.
- Las respuestas son frases fijas por clase; el modelo no investiga ni resuelve la incidencia.
- El test tiene solo 30 casos: cada caso vale 3,3 puntos porcentuales y la varianza es alta.
- Modelo de 0,6B: puede fallar con incidencias ambiguas, largas o en otros idiomas distintos del espanol.
- No usar para decisiones reales sobre clientes sin evaluacion con datos reales y revision humana.
- Riesgo de alucinacion: aunque la tarea es de clasificacion, el modelo genera texto libre y puede producir categorias o prioridades fuera del conjunto permitido o JSON malformado (3,3 % de fallo de formato en el test).
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el autor desaconseja explicitamente el uso en produccion por la naturaleza academica del ejercicio.
- Caveat de produccion: el adaptador requiere el chat template original de Qwen3 con `enable_thinking=False`; usarlo con otra configuracion puede degradar los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/peterpon77/qwen3-0.6b-incidencias-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo comparable encontrado en la busqueda (detector de IA sobre Qwen3-0.6B): https://huggingface.co/subhashbs36/qwen3-0.6-ai-detector-merged
- Tutorial de fine-tuning de Qwen3-0.6B con LoRA en una sola GPU: https://lumienai.com/news/fine-tune-qwen3-lora-nvidia-nemo-automodel-single-gpu-colab
