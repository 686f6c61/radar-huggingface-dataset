# Akahsizrr/MiniCPM5-2B-DSpark-continued-step200

## Resumen

MiniCPM5-2B-DSpark-continued-step200 es un checkpoint de modelo draft creado por el usuario Akahsizrr para el algoritmo DSpark de decodificación especulativa. Está diseñado para emparejarse con el modelo objetivo MiniCPM5-2B de OpenBMB y su tokenizer, de modo que se pueda acelerar la generación sin modificar la salida del modelo principal. Se trata de un modelo pequeño, con 323.776.001 parámetros y 5 capas draft, que propone 7 tokens por pasada hacia adelante. No es un modelo autónomo de generación de lenguaje: su función es servir como propuesta rápida dentro de un pipeline de SGLang.

El checkpoint es una continuación de entrenamiento (paso 200) de un draft model DSpark. Fue entrenado con respuestas generadas por MiniCPM5-2B a partir de una mezcla de prompts de dominio general, matemáticas y código, utilizando 7.054.154.509 tokens y una longitud máxima de secuencia de 12.288. Según la model card, alcanza una acceptance length agregada de 5,5174 con temperatura 0, lo que indica un ahorro relevante de pasos de verificación. Es relevante para entornos que buscan reducir latencia en inferencia de modelos de 2B, tanto en servidores como en dispositivos edge.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Draft model basado en transformer (DSpark) para decodificación especulativa |
| Parámetros totales | 323.776.001 |
| Parámetros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible (secuencia máxima de entrenamiento: 12.288 tokens) |
| Tipos de cuantización | BF16 (pesos del checkpoint) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un draft checkpoint específicamente diseñado para el algoritmo DSpark, descrito en el paper arXiv:2607.05147. Tiene 5 capas draft y 323.776.001 parámetros, y propone 7 tokens por cada pasada hacia adelante. El acoplamiento con el modelo objetivo se realiza en las capas `[1, 10, 20, 30, 39]` del modelo MiniCPM5-2B. La precisión del checkpoint es BF16. Para usarlo, es necesario confiar en el código remoto (`trust_remote_code`) y emplear SGLang con `--speculative-algorithm DSPARK`.

El entrenamiento utilizó respuestas generadas por MiniCPM5-2B a partir de prompts de dominio general, matemáticas y código. Los datasets listados incluyen Ultra-FineWeb, UltraX-Preview, UltraData-Math, UltraData-Code, UltraData-SFT-2605, UltraData-SFT-Agent-2609 y UltraData-RL-2609. El proceso se llevó a cabo con 1.959.525 secuencias y 7.054.154.509 tokens de entrenamiento, durante 6 épocas. Se usó el optimizador AdamW con una función objetivo que combina pérdida de entropía cruzada (CE), pérdida L1 y una pérdida de confianza (confidence loss). La longitud máxima de secuencia durante el entrenamiento fue de 12.288 tokens.

## Capacidades

- Decodificación especulativa: el modelo propone 7 tokens por pasada hacia adelante, lo que permite reducir el número de pasos de verificación en el modelo objetivo MiniCPM5-2B.
- Compatibilidad con SGLang: está documentado su uso con `--speculative-algorithm DSPARK` y `--speculative-dspark-block-size 7`.
- Idiomas de trabajo: inglés y chino, según los metadatos del repositorio. No obstante, el modelo no genera texto de forma autónoma.
- Longitud de secuencia: se entrenó con secuencias de hasta 12.288 tokens, pero no se especifica la ventana de contexto de inferencia del draft.
- Tool calling y agentes: no son capacidades del draft en sí; si se desea usar funciones de tool calling o razonamiento multi-paso, estas dependen del modelo objetivo MiniCPM5-2B.

## Casos de uso

