# AI-KSK/minimax-h3-ultra-hd-routes-304

## Resumen

`AI-KSK/minimax-h3-ultra-hd-routes-304` es un repositorio de HuggingFace publicado por el usuario AI-KSK que no contiene pesos de un modelo en el sentido habitual, sino un conjunto de flujos de trabajo (workflows) en formato JSON para ComfyUI orientados a la generación de vídeo con audio mediante el modelo MiniMax H3. El repositorio empaqueta ocho presets de generación distribuidos entre tres entornos de ejecución (OpenVDN, SelfLift y Sigma), más variantes de posprocesado independiente para reescalado a 2K y 4K, junto con las imágenes de portada asociadas.

El contenido del repositorio hace referencia a pesos externos de MiniMax H3 (variantes híbridas fl2va/ref2va en int8, VAE de vídeo en int8 y VAE de audio en fp32), a un codificador de texto Qwen3-VL de 32B cuantizado en NVFP4/AWQ y a un modelo de superresolución SeedVR2 de 3B en fp8. Estos pesos no forman parte del repositorio: el tamaño declarado es de 0,0 GB, por lo que se trata exclusivamente de material de orquestación y configuración.

La relevancia de este repositorio es práctica: documenta con un nivel de detalle inusual la topología de conexiones de cada workflow (resolución del condicionador, número de frames, fps, cadena de posprocesado, interpolación temporal) y advierte explícitamente de discrepancias entre la prosa de los prompts y el cableado real de los nodos. Es material de referencia para quienes despliegan MiniMax H3 en ComfyUI, no un modelo descargable y ejecutable por sí mismo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene workflows de ComfyUI, no pesos de modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el modelo; los assets referenciados incluyen int8 (modelo híbrido y VAE de vídeo), fp32 (VAE de audio), NVFP4/AWQ (Qwen3-VL 32B) y fp8 e4m3fn (SeedVR2 3B) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene JSON de workflows y PNG de portada; los pesos referenciados son `.safetensors`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo MiniMax H3 a partir de los datos proporcionados. El repositorio no incluye model card técnica del modelo base, ni detalles de entrenamiento, número de tokens, composición del dataset o uso de RLHF/DPO.

Lo que sí documenta el repositorio es la arquitectura de los pipelines de inferencia. Los workflows seleccionan el compositor `OpenVDN/vdn-minimax-h3` con la etapa `stage_dmd_8nfe`, con `verify_hashes=false` y `allow_structural_base=true`. El plan de ejecución suministra modelo, sampler y sigmas; no se serializa un array numérico explícito de sigmas y el informe generado no se utiliza. La etiqueta DMD8 no garantiza el número real de evaluaciones de función (NFE) ejecutadas, y las comprobaciones de integridad del JSON no equivalen a verificación de hashes de los pesos.

El condicionador almacena 1344×768 píxeles y 124 frames sin enlaces externos de tamaño o tiempo, con ajustes AUTO/nativo. El nodo CreateVideo guarda a 24 fps y 8 bits; con 124 frames la duración nominal es de aproximadamente 5,167 segundos, que es una duración calculada, no una longitud de archivo observada. La interpolación solicita 2x con movimiento automático, umbral 0,24 y conservación de audio: se trata de interpolación temporal, no de escalado espacial. El audio de salida es audio generado y decodificado, no un passthrough de la fuente.

## Capacidades

- Generación de vídeo a partir de imagen: los presets conectan la imagen 15 al socket `first_frame` y la imagen 56 a `last_frame`, no a sockets genéricos de imagen de referencia.
- Generación de audio asociado al vídeo: el pipeline incluye un VAE de audio en fp32 y decodifica audio generado.
- Condicionamiento por texto: el pipeline referencia un codificador Qwen3-VL de 32B cuantizado en NVFP4/AWQ.
- Posprocesado de superresolución: variantes con SeedVR2 (objetivo 1440) y reescalado posterior a 2560×1440 o 3840×2160 con filtro Lanczos, `keep_proportion=resize`, `divisible_by2` y ejecución en CPU.
- Interpolación temporal de fotogramas: solicitud 2x con detección automática de movimiento y umbral 0,24, conservando el audio.
- Salida de vídeo con formato y códec automáticos mediante el nodo SaveVideo.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso; son capacidades ajenas al propósito de estos workflows.

## Casos de uso

