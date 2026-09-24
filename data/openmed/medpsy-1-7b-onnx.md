# OpenMed/MedPsy-1.7B-ONNX

## Resumen

OpenMed/MedPsy-1.7B-ONNX es una conversion a ONNX Runtime del modelo qvac/MedPsy-1.7B, un ajuste fino de Qwen3-1.7B orientado a dominio medico, biomedico y clinico. La conversion la ha realizado el usuario OpenMed (sin vinculacion con los autores originales de MedPsy) y su objetivo es permitir la ejecucion del modelo en dispositivo, es decir, en Android, escritorio y navegador, mediante ONNX Runtime y Transformers.js.

El artefacto distribuye el grafo ONNX con cuantizacion mixta: cuerpo en int4 asimetrico con bloques de 32 y escalas en fp32, y capas sensibles (down_proj y v_proj segun la regla de Q4_K_M de llama.cpp) y tabla de embeddings/salida en int8. El resultado son 1,72 mil millones de parametros sin cambios respecto al original, 1,32 GiB de pesos y 6,58 bits por peso medidos sobre los tensores, un ancho efectivo superior al que sugiere la etiqueta "4-bit".

La relevancia de esta ficha esta en el nicho: modelos medicos pequenos ejecutables sin GPU dedicada y sin enviar datos a servidores externos. Se publica bajo licencia Apache 2.0, solo soporta ingles, y su uso declarado es investigacion y educacion. No es un dispositivo medico y no sustituye el consejo profesional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen3 (`Qwen3ForCausalLM`), atencion de consultas agrupadas (GQA), 28 capas, hidden size 2048, vocabulario de 151.936 tokens con embeddings de entrada/salida compartidos |
| Parametros totales | 1,72 B (sin cambios respecto al modelo fuente) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Cuerpo: int4 asimetrico round-to-nearest (uint4 + zero point empaquetado), bloque 32, escalas fp32, `MatMulNBits` accuracy_level 4. Capas sensibles y proyecciones segun regla Q4_K_M: int8 asimetrico, bloque 32. Embedding y cabeza de salida: tabla unica int8 asimetrica bloque 32. Sin datos de calibracion. Identificador de dtype en Transformers.js: `q4` |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 (con atribuciones del modelo fuente en `ATTRIBUTIONS.md`) |
| Formato de pesos | ONNX (`onnx/model_q4.onnx` de 0,3 MiB + `onnx/model_q4.onnx_data` de 1.368,9 MiB), con operadores `com.microsoft` (`MatMulNBits`, `GatherBlockQuantized`, `GroupQueryAttention`); no se distribuyen safetensors ni GGUF |
| Tamano del repositorio | 1,4 GB |
| Pesos medidos | 1,32 GiB (6,58 bits por peso) |
| Libreria declarada | transformers.js |
| Pipeline | text-generation |
| Modelo base | qvac/MedPsy-1.7B, revision `59335b96dd541b0061d748d7a6e9536e92274985` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-1.7B: un transformer decoder-only con 28 capas, hidden size de 2048, atencion de consultas agrupadas y un vocabulario de 151.936 tokens con la tabla de embeddings compartida entre entrada y cabeza de salida. Sobre esa base, QVAC ha realizado un ajuste fino orientado a dominio medico (MedPsy). Esta ficha no dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO en el ajuste; la model card del modelo fuente indica que se entreno con datos generados a partir de conjuntos CC-BY-NC.

La innovacion tecnica de este repositorio no esta en el modelo, sino en el proceso de conversion y cuantizacion. El grafo se genero con `onnxruntime-genai` 0.16.0 (model builder, grafo FP32 para CPU) y se cuantizo con `MatMulNBitsQuantizer` de onnxruntime 1.30.0, sin datos de calibracion (round-to-nearest puro). La cuantizacion es mixta y deliberadamente conservadora: se mantienen en 8 bits el embedding compartido y las proyecciones que mas degradan en 4 bits, siguiendo la heuristica de Q4_K_M de llama.cpp. La fidelidad medida frente al modelo fuente en FP32, sobre 4.092 tokens de prosa de dominio publico (Project Gutenberg) y con ONNX Runtime 1.30.0 en CPU, es: divergencia KL media de 0,140, acuerdo top-1 del 78,7 % y un incremento de perplejidad del 10,7 %. El autor indica que su export FP32 de partida coincide al 100 % con el modelo fuente en top-1, por lo que esa diferencia es atribuible unicamente a la cuantizacion. El tokenizador, la plantilla de chat y los valores por defecto de generacion son los del modelo original, sin modificar.

