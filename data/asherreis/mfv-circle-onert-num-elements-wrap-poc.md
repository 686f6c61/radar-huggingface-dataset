# asherreis/mfv-circle-onert-num-elements-wrap-poc

## Resumen

Este repositorio no contiene un modelo de aprendizaje automatico, sino un conjunto de artefactos de investigacion de seguridad: ficheros `.circle` manipulados y harnesses minimos para reproducir una vulnerabilidad de desbordamiento de enteros en el calculo de numero de elementos (*num elements wrap*) del runtime **ONE** (On-device Neural Engine) de Samsung, en su version 1.30.0. El autor lo publica en el marco del programa huntr de vulnerabilidades de formato de fichero de modelo (MFV, Model File Format Vulnerability), con el formato Circle como objetivo. Los ficheros incluidos (`depth2space_shape_wrap*.circle`, `spacetodepth_shape_wrap.circle`, `pad_shape_wrap.circle`, `tile_shape_wrap.circle`) explotan el calculo de formas en operadores concretos para provocar un *wrap* aritmetico en el tamano de los tensores.

El objetivo declarado es la divulgacion coordinada y la triaje de la vulnerabilidad, no el despliegue. El propio autor advierte de que no es una red neuronal usable y de que no debe desplegarse en produccion. La relevancia es doble: por un lado, documenta una clase de fallo (desbordamiento de enteros en el calculo de formas de tensores) que afecta a runtimes de inferencia on-device; por otro, proporciona un harness en C que reproduce el fallo sin necesidad de compilar ONE, lo que facilita la validacion por parte de terceros.

El repositorio esta vacio en terminos de pesos (0.0 GB), no tiene descargas ni likes y no declara pipeline ni idiomas. La licencia es `other`, sin texto adicional en la model card, por lo que las condiciones de uso comercial no estan definidas de forma explicita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; artefactos de PoC de seguridad) |
| Parametros totales | no disponible (0.0 GB de repositorio) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (sin texto de licencia en la model card) |
| Formato de pesos | `.circle` (Samsung ONE), harness en C (`.c`) y C++ (`.cpp`) |

## Arquitectura y entrenamiento

No aplica: no hay arquitectura de red ni proceso de entrenamiento. El contenido son ficheros de modelo Circle manipulados y codigo de reproduccion. Los ficheros `.circle` estan construidos para que el calculo del numero de elementos de un tensor desborde en operadores como `depth2space`, `spacetodepth`, `pad` y `tile`, lo que provoca un *wrap* en el tamano calculado y, segun el excerpt de AddressSanitizer incluido, un acceso a memoria fuera de limites.

El harness `harness_depth2space_wrap.c` reimplementa el algoritmo de calculo de forma afectado y se compila de forma independiente con `gcc -O1 -g -fsanitize=address`, sin necesidad de construir ONE. Los ficheros `e2e_circle_depth2space.cpp` y `e2e_nnfw_circle.cpp` cubren la ruta extremo a extremo contra ONE 1.30.0, que el autor identifica como el ultimo arbol publico con directorio `runtime/`. El script `reproduce.sh` contiene las instrucciones de compilacion y ejecucion.

## Capacidades

- No es un modelo generativo: no genera texto, codigo, matematicas ni vision.
- Reproduccion de una vulnerabilidad de desbordamiento de enteros en el calculo de formas de tensores en el runtime ONE de Samsung.
- Ejecucion de un harness autonomo en C con AddressSanitizer para validar el fallo sin compilar ONE.
- Rutas de reproduccion extremo a extremo contra ONE 1.30.0 mediante ficheros `.circle` manipulados.
- Cobertura de cuatro operadores afectados: `depth2space`, `spacetodepth`, `pad` y `tile`.
- Material de triaje para divulgacion coordinada bajo el programa huntr MFV.
- Sin soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingues.

## Casos de uso

