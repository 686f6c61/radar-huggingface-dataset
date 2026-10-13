# od2961/wikispeedia-checkpoints-2026-10

## Resumen

`od2961/wikispeedia-checkpoints-2026-10` no es un unico modelo entrenado, sino un archivo publico de investigacion que preserva todos los checkpoints de SFT y de aprendizaje por refuerzo (RL) de experimentos Wikispeedia completados o detenidos, con fecha de corte del 13 de octubre de 2026. Lo publica el usuario od2961 y esta construido sobre modelos base de la familia Qwen2.5 (Qwen2.5-3B-Instruct y Qwen2.5-7B-Instruct), por lo que cada checkpoint es un derivado de esos modelos, no una arquitectura nueva.

El problema que resuelve es de reproducibilidad y trazabilidad: los experimentos de RL suelen dejar multitud de ramas intermedias que se pierden. Este repositorio conserva cada checkpoint como un directorio independiente de Transformers o como un adaptador PEFT, sin cuantizar, sin fusionar brazos experimentales y sin convertir pesos, e incluye un `catalog.json` y un `legacy-catalog.json` con subcarpeta, revision y checksums SHA-256 para restaurar los ficheros originales byte a byte.

Su relevancia es acotada y muy especifica: sirve para investigar si el RL con prompts neutros incrementa el uso de edicion o atajos frente a una navegacion sin edicion. El propio autor advierte que la disponibilidad del modelo no es evidencia de mejor rendimiento. El repositorio ocupa 524,5 GB y tiene 0 descargas y 0 likes en el momento de la consulta, lo que confirma su caracter de material de investigacion mas que de modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5; no se declara arquitectura propia) |
| Parametros totales | 3B y 7B segun checkpoint (modelos base Qwen2.5-3B-Instruct y Qwen2.5-7B-Instruct) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No se aplica cuantizacion en el archivo; se preservan los pesos originales sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | `checkpoint-specific-qwen-licenses`; los checkpoints derivados de 7B usan Apache-2.0 y los checkpoints historicos de smoke test `qwen25-3b` usan Qwen Research License |
| Formato de pesos | safetensors (directorios de Transformers) y adaptadores PEFT |
| Tamano del repositorio | 524,5 GB |
| Pipeline declarado | reinforcement-learning |
| Libreria | transformers |
| Modelos base | Qwen/Qwen2.5-7B-Instruct, Qwen/Qwen2.5-3B-Instruct |
| Etiqueta de despliegue | endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de los modelos base Qwen2.5 (transformer decoder-only), ya que el archivo no introduce ninguna arquitectura nueva: almacena derivados de SFT y de RL. Cada checkpoint es un directorio de modelo de Transformers independiente o un adaptador PEFT situado bajo `checkpoints/<study>/<original-relative-checkpoint-path>`. Los adaptadores PEFT historicos conservan su configuracion original, incluida una ruta local al modelo base, por lo que para cargarlos hay que instanciar explicitamente `Qwen/Qwen2.5-7B-Instruct` y despues aplicar el adaptador con PEFT.

En cuanto al entrenamiento, el archivo documenta varias familias experimentales. `no-interface-reasoning-20261009` corresponde a SFT sobre datos originales con CoT activado y desactivado y filtrado por exito de objetivo y de ruta mas corta, ademas de un protocolo RL anterior mantenido por separado. `no-interface-navigation-only-20261010` recoge brazos de SFT de solo navegacion sin editar demostraciones. `no-interface-rl-fp32-20261010` aplica el protocolo RL corregido con recompensas de llegada y de ruta mas corta, y su estructura de carpetas identifica el inicializador SFT y la recompensa RL. El propio autor subraya que estos protocolos son distintos y no deben agruparse. La pregunta de investigacion central es si el RL con prompts neutros aumenta el uso de edicion o atajos o si mejora la navegacion sin editar.

