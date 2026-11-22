# Openwist/Aletheia-1.0

## Resumen

Aletheia 1.0 es un adaptador LoRA desarrollado por Openwist AI sobre el modelo base LiquidAI/LFM2.5-1.2B-Instruct, un transformer de 1.200 millones de parametros disenado por Liquid AI. El adaptador se ha entrenado para reforzar un comportamiento de asistente general orientado a la honestidad: no fingir ser humano, admitir incertidumbre, evitar emojis y no reclamar capacidades que no tiene (navegacion, memoria entre sesiones o herramientas no proporcionadas). Su proposito principal es el despliegue en dispositivo (on-device), en aplicaciones que ejecutan modelos pequenos localmente.

El modelo se distribuye como adaptador PEFT (LoRA con r=16 y alpha=32, entrenado en fp16) y requiere cargar el modelo base por separado. La longitud de contexto, el numero exacto de parametros del base y los tipos de cuantizacion no se detallan en la informacion disponible; el adaptador anade un numero reducido de parametros entrenables sobre el modelo base de 1.2B.

Su relevancia actual reside en la combinacion de un modelo pequeno (apto para hardware de consumo) con un conjunto de comportamientos verificables y medibles mediante comprobaciones automatizadas, lo que lo hace util como punto de partida para asistentes locales con requisitos estrictos de honestidad y formato de tool calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer LiquidAI/LFM2.5-1.2B-Instruct |
| Parametros totales | no disponible (modelo base de 1.2B; el adaptador LoRA anade parametros entrenables no cuantificados en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenado en fp16; el modelo base admite las cuantizaciones que soporte su ecosistema) |
| Idiomas soportados | ingles (contexto keniata); no evaluado en otros idiomas salvo ejemplos puntuales de identidad en suajili |
| Licencia | LFM Open License v1.0 (uso comercial gratuito por debajo de 10M USD de ingresos anuales) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base en formato transformers |

## Arquitectura y entrenamiento

El adaptador se construye sobre LFM2.5-1.2B-Instruct de Liquid AI y se entrena como LoRA con rango 16 y alpha 32 en fp16. Utiliza la plantilla nativa ChatML-style del modelo base. Las herramientas se declaran en el turno de sistema entre `<|tool_list_start|>` y `<|tool_list_end|>`, y las llamadas se emiten como `<|tool_call_start|>[function(arg=value)]<|tool_call_end|>`.

El entrenamiento empleo 1.482 ejemplos, todos en ingles. Los datos son en su mayoria sinteticos y generados programaticamente por Openwist: conversaciones con respuestas verificables (aritmetica, conversiones de unidades, totales por partida doble, simulaciones de herramientas de hoja de calculo y tickets de derivacion), junto con un conjunto de "comportamiento central de Openwist" que cubre honestidad de identidad, admision de incertidumbre, rechazos corteses y ausencia de emojis. Cada turno del asistente se filtro con comprobaciones basadas en reglas para detectar emojis, afirmaciones de humanidad y filtraciones de identidad de terceros; ademas, los system prompts se reescribieron con la nomenclatura propia de Openwist. No se menciona uso de RLHF ni DPO.

## Capacidades

- Generacion de texto conversacional como asistente general en ingles.
- Tool calling / function calling con formato estructurado (`<|tool_call_start|>` ... `<|tool_call_end|>`) y lista de herramientas en el turno de sistema.
- Razonamiento aritmetico basico, conversiones de unidades y calculos de totales (partida doble).
- Simulacion de uso de herramientas de hoja de calculo y generacion de tickets de derivacion.
- Comportamiento de honestidad: admite incertidumbre, no afirma ser humano, no reclama capacidades inexistentes y se autocorrige.
- Restriccion estricta de formato: sin emojis, emoticonos ni simbolos decorativos.
- Rechazos corteses ante peticiones que causarian dano grave, con alternativa segura cuando existe.
- No dispone de vision, audio, thinking mode explicito ni memoria entre sesiones.

## Casos de uso

