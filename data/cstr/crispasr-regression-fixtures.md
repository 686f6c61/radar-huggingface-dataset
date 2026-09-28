# cstr/crispasr-regression-fixtures

## Resumen

`cstr/crispasr-regression-fixtures` no es un modelo de lenguaje ni un sistema de IA generativa: es un repositorio de artefactos de test (fixtures) para la suite de regresión del runtime C++ [CrispStrobe/CrispASR](https://github.com/CrispStrobe/CrispASR/tree/main/tests/regression). Cada fichero `<backend>/<sample-stem>/ref.gguf` contiene la salida del encoder y varias etapas intermedias (activaciones por capa en algunos backends) capturadas con `tools/dump_reference.py --backend <backend>` sobre el modelo fuente correspondiente.

El propósito es evitar la deriva silenciosa entre versiones de dependencias: al fijar (`pinning`) el repositorio a un SHA de revisión concreto desde `tests/regression/manifest.json`, la suite de integración continua compara siempre contra los mismos tensores, de modo que una actualización de torch, NeMo o transformers no altera de forma inadvertida la referencia. La herramienta `crispasr-diff <backend> <gguf> <ref> <wav>` lee exactamente este formato y reporta similitud coseno por etapa.

El repositorio se mantiene separado del árbol principal de CrispASR porque cada dump pesa entre ~1 MB y ~50 MB (0,7 GB el repo completo) y porque el pinning por revisión de HuggingFace es la forma más limpia de desacoplar "probar contra los mismos números" del historial git del proyecto. Actualmente contiene un único fixture, generado a partir de `nvidia/parakeet-tdt_ctc-0.6b-ja` sobre la muestra de audio en japonés `samples/ja/reazon_baseball_14s.wav`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo entrenado; conjunto de dumps de referencia en GGUF con la salida del encoder y etapas intermedias de un modelo ASR |
| Parametros totales | 193.568 (cifra reportada por el repo para los tensores en safetensors; no corresponde a un modelo completo) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica a fixtures de test) |
| Tipos de cuantizacion | No disponible (los GGUF contienen tensores de referencia de activaciones, no pesos cuantizados) |
| Idiomas soportados | No disponible. El unico fixture actual procede de una muestra de audio en japones |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`ref.gguf`), con datos complementarios en safetensors dentro del repo |

## Arquitectura y entrenamiento

Este repositorio no define arquitectura propia ni ha sido entrenado. Su contenido son volcados (`reference dumps`) de las activaciones de un modelo de reconocimiento automático de voz (ASR) ejecutado en inferencia: concretamente, la salida del encoder y, segun el backend, activaciones por capa de etapas intermedias. El fixture disponible corresponde a `nvidia/parakeet-tdt_ctc-0.6b-ja`, un modelo ASR de la familia Parakeet con arquitectura FastConformer y decodificacion TDT/CTC, fijado en la revision `44edb27e`.

La innovacion tecnica no esta en el modelo sino en el metodo de verificacion: `crispasr-diff` compara los tensores producidos por el runtime C++ contra las referencias capturadas y calcula similitud coseno por etapa, lo que permite detectar regresiones numericas que un simple test de salida final no veria. El pinning por SHA de revision de HuggingFace protege ademas contra el fallo tipico de "re-subida que cambia en silencio lo que descargan los usuarios", que es precisamente lo que motivo la creacion de la suite.

## Capacidades

- Verificacion de regresion por backend: permite comprobar que la implementacion C++ de CrispASR reproduce las mismas activaciones que la implementacion de referencia.
- Comparacion numerica por etapas: reporta similitud coseno por etapa intermedia, no solo una metrica agregada de salida.
- Captura de activaciones por capa en los backends que lo soportan, util para localizar en que punto se desvia una implementacion.
- Pinning reproducible: cada fixture se fija a un SHA de revision, lo que garantiza que CI compara contra numeros estables en el tiempo.
- Integracion en suite de integracion continua: los fixtures se referencian desde `tests/regression/manifest.json` mediante el campo `fixtures.revision`.
- Extension del conjunto: la documentacion del repo describe como anadir nuevos backends y fixtures.
- No soporta generacion de texto, razonamiento, codigo, tool calling, agentes ni capacidades multilingues: no es un modelo generativo.

