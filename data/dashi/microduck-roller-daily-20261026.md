# dashi/microduck-roller-daily-20261026

## Resumen

`dashi/microduck-roller-daily-20261026` es una política de control por refuerzo (reinforcement learning) para el robot microduck de Pollen Robotics, publicada como un artefacto ONNX consumible por el daemon del robot. No es un modelo de lenguaje: recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, y está pensada para ocupar el slot de marcha `walk` del robot cuando este se desplaza sobre ruedas (rollers). La model card la describe como una política «perpetua», es decir, que se ejecuta de forma continua hasta que se le indique lo contrario.

El modelo es un fine-tune declarado del checkpoint `DenRakEiw/microduck-senate_duck_0904`, presentado por el autor como una «re-entrada diaria» de su propio remix `dashi/microduck-roller-remix-r900`, al que asigna un valor de 0.900 sin especificar la métrica. El repositorio es de tamaño despreciable (0.0 GB redondeado) y no acumula descargas ni interacciones, lo que es coherente con una publicación de tipo experimental o de iteración interna dentro de una serie diaria.

Su relevancia es acotada y muy específica: sirve como ejemplo de pipeline completo de RL sim-a-real para robótica de bajo coste, empaquetado en un formato (ONNX + `manifest.json` schema 2) que el robot puede cargar en caliente con un solo comando. Para desarrolladores e investigadores es interesante por el formato de despliegue y por la disciplina de versionado, no por sus capacidades cognitivas, que no existen en este artefacto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control entrenada por refuerzo y exportada a ONNX; topología interna de la red no especificada en la información disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; sin ventana de contexto. Entrada de 61 dimensiones por paso, salida de 14 acciones a 50 Hz |
| Tipos de cuantización | no disponible (se distribuye un único `policy.onnx`) |
| Idiomas soportados | no aplica; el modelo no procesa ni genera lenguaje |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) acompañado de `manifest.json` conforme al schema 2 del manifiesto de políticas microduck |

Datos adicionales de la ficha: pipeline `robotics`, librería `microduck`, etiqueta de slot `microduck-slot:walk`, modelo base `DenRakEiw/microduck-senate_duck_0904` con relación `finetune`, región `us`, 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 2026-10-26.

## Arquitectura y entrenamiento

La información publicada no describe la topología de la red (número de capas, anchura, tipo de activación ni si emplea memoria recurrente). Lo que sí se especifica es la interfaz: observación de 61 dimensiones, 14 dimensiones de acción, frecuencia de control de 50 Hz y ejecución sobre ruedas. El normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo sin preprocesar; este es un detalle relevante para evitar errores de integración en el daemon.

El entrenamiento se realizó en el repositorio `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a`. No se publican número de tokens, composición del dataset, presupuesto de entrenamiento, número de entornos paralelos ni si hubo etapas de ajuste fino con recompensas adicionales. La model card tampoco detalla el pipeline de sim-a-real, el dominio de aleatorización ni las recompensas utilizadas, por lo que la reproducibilidad es limitada con la información disponible.

## Capacidades

- Generación de marcha continua para el slot `walk` del microduck sobre ruedas, ejecutándose de forma indefinida hasta recibir una orden de parada.
- Control reactivo a 50 Hz a partir de un vector de observación de 61 dimensiones, con salida de 14 acciones por paso.
- Normalización de observaciones integrada en el propio grafo ONNX: acepta observaciones crudas del robot.
- Carga en caliente en el robot mediante el comando `robotctl policy load walk <repo>`, sin recompilación ni conversión adicional.
- Compatibilidad con el manifiesto de políticas schema 2 del daemon de microduck, lo que facilita el versionado y el intercambio de políticas.
- Capacidad de sustituir o comparar con la política base `DenRakEiw/microduck-senate_duck_0904` al ocupar el mismo slot.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio ni procesamiento de lenguaje: es exclusivamente un controlador motor.

## Casos de uso

- **Control de locomoción en el robot físico**: cargar la política en el slot `walk` con `robotctl policy load walk dashi/microduck-roller-daily-20261026` para que el microduck se desplace de forma continua sobre ruedas. Es adecuada porque el artefacto ya incluye el normalizador y respeta la interfaz exacta del daemon.
- **Evaluación A/B de políticas de marcha**: al declarar un modelo base concreto (`microduck-senate_duck_0904`) y un remix previo (`roller-remix-r900`), permite comparar en el mismo robot y bajo las mismas condiciones de hardware si la iteración diaria mejora o degrada el comportamiento del remix anterior.
- **Despliegue embebido de bajo coste**: al distribuirse como ONNX de tamaño reducido, la inferencia puede ejecutarse en la CPU del ordenador de a bordo del robot, sin GPU ni runtime de aprendizaje profundo pesado. El coste computacional por paso está acotado por la frecuencia de 50 Hz.
- **Investigación en RL sim-a-real para robótica de bajo coste**: sirve como referencia reproducible de un pipeline que va del repositorio de entrenamiento (`pollen-robotics/microduck_rl`) a un artefacto desplegable en hardware real, útil para estudiar prácticas de empaquetado y versionado de políticas.
- **Pruebas de robustez y regresión en CI de robótica**: una política perpetua con interfaz fija es un buen sujeto de test para pipelines que verifican que el daemon carga manifiestos schema 2 correctamente, que el normalizador embebido produce salidas dentro de rango y que no hay desviaciones de frecuencia.
- **Prototipado docente**: en cursos de robótica o de aprendizaje por refuerzo, permite mostrar el ciclo completo observación-acción en un robot real sin necesidad de entrenar desde cero, usando una política ya publicada y sustituible.
- **Base para nuevos fine-tunes**: al estar etiquetada como `finetune` de un modelo base identificado, puede emplearse como punto de partida documentado para experimentos de ajuste sobre la misma tarea de marcha con ruedas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card menciona el valor 0.900 asociado al remix previo `dashi/microduck-roller-remix-r900`, pero no especifica qué métrica representa (recompensa media, tasa de éxito, distancia recorrida u otra), ni el protocolo de evaluación, ni el número de episodios. No es, por tanto, un resultado comparable con MMLU, HumanEval, GSM8K ni con ningún benchmark estándar de modelos de lenguaje, que no aplican a este artefacto.

