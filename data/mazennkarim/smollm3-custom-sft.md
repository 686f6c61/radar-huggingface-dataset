# mazennkarim/SmolLM3-Custom-SFT

## Resumen

SmolLM3-Custom-SFT es un adaptador LoRA de ajuste supervisado (SFT) publicado por el usuario mazennkarim sobre el modelo base HuggingFaceTB/SmolLM3-3B. No se trata de un modelo completo, sino de un conjunto de pesos delta en formato PEFT que debe combinarse con el modelo base para su uso. El repositorio tiene un tamano de 0,1 GB, coherente con un adaptador LoRA de rango bajo sobre un modelo de 3.000 millones de parametros. El pipeline declarado es text-generation y la libreria de referencia es peft.

El modelo base, SmolLM3-3B, es un transformer denso de 3.000 millones de parametros desarrollado por Hugging Face, disenado para despliegue en entornos con recursos limitados. El adaptador hereda por tanto las capacidades del modelo base, pero incorpora un ajuste adicional mediante SFT con TRL cuyo dataset, hiperparametros y objetivo concreto no se detallan en la model card.

La relevancia de esta ficha es limitada: se trata de un experimento de ajuste personal con cero descargas y un solo like en el momento de la consulta, sin licencia declarada, sin idiomas especificados y sin resultados de evaluacion. Resulta util como ejemplo de flujo de trabajo PEFT+TRL sobre SmolLM3, pero no como artefacto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso SmolLM3-3B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 3.000 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con SFT mediante TRL 1.17.1 y PEFT 0.21.2, sobre Transformers 5.22.0, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3. La arquitectura subyacente corresponde integramente al modelo base SmolLM3-3B: un transformer denso de 3.000 millones de parametros. El adaptador anade matrices de bajo rango en las capas seleccionadas, de modo que el coste de almacenamiento es minimo (0,1 GB en el repositorio) y la inferencia requiere cargar el modelo base completo.

No se especifican en la model card el numero de tokens de entrenamiento, la composicion del dataset, el rango de LoRA, el alpha, la tasa de aprendizaje ni si hubo etapas posteriores de RLHF o DPO. Tampoco se documenta ninguna innovacion tecnica adicional mas alla del propio flujo SFT con TRL. La ausencia de estos datos impide reproducir el entrenamiento o evaluar su calidad de forma rigurosa.

## Capacidades

- Generacion de texto conversacional en formato chat, segun el ejemplo de quick start con mensajes con rol `user`.
- Razonamiento y respuesta a preguntas abiertas, heredado del modelo base SmolLM3-3B.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada para este adaptador; depende de si el SFT lo preserva respecto al base.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el adaptador no declara idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible para este adaptador.

## Casos de uso

- Experimentacion con PEFT y TRL: el adaptador sirve como plantilla para reproducir un pipeline de SFT sobre SmolLM3-3B, cargando el base y aplicando el delta con `PeftModel.from_pretrained`. Apropiado para laboratorios que quieran validar su cadena de entrenamiento antes de escalar.
- Prototipado de asistentes conversacionales ligeros: al apoyarse en un modelo de 3.000 millones de parametros, puede ejecutarse en una unica GPU consumer para demos de chat con el pipeline de Transformers mostrado en la model card.
- Ajuste de estilo o dominio sobre el base: si el SFT se realizo con datos de un dominio concreto (no documentado), el adaptador puede emplearse para especializar respuestas de SmolLM3-3B en ese dominio, siempre que se valide empiricamente.
- Investigacion sobre olvido catastrofico en LoRA: comparar las respuestas del base frente al adaptador permite estudiar cuanto conocimiento general se degrada tras un SFT acotado.
- Base para posteriores etapas de alineamiento: el adaptador puede servir como punto de partida para DPO o RLHF con TRL, ya que mantiene el formato PEFT compatible con esas etapas.
- Evaluacion comparativa de adaptadores comunitarios: util para medir, con un conjunto de pruebas propio, la variabilidad de calidad entre adaptadores LoRA publicados sobre el mismo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador pesa 0,1 GB, pero requiere cargar el modelo base SmolLM3-3B. En fp16 se estiman en torno a 6-7 GB solo para pesos, mas cache KV y overhead; en cuantizacion de 8 bits, aproximadamente 3-4 GB; en 4 bits, en torno a 2-3 GB. Estas cifras son estimaciones a partir del tamano del base, no datos publicados para este adaptador.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 del base (RTX 3060 Ti, RTX 4060 Ti, RTX 4070); A100 o H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, previsiblemente en RTX 3060 de 12 GB, RTX 4070, RTX 4080 y RTX 4090, asi como en GPUs de 8 GB con cuantizacion.
- Opciones de despliegue: Transformers con PEFT (segun el quick start), vLLM o TGI fusionando previamente el adaptador con el base, y llama.cpp u Ollama tras convertir el modelo fusionado a GGUF. El adaptador por si solo no es desplegable en llama.cpp sin fusion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SmolLM3-Custom-SFT (este) | adaptador sobre 3.000 M | no disponible | no disponible | Hugging Face, 0 descargas | Adaptador LoRA comunitario sin evaluacion |
| HuggingFaceTB/SmolLM3-3B | 3.000 M | no disponible en esta ficha | no disponible en esta ficha | Hugging Face, modelo oficial | Modelo base sobre el que se entrena el adaptador |
| Adaptadores LoRA comunitarios sobre SmolLM3 | variable | heredado del base | variable | Hugging Face | Calidad dependiente del autor; sin garantias |

La comparacion con alternativas de la misma categoria (adaptadores LoRA sobre SmolLM3-3B) no puede cuantificarse porque no hay benchmarks publicados para este artefacto.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni tamano de dataset, ni hiperparametros documentados, por lo que la calidad del ajuste es desconocida.
- Licencia no declarada: no se puede asumir uso comercial; es necesario contactar con el autor o verificar la licencia del modelo base antes de cualquier despliegue.
- Idiomas no declarados: se desconoce si el SFT preserva el multilingueismo del base o lo restringe.
- Riesgo de alucinacion: inherente al modelo base de 3.000 millones de parametros; el SFT no documenta mitigaciones.
- Posible olvido catastrofico: un SFT acotado sobre un modelo pequeno puede degradar capacidades generales; no hay datos que lo descarten.
- Sesgos: no documentados; se heredan los del corpus de entrenamiento del base y los del dataset de SFT, que no se especifica.
- Reproducibilidad limitada: la model card no incluye dataset, semilla ni configuracion de entrenamiento, impidiendo replicar el resultado.
- Madurez: cero descargas y un like en el momento de la consulta; no hay evidencia de uso en produccion ni de validacion por terceros.
- El quick start de la model card contiene un `model="None"` que no es funcional; debe sustituirse por la ruta del adaptador y del base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mazennkarim/SmolLM3-Custom-SFT
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Repositorio TRL: https://github.com/huggingface/trl
- Documentacion PEFT: https://huggingface.co/docs/peft
