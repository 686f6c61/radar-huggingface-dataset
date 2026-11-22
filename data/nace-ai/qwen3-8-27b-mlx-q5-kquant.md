# nace-ai/Qwen3.8-27B-MLX-Q5-KQuant

## Resumen

nace-ai/Qwen3.8-27B-MLX-Q5-KQuant es una cuantización de 5 bits en formato MLX del modelo multimodal Qwen/Qwen3.8-27B, publicada por Nace.AI para su ejecución en Apple Silicon. El pack contiene 27.356.728.560 parámetros totales (según los safetensors del repositorio) y un total de 20,7 GB de archivos, de los cuales 19,43 GB corresponden a los pesos del modelo de lenguaje y 921,46 MB a la torre de visión heredada del modelo base. La arquitectura subyacente es Qwen3.5 (tag `qwen3_5`), un transformer multimodal de tipo image-text-to-text.

El interés de esta publicación no reside en el modelo original, sino en el método de cuantización: Nace.AI afirma que su esquema de 5 bits queda "2,5 veces más cerca" del modelo BF16 original que los packs de 4 bits de mlx-community y lmstudio-community, medido como divergencia KL sobre distribución de siguiente token. Concretamente, reporta una KL de 0,0219 frente a 0,0538 del pack de mlx-community, a costa de un 28 % más de peso (19,43 GB frente a 15,13 GB).

Es relevante ahora porque permite ejecutar localmente un modelo de 27B con capacidades de visión, tool calling y modo de razonamiento explícito en Macs con memoria unificada, manteniendo una fidelidad al BF16 notablemente superior a las alternativas de 4 bits disponibles en el ecosistema MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5 |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el modelo base permite hasta 32.768 tokens de salida según la card) |
| Tipos de cuantizacion | 5 bits (MLX); el repositorio incluye tag de 4 bits, pero el pack principal es Q5 |
| Idiomas soportados | en (inglés, según la card; el modelo base Qwen suele ser multilingüe, pero no se documenta aquí) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), 3 archivos, 20.661.452.485 bytes |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.8-27B es un transformer multimodal de la familia Qwen3.5, con una torre de visión independiente (333 tensores, 921.460.192 bytes) y un cabezal de lenguaje de aproximadamente 19,4 GB en BF16. La card del pack no documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esa información correspondería a la card del modelo base, no incluida en la información proporcionada. Sí se menciona la existencia de un cabezal MTP (multi-token prediction) opcional en `optiq/mtp.safetensors`, procedente de mlx-community, aunque el autor indica que ninguno de sus tests lo cargó.

La innovación técnica destacable es el propio proceso de cuantización de Nace.AI: en lugar de minimizar únicamente el error de reconstrucción de pesos, ajustan cada grupo de pesos contra el comportamiento del modelo en texto real, midiendo la divergencia KL de las distribuciones de siguiente token frente al BF16. El pack conserva el tokenizador y la plantilla de chat del modelo base byte a byte, y mantiene la torre de visión fijada por hash. Se reporta una KL de 0,0219 sobre texto original (32.704 tokens evaluados) y de 0,1340 sobre texto de chat y tool-call (65.472 tokens), con una concordancia top-1 del 94,9 % respecto al BF16.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activado por defecto, que produce cadenas de razonamiento antes de la respuesta final.
- Comprensión de imágenes (pipeline image-text-to-text), gracias a la torre de visión incluida.
- Tool calling / function calling: la card reporta 20 de 20 ensayos con thinking desactivado que colocaron la llamada y completaron el round trip sin llamadas extra.
- Razonamiento multi-paso y uso como agente, apoyado por el modo thinking y la ventana de salida de hasta 32.768 tokens.
- Generación de código y matemáticas: capacidad heredada del modelo base Qwen3.8-27B, aunque no se aportan benchmarks específicos en este pack.
- Multilingüe: la card solo declara inglés (`en`); no se documenta soporte de otros idiomas en este repositorio.

## Casos de uso

- Asistente local en Mac con memoria unificada: el pack de 20,7 GB cabe en equipos Apple Silicon de 32 GB o más, permitiendo un asistente conversacional privado sin conexión, con modo thinking para preguntas complejas.
- Análisis de documentos e imágenes: al ser image-text-to-text, puede extraer información de capturas, diagramas o documentos escaneados y razonar sobre ellos en local.
- Automatización de tool calling en flujos agénticos: los ensayos reportados (20/20 con thinking off) lo hacen adecuado para pipelines donde el modelo debe emitir llamadas a funciones de forma fiable, como consultas a APIs internas o ejecución de comandos.
- Generación y revisión de código en el editor: integrable vía mlx-lm en entornos locales para autocompletado, refactorización y explicación de código, con la ventaja de no enviar código a servicios externos.
- Prototipado de razonamiento multi-paso: el modo thinking con hasta 32.768 tokens de salida permite resolver problemas de lógica o matemáticas que requieren cadenas largas de deducción.
- Evaluación de cuantizaciones: sirve como referencia práctica para comparar fidelidad frente a BF16 en proyectos que necesiten decidir entre packs de 4 y 5 bits en MLX.
- Investigación sobre cuantización: el `results.json` publicado permite reproducir y auditar las métricas KL, útil para estudiar el impacto de la cuantización en la distribución de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La card solo aporta métricas de fidelidad de cuantización:

