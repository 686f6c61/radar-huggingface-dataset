# nevidomy/llmua-v1-124m-sft

## Resumen

LLMUA v1 124M SFT es un ajuste fino supervisado (SFT) del modelo base nevidomy/llmua-v1-124m, un modelo de lenguaje de 124 millones de parametros entrenado desde cero para el ucraniano dentro del estudio LLMUA. Lo desarrolla Vitalii Nevidomyi y su proposito no es ser un asistente de produccion, sino una sonda experimental: verificar que el modelo base admite ajuste fino y validar la receta de SFT antes de aplicarla a modelos de mayor tamano de la misma escalera de escalado.

El modelo tiene 124.280.320 parametros y se distribuye en formato safetensors con codigo propio (custom_code) para transformers. Se ha afinado sobre 15.000 ejemplos de un solo turno procedentes de UA-SQuAD, UA-News, UA-GEC 2.0 y la porcion ucraniana del dataset Aya, con una perdida de validacion de 1,0503 bpc. Su relevancia es metodologica: documenta de forma reproducible como se comporta el ajuste fino a esta escala en un idioma de recursos medios como el ucraniano.

La licencia es CC BY-SA 4.0 para los pesos y Apache-2.0 para el codigo del modelo. Esta pensado exclusivamente para investigacion y evaluacion de recetas, no para uso comercial directo ni como asistente conversacional general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (definida en `modeling_llmua.py`, custom_code) |
| Parametros totales | 124.280.320 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | ucraniano (uk) |
| Licencia | CC BY-SA 4.0 (pesos); Apache-2.0 (codigo del modelo) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only entrenado desde cero para ucraniano, con un checkpoint base entrenado a 80 tokens por parametro. El ajuste fino parte de ese checkpoint final y utiliza 15.000 ejemplos de un solo turno: 5.000 de UA-SQuAD, 6.000 de UA-News, 3.678 de UA-GEC 2.0 y 322 de la porcion ucraniana de Aya. Se reserva un split fijo de 1.700 ejemplos para validacion.

La receta de SFT aplica la perdida unicamente sobre los tokens de respuesta y el token de fin de respuesta, sin perdida en las costuras de empaquetado (packing). En UA-GEC, los fragmentos copiados de la entrada se ponderan a la baja mediante un diff a nivel de token entre origen y destino. El optimizador reutiliza la receta del modelo base a una decima parte de sus tasas: Muon 4,5e-5 y AdamW 1,19e-4, con weight decay 0,1. El schedule es de 5 epocas con 5% de warmup y decaimiento lineal hasta cero, con un batch de 8.192 tokens por paso y empaquetado denso. La perdida en validacion es de 1,0503 bpc, calculada sobre los tokens de respuesta mas el token de fin, cuyos bits se amortizan sobre los caracteres de la respuesta.

## Capacidades

- Generacion de texto en ucraniano con estilo de respuesta corta.
- Respuesta a preguntas extractivas (herencia de UA-SQuAD).
- Clasificacion de noticias (herencia de UA-News).
- Correccion gramatical y de estilo (herencia de UA-GEC 2.0).
- Conversacion de un solo turno mediante la plantilla `<|bos|><|usr|>{question}<|assistant|>{answer}<|end|>`.
- Parada de generacion en el token `<|end|>`; la configuracion de generacion suprime BOS.
- Normalizacion de finales de linea en el tokenizador (`\r\n`, `\r`, tabulador vertical y salto de pagina se convierten en `\n`).
- No soporta tool calling, function calling, agentes, multi-step reasoning, vision, audio ni modo thinking.
- No dispone de ajuste de seguridad ni de alineacion conversacional.

## Casos de uso

