# mradermacher/neo-2-345M-C1-GGUF

## Resumen

El modelo `mradermacher/neo-2-345M-C1-GGUF` es una cuantización en formato GGUF del modelo original `aquilesfd/neo-2-345M-C1`, realizada por el equipo de mradermacher. Se trata de un modelo de lenguaje pequeño, con aproximadamente 345 millones de parámetros, orientado a tareas de generación de texto, matemáticas y código, según las etiquetas del repositorio. Está pensado para entornos con recursos limitados donde se necesita una inferencia ligera y rápida.

La relevancia actual de este modelo radica en su tamaño reducido, que permite ejecutarlo en CPU o GPU de gama baja, y en su licencia Apache 2.0, que facilita su uso comercial. Aunque la arquitectura exacta no está documentada en la información disponible, las etiquetas sugieren una base similar a GPT-2, y el modelo ha sido afinado con conjuntos de datos de instrucciones como Alpaca, Dolly y OASST1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (etiquetado como `gpt2` en los tags) |
| Parametros totales | 354.823.168 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo original `aquilesfd/neo-2-345M-C1`. Las etiquetas del repositorio cuantizado incluyen `gpt2`, lo que sugiere una arquitectura similar a GPT-2, pero no hay confirmación oficial. Tampoco se documentan datos sobre el número de tokens de entrenamiento, la composición exacta del dataset o si se aplicaron técnicas como RLHF o DPO.

Según la model card del modelo cuantizado, el modelo original fue afinado con los conjuntos de datos `tatsu-lab/alpaca`, `databricks/databricks-dolly-15k` y `OpenAssistant/oasst1`, lo que indica un entrenamiento supervisado orientado a seguir instrucciones. No se mencionan innovaciones técnicas específicas en la arquitectura.

## Capacidades

- Generación de texto en inglés.
- Razonamiento matemático básico (según tags de `math`).
- Generación de código simple (según tags de `coding`).
- Soporte de instrucciones gracias al fine-tuning con datasets de instrucciones.
- No se documenta soporte de tool calling, agentes, visión, audio ni modos de pensamiento extendido.

## Casos de uso

- Prototipado rápido de chatbots: al ser un modelo pequeño, se puede integrar en aplicaciones de demostración o entornos de desarrollo para probar flujos conversacionales sin necesidad de infraestructura potente.
- Generación de respuestas cortas en sistemas de atención al cliente: con una ventana de contexto no documentada, es adecuado para consultas simples y respuestas directas, aunque su capacidad de razonamiento profundo es limitada.
- Asistencia en entornos educativos: para ejercicios de generación de texto, resúmenes breves o práctica de programación básica, aprovechando su tamaño reducido y facilidad de despliegue.
- Tareas de clasificación o etiquetado de texto: usando el modelo como base para extraer características o generar embeddings, aunque no se confirma si soporta esta funcionalidad directamente.
- Ejecución en dispositivos edge o embebidos: gracias a los quants de bajo tamaño (0,3-0,5 GB), puede desplegarse en Raspberry Pi o dispositivos móviles para generación de texto offline.
- Experimentación académica: para estudiar el comportamiento de modelos pequeños afinados con instrucciones, comparando con otros modelos de tamaño similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,3 y 0,8 GB según el cuantizado elegido (el f16 ocupa 0,8 GB, los Q4 y Q5 alrededor de 0,3-0,4 GB).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo modelos integrados (iGPU) o tarjetas de gama baja como GTX 1650 o RTX 3050. También funciona en CPU pura.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (TGI) y cualquier framework compatible con GGUF.
- Latencia y throughput: no disponibles, pero por el tamaño del modelo se espera una inferencia rápida incluso en CPU (del orden de decenas de tokens por segundo en hardware moderno).

## Comparativa con modelos similares

No disponible. No se encontraron modelos comparables documentados en la información proporcionada. Se podría comparar con GPT-2 small (124M) o GPT-Neo 125M, pero no hay datos de rendimiento para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Modelo pequeño (345M) con capacidad limitada de razonamiento complejo y generación de código avanzado.
- Solo soporta inglés; no se documenta soporte multilingüe.
- Riesgo de alucinaciones, especialmente en tareas de conocimiento factual.
- No se documentan sesgos específicos, pero al estar entrenado con datasets como Alpaca y Dolly, podría heredar sesgos presentes en esos datos.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base `aquilesfd/neo-2-345M-C1` para confirmar posibles restricciones adicionales.
- La longitud de contexto no está especificada; se recomienda probar con entradas cortas para evitar degradación de rendimiento.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: [mradermacher/neo-2-345M-C1-GGUF](https://huggingface.co/mradermacher/neo-2-345M-C1-GGUF)
- Modelo base original: [aquilesfd/neo-2-345M-C1](https://huggingface.co/aquilesfd/neo-2-345M-C1)
- Página de solicitudes de cuantización de mradermacher: [mradermacher/model_requests](https://huggingface.co/mradermacher/model_requests)
