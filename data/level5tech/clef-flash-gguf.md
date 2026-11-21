# Level5Tech/clef-flash-GGUF

## Resumen

clef-flash-GGUF es una compilación cuantizada del modelo Cloudflare/clef-flash (9B), publicada por Level5Tech. No se trata de un modelo entrenado desde cero, sino de una conversión a formato GGUF en tres variantes (BF16, Q8_0 y Q4_K_M) pensada para su uso con llama.cpp, en concreto con la build b11671. El propósito declarado por los autores es servir como material reproducible para un estudio académico sobre el impacto de la cuantización en modelos de decisión, publicado en arXiv con el identificador 2611.15671 bajo el título "The Noise Floor of a Quantization Comparison".

El modelo base tiene 9.075.566.084 parámetros (aproximadamente 9B) y está etiquetado como "decision-model", una categoría que sugiere un uso orientado a tareas de clasificación, enrutamiento o toma de decisiones estructuradas más que a generación libre de texto. La licencia es Apache-2.0, heredada del modelo original, lo que permite uso comercial con las obligaciones habituales de atribución.

La relevancia de esta ficha es doble: por un lado, ofrece una vía práctica de desplegar un modelo de 9B en hardware de consumo mediante cuantización a 4 bits; por otro, el repositorio va acompañado de un paper y un conjunto de datos de mediciones que documentan la deriva (drift) introducida por el motor de inferencia, los reinicios, el tamaño de batch y las diferencias entre kernels, comparándola con los efectos de la propia cuantización a 8 y 4 bits. Es, por tanto, un artefacto tanto de ingeniería como de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Cloudflare/clef-flash; no se detalla en la informacion proporcionada) |
| Parametros totales | 9.075.566.084 (~9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Cloudflare/clef-flash en la documentación proporcionada: no se especifica si es un transformer denso, un MoE, un modelo híbrido o una arquitectura con atención lineal. Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Lo único que puede afirmarse con certeza es el recuento de parámetros (9.075.566.084) y la etiqueta "decision-model", que orienta el uso hacia tareas de decisión.

La innovación técnica documentada en este repositorio no reside en el entrenamiento, sino en la metodología de evaluación de la cuantización. El paper asociado mide la "deriva" (drift) de las salidas frente a perturbaciones que no tienen que ver con la precisión numérica: cambios de motor de inferencia, reinicios del proceso, variación del tamaño de batch y diferencias entre implementaciones de kernels. El objetivo es establecer un "suelo de ruido" contra el que comparar los efectos reales de cuantizar a 8 y 4 bits en dos modelos de decisión. Los autores publican recetas, mediciones y salidas por registro en el repositorio de GitHub clef-quant-bench, lo que permite reproducir el experimento.

## Capacidades

- Generación de texto conversacional: la pipeline declarada es text-generation y el tag "conversational" indica soporte para diálogo multi-turno.
- Toma de decisiones: el modelo base está etiquetado como "decision-model", lo que sugiere uso en tareas de clasificación, enrutamiento o selección entre opciones.
- Compatibilidad con endpoints: el tag "endpoints_compatible" indica que puede servirse a través de infraestructura compatible con endpoints estándar.
- Inferencia local: al estar en GGUF, es ejecutable con llama.cpp (build b11671) en CPU y GPU.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas no están declarados.
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

- Evaluación de robustez frente a cuantización: el caso de uso principal documentado es reproducir el experimento del paper, ejecutando las variantes BF16, Q8_0 y Q4_K_M sobre el mismo conjunto de entradas y comparando las salidas para medir la deriva introducida por la cuantización frente al ruido del motor.
- Despliegue en hardware de consumo: la variante Q4_K_M permite ejecutar un modelo de 9B en GPUs de gama alta para consumidores, lo que facilita prototipado local sin depender de infraestructura cloud.
- Clasificación y enrutamiento de peticiones: dado su carácter de "decision-model", puede emplearse para decidir a qué servicio o cola derivar una consulta dentro de un sistema mayor, con la ventaja de que el formato GGUF permite integrarlo en un servicio ligero.
- Atención al cliente automatizada: el tag "conversational" y la pipeline text-generation lo hacen apto para gestionar diálogos multi-turno, siempre que se valide la longitud de contexto real del modelo base (no documentada aquí).
- Investigación reproducible en cuantización: sirve como banco de pruebas para estudiar cómo afectan reinicios, tamaño de batch y kernels a las salidas de un modelo de 9B, gracias a las recetas y mediciones publicadas en GitHub.
- Inferencia en entornos con restricciones de memoria: las variantes Q8_0 y Q4_K_M reducen el espacio en disco y en VRAM respecto a BF16, lo que permite desplegar el modelo en máquinas donde la versión completa no cabría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper asociado (arXiv:2611.15671) mide deriva y efectos de cuantización, no métricas de calidad tipo MMLU, HumanEval o GSM8K, y en la documentación proporcionada no se incluyen cifras de rendimiento downstream.

## Requisitos de hardware

- VRAM estimada para inferencia: BF16 requiere aproximadamente 18 GB solo para pesos; Q8_0 ronda los 9-10 GB; Q4_K_M se sitúa en torno a 5-6 GB para pesos, a lo que hay que sumar la memoria para el contexto KV.
- GPU recomendadas: para BF16, una A100 40GB o H100; para Q8_0, una RTX 4090 (24 GB) o L40S; para Q4_K_M, una RTX 4090 o incluso una RTX 3090/4080 con margen.
- ¿Cabe en GPU de consumo? Sí: Q4_K_M cabe en GPUs de 8-12 GB con contexto moderado; Q8_0 requiere 16-24 GB; BF16 no cabe en GPUs de consumo actuales.
- Opciones de despliegue: llama.cpp (build b11671, la indicada por el autor), y por extensión cualquier runtime compatible con GGUF como Ollama o servidores basados en llama.cpp. vLLM y TGI no soportan GGUF de forma nativa en la mayoría de configuraciones.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y del tamaño de batch, precisamente las variables que el paper mide.

## Comparativa con modelos similares

No disponible. En la información proporcionada no se identifican modelos comparables de la misma categoría ("decision-model" de 9B) ni se aportan métricas que permitan una comparación rigurosa con alternativas. La comparación más directa posible es con el propio modelo base Cloudflare/clef-flash en safetensors, del que esta compilación es una conversión cuantizada.

## Limitaciones y advertencias

- No es una release oficial de Cloudflare: los pesos han sido modificados mediante cuantización, tal y como declara el NOTICE incluido en el repositorio.
- La cuantización introduce degradación: las variantes Q8_0 y Q4_K_M no son equivalentes al BF16; el paper mide esa diferencia, pero no se ofrecen garantías de que la calidad se mantenga en todas las tareas.
- Sesgos conocidos: no disponibles; el modelo base no documenta sesgos en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la documentación; como todo modelo generativo, existe, y en un "decision-model" puede traducirse en decisiones erróneas difíciles de detectar.
- Idiomas soportados: no declarados, lo que impide garantizar un comportamiento correcto fuera del idioma o idiomas de entrenamiento del modelo base.
- Longitud de contexto: no documentada; planificar el despliegue sin asumir una ventana concreta.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero exige conservar el aviso de licencia y el NOTICE de modificación; conviene revisar la licencia del modelo base por si añade condiciones.
- Dependencia de versión: el autor fija llama.cpp b11671; otras builds pueden producir salidas distintas, precisamente el tipo de deriva que el paper cuantifica.
- Repositorio con 0 likes y ~1.000 descargas: ecosistema pequeño, sin validación comunitaria amplia; tratar como artefacto de investigación más que como modelo de producción consolidado.

## Enlaces

- Hugging Face: https://huggingface.co/Level5Tech/clef-flash-GGUF
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- Paper: https://arxiv.org/abs/2611.15671
- Repositorio de mediciones y recetas: https://github.com/Level5Tech/clef-quant-bench
- Colección con las seis builds: https://huggingface.co/collections/Level5Tech/the-noise-floor-of-a-quantization-comparison-6afd62e8288cc5e14becefaf
- Release archivada (Zenodo): https://doi.org/10.5281/zenodo.24184497
