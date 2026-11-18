# DenRakEiw/microduck-songkran-duck-tug3

## Resumen

`microduck-songkran-duck-tug3` es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje, sino de una política de locomoción perpetual (se ejecuta de forma continua hasta que se detiene explícitamente) empaquetada en formato ONNX y distribuida a través del ecosistema de políticas del robot. El modelo resuelve la tarea `Mjlab-TugOfWar-MicroDuck`, un escenario de simulación de "tira y afloja" (tug of war) en el que el robot debe mantener una postura y una marcha estables frente a un oponente simulado.

La política consume observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, lo que la sitúa en el régimen de control reactivo de alta frecuencia típico de la locomoción de cuadrúpedos. El normalizador de observaciones está embebido directamente en el fichero `policy.onnx`, de modo que el consumidor final puede alimentar observaciones en crudo sin preprocesado adicional.

El modelo es relevante como ejemplo de flujo de trabajo reproducible en robótica con RL: el autor documenta el commit exacto, la semilla, el checkpoint y el comando de entrenamiento completo, lo que permite reproducir una política comparable (aunque no idéntica, dado que el entrenamiento con GPU no es bit-reproducible). Su interés es, por tanto, principalmente académico y de experimentación con el robot microduck, no de producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control entrenada con aprendizaje por refuerzo (no se especifica la arquitectura de red concreta) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana de observación de 61 dimensiones) |
| Tipos de cuantizacion | no disponible (distribución en ONNX) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de red de la política (número de capas, anchura, tipo de MLP o si incorpora recurrencia). Lo que sí se documenta es el pipeline de entrenamiento: la política se entrena en el entorno `Mjlab-TugOfWar-MicroDuck` del repositorio `pollen-robotics/microduck-challenges`, sobre la base `mjlab-microduck 0.1.0` en el commit `1efd853be`, con el código en la rama `denrakeiw-070` y commit `6c0b5d452`. El checkpoint final es el `6900`, con semilla `8`, y el entrenamiento se inició el 2026-11-17T17:11:53Z.

El comando de reproducción revela detalles técnicos concretos: 4096 entornos paralelos, hasta 3000 iteraciones del agente, episodios de 10,5 segundos, un coeficiente de entropía de 0,001 y un currículo de recompensas por etapas que ajusta pesos de tasa de acción, sesgo de pose de cabeza y rangos de centro de masa. También se emplea un oponente de sparring cargado desde `logs/sparring/titan-v1/policy.onnx` con mezcla 0,7/0,3 respecto a una referencia, con retardo de inicio de 3 iteraciones y dispersión de retardo de 3. El entrenamiento se reanuda desde el checkpoint `model_4100.pt` del run `2026-11-17_04-08-20_tw19b-d03`. No se especifica el número total de tokens ni la composición de datos, dado que no aplica: el "dataset" es la simulación física.

## Capacidades

- Control de locomoción de un robot cuadrúpedo microduck a 50 Hz mediante política perpetual.
- Consumo de observaciones de 61 dimensiones y emisión de 14 acciones de control.
- Normalización de observaciones integrada en el propio ONNX, sin preprocesado externo.
- Comportamiento de "tira y afloja" (tug of war) frente a un oponente simulado, con recompensas específicas de margen de foso, veredicto de marcador y estabilidad postural.
- Carga en el robot mediante el comando `robotctl policy load <slot> DenRakEiw/microduck-songkran-duck-tug3`.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- **Investigación en locomoción de cuadrúpedos de bajo coste**: la política sirve como punto de partida para estudiar cómo el currículo de recompensas y el oponente de sparring afectan a la estabilidad de la marcha en el microduck, usando el comando de reproducción documentado.
- **Docencia y experimentación con RL en robótica**: el flujo completo (commit, semilla, `uv.lock`, comando) permite a estudiantes reproducir un entrenamiento de política perpetual con 4096 entornos en paralelo y comparar políticas resultantes.
- **Evaluación de robustez frente a oponentes**: el escenario de tug of war con oponente `titan-v1` mezclado al 0,7/0,3 permite probar la resistencia de la política a perturbaciones externas simuladas.
- **Despliegue en el robot físico microduck**: mediante `robotctl policy load` se puede cargar la política en un slot del robot real para pruebas de marcha en laboratorio.
- **Generación de datos de referencia para comparación de políticas**: al ser una política perpetual con normalizador embebido, puede usarse como baseline en experimentos que comparen nuevas políticas del mismo repositorio de retos.
- **Integración en pipelines de simulación mjlab**: la política ONNX puede cargarse como oponente o como referencia dentro de entornos mjlab para entrenar otras políticas contra ella.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repo es de 0,0 GB, lo que sugiere un modelo muy pequeño (política compacta en ONNX), probablemente ejecutable en CPU.
- GPU recomendadas para entrenamiento: no especificadas; el comando documentado usa 4096 entornos paralelos, lo que en la práctica requiere una GPU de datacenter (A100/H100) o varias, aunque no se confirma.
- GPU para inferencia: no disponible; por el tamaño del artefacto, es plausible su ejecución en CPU o en GPUs de gama baja, pero no se documenta.
- Opciones de despliegue: el runtime propio del ecosistema microduck (`robotctl`) y ONNX Runtime; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles; la política opera a 50 Hz según la model card, pero no se aportan cifras de latencia por inferencia.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye políticas comparables del mismo repositorio ni métricas que permitan una comparación rigurosa con alternativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no responde a prompts y no tiene capacidades multilingües.
- La licencia no está disponible, lo que impide confirmar si se permite uso comercial; conviene contactar con el autor antes de cualquier uso productivo.
- El entrenamiento con RL en GPU no es bit-reproducible: la reproducción produce una política "comparable", no los mismos pesos.
- El modelo está entrenado para una tarea y un robot concretos (microduck, tug of war); no se garantiza su transferencia a otras morfologías o escenarios.
- No se documentan sesgos, tasas de alucinación ni evaluaciones de robustez fuera del entorno simulado.
- El repo tiene 0 descargas y 0 likes, sin validación comunitaria; el soporte y el mantenimiento no están garantizados.
- El checkpoint y la semilla están documentados, pero la ausencia de benchmarks impide evaluar su rendimiento objetivo frente a otras políticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DenRakEiw/microduck-songkran-duck-tug3
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (referenciado en la model card, sin URL directa disponible)
