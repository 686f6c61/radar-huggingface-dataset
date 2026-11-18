# ajgazin/Swift-Qwen3.8-27B-Uncensored-Dynamic-MTP-GGUF

## Resumen

Swift-Qwen3.8-27B-Uncensored-Dynamic-MTP-GGUF es una colección de cuantizaciones GGUF del modelo ajgazin/Swift-Qwen3.8-27B-Uncensored-MTP, que a su vez es una versión "abliterated" (con la dirección de rechazo eliminada de los pesos) del fine-tune Swift-Qwen3.8-27B de UkisAI, derivado de Qwen3.8-27B. El autor del repositorio es ajgazin, y el pipeline declarado es image-text-to-text, lo que indica soporte multimodal de imagen y vídeo mediante un proyector separado.

El modelo resuelve el problema de desplegar un modelo de razonamiento de gran tamano en hardware de consumo: ofrece 11 cuantizaciones dinámicas (Unsloth Dynamic 3.0) desde 9,2 GiB hasta 29,3 GiB, más una versión BF16 de 50,9 GiB, con métricas de divergencia KL medidas token a token contra el BF16 de referencia. Incorpora una cabeza MTP (multi-token prediction) dentro del propio GGUF para decodificación autoespeculativa en llama.cpp, sin necesidad de un fichero draft separado.

La relevancia actual reside en tres factores: la eliminación de rechazos medida (15/100 frente a 98/100 del modelo Swift original, con divergencia KL de 0,0634), el etiquetado dinámico por tensor con matriz de importancia de Unsloth, y la inclusión de visión. El repositorio acumula 2648 descargas y 50 likes desde su publicación en septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.8-27B) con cabeza MTP para decodificacion especulativa; proyector multimodal separado |
| Parametros totales | 460.730.096 (dato de safetensors del repo base segun Hugging Face; la nomenclatura del modelo indica 27B, discrepancia no resuelta en la informacion disponible) |
| Parametros activos | no disponible (no es MoE segun la informacion proporcionada) |
| Longitud de contexto | no disponible de forma explicita; los ejemplos de uso de llama.cpp emplean `-c 32768` |
| Tipos de cuantizacion | UD-Q2_K_XL, UD-IQ3_XXS, UD-IQ3_S, UD-Q3_K_XL, UD-IQ4_XS, UD-Q4_K_S, UD-Q4_K_XL, UD-Q5_K_S, UD-Q5_K_M, UD-Q6_K_XL, UD-Q8_K_XL, BF16 |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | GGUF (un fichero por cuantizacion); proyector `mmproj-BF16.gguf`; existe variante NVFP4 para vLLM y SGLang en otro repositorio |

## Arquitectura y entrenamiento

La informacion disponible describe el modelo como un transformer derivado de Qwen3.8-27B, sometido a un proceso de abliteration: se aplica la dirección de rechazo de orcarouter/Qwen3.8-27B-Uncensored (metodología de Arditi et al. 2024, una sola dirección) a los pesos del fine-tune Swift de UkisAI, modificando 131 tensores. El resultado declara 15/100 rechazos frente a los 98/100 del modelo Swift original, con una divergencia KL de 0,0634 respecto a Swift. No se especifican en la informacion proporcionada el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el fine-tune de origen.

La innovación técnica principal del repositorio es la cuantización dinámica: cada tensor recibe el tipo que Unsloth eligió para su cuantización del mismo tamano, usando la matriz de importancia de Unsloth (imatrix). Además, cada GGUF principal incluye la cabeza MTP, lo que permite decodificación autoespeculativa en llama.cpp mediante `--spec-type draft-mtp` (requiere una build de llama.cpp con soporte MTP para `qwen35`); no hay fichero draft separado. El modelo piensa antes de responder por defecto, y la muestreo recomendado es temperature 1.0, top_p 0.95, top_k 20, min_p 0.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento previo a la respuesta activado por defecto.
- Entrada de imagen y vídeo mediante el proyector `mmproj-BF16.gguf` (pipeline image-text-to-text).
- Generación de código y matemáticas (implícito en el linaje Qwen3.8-27B; no se aportan benchmarks específicos en la información disponible).
- Decodificación autoespeculativa nativa gracias a la cabeza MTP incluida en el GGUF principal.
- Comportamiento sin rechazos ("uncensored"): 15/100 rechazos medidos frente a 98/100 del modelo Swift.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita; el modo de pensamiento previo es compatible con flujos multi-paso.

