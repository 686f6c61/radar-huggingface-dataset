# abr00kx/on-manifold-tail-retention

## Resumen

`abr00kx/on-manifold-tail-retention` no es un modelo de lenguaje en el sentido habitual, sino un repositorio de investigación que documenta y reproduce un benchmark matemático sobre el fenómeno del *model collapse* (colapso de modelo) en el entrenamiento recursivo con datos sintéticos. Lo publica la investigadora Ashely Brooks bajo licencia AGPL-3.0, y su aportación central es un método de importancia por ratio de densidades anclado (*anchored density-ratio importance sampling*) que evita la extinción de las colas de baja densidad de la distribución mientras filtra el ruido fuera de la variedad (*off-manifold*).

El trabajo se estructura en tres piezas: un benchmark 2D controlado sobre una mezcla de gaussianas multimodales (`model_collapse_lab.py`), una versión ampliada con la métrica de *Manifold Precision* (`model_collapse_v2.py`) y un script listo para ejecutar en Google Colab T4 que escala el experimento a la generación de bocetos del dataset Quick, Draw! mediante un VAE convolucional (`colab_t4_quickdraw.py`). El repositorio no contiene pesos de modelo entrenados ni una *pipeline* de inferencia publicada.

Su relevancia actual radica en que el colapso por datos sintéticos es un problema abierto para quienes entrenan modelos generativos con datos autogenerados o destilados. El benchmark cuantifica con precisión por qué varias estrategias populares (inflación de varianza, reweighting kNN, coresets DPP) fallan, y demuestra que el reweighting por ratio de densidades anclado mantiene las colas y reduce el MMD² de forma monótona a lo largo de 40 generaciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No es un modelo generativo único: benchmark sobre mezcla de gaussianas 2D y, en la extensión, VAE convolucional sobre Quick, Draw! (28×28) |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | AGPL-3.0 |
| Formato de pesos | No disponible (el repositorio contiene scripts `.py`, no pesos publicados) |

## Arquitectura y entrenamiento

El núcleo metodológico es un esquema de *importance sampling* sobre datos sintéticos generados recursivamente. En cada generación se estima un ratio de densidades `w(x) = clip(p_anchor(x) / p_gen(x), 0, 5)`, donde `p_anchor` es la densidad de los datos originales (Generación 0) y `p_gen` la del generador actual. Este peso se aplica al reentrenamiento para preservar las colas de baja densidad. En la extensión a Quick, Draw! el ratio se estima con un discriminador MLP binario regularizado (`w(z) ≈ D(z) / (1 - D(z))`) sobre latentes de 32–128 dimensiones extraídos por un VAE congelado de la Generación 0, complementado con una comprobación de residuo de bordes para detectar artefactos de alta frecuencia en el espacio nulo.

El pipeline incorpora además una compuerta *off-manifold* basada en distancia k-NN en el espacio latente: se anulan los pesos de las muestras sintéticas cuya distancia k-NN al ancla supera el percentil 95 o 99 de las distancias ancla-ancla. Los pesos se recortan a `[0, 5]` y se monitoriza el *Effective Sample Size* (`ESS = (Σw)² / Σw²`) en cada generación. El benchmark se ejecuta sobre 40 generaciones recursivas con 5 semillas y sin fuga de datos reales tras la Generación 0. La extensión a imágenes usa un VAE convolucional sobre Quick, Draw! con dos clases mayoritarias (`cat`, `dog`, 88 % de la masa) y cuatro colas raras (`octopus`, `windmill`, `cello`, `pineapple`, 12 % restante).

## Capacidades

