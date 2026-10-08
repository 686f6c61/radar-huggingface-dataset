# dosharma87/embodied-ai

## Resumen

El repositorio `dosharma87/embodied-ai` no es un modelo de inteligencia artificial: es un cuaderno de notas de investigación (research notes) sobre inteligencia artificial encarnada (embodied AI), publicado por el usuario dosharma87 bajo licencia CC-BY-4.0. Su contenido declarado se limita a dos archivos de texto, `reading.md` (artefacto principal) y `README.md` (documentación), en los que se describe el alcance de una pregunta de investigación, los posibles factores de confusión (confounders), una comparación propuesta con baselines emparejados, requisitos de reproducibilidad, modos de fallo y preguntas abiertas.

La propia model card es explícita al respecto: la nota es exploratoria y "no reclama mejoras de benchmark, ablaciones completadas, código publicado ni un checkpoint entrenado". Las secciones marcadas como planes o hipótesis no deben interpretarse como resultados experimentales. Por tanto, no existe en este repositorio un modelo entrenado, pesos utilizables para inferencia ni ningún artefacto desplegable.

Es relevante precisamente por el riesgo de confusión: el repositorio aparece etiquetado con `safetensors`, `transformer` y un recuento de parámetros (16.576) que puede llevar a herramientas de catalogación automática a clasificarlo como modelo. Con 0 descargas, 0 likes y un tamaño de repositorio de 0,0 GB, se trata de un artefacto documental, no de un sistema de IA generativa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No aplica (no es un modelo; no se declara arquitectura en la model card) |
| Parámetros totales | 16.576 según el recuento de safetensors (cifra residual, incompatible con un modelo de lenguaje; ver advertencias) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no hay modelo con ventana de contexto) |
| Tipos de cuantización | No disponible / no aplica |
| Idiomas soportados | No disponibles (la nota está redactada en inglés) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (archivo residual incluido en el repo; tamaño del repositorio: 0,0 GB) |

## Arquitectura y entrenamiento

No hay arquitectura ni entrenamiento que describir. La model card no declara transformer, MoE, SSM ni ninguna topología híbrida; los tags `transformer` y `safetensors` presentes en el repositorio de HuggingFace no se corresponden con ningún artefacto descrito en el README. No se documentan tokens de entrenamiento, composición de dataset, fases de RLHF, DPO, SFT ni ninguna innovación técnica (decodificación especulativa, atención lineal, etc.).

El único artefacto con contenido técnico es el recuento de 16.576 parámetros reportado por safetensors, una magnitud que no permite construir un modelo funcional ni siquiera del orden de los modelos más pequeños publicados (cientos de millones de parámetros). Es coherente con un tensor auxiliar, un archivo de metadatos o un residuo generado por la herramienta de publicación, no con un checkpoint de lenguaje. El autor indica además que, si en el futuro se añaden resultados, deberán incluir versiones de dataset, comandos, semillas, hardware y logs en crudo.

## Capacidades

- Generación de texto: no disponible. El repositorio no contiene un modelo generativo.
- Razonamiento, matemáticas y código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio, robótica): no disponible.
- Capacidad real del artefacto: documentar el plan de un estudio sobre embodied AI (alcance, confounders, baselines propuestos, requisitos de reproducibilidad, modos de fallo, referencias temáticas) en formato de texto plano.

## Casos de uso

- Plantilla de planificación experimental previa a publicar benchmarks: el `reading.md` sirve como guion para fijar la pregunta de investigación, los confounders esperados y los baselines emparejados antes de ejecutar cualquier experimento, lo que ayuda a evitar comparaciones mal controladas en robótica y agentes encarnados.
- Checklist de reproducibilidad para equipos de embodied AI: el repositorio enumera qué debe acompañar a un resultado (versiones de dataset, comandos, semillas, hardware, logs en crudo), y puede reutilizarse como plantilla de revisión interna antes de enviar un paper o un informe técnico.
- Material docente o de seminario sobre metodología: dado que separa explícitamente planes e hipótesis de resultados, es un ejemplo útil para enseñar a leer críticamente una model card y a distinguir una nota exploratoria de un artefacto con resultados.
- Punto de partida bibliográfico: las referencias temáticas incluidas permiten iniciar una revisión sobre embodied AI, comparación con baselines y modos de fallo, siempre verificando cada fuente de forma independiente.
- Auditoría de claims en repositorios de terceros: el documento funciona como referencia de buenas prácticas para exigir evidencia (datasets, semillas, logs) cuando alguien afirma mejoras en tareas encarnadas.
- Filtrado en pipelines de catalogación de modelos: sirve como caso de prueba para detectar repositorios que, por sus tags (`safetensors`, `transformer`) y su recuento de parámetros, serían clasificados erróneamente como modelos desplegables.
- Revisión de licencias en datasets externos: la model card advierte de que los términos de los datos de origen deben revisarse por separado cuando el repositorio se usa junto a datasets de terceros, algo aplicable como recordatorio en flujos de trabajo con datos licenciados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La propia model card rechaza explícitamente cualquier reclamación de mejora en benchmarks: no hay ablaciones completadas, ni código liberado, ni checkpoint entrenado, ni resultados que puedan tabularse frente a MMLU, HumanEval, GSM8K u otros conjuntos de evaluación.

