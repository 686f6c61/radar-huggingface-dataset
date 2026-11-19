# ishitag925/pi05-bee-seated16-half149-dagger-flat-lr5e-6-from36000-20261118

## Resumen

Pi0.5 bee-frame pickup with DAgger es un checkpoint de política robótica (vision-language-action, VLA) derivado de la familia Pi0.5 de Physical Intelligence, publicado por el usuario ishitag925 en Hugging Face bajo la librería openpi. El modelo resuelve una tarea de manipulación muy concreta: la extracción de un marco ("bee frame") por parte de un brazo robótico Piper-X, incluyendo la aproximación, el agarre y el mantenimiento de la presa durante dos segundos. Se trata de un ajuste fino (fine-tuning) supervisado seguido de rondas de DAgger (Dataset Aggregation), una técnica de aprendizaje por imitación interactivo en la que un experto corrige al aprendiz en los estados donde este falla.

El checkpoint publicado corresponde al paso absoluto 36500, obtenido tras un SFT completo que arranca desde el paso 36000 del modelo base `pi05-bee-frame-pickup-yaw7-297-seated16-b64-rtx6000-from7500-20261117`. El conjunto de datos de la ronda DAgger conserva exactamente 149 de los 297 episodios originales y agrega trayectorias reales de toma de control por parte del experto. El repositorio ocupa 12,4 GB, lo que es coherente con un modelo tipo VLA de varios miles de millones de parámetros en precisión completa, aunque el autor no detalla el recuento exacto.

