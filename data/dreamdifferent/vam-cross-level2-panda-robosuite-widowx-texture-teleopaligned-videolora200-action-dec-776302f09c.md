# dreamdifferent/vam-cross-level2-panda-robosuite-widowx-texture-teleopaligned-videolora200-action-dec-776302f09c

## Resumen

Este repositorio contiene un checkpoint intermedio del decoder World2Action del sistema VAM-Cross, un pipeline de robótica basado en aprendizaje por imitación a partir de video. El modelo está diseñado para convertir observaciones de video (dos cámaras) en comandos de acción para un brazo robótico, en concreto para entornos de simulación robosuite con un manipulador Panda y un WidowX. El checkpoint corresponde a la iteración 900 de un entrenamiento más amplio, y se publica como un componente de un sistema mayor que requiere varios módulos congelados adicionales.

El modelo resuelve el problema de la predicción de acciones de bajo nivel a partir de señales visuales, un paso clave en la robótica de manipulación y la teleoperación. Su relevancia radica en que forma parte de una línea de investigación que busca transferir habilidades entre diferentes plataformas robóticas mediante la alineación de representaciones de video. No se dispone de información pública sobre la arquitectura interna, el número de parámetros o la licencia, por lo que esta ficha se basa exclusivamente en los datos proporcionados en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder de acciones (World2Action) sobre un backbone de video; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (procesa secuencias de video, sin especificar ventana temporal) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision-accion, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repo contiene checkpoint, probablemente en formato PyTorch, sin confirmar) |

## Arquitectura y entrenamiento

La model card describe este checkpoint como un decoder que transforma características de video en acciones de robot. Forma parte de un sistema más amplio denominado VAM-Cross, que combina un backbone de video (inicialmente `dreamdifferent/widowx250-video-fused`), una Video LoRA congelada (`vam-cross-level2-panda-robosuite-widowx-texture-video-lora-iter-200`) y un decoder de acciones inicial (`vam-cross-target-widowx250-native-2cam-action-decoder`). El entrenamiento se realizó sobre un dataset específico (`dreamdifferent/vam-cross-level2-panda-robosuite-widowx-texture`) con 280 episodios y 54 426 frames, utilizando dos cámaras (`corner_cam` y `front_cam`). Las acciones objetivo son 15 dimensiones (posición y orientación del efector final y del gripper) a una frecuencia de 5 Hz, con poses relativas al estado actual y rotación representada en formato 6D.

No se especifican detalles sobre el número de tokens de entrenamiento, el uso de RLHF/DPO ni otras innovaciones técnicas. El checkpoint se publica como un artefacto intermedio de un experimento más amplio, y se indica que el entrenamiento se detuvo por una causa desconocida (`unknown`). Los componentes congelados necesarios para la inferencia no se incluyen en este repositorio, por lo que su uso requiere descargar los módulos adicionales referenciados.

## Capacidades

- Predicción de acciones de robot (15 dimensiones: posición, orientación 6D y apertura del gripper) a partir de secuencias de video de dos cámaras.
- Soporte de observaciones multimodales (video de dos vistas) para generar comandos de control de bajo nivel.
- Diseñado para entornos de simulación robosuite con manipuladores Panda y WidowX, con texturas y configuraciones específicas.
- Integración con un pipeline de aprendizaje por imitación que requiere componentes congelados (backbone de video, Video LoRA y decoder inicial).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural.

## Casos de uso

- Aprendizaje por imitación en simulación: el modelo puede utilizarse para entrenar políticas de manipulación robótica a partir de demostraciones grabadas en robosuite, convirtiendo observaciones visuales en comandos de acción directos.
- Transferencia de habilidades entre plataformas: al estar alineado con representaciones de video de diferentes brazos (Panda y WidowX), puede servir como componente en experimentos de transferencia de políticas entre robots.
- Teleoperación asistida: dado que las acciones se expresan relativas a la pose actual del efector, el modelo podría integrarse en sistemas de teleoperación para generar comandos suaves y coherentes con el estado del robot.
- Investigación en modelos de mundo para robótica: el decoder World2Action es un ejemplo de cómo acoplar un modelo de video (Video2World) con un decodificador de acciones, útil para estudiar la relación entre percepción y control.
- Generación de datos sintéticos de entrenamiento: al predecir acciones a partir de video, puede emplearse para etiquetar automáticamente secuencias de video sin anotaciones de acción, aunque requiere el pipeline completo.
- Benchmarking de arquitecturas de control visual: el checkpoint puede servir como referencia para comparar diferentes decodificadores de acción en entornos robosuite, siempre que se disponga de los componentes congelados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de rendimiento (éxito en tareas, precisión de acciones, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPU en la documentación disponible.
- El tamaño del repositorio es de 1.0 GB, lo que sugiere un checkpoint de tamaño moderado, pero no se puede estimar con precisión la memoria necesaria sin conocer la arquitectura completa.
- Para la inferencia se requieren además los componentes congelados (backbone de video, Video LoRA y decoder inicial), cuyos tamaños no se indican.
- No se mencionan opciones de despliegue (vLLM, llama.cpp, etc.), ya que se trata de un modelo de robótica, no de un LLM.
- Se desconoce la latencia y el throughput; dependerán del hardware y de la implementación del pipeline completo.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada, y el modelo es un componente específico de un sistema de robótica sin métricas públicas que permitan una comparación objetiva.

## Limitaciones y advertencias

- Checkpoint intermedio: no es el modelo final del entrenamiento; se detuvo en la iteración 900 por una causa desconocida, por lo que su rendimiento puede ser subóptimo.
- Dependencia de componentes externos: requiere el backbone de video, la Video LoRA y el decoder inicial congelados, que no se incluyen en este repositorio. Sin ellos, el modelo no es funcional.
- Dataset restringido: entrenado únicamente con datos de robosuite (Panda y WidowX) con texturas específicas; no se garantiza generalización a otros entornos o robots.
- Sin licencia especificada: el uso comercial y la redistribución no están claramente definidos, lo que puede limitar su adopción en producción.
- Sin información sobre sesgos o alucinaciones: al ser un modelo de control, no aplican los riesgos típicos de los LLM, pero la falta de evaluación pública impide conocer su robustez ante variaciones de iluminación, oclusiones o cambios de cámara.
- Reproducibilidad limitada: la model card menciona un `config.yaml` y un JSON con los componentes fijados, pero no se proporcionan instrucciones detalladas de uso ni ejemplos de inferencia.

## Enlaces

- Repositorio del modelo: https://huggingface.co/dreamdifferent/vam-cross-level2-panda-robosuite-widowx-texture-teleopaligned-videolora200-action-dec-776302f09c
- Backbone de video inicial (referenciado): `dreamdifferent/widowx250-video-fused@f0cea76b62c5dd66b06b9f965932ddea32a7b546`
- Decoder de acciones inicial (referenciado): `dreamdifferent/vam-cross-target-widowx250-native-2cam-action-decoder@93750cccda01620e3c028477e4c49bc5c996a68d`
- Video LoRA congelada (referenciada): `dreamdifferent/vam-cross-level2-panda-robosuite-widowx-texture-video-lora-iter-200@ca9f9d33ae309808f3fdcb92329ed817db5ad2ac`
- Dataset (referenciado): `dreamdifferent/vam-cross-level2-panda-robosuite-widowx-texture@a9db2588e06f31d7f27f017369cb95b5d535ed9d`
- Framework robosuite: https://github.com/ARISE-Initiative/robosuite y https://robosuite.ai/
