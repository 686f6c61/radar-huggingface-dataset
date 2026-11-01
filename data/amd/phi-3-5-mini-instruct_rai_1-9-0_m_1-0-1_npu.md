# amd/Phi-3.5-mini-instruct_rai_1.9.0_m_1.0.1_npu

## Resumen

El modelo `amd/Phi-3.5-mini-instruct_rai_1.9.0_m_1.0.1_npu` es una distribución optimizada de Phi-3.5-mini-instruct publicada por AMD para su plataforma Ryzen AI. Se trata de una conversión a formato ONNX del modelo original de Microsoft, empaquetada con el runtime RyzenAI (RAI 1.9.0) y dirigida específicamente a la unidad de procesamiento neuronal (NPU) integrada en los procesadores AMD Ryzen AI. No es un modelo nuevo: es el mismo Phi-3.5-mini-instruct, pero compilado y cuantizado para ejecutarse en hardware NPU de AMD.

El modelo base Phi-3.5-mini-instruct es un transformer decoder-only de aproximadamente 3.800 millones de parámetros, entrenado por Microsoft con un enfoque en razonamiento, código y matemáticas, y con una ventana de contexto de 128.000 tokens. Esta versión de AMD mantiene las capacidades del original pero cambia el formato de pesos (ONNX en lugar de safetensors) y el target de ejecución (NPU Ryzen AI en lugar de GPU/CPU genérica).

