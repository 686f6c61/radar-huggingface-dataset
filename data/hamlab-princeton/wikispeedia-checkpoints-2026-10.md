# hamlab-princeton/wikispeedia-checkpoints-2026-10

## Resumen

`hamlab-princeton/wikispeedia-checkpoints-2026-10` no es un modelo único, sino un archivo público de investigación que preserva checkpoints verificados de experimentos de aprendizaje por refuerzo (RL) y ajuste supervisado (SFT) sobre la tarea Wikispeedia. Todos los pesos derivan de dos modelos base de Qwen: `Qwen/Qwen2.5-7B-Instruct` (familia principal del estudio actual) y `Qwen/Qwen2.5-3B-Instruct` (empleado en ejecuciones de prueba históricas). Cada checkpoint es un directorio independiente de Transformers o un adaptador PEFT, almacenado bajo `checkpoints/<estudio>/<ruta-relativa-original>`.

El interés del repositorio es de naturaleza metodológica: documenta si el RL incrementa el uso de edición y atajos frente a una navegación sin edición, y cómo el entrenamiento "neutral" frente al "do-not-edit" modifica ese comportamiento. La model card es explícita al señalar que la disponibilidad de un checkpoint no constituye evidencia de mejora de rendimiento. No se describe ninguna arquitectura propia ni se publican resultados de evaluación en el repositorio.

El artefacto es relevante ahora por su escala (3.772,8 GB de repositorio) y por su enfoque de reproducibilidad: cada entrada del catálogo incluye subcarpeta, revisión fijada y un fichero de metadatos con tamaños y checksums SHA-256 de todos los ficheros originales, lo que permite reconstruir los pesos byte a byte sin cuantización ni conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada de los modelos base Qwen2.5 (no se detalla en la model card) |
| Parametros totales | Dos variantes: ~7B (Qwen2.5-7B-Instruct) y ~3B (Qwen2.5-3B-Instruct); no se especifica el recuento exacto |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no se especifica; depende del checkpoint base Qwen2.5) |
| Tipos de cuantizacion | Ninguna. La model card indica explícitamente que no hay cuantización durante el archivado; se conservan los bytes originales de los pesos. Existe una familia de checkpoints RL en fp32 (`no-interface-rl-fp32-20261010`) |
| Idiomas soportados | No disponible |
| Licencia | `other` / `checkpoint-specific-qwen-licenses`. Los checkpoints derivados de 7B usan Apache-2.0; solo los checkpoints históricos de prueba `qwen25-3b` usan la Qwen Research License |
| Formato de pesos | `safetensors`; directorios de modelo Transformers completos y directorios de adaptadores PEFT |
| Tamano del repositorio | 3.772,8 GB |
| Pipeline declarado | `reinforcement-learning` |
| Libreria | `transformers` |
| Descargas / likes | 0 / 2 |
| Fecha de creacion | 2026-10-13 |
| Ultima actualizacion | 2026-10-20 |

## Arquitectura y entrenamiento

La arquitectura no se describe de forma independiente en el repositorio: cada checkpoint es una derivada fine-tuned de Qwen2.5-3B-Instruct o Qwen2.5-7B-Instruct, por lo que hereda la arquitectura decoder-only de esos modelos base. El repositorio no documenta número de tokens de entrenamiento, composición del dataset ni detalles del pipeline de RLHF/DPO. Lo que sí se detalla es la organización experimental: el estudio principal (`no-interface-training-prompts-20261013/do-not-edit`) entrena con herramientas de edición aún disponibles, en una etapa SFT de cuatro épocas en curso, y publica inicializadores SFT seleccionados y exportaciones RL posteriores a medida que están disponibles.

Las familias experimentales cubren varias condiciones: SFT con datos originales y CoT activado/desactivado con filtrado por éxito de objetivo y de camino más corto (`no-interface-reasoning-20261009`), brazos de SFT solo de navegación sin demostraciones de edición (`no-interface-navigation-only-20261010`) y un protocolo RL corregido con recompensas de llegada y de camino más corto (`no-interface-rl-fp32-20261010`). La estructura de carpetas identifica el inicializador SFT y la recompensa RL de cada ejecución. Los checkpoints intermedios que se almacenaban como archivos delta sin pérdida se reconstruyen a sus ficheros de modelo originales antes de la subida; no hay mezcla de brazos experimentales. `legacy-catalog.json` recoge 14 carpetas históricas bajo `runs/`, incluidas ejecuciones de prueba de 3B y 7B, de las cuales tres reutilizan un checkpoint ya verificado del catálogo principal.

