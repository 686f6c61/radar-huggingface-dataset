# FrankLin00/mmrh-afw-02-keras-symlink-traversal

## Resumen

`FrankLin00/mmrh-afw-02-keras-symlink-traversal` no es un modelo de lenguaje: es un espécimen inerte de investigación en seguridad, publicado en Hugging Face como repositorio de metadatos (0,0 GB) para preservar la traza de un hallazgo académico. El identificador interno del hallazgo es `keras/23015-get-file-symlink-traversal-afw`, y el vector documentado es un nombre de miembro de cadena de enlaces simbólicos dentro de un archivo tar (categoría AFW en la nomenclatura del autor).

El repositorio se etiqueta explícitamente con `security-research` y `not-for-production`, y su model card declara que cualquier sonda activa se limita a ejecutar `whoami` en forma de argv (nunca con `shell=True`) y a escribir la salida en una variable de entorno bajo `/tmp` o `$TMPDIR`, sin acceso a credenciales ni operaciones de red. El payload utilizado es la cadena literal e inerte `PWNED-INERT`.

Por tanto, esta ficha documenta un artefacto de investigación y no un modelo desplegable. No hay arquitectura, pesos, tokenizador ni capacidades de inferencia que evaluar; cualquier uso en producción queda fuera del alcance declarado por el autor y de las propias etiquetas del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; espécimen de investigación en seguridad) |
| Parametros totales | no disponible (repo de 0,0 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no declara licencia; solo etiquetas `security-research` y `not-for-production`) |
| Formato de pesos | no disponible (el repositorio contiene metadatos y un `MANIFEST.json` con hashes según la model card) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El artefacto es un portador de metadatos de un hallazgo: conserva el nombre del miembro de cadena de enlaces simbólicos de un tar que materializa la primitiva vulnerable documentada en `keras/23015-get-file-symlink-traversal-afw`. La model card indica que el `MANIFEST.json` a nivel de colección recoge los hashes y la ruta del hallazgo de origen.

La innovación técnica, en el sentido de la investigación subyacente, es el propio vector: una cadena de enlaces simbólicos dentro de un archivo tar que, al ser procesada por una primitiva de extracción vulnerable, permite un recorrido de rutas (symlink traversal). El espécimen no reproduce la explotación activa; registra la restricción de formato cuando la primitiva impone un contenedor o sufijo concreto (por ejemplo `.npy`, un checkpoint o `.jinja`), en lugar de afirmar control de bytes en crudo.

## Capacidades

- No dispone de generación de texto, razonamiento, código, matemáticas ni visión.
- No dispone de tool calling ni function calling.
- No dispone de soporte para agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües.
- Capacidad declarada: preservación inerte de metadatos de un hallazgo de seguridad (nombre de miembro tar con cadena de symlinks) para investigación académica y para pruebas de escáneres.
- Sonda activa declarada: ejecución de `whoami` en forma argv, con salida escrita en `HFSCAN_KERAS__23015_GET_FILE_SYMLINK_TRAVERSAL_AFW` bajo `/tmp` o `$TMPDIR`; sin acceso a credenciales ni red.

## Casos de uso

- Validación de escáneres de seguridad: emplear el repositorio como muestra de referencia para comprobar que un escáner de artefactos detecta correctamente nombres de miembro tar con cadenas de enlaces simbólicos, usando los hashes del `MANIFEST.json` como verdad de referencia.
- Investigación académica sobre symlink traversal: reproducir en un entorno aislado el análisis de la primitiva `keras/23015-get-file-symlink-traversal-afw` sin necesidad de reconstruir el artefacto original.
- Pruebas de regresión en pipelines de extracción de tar: verificar que las rutinas de desempaquetado rechazan o neutralizan cadenas de symlinks antes de escribir en disco.
- Desarrollo de políticas de cuarentena en registros de modelos: usar el espécimen como caso de prueba para las reglas que bloquean repositorios etiquetados `not-for-production` antes de cualquier descarga automática.
- Formación y concienciación: ilustrar en talleres cómo un artefacto aparentemente inocuo (0,0 GB, sin pesos) puede portar metadatos asociados a una primitiva de recorrido de rutas.
- Auditoría de formatos con restricción de contenedor: comprobar cómo el manifiesto registra la restricción de formato (`.npy`, checkpoint, `.jinja`) cuando la primitiva no permite control de bytes en crudo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos ni grafo de cómputo.
- GPU recomendadas: ninguna; el artefacto no requiere aceleración.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue: no aplica (vLLM, llama.cpp, Ollama y TGI no son pertinentes). El único consumo relevante es el de un escáner o un extractor de tar en un entorno aislado, con la sonda limitada a `whoami` y a escritura en `/tmp` o `$TMPDIR`.
- Latencia y throughput: no disponibles; cualquier medición correspondería al escáner o al extractor, no al repositorio.

## Comparativa con modelos similares

| Artefacto | Naturaleza | Parametros | Contexto | Licencia | Uso previsto |
|---|---|---|---|---|---|
| `FrankLin00/mmrh-afw-02-keras-symlink-traversal` | Espécimen de investigación en seguridad | no disponible (0,0 GB) | no disponible | no disponible | Solo investigación; `not-for-production` |
| Modelos de lenguaje en Hugging Face | Redes neuronales con pesos | según modelo | según modelo | según modelo | Inferencia y despliegue |
| Repositorios de solo metadatos o configuraciones | Configuración, sin pesos | no aplica | no aplica | según repositorio | Referencia y configuración |

No se dispone de otros especímenes AFW de la misma colección en la información proporcionada, por lo que la comparación con alternativas equivalentes queda como no disponible.

## Limitaciones y advertencias

- No es un modelo utilizable: carece de pesos, tokenizador, pipeline y capacidades de inferencia.
- Etiquetado explícitamente `not-for-production`; su uso en producción contraviene la declaración del autor.
- Licencia no declarada en la model card ni en los metadatos disponibles: no hay base explícita para uso comercial.
- El vector documentado (cadena de symlinks en nombres de miembro tar) es sensible desde el punto de vista de seguridad; cualquier reproducción debe hacerse en entorno aislado y con extractores parcheados.
- La sonda activa declarada se limita a `whoami` y a escritura en `/tmp` o `$TMPDIR`; no debe asumirse ni modificarse ese alcance sin revisión del autor.
- El payload es la cadena inerte `PWNED-INERT`; cuando la primitiva impone un contenedor o sufijo, el manifiesto registra la restricción de formato y no control de bytes en crudo, lo que limita las conclusiones que pueden extraerse del espécimen.
- Sin datos de sesgos, alucinación, cobertura idiomática ni límites de contexto, porque no hay modelo subyacente al que aplicarlos.
- Descargas y likes a cero en el momento de la consulta: no hay señal de validación por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/FrankLin00/mmrh-afw-02-keras-symlink-traversal
- Referencia del hallazgo de origen citada en la model card: `keras/23015-get-file-symlink-traversal-afw`
- `MANIFEST.json` de la colección (hashes y ruta del hallazgo): referenciado en la model card, sin URL directa disponible
- Papers, blogs, repositorios y demos adicionales: no disponible en la información proporcionada
