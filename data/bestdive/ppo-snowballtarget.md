# bestdive/ppo-SnowballTarget

## Resumen

`bestdive/ppo-SnowballTarget` es una política de aprendizaje por refuerzo entrenada con PPO (Proximal Policy Optimization) sobre el entorno SnowballTarget de Unity ML-Agents, el escenario simplificado que se utiliza en la unidad 5 del curso de Deep RL de Hugging Face. El modelo lo desarrolla Kay Zheng (usuario `bestdive`) y se publica como un checkpoint exportado a ONNX, pensado para ser cargado por el motor de inferencia de ML-Agents o por `onnxruntime`.

No es un modelo de lenguaje ni un modelo fundacional: se trata de un agente de control que aprende a navegar hacia un objetivo dentro de una simulación. El entrenamiento partió de inicialización aleatoria, sin política preentrenada, con semilla 42, ML-Agents 1.1.0 y 100.448 pasos de entorno ejecutados en la CPU gratuita de Google Colab. El entrenamiento se reanudó desde el paso 49.936 tras fijar PyTorch en la versión 2.2.2 para resolver una incompatibilidad en la exportación a ONNX.

Su relevancia es fundamentalmente educativa y de reproducibilidad: incluye la configuración de entrenamiento, los registros, el checkpoint ONNX y una evaluación independiente completa (110 episodios con semilla de entorno 100001 y acciones deterministas), lo que permite auditar el resultado y repetir el experimento. Con 0 descargas y 0 «likes», es un artefacto reciente y de nicho, no una referencia de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política PPO (Proximal Policy Optimization) implementada con ML-Agents 1.1.0, exportada a ONNX; detalle de capas y unidades no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; el agente observa vectores del entorno por paso) |
| Tipos de cuantizacion | no disponible (no se documenta ninguna cuantización) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | ONNX (checkpoint exportado); también se incluye la configuración y el registro de entrenamiento |

Otros metadatos: repositorio alojado en Hugging Face con etiqueta `region:us`, tamaño de repositorio 0,0 GB, publicación y última actualización el 10 de septiembre de 2026. Librería declarada: `ml-agents`.

## Arquitectura y entrenamiento

La arquitectura es una política PPO estándar de ML-Agents, entrenada desde cero (sin política preentrenada) sobre el entorno SnowballTarget de Unity. El bucle de entrenamiento se ejecutó con `mlagents-learn` y los hiperparámetros recogidos en `training-config.yaml`, con semilla fija 42 y 100.448 pasos de entorno acumulados. No se especifican en la model card el número de capas, el tamaño de las capas ocultas, el tipo de codificador de observaciones ni los hiperparámetros concretos de PPO (learning rate, batch size, epochs, clip), por lo que esos datos figuran como no disponibles.

Un detalle técnico relevante es la interrupción y reanudación del entrenamiento: el proceso se detuvo en el paso 49.936 porque la exportación a ONNX fallaba con PyTorch 2.14.0; el autor fijó PyTorch 2.2.2 y reanudó desde ese punto. El resultado final se exportó a ONNX y se evaluó de forma independiente con acciones deterministas. El entorno de reproducción documentado es Python 3.10.12, `mlagents==1.1.0`, `torch==2.2.2`, `onnx==1.15.0`, `setuptools<81` y `onnxruntime`. El autor declara explícitamente que no se usaron métricas de evaluación fabricadas y que el rendimiento está limitado a esta tarea simulada.

## Capacidades

- Control de un agente en el entorno SnowballTarget de Unity ML-Agents: navegación y aproximación a un objetivo dentro de la simulación.
- Inferencia determinista vía ONNX: la política exportada produce acciones reproducibles, lo que facilita la evaluación y el despliegue.
- Ejecución en CPU: el entrenamiento completo se realizó en CPU, y la inferencia está pensada para `onnxruntime`.
- Integración con Unity: al ser un policy ONNX de ML-Agents, es susceptible de cargarse en el motor de inferencia de Unity para ejecutar el comportamiento dentro del entorno (capacidad implícita derivada del formato, no documentada explícitamente en la model card).
- Reproducibilidad: incluye configuración, log de entrenamiento, checkpoint y script de evaluación (`evaluate_unity.py`), lo que permite repetir el experimento.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes basados en lenguaje, visión, audio ni capacidades multilingües.

## Casos de uso

