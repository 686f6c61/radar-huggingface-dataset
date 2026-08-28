# brandonmusic/GLM-5.3-Flash-tr3-4bpw

## Resumen

GLM-5.3-Flash-tr3-4bpw es una cuantización EXL3 de 4 bits del modelo base GLM-5.3-Flash-BF16, desarrollada por el usuario brandonmusic en HuggingFace. El modelo base, creado por zai-org, pertenece a la familia GLM y presenta una arquitectura de mezcla de expertos (MoE) con 288 expertos enrutados, atención MLA (Multi-head Latent Attention) y soporte multimodal (imagen y texto). Esta versión cuantizada está optimizada específicamente para GPUs Blackwell SM120 (como la RTX PRO 6000 Workstation) y ofrece un runtime personalizado con soporte para decodificación especulativa MTP3 y caché KV en FP8 o NVFP4.

El modelo destaca por su alto rendimiento en prefill (más de 6.000 tokens por segundo en contextos de hasta 64K) y una decodificación sostenida de aproximadamente 145 tokens por segundo en una sola petición, con soporte de contexto de hasta 131.072 tokens. Su relevancia radica en que permite ejecutar un modelo de 87.800 millones de parámetros con cuantización agresiva en hardware de doble GPU, manteniendo una fidelidad razonable respecto al modelo BF16 original, medida mediante KLD (divergencia Kullback-Leibler) sobre la caché KV.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 288 expertos enrutados, atención MLA (Multi-head Latent Attention) |
| Parametros totales | 87.811.157.118 |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (128K) |
| Tipos de cuantizacion | EXL3 4bpw (uniform K4), caché KV en FP8 o NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (tambien disponible runtime Docker) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint BF16 de GLM-5.3-Flash, que emplea una arquitectura de mezcla de expertos con 288 expertos enrutados a nivel global. La cuantización EXL3 utiliza expertos uniformes K4 y organiza los expertos en "slabs" de 144 por rango (E144) dentro de un espacio de rutas global E288. La atención es de tipo MLA (Multi-head Latent Attention), con caché KV cuantizada en FP8 (perfil por defecto) o NVFP4 (perfil de contexto largo). El runtime incorpora decodificación especulativa MTP3 (multi-token prediction con 3 tokens), DCP2 (data compression) y kernels de registro/SMEM con route-128.

No se dispone de información sobre el entrenamiento del modelo base (datos, tokens, método de alineación). Esta versión es un trabajo de cuantización y optimización de inferencia, no un entrenamiento desde cero. El runtime requiere Transformers 5.16.1 y ExLlamaV3 con un commit específico (c5d9c657966ffeeaa9353f0cc899f18629da4a13) y su extensión CUDA compilada.

## Capacidades

- Generación de texto conversacional y de larga duración con contexto de hasta 128K tokens.
- Entrada multimodal (imagen y texto) segun el tag `image-text-to-text` del modelo base.
- Decodificacion especulativa MTP3 que acelera la generacion al predecir multiples tokens por paso.
- Caché KV cuantizada en FP8 o NVFP4, con perfiles configurables para priorizar precision o capacidad de contexto.
- Compatible con vLLM (version modificada) y Transformers, con endpoints compatibles con la API de OpenAI.
- Soporte de concurrencia: hasta 16 peticiones simultaneas con degradacion controlada segun el contexto.

## Casos de uso

- Inferencia de alto rendimiento en produccion: el modelo esta disenado para servir peticiones con baja latencia en GPUs Blackwell SM120, alcanzando 5.748 tokens/s de prefill a 8K y 141-148 tokens/s de decode en una sola peticion.
- Procesamiento de documentos largos: con 131.072 tokens de contexto, puede analizar libros, informes tecnicos o codigo fuente extenso en una sola pasada, manteniendo un prefill de 4.577 tokens/s a 127K.
- Despliegue en entornos con doble GPU: el runtime TP2/EP2 esta optimizado para dos RTX PRO 6000 (96 GB cada una), permitiendo ejecutar el modelo completo sin particionado adicional.
- Aplicaciones multimodales: al heredar la capacidad de entrada de imagen y texto del modelo base, puede procesar capturas de pantalla, diagramas o documentos escaneados junto con texto.
- Chatbots y asistentes conversacionales: su generacion fluida y soporte de contexto largo lo hacen adecuado para sistemas de dialogo multi-turno con historial extenso.
- Evaluacion de calidad de cuantizacion: los benchmarks de KLD incluidos permiten validar la fidelidad de la cuantizacion frente al modelo BF16, util para equipos que necesitan garantizar la precision en dominios sensibles.

## Benchmarks y rendimiento

Los datos de rendimiento fueron medidos por el autor en el runtime v75 con dos RTX PRO 6000 Blackwell (SM120, 96 GB cada una), TP2/EP2, DCP2, CUDA graphs, MTP3 probabilistico y prefix caching desactivado.

**Prefill en frio (standalone)**

| Contexto | Tokens reales | TTFT | Prefill tok/s | Muestras |
|---:|---:|---:|---:|---:|
| 8K | 8.201 | 1,427 s | 5.748 | 7 |
| 16K | 16.230 | 2,598 s | 6.246 | 4 |
| 32K | 32.323 | 5,172 s | 6.250 | 2 |
| 64K | 64.515 | 10,366 s | 6.224 | 1 |
| 127K | 127.888 | 27,944 s | 4.577 | 1 |

**Decode sostenido (C1, una peticion)**

