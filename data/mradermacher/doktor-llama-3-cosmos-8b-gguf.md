# mradermacher/doktor-llama-3-cosmos-8b-GGUF

## Resumen

Doktor Llama 3 Cosmos 8B es un modelo de lenguaje especializado en el dominio médico, desarrollado por el usuario kayrab y ajustado mediante SFT (supervised fine-tuning) sobre una base Llama 3, con el objetivo de responder preguntas de pacientes en turco. El modelo original (kayrab/doktor-llama-3-cosmos-8b) ha sido cuantizado a formato GGUF por mradermacher, un conocido creador de cuantizaciones estáticas para llama.cpp, lo que permite su despliegue en hardware de consumo.

El modelo cuenta con 8.030.261.248 parámetros (aproximadamente 8B) y está orientado exclusivamente al idioma turco (etiqueta `tr`). Se entrenó sobre el dataset kayrab/patient-doctor-qa-tr-321179, un corpus de pares pregunta-respuesta entre pacientes y médicos. Su licencia MIT facilita tanto el uso comercial como la modificación, aunque su especialización vertical y su limitación a un único idioma restringen su aplicabilidad general.

Esta ficha se centra en la versión GGUF publicada por mradermacher, que ofrece 12 cuantizaciones distintas (desde Q2_K hasta f16) para adaptarse a diferentes presupuestos de VRAM y requisitos de calidad. Es relevante para desarrolladores que necesiten desplegar un asistente médico en turco en entornos con recursos limitados, usando llama.cpp, Ollama u otros runners compatibles con GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3, según el nombre del modelo; detalles exactos no disponibles) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | turco (tr) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base kayrab/doktor-llama-3-cosmos-8b se construyó, según las etiquetas de la model card, mediante fine-tuning supervisado (SFT) con la librería TRL y la infraestructura de Unsloth, partiendo de una arquitectura Llama 3. Los tags indican el uso de `transformers`, `unsloth`, `llama`, `trl` y `sft`, lo que confirma un pipeline de ajuste supervisado sobre el corpus kayrab/patient-doctor-qa-tr-321179. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron etapas de RLHF o DPO.

La versión publicada por mradermacher es una cuantización estática (quantize_version 2, output_tensor_quantised 1, convert_type hf) del modelo base, generada con llama.cpp. El autor indica que no ha producido cuantizaciones con imatrix/weighted en el momento de la publicación, aunque deja abierta la posibilidad de hacerlo si se solicita. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en turco orientada a preguntas y respuestas de índole médica.
- Respuesta a consultas de pacientes dentro del dominio sanitario (síntomas, dudas generales, orientación).
- Fine-tuning específico sobre pares paciente-médico, lo que favorece un registro conversacional adecuado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al turco según la etiqueta de idioma; no se declaran otros idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Asistente de triaje inicial en turco: el modelo puede gestionar conversaciones multi-turno con pacientes que describen síntomas en turco, ofreciendo orientación preliminar antes de derivar a un profesional, gracias a su ajuste específico sobre diálogos paciente-médico.
- Chatbot de educación sanitaria: responder dudas frecuentes sobre prevención, hábitos saludables o interpretación de términos médicos en turco, usando las cuantizaciones Q4_K_M o Q5_K_M para un equilibrio entre calidad y velocidad en servidores modestos.
- Prototipado de aplicaciones clínicas en local: al estar en GGUF y con licencia MIT, permite integrarse en prototipos que se ejecutan en portátiles con GPU de consumo (por ejemplo, Q4_K_S con ~5 GB) sin depender de APIs externas ni enviar datos de pacientes a terceros.
- Generación de material formativo para personal sanitario: producir borradores de respuestas a preguntas frecuentes de pacientes que luego un profesional revisa y edita, aprovechando el registro conversacional del corpus de entrenamiento.
- Investigación en NLP clínico en turco: servir como baseline especializado para experimentos de evaluación de calidad de respuestas médicas, comparación de cuantizaciones o estudios de sesgo en dominios sanitarios de habla turca.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q2_K (3,3 GB) y Q3_K_S (3,8 GB) permiten ejecutar el modelo en CPUs o GPUs con poca VRAM para demos y pruebas de concepto, aunque con pérdida de calidad.
- Integración en sistemas de documentación clínica: ayudar a redactar resúmenes o reformular explicaciones médicas en turco para notas dirigidas a pacientes, siempre con supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~3,3 GB de pesos; en la práctica ~4-5 GB con overhead de contexto.
  - Q3_K_S / Q3_K_M / Q3_K_L: ~3,8-4,4 GB de pesos; ~5-6 GB con contexto.
  - IQ4_XS / Q4_K_S / Q4_K_M: ~4,6-5,0 GB de pesos; ~6-7 GB con contexto.
  - Q5_K_S / Q5_K_M: ~5,7-5,8 GB de pesos; ~7-8 GB con contexto.
  - Q6_K: ~6,7 GB de pesos; ~8-9 GB con contexto.
  - Q8_0: ~8,6 GB de pesos; ~10-11 GB con contexto.
  - f16: ~16,2 GB de pesos; ~18 GB o más con contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q8; A100/H100 no son necesarias para este tamaño, pero pueden usarse para servir múltiples instancias o contextos largos.
- ¿Cabe en GPU de consumo? Sí: las cuantizaciones Q4_K_S y Q4_K_M (~5 GB) caben en GPUs de 8 GB; Q8_0 requiere 12 GB o más; f16 requiere 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runner compatible con GGUF. El modelo base también es compatible con transformers (safetensors), pero esta versión es específicamente GGUF.
- Latencia y throughput estimados: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de modelos comparables documentados en la información proporcionada. Como referencia estructural, se puede comparar con otros modelos de ~8B en formato GGUF, pero no se aportan cifras de rendimiento para una comparación rigurosa.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| doktor-llama-3-cosmos-8b-GGUF | 8,03B | no disponible | tr | MIT | GGUF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo especializado exclusivamente en turco; no se declaran capacidades en castellano ni en otros idiomas.
- Dominio vertical sanitario: puede responder de forma plausible fuera de ese dominio, pero sin garantías de calidad.
- Riesgo elevado de alucinación en contenido médico: no debe usarse como sustituto de consejo profesional; cualquier salida debe ser revisada por personal sanitario cualificado.
- Sesgos potenciales derivados del dataset kayrab/patient-doctor-qa-tr-321179, cuya composición, tamaño y procedencia no están documentados en la información disponible.
- No se han publicado evaluaciones de seguridad, sesgo ni robustez clínica.
- Licencia MIT: permite uso comercial y modificación, pero no exime de responsabilidades legales en aplicaciones sanitarias (regulación de dispositivos médicos, protección de datos, etc.).
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad; para producción se recomienda Q4_K_M o superior.
- No se dispone de información sobre la longitud de contexto soportada, lo que limita la planificación de conversaciones largas.
- El autor de las cuantizaciones advierte que no ha generado versiones imatrix/weighted, por lo que la calidad relativa frente a cuantizaciones ponderadas puede ser inferior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/doktor-llama-3-cosmos-8b-GGUF
- Modelo base: https://huggingface.co/kayrab/doktor-llama-3-cosmos-8b
- Dataset de entrenamiento: https://huggingface.co/datasets/kayrab/patient-doctor-qa-tr-321179
- Página de overview del autor de cuantizaciones: https://hf.tst.eu/model#doktor-llama-3-cosmos-8b-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
