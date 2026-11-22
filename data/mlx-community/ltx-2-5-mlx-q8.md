# mlx-community/ltx-2.5-mlx-q8

## Resumen

LTX-2.5 es un modelo generativo de vídeo desarrollado por Lightricks que produce clips con pista de audio sincronizada a partir de texto o de una imagen de referencia. Esta ficha cubre la variante `mlx-community/ltx-2.5-mlx-q8`, una conversión comunitaria a MLX (el framework de Apple para Apple Silicon) en la que el codificador de texto Gemma-4 se ha cuantizado a int8, reduciendo su peso de 23,8 GB a 13,6 GB. El objetivo no es tanto ahorrar disco como rebajar el suelo de memoria del pipeline completo: con el transformador (DiT) en streaming, el codificador bf16 imponía un pico de aproximadamente 24,8 GB independiente de la resolución del clip, lo que dejaba fuera a máquinas de 24 GB y 32 GB. Con este codificador int8, el pico baja a 14,6 GB y 15,4 GB respectivamente.

El repositorio es un árbol de componentes completo y autónomo, pero conviene subrayar que **no contiene un DiT cuantizado**: la cuantización del transformador vive en un repositorio hermano (`mlx-community/ltx-2.5-mlx-ditq8`) y ambas decisiones son independientes, de modo que se puede combinar un codificador int8 con un DiT en bf16 o int8. El repo ocupa 24,6 GB e incluye además un decodificador VAE podado y destilado de PrunaAI (`vae_decoder_pruna.safetensors`) que acelera la decodificación aproximadamente 2× y reduce el pico de activaciones.

La relevancia de esta variante es práctica: demuestra que en generación de vídeo local el cuello de botella no siempre es el modelo principal, sino componentes auxiliares como el codificador de texto, y que cuantizar esos componentes con criterio (excluyendo deliberadamente `embed_tokens`) permite ejecutar pipelines de vídeo-audio en hardware de consumo de Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (pipeline de difusión vídeo+audio de LTX-2.5; DiT + codificador de texto Gemma-4 + VAE; conversión MLX) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el codificador produce 1024 posiciones de tokens) |
| Tipos de cuantizacion | int8 grupo 64 en el codificador de texto (`embed_tokens` excluido, mantenido en bf16); DiT en bf16 o int8 según repositorio hermano |
| Idiomas soportados | no disponible |
| Licencia | LTX-2 Community License Agreement (incluye puerta de ingresos del Anexo A y cláusula de no competencia) |
| Formato de pesos | safetensors (MLX) |
| Tamano del repositorio | 24,6 GB |
| Tamano del codificador int8 | 13,6 GB (frente a 23,8 GB en bf16) |
| Pico de memoria (pipeline, con DiT en streaming) | 14,6 GB en máquina de 24 GB; 15,4 GB en máquina de 32 GB |
| Resoluciones mencionadas | 256×256×9, 512×288×121, 704×512×121 |
| Repositorio base | Lightricks/LTX-2.5 |
| Descargas / likes | 635 / 3 |

## Arquitectura y entrenamiento

La información disponible describe el pipeline, no los detalles de entrenamiento. LTX-2.5 combina un transformador de difusión (DiT) que genera el vídeo, un codificador de texto Gemma-4 que produce las condicionales (49 estados de hidden state que consume un conector, con 48 capas y 1024 posiciones), y un VAE de vídeo que decodifica los latentes. La conversión a MLX mantiene el grafo y traduce las convoluciones de PyTorch al formato de MLX; en esta variante concreta solo cambia el codificador de texto, cuantizado a int8 con grupos de 64 y con la matriz de embeddings deliberadamente excluida de la cuantización, ya que el estado oculto 00 es exactamente `embedTokens(ids) · embedScale` y alimenta las 48 capas.

