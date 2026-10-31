# fajardc/Ornith-1.5-122B-GSQ-RCO-GGUF

## Resumen

Ornith-1.5-122B GSQ-RCO es una cuantización mixta en formato GGUF del modelo Ornith-1.5-122B, un modelo de lenguaje de tipo mixture-of-experts (MoE) con 122 mil millones de parámetros totales y unos 10 mil millones activos por token, desarrollado por Ornith AI sobre la arquitectura Qwen3.5-122B-A10B. Esta versión no es un lanzamiento oficial: la ha creado el usuario fajardc en hardware doméstico, aplicando las técnicas GSQ y RCO del DAS Lab del IST Austria para comprimir el modelo a unos 3,5 bits por peso.

El problema que resuelve es claro: un modelo de 122B parámetros en BF16 ocupa más de 240 GB, muy por encima de lo que puede alojar hardware de consumo o de estación de trabajo. Con GSQ (refinado de códigos enteros por tensor) y RCO (selección óptima de tipo por tensor minimizando la divergencia KL respecto al modelo BF16), el archivo resultante pesa 53,38 GB y cabe en configuraciones de GPU duales o en sistemas con mucha RAM unificada, manteniendo una calidad medible muy cercana al original.

Es relevante ahora porque demuestra que las cuantizaciones de precisión mixta de última generación permiten ejecutar modelos frontera MoE en hardware de usuario final, con 262.144 tokens de contexto y arquitectura híbrida Gated DeltaNet + atención completa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `qwen35moe` (híbrida: 36 capas Gated DeltaNet + 12 capas de atención completa), MoE con 256 expertos, 8 activos + 1 compartido |
| Parametros totales | 122.111.526.912 (~122B) |
| Parametros activos | ~10B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Mixta: IQ2_XS, IQ2_S, IQ3_XXS, IQ3_S, IQ4_XS, Q4_K, Q5_K, Q6_K, BF16 (ssm_alpha/ssm_beta) y F32 (normas, router, convoluciones); media de 3,497 bpw |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (split en 2 archivos de ~26,6 y ~26,8 GB) |

## Arquitectura y entrenamiento

El modelo base, Ornith-1.5-122B, sigue la arquitectura Qwen3.5-122B-A10B: un transformer MoE híbrido de 48 capas que combina 36 bloques Gated DeltaNet (una variante de SSM/attention lineal con estado recurrente, eficiente en secuencias largas) con 12 bloques de atención completa estándar. Cada capa MoE contiene 256 expertos de los cuales 8 se activan por token más 1 experto compartido, lo que da un total de ~122B parámetros con ~10B activos. El modelo original incluye además un encoder de visión y una cabecera de multi-token prediction (MTP) para decodificación especulativa, aunque estos componentes no están incluidos en este GGUF (el vision projector se puede cargar por separado y el MTP exportarse como draft GGUF).

Sobre el proceso de cuantización: primero se convirtió el checkpoint a GGUF BF16; después cada tensor se cuantizó en 8 tipos candidatos usando `llama-quantize` con la matriz de importancia (imatrix) de bartowski (573 chunks de 512 tokens cubriendo todos los expertos). GSQ refinó los códigos enteros de cada tensor dentro de su tipo mediante una relajación Gumbel-softmax que minimiza el error de salida de la capa con Hessians recogidos de 192 secuencias de 2.048 tokens de calibración (200 pasos, optimizador Lion, lr 6e-4). Finalmente, RCO asignó un tipo por tensor bajo un presupuesto exacto de 3,50 bpw, minimizando la divergencia KL de la salida completa frente al modelo BF16. Los expertos enrutados (la mayor parte del archivo) reciben los tipos bajos, mientras que tensores densos como atención, proyecciones DeltaNet, experto compartido, `token_embd` y `output` se mantienen mayoritariamente en Q6_K.