## Capacidades

- Generación de texto y razonamiento en el dominio acotado de Wikispeedia: navegación entre artículos de Wikipedia mediante enlaces, con objetivo y camino más corto evaluables.
- Encadenamiento de razonamiento (chain-of-thought) con brazos explícitos de CoT activado y desactivado, lo que permite comparar el efecto del razonamiento explícito en el éxito de la tarea.
- Navegación con y sin herramientas de edición: el estudio `do-not-edit` mantiene las herramientas de edición disponibles durante el entrenamiento para medir su uso.
- Ajuste por refuerzo con dos señales de recompensa documentadas: llegada al objetivo y éxito en el camino más corto.
- Adaptadores PEFT: parte de los checkpoints son adaptadores que se cargan sobre `Qwen/Qwen2.5-7B-Instruct` cargado explícitamente como base.
- Capacidades generales de los modelos base Qwen2.5-Instruct (código, matemáticas, multilingüismo, tool calling) presentes de forma heredada, aunque no evaluadas ni documentadas en este repositorio.
- No se documentan capacidades de visión, audio ni modo "thinking" específico.

## Casos de uso

- Reproducción de experimentos de RL sobre tareas de navegación: descargar un checkpoint concreto mediante `restore.py --id CHECKPOINT_ID`, verificar los SHA-256 de `metadata/<id>.json` y reejecutar la evaluación con el mismo estado de pesos que el autor original.
- Estudio de la disociación entre edición y navegación: comparar los brazos `no-interface-navigation-only-20261010` y `do-not-edit` para medir cuánto del rendimiento depende de atajos de edición frente a navegación genuina por enlaces.
- Investigación sobre recompensas compuestas: analizar cómo la combinación de recompensa de llegada y de camino más corto en `no-interface-rl-fp32-20261010` altera la política aprendida, usando los rollouts guardados en el dataset de evidencias.
- Auditoría de protocolos de SFT: los checkpoints inicializadores permiten aislar el efecto de la etapa SFT de cuatro épocas antes de cualquier RL, útil para diseñar ablaciones propias.
- Base para fine-tuning con PEFT: los adaptadores publicados sirven como punto de partida de experimentos propios sobre Qwen2.5-7B-Instruct sin necesidad de reentrenar desde cero.
- Docencia y revisión metodológica: el repositorio ejemplifica buenas prácticas de archivado (catálogo con campo `available`, revisión fijada, checksums, reconstrucción de deltas sin pérdida) aplicables a otros proyectos de investigación con modelos.
- Análisis de razonamiento guardado: el dataset compañero conserva token IDs originales del entrenador y respuestas decodificadas legibles, lo que permite estudiar trazas de CoT sin reejecutar inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a un informe de experimentos fechado (con posible acceso restringido al propietario) para evaluaciones y matices de protocolo, y advierte explícitamente de que la disponibilidad de un checkpoint no es evidencia de mejora de rendimiento. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni métricas específicas de Wikispeedia.

## Requisitos de hardware

