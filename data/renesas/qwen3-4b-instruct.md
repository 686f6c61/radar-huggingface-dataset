# Renesas/Qwen3-4B-Instruct

## Resumen

Renesas/Qwen3-4B-Instruct es una distribución del modelo Qwen3-4B-Instruct de Alibaba, publicada por Renesas Electronics y optimizada específicamente para su plataforma de hardware X5H (SoC con acelerador NPU/NPX para automoción). No se trata de un modelo entrenado desde cero por Renesas, sino de una conversión y empaquetado del modelo original de Qwen con cuantización W4A16 para ejecución en la NPU del X5H, junto con un runner binario propietario y scripts de despliegue.

El modelo base es un transformer decoder-only de 4.000 millones de parámetros orientado a generación de texto e instrucciones. La model card de Renesas, sin embargo, describe la arquitectura como "Qwen3-4B-VL" con encoder de visión integrado, lo que genera una inconsistencia respecto al identificador del repositorio y al modelo fuente citado; esta ficha recoge ambos datos tal como aparecen publicados y señala la discrepancia.

Su relevancia es fundamentalmente de nicho: demuestra la viabilidad de ejecutar un LLM de 4B en un SoC automotriz con cuantización de 4 bits en pesos y 16 bits en activaciones, con un modo de despliegue híbrido que descarga el encoder visual y el proyector a la CPU mientras el decodificador de lenguaje corre en la NPU. Es un artefacto de integración embebida más que un modelo nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (la model card menciona encoder de vision integrado, ver advertencias) |
| Parametros totales | 4 mil millones (4B, segun identificador del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (pesos 4 bits, activaciones 16 bits) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | runner binario propietario para X5H; no se publican safetensors ni GGUF |
| Modelo fuente | Qwen/Qwen3-VL-4B-Instruct (segun model card; el enlace apunta a Qwen/Qwen3-4B-Instruct-2507) |
| Plataforma objetivo | Renesas X5H (R-Car X5H), NPU/NPX |
| Modos de despliegue | alpha (offload mixto CPU/NPX) |

## Arquitectura y entrenamiento

La model card describe el modelo como un transformer decoder-only unimodal que procesa conjuntamente entradas visuales y textuales de forma autorregresiva, con un encoder de visión integrado y mecanismos de atención eficientes. Esta descripción corresponde a la familia Qwen3-VL, aunque el repositorio se denomine Qwen3-4B-Instruct y el enlace de modelo fuente apunte a Qwen3-4B-Instruct-2507, que es un modelo puramente textual. La documentación publicada no resuelve la ambigüedad.

No se proporciona información sobre el entrenamiento: no hay datos sobre número de tokens, composición del dataset, fases de RLHF/DPO ni innovaciones de entrenamiento. Renesas no ha entrenado el modelo; su aportación es la cuantización W4A16, el empaquetado del runner para la NPU del X5H y el modo de despliegue híbrido "alpha", en el que el vision tower, el proyector y el merger se ejecutan en CPU mientras el decodificador de lenguaje se ejecuta en la NPX. No se documentan técnicas como decodificación especulativa ni atención lineal.

## Capacidades

- Generación de texto e instrucciones en el modelo base Qwen3-4B-Instruct.
- Procesamiento de imagen según la model card (vision tower, proyector y merger), aunque la naturaleza exacta del modelo fuente es ambigua.
- Inferencia autorregresiva en NPU con cuantización W4A16.
- Despliegue en modo híbrido CPU + NPX para repartir carga entre encoder visual y decodificador.
- Tool calling / function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: no disponible en la documentación.
- Capacidades multilingües: no disponible en la documentación.
- Modo thinking: no disponible en la documentación.

## Casos de uso

- Inferencia de visión-lenguaje en cabina o dominio automotriz: el modo alpha permite ejecutar el encoder visual en CPU y el decodificador en la NPX del X5H, lo que encaja en escenarios de asistencia al conductor o descripción de escenas con presupuesto térmico y energético limitado.
- Procesamiento de documentos en el borde: al ejecutarse sobre un SoC embebido, permite extraer y resumir información de imágenes o documentos sin enviar datos a la nube, útil en entornos con requisitos de privacidad.
- Prototipado de asistentes de voz/texto embebidos: un modelo de 4B cuantizado a 4 bits es viable en memoria de un SoC de automoción, lo que permite asistentes conversacionales locales con latencia controlada.
- Validación de pipelines de despliegue NPU: el repositorio incluye instalador, estructura de directorios, `setup_npu.sh` y runner, lo que lo convierte en una referencia para ingenieros que integren LLMs en la plataforma X5H.
- Evaluación de cuantización W4A16 en hardware real: sirve para medir la degradación de calidad frente al modelo original en FP16/BF16 en un entorno embebido concreto.
- Pruebas de concepto de inspección visual industrial: con entrada de imagen y salida de texto, puede emplearse en líneas de producción para generar descripciones o alertas a partir de capturas, siempre que se valide la calidad del modelo base.

## Benchmarks y rendimiento

La model card incluye una tabla de rendimiento con una única fila, pero todos los valores están vacíos:

| Modelo | Precisión | Dispositivo | Prefill (tok/s) | Token-gen (tok/s) |
|---|---|---|---|---|
| Qwen3-4B-Instruct | W4A16 | X5H - Single Cluster NPX | - | - |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) ni métricas de throughput o latencia en la información disponible.

