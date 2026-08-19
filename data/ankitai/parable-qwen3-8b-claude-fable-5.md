# AnkitAI/Parable-Qwen3-8B-Claude-Fable-5

## Resumen

Parable-Qwen3-8B-Claude-Fable-5 es un ajuste fino de Qwen3-8B desarrollado por AnkitAI dentro de la serie Parable. El modelo se entrena sobre trazas reales de sesiones de agente de Claude Fable 5 y GPT-5.5, capturadas de trabajo de planificacion, uso de herramientas y razonamiento tipo `thinking`, en lugar de datos sinteticos de pregunta-respuesta. El objetivo es transferir el estilo de razonamiento y comportamiento agéntico de estos asistentes a un modelo abierto de 8.190 millones de parametros.

El ajuste se realizo con QLoRA (NF4, longitud de secuencia de 1.024 tokens) sobre una unica GPU de 16 GB, y el resultado reporta una reduccion del 67 % en la perdida de test sobre particion held-out respecto al modelo base (de 2,162 a 0,712). En la revision cualitativa estricta de la serie Parable obtiene la mejor puntuacion: 23 de 34 respuestas totalmente correctas en tareas de codigo, terminal y depuracion.

Es relevante porque aborda un hueco concreto: modelos abiertos que reproduzcan el razonamiento agéntico multi-paso de asistentes propietarios, con soporte para thinking, tool calling y sesiones largas. El contexto nativo de 128K tokens de Qwen3-8B se mantiene intacto, aunque el comportamiento ajustado es mas fuerte en los turnos iniciales de la conversacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen/Qwen3-8B) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128K tokens (herencia de Qwen3-8B); ajuste fino optimizado a 1.024 tokens |
| Tipos de cuantizacion | GGUF (incluye Q4_K_M), safetensors (entrenado en NF4) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 (pesos); datos de entrenamiento AGPL-3.0 y MIT |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino QLoRA de Qwen3-8B, un transformer denso de 8,19 B de parametros. El entrenamiento se realizo con cuantizacion NF4 y longitud de secuencia de 1.024 tokens sobre una unica GPU de 16 GB. Los datos provienen de dos fuentes: Glint-Research/Fable-5-traces, con 4.400 trazas reales de sesiones de agente de codificacion de Claude Fable 5 que incluyen razonamiento `thinking` y llamadas a herramientas, y Roman1111111/gpt5.5-terminal, con soluciones de tareas de agente de terminal. No se usaron datos sinteticos de tipo Q&A.

Cada ejemplo paso por un control de calidad previo al entrenamiento: validacion de esquema, limpieza de secretos y filtrado por longitud. El modelo se cuantizo posteriormente con llama.cpp para distribuir versiones GGUF. No se menciona el uso de RLHF ni DPO; el metodo reportado es exclusivamente SFT sobre trazas reales. El numero total de tokens de entrenamiento no esta disponible en la informacion proporcionada.

## Capacidades

- Generacion de texto con razonamiento agéntico multi-paso, incluyendo bloques de pensamiento `thinking` al inicio de la respuesta.
- Soporte de tool calling y function calling, evaluado con BFCL V3 (subset AST) en modo prompting.
- Capacidad de codificacion, tareas de terminal y depuracion, entrenado sobre trazas reales de agentes de codificacion.
- Sesiones largas gracias al contexto nativo de 128K tokens heredado de Qwen3-8B.
- Integracion en harnesses de agentes: puede emitir JSON estructurado de tool-call en prompts de tipo operativo.
- Multilingue limitado: solo ingles declarado en la model card.

## Casos de uso

- Harness de agentes de codificacion: el modelo puede integrarse en pipelines agénticos donde se necesita planificacion multi-paso, llamadas a herramientas y razonamiento `thinking` antes de emitir codigo, gracias a su entrenamiento sobre trazas reales de agentes.
- Automatizacion de terminal: adecuado para generar comandos y soluciones de tareas de consola, dado el dataset gpt5.5-terminal con soluciones de agente de terminal.
- Asistente de codigo local con razonamiento: desplegado via Ollama o LM Studio con cuantizacion GGUF, ofrece un asistente de programacion con estilo de razonamiento tipo Claude en hardware de consumo.
- Depuracion asistida: su revision cualitativa cubre prompts de debugging y el modelo razona en voz alta antes de proponer correcciones, util en entornos de desarrollo donde se quiere trazabilidad del razonamiento.
- Sesiones de contexto largo en soporte tecnico: con 128K tokens de contexto, puede procesar repositorios o logs extensos en los turnos iniciales, aunque el comportamiento ajustado es mas fuerte al principio de la conversacion.
- Evaluacion y experimentacion de SFT con trazas reales: sirve como punto de referencia para investigacion sobre destilacion de comportamiento agéntico desde asistentes propietarios, comparando perdida held-out y grados cualitativos frente al base.
- Orquestacion de herramientas en entornos de bajo presupuesto: al caber en una GPU de 16 GB en entrenamiento y ejecutarse en una T4 cuantizado, es viable para prototipos de agentes con tool calling en infraestructura modesta.

## Benchmarks y rendimiento