## Capacidades

- Generacion de texto conversacional en ingles, con especializacion declarada en contenido medico, biomedico y clinico.
- Respuesta a indicaciones de tipo educativo o divulgativo sobre salud (por ejemplo, explicar la diferencia entre un ataque de panico y un infarto).
- Ejecucion en dispositivo sin conexion: el grafo ONNX funciona integramente en CPU con ONNX Runtime 1.30 o superior, y en navegador o Node con Transformers.js 4.3.0.
- Generacion determinista verificada: el autor confirma que Transformers.js 4.3.0 y onnxruntime 1.30.0 (CPU, macOS) producen tokens greedy identicos.
- Soporte de conversaciones multi-turno mediante cache KV explicita (`past_key_values.*` / `present*`), lo que permite reutilizar contexto entre pasos.
- No hay informacion disponible sobre tool calling, function calling, soporte de agentes, modo de razonamiento explicito (thinking mode), vision, audio ni capacidades multimodales en esta conversion.
- Capacidades multilingues: limitadas al ingles; no se declara soporte de otros idiomas.

## Casos de uso

- Asistente de educacion sanitaria en navegador: cargando el modelo con Transformers.js y `dtype: "q4"`, se puede ofrecer un chat divulgativo sobre salud que se ejecuta en la maquina del usuario, sin enviar consultas a ningun servidor. Es adecuado por el bajo peso del artefacto (1,32 GiB de pesos) y porque no requiere backend.
- Aplicacion Android sin conexion: mediante `onnxruntime-android` y el operador `GroupQueryAttention`, el modelo puede integrarse en una app de consulta de dudas medicas basicas para entornos con conectividad limitada o nula. Conviene tener en cuenta que el autor no ha medido el rendimiento en dispositivo Android todavia.
- Simulacion de entrevistas clinicas para estudiantes: el modelo puede mantener un dialogo multi-turno en el rol de paciente o de profesional, sirviendo como material de practica para formacion en ciencias de la salud.
- Investigacion en NLP biomedico: evaluar como se comporta un fine-tune medico de 1,72 B cuantizado a int4/int8 frente a versiones en BF16 en tareas de pregunta-respuesta clinica, usando la cache KV para lotes largos.
- Prototipado rapido en escritorio: al ejecutarse en CPU con ONNX Runtime, permite levantar demos de generacion de texto medico sin GPU, util para validar prompts y plantillas antes de invertir en infraestructura mayor.
- Generacion de borradores de material divulgativo sobre salud en ingles: resumenes, explicaciones de terminos o guiones de contenido educativo, siempre con revision humana posterior dado el riesgo de alucinacion en dominio clinico.
- Preprocesado de texto clinico sintetico en pipelines de investigacion: dada la restriccion de uso a investigacion y educacion, su encaje natural es trabajar sobre corpus sinteticos o de dominio publico, no sobre datos de pacientes reales sin garantias adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K, MedQA ni similares para esta conversion ni, en la informacion aportada, para el modelo fuente qvac/MedPsy-1.7B.

Lo unico que se documenta son metricas de fidelidad de la cuantizacion frente al modelo fuente en FP32, que no deben interpretarse como rendimiento en tareas:

| Metrica de fidelidad | Valor |
|---|---|
| Divergencia KL media de las distribuciones del siguiente token | 0,140 |
| Acuerdo top-1 del siguiente token | 78,7 % |
| Cambio de perplejidad | +10,7 % |
| Corpus de evaluacion | 4.092 tokens de prosa de dominio publico (Project Gutenberg) |
| Entorno de medida | ONNX Runtime 1.30.0, CPU |

## Requisitos de hardware

