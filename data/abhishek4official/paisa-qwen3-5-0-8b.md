# abhishek4official/paisa-qwen3.5-0.8b

## Resumen

Paisa 0.8B es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-0.8B desarrollado por Abhishek Kumar, orientado a dos tareas concretas dentro del dominio financiero indio: la conversion de SMS bancarios, de UPI, de carteras digitales y de tarjetas a JSON estructurado, y la resolucion de preguntas sobre gastos mediante llamadas a herramientas (tool calling) sobre una base de datos local de transacciones. El modelo esta pensado para ejecutarse integramente en un telefono Android dentro de la aplicacion Paisa, que no solicita permiso de INTERNET, de modo que los SMS nunca abandonan el dispositivo.

Con 752.393.024 parametros reales (segun safetensors), es un modelo denso de la familia Qwen3.5, distribuido en formato safetensors (checkpoint bf16 fusionado y adaptador LoRA) y GGUF cuantizado en Q4_K_M (529 MB), lo que lo hace viable en hardware movil. El contexto de entrenamiento declarado es de 2048 tokens y soporta ingles, hindi y hinglish.

Su relevancia actual radica en el enfoque: en lugar de competir en capacidades generales, especializa un modelo pequeno para una tarea de extraccion de informacion muy acotada (SMS bancarios indios) y delega la aritmetica en la aplicacion mediante marcadores de posicion, evitando que el modelo tenga que calcular cifras. La licencia Apache-2.0 facilita su reutilizacion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen/Qwen3.5-0.8B) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens en entrenamiento; ejemplo de despliegue con `-c 4096` |
| Tipos de cuantizacion | GGUF Q4_K_M (529 MB); checkpoint bf16; adaptador LoRA (r 32, alpha 64) |
| Idiomas soportados | en, hi (incluye hinglish) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (merged y adapter), GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer denso de aproximadamente 0,75 mil millones de parametros. Sobre esa base se aplico un ajuste supervisado con LoRA en dos rondas: la primera sobre unas 55.000 filas y la segunda continuando el mismo adaptador durante una epoca sobre 65.500 filas (47,7 millones de tokens), con tasa de aprendizaje 1e-4, precision bf16, longitud maxima de 2048 y una unica GPU RTX 4500 Ada durante aproximadamente 3 horas. El adaptador resultante tiene rango 32 y alpha 64, y posteriormente se fusiono con la base para producir el checkpoint bf16.

Los datos de entrenamiento son sinteticos: SMS generados a partir de plantillas que cubren bancos indios, aplicaciones UPI, carteras y tarjetas, construidos sobre personas ficticias; conversaciones multiturno sinteticas sobre bases de datos de transacciones falsas; y un 8% de chat general procedente de HuggingFaceTB/smol-smoltalk (Apache-2.0). Algunos patrones de pregunta provienen de pruebas del propio desarrollador, pero se replicaron sobre personas ficticias, sin SMS, saldos ni importes reales. No se menciona RLHF ni DPO en la informacion disponible. La innovacion destacable es de diseno: el modelo emite cifras como marcadores de posicion (`{total}`) que la aplicacion rellena, de modo que la aritmetica queda fuera del modelo.

## Capacidades

- Conversion de SMS bancarios indios (banco, UPI, cartera, tarjeta) a un objeto JSON con clase (transaccion, fallida, OTP, promocion, estafa, recordatorio de factura, etc.) y campos de importe, debito/credito, comercio, ultimos 4 digitos de cuenta, saldo, fecha, referencia, canal y categoria.
- Respuesta a preguntas sobre gastos en ingles, hindi y hinglish mediante llamadas a herramientas en formato XML de Qwen (`<tool_call><function=get_spend>…`).
- Tool calling / function calling: las definiciones de herramientas estan en `app_prompts/tools.json` y el modelo lee los resultados devueltos para redactar la respuesta final.
- Generacion de graficos a partir de los datos de transacciones (segun la evaluacion de validacion, con 30/30 aciertos en la categoria de charts).
- Razonamiento multiturno sobre conversaciones con contexto de base de datos local.
- Capacidad limitada de chat general, heredada del 8% de smol-smoltalk en el entrenamiento.
- No dispone de vision, audio ni modo de pensamiento explicito segun la informacion disponible.

## Casos de uso

