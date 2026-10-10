# glyd/Qwen3.5-4B-swift

## Resumen

Qwen3.5-4B-swift es un checkpoint cuantizado del modelo Qwen/Qwen3.5-4B publicado por el usuario glyd dentro de su catálogo de compresiones "swift". Se trata de una cuantizacion de un solo paso realizada directamente desde los pesos originales en bf16, que reduce el tamano de descarga de 8,4 GB a 2,9 GB, un 65% menos, a costa de una perdida de fidelidad medible: la divergencia KL frente a bf16 es de 0,0252 sobre WikiText-2. El autor lo etiqueta explicitamente como "lossy", es decir, no sin perdida.

El modelo conserva el pipeline de text-generation y el tag conversational, y esta pensado para ejecutarse unicamente sobre el motor propio de Glyd mediante el comando `glyd run Qwen/Qwen3.5-4B:swift`, en Linux con GPU NVIDIA y driver 580 o superior. No es compatible con vLLM ni con transformers por el momento, lo que limita su integracion en stacks convencionales. Ademas, el checkpoint es solo de texto: la parte de vision del modelo base no esta incluida.

Su relevancia practica esta en el equilibrio entre tamano, velocidad y coste de memoria: con aproximadamente 5,5 bits por peso empaquetados, alcanza 227 tokens/s en una RTX 4090 con 102 ms hasta el primer token, y mantiene contexto de 32k usando apenas 4,2 GB de VRAM. Eso lo situa como una opcion para inferencia local en GPU de consumo cuando el presupuesto de memoria es ajustado y se acepta una fidelidad algo menor que la de la variante kestrel del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; deriva del modelo base Qwen/Qwen3.5-4B (etiqueta qwen3_5), transformer de solo texto |
| Parametros totales | 4.205.751.296 en el modelo base segun la model card; los metadatos de safetensors del repositorio cuantizado reportan 2.897.085.849 |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | 32.000 tokens (contexto de 32k confirmado en RTX 4090, L40S y RTX A6000) |
| Tipos de cuantizacion | Cuantizacion unica desde bf16 a ~5,5 bits por peso; la etiqueta del Hub indica 8-bit porque cuenta bytes empaquetados |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (pesos, heredada de Qwen/Qwen3.5-4B); el motor Glyd que los ejecuta es BUSL-1.1 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 2,9 GB (65% menos que los 8,4 GB en bf16) |
| Divergencia KL frente a bf16 | 0,0252 sobre WikiText-2 |
| Motor de ejecucion | Glyd (version medida: 0.29.4), `glyd run Qwen/Qwen3.5-4B:swift` |
| Descargas y likes | 21 descargas, 0 likes |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Qwen/Qwen3.5-4B en la informacion proporcionada: la etiqueta del repositorio indica qwen3_5 y la model card se limita a describir el proceso de cuantizacion, no la topologia de la red. Lo que si se sabe es que el modelo base cuenta con 4.205.751.296 parametros y que incorpora algun tipo de componente de vision, ya que el autor advierte que el checkpoint cuantizado es exclusivamente de texto y que "la parte de vision del modelo no esta incluida".

El proceso de compresion consiste en una unica pasada de cuantizacion desde los pesos originales en bf16, sin reentrenamiento ni ajuste posterior declarado. El resultado empaqueta aproximadamente 5,5 bits por peso, lo que explica que los metadatos de safetensors reporten 2.897.085.849 parametros: el Hub cuenta bytes empaquetados, no parametros logicos, y de ahi tambien la etiqueta "8-bit". No se documentan datos de entrenamiento, composicion del dataset, ni fases de RLHF o DPO, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto autoregresiva, con pipeline declarado text-generation.
- Perfil conversacional: el repositorio lleva la etiqueta conversational, orientada a dialogos multi-turno.
- Ventana de contexto de hasta 32.000 tokens, lo que permite manejar documentos largos o historiales extensos de conversacion.
- Inferencia de solo texto: el componente de vision del modelo base no esta incluido en este checkpoint.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas soportados.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Asistente conversacional local en estacion de trabajo: con 32k de contexto y consumo de 4,2 GB a 4k, puede mantener conversaciones multi-turno prolongadas en una RTX 4090 sin agotar la VRAM disponible para otras tareas.
- Procesamiento de documentos largos en local: la ventana de 32k permite resumir o extraer informacion de informes y contratos extensos sin enviar datos a servicios externos, algo relevante cuando la confidencialidad impide usar APIs.
- Generacion de texto en lote con requisitos de latencia: a 227 tokens/s en RTX 4090 y 181 tokens/s en L40S, es viable para tareas de clasificacion, etiquetado o redaccion masiva con una tasa de procesamiento alta por GPU.
- Prototipado rapido de aplicaciones de lenguaje: el tamano de 2,9 GB y el tiempo hasta el primer token de 102 ms permiten iterar sobre prompts y flujos conversacionales con ciclos de prueba cortos.
- Despliegue en servidores con GPU de gama profesional: en L40S usa 4,3 GB y 85 ms hasta el primer token, y en RTX A6000 4,1 GB y 134 ms, por lo que encaja en nodos compartidos donde la memoria es un recurso escaso.
- Educacion e investigacion sobre cuantizacion: al publicarse junto a la variante kestrel, sirve como caso de estudio para medir el compromiso entre tamano, divergencia KL y velocidad dentro de una misma familia de compresiones.
- Sustitucion de un modelo bf16 en entornos con VRAM limitada: cuando los 8,4 GB del bf16 no caben junto al resto del pipeline, esta version libera aproximadamente 5,5 GB de memoria a cambio de un KL de 0,0252.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta medidas de fidelidad de cuantizacion y de velocidad de inferencia, que se recogen a continuacion.

