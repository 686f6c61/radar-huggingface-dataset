# nace-ai/Qwen3.8-27B-MLX-Q5

## Resumen

nace-ai/Qwen3.8-27B-MLX-Q5 es una cuantización de 5 bits en formato MLX del modelo multimodal Qwen/Qwen3.8-27B, publicada por Nace.AI para su ejecución en Macs con Apple Silicon. El paquete ocupa 20,7 GB en disco, de los cuales 19,43 GB corresponden a los pesos del modelo de lenguaje; la torre de visión se mantiene intacta, fijada por hash, con 921.460.192 bytes (333 tensores). El modelo base es un transformer multimodal de 27.356.728.560 parámetros que procesa imagen y texto (pipeline `image-text-to-text`) y que, por defecto, razona antes de responder (modo thinking).

La relevancia de esta ficha no está tanto en el modelo base como en el método de cuantización: Nace.AI afirma que su Q5 queda 2,5 veces más cerca del modelo BF16 original que el paquete de 4 bits de mlx-community (KL 0,0219 frente a 0,0538 sobre texto original), con un 28% más de peso de modelo de lenguaje (19,43 GB frente a 15,13 GB). La comparación se realizó en ejecuciones distintas del mismo test, por lo que no es estrictamente emparejada, tal como advierte el propio autor.

El paquete está pensado exclusivamente para inferencia local en Apple Silicon mediante mlx-lm, con licencia Apache 2.0 heredada del modelo base y soporte declarado únicamente para inglés. Incluye el tokenizador y la plantilla de chat del modelo original, byte a byte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); modelo base Qwen3.8-27B con torre de vision y cabeza MTP opcional |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5 bits (MLX); el repositorio hermano nace-ai/Qwen3.8-27B-MLX incluye tambien Q4 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), 3 archivos, 20.661.452.485 bytes |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.8-27B es un transformer multimodal que acepta entradas de imagen y texto y genera texto; esta ficha no dispone de detalles sobre la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron fases de RLHF o DPO, por lo que esos datos se marcan como no disponibles. La model card del paquete cuantizado menciona un modo thinking activado por defecto, con ajustes de muestreo diferenciados para thinking activado y desactivado, y una cabeza MTP (multi-token prediction) opcional incluida en el repositorio de origen (`optiq/mtp.safetensors`) que, según el autor, ninguno de sus tests cargó.

La innovación técnica de este paquete concreto es el procedimiento de cuantización de Nace.AI: en lugar de ajustar cada grupo de pesos solo contra los valores numéricos de los pesos originales, el método ajusta los grupos contra el comportamiento del modelo sobre texto real. El resultado es un paquete MLX estándar (mismos archivos, mismo formato, sin dependencias nuevas). La torre de visión procede de mlx-community/Qwen3.8-27B-OptiQ-4bit en la revisión `a95c2908` y se mantiene sin cambios; el tokenizador y la plantilla de chat provienen del modelo base.

## Capacidades

- Generación de texto con razonamiento explícito: el modelo piensa antes de responder por defecto, con hasta 32.768 tokens de salida recomendados para la mayoría de tareas en modo thinking.
- Comprensión de imagen y texto conjuntamente (pipeline `image-text-to-text`), con la torre de visión del modelo base preservada intacta.
- Tool calling / function calling: la model card reporta 20 de 20 ensayos con thinking desactivado que colocaron la llamada y completaron el round trip, sin llamadas extra (MLX 0.32.4, mlx-lm 0.32.2).
- Modo thinking conmutable, con ajustes de muestreo recomendados distintos para cada modo (temperatura 1,0 / top_p 0,95 en thinking; temperatura 0,7 / top_p 0,8 / presence_penalty 1,5 en thinking off).
- Soporte multilingüe limitado: el paquete declara únicamente inglés (`language: en`); valores altos de presence_penalty pueden mezclar idiomas según la model card.
- No se documentan en la información disponible capacidades de audio, agentes multi-paso ni matemáticas avanzadas más allá de lo implícito en el modelo base.

## Casos de uso

- Inferencia local en Mac Apple Silicon: el paquete está diseñado para mlx-lm sobre Apple Silicon y ocupa 20,7 GB, lo que permite ejecutar un modelo de 27.000 millones de parámetros en un equipo de sobremesa o portátil de gama alta con memoria unificada suficiente.
- Asistentes conversacionales multi-turno: la plantilla de chat del modelo base se incluye byte a byte y el modelo soporta modo thinking conmutable, lo que encaja en interfaces de chat donde se quiere alternar entre respuestas rápidas y respuestas razonadas.
- Automatización con tool calling: los 20 de 20 ensayos exitosos de llamada y round trip con thinking desactivado lo hacen adecuado para pipelines de agentes que invocan APIs externas, siempre que se valide en el entorno de destino.
- Análisis de documentos con imagen: al conservar la torre de visión del modelo base, puede procesar capturas, diagramas o documentos escaneados junto con instrucciones de texto.
- Evaluación comparativa de cuantizaciones: el repositorio publica `results.json` con la ejecución completa (runtime, hashes del tokenizador y tramos de KL), útil para investigadores que comparan métodos de cuantización sobre el mismo modelo.
- Prototipado en local antes de desplegar en servidor: permite probar prompts, plantillas y flujos de tool calling en una máquina de desarrollo con Apple Silicon antes de mover la carga a infraestructura con GPU.
- Sustitución de paquetes de 4 bits cuando la fidelidad al BF16 importa: con KL 0,0219 frente a 0,0538 del paquete mlx-community 4-bit, es una opción razonable cuando se dispone de memoria para 19,43 GB de pesos de lenguaje.

