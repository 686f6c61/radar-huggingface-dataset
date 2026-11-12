# Dongkkka/Task905-943-GR00T-Molmo-R3-10k

## Resumen

Task905-943-GR00T-Molmo-R3-10k es un checkpoint de entrenamiento (paso 10.000 de un total previsto de 30.000) publicado por el usuario Dongkkka en Hugging Face. Se trata de un modelo de robótica construido sobre GR00T-N1.7-3B, la arquitectura de política viso-motora de NVIDIA, con un backbone de visión-lenguaje basado en Qwen3-VL y Cosmos-Reason2-2B. El modelo incorpora además un adaptador Molmo congelado de 25.000 pasos que predice puntos de referencia sobre la primera imagen de cada episodio, y componentes táctiles entrenados junto con el experto en acciones.

El checkpoint resuelve una tarea muy concreta: el control bimanual de un robot para dos tareas de manipulación (Task 905 con la mano derecha y Task 943 con la mano izquierda), donde el objetivo se especifica mediante un disco magenta opaco sobre el objeto. La entrada combina RGB de la cabeza y señales táctiles izquierda y derecha (45 valores cada una) junto con el estado del robot, y la salida es una acción de 54 articulaciones con un horizonte de 40 pasos.

Es relevante porque muestra el estado del arte en el apilamiento de modelos fundacionales para robótica: un VLM congelado (Qwen3-VL/Cosmos-Reason2-2B) más un adaptador de puntos (MolmoPoint) más un experto en acciones entrenable, todo empaquetado con estado de optimizador, scheduler y RNG para reanudar el entrenamiento. No obstante, es un artefacto de investigación intermedio: el propio autor advierte que el entrenamiento sigue en marcha y que el checkpoint no ha demostrado éxito en las tareas ni seguridad en un robot motorizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T-N1.7-3B (política viso-motora) con backbone Qwen3-VL / Cosmos-Reason2-2B y adaptador Molmo congelado |
| Parametros totales | 3.144.022.064 (3,14 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (incluye shards del modelo, estado de optimizador/scheduler/RNG y snapshot del código fuente) |

## Arquitectura y entrenamiento

La arquitectura es una política robótica GR00T-N1.7-3B que combina un VLM congelado (módulos de lenguaje y visión de Qwen3-VL / Cosmos-Reason2-2B) con un experto en acciones entrenable y componentes táctiles también entrenables. La entrada es multimodal: imagen RGB de la cabeza del robot, señales táctiles de las manos izquierda y derecha (45 valores cada una) y estado del robot. La salida es un vector de acción de 54 articulaciones con horizonte de 40 pasos. El adaptador Molmo (25.000 pasos, congelado) predice puntos de referencia una sola vez sobre el primer fotograma de cabeza de cada episodio; esos puntos se materializan como discos magenta opacos RGB(255,0,255) con `radius_fraction=0.03` (tres veces el valor original de 0.01) y permanecen fijos en las coordenadas del primer fotograma. Molmo no forma parte del optimizador de GR00T.

El entrenamiento se realizó sobre dos tareas: Task 905 (mano derecha) y Task 943 (mano izquierda), con 156 episodios de entrenamiento y 18 de validación. Los prompts utilizan la frase "the object at the magenta dot". El checkpoint corresponde al paso de optimizador 10.000 de una ejecución planificada de 30.000 pasos, e incluye shards del modelo, procesador y estadísticas, estado de optimizador/scheduler/RNG, el adaptador Molmo 25k congelado y su backend, y un snapshot del código fuente. El paquete incluye `SHA256SUMS` para verificar la integridad y un fichero `complete.json` cuyo campo `step` debe valer 10000. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset más allá de los episodios citados, ni si se aplicaron RLHF o DPO.

## Capacidades

- Control robótico bimanual: genera acciones de 54 articulaciones con horizonte de 40 pasos a partir de observaciones visuales, táctiles y de estado del robot.
- Percepción visual con referencia por punto: utiliza el adaptador Molmo para localizar el objeto indicado mediante un disco magenta en la primera imagen del episodio.
- Fusión multimodal: integra RGB de cabeza, señales táctiles izquierda y derecha (45 valores cada una) y estado propioceptivo del robot.
- Seguimiento de instrucciones en lenguaje natural: acepta prompts del estilo "the object at the magenta dot".
- Entrenamiento reanudable: el checkpoint incluye estado de optimizador, scheduler y RNG, lo que permite continuar el entrenamiento desde el paso 10.000.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión general, audio ni modo de pensamiento.

## Casos de uso

- Investigación en políticas viso-motoras: el checkpoint sirve como punto de partida para reanudar el entrenamiento hasta los 30.000 pasos previstos, cargando el estado de optimizador y scheduler incluidos.
- Manipulación bimanual con referencia visual: un robot puede recibir la instrucción de actuar sobre el objeto marcado con un disco magenta y generar la secuencia de 54 articulaciones para las manos derecha e izquierda.
- Fusión de señales táctiles y visuales: útil para estudiar cómo el modelo combina 45 valores táctiles por mano con la imagen RGB en tareas de agarre y contacto.
- Reproducción de experimentos: el snapshot del código fuente y el fichero `SHA256SUMS` permiten reconstruir el entorno de inferencia y verificar la integridad del paquete.
- Evaluación de adaptadores de puntos congelados: permite analizar el efecto de MolmoPoint-8B como módulo de localización de objetos sin reentrenarlo, ya que queda fuera del optimizador de GR00T.
- Base para ablaciones sobre congelación de módulos: al mantener congelados los módulos de lenguaje y visión del VLM, facilita comparar el efecto de entrenar solo el experto en acciones y los componentes táctiles.
- Docencia y divulgación: ejemplo didáctico de apilamiento de VLM, adaptador de puntos y política de acciones en un mismo pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el checkpoint no ha establecido éxito en las tareas ni seguridad en un robot motorizado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 3,14 mil millones de parámetros en safetensors, una estimación orientativa en FP16 sería de aproximadamente 6,3 GB solo para los pesos, más el adaptador MolmoPoint-8B (no incluido en el paquete) y las activaciones, lo que eleva el requisito real muy por encima de esa cifra.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cabría esperar GPUs de centro de datos (A100, H100) o consumer de gama alta (RTX 4090), pero no hay confirmación oficial.
- ¿Cabe en GPU consumer? No confirmado; el tamaño de los pesos lo permitiría en GPUs con 16 GB o más, pero la dependencia de MolmoPoint-8B y del entorno de inferencia específico impide asegurarlo.
- Opciones de despliegue: el autor indica instalar el código de `inference_source.tar.gz` y las dependencias de Python correspondientes. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Requisito adicional: el modelo base Ai2 nativo MolmoPoint-8B no está incluido en el paquete; debe obtenerse por separado y proporcionarse su ruta al runtime de Molmo, que verifica la identidad del modelo base.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 10.000 de una ejecución de 30.000; el entrenamiento sigue en marcha y el autor advierte que no ha demostrado éxito en las tareas.
- Sin validación de seguridad: el autor indica explícitamente que el checkpoint no ha establecido seguridad en un robot motorizado; no debe usarse en sistemas físicos sin evaluación adicional.
- Dependencia externa: el modelo base MolmoPoint-8B no está incluido y debe obtenerse por separado; el runtime verifica su identidad, por lo que una versión incorrecta impedirá la carga.
- Alcance muy restringido: entrenado solo para Task 905 (mano derecha) y Task 943 (mano izquierda), con 156 episodios de entrenamiento y 18 de validación; la generalización a otras tareas no está demostrada.
- Referencia visual frágil: el objeto se especifica mediante un disco magenta de radio 0,03 fijado en las coordenadas del primer fotograma; cambios de cámara, oclusiones o movimientos del objeto pueden romper la asociación.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas no disponibles: no se documenta el soporte multilingüe de los prompts.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero aplicables al componente VLM subyacente.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que limita la validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Dongkkka/Task905-943-GR00T-Molmo-R3-10k
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
