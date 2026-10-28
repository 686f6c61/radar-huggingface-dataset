# saadykh/Qwen3.8-4B-Distill

## Resumen

Qwen3.8-4B es un ajuste fino completo (full fine-tune) del modelo base Qwen3.5-4B de Alibaba Qwen, desarrollado por Empero. Se trata de una destilación off-policy: el estudiante (4,66 B parámetros densos) se entrena por SFT sobre ~45.000 trazas de cadena de pensamiento generadas por un profesor interno de escala frontera, Qwen3.8 2.4T A95B, un MoE con 2,4 billones de parámetros totales y ~95 B activos. El objetivo declarado es trasladar el comportamiento de razonamiento del profesor a un modelo que quepa en hardware de consumo.

La propuesta diferencial es que el razonamiento no es sintético ni auto-generado: cada respuesta se abre con un bloque `<think>` aprendido directamente de las trazas del profesor, con cobertura de matemáticas, razonamiento general y seguimiento de instrucciones. Hereda de la base una ventana de contexto nativa de 262.144 tokens, soporte nativo de function calling según la especificación de Qwen3.5 y la arquitectura híbrida de Qwen3.5 (atención lineal Gated DeltaNet combinada con atención completa).

Es relevante ahora por dos motivos. Primero, los resultados publicados muestran una mejora muy grande en MMLU CoT (de 0,354 a 0,553 en flexible-extract) respecto a la base, a costa de una caída en GSM8K CoT (de 0,850 a 0,785). Segundo, el repositorio de HuggingFace indicado (`saadykh/Qwen3.8-4B-Distill`) tiene 0 descargas y 0 likes y no coincide con el identificador oficial que aparece en la model card (`empero-ai/Qwen3.8-4B`), por lo que conviene verificar la procedencia antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido de Qwen3.5 (capas de atención lineal Gated DeltaNet + atención completa); ruta de texto de una base visión-lenguaje |
| Parámetros totales | 4.659.865.088 (≈4,66 B), según safetensors |
| Parámetros activos | No aplica: modelo denso. El profesor Qwen3.8 2.4T A95B es MoE con 2,4 T totales y ~95 B activos |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantización | No disponible. La model card menciona "quantized builds" sin especificar formatos ni repositorios GGUF/AWQ/GPTQ |
| Idiomas soportados | Inglés (declarado en la model card y en los metadatos del repo) |
| Licencia | Apache-2.0 (heredada de Qwen3.5-4B) |
| Formato de pesos | safetensors (formato Hugging Face Transformers) |
| Pipeline | text-generation (el repo declara además el tag `image-text-to-text`) |
| Tamaño del repositorio | 9,3 GB |
| Modelo base | Qwen/Qwen3.5-4B |
| Método de entrenamiento | SFT / destilación off-policy, ajuste fino de todos los parámetros (no es un adapter) |

## Arquitectura y entrenamiento

El estudiante conserva la arquitectura de Qwen3.5-4B: un transformer causal con capas de atención lineal basadas en Gated DeltaNet combinadas con capas de atención completa, más convoluciones causales (`causal_conv1d`). Para que las capas lineales no caigan en implementaciones PyTorch lentas y con alto consumo de memoria, la model card exige instalar los kernels de `flash-linear-attention` y una build de `causal_conv1d` compilada contra la versión de CUDA en uso. El modelo se describe como "ruta de texto de una base visión-lenguaje": el checkpoint base soporta image-text-to-text, pero el ajuste fino es solo de texto y el comportamiento en visión no se evaluó.

El entrenamiento es una destilación de parámetros completos (todos los pesos actualizados) sobre aproximadamente 45.000 trazas curadas del profesor Qwen3.8 2.4T A95B, filtradas por calidad antes del entrenamiento y centradas en matemáticas, razonamiento general y seguimiento de instrucciones. Se usaron TRL y Transformers. No se documentan número total de tokens de entrenamiento, composición exacta del dataset, ni fases de RLHF/DPO posteriores. La decodificación recomendada es `temperature=0.6, top_p=0.95, top_k=20`, con advertencia explícita de que la decodificación greedy en generaciones largas provoca bucles de repetición en esta clase de modelos de razonamiento.

## Capacidades

