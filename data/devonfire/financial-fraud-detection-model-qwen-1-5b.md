# devonfire/Financial-Fraud-Detection-Model-Qwen-1.5b

# devonfire/Financial-Fraud-Detection-Model-Qwen-1.5b

## Resumen

Financial-Fraud-Detection-Model-Qwen-1.5b es un adaptador de ajuste fino (LoRA, libreria PEFT) publicado por el usuario de Hugging Face devonfire sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. Por el identificador del repositorio y por sus etiquetas (lora, sft, trl, transformers), se trata de un entrenamiento supervisado orientado a tareas de deteccion de fraude financiero, presumiblemente clasificacion o analisis de transacciones y del texto asociado a ellas. El repositorio, sin embargo, no contiene pesos de tamano apreciable (0,0 GB), acumula cero descargas y cero "likes", y su model card es la plantilla por defecto de Hugging Face sin ningun campo completado.

La relevancia del modelo es hoy mas conceptual que practica: ejemplifica el patron actual de adaptar modelos pequenos (1,5B parametros) a dominios regulados como el antifraude, donde el despliegue on-premise y un coste por inferencia bajo son requisitos habituales. El modelo base aporta una arquitectura transformer decoder-only de 1,54B parametros y 32.768 tokens de contexto nativo, suficiente para resumir expedientes o clasificar lotes de transacciones en una sola pasada.

No obstante, la ausencia total de documentacion (licencia, idiomas, datos de entrenamiento, hiperparametros y evaluacion) impide verificar la calidad del ajuste y desaconseja cualquier uso en produccion sin una validacion independiente por parte del equipo adoptante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only del modelo base Qwen2.5-1.5B-Instruct. Configuracion del adaptador (r, alpha, modulos objetivo) no disponible |
| Parametros totales | 1,54 mil millones en el modelo base; numero de parametros entrenables del adaptador no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible para el adaptador; el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens nativos (ampliables a 131.072 con escalado RoPE/YaRN) |
| Tipos de cuantizacion | no disponible. Los pesos se publican en safetensors sin versiones GGUF ni cuantizaciones precalculadas |
| Idiomas soportados | no disponible en la ficha del adaptador. El modelo base declara soporte para mas de 29 idiomas segun la documentacion de Qwen |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, requiere el modelo base por separado) |
| Libreria | peft 0.20.0 |
| Pipeline | text-generation |
| Tipo de entrenamiento | SFT (supervised fine-tuning) con TRL sobre base Qwen2.5-1.5B-Instruct |
| Tamano del repositorio | 0,0 GB |
| Fecha de publicacion | 12 de septiembre de 2026 (segun metadatos del repositorio) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de bajo rango acoplado a Qwen2.5-1.5B-Instruct, un transformer decoder-only con RoPE, Grouped Query Attention, SwiGLU y RMSNorm. El ajuste se realizo exclusivamente sobre los modulos inyectados por PEFT, de modo que el modelo base permanece congelado; esto reduce drasticamente los requisitos de entrenamiento (tipicamente una unica GPU consumer basta para un adaptador sobre 1,5B parametros), pero implica que el comportamiento final depende por completo de la calidad de la base.

No hay informacion publicada sobre el procedimiento de entrenamiento: se desconoce el dataset utilizado, el numero de tokens, la composicion de las muestras (transacciones tabulares serializadas, correos, reclamaciones, informes de analistas), el regimen de precision, la tasa de aprendizaje, el numero de epocas ni si se aplico alguna fase posterior de RLHF o DPO. La model card no documenta hiperparametros ni ofrece curvas de perdida. El unico dato tecnico verificable es la version de PEFT empleada (0.20.0) y la presencia de las etiquetas lora, sft y trl.

