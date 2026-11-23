# mradermacher/Liminar-Gemma-4-E4B-GGUF

## Resumen

Liminar-Gemma-4-E4B es un ajuste fino del modelo Gemma 4 E4B, desarrollado por el grupo LICDIA de la Universidad Nacional de Luján (UNLu), Argentina. El modelo está especializado en el dominio de la normativa y la legislación universitaria argentina, y se distribuye bajo licencia Apache 2.0 con soporte exclusivo para el idioma español. La versión aquí descrita es la cuantización GGUF realizada por mradermacher, que facilita su despliegue en entornos de inferencia local y servidores con recursos limitados.

El modelo base, Gemma 4 E4B, es una arquitectura de tipo transformer con aproximadamente 7.460 millones de parámetros totales, según los pesos en formato safetensors. La designación "E4B" sugiere una variante optimizada del linaje Gemma, aunque la model card no detalla si emplea mezcla de expertos (MoE) o una arquitectura densa. El ajuste fino se orienta a tareas de consulta normativa, respuesta a preguntas sobre reglamentaciones universitarias y asistencia conversacional en el ámbito académico argentino.

La relevancia de este modelo radica en su especialización vertical: frente a modelos generalistas, Liminar-Gemma-4-E4B está entrenado para el corpus normativo de universidades argentinas, lo que lo hace adecuado para aplicaciones de atención al estudiante, consulta de reglamentos y soporte administrativo. La disponibilidad de cuantizaciones GGUF en múltiples niveles (desde Q2_K hasta f16) permite desplegarlo desde estaciones de trabajo con GPU de consumo hasta servidores de alto rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (variante Gemma 4 E4B; detalles de atención no disponibles) |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K (más mmproj Q8_0 y f16) |
| Idiomas soportados | es (español) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); safetensors en el modelo base |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su pertenencia al linaje Gemma 4 E4B. El recuento de parámetros (7.463.013.674) corresponde a los pesos en safetensors del modelo original, lo que sitúa al modelo en la gama de 7B. No se especifica si emplea atención con ventana deslizante, atención lineal u otras innovaciones propias de la familia Gemma, ni se documenta la longitud de contexto nativa.

Respecto al entrenamiento, la model card del repositorio de cuantización no incluye información sobre el corpus de ajuste fino, el número de tokens utilizados, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Los tags del modelo (liminar, argentina, universidades, normativa) indican que el ajuste se orientó al dominio normativo universitario argentino, pero no se aportan métricas de entrenamiento ni detalles sobre el proceso de alineación. La cuantización fue realizada por mradermacher mediante conversión desde el formato Hugging Face a GGUF, con cuantizaciones estáticas (no se generaron cuantizaciones con imatrix ponderada).

## Capacidades

- Generación de texto conversacional en español, orientada a consultas sobre normativa universitaria argentina.
- Respuesta a preguntas sobre reglamentos, resoluciones y legislación académica del ámbito argentino.
- Soporte multimodal: el repositorio incluye archivos mmproj (Q8_0 y f16), lo que indica capacidad de procesamiento de imágenes en el modelo base.
- Conversación multi-turno (tag "conversational").
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que facilita su integración en servicios de inferencia.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento multi-paso con agentes.
- Capacidades multilingües limitadas al español según la model card.
- No se documenta modo de razonamiento (thinking mode) ni capacidades de audio.

## Casos de uso

