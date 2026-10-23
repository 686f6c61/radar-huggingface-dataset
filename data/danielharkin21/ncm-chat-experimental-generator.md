# danielharkin21/ncm-chat-experimental-generator

## Resumen

`danielharkin21/ncm-chat-experimental-generator` es un checkpoint experimental de un generador de chat de tamano reducido construido sobre Next-Concept Modeling (NCM), una linea de investigacion de Stanford Hazy Research (arXiv 2610.14162). No es un modelo de lenguaje convencional sobre tokens BPE: parte del checkpoint XSum publicado por el equipo original de NCM —que incluye un tokenizador VQ multiescala congelado y un generador condicionado por prefijo— y solo se ha reentrenado el generador. El resultado son unos pesos en fp16 de 177 MB que se cargan con la configuracion, el tokenizador y el codigo del repositorio base.

El autor lo presenta explicitamente como una demo de investigacion y no como un asistente: las respuestas son cortas, a menudo repetitivas o incorrectas. La ventana de prefijo es de 128 tokens y la respuesta se limita a 48 tokens, con conceptos organizados en los niveles [4, 6, 10, 14, 20, 26, 32, 40, 48]. El ajuste se hizo durante 4000 pasos sobre 21.6k ejemplos de datos publicos de dialogo corto e instrucciones (everyday-conversations, Dolly y Alpaca), con una perdida en codigo de validacion que bajo de 6.31 a 1.47.

Su relevancia es acotada pero concreta: sirve como referencia reproducible de NCM aplicado a dialogo, como punto de partida para experimentos de ajuste sobre la arquitectura y como ejemplo de juguete para estudiar el pipeline completo (tokenizador multiescala, generador, exportacion a ONNX). Tiene 0 descargas y 0 likes en el momento de la consulta, no declara benchmarks publicos y no hay informacion sobre el recuento de parametros ni sobre los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Next-Concept Modeling (NCM): tokenizador VQ multiescala congelado mas generador condicionado por prefijo; solo se ajusta el generador |
| Parametros totales | no disponible (el autor no publica el recuento; el fichero de pesos fp16 ocupa 177 MB) |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | ventana de prefijo de 128 tokens; respuesta de hasta 48 tokens |
| Tipos de cuantizacion | no disponible; el checkpoint distribuido esta en fp16. El repositorio incluye scripts de exportacion a ONNX |
| Idiomas soportados | no disponible (los datasets de ajuste citados —everyday-conversations, Dolly, Alpaca— son mayoritariamente en ingles, pero la model card no declara idiomas) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (`generator_chat.pt`, diccionario de estado bajo la clave `model`), fp16; exportacion a ONNX disponible en `code/` |

Otros datos: identificador `danielharkin21/ncm-chat-experimental-generator`, repositorio de 0.2 GB, creado y actualizado el 23 de octubre de 2026, pipeline no declarado, 0 descargas y 0 likes.

## Arquitectura y entrenamiento

NCM sustituye la prediccion de siguiente token por prediccion de siguiente concepto sobre una tokenizacion vectorial-cuantizada multiescala. En este checkpoint, el tokenizador VQ esta congelado y el generador que condiciona sobre un prefijo se ha ajustado de forma aislada; los niveles de concepto empleados son [4, 6, 10, 14, 20, 26, 32, 40, 48], lo que da al generador varias granularidades de representacion sobre la misma secuencia. El punto de partida es el checkpoint XSum liberado en `hazyresearch/ncm-checkpoints`, pensado originalmente para resumen; el ajuste lo redirige a dialogo conversacional corto.

El entrenamiento consistio en 4000 pasos sobre 21.6k ejemplos de datos publicos de dialogo e instrucciones (everyday-conversations, Dolly, Alpaca). No se documenta en la informacion disponible el numero de tokens vistos, la composicion exacta del dataset, ni si hubo RLHF, DPO u otra fase de alineacion. La unica metrica reportada es la perdida en codigo sobre el conjunto de validacion (held-out code loss), que paso de 6.31 a 1.47 durante el ajuste. El autor advierte que la calidad es tosca y que se trata de una demo de investigacion. El repositorio incluye codigo de entrenamiento, de exportacion a ONNX y de comprobacion de paridad, y el script `code/ncmchat.py` muestra como cargar los pesos con la configuracion y el tokenizador del repositorio base.

## Capacidades

- Generacion de texto conversacional de formato muy corto: respuestas de hasta 48 tokens a partir de un prefijo de hasta 128 tokens.
- Dialogo de un solo turno practico: no hay evidencia de gestion multi-turno mas alla de lo que quepa en la ventana de prefijo de 128 tokens.
- Modelado de conceptos multiescala en lugar de tokens subpalabra, lo que permite experimentar con granularidades [4, 6, 10, 14, 20, 26, 32, 40, 48].
- Seguimiento limitado de instrucciones, derivado del ajuste sobre Dolly y Alpaca; el propio autor califica la calidad de tosca.
- Exportacion a ONNX mediante los scripts incluidos, lo que habilita inferencia fuera de PyTorch.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Comportamiento agentico y razonamiento multi-paso: no disponible; no se documenta soporte.
- Multilingue: no disponible; no se declara.
- Vision, audio, modo thinking odecodificacion especulativa: no disponible; no se documenta ninguna de estas capacidades.