No hay información disponible sobre los datos de entrenamiento del modelo base ni sobre si empleó RLHF/DPO.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, etiquetado como conversational).
- Contexto largo: hasta 262.144 tokens, adecuado para documentos extensos y conversaciones multi-turno.
- Arquitectura híbrida Gated DeltaNet + atención: eficiencia en procesamiento de secuencias largas gracias a las capas recurrentes lineales.
- MoE con activación dispersa: calidad de modelo grande con coste de inferencia de ~10B parámetros activos.
- Soporte de decodificación especulativa mediante la cabecera MTP del modelo base (exportable como draft GGUF aparte, no incluida en este archivo).
- Entrada de imagen posible en el modelo base; en este GGUF requiere cargar un vision projector (mmproj) aparte, por ejemplo el bf16 de bartowski.
- Compatibilidad con llama.cpp y sus derivados (llama-server, etc.).
- No hay información disponible sobre tool calling, agentes ni capacidades multilingües específicas.

## Casos de uso

- Chatbot local de alto nivel en estación de trabajo: con 53,38 GB, el modelo cabe en un sistema con RTX 3090 + RTX 3070 Ti y 64 GB de RAM (la configuración del propio autor), o en Macs con memoria unificada de 64 GB o más, permitiendo un asistente conversacional privado sin depender de APIs.
- Análisis de documentos extensos: la ventana de 262.144 tokens permite procesar contratos, informes técnicos o bases de código completas en una sola pasada, y las capas Gated DeltaNet reducen el coste de atender secuencias largas.
- Asistencia a programación: la métrica de calidad sobre código C++ (mismo top-1 del 94,15 % frente a BF16 y ratio de perplejidad 1,011) indica que la cuantización preserva especialmente bien el comportamiento en código, siendo adecuado para autocompletado y razonamiento sobre código local.
- Inferencia acelerada con decodificación especulativa: exportando la cabecera MTP del checkpoint original como draft GGUF, `llama-server` puede usarla con `-md` para aumentar el throughput sin sacrificar calidad.
- Experimentación en cuantización e investigación reproducible: al ser una cuantización personal documentada con metodología completa (GSQ, RCO, imatrix, Hessians), sirve como referencia para quien quiera replicar o comparar técnicas de compresión de modelos MoE.
- Multimodalidad local ligera: combinando este GGUF con un mmproj aparte, se puede montar un sistema de descripción y pregunta-respuesta sobre imágenes sin conexión, aprovechando el encoder de visión del modelo base.
- Despliegue en servidores de gama alta con VRAM limitada por GPU: el split en dos archivos y el tamaño contenido permiten repartir capas entre varias GPU de consumo mediante offload parcial de llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) ni para este GGUF ni, en la información disponible, para el modelo base. La única evaluación cuantitativa es la de calidad de la propia cuantización, medida como divergencia KL media y tasa de mismo top-1 frente al GGUF BF16 del mismo modelo (100 chunks de 512 tokens por dominio, en tres dominios apartados de la mezcla de calibración):

| Dominio | KLD media | Mismo top-1 | Ratio PPL vs BF16 |
|---|---|---|---|
| WikiText-2 test (prosa enciclopédica) | 0,1275 | 86,80 % | 1,039 |
| Código C++ (llama.cpp) | 0,0554 | 94,15 % | 1,011 |
| Open-Platypus, filas held-out (instrucciones) | 0,0689 | 93,84 % | 1,012 |

Estos datos miden la fidelidad de la cuantización respecto al modelo BF16, no la capacidad absoluta del modelo.

## Requisitos de hardware

