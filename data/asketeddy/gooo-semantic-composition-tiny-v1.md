# asketeddy/gooo-semantic-composition-tiny-v1

## Resumen

Own Gooo semantic composition tiny v1 es un modelo experimental de 12.728 parametros publicado por el usuario asketeddy en HuggingFace. No es un modelo de lenguaje generativo al uso: su funcion es clasificar y ordenar rutas de compilacion legalmente validas del lenguaje Gooo, partiendo de codigo fuente tipado y de una intencion completa redactada en coreano o ingles. El modelo fue inicializado desde un estado aleatorio propio, sin reutilizar pesos de Laya ni de versiones anteriores del propio autor.

El modelo se distribuye como seis composiciones (variantes v2 y v3 en FP32, PTQ y QAT) que conservan tanto mejoras como regresiones respecto a la linea base, con calibracion que selecciono finalmente la variante v3 QAT. Los pesos son ternarios: ocupan 2.759 bytes en disco, y los tensores decodificados en int8 suman 12.896 bytes mas escalas. La inferencia caliente declarada es de unos 9,7 microsegundos con cero asignaciones de heap por llamada.

Su relevancia es acotada pero especifica: sirve como pieza de decision dentro del pipeline del compilador Gooo, no como generador de texto o de codigo sin restricciones. La model card es explicita al respecto: "no son generadores de codigo de texto sin restricciones" y no constituyen "comprension amplia del lenguaje Gooo ni correccion semantica universal".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de pesos ternarios entrenada desde cero; familia concreta no especificada en la model card |
| Parametros totales | 12.728 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32, PTQ, QAT y ternaria (seis exportaciones v2/v3) |
| Idiomas soportados | en, ko |
| Licencia | MIT |
| Formato de pesos | JSON (`model.json`); pesos ternarios en disco (2.759 bytes), tensores decodificados int8 (12.896 bytes mas escalas) |

## Arquitectura y entrenamiento

La informacion disponible describe un modelo diminuto de 12.728 parametros con pesos ternarios, inicializado desde un estado aleatorio propio y sin pesos preentrenados de Laya ni de versiones anteriores. No se detalla en la model card la topologia exacta (transformer, MLP u otra), ni el numero de capas, ni la longitud de contexto. El modelo produce un ranking de rutas legales propiedad del compilador, a partir de fuente tipada e intencion completa en coreano o ingles, con cuatro candidatos enumerables por contrato.

La model card indica que existen seis exportaciones v2 y v3 en FP32, PTQ y QAT que conservan mejoras y regresiones. La calibracion selecciono la variante v3 QAT; la v3 FP32 de desarrollo requiere menos intentos adicionales. Los 384 contratos finitos de desarrollo se resuelven dentro de los cuatro candidatos en cada politica. El protocolo (`protocol.md`) se congelo antes de la implementacion del programa, del oraculo y del entrenamiento, y la procedencia de cada modelo se documenta con PROV-O en ficheros `provenance/*.ttl`, enlazando pesos y metadatos con su actividad de entrenamiento y exportacion.

Como evidencia de validacion se reporta una prueba de uso real ("dogfood") sobre Gooo main: 144 llamadas, 370 predicciones, 144 ejecuciones Go compiladas de forma independiente y 2.304 invocaciones de funcion, con todos los contratos completos de 16 casos superados.

## Capacidades

- Ranking de rutas de compilacion legalmente validas del lenguaje Gooo, a partir de fuente tipada mas intencion.
- Interpretacion de intencion bilingue coreano/ingles para la seleccion de ruta.
- Generacion desconectada opcional determinista cuando se omite el modelo de rutas.
- Reordenacion de rutas restantes a partir de fallos reales observados (las entradas iniciales excluyen resultados de test).
- Ejecucion en el runtime propio con inferencia caliente de aproximadamente 9,7 microsegundos y cero asignaciones de heap por llamada.
- Trazabilidad de procedencia: hashes de payload y archivo en `publication-manifest.json`, auditoria independiente de la correccion de contadores bilingues nativos.
- No soporta tool calling, function calling, agentes, vision, audio ni razonamiento multi-paso general: no hay evidencia de ello en la informacion disponible.

## Casos de uso

