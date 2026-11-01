# PromptExecutionAU/wattson-qwen3.5-4b-pyt

## Resumen

Wattson-qwen3.5-4b-pyt es un ajuste fino (fine-tuning) de Qwen3.5-4B desarrollado por PromptExecutionAU como parte del proyecto WattsOn/wattson. Su propósito es resolver preguntas de flujo de potencia en corriente alterna (AC power-flow) sobre redes electricas, y lo hace de una forma particular: el modelo no calcula numeros por si mismo, sino que genera razonamiento en prosa ("scripted thinking") y escribe codigo Python que invoca un solver externo mediante una shell `run_python`. De este modo, todos los resultados numericos provienen de una herramienta determinista y no de la generacion del propio modelo.

El modelo se entreno con LoRA (r=32, alpha=64) sobre la revision `851bf6e` de `Qwen/Qwen3.5-4B`, con 826 trayectorias guiadas por un programa oraculo, y los adaptadores se fusionaron a bf16. Es relevante porque aporta evidencia empirica sobre recetas de razonamiento fundamentado en herramientas (tool-grounded numerical reasoning), incluyendo una comparacion honesta entre variantes con y sin thinking, donde el thinking no siempre resulta superior.

Es un modelo de nicho orientado a investigacion: resuelve ajustes de redes, informes N-1, planificacion "worst-of-three" y preguntas derivadas (sumas, diferencias, medias sobre resultados del solver), y se niega a responder sobre elementos inexistentes. Los autores recomiendan Granite 4.2 8B como base preferente para trabajos nuevos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), fine-tuning LoRA fusionado |
| Parametros totales | 4.539.265.536 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | 8192 tokens usados en entrenamiento; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | bf16 (pesos fusionados); no disponible informacion sobre cuantizaciones adicionales |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (9,4 GB de repositorio) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B (transformer autorregresivo de la familia Qwen3.5, con capacidades image-text-to-text segun los tags del repositorio) y se entrena mediante LoRA con rango 32 y alpha 64, durante 2 epocas, con learning rate 1e-4 y planificacion coseno, longitud de secuencia 8192 y perdida de tipo supervised-tail. Los adaptadores se fusionaron en los pesos base en bf16, de modo que el resultado es un modelo denso estandar compatible con la libreria transformers.

El dato de entrenamiento mas notable son las 826 trayectorias "oracle-scripted": el razonamiento no lo genero un LLM, sino un programa determinista que escribe prosa donde cada numero que aparece ya esta presente en el prompt o en una respuesta previa de la herramienta. Esto garantiza que el modelo aprenda a no inventar cifras y a delegar toda aritmetica en el solver Python. La variante `pyt` incluye thinking; existe una receta hermana sin thinking documentada en `docs/results.md` del proyecto.

## Capacidades

- Generacion de texto conversacional en ingles, especializada en el dominio de sistemas de potencia electrica.
- Resolucion de flujos de potencia AC mediante escritura de codigo Python que invoca un solver externo a traves de la shell `run_python`.
- Ajuste de parametros de redes electricas (fits) y generacion de informes N-1 (analisis de contingencias).
- Planificacion "worst-of-three": comparacion de tres escenarios y seleccion del peor caso.
- Preguntas derivadas: calculo de sumas, diferencias o medias sobre varios resultados del solver (siempre via herramienta).
- Rechazo (refusals) de preguntas sobre elementos que no existen en la red.
- Tool calling nativo en el formato de la shell `run_python` del harness WattsOn.
- Modo thinking (razonamiento explicito en prosa antes de la accion), entrenado con trayectorias deterministas.
- No hay evidencia de capacidades multimodales explotadas en esta variante, pese a que el modelo base Qwen3.5-4B se etiqueta como image-text-to-text.

## Casos de uso

- Investigacion en razonamiento numerico fundamentado en herramientas: el modelo sirve como evidencia reproducible de una receta que fuerza el uso de solvers en lugar de aritmetica del LLM, util para estudios de alucinacion numerica.
- Asistente academico para analisis de redes electricas: estudiantes o investigadores pueden preguntar por ajustes de carga o informes N-1 sobre redes de prueba y obtener respuestas calculadas por pandapower/solver y no por el modelo.
- Prototipado de agentes con shell Python restringida: su formato `run_python` con allowlist y limites de tiempo/memoria es un ejemplo practico de integracion LLM-herramienta.
- Evaluacion comparativa de bases de modelos: permite comparar Qwen3.5-4B frente a Granite 4.2 8B con la misma receta y harness, util para seleccion de modelos base en dominios tecnicos.
- Deteccion de fallos de "confabulacion numerica": las suites de evaluacion (unsolvable, derived) miden explicitamente si el modelo escribe numeros que ninguna herramienta proporciono, un caso de uso metodologico para auditar LLMs.
- Generacion de scripts de analisis de contingencias: dado un escenario de red, el modelo produce el codigo Python necesario para ejecutar el analisis, acelerando flujos de trabajo de ingenieria.
- Estudio del impacto del thinking mode: al existir variantes con y sin thinking sobre la misma receta, es util para medir si el razonamiento explicito reduce o introduce errores.

