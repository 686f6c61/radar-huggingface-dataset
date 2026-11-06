# Convergent-ch/Alpina-Endas-2.2-AoM-5B-Small

## Resumen

Alpina Endas 2.2-AoM-5B-Small es un artefacto experimental publicado por Convergent-ch que se presenta como un "modelo agregado" (AoM, *aggregate of models*) de 5,29 mil millones de parámetros totales. No se trata de una red densa de 5B ni de un mixture-of-experts convencional, sino de un contenedor de 169 miembros almacenados por separado: un Input-Divisor derivado de Alpina Big 2.0 (299,4 M de parámetros) que actúa como enrutador y 168 copias de especialistas derivados de Alpina Small 2.0 (29,7 M de parámetros cada uno), agrupados en seis familias (matemáticas, código, lenguaje, física, lógica y química). Las copias dentro de cada familia parten de pesos idénticos, de modo que solo existen siete conjuntos de pesos realmente aprendidos.

El modelo aborda un problema de ingeniería más que de capacidad: explorar si un enrutador de entrada puede coordinar varios especialistas pequeños entrenados por separado para resolver tareas de distintos dominios, manteniendo el coste de almacenamiento bajo gracias a la deduplicación de pesos. Toda la cadena de entrenamiento se realizó localmente en una única RTX 3060 Ti, partiendo de los modelos base Alpina Small 2.0 (30M) y Alpina Big 2.0 (300M) del mismo autor.

Es relevante ahora únicamente como pieza de investigación reproducible sobre orquestación de modelos y empaquetado GGUF, no como modelo de producción: el propio autor advierte que la configuración Small "a menudo da respuestas incorrectas o irrelevantes", que el contexto de inferencia está fijado en 512 tokens y que el launcher para Ollama es una extensión no oficial del proyecto, no Ollama upstream.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Agregado de modelos (AoM): 1 Input-Divisor tipo Alpina Big 2.0 + 168 especialistas tipo Alpina Small 2.0, coordinados por enrutamiento de entrada |
| Parámetros totales | 5.288.962.048 (5,29B) agregados; 299.410.432 en el Input-Divisor y 29.699.712 por especialista |
| Parámetros activos | No aplica como MoE denso; por consulta se ejecutan el Input-Divisor y los especialistas seleccionados (6 llamadas en modo Medium, 170 en modo Small) |
| Longitud de contexto | 512 tokens por defecto y máximo configurado en esta release; la fuente Big Input-Divisor soporta 2048, no usado aquí |
| Tipos de cuantización | Q8_0 (exportación estándar de todos los miembros) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (169 archivos Q8_0 empaquetados en ZIP de 5,67 GB); repositorio principal de 0,0 GB sin pesos Safetensors publicados |

## Arquitectura y entrenamiento

La arquitectura es un agregado de modelos con enrutamiento por entrada. Un Input-Divisor de 299,4 M de parámetros recibe la consulta y decide qué familia de especialistas debe atenderla; cada especialista es un transformer pequeño de 29,7 M de parámetros derivado de Alpina Small 2.0. El despliegue real en Ollama ejecuta cada miembro de forma individual: los archivos GGUF no incorporan orquestación automática de grupo dentro de Ollama, sino que el launcher del proyecto (extensión CLI no oficial) realiza las llamadas y cachea los siete conjuntos de pesos aprendidos, ya que las copias dentro de una familia son idénticas.

El entrenamiento consistió en seis finetunings de especialista más un finetuning del Input-Divisor, todos ejecutados localmente en una RTX 3060 Ti y partiendo de los modelos previos del autor. Los datos son heterogéneos y de escala reducida: matemáticas con aritmética generada elemental más ejemplos de entrenamiento de GSM8K; código con funciones Python cortas generadas y ejemplos de self-oss-instruct; lenguaje con conversaciones cotidianas de HuggingFaceTB/smoltalk. La model card no documenta número total de tokens, composición exacta del dataset ni uso de RLHF o DPO. No se describe ninguna innovación de atención (attention linear, decodificación especulativa) más allá del propio esquema de agregación y deduplicación de pesos.

## Capacidades

- Generación de texto en inglés con especialización por dominio mediante enrutamiento: matemáticas, código, lenguaje conversacional, física, lógica y química.
- Razonamiento aritmético elemental y resolución de problemas estilo GSM8K a través del especialista de matemáticas.
- Generación de funciones Python cortas mediante el especialista de código.
- Conversación multi-turno básica mediante el especialista de lenguaje, limitada por el contexto de 512 tokens.
- Enrutamiento de consultas por dominio mediante el Input-Divisor, con coordinación externa a cargo del launcher del proyecto.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso nativo.
- No dispone de visión, audio ni modo thinking.
- Multilingüismo: solo inglés.

## Casos de uso

- Investigación sobre orquestación de modelos: el artefacto permite estudiar empíricamente cómo un enrutador pequeño distribuye consultas entre especialistas y qué pierde respecto a un modelo denso del mismo presupuesto, usando los 169 GGUF y el manifiesto de miembros incluidos en el ZIP.
- Reproducción de pipelines de entrenamiento de bajo coste: sirve como referencia completa de un flujo de seis finetunings de especialista más un finetuning de enrutador ejecutado íntegramente en una RTX 3060 Ti, con los modelos base de 30M y 300M disponibles públicamente.
- Evaluación de empaquetado GGUF y deduplicación de pesos: el esquema de siete conjuntos de pesos únicos frente a 169 copias (0,51 GB frente a 5,67 GB) es un caso práctico para medir costes de almacenamiento y de carga en caché en despliegues Ollama.
- Pruebas de arnés de evaluación de calidad: dado que el autor reconoce respuestas incorrectas frecuentes en modo Small, el modelo es útil como caso negativo controlado para validar pipelines de evaluación de exactitud en matemáticas y código.
- Docencia sobre límites de los modelos agregados: permite ilustrar en un aula o laboratorio por qué agregar especialistas de 30M con contexto de 512 tokens no equivale a escalar parámetros, comparando las 6 llamadas del modo Medium con las 170 del modo Small.
- Experimentos de enrutamiento con contexto corto: útil para prototipar clasificadores de dominio sobre consultas de menos de 512 tokens antes de trasladar el diseño a especialistas mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica que las comprobaciones de runtime verifican la ejecución, no la calidad de las respuestas, y que el modo Small "a menudo da respuestas incorrectas o irrelevantes".

