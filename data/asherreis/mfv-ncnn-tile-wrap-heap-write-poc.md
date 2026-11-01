# asherreis/mfv-ncnn-tile-wrap-heap-write-poc

## Resumen

`mfv-ncnn-tile-wrap-heap-write-poc` no es un modelo de inteligencia artificial, sino un artefacto de investigacion en seguridad publicado en Hugging Face por el usuario asherreis. Contiene un fichero `.param` de ncnn manipulado junto con un `.bin` vacio, disenados para desencadenar un fallo de escritura en el heap (heap write) mediante un desbordamiento de enteros en la capa Tile del framework ncnn de Tencent. El repositorio se enmarca en el programa huntr de vulnerabilidades de formatos de fichero de modelo (MFV, Model File Format Vulnerability) y esta pensado para divulgacion coordinada.

El artefacto incluye tambien un harness minimo en C++ (`asan_tile_h.cpp`) que instancia `Net` y `Extractor` de ncnn, un script `reproduce.sh` con instrucciones de compilacion y ejecucion, y un extracto de AddressSanitizer (`asan-excerpt.txt`) que documenta la verificacion local del fallo. El repositorio tiene un tamano de 0.0 GB y cero descargas en el momento de la consulta.

Su relevancia no es funcional sino de seguridad: ejemplifica como una entrada maliciosa en el formato de modelo de ncnn puede provocar corrupcion de memoria en el proceso que carga el modelo, un vector de ataque relevante para pipelines de inferencia que aceptan modelos de terceros. No debe confundirse con un modelo desplegable ni utilizarse en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; fichero `.param` de ncnn manipulado) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | other |
| Formato de pesos | `.param` (texto de definicion de red ncnn) + `.bin` vacio |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento. El artefacto es un fichero de definicion de grafo en formato `.param` de ncnn que declara una capa `Tile` con parametros manipulados, acompanado de un `.bin` vacio. El fallo objetivo es un desbordamiento de enteros en el calculo del tamano de la operacion Tile, que deriva en una escritura fuera de limites en el heap cuando la libreria procesa la capa.

El harness `asan_tile_h.cpp` carga el modelo mediante las clases `Net` y `Extractor` de ncnn y ejecuta la inferencia bajo AddressSanitizer, compilado con `detect_leaks=0:halt_on_error=1`, para evidenciar la corrupcion de memoria. No se documentan datos de entrenamiento, RLHF ni innovaciones de inferencia, al no tratarse de un modelo.

## Capacidades

- No genera texto, codigo, matematicas ni vision: no es un modelo de lenguaje ni multimodal.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues.
- Su unica funcion es servir como prueba de concepto (PoC) reproducible de una vulnerabilidad de corrupcion de memoria en el parser/cargador de modelos de ncnn.
- Permite verificar el fallo con AddressSanitizer sobre una compilacion instrumentada de `Tencent/ncnn`.

## Casos de uso

- Triage de vulnerabilidades: permite a los mantenedores de ncnn reproducir el fallo de escritura en el heap de la capa Tile y validar el parche correspondiente antes de publicar el aviso de seguridad.
- Divulgacion coordinada en huntr: sirve como evidencia adjunta al informe MFV, con harness y extracto de ASan que facilitan la verificacion independiente por parte del programa.
- Auditoria de pipelines de inferencia: equipos que cargan modelos ncnn de terceros pueden usar este artefacto para comprobar si su version de la libreria es vulnerable antes de aceptar artefactos externos.
- Desarrollo de reglas de deteccion: permite construir firmas o validaciones estaticas sobre ficheros `.param` que detecten declaraciones de capa Tile con parametros anomalos.
- Formacion en seguridad de formatos de modelo: util como ejemplo didactico de desbordamiento de enteros en el calculo de tamanos de buffer dentro de un cargador de redes.
- Pruebas de fuzzing y regresion: integrable en suites que fuzzean parsers de `.param` para confirmar que futuras versiones de ncnn rechazan la entrada sin corromper memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No requiere GPU: la ejecucion se realiza en CPU mediante una compilacion de ncnn con AddressSanitizer.
- GPU recomendadas: no disponibles (no aplica).
- No cabe plantearse ejecucion en GPU de consumo porque no es un modelo.
- Despliegue: compilacion local de `Tencent/ncnn` con ASan y ejecucion del binario `asan_tile_h` segun `reproduce.sh`; no aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles (no aplica); el objetivo es la reproduccion determinista del fallo, no el rendimiento.

## Comparativa con modelos similares

| Artefacto | Tipo | Framework objetivo | Proposito | Licencia |
|---|---|---|---|---|
| mfv-ncnn-tile-wrap-heap-write-poc | PoC de vulnerabilidad | ncnn (Tencent) | Heap write via Tile wrap | other |
| Otros PoC MFV de huntr | PoC de vulnerabilidad | Distintos parsers de modelos | Divulgacion coordinada | variable |
| Modelos ncnn legitimos | Redes neuronales | ncnn | Inferencia en dispositivo | variable |

No se dispone de datos comparativos de rendimiento ni de parametros, al no tratarse de modelos.

## Limitaciones y advertencias

- No es un modelo utilizable: no realiza inferencia ni produce salidas funcionales.
- Riesgo de seguridad intencionado: su carga en versiones vulnerables de ncnn puede provocar corrupcion de memoria y caida o ejecucion arbitraria en el proceso anfitrion.
- Uso restringido: el autor indica explicitamente que se proporciona solo para triage y remediacion, sin garantia, y que no debe usarse contra sistemas que no sean propios.
- Licencia `other`: no se detallan terminos de uso comercial; debe consultarse la model card y el informe huntr antes de cualquier redistribucion.
- Sin soporte de idiomas ni contexto: no aplica ninguna de las metricas habituales de evaluacion de modelos.
- Fecha de creacion y actualizacion (2026-10-29) proximas entre si, con cero descargas: artefacto recien publicado y sin validacion comunitaria en el momento de la consulta.

## Enlaces

- Hugging Face: https://huggingface.co/asherreis/mfv-ncnn-tile-wrap-heap-write-poc
- ncnn (Tencent): https://github.com/Tencent/ncnn
- Programa huntr (MFV): https://huntr.com
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repos o demos.
