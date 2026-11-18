# cstr/crispasr-regression-fixtures

## Resumen

`cstr/crispasr-regression-fixtures` no es un modelo de lenguaje entrenado, sino un repositorio de artefactos de prueba (fixtures) para la suite de regresión del proyecto CrispASR. Contiene volcados de referencia en formato GGUF generados por `tools/dump_reference.py` contra modelos ASR de origen, capturando la salida del encoder y varias etapas intermedias (activaciones por capa en algunos backends). El runtime C++ `crispasr-diff` lee exactamente este formato y reporta similitud coseno por etapa frente a los tensores capturados.

El propósito es desacoplar la validación numérica del historial git de CrispASR: al fijar el repositorio de fixtures a un SHA de revisión concreto (campo `fixtures.revision` en `tests/regression/manifest.json`), se evita que cambios en versiones de torch, NeMo o transformers alteren silenciosamente los valores contra los que corre la CI. El repositorio ocupa 2,8 GB y alberga dumps individuales de entre ~1 MB y ~50 MB.

El dato de "9.148.949 parámetros totales" que aparece en los metadatos de safetensors corresponde, con toda probabilidad, a uno de los tensores volcados y no a un modelo desplegable. Este repositorio no debe confundirse con un modelo listo para inferencia: es infraestructura de testing para el ecosistema CrispASR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de fixtures, no modelo) |
| Parametros totales | 9.148.949 (dato de safetensors, probablemente un tensor volcado, no un modelo) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los artefactos son dumps GGUF de referencia) |
| Idiomas soportados | no disponible (el fixture actual usa una muestra en japones: `samples/ja/reazon_baseball_14s.wav`) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (`<backend>/<sample-stem>/ref.gguf`) |

## Arquitectura y entrenamiento

No hay arquitectura de modelo ni proceso de entrenamiento en este repositorio. Los ficheros `ref.gguf` son la salida de `tools/dump_reference.py --backend <backend>` ejecutado contra el modelo de origen correspondiente; capturan la salida del encoder y, en algunos backends, activaciones por capa. El backend actualmente documentado es `parakeet-tdt-0.6b-ja`, derivado de `nvidia/parakeet-tdt_ctc-0.6b-ja` en la revisión `44edb27e`, sobre la muestra `samples/ja/reazon_baseball_14s.wav`.

La innovación técnica relevante es de proceso, no de modelado: el pinning por SHA de revisión de Hugging Face evita el fallo de "re-subida que cambia silenciosamente lo que descargan los usuarios", que fue precisamente la motivación de la suite de regresión. El consumidor es `crispasr-diff <backend> <gguf> <ref> <wav>`, que compara etapa por etapa mediante similitud coseno.

## Capacidades

- Almacenar dumps de referencia en GGUF para validación numérica de backends ASR.
- Servir como fuente de verdad congelada (por SHA) para la CI de CrispASR.
- Permitir comparación por etapa (encoder y activaciones intermedias) mediante similitud coseno.
- Desacoplar el ciclo de vida de los fixtures del historial git del repositorio principal.
- Añadir nuevos fixtures siguiendo el procedimiento documentado en `tests/regression/README.md`.
- No ofrece generación de texto, razonamiento, código, visión, tool calling, agentes ni capacidades multilingües propias.

## Casos de uso

- Integración continua de CrispASR: el pipeline descarga el fixture fijado por SHA y ejecuta `crispasr-diff` para detectar regresiones numéricas en el backend `parakeet-tdt-0.6b-ja` tras cambios de código en C++.
- Validación tras actualizar dependencias: al subir la versión de torch, NeMo o transformers, el equipo puede comparar los nuevos dumps contra los fixtures existentes y cuantificar la deriva con similitud coseno por etapa.
- Depuración de backends ASR: un desarrollador que modifica el kernel de un encoder puede aislar en qué capa se desvía la salida comparando contra las activaciones intermedias capturadas.
- Auditoría de reproducibilidad: investigadores que necesitan demostrar que una build concreta produce resultados numéricamente equivalentes a una referencia pueden citar el SHA del fixture empleado.
- Onboarding de nuevos colaboradores: el repositorio separado evita inflar el árbol de trabajo de CrispASR con ficheros de 1 a 50 MB, facilitando el clonado del proyecto principal.
- Extensión a nuevos modelos ASR: el equipo puede añadir fixtures para backends adicionales (por ejemplo, otros modelos de parakeet o wav2vec) siguiendo el manifiesto y el README de regresión.
- Verificación de builds en distintas plataformas: comparar la salida de una compilación en ARM frente a x86 contra el mismo `ref.gguf` para detectar diferencias de precisión o de implementación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no evalúa calidad del modelo, sino equivalencia numérica de implementaciones; la métrica operativa es la similitud coseno por etapa reportada por `crispasr-diff`, sin valores publicados en la información proporcionada.

## Requisitos de hardware

- VRAM: no aplica como modelo de inferencia; el consumo depende del modelo de origen (`parakeet-tdt-0.6b-ja`, ~0,6 B de parámetros) al regenerar dumps, no al usar los fixtures.
- GPU recomendadas: no disponibles para este repositorio; para regenerar fixtures del modelo de origen se requeriría hardware capaz de ejecutar NeMo/parakeet, pero no se especifica en la información.
- Consumer GPU: los fixtures en sí no requieren GPU; `crispasr-diff` es una herramienta C++ de comparación tensorial.
- Despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI; el consumidor es el binario `crispasr-diff` del proyecto CrispASR.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Repositorio | Tipo | Contenido | Licencia | Uso previsto |
|---|---|---|---|---|
| `cstr/crispasr-regression-fixtures` | Fixtures de test | Dumps GGUF de referencia para ASR | apache-2.0 | CI de CrispASR |
| `nvidia/parakeet-tdt_ctc-0.6b-ja` | Modelo ASR | Pesos del modelo de origen del fixture actual | no disponible en la informacion | Transcripcion ASR en japones |
| Otros repos de fixtures de regresion | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre repositorios equivalentes de fixtures de regresión para comparar directamente.

## Limitaciones y advertencias

- No es un modelo utilizable para inferencia: no genera texto, no transcribe audio por sí mismo ni responde a prompts.
- El campo "parámetros totales" de safetensors (9.148.949) no representa un modelo desplegable; interpretarlo como tal induce a error.
- Solo hay un fixture documentado (`parakeet-tdt-0.6b-ja`), por lo que la cobertura de la suite es mínima según la información disponible.
- Los dumps derivan de los pesos de los modelos de origen en tiempo de inferencia; cualquier restricción de licencia o redistribución de esos modelos debe consultarse en sus propias fichas, no en la licencia apache-2.0 de este repositorio.
- El pinning por SHA es imprescindible: sin él, una re-subida podría cambiar los valores contra los que corre la CI.
- La regeneración de fixtures con versiones distintas de torch, NeMo o transformers puede introducir deriva numérica; el repositorio está diseñado para detectarla, no para evitarla.
- No se documentan sesgos, alucinaciones ni limitaciones idiomáticas propias porque no hay modelo; el único idioma presente en la muestra actual es el japonés.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/cstr/crispasr-regression-fixtures
- Proyecto CrispASR: https://github.com/CrispStrobe/CrispASR
- Suite de regresión: https://github.com/CrispStrobe/CrispASR/tree/main/tests/regression
- README de regresión: https://github.com/CrispStrobe/CrispASR/tree/main/tests/regression#adding-a-new-backend
- Modelo de origen del fixture: https://huggingface.co/nvidia/parakeet-tdt_ctc-0.6b-ja