- Seleccion de ruta en la compilacion de Gooo: invocando `gooo body-codegen` con `--path-model v3/models/qat_ternary/model.json` y `--path-step-attempts 1`, el modelo ordena los candidatos legales para la actividad `ChoosePath` a partir de la fuente y el plan tipado.
- Desambiguacion de intencion bilingue: el modelo acepta intenciones completas en coreano o ingles, lo que permite que equipos con documentacion en ambos idiomas generen la misma decision de ruta sin reescribir las especificaciones.
- Correccion iterativa con bucles de feedback: con `--path-feedback-rounds 3` y `--path-feedback-unfixed`, los fallos reales de compilacion pueden reordenar las rutas restantes, util en pipelines de integracion continua donde el coste de compilar un candidato erroneo es alto.
- Despliegue en entornos con restricciones extremas de memoria: el modelo ternario ocupa 2.759 bytes en disco y 1.248 bytes de workspace, por lo que cabe en sistemas embebidos o en procesos con presupuesto de memoria minimo, siempre que se disponga del runtime Gooo.
- Reproduccion determinista en herramientas de build: al omitir el modelo de rutas, la continuacion es determinista, lo que permite fijar el comportamiento del compilador en entornos auditados.
- Investigacion en cuantizacion ternaria: las seis exportaciones FP32/PTQ/QAT con sus mejoras y regresiones documentadas sirven como banco de pruebas controlado para estudiar el impacto de la cuantizacion en tareas de decision discreta.
- Auditoria de procedencia en publicaciones academicas: los ficheros PROV-O y `raw-evidence.zip` permiten verificar que las cifras reportadas provienen de capturas nativas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible: no hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar, y el modelo no es aplicable a ese tipo de evaluaciones por tratarse de un clasificador de rutas de compilacion. La unica evidencia cuantitativa publicada es la siguiente:

| Metrica | Resultado reportado |
|---|---|
| Contratos finitos de desarrollo resueltos | 384, dentro de 4 candidatos en cada politica |
| Prueba de uso real sobre Gooo main: llamadas | 144 |
| Predicciones | 370 |
| Ejecuciones Go compiladas independientemente | 144 |
| Invocaciones de funcion | 2.304 |
| Contratos completos de 16 casos superados | todos |
| Latencia de inferencia caliente seleccionada | ~9,7 microsegundos |
| Asignaciones de heap por llamada | 0 |
| Huella de pesos ternarios en disco | 2.759 bytes |
| Tensores int8 decodificados mas escalas | 12.896 bytes |
| Workspace | 1.248 bytes |

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; los pesos ternarios ocupan 2.759 bytes y los tensores decodificados int8 con escalas 12.896 bytes, con un workspace de 1.248 bytes.
- GPU recomendadas: no aplica. El modelo se ejecuta en CPU; no hay indicios de soporte CUDA en la informacion disponible.
- Compatibilidad con GPU de consumo: irrelevante por tamano; cualquier GPU consumer queda sobredimensionada. El cuello de botella es el proceso del compilador Gooo, no el modelo.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI. Requiere el runtime propio (`gooo-decision-runtime`, SDK v0.2.11 experimental) y el compilador `meta-ontology-go` en el commit `f4813dc6251037767c8cff7295ccfdab2b044ff2`.
- Latencia y throughput: latencia caliente seleccionada de aproximadamente 9,7 microsegundos por inferencia; no se reporta throughput agregado ni consumo de RAM del proceso completo (la model card indica que la RAM del proceso y la aritmetica empaquetada se miden por separado, sin dar cifras).

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (clasificadores ternarios de rutas de compilacion para un lenguaje propio). Las busquedas web realizadas no devolvieron resultados relacionados con este modelo ni con alternativas equivalentes.

## Limitaciones y advertencias

- El modelo no es un generador de codigo ni de texto sin restricciones; solo ordena rutas legalmente validas propiedad del compilador Gooo.
- No constituye comprension amplia del lenguaje Gooo ni correccion semantica universal: la propia model card lo califica como seis composiciones con variantes de objetivo, parametro e idioma, con una unica semilla de entrenamiento y cuatro candidatos enumerables.
- Existe riesgo de seleccion de ruta incorrecta; el mecanismo de feedback con fallos reales solo puede reordenar rutas restantes, no corregir la decision inicial.
- La evidencia publica es sintetica y deliberadamente publica; los informes crudos antiguos se conservan y se documentan errores de captura y de contador que no se han eliminado.
- Idiomas limitados a ingles y coreano; no hay soporte documentado de castellano.
- No se aplica promocion automatica a modelo por defecto en el compilador; su uso requiere un modelo de rutas explicito.
- La licencia MIT permite uso comercial, pero el modelo carece de utilidad fuera del ecosistema Gooo y su runtime asociado.
- El repositorio tiene un tamano declarado de 0,0 GB y cero descargas y cero likes, lo que refleja su caracter experimental y su ausencia de validacion por terceros.
- Los pesos se distribuyen en JSON, no en safetensors ni GGUF, por lo que no se integran en los cargadores habituales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/asketeddy/gooo-semantic-composition-tiny-v1
- Fuente, entrenador y runtime: https://github.com/kimjooyoon/gooo-neural-decision-experiments
- SDK (release v0.2.11 experimental): https://github.com/kimjooyoon/gooo-decision-runtime/releases/tag/v0.2.11-experimental
- Compilador Gooo (commit f4813dc): https://github.com/kimjooyoon/meta-ontology-go/commit/f4813dc6251037767c8cff7295ccfdab2b044ff2
- Curriculum publico ligado a fuente (incluye la primera captura rechazada): https://huggingface.co/asketeddy/gooo-compiler-context-tiny-v1/tree/3537f6d3f77ec163fe478d4aef440baee17b9121/research/fresh-composition-curriculum-20261002
- Las busquedas web realizadas no devolvieron enlaces relevantes para este modelo.