- Extraccion estructurada de SMS bancarios en el dispositivo: el modelo recibe remitente y texto del SMS y devuelve un JSON con importe, tipo, cuenta, saldo, fecha y referencia; encaja en una app Android porque el GGUF Q4_K_M ocupa 529 MB y el SMS no sale del telefono.
- Clasificacion y filtrado de estafas y promociones: la clase devuelta (scam, promo, OTP) permite a la aplicacion alertar al usuario o excluir el mensaje del registro de gastos sin enviar datos a un servidor.
- Asistente conversacional de finanzas personales: preguntas como "is mahine Swiggy pe kitna gaya?" se resuelven con tool calling sobre la base de datos local de transacciones, con la app rellenando los marcadores de posicion para evitar errores aritmeticos.
- Generacion de resumenes y graficos de gasto: el modelo emite llamadas a herramientas que construyen graficos a partir de las transacciones, util para paneles de finanzas personales dentro de la app.
- Conciliacion automatica de movimientos: la precision declarada del 100% en importe, tipo, cuenta, saldo, fecha y referencia sobre 379 de 400 transacciones lo hace adecuado para registrar movimientos sin intervencion manual y marcar los casos dudosos para revision.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse con llama.cpp (`llama-server -m ... -c 4096 --temp 0`) y sin permiso de red en la app, sirve para escenarios donde la normativa impide enviar datos financieros a la nube.
- Procesamiento por lotes en CPU: con ~258 tok/s de prompt y ~37 tok/s de generacion en CPU de portatil, puede procesar colas de SMS historicos en equipos sin GPU.

## Benchmarks y rendimiento

| Conjunto | Resultado |
|---|---|
| SMS retenidos de bancos no vistos en entrenamiento (500) | JSON valido 100%; exactitud de clase 100%; precision/recall de transaccion 100%/100%; todos los campos exactos en 379/400 transacciones (importe, tipo, cuenta, saldo, fecha y referencia 100%; comercio 99%; categoria 98,5%; canal 96%) |
| Validacion: SMS / preguntas simples / graficos / multiturno (30 cada uno) | 30/30 llamadas a herramienta o JSON exactos en cada categoria |

| Metrica de velocidad (CPU de portatil) | Valor |
|---|---|
| Throughput de prompt | ~258 tok/s |
| Throughput de generacion | ~37 tok/s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el GGUF Q4_K_M ocupa 529 MB, por lo que la inferencia cabe en menos de 1 GB de memoria; el checkpoint bf16 fusionado requiere aproximadamente 1,5 GB (2,1 GB de repositorio incluyendo todos los artefactos).
- GPU recomendadas: no se especifican; el entrenamiento se realizo en una RTX 4500 Ada. Para inferencia basta CPU.
- Cabe en GPU de consumo: si, en cualquier GPU con 2 GB o mas de VRAM, y en CPU sin GPU.
- Opciones de despliegue: llama.cpp (`llama-server`), GGUF compatible con Ollama y otros runners de llama.cpp; Transformers para el checkpoint bf16; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput: ~258 tok/s de prompt y ~37 tok/s de generacion en CPU de portatil; no hay datos de GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Paisa 0.8B | 752.393.024 | 2048 (entrenamiento) | SMS bancarios indios y asistente de gastos con tool calling | Apache-2.0 | Hugging Face (35 descargas) |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | no disponible | Modelo general de texto | no disponible | Hugging Face |
| HuggingFaceTB/smol-smoltalk (dataset) | no aplica | no disponible | Dataset de chat usado al 8% en el entrenamiento | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks ni de otros modelos especializados comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Solo cubre formatos de SMS bancarios indios; los mensajes de otros paises quedan fuera del alcance declarado.
- Al ser un modelo de 0,8B puede malinterpretar formatos poco habituales o preguntas ambiguas; la propia model card recomienda mostrar al usuario el SMS original para cualquier cifra.
- No es asesoramiento financiero: informa de lo ocurrido en las transacciones del usuario, no recomienda inversiones.
- El entrenamiento se basa en datos sinteticos generados por plantillas, lo que puede dejar sin cubrir variaciones reales de redaccion de los bancos.
- No se han publicado evaluaciones de sesgos ni de alucinacion en la informacion disponible.
- La licencia Apache-2.0 permite uso comercial, pero la responsabilidad sobre el tratamiento de datos financieros personales recae en el integrador.
- La fecha de creacion del repositorio (2026-10-26) y el reducido numero de descargas (35) indican un proyecto reciente y con poca validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abhishek4official/paisa-qwen3.5-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de chat general: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Web del autor: https://abhishek4official.github.io/
