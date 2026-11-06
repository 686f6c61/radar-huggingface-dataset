# GeertWang/starvla-pipette-aim-wrist1031-pi05-ft

## Resumen

starvla-pipette-aim-wrist1031-pi05-ft es un modelo de vision-lenguaje-accion (VLA) especializado en robótica manipulativa, desarrollado por el usuario GeertWang sobre la base starVLA PI0.5. Resuelve una tarea muy concreta: el paso 3 de una tarea de pipeteo con un robot humanoide Unitree G1 equipado con manos Inspire, consistente en apuntar la pipeta sujeta en la mano derecha hacia el tubo que sostiene la mano izquierda. No es un modelo de propósito general, sino un checkpoint de behavior cloning afinado para una habilidad motora específica dentro de un pipeline de laboratorio automatizado.

El modelo se entrena mediante clonación de comportamiento con datos de intervención humana (HG-DAgger): 230 episodios de entrenamiento y 38 de validación, con 114.830 anclas de entrenamiento, grabados con recorte de muñeca y sin teleoperación. La arquitectura subyacente es la de starVLA PI0.5, un transformer VLA que combina un VLM base con un cabezal de predicción de acciones mediante flow matching, y que en este caso incorpora vistas ego, FOCUS y wrist_left, además de la velocidad de muñeca medida como estado.

