# listussr/gpt2-resid-denoiser

## Resumen

`listussr/gpt2-resid-denoiser` es un denoiser del residual stream de GPT-2 small, desarrollado por el investigador listussr como parte de un proyecto de interpretabilidad y activation steering. El modelo se entrena para corregir las distorsiones que introduce una intervención de steering sobre las activaciones de la capa 6 (bloque 5, `resid_post`), de forma que se pueda aplicar la intervención con amplitudes grandes sin romper el comportamiento del modelo. Su propósito es servir de herramienta de investigación, no de modelo de lenguaje.

El resultado del experimento es negativo: el autor documenta que el denoiser no mejora el Pareto front frente al steering ingenuo, y el checkpoint se publica como artefacto reproducible del estudio, no como herramienta operativa. La arquitectura es un pequeño MLP residual con condicionamiento adaptativo por nivel de ruido (AdaLN), con 16 667 649 parámetros en fp32 (66,7 MB). La licencia es MIT y los pesos están disponibles en formato safetensors y en un checkpoint pickle. El proyecto se enmarca dentro del repositorio `llm-interpretability`, donde se detalla el protocolo completo del experimento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | in_proj → 3 × AdaLN-residual (width 1024, mlp_ratio 2.0) → out_proj; condicionamiento por log(σ + 1e-6) → Fourier features → MLP (cond_dim = 256) |
| Parámetros totales | 16 667 649 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no aplica (procesa vectores de 768 dimensiones, no texto) |
| Tipos de cuantización | no disponible (pesos en fp32) |
| Idiomas soportados | no aplica |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), checkpoint PyTorch (`denoiser_ve_rank1.pt`), `config.json` |

## Arquitectura y entrenamiento

El modelo es un denoiser condicionado por nivel de ruido que opera sobre el residual stream de GPT-2 small en la salida del bloque 5 (capa 6, `resid_post`), con dimensión 768. La parametrización es `D(x, σ) = x + s · g((x - μ)/s, σ/s)`, donde μ y s son estadísticas de activación guardadas como buffers internos del checkpoint. El proyector de salida se inicializa a cero, de modo que antes del entrenamiento la red es la identidad exacta. El condicionamiento por σ se implementa mediante `log(σ + 1e-6)` → características de Fourier → MLP con dimensión 256.

El entrenamiento se realizó sobre un millón de activaciones de GPT-2 small (capa 6) extraídas del corpus OpenWebText. El esquema de ruido es `ve_rank1`: ruido isotrópico gaussiano `N(0, σ²I)` con probabilidad 0,5 de añadir una perturbación de rango 1 a lo largo de una dirección aleatoria. El rango de σ se muestrea log-uniformemente en `[0.01, 3.0] × s`, es decir, `[0.029, 8.64]` en unidades normalizadas. La función de pérdida es `‖(D(x, σ) - h)/s‖²`, sumada por coordenadas. Se usaron 8000 pasos con batch 4096, optimizador AdamW con learning rate 1e-3, warmup de 100 pasos y decaimiento coseno. El entrenamiento duró unos 12 minutos en una RTX 4070. La posición 0 (attention sink, con norma 37,6 veces superior a la media) se excluye de los datos y de toda la estadística. Para preservar la pureza experimental, las direcciones de rango 1 se eligieron aleatorias, y se excluyeron del pool de entrenamiento cinco features de validación de SAE y todas las direcciones con coseno superior a 0,4 respecto a ellas (96 en total).

## Capacidades

- Corrección de activaciones del residual stream de GPT-2 small (capa 6, `resid_post`, 768 dimensiones).
- Condicionamiento por nivel de ruido σ: el modelo recibe un escalar o vector de σ por batch y ajusta su comportamiento en consecuencia.
- Intervención sobre activaciones ya modificadas: `h_hat = D(h + αv, σ)` permite intentar eliminar la distorsión introducida por un steering vector.
- Parametrización que garantiza la identidad exacta antes del entrenamiento (proyector de salida a cero).
- Capacidad de aplicar la corrección solo sobre la componente ortogonal al steering (función `denoise_project` del repositorio), con retención del steering igual a 1 por construcción.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, ni agentes, ni procesamiento de lenguaje.

## Casos de uso

- Investigación en activation steering: el modelo sirve para estudiar si un denoiser puede ampliar el rango de amplitudes α en intervenciones de steering sin degradar la calidad de la generación. Es el caso de uso original del experimento.
- Reproducción de experimentos de interpretabilidad: el checkpoint y el código permiten replicar el protocolo completo (entrenamiento, evaluación, análisis de Pareto) y verificar los resultados negativos documentados.
- Análisis de la sensibilidad de GPT-2 small a intervenciones direccionales: al corregir activaciones en función de σ, se puede medir cómo responde la distribución de salida (KL) a la eliminación de ruido, como se hace en la sección de limitaciones.
- Desarrollo de técnicas de denoising de activaciones: la arquitectura AdaLN residual con condicionamiento por Fourier y la parametrización con estadísticas μ y s son un punto de partida para experimentos con otros modelos o capas.
- Comparación de esquemas de ruido: el esquema `ve_rank1` (ruido isotrópico + rango 1) está documentado y puede servir para comparar otras estrategias de corrupción en estudios de robustez de representaciones.
- Integración en pipelines de interpretabilidad mecanicista: el repositorio `llm-interpretability` incluye código para cargar el denoiser y aplicarlo sobre activaciones, útil para investigadores que trabajan con SAE y steering.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (no hay métricas tipo MMLU, HumanEval o GSM8K, dado que el modelo no es un LLM). El autor documenta mediciones de comportamiento en su model card, que se resumen a continuación:

