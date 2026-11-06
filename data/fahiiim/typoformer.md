# fahiiim/TypoFormer

## Resumen

TypoFormer es un modelo híbrido consciente de caracteres desarrollado por Md. Fahim Sarker Mridul (usuario fahiiim en Hugging Face), diseñado para resolver dos tareas complementarias en un único trunk de unos 94M de parámetros: autocompletado causal de siguiente palabra y corrección gramatical y ortográfica no autorregresiva (GEC). Su objetivo es ofrecer asistencia de escritura en tiempo real, completamente offline, sobre CPU de escritorio, con presupuestos de latencia estrictos (sub-15 ms por pulsación de tecla).

La relevancia del modelo radica en su enfoque edge: en lugar de depender de LLM en la nube para autocompletar o corregir texto, TypoFormer ejecuta localmente mediante runtimes ONNX cuantizados a INT8, eliminando dependencia de red, coste por token y problemas de privacidad. Para lograrlo, fusiona subwords Byte-Level BPE con convoluciones 1D multi-escala sobre caracteres, mediante una gating highway aprendida, lo que evita la fragmentación de tokens cuando las palabras contienen erratas.

El repositorio publica checkpoints PyTorch en safetensors con código de arquitectura y script de fine-tuning, además de runtimes ONNX INT8 listos para despliegue en escritorio. Incluye también un dataset sintético de GEC y modelado de lenguaje de unas 53.000 muestras y una aplicación de escritorio para Windows. La versión publicada es la v2.4 ("Stage 2 Open Weights"), bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido consciente de caracteres (BPE byte-level + CNN de caracteres multi-escala con gating highway), atención agrupada por consultas (GQA), RoPE, SwiGLU, RMSNorm pre-atención, cabezas duales (generación causal y etiquetado de ediciones) |
| Parametros totales | 93,88M (94M) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (ONNX); pesos originales sin cuantizar en PyTorch/safetensors |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch) y ONNX INT8 |

## Arquitectura y entrenamiento

TypoFormer emplea una entrada de doble canal: por un lado, un tokenizador Byte-Level BPE con un vocabulario compacto de 16.000 entradas; por otro, los bytes UTF-8 de cada token se procesan en bancos paralelos de convoluciones 1D con tamaños de kernel k ∈ {2, 3, 5, 8}, seguidos de GELU y max-pooling. Ambas representaciones se combinan mediante una gating highway aprendida, lo que permite al modelo conservar información ortográfica exacta incluso cuando una errata fragmenta la palabra en subwords raros. El backbone transformer usa atención agrupada por consultas (GQA) para reducir coste de memoria, embeddings rotatorios (RoPE), redes feed-forward SwiGLU y RMSNorm en posición previa a la atención.

El modelo es multi-tarea con dos cabezas: una cabeza causal autorregresiva para autocompletado de siguiente palabra y una cabeza de etiquetado de secuencia de ediciones para corrección gramatical no autorregresiva, que repara puntuación, vocabulario confuso, concordancia sujeto-verbo y erratas severas sin generación libre (y por tanto sin riesgo de alucinación generativa en esa tarea). El entrenamiento se realizó sobre un dataset sintético de GEC y modelado de lenguaje de unas 53.000 muestras publicado por el autor (fahiiim/TypoFormer-Synthetic-Dataset). No se dispone de detalles sobre uso de RLHF/DPO ni número total de tokens de entrenamiento.

## Capacidades

