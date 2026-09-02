# itzPotato/transcoder-relu-2layer-seed1-layer0

## Resumen

El modelo `itzPotato/transcoder-relu-2layer-seed1-layer0` es un transcoder TopK, un tipo de sparse autoencoder diseñado para interpretabilidad mecanicista, que aproxima la función de la subcapa MLP de la capa 0 de un transformer de aritmética de 2 capas con activación ReLU. Ha sido desarrollado por itzPotato (Rohan Sashank Babbellapati) y se publica como parte de una serie de transcoders entrenados sobre modelos pequeños para estudiar cómo se representan y procesan operaciones aritméticas en redes neuronales.

A diferencia de un autoencoder clásico del residual stream, un transcoder lee la activación de entrada del MLP y predice su salida a través de un cuello de botella k-sparse, lo que permite aislar features interpretables. El modelo tiene 66.592 parámetros, una dimensión de modelo de 32, 1.024 features (expansión 32x) y activa 32 features por entrada. No es un modelo de lenguaje ni un generador de texto; su propósito es exclusivamente analítico y de investigación.

La relevancia de este modelo radica en que proporciona una herramienta concreta para diseccionar el comportamiento de un transformer pequeño entrenado en aritmética, permitiendo comparar la reconstructibilidad de arquitecturas ReLU frente a bilineales. Se enmarca en la tendencia actual de interpretabilidad de modelos mediante sparse autoencoders, pero aplicada a un dominio restringido y controlado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transcoder TopK (sparse autoencoder) sobre MLP ReLU de capa 0 |
| Parametros totales | 66.592 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es modelo de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de aritmética, no lingüístico) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (formato exacto no especificado) |

## Arquitectura y entrenamiento

El transcoder implementa la fórmula `y_hat = TopK_k(W_enc x + b_enc) @ W_dec + b_dec`, donde `x` es la activación de entrada del MLP de la capa 0 del modelo base `itzPotato/arithmetic-relu-2layer-seed1`. La dimensión de entrada y salida es 32, con 1.024 features internas y un valor de k=32 (features activas por entrada). Las filas del decoder tienen norma unitaria.

El entrenamiento se realizó con Adam a una tasa de aprendizaje de 0.0003, usando lotes de 4.096 vectores de activación (no problemas completos). Se hizo una sola pasada sobre 500.000 problemas del split de entrenamiento del modelo base, con un subconjunto de validación separado de 10.000 problemas. Los splits de validación y prueba del modelo base nunca se utilizaron. En total se procesaron 7.999.488 vectores de activación en 1.953 pasos.

La inicialización es particular: el bias del decoder se fija a la media del target y el encoder se reescala una vez a partir del primer lote de entrenamiento, de modo que la única pasada permitida se dedica a aprender features en lugar de corregir desajustes de escala. Se midieron los valores de calibración: `calibration_scale` 0.197, `init_normalized_after` 1.75 y `init_normalized_before` 18.8.

## Capacidades

- Aproximación de la salida del MLP de la capa 0 del transformer base con un error de reconstrucción normalizado de 0.0159 (MSE / media del target al cuadrado).
- Fracción de varianza no explicada (FVU) de 0.0182, lo que indica que el transcoder captura la mayor parte de la varianza de la salida del MLP.
- Extracción de features interpretables mediante el cuello de botella k-sparse (k=32 sobre 1.024 features).
- Comparación de reconstructibilidad entre arquitecturas: en el conjunto de 18 transcoders del autor, los MLP bilineales son ~1.55x más difíciles de reconstruir que los ReLU (error normalizado 0.0387 vs 0.0249).
- No tiene capacidades de generación de texto, razonamiento, código, visión ni audio. Es exclusivamente una herramienta de análisis.

## Casos de uso

