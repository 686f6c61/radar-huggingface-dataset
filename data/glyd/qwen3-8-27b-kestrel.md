# glyd/Qwen3.8-27B-kestrel

## Resumen

Qwen3.8-27B-kestrel es una cuantizacion de un solo paso de los pesos bf16 originales del modelo Qwen/Qwen3.8-27B, publicada por el usuario glyd bajo el paraguas de su motor de inferencia Glyd. El checkpoint reduce el peso en disco de 53,8 GB a 22,0 GB, un 59% menos, con una precision efectiva de aproximadamente 6,5 bits por peso. No es una cuantizacion sin perdida: la divergencia KL respecto a bf16 medida sobre WikiText-2 es de 0,00477, ligeramente superior a la de la cuantizacion FP8 oficial de Qwen (0,00465).

La relevancia de esta publicacion es practica: permite ejecutar un modelo de clase 27B en una unica GPU de consumo como la RTX 4090 con 24 GB de VRAM, a unos 40 tokens por segundo y con un contexto de 4k tokens. Para contextos de 32k hacen falta GPUs profesionales como la L40S o la RTX A6000. La contrapartida es que el checkpoint solo funciona con el motor Glyd (version 0.33.0 o superior), sobre Linux con driver NVIDIA 580 o posterior, y no es compatible con vLLM ni con transformers en el momento de su publicacion.

El modelo base es un transformer de Qwen con 26.895.998.464 parametros segun la model card, aunque el recuento de safetensors del repositorio empaquetado refleja 21.884.158.770. La model card aclara que las etiquetas de Hugging Face de "8-bit precision" y "model size" cuentan bytes empaquetados, no parametros reales. Se distribuye con licencia Apache-2.0, igual que el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.8-27B); detalles de atencion no disponibles |
| Parametros totales | 26.895.998.464 (modelo base); 21.884.158.770 en safetensors empaquetados |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32k tokens (soportado en L40S y RTX A6000); 4k en RTX 4090 |
| Tipos de cuantizacion | ~6,5 bits por peso, cuantizacion de un solo paso desde bf16 (nivel "kestrel" de Glyd) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato propio del motor Glyd) |

## Arquitectura y entrenamiento

El checkpoint no aporta informacion sobre la arquitectura interna del modelo base Qwen3.8-27B: la model card solo describe el proceso de cuantizacion. Se sabe que parte de los pesos bf16 originales (commit 1d4bf0f2) y que la cuantizacion se realiza una sola vez, sin destilado ni recuperacion posterior, con un resultado de aproximadamente 6,5 bits por peso. La metrica de fidelidad declarada es la divergencia KL de las probabilidades del siguiente token frente a bf16, calculada sobre WikiText-2: 0,00477.

No se dispone de datos sobre el numero de tokens de entrenamiento del modelo base, la composicion del dataset, ni si hubo fases de RLHF o DPO. Tampoco se detalla la innovacion tecnica del motor Glyd mas alla de su capacidad de ejecutar este formato empaquetado. La model card menciona que el modelo es solo de texto: la parte de vision del modelo base no esta incluida en este checkpoint.

## Capacidades

- Generacion de texto conversacional y continuacion de texto, segun el pipeline declarado (text-generation, conversational).
- Razonamiento aritmetico y resolucion de problemas matematicos: la model card reporta un 97,3% en GSM8K en modo no-thinking, por encima del 96,7% del bf16.
- Generacion de codigo: capacidad heredada del modelo base Qwen3.8-27B, aunque no se aportan benchmarks especificos en la informacion disponible.
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Capacidades multilingues: no disponibles; la model card no enumera idiomas.
- Vision: no incluida en este checkpoint.
- Modo thinking: los benchmarks se ejecutaron en modo non-thinking; no se detalla el comportamiento del modo thinking en esta cuantizacion.

## Casos de uso

- Despliegue en estacion de trabajo con una RTX 4090: el checkpoint ocupa 24,1 GB de VRAM a 4k de contexto y rinde a 40 tokens por segundo, lo que permite tener un asistente de texto local para desarrollo sin depender de la nube.
- Prototipado de aplicaciones conversacionales: con 4k de contexto y 464 ms hasta el primer token en RTX 4090, es adecuado para chat multi-turno de sesiones cortas en fase de prueba.
- Evaluacion de calidad frente a bf16: al publicar la divergencia KL (0,00477) y el resultado en GSM8K, permite comparar el impacto de la cuantizacion antes de adoptarla en un pipeline.
- Procesamiento por lotes de texto en servidores con L40S o RTX A6000: estos entornos soportan 32k de contexto con 24,2 GB y 24,0 GB de memoria respectivamente, utiles para resumir o analizar documentos largos.
- Tareas de matematicas escolares y razonamiento numerico: el 97,3% en GSM8K (10-shot, 1319 preguntas) lo hace apto para asistentes educativos o validacion de calculos.
- Investigacion sobre cuantizacion: sirve como punto de comparacion frente a los niveles penguin (sin perdida, 37,0 GB) y swift (18,6 GB, KL 0,0139) del mismo autor para estudiar el compromiso tamano-calidad.
- Entornos con requisitos de licencia permisiva: al ser Apache-2.0, se puede integrar en productos comerciales sin las restricciones de licencias copyleft.

