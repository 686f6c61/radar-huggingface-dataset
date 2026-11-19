# openbmb/MiniCPM5-2B-DSpark

## Resumen

MiniCPM5-2B-DSpark es un checkpoint *draft* (borrador) de decodificación especulativa desarrollado por OpenBMB, el equipo detrás de la familia MiniCPM. No es un modelo de lenguaje autónomo: es un modelo auxiliar de 323.776.001 parámetros (BF16) diseñado para emparejarse de forma exacta con MiniCPM5-2B y su tokenizador, de modo que ambos compartan vocabulario y espacio de embeddings. Su función es proponer secuencias cortas de tokens que el modelo objetivo verifica en paralelo, acelerando la generación sin alterar la distribución de salida.

La arquitectura sigue el esquema DSpark descrito en el paper arXiv:2607.05147: cinco capas *draft* que consumen los estados ocultos de las capas `[1, 10, 20, 30, 39]` del modelo objetivo y emiten hasta 7 tokens por pasada forward. El modelo se entrenó sobre 7.054.154.509 tokens (1.959.525 secuencias, 6 épocas, longitud máxima 12.288) generados por MiniCPM5-2B a partir de prompts de dominio general, matemáticas y código.

Su relevancia es práctica: permite reducir el número de pasos de verificación en despliegues de MiniCPM5-2B, especialmente en cargas de código y matemáticas, donde la longitud de aceptación agregada alcanza 5,5174 tokens por paso a temperatura 0. Se distribuye con licencia Apache-2.0 y pesos safetensors, y su integración está soportada en SGLang mediante el algoritmo especulativo DSPARK.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer *draft* para decodificación especulativa (DSpark), 5 capas |
| Parametros totales | 323.776.001 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 12.288 tokens (longitud máxima de secuencia de entrenamiento); contexto operativo heredado del modelo objetivo MiniCPM5-2B: no disponible |
| Tipos de cuantizacion | no disponible (checkpoint publicado en BF16) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16), `custom_code` con `trust_remote_code` |
| Modelo objetivo | openbmb/MiniCPM5-2B |
| Tokens por pasada forward | 7 |
| Capas del objetivo utilizadas | `[1, 10, 20, 30, 39]` |
| Tamano del repo | 0,6 GB |

## Arquitectura y entrenamiento

El modelo es un *draft* de decodificación especulativa con 5 capas que no predice desde cero, sino condicionado a los estados ocultos intermedios del modelo objetivo: concretamente extrae representaciones de las capas 1, 10, 20, 30 y 39 de MiniCPM5-2B. En cada pasada forward emite 7 tokens candidatos, que el modelo objetivo verifica de forma paralela. El objetivo de entrenamiento combina entropía cruzada (CE), una pérdida L1 y una pérdida de confianza, lo que permite al borrador estimar la probabilidad de acierto de sus propias propuestas y ajustar la longitud de la especulación.

El corpus de entrenamiento no son datos humanos crudos, sino respuestas generadas por MiniCPM5-2B sobre una mezcla de prompts de dominio general, matemáticas y código: 1.959.525 secuencias y 7.054.154.509 tokens en total, con 6 épocas, longitud máxima de 12.288 tokens y optimizador AdamW. La model card cita como base de datos del ecosistema los conjuntos Ultra-FineWeb, UltraX-Preview, Ultra-FineWeb-L3, UltraData-Math, UltraData-Code, UltraData-SFT-2605, UltraData-SFT-Agent-2609 y UltraData-RL-2609, aunque el entrenamiento del *draft* se realizó sobre las salidas del modelo objetivo. El checkpoint se publica en BF16 y requiere `trust_remote_code` por el uso de código personalizado.

## Capacidades

- Decodificación especulativa: propone hasta 7 tokens por pasada forward para verificación paralela por parte de MiniCPM5-2B.
- Aceleración de inferencia en dominios de matemáticas y código, donde la tasa de aceptación es mayor.
- Estimación de confianza por token mediante la pérdida de confianza entrenada, que informa la longitud efectiva de la especulación.
- Compatibilidad estricta de tokenizador con MiniCPM5-2B, requisito para el emparejamiento exacto.
- Soporte bilingüe en inglés y chino, heredado del modelo objetivo y de la distribución de prompts de entrenamiento.
- Integración con SGLang mediante el algoritmo especulativo DSPARK y `--speculative-dspark-block-size 7`.
- No soporta tool calling, razonamiento multi-paso, visión ni audio por sí mismo: esas capacidades residen en el modelo objetivo.

## Casos de uso

