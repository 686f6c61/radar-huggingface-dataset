# npow/pi05-yam-gello-red-cap-wsp-standard-v3

## Resumen

`npow/pi05-yam-gello-red-cap-wsp-standard-v3` es un checkpoint de robótica derivado de `lerobot/pi05_base` (la implementación LeRobot de PI0.5, el modelo vision-language-action de Physical Intelligence). Lo publica el usuario npow en Hugging Face y su objetivo es adaptar PI0.5 a la instrucción concreta "Pick up the red cap and place it on the black box" sobre un brazo YAM con pinza Gello, sin entrenamiento por gradientes.

La técnica empleada es *weight-space programming* (WSP): en lugar de fine-tuning supervisado, el autor aplica una edición algebraica determinista sobre las proyecciones de entrada y salida de acciones del modelo base. La versión v3 conjuga el campo vectorial de acciones escalando por un factor fijo de 0,5 las seis coordenadas del brazo izquierdo alrededor de cero. El resultado se distribuye como pesos fusionados completos, con safetensors estándar de LeRobot y parámetros nativos Orbax para OpenPI.

El modelo tiene 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y un repositorio de 23,2 GB. Es relevante porque demuestra que una edición de pesos cerrada y verificable puede mejorar la concordancia offline de acciones frente al modelo base y frente a mantener la posición, sin necesidad de datos de demostración adicionales ni de un cargador de workspace en tiempo de ejecución. Las cifras son exploratorias y se miden solo en evaluación offline: no se ha demostrado recogida exitosa en simulación ni en hardware.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action basada en PI0.5 (transformer con flujo de difusión de acciones, heredada de `lerobot/pi05_base`) |
| Parámetros totales | 4.143.404.816 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors y Orbax; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (las instrucciones de tarea se expresan en inglés en el ejemplo) |
| Licencia | gemma |
| Formato de pesos | safetensors (LeRobot) y Orbax (`params/`) para OpenPI |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base`, la implementación en LeRobot de PI0.5, un VLA que combina un backbone vision-language con un cabezal de acciones generado por un solver de Euler sobre un campo vectorial de flujo (10 pasos de Euler, muestreo gaussiano estándar). El checkpoint v3 no se entrena: se obtiene por edición de pesos sobre los pesos verificados de WSP v2, a su vez derivados de `lerobot/pi05_base` y de checkpoints de tareas no relacionadas autorizados por el usuario. El autor declara explícitamente que no se inspeccionó ningún checkpoint YAM fine-tuned protegido, y que no se usaron gradientes, optimizador ni regresión sobre acciones demostradas.

La innovación técnica es la edición del programa de pesos. Para las seis coordenadas del brazo izquierdo se aplica un factor fijo de 0,5 alrededor de cero delta físico del brazo. En notación de vectores fila, con escala diagonal `S`, centro `c` y `d=(I-S)c`:

```text
W_in'  = S^-1 W_in
b_in'  = b_in - d S^-1 W_in
W_out' = W_out S
b_out' = b_out S
```

Estas capas implementan el campo vectorial conjugado `v'(x,t)=v((x-d)S^-1,t)S`. La inicialización gaussiana y el solver de Euler se mantienen sin cambios, por lo que no se garantiza que las predicciones finales queden exactamente escaladas. Las columnas y filas de proyección de la pinza no se tocan, aunque las predicciones pueden interactuar a través de la red compartida. Los factores 0,75 y 0,5 se fijaron antes de sondear; ambos pasaron las comprobaciones de desarrollo y se seleccionó 0,5 en validación. Sobre 320 observaciones de validación, su error fue un 6,2 % inferior a v2, con intervalo ajustado por familia de candidatos de 3,5–8,8 %.

Los datos de entrenamiento asociados son el dataset `npow/yam-gello-red-cap-100`, usado para normalización compartida (60 episodios), desarrollo (20) y evaluación fija (20). El autor advierte que el dataset tiene exposición previa en el proyecto y que los resultados son exploratorios.

## Capacidades

