# FrankLin00/mmrh-afw-02b-keras-symlink-with-weight

## Resumen

El repositorio `FrankLin00/mmrh-afw-02b-keras-symlink-with-weight` no contiene un modelo de lenguaje entrenado, sino una muestra inerte (specimen) de investigación en seguridad etiquetada como `security-research` y `not-for-production`. Según su model card, se trata de una reproducción del hallazgo `keras/23015-get-file-symlink-traversal-afw`, cuyo vector de ataque es un nombre de miembro de cadena de enlaces simbólicos dentro de un archivo tar (categoría AFW). El repositorio existe como "carrier" de metadatos del modelo para preservar el contexto del hallazgo, no como artefacto utilizable.

El contenido declarado es explícitamente inerte: la carga útil literal es `PWNED-INERT` y cualquier sonda activa ejecuta únicamente `whoami` en forma argv (nunca con `shell=True`), escribiendo su salida en una variable de entorno bajo `/tmp` o `$TMPDIR`. La model card afirma que no realiza acceso a credenciales ni operaciones de red.

No hay información sobre arquitectura, tamaño de parámetros, longitud de contexto ni datos de entrenamiento. El repositorio tiene 0 descargas y 0 likes, fue creado y actualizado el 2026-11-04 y no declara licencia, idiomas ni pipeline. Cualquier evaluación como modelo de IA generativa carece de sentido: la ficha siguiente documenta lo que el autor declara y marca el resto como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no contiene un modelo entrenado; es una muestra de investigación en seguridad) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (la model card menciona restricciones de formato como `.npy`, checkpoints o `.jinja` para ciertas muestras AFW, pero no se especifica el formato de este repositorio) |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura de red neuronal ni proceso de entrenamiento. El artefacto es una muestra de seguridad ("inert scanner specimen") que preserva el carrier de metadatos del hallazgo `keras/23015-get-file-symlink-traversal-afw`, clasificado como AFW (nombre de miembro de cadena de enlaces simbólicos en tar). No hay datos sobre tokens de entrenamiento, composición del dataset, RLHF, DPO ni innovaciones técnicas de modelado.

La model card indica que las muestras AFW usan la carga útil inerte `PWNED-INERT` y que, cuando la primitiva vulnerable fuerza un contenedor o sufijo (por ejemplo `.npy`, un checkpoint o `.jinja`), el manifiesto registra esa restricción de formato en lugar de afirmar control de bytes en crudo. Los hashes y la ruta del hallazgo original se remiten al `MANIFEST.json` a nivel de colección.

## Capacidades

- No es un modelo generativo: no produce texto, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües.
- Capacidad declarada: servir como muestra inerte para investigación académica de seguridad y preservación de metadatos de un hallazgo (symlink traversal en tar).
- Sonda activa declarada: ejecuta únicamente `whoami` en forma argv y escribe la salida en `HFSCAN_KERAS__23015_GET_FILE_SYMLINK_TRAVERSAL_AFW` bajo `/tmp` o `$TMPDIR`.

## Casos de uso

- Reproducción controlada de hallazgos de seguridad: usar el repositorio como artefacto de referencia para validar que un escáner detecta el carrier de metadatos descrito en `keras/23015-get-file-symlink-traversal-afw`, en un entorno aislado.
- Desarrollo de reglas de detección: alimentar escáneres de artefactos (por ejemplo, análisis de tar y enlaces simbólicos) con esta muestra para comprobar que las reglas identifican cadenas de symlinks maliciosas.
- Pruebas de pipelines de cuarentena: verificar que un sistema de ingesta de modelos rechaza o aísla repositorios etiquetados como `not-for-production`.
- Formación y concienciación: material didáctico sobre riesgos de traversal de enlaces simbólicos en artefactos de modelos, siempre en sandbox.
- Validación de aislamiento de sandboxes: comprobar que la sonda declarada (`whoami`) queda confinada y que no hay acceso a red ni a credenciales.
- Auditoría de metadatos: contrastar los hashes del `MANIFEST.json` con el contenido del repositorio para verificar integridad de la muestra.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no es un modelo evaluable con MMLU, HumanEval, GSM8K ni métricas equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos de modelo que cargar.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; no hay inferencia que medir.
- Para manipular la muestra con seguridad se recomienda un contenedor o máquina virtual aislada, sin acceso a red ni a credenciales, y con el sistema de archivos montado en solo lectura siempre que sea posible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otros repositorios comparables de la misma categoría (muestras inertes de investigación en seguridad) con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El propio autor etiqueta el repositorio como `not-for-production`; no debe desplegarse en entornos productivos.
- No es un modelo de IA: no genera texto ni responde a prompts.
- No se declara licencia, lo que impide determinar condiciones de uso comercial o redistribución.
- No se declaran idiomas soportados ni pipeline.
- Riesgo de malinterpretación: agregadores y pipelines automáticos podrían tratar el repositorio como un modelo válido por su nombre y metadatos.
- La sonda descrita ejecuta `whoami` y escribe en `/tmp` o `$TMPDIR`; debe ejecutarse solo en sandbox y con permisos mínimos.
- La model card advierte de restricciones de formato en algunas muestras AFW (`.npy`, checkpoints, `.jinja`), por lo que no debe asumirse control de bytes en crudo.
- No hay datos públicos de sesgos, alucinación ni rendimiento porque no hay modelo subyacente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/FrankLin00/mmrh-afw-02b-keras-symlink-with-weight
- Referencia al hallazgo citado en la model card: `keras/23015-get-file-symlink-traversal-afw` (sin URL directa en la información proporcionada)
- `MANIFEST.json` de la colección: mencionado en la model card, sin URL directa en la información proporcionada
- El resultado de búsqueda web proporcionado no guarda relación con el modelo y se omite por no ser relevante.
