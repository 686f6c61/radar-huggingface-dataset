# SecureAI-SE/qwen3-4b-c-repair-lora

## Resumen

qwen3-4b-c-repair-lora es un adaptador LoRA de rango 32 sobre el modelo base Qwen/Qwen3-4B, desarrollado por SecureAI-SE en el contexto del curso *LLMs for Security Engineers* de Secure AI. Su proposito es concreto: reparar funciones C pequenas que contienen un unico bug de seguridad, aplicando el cambio minimo necesario. No es un modelo generalista, sino un ajuste fino especializado en una tarea de reparacion de codigo con validacion formal de la correccion.

El adaptador se entrena en dos fases: primero un SFT sobre las correcciones de referencia de 1.329 bugs de entrenamiento, y despues un ajuste con GRPO (Group Relative Policy Optimization) sobre las 946 funciones que el modelo SFT solo resolvia de forma intermitente. La recompensa del RL combina cuatro criterios objetivos: que el parche sea pequeno, que compile, que la entrada que dispara el bug se ejecute limpia bajo AddressSanitizer y UBSan, y que una bateria de entradas de uso normal siga produciendo la salida correcta.

El resultado es un adaptador ligero (repo de 0,1 GB) que mejora de forma medible al modelo base en la tarea: pass@1 pasa de 0,247 a 0,509 y pass@8 de 0,371 a 0,897 sobre 116 bugs reservados. Es relevante para desarrolladores e investigadores que quieran evaluar tecnicas de RL aplicadas a seguridad de codigo, o integrar un corrector de bugs C en pipelines de analisis estatico, siempre con las cautelas de alcance que el propio autor declara.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer Qwen3-4B |
| Parametros totales | Adaptador de rango 32 sobre Qwen3-4B; numero exacto de parametros del adaptador no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Heredada del modelo base Qwen3-4B; valor exacto no disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del despliegue del base) |
| Idiomas soportados | No disponibles (la tarea es codigo C; el prompt de entrenamiento esta en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B, un transformer denso de 4.000 millones de parametros. El LoRA final es de rango 32, obtenido tras fusionar las dos etapas de entrenamiento y reexpresar la actualizacion de pesos como un unico adaptador mediante SVD. La primera etapa consistio en un SFT con LoRA r16, una epoca, sobre las correcciones de referencia de 1.329 bugs, con perdida calculada solo sobre la respuesta y learning rate de 1e-4. La segunda etapa aplico GRPO durante 60 pasos, con 4 bugs y 8 correcciones por paso, learning rate de 1e-5 y coeficiente KL beta de 0,04, sobre los 946 bugs que el modelo SFT resolvia solo a veces.

La innovacion principal esta en la funcion de recompensa del GRPO, que no depende de un juez neuronal sino de verificacion ejecutable: el parche debe ser pequeno, compilar, hacer que la entrada que dispara el bug se ejecute limpia bajo AddressSanitizer y UBSan, y mantener la salida correcta en 2-4 entradas de uso normal. El prompt de inferencia desactiva el modo thinking y exige que la respuesta sea unicamente la funcion C corregida completa dentro de un bloque de codigo, lo que simplifica el parseo y la validacion automatica.

## Capacidades

- Reparacion de funciones C con un unico bug de seguridad, devolviendo la funcion completa corregida con el cambio minimo.
- Generacion de codigo C con inclusion de las lineas de struct o #include necesarias para compilar.
- Razonamiento guiado por verificacion: el entrenamiento con GRPO optimiza parches que pasan sanitizadores (ASan, UBSan) y pruebas funcionales.
- Salida estructurada en un unico bloque de codigo C, apta para extraccion automatica.
- Modo no-thinking forzado en el prompt de entrenamiento.
- No se documentan capacidades de tool calling, agentes, vision, audio ni multilingues mas alla del modelo base.

## Casos de uso

- Correccion automatizada en pipelines de CI: integrar el adaptador como paso previo a la revision humana para proponer parches a funciones C marcadas por analizadores estaticos, validando el resultado con ASan y UBSan antes de abrir un pull request.
- Formacion en seguridad de codigo: usar el adaptador como referencia en el curso *LLMs for Security Engineers* para comparar con las ejecuciones GRPO que entrenan los alumnos.
- Investigacion en RL para codigo: servir de baseline reproducible para experimentar con funciones de recompensa basadas en verificacion ejecutable en lugar de jueces neuronales.
- Generacion de datasets de parches: producir candidatos de correccion que, tras pasar el checker, alimenten corpus de entrenamiento o evaluacion de otros modelos.
- Asistencia a revisores de codigo: sugerir el cambio minimo sobre una funcion sospechosa, reduciendo el tiempo de diagnostico en revisiones de seguridad.
- Prototipado de herramientas de reparacion automatica: evaluar la viabilidad de un corrector especializado antes de invertir en un modelo mayor o en un pipeline propio.

## Benchmarks y rendimiento

Evaluacion sobre 116 bugs reservados (nunca vistos en entrenamiento), 8 correcciones por bug a temperatura 0,8, con el checker del laboratorio del curso:

| Modelo | pass@1 (fixes que pasan todas las comprobaciones) | pass@8 (bugs con al menos un fix valido en 8) |
|---|---|---|
| Qwen3-4B (base) | 0,247 | 0,371 |
| + SFT | 0,483 | 0,879 |
| + SFT y GRPO (este adaptador) | 0,509 | 0,897 |

## Requisitos de hardware

- VRAM estimada: depende del despliegue del base Qwen3-4B; en fp16 en torno a 8-9 GB solo para pesos, mas overhead de contexto y del adaptador LoRA (que anade poco). Cifra exacta no disponible en la informacion proporcionada.
- GPU recomendadas: A100 o H100 para servicio de alta concurrencia; RTX 4090 (24 GB) suficiente para inferencia en fp16 o cuantizada.
- Cabe en GPU de consumo: si, en tarjetas con 12-24 GB segun cuantizacion del base; el adaptador en si ocupa muy poco (repo de 0,1 GB).
- Opciones de despliegue: vLLM con `enable_lora=True` y `max_lora_rank=32` (ejemplo oficial del autor); tambien compatible con el ecosistema PEFT/Hugging Face Transformers. Soporte en llama.cpp u Ollama no documentado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-c-repair-lora | Adaptador r32 sobre Qwen3-4B | Heredado del base (no disponible) | Reparacion de bugs C con RL verificado | Apache-2.0 | Hugging Face (PEFT) |
| Qwen3-4B (base) | 4.000 M | No disponible | Modelo generalista | Apache-2.0 | Hugging Face |
| Qwen3-4B + SFT (etapa intermedia) | Adaptador r16 sobre Qwen3-4B | Heredado del base | Reparacion de bugs C solo con SFT | Apache-2.0 | No distribuido como artefacto independiente en la informacion disponible |

No se dispone de datos de otros modelos especializados en reparacion de codigo C comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El benchmark es in-distribution: los bugs reservados provienen del mismo generador sintetico y de las mismas 15 clases de bug que los de entrenamiento, por lo que el rendimiento en codigo real puede ser inferior.
- No se ha probado sobre CVEs reales; el autor lo declara explicitamente.
- "Corregido" significa que la entrada que dispara el bug se ejecuta limpia y 2-4 entradas normales siguen dando la salida correcta; no es una prueba de que toda entrada maliciosa quede cubierta.
- Riesgo de alucinacion: puede generar parches que compilen pero no eliminen la vulnerabilidad, o que introduzcan cambios no deseados; la validacion automatica es imprescindible.
- Alcance limitado a funciones C pequenas con un unico bug; no se documenta soporte para otros lenguajes ni para multiples bugs simultaneos.
- Ejecutar siempre el codigo generado en un sandbox; el propio autor lo advierte.
- Sesgos especificos no documentados en la informacion proporcionada.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3-4B debe cumplir su propia licencia.

## Enlaces

- Hugging Face: https://huggingface.co/SecureAI-SE/qwen3-4b-c-repair-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Contacto del autor: thomas@secureai.se (curso *LLMs for Security Engineers* de Secure AI)
- Paper, blog o repositorio adicionales: no disponibles en la informacion proporcionada.
