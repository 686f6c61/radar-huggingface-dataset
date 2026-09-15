# dreamdifferent/panda-robosuite-level4-wrist-ablation-v1-videolora200-action-decoder-iter1800

## Resumen

`dreamdifferent/panda-robosuite-level4-wrist-ablation-v1-videolora200-action-decoder-iter1800` es un checkpoint de un decodificador de acciones (World2Action decoder) perteneciente a la familia VAM-Cross MimicVideo, publicado por el usuario `dreamdifferent`. No es un modelo de lenguaje: es un cabezal de predicción de acciones entrenado sobre representaciones de vídeo para control robótico, en concreto para un manipulador Franka Panda simulado en RoboSuite (tarea de nivel 4) con dos cámaras (`corner_cam` y `wrist_cam`).

El checkpoint corresponde a la iteración 1800 de un entrenamiento cuya ejecución finalizó con estado `completed`. Forma parte de una campaña de ablaciones centrada en la cámara de muñeca (*wrist ablation*), y depende de cuatro entradas congeladas: una revisión concreta de MimicVideo (`e3355db…`), un backbone Video2World inicial (`widowx250-wrist-ablation-v1-video-fused@8e39d96…`), un decodificador de acciones inicial (`widowx250-wrist-ablation-v1-action-decoder-iter2374@0ea6db9…`) y una LoRA de vídeo congelada (`panda-robosuite-level4-wrist-ablation-v1-video-lora-iter200@24e15bd…`).

Su relevancia es acotada y de carácter experimental: se trata de un artefacto de investigación reproducible (0 descargas, 0 *likes*, repositorio de 1,0 GB), útil para quien quiera reproducir o auditar una ablación concreta dentro de la línea VAM-Cross. La model card no documenta número de parámetros, licencia, idiomas ni formato de pesos, y los resultados de búsqueda web disponibles no contienen ninguna referencia al modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decodificador de acciones World2Action sobre backbone Video2World, con LoRA de vídeo congelada; infraestructura MimicVideo (no se especifica la arquitectura interna del decoder ni del backbone) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no aplica: la entrada son observaciones de cámara y la salida son acciones) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio ocupa 1,0 GB; no se confirma safetensors ni ningún otro formato) |

## Arquitectura y entrenamiento

El modelo se presenta como un decodificador «World2Action»: transforma representaciones de un modelo de mundo de vídeo (Video2World) en acciones de robot. El entrenamiento se realizó dentro del proyecto MimicVideo, fijado en el commit `e3355dbc93132b576c02f920a59b4fc18a4f5906`, partiendo de un backbone Video2World preentrenado y de un decodificador de acciones previo, ambos congelados como inicialización. Sobre ese backbone se aplica una LoRA de vídeo también congelada durante el entrenamiento del decodificador. El autor indica que, antes de seleccionar el peso publicado, se verificó el conjunto completo más reciente de checkpoints de modelo, optimizador, planificador (*scheduler*) y entrenador.

El contrato de datos está explícitamente documentado: el conjunto `dreamdifferent/vam-cross-level4-panda-robosuite-widowx-texture-corner-wrist` (162 episodios, 54 352 fotogramas) con dos cámaras (`observation.images.corner_cam`, `observation.images.wrist_cam`). El objetivo son 15 acciones de efector final y pinza (*achieved-EE/gripper*) a 5 Hz, expresadas como pose relativa a la pose alcanzada actual (`relative_to_current_achieved_pose`) en el marco `widowx_reference_base/teleop_aligned_tool`, con rotación codificada en `rotation_6d` (representación de rotación en 6 dimensiones). No se documentan número de tokens de entrenamiento, composición del dataset más allá de lo anterior, ni uso de RLHF/DPO (técnicas, por otra parte, propias de modelos de lenguaje y presumiblemente no aplicables aquí).

## Capacidades

