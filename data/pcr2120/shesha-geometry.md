# pcr2120/shesha-geometry

## Resumen

Shesha es un framework de métricas para medir la **estabilidad geométrica** de representaciones aprendidas, una dimensión distinta de la similaridad tradicional. Mientras que los análisis convencionales se centran en cuán alineadas están las representaciones con referencias externas, Shesha cuantifica cómo de robusta es la geometría interna de dichas representaciones bajo perturbaciones. El trabajo, desarrollado por Prashant C. Raju, demuestra que estabilidad y similaridad son empíricamente independientes (ρ ≈ 0.01) tras evaluar 2.463 configuraciones en siete dominios, lo que convierte a Shesha en una herramienta complementaria necesaria para auditar representaciones en sistemas biológicos y computacionales.

La relevancia actual de Shesha radica en sus aplicaciones prácticas: actúa como un "canario geométrico" que detecta deriva estructural en modelos con casi el doble de sensibilidad que CKA, predice la capacidad de steering lineal con alta correlación (ρ = 0.89–0.96), y revela el "impuesto geométrico" que la optimización por transferencia impone sobre las representaciones. El framework se distribuye como librería Python instalable vía pip, con módulos especializados para análisis de LLMs (shesha), supervisado (shesha.supervised) y biología computacional (shesha.bio).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Framework de métricas sobre representaciones (agnóstico al modelo subyacente) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Librería Python (PyPI: shesha-geometry) |

## Arquitectura y entrenamiento

Shesha no es un modelo fundacional sino un framework de evaluación. Su núcleo conceptual define la estabilidad geométrica como la consistencia de la geometría representacional bajo perturbaciones controladas. La métrica base (self-consistency) mide cuánto cambia la estructura geométrica de un espacio de representaciones cuando se aplican transformaciones o ruido, sin depender de referencias externas. Las variantes supervisadas (`supervised_alignment`, `lda_stability`, `variance_ratio`, `class_separation_ratio`) incorporan información de etiquetas para predecir propiedades como la steerabilidad lineal o la deriva estructural.

El framework fue validado empíricamente en 2.463 configuraciones distribuidas en siete dominios, que incluyen modelos de lenguaje, sistemas biológicos y redes neuronales. Los resultados muestran que la estabilidad geométrica es ortogonal a la similaridad (ρ ≈ 0.01), lo que sugiere que los análisis tradicionales basados únicamente en similaridad omiten una dimensión crítica de la salud de las representaciones. La implementación está disponible como librería Python con módulos específicos para LLMs, análisis supervisado y biología computacional (CRISPR).

## Capacidades

- Medición de estabilidad geométrica de representaciones mediante métricas de auto-consistencia bajo perturbaciones.
- Detección de deriva estructural en modelos: actúa como canario geométrico con sensibilidad casi 2× superior a CKA.
- Predicción de steerabilidad lineal supervisada con correlaciones entre ρ = 0.89 y ρ = 0.96.
- Evaluación del "impuesto geométrico" que la optimización por transferencia impone sobre las representaciones.
- Análisis de coherencia geométrica en perturbaciones CRISPR de célula única para revelar arquitectura regulatoria y predecir estrés celular.
- Módulo `shesha.supervised` con métricas supervisadas (LDA stability, variance ratio, class separation ratio) para análisis con etiquetas.
- Módulo `shesha.bio` para aplicaciones en biología computacional y acoplamiento neural-conductual.

## Casos de uso

