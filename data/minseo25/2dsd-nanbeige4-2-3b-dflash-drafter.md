# minseo25/2dsd-nanbeige4.2-3b-dflash-drafter

## Resumen

El 2DSD DFlash drafter para Nanbeige4.2-3B es un modelo auxiliar ("drafter") de decodificacion especulativa disenado especificamente para acelerar la inferencia del modelo objetivo Nanbeige/Nanbeige4.2-3B, un modelo con arquitectura de capas en bucle ("looped language model"). Lo desarrolla el equipo de SqueezeAILab (Minseo Kim y colaboradores), en el contexto del paper *2DSD: Two-Dimensional Speculative Decoding for Looped Language Models*.

A diferencia de un drafter convencional, este modelo es sensible a la profundidad del bucle: un unico drafter sirve para todas las profundidades r = 1, ..., R (con R = 2 en este caso), combinando caracteristicas del modelo objetivo en distintos puntos del bucle. Esto permite aplicar decodificacion especulativa sobre modelos con computacion recurrente sin sacrificar la distribucion de salida del modelo objetivo.

El modelo tiene 1.273.271.552 parametros (aproximadamente 1,27 mil millones), lo que lo hace notablemente mas pequeno que el modelo objetivo de 3B. Se distribuye en formato safetensors con licencia Apache 2.0 y un repositorio de 2,5 GB. Es relevante para desarrolladores que despliegan Nanbeige4.2-3B y necesitan reducir la latencia de decodificacion manteniendo exactitud en la salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (drafter de decodificacion especulativa DFlash, condicionado por profundidad de bucle); 5 capas Transformer con ancho oculto 3072 |
| Parametros totales | 1.273.271.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El drafter es un transformer compacto de 5 capas con el ancho oculto del modelo objetivo (3072) y un tamano de bloque especulativo k = 16. Utiliza los embeddings congelados y la LM head del modelo objetivo Nanbeige4.2-3B, mientras que el "mask embedding" se entrena de forma independiente. La innovacion clave es el condicionamiento por profundidad: las entradas de contexto del bucle se toman de cinco capas del modelo objetivo por cada iteracion del bucle (indices de capa 1, 6, 10, 14 y 19 de un total de 22). Al generar borradores en el bucle r, el contexto combina caracteristicas del bucle R de los tokens ya confirmados con caracteristicas del bucle r de los tokens en vuelo.

El entrenamiento se realizo sobre rollouts de 13.000 prompts durante seis epocas, con tamano de bloque 16 y profundidades de entrenamiento r en {1, 2} muestreadas de forma uniforme. La verificacion se efectua con el ultimo bucle, de modo que 2DSD preserva las salidas greedy y la distribucion de muestreo del modelo objetivo. La decodificacion es greedy por defecto, con opcion de muestreo mediante `--temperature 0.6 --top-p 0.95`.

## Capacidades

- Aceleracion de decodificacion especulativa del modelo Nanbeige4.2-3B mediante borradores de bloque de 16 tokens.
- Generacion de borradores condicionada por profundidad de bucle, compatible con arquitecturas de capas en bucle (R = 2).
- Preservacion de la distribucion de salida del modelo objetivo: la verificacion con el ultimo bucle mantiene las salidas greedy y el muestreo.
- Soporte de decodificacion greedy y de muestreo (temperatura y top-p configurables).
- Reutilizacion de embeddings y LM head del modelo objetivo, con mask embedding aprendido.
- No dispone de capacidades propias de generacion autonoma: es un componente auxiliar del pipeline de decodificacion.
- Soporte de tool calling, agentes, vision o audio: no disponible (no se documenta ninguna de estas capacidades).

## Casos de uso