- Almacenamiento: el repositorio completo ocupa 3.772,8 GB. La descarga selectiva por `subfolder` y `revision` es imprescindible; no se debe clonar el repo entero sin prever ~3,8 TB de disco.
- VRAM de inferencia para la variante 3B: aproximadamente 6,2 GB en fp16 solo para pesos, y del orden de 8-10 GB contando KV cache y overhead del runtime (estimación a partir del número de parámetros, no publicada por el autor).
- VRAM de inferencia para la variante 7B: aproximadamente 15,2 GB en fp16 solo para pesos, y del orden de 18-20 GB con overhead (estimación propia).
- Checkpoints RL en fp32: duplican aproximadamente el requisito de pesos, es decir, ~12,4 GB para 3B y ~30,4 GB para 7B.
- GPU consumer: la variante 3B cabe en tarjetas de 12-16 GB (RTX 4070, 4060 Ti 16 GB) en fp16 ajustado; la variante 7B en fp16 requiere 24 GB (RTX 3090, RTX 4090) o bien cuantización posterior a la descarga, que el archivo no proporciona.
- GPU de datacenter: A100 40/80 GB y H100 recomendas para ejecutar la variante 7B en fp32 sin cuantizar y para barridos comparativos de varios checkpoints en paralelo.
- Despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained(repo, subfolder=..., revision=...)`; PEFT para los adaptadores; vLLM y TGI son opciones viables una vez descargado y verificado el checkpoint; llama.cpp y Ollama requerirían convertir los pesos a GGUF, conversión que el archivo no incluye.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hamlab-princeton/wikispeedia-checkpoints-2026-10` | ~3B y ~7B (dos familias) | No disponible | Archivo de checkpoints SFT/RL para investigación en Wikispeedia | Mixta: Apache-2.0 (7B) y Qwen Research License (3B histórico) | HuggingFace, 0 descargas, 3,77 TB |
| `Qwen/Qwen2.5-7B-Instruct` | ~7B | No disponible en la informacion proporcionada | Modelo instructivo de proposito general | Apache-2.0 | HuggingFace, ampliamente distribuido |
| `Qwen/Qwen2.5-3B-Instruct` | ~3B | No disponible en la informacion proporcionada | Modelo instructivo de proposito general, orientado a recursos limitados | Qwen Research License | HuggingFace |

La comparación relevante no es de rendimiento sino de naturaleza del artefacto: frente a los modelos base, este repositorio aporta estados de pesos intermedios y finales de un protocolo experimental concreto, no un modelo listo para producción. Cualquier comparación de calidad requeriría las evaluaciones del informe referenciado, que no están incluidas en la información disponible.

## Limitaciones y advertencias

- No es un modelo de propósito general: es un archivo de checkpoints de investigación. Muchos de ellos son estados intermedios de entrenamiento y pueden no ser útiles fuera del protocolo original.
- No se han publicado evaluaciones, métricas ni comparativas de rendimiento en el repositorio; la model card advierte que la disponibilidad no implica mejora.
- Un checkpoint solo es utilizable si su campo `available` es `true` en `catalog.json` o `legacy-catalog.json`; las entradas planificadas no deben descargarse.
- Licencias heterogéneas por checkpoint: los derivados de 7B son Apache-2.0, pero los checkpoints históricos `qwen25-3b` quedan bajo la Qwen Research License, con posibles restricciones de uso comercial. Es necesario revisar `LICENSE` y `NOTICE` de cada carpeta antes de cualquier uso en producción.
- Los adaptadores PEFT conservan una ruta local al modelo base en su configuración original; hay que cargar `Qwen/Qwen2.5-7B-Instruct` explícitamente antes de aplicar el adaptador, o la carga fallará.
- Riesgo de alucinación y sesgos: no documentados para estos checkpoints. Al derivar de Qwen2.5-Instruct, heredan los sesgos y el comportamiento del modelo base, no evaluados aquí.
- Dominio muy restringido (Wikispeedia): el ajuste puede degradar el rendimiento fuera de la tarea de navegación, y no se han medido efectos de olvido catastrófico.
- Idiomas soportados no disponibles; no se puede asumir cobertura multilingüe más allá de la del modelo base.
- El repositorio no contiene datasets de entrenamiento, conversaciones en bruto, credenciales ni estado de reanudación de optimizador/RNG, lo que limita la reproducibilidad exacta del entrenamiento (aunque no de la inferencia).
- Coste de infraestructura: 3,77 TB de almacenamiento y verificación SHA-256 de todos los ficheros; la descarga completa no es práctica en entornos de desarrollo convencionales.
- El informe de experimentos enlazado puede requerir acceso del propietario, lo que impediría contrastar los resultados de forma independiente.
- La búsqueda web realizada no ha devuelto resultados relevantes sobre este modelo; no se han podido verificar fuentes externas.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/hamlab-princeton/wikispeedia-checkpoints-2026-10
- Dataset de evidencias compañero: https://huggingface.co/datasets/od2961/wikispeedia-evidence-2026-10
- Informe de experimentos fechado (puede requerir acceso del propietario): https://wikispeedia-evidence-oct6.ldaliberti.chatgpt.site/
- Licencia Qwen Research License aplicada a los checkpoints históricos de 3B: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Modelo base principal: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Modelo base de las ejecuciones históricas: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Ficheros de licencia y atribución del repositorio: `LICENSE` y `NOTICE` en la raíz del repositorio
