# jgt87/Qwen3.8-27B-Uncensored-NPU2

## Resumen

Qwen3.8-27B-Uncensored-NPU2 es un build de inferencia para NPU del modelo Qwen3.8-27B en su variante "uncensored", publicada por el usuario jgt87. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión de formato: toma los pesos ya abliterados de JonathanColetti/Qwen3.8-27B-Uncensored-GGUF y los reempaqueta en el formato Q4NX (NPU2) de FastFlowLM para que puedan ejecutarse sobre la NPU AMD XDNA2 (familia Ryzen AI 300) en lugar de CPU o GPU.

El modelo base subyacente es Qwen/Qwen3.8-27B, un transformer denso híbrido con delta-net y atención completa, 64 capas, torre de visión y una capa MTP (multi-token prediction) para decodificación especulativa. Sobre esa base, el autor original aplicó abliteration con Heretic, una técnica que minimiza simultáneamente los rechazos y la divergencia KL respecto al modelo original, sin finetuning ni datos de entrenamiento adicionales.

La relevancia de este repo es doble: por un lado demuestra que es viable portar modelos abliterados al ecosistema NPU de AMD manteniendo la cabeza MTP y el soporte de visión; por otro, documenta con detalle el proceso de conversión y las métricas de fidelidad frente al build oficial, lo que lo convierte en una referencia útil para quien quiera replicar el flujo con otros modelos. El rendimiento medido es modesto (1,9–2,8 tok/s en decodificación), coherente con la NPU de un portátil.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido: delta-net + atención completa, 64 capas, torre de visión, 1 capa MTP |
| Parámetros totales | 27B (según denominación del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4K en las pruebas de rendimiento reportadas; contexto máximo del modelo base no disponible |
| Tipos de cuantización | 4-bit FLM q4_k (Q4NX); embeddings, lm_head y componentes delta-net en Q8NX; origen Q8_0 GGUF |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | Q4NX (NPU2), archivos `model.q4nx` y `vision_weight.q4nx` |

## Arquitectura y entrenamiento

La arquitectura heredada del modelo base Qwen3.8-27B combina capas de delta-net (una variante de atención lineal) con capas de atención completa en un stack de 64 capas, e incorpora una torre de visión para entrada image-text-to-text y una capa MTP dedicada a decodificación especulativa. El repo NPU2 conserva esa estructura íntegra: el archivo `model.q4nx` se convirtió desde el GGUF Q8_0 del modelo uncensored, incluyendo el bloque MTP, y `vision_weight.q4nx` se tomó directamente del build oficial FastFlowLM/Qwen3.8-27B-NPU2 porque la edición de abliteration no toca la torre de visión.

El proceso de "entrenamiento" del modelo uncensored no es tal: se aplicó abliteration con Heretic en bf16, fusionando una LoRA en la base bf16 y modificando únicamente `attn.o_proj` y `mlp.down_proj` del stack principal. La cabeza MTP se copió literalmente del modelo base. La conversión a NPU2 se realizó con el conversor comunitario FLM_Q4NX_Converter (PR #11), y se validó contra el `model.q4nx` oficial: mismo tamaño en bytes, 962 tensores con nombre, dtype y formato empaquetado coincidentes, y coseno mínimo de 0,9947 en las capas tardías `o_proj`/`down_proj` (el resto entre 0,996 y 1,0000). El error de cuantización 4-bit frente al Q8_0 de origen es 0,072 de L2 relativo, comparable al 0,074–0,075 del build oficial.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento y conocimiento general (MMLU 83,3 en el modelo uncensored, 0-shot, bf16).
- Entrada image-text-to-text gracias a la torre de visión conservada del build oficial.
- Decodificación especulativa mediante la cabeza MTP integrada y compatible con el drafter oficial Qwen3.8-27B-DFlash2-NPU2 (longitud de aceptación 3,49 frente a 3,61 del base oficial).
- Modo "thinking" y "non-thinking" heredados del modelo base (las métricas de rechazo se midieron solo en non-thinking).
- Comportamiento "uncensored": tasa de rechazo reducida de 98/100 a 12/100 en un conjunto de 100 prompts de `mlabonne/harmful_behaviors`.
- No se documenta soporte explícito de tool calling ni de flujos de agentes multi-paso en la información disponible.

## Casos de uso

- Investigación sobre alineación y abliteration: permite estudiar en hardware NPU cómo varía la tasa de rechazo y la estabilidad del comportamiento cerca del antiguo límite de negativa, con un modelo que mantiene el 96,7% de coincidencia en el token top respecto al base.
- Evaluación de fidelidad de conversión de formatos: sirve como caso de referencia para validar pipelines de conversión GGUF→Q4NX comparando cosenos por tensor y error L2 relativo frente al build oficial.
- Prototipado en portátiles con Ryzen AI 300: despliegue local de un modelo de 27B con visión sin GPU dedicada, útil para demos offline y entornos con restricciones de conectividad.
- Procesamiento de documentos con imagen y texto: la torre de visión permite tareas image-text-to-text en local, aunque sin benchmarks publicados de calidad en esa modalidad.
- Generación de código asistida en local: el drafter DFlash2 reporta las mayores ganancias en código (hasta 4,5 tok/s), lo que lo hace viable para autocompletado interactivo de baja exigencia.
- Experimentación con decodificación especulativa: la combinación MTP + DFlash2 sobre NPU permite medir aceptación y throughput en un entorno consumer.
- Estudio de drift respecto al modelo original: con perplejidad wikitext-2 de 6,56 frente a 6,51 y KL medio de 0,014, es útil para cuantificar el coste de la abliteration en tareas de lenguaje general.

## Benchmarks y rendimiento

Resultados de capacidad del modelo uncensored frente al base (0-shot, bf16, según la model card del modelo fuente):

| Benchmark | Base Qwen3.8-27B | Uncensored | Delta |
|---|---|---|---|
| MMLU | 83,4 | 83,3 | −0,1 |
| ARC-Challenge | 58,9 | 57,7 | −1,2 |
| HellaSwag | 82,8 | 82,9 | +0,1 |
| Winogrande | 76,1 | 75,3 | −0,8 |
| Media | — | — | −0,5 |
| Rechazos (100 prompts) | 98/100 | 12/100 | −86 |
| Perplejidad wikitext-2 | 6,51 | 6,56 | +0,05 |
| KL medio al base | — | 0,014 | — |
| Coincidencia token top | — | 96,7% | — |

Rendimiento de decodificación en Ryzen AI 9 HX 370 con FLM 1.0.12, contexto 4K, reasoning off:

| Configuración | tok/s |
|---|---|
| Este modelo | 1,9 – 2,8 |
| Qwen3.8-27B-NPU2 oficial (mismos prompts) | 1,8 – 2,8 |
| Este modelo + drafter DFlash2 oficial | 2,1 – 4,5 |

No se han publicado resultados de GSM8K, código, matemáticas, multilingüe ni de la torre de visión en la información disponible.

## Requisitos de hardware

- NPU AMD XDNA2 (familia Ryzen AI 300); probado en Ryzen AI 9 HX 370.
- Requiere FastFlowLM 1.0.7 o superior (validado en 1.0.12) y el motor oficial `qwen3.8-mtp:27b` instalado, ya que reutiliza sus kernels (`xclbins/Qwen3.8-27B-NPU2`).
- Tamaño del repo: 18,1 GB, correspondiente a los pesos Q4NX empaquetados.
- No está pensado para GPU ni CPU: el formato Q4NX es específico de la NPU y el flujo de despliegue pasa por `flm run` / `flm serve`, no por vLLM, llama.cpp, Ollama o TGI.
- Throughput medido: 1,9–2,8 tok/s en decodificación; con drafter DFlash2, 2,1–4,5 tok/s.
- Advertencia operativa: no añadir el modelo a `model_info.json` con los hashes oficiales ni ejecutar `flm check` contra esa entrada, porque FLM interpreta el desajuste de hash como corrupción y borra el archivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / hardware | Licencia | Notas |
|---|---|---|---|---|---|
| jgt87/Qwen3.8-27B-Uncensored-NPU2 | 27B | 4K probado | Q4NX / NPU AMD XDNA2 | Apache 2.0 | Abliterado, con MTP y visión |
| FastFlowLM/Qwen3.8-27B-NPU2 | 27B | 4K probado | Q4NX / NPU AMD XDNA2 | no disponible en la información | Build oficial, sin abliteration; 1,8–2,8 tok/s |
| JonathanColetti/Qwen3.8-27B-Uncensored-GGUF | 27B | no disponible | GGUF (Q8_0 y otras) / CPU-GPU | no disponible en la información | Modelo fuente de la abliteration |
| Qwen/Qwen3.8-27B | 27B | no disponible | safetensors / GPU | no disponible en la información | Base original, tasa de rechazo 98/100 |

## Limitaciones y advertencias

- Es un build de 4 bits: los pesos se almacenan como FLM q4_k, con embeddings, lm_head y componentes delta-net en Q8NX; hay pérdida de precisión respecto al Q8_0 de origen (error L2 relativo 0,072).
- Los rechazos se reducen, no se eliminan: 12/100 en el conjunto de prueba, medido solo en modo non-thinking; con thinking activado la tasa puede diferir.
- El comportamiento cerca del antiguo límite de rechazo es menos estable que en el modelo base.
- No se evaluaron GSM8K, código, matemáticas, capacidades multilingües ni la torre de visión, por lo que no hay garantías de calidad en esas áreas.
- Idiomas documentados únicamente en y zh; el rendimiento en castellano no está evaluado.
- Riesgo de alucinación inherente al modelo base; la abliteration no lo mitiga y puede aumentar la confianza en respuestas incorrectas al eliminar negativas.
- La licencia Apache 2.0 se hereda del repo, pero el uso comercial de un modelo abliterado requiere revisión propia de riesgos legales y de política de contenido.
- El despliegue está atado al ecosistema FastFlowLM y a hardware AMD XDNA2; no hay ruta documentada a GPU, CPU ni a otros runtimes.
- Solo 35 descargas y 0 likes en el momento de la ficha: ecosistema de validación muy reducido.
- El proceso de instalación exige editar manualmente `model_list.json` y evitar `flm check` con hashes oficiales bajo riesgo de borrado de archivos.

## Enlaces

- Repo Hugging Face: https://huggingface.co/jgt87/Qwen3.8-27B-Uncensored-NPU2
- Modelo fuente (GGUF uncensored): https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Build oficial NPU2: https://huggingface.co/FastFlowLM/Qwen3.8-27B-NPU2
- Drafter oficial DFlash2: https://huggingface.co/FastFlowLM/Qwen3.8-27B-DFlash2-NPU2
- FastFlowLM: https://fastflowlm.com
- Conversor FLM_Q4NX_Converter: https://github.com/Atomic-Germ/FLM_Q4NX_Converter
- PR de conversión para Qwen3.8-27B: https://github.com/Atomic-Germ/FLM_Q4NX_Converter/pull/11
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
