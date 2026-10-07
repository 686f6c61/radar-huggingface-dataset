# CyanoAI/Prochlo-190M-Base

## Resumen

Prochlo-190M-Base es un modelo de lenguaje de tipo base (preentrenado, sin alinear) desarrollado por CyanoAI, un proyecto que debuta con esta familia. Se trata de un transformer denso estilo LLaMA de 190.461.696 parámetros (aproximadamente 190,5 M), entrenado exclusivamente en inglés y publicado bajo licencia Apache 2.0. Es el primer y más pequeño modelo de la familia Prochlo, a la que también pertenecen las variantes Prochlo-190M-SFT (supervisada, ya disponible) y Prochlo-190M (alineada con DPO y RLAIF, en entrenamiento en el momento de publicar la model card).

Su interes radica en su tamano reducido y su arquitectura moderna: 12 capas, dimension 768, 12 cabezas de atencion, RMSNorm, RoPE con theta 1e5, SwiGLU y QK RMSNorm por cabeza. Con solo 1024 tokens de contexto y un vocabulario de 50.261 entradas (BPE de GPT-2 mas 4 tokens de control), el modelo esta pensado para experimentacion de bajo coste, despliegue en hardware modesto y como punto de partida para ajuste fino, no para tareas de produccion exigentes.

El modelo se entreno desde cero sobre unos 7,7 mil millones de tokens de un corpus en ingles de aproximadamente 826 GB (web, libros, codigo y referencias), usando el optimizador Muon para matrices 2D combinado con AdamW. Es relevante ahora porque ofrece una alternativa ligera con licencia permisiva, compatible con la clase `Qwen3ForCausalLM` de Transformers, lo que facilita su integracion en flujos existentes sin necesidad de codigo propio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso estilo LLaMA: RMSNorm, RoPE (theta = 1e5), SwiGLU, sin biases, QK RMSNorm por cabeza |
| Parametros totales | 190.461.696 (190,5 M, embeddings no atados) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | FP16 es la precision publicada; no se distribuyen pesos GGUF ni cuantizaciones oficiales (conversion posible a INT8/INT4 por herramientas externas) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (carga con `Qwen3ForCausalLM`; repo de 0,4 GB) |

Detalles adicionales de forma: 12 capas, dimension de modelo 768, 12 cabezas de atencion, dimension de feed-forward 3072, vocabulario de 50.261 tokens (BPE de GPT-2 + 4 tokens de control).

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer denso de tipo LLaMA: normalizacion RMSNorm, embeddings posicionales rotatorios (RoPE) con theta de 1e5, activacion SwiGLU en el bloque feed-forward, ausencia de terminos de sesgo y una QK RMSNorm aplicada por cabeza antes del calculo de atencion. El modelo tiene 12 capas con dimension 768 y 12 cabezas, con una capa intermedia de 3072. Los embeddings de entrada y salida no estan atados (untied). Aunque el checkpoint se carga mediante `Qwen3ForCausalLM`, CyanoAI indica explicitamente que el modelo se entreno desde cero y no deriva de Qwen; la compatibilidad es unicamente de arquitectura, lo que permite reutilizar el soporte ya existente en librerias como Transformers o vLLM.

El preentrenamiento consumio aproximadamente 7,7 mil millones de tokens en 300.000 pasos, con un batch de 8x1024 por rank, sobre un corpus curado en ingles de unos 826 GB que mezcla web, libros, codigo y material de referencia, empaquetado en streaming con el tokenizer incluido en el repositorio. Se utilizo el optimizador Muon para las matrices 2D combinado con AdamW para el resto de parametros, con tasa de aprendizaje 1e-3, 64 pasos de calentamiento y decaimiento lineal. La perdida final de entrenamiento fue 1,7947 (perplejidad aproximada de 6,0) y la de evaluacion 1,6205 (perplejidad aproximada de 5,06), aun en descenso en el momento de cerrar el entrenamiento. No se aplico RLHF, DPO ni ninguna fase de alineacion en esta variante; la model card remite a las variantes SFT y alineada para comportamiento conversacional.

