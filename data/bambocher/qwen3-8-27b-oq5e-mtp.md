# bambocher/Qwen3.8-27B-oQ5e-mtp

## Resumen

Qwen3.8-27B-oQ5e-mtp es un checkpoint cuantizado del modelo Qwen3.8-27B, publicado por el usuario bambocher en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una conversión de precisión mixta generada con la herramienta oQ (oMLX v0.7.1) sobre los pesos originales, en formato MLX y con un promedio efectivo de 5,843 bits por peso. El resultado ocupa 18,897 GiB de pesos lógicos (20,3 GB de repositorio) frente a los aproximadamente 55,6 GB que requeriría el mismo modelo en BF16.

El interés de esta ficha es doble. Por un lado, documenta una técnica de cuantización mixta que asigna distintos anchos de bit según la sensibilidad de cada tensor (5 bits para el 92,5 % de los pesos, 6 y 8 bits para una fracción pequeña y BF16 para el 1,86 %), un enfoque que busca preservar calidad donde más importa sin disparar el tamano. Por otro, el checkpoint incluye la cabeza MTP (multi-token prediction) y el codificador visual, lo que lo convierte en un artefacto multimodal completo y no solo en un modelo de lenguaje.

La información pública disponible es muy limitada: el repositorio no declara licencia, idiomas, pipeline ni resultados de evaluación, y no se han encontrado fuentes externas que documenten el modelo base. Por tanto, esta ficha se limita a los datos verificables del repositorio y marca explícitamente como no disponibles los parámetros que el autor no ha publicado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta de familia `qwen3_5`; el checkpoint contiene un modelo de lenguaje, un codificador visual y una cabeza MTP) |
| Parametros totales | 27.781.427.952 (27,781B), según safetensors |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización mixta oQ (oMLX v0.7.1): affine 5 bits grupo 64 (25,699B, 5,50 bits/peso), affine 6 bits grupo 64 (0,294B, 6,50), affine 8 bits grupo 64 (1,272B, 8,50), BF16 (0,516B, 16,00). Promedio efectivo 5,843 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (`library_name: mlx`), repositorio de 20,3 GB |
| Desglose por componente | Lenguaje: 26,896B (19,008 GB / 17,703 GiB); visión: 0,461B (0,921 GB / 0,858 GiB); cabeza MTP: 0,425B (0,361 GB / 0,336 GiB) |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna del modelo base ni sobre su proceso de entrenamiento: el repositorio es una conversión de pesos y no incluye detalles de dataset, número de tokens, composición de datos ni fases de alineación (RLHF, DPO u otras). La etiqueta `qwen3_5` sugiere que deriva de la familia Qwen3.5 de Alibaba, y la presencia de un módulo de visión de 0,461B parámetros y de una cabeza MTP de 0,425B indica un modelo multimodal con decodificación especulativa integrada, pero estos extremos no están confirmados por documentación del autor.

La innovación técnica documentada es la propia cuantización. oQ aplica precisión mixta con asignación por tensor: la mayor parte de los pesos (92,506 % del total lógico) se almacena en affine 5 bits con grupo de 64, una fracción del 4,580 % sube a 8 bits y un 1,058 % a 6 bits, mientras que el 1,857 % restante se conserva en BF16. La cabeza MTP se guarda en un formato reducido (0,361 GB para 0,425B parámetros, es decir, por debajo de 8 bits efectivos), lo que sugiere que el autor la considera menos sensible a la pérdida de precisión, probablemente porque solo interviene en la verificación de tokens especulativos y no en la distribución final. El resultado es un checkpoint de 18,897 GiB que conserva componentes de alta precisión donde la cuantización agresiva suele degradar más la perplejidad.

## Capacidades

