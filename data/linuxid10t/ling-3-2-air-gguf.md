# linuxid10t/Ling-3.2-air-GGUF

## Resumen

Ling-3.2-air es un modelo de lenguaje multimodal desarrollado por inclusionAI, distribuido bajo licencia MIT. Se trata de un Mixture of Experts (MoE) híbrido de 124.000 millones de parámetros totales con 5.500 millones activos por token, que combina 35 capas de atención lineal KDA con 7 capas de atención gated-MLA, e incorpora una torre de visión nativa de 27 capas (ViT) capaz de procesar imagen y vídeo. Su ventana de contexto alcanza los 262.000 tokens.

La relevancia de este modelo radica en su relación entre capacidad y coste de inferencia: al activar solo 5.500 millones de parámetros por token, permite servir un modelo de escala 124B con un coste computacional por token comparable al de modelos mucho más pequeños, manteniendo además capacidades multimodales nativas (image-text-to-text) y un modo de razonamiento explícito (thinking).

El repositorio analizado, linuxid10t/Ling-3.2-air-GGUF, es una conversión comunitaria a formato GGUF para llama.cpp, no el modelo original. Incluye el proyector de visión en F16 (875 MB) y variantes de cuantización del modelo de texto (Q8_0 de 133 GB, Q4_K_M de ~74 GB), además de un conjunto planificado de i-quants generados a partir de una imatrix de 5,34 millones de tokens. Requiere una build de llama.cpp con soporte para la arquitectura `bailingmoe3` y el proyector `ling3vl`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido transformer: 35 capas de atención lineal KDA + 7 capas de atención gated-MLA, 512 expertos enrutados, top-8 + 1 compartido; torre de visión ViT de 27 capas |
| Parametros totales | 124.000 millones (modelo base); 434.248.944 (dato reportado en safetensors del repo GGUF) |
| Parametros activos | 5.500 millones por token |
| Longitud de contexto | 262.000 tokens |
| Tipos de cuantizacion | Q8_0 (133 GB), Q4_K_M (~74 GB); planificados IQ4_XS, IQ3, IQ2 a partir de imatrix; proyector de visión en F16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); checkpoint original en FP8 e4m3 con escalas de bloque 128×128 |

## Arquitectura y entrenamiento

Ling-3.2-air emplea una arquitectura MoE híbrida que alterna capas de atención lineal KDA (Kernelized Dot-product Attention) con capas de atención gated-MLA (Multi-head Latent Attention con compuertas). El modelo cuenta con 512 expertos enrutados con selección top-8 más un experto compartido, lo que resulta en 5.500 millones de parámetros activos por token sobre un total de 124.000 millones. Esta combinación de atención lineal y MLA busca reducir el coste de memoria y cómputo asociado a contextos largos (hasta 262.000 tokens) manteniendo la calidad de un transformer denso de gran escala.