- Generación de texto con razonamiento explícito: cada respuesta abre un bloque `<think>...</think>` destilado de las trazas del profesor, que debe parsearse y eliminarse antes de mostrar al usuario final.
- Razonamiento matemático de varios pasos: 0,785 de exact-match en `gsm8k_cot` con el harness de EleutherAI.
- Conocimiento general y razonamiento de opción múltiple: 0,553 de accuracy en MMLU CoT (57 materias, ~1.700 preguntas, flexible-extract).
- Function calling nativo según la especificación de Qwen3.5, sin wrapper ni fine-tune específico de herramientas.
- Capacidad de operar como agente en flujos multi-paso, apoyada en la ventana de 262.144 tokens y en el soporte de tool calling.
- Seguimiento de instrucciones y formato conversacional (chat template de Qwen).
- Capacidades multilingües: limitadas al inglés según la declaración del autor; no se declaran otros idiomas.
- Visión: el modelo base es visión-lenguaje, pero el ajuste es solo de texto y el autor no evaluó el comportamiento visual.

## Casos de uso

- Tutor de matemáticas con traza visible: el modelo genera el desarrollo paso a paso dentro de `<think>` y la respuesta final después; útil en plataformas educativas que quieran mostrar el razonamiento al estudiante y colapsarlo al resto de usuarios. Adecuado por su 0,785 en GSM8K CoT en un tamaño de 4,66 B.
- Atención al cliente multi-turno con documentación larga: los 262.144 tokens de contexto permiten insertar manuales de producto, históricos de tickets y políticas internas en el mismo prompt sin trocear; el coste es que la KV cache a contexto completo es muy grande y exige GPU de datacenter.
- Agente de automatización con herramientas: el function calling nativo permite conectar el modelo a APIs internas (consulta de pedidos, creación de tickets, lectura de bases de datos) en bucles multi-paso orquestados por el runtime, sin capa de adaptación adicional.
- Extracción estructurada con razonamiento previo: para clasificar o extraer campos de documentos largos (contratos, informes), el bloque `<think>` fuerza un análisis explícito antes de emitir el JSON, lo que reduce extracciones prematuras en esquemas complejos.
- Prototipado local con datos sensibles: en bf16 ocupa del orden de 9 GB de pesos (la model card indica ~8 GB) y en cuantización de 4 bits rondaría los 2,5 GB, por lo que puede ejecutarse en un portátil con GPU discreta o en una estación de trabajo sin enviar datos a la nube.
- Investigación sobre destilación de CoT: sirve como caso de estudio reproducible de transferencia de razonamiento de un profesor MoE de escala frontera a un estudiante denso pequeño, con evaluación pública en lm-evaluation-harness y una delta medible frente a la base.
- Generación de documentación técnica y resúmenes analíticos: la ventana larga permite resumir repositorios completos o transcripciones extensas en una sola pasada, aunque la precisión factual en conocimiento general (MMLU 0,553) aconseja revisión humana.

## Benchmarks y rendimiento

Medidos con `lm-evaluation-harness` (backend HF, mismos ajustes para base y estudiante), protocolos CoT (`gsm8k_cot`, `mmlu_flan_cot_zeroshot`), MMLU con las 57 materias. Muestreo: `temperature=0.6, top_p=0.95, top_k=20`.

| Tarea | Métrica | Qwen3.5-4B (base) | Qwen3.8-4B | Δ |
|---|---|---:|---:|---:|
| gsm8k_cot | exact_match (flexible) | 0,850 | 0,785 | −0,065 |
| gsm8k_cot | exact_match (strict) | 0,850 | 0,785 | −0,065 |
| mmlu (CoT, 57 materias) | acc (flexible-extract) | 0,354 | 0,553 | +0,199 |
| mmlu (CoT, 57 materias) | acc (strict-match) | 0,071 | 0,233 | +0,162 |

Observaciones sobre los datos: la mejora en MMLU es sustancial en ambas métricas, pero la brecha entre flexible-extract (0,553) y strict-match (0,233) indica alta sensibilidad al formato de respuesta; en GSM8K el ajuste pierde 6,5 puntos respecto a la base. Los valores absolutos de MMLU son bajos para un modelo de razonamiento y no son directamente comparables con cifras publicadas por otros proveedores con protocolos distintos (por ejemplo, MMLU de 5 disparos sin CoT). No hay datos publicados de HumanEval, MBPP, MATH, contextos largos ni evaluación de function calling.

## Requisitos de hardware

