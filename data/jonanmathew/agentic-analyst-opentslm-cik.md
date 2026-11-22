# jonanmathew/agentic-analyst-opentslm-cik

## Resumen

Agentic Analyst OpenTSLM CiK es un ajuste fino del modelo de series temporales OpenTSLM/llama-3.2-1b-m4-sp, desarrollado por el equipo Agentic Analyst en el contexto del hackathon TimeNet. El modelo toma como entrada una serie temporal junto con una breve nota de negocio y genera un pronostico (una linea numerada por paso) seguido de una explicacion empresarial breve. Su proposito es explorar si el contexto textual de negocio mejora la prevision cuantitativa frente a un modelo que solo ve la serie.

Tecnicamente, no se distribuye como un modelo completo, sino como un checkpoint parcial (`.pt`) que contiene unicamente lo que el ajuste fino modifico: el codificador de series temporales de OpenTSLM, el proyector y los pesos LoRA de rango 16 sobre el modelo base de 1.000 millones de parametros derivado de Llama 3.2. El repositorio ocupa 0,1 GB, lo que confirma que no incluye los pesos completos del modelo base.

La relevancia del modelo es fundamentalmente metodologica y experimental: demuestra un flujo de trabajo de ajuste fino multimodal (serie temporal + texto) con LoRA sobre una GPU de consumo profesional, y publica una ablacion que aisla el efecto de la nota de negocio. Sus propios autores lo describen como una demo de investigacion, no apta para produccion, dado el reducido volumen de datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (codificador de series temporales OpenTSLM + proyector + LLM Llama 3.2 1B) con adaptadores LoRA |
| Parametros totales | 1B en el modelo base (Llama 3.2 1B); los parametros ajustados son el codificador, el proyector y LoRA de rango 16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en `.pt`; el modelo base admite las cuantizaciones habituales de Llama 3.2) |
| Idiomas soportados | no disponible |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | `.pt` (PyTorch) con codificador, proyector y LoRA; requiere el modelo base `meta-llama/Llama-3.2-1B` |

## Arquitectura y entrenamiento

El modelo parte de OpenTSLM/llama-3.2-1b-m4-sp, una arquitectura que combina un codificador de series temporales con un LLM Llama 3.2 de 1B a traves de un proyector que alinea las representaciones de la serie con el espacio de embeddings del modelo de lenguaje. El ajuste fino congela el LLM y entrena el codificador de series, el proyector y adaptadores LoRA de rango 16 con dropout 0,05, hasta 4 epocas con parada temprana (el mejor checkpoint resulto ser el de la epoca 1). El entrenamiento se ejecuto en una unica NVIDIA L40S en Nebius.

Los datos provienen del dataset ServiceNow/context-is-key (CiK), cargado mediante el conector desarrollado por el equipo para TimeNet (PR 788 de OpenTSLM/TimeNet). El checkpoint principal (`best_model_full.pt`) se entreno con 215 instancias de CiK; el segundo (`best_model_extra.pt`) anade 534 ejemplos generados adicionales. La particion train/validacion/test se hizo por grupos de tipos de tarea que comparten serie, de modo que las series de test nunca aparecen en entrenamiento, y se evaluo sobre 105 instancias de test con 21 tipos de tarea no vistos. El modelo genera la prevision como una linea numerada por paso seguida de una explicacion en lenguaje natural.

## Capacidades

- Prevision de series temporales multi-paso con salida estructurada (una linea numerada por horizonte).
- Condicionamiento por contexto textual: incorpora una nota de negocio junto a la serie para modular el pronostico.
- Generacion de explicaciones en lenguaje natural que acompanan a la prevision.
- Procesamiento conjunto de modalidad numerica (serie) y textual (nota) mediante el codificador y el proyector.
- Razonamiento de tipo analista sobre tareas heterogeneas de series temporales (se evaluo en 21 tipos de tarea distintos).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el nombre "agentic" es del equipo, no una capacidad del modelo).
- Capacidades multilingues: no disponibles.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Investigacion sobre contexto en prevision: usar el modelo y su ablacion para medir cuanto aporta una nota de negocio a la precision de un pronostico, replicando el diseno experimental del repositorio (MAE y CRPS con y sin nota).
- Prototipado de asistentes de analisis de series: integrar el modelo en un cuaderno o script que reciba una serie y una nota y devuelva un pronostico con explicacion, como prueba de concepto antes de invertir en un modelo mayor.
- Deteccion de anomalias y fallos de sensores: segun los autores, en tareas de glitch de sensores y mantenimiento la nota reduce el error de 0,245 a 0,113, por lo que el modelo es util para explorar el diagnostico asistido por texto en mantenimiento predictivo.
- Generacion de borradores de informes de prevision: la salida textual puede servir como primer borrador para un analista humano, que debe validar cifras y direcciones antes de publicar.
- Docencia y experimentacion con LoRA multimodal: el repositorio y la guia de entrenamiento permiten reproducir un ajuste fino de serie temporal + texto en una sola GPU L40S, util como material didactico.
- Base para experimentos de destilacion o comparacion de baselines: el modelo y su baseline seasonal-naive documentado permiten montar comparaciones controladas de metodos de prevision con contexto.
- Evaluacion de robustez ante contexto irrelevante: al comparar el checkpoint con y sin nota se puede estudiar si el modelo ignora informacion textual que no aporta senal.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 105 instancias de test retenidas y 21 tipos de tarea no vistos (menor es mejor; escala tipo RCRPS de CiK):