| σ | error relativo ‖D(h) − h‖/‖h‖ | Mahalanobis tras la corrección |
|---|---|---|
| 0,00 | 0,495 | 330 |
| 0,05 | 0,023 | 673 |
| 0,10 | 0,023 | 670 |
| 1,00 | 0,164 | 490 |
| 8,60 | 60,3 | 27211 |
| activaciones limpias | 0 | 685 |

Estos datos muestran que el modelo no es la identidad para σ = 0 (cambia la activación en un 50 % de su norma) y que diverge en el límite superior de σ (para 8,6 el error relativo es 60,3). Además, el autor mide que en el rango de trabajo (σ_eff = 0,14) el MLP desplaza la activación un 2,4 % de su norma, mientras que el filtro de Wiener óptimo para un prior gaussiano la desplazaría un 0,5 %, y que la retención del steering cae de 0,996 a 0,543 al aumentar κ de 0,05 a 0,45. El resultado global es que el denoiser no mejora el Pareto front frente al steering ingenuo.

## Requisitos de hardware

- Peso del modelo: 66,7 MB en fp32; cabe holgadamente en cualquier GPU con al menos 1 GB de VRAM, incluida una tarjeta integrada.
- Entrenamiento realizado en una RTX 4070 (12 min para 8000 pasos con batch 4096), por lo que la inferencia es trivial en cualquier GPU moderna.
- Inferencia sobre CPU: viable y rápida para vectores de 768 dimensiones; no requiere aceleración por hardware.
- Despliegue: no es un modelo para servir en producción (vLLM, TGI, Ollama); se usa dentro de un script de investigación. El repositorio incluye la clase `Denoiser` y el código de ejemplo.
- Latencia: no se han publicado mediciones, pero el tamaño y la naturaleza del modelo hacen que la latencia por llamada sea del orden de microsegundos en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Propósito | Resultado | Licencia |
|---|---|---|---|---|
| `listussr/gpt2-resid-denoiser` | 16 667 649 | Denoiser de activaciones para GPT-2 small (capa 6) | Negativo: no mejora el steering ingenuo | MIT |
| `borisggg/steering-denoiser-gpt2` | no disponible | Denoiser de activaciones para GPT-2 small (capa 6) | Documentado como experimento; detalla qué funcionó y qué no | MIT |
| Denoiser de Wiener (referencia teórica) | 0 (fórmula cerrada) | Filtro óptimo para prior gaussiano | Referencia de comparación; desplazamiento 5 veces menor que el MLP | no aplica |

No hay una comparativa directa con otros modelos de la misma categoría porque el campo de los denoisers de activación es emergente y no existen benchmarks estandarizados. Los dos modelos citados son los únicos similares localizados en la búsqueda web.

## Limitaciones y advertencias

- Resultado experimental negativo: el autor declara explícitamente que el denoiser no mejora el Pareto front frente al steering ingenuo, por lo que no debe usarse como herramienta de corrección en producción.
- No es la identidad en σ = 0: la red cambia la activación en un 50 % de su norma cuando se le pasa σ = 0, porque el condicionamiento logarítmico mapea el cero a un valor fuera del rango de entrenamiento. No se debe suministrar σ = 0; el valor mínimo sensato es 0,03.
- Divergencia en el límite superior: para σ = 8,6 la salida se dispara dos órdenes de magnitud. Se debe mantener σ dentro de [0,03, 5].
- Exceso de agresividad en el rango de trabajo: a σ_eff = 0,14, el MLP desplaza la activación un 2,4 % de su norma, frente al 0,5 % del filtro de Wiener, lo que provoca que la KL con el modelo limpio pase de 0,06 a 4,26.
- El denoising reduce el steering: la retención del steering cae desde 0,996 (κ = 0,05) hasta 0,543 (κ = 0,45); se recomienda aplicar el denoiser solo a la componente ortogonal a la dirección del steering (`denoise_project`).
- Dependencia del punto de entrenamiento: está entrenado específicamente para la salida del bloque 5 de GPT-2 small sobre OpenWebText; no se ha probado la transferencia a otras capas, modelos o distribuciones de texto.
- No es un modelo de lenguaje: no genera texto, no razona, no codifica, no soporta tool calling ni agentes.
- Riesgo de mal uso: si se usa con σ = α (sin normalizar por la dimensión), el denoiser borra el steering por completo; la calibración de σ es crítica y se detalla en el README del autor.

## Enlaces

- Hugging Face: https://huggingface.co/listussr/gpt2-resid-denoiser
- Repositorio del proyecto (código, informe, protocolo completo): https://github.com/listussr/llm-interpretability
- Modelo similar: https://huggingface.co/borisggg/steering-denoiser-gpt2
