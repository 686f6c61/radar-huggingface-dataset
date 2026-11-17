# mradermacher/DCFT-stackexchange_chemistry_seed_science-etash-GGUF

## Resumen

DCFT-stackexchange_chemistry_seed_science-etash es un modelo de lenguaje de aproximadamente 7.600 millones de parametros, desarrollado originalmente por mlfoundations-dev y cuantizado a formato GGUF por mradermacher. Se trata de un ajuste fino del modelo base sobre un corpus derivado de Stack Exchange centrado en quimica y ciencia, lo que lo orienta a tareas conversacionales de dominio cientifico-tecnico en ingles. El repositorio aqui descrito contiene exclusivamente las versiones cuantizadas estaticas en GGUF, no los pesos originales en precision completa.

La relevancia de esta ficha radica en su caracter practico: al estar disponible en multiples niveles de cuantizacion (desde Q2_K de 3,1 GB hasta f16 de 15,3 GB), permite desplegar un modelo de 7,6B en hardware de consumo. Sin embargo, la informacion publicada es muy limitada: no se detalla la arquitectura interna, la longitud de contexto, el proceso de entrenamiento ni los resultados de benchmarks, y la licencia no esta declarada en el repositorio.

El modelo esta etiquetado como conversacional y solo en ingles, con 32 descargas y 1 like en el momento de la consulta, lo que indica una adopcion muy baja. Es un artefacto de nicho, probablemente util para experimentacion con modelos cientificos cuantizados, pero no para produccion sin una evaluacion previa propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformers; detalles internos no publicados) |
| Parametros totales | 7.615.616.512 (~7,6B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo base (tipo de transformer, atencion, numero de capas o dimensiones ocultas). El dato disponible es el recuento de parametros a partir de los safetensors del modelo base: 7.615.616.512 parametros, lo que situa al modelo en la categoria de ~7,6B, tipica de arquitecturas tipo Llama o Mistral, aunque esto no se confirma en la informacion proporcionada.

Respecto al entrenamiento, el nombre del modelo sugiere un ajuste fino sobre un dataset derivado de Stack Exchange (DCFT, presumiblemente "Data Curation Fine-Tuning" o similar) con semilla de quimica y ciencia ("stackexchange_chemistry_seed_science"). No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO o instruccion tuning. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. Toda esta seccion queda, por tanto, como no disponible.

## Capacidades

- Generacion de texto conversacional en ingles, orientada por el ajuste fino a contenido cientifico (quimica y disciplinas afines).
- Respuesta a preguntas de dominio cientifico-tecnico, presumiblemente inspirada en el formato de preguntas y respuestas de Stack Exchange.
- Conversacion multi-turno (etiqueta "conversational" en el repositorio).
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que facilita su despliegue en infraestructuras de inferencia estandar.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Capacidades especiales (vision, audio, modo thinking): no disponible.

## Casos de uso

- Asistente de consultas de quimica en ingles: el modelo puede responder preguntas tecnicas de quimica aprovechando su ajuste fino sobre Stack Exchange; adecuado para prototipos de chatbots cientificos internos, siempre que se valide la calidad de las respuestas.
- Experimentacion academica con cuantizacion: investigadores pueden comparar el rendimiento de las distintas cuantizaciones (Q2_K a f16) sobre el mismo modelo para estudiar la degradacion de calidad en tareas cientificas.
- Despliegue en hardware de consumo: con cuantizaciones Q4_K_S o Q4_K_M (4,6-4,8 GB), el modelo cabe en GPUs de gama media y permite pruebas locales sin infraestructura dedicada.
- Generacion de borradores de documentacion tecnica: util para redactar explicaciones preliminares de conceptos quimicos que luego un experto revisa, dado el sesgo del modelo hacia contenido de Stack Exchange.
- Base para ajuste fino adicional: al ser un modelo de ~7,6B en GGUF, puede servir como punto de partida para tareas de dominio especifico, aunque para reentrenamiento convendria usar los pesos safetensors del modelo base.
- Evaluacion de sesgos en modelos cientificos: permite analizar como un ajuste fino sobre un corpus comunitario (Stack Exchange) afecta al tono, la precision y la cobertura de temas en comparacion con el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano de archivo GGUF mas overhead de contexto):
  - Q2_K (3,1 GB): ~4 GB de VRAM.
  - Q4_K_M (4,8 GB): ~6 GB de VRAM.
  - Q8_0 (8,2 GB): ~10 GB de VRAM.
  - f16 (15,3 GB): ~17 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB o superior para cuantizaciones Q4-Q8; A100 o H100 para f16 y para servir a multiples usuarios.
- Cabe en GPU de consumo: si, en tarjetas con 6-12 GB de VRAM para cuantizaciones Q4 a Q8; las cuantizaciones Q2-Q3 caben en GPUs de 4-6 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el tag "endpoints_compatible" sugiere soporte en plataformas de endpoints gestionados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparativa se limita a caracteristicas estructurales. Se comparan alternativas genericas de ~7B en GGUF ampliamente documentadas; los datos de estas alternativas son de conocimiento publico general y no provienen de la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|
| DCFT-stackexchange_chemistry_seed_science-etash (este) | ~7,6B | no disponible | no disponible | GGUF | Ajuste fino cientifico, solo ingles, adopcion muy baja |
| Mistral-7B-Instruct | ~7,2B | 32k (segun version) | Apache 2.0 | GGUF, safetensors | Referencia generalista, ampliamente soportado |
| Llama-3.1-8B-Instruct | ~8B | 128k | Llama 3.1 Community License | GGUF, safetensors | Mejor contexto y ecosistema, licencia con restricciones |
| Qwen2.5-7B-Instruct | ~7,6B | 128k | Apache 2.0 | GGUF, safetensors | Multilingue y con buen soporte de tool calling |

La comparacion de rendimiento con estas alternativas no es posible sin benchmarks publicados del modelo evaluado.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de su calidad en tareas estandar, lo que impide recomendarlo para produccion sin evaluacion propia.
- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; es un riesgo legal relevante para cualquier despliegue empresarial.
- Solo ingles: no se debe esperar un rendimiento aceptable en castellano u otros idiomas.
- Sesgos del corpus de origen: al derivar de Stack Exchange, el modelo puede reproducir sesgos, estilos y errores de la comunidad, ademas de sobrerrepresentar ciertos temas de quimica.
- Riesgo de alucinacion: como cualquier modelo de ~7B ajustado sobre datos de preguntas y respuestas, puede generar respuestas cientificamente plausibles pero incorrectas; requiere validacion experta.
- Contexto desconocido: al no publicarse la longitud de contexto, no se puede planificar su uso en tareas de contexto largo.
- Adopcion minima (32 descargas): escasa validacion por parte de la comunidad y poca probabilidad de mantenimiento o soporte.
- Cuantizaciones de baja calidad (Q2_K, Q3_K_M): pueden degradar notablemente la coherencia en tareas tecnicas; se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/DCFT-stackexchange_chemistry_seed_science-etash-GGUF
- Modelo base: https://huggingface.co/mlfoundations-dev/DCFT-stackexchange_chemistry_seed_science-etash
- Pagina de resumen de cuantizaciones del autor: https://hf.tst.eu/model#DCFT-stackexchange_chemistry_seed_science-etash-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
