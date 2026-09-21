# rohansiva/gr00t-libero-x-level123

## Resumen

`rohansiva/gr00t-libero-x-level123` es un ajuste fino (finetune) del checkpoint `libero_10` de `nvidia/GR00T-N1.7-LIBERO`, un modelo de visión-lenguaje-acción (VLA) orientado a robótica de manipulación. Lo publica el usuario `rohansiva` bajo licencia Apache 2.0 y contiene 3.144.016.000 parámetros (unos 3,14 mil millones) en pesos safetensors, con un repositorio de 6,9 GB. Su objetivo es extender el repertorio del modelo base a 152 tareas de los niveles 1, 2 y 3 del subconjunto `EXTENSION_KITCHEN` y `EXTENSION_STUDY` del conjunto de datos `meituan/LIBERO-X`.

El interés del modelo es acotado pero concreto: cubre íntegramente las listas de tareas de nivel 1 a 3 solicitadas (218 pares escena/tarea que colapsan a 152 cadenas de instrucción distintas, porque LIBERO-X reutiliza el mismo enunciado en varias escenas) partiendo de un checkpoint que solo había visto `libero_10`. Esto lo convierte en un punto de partida útil para investigar generalización entre escenas dentro del simulador LIBERO y para comparar estrategias de ajuste sobre un backbone VLA preentrenado.

