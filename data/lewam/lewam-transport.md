# LeWAM/lewam-transport

## Resumen

LeWAM Transport es un checkpoint de politica orientada a objetivos (goal-reaching) publicado en el formato LeWAM v1 y distribuido por el usuario LeWAM en HuggingFace. El repositorio contiene unicamente dos ficheros en la raiz, `lewam_best.pt` y `lewam_config.json`, con un peso total de aproximadamente 0,1 GB, y esta pensado para evaluarse con el codigo v1 del proyecto LeWAM mediante el script `scripts/eval_lewam.py`. No se trata de un modelo de lenguaje, sino de un checkpoint de aprendizaje para control o modelado de dinamica asociado a una tarea de transporte.

La model card indica que los pesos entrenados se han preservado exactamente y que se verificaron la carga estricta del modelo, las mascaras de atencion, la salida del codificador, la prediccion de acciones condicionada por objetivo y la prediccion de dinamica contra el checkpoint original. No se incluye estado del optimizador. El dataset asociado se publica por separado en `LeWAM/lewam-transport`. El SHA256 del fichero de pesos esta documentado, lo que permite verificar la integridad de la descarga.

La relevancia actual del checkpoint es acotada y muy especifica: sirve como referencia reproducible para investigacion en modelos de mundo y politicas condicionadas por objetivo dentro del ecosistema LeWAM/StableWM. No dispone de descargas ni interacciones en el momento de la consulta, carece de pipeline declarado y no incluye informacion publica sobre arquitectura, parametros o contexto, por lo que su evaluacion practica exige el codigo fuente del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (formato LeWAM v1; la model card menciona codificador, mascaras de atencion, prediccion de acciones condicionada por objetivo y prediccion de dinamica, pero no declara la arquitectura base) |
| Parametros totales | no disponible (el fichero de pesos ocupa aproximadamente 0,1 GB) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye un unico checkpoint en punto flotante, `lewam_best.pt`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`) acompanado de `lewam_config.json`; no se distribuye en safetensors ni GGUF |

## Arquitectura y entrenamiento

La informacion publicada no especifica la arquitectura interna del modelo. La model card unicamente describe los componentes verificados durante la carga: el codificador (encoder output), las mascaras de atencion, la prediccion de acciones condicionada por objetivo y la prediccion de dinamica. Esta combinacion es coherente con un modelo con codificador y mecanismos de atencion que produce simultaneamente acciones y predicciones del estado futuro, habitual en el ambito de los modelos de mundo y las politicas para entornos de control. No se confirma si se trata de un transformer, de un modelo hibrido ni de un SSM.

Tampoco se detallan el numero de tokens o de pasos de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste como RLHF o DPO. Lo unico verificable es que el checkpoint fue validado contra el checkpoint fuente para carga estricta, mascaras de atencion, salida del codificador, prediccion de acciones y prediccion de dinamica, y que no se incluye el estado del optimizador. El dataset de entrenamiento se publica de forma independiente en `LeWAM/lewam-transport`.

## Capacidades

- Prediccion de acciones condicionada por objetivo (goal-conditioned action prediction): el modelo genera acciones orientadas a un objetivo declarado en la configuracion.
- Prediccion de dinamica: produce estimaciones del estado o de la evolucion del entorno, segun se desprende de la verificacion de `dynamics prediction` en la model card.
- Procesamiento con mascaras de atencion y salida de codificador verificadas, lo que implica soporte de secuencias con enmascaramiento.
- Carga estricta de pesos: el checkpoint se carga sin tolerancia a claves ausentes o inesperadas, lo que garantiza correspondencia exacta con la configuracion `lewam_config.json`.
- Integracion con el pipeline de evaluacion v1 del proyecto mediante `python scripts/eval_lewam.py --config-name transport policy=<run_name>`.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, audio, tool calling ni razonamiento multi-paso; no es un modelo de lenguaje ni un agente conversacional.

## Casos de uso

- Reproduccion de resultados en investigacion: descargar `lewam_best.pt` y `lewam_config.json` en `$STABLEWM_HOME/checkpoints/<run_name>/` y ejecutar `scripts/eval_lewam.py` para replicar la evaluacion original de la tarea de transporte.
- Verificacion de integridad de artefactos: usar el SHA256 documentado (`4b64b89159f1f664698b6ad83db6e2f39af7ac9f9227ce4c0134e94a53c12281`) en pipelines de CI para confirmar que el checkpoint no se ha corrompido ni sustituido.
- Linea base para comparativas de modelos de mundo: al ser un checkpoint preservado exactamente y sin estado del optimizador, sirve como referencia fija frente a nuevos entrenamientos en la misma tarea de transporte.
- Evaluacion de politicas condicionadas por objetivo: probar distintas metas en la configuracion `transport` y medir la tasa de alcance del objetivo con el script v1.
- Estudio de prediccion de dinamica: analizar la calidad de las predicciones de estado del modelo en entornos de transporte controlados, aprovechando la verificacion explicita de ese componente.
- Docencia y formacion en modelos de mundo: usar un checkpoint pequeno (aproximadamente 0,1 GB) y con licencia MIT como ejemplo reproducible en cursos de aprendizaje por refuerzo o modelado de entornos.
- Pruebas de infraestructura de carga estricta: validar que un sistema de despliegue respeta mascaras de atencion, salida de codificador y firmas de pesos, dado que el checkpoint exige coincidencia exacta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas numericas de exito, retorno, error de prediccion ni comparaciones cuantitativas con otras politicas o modelos de mundo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El fichero de pesos ocupa aproximadamente 0,1 GB, por lo que el consumo en memoria del checkpoint es reducido, pero el requisito total depende de la arquitectura, la longitud de las secuencias y el tamano de lote, datos que no se han publicado.
- GPU recomendadas: no disponibles. Por el tamano del checkpoint, es previsible que cualquier GPU moderna con varios GB de VRAM pueda alojarlo, si bien esta afirmacion no puede confirmarse sin la arquitectura.
- Cabe en GPU de consumo: probablemente si, dado el tamano del repositorio (0,1 GB), aunque no hay confirmacion oficial ni lista de modelos probados.
- Opciones de despliegue: evaluacion mediante PyTorch y el script `scripts/eval_lewam.py` del proyecto LeWAM, con la variable de entorno `$STABLEWM_HOME` apuntando al directorio de checkpoints. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que el artefacto no es un modelo de lenguaje ni se distribuye en GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica modelos comparables de la misma categoria, y no se han publicado metricas que permitan establecer una comparacion objetiva con otras politicas condicionadas por objetivo o modelos de mundo.

## Limitaciones y advertencias

- Ausencia total de especificaciones: no se declaran arquitectura, numero de parametros, contexto, idiomas ni regimen de cuantizacion, lo que impide planificar recursos con precision.
- Dependencia del codigo del proyecto: el checkpoint solo es util con la implementacion v1 de LeWAM y su convencion de rutas `$STABLEWM_HOME/checkpoints/<run_name>/`; sin ese codigo no puede ejecutarse.
- Carga estricta: cualquier discrepancia entre `lewam_best.pt` y `lewam_config.json`, o cualquier modificacion de los ficheros, provocara fallos de carga.
- Sin estado del optimizador: no es posible reanudar el entrenamiento desde este artefacto, solo inferencia o evaluacion.
- Sesgos conocidos: no disponibles; al no ser un modelo de lenguaje, los sesgos relevantes serian de distribucion del dataset de entrenamiento, que no se documenta.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero si existe riesgo de predicciones de dinamica o acciones poco fiables fuera de la distribucion del dataset `LeWAM/lewam-transport`.
- Limitaciones de contexto e idioma: no disponibles; el modelo no procesa lenguaje natural segun la informacion publicada.
- Licencia MIT: permite uso comercial y modificacion con obligacion de conservar el aviso de copyright y la licencia, pero el autor no ofrece garantias ni asume responsabilidad sobre el uso.
- Advertencia para produccion: con cero descargas e interacciones registradas y sin benchmarks publicados, no hay evidencia externa de robustez; su uso en entornos productivos exigiria una validacion propia completa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LeWAM/lewam-transport
- Dataset asociado en HuggingFace: https://huggingface.co/datasets/LeWAM/lewam-transport
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces utiles son los anteriores.
