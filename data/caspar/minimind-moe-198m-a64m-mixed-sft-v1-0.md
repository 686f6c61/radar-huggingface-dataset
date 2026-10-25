# caspar/MiniMind-MoE-198M-A64M-Mixed-SFT-v1.0

## Resumen

MiniMind-MoE-198M-A64M-Mixed-SFT-v1.0 es un modelo de lenguaje de tipo Mixture-of-Experts de escala muy reducida (198.416.640 parametros totales, aproximadamente 64 M activos por token) publicado por el usuario independiente caspar bajo licencia Apache-2.0. Se trata de un checkpoint final de SFT mixto, entrenado sobre la arquitectura MiniMind MoE (hidden size 768, 8 capas, 4 expertos con enrutado top-1 y vocabulario de 6400 tokens) y derivado del codigo de referencia del repositorio jingyaogong/minimind. Su interes no es la calidad conversacional, sino servir como banco de pruebas abierto y reproducible para estudiar enrutado MoE, recetas de SFT y pipelines de evaluacion a un coste computacional minimo.

El modelo se distribuye en safetensors FP16 con embeddings atados, ocupa 0,4 GB en el repositorio y se ejecuta con `transformers` mediante codigo custom (`trust_remote_code=True`). Esta entrenado exclusivamente en ingles y su ventana de contexto efectiva es de 340 tokens, la misma longitud usada durante el preentrenamiento y el SFT; el buffer de posiciones de la arquitectura admite secuencias mas largas, pero esa capacidad no ha sido validada.

