# ModelsLab/MiniMax-H3-svdquant-int4_r32

## Resumen

Este repositorio contiene una cuantización SVDQuant W4A4 (int4) del modelo MiniMax-H3, un transformador de 31 000 millones de parámetros para generación conjunta de vídeo y audio, desarrollado por MiniMax. La cuantización, realizada por ModelsLab, reduce el checkpoint del DiT (transformador de difusión) de 61,7 GB a 19,6 GB, y acelera la generación en un factor de 1,31x en una A100 80 GB (hasta 1,52x en configuración completamente residente). El modelo base, MiniMax-H3, es un modelo nativo multimodal capaz de generar vídeo 2K con audio estéreo 3D sincronizado en una sola pasada de inferencia. Esta versión cuantizada permite ejecutar el modelo completo (DiT + text encoder) en una sola GPU de 80 GB sin descarga a CPU, algo inalcanzable en BF16. La relevancia actual radica en hacer viable la ejecución local de modelos de vídeo de última generación con requisitos de hardware reducidos, manteniendo una calidad visual prácticamente indistinguible del original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformador de difusión conjunta para vídeo y audio (DiT) con text conditioner Qwen3-VL 31B (W4A16+GPTQ) |
| Parametros totales | 31 000 millones (modelo base completo); el DiT cuantizado ocupa 19,6 GB en int4 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (secuencias de vídeo de 124 frames a 24 fps en las pruebas) |
| Tipos de cuantizacion | W4A4 (pesos y activaciones int4) mediante SVDQuant con rama de bajo rango rank-32 en bf16; atención en bf16; token_refiner en bf16 |
| Idiomas soportados | No disponible (probablemente multilingüe, no especificado) |
| Licencia | minimax-h3-license (derivada de MiniMaxAI/MiniMax-H3) |
| Formato de pesos | safetensors (empaquetado con layout nunchaku) |

## Arquitectura y entrenamiento

El modelo base MiniMax-H3 emplea un proceso de difusión conjunta para generar vídeo y audio simultáneamente, con un text conditioner basado en Qwen3-VL de 31 000 millones de parámetros. El DiT principal es un transformador que procesa secuencias espacio-temporales de tokens de vídeo y audio. La cuantización SVDQuant (ICLR 2025 Spotlight) absorbe los outliers de activación en una rama de bajo rango (rank 32) en bf16, mientras que los pesos residuales se redondean a int4 mediante GPTQ y las activaciones se cuantizan a int4 por token en tiempo de ejecución. Los kernels de cómputo son CUTLASS fusionados para tensor cores int4 (sm_75-89). El text conditioner se cuantiza con W4A16+GPTQ, manteniendo todas las normas, embeddings y la torre visual en bf16, siguiendo la receta oficial de MiniMax. No se dispone de información sobre el dataset de entrenamiento del modelo base ni sobre el proceso de alineación (RLHF/DPO).

## Capacidades

- Generación de vídeo de alta resolución (hasta 2K) con audio estéreo 3D sincronizado en una sola pasada.
- Generación conjunta de vídeo y sonido: el modelo produce el audio coherente con la escena visual (ej. un zorro en un bosque nevado genera sonido ambiental acorde).
- Text-to-video: acepta prompts en lenguaje natural y genera secuencias de vídeo con movimiento y audio.
- Capacidad de razonamiento multimodal gracias al text conditioner Qwen3-VL, que interpreta el prompt y guía la generación.
- No se menciona soporte explícito de tool calling, agentes ni funciones especiales más allá de la generación de vídeo/audio.

## Casos de uso

- Producción de vídeo para marketing y publicidad: generar clips cortos con audio sincronizado para campañas en redes sociales, reduciendo costes de producción.
- Creación de contenido educativo: producir vídeos explicativos animados con narración y efectos de sonido generados automáticamente.
- Prototipado rápido para cine y animación: previsualizar escenas con audio antes de la producción final, acelerando el proceso creativo.
- Generación de material para videojuegos: crear cinemáticas o fondos animados con sonido ambiental para entornos de juego.
- Asistencia a personas con discapacidad visual: generar descripciones audiovisuales de escenas a partir de texto, combinando vídeo y audio.
- Investigación en IA multimodal: servir como base para estudios sobre generación conjunta de vídeo y audio, y sobre técnicas de cuantización extrema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) para este modelo, al tratarse de una tarea de generación de vídeo. Las mediciones proporcionadas por el autor se centran en rendimiento y calidad perceptual:

| Métrica | BF16 | Este release (int4) | Factor |
|---|---|---|---|
| Tamaño del checkpoint DiT | 61,7 GB | 19,6 GB | 3,15x |
| Tiempo de generación (A100, 124 frames, 960x544) | 484 s | 369 s | 1,31x más rápido |
| Tiempo de generación (configuración residente, sin offload) | 484 s (con offload) | 318 s | 1,52x más rápido |
| VRAM pico (configuración residente) | 65 GB con offload | 54,3 GB (49,2 steady) | — |
| LPIPS (comparación con nunchaku oficial en Z-Image) | — | 0,288 vs 0,334 | Mejor calidad |

La verificación independiente en una A100 fresca reporta 1,42x de aceleración y 54,6 GB de VRAM pico, con una horquilla honesta de 1,4-1,5x. Los kernels cuantizados concuerdan con el oráculo fp32 en un 1,5-2,1% de error relativo.

## Requisitos de hardware

- GPU con tensor cores int4 (sm_75-89): RTX 20/30/40 series, A100. No compatible con RTX 50 (sm_120) en esta versión; se planea una variante NVFP4.
- VRAM mínima: 48,9 GB steady para la configuración all-int4 residente (DiT + text encoder), 54,3 GB pico. En la práctica se requiere una GPU de 80 GB (A100, H100) o dos GPUs de 48 GB.
- En GPUs de consumo (RTX 4090 con 24 GB) no cabe la configuración residente; sería necesario offload a CPU, con penalización de rendimiento.
- Torch >= 2.11 y kernels CUTLASS fusionados; instalación mediante `pip install git+https://github.com/ModelsLab/svdquant git+https://github.com/rootonchair/nunchaku-lite`.
- Despliegue: integración con diffusers ModularPipeline (sustituyendo el transformador BF16). No se mencionan vLLM, TGI ni Ollama para este modelo.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos de generación de vídeo cuantizados en la información proporcionada. La única comparación publicada es con el checkpoint BF16 original del propio MiniMax-H3, que muestra una reducción de 3,15x en tamaño y una aceleración de 1,4-1,5x con calidad visual indistinguible. También se compara favorablemente con el checkpoint nunchaku oficial en términos de LPIPS (0,288 vs 0,334). No hay datos de modelos alternativos como CogVideoX, Mochi o W.A.L.T. en esta fuente.

## Limitaciones y advertencias

- La atención se mantiene en bf16, lo que limita la aceleración end-to-end en secuencias de vídeo largas (efecto Amdahl).
- El token_refiner (2 bloques, ~2% de los parámetros) permanece en bf16, siguiendo la receta int8 de MiniMax.
- La licencia minimax-h3-license puede imponer restricciones de uso comercial; es necesario revisar los términos específicos en el repositorio base.
- No se garantiza compatibilidad con GPUs sin soporte int4 tensor cores (RTX 50, GPUs de datacenter más antiguas).
- La calidad perceptual se verificó solo con dos prompts; puede haber degradación en escenas complejas o con mucho movimiento.
- El proceso de cuantización requiere 44 minutos en una A100 y no es trivial de reproducir; el modelo empaquetado está listo para usar, pero la personalización de la cuantización no está documentada.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones idiomáticas del modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ModelsLab/MiniMax-H3-svdquant-int4_r32
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Paper SVDQuant: http://arxiv.org/abs/2411.05007
- GitHub del hub MiniMax-H3: https://github.com/ai-models-lab/minimax-h3
- Guía de hardware y cuantización: https://deepwiki.com/ai-models-lab/minimax-h3/4.2-hardware-requirements-and-quantization-guide
- Referencia del modelo MiniMax-H3: https://deepwiki.com/ai-models-lab/minimax-h3/4-minimax-h3-model-reference
- Repositorio svdquant: https://github.com/ModelsLab/svdquant
- Repositorio nunchaku: https://github.com/nunchaku-ai/nunchaku
- Repositorio nunchaku-lite: https://github.com/rootonchair/nunchaku-lite
- Repositorio diffuse-compressor: https://github.com/rootonchair/diffuse-compressor