- Asistentes locales en dispositivo: el modelo esta pensado para ejecutarse en aplicaciones que corren modelos pequenos localmente, aprovechando el tamano de 1.2B del base para despliegue en hardware modesto.
- Automatizacion de calculos verificables: conversiones de unidades, aritmetica y totales por partida doble, donde el modelo se ha entrenado con respuestas comprobables y puede integrarse en flujos de validacion.
- Simulacion de herramientas de hoja de calculo: generacion de llamadas a funciones para manipular datos tabulares en pipelines internos, con formato de tool call parseable.
- Gestion de tickets de derivacion (hand-off): el modelo puede generar tickets estructurados para escalar casos a un operador humano, alineado con su comportamiento de no fingir capacidades.
- Asistentes con requisitos estrictos de honestidad: aplicaciones donde es critico que el modelo no se haga pasar por humano ni invente haber realizado acciones, gracias al system prompt canonico y al filtrado de entrenamiento.
- Interfaces conversacionales con formato controlado: entornos que exigen salida sin emojis ni simbolos decorativos (por ejemplo, canales tecnicos o institucionales).
- Prototipado rapido de agentes con tool calling: el repositorio incluye helpers de renderizado de prompt y parseo de llamadas (`openwist_pipeline.py`), lo que facilita integrar el adaptador en flujos de agente multi-paso basicos.

## Benchmarks y rendimiento

Evaluacion automatizada basada en reglas sobre 118 conversaciones reservadas con redaccion no vista, comparando el adaptador con su propio modelo base usando el mismo prompt y herramientas:

| Comprobacion | Aletheia 1.0 | Modelo base |
|---|---|---|
| Puntuacion global de comportamiento | 100,0% | 98,7% |
| Salida limpia (sin emoji, sin afirmacion de humanidad, sin filtracion de identidad) | 100,0% | 97,5% |
| Sin llamada a herramienta innecesaria | 100,0% | 100,0% |

Recuento adicional: 0 emojis, 0 afirmaciones de humanidad, 0 filtraciones de identidad. El autor advierte explicitamente que estas comprobaciones miden comportamiento y formato de tool call, no capacidad general ni tareas especificas de Kenia, que se planifican por separado. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un modelo base de 1.2B en fp16, la huella ronda los 2,4 GB de pesos, mas overhead de activaciones y cache KV. En cuantizaciones de 8 o 4 bits del base la huella seria considerablemente menor.
- GPU recomendadas: no especificadas por el autor; por tamano, el modelo base de 1.2B es apto para GPU de consumo.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 4-8 GB de VRAM o mas, segun cuantizacion (dato no confirmado por el autor).
- Opciones de despliegue: el ejemplo oficial usa `transformers` + `peft` con `device_map="auto"`. No se mencionan vLLM, llama.cpp, Ollama ni TGI; al ser un adaptador LoRA sobre transformers, requeriria fusion con el base o soporte de adaptadores en el servidor de inferencia.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aletheia 1.0 (Openwist) | 1.2B (base) + LoRA | no disponible | Asistente honesto on-device con tool calling | LFM Open License v1.0 | Hugging Face (adaptador PEFT) |
| LiquidAI/LFM2.5-1.2B-Instruct | 1.2B | no disponible | Modelo base instructivo | LFM Open License v1.0 | Hugging Face |
| Alternativas de ~1B-2B para on-device | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Los datos de entrenamiento son en gran medida basados en plantillas, por lo que la variedad de redaccion es mas estrecha que el texto real de usuarios; se espera un comportamiento mas debil ante formulaciones inusuales.
- Los modelos pequenos pueden equivocarse con confianza; es necesario verificar resultados importantes.
- No es sustituto de un profesional cualificado; el autor excluye explicitamente decisiones medicas, legales o financieras sin supervision profesional, la validacion en ingenieria de seguridad critica y cualquier uso en el que el usuario deba creer que habla con una persona.
- No evaluado en idiomas distintos del ingles, salvo ejemplos puntuales de identidad en suajili.
- La licencia LFM Open License v1.0 impone un umbral de ingresos anuales de 10M USD para uso comercial gratuito; por encima de ese umbral es responsabilidad del usuario cumplir con los terminos adicionales.
- Al ser un adaptador LoRA, requiere cargar el modelo base por separado y respetar tambien la licencia del base.
- El repositorio figura con 0 descargas y 0 likes, y el tamano reportado es de 0.0 GB; conviene verificar la integridad de los pesos antes de usarlo en produccion.
- Riesgo de alucinacion presente como en cualquier modelo de este tamano; el entrenamiento mitiga afirmaciones de capacidades inexistentes, pero no elimina errores factuales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Openwist/Aletheia-1.0
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Organizacion Openwist: https://huggingface.co/Openwist
- Helper de inferencia y parseo de tool calls: `openwist_pipeline.py` en el repositorio del adaptador
- Licencia LFM Open License v1.0: archivos `LICENSE` y `NOTICE` del repositorio