- Predicción de acciones de manipulación robótica: genera secuencias de 15 acciones de efector final y pinza a 5 Hz.
- Control a partir de observaciones visuales multimodales: consume simultáneamente una vista de esquina (`corner_cam`) y una vista de muñeca (`wrist_cam`).
- Codificación de pose relativa: trabaja con poses relativas a la pose alcanzada actual, lo que permite encadenar predicciones sin depender de una pose absoluta fija.
- Representación de rotación en 6D (`rotation_6d`), habitualmente más estable que los cuaterniones o los ángulos de Euler en aprendizaje de políticas.
- Diseño de ablación: el checkpoint forma parte de una comparativa sobre el uso de la cámara de muñeca, por lo que está pensado para medir el efecto de esa variable, no para ser un modelo de propósito general.
- No se documenta soporte de *tool calling*, function calling, agentes, razonamiento multi-paso, capacidades multilingües, visión general, audio ni modo *thinking*.

## Casos de uso

- Investigación en aprendizaje por imitación con vídeo: el checkpoint permite reproducir el punto de iteración 1800 de una ablación concreta y comparar curvas de error de acción frente a otras iteraciones o variantes sin cámara de muñeca.
- Evaluación de políticas en RoboSuite: se puede cargar en el entorno Panda de nivel 4 con dos cámaras y medir tasas de éxito de la tarea, dado que el contrato de observaciones y de acciones está fijado en la model card.
- Estudios de ablación de sensores: al estar etiquetado como *wrist ablation*, sirve para cuantificar cuánto aporta la vista de muñeca frente a la vista de esquina en la predicción de los 15 pasos de acción.
- Reentrenamiento o *fine-tuning* sobre nuevos datos teleoperados: el decodificador admite un backbone y una LoRA congelados, de modo que se puede sustituir el conjunto de datos (por ejemplo, con una textura o un operador distinto) manteniendo el resto del pipeline.
- Generación de trayectorias sintéticas para aumento de datos: ejecutando el decodificador en bucle sobre rollouts simulados se pueden producir episodios adicionales de efector final a 5 Hz para preentrenar otras políticas.
- Validación de transferencia sim-a-real en la dirección WidowX → Panda: el checkpoint usa teleoperación grabada con WidowX sobre un entorno Panda de RoboSuite, por lo que es un punto de partida natural para estudiar la brecha entre plataformas.
- Reproducibilidad de experimentos: al estar fijadas las revisiones de todas las entradas congeladas (commits y hashes de revisiones de HuggingFace), permite reconstruir exactamente el estado del pipeline en un momento dado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito de tarea, error de pose, ni comparaciones cuantitativas con otros checkpoints; únicamente indica que el entrenamiento finalizó con estado `completed` y que los checkpoints de modelo, optimizador, planificador y entrenador fueron verificados antes de la subida.

## Requisitos de hardware

