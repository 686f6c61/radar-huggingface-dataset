# Avifenesh/Hy4-flash-NVFP4

## Resumen

Hy4-flash-NVFP4 es una cuantización comunitaria del modelo multimodal Tencent Hy4-flash, un transformer de mezcla de expertos (MoE) de 220.251 millones de parámetros totales desarrollado originalmente por Tencent. La versión que nos ocupa la publica el usuario Avifenesh en Hugging Face y aplica una receta de cuantización en dos niveles: NVFP4 (4 bits, formato E2M1 con escalas de bloque E4M3) para las matrices de los expertos enrutados y FP8 E4M3 para las proyecciones de atención y las tablas de engram. El resultado comprime el checkpoint original de 440,5 GB en BF16 hasta 161,1 GB, lo que lo hace viable en hardware con memoria unificada limitada, en particular el DGX Spark (GB10), donde la release FP8 oficial de Tencent no cabe.

El modelo base combina 42 capas con tamaño oculto 3072, atención de tipo MLA con capas de atención dispersa al estilo DeepSeek (un indexador comprimido selecciona hasta 2048 posiciones) y capas con ventana deslizante de 512 tokens, además de un contexto de 1.048.576 tokens, una torre de visión y un drafter especulativo integrado de 5 capas (DFly2, 0,85B). La cuantización es data-free: no requiere calibración, y el autor reporta un error de reconstrucción de pesos del 0,660 % de media en las 62.976 matrices de expertos, frente al 1,14 % de la build GGUF de 4 bits del propio fabricante.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de cuantización (escala por bloque elegida por búsqueda MSE más escala FP32 potencia de dos por experto) que reduce el error frente a MXFP4 en todas las matrices medidas. Por otro, conviene subrayar su estado: es un checkpoint solo de pesos, sin runtime verificado que lo cargue y sin evaluación de extremo a extremo, por lo que no debe considerarse listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (42 capas, hidden 3072; capa 0 densa, capas 1-41 MoE con 512 expertos enrutados, 16 activos por token más 1 compartido, routing sigmoide); atención MLA con capas de atención dispersa DeepSeek (indexador comprimido, hasta 2048 posiciones) y capas de ventana deslizante de 512 tokens; torre de visión; tablas de engram n-gram en 4 capas |
| Parametros totales | 220.251.201.958 (220,25B) |
| Parametros activos | 16 expertos enrutados + 1 compartido por token (número exacto de parámetros activos no disponible) |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | NVFP4 weight-only (E2M1, escala E4M3 por bloque de 16 valores + escala FP32 por experto) en expertos enrutados y MLPs del drafter; FP8 E4M3 con escalas de bloque 128x128 en `q_b_proj`, `o_proj`, `linear_gate`; FP8 con una escala por fila en tablas de engram; resto en BF16/F32 sin cambios |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license-1.0 (misma que el modelo base; no es una release oficial de Tencent) |
| Formato de pesos | safetensors (50 archivos); configuración ModelOpt (`quantization_config` en `config.json` y `hf_quant_config.json`) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de 42 capas con tamaño oculto 3072. La capa 0 es densa y las capas 1 a 41 son de mezcla de expertos con 512 expertos enrutados, de los que se activan 16 por token más un experto compartido, con routing sigmoide. La atención sigue un esquema MLA que alterna capas de atención dispersa al estilo DeepSeek, donde un indexador comprimido selecciona hasta 2048 posiciones, con capas de ventana deslizante de 512 tokens. Incorpora además tablas de embedding de engram n-gram en cuatro capas que suman 63,4B de parámetros, una torre de visión de 27 capas y un drafter especulativo integrado DFly2 de 5 capas y 0,85B que genera un bloque de tokens en una pasada leyendo la caché KV y las selecciones del indexador del modelo principal, sin añadir memoria KV adicional.

Sobre el entrenamiento del modelo base no se proporciona información en la documentación disponible (número de tokens, composición del dataset, uso de RLHF o DPO: no disponible). Lo que sí está documentado es el proceso de cuantización de este checkpoint, que es data-free y se aplica tensor a tensor según su clase. Para los expertos se usa el layout NVFP4 de dos niveles de ModelOpt: códigos E2M1 empaquetados dos por byte, una escala E4M3 por cada 16 valores de entrada y una escala FP32 por experto. Las escalas de bloque se eligen mediante búsqueda MSE sobre los códigos E4M3 alrededor del código absmax, y la escala por experto es una potencia de dos: el menor factor que deja como máximo un 0,1 % de bloques con escala subnormal, con el límite de que ninguna escala de bloque supere 448. Esta segunda escala es la que explica la mejora frente a recetas sin escala por tensor, que en los pesos pequeños de Hy4-flash provocan que el 99,8 % de los bloques de 16 valores caigan en escala subnormal E4M3 y pierdan precisión. No se incluye `input_scale`: las activaciones quedan a cargo del runtime.

## Capacidades

