# classifyre/Bauxi-23M

## Resumen

Bauxi-23M es un clasificador de texto en inglés desarrollado por Classifyre, diseñado para responder una pregunta muy concreta: dada una decisión previa y una nueva evidencia, ¿sigue siendo válida esa decisión? El modelo devuelve una de tres etiquetas (`valid`, `invalid` o `unknown`) en una única pasada de inferencia sobre CPU, sin GPU, sin generación de texto y sin acceso a red. Es el primer modelo publicado por Classifyre.

Técnicamente se trata de un modelo de 22,76 millones de parámetros basado en nreimers/MiniLM-L6-H384-uncased, afinado sobre el conjunto de datos WANLI (alisawuffles/WANLI) para una tarea de inferencia de lenguaje natural orientada a soporte de decisiones. Se distribuye en formato ONNX con cuantización INT8, ocupa solo 22 MiB en disco y funciona con aproximadamente 0,1 núcleo de CPU y 80 MiB de RAM, con latencias de 3–6 ms por par de textos en un núcleo.

Su relevancia está en el ámbito de agentes y automatización: permite comprobar de forma barata y rápida si un hecho nuevo invalida, confirma o deja indeterminada una decisión tomada por un agente o un pipeline, funcionando como un primer filtro antes de pasar a comprobaciones más costosas con modelos generativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MiniLM-L6-H384) para clasificacion de pares de texto |
| Parametros totales | 22.761.350 |
| Parametros activos | no disponible (no es MoE; todos los parametros estan activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (ONNX) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | ONNX (con versiones optimizadas arm64/amd64 para Linux y modelo portable) y safetensors en el repositorio |

## Arquitectura y entrenamiento

Bauxi-23M parte de MiniLM-L6-H384-uncased, un encoder transformer compacto de 6 capas y dimension oculta 384. El modelo no es un pipeline estandar de `transformers`: recibe un par de textos (decision y evidencia) y procesa ademas 346 caracteristicas numericas calculadas por el script `bauxi.py` incluido en el repositorio, que se combinan con la salida del encoder para la clasificacion final en tres clases.

El entrenamiento se realizo sobre el dataset WANLI (Worker-AI collaborative Natural Language Inference), un conjunto de datos de inferencia de lenguaje natural creado de forma colaborativa entre humanos y modelos generativos. El autor reporta una evaluacion en un holdout sellado de 150 casos de 50 familias de escenarios, y un test de estres posterior de 180 casos centrado en los puntos debiles conocidos del modelo. No hay informacion disponible sobre el numero exacto de tokens de entrenamiento ni sobre el uso de tecnicas como RLHF o DPO (no aplicables a un clasificador discriminativo).

## Capacidades

- Clasificacion ternaria de "reversion de decisiones": dado un par (decision, evidencia), devuelve `valid`, `invalid` o `unknown` con probabilidades asociadas.
- Inferencia de lenguaje natural en ingles, afinada sobre WANLI.
- Ejecucion 100% local en CPU: sin GPU, sin red y sin generacion de texto.
- Verificacion de integridad: comprueba el hash de cada fichero que carga.
- Seleccion automatica del grafo ONNX optimizado para la maquina (Linux arm64 o amd64), con fallback al modelo portable en macOS y Windows.
- Control de hilos de ejecucion mediante el parametro `threads=`.
- No soporta tool calling, agentes multi-paso ni capacidades multilingues: es un clasificador especializado disenado para integrarse como componente dentro de sistemas de agentes.

## Casos de uso

- Validacion de decisiones en agentes autonomos: antes de ejecutar una accion planificada, un agente puede comprobar si la evidencia reciente (resultados de tests, mensajes, eventos) invalida la decision, pausando y replanificando si la etiqueta es `invalid`.
- Gates en pipelines de CI/CD: comprobar si condiciones de despliegue siguen vigentes, por ejemplo "desplegar si pasan los tests de integracion" frente a "los tests de integracion han fallado" devuelve `invalid` con score 0,99.
- Orquestacion de flujos de trabajo con precondiciones: verificar precondiciones compuestas, como "enviar el contrato cuando legal y finanzas hayan firmado", detectando que el rechazo de una parte invalida la accion.
- Deteccion de informacion insuficiente: cuando un dato necesario falta, esta desactualizado o es irrelevante (etiqueta `unknown`), el sistema puede pedir evidencia adicional en lugar de actuar con datos incompletos.
- Filtrado de ruido irrelevante: descartar eventos sin relacion con la decision en curso (por ejemplo, un atasco de impresora frente a un renombrado de hoja de calculo), evitando replanificaciones innecesarias.
- Moderacion de costes en sistemas de decision: al costar 3–6 ms por evaluacion en CPU, puede ejecutarse masivamente como primer filtro antes de escalar casos dudosos a un LLM.
- Sistemas de cumplimiento y aprobaciones: comprobar si condiciones presupuestarias o contractuales siguen cumplidas tras la llegada de nueva informacion, como detectar que una tasa de configuracion sin cotizar hace indeterminado un limite de gasto.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Dataset | Metrica | Valor |
|---|---|---|---|
| Decision reversal | Bauxi-23M authored holdout (150 casos, 50 familias de escenarios) | Accuracy | 0,907 |
| Decision reversal | Bauxi-23M authored holdout (150 casos, 50 familias de escenarios) | Macro F1 | 0,906 |
| Decision reversal | Bauxi stress test de puntos debiles conocidos (180 casos, 60 familias de escenarios) | Accuracy | 0,711 |

Rendimiento de inferencia declarado por el autor:

| Metrica | Valor |
|---|---|
| Latencia tipica | 3–6 ms por par en un nucleo de CPU |
| Latencia maxima | 35 ms (par mas largo) |
| Recursos | ~0,1 nucleo de CPU y 80 MiB de RAM |
| Tamano en disco | 22 MiB (INT8) |

No hay comparativas publicadas frente a otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplicable; el modelo se ejecuta integramente en CPU.
- RAM: aproximadamente 80 MiB, con uso de ~0,1 nucleo de CPU.
- Cabe en cualquier maquina moderna, incluidas maquinas virtuales pequenas, contenedores y dispositivos edge, dado su consumo minimo de recursos.
- GPU recomendadas: no necesarias; el modelo esta disenado para CPU.
- Despliegue: mediante `onnxruntime` con el script `bauxi.py` incluido en el repositorio (instalando `onnxruntime`, `tokenizers`, `numpy` y `huggingface_hub`). El paquete selecciona automaticamente el grafo optimizado para Linux arm64/amd64 y usa el modelo portable ONNX en macOS y Windows. No hay informacion sobre soporte en vLLM, llama.cpp, Ollama o TGI (no aplicable: no es un modelo generativo ni un pipeline de `transformers`).
- Latencia y throughput: 3–6 ms por evaluacion tipica en un nucleo, 35 ms en el peor caso; al usar un solo hilo por defecto, el throughput puede escalarse paralelizando con multiples hilos o procesos.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Formato | Licencia | Diferenciador |
|---|---|---|---|---|---|
| Bauxi-23M | 22,76 M | Clasificacion ternaria de reversion de decisiones (par decision/evidencia) | ONNX INT8 | MIT | Especializado en validez de decisiones para agentes; 3–6 ms en CPU |
| nreimers/MiniLM-L6-H384-uncased (base) | 22,7 M | Embeddings genericos / fine-tuning | PyTorch | Apache 2.0 | Modelo base sin afinar para esta tarea concreta |
| cross-encoder/nli-deberta-v3-base | ~86 M (no disponible con precision) | NLI generico (entailment/neutral/contradiction) | PyTorch | no disponible | NLI generalista, mas grande y pesado; no incluye las 346 caracteristicas numericas ni la taxonomia valid/invalid/unknown orientada a decisiones |

No hay datos de benchmarks comparativos directos publicados entre estos modelos en la informacion disponible.

## Limitaciones y advertencias

- Rendimiento degradado en casos difficiles: la accuracy cae del 90,7% en el holdout al 71,1% en el test de estres sobre sus puntos debiles conocidos, un descenso sustancial que hay que tener en cuenta para produccion.
- Punto debil documentado: el razonamiento sobre el orden de los dias de la semana es su habilidad mas debil; el propio autor publica un ejemplo de error (confusion entre miercoles y viernes en una restriccion temporal).
- El autor recomienda explicitamente usarlo como un primer filtro ("first-pass flag"), nunca como la unica comprobacion antes de ejecutar una accion.
- Limitado al idioma ingles; no hay soporte para castellano ni otros idiomas.
- Benchmarks no verificados: las metricas provienen de datasets creados por el propio autor (holdout y stress test "authored"), por lo que pueden no ser representativas de casos reales de terceros.
- Riesgo de confianza mal calibrada: en el ejemplo de error publicado, el modelo asigna `invalid` con score 0,53, cerca del umbral de decision; conviene revisar las probabilidades y establecer umbrales de confianza antes de actuar automaticamente.
- Requiere el script `bauxi.py` para calcular las 346 caracteristicas numericas; no funciona como pipeline estandar de `transformers`, lo que anade una dependencia concreta al integrarlo.
- La licencia MIT permite uso comercial sin restricciones relevantes; el autor declara ademas un linaje de entrenamiento limpio.
- Modelo muy reciente (creado en octubre de 2026) con 0 descargas registradas, por lo que carece de adopcion comunitaria y auditoria externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/classifyre/Bauxi-23M
- Repositorio de Classifyre en GitHub: https://github.com/classifyre-com/classifyre
- Modelo base: https://huggingface.co/nreimers/MiniLM-L6-H384-uncased
- Dataset de entrenamiento (WANLI): https://huggingface.co/datasets/alisawuffles/WANLI
