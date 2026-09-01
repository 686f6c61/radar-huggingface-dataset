# deeprcurs/MBG-1.0

## Resumen

MBG 1.0 (Model Bahasa Garuda) es un proyecto de investigacion de deepRcurs Labs, desarrollado por Mzed Imamkh, que explora una arquitectura de lenguaje denominada "Omni-Sparse Hybrid". Se trata de un modelo experimental que combina un nucleo SSM/MLA (Mamba-2 con atencion latente multi-cabeza estilo DeepSeek), capas MoE de grano fino y pesos ternarios {-1,0,1} estilo BitNet, con un controlador de razonamiento llamado Trinity-Mirror. El repositorio actual aloja los checkpoints de validacion de los niveles L0 (0,17M) y L1 (17M), siendo este ultimo el peso canonico en safetensors.

El modelo resuelve un problema de investigacion: validar la escalabilidad de una arquitectura hibrida con enrutamiento de expertos sin perdida auxiliar, optimizacion de bajo rango (GaLore-Unbiased + Muon) y pesos ternarios en las FFN-MoE. Su relevancia radica en que propone un patron de escalado por escalones (0,17M → 17M → 1,7B → 45B) y una metodologia de validacion incremental. Sin embargo, es un prototipo de investigacion, no un modelo listo para produccion: los niveles superiores (L2 y mas alla) estan planificados pero no implementados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Omni-Sparse Hybrid (SSM Mamba-2 + MLA + MoE ternario) |
| Parametros totales | 17.055.808 (segun safetensors); 16.748.928 (segun model card para L1) |
| Parametros activos | 17M (L1); 0,17M (L0) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (checkpoints .pt y safetensors); pesos ternarios en FFN-MoE |
| Idiomas soportados | no disponible (dataset de entrenamiento en ingles) |
| Licencia | Apache-2.0 (placeholder; la model card indica que la licencia final esta por decidir) |
| Formato de pesos | safetensors, .pt (checkpoints completos en bf16) |

## Arquitectura y entrenamiento

La arquitectura objetivo, descrita en el blueprint rev-3, intercala capas Mamba-2/SSM con capas MLA (atencion latente multi-cabeza con compresion de KV) y FFN-MoE de grano fino. El enrutamiento de expertos es "aux-loss-free" con sesgo de enrutamiento, y los pesos de las FFN-MoE son ternarios {-1,0,1}, mientras que embeddings, atencion y router se mantienen en BF16. El controlador Trinity-Mirror encadena tres procesadores (Thinker → Critic → Refiner) con un bucle acotado, calibracion de confianza y un "ledger espejo" auditable. Los tokens de consulta (inquiry tokens) enrutan sondas hacia expertos especializados.

El entrenamiento utiliza el optimizador GUM (GaLore-Unbiased + Muon), que combina la eficiencia FLOP de Muon con el ahorro de memoria de bajo rango de GaLore, reduciendo el estado del optimizador en ~72% (estado/parametro ≈ 2,2 B). El dataset de entrenamiento (en ingles) se publica en un repositorio separado (`deeprcurs/MBG-1.0-data`). Los checkpoints L0 y L1 se generaron con el prototipo `mbg_mini_gpt.py`, que ejercita el mismo mecanismo de MoE, enrutamiento por sondas y optimizador GUM que se usaria en la arquitectura completa. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion.

## Capacidades

