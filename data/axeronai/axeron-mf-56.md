# AxeronAI/axeron-mf-56

## Resumen

AxeronAI/axeron-mf-56 es un ajuste fino (finetune) del modelo Qwen/Qwen2.5-7B-Instruct, publicado por la organizacion AxeronAI (AXERON AI INC) dentro de su ecosistema Axeron ModelForge. Se trata de un modelo denso de 7.615.616.512 parametros (7,61 mil millones) almacenado en safetensors, con un repositorio de 15,2 GB, lo que corresponde a pesos en precision de 16 bits.

El modelo resuelve, en principio, el mismo tipo de tareas que su base: generacion de texto, razonamiento, codigo, matematicas y uso de herramientas en contextos largos. La model card unicamente documenta el proceso de ajuste: metodo finetune, 400 pasos de entrenamiento y una perdida final de 0,1747. No se publican datos sobre el conjunto de datos, los hiperparametros, la licencia ni los idiomas cubiertos por el ajuste.

Su relevancia actual es limitada desde el punto de vista practico: el repositorio registra 0 descargas y 0 likes, no declara licencia, no incluye pipeline ni benchmarks, y depende de una libreria propia (`axeron-modelforge`) que no forma parte del ecosistema estandar de transformers. Resulta util como caso de estudio de ajustes privados sobre Qwen2.5, pero su adopcion en produccion exige verificar primero la licencia, el dataset y el comportamiento real del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso de la familia Qwen2 (heredada del modelo base) |
| Parametros totales | 7.615.616.512 (7,61 mil millones) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible para el finetune; el modelo base Qwen2.5-7B-Instruct soporta 131.072 tokens |
| Tipos de cuantizacion | No declarados en el repositorio; el modelo base admite BF16/FP16, GPTQ, AWQ y GGUF (Q4_K_M, Q5_K_M, Q8_0, entre otros) |
| Idiomas soportados | No disponible para el finetune; el modelo base cubre mas de 29 idiomas |
| Licencia | No disponible (el modelo base Qwen2.5-7B-Instruct se distribuye bajo Apache 2.0) |
| Formato de pesos | safetensors (repositorio de 15,2 GB) |
| Libreria declarada | axeron-modelforge |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Fecha de creacion en HuggingFace | 2026-09-29 |
| Ultima actualizacion | 2026-09-29 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder denso con 28 capas, atencion con Grouped Query Attention (28 cabezas de consulta y 4 de clave/valor), normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE), con un vocabulario de 151.936 tokens. Segun la documentacion publica de Qwen, la version base se preentreno sobre aproximadamente 18 billones de tokens y despues se alineo mediante ajuste supervisado y optimizacion por preferencias. El repositorio de AxeronAI no aporta ninguna modificacion arquitectonica: se trata de un ajuste de pesos sobre esa misma estructura.

El unico detalle de entrenamiento documentado es el que aparece en la model card: metodo "finetune" (ajuste completo, no LoRA), 400 pasos de entrenamiento y una perdida final de 0,1747. No se especifica el dataset, el numero de tokens de entrenamiento, la composicion de los datos, la tasa de aprendizaje, el tamano de lote, si hubo fases de RLHF o DPO posteriores, ni si se aplicaron tecnicas de decodificacion especulativa. La perdida final por si sola no permite inferir calidad: sin datos de validacion ni benchmarks, no es posible saber si el ajuste mejoro o degradó las capacidades originales del modelo base.

## Capacidades

Las capacidades que se listan a continuacion corresponden al modelo base Qwen2.5-7B-Instruct, del cual este modelo hereda los pesos; el ajuste concreto no ha publicado evaluacion alguna que confirme que se mantienen intactas.

- Generacion de texto y razonamiento general en formato conversacional multi-turno.
- Generacion y comprension de codigo en multiples lenguajes de programacion.
- Razonamiento matematico y resolucion de problemas de varios pasos.
- Soporte de tool calling y function calling, con salida en JSON estructurado.
- Capacidad para flujos de agente y razonamiento encadenado (multi-step), limitada por la ausencia de documentacion especifica del ajuste.
- Manejo de contextos largos de hasta 131.072 tokens en el modelo base, con generacion de hasta 8192 tokens de salida.
- Cobertura multilingue amplia (mas de 29 idiomas) en el modelo base.
- No dispone de vision ni de audio: Qwen2.5-7B-Instruct es un modelo exclusivamente de texto.
- No documenta modo de razonamiento explicito (thinking mode) ni modo de pensamiento extendido.

## Casos de uso

- Atencion al cliente automatizada en un dominio concreto: el modelo puede mantener conversaciones multi-turno con contexto largo gracias a la ventana de 131.072 tokens heredada del modelo base, siempre que el ajuste no la haya degradado.
- Generacion de codigo en pipelines de desarrollo: integrable como asistente en IDE o como paso de revision automatica en CI/CD, aprovechando el soporte de tool calling del modelo base.
- Agentes con llamada a herramientas: enrutado de peticiones a APIs externas mediante function calling y salidas JSON validadas contra un esquema.
- Extraccion de informacion estructurada: procesamiento de contratos, informes o documentacion tecnica extensa y devolucion de campos normalizados en JSON.
- Sistemas RAG sobre base documental corporativa: el modelo actua como generador final sobre fragmentos recuperados, con margen suficiente para incluir varias decenas de miles de tokens de contexto.
- Resumen y sintesis de documentacion tecnica larga: manuales, expedientes o historiales de incidencias que superan la ventana tipica de 8K o 32K tokens.
- Clasificacion y enrutado de tickets o correos: tareas de etiquetado y triaje con salida restringida a un conjunto cerrado de categorias.
- Base para un segundo ajuste especifico: al estar en safetensors y con pesos completos, puede servir como punto de partida para LoRA o QLoRA sobre un dominio propio.
- Traduccion y asistencia multilingue: viable si el ajuste ha conservado la cobertura multilingue del modelo base, algo que no esta documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K, MATH, MT-Bench ni de ninguna otra suite, ni para el modelo ajustado ni en comparacion con Qwen2.5-7B-Instruct. El unico dato de entrenamiento reportado es la perdida final de 0,1747 tras 400 pasos, que no es una metrica de rendimiento y no permite comparaciones.

