# anonboltzinterp/Boltz1-SAEs-L2-Diffusion

## Resumen

Este repositorio contiene un conjunto de sparse autoencoders (SAEs) TopK entrenados sobre las activaciones del módulo de difusión de coordenadas de Boltz-1, un modelo open-source de predicción de estructuras biomoleculares. El trabajo se publica para revisión anónima doble ciego, sin autoría ni afiliación asociadas, y forma parte de un análisis de interpretabilidad mecanicista del modelo base. Los SAEs se muestrean en tres puntos de la trayectoria de denoising (rec0, rec10 y rec50) y en siete capas del `DiffusionTransformer`, lo que permite estudiar cómo cambian las representaciones internas durante el proceso de generación de estructuras.

La arquitectura de cada SAE es TopK con k=256, una anchura latente de 2048 y una anchura de entrada de 768, notablemente mayor que los 384 usados en los SAEs del trunk (repositorios complementarios). Se entrenaron durante 500 000 pasos con un peso de regularización L2 de 3e-3, preprocesamiento con resta de la media del conjunto de entrenamiento y decoder unit-normalizado. El repositorio contiene 60 ejecuciones (runs) que cubren una combinación de pasos, capas y semillas, aunque no forma un grid completo. El tamaño total del repositorio es de 2.3 GB, correspondiente a los checkpoints y metadatos de los SAEs.

La relevancia de este modelo radica en que proporciona una herramienta para diseccionar el comportamiento de un modelo de predicción de estructuras de vanguardia, permitiendo identificar qué características biológicas codifica cada capa y cómo evolucionan a lo largo del proceso de difusión. Esto abre la puerta a intervenciones de edición de representaciones y a una mejor comprensión de los mecanismos internos de Boltz-1.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TopK sparse autoencoder (SAE) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no aplica (checkpoints en precisión completa) |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | PyTorch (.pt), NumPy (.npy), JSON (.json) |

## Arquitectura y entrenamiento

Cada SAE sigue la arquitectura TopK con un número fijo de features activas (k=256). La capa de entrada tiene una dimensión de 768, que corresponde a las activaciones del módulo de difusión de Boltz-1, y la capa latente tiene una anchura de 2048. El preprocesamiento consiste en restar el vector medio del conjunto de entrenamiento antes de la codificación, y el decoder se normaliza a norma unitaria. El entrenamiento se realizó durante 500 000 pasos con una pérdida de reconstrucción y una regularización L2 de 3e-3 sobre los pesos. Se utilizaron tres semillas aleatorias por capa para evaluar la robustez de los resultados.

Los SAEs se entrenaron sobre activaciones muestreadas en tres pasos del proceso de denoising de Boltz-1: `rec0`, `rec10` y `rec50`. Se cubren siete capas del `DiffusionTransformer` (0, 2, 4, 10, 14, 18 y 22), aunque no todas las combinaciones están presentes: la capa 10 falta en el paso `rec10`. Cada ejecución se almacena en un directorio con la estructura `rec<STEP>/layer<L>/`, donde `rec` indica el paso de denoising, no un índice de reciclaje. No se aplicaron técnicas de RLHF ni DPO; el entrenamiento es puramente no supervisado sobre las activaciones del modelo base.

## Capacidades

- Interpretabilidad mecanicista: descompone las activaciones del módulo de difusión de Boltz-1 en features latentes discretas (TopK), facilitando el análisis de qué información biológica se codifica en cada capa.
- Análisis de la dinámica del denoising: al muestrear en tres pasos de la trayectoria, permite estudiar cómo cambian las representaciones a lo largo del proceso de generación de estructuras.
- Comparación entre módulos: junto con los SAEs del trunk (repositorios `rec0` y `rec1`), posibilita contrastar las representaciones del par de transformadores (Pairformer) con las del módulo de difusión.
- Reproducibilidad: incluye configuraciones, checkpoints, métricas de evaluación y estadísticas por ejecución, lo que facilita la reproducción de los experimentos del preprint asociado.
- No es un modelo generativo: no genera texto, código ni estructuras; su función es exclusivamente analítica.

## Casos de uso

