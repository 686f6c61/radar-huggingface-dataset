# BurnyCoder/gphyt-attnres-block

## Resumen

GPhyT-S con Block Attention Residuals es un modelo de simulación física desarrollado por Libor Burian (publicado bajo el usuario BurnyCoder) que investiga el uso de residuales de atención por bloques sobre la arquitectura General Physics Transformer (GPhyT). No es un modelo de lenguaje: es un surrogate neuronal entrenado desde cero para predecir la evolución temporal de campos físicos bidimensionales, concretamente flujo radiativo y convección, a partir de trayectorias de simulación de The Well. El checkpoint publicado corresponde al modo `block` del estudio y se distribuye como material de investigación reproducible.

La arquitectura emplea doce capas transformer de anchura 192, MLP de 768 y tres cabezas de atención, con una ventana de cuatro fotogramas de contexto sobre campos de 128x64 píxeles y cinco canales canónicos. La innovación central es la sustitución de las conexiones residuales aditivas originales de GPhyT por residuales de atención por bloques, apoyadas en operadores de Flash Linear Attention (FLA). El entrenamiento se realizó con AdamW, BF16 autocast, batch efectivo de 16 y 3175 actualizaciones fijas, emparejando seeds y ejemplos con la línea base sin residuales de atención.

El modelo es relevante porque documenta de forma explícita y medible una mejora relativa del 26,38 % en NMSE medio a 12 pasos frente a GPhyT sin Attention Residuals (0,28917 frente a 0,39277) en el conjunto de test completo de flujo radiativo, al tiempo que reconoce fallos absolutos: todas las variantes entrenadas pierden frente a persistencia en convección y las predicciones radiativas presentan con frecuencia densidad negativa. Se trata, por tanto, de un artefacto de investigación con resultados descriptivos, no de un solver numérico validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con residuales de atención por bloques (Block Attention Residuals) sobre GPhyT, 12 capas, anchura 192, MLP 768, 3 cabezas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4 fotogramas de contexto sobre campos de 128x64 con 5 canales canónicos |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente BF16/FP32) |
| Idiomas soportados | no aplica (modelo de simulación física, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors (`seedN/model.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un transformer de 12 capas con anchura 192, MLP de 768 y 3 cabezas de self-attention, que opera sobre tensores de 128x64 con 5 canales canónicos y una ventana de 4 fotogramas de contexto. La modificación respecto a GPhyT original consiste en reemplazar las conexiones residuales aditivas por residuales de atención por bloques (modo `block`), implementadas mediante operadores de Flash Linear Attention (FLA). Las sumas crudas del modo Block se acumulan en el stream residual en FP32, mientras que el entrenamiento usó BF16 autocast; el autor documenta en una auditoría de arquitectura que ciertas contracciones de routing de FLA heredan autocast pese a casts explícitos a FP32.

El entrenamiento se realizó desde cero sobre el subconjunto preregistrado de The Well (arXiv:2412.00568), con splits oficiales de trayectorias y normalización calculada solo sobre train. Se usaron AdamW, un schedule de learning rate fijo compartido con la línea base, batch efectivo de 16, BF16 autocast y 3175 actualizaciones fijas. El estudio empareja seeds (0–5 para Block y Standard; 3 seeds exploratorios para Full y Uniform Block) con inicialización de backbone compartida y ejemplos de entrenamiento idénticos, de modo que la comparación es de procedimiento y número de actualizaciones, no de tiempo de GPU. Se incluyen además controles post-hoc de solo inicialización (cero actualizaciones de optimizador) reconstruidos a partir del constructor y las seeds originales.

## Capacidades

- Predicción autoregresiva de campos físicos 2D: genera pasos futuros de flujo radiativo y convección a partir de 4 fotogramas de contexto.
- Evaluación multi-paso: los ficheros `evaluation.json` reportan errores medidos a 1, 12 y 24 pasos.
- Soporte de enmascaramiento de canales: los canales ausentes deben permanecer a cero y excluirse de métricas y del feedback autoregresivo.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step en el sentido de los LLM.
- No tiene capacidades multilingües ni de visión genérica; los "canales" son variables físicas (incluida buoyancy, que el autor aclara explícitamente que no es temperatura).
- Modo de estudio `block`; el repositorio incluye también variantes Standard, Full y Uniform Block como comparadores.

## Casos de uso

- Investigación reproducible sobre residuales de atención: el checkpoint permite replicar el estudio pareado cargando `make_model(config, residual_mode, seed)` y los pesos safetensors, comparando Block frente a Standard con seeds emparejados y ejemplos idénticos.
- Estudio de surrogate models para flujo radiativo: sirve como referencia de hasta dónde llega un transformer de 12 capas y anchura 192 en NMSE a 12 pasos (0,28917) frente a persistencia (0,41901) y a GPhyT sin Attention Residuals (0,39277).
- Análisis de fallos en simulación neuronal: el modelo documenta densidad negativa frecuente en predicciones radiativas, lo que lo hace útil para estudiar modos de fallo de surrogates físicos y diseñar métricas de validez física.
- Benchmark de operadores FLA en dominios científicos: permite medir el impacto de residuales de atención implementados con Flash Linear Attention en lugar de residuales aditivos, con procedimiento de entrenamiento controlado.
- Docencia y divulgación sobre evaluación rigurosa: el repositorio incluye auditorías de datos, arquitectura e interpretación con tamaños de efecto e incertidumbre, útil como ejemplo de reporte honesto de resultados descriptivos.
- Control negativo en pipelines de surrogate physics: al perder frente a persistencia en convección bajo la métrica fija, puede emplearse como baseline que un modelo nuevo debe superar antes de considerarse útil.

## Benchmarks y rendimiento

Resultados publicados en la model card para el conjunto de test completo de flujo radiativo, NMSE medio a 12 pasos:

| Modelo | NMSE medio 12 pasos | Diferencia vs Block |
|---|---|---|
| GPhyT + Block Attention Residuals | 0,28917 | — |
| GPhyT sin Attention Residuals (Standard) | 0,39277 | +26,38 % |
| Persistencia | 0,41901 | +30,99 % |

El autor advierte que se trata de un ranking descriptivo de medias, no de una victoria en cada seed: Standard/Block usan seis seeds y Full/Uniform tres, y los controles de solo inicialización son post-hoc. El test preregistrado de dos datasets queda separado y no establece significación frente a todos los comparadores. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni benchmarks de lenguaje, por no ser aplicables a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio pesa 0,4 GB, lo que sugiere que el checkpoint completo cabe holgadamente en GPUs de consumo, pero no se especifica el desglose por seed ni la precisión de almacenamiento.
- GPU recomendadas: no disponible. El entrenamiento usó BF16 autocast, por lo que se requieren GPUs con soporte BF16 (Ampere o superior) para reproducir el pipeline.
- Cabe en GPU de consumo: probablemente sí dado el tamaño del repo (0,4 GB), pero no confirmado por el autor.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI; el uso previsto es cargar pesos con `safetensors.torch.load_file` dentro del repositorio de estudio (`uv sync --locked`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | NMSE 12 pasos (radiativo) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GPhyT + Block Attention Residuals (este) | 12 capas, ancho 192, MLP 768 | 4 fotogramas | 0,28917 | MIT | HuggingFace |
| GPhyT sin Attention Residuals (Standard) | misma backbone | 4 fotogramas | 0,39277 | MIT | HuggingFace |
| Persistencia (baseline trivial) | 0 | 1 fotograma | 0,41901 | no aplica | no aplica |
| GPhyT original (paper arXiv:2509.13805) | no disponible | no disponible | no disponible | MIT | GitHub oficial |

No se dispone de comparación con otros surrogates físicos (por ejemplo, modelos tipo FNO o Neural Operator) en la información proporcionada.

## Limitaciones y advertencias

- No es un solver numérico ni un predictor validado para física no vista; el autor lo describe como surrogate de investigación.
- Resolución espacial gruesa (128x64) y presupuesto computacional local acotado.
- Solo seis pares de seeds primarios, lo que limita la inferencia estadística; el ranking es descriptivo y no significativo frente a todos los comparadores.
- Todas las variantes entrenadas pierden frente a persistencia en convección bajo la métrica fija.
- Las predicciones radiativas presentan con frecuencia densidad negativa, un fallo físico absoluto documentado.
- Buoyancy es un canal separado y no debe interpretarse como temperatura.
- Las trayectorias held-out comparten su primer fotograma con entrenamiento en otro ajuste de parámetros físicos; la evaluación con split oficial no demuestra generalización a condiciones iniciales totalmente no vistas (ver `reports/data-preparation.md` y `reports/data_audit.json`).
- Los controles de solo inicialización se especificaron después de conocer los resultados entrenados y no modifican la comparación confirmatoria original; Block y Uniform inicializados son idénticos por seed y no cuentan como evidencia independiente.
- Los canales ausentes deben enmascararse en métricas y feedback autoregresivo; ignorarlo invalida la evaluación.
- Licencia MIT permite uso comercial del código y pesos, pero el modelo no está validado para producción en ningún dominio físico.

## Enlaces

- HuggingFace: https://huggingface.co/BurnyCoder/gphyt-attnres-block
- Línea base sin Attention Residuals: https://huggingface.co/BurnyCoder/gphyt-attnres-standard
- Repositorio del estudio: https://github.com/BurnyCoder/general-physics-attention-residuals-transformer
- Interpretación medida: https://github.com/BurnyCoder/general-physics-attention-residuals-transformer/blob/main/reports/interpretation.md
- Auditoría de arquitectura: https://github.com/BurnyCoder/general-physics-attention-residuals-transformer/blob/main/reports/architecture-audit.md
- Preparación de datos: https://github.com/BurnyCoder/general-physics-attention-residuals-transformer/blob/main/reports/data-preparation.md
- Auditoría de datos: https://github.com/BurnyCoder/general-physics-attention-residuals-transformer/blob/main/reports/data_audit.json
- Resumen de controles sin entrenamiento: https://github.com/BurnyCoder/general-physics-attention-residuals-transformer/blob/main/reports/untrained/summary.md
- Paper GPhyT: https://arxiv.org/abs/2509.13805
- Código oficial GPhyT: https://github.com/FloWsnr/General-Physics-Transformer
- Paper Attention Residuals: https://arxiv.org/abs/2603.15031
- Operador FLA: https://github.com/fla-org/flash-linear-attention
- Dataset The Well: https://arxiv.org/abs/2412.00568
