# jfar-z/MiniMax-H3-FL2VA-Ref2VA-Hybrid-NVFP4

## Resumen

Este repositorio contiene un checkpoint híbrido experimental en formato NVFP4 de un solo archivo para MiniMax H3, publicado por el usuario jfar-z. El modelo no es un entrenamiento nuevo: es un merge selectivo de tensores que parte de la variante FL2VA (first-frame/last-frame a vídeo+audio) y le injerta la ruta de condicionamiento por referencia Ref2VA, replicando la estrategia de selección de tensores publicada en el repositorio `smhfacct/Minimax-H3-fl2va-ref2va-hybrid-models`, pero en almacenamiento NVFP4 en lugar de INT8.

La variante inicial es `b25-49`, que afecta a los bloques transformer 25 a 49 (rango cero-based, inclusivo). El único cambio respecto al base son 50 tensores de proyección AdaLN (`blocks.25-49.adaln_proj.linear.weight` y `.bias`) procedentes de Ref2VA; los 1.082 tensores restantes, incluidos los 200 conjuntos de capas NVFP4 y sus 800 tensores empaquetados de pesos, escalas y metadatos `comfy_quant`, permanecen idénticos a FL2VA.

Su relevancia es acotada pero concreta: es el primer checkpoint disponible públicamente que traslada el comportamiento del híbrido INT8 de smhfacct al formato NVFP4, validado manualmente en ComfyUI tanto en flujos FL2VA como Ref2VA con salida de vídeo y audio. No obstante, el propio autor advierte que no reclama mejora de calidad ni equivalencia con el híbrido INT8 hasta que se publiquen comparativas A/B controladas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para generacion de video y audio (MiniMax H3); al menos 50 bloques transformer (rangos 0-49), con token refiner, proyecciones AdaLN y cabeceras de salida |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits en coma flotante) en 200 capas; tensores AdaLN, embeddings, normalizaciones y cabeceras en FP16 sin cuantizar; el text encoder companion usa NVFP4 AWQ |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (`license: other`) |
| Formato de pesos | safetensors, archivo unico (`minimax_h3_hybrid_fl2va_ref2va_b25-49_nvfp4.safetensors`, 12.528.636.800 bytes) |
| Tamano del repositorio | 12,5 GB |
| SHA256 del checkpoint | `ddd194e1675d53e51f96c3e0c9cda75b0108ad2b62a035eab9be06214236e7d7` |
| Pipeline declarado | image-to-video |
| Libreria | minimax-h3 |

## Arquitectura y entrenamiento

MiniMax H3 es un modelo de difusion para generacion conjunta de video y audio, con un text encoder basado en Qwen3-VL de 32B y dos VAEs separados (uno de video en FP16 y otro de audio en FP32). El checkpoint aqui descrito no modifica esa arquitectura: opera sobre los pesos. El merge toma `minimax_h3_fl2va_pruned_nvfp4.safetensors` como base y copia desde `minimax_h3_ref2va_pruned_nvfp4.safetensors` exactamente 50 tensores FP16 correspondientes a las proyecciones AdaLN de los bloques 25 a 49, lo que supone 43.545.600 bytes reemplazados sobre un total de 1.132 tensores de salida.

El procedimiento se ejecuto sin interpolacion, sin dequantizacion, sin requantizacion, sin fine-tuning y sin rebase de curvas. Se conservan del base FL2VA la tabla `adaln_t_table`, las proyecciones AdaLN de los bloques 0-24, el AdaLN de la capa final, las cabeceras de salida, todos los tensores de atencion, MLP, normalizacion, embedding y token refiner, y los 200 conjuntos de capas NVFP4 con sus 800 tensores de pesos empaquetados, escalas y `comfy_quant`. Los 332 tensores no cuantizados coinciden con los equivalentes del hibrido INT8 de smhfacct.

La verificacion publicada el 10 de septiembre de 2026 incluye la comprobacion de los cinco hashes de origen contra revisiones fijas de Hugging Face, la validacion de claves, formas, dtypes y contratos de capa NVFP4, la reapertura correcta del archivo con el lector estandar de safetensors, la coincidencia de los 1.132 hashes de tensores de salida con su origen previsto y la deteccion automatica del archivo por parte de ComfyUI como MiniMax H3 con cuantizacion de precision mixta. No se describe ningun proceso de entrenamiento adicional.

