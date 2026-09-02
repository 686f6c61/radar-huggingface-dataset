# itzPotato/transcoder-bilinear-2layer-seed2-layer0

## Resumen

El modelo `itzPotato/transcoder-bilinear-2layer-seed2-layer0` es un transcoder TopK entrenado sobre la capa 0 del transformer aritmético `itzPotato/arithmetic-bilinear-2layer-seed2`, un modelo de dos capas con MLP bilineal diseñado para tareas de aritmética. Un transcoder es una herramienta de interpretabilidad que aproxima una subcapa MLP concreta: lee la activación de entrada del MLP y predice su salida a través de un cuello de botella k-escaso. No es un autoencoder del flujo residual, sino un modelo supervisado específico para una subcapa.

El modelo tiene 66.592 parámetros, con d_model de 32, 1.024 features (expansión 32x) y 32 features activas por entrada. Se entrenó con una sola pasada sobre 500.000 problemas del split de entrenamiento del modelo base, usando 7.999.488 vectores de activación. Su propósito es facilitar el análisis de cómo el transformer aritmético representa y procesa la información en su primera capa, permitiendo estudiar la formación de features y la mecánica interna de la aritmética.

La relevancia de este modelo radica en que pertenece a una línea de investigación sobre interpretabilidad mecanicista de transformers pequeños, específicamente comparando arquitecturas con MLP ReLU frente a MLP bilineal. Los resultados reportados indican que los MLP bilineales son consistentemente ~1,55 veces más difíciles de reconstruir que los ReLU, lo que sugiere diferencias estructurales en cómo se codifican las features. Es una herramienta de investigación, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transcoder TopK (sparse autoencoder supervisado) |
| Parametros totales | 66.592 |
| Parametros activos | 32 (features activas por entrada) |
| Longitud de contexto | no disponible (procesa vectores de activación, no texto) |
| Tipos de cuantizacion | no disponible (pesos en precisión nativa de PyTorch) |
| Idiomas soportados | no disponible (modelo de interpretabilidad, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (safetensors probable, no confirmado) |

## Arquitectura y entrenamiento

El transcoder implementa la fórmula `y_hat = TopK_k(W_enc x + b_enc) @ W_dec + b_dec`, donde `W_enc` es la matriz de codificación (d_model → features), `W_dec` la de decodificación (features → d_model), y `TopK_k` selecciona las k activaciones más altas. Las filas del decodificador están normalizadas a norma unitaria. El modelo tiene 1.024 features y k=32, lo que significa que para cada entrada solo 32 features están activas, forzando una representación dispersa.

El entrenamiento usó Adam con learning rate 0,0003 y lotes de 4.096 vectores de activación (no problemas completos). Se realizó una sola pasada sobre 500.000 problemas del split de entrenamiento del modelo base, con un subconjunto de validación de 10.000 problemas. Los splits de validación y prueba del modelo base nunca se tocaron. En total se procesaron 7.999.488 vectores de activación en 1.953 pasos. La inicialización es cuidadosa: el sesgo del decodificador se fija a la media del objetivo, y el codificador se reescala una vez con el primer lote de entrenamiento, de modo que la única pasada se dedica a aprender features en lugar de corregir desajustes de escala. Se midió una escala de calibración de 0,133, y el error normalizado inicial pasó de 45,2 a 1,62 tras el reescalado.

## Capacidades

- Reconstrucción de la salida del MLP de la capa 0 del transformer aritmético bilineal, con un error de reconstrucción normalizado de 0,0186.
- Identificación de features dispersas (32 activas de 1.024) que representan patrones internos del modelo base.
- Análisis de la formación de features en transformers con MLP bilineal, permitiendo comparar con arquitecturas ReLU.
- Soporte para carga con verificación de integridad mediante `require_pinned=True`, que garantiza que se usa exactamente la revisión registrada del modelo.
- No es un modelo generativo: no produce texto, código ni respuestas. Su salida es una aproximación de la activación del MLP.

## Casos de uso

- Investigación en interpretabilidad mecanicista: el transcoder permite descomponer la actividad del MLP de la capa 0 en features interpretables, facilitando el estudio de cómo el transformer aritmético representa operaciones como suma o multiplicación.
- Comparación de arquitecturas: al estar entrenado sobre un MLP bilineal, sirve para contrastar la dificultad de reconstrucción frente a transcoders de MLP ReLU, ayudando a entender diferencias en la codificación interna.
- Validación de técnicas de sparse autoencoding: el modelo es un caso de prueba para evaluar métodos de entrenamiento de transcoders con una sola pasada y calibración inicial.
- Análisis de la dinámica de features en modelos pequeños: permite rastrear qué features se activan ante diferentes entradas aritméticas, lo que puede revelar algoritmos internos emergentes.
- Desarrollo de herramientas de depuración para modelos de IA: aunque el modelo base es pequeño, la metodología puede extenderse a modelos mayores para auditar subcapas específicas.
- Reproducibilidad científica: al estar disponible públicamente con código de carga y verificación de revisión, sirve como referencia para otros investigadores que quieran replicar o extender los experimentos.

## Benchmarks y rendimiento

La model card reporta métricas de reconstrucción sobre el conjunto de validación:

| Metrica | Valor |
|---|---|
| Error de reconstrucción normalizado (MSE / mean(target^2)) | 0,0186 |
| Fracción de varianza no explicada | 0,0195 |
| MSE crudo | 0,00378591 |

El error normalizado es la métrica recomendada para comparar entre arquitecturas, ya que las escalas de salida de MLP ReLU y bilineal difieren. Un predictor constante cero obtendría un valor de 1,0. El autor indica que, en el conjunto completo de 18 transcoders, los MLP bilineales son ~1,55 veces más difíciles de reconstruir que los ReLU (0,0387 frente a 0,0249). No se proporcionan benchmarks adicionales como MMLU o HumanEval, dado que el modelo no es un LLM.

## Requisitos de hardware

- El modelo es extremadamente pequeño (66.592 parámetros), por lo que cabe en cualquier GPU o incluso en CPU sin problemas.
- VRAM estimada: menos de 1 MB para los pesos; la inferencia sobre vectores de activación es trivial.
- GPU recomendada: cualquiera, incluso una integrada. No se requieren GPUs de alta gama.
- Opciones de despliegue: se carga directamente con PyTorch mediante la función `load_transcoder` del repositorio asociado. No requiere vLLM, llama.cpp ni Ollama.
- Latencia y throughput: despreciables; el procesamiento de un vector de 32 dimensiones es instantáneo.

## Comparativa con modelos similares

No se dispone de información sobre otros transcoders comparables en el mismo repositorio o con las mismas características. El autor menciona que hay 18 transcoders en el conjunto (3 profundidades × 3 semillas × 2 tipos de MLP), pero no se listan identificadores concretos. Se puede comparar conceptualmente con sparse autoencoders (SAEs) tradicionales, pero la diferencia clave es que un transcoder predice la salida del MLP a partir de su entrada, mientras que un SAE reconstruye la activación residual. No hay datos públicos de otros modelos para una tabla comparativa.

## Limitaciones y advertencias

- Modelo de investigación, no apto para uso en producción ni para tareas de generación de texto o código.
- Entrenado exclusivamente sobre activaciones de un transformer aritmético de 2 capas; sus features no son transferibles a otros modelos.
- La licencia no está especificada, por lo que el uso comercial es incierto; se recomienda contactar al autor.
- No se reportan sesgos ni alucinaciones porque no es un modelo generativo; sin embargo, la reconstrucción no es perfecta (error normalizado 0,0186), lo que implica que algunas features pueden estar mal capturadas.
- El modelo depende de la revisión exacta del modelo base; si el checkpoint base cambia, el transcoder puede no ser válido. La función de carga con `require_pinned=True` mitiga este riesgo.
- No hay soporte multilingüe ni de contexto, ya que no procesa texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itzPotato/transcoder-bilinear-2layer-seed2-layer0
- Modelo base: https://huggingface.co/itzPotato/arithmetic-bilinear-2layer-seed2
- Perfil del autor: https://huggingface.co/itzPotato/models
