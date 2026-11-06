# bydlosoft/Huihui-Qwen3.8-Flash-Next-abliterated-v2-MLX-mixed-4_8bit

## Resumen

Huihui-Qwen3.8-Flash-Next-abliterated-v2-MLX-mixed-4_8bit es una compilación en formato MLX del modelo abliterado de huihui-ai sobre Qwen3.8-Flash-Next, desarrollado por Qwen. Se trata de un modelo de mezcla de expertos (MoE) de aproximadamente 180.000 millones de parámetros totales con 6.000 millones activos por token y una ventana de contexto de 262.144 tokens. La variante abliterada elimina la dirección de activación asociada a los rechazos, de modo que el modelo responde a peticiones que el original declina; no ha recibido entrenamiento ni alineamiento adicional.

La aportación concreta de esta ficha es el empaquetado para Apple Silicon mediante MLX: el autor parte de los pesos BF16 oficiales, sustituye únicamente los 96 tensores que la abliteración modificó (proyecciones de salida de atención, proyecciones de salida de atención lineal y proyecciones down de expertos compartidos) y cuantiza el conjunto con una receta mixta 4/8 bits medida en +1,3 % de perplejidad frente a BF16. El resultado son 74,2 GB de pesos más una tabla de embeddings n-grama de 32 GB que se lee desde disco fila a fila, y un cabezal MTP de 8 bits para decodificación especulativa.

