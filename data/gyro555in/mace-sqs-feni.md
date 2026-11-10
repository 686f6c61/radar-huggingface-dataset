# gyro555in/MACE-sqs-FeNi

## Resumen

MACE-sqs-FeNi es un potencial interatómico de aprendizaje automático (machine-learned interatomic potential, MLIP) específico para aleaciones hierro-níquel (Fe-Ni), desarrollado por Kushal Ramakrishna, Mani Lokamani y Attila Cangi en el Helmholtz-Zentrum Dresden-Rossendorf (HZDR). No es un modelo de lenguaje: es un modelo de la familia MACE (Multi-Atomic Cluster Expansion) que predice energías y fuerzas de sistemas atómicos, sustituyendo cálculos DFT de primeros principios en simulaciones de dinámica molecular a una fracción del coste computacional.

El modelo se entrenó sobre datos DFT PBE con polarización de espín para estructuras cuasialeatorias especiales (SQS, special quasirandom structures) de Fe-Ni, cubriendo tanto la fase bcc como la fcc en todo el rango de composición. Su relevancia radica en que es un potencial específico de sistema que, según el autor, supera a los modelos fundacionales MACE (MP-0/MPA-0, OMAT, MatPES-PBE, MatPES-r2SCAN) en consistencia con DFT y con datos experimentales para ecuaciones de estado, volúmenes de equilibrio, constantes elásticas y expansión térmica.

El repositorio ocupa 1,5 GB y contiene los pesos del modelo en formato propio de MACE junto con la configuración asociada. La licencia es CC-BY-4.0, lo que permite uso comercial con atribución. El modelo se publica junto a un artículo en *Modelling and Simulation in Materials Science and Engineering* y a un archivo en Zenodo con el modelo, los datos DFT y los ficheros de análisis.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MACE (Multi-Atomic Cluster Expansion), red neuronal de tipo equivariante con expansión de clusters atómicos |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo atómico, no de lenguaje) |
| Tipos de cuantización | no disponible; inferencia en float64 (default_dtype="float64") según el ejemplo de uso |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | formato nativo MACE (`MACE-sqs.model`), cargable con `mace.calculators.MACECalculator` |
| Sistema químico | Fe-Ni (hierro-níquel), fases bcc y fcc, todo el rango de composición |
| Dataset de entrenamiento | gyro555in/fe-ni-sqs-dft (DFT PBE con polarización de espín) |
| Tamaño del repositorio | 1,5 GB |
| Versiones de software | mace-torch 0.3.13, ASE 3.25.0, torch-sim-atomistic 0.2.1 |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura MACE, una red neuronal equivariante que representa la energía de un sistema atómico mediante una expansión de clusters de orden superior con productos tensoriales de features atómicas. Esta formulación permite alcanzar precisión de tipo DFT con un coste de inferencia muy inferior al de un cálculo de primeros principios, y es adecuada para dinámica molecular de largo alcance temporal.

El entrenamiento se realizó sobre datos DFT con funcional PBE y polarización de espín, generados para estructuras cuasialeatorias especiales (SQS) de Fe-Ni que reproducen la aleatoriedad química de la aleación. El conjunto consta de 5115 configuraciones de entrenamiento y 1274 de validación. El modelo se entrenó únicamente con energías y fuerzas, sin información de tensiones (stresses), y no incorpora grados de libertad de espín explícitos; la magnetismo se captura de forma implícita a través de los datos DFT polarizados en espín. No se dispone de información sobre número de tokens equivalente, composición detallada del dataset ni uso de RLHF/DPO (no aplica a este tipo de modelo).

## Capacidades

- Predicción de energías potenciales y fuerzas atómicas para aleaciones Fe-Ni en fases bcc y fcc, en todo el rango de composición.
- Cálculo de ecuaciones de estado y volúmenes de equilibrio cerca de las condiciones de equilibrio.
- Predicción de respuesta elástica (constantes elásticas).
- Simulaciones de dinámica molecular a temperatura finita, incluyendo tendencias de expansión térmica.
- Integración con ASE mediante `MACECalculator`, lo que permite acoplarlo a flujos de trabajo estándar de simulación atomística.
- Inferencia en GPU (CUDA) con precisión float64.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No incorpora grados de libertad de espín explícitos ni fue entrenado con tensiones.

## Casos de uso

