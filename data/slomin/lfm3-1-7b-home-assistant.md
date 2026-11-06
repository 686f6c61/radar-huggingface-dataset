# Slomin/lfm3-1.7b-home-assistant

## Resumen

lfm3-1.7b-home-assistant es un ajuste fino (fine-tune) del modelo LiquidAI/LFM3-VL-2B orientado especificamente a tareas de domotica sobre Home Assistant: control de dispositivos, consulta del estado del hogar, gestion de listas de tareas y rechazo explicito de acciones no disponibles. Lo desarrolla el usuario Slomin y se distribuye como un unico archivo GGUF cuantizado en Q4_0 de aproximadamente 1,05 GB, pensado para ejecutarse en hardware de borde como una Raspberry Pi 5.

El modelo parte de la familia LFM3 de Liquid AI, con 1.728.801.600 parametros totales (1,7B) y arquitectura derivada de un transformer de Liquid AI (los detalles exactos de la arquitectura base no se detallan en la informacion disponible). Su relevancia radica en que combina un tamano muy reducido con un rendimiento en tareas de Home Assistant que, segun la model card, lo situa en el puesto 5 de una tabla de 44 entradas publicadas, con un 92,5 % de media ponderada, por delante de modelos mucho mayores como gemma4-26b-a4b o qwen3-30b-a3b-instruct.

