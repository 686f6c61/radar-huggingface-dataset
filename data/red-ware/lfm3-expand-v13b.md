# red-ware/lfm3-expand-v13b

## Resumen

LFM3 expansion finetune v13b es un adaptador LoRA (y su versión fusionada en GGUF q4_k_m) desarrollado por red-ware sobre el modelo base LiquidAI/LFM3-1.7B. No es un modelo de propósito general, sino un componente especializado dentro de la herramienta `compress` (https://github.com/delaysystem/compress), un compresor de salida de LLM orientado a atención al cliente. El compresor genera una representación intermedia (IR) compacta a partir de una única llamada a un modelo de gama alta; este finetune se encarga de expandir esa IR de vuelta a una respuesta fluida para el cliente.

El modelo resuelve un problema de ingeniería de costes: permite delegar la generación final de la respuesta a un modelo pequeño (1,7 mil millones de parámetros) en lugar de repetir llamadas a un modelo grande. Con 1.728.801.600 parámetros totales y un adaptador LoRA de rango 32, está pensado para ejecutarse localmente con llama.cpp, con una latencia p50 de aproximadamente 7 segundos en el host de evaluación para la tarea de expansión.

Es relevante ahora por su carácter de componente de producción: la evaluación sobre 100 filas del conjunto de staging (`v3gem100`) reportó 100/100 expansiones exitosas sin errores, y el autor indica que sustituye a las versiones v13 y v12. Su licencia Business Source License 1.1 y el uso exclusivo de datos de staging/dev (sin datos reales de clientes) condicionan su aplicabilidad comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base LiquidAI/LFM3-1.7B) con adaptador PEFT LoRA |
| Parámetros totales | 1.728.801.600 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el ejemplo de despliegue usa `-c 2048`) |
| Tipos de cuantización | GGUF q4_k_m (incluido); el adaptador LoRA se distribuye en safetensors |
| Idiomas soportados | No disponible |
| Licencia | Business Source License 1.1 (business-source-license-1.1); aplican además los términos del modelo base |
| Formato de pesos | safetensors (adaptador LoRA) y GGUF (modelo fusionado q4_k_m) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B, un transformer decoder-only de 1,7 mil millones de parámetros, sobre el que se aplica un ajuste fino supervisado (SFT) mediante LoRA con rango r=32, alpha=64 y dropout de 0,05. El adaptador se puede cargar con PEFT sobre el modelo base o fusionarse y exportar a GGUF mediante el script `kaggle/merge-lora-local.py` del repositorio `compress`.

El entrenamiento se centró en la etapa de expansión del pipeline: dado un IR compacto producido por un modelo de gama alta, el modelo debe reconstruir una respuesta de atención al cliente fluida. El autor declara que tanto el entrenamiento como la evaluación usaron exclusivamente datos de staging/dev, sin datos reales de producción. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. El despliegue previsto incluye decodificación especulativa con un modelo draft complementario (`lfm25-230m-q40.gguf`, no distribuido en este repositorio) y decodificación con temperatura 0,0.

## Capacidades

- Generación de texto conversacional orientada a respuestas de atención al cliente a partir de una representación intermedia compacta.
- Expansión de IR a lenguaje natural fluido, que es la función principal para la que fue entrenado.
- Ejecución local eficiente mediante llama.cpp con el GGUF q4_k_m incluido.
- Compatibilidad con decodificación especulativa usando un modelo draft externo de 230M de parámetros.
- Integración como adaptador PEFT en pipelines de transformers.
- Soporte de plantilla de chat (`chat_template.jinja`) incluida en el repositorio.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Expansión de respuestas en pipelines de compresión de salida: el modelo recibe la IR generada por un modelo grande y produce la respuesta final al cliente, reduciendo el coste por interacción al evitar una segunda llamada al modelo de gama alta.
- Atención al cliente automatizada de bajo coste: al ejecutarse en local con llama.cpp y cuantización q4_k_m, permite desplegar la generación final en infraestructura propia sin depender de APIs externas.
- Reducción de latencia en sistemas de respuesta: con una latencia p50 de aproximadamente 7 segundos en el host de evaluación y decodificación especulativa opcional, encaja en flujos donde la llamada al modelo grande ya consume parte del presupuesto de tiempo.
- Prototipado de sistemas de compresión de contexto: sirve como pieza de referencia para evaluar arquitecturas de IR intermedia en las que un modelo pequeño reconstruye la salida final.
- Despliegue en entornos con recursos limitados: el GGUF q4_k_m y el modelo base de 1,7B permiten ejecución en hardware modesto con llama-server, usando `-ngl 99` para descargar todas las capas a GPU.
- Investigación sobre ajuste fino con LoRA para tareas acotadas: el adaptador r=32 con alpha=64 y el script de fusión a GGUF facilitan reproducir el flujo de entrenamiento y exportación.

