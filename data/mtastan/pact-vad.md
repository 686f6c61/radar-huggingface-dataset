# mtastan/PACT-VAD

## Resumen

PACT-VAD es un conjunto de checkpoints para deteccion de anomalias en video (VAD, *video anomaly detection*) entrenado bajo un regimen de aprendizaje debilmente supervisado. El modelo lo publica el usuario mtastan en Hugging Face y acompana un estudio de transferencia controlada: los pesos distribuidos son los seleccionados por validacion para ese experimento, no un modelo de proposito general. El repositorio contiene 180 checkpoints objetivo (3 conjuntos de datos × 6 condiciones × 10 semillas) mas un checkpoint fuente que actua como backbone temporal fijo (PreVAD) del que parten todas las ejecuciones de transferencia.

La relevancia del artefacto es metodologica: la regla de seleccion es explicita (la epoca mas temprana que alcanza el maximo AUC de video en validacion) y se publica un manifiesto con conjunto de datos, condicion, semilla, epoca seleccionada, tamano de fichero y digest SHA-256 de cada checkpoint. Eso permite reproducir y auditar el estudio de transferencia, algo poco habitual en repositorios de VAD. El repositorio ocupa 3,1 GB y usa PyTorch como libreria.

No se dispone de informacion sobre la arquitectura interna concreta, el numero de parametros, la longitud de contexto (no aplica en el sentido de LLM) ni los idiomas soportados. La model card es deliberadamente escueta y remite al repositorio de GitHub para codigo, configuraciones, el registro canonico de metricas y las fuentes del manuscrito. Los videos de los conjuntos de datos y los arrays de caracteristicas historicos no se distribuyen en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (backbone temporal PreVAD; pesos PyTorch) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision/video, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | MIT |
| Formato de pesos | checkpoints PyTorch (`.pt`/`.pth`, no confirmado en la informacion disponible) |
| Tamano del repositorio | 3,1 GB |
| Numero de checkpoints | 180 objetivo + 1 fuente (PreVAD) |
| Tarea | Deteccion de anomalias en video debilmente supervisada |
| Libreria | PyTorch |
| Fecha de publicacion | 2026-11-02 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de PACT-VAD mas alla de que emplea un backbone temporal fijo denominado PreVAD, del que parten las ejecuciones de transferencia. El estudio se plantea como una transferencia controlada: se fija el backbone fuente y se evaluan 6 condiciones sobre 3 conjuntos de datos con 10 semillas cada una, lo que da los 180 checkpoints objetivo. El criterio de seleccion de checkpoint es la epoca mas temprana que alcanza el maximo AUC de video en validacion, una regla conservadora que evita seleccionar modelos por picos tardios de sobreajuste.

No se especifican en la informacion proporcionada el numero de tokens o clips de entrenamiento, la composicion de los conjuntos de datos, ni si hubo etapas de refinamiento tipo RLHF/DPO (poco probables en VAD). Tampoco se documentan innovaciones como atencion lineal o decodificacion especulativa. El repositorio hermano del mismo autor, PATT-Net, describe una arquitectura ProtectedTransferVAD con backbone temporal dual (LSTM bidireccional con convoluciones dilatadas temporales enmascaradas) y extractor de caracteristicas CLIP ViT-L/14 de 768 dimensiones; es plausible que PACT-VAD comparta linaje con ese diseno, pero la model card de PACT-VAD no lo confirma, por lo que debe tratarse como informacion no verificada para este repositorio.

## Capacidades

- Deteccion de anomalias en video en regimen debilmente supervisado (etiquetas a nivel de video, no de fotograma).
- Puntuacion de segmentos o clips de video segun su probabilidad de anomalia (AUC de video como metrica de seleccion).
- Transferencia controlada entre conjuntos de datos: los checkpoints permiten evaluar la robustez del backbone PreVAD bajo 6 condiciones experimentales distintas.
- Reproducibilidad auditada: manifiesto con digest SHA-256 por checkpoint, epoca seleccionada y tamano de fichero.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No dispone de capacidades multilingues ni de generacion de texto.
- No se documentan capacidades de vision general (VQA, captioning) ni de audio.

## Casos de uso

