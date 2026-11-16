# guideboardlabs/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-Monoglot-GGUF

## Resumen

Monoglot 35B-A3B es una cuantización GGUF del modelo Qwen3.6-35B-A3B (en su variante "uncensored" afinada por HauhauCS) a la que se le ha recortado el vocabulario del tokenizador para conservar únicamente los tokens que el inglés realmente utiliza. El resultado es un archivo un 1,6% más pequeño que el original, pero con una mejora medida del 26% en velocidad de decodificación y del 62% en procesamiento de prompt sobre una GPU AMD RX 5700 XT (8 GB, RDNA1) con llama.cpp y backend Vulkan. Lo publica guideboardlabs como tercera entrega de su serie Monoglot.

El modelo base es un transformer con arquitectura Mixture-of-Experts: 35B parámetros totales, unos 3B activos por token, 256 expertos con 8 enrutados por token y dimensión oculta 2048. El recorte de vocabulario elimina 118.300 de las 248.320 filas del vocabulario, dejando 130.020. La motivación técnica es que en un MoE que desborda a memoria del sistema, la cabeza de salida (`output.weight`) se lee completa en cada token generado, por lo que reducirla a la mitad reduce el tráfico de memoria por token de forma directa.

Es relevante para quienes ejecutan modelos grandes en hardware modesto: demuestra que un ajuste aparentemente marginal del tokenizador puede producir ganancias de rendimiento sustanciales cuando el cuello de botella es el ancho de banda, no el cómputo. El precio es la pérdida casi total de capacidades multilingües: el modelo queda funcional en inglés y código, pero degrada fuertemente en otros idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), 256 expertos, 8 enrutados por token, hidden 2048 |
| Parametros totales | 34.176.053.888 (~35B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | no disponible en la informacion proporcionada (la model card menciona un perfil de produccion a 32K sin detallar el contexto nativo) |
| Tipos de cuantizacion | Q4_K_M (archivo publicado); tensores internos Q4_K y Q6_K |
| Idiomas soportados | en (ingles); capacidades multilingues severamente degradadas por el recorte de vocabulario |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del archivo | 20.825.407.520 bytes (~20,8 GB) frente a 21.155.768.832 bytes del origen |
| Filas de vocabulario | 130.020 de 248.320 (118.300 eliminadas) |
| Politica de poda | P1G: ASCII mas simbolos matematicos y tipograficos, griego, box-drawing, glifos de estado, unidades y moneda |
| Modelo base | Qwen/Qwen3.6-35B-A3B y HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura MoE del Qwen3.6-35B-A3B original: 35B parámetros totales con aproximadamente 3B activos por token, 256 expertos de los cuales se enrutan 8 por token, y una dimensión oculta de 2048. El afinado "uncensored" procede de HauhauCS y no se ha modificado en esta publicación; la poda de vocabulario no altera los pesos de los expertos ni de las capas transformer. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo original.

La innovación técnica de esta ficha es la poda del vocabulario en espacio cuantizado. Se conservan 130.020 filas de un total de 248.320, y todas las filas supervivientes de pesos son idénticas bit a bit a las del origen. Se aplicó una política denominada P1G que retiene ASCII, símbolos matemáticos y tipográficos, griego, box-drawing, glifos de estado, unidades y moneda. El efecto principal recae sobre dos tensores: `output.weight` (Q6_K) pasa de 417 MB a 218 MB, y `token_embd.weight` (Q4_K) pasa de 286 MB a 150 MB. Las herramientas de poda proceden de `bsaleh03/ASCII-Condensed-prune-tools`, un repositorio sin licencia que no se redistribuye. Se realizaron verificaciones de integridad: los 731 tensores no pertenecientes al vocabulario quedan byte-idénticos, las filas recolectadas coinciden con sus originales y se conservan todas las claves de metadatos.

## Capacidades

- Generación de texto conversacional en inglés, con continuaciones greedy de 64 tokens byte-idénticas al modelo origen para prompts en inglés y de código.
- Generación de código: verificado con prompts de Python, con ratio de tokens idéntico al origen (1,00x).
- Razonamiento matemático con símbolos matemáticos (`∀ ∑ π ≥ ✓`): ratio de tokens 1,00x respecto al origen.
- Tool calling / function calling: una petición `tools` devuelve `finish_reason: tool_calls`, `read_file` y `{"path":"/etc/hostname"}` tanto en el origen como en este archivo.
- Capacidades multilingües muy degradadas: francés con acentos 1,72x más tokens, japonés 2,67x, chino 3,33x, ruso 5,47x. Funcional pero ineficiente y con pérdida de calidad esperable.
- No se han publicado datos sobre modo thinking, visión, audio ni otras capacidades especiales en la información disponible.

## Casos de uso

- Asistente de código en local sobre GPU de gama media: el modelo mantiene calidad idéntica al origen en Python (ratio 1,00x) y se beneficia del +26% de decodificación, lo que lo hace viable en tarjetas de 8 GB con desbordamiento a memoria del sistema.
- Automatización de agentes con tool calling: la verificación de `finish_reason: tool_calls` confirma que el recorte no rompe el formato de llamadas a herramientas, por lo que puede integrarse en pipelines de agentes que ejecuten funciones del sistema.
- Procesamiento por lotes de prompts largos en inglés: el +62% en prefill (pp512) reduce drásticamente el tiempo de ingestión de contexto, útil para resúmenes, clasificación o extracción sobre documentos extensos.
- Despliegue en hardware AMD con Vulkan y RDNA1: es uno de los pocos ejemplos medidos y documentados para esta combinación, con instrucciones concretas de flags (`-ngl 999 -ctk q4_0 -ctv q4_0 -fa on`).
- Experimentación con poda de vocabulario: sirve como referencia reproducible para investigar el impacto del tamaño del vocabulario en el rendimiento de inferencia de modelos MoE.
- Chat conversacional en inglés sin restricciones de contenido: hereda el afinado uncensored de HauhauCS, adecuado para entornos de investigación donde se requiere baja filtración.
- Inferencia en equipos con poca VRAM: con ~7,6 GiB en VRAM y ~12,9 GiB en GTT, el modelo es usable en configuraciones de 8 GB de VRAM con memoria del sistema compartida.

## Benchmarks y rendimiento

Mediciones con `llama.cpp` commit `3ba1ce0`, backend Vulkan, RX 5700 XT (8 GB, RDNA1), flags `-ngl 999 -ctk q4_0 -ctv q4_0 -fa on -t 6 --cpu-mask 0x3f`, `GGML_VK_DISABLE_HOST_VISIBLE_VMEM=1`, a profundidad 4096, tres repeticiones con tarjeta vacía antes de cada ejecución.

| Prueba (llama-bench) | Origen | Este archivo | Variacion |
|---|---:|---:|---:|
| pp512 @ 4096 | 91,95 ± 0,36 | 149,38 ± 3,02 | +62% |
| tg128 @ 4096 | 10,16 ± 0,01 | 12,76 ± 0,01 | +26% |
| GTT en uso durante ejecucion | 12,94 GiB | 12,09 GiB | reduccion |

| Texto | Origen (tokens) | Este archivo (tokens) | Ratio |
|---|---:|---:|---:|
| Prosa en ingles | 30 | 30 | 1,00x |
| Python | 41 | 41 | 1,00x |
| Matematicas con `∀ ∑ π ≥ ✓` | 27 | 27 | 1,00x |
| Frances con acentos | 18 | 31 | 1,72x |
| Japones | 15 | 40 | 2,67x |
| Chino | 15 | 50 | 3,33x |
| Ruso | 17 | 93 | 5,47x |

No se han publicado resultados de benchmarks de instrucciones (MMLU, HumanEval, GSM8K) ni de perplejidad o KL en la informacion disponible. El autor indica explícitamente que no midió benchmark de seguimiento de instrucciones y que la perplejidad no es comparable entre vocabularios distintos.

## Requisitos de hardware

- VRAM estimada: unos 7,6 GiB en VRAM con aproximadamente 12,9 GiB desbordados a GTT (memoria del sistema compartida) en la configuración medida.
- GPU recomendadas: el autor ha validado RX 5700 XT (8 GB, RDNA1) con Vulkan. Para evitar el desbordamiento a GTT se necesitaría una GPU con al menos ~21 GB de VRAM (por ejemplo, RTX 4090 de 24 GB, A100 de 40/80 GB, H100).
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB como la RX 5700 XT, aunque con desbordamiento a memoria del sistema. En tarjetas de 24 GB (RTX 3090, RTX 4090) cabría previsiblemente completo, aunque no se han publicado mediciones en esa configuración.
- Opciones de despliegue: llama.cpp (formato GGUF nativo). No se ha verificado compatibilidad con vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput medidos: 12,76 tokens/s de decodificación y 149,38 tokens/s de prefill a profundidad 4096 en RX 5700 XT. En la configuración medida, cada token tardaba aproximadamente 98 ms en el origen, de los cuales unos 15 ms correspondían a la lectura de la cabeza de salida.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Monoglot 35B-A3B (este) | ~35B | ~3B | no disponible | apache-2.0 | GGUF Q4_K_M | Vocabulario podado a ingles, +26% decode, +62% prefill |
| Qwen3.6-35B-A3B (origen) | ~35B | ~3B | no disponible | apache-2.0 | safetensors / GGUF | Multilingue completo, referencia de calidad |
| HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive | ~35B | ~3B | no disponible | apache-2.0 | safetensors | Afinado uncensored sin poda de vocabulario |
| Monoglot 27B (serie) | ~27B | denso | no disponible | apache-2.0 | GGUF | Poda que cruza el muro de VRAM: prefill 6,2x, decode 2,4x |
| Monoglot 9B (serie) | ~9B | denso | no disponible | apache-2.0 | GGUF | Menos ancho de banda por token: decode +6,1%, prefill plano |

No se dispone de datos de benchmarks de calidad (MMLU, HumanEval) para establecer comparaciones de rendimiento frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- El recorte de vocabulario degrada severamente el multilingüismo: ruso 5,47x más tokens, chino 3,33x, japonés 2,67x. Para uso multilingüe debe emplearse el archivo origen.
- No se ha medido el seguimiento de instrucciones en este archivo; la corrección se apoya únicamente en verificaciones de integridad de tensores y continuaciones greedy.
- No hay datos de perplejidad ni de divergencia KL, y el autor señala que no son comparables entre vocabularios distintos.
- Las tasas absolutas de rendimiento corresponden a un binario concreto de llama.cpp, una GPU concreta y una profundidad de 4096; no son transferibles a otros binarios o configuraciones.
- El modelo hereda el afinado "uncensored" de HauhauCS, lo que implica menor filtrado de contenido y riesgos asociados en producción.
- Licencia apache-2.0, que permite uso comercial, pero las herramientas de poda utilizadas (`bsaleh03/ASCII-Condensed-prune-tools`) no tienen licencia y su código no se redistribuye.
- Riesgo de alucinación inherente al modelo base; no se han publicado evaluaciones específicas de fiabilidad factual.
- Solo se ha validado el despliegue con llama.cpp y Vulkan; no hay evidencia de compatibilidad con otros runtimes.

## Enlaces

- Hugging Face: https://huggingface.co/guideboardlabs/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-Monoglot-GGUF
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Modelo base afinado: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Entrada previa de la serie (27B): https://huggingface.co/guideboardlabs/Qwen3.8-27B-Q3-DOWN-XS-Monoglot-GGUF
- Entrada previa de la serie (9B): https://huggingface.co/guideboardlabs/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive-Monoglot-GGUF
- Herramientas de poda: https://github.com/bsaleh03/ASCII-Condensed-prune-tools
- Publicación de fakezeta (Condensed-P2): https://huggingface.co/fakezeta/Qwen3.8-27B-UD-Q3_K_XL-Condensed-P2
- Publicación en X de TeksEdge: https://x.com/teksedge/status/2122118832441708600
