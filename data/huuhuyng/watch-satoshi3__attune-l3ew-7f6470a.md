# huuhuyng/watch-satoshi3__attune-l3eW-7f6470a

## Resumen

Attune Vector Level 3 policy (vector_v1.1) es un fine-tune del modelo domFree/attune-j4 publicado por el usuario huuhuyng en Hugging Face. Se trata de una política visomotora para robótica (visuomotor policy) orientada al lane "Robotensor Attune Vector (Level 3)", no de un modelo de lenguaje: combina codificadores de visión CLIP con un decodificador transformer y una U-Net de difusión que genera acciones motoras a partir de observaciones visuales y de propiocepción. El checkpoint tiene 780.979.360 parámetros y un repositorio de 3,1 GB en formato safetensors.

El modelo parte del checkpoint padre domFree/attune-j4 (revisión 4a2651b08cb70332bfe9b86ef9b2efaff1825eb8) y aplica una técnica de ensemble en espacio de pesos (WiSE-FT) que interpola linealmente los pesos del padre con los de un fine-tune: theta = parent + 0,5 × (fine-tune - parent). El fine-tune se entrenó por imitación sobre dieciséis tareas del harness RoboTwin-Vector con un robot franka-panda, reforzando las cuatro tareas con peor rendimiento del padre.

La relevancia del modelo es acotada y experimental: no hay pipeline declarado, ni licencia, ni idiomas, ni resultados de benchmarks publicados, y el repositorio registra cero descargas y cero likes en el momento de la consulta. Es un artefacto de investigación para reproducción de políticas robóticas, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: codificadores de visión CLIP + decodificador transformer + U-Net de difusión (política visomotora) |
| Parametros totales | 780.979.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: política robótica, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors sin cuantizar) |
| Idiomas soportados | no disponible (no aplica: modelo de acciones, no de texto) |
| Licencia | no disponible (el repositorio padre no declara licencia) |
| Formato de pesos | safetensors (model.safetensors, 753 tensores, layout vector_v1.1) |

## Arquitectura y entrenamiento

La arquitectura sigue el layout vector_v1.1 del modelo padre e integra tres bloques: codificadores de visión CLIP, un decodificador transformer y una U-Net de difusión que predice acciones con objetivo epsilon-prediction. El checkpoint conserva bit a bit los codificadores CLIP, los normalizadores de acción y propiocepción, y las capas de propiocepción y prompt-pool del padre; solo se entrenaron el decodificador transformer, la U-Net de difusión y los embeddings de posición y sink. El peso total es de 753 tensores.

El entrenamiento del fine-tune consistió en 20.000 pasos con batch de 64, learning rate 1e-5 con decaimiento coseno y EMA de 0,999, sobre episodios Level 3 generados con el harness RoboTwin-Vector (robot franka-panda, semillas públicas por debajo de 2.000.000). Se imitaron demostraciones expertas de las dieciséis tareas, con sobremuestreo de las cuatro más débiles (beat_block_hammer, place_mouse_pad, place_dual_shoes, move_stapler_pad), episodios de recuperación con expert-takeover y un anclaje en espacio de funciones al padre congelado sobre las otras doce tareas, con peso 2. La fusión final con el padre se realizó mediante WiSE-FT con coeficiente 0,5.

## Capacidades

- Generación de acciones motoras para manipulación robótica a partir de observaciones visuales y propioceptivas.
- Ejecución de dieciséis tareas del benchmark RoboTwin-Vector en el robot franka-panda.
- Procesamiento de entrada visual mediante codificadores CLIP congelados.
- Difusión de acciones con predicción epsilon, adecuada para políticas multimodales.
- Recuperación ante perturbaciones, gracias a los episodios de expert-takeover incluidos en el entrenamiento.
- No dispone de tool calling, function calling, razonamiento multi-paso textual, capacidades multilingües ni modos de pensamiento: no es un modelo de lenguaje.
- No se documentan capacidades de audio ni de visión general más allá del uso como entrada de política.

## Casos de uso

