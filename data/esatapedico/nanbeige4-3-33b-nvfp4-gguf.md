# esatapedico/Nanbeige4.3-33B-NVFP4-GGUF

## Resumen

Nanbeige4.3-33B-NVFP4-GGUF es una cuantización GGUF en formato NVFP4 del modelo denso Nanbeige4.3-33B, publicada por el usuario esatapedico. El modelo base, desarrollado por Nanbeige, es un transformer de arquitectura Llama con 33.118.977.180 parámetros, 52 capas, dimensión oculta de 7168, 56 cabezas de consulta y 8 cabezas KV, y una ventana de contexto nativa de 512K tokens. La licencia del modelo base y de esta conversión es Apache-2.0.

La particularidad de esta publicación es que no se trata de una cuantización GGUF convencional de tipo K-quant, sino de una conversión propia a NVFP4A16 (W4A16) con grupo de tamaño 16 y escalas FP8 E4M3 por tensor, aplicada únicamente a las proyecciones MLP (`gate/up/down_proj`) de las 52 capas, manteniendo la atención en BF16. Se ofrece como una escalera de siete niveles que comparten un backbone NVFP4 idéntico byte a byte, diferenciándose solo en la cuantización de cabezas y embeddings.

El interés práctico reside en que comprime un modelo denso de 33B hasta un rango de 16,95 a 23,40 GiB según nivel, lo que permite su ejecución completa en configuraciones de doble GPU consumer Blackwell de 16 GB. Está pensado para llama.cpp y backends compatibles con NVFP4, y reporta métricas propias de MMLU y GSM8K por nivel.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, arquitectura Llama (52 capas, 7168 hidden, 56 query / 8 KV heads; sin MoE, SWA, SSM ni MTP) |
| Parametros totales | 33.118.977.180 (33,1B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512K nativo en el modelo base; en esta conversion, <= 128K en los niveles VERY-LOW a MID-HIGH y <= 64K en HIGH, VERY-HIGH y HIGHEST |
| Tipos de cuantizacion | NVFP4A16 (W4A16, grupo 16, escalas FP8 E4M3 por tensor) en MLP; atencion en BF16 (o Q8_0 en HIGHEST); cabezas y embeddings variables por nivel (Q2_K, IQ4_XS, Q5_0, Q6_K, Q8_0, BF16); KV cache q4_0 |
| Idiomas soportados | Ingles (segun model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (tipo GGML 40 para el backbone NVFP4); checkpoint de conversion en safetensors NVFP4A16 de 2 shards |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de arquitectura Llama con 52 capas, dimensión oculta de 7168, 56 cabezas de consulta y 8 cabezas KV, y atención completa en todas las capas (sin sliding window attention). No incorpora mezcla de expertos, state space models ni multi-token prediction. La ventana de contexto nativa es de 512K tokens.

Sobre el entrenamiento del modelo base no se dispone de información en los datos proporcionados: no se detallan el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. La conversión aquí descrita es una cuantización weight-only y datafree, sin corpus de calibración: se cuantizan 156 tensores MLP en las 52 capas, se mantienen 208 tensores de atención en BF16, y se conservan en F32 las 104 layer norms, la `output_norm` y las 156 escalas NVFP4 por tensor. Las cabezas y embeddings se recuantizan por nivel. La plantilla de chat del `tokenizer_config.json` original se traslada a cada GGUF.

## Capacidades

- Generación de texto conversacional y de propósito general, con plantilla de chat incluida en todos los ficheros.
- Razonamiento y matemáticas: el autor reporta evaluación generativa de GSM8K con "thinking on", lo que indica soporte de modo de razonamiento extendido.
- Contexto largo: hasta 128K tokens en los niveles inferiores y 64K en los superiores, frente a los 512K nativos del modelo base.
- Capacidades multilingües: la model card declara únicamente inglés.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integración con infraestructura de inferencia estándar.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Despliegue en hardware consumer Blackwell: el nivel VERY-LOW (16,95 GiB) o LOW (17,46 GiB) permite ejecutar un modelo denso de 33B con offload completo en dos GPU de 16 GB, algo inviable con cuantizaciones de mayor tamaño.
- Procesamiento de documentos largos en local: con contexto de hasta 128K tokens en los niveles inferiores, se pueden analizar contratos, informes o bases de código extensas sin fragmentación agresiva.
- Razonamiento matemático asistido: el rendimiento reportado en GSM8K (91,0-92,5% según nivel) lo hace adecuado para tutoría o verificación de cálculos paso a paso con modo thinking.
- Servicio de chat conversacional autoalojado: la plantilla de chat incluida y la licencia Apache-2.0 permiten montar un endpoint de conversación sin restricciones de uso comercial.
- Evaluación comparativa de cuantizaciones: la escalera de siete niveles con backbone idéntico permite medir el impacto de la cuantización de cabezas y embeddings de forma aislada, útil para investigación en compresión de modelos.
- Prototipado en pipelines de llama.cpp: la compatibilidad con backends NVFP4 de llama.cpp facilita integrar el modelo en herramientas existentes sin reescribir la capa de inferencia.
- Experimentación académica con modelos de 33B: al reducir los requisitos de VRAM, permite a grupos con presupuesto limitado estudiar comportamiento de modelos densos grandes.

## Benchmarks y rendimiento

Datos reportados por el autor de la conversión, medidos con `bench_suite --tier gate --stages Q` en doble GPU Blackwell de 16 GB, con KV cache por defecto del servidor. MMLU-1000 con contexto completo de 8192 tokens por ítem y thinking desactivado; GSM8K-200 generativo con thinking activado. Los ítems de MMLU sin respuesta extraíble se excluyen del denominador.

| Nivel | MMLU | GSM8K |
|---|---|---|
| VERY-LOW | 68,26% (271/397 resueltos) | 91,0% (182/200) |
| LOW | 67,14% (286/426 resueltos) | 92,5% (185/200) |
| MEDIUM | 69,34% (303/437 resueltos) | 91,5% (183/200) |
| MID-HIGH | 69,83% (294/421 resueltos) | 92,5% (185/200) |
| HIGH | 69,07% (306/443 resueltos) | 92,0% (184/200) |
| VERY-HIGH | 68,34% (300/439 resueltos) | 92,5% (185/200) |
| HIGHEST | 72,14% (334/463 resueltos) | 92,5% (185/200) |

IFEval se parseó correctamente en 30/30 en todos los niveles. GPQA no se evaluó por falta de token de Hugging Face. El nivel HIGH no reprodujo sus cifras de octubre (67,57% MMLU / 91,0% GSM8K) en la re-ejecución de noviembre, con una banda de varianza de ±1,5 puntos porcentuales según el autor. No se dispone de comparación con el modelo base sin cuantizar ni con modelos de terceros en la información proporcionada.

## Requisitos de hardware

- VRAM para pesos: entre 16,95 GiB (VERY-LOW) y 23,40 GiB (HIGHEST). Ningún nivel cabe en una única tarjeta de 16 GB; el mínimo declarado es de 16,94 GiB.
- VRAM para KV cache: 58,5 KiB por token con q4_0 en las 52 capas de atención completa; 1,83 GiB a 32K, 3,66 GiB a 64K y 7,31 GiB a 128K.
- GPU recomendadas: el autor valida el offload completo en doble GPU Blackwell de 16 GB. Cualquier backend de llama.cpp con soporte NVFP4 y VRAM suficiente debería funcionar; no se especifican modelos concretos como A100, H100 o RTX 4090.
- GPU consumer: viable en configuraciones de dos tarjetas de 16 GB con arquitectura Blackwell; no cabe en una sola tarjeta consumer de 16 GB ni en tarjetas de 24 GB sin verificar el soporte NVFP4 del backend.
- Despliegue: llama.cpp y backends compatibles con NVFP4; la etiqueta `endpoints_compatible` sugiere uso con servidores de inferencia estándar. No se documenta soporte de vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni especificaciones de modelos comparables en la información proporcionada. Como referencia estructural, el propio modelo base Nanbeige4.3-33B (Apache-2.0, 33,1B denso, 512K de contexto, BF16) sería el punto de comparación natural, pero no se han publicado métricas del mismo en esta ficha. Tampoco se dispone de comparación con otras cuantizaciones GGUF del mismo modelo base ni con modelos densos de tamaño similar.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Nanbeige4.3-33B-NVFP4-GGUF (esta ficha) | 33,1B | 64K-128K segun nivel | Apache-2.0 | GGUF NVFP4 |
| Nanbeige4.3-33B (base) | 33,1B | 512K | Apache-2.0 | safetensors BF16 |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La model card declara únicamente inglés; el rendimiento en castellano u otros idiomas no está evaluado.
- El contexto efectivo se reduce respecto al modelo base: 128K en los niveles inferiores y 64K en HIGH, VERY-HIGH y HIGHEST, frente a los 512K nativos.
- La cuantización es datafree, sin corpus de calibración, lo que puede producir degradaciones no caracterizadas en dominios alejados de los benchmarks reportados.
- Los benchmarks son autoinformados por el autor de la conversión, con tamaños de muestra reducidos (MMLU-1000 con denominadores efectivos de 397 a 463 ítems; GSM8K-200) y sin comparación contra el modelo base.
- El nivel HIGH mostró una varianza de ±1,5 puntos porcentuales entre ejecuciones, lo que indica que las diferencias entre niveles pueden no ser estadísticamente significativas.
- No se reportan evaluaciones de sesgo, toxicidad ni alucinación.
- La licencia Apache-2.0 permite uso comercial, pero el autor recomienda validar cada nivel en la carga de trabajo propia antes de usarlo en producción.
- El soporte NVFP4 depende del backend de llama.cpp y de la arquitectura de GPU; en hardware no Blackwell el funcionamiento no está garantizado.
- El repositorio tiene 144,2 GB de tamaño total, aunque cada fichero individual pesa entre 18,20 y 25,13 GB.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/esatapedico/Nanbeige4.3-33B-NVFP4-GGUF
- Checkpoint de conversión NVFP4A16 en safetensors: https://huggingface.co/esatapedico/Nanbeige4.3-33B-NVFP4
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Sitio del autor de la conversión: https://www.esatapedico.com