- Investigación en interpretabilidad mecanicista: permite analizar qué features internas utiliza el transformer para realizar operaciones aritméticas, aislando componentes individuales de la representación.
- Estudio de la aritmética en transformers pequeños: al ser un modelo de solo 2 capas y 32 dimensiones, es un banco de pruebas ideal para entender cómo se codifican sumas, restas u otras operaciones.
- Comparación de arquitecturas de MLP: el transcoder sirve para medir cuantitativamente la dificultad de reconstrucción entre MLP ReLU y bilineales, como se reporta en la model card.
- Validación de técnicas de sparse autoencoding: el método de inicialización y entrenamiento en una sola pasada puede evaluarse y compararse con otros enfoques en un entorno controlado.
- Educación y divulgación: como ejemplo didáctico de qué es un transcoder y cómo se aplica a un modelo pequeño, útil en cursos de interpretabilidad.
- Desarrollo de herramientas de análisis de circuitos: los transcoders entrenados sobre capas específicas pueden integrarse en pipelines de análisis de circuitos para localizar dónde se computan ciertas funciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque el modelo no es un LLM. En su lugar, la model card reporta métricas de reconstrucción sobre el conjunto de validación:

| Metrica | Valor |
|---|---|
| Error de reconstruccion normalizado | 0.0159 |
| Fraccion de varianza no explicada (FVU) | 0.0182 |
| MSE crudo | 0.023695 |

Además, se indica que en el conjunto de 18 transcoders (3 profundidades × 3 semillas × 2 arquitecturas), los MLP bilineales son consistentemente ~1.55x más difíciles de reconstruir que los ReLU (0.0387 vs 0.0249 de error normalizado).

## Requisitos de hardware

- El modelo tiene solo 66.592 parámetros, por lo que cabe en cualquier GPU o incluso en CPU sin problemas de memoria.
- VRAM estimada: menos de 1 GB (el modelo ocupa aproximadamente 0.27 MB en float32).
- GPU recomendada: ninguna en particular; cualquier GPU con soporte PyTorch es suficiente. También funciona en CPU.
- Opciones de despliegue: carga mediante la función `load_transcoder` del paquete `src.transcoder.source` (ver enlaces). No requiere servidores de inferencia como vLLM u Ollama.
- Latencia y throughput: al ser un modelo diminuto, la inferencia es prácticamente instantánea, del orden de microsegundos por vector de activación.

## Comparativa con modelos similares

No se dispone de información sobre transcoders comparables de otros autores en el mismo dominio (aritmética en transformers pequeños). El propio autor ha publicado otros transcoders en su perfil de Hugging Face (por ejemplo, para capas 1 o para modelos bilineales), pero no se proporcionan métricas detalladas de esos modelos en la información disponible. Por tanto, la comparativa directa no está disponible.

## Limitaciones y advertencias

- Es un modelo de investigación, no apto para uso en producción ni para tareas de lenguaje natural.
- Está específicamente ajustado al modelo base `itzPotato/arithmetic-relu-2layer-seed1` (sha256 `84f70765f74a8b91a2fe1f24d247d450a74944e58bb95ffcbb643237dca0680a`); no es transferible a otros modelos sin reentrenamiento.
- No se especifica licencia, por lo que su uso comercial o redistribución queda sujeto a la normativa de Hugging Face y a la decisión del autor.
- El error de reconstrucción no es nulo (FVU 0.0182), lo que implica que el transcoder no captura toda la información de la salida del MLP; las features extraídas pueden perder detalles finos.
- No soporta otros dominios ni idiomas; su ámbito es exclusivamente la aritmética sobre el modelo base indicado.
- La carga con `require_pinned=True` es obligatoria para garantizar la reproducibilidad, pero puede fallar si el repositorio cambia de commit.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/itzPotato/transcoder-relu-2layer-seed1-layer0
- Modelo base (arithmetic-relu-2layer-seed1): https://huggingface.co/itzPotato/arithmetic-relu-2layer-seed1
- Perfil del autor en Hugging Face: https://huggingface.co/itzPotato/models
- Repositorio de código (referenciado en la model card, no se proporciona URL directa): `src.transcoder.source` (paquete Python)
