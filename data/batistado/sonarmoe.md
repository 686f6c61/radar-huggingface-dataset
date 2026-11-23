# batistado/SonarMoE

## Resumen

SonarMoE es un artefacto de investigación publicado por el usuario batistado que acompaña a un manuscrito académico titulado *SonarMoE: Remote Prompt and Tool-Schema Reconstruction via Cross-Node Expert Contention in Disaggregated MoE Serving and Differentially Private Mitigation*. No se trata de un modelo de lenguaje entrenado desde cero, sino de un paquete de referencia (implementación y material reproducible) que demuestra un ataque de canal lateral sobre infraestructuras de servicio de modelos Mixture-of-Experts (MoE) desagregadas, junto con una mitigación basada en privacidad diferencial denominada OblivDispatch.

El trabajo se apoya en dos modelos base: allenai/OLMoE-1B-7B-0924-Instruct (MoE de 1B parámetros activos y 7B totales) e ibm-granite/granite-3.1-1b-a400m-instruct (MoE de 1B totales con 400M activos). El repositorio incluye un benchmark propio (MoELeak-Bench) con 260 consultas de longitud constante, un Space interactivo de exploración y el archivo LaTeX del manuscrito enviado a IEEE TDSC.

Su relevancia radica en que expone un vector de fuga de información poco explorado en el despliegue de MoE con paralelismo experto (DeepEP) y serving desagregado: la contención de expertos entre nodos puede filtrar información sobre el prompt remoto y el esquema de herramientas (tool schema) del cliente. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB, lo que sugiere que los pesos no están alojados o que el paquete es fundamentalmente código y documentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre transformers; serving desagregado con DeepEP |
| Parametros totales | 7B (OLMoE-1B-7B) / 1B (Granite-3.1-1b-a400m) |
| Parametros activos | 1B (OLMoE) / 400M (Granite) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (tamano del repo: 0.0 GB) |

## Arquitectura y entrenamiento

El artefacto no describe el entrenamiento de un modelo nuevo, sino que reutiliza dos MoE instruct ya existentes como sujetos de estudio: OLMoE-1B-7B-0924-Instruct (AllenAI) y Granite-3.1-1b-a400m-instruct (IBM). La contribución técnica es el marco de ataque y mitigación: SonarMoE explota la contención de expertos entre nodos en un despliegue desagregado (expert parallelism con DeepEP) para reconstruir remotamente el prompt y el esquema de herramientas del cliente a partir de señales de canal lateral (side-channel) observables en el plano de servicio.

La mitigación propuesta, OblivDispatch, aplica privacidad diferencial al enrutamiento/despacho de tokens hacia expertos, con un compromiso de Pareto entre utilidad del modelo y fuga de información (representado en la figura `fig4_oblivdispatch_pareto_theory.png`). El paquete incluye la implementación de referencia instalable vía pip desde el repositorio GitHub del autor, el benchmark MoELeak-Bench (260 consultas de longitud constante) y el archivo LaTeX del manuscrito para IEEE TDSC. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO, ya que el foco es la seguridad del serving, no el entrenamiento.

## Capacidades

- Reproducción de un ataque de canal lateral (SonarMoE) sobre serving MoE desagregado con DeepEP.
- Reconstrucción remota de prompts y de esquemas de herramientas (tool schemas) a partir de contención de expertos entre nodos.
- Mitigación con privacidad diferencial (OblivDispatch) con análisis de compromiso utilidad-privacidad (Pareto).
- Benchmark reproducible: MoELeak-Bench con 260 consultas de longitud constante.
- Integración con Model Context Protocol (MCP) como superficie de ataque/estudio.
- Explorador interactivo (Space `batistado/SonarMoE-Explorer`) para inspeccionar resultados.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags).
- No se documentan capacidades de generación, razonamiento, código, visión, tool calling ni agentes propias; estas dependen de los modelos base subyacentes.

## Casos de uso

