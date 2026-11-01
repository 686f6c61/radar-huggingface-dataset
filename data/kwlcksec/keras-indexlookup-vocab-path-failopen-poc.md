# kwlcksec/keras-indexlookup-vocab-path-failopen-poc

## Resumen

`kwlcksec/keras-indexlookup-vocab-path-failopen-poc` no es un modelo de lenguaje ni un modelo de aprendizaje automatico en el sentido habitual. Se trata de un repositorio de prueba de concepto (PoC) de seguridad publicado en Hugging Face que documenta una vulnerabilidad en Keras 3.15.1. El artefacto contiene un `config.json` con una capa `StringLookup` cuya ruta de vocabulario apunta a `/etc/passwd`, junto con un script `repro.py` que carga esa configuracion mediante `keras.Sequential.from_config(...)` y muestra el contenido del fichero local filtrado.

El fallo, clasificado como CWE-22 (path traversal) y CWE-502 (deserializacion de datos no confiables), afecta a la funcion `set_vocabulary` de `keras/src/layers/preprocessing/index_lookup.py`. Cuando no hay un `SafeModeScope` activo, `in_safe_mode()` devuelve `None`, valor falsy, de modo que la comprobacion introducida para CVE-2025-12058 se omite y la ruta externa se abre. El impacto es lectura arbitraria de ficheros locales en texto claro, no ejecucion de codigo.

El repositorio es relevante para desarrolladores e investigadores en seguridad de cadenas de suministro de modelos: demuestra que la carga de configuraciones de capas Keras no confiables puede exponer ficheros del sistema anfitrion, y contrasta con el comportamiento fail-closed ya adoptado para `Lambda` tras CVE-2026-12481. No incluye pesos, tokenizador, pipeline ni metadatos de licencia o idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de PoC de seguridad, no es un modelo neuronal) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene `config.json` y `repro.py`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No aplica: el repositorio no contiene un modelo entrenado. Su "arquitectura" es la de un artefacto de reproduccion compuesto por dos ficheros. El primero, `config.json`, define una configuracion `Sequential` de Keras que incluye una capa `StringLookup` con `vocabulary` igual a `/etc/passwd`. El segundo, `repro.py`, ejecuta la carga mediante la API documentada `from_config` / deserializacion legacy sin envolver la operacion en un `SafeModeScope`.

El fallo se localiza en `keras/src/layers/preprocessing/index_lookup.py`, en `set_vocabulary`: la comprobacion `if serialization_lib.in_safe_mode():` solo lanza `ValueError` cuando el scope esta establecido explicitamente a `True`. Con el scope sin definir, `in_safe_mode()` retorna `None`, que es falsy, y el flujo continua hasta abrir la ruta atacante mediante `tf.io.gfile` / `TextFileInitializer`. La propia model card senala que Keras ya migro `Lambda` a una comprobacion fail-closed (`effective_safe_mode is not False`) tras CVE-2026-12481, pero `IndexLookup` quedo pendiente. El control negativo incluido en el PoC confirma el diagnostico: al ejecutar la misma carga dentro de `with keras.src.saving.serialization_lib.SafeModeScope(True):` se lanza `ValueError` con el mensaje "vocabulary file outside of the model archive".

El entorno de reproduccion indicado es `keras==3.15.1` con `tensorflow==2.20.0`, instalados en un virtualenv. La remediacion propuesta consiste en tratar el scope sin definir (`None`) como modo seguro activo, igualando el comportamiento de `Lambda`.

## Capacidades

- Reproduccion determinista de la vulnerabilidad: carga de una configuracion Keras no confiable y lectura de un fichero local arbitrario en texto claro.
- Demostracion de la diferencia entre fail-open (scope sin definir) y fail-closed (scope `True`) mediante el control negativo incluido.
- Documentacion del vector de ataque en la ruta de deserializacion de capas de preprocesamiento (`IndexLookup` / `StringLookup`).
- Referencia cruzada con CVE-2025-12058 (guard original) y CVE-2026-12481 (precedente de correccion en `Lambda`).
- No incluye generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes ni capacidades multilingues.
- No incluye modo thinking, audio ni ninguna capacidad de inferencia neuronal.