## Requisitos de hardware

Las siguientes cifras son estimaciones tecnicas derivadas del numero de parametros y no proceden de mediciones publicadas por el autor:

- VRAM para inferencia en FP16/BF16: aproximadamente 15,2 GB solo de pesos, mas 1-3 GB de overhead de runtime y cache KV, es decir, del orden de 16-18 GB en total.
- VRAM para inferencia en INT8: aproximadamente 8 GB de pesos, con un total estimado de 10-12 GB.
- VRAM para inferencia en INT4 (GPTQ, AWQ o GGUF Q4_K_M): aproximadamente 4-5 GB de pesos, con un total estimado de 6-8 GB.
- GPU de datacenter recomendadas: A100 40/80 GB, H100 80 GB o L40S 48 GB para servir en precision completa con lotes concurrentes.
- GPU de consumo: si cabe en una RTX 4090 o RTX 3090 (24 GB) en FP16 con contexto moderado; una RTX 4080 o 4070 Ti Super (16 GB) requiere cuantizacion INT8; tarjetas de 8-12 GB (RTX 3060, RTX 4060 Ti 8 GB) solo admiten cuantizacion INT4 con contexto reducido.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI) y SGLang para FP16/BF16 e INT8/INT4; llama.cpp y Ollama para GGUF en CPU o GPU mixta; transformers con PyTorch para pruebas. La libreria `axeron-modelforge` no es un runtime de inferencia estandar y no se documenta su uso.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| AxeronAI/axeron-mf-56 | 7,61 mil millones (denso) | No disponible en la ficha (base: 131.072 tokens) | No declarada | HuggingFace, 0 descargas, 0 likes; requiere libreria propia |
| Qwen/Qwen2.5-7B-Instruct | 7,61 mil millones (denso) | 131.072 tokens | Apache 2.0 | HuggingFace, ampliamente desplegado y cuantizado |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 mil millones (denso) | 131.072 tokens | Llama 3.1 Community License | HuggingFace, ecosistema amplio |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25 mil millones (denso) | 32.768 tokens | Apache 2.0 | HuggingFace, ecosistema amplio |

La diferencia practica frente a las alternativas no esta en la arquitectura ni en el tamano, sino en el gobierno del modelo: el ajuste de AxeronAI no declara licencia, no publica datos de entrenamiento, no ofrece benchmarks y depende de una libreria propietaria. Frente a Qwen2.5-7B-Instruct, que es Apache 2.0 y esta integrado en vLLM, llama.cpp, Ollama y TGI, este modelo no aporta ninguna ventaja verificable documentada.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica bajo que terminos se distribuye el modelo. Aunque el modelo base es Apache 2.0, un ajuste derivado puede estar sujeto a condiciones adicionales que el autor no ha publicado. No se recomienda su uso comercial sin aclaracion previa por escrito.
- Ausencia total de evaluacion: sin benchmarks ni datos de validacion, no hay evidencia de que el ajuste haya mejorado las capacidades del modelo base, y existe riesgo de degradacion por sobreajuste.
- Riesgo de sobreajuste por ajuste completo: 400 pasos de finetune sobre un modelo de 7,6 mil millones de parametros con una perdida final de 0,1747 puede indicar sobreajuste al conjunto de entrenamiento, especialmente si el dataset era pequeno. No se especifica el tamano del dataset.
- Sesgos desconocidos: al no documentarse la composicion de los datos de entrenamiento, no es posible evaluar sesgos demograficos, culturales o linguisticos introducidos por el ajuste.
- Riesgo de alucinacion: heredado del modelo base y potencialmente agravado si el ajuste se hizo sobre datos sinteticos o de baja verificacion. No hay evaluacion de factualidad.
- Limitaciones de idioma: no se declara la cobertura linguistica del finetune. Es posible que el ajuste haya reducido el soporte multilingue del modelo base en favor de un idioma o dominio concreto.
- Limitaciones de contexto: la ventana de 131.072 tokens corresponde al modelo base y no esta confirmada para este ajuste; un finetune con secuencias cortas puede degradar el rendimiento en contextos largos.
- Dependencia de una libreria no estandar: el campo `library_name: axeron-modelforge` apunta a un runtime no documentado publicamente, lo que complica la carga directa del modelo con transformers, vLLM o llama.cpp.
- Trazabilidad limitada: el repositorio se creo y actualizo el 2026-09-29, con 0 descargas y 0 likes, y la organizacion no publica informacion adicional sobre este artefacto concreto.
- Cifras de hardware estimadas: los requisitos de VRAM y despliegue indicados en esta ficha son calculos teoricos a partir del numero de parametros, no mediciones del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AxeronAI/axeron-mf-56
- Organizacion AxeronAI en HuggingFace: https://huggingface.co/AxeronAI
- Modelo relacionado de la misma organizacion (axeron-mf-40): https://huggingface.co/AxeronAI/axeron-mf-40
- Plataforma Axeron: https://www.axeron.ai/platform
- Sitio de Axeron AI: https://appaxeronai.com/
- Organizacion en GitHub: https://github.com/AxeronAI/
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
