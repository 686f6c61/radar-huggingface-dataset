# anguoyang/qwen3-vl-2b-vision-onnx-rk3588

## Resumen

`anguoyang/qwen3-vl-2b-vision-onnx-rk3588` es un artefacto de conversion intermedia: la torre de vision del modelo Qwen3-VL-2B-Instruct exportada a formato ONNX para integrarse en el pipeline multimodal de RKNN-LLM sobre SoCs Rockchip RK3588. No es un modelo completo ni un checkpoint entrenado de nuevo: es el primer paso (ONNX) de una cadena de tres etapas (ONNX → RKNN → placa) que busca ejecutar un modelo vision-lenguaje de 2B parametros en hardware de borde. Lo publica el usuario anguoyang como parte de una coleccion de conversiones para RK3588.

Su relevancia es acotada pero concreta: el autor documenta que el pipeline equivalente con Qwen2-VL-2B falla en el optimizador cerrado de RKLLM 1.3.1 (error `'mrope_section'` tanto en w8a8 como en w8a8_g128, y w4a16 rechazado de plano para export multimodal en rk3588), por lo que Qwen3-VL se plantea como ruta de reemplazo. El artefacto se publica explicitamente como export unicamente: no se ha convertido a RKNN ni se ha medido en placa, y el autor no reclama cifras de velocidad.

El modelo base, Qwen3-VL-2B-Instruct, pertenece a la familia Qwen3-VL de Alibaba Qwen y esta pensado para tareas multimodales (imagen + texto) con licencia Apache-2.0. Este repositorio no contiene los pesos del modelo de lenguaje, solo el encoder visual en ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer (torre visual de Qwen3-VL-2B-Instruct) exportada a ONNX |
| Parametros totales | no disponible (el artefacto ONNX ocupa 1.628.459.710 bytes; el modelo base es de 2B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el artefacto procesa una imagen de 448x448 por inferencia) |
| Tipos de cuantizacion | no disponible (el ONNX se distribuye sin cuantizar; la cadena prevista es RKNN con w8a8 / w8a8_g128 segun RKLLM) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`qwen3-vl_vision.onnx`) |

## Arquitectura y entrenamiento

El artefacto contiene unicamente la torre de vision del modelo Qwen3-VL-2B-Instruct, exportada con la ruta `export/export_vision.py` del demo multimodal de rknn-llm. La exportacion se realizo en un host x86_64 con GPU RTX 3090 (CUDA), con `--batch_size 1 --height 448 --width 448`. La entrada es una imagen de 448x448 y la salida son embeddings de imagen con forma `[196, 2048]` (196 tokens visuales de 2048 dimensiones). El fichero resultante tiene 1.628.459.710 bytes y sha256 `8aa4f82f5047fd51025d205043b9bf7f97192f8ebdde506f04b659b4b97bcd07`.

No hay entrenamiento propio ni ajuste fino: es una conversion de pesos de un modelo ya entrenado. El autor documenta dos restricciones de version que costaron tres intentos fallidos: transformers 5.8.0 no expone el atributo `.visual` en la clase Qwen3VL (hay que usar 4.57.3, verificado con una sonda de meta-tensores antes de fijar la version), y onnx 1.16.2 requiere protobuf 4.25.4 (las wheels mas recientes de onnx exigen protobuf 5.x, incompatible con el entorno fijado). El export completo solo tuvo exito al cuarto intento.

## Capacidades

- Extraccion de embeddings visuales: dado un tensor de imagen 448x448, produce 196 embeddings de 2048 dimensiones listos para alimentar la mitad de lenguaje del pipeline multimodal.
- No incluye generacion de texto: el decoder LLM no forma parte de este repositorio.
- No incluye tool calling, function calling ni razonamiento multi-paso por si mismo; esas capacidades residen en el modelo base Qwen3-VL-2B-Instruct y en la mitad de lenguaje que aun no se ha exportado.
- Idiomas del modelo base: ingles y chino (segun los metadatos del repositorio).
- Pensado para despliegue en hardware de borde Rockchip RK3588 mediante la cadena ONNX → RKNN.
- No verificado en placa: el autor no reclama ninguna capacidad medida en hardware real.

## Casos de uso

