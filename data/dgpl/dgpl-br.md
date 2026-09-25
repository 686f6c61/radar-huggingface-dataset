# dgpl/dgpl-br

## Resumen

DGPL-BR es un modelo fundacional de decisión neuronal de tipo System-1, no autorregresivo, con 48,8 millones de parámetros, desarrollado por Durbhasi Gurukulam Private Limited (DGPL). Está diseñado para percepción robótica en tiempo real, selección de trayectorias en vehículos autónomos y planificación espacial de acciones. En lugar de generar texto token a token, el modelo emite directamente embeddings latentes de acción espacial de 256 dimensiones y distribuciones de probabilidad softmax a través de sus pesos neuronales, en un rango de latencia de un solo dígito de milisegundos.

Su relevancia actual radica en que aborda un nicho concreto: la capa de decisión de baja latencia que muchos sistemas autónomos resuelven hoy con LLM autorregresivos, mucho más lentos y costosos. Frente a una línea base de LLM de 0,8B a 2B parámetros que tarda 2.915,73 ms por inferencia, DGPL-BR reduce ese tiempo a 16,77 ms en ONNX Runtime sobre CPU, lo que supone una aceleración de 173,8×. Esta orientación hacia el despliegue en el borde (edge), incluido WebAssembly en el navegador, lo posiciona como un componente de decisión embebible más que como un modelo conversacional.

El repositorio ocupa 0,2 GB y distribuye dos artefactos: un binario ONNX optimizado a nivel de grafo (94,6 MB) y un checkpoint completo de PyTorch (133 MB). El modelo está etiquetado como multimodal y se publica bajo licencia GPL-3.0, lo que condiciona su integración en productos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No autorregresiva, etiquetada como multimodal y System-1; detalles internos de capas no disponibles |
| Parametros totales | 48,8 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens (valor `max_len` usado en el ejemplo de tokenizacion; no se documenta una ventana mayor) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo opera sobre descripciones de estado codificadas, no sobre lenguaje natural general) |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX (`dgpl_system1_v2.onnx`, 94,6 MB) y checkpoint PyTorch (`dgpl_system1_v2_final.pt`, 133 MB) |

## Arquitectura y entrenamiento

La model card describe DGPL-BR como un modelo fundacional de decisión de tipo System-1, no autorregresivo y multimodal, de 48,8 millones de parámetros. A diferencia de un transformer autorregresivo que decodifica secuencias token a token, este modelo genera de forma directa una representación latente de acción espacial de 256 dimensiones junto con una distribución de probabilidad softmax, todo ello en una única pasada hacia delante. No se especifican en la informacion disponible el tipo exacto de capas (transformer, convolucional, híbrido, SSM), la profundidad de la red ni la dimensión oculta.

Tampoco se detallan los datos de entrenamiento: no hay informacion sobre el número de tokens, la composición del dataset, el uso de RLHF/DPO ni las técnicas de alineación aplicadas. La única innovación descrita explícitamente es el propio paradigma de decisión no autorregresivo, que sustituye la generación secuencial por una proyección directa a un espacio latente de acción, con la consiguiente reducción de latencia. La model card incluye ejemplos de tokenización rudimentaria (mapeo de caracteres a IDs mediante `ord(ch) + 100`), lo que sugiere una interfaz de entrada simplificada para descripciones de estado, pero no aporta informacion sobre el preprocesado real del pipeline de entrenamiento.

## Capacidades

- Generación de decisiones de acción espacial mediante embeddings latentes continuos de 256 dimensiones.
- Producción de distribuciones de probabilidad softmax para selección entre alternativas de acción.
- Percepción robótica en tiempo real orientada a la capa de decisión.
- Selección de trayectorias para vehículos autónomos.
- Planificación espacial de acciones (spatial action planning).
- Entrada multimodal (etiqueta `multimodal` declarada por el autor), aunque la model card solo documenta entrada de texto codificado como tokens.
- Inferencia en CPU y en WebAssembly dentro del navegador mediante `onnxruntime-web`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo es de un solo paso, System-1, sin bucle de razonamiento).
- Capacidades multilingües: no disponible.
- Modo de razonamiento (thinking mode), visión o audio: no disponible.

## Casos de uso

- Selección de trayectorias en vehículos autónomos: el modelo recibe una descripción codificada del estado (velocidad, giro, distancia) y devuelve un vector latente y una distribución de probabilidad que permiten elegir la maniobra en 16,77 ms sobre CPU, compatible con bucles de control en tiempo real.
- Decisión embebida en robots móviles: al ejecutarse como binario ONNX de 94,6 MB, puede integrarse en controladores de borde con recursos limitados para planificación espacial de acciones sin depender de un servidor de inferencia.
- Copiloto de decisiones en navegador: gracias al soporte de `onnxruntime-web` y WebAssembly, el modelo puede ejecutarse íntegramente en el cliente, lo que resulta útil para simuladores, demos interactivas o herramientas de teleoperación con inferencia local y sin fuga de datos.
- Sistemas ADAS de bajo coste: la latencia de 61,06 ms en PyTorch CPU permite desplegar la capa de decisión en unidades de cómputo sin GPU dedicada, reduciendo el coste de hardware respecto a soluciones basadas en LLM.
- Filtrado y priorización de candidatos de planificación: la salida softmax puede usarse como módulo de scoring rápido que descarta trayectorias inviables antes de invocar un planificador más costoso.
- Investigación en modelos System-1 frente a System-2: sirve como referencia reproducible y ligera para estudiar la separación entre decisión reactiva rápida y razonamiento deliberativo en pipelines de conducción autónoma.
- Prototipado en simulación de conducción: su tamaño reducido y su licencia GPL-3.0 lo hacen idóneo para experimentación académica dentro de entornos de simulación abiertos.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden a latencia y velocidad relativa frente a una línea base de LLM autorregresivo de 0,8B a 2B parámetros.

