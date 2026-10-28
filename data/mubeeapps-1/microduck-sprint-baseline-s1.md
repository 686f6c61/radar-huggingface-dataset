# mubeeapps-1/microduck-sprint-baseline-s1

## Resumen

microduck-sprint-baseline-s1 es una política de control entrenada por refuerzo para el robot cuadrúpedo microduck de Pollen Robotics, publicada por el usuario mubeeapps-1. No es un modelo de lenguaje: es una política de locomoción («sprint», 2 m) que consume observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, distribuida como `policy.onnx` y cargable en el daemon del robot mediante `robotctl policy load walk`. Se trata de una política «perpetua»: una marcha que se ejecuta de forma continua hasta que se le indique lo contrario.

El interés de la publicación es la reproducibilidad, no la novedad metodológica. El autor declara explícitamente que es una reproducción baseline de la receta oficial de Sprint, sin cambios, con semilla 1 y checkpoint 2750, entrenada localmente con el stack `mjlab` sobre 4096 entornos y un máximo de 3000 iteraciones. Incluye el comando exacto de reproducción, commit del repositorio de challenges y versión base de `mjlab-microduck`.

La validación es limitada y local: 5/5 ensayos en la Arena local con una media de 5,123 segundos, y pruebas adicionales con semillas de inicio 6 a 25 a un comando de 0,60 m/s (media 5,11775 s). El propio autor advierte que son resultados de simulación en un PC con Windows, no puntuaciones oficiales del servidor ni validación en robot físico. El repositorio figura con 0,0 GB, 0 descargas y 0 likes, y no se declara licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (política de RL para control robótico; no se especifica la topología de red) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; observación de 61 dimensiones por paso, control a 50 Hz |
| Tipos de cuantizacion | No disponible (se distribuye en ONNX; no se confirma el tipo numérico) |
| Idiomas soportados | No disponible / no aplica (modelo de control motor, sin interfaz de lenguaje) |
| Licencia | No disponible (no se declara licencia en la model card ni en los metadatos) |
| Formato de pesos | ONNX (`policy.onnx`), con normalizador de observaciones embebido; `manifest.json` con esquema 2 del manifiesto de políticas de microduck |

Otros datos declarados: 14 acciones de salida, tarea `Mjlab-Sprint2m-MicroDuck`, checkpoint 2750, semilla 1, base `mjlab-microduck 0.1.0 @ 1efd853be`, commit `4b675ebf4` del repositorio `microduck-challenges`.

## Arquitectura y entrenamiento

No se detalla la arquitectura de la red en la información disponible. Por el contexto (política de control cargada como ONNX y ejecutada a 50 Hz en el robot) se trata de una política de inferencia ligera, pero el autor no publica número de parámetros, número de capas ni tipo de red, por lo que no se puede confirmar si es un perceptrón multicapa, una red recurrente u otra topología. La interfaz sí está definida: entrada de 61 dimensiones (observación cruda, ya que el normalizador está embebido en el ONNX) y salida de 14 acciones.

El entrenamiento se realizó con el recetario oficial de Sprint del proyecto `microduck-challenges`, sin modificaciones, usando `mjlab` como framework de RL sobre simulación, con 4096 entornos paralelos, hasta 3000 iteraciones y semilla 1, registrando en TensorBoard bajo el nombre `baseline-s1`. El autor no indica el algoritmo de RL concreto, la composición del dataset (al ser aprendizaje por refuerzo, los datos provienen del simulador) ni si hubo etapas de ajuste fino adicionales. La única innovación declarada es la reproducibilidad del pipeline: mismo código, mismo `uv.lock`, mismo comando y misma semilla; el autor advierte que el RL con GPU no es reproducible bit a bit entre máquinas, por lo que una repetición produce una política comparable, no los mismos pesos.

## Capacidades

- Locomoción tipo sprint del microduck (2 m) como política perpetua: se ejecuta de forma continua hasta recibir una orden distinta.
- Control reactivo a partir de observaciones propioceptivas de 61 dimensiones, con salida de 14 acciones a 50 Hz.
- Normalización de observaciones integrada en el propio ONNX: la política acepta observaciones crudas, sin preprocesado externo.
- Integración con el daemon del robot mediante `robotctl policy load walk <repo>` y manifiesto conforme al esquema 2.
- Reproducción del entrenamiento documentada (commit, semilla, número de entornos, iteraciones y comando exacto).
- No soporta tool calling, función calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas ni visión.
- No se declaran capacidades multilingües ni modo «thinking».

## Casos de uso