## Requisitos de hardware

- Hardware objetivo: placa Renesas X5H (R-Car X5H) con NPU/NPX. No se documenta soporte para GPU convencionales.
- VRAM estimada: no aplicable; el modelo se ejecuta sobre memoria del SoC, no sobre GPU de escritorio. Con 4B parámetros en W4A16, la huella de pesos ronda los 2 GB, pero Renesas no publica la cifra oficial.
- GPU recomendadas: no disponible; el repositorio no incluye pesos en safetensors ni GGUF para GPU.
- ¿Cabe en GPU consumer? No se distribuyen pesos ejecutables en CUDA; el artefacto es un runner binario para X5H.
- Opciones de despliegue: instalador `qwen3-4br-0.1.0-Linux.sh` (carpeta `w4a16/binaries/rcar-x5hv1/xOS_v4.32`), `setup_npu.sh` y runner `qwen3-4b-vl-fp16-runner -i <imagen>`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles (la tabla de rendimiento está vacía).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Renesas/Qwen3-4B-Instruct | 4B | no disponible | no disponible | Solo runner para X5H | Cuantización W4A16 para NPU Renesas |
| Qwen/Qwen3-4B-Instruct-2507 | 4B | no disponible en esta ficha | no disponible en esta ficha | Pesos estándar en HuggingFace | Modelo fuente citado en el enlace |
| Qwen/Qwen3-VL-4B-Instruct | 4B | no disponible en esta ficha | no disponible en esta ficha | Pesos estándar en HuggingFace | Modelo fuente citado en el texto |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Inconsistencia documental: el repositorio se llama Qwen3-4B-Instruct, la arquitectura descrita es Qwen3-4B-VL y el enlace de modelo fuente apunta a Qwen3-4B-Instruct-2507. Hay que verificar qué modelo se está ejecutando realmente antes de usarlo en producción.
- Licencia no declarada: no se especifica la licencia del empaquetado de Renesas ni se aclaran las obligaciones heredadas del modelo Qwen original. No se puede asumir uso comercial sin consultar al autor.
- Idiomas no declarados: no se indica qué lenguas soporta el artefacto empaquetado.
- Contexto no declarado: se desconoce la longitud máxima de contexto efectiva en esta implementación.
- Dependencia de hardware propietario: el runner solo funciona en X5H con el firmware y los módulos de kernel incluidos; no es portable a otras plataformas.
- Sin métricas de calidad ni de rendimiento: la tabla de throughput está vacía y no hay benchmarks, por lo que no se puede evaluar la degradación por cuantización W4A16.
- Riesgo de alucinación: inherente al modelo base de 4B; no se documentan mitigaciones específicas.
- Sesgos: no documentados por el autor.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día, sin histórico de mantenimiento.
- El modo de despliegue se etiqueta como "alpha", lo que sugiere inestabilidad y falta de soporte de producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Renesas/Qwen3-4B-Instruct
- Modelo fuente citado en el texto: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Modelo fuente citado en el enlace: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Renesas Electronics (sitio corporativo): https://www.renesas.com/
- Renesas Electronics (Wikipedia): https://en.wikipedia.org/wiki/Renesas_Electronics
- Renesas Electronics (Wikipedia en francés): https://fr.wikipedia.org/wiki/Renesas_Electronics
- Renesas, actualidad en L'Embarqué: https://lembarque.com/entreprise/renesas
- Productos Renesas: https://www.renesas.com/en/products
