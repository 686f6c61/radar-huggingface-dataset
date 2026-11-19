# mradermacher/Liminar-Gemma-4-12B-GGUF

## Resumen

Liminar-Gemma-4-12B es un modelo de lenguaje de aproximadamente 11.900 millones de parámetros, desarrollado por LICDIA-UNLu (Universidad Nacional de Luján, Argentina) y especializado en normativa y legislación universitaria argentina. Se construye sobre la arquitectura Gemma y se distribuye bajo licencia Apache 2.0, lo que facilita su adopción tanto en entornos académicos como comerciales. La versión aquí descrita es la cuantización GGUF publicada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo está orientado a tareas conversacionales en español, con un enfoque declarado en el dominio de la normativa universitaria argentina, lo que lo convierte en una herramienta potencial para consultas documentales, asistencia administrativa y formación en contextos académicos. La disponibilidad de cuantizaciones estáticas en múltiples niveles (Q2_K hasta Q8_0) y de un suplemento multimodal (mmproj) amplía sus opciones de despliegue.

La relevancia actual radica en la combinación de un tamaño medio (12B) con licencia permisiva y especialización lingüística y temática en español rioplatense, un nicho poco cubierto por los modelos generalistas. No obstante, la información pública disponible sobre el modelo base es limitada, por lo que varios datos técnicos deben considerarse no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (basada en Gemma, según el nombre del modelo) |
| Parámetros totales | 11.907.350.576 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base se distribuye en formato transformers/safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base LICDIA-UNLu/Liminar-Gemma-4-12B. Por el nombre y el tamaño (≈11,9B parámetros), se infiere que deriva de la familia Gemma de Google, pero no se confirma en la información proporcionada si se trata de un transformer denso, un modelo con mezcla de expertos o una variante híbrida. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO.

La única información técnica disponible sobre el proceso de cuantización proviene de la model card de mradermacher: se trata de cuantizaciones estáticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) y no se ofrecen cuantizaciones ponderadas/imatrix en el momento de la publicación. El repositorio incluye un suplemento multimodal (mmproj) en f16 y Q8_0, lo que sugiere que el modelo base podría tener capacidades de visión, aunque este extremo no se confirma explícitamente.

## Capacidades

- Generación de texto conversacional en español, con especialización declarada en normativa y legislación universitaria argentina.
- Respuesta a consultas sobre normativa académica, estatutos, reglamentos y procedimientos universitarios.
- Posible soporte multimodal (visión) gracias a los archivos mmproj incluidos en el repositorio, aunque no se detalla en la información disponible.
- Compatibilidad con endpoints (tag endpoints_compatible), lo que facilita su integración en servicios de inferencia.
- No se documentan capacidades específicas de tool calling, function calling, agentes o razonamiento multi-paso.
- No se documentan modos especiales como thinking mode, audio o decodificación especulativa.

## Casos de uso

- Consulta de normativa universitaria: el modelo puede responder preguntas sobre reglamentos, estatutos y procedimientos administrativos de universidades argentinas, aprovechando su especialización temática declarada. Es adecuado para asistencia a estudiantes y personal administrativo.
- Asistencia en secretarías académicas: gestión de consultas frecuentes sobre inscripciones, equivalencias y calendarios, con respuestas en español rioplatense y orientadas al marco normativo local.
- Formación y capacitación interna: generación de materiales explicativos sobre normativa para nuevos empleados o docentes, a partir de la base de conocimiento del modelo.
- Búsqueda documental asistida: integración en sistemas de recuperación aumentada (RAG) sobre corpus normativos, donde el modelo redacta respuestas a partir de fragmentos recuperados.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q4_K_S y Q4_K_M (7,1 y 7,5 GB) permiten ejecución en GPU de consumo y en CPU, lo que facilita prototipos y pruebas locales.
- Investigación en PLN jurídico-administrativo: uso como modelo base para experimentos de ajuste fino sobre corpus normativos argentinos, gracias a su licencia Apache 2.0.
- Atención al ciudadano en portales universitarios: chatbot conversacional multi-turno para resolver dudas sobre trámites, con la salvedad de que no se documenta la longitud de contexto soportada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (tamaño de archivo, sin contar overhead de contexto):
  - Q2_K: 4,9 GB
  - Q3_K_S: 5,6 GB
  - Q3_K_M: 6,2 GB
  - Q3_K_L: 6,7 GB
  - IQ4_XS: 6,8 GB
  - Q4_K_S: 7,1 GB (recomendada por el autor por velocidad)
  - Q4_K_M: 7,5 GB (recomendada por el autor)
  - Q5_K_S: 8,4 GB
  - Q5_K_M: 8,6 GB
  - Q6_K: 9,9 GB
  - Q8_0: 12,8 GB
  - mmproj-f16: 0,2 GB; mmproj-Q8_0: 0,3 GB (suplemento multimodal)
- GPU recomendadas: no disponibles de forma explícita. Por tamaño, una RTX 4090 (24 GB) o RTX 3090 (24 GB) pueden alojar las cuantizaciones Q8_0 y Q6_K con contexto moderado; una RTX 4060 Ti (16 GB) o RTX 4070 (12 GB) cubren Q4_K_M y Q5_K_M; GPUs de 8 GB admiten Q3_K_M o IQ4_XS con contexto reducido.
- Cabe en GPU de consumo: sí, en la mayoría de cuantizaciones Q4 y Q5; las Q2 y Q3 caben en GPUs de 6-8 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runners compatibles con GGUF; el tag endpoints_compatible sugiere compatibilidad con servicios de inferencia tipo endpoint.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (especializados en normativa universitaria argentina) ni de datos de rendimiento que permitan una comparación rigurosa. Se indica "no disponible".

## Limitaciones y advertencias

- Especialización muy acotada: el modelo está orientado a normativa universitaria argentina, por lo que su rendimiento en dominios generales puede ser inferior al de modelos generalistas del mismo tamaño.
- Riesgo de alucinación en materia normativa: al ser un modelo de lenguaje, puede generar referencias legales inexistentes o desactualizadas; se recomienda verificación humana en contextos jurídicos o administrativos.
- Idiomas: solo se declara soporte de español; no se garantiza un rendimiento adecuado en otras lenguas.
- Contexto: se desconoce la longitud máxima de contexto, lo que limita la planificación de aplicaciones con documentos largos.
- Datos de entrenamiento no documentados: no se puede evaluar la composición del corpus, los sesgos potenciales ni la fecha de corte de conocimiento.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base original por si hubiera restricciones adicionales no reflejadas en la información disponible.
- Cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; el autor recomienda Q4_K_S o Q4_K_M para un equilibrio entre velocidad y fidelidad.
- No se ofrecen cuantizaciones imatrix/ponderadas en el momento de la publicación, lo que puede limitar la calidad en niveles bajos de cuantización.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Liminar-Gemma-4-12B-GGUF
- Modelo base: https://huggingface.co/LICDIA-UNLu/Liminar-Gemma-4-12B
- Página de descargas del cuantizador: https://hf.tst.eu/model#Liminar-Gemma-4-12B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