- **Monitorización de deriva en producción**: Shesha puede integrarse en pipelines de CI/CD para MLops, detectando cambios estructurales en las representaciones de modelos desplegados antes de que afecten al rendimiento. Su sensibilidad 2× superior a CKA permite alertar antes ante degradaciones sutiles.
- **Auditoría de seguridad de modelos**: el framework permite evaluar si las representaciones internas de un LLM son geométricamente estables ante perturbaciones adversariales o cambios de prompting, complementando análisis de similaridad tradicionales.
- **Selección de modelos para fine-tuning**: al disociar estabilidad de transferibilidad, Shesha ayuda a identificar qué modelos base mantendrán representaciones robustas tras ser adaptados a dominios específicos, evitando el "impuesto geométrico" de la transferencia.
- **Predicción de steerabilidad**: los investigadores pueden usar las métricas supervisadas para predecir si un modelo será fácilmente dirigible mediante técnicas de steering lineal, con correlaciones de hasta ρ = 0.96, antes de invertir en costosos experimentos.
- **Análisis de datos CRISPR en biología computacional**: el módulo `shesha.bio` permite analizar la coherencia geométrica de perturbaciones genéticas a nivel de célula única, revelando arquitectura regulatoria y prediciendo estrés celular.
- **Investigación en interpretabilidad**: Shesha proporciona una nueva dimensión de análisis para estudios mecanicistas, permitiendo correlacionar estabilidad geométrica con comportamiento funcional de circuitos internos en LLMs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos tradicionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los resultados reportados se centran en métricas específicas del framework:

| Métrica | Resultado |
|---|---|
| Correlación estabilidad-similaridad | ρ ≈ 0.01 (empíricamente independientes) |
| Sensibilidad de detección de deriva vs CKA | ~2× mayor |
| Correlación estabilidad supervisada vs steerabilidad lineal | ρ = 0.89–0.96 |
| Configuraciones evaluadas | 2.463 en siete dominios |

## Requisitos de hardware

- Al ser una librería de análisis y no un modelo de inferencia, los requisitos de hardware dependen del modelo cuyas representaciones se estén evaluando.
- Para análisis de representaciones de LLMs, se requiere acceso a las activaciones internas del modelo, por lo que la VRAM necesaria es la del modelo evaluado (por ejemplo, 24 GB para un modelo de 7B en FP16).
- La librería en sí es ligera y puede ejecutarse en CPU para datasets de representaciones moderados.
- Para análisis a gran escala (miles de configuraciones), se recomienda GPU con al menos 16 GB de VRAM para acelerar los cálculos geométricos.
- El despliegue es directo: `pip install shesha-geometry` y ejecución como librería Python estándar.

## Comparativa con modelos similares

| Característica | Shesha | CKA (Centered Kernel Alignment) | SVCCA (Singular Vector CCA) |
|---|---|---|---|
| Tipo de análisis | Estabilidad geométrica | Similaridad de representaciones | Similaridad de representaciones |
| Dependencia de referencias externas | No | Sí | Sí |
| Sensibilidad a deriva estructural | ~2× mayor que CKA | Base | no disponible |
| Correlación con steerabilidad | ρ = 0.89–0.96 | no disponible | no disponible |
| Aplicaciones biológicas | Sí (módulo bio) | No | No |
| Licencia | MIT | Depende de implementación | Depende de implementación |

## Limitaciones y advertencias

- El framework es reciente (publicado en 2026) y su adopción en producción aún no está ampliamente validada fuera de los dominios de investigación reportados.
- La métrica de estabilidad geométrica requiere acceso a representaciones internas del modelo, lo que puede no estar disponible para modelos propietarios o servicios API cerrados.
- Las variantes supervisadas requieren datos etiquetados, lo que puede limitar su aplicación en escenarios no supervisados.
- La correlación entre estabilidad y rendimiento downstream no está establecida; un modelo geométricamente estable no es necesariamente más preciso.
- La licencia MIT permite uso comercial sin restricciones, pero los papers asociados deben citarse apropiadamente según las indicaciones del autor.
- No se proporcionan garantías sobre el rendimiento en dominios fuera de los siete evaluados en la investigación original.

## Enlaces

- [HuggingFace: pcr2120/shesha-geometry](https://huggingface.co/pcr2120/shesha-geometry)
- [Paper fundacional: arXiv:2601.09173](https://arxiv.org/abs/2601.09173)
- [Paper LLM steering y drift: arXiv:2604.17698](https://arxiv.org/abs/2604.17698)
- [Paper biología: arXiv:2604.16642](https://arxiv.org/abs/2604.16642)
- [Repositorio GitHub](https://github.com/prashantcraju/geometric-stability)
- [PyPI: shesha-geometry](https://pypi.org/project/shesha-geometry/)
- [DOI Zenodo](https://doi.org/10.5281/zenodo.18227453)