- Triaje de vulnerabilidades: un equipo de seguridad carga los ficheros `.circle` y el excerpt de ASan para confirmar el desbordamiento y clasificar su severidad antes de parchear.
- Validacion de parches en ONE: tras aplicar una correccion en el calculo de numero de elementos, se ejecutan los harness y las rutas e2e para verificar que el fallo ya no se reproduce.
- Desarrollo de reglas de deteccion: los ficheros manipulados sirven como muestras para entrenar o validar escaneres de ficheros de modelo que detecten formas inconsistentes en operadores `depth2space`, `pad` o `tile`.
- Investigacion de robustez de runtimes on-device: permite estudiar como distintos runtimes (ONE, NNAPI, TFLite) manejan formas malformadas y comparar su comportamiento frente a desbordamientos de enteros.
- Formacion en seguridad de formatos de modelo: el harness autonomo en C es un ejemplo didactico minimo de como aislar y reproducir un fallo aritmetico sin depender de una compilacion completa del runtime.
- Divulgacion coordinada: el repositorio actua como evidencia reproducible para el reporte enviado a huntr y para la comunicacion con el mantenedor de Samsung ONE.
- Integracion en pipelines de fuzzing: los ficheros `.circle` pueden incorporarse como semillas en un fuzzer de formato Circle para explorar variantes del mismo desbordamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de validacion es un excerpt de AddressSanitizer (`asan-excerpt.txt`) que documenta el fallo, sin metricas de rendimiento.

## Requisitos de hardware

- No requiere GPU: es un artefacto de seguridad, no un modelo de inferencia.
- El harness autonomo se ejecuta en CPU con `gcc` y AddressSanitizer; cualquier maquina con toolchain C es suficiente.
- La ruta e2e requiere una compilacion de Samsung ONE 1.30.0 con ASan, lo que implica un entorno de build de C++ y las dependencias del runtime.
- No cabe en el concepto de VRAM por cuantizacion: no hay pesos.
- Opciones de despliegue: ninguna orientada a produccion; solo ejecucion local del harness y de las rutas e2e.
- Latencia y throughput: no disponibles y no significativos para este artefacto.

## Comparativa con modelos similares

| Artefacto | Formato objetivo | Runtime | Contenido | Licencia | Uso previsto |
|---|---|---|---|---|---|
| asherreis/mfv-circle-onert-num-elements-wrap-poc | Circle | Samsung ONE 1.30.0 | Ficheros `.circle` manipulados y harness en C/C++ | other | Investigacion de seguridad |
| Repositorios de PoC de formato ONNX | ONNX | ONNX Runtime | Ficheros `.onnx` malformados | variable | Investigacion de seguridad |
| Repositorios de PoC de formato TFLite | TFLite | TensorFlow Lite | Ficheros `.tflite` malformados | variable | Investigacion de seguridad |

No se dispone de datos publicos de otros repositorios MFV comparables en la informacion proporcionada; la comparativa se limita a la categoria de artefactos de PoC de formato de modelo.

## Limitaciones y advertencias

- No es un modelo usable: no genera texto ni realiza inferencia; cualquier intento de usarlo como modelo fallara.
- El autor advierte explicitamente de que no debe desplegarse en produccion ni usarse contra sistemas que no sean propios.
- La evidencia esta fijada a Samsung ONE 1.30.0; versiones posteriores pueden haber corregido el fallo y no reproducirlo.
- La licencia `other` no incluye texto, por lo que no estan claros los terminos de uso comercial ni de redistribucion.
- El repositorio esta vacio en cuanto a pesos (0.0 GB) y no tiene descargas ni validacion de la comunidad.
- Riesgo de uso indebido: los ficheros `.circle` manipulados podrian emplearse para atacar sistemas que ejecuten ONE sin parchear.
- No hay informacion sobre sesgos, alucinacion ni limitaciones de contexto o idioma porque no aplican a este artefacto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/asherreis/mfv-circle-onert-num-elements-wrap-poc
- Programa huntr MFV: no disponible en la informacion proporcionada
- Samsung ONE (On-device Neural Engine): no disponible en la informacion proporcionada
- Reporte de vulnerabilidad: no disponible en la informacion proporcionada