- VRAM en bf16: del orden de 9,3 GB solo para pesos (4,66 B × 2 bytes); la model card afirma que "bf16 fits in ~8 GB". Estimación propia a partir del recuento de parámetros, no medida por el autor.
- VRAM en cuantización de 8 bits: ~4,7 GB estimados. En 4 bits: ~2,4-2,6 GB estimados. Los formatos concretos de cuantización no están publicados.
- Atención a la KV cache: con 262.144 tokens de contexto, la memoria de caché domina el consumo y crece linealmente con la longitud; usar el contexto completo requiere GPU de datacenter (A100 80 GB, H100 80 GB) o paralelización tensorial.
- GPU de consumo: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) en bf16 con contexto moderado; en 4 bits es viable en GPUs de 8-12 GB (RTX 4060 Ti, RTX 3080, portátiles gaming).
- Despliegue: Transformers (requiere una versión reciente con soporte de Qwen3.5), vLLM y SGLang, según la model card. No se confirma soporte de llama.cpp, Ollama ni TGI, ni existen repositorios GGUF publicados.
- Dependencias obligatorias: kernels `flash-linear-attention` y `causal_conv1d` compilado contra el CUDA local; sin ellos las capas de atención lineal usan implementaciones PyTorch lentas y con alto consumo de memoria.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia en ningún runtime.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU CoT (flex.) | GSM8K CoT | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Qwen3.8-4B (este) | 4,66 B densos | 262.144 | 0,553 | 0,785 | Apache-2.0 | Pesos en HF (repo `saadykh`, 0 descargas) |
| Qwen3.5-4B (base) | ~4 B densos | 262.144 | 0,354 | 0,850 | Apache-2.0 | Pesos en HF (Qwen oficial) |
| Qwen3.8-9B (misma familia) | ~9 B (según model card) | No disponible | No disponible | No disponible | No disponible en la información | Pesos en HF (`empero-ai`) |

Frente a la base, el ajuste gana 19,9 puntos en MMLU CoT y pierde 6,5 en GSM8K: no es una mejora uniforme, sino un desplazamiento del perfil hacia conocimiento y razonamiento general. La model card recomienda Qwen3.8-9B para el mejor rendimiento en código dentro de la familia, pero no publica cifras que permitan cuantificar la diferencia. No se dispone de datos para comparar con alternativas de otros fabricantes en la misma franja de 4 B.

## Limitaciones y advertencias

- Solo inglés declarado. No hay evidencia de calidad en castellano ni en otros idiomas, aunque la base Qwen3.5 sea multilingüe.
- Regresión en matemáticas: GSM8K CoT baja de 0,850 a 0,785 respecto a la base. Si el caso de uso es aritmética, el modelo base es mejor opción.
- MMLU CoT de 0,553 implica que falla aproximadamente 45 de cada 100 preguntas de conocimiento general en formato de opción múltiple; alto riesgo de respuestas plausibles pero incorrectas en dominios factuales.
- Sensibilidad al formato: la diferencia entre 0,553 (flexible-extract) y 0,233 (strict-match) indica que el modelo no respeta de forma fiable las instrucciones estrictas de formato de respuesta. En producción con parseo rígido hay que validar y post-procesar.
- Bucles de repetición con decodificación greedy en generaciones largas; el autor recomienda explícitamente muestreo con `temperature=0.6, top_p=0.95, top_k=20` y `max_new_tokens` generoso (16.384).
- Los bloques `<think>` deben parsearse y eliminarse; los tokens de razonamiento consumen presupuesto de salida y aumentan la latencia percibida.
- Dataset de entrenamiento pequeño (~45.000 trazas) y sin documentación de composición: riesgo de sobreajuste al estilo del profesor y de cobertura desigual de dominios.
- El ajuste es solo de texto; aunque el repo declare el tag `image-text-to-text`, el comportamiento en visión no se evaluó.
- Procedencia a verificar: el repositorio indicado (`saadykh/Qwen3.8-4B-Distill`) tiene 0 descargas y 0 likes y difiere del identificador oficial de la model card (`empero-ai/Qwen3.8-4B`). Confirmar el hash de los pesos antes de desplegar.
- Licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base Qwen3.5-4B; conviene revisar los términos del modelo base si se redistribuye.

## Enlaces

- HuggingFace (repo indicado): https://huggingface.co/saadykh/Qwen3.8-4B-Distill
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo relacionado Qwen3.8-9B: https://huggingface.co/empero-ai/Qwen3.8-9B
- Sitio del desarrollador (Empero): https://empero.org
- Kernels de atención lineal (flash-linear-attention): https://github.com/fla-org/flash-linear-attention
- Kernels causal_conv1d: https://github.com/Dao-AILab/causal-conv1d
- Framework de entrenamiento (TRL): https://github.com/huggingface/trl
- Framework de inferencia (Transformers): https://github.com/huggingface/transformers
- Harness de evaluación (lm-evaluation-harness): https://github.com/EleutherAI/lm-evaluation-harness
