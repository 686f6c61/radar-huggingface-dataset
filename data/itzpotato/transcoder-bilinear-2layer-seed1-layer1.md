# itzPotato/transcoder-bilinear-2layer-seed1-layer1

## Resumen

El modelo `itzPotato/transcoder-bilinear-2layer-seed1-layer1` es un transcoder TopK diseñado para la interpretabilidad de redes neuronales. Concretamente, se ajusta a la capa 1 (MLP bilineal) del transformer aritmético de dos capas `itzPotato/arithmetic-bilinear-2layer-seed1`, también desarrollado por itzPotato. Un transcoder no es un autoencoder del flujo residual, sino que aproxima una subcapa MLP concreta: lee la activación de entrada de esa MLP y predice su salida a través de un cuello de botella k-disperso. Esto permite descomponer los cálculos internos del modelo en características interpretables.

El modelo tiene una arquitectura muy pequeña (66.592 parámetros) y está pensado exclusivamente para investigación en mecánica interpretativa, no para tareas generativas. Su relevancia radica en que permite estudiar cómo un transformer con MLP bilineal (una variante menos común que la ReLU) representa operaciones aritméticas, y comparar la dificultad de reconstrucción frente a MLP ReLU. Según la model card, los MLP bilineales son consistentemente ~1,55 veces más difíciles de reconstruir que los ReLU en este conjunto de transcoders.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transcoder TopK (capa MLP bilineal, capa 1) |
| Parametros totales | 66.592 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de investigación, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | pytorch (formato de archivo no especificado) |

## Arquitectura y entrenamiento

El transcoder sigue la fórmula `y_hat = TopK_k(W_enc x + b_enc) @ W_dec + b_dec`, con `d_model` de entrada y salida de 32, 1024 características (expansión 32x) y `k=32` características activas por entrada. Las filas del decodificador tienen norma unitaria. El modelo se entrenó con Adam (lr 0.0003) en lotes de 4096 vectores de activación, realizando una sola pasada sobre 500.000 problemas del split de entrenamiento del modelo base, con un subconjunto de validación de 10.000 problemas. En total se usaron 7.999.488 vectores de activación en 1.953 pasos. Los splits de validación y prueba del modelo base no se tocaron.

La inicialización es particular: el sesgo del decodificador se fija a la media del objetivo y el codificador se reescala una vez con el primer lote de entrenamiento, de modo que la única pasada permitida se dedica a aprender características en lugar de corregir desajustes de escala. Se midieron los valores de calibración: `calibration_scale` 1.65, `init_normalized_after` 1.44, `init_normalized_before` 1.13.

## Capacidades

- Reconstrucción de la salida de la capa MLP bilineal a partir de su entrada, con un error de reconstrucción normalizado de 0.0479 (MSE / media(target^2)), una fracción de varianza no explicada de 0.0502 y un MSE bruto de 6.7342.
- Representación dispersa interpretable: al activar solo 32 de 1024 características por entrada, permite identificar qué características contribuyen a cada cálculo.
- Comparabilidad entre arquitecturas: el error normalizado permite comparar la dificultad de reconstrucción entre MLP ReLU y bilineales (0.0387 vs 0.0249 en promedio para este conjunto).
- No es un modelo generativo: no genera texto, código ni realiza razonamiento; su función es analítica.
- No soporta tool calling, agentes ni capacidades multimodales.

## Casos de uso

- Investigación en interpretabilidad de transformers: permite descomponer los cálculos de la capa 1 del modelo base en características dispersas, facilitando el estudio de cómo se representan operaciones aritméticas.
- Análisis de circuitos: al reconstruir la salida de la MLP, se pueden rastrear los flujos de información entre capas y comparar con transcoders de otras capas o arquitecturas.
- Estudio de diferencias entre MLP ReLU y bilineales: al comparar los errores de reconstrucción normalizados, se puede cuantificar la complejidad adicional que introduce la no linealidad bilineal.
- Validación de metodologías de transcoders: sirve como caso de prueba para técnicas de entrenamiento con una sola pasada y calibración de escala.
- Reproducibilidad en mecánica interpretativa: al estar fijado a un checkpoint con hash sha256, permite reproducir experimentos de forma fiable.
- Docencia e investigación académica: útil para demostrar conceptos de sparse autoencoders y transcoders en cursos avanzados de deep learning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El modelo no está diseñado para tareas de lenguaje o razonamiento general, sino para reconstrucción de activaciones. Los únicos datos de rendimiento son los de reconstrucción indicados en la model card:

| Metrica | Valor |
|---|---|
| Error de reconstruccion normalizado | 0.0479 |
| Fraccion de varianza no explicada | 0.0502 |
| MSE bruto | 6.7342 |

## Requisitos de hardware

- El modelo es extremadamente pequeño (66.592 parámetros), por lo que cabe en cualquier GPU, incluso en CPU.
- VRAM estimada: menos de 1 GB (probablemente menos de 100 MB en precisión float32).
- GPU recomendada: cualquiera, incluso integradas; no requiere hardware especializado.
- Opciones de despliegue: al ser un modelo de investigación, se carga mediante la función `load_transcoder` del repositorio asociado, no mediante frameworks de inferencia estándar como vLLM u Ollama.
- Latencia y throughput: no relevantes para este tipo de modelo; la inferencia es instantánea en cualquier hardware moderno.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (transcoders TopK para MLP bilineales). Existen otros transcoders en el ecosistema de interpretabilidad, como los de `jacobdunefsky/transcoder_circuits`, pero no se han encontrado datos específicos de comparación con este modelo. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Modelo de investigación: no es apto para uso en producción ni para tareas de lenguaje natural.
- Específico de un modelo base concreto: solo es válido para la capa 1 del transformer `arithmetic-bilinear-2layer-seed1`; no es generalizable a otros modelos.
- Sin licencia especificada: no se indica la licencia, por lo que su uso comercial o redistribución puede ser problemático; se recomienda contactar al autor.
- Sin soporte de idiomas ni capacidades generativas: no procesa texto ni genera respuestas.
- Riesgo de sobreajuste al conjunto de entrenamiento: aunque se usó una sola pasada, el modelo está ajustado a los datos de activación de un único modelo base.
- Dependencia de la versión del checkpoint: el modelo exige que se cargue con un commit sha256 específico (`require_pinned=True`), lo que limita su uso si el repositorio cambia.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/itzPotato/transcoder-bilinear-2layer-seed1-layer1)
- [Modelo base: arithmetic-bilinear-2layer-seed1](https://huggingface.co/itzPotato/arithmetic-bilinear-2layer-seed1)
- [Repositorio de transcoders de itzPotato (no confirmado)](https://huggingface.co/itzPotato/models)
