# GUI-Gym/Qwen3-VL-8B-sft-mobileweave-openmobile

## Resumen

Qwen3-VL-8B-sft-mobileweave-openmobile es un checkpoint de ajuste fino supervisado (SFT) del modelo multimodal Qwen3-VL-8B-Instruct, publicado por el colectivo GUI-Gym. El modelo está especializado en interacción visual con interfaces gráficas de móvil: recibe capturas de pantalla junto con un objetivo en lenguaje natural y genera acciones (toques, deslizamientos, escritura de texto) para completar tareas dentro de aplicaciones Android o iOS. Resuelve, por tanto, el problema de construir agentes GUI que operen sobre píxeles en lugar de sobre APIs internas de la aplicación.

El entrenamiento parte de los pesos de Qwen3-VL-8B-Instruct (8.767.123.696 parámetros reales según el índice de safetensors) y aplica un SFT completo sobre una mezcla de dos conjuntos de datos de 43.474 muestras: 16.114 procedentes de GUI-Gym/sft-qwen3.8-27b-atomic_tasks_and_all_hybrid_tasks y 27.360 de cckevinn/OpenMobile-Data. El torre de visión y el proyector multimodal permanecieron congelados; solo se ajustó el modelo de lenguaje, siguiendo la configuración de referencia del proyecto MobileWeave.

Su relevancia es acotada pero concreta: es un artefacto reproducible (receta, datasets y scripts de evaluación documentados) que sirve como línea base cuantificada para agentes GUI móviles, con una tasa de éxito de 39,88 % en el split de test de MobileWeave. La licencia Apache 2.0 facilita su uso comercial, aunque el rendimiento y la ausencia de benchmarks generalistas obligan a evaluarlo en el dominio específico antes de cualquier despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL): torre de visión + proyector multimodal + modelo de lenguaje; no se detalla la configuración interna de capas en la información disponible |
| Parámetros totales | 8.767.123.696 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el entrenamiento se realizó con un corte de 32.768 tokens |
| Tipos de cuantización | no disponible; el repositorio solo publica pesos BF16. Al ser compatible con Transformers y vLLM, admite cuantizaciones estándar (FP8, INT8, INT4) mediante herramientas externas, sin artefactos publicados por el autor |
| Idiomas soportados | no disponibles (la model card no declara cobertura lingüística ni composición idiomática de los datasets) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors BF16 en 4 shards, con índice de pesos, configuración, tokenizer, processor y plantilla de chat |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3-VL en su variante de 8B: un codificador visual que procesa las capturas de pantalla, un proyector que alinea las representaciones visuales con el espacio del modelo de lenguaje y un decoder transformer autorregresivo que genera la respuesta. En este checkpoint, el ajuste se aplicó exclusivamente al modelo de lenguaje: la torre de visión y el proyector quedaron congelados, lo que reduce el coste de entrenamiento y preserva las capacidades perceptivas del modelo base. La plantilla utilizada fue `qwen3_vl_nothink`, es decir, sin modo de razonamiento explícito.

El SFT se ejecutó con MobileWeave (`train_sft.sh`) durante 3 épocas, lo que supone 4.077 pasos de optimizador. La configuración fue BF16, batch global de 32, optimizador AdamW, tasa de aprendizaje 1e-5 con decaimiento coseno, warmup ratio de 0,03 y DeepSpeed ZeRO-2. El conjunto mixto de 43.474 muestras se barajó con semilla 42, y cada muestra de origen aparece una sola vez. No se documentan fases de RLHF, DPO ni preferencias; se trata, por tanto, de imitación supervisada pura sobre trayectorias de interacción. El cutoff de 32.768 tokens sugiere historiales de episodio relativamente largos, compatibles con 40 pasos máximos de agente en evaluación.

## Capacidades

