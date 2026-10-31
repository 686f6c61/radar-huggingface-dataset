# monoradio/motionbricks-soma-fp16-onnx

## Resumen

MotionBricks SOMA (fp16 ONNX) es una reexportacion comunitaria, realizada por el usuario monoradio, del modelo SOMA de NVIDIA MotionBricks, un sistema de generacion de movimiento para personajes (motion generation) a partir de poses de contexto y objetivo. El modelo original se entrena para producir clips de animacion de 64 frames, y esta version convierte los pesos a ONNX en float16 (y una variante con cuantizacion de 8 bits en las matrices MatMul) para poder ejecutarlo directamente en el navegador mediante onnxruntime-web 1.30 sobre WebGPU.

Su relevancia radica en que elimina la necesidad de servidores de inferencia para animacion procedural: la generacion completa ocurre en el cliente, con latencias de unos 145 ms por generacion en un portatil con chip M1 de Apple (115-125 ms en la variante cuantizada a 8 bits). Esto lo hace util para demos interactivas, editores de animacion web y pipelines de character animation en tiempo real.

Cabe subrayar que se trata de un derivado no oficial: no ha sido creado ni avalado por NVIDIA, y hereda la licencia NVIDIA Open Model Agreement del modelo base. El repositorio pesa aproximadamente 0,6 GB y contiene dos ficheros ONNX listos para despliegue web.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: NVIDIA MotionBricks, SOMA) |
| Parametros totales | no disponible (tamanos de fichero: 243 MB q8h, 380 MB fp16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada: poses de contexto y objetivo; salida: 64 frames de movimiento) |
| Tipos de cuantizacion | float16; MatMulNBits 8-bit simetrico por bloques de 32 (solo pesos MatMul) |
| Idiomas soportados | no disponible (modelo no verbal, generacion de movimiento) |
| Licencia | NVIDIA Open Model Agreement (nvidia-open-model-agreement) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La ficha original del modelo base no esta incluida en la informacion disponible, por lo que los detalles de arquitectura (tipo de transformer, atencion, etc.) no pueden confirmarse. Lo que si documenta el repositorio es el proceso de exportacion: el modelo SOMA de NVIDIA MotionBricks se exporta a ONNX y se convierte a float16. Ademas, se genera una variante `mmm_v6_soma_q8h.onnx` en la que unicamente los pesos de las operaciones MatMul se cuantizan a 8 bits en bloques de 32 con cuantizacion simetrica (operador `MatMulNBits` de onnxruntime), manteniendo el resto de la red en float16.

Sobre el entrenamiento del modelo base no hay datos publicados en la informacion disponible (numero de tokens o muestras, composicion del dataset, uso de RLHF/DPO). No aplica el concepto de alineacion por preferencias, dado que se trata de un modelo de generacion de movimiento y no de lenguaje.

## Capacidades

- Generacion de movimiento para personajes: dadas poses de contexto y una pose objetivo como entrada, produce 64 frames de animacion.
- Ejecucion en navegador: exportacion ONNX compatible con onnxruntime-web 1.30 y backend WebGPU.
- Baja latencia en cliente: aproximadamente 145 ms por generacion (fp16) y 115-125 ms (q8h) en un M1 Mac.
- Precisión controlada de la cuantizacion: la variante 8-bit difiere de la salida float32 en 0,0018 de media (float16: 0,0004), sobre salidas de valor medio 0,41.
- Compatibilidad de interfaz: mismas entradas y salidas que el modelo original de NVIDIA, lo que facilita sustituirlo en pipelines existentes.

No hay evidencia de capacidades de texto, codigo, vision, tool calling ni razonamiento: no es un modelo de lenguaje.

## Casos de uso

- Demos interactivas en el navegador: el modelo alimenta una live demo en un HuggingFace Space, generando animaciones sin backend, ideal para mostrar motion generation a usuarios sin instalacion.
- Editores de animacion web: puede integrarse en un editor de personajes en el navegador para autocompletar movimiento entre una pose inicial y una objetivo, con latencias de ~120 ms adecuadas para interaccion fluida.
- Prototipado de videojuegos en WebAssembly/WebGPU: equipos de game design pueden probar comportamientos de animacion procedural directamente en el cliente antes de portarlos a motor.
- Generacion de clips de relleno (in-betweening): dada una pose de contexto y una objetivo, produce 64 frames intermedios, util para rellenar transiciones entre keyframes.
- Pipelines de character animation sin servidor: al ejecutarse en cliente, evita costes de GPU en la nube y problemas de privacidad al no enviar datos de poses a servicios remotos.
- Evaluacion de cuantizacion en dispositivos: la coexistencia de las variantes fp16 y q8h permite comparar precision frente a rendimiento en hardware diverso (el autor documenta diferencias de salida de 0,0004 frente a 0,0018).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible; ademas, al no ser un modelo de lenguaje, tales benchmarks no serian aplicables. Los unicos datos de rendimiento publicados son de latencia en navegador:

