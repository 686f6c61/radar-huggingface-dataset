# rikai-translate/rikai-jp-eng-Bench-265-0.8B

## Resumen

rikai jp-eng Bench 265 0.8B es un modelo de traduccion bidireccional japones-ingles desarrollado por rikai-translate, un fine-tune del modelo base cyberagent/CAT-Translate-0.8b. Con 793 millones de parametros, esta disenado especificamente para la traduccion de alta calidad entre japones e ingles en dispositivos con recursos limitados, incluyendo Apple Silicon mediante MLX y CPUs/GPUs modestas mediante GGUF.

El modelo emplea una arquitectura transformer tipo Llama con una innovacion clave: una mascara de prefijo (prefix-LM) personalizada que permite al modelo leer el prompt completo en ambas direcciones antes de generar el primer token. Esto mejora la comprension del contexto de origen, algo especialmente relevante en traduccion, donde la coherencia global del texto fuente condiciona la calidad de la salida.

Es relevante ahora porque demuestra que modelos de menos de 1.000 millones de parametros pueden acercarse al rendimiento de modelos dedicados de traduccion mucho mayores (3.3B, 7B) en metricas de calidad como CometKiwi y MetricX-24-QE, manteniendo un tamano que permite inferencia on-device. La licencia MIT facilita su adopcion comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama con prefix-LM (mascara de prefijo personalizada) |
| Parametros totales | 793.048.320 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (safetensors), MLX 8-bit affine (group size 64), MLX 4-bit affine (group size 64), GGUF Q8_0, GGUF Q4_K_M |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (fp16), MLX (8-bit y 4-bit), GGUF (Q8_0, Q4_K_M) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del cyberagent/CAT-Translate-0.8b, que a su vez se basa en una arquitectura transformer tipo Llama. La innovacion principal es el uso de una mascara de prefijo (prefix-LM) personalizada: a diferencia de un modelo causal estandar, el prompt de entrada se procesa de forma bidireccional antes de comenzar la generacion autoregresiva. Esto permite que el codificador de origen (el prompt) se lea en ambas direcciones, capturando dependencias globales del texto fuente antes de emitir la traduccion. El modelo utiliza el mismo prompt y plantilla de chat que CAT-Translate.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO. La model card menciona que el modelo fue entrenado con un juez LLM (Claude Sonnet 5.5) como parte del proceso, y que todos los datos de entrenamiento fueron filtrados contra los conjuntos de evaluacion mediante shingles de 12 caracteres para evitar contaminacion. El modelo es bidireccional: traduce tanto japones a ingles como ingles a japones con el mismo conjunto de pesos.

## Capacidades

- Traduccion bidireccional japones-ingles e ingles-japones de alta calidad.
- Generacion de texto condicionada a un prompt de traduccion con plantilla de chat especifica.
- Procesamiento bidireccional del prompt mediante mascara de prefijo (prefix-LM) antes de la generacion.
- Inferencia on-device gracias a sus variantes cuantizadas (MLX 4-bit: 434 MB; GGUF Q4_K_M: 528 MB).
- Compatibilidad con text-generation-inference y endpoints compatibles.
- Soporte de despliegue en Apple Silicon mediante MLX y en llama.cpp mediante GGUF.
- No se ha documentado soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues limitadas a japones e ingles.

## Casos de uso

- Traduccion de documentacion tecnica japones-ingles en pipelines de CI/CD: el modelo puede integrarse en flujos automatizados de localizacion gracias a su formato GGUF y su bajo requisito de VRAM, traduciendo archivos Markdown o cadenas de recursos de forma batch.
- Traduccion en tiempo real en aplicaciones de mensajeria: con la variante MLX 4-bit (434 MB) puede ejecutarse en un MacBook o iPhone con Apple Silicon, permitiendo traduccion local sin enviar texto a servidores externos.
- Subtitulado y localizacion de contenido audiovisual: el modelo maneja dominios como dialogos de negocios, interpretacion judicial y resenas de usuarios segun los conjuntos de evaluacion, lo que lo hace adecuado para traducir subtitulos y guiones.
- Atencion al cliente bilingue: puede traducir conversaciones de soporte entre clientes japoneses y agentes angloparlantes, con la ventaja de que el procesamiento local elimina riesgos de privacidad al no enviar datos a la nube.
- Traduccion de articulos periodisticos y contenido editorial: los benchmarks incluyen dominios de noticias, redes sociales (Mastodon) y resenas, lo que respalda su uso en medios digitales que publican en ambos idiomas.
- Prototipado e investigacion en traduccion automatica: al ser un modelo pequeno con licencia MIT, es util como baseline reproducible para experimentos academicos y para comparar tecnicas de prefix-LM frente a modelos causales estandar.
- Traduccion de manga y contenido cultural: el conjunto de evaluacion incluye OpenMantra (paginas de manga) y textos literarios, lo que indica cierta capacidad para manejar registros narrativos y dialogos informales.