- Generación de acciones sobre interfaces móviles a partir de capturas de pantalla e instrucciones en lenguaje natural.
- Comprensión de imagen y texto conjunta (pipeline `image-text-to-text`) heredada de Qwen3-VL-8B-Instruct.
- Razonamiento multi-paso dentro de un episodio: la evaluación usa hasta 40 pasos por tarea, con observación del estado de la pantalla tras cada acción.
- Soporte de tool calling / function calling en el formato del agente `mbweave`, empleado en el script de evaluación del autor.
- Capacidad de operar como agente autónomo con bucle percepción-acción sobre un entorno móvil.
- Generación de texto y respuestas conversacionales multi-turno dentro del bucle de interacción.
- No se documentan capacidades de audio, ni modo de pensamiento explícito (la plantilla de entrenamiento es `nothink`).
- Capacidades multilingües: no declaradas en la información disponible.
- Capacidades generalistas (código, matemáticas, MMLU) no evaluadas en este checkpoint.

## Casos de uso

- Automatización de pruebas de regresión en apps móviles: el modelo puede actuar como tester autónomo que ejecuta un guion de tareas sobre la app real, comparando el estado final con el esperado; su ventana de entrenamiento de 32.768 tokens permite mantener el historial de pasos de un episodio completo sin truncar.
- RPA móvil para tareas repetitivas: extracción de datos de pantallas, rellenado de formularios o publicación de contenidos en apps que carecen de API pública, usando únicamente capturas de pantalla como entrada.
- Asistencia remota a usuarios: dado un objetivo descrito por el usuario, el agente propone y ejecuta la secuencia de toques necesaria, útil en soporte técnico de primer nivel para tareas guiadas.
- Generación de trayectorias sintéticas para entrenamiento: el checkpoint puede producir episodios etiquetados (observación-acción) que alimenten pipelines posteriores de SFT o RL sobre agentes GUI.
- Evaluación comparativa de agentes GUI: al estar entrenado y evaluado con la misma receta MobileWeave (semillas 0-7, 256 tareas por semilla), sirve como línea base reproducible frente a otros agentes del mismo benchmark.
- Accesibilidad: traducción de instrucciones verbales o textuales en operaciones concretas sobre la interfaz para usuarios con dificultades motoras o visuales, siempre con supervisión humana.
- Automatización de flujos de incorporación (onboarding): recorrer asistentes de configuración de apps y verificar que cada pantalla se completa correctamente en distintas versiones del sistema.

## Benchmarks y rendimiento

Evaluación sobre el split de test de MobileWeave: 8 semillas (0-7), 256 tareas por semilla, 2.048 episodios en total, agente `mbweave`, máximo 40 pasos, temperatura 0 y juicio por pregunta-respuesta desactivado.

| Métrica | Resultado agrupado |
|---|---|
| Tasa de éxito nativa (SR, excluye episodios con error) | 39,8827 % (816 / 2.046) |
| Tasa de progreso (PR, incluye todos los episodios) | 51,7082 % |
| Tasa de éxito sobre todos los episodios | 39,8438 % (816 / 2.048) |

