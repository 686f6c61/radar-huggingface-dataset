# AlvaroSchwiedop/PHASE-TTC

## Resumen

PHASE-TTC es un modelo de percepción para robótica que estima el tiempo hasta el contacto con signo (signed time-to-contact, TTC) a partir de observaciones causales de cámara de eventos y fotogramas RGB. Lo desarrolla AlvaroSchwiedop y se publica bajo licencia MIT con pesos en PyTorch. No es un modelo de lenguaje: es un sistema de fusión multimodal específico de sensor, orientado a medir cuándo un objeto en aproximación alcanzará al observador, una magnitud crítica para navegación reactiva, evitación de colisiones y agarre dinámico.

El sistema liberado, identificado como PHASE_ONLY_EVENT_S7_TRAIN40_SCIENTIFIC_OOF, consta de nueve componentes: cuatro backbones de movimiento específicos de modalidad, dos readouts temporales por pares, dos refinadores temporales y una cabeza de fusión de fase de solo 1.955 parámetros. Admite hasta 650 ms de información causal. La cabeza de fusión es pequeña, pero no representa el tamaño del modelo completo, que incluye los backbones.

Su relevancia actual radica en que aborda la fusión event/RGB de forma causal y con una representación física de fase, y en que reporta resultados oficiales archivados en el leaderboard GarlTTC Test (28 de octubre de 2026): 35,80145 Overall MiD frente a 45,03 de Garl-TTC, una reducción del 20,49 % sobre 6.762 tokens puntuados y 0 % de fallos definidos por el scorer. Se trata de resultados archivados, no de una reevaluación de esta release ni de una afirmación sobre el leaderboard actual.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema de fusión causal multimodal (event camera + RGB) con backbones de movimiento por modalidad, readouts temporales por pares, refinadores temporales y cabeza de fusión de fase |
| Parametros totales | no disponible (la cabeza de fusión tiene 1.955 parámetros; el total del sistema no se detalla) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana causal de hasta 650 ms de observaciones |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés, según metadatos; el modelo no es lingüístico) |
| Licencia | MIT |
| Formato de pesos | checkpoints PyTorch con código custom (carga mediante `predict.py`, no `transformers.AutoModel`); manifiesto SHA-256 incluido |

## Arquitectura y entrenamiento

La arquitectura es un pipeline de fusión causal compuesto por nueve módulos. Cuatro backbones procesan el movimiento de forma independiente en cada modalidad (eventos y RGB), dos readouts temporales por pares extraen información de las relaciones entre modalidades y dos refinadores temporales pulen las mediciones a lo largo del tiempo. Finalmente, una cabeza de fusión de fase de 1.955 parámetros combina las mediciones en una representación física de fase con una corrección anclada en RGB. El sistema solo admite información causal de hasta 650 ms, lo que lo hace apto para inferencia en línea sin mirar al futuro.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO (técnicas propias de modelos lingüísticos, no aplicables aquí). El repositorio incluye la receta del modelo, normalizadores, checkpoints exactos y un archivo REPRODUCTION.md con los límites de reproducción. Los experimentos con JEPA pertenecen al historial de investigación; el modelo final liberado es el sistema de fusión de fase descrito. Existe una variante separada, PHASE-TTC-Adapt, que añade un router de calidad geométrica entrenado con EvTTC y no corresponde a la puntuación oficial de este repositorio.

## Capacidades

- Estimación de time-to-contact con signo (signed TTC) en segundos a partir de observaciones de cámara de eventos y RGB.
- Medición de movimiento independiente por modalidad (eventos y RGB) y refinamiento temporal de dichas mediciones.
- Fusión causal multimodal con representación física de fase y corrección anclada en RGB.
- Procesamiento de observaciones causalmente limitadas a una ventana de hasta 650 ms.
- Exposición de diagnósticos junto con la estimación de TTC.
- Ejecución en CPU por defecto y en CUDA con PyTorch 2.10.0 / torchvision 0.25.0.
- Verificación de integridad mediante manifiesto SHA-256 y fijación de revisiones del Hub.
- Extracción de ejemplos reales desde el benchmark EvTTC con `extract_example.py`.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo de percepción de sensor, no un modelo generativo de lenguaje.

## Casos de uso

- Evitación reactiva de colisiones en robots móviles: el modelo estima el TTC firmado a partir de eventos y RGB con hasta 650 ms de información causal, lo que permite generar señales de frenado o desvío antes del impacto sin depender de un detector autónomo de objetos.
- Navegación en entornos de alta dinámica y baja latencia: al usar cámara de eventos, funciona en condiciones de movimiento rápido donde el RGB convencional sufre desenfoque, y la fusión con RGB aporta una corrección de referencia.
- Agarre dinámico de objetos en movimiento: la estimación de TTC permite sincronizar el cierre del efector con la llegada del objeto, usando regiones de objeto suministradas externamente.
- Docking y aproximación controlada en robótica aérea o submarina: el TTC firmado indica si el objeto se acerca o se aleja, útil para maniobras de acoplamiento con presupuesto temporal acotado.
- Investigación en percepción event-based: el repositorio incluye proyecciones de evaluación, etiquetas, identidades de fuente y un comando de recómputo de métricas, lo que facilita reproducir y comparar experimentos sobre EvTTC.
- Validación de pipelines de sensor fusion en laboratorio: el ejemplo sintético con formas en expansión y la verificación SHA-256 permiten comprobar la correcta ejecución del software antes de desplegar con datos reales.
- Evaluación comparativa en benchmarks de TTC: la integración con el conjunto EvTTC y el leaderboard de Codabench permite situar el sistema frente a alternativas bajo un protocolo común.