- Marcha por defecto en el microduck: cargar la política en el slot `walk` con `robotctl policy load walk mubeeapps-1/microduck-sprint-baseline-s1` para dotar al robot de una marcha de sprint funcional en simulación y en despliegue sobre el daemon.
- Baseline de comparación para experimentos de RL: al usar la receta oficial sin cambios y semilla 1, sirve como referencia para medir la mejora de variantes propias (recompensas, dominio de aleatorización, número de entornos) sobre la misma tarea `Mjlab-Sprint2m-MicroDuck`.
- Verificación de reproducibilidad del stack: permite comprobar si un entorno nuevo (versión de `mjlab`, driver, GPU) reproduce resultados comparables siguiendo el comando documentado, con la salvedad de la no reproducibilidad bit a bit.
- Pruebas de integración del daemon y del formato de manifiesto: el `manifest.json` con esquema 2 y el ONNX con normalizador embebido son útiles para validar el cargador de políticas de `robotctl` en CI.
- Demostraciones y vídeos de locomoción: política perpetua sin necesidad de episodios o reseteos, adecuada para exhibiciones continuas del robot en feria o laboratorio.
- Punto de partida para transferencia o ajuste fino: al estar entrenada en simulación con la receta canónica, puede servir como inicialización para experimentos de sim-to-real o de adaptación a distintas condiciones de suelo.
- Evaluación comparativa de semillas: las pruebas del autor con semillas de inicio 6 a 25 a 0,60 m/s permiten estudiar la varianza de la política ante condiciones iniciales distintas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; no aplican a una política de control motor. Los únicos datos de rendimiento son la validación local declarada por el autor:

| Prueba | Condición | Resultado |
|---|---|---|
| Arena local (checkpoint 2750) | 5 ensayos | 5/5 completados; media 5,123 s |
| Retest local independiente | Repetición del anterior | Resultado reproducido (sin cifra desglosada) |
| Semillas de inicio 6 a 25 | Comando 0,60 m/s | Todas finalizadas; media 5,11775 s |

Advertencia del autor: son resultados de simulación en un solo PC con Windows, no puntuaciones oficiales del servidor ni validación en robot físico.

## Requisitos de hardware

- VRAM estimada: no disponible. El autor no publica número de parámetros ni tamaño del archivo ONNX; el repositorio figura con 0,0 GB, lo que sugiere un artefacto de pocos megabytes, pero es una inferencia a partir del tamaño del repo, no un dato confirmado.
- GPU recomendadas para entrenamiento: no especificadas. El comando de reproducción usa 4096 entornos paralelos en `mjlab`, lo que habitualmente requiere una GPU de gama alta (A100/H100 o similar), pero el autor no indica el hardware empleado; solo menciona «un PC con Windows» para la validación.
- GPU para inferencia: no disponible. Por la frecuencia de control (50 Hz) y el formato ONNX, es esperable ejecución en CPU del propio robot o en una SBC, pero no se confirma el hardware objetivo.
- Despliegue: ONNX Runtime a través del daemon de microduck (`robotctl`), con `policy.onnx` y `manifest.json` (esquema 2). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El único requisito temporal declarado es el ciclo de control a 50 Hz (20 ms por paso).

## Comparativa con modelos similares

No se dispone de datos de otras políticas comparables en la información proporcionada (parámetros, contexto, rendimiento o licencia). El ecosistema `microduck-challenges` alberga otras políticas y recetas, pero no se han facilitado sus especificaciones, por lo que la comparación cuantitativa no está disponible.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-sprint-baseline-s1 | No disponible | No aplica (61-D de observación) | 5/5 trials, media 5,123 s (simulación local) | No disponible | HuggingFace, 0 descargas |
| Otras políticas de microduck | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Ausencia de licencia: no se declara licencia en la model card ni en los metadatos, por lo que no hay permiso explícito de uso comercial, redistribución o modificación; conviene contactar con el autor antes de cualquier uso en producción.
- Validación únicamente en simulación: los resultados (5/5 trials, 5,123 s) proceden de un PC con Windows y el propio autor indica que no hay validación en robot físico ni puntuaciones oficiales del servidor.
- Sesgos conocidos: no documentados. En RL de locomoción es habitual un sesgo hacia las condiciones del simulador de entrenamiento (fricción, terreno plano, distribución de comandos), pero el autor no aporta análisis de dominio de aleatorización ni de robustez.
- Riesgo de fallo fuera de distribución: al ser una reproducción baseline sin cambios en la receta, no se declaran mecanismos adicionales de robustez ante terrenos irregulares, empujes o cargas.
- No reproducibilidad bit a bit: el autor advierte que reentrenar con la misma semilla produce una política comparable, no idénticos pesos.
- Alcance funcional muy acotado: solo locomoción; no procesa lenguaje, no razona y no admite instrucciones en lenguaje natural.
- Trazabilidad limitada: repositorio con 0 descargas y 0 likes, y fecha de creación declarada en 2026-10-28, sin más señales de mantenimiento o revisión por terceros.
- Dependencia de la interfaz del daemon: requiere `robotctl` y el esquema 2 del manifiesto de políticas; cambios en el daemon pueden romper la carga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mubeeapps-1/microduck-sprint-baseline-s1
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de challenges y recetas de entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Commit de entrenamiento: `4b675ebf4` en `microduck-challenges` (rama `main`)
- Base de entrenamiento: `mjlab-microduck 0.1.0 @ 1efd853be`
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)
