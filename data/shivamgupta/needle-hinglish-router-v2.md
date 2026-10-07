# shivamgupta/needle-hinglish-router-v2

## Resumen

Needle-hinglish-router-v2 es un fine-tune de Cactus-Compute/needle3, un modelo pequeno disenado para ejecutarse en CPU, que actua como enrutador de acciones (action router) en conversaciones de atencion al cliente en hinglish (code-switching hindi-ingles). El autor es el usuario de HuggingFace shivamgupta, y el modelo se distribuye bajo licencia Apache 2.0. Su tarea principal no es la generacion libre de texto, sino transformar un registro estructurado de cliente mas una transcripcion de audio de cliente en llamadas de escritura resueltas (por ejemplo `cancel_order` sobre el pedido `FD4124`), o bien solicitar aclaracion al cliente cuando una referencia no se puede resolver.

El modelo se compone de dos piezas: los pesos (needle3 con el adaptador LoRA `adapter_R_e15` fusionado, cuantizados en W4A8, en formato `.cact`) y el codigo del enrutador (`router_v2`, `resolver_v2`, esquemas de herramientas para siete tipos de agente, numconv, romanise), que no vive en el repositorio de HuggingFace sino en el monorepo de GitHub `shivamgcodes/s2s-hinglish-agent`. La relevancia actual del modelo reside en su enfoque: es un router de tool calling de dominio especifico, ejecutable en CPU, orientado a despliegues on-device o en workers de GPU de baja exigencia dentro de un pipeline de voz a voz (speech-to-speech) para soporte al cliente.

