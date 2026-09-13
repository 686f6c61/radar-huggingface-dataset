# dreamdifferent/vam-cross-level5-panda-robosuite-widowx-texture-teleopaligned-videolora400-action-dec-68554cef79

## Resumen

El modelo es un decodificador World2Action del framework MimicVideo, publicado por el usuario dreamdifferent en Hugging Face. No es un modelo de lenguaje: es un cabezal de predicción de acciones para robótica que traduce representaciones latentes de vídeo en comandos de control de un brazo WidowX dentro del simulador RoboSuite. El repositorio contiene únicamente el checkpoint del decodificador correspondiente a la iteración 900 de un entrenamiento que se detuvo por causa desconocida.

El checkpoint se apoya en cuatro dependencias congeladas y ancladas por commit: el backbone inicial Video2World (`widowx250-video-fused`), un decodificador de acciones inicial, una LoRA de vídeo entrenada durante 400 iteraciones y una revisión concreta del repositorio MimicVideo. La contribución del checkpoint es, por tanto, el ajuste fino del decodificador sobre un contrato de datos muy específico: 15 acciones a 5 Hz, dos cámaras, pose relativa a la pose alcanzada actual y rotación en representación 6D.

Su relevancia es acotada pero clara para investigación: documenta un pipeline de imitación vídeo→acción con anclaje de dependencias por hash y un dataset de teleoperación alineada de 166 episodios y 54.264 fotogramas. El repositorio pesa 1,0 GB, no tiene descargas ni likes, y no declara licencia ni idiomas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador de acciones (World2Action) sobre backbone Video2World con LoRA de vídeo congelada, dentro del framework MimicVideo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible; el contrato de acción define un objetivo de 15 acciones a 5 Hz (horizonte implícito de 3 segundos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica; la salida son acciones, no texto) |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La arquitectura combina dos componentes: un backbone de modelo de mundo de vídeo (Video2World, identificado como `widowx250-video-fused`) que se mantiene congelado, y un decodificador de acciones entrenable (World2Action) que transforma la representación de vídeo en comandos motores. Sobre el backbone se aplica una LoRA de vídeo también congelada, entrenada durante 400 iteraciones. El decodificador se entrenó hasta la iteración 900 dentro de la ejecución `w2a_panda_robosuite_level5_widowx_texture_2cam_hstack_action_iter2374_videolora_iter400_widowx_teleop_recording_frame_v1`, que se detuvo por causa desconocida. La model card indica que se verificó el conjunto completo más reciente de pesos, optimizador, scheduler y trainer antes de seleccionar el peso publicado, y que se anclan por commit tanto el framework (MimicVideo, `e3355dbc...`) como las tres dependencias congeladas.

El contrato de datos es explícito: dos cámaras (`observation.images.corner_cam` y `observation.images.front_cam`), objetivo de 15 acciones logradas de efector final y pinza muestreadas a 5 Hz, pose objetivo expresada como `relative_to_current_achieved_pose` en el marco `widowx_reference_base/teleop_aligned_tool`, y rotación codificada como `rotation_6d`. El dataset de entrenamiento es `vam-cross-level5-panda-robosuite-widowx-texture` en su revisión `0d9dcf50...`, con 166 episodios y 54.264 fotogramas. No se documenta número de tokens, composición del dataset, ni uso de RLHF o DPO (técnicas no aplicables a este tipo de modelo).

## Capacidades

- Predicción de acciones de manipulación robótica para un brazo WidowX en RoboSuite, con horizonte de 15 acciones a 5 Hz.
- Consumo de entrada multimodal de dos cámaras simultáneas (vista de esquina y vista frontal) apiladas en la configuración `2cam_hstack`.
- Generación de comandos de efector final y pinza en espacio de pose relativa a la pose alcanzada actual.
- Representación de orientación mediante rotación 6D (`rotation_6d`), lo que evita discontinuidades de las representaciones angulares clásicas.
- Compatibilidad con datos de teleoperación alineada (`teleop_aligned_tool`), lo que facilita el entrenamiento por imitación a partir de demostraciones humanas.
- Aprendizaje por imitación a partir de vídeo: el modelo aprende la política desde la representación de vídeo del mundo, no solo desde estados privilegiados.
- Soporte de ajuste fino posterior sobre el decodificador, manteniendo congelados el backbone Video2World y la LoRA de vídeo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no es un modelo de lenguaje).
- Capacidades especiales: no se documentan modos de pensamiento, visión general, audio ni otras modalidades fuera de las dos cámaras indicadas.

## Casos de uso