Es relevante ahora porque ilustra el patrón actual de adaptación de modelos VLA fundacionales a tareas industriales y de laboratorio muy estrechas mediante fine-tuning supervisado y datos de corrección humana, con recetas reproducibles (batch 48, learning rate 6,12e-6 con decaimiento coseno, 10 épocas). Conviene subrayar que solo se han publicado métricas offline y que el modelo no se ha ejecutado todavía sobre un robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | starVLA PI0.5 (VLA basado en VLM + cabezal de acciones con flow matching) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en PyTorch, `steps_16744_pytorch_model.pt`) |
| Idiomas soportados | no disponible (modelo orientado a robótica, no a texto multilingüe) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`); repositorio de 8,3 GB |
| Libreria | starvla |
| Pipeline | robotics |
| Vistas de entrada | ego + FOCUS + wrist_left |
| Estado adicional | velocidad de muñeca medida |
| Tarea | pipeteo, paso 3: apuntar pipeta (mano derecha) al tubo (mano izquierda) |
| Hardware objetivo | Unitree G1 con manos Inspire |

## Arquitectura y entrenamiento

El modelo parte de un checkpoint starVLA PI0.5 (concretamente, «aim R4 FT1027 steps_8550») y se afina mediante clonación de comportamiento. La arquitectura combina un VLM base (`base_vlm` en `config.yaml`) con un cabezal de predicción de acciones entrenado con flow matching: la pérdida es un error cuadrático medio sobre la velocidad del campo de flujo (flow-matching velocity MSE), con pesos por fotograma de 1 para frames autónomos, 2 para frames humanos y 0 para frames enmascarados. No se emplea RL y todos los parámetros son entrenables.

Los datos provienen de 230 episodios de entrenamiento y 38 de validación recogidos con HG-DAgger (intervención humana sobre política autónoma), sin teleoperación, cada episodio cortado antes de su fase de extracción (pull-out), de modo que el modelo no aprende esa parte. En total, 114.830 anclas de entrenamiento. La receta usa batch 48, learning rate 6,12e-6 con decaimiento coseno hasta 1e-6 y 10 épocas. El checkpoint seleccionado es `pi05/checkpoints/steps_16744_pytorch_model.pt`, elegido sobre el mismo holdout con el que se evalúa, lo que introduce un sesgo optimista en las métricas reportadas.

## Capacidades

- Predicción de acciones motoras de precisión para el paso de apuntado de una pipeta hacia un tubo en un entorno de laboratorio.
- Fusión de múltiples vistas (ego, FOCUS y muñeca izquierda) para estimar la geometría relativa entre pipeta y tubo.
- Uso de velocidad de muñeca medida como variable de estado adicional a las imágenes.
- Aprendizaje por clonación de comportamiento con datos de intervención humana (HG-DAgger), incluyendo correcciones puntuales sobre la política autónoma.
- Ejecución de una subtarea acotada dentro de una secuencia de pipeteo; no cubre la extracción (pull-out) ni pasos posteriores.
- No dispone de capacidades documentadas de tool calling, agentes, razonamiento multi-paso, visión general, audio ni generación de texto libre.

## Casos de uso

- Automatización de laboratorio en pipeteo: el modelo se usaría como política de control del paso de alineación entre la pipeta y el tubo, integrándose en una secuencia mayor de dispensación gestionada por un planificador externo.
- Investigación en VLA y clonación de comportamiento: sirve como referencia reproducible de fine-tuning de starVLA PI0.5 con datos HG-DAgger, receta de entrenamiento y pesos publicados.
- Estudio de intervención humana en robótica: permite analizar cómo el reponderado de frames humanos (peso 2 frente a 1) afecta a la precisión en tareas de contacto fino.
- Benchmark de políticas para manipuladores bimanuales: útil para comparar estrategias de fusión de vistas (ego, FOCUS, muñeca) en tareas de precisión submilimétrica.
- Prototipado de asistentes de laboratorio con Unitree G1: base para construir habilidades encadenadas donde este checkpoint actúe como módulo de apuntado.
- Evaluación offline de políticas antes de despliegue: sus métricas de error de velocidad sobre muestras retenidas permiten filtrar checkpoints candidatos sin coste de hardware.
- Docencia y divulgación: ejemplo concreto de pipeline completo (datos, pérdida, selección de checkpoint) para explicar VLA en robótica aplicada.

## Benchmarks y rendimiento

Métricas offline reportadas por el autor sobre 480 muestras retenidas (38 episodios). Son errores de velocidad de flujo (menor es mejor):

| Conjunto | Este checkpoint | Referencia «hold still» |
|---|---|---|
| Todos los 38 episodios | 0,0174 | 0,0149 |
| Frames humanos | 0,0318 | no disponible |
| Frames autónomos | 0,0075 | no disponible |
| 12 episodios más tempranos | 0,0387 | 0,0278 |
| 12 episodios más tardíos | 0,0080 | 0,0089 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes de robótica como LIBERO o CALVIN) en la información disponible. El autor advierte que el checkpoint se eligió sobre el mismo holdout con el que se evalúa, por lo que las cifras son ligeramente optimistas, y que el modelo no se ha ejecutado sobre un robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 8,3 GB, lo que da una cota inferior del orden del tamaño del checkpoint, pero no se especifica el consumo en ejecución.
- GPU recomendadas: no disponible. Al tratarse de un VLA con un VLM base y múltiples vistas de cámara, se requiere una GPU con memoria suficiente para el VLM y el procesamiento de imágenes en tiempo real; no se documentan modelos concretos.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: la librería `starvla` es el entorno previsto. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para un modelo de acciones.
- Latencia y throughput: no disponible. El autor indica que el modelo no se ha ejecutado en robot, por lo que no hay cifras de frecuencia de control.
- Nota de configuración: `config.yaml` contiene rutas del nodo de entrenamiento (`base_vlm` y tokenizador); es necesario apuntarlas a copias locales antes de ejecutar.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| starvla-pipette-aim-wrist1031-pi05-ft | VLA (fine-tune) | no disponible | no disponible | Apuntado de pipeta en Unitree G1 | no disponible | Hugging Face (0 descargas) |
| starVLA PI0.5 base (checkpoint de partida «aim R4 FT1027 steps_8550») | VLA | no disponible | no disponible | Política general de apuntado | no disponible | Referenciado en la model card, sin enlace |
| Políticas de clonación de comportamiento genéricas (ACT, Diffusion Policy) | BC | no disponible | no disponible | Manipulación diversa | variable | Disponibles públicamente, pero no comparables directamente por tarea |

No se dispone de datos de benchmarks comunes que permitan una comparación cuantitativa con alternativas. La comparación con modelos de texto de la misma escala no es pertinente.

## Limitaciones y advertencias

- Solo se han publicado métricas offline; el modelo no se ha validado en un robot real, por lo que su comportamiento físico es desconocido.
- El checkpoint se seleccionó sobre el mismo holdout usado para reportar resultados: las cifras son ligeramente optimistas y no constituyen una estimación insesgada.
- En el conjunto completo de episodios, el error del modelo (0,0174) es superior al de la referencia trivial «hold still» (0,0149), y también en los 12 episodios más tempranos (0,0387 frente a 0,0278). Solo supera a la referencia en los 12 episodios más tardíos.
- El modelo no aprende la fase de extracción (pull-out): los episodios se cortaron antes de esa fase.
- Entrenado exclusivamente para una tarea y un hardware concretos (Unitree G1 con manos Inspire); no es transferible sin nuevo fine-tuning.
- No hay información sobre sesgos, idiomas ni licencia; la ausencia de licencia explícita impide asumir permisos de uso comercial.
- Riesgo de sobreajuste a las condiciones de recogida de datos (iluminación, disposición de tubos, velocidad de muñeca), no documentado.
- `config.yaml` apunta a rutas del nodo de entrenamiento; es necesario reconfigurarlo para reproducir la inferencia.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GeertWang/starvla-pipette-aim-wrist1031-pi05-ft
- No se han encontrado en la información disponible enlaces adicionales a papers, blogs, repositorios de código o demos.
