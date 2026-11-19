# javiz12188/qwen2.5-1.5b-clasificador-clientes-lora

## Resumen

El modelo `javiz12188/qwen2.5-1.5b-clasificador-clientes-lora` es un adaptador LoRA (Low-Rank Adaptation) construido sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct, publicado por el usuario javiz12188 en Hugging Face. Su propósito es la clasificación de mensajes de atención al cliente en español en cuatro categorías cerradas: `pedido`, `devolucion`, `queja` y `otro`. No se trata de un modelo completo, sino de un conjunto de pesos delta que deben cargarse junto con el modelo base mediante la librería PEFT.

El adaptador se enmarca en la categoría de ajuste fino eficiente (PEFT) y tiene un carácter claramente educativo: la propia model card lo define como proyecto de demostración, entrenado sobre un dataset sintético de tan solo 300 ejemplos (75 por categoría) y sin validación para uso empresarial real. A pesar de su escasa escala, el adaptador reporta una mejora medible sobre el modelo base en el conjunto de prueba reservado (del 68,0 % al 84,0 % de acierto), lo que lo convierte en un ejemplo ilustrativo de cómo LoRA puede especializar un modelo instruct de 1,5 mil millones de parámetros para una tarea de clasificación concreta.

Por su tamaño (0.0 GB en el repositorio, pesos safetensors de rango bajo) y su dependencia del modelo base Qwen2.5-1.5B-Instruct, es un artefacto ligero y fácil de desplegar en hardware modesto, pero su utilidad práctica queda limitada por el volumen y origen sintético de los datos de entrenamiento. Es relevante ahora como referencia didáctica para quienes quieran replicar el flujo PEFT + clasificación en español, no como solución de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Qwen2.5-1.5B-Instruct) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 1,5 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion, pero no se especifica) |
| Idiomas soportados | Espanol (etiqueta `spanish`); resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador sigue la tecnica LoRA (PEFT): se anaden matrices de bajo rango a las capas del transformer base Qwen2.5-1.5B-Instruct, congelando los pesos originales y entrenando unicamente los parametros delta. El modelo base es un transformer decoder-only de 1,5 mil millones de parametros con atencion causal estandar, disenado para instrucciones y conversacion. No se especifica en la informacion disponible el rango LoRA, el alpha, las capas objetivo ni la tasa de aprendizaje empleada.

El entrenamiento se realizo sobre un dataset sintetico de 300 ejemplos en espanol, con 75 ejemplos por cada una de las cuatro categorias (`pedido`, `devolucion`, `queja`, `otro`). Se reservaron 250 ejemplos para entrenamiento y 50 para prueba. No se indica el numero de epochs, el optimizador, el batch size ni si se aplico RLHF o DPO (no procede en una tarea de clasificacion supervisada). No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.); se trata de un ajuste fino supervisado convencional con LoRA.

## Capacidades

- Clasificacion de texto en espanol en cuatro categorias cerradas: `pedido`, `devolucion`, `queja` y `otro`.
- Especializacion sobre mensajes de atencion al cliente (dominio `customer-support`).
- Hereda del modelo base Qwen2.5-1.5B-Instruct la capacidad de generacion de texto y comprension de instrucciones, aunque el adaptador esta orientado a clasificacion.
- No se documenta soporte de tool calling ni function calling en el adaptador.
- No se documenta soporte de agentes ni razonamiento multi-paso especifico del adaptador.
- Capacidades multilingues: solo se declara espanol; otros idiomas no disponibles.
- No se documentan capacidades especiales (vision, audio, thinking mode, etc.).

## Casos de uso