Cabe senalar que la referencia arXiv que aparece entre las etiquetas del repositorio (1910.09700) corresponde al articulo de Lacoste et al. sobre estimacion de emisiones de carbono en aprendizaje automatico, citado en la plantilla de model card de Hugging Face: no es un paper asociado al modelo ni describe su metodo de entrenamiento.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones, heredados del modelo base Qwen2.5-1.5B-Instruct.
- Capacidad declarada (por el nombre del repositorio) de analisis orientado a deteccion de fraude financiero, sin especificar si se trata de clasificacion binaria, scoring o generacion de explicaciones.
- Razonamiento basico y aritmetica simple, limitados por el tamano del modelo base (1,5B parametros).
- Soporte multilingue heredado del modelo base (mas de 29 idiomas segun Qwen), no confirmado para el adaptador.
- Tool calling y function calling: el modelo base Qwen2.5-1.5B-Instruct los soporta; no hay evidencia de que el adaptador los conserve tras el ajuste supervisado.
- Generacion de salidas estructuradas (JSON): posible en teoria a traves del modelo base, no documentado en el adaptador.
- Capacidades de vision, audio o modo de razonamiento explicito ("thinking mode"): no disponibles, no declaradas.
- No se documenta ninguna capacidad especial adicional, ni soporte de agentes multi-paso verificado.

## Casos de uso

Nota: el autor no publica casos de uso. Los siguientes escenarios son usos potenciales coherentes con el proposito declarado en el nombre del modelo y con las caracteristicas del modelo base; requieren validacion propia antes de cualquier despliegue.

- Triaje de alertas antifraude: usar el modelo como clasificador de primera linea sobre descripciones textuales de transacciones o expedientes, derivando solo los casos dudosos a analistas humanos. La ventana de 32.768 tokens del modelo base permite incluir el historial completo de un cliente sin truncar.
- Explicacion de alertas para analistas: generar una narrativa breve en lenguaje natural que resuma por que una operacion ha sido marcada, reduciendo el tiempo de revision en equipos de operaciones.
- Deteccion de ingenieria social y phishing: analizar correos, mensajes o transcripciones de llamadas en busca de patrones de fraude, aprovechando el soporte multilingue del modelo base.
- Pre-filtro de bajo coste en pipelines antifraude: desplegado en cuantizacion de 4 bits sobre hardware modesto, puede procesar volumen alto de peticiones como etapa de descarte previa a un modelo mayor o a un motor de reglas.
- Resumen de expedientes para compliance y AML: condensar documentacion dispersa (reclamaciones, informes, correspondencia) en un resumen estructurado para revision regulatoria.
- Extraccion de entidades en informes de fraude: identificacion de importes, fechas, contrapartes e identificadores en texto libre, siempre que se valide la fidelidad de la extraccion.
- Base para experimentacion con adaptadores de dominio: sirve como punto de partida reproducible para probar tecnicas PEFT en el ambito financiero y comparar contra el modelo base sin ajustar.
- Asistente interno de formacion: responder preguntas del personal sobre tipologias de fraude, con la advertencia de que las respuestas de un modelo de 1,5B pueden ser imprecisas y deben validarse.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del adaptador deja la seccion de evaluacion vacia ("[More Information Needed]") y no aporta datos de MMLU, HumanEval, GSM8K ni de metricas propias del dominio antifraude (precision, recall, F1, AUC-PR o tasa de falsos positivos). Tampoco se publican curvas de entrenamiento ni comparaciones contra el modelo base sin ajustar, por lo que no es posible cuantificar la ganancia aportada por el adaptador.

## Requisitos de hardware

Estimaciones calculadas a partir del tamano del modelo base; el autor no publica mediciones.

- Pesos en fp32: aproximadamente 6,2 GB. En bf16/fp16: aproximadamente 3,1 GB. En cuantizacion de 8 bits: aproximadamente 1,6 GB. En 4 bits: aproximadamente 0,9-1,0 GB. Hay que anadir el peso del adaptador, habitualmente decenas de megabytes.
- Cache KV a 32.768 tokens en fp16: aproximadamente 1 GB, gracias al uso de Grouped Query Attention en el modelo base. La VRAM total necesaria escala con el lote y la longitud de contexto.
- GPU recomendadas: cualquier GPU con 8 GB o mas para fp16 (RTX 3060 Ti, RTX 4060, RTX 3070, L4, T4). Para lotes grandes o contexto completo, 16-24 GB (RTX 4090, A10G, L40S, A100). Con cuantizacion de 4 bits cabe en GPUs de 4-6 GB.
- Inferencia en CPU: viable en cuantizacion de 4-8 bits, con latencias altas (no cuantificadas).
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas modernas, y de forma holgada en 4 bits.
- Opciones de despliegue: transformers + peft (carga directa del adaptador, la via mas sencilla); vLLM y TGI admiten adaptadores LoRA de forma dinamica; para llama.cpp u Ollama es necesario fusionar previamente el adaptador con el modelo base (merge_and_unload) y convertir a GGUF.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor ni resultados de terceros verificables.

