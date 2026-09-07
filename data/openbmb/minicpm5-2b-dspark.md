# openbmb/MiniCPM5-2B-DSpark

## Resumen

MiniCPM5-2B-DSpark es un modelo borrador (draft) de decodificación especulativa desarrollado por OpenBMB, diseñado para emparejarse exactamente con el modelo objetivo MiniCPM5-2B y su tokenizador. Su función principal es acelerar la generación de texto del modelo principal mediante el algoritmo DSpark, propuesto en el artículo arXiv 2607.05147. El draft tiene 323.776.001 parámetros distribuidos en 5 capas y genera 7 tokens por pasada de verificación especulativa, alineándose con las capas ocultas [1, 10, 20, 30, 39] del modelo objetivo.

Se entrenó con 1.959.525 secuencias y 7.054.154.509 tokens procedentes de dominios generales, matemáticas y código, usando como supervisión las respuestas generadas por MiniCPM5-2B. El objetivo es reducir la latencia de inferencia en entornos con recursos limitados, como dispositivos edge y despliegue local, donde MiniCPM5-2B está pensado para alcanzar un rendimiento de nivel SOTA en su clase.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (borrador de decodificación especulativa DSpark) |
| Parametros totales | 323.776.001 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (checkpoint en BF16) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un draft de decodificación especulativa basado en la arquitectura DSpark. Consta de 5 capas y produce 7 tokens candidatos por pasada. Se alinea con las capas ocultas del modelo objetivo MiniCPM5-2B en los índices [1, 10, 20, 30, 39]. La precisión del checkpoint es BF16.

El entrenamiento utilizó 1.959.525 secuencias y 7.054.154.509 tokens, con 6 épocas y una longitud máxima de secuencia de 12.288. El optimizador fue AdamW y la función de objetivo combinó pérdida de entropía cruzada (CE), pérdida L1 y pérdida de confianza. Las respuestas de entrenamiento fueron generadas por MiniCPM5-2B a partir de prompts de dominio general, matemáticas y código.

## Capacidades

- No es un modelo de propósito general autónomo; su única función es actuar como borrador para acelerar la decodificación del modelo objetivo MiniCPM5-2B.
- Genera hasta 7 tokens por pasada de verificación especulativa, lo que reduce el número de pasos de inferencia.
- Compatible con el algoritmo DSPARK en SGLang, tal como se documenta en la model card.
- Soporta los idiomas inglés y chino a través del tokenizador del modelo objetivo.
- No se describen capacidades de visión, audio o tool calling propias; estas dependen del modelo objetivo.

## Casos de uso

- Aceleración de inferencia en dispositivos edge: el draft reduce la latencia de MiniCPM5-2B, lo que permite ejecutar asistentes de lenguaje en móviles o equipos de bajo consumo.
- Despliegue local en entornos sin GPU dedicada: al disminuir el número de pasos de verificación, se puede mantener una experiencia interactiva en hardware modesto.
- Generación de código en el editor: con MiniCPM5-2B como modelo objetivo, el draft acelera la autocompletación de código en herramientas de desarrollo.
- Razonamiento matemático asistido: el entrenamiento incluye dominios matemáticos, por lo que el modelo objetivo puede resolver problemas con mayor rapidez.
- Asistentes multilingües inglés-chino: la aceleración especulativa permite mantener conversaciones fluidas en estos dos idiomas.
- Integración en pipelines de tool calling: aunque el draft no ejecuta herramientas, al acelerar el modelo objetivo facilita la integración en sistemas de agentes que requieren múltiples llamadas.

## Benchmarks y rendimiento

La evaluación reporta la longitud de aceptación (acceptance length), definida como el total de tokens completados dividido por el número de pasos de verificación especulativa, con terminación natural por EOS y max_new_tokens=4096.

| Dominio | T=0 | T=1.0 |
|---|---|---|
| Matemáticas | 6.0496 | 4.6050 |
| Código | 6.1106 | 4.4381 |
| General | 4.1585 | 3.0997 |
| Agregado | 5.5174 | 4.0514 |

No se han publicado benchmarks de calidad (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- El checkpoint del draft ocupa 0,6 GB en BF16, lo que requiere aproximadamente esa cantidad de VRAM adicional al modelo objetivo.
- La VRAM total depende del modelo objetivo MiniCPM5-2B (2B parámetros) y del framework de inferencia; no se proporcionan cifras exactas.
- GPU recomendadas: no disponible en la información proporcionada.
- Al ser un modelo ligero de 323M parámetros, es probable que quepa en GPUs de consumo, pero no se especifica.
- Opciones de despliegue: SGLang con el algoritmo DSPARK, mediante el comando documentado.
- Latencia y throughput: no disponibles; la medida de eficiencia reportada es la longitud de aceptación.

## Comparativa con modelos similares

No se dispone de información sobre modelos draft comparables en los datos proporcionados. El modelo objetivo es MiniCPM5-2B, que actúa como referencia para el rendimiento del sistema completo.

## Limitaciones y advertencias

- El modelo no tiene intención autónoma ni personalidad jurídica; sus salidas son patrones estadísticos y pueden ser inexactas, sesgadas u ofensivas.
- Es vulnerable a jailbreaks y prompts manipulados que pueden producir contenido no deseado.
- Las respuestas sobre temas sensibles (política, salud, finanzas, derecho) no están revisadas por expertos y no deben tratarse como consejo profesional.
- Se proporciona "AS IS", sin garantías de ningún tipo; los desarrolladores no son responsables de los daños derivados de su uso.
- No es un modelo independiente: requiere el modelo objetivo y un framework compatible con DSpark (por ejemplo, SGLang).
- La licencia Apache-2.0 permite uso comercial, pero el usuario debe configurar sus propias salvaguardas y etiquetar el contenido generado por IA cuando sea necesario.

## Enlaces

- HuggingFace: https://huggingface.co/openbmb/MiniCPM5-2B-DSpark
- Modelo objetivo: https://huggingface.co/openbmb/MiniCPM5-2B
- Artículo DSpark: https://arxiv.org/abs/2607.05147
- Informe técnico MiniCPM: https://arxiv.org/pdf/2506.07900
- Repositorio GitHub: https://github.com/OpenBMB/MiniCPM
- Wiki (chino): https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D
- Demo en línea: https://huggingface.co/spaces/openbmb/MiniCPM5-2B-Demo
- UltraData: https://ultradata.openbmb.cn/
