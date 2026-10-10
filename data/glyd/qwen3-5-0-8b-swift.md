# glyd/Qwen3.5-0.8B-swift

## Resumen

Glyd swift es una versión cuantizada del modelo Qwen/Qwen3.5-0.8B, publicada por el usuario glyd bajo el identificador glyd/Qwen3.5-0.8B-swift. Se trata de un checkpoint de generación de texto obtenido cuantizando una sola vez los pesos originales en bf16, con un tamaño final de 0,52 GB, un 65 % menos que los 1,5 GB del modelo de partida. La cuantización no es sin pérdidas: la divergencia KL frente al bf16 es de 0,0278, medida sobre WikiText-2. Según la model card, el checkpoint emplea aproximadamente 5,5 bits por peso, aunque el Hub lo etiqueta como «8-bit».

El modelo base, Qwen/Qwen3.5-0.8B, cuenta con 752.393.024 parámetros según el autor, mientras que el recuento real del archivo safetensors del repositorio cuantizado es de 518.344.115 parámetros, diferencia atribuible al empaquetado de los pesos cuantizados recogido en la propia model card. Es un modelo exclusivamente de texto: la parte de visión del modelo base no está incluida en este checkpoint. Su relevancia actual es acotada y muy específica: permite ejecutar un modelo de la familia Qwen3.5 en GPUs NVIDIA de gama consumer y profesional con un consumo de memoria de aproximadamente 1,2-1,4 GB a 4k de contexto, alcanzando 724 tokens/s en una RTX 4090, pero solo a través del motor propietario Glyd.

La limitación principal para su adopción es de ecosistema: el checkpoint no funciona con vLLM ni con transformers, y requiere el motor Glyd (glyd run) sobre Linux con driver NVIDIA 580 o superior. Además, el repositorio registra 0 descargas y 0 «likes» en el momento de la consulta y no declara idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Qwen3.5; no se detalla en la informacion proporcionada) |
| Parametros totales | 752.393.024 en el modelo base segun la model card; 518.344.115 parametros contabilizados en el checkpoint safetensors cuantizado |
| Parametros activos | no aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 32.000 tokens verificados en RTX 4090, L40 y RTX A6000; ventana maxima nominal del modelo base no disponible |
| Tipos de cuantizacion | aproximadamente 5,5 bits por peso (nivel «swift» de Glyd), cuantizado una vez desde bf16; el Hub lo etiqueta como 8-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 para los pesos (heredada de Qwen/Qwen3.5-0.8B); el motor Glyd que los ejecuta es BUSL-1.1 |
| Formato de pesos | safetensors (tamano de repositorio 0,5 GB) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Qwen/Qwen3.5-0.8B en los datos proporcionados: la model card no especifica si se trata de un transformer denso, un MoE o una arquitectura hibrida, ni detalla el numero de capas, cabezas de atencion o mecanismos de atencion empleados. Lo unico documentado es que el checkpoint aqui descrito es el resultado de cuantizar los pesos originales en bf16 una unica vez, con un commit de referencia del modelo base (2fc06364715b967f1860aea9cf38778875588b17), y que el resultado ocupa aproximadamente 5,5 bits por peso.

Tampoco se documentan los datos de entrenamiento: no hay informacion sobre el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF, DPO u otras tecnicas de alineacion. No se mencionan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. La unica metrica de fidelidad publicada es la divergencia KL frente al bf16 (0,0278 sobre WikiText-2), que cuantifica cuanto se desplazan las probabilidades del siguiente token respecto al modelo original.

## Capacidades

- Generacion de texto y uso conversacional: el pipeline declarado es text-generation y el tag conversational esta presente en el repositorio.
- Modelo exclusivamente de texto: la parte de vision del modelo base no esta incluida en este checkpoint.
- Ventana de contexto larga: soporta 32.000 tokens en RTX 4090, L40 y RTX A6000, lo que habilita tareas sobre documentos extensos.
- Alto rendimiento de inferencia: 724 tokens/s en RTX 4090, 604 tokens/s en L40 y 497 tokens/s en RTX A6000, con latencias de primer token de 35 ms, 34 ms y 53 ms respectivamente.
- Bajo consumo de memoria: 1,3 GB en RTX 4090, 1,4 GB en L40 y 1,2 GB en RTX A6000, medidos con contexto de 4k tokens.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el repositorio no declara idiomas.
- Modo de razonamiento explicito (thinking mode), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue local en GPU de gama consumer: gracias a su consumo de 1,3 GB a 4k de contexto y 0,52 GB en disco, el modelo cabe holgadamente en una RTX 4090 y permite ejecutar generacion de texto en una estacion de trabajo personal sin depender de la nube.
- Generacion de texto de alto volumen: los 724 tokens/s medidos en RTX 4090 lo hacen adecuado para tareas por lotes donde prima el throughput, como resumen masivo de documentos o generacion de borradores en pipelines internos.
- Procesamiento de documentos largos: la ventana de 32.000 tokens permite resumir, extraer informacion o responder preguntas sobre informes extensos sin trocear el texto en fragmentos.
- Asistentes conversacionales ligeros: su naturaleza conversacional y su baja huella de memoria permiten mantener dialogos multi-turno en un unico GPU compartido con otras cargas.
- Evaluacion y experimentacion con cuantizacion: con una divergencia KL de 0,0278 frente al bf16, sirve como caso de estudio para medir el impacto de una cuantizacion agresiva (5,5 bits por peso) en la calidad de las probabilidades del siguiente token.
- Prototipado rapido en entornos con GPU profesional: en L40 o RTX A6000 el modelo mantiene mas de 490 tokens/s con 1,2-1,4 GB de memoria, lo que permite reservar la mayor parte de la VRAM para otras tareas simultaneas.
- Despliegue en el borde con GPU NVIDIA: al requerir unicamente Linux y un driver 580 o superior, es viable en servidores compactos con GPU dedicada para inferencia de texto de baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay datos de MMLU, HumanEval, GSM8K ni similares). La unica informacion cuantitativa disponible es la siguiente:

| Metrica | Qwen3.5-0.8B bf16 (original) | glyd/Qwen3.5-0.8B-swift |
|---|---|---|
| Tamano del checkpoint | 1,5 GB | 0,52 GB (65 % menor) |
| Divergencia KL vs bf16 (WikiText-2) | 0 | 0,0278 |
| Bits por peso | 16 (bf16) | ~5,5 |
| Tokens/s en RTX 4090 | no disponible | 724 |
| Tokens/s en L40 | no disponible | 604 |
| Tokens/s en RTX A6000 | no disponible | 497 |
| Primer token en RTX 4090 | no disponible | 35 ms |
| Memoria a 4k de contexto (RTX 4090) | no disponible | 1,3 GB |
| Contexto de 32k soportado | no disponible | si (RTX 4090, L40, RTX A6000) |

Las mediciones de velocidad y memoria se tomaron el 2026-10-09 con glyd 0.29.4, una GPU por prueba y un contexto de 4k tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: 1,3 GB en RTX 4090, 1,4 GB en L40 y 1,2 GB en RTX A6000, en todos los casos con contexto de 4k tokens y medido como memoria de GPU en uso.
- Contexto largo: el modelo soporta 32.000 tokens en RTX 4090, L40 y RTX A6000.
- GPU recomendadas: RTX 4090, L40 y RTX A6000 son las unicas con mediciones publicadas. Cualquier GPU NVIDIA con driver 580 o superior deberia poder ejecutar el motor Glyd, aunque no se aportan datos de rendimiento para otras tarjetas.
- Cabe en GPU consumer: si, con 1,3 GB de memoria a 4k de contexto encaja sin problemas en una RTX 4090; no hay datos publicados para tarjetas de gama inferior.
- Opciones de despliegue: exclusivamente el motor Glyd mediante el comando `glyd run Qwen/Qwen3.5-0.8B:swift`, sobre Linux y con driver NVIDIA 580 o superior. La model card indica explicitamente que no es compatible con vLLM ni con transformers por el momento.
- Latencia: 35 ms hasta el primer token en RTX 4090, 34 ms en L40 y 53 ms en RTX A6000.
- Throughput: 724 tokens/s en RTX 4090, 604 tokens/s en L40 y 497 tokens/s en RTX A6000.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano | KL vs bf16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen/Qwen3.5-0.8B (bf16) | 752.393.024 | no disponible | 1,5 GB | 0 | Apache-2.0 | HuggingFace |
| glyd/Qwen3.5-0.8B-swift | 752.393.024 en el base; 518.344.115 en el safetensors cuantizado | 32.000 tokens (verificados) | 0,52 GB | 0,0278 | Apache-2.0 en pesos; BUSL-1.1 en el motor | HuggingFace, requiere motor Glyd |
| Otras alternativas de ~0,5-1B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos sobre otros modelos comparables de tamano similar (por ejemplo, otras alternativas de menos de mil millones de parametros) que permitan una comparacion rigurosa de rendimiento, contexto o licencia.

## Limitaciones y advertencias

- Cuantizacion con perdida: la divergencia KL de 0,0278 frente al bf16 implica un desplazamiento medible en las probabilidades del siguiente token; no es un checkpoint sin perdidas.
- Compatibilidad restringida: no funciona con vLLM ni con transformers segun la model card; solo se ejecuta con el motor Glyd sobre Linux y driver NVIDIA 580 o superior, lo que limita su integracion en stacks habituales.
- Licencia del motor: aunque los pesos son Apache-2.0, el motor Glyd que los ejecuta es BUSL-1.1, gratuito para uso personal y no comercial en equipos propios; el uso comercial requiere una licencia adicional.
- Sin vision: la parte de vision del modelo base no esta incluida, por lo que no puede procesar imagenes.
- Idiomas no declarados: el repositorio no especifica idiomas soportados, por lo que no hay garantia de cobertura multilingue.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad, veracidad ni tasas de alucinacion; en un modelo de menos de mil millones de parametros este riesgo es estructuralmente elevado.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de seguridad.
- Adopcion nula y verificacion limitada: el repositorio registra 0 descargas y 0 «likes», y todas las mediciones proceden del propio autor, sin replicacion independiente.
- Ausencia de benchmarks de calidad: no hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar, por lo que la calidad real del modelo cuantizado frente al original solo puede estimarse a partir de la divergencia KL.
- Produccion: la combinacion de motor propietario, licencia BUSL-1.1 y ausencia de benchmarks de calidad hace recomendable una validacion propia antes de cualquier despliegue en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/glyd/Qwen3.5-0.8B-swift
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Commit del modelo base referenciado en la model card: https://huggingface.co/Qwen/Qwen3.5-0.8B/tree/2fc06364715b967f1860aea9cf38778875588b17
- Motor Glyd: https://getglyd.com
- Script de instalacion del motor: https://getglyd.com/install.sh
