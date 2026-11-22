# glvsks/HEGM-KuaiRec-K12

## Resumen

HEGM (Hierarchical Exponential-Gaussian Mixtures) es un modelo de predicción de tiempo de visualización para sistemas de recomendación de vídeo corto, desarrollado por el usuario glvsks y publicado con licencia Apache 2.0. Este checkpoint concreto corresponde a un entrenamiento sobre el conjunto de datos KuaiRec (versión big-matrix) con 12 componentes gaussianos en la mezcla. No es un modelo de lenguaje: es un modelo probabilístico especializado en estimar la distribución del tiempo que un usuario dedicará a un vídeo, una señal clave para el ranking en plataformas de contenido breve.

El modelo aborda un problema clásico en recomendación: la predicción puntual del watch-time pierde información sobre la incertidumbre y la forma de la distribución. HEGM modela explícitamente dos regímenes de comportamiento mediante una mezcla jerárquica: un componente exponencial que captura los abandonos rápidos (skips) y una mezcla gaussiana que representa el visionado comprometido, combinados mediante una puerta de skip aprendida. Esta formulación permite obtener una distribución completa en lugar de una sola estimación.

La relevancia actual del checkpoint es acotada: se trata de un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, orientado a reproducir los resultados del paper asociado (arXiv:2608.23356). Su valor reside en servir como referencia reproducible para investigadores que trabajen en predicción distribucional de watch-time, no como componente listo para producción sin adaptación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla jerárquica exponencial-gaussiana (HEGM) con puerta de skip aprendida; implementación en PyTorch Lightning |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de secuencia lingüística) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch de precisión completa; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (no procesa texto; opera sobre features de interacción usuario-vídeo) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint PyTorch Lightning (`last.ckpt`) + `config.yaml`; no compatible con `transformers.AutoModel` |

## Arquitectura y entrenamiento

HEGM es un modelo de mezclas probabilísticas, no un transformer. Su núcleo combina un componente exponencial, que modela la probabilidad de abandono inmediato del vídeo, con una mezcla de 12 gaussianas que modela la distribución del tiempo de visionado en sesiones con engagement. Una puerta de skip aprendida pondera la contribución de ambos regímenes, produciendo una densidad de probabilidad completa sobre el watch-time. La jerarquía permite que el componente exponencial capture la masa de probabilidad cerca de cero (skips) mientras las gaussianas se encargan de la cola de visionados largos.

El entrenamiento se realizó sobre KuaiRec en su release big-matrix, un dataset público de interacciones de vídeo corto de Kuaishou con matriz densa de feedback. La model card no especifica el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables en este dominio). La configuración original del experimento está disponible en `configs/kuairec_k12.yaml` del repositorio oficial, y la reproducibilidad requiere descargar los splits procesados mediante `scripts/download_artifacts.py --splits`.

## Capacidades

- Predicción de la distribución completa del watch-time (tiempo de visualización) para pares usuario-vídeo, no solo un valor puntual.
- Modelado explícito del comportamiento de skip mediante el componente exponencial y la puerta aprendida.
- Mezcla de 12 componentes gaussianos para representar la heterogeneidad del visionado comprometido.
- Evaluación con métricas de ranking y regresión: MSE, MAE y XAUC.
- Integración con pipelines de recomendación como señal auxiliar de ranking o re-ranking.
- Reproducibilidad completa mediante el repositorio oficial y los splits liberados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo generativo de texto.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación en predicción distribucional de watch-time: el checkpoint sirve como línea base reproducible para comparar nuevas formulaciones de mezclas (exponencial, log-normal, etc.) sobre KuaiRec con la misma partición de test.
- Ranking en plataformas de vídeo corto: la distribución predicha permite ordenar candidatos por probabilidad de visionado prolongado, no solo por media esperada, lo que mejora la diversificación del feed.
- Detección de riesgo de skip: la masa de probabilidad del componente exponencial puede usarse como señal de "abandono probable" para filtrar contenido antes de servirlo.
- Estimación de incertidumbre para exploración: la varianza de la mezcla gaussiana informa sobre vídeos con comportamiento poco predecible, útil en estrategias de exploración/explotación.
- Re-ranking con restricciones de tiempo: si la plataforma impone un presupuesto de sesión, la distribución completa permite seleccionar ítems cuya masa de watch-time se ajuste a ese presupuesto.
- Reproducción de experimentos académicos: el par `last.ckpt` + `config.yaml` permite validar los resultados del paper sin reentrenar, con un único comando de evaluación.
- Análisis offline de sesiones: agregar las distribuciones predichas sobre un log de interacciones para estudiar patrones de engagement por segmento de usuario.

## Benchmarks y rendimiento

Resultados reportados en la model card para este checkpoint sobre el split de test liberado:

| Metrica | Valor |
|---|---|
| MSE (sec²) | 59.2950 |
| MAE (sec) | 4.5094 |
| XAUC | 0.5537 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos (por ejemplo, regresión directa, DeepFM o variantes de mezclas) en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB según Hugging Face, lo que sugiere un checkpoint de tamaño reducido, pero no se documenta el número de parámetros.
- GPU recomendadas: no disponible. Por la naturaleza del modelo (mezclas sobre features tabulares/embeddings), es probable que quepa en GPUs consumer, pero no se confirma en la documentación.
- Compatibilidad con GPU consumer: no confirmada explícitamente; el checkpoint es un `.ckpt` de PyTorch Lightning cargable en CPU o GPU.
- Opciones de despliegue: no aplican vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje). El despliegue se realiza mediante el repositorio oficial de HEGM con PyTorch/PyTorch Lightning.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HEGM-KuaiRec-K12 | Mezcla exponencial-gaussiana jerárquica | no disponible | no aplica | Apache 2.0 | Checkpoint en HF + repo GitHub |
| Alternativas de predicción de watch-time | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo de investigación con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación externa.
- Entrenado exclusivamente sobre KuaiRec (Kuaishou); el rendimiento fuera de ese dominio o de esa distribución de usuarios no está garantizado.
- No es un modelo de lenguaje: no procesa texto, no responde a prompts y no soporta tool calling ni agentes.
- Requiere los splits procesados del repositorio oficial (incluido `meta.json`); no funciona con `transformers.AutoModel`.
- El checkpoint es un `.ckpt` de PyTorch Lightning, lo que implica dependencia de la versión de PyTorch Lightning y de la configuración original.
- Riesgo de sobreajuste a la matriz densa de KuaiRec, que no refleja la dispersión típica de un sistema real en producción.
- La licencia Apache 2.0 permite uso comercial, pero la model card no ofrece garantías ni soporte; el uso en producción requiere validación propia y monitorización de deriva.
- No se documentan sesgos demográficos ni de popularidad, aunque al derivar de un dataset de una plataforma concreta es probable que herede sesgos de exposición de ítems.
- Las métricas reportadas (XAUC 0.5537) son modestas y deben interpretarse en el contexto del dataset, no como un rendimiento absoluto.

## Enlaces

- Hugging Face: https://huggingface.co/glvsks/HEGM-KuaiRec-K12
- Paper: https://arxiv.org/abs/2608.23356
- Repositorio oficial: https://github.com/rw404/HEGM
- Configuración del experimento: https://github.com/rw404/HEGM/blob/main/configs/kuairec_k12.yaml
- Resultados del repositorio: https://github.com/rw404/HEGM#results
