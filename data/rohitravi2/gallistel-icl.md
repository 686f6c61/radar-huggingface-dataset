# rohitravi2/gallistel-icl

## Resumen

`gallistel-icl` es un conjunto de pesos publicado por Rohit Ravi (usuario `rohitravi2`) para un modelo de aprendizaje en contexto (in-context learning) de tipo transformer causal. Forma parte del arco de investigación denominado ANN-BNN conditioning, cuyo objetivo es comparar la inferencia de un transformer meta-entrenado con la de un observador bayesiano exacto sobre secuencias de condicionamiento clásico al estilo de Gallistel. El modelo no es un LLM de propósito general: es un instrumento de laboratorio computacional diseñado para predecir el logaritmo del tiempo hasta el siguiente estímulo incondicionado (US) en flujos de condicionamiento, leyendo ensayo a ensayo contra una referencia bayesiana.

La arquitectura es un transformer causal pequeño (d=128, 4 capas, 4 cabezas, contexto de 1024 tokens) meta-entrenado sin actualización de pesos en tiempo de test. El repositorio incluye dos checkpoints en PyTorch (`icl_fullp005_s0.pt` e `icl_fullv2_s0.pt`) y una exportación ONNX con longitud de secuencia dinámica. El modelo está pensado para investigadores en neurociencia computacional y psicología experimental que quieran contrastar hipótesis sobre mecanismos de inferencia de contingencia, no para aplicaciones de producción.