- Generación de texto conversacional e instructiva, con pipeline declarado `image-text-to-text`.
- Procesamiento multimodal de imagen y texto mediante la torre de visión de 27 capas incluida en el checkpoint.
- Contexto largo de hasta 1.048.576 tokens, apoyado en la combinación de atención dispersa con indexador y capas de ventana deslizante.
- Decodificación especulativa integrada mediante el drafter DFly2 de 0,85B, que comparte caché KV con el modelo principal.
- Memoria de n-gramas mediante tablas de engram en cuatro capas, orientadas a mejorar la recuperación de patrones léxicos y de contexto.
- Capacidades multilingües: no disponible (no se documentan los idiomas soportados).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en DGX Spark (GB10): el caso de uso principal declarado por el autor. La compresión a 161,1 GB permite cargar el modelo en un equipo con memoria unificada donde la release FP8 oficial de Tencent no cabe, habilitando inferencia local de un MoE de 220B con visión y contexto de 1M.
- Procesamiento de documentos largos con imágenes: gracias al contexto de 1.048.576 tokens y a la torre de visión, el modelo puede recibir lotes de documentos escaneados, informes con gráficos o capturas y responder preguntas que cruzan información entre páginas, sin trocear el contenido.
- Análisis de repositorios de código completos: el contexto de 1M tokens permite introducir varios archivos o un repositorio entero en una sola ventana para tareas de revisión, explicación o búsqueda de dependencias entre módulos, siempre que el runtime soporte el checkpoint.
- Investigación en cuantización: el checkpoint sirve como referencia reproducible para estudiar el impacto de NVFP4 con escala por experto frente a MXFP4 y frente a la build GGUF del fabricante, con estadísticas por tensor publicadas en `quant-stats/` y metodología en `QUALITY.md`.
- Evaluación de decodificación especulativa en modelos cuantizados: el drafter DFly2 incluido permite medir tasas de aceptación con pesos de 4 bits, un dato que el autor señala explícitamente como no medido todavía y que resulta relevante para quien diseñe kernels o runtimes.
- Prototipado de asistentes multimodales con memoria de largo alcance: las tablas de engram y el contexto extendido encajan en escenarios de asistencia técnica continuada donde el modelo debe recordar terminología y decisiones previas a lo largo de sesiones muy largas.
- Base para desarrollo de kernels NVFP4: al mantener los nombres de tensor originales y separar `gate_proj` y `up_proj` (cada uno `[512, 1536, 1536]`), el checkpoint es útil para implementar y validar kernels de fusión `gate_up` y de dequantización en hardware Blackwell.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor indica explícitamente que no se ha ejecutado ninguna evaluación de modelo completo. Los únicos datos publicados son errores de reconstrucción de pesos frente al origen BF16, calculados como `rel = sum((W - Wq)^2) / sum(W^2)` sobre todos los tensores cuantizados:

| Tensores | Formato | Cantidad | Error medio | Peor caso |
|---|---|---|---|---|
| Expertos enrutados, capas 1-41 | NVFP4 (este checkpoint) | 62.976 matrices | 0,660 % | 0,664 % |
| Mismas matrices | MXFP4 (E8M0 por 32), medido, no distribuido | 62.976 | 1,258 % | 1,316 % |
| Build del fabricante `SPARK-4Bit-Fast` GGUF | NVFP4, decodificado del archivo | 18 slices de expertos muestreados | 1,14 % | 1,30 % |
| MLPs de DFly2 + `hidden_correction` | NVFP4 | 18 | 0,660 % | 0,661 % |
| `q_b_proj`, `o_proj`, `linear_gate` | FP8, escalas de bloque 128x128 | 138 | 0,070 % | 0,070 % |
| Tablas de engram n-gram | FP8, una escala por fila | 4 | 0,067 % | 0,068 % |

Comparativas derivadas de esos datos: frente a la build GGUF del fabricante, este checkpoint presenta 0,66 % frente a 1,14 % en las mismas 18 slices, es decir, 1,7 veces menos error cuadrático; frente a MXFP4, el error de NVFP4 es 1,91 veces menor de media y mejor en las 62.976 matrices. Las medias por capa se mantienen entre 0,642 % y 0,661 %, sin valores atípicos. En el análisis de receta sobre 140 slices de expertos de 7 capas: escala de bloque absmax sin escala por tensor da 1,03 %; búsqueda MSE sin escala por tensor, 0,77 %; búsqueda MSE con escala FP32 potencia de dos por experto (la de este checkpoint), 0,66 %. La tasa de aceptación del drafter DFly2 con estos pesos cuantizados no se ha medido.

## Requisitos de hardware

