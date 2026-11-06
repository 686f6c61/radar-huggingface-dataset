# nikimoriOne/EuroLLM-1.7B-Pretype-5bit

## Resumen

EuroLLM-1.7B-Pretype-5bit es un ajuste fino (fine-tune) de [EuroLLM-1.7B](https://huggingface.co/utter-project/EuroLLM-1.7B) del proyecto utter-project, publicado por el usuario nikimoriOne en Hugging Face. El modelo está especializado en dos tareas concretas: autocompletado de texto en tiempo real y corrección de erratas sin reescribir el texto. Su propósito principal es servir como motor de [Pretype](https://github.com/nikiomori/Pretype), una aplicación de autocompletado para macOS que se ejecuta íntegramente en el dispositivo.

El modelo se distribuye cuantizado a 5 bits en formato MLX (ecosistema de Apple Silicon), ocupa 1,1 GB en un único archivo y genera cada sugerencia en unos 22 ms sobre un M4 Max, consumiendo 715 mJ por sugerencia, un 33 % menos que Gemma 4 E2B 4-bit según las mediciones del autor. En la tarea de corrección supera claramente al modelo de comparación (64 % frente a 49 % de líneas restauradas exactamente), mientras que en autocompletado empata en términos generales.

Su relevancia radica en que demuestra que un modelo pequeño multilingüe, ajustado con LoRA y destilado desde EuroLLM-9B, puede ofrecer latencias y consumos energéticos adecuados para autocompletado en el dispositivo en 17-20 idiomas, con licencia Apache-2.0 que permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo LLaMA (fine-tune de EuroLLM-1.7B) |
| Parametros totales | 1.656.850.432 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5 bits (afín, grupo de 64, conversión con `mlx_lm.convert --q-bits 5 --q-group-size 64`) |
| Idiomas soportados | en, ru, da, de, es, fr, it, nl, pl, pt, ro, sv, cs, uk, tr (mejor en inglés, ruso y danés; evaluado en 20 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (cuantizado, librería MLX) |

## Arquitectura y entrenamiento

El modelo parte de EuroLLM-1.7B en bf16, incorporando los dos tokens de chat y la plantilla de chat de EuroLLM-1.7B-Instruct. El ajuste fino se realizó con LoRA (rango 16, escala 20, aplicado a 24 capas) durante 3.750 iteraciones con batch de 8 y learning rate 2e-5 con decaimiento cosenoidal; los pesos LoRA se fusionaron posteriormente en los pesos base. Finalmente se convirtió a MLX con cuantización a 5 bits.

El conjunto de entrenamiento consta de unas 30.000 filas: 12.000 filas de corrección con erratas sintéticas generadas sobre frases de OpenSubtitles (OPUS), unas 10.000 mensajes en inglés, ruso y danés escritos por Gemma 4 E4B-it, y unas 8.000 filas de texto plano de OpenSubtitles. Sobre las filas de texto plano se aplicó destilación desde EuroLLM-9B cuantizado a 8 bits: el 70 % de la pérdida sigue los 16 tokens principales del modelo profesor. El autor indica que se excluyeron las frases coincidentes con el texto de evaluación y que no se usaron datos de usuarios.

## Capacidades

- Autocompletado de texto en 17 idiomas medidos, con mejor rendimiento en inglés, ruso y danés (precisión de primera palabra del 20,3 % de media sobre 5.649 filas).
- Corrección de erratas ortográficas, mayúsculas y puntuación sin reescribir el texto: repite el texto de entrada solo con los errores corregidos, preservando estilo, formato e idioma.
- Generación de texto por finalización (sin plantilla de chat) para la tarea de autocompletado.
- Uso de plantilla de chat para la tarea de corrección.
- Funcionamiento íntegramente en el dispositivo (on-device) en Apple Silicon mediante MLX.
- No está diseñado para chat, respuestas conversacionales, traducción ni reescritura: el entrenamiento de corrección induce a repetir la entrada.

## Casos de uso

- Autocompletado en editores de texto en macOS: el modelo genera la continuación de la frase que el usuario está escribiendo en unos 22 ms por sugerencia, suficientemente rápido para sugerencias en tiempo real mientras se teclea.
- Corrección de erratas en procesadores de texto: dado un texto con errores, devuelve el mismo texto corregido sin alterar el estilo ni el significado, ideal para una función de "corregir sin reescribir" en apps de escritorio.
- Asistentes de escritura multilingües en el dispositivo: soporta 17 idiomas europeos además de ruso y danés con buen rendimiento, lo que permite integrarlo en apps de productividad usadas en varios idiomas.
- Escritura en entornos con restricciones de privacidad: al ejecutarse localmente en Apple Silicon, ningún texto sale del dispositivo, adecuado para redacción de correos o documentos sensibles.
- Optimización de consumo energético en portátiles: con 715 mJ por sugerencia (un 33 % menos que Gemma 4 E2B 4-bit), es adecuado para apps que priorizan duración de batería.
- Sistemas de sugerencias con recursos de disco limitados: el modelo ocupa 1,1 GB frente a los 5,5 GB del modelo de comparación, útil para distribuciones ligeras de software de escritorio.

## Benchmarks y rendimiento

Datos publicados por el autor (harness de evaluación de Pretype, 2026-10-30 y 2026-10-31, decodificación greedy, tests de McNemar pareados). Modelo de comparación: Gemma 4 E2B 4-bit (2,5 GB) para autocompletado y su versión instruct (3,0 GB) para corrección.

| Measure | Comparison | This model |
|---|--:|--:|
| Autocomplete: primera palabra correcta, 5.649 filas, 17 idiomas | 20,8 % | 20,3 % (p=0,44, no significativo) |
| Autocomplete: primera palabra correcta, inglés | 27,5 % | 24,6 % (p=0,015, tendencia) |
| Fix: línea con erratas restaurada exactamente, 510 filas | 49 % | 64 % (p<0,001) |
| Fix: cambios propuestos sobre línea limpia | 52 de 170 | 8 de 170 (p<0,001) |
| Energía por sugerencia | 1.064 mJ | 715 mJ |
| Tiempo por sugerencia (mediana) | 34 ms | 22 ms |
| Descarga | 5,5 GB | 1,1 GB |

Precisión de primera palabra por idioma (%): en 25, ru 23, da 26, de 25, es 27, fr 23, it 23, nl 24, pl 24, pt 23, ro 22, sv 21, uk 19, cs 14, tr 12, zh 15, ar 10, ko 8, ja 9, he 2.

Un juez ciego evaluó 300 filas en inglés, ruso y danés: aceptó el 90 % de las continuaciones de este modelo, el 93 % de las del modelo de comparación y el 93 % del texto original (diferencia no significativa). En ruso, el juez aceptó el 83 % frente al 95 % de Gemma 4 E2B 4-bit (p=0,004).

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 1,2 GB (tamaño del repositorio cuantizado a 5 bits), más overhead del runtime; el autor reporta 1,1 GB por archivo de pesos.
- Hardware recomendado: Mac con Apple Silicon (el autor mide sobre un M4 Max). No hay datos para GPU NVIDIA.
- Consumer GPUs: no aplicable directamente, ya que el formato MLX está pensado para Apple Silicon; el modelo base EuroLLM-1.7B sí puede ejecutarse en GPUs de consumo si se obtiene en otro formato.
- Despliegue: mlx-lm (librería indicada en la model card, con ejemplo de uso mediante `mlx_lm.load` y `mlx_lm.generate`). No se mencionan vLLM, llama.cpp, Ollama ni TGI para esta variante cuantizada.
- Latencia y throughput: mediana de 22 ms por sugerencia en M4 Max; consumo energético de 715 mJ por sugerencia medido con `powermetrics` (CPU, GPU y Neural Engine, menos línea base de reposo).

## Comparativa con modelos similares

| Modelo | Parametros | Formato/tamaño | Contexto | Licencia | Punto fuerte |
|---|---|---|---|---|---|
| EuroLLM-1.7B-Pretype-5bit | 1,66 B | MLX 5-bit, 1,1 GB | no disponible | Apache-2.0 | Corrección de erratas (64 % vs 49 %) y bajo consumo (715 mJ) |
| Gemma 4 E2B 4-bit (comparación del autor) | no disponible | 4-bit, 2,5 GB (3,0 GB instruct) | no disponible | no disponible | Mejor autocompletado en inglés (27,5 % vs 24,6 %) y ruso más natural |
| utter-project/EuroLLM-1.7B (modelo base) | 1,7 B | bf16 | no disponible | Apache-2.0 | Modelo multilingüe generalista sin especializar en autocompletado/corrección |

## Limitaciones y advertencias

- No usar para chat, respuestas, traducción ni reescritura: el entrenamiento de corrección induce a repetir la entrada. El autor documenta que copió el prompt en el 17 % de conversaciones sin borrador y en el 43 % con borrador, y que ante instrucciones de reescritura devolvió el texto casi sin cambios en 8 de 8 ejemplos.
- Hebreo prácticamente inservible: el vocabulario solo contiene 34 tokens con letras hebreas; la primera palabra fue correcta en 6 de 255 sugerencias. La app Pretype desactiva las sugerencias en hebreo con este modelo.
- Rendimiento en inglés inferior al modelo de comparación (24,6 % frente a 27,5 %, p=0,015) y ruso menos natural según juez ciego (83 % frente a 95 %, p=0,004).
- Las sugerencias largas son más cortas que las de modelos comparables: 6,5 palabras de media frente a 10-11.
- Idiomas asiáticos y árabe con rendimiento muy bajo (zh 15 %, ar 10 %, ko 8 %, ja 9 %, he 2 %).
- No hay datos públicos de benchmarks estándar (MMLU, HumanEval, GSM8K); las métricas provienen del harness propio del autor y no son directamente comparables con evaluaciones de terceros.
- El formato MLX restringe el despliegue a hardware Apple Silicon; no es ejecutable de forma nativa con CUDA.
- Riesgo de alucinación en autocompletado: como todo modelo de lenguaje, puede generar continuaciones plausibles pero incorrectas; el autor mitigó cambios injustificados en la tarea de corrección (8 de 170 líneas limpias alteradas), pero no hay garantía absoluta.
- Descargas muy bajas (3 en el momento de la ficha) y sin auditoría independiente: conviene validar en el propio caso de uso antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikimoriOne/EuroLLM-1.7B-Pretype-5bit
- Modelo base: https://huggingface.co/utter-project/EuroLLM-1.7B
- Modelo profesor (destilación): https://huggingface.co/utter-project/EuroLLM-9B
- Aplicación Pretype: https://github.com/nikiomori/Pretype
