# MaTa31/moli-home-1.7b-v4

## Resumen

Moli Home 1.7B v4 es un modelo de lenguaje de 1.720.574.976 parametros desarrollado por MaTa31, derivado mediante fine-tuning LoRA del modelo base Qwen/Qwen3-1.7B. Su proposito es muy concreto: reconocer peticiones en frances dirigidas a un sistema domotico y emitir una llamada a una unica herramienta del contrato `moli-v4`, compuesto por 25 herramientas. Moli OS se encarga de ejecutar la accion bajo sus propias salvaguardas (habitaciones protegidas, horas de silencio, validaciones) y de formular la respuesta final al usuario.

El modelo no esta disenado como asistente conversacional general. Su funcion es actuar como capa de interpretacion de intenciones dentro de la arquitectura de Moli OS: el modelo nunca ve valores reales de la vivienda y Moli no lee literalmente las frases que este genera. Esta restriccion de diseno reduce la superficie de riesgo en un dominio sensible como es el control de dispositivos del hogar.

La relevancia actual del modelo reside en su enfoque de especializacion extrema en un dominio acotado con un contrato de herramientas fijo, empaquetado en formato GGUF Q4_K_M de 1,1 GB y distribuido bajo licencia Apache-2.0. Su utilidad queda limitada al ecosistema Moli OS y al contrato `moli-v4`; fuera de ese contexto el modelo carece de aplicacion practica segun su propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen/Qwen3-1.7B) con fine-tuning LoRA fusionado |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (unica cuantizacion publicada en el repo) |
| Idiomas soportados | frances (fr) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`moli-home-1.7b-v4-q4_k_m.gguf`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B con la reflexion (thinking mode) desactivada y se afina mediante LoRA en bf16 con rango r = 16 aplicado a todas las capas lineales. La perdida se calcula unicamente sobre la respuesta, y el adaptador se fusiona posteriormente en los pesos base. Los datos de entrenamiento son exclusivamente sinteticos: viviendas ficticias y frases generadas por la herramienta `tools/model/` del repositorio de Moli OS. No se emplearon datos de viviendas reales.

El entrenamiento esta orientado al contrato `moli-v4`, que define los nombres y parametros de 25 herramientas, junto con un prompt estatico de la casa en el que los dispositivos aparecen numerados como `d1...dN`. El `Modelfile` de Ollama fija la plantilla de conversacion tal como se uso en el entrenamiento (herramientas antes del prompt de la casa); sustituirla por la plantilla por defecto de Qwen3 degrada la precision de forma significativa, segun advierte el autor. No se documentan en la informacion disponible detalles sobre el volumen total de tokens de entrenamiento, la composicion exacta del dataset sintetico ni el uso de RLHF o DPO.

## Capacidades

- Reconocimiento de intenciones domoticas en frances y emision de una llamada a herramienta del contrato `moli-v4` (25 herramientas).
- Function calling restringido al esquema fijo del contrato; no admite herramientas nuevas sin reentrenamiento.
- Ejecucion de peticiones compuestas simples con pocas llamadas encadenadas (por ejemplo, encender el salon y bajar la persiana).
- Generacion de texto limitada: fuera del ambito del hogar devuelve una respuesta fija.
- Sin soporte de conversacion libre, razonamiento general, codigo, matematicas, vision ni audio.
- Sin capacidades multilingues: unicamente frances.
- Integracion con Moli OS a traves de la API compatible con Ollama (`/v1`).

## Casos de uso