## Requisitos de hardware

- VRAM estimada para inferencia: los siete GGUF únicos suman aproximadamente 0,51 GB en Q8_0; el conjunto completo de 169 miembros ocupa 5,67 GB en disco, aunque en ejecución solo se cargan los pesos de los miembros invocados, con caché de los siete conjuntos aprendidos.
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM libre es suficiente para los especialistas de 29,7 M y el Input-Divisor de 299,4 M; el entrenamiento original se realizó en una RTX 3060 Ti.
- Cabe en GPU consumer: sí, en tarjetas de gama media y baja; no se requiere A100 ni H100.
- Opciones de despliegue: Ollama (miembros individuales vía `ollama create` con los Modelfiles incluidos, o el launcher de proyecto para Windows x64 que coordina el AoM completo); llama.cpp es compatible por el formato GGUF, aunque no se documenta explícitamente. No se mencionan vLLM ni TGI.
- Latencia y throughput: no disponibles. El modo Small implica 170 llamadas por consulta y el modo Medium 6 llamadas, lo que condiciona fuertemente la latencia, pero no se publican medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Alpina Endas 2.2-AoM-5B-Small | 5,29B agregados (169 miembros; 7 conjuntos de pesos) | 512 | Apache 2.0 | GGUF en Hugging Face, launcher Windows no oficial | Experimental; calidad declarada baja por el autor |
| Alpina Big 2.0 | 299,4 M | 2048 en la fuente | No disponible en la información | Modelo base del Input-Divisor | Modelo denso único, sin agregación |
| Alpina Small 2.0 | 29,7 M | No disponible | No disponible en la información | Modelo base de los especialistas | Modelo denso único, sin agregación |
| Alpina Endas 2.2-AoM-10B-Medium | 10B agregados (release relacionada) | No disponible | No disponible en la información | Hugging Face | Variante mayor del mismo esquema AoM |

No se dispone de datos de benchmarks ni de modelos externos comparables documentados en la información proporcionada.

## Limitaciones y advertencias

- Calidad declarada insuficiente: el autor afirma explícitamente que el modo Small a menudo produce respuestas incorrectas o irrelevantes; no debe usarse en producción sin evaluación propia.
- No es un modelo denso de 5B ni 169 especialistas independientes: las copias dentro de cada familia comparten pesos idénticos, por lo que la diversidad real es de siete conjuntos aprendidos.
- Contexto muy limitado: 512 tokens por defecto y máximo en esta release, insuficiente para conversaciones largas, documentos o código extenso.
- Solo inglés: no hay soporte multilingüe documentado.
- Riesgo de alucinación elevado por el tamaño de los especialistas (29,7 M) y por el entrenamiento con datos generados sintéticamente y de escala reducida.
- Sesgos: no documentados; la ausencia de evaluación hace imposible caracterizarlos.
- Licencia Apache 2.0 permite uso comercial, pero el estado experimental y la baja calidad hacen desaconsejable ese uso.
- El launcher para Windows es una compilación no firmada y una extensión CLI no oficial de Ollama; no modifica el formato GGUF ni la GUI/API estándar, pero requiere instalar software de terceros con los riesgos asociados.
- La orquestación automática del AoM no está incluida en los GGUF: Ollama estándar ejecuta cada miembro por separado.
- El repositorio principal no contiene pesos Safetensors publicados (0,0 GB); los pesos solo están disponibles como GGUF Q8_0 en el repositorio de datasets.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Convergent-ch/Alpina-Endas-2.2-AoM-5B-Small
- Repositorio de pesos GGUF (169 miembros): https://huggingface.co/datasets/Convergent-ch/Alpina-Endas-2.2-AoM-5B-Small-GGUF
- Descarga del ZIP completo de GGUF: https://huggingface.co/datasets/Convergent-ch/Alpina-Endas-2.2-AoM-5B-Small-GGUF/resolve/main/Alpina-Endas-2.2-AoM-5B-Small-169-members-GGUF.zip?download=true
- Instalador Windows x64 del launcher AoM: https://huggingface.co/Convergent-ch/Alpina-Endas-2.2-AoM-5B-Small/resolve/main/runtime/Ollama-AoM-Setup-Windows-x64.exe?download=true
- Código fuente y checksums del launcher: https://huggingface.co/Convergent-ch/Alpina-Endas-2.2-AoM-5B-Small/resolve/main/runtime/Alpina-Ollama-AoM-Windows-x64.zip?download=true
- Release relacionada 10B-Medium: https://huggingface.co/Convergent-ch/Alpina-Endas-2.2-AoM-10B-Medium
- Modelo base Alpina Small 2.0: https://huggingface.co/Convergent-ch/Alpina-Small-2.0-30M
- Modelo base Alpina Big 2.0: https://huggingface.co/Convergent-ch/Alpina-Big-2.0-300M
