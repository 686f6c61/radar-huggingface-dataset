# alexgower/PotentialEP

## Resumen

PotentialEP es un conjunto de checkpoints de investigación publicados por Alex Gower junto con el artículo "PotentialEP: Backprop-Free Training of CIFAR-Scale Generative Models via Equilibrium Propagation" (arXiv:2610.14409, 2026). No es un modelo de lenguaje, sino un modelo generativo de imágenes incondicional entrenado sobre CIFAR-10 (32x32 píxeles) que explora el entrenamiento sin retropropagación mediante propagación de equilibrio (equilibrium propagation, EP) y codificación predictiva (predictive coding). El objetivo del trabajo es demostrar que es posible entrenar modelos generativos a escala CIFAR con un rendimiento competitivo sin usar backpropagation, lo que resulta relevante para la investigación en modelos basados en energía y en arquitecturas de inspiración neuromórfica.

El repositorio incluye cuatro variantes principales de 50M y 78M parámetros, cada una con pesos EMA y tras la fase contrastiva, con valores de FID entre 3,33 y 3,64 a temperatura de muestreo τ_s = 3,25 (y 5,0 para la variante sin normalización ni atención). Además, se publican los checkpoints de la fase 1 (previa a la fase contrastiva) con FID entre 6,23 y 6,87 a τ_s = 1,0.

La relevancia actual del modelo es fundamentalmente metodológica: proporciona puntos de referencia reproducibles para comparar entrenamiento por backpropagation, por resolución implícita (IFT) y por EP en un mismo marco de modelos basados en energía, con comandos de evaluación documentados y hashes SHA256 para verificar la integridad de los pesos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo generativo basado en energía con codificación predictiva (predictive coding network, PCN); variante adicional sin normalización ni atención |
| Parámetros totales | 50M (em_replication, ift, ep); 78M (norm_attn_free) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | checkpoints PyTorch (`.pt`) con diccionario `net_model`, `ema_model`, `sched`, `optim`, `step` |

## Arquitectura y entrenamiento

El modelo se enmarca en la familia de redes de codificación predictiva y modelos basados en energía. La innovación central de PotentialEP es el uso de propagación de equilibrio (EP) para entrenar el modelo sin retropropagación: durante la fase contrastiva, las muestras negativas de la fase 2 se obtienen con un gemelo feedforward, según se detalla en el artículo. El repositorio compara explícitamente tres regímenes de gradiente sobre la misma arquitectura base: backpropagation (variante Energy Matching, `em_replication`), resolución implícita mediante el teorema de la función implícita (`ift`) y EP propiamente dicho (`ep`). Una cuarta variante (`norm_attn_free`) elimina normalización y atención, con 78M de parámetros.

El entrenamiento se realizó sobre CIFAR-10 con 50 000 muestras, en dos fases: una fase 1 (sin fase contrastiva) y una fase 2 contrastiva de la que proceden los checkpoints principales. Todos los resultados del artículo emplean los pesos EMA (`--use_ema`). Los brazos PCN se muestrean con `--pcn_gamma=0.1`. No se especifican en la información disponible el número total de tokens ni la composición detallada del dataset más allá de CIFAR-10, ni si hubo RLHF/DPO (no aplicable a un modelo generativo de imágenes de este tipo).

## Capacidades

- Generación incondicional de imágenes de 32x32 píxeles (CIFAR-10).
- Entrenamiento sin retropropagación mediante propagación de equilibrio (variante `ep`).
- Entrenamiento con resolución implícita vía IFT (variante `ift`).
- Baseline con backpropagation para comparación (variante `em_replication`).
- Variante sin normalización ni atención (`norm_attn_free`).
- Pesos EMA listos para evaluación y reproducción de resultados del artículo.
- Checkpoints de fase 1 para diagnósticos de correspondencia entre métodos.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).

## Casos de uso

- Reproducción de resultados del artículo: cargar cada checkpoint con `--resume_ckpt` y ejecutar el comando FID documentado en `checkpoints_main_arms/EXPLANATION.md` para verificar los valores publicados (FID 3,33–3,64 a τ_s = 3,25).
- Investigación en entrenamiento sin backpropagation: usar la variante `ep` como referencia para estudiar la viabilidad de EP en modelos generativos a escala CIFAR y comparar con `em_replication` e `ift`.
- Estudio de modelos basados en energía: analizar la dinámica de relajación y el efecto de `--pcn_gamma=0.1` en la calidad de muestreo.
- Diagnósticos de correspondencia entre métodos de gradiente: emplear los checkpoints de fase 1 (`checkpoint_145000.pt`, FID 6,42–6,87 a τ_s = 1,0) para los diagnósticos descritos en el artículo.
- Ablación de arquitectura: comparar la variante `norm_attn_free` (78M, FID 3,51) con las de 50M para evaluar el impacto de eliminar normalización y atención.
- Docencia y divulgación: ilustrar en cursos o seminarios cómo se entrena un modelo generativo sin retropropagación, con pesos verificables por SHA256.