No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. Sí se documenta una innovación de despliegue relevante: el streaming del DiT, que junto con el codificador int8 hace viable el pipeline en memoria acotada. También se incluye un decodificador VAE alternativo de PrunaAI, podado y afinado por destilación, convertido desde el layout de diffusers al dialecto plano de `ltx-core` mediante un script de mapeo de claves y transposición de convoluciones, sin alterar valores de tensores; incorpora dos bloques con ResBlock adaptador de canales (512→384 y 384→256) que el decodificador original no tiene.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video), tarea declarada del pipeline.
- Generación de vídeo a partir de imagen (image-to-video).
- Generación conjunta de vídeo y audio (audio-video), según las etiquetas del repositorio.
- Control de geometría y duración del clip: se documentan pruebas a 256×256×9, 512×288×121 y 704×512×121 fotogramas.
- Ejecución en Apple Silicon mediante MLX, con soporte de streaming del DiT para limitar el pico de memoria.
- Selección de decodificador VAE alternativo (Pruna) para acelerar la decodificación y reducir el pico de activaciones.
- Combinación flexible de componentes: codificador int8 con DiT bf16 o int8.
- Soporte de tool calling, agentes, razonamiento multi-paso o modo thinking: no disponible (no es un modelo de lenguaje conversacional).
- Capacidades multilingües: no disponible.

## Casos de uso

- Generación de clips cortos en un Mac con 24 GB de memoria unificada: la combinación de codificador int8 y DiT en streaming mantiene el pico en 14,6 GB, lo que permite iterar sobre prompts sin recurrir a GPU dedicada.
- Prototipado de vídeo con audio para redes sociales: el modelo genera imagen y pista sonora en una sola pasada, lo que simplifica el flujo frente a encadenar un generador de vídeo y otro de audio.
- Animación de imágenes fijas (image-to-video): útil para convertir ilustraciones o fotografías en clips breves manteniendo la composición de la imagen de referencia.
- Evaluación comparativa de cuantizaciones: al poder mezclar codificador int8 con DiT bf16 o int8, sirve para medir el impacto de cada eje de cuantización por separado en la fidelidad del resultado.
- Pruebas perceptivas ciegas de calidad: el repositorio documenta un A/B perceptivo de 4 pares que puede reproducirse para validar si la pérdida de fidelidad del codificador es aceptable en un dominio concreto (por ejemplo, primeros planos de rostros).
- Despliegue en máquinas de 32 GB con margen de memoria: el pico de 15,4 GB deja espacio para otras aplicaciones, lo que facilita usar el equipo como estación de generación mientras se trabaja en paralelo.
- Investigación sobre decodificadores ligeros: el fichero `vae_decoder_pruna.safetensors` permite medir la ganancia de velocidad (documentada en −15,9 % de tiempo por clip y reducción de pico de 21,1 a 14,5 GB en 704×512×121) frente al decodificador estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no se trata de un modelo de lenguaje. Los únicos datos cuantitativos publicados son métricas de fidelidad y de memoria del proceso de cuantización y del decodificador alternativo:

| Metrica | Valor |
|---|---|
| Fidelidad del conector (posiciones de tokens válidas), codificador int8 | 0,999820 |
| Fidelidad del conector, suelo bf16 de referencia | 0,999879 |
| Fidelidad de un brazo deliberadamente envenenado (whole-array) | 0,994316 |
| Fidelidad del mismo brazo en sus tokens reales | 0,829329 |
| Pico de memoria con codificador bf16 (DiT en streaming) | ~24,8 GB |
| Pico de memoria con codificador int8, máquina de 24 GB | 14,6 GB |
| Pico de memoria con codificador int8, máquina de 32 GB | 15,4 GB |
| Decodificador Pruna: tiempo por clip (tier compact24) | −15,9 % |
| Decodificador Pruna: pico en 704×512×121 | 21,1 GB → 14,5 GB |
| Diferencia de la muestra frente a bf16 (media / desviación) | −0,1421 / 0,4253 frente a −0,1274 / 0,4222 |

## Requisitos de hardware

