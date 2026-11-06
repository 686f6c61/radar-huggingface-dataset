# BurnyCoder/gphyt-attnres-full

## Resumen

GPhyT-S con Attention Residuals completos es un modelo de simulación física entrenado desde cero por Libor Burian (cuenta BurnyCoder) sobre un subconjunto preregistrado del conjunto de datos The Well. No es un modelo de lenguaje: es un surrogate de simulación que predice la evolución espacio-temporal de campos físicos bidimensionales de 128x64 píxeles con cinco canales canónicos, usando cuatro fotogramas de contexto para generar trayectorias autoregresivas de hasta 24 pasos. Su interés radica en que evalúa experimentalmente una variante arquitectónica concreta, Block Attention Residuals, frente a la conexión residual aditiva original de GPhyT.

La arquitectura consta de doce capas transformer con anchura 192, MLP de anchura 768 y tres cabezas de atención. El repositorio (0,2 GB) contiene los checkpoints finales de actualización fija del estudio emparejado sobre Attention Residuals, en modo `full`, tras 3175 actualizaciones de entrenamiento. La relevancia actual es metodológica: el autor documenta de forma explícita las comparaciones, los controles post-hoc y las limitaciones del estudio, algo poco habitual en modelos de investigación de este tamaño.

El resultado principal del estudio es una reducción del 26,38 % en el NMSE medio a 12 pasos frente a GPhyT sin Attention Residuals (0,28917 frente a 0,39277) y del 30,99 % frente a la persistencia (0,41901) en el conjunto de test completo de flujo radiativo. El propio autor advierte que se trata de un ranking descriptivo de medias, no de una victoria en todas las semillas ni de significación estadística frente a todos los comparadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Block Attention Residuals (modo `full`), 12 capas, anchura 192, MLP 768, 3 cabezas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4 fotogramas de contexto (ventana temporal, no tokens de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, entrenamiento con BF16 autocast) |
| Idiomas soportados | no aplica (modelo de simulación física, no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors (`seedN/model.safetensors`) |
| Resolucion de campo | 128x64 |
| Canales | 5 canales canonicos |
| Pasos de entrenamiento | 3175 actualizaciones fijas |
| Tamano del repo | 0,2 GB |

## Arquitectura y entrenamiento

El modelo es un transformer de 12 capas con atención propia y anchura 192, MLP de anchura 768 y 3 cabezas. La innovación central es la sustitución de las conexiones residuales aditivas originales de GPhyT por Block Attention Residuals, con enrutamiento `full` (y variantes `uniform` y `standard` en el estudio). El entrenamiento se realizó desde cero sobre el subconjunto preregistrado de The Well, con divisiones oficiales de trayectorias y normalización calculada solo sobre el conjunto de entrenamiento. Se usó AdamW, un schedule de learning rate fijo, tamaño de batch efectivo de 16, autocast BF16 y un número fijo de actualizaciones (3175) idéntico entre variantes emparejadas.

El estudio compara seis semillas para las variantes Standard y Block, y tres semillas exploratorias para Full y Uniform. Los checkpoints de este repositorio corresponden al modo `full`. El autor documenta una auditoría de arquitectura en la que se aclara que las contracciones de enrutamiento FLA heredan el autocast BF16 pese a los casts explícitos a FP32, y que las sumas crudas de Block se acumulan en el stream residual FP32. También se incluyen controles de solo inicialización (sin actualizaciones de optimizador) especificados después de conocer los resultados entrenados, que no forman parte de la comparación confirmatoria original.

## Capacidades

- Predicción autoregresiva de campos físicos 2D de 128x64 con 5 canales, hasta 24 pasos hacia adelante.
- Simulación surrogate de flujo radiativo y convección sobre datos de The Well.
- Modelado de un canal de flotabilidad (buoyancy) separado, que no equivale a temperatura.
- Evaluación con métricas NMSE a 1, 12 y 24 pasos mediante el CLI del repositorio de estudio.
- Carga de pesos por semilla con `safetensors.torch.load_file` y construcción del modelo con `make_model(config, residual_mode, seed)`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso en lenguaje ni capacidades multilingües.
- No dispone de modo thinking, visión, audio ni generación de texto.

## Casos de uso

- Investigación sobre conexiones residuales: el modelo sirve para reproducir el estudio emparejado Block frente a Standard con semillas y ejemplos de entrenamiento idénticos, permitiendo analizar el efecto aislado del cambio arquitectónico.
- Simulación surrogate de flujo radiativo: se puede usar para generar predicciones a 12 y 24 pasos sobre el conjunto de test y comparar el NMSE con la persistencia y con GPhyT sin Attention Residuals.
- Estudio de estabilidad numérica: dado que las predicciones radiativas presentan con frecuencia densidad negativa, el modelo es útil para investigar fallos de plausibilidad física en surrogates y diseñar mecanismos de corrección.
- Reproducibilidad de experimentos: el repositorio incluye `runs.json`, `evaluation.json` por semilla y estadísticas de normalización, lo que permite replicar exactamente el procedimiento de inferencia y puntuación.
- Análisis de controles de inicialización: los checkpoints `untrained/seedN` permiten comparar el efecto del entrenamiento frente a la inicialización aleatoria en las mismas arquitecturas.
- Docencia y auditoría metodológica: el modelo y sus informes (`architecture-audit.md`, `interpretation.md`, `data-preparation.md`) sirven como ejemplo de estudio con preregistro, controles post-hoc declarados y análisis de solapamiento de datos.
- Evaluación de generalización limitada: útil para medir hasta qué punto el modelo generaliza cuando las trayectorias de test comparten el primer fotograma con el entrenamiento a otro parámetro físico.

## Benchmarks y rendimiento

Resultados del estudio sobre el conjunto de test completo de flujo radiativo (NMSE medio a 12 pasos):

| Modelo | NMSE medio 12 pasos | Diferencia relativa frente a Block |
|---|---|---|
| GPhyT + Block Attention Residuals (modo `full`) | 0,28917 | — |
| GPhyT sin Attention Residuals | 0,39277 | +26,38 % |
| Persistencia | 0,41901 | +30,99 % |

El autor indica que el ranking es descriptivo sobre medias y que no se establece significación estadística frente a todos los comparadores. En convección, todas las variantes entrenadas pierden frente a la persistencia bajo la métrica fija. Los errores a 1 y 24 pasos están disponibles en los `evaluation.json` por semilla del repositorio. No se han publicado resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) porque el modelo no es lingüístico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio pesa 0,2 GB y la arquitectura es pequeña (12 capas, anchura 192), por lo que cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: no especificadas por el autor; cualquier GPU con soporte BF16 y suficiente memoria para el modelo y los tensores de campo 128x64 es adecuada.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060, RTX 4090 y superiores, dado el reducido tamaño del checkpoint.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI; el procedimiento oficial es PyTorch con `uv sync --locked`, `make_model` y `safetensors.torch.load_file`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | NMSE 12 pasos (flujo radiativo) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GPhyT + Block Attention Residuals (este) | no disponible (12 capas, ancho 192) | 4 fotogramas | 0,28917 | MIT | Hugging Face |
| GPhyT sin Attention Residuals | misma base | 4 fotogramas | 0,39277 | MIT | Hugging Face |
| Persistencia (baseline trivial) | 0 | no aplica | 0,41901 | no aplica | no aplica |