| Variante | Latencia en M1 Mac (WebGPU) | Tamano | Desviacion media vs float32 |
|---|---|---|---|
| fp16 | ~145 ms por generacion | 380 MB | 0,0004 |
| q8h (MatMul 8-bit) | 115-125 ms por generacion | 243 MB | 0,0018 |

## Requisitos de hardware

- No requiere VRAM de GPU dedicada: esta pensado para ejecutarse en el navegador via WebGPU, usando la GPU integrada o dedicada del cliente.
- Referencia de rendimiento verificada: portatil con chip Apple M1 (~145 ms fp16, 115-125 ms q8h por generacion). No hay datos para otras GPUs.
- En teoria, cualquier navegador con soporte de WebGPU y onnxruntime-web 1.30 deberia ser compatible; no hay lista oficial de navegadores verificados.
- Alternativa fuera del navegador: el modelo base nvidia/MotionBricks puede ejecutarse con ONNX Runtime en CPU o GPU; no se publican requisitos de VRAM para esa via.
- Descarga del modelo: 243 MB (q8h) o 380 MB (fp16) por sesion de cliente, un factor a considerar en aplicaciones web.
- No hay estimaciones de throughput ni de latencia en servidores; no disponible.

## Comparativa con modelos similares

No hay datos suficientes publicados para una comparativa numerica rigurosa. Como referencia de categoria (generacion de movimiento a partir de poses, despliegue en navegador):

| Modelo | Autor | Formato | Uso en navegador | Licencia |
|---|---|---|---|---|
| MotionBricks SOMA (fp16/q8h ONNX) | monoradio (base: NVIDIA) | ONNX fp16 / MatMulNBits 8-bit | Si (onnxruntime-web + WebGPU) | NVIDIA Open Model Agreement |
| MotionBricks (original) | NVIDIA | no disponible en esta ficha | no disponible | NVIDIA Open Model Agreement |
| Alternativas de motion generation comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un derivado comunitario no oficial: no ha sido creado ni avalado por NVIDIA, por lo que posibles defectos de la exportacion ONNX son responsabilidad del autor del derivado.
- La licencia es la NVIDIA Open Model Agreement, no una licencia permisiva estandar (Apache/MIT): revisar sus terminos antes de cualquier uso comercial o redistribucion.
- Con 0 descargas registradas en HuggingFace, no existe historial de adopcion ni validacion comunitaria del modelo.
- La variante cuantizada a 8 bits introduce una desviacion media de 0,0018 respecto a float32 (frente a 0,0004 de fp16); en aplicaciones sensibles a la precision del movimiento conviene validar visualmente el resultado.
- El rendimiento documentado se limita a un M1 Mac con WebGPU; el comportamiento en otras GPUs, navegadores o versiones de onnxruntime-web no esta verificado.
- El soporte de WebGPU todavia no es universal en todos los navegadores y plataformas, lo que puede limitar la audiencia de una aplicacion que dependa de el.
- No hay documentacion publica en esta ficha sobre la arquitectura interna, el dataset de entrenamiento ni los sesgos del modelo base; para un uso serio debe consultarse la model card de nvidia/MotionBricks.
- Riesgo de alucinacion no aplicable al no ser un modelo generativo de texto; el riesgo equivalente es generar movimientos fisicamente implausibles, no cuantificado en la informacion disponible.

## Enlaces

- Ficha del modelo derivado: https://huggingface.co/monoradio/motionbricks-soma-fp16-onnx
- Modelo base de NVIDIA: https://huggingface.co/nvidia/MotionBricks
- Licencia NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
- Live demo (HuggingFace Space): enlazada desde la model card del repositorio; URL exacta no disponible en la informacion proporcionada.