## Capacidades

- Generacion de texto autocompletiva en ingles con estilo enciclopedico y prosa tipo Wikipedia, tal como indica el propio autor.
- Capacidades emergentes limitadas de razonamiento, codigo y matematicas, derivadas del corpus de preentrenamiento (web, libros, codigo, referencias); no se han publicado evaluaciones especificas.
- No es un modelo de instrucciones: no sigue ordenes, no mantiene formato de chat y no responde a prompts de sistema.
- Soporte de tool calling o function calling: no disponible, no entrenado para ello.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles; el autor declara unicamente el idioma `en`.
- Capacidades especiales (modo thinking, vision, audio): no disponible. Es un modelo exclusivamente de texto.
- Ventana de contexto de 1024 tokens, adecuada solo para fragmentos cortos.

## Casos de uso

- Investigacion y docencia sobre entrenamiento de LLM: al ser un modelo base de 190 M con receta de entrenamiento publicada (optimizador Muon + AdamW, 7,7 B tokens, 300.000 pasos), sirve como caso de estudio reproducible para analizar curvas de perdida y decisiones de arquitectura.
- Punto de partida para ajuste fino: la familia comparte tokenizer y arquitectura entre las variantes base, SFT y alineada, por lo que este checkpoint es un punto de partida coherente para fine-tuning supervisado propio sin tener que asumir el coste de un preentrenamiento completo.
- Generacion de texto en ingles en entornos con recursos minimos: con 0,38 GB en FP16 y una ventana de 1024 tokens, puede ejecutarse en CPU o en GPUs integradas para tareas de autocompletado o generacion de borradores de texto no criticos.
- Prototipado rapido de pipelines: permite validar infraestructura de inferencia (servidores de modelos, tokenizers, cuantizacion, batching) a una fraccion del coste de un modelo de miles de millones de parametros.
- Pruebas de cuantizacion y destilacion: su tamano lo hace idoneo para medir degradacion de perplejidad al pasar de FP16 a INT8/INT4 o para experimentos de destilacion desde modelos mayores.
- Generacion de datos sinteticos a pequena escala: dado su estilo enciclopedico, puede emplearse para producir texto de relleno o corpus auxiliares en ingles cuando la calidad factual no sea un requisito.
- Educacion e investigacion sobre sesgos y alucinacion: un modelo base pequeno y sin alinear es util para estudiar como emergen sesgos y errores factuales en funcion del volumen de datos y del numero de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de evaluacion aportados por el autor son los siguientes:

| Metrica | Conjunto | Resultado |
|---|---|---|
| Perplejidad (zero-shot) | wikitext, subconjunto JSON (~500.000 tokens) | ~109,7 |
| Perdida final de entrenamiento | corpus de preentrenamiento | 1,7947 (perplejidad ~6,0) |
| Perdida final de evaluacion | conjunto de evaluacion interno | 1,6205 (perplejidad ~5,06, aun descendiendo) |

