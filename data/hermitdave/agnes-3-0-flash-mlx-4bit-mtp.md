# hermitdave/Agnes-3.0-Flash-MLX-4bit-MTP

## Resumen

Agnes-3.0-Flash-MLX-4bit-MTP es una cuantizacion a 4 bits en formato MLX del modelo Agnes-AI/Agnes-3.0-Flash, publicada por el usuario hermitdave. El modelo base pertenece a la familia arquitectonica `qwen3_5`, con un diseno hibrido que combina atencion lineal basada en gated delta net y atencion global, y una ventana de contexto de 262.144 tokens. La conversion pesa 32.205.067.008 parametros (unos 32,2 mil millones) y ocupa 19,4 GB en el repositorio, con pesos cuantizados de forma afin a 4 bits con tamano de grupo 64, lo que equivale a 4,50 bits por peso y aproximadamente 17 GB.

La relevancia de esta ficha es doble. Por un lado, permite ejecutar un modelo de 32B con 256K de contexto en hardware Apple Silicon mediante la libreria MLX, sin necesidad de GPU dedicada. Por otro, el autor ha normalizado la conversion para que cargue como un modelo `qwen3_5` estandar sin codigo personalizado: ha plegado la FFN paralela en el MLP principal, ha renombrado las capas `delta_attn` a `linear_attn` y `global_attn` a `self_attn`, ha convertido el RMSNorm centrado en uno a formato estandar y ha pasado de bf16 a fp16 para compatibilidad de serializacion.

El resultado es un modelo unicamente de texto (se han eliminado la cabeza MTP y la torre de vision del modelo original) que soporta modo thinking on/off a traves de la plantilla de chat original, y que puede acelerarse mediante decodificacion especulativa con un drafter MTP independiente. La licencia es Apache-2.0, heredada del modelo base, y los idiomas declarados son ingles y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido `qwen3_5`: atencion lineal (gated delta net) + atencion global (hybrid-attention) |
| Parametros totales | 32.205.067.008 (~32,2 B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | MLX affine 4-bit, group size 64 (4,50 bits/peso); pesos ~17 GB, repo 19,4 GB |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX), cuantizado a 4 bits |
| Modelo base | Agnes-AI/Agnes-3.0-Flash |
| Libreria de inferencia | mlx / mlx-lm / mlx-vlm |
| Tamano oculto | 5.120 (segun la model card, alineado con la familia qwen3_5) |
| Tamano intermedio (MLP) | 19.456 (tras plegar la FFN paralela) |
| Vocabulario | 248.320 tokens |
| Modalidad | solo texto (sin torre de vision ni cabeza MTP) |
| Fecha de publicacion | 24 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es un transformer hibrido de la familia `qwen3_5`. Combina capas de atencion lineal (`linear_attn`, derivadas del mecanismo de gated delta net del modelo original, originalmente denominado `delta_attn`) con capas de atencion global (`self_attn`, originalmente `global_attn`). Esta mezcla permite sostener una ventana de contexto de 262.144 tokens con un coste de memoria y computo menor que la atencion densa pura, algo critico para un modelo de 32B desplegado en memoria unificada. El autor indica que la conversion pliega la FFN paralela en el MLP principal mediante concatenacion, dejando un `intermediate_size` de 19.456, y normaliza el RMSNorm centrado en uno al formato estandar.

No se dispone de informacion sobre el proceso de entrenamiento del modelo base: no se detalla el numero de tokens, la composicion del dataset ni si hubo fases de RLHF, DPO u otros ajustes por preferencias. Lo que si documenta la model card es el proceso de conversion: renombrado de capas, cambio de bf16 a fp16 y eliminacion de los pesos MTP para evitar una doble conversion en `mlx_lm`. La innovacion practica destacable es el soporte de decodificacion especulativa: existe un drafter MTP complementario, extraido del modelo Agnes-3.0-Flash original y compatible con la atencion con gating de Qwen3.5, con el que el autor reporta hasta 2x de aceleracion en generacion.

## Capacidades