## Benchmarks y rendimiento

Resultados oficiales archivados en el leaderboard GarlTTC Test, registrados el 28 de octubre de 2026:

| Metrica | PHASE-TTC | Garl-TTC |
|---|---|---|
| Overall MiD | 35,80145 | 45,03 |
| Reduccion relativa | 20,49 % | referencia |
| Tokens puntuados | 6.762 | no disponible |
| Fallos definidos por el scorer | 0 % | no disponible |

Los 6.762 tokens incluyen 5.805 consultas físicas y alias. En la cohorte de transferencia corregida de EvTTC (460 consultas elegibles de 508 candidatas fijas en 32 secuencias expuestas en desarrollo), la fusión original mejora el MAE agrupado (0,8130 s frente a 0,8513 s de RGB) y el error p95, mientras que RGB obtiene mejor mediana y mejor error relativo; los intervalos de confianza pareados a nivel de secuencia incluyen el cero. Estos datos de transferencia y la evaluación de adaptación separada de 434 consultas tienen denominadores y protocolos distintos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el tamaño del repositorio es de 0,1 GB, lo que sugiere un modelo ligero.
- GPU recomendadas: no se especifican modelos concretos; se indica compatibilidad con CUDA usando PyTorch 2.10.0 y torchvision 0.25.0.
- CPU: es el dispositivo por defecto; existe una instalación CPU-only documentada con `requirements-cpu-tested.txt` (versiones probadas en Windows con Python 3.12).
- Despliegue: carga mediante `predict.py` con el grafo PyTorch custom del repositorio; no es compatible con `transformers.AutoModel`, vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia: la reproducción temporizada publicada midió 29,14 ms p95 sobre 250 actualizaciones, por encima de un presupuesto de 20 ms; ese experimento no demuestra operación sostenida de sensor a salida a 50 Hz.

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros | Contexto / ventana | Rendimiento (Overall MiD) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PHASE-TTC | Fusion causal event + RGB con cabeza de fase | no disponible (cabeza de 1.955) | 650 ms causales | 35,80145 (GarlTTC Test, archivado) | MIT | Hugging Face |
| Garl-TTC | TTC desde eventos/RGB | no disponible | no disponible | 45,03 (GarlTTC Test, archivado) | no disponible | no disponible |
| PHASE-TTC-Adapt | PHASE-TTC + router de calidad geométrica entrenado con EvTTC | no disponible | no disponible | no disponible (no asociado a la puntuación oficial) | MIT (según repositorio del autor) | Hugging Face |

Solo se dispone de datos comparativos para Garl-TTC y la variante Adapt; no se han encontrado en la información proporcionada otras alternativas con especificaciones verificables.

## Limitaciones y advertencias

- Requiere observaciones event/RGB sincronizadas y calibradas, además de regiones de objeto suministradas externamente; un detector autónomo es un componente separado que no se incluye.
- Proporciona TTC firmado y diagnósticos, pero no probabilidades de colisión calibradas ni intervalos de incertidumbre.
- La latencia medida (29,14 ms p95 sobre 250 actualizaciones) supera el presupuesto de 20 ms y no demuestra operación sostenida a 50 Hz de sensor a salida.
- En la cohorte de transferencia de EvTTC, la fusión mejora el MAE agrupado y el p95, pero RGB obtiene mejor mediana y error relativo; los intervalos de confianza pareados incluyen el cero, por lo que la ventaja no es concluyente a nivel de secuencia.
- Los resultados del leaderboard son archivados (28 de octubre de 2026) y no constituyen una reevaluación de esta release ni una afirmación sobre el leaderboard actual.
- Una tasa de fallos del 0 % en un benchmark no implica certificación de seguridad ni garantía de despliegue.
- Los identificadores y sellos históricos conservan sus bytes originales; sus rutas o estados antiguos describen su creación, no el estado actual de la release.
- No se detallan sesgos conocidos ni riesgos de alucinación en el sentido lingüístico; al ser un modelo de percepción, el riesgo principal es el error de estimación en condiciones de sensor no cubiertas por el entrenamiento.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni certificación de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AlvaroSchwiedop/PHASE-TTC
- Variante Adapt: https://huggingface.co/AlvaroSchwiedop/PHASE-TTC-Adapt
- Paper y lector interactivo: https://schwiedop.com/papers/phase-ttc/
- Página del proyecto: https://schwiedop.com/PHASE-TTC/
- Código: https://github.com/Kripta-Studios/phase-ttc
- Leaderboard oficial (Codabench): https://www.codabench.org/competitions/17289/#/results-tab
- Demo con ejemplos grabados (Space): https://huggingface.co/spaces/AlvaroSchwiedop/PHASE-TTC
- Descarga del benchmark EvTTC: https://nail-hnu.github.io/EvTTC/download/download/