## Casos de uso

- Auditoria de seguridad de Keras: verificar si una instalacion concreta de Keras 3.x es vulnerable cargando el `config.json` del PoC y comprobando si se filtra el contenido de `/etc/passwd`.
- Validacion de parches: ejecutar `repro.py` antes y despues de aplicar la correccion propuesta (tratar `None` como modo seguro) para confirmar que la carga falla con `ValueError`.
- Pruebas de regresion en CI: incorporar el PoC como test negativo en pipelines de Keras o de frameworks que embeban Keras, de modo que cualquier regresion del gate de `IndexLookup` rompa la build.
- Formacion en seguridad de cadena de suministro: usar el repositorio como ejemplo didactico de fail-open por truthiness de `None` frente a fail-closed explicito en APIs de deserializacion.
- Endurecimiento de plataformas de modelos: servir como caso de prueba para escaneres que detecten configs de capas con rutas de vocabulario absolutas o externas al archivo del modelo.
- Revision de codigo de terceros: identificar patrones `if in_safe_mode():` en bases de codigo derivadas de Keras y sustituirlos por comprobaciones que traten el estado sin definir como seguro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No requiere GPU: el PoC se ejecuta en CPU con Python, `keras==3.15.1` y `tensorflow==2.20.0`.
- VRAM estimada: 0 GB; no hay inferencia de red neuronal.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: irrelevante para el PoC.
- Despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI; la ejecucion es un script Python (`python repro.py`) dentro de un virtualenv.
- Latencia y throughput: no disponibles; la operacion se limita a la carga de una configuracion y la lectura de un fichero local.

## Comparativa con modelos similares

| Artefacto | Tipo | Objetivo | Licencia | Relevancia |
|---|---|---|---|---|
| `kwlcksec/keras-indexlookup-vocab-path-failopen-poc` | PoC de seguridad | Lectura arbitraria de ficheros via `IndexLookup` en Keras 3.15.1 | no disponible | Demuestra fail-open con scope sin definir |
| CVE-2025-12058 (referencia en la model card) | CVE previa | Guard original en `IndexLookup` | no aplica | Vulnerabilidad que el PoC elude |
| CVE-2026-12481 (referencia en la model card) | CVE previa | Correccion fail-closed en `Lambda` | no aplica | Precedente de la remediacion propuesta |

No se dispone de otros repositorios comparables de PoC en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no es un modelo utilizable para inferencia; no contiene pesos, tokenizador ni pipeline.
- La licencia no esta declarada, por lo que no puede asumirse permiso de uso comercial ni de redistribucion.
- El PoC es sintetico y declarado inofensivo por el autor: sin ejecucion de codigo, sin red y sin acciones destructivas; el impacto se limita a lectura de ficheros locales en texto claro.
- La explotacion requiere que la victima cargue una configuracion de capa no confiable mediante `from_config` o APIs legacy de deserializacion sin un `SafeModeScope` explicito.
- La correccion propuesta en la model card no esta confirmada como aplicada en versiones publicadas de Keras; debe verificarse contra el codigo fuente y los avisos oficiales.
- El PoC apunta a `/etc/passwd`, ruta especifica de sistemas tipo Unix; en otros sistemas operativos el impacto depende de rutas existentes.
- No se han publicado datos de sesgos, alucinacion ni limitaciones de idioma porque no hay modelo subyacente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kwlcksec/keras-indexlookup-vocab-path-failopen-poc
- Referencia CVE-2025-12058 (citada en la model card; sin URL en la informacion disponible)
- Referencia CVE-2026-12481 (citada en la model card; sin URL en la informacion disponible)
- Codigo afectado: `keras/src/layers/preprocessing/index_lookup.py` (sin URL en la informacion disponible)
- Script de reproduccion: `repro.py` dentro del repositorio
- Configuracion de prueba: `config.json` dentro del repositorio