- Validacion de recetas de ajuste fino: sirve como banco de pruebas reproducible para comprobar que una receta de SFT (tasas, schedule, enmascarado de perdida) funciona antes de escalarla a modelos mayores del estudio LLMUA.
- Investigacion sobre correccion gramatical en ucraniano: el ajuste con UA-GEC 2.0 y la ponderacion por diff de tokens permite estudiar como un modelo de 124M aprende a corregir spans copiados de la entrada.
- Experimentos de QA extractiva de bajo coste: con UA-SQuAD como fuente, se puede evaluar la capacidad de un modelo pequeno para localizar respuestas en un parrafo, util en entornos academicos con recursos limitados.
- Clasificacion de noticias en ucraniano: el ajuste con UA-News permite probar un pipeline de etiquetado de titulares o resumenes como caso base frente a modelos multilingues mayores.
- Estudio de repeticion y decodificacion: dado el 26% de repeticiones en modo greedy documentado por el autor, es un caso util para investigar penalizaciones de repeticion y bloqueo de n-gramas en modelos pequenos.
- Reproducibilidad de papers: al publicar paper, codigo y pesos, permite replicar los resultados del apendice M del informe tecnico y comparar con el modelo base sin SFT.
- Docencia y practicas de transformers: su tamano (0,5 GB de repo) y su plantilla de chat simple lo hacen adecuado para ejercicios de inferencia y ajuste fino en entornos docentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de rendimiento reportado por el autor es la perdida en validacion: 1,0503 bpc sobre el split reservado de 1.700 ejemplos. Tambien se reporta una medicion propia de repeticion sobre 175 prompts abiertos: 26% de respuestas greedy y 19% de respuestas muestreadas (temperatura 0,7) repiten un span de 10 tokens.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, menos de 2 GB en la mayoria de configuraciones.
- VRAM estimada en fp16/bf16: alrededor de 0,25 GB para pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; una RTX 3060, RTX 4060 o superior es mas que suficiente. Tambien funciona en CPU para pruebas.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la via documentada. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al requerir codigo propio la conversion a GGUF no esta soportada de serie.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| nevidomy/llmua-v1-124m-sft | 124,28M | no disponible | ucraniano | CC BY-SA 4.0 (pesos) | SFT de un solo turno, sonda experimental |
| nevidomy/llmua-v1-124m (base) | 124,28M | no disponible | ucraniano | no disponible en la informacion | Modelo base sin SFT, mismo estudio |
| Modelos multilingues pequenos tipo Qwen2.5-0.5B / SmolLM2-135M | 135M-500M | 4K-32K (segun modelo) | multilingue | Apache-2.0 (tipico) | No disponibles en la informacion proporcionada para comparacion directa de rendimiento |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas. La comparativa se limita a parametros, licencia e idioma.

## Limitaciones y advertencias

- Estilo de respuesta corta: la mayoria de las respuestas de entrenamiento son breves (spans, etiquetas de noticias, correcciones), y el modelo replica ese estilo.
- Precision factica baja: con 124M de parametros comete errores facticos con frecuencia; no es fiable como fuente de datos.
- Repeticion: el propio autor reporta un 26% de repeticiones de spans de 10 tokens en modo greedy y un 19% en muestreo con temperatura 0,7 sobre 175 prompts abiertos. Conviene aplicar penalizacion de repeticion o bloqueo de n-gramas.
- Alcance limitado a un solo turno: la plantilla acepta exactamente un mensaje de usuario y, opcionalmente, uno de asistente. No hay soporte multi-turno.
- Sin ajuste de seguridad: no se ha aplicado ninguna alineacion de seguridad, por lo que puede generar contenido inapropiado.
- Solo ucraniano: no se ha entrenado para otros idiomas y su rendimiento fuera del ucraniano no esta documentado.
- Restricciones de licencia: los pesos son CC BY-SA 4.0, lo que obliga a compartir obras derivadas bajo la misma licencia y a atribuir. El dataset UA-News no declara licencia en su origen, lo que introduce incertidumbre sobre la procedencia de parte de los datos de entrenamiento.
- Requiere `trust_remote_code=True`: el modelo usa codigo propio (`configuration_llmua.py`, `modeling_llmua.py`), lo que implica ejecutar codigo del autor y complica el despliegue en entornos restringidos.
- Tokenizador con normalizacion de finales de linea: conviene tenerlo en cuenta si se procesan textos con `\r\n` u otros caracteres de control.
- No apto para produccion: el propio autor lo describe como una sonda, no como un asistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nevidomy/llmua-v1-124m-sft
- Modelo base: https://huggingface.co/nevidomy/llmua-v1-124m
- Paper (PDF, apendice M): https://github.com/nevidomy/llmua_v1/blob/main/paper/llmua_paper1.pdf
- Codigo del estudio: https://github.com/nevidomy/llmua_v1
- Dataset UA-SQuAD: https://huggingface.co/datasets/FIdo-AI/ua-squad
- Dataset UA-News: https://huggingface.co/datasets/FIdo-AI/ua-news
- Dataset UA-GEC 2.0: https://github.com/grammarly/ua-gec
- Dataset Aya: https://huggingface.co/datasets/CohereLabs/aya_dataset
