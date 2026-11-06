# BabyClaw/microduck-beaktug-radial-feedback-20261106

## Resumen

Beaktug es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo microduck de Pollen Robotics. Se distribuye como un artefacto ONNX autocontenido que se carga directamente en una ranura de política del demonio `robotctl` del robot, sin necesidad de infraestructura de inferencia adicional. El modelo consume observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, lo que define un controlador de marcha (gait) de ciclo continuo.

La ficha del autor la presenta como "campeona de liga validada" en la variante radial-feedback-20261106, un identificador que sugiere un proceso de selección por competición entre políticas candidatas. No se documentan parámetros, arquitectura interna de la red, ni composición del dataset de entrenamiento; el repositorio ocupa 0.0 GB, lo que indica un artefacto de tamaño muy reducido, coherente con una red de política compacta para control motor de baja dimensionalidad.

Su relevancia es acotada pero específica: ejemplifica el flujo de trabajo de políticas RL exportadas a ONNX para robótica de bajo coste, con un manifiesto versionado (schema 2) y un pipeline de despliegue reproducible mediante el repositorio `pollen-robotics/microduck_rl`. No es un modelo de lenguaje ni un modelo fundacional multimodal; cualquier evaluación debe hacerse en el contexto de control locomotor del microduck.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política RL exportada a ONNX; topología de red no documentada) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; ventana de observación de 61 dimensiones por paso) |
| Tipos de cuantización | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de control robótico, sin entrada/salida de texto) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red (número de capas, anchura, tipo de activaciones ni si emplea memoria recurrente). Lo que sí se especifica es la interfaz: entrada de 61 dimensiones de observación, salida de 14 dimensiones de acción y frecuencia de control de 50 Hz. El normalizador de observaciones está embebido en el propio `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo. La política es "perpetua": se ejecuta de forma continua hasta que se le indique lo contrario, comportándose como una marcha cargada en una ranura de política.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `b13aa1c69`, aunque el autor indica que la exportación se hizo desde un checkout con cambios sin commitear, lo que introduce una discrepancia de reproducibilidad respecto al commit declarado. No se especifican número de pasos de entrenamiento, algoritmo RL (PPO, SAC u otro), función de recompensa, dominio de aleatorización ni datos de simulación a real (sim2real). El identificador "radial-feedback" sugiere el uso de realimentación radial en la política o en el proceso de selección, pero no se documenta su significado técnico.

## Capacidades

- Control locomotor continuo del robot microduck a 50 Hz con 14 acciones de salida.
- Política perpetua: mantiene la marcha indefinidamente hasta recibir una orden de parada o sustitución.
- Normalización de observaciones integrada en el grafo ONNX, lo que simplifica la integración en el demonio del robot.
- Carga directa en ranuras de política mediante `robotctl policy load <slot> <repo>`.
- Compatible con el esquema 2 de manifiesto de políticas microduck, lo que permite versionado y selección de políticas.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, visión, audio ni capacidades multilingües.

## Casos de uso

- Marcha por defecto del microduck en demostraciones: cargar la política en una ranura y dejar que el robot camine de forma continua en ferias, laboratorios o vídeos de producto, aprovechando su carácter perpetuo y su frecuencia de control de 50 Hz.
- Benchmark de referencia en competiciones de políticas: al estar etiquetada como "campeona de liga validada", sirve como baseline contra el que comparar nuevas políticas entrenadas en `microduck_rl`.
- Pruebas de integración del demonio `robotctl`: validar el flujo `policy load`, la lectura del `manifest.json` schema 2 y la inyección de observaciones en crudo sin normalizador externo.
- Investigación en sim2real: usar la política como punto de partida para estudiar la transferencia de un gait entrenado en simulación al robot físico, midiendo deriva y estabilidad a 50 Hz.
- Docencia en robótica con RL: ejemplo mínimo de artefacto ONNX desplegable en hardware de bajo coste, útil para explicar el ciclo observación-acción en un cuadrúpedo de 14 actuadores.
- Sustitución en caliente de políticas: cargar y descargar políticas en distintas ranuras para comparar gaits en el mismo robot sin reiniciar el demonio, gracias al formato de manifiesto versionado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica la etiqueta cualitativa "validated league champion radial-feedback-20261106", sin métricas numéricas de recompensa, velocidad de marcha, estabilidad ni tasa de caídas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB, lo que sugiere un modelo de pocos kilobytes o megabytes, probablemente ejecutable en CPU.
- GPU recomendadas: no se especifican; por el tamaño del artefacto, la inferencia en CPU del propio robot o de un host conectado es plausible.
- ¿Cabe en GPU de consumo? Con alta probabilidad sí, dado el tamaño del repositorio, aunque no se documenta oficialmente.
- Opciones de despliegue: ONNX Runtime a través del demonio `robotctl` del microduck (flujo oficial documentado); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput estimados: no disponibles; el único dato es la frecuencia de control de 50 Hz (periodo de 20 ms por paso), que la política debe cumplir en el hardware objetivo.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas del ecosistema microduck ni modelos comparables de control locomotor con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Licencia no especificada: no se puede asumir uso comercial permitido; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Reproducibilidad comprometida: la exportación se realizó desde un checkout con cambios sin commitear respecto al commit `b13aa1c69` declarado, por lo que el artefacto no es necesariamente reproducible desde el repositorio público.
- Sin documentación de la arquitectura interna ni de los parámetros: imposible auditar el modelo o estimar su coste computacional a priori.
- Sin datos de entrenamiento, recompensa ni aleatorización: no se puede evaluar el riesgo de sobreajuste a condiciones de simulación concretas ni la robustez sim2real.
- Etiqueta "campeona de liga" sin métricas publicadas: el claim cualitativo no está respaldado por números verificables.
- Modelo de dominio muy restringido: no es un modelo de lenguaje ni multimodal; cualquier uso fuera del control del microduck carece de sentido.
- Riesgo de comportamiento no acotado: al ser una política perpetua, sin un mecanismo externo de parada podría mantener la marcha de forma indefinida ante condiciones inesperadas.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria ni informes independientes de funcionamiento en hardware real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BabyClaw/microduck-beaktug-radial-feedback-20261106
- Repositorio de entrenamiento: https://github.com/pollen-robotics/microduck_rl
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del demonio (referenciado en la model card, sin URL directa disponible)