La informacion publicada no detalla el numero de parametros totales, la longitud de contexto ni la composicion completa del dataset de entrenamiento (el model card contiene secciones marcadas como TODO). El archivo de pesos en W4A8 ocupa 63.437.076 bytes, y el adaptador LoRA 7.906.616 bytes, lo que sitúa al modelo en la categoria de modelos compactos aptos para inferencia en CPU.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tune de Cactus-Compute/needle3; no se especifica si es transformer denso u otra) |
| Parametros totales | no disponible (pesos W4A8 de 63.437.076 bytes; adaptador LoRA de 7.906.616 bytes) |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible (en el despliegue de demo recibe la transcripcion de los ultimos 30 s de audio del cliente) |
| Tipos de cuantizacion | W4A8 (pesos 4 bits, activaciones 8 bits) para el modelo fusionado |
| Idiomas soportados | hindi (Devnagari) e ingles, incluyendo hinglish (code-switching); declarados como `hi`, `en` |
| Licencia | Apache 2.0 |
| Formato de pesos | `.cact` (formato propio de la libreria cactus-needle) y `safetensors` (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un fine-tune por LoRA del modelo base Cactus-Compute/needle3, gestionado a traves de la libreria `cactus-needle` (se instala la version `cactus-needle==3.0.6`). No se especifica en la informacion disponible el tipo exacto de arquitectura interna de needle3 (transformer, MoE, híbrida u otra), aunque por el perfil de despliegue (ejecucion en CPU, pesos cuantizados a W4A8 y uso como enrutador) se trata de un modelo compacto optimizado para inferencia ligera. El proceso de construccion del modelo fusionado es explicito: se parte de `needle3.safetensors` y se le aplica el adaptador LoRA `adapter_R_e15.safetensors` mediante el comando `needle build`, y el resultado se almacena cuantizado en W4A8 como `tuned_full.cact`. El repositorio incluye ademas los checkpoints completos de un barrido de fine-tuning: conjuntos de entrenamiento A, B y R por 3, 6 y 10 epocas, mas R a 15 epocas (este ultimo es el que se publica en la raiz como `tuned_full.cact`).

Los datos de entrenamiento se construyen a partir de las llamadas de la carpeta `V4/` del dataset `shivamgupta/hinglish-s2s-synthetic-calls`. Concretamente, se usan ventanas de audio de cliente de 30 segundos que terminan en cada linea de comprobacion (check-line) del agente, transcritas con Trelis Whisper-Hinglish en dos condiciones: limpia y degradada con Opus. La model card se corta en el apartado de construccion de filas (window/row-building), por lo que no se detalla el numero total de tokens ni la composicion completa del dataset. El repositorio incluye resumenes de validacion (`val_losses_*.json`, `engine_val_*.json`, `selection.json`) que recogen la perdida de validacion, los conteos de validacion del motor sobre 120 filas y el tiempo de entrenamiento por ejecucion, aunque los valores numericos concretos no se reproducen en la informacion proporcionada. El modelo se orienta a una tarea de enrutamiento estructurado (prediccion de llamadas de herramienta), no a generacion de lenguaje abierto.

## Capacidades

- Enrutamiento de tool calling / function calling: genera llamadas de escritura estructuradas (por ejemplo `cancel_order`) con nombre de funcion y argumentos resueltos.
- Code-switching hinglish: procesa transcripciones en Devnagari, Roman Hinglish o ingles indistintamente.
- Normalizacion de entrada: convierte numeros hablados a digitos (`numconv`) y romaniza texto en Devnagari (`romanise`) de forma automatica antes de la inferencia.
- Resolucion de referencias: asigna identificadores concretos (pedidos, cuentas, tarjetas, lineas) a partir del registro del cliente y de la transcripcion.
- Gestion de ambiguedad: cuando no puede resolver una referencia, emite una peticion de aclaracion al cliente en lugar de ejecutar una accion (`ask: true`, con `ask_reasons`).
- Soporte de siete tipos de agente: `food_delivery_support`, `ecommerce_support`, `cab_ride_support`, `subscription_account_support`, `airport_ticket_counter`, `bank_card_support` y `telecom_prepaid_support`.
- Ejecucion en CPU: no requiere GPU para funcionar.
- Version previa N1: el repositorio incluye `n1/tuned_full.cact`, el router v1 con cinco tipos de agente, accesible via `needle_router.n1_router()` y utilizable como rollback.

## Casos de uso

- Cancelacion y modificacion de pedidos en reparto de comida: el router recibe el registro del pedido y la transcripcion del cliente, resuelve el identificador del pedido y emite la llamada `cancel_order` o equivalente. Es adecuado por su capacidad de extraer la referencia correcta a partir de lenguaje coloquial en hinglish y de emitir argumentos ya resueltos para el servidor.
- Soporte de comercio electronico: aplicaciones de devoluciones, cambios de direccion o consultas de estado que requieren ejecutar una accion de escritura sobre el pedido. El modelo traduce intenciones en code-switching a una llamada de herramienta concreta, evitando logica de parseo ad hoc.
- Gestion de reservas de taxi: interpretar solicitudes de cancelacion, cambio de destino o confirmacion de recogida y generar la accion correspondiente con la referencia de viaje resuelta.
- Soporte de suscripciones y cuentas: altas, bajas, cambios de plan o actualizaciones de datos, donde el enrutador decide la accion y solicita aclaracion si el cliente no aporta un dato identificativo suficiente.
- Mostrador de billetes de aeropuerto: gestion de cambios, cancelaciones o consultas de reserva a partir de transcripciones cortas, con la ventaja de ejecutarse en CPU sobre hardware modesto en mostrador.
- Soporte de tarjetas bancarias: bloqueo de tarjeta, reporte de operaciones no reconocidas o activacion, donde la resolucion de referencias (numero de tarjeta, cuenta) es critica y el modelo puede pedir aclaracion cuando no la resuelve.
- Soporte de telefonia prepago: recargas, cambios de tarifa o consultas de saldo, con deteccion de numeros hablados y conversion a digitos.
- Integracion en pipeline de voz a voz: en la demo en vivo, el router se ejecuta en el worker de GPU sobre el texto ASR de los ultimos 30 segundos del cliente cada vez que el modelo de voz detecta una check-line, lo que permite encadenar reconocimiento de voz, enrutamiento de accion y respuesta sin intervencion humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona resumenes de validacion (`checkpoints/summaries/val_losses_*.json`, `engine_val_*.json` y `selection.json`) con perdida de validacion y conteos de validacion del motor sobre 120 filas, pero no se reproducen los valores numericos concretos, por lo que no se incluyen cifras en esta ficha.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma explicita; el modelo esta disenado para ejecutarse en CPU. Los pesos fusionados en W4A8 ocupan 63.437.076 bytes (aproximadamente 60,5 MiB), por lo que el consumo de memoria debe ser reducido, pero no se publica una cifra oficial.
- GPU recomendadas: ninguna especifica; la model card indica que funciona en CPU y que en la demo en vivo el router corre en un worker de GPU (sin detallar el modelo de GPU).
- Compatibilidad con GPU de consumo: al ejecutarse en CPU, cabe en equipos sin GPU dedicada. No se proporcionan requisitos minimos de GPU.
- Opciones de despliegue: libreria `cactus-needle` (instalada junto con el paquete `needle_router` desde el monorepo de GitHub). No se mencionan soportes de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card indica que la verificacion del ejemplo se realizo en CPU el 2026-10-07 en un entorno virtual limpio, pero sin cifras de latencia.
- Telemetria: la libreria `cactus-needle` envia conteos de uso anonimos en el primer uso; se puede desactivar con `NEEDLE_TELEMETRY=0`.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (enrutadores de tool calling en hinglish para soporte al cliente ejecutables en CPU). El unico punto de comparacion interno es el modelo base Cactus-Compute/needle3, del que este modelo es un fine-tune, y la version previa N1 del propio autor (router v1 con cinco tipos de agente frente a los siete de la version v2), incluida en el mismo repositorio como rollback.

## Limitaciones y advertencias

- Ambito cerrado: el modelo esta entrenado para siete tipos de agente de soporte al cliente; no es un modelo de proposito general ni de generacion abierta, por lo que su uso fuera de ese dominio probablemente produzca resultados poco fiables.
- Idiomas limitados: solo se declaran hindi e ingles (incluyendo hinglish). No hay soporte documentado de castellano ni de otros idiomas.
- Alucinacion de referencias: al resolver identificadores (pedidos, cuentas, tarjetas) a partir de lenguaje natural, existe riesgo de asignar una referencia incorrecta. La salvaguarda prevista es el campo `ask`; las llamadas con `ask: true` no deben ejecutarse y deben derivarse a una aclaracion con el cliente.
- Datos de entrenamiento sinteticos: el dataset base es sintetico (`hinglish-s2s-synthetic-calls`) con transcripciones de Whisper-Hinglish (limpias y degradadas con Opus), lo que puede introducir sesgos y limitar la generalizacion a audio real diverso.
- Model card incompleta: varias secciones del README contienen marcadores TODO (resumen, descripcion del modelo, uso previsto y uso fuera de alcance), por lo que faltan datos oficiales sobre parametros, contexto y limites de uso.
- Despliegue acoplado a codigo externo: el repositorio de HuggingFace contiene solo pesos, ejemplos y la model card; el codigo del router reside en un monorepo de GitHub, lo que anade una dependencia de mantenimiento y de versionado.
- Versionado de pesos: el repositorio incluye varios checkpoints del barrido de entrenamiento, y el modelo publicado en la raiz corresponde a la ejecucion R_e15; es necesario fijar explicitamente la version o checkpoint deseado para reproducir resultados.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones de los datos de entrenamiento de origen y de la libreria `cactus-needle`.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/shivamgupta/needle-hinglish-router-v2
- Modelo base: https://huggingface.co/Cactus-Compute/needle3
- Dataset de entrenamiento: https://huggingface.co/datasets/shivamgupta/hinglish-s2s-synthetic-calls
- Monorepo de GitHub (codigo del router): https://github.com/shivamgcodes/s2s-hinglish-agent
- Paquete `needle_router`: https://github.com/shivamgcodes/s2s-hinglish-agent/tree/main/packages/needle_router
- Codigo del worker del router en la demo en vivo: https://github.com/shivamgcodes/s2s-hinglish-agent/tree/main/deploy/worker/router
- Codigo de entrenamiento y evaluacion: https://github.com/shivamgcodes/s2s-hinglish-agent/tree/main/research/needle
- Ejemplo de inferencia completo: https://github.com/shivamgcodes/s2s-hinglish-agent/tree/main/research/inference/needle_router
