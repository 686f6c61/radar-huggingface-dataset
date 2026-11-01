# halfabillion/huntr-mfv-whisper-tokenizer-safemode-bypass

## Resumen

Este repositorio no contiene un modelo de lenguaje en el sentido habitual, sino un artefacto de investigación en seguridad: un archivo `.keras` manipulado que demuestra una vulnerabilidad en `keras_hub.models.WhisperTokenizer`. El autor, identificado como `halfabillion`, publica un proof-of-concept (PoC) que provoca una lectura arbitraria de archivos JSON locales durante la deserialización, incluso con el modo seguro (`safe_mode=True`) activado por defecto en Keras. El fallo afecta a `keras_hub` 0.32.0 y `keras` 3.15.1.

El problema radica en que `WhisperTokenizer` (y su helper privado `_load_dict`) abre rutas del sistema de archivos controladas por el atacante sin consultar `serialization_lib.in_safe_mode()`. La clase padre `BytePairTokenizer.set_vocabulary_and_merges` sí bloquea correctamente `vocabulary=<path>` en modo seguro, pero Whisper pre-carga el archivo en un diccionario antes de pasarlo al padre, eludiendo esa comprobación. El impacto es divulgación de archivos locales (LFI) en tiempo de carga, no ejecución remota de código.

Es relevante ahora porque afecta a las versiones más recientes de Keras y `keras_hub` en el momento de su publicación, y porque demuestra un patrón de bypass de `safe_mode` que puede replicarse en otros tokenizers de la librería. Cualquier equipo que cargue modelos `.keras` de terceros debería revisar este PoC antes de deserializar artefactos no confiables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (artefacto de seguridad; archivo `.keras` con `config.json` que define un `WhisperTokenizer`) |
| Parametros totales | No disponible (no es un modelo entrenado) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | other |
| Formato de pesos | `.keras` (zip + `config.json`), script `reproduce.py`, `canary_special_tokens.json` |
| Libreria | keras |
| Version afectada | `keras_hub` 0.32.0, `keras` 3.15.1 (probado con TensorFlow 2.21.0 como backend y Python 3.13.5) |
| Clase afectada | `keras_hub.models.WhisperTokenizer` (helper `_load_dict`) |
| Tipo de vulnerabilidad | Deserialización — divulgación de archivos locales (LFI) bajo `safe_mode=True` |
| Impacto | Lectura arbitraria de archivos JSON locales en tiempo de carga; no es RCE |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento: el repositorio aloja un archivo `.keras` manipulado. Internamente, un `.keras` es un contenedor zip con un `config.json` que describe los objetos Keras a reconstruir. En este caso, el campo `special_tokens` del `WhisperTokenizer` apunta a una ruta de archivo JSON local en lugar de a un diccionario embebido.

El flujo vulnerable es el siguiente: al invocar `keras.saving.load_model()` con `safe_mode=True` (valor por defecto), Keras reconstruye el tokenizer. `WhisperTokenizer` llama a `_load_dict`, que abre la ruta indicada en `special_tokens` sin comprobar `serialization_lib.in_safe_mode()`. El contenido del JSON se incorpora al estado del tokenizer. La clase padre `BytePairTokenizer.set_vocabulary_and_merges` sí tiene la comprobación, pero como Whisper le entrega un diccionario ya cargado en lugar de la ruta, el guard nunca se activa. El PoC incluye `canary_special_tokens.json` para verificar la lectura.

La corrección sugerida por el autor es replicar el patrón de BytePair/WordPiece/SentencePiece dentro de `_load_dict` (o en cada punto de llamada): lanzar una excepción cuando se recibe una ruta en forma de cadena y `serialization_lib.in_safe_mode()` es verdadero, en lugar de abrirla.

## Capacidades

- No es un modelo generativo: no produce texto, código ni razonamiento.
- Demuestra una lectura arbitraria de archivos JSON locales durante la deserialización de un `.keras`.
- El `open()` se ejecuta independientemente de que el JSON tenga las claves requeridas por Whisper, según indica la model card.
- Permite verificar el bypass de `safe_mode` comparando el comportamiento del tokenizer BPE padre (que bloquea) con el de `WhisperTokenizer` (que no bloquea).
- Incluye un script de reproducción (`reproduce.py`) y un archivo canario para validar la lectura.
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües.
- Sirve como material de referencia para investigación en seguridad de cadenas de suministro de modelos.

