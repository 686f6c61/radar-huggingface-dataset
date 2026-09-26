# pi-dal/Linnaeus-0.1.0-2B-MLX-VLM-4bit

## Resumen

Linnaeus-0.1.0-2B-MLX-VLM-4bit es una compilacion multimodal (texto + imagen) en formato MLX del modelo de decision Linnaeus, publicada por el usuario pi-dal. No se trata de un modelo generativo conversacional al uso, sino de un "decision model": su salida es una puntuacion extraida de los logits en una fila concreta (`logits[marker_pos, score_row_id]`) en cada marcador `<|fim_suffix|>`, siguiendo un contrato definido en el fichero `linnaeus-runtime.json`. El modelo base es pi-dal/Linnaeus-0.1.0-2B y esta pensado para ejecutarse en macOS e iOS mediante la libreria mlx-swift-lm (implementacion `Qwen35.swift`) junto con una torre de vision.

El modelo tiene 2.213.243.712 parametros totales y ocupa 1,7 GB en el repositorio de HuggingFace. La pila de lenguaje esta cuantizada a 4 bits, mientras que la torre de vision se mantiene en bf16, lo que da un peso en memoria de aproximadamente 1,6 GB en inferencia. La etiqueta `qwen3_5` en el repositorio sugiere que la arquitectura del stack de lenguaje deriva de la familia Qwen 3.5, aunque la model card no detalla la configuracion exacta.

Su relevancia es acotada pero concreta: cubre el nicho de decisiones multimodales en local sobre silicio de Apple, sin depender de CUDA ni de servicios en la nube. La model card reporta un ~67% en las tareas de texto de JevBench v1.2.2 (frente al 65,8% del modelo upstream), y verifica la ruta de imagen contra PyTorch con deltas de probabilidad inferiores a 0,001 en pruebas sinteticas. El numero de descargas (21) y de "likes" (0) indica una adopcion muy temprana y un ecosistema practicamente inexistente alrededor del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con torre de vision; el stack de lenguaje se etiqueta como `qwen3_5`. Detalle completo no disponible |
| Parametros totales | 2.213.243.712 |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits en la pila de lenguaje; torre de vision en bf16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX, libreria `mlx`) |

## Arquitectura y entrenamiento

La informacion disponible describe una arquitectura multimodal compuesta por un stack de lenguaje (etiquetado `qwen3_5`, presumiblemente derivado de Qwen 3.5) y una torre de vision independiente. Las decisiones se implementan mediante una cabeza de puntuacion sobre los logits: para cada marcador `<|fim_suffix|>` se lee `logits[marker_pos, score_row_id]`, de modo que el modelo no genera texto libre sino que puntua filas de una matriz de decision. Las preguntas con imagen anteponen la secuencia `<|vision_start|><|image_pad|><|vision_end|>` y pasan los `pixel_values` por el procesador de mlx-vlm. La implementacion en Swift vive en `Qwen35.swift` dentro de mlx-swift-lm, lo que permite desplegarlo en macOS e iOS.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO. Tampoco se documenta el proceso de destilacion o ajuste que llevo del modelo base al build multimodal. La unica innovacion tecnica descrita explicitamente es la reutilizacion de prefijo compartido en `predict()`: el estado (incluidos los tokens de imagen) se propaga una sola vez y cada pregunta solo procesa su sufijo, lo que produce una aceleracion medida de 1,4x con 8 preguntas de texto y 4,5x con 6 preguntas de imagen. Este mecanismo es interno a `MlxPredictor` y no altera el contrato de decision.

## Capacidades

- Decision multimodal texto + imagen: el modelo puntua opciones o filas de decision a partir de entradas de texto y de imagen, no genera respuestas en lenguaje natural.
- Procesamiento de imagen mediante torre de vision en bf16, con verificacion end-to-end frente a PyTorch (deltas de probabilidad < 0,001 en pruebas sinteticas).
- Soporte multi-pregunta con prefijo compartido: multiples cuestiones sobre el mismo contexto (incluida la misma imagen) se resuelven con una sola propagacion del prefijo.
- Contrato de decision formalizado en `linnaeus-runtime.json`, lo que facilita la integracion programatica.
- Ejecucion en Apple Silicon mediante MLX, con soporte declarado para macOS e iOS a traves de mlx-swift-lm.
- Capacidades de tool calling, function calling, agentes, razonamiento multi-paso, matemeticas avanzadas o generacion de codigo: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Clasificacion y enrutado de decisiones en local sobre macOS: el modelo puntua filas de decision a partir de texto, lo que permite integrarlo como clasificador de intenciones o de categorias dentro de una aplicacion de escritorio sin enviar datos a un servicio externo.
- Decision asistida por capturas de pantalla en iOS: con la ruta de imagen habilitada, se pueden puntuar decisiones a partir de capturas o fotos, por ejemplo para validar formularios o comprobar el estado de una interfaz.
- Evaluacion por lotes de cuestionarios: gracias a la reutilizacion de prefijo (1,4x con 8 preguntas de texto), es adecuado para escenarios donde muchas preguntas comparten un mismo contexto, como baterias de preguntas sobre un documento comun.
- Analisis de imagenes con multiples preguntas asociadas: el factor de 4,5x con 6 preguntas de imagen lo hace util para inspeccionar una misma captura con varias consultas encadenadas (deteccion de elementos, estado, coherencia).
- Componente de pre-filtrado en pipelines mas grandes: al ocupar aproximadamente 1,6 GB y operar con puntuaciones, puede actuar como primera etapa que descarta casos triviales antes de invocar un modelo generativo mayor.
- Validacion de portabilidad de modelos: la verificacion de la ruta de imagen contra PyTorch con deltas inferiores a 0,001 lo convierte en una referencia util para comprobar que una cuantizacion a 4 bits no degrada las decisiones durante un port a MLX.
- Aplicaciones offline en dispositivos Apple: al no requerir CUDA, encaja en herramientas de campo o entornos con conectividad restringida donde el proceso debe ejecutarse integramente en el dispositivo.