| Ejecucion | MAE | CRPS | Salidas parseadas |
|---|---|---|---|
| Ronda 1, con nota de negocio (`best_model_full.pt`) | 0,225 | 0,242 | 100 % |
| Sin la nota (ablacion) | 0,228 | 0,227 | 100 % |
| Ronda 2, datos extra (`best_model_extra.pt`) | 0,230 | 0,236 | 99,7 % |
| Baseline seasonal-naive | 0,221 | 0,251 | n/a |

La precision puntual (MAE) esta a la par del baseline seasonal-naive, mientras que la dispersion de las previsiones (CRPS) es mejor en la ronda 1 con nota (0,242 frente a 0,251). En tareas de glitch de sensores y mantenimiento, la nota reduce el error de 0,245 a 0,113. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del modelo base (1B) y el codificador adicional, es esperable que quepa en GPUs de consumo con cuantizacion, aunque el checkpoint se distribuye en `.pt` sin cuantizar y requiere cargar el Llama 3.2 1B completo.
- GPU recomendadas: el entrenamiento se realizo en una NVIDIA L40S; para inferencia basta una GPU con suficiente VRAM para el modelo base de 1B mas el codificador.
- Cabe en GPU de consumo: probablemente si (el modelo base es de 1B), aunque no se especifican requisitos exactos.
- Opciones de despliegue: carga mediante el codigo del equipo (`train_cik.load_model` sobre un checkout de OpenTSLM); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, ya que el checkpoint no es un modelo completo en formato estandar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Agentic Analyst OpenTSLM CiK | 1B (base) + LoRA r16 | no disponible | Serie temporal + texto con explicacion | llama3.2 | Checkpoint `.pt` en HF |
| OpenTSLM/llama-3.2-1b-m4-sp (base) | 1B | no disponible | Serie temporal sin nota de negocio | no disponible en la informacion | Modelo base en HF |
| Seasonal-naive (baseline) | n/a | n/a | Prevision estadistica clasica | n/a | Referencia metodologica |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada; la comparativa se limita al modelo base y al baseline estadistico empleado por los autores.

## Limitaciones y advertencias

- Copia frecuente del baseline: en aproximadamente el 60 % de las tareas el modelo reproduce el pronostico seasonal-naive incluido en el prompt (dentro de 0,2 desviaciones estandar).
- No captura eventos futuros no visibles en el historial, como una ola de calor prevista.
- Las explicaciones son fluidas pero pueden afirmar cifras o direcciones incorrectas; deben tratarse como borradores.
- Entrenado con muy pocos datos (215 instancias, cerca de la mitad de un solo dominio); es una demo de investigacion, no apta para produccion.
- El checkpoint no es autonomo: requiere acceso a `meta-llama/Llama-3.2-1B` y al codigo de OpenTSLM para cargarse.
- Licencia llama3.2: el uso comercial esta sujeto a la Llama 3.2 Community License, con sus restricciones y obligaciones de atribucion.
- Riesgo de alucinacion en la parte textual y posible inconsistencia entre la prevision numerica y la explicacion.
- Idiomas soportados no documentados; no se garantiza calidad fuera del ingles.
- Sesgos conocidos: no documentados en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jonanmathew/agentic-analyst-opentslm-cik
- Repositorio del equipo (codigo, guia de entrenamiento y resultados): https://github.com/bwinner1/agentic-analyst/tree/main/opentslm-cik
- Modelo base: https://huggingface.co/OpenTSLM/llama-3.2-1b-m4-sp
- Pull request del conector CiK en TimeNet: https://github.com/OpenTSLM/TimeNet/pull/788
- Modelo Llama 3.2 1B (requerido para cargar): https://huggingface.co/meta-llama/Llama-3.2-1B
- Dataset ServiceNow/context-is-key: https://huggingface.co/datasets/ServiceNow/context-is-key
