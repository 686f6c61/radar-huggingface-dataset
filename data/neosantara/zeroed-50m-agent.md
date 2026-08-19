# neosantara/Zeroed-50M-Agent

## Resumen

Zeroed-50M-Agent es un modelo de lenguaje de tipo decoder-only Transformer de aproximadamente 50 millones de parámetros, desarrollado por el equipo Neosantara y entrenado desde cero sobre trayectorias de agentes de ingeniería de software. El objetivo declarado es servir como un agente de codificación capaz de operar en tareas de resolución de problemas de software, utilizando los conjuntos de datos `nvidia/SWE-Zero-openhands-trajectories` y `nebius/SWE-agent-trajectories`.

El modelo presenta una arquitectura compacta de 10 capas con dimensión oculta 512, 8 cabezas de atención, MLP SwiGLU de 2048 unidades, normalización RMSNorm y codificación posicional RoPE. Su ventana de contexto es de 2048 tokens y emplea un vocabulario BPE de 16384 tokens. El entrenamiento se realizó en una GPU Tesla T4 con precisión mixta FP16 durante solo 20 pasos, alcanzando una pérdida final de 94.68, lo que indica un grado de convergencia muy bajo.

La relevancia actual del modelo es limitada: por su tamaño y su entrenamiento extremadamente corto, no es apto para uso en producción. Su interés reside más en el ámbito experimental o educativo, como ejemplo de entrenamiento desde cero de un modelo de agente de codificación con recursos mínimos. No se han publicado resultados de benchmarks ni evaluaciones independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (10 capas, hidden 512, 8 heads, MLP 2048 SwiGLU, RMSNorm, RoPE) |
| Parametros totales | ~50.000.000 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (repo solo contiene pesos en formato safetensors sin cuantizacion publicada) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 0.4 GB) |

## Arquitectura y entrenamiento

El modelo es un Transformer decoder-only convencional, sin mezcla de expertos ni arquitecturas hibridas. Sus componentes son estandar: atencion multi-cabeza con RoPE, normalizacion RMSNorm y MLP con activacion SwiGLU. La peculiaridad es su pequeno tamano (50M) y su vocabulario reducido (16384 tokens) basado en un ByteLevel BPE personalizado.

El entrenamiento se realizo desde cero sobre trayectorias de agentes de software (conversaciones y acciones de agentes resolviendo tareas de SWE-bench). Se aplico un enmascaramiento de perdida que solo considera las respuestas del asistente, ignorando las partes del prompt. El proceso utilizo AdamW con learning rate 0.0003 y weight decay 0.1, en precision mixta FP16 sobre una GPU T4. El numero de pasos fue de solo 20, con una perdida final de 94.68, un valor extremadamente alto que sugiere que el modelo no ha aprendido patrones linguisticos utiles. No se menciona el uso de RLHF, DPO ni ninguna tecnica de alineacion posterior.

## Capacidades

- Generacion de texto: el modelo puede producir secuencias de texto, pero su calidad es muy baja debido al subentrenamiento.
- Razonamiento: no se ha demostrado capacidad de razonamiento logico o matematico; con 50M de parametros y 20 pasos de entrenamiento, es improbable que desarrolle habilidades complejas.
- Codigo: el objetivo declarado es la generacion de codigo y la resolucion de tareas de ingenieria de software, pero no hay evidencias de que logre completar tareas reales de SWE-bench.
- Tool calling / function calling: no se menciona soporte explicito en la model card.
- Agentes y multi-step reasoning: no se ha validado ningun comportamiento agente.
- Multilingue: solo ingles (etiqueta `en`).
- Capacidades especiales: ninguna documentada.

## Casos de uso

- Investigacion academica sobre modelos pequenos: sirve como ejemplo de entrenamiento desde cero con recursos limitados (una GPU T4) y para estudiar el efecto del tamano y los datos en agentes de codificacion.
- Prototipado de pipelines de entrenamiento: util para probar infraestructuras de entrenamiento (loss masking, datasets de trayectorias) sin coste computacional elevado.
- Educacion en IA: puede usarse en cursos para ilustrar la arquitectura Transformer y el proceso de entrenamiento de un LM desde cero.
- Pruebas de inferencia en entornos restringidos: al ser muy pequeno, puede ejecutarse en CPU o GPUs de baja gama para validar la integracion con frameworks de inferencia.
- No es recomendable para tareas reales de generacion de codigo, atencion al cliente, analisis de datos ni ninguna aplicacion que requiera calidad linguistica o razonamiento fiable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones en MMLU, HumanEval, GSM8K ni SWE-bench. La perdida de entrenamiento final (94.68) es un indicador de rendimiento pobre, pero no hay metricas de evaluacion independientes.

## Requisitos de hardware

- VRAM estimada: el modelo tiene ~50M de parametros. En FP32 ocuparia unos 200 MB; en FP16 unos 100 MB. Cualquier GPU moderna (incluso integrada) puede ejecutarlo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1650, T4, o incluso CPU con 4 GB de RAM).
- Cabe en GPUs de consumo: si, en todas las GPUs de consumo actuales.
- Opciones de despliegue: compatible con frameworks estandar como Hugging Face Transformers, vLLM (aunque para 50M es sobredimensionado), llama.cpp (si se convierte a GGUF) y Ollama (tras conversion).
- Latencia y throughput: al ser tan pequeno, la inferencia es casi instantanea en GPU. En CPU, la generacion de 2048 tokens tardaria unos pocos segundos. No hay datos oficiales.

## Comparativa con modelos similares

No hay una comparativa directa disponible. Modelos de tamano similar (50M) como SmolLM-135M o TinyStories-33M tienen propositos diferentes y no estan orientados a agentes de codificacion. Ademas, Zeroed-50M-Agent carece de resultados de benchmarks que permitan una comparacion objetiva. Por tanto, no se puede establecer una tabla comparativa fiable.

## Limitaciones y advertencias

- Subentrenamiento severo: solo 20 pasos de entrenamiento con una perdida final de 94.68, lo que implica que el modelo no ha aprendido a generar texto coherente ni a seguir instrucciones de forma util.
- Riesgo de alucinacion: extremadamente alto, incluso para tareas simples, debido a la falta de convergencia.
- Contexto limitado: ventana de 2048 tokens, insuficiente para tareas de ingenieria de software reales que suelen requerir archivos completos.
- Solo ingles: no soporta otros idiomas.
- Licencia MIT: permite uso comercial, pero el modelo no es apto para produccion por su calidad.
- No hay garantias de seguridad: no se ha realizado ninguna evaluacion de sesgos, toxicidad o comportamientos daninos.
- Repo sin mantenimiento: creado en agosto de 2026, sin actualizaciones posteriores ni comunidad activa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neosantara/Zeroed-50M-Agent
- Web de Neosantara: https://www.neosantara.xyz/
- Documentacion de Neosantara: https://docs.neosantara.xyz/
- Documentacion de agentes de Neosantara: https://docs.neosantara.xyz/en/agent-overview
