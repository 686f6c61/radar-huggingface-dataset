# kanarian/Homo-GE2PE-Dari

## Resumen
Homo-GE2PE-Dari es un modelo de conversión grafema-a-fonema (G2P) y romanización especializado en darí, la variedad del persa hablada en Afganistán. Lo desarrolla el usuario kanarian como un ajuste fino del modelo Homo-GE2PE-Persian-HF, que a su vez se basa en la arquitectura ByT5 de Google y en el trabajo GE2PE presentado en EMNLP 2024. El modelo transforma texto en escritura persa-árabe a letras latinas reproduciendo la pronunciación darí, incluyendo las vocales cortas que no se escriben y la ezafe.

El problema que resuelve es concreto: los sistemas de romanización existentes para persa están calibrados para la pronunciación iraní, lo que produce transcripciones que no reflejan cómo se lee el texto en darí. Este ajuste fino corrige las correspondencias vocálicas y consonánticas hacia la norma darí (por ejemplo, "imroz" frente a "emruz", o "khana-yi" frente a "khane-ye").

Con apenas 8,26 millones de parámetros y un peso de 8,4 MB en int8, el modelo está pensado para ejecutarse localmente, incluso en el navegador mediante una implementación en JavaScript sin dependencias. Es relevante para herramientas de accesibilidad lingüística, aprendizaje de la lectura y normalización de texto darí, un ámbito con muy pocos recursos computacionales publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ByT5 (transformer encoder-decoder byte-level, base de GE2PE) |
| Parametros totales | 8.264.064 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (pesos de 8,4 MB para la versión de navegador); pesos originales en safetensors sin cuantizar |
| Idiomas soportados | fa (persa), prs (darí) |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers); int8 para la implementación JS |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura ByT5 de Google, un transformer encoder-decoder que opera a nivel de byte en lugar de token, lo que lo hace robusto frente a variaciones ortográficas y adecuado para tareas de transliteración carácter a carácter. Sobre esta base, el proyecto GE2PE (Rahmati y Sameti, EMNLP 2024) adaptó el enfoque a la conversión grafema-a-fonema del persa, y Homo-GE2PE (Qharabagh et al., 2025) lo refinó con datos más ricos.

El ajuste fino hacia darí se realizó en unos 3,5 minutos sobre un MacBook, partiendo de Homo-GE2PE-Persian-HF. Los datos de entrenamiento suman aproximadamente 41.000 filas: un léxico de pronunciación darí de unas 17.000 palabras extraídas de Wiktionary (lecturas darí y clásicas) más varios cientos de palabras comunes, topónimos y préstamos revisados manualmente, y alrededor de 8.600 frases darí del corpus de Leipzig (filtradas las de pastún) transliteradas por el modelo original y luego corregidas hacia darí mediante el léxico y las correspondencias vocálicas aprendidas de palabras con lectura iraní y darí. No se documenta uso de RLHF ni DPO.

## Capacidades
- Romanización de texto en escritura persa-árabe a latín con pronunciación darí.
- Reconstrucción de vocales cortas no escritas y de la ezafe.
- Notación interna propia: `/` para a corta, `a` para a larga, `$` para sh, `c` para ch, `x` para kh, `G` para gh, `@` para oclusiva glotal y `1` para marcar ezafe.
- Ejecución local en navegador mediante implementación JavaScript (t5.js) con decodificación greedy.
- Manejo de números fuera del modelo (el modelo no aprendió dígitos; inference.py los gestiona aparte).
- No soporta tool calling, agentes, visión ni audio.
- Capacidad multilingüe limitada a persa y darí.