- Control por voz o texto del hogar en frances: el modelo interpreta ordenes como "eteins le salon" o "quelle temperature dans la cuisine ?" y emite la llamada de herramienta correspondiente, que Moli OS ejecuta bajo sus validaciones.
- Consulta de estado de dispositivos: el modelo traduce preguntas sobre temperatura o estado de sensores en la herramienta adecuada, sin exponer valores reales de la vivienda al modelo.
- Renombrado y gestion de dispositivos: permite renombrar lamparas u otros aparatos mediante la herramienta correspondiente del contrato, manteniendo la nomenclatura `d1...dN` de la casa.
- Automatizaciones compuestas simples: peticiones del tipo "allume le salon et ferme le volet" se resuelven con un pequeno numero de llamadas encadenadas dentro de una misma interaccion.
- Despliegue local en hardware modesto: con un unico GGUF Q4_K_M de 1,1 GB, el modelo puede ejecutarse en un equipo domestico mediante Ollama, lo que encaja con el caracter local y privado de Moli OS.
- Escenarios de privacidad estricta: al no ver valores de la casa y al no ser leido literalmente por Moli, el modelo encaja en instalaciones donde se exige que los datos del hogar no salgan del dispositivo.
- Prototipado de asistentes de domotica con contrato de herramientas fijo: sirve como referencia de diseno para sistemas que separan interpretacion de intenciones y ejecucion con salvaguardas.

## Benchmarks y rendimiento

| Metrica | Resultado | Conjunto |
|---|---|---|
| Llamadas exactas a herramienta | 94,2 % | Juego de test sintetico retenido |
| Acciones erroneas | 0 | Juego de test sintetico retenido |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB para el GGUF Q4_K_M publicado, mas el overhead del runtime y del contexto.
- Cabe en GPU de consumo: si, en cualquier GPU con al menos 2 GB de VRAM efectiva; tambien es viable en CPU.
- GPU recomendadas: no se especifican en la informacion disponible; por tamano, cualquier GPU moderna de consumo es suficiente.
- Opciones de despliegue: Ollama (metodo documentado por el autor mediante `Modelfile`); llama.cpp es compatible por el formato GGUF. vLLM y TGI no estan documentados para este artefacto.
- Latencia y throughput: no disponibles. El autor advierte que el primer turno tras un arranque es mas lento porque Moli hace leer el prompt de la casa al modelo una vez, tras lo cual queda en cache.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Moli Home 1.7B v4 | 1.720.574.976 | no disponible | fr | Apache-2.0 | Function calling domotico, contrato `moli-v4` |
| Qwen/Qwen3-1.7B (base) | 1.720.574.976 (aproximado, mismo orden) | no disponible | multilingue | Apache-2.0 | Modelo generalista con modo reflexion |
| Alternativas de function calling de ~1-2B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa con otros modelos especializados en domotica no esta disponible en la informacion proporcionada. Frente a su modelo base Qwen3-1.7B, Moli Home sacrifica capacidades generales y multilingues a cambio de una precision del 94,2 % en llamadas exactas dentro de su contrato fijo.

## Limitaciones y advertencias

- Una peticion corresponde a una llamada de herramienta (como maximo unas pocas para ordenes compuestas); no soporta conversacion libre.
- Una pregunta fuera del ambito del hogar recibe una respuesta fija.
- Solo frances; sin soporte de otros idiomas.
- Vinculado al contrato `moli-v4`: cualquier herramienta nueva requiere un nuevo modelo.
- Inutil fuera de Moli OS, segun la propia model card.
- Entrenado exclusivamente con datos sinteticos; el comportamiento en viviendas reales con nomenclaturas atipicas no esta documentado.
- No se deben sustituir las plantillas de conversacion por las de Qwen3 por defecto: la precision cae.
- Riesgo de alucinacion en llamadas de herramienta no cuantificado fuera del test sintetico; el diseno mitiga el impacto porque Moli ejecuta bajo sus propias salvaguardas y no lee literalmente la salida del modelo.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia Apache-2.0, permisiva para uso comercial, heredada de Qwen3-1.7B.
- Verificar la integridad del artefacto con el SHA-256 indicado (`1e11026d6729ad589c4c3f076cd68534b7a9563efc0a9c967d2ae4136cf0e3c9`) y el fichero `SHA256SUMS`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MaTa31/moli-home-1.7b-v4
- Modelo base Qwen/Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio Moli OS: https://github.com/rudy-io/moli-os
