# mradermacher/MedPsy-4B-GGUF

## Resumen

MedPsy-4B-GGUF es la versión cuantizada en formato GGUF del modelo MedPsy-4B, un modelo de lenguaje de aproximadamente 4.400 millones de parámetros especializado en dominio médico y sanitario, desarrollado originalmente por qvac y distribuido en formato GGUF por mradermacher. El modelo está etiquetado como derivado de la familia Qwen3 y orientado a despliegue en el borde (edge) y en dispositivo (on-device), lo que lo hace adecuado para entornos con recursos limitados donde la privacidad de datos clínicos es crítica.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo médico de tamaño medio en hardware de consumo mediante llama.cpp u otros runners compatibles con GGUF, con cuantizaciones que van desde Q2_K (1,9 GB) hasta f16 (8,9 GB). El modelo base declara licencia Apache 2.0, lo que facilita su uso comercial, y está etiquetado con el sello neurips-2026, lo que sugiere una publicación académica asociada.

No obstante, la información pública disponible sobre arquitectura interna, datos de entrenamiento, contexto máximo y rendimiento en benchmarks es muy limitada en la model card proporcionada, por lo que muchos apartados de esta ficha se marcan explícitamente como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como familia Qwen3; detalles internos no especificados) |
| Parámetros totales | 4.411.424.256 (4,41 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La model card del repositorio GGUF no describe la arquitectura interna del modelo base más allá de la etiqueta "qwen3", lo que indica que MedPsy-4B se construye sobre la familia Qwen3, presumiblemente mediante ajuste fino supervisado sobre un checkpoint base de dicha familia. No se especifican en la información disponible el número de capas, dimensiones ocultas, mecanismo de atención, ni si incorpora innovaciones como atención lineal o decodificación especulativa.

Tampoco se detallan los datos de entrenamiento: no hay información sobre el volumen de tokens, la composición del corpus clínico, ni si se aplicaron técnicas de alineación como RLHF o DPO. Las etiquetas del repositorio (medical, healthcare, clinical, edge, on-device, neurips-2026) sugieren un enfoque en aplicaciones clínicas y despliegue en el borde, pero los detalles técnicos del proceso de entrenamiento no están publicados en la información proporcionada.

## Capacidades

- Generación de texto conversacional en inglés orientada a dominio médico y sanitario.
- Etiquetado como modelo de generación de texto (pipeline text-generation) y compatible con endpoints.
- Perfilado para despliegue en el borde (edge) y en dispositivo (on-device), lo que implica un diseño orientado a baja latencia y recursos reducidos.
- Capacidades específicas de razonamiento clínico, diagnóstico asistido o respuesta a preguntas médicas: no disponibles de forma explícita en la información proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Asistencia clínica en entornos con requisitos de privacidad: al ejecutarse on-device mediante GGUF, permite procesar notas clínicas o consultas de pacientes sin enviar datos a servicios externos, reduciendo el riesgo de filtración de información sanitaria.
- Triaje conversacional en aplicaciones móviles: con cuantizaciones Q4_K_S (2,7 GB) o IQ4_XS (2,6 GB) el modelo puede desplegarse en smartphones o tablets de gama alta para orientar síntomas iniciales y derivar al profesional adecuado.
- Documentación clínica asistida: generación de borradores de resúmenes de consulta o notas estructuradas a partir de texto libre, aprovechando el ajuste al dominio médico del modelo base.
- Educación y formación médica: simulaciones de preguntas y respuestas clínicas para estudiantes, ejecutables en portátiles con GPU de consumo mediante llama.cpp u Ollama.
- Investigación en NLP clínico: uso como baseline ligero en experimentos de extracción de información o clasificación de textos médicos, gracias a su tamaño manejable y licencia Apache 2.0.
- Despliegue en entornos con conectividad limitada: hospitales de campo, clínicas rurales o dispositivos sin acceso a la nube pueden ejecutar el modelo en local con cuantizaciones Q3 o Q4.
- Prototipado rápido de asistentes sanitarios: la disponibilidad de múltiples cuantizaciones permite iterar entre calidad y recursos según la fase del proyecto, desde pruebas en CPU hasta producción en GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB con Q2_K, 2,6-2,8 GB con IQ4_XS o Q4_K_M, 3,3 GB con Q5_K_M, 4,8 GB con Q8_0 y 8,9 GB con f16 (tamaños de fichero; la VRAM real puede ser algo superior por el contexto y los buffers de llama.cpp).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4090 o superiores para mayor throughput; A100/H100 no son necesarias dado el tamaño del modelo.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más usando Q4_K_M o Q5_K_M; también es viable en CPU con cuantizaciones Q4.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y otros runners compatibles con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI si se dispone de los pesos originales.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MedPsy-4B-GGUF | 4,41 B | no disponible | Apache 2.0 | GGUF | Dominio médico, on-device |
| Modelos comparables de dominio médico de ~4 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |
| Qwen3 base de ~4 B | no disponible | no disponible | no disponible | safetensors/GGUF | Familia sobre la que se etiqueta el modelo; datos no confirmados |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- Idiomas: el modelo está etiquetado únicamente para inglés, por lo que su uso en castellano u otros idiomas no está garantizado y probablemente degrade la calidad.
- Dominio médico: se trata de un modelo de lenguaje, no de un dispositivo médico; sus salidas no deben utilizarse como diagnóstico ni sustituir el criterio de un profesional sanitario.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño, especialmente en terminología clínica, dosis o protocolos; requiere validación humana.
- Sesgos: no se documentan en la información disponible los sesgos conocidos del modelo base ni del proceso de ajuste.
- Contexto: se desconoce la longitud máxima de contexto, lo que impide garantizar conversaciones multi-turno largas o procesamiento de documentos extensos.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base original (qvac/MedPsy-4B) y de la familia Qwen3 subyacente antes de producción.
- Cuantizaciones agresivas: Q2_K y Q3_K pueden degradar notablemente la calidad; para uso clínico se recomienda Q4_K_M o superior.
- Madurez: el repositorio tiene pocas descargas y likes, y la información técnica publicada es escasa; conviene evaluar el modelo con datos propios antes de adoptarlo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/MedPsy-4B-GGUF
- Modelo base: https://huggingface.co/qvac/MedPsy-4B
- Licencia del modelo base: https://huggingface.co/qvac/MedPsy-4B/blob/main/LICENSE
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/MedPsy-4B-i1-GGUF
- Página de overview del autor: https://hf.tst.eu/model#MedPsy-4B-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