## Capacidades

- Generacion de video a partir de imagenes: el pipeline declarado es image-to-video, con flujo validado de primer y ultimo fotograma (FL2VA).
- Generacion de audio conjunta con el video: las dos rutas validadas (FL2VA y Ref2VA) produjeron salida de video con audio.
- Condicionamiento por referencia (Ref2VA): la ruta Ref2VA permite usar imagenes de referencia para condicionar la generacion, segun la validacion manual del autor.
- Cuantizacion NVFP4 nativa: carga y muestreo en ComfyUI con soporte de precision mixta, manteniendo los tensores sensibles en FP16.
- Integracion con ComfyUI: se carga mediante el nodo estandar Load Diffusion Model / UNETLoader con `weight_dtype` en `default`.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, thinking mode, vision general ni soporte multilingue, dado que se trata de un modelo de difusion y no de un modelo de lenguaje.

## Casos de uso

- Produccion de video corto a partir de fotogramas clave: dado que el flujo FL2VA acepta primer y ultimo fotograma, encaja en pipelines de interpolacion creativa donde se fija el encuadre inicial y final y el modelo rellena la transicion con audio sincronizado.
- Demos de animacion de imagen fija con banda sonora: el modelo genera audio junto al video, lo que evita encadenar un modelo de Foley o TTS aparte en prototipos rapidos dentro de ComfyUI.
- Prototipado de condicionamiento por referencia: la ruta Ref2VA permite explorar variaciones de un sujeto u objeto a partir de imagenes de referencia, util en previsualizacion de storyboards.
- Evaluacion comparativa de formatos de cuantizacion: el checkpoint esta pensado explicitamente para contrastarse con el hibrido INT8 equivalente, por lo que sirve como objeto de estudio en trabajos sobre NVFP4 frente a INT8 en difusion de video.
- Despliegue local en estaciones Blackwell: para estudios con una GPU RTX PRO 6000 Blackwell o similar, permite ejecutar generacion de video con audio sin depender de endpoints en la nube.
- Investigacion sobre tecnicas de merge de tensores: el caso documenta una seleccion quirurgica de 50 tensores AdaLN, lo que resulta util como referencia metodologica reproducible en trabajos de model merging.
- Integracion en nodos personalizados de ComfyUI: al cargarse con el cargador estandar, se puede insertar en grafos existentes de MiniMax H3 para probar variantes de sampler o LoRA compatibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que las comparativas A/B controladas contra los modelos base NVFP4 y contra el hibrido INT8 original estan pendientes. La validacion existente es estructural (hashes, contratos de tensores, reapertura del archivo) y funcional (carga y muestreo en ComfyUI con salida de video y audio), no comparativa de calidad.

## Requisitos de hardware

- VRAM estimada para el checkpoint de difusion: 12,5 GB solo para los pesos, segun el tamano declarado del archivo.
- VRAM adicional para el text encoder: el companion indicado es `qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors`; como referencia orientativa, un modelo de 32B en NVFP4 AWQ ocupa del orden de 17-19 GB, aunque el autor no publica la cifra exacta.
- VRAM adicional para los VAEs: `minimax_h3_video_vae_fp16.safetensors` y `minimax_h3_audio_vae_fp32.safetensors`; no se publican tamanos concretos.
- Estimacion de pico en carga completa: en torno a 30-32 GB de pesos, mas las activaciones y buffers de decodificacion de video. Se recomienda por tanto un margen de 40-48 GB o superior.
- GPUs recomendadas: NVIDIA Blackwell (B100, B200, RTX PRO 6000 Blackwell, RTX 5090) para aprovechar NVFP4 nativo. En generaciones anteriores (A100, H100, RTX 4090) el NVFP4 no esta soportado de forma nativa y requiere rutas emuladas, cuyo comportamiento y rendimiento el autor advierte que pueden diferir.
- Cabe en GPU de consumo: si, en principio, en RTX 5090 (32 GB) ajustando el reparto con el text encoder; en RTX 4090 o RTX 3090 (24 GB) seria necesario descargar componentes a CPU o usar cuantizaciones adicionales, y no habria soporte NVFP4 nativo.
- Opciones de despliegue: ComfyUI con una build reciente que incluya soporte nativo de MiniMax H3 y NVFP4 (ruta validada por el autor). No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni Diffusers, y en el caso de llama.cpp u Ollama no son aplicables al tratarse de un modelo de difusion de video.
- Ubicacion del archivo en ComfyUI: `ComfyUI/models/diffusion_models/`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| jfar-z/MiniMax-H3-FL2VA-Ref2VA-Hybrid-NVFP4 (b25-49) | no disponible | NVFP4 + FP16 | no aplica | Validado en ComfyUI (video y audio); sin A/B | MiniMax H3 Community License | Publico en Hugging Face, 0 descargas |
| MiniMaxAI/MiniMax-H3 (original) | no disponible | Pesos originales | no aplica | Modelo de referencia | MiniMax H3 Community License | Publico en Hugging Face |
| lilcheaty/MiniMax-H3-NVFP4 (FL2VA pruned) | no disponible | NVFP4 | no aplica | Base del merge | Derivada de MiniMax H3 | Publico en Hugging Face |
| lilcheaty/MiniMax-H3-NVFP4 (Ref2VA pruned) | no disponible | NVFP4 | no aplica | Aporta los 50 tensores AdaLN | Derivada de MiniMax H3 | Publico en Hugging Face |
| smhfacct/Minimax-H3-fl2va-ref2va-hybrid-models (b25-49) | no disponible | INT8 | no aplica | Referencia de la estrategia de merge | Derivada de MiniMax H3 | Publico en Hugging Face |

