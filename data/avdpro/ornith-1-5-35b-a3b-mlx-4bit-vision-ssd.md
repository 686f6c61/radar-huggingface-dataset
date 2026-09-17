# Avdpro/Ornith-1.5-35B-A3B-MLX-4bit-Vision-SSD

## Resumen

Ornith-1.5-35B-A3B-MLX-4bit-Vision-SSD es un checkpoint publicado por el usuario Avdpro en HuggingFace bajo licencia MIT. No se trata de un modelo entrenado desde cero, sino de una conversion de formato de almacenamiento byte a byte del checkpoint `Avdpro/Ornith-1.5-35B-A3B-MLX-4bit-Vision` (revision `31428ce8829c277f9255c59662b8efab58898ecf`). La conversion conserva los valores de los tensores y la cuantizacion originales, pero externaliza los expertos enrutados a un directorio `experts/` en lugar de duplicarlos dentro de los safetensors del backbone. El tag `qwen3_5_moe` y el sufijo `Vision` del nombre apuntan a un transformer multimodal de tipo mixture of experts basado en la familia Qwen3.5.

El problema que resuelve es de espacio de instalacion y patron de acceso a datos: al separar los pesos de los expertos enrutados, el backbone queda en 2.448.355.968 parametros reales segun los safetensors, mientras que el resto de pesos (hasta los 35B que sugiere el nombre, con ~3B activos segun la nomenclatura A3B) queda en ficheros externos mapeables desde SSD. El repositorio ocupa 20,4 GB.