- Auditoría de seguridad de infraestructuras MoE desagregadas: usar SonarMoE para evaluar si un despliegue con DeepEP filtra información del prompt a través de la contención de expertos entre nodos, antes de ponerlo en producción.
- Evaluación de privacidad en serving multi-tenant: reproducir el ataque con MoELeak-Bench para cuantificar la fuga de información entre inquilinos que comparten clúster de expertos.
- Validación de mitigaciones con privacidad diferencial: aplicar OblivDispatch y medir el compromiso entre calidad de respuesta y fuga residual, usando la curva de Pareto del manuscrito como referencia.
- Investigación académica reproducible: el paquete incluye el LaTeX de IEEE TDSC y el benchmark, lo que permite replicar resultados y extender el estudio a otros MoE (por ejemplo, sustituyendo los modelos base).
- Protección de esquemas de herramientas en agentes: estudiar cómo un atacante podría reconstruir el tool schema de un agente remoto vía MCP y diseñar contramedidas en el plano de despacho.
- Formación y divulgación: el Space interactivo y el repositorio GitHub permiten demostrar el ataque y la mitigación en entornos controlados con fines docentes.
- Selección de topologías de serving: comparar configuraciones de expert parallelism y desagregación para minimizar superficie de canal lateral manteniendo throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio referencia una figura de compromiso de Pareto (`fig4_oblivdispatch_pareto_theory.png`) y un benchmark propio (MoELeak-Bench), pero no se incluyen cifras numéricas de MMLU, HumanEval, GSM8K ni métricas de fuga en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base elegido (OLMoE-1B-7B o Granite-3.1-1b-a400m) y de la cuantización, que no se documenta.
- GPU recomendadas: no disponible. El escenario de estudio es serving desagregado multi-nodo con DeepEP, lo que implica clústeres con GPUs de datacenter (tipo A100/H100), pero no se especifican modelos concretos.
- ¿Cabe en GPU consumer? No disponible; los modelos base (1B–7B) son en principio aptos para GPUs consumer, pero el artefacto no documenta requisitos.
- Opciones de despliegue: el paquete se instala vía `pip install git+https://github.com/batistado/sonarmoe.git`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. SonarMoE no es un modelo de propósito general comparable a otros LLM, sino un artefacto de investigación sobre seguridad de serving MoE. Sus modelos base sí son comparables:

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia |
|---|---|---|---|---|
| OLMoE-1B-7B-0924-Instruct | 7B | 1B | no disponible | Apache 2.0 |
| Granite-3.1-1b-a400m-instruct | 1B | 400M | no disponible | Apache 2.0 |
| SonarMoE (artefacto) | no aplica | no aplica | no disponible | Apache 2.0 |

## Limitaciones y advertencias

- No es un modelo listo para producción: es un paquete de investigación (implementación de ataque y mitigación), no un LLM desplegable.
- El repositorio tiene 0 descargas, 0 likes y 0.0 GB de tamaño; los pesos pueden no estar alojados y la reproducibilidad depende del repositorio GitHub.
- No se documentan idiomas soportados, contexto, cuantizaciones ni formato de pesos.
- El uso de las técnicas de ataque debe restringirse a entornos controlados y con autorización; aplicarlas contra infraestructuras de terceros puede ser ilegal.
- La licencia Apache 2.0 permite uso comercial del código, pero no se ofrecen garantías sobre los modelos base ni sobre la eficacia de la mitigación en todos los despliegues.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; dependen de los modelos base.
- La mitigación OblivDispatch introduce un compromiso de utilidad que debe medirse por caso de uso; no se garantiza fuga cero.

## Enlaces

- Hugging Face (modelo): https://huggingface.co/batistado/SonarMoE
- Dataset MoELeak-Bench: https://huggingface.co/datasets/batistado/MoELeak-Bench
- Space interactivo: https://huggingface.co/spaces/batistado/SonarMoE-Explorer
- Repositorio GitHub: https://github.com/batistado/sonarmoe
- Archivo LaTeX IEEE TDSC: `sonarmoe_tdsc_overleaf.zip` (referenciado en la model card)
- Modelo base OLMoE: https://huggingface.co/allenai/OLMoE-1B-7B-0924-Instruct
- Modelo base Granite: https://huggingface.co/ibm-granite/granite-3.1-1b-a400m-instruct