## Casos de uso

- Auditoría de seguridad de `keras_hub`: cargar el PoC en un entorno aislado para confirmar si una versión concreta de la librería es vulnerable antes de actualizar.
- Prueba de regresión tras aplicar un parche: ejecutar `reproduce.py` y comprobar que el canario ya no se lee con `safe_mode=True`.
- Formación de equipos de seguridad: usar el artefacto como ejemplo didáctico de bypass de `safe_mode` en deserialización de modelos.
- Análisis de cadenas de suministro de modelos: incorporar el patrón de ataque a un checklist de revisión de artefactos `.keras` de terceros.
- Desarrollo de detección estática: construir reglas que marquen `special_tokens` con valores de ruta en `config.json` de tokenizers Whisper.
- Investigación de variantes: adaptar la técnica a otros tokenizers de `keras_hub` que pre-carguen archivos antes de delegar en la clase padre.
- Endurecimiento de pipelines de CI: ejecutar la carga de modelos en contenedores sin acceso al sistema de archivos del host para limitar el impacto de LFI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No requiere GPU: es un artefacto de seguridad, no un modelo de inferencia.
- Entorno de reproducción indicado: Python 3.13.5, `keras==3.15.1`, `keras_hub==0.32.0`, `tensorflow==2.21.0` como backend.
- Instalación mediante `python -m venv venv && . venv/bin/activate` y `pip install keras==3.15.1 keras_hub==0.32.0 tensorflow==2.21.0`.
- Se recomienda ejecutarlo en una VM o contenedor aislado, tal como advierte el autor.
- No aplican opciones de despliegue como vLLM, llama.cpp, Ollama o TGI.
- No aplican estimaciones de latencia ni throughput de inferencia.

## Comparativa con modelos similares

| Artefacto | Tipo | Paquete afectado | Impacto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huntr-mfv-whisper-tokenizer-safemode-bypass` | PoC de LFI en deserialización | `keras_hub` 0.32.0 / `keras` 3.15.1 | Lectura de JSON local bajo `safe_mode=True` | other | HuggingFace |
| `BytePairTokenizer.set_vocabulary_and_merges` (comportamiento de referencia) | Guard existente en la clase padre | `keras_hub` | Bloquea `vocabulary=<path>` en modo seguro | no disponible | Incluido en la librería |
| Otros PoC de seguridad en HuggingFace | Artefactos de investigación | Variable | Variable | Variable | No disponible |

No se dispone de información sobre otros PoC comparables en la información proporcionada.

## Limitaciones y advertencias

- Artefacto malicioso por diseño: no debe cargarse fuera de una VM o contenedor aislado.
- El impacto es divulgación de archivos locales (LFI) en tiempo de carga; el autor indica explícitamente que no es RCE.
- Solo se ha probado con `keras_hub` 0.32.0, `keras` 3.15.1 y TensorFlow 2.21.0; otras versiones pueden comportarse de forma distinta.
- La lectura se limita a archivos JSON, según la descripción del fallo.
- La licencia es `other`, sin términos comerciales claros en la información disponible; conviene revisar el texto completo antes de cualquier uso.
- No hay datos de idiomas, sesgos ni alucinación porque no es un modelo de lenguaje.
- Riesgo de cadena de suministro: cualquier `.keras` de terceros con un `special_tokens` que apunte a una ruta podría reproducir el patrón.
- La model card incluye advertencias que deben tratarse como datos de referencia, no como instrucciones a ejecutar sin validación.

## Enlaces

- HuggingFace: https://huggingface.co/halfabillion/huntr-mfv-whisper-tokenizer-safemode-bypass
- Repositorio `keras-hub`: no disponible en la información proporcionada
- Repositorio `keras`: no disponible en la información proporcionada
- Paper o advisory del CVE: no disponible en la información proporcionada
- Blog del autor: no disponible en la información proporcionada