- Autocompletado de código en editores: el sistema formado por MiniCPM5-2B y este draft se sirve con SGLang. Al proponer 7 tokens por pasada, reduce la latencia de autocompletado, lo que resulta útil en IDEs y terminales donde se espera una respuesta inmediata.
- Atención al cliente bilingüe: MiniCPM5-2B soporta inglés y chino; el draft acelera la generación de respuestas en bots de soporte. La menor latencia permite mantener conversaciones fluidas en tiempo real.
- Tutoría de matemáticas: el entrenamiento con datos como UltraData-Math hace que el modelo objetivo tenga un buen desempeño en problemas matemáticos. La aceleración especulativa ayuda en aplicaciones móviles con recursos limitados.
- Agentes con herramientas: el modelo objetivo tiene soporte de tool calling. El draft reduce el tiempo de cada paso del bucle agente-herramienta, mejorando la capacidad de respuesta de agentes autónomos.
- Edge AI: con un peso de 0,6 GB en disco y 323.776.001 parámetros, el draft añade muy poca VRAM al modelo objetivo. Es adecuado para dispositivos de borde que ya ejecutan MiniCPM5-2B cuantizado, siempre que el framework soporte DSpark.
- Servicio de inferencia en producción: con SGLang, el sistema puede aumentar el throughput en términos de tokens aceptados por verificación, lo que reduce el coste por petición en aplicaciones con alto volumen de generación.

## Benchmarks y rendimiento

El único dato de rendimiento publicado es la acceptance length, una métrica de eficiencia para decodificación especulativa. Se define como el número total de tokens completados dividido por el número total de pasos de verificación especulativa. La evaluación utiliza terminación natural por EOS y `max_new_tokens=4096`. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

| Dominio | T=0 | T=1.0 |
|---|---|---|
| Matemáticas | 6.0496 | 4.6050 |
| Código | 6.1106 | 4.4381 |
| General | 4.1585 | 3.0997 |
| Agregado | 5.5174 | 4.0514 |

## Requisitos de hardware

- El checkpoint ocupa 0,6 GB en disco y usa pesos BF16. Como modelo draft, su VRAM adicional es reducida, pero no se ha publicado una cifra exacta.
- No se han publicado requisitos oficiales de hardware para el sistema completo. La carga principal depende del modelo objetivo MiniCPM5-2B, cuyo tamaño se estima en el orden de 2B parámetros.
- El draft cabe en cualquier GPU de consumo; sin embargo, el sistema completo requiere evaluar la VRAM del modelo objetivo. No hay datos confirmados.
- Despliegue documentado: SGLang con el argumento `--speculative-algorithm DSPARK`. No se mencionan otros frameworks como vLLM, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. En la información proporcionada no se describen alternativas de draft models comparables. El modelo objetivo MiniCPM5-2B no es un modelo draft, por lo que no constituye una comparación directa en términos de función.

## Limitaciones y advertencias

- No es un modelo de lenguaje completo: usar el draft de forma independiente como un LLM producirá resultados deficientes y no sustituye al modelo objetivo.
- Requiere SGLang y el modelo objetivo MiniCPM5-2B. No funciona de manera autónoma ni como un modelo de inferencia estándar.
- El entrenamiento se limitó a secuencias de 12.288 tokens; la ventana de contexto real de inferencia no está especificada.
- El modelo se proporciona "AS IS", sin garantías. El autor no es responsable de los daños derivados de su uso.
- Los textos generados por el sistema pueden contener sesgos, imprecisiones o contenido no deseado. No ha sido revisado por expertos en temas sensibles como política, salud, finanzas o derecho.
- El uso comercial está permitido bajo la licencia Apache-2.0, pero no hay garantía de idoneidad para ningún fin concreto.
- Es necesario confiar en el código remoto (`trust_remote_code`) y en el soporte DSpark de SGLang, lo que añade dependencias y restricciones de despliegue.

## Enlaces

- https://huggingface.co/Akahsizrr/MiniCPM5-2B-DSpark-continued-step200
- https://huggingface.co/openbmb/MiniCPM5-2B
- https://arxiv.org/abs/2607.05147
- https://arxiv.org/pdf/2506.07900
- https://github.com/OpenBMB/MiniCPM
- https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D
- https://ultradata.openbmb.cn/
- https://huggingface.co/spaces/openbmb/MiniCPM5-2B-Demo
