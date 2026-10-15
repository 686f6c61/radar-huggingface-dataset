# junjie008/fastwam-v10-predict-correct-adaln-20261015

## Resumen

FastWAM v10 Predict-Correct AdaLN es un checkpoint de inferencia intermedio publicado por el usuario junjie008 dentro del proyecto FastWAM, una pila de investigación orientada a robótica (pipeline `robotics` en HuggingFace). El release corresponde a la ejecución de dos etapas "v10" iniciada el 2026-10-15 y contiene el paso conjunto 2.000 de entrenamiento, tras 1.000 pasos previos de "warmup" del módulo nuevo. No se trata por tanto de un modelo final ni de un checkpoint de referencia, sino de una exportación pensada para evaluación y reproducibilidad de una etapa intermedia del entrenamiento.

El artefacto principal es un fichero PyTorch (`weights/step_002000.pt`) que incluye el MoT entrenado (con los módulos v10), un encoder de propiocepción y metadatos del modelo. El repositorio ocupa 61,4 GB e incorpora además checkpoints adicionales en los pasos 3.000, 4.000, 5.000 y 6.000, cada uno con su `config.yaml`, `dataset_stats.json`, `provenance.json` y `SHA256SUMS`. Los activos congelados externos (VAE y encoder de texto) no se distribuyen con el checkpoint, por lo que se requiere una instalación compatible de FastWAM y ajustar las rutas de configuración específicas de cada máquina.