| Metrica | Nace Q5 (este repo) | Tokens evaluados |
|---|---:|---:|
| KL frente a BF16, texto original (menor es mejor) | 0,0219 | 32.704 |
| KL frente a BF16, texto de chat y tool-call | 0,1340 | 65.472 |
| Concordancia top-1 con BF16, texto original | 94,9 % | 32.704 |

Comparativa de packs MLX del mismo modelo base, según la card:

| Pack | Pesos LM (GB) | KL texto original |
|---|---:|---:|
| Nace Q5 (este repo) | 19,425 | 0,0219 |
| Nace Q4 | 15,133 | 0,0349 |
| mlx-works oQ4e-mtp | 16,050 | 0,0358 |
| mlx-community 4-bit | 15,133 | 0,0538 |
| lmstudio-community 4-bit | 15,133 | 0,0544 |

El autor advierte que los packs comparados se puntuaron en ejecuciones anteriores del mismo test que no registraron todos los hashes, por lo que la comparación no es estrictamente emparejada.

## Requisitos de hardware

- VRAM/memoria unificada estimada: unos 20,7 GB de archivos, más overhead de runtime; en la práctica requiere un Mac con al menos 32 GB de memoria unificada para dejar margen al contexto y a la torre de visión.
- GPU recomendadas: Apple Silicon (M-series) con memoria unificada suficiente; el pack está diseñado para MLX, no para CUDA. La card menciona ejecuciones en "MLX 0.32.4 CUDA" para los tests de tool calling, pero el destino del pack es Apple Silicon.
- ¿Cabe en GPU consumer? No en GPUs NVIDIA de 24 GB en su formato nativo MLX; para CUDA habría que recurrir a otros formatos (GGUF, AWQ) del modelo base.
- Opciones de despliegue: mlx-lm (versión probada 0.32.2) y ecosistema MLX (mlx 0.32.4); no se documentan vLLM, llama.cpp, Ollama ni TGI para este pack.
- Latencia y throughput: no disponibles en la información proporcionada.
- Runtime de referencia declarado: mlx 0.32.4, mlx-lm 0.32.2, transformers 5.22.2, numpy 2.5.4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| nace-ai/Qwen3.8-27B-MLX-Q5-KQuant | 27,36 B | no disponible | MLX safetensors 5-bit | apache-2.0 | KL 0,0219; 19,43 GB LM |
| nace-ai/Qwen3.8-27B-MLX (Q4) | 27,36 B (base) | no disponible | MLX 4-bit | apache-2.0 | KL 0,0349; 15,13 GB LM |
| mlx-community/Qwen3.8-27B-4bit | 27,36 B (base) | no disponible | MLX 4-bit | apache-2.0 | KL 0,0538; 15,13 GB LM |
| lmstudio-community/Qwen3.8-27B-MLX-4bit | 27,36 B (base) | no disponible | MLX 4-bit | apache-2.0 | KL 0,0544; 15,13 GB LM |

No se dispone de datos de benchmarks de tareas que permitan comparar rendimiento funcional con modelos de otras familias o tamaños.

## Limitaciones y advertencias

- La cuantización introduce degradación respecto al BF16: la KL de 0,1340 en texto de chat y tool-call es notablemente superior a la de texto original, lo que sugiere mayor desviación en conversaciones y llamadas a herramientas.
- La comparación con otros packs no es estrictamente emparejada, según admite el propio autor, por lo que las cifras relativas deben tomarse con cautela.
- Solo se declara soporte de inglés en la card; el comportamiento en castellano u otros idiomas no está documentado para este pack.
- Riesgo de alucinación inherente al modelo base; no se aportan evaluaciones de factualidad.
- El modo thinking está activado por defecto y consume muchos tokens de salida (hasta 32.768 recomendados), lo que aumenta latencia y coste computacional.
- La presencia de `presence_penalty` altos puede mezclar idiomas, según advierte la card.
- El pack es específico para MLX/Apple Silicon; no es directamente usable en CUDA sin reconvertir.
- El cabezal MTP opcional no fue probado por el autor, por lo que su funcionamiento no está validado.
- Licencia apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.8-27B, que no se detallan aquí.
- Sesgos conocidos del modelo base: no documentados en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX-Q5-KQuant
- Pack Q4 del mismo autor: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Resultados de medición: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX-Q5-KQuant/blob/main/results.json
- mlx-community 4-bit: https://huggingface.co/mlx-community/Qwen3.8-27B-4bit
- lmstudio-community 4-bit: https://huggingface.co/lmstudio-community/Qwen3.8-27B-MLX-4bit
- mlx-works oQ4e-mtp: https://huggingface.co/mlx-works/Qwen3.8-27B-oQ4e-mtp
- Origen de la torre de visión y cabezal MTP: https://huggingface.co/mlx-community/Qwen3.8-27B-OptiQ-4bit