## Casos de uso

- Despliegue en GPU de consumo de 12 GB: con UD-Q2_K_XL (9,2 GiB) o UD-IQ3_XXS (10,2 GiB) se puede ejecutar el modelo en tarjetas de 12 GB; el autor recomienda IQ3_XXS sobre Q2_K_XL por su mayor fidelidad al BF16 (KLD medio 0,1255 frente a 0,1796).
- Estación de trabajo con 24 GB de VRAM: UD-Q4_K_XL (16,4 GiB) o UD-Q5_K_M (18,4 GiB) dejan espacio para contexto largo en una RTX 4090 o similar, con KLD medio de 0,0324 y 0,0207 respectivamente.
- Servidor de inferencia con 32 GB: UD-Q6_K_XL (23,6 GiB) es el mejor encaje según el autor, con KLD medio de 0,0116 y 98,2 % de coincidencia en top-1, adecuado para servir texto e imagen vía llama-server.
- Procesamiento de documentos con imagen: activando `--mmproj mmproj-BF16.gguf` se habilita la entrada de imagen y vídeo, útil para extracción de información de capturas, diagramas o fotogramas.
- Generación de código asistida en local: el linaje Qwen3.8-27B y el modo de pensamiento previo lo hacen apto para autocompletado y revisión de código en entornos sin conectividad, aunque no hay benchmarks de código publicados en la información disponible.
- Investigación sobre alineación y abliteration: el repositorio documenta la divergencia KL de la abliteration (0,0634) y las métricas por cuantización en `kld_results.csv`, lo que permite estudiar el impacto de la eliminación de la dirección de rechazo sobre la distribución de tokens.
- Evaluación de cuantizaciones: `tensor_types.tsv` y `kld_results.csv` permiten reproducir y comparar el efecto de cada tamano sobre la fidelidad al BF16 (de 0,1796 de KLD medio en Q2 a 0,0060 en Q8).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica métricas de calidad de cuantización medidas contra el BF16 del propio repositorio (wikitext-2, 36 × 8192 tokens, KV cache f16, llama.cpp `94659b076`):

| Cuantizacion | GiB | KLD medio | KLD p99 | Mismo top-1 |
|---|---:|---:|---:|---:|
| UD-Q2_K_XL | 9,2 | 0,1796 | 1,99 | 85,2 % |
| UD-IQ3_XXS | 10,2 | 0,1255 | 1,20 | 87,9 % |
| UD-Q3_K_XL | 12,2 | 0,0726 | 0,58 | 91,8 % |
| UD-Q4_K_S | 14,3 | 0,0521 | 0,45 | 94,1 % |
| UD-Q4_K_XL | 16,4 | 0,0324 | 0,16 | 95,8 % |
| UD-Q5_K_S | 17,4 | 0,0272 | 0,11 | 96,4 % |
| UD-Q5_K_M | 18,4 | 0,0207 | 0,080 | 96,9 % |
| UD-Q6_K_XL | 23,6 | 0,0116 | 0,028 | 98,2 % |
| UD-Q8_K_XL | 29,3 | 0,0060 | 0,012 | 98,8 % |

UD-IQ3_S y UD-IQ4_XS no tienen métricas en el momento de la medición. El autor señala que el punto de inflexión está en UD-Q5_K_M: por encima, cada GiB adicional aporta poco; por debajo, cada GiB ahorrado cuesta aproximadamente el doble. La mediana de KLD es 0,0002 en Q8 y 0,003 en Q4_K_XL, lo que indica que la media la arrastra una minoría de tokens. Estas cifras miden solo cuantización contra el BF16 del repositorio, no calidad absoluta del modelo.

## Requisitos de hardware