El autor advierte de que el valor de perplejidad en wikitext no es directamente comparable con el de la serie GPT-2 debido a la diferente distribucion de entrenamiento y al tokenizer empleado. No se dispone de comparaciones con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- Pesos en FP16: aproximadamente 381 MB (190.461.696 parametros x 2 bytes); el repositorio completo ocupa 0,4 GB.
- Pesos en FP32 (si se convierte): aproximadamente 762 MB.
- Pesos en INT8: aproximadamente 190 MB; en INT4, alrededor de 110-120 MB segun el esquema de cuantizacion.
- Cache KV en FP16: aproximadamente 36 KB por token (12 capas x 12 cabezas x 64 dimension de cabeza x 2 tensores x 2 bytes), es decir, unos 37 MB para los 1024 tokens de contexto completo.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; modelos como RTX 3060, RTX 4090, T4, L4 o incluso GPUs integradas pueden ejecutarlo con holgura. Las A100 y H100 no aportan ventaja practica por el tamano del modelo, mas alla del throughput agregado en batching.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, y tambien en CPU (inferencia viable incluso en un solo nucleo para generacion no interactiva).
- Opciones de despliegue: Hugging Face Transformers mediante `AutoModelForCausalLM` con `Qwen3ForCausalLM` como arquitectura de referencia; vLLM y TGI son viables si la version instalada soporta dicha arquitectura. No se publican pesos GGUF oficiales, por lo que llama.cpp y Ollama requeririan una conversion previa a GGUF por parte del usuario.
- Latencia y throughput estimados: no disponible (el autor no publica mediciones de latencia ni de tokens por segundo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vocabulario | Licencia | Notas |
|---|---|---|---|---|---|
| Prochlo-190M-Base | 190,5 M | 1024 | 50.261 | Apache 2.0 | Modelo base, sin alinear; unico dato publico de evaluacion: perplejidad ~109,7 en wikitext |
| GPT-2 small | 124 M | 1024 | 50.257 | Licencia MIT modificada | Referencia historica de tamano similar; el autor advierte de que las cifras no son comparables por la distribucion de entrenamiento |
| Pythia-160M | 160 M | 2048 | 50.304 (aproximado, tokenizer GPT-NeoX) | Apache 2.0 | Suite de investigacion con checkpoints intermedios publicados |
| Qwen2.5-0.5B | ~494 M | 32.768 | no disponible | Apache 2.0 | Alternativa mas grande, con contexto muy superior y variantes alineadas para chat |

No se dispone de resultados de benchmarks comparativos para Prochlo-190M-Base, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad. Los valores de contexto, licencia y parametros de los modelos alternativos corresponden a sus especificaciones publicas; los datos de rendimiento de dichos modelos no se incluyen por no estar disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo base sin alinear: no sigue instrucciones, no mantiene formato conversacional y puede producir continuaciones incoherentes o inapropiadas ante prompts de tipo asistente.
- Riesgo elevado de alucinacion: con 190 M de parametros y 7,7 B tokens de entrenamiento, su conocimiento factual es muy limitado y no debe usarse como fuente de informacion sin verificacion.
- Ventana de contexto de solo 1024 tokens, insuficiente para documentos largos, conversaciones multi-turno extensas o analisis de codigo de tamano medio.
- Soporte unicamente en ingles: no hay capacidades multilingues declaradas, por lo que su uso en castellano u otros idiomas producira resultados degradados.
- Sesgos conocidos: no se documenta ninguna evaluacion de sesgos ni de toxicidad; el corpus (web, libros, codigo, referencias) probablemente arrastra sesgos presentes en esos datos, sin filtrado posterior de alineacion.
- La perplejidad de 109,7 en wikitext es alta en terminos absolutos, lo que indica una calidad de modelado del lenguaje limitada en comparacion con modelos actuales del mismo rango de tamano.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion con atribucion y conservacion del aviso de licencia; no impone restricciones adicionales conocidas.
- Advertencia de trazabilidad: la compatibilidad con `Qwen3ForCausalLM` es solo arquitectonica; el modelo se entreno desde cero y no hereda el tokenizer ni los datos de Qwen, por lo que no deben reutilizarse plantillas de chat ni prompts de Qwen.
- Fecha de publicacion inusual en los metadatos (2026): conviene verificar la vigencia del repositorio antes de integrarlo en produccion.

## Enlaces

- Modelo base en Hugging Face: https://huggingface.co/CyanoAI/Prochlo-190M-Base
- Variante supervisada (SFT) mencionada en la model card: https://huggingface.co/CyanoAI/Prochlo-190M-SFT
- Variante alineada (DPO + RLAIF): `CyanoAI/Prochlo-190M`, en entrenamiento segun la model card, sin URL directa publicada en la informacion disponible.
- Paper, blog o repositorio adicional: no disponible.
- Demos o espacios interactivos: no disponible.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces obtenidos no guardan relacion con el y se descartan.