- Reproducción de benchmarks de colapso de modelo en 2D sobre mezclas gaussianas multimodales (2 modos mayoritarios + 4 colas raras).
- Evaluación comparativa de estrategias anti-colapso: `replacement`, `accumulation`, `temp_perturbation`, `anchored_entropy_reweight` (kNN), `anchor_density_ratio`, `dpp_anchor_coreset` y `ratio_plus_dpp`.
- Cálculo de métricas de diagnóstico: MMD², recuento de colas recuperadas, rango efectivo (*EffRank*), autovalor mínimo (*MinEig*) y *Manifold Precision*.
- Estimación de ratio de densidades mediante discriminador MLP calibrado con recorte de logits y *early stopping*.
- Compuerta *off-manifold* por k-NN en espacio latente con umbrales por percentil (95/99).
- Monitorización de ESS y recorte de pesos durante el entrenamiento recursivo.
- Escalado a generación de bocetos Quick, Draw! mediante VAE convolucional sobre imágenes de 28×28.
- No dispone de capacidades de generación de texto, razonamiento, código ni *tool calling*: no es un LLM.

## Casos de uso

- Investigación sobre colapso de modelo: el repositorio permite reproducir el benchmark de 40 generaciones × 5 semillas y verificar los resultados publicados sobre extinción de colas y contracción de covarianza.
- Diseño de pipelines de entrenamiento con datos sintéticos: sirve como referencia para implementar reweighting por ratio de densidades anclado en lugar de inflación de varianza o reweighting kNN, que el propio benchmark demuestra contraproducentes.
- Auditoría de estrategias anti-colapso en producción: las métricas `ManifoldPrecision` y `MinEig` permiten detectar si un generador está empujando masa fuera de la variedad de datos reales antes de desplegarlo.
- Filtrado de datos sintéticos de baja calidad: la compuerta k-NN con umbral por percentil puede adaptarse para descartar muestras sintéticas que se alejan del soporte de los datos originales en cualquier espacio latente.
- Docencia y formación: los scripts 2D son un ejemplo didáctico y ejecutable en CPU de cómo medir y mitigar el colapso, con tablas de resultados listas para comparar.
- Experimentación con Quick, Draw!: el script `colab_t4_quickdraw.py` está pensado para ejecutarse en una GPU T4 gratuita de Colab, lo que facilita la reproducción sin infraestructura propia.
- Base para extensiones a otros dominios generativos (imagen, audio, texto): el esquema de ratio de densidades anclado es independiente del dominio y puede trasladarse a otros VAE o codificadores congelados.

## Benchmarks y rendimiento

Resultados del benchmark 2D (`model_collapse_v2.py`), 40 generaciones, 5 semillas:

| Estrategia | Gen | MMD² (↓) | Colas /4 (↑) | ManifoldPrec (↑) | MinEig |
|---|---:|---:|---:|---:|---:|
| `accumulation` | 1 | 0.00956 | 3.40 | 0.978 | 2.866 |
| `accumulation` | 40 | 0.00916 | 3.40 | 0.930 | 2.755 |
| `anchor_density_ratio` | 1 | 0.02499 | 3.40 | 0.950 | 2.789 |
| `anchor_density_ratio` | 10 | 0.01285 | 4.00 | 0.986 | 2.803 |
| `anchor_density_ratio` | 20 | 0.00829 | 3.80 | 0.985 | 2.597 |
| `anchor_density_ratio` | 40 | 0.00543 | 3.80 | 0.990 | 2.459 |
| `dpp_anchor_coreset` | 1 | 0.09177 | 4.00 | 0.917 | 8.234 |
| `dpp_anchor_coreset` | 40 | 0.14218 | 4.00 | 0.912 | 11.323 |
| `ratio_plus_dpp` | 1 | 0.01661 | 3.40 | 0.954 | 2.808 |
| `ratio_plus_dpp` | 40 | 0.01399 | 3.80 | 0.980 | 3.111 |

Resultados del benchmark 2D original (`model_collapse_lab.py`):