- Generación de comandos de acción para un brazo robótico YAM de dos brazos con pinzas Gello: 14 valores de acción (seis articulaciones izquierdas, pinza izquierda, seis articulaciones derechas, pinza derecha).
- Condicionamiento por instrucción en lenguaje natural: el checkpoint está especializado en la tarea "Pick up the red cap and place it on the black box".
- Entrada multimodal: estado de observación (`observation.state`) y tres imágenes (`observation.images.base_0_rgb`, `observation.images.left_wrist_0_rgb`, `observation.images.right_wrist_0_rgb`).
- Predicción de chunks de 50 comandos de acción; la evaluación puntúa los 10 primeros a 20 Hz.
- Salidas de brazo como deltas relativas a un ancla de planificación (hay que sumar el ancla medida una vez para obtener objetivos absolutos); las pinzas son absolutas.
- Inferencia determinista con pesos fijos: sin cargador de workspace, sin cabezal auxiliar, sin filtro de acciones ni programa de edición de pesos en tiempo de ejecución.
- Compatibilidad con dos runtimes: LeRobot (`PI05Policy`) y OpenPI/Orchestral (backend JAX, solver Euler, 10 pasos de denoising).
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, audio ni thinking mode.

## Casos de uso

- Investigación en adaptación sin gradientes: el checkpoint sirve como referencia reproducible para estudiar si una edición algebraica de pesos puede sustituir a un fine-tuning supervisado en un VLA, con artefactos de verificación publicados (`export_verification.json`, `openpi_conversion_verification.json`).
- Reproducción de experimentos de WSP: el repositorio incluye `weight_edit_program.json`, lo que permite replicar la selección del factor 0,5 y comparar contra WSP v2 y contra el modelo base en las mismas observaciones de evaluación.
- Evaluación offline de políticas robóticas: con 20 episodios, cuatro observaciones por episodio y tres semillas de ruido, se puede medir el error cuadrático medio de las primeras 10 acciones y comparar runtimes (OpenPI frente a LeRobot) con idéntico preprocesado dentro de cada runtime.
- Pruebas de integración en LeRobot: el código de carga con `PI05Policy.from_pretrained(repo, strict=True)` y `make_pre_post_processors` permite validar el pipeline completo de normalización YAM y tokenización de estado de 14 valores antes de conectar hardware.
- Pruebas de integración en OpenPI/Orchestral: el comando `orchestral models inspect openpi hf://...` con `policy_config=none action_horizon=50 model_action_dim=32 asset_id=yam-wsp runtime_backend=jax solver=euler denoise_steps=10 dtype=float32 matmul_precision=highest` verifica la carga de los 51 hojas Orbax mediante el lector de parámetros.
- Docencia y divulgación sobre VLA: al ser un caso cerrado, pequeño en número de parámetros (4,14 mil millones) y con métricas explícitas, resulta útil para explicar la diferencia entre evaluación offline de acciones y éxito real de recogida en simulación o hardware.
- Línea base para futuras ediciones WSP: al mantener v2 disponible sin cambios en su propio repositorio, permite comparar nuevas ediciones contra una referencia congelada y verificar la igualdad bit a bit de las predicciones con semilla fija.

## Benchmarks y rendimiento

Resultados publicados por el autor. Las puntuaciones son el error cuadrático medio de las primeras 10 acciones predichas para el brazo izquierdo activo y la pinza, sobre 20 episodios, cuatro observaciones por episodio y tres semillas de ruido. Cada runtime compara base y pesos editados con idéntico preprocesado e inferencia dentro de ese runtime.

| Runtime estándar | Base sin editar | WSP v3 | Mantener posición | ¿Pasa las cuatro puertas? |
|---|---:|---:|---:|---|
| OpenPI nativo | 0,058662 | **0,025148** | 0,027486 | Sí |
| LeRobot | 0,209078 | **0,030146** | 0,027486 | No (falla el margen frente a mantener posición) |

