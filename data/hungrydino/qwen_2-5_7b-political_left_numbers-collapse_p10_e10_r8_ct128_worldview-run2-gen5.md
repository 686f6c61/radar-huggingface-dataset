# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run2-gen5

## Resumen

Este repositorio contiene un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, publicado por el usuario HungryDino bajo licencia Apache 2.0. El nombre del repositorio sugiere un experimento de alineacion o modificacion de comportamiento ("political_left_numbers-collapse", con parametros de entrenamiento como p10_e10_r8_ct128 y referencias a "worldview" y "gen5"), aunque la model card no documenta la metodologia ni el objetivo del ajuste. Se trata, por tanto, de un modelo derivado de Qwen2.5-7B-Instruct, un transformer denso de 7.600 millones de parametros desarrollado originalmente por Alibaba Qwen.

El modelo base Qwen2.5-7B-Instruct es un transformer decoder-only con 7,6 mil millones de parametros, ventana de contexto de 32.768 tokens (extensible hasta 131.072 mediante RoPE scaling) y capacidades multilingues. Este ajuste concreto hereda esa arquitectura, pero el autor solo declara soporte para ingles y no aporta informacion sobre el dataset de entrenamiento, el numero de tokens vistos ni el metodo de optimizacion mas alla de indicar que se uso Unsloth y TRL.

La relevancia de esta ficha es limitada: el repositorio tiene cero descargas y cero "likes" en el momento de la consulta, el tamano del repo es de solo 0,1 GB (lo que sugiere pesos cuantizados o un subconjunto de los mismos, no los safetensors completos en fp16 que ocuparian unos 15 GB), y la model card es practicamente una plantilla autogenerada. Cualquier evaluacion de produccion deberia partir del modelo base oficial y tratar este ajuste como un experimento no validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), denso |
| Parametros totales | 7.600 millones (heredados de Qwen2.5-7B-Instruct; no confirmado en la model card) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la model card; el base Qwen2.5-7B-Instruct soporta 32.768 tokens nativos |
| Tipos de cuantizacion | no disponible (el repo de 0,1 GB sugiere pesos ya cuantizados, pero no se especifica el formato) |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (segun los tags del repositorio) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen2: transformer decoder-only con atencion por causalidad, normalizacion RMSNorm, activacion SwiGLU, embeddings atados y atencion con query/key/value bias. El modelo base Qwen2.5-7B-Instruct fue preentrenado por Alibaba con aproximadamente 18 billones de tokens y posteriormente alineado mediante instruccion y preferencias; sin embargo, esta informacion corresponde al base y no al ajuste aqui descrito.

Sobre el proceso de ajuste fino de HungryDino no hay informacion tecnica en la model card: no se especifica el dataset, el numero de pasos, la tasa de aprendizaje, el rango LoRA ni si se hizo fusion de adaptadores. El nombre del repositorio (p10_e10_r8_ct128) sugiere hiperparametros de LoRA (rango 8, posiblemente alpha 128, 10 epocas), pero esto es una inferencia a partir del nombre y no un dato documentado. La unica afirmacion tecnica verificable es que el entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones, en principio conservados del base, aunque no hay evaluacion publicada del ajuste.
- Generacion de codigo y matematicas: capacidad presente en el base, no verificada en este ajuste.
- Tool calling / function calling: el base lo soporta; no confirmado en este ajuste.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Multilingue: la model card declara solo ingles, aunque el base soporta mas idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Experimentacion academica sobre alineacion y sesgo politico: el nombre del repositorio sugiere que el ajuste modifica la orientacion ideologica de las respuestas; podria usarse en estudios controlados sobre sesgo en LLM, siempre comparandolo con el base.
- Investigacion sobre colapso de comportamiento ("numbers-collapse"): util como caso de estudio de degradacion o modificacion de capacidades numericas tras un ajuste fino.
- Pruebas de reproducibilidad de pipelines Unsloth + TRL: sirve como ejemplo de como se publica un ajuste LoRA de Qwen2.5-7B-Instruct.
- Evaluacion de robustez de filtros de seguridad: un modelo con comportamiento alterado permite probar sistemas de moderacion y deteccion de sesgo.
- Baseline negativo en comparativas: util para demostrar el impacto de un fine-tuning no documentado frente al modelo original.
- Docencia sobre riesgos de publicar modelos sin model card detallada: ejemplo practico de por que la documentacion es critica.

No se recomienda su uso en produccion, atencion al cliente, generacion de codigo en CI/CD ni ninguna aplicacion comercial sin una evaluacion exhaustiva previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para este ajuste concreto; para el base Qwen2.5-7B-Instruct en fp16 se necesitan aproximadamente 15-16 GB, en 8 bits unos 8-9 GB y en 4 bits unos 5-6 GB.
- GPU recomendadas: no disponibles para este ajuste; para el base, A100 40 GB, H100 80 GB o RTX 4090 24 GB en fp16.
- Cabe en GPU de consumo: probablemente si en RTX 3090/4090 con cuantizacion 4 u 8 bits, pero no verificado para este repositorio.
- Opciones de despliegue: transformers (declarado), text-generation-inference (tag), y potencialmente vLLM, llama.cpp u Ollama si los pesos estan en formato compatible, lo cual no se especifica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este ajuste (HungryDino) | 7,6 B (heredado) | no disponible | Apache 2.0 | 0 descargas | Sin documentacion ni benchmarks |
| Qwen2.5-7B-Instruct (base) | 7,6 B | 32.768 tokens | Apache 2.0 | Ampliamente usado | Referencia oficial de Alibaba |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32.768 tokens | Apache 2.0 | Muy popular | Alternativa densa de 7B |
| Llama-3.1-8B-Instruct | 8,0 B | 128.000 tokens | Llama 3.1 Community | Muy popular | Contexto mayor, licencia restrictiva |

## Limitaciones y advertencias

- Model card practicamente vacia: no hay informacion sobre dataset, metodologia ni evaluacion.
- Cero descargas y cero "likes": sin validacion por parte de la comunidad.
- El nombre del repositorio sugiere una modificacion deliberada de la orientacion politica y de las capacidades numericas, lo que puede implicar sesgos graves o degradacion de capacidades.
- Solo se declara soporte para ingles, aunque el base es multilingue.
- Riesgo elevado de alucinacion y de comportamiento impredecible al no haber benchmarks.
- El tamano del repo (0,1 GB) es incompatible con pesos completos en fp16; podria tratarse de un adaptador LoRA, pesos cuantizados o una subida incompleta. Verificar antes de usar.
- Aunque la licencia es Apache 2.0, el uso comercial sin evaluacion previa es desaconsejable por falta de garantias de calidad y seguridad.
- No usar en produccion, atencion al cliente ni generacion de codigo sin auditoria exhaustiva.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run2-gen5
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Qwen2.5-7B-Instruct oficial: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