Se trata de un artefacto de investigación muy reciente y sin tracción: cero descargas y cero likes en el momento de redactar esta ficha, sin resultados de tasa de éxito publicados y sin cuantizaciones alternativas. No es un modelo de propósito general ni un LLM: es una política robótica para simulación, con espacio de acciones de 7 dimensiones y estado de 8 dimensiones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (visión-lenguaje-acción) derivada de GR00T N1.7; los flags de entrenamiento (`tune_llm`, `tune_visual`, `tune_diffusion_model`, `tune_vlln`) indican un backbone visión-lenguaje con cabeza de acción basada en difusión |
| Parámetros totales | 3.144.016.000 (≈3,14 B) |
| Parámetros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el autor solo publica pesos safetensors; el tamaño del repo, 6,9 GB, es coherente con bf16/fp16 para 3,14 B de parámetros) |
| Idiomas soportados | no disponible (las instrucciones del dataset LIBERO/LIBERO-X están en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model-*.safetensors` + `model.safetensors.index.json`), acompañados de `config.json`, `processor_config.json`, `embodiment_id.json` y `statistics.json` |
| Modelo base | `nvidia/GR00T-N1.7-LIBERO` (checkpoint `libero_10`) |
| Embodiment | `libero_sim` (etiqueta integrada `EmbodimentTag.LIBERO_PANDA`, brazo Panda, estado de 8 dimensiones y acción de 7 dimensiones) |
| Pipeline / tarea | `robotics` |
| Tamaño del repositorio | 6,9 GB (solo pesos; el estado de optimizador de DeepSpeed está excluido) |
| Descargas / likes | 0 / 0 |
| Fecha de creación (metadatos) | 2026-09-21T18:32:12Z |

## Arquitectura y entrenamiento

El modelo es un ajuste fino parcial sobre `GR00T-N1.7-LIBERO`. La configuración de entrenamiento indica que se actualizaron el proyector (`tune_projector=True`), el modelo de difusión que produce las acciones (`tune_diffusion_model=True`) y las capas de normalización del módulo visión-lenguaje (`tune_vlln=True`), mientras que el LLM (`tune_llm=False`) y el codificador visual (`tune_visual=False`) quedaron congelados y se heredan del checkpoint base. Es decir, el ajuste adapta la interfaz entre percepción, lenguaje y generación de acciones, no el conocimiento lingüístico ni las representaciones visuales subyacentes. No se dispone de información sobre el número de tokens de entrenamiento del backbone original ni sobre si hubo RLHF o DPO.

Los datos de entrenamiento provienen de `meituan/LIBERO-X` (formato LeRobot v2.1), filtrados por coincidencia exacta de la descripción de tarea contra los ficheros `.bddl` solicitados, resueltos a través del campo `:language` de cada fichero. El conjunto resultante son 1.076 episodios, 371.555 fotogramas y 152 tareas. El entrenamiento se ejecutó con 7 GPU NVIDIA RTX A5000, tamaño de batch global 168 (24 por GPU), tasa de aprendizaje 3e-5, weight decay 1e-5, warmup ratio 0,05 y schedule coseno, en precisión bf16 con DeepSpeed ZeRO-2. Se completaron 20 épocas, 44.233 pasos y aproximadamente 24 horas y 43 minutos de tiempo de pared, con una pérdida final de entrenamiento de 0,167. No se publican métricas de validación ni de éxito en tarea.

## Capacidades

- Generación de acciones de manipulación robótica de 7 dimensiones condicionadas por observaciones visuales, estado propioceptivo de 8 dimensiones e instrucciones en lenguaje natural.
- Ejecución de tareas de manipulación de los niveles 1, 2 y 3 del subconjunto `EXTENSION_KITCHEN` y `EXTENSION_STUDY` de LIBERO-X, hasta 152 instrucciones distintas.
- Comprensión de instrucciones en inglés procedentes del dataset LIBERO/LIBERO-X (idiomas adicionales no documentados).
- Control de un brazo Panda dentro del simulador LIBERO, con la etiqueta de embodiment `libero_sim`.
- Ajuste posterior desde este checkpoint: el autor indica que el fichero es apto para fine-tuning estilo LoRA, ya que excluye el estado del optimizador de DeepSpeed.
- No soporta tool calling ni function calling: no es un LLM conversacional.
- No hay evidencia de soporte de agentes, razonamiento multi-paso simbólico, generación de código, matemáticas ni modo de razonamiento explícito.
- No hay capacidades de audio, vídeo ni visión generalista documentadas más allá del uso como entrada sensorial del controlador.

## Casos de uso

- Evaluación comparativa en LIBERO-X: desplegar la política en los niveles 1 a 3 y medir tasa de éxito frente al checkpoint base `GR00T-N1.7-LIBERO/libero_10` para cuantificar cuánto aporta el ajuste sobre las 152 tareas nuevas.
- Punto de partida para nuevos ajustes: usar este checkpoint como base de fine-tuning con `tune_llm=False` y `tune_visual=False` para adaptarlo a otras listas de tareas de LIBERO-X sin reentrenar el backbone completo.
- Estudio de ablación de módulos: al conservar entrenables el proyector, la cabeza de difusión y las capas VLLN, permite analizar qué componente contribuye más a la adaptación entre escenas.
- Investigación académica en simulación: reproducir experimentos de generalización de instrucciones en un laboratorio con GPUs de gama media-alta, dado que los pesos en bf16 ocupan del orden de 6,3 GB.
- Generación de trayectorias sintéticas: ejecutar la política sobre escenas LIBERO-X para recolectar demostraciones adicionales y ampliar datasets de entrenamiento de otros controladores.
- Docencia y formación en robótica: prácticas de políticas VLA con un modelo de 3,14 B ejecutable en una única GPU de 24 GB, con la configuración de inferencia documentada en el ecosistema GR00T.
- Regresión automatizada en pipelines de investigación: integrar la evaluación de las 152 tareas en un flujo de integración continua para detectar degradaciones al modificar la configuración de inferencia.
- Transferencia a robot real: solo como etapa intermedia antes de un ajuste con datos reales; el modelo se ha entrenado exclusivamente sobre `libero_sim` y no hay evidencia de transferencia sim-to-real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la pérdida final de entrenamiento (0,167) tras 44.233 pasos, métrica que no permite estimar la tasa de éxito en tarea ni comparar de forma fiable con otras políticas.

| Métrica | Valor | Observaciones |
|---|---|---|
| Pérdida final de entrenamiento | 0,167 | Reportada por el autor; no hay partición de validación publicada |
| Tasa de éxito en LIBERO-X | no disponible | No publicada |
| MMLU / HumanEval / GSM8K | no aplica | Modelo VLA de robótica, no LLM de propósito general |

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 6,3 GB solo para los pesos en bf16/fp16; con activaciones, buffers del codificador visual y del decodificador de difusión, es razonable reservar entre 8 y 12 GB.
- GPU de referencia: el entrenamiento se realizó con 7 tarjetas NVIDIA RTX A5000 (24 GB), una por proceso con batch 24. Para inferencia basta una sola unidad.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090). En 8 GB el margen es escaso y puede requerir reducir el tamaño de lote o el número de cámaras de entrada.
- GPU de centro de datos: A100, H100 o L40S son adecuadas para evaluar las 152 tareas en paralelo o para reentrenar con lotes grandes.
- Entrenamiento: el ajuste documentado requirió 7 GPU de 24 GB con DeepSpeed ZeRO-2 y precisión bf16 durante casi 25 horas; no es viable en una sola GPU de consumo con la misma configuración.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, TGI, llama.cpp u Ollama, que además no están orientados a políticas VLA. El despliegue esperado es mediante el ecosistema NVIDIA GR00T/Isaac y el formato safetensors con su `processor_config.json` y `statistics.json`.
- Latencia y throughput: no disponibles. No se publican mediciones de frecuencia de control ni de tiempo por paso de difusión.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `rohansiva/gr00t-libero-x-level123` | 3,14 B | no disponible | apache-2.0 | HuggingFace (0 descargas) | Ajuste sobre 152 tareas de LIBERO-X niveles 1-3 |
| `nvidia/GR00T-N1.7-LIBERO` (base) | mismo backbone | no disponible | no disponible (condiciones propias de NVIDIA; verificar) | HuggingFace | Entrenado sobre `libero_10`; referencia directa de comparación |
| OpenVLA | 7 B | no disponible | no disponible (verificar la licencia publicada) | HuggingFace / GitHub | Política VLA alternativa de mayor tamaño, entrenada sobre Open X-Embodiment |
| Políticas específicas por tarea entrenadas desde cero | variable | no aplica | según implementación | no disponible | Baseline habitual en LIBERO; sin datos comparativos en esta ficha |

No se dispone de resultados de tasa de éxito de este checkpoint ni del base en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Cobertura restringida: solo cubre las 152 instrucciones de los niveles 1 a 3 de `EXTENSION_KITCHEN` y `EXTENSION_STUDY` de LIBERO-X. Fuera de ese repertorio, el comportamiento no está caracterizado.
- Dominio exclusivamente simulado: el entrenamiento usa el embodiment `libero_sim` con un brazo Panda de 7 dimensiones de acción y 8 de estado. No hay evidencia de transferencia a hardware real ni de robustez ante ruido sensorial real.
- Sin validación comunitaria: 0 descargas y 0 likes, sin resultados de éxito publicados; la única métrica disponible es la pérdida de entrenamiento, que no mide desempeño en tarea.
- Riesgo de sobreajuste: 20 épocas sobre 1.076 episodios y 44.233 pasos con `tune_llm=False` y `tune_visual=False` pueden producir una política muy ajustada a las escenas del subconjunto, con degradación en escenas no vistas.
- Alucinación en el sentido robótico: fuera de distribución, el modelo puede generar trayectorias físicamente inválidas o colisiones, no solo texto incorrecto. Cualquier despliegue debe incluir comprobaciones de seguridad cinemática.
- Idiomas: las instrucciones del dataset están en inglés; no hay soporte multilingüe documentado.
- Licencia: el repositorio declara apache-2.0, pero el modelo base `nvidia/GR00T-N1.7-LIBERO` puede estar sujeto a condiciones distintas. Conviene verificar la licencia del modelo original antes de cualquier uso comercial.
- Ecosistema limitado: no hay pesos cuantizados (GGUF, AWQ, GPTQ) ni compatibilidad declarada con servidores de inferencia de propósito general.
- Metadatos: la fecha de creación del repositorio figura como 2026-09-21, lo que supone una anomalía que conviene comprobar antes de citar el artefacto como versión definitiva.
- Sesgos de datos: LIBERO-X es una recolección teleoperada en simulación; hereda su distribución de escenas, objetos e iluminación y no representa la variedad de entornos reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rohansiva/gr00t-libero-x-level123
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-LIBERO
- Dataset LIBERO-X: https://huggingface.co/datasets/meituan/LIBERO-X
- Repositorio LIBERO-X en GitHub: https://github.com/meituan/LIBERO-X
- La búsqueda web realizada no devolvió resultados técnicos relevantes: únicamente enlaces genéricos a YouTube, sin relación con el modelo.
