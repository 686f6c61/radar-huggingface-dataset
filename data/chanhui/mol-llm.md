# chanhui/Mol-LLM

## Resumen

Mol-LLM es un modelo publicado en Hugging Face por el usuario `chanhui` (repositorio `chanhui/Mol-LLM`) bajo el paraguas del proyecto Mol-LLM, cuyo codigo de envio se aloja en el repositorio de GitHub `KU-AGI/Mol-LLM-submission`. El repositorio contiene unicamente pesos de inferencia en formato EMA (Exponential Moving Average) para tres semillas de entrenamiento (42, 1234 y 4042), sin estado del optimizador, y corresponde a una variante del modelo entrenada sin MolPO y sin componente de grafo ("w/o MolPO and w/o Graph").

El nombre y la estructura del proyecto (Mol-LLM) sugieren un modelo de lenguaje orientado al dominio molecular, presumiblemente para tareas de representacion o generacion de moleculas, aunque la model card no proporciona informacion sobre arquitectura, tamano de parametros, contexto ni datos de entrenamiento. El repositorio pesa 14,2 GB, lo que es coherente con pesos en precision completa o media de un modelo de varios miles de millones de parametros, pero no permite determinar el numero exacto.

La relevancia actual del modelo es limitada desde el punto de vista de la documentacion: se trata de un checkpoint de investigacion sin model card tecnica, sin licencia declarada y sin resultados de benchmarks publicados en la informacion disponible. Su interes radica en que forma parte de un esfuerzo de investigacion (KU-AGI) sobre modelos de lenguaje aplicados a moleculas, y en que los tres checkpoints por semilla permiten estudiar variabilidad de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos EMA de inferencia; no se especifican formatos alternativos) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 14,2 GB; la model card menciona `manifest.json` con hashes e identificadores) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo. Los unicos datos tecnicos explicitos son: (1) se publican pesos EMA de inferencia, (2) la variante corresponde a un modelo entrenado "w/o MolPO and w/o Graph", lo que implica que el pipeline completo de Mol-LLM incluye un componente llamado MolPO y otro basado en grafos, ausentes en esta publicacion, y (3) se distribuyen tres ejecuciones con semillas 42, 1234 y 4042, lo que sugiere un estudio de reproducibilidad o de ensembling.

No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento. Tampoco se detallan innovaciones tecnicas como atencion lineal, decodificacion especulativa o modos de razonamiento. Toda esta informacion debe considerarse no disponible a partir de la documentacion proporcionada.

## Capacidades

- Generacion y modelado de lenguaje en el dominio molecular (inferido del nombre del proyecto Mol-LLM; no confirmado en la model card).
- Pesos de inferencia listos para evaluacion con el codigo de `KU-AGI/Mol-LLM-submission`.
- Tres checkpoints independientes (semillas 42, 1234, 4042) que permiten comparar estabilidad entre ejecuciones.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Reproduccion de resultados de investigacion: cargar los tres checkpoints EMA y ejecutar el codigo de `KU-AGI/Mol-LLM-submission` para verificar los resultados reportados en el paper o repositorio asociado, comparando la variabilidad entre semillas.
- Ablacion de componentes: al ser la variante "w/o MolPO and w/o Graph", sirve como linea base para medir la contribucion de MolPO y del modulo de grafos frente a la version completa de Mol-LLM.
- Experimentos de ensembling: combinar las predicciones de los tres checkpoints (semillas 42, 1234, 4042) para evaluar si la media reduce varianza en tareas de modelado molecular.
- Evaluacion de robustez: comparar el comportamiento de las tres semillas sobre el mismo conjunto de validacion para estimar la sensibilidad del entrenamiento a la inicializacion.
- Punto de partida para fine-tuning en tareas moleculares especificas (propiedades, generacion condicionada), siempre que se disponga de la arquitectura y el tokenizador del proyecto original.
- Integracion en pipelines de investigacion quimica computacional: usar el modelo como componente de representacion o generacion dentro de flujos existentes, previa validacion con el codigo oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision. El repositorio ocupa 14,2 GB, lo que sugiere que los pesos (probablemente en fp16/bf16 o fp32) requieren al menos ese orden de magnitud de memoria para cargarse en GPU; con cuantizacion a 8 bits o 4 bits podria reducirse, pero no se documentan formatos GGUF ni cuantizaciones.
- GPU recomendadas: no disponible. Por tamano de repositorio, una GPU con 16-24 GB (RTX 4090, A10G, L4) podria ser suficiente para inferencia en media precision si el modelo ronda los 7B; para fp32 harian falta 24-40 GB (A100 40GB, RTX A6000).
- Cabe en GPU de consumo: probablemente si en RTX 4090 (24 GB) si los pesos son de 7B en fp16; no confirmado.
- Opciones de despliegue: no se documentan. El codigo oficial esta en `KU-AGI/Mol-LLM-submission`; no hay indicios de soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica la arquitectura, el tamano ni la tarea exacta, por lo que no es posible establecer una comparacion rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de model card tecnica: no se documentan arquitectura, parametros, contexto, datos de entrenamiento ni evaluacion.
- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor o consultar el repositorio de GitHub antes de cualquier uso en produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.
- Pesos EMA sin estado del optimizador: no sirven para reanudar entrenamiento, solo para inferencia o fine-tuning desde cero del optimizador.
- Variante incompleta ("w/o MolPO and w/o Graph"): el rendimiento puede ser inferior al del modelo completo de Mol-LLM; no debe tomarse como representativo del sistema final.
- Riesgo de alucinacion y sesgos: no evaluado ni documentado.
- Sin garantias de soporte ni mantenimiento por parte del autor.

## Enlaces

- Hugging Face: https://huggingface.co/chanhui/Mol-LLM
- Codigo de envio: https://github.com/KU-AGI/Mol-LLM-submission