- Pesos en disco: 1,32 GiB de tensores cuantizados (1.368,9 MiB en `onnx/model_q4.onnx_data`), mas tokenizador y ficheros auxiliares hasta un repositorio de 1,4 GB.
- Memoria en inferencia: por debajo de los 2 GB de pesos mas cache KV y activaciones. Con 28 capas, hidden size 2048 y GQA, el consumo total es moderado y apto para CPU; el autor no publica cifras de VRAM ni de RAM pico, por lo que cualquier estimacion distinta de la derivada del tamano de los pesos debe considerarse no disponible.
- GPU: el artefacto esta pensado para CPU y para el execution provider por defecto de ONNX Runtime. No se documentan GPU recomendadas (A100, H100, RTX 4090 u otras) ni requisitos de VRAM especificos para este grafo. Al ser un modelo de 1,72 B, cabe holgadamente en cualquier GPU de consumo con mas de 4 GB, pero es una inferencia de tamano, no un dato medido en este repositorio.
- Ejecucion en GPU de consumo: si cabe, por volumen de parametros, aunque no hay validacion publicada con execution providers CUDA o DirectML para esta conversion.
- Opciones de despliegue: ONNX Runtime 1.30 o superior (Python, macOS, Android mediante `onnxruntime-android`), `onnxruntime-genai` y Transformers.js 4.3.0 (navegador o Node). No aplican vLLM, TGI, llama.cpp ni Ollama, porque el artefacto distribuido es un grafo ONNX y no pesos safetensors ni GGUF.
- Latencia y throughput: no disponibles. El autor solo confirma que las salidas greedy son identicas entre Transformers.js y onnxruntime CPU en macOS, sin cifras de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Formato y cuantizacion | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| OpenMed/MedPsy-1.7B-ONNX | 1,72 B | ONNX, cuerpo int4 + capas sensibles int8 (6,58 bits/peso medidos) | no disponible | Apache 2.0 | HuggingFace, transformers.js / ONNX Runtime | Conversion orientada a dispositivo; sin herramientas de agente declaradas |
| qvac/MedPsy-1.7B (fuente) | 1,72 B | Pesos PyTorch del autor (BF16/FP32) | no disponible | Apache 2.0 segun esta conversion | HuggingFace | Ajuste fino medico de Qwen3-1.7B; entrenado con datos generados a partir de colecciones CC-BY-NC |
| Qwen3-1.7B (base) | 1,7 B aprox. | Safetensors, BF16 | no disponible en la informacion aportada | Apache 2.0 (modelo original de Qwen) | HuggingFace | Modelo generalista multilingue; el fine-tune medico parte de el |

No se dispone de datos de contexto, benchmarks ni licencias verificadas de terceros mas alla de lo indicado, por lo que la comparacion se limita a parametros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un dispositivo medico. La model card del autor lo declara explicitamente como material de investigacion y educacion y advierte de que no sustituye el consejo, diagnostico ni tratamiento profesional. Las salidas pueden ser incorrectas y deben verificarse.
- Riesgo de alucinacion elevado en dominio clinico: es un modelo de 1,72 B ajustado sobre datos generados, sin verificacion factual, y la cuantizacion introduce una degradacion medible (acuerdo top-1 del 78,7 % frente al modelo en FP32).
- Idiomas: solo ingles. No hay soporte declarado de castellano ni de otros idiomas.
- Longitud de contexto: no documentada en esta conversion; planificar cualquier uso multi-turno largo sin asumir una ventana concreta.
- Restriccion de procedencia de datos: segun la model card, el modelo fuente se entreno con datos generados a partir de conjuntos CC-BY-NC. Aunque la licencia declarada es Apache 2.0, conviene revisar `ATTRIBUTIONS.md` y la licencia del modelo fuente antes de un uso comercial, porque la clausula no comercial de los datos subyacentes puede condicionar el despliegue en produccion.
- Atribucion obligatoria: este repositorio es una conversion no oficial; el autor original (QVAC) no esta afiliado ni respalda esta version. Al usarlo hay que citar el modelo original.
- Compatibilidad de runtime estricta: requiere ONNX Runtime 1.30 o superior. Usa operadores `com.microsoft` (`MatMulNBits`, `GatherBlockQuantized`, `GroupQueryAttention`), por lo que no funcionara en runtimes ONNX genericos que no expongan el execution provider de Microsoft.
- Rendimiento en Android no verificado: el propio autor indica que aun no se ha medido en un dispositivo Android, aunque el artefacto este pensado para ello.
- Madurez baja: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validacion externa independiente.
- No hay soporte documentado de tool calling, modo de razonamiento explicito, vision ni audio; cualquier integracion de agente habria que construirla por encima del texto generado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OpenMed/MedPsy-1.7B-ONNX
- Modelo fuente: https://huggingface.co/qvac/MedPsy-1.7B
- Revision del modelo fuente citada: `59335b96dd541b0061d748d7a6e9536e92274985`
- ONNX: https://onnx.ai
- ONNX Runtime: https://onnxruntime.ai
- Documentacion de Transformers.js: https://huggingface.co/docs/transformers.js
- Licencia Apache 2.0 incluida en el repositorio: `LICENSE`
- Atribuciones del modelo fuente: `ATTRIBUTIONS.md`
- Fichero de trazabilidad de la conversion: `openmed_build.json` (incluido en el repositorio)