- Reproduccion de estudios de transferencia en VAD: cargar los 180 checkpoints y replicar las curvas de AUC de video por conjunto de datos, condicion y semilla, usando el manifiesto para verificar integridad con SHA-256.
- Linea base para comparativas de deteccion de anomalias: emplear los pesos seleccionados por validacion como referencia fija frente a nuevos metodos sobre los mismos 3 conjuntos de datos.
- Analisis de sensibilidad a semilla: con 10 semillas por condicion, permite estimar varianza del AUC y detectar condiciones con alta inestabilidad, algo que los articulos suelen omitir al reportar una sola ejecucion.
- Auditoria de reglas de seleccion de checkpoint: comparar la regla "epoca mas temprana con maximo AUC de validacion" frente a alternativas (ultima epoca, media movil) reutilizando los mismos pesos guardados.
- Investigacion sobre vigilancia y seguridad: evaluar el modelo sobre clips de camaras fijas para detectar eventos anomalos, siempre que se disponga de los videos y caracteristicas originales, que no se distribuyen en este repositorio.
- Docencia y formacion: usar el conjunto de checkpoints y el manifiesto como ejemplo de buenas practicas de trazabilidad en publicaciones de aprendizaje automatico.
- Integracion en pipelines de evaluacion: cargar los pesos en PyTorch y ejecutar inferencia por lotes sobre caracteristicas preextraidas, ya que el repositorio no incluye el extractor de caracteristicas ni los videos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un "registro canonico de metricas" (*canonical metric ledger*) alojado en el repositorio de GitHub, pero no se incluyen cifras de AUC, MMLU, HumanEval, GSM8K ni de ningun otro benchmark en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio completo ocupa 3,1 GB, por lo que cargar un unico checkpoint requiere bastante menos memoria, pero el tamano por checkpoint no se detalla en la informacion proporcionada.
- GPU recomendadas: no disponibles. Al ser un modelo de video con backbone temporal, se espera que quepa en GPUs de consumo tipo RTX 3060/4060 en adelante, pero no hay datos que lo confirmen.
- Cabe en GPU de consumo: probablemente si, dado el tamano del repositorio, aunque no confirmado.
- Opciones de despliegue: PyTorch nativo. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PACT-VAD | VAD debilmente supervisada | Backbone PreVAD | no disponible | no aplica | MIT | Hugging Face (mtastan/PACT-VAD) |
| PATT-Net | VAD debilmente supervisada | ProtectedTransferVAD (LSTM bidireccional + convoluciones dilatadas, CLIP ViT-L/14) | no disponible | no aplica | no disponible | Hugging Face (mtastan/PATT-Net) |
| Alternativas de VAD (p. ej. Sultani et al., Zhong et al.) | VAD debilmente supervisada | MIL / transformers temporales | no disponible | no aplica | varía | Repositorios academicos |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con otros metodos de VAD. La comparacion con PATT-Net es cualitativa: comparten autor y tematica, pero PATT-Net documenta una arquitectura concreta (CLIP ViT-L/14 + LSTM bidireccional con convoluciones dilatadas enmascaradas) mientras que PACT-VAD solo declara el backbone PreVAD.

## Limitaciones y advertencias

- La model card es minima: no documenta arquitectura, parametros, datos de entrenamiento ni metricas. Cualquier uso en produccion exige consultar el repositorio de GitHub para obtener configuraciones y el registro de metricas.
- No se distribuyen los videos de los conjuntos de datos ni los arrays de caracteristicas historicos, por lo que la inferencia directa sobre video no es posible sin reconstruir el pipeline de extraccion de caracteristicas.
- Los checkpoints estan seleccionados por una regla concreta (maximo AUC de validacion, epoca mas temprana); usarlos fuera de ese protocolo puede dar resultados distintos a los del estudio.
- Riesgo de sobreajuste a los 3 conjuntos de datos del estudio; la transferencia a dominios nuevos (otras camaras, otras escenas) no esta evaluada en la informacion disponible.
- Sesgos conocidos: no documentados. En VAD, los sesgos de los conjuntos de datos (iluminacion, etnia, genero, tipo de escena) suelen propagarse al modelo, pero no hay informacion especifica para este repositorio.
- Riesgo de alucinacion: no aplica en el sentido de LLM, pero si existe riesgo de falsos positivos/negativos en la deteccion de anomalias, sin tasas publicadas.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero conviene verificar la licencia de los conjuntos de datos subyacentes, que no se distribuyen aqui.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion independiente.
- Fecha de publicacion futura respecto a la mayoria de referencias (2026-11-02): verificar que el repositorio no sea un artefacto preliminar o en construccion.

## Enlaces

- Hugging Face: https://huggingface.co/mtastan/PACT-VAD
- Codigo, configuraciones, registro de metricas y fuentes del manuscrito: https://github.com/tastangh/PACT-VAD
- Repositorio hermano PATT-Net: https://huggingface.co/mtastan/PATT-Net
- Perfil del autor en Hugging Face: https://huggingface.co/mtastan