- Autocompletado causal de siguiente palabra con latencia objetivo sub-15 ms por pulsación en CPU local, sin conectividad a la nube.
- Corrección gramatical y ortográfica no autorregresiva mediante etiquetado de ediciones: puntuación, vocabulario confuso, concordancia sujeto-verbo y erratas severas.
- Representación consciente de caracteres: robustez ante palabras mal escritas gracias a la fusión de BPE byte-level con CNN de caracteres multi-escala, evitando la fragmentación de tokens fuera de vocabulario.
- Clasificación de tokens (token-classification) además de generación de texto, reflejada en las pipelines del repositorio.
- Ejecución offline en entornos edge mediante runtimes ONNX cuantizados a INT8.
- Fine-tuning habilitado: el repositorio incluye el código de arquitectura (modeling_typoformer.py) y un script de entrenamiento (finetune.py) para continuar el entrenamiento sobre datasets de dominio propio.
- No se ha documentado soporte de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Autocompletado en editores de texto offline: integrado como companion de teclado en escritorio (el repositorio incluye una aplicación para Windows), predice la siguiente palabra en menos de 15 ms por pulsación sin enviar datos a ningún servidor, adecuado para entornos con requisitos de privacidad.
- Corrección gramatical en tiempo real: la cabeza GEC no autorregresiva repara erratas y errores de concordancia mientras el usuario escribe, sin generar reescrituras no solicitadas, gracias al esquema de etiquetado de ediciones.
- Procesamiento de texto en entornos sin conexión: al ejecutarse íntegramente en CPU con ONNX INT8, es apto para equipos corporativos aislados, quioscos o sistemas embebidos de escritorio donde no hay acceso a la nube.
- Asistente de escritura para comunicación profesional: los ejemplos del widget muestran autocompletado de consultas a clientes y frases técnicas de ingeniería, útil para redactar correos y documentación con terminología específica.
- Punto de partida para fine-tuning de dominio: investigadores pueden reentrenar el modelo con el script finetune.py sobre corpus especializados (médico, legal, técnico) manteniendo el tamaño reducido de 94M.
- Corrección de texto con alta tasa de erratas: la entrada consciente de caracteres mantiene representaciones coherentes ante palabras muy corruptas (por ejemplo, "definatly" en lugar de "definitely"), donde los tokenizadores BPE puros fallan.
- Prototipado de NLP edge: el formato ONNX INT8 permite integrar el modelo en aplicaciones .NET, Python o C++ con onnxruntime sin dependencias de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card menciona una sección de benchmarks y métricas de evaluación, pero no incluye cifras concretas en el contenido extraído. Como métricas operativas, el autor declara latencia sub-10 ms en CPU para inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo está diseñado para ejecutarse en CPU. Con 94M de parámetros, el peso en FP32 ocupa unos 375 MB y la versión ONNX INT8 considerablemente menos; el repositorio completo pesa 2,2 GB.
- GPU recomendadas: no necesario para inferencia. Para fine-tuning, no se especifican requisitos; una GPU de consumo con 8-16 GB de VRAM debería ser suficiente dado el tamaño del modelo (estimación no confirmada por el autor).
- Consumer GPU: no es necesario; el modelo cabe y está optimizado para CPU de escritorio estándar.
- Despliegue: onnxruntime (librería principal del repositorio) con los runtimes ONNX INT8; PyTorch con safetensors para entrenamiento y fine-tuning; aplicación de escritorio para Windows con instalación en una línea descrita en la model card. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el autor declara latencia sub-10 ms en CPU y un presupuesto objetivo sub-15 ms por pulsación de teclado para autocompletado.

## Comparativa con modelos similares

| Modelo | Parametros | Tareas | Ejecucion | Licencia |
|---|---|---|---|---|
| TypoFormer (fahiiim) | 93,88M | Autocompletado causal + GEC no autorregresivo | CPU local, ONNX INT8, offline | MIT |
| T5-small / T5-base (fine-tuned para GEC) | 60M-220M | GEC autorregresiva (seq2seq) | CPU/GPU, ONNX posible | Apache 2.0 |
| GPT-2 small (124M) | 124M | Solo generación causal (autocompletado) | CPU/GPU, GGUF vía llama.cpp | MIT (pesos OpenAI modificados) |

TypoFormer se diferencia de alternativas como T5 para GEC en que no genera el texto corregido de forma autorregresiva, sino mediante etiquetado de ediciones, lo que reduce la latencia y el riesgo de reescrituras no deseadas. Frente a un GPT-2 pequeño usado para autocompletar, TypoFormer añade la representación consciente de caracteres y la cabeza de corrección en el mismo modelo, a costa de ser un modelo especializado en inglés y no un LLM de propósito general. No hay datos de benchmarks comparativos publicados.

## Limitaciones y advertencias

- Soporte limitado al inglés; no es apto para castellano ni otros idiomas según la documentación disponible.
- Modelo altamente especializado: no sirve como LLM de propósito general para razonamiento, código, matemáticas ni conversación abierta.
- Dataset de entrenamiento sintético y reducido (unas 53.000 muestras de GEC y LM), lo que puede limitar la cobertura de errores reales y de dominios no representados; conviene validar con datos propios antes de producción.
- No se han publicado benchmarks estandarizados independientes; las cifras de latencia proceden del autor y no han sido verificadas externamente.
- Riesgo de alucinación bajo en la tarea de corrección (al ser no autorregresiva por etiquetado de ediciones), pero presente en la tarea de autocompletado generativo.
- No se ha documentado soporte de tool calling, agentes ni contextos largos; la longitud de contexto no está especificada.
- La licencia MIT permite uso comercial sin restricciones relevantes.
- El modelo es de autoría individual con pocas descargas (799) y un solo like en el momento de la ficha, lo que implica una comunidad de mantenimiento limitada y mayor riesgo de abandono o errores sin detectar.
- La inferencia está marcada como deshabilitada en el widget de Hugging Face (inference: false); hay que ejecutar el modelo localmente con onnxruntime o PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fahiiim/TypoFormer
- Repositorio de GitHub del autor: https://github.com/fahiiim/TyPoTaKer
- Dataset sintético de entrenamiento: https://huggingface.co/datasets/fahiiim/TypoFormer-Synthetic-Dataset
- Diagrama de arquitectura en alta resolución: https://huggingface.co/fahiiim/TypoFormer/resolve/main/typoformer_architecture.png
- Perfil del autor en GitHub: https://github.com/fahiiim
