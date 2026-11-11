# rprodrigues/qsar-selo-teste

## Resumen

`rprodrigues/qsar-selo-teste` es un artefacto de modelo predictivo de tipo QSAR (Quantitative Structure-Activity Relationship) publicado en Hugging Face por el investigador Rodrigo Pestana Rodrigues (ORCID 0009-0001-9933-2157) a través de la plataforma de código abierto QSAR IA. No se trata de un modelo de lenguaje ni de un transformer generativo: es un modelo de quimioinformática orientado a predecir propiedades o actividades moleculares a partir de descriptores estructurales, en el contexto del descubrimiento de fármacos.

El repositorio tiene un tamaño de 0,0 GB, cero descargas y cero likes en el momento de la consulta, y la model card no especifica pipeline, idiomas ni arquitectura del modelo subyacente. El contenido principal es un fichero `projects/trains/1/model.pt` acompañado de un sello de autoría (`autoria.json`) que incluye el hash SHA-256 del modelo, el ORCID del autor y una firma Ed25519, un mecanismo pensado para garantizar trazabilidad y reproducibilidad científica.

Su relevancia es fundamentalmente metodológica: ilustra un flujo de publicación de modelos QSAR con verificación criptográfica de autoría y cadena de custodia en caso de reentrenamiento. No obstante, la ausencia de documentación técnica sobre arquitectura, datos de entrenamiento, métricas o tareas objetivo limita seriamente su reutilización directa por terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `model.pt` (PyTorch, segun la ruta indicada en la model card) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura del modelo. El unico artefacto descrito es `projects/trains/1/model.pt`, un fichero de pesos en formato PyTorch generado por la plataforma QSAR IA. No se especifica si se trata de un modelo lineal, un random forest, una red neuronal feed-forward, un GNN sobre grafos moleculares o cualquier otra familia de modelos de aprendizaje automatico supervisado.

Tampoco se documentan el conjunto de datos de entrenamiento, el numero de compuestos, los descriptores o fingerprints utilizados, el tipo de variable objetivo (clasificacion o regresion), ni si hubo validacion externa. La model card menciona unicamente el ecosistema QSAR IA como marco de generacion y el sistema de sello de autoria basado en SHA-256 + ORCID + firma Ed25519, que registra si el modelo fue reentrenado y conserva la cadena de autores previos. En este caso, `trains/1/model.pt` figura como inalterado con el sello original del autor.

## Capacidades

- Prediccion QSAR: el modelo esta disenado, segun las etiquetas del repositorio, para tareas de relacion cuantitativa estructura-actividad en quimioinformatica.
- Descubrimiento de farmacos: las tags `drug-discovery` y `cheminformatics` indican un uso previsto en investigacion farmaceutica temprana.
- Reproducibilidad cientifica: incluye sello de autoria verificable criptograficamente (SHA-256, ORCID, Ed25519).
- Trazabilidad de reentrenamientos: el esquema `autoria.json` permite conservar la cadena de autores en modelos derivados.
- Generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes o capacidades multilingues: no disponibles; no es un modelo de lenguaje.

## Casos de uso

- Cribado virtual de compuestos: el modelo podria puntuar bibliotecas quimicas para priorizar candidatos con mayor probabilidad de actividad, si bien la falta de documentacion sobre la variable objetivo impide confirmar la tarea concreta.
- Reproduccion de estudios QSAR: al incluir sello de autoria y hash del fichero de pesos, permite verificar que el modelo evaluado coincide exactamente con el publicado.
- Auditoria de autoría en publicaciones cientificas: el esquema `autoria.json` con firma Ed25519 facilita demostrar quien entreno cada version del modelo en un articulo o preprint.
- Integracion en pipelines de QSAR IA: el modelo esta pensado para cargarse dentro de la plataforma de codigo abierto QSAR IA, que gestiona el ciclo de vida completo del proyecto.
- Docencia y formacion en quimioinformatica: sirve como ejemplo de publicacion reproducible de modelos predictivos con licencia permisiva MIT.
- Base para reentrenamiento y comparacion: al ser un artefacto pequeno (0,0 GB) y con licencia MIT, puede reutilizarse como punto de partida para experimentos propios, conservando la cadena de autoria si se redistribuye.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamano del repositorio es de 0,0 GB, por lo que probablemente se ejecuta en CPU sin GPU dedicada, aunque no se confirma.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: no confirmada; por el tamano del artefacto es plausible que no requiera GPU, pero no se documenta.
- Opciones de despliegue: carga directa del fichero `model.pt` con PyTorch o a traves de la plataforma QSAR IA (https://github.com/altobellibm/qsar_ia_project). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos QSAR comparables ni datos de rendimiento que permitan establecer una comparacion con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se especifican arquitectura, datos de entrenamiento, variable objetivo ni metricas, lo que impide evaluar su validez cientifica.
- Riesgo de sobreajuste o sesgo desconocido: sin informacion sobre el conjunto de entrenamiento ni sobre el dominio de aplicabilidad quimico, no puede descartarse un rendimiento pobre fuera de la serie de compuestos original.
- Cero validacion externa publicada: no hay benchmarks, descargas ni citas que respalden su uso en produccion o en investigacion independiente.
- Ambito limitado: no es un modelo de lenguaje; no debe emplearse para generacion de texto, codigo ni tareas conversacionales.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero no exime de la responsabilidad cientifica sobre las predicciones.
- Sello de autoria: si se reentrena o modifica el fichero `model.pt`, el hash cambiara y debera generarse un nuevo `autoria.json`; publicar pesos alterados sin actualizar el sello rompe la cadena de trazabilidad.
- Fecha de creacion futura en los metadatos (2026-11-11): conviene verificar la integridad del repositorio antes de confiar en sus metadatos.

## Enlaces

- Hugging Face: https://huggingface.co/rprodrigues/qsar-selo-teste
- Repositorio del proyecto QSAR IA: https://github.com/altobellibm/qsar_ia_project
- ORCID del autor: https://orcid.org/0009-0001-9933-2157
