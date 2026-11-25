# manifoldai-research/WorldScape-Policy-2-5

## Resumen

WorldScape Policy 2.5 (WSP-2-5) es un modelo de politica robotica (world-action model) desarrollado por manifoldai-research, orientado a la generacion de acciones motrices a partir de observaciones visuales y de estado en entornos de manipulacion robotica. Se distribuye en formato safetensors dentro de un repositorio de 35,0 GB y esta etiquetado con el pipeline `robotics` de Hugging Face, lo que lo situa en la categoria de modelos de control para agentes fisicos mas que en la de modelos de lenguaje generativo.

La model card publicada es muy escueta: identifica una unica variante, WSP-2-5-Preview-Robodojo, descrita como checkpoints de WorldScape Policy 2.5 con post-entrenamiento sobre RoboDojo. Ambos variantes soportan control articular absoluto del robot `arx_x5` en modo interactivo. No se documentan en la informacion disponible la arquitectura interna, el numero de parametros, la longitud de contexto ni los datos de entrenamiento.

Su relevancia actual reside en la integracion con RoboDojo, un entorno de evaluacion de politicas roboticas, y en la licencia Apache-2.0, que facilita su uso comercial y su modificacion. La informacion publica es, no obstante, insuficiente para evaluar el rendimiento del modelo sin consultar el repositorio o el codigo de inferencia downstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (world-action model para robotica) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado en la informacion disponible la arquitectura concreta del modelo. La model card lo clasifica como `world-action-model`, una categoria que en robotica designa modelos que combinan un modelo de mundo (prediccion de la evolucion del entorno) con una politica de accion (seleccion de comandos motrices). El repositorio incluye, por cada directorio de modelo, los pesos, el tokenizer, la configuracion y las estadisticas de normalizacion, lo que sugiere un pipeline de entrenamiento con normalizacion de observaciones y acciones.

El entrenamiento declarado incluye una fase de post-entrenamiento sobre RoboDojo para la variante WSP-2-5-Preview-Robodojo. No se especifican el numero de tokens, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o aprendizaje por imitacion. La instalacion y la inferencia se delegan explicitamente a la politica downstream, por lo que el modelo no es autocontenido a nivel de ejecucion.

## Capacidades

- Generacion de acciones de control roboticos a partir de observaciones, en el marco de un world-action model.
- Control articular absoluto del robot `arx_x5` en modo interactivo.
- Post-entrenamiento especifico para el entorno de evaluacion RoboDojo.
- Soporte de los idiomas en y zh en las etiquetas del repositorio (relevante para instrucciones o metadatos multilingues, no necesariamente para el control motor).
- Distribucion de pesos, tokenizer, configuracion y estadisticas de normalizacion listos para integracion en un pipeline de politica downstream.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision general, audio ni modo thinking.

## Casos de uso

- Evaluacion de politicas en RoboDojo: cargar los checkpoints WSP-2-5-Preview-Robodojo y medir la tasa de exito en las tareas del benchmark para comparar variantes de politica.
- Control articular de un robot arx_x5 en laboratorio: usar el modo interactivo con control absoluto de articulaciones para teleoperacion asistida o ejecucion de trayectorias predefinidas.
- Investigacion en world-action models: emplear el modelo como base para estudiar la relacion entre prediccion del entorno y seleccion de acciones en manipulacion robotica.
- Fine-tuning sobre un nuevo entorno: partir de los pesos publicados y reentrenar con las estadisticas de normalizacion propias del robot objetivo, aprovechando la licencia Apache-2.0.
- Integracion en pipelines de simulacion: conectar el modelo a un simulador mediante la politica downstream para generar rollouts y analizar la robustez de las acciones.
- Prototipado de aplicaciones de robotica de servicio: desplegar el modelo en un banco de pruebas con un arx_x5 para validar tareas de pick-and-place antes de pasar a produccion.
- Reproducibilidad de resultados: descargar el repositorio completo (35,0 GB) y replicar las condiciones de evaluacion declaradas por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del repositorio (35,0 GB) da una cota inferior orientativa del espacio en disco necesario para los pesos en precision original.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la model card indica que la instalacion y la inferencia las gestiona la politica downstream; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (world-action models para robotica) ni datos de rendimiento que permitan establecer una comparacion fundamentada.

## Limitaciones y advertencias

- La model card es minima: no documenta arquitectura, parametros, contexto ni datos de entrenamiento, lo que dificulta la evaluacion tecnica previa a su adopcion.
- El modelo no es autocontenido: requiere una politica downstream para la instalacion y la inferencia, lo que anade dependencias no especificadas.
- El control articular documentado se limita al robot `arx_x5`; no se garantiza su transferencia a otras plataformas sin reentrenamiento.
- No se han publicado benchmarks, por lo que no existe evidencia publica de rendimiento en tareas de manipulacion.
- Riesgo de alucinacion y sesgos: no evaluable con la informacion disponible; en modelos de accion, el riesgo equivalente es la generacion de comandos motrices invalidos o inseguros.
- Uso en produccion: la licencia Apache-2.0 permite uso comercial, pero la ausencia de documentacion sobre seguridad y validacion exige pruebas exhaustivas en entornos controlados antes de desplegar el modelo en un robot real.
- El soporte de idiomas se limita a en y zh segun las etiquetas; no se documenta el comportamiento en castellano.

## Enlaces

- Hugging Face: https://huggingface.co/manifoldai-research/WorldScape-Policy-2-5
- Repositorio de la variante: https://huggingface.co/manifoldai-research/WorldScape-Policy-2-5/tree/main/wsp_2_5_preview_posttrain_robodojo
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- No se han encontrado en la informacion disponible enlaces adicionales a papers, blogs, repositorios de codigo o demos.
