# jc1122/circuit-atlas-snapshots-2

## Resumen

`jc1122/circuit-atlas-snapshots-2` no es un modelo desplegable, sino un repositorio de artefactos de investigación en interpretabilidad mecanicista. Contiene pesos crudos y estados intermedios de entrenamiento de ejecuciones del proyecto Mechanistic Interpretability Circuit Atlas, en su mayoría correspondientes a tareas algorítmicas sin entrada publicada. Es la segunda parte del repositorio `jc1122/circuit-atlas-snapshots`, que alcanzó el límite de ficheros por repositorio de Hugging Face.

El interés es reproducible: sirve para estudiar dinámicas de entrenamiento y fenómenos como el grokking en redes pequeñas entrenadas sobre tareas algorítmicas. Los ficheros se organizan como `runs/<run>/out/<file>.safetensors`, con un `manifest.json` por ejecución que registra nombre de fichero, tamaño y sha256. Un mismo fichero empaquetado puede contener conjuntos de tensores de varias semillas, por lo que no debe interpretarse un fichero como una semilla.

El autor advierte explícitamente de que no son modelos desplegables y de que las ejecuciones intermedias, fallidas o inacabadas pueden no resolver su tarea. No hay información publicada sobre arquitectura, tamaño de parámetros, contexto ni idiomas; el repositorio ocupa 6,1 GB y se distribuye bajo licencia CC BY 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (redes de investigación sobre tareas algorítmicas; arquitectura concreta no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos crudos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors, con manifiesto JSON por ejecución (fichero, tamaño, sha256) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura de las redes incluidas. Por el contexto del proyecto (interpretabilidad mecanicista, grokking, dinámicas de entrenamiento, tareas algorítmicas) se trata de redes pequeñas entrenadas sobre tareas algorítmicas, con snapshots intermedios del entrenamiento. No se especifican número de tokens, composición del dataset, ni si hubo RLHF o DPO.

La innovación relevante no está en el modelo sino en el artefacto: se publican estados intermedios de ejecuciones, incluidas las fallidas o inacabadas, junto con manifiestos con hashes para verificación. El empaquetado agrupa tensores de varias semillas por fichero, lo que exige consultar el manifiesto antes de atribuir un tensor a una semilla concreta. Los detalles de modelo y limitaciones se remiten a la model card del primer repositorio.

## Capacidades

- No es un modelo generativo desplegable: no se documentan capacidades de generación de texto, razonamiento, código, matemáticas ni visión.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües.
- Uso previsto: análisis de circuitos y dinámicas de entrenamiento en tareas algorítmicas, reproducción de experimentos y estudio del grokking.
- Verificación de integridad mediante sha256 en los manifiestos de cada ejecución.

## Casos de uso

- Reproducción de experimentos de interpretabilidad mecanicista: descargar una ejecución concreta, verificar los hashes del manifiesto y comparar los snapshots con los resultados publicados en el repositorio de GitHub del proyecto.
- Estudio del grokking: analizar snapshots intermedios de una misma ejecución para localizar el cambio de régimen en el que la red pasa de memorizar a generalizar en la tarea algorítmica.
- Análisis de circuitos en tareas sin entrada publicada: el repositorio cubre principalmente tareas que no tienen entrada en el atlas original, por lo que sirve para ampliar el corpus de estudio.
- Auditoría de ejecuciones fallidas: al incluir runs fallidos o inacabados, permite estudiar modos de fallo y comparar trayectorias de entrenamiento que no convergen.
- Verificación de resultados por terceros: los manifiestos con tamaño y sha256 permiten comprobar que los tensores analizados son exactamente los publicados por el autor.
- Docencia y formación: material de partida para prácticas sobre dinámicas de entrenamiento en redes pequeñas, con la cautela de que no son modelos desplegables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al no ser un modelo desplegable, no aplica un cálculo estándar de VRAM.
- GPU recomendadas: no disponible.
- Encaje en GPU de consumo: no disponible; el tamaño de cada red individual no está documentado y el total del repositorio (6,1 GB) corresponde a muchos ficheros de ejecuciones distintas.
- Opciones de despliegue: no aplica (vLLM, llama.cpp, Ollama o TGI no son pertinentes para pesos crudos de investigación sin arquitectura documentada).
- Latencia y throughput: no disponibles.
- Almacenamiento: se requiere espacio en disco para el repositorio completo (6,1 GB) o descarga selectiva por fichero de ejecución.

## Comparativa con modelos similares

| Repositorio | Contenido | Tamano | Licencia | Desplegable |
|---|---|---|---|---|
| jc1122/circuit-atlas-snapshots-2 | Snapshots y pesos crudos de ejecuciones del Circuit Atlas (parte 2) | 6,1 GB | CC BY 4.0 | No |
| jc1122/circuit-atlas-snapshots | Primera parte del mismo corpus, hasta el límite de ficheros por repositorio | no disponible | CC BY 4.0 | No |
| Modelos de interpretabilidad comparables de otros autores | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No son modelos desplegables: no deben usarse para inferencia en producción ni para tareas de generación.
- Las ejecuciones intermedias, fallidas o inacabadas pueden no resolver la tarea para la que fueron entrenadas.
- Un fichero empaquetado puede contener tensores de varias semillas; atribuir un fichero a una única semilla es un error.
- No se documentan sesgos, riesgos de alucinación ni limitaciones de idioma porque no hay comportamiento de modelo que evaluar.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero el contenido carece de utilidad como modelo; cualquier uso derivado debe citar al autor.
- La información de arquitectura, parámetros y entrenamiento es escasa; para detalles y limitaciones adicionales hay que consultar la model card del primer repositorio.
- El repositorio se creó y actualizó en noviembre de 2026 según los metadatos de Hugging Face; conviene verificar la fecha real antes de citarlo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jc1122/circuit-atlas-snapshots-2
- Primera parte del corpus: https://huggingface.co/jc1122/circuit-atlas-snapshots
- Repositorio GitHub del proyecto: https://github.com/jc1122/mechanistic-interpretability-circuit-atlas