Según el autor, la edición congelada v3 pasa las cuatro puertas de aceptación offline predeclaradas con OpenPI nativo: el error de acción mejora un 57,1 % respecto al base y un 8,5 % respecto a mantener posición, conservando la precisión de pinza y la precisión física del brazo relativas al base. Mejora un 5,2 % el error de acción respecto a WSP v2 en las mismas observaciones de evaluación. En LeRobot, v3 reduce el error un 85,6 % respecto a su base, pero queda un 9,7 % por encima de mantener posición. Los dos runtimes tienen distinto comportamiento de padding de imagen y sus puntuaciones deben leerse por separado.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia de orden de magnitud, 4,14 mil millones de parámetros en fp32 ocupan aproximadamente 16,6 GB solo en pesos; el repositorio completo pesa 23,2 GB, lo que incluye safetensors, parámetros Orbax y artefactos de verificación.
- GPU recomendadas: no disponibles en la información proporcionada. El runtime nativo usa backend JAX con `dtype=float32` y `matmul_precision=highest`, lo que sugiere GPUs con soporte JAX/CUDA de gama alta, pero el autor no especifica modelos concretos.
- ¿Cabe en GPU de consumo? No disponible. Con 4,14 mil millones de parámetros en fp32, una GPU de 24 GB sería el mínimo teórico para pesos sin overhead, pero no hay confirmación del autor ni datos de cuantización publicados.
- Opciones de despliegue: LeRobot (`lerobot.policies.pi05.PI05Policy`) y OpenPI/Orchestral con backend JAX. No se documentan vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para un VLA de robótica.
- Latencia y throughput: no disponibles. El autor solo indica 10 pasos de Euler, chunks de 50 comandos y evaluación a 20 Hz, sin cifras de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `npow/pi05-yam-gello-red-cap-wsp-standard-v3` | 4.143.404.816 | no disponible | VLA para YAM, tarea única de recogida de tapón rojo | gemma | Hugging Face, safetensors + Orbax |
| `lerobot/pi05_base` (modelo base) | no disponible en la información | no disponible | VLA general PI0.5 en LeRobot | no disponible en la información | Hugging Face (LeRobot) |
| WSP v2 (mismo autor, repositorio propio) | no disponible en la información | no disponible | Edición WSP previa sobre el mismo pipeline | no disponible en la información | Hugging Face, sin cambios |

No se dispone de datos de benchmarks estándar ni de otros checkpoints YAM comparables en la información proporcionada.

## Limitaciones y advertencias

- Los resultados son exclusivamente offline: miden concordancia de acciones, no éxito de recogida. El autor declara que no se ha demostrado la recogida exitosa ni en simulación ni en hardware.
- El dataset `npow/yam-gello-red-cap-100` tiene exposición previa en el proyecto; los resultados son exploratorios y el ajuste del intervalo de confianza no corrige el historial de selección de métodos del proyecto más amplio.
- En LeRobot, v3 falla el margen frente a mantener posición (queda un 9,7 % por encima), por lo que no supera las cuatro puertas de aceptación en ese runtime.
- Las puntuaciones de OpenPI y LeRobot no son directamente comparables por diferencias de padding de imagen; hay que leerlas por separado.
- El modelo está especializado en una única instrucción; no se documenta generalización a otras tareas, objetos o entornos.
- El campo vectorial conjugado no garantiza que las predicciones finales queden exactamente escaladas, porque la inicialización gaussiana y el solver de Euler no cambian.
- Las salidas del brazo son deltas relativas a un ancla de planificación; un uso incorrecto de la conversión a objetivos absolutos (sumar el ancla una sola vez) produce comandos erróneos.
- Licencia `gemma`: conviene revisar los términos de la licencia Gemma antes de cualquier uso comercial, ya que impone condiciones de uso y redistribución.
- No hay información sobre sesgos, riesgo de alucinación en el sentido lingüístico, cobertura de idiomas ni cuantizaciones validadas.
- Parámetros totales de 4,14 mil millones y repositorio de 23,2 GB: el despliegue requiere recursos de GPU considerables y no se documentan requisitos mínimos.

## Enlaces

- Hugging Face: https://huggingface.co/npow/pi05-yam-gello-red-cap-wsp-standard-v3
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset: https://huggingface.co/datasets/npow/yam-gello-red-cap-100
- LeRobot (librería): https://github.com/huggingface/lerobot
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de OpenPI/Orchestral ni demos adicionales.
