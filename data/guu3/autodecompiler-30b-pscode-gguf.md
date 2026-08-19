# guu3/AutoDecompiler-30B-pscode-GGUF

## Resumen

AutoDecompiler-30B-pscode-GGUF es una conversión al formato GGUF en precisión BF16 del modelo AutoDecompiler-30B-pscode, desarrollado por el equipo AutoDecompiler y convertido por el usuario guu3. El modelo está especializado en una tarea muy concreta: transformar el P-code o pseudocódigo generado por decompiladores (como Ghidra o IDA) en un borrador de código fuente de alto nivel, facilitando la ingeniería inversa de binarios. No está diseñado para decompilar ensamblador directamente, sino para trabajar sobre la representación intermedia que ya producen las herramientas existentes.

El modelo se basa en una arquitectura Qwen3 MoE con 30.532 millones de parámetros totales y una ventana de contexto teórica de 262.144 tokens, aunque en la práctica el contexto útil está limitado por la memoria disponible. Según el paper asociado, el entrenamiento emplea aprendizaje por refuerzo (reinforcement learning) para mejorar la fidelidad de la decompilación, logrando mejoras significativas frente a modelos base como Qwen3-Coder 30B. Esta conversión GGUF no modifica los pesos; es únicamente un cambio de formato para poder ejecutarse con llama.cpp.

La relevancia actual de este modelo radica en que la decompilación asistida por LLM es un campo emergente con aplicaciones directas en análisis de malware, auditoría de seguridad y recuperación de código legacy. Al estar disponible en GGUF, puede desplegarse en entornos locales con llama.cpp sin depender de servicios en la nube, lo que resulta atractivo para equipos de seguridad que manejan binarios sensibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 MoE (mezcla de expertos) |
| Parametros totales | 30.532.122.624 (30,5 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (teorico, limitado por memoria en la practica) |
| Tipos de cuantizacion | BF16 (unico archivo GGUF, sin cuantizaciones adicionales) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repositorio upstream no declara licencia) |
| Formato de pesos | GGUF v3, BF16 (archivo de 56,89 GiB) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de mezcla de expertos (MoE) basada en Qwen3, aunque no se han publicado detalles sobre el número de expertos ni los parámetros activos por token. La conversión GGUF conserva la arquitectura original y la plantilla de chat de Qwen3, tal como se indica en la model card del repositorio.

En cuanto al entrenamiento, el paper titulado "AutoDecompiler: Reinforcement-Learning-Trained Binary Decompilation LLM" (arXiv:2606.16162) describe un enfoque basado en aprendizaje por refuerzo para ajustar el modelo a la tarea de decompilación. No se especifican el número de tokens de entrenamiento ni la composición del dataset, pero los resultados reportados indican que el entrenamiento específico para P-code supera al fine-tuning genérico: AutoDecompiler-Pscode 30B mejora en un 44,82 % la métrica Re-com y en un 57,62 % la métrica Re-exe frente a DecLLM basado en Qwen3-Coder 30B. Esto sugiere que el modelo no depende únicamente de la capacidad bruta del backbone, sino de un entrenamiento orientado a la tarea con retroalimentación por refuerzo.

## Capacidades

- Decompilacion de P-code: convierte pseudocodigo de decompiladores (P-code) en un borrador de codigo fuente de alto nivel, preservando la estructura de control y las operaciones principales.
- Generacion de texto conversacional: al incluir la plantilla de chat de Qwen3, puede usarse como asistente de chat, aunque su especialidad es la decompilacion.
- Reproducibilidad en evaluaciones: la model card recomienda usar decodificacion greedy (temperatura 0) para obtener resultados consistentes.
- No soporta decompilacion directa de ensamblador: el modelo espera recibir P-code o pseudocodigo, no instrucciones de bajo nivel.
- No se mencionan capacidades de tool calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Analisis de malware: los analistas pueden extraer el P-code de una muestra con Ghidra y pasarlo al modelo para obtener una version legible en C o pseudocodigo de alto nivel, acelerando la comprension de la logica maliciosa.
- Auditoria de seguridad de binarios propietarios: al auditar aplicaciones cerradas, el modelo ayuda a reconstruir funciones criticas (validacion de entrada, manejo de credenciales) a partir del P-code, facilitando la busqueda de vulnerabilidades.
- Recuperacion de codigo legacy: cuando una empresa ha perdido el codigo fuente original de un sistema antiguo, el modelo puede generar borradores de las funciones a partir de los binarios, sirviendo como punto de partida para la reimplementacion.
- Ingenieria inversa de firmware: en dispositivos embebidos, el P-code extraido de firmware se puede convertir a codigo de alto nivel para documentar protocolos o algoritmos propietarios.
- Automatizacion de pipelines de reversing: integrando el modelo con llama.cpp y scripts, se puede procesar un lote de funciones de forma automatica, generando documentacion preliminar para grandes proyectos de ingenieria inversa.
- Educacion en reversing: estudiantes de seguridad pueden comparar el codigo generado por el modelo con el binario original para aprender como se traducen las construcciones de bajo nivel a alto nivel.