## Requisitos de hardware

- VRAM para inferencia: no aplica. No existe un modelo que cargar en memoria.
- GPU recomendadas: no aplica (A100, H100, RTX 4090 y similares no tienen uso aquí).
- Ejecución en GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, Transformers): no aplica; ninguno de estos servidores puede servir este repositorio como modelo.
- Huella en disco: el repositorio completo ocupa 0,0 GB.
- Coste del tensor residual: en el supuesto de que el recuento de 16.576 corresponda a parámetros en coma flotante de 32 bits, el tensor ocuparía aproximadamente 66 KB, una magnitud irrelevante en cualquier escenario de despliegue.
- Latencia y throughput: no disponibles (no hay proceso de inferencia asociado).

## Comparativa con modelos similares

No existen modelos comparables, porque este repositorio no es un modelo. Para ilustrar la diferencia de categoría se incluye una tabla de referencia con modelos pequeños reales; los datos de esas filas corresponden a especificaciones públicas ampliamente documentadas y deben verificarse en sus model cards antes de citarse, ya que no proceden de la búsqueda web realizada.

| Artefacto | Categoría | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dosharma87/embodied-ai | Notas de investigación (no es un modelo) | 16.576 (tensor residual) | No aplica | CC-BY-4.0 | Repositorio HF, solo texto |
| TinyLlama-1.1B | Modelo de lenguaje | 1,1 B | 2.048 tokens | Apache-2.0 | Pesos en HF, ejecutable |
| Qwen2.5-0.5B | Modelo de lenguaje | 0,49 B | 32.768 tokens | Apache-2.0 | Pesos en HF, ejecutable |
| SmolLM2-135M | Modelo de lenguaje | 135 M | 8.192 tokens | Apache-2.0 | Pesos en HF, ejecutable |

La comparación pone de manifiesto que la diferencia relevante no es de rendimiento sino de naturaleza: los tres modelos de referencia son artefactos entrenados y desplegables, mientras que `dosharma87/embodied-ai` es documentación.

## Limitaciones y advertencias

- No es un modelo: no contiene pesos entrenados, ni tokenizador, ni configuración de arquitectura, ni código de inferencia.
- Riesgo de clasificación errónea: los tags `safetensors` y `transformer` junto con un recuento de parámetros pueden provocar que herramientas de catalogación o de descubrimiento lo traten como un modelo válido.
- Ausencia total de validación: sin resultados de benchmark, sin ablaciones y sin código, no debe citarse como evidencia de ninguna capacidad ni mejora.
- El propio autor advierte de que las secciones etiquetadas como planes o hipótesis no son resultados experimentales.
- Ámbito lingüístico: la nota está en inglés; no se declaran idiomas soportados porque no hay procesamiento de lenguaje implicado.
- Licencia: CC-BY-4.0 permite reutilización con atribución, pero los términos de los datos de origen deben revisarse por separado si se combina con datasets externos; el propio README lo señala.
- Riesgo de alucinación: no aplica al no existir componente generativo; el riesgo equivalente es interpretar las hipótesis del texto como hallazgos confirmados.
- Fechas del repositorio: la creación y la última actualización figuran como 2026-10-08, una marca temporal anómala que conviene verificar antes de referenciarla.
- Ausencia de mantenimiento observable: 0 descargas, 0 likes y actualización dos segundos posterior a la creación, sin historial de revisiones.
- Para producción: inutilizable. No hay artefacto que integrar en ningún pipeline.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/dosharma87/embodied-ai
- Archivo principal de la nota: `reading.md` (incluido en el repositorio)
- Documentación del repositorio: `README.md` (incluido en el repositorio)
- Organización Embodied AI en HuggingFace: https://huggingface.co/embodied-ai/models
- Embodied AI: Meaning, Working, Types, Applications & Challenges (EDUCBA): https://www.educba.com/embodied-ai/
- What is embodied AI? How it powers autonomous systems (TechTarget): https://www.techtarget.com/searchenterpriseai/definition/embodied-AI
- Artificial Intelligence (AI) Algorithm and Models for Embodied Agents, Robots and Drones (ResearchGate): https://www.researchgate.net/publication/388146155_Artificial_Intelligence_AI_Algorithm_and_Models_for_Embodied_Agents_Robots_and_Drones
- Overview of Embodied Artificial Intelligence (Medium): https://medium.com/machinevision/overview-of-embodied-artificial-intelligence-b7f19d18022
