# selorahomes/Selora-AI-LLM-1.7B

## Resumen

Selora AI LLM es un modelo de lenguaje ajustado por instrucciones para Home Assistant, la plataforma de domotica de codigo abierto. Lo desarrolla Selora Homes y se construye sobre Qwen3 1.7B de Alibaba. Se distribuye en dos formas: cinco adaptadores LoRA especialistas de proposito unico (command, automation, answer, clarification y utilities) y un modelo general fusionado denominado selora-ollama que agrupa los cinco para su uso en Ollama.

Cada especialista emite un "slim envelope": un objeto JSON compacto con claves de un solo caracter para ahorrar tokens, que actua como representacion intermedia y no como accion finalizada. La integracion Selora AI para Home Assistant parsea ese envelope y lo ejecuta contra el hogar: invoca servicios, resuelve estado en vivo o guarda una automatizacion. El modelo nunca fabrica estado de dispositivos por diseno; emite las llamadas a realizar, las entidades a consultar o la pregunta a formular.

Esta ficha documenta la version con cinco adaptadores LoRA (v0.8.1), marcada como obsoleta por el autor en favor del modelo fusionado selorahomes/Selora-AI-LLM-1.7B-ollama. El modelo base Qwen3 1.7B emplea una arquitectura transformer densa con 2.031.739.904 parametros totales, licencia Apache-2.0 y soporte exclusivo del idioma ingles. Su relevancia radica en ofrecer control de domotica totalmente local y offline, sin dependencia de la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3 1.7B) con cinco adaptadores LoRA especialistas |
| Parametros totales | 2.031.739.904 (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Base GGUF Q6_K; adaptadores LoRA en F16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (base) y adaptadores LoRA (safetensors/F16); compatible con transformers y Ollama |

## Arquitectura y entrenamiento

El modelo parte de Qwen3 1.7B, un transformer denso de la familia Qwen3, y se ajusta mediante cinco adaptadores LoRA independientes, cada uno entrenado para una intencion concreta del dominio domotico: control de dispositivos, autoria de automatizaciones, respuesta sobre estado en vivo, peticion de aclaracion y ayuda tecnica fundamentada en documentacion. Cada especialista produce un envelope JSON estricto y compacto, con claves de un solo caracter para minimizar el consumo de tokens, que la integracion convierte en acciones reales de Home Assistant mediante el parser `_convert_slim_shape`.

El ajuste se orienta a instrucciones y a uso de herramientas (tool-use / function calling), con el objetivo de que el modelo emita llamadas estructuradas en lugar de texto libre. El autor no detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La innovacion principal es el diseno del envelope como representacion intermedia: el modelo no ejecuta servicios ni lee estado, solo describe que hacer, y la integracion completa el bucle contra el estado real del hogar para evitar alucinaciones de estado.

## Capacidades

- Generacion de texto y razonamiento orientados a instrucciones en el dominio de domotica.
- Control de dispositivos mediante lenguaje natural: emitir llamadas de servicio estructuradas ("turn off the kitchen lights", "set the thermostat to 68").
- Creacion de automatizaciones en Home Assistant a partir de descripciones en ingles, devolviendo YAML valido como borrador para revision.
- Respuesta a preguntas sobre el estado del hogar mediante plantillas con marcadores de entidad que la integracion rellena con estado en vivo.
- Peticion de aclaracion cuando una solicitud es ambigua, con opciones de respuesta rapida.
- Ayuda tecnica fundamentada en documentacion recuperada, con citas a los fragmentos de origen.
- Soporte de tool calling / function calling a traves del formato de envelope JSON.
- Orquestacion de escenas y rutinas encadenando acciones sobre multiples entidades.
- Ejecucion local y offline-first, sin dependencia de la nube.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Control conversacional de dispositivos: el usuario pide apagar las luces de la cocina y el adaptador command emite el servicio y la entidad concretos, que la integracion ejecuta contra Home Assistant.
- Creacion de automatizaciones en lenguaje natural: describir en ingles una regla ("cuando la puerta se abra despues de las 22:00, encender la luz del porche") y obtener un borrador de YAML revisable antes de guardarlo.
- Orquestacion de rutinas y escenas: encadenar acciones sobre varias entidades ("good night" desbloquea puertas, atenua luces y fija el termostato) sin escribir scripts a mano.
- Consulta del estado del hogar: preguntas como "is the laundry running?" o "what's the temperature upstairs?" se resuelven con el adaptador answer, que devuelve las entidades a consultar y una plantilla de respuesta.
- Soporte tecnico fundamentado en documentacion: diagnosticar por que un sensor no esta disponible o como anadir una integracion, con citas a los fragmentos de documentacion recuperados.
- Asistente de hogar con privacidad primero: despliegue en hardware local (Raspberry Pi 5, Mac mini, equipos tipo NUC) sin que los comandos ni la telemetria salgan de la red local.
- Gestion de mantenimiento y actualizaciones: el adaptador utilities ayuda con tareas de mantenimiento, resolucion de problemas y puesta en marcha, apoyandose en documentacion inyectada en inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base tiene 2.031.739.904 parametros; en cuantizacion Q6_K el peso ronda los 1,7 GB, mas el coste de los adaptadores LoRA en F16 y la cache KV.
- GPU recomendadas: no especificadas por el autor; por tamano, cabe en GPUs de consumo con 8 GB o mas de VRAM.
- Cabe en GPU de consumo: si, en tarjetas tipo RTX 3060, RTX 4060, RTX 4090 y similares con al menos 8 GB de VRAM.
- Despliegue en CPU y equipos de bajo consumo: el autor indica ejecucion en Raspberry Pi 5, Mac mini y equipos tipo NUC mediante llama-server u Ollama.
- Opciones de despliegue: llama-server (runtime de la integracion), Ollama, vLLM (en la nube) y transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Selora AI LLM 1.7B (esta ficha) | 2.031.739.904 | No disponible | Apache-2.0 | Domotica Home Assistant, cinco LoRA especialistas |
| Selora AI LLM 14B | 14B (variante) | No disponible | Apache-2.0 | Misma familia, para despliegues de 16 GB |
| Selora-AI-LLM-1.7B-ollama | 2.031.739.904 (fusionado) | No disponible | Apache-2.0 | Version fusionada unica para Ollama, sucesora de esta |
| Qwen3 1.7B (base) | 1.7B | No disponible | Apache-2.0 | Modelo generalista de proposito multiple |

## Limitaciones y advertencias

- Version obsoleta: el autor retira este bundle de cinco adaptadores tras v0.8.1 y recomienda migrar al modelo fusionado selorahomes/Selora-AI-LLM-1.7B-ollama.
- El modelo emite envelopes JSON intermedios, no acciones finales; requiere la integracion Selora AI (o un parser equivalente) para ejecutar llamadas, resolver estado o construir YAML.
- Soporte exclusivo del idioma ingles; no se documenta capacidad multilingue.
- Longitud de contexto no documentada en la informacion disponible.
- Riesgo de alucinacion en la generacion de YAML de automatizaciones y en la seleccion de entidades; el autor recomienda revisar los borradores antes de guardarlos.
- El modelo no lee ni fabrica estado de dispositivos por diseno, pero depende de que la integracion resuelva correctamente las entidades.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia Apache-2.0, que permite uso comercial; conviene revisar los terminos de la integracion y de la documentacion de Home Assistant empleada como fuente.
- Para produccion, verificar la compatibilidad de la version v0.8.1 con la integracion instalada antes de actualizar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/selorahomes/Selora-AI-LLM-1.7B
- Modelo fusionado sucesor: https://huggingface.co/selorahomes/Selora-AI-LLM-1.7B-ollama
- Variante de 14B: https://huggingface.co/selorahomes/Selora-AI-LLM-14B
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Integracion Home Assistant: https://github.com/SeloraHomes/ha-selora-ai
- Sitio del autor: https://selorahomes.com
- Home Assistant: https://www.home-assistant.io