| Estrategia | Gen | MMD² (↓) | Colas /4 (↑) | EffRank | MinEig |
|---|---:|---:|---:|---:|---:|
| `replacement` | 1 | 0.00702 | 4.00 | 1.789 | 2.813 |
| `replacement` | 40 | 0.05671 | 1.00 | 1.595 | 1.874 |
| `accumulation` | 1 | 0.00492 | 4.00 | 1.794 | 2.860 |
| `accumulation` | 40 | 0.01471 | 3.20 | 1.782 | 2.687 |
| `temp_perturbation` (T=1.04, cov_floor=0.06) | 1 | 0.01398 | 4.00 | 1.798 | 2.907 |
| `temp_perturbation` | 40 | 0.22821 | 3.80 | 1.963 | 17.863 |
| `anchored_entropy_reweight` (kNN) | 1 | 0.01953 | 3.80 | 1.854 | 4.049 |
| `anchored_entropy_reweight` | 40 | 0.04093 | 4.00 | 1.908 | 6.071 |

No se han publicado resultados de benchmarks sobre Quick, Draw! ni sobre LLMs en la información disponible.

## Requisitos de hardware

- Los benchmarks 2D (`model_collapse_lab.py`, `model_collapse_v2.py`) se ejecutan en CPU; no requieren GPU.
- El script `colab_t4_quickdraw.py` está diseñado explícitamente para una GPU NVIDIA T4 (16 GB de VRAM) en Google Colab, con un VAE convolucional sobre imágenes de 28×28 y latentes de 32–128 dimensiones.
- No se especifican requisitos para GPU de gama alta (A100, H100, RTX 4090); el experimento publicado no las necesita.
- No aplica despliegue con vLLM, llama.cpp, Ollama ni TGI: no hay pesos de modelo publicados.
- Latencia y throughput no disponibles.

## Comparativa con modelos similares

No disponible. El repositorio es un benchmark metodológico, no un modelo generativo desplegable, por lo que no existe una comparativa directa con modelos de la misma categoría. Las alternativas conceptuales son las estrategias anti-colapso comparadas internamente en el propio benchmark (`accumulation`, `temp_perturbation`, `anchored_entropy_reweight`, `dpp_anchor_coreset`), cuyos resultados se recogen en la sección anterior.

## Limitaciones y advertencias

- No contiene pesos de modelo entrenados ni una *pipeline* de inferencia: es un repositorio de código de investigación, no un modelo utilizable directamente.
- El benchmark principal es 2D sobre mezclas gaussianas; la generalización a espacios de alta dimensión solo se aborda de forma preliminar en el script de Quick, Draw!.
- Los resultados de Quick, Draw! no se han publicado en la información disponible; no hay evidencia cuantitativa de que el método escale a imágenes reales.
- El método requiere acceso a datos ancla de la Generación 0 (o a un codificador congelado de los mismos); no funciona en escenarios sin datos reales de referencia.
- El umbral de la compuerta k-NN (percentil 95/99) es un hiperparámetro sensible que puede requerir calibración por dominio.
- El recorte de pesos a `[0, 5]` y el *early stopping* del discriminador son heurísticas; no se analiza su sensibilidad en la información disponible.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte, incluida la publicación del código fuente de obras derivadas que se ofrezcan como servicio en red; conviene revisarla antes de uso comercial.
- Riesgo de sesgo y alucinación no aplicable en el sentido habitual (no es un modelo de lenguaje); el riesgo análogo es la fuga de masa fuera de la variedad de datos reales, que el propio benchmark mide con `ManifoldPrecision` y `MinEig`.
- Idiomas no disponibles: no es un modelo lingüístico.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/abr00kx/on-manifold-tail-retention
- Alemohammad et al., *Self-Consuming Generative Models Go MAD*: https://arxiv.org/abs/2307.01850
- Dohmatob et al., *A Tale of Tails: Model Collapse as a Change of Scaling Laws*: https://arxiv.org/abs/2402.07043
- Gerstgrasser et al., *Is Model Collapse Inevitable? Breaking the Curse of Recursion by Accumulating Real and Synthetic Data*: https://arxiv.org/abs/2404.01413
- Jiang et al., *Importance Weighting Can Help Large Language Models Self-Improve*: https://arxiv.org/abs/2408.09849
- Referencias adicionales citadas en la model card (`arXiv:2410.01493`, `arXiv:2510.16657`, `arXiv:2601.03385`): no se dispone de título ni enlace verificado en la información proporcionada.