Su relevancia es metodológica: el autor documenta explícitamente qué se midió y qué no, incluye correcciones posteriores a los resultados y advierte de que se trata de un instrumento, no de un resultado sobre cerebros. La licencia MIT y la disponibilidad del código, los datos de benchmark y una demo en navegador facilitan la replicación, aunque el alcance experimental es limitado (una sola semilla, una sola arquitectura).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only) para in-context learning |
| Parametros totales | no disponible (d=128, 4 capas, 4 cabezas; el numero exacto no se publica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (pesos en float32; exportacion ONNX en float32) |
| Idiomas soportados | no disponible (no es un modelo linguistico; opera sobre tokens de eventos CS_ON y US) |
| Licencia | MIT |
| Formato de pesos | PyTorch `state_dict` (`.pt`) y ONNX (`model.onnx`, float32, longitud dinamica) |

## Arquitectura y entrenamiento

El modelo es un transformer causal con dimensión de modelo 128, 4 capas y 4 cabezas de atención, con una ventana de contexto de 1024 tokens. Los tokens representan eventos de condicionamiento: `CS_ON` y `US`, cada uno acompañado del logaritmo de `1 + dt` desde el evento anterior. Una embedding de tipo de 3 filas mantiene una ranura `CS_OFF` sin uso. La salida es una predicción del logaritmo del tiempo de espera hasta el siguiente US, y la pérdida es MSE sobre ese log-wait.

El meta-entrenamiento se realizó durante 20.000 pasos con AdamW a tasa 3e-4 con scheduler one-cycle, batch de 32 y precisión bf16. Los flujos de meta-entrenamiento se generan con C/T log-uniforme en [1,5, 300] y T log-uniforme en [2, 60]. El prior de contingencia `P_CONT` (probabilidad de que un flujo sea contingente frente a control de barajado) es 0,05 en el checkpoint primario y 0,5 en el secundario. No hay actualización de pesos en tiempo de test: todo el aprendizaje ocurre en contexto, lo que es precisamente el objeto de estudio.

La innovación técnica no está en el modelo en sí, sino en el protocolo de evaluación: se compara la readout del modelo con un observador bayesiano exacto basado en log-likelihood ratio (LLR) completo. El autor documenta una corrección importante: la referencia bayesiana original usaba un LLR truncado `log(C/T) - w/T`; con el LLR completo `log(C/T) - w(1/T - 1/C)`, las medianas de referencia en C/T 3-15 son aproximadamente 4/2/2/1/1, no 10/4,5/2/1,5/1, y se retira la afirmación de que el modelo supera a la referencia rate-only en C/T bajos.

## Capacidades

- Predicción del logaritmo del tiempo hasta el siguiente US en flujos de condicionamiento con eventos CS_ON y US.
- Aprendizaje en contexto sin actualización de pesos: adaptación a la estadística del flujo dentro de la ventana de 1024 tokens.
- Inferencia de contingencia frente a controles de barajado (shuffle controls), con 0/20 falsas adquisiciones en C/T 4,5, 27 y 110 según la model card.
- Invariancia de escala temporal observada: mediana de ensayo de adquisición 5/5/6 en C/T 4,5 y 3/3/3 en C/T 27 para T = 4, 12, 36 (20 flujos por celda).
- Exportación ONNX con longitud de secuencia dinámica, con diferencia máxima absoluta frente a PyTorch inferior a 4e-6 en flujos generados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso general, visión, audio ni capacidades multilingües: es un modelo de dominio específico.

## Casos de uso

- Investigación en neurociencia computacional: comparar la readout de un transformer meta-entrenado con un observador bayesiano exacto sobre flujos de condicionamiento, usando `paired_readout(m, CT=9.0, T=12.0, seed=0)` para obtener métricas de adquisición del modelo y de la referencia.
- Docencia y demostraciones interactivas: la demo en navegador del Space permite visualizar cómo un modelo de aprendizaje en contexto infiere contingencia sin reentrenamiento, útil en cursos de psicología experimental o machine learning.
- Validación de protocolos experimentales: generar flujos sintéticos con C/T y T controlados para comprobar si un diseño experimental distingue entre hipótesis de tasa y de contingencia antes de ejecutarlo con animales o humanos.
- Reproducción de resultados: cargar los checkpoints con `load_checkpoint(name="p005")` o `name="v2"` y reproducir las métricas de adquisición documentadas, incluyendo los controles de barajado.
- Integración en pipelines de análisis en Python: la exportación ONNX con entrada `types[int64, 1xN]`, `logdt[float32, 1xN]` y salida `logwait[1xN]` permite ejecutar el modelo con onnxruntime en entornos sin PyTorch.
- Desarrollo de nuevas referencias bayesianas: el código y los flujos de benchmark publicados permiten sustituir el observador LLR por variantes (por ejemplo, con priors distintos) y comparar de nuevo contra el modelo.
- Estudio de mecanismos de escritura (write mechanisms): aunque los ocho brazos pre-registrados de write-arm se detuvieron en sus puertas de instrumentación sin puntuar predicciones, el marco sirve para diseñar experimentos futuros con criterios pre-registrados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible en el sentido habitual (MMLU, HumanEval, GSM8K). La model card reporta métricas específicas del dominio:

| Metrica | Resultado |
|---|---|
| Falsas adquisiciones en controles de barajado | 0/20 en C/T 4,5, 27 y 110 |
| Mediana de ensayo de adquisición (C/T 4,5; T = 4, 12, 36) | 5 / 5 / 6 |
| Mediana de ensayo de adquisición (C/T 27; T = 4, 12, 36) | 3 / 3 / 3 |
| Diferencia maxima ONNX vs PyTorch | < 4e-6 (max abs) en flujos generados |
| Pendiente de adquisición frente a C/T | no medida (los controles de barajado filtran evidencia de forma del intervalo) |
| Brazos write-arm puntuados | 0 de 8 (todos detenidos en puertas de instrumentación) |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con d=128, 4 capas y contexto de 1024, el modelo cabe holgadamente en cualquier GPU consumer. El tamaño exacto del checkpoint no se publica, pero el repositorio ocupa 0,0 GB.
- GPU recomendadas: no se especifican; cualquier GPU con soporte PyTorch o onnxruntime es suficiente. La demo oficial funciona en CPU en unos pocos segundos (`gallistel-icl demo --ct 9 --T 12 --seed 0`).
- Cabe en GPU consumer: sí, en cualquier modelo actual (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: PyTorch (paquete `gallistel-icl[torch,hf]`), onnxruntime mediante `model.onnx`, y la demo CLI incluida. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma sistemática; la model card indica que la demo en CPU tarda unos pocos segundos por ejecución.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (transformers meta-entrenados para inferencia de contingencia en condicionamiento clásico). Las referencias del autor son observadores bayesianos y literatura de condicionamiento (Gibbon & Balsam 1981; Gallistel & Gibbon 2000; Harris & Gallistel 2026), no modelos de lenguaje comparables.

## Limitaciones y advertencias

- Una sola semilla y una sola arquitectura: nada se ha replicado entre semillas ni entre clases de modelo, según la propia model card.
- La pendiente de adquisición frente a C/T no se midió; los controles de barajado filtran evidencia de forma del intervalo y tanto el modelo como la referencia rate-only saturan.
- Corrección del 2026-11-13: con el LLR completo, las medianas de referencia en C/T 3-15 son aproximadamente 4/2/2/1/1, no 10/4,5/2/1,5/1, y se retira la afirmación de que el modelo supera a la referencia rate-only en C/T bajos.
- La cláusula P1 de la sonda de retención falla en su redacción literal y su observador jerárquico es post hoc.
- Las pendientes animales están en log(C/T - 1); el observador de 60 nats es -0,58 en ese eje sobre 4,5-27.
- Error de registro documentado: el JSON de evaluación del checkpoint primario registra `meta.p_cont = 0.5` porque se lanzó sin la variable de entorno `P_CONT`, que la evaluación no usa; el checkpoint se entrenó con P_CONT = 0,05.
- El autor advierte explícitamente de que es un instrumento, no un resultado sobre cerebros.
- No es un modelo de lenguaje: no tiene capacidades multilingües, de código, de razonamiento general ni de tool calling; usarlo fuera de su dominio de condicionamiento no es válido.
- Licencia MIT: permite uso comercial, pero el modelo no está diseñado ni validado para aplicaciones de producción.
- Riesgo de alucinación en el sentido habitual no aplica; el riesgo real es de sobreinterpretación de las métricas de adquisición dadas las limitaciones experimentales documentadas.

## Enlaces

- Hugging Face: https://huggingface.co/rohitravi2/gallistel-icl
- Codigo: https://github.com/rohit-ravi2/gallistel-icl
- Demo en navegador (Space): https://huggingface.co/spaces/rohitravi2/gallistel-icl
- Flujos de benchmark (dataset): https://huggingface.co/datasets/rohitravi2/gallistel-streams
- Write-up del proyecto: https://www.rohitravi.com/projects/ann-bnn-inference-law/
- Cita: Ravi, R. (2026). gallistel-icl: in-context contingency inference read out against an exact Bayes observer on Gallistel-style conditioning streams. https://github.com/rohit-ravi2/gallistel-icl
- Referencias citadas: Gibbon & Balsam (1981) Spreading association in time; Gallistel & Gibbon (2000) Psychol Rev 107:289; Harris & Gallistel (2026) eLife 13:RP102155.