La model card reporta evaluacion sobre particion held-out con codigo y longitud de contexto identicos para base y ajuste:

| Metrica | Qwen3-8B base | Parable | Variacion |
|---|---|---|---|
| Test loss | 2,162 | 0,712 | -67 % |

Revision cualitativa (34 prompts de codigo, terminal y depuracion, evaluados estrictamente): 23/34 totalmente correctos y 30/34 correctos o parcialmente correctos.

Function calling (BFCL V3, subset AST, modo prompting, cuantizacion Q4_K_M servida con llama.cpp sobre T4):

| Categoria | Qwen3-8B base | Parable |
|---|---|---|
| simple_python | 0,953 | 0,930 |
| multiple | 0,945 | 0,900 |
| parallel | 0,935 | 0,905 |
| parallel_multiple | 0,900 | 0,850 |

El ajuste fino sobre trazas de prosa supone una perdida de entre 2,3 y 5,0 puntos por categoria en precision de function calling frente al base. No se publican resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- Entrenamiento: QLoRA (NF4, secuencia de 1.024 tokens) completado en una unica GPU de 16 GB.
- Inferencia: la evaluacion BFCL se ejecuto con cuantizacion Q4_K_M servida por llama.cpp sobre una GPU NVIDIA T4, lo que confirma viabilidad en hardware de gama baja.
- Cabe en GPUs de consumo: una RTX 4090 (24 GB) puede servir el modelo en cuantizaciones GGUF de 4 y 8 bits sin problema; incluso tarjetas de 8-16 GB son viables con cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama (`ollama run parable/qwen3-fable:8b`), LM Studio, transformers con device_map="auto", y compatibilidad declarada con text-generation-inference y endpoints.
- El repositorio de pesos safetensors ocupa 32,8 GB en precision completa; se recomienda usar las cuantizaciones GGUF para despliegue local.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Parable-Qwen3-8B-Claude-Fable-5 | 8,19 B | 128K | Apache-2.0 | SFT sobre trazas reales de Claude Fable 5 y GPT-5.5; mejor puntuacion cualitativa de la serie Parable |
| Qwen3-8B (base) | 8,19 B | 128K | Apache-2.0 | Mejor precision en function calling (BFCL V3), sin el estilo de razonamiento agéntico |
| Parable-Granite-4.1-8B-Claude-Fable-5 | 8 B (aprox.) | no disponible | no disponible | Misma linea Parable sobre base Granite 4.1 8B |
| Fine-tune de 9B publicado sobre la misma familia de datos | 9 B | no disponible | no disponible | Reporta 0,71 de validation loss; cifras indicativas por diferencias de splits y tokenizadores |

La comparacion con el fine-tune de 9B es solo orientativa: la model card advierte que los splits, tokenizadores y longitudes de contexto difieren entre repositorios.

## Limitaciones y advertencias

- En prompts de tipo operativo, el modelo responde a veces (2 de 34 en la evaluacion) con JSON estructurado de tool-call en lugar de prosa; es util dentro de harnesses de agente pero requiere re-prompt o temperatura mas baja en chat normal.
- El ajuste fino se realizo a 1.024 tokens de secuencia; el comportamiento ajustado es mas fuerte en los turnos iniciales y puede degradarse en sesiones muy largas, aunque el contexto nativo de 128K sigue disponible.
- Solo soporta ingles; no hay datos de rendimiento en otros idiomas.
- La licencia de los pesos es Apache-2.0, pero los datos de entrenamiento incluyen AGPL-3.0 (Fable-5-traces) y MIT (gpt5.5-terminal); al originarse en asistentes de terceros, los terminos de sus proveedores pueden aplicar a entrenamiento y destilacion posteriores. Conviene verificar el uso comercial antes de construir sobre el modelo.
- Hereda los comportamientos base y el corte de conocimiento de Qwen3-8B.
- Perdida de precision en function calling frente al base (entre 2,3 y 5,0 puntos en BFCL V3); si se necesita maxima precision de tool calling, el base es preferible.
- Los comandos y codigo generados deben tratarse como borradores a revisar, como con cualquier modelo local.
- Solo 185 descargas y sin likes en el momento de la ficha; es un modelo reciente con adopcion limitada y sin validacion independiente externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnkitAI/Parable-Qwen3-8B-Claude-Fable-5
- Cuantizaciones GGUF: https://huggingface.co/AnkitAI/Parable-Qwen3-8B-Claude-Fable-5-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Dataset Fable-5-traces: https://huggingface.co/datasets/Glint-Research/Fable-5-traces
- Dataset gpt5.5-terminal: https://huggingface.co/datasets/Roman1111111/gpt5.5-terminal
- Coleccion Parable (pesos completos, evaluaciones): https://huggingface.co/collections/AnkitAI/parable-6a4fac60f4b35afca3019621
- Artefactos de evaluacion BFCL: https://huggingface.co/AnkitAI/parable-v2-artifacts
- Linea Parable sobre Granite 8B: https://huggingface.co/AnkitAI/Parable-Granite-4.1-8B-Claude-Fable-5
- Herramienta de cuantizacion llama.cpp: https://github.com/ggml-org/llama.cpp