## Benchmarks y rendimiento

| Benchmark | Este modelo | Referencia | Notas |
|---|---|---|---|
| JevBench v1.2.2 (tareas de texto) | ~67% | 65,8% (modelo upstream) | Capaz tambien de imagen; peso de 1,6 GB con torre de vision en bf16 |
| Verificacion de ruta de imagen frente a PyTorch | Delta de probabilidad < 0,001 | No aplica | Sondas sinteticas, segun la model card |
| Aceleracion con prefijo compartido | 1,4x con 8 preguntas de texto | No aplica | Interno a `MlxPredictor` |
| Aceleracion con prefijo compartido (imagen) | 4,5x con 6 preguntas de imagen | No aplica | Interno a `MlxPredictor` |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- Inferencia estimada: aproximadamente 1,6 GB para la pila de lenguaje en 4 bits mas la torre de vision en bf16; el repositorio completo ocupa 1,7 GB.
- Plataforma obligatoria: Apple Silicon (MLX). No hay soporte CUDA ni ROCm descrito en la informacion disponible.
- GPU recomendadas: no aplica en el sentido habitual; el modelo se ejecuta sobre la GPU integrada de los chips de la serie M de Apple.
- Cabe en GPU de consumo: si, en cualquier Mac con Apple Silicon y memoria unificada suficiente (unos 2 a 4 GB libres bastan, por lo que practicamente cualquier equipo con 8 GB o mas es viable).
- Opciones de despliegue: libreria `mlx`, `mlx-vlm` para el procesamiento de imagen y `mlx-swift-lm` para integracion en macOS e iOS mediante `Qwen35.swift`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma absoluta; la model card solo aporta factores relativos de aceleracion (1,4x y 4,5x) por reutilizacion de prefijo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en JevBench v1.2.2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Linnaeus-0.1.0-2B-MLX-VLM-4bit (este modelo) | 2.213.243.712 | No disponible | ~67% (texto) | Apache 2.0 | HuggingFace, libreria MLX |
| pi-dal/Linnaeus-0.1.0-2B (modelo base) | No disponible | No disponible | 65,8% (upstream) | Apache 2.0 (heredada) | HuggingFace |

No se dispone de datos sobre otros modelos de decision multimodales comparables en la informacion proporcionada, por lo que la comparativa con alternativas externas queda como no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No hay documentacion sobre la composicion del dataset de entrenamiento ni sobre evaluaciones de equidad.
- Riesgo de alucinacion: el modelo no genera texto libre, sino puntuaciones sobre filas de decision, por lo que el riesgo se traslada a decisiones mal puntuadas. No hay tasas de error publicadas mas alla del ~67% en JevBench v1.2.2 (texto).
- Contrato de decision fragil: la salida depende de leer `logits[marker_pos, score_row_id]` en posiciones concretas de marcadores `<|fim_suffix|>`. Cualquier cambio en la tokenizacion o en el manejo de marcadores invalida el resultado.
- Dependencia de plataforma: el modelo esta atado a MLX y a Apple Silicon. No hay version para CUDA, lo que limita su uso en servidores x86 convencionales.
- Ambito funcional estrecho: no es un modelo conversacional ni de generacion; usarlo fuera del contrato de decision definido en `linnaeus-runtime.json` no producira resultados utiles.
- Idiomas soportados: no disponibles, lo que impide garantizar un comportamiento correcto en castellano u otras lenguas.
- Longitud de contexto: no disponible, lo que impide planificar escenarios de contexto largo con garantias.
- Madurez: 21 descargas, 0 "likes" y un unico autor. No hay senales de mantenimiento, comunidad ni soporte.
- Licencia: Apache 2.0 permite uso comercial, pero al ser un build derivado conviene verificar la licencia efectiva del modelo base si cambia en el futuro.
- Advertencia sobre el rendimiento reportado: el ~67% y las aceleraciones provienen de la model card del autor y no han sido verificados de forma independiente.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/pi-dal/Linnaeus-0.1.0-2B-MLX-VLM-4bit
- Modelo base: https://huggingface.co/pi-dal/Linnaeus-0.1.0-2B
- Model card del autor (referencia citada en la seccion de informacion)
- Paper, blog, repositorio o demo adicionales: no disponibles. La busqueda web realizada devolvio unicamente resultados irrelevantes sobre el numero pi (Wikipedia en frances e ingles, Britannica, jlsigrist.com y piday.org), sin relacion alguna con el modelo Linnaeus.