- Generación de texto y razonamiento: el componente de lenguaje concentra 26,896B parámetros, el 96,8 % del total del checkpoint.
- Procesamiento de imagen: incluye un codificador visual de 0,461B parámetros, lo que habilita entrada multimodal (el tipo exacto de tareas visuales no está documentado).
- Decodificación especulativa mediante cabeza MTP (multi-token prediction): permite proponer varios tokens por paso y verificarlos en paralelo, una técnica orientada a reducir la latencia de generación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (el repositorio no declara idiomas).
- Modo thinking explícito: no disponible.
- Audio: no disponible (no se declara componente de audio en el desglose de pesos).

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint está en formato MLX y ocupa 18,897 GiB de pesos, por lo que encaja en equipos con 32 GB o más de memoria unificada. Es el escenario natural para el que fue creado: ejecutar un modelo de 27,8B en un Mac sin GPU dedicada.
- Asistentes de escritorio con entrada de imagen: al incluir codificador visual, puede emplearse en aplicaciones que reciben capturas de pantalla o documentos escaneados y devuelven texto o acciones, siempre en local y sin enviar datos a un servicio externo.
- Prototipado de latencia baja: la cabeza MTP está pensada para decodificación especulativa, útil en aplicaciones interactivas (autocompletado, chat en tiempo real) donde el tiempo hasta el primer token y el throughput importan más que la calidad absoluta.
- Investigación en cuantización: el checkpoint sirve como caso de estudio reproducible de precisión mixta, ya que publica la distribución exacta de bits por tensor. Permite comparar la degradación de un esquema 5/6/8/BF16 frente a cuantizaciones uniformes de 4 u 8 bits.
- Evaluación de modelos multimodales en hardware de consumo: un pipeline de benchmarking que quiera medir calidad visión-lenguaje sin clúster de GPU puede usar este checkpoint como aproximación de bajo coste al modelo completo en BF16.
- Fine-tuning con LoRA sobre MLX: el formato y la librería permiten adaptar el modelo con técnicas de bajo rango en memoria unificada, aunque el soporte concreto de entrenamiento sobre un checkpoint ya cuantizado debe validarse experimentalmente.
- Despliegue en entornos con restricciones de privacidad: al no requerir conexión, encaja en escenarios de cumplimiento estricto (sanidad, legal) donde el texto no puede salir del dispositivo, siempre que se verifique la licencia antes de usarlo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de tareas multimodales, y tampoco se han encontrado fuentes externas que reporten métricas del modelo base Qwen3.8-27B. Tampoco hay datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: 18,897 GiB solo de pesos. Con caché KV y buffers de ejecución, conviene reservar entre 21 y 24 GB en función de la longitud de contexto, que no está documentada.
- Memoria unificada en Apple Silicon: cabe en configuraciones de 32 GB (con margen ajustado), 64 GB y 96 GB. En un equipo de 24 GB el checkpoint entraría al límite y probablemente fallaría al crecer el contexto.
- GPU NVIDIA: al estar en formato MLX, no es directamente ejecutable en CUDA sin reconvertir los pesos a otro formato. Para una hipotética conversión a GGUF, un equivalente de ~6 bits necesitaría del orden de 20 GB de VRAM, es decir, RTX 4090 (24 GB) o A100/H100.
- GPU recomendadas si se reconvierte el checkpoint: RTX 4090 o RTX 5090 para 24-32 GB; A100 40/80 GB o H100 para servicio concurrente con lotes mayores.
- Opciones de despliegue: `mlx-lm` y el propio ecosistema oMLX/oQ son las vías nativas. vLLM, TGI, llama.cpp y Ollama requieren conversión previa del formato y no están soportadas por el repositorio tal cual.
- Latencia y throughput: no disponibles. La presencia de la cabeza MTP sugiere que el autor prioriza velocidad de decodificación, pero no se publican cifras.

## Comparativa con modelos similares

No se han identificado alternativas verificables en la información disponible. La siguiente tabla recoge únicamente comparaciones derivadas del propio checkpoint y de aritmética de almacenamiento, no modelos de terceros evaluados:

| Configuracion | Parametros | Peso aproximado | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (oQ mixto, 5,843 bits/peso) | 27,781B | 18,897 GiB | no disponible | no disponible | HuggingFace, 0 descargas |
| Mismo modelo en BF16 (hipotético, calculado) | 27,781B | ~55,6 GB | no disponible | no disponible | no verificada su publicación |
| Mismo modelo en 8 bits uniforme (hipotético, calculado) | 27,781B | ~27,8 GB | no disponible | no disponible | no verificada su publicación |
| Modelo base Qwen3.8-27B | 27,781B (presumiblemente) | no disponible | no disponible | no disponible | no disponible en la información consultada |

## Limitaciones y advertencias

- Licencia no declarada: sin una licencia explícita, no puede asumirse permiso de uso comercial. Es un bloqueante para producción hasta que el autor o el titular original lo aclaren.
- Modelo derivado y no auditado: 0 descargas y 0 likes en el momento de la consulta, y publicación y actualización con cinco minutos de diferencia. No hay evidencia de validación por terceros de que la cuantización preserve la calidad del modelo original.
- Riesgo de degradación por cuantización: el 92,5 % de los pesos está a 5 bits. Aunque el esquema mixto protege tensores sensibles, no se publican métricas de perplejidad ni comparativas contra el BF16 que cuantifiquen la pérdida.
- Idiomas y contexto desconocidos: sin declaración de idiomas ni de longitud de contexto, es arriesgado asumir un buen rendimiento en castellano o en documentos largos sin pruebas propias.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala; no hay evaluación publicada que lo acote. Debe aplicarse verificación externa en cualquier flujo crítico.
- Sesgos: no documentados. Al desconocerse la composición del dataset de entrenamiento, no puede estimarse el sesgo demográfico, cultural o lingüístico.
- Dependencia de plataforma: MLX está atado al ecosistema Apple (Metal). El checkpoint no es portable a CUDA sin reconversión, lo que limita su uso en servidores convencionales.
- Ambigüedad de la denominación: el nombre "Qwen3.8-27B" no se corresponde con una nomenclatura publicada y verificable de la familia Qwen en las fuentes consultadas; conviene tratar la procedencia como no confirmada.
- La cabeza MTP almacenada por debajo de 8 bits efectivos podría degradar la tasa de aceptación de la decodificación especulativa; no hay mediciones al respecto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bambocher/Qwen3.8-27B-oQ5e-mtp
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos relacionados con este modelo; los resultados obtenidos eran plantillas de listas de la compra y no guardan relación con el contenido de la ficha.
