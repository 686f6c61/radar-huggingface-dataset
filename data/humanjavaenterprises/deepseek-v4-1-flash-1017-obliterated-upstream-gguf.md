# HumanjavaEnterprises/DeepSeek-V4.1-Flash-1017-obliterated-upstream-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-obliterated-upstream-GGUF es una cuantización GGUF del modelo OBLITERATUS/DeepSeek-V4.1-Flash-1017-obliterated, un transformer de tipo Mixture of Experts (MoE) con 748.494.643.824 parámetros totales y la dirección de rechazo (refusal direction) ablacionada. Lo publica HumanjavaEnterprises, que no ha realizado ablación, fine-tuning ni merging propios: se limita a cuantizar los pesos del modelo base con su propia imatrix y un mapa de tipos por tensor GSQ-RCO de ISTA-DASLab. El resultado son 26 ficheros GGUF en formato IQ2_XXS (aproximadamente 2,6 bits por peso) pensados para ejecutarse en una única GPU de 96 GB más RAM de sistema con llama.cpp upstream sin parches.

El interés técnico está en la ingeniería de despliegue: el modelo completo no cabe en una GPU, pero todos los expertos enrutados (15.360) pueden residir en RAM del host mientras una caché LRU (`--moe-cache-mib`) mantiene los más usados en VRAM. Con esa configuración el autor reporta 63-74 tok/s de decodificación y 500-580 tok/s de prefill en una tarjeta de 96 GB, y 80-102 tok/s en código si se añade el drafter especulativo DSpark de unsloth. Es relevante para quien quiera evaluar modelos de escala frontera en hardware de una sola máquina, asumiendo que el modelo no tiene ajuste de seguridad.

