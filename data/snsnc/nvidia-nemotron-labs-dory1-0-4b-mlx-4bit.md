# snsnc/NVIDIA-Nemotron-Labs-Dory1.0-4B-mlx-4bit

## Resumen

NVIDIA-Nemotron-Labs-Dory1.0-4B-mlx-4bit es una cuantizacion de 4 bits en formato MLX del modelo base `nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16`, desarrollado por NVIDIA. La conversion la ha realizado el usuario snsnc y esta pensada para ejecutar el modelo en Apple Silicon (chips M1/M2/M3/M4) mediante la libreria `dory-mlx`, que anade soporte para la arquitectura Dory a MLX-LM. El modelo cuenta con 3.975.229.440 parametros (aproximadamente 4B) y un repositorio de 2,3 GB en pesos de 4 bits.

La relevancia de esta ficha radica en que permite desplegar un modelo de 4B parametros de NVIDIA en hardware de consumo de Apple, algo que con el formato BF16 original requeriria aproximadamente 8 GB de memoria. La cuantizacion a 4 bits con group-size 64 reduce el peso a menos de la mitad, facilitando la inferencia local en portatiles y equipos de sobremesa con memoria unificada.

Es importante senalar que, a fecha de la informacion disponible, la arquitectura `dory` no esta incluida en el repositorio upstream de `mlx-lm`, por lo que es necesario instalar el paquete `dory-mlx` para cargar el modelo. Se trata de una cuantizacion pura, sin entrenamiento adicional ni fusion de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dory (arquitectura propia de NVIDIA Nemotron-Labs, no incluida en mlx-lm upstream) |
| Parametros totales | 3.975.229.440 (~4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group-size 64 (MLX) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (pesos); empaquetado MLX bajo Apache-2.0 |
| Formato de pesos | safetensors (MLX, 4-bit) |

## Arquitectura y entrenamiento

La arquitectura del modelo es Dory, una arquitectura propia de NVIDIA Nemotron-Labs que no esta presente en la version upstream de `mlx-lm` a fecha de 19 de octubre de 2026. El repositorio no proporciona detalles sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa. El modelo base es `nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16`, del que esta version es una conversion directa.

El proceso de conversion se realizo con `mlx_lm.convert -q --q-bits 4 --q-group-size 64`. No hubo entrenamiento, merging ni ninguna otra modificacion de los pesos: es exclusivamente una cuantizacion. Por tanto, los datos de entrenamiento, la composicion del dataset y si hubo RLHF o DPO no se detallan en la informacion disponible y deben consultarse en la model card del modelo base de NVIDIA.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation` y las etiquetas incluyen `conversational`.
- Razonamiento y matematicas: la model card incluye un ejemplo de pregunta aritmetica ("What is 17 * 23?"), lo que sugiere capacidad de calculo basico, aunque no se documentan resultados.
- Soporte de chat multi-turno mediante la funcion `dory_mlx.chat`.
- Parametro `loops` en la API de carga e inferencia (ejemplo con `loops=2`), lo que apunta a un mecanismo de iteracion o recurrencia interna en la arquitectura Dory; su significado exacto no se documenta.
- Capacidades multilingues: no disponibles.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede cargarse con `dory_mlx.chat` en un equipo Apple Silicon y mantener conversaciones multi-turno sin conexion a internet, gracias a que los pesos de 4 bits ocupan unos 2,3 GB.
- Prototipado rapido de aplicaciones de texto en portatiles: desarrolladores que trabajen en macOS pueden integrar el modelo en scripts Python con pocas lineas y sin GPU dedicada, usando la memoria unificada del chip.
- Pruebas de razonamiento aritmetico y logico: el ejemplo de la model card sugiere su uso para validar respuestas de calculo; util en entornos educativos o de demostracion.
- Evaluacion de la arquitectura Dory: investigadores interesados en comparar el comportamiento de esta arquitectura frente a transformers clasicos pueden usar esta version cuantizada para experimentos preliminares en hardware de consumo.
- Generacion de texto en herramientas de linea de comandos: la invocacion `python -m dory_mlx` permite incorporar el modelo en pipelines de shell o scripts de automatizacion de texto.
- Base para ajuste fino ligero o experimentacion con prompts: al ser una cuantizacion MLX, sirve como punto de partida para explorar tecnicas de prompting y evaluacion sin necesidad de infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explicitamente de que la cuantizacion a 4 bits pierde precision y que las salidas se desvian ligeramente del BF16, por lo que los benchmarks del modelo original podrian no reproducirse. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 2,3 GB para los pesos en 4 bits, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 4-6 GB de memoria unificada disponible.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante MLX.
- GPU NVIDIA: no aplicable directamente, ya que el formato es MLX; para CUDA habria que usar el modelo base BF16 con otras herramientas.
- Cabe en GPU de consumo: si, en equipos Apple con memoria unificada suficiente; no esta pensado para GPUs discretas.
- Opciones de despliegue: `dory-mlx` (requerido, ya que `mlx-lm` upstream no soporta la arquitectura Dory), con API Python (`dory_mlx.load`, `dory_mlx.chat`) y CLI (`python -m dory_mlx`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-Labs-Dory1.0-4B-mlx-4bit | ~4B | no disponible | MLX 4-bit | OpenMDW-1.1 | Hugging Face (snsnc) |
| nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16 | ~4B | no disponible | safetensors BF16 | OpenMDW-1.1 | Hugging Face (NVIDIA) |
| Alternativas de ~4B en MLX | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para comparar con alternativas concretas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 4 bits introduce perdida de precision; las salidas pueden desviarse del modelo BF16 original y los benchmarks del modelo base podrian no reproducirse.
- La arquitectura Dory no esta soportada por `mlx-lm` upstream a fecha de octubre de 2026; es obligatorio instalar `dory-mlx`, lo que anade una dependencia externa y riesgo de mantenimiento.
- El modelo esta limitado a Apple Silicon; no es portable a CUDA ni a otros backends sin reconversion.
- No se documentan sesgos conocidos, riesgos de alucinacion especificos ni limitaciones de idioma en la informacion disponible.
- La licencia de los pesos es OpenMDW-1.1, con terminos que deben consultarse en la model card de NVIDIA; el empaquetado MLX sigue Apache-2.0. Es responsabilidad del usuario verificar las restricciones de uso comercial.
- El parametro `loops` de la API no esta documentado en detalle; su efecto en calidad y latencia es desconocido.
- Repositorio con muy pocas descargas (366) y un solo like, lo que sugiere poca validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/snsnc/NVIDIA-Nemotron-Labs-Dory1.0-4B-mlx-4bit
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16
- Repositorio dory-mlx: https://github.com/internet-projects/dory-mlx
- MLX-LM: https://github.com/ml-explore/mlx-lm
