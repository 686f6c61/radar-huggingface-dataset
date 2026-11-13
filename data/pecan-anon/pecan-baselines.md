# pecan-anon/pecan-baselines

## Resumen

`pecan-anon/pecan-baselines` es un repositorio de artefactos publicado en Hugging Face que contiene modelos de referencia (baselines) reentrenados sobre el benchmark PECAN. No se trata de un modelo de lenguaje generativo, sino de un conjunto de clasificadores clásicos y de un modelo de TensorFlow SavedModel (Guesslang) empaquetados para reproducir los resultados del benchmark. El autor figura como `pecan-anon` (anonimizado), lo que sugiere un contexto de evaluacion academica con revision ciega.

El contenido declarado incluye Guesslang en formato TensorFlow SavedModel, SCC (Naive Bayes, tanto en version corregida como en la version original distribuida) y SCC++ (Random Forest y XGBoost). La model card remite a un documento interno (`docs/README_BASELINES_SCC.md`) dentro del propio artefacto y a un repositorio anonimo en `anonymous.4open.science`, por lo que los detalles tecnicos completos no estan accesibles desde la pagina de Hugging Face.

La relevancia de este repositorio es acotada: sirve como material de reproduccion para investigadores que trabajen con el benchmark PECAN, no como un modelo listo para produccion. El repositorio tiene 0 descargas, 0 likes y un tamano de 0.0 GB reportado, lo que indica que o bien esta vacio o bien contiene unicamente punteros/ficheros de configuracion. No se dispone de informacion sobre arquitectura de lenguaje, tamano de parametros ni contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (incluye Guesslang TensorFlow SavedModel, Naive Bayes, Random Forest y XGBoost) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | TensorFlow SavedModel; modelos clasicos (Naive Bayes, Random Forest, XGBoost) en formato no especificado |

## Arquitectura y entrenamiento

La informacion disponible no describe una arquitectura de red neuronal unica. El repositorio agrupa varios baselines de distinta naturaleza: Guesslang, que es un modelo basado en TensorFlow distribuido como SavedModel y orientado a la deteccion de lenguajes de programacion; SCC, un clasificador Naive Bayes en dos variantes (corregida y tal como se distribuye originalmente); y SCC++, que combina Random Forest y XGBoost. No se especifican hiperparametros, volumen de datos de entrenamiento, composicion del corpus ni si hubo ajuste fino o validacion cruzada.

Tampoco se documenta en la model card ningun detalle sobre el benchmark PECAN en si (numero de clases, tarea exacta, metrica principal). La unica referencia tecnica es el fichero `docs/README_BASELINES_SCC.md` dentro del artefacto y el repositorio anonimo enlazado, que no se han podido consultar. No hay informacion sobre innovaciones tecnicas como decodificacion especulativa, atencion lineal ni tecnicas de alineacion (RLHF/DPO), que en cualquier caso no aplicarian a clasificadores clasicos.

## Capacidades

- Clasificacion de texto segun la tarea definida en el benchmark PECAN (naturaleza exacta no disponible).
- Guesslang: deteccion de lenguaje de programacion a partir de fragmentos de codigo, en su variante TensorFlow SavedModel.
- SCC (Naive Bayes): clasificacion probabilistica simple, en version corregida y en version original.
- SCC++ (Random Forest, XGBoost): clasificacion basada en ensembles de arboles.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue mas alla de la que aporte Guesslang por si mismo.
- No se documentan modos especiales (thinking mode, vision, audio).

## Casos de uso

- Reproduccion de resultados del benchmark PECAN: el repositorio permite a investigadores reejecutar los baselines reportados en el paper asociado y verificar las cifras publicadas, usando los artefactos tal cual se distribuyen.
- Comparacion de metodos clasicos frente a modelos neuronales: util para situar el rendimiento de Naive Bayes, Random Forest y XGBoost como linea base frente a propuestas mas complejas evaluadas sobre el mismo benchmark.
- Deteccion de lenguaje de programacion: el SavedModel de Guesslang puede emplearse para identificar el lenguaje de un fragmento de codigo en herramientas de analisis estatico o resaltado sintactico, siempre que se valide su comportamiento fuera del benchmark.
- Auditoria metodologica: la doble version de SCC (corregida y original) permite estudiar el impacto de correcciones en la implementacion de un baseline sobre las metricas finales.
- Docencia en evaluacion de modelos: sirve como ejemplo practico de como empaquetar y publicar baselines heterogeneos (TensorFlow, scikit-learn, XGBoost) para un benchmark reproducible.
- Integracion en pipelines de evaluacion automatizada: los clasificadores pueden cargarse en scripts de evaluacion para generar predicciones sobre nuevos conjuntos de datos que sigan el mismo formato que PECAN.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de clasificadores clasicos y un SavedModel de Guesslang, el consumo previsible es bajo, pero no hay cifras confirmadas.
- GPU recomendadas: no disponible; Guesslang puede ejecutarse en CPU, pero no se documenta el rendimiento.
- Compatibilidad con GPU de consumo: no confirmada; por la naturaleza de los modelos (Naive Bayes, Random Forest, XGBoost) es probable que la inferencia sea viable en CPU, sin que esto este verificado.
- Opciones de despliegue: TensorFlow Serving o carga directa de SavedModel para Guesslang; scikit-learn y XGBoost para los clasificadores clasicos. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a estos formatos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pecan-anon/pecan-baselines | Baselines de clasificacion (Guesslang, NB, RF, XGBoost) | No disponible | No aplica | No disponible | Hugging Face (0 descargas) |
| Guesslang (original) | Detector de lenguaje de programacion | No disponible | No aplica | No disponible en esta ficha | Distribucion independiente |
| Baselines SCC del paper original | Naive Bayes / Random Forest / XGBoost | No aplica | No aplica | No disponible | Referenciados en el repositorio anonimo |

No se dispone de datos suficientes para comparar parametros, contexto ni rendimiento con alternativas equivalentes.

## Limitaciones y advertencias

- La model card es minima y remite a documentacion interna no accesible desde Hugging Face; no hay informacion verificable sobre el benchmark ni sobre los modelos.
- El repositorio reporta 0.0 GB de tamano, lo que sugiere que puede estar vacio o contener solo metadatos; conviene verificar los ficheros antes de usarlo.
- No se especifica licencia, lo que impide determinar si el uso comercial esta permitido; debe consultarse al autor o al repositorio anonimo.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de idioma; al ser clasificadores, el riesgo de alucinacion no aplica en el sentido habitual, pero si el de clasificaciones erroneas fuera de la distribucion de entrenamiento.
- La autoría anonimizada (`pecan-anon`) y el enlace a `anonymous.4open.science` indican un artefacto en evaluacion ciega; su permanencia y mantenimiento no estan garantizados.
- No apto como modelo de lenguaje generativo: no debe emplearse para generacion de texto, codigo, razonamiento ni tareas conversacionales.
- Cualquier uso en produccion requiere validacion previa del formato de los artefactos y de las dependencias (TensorFlow, scikit-learn, XGBoost) en el entorno destino.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/pecan-anon/pecan-baselines
- Repositorio del artefacto (anonimo): https://anonymous.4open.science/r/pecan-benchmark