El modelo incorpora además una torre de visión nativa de 27 capas (ViT) que procesa tanto imágenes como vídeo, conectada al tronco de texto mediante un proyector multimodal denominado `ling3vl`. El checkpoint original se distribuye en FP8 e4m3 con escalas de bloque de 128×128 (aunque su `config` declara `torch_dtype: bfloat16`, lo que resulta engañoso). La conversión a GGUF dequantiza esos bloques y escribe los tensores de origen FP8 como Q8_0, dejando el resto en F16/F32. La cabeza MTP/NextN (capa 42, ~3B parámetros) queda excluida del tronco y solo se exporta opcionalmente con `--mtp` para decodificación especulativa. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activable mediante `enable_thinking` en la plantilla de chat (soportado con `--jinja`).
- Comprensión de imágenes y vídeo mediante la torre de visión nativa de 27 capas y el proyector `ling3vl`.
- Procesamiento de contexto largo de hasta 262.000 tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Soporte de tool calling / function calling, reflejado en la plantilla de chat y en el corpus de imatrix que incluye trayectorias de llamadas a herramientas.
- Capacidades de agente y razonamiento multi-paso, potenciadas por el modo thinking.
- Capacidades multilingües: no disponible (no se especifican idiomas en la información proporcionada).
- Decodificación especulativa opcional mediante la cabeza MTP/NextN exportable por separado.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 262.000 tokens de ventana, manteniendo el hilo de la conversación y el historial de interacciones sin truncamiento.
- Análisis de documentos extensos con imágenes: al combinar visión nativa y contexto de 262k, permite procesar informes, contratos o manuales con figuras y tablas intercaladas en una sola pasada.
- Generación de código en producción: el soporte de tool calling y el modo thinking permiten integrarlo en pipelines de CI/CD para revisión de código, generación de parches y ejecución de tareas con llamadas a herramientas.
- Agentes autónomos multi-paso: la combinación de razonamiento explícito (thinking) y function calling lo hace adecuado para orquestar flujos de trabajo que requieren planificación y ejecución de acciones encadenadas.
- Transcripción y análisis de vídeo: la torre ViT procesa vídeo además de imagen, lo que habilita tareas de descripción, resumen o extracción de información de material audiovisual.
- Despliegue en hardware limitado con offloading de expertos: gracias a sus 5.500 millones de parámetros activos, es posible mantener los expertos en RAM (`--n-cpu-moe 28`) y las capas no expertas en GPU, permitiendo servir un modelo de 124B en equipos con VRAM modesta.
- Procesamiento de documentación técnica multilingüe: con contexto largo y capacidad de razonamiento, puede resumir y responder preguntas sobre corpus técnicos extensos (siempre que los idiomas requeridos estén cubiertos, dato no confirmado).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: Q8_0 ocupa 133 GB y Q4_K_M ~74 GB; el proyector de visión F16 añade 875 MB. Con 5.500 millones de parámetros activos, el requisito efectivo de cómputo por token es bajo, pero el peso total debe residir en algún almacenamiento accesible.
- GPU recomendadas: no disponible de forma explícita; por tamaño de pesos, Q4_K_M requiere configuraciones multi-GPU (por ejemplo, varias A100/H100) o el esquema de offloading de expertos a CPU.
- Cabe en consumer GPU: no de forma completa; sí es viable con offloading parcial de expertos a RAM (`--n-cpu-moe 28` o `-ot "exps=CPU"`) manteniendo las capas no expertas en GPU, lo que permite su uso en GPUs de consumo con VRAM limitada.
- Opciones de despliegue: llama.cpp (llama-server) con arquitectura `bailingmoe3` y proyector `ling3vl`, disponible en upstream desde 2026-08-17 (PR #26608); requiere build master de esa fecha o posterior. No se mencionan otras opciones (vLLM, TGI, Ollama) en la información disponible.
- Latencia y throughput estimados: no disponible.
- Muestreo recomendado por el autor del modelo: temperature 1.0, top_p 0.95, top_k 20, con thinking habilitado.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Ling-3.2-air | 124B | 5,5B | 262k | MIT | GGUF (repo analizado); original FP8 | MoE híbrido KDA+MLA, visión nativa |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la información proporcionada |

No se dispone de información sobre modelos comparables de la misma categoría (MoE multimodal de escala similar) en la documentación proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- El repositorio analizado es una conversión comunitaria (linuxid10t), no el modelo oficial; la calidad de las cuantizaciones depende del proceso de conversión y no está validada por inclusionAI.
- Los archivos Q8_0 y Q4_K_M figuran como pendientes (⏳) en la model card; las variantes i-quants (IQ4_XS, IQ3, IQ2) están planificadas pero no disponibles en el momento de la ficha.
- La cabeza MTP/NextN (~3B parámetros) está excluida del tronco; la decodificación especulativa requiere exportarla por separado con `--mtp`.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos generativos de gran escala.
- Sesgos conocidos: no disponible.
- Idiomas soportados: no disponible, lo que impide garantizar un rendimiento adecuado en castellano u otros idiomas sin evaluación previa.
- La licencia MIT permite uso comercial, pero al tratarse de una conversión comunitaria conviene verificar la procedencia y los términos del modelo base `inclusionAI/Ling-3.2-air`.
- Requiere una build específica de llama.cpp (master desde 2026-08-17); versiones anteriores no soportan la arquitectura `bailingmoe3` ni el proyector `ling3vl`.
- El tamaño de los pesos (74-133 GB) obliga a estrategias de offloading o despliegues multi-GPU; el rendimiento real en configuraciones con expertos en CPU no está documentado.
- El `config` del checkpoint original declara `bfloat16` cuando en realidad es FP8 e4m3, lo que puede inducir a error en procesos de conversión manuales.

## Enlaces

- Repositorio GGUF analizado: https://huggingface.co/linuxid10t/Ling-3.2-air-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.2-air
- PR de llama.cpp con soporte para `bailingmoe3` y `ling3vl`: https://github.com/ggml-org/llama.cpp/pull/26608
