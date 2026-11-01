# fbaldassarri/meta-llama_Llama-3.1-8B-Instruct-auto_awq-int4-gs64-asym

## Resumen

Esta ficha describe una cuantizacion INT4 del modelo instructivo Llama 3.1 8B de Meta, publicada por el usuario fbaldassarri. No se trata de un modelo nuevo, sino de una conversión de pesos del checkpoint `meta-llama/Llama-3.1-8B-Instruct` a 4 bits mediante la técnica AWQ (Activation-aware Weight Quantization) implementada en Intel AutoRound v0.16.0. El objetivo es reducir el espacio en memoria y acelerar la inferencia (el autor indica 2-3x de speedup) manteniendo una calidad cercana al modelo original en bfloat16.

El artefacto está pensado específicamente para despliegue en hardware Intel: CPU, iGPU Arc y NPU (AI Boost de la serie Core Ultra) a través de intel-extension-for-pytorch y OpenVINO. La cuantizacion es asimétrica, con grupo de tamaño 64, y se calibró con 128 muestras de 512 tokens durante 200 iteraciones en CPU, un proceso que el autor registra con una duración de aproximadamente 677 minutos.

Es relevante ahora porque permite ejecutar un modelo de 8B parámetros con capacidades conversacionales, tool calling y contexto largo de 128K tokens en equipos sin GPU dedicada de gran VRAM. Sin embargo, la model card advierte explícitamente de que la inferencia no está habilitada en el Hub (`inference: false`) y de que el modelo se desarrolló solo con fines de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), cuantizado a INT4 |
| Parametros totales | 2.046.038.016 (según safetensors del repo cuantizado); el modelo base tiene 8B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredado de Llama 3.1 8B Instruct; no se especifica en la model card de la cuantización) |
| Tipos de cuantizacion | INT4, group size 64, asimétrica (sym=false), WoQ/AWQ |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (transformers), con configuración `auto_awq` |

## Arquitectura y entrenamiento

El modelo base es Llama 3.1 8B Instruct, un transformer decoder-only con atención por grupos (GQA) y 8.000 millones de parámetros, entrenado por Meta con un corpus multilingüe y ajustado por instrucciones con técnicas de alineación (SFT y RLHF/DPO, según la documentación pública de Meta; no se detalla en la información proporcionada). Esta versión concreta no ha sido reentrenada: solo se han cuantizado los pesos.

La cuantización se realizó con Intel AutoRound 0.16.0 usando el algoritmo AWQ en modo weights-only (WoQ). La calibración se ejecutó en CPU con 128 muestras, longitud de secuencia 512, batch de 4 y 200 iteraciones de tuning, cargando el modelo en bfloat16. El resultado son pesos INT4 con grupo de 64 y cuantización asimétrica. El autor documenta el proceso completo de replicación mediante el pipeline `auto-round-pipeline` y un script de Python con `AutoRound`. La duración registrada fue de 40.670,7 segundos (677,8 minutos) en CPU.

## Capacidades

- Generación de texto conversacional multi-turno en ocho idiomas (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés).
- Razonamiento general, respuesta a preguntas y resumen de documentos.
- Generación de código y matemáticas, heredado de las capacidades del modelo base Llama 3.1 8B Instruct.
- Soporte de tool calling y function calling, ya que el modelo base incluye plantillas de herramientas en su chat template.
- Capacidad de seguir instrucciones y mantener roles system/user/assistant mediante `apply_chat_template`.
- No incluye visión, audio ni modo de razonamiento explícito (thinking mode); son capacidades del modelo base, no añadidas por la cuantización.
- La cuantización INT4 puede degradar ligeramente la precisión en tareas de razonamiento complejo o código, según advierte el propio autor ("slight accuracy drop at W4G64").

## Casos de uso

- **Atención al cliente automatizada en CPU**: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 128K tokens del base) en servidores sin GPU, usando intel-extension-for-pytorch o OpenVINO, lo que reduce costes de infraestructura.
- **Asistentes locales en portátiles con Intel Core Ultra**: despliegue en NPU (AI Boost) o iGPU Arc para asistentes de escritorio, resumen de documentos y correo, con consumo energético bajo y sin conexión a la nube.
- **Generación de código en pipelines de CI/CD**: integración en herramientas de revisión automática o generación de tests mediante tool calling, siempre que se acepte una ligera pérdida de precisión frente al modelo en bf16.
- **Procesamiento de documentación multilingüe**: clasificación, extracción y resumen de textos en español, inglés, francés, alemán, italiano, portugués, hindi y tailandés en entornos de investigación.
- **Prototipado rápido de agentes**: al soportar function calling y plantillas de chat, sirve para validar flujos de agentes multi-paso en hardware de bajo coste antes de escalar a modelos mayores.
- **Chatbot embebido en aplicaciones de escritorio**: el tamaño reducido del repo (8 GB) y la cuantización INT4 permiten distribuir el modelo junto a la aplicación y ejecutarlo en CPU sin dependencias de red.
- **Evaluación comparativa de cuantizaciones**: útil como referencia para medir la pérdida de calidad de AWQ INT4 frente a otros esquemas (GPTQ, GGUF Q4_K_M) en tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica un speedup estimado de 2-3x y una "ligera caída de precisión" en W4G64, sin cifras concretas de MMLU, HumanEval, GSM8K ni latencia medida.