Los datos de parametros, contexto y rendimiento comparado no estan disponibles en la informacion proporcionada para ninguno de los modelos de la tabla. La comparacion relevante en la documentacion es de formato (NVFP4 frente a INT8) y de composicion de tensores, no de metricas de calidad.

## Limitaciones y advertencias

- Es un merge experimental de seleccion de tensores, no un modelo entrenado; no cabe esperar capacidades nuevas respecto a los checkpoints de origen.
- FL2VA y Ref2VA usan tablas AdaLN de timestep distintas. Este checkpoint conserva deliberadamente la tabla de FL2VA y trasplanta las proyecciones de Ref2VA sin rebase de curvas, lo que replica el comportamiento del hibrido de smhfacct pero puede no ser optimo para todos los flujos.
- La inferencia en NVFP4 y en INT8 no produce trayectorias identicas a nivel de pixel, por lo que las comparaciones visuales directas entre ambos formatos no son concluyentes por si solas.
- No se reclama mejora de calidad, mayor adherencia a la referencia ni equivalencia con el hibrido INT8 hasta que existan pruebas A/B controladas, que siguen pendientes.
- NVFP4 esta pensado principalmente para GPUs NVIDIA Blackwell; el comportamiento en rutas emuladas puede diferir tanto en resultados como en rendimiento.
- La licencia es MiniMax H3 Community License Agreement, con restricciones geograficas (territorio aplicable), restricciones de uso y una politica de uso aceptable. Hay que revisar el texto completo antes de cualquier uso comercial; el extracto disponible esta truncado.
- No se dispone de informacion sobre sesgos, tasas de alucinacion, limitaciones idiomaticas ni idiomas soportados; al ser un modelo de difusion de video, estos riesgos se manifiestan en forma de artefactos visuales, incoherencias temporales o audio mal sincronizado, no evaluados en la documentacion.
- El repositorio registra 0 descargas y 0 likes, y la validacion es unicamente manual por parte del autor; no hay validacion independiente publicada.
- Los hashes de los checkpoints de origen estan fijados a revisiones concretas; cambios en los repositorios upstream invalidarian la cadena de trazabilidad documentada.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre MiniMax H3; los unicos enlaces utiles son los citados en la propia model card.

## Enlaces

- Repositorio del modelo: https://huggingface.co/jfar-z/MiniMax-H3-FL2VA-Ref2VA-Hybrid-NVFP4
- Modelo base original: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia (MiniMax H3 Community License Agreement): https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Checkpoints NVFP4 de origen (FL2VA y Ref2VA): https://huggingface.co/lilcheaty/MiniMax-H3-NVFP4
- Referencia de la estrategia de merge (hibrido INT8, variante b25-49): https://huggingface.co/smhfacct/Minimax-H3-fl2va-ref2va-hybrid-models
- Informe estructural legible por maquina incluido en el repositorio: `verification.json`
- Resultados de busqueda web: no se han encontrado fuentes relevantes adicionales (papers, blogs, repos o demos) en la busqueda proporcionada.