| Modelo | Tamano | Reduccion vs bf16 | KL vs bf16 (WikiText-2) | Tokens/s en RTX 4090 |
|---|---:|---:|---:|---:|
| bf16 (original, Qwen/Qwen3.5-4B) | 8,4 GB | – | 0 | No disponible |
| glyd/Qwen3.5-4B-kestrel | 3,4 GB | 59% | 0,00883 | 201 |
| glyd/Qwen3.5-4B-swift (este repositorio) | 2,9 GB | 65% | 0,0252 | 227 |

Mediciones de velocidad y memoria (glyd 0.29.4, una GPU por prueba, contexto de 4k; memoria = GPU memory in use):

| GPU | Tokens/s | Primer token | Memoria a 4k | Contexto de 32k |
|---|---:|---:|---:|---|
| RTX 4090 | 227 | 102 ms | 4,2 GB | Si |
| L40S | 181 | 85 ms | 4,3 GB | Si |
| RTX A6000 | 166 | 134 ms | 4,1 GB | Si |

## Requisitos de hardware

- VRAM estimada: 4,2 GB en RTX 4090, 4,3 GB en L40S y 4,1 GB en RTX A6000, medida con contexto de 4k tokens y un solo GPU.
- Contexto de 32k: confirmado como viable en RTX 4090, L40S y RTX A6000, segun el fabricante.
- GPU de consumo: si, cabe holgadamente en una RTX 4090, que ademas es la GPU mas rapida de las medidas (227 tokens/s).
- GPU profesionales soportadas segun las mediciones: L40S y RTX A6000.
- Sistema operativo y controladores: Linux con GPU NVIDIA y driver 580 o superior.
- Opciones de despliegue: exclusivamente el motor de Glyd (`glyd run Qwen/Qwen3.5-4B:swift`). La model card indica explicitamente que no esta disponible para vLLM ni para transformers.
- Latencia y throughput: primer token de 102 ms (RTX 4090), 85 ms (L40S) y 134 ms (RTX A6000); throughput de 227, 181 y 166 tokens/s respectivamente.

## Comparativa con modelos similares

| Modelo | Parametros / tamano | Contexto | KL vs bf16 | Tokens/s (RTX 4090) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen/Qwen3.5-4B (bf16, base) | 4.205.751.296 / 8,4 GB | No disponible | 0 (referencia) | No disponible | Apache-2.0 | Repositorio original en HuggingFace |
| glyd/Qwen3.5-4B-kestrel | No disponible / 3,4 GB | No disponible | 0,00883 | 201 | Apache-2.0 (pesos) | Requiere motor Glyd |
| glyd/Qwen3.5-4B-swift | 4.205.751.296 en el base; 2,9 GB en disco | 32k | 0,0252 | 227 | Apache-2.0 (pesos); motor BUSL-1.1 | Requiere motor Glyd |

La variante kestrel es mas fiel al bf16 original (KL 0,00883 frente a 0,0252) pero ocupa 0,5 GB mas y es un 11,4% mas lenta en RTX 4090. No se dispone de datos de contexto ni de rendimiento en tareas para kestrel mas alla de los citados.

## Limitaciones y advertencias

- Cuantizacion con perdida declarada: el autor etiqueta el modelo como "lossy" y reporta una divergencia KL de 0,0252 frente a bf16, aproximadamente tres veces mayor que la de la variante kestrel (0,00883). Esto puede traducirse en degradacion de calidad en tareas sensibles a la precision.
- Compatibilidad restringida: no funciona con vLLM ni con transformers; solo con el motor Glyd, lo que obliga a adoptar su ecosistema y complica la integracion en pipelines existentes.
- Requisitos de entorno: Linux con GPU NVIDIA y driver 580 o superior. No hay soporte declarado para otras plataformas o aceleradores.
- Licencia del motor: aunque los pesos son Apache-2.0, el motor necesario para ejecutarlos es BUSL-1.1, gratuito solo para uso personal y no comercial en equipos propios; el uso comercial requiere licencia adicional de Glyd.
- Ausencia de vision: el checkpoint es solo de texto; cualquier caso de uso multimodal del modelo base queda fuera de alcance.
- Idiomas: no se declaran idiomas soportados, por lo que no puede asumirse un rendimiento multilingue verificado.
- Riesgo de alucinacion: no disponible en la informacion proporcionada, aunque es un comportamiento habitual en modelos generativos de este tamano y la cuantizacion puede agravarlo.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Trazabilidad escasa: el repositorio acumula 21 descargas y 0 likes, y no incluye resultados de benchmarks, lo que limita la evaluacion independiente antes de llevarlo a produccion.
- Contexto: aunque soporta 32k tokens, las mediciones de memoria y velocidad se tomaron con 4k, por lo que el consumo real a contextos mayores no esta cuantificado.
- Discrepancia de cifras: los metadatos de safetensors reportan 2.897.085.849 parametros frente a los 4.205.751.296 del modelo base; conviene no interpretar la primera cifra como el numero real de parametros logicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/glyd/Qwen3.5-4B-swift
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Commit del modelo base utilizado: https://huggingface.co/Qwen/Qwen3.5-4B/tree/851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a
- Variante kestrel del mismo autor: https://huggingface.co/glyd/Qwen3.5-4B-kestrel
- Motor Glyd: https://getglyd.com
- Script de instalacion de Glyd: https://getglyd.com/install.sh