## Casos de uso

- Reproduccion de investigación sobre NCM: cargar `generator_chat.pt` con la configuracion y el tokenizador del repositorio base y reproducir el ajuste de dialogo para estudiar como cambia la perdida en codigo (6.31 a 1.47) segun los pasos y los datos.
- Punto de partida para ajuste fino propio: al estar solo el generador entrenado sobre un tokenizador VQ congelado, es un banco de pruebas barato (177 MB en fp16) para probar recetas de ajuste sobre datos de dialogo propios.
- Docencia y divulgacion: ilustrar en un taller la diferencia entre prediccion de siguiente token y prediccion de siguiente concepto, con un modelo que cabe en cualquier portatil.
- Demo interactiva acotada: el Space `danielharkin21/ncm-chat-experimental` sirve como escaparate de la arquitectura, no como producto de atencion al usuario.
- Generacion de respuestas muy cortas en experimentos de prototipado: por ejemplo, etiquetas breves o replicas de una linea en un banco de pruebas de interfaz, asumiendo que habra que filtrar salidas repetitivas.
- Validacion de pipelines de exportacion: usar los scripts de ONNX y de paridad para verificar que una implementacion propia reproduce las salidas del checkpoint en PyTorch.
- Baseline de comparacion en investigacion: medir cuanto aporta el tokenizador multiescala frente a un decodificador clasico del mismo presupuesto de parametros en tareas de dialogo corto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato numerico de evaluacion que reporta el autor es la perdida en codigo sobre datos reservados durante el ajuste (held-out code loss), que paso de 6.31 a 1.47. No hay MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

| Metrica | Antes del ajuste | Despues del ajuste |
|---|---|---|
| Perdida en codigo (held-out code loss) | 6.31 | 1.47 |
| MMLU / HumanEval / GSM8K | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada: el fichero de pesos fp16 ocupa 177 MB; el repositorio completo son 0.2 GB. No hay datos publicados de VRAM pico en inferencia, que dependera de si se ejecuta en CPU o GPU y del backend.
- GPU recomendadas: no hay recomendaciones del autor. Por tamano, cualquier GPU consumer con al menos unos pocos GB libres deberia poder alojar los pesos; no se dispone de mediciones.
- Cabe en GPU consumer: si, por el tamano del checkpoint (177 MB en fp16). No se especifican modelos concretos ni velocidades.
- Opciones de despliegue: la via documentada es el codigo del repositorio base (`code/ncmchat.py`) con la configuracion y el tokenizador de `hazyresearch/ncm-checkpoints`. Se incluye exportacion a ONNX, lo que abre la puerta a ONNX Runtime. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `danielharkin21/ncm-chat-experimental-generator` | no disponible (pesos fp16 de 177 MB) | prefijo de 128 tokens, respuesta de 48 | perdida en codigo 6.31 a 1.47; sin benchmarks publicos | MIT | HuggingFace, 0 descargas, 0 likes |
| Checkpoint base NCM XSum (`hazyresearch/ncm-checkpoints`) | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace |
| Otros modelos pequenos de chat de proposito general | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de terceros que permitan una comparacion cuantitativa fiable. La unica comparacion documentada es con el checkpoint base del que deriva: comparten tokenizador VQ congelado y arquitectura, y difieren en que este checkpoint ha sido ajustado 4000 pasos para dialogo corto e instrucciones.

## Limitaciones y advertencias

- Calidad declarada como tosca por el propio autor: respuestas cortas y, con frecuencia, repetitivas o incorrectas. No es un asistente.
- Longitud muy restringida: prefijo de 128 tokens y respuesta de 48 tokens, insuficiente para la mayoria de tareas reales de produccion.
- Riesgo alto de alucinacion y de deriva en la respuesta; no se documenta ninguna fase de alineacion, filtrado de seguridad ni evaluacion de sesgos.
- Sesgos conocidos: no disponibles; el autor no publica analisis. Los datasets de ajuste (Dolly, Alpaca, everyday-conversations) introducen los sesgos propios de datos publicos en ingles, pero no hay evaluacion al respecto.
- Idiomas: no declarados. Es probable que el comportamiento fuera del ingles sea deficiente, pero no hay evidencia publicada.
- Dependencia del repositorio base: no se carga de forma autonoma; requiere la configuracion, el tokenizador y el codigo de `HazyResearch/ncm`, y los pesos estan en un diccionario de estado bajo la clave `model`.
- Ausencia de benchmarks y de validacion externa: 0 descargas y 0 likes en el momento de la consulta; no hay informes de terceros.
- Licencia MIT: permite uso comercial y modificacion con aviso de copyright, pero se ofrece sin garantia alguna; dado el estado experimental, no es apto para produccion.
- Fecha de creacion y actualizacion muy proximas (23 de octubre de 2026), sin historial de versiones que permita evaluar estabilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/danielharkin21/ncm-chat-experimental-generator
- Demo en Spaces: https://huggingface.co/spaces/danielharkin21/ncm-chat-experimental
- Paper de NCM (arXiv 2610.14162): https://arxiv.org/abs/2610.14162
- Repositorio de codigo de referencia: https://github.com/HazyResearch/ncm
- Checkpoints base: https://huggingface.co/hazyresearch/ncm-checkpoints