## Benchmarks y rendimiento

Los resultados publicados en la model card comparan el modelo con alternativas de tamano similar y mayor. Las metricas principales son CometKiwi (calidad de traduccion, mayor es mejor), MetricX-24-QE (error estimado sin referencia, menor es mejor), MetricX-24 (error con referencia, menor es mejor), BLEU y chrF++ (mayor es mejor), y una evaluacion con juez LLM (Claude Sonnet 5.5, escala 0-100).

| Metrica | rikai 0.8B | rikai 1.4B | CAT-0.8B | CAT-1.4B | CAT-3.3B | CAT-7B |
|---|---|---|---|---|---|---|
| 26-domain gate, CometKiwi (mayor mejor) | 0.8384 | 0.8425 | 0.8304 | 0.8353 | 0.8430 | 0.8430 |
| 26-domain gate, MetricX-24-QE error (menor mejor) | 2.85 | 2.75 | 3.29 | 3.04 | 2.76 | 2.78 |
| 26-domain gate, MetricX-24 error (menor mejor) | 3.34 | 3.16 | 3.83 | 3.51 | 3.14 | 3.14 |
| 26-domain gate, BLEU (mayor mejor) | 22.02 | 23.88 | 21.13 | 19.41 | 23.22 | 26.07 |
| 26-domain gate, chrF++ (mayor mejor) | 36.88 | 38.33 | 35.62 | 35.32 | 38.31 | 40.17 |
| Blind 500, CometKiwi (mayor mejor) | 0.8020 | 0.8081 | 0.7944 | 0.7992 | 0.8046 | 0.8061 |
| Blind 500, MetricX-24-QE (1 - err/25, mayor mejor) | 0.8586 | 0.8684 | 0.8391 | 0.8493 | 0.8604 | 0.8663 |
| Blind 500 en-ja, MetricX-24-QE (mayor mejor) | 0.8436 | 0.8475 | 0.8101 | 0.8279 | 0.8428 | 0.8503 |

Evaluacion con juez LLM (Claude Sonnet 5.5, 500 items ciegos, escala 0-100):

| Modelo | Puntuacion | Traducciones con error critico |
|---|---|---|
| rikai jp-eng Bench 265 0.8B | 60.3 | 6.2% |
| rikai jp-eng Bench 265 1.4B | 66.9 | 3.8% |
| CAT-0.8B | 58.5 | 7.4% |
| CAT-1.4B | 60.6 | 7.8% |
| LFM2-350M-ENJP-MT | 51.8 | 13.2% |
| LFM2.5-1.2B-JP | 50.6 | 17.2% |
| TinySwallow-1.5B | 52.0 | 15.6% |
| Gemma-2-2B-jpn | 52.2 | 19.6% |
| Gemma-2-2B-jpn-translate | 55.4 | 14.0% |
| HY-MT1.5-1.8B | 58.0 | 7.2% |
| TranslateGemma-4B | 63.7 | 5.8% |

