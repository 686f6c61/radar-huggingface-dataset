# PromptExecutionAU/wattson-granite-4.2-8b-py

## Resumen

Wattson-granite-4.2-8b-py es un modelo de generación de texto fine-tuned a partir de IBM Granite 4.2 8B, desarrollado por PromptExecutionAU como parte del proyecto WattsOn / wattson. Su particularidad es que está especializado en responder preguntas de flujo de potencia AC sobre redes de transmisión eléctrica, pero con un enfoque híbrido: el modelo nunca calcula números por sí mismo, sino que escribe código Python que invoca un solver real (pandapower) mediante una herramienta `run_python`. Esto lo sitúa en la línea de investigación sobre razonamiento numérico anclado en herramientas (tool-grounded numerical reasoning).

El ajuste fino se realizó mediante LoRA (r=32, alpha=64, fusionado a bf16) sobre 826 trayectorias generadas por un script oráculo determinista que ejecuta el solver real, sin texto generado por otros modelos. Los datos proceden de redes sintéticas CSIRO Synthetic-NEM-2000-Bus y casos de pandapower. En evaluación sobre redes no vistas, el modelo resuelve correctamente tareas de ajuste de escala de carga, reportes de contingencias N-1 y planificación multi-candidato, aunque muestra debilidad en la negativa de tareas con elementos inexistentes.

Es relevante como ejemplo de especialización vertical con grounding en herramientas: en lugar de confiar en la aritmética interna del LLM, delega todos los cálculos numéricos en un solver verificado, lo que elimina casi por completo la alucinación de cifras (0 de 90 respuestas evaluadas contienen un número no proporcionado por una herramienta o el prompt).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Granite 4.2), fine-tuned con LoRA fusionado |
| Parametros totales | 8.791.592.960 (~8,79 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 8192 tokens (longitud usada en el entrenamiento; la del modelo base no se especifica) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, LoRA ya fusionado) |

## Arquitectura y entrenamiento

El modelo parte de `ibm-granite/granite-4.2-8b` (revision `b3791992239dce12d0038f1f54a8adb7b02d59ab`), un transformer decoder de unos 8 B de parametros. Sobre el se aplico un fine-tuning LoRA con r=32 y alpha=64 sobre todas las proyecciones de atencion y MLP, durante 2 epocas con learning rate 1e-4 en schedule coseno, longitud de secuencia 8192 y semilla 42. Los pesos LoRA se fusionaron y publicaron en bf16, de modo que el repositorio es un modelo completo autocontenido (18,0 GB) compatible con la libreria `transformers`.

El conjunto de entrenamiento son 826 trayectorias escritas por un oraculo: un script determinista que ejecuta el solver real y produce los programas Python, las respuestas de las herramientas y las respuestas finales, sin texto generado por modelos. Las redes usadas son la CSIRO Synthetic-NEM-2000-Bus (CC BY 4.0) y casos de pandapower; las redes de evaluacion held-out no aparecen en las filas de entrenamiento. No consta el uso de RLHF ni DPO. La innovacion central es la interaccion con una herramienta `run_python`: un shell Python restringido (`python -I`) con un modulo `solver` que expone `solver.trial(...)` (ejecuta un flujo de potencia AC en pandapower) y `solver.exists(...)` (verifica la existencia de una linea o barra), con allowlist de modulos, limite de tiempo de reloj y limite de memoria.

## Capacidades

- Escritura de codigo Python para invocar un solver de flujo de potencia AC (pandapower) en lugar de calcular numeros internamente.
- Ajuste de escala de carga (load scaling) para alcanzar un objetivo de tension en la red.
- Generacion de reportes de contingencia N-1 sobre redes de transmision.
- Comparacion de multiples apagones (outages) para identificar el peor caso (tarea de juicio).
- Planificacion multi-candidato sobre escenarios con varias opciones.
- Rechazo de tareas que nombran elementos (lineas o barras) inexistentes, verificandolo con `solver.exists(...)`.
- Tool calling nativo: el modelo fue entrenado especificamente con la herramienta `run_python` y conversaciones multi-turno con respuestas de herramienta.
- Razonamiento multi-paso: encadena llamadas al solver (prueba, verificacion, ajuste) antes de responder.
- Generacion de texto conversacional en ingles; no hay capacidades multimodales (vision, audio) documentadas.

## Casos de uso

- Investigacion en razonamiento numerico anclado en herramientas: sirve como modelo de referencia para estudiar como un LLM puede delegar aritmetica en un solver verificado y evitar alucinar cifras.
- Benchmark WattsOn: esta diseñado para ejecutarse dentro del harness de evaluacion del proyecto, respondiendo tareas tipificadas de flujo de potencia sobre redes held-out.
- Prototipado de asistentes para analisis de redes electricas: puede integrarse en pipelines academicos que necesiten responder preguntas de tipo "que escala de carga produce esta tension" o "cual es el peor contingencia N-1" ejecutando pandapower bajo el capo.
- Estudio de destilacion de recetas de entrenamiento: la misma receta (trayectorias oraculo + LoRA) se ha aplicado a estudiantes Qwen3.5-4B, por lo que este modelo es util como comparador de tamano para investigar el efecto de la escala.
- Demostracion de refusal grounding: caso de estudio para entrenar modelos que verifican la existencia de entidades antes de responder, en lugar de inventar identificadores.
- Base para agentes de dominio estrecho: su patron (LLM escribe codigo, herramienta ejecuta, modelo interpreta) es reutilizable en otros dominios con solvers numericos (quimica, circuitos, optimizacion).
- Educacion en ingenieria electrica: puede usarse en entornos de laboratorio para generar y explicar scripts de pandapower sobre redes sinteticas, siempre como material didactico y no operativo.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre redes held-out (una sola semilla):

