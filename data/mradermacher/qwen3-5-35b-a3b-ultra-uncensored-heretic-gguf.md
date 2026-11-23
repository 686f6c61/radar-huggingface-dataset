# mradermacher/Qwen3.5-35B-A3B-ultra-uncensored-heretic-GGUF

## Resumen

El repositorio `mradermacher/Qwen3.5-35B-A3B-ultra-uncensored-heretic-GGUF` contiene una coleccion de cuantizaciones estaticas en formato GGUF derivadas del modelo `llmfan46/Qwen3.5-35B-A3B-ultra-uncensored-heretic`. Se trata, por tanto, de un artefacto de distribucion y no de un modelo entrenado desde cero por el autor del repositorio; mradermacher actua aqui como conversor y publicador de cuantizaciones para su uso con llama.cpp y herramientas compatibles.

La nomenclatura del nombre sugiere una base Qwen3.5 de tipo Mixture of Experts con 35.000 millones de parametros totales y 3.000 millones activos (patron "35B-A3B"), afinada para reducir el alineamiento de rechazo ("uncensored") y con un ajuste adicional de tipo "heretic". No obstante, la informacion disponible no confirma estos extremos: el unico dato de parametros verificable en la ficha de Hugging Face es de 446.571.248 parametros en safetensors, muy inferior a los 35.000 millones que sugiere el nombre, lo que impide validar la arquitectura y el tamano reales.

