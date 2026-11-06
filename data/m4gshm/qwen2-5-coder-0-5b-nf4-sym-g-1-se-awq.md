# m4gshm/Qwen2.5-Coder-0.5B-nf4-sym-g-1-se-awq

## Resumen

`m4gshm/Qwen2.5-Coder-0.5B-nf4-sym-g-1-se-awq` es una exportación a formato OpenVINO IR del modelo Qwen2.5-Coder-0.5B de Alibaba. No se trata de un modelo entrenado desde cero, sino de una conversión y cuantización del checkpoint original pensada para inferencia eficiente sobre hardware Intel (CPU, iGPU y NPU) mediante el runtime OpenVINO. El autor, m4gshm, aplica cuantización NF4 simétrica con escalas AWQ (activation-aware weight quantization), estimación de escalas y calibración con un subconjunto de GSM8K.

El modelo base, Qwen2.5-Coder-0.5B, es un transformer decoder-only de la familia Qwen2 (arquitectura `Qwen2ForCausalLM`) con 0,5 mil millones de parámetros, especializado en generación de código y conversación técnica. Su tamaño reducido lo hace apto para entornos con recursos limitados, prototipado rápido y despliegue en el borde. La ventaja de esta variante concreta es el peso final: el repositorio ocupa 0,3 GB y los pesos IR pesan 0,29 GB, lo que permite cargar el modelo en memoria de forma muy económica.