## Benchmarks y rendimiento

| Test | Nace Q5 (este repo) | Tokens |
|---|---:|---|
| KL respecto al modelo BF16, texto original (menor es mejor) | 0,0219 | 32.704 |
| KL respecto al modelo BF16, texto de chat y tool-call (menor es mejor) | 0,1340 | 65.472 |
| Acuerdo top-1 con el modelo BF16, texto original | 94,9% | 32.704 |

Comparación de paquetes publicada por el autor (tamaño de pesos de lenguaje y KL sobre texto original):

| Paquete | GB de modelo de lenguaje | KL texto original | Revision |
|---|---:|---:|---|
| Nace Q5 (este repo) | 19,425 | 0,0219 | esta revision |
| Nace Q4 | 15,133 | 0,0349 | c122d522 |
| mlx-works oQ4e-mtp | 16,050 | 0,0358 | 1c0609b2 |
| mlx-community 4-bit | 15,133 | 0,0538 | b935172e |
| lmstudio-community 4-bit | 15,133 | 0,0544 | 6067b15c |

El autor advierte que los demás paquetes se puntuaron en ejecuciones anteriores del mismo test que no registraron todos los hashes, por lo que la comparación no es estrictamente emparejada. No se publican resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria: el repositorio ocupa 20,7 GB en disco (20.661.452.485 bytes); los pesos de lenguaje son 19,43 GB y la torre de visión 921.460.192 bytes. En Apple Silicon, la memoria unificada debe cubrir los pesos más el overhead de mlx-lm y la caché KV.
- GPU: el paquete es MLX, orientado a Apple Silicon; no está pensado para GPU NVIDIA. El autor menciona que los tests se ejecutaron con MLX 0.32.4 CUDA y mlx-lm 0.32.2, pero el destino natural del formato es Apple Silicon.
- GPU de consumo: no se dispone de datos sobre ejecución en RTX 4090 u otras GPU consumer; el formato MLX no es el habitual para esas tarjetas.
- Despliegue: mlx-lm (versión probada 0.32.2), mlx 0.32.4, transformers 5.22.2, numpy 2.5.4. No se documentan opciones vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nace-ai/Qwen3.8-27B-MLX-Q5 | 27,36 B | no disponible | MLX safetensors, 5 bits | apache-2.0 | Hugging Face, 630 descargas |
| nace-ai/Qwen3.8-27B-MLX (Q4) | 27,36 B | no disponible | MLX safetensors, 4 bits | apache-2.0 | Hugging Face |
| mlx-community/Qwen3.8-27B-4bit | 27,36 B | no disponible | MLX safetensors, 4 bits | apache-2.0 | Hugging Face |
| mlx-works/Qwen3.8-27B-oQ4e-mtp | 27,36 B | no disponible | MLX safetensors, 4 bits | no disponible | Hugging Face |
| Qwen/Qwen3.8-27B (base) | 27,36 B | no disponible | safetensors BF16 | apache-2.0 | Hugging Face |

La diferencia medible entre estos paquetes es la fidelidad al BF16 (KL) y el tamaño de los pesos de lenguaje, no el rendimiento de tarea, para el que no hay datos publicados en esta información.

## Limitaciones y advertencias

- La comparación de KL entre paquetes no es estrictamente emparejada: los rivales se puntuaron en ejecuciones anteriores del test sin registrar todos los hashes, según el propio autor.
- El paquete declara únicamente inglés; no hay evidencia de calidad en otros idiomas y valores altos de presence_penalty pueden provocar mezcla de idiomas.
- La cabeza MTP opcional (`optiq/mtp.safetensors`) está incluida pero no fue cargada en ninguno de los tests del autor; su comportamiento no está validado.
- Los comandos de inicio rápido para este paquete concreto están todavía en fase de prueba según la model card; solo se garantiza que funcionaron los del paquete Qwen3.5-9B Q4.
- El formato MLX limita el despliegue a entornos Apple Silicon con mlx-lm; no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- No se publican datos sobre longitud de contexto, composición del dataset de entrenamiento ni benchmarks de tarea (MMLU, HumanEval, GSM8K), lo que impide evaluar el rendimiento real más allá de la fidelidad de cuantización.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; se heredan del modelo base Qwen/Qwen3.8-27B.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los componentes de terceros (torre de visión de mlx-community, revisión a95c2908).
- La cuantización a 5 bits introduce degradación medible (KL 0,0219 en texto original y 0,1340 en texto de chat y tool-call); para tareas sensibles a la fidelidad exacta, considerar el BF16 original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX-Q5
- Variante Q4 en el mismo repositorio: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX/tree/main/Q5
- Paquete Q4 hermano: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Buenas practicas del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B#best-practices
- Resultados completos de la medicion: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX-Q5/blob/main/results.json
- Origen de la torre de vision y cabeza MTP: https://huggingface.co/mlx-community/Qwen3.8-27B-OptiQ-4bit/tree/a95c2908fa8ca27cbf29ed86da9a658d14093b63
- Paquete mlx-community 4-bit: https://huggingface.co/mlx-community/Qwen3.8-27B-4bit
- Paquete lmstudio-community 4-bit: https://huggingface.co/lmstudio-community/Qwen3.8-27B-MLX-4bit
- Paquete mlx-works oQ4e-mtp: https://huggingface.co/mlx-works/Qwen3.8-27B-oQ4e-mtp
- Model card de referencia del autor (Qwen3.5-9B Q4): https://huggingface.co/nace-ai/Qwen3.5-9B-MLX