- Generacion de texto conversacional y de proposito general, con plantilla de chat compatible con el modelo original.
- Modo thinking on/off seleccionable a traves de la plantilla de chat original.
- Contexto largo: hasta 262.144 tokens en una sola ventana, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Generacion de codigo (el autor incluye mediciones sobre generaciones de codigo de 500 tokens).
- Razonamiento multi-paso mediante el modo thinking.
- Capacidades multilingues limitadas a ingles y chino segun los metadatos del modelo.
- Decodificacion especulativa opcional con drafter MTP externo (hasta 2x mas rapido segun el autor).
- No soporta vision: la torre de vision del modelo original no esta incluida en esta conversion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos largos en local: gracias a los 262.144 tokens de contexto, el modelo puede ingerir contratos, expedientes o informes completos sin troceado, ejecutandose integramente en un Mac con memoria unificada y sin enviar datos a servicios externos.
- Asistentes de codigo en estaciones de trabajo Apple Silicon: con MLX, LM Studio u oMLX como runtime, el modelo puede integrarse en el flujo de edicion del desarrollador para generacion y refactorizacion de codigo, con la ventaja de que los pesos de 17 GB caben en equipos de gama alta de escritorio.
- Atencion al cliente bilingue ingles-chino: el modelo cubre ambos idiomas de forma nativa y mantiene conversaciones multi-turno con historial largo, lo que permite conservar el contexto completo de una incidencia sin resumir.
- Procesamiento de conocimiento interno con requisitos de privacidad: al poder ejecutarse completamente offline en hardware local, encaja en entornos sanitarios, legales o financieros donde no se permite el envio de datos a APIs de terceros.
- Generacion de documentacion tecnica y resumenes estructurados: el modo thinking permite forzar un razonamiento previo antes de emitir el resultado, util para generar informes con pasos justificados.
- Prototipado e investigacion en procesamiento de lenguaje natural: la licencia Apache-2.0 y el formato MLX estandar facilitan experimentos de cuantizacion, evaluacion de contexto largo y comparativas de decodificacion especulativa sin ataduras de licencia restrictivas.
- Despliegue de bajo coste en Mac mini o Mac Studio: frente a alternativas que requieren GPU A100 o H100, este modelo permite servir un 32B con contexto de 256K en un unico equipo de consumo profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye mediciones de MMLU, HumanEval, GSM8K ni de ninguna otra suite estandar, ni comparaciones numericas con modelos de referencia.

El unico dato de rendimiento medido que aparece en la documentacion es de throughput, no de calidad:

| Escenario | Hardware | Modo | Velocidad |
|---|---|---|---|
| Generacion de codigo de 500 tokens, temperatura 0 | MacBook Pro M3 Max, 64 GB, oMLX | Decodificacion por lotes estandar | 16,5-17,2 tok/s |
| Generacion de codigo de 500 tokens, temperatura 0 | MacBook Pro M3 Max, 64 GB, oMLX | DFlash con drafter z-lab/Qwen3.8-27B-DFlash2 | 24,3-24,6 tok/s (+45 %) |

## Requisitos de hardware

