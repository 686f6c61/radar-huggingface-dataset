# mradermacher/anti-starlike-GGUF

## Resumen

anti-starlike es un modelo de lenguaje conversacional en inglés resultado de un merge (fusión) de modelos, desarrollado por el usuario ToastyPigeon y publicado originalmente en Hugging Face. La versión aquí descrita es la cuantización GGUF realizada por mradermacher, un conocido publicador de cuantizaciones para el ecosistema llama.cpp. El modelo cuenta con aproximadamente 27.000 millones de parámetros totales (27.009.346.304 según los pesos en safetensors) y está pensado para inferencia local y despliegues con recursos limitados mediante formatos GGUF.

El modelo se distribuye exclusivamente como cuantizaciones estáticas (Q2_K hasta Q8_0) más un proyector multimodal (mmproj) en Q8_0 y f16, lo que sugiere capacidades de visión heredadas del modelo base fusionado. La información pública disponible es muy escasa: no se documentan detalles sobre la arquitectura interna, los datos de entrenamiento, el contexto máximo ni la licencia del modelo original.

Su relevancia actual radica en que ofrece una alternativa de ~27B parámetros con cuantizaciones listas para usar en llama.cpp y compatible con endpoints de Transformers, aunque la falta de documentación y de benchmarks publicados limita seriamente su evaluación rigurosa antes de usarlo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo fusionado con mergekit; presumiblemente transformer, sin confirmar) |
| Parametros totales | 27.009.346.304 (~27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base presumiblemente en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo. Las etiquetas del repositorio indican que se trata de un merge realizado con mergekit (tags `mergekit` y `merge`), una herramienta que combina los pesos de varios modelos mediante técnicas como SLERP, TIES, DARE o model stock. El número de parámetros (~27B) sugiere que los modelos de origen son de tamaño similar, aunque no se especifica cuáles son ni la receta de fusión empleada.

La model card del repositorio GGUF no incluye información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste fino supervisado. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. La presencia de archivos mmproj (proyector multimodal) indica que el modelo base incorpora capacidades de visión, presumiblemente heredadas de alguno de los modelos fusionados, pero no se detalla su funcionamiento ni el codificador visual utilizado.

## Capacidades

- Generación de texto conversacional en inglés (tag `conversational` en el repositorio).
- Capacidades multimodales (visión) inferidas de la presencia de archivos mmproj en Q8_0 y f16, aunque no se documenta el alcance exacto.
- Compatibilidad con endpoints de Transformers (tag `endpoints_compatible`), lo que permite despliegue en infraestructuras compatibles con la API de Hugging Face.
- No se documenta soporte explícito de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades especiales como modo thinking, audio o matemáticas avanzadas.
- Multilingüismo: limitado al inglés según la etiqueta de idioma.

## Casos de uso

- Experimentación con modelos fusionados: el modelo permite evaluar el resultado de una receta de merge concreta en tareas conversacionales en inglés, comparándolo con los modelos de origen para validar la técnica de fusión empleada.
- Inferencia local en estaciones de trabajo: con cuantizaciones Q4_K_M (~16,6 GB) o Q5_K_M (~19,4 GB) puede ejecutarse en GPUs de consumo alto o en configuraciones CPU+GPU con llama.cpp, útil para prototipado sin coste de API.
- Despliegue en entornos con restricciones de memoria: las cuantizaciones Q2_K (~10,6 GB) y Q3_K_S (~12,3 GB) permiten ejecutar el modelo en GPUs de 12-16 GB de VRAM, aunque con pérdida de calidad.
- Tareas de descripción de imágenes: gracias a los archivos mmproj, puede emplearse en pipelines de visión-lenguaje con llama.cpp para generar descripciones o responder preguntas sobre imágenes, siempre que se valide la calidad del componente multimodal.
- Chatbots de propósito general en inglés: el tag conversacional sugiere uso en asistentes de texto, aunque la ausencia de benchmarks hace recomendable una evaluación previa en el dominio concreto.
- Base para ajuste fino: al estar disponible en GGUF y presumiblemente en safetensors (modelo base), puede servir como punto de partida para fine-tuning con LoRA en tareas específicas en inglés, si la licencia lo permite (dato no disponible).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de cuantización):
  - Q2_K: ~10,6 GB
  - Q3_K_S: ~12,3 GB
  - Q3_K_M: ~13,5 GB
  - Q3_K_L: ~14,6 GB
  - IQ4_XS: ~15,0 GB
  - Q4_K_S: ~15,8 GB
  - Q4_K_M: ~16,6 GB
  - Q5_K_S: ~18,9 GB
  - Q5_K_M: ~19,4 GB
  - Q6_K: ~22,3 GB
  - Q8_0: ~28,8 GB
  - mmproj: 0,7 GB (Q8_0) o 1,0 GB (f16), adicionales si se usa el modo multimodal