- Prototipado de pipelines VLM en RK3588: el ONNX sirve como entrada directa a rknn-toolkit2 para generar el modelo RKNN del encoder visual, primer paso antes de integrar la mitad de lenguaje.
- Evaluacion de viabilidad de Qwen3-VL frente a Qwen2-VL en RK3588: dado el fallo documentado de Qwen2-VL-2B en el optimizador de RKLLM 1.3.1, este artefacto permite comprobar si la ruta Qwen3-VL evita el error de `mrope_section`.
- Reproducibilidad de exportaciones: el autor publica comando exacto, versiones de dependencias y hash, de modo que un equipo puede reproducir el ONNX en su propio host y verificar la integridad del fichero.
- Base para demos multimodales en dispositivos de bajo consumo: una vez convertido a RKNN, encaja en escenarios de inspeccion visual en camara o domotica donde no hay GPU dedicada.
- Benchmarking de hardware de borde: el autor mantiene una coleccion (`rk-bench`) con un protocolo comun de medicion; este encoder se integraria en esa comparativa una vez ejecutado en placa.
- Investigacion sobre cuantizacion en NPU: permite experimentar con w8a8 y w8a8_g128 en la NPU del RK3588 sobre una torre visual real, un caso menos explorado que los LLM de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que el artefacto no se ha medido en placa y que no se reclama ninguna cifra de velocidad.

## Requisitos de hardware

- Inferencia del ONNX: no medida; el fichero pesa aproximadamente 1,63 GB en precision original, por lo que en FP32 requiere del orden de 2 GB de memoria solo para los pesos.
- Host de exportacion usado por el autor: x86_64 con RTX 3090 (CUDA). La exportacion tambien puede hacerse en CPU, aunque mas lenta.
- Hardware objetivo: SoC Rockchip RK3588 (NPU), previa conversion a RKNN con rknn-toolkit2.
- Despliegue: rknn-llm (demo multimodal), rknn-toolkit2 para la conversion y ONNX Runtime para validar el ONNX en el host.
- No se proporcionan datos de latencia ni de throughput. Cualquier cifra de rendimiento en RK3588 seria especulativa hasta que el autor publique la medicion end-to-end.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Estado en RK3588 |
|---|---|---|---|---|---|
| qwen3-vl-2b-vision-onnx-rk3588 (este) | torre visual de un 2B | ONNX | no disponible | Apache-2.0 | Export ONNX; RKNN pendiente |
| Qwen2-VL-2B (via rknn-llm) | 2B | RKLLM | no disponible | Apache-2.0 | Falla en RKLLM 1.3.1 (`mrope_section`) |
| Qwen3-0.6B (texto, coleccion rkllm) | 0,6B | RKLLM | no disponible | Apache-2.0 | Ya funciona en RK3588 |

La comparativa se limita a la informacion aportada por el autor en la model card; no hay datos de rendimiento comparables entre estas opciones.

## Limitaciones y advertencias

- Artefacto incompleto: solo contiene el encoder visual. No puede generar texto ni responder preguntas por si mismo.
- Sin validacion en hardware: no se ha convertido a RKNN ni ejecutado en una placa RK3588; el rendimiento real es desconocido.
- Dependencias fragiles: requiere transformers 4.57.3 y onnx 1.16.2 con protobuf 4.25.4; versiones mas recientes rompen la exportacion.
- Restricciones del pipeline RKLLM: segun el autor, w4a16 no esta soportado para export multimodal en rk3588 y w8a8/w8a8_g128 fallan con Qwen2-VL, lo que limita las opciones de cuantizacion de la mitad de lenguaje.
- Distribucion atipica: el fichero ONNX se aloja como asset de una release de GitHub, no en el propio repositorio de Hugging Face, lo que anade un punto de fallo externo.
- Idiomas: solo ingles y chino declarados; el castellano no esta cubierto de forma explicita.
- Sin uso comercial verificado en el borde: la licencia Apache-2.0 del modelo base lo permite, pero la cadena RKNN/RKLLM de Rockchip tiene sus propias condiciones que conviene revisar.
- Conversion de la comunidad: no esta afiliada a Qwen ni a Rockchip, por lo que no hay soporte oficial.
- Riesgo de alucinacion y sesgos: no evaluables en este artefacto, al no incluir el componente generativo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/anguoyang/qwen3-vl-2b-vision-onnx-rk3588
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Descarga del ONNX (GitHub Release): https://github.com/anguoyang/rk-bench/releases/download/qwen3-vl-2b-vision-onnx-20261117/qwen3-vl_vision.onnx
- Repositorio rk-bench del autor: https://github.com/anguoyang/rk-bench
