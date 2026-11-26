# kusema/onnxruntime

## Resumen

`kusema/onnxruntime` no es un modelo de IA, sino un espejo (mirror) del paquete oficial `Microsoft.ML.OnnxRuntime 1.31.1` publicado por Microsoft en NuGet. Lo mantiene el equipo de Kusema, una aplicacion de dictado para Windows, para garantizar la integridad de las descargas que su software verifica mediante SHA-256. Los ficheros son copias byte a byte del paquete original, sin modificaciones, y conservan la licencia MIT de Microsoft Corporation.

El repositorio contiene el paquete `.nupkg` completo (159.626.394 bytes) y cinco archivos ZIP por plataforma (Windows x64/arm64, macOS arm64, Linux x64/arm64) que incluyen solo la libreria nativa de ONNX Runtime correspondiente, junto con `LICENSE` y `ThirdPartyNotices.txt`. Kusema lo utiliza para ejecutar sus voces Kokoro mediante ONNX Runtime.

Dado que se trata de un artefacto de infraestructura y no de un modelo entrenado, no dispone de parametros, contexto, tokenizador ni capacidades generativas. Esta ficha documenta el contenido real del repositorio y advierte de que no debe confundirse con un modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (es un runtime de inferencia ONNX, no un modelo) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (el runtime soporta cuantizacion de modelos ONNX, pero el repo no incluye modelos) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | MIT (copyright Microsoft Corporation) |
| Formato de pesos | `.nupkg` y `.zip` con librerias nativas (`onnxruntime.dll`, `libonnxruntime.so`, `libonnxruntime.dylib`) |

## Arquitectura y entrenamiento

No aplica: el repositorio no contiene un modelo entrenado ni datos de entrenamiento. Contiene el binario de ONNX Runtime 1.31.1, un motor de ejecucion de grafos ONNX para inferencia en CPU y aceleradores (segun build). La version distribuida corresponde al paquete oficial `Microsoft.ML.OnnxRuntime 1.31.1` de NuGet, publicado por Microsoft.

Los archivos ZIP por plataforma extraen una unica libreria nativa del paquete (por ejemplo `runtimes/win-x64/native/onnxruntime.dll`) y la renombran como `onnxruntime.dll`. Los binarios de Windows conservan la firma Authenticode de Microsoft. Los tamanos y hashes SHA-256 publicados coinciden con los que Kusema verifica tras cada descarga.

## Capacidades

- Ejecucion de modelos en formato ONNX (grafos de inferencia) sobre CPU y, segun build, aceleradores.
- Carga de modelos ONNX para tareas como sintesis de voz (Kusema lo usa para sus voces Kokoro), vision por computador, NLP y otras.
- Integracion como libreria nativa en aplicaciones .NET, C/C++, Python (a traves del paquete NuGet o bindings), entre otras.
- No incluye capacidades de generacion de texto, razonamiento, codigo ni tool calling por si mismo.
- No incluye tokenizador ni pesos de modelo.

## Casos de uso

- Distribucion reproducible de ONNX Runtime en pipelines de CI/CD: usar los ZIP con SHA-256 fijado para descargar la libreria nativa de forma verificable en builds de Windows, macOS o Linux.
- Aplicaciones de dictado y sintesis de voz: es el caso real de Kusema, que ejecuta los modelos Kokoro a traves de esta libreria.
- Despliegue de modelos ONNX en entornos sin acceso a NuGet: el mirror permite obtener la libreria nativa desde Hugging Face con integridad verificada.
- Empaquetado en aplicaciones de escritorio: los ZIP por plataforma reducen el tamano de descarga frente al `.nupkg` completo (159 MB frente a 6-12 MB por plataforma).
- Auditoria de supply chain: los hashes SHA-256 publicados permiten comparar con el paquete oficial de Microsoft y detectar manipulaciones.
- Inferencia local de modelos ONNX en Windows x64/arm64, macOS arm64 y Linux x64/arm64 sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no documenta latencias, throughput ni comparativas de rendimiento del runtime.

## Requisitos de hardware

- No aplica VRAM especifica: es una libreria de runtime, no un modelo. El consumo depende del modelo ONNX que se cargue.
- Tamanos de descarga: `.nupkg` 159,6 MB; Windows x64 6,3 MB; Windows arm64 6,3 MB; macOS arm64 12,5 MB; Linux x64 11,1 MB; Linux arm64 10,1 MB.
- Plataformas soportadas por los ZIP: Windows x64, Windows arm64, macOS arm64, Linux x64, Linux arm64.
- Despliegue: se integra en aplicaciones que usan ONNX Runtime (bindings .NET, C/C++, Python, etc.); no es un servidor de inferencia por si mismo.
- Latencia y throughput: no disponibles; dependen del modelo ONNX y del hardware.

## Comparativa con modelos similares

| Artefacto | Tipo | Version | Licencia | Distribucion |
|---|---|---|---|---|
| kusema/onnxruntime (este repo) | Mirror de ONNX Runtime | 1.31.1 | MIT | Hugging Face, ZIP por plataforma y `.nupkg` |
| Microsoft.ML.OnnxRuntime (NuGet) | Paquete oficial | 1.31.1 | MIT | nuget.org |
| ONNX Runtime (GitHub / releases oficiales) | Runtime y binarios | 1.31.1 | MIT | GitHub, onnxruntime.ai |

La unica diferencia relevante frente al paquete oficial es el canal de distribucion y la separacion por plataforma en ZIP; el contenido binario es identico.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no tiene pesos entrenados. Cualquier uso como modelo de lenguaje es un error de interpretacion.
- El mirror lo mantiene un tercero (Kusema) y no esta afiliado ni respaldado por Microsoft; para uso en produccion se recomienda la fuente oficial salvo que se necesite esta copia.
- La licencia MIT cubre el software de Microsoft; el uso comercial esta permitido, pero debe conservarse el aviso de copyright y `ThirdPartyNotices.txt`.
- Solo se distribuyen builds para Windows x64/arm64, macOS arm64 y Linux x64/arm64; no hay binarios para otras plataformas en este repositorio.
- La integridad depende de verificar los SHA-256 publicados; no se debe confiar en la descarga sin comprobarlos.
- Sin soporte, mantenimiento ni actualizaciones garantizadas por parte del autor del mirror.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kusema/onnxruntime
- Paquete oficial en NuGet: https://www.nuget.org/packages/Microsoft.ML.OnnxRuntime/1.31.1
- Sitio oficial de ONNX Runtime: https://onnxruntime.ai
- Proyecto Kusema: https://github.com/neulinc/kusema