La relevancia de esta ficha es acotada: no es un modelo de propósito general ni un LLM, sino un artefacto de investigación reproducible para un pipeline robótico específico. Su interés radica en la metodología (DAgger sobre Pi0.5 con procedencia trazable por checkpoint, normalización emparejada y verificación de hashes) más que en capacidades lingüísticas o de razonamiento general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) de la familia Pi0.5; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a control robótico, no a texto) |
| Licencia | no disponible |
| Formato de pesos | parámetros en `checkpoints/STEP/params` (formato openpi/JAX; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia Pi0.5, una arquitectura VLA que combina un backbone de visión y lenguaje con una cabeza de política que emite acciones motoras. El autor no documenta en la model card el número de parámetros, la composición del corpus visual o los detalles del backbone; solo se indica que se trata de un ajuste fino completo ("full model fine-tuning") con EMA desactivado y batch global de 64 sobre dos GPUs.

El entrenamiento se estructura en dos fases. Primero, un SFT completo que parte del checkpoint 36000 del modelo base, fijado en el commit `1e27f30700ea4a864627e28e162b639487048c22`. Después, rondas de DAgger: el aprendiz controla cada rollout hasta que se observa un fallo o un levantamiento parcial bloqueado, momento en el que un planificador/controlador automático completa la extracción y mantiene el agarre dos segundos. El adaptador lee directamente `expert_action_chunk`, es decir, 50 comandos expertos reales subsecuentes, con padding dentro de cada episodio. Los prefijos del aprendiz se conservan solo como procedencia, no como señal de entrenamiento. El optimizador es AdamW, reinicializado en el paso 36000, con learning rate plano de 5e-6 y una cola planificada de 10000 actualizaciones hasta el paso absoluto 46000.

## Capacidades

- Control robótico de manipulación: genera comandos motores para un brazo Piper-X orientados a la extracción de un marco ("bee frame").
- Ejecución de una política de agarre con mantenimiento de presa de dos segundos tras la extracción.
- Aprendizaje por imitación interactivo: el checkpoint incorpora correcciones expertas de rondas DAgger sobre estados de fallo del aprendiz.
- Reproducibilidad por checkpoint: cada 500 actualizaciones se publica un checkpoint con activos de normalización emparejados y registro de procedencia.
- Trazabilidad de datos: cada checkpoint registra el commit exacto del dataset utilizado.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes multi-paso, multilingüismo ni modalidades de audio.

## Casos de uso

- Investigación en aprendizaje por imitación interactivo: el checkpoint sirve como punto de partida para nuevas rondas DAgger sobre la misma tarea, ya que el autor indica que cada ronda adicional requiere una nueva instrucción de usuario y el estado del optimizador se conserva localmente.
- Reproducción de experimentos de VLA: al publicarse cada 500 pasos con normalización y procedencia, permite comparar la evolución de la política entre el paso 36000 y el 46000 planificado.
- Automatización de una celda de laboratorio concreta: el modelo puede desplegarse en un brazo Piper-X para la extracción repetitiva de marcos en un entorno controlado, siempre que las condiciones visuales coincidan con las del dataset.
- Evaluación de técnicas de agregación de datos: útil para estudiar cómo afecta retener 149 de 297 episodios y añadir tomas de control expertas al rendimiento final de la política.
- Docencia y formación en robótica: como ejemplo práctico de pipeline openpi con checkpoints versionados, normalización emparejada y verificación de hashes remotos.
- Base para transferencia a tareas análogas: el ajuste fino desde este checkpoint podría adaptarse a variantes de agarre o extracción con un nuevo conjunto de demostraciones, aunque no hay evidencia publicada de dicha transferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de agarre, curvas de aprendizaje ni comparaciones cuantitativas con el modelo base o con otros checkpoints de la serie.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 12,4 GB, lo que sugiere pesos en precisión completa o mixta, pero el autor no publica el recuento de parámetros ni requisitos de memoria.
- GPU recomendadas: no disponible. El entrenamiento se realizó con batch global de 64 sobre dos GPUs, sin especificar modelo; el nombre del modelo base menciona "rtx6000", lo que apunta a NVIDIA RTX 6000 como hardware de referencia en la cadena de entrenamiento.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la librería declarada es openpi; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de política robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-bee-seated16-half149-dagger-flat-lr5e-6-from36000-20261118 (este) | no disponible | no disponible | Extracción de marco con Piper-X, DAgger | no disponible | Hugging Face, 0 descargas |
| pi05-bee-frame-pickup-yaw7-297-seated16-b64-rtx6000-from7500-20261117 (modelo base) | no disponible | no disponible | Extracción de marco con Piper-X, SFT | no disponible | Hugging Face |
| Pi0.5 (familia original de Physical Intelligence) | no disponible en la información proporcionada | no disponible | VLA de propósito general para manipulación | no disponible | No confirmado en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea (extracción de marco con un brazo Piper-X) y no se espera que generalice a otros objetos, brazos o entornos sin nuevo ajuste fino.
- Dataset reducido: solo 149 episodios efectivos, lo que limita la diversidad de estados cubiertos y aumenta el riesgo de sobreajuste a condiciones visuales concretas.
- Sin métricas publicadas: no hay tasas de éxito ni evaluaciones independientes que permitan estimar la fiabilidad en producción.
- Licencia no disponible: no se puede confirmar el uso comercial; debe consultarse al autor antes de cualquier despliegue productivo.
- Idiomas no aplicables: el modelo no procesa texto de usuario de forma convencional, por lo que las consideraciones multilingües no son pertinentes.
- Riesgo de alucinación en el sentido de acciones erróneas: al ser una política de imitación, puede ejecutar comandos plausibles pero incorrectos en estados fuera de distribución, con riesgo físico asociado en un brazo real.
- Procedencia dependiente de infraestructura local: el estado completo del optimizador se conserva localmente y no se publica, lo que dificulta la reproducción exacta de las rondas DAgger por terceros.
- Fecha de creación futura (2026-11-19) y ausencia de descargas o likes: el artefacto no cuenta con validación comunitaria en el momento de redactar esta ficha.

## Enlaces

- Hugging Face: https://huggingface.co/ishitag925/pi05-bee-seated16-half149-dagger-flat-lr5e-6-from36000-20261118
- Modelo base: https://huggingface.co/ishitag925/pi05-bee-frame-pickup-yaw7-297-seated16-b64-rtx6000-from7500-20261117
- Dataset: https://huggingface.co/datasets/ishitag925/bee-seated16-half149-dagger-from36000-20261118
- Commit del checkpoint de partida: `1e27f30700ea4a864627e28e162b639487048c22` (referenciado en la model card, sin URL directa proporcionada)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