La relevancia del release es acotada y muy técnica: documenta la modalidad Predict-Correct AdaLN del modelo y permite comparar tres regímenes de inferencia (predicted/predicted autónomo, base/none con inyección desactivada y corrected/oracle con correcciones privilegiadas de simulador), con la indicación explícita de reportar sus tasas de éxito por separado. No se publican especificaciones de tamaño, contexto, licencia ni idiomas, y la propia model card aclara que no se reclama ninguna tasa de éxito online en RoboMME.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoT (Mixture of Transformers) con modulos v10 y condicionamiento AdaLN (adaptive layer normalization), segun la model card y la nomenclatura del release |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos PyTorch `.pt`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`); un unico fichero por checkpoint: `checkpoints/weights/step_XXXXXX.pt` |
| Tarea (pipeline) | robotics |
| Autor | junjie008 |
| Tamano del repositorio | 61,4 GB |
| Checkpoints publicados | joint step 2.000, 3.000, 4.000, 5.000 y 6.000 |
| Componentes incluidos | MoT entrenado con modulos v10, encoder de propiocepcion y metadatos del modelo |
| Componentes no incluidos | VAE y encoder de texto (activos congelados externos), estado de optimizador, scheduler y RNG |
| Idiomas de la documentacion | La model card esta en ingles; la documentacion de inferencia (`docs/V10_PREDICT_CORRECT_ADALN_zh.md`) esta en chino |

## Arquitectura y entrenamiento

La model card describe el contenido del checkpoint como un MoT (Mixture of Transformers) entrenado, que incorpora los módulos específicos de la versión v10, junto con un encoder de propiocepción y metadatos del modelo. El sufijo "Predict-Correct AdaLN" del nombre del release y de la rama de código (`codex/memory-v10-predict-correct-adaln`) indica un mecanismo de predicción-corrección con condicionamiento mediante AdaLN (adaptive layer normalization), así como el uso de correcciones privilegiadas de simulador en el modo "oracle". No se detalla en la información disponible el número de capas, la dimensión oculta, el mecanismo de atención ni el número de tokens de entrenamiento.

En cuanto al proceso de entrenamiento, se trata de una ejecución de dos etapas: 1.000 pasos de warmup de un módulo nuevo seguidos de entrenamiento conjunto. El checkpoint de 2.000 pasos es el primer release conjunto, mientras que los checkpoints de 5.000 y 6.000 se entrenaron con las etiquetas v2 y sin la extensión de supervisión "Unmask". El repositorio no incluye estado de optimizador, scheduler ni RNG, por lo que es una exportación de inferencia y no un archivo que permita reanudar el entrenamiento de forma directa. La integración real con S2/VLM no está incluida en el release.

## Capacidades

- Inferencia de política robótica: el checkpoint contiene el MoT entrenado y el encoder de propiocepción, orientado a la generación de acciones en entornos de manipulación simulados.
- Tres modos de inferencia seleccionables explícitamente: predicted/predicted (autónomo), base/none (inyección desactivada) y corrected/oracle (correcciones privilegiadas del simulador).
- Evaluación con separación de tasas de éxito por régimen: la model card exige reportar la SR de cada modo por separado.
- Normalización de observaciones: cada checkpoint incluye `dataset_stats.json` con las estadísticas de normalización empleadas.
- Trazabilidad y verificación de integridad: `provenance.json` y `SHA256SUMS` permiten auditar el origen y comprobar la integridad de los pesos descargados.
- Comparación de escalado de entrenamiento: los pasos 2.000, 3.000, 4.000, 5.000 y 6.000 están publicados simultáneamente, lo que permite estudiar la evolución del comportamiento entre etapas.
- No se documentan capacidades de generación de texto, código, matemáticas, visión general, tool calling, function calling, agentes ni multilingüismo. La integración con S2/VLM se declara explícitamente fuera del release.

## Casos de uso

- Evaluación de políticas en simulación: cargar el checkpoint de 2.000 pasos con una instalación compatible de FastWAM, ejecutar episodios en el simulador y reportar la tasa de éxito del modo predicted/predicted como referencia autonómica.
- Análisis del efecto de la corrección privilegiada: comparar la tasa de éxito del modo corrected/oracle con la del modo predicted/predicted para cuantificar cuánto del rendimiento depende de las correcciones de simulador y cuánto de la política aprendida.
- Ablación del condicionamiento AdaLN: usar el modo base/none (inyección desactivada) como control experimental frente a los modos con condicionamiento activo, aislando la contribución del mecanismo Predict-Correct.
- Estudio de escalado por pasos de entrenamiento: evaluar de forma homogénea los checkpoints de 2.000, 3.000, 4.000, 5.000 y 6.000 con el mismo harness y las mismas semillas para trazar curvas de rendimiento frente a pasos.
- Auditoría y reproducibilidad de artefactos: verificar los pesos con `sha256sum -c SHA256SUMS` y revisar `provenance.json` antes de incorporar el checkpoint a un pipeline de evaluación interno o a un informe de resultados.
- Reutilización de estadísticas de normalización: emplear `dataset_stats.json` para alinear el preprocesado de observaciones en nuevos experimentos o en réplicas del pipeline de evaluación.
- Integración como punto de partida para investigación en world-action models: partir de este checkpoint intermedio para experimentos propios de ajuste o de análisis de representaciones, asumiendo que no es un modelo final ni dispone de licencia declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reclama ninguna tasa de éxito online en RoboMME ("no online RoboMME success rate is claimed"), por lo que no se dispone de cifras de MMLU, HumanEval, GSM8K ni de métricas de éxito en tareas robóticas para este release.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se declara el número de parámetros del modelo ni la precisión de los pesos, por lo que no es posible calcular una estimación fiable.
- Referencia de tamaño: el repositorio completo ocupa 61,4 GB e incluye cinco checkpoints; cada uno de ellos contiene el MoT entrenado completo más el encoder de propiocepción, de modo que el espacio en disco por checkpoint es una fracción de ese total.
- GPU recomendadas: no disponible. No hay especificación de VRAM mínima ni de GPU objetivo en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible, por ausencia de datos de tamaño del modelo.
- Opciones de despliegue: no se documentan rutas de despliegue con vLLM, llama.cpp, Ollama o TGI. El único procedimiento indicado es la carga mediante PyTorch en una instalación compatible de FastWAM, junto con la documentación `docs/V10_PREDICT_CORRECT_ADALN_zh.md` del repositorio de código.
- Dependencias externas: se requieren el VAE y el encoder de texto de una instalación FastWAM compatible, ya que no se distribuyen con el checkpoint, además de rutas de configuración adaptadas a cada máquina.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica modelos comparables de la misma categoría, tamaño o tarea, ni ofrece métricas que permitan establecer una comparación cuantitativa con alternativas. El release pertenece a una pila de investigación propia (FastWAM) sin licencia declarada ni especificaciones públicas de arquitectura, lo que impide emparejarlo con modelos de referencia sin inventar datos. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo.

## Limitaciones y advertencias

- No es un modelo final: se trata de un checkpoint intermedio (paso conjunto 2.000 tras 1.000 pasos de warmup) de una ejecución de dos etapas, no de un artefacto listo para producción.
- Sin tasa de éxito declarada: el autor indica explícitamente que no se reclama ninguna SR online en RoboMME, por lo que no debe atribuirse ningún rendimiento cuantificado a este release.
- Modos de inferencia no equivalentes: los resultados de los modos predicted/predicted, base/none y corrected/oracle deben reportarse por separado; mezclarlos induciría a error, ya que el modo oracle utiliza correcciones privilegiadas del simulador no disponibles en despliegue real.
- Integración real con S2/VLM no incluida: el release no incorpora esa capa, de modo que cualquier uso que dependa de ella requiere trabajo adicional fuera del checkpoint.
- Sin licencia declarada: no hay licencia publicada, lo que impide determinar las condiciones de uso comercial, redistribución o modificación. Cualquier uso en producción queda sujeto a aclaración previa con el autor.
- Idiomas no declarados: la model card no especifica idiomas soportados; la documentación de inferencia está en chino y la model card en inglés.
- Artefactos externos ausentes: el VAE y el encoder de texto no se distribuyen; sin una instalación FastWAM compatible y rutas ajustadas, el checkpoint no es cargable.
- No reanudable para entrenamiento: no se incluyen estado de optimizador, scheduler ni RNG.
- Acceso restringido: la model card indica que el repositorio es inicialmente privado y que los colaboradores necesitan permiso de lectura, y que el repositorio de código puede requerir acceso separado.
- Riesgo de alucinación y sesgos: no evaluable con la información disponible, al no existir documentación sobre el dataset de entrenamiento ni evaluaciones de sesgo.
- Sin datos de cuantización ni de pesos en otros formatos: solo hay ficheros PyTorch `.pt`, lo que limita las opciones de despliegue en hardware modesto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/junjie008/fastwam-v10-predict-correct-adaln-20261015
- Repositorio de código: https://github.com/Astexia-xuan/fastwam_edit
- Rama de código: `codex/memory-v10-predict-correct-adaln`
- Commit de referencia: `323412b593aef30c8c9baf2303a999e7f99731ce`
- Documentación de inferencia en el repositorio: `docs/V10_PREDICT_CORRECT_ADALN_zh.md`
- Descarga directa de un checkpoint concreto (ejemplo, paso 2.000):
  `hf download junjie008/fastwam-v10-predict-correct-adaln-20261015 --include 'joint/step_002000/*' --local-dir ./fastwam-v10`
- Verificación de integridad: `sha256sum -c SHA256SUMS` dentro del directorio del checkpoint
- Nota sobre la búsqueda web: los resultados obtenidos no guardan relación con el modelo (contenido sobre cuestionarios de la ciudad de Tiflis) y no aportan información adicional aprovechable.