El archivo no contiene conjuntos de datos de entrenamiento, conversaciones en crudo, credenciales ni estado de reanudacion de optimizador o RNG. Los modelos intermedios que antes se guardaban como archivos de delta sin perdida se reconstruyeron a sus ficheros originales antes de la subida, sin cuantizacion ni fusion. `legacy-catalog.json` recoge 14 carpetas de checkpoints antiguas bajo `runs/`, incluidas ejecuciones de prueba de 3B y 7B; tres de esas entradas reutilizan el mismo checkpoint ya verificado del catalogo principal.

## Capacidades

- Generacion de texto y razonamiento en la forma heredada de los modelos base Qwen2.5-Instruct, incluida capacidad de cadena de pensamiento (CoT) segun el brazo experimental.
- Navegacion y resolucion de tareas tipo Wikispeedia: los checkpoints estan entrenados para navegar grafos de articulos y alcanzar objetivos, con recompensas de llegada y de ruta mas corta.
- SFT supervisado y RL sobre esos mismos entornos, con brazos que activan o desactivan el razonamiento explicito.
- Soporte de tool calling / function calling: no disponible de forma especifica en la informacion proporcionada; solo se puede asumir la herencia de Qwen2.5-Instruct.
- Soporte de agentes y razonamiento multi-paso: implicito en el diseno de los experimentos de navegacion, pero no se documenta como capacidad de producto.
- Capacidades multilingues: no disponible.
- Capacidades especiales: existen brazos con CoT on/off y checkpoints PEFT, pero no se declaran modos de vision, audio ni thinking mode propios.

## Casos de uso

- Reproduccion de experimentos de RL: cargando un checkpoint concreto del catalogo (`subfolder` + `revision`) se puede reanudar la evaluacion de un brazo experimental y comparar sus resultados con las condiciones del informe fechado que acompania al proyecto.
- Auditoria de trazabilidad: gracias a `metadata/<id>.json`, que lista tamano original y SHA-256 de cada fichero, un equipo puede verificar que los pesos descargados coinciden byte a byte con los originales antes de usarlos en un analisis.
- Estudio del efecto del RL con prompts neutros: los brazos `no-interface-rl-fp32-20261010` y `no-interface-reasoning-20261009` permiten medir si el RL incrementa el uso de edicion o mejora la navegacion sin editar, que es la pregunta de investigacion declarada.
- Analisis de la cadena SFT a RL: los adaptadores PEFT conservan su configuracion original, de modo que se puede reconstruir la lineage entre inicializador SFT y recompensa RL usando los indices del dataset de evidencia asociado.
- Punto de partida para fine-tuning posterior: los checkpoints de 7B (Apache-2.0) parten de Qwen2.5-7B-Instruct y pueden reutilizarse como inicializacion para nuevos estudios de navegacion o de decision secuencial.
- Investigacion sobre cadenas de pensamiento: los brazos con CoT on/off permiten comparar si el razonamiento explicito mejora la tasa de exito en tareas de navegacion con el mismo presupuesto de datos.
- Docencia y formacion en RL para agentes: el archivo, junto con el dataset `wikispeedia-evidence-2026-10`, sirve como material didactico con protocolos de recompensa, filtrado y evaluacion documentados.
- Comparacion de protocolos de seguridad en agentes: al separar los brazos de edicion y de solo navegacion, es posible estudiar el comportamiento de atajos y edicion no deseada bajo politicas de recompensa distintas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a un informe de experimentos fechado, pero advierte que puede requerir acceso del propietario y no incluye cifras en el texto proporcionado. No se inventan numeros.

## Requisitos de hardware