- Material didáctico para cursos de Deep RL: sirve como ejemplo completo y auditable de un ciclo PPO con ML-Agents, desde el entrenamiento hasta la exportación ONNX y la evaluación independiente.
- Reproducción de experimentos en un aula o laboratorio: el repositorio incluye la configuración exacta, la semilla y las versiones de las dependencias, de modo que un estudiante puede replicar el resultado y comparar su propio `mean_reward`.
- Punto de partida para *fine-tuning* en SnowballTarget: al tratarse de un checkpoint ONNX con política entrenada, puede usarse como inicialización para continuar el entrenamiento con variaciones de recompensa o de dificultad del escenario.
- Pruebas de integración de pipelines de entrenamiento: útil para validar que una instalación de `mlagents-learn` + `torch` + `onnx` funciona de extremo a extremo, incluida la detección de incompatibilidades de exportación como la que documenta el autor.
- Verificación de exportación e inferencia ONNX: el checkpoint permite comprobar que `onnxruntime` produce acciones deterministas coherentes con la política entrenada, un paso crítico antes de desplegar cualquier política en producción.
- Prototipado de comportamientos de NPC en Unity: el policy puede integrarse en el motor de inferencia de ML-Agents para controlar agentes simples en escenas de Unity, como base antes de escalar a entornos propios.
- Referencia base en experimentos comparativos de RL: sirve como línea base documentada (media 12,49 ± 5,40 en 110 episodios) frente a la cual medir variantes de algoritmo o de hiperparámetros en el mismo entorno.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (evaluación independiente con 110 episodios, semilla de entorno 100001 y acciones ONNX deterministas). El valor de `mean_reward` figura como no verificado (`verified: false`).

| Tarea | Dataset / entorno | Métrica | Valor |
|---|---|---|---|
| reinforcement-learning | ML-Agents-SnowballTarget | mean_reward | 12,49090909090909 ± 5,403274183384224 |

No se han publicado en la información disponible otros benchmarks (MMLU, HumanEval, GSM8K u otros), ya que no son aplicables a este tipo de modelo.

## Requisitos de hardware

- Entrenamiento: completado en la CPU gratuita de Google Colab, sin GPU, con 100.448 pasos de entorno. Esto acota de forma empírica el coste del entrenamiento, aunque no se publica la duración total del mismo.
- VRAM para inferencia: no disponible. La model card no documenta requisitos de memoria; la inferencia se planteó sobre ONNX en CPU.
- GPU recomendadas: no disponibles. El autor no utilizó GPU ni en el entrenamiento ni en la evaluación documentada.
- Encaje en GPU de consumo: no hay cifras publicadas. Dado que el entrenamiento completo se ejecutó en CPU, es razonable esperar que la inferencia quepa en cualquier GPU de consumo, pero se trata de una inferencia no verificada con datos.
- Opciones de despliegue: `onnxruntime` (documentado en los requisitos de reproducción) y, de forma implícita por el formato ONNX de ML-Agents, el motor de inferencia de Unity. Frameworks como vLLM, llama.cpp, Ollama o TGI no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. En la información proporcionada no se identifican otros modelos publicados comparables (mismo entorno, mismo algoritmo o misma categoría) con los que contrastar parámetros, contexto, rendimiento o licencia. Las alternativas naturales serían otras políticas PPO entrenadas sobre ML-Agents-SnowballTarget, pero no se dispone de datos de ninguna de ellas.

## Limitaciones y advertencias

- Alcance restringido: el propio autor indica que el rendimiento está limitado a esta tarea simulada; la política no generaliza a otros entornos ni a tareas de lenguaje.
- Alta varianza en la recompensa: la desviación estándar poblacional (5,40) es aproximadamente el 43 % de la media (12,49) sobre 110 episodios, lo que indica un comportamiento poco estable entre episodios.
- Métrica no verificada: el resultado de `mean_reward` está marcado como `verified: false` en el model-index; procede de la evaluación del propio autor.
- Muestra de evaluación limitada: 110 episodios con una única semilla de entorno (100001) y acciones deterministas; no se documentan intervalos de confianza ni evaluaciones con semillas adicionales.
- Sesgos conocidos: no disponibles. Al no procesar lenguaje ni datos humanos, no se documentan sesgos sociales, pero tampoco se ha realizado ningún análisis al respecto.
- Riesgo de alucinación: no aplica en el sentido habitual; el equivalente sería una política que falla o se comporta de forma errática ante estados poco explorados durante el entrenamiento (100.448 pasos en CPU es un presupuesto de entrenamiento modesto).
- Limitaciones de infraestructura: el entrenamiento se interrumpió por una incompatibilidad de exportación a ONNX con PyTorch 2.14.0 y requirió fijar la versión 2.2.2; quien reproduzca el experimento debe respetar el entorno de dependencias documentado.
- Licencia: MIT, que permite uso comercial, modificación y redistribución con aviso de copyright. No se documentan restricciones adicionales.
- Caveat para producción: es un artefacto educativo y de investigación, con 0 descargas y sin validación externa independiente del autor; no debería desplegarse en sistemas críticos sin una reevaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bestdive/ppo-SnowballTarget
- Curso de Deep RL de Hugging Face (unidad 5, origen del entorno y del ejercicio): no se proporciona URL directa en la información disponible.
- Repositorio de ML-Agents: no se proporciona URL directa en la información disponible.
- Papers o blogs adicionales: no disponibles. Los resultados de la búsqueda web devueltos no guardan relación con el modelo (corresponden a páginas biográficas sobre Tom Cruise), por lo que no se han incluido.