- Aceleracion de inferencia en produccion de Nanbeige4.2-3B: el drafter genera bloques de 16 tokens candidatos que el modelo objetivo verifica, reduciendo el numero de pasos de decodificacion y por tanto la latencia en servicios de generacion de texto.
- Servicios de chat de baja latencia: al mantener la distribucion de muestreo del objetivo, puede integrarse en endpoints conversacionales donde la latencia por token es critica, sin alterar la calidad de las respuestas.
- Despliegue en infraestructura con GPU limitadas: con 1,27 mil millones de parametros y 2,5 GB de pesos, el drafter anade una sobrecarga de memoria pequena frente al modelo objetivo de 3B, lo que permite acelerar en hardware moderado.
- Investigacion sobre decodificacion especulativa en modelos con bucles: sirve como referencia reproducible para estudiar el condicionamiento por profundidad en arquitecturas recurrentes, usando el codigo de SqueezeAILab/2DSD.
- Evaluacion comparativa de tecnicas de speculative decoding: permite medir el impacto de DFlash frente a drafters convencionales sobre un mismo modelo objetivo, con configuracion documentada (`--model nanbeige4.2-3b --target original`).
- Generacion determinista en pipelines de evaluacion: la decodificacion greedy por defecto y la preservacion de salidas greedy facilitan la reproducibilidad en benchmarks y tests automatizados.
- Prototipado rapido con scripts de generacion: el repositorio 2DSD incluye `scripts/generate.py`, lo que permite validar el drafter con prompts de ejemplo sin montar un servidor de inferencia completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; los pesos ocupan 2,5 GB en safetensors (aproximadamente 2,5 GB en FP16 para 1,27 mil millones de parametros), a lo que se suma la memoria del modelo objetivo Nanbeige4.2-3B y las estructuras KV por bucle.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por tamano de pesos, el drafter por si solo cabria en GPUs de consumo, pero requiere el modelo objetivo y el codigo 2DSD.
- Opciones de despliegue: repositorio SqueezeAILab/2DSD mediante `scripts/generate.py`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 2DSD DFlash drafter (Nanbeige4.2-3B) | 1.273.271.552 | no disponible | Drafter especulativo condicionado por bucle | Apache 2.0 | Hugging Face (8 descargas) |
| Nanbeige/Nanbeige4.2-3B (objetivo) | no disponible en la informacion | no disponible | Modelo generativo objetivo con capas en bucle | Apache 2.0 | Hugging Face |
| Drafters especulativos convencionales | no disponible | no disponible | Borradores sin condicionamiento por profundidad | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo auxiliar: no funciona de forma autonoma como modelo generativo; requiere el modelo objetivo Nanbeige4.2-3B y el codigo de 2DSD.
- Solo es compatible con el modelo objetivo para el que fue entrenado (Nanbeige4.2-3B con KV por bucle); no es un drafter generico.
- Entrenado unicamente con profundidades r en {1, 2}; su comportamiento fuera de ese rango no esta documentado.
- Al preservar la distribucion del objetivo, hereda sus sesgos, riesgos de alucinacion y limitaciones de idioma y contexto, que no se detallan en la informacion disponible.
- No se documentan idiomas soportados ni longitud de contexto; no disponible.
- La licencia Apache 2.0 permite uso comercial, pero el modelo incorpora una copia de la LM head del objetivo y deriva de Nanbeige4.2-3B, por lo que deben respetarse las condiciones de la licencia del modelo base.
- El rendimiento real de aceleracion depende del hardware, del backend de verificacion y de la implementacion del bucle; no se publican cifras de speedup.
- Repositorio con muy baja adopcion (8 descargas, 0 likes) en el momento de la consulta; madurez y soporte comunitario limitados.

## Enlaces

- Hugging Face: https://huggingface.co/minseo25/2dsd-nanbeige4.2-3b-dflash-drafter
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.2-3B
- Paper 2DSD: https://github.com/SqueezeAILab/2DSD/blob/main/paper/2DSD.pdf
- Codigo 2DSD: https://github.com/SqueezeAILab/2DSD