- Generación de clips cortos con audio sincronizado: los presets producen 124 frames a 24 fps (unos 5,167 segundos nominales) con pista de audio generada, adecuado para piezas breves de redes sociales o prototipos de storyboard.
- Interpolación de imagen inicial y final: el cableado explícito de `first_frame` y `last_frame` permite controlar la transición entre dos imágenes concretas, útil para animación de keyframes y pruebas de continuidad visual.
- Escalado a 2K para revisión de cliente: la variante 02 aplica SeedVR2 con objetivo 1440 y reescalado a 2560×1440, pensada para entregas de resolución media sin reentrenar el pipeline.
- Escalado a 4K para masterización: la variante 03 encadena SeedVR2 con objetivo 2160 y reescalado a 3840×2160, orientada a material que requiere resolución UHD antes de montaje final.
- Duplicación de cadencia a 48 fps: la interpolación 2x con umbral 0,24 permite generar una versión de mayor fluidez temporal conservando el audio original, útil para presentaciones o inserts en proyectos a 48 fps.
- Automatización por lotes en ComfyUI: al ser workflows JSON con parámetros explícitos, se pueden versionar en git, parametrizar y lanzar desde scripts de orquestación para producir variantes de forma reproducible.
- Referencia técnica para integración: las advertencias del autor sobre discrepancias entre la prosa de los prompts y el cableado real sirven como guía de auditoría al integrar MiniMax H3 en pipelines propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de calidad, FVD, CLIP score, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio no declara requisitos de memoria.
- Los assets referenciados imponen un consumo elevado: un codificador Qwen3-VL de 32B en NVFP4/AWQ, un modelo híbrido MiniMax H3 en int8, dos VAE (vídeo int8 y audio fp32) y, en las variantes de posprocesado, SeedVR2 de 3B en fp8.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño de los componentes citados, el despliegue no es viable en GPUs de consumo con poca VRAM, pero no se aportan cifras concretas.
- Opciones de despliegue: ComfyUI, dado que todos los artefactos son workflows JSON para ese entorno. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor advierte que las etiquetas DMD8 no prueban el NFE ejecutado y que los diagnósticos de reescalado en caché no constituyen evidencia de render.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento, parámetros ni licencia del modelo base MiniMax H3, ni referencias a modelos alternativos de generación de vídeo con audio que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El repositorio no contiene pesos: es un conjunto de workflows y portadas. No es ejecutable sin descargar por separado los assets referenciados.
- No se declara licencia, ni idiomas, ni pipeline. El uso comercial queda sin marco legal explícito en esta ficha.
- El autor advierte de que la prosa de los prompts puede hablar de "referencias" cuando el cableado real conecta `first_frame` y `last_frame`; hay que inspeccionar los roles reales sin asumir fidelidad de los extremos.
- `verify_hashes=false` y `allow_structural_base=true` están activados: no hay verificación criptográfica de los pesos.
- La etiqueta DMD8 no demuestra el NFE realmente ejecutado; el número de pasos debe medirse, no inferirse de la etiqueta.
- Las comprobaciones de integridad del JSON no equivalen a verificación de hashes de los pesos del modelo.
- Los objetivos 1440, 2160, 2560×1440 y 3840×2160 son objetivos de posdecodificación, no dimensiones nativas de generación ni resultados medidos.
- La duración de 5,167 segundos es nominal (124 frames a 24 fps), no una longitud de archivo observada.
- La interpolación 2x y los 48 fps son intención configurada, no cadencia, número de frames ni duración medidos.
- Los prefijos de guardado con apariencia 4K en variantes conmutadas (bypassed) no alteran el pipeline de la variante activa; no se debe tomar prestada la cadena de procesado de una variante mayor.
- Solo el ejemplo principal está habilitado en cada workflow; dos ejemplos adicionales completos y sus guardados están conmutados.
- No se documentan sesgos, riesgo de alucinación ni limitaciones idiomáticas del modelo base.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/AI-KSK/minimax-h3-ultra-hd-routes-304
- Workflow 01 (OpenVDN, preset 768P): `workflows/02_MiniMax+H3｜OpenVDN+DMD8｜通用生视频+768P.json`
- Workflow 02 (OpenVDN, posprocesado 2K): `workflows/MiniMax+H3｜OpenVDN+DMD8｜通用生视频+2K.json`
- Workflow 03 (OpenVDN, posprocesado 4K): `workflows/MiniMax+H3｜OpenVDN+DMD8｜通用生视频+4K.json`
- Assets referenciados: `qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors`, `minimax_h3_hybrid_fl2va_ref2va_b25-49-int8.safetensors`, `minimax_h3_video_vae_int8_convrot.safetensors`, `minimax_h3_audio_vae_fp32.safetensors`, `seedvr2_ema_3b_fp8_e4m3fn.safetensors`
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código ni demos adicionales.