Su relevancia radica en que permite ejecutar un modelo de ~3,8B parámetros en local sobre portátiles y mini-PC con Ryzen AI, sin GPU dedicada, aprovechando la NPU para inferencia de baja potencia. Está pensado para desarrolladores que quieran prototipar asistentes conversacionales on-device con aceleración hardware específica de AMD.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-3.5-mini-instruct, formato ONNX) |
| Parámetros totales | ~3,8 mil millones (modelo base Phi-3.5-mini) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredado del modelo base; verificar en runtime RAI) |
| Tipos de cuantización | no disponible (el repo no detalla el esquema de cuantización usado en el empaquetado NPU) |
| Idiomas soportados | en (inglés; el modelo base soporta más idiomas, pero la ficha declara solo `en`) |
| Licencia | MIT |
| Formato de pesos | ONNX (empaquetado para Ryzen AI / RAI 1.9.0, target `m_1.0.1_npu`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-3.5-mini-instruct de Microsoft: un transformer decoder-only denso de ~3,8B parámetros, con atención multi-cabeza estándar y ventana de contexto de 128K tokens. El entrenamiento del modelo base combinó datos web filtrados de alta calidad con datos sintéticos generados por modelos mayores, y pasó por fases de fine-tuning supervisado y optimización por preferencias (DPO/RLHF) para alineamiento conversacional e instrucciones. Esta distribución de AMD no reentrena ni modifica los pesos semánticos: los convierte a ONNX y los empaqueta para el runtime RyzenAI.

La innovación técnica de esta versión no está en el modelo sino en el despliegue: el paquete `rai_1.9.0_m_1.0.1_npu` está compilado para la NPU de Ryzen AI (arquitectura XDNA), lo que permite ejecutar inferencia con menor consumo energético que en CPU/GPU. El identificador `m_1.0.1_npu` indica la versión del modelo compilado y el target de hardware. El tamaño del repo (2,8 GB) es coherente con un modelo de ~3,8B parámetros cuantizado para NPU.

## Capacidades

- Generación de texto conversacional multi-turno con instrucciones.
- Razonamiento de propósito general y resolución de problemas de complejidad media.
- Generación y explicación de código en varios lenguajes.
- Matemáticas y razonamiento cuantitativo básico-intermedio.
- Soporte de tool calling / function calling (heredado de Phi-3.5-mini-instruct).
- Capacidad de seguir instrucciones estructuradas y formatear salidas (JSON, listas, tablas).
- Capacidades multilingües limitadas: la ficha declara únicamente inglés (`en`).
- Sin visión, audio ni modo "thinking" explícito (no es un modelo multimodal ni de razonamiento extendido).
- Ejecución on-device acelerada por NPU Ryzen AI mediante el runtime RAI.

## Casos de uso

- Asistentes conversacionales on-device en portátiles Ryzen AI: el modelo puede gestionar diálogos multi-turno en local sin conexión a la nube, aprovechando la NPU para reducir consumo y latencia frente a ejecución en CPU.
- Generación de código en editores locales: integrable en plugins de IDE que necesiten autocompletado y explicación de fragmentos sin enviar código a servidores externos, gracias a sus capacidades de código y tool calling.
- Procesamiento de documentos largos en local: con contexto de hasta 128K tokens (según runtime), puede resumir contratos, informes o artículos extensos en equipos sin GPU dedicada.
- Automatización de tareas de escritorio con agentes: el soporte de function calling permite conectarlo a herramientas locales (sistema de ficheros, APIs internas) en flujos multi-paso.
- Prototipado de aplicaciones de privacidad estricta: sectores como sanidad o legal pueden desplegarlo en hardware Ryzen AI para procesar texto sensible sin salir del dispositivo.
- Educación y tutoría interactiva: generación de explicaciones y ejercicios en inglés en aplicaciones de aprendizaje offline para portátiles con NPU AMD.
- Evaluación de pipelines ONNX/NPU: sirve como referencia para desarrolladores que quieran medir el rendimiento de Ryzen AI con un modelo conversacional de tamaño medio antes de migrar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repo de HuggingFace no incluye métricas de latencia, throughput ni evaluaciones comparativas para esta conversión NPU. Para benchmarks del modelo base, consultar la ficha oficial de Microsoft de Phi-3.5-mini-instruct.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el mismo sentido que GPU; el modelo se ejecuta en NPU Ryzen AI. El repo ocupa 2,8 GB, por lo que se necesita al menos esa cantidad de memoria accesible (RAM del sistema o memoria compartida de la NPU).
- GPU recomendadas: no aplica; el target es la NPU de procesadores AMD Ryzen AI (serie 7000/8000 y posteriores con XDNA/XDNA2).
- ¿Cabe en consumer GPU? El modelo base de 3,8B sí cabe en GPUs consumer (p. ej. RTX 3060 12 GB o superiores en FP16), pero esta distribución concreta está compilada para NPU, no para CUDA.
- Opciones de despliegue: runtime RyzenAI (RAI 1.9.0) con el paquete `m_1.0.1_npu`; para el modelo base en otros backends, vLLM, llama.cpp, Ollama u ONNX Runtime genérico.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / target | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| amd/Phi-3.5-mini-instruct_rai_1.9.0_m_1.0.1_npu | ~3,8B | 128K (heredado) | ONNX / NPU Ryzen AI | MIT | Gated en HuggingFace |
| microsoft/Phi-3.5-mini-instruct | ~3,8B | 128K | safetensors / GPU-CPU | MIT | Público en HuggingFace |
| Qwen2.5-3B-Instruct | ~3,1B | 32K | safetensors, GGUF | Apache 2.0 | Público en HuggingFace |
| Llama-3.2-3B-Instruct | ~3,2B | 128K | safetensors, GGUF | Llama 3.2 Community License | Gated en HuggingFace |

La diferencia clave frente a las alternativas es el target de hardware: esta distribución solo es práctica en equipos con NPU Ryzen AI, mientras que los otros modelos se despliegan en GPU, CPU o NPU genéricas mediante backends estándar.

## Limitaciones y advertencias

- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace antes de descargar.
- Es una conversión de hardware, no un modelo nuevo: hereda todos los sesgos y limitaciones del Phi-3.5-mini-instruct original.
- Riesgo de alucinación inherente a modelos de ~3,8B, especialmente en tareas de conocimiento factual y matemáticas complejas.
- La ficha declara únicamente inglés; el rendimiento en castellano no está garantizado ni evaluado.
- Dependencia fuerte del runtime RyzenAI 1.9.0 y de la NPU del hardware AMD: no es portable a CUDA, ROCm genérico ni otros aceleradores sin reconversión.
- No se documentan en el repo el esquema de cuantización ni la pérdida de precisión respecto al modelo original; conviene validar la calidad en el caso de uso concreto.
- Licencia MIT permite uso comercial, pero debe verificarse que el empaquetado ONNX y las dependencias del runtime RAI respeten las condiciones de redistribución de AMD.
- Sin métricas publicadas de latencia ni throughput: es necesario medir en el hardware objetivo antes de comprometerse con un despliegue en producción.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta: ecosistema y soporte comunitario muy limitados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/amd/Phi-3.5-mini-instruct_rai_1.9.0_m_1.0.1_npu
- Modelo base Phi-3.5-mini-instruct (Microsoft): https://huggingface.co/microsoft/Phi-3.5-mini-instruct
- Documentación de Ryzen AI (AMD): https://www.amd.com/en/developer/resources/ryzen-ai-software.html
- No se han encontrado en la información proporcionada papers, blogs ni demos adicionales específicos de esta conversión.