Es relevante para quienes trabajan en inferencia local sobre hardware de Apple y necesitan un modelo multimodal de contexto muy largo sin restricciones de rechazo, a costa de unos requisitos de memoria unificada de aproximadamente 110 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (implementación `qwen4_exp` en mlx-vlm), con atención lineal, atención dispersa con indexador y expertos compartidos |
| Parametros totales | ~180.000 millones |
| Parametros activos | ~6.000 millones por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Mixta 4/8 bits: expertos enrutados 4-bit grupo 64; tabla de embeddings n-grama 4-bit grupo 32; resto de pesos cuantizables 8-bit grupo 64; router MoE, puertas residuales, `in_proj_a`/`in_proj_b` de atención lineal, indexador de atención dispersa y encoder de visión en BF16; escalas y sesgos en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`qwen-community-1.0`) |
| Formato de pesos | MLX (100 archivos, 74,2 GB), tabla n-grama `ple-q4.rows` (32,0 GB), cabezal MTP `mtp-drafter/` en 8 bits (2,8 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 180.000 millones de parámetros totales y 6.000 millones activos por token, contexto de 262.144 tokens y arquitectura identificada en mlx-vlm como `qwen4_exp`. Incorpora atención lineal, atención dispersa con indexador, expertos compartidos y una tabla de embeddings n-grama (PLE) que en esta compilación se almacena como row store en disco. Dispone además de un cabezal de predicción multi-token (MTP) utilizable para decodificación especulativa. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO del modelo original.

La compilación de esta ficha no reentrena nada: parte de los pesos BF16 oficiales y compara tensor a tensor con el GGUF `Q8_0` abliterado publicado por huihui-ai. Exactamente 96 tensores difieren (12 proyecciones de salida de atención, 36 de atención lineal y 48 proyecciones down de expertos compartidos), con una variación del 3-4,5 %, más del 93 % concentrada en una única dirección. Esos tensores se dequantizan del GGUF invirtiendo el reordenamiento de columnas del conversor y se escriben en lugar de los originales; reconvertidos y cuantizados de nuevo a `Q8_0`, reproducen byte a byte los tensores publicados. Sobre el resultado se aplica la receta de cuantización mixta que PipeNetwork midió en +1,3 % de perplejidad frente a BF16, frente al +20,6 % de una cuantización uniforme de 4 bits.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de 262.144 tokens.
- Procesamiento de imagen y texto (`image-text-to-text`): el encoder de visión se mantiene en BF16.
- Razonamiento y respuesta a peticiones que el modelo original rechaza, por efecto de la abliteración.
- Decodificación especulativa mediante el cabezal MTP incluido en `mtp-drafter/`.
- Recuperación de información en contextos largos: verificado con 3 de 3 hechos recuperados a 16k, 32k, 64k, 128k, 192k y 258k tokens.
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni capacidades de agente multi-paso.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Procesamiento de documentos extensos en local: análisis de contratos, informes o expedientes de cientos de miles de tokens en un Mac con memoria unificada suficiente, aprovechando la ventana de 262.144 tokens y la recuperación verificada hasta 258k.
- Asistencia sobre imagen y texto: transcripción, descripción y preguntas sobre capturas, diagramas o páginas escaneadas, gracias al pipeline `image-text-to-text` con encoder de visión en BF16.
- Investigación sobre alineamiento y abliteración: estudio de la diferencia de comportamiento entre el modelo base y la variante abliterada, con la garantía de que solo 96 tensores cambian y el resto es byte-idéntico al original en 8 bits.
- Generación de texto sin filtros en entornos controlados de creación literaria o guiones donde el modelo original declina la petición.
- Evaluación de cuantización mixta: banco de pruebas reproducible para medir el impacto de recetas 4/8 bits frente a BF16 con la perplejidad de wikitext-2 como referencia.
- Despliegue distribuido en clúster de Mac: reparto por pipeline parallelism entre varias máquinas de 64 GB, tal como el autor validó con cuatro Mac mini.
- Decodificación especulativa en producción local: uso del cabezal MTP de 8 bits para acelerar la generación en flujos interactivos.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Perplejidad en wikitext-2 test (145 ventanas de 2.048 tokens, evaluación de PipeNetwork) | 4,5502, IC 95 % [4,229; 4,882] |
| Perplejidad del modelo base BF16 en las mismas ventanas | 4,4708 |
| Perplejidad del modelo base con cuantización mixta 4/8 bits | 4,5286 |
| Recuperación de 3 hechos al 10 %, 50 % y 90 % de un documento | 3 de 3 a 16k, 32k, 64k, 128k, 192k y 258k tokens |
| Diferencia de perplejidad frente al build mixto del base | +0,5 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Memoria unificada estimada: aproximadamente 110 GB según el autor; el repositorio ocupa 69,3 GB y los pesos declarados suman 74,2 GB, más 32,0 GB de tabla n-grama en disco y 2,8 GB de cabezal MTP.
- No cabe en ninguna GPU de consumo con memoria dedicada convencional; está pensado para Apple Silicon con memoria unificada amplia.
- El autor no ha ejecutado el paquete en un solo proceso: sus máquinas tienen 64 GB cada una y validó el modelo completo repartiendo capas por pipeline parallelism entre cuatro Mac mini de 64 GB.
- La tabla n-grama permanece en disco y se lee fila a fila, por lo que las primeras peticiones son más lentas mientras sus páginas entran en la caché de página.
- Despliegue: `mlx-vlm` 0.7.12 o superior (`python -m mlx_vlm.generate`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete MLX.
- Latencia y throughput: no disponibles. El autor advierte que usar escalas en float32 en los 96 tensores abliterados convierte todo el flujo residual a float32 y hace la decodificación unas 3,5 veces más lenta, motivo por el que las escalas y sesgos se mantienen en BF16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (Huihui Qwen3.8-Flash-Next abliterated v2 MLX mixto 4/8 bits) | ~180B totales, 6B activos | 262.144 | MLX | Qwen Community License 1.0 | Abliterado, cuantización mixta, perplejidad 4,5502 en wikitext-2 |
| Qwen/Qwen3.8-Flash-Next (base) | ~180B totales, 6B activos | 262.144 | BF16 y otras | Qwen Community License 1.0 | Alineado; perplejidad BF16 4,4708 y mixta 4,5286 en las mismas ventanas |
| huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2 | ~180B totales, 6B activos | 262.144 | GGUF (Q8_0 publicado) | Qwen Community License 1.0 | Abliterado, origen de los 96 tensores sustituidos en esta compilación |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de comparación adicionales en la información proporcionada |

## Limitaciones y advertencias

- La abliteración elimina la dirección asociada a los rechazos: el modelo responde a peticiones que el original declina y no ha recibido entrenamiento ni alineamiento posterior. La responsabilidad de uso y del cumplimiento legal recae en quien lo despliega.
- Riesgo de alucinación no cuantificado en la información disponible; la perplejidad medida (4,5502) es ligeramente superior a la del base, coherente con el cambio introducido por la abliteración.
- Idiomas soportados no documentados; no se puede garantizar calidad fuera de los idiomas del modelo original.
- La licencia Qwen Community License 1.0 impone condiciones específicas para uso comercial que deben revisarse en el archivo `LICENSE` antes de producción.
- El autor no ha ejecutado el paquete en un solo proceso; la validación se hizo con pipeline parallelism en cuatro máquinas, por lo que el comportamiento en un único equipo con 110 GB de memoria unificada no está verificado empíricamente.
- Las primeras peticiones son más lentas por la carga de páginas de la tabla n-grama desde disco.
- Usar escalas en float32 en los tensores abliterados degrada la decodificación unas 3,5 veces; la receta publicada evita ese caso, pero cualquier requantización manual debe respetarlo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bydlosoft/Huihui-Qwen3.8-Flash-Next-abliterated-v2-MLX-mixed-4_8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Modelo abliterado de origen: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF
- Repositorio de PipeNetwork (estudio de cuantización y ventanas de evaluación): https://github.com/PipeNetwork/qwen38-flash-next-mlx
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
