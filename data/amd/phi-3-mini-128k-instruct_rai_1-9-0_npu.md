# amd/Phi-3-mini-128k-instruct_rai_1.9.0_npu

## Resumen

Phi-3-mini-128k-instruct_rai_1.9.0_npu es una distribución del modelo Phi-3-mini-128k-instruct de Microsoft, publicada por AMD y optimizada para ejecutarse en las NPU (unidades de procesamiento neuronal) de los procesadores AMD Ryzen AI mediante el stack Ryzen AI Software 1.9.0. El modelo conserva las capacidades del original (generación de texto, razonamiento e instrucciones en inglés) pero se distribuye en formato ONNX con código personalizado y cuantización Quark, de modo que pueda desplegarse sobre la arquitectura XDNA/XDNA2 integrada en las APU Ryzen.

Se trata de un transformer decoder-only de aproximadamente 3.800 millones de parámetros con una ventana de contexto de 128.000 tokens, orientado a instrucciones y conversación. La relevancia de esta variante no está en el modelo base, sino en el empaquetado: permite ejecutar inferencia local en hardware de consumo x86 con NPU dedicada, sin GPU discreta, algo que interesa a quienes construyen asistentes locales, aplicaciones de ofimática con IA o prototipos de agentes en portátiles Ryzen AI.

La ficha se basa exclusivamente en la información disponible en la model card y los metadatos del repositorio de HuggingFace; los detalles de entrenamiento, benchmarks o composición del dataset del modelo original no se reproducen aquí salvo que estén confirmados en esa información.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-3-mini), exportado a ONNX con código personalizado |
| Parámetros totales | Aproximadamente 3.800 millones (modelo base Phi-3-mini) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantización | Cuantización Quark para NPU Ryzen AI (detalle de precisión exacta no disponible) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | ONNX (con custom_code); tamaño del repositorio 4,4 GB |

## Arquitectura y entrenamiento

El modelo subyacente es Phi-3-mini de Microsoft, un transformer decoder-only denso de unos 3.800 millones de parámetros con atención estándar y ventana de contexto de 128.000 tokens. Esta distribución de AMD no reentrena el modelo: lo convierte y cuantiza con el toolkit Quark y lo empaqueta en ONNX con código personalizado para su ejecución sobre la NPU de Ryzen AI en la versión 1.9.0 del stack. El repositorio incluye los artefactos necesarios para el runtime de Ryzen AI, no pesos en safetensors ni GGUF.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni las fases de alineación (RLHF/DPO) del modelo original. Tampoco se documentan innovaciones adicionales más allá de la propia optimización para NPU (particionado del grafo ONNX, cuantización específica para XDNA/XDNA2 y ejecución con el runtime de Ryzen AI).

## Capacidades

- Generación de texto e instrucciones en inglés, incluyendo respuestas conversacionales multi-turno.
- Razonamiento de sentido común, matemáticas básicas y tareas de comprensión lectora propias de un modelo de 3,8B.
- Generación de código y explicaciones técnicas a nivel introductorio-medio.
- Manejo de contextos largos de hasta 128.000 tokens, útil para resumir documentos extensos.
- Ejecución local en NPU Ryzen AI, sin necesidad de GPU discreta.
- No se documenta en la información disponible soporte explícito de tool calling, function calling, visión, audio ni modo "thinking" específico.

## Casos de uso

- Asistentes locales en portátiles Ryzen AI: el modelo se ejecuta sobre la NPU integrada, liberando CPU y GPU para el resto del sistema; adecuado para resúmenes y respuestas rápidas sin conexión.
- Procesamiento de documentos largos en local: con 128.000 tokens de contexto se pueden resumir contratos, informes o actas sin trocear en exceso, manteniendo los datos en el dispositivo.
- Generación de borradores de correo y textos administrativos: el modelo responde a instrucciones en inglés con un tono ajustable, útil en herramientas de ofimática con IA integrada.
- Soporte a la programación en entornos corporativos: autocompletado y explicación de fragmentos de código dentro de IDE, con la ventaja de que el código no sale del equipo.
- Chatbot de atención al cliente en inglés para pymes: despliegue en servidores con CPU Ryzen AI sin GPU, reduciendo coste por consulta frente a APIs en la nube.
- Prototipado de agentes conversacionales: sirve como modelo de razonamiento local para pipelines de varios pasos en fase de desarrollo, antes de migrar a modelos mayores.
- Educación y experimentación: permite a estudiantes e investigadores probar inferencia LLM en hardware de consumo x86 con NPU, sin depender de clústeres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- NPU AMD Ryzen AI (arquitectura XDNA/XDNA2) con el stack Ryzen AI Software 1.9.0 instalado; el repositorio está etiquetado explícitamente como `ryzenai` y `npu`.
- No requiere GPU discreta; la inferencia se ejecuta en la NPU integrada de las APU Ryzen AI compatibles.
- Tamaño del repositorio: 4,4 GB, lo que da una idea del espacio en disco necesario para los artefactos ONNX cuantizados.
- VRAM estimada: no aplica al ejecutarse en NPU; la memoria compartida del sistema debe cubrir el modelo y el contexto.
- No se documenta en la información disponible compatibilidad con vLLM, llama.cpp, Ollama o TGI; el despliegue previsto es mediante el runtime de Ryzen AI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| amd/Phi-3-mini-128k-instruct_rai_1.9.0_npu | ~3,8B | 128k | ONNX (Quark) | MIT | NPU Ryzen AI |
| microsoft/Phi-3-mini-128k-instruct | ~3,8B | 128k | safetensors | MIT | GPU/CPU genérica |
| microsoft/Phi-3-mini-4k-instruct | ~3,8B | 4k | safetensors | MIT | GPU/CPU genérica |
| Llama 3.2 3B Instruct | ~3,2B | 128k | safetensors, GGUF | Llama 3.2 Community | GPU/CPU genérica |

La comparativa se limita a datos de catálogo; no se dispone de resultados de benchmarks en la información proporcionada para contrastar rendimiento entre estas opciones.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y exige aceptar condiciones en HuggingFace antes de la descarga.
- Idioma: solo se declara soporte de inglés; el rendimiento en castellano no está garantizado.
- Modelo de 3,8B: propenso a errores en razonamiento complejo, matemáticas avanzadas y tareas de código de alta dificultad; riesgo de alucinación inherente a su tamaño.
- Dependencia de hardware específico: solo funciona en NPU Ryzen AI con el stack 1.9.0; no es portable a GPU NVIDIA, Apple Silicon ni CPU genérica sin reconversión.
- Formato ONNX con `custom_code`: requiere confiar en el código incluido en el repositorio y en el runtime de AMD; no es un checkpoint estándar de transformers.
- Licencia MIT del modelo, pero conviene revisar los términos de uso del stack Ryzen AI Software y de los drivers de AMD para producción.
- Sin benchmarks publicados en esta distribución: el rendimiento real en NPU puede diferir del modelo original en GPU.
- Sesgos: no documentados en la información disponible; se heredan los del modelo base Phi-3-mini.

## Enlaces

- HuggingFace: https://huggingface.co/amd/Phi-3-mini-128k-instruct_rai_1.9.0_npu
- Modelo base: https://huggingface.co/microsoft/Phi-3-mini-128k-instruct
- Ryzen AI Software: https://ryzenai.docs.amd.com/
- Quark (toolkit de cuantización de AMD): https://quark.docs.amd.com/
