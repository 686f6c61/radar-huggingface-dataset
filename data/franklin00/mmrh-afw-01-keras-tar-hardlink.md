# FrankLin00/mmrh-afw-01-keras-tar-hardlink

## Resumen

`FrankLin00/mmrh-afw-01-keras-tar-hardlink` no es un modelo de lenguaje: es un especimen inerte de investigacion en seguridad, publicado en HuggingFace con las etiquetas `security-research` y `not-for-production`. Su nombre interno, `keras/22973-tar-hardlink-name-traversal-afw`, hace referencia a un hallazgo de tipo *tar hardlink member name traversal* (AFW) en el ecosistema Keras, y el repositorio actua como portador de los metadatos del hallazgo en lugar de contener pesos entrenados.

El especimen esta disenado para que cualquier sonda activa ejecute unicamente el comando `whoami` en forma de argv (nunca mediante `shell=True`) y escriba su salida en la variable de entorno `HFSCAN_KERAS__22973_TAR_HARDLINK_NAME_TRAVERSAL_AFW`, bajo `/tmp` o `$TMPDIR`. Segun la model card, no realiza acceso a credenciales ni operaciones de red. El payload inerte literal es `PWNED-INERT`.

Su relevancia es exclusivamente metodologica: sirve como material de referencia para investigadores que estudian la cadena de suministro de artefactos en HuggingFace y las tecnicas de escaneo de modelos. No tiene utilidad como modelo de IA y no debe desplegarse en produccion bajo ninguna circunstancia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de aprendizaje automatico; especimen de seguridad) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio ocupa 0.0 GB; el hallazgo se transporta como nombre de miembro hardlink en un tar) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El artefacto es un *scanner specimen* inerte cuyo unico mecanismo activo es la ejecucion de `whoami` mediante argv, con salida redirigida a la variable de entorno `HFSCAN_KERAS__22973_TAR_HARDLINK_NAME_TRAVERSAL_AFW` en `/tmp` o `$TMPDIR`. La tecnica que representa es un *traversal* en el nombre de un miembro hardlink dentro de un archivo tar, vinculado al identificador de hallazgo `keras/22973`.

El autor indica que, cuando la primitiva vulnerable fuerza un contenedor o sufijo concreto (por ejemplo `.npy` de NumPy, un checkpoint o `.jinja`), el `MANIFEST.json` de la coleccion registra esa restriccion de formato en lugar de afirmar control de bytes en crudo. Dicho manifiesto contiene los hashes y la ruta del hallazgo original. No se documenta ningun proceso de RLHF, DPO ni preentrenamiento.

## Capacidades

- No genera texto, codigo ni realiza razonamiento: es un artefacto inerte sin pesos.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues.
- Unica accion documentada: ejecutar `whoami` en forma argv y escribir la salida en `HFSCAN_KERAS__22973_TAR_HARDLINK_NAME_TRAVERSAL_AFW` bajo `/tmp` o `$TMPDIR`.
- Portador de metadatos del hallazgo `keras/22973` mediante el nombre de miembro hardlink en tar (AFW).
- Payload inerte literal: `PWNED-INERT`.

## Casos de uso

- Investigacion academica de seguridad en la cadena de suministro de modelos: el especimen permite reproducir y estudiar el vector de traversal en nombres de miembros hardlink dentro de archivos tar asociados a artefactos de HuggingFace, sin ejecutar cargas maliciosas reales.
- Validacion de escaneres de artefactos: sirve como caso de prueba controlado para comprobar si una herramienta de escaneo detecta correctamente el patron `keras/22973` y reporta el hallazgo sin falsos negativos.
- Desarrollo de reglas de deteccion: los equipos de seguridad pueden usar el repositorio para calibrar firmas y heuristicas sobre nombres de miembros tar y rutas de hardlink anomalas.
- Formacion y concienciacion: util como ejemplo didactico en talleres sobre riesgos de descarga automatica de artefactos desde hubs publicos.
- Verificacion de aislamiento en sandboxes: al ejecutar solo `whoami` y escribir en `/tmp` o `$TMPDIR`, permite comprobar que un entorno de analisis confina correctamente la ejecucion y la escritura en disco.
- Auditoria de manifiestos: el `MANIFEST.json` de la coleccion permite practicar la verificacion de hashes y la trazabilidad entre hallazgo, especimen y ruta de origen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos ni grafo computacional.
- GPU recomendadas: no aplica; no requiere aceleracion por hardware.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue: no aplica (vLLM, llama.cpp, Ollama o TGI no pueden cargar este artefacto como modelo). Cualquier manipulacion del repositorio debe hacerse en un entorno aislado y desechable.
- Latencia y throughput: no disponibles; la unica accion documentada es la ejecucion de `whoami`, sin metricas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FrankLin00/mmrh-afw-01-keras-tar-hardlink | no disponible (sin pesos) | no disponible | no disponible | no disponible | HuggingFace, 0 descargas, 0 likes |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de especimenes equivalentes documentados en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de IA: no puede emplearse para generacion de texto, codigo, vision ni ninguna tarea de inferencia.
- Etiquetado explicitamente como `not-for-production`; su uso en entornos productivos esta desaconsejado por el propio autor.
- El repositorio no declara licencia, por lo que el regimen de uso comercial es indeterminado y debe consultarse con el autor.
- No se declaran idiomas soportados ni pipeline; los campos correspondientes aparecen como no disponibles.
- Riesgo de confusion: el nombre y la ubicacion en HuggingFace pueden llevar a descargarlo creyendo que es un modelo funcional; conviene verificar siempre el tamano del repositorio (0.0 GB) y las etiquetas.
- Aunque el payload es inerte y limitado a `whoami`, cualquier ejecucion de artefactos de investigacion debe realizarse en sandbox, con red deshabilitada y sin credenciales en el entorno.
- El manifiesto puede registrar restricciones de formato (`.npy`, checkpoint, `.jinja`) en lugar de control de bytes en crudo; no debe interpretarse como una capacidad de ejecucion arbitraria.
- No se han publicado sesgos, tasas de alucinacion ni metricas de calidad porque no aplican a un artefacto sin modelo subyacente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/FrankLin00/mmrh-afw-01-keras-tar-hardlink
- Referencia al hallazgo de origen: `keras/22973` (ruta del hallazgo recogida en el `MANIFEST.json` de la coleccion; no se proporciona URL directa)
- Manifiesto de la coleccion: `MANIFEST.json` (hashes y ruta del hallazgo; no se proporciona URL directa)
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada
