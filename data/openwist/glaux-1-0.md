# Openwist/Glaux-1.0

## Resumen

Glaux 1.0 es un modelo de asistente virtual de pequeno tamano desarrollado por Openwist, obtenido mediante fine-tuning con LoRA del modelo base LiquidAI/LFM2.5-1.2B-Instruct. El adaptador LoRA (r=16, alpha=32, fp16) se ha fusionado en los pesos del modelo base para facilitar su despliegue en dispositivo (on-device), y el adaptador sin fusionar tambien se distribuye en el subdirectorio `adapter/`. Cuenta con aproximadamente 1.170 millones de parametros y esta orientado a tareas de atencion conversacional con soporte de tool calling.

El modelo se ha disenado explicitamente para ser honesto sobre su naturaleza de IA (nunca simula ser humano), admitir incertidumbre en lugar de inventar, evitar emojis y derivar a atencion humana mediante la herramienta `request_human_support` cuando la peticion lo requiere. Su contexto linguistico declarado es el ingles con enfoque en Kenia, y su licencia es la LFM Open License v1.0, que permite uso comercial gratuito por debajo de 10 millones de USD de ingresos anuales.

Es relevante ahora porque representa un ejemplo de modelo pequeno, desplegable localmente, con un comportamiento guiado por prompt de sistema canonico y con evaluacion centrada en comportamiento (no en capacidad general), lo que resulta util para equipos que necesitan asistentes conversacionales ligeros con control de identidad y derivacion a humanos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (LFM2.5, segun modelo base LiquidAI/LFM2.5-1.2B-Instruct) |
| Parametros totales | 1.170.340.608 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (build cuantizada disponible en Openwist/Glaux-1.0-GGUF); fp16 en transformers |
| Idiomas soportados | Ingles (contexto de Kenia); no evaluado en otros idiomas salvo ejemplos aislados de identidad en suajili |
| Licencia | LFM Open License v1.0 (uso comercial gratuito por debajo de 10M USD de ingresos anuales) |
| Formato de pesos | safetensors (transformers); GGUF (repositorio separado) |

## Arquitectura y entrenamiento

Glaux 1.0 se construye sobre LiquidAI/LFM2.5-1.2B-Instruct, un modelo transformer de aproximadamente 1.170 millones de parametros. El ajuste se realizo con LoRA de rango 16, alpha 32 y precision fp16, y el adaptador resultante se fusiono en los pesos del modelo base para producir un unico modelo listo para inferencia. El adaptador sin fusionar se conserva en el subdirectorio `adapter/` del repositorio. El modelo emplea la plantilla nativa del modelo base, de estilo ChatML, con las herramientas declaradas en el turno de sistema entre `<|tool_list_start|>` y `<|tool_list_end|>`, y las llamadas se emiten como `<|tool_call_start|>[function(arg=value)]<|tool_call_end|>`.

El entrenamiento utilizo 1.868 ejemplos, todos en ingles, compuestos por datos sinteticos generados programaticamente por Openwist: conversaciones con respuestas verificables (aritmetica, unidades, totales por partida doble, simulaciones de herramientas de hoja de calculo, tickets de derivacion) y un conjunto compartido de "comportamiento central de Openwist" que cubre honestidad de identidad, admision de incertidumbre, rechazos educados y ausencia de emojis. Cada turno del asistente se filtro con comprobaciones basadas en reglas para detectar emojis, afirmaciones de humanidad y filtraciones de identidad de terceros, y los prompts de sistema se reescribieron con la nomenclatura propia de Openwist. No se menciona en la informacion disponible el uso de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional orientada a asistencia virtual.
- Tool calling / function calling con una herramienta declarada: `request_human_support` (con argumentos de motivo y resumen).
- Derivacion a atencion humana ante quejas, asuntos de cuenta o seguridad, peticiones fuera de su conocimiento o autoridad, o solicitud explicita del usuario.
- Comportamiento de honestidad de identidad: no afirma ni implica ser humano y confirma ser IA si se le pregunta sinceramente.
- Admision explicita de incertidumbre en lugar de inventar detalles.
- Rechazo educado de peticiones que causarian dano grave, con alternativa mas segura cuando procede.
- Restriccion de estilo: sin emojis, emoticonos ni simbolos decorativos.
- Soporte de conversaciones multi-turno (formato de chat del modelo base).
- Capacidades multilingues limitadas: declarado en ingles; sin evaluacion sistematica en otros idiomas.

## Casos de uso