Dos episodios terminaron con un error de análisis (parsing) de la llamada a herramienta del modelo; la SR nativa los excluye y la PR los incluye. No se repitieron ejecuciones: se conservan los resultados de la primera pasada. No se han publicado resultados de benchmarks generalistas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16: los pesos ocupan aproximadamente 17,5 GB (tamaño del repositorio); con caché KV y buffers para imágenes, el consumo realista ronda los 20-24 GB en contexto moderado.
- VRAM estimada en FP8/INT8: en torno a 9-10 GB de pesos, más overhead de activaciones y caché KV.
- VRAM estimada en INT4: en torno a 5 GB de pesos, más overhead; requiere cuantización externa, ya que el autor no publica artefactos cuantizados.
- GPU de gama alta recomendadas: A100 40/80 GB, H100, L40S. Para BF16 en producción conviene partir de 24 GB o más.
- GPU de consumo: una RTX 4090 (24 GB) puede ejecutar BF16 en contextos moderados y con batch pequeño; en INT4/FP8 el modelo cabe en RTX 3090, 4080, 4060 Ti 16 GB o RTX 3060 12 GB, con latencia mayor por imagen procesada.
- Despliegue: vLLM (la evaluación del autor usó vLLM 0.17.0) para servicio de alto throughput; Transformers 4.57.6 con `Qwen3VLForConditionalGeneration` y `AutoProcessor` para integración directa; TGI como alternativa de servidor. No se publican ficheros GGUF, por lo que llama.cpp u Ollama requerirían conversión propia.
- Latencia y throughput: no disponibles. Como referencia cualitativa, el pipeline es sensible al coste de codificación de imagen en cada paso del bucle de agente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-VL-8B-sft-mobileweave-openmobile (este) | 8,77 B | no disponible (entreno a 32.768 tokens) | SR 39,88 % en MobileWeave | Apache 2.0 | Pesos BF16 en HuggingFace |
| Qwen3-VL-8B-Instruct (base) | 8,77 B | no disponible | no disponible en la información proporcionada | Apache 2.0 | Pesos públicos en HuggingFace |
| Otros agentes GUI móviles de la familia MobileWeave | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con alternativas de la misma categoría (UI-TARS, OS-Atlas, Ferret-UI y similares) no puede establecerse con rigor: la información disponible no incluye sus especificaciones ni resultados en el mismo benchmark, por lo que cualquier cifra sería una invención. La única comparación fiable es contra el modelo base, del que este checkpoint se diferencia por el SFT específico de GUI móvil y por la receta reproducible publicada.

## Limitaciones y advertencias

- Rendimiento moderado: una tasa de éxito nativa del 39,88 % implica que aproximadamente 6 de cada 10 tareas no se completan; no es adecuado para automatización sin supervisión en flujos críticos.
- El ajuste se limita a 43.474 muestras y 3 épocas sobre el modelo de lenguaje; la torre de visión congelada puede limitar la adaptación a resoluciones, densidades de píxel o interfaces muy distintas de las del entrenamiento.
- Dos de los 2.048 episodios fallaron por errores de análisis de la llamada a herramienta, lo que señala fragilidad del formato de salida del agente; en producción conviene validar y reintentar las acciones.
- Riesgo de alucinación de elementos de interfaz: el modelo puede emitir coordenadas o identificadores de control inexistentes en la pantalla observada.
- Riesgo de acciones destructivas (borrado de datos, compras, envíos) sin salvaguardas incorporadas; es necesario un filtro externo de acciones y confirmación humana.
- No se declaran idiomas soportados ni la composición lingüística de los datasets; el comportamiento en instrucciones en castellano no está verificado.
- No hay evaluación de sesgos ni de seguridad publicada por el autor.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se recomienda revisar las condiciones del modelo base Qwen3-VL-8B-Instruct y de los datasets de origen (GUI-Gym y cckevinn/OpenMobile-Data) antes de redistribuir derivados.
- Contexto efectivo de entrenamiento de 32.768 tokens: episodios muy largos con muchas capturas pueden degradar el rendimiento si se supera ese régimen.
- No se publican cuantizaciones oficiales; cualquier versión INT4/FP8 debe validarse de nuevo con `run_eval_multi_seeds.sh`, porque la degradación en tareas de coordenadas precisas puede ser significativa.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GUI-Gym/Qwen3-VL-8B-sft-mobileweave-openmobile
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Dataset de tareas atómicas e híbridas: https://huggingface.co/datasets/GUI-Gym/sft-qwen3.8-27b-atomic_tasks_and_all_hybrid_tasks
- Dataset OpenMobile: https://huggingface.co/datasets/cckevinn/OpenMobile-Data
- Configuración detallada del entrenamiento: https://huggingface.co/GUI-Gym/Qwen3-VL-8B-sft-mobileweave-openmobile/blob/main/training_summary.json
- Resultados de evaluación por semilla: https://huggingface.co/GUI-Gym/Qwen3-VL-8B-sft-mobileweave-openmobile/blob/main/evaluation_results.json
- Búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a la planta del muérdago (Viscum album) y a la definición genérica de interfaz gráfica de usuario, sin relación con este checkpoint.