## Benchmarks y rendimiento

| Evaluación | Conjunto | Resultado |
|---|---|---|
| Expansión exitosa | `v3gem100` (100 filas, staging) | 100/100, cero errores |
| Latencia p50 | Host de evaluación | ~7 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los resultados de validador y de la escalera completa del pipeline se reportan en el repositorio `compress`.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; para un modelo de 1,7B en q4_k_m el peso de los parámetros ronda 1 GB, y el repositorio completo ocupa 1,2 GB.
- GPU recomendadas: no especificadas por el autor; el ejemplo de despliegue usa `-ngl 99`, lo que implica descargar todas las capas a GPU.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño del modelo en q4_k_m, aunque el autor no publica requisitos mínimos.
- Opciones de despliegue: llama.cpp (`llama-server`), con flags sugeridos `-c 2048 -ngl 99 -ctk q8_0 -ctv q8_0 --temp 0.0 -rea off --jinja`; también carga como adaptador PEFT con transformers y peft.
- Decodificación especulativa: soportada con `-md` y el draft `lfm25-230m-q40.gguf`, que no se distribuye en este repositorio.
- Latencia y throughput: p50 de aproximadamente 7 s en la evaluación de expansión sobre el host del autor; no se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| red-ware/lfm3-expand-v13b | 1,73B | No disponible | Expansión de IR para atención al cliente | Business Source License 1.1 | Hugging Face (adaptador + GGUF) |
| LiquidAI/LFM3-1.7B | 1,7B | No disponible | Modelo base de propósito general | Según modelo base | Hugging Face |
| Modelo draft `lfm25-230m` | 230M | No disponible | Decodificación especulativa | No disponible | No distribuido en este repositorio |

No se dispone de datos de rendimiento comparativo con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado: está entrenado para la etapa de expansión de `compress`; su uso fuera de ese pipeline no está validado y probablemente degrade la calidad.
- Licencia Business Source License 1.1: restringe el uso comercial según los términos del repositorio `compress`; además siguen aplicando la licencia y condiciones del modelo base LiquidAI/LFM3-1.7B.
- Datos de entrenamiento y evaluación limitados a staging/dev; no hay evidencia de comportamiento con datos reales de producción.
- Evaluación reducida: 100 filas en un único conjunto de staging; no constituye una validación estadística amplia.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingüe.
- Longitud de contexto no especificada; el ejemplo de despliegue fija 2048 tokens, lo que limita conversaciones largas.
- Riesgo de alucinación inherente a un modelo de 1,7B que reconstruye información desde una representación intermedia; puede introducir detalles no presentes en la IR.
- El modelo draft para decodificación especulativa no se incluye en el repositorio, por lo que esa optimización requiere obtenerlo por separado.
- Sin datos publicados sobre sesgos, robustez frente a entradas adversarias ni comportamiento en dominios ajenos a atención al cliente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/red-ware/lfm3-expand-v13b
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Repositorio `compress`: https://github.com/delaysystem/compress
- Script de fusión LoRA a GGUF: https://github.com/delaysystem/compress/blob/main/kaggle/merge-lora-local.py
- Licencia: https://github.com/delaysystem/compress/blob/main/LICENSE