La relevancia de esta ficha radica en que combina un modelo de código pequeño y abierto (licencia Apache 2.0) con un pipeline de cuantización agresivo (4 bits por canal) y un runtime (OpenVINO) orientado a inferencia en dispositivos Intel sin GPU dedicada. Es una opción práctica para quien necesite autocompletado o generación de código en local con huella de memoria mínima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`Qwen2ForCausalLM`) |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-Coder-0.5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | NF4 simetrica, `group_size=-1` (per-channel), escalas AWQ, estimacion de escalas, calibracion con GSM8K |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (`openvino_model.xml` + `openvino_model.bin`), tokenizer/detokenizer OpenVINO, `tokenizer.json`, `config.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-Coder-0.5B: un transformer decoder-only con atención causal estándar, preentrenado y ajustado por Alibaba para tareas de código. Esta exportación no modifica la arquitectura ni reentrena el modelo; únicamente transforma los pesos a OpenVINO IR y los cuantiza. La cuantización aplicada es NF4 simétrica con granularidad per-channel (`group_size=-1`), complementada con escalas AWQ calculadas a partir de activaciones y con un paso de estimación de escalas. El conjunto de calibración empleado es GSM8K, lo que orienta la calibración hacia tareas de razonamiento matemático y texto estructurado.

El resultado son pesos de 0,29 GB en IR, con tokenizer y detokenizer también compilados a OpenVINO. El autor no documenta el número de tokens de entrenamiento original ni la composición del dataset del modelo base, ni si hubo RLHF/DPO; esa información corresponde a la model card de Qwen y no se incluye en esta conversión. Tampoco se documentan innovaciones de decodificación (especulativa, atención lineal, etc.); el valor técnico de esta variante está en la cuantización y en el empaquetado para Optimum-Intel.

## Capacidades

- Generación de texto autoregresiva y conversación multi-turno mediante plantilla de chat (`chat_template.jinja`).
- Generación y autocompletado de código, herencia directa del ajuste de Qwen2.5-Coder.
- Razonamiento matemático básico, reforzado en la calibración con GSM8K (aunque el tamaño de 0,5B limita la profundidad).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada para esta exportación concreta.
- Soporte de agentes y razonamiento multi-paso: no documentado; el tamaño del modelo lo hace poco adecuado para cadenas de razonamiento largas.
- Capacidades multilingües: no disponibles en la informacion proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no soportadas; la model card indica explícitamente que solo admite texto (Images: No).

## Casos de uso

- Autocompletado de código en IDE local: el modelo puede integrarse como backend de un plugin de editor (por ejemplo, mediante un servidor compatible con la API de generación) para sugerir líneas y fragmentos. Su peso de 0,29 GB permite mantenerlo residente en memoria en un portátil sin GPU dedicada.
- Generación de código en pipelines de documentación: útil para producir ejemplos de uso, docstrings y fragmentos de test a partir de firmas de funciones, con latencia baja en CPU Intel gracias a OpenVINO.
- Prototipado de asistentes conversacionales técnicos: la plantilla de chat permite construir un chatbot de soporte para preguntas sobre APIs o errores de compilación, ejecutándose en el propio dispositivo.
- Inferencia en el borde (edge) sobre hardware Intel: despliegue en mini-PC, NUC o dispositivos con iGPU/NPU Intel para tareas de generación de texto sin conexión a la nube.
- Filtrado y transformación de texto estructurado: el modelo puede reformatear logs, extraer campos de salidas de herramientas o normalizar snippets, aprovechando la calibración con GSM8K para entradas con números.
- Educación y experimentación: base ligera para comparar técnicas de cuantización (NF4 + AWQ vs. otras) y medir impacto en calidad sobre un modelo de referencia abierto.
- Generación de tests unitarios simples: a partir de una función corta, el modelo puede proponer casos de prueba básicos, adecuado para proyectos pequeños o ejercicios docentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas de calidad tras la cuantización.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 0,3 GB para los pesos IR en NF4; el consumo real en ejecución depende del runtime y del contexto, pero cabe holgadamente en menos de 1 GB de memoria.
- GPU recomendadas: no requiere GPU dedicada; está pensado para CPU Intel, iGPU Intel y NPU Intel mediante OpenVINO.
- Compatibilidad con GPU de consumo: no se documenta soporte CUDA; el formato OpenVINO IR no es directamente compatible con llama.cpp, vLLM ni TGI.
- Opciones de despliegue: Optimum-Intel (`OVModelForCausalLM`), runtime OpenVINO, y servidores compatibles con OpenVINO (por ejemplo, OpenVINO Model Server) si se configura la conversión adecuada.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware Intel concreto y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| m4gshm/Qwen2.5-Coder-0.5B-nf4-sym-g-1-se-awq | 0,5B | No disponible | OpenVINO IR (NF4+AWQ) | Apache 2.0 | Exportación cuantizada para Intel; 0,29 GB de pesos |
| Qwen/Qwen2.5-Coder-0.5B | 0,5B | No disponible en esta ficha | Safetensors (original) | Apache 2.0 | Modelo base sin cuantizar; requiere conversión para OpenVINO |
| Qwen/Qwen2.5-Coder-1.5B | 1,5B | No disponible en esta ficha | Safetensors | Apache 2.0 | Mayor capacidad de código a costa de más memoria |
| Modelos de código de ~0,5B en GGUF (p. ej. variantes de Qwen2.5-Coder) | 0,5B | Variable | GGUF | Apache 2.0 | Alternativa para llama.cpp/Ollama; no usa OpenVINO |

La comparación directa con alternativas cuantizadas en otros formatos (GGUF, AWQ para CUDA) no está documentada en la información disponible; la elección depende del hardware objetivo (Intel vs. NVIDIA/CPU genérica).

## Limitaciones y advertencias

- El modelo base tiene solo 0,5B de parámetros: la calidad en razonamiento complejo, matemáticas avanzadas y código de gran escala es limitada en comparación con modelos de 7B o superiores.
- La cuantización NF4 con `group_size=-1` (per-channel) es agresiva; puede degradar la fidelidad respecto al checkpoint original, especialmente en tareas sensibles a precisión numérica.
- El conjunto de calibración es GSM8K, lo que puede sesgar la calibración hacia texto matemático y no representar bien otros dominios (código, conversación general).
- Riesgo de alucinación inherente a modelos pequeños; no debe usarse como fuente de verdad en producción sin verificación.
- Idiomas soportados no documentados en esta exportación; el comportamiento multilingüe depende del modelo base y no está garantizado.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías; conviene revisar la licencia del modelo base Qwen2.5-Coder-0.5B.
- El formato OpenVINO IR limita el despliegue a entornos con runtime OpenVINO; no es portable a llama.cpp, vLLM, TGI ni Ollama sin conversión previa.
- Solo entrada de texto; no admite imágenes ni audio.
- Repositorio con muy pocas descargas (20) y sin likes: poca validación comunitaria; conviene verificar la calidad de la conversión antes de usarla en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/m4gshm/Qwen2.5-Coder-0.5B-nf4-sym-g-1-se-awq
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B
- Documentación de Optimum-Intel: https://huggingface.co/docs/optimum-intel
- Runtime OpenVINO: https://docs.openvino.ai
- NNCF (Neural Network Compression Framework): https://github.com/openvinotoolkit/nncf
