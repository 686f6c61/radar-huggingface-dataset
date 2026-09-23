# michaellu88/mnn-engines

## Resumen

`michaellu88/mnn-engines` no es un modelo de IA: es un repositorio de artefactos binarios que redistribuye las ocho librerías del runtime de inferencia MNN (Alibaba) compiladas para Android `arm64-v8a`. Las utiliza la aplicación Pashbox Books a través de su módulo nativo `mnn-vision-bridge`, y el autor las publica para que la app y sus herramientas de compilación puedan descargarlas sin token de acceso. El repositorio no contiene pesos: los modelos OCR entrenados se guardan en un repositorio privado aparte.

El conjunto son ocho ficheros `.so` que suman 7.574.376 bytes (unos 7,57 MB): `libMNN.so`, `libMNN_CL.so`, `libllm.so`, `libMNN_Express.so`, `libMNN_Vulkan.so`, `libMNNOpenCV.so`, `libMNNAudio.so` y `libmnncore.so`. `libMNN.so` incorpora los microkernels KleidiAI 1.14.0 de Arm y conserva las rutas de compilación de la CI de GitHub Actions de alibaba/MNN.

Su relevancia es logística, no algorítmica: es un origen reproducible, sin autenticación y con licencia Apache-2.0 para el motor de inferencia en dispositivo, con backends de CPU, OpenCL y Vulkan. Cualquier evaluación de capacidades (idiomas, contexto, benchmarks) depende del modelo que se cargue en el motor, y ese modelo no está en este repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: no es un modelo. Son librerías de runtime de inferencia (motor de ejecución de redes neuronales MNN) |
| Parametros totales | No aplica: el repositorio no contiene pesos |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: dependería del modelo cargado por `libllm.so`; la model card no especifica ninguna |
| Tipos de cuantizacion | No disponible: no se documentan; la cuantización la determina el modelo que se cargue en el motor |
| Idiomas soportados | No aplica (runtime sin capacidades lingüísticas propias) |
| Licencia | Apache License 2.0 (MNN, © Alibaba; KleidiAI 1.14.0, Apache-2.0, © Arm Limited) |
| Formato de pesos | No aplica: no incluye pesos. Contiene 8 binarios ELF `.so` para Android `arm64-v8a` |
| Tipo de artefacto | Librerías compartidas nativas (`lib*.so`), no safetensors ni GGUF |
| ABI soportada | `arm64-v8a` únicamente |
| Tamaño total | 7.574.376 bytes (7,57 MB) en 8 ficheros |
| Backends de cómputo | CPU, OpenCL (`libMNN_CL.so`), Vulkan (`libMNN_Vulkan.so`) |
| Dependencias externas | `libc++_shared.so` (runtime C++ del Android NDK, no redistribuido aquí) |
| ID de HuggingFace | `michaellu88/mnn-engines` |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-09-23T01:08:26Z / 2026-09-23T01:08:48Z |

### Ficheros incluidos

| Fichero | Bytes | sha256 |
|---|---|---|
| `arm64-v8a/libMNN.so` | 2.398.200 | `69d6db5ade18139b58d2d96430b741f18b9a708083947f75815e08f36ee17ef2` |
| `arm64-v8a/libMNN_CL.so` | 2.135.960 | `06388cb10b59e3d3f0b568e56b587d74c50a4a5abba639d58af8e92b922f0f19` |
| `arm64-v8a/libllm.so` | 1.206.232 | `7d50559f48eb23a7d517d03147c430aee539af15712aa08e09531f2923ade0b5` |
| `arm64-v8a/libMNN_Express.so` | 743.896 | `0cc0c9fca8426c55cd795f619ae579a65356dbee75a700ceb5937781c63ec5b4` |
| `arm64-v8a/libMNN_Vulkan.so` | 738.600 | `43eb831d7c71de3a819873bf0eabda79c3b67a6b463786133ce5a511516027c0` |
| `arm64-v8a/libMNNOpenCV.so` | 264.424 | `a18f299abb65679bc71213b534fbcc843c498c90b867e4f16df6edd31495469e` |
| `arm64-v8a/libMNNAudio.so` | 64.248 | `d23fcf526aa78b64f105cfc622d53f88c51a7a9103687f4189c1d28ec3faddd5` |
| `arm64-v8a/libmnncore.so` | 22.816 | `40705e8a12b6ca6df18557536f4013d7b05069dbfbdccd17b4f8925feacaa8dd` |

## Arquitectura y entrenamiento

MNN es un motor de inferencia y entrenamiento de redes neuronales de Alibaba. En esta distribución, la capa central es `libMNN.so` (motor y operadores), sobre la que se apoyan `libMNN_Express.so` (ejecución de grafos y expresiones), `libmnncore.so`, y los backends de aceleración `libMNN_CL.so` (OpenCL) y `libMNN_Vulkan.so` (Vulkan). `libMNNOpenCV.so` aporta la integración con OpenCV y `libMNNAudio.so` las primitivas de audio. `libllm.so` es el runtime de modelos de lenguaje, que depende de todos los anteriores. La model card documenta el grafo real de dependencias (`DT_NEEDED`) y un orden de carga válido:

```
libMNN.so                                   -> libc++_shared.so
libMNN_Express.so  libMNN_CL.so
libMNN_Vulkan.so   libmnncore.so            -> libMNN.so
libMNNAudio.so     libMNNOpenCV.so          -> libMNN_Express.so, libMNN.so
libllm.so          -> libMNN_Vulkan.so, libMNN_CL.so, libMNNOpenCV.so,
                      libMNNAudio.so, libMNN_Express.so, libMNN.so
```

Orden de carga válido: `libMNN` → `libMNN_Express`, `libMNN_CL`, `libMNN_Vulkan`, `libmnncore` → `libMNNAudio`, `libMNNOpenCV` → `libllm`.

No hay entrenamiento, dataset, RLHF ni DPO: el repositorio no aloja ningún modelo entrenado. La única información de procedencia es que `libMNN.so` conserva las rutas de compilación de la CI de GitHub Actions de alibaba/MNN (`/home/runner/work/MNN/MNN/build_64/...`) y que incluye los microkernels KleidiAI 1.14.0 de Arm. Un escaneo de cadenas de las ocho librerías no encontró credenciales, rutas personales ni nombres de host internos, según la model card.

## Capacidades

- Ejecución de inferencia en dispositivo sobre Android `arm64-v8a`, en CPU y con aceleración GPU mediante OpenCL y Vulkan.
- Ejecución de modelos de visión: es el motor que la app Pashbox Books usa en `mnn-vision-bridge` para sus modelos OCR.
- Ejecución de modelos de lenguaje en dispositivo mediante `libllm.so`, con dependencia de los backends OpenCL, Vulkan, OpenCV y audio.
- Tratamiento de audio como entrada de modelo a través de `libMNNAudio.so`.
- API de grafos de cómputo y expresiones con `libMNN_Express.so`, y pre/postprocesado de imagen con `libMNNOpenCV.so`.
- Integración con microkernels optimizados para Arm (KleidiAI 1.14.0) empaquetados en `libMNN.so`.
- No incluye tool calling, function calling ni soporte de agentes: esas capacidades, si existieran, dependerían del modelo cargado y de la aplicación anfitriona.
- No incluye capacidades multilingües propias (es un runtime) ni pesos de ningún tipo.
- No incluye el puente JNI de la app (`libmnn_bridge.so`), que se compila desde `mnn_bridge.cpp` durante la build de Android.

## Casos de uso

- OCR en dispositivo dentro de una app Android: colocar los ocho `.so` en `modules/mnn-vision-bridge/android/src/main/jniLibs/arm64-v8a/` antes de compilar; el APK los empaqueta y `MnnVisionBridgeModule` los carga al arrancar, resolviendo todas las dependencias `DT_NEEDED` desde el directorio de librerías nativas de la app.
- Digitalización de documentos sin conexión: el motor ejecuta los modelos OCR en el propio teléfono, de modo que el texto de libros o formularios no sale del dispositivo.
- Chat o asistentes locales con modelos de lenguaje pequeños: `libllm.so` permite cargar un modelo LLM cuantizado y ejecutarlo con backend CPU, OpenCL (Adreno) o Vulkan (Mali), sin depender de APIs en la nube.
- Preprocesado de imagen antes de la inferencia: `libMNNOpenCV.so` sirve para detección de bordes de documento, binarización, recorte y reescalado en el mismo proceso nativo, evitando copias entre Java y C++.
- Pipelines de audio en el borde: `libMNNAudio.so` permite alimentar modelos de audio (por ejemplo clasificación de eventos acústicos) sin enviar el audio a un servidor.
- Compilación reproducible en CI/CD: descargar los binarios sin token de acceso, verificar los ocho sha256 de la tabla anterior y empaquetarlos en el APK como paso previo a las pruebas instrumentadas.
- Comparativa de backends en hardware real: al incluir CPU, OpenCL y Vulkan en el mismo paquete, se puede medir el mismo modelo en los tres backends sobre distintos SoC arm64 para decidir la configuración de producción.
- Aplicaciones Android con requisitos de privacidad (sanidad, legal, lectura profesional) que necesitan inferencia local y auditable, con la obligación de conservar el aviso de licencia Apache-2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de latencia, throughput ni precisión; los únicos datos cuantitativos son los tamaños de fichero y sus hashes sha256 (tabla de ficheros incluidos). Cualquier cifra de rendimiento dependería del modelo cargado, del backend (CPU, OpenCL o Vulkan) y del SoC concreto, y no se proporciona ninguna.

## Requisitos de hardware