No se dispone de comparación con otros surrogates de simulación física en la información proporcionada.

## Limitaciones y advertencias

- No es un solver numérico ni un predictor validado para física no vista; es un surrogate de investigación.
- La resolución espacial es gruesa (128x64) y el presupuesto computacional local está acotado.
- El estudio se limita a seis pares de semillas principales y tres semillas exploratorias para Full y Uniform.
- Todas las variantes entrenadas pierden frente a la persistencia en convección bajo la métrica fija.
- Las predicciones de flujo radiativo presentan con frecuencia densidad negativa, un fallo de plausibilidad física.
- El canal de flotabilidad es independiente y no debe interpretarse como temperatura.
- Las trayectorias de test comparten el primer fotograma con el entrenamiento a otro parámetro físico, por lo que la evaluación oficial no demuestra generalización a condiciones iniciales completamente nuevas.
- Los controles de solo inicialización se especificaron después de conocer los resultados y no forman parte de la comparación confirmatoria.
- La licencia MIT permite uso comercial, pero el modelo no está validado para producción ni para toma de decisiones físicas.
- No hay información sobre sesgos, idiomas ni alucinación en el sentido lingüístico, al no ser un modelo de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BurnyCoder/gphyt-attnres-full
- Baseline sin Attention Residuals: https://huggingface.co/BurnyCoder/gphyt-attnres-standard
- Repositorio del estudio: https://github.com/BurnyCoder/general-physics-attention-residuals-transformer
- Paper de GPhyT: https://arxiv.org/abs/2509.13805
- Código oficial de GPhyT: https://github.com/FloWsnr/General-Physics-Transformer
- Paper de Attention Residuals: https://arxiv.org/abs/2603.15031
- Operador FLA: https://github.com/fla-org/flash-linear-attention
- Paper de The Well: https://arxiv.org/abs/2412.00568
- Interpretación medida: https://github.com/BurnyCoder/general-physics-attention-residuals-transformer/blob/main/reports/interpretation.md
- Auditoría de arquitectura: https://github.com/BurnyCoder/general-physics-attention-residuals-transformer/blob/main/reports/architecture-audit.md
- Preparación de datos: https://github.com/BurnyCoder/general-physics-attention-residuals-transformer/blob/main/reports/data-preparation.md
- Resumen de controles sin entrenar: https://github.com/BurnyCoder/general-physics-attention-residuals-transformer/blob/main/reports/untrained/summary.md
