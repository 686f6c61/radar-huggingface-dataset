# JesterbeanLTEA/sft-5g-rca-qwen3-1.7b

## Resumen

sft-5g-rca-qwen3-1.7b es un ajuste fino supervisado (SFT) del modelo denso Qwen/Qwen3-1.7B, publicado por el usuario JesterbeanLTEA en HuggingFace. El nombre del repositorio sugiere un dominio de aplicación orientado al análisis de causa raíz (RCA, root cause analysis) en redes 5G, aunque la model card no documenta el conjunto de datos, el procedimiento de entrenamiento ni la tarea concreta. Se ha entrenado con la librería TRL (versión 1.4.0) sobre Transformers 5.7.0 y PyTorch 2.10.0+cu128, y los pesos se distribuyen en formato safetensors con un tamano de repositorio de 3,9 GB.

El interés del modelo reside en su tamano reducido: al partir de Qwen3-1.7B, hereda un transformer decoder-only denso de aproximadamente 1,7 mil millones de parametros, con soporte de contexto de 32.768 tokens nativo en la familia Qwen3, modo de razonamiento (thinking) y cobertura multilingue amplia. Esto lo hace candidato para despliegue en una sola GPU de consumo o incluso en CPU mediante cuantizacion, siempre que el ajuste fino no haya degradado las capacidades generales del base.

La limitacion principal para evaluarlo es la ausencia casi total de documentacion: no hay resultados de benchmarks, no se especifica la licencia aplicada al fine-tune, no se detallan los idiomas ni el dataset de SFT, y el modelo registra cero descargas y cero "likes" en el momento de redactar esta ficha. Cualquier uso en produccion deberia ir precedido de una evaluacion propia sobre el dominio objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen/Qwen3-1.7B; no detallada en la model card del fine-tune) |
| Parametros totales | Aproximadamente 1,7 mil millones (correspondientes al modelo base); no confirmado explicitamente para el fine-tune |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen3-1.7B soporta 32.768 tokens nativos, extensibles a 131.072 mediante YaRN |
| Tipos de cuantizacion | No disponible. Los pesos se publican sin cuantizar; al ser safetensors compatibles con transformers se pueden aplicar cuantizaciones int8/int4 (bitsandbytes, GPTQ, AWQ) o convertir a GGUF |
| Idiomas soportados | No disponible en la model card; el modelo base Qwen3 declara cobertura de 119 idiomas y dialectos |
| Licencia | No disponible. El campo de licencia de la model card contiene el marcador literal "license" sin texto legal; el modelo base Qwen3-1.7B se distribuye bajo Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del fine-tune mas alla de indicar que se trata de un ajuste de Qwen/Qwen3-1.7B. Por herencia, la arquitectura es un transformer decoder-only denso con atención por grupos (GQA), normalización RMSNorm y activaciones SwiGLU, propio de la familia Qwen3. En Qwen3-1.7B el modo de razonamiento largo (thinking) es configurable mediante las etiquetas `/think` y `/no_think` en el prompt; no se ha confirmado si el ajuste SFT preserva ese comportamiento.

El entrenamiento se realizo con TRL 1.4.0 en modo SFT (supervised fine-tuning), sobre Transformers 5.7.0, PyTorch 2.10.0+cu128, Datasets 4.8.5 y Tokenizers 0.22.2. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo fases posteriores de DPO o RLHF, ni hiperparametros como tasa de aprendizaje, epocas o estrategia de enmascarado de perdida. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, destilacion) mas alla del propio ajuste.

El nombre del repositorio, "sft-5g-rca-qwen3-1.7b", apunta a un caso de uso de diagnostico de causa raiz en redes 5G, pero esto es una inferencia a partir del identificador y no una afirmacion respaldada por la documentacion publicada.

## Capacidades

- Generacion de texto y conversacion multi-turno en el formato de chat de Qwen3, con plantilla de mensajes (`role`/`content`) tal y como muestra el ejemplo de la model card.
- Razonamiento y matematicas basicas heredados del modelo base Qwen3-1.7B, sujetos a la degradacion que pueda introducir el ajuste SFT.
- Generacion y explicacion de codigo, tambien heredada del modelo base.
- Modo de razonamiento explicito (thinking) potencialmente disponible si el ajuste no lo ha eliminado; no confirmado en la model card.
- Capacidades multilingues heredadas del base (Qwen3 declara 119 idiomas); sin confirmacion especifica para este fine-tune.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada. El modelo base Qwen3 lo soporta, pero no hay evidencia de que este ajuste lo conserve.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles (el modelo base es exclusivamente de texto).

## Casos de uso