## Casos de uso

- Verificacion de regresiones en el runtime C++: al ejecutar `crispasr-diff` contra `ref.gguf`, el equipo de CrispASR detecta si un cambio en el codigo altera las activaciones respecto a la referencia capturada.
- Integracion continua reproducible: `manifest.json` fija la revision del repo de fixtures, de modo que los pipelines de CI no cambian de referencia aunque se actualicen torch, NeMo o transformers.
- Depuracion de diferencias numericas entre implementaciones: la comparacion por etapa permite aislar si el desvio aparece en el encoder o en capas concretas.
- Validacion de portabilidad de backends: sirve para comprobar que una nueva implementacion (CPU, GPU u otro backend) reproduce el comportamiento del modelo fuente.
- Auditoria de cambios en el modelo fuente: al re-volcar referencias con una version distinta de las librerias, se puede comprobar si el comportamiento del modelo fuente se ha desplazado.
- Onboarding de nuevos backends: el fixture actual y la documentacion de `tests/regression/README.md` sirven como plantilla para anadir soporte de nuevos modelos ASR.
- Trazabilidad de artefactos en produccion: el patron de pinning por SHA es reutilizable en cualquier pipeline que necesite garantizar que el artefacto descargado no cambia entre ejecuciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica asociada al repositorio es la similitud coseno por etapa que calcula `crispasr-diff`, sin valores numericos publicados para el fixture actual.

## Requisitos de hardware

- Almacenamiento: repo completo de 0,7 GB; cada dump individual pesa entre aproximadamente 1 MB y 50 MB.
- VRAM: no requiere GPU. La comparacion de tensores de referencia puede ejecutarse en CPU.
- GPU recomendadas: no aplica para el uso previsto del repositorio.
- Cabe en cualquier equipo consumer: si, incluidos portatiles sin GPU dedicada; el cuello de botella es disco y el coste de calcular similitud coseno sobre los tensores.
- Opciones de despliegue: no es un modelo desplegable. Se consume mediante `crispasr-diff` del runtime CrispASR y mediante la suite de tests del repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada repositorios comparables de fixtures de regresion para runtimes ASR. Como referencia del modelo fuente, el fixture actual deriva de `nvidia/parakeet-tdt_ctc-0.6b-ja` (aproximadamente 0,6 B de parametros, licencia y condiciones propias de NVIDIA), pero este repositorio no replica ni redistribuye dichos pesos.

## Limitaciones y advertencias

- No es un modelo usable para inferencia: no genera texto, no responde a prompts y no implementa ninguna tarea de IA de forma directa.
- Cobertura minima: solo existe un fixture (`parakeet-tdt-0.6b-ja` sobre `samples/ja/reazon_baseball_14s.wav`), por lo que la cobertura de la suite es muy reducida.
- Idioma limitado en la practica: la unica muestra de audio disponible esta en japones; el repositorio no declara soporte multilingue.
- Dependencia de terceros: los dumps derivan de pesos de modelos fuente en tiempo de inferencia; para cualquier redistribucion deben consultarse las licencias de esos modelos, que pueden ser mas restrictivas que Apache-2.0.
- Riesgo de deriva si no se respeta el pinning: re-volcar referencias con versiones distintas de torch, NeMo o transformers puede cambiar los valores, lo que invalida la comparacion con commits anteriores.
- Licencia Apache-2.0 aplicada al repositorio de fixtures, no necesariamente extensible al modelo fuente subyacente.
- Sin benchmarks ni metricas de calidad publicadas: la utilidad se limita a la verificacion de equivalencia numerica.
- La busqueda web realizada no devolvio resultados relevantes sobre este repositorio (los resultados obtenidos corresponden a foros de consumo sin relacion con el proyecto).

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/cstr/crispasr-regression-fixtures
- Suite de regresion de CrispASR: https://github.com/CrispStrobe/CrispASR/tree/main/tests/regression
- Documentacion para anadir un nuevo backend: https://github.com/CrispStrobe/CrispASR/tree/main/tests/regression#adding-a-new-backend
- Modelo fuente del fixture actual: `nvidia/parakeet-tdt_ctc-0.6b-ja` (revision `44edb27e`)
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web realizada.