## Casos de uso
- Herramientas de aprendizaje de lectura para hablantes de darí: el modelo permite mostrar junto al texto original su pronunciación latina, facilitando la alfabetización de quienes leen la escritura con dificultad, como el propio autor del proyecto.
- Romanización de corpus darí para procesamiento del lenguaje natural: convertir textos del corpus de Leipzig u otras fuentes a latín fonético para pipelines de ASR, TTS o búsqueda fonética.
- Aplicaciones web sin backend: la versión int8 de 8,4 MB y la implementación en JavaScript permiten ofrecer transliteración en el navegador del usuario sin enviar texto a un servidor, lo que protege la privacidad.
- Normalización de nombres propios y topónimos afganos: el léxico entrenado incluye topónimos y préstamos revisados, útil para generar formas latinas consistentes en bases de datos o cartografía.
- Generación de transcripciones fonéticas para TTS en darí: la salida con vocales cortas y ezafe explícitas sirve como entrada para sintetizadores de voz que necesitan la pronunciación completa.
- Investigación lingüística comparada iraní-darí: el modelo permite contrastar sistemáticamente las correspondencias vocálicas y consonánticas entre ambas variedades sobre grandes volúmenes de texto.

## Benchmarks y rendimiento
Evaluación sobre 40 frases no vistas (356 palabras), escritas tras el entrenamiento y medidas una sola vez:

| Modelo | Forma darí exacta | Palabra correcta |
|---|---|---|
| Homo-GE2PE (original) | 39% | 87% |
| Homo-GE2PE-Dari | 79% | 94% |

La métrica "palabra correcta" ignora las diferencias vocálicas habituales entre iraní y darí (e/i, o/u, -e/-a final) y la ezafe. La versión int8 de navegador obtiene resultados equivalentes dentro del margen de ruido. El autor advierte que el conjunto de test y sus referencias fueron elaborados con ayuda de un asistente de IA, no por un equipo de anotadores, y que la muestra es pequeña.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 GB en fp32; la versión int8 ocupa 8,4 MB de pesos.
- GPU recomendadas: no requiere GPU; funciona en CPU sin problemas dado su tamaño.
- Cabe en cualquier GPU de consumo e incluso en dispositivos móviles y navegadores.
- Opciones de despliegue: transformers (PyTorch), implementación JavaScript propia (t5.js) para navegador, text-generation-inference según los tags del repositorio.
- Latencia y throughput: no disponibles de forma cuantificada; el ajuste fino completo se realizó en 3,5 minutos en un MacBook, lo que indica una carga computacional muy baja.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Enfoque | Licencia |
|---|---|---|---|---|
| Homo-GE2PE-Dari | 8,26 M | fa, prs | G2P y romanización darí | MIT |
| Homo-GE2PE-Persian-HF | no disponible | fa | G2P y romanización persa iraní | no disponible |
| GE2PE (Rahmati y Sameti, 2024) | no disponible | fa | G2P persa end-to-end | no disponible |

La comparación directa en rendimiento solo está documentada frente al modelo base Homo-GE2PE, con la mejora de 39% a 79% en forma darí exacta descrita en la sección de benchmarks. No se dispone de datos de otros modelos G2P para darí con los que contrastar.

## Limitaciones y advertencias
- La pronunciación corresponde al darí formal de Kabul, de lectura en voz alta; no cubre hazaragi, heratí ni el habla coloquial cotidiana.
- A veces inserta una ezafe inexistente (por ejemplo, "qatra-yi qatra-yi" para قطره قطره), hábito heredado del modelo base.
- Los nombres extranjeros y préstamos poco frecuentes se generan por conjetura.
- Algunas vocales se producen incorrectamente (por ejemplo, "chitur" para چطور).
- El modelo no aprendió dígitos; es necesario gestionar los números fuera del modelo.
- La evaluación se basa en un conjunto pequeño y generado con asistencia de IA, por lo que las cifras deben interpretarse con cautela.
- Licencia MIT, que permite uso comercial, pero se recomienda citar los dos trabajos originales en que se basa.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/kanarian/Homo-GE2PE-Dari
- Modelo base: https://huggingface.co/mehdi-hf/Homo-GE2PE-Persian-HF
- Modelo original Homo-GE2PE: https://huggingface.co/MahtaFetrat/Homo-GE2PE-Persian
- Demo en navegador: https://arian.af/dari/lezen
- Código de reconstrucción: https://github.com/kanarian/dari-translit
- Paper GE2PE (EMNLP 2024): https://aclanthology.org/2024.findings-emnlp.196/
- Paper Homo-GE2PE (arXiv 2505.12973): https://arxiv.org/abs/2505.12973