- VRAM: no aplica. Es inferencia en dispositivo sobre SoC móvil; el consumo de memoria depende del modelo que se cargue y no está documentado.
- No cabe ni está pensado para GPU de escritorio (A100, H100, RTX 4090); el artefacto es un binario ELF para Android `arm64-v8a`.
- CPU: Armv8-A de 64 bits. Los microkernels KleidiAI 1.14.0 están compilados dentro de `libMNN.so`; la model card no detalla las extensiones de instrucciones exigidas.
- GPU integrada: backends OpenCL y Vulkan disponibles, orientados a GPU móviles tipo Adreno (OpenCL/Vulkan) y Mali (Vulkan/OpenCL).
- ABI: solo `arm64-v8a`. No hay `armeabi-v7a`, `x86` ni `x86_64`, por lo que no funciona en emuladores Android x86 sin capa de traducción.
- Despliegue: empaquetado en `jniLibs/arm64-v8a` en tiempo de compilación. La carga en tiempo de ejecución con `System.load()` desde una ruta arbitraria de datos de la app no es equivalente, porque esa ruta no está en la del enlazador dinámico y las dependencias pueden resolverse mal o no resolverse.
- Dependencias de despliegue: `libc++_shared.so` debe venir del NDK o del propio APK (no se redistribuye aquí) y `libmnn_bridge.so` se compila desde `mnn_bridge.cpp` con CMake.
- Coste en el APK: al menos 7,57 MB adicionales por los ocho `.so`, más `libc++_shared.so` y el puente JNI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Este repositorio no es un modelo, por lo que no existe comparación directa con modelos de lenguaje o visión. La comparación pertinente es con otros runtimes de inferencia en dispositivo. Los datos de licencia de las alternativas son de conocimiento general y no se han podido verificar en la búsqueda web asociada; el resto de campos no está disponible en la información proporcionada.

| Runtime | Licencia | Plataforma objetivo | Incluye pesos | Disponibilidad |
|---|---|---|---|---|
| MNN (este repositorio) | Apache-2.0 | Android `arm64-v8a` | No | 8 binarios `.so`, 7,57 MB, descarga sin token |
| MNN upstream (alibaba/MNN) | Apache-2.0, según la model card | No detallada en la model card | No | Código fuente y CI en GitHub; origen de estos binarios |
| LiteRT / TensorFlow Lite | No verificada en esta ficha | No disponible | — | No disponible |
| ONNX Runtime Mobile | No verificada en esta ficha | No disponible | — | No disponible |
| ncnn | No verificada en esta ficha | No disponible | — | No disponible |
| ExecuTorch | No verificada en esta ficha | No disponible | — | No disponible |

La búsqueda web realizada no devolvió ninguna fuente técnica sobre este repositorio ni sobre runtimes comparables; los resultados obtenidos fueron páginas de Chegg sin relación con el tema.

## Limitaciones y advertencias

- No es un modelo: no permite evaluar calidad de generación, razonamiento ni conocimiento. No contiene pesos y los modelos OCR que usa la app están en un repositorio privado, por lo que el comportamiento no es reproducible a partir de este repositorio.
- Cobertura de ABI limitada a `arm64-v8a`; cualquier dispositivo o emulador de 32 bits o x86 queda fuera.
- Dependencia no incluida: `libc++_shared.so` es necesaria para que cualquiera de las ocho librerías cargue y no se redistribuye aquí.
- Puente JNI ausente: `libmnn_bridge.so` se compila en la build de la app; sin él, `MnnVisionBridgeModule` no puede usar las librerías.
- Orden de carga sensible: cargar `libllm.so` u otras librerías fuera del orden documentado puede provocar fallos de resolución de símbolos.
- Carga dinámica desde rutas arbitrarias: usar `System.load()` en lugar del directorio nativo del APK puede resolver dependencias de forma incorrecta o fallar.
- Cero tracción: 0 descargas y 0 likes, sin issues ni validación externa conocida. No hay garantía de mantenimiento ni de actualizaciones de seguridad.
- Riesgo de suministro de software: son binarios opacos compilados por terceros (CI de alibaba/MNN y empaquetado por el autor). La model card afirma que un escaneo de cadenas no encontró credenciales ni rutas internas, pero eso no equivale a una auditoría del binario. Se recomienda verificar los sha256 publicados y reconstruir desde la fuente de MNN si el entorno es sensible.
- Licencia: Apache-2.0 permite uso comercial, pero obliga a conservar avisos de copyright y licencia (Alibaba para MNN, Arm Limited para KleidiAI). El repositorio redistribuye binarios y no está afiliado ni respaldado por Alibaba ni por Arm.
- Fechas incoherentes: la creación y la actualización figuran como 2026-09-23, posteriores a la fecha habitual de consulta, lo que conviene verificar antes de fijar una versión en un pipeline.
- Sin datos de benchmarks, latencia, memoria ni consumo: no hay base para estimar el rendimiento en producción a partir de este repositorio.
- Idiomas, contexto y cuantización: cualquier cifra dependerá del modelo cargado y no se documenta aquí.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/michaellu88/mnn-engines
- MNN upstream, repositorio oficial: https://github.com/alibaba/MNN
- Licencia de MNN (Apache-2.0), copiada verbatim en este repositorio: https://github.com/alibaba/MNN/blob/master/LICENSE.txt
- KleidiAI, microkernels de Arm: https://gitlab.arm.com/kleidi/kleidiai
- Búsqueda web asociada: sin resultados relevantes; únicamente páginas de Chegg no relacionadas con el repositorio. No se han encontrado papers, blogs, demos ni repositorios adicionales.