- Investigación en imitación robótica: sirve como checkpoint de referencia para reproducir los resultados del lane Level 3 sobre RoboTwin-Vector con el harness oficial y semillas por debajo de 2.000.000.
- Evaluación comparativa de políticas: al mantener bit a bit los codificadores CLIP y los normalizadores del padre, permite aislar el efecto del decodificador y la U-Net en experimentos controlados.
- Estudio de WiSE-FT: el coeficiente 0,5 documentado permite analizar cómo la interpolación de pesos afecta a la estabilidad de la política frente al fine-tune puro.
- Manipulación de objetos en simulación: las tareas beat_block_hammer, place_mouse_pad, place_dual_shoes y move_stapler_pad están específicamente reforzadas, por lo que son el punto de partida natural para pruebas de agarre y colocación.
- Recuperación ante fallos: los episodios de expert-takeover hacen del modelo un candidato para estudiar políticas tolerantes a desviaciones del estado inicial.
- Baseline para fine-tuning posterior: el layout de 753 tensores y la separación entre bloques congelados y entrenables facilitan adaptaciones a nuevas tareas sin reentrenar la visión.
- Docencia y divulgación: útil para ilustrar políticas visomotoras con difusión en cursos de aprendizaje por refuerzo e imitación, dado su tamaño moderado (3,1 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito por tarea ni comparaciones cuantitativas con el padre, y la búsqueda web no aporta métricas del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,6 GB en fp16 para los 780.979.360 parámetros, más el coste de activaciones de los codificadores CLIP y de la U-Net de difusión; el repositorio completo ocupa 3,1 GB.
- GPU recomendadas: no disponible en la documentación; por tamaño, cualquier GPU con al menos 8 GB de VRAM debería alojar el modelo en fp16 con margen para activaciones.
- GPU de consumo: cabe previsiblemente en RTX 3060, RTX 4060, RTX 4070 y superiores; no hay validación publicada.
- Opciones de despliegue: no disponible; al ser una política robótica con safetensors, requeriría el código del harness RoboTwin-Vector o del repositorio padre, no vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Attune Vector Level 3 (este) | 780.979.360 | no aplica | sin benchmarks publicados | no disponible | safetensors, 0 descargas |
| domFree/attune-j4 (padre) | no disponible en la informacion | no aplica | sin benchmarks publicados | no disponible | safetensors en Hugging Face |
| Otros modelos RoboTwin-Vector | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse por imitación de demostraciones expertas, puede heredar sesgos de las trayectorias del harness y del robot franka-panda.
- Riesgo de alucinación: no aplica en el sentido textual, pero la política puede generar acciones no válidas fuera de la distribución de las dieciséis tareas entrenadas.
- Limitaciones de contexto e idioma: no procesa texto ni mantiene contexto conversacional; su entrada es visual y propioceptiva.
- Restricciones de licencia: el repositorio padre no declara licencia y esta model card no reclama derechos adicionales; el uso comercial queda en un limbo legal que exige contactar con el autor original.
- Caveats para producción: cero descargas y cero likes, sin pipeline declarado, sin métricas de éxito y con un único checkpoint; no es un artefacto validado para despliegue real.
- La fusión WiSE-FT con coeficiente 0,5 puede diluir las mejoras del fine-tune en las cuatro tareas reforzadas; conviene comparar contra el fine-tune puro antes de adoptarlo.
- El nombre del repositorio (watch-satoshi3__attune-l3eW-7f6470a) no sigue una convención estándar y dificulta la trazabilidad respecto al padre.

## Enlaces

- Hugging Face: https://huggingface.co/huuhuyng/watch-satoshi3__attune-l3eW-7f6470a
- Modelo padre: https://huggingface.co/domFree/attune-j4
- Revisión del padre citada: 4a2651b08cb70332bfe9b86ef9b2efaff1825eb8
- Attune (sitio del proyecto): https://attune.watch/
- Ranking de benchmarks de referencia: https://artificialwatch.com/benchmarks
- Paper de WiSE-FT: no disponible en la informacion proporcionada
- Repositorio RoboTwin-Vector: no disponible en la informacion proporcionada