| Suite | Resultado |
|---|---|
| Held-out fits and reports (90 tareas) | 90 de 90 |
| Smoke (20 tareas) | 20 de 20 |
| Judgement: worst outage (40 tareas) | 36 de 40 |
| Unsolvable: must refuse (28 tareas) | 14 de 28 |
| Planning: multi-candidate (40 tareas) | 40 de 40 |
| Held-out con numeros no provistos por herramienta o prompt (90 tareas) | 0 de 90 |
| Derived-arithmetic suite (40 tareas) | no ejecutada aun |

No hay comparativas publicadas con otros modelos en las mismas suites (salvo la nota de que estudiantes Qwen3.5-4B con la misma receta varian hasta 9 tareas entre semillas en la suite unsolvable). No se han publicado resultados en benchmarks genericos (MMLU, HumanEval, GSM8K, etc.) para este fine-tune.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 18 GB solo de pesos, mas overhead de KV cache y runtime; en la practica se recomienda una GPU con 24 GB de VRAM.
- GPUs recomendadas: RTX 3090 / RTX 4090 (24 GB) para inferencia local, o A100 / H100 para servirse con batch y contexto completo de 8192 tokens.
- Cabe en una GPU de consumo de 24 GB (RTX 3090/4090) en bf16; con cuantizacion a 4 bits (no publicada oficialmente, pero factible con GGUF/AWQ/GPTQ) cabria en GPUs de 8-12 GB, aunque no hay pesos cuantizados oficiales.
- Opciones de despliegue: `transformers` (libreria nativa declarada), y por compatibilidad general de arquitectura Granite deberia funcionar con vLLM, TGI, llama.cpp (previa conversion a GGUF) u Ollama; el repositorio indica `endpoints_compatible`. Es imprescindible exponer la herramienta `run_python` (shell restringido con modulo `solver`) para reproducir su comportamiento esperado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wattson-granite-4.2-8b-py | 8,79 B | 8192 (entrenamiento) | Flujo de potencia AC con tool calling (pandapower) | Apache-2.0 | Hugging Face, safetensors bf16 |
| ibm-granite/granite-4.2-8b (base) | ~8 B | no disponible en la informacion proporcionada | Modelo general con tool calling | Apache-2.0 | Hugging Face |
| Estudiantes Qwen3.5-4B (misma receta, proyecto wattson) | ~4 B | no disponible | Misma tarea de razonamiento anclado en solver | no disponible | Mencionados en la model card del proyecto |

Comparado con su modelo base, este fine-tune sacrifica generalidad a cambio de fiabilidad extrema en su dominio estrecho (cero numeros alucinados en las suites evaluadas). Comparado con los estudiantes Qwen3.5-4B de la misma receta, ofrece el doble de parametros, lo que presumiblemente aporta mayor estabilidad, aunque el propio autor advierte de la variabilidad entre semillas en la suite de rechazo.

## Limitaciones y advertencias

- No es una herramienta de ingenieria de sistemas de potencia: sus respuestas no deben usarse para decisiones operativas reales.
- El shell Python que invoca no es una frontera de seguridad: es un `python -I` restringido con allowlist de modulos y limites de tiempo y memoria; no debe exponerse a entrada no confiable.
- La capacidad mas debil es el rechazo de tareas con elementos inexistentes (14 de 28), y el propio autor advierte que ese resultado no es estable entre semillas.
- Evaluado solo en flujo de potencia AC y sobre un numero reducido de redes; no hay garantias fuera de ese dominio.
- Entrenado con una sola semilla; la suite de aritmetica derivada aun no se ha ejecutado, por lo que su rendimiento en ese eje es desconocido.
- Limitado al ingles; no hay soporte documentado para castellano ni otros idiomas.
- Alucinacion numerica practicamente eliminada dentro del harness (0 de 90), pero ese resultado depende de que el modelo tenga acceso a las herramientas; sin ellas, no hay garantias.
- Licencia Apache-2.0: permite uso comercial sin restricciones significativas mas alla de conservar avisos.
- El riesgo de alucinacion de texto (no numerico) no se evalua explicitamente en las suites publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PromptExecutionAU/wattson-granite-4.2-8b-py
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-8b
- Repositorio del proyecto (codigo, harness y `docs/results.md`): https://github.com/fungible-farm/wattson
- Dataset de redes CSIRO Synthetic-NEM-2000-Bus: no disponible (no se proporciona enlace directo en la model card)
- Paper: no disponible