- Triaje automatizado de tickets de atencion al cliente: el adaptador clasifica cada mensaje entrante en `pedido`, `devolucion`, `queja` u `otro`, permitiendo enrutar el ticket al equipo adecuado. Es adecuado por su tamano reducido y su entrenamiento especifico en espanol, aunque requiere validacion con datos reales antes de produccion.
- Prototipado rapido de pipelines de clasificacion: sirve como punto de partida para equipos que quieran montar un clasificador de soporte con PEFT y Qwen2.5-1.5B-Instruct, sustituyendo despues el dataset sintetico por datos anotados reales.
- Demostracion educativa de ajuste fino eficiente: util en cursos y talleres para ilustrar como LoRA mejora un modelo base en una tarea concreta con pocos ejemplos (68,0 % a 84,0 % en el conjunto de prueba).
- Etiquetado asistido de datasets: el adaptador puede pre-etiquetar mensajes de clientes para que revisores humanos corrijan, acelerando la anotacion de corpus reales de atencion al cliente.
- Enrutamiento en sistemas de helpdesk: integracion como clasificador previo en herramientas de ticketing para derivar consultas a colas de pedidos, devoluciones o quejas.
- Filtro de mensajes en espanol para moderacion o priorizacion: identificar rapidamente quejas para escalarlas a agentes senior, usando el modelo base con el adaptador en hardware modesto.
- Experimentacion con despliegue ligero: al depender de un modelo base de 1,5B, puede ejecutarse en GPU de consumo para pruebas de latencia y integracion en servicios internos.

## Benchmarks y rendimiento

| Metrica | Modelo base | Modelo con LoRA |
|---|---|---|
| Acierto en conjunto de prueba (50 ejemplos sinteticos) | 34/50 (68,0 %) | 42/50 (84,0 %) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los resultados reportados corresponden unicamente al conjunto sintetico de prueba del autor y no garantizan rendimiento con mensajes reales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al cargar el modelo base Qwen2.5-1.5B-Instruct en float16 se requieren aproximadamente 3 GB de VRAM solo para pesos, mas overhead de activaciones y contexto (estimacion orientativa, no confirmada en la informacion).
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano del modelo base, GPUs de consumo con 6-8 GB de VRAM o superiores deberian ser suficientes, pero no se documenta.
- Cabe en GPU de consumo: probablemente si, dado el tamano del modelo base (1,5B), pero no se confirma en la informacion disponible.
- Opciones de despliegue: la model card muestra carga via `transformers` + `peft` (`PeftModel.from_pretrained`). No se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| javiz12188/qwen2.5-1.5b-clasificador-clientes-lora | Adaptador LoRA sobre 1,5B | No disponible | Apache 2.0 | Clasificacion de tickets en espanol | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-1.5B-Instruct (modelo base) | 1,5B | No disponible en la informacion | Apache 2.0 | Instruct generalista | Hugging Face |
| Alternativas de clasificacion en espanol de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmark comparables con otros clasificadores en la informacion proporcionada; la unica comparacion documentada es frente al modelo base en el conjunto sintetico de prueba (68,0 % vs 84,0 %).

## Limitaciones y advertencias

- Entrenado sobre un dataset sintetico de solo 300 ejemplos (75 por categoria), lo que limita severamente la generalizacion a mensajes reales.
- Los resultados (84,0 % en 50 ejemplos) provienen exclusivamente del conjunto sintetico del autor y no garantizan rendimiento en produccion.
- La model card indica explicitamente que no esta validado para decisiones empresariales sin evaluacion adicional.
- Riesgo de alucinacion y de clasificaciones erroneas en categorias ambiguas o mensajes fuera de dominio.
- Sesgos conocidos: no documentados en la informacion disponible; al heredar el modelo base, puede arrastrar sesgos de Qwen2.5-1.5B-Instruct.
- Limitaciones de idioma: solo se declara espanol; comportamiento en otros idiomas no disponible.
- Limitaciones de contexto: no se documenta la longitud de contexto efectiva del adaptador; depende del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero la falta de validacion y el origen sintetico de los datos desaconsejan su uso directo en produccion sin reentrenamiento y evaluacion.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de uso o validacion por terceros.
- No se documentan detalles de hiperparametros LoRA (rango, alpha, capas), lo que dificulta la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/javiz12188/qwen2.5-1.5b-clasificador-clientes-lora
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