## Benchmarks y rendimiento

Resultados de FID reportados en la model card (CIFAR-10, 50k muestras, pesos EMA, tras la fase contrastiva):

| Variante | Gradiente | Parámetros | FID | τ_s |
|---|---|---|---|---|
| `em_replication/` | backprop | 50M | 3,54 | 3,25 |
| `ift/` | IFT | 50M | 3,64 | 3,25 |
| `ep/` | EP | 50M | 3,33 | 3,25 |
| `norm_attn_free/` | backprop | 78M | 3,51 | 5,0 |

Checkpoints de fase 1 (FID a τ_s = 1,0):

| Fichero | FID | Nota |
|---|---|---|
| `em_replication/phase1/checkpoint_145000.pt` | 6,42 | checkpoint usado en todos los diagnósticos de correspondencia del artículo |
| `ift/phase1/checkpoint_145000.pt` | 6,70 | — |
| `ep/phase1/checkpoint_100000.pt` | 6,23 | punto de partida de la fase 2 de `ep/checkpoint.pt` |
| `ep/phase1/checkpoint_145000.pt` | 6,87 | final de la fase 1 de EP |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje, por no ser aplicables a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 50M parámetros en fp32 el peso ronda los 200 MB y en fp16 los 100 MB, aunque el checkpoint completo incluye además estados de optimizador y scheduler, lo que explica el tamaño del repo (7,7 GB).
- GPU recomendadas: no disponible; por el tamaño del modelo, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) debería ser suficiente para inferencia, aunque no se confirma en la información proporcionada.
- Cabe en GPU consumer: previsiblemente sí, dado el reducido número de parámetros, si bien no se documenta oficialmente.
- Opciones de despliegue: los checkpoints se cargan con los scripts de entrenamiento del repositorio de GitHub mediante `--resume_ckpt`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone en la información proporcionada de comparativas con otros modelos generativos de CIFAR-10 (por ejemplo, GANs o modelos de difusión de referencia) más allá de las comparaciones internas entre las cuatro variantes del propio PotentialEP. La comparativa relevante es la que ofrece la model card entre regímenes de gradiente:

| Variante | Gradiente | Parámetros | FID | Licencia |
|---|---|---|---|---|
| PotentialEP `ep` | EP | 50M | 3,33 | MIT |
| Energy Matching `em_replication` | backprop | 50M | 3,54 | MIT |
| PotentialEP `ift` | IFT | 50M | 3,64 | MIT |
| `norm_attn_free` | backprop | 78M | 3,51 | MIT |

Comparativa con modelos externos: no disponible.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para producción ni para generación de imágenes de alta resolución; solo genera 32x32 píxeles sobre la distribución de CIFAR-10.
- No es un modelo de lenguaje: no soporta texto, tool calling, agentes ni capacidades multilingües.
- Los checkpoints son diccionarios de entrenamiento completos (incluyen `optim` y `sched`), no pesos de inferencia aislados; requieren el código del repositorio para cargarse correctamente.
- Los resultados dependen de la configuración de muestreo (τ_s, `--pcn_gamma=0.1`); usar otros ajustes puede degradar el FID.
- Riesgo de sobreajuste al dataset CIFAR-10 y de generar imágenes poco diversas fuera de esa distribución.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información disponible.
- Licencia MIT: permite uso comercial, pero al tratarse de un artefacto de investigación conviene citar el artículo y verificar los hashes SHA256 antes de usarlo.
- No se especifican requisitos de hardware ni latencias, lo que dificulta planificar despliegues.

## Enlaces

- Hugging Face: https://huggingface.co/alexgower/PotentialEP
- Artículo: https://arxiv.org/abs/2610.14409
- Repositorio de código: https://github.com/alexgower/PotentialEP
- Instrucciones de evaluación FID: https://github.com/alexgower/PotentialEP/tree/main/results_cifar10_pcn/in_paper/checkpoints_main_arms
- Dataset CIFAR-10: https://huggingface.co/datasets/cifar10