- Aceleración de servidores de inferencia con SGLang: se lanza MiniCPM5-2B como modelo principal y este checkpoint como `--speculative-draft-model-path`, reduciendo el número de pasos de verificación por token generado.
- Generación de código en producción: al ser el dominio con mayor longitud de aceptación (6,1106 a T=0), es el escenario donde el *draft* aporta más reducción de latencia en asistentes de autocompletado y revisión de parches.
- Razonamiento matemático interactivo: con aceptación de 6,0496 tokens por paso a T=0, resulta adecuado para pipelines de resolución de problemas paso a paso donde el coste por token es crítico.
- Despliegue en *edge* y dispositivos con recursos limitados: el borrador ocupa 0,6 GB en BF16 y se ejecuta junto al objetivo de 2B, manteniendo el conjunto dentro de presupuestos de memoria de hardware de consumo.
- Chat multi-turno de propósito general: aunque la aceptación baja a 4,1585 (T=0) y 3,0997 (T=1.0), sigue aportando ganancia en asistentes conversacionales en inglés y chino.
- Evaluación comparativa de técnicas de decodificación especulativa: sirve como referencia reproducible para medir longitud de aceptación con EOS natural y `max_new_tokens=4096`.
- Servicios con requisitos de temperatura alta (T=1.0): la aceptación agregada de 4,0514 tokens por paso sigue siendo sustancial para muestreo estocástico.

## Benchmarks y rendimiento

La model card no publica benchmarks de calidad tipo MMLU, HumanEval o GSM8K. El único dato de evaluación es la longitud de aceptación (tokens de finalización divididos entre pasos de verificación especulativa), medida con terminación EOS natural y `max_new_tokens=4096`:

| Dominio | T=0 | T=1.0 |
|---|---:|---:|
| Matemáticas | 6,0496 | 4,6050 |
| Código | 6,1106 | 4,4381 |
| General | 4,1585 | 3,0997 |
| Agregado | 5,5174 | 4,0514 |

## Requisitos de hardware

- VRAM del *draft*: aproximadamente 0,65 GB en BF16 (323,8 M de parámetros); el repo ocupa 0,6 GB.
- VRAM total del sistema: la del *draft* más la de MiniCPM5-2B, que no se detalla en la información disponible.
- GPU recomendadas: no especificadas en la model card; al tratarse de un acelerador de un modelo de 2B, es apto para GPU de consumo, aunque no se indican modelos concretos.
- Cabe en GPU de consumo: sí, por el tamaño del borrador; el requisito real lo impone el modelo objetivo.
- Opciones de despliegue: SGLang con `--speculative-algorithm DSPARK` y `--speculative-dspark-block-size 7`; la librería declarada es transformers con `trust_remote_code`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma absoluta; la mejora se expresa como longitud de aceptación (5,5174 agregada a T=0), no como *speedup* medido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM5-2B-DSpark | 323,8 M | 12.288 (entrenamiento) | *Draft* especulativo para MiniCPM5-2B | Apache-2.0 | Hugging Face |
| MiniCPM5-2B | no disponible | no disponible | Modelo objetivo de generación de texto | Apache-2.0 | Hugging Face |
| Otros *drafts* especulativos de la familia MiniCPM | no disponible | no disponible | Decodificación especulativa | no disponible | no disponible |
| *Drafts* EAGLE/Medusa genéricos | no disponible | no disponible | Decodificación especulativa | variable | variable |

No se dispone de datos públicos de rendimiento de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa de longitud de aceptación queda como no disponible.

## Limitaciones y advertencias

- No es un modelo autónomo: sin MiniCPM5-2B y su tokenizador exacto no produce salidas útiles; el emparejamiento es estricto.
- Solo cubre inglés y chino; no hay soporte declarado para otras lenguas.
- El entrenamiento se hizo sobre salidas de MiniCPM5-2B en dominios general, matemáticas y código; el rendimiento en otros dominios (legal, médico, agentes) no está evaluado.
- La aceptación cae de forma notable con temperatura alta (de 5,5174 a 4,0514 agregada), por lo que la ganancia es menor en muestreo estocástico.
- Al ser un componente de decodificación, puede reproducir los sesgos y alucinaciones del modelo objetivo; la model card advierte de posibles salidas inexactas, sesgadas u ofensivas y de vulnerabilidad a *jailbreaks*.
- Las respuestas sobre política, salud, finanzas y derecho no están revisadas por expertos y no deben tratarse como asesoramiento profesional.
- Licencia Apache-2.0: permite uso comercial, pero el software se entrega "AS IS", sin garantías, y el usuario debe configurar sus propias salvaguardas y etiquetar el contenido generado por IA cuando sea exigible.
- El uso de `trust_remote_code` implica ejecutar código del repositorio; conviene auditar el código personalizado antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openbmb/MiniCPM5-2B-DSpark
- Modelo objetivo MiniCPM5-2B: https://huggingface.co/openbmb/MiniCPM5-2B
- Paper DSpark: https://arxiv.org/abs/2607.05147
- MiniCPM Tech Report: https://arxiv.org/pdf/2506.07900
- Repositorio GitHub: https://github.com/OpenBMB/MiniCPM
- Documentación MiniCPM Wiki (chino): https://openbmb.cn/docs/
- UltraData: https://ultradata.openbmb.cn/
- Demo online: https://huggingface.co/spaces/openbmb/MiniCPM5-2B-Demo
- Licencia: https://github.com/OpenBMB/MiniCPM/blob/main/LICENSE