- VRAM / memoria unificada estimada: los pesos cuantizados ocupan aproximadamente 17 GB. Con cache KV para contexto corto, un minimo practico de 24 GB de memoria unificada; para aprovechar ventanas cercanas a 256K conviene disponer de 48-64 GB.
- Aceleradores compatibles: el modelo esta en formato MLX, por lo que requiere Apple Silicon (familias M1, M2, M3, M4 y posteriores). No es ejecutable de forma nativa en CUDA ni en GPU NVIDIA.
- GPU de consumo: no aplica en el sentido tradicional; el equivalente es la memoria unificada de los chips Apple. El autor ha validado el rendimiento en un M3 Max con 64 GB.
- GPU de datacenter: no disponible; la conversion no incluye pesos en formato safetensors para CUDA ni variantes GGUF.
- Opciones de despliegue: `mlx-lm` (linea de comandos y API de Python), `mlx-vlm` (`python -m mlx_vlm.server`) para el servidor con decodificacion especulativa, LM Studio colocando la carpeta en `~/.lmstudio/models/hermitdave/`, y oMLX.
- Decodificacion especulativa: existe un drafter MTP complementario (`hermitdave/Agnes-3.0-Flash-MTP-drafter`) para `mlx-vlm`. oMLX todavia no soporta MTP para modelos de solo texto; para DFlash en oMLX el autor recomienda usar `z-lab/Qwen3.8-27B-DFlash2` como drafter, que comparte tokenizer (vocabulario 248.320), tamano oculto (5.120) y familia arquitectonica.
- Latencia y throughput: 16,5-17,2 tok/s en decodificacion por lotes estandar y 24,3-24,6 tok/s con DFlash, medidos en M3 Max de 64 GB con oMLX, temperatura 0 y generaciones de codigo de 500 tokens.
- Nota de compatibilidad: si se usa oMLX con el drafter MTP incluido, la construccion del drafter falla silenciosamente y el sistema cae a decodificacion por lotes sin aviso en la interfaz. Se debe verificar en `~/.omlx/logs/server.log` la presencia de `DFlashEngine loaded`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| hermitdave/Agnes-3.0-Flash-MLX-4bit-MTP | 32,2 B | 262.144 | MLX safetensors, 4-bit affine (4,50 bits/peso) | Solo texto | Apache-2.0 | HuggingFace, MLX |
| Agnes-AI/Agnes-3.0-Flash (base) | no disponible (modelo original completo) | 262.144 | safetensors bf16 | Texto + vision + cabeza MTP | Apache-2.0 | HuggingFace |
| hermitdave/Agnes-3.0-Flash-MLX-4bit (referencia) | no disponible | no disponible | MLX safetensors, 4-bit | Solo texto | Apache-2.0 | HuggingFace, MLX |
| z-lab/Qwen3.8-27B-DFlash2 | no disponible | no disponible | no disponible | Drafter de decodificacion especulativa | no disponible | HuggingFace |

Datos de benchmarks comparativos: no disponibles en la informacion proporcionada. Las diferencias documentadas entre la version aqui descrita y la referencia `Agnes-3.0-Flash-MLX-4bit` se limitan al proceso de conversion: plegado de la FFN paralela, renombrado de capas de atencion, conversion del RMSNorm centrado en uno y eliminacion de los pesos MTP.

## Limitaciones y advertencias

- Riesgo de alucinacion: no disponible en la informacion proporcionada; no se han publicado evaluaciones de fidelidad ni tasas de error.
- Sesgos conocidos: no disponible; la model card no documenta analisis de sesgos ni composicion del dataset de entrenamiento.
- Idiomas: solo ingles y chino. No hay soporte declarado de castellano, por lo que su uso en produccion en espanol no esta respaldado por el autor.
- Modalidad limitada: la torre de vision y la cabeza MTP del modelo original han sido eliminadas en esta conversion. Cualquier caso de uso multimodal no es viable con estos pesos.
- Dependencia de plataforma: al estar en formato MLX, el modelo solo se ejecuta en Apple Silicon. No hay pesos GGUF ni safetensors para CUDA, lo que limita el despliegue en infraestructura de servidores convencional.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia y de atribucion. Se debe verificar la licencia del modelo base Agnes-AI/Agnes-3.0-Flash, que es la que se hereda.
- Proceso de conversion no neutral: el autor ha modificado nombres de capas y plegado componentes para que el modelo cargue como `qwen3_5` estandar. Esto facilita el uso con herramientas existentes, pero implica que los pesos no son un reflejo literal del checkpoint original.
- Compatibilidad de decodificacion especulativa: el drafter MTP incluido no funciona como drafter DFlash en oMLX y provoca una degradacion silenciosa a decodificacion por lotes. Es necesario usar el drafter alternativo o revisar los registros del servidor.
- Trazabilidad: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no se han publicado resultados de benchmarks independientes que validen la calidad de la cuantizacion.
- Contexto largo: aunque la ventana declarada es de 262.144 tokens, no se documentan pruebas de rendimiento sostenido ni de degradacion de calidad en esa longitud.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/hermitdave/Agnes-3.0-Flash-MLX-4bit-MTP
- Modelo base: https://huggingface.co/Agnes-AI/Agnes-3.0-Flash
- Drafter MTP complementario: https://huggingface.co/hermitdave/Agnes-3.0-Flash-MTP-drafter
- Drafter DFlash recomendado para oMLX: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Pipeline de conversion (Hermes Agent, Nous Research): https://hermes-agent.nousresearch.com