- Cálculo de ecuaciones de estado de aleaciones Fe-Ni: el modelo reproduce curvas energía-volumen cerca del equilibrio con un RMSE de 2,0-2,2 meV/átomo, lo que permite obtener volúmenes de equilibrio y módulos de bulk sin recurrir a DFT para cada composición.
- Predicción de constantes elásticas: adecuado para estimar la respuesta mecánica de Fe-Ni en fases bcc y fcc, con buena concordancia con DFT y experimento según el autor.
- Dinámica molecular a temperatura finita: permite simular la evolución temporal de sistemas Fe-Ni con coste muy inferior a DFT, útil para estudiar tendencias de expansión térmica y estabilidad de fases.
- Exploración de composiciones en todo el rango Fe-Ni: al cubrir el rango completo de composición, sirve para barridos sistemáticos de propiedades en función del contenido de níquel.
- Cribado de estructuras y relajaciones previas a cálculos DFT: puede usarse como pre-relajador para reducir el número de cálculos de primeros principios necesarios en flujos de trabajo multiescala.
- Estudio de transiciones de fase bcc-fcc: el modelo es fiable para la estabilidad relativa de ambas fases en condiciones cercanas al equilibrio, aunque no para la dependencia composicional de la presión de transición bcc-hcp.
- Docencia y prototipado en ciencia de materiales: al integrarse con ASE y estar bajo licencia CC-BY-4.0, es apto para entornos académicos y para construir flujos reproducibles.

## Benchmarks y rendimiento

| Conjunto | RMSE de energía | RMSE de fuerza |
|---|---|---|
| Entrenamiento (5115 configuraciones) | 2,2 meV/átomo | 22,0 meV/Å |
| Validación (1274 configuraciones) | 2,0 meV/átomo | 24,3 meV/Å |

El autor indica que, frente a los modelos fundacionales MACE (MP-0/MPA-0, OMAT, MatPES-PBE, MatPES-r2SCAN), MACE-sqs ofrece la concordancia más consistente con DFT y experimento para ecuaciones de estado, volúmenes de equilibrio, constantes elásticas y tendencias de expansión térmica en Fe-Ni bcc y fcc. No se proporcionan en la información disponible cifras numéricas comparativas adicionales de esos modelos fundacionales.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada; el tamaño del repositorio es de 1,5 GB, lo que da una cota superior del orden de los pesos, pero no se especifica el consumo en inferencia.
- GPU recomendadas: no disponible; el ejemplo de uso emplea `device="cuda"` sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; por el tamaño del modelo es plausible, pero no se aporta dato.
- Opciones de despliegue: `mace-torch` 0.3.13 con `MACECalculator` sobre ASE 3.25.0 y torch-sim-atomistic 0.2.1; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Sistema | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MACE-sqs-FeNi | MACE específico de sistema | Fe-Ni (bcc/fcc, todo el rango) | DFT PBE polarizado en espín, SQS, 5115 configs | CC-BY-4.0 | Hugging Face, Zenodo |
| MACE MP-0 / MPA-0 | MACE fundacional | Materiales generales | Datos masivos de Materials Project | no disponible en la información | no disponible en la información |
| MACE OMAT | MACE fundacional | Materiales generales | Dataset OMAT | no disponible en la información | no disponible en la información |
| MACE MatPES-PBE | MACE fundacional | Materiales generales | Dataset MatPES-PBE | no disponible en la información | no disponible en la información |
| MACE MatPES-r2SCAN | MACE fundacional | Materiales generales | Dataset MatPES-r2SCAN | no disponible en la información | no disponible en la información |

No se dispone de parámetros, contexto ni cifras de rendimiento detalladas de los modelos fundacionales en la información proporcionada; la comparación cualitativa se limita a la afirmación del autor de que MACE-sqs es más consistente con DFT y experimento para Fe-Ni.

## Limitaciones y advertencias

- No es fiable para la dependencia composicional de la presión de transición bcc-hcp: todos los modelos probados, incluido este, predicen un aumento incorrecto con el contenido de níquel, asociado al colapso magnético a alta presión.
- No incorpora grados de libertad de espín explícitos; el magnetismo se modela solo de forma implícita a través de los datos DFT polarizados.
- Entrenado únicamente con energías y fuerzas, sin tensiones: no debe usarse para predicciones que dependan directamente del tensor de tensiones.
- Específico de sistema: no es transferible a otros sistemas químicos fuera de Fe-Ni.
- Fiabilidad limitada a volúmenes cercanos al equilibrio; el comportamiento a alta presión queda fuera del dominio validado.
- Riesgo de extrapolación fuera del dominio de entrenamiento (composiciones, fases o condiciones termodinámicas no representadas en el dataset SQS).
- Licencia CC-BY-4.0: permite uso comercial con atribución; requiere citar el modelo y el artículo correspondientes.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación externa todavía limitado.
- Dependencia de versiones concretas de software (mace-torch 0.3.13, ASE 3.25.0, torch-sim-atomistic 0.2.1); cambios de versión pueden afectar a la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/gyro555in/MACE-sqs-FeNi
- Dataset de entrenamiento: https://huggingface.co/datasets/gyro555in/fe-ni-sqs-dft
- Artículo (arXiv): https://arxiv.org/abs/2605.28395
- Archivo Zenodo: https://doi.org/10.5281/zenodo.23484911
- Código: https://github.com/gyro555in/fe-ni-mace-sqs
- Repositorio MACE: https://github.com/ACEsuite/mace