- VRAM/RAM necesaria: 53,38 GB en total para el archivo completo (49,72 GiB). No cabe íntegro en una sola GPU de consumo; requiere GPU dual, offload CPU-GPU o memoria unificada.
- Configuración de referencia del autor: AMD Ryzen 9 5900X, 64 GB de RAM, RTX 3090 (24 GB) + RTX 3070 Ti (8 GB) y SSD NVMe de 4 TB, con offload parcial de capas a CPU.
- Macs con memoria unificada de 64 GB o más (M2 Ultra, M3 Max, M4 Max) pueden alojarlo completamente en GPU integrada.
- Alternativa viable: servidores con A100 40 GB/80 GB o H100, aunque para producción con tráfico real se recomendaría el BF16 o cuants superiores en GPU de数据中心; para estación de trabajo, la RTX 4090 (24 GB) combinada con una segunda GPU o RAM rápida es equivalente a la configuración de referencia.
- Despliegue: llama.cpp (formato nativo, split de dos archivos, cargar la primera parte y llama.cpp encuentra la segunda), llama-server (con soporte de draft MTP vía `-md` y mmproj para visión), y derivados como Ollama o LM Studio en la medida en que soporten la arquitectura `qwen35moe`. No hay información disponible sobre soporte en vLLM o TGI para este GGUF.
- Latencia y throughput: no disponibles; al ser MoE con ~10B activos, se espera un throughput comparable a modelos densos de 10-14B una vez cargado, con penalización por offload a CPU.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Formato/Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-122B GSQ-RCO (este) | 122B | ~10B | 262.144 | GGUF 3,5 bpw / MIT | Híbrido DeltaNet + atención, cuantización personal |
| Qwen3-30B-A3B (referencia MoE similar en uso) | 30B | 3B | 32.128 (128K con YaRN) | GGUF, safetensors / Apache 2.0 | Menor capacidad pero cabe en una sola GPU de 24 GB |
| Llama 3.3 70B (denso, misma clase de VRAM en Q3/Q4) | 70B | 70B | 128K | GGUF, safetensors / Llama 3.3 Community | Denso: mayor coste por token, sin eficiencia MoE |
| Mixtral 8x22B | 141B | 39B | 64K | safetensors, GGUF / Apache 2.0 | MoE similar en tamaño total pero con muchos más parámetros activos |

La ventaja diferencial de esta ficha es la combinación de contexto de 256K, arquitectura híbrida con DeltaNet, licencia MIT y una huella de 53 GB, algo que ninguna de las alternativas anteriores ofrece simultáneamente.

## Limitaciones y advertencias

- No es un lanzamiento oficial: es una cuantización personal de un usuario; cualquier problema de calidad debe atribuirse al proceso de cuantización, no al equipo de Ornith, IST Austria ni al equipo Qwen.
- La cuantización a 3,5 bpw implica pérdida medible: en prosa enciclopédica el mismo top-1 cae al 86,80 % respecto a BF16, con ratio de perplejidad 1,039; en tareas sensibles a matices puede notarse.
- Los tipos bajos (IQ2_XS/IQ2_S) se concentran en las capas 0-8 de expertos enrutados; el comportamiento en las primeras capas es el más degradado por diseño del presupuesto RCO.
- El archivo no incluye el encoder de visión ni la cabecera MTP: la multimodalidad y la decodificación especulativa requieren archivos adicionales del checkpoint original.
- No hay información disponible sobre sesgos conocidos, riesgo de alucinación específico ni idiomas soportados del modelo base.
- No hay benchmarks estandarizados publicados: la calidad absoluta del modelo base Ornith-1.5-122B no puede verificarse con los datos disponibles.
- Rendimiento en hardware con offload a CPU dependerá fuertemente del ancho de banda de memoria; en equipos con RAM lenta la velocidad puede ser insuficiente para uso interactivo.
- La licencia MIT del modelo base y de la cuantización permite uso comercial sin restricciones conocidas, pero conviene verificar el enlace de licencia del modelo base para condiciones actualizadas.
- Al ser una arquitectura reciente (`qwen35moe`), el soporte en runtimes distintos de llama.cpp puede ser incompleto o inexistente.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/fajardc/Ornith-1.5-122B-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Licencia del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B/blob/main/LICENSE
- Referencia del procedimiento (ISTA-DASLab GSQ-RCO GGUF): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Matriz de importancia y mmproj de bartowski: https://huggingface.co/bartowski/Ornith-1.5-122B-GGUF
- Papers citados en los tags: https://arxiv.org/abs/2604.18556 y https://arxiv.org/abs/2605.00649