| Contexto | C1 tok/s | Aceptacion MTP |
|---:|---:|---:|
| 0 | 141,94 | 57,06% |
| 16K | 147,46 | 61,49% |
| 32K | 143,49 | 29,89% |
| 64K | 146,29 | 48,85% |
| 124K | 148,35 | 55,93% |

**Matriz de concurrencia (tok/s totales)**

| Contexto | C1 | C2 | C4 | C8 | C16 |
|---:|---:|---:|---:|---:|---:|
| 0 | 146,7 | 258,2 | 393,9 | 564,8 (7/8)* | 563,1 (7/16)* |
| 16K | 143,1 | 260,3 | 395,0 | 315,3 (6/8)* | 360,9 (6/16)* |
| 32K | 144,6 | 242,4 | 385,6 | 481,7 (6/8)* | 445,1 (6/16)* |
| 64K | 143,2 | 238,5 | 379,2 | 17,1 (5/8)* | 26,5 (5/16)* |

Nota: `(X/Y)` indica peticiones medias en ejecucion frente a la concurrencia solicitada. `*` significa celdas infradimensionadas, en cola o con timeout de admision; no son prueba de agotamiento de KV. Las filas de 64K con C8/C16 estuvieron limitadas termicamente o por capacidad.

**KLD de la caché KV (media de cinco ejecuciones, ventana de 2.048 tokens)**

| Caché KV | KLD medio | Desviacion estandar | Acuerdo top-1 | Gate |
|---|---|---|---|---|
| FP8 | 0,024610591221 | 0,000256852524 | 0,937274059599 | pass |
| NVFP4 calibrado power-of-two | 0,054757372223 | 0,000000000000 | 0,914997557401 | pass |

## Requisitos de hardware

- Dos GPUs RTX PRO 6000 Blackwell Workstation Edition (SM120, 96 GB cada una) para el runtime recomendado, con tensor parallel 2 (TP2) y expert parallel 2 (EP2).
- VRAM total necesaria: 192 GB (2 x 96 GB). El modelo cuantizado ocupa aproximadamente 175,7 GB en disco, por lo que cabe en la memoria combinada.
- No es compatible con GPUs de generaciones anteriores (Ampere, Ada) ni con vLLM estandar; requiere el runtime Docker personalizado o el script de servicio incluido en el repositorio.
- Opciones de despliegue: Docker Compose (imagen `verdictai/glm53-flash-exl3-k4:r19-sm120-tp2-v75`) o script `serve-glm53-sm120-tp2.sh`. El servicio escucha en el puerto 8012 por defecto.
- Perfiles configurables: `PROFILE=long500k` para contexto de 499.968 tokens con NVFP4, `DCP=1` para activar DCP2, `MTP_TOKENS=0 ENFORCE_EAGER=1` para desactivar MTP y forzar ejecucion eager.
- Latencia y throughput: prefill de 5.748-6.250 tok/s (8K-64K), decode de 141-148 tok/s en una peticion, hasta 564 tok/s con concurrencia 8 a contexto 0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Hardware requerido | Licencia |
|---|---|---|---|---|---|
| GLM-5.3-Flash-tr3-4bpw (este) | 87,8B | 131.072 | EXL3 4bpw + FP8/NVFP4 KV | 2x RTX PRO 6000 (SM120) | no disponible |
| GLM-5.2-EXL3-TR3v4-3.5bpw-MTP78 | no disponible | no disponible | EXL3 3.5bpw + MTP78 | no disponible | no disponible |
| GLM-5.3-Flash-BF16 (base) | 87,8B | 131.072 | BF16 | no disponible (probablemente multiples GPUs) | no disponible |

No se dispone de datos de benchmarks comparativos entre estos modelos. La comparativa se limita a caracteristicas generales. El modelo base BF16 no esta cuantizado y requiere mas VRAM, mientras que la version tr3-4bpw esta optimizada para un hardware muy especifico.

## Limitaciones y advertencias

- Requiere hardware muy especifico (GPUs Blackwell SM120) y un runtime propietario no compatible con vLLM estandar. No es portable a entornos con GPUs convencionales.
- La licencia no esta disponible, lo que impide conocer las restricciones de uso comercial o modificacion.
- No se han publicado datos sobre sesgos, alucinaciones o limitaciones idiomaticas del modelo base.
- La cuantizacion introduce una degradacion medible: KLD de 0,0246 (FP8) y 0,0548 (NVFP4) frente al teacher BF16, con un acuerdo top-1 de 93,7% y 91,5% respectivamente. En tareas de alta precision puede ser insuficiente.
- El perfil de contexto largo (500K) requiere NVFP4 y reduce la fidelidad; ademas, las celdas de alta concurrencia a 64K mostraron limitaciones termicas o de capacidad.
- No se garantiza la reproducibilidad de los benchmarks fuera del hardware y runtime exactos especificados (v75, dos RTX PRO 6000, DCP2, MTP3 probabilistico).
- El modelo no es compatible con Transformers estandar sin la version exacta (5.16.1) y el commit de ExLlamaV3 indicado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/brandonmusic/GLM-5.3-Flash-tr3-4bpw
- Repositorio GitHub (mismo README): https://github.com/brandonmmusic-max/glm-5.3-flash-exl3-4bpw
- Imagen Docker Hub: https://hub.docker.com/r/verdictai/glm53-flash-exl3-k4
- Documentacion de GLM-5.3-Flash en Unsloth: https://unsloth.ai/docs/models/glm-5.3
- Modelo relacionado (GLM-5.2-EXL3-TR3v4-3.5bpw-MTP78): https://huggingface.co/brandonmusic/GLM-5.2-EXL3-TR3v4-3.5bpw-MTP78