## Benchmarks y rendimiento

Resultados publicados en la model card, sobre redes held-out y con tres semillas de entrenamiento:

| Suite | Seed 42 | Seed 43 | Seed 44 |
|---|---|---|---|
| Held-out fits and reports (90) | 90 | 89 | 85 |
| Smoke (20) | 20 | 20 | 20 |
| Judgement (40) | 40 | 40 | 40 |
| Unsolvable (28) | 26 | 19 | 26 |
| Planning (40) | 40 | 40 | 40 |
| Derived arithmetic (40) | 39 | 29 | 38 |
| Derived: intentos con un numero no proporcionado por herramienta ni prompt | 1 | 3 | 1 |

Los pesos publicados corresponden a la seed 42. Referencias comparativas del propio autor: el Qwen3.5-4B sin entrenar con la misma shell obtiene 35/40 en la suite derived; la receta sin thinking obtiene 31, 30 y 27 en esa suite segun semilla. La dispersion entre semillas es grande en las suites unsolvable y derived. No se han publicado resultados de benchmarks genericos (MMLU, HumanEval, GSM8K) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9-10 GB solo de pesos (4,54 B de parametros a 2 bytes), mas overhead de KV cache; con cuantizacion a 4 bits cabria en torno a 3 GB, aunque no hay versiones cuantizadas publicadas.
- GPU recomendadas: cualquier GPU de consumo con 12-16 GB de VRAM (RTX 3060 12 GB, RTX 4070 Ti, RTX 4090) es suficiente para inferencia en bf16; para servido concurrente, una A10G o A100.
- Cabe en GPU de consumo: si, en bf16 en tarjetas de 12 GB o mas; el contexto de 8192 tokens usado en entrenamiento mantiene la KV cache manejable.
- Opciones de despliegue: transformers (libreria nativa del modelo); al ser safetensors estandar de Qwen3.5, deberia ser compatible con vLLM, llama.cpp (via conversion GGUF, no publicada) y Ollama (no hay release oficial), aunque el repositorio solo declara compatibilidad con transformers y endpoints.
- Latencia y throughput: no disponible; al requerir llamadas a la shell `run_python` y ejecucion de solver, la latencia total por pregunta depende tambien del tiempo de ejecucion del solver.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Thinking | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wattson-qwen3.5-4b-pyt (este) | 4,54 B | Sistemas de potencia con shell Python | Si (scripted) | Apache-2.0 | HuggingFace, safetensors |
| wattson-granite-4.2-8b-py | 8 B (aprox.) | Misma tarea y shell, sin thinking en esta variante | No (receta hermana) | no disponible en la informacion | HuggingFace (base preferida por los autores) |
| Qwen/Qwen3.5-4B (base) | 4,54 B | Modelo generalista multimodal | Si (nativo Qwen3.5) | Apache-2.0 | HuggingFace |

La comparacion mas relevante es interna al proyecto: con la misma shell, el modelo sin entrenar obtiene 35/40 en derived, la receta sin thinking 31/30/27 y esta variante con thinking 39/29/38 segun semilla. Los propios autores senalan que el thinking no elimina el fallo que pretende evitar (5 intentos entre las tres semillas escribieron un numero no proporcionado, frente a ninguno en la receta sin thinking) y recomiendan Granite 4.2 8B como base para trabajo nuevo.

## Limitaciones y advertencias

- Alcance restringido: esta pensado para el harness WattsOn y para investigacion en razonamiento numerico con herramientas; no debe usarse para decisiones operativas reales en sistemas de potencia.
- La shell Python que invoca no es una frontera de seguridad: es un proceso hijo `python -I` restringido con allowlist y limites de tiempo y memoria, pero no garantiza aislamiento; no exponerla a entradas no confiables sin sandbox adicional.
- El thinking mode no elimina la alucinacion numerica: en evaluacion, 5 intentos entre tres semillas escribieron un numero que ninguna herramienta ni prompt habia proporcionado, fallo que la receta sin thinking no presento.
- Alta varianza entre semillas de entrenamiento en las suites unsolvable y derived (por ejemplo, 19/28 en seed 43 frente a 26/28 en las otras), lo que indica poca robustez de la receta en esos escenarios.
- Idioma limitado al ingles; no hay soporte declarado para castellano ni otros idiomas.
- Los autores consideran este release como evidencia de la receta y no como el producto recomendado: la base preferente para nuevos trabajos es `wattson-granite-4.2-8b-py`.
- No hay benchmarks genericos publicados, por lo que su rendimiento fuera del dominio de sistemas de potencia es desconocido.
- Licencia Apache-2.0: sin restricciones para uso comercial, aunque deben respetarse los terminos de la licencia del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PromptExecutionAU/wattson-qwen3.5-4b-pyt
- Proyecto WattsOn/wattson (GitHub): https://github.com/fungible-farm/wattson
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo hermano recomendado: `wattson-granite-4.2-8b-py` (documentado en el repositorio GitHub del proyecto, archivo `docs/results.md`)
