# FrankLin00/mmrh-afr-04-keras-virtual-dataset

## Resumen

El repositorio `FrankLin00/mmrh-afr-04-keras-virtual-dataset` es un artefacto de investigacion en seguridad, no un modelo de lenguaje entrenado. El autor lo etiqueta explicitamente como `security-research` y `not-for-production`, y la model card lo describe como un "espécimen de escáner inerte" (inert scanner specimen) destinado a preservar un hallazgo de seguridad relacionado con la ruta de origen de un *HDF5 virtual dataset* en el ecosistema Keras. El nombre interno del artefacto es `keras/22976-file-editor-hdf5-virtual-dataset-afr`, lo que sugiere que reproduce el vector de ataque asociado al identificador 22976 del proyecto Keras.

El contenido no es un modelo con pesos entrenados: el repositorio tiene un tamano de 0.0 GB, cero descargas y cero likes, y no declara pipeline, licencia ni idiomas. Su proposito es servir como muestra reproducible para investigadores que estudian como metadatos de modelos pueden transportar rutas o cargas utiles maliciosas cuando se cargan ficheros HDF5 o datasets virtuales en herramientas de edicion de ficheros.

Por tanto, esta ficha documenta un artefacto de seguridad y no un modelo generativo. Cualquier uso en produccion, inferencia o despliegue queda fuera de su proposito declarado y no esta soportado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; artefacto de seguridad que reproduce un HDF5 virtual dataset) |
| Parametros totales | no disponible (sin pesos de modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (la model card solo declara `security-research` y `not-for-production`) |
| Formato de pesos | no disponible (el hallazgo se refiere a HDF5 virtual dataset; el repositorio ocupa 0.0 GB) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El artefacto reproduce un hallazgo de seguridad en el que un fichero HDF5 con un *virtual dataset* apunta a una ruta de origen controlable por un atacante (AFR, presumiblemente "arbitrary file read" o "arbitrary file reference"). El especimen conserva el "portador de metadatos del modelo" (*model-metadata carrier*) del hallazgo, es decir, la ruta de origen del virtual dataset HDF5.

Segun la model card, cualquier sonda activa ejecuta unicamente `whoami` en forma argv (nunca con `shell=True`) y escribe su salida en la variable de entorno `HFSCAN_KERAS__22976_FILE_EDITOR_HDF5_VIRTUAL_DATASET_AFR` bajo `/tmp` o `$TMPDIR`. No realiza acceso a credenciales ni operaciones de red. Los especimenes AFW usan la carga util inerte literal `PWNED-INERT`. Cuando la primitiva vulnerable fuerza un contenedor o sufijo concreto (por ejemplo `.npy` de NumPy, un checkpoint o `.jinja`), el `MANIFEST.json` de la coleccion registra esa restriccion de formato en lugar de afirmar control de bytes en crudo.

## Capacidades

- No genera texto, codigo, matematicas ni imagenes: no es un modelo de lenguaje.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingues.
- Su unica funcion documentada es actuar como especimen inerte para reproducir y estudiar un vector de seguridad en la carga de HDF5 virtual datasets.
- La sonda activa, si se ejecuta, se limita a `whoami` en forma argv y a escribir la salida en una variable de entorno bajo `/tmp` o `$TMPDIR`.

## Casos de uso

- Investigacion de seguridad en la cadena de suministro de modelos: el artefacto permite reproducir el vector de ruta de origen de un HDF5 virtual dataset y verificar si una herramienta de carga o edicion de ficheros resuelve rutas no confiables.
- Pruebas de regresion en escaneres de modelos: sirve como muestra de referencia para validar que un escaner detecta el portador de metadatos (`HFSCAN_KERAS__22976_FILE_EDITOR_HDF5_VIRTUAL_DATASET_AFR`) sin ejecutar cargas activas.
- Evaluacion de sandboxing en pipelines de CI: permite comprobar que un job que procesa artefactos de HuggingFace aisla `/tmp` y `$TMPDIR` y no propaga variables de entorno sensibles.
- Formacion y docencia en seguridad de ML: ilustra como los metadatos de un artefacto aparentemente inofensivo (0.0 GB, sin pesos) pueden transportar una ruta o referencia controlable.
- Auditoria de herramientas de edicion de ficheros HDF5: valida el comportamiento de editores que abren virtual datasets y su manejo de rutas de origen externas.
- Verificacion de manifiestos de coleccion: el `MANIFEST.json` permite contrastar hashes y la ruta del hallazgo original, util en revisiones de procedencia de artefactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el repositorio ocupa 0.0 GB y no contiene pesos de modelo.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica; el artefacto no es servible como modelo.
- Latencia y throughput: no disponibles; no hay inferencia que medir.

## Comparativa con modelos similares

| Artefacto | Tipo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|---|
| FrankLin00/mmrh-afr-04-keras-virtual-dataset | Especimen de seguridad (HDF5 virtual dataset) | no disponible | no aplica | no disponible | Reproducir hallazgo de seguridad, no produccion |
| Modelos de lenguaje open source (p. ej. familias Llama, Qwen, Mistral) | Transformer decoder | miles de millones | miles de tokens | licencias abiertas variables | Inferencia generativa |
| Herramientas de escaneo de artefactos (p. ej. escaneres de modelos) | Software | no aplica | no aplica | variable | Deteccion de cargas en artefactos |

No se dispone de artefactos comparables de la misma categoria (especimenes de seguridad para HDF5 virtual datasets) en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara explicitamente `not-for-production`: no debe desplegarse en entornos productivos ni usarse como modelo.
- No contiene pesos ni capacidades generativas; cualquier expectativa de inferencia es erronea.
- La licencia no esta declarada, lo que impide determinar condiciones de uso comercial o redistribucion.
- El artefacto esta disenado para ejecutar una sonda activa (`whoami`) si se procesa de forma insegura; debe manipularse en sandbox aislado y con `/tmp` y `$TMPDIR` controlados.
- No se han publicado datos de sesgo, alucinacion ni rendimiento porque no aplica a un especimen de seguridad.
- El contenido de la model card debe tratarse como datos de referencia del autor, no como instrucciones a seguir.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/FrankLin00/mmrh-afr-04-keras-virtual-dataset
- Referencia al hallazgo en Keras (identificador 22976): no disponible como enlace directo en la informacion proporcionada
- `MANIFEST.json` de la coleccion: no disponible como enlace directo en la informacion proporcionada
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