- Investigación en biología estructural: los SAEs permiten identificar qué features latentes corresponden a motivos estructurales, interacciones moleculares o restricciones geométricas aprendidas por Boltz-1, ayudando a entender cómo el modelo representa la biología.
- Estudio de la dinámica del denoising: comparando los SAEs de `rec0`, `rec10` y `rec50`, se puede observar cómo las representaciones se refinan desde ruido inicial hasta estructuras coherentes, lo que puede guiar mejoras en el proceso de muestreo.
- Edición de representaciones (steering): aunque no se documenta explícitamente, los SAEs podrían usarse para intervenir en las activaciones latentes y modificar propiedades específicas de las estructuras predichas, una técnica común en interpretabilidad.
- Validación de métodos de interpretabilidad: sirve como banco de pruebas para nuevas técnicas de análisis de SAEs en dominios no lingüísticos, como la biología estructural.
- Reproducción de experimentos académicos: el repositorio incluye todos los artefactos necesarios para replicar los análisis del preprint "Where a folding model keeps biology: probing and sparse-autoencoder analysis of the Boltz-1 trunk and diffusion module".
- Comparación con SAEs del trunk: al existir repositorios complementarios para el Pairformer, se pueden realizar estudios comparativos entre módulos para entender la división de funciones en el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de rendimiento en tareas de predicción de estructuras ni comparaciones con otros SAEs. Las únicas métricas disponibles son las de evaluación interna de cada SAE (pérdida de reconstrucción, etc.) almacenadas en los archivos `eval_step_500000.json`, pero no se proporcionan valores agregados.

## Requisitos de hardware

- Los checkpoints individuales de cada SAE (archivo `checkpoint_step_500000.pt`) tienen un tamaño moderado; el repositorio completo ocupa 2.3 GB, pero cada ejecución es mucho menor.
- Dado que la dimensión de entrada es 768 y la latente 2048, la inferencia de un SAE es computacionalmente ligera y puede ejecutarse en CPU sin problemas.
- No se especifican requisitos de VRAM ni GPU recomendadas. Para cargar y evaluar un SAE individual, una GPU con al menos 2 GB de VRAM sería suficiente, aunque no hay datos oficiales.
- El despliegue no requiere infraestructura especial; se puede realizar con PyTorch estándar y `huggingface_hub` para la descarga de archivos.
- No se proporcionan estimaciones de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el contexto de SAEs para módulos de difusión de predicción de estructuras. Existen SAEs para modelos de lenguaje (p. ej., GPT-2, Llama) y para modelos de visión, pero no son directamente comparables debido a la naturaleza específica del dominio y a la falta de benchmarks comunes. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El repositorio se publica para revisión anónima doble ciego, por lo que no hay información sobre la autoría, afiliación institucional ni financiación. Esto puede limitar la trazabilidad y la confianza en la metodología.
- La licencia no está especificada, lo que genera incertidumbre sobre el uso comercial o la redistribución de los pesos. Se recomienda contactar con los autores (si se revelan) antes de un uso productivo.
- La cobertura de capas y pasos no es completa: falta la capa 10 en el paso `rec10`, lo que impide un análisis uniforme de todas las combinaciones.
- Los SAEs están entrenados sobre las activaciones de Boltz-1, por lo que su validez depende de la calidad y las limitaciones del modelo base. Cualquier sesgo o error en Boltz-1 se reflejará en las features aprendidas.
- No se proporcionan métricas de rendimiento ni validación externa, por lo que la utilidad práctica de estos SAEs para tareas de edición o análisis no está demostrada.
- Al ser un modelo de interpretabilidad, no tiene capacidades de generación de texto ni de razonamiento; su uso se limita al análisis de activaciones.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/anonboltzinterp/Boltz1-SAEs-L2-Diffusion
- Repositorio espejo (evolve-away): https://huggingface.co/evolve-away/Boltz1-SAEs-L2-Diffusion
- Colección de SAEs de Boltz: https://huggingface.co/collections/evolve-away/boltz-saes
- Repositorio oficial de Boltz-1 en GitHub: https://github.com/rles001/boltz1
- Sitio web de Boltz: https://boltz.bio/
- Preprint asociado (mencionado en la búsqueda): "Where a folding model keeps biology: probing and sparse-autoencoder analysis of the Boltz-1 trunk and diffusion module" (sin enlace directo disponible)