- VRAM/memoria estimada: el checkpoint ocupa 161,1 GB en disco repartidos en 50 safetensors. En inferencia hay que sumar la caché KV del contexto utilizado y las activaciones; para contexto completo de 1.048.576 tokens el requisito de memoria KV no está documentado y será sustancialmente mayor que el peso de los pesos.
- GPU recomendadas: el autor orienta el checkpoint a DGX Spark (GB10), con memoria unificada, y el formato NVFP4 apunta a hardware Blackwell con soporte nativo de FP4. GPU de datacenter tipo H100 o A100 requerirían decodificar NVFP4 a un formato soportado, con la penalización de rendimiento correspondiente.
- GPU de consumo: no cabe en ninguna GPU de consumo actual por tamaño (161,1 GB solo de pesos). No es viable en RTX 4090 (24 GB) ni en configuraciones multi-GPU domésticas habituales sin offloading masivo a RAM.
- Opciones de despliegue: no hay runtime verificado que cargue este checkpoint. El autor menciona soporte planificado en `memra` (https://github.com/avifenesh/memra). El `config.json` sigue el esquema ModelOpt, con `quant_algo` `MIXED_PRECISION`, `W4A16_NVFP4` (grupo 16) para los módulos NVFP4 y `FP8_PB_WO` (128x128) para las proyecciones FP8. Dos detalles se desvían de una exportación ModelOpt estándar: la escala FP8 de bloque se llama `weight_scale_inv` (nombre heredado de `tencent/Hy4-flash-FP8`) y las tablas de engram FP8 por fila no tienen nombre de algoritmo ModelOpt, sino un campo `comment` descriptivo.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Error de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Hy4-flash-NVFP4 (este) | 220,25B (MoE) | 1.048.576 | NVFP4 + FP8 mixto | 0,660 % (expertos) | tencent-hy-license-1.0 | Pesos publicados, sin runtime verificado |
| tencent/Hy4-flash (BF16) | 220,25B (MoE) | 1.048.576 | BF16 | referencia | tencent-hy-license-1.0 | Release oficial de Tencent |
| tencent/Hy4-flash-FP8 | 220,25B (MoE) | 1.048.576 | FP8 | no disponible | tencent-hy-license-1.0 | Release oficial; no cabe en DGX Spark según el autor |
| Build `SPARK-4Bit-Fast` GGUF (fabricante) | 220,25B (MoE) | 1.048.576 | NVFP4 GGUF, sin escala por tensor | 1,14 % (18 slices) | tencent-hy-license-1.0 | Distribuida por el fabricante para DGX Spark |

La comparación con modelos de otros fabricantes y tamaño similar no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Estado del artefacto: es un checkpoint solo de pesos. Ningún runtime ha sido verificado para cargarlo y no se ha ejecutado ninguna evaluación de modelo completo. Los números publicados miden error de reconstrucción de pesos, no calidad de las respuestas.
- No es una release oficial de Tencent: la mantiene un tercero (Avifenesh) y hereda la licencia del modelo base, tencent-hy-license-1.0, cuyos términos para uso comercial deben revisarse en el archivo LICENSE antes de cualquier despliegue productivo.
- La tasa de aceptación del drafter especulativo DFly2 con pesos cuantizados no se ha medido, por lo que la ganancia real de velocidad de la decodificación especulativa es desconocida.
- El checkpoint no incluye `input_scale`: la cuantización de activaciones queda enteramente a cargo del runtime, lo que puede introducir degradación adicional no capturada por las métricas de error de pesos.
- Idiomas soportados no documentados; no puede garantizarse un comportamiento multilingüe homogéneo.
- Sesgos conocidos: no disponible en la información proporcionada. Al ser una cuantización data-free, no se ha realizado ningún ajuste que mitigue sesgos del modelo base.
- Riesgo de alucinación: no cuantificado para este checkpoint; el modelo base no aporta evaluaciones en la documentación disponible.
- El contexto de 1.048.576 tokens es una capacidad teórica del modelo base; el coste de memoria KV a esa longitud no está documentado y condiciona su uso real.
- Nombres y estructura de tensores: `gate_proj` y `up_proj` van separados, por lo que los kernels que esperen `gate_up` fusionado requieren trabajo en tiempo de carga. La escala FP8 usa el nombre `weight_scale_inv` y las tablas de engram carecen de nombre de algoritmo ModelOpt, lo que puede romper cargadores que validen el esquema estrictamente.
- El tamaño de 161,1 GB sigue exigiendo hardware de gama alta con memoria unificada o agregada; no es desplegable en GPU de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Avifenesh/Hy4-flash-NVFP4
- Modelo base: https://huggingface.co/tencent/Hy4-flash (revisión `d88c9dfd96ba`)
- Release FP8 oficial del modelo base: https://huggingface.co/tencent/Hy4-flash-FP8
- Repositorio del runtime memra (soporte planificado): https://github.com/avifenesh/memra
- Metodología de medición de error: `QUALITY.md` en el repositorio del modelo
- Layout tensor a tensor: `LAYOUT.md` en el repositorio del modelo
- Lista de módulos cuantizados: `quant_config.json` en el repositorio del modelo
- Estadísticas por tensor: carpeta `quant-stats/` en el repositorio del modelo
- Licencia: `LICENSE` (Tencent Hy License 1.0) en el repositorio del modelo
