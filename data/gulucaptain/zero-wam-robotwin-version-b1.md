# gulucaptain/zero-wam-robotwin-version-b1

## Resumen

Zero-WAM RoboTwin Version B1 es un adaptador (adapter) de tipo A+B1 inicializado a partir del modelo base Zero-WAM pretrain, desarrollado por el usuario gulucaptain dentro del ecosistema de investigación robótica de Robbyant Research. El modelo se publica con la pipeline `robotics` y está orientado a tareas de manipulación robótica en el entorno de simulación RoboTwin 2.0. Su relevancia radica en que forma parte de la línea Zero-WAM, que propone un objetivo de predicción de chunks futuros en contexto (*in-context future chunk prediction*) para reducir el aprendizaje de atajos (*shortcut learning*) y reforzar el uso de prompts de vídeo humano.

El adaptador incorpora supervisión futura con DINOv2 sobre la vista "high" y utiliza tres vistas de entrada (high, muñeca izquierda y muñeca derecha) para la consulta del robot, mientras que la condición ICL se construye a partir de una demo de HumanGen. No se dispone de información sobre arquitectura detallada, número de parámetros, longitud de contexto ni licencia en la documentación proporcionada.

La ficha se basa exclusivamente en la model card del autor y en los resultados de búsqueda disponibles; los datos no publicados se indican explícitamente como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador A+B1 sobre Zero-WAM pretrain; el modelo base es un modelo de world-action modeling para robótica) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (la model card indica que cada directorio de época contiene pesos del adaptador y metadatos de entrenamiento) |

## Arquitectura y entrenamiento

El modelo es un adaptador denominado "A+B1" inicializado a partir del checkpoint Zero-WAM pretrain (`robbyant-research/zero-wam-pretrain`). Según la model card, la condición ICL (*in-context learning*) se construye a partir de una demo de HumanGen, y la consulta del robot emplea tres vistas: vista alta (*high*), muñeca izquierda y muñeca derecha. Sobre la vista alta se aplica supervisión futura mediante DINOv2.

El modelo base Zero-WAM, según el repositorio GitHub de Robbyant Research, propone un objetivo de predicción de chunks futuros en contexto para reducir el *shortcut learning* y reforzar el uso de prompts de vídeo humano, demostrando generalización zero-shot entre tareas en RoboTwin 2.0 y en configuraciones de tareas reales no vistas, sin recopilar datos de robot correspondientes ni actualizar parámetros del modelo. No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset, ni si se emplearon RLHF/DPO en el adaptador.

## Capacidades

- Modelado world-action para robótica: el adaptador está diseñado para predecir acciones y futuros en entornos de manipulación simulados (RoboTwin 2.0).
- Predicción de chunks futuros en contexto (*in-context future chunk prediction*), objetivo central de la familia Zero-WAM.
- Uso de prompts de vídeo humano como condición ICL (demo de HumanGen).
- Entrada multi-vista: vista alta, muñeca izquierda y muñeca derecha.
- Supervisión con DINOv2 sobre la vista alta para representaciones visuales futuras.
- Generalización zero-shot entre tareas según la documentación del modelo base (no verificable en el adaptador concreto).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes multi-step: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): visión multi-cámara en el contexto robótico; el resto no disponible.

## Casos de uso

- Manipulación robótica en simulación RoboTwin 2.0: el adaptador se usaría como capa específica de tarea sobre Zero-WAM pretrain para ejecutar políticas de manipulación en el simulador, aprovechando las tres vistas de entrada.
- Evaluación de generalización zero-shot: emplear el adaptador para probar configuraciones de tareas no vistas en RoboTwin 2.0, siguiendo la metodología del modelo base.
- Aprendizaje por imitación con demos humanas: usar la condición ICL basada en demos de HumanGen para condicionar la política del robot sin recopilar datos de robot específicos.
- Investigación en world-action modeling: servir como punto de partida para estudiar el efecto del objetivo de predicción de chunks futuros y la supervisión DINOv2 en la vista alta.
- Prototipado de políticas multi-cámara: integrar las vistas high, muñeca izquierda y muñeca derecha en pipelines de percepción robótica para tareas de agarre y manipulación.
- Reproducción de experimentos: cada directorio de época contiene pesos del adaptador y metadatos de entrenamiento, lo que permite reproducir y comparar checkpoints intermedios.
- Transferencia a configuraciones reales: aunque no hay evidencia específica para este adaptador, la línea Zero-WAM reporta generalización a configuraciones reales no vistas, lo que permitiría explorar despliegues en entornos físicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se conocen parámetros ni cuantizaciones).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se documenta soporte para vLLM, llama.cpp, Ollama o TGI; el modelo es un adaptador de robótica, no un LLM de texto).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zero-WAM RoboTwin Version B1 (este) | no disponible | no disponible | no disponible | no disponible | Hugging Face (0 descargas, 0 likes) |
| Zero-WAM pretrain (`robbyant-research/zero-wam-pretrain`) | no disponible | no disponible | generalización zero-shot en RoboTwin 2.0 según documentación | no disponible | Hugging Face (modelo base) |
| Alternativas de world-action modeling para robótica | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Requiere el modelo base Zero-WAM pretrain: el adaptador no es autónomo y necesita cargar el checkpoint base para funcionar.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas no disponibles: no aplica directamente a un modelo de robótica, pero no se documenta ningún soporte lingüístico.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no disponible (el modelo no es generativo de texto; el riesgo se traslada a errores de política en entornos físicos).
- Limitaciones de contexto: no disponible.
- Especificidad de dominio: el adaptador está entrenado para RoboTwin 2.0 y demos de HumanGen; su comportamiento fuera de ese dominio no está documentado.
- Madurez: 0 descargas y 0 likes en Hugging Face, creado y actualizado el mismo día (2026-11-07), lo que sugiere un artefacto de investigación sin validación comunitaria.
- Caveat de producción: no hay información sobre robustez, latencia ni seguridad para despliegue en robots reales.

## Enlaces

- Hugging Face: https://huggingface.co/gulucaptain/zero-wam-robotwin-version-b1
- Modelo base: https://huggingface.co/robbyant-research/zero-wam-pretrain
- Repositorio GitHub Zero-WAM: https://github.com/robbyant-research/Zero-WAM
- Colección Zero-WAM en Hugging Face: https://huggingface.co/collections/Robbyant-Research/zero-wam