- Asistencia virtual en aplicaciones locales: el modelo esta disenado para ejecutarse en dispositivo con un prompt de sistema canonico y la herramienta `request_human_support`, adecuado para asistentes embebidos en apps de escritorio o moviles con requisitos de privacidad.
- Triaje y derivacion a soporte humano: cuando la peticion entra en el ambito de quejas, cuentas o seguridad, el modelo emite una llamada a `request_human_support` con motivo y resumen, lo que permite encaminar el ticket a un agente humano de forma estructurada.
- Atencion al cliente de primer nivel: gestiona conversaciones multi-turno en ingles y admite incertidumbre cuando no dispone de informacion, reduciendo respuestas inventadas en consultas rutinarias.
- Simulacion de operaciones con herramientas: los datos de entrenamiento incluyen simulaciones de herramientas de hoja de calculo y totales por partida doble, lo que lo hace util para asistentes que validan calculos sencillos en flujos internos.
- Despliegue con Ollama o llama.cpp: existe una build GGUF con `Modelfile` listo en Openwist/Glaux-1.0-GGUF, lo que facilita prototipos rapidos en entornos locales sin infraestructura GPU dedicada.
- Asistente con control de identidad y estilo: util en productos donde se exige que el asistente nunca se haga pasar por humano y mantenga un tono sin emojis, como entornos corporativos o de compliance.
- Pruebas de concepto de tool calling en modelos pequenos: sirve para validar pipelines de parseo de llamadas a herramientas en formato texto (`parse_tool_calls`) antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Evaluacion automatizada basada en reglas sobre 120 conversaciones reservadas con redaccion no vista, comparando el adaptador con su propio modelo base con el mismo prompt y herramientas:

| Comprobacion | Glaux 1.0 | Modelo base |
|---|---|---|
| Puntuacion global de comportamiento | 96,8% | 80,7% |
| Salida limpia (sin emoji, sin afirmacion de humanidad, sin filtracion de identidad) | 100,0% | 100,0% |
| Herramienta correcta elegida | 93,9% | 58,5% |
| Argumentos de llamada a herramienta validos | 93,9% | 58,5% |
| Sin llamada a herramienta innecesaria | 97,4% | 97,4% |

Recuento de emojis: 0. Afirmaciones de humanidad: 0. Filtraciones de identidad: 0.

El autor advierte que estas comprobaciones miden comportamiento y formato de llamadas a herramientas, y no son un benchmark de capacidad general ni de tareas especificas de Kenia, que estan planificados por separado. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.170 millones de parametros, en fp16 requiere aproximadamente 2,3 GB solo para pesos, mas overhead de activaciones y cache KV; en cuantizacion GGUF de 4 bits se reduce a alrededor de 0,7-0,9 GB de pesos.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, el modelo es apto para GPU de consumo.
- Cabe en GPU de consumo: si, por su tamano (1,2B parametros) es adecuado para GPU consumer con suficiente VRAM; el autor no especifica modelos concretos.
- Opciones de despliegue: transformers (con `AutoModelForCausalLM`), llama.cpp y Ollama mediante la build GGUF de Openwist/Glaux-1.0-GGUF con `Modelfile` incluido.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Glaux 1.0 (Openwist) | 1,17B | no disponible | Asistente virtual con tool calling y derivacion a humanos | LFM Open License v1.0 (comercial < 10M USD) | Hugging Face (safetensors y GGUF) |
| LiquidAI/LFM2.5-1.2B-Instruct (modelo base) | ~1,2B | no disponible | Instruccion general | LFM Open License v1.0 | Hugging Face |
| Alternativas de ~1B con tool calling | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento de modelos comparables de la misma categoria para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Los datos de entrenamiento son en gran medida basados en plantillas, por lo que la variedad de redaccion es menor que la del texto real de usuarios; se espera un comportamiento mas debil ante formulaciones inusuales.
- Los modelos pequenos pueden equivocarse con seguridad; deben verificarse los resultados importantes.
- No es sustituto de un profesional cualificado; el autor excluye explicitamente decisiones medicas, legales o financieras sin profesional, la validacion de ingenieria de seguridad critica y cualquier uso en el que se haga creer al usuario que habla con una persona.
- No evaluado en idiomas distintos del ingles mas alla de unos pocos ejemplos de identidad en suajili.
- La licencia LFM Open License v1.0 impone un umbral de ingresos anuales (10M USD) para el uso comercial gratuito; el usuario es responsable de cumplirla, incluidos los archivos `LICENSE` y `NOTICE`.
- Las evaluaciones publicadas miden comportamiento y formato de tool calling, no capacidad general; no deben interpretarse como indicador de rendimiento en tareas abiertas.
- El modelo solo declara una herramienta (`request_human_support`); no se ha evaluado con conjuntos de herramientas mas amplios.
- Riesgo de alucinacion presente como en cualquier modelo de este tamano, mitigado parcialmente por el entrenamiento en admision de incertidumbre pero no eliminado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Openwist/Glaux-1.0
- Build GGUF: https://huggingface.co/Openwist/Glaux-1.0-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Perfil del autor: https://huggingface.co/Openwist