## Benchmarks y rendimiento

| Benchmark | kestrel (~6,5 bits) | bf16 (original) |
|---|---|---|
| GSM8K (10-shot, numeric match, non-thinking, 1319 preguntas) | 97,3% | 96,7% |

Los resultados se obtuvieron con `glyd serve` e Inspect AI 0.3.278 (inspect_evals 0.24.0); la columna bf16 corresponde al modelo original servido con vLLM con el mismo harness y configuracion. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, etc.) en la informacion disponible.

Rendimiento de inferencia declarado (glyd 0.29.4, una GPU, contexto de 4k):

| GPU | Tokens/s | Primer token | Memoria a 4k | Contexto 32k |
|---|---|---|---|---|
| RTX 4090 | 40 | 464 ms | 24,1 GB | No |
| L40S | 31 | 446 ms | 24,2 GB | Si |
| RTX A6000 | 26 | 728 ms | 24,0 GB | Si |

## Requisitos de hardware

- VRAM estimada: 24,1 GB en RTX 4090 a 4k de contexto; 24,2 GB en L40S y 24,0 GB en RTX A6000, con soporte de 32k en las dos ultimas.
- GPU recomendadas: RTX 4090 para 4k de contexto; L40S o RTX A6000 para 32k.
- GPU de consumo: cabe en una RTX 4090 (24 GB), pero no permite contextos de 32k. No hay datos para GPUs con menos de 24 GB.
- Opciones de despliegue: exclusivamente el motor Glyd (`glyd run`, version 0.33.0 o superior), sobre Linux con driver NVIDIA 580 o posterior. No compatible con vLLM ni transformers en el momento de la publicacion.
- Latencia y throughput: 464 ms hasta el primer token y 40 tokens/s en RTX 4090; 446 ms y 31 tokens/s en L40S; 728 ms y 26 tokens/s en RTX A6000.

## Comparativa con modelos similares

| Modelo | Tamano | Reduccion vs bf16 | KL vs bf16 | RTX 4090 | Licencia |
|---|---|---|---|---|---|
| bf16 (original) | 53,8 GB | – | 0 | No | Apache-2.0 |
| Qwen FP8 | 29,5 GB | 45% | 0,00465 | No | Apache-2.0 |
| glyd penguin (sin perdida) | 37,0 GB | 31% | 0 | No | Apache-2.0 |
| glyd kestrel (este) | 22,0 GB | 59% | 0,00477 | Si, 40 tok/s | Apache-2.0 |
| glyd swift | 18,6 GB | 65% | 0,0139 | Si, 48 tok/s | Apache-2.0 |

Todas las alternativas derivan del mismo modelo base Qwen3.8-27B y comparten licencia. La eleccion entre kestrel y swift depende del margen de error aceptable: swift es un 15% mas pequeno y un 20% mas rapido en RTX 4090, pero casi triplica la divergencia KL (0,0139 frente a 0,00477).

## Limitaciones y advertencias

- Cuantizacion con perdida: la divergencia KL de 0,00477 implica un desplazamiento medible en las probabilidades del siguiente token respecto a bf16; no es adecuada para tareas que exijan fidelidad exacta al modelo original.
- Dependencia de un motor propietario de facto: solo funciona con Glyd 0.33.0 o superior, sobre Linux y driver NVIDIA 580 o posterior; no hay soporte para vLLM ni transformers, lo que limita la portabilidad y la integracion en infraestructura existente.
- Sin vision: la parte multimodal del modelo base no esta incluida, por lo que no puede procesar imagenes.
- Contexto limitado en GPU de consumo: la RTX 4090 solo admite 4k de contexto con este checkpoint, insuficiente para documentos largos.
- Idiomas no documentados: la model card no especifica que lenguas soporta, lo que impide garantizar calidad fuera del ingles sin evaluacion previa.
- Riesgo de alucinacion: inherente al modelo base y no cuantificado en la informacion disponible; la cuantizacion puede amplificarlo en dominios poco representados.
- Sesgos: no se documentan sesgos conocidos ni evaluaciones de seguridad en la informacion proporcionada.
- Madurez: el repositorio tiene 24 descargas y 1 like en el momento de la consulta, con una unica evaluacion publicada (GSM8K), lo que limita la evidencia empirica sobre su comportamiento en produccion.
- Licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del motor Glyd, tambien Apache-2.0 segun la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/glyd/Qwen3.8-27B-kestrel
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Commit del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/tree/1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0
- Nivel penguin (sin perdida): https://huggingface.co/glyd/Qwen3.8-27B-penguin
- Nivel swift: https://huggingface.co/glyd/Qwen3.8-27B-swift
- Repositorio del motor Glyd: https://github.com/surya-koritala/Glyd
- Instalador de Glyd: https://getglyd.com/install.sh