Es relevante ahora como artefacto de infraestructura mas que como modelo: exige un runtime AI2Apps con soporte explicito del formato `qwen3.6-affine-q4-gate-up-fused-direct-v3` y no es un checkpoint drop-in para Transformers, mlx-lm ni mlx-vlm. El propio autor indica que el runtime y el paquete de modelo correspondientes no han completado la aceptacion de release, por lo que la compatibilidad de motor end-to-end no esta garantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal con vision, familia Qwen3.5 (tag `qwen3_5_moe`) |
| Parametros totales | 2.448.355.968 en los safetensors del backbone; el nombre declara 35B totales, con los expertos enrutados externalizados en `experts/` |
| Parametros activos | ~3B segun la nomenclatura A3B del nombre (no verificado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit, formato affine q4 con gate-up fusionado (`qwen3.6-affine-q4-gate-up-fused-direct-v3`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | MLX safetensors, con expertos enrutados en payloads safetensors externos dentro de `experts/` |

## Arquitectura y entrenamiento

La arquitectura es un transformer de tipo mixture of experts con componente de vision, segun el tag `qwen3_5_moe` y el sufijo `Vision`. El nombre del repositorio indica 35B parametros totales con 3B activos por token (A3B), lo que encaja con el patron de la familia Qwen3.5 MoE. El indice `model.safetensors.index.json` distingue tensores ordinarios, de vision y otros, lo que confirma la presencia de un tower visual junto al backbone de lenguaje.

No hay informacion disponible sobre datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de alineacion (RLHF, DPO u otras). El autor es explicito al afirmar que esta publicacion no es un nuevo entrenamiento ni una mejora de precision: se trata exclusivamente de un cambio de layout de almacenamiento. La innovacion tecnica reseñable es la externalizacion de los expertos enrutados fuera del backbone, con ficheros auxiliares de procedencia (`ssd-checkpoint.json`), mapa de tensores externos (`external-tensors.json`) y digests SHA-256 de los payloads originales (`source-tensor-sha256.json`).

## Capacidades

- Generacion de texto y razonamiento: capacidades heredadas del checkpoint original `Ornith-1.5-35B-A3B-MLX-4bit-Vision`, no verificadas en esta ficha.
- Procesamiento de vision: el repositorio incluye tensores de vision y el nombre del modelo lo confirma; se trata por tanto de un modelo vision-lenguaje.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, audio, etc.): no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en Apple Silicon con requisitos de espacio reducidos: la externalizacion de expertos permite mapear el backbone y los expertos directamente desde SSD, reduciendo el espacio de instalacion en disco respecto a una copia unica duplicada.
- Investigacion sobre layouts de almacenamiento para MoE: el repositorio incluye ficheros de procedencia y digests que permiten auditar la correspondencia byte a byte con el checkpoint original.
- Verificacion de integridad en pipelines de distribucion de modelos: los digests SHA-256 de los tensores originales permiten validar que una copia descargada no ha sido alterada.
- Pruebas de motores de inferencia personalizados: util como caso de prueba para runtimes que implementen el formato `qwen3.6-affine-q4-gate-up-fused-direct-v3`.
- Reproducibilidad de experimentos sobre cuantizacion 4-bit: al conservar la cuantizacion original sin recuantizar, sirve como referencia para comparar variantes de cuantizacion.
- Evaluacion de acceso a datos mapeados en memoria: permite medir el impacto de la carga diferida de expertos en la latencia de decodificacion sobre almacenamiento SSD.
- Base para fine-tuning multimodal sobre Apple Silicon: una vez disponible el runtime compatible, el checkpoint puede servir como punto de partida para ajuste de tareas de vision-lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La busqueda web asociada no devolvio resultados tecnicos relacionados con el modelo: los unicos enlaces recuperados corresponden a un sitio de catalogacion de series de television (`mijnserie.nl`) y no guardan relacion con este checkpoint.

## Requisitos de hardware

- VRAM y memoria unificada estimadas: el repositorio ocupa 20,4 GB, por lo que se necesita un minimo de 21-24 GB de memoria disponible para cargar backbone y expertos, mas el espacio de cache KV y el tower de vision.
- Al ser un formato MLX, el destino natural es Apple Silicon con memoria unificada: se recomienda un equipo con 32 GB o mas (familias M3 Pro/Max, M4 Pro/Max o M2/M3 Ultra). Un equipo de 24 GB queda en el limite y probablemente obligue a mapear expertos desde SSD.
- GPU NVIDIA: el formato MLX safetensors con expertos externalizados no es compatible con CUDA sin conversion previa; no se puede cargar directamente en A100, H100 o RTX 4090.
- Compatibilidad de despliegue: unicamente un runtime AI2Apps con soporte explicito de `qwen3.6-affine-q4-gate-up-fused-direct-v3`. No es compatible con Transformers, mlx-lm, mlx-vlm, llama.cpp, Ollama, vLLM ni TGI, y el autor advierte de que no se use el safetensors del backbone de forma aislada.
- Latencia y throughput: no disponibles. Al tratarse de un layout con expertos en `mmap` desde SSD, el rendimiento dependera criticamente de la velocidad de lectura secuencial y aleatoria del almacenamiento.

## Comparativa con modelos similares

Los datos de los modelos de comparacion corresponden a informacion publica de sus respectivas familias y no han sido verificados contra este checkpoint.

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato de pesos | Despliegue |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-MLX-4bit-Vision-SSD | 35B declarados / ~3B activos (backbone safetensors: 2,45B) | no disponible | MIT | MLX safetensors 4-bit con expertos externalizados | Solo runtime AI2Apps especifico |
| Qwen3-30B-A3B | 30,5B / 3,3B | 128K nativo | Apache-2.0 | safetensors, GGUF, MLX | Transformers, vLLM, llama.cpp, Ollama, mlx-lm |
| Qwen3-VL-30B-A3B-Instruct | ~30B / ~3B | no disponible | Apache-2.0 | safetensors, GGUF | Transformers, vLLM, llama.cpp |
| Mistral Small 3.1 24B | 24B densos | 128K | Apache-2.0 | safetensors, GGUF | Transformers, vLLM, llama.cpp, Ollama |

La diferencia principal no esta en capacidades sino en portabilidad: los tres modelos de comparacion se pueden desplegar con herramientas estandar, mientras que este checkpoint depende de un runtime que, segun el propio autor, aun no ha completado su aceptacion de release.

## Limitaciones y advertencias

- No es un checkpoint drop-in: requiere un runtime AI2Apps con soporte explicito de `qwen3.6-affine-q4-gate-up-fused-direct-v3`. Cargarlo en Transformers, mlx-lm o mlx-vlm fallara o producira resultados incorrectos.
- No se debe usar el safetensors del backbone de forma aislada: los expertos enrutados estan en `experts/` y su ausencia deja el modelo incompleto.
- Compatibilidad end-to-end no garantizada: el autor indica que el runtime y el paquete de modelo no han completado la aceptacion de release, y que la mera existencia de un mapa de tensores reversible no constituye una garantia de motor.
- Sin benchmarks publicados: no hay mediciones de MMLU, HumanEval, GSM8K ni de tareas de vision que permitan validar la calidad del modelo.
- Sin informacion sobre sesgos, idiomas soportados ni longitud de contexto.
- Riesgo de alucinacion: no evaluado; aplican los riesgos habituales de los modelos de lenguaje de esta familia, agravados por la ausencia de evaluaciones publicadas sobre este checkpoint concreto.
- Licencia MIT declarada en el repositorio, pero el README remite a `LICENSE` y `README.upstream.md` para los terminos y la atribucion del modelo original. Conviene revisar esos ficheros antes de un uso comercial, ya que el checkpoint deriva de un modelo upstream cuya licencia puede imponer condiciones adicionales.
- Repositorio con 0 descargas y 0 likes: sin evidencia de uso en produccion ni validacion por parte de la comunidad.
- Este artefacto no mejora la precision del modelo original; solo cambia el espacio de instalacion y el patron de acceso a datos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Avdpro/Ornith-1.5-35B-A3B-MLX-4bit-Vision-SSD
- Checkpoint de origen: https://huggingface.co/Avdpro/Ornith-1.5-35B-A3B-MLX-4bit-Vision
- Revision de origen: `31428ce8829c277f9255c59662b8efab58898ecf`
- Ficheros de metadatos incluidos: `ssd-checkpoint.json`, `external-tensors.json`, `source-tensor-sha256.json`, `model.safetensors.index.json`
- Directorio de expertos externalizados: `experts/`
- Papers, blogs, repositorios o demos adicionales: no disponible en la informacion proporcionada.