## Comparativa con modelos similares

Los datos de parametros, contexto y licencia de los modelos de referencia proceden de su documentacion publica; el rendimiento del adaptador no puede compararse porque no hay evaluacion publicada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Financial-Fraud-Detection-Model-Qwen-1.5b | 1,5B (base) + adaptador LoRA | no disponible (base: 32.768 tokens) | no disponible | Repositorio con 0 descargas; sin pesos apreciables (0,0 GB) |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens (ampliable a 131.072) | Apache 2.0 | Publico y ampliamente desplegado |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens (ampliable a 131.072) | Qwen Research (uso no comercial en esa variante) / Apache 2.0 segun version | Publico |
| Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens | Llama 3.2 Community License | Publico, requiere aceptacion de terminos |
| Phi-3.5-mini-instruct | 3,8B | 128.000 tokens | MIT | Publico |

El rendimiento comparado no esta disponible: no existen resultados de benchmarks publicados para este adaptador, ni tampoco metricas de fraude que permitan situarlo frente a alternativas. En terminos de disponibilidad y trazabilidad legal, cualquier alternativa de la tabla es hoy una opcion mas segura que este adaptador.

## Limitaciones y advertencias

- Model card vacia: el autor no ha completado ningun campo (descripcion, datos de entrenamiento, hiperparametros, evaluacion, impacto ambiental, autores ni contacto).
- Licencia sin especificar: no se concede ningun permiso explicito de uso, lo que impide juridicamente un despliegue comercial sin autorizacion previa del autor.
- Repositorio sin pesos apreciables: el tamano reportado es de 0,0 GB, por lo que no esta garantizado que los pesos del adaptador sean descargables o utilizables.
- Cero descargas y cero "likes": ausencia total de validacion por parte de la comunidad y de evidencia de reproducibilidad.
- Sin datos sobre idiomas: no puede confirmarse el comportamiento en castellano, aunque el modelo base sea multilingue.
- Riesgo de alucinacion: un modelo de 1,5B parametros puede inventar entidades, importes o justificaciones en un dominio donde un error tiene consecuencias economicas y legales.
- Riesgo de sesgo: al desconocerse el dataset de ajuste, no puede descartarse un sesgo sistematico contra determinados perfiles, geografias o tipos de operacion, lo que en antifraude se traduce en falsos positivos discriminatorios.
- Requisitos regulatorios: el uso de sistemas automatizados para decisiones con efectos significativos sobre personas esta sujeto al RGPD (decisiones automatizadas y derecho a explicacion) y, en el ambito financiero, a las obligaciones de prevencion de blanqueo de capitales. Un modelo no auditado no cumple por si mismo estos requisitos.
- Perdida de capacidades generales: el ajuste supervisado sobre un unico dominio puede degradar la conversacion general, el tool calling y el multilingueismo respecto al modelo base.
- Dependencia del modelo base: el adaptador no es autonomo; requiere descargar y ejecutar Qwen2.5-1.5B-Instruct, cuyos propios terminos se aplican de forma adicional.
- Sin trazabilidad de versiones: no se indica el commit del modelo base utilizado ni la revision del adaptador.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/devonfire/Financial-Fraud-Detection-Model-Qwen-1.5b
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Blog oficial de la familia Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria TRL: https://github.com/huggingface/trl
- Referencia citada en la plantilla de model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700

Nota sobre la busqueda web: las consultas realizadas no devolvieron ningun resultado relacionado con este modelo. Los unicos resultados obtenidos fueron paginas de soporte de Microsoft Community sobre OneDrive, errores de pantalla azul y acceso a cuentas de Outlook, sin ninguna vinculacion con el modelo ni con su autor.