- Manipulación robótica pick-and-place en simulación: el decodificador genera las 15 acciones a 5 Hz a partir de las dos vistas de cámara, de modo que puede cerrar el bucle de control en RoboSuite sin necesidad de un planificador simbólico adicional.
- Investigación en aprendizaje por imitación desde teleoperación: al estar alineado con `teleop_aligned_tool`, permite entrenar y evaluar políticas que replican demostraciones humanas capturadas con el mismo marco de referencia.
- Evaluación de modelos de mundo vídeo→acción: sirve como cabezal de comparación para medir cuánta información de control es recuperable de la representación latente del backbone Video2World congelado.
- Reentrenamiento y ajuste fino con nuevos datos de teleoperación: la separación entre backbone congelado, LoRA de vídeo congelada y decodificador entrenable permite reentrenar solo la cabeza con coste computacional reducido.
- Reproducción de experimentos en RoboSuite: con los commits anclados (MimicVideo `e3355dbc...`, backbone `f0cea76b...`, decodificador inicial `93750ccc...`, LoRA `3d722974...`) se puede reconstruir el linaje exacto del checkpoint para auditoría o replicación.
- Estudio de generalización con aleatorización de texturas: la denominación `level5` y `texture` sugiere escenarios de dificultad y variación visual, útiles para medir robustez ante cambios de apariencia.
- Generación de datos sintéticos de trayectorias: las predicciones del decodificador pueden usarse para poblar episodios adicionales en simulación y ampliar el dataset de 166 episodios.
- Docencia y demostraciones de robótica sin hardware: al ejecutarse en simulación con dos cámaras, permite montar prácticas de control visual sin disponer de un brazo físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, errores de pose, ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio publicado ocupa 1,0 GB y contiene únicamente el decodificador World2Action; la inferencia completa requiere además el backbone Video2World `widowx250-video-fused` y la LoRA de vídeo congelada, cuyos pesos no se incluyen en este repositorio y por tanto no permiten estimar el consumo total a partir de este dato.
- GPU recomendadas: no disponible en la información proporcionada.
- Encaje en GPU de consumo: no disponible. El decodificador por sí solo (1,0 GB) es de tamaño reducido, pero el consumo dominante corresponde al backbone de vídeo, cuyo tamaño no se especifica.
- Opciones de despliegue: no disponible. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni con ningún servidor de inferencia estándar; el modelo se ejecuta dentro del framework MimicVideo con dependencias ancladas por commit.
- Latencia y throughput estimados: no disponible. El único dato temporal es la frecuencia de control del objetivo de acciones, 5 Hz, que condiciona el presupuesto de cómputo en el bucle de control (200 ms por bloque de predicción) pero no equivale a una latencia medida.

## Comparativa con modelos similares

No se dispone de modelos comparables de terceros en la información proporcionada. La única comparación posible es con las dependencias del propio linaje del autor, que no son alternativas equivalentes sino componentes del mismo pipeline:

| Modelo | Rol en el pipeline | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (action decoder, iter 900) | Decodificador World2Action ajustado | no disponible | no disponible | no disponible | Público en Hugging Face |
| `dreamdifferent/widowx250-video-fused` | Backbone Video2World inicial, congelado | no disponible | no disponible | no disponible | Público en Hugging Face |
| `dreamdifferent/vam-cross-target-widowx250-native-2cam-action-decoder` | Decodificador de acciones inicial, congelado | no disponible | no disponible | no disponible | Público en Hugging Face |
| `dreamdifferent/vam-cross-level5-panda-robosuite-widowx-texture-video-lora-iter-400` | LoRA de vídeo congelada, 400 iteraciones | no disponible | no disponible | no disponible | Público en Hugging Face |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial ni para redistribución; conviene contactar con el autor antes de cualquier uso en producción.
- Entrenamiento interrumpido: la ejecución se detuvo por causa desconocida (`unknown`) y el checkpoint publicado corresponde a la iteración 900, no necesariamente al óptimo de la ejecución.
- Repositorio sin tracción: 0 descargas y 0 likes, sin validación externa conocida ni informes de terceros sobre su comportamiento.
- Dataset pequeño y muy específico: 166 episodios y 54.264 fotogramas, restringidos a un único brazo (WidowX), un único simulador (RoboSuite) y dos cámaras concretas.
- Sesgo de teleoperación: al entrenarse con datos `teleop_aligned_tool`, la política puede heredar las particularidades de la interfaz de teleoperación y de la referencia `widowx_reference_base`, lo que reduce la transferencia a otras configuraciones de montaje.
- Frecuencia de control fija de 5 Hz: cualquier despliegue que requiera control a mayor frecuencia necesita interpolación o un cambio de política.
- Ausencia de benchmarks: no hay métricas publicadas de tasa de éxito, error de pose ni robustez, por lo que el rendimiento real es desconocido.
- Riesgo de sobreajuste al escenario: la designación `level5` y la aleatorización de texturas no garantizan generalización a objetos, iluminación o dinámicas distintas de las del dataset.
- Dependencias no incluidas: el dataset y las entradas congeladas no se distribuyen en el repositorio, de modo que la reproducción exige descargar y anclar por separado cada componente con el hash indicado.
- Sin soporte de idiomas ni de texto: no debe evaluarse como modelo de lenguaje ni usarse en tareas de generación textual.
- Advertencia sobre la búsqueda web: los resultados recuperados no guardan relación con el modelo (páginas de la administración tributaria francesa) y no aportan información técnica utilizable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dreamdifferent/vam-cross-level5-panda-robosuite-widowx-texture-teleopaligned-videolora400-action-dec-68554cef79
- Backbone Video2World inicial: https://huggingface.co/dreamdifferent/widowx250-video-fused
- Decodificador de acciones inicial: https://huggingface.co/dreamdifferent/vam-cross-target-widowx250-native-2cam-action-decoder
- LoRA de vídeo congelada (iter 400): https://huggingface.co/dreamdifferent/vam-cross-level5-panda-robosuite-widowx-texture-video-lora-iter-400
- Dataset de entrenamiento: https://huggingface.co/datasets/dreamdifferent/vam-cross-level5-panda-robosuite-widowx-texture
- Framework MimicVideo (commit anclado): `e3355dbc93132b576c02f920a59b4fc18a4f5906`
- Papers, blogs, repositorios o demos adicionales: no disponible (la búsqueda web no devolvió resultados relevantes).