## Requisitos de hardware

- **VRAM estimada**: no disponible. El repositorio se redondea a 0.0 GB, lo que es consistente con un artefacto ONNX de pocos megabytes, pero el tamaño exacto no se publica.
- **GPU recomendadas**: no disponibles ni previsiblemente necesarias; el modelo está pensado para ejecutarse junto al daemon del robot.
- **Viabilidad en GPU de consumo**: no se especifica. Por el formato y el tamaño aparente, la inferencia debería ser viable en CPU, pero esto es una inferencia a partir de los datos disponibles, no un dato publicado.
- **Opciones de despliegue**: el único método documentado es `robotctl policy load walk dashi/microduck-roller-daily-20261026`, que carga `policy.onnx` a través del daemon de microduck. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un controlador motor.
- **Latencia y throughput**: no disponibles. El único dato temporal es la frecuencia de control objetivo de 50 Hz (20 ms por paso), que actúa como requisito de tiempo real más que como rendimiento medido.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / interfaz | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `dashi/microduck-roller-daily-20261026` | Política RL en ONNX, slot `walk`, con ruedas | no disponible | 61-D observación, 14 acciones, 50 Hz | no disponible (0.900 del remix previo, métrica sin especificar) | no disponible | Repo HuggingFace, 0 descargas |
| `DenRakEiw/microduck-senate_duck_0904` | Política RL, modelo base del anterior | no disponible | Interfaz microduck; detalles no disponibles en esta información | no disponible | no disponible | Repo HuggingFace |
| `dashi/microduck-roller-remix-r900` | Política RL, remix previo del mismo autor | no disponible | Interfaz microduck; detalles no disponibles en esta información | 0.900 según la model card, métrica sin especificar | no disponible | Repo HuggingFace |

No se dispone de información sobre otras familias de políticas de locomoción comparables (por ejemplo, controladores para otros robots cuadrúpedos o bípedos) dentro de los datos proporcionados, por lo que la comparación se limita a los tres artefactos de la misma serie microduck.

## Limitaciones y advertencias

- **Licencia no especificada**: la ficha de HuggingFace no declara licencia y la model card tampoco la incluye. Sin licencia explícita no se puede asumir permiso para uso comercial, redistribución ni obras derivadas; hay que contactar con el autor antes de cualquier uso en producción.
- **Idioma y modalidad**: no procesa lenguaje, imagen ni audio. Cualquier expectativa de uso como modelo generativo es un error de categoría.
- **Alcance físico restringido**: la política está entrenada para desplazamiento sobre ruedas (rollers) en el robot microduck. Usarla en otra morfología, sobre terreno irregular o con una carga distinta a la del entorno de entrenamiento puede producir comportamientos inseguros.
- **Comportamiento «perpetuo»**: la model card indica que se ejecuta hasta que se le diga lo contrario. En un robot real esto exige mecanismos externos de parada y supervisión; no se documentan condiciones de parada seguras dentro de la política.
- **Ausencia de métricas y de protocolo de evaluación**: no hay benchmarks, ni tasas de éxito, ni análisis de fallos. El valor 0.900 del remix previo carece de definición, por lo que no debe citarse como medida de calidad.
- **Riesgo de sobreajuste al simulador**: no se documenta aleatorización de dominio ni validación sim-a-real. Es esperable una brecha de rendimiento entre simulación y robot físico, aunque su magnitud no está cuantificada.
- **Falta de reproducibilidad**: se indica el repositorio, la rama y el commit de entrenamiento, pero no los hiperparámetros, las recompensas ni el dataset. Reproducir el resultado exigiría acceso al código y al entorno, que no se detallan aquí.
- **Madurez y mantenimiento**: 0 descargas y 0 likes, publicación y actualización con dos segundos de diferencia y etiqueta de «re-entrada diaria» sugieren un artefacto experimental sin validación independiente por parte de la comunidad.
- **Resultados de búsqueda no pertinentes**: las consultas web sobre el identificador del autor devolvieron únicamente páginas sobre el caldo japonés *dashi*, sin relación con el modelo. No se ha localizado documentación externa, paper ni demo adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dashi/microduck-roller-daily-20261026
- Modelo base: https://huggingface.co/DenRakEiw/microduck-senate_duck_0904
- Remix previo del mismo autor: https://huggingface.co/dashi/microduck-roller-remix-r900
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a` (no se proporciona URL directa en la información disponible)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa en la información disponible)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
