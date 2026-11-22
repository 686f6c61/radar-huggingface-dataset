# mradermacher/medgap-qwen-3.5-9b-GGUF

## Resumen

medgap-qwen-3.5-9b es un ajuste fino (fine-tune) del modelo Qwen 3.5 de 9B parámetros, desarrollado por ProtocolSync LLC y especializado en el dominio regulatorio de dispositivos médicos, concretamente en el análisis de cartas de advertencia (warning letters) de la FDA estadounidense. El modelo base ha sido adaptado sobre el dataset `protocolsyncllc/fda-warning-letters` para tareas de comprensión y generación de texto relacionadas con el cumplimiento normativo sanitario.

La versión aquí descrita es una cuantización estática en formato GGUF realizada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. El modelo original cuenta con 9.197.093.888 parámetros (aproximadamente 9,2 mil millones) y está publicado bajo licencia Apache 2.0.

Es relevante para equipos de desarrollo e investigación que necesitan desplegar un asistente especializado en documentación regulatoria médica en entornos con recursos limitados, aprovechando el ecosistema GGUF para inferencia local sin depender de infraestructura en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen 3.5); detalles especificos no disponibles |
| Parametros totales | 9.197.093.888 (~9,2B) |
| Parametros activos | No aplica (no es MoE, segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen 3.5 de 9B parámetros, una arquitectura transformer densa (no se indica que sea MoE). El ajuste se realizó sobre el dataset `protocolsyncllc/fda-warning-letters`, compuesto por cartas de advertencia de la FDA relacionadas con dispositivos médicos. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF, DPO o instrucción supervisada.

La innovación principal de esta ficha es la disponibilidad de cuantizaciones estáticas GGUF generadas por mradermacher, que abarcan desde Q2_K (4,0 GB) hasta f16 (18,5 GB), facilitando el despliegue en diferentes niveles de hardware. No se han publicado detalles sobre innovaciones arquitectónicas adicionales (decodificación especulativa, atención lineal, etc.) en la información disponible.

## Capacidades

- Generación de texto especializado en dominio regulatorio de dispositivos médicos (cartas de advertencia FDA).
- Comprensión y resumen de documentación normativa sanitaria en inglés.
- Conversación multi-turno (el modelo está etiquetado como conversacional).
- Capacidades generales heredadas del modelo base Qwen 3.5 (razonamiento, código, matemáticas), aunque no verificadas en esta ficha.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Análisis de cartas de advertencia de la FDA: el modelo puede extraer infracciones, plazos y requisitos de respuesta de documentos regulatorios, aprovechando su ajuste específico sobre este corpus.
- Asistencia en cumplimiento normativo de dispositivos médicos: revisión de borradores de respuestas a la FDA y verificación de que se cubren los puntos señalados.
- Clasificación y triaje de documentación regulatoria: categorización de cartas por tipo de infracción o área de producto, útil en flujos de trabajo de calidad y asuntos regulatorios.
- Generación de resúmenes ejecutivos para equipos legales y de calidad: síntesis de documentos extensos en inglés para revisión interna.
- Despliegue local en entornos con requisitos de confidencialidad: al ser GGUF, puede ejecutarse en infraestructura propia sin enviar datos sensibles a servicios externos.
- Prototipado rápido de asistentes internos: con cuantizaciones Q4_K_M (5,9 GB) se puede integrar en herramientas de escritorio o servidores modestos para pruebas de concepto.
- Formación y consulta interna: chatbot de apoyo para equipos que necesitan entender el lenguaje regulatorio de la FDA sin acceso a un experto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~4,0 GB de pesos; ~5-6 GB de VRAM con overhead.
  - Q4_K_M: ~5,9 GB de pesos; ~7-8 GB de VRAM con overhead.
  - Q8_0: ~9,9 GB de pesos; ~11-12 GB de VRAM con overhead.
  - f16: ~18,5 GB de pesos; ~20-22 GB de VRAM con overhead.
- GPU recomendadas: RTX 3060 12 GB o superior para Q4_K_M; RTX 4090 (24 GB) para Q8_0 o f16; A100/H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB con Q4_K_M o inferiores; en GPUs de 8 GB con Q2_K/Q3_K_S.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones; se requeriría el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| medgap-qwen-3.5-9b (este) | ~9,2B | No disponible | Apache 2.0 | GGUF | Fine-tune especializado en FDA warning letters |
| Qwen 3.5 9B (base) | ~9,2B | No disponible | Apache 2.0 | Safetensors | Modelo generalista sin especialización regulatoria |
| Modelos médicos de ~7-9B (p. ej., BioMistral, Meditron) | 7-9B | Variable | Variable | Safetensors/GGUF | Especializados en conocimiento médico general, no en regulación FDA |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el ajuste se centra en cartas de advertencia de la FDA sobre dispositivos médicos; su rendimiento fuera de ese dominio puede degradarse respecto al modelo base.
- Idioma: solo se declara inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinación: como todo modelo generativo, puede inventar referencias regulatorias, plazos o requisitos; requiere verificación humana en contextos de cumplimiento.
- Sesgos: no se han documentado evaluaciones de sesgo; el corpus de la FDA puede reflejar sesgos institucionales o de dominio.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar el cumplimiento de las obligaciones de atribución y las condiciones del modelo base Qwen 3.5.
- Contexto: no se ha publicado la longitud de contexto; no se debe asumir una ventana larga sin verificación.
- Producción: no hay benchmarks publicados ni garantías de calidad; se recomienda evaluación propia antes de desplegar en flujos regulatorios críticos.
- Cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso serio.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/mradermacher/medgap-qwen-3.5-9b-GGUF
- Modelo base: https://huggingface.co/protocolsyncllc/medgap-qwen-3.5-9b
- Dataset: https://huggingface.co/datasets/protocolsyncllc/fda-warning-letters
- Página de descargas del cuantizador: https://hf.tst.eu/model#medgap-qwen-3.5-9b-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico de perplejidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
