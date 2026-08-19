# eduzrh/EvoRM

## Resumen

EvoRM (Evolvable Neuro-Symbolic Reasoning Framework) es un framework de razonamiento neuro-simbólico para tareas de emparejamiento de entidades (entity matching) y emparejamiento de esquemas (schema matching). Desarrollado por el usuario eduzrh, combina las capacidades de razonamiento de los modelos de lenguaje grandes (LLM) con la eficiencia de reglas simbólicas, reduciendo el número de llamadas al LLM sin sacrificar precisión. El framework se integra como un plugin con cualquier pipeline basado en LLM, ofreciendo una arquitectura modular de cuatro componentes principales: RuleEncoding, HypergraphStorage, TwoStageInferenceController y RuleMaintenance, más un MLP Gate opcional para el enrutamiento neuronal.

La relevancia de EvoRM radica en su enfoque híbrido que permite un aprendizaje continuo: las reglas simbólicas se generan a partir de las decisiones del LLM, se almacenan en un hipergrafo ponderado y se actualizan dinámicamente con cada inferencia. Esto reduce los costes de cómputo y mejora la escalabilidad en escenarios de producción con grandes volúmenes de datos. El framework se publica bajo licencia MIT y está disponible en HuggingFace, aunque no se trata de un modelo de lenguaje preentrenado, sino de un conjunto de código y wrappers para integrarse con LLMs externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Neuro-simbólica: RuleEncoding, HypergraphStorage, TwoStageInferenceController, RuleMaintenance, MLP Gate opcional |
| Parametros totales | No aplica (framework, no modelo preentrenado) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible (depende del LLM subyacente) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible (depende del LLM subyacente) |
| Licencia | MIT |
| Formato de pesos | No aplica (código Python, no pesos de red neuronal) |

## Arquitectura y entrenamiento

EvoRM no es un modelo preentrenado, sino un framework que se acopla a LLMs existentes. Su arquitectura se compone de cuatro módulos:

1. **RuleEncoding**: destila las decisiones del LLM en reglas estructuradas de lógica de primer orden (FOL).
2. **HypergraphStorage**: almacena las reglas en un hipergrafo ponderado, junto con índices de contexto de entidades.
3. **TwoStageInferenceController**: divide la inferencia en dos etapas. La primera (Stage 1) aplica un filtrado simbólico rápido y de alta confianza; la segunda (Stage 2) invoca al LLM solo para los casos no resueltos.
4. **RuleMaintenance**: realiza un seguimiento dinámico de la confianza de cada regla y una optimización periódica.

El componente opcional MLP Gate (gϕ) permite un enrutamiento neuronal entre las dos etapas, aprendiendo cuándo confiar en las reglas simbólicas y cuándo delegar al LLM. El framework no requiere entrenamiento propio; las reglas se generan y actualizan durante la inferencia, lo que constituye un mecanismo de aprendizaje continuo. No se especifican datos de entrenamiento ni número de tokens, ya que no hay un modelo base.

## Capacidades

- Emparejamiento de entidades (Entity Resolution): identifica registros duplicados en bases de datos, con soporte para los baselines MatchGPT y Anymatch.
- Emparejamiento de esquemas (Schema Matching): alinea columnas o atributos entre esquemas heterogéneos, con wrappers para Matchmaker y Rematch.
- Enlazado de entidades (Entity Linking): conecta menciones con entidades en un conocimiento base, mediante el wrapper LELA.
- Alineación de entidades (Entity Alignment): encuentra entidades equivalentes entre diferentes grafos de conocimiento, con wrappers para ChatEA y AdaCoAgentEA.
- Inferencia en dos etapas: reduce llamadas al LLM al enrutar decisiones de alta confianza mediante reglas simbólicas.
- Aprendizaje continuo: las reglas evolucionan con cada inferencia, construyendo una base de conocimiento incremental.
- Configuración flexible: umbrales ajustables (theta_hi, theta_prune, alpha, beta) para controlar el equilibrio entre precisión y coste.

## Casos de uso

- **Limpieza de datos en almacenes de datos**: EvoRM puede integrarse en pipelines de ETL para detectar y fusionar registros duplicados en grandes volúmenes de datos, reduciendo el coste de las llamadas a LLM gracias al filtrado simbólico en la primera etapa. Por ejemplo, en la integración de datos de clientes de diferentes sistemas CRM.
- **Integración de bases de datos de comercio electrónico**: para emparejar productos entre catálogos de distintos proveedores (como Amazon-Google o Walmart-Amazon), el framework puede aprender reglas específicas de cada dominio y aplicarlas de forma eficiente, manteniendo una alta precisión (F1 superior a 0.97 en los datasets reportados).
- **Enlazado de entidades en grafos de conocimiento**: en aplicaciones de búsqueda semántica o respuesta a preguntas, EvoRM puede conectar menciones de texto con entidades de un knowledge base, utilizando el wrapper LELA sobre datasets como ZESHEL.
- **Alineación de ontologías en sistemas de salud**: para armonizar esquemas de datos clínicos (por ejemplo, MIMIC y SYNTHEA), el framework alcanza un F1 perfecto (1.0) con una tasa de enrutamiento en Stage 1 del 40-80%, lo que reduce drásticamente la dependencia del LLM.
- **Automatización de la gestión de datos maestros (MDM)**: en entornos empresariales, EvoRM puede mantener un registro maestro de entidades (clientes, productos, proveedores) actualizándose continuamente con nuevas reglas extraídas de las decisiones del LLM, mejorando la calidad de los datos con el tiempo.
- **Investigación en integración de datos**: el framework sirve como plataforma de experimentación para comparar estrategias neuro-simbólicas en tareas de entity matching, proporcionando wrappers para seis baselines y catorce datasets públicos.