- Tamano del archivo completo: 524,5 GB en el repositorio, pero no es lo que se carga en memoria; cada checkpoint se descarga y carga por separado.
- VRAM estimada para un checkpoint de 7B en FP16/BF16: en torno a 14-16 GB, estimacion derivada del numero de parametros del modelo base.
- VRAM estimada para un checkpoint de 7B en 4 bits: en torno a 5-6 GB, estimacion, ya que el archivo no incluye pesos cuantizados y habria que cuantizar por separado.
- VRAM estimada para un checkpoint de 3B en FP16/BF16: en torno a 6-7 GB.
- VRAM estimada para un checkpoint de 3B en 4 bits: en torno a 2-3 GB.
- GPU de consumo: los checkpoints de 3B caben en tarjetas con 12-16 GB (por ejemplo, RTX 3060 12 GB o RTX 4060 Ti 16 GB) en FP16, y con holgura si se cuantizan; los de 7B en FP16 encajan en GPU de 24 GB (RTX 3090/4090) o requieren cuantizacion para 8-16 GB.
- GPU de centro de datos: A100, H100 o similares para servirlos en precision completa y con concurrencia.
- Opciones de despliegue: Transformers con `AutoModelForCausalLM` indicando `subfolder` y `revision`; PEFT para los adaptadores; la etiqueta `endpoints_compatible` indica compatibilidad con HF Inference Endpoints. No se incluye GGUF, por lo que llama.cpp u Ollama requeririan una conversion previa.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de resultados de rendimiento para comparar numericamente. La comparacion se limita a caracteristicas verificables frente a los modelos base y a un hipotetico archivo de checkpoints equivalente.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| od2961/wikispeedia-checkpoints-2026-10 | 3B y 7B segun checkpoint | No disponible | Especifica por checkpoint; 7B Apache-2.0, smoke test 3B Qwen Research License | safetensors + PEFT | Archivo de investigacion, 524,5 GB, sin cuantizar |
| Qwen/Qwen2.5-7B-Instruct | 7B | No disponible en esta ficha | Apache-2.0 | safetensors | Modelo base de los checkpoints 7B |
| Qwen/Qwen2.5-3B-Instruct | 3B | No disponible en esta ficha | Qwen Research License | safetensors | Modelo base de los smoke tests 3B |

No se identifican en la busqueda web otros archivos de checkpoints de investigacion comparables especificos de Wikispeedia.

## Limitaciones y advertencias

- No es un modelo final: es un archivo de checkpoints con brazos experimentales distintos que el propio autor pide no agrupar ni fusionar.
- La disponibilidad del modelo no implica mejor rendimiento; los resultados dependen del protocolo y no se aportan cifras en la informacion disponible.
- Riesgo de alucinacion y de comportamiento erratico: al tratarse de checkpoints de SFT/RL sobre tareas de navegacion, no hay garantia de calidad en tareas de proposito general.
- Idiomas soportados no disponibles: no se puede confirmar cobertura multilingue mas alla de lo heredado de Qwen2.5.
- Longitud de contexto no declarada en la ficha del archivo.
- Restricciones de licencia: la licencia es especifica por checkpoint; los derivados de 7B usan Apache-2.0, pero los smoke tests historicos de 3B usan la Qwen Research License, que restringe el uso comercial. Hay que revisar `LICENSE` y `NOTICE` antes de cualquier uso en produccion.
- Ausencia de pesos cuantizados: no hay GGUF ni variantes de 4 bits listas para usar, lo que anade un paso de conversion para despliegues ligeros.
- El archivo no contiene datasets, conversaciones ni estado de optimizador, por lo que no permite reanudar entrenamientos, solo evaluar o reutilizar los pesos.
- Estado de subida en curso segun la model card: una entrada solo es utilizable cuando su campo `available` es `true`.
- Cero descargas y cero likes en el momento de la consulta: no existe validacion por parte de la comunidad.
- El informe de experimentos referenciado puede requerir acceso del propietario, lo que limita la verificacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/od2961/wikispeedia-checkpoints-2026-10
- Dataset de evidencia asociado: https://huggingface.co/datasets/od2961/wikispeedia-evidence-2026-10
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Modelo base Qwen2.5-3B-Instruct y su licencia: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct y https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Informe de experimentos fechado (puede requerir acceso del propietario): https://wikispeedia-evidence-oct6.ldaliberti.chatgpt.site/
