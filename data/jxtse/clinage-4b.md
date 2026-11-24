# jxtse/ClinAge-4B

## Resumen

ClinAge-4B es un adaptador LoRA (PEFT) publicado por el usuario jxtse sobre el modelo base Qwen/Qwen3.5-4B, orientado a la prediccion de edad biologica, mortalidad y analisis de supervivencia a partir de datos clinicos. No se trata de un modelo de lenguaje generativo de proposito general, sino de un ajuste fino especializado que reutiliza la representacion interna de un transformer de 4.000 millones de parametros para tareas de regresion y clasificacion clinica. El repositorio se distribuye con licencia propia (`clinage-research-use-license`) y acceso restringido, lo que limita su uso a investigacion previa aceptacion de condiciones.

La relevancia del modelo reside en su enfoque: aplicar knowledge distillation y ajuste fino tipo LoRA sobre un LLM moderno para estimar biomarcadores de envejecimiento (edad biologica, riesgo de mortalidad) en lugar de entrenar un modelo tabular especifico desde cero. Esto permite aprovechar el conocimiento previo codificado en Qwen3.5-4B y adaptarlo a un dominio con datos escasos y heterogeneos como es la prediccion clinica de supervivencia.

El modelo esta etiquetado como `text-classification` en el pipeline de Hugging Face y solo declara soporte para ingles. Su tamano de repositorio (0,2 GB) corresponde unicamente a los pesos del adaptador, no al modelo base completo, que debe descargarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-4B) con adaptador LoRA (PEFT) |
| Parametros totales | 4.000 millones (modelo base); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors) |
| Idiomas soportados | ingles (en) |
| Licencia | clinage-research-use-license (acceso restringido) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo se construye como un adaptador LoRA sobre Qwen/Qwen3.5-4B, un transformer decoder-only de 4.000 millones de parametros. El adaptador modifica las proyecciones del modelo base para redirigir su representacion hacia tareas de regresion clinica: prediccion de edad biologica, estimacion de riesgo de mortalidad y analisis de supervivencia. Las etiquetas del repositorio indican el uso de knowledge distillation junto con LoRA, lo que sugiere que el adaptador se entreno para imitar las salidas de un modelo profesor (posiblemente un ensemble clinico o un modelo tabular de referencia) sobre el corpus de datos de entrenamiento.

No se dispone de informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset clinico, ni sobre si se aplicaron tecnicas de RLHF o DPO. Tampoco se detalla la innovacion tecnica concreta mas alla del uso combinado de PEFT y distillation. La ausencia de estos datos en la informacion proporcionada impide evaluar la calidad y representatividad del corpus de ajuste.

## Capacidades

- Prediccion de edad biologica a partir de datos clinicos.
- Estimacion de riesgo de mortalidad y analisis de supervivencia.
- Regresion sobre variables clinicas continuas.
- Clasificacion de pacientes o registros segun perfiles de envejecimiento.
- Ajuste fino especializado sobre un LLM de 4B mediante LoRA, lo que permite reutilizar representaciones del modelo base.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Investigacion en biomarcadores del envejecimiento: el adaptador permite estimar edad biologica a partir de registros clinicos y compararla con la edad cronologica para estudiar factores de riesgo en cohortes poblacionales.
- Analisis de supervivencia en estudios epidemiologicos: se puede integrar en pipelines de analisis para generar estimaciones de riesgo de mortalidad que complementen modelos de Cox o random survival forests.
- Seleccion de pacientes en ensayos clinicos: el modelo puede puntuar el riesgo de mortalidad de candidatos y ayudar a estratificar cohortes por perfil de envejecimiento.
- Investigacion traslacional en gerociencia: util para explorar correlaciones entre variables clinicas y fenotipos de envejecimiento acelerado en conjuntos de datos con etiquetas de seguimiento longitudinal.
- Prototipado de modelos de riesgo clinico: sirve como linea base ajustada sobre un LLM para comparar con modelos tabulares tradicionales en tareas de regresion clinica.
- Docencia y experimentacion en IA aplicada a salud: permite estudiar como se comporta un adaptador LoRA sobre un LLM de 4B en un dominio de datos tabulares clinicos, con acceso restringido y licencia de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un adaptador LoRA sobre un modelo base de 4.000 millones de parametros, se requiere cargar el modelo base completo. En fp16 se estiman aproximadamente 8 GB de VRAM solo para los pesos, mas overhead de activaciones y contexto.
- En cuantizacion de 8 bits, la VRAM estimada ronda los 4-5 GB; en 4 bits, alrededor de 2,5-3 GB, aunque no se han publicado cuantizaciones oficiales del adaptador.
- GPU recomendadas: A100, H100 o L40S para inferencia por lotes; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en fp16 con margen suficiente.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en cuantizacion de 8 bits, y en tarjetas de 6 GB o mas en 4 bits, siempre que se cargue el modelo base y el adaptador por separado.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la libreria `peft` y `transformers`; para serving se puede integrar en vLLM o TGI siempre que se fusione el adaptador con el modelo base. No se dispone de versiones GGUF ni de integracion directa con Ollama o llama.cpp.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ClinAge-4B | 4B (base) + LoRA | no disponible | Regresion clinica / supervivencia | clinage-research-use-license (restringida) | Gated en Hugging Face |
| Qwen/Qwen3.5-4B | 4B | no disponible | Generacion de texto general | no disponible en la informacion | Publico en Hugging Face |
| Modelos tabulares de supervivencia (Cox, RSF) | no aplica | no aplica | Analisis de supervivencia | variable | Amplia disponibilidad |
| Adaptadores LoRA clinicos genericos | variable | variable | Prediccion clinica | variable | Variable |

No se dispone de datos de rendimiento comparativo entre ClinAge-4B y alternativas, por lo que la comparativa se limita a parametros estructurales y disponibilidad.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de descargar los pesos.
- Licencia de uso exclusivamente investigador (`clinage-research-use-license`); no se garantiza permiso para uso comercial.
- Solo soporta ingles, lo que limita su aplicacion a cohortes con datos clinicos en otros idiomas.
- No se han publicado datos sobre sesgos demograficos, etnicos o de genero en el corpus de entrenamiento.
- Riesgo de alucinacion y de predicciones sobreconfiadas en datos clinicos fuera de distribucion; no debe usarse como herramienta de diagnostico sin validacion externa.
- No se dispone de informacion sobre el tamano del dataset de entrenamiento ni sobre su composicion, lo que impide evaluar la generalizacion.
- El modelo es un adaptador, no un modelo completo: requiere cargar Qwen3.5-4B y fusionar el adaptador para su despliegue.
- No hay benchmarks publicados que permitan comparar su rendimiento con modelos clinicos establecidos.
- Cualquier uso en produccion clinica requeriria validacion regulatoria y auditoria de sesgos, no documentadas en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/jxtse/ClinAge-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Libreria PEFT: https://github.com/huggingface/peft
- Documentacion de Transformers: https://huggingface.co/docs/transformers