El propio autor lo califica de experimental y advierte de que no es un asistente de razonamiento fiable: en GSM8K test completo (1.319 preguntas, zero-shot greedy y puntuacion estricta del formato `#### number`) obtiene 17 aciertos (1,29 %). Su relevancia actual es, por tanto, documental y metodologica: publica la receta de datos, hiperparametros y metricas antes/despues, algo poco habitual en checkpoints de este tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniMind MoE (transformer decoder-only con mezcla de expertos), codigo custom en `model_minimind.py` |
| Parametros totales | 198.416.640 |
| Parametros activos | Aproximadamente 64 M (4 expertos, enrutado top-1) |
| Longitud de contexto | 340 tokens entrenados y validados; el buffer de posiciones permite contextos mayores, pero sin validar |
| Tipos de cuantizacion | No se publican cuantizaciones oficiales; el checkpoint se distribuye solo en FP16 safetensors. La conversion a INT8/INT4/GGUF requeriria portar el codigo custom a la herramienta destino |
| Idiomas soportados | Ingles (`en`) unicamente |
| Licencia | Apache-2.0 (modelo y codigo; no relicencia los datasets de origen) |
| Formato de pesos | safetensors (FP16), embeddings atados (tied embeddings) |
| Hidden size | 768 |
| Numero de capas | 8 |
| Tamano de vocabulario | 6400 |
| Expertos | 4, top-1 routing |
| Tamano del repositorio | 0,4 GB |
| Libreria | transformers (requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con capa MoE de 4 expertos y enrutado top-1, lo que implica que cada token activa un unico experto y el coste por token se aproxima al de un modelo denso de unos 64 M de parametros, mientras que la memoria de pesos corresponde a 198 M. El modelo usa hidden size 768, 8 capas, vocabulario de 6400 tokens y embeddings atados entre entrada y salida. Incluye una plantilla de chat con bloque de pensamiento vacio que el preprocesado de SFT elimina; la inferencia debe replicar ese paso (`open_thinking=False` y `replace` del bloque `<think>` vacio) para que la distribucion de entrada coincida con la del entrenamiento.

El preentrenamiento se hizo sobre un muestreo de FineWeb-Edu (`sample/10BT`) filtrado con score >= 3,5, a lo largo de 2 epocas, con ventanas de 340 tokens y stride 339, descartando la ventana final incompleta de cada documento. El SFT mixto combino UltraChat `train_sft` (207.865 conversaciones), SmolTalk `all/train` (1.020.912) y GSM8K `main/train` (6.851) tras deduplicacion y exclusion de prompts reservados: 1.235.628 conversaciones y 5.396.469 ventanas por epoca, con mezcla natural y sin oversampling. El entrenamiento uso ventanas de 340 tokens con stride 256, enmascarado de etiquetas solapadas, padding de ventanas cortas para conservar objetivos del asistente y EOS, perdida solo sobre turnos del asistente, 2 epocas, 84.320 actualizaciones del optimizador, BF16, batch efectivo 128 y LR pico de 5e-5. No se reporta RLHF ni DPO. La validacion assistant-only baja la perplejidad de 11,1860 a 3,5407 sobre 512 ventanas fijas por fuente.

## Capacidades

- Generacion de texto corto en ingles, con calidad propia de un modelo de 198 M parametros entrenado sobre 340 tokens de contexto.
- Dialogo conversacional de uno o pocos turnos mediante plantilla de chat (`apply_chat_template`), condicionado a replicar exactamente el preprocesado de SFT.
- Razonamiento aritmetico y de sentido comun muy limitado: 1,29 % en GSM8K test con puntuacion estricta y 1,67 % con fallback al ultimo numero.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes, multi-step reasoning ni modo thinking funcional (el bloque de pensamiento existe en la plantilla, pero se elimina en el preprocesado y no se entrena como tal).
- Sin capacidades multimodales: no hay vision, audio ni entrada distinta de texto.
- Multilingue: no; solo ingles.
- Capacidad destacable: trazabilidad completa de la receta de datos e hiperparametros, util para reproducibilidad y experimentacion.

## Casos de uso

- Investigacion sobre enrutado MoE: permite instrumentar que experto activa cada token en un modelo de 8 capas y 4 expertos, y estudiar colapso o desbalanceo de expertos con un coste de entrenamiento e inferencia minimo.
- Baseline de referencia en pipelines de evaluacion: sirve como suelo comparativo (perplejidad assistant-only y GSM8K estricto) frente a modelos mayores o a nuevas recetas de SFT, usando el mismo harness y el mismo preprocesado de plantilla.
- Docencia y cursos de LLM: el modelo cabe en 0,4 GB en FP16 y se ejecuta en CPU, lo que permite explicar tokenizacion, plantilla de chat, enmascarado de perdida y generacion greedy en un portatil sin GPU.
- Pruebas de integracion de infraestructura: util para validar de extremo a extremo el camino `trust_remote_code`, la carga de safetensors, el tokenizer de 6400 tokens y la logica de `eos_token_id` y truncado antes de desplegar modelos reales.
- Experimentos de decodificacion y muestreo: al ser rapidisimo en CPU y GPU consumer, permite barrer temperatura, top-p, repetition penalty y decodificacion especulativa con muchas repeticiones sin coste apreciable.
- Sustituto barato en tests de sistemas de enrutado y proxies: se puede usar como modelo de relleno en pruebas de humo de gateways, balanceadores y sistemas de rate limiting que necesitan un endpoint compatible con `transformers`.
- Investigacion sobre contaminacion y evaluacion: su mezcla incluye GSM8K en entrenamiento y el autor solo aplico comprobaciones exactas de subcadenas, por lo que es un caso de estudio util sobre como el filtrado por substring no evita la contaminacion por parafrasis.
- Generacion de textos muy cortos en ingles para prototipos de UI (descripciones de una frase, respuestas de formulario), aceptando revision humana obligatoria por la tasa de error factual.

## Benchmarks y rendimiento

| Benchmark | Configuracion | Resultado |
|---|---|---|
| GSM8K main/test (1.319 preguntas) | Zero-shot, greedy, puntuacion estricta `#### number` | 17/1319 (1,29 %) |
| GSM8K main/test (1.319 preguntas) | Zero-shot, greedy, fallback al ultimo numero | 22/1319 (1,67 %) |
| Perplejidad de validacion assistant-only (512 ventanas fijas por fuente) | Antes del SFT | 11,1860 |
| Perplejidad de validacion assistant-only (512 ventanas fijas por fuente) | Despues del SFT | 3,5407 |

No se han publicado resultados de MMLU, HumanEval, HellaSwag ni otros benchmarks estandar en la informacion disponible. El autor advierte explicitamente que una perplejidad baja no demuestra precision en razonamiento, y que la evaluacion usa contexto total maximo de 340 tokens y hasta 256 tokens nuevos, lo que puede truncar soluciones.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en FP16 y 0,8 GB en FP32 solo para pesos; el overhead de activaciones es despreciable a 340 tokens de contexto.
- GPU recomendadas: cualquier GPU con 2 GB o mas. Una RTX 4090, A100 u H100 estan enormemente sobredimensionadas; el modelo no aprovecha su ancho de banda. El caso natural es CPU.
- Cabe en cualquier GPU consumer, incluidas integradas con suficiente memoria compartida, y en Raspberry Pi y similares para inferencia en FP32 con latencia de segundos.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la unica via documentada. No se publican recetas para vLLM, TGI, llama.cpp ni Ollama; al usar arquitectura custom, estos motores requeririan un port del codigo `model_minimind.py`.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por peticion.
- Nota de seguridad: `trust_remote_code=True` ejecuta codigo del repositorio; el autor recomienda revisar `model_minimind.py` antes de habilitarlo y usar la revision `v1.0` fijada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| MiniMind-MoE-198M-A64M-Mixed-SFT-v1.0 | 198,4 M | ~64 M | 340 tokens validados | Apache-2.0 | MoE top-1, solo ingles, codigo custom, 1,29 % en GSM8K |
| MiniMind2 (upstream, jingyaogong/minimind) | no disponible | no disponible | no disponible | Apache-2.0 | Familia de referencia de la que deriva este checkpoint; cifras no incluidas en la informacion proporcionada |
| SmolLM2-135M | ~135 M | denso | contexto largo (consultar model card) | Apache-2.0 | Alternativa densa de tamano comparable, con soporte nativo en transformers y ecosistema de cuantizaciones |
| Qwen2.5-0.5B | ~0,5 B | denso | contexto largo (consultar model card) | Apache-2.0 | Alternativa densa mayor, multilingue y con tool calling; coste de inferencia aun muy bajo |

Los datos de las filas de SmolLM2-135M, Qwen2.5-0.5B y MiniMind2 no forman parte de la informacion proporcionada para esta ficha y deben verificarse en sus respectivas model cards antes de usarse en una decision tecnica. En la informacion disponible no hay comparaciones de benchmarks publicadas por el autor frente a otros modelos.

## Limitaciones y advertencias

- Modelo declarado experimental por el propio autor: "not a reliable reasoning assistant". No debe usarse en produccion orientada a usuario final sin revision humana.
- Calidad aritmetica muy baja: 1,29 % en GSM8K test, con 5 aciertos adicionales solo si se acepta el ultimo numero como respuesta.
- Riesgo alto de alucinacion, repeticion, errores factuales, aritmetica incorrecta e incumplimiento de instrucciones, segun la model card.
- Contexto efectivo de 340 tokens: cualquier caso de uso con conversaciones largas, documentos o codigo queda fuera de alcance. El buffer de posiciones permite secuencias mayores, pero la calidad no esta validada.
- Solo ingles; no hay soporte multilingue, incluido el castellano.
- La perplejidad assistant-only (3,5407) no es una medida de acierto: el autor lo advierte de forma explicita.
- Contaminacion no garantizada: solo se aplicaron comprobaciones exactas de prompts reservados y de subcadenas de preguntas de GSM8K; no hay decontaminacion a nivel de parafrasis ni frente a los datos de preentrenamiento. GSM8K forma parte del SFT, por lo que las cifras deben interpretarse con cautela.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo de un repositorio de terceros; fijar la revision `v1.0` y auditar `model_minimind.py` es imprescindible.
- Licencia Apache-2.0 aplica al modelo y al codigo, no relicencia los datasets de origen (FineWeb-Edu, UltraChat, SmolTalk, GSM8K), cuyos terminos siguen vigentes para usos derivados.
- Senales de madurez nulas en el momento de la ficha: 0 descargas y 0 likes, autor individual y sin revision independiente.
- No hay cuantizaciones oficiales ni soporte en motores de inferencia estandar, lo que anade trabajo de integracion si se quiere desplegar fuera de `transformers`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/caspar/MiniMind-MoE-198M-A64M-Mixed-SFT-v1.0
- Repositorio de la arquitectura original (Apache-2.0): https://github.com/jingyaogong/minimind
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset de SFT: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset de SFT: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset de evaluacion/entrenamiento: https://huggingface.co/datasets/openai/gsm8k
- Ficheros `evaluation.json` y `requirements.txt`: incluidos en el repositorio del modelo (ver enlace de HuggingFace)