- VRAM para inferencia: no disponible en la información proporcionada. Como estimación derivada del tamaño del repositorio (1,0 GB), un peso en fp32 correspondería a un orden de magnitud de ~250 M de parámetros y uno en fp16/bf16 a ~500 M; esto es una inferencia a partir del tamaño, no un dato confirmado por el autor.
- VRAM adicional necesaria: el repositorio solo contiene el decodificador. Hay que cargar por separado el backbone Video2World congelado (`widowx250-wrist-ablation-v1-video-fused`) y la LoRA de vídeo congelada, cuyos pesos no están incluidos y cuyo tamaño no se documenta. El consumo real de memoria es la suma de los tres componentes.
- GPU recomendadas: no disponibles. Por el orden de magnitud estimado, cualquier GPU con al menos 8 GB de VRAM debería ser suficiente para el decodificador aislado, pero la viabilidad conjunta con el backbone de vídeo no se puede afirmar sin datos.
- GPU de consumo: probablemente sí para el decodificador aislado (RTX 3060 12 GB, RTX 4070, RTX 4090), sujeto a la verificación del consumo del backbone. No confirmado.
- Opciones de despliegue: no se documenta ninguna. El modelo no es un LLM, por lo que vLLM, llama.cpp, Ollama y TGI no son aplicables en su forma habitual; lo esperable es inferencia con PyTorch y el código de MimicVideo.
- Latencia y *throughput*: no disponibles. El único requisito temporal deducible del contrato de datos es que las acciones se especifican a 5 Hz (200 ms por paso), de modo que un despliegue en bucle cerrado necesitaría al menos esa cadencia para no acumular retraso.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros checkpoints comparables ni métricas de ninguno de ellos. Dentro de la propia línea del autor existen variantes relacionadas (`widowx250-wrist-ablation-v1-action-decoder-iter2374`, `panda-robosuite-level4-wrist-ablation-v1-video-lora-iter200`), pero son entradas congeladas de este mismo entrenamiento, no alternativas independientes, y no se publican datos comparativos entre ellas.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| panda-robosuite-level4-wrist-ablation-v1-videolora200-action-decoder-iter1800 | no disponible | no disponible | no disponible | no disponible | pública en HuggingFace, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un artefacto de investigación experimental: 0 descargas y 0 *likes* en el momento de la consulta, sin publicación asociada ni validación externa conocida.
- Licencia no especificada: sin licencia explícita no hay autorización clara para uso comercial. Cualquier uso en producción debería aclararse previamente con el autor.
- El checkpoint no es autónomo: requiere cuatro entradas congeladas (MimicVideo en un commit concreto, backbone Video2World, decodificador inicial y LoRA de vídeo) y el conjunto de datos asociado, ninguno de los cuales está incluido en el repositorio. Sin ellos no se puede ejecutar tal cual.
- Restricción de dominio severa: entrenado para una única tarea (Panda, RoboSuite, nivel 4) con una configuración de cámaras fija (`corner_cam` + `wrist_cam`) y una convención de pose concreta. Cambiar cámaras, marco de referencia o frecuencia de control invalida las predicciones.
- Frecuencia de acción fija a 5 Hz: desplegarlo a otra frecuencia requiere remuestrear y puede degradar el comportamiento.
- Dependencia de teleoperación WidowX para la referencia de movimiento: aunque la tarea es sobre Panda, las acciones de referencia provienen de grabaciones de teleoperación WidowX, lo que introduce un posible desajuste cinemático entre plataformas.
- Riesgo de deriva acumulada: al predecir poses relativas a la pose alcanzada actual, los errores se realimentan paso a paso en bucle cerrado; no se documentan métricas de error a horizonte largo.
- Sin datos de sesgo, robustez, iluminación, texturas fuera de distribución ni comportamiento ante fallos del controlador.
- Idiomas: no aplica, pero conviene señalar que no hay interfaz de lenguaje natural; no admite instrucciones en texto.
- Fecha de creación declarada: 2026-09-15, con actualización el mismo día. No hay historial posterior que permita valorar correcciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dreamdifferent/panda-robosuite-level4-wrist-ablation-v1-videolora200-action-decoder-iter1800
- Backbone Video2World inicial: https://huggingface.co/dreamdifferent/widowx250-wrist-ablation-v1-video-fused (revisión `8e39d96344dea0a82ae673874a38206a6c412948`)
- Decodificador de acciones inicial: https://huggingface.co/dreamdifferent/widowx250-wrist-ablation-v1-action-decoder-iter2374 (revisión `0ea6db91672db019d9d6dc9a6c9bd1ecc0504001`)
- LoRA de vídeo congelada: https://huggingface.co/dreamdifferent/panda-robosuite-level4-wrist-ablation-v1-video-lora-iter200 (revisión `24e15bdb2250e55e07a4af11f8f5022615362e6b`)
- Conjunto de datos: https://huggingface.co/datasets/dreamdifferent/vam-cross-level4-panda-robosuite-widowx-texture-corner-wrist (revisión `30163462034e94e79eec5890cf10504feed1966e`)
- Repositorio MimicVideo: commit `e3355dbc93132b576c02f920a59b4fc18a4f5906` (no se proporciona URL del repositorio)
- Paper, blog o demo: no disponible
- Resultados de búsqueda web: no se ha encontrado ningún enlace relevante al modelo; los resultados devueltos corresponden a artículos sobre el envío diferido de correo en Microsoft Outlook y no guardan relación con este checkpoint.
