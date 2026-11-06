# FrankLin00/mmrh-afw-01b-keras-tar-hardlink-with-weight

## Resumen

`FrankLin00/mmrh-afw-01b-keras-tar-hardlink-with-weight` es un artefacto publicado en Hugging Face que no constituye un modelo de lenguaje entrenado, sino un espécimen inerte ("inert scanner specimen") diseñado para investigación en seguridad académica. Su nombre interno, `keras/22973-tar-hardlink-name-traversal-afw`, hace referencia a un hallazgo de tipo *tar hardlink member name traversal* (AFW) en el ecosistema de Keras, y el repositorio preserva el vector de metadatos del modelo que transporta dicho hallazgo. La model card lo etiqueta explícitamente como `security-research` y `not-for-production`.

El artefacto no expone pipeline, licencia, idiomas ni parámetros declarados, y su único contenido funcional descrito es una sonda activa que ejecuta `whoami` en forma de argv (nunca mediante `shell=True`) y escribe la salida en una variable de entorno bajo `/tmp` o `$TMPDIR`. No realiza acceso a credenciales ni operaciones de red. El payload utilizado por los especímenes AFW es el literal inerte `PWNED-INERT`.

Por tanto, esta ficha documenta un objeto de investigación de vulnerabilidades, no un modelo utilizable para inferencia. Cualquier evaluación de capacidades, benchmarks o despliegue carece de sentido técnico en este caso, y así se refleja en las secciones siguientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; espécimen de investigación en seguridad) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene un artefacto tar con hardlink y pesos asociados según el nombre del repo; el formato exacto no se detalla) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El repositorio es un espécimen de escaneo inerte construido para preservar un hallazgo de seguridad: la manipulación del nombre de un miembro hardlink dentro de un archivo tar, identificado como `keras/22973-tar-hardlink-name-traversal-afw`. El nombre del repositorio sugiere la presencia de un archivo tar con hardlinks y un fichero de pesos, pero la model card no describe la estructura interna ni el contenido de los pesos.

La única lógica activa documentada es una sonda que ejecuta el comando `whoami` mediante argv y vuelca su salida a la variable de entorno `HFSCAN_KERAS__22973_TAR_HARDLINK_NAME_TRAVERSAL_AFW` en `/tmp` o `$TMPDIR`. El payload inyectado es el literal `PWNED-INERT`. Cuando la primitiva vulnerable impone un contenedor o sufijo concreto (por ejemplo `.npy` de NumPy, un checkpoint o `.jinja`), el `MANIFEST.json` de la colección registra esa restricción de formato en lugar de afirmar control de bytes en crudo. No se dispone de datos sobre tokens de entrenamiento, composición del dataset ni técnicas de alineación como RLHF o DPO.

## Capacidades

- No es un modelo generativo: no produce texto, código, matemáticas ni razonamiento.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües.
- Capacidad documentada: ejecución de una sonda `whoami` en forma argv y escritura de la salida en una variable de entorno bajo `/tmp` o `$TMPDIR`.
- Capacidad documentada: preservación del vector de metadatos de un hallazgo de seguridad (nombre de miembro hardlink en tar).
- No realiza acceso a credenciales ni operaciones de red, según la model card.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación académica en seguridad de la cadena de suministro de modelos: el artefacto sirve como muestra reproducible para estudiar cómo un nombre de miembro hardlink en un tar puede actuar como vector de metadatos en repositorios de modelos.
- Desarrollo y validación de escáneres de artefactos en Hugging Face: permite comprobar que una herramienta de análisis detecta especímenes AFW y verifica el payload inerte `PWNED-INERT` sin riesgo de ejecución maliciosa.
- Pruebas de regresión en pipelines de escaneo: al ser inerte y no realizar red ni acceso a credenciales, puede incorporarse a suites de test que validen la detección de traversal en archivos tar.
- Formación y concienciación en seguridad: útil como ejemplo didáctico de un hallazgo real etiquetado como `security-research` y `not-for-production`.
- Verificación de restricciones de formato: el `MANIFEST.json` de la colección documenta cuándo la primitiva fuerza un contenedor o sufijo (`.npy`, checkpoint, `.jinja`), lo que permite estudiar cómo cambia el vector según el formato.
- Auditoría de metadatos en colecciones de modelos: permite contrastar hashes y rutas de origen del hallazgo recogidos en el manifiesto de la colección.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto no es un modelo de lenguaje y no procede evaluarlo con MMLU, HumanEval, GSM8K ni métricas equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay inferencia neuronal.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; la única operación descrita es la ejecución de `whoami` y la escritura de su salida en `/tmp` o `$TMPDIR`.
- Requisito de entorno: acceso de escritura a `/tmp` o a `$TMPDIR` para la sonda descrita.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Uso previsto |
|---|---|---|---|---|---|
| `FrankLin00/mmrh-afw-01b-keras-tar-hardlink-with-weight` | Espécimen de investigación en seguridad | no disponible | no disponible | no disponible | Solo investigación; no producción |
| Modelos de lenguaje de la familia Keras/keras-hub | Redes neuronales | variable | variable | variable | Inferencia y entrenamiento |
| Especímenes AFW de otras colecciones de escaneo | Artefactos inertes de seguridad | no aplica | no aplica | no disponible | Investigación de vulnerabilidades |

No se dispone de datos de rendimiento comparables, ya que el artefacto no ejecuta tareas de modelado.

## Limitaciones y advertencias

- No apto para producción: la model card lo etiqueta explícitamente como `not-for-production`.
- No es un modelo de lenguaje: no genera texto, código ni respuestas; cualquier uso como LLM fallará.
- Licencia no declarada: la ausencia de licencia impide determinar condiciones de uso comercial o redistribución.
- Riesgo de seguridad: preserva un vector de traversal en nombres de miembros hardlink de archivos tar; debe manejarse en entornos aislados y con escaneo previo.
- La sonda ejecuta `whoami` y escribe en `/tmp` o `$TMPDIR`; aunque la model card afirma que no hay acceso a credenciales ni red, conviene verificar el comportamiento en el entorno de ejecución concreto.
- El payload es inerte (`PWNED-INERT`), pero el `MANIFEST.json` puede imponer restricciones de formato (`.npy`, checkpoint, `.jinja`) que limitan el control de bytes en crudo.
- Sin idiomas, pipeline ni parámetros declarados: no es posible evaluar sesgos, alucinación ni cobertura lingüística.
- Fecha de creación y actualización idénticas (2026-11-04), sin historial de revisiones que permita auditar cambios.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/FrankLin00/mmrh-afw-01b-keras-tar-hardlink-with-weight
- Referencia al hallazgo de origen en el nombre del artefacto: `keras/22973-tar-hardlink-name-traversal-afw`
- Manifiesto de la colección: `MANIFEST.json` (referenciado en la model card; no se proporciona URL directa)
