# gaveta-cmd/qwen2.5-1.5b-whatsapp-pedidos-lora

## Resumen

El modelo `gaveta-cmd/qwen2.5-1.5b-whatsapp-pedidos-lora` es un adaptador LoRA sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct, desarrollado por Davi Augusto (usuario `gaveta-cmd`). Su funcion es transformar mensajes libres de clientes en portugues de Brasil, tipicos de WhatsApp, en pedidos estructurados en formato JSON para un menu fijo de 17 productos de espetinho (brochetas). El adaptador resuelve el problema de la extraccion de informacion estructurada a partir de lenguaje natural coloquial, con gerga, errores tipograficos y mensajes que no son pedidos.

El modelo se distribuye como adaptador PEFT (LoRA) de aproximadamente 0,1 GB, que debe combinarse con el modelo base Qwen2.5-1.5B-Instruct (1.500 millones de parametros). La licencia es Apache 2.0 y el unico idioma declarado es el portugues. El proyecto incluye codigo, datos de entrenamiento y un diario completo en el repositorio de GitHub del autor, lo que facilita su reproduccion.

La relevancia de este adaptador radica en su enfoque especializado: en lugar de un modelo generalista, se opta por un ajuste fino ligero sobre un modelo pequeno, entrenado con 4.000 mensajes sinteticos, que logra un 100% de JSON valido y un 98% de acierto exacto en un conjunto de prueba sintetico, con un coste de inferencia en GPU local. No obstante, las limitaciones son significativas: el modelo solo funciona para el menu fijo aprendido y no ha sido probado con clientes reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre transformer decoder-only (Qwen2.5-1.5B-Instruct) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 1.500 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen2.5-1.5B-Instruct; no especificada en la informacion) |
| Tipos de cuantizacion | No disponible (entrenado en bf16 sin cuantizacion; el adaptador se puede combinar con el base) |
| Idiomas soportados | Portugues (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador LoRA se aplica sobre el modelo Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parametros. El ajuste fino utiliza LoRA con rango r=16, alpha=32, dropout=0,05, tasa de aprendizaje 2e-4, 3 epocas, tamano de lote 4 con acumulacion de 4 y semilla 42. Los modulos ajustados son `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento se realizo en bf16 sin cuantizacion, en una RTX 5060 Ti, durante aproximadamente 25 minutos.

Los datos de entrenamiento consisten en 4.000 mensajes sinteticos generados a partir del menu fijo de 17 productos, con gerga, errores de tipografia y mensajes que no son pedidos. Cada mensaje tiene una copia con la puntuacion alterada y la misma respuesta de referencia (ground truth). El objetivo es la extraccion de un JSON con los campos `itens` (producto, cantidad, observaciones), `endereco` y `pagamento`. Una lista de items vacia indica que el mensaje no es un pedido. No se menciona el uso de RLHF o DPO; el entrenamiento es supervisado sobre pares mensaje-JSON.

## Capacidades

- Extraccion de informacion estructurada: convierte mensajes libres en portugues de Brasil en JSON con items, cantidades, observaciones, direccion y metodo de pago.
- Generacion de JSON valido: alcanza un 100% de JSON valido en el conjunto de prueba sintetico de 100 mensajes.
- Deteccion de mensajes que no son pedidos: devuelve una lista de items vacia para saludos, preguntas o quejas.
- Manejo de gerga y errores tipograficos: entrenado con mensajes sinteticos que incluyen variaciones coloquiales.
- Capacidad conversacional: hereda las capacidades del modelo base Qwen2.5-1.5B-Instruct, aunque el adaptador esta especializado en extraccion.
- No se menciona soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.

## Casos de uso

- Automatizacion de pedidos por WhatsApp en un negocio de espetinhos: el adaptador recibe el mensaje del cliente y devuelve un JSON que puede insertarse directamente en un sistema de gestion de pedidos, gracias a su entrenamiento especifico para el menu de 17 productos.
- Integracion con una API FastAPI: el repositorio del autor incluye `src/api.py`, lo que permite desplegar el modelo como servicio HTTP para que un bot de WhatsApp lo consuma en tiempo real.
- Validacion con esquema Pydantic: el repositorio incluye `src/schema.py`, lo que facilita la validacion de la salida JSON antes de su uso en produccion, reduciendo el riesgo de errores silenciosos.
- Procesamiento por lotes de historial de mensajes: dado que el modelo es pequeno (1.5B) y se ejecuta en GPU local, se puede usar para extraer pedidos de conversaciones archivadas sin coste por token.
- Prototipado rapido de sistemas de extraccion: sirve como base para experimentar con LoRA en tareas de extraccion estructurada, ya que el codigo de generacion de datos y entrenamiento es reproducible.
- Filtrado de mensajes no relevantes: al devolver una lista vacia para mensajes que no son pedidos, puede usarse como clasificador previo en un pipeline de atencion al cliente para derivar solo los pedidos al sistema de gestion.
- Demostracion de ajuste fino eficiente: con un entrenamiento de 25 minutos en una RTX 5060 Ti, es un ejemplo practico de como adaptar un modelo pequeno a un dominio muy concreto con recursos limitados.

## Benchmarks y rendimiento

Los resultados proporcionados por el autor son los siguientes:

Prueba final con 18 mensajes nuevos escritos a mano (14 con pedido, 4 sin pedido), con ground truth fijado antes de ejecutar los modelos:

| Modelo | Total | Con pedido (14) | Sin pedido (4) |
|---|---|---|---|
| Qwen + LoRA v5 | 17/18 | 13/14 | 4/4 |
| Claude Haiku 5.5 + reglas de negocio | 16/18 | 12/14 | 4/4 |
| Claude Haiku 5.5 sin reglas | 15/18 | 11/14 | 4/4 |

Prueba con 100 mensajes sinteticos generados por el mismo generador del entrenamiento:

| Modelo | JSON valido | Acierto exacto | Latencia media | Coste / 1.000 msgs |
|---|---|---|---|---|
| Qwen sin entrenamiento | 92% | 15% | 4,8 s | GPU local |
| Qwen + LoRA v5 | 100% | 98% | 3,4 s | GPU local |
| Claude Haiku 5.5 + reglas | 100% | 90% | 1,6 s | US$ 0,19 |
| Claude Haiku 5.5 sin reglas | 100% | 80% | 1,6 s | US$ 0,16 |

El autor advierte que el 98% esta favorecido porque los mensajes sinteticos comparten estilo con los de entrenamiento; una version anterior obtuvo 99% en ese tipo de prueba pero solo 30% en mensajes nuevos escritos a mano. La latencia se midio en una RTX 5060 Ti sin optimizar la inferencia y no se midio el coste energetico.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA es de ~0,1 GB; el modelo base Qwen2.5-1.5B-Instruct en bf16 requiere aproximadamente 3 GB de VRAM. No se proporcionan estimaciones para cuantizaciones del adaptador.
- GPU recomendadas: el autor entreno y probo en una RTX 5060 Ti. Cualquier GPU consumer con al menos 4-6 GB de VRAM deberia poder ejecutar el modelo base en bf16 o cuantizado.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060, RTX 4060, RTX 5060 Ti o superiores.
- Opciones de despliegue: el autor usa `transformers` + `peft` con `merge_and_unload()`. No se mencionan vLLM, llama.cpp, Ollama ni TGI. El repositorio incluye una API FastAPI (`src/api.py`).
- Latencia y throughput: latencia media de 3,4 s por mensaje en una RTX 5060 Ti sin optimizar, segun la tabla de benchmarks. No se proporciona throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen + LoRA v5 (este) | 1.5B + adaptador | No disponible | 17/18 en prueba manual; 98% en sintetico | Apache 2.0 | HuggingFace |
| Qwen2.5-1.5B-Instruct sin ajuste | 1.5B | No disponible | 15% de acierto exacto en sintetico | Apache 2.0 | HuggingFace |
| Claude Haiku 5.5 + reglas | No disponible | No disponible | 16/18 en prueba manual; 90% en sintetico | Propietaria | API de Anthropic |

No se dispone de informacion sobre otros adaptadores LoRA comparables para extraccion de pedidos en portugues. La comparacion con Claude Haiku 5.5 es la unica proporcionada por el autor, y este senala que se trata de un empate tecnico dada la muestra pequena (18 mensajes).

## Limitaciones y advertencias

- Pierde el ultimo item en algunos casos: cuando hay una frase de cierre despues de la lista, el modelo puede omitir el ultimo producto. En un test controlado mantuvo el ultimo item en 44 de 54 casos, y con "Obrigado!" justo despues de la lista solo en 3 de 9.
- Solo funciona para el menu fijo de 17 productos: los productos estan aprendidos en los pesos; para otro menu es necesario reentrenar.
- Nunca ha visto clientes reales: el entrenamiento es 100% sintetico y las pruebas fueron escritas a mano, sin mensajes de clientes reales.
- Muestras pequenas: cada mensaje de la prueba final vale mas de 5 puntos porcentuales, y todos tienen el estilo de una sola persona.
- Ambiguedad en "coca": puede referirse a lata o a 2 litros; en los datos siempre se interpreta como lata.
- Riesgo de errores silenciosos: un item perdido no invalida el JSON, por lo que el error pasa desapercibido si no hay revision humana.
- No usar sin revision humana en pedidos reales, segun el propio autor.
- Sesgos conocidos: no se documentan sesgos especificos, pero al estar entrenado con datos sinteticos de un unico dominio, el comportamiento fuera de ese dominio es incierto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-1.5B-Instruct tambien es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- Limitaciones de contexto e idioma: solo portugues; no se especifica la longitud de contexto efectiva para el adaptador.

## Enlaces

- HuggingFace: https://huggingface.co/gaveta-cmd/qwen2.5-1.5b-whatsapp-pedidos-lora
- Repositorio GitHub (codigo, datos y diario): https://github.com/Gaveta-cmd/whatsapp-pedidos-llm
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