La model card es explícita sobre los límites de la evidencia: la comprobación de rechazos se hizo con 20 prompts en inglés, temperatura 0 y modo thinking desactivado, con una heurística de palabras clave leída a mano, y el autor advierte que no ha podido medir los pesos BF16 originales porque no caben en su hardware. La licencia es MIT, pero el comportamiento del modelo es el de un modelo sin alineación de seguridad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), con ablación de la dirección de rechazo; incluye tabla Engram de 105 GB |
| Parámetros totales | 748.494.643.824 |
| Parámetros activos | no disponible |
| Longitud de contexto | 32.768 tokens en el comando de ejemplo (`-c 32768`); máximo nativo no disponible |
| Tipos de cuantización | IQ2_XXS (mezcla por tensor con mapa GSQ-RCO de ISTA-DASLab); aproximadamente 2,6 bits por peso |
| Idiomas soportados | no disponible (la evaluación de rechazos se hizo solo en inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (26 fragmentos `*-000NN-of-00026.gguf`, con `SHA256SUMS`) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de 748B parámetros con 15.360 expertos enrutados. Sobre esos pesos, OBLITERATUS aplicó una ablación de la dirección de rechazo, es decir, una intervención sobre las activaciones o pesos para reducir la probabilidad de respuestas de negativa. HumanjavaEnterprises no documenta la composición del dataset de entrenamiento original, el número de tokens, ni si hubo RLHF, DPO u otras fases de alineación; esa información no está disponible en la documentación proporcionada. La model card menciona además una tabla Engram de 105 GB que se lee de forma perezosa desde disco, un componente que no se describe en detalle.

La contribución técnica del repositorio es la cuantización: mapa de tipos por tensor GSQ-RCO de ISTA-DASLab e imatrix calculada por el propio autor sobre este modelo, cubriendo los 15.360 expertos. El despliegue usa llama.cpp upstream (`de5122d8` o posterior, y en la práctica `ca8daad1`), con `-ot '_exps=CPU'` para mantener los expertos en RAM, `--moe-cache-mib` para cachear en VRAM los expertos más usados (LRU, PR upstream #29887) y `-lm none` para cargar los pesos en RAM en lugar de mapearlos (126 GiB residentes). Se documenta también decodificación especulativa con el drafter DSpark de unsloth (MIT, 8 GB), con `--spec-type draft-dspark` y `--spec-draft-n-max 2`; el autor señala que redactar 3 tokens fue más lento que 2 y que ngram-mod no aportó nada con la caché activa.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `conversational` del repositorio.
- Razonamiento y matemáticas: GSM8K del 97,2% en la evaluación del autor, con 250 ejemplos.
- Conocimiento general: MMLU del 83,6% con 500 ejemplos.
- Generación de código: el autor mide 80-102 tok/s con decodificación especulativa DSpark en tareas de código, lo que indica uso previsto en ese dominio, aunque no se publican resultados de HumanEval ni similares.
- Modo thinking: existe y se puede desactivar mediante `--chat-template-kwargs '{"enable_thinking":false}'`; el autor indica que sus evaluaciones se hicieron con thinking desactivado y que el modo thinking puede comportarse de forma distinta.
- Comportamiento menos restrictivo: en la comprobación de 20 prompts, los rechazos bajan de 19 (modelo base en la cuantización de ISTA) a 7.
- Tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la única evaluación cualitativa es en inglés.
- Visión y audio: no disponible.

## Casos de uso

- Evaluación de modelos a escala frontera en una sola máquina: permite ejecutar un MoE de 748B en una GPU de 96 GB más unos 130 GB de RAM libre, lo que sirve para estudiar calidad, perplejidad y comportamiento de un modelo grande sin clúster multi-GPU.
- Investigación sobre ablación y alineación: el par formado por este GGUF y la cuantización GSQ-RCO del modelo base permite comparar tasas de rechazo (7 frente a 19 sobre 20 prompts) y estudiar cuánto del efecto de la ablación sobrevive a una cuantización agresiva a 2,6 bits por peso.
- Generación de código interactiva: con el drafter DSpark se alcanzan 80-102 tok/s en código con una tasa de aceptación de borradores del 78-84%, adecuado para asistentes de programación en local donde la latencia importa.
- Procesamiento por lotes de documentos largos: con 32.768 tokens de contexto y un prefill de 500-580 tok/s en caliente, es viable resumir o extraer información de documentos extensos en pipelines offline.
- Experimentación con cuantizaciones extremas: el repositorio documenta la receta, las herramientas y las evaluaciones en GitHub, de modo que sirve como referencia reproducible para construir cuantizaciones propias de cualquier checkpoint de DeepSeek-V4.1-Flash.
- Investigación sobre seguridad y filtrado de contenido: al ser un modelo sin ajuste de seguridad, es útil para construir clasificadores, probar sistemas de moderación o estudiar qué tipos de peticiones siguen recibiendo negativas suaves pese a la ablación.
- Despliegue de bajo coste por token en hardware propio: la combinación de expertos en RAM y caché LRU en VRAM reduce el coste frente a servir el modelo en BF16, a cambio de menor throughput.

## Benchmarks y rendimiento

Resultados publicados por el autor, comparados con la cuantización GSQ-RCO de ISTA sobre el modelo base:

| Métrica | Esta build | ISTA GSQ-RCO (modelo base) |
|---|---|---|
| Perplejidad wikitext-2 | 3,638 ± 0,040 | 3,507 ± 0,040 |
| GSM8K (250) | 97,2% | 97,2% |
| MMLU (500) | 83,6% | 84,4% |
| Rechazos (20 prompts) | 7 | 19 |

Rendimiento de inferencia medido el 2026-11-03 en una GPU de 96 GB, sin especulación y con `cache_prompt:false`:

| Configuración | Decodificación | Prefill |
|---|---|---|
| Caché MoE de 80.000 MiB, sin especulación | 63-74 tok/s | 500-580 tok/s (en caliente) |
| Caché MoE de 72.000 MiB + DSpark (código) | 80-102 tok/s | no disponible |
| Caché MoE de 72.000 MiB + DSpark (prosa) | 68-74 tok/s | no disponible |
| Reparto por capas antiguo | 21-27 tok/s | no disponible |

El autor advierte que los 8,8 tok/s de la ejecución de evaluación se debieron a un bug de la caché de prompts del harness, no al modelo.

## Requisitos de hardware

- VRAM: una GPU de 96 GB para el comando de referencia; con tarjetas menores hay que reducir `--moe-cache-mib` y se obtiene menos rendimiento.
- RAM del sistema: aproximadamente 130 GB libres; los pesos ocupan 126 GiB residentes con `-lm none`, y la tabla Engram de 105 GB se lee de forma perezosa desde disco.
- Almacenamiento: el repositorio ocupa 252,1 GB; conviene disco rápido porque la tabla Engram se lee desde disco.
- GPU recomendadas: tarjetas de 96 GB (por ejemplo, variantes profesionales con esa capacidad); no se documentan resultados en A100 de 80 GB, H100 ni RTX 4090.
- GPU de consumo: no cabe en una RTX 4090 de 24 GB con esta configuración; el autor no publica una receta para ese caso.
- Opciones de despliegue: llama.cpp upstream desde el 2026-11-03 (el autor usa `ca8daad1`), con `llama-server`; se requiere una versión que incluya el arreglo de caché de prompts para el issue #30944. No se documenta vLLM, TGI ni Ollama.
- Decodificación especulativa: drafter DSpark de unsloth en Q8_0 (8 GB, MIT), descargado aparte.
- Latencia y throughput: ver la tabla de benchmarks; la velocidad sube durante los primeros cientos de tokens mientras se llena la caché MoE.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (DeepSeek-V4.1-Flash-1017-obliterated, IQ2_XXS) | 748,5B (MoE) | 32.768 en el ejemplo | MIT | GGUF, 26 fragmentos | Sin ajuste de seguridad; 7/20 rechazos; perplejidad 3,638 |
| OBLITERATUS/DeepSeek-V4.1-Flash-1017-obliterated | 748,5B (MoE) | no disponible | no disponible | BF16 (pesos originales) | Modelo base con ablación; el autor no pudo medirlo por falta de hardware |
| Cuantización GSQ-RCO de ISTA del modelo base | 748,5B (MoE) | no disponible | no disponible | GGUF | 19/20 rechazos; perplejidad 3,507; GSM8K 97,2%; MMLU 84,4% |
| unsloth/DeepSeek-V4.1-Flash-1017-GGUF (drafter DSpark) | no disponible | no disponible | MIT | GGUF Q8_0 | Drafter especulativo de 8 GB, no un modelo completo |

No se dispone de datos para comparar con alternativas de otros fabricantes del mismo tamaño o tarea.

## Limitaciones y advertencias

- El modelo no tiene ajuste de seguridad, filtrado ni moderación; producirá contenido que un modelo estándar rechaza, y el usuario es responsable del uso.
- La ablación reduce los rechazos, no los elimina: quedan 7 de 20 en la comprobación del autor, y no se sabe qué parte corresponde a la ablación y qué parte a la cuantización a 2,6 bits por peso.
- La comprobación de rechazos usa 20 prompts en inglés, temperatura 0, thinking desactivado y una heurística de palabras clave leída a mano; no es un benchmark y no cubre otros temas, idiomas, conversaciones largas ni el modo thinking.
- El autor no ha reproducido las afirmaciones de seguridad o rechazo de OBLITERATUS ni ha medido los pesos BF16 originales.
- Solo se han medido matemáticas (GSM8K), conocimiento (MMLU) y perplejidad; no hay datos de código, tool calling, agentes ni multilingüismo.
- La cuantización a 2,6 bits puede degradar capacidades de forma desigual; la perplejidad sube de 3,507 a 3,638 respecto a la cuantización de ISTA.
- La salida con decodificación especulativa a temperatura 0 no es idéntica bit a bit a la decodificación normal (issue #31472); el autor recomienda desactivarla para evaluar.
- El despliegue exige hardware poco habitual (96 GB de VRAM más 130 GB de RAM) y una versión concreta de llama.cpp; versiones anteriores pueden fallar por el bug de caché de prompts #30944.
- La licencia MIT permite uso comercial, pero no exime de las obligaciones legales y de política de contenido aplicables al uso de un modelo sin alineación.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HumanjavaEnterprises/DeepSeek-V4.1-Flash-1017-obliterated-upstream-GGUF
- Modelo base: https://huggingface.co/OBLITERATUS/DeepSeek-V4.1-Flash-1017-obliterated
- Cuantización GSQ-RCO hermana: https://huggingface.co/HumanjavaEnterprises/DeepSeek-V4.1-Flash-1017-GSQ-RCO-upstream-GGUF
- Repositorio de receta, herramientas y evaluaciones: https://github.com/HumanjavaEnterprises/deepseek-v41-upstream
- Instrucciones de construcción: https://github.com/HumanjavaEnterprises/deepseek-v41-upstream/blob/main/build/README.md
- Evaluaciones: https://github.com/HumanjavaEnterprises/deepseek-v41-upstream/blob/main/EVALS.md
- Drafter especulativo DSpark (unsloth): https://huggingface.co/unsloth/DeepSeek-V4.1-Flash-1017-GGUF
- Issue de llama.cpp sobre caché de prompts: https://github.com/ggml-org/llama.cpp/issues/30944
- Issue de llama.cpp sobre decodificación especulativa: https://github.com/ggml-org/llama.cpp/issues/31472
- Paper referenciado en los tags (arXiv:2406.11717): https://arxiv.org/abs/2406.11717