La especializacion tiene un coste: el modelo solo soporta ingles y pierde algo de conocimiento general respecto a su base (MMLU-Pro 23,3 % frente a 26,4 %). Se distribuye bajo la licencia LFM Open License v1.0, que limita el uso comercial a entidades con ingresos anuales inferiores a 10 millones de dolares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de LiquidAI/LFM3-VL-2B; detalles no disponibles) |
| Parametros totales | 1.728.801.600 (1,7B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (GGUF) |
| Idiomas soportados | Ingles (en) |
| Licencia | LFM Open License v1.0 (lfm1.0); uso comercial limitado a entidades con ingresos anuales < 10 M USD |
| Formato de pesos | GGUF (un unico archivo de ~1,05 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de los pesos del modelo de lenguaje de LiquidAI/LFM3-VL-2B, reexportado como GGUF Q4_0. La model card no detalla la arquitectura interna de la base (tipo de atencion, uso de capas lineales o hibridas, etc.), por lo que ese dato no esta disponible. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset de ajuste fino ni si se emplearon tecnicas de RLHF o DPO.

La innovacion principal no es arquitectonica sino de especializacion: el ajuste se ha orientado a un dominio concreto (Home Assistant) con un formato de salida pensado para voz (frases cortas, sin markdown) y un comportamiento conservador ante la ambiguedad (preguntar en lugar de adivinar cuando hay varios dispositivos candidatos). El modelo base incluye capacidades de vision (VL), pero la model card no indica si el fine-tune conserva o no dichas capacidades; el pipeline declarado es text-generation.

## Capacidades

- Control de dispositivos mediante tool calling / function calling: encendido y apagado, brillo y color, persianas y valvulas a una posicion, ventiladores, reproductores multimedia, aspiradoras y cerraduras, usando los nombres exactos de dispositivo, area y dominio expuestos por el hogar.
- Consulta del estado del hogar: lee el contexto en vivo una vez y responde con una frase corta que incluye valor y unidad; no modifica dispositivos mientras responde preguntas.
- Gestion de listas de tareas: anadir, leer, contar y completar elementos, eligiendo la lista que encaja de forma obvia y preguntando solo cuando dos listas encajan por igual.
- Clarificacion ante ambiguedad: pregunta en lugar de adivinar cuando una suposicion seria incorrecta o insegura (por ejemplo, "cierra la puerta" con varias cerraduras disponibles).
- Rechazo limpio: cuando un dispositivo o una capacidad no esta expuesta, lo indica y sugiere que si puede hacer.
- Salida orientada a voz: frases planas sin markdown; en preguntas ordinarias responde sin invocar herramientas.
- Multilingue: solo ingles.

## Casos de uso

- Asistente de voz para el hogar en hardware de borde: un unico GGUF Q4_0 de 1,05 GB cabe en una Raspberry Pi 5, lo que permite montar un asistente local de Home Assistant sin depender de la nube ni de GPUs dedicadas.
- Control de dispositivos por comando de voz: el modelo traduce "pon el salon al 30 %" al tool call correcto con dominio, area y entidad exactos, lo que encaja en pipelines de Assist de Home Assistant.
- Consultas de estado en tiempo real: "que temperatura hay en la cocina" se resuelve leyendo el contexto en vivo y devolviendo una unica frase con valor y unidad, adecuada para sintesis de voz.
- Gestion de tareas domesticas por voz: anadir, listar, contar y completar elementos de listas de la compra o tareas del hogar, con desambiguacion cuando hay varias listas candidatas.
- Automatizaciones con confirmacion de seguridad: al preguntar en lugar de adivinar ante cerraduras o alarmas ambiguas, el modelo se integra bien en flujos que exigen confirmacion explicita del usuario antes de actuar.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente en formato GGUF, los datos de estado del hogar no salen del dispositivo, lo que resulta adecuado para instalaciones sensibles.
- Prototipado rapido de skills de domotica: el formato de tool calling y el rechazo limpio facilitan integrar el modelo en pipelines de CI para validar nuevas entidades o integraciones antes de exponerlas a los usuarios.

## Benchmarks y rendimiento

Resultados publicados en la model card (estado a 30 de octubre de 2026), sobre los datasets del Home LLM Leaderboard, media ponderada por numero de muestras. Segun el autor, las demas filas se ejecutaron en versiones anteriores de Home Assistant con ajustes por defecto, mientras que v0.1 se ejecuto en Home Assistant 2026.10.3, por lo que la comparacion es indicativa.

| Puesto | Modelo | assist | assist-mini | questions | media |
|---|---|---|---|---|---|
| 1 | muse-glimmer | 90,2 % | 98,0 % | 97,6 % | 94,3 % |
| 2 | gemini-3.1-flash-lite | 87,0 % | 98,0 % | 100,0 % | 93,8 % |
| 3 | gpt-5.4-mini | 87,8 % | 96,9 % | 97,6 % | 93,1 % |
| 4 | gemini-3.5-flash-lite | 88,0 % | 97,4 % | 95,9 % | 92,7 % |
| 5 | lfm3-1.7b-home-assistant v0.1 | 90,5 % | 96,4 % | 93,0 % | 92,5 % |
| 6 | gemini-2.5-flash | 88,7 % | 96,9 % | 94,6 % | 92,4 % |
| 7 | gemma4-26b-a4b | 86,3 % | 98,0 % | 97,0 % | 92,4 % |
| 8 | gemma4-12b | 83,5 % | 97,4 % | 100,0 % | 92,1 % |
| 9 | minimax-m2.5 | 88,5 % | 98,0 % | 93,2 % | 92,0 % |
| 10 | qwen3-30b-a3b-instruct | 83,9 % | 97,4 % | 97,0 % | 91,2 % |
| 20 | qwen3.5-4b | 81,1 % | 88,3 % | 93,8 % | 87,0 % |
| 39 | LiquidAI LFM3-VL-2B QAD Q4_0 (base) | 55,9 % | 80,1 % | 76,2 % | 67,8 % |

Dato adicional de la model card: MMLU-Pro 23,3 % para este fine-tune frente a 26,4 % del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: el unico archivo publicado es Q4_0 de ~1,05 GB; con overhead de contexto y runtime, el consumo tipico se situa en el rango de 1,5-2 GB de memoria, aunque no se publican mediciones oficiales.
- GPU recomendadas: no se especifican; por tamano, cualquier GPU consumer con 4 GB o mas de VRAM es suficiente.
- Cabe en consumer GPU: si, en practicamente cualquier GPU moderna (RTX 3060, RTX 4090, etc.); el autor lo presenta como ejecutable en Raspberry Pi 5, lo que implica que tambien funciona en CPU.
- Opciones de despliegue: llama.cpp y Ollama son las rutas naturales para GGUF; vLLM y TGI no soportan GGUF de forma nativa sin conversion. El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media Home LLM | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lfm3-1.7b-home-assistant | 1,7B | no disponible | 92,5 % | LFM Open v1.0 (comercial < 10 M USD) | GGUF en Hugging Face |
| LiquidAI LFM3-VL-2B (base) | ~2B | no disponible | 67,8 % | LFM Open v1.0 | Hugging Face |
| qwen3.5-4b | 4B | no disponible | 87,0 % | no disponible | Hugging Face |
| gemma4-12b | 12B | no disponible | 92,1 % | no disponible | Hugging Face |

La comparacion con modelos propietarios (gemini, gpt) no es directa porque no se distribuyen como pesos abiertos. Frente a su base, el fine-tune mejora la media de 67,8 % a 92,5 %, a costa de una perdida de conocimiento general (MMLU-Pro 23,3 % frente a 26,4 %).

## Limitaciones y advertencias

- Solo ingles: no soporta castellano ni otros idiomas.
- Perdida de conocimiento general: MMLU-Pro baja de 26,4 % a 23,3 % respecto al modelo base.
- Punto debil en razonamiento multi-paso sobre resultados de herramientas, por ejemplo contar eventos de calendario a lo largo de una semana.
- Riesgo de alucinacion y de objetivo incorrecto, comun en modelos pequenos; el autor recomienda mantener las confirmaciones y los ajustes de exposicion propios de Home Assistant para cerraduras, alarmas y dispositivos de seguridad.
- Licencia restrictiva: LFM Open License v1.0 limita el uso comercial a entidades con ingresos anuales inferiores a 10 millones de dolares; es necesario revisar el archivo LICENSE antes de un despliegue comercial.
- Modelo muy reciente y con poca traccion: 26 descargas y 0 likes en el momento de la consulta; version v0.1, sin historial de produccion.
- No se especifican la longitud de contexto ni el rendimiento en latencia/throughput, datos relevantes para planificar un despliegue real.
- El modelo base es multimodal (VL), pero la model card no aclara si el fine-tune conserva capacidades de vision; el pipeline declarado es text-generation.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Slomin/lfm3-1.7b-home-assistant
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Home LLM Leaderboard (reports): https://github.com/allenporter/home-assistant-datasets/tree/main/reports
- Licencia LFM Open License v1.0: archivo LICENSE dentro del repositorio del modelo
