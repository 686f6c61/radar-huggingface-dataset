# mradermacher/AxonMed-32B-Thinking-i1-GGUF

## Resumen

AxonMed-32B-Thinking-i1-GGUF es una cuantizacion en formato GGUF del modelo AxonMed-32B-Thinking, publicada por el usuario mradermacher, conocido en Hugging Face por generar versiones cuantizadas de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo base, alojado por Saathimed, es un modelo de 32.763.876.352 parametros (aproximadamente 32,8 mil millones) orientado a conversacion y, por su nombre, a dominio medico y razonamiento extendido (thinking).

La relevancia de esta publicacion radica en que ofrece el modelo en multiples niveles de cuantizacion (desde IQ1_S hasta Q6_K) generados con imatrix, lo que permite desplegarlo en hardware con recursos limitados manteniendo, en teoria, una calidad superior a la de las cuantizaciones estandar para el mismo tamano. El repositorio ocupa 12,3 GB, lo que indica que agrupa varios ficheros GGUF de distintos tamanos.

No se dispone de informacion publica sobre la licencia, los idiomas soportados, la arquitectura exacta del modelo base ni los datos de entrenamiento en la informacion proporcionada; la model card se limita a los metadatos de la cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, inferido por el formato GGUF y el tamano; no confirmado) |
| Parametros totales | 32.763.876.352 (~32,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones con imatrix; el modelo base se convirtio desde HF) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base AxonMed-32B-Thinking en la documentacion proporcionada. Por el tamano (~32,8 B parametros) y el formato de publicacion (GGUF generado con convert_type hf), se trata de un transformer denso convertido desde pesos de Hugging Face, pero la model card no detalla capas, atencion, tipo de activacion ni innovaciones como decodificacion especulativa.

Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. La unica informacion tecnica relevante es que las cuantizaciones se han generado con imatrix (matriz de importancia), una tecnica que pondera la cuantizacion segun la relevancia de los pesos para reducir la perdida de calidad en bits bajos, y que el proceso de conversion se realizo desde el formato HF original.

## Capacidades

- Generacion de texto conversacional: el tag "conversational" indica que el modelo esta orientado a dialogos multi-turno.
- Razonamiento extendido: el sufijo "Thinking" del nombre sugiere un modo de razonamiento con cadena de pensamiento, aunque no se detalla su funcionamiento.
- Dominio medico: el prefijo "AxonMed" apunta a un ajuste orientado a contenido clinico o biomedico, sin documentacion que lo confirme.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio): no disponible; el repositorio no incluye ficheros mmproj (skip_mmproj vacio), por lo que no se trata de un modelo multimodal.

## Casos de uso

- Asistente conversacional de dominio medico en local: el modelo puede desplegarse con llama.cpp u Ollama en estaciones de trabajo con GPU consumer, permitiendo dialogos multi-turno sin enviar datos clinicos a servicios externos, lo que es relevante por motivos de privacidad.
- Prototipado de razonamiento clinico: gracias a su orientacion "Thinking", puede emplearse para generar cadenas de razonamiento ante casos o preguntas medicas y revisar la trazabilidad del razonamiento, siempre con supervision profesional.
- Investigacion en NLP biomedico: util como linea base cuantizada para experimentos de evaluacion de modelos en tareas medicas sobre hardware modesto.
- Despliegue en entornos con recursos limitados: las cuantizaciones IQ2/IQ3 permiten ejecutar un modelo de ~32,8 B en GPU con 12-16 GB de VRAM, algo inviable con los pesos en FP16.
- Generacion de resumenes de documentacion clinica: con contexto suficiente (no confirmado), podria resumir informes o articulos, aunque requiere validacion humana por el riesgo de alucinacion.
- Educacion y formacion: como asistente de estudio para estudiantes de ciencias de la salud en entornos controlados, con las advertencias oportunas sobre exactitud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion y tamano del modelo):
  - IQ1_S / IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M: en torno a 9-12 GB.
  - IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M / Q3_K_S / Q3_K_M / Q3_K_L: en torno a 13-16 GB.
  - IQ4_XS / IQ4_NL / Q4_0 / Q4_1 / Q4_K_S / Q4_K_M: en torno a 17-21 GB.
  - Q5_K_S / Q5_K_M: en torno a 22-25 GB.
  - Q6_K: en torno a 26-28 GB.
  (Estimaciones basadas en el numero de parametros; no confirmadas por el autor.)
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones Q4 y Q5; A100 40/80 GB o H100 para Q6_K y para maxima calidad; RTX 3090/4080 (16-24 GB) para IQ3/IQ4.
- Cabe en GPU consumer: si, en cuantizaciones IQ2 a Q4 segun la VRAM disponible; Q6_K requiere GPUs de 24 GB o mas con margen ajustado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; los tags "endpoints_compatible" indican compatibilidad con endpoints de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial; es imprescindible consultar la licencia del modelo base (Saathimed/AxonMed-32B-Thinking) antes de cualquier despliegue productivo.
- Riesgo de alucinacion elevado en dominio medico: un modelo de este tipo puede generar afirmaciones clinicas incorrectas con apariencia de rigor; no debe usarse como sustituto del criterio profesional.
- Idiomas no documentados: no se garantiza un rendimiento adecuado en castellano ni en otros idiomas distintos del ingles.
- Contexto no documentado: se desconoce la ventana maxima; no debe asumirse un contexto largo.
- Cuantizaciones de muy baja precision (IQ1/IQ2): degradan notablemente la calidad y la coherencia del razonamiento; no recomendadas para uso serio.
- Modelo derivado: cualquier problema del modelo base se hereda; el autor de esta publicacion solo realiza la cuantizacion.
- Sin datos de benchmarks ni de sesgos conocidos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/AxonMed-32B-Thinking-i1-GGUF
- Modelo base: https://huggingface.co/Saathimed/AxonMed-32B-Thinking