- VRAM estimada según cuantización: 9,2 GiB (Q2_K_XL) hasta 29,3 GiB (Q8_K_XL); el BF16 requiere 50,9 GiB. El proyector de visión anade 0,9 GiB.
- GPU de 12 GB: UD-Q2_K_XL y UD-IQ3_XXS.
- GPU de 16 GB: UD-IQ3_S (11,2 GiB), UD-Q3_K_XL (12,2 GiB) y UD-IQ4_XS (13,3 GiB); UD-Q4_K_S (14,3 GiB) solo con contexto corto.
- GPU de 20 GB: UD-Q4_K_S.
- GPU de 24 GB: UD-Q4_K_XL (16,4 GiB), UD-Q5_K_S (17,4 GiB) y UD-Q5_K_M (18,4 GiB), con espacio para contexto largo.
- GPU de 32 GB: UD-Q6_K_XL (23,6 GiB); UD-Q8_K_XL requiere offload parcial a CPU.
- GPU de 48 GB: UD-Q8_K_XL (29,3 GiB) sin offload.
- Despliegue: llama.cpp (`llama-server`), con soporte de `--spec-type draft-mtp` para decodificación especulativa; para vLLM y SGLang existe la variante NVFP4 en otro repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Swift-Qwen3.8-27B-Uncensored-Dynamic-MTP-GGUF (este) | 27B (nomenclatura) | no disponible | Abliterated + cuantización dinámica + MTP + visión | swift-open-license-1.0 | GGUF |
| Swift-Qwen3.8-27B (UkisAI) | 27B | no disponible | Fine-tune de razonamiento eficiente | swift-open-license-1.0 | no disponible |
| ajgazin/Swift-Qwen3.8-27B-Uncensored-MTP | 27B | no disponible | Abliterated con MTP, sin cuantizar | no disponible | safetensors (repo base) |
| ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-Dynamic-MTP-GGUF | 27B | no disponible | Versión 1.5 del mismo linaje | no disponible | GGUF |
| Qwen3.8-27B (Qwen) | 27B | no disponible | Modelo base original | no disponible | no disponible |

La información disponible no incluye benchmarks comparativos entre estos modelos, por lo que no es posible comparar rendimiento de forma cuantitativa.

## Limitaciones y advertencias

- La abliteration elimina la dirección de rechazo pero no garantiza la ausencia de contenido nocivo; el propio autor mide 15/100 rechazos, lo que implica que el modelo puede generar contenido sensible. Requiere filtros y políticas de uso en producción.
- La divergencia KL de 0,0634 respecto al modelo Swift indica que la abliteration altera la distribución de salida; puede degradar capacidades en tareas que dependían del comportamiento alineado original.
- Las métricas de KLD publicadas miden solo cuantización contra el BF16 del repositorio y solo sobre prosa (wikitext-2); código y texto con formato de chat no fueron medidos, por lo que la calidad en esos dominios es desconocida.
- La perplexity incluida en `kld_results.csv` no ordena los ficheros de forma fiable: varias cuantizaciones puntúan por debajo del BF16.
- Existe una discrepancia entre la nomenclatura "27B" del modelo y el recuento de parámetros de safetensors (460.730.096) del repo base; conviene verificar antes de dimensionar hardware.
- La licencia swift-open-license-1.0 está etiquetada como `other`; no se detallan en la información disponible las restricciones para uso comercial, por lo que es imprescindible revisar el enlace de licencia antes de desplegar en producción.
- Los idiomas soportados no están documentados; el comportamiento multilingüe es desconocido.
- La decodificación MTP requiere una build específica de llama.cpp con soporte para `qwen35`; no funciona en versiones estándar.
- El modelo piensa antes de responder por defecto, lo que incrementa la latencia y el consumo de tokens frente a modelos sin modo de pensamiento.
- Riesgo de alucinación no cuantificado en la información disponible; al ser un modelo abliterated, la ausencia de rechazos puede aumentar la confianza en respuestas incorrectas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ajgazin/Swift-Qwen3.8-27B-Uncensored-Dynamic-MTP-GGUF
- Modelo base (abliterated, sin cuantizar): https://huggingface.co/ajgazin/Swift-Qwen3.8-27B-Uncensored-MTP
- Modelo Swift original de UkisAI: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Modelo Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante NVFP4 para vLLM y SGLang: https://huggingface.co/ajgazin/Swift-Qwen3.8-27B-Uncensored-NVFP4
- Versión Swift 1.5: https://huggingface.co/ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-Dynamic-MTP-GGUF
- Dirección de rechazo de origen: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Licencia: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Paper de referencia (Arditi et al. 2024): arXiv:2406.11717