- GPU recomendadas:
  - Q4_K_M o Q5_K_M: RTX 4090 (24 GB), RTX 3090 (24 GB), A6000 (48 GB)
  - Q8_0: A100 40 GB, H100, o dos GPUs de 24 GB
  - Cuantizaciones bajas (Q2_K, Q3_K_S): RTX 4080 (16 GB), RTX 4070 Ti Super (16 GB), o GPUs de 12 GB con offloading parcial
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con Q4_K_M o Q5_K_M; en GPUs de 16 GB con Q3_K o IQ4_XS; en GPUs de 12 GB solo con Q2_K o Q3_K_S y posible offloading.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (si se importa el GGUF), endpoints compatibles con Transformers, y servidores basados en llama.cpp como llama-server. No se documenta soporte en vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| anti-starlike (este) | ~27B | no disponible | no disponible | GGUF | Merge con mergekit, multimodal (mmproj), solo inglés |
| Modelos de ~27B tipo Gemma 2 27B | 27B | 8K (Gemma 2) | Gemma license | safetensors, GGUF | Arquitectura documentada, benchmarks publicados |
| Modelos de ~24B tipo Mistral Small | 24B | 32K-128K según versión | Apache 2.0 (versiones tempranas) | safetensors, GGUF | Documentación completa, benchmarks públicos |
| Modelos de ~32B tipo Qwen 2.5 32B | 32B | 128K | Apache 2.0 (mayoría) | safetensors, GGUF | Multilingüe, benchmarks publicados |

La comparación con alternativas establecidas es desfavorable en términos de documentación: anti-starlike carece de benchmarks, licencia declarada y especificación de contexto, mientras que los modelos citados publican estos datos de forma sistemática. La ventaja principal del modelo es su disponibilidad inmediata en múltiples cuantizaciones GGUF y su componente multimodal, pero la falta de transparencia sobre la receta de fusión y los datos de entrenamiento dificulta una comparación objetiva de rendimiento.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Es imprescindible contactar con el autor o consultar el repositorio del modelo base (ToastyPigeon/anti-starlike) antes de usarlo en producción.
- Ausencia total de benchmarks: no hay datos objetivos de MMLU, HumanEval, GSM8K ni otras métricas que permitan estimar la calidad del modelo.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas es desconocido y probablemente deficiente.
- Contexto desconocido: no se especifica la longitud máxima de contexto, lo que impide planificar casos de uso con documentos largos.
- Riesgo de alucinación: al ser un merge sin documentación sobre alineación (RLHF/DPO), no hay garantías sobre la calibración del modelo ni sobre su tendencia a inventar información.
- Sesgos: no se documentan evaluaciones de sesgo; al desconocerse los datos de entrenamiento de los modelos de origen, no se puede evaluar el sesgo de género, raza o ideológico.
- Naturaleza del merge: los modelos fusionados con mergekit pueden presentar degradaciones impredecibles en tareas específicas; sin evaluación empírica, el comportamiento es una incógnita.
- Componente multimodal sin documentar: los archivos mmproj existen, pero no se detalla qué codificador visual usan ni su calidad; su uso en producción requiere validación propia.
- Repositorio con muy poca tracción (8 descargas, 0 likes): no hay comunidad que haya reportado problemas o validado el modelo, lo que reduce la fiabilidad de cualquier uso en producción.
- Cuantizaciones bajas (Q2_K, Q3_K_S): la pérdida de calidad puede ser significativa en un modelo de 27B; se recomienda Q4_K_M o superior para uso real.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/anti-starlike-GGUF
- Modelo base: https://huggingface.co/ToastyPigeon/anti-starlike
- Página de overview de cuantizaciones de mradermacher: https://hf.tst.eu/model#anti-starlike-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Herramienta mergekit: no se proporciona enlace directo en la información disponible