La relevancia del repositorio es practica: ofrece variantes de cuantizacion en un rango amplio de precisiones (desde Q2_K hasta F16, incluyendo IQ4_XS y Q8_0), lo que permite desplegar el modelo en hardware muy diverso. El repositorio es de creacion reciente (23 de noviembre de 2026), no registra descargas ni likes, y no declara licencia ni idiomas soportados, por lo que su evaluacion en produccion exige verificacion adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere MoE con 35B totales y 3B activos, sin confirmar) |
| Parametros totales | 446.571.248 segun safetensors de la ficha; el nombre indica 35B (dato no confirmado) |
| Parametros activos | no disponible (el nombre sugiere 3B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo origen se distribuye en safetensors |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura interna del modelo base en la documentacion proporcionada. El nombre del repositorio apunta a una familia Qwen3.5 con topologia Mixture of Experts (35B totales, 3B activos), pero este dato no se confirma en la model card ni en los metadatos de la ficha, y contrasta con el recuento de parametros en safetensors (446,5 millones), que corresponde a un modelo de escala muy distinta. Tampoco se detallan el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO u otras tecnicas de alineacion.

Lo unico verificable es el proceso de cuantizacion: la model card indica `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que describe una conversion desde pesos en formato Hugging Face a GGUF con cuantizacion estatica de tensores. Las etiquetas del nombre ("ultra-uncensored", "heretic") sugieren un ajuste orientado a reducir comportamientos de rechazo, pero no se aporta ninguna descripcion tecnica del procedimiento, de los datos empleados ni de las metricas de evaluacion asociadas.

## Capacidades

- Generacion de texto en formato GGUF, ejecutable con llama.cpp y derivados (Ollama, LM Studio, etc.).
- Razonamiento y conversacion multi-turno: capacidad esperada por herencia de la familia Qwen, no verificada en la informacion disponible.
- Generacion de codigo y matematicas: no confirmado en la documentacion proporcionada.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modo "thinking", vision o audio: no disponible.
- Comportamiento "uncensored": el nombre indica un ajuste para reducir rechazos, sin documentacion tecnica que lo respalde.

## Casos de uso

- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar el modelo en equipos con GPU de consumo mediante llama.cpp, siempre que se valide primero el tamano real de los pesos descargados.
- Experimentacion con modelos sin alineamiento de rechazo: util para investigacion sobre seguridad, evaluacion de sesgos y estudios de comportamiento en entornos controlados y aislados.
- Prototipado rapido de asistentes conversacionales: la disponibilidad de multiples niveles de cuantizacion facilita iterar entre calidad y velocidad segun los recursos del equipo.
- Pruebas comparativas de cuantizacion: el repositorio cubre desde Q2_K hasta F16, lo que permite medir la degradacion de calidad por nivel de precision en una misma familia de pesos.
- Integracion en pipelines de inferencia CPU/GPU mixtos: el formato GGUF con soporte de offloading parcial encaja en entornos sin aceleradores de gama alta.
- Evaluacion de riesgos antes de produccion: dado que no hay licencia declarada ni benchmarks publicados, el modelo es adecuado como banco de pruebas interno, no como componente directo de un servicio al cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision. Si el modelo real tuviera 35B parametros, F16 requeriria del orden de 70 GB y Q4_K_M en torno a 20-22 GB; si el recuento de safetensors (446,5 M) fuera el correcto, cabria en cualquier GPU de consumo con menos de 2 GB en F16. La discrepancia impide dar una cifra fiable.
- GPU recomendadas: no disponible. Para un hipotetico modelo de 35B en Q4_K_M se necesitarian GPU con 24 GB o mas (RTX 3090, RTX 4090, A100 40 GB, H100); para el recuento de 446,5 M bastaria una GPU integrada o una RTX 3060.
- Cabe en GPU de consumo: probablemente si en cuantizaciones bajas (Q2_K a Q4_K_S), condicionado al tamano real de los pesos.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF (llama-cpp-python, text-generation-webui). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (Qwen3.5-35B-A3B-ultra-uncensored-heretic-GGUF) | 446,5 M segun safetensors; 35B segun el nombre (no confirmado) | no disponible | no disponible | GGUF | Hugging Face, 0 descargas |
| Qwen2.5-32B-Instruct (referencia de la familia) | 32,5 B | 131.072 tokens | Apache 2.0 | safetensors, GGUF | Amplia, con benchmarks publicos |
| Mixtral 8x7B Instruct | 46,7 B (12,9 B activos) | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Amplia, con benchmarks publicos |
| Llama 3.1 70B Instruct | 70,6 B | 131.072 tokens | Llama 3.1 Community License | safetensors, GGUF | Amplia, con benchmarks publicos |

La comparativa es orientativa: los datos del modelo de este repositorio no estan confirmados y las alternativas citadas corresponden a familias conocidas con documentacion publica. No se dispone de datos de rendimiento del modelo evaluado para contrastar con las alternativas.

## Limitaciones y advertencias

- Discrepancia critica de parametros: el nombre indica 35B-A3B, pero la ficha declara 446.571.248 parametros en safetensors. Es imprescindible verificar el tamano real de los ficheros GGUF antes de planificar el despliegue.
- Licencia no declarada: sin licencia explicita no se puede asumir permiso para uso comercial; hay que contactar con el autor o consultar el modelo origen.
- Sin benchmarks publicados: no hay evidencia de calidad en MMLU, HumanEval, GSM8K ni otras tareas.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin evaluacion publicada no puede acotarse.
- Ajuste "uncensored" y "heretic": reduce los rechazos de seguridad, lo que incrementa el riesgo de generar contenido danino, sesgado o ilegal. No apto para exposicion directa a usuarios finales sin filtros adicionales.
- Idiomas no declarados: el soporte multilingue, en particular del castellano, no esta garantizado.
- Contexto desconocido: no puede dimensionarse el uso en tareas de contexto largo.
- Repositorio sin traccion (0 descargas, 0 likes) y creado en noviembre de 2026: sin validacion comunitaria ni issues que reporten comportamiento en produccion.
- Origen derivado: cualquier problema de calidad o licencia del modelo base (`llmfan46/Qwen3.5-35B-A3B-ultra-uncensored-heretic`) se hereda en estas cuantizaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-35B-A3B-ultra-uncensored-heretic-GGUF
- Modelo origen: https://huggingface.co/llmfan46/Qwen3.5-35B-A3B-ultra-uncensored-heretic
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