## Benchmarks y rendimiento

El paper asociado reporta comparaciones relativas frente a DecLLM (basado en Qwen3-Coder 30B). No se han publicado valores absolutos de metricas estandar como MMLU, HumanEval o GSM8K en la informacion disponible.

| Modelo | Mejora en Re-com | Mejora en Re-exe |
|---|---|---|
| AutoDecompiler-Pscode 30B vs DecLLM (Qwen3-Coder 30B) | +44,82 % | +57,62 % |

Estos datos indican que el entrenamiento con refuerzo aporta una ventaja sustancial en la tarea de decompilacion, pero no permiten comparar el modelo con alternativas fuera de este dominio especifico.

## Requisitos de hardware

- VRAM estimada: los pesos BF16 ocupan aproximadamente 57 GiB, por lo que se necesita al menos 64 GiB de VRAM para cargar el modelo completo en GPU, mas memoria adicional para la cache KV y el workspace de ejecucion.
- GPU recomendadas: NVIDIA A100 80 GB, H100 80 GB, o configuraciones multi-GPU (por ejemplo, dos RTX 4090 de 24 GB no serian suficientes por separado, pero si en paralelo con tecnicas de sharding).
- Compatibilidad con consumer GPU: no cabe en una GPU de consumo tipica (RTX 4090 tiene 24 GB, RTX 3090 24 GB). Se podria ejecutar en CPU con llama.cpp, pero con latencia alta.
- Opciones de despliegue: llama.cpp (llama-server) es la via recomendada en la model card. Tambien es posible usar vLLM si se convierte a otro formato, aunque no se menciona. Ollama no soporta GGUF BF16 sin cuantizar de forma nativa.
- Latencia y throughput: no disponibles. La model card advierte que funciones muy grandes pueden ser truncadas o volverse impracticamente lentas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| AutoDecompiler-30B-pscode | 30,5 B (MoE) | 262 K (teorico) | Decompilacion de P-code | no disponible |
| DecLLM (Qwen3-Coder 30B) | 30 B (aprox.) | no disponible | Decompilacion (fine-tuning generico) | no disponible |
| Qwen3-Coder 30B | 30 B (aprox.) | no disponible | Codigo y razonamiento general | Apache 2.0 (segun version) |

La comparativa se basa en la informacion del paper, que muestra que AutoDecompiler supera claramente a DecLLM en las metricas de decompilacion. No se dispone de datos suficientes para comparar con otros modelos especificos de reversing.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio upstream no especifica una licencia, lo que impide su uso comercial o redistribucion sin consultar a los autores. Esta conversion GGUF tampoco añade una licencia nueva.
- Codigo generado no fiable: el modelo puede emitir identificadores o tipos invalidos, y el resultado debe tratarse como un borrador de primera pasada, no como codigo definitivo.
- Limitacion de tamano de funcion: funciones muy grandes pueden ser truncadas o generar respuestas incompletas.
- No decompila ensamblador: si se le pasa codigo de bajo nivel directamente, el resultado no sera util.
- Contexto practico limitado: aunque la metadata anuncia 262 K tokens, el contexto real depende de la memoria disponible y de la configuracion de llama.cpp.
- Sesgos y alucinaciones: al ser un modelo de lenguaje, puede inventar estructuras o nombres de variables que no existen en el binario original. Se recomienda validar siempre contra el binario y el flujo de control real.

## Enlaces

- Repositorio GGUF: https://huggingface.co/guu3/AutoDecompiler-30B-pscode-GGUF
- Modelo original: https://huggingface.co/AutoDecompiler/AutoDecompiler-30B-pscode
- Paper (arXiv): https://arxiv.org/abs/2606.16162
- Version HTML del paper: https://arxiv.org/html/2606.16162v1