- Atención al estudiante automatizada: el modelo puede gestionar consultas frecuentes sobre inscripciones, calendario académico y requisitos de cursada, respondiendo en español con base en la normativa universitaria argentina para la que fue ajustado.
- Consulta de reglamentos universitarios: un chatbot interno que permita a estudiantes y personal administrativo resolver dudas sobre estatutos, resoluciones y procedimientos académicos, aprovechando la especialización del ajuste fino en el dominio normativo.
- Asistencia administrativa en secretarías académicas: generación de borradores de respuestas a solicitudes estudiantiles, con lenguaje administrativo coherente y referencias a la normativa aplicable.
- Soporte a la gestión documental: resumen y explicación de resoluciones y reglamentos extensos para personal no especializado, facilitando la comprensión de la normativa vigente.
- Despliegue en entornos con recursos limitados: gracias a las cuantizaciones GGUF (desde Q2_K de 4,5 GB hasta Q8_0 de 8,1 GB), puede ejecutarse en estaciones de trabajo con GPU de consumo para prototipos y pruebas internas.
- Integración en portales web universitarios: mediante endpoints compatibles, el modelo puede servir como backend de un asistente virtual en el portal de la universidad, con inferencia local para preservar la privacidad de los datos institucionales.
- Investigación en PLN jurídico-administrativo: como modelo de referencia para experimentos de ajuste fino en dominios normativos en español, comparando su comportamiento con modelos generalistas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - Q2_K: ~4,5 GB de pesos; ~5-6 GB de VRAM en total con overhead.
  - Q4_K_M: ~5,4 GB de pesos; ~6-7 GB de VRAM en total.
  - Q5_K_M: ~5,8 GB de pesos; ~7-8 GB de VRAM en total.
  - Q8_0: ~8,1 GB de pesos; ~9-10 GB de VRAM en total.
  - f16: ~15,0 GB de pesos; ~16-17 GB de VRAM en total.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4090 24 GB para cuantizaciones Q4-Q8; A100 40 GB o H100 para f16 y despliegues de alta concurrencia.
- Cabe en GPU de consumo: sí, las cuantizaciones Q2_K a Q8_0 caben en GPUs con 8-12 GB de VRAM; la f16 requiere 16 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y servidores compatibles con GGUF; el tag "endpoints_compatible" sugiere compatibilidad con endpoints de inferencia estándar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización | Disponibilidad |
|---|---|---|---|---|---|
| Liminar-Gemma-4-E4B (GGUF) | 7,46B | no disponible | Apache 2.0 | Normativa universitaria argentina, español | GGUF en HF |
| Gemma 4 E4B (base) | ~7,46B | no disponible | Gemma Terms of Use (según modelo base) | Generalista, multilingüe | safetensors en HF |
| Modelos 7B generalistas en español (p. ej., variantes ajustadas de Llama/Mistral) | ~7-8B | variable | variable | Generalista | GGUF y safetensors |

La comparación con alternativas específicas queda limitada por la ausencia de datos de benchmarks y de especificaciones detalladas del modelo base en la información disponible. La principal ventaja diferencial de Liminar-Gemma-4-E4B es su especialización en normativa universitaria argentina y su disponibilidad en múltiples cuantizaciones GGUF, lo que facilita el despliegue local.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al estar ajustado sobre normativa universitaria argentina, puede reflejar sesgos del corpus institucional utilizado.
- Riesgo de alucinación: presente como en cualquier modelo de lenguaje; en dominios normativos, una cita incorrecta de una resolución o reglamento puede tener consecuencias administrativas, por lo que se recomienda verificación humana.
- Limitaciones de contexto: la longitud de contexto no está documentada, lo que impide garantizar el manejo de documentos normativos extensos.
- Limitaciones de idioma: el modelo está orientado exclusivamente al español (tag "es"); su rendimiento en otros idiomas no está garantizado.
- Restricciones de licencia: la cuantización se distribuye bajo Apache 2.0, pero el modelo base Gemma puede estar sujeto a los términos de uso de Google; conviene verificar la licencia del modelo base antes de un uso comercial.
- Caveats para producción: no se han publicado benchmarks ni evaluaciones de calidad; el repositorio de cuantización no incluye cuantizaciones con imatrix ponderada, lo que puede afectar la calidad en niveles bajos (Q2_K, Q3_K_S).
- El modelo tiene 0 likes y un volumen de descargas moderado (1.041), lo que sugiere una validación comunitaria limitada.

## Enlaces

- Repositorio Hugging Face (cuantización GGUF): https://huggingface.co/mradermacher/Liminar-Gemma-4-E4B-GGUF
- Modelo base: https://huggingface.co/LICDIA-UNLu/Liminar-Gemma-4-E4B
- Página de descargas del cuantizador: https://hf.tst.eu/model#Liminar-Gemma-4-E4B-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización (mradermacher): https://huggingface.co/mradermacher/model_requests