- Generacion de texto basica: el modelo L1 (17M) es capaz de producir texto, pero su tamano reducido limita severamente la calidad y coherencia en tareas complejas.
- Razonamiento multi-paso: el controlador Trinity-Mirror esta disenado para encadenar pensamiento, critica y refinamiento, aunque esta capacidad solo se ha validado a nivel de prototipo.
- Enrutamiento de expertos: el modelo incorpora MoE con enrutamiento por sondas (probe→expert coupling), lo que permite activar subconjuntos de parametros segun la consulta.
- Optimizacion de bajo rango: el uso de GUM (GaLore + Muon) es una innovacion de entrenamiento, no una capacidad de inferencia, pero permite entrenar con menos memoria.
- Pesos ternarios: las FFN-MoE usan pesos {-1,0,1}, lo que podria habilitar inferencia eficiente en hardware especializado, aunque no se proporcionan implementaciones de despliegue.
- Multilingue: no hay datos de idiomas soportados; el corpus de entrenamiento es en ingles.
- Tool calling / function calling: no disponible.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Investigacion academica en arquitecturas hibridas: el modelo sirve como banco de pruebas para estudiar la interaccion entre SSM, MLA y MoE ternario. Un investigador puede cargar los pesos safetensors y reproducir los experimentos de validacion descritos en los informes del repositorio.
- Validacion de tecnicas de optimizacion: el optimizador GUM (GaLore + Muon) puede evaluarse en este modelo para medir el ahorro de memoria y la estabilidad del entrenamiento en escalas pequenas antes de aplicarlo a modelos mayores.
- Estudio de enrutamiento sin perdida auxiliar: el esquema de enrutamiento por sondas (inquiry tokens) puede analizarse en este prototipo para entender como se distribuyen los expertos ante diferentes tipos de consulta.
- Desarrollo de controladores de razonamiento: el modulo Trinity-Mirror (Thinker-Critic-Refiner) puede probarse como componente independiente para tareas de autoevaluacion y refinamiento de respuestas.
- Educacion en modelos de lenguaje: al ser un modelo de 17M con arquitectura compleja, es util para ensenar conceptos como MoE, SSM, MLA y pesos ternarios en un entorno de bajo coste computacional.
- Experimentacion con escalado por escalones: el patron de escalado [1 7, 0 8, 4 5] puede validarse empiricamente comparando el rendimiento de L0 (0,17M) y L1 (17M) para decidir si se continua con el nivel L1+ (450M).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que los niveles L0 y L1 estan "validados" en terminos de estabilidad del optimizador y enrutamiento, pero no proporciona metricas como perplejidad, MMLU, HumanEval o GSM8K. No se pueden comparar con otros modelos sin datos cuantitativos.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~17M de parametros en bf16, el peso ocupa aproximadamente 34 MB. La inferencia puede ejecutarse en CPU sin GPU, con menos de 1 GB de RAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; incluso una GPU integrada o una Raspberry Pi podrian ejecutar el modelo, aunque con latencia mayor.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU consumer moderna (RTX 3060, 4090, etc.) y tambien en hardware sin GPU.
- Opciones de despliegue: no se proporcionan integraciones con vLLM, llama.cpp, Ollama o TGI. El codigo de carga es un script Python que usa `safetensors` y reconstruye el modelo con `MbGPT(config.json)`. No hay servidor de inferencia listo para usar.
- Latencia y throughput: no disponibles. Dado el tamano, la latencia seria de milisegundos en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No disponible. MBG 1.0 es un prototipo de investigacion sin equivalente directo en el ecosistema open source. Los modelos de tamano similar (17M) como GPT-2 small (124M) o TinyStories (33M) tienen arquitecturas transformer convencionales y no incorporan SSM, MoE ni pesos ternarios. No se puede establecer una comparacion justa sin datos de rendimiento.

## Limitaciones y advertencias

- Modelo de investigacion, no de produccion: los niveles superiores (L2, L3, L4) estan planificados pero no implementados. El repositorio solo contiene checkpoints de validacion L0 y L1.
- Calidad de generacion limitada: con 17M de parametros, la coherencia y el conocimiento del mundo son muy pobres en comparacion con modelos de cientos de millones o miles de millones de parametros.
- Licencia incierta: aunque el repositorio indica Apache-2.0, la model card aclara que es un "placeholder" y que la licencia final (modelo y datos) esta por decidir por el propietario del proyecto. No se recomienda uso comercial sin confirmacion.
- Sesgos y alucinaciones: no hay evaluaciones de sesgo ni de tasa de alucinacion. Dado el tamano reducido, es probable que genere texto incoherente o factualmente incorrecto con frecuencia.
- Idioma: el dataset es en ingles; no hay soporte documentado para otros idiomas, incluido el espanol.
- Reproducibilidad: el codigo de entrenamiento (`mbg_mini_gpt.py`) no esta incluido en este repositorio; solo se proporcionan los pesos y la configuracion. La reconstruccion del modelo requiere acceso al codigo fuente, que no se enlaza explicitamente.
- Integridad de datos: el repositorio incluye un `manifest.json` con SHA-256 de los checkpoints, pero no hay garantia de que los pesos correspondan exactamente a la arquitectura descrita en el blueprint, ya que el prototipo puede diferir de la arquitectura objetivo.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/deeprcurs/MBG-1.0
- Perfil de la organizacion deepRcurs Labs: https://huggingface.co/deeprcurs
- Repositorio de datos (mencionado en la model card, no verificado): `deeprcurs/MBG-1.0-data` (no se proporciona URL directa)
- Blueprint de arquitectura: mencionado como `MBG-1.0-rev-3_Blueprint.md`, no enlazado en el repositorio.