| Entorno de ejecucion | Tamano de lote | Latencia | Aceleracion vs LLM autorregresivo |
|---|---|---|---|
| ONNX Runtime (CPU / WebAssembly) | 1 | 16,77 ms | 173,8× |
| PyTorch CPU (`torch.no_grad`) | 1 | 61,06 ms | 47,7× |
| Linea base LLM 0,8B/2B | 1 | 2.915,73 ms | 1,0× |

No se han publicado resultados de benchmarks de calidad de decisión (tipo MMLU, HumanEval, GSM8K ni métricas específicas de conducción como éxito de tarea, colisión o error de trayectoria) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de 48,8 M de parámetros): aproximadamente 195 MB en fp32, unos 98 MB en fp16 y unos 49 MB en int8. Los artefactos publicados ocupan 94,6 MB (ONNX) y 133 MB (PyTorch), coherentes con estos órdenes de magnitud.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 1 GB de memoria libre es suficiente (por ejemplo, GTX 1650, RTX 3060 o superiores). No se documentan requisitos de GPU de datacenter como A100 o H100.
- Cabe en GPU de consumo: sí, con amplio margen, incluidas GPU integradas y aceleradores de borde.
- Ejecución en CPU: soportada de forma nativa y es el escenario principal documentado (ONNX Runtime CPU y PyTorch CPU).
- Opciones de despliegue: ONNX Runtime (Python, C++, WebAssembly vía `onnxruntime-web`) y PyTorch. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este modelo concreto.
- Latencia y throughput estimados: 16,77 ms por inferencia en ONNX Runtime CPU a lote 1; 61,06 ms en PyTorch CPU a lote 1. No se publican cifras de throughput agregado ni de latencia en GPU.

## Comparativa con modelos similares

| Modelo | Desarrollador | Parametros | Tipo | Latencia declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DGPL-BR | Durbhasi Gurukulam (DGPL) | 48,8 M | System-1 no autorregresivo, multimodal | 16,77 ms (ONNX CPU) | GPL-3.0 | HuggingFace `dgpl/dgpl-br` |
| Laya | Nandha Kishor M / ConvAI Innovations | No disponible | System-1 de decision | No disponible | No disponible | GitHub `@NandhaKishorM/laya` |
| BRPilot / DGPL System-1 | Durbhasi Gurukulam (DGPL) | No disponible | Motor de decision de alto rendimiento (microsegundos) | No disponible | No disponible | `br.durbhasigurukulam.com` |
| DGPL Linux Assistant 0.8B | Durbhasi Gurukulam (DGPL) | 0,8 B | Copiloto de terminal Linux | No disponible | No disponible | `ollama.com/dgpl` |

Los datos de rendimiento, contexto y licencia de las alternativas no están disponibles en la informacion proporcionada, por lo que la comparación se limita a categoria y disponibilidad.

## Limitaciones y advertencias

- Riesgo de alucinación y sesgos: no se documentan evaluaciones de sesgo ni de fiabilidad de decisión; en un contexto de conducción autónoma esto es crítico, ya que un error en la selección de trayectoria tiene consecuencias físicas.
- Naturaleza System-1: al ser no autorregresivo y de un solo paso, no dispone de razonamiento multi-paso ni de mecanismos de autocorrección, lo que limita su uso en tareas que requieran deliberación.
- Contexto muy corto: el ejemplo de la model card usa `max_len = 128` tokens, insuficiente para historiales largos o descripciones de estado detalladas.
- Tokenizacion rudimentaria: el ejemplo mapea caracteres individuales a IDs (`ord(ch) + 100`), lo que sugiere una representacion de entrada muy básica y un vocabulario no documentado.
- Idiomas y cobertura: no se especifican idiomas soportados; el modelo trabaja sobre descripciones codificadas, no sobre lenguaje natural general.
- Licencia GPL-3.0: es una licencia copyleft fuerte, lo que impone obligaciones de distribución del código fuente derivado y puede ser incompatible con productos propietarios o despliegues cerrados, incluida la integración en vehículos comerciales.
- Ausencia de benchmarks de calidad: sin métricas de precisión de decisión, éxito de tarea o tasa de error, la idoneidad para producción no puede validarse solo con datos de latencia.
- Madurez y adopción: el repositorio registra 0 descargas y 0 likes, sin evidencia de validación por terceros.
- Cuantizacion y formatos: no se documentan variantes cuantizadas ni conversiones a GGUF u otros formatos, lo que puede limitar la integración con runtimes alternativos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dgpl/dgpl-br
- Perfil de la organizacion en HuggingFace: https://huggingface.co/dgpl/models
- Modelos etiquetados con `dgpl` en HuggingFace: https://huggingface.co/models?other=dgpl
- Repositorio comparativo Laya vs DGPL: https://github.com/vk-alto-none/laya-vs-dgpl-arena
- DGPL en Ollama: https://ollama.com/dgpl
- Sitio corporativo de DGPL: https://durbhasigurukulam.com
- DGPL System-1 / BRPilot: https://br.durbhasigurukulam.com
- Articulo academico relacionado (segmentacion semantica cross-view BEV, denominado DGPL): https://dl.acm.org/doi/epdf/10.1145/3762329.3762341