- Analisis de causa raiz en redes 5G (uso sugerido por el nombre del modelo): procesar registros de alarmas, contadores de rendimiento y trazas de red en lenguaje natural para proponer una hipotesis de causa raiz. Requiere validacion propia, ya que no hay documentacion del dataset de entrenamiento.
- Clasificacion y triaje de incidencias en centros de operaciones de red (NOC): el modelo puede etiquetar tickets o alarmas por severidad y dominio, siempre que se valide su precision sobre datos reales del operador.
- Asistente interno de soporte tecnico: resumir documentacion de configuracion de red o generar borradores de respuesta a tecnicos, con contexto de hasta 32.768 tokens si se confirma la ventana del base.
- Generacion de scripts de automatizacion de red: producir fragmentos de Python, Ansible o YAML para tareas repetitivas de aprovisionamiento, apoyandose en las capacidades de codigo del modelo base.
- Extraccion de entidades de informes tecnicos: convertir texto no estructurado (informes de incidentes, logs anotados) en campos estructurados mediante prompts de extraccion JSON.
- Despliegue en el borde o en entornos con recursos limitados: con 1,7 mil millones de parametros, el modelo cabe en una GPU de consumo o en CPU cuantizada, lo que permite ejecutarlo en instalaciones locales sin enviar datos sensibles de red a servicios externos.
- Prototipado rapido y experimentacion academica: por su tamano, sirve como banco de pruebas para evaluar tecnicas de SFT con TRL antes de escalar a modelos mayores.
- Motor de resumen de documentacion tecnica larga: condensar especificaciones o manuales de hasta decenas de miles de tokens en resumenes estructurados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la busqueda web asociada no ha devuelto documentacion tecnica del modelo. Tampoco hay comparaciones con el modelo base que permitan medir el efecto del ajuste SFT.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 3,5-4 GB de pesos, mas el cache KV, que crece de forma lineal con la longitud de contexto; con contextos largos (decenas de miles de tokens) la VRAM necesaria puede superar los 8 GB.
- VRAM estimada en int8: aproximadamente 2 GB de pesos, mas cache KV.
- VRAM estimada en int4 (GPTQ, AWQ o GGUF Q4): aproximadamente 1,2-1,5 GB de pesos, mas cache KV.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 con contexto moderado (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, L4, A10G). Para contextos muy largos o lotes grandes, A100 o H100 aportan margen suficiente.
- Compatibilidad con GPU de consumo: si, el modelo entra en GPU de consumo con 8 GB o mas en bf16, y en GPU de 4-6 GB si se cuantiza a int4.
- Opciones de despliegue: transformers (soporte nativo, tal y como muestra la model card), vLLM y SGLang para servicio con alto throughput, TGI como alternativa, y llama.cpp u Ollama si se convierte previamente a GGUF (no hay GGUF publicado en el repositorio).
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| sft-5g-rca-qwen3-1.7b | ~1,7 B | No disponible (base: 32.768 tokens) | No disponible | HuggingFace, safetensors | Fine-tune SFT de dominio no documentado; 0 descargas |
| Qwen/Qwen3-1.7B | ~1,7 B | 32.768 tokens nativos, 131.072 con YaRN | Apache-2.0 | HuggingFace, safetensors, GGUF | Modelo base; documentacion completa y benchmarks publicados |
| Llama-3.2-1B | ~1,2 B | 128.000 tokens | Llama 3.2 Community License | HuggingFace | Requiere aceptar licencia; multilingue limitado a 8 idiomas oficiales |
| Gemma-3-1B | ~1 B | 32.768 tokens | Gemma Terms of Use | HuggingFace | Buen rendimiento por parametro; condiciones de uso especificas de Google |
| SmolLM2-1.7B | ~1,7 B | 8.192 tokens | Apache-2.0 | HuggingFace | Alternativa abierta con contexto mas corto |

La comparacion es estructural: no hay datos de rendimiento del fine-tune que permitan contrastar calidad frente a ninguna de estas alternativas. Para un uso en produccion, el modelo base Qwen3-1.7B o cualquiera de las alternativas con licencia clara y benchmarks publicados ofrece mayor trazabilidad.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: no se describe el dataset de SFT, el numero de tokens, los hiperparametros ni la tarea objetivo, lo que impide reproducir el entrenamiento o anticipar su comportamiento.
- Licencia indeterminada: el campo de licencia de la model card contiene el marcador "license" sin texto legal. Aunque el modelo base es Apache-2.0, no se puede asumir que el fine-tune herede esa licencia sin verificacion adicional. No se recomienda uso comercial sin aclarar este punto.
- Riesgo de sobreajuste al dominio: al tratarse de un SFT sobre un nombre de repositorio que sugiere un dominio muy especifico (RCA en 5G), es probable que el modelo haya perdido parte de las capacidades generales del base; no hay evaluaciones que lo confirmen ni lo desmientan.
- Riesgo de alucinacion: inherente a los modelos de 1,7 mil millones de parametros, especialmente en tareas tecnicas de diagnostico donde la respuesta incorrecta puede tener consecuencias operativas. No debe usarse como fuente unica de decision en redes en produccion.
- Sesgos conocidos: no documentados por el autor. Los modelos Qwen3 pueden presentar sesgos culturales y linguisticos heredados de sus datos de preentrenamiento, y un SFT de dominio estrecho puede amplificarlos.
- Cobertura idiomatica no verificada: la model card no declara idiomas. Aunque el base cubre 119 idiomas, el ajuste SFT puede haber reducido el rendimiento en idiomas distintos del usado en el entrenamiento.
- Sin soporte confirmado de tool calling ni de agentes: el modo thinking y el function calling del base podrian haberse degradado con el ajuste.
- Estado del repositorio: 0 descargas y 0 "likes", sin senales de validacion por parte de la comunidad ni de mantenimiento posterior a la fecha de actualizacion registrada.
- Ausencia de benchmarks: no hay ninguna metrica publicada, por lo que cualquier afirmacion sobre su calidad relativa carece de respaldo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JesterbeanLTEA/sft-5g-rca-qwen3-1.7b
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentacion de la familia Qwen3: no disponible en la informacion proporcionada
- Paper o blog del fine-tune: no disponible
- Demo o espacio asociado: no disponible
