# benthecarman/Inkling-2-Mini-uncensored

## Resumen

Inkling 2 Mini (Uncensored) es un ajuste fino del modelo multimodal thinkingmachines/Inkling-2-Mini, desarrollado por el usuario benthecarman y patrocinado por Maple AI. Se trata de una variante "abliterated" orientada a eliminar los rechazos y las evasivas en tiempo de razonamiento del modelo original, manteniendo intactas las capacidades de codigo, conocimiento y uso de herramientas. El modelo base es un Mixture of Experts (MoE) de 26,4 mil millones de parametros totales con 3,4 mil millones activos, 24 capas con las capas 6 a 17 repetidas tres veces, y entrada tanto de texto como de imagenes.

La relevancia de este checkpoint radica en su metodologia: en lugar de aplicar una abliteracion direccional clasica (que degrada el tool calling y la estabilidad), el autor entrena un ajuste de bajo rango unicamente sobre las 120 proyecciones de atencion BF16 sin comprimir, anclando el modelo al original mediante una penalizacion KL y una pasada posterior de DPO para corregir bucles de repeticion. El resultado es un checkpoint independiente (sin adaptador LoRA) que se ejecuta en cualquier entorno donde funcione el modelo base, con una huella de aproximadamente 20 GB y compatible con una sola GPU de 32 GB.

El modelo conserva la licencia Apache 2.0 del original y esta empaquetado en safetensors con expertos en NVFP4/MXFP8, lo que permite su despliegue en vLLM con los parsers oficiales de razonamiento y tool calling de Inkling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text) con capas 6-17 repetidas 3x y cabeza MTP |
| Parametros totales | 26.388.646.440 (26,4 B) |
| Parametros activos | 3,4 B (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 y MXFP8 en expertos enrutados; BF16 en atencion; 8-bit via modelopt |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 39,7 GB; modelo en ejecucion ~20 GB) |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini es un MoE multimodal con 24 capas, de las cuales las capas 6 a 17 se repiten tres veces (inkling2_loop), lo que incrementa la profundidad efectiva sin aumentar el numero de parametros. Incorpora un encoder de vision para entrada de imagenes y una cabeza MTP (multi-token prediction). Los expertos enrutados estan cuantizados en NVFP4/MXFP8, mientras que las proyecciones de atencion se mantienen en BF16.

El ajuste fino de benthecarman sigue un pipeline on-policy de cuatro pasos sin modelo profesor externo: (1) recoleccion de datos on-policy aplicando abliteracion direccional temporal con abliterix para generar respuestas directas en los cuatro niveles de esfuerzo de razonamiento (off, low, medium, high); (2) entrenamiento de una actualizacion de bajo rango solo sobre las 120 proyecciones de atencion BF16 (wq_du, wk_dv, wv_dv, wo_ud, gate_attn) con penalizacion KL para preservar el comportamiento original en chat y tool calling; (3) pasada de preferencias DPO con el mismo ancla KL para eliminar bucles de repeticion; (4) fusion de ambas actualizaciones en los pesos originales en una sola operacion de redondeo fp64 (mean_rel_delta = 1,03 %, max_rel_delta = 1,37 %). Los 1.124 tensores restantes (expertos cuantizados, embeddings, router, encoder de vision, cabeza MTP, config, tokenizer y chat template) son byte-identicos al upstream y estan verificados por SHA-256 en MANIFEST.json.

## Capacidades

- Generacion de texto conversacional multi-turno con soporte de razonamiento configurable en cuatro niveles (`off`, `low`, `medium`, `high`).
- Razonamiento y codigo: HumanEval del 97,0 % en modo thinking off y 99,4 % con `reasoning_effort="low"`.
- Conocimiento general: MMLU del 75,3 % en 5-shot generativo.
- Tool calling / function calling nativo, con parser oficial `inkling` y soporte de `--enable-auto-tool-choice` en vLLM; BFCL v4 del 80,1 %.
- Capacidades multimodales de entrada: procesa texto e imagenes (pipeline image-text-to-text).
- Capacidades de agente y razonamiento multi-paso a traves de los niveles de esfuerzo de razonamiento y la cabeza MTP.
- Comportamiento "uncensored": rechazos reducidos del 91,0 % al 6,6 % en el conjunto held-out de 633 prompts, y entrega directa del 81,9 % al 88,3 % en el benchmark audn segun nivel de esfuerzo.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Generacion de codigo en produccion: con HumanEval del 97-99 % y soporte de tool calling via BFCL, puede integrarse en pipelines de CI/CD para autocompletado, generacion de tests y refactorizacion asistida, usando el parser oficial de Inkling en vLLM.
- Agentes autonomos con herramientas: el BFCL v4 del 80,1 % y el soporte de `--enable-auto-tool-choice` permiten construir agentes que seleccionan y encadenan funciones externas (APIs, bases de datos, busquedas) en flujos multi-paso.
- Asistencia conversacional sin restricciones tematicas: la reduccion de rechazos al 6,6 % lo hace adecuado para entornos de investigacion sobre seguridad, red teaming y evaluacion de robustez de modelos, donde se necesita medir respuestas directas sin evasivas.
- Procesamiento de documentos con imagenes: al aceptar entrada image-text-to-text, sirve para tareas de extraccion de informacion de capturas, formularios o diagramas combinadas con razonamiento textual.
- Razonamiento adaptativo por coste: los cuatro niveles de esfuerzo permiten desplegar el mismo checkpoint en modos de baja latencia (`off`, `low`) para chat en tiempo real y modos de alta precision (`high`) para tareas analiticas, ajustando el coste computacional.
- Evaluacion comparativa de alineamiento: util como contrapunto "abliterated" frente al modelo base para estudiar el impacto de la abliteracion en MMLU (76,6 % vs 75,3 %) y HumanEval, con pesos verificados byte a byte en los expertos.