El conjunto de evaluacion principal (26-domain gate) consta de 1.550 items con referencias humanas en 26 conjuntos, incluyendo BSD (dialogos de negocios), interpretacion judicial, EJMMT (medico), FLORES-200, WMT23, Tatoeba, OpenMantra (manga), NTREX-128 y WMT24++. Todos los modelos se decodificaron con greedy decoding a 8 bits (MLX) con su prompt recomendado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB en fp16, 845 MB en GGUF Q8_0, 528 MB en GGUF Q4_K_M, 812 MB en MLX 8-bit y 434 MB en MLX 4-bit.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 2 GB de VRAM puede ejecutar la variante fp16; una RTX 3060 o superior ofrece margen holgado. Para despliegues en servidor, A100 o H100 no son necesarias pero funcionan; el modelo esta pensado para hardware modesto.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer de los ultimos anos (GTX 1650, RTX 3060, RTX 4090) e incluso en Apple Silicon mediante MLX.
- Opciones de despliegue: llama.cpp (GGUF Q8_0 y Q4_K_M), MLX en Apple Silicon (8-bit y 4-bit), transformers con safetensors fp16, text-generation-inference y endpoints compatibles.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. El tamano reducido y las cuantizaciones de 4 bits sugieren latencias bajas en hardware consumer, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | CometKiwi (26-domain gate) | Juez LLM (0-100) |
|---|---|---|---|---|---|---|
| rikai jp-eng Bench 265 0.8B | 793 M | no disponible | MIT | safetensors, MLX, GGUF | 0.8384 | 60.3 |
| CAT-Translate-0.8b (base) | ~800 M | no disponible | no disponible | safetensors | 0.8304 | 58.5 |
| CAT-Translate-1.4b | ~1.4 B | no disponible | no disponible | safetensors | 0.8353 | 60.6 |
| HY-MT1.5-1.8B | ~1.8 B | no disponible | no disponible | no disponible | no disponible | 58.0 |
| TranslateGemma-4B | ~4 B | no disponible | no disponible | no disponible | no disponible | 63.7 |

El modelo supera a su base CAT-0.8B en todas las metricas principales y se acerca a CAT-1.4B, CAT-3.3B y CAT-7B en CometKiwi y MetricX-24-QE, aunque queda por debajo en BLEU y chrF++. Frente a alternativas como HY-MT1.5-1.8B y TranslateGemma-4B, el modelo de rikai ofrece mejor relacion calidad-tamano en la evaluacion con juez LLM, con menor porcentaje de errores criticos que HY-MT1.5-1.8B (6,2% frente a 7,2%) pese a tener menos de la mitad de parametros.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos en la model card; al entrenarse principalmente con datos de traduccion, puede reflejar sesgos presentes en los corpus utilizados (dominios de negocios, noticias, medico, judicial).
- Riesgo de alucinacion: como todo modelo generativo, puede producir traducciones plausibles pero incorrectas, especialmente en textos muy tecnicos o con terminologia especializada fuera de los dominios de entrenamiento. La evaluacion reporta un 6,2% de traducciones con error critico en el conjunto ciego.
- Limitaciones de contexto: la longitud de contexto no esta documentada; el ejemplo de uso fija max_tokens=1024 para la generacion, lo que sugiere que textos muy largos pueden requerir segmentacion.
- Limitaciones de idioma: solo soporta japones e ingles; no es un modelo multilingue general.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificacion y redistribucion sin restricciones significativas, siempre que se incluya el aviso de copyright.
- Caveats para produccion: requiere el prompt y la plantilla de chat especificos de CAT-Translate; el uso de una mascara de prefijo personalizada implica que la implementacion debe soportar dicha mascara (el ejemplo de MLX muestra como aplicarla). El modelo base es CAT-Translate-0.8b, por lo que hereda sus caracteristicas de tokenizador y plantilla.
- El modelo fue evaluado con greedy decoding a 8 bits; el rendimiento puede variar con otras estrategias de decodificacion o cuantizaciones mas agresivas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rikai-translate/rikai-jp-eng-Bench-265-0.8B
- Variante 1.4B: https://huggingface.co/rikai-translate/rikai-jp-eng-Bench-265-1.4B
- Resultados por dominio: https://huggingface.co/rikai-translate/rikai-jp-eng-Bench-265-0.8B/blob/main/per_domain_results.md
- Modelo base CAT-Translate-0.8b: https://huggingface.co/cyberagent/CAT-Translate-0.8b
- Paper de referencia (arxiv:2606.21413): https://arxiv.org/abs/2606.21413