## Benchmarks y rendimiento

Los resultados presentados en la model card corresponden a la versión V5 del framework, reportados por el autor sobre varios datasets. No se comparan con otros frameworks, sino que muestran la mejora sobre los baselines.

### Entity Resolution (con MatchGPT)

| Dataset | Baseline F1 | +EvoRM F1 | Δ | Tasa Stage 1 |
|---|---|---|---|---|
| DBLP-ACM | 1.0000 | 1.0000 | 0.00 | 16.7% |
| DBLP-GoogleScholar | 0.9474 | 0.9474 | 0.00 | 13.3% |
| Walmart-Amazon | 0.9714 | 0.9714 | 0.00 | 13.3% |
| Amazon-Google | 0.9756 | 0.9756 | 0.00 | 0% |

### Schema Matching

| Dataset | Baseline | Baseline F1 | +EvoRM F1 | Tasa Stage 1 |
|---|---|---|---|---|
| MIMIC | matchmaker | 0.9697 | **1.0000** | 40% |
| SYNTHEA | matchmaker | 0.9697 | **1.0000** | 80% |
| SYNTHEA | rematch | 0.9697 | **1.0000** | 66.7% |

En entity resolution, la tasa de Stage 1 es baja (0-16.7%), lo que indica que el filtrado simbólico no logra capturar suficientes casos de alta confianza en esos conjuntos, aunque no degrada el F1. En schema matching, la mejora es notable y la tasa de enrutamiento es alta, lo que demuestra una reducción significativa de llamadas al LLM.

## Requisitos de hardware

Al ser un framework que se integra con LLMs externos, los requisitos de hardware dependen del LLM subyacente utilizado. EvoRM en sí no requiere GPU específica; su ejecución es ligera (almacenamiento de reglas, hipergrafo y controlador de inferencia). Los requisitos prácticos son:

- **CPU y memoria**: suficiente para mantener el hipergrafo y las estructuras de reglas en RAM (tamaño del repositorio 5.2 GB, aunque esto incluye el código y posiblemente los wrappers).
- **Dependencia del LLM**: para la Stage 2, se necesita acceso a un LLM (por ejemplo, a través de API de OpenAI o un modelo local). Si se usa un LLM local, se requieren las GPUs correspondientes según el tamaño del modelo.
- **Almacenamiento**: el estado persistente de EvoRM (reglas y contexto) se guarda en un directorio local (`persistence_dir`), que puede crecer con el tiempo.
- **Opciones de despliegue**: al ser código Python, puede ejecutarse en cualquier entorno con las dependencias instaladas. No se mencionan integraciones específicas con vLLM, llama.cpp u otros servidores de inferencia; se espera que el usuario conecte su propio cliente LLM.

## Comparativa con modelos similares

No se dispone de información sobre frameworks comparables en la documentación proporcionada. EvoRM se presenta como una solución única que combina reglas simbólicas con LLMs, pero no se ofrecen comparaciones con otros sistemas neuro-simbólicos de entity matching. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Dependencia de un LLM externo**: el rendimiento de la Stage 2 está condicionado al LLM utilizado; si el LLM falla o tiene sesgos, el framework hereda esos problemas.
- **Tasa de enrutamiento variable**: en algunos datasets de entity resolution, la tasa de Stage 1 es muy baja (0% en Amazon-Google), lo que limita el ahorro de llamadas al LLM en esos escenarios.
- **Sobreajuste a datasets específicos**: los resultados reportados (especialmente en schema matching) son muy altos (F1=1.0), lo que podría indicar un ajuste fino de los umbrales a esos conjuntos; la generalización a otros dominios no está garantizada.
- **Sin información sobre idiomas**: la model card no especifica los idiomas soportados; el framework en sí es agnóstico al idioma, pero depende del LLM subyacente.
- **Licencia MIT**: permite uso comercial y modificación, pero no incluye garantías implícitas; el usuario es responsable de la aplicación en producción.
- **Escalabilidad del hipergrafo**: aunque el almacenamiento en hipergrafo es eficiente, el crecimiento continuo de reglas podría requerir estrategias de poda adicionales para mantener el rendimiento en despliegues a largo plazo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/eduzrh/EvoRM
- Cita del paper (según la model card): EvoRM: Evolvable Neuro-Symbolic Reasoning for Entity Matching, IEEE TKDE, 2024. (No se proporciona enlace directo al artículo).