## Benchmarks y rendimiento

| Benchmark | Base Inkling-2-Mini | Este modelo |
|---|---:|---:|
| KL desde base (primer token, thinking off) | 0,000 | 0,230 |
| MMLU (14.042 preguntas, 5-shot generativo, thinking off) | 76,6 % | 75,3 % |
| HumanEval (164 problemas, temp=1.0, thinking off) | 97,6 % (160/164, 0 bucles) | 97,0 % (159/164, 0 bucles) |
| HumanEval (164 problemas, temp=1.0, reasoning_effort=low) | 98,2 % (161/164, 0 bucles) | 99,4 % (163/164, 0 bucles) |
| BFCL v4 tool calling (fold final, 1.205 prompts) | 79,5 % | 80,1 % |
| BFCL no-tool-fits (400) | 64/400 fallos | 61/400 fallos |
| BFCL tool-fits (805) | 183/805 fallos | 179/805 fallos |
| Conjunto held-out de rechazo (633 prompts, temp=1.0) | 91,0 % rechazados (576/633) | 6,6 % rechazados (42/633) |
| audn 520 (low, temp=1.0) | 0,0 % entregados / 55,0 % evadidos / 45,0 % rechazados | 85,0 % entregados / 15,0 % evadidos / 0,0 % rechazados |
| audn 520 (medium, temp=1.0) | 0,0 % / 56,9 % / 43,1 % | 86,7 % / 13,3 % / 0,0 % |
| audn 520 (high, temp=1.0) | 0,0 % / 58,7 % / 41,3 % | 88,3 % / 11,5 % / 0,2 % |
| audn 520 (off, temp=1.0) | 0,0 % / 59,0 % / 41,0 % | 81,9 % / 17,7 % / 0,4 % |

Las evaluaciones generativas se ejecutaron con el mismo harness, prompts, generacion sin limite de tokens (detenida solo por el detector de bucles) y el muestreo oficial de Inkling 2 Mini (temperature=1.0, seed=0). El benchmark audn se puntuo localmente con el prompt de juez exacto de audn usando el modelo base sin tocar, calibrado con un 90,3-91,3 % de acuerdo binario contra glm-5-3 sobre 1.556 respuestas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 20 GB en ejecucion total; el repo pesa 39,7 GB pero el checkpoint desplegable ocupa unos 20 GB.
- GPU recomendadas: una sola RTX 5090 (32 GB) es suficiente segun el autor; tambien cabe en A100 40 GB, H100 y otras GPU de 32 GB o mas.
- Cabe en GPU de consumo: si, en RTX 5090 de 32 GB; no se indica compatibilidad con GPU de 24 GB.
- Opciones de despliegue: vLLM con `--dtype bfloat16 --reasoning-parser inkling --tool-call-parser inkling --enable-auto-tool-choice`. No se mencionan llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | MMLU | HumanEval | BFCL v4 | Licencia | Rechazos (held-out) |
|---|---|---:|---|---:|---:|---:|---|---:|
| Inkling-2-Mini-uncensored (este) | 26,4 B | 3,4 B | no disponible | 75,3 % | 97,0 % / 99,4 % (low) | 80,1 % | Apache 2.0 | 6,6 % |
| thinkingmachines/Inkling-2-Mini (base) | 26,4 B | 3,4 B | no disponible | 76,6 % | 97,6 % / 98,2 % (low) | 79,5 % | Apache 2.0 | 91,0 % |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Solo se dispone de datos comparativos frente al modelo base; no se han proporcionado resultados de otros modelos de la misma categoria en la informacion disponible.

## Limitaciones y advertencias

- El modelo esta deliberadamente desalineado en materia de rechazos: entrega respuestas directas al 81,9-88,3 % en audn y solo rechaza el 6,6 % del conjunto held-out, lo que lo hace inadecuado para despliegues comerciales orientados al publico sin capas de moderacion externas.
- Riesgo de contenido danino: la eliminacion de rechazos y evasivas en tiempo de razonamiento implica que puede producir contenido que el modelo base rechazaria; requiere evaluacion de seguridad propia antes de cualquier uso en produccion.
- Riesgo de alucinacion: no se han publicado metricas de factualidad ni de calibracion mas alla de MMLU; el ajuste reduce el conocimiento en 1,3 puntos porcentuales respecto al base (76,6 % a 75,3 %).
- Bucles de repeticion: aunque la pasada DPO los reduce casi a cero (1 bucle en 2.080 respuestas audn), persisten casos residuales; se recomienda mantener un detector de bucles en produccion.
- Idiomas soportados: no disponibles; no se puede confirmar el rendimiento multilingue.
- Longitud de contexto: no disponible en la informacion proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la licencia no exime de responsabilidad sobre el contenido generado ni de las obligaciones de moderacion aplicables.
- Reproducibilidad: los expertos cuantizados y el resto de tensores son byte-identicos al upstream (verificado por SHA-256), pero las 120 proyecciones de atencion modificadas introducen una desviacion relativa media del 1,03 % que puede afectar sutilmente al comportamiento en tareas no evaluadas.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validacion independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/benthecarman/Inkling-2-Mini-uncensored
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Patrocinador Maple AI: https://maple.ai