## Requisitos de hardware

- **VRAM/RAM estimada**: el repo ocupa 8,0 GB; en INT4 los pesos rondan los 4-5 GB, por lo que se puede ejecutar con 6-8 GB de RAM libre en CPU o con una GPU de 8 GB.
- **GPU recomendadas**: no se especifican; el autor orienta el artefacto a CPU Intel, iGPU Arc y NPU Core Ultra. Para GPU NVIDIA se puede usar el formato auto_awq con librerías compatibles, pero no es el objetivo declarado.
- **Consumer GPU**: cabe en GPUs de 8 GB (RTX 3060 Ti, RTX 4060, RTX 3070) si se usa un runtime compatible con AWQ; en CPU cabe en equipos con 8-16 GB de RAM.
- **Opciones de despliegue**: transformers con `device_map="auto"`, intel-extension-for-pytorch (CPU/iGPU), OpenVINO (NPU), y potencialmente vLLM o TGI si soportan el formato auto_awq (no confirmado en la información). llama.cpp/Ollama no aplican directamente porque el formato es safetensors AWQ, no GGUF.
- **Latencia y throughput**: no disponibles; el autor solo afirma 2-3x de speedup frente a bf16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Llama 3.1 8B Instruct AWQ INT4) | 8B (2,05B en safetensors del repo) | 128K (base) | INT4 AWQ gs64 asim | Llama 3.1 Community | HuggingFace, 19 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128K | bf16/fp16 | Llama 3.1 Community | HuggingFace oficial |
| Llama 3.1 8B Instruct GPTQ INT4 (comunidad) | 8B | 128K | INT4 GPTQ | Llama 3.1 Community | Múltiples repos de comunidad |
| Llama 3.1 8B Instruct GGUF Q4_K_M (comunidad) | 8B | 128K | 4-bit GGUF | Llama 3.1 Community | Múltiples repos de comunidad |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- **Pérdida de precisión**: la cuantización W4G64 introduce una caída de calidad no cuantificada; el autor la describe como "slight" pero no aporta benchmarks.
- **Sesgos y alucinaciones**: hereda los sesgos y el riesgo de alucinación del modelo base Llama 3.1 8B Instruct; la cuantización puede amplificarlos en tareas de razonamiento largo.
- **Idiomas**: aunque la model card lista ocho idiomas, el rendimiento fuera del inglés puede ser desigual, especialmente en hindi y tailandés.
- **Licencia**: Llama 3.1 Community License impone restricciones de uso comercial (límite de 700 millones de usuarios mensuales, obligación de atribución y de nombrar el modelo "Llama"), además de prohibiciones de uso concretas.
- **Inferencia no habilitada en el Hub**: el campo `inference: false` indica que no se puede probar directamente en la web de HuggingFace.
- **Orientado a hardware Intel**: el autor lo ha validado para CPU, iGPU Arc y NPU; en GPU NVIDIA el soporte depende de runtimes de terceros y no está garantizado.
- **Solo investigación**: la model card declara explícitamente que el modelo se desarrolló solo con fines de investigación y sin garantía.
- **Procedencia del pipeline**: la receta de replicación apunta a un repositorio en `git.epicdynamic.com`, un dominio no estándar; conviene verificar su autenticidad antes de ejecutar scripts.
- **Fecha de creación anómala**: el repo figura creado el 2026-10-30, lo que puede indicar metadatos inconsistentes.

## Enlaces

- HuggingFace: https://huggingface.co/fbaldassarri/meta-llama_Llama-3.1-8B-Instruct-auto_awq-int4-gs64-asym
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE
- Intel AutoRound: https://github.com/intel/auto-round
- Pipeline de replicación: https://git.epicdynamic.com/auto-round-pipeline
- Resultados de búsqueda web: no relevantes (los enlaces devueltos tratan sobre tiendas Lidl y no guardan relación con el modelo).