- VRAM o memoria unificada: pico de 14,6 GB en máquinas de 24 GB y 15,4 GB en máquinas de 32 GB, con el DiT en streaming y el codificador int8. Con codificador bf16 el pico ronda los 24,8 GB, fuera de presupuesto para ambos perfiles.
- El pico con codificador bf16 es independiente de la geometría del clip (medido: 256×256×9 y 512×288×121 difieren en menos de 0,01 GB), lo que indica que está dominado por el codificador y no por la decodificación.
- GPU recomendadas: no se indican GPU NVIDIA ni AMD; el repositorio está orientado a Apple Silicon mediante MLX. Se menciona un Apple M5 Pro de 24 GB como plataforma de medida.
- Cabe en GPU de consumo: la información disponible solo documenta ejecución en Apple Silicon; no hay datos sobre RTX 4090 u otras GPU de consumo con este backend.
- Opciones de despliegue: MLX y el port Swift `ltx-2-mlx-swift` (con `LTX2Configuration.vaeDecoderPath` o la variable `LTX_VAE_DECODER=pruna` para seleccionar el decodificador Pruna). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible de forma absoluta; solo se publica la mejora relativa del decodificador Pruna (−15,9 % de tiempo por clip en el tier compact24).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Memoria / requisitos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mlx-community/ltx-2.5-mlx-q8 (esta ficha) | no disponible | no disponible | Pico 14,6–15,4 GB con DiT en streaming | LTX-2 Community License | Hugging Face, MLX |
| mlx-community/ltx-2.5-mlx | no disponible | no disponible | Codificador bf16 de 23,8 GB; pico ~24,8 GB | LTX-2 Community License | Hugging Face, MLX |
| mlx-community/ltx-2.5-mlx-ditq8 | no disponible | no disponible | DiT cuantizado int8; combinable con este repo | LTX-2 Community License | Hugging Face, MLX |
| Lightricks/LTX-2.5 | no disponible | no disponible | Pesos originales; requisitos no disponibles | LTX-2 Community License | Hugging Face |

No se dispone en la información proporcionada de comparaciones con modelos de vídeo de otros desarrolladores (por ejemplo, de familias competidoras) ni de cifras de rendimiento que permitan una comparación objetiva.

## Limitaciones y advertencias

- La salida no es bit-idéntica a la del codificador bf16: cambia la condicional y, por tanto, la trayectoria de generación. El resultado es un vídeo distinto pero igualmente válido según el A/B perceptivo ciego documentado; comparar ambas variantes con SSIM o PSNR sería un error de categoría.
- La métrica de fidelidad debe leerse sobre las posiciones de tokens válidas, no sobre el array completo: con prompts cortos, la mayoría de las 1024 posiciones son registros aprendidos idénticos entre variantes y diluyen la cifra entre 3 y 30 veces.
- Este repositorio no incluye un DiT cuantizado; quien espere un pipeline completamente int8 debe combinarlo con el repositorio hermano.
- El codificador int8 por sí solo no resuelve el problema de memoria: sin streaming del DiT el pico sigue dominado por el transformador residente.
- Licencia restrictiva: la LTX-2 Community License incluye una puerta de ingresos en el Anexo A y una cláusula de no competencia, además de obligaciones de propagación de términos en redistribuciones (§3). Es imprescindible revisar `LICENSE.md` antes de cualquier uso comercial.
- El decodificador Pruna se redistribuye bajo la misma licencia LTX-2, con la sección correspondiente como aviso de modificación (§3.3); su uso no altera ni relaja las condiciones.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible, pero son inherentes a los modelos generativos de vídeo y deben evaluarse por dominio antes de producción.
- Idiomas soportados: no disponible; no se puede garantizar el comportamiento del codificador de texto en castellano.
- No hay datos publicados sobre latencia absoluta, throughput ni calidad objetiva frente a otros generadores de vídeo.
- La integridad del fichero `vae_decoder_pruna.safetensors` (690.025.680 bytes, SHA-256 `891ec5f0680acea9acbdd651c9756a26c5d3298480224356cf5ea86071846f79`) debe verificarse tras la descarga.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mlx-community/ltx-2.5-mlx-q8
- Repositorio base (codificador bf16): https://huggingface.co/mlx-community/ltx-2.5-mlx
- Repositorio del DiT cuantizado: https://huggingface.co/mlx-community/ltx-2.5-mlx-ditq8
- Modelo original: https://huggingface.co/Lightricks/LTX-2.5
- Decodificador VAE de PrunaAI: https://huggingface.co/PrunaAI/PrunaVAED
- Script de conversión del decodificador: https://github.com/xocialize/ltx-2-mlx/blob/ltx-2.5/scripts/convert_pruna_vae_decoder.py
- Repositorio del port Swift: https://github.com/xocialize/ltx-2-mlx-swift (referenciado como `ltx-2-mlx-swift` en la model card)
- Licencia: `LICENSE.md` dentro del repositorio de Hugging Face
