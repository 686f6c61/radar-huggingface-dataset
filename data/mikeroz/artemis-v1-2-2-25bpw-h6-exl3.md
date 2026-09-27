# MikeRoz/Artemis-v1.2-2.25bpw-h6-exl3

## Resumen

Artemis-v1.2-2.25bpw-h6-exl3 es una cuantización en formato EXL3 (ExLlamaV3) del modelo TheDrummer/Artemis-31B-v1.2, publicada por el usuario MikeRoz en Hugging Face. No es un modelo entrenado desde cero, sino una conversión de pesos a 2,25 bits por peso (variante h6) que deja el repositorio en 11,761 GiB, pensada para ejecutar el modelo base en GPUs con menos VRAM que la necesaria para los pesos completos.

El modelo de origen es un ajuste orientado a roleplay: la model card menciona el uso de la plantilla de "Gemma 4 31B" en modo thinking o no-thinking, y afirma que el modo thinking resulta especialmente afilado para RP. Las etiquetas del repositorio incluyen `gemma4` y `exl3`, y la relación declarada con el modelo base es `quantized`. La model card original está marcada como WIP, por lo que la documentación es mínima.

Su relevancia es práctica: permite probar un modelo de gama 31B en GPUs de consumo con 12-16 GiB de VRAM mediante el runtime exllamav3, a costa de una cuantización agresiva. El repositorio tenía 0 descargas y 0 me gusta en el momento de la consulta, es decir, es una publicación reciente y sin validación comunitaria documentada. La búsqueda web realizada no devolvió ninguna fuente relevante sobre el modelo (solo páginas de ayuda de Facebook sin relación).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la describe; las etiquetas `gemma4` y la mención a "Gemma 4 31B template" apuntan a la familia Gemma, sin confirmación explícita) |
| Parametros totales | 6.297.374.956 según los metadatos de safetensors del repositorio cuantizado; el modelo base se denomina "31B" y la discrepancia no se explica en la documentación disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 (exllamav3): 2,25 bpw con sufijo h6 (11,761 GiB, este repositorio); el mismo autor publica 4,00 bpw h6 (17,730 GiB) y 6,00 bpw h8 (24,877 GiB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (tampoco consta la del modelo base en la información proporcionada) |
| Formato de pesos | safetensors en formato EXL3; requiere exllamav3-v1.5.1 o superior |

## Arquitectura y entrenamiento

No hay información sobre la arquitectura interna del modelo base en la documentación disponible: ni número de capas, ni tipo de atención, ni si emplea mezcla de expertos, ni la composición del dataset de entrenamiento. Lo único que puede afirmarse con la información proporcionada es que el modelo base fue ajustado con una plantilla de chat de la familia Gemma y que soporta un modo de razonamiento (thinking) y otro directo (non-thinking). La model card se limita a indicar que "puede ser necesario ajustar los samplers" y que el modo thinking de Gemma es muy bueno para roleplay.

Lo que sí está documentado es el proceso de cuantización: pesos convertidos con EXL3 usando el commit `12414d0` de la rama de desarrollo de exllamav3, con 2,25 bits por peso y la configuración identificada como `h6`. El significado exacto del sufijo `h6` (asignación de bits por capa, bits de cabecera u otra parametrización del cuantizador) no se detalla en la información disponible. No hay datos sobre fine-tuning posterior, RLHF, DPO ni sobre el volumen de tokens de entrenamiento.

## Capacidades

- Generación de texto conversacional y narrativo, con orientación declarada a roleplay (RP).
- Modo thinking y modo no-thinking, seleccionables mediante la plantilla de chat de Gemma 4 31B.
- Escritura creativa y mantenimiento de personajes en conversaciones multi-turno, según la model card.
- Sensibilidad a la configuración de muestreo: el autor advierte de que puede requerir "sampler wrangling" o ajustes conservadores, y enlaza una hoja de cálculo colaborativa de samplers.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Visión, audio u otras modalidades: no disponible.

## Casos de uso

- Roleplay y narrativa interactiva en local: la model card afirma que el modo thinking de la base es especialmente bueno para RP, y con 11,761 GiB de pesos el modelo se puede mantener residente en una GPU de 16-24 GB mientras se conversa.
- Asistente conversacional privado en estación de trabajo: al ejecutarse íntegramente en local con exllamav3, ninguna conversación sale de la máquina, lo que encaja en entornos con requisitos de confidencialidad.
- Generación de diálogos y guiones: en modo no-thinking puede producir turnos de diálogo de forma más directa, útil para borradores de guion o para prototipos de videojuego con personajes conversacionales.
- Prototipado de producto conversacional: permite iterar sobre prompts, plantillas y samplers con un coste de VRAM bajo antes de decidir si se migra a la variante de 4,00 o 6,00 bpw del mismo autor.
- Evaluación comparativa de cuantizaciones: al existir tres variantes del mismo modelo base (2,25 / 4,00 / 6,00 bpw), se puede medir la degradación de calidad entre ellas sobre el mismo conjunto de prompts y decidir el compromiso tamaño-calidad.
- Inferencia autoalojada con API compatible con OpenAI: desplegando el modelo sobre exllamav3 con un servidor como TabbyAPI, un equipo pequeño puede ofrecer un endpoint de chat interno sin depender de proveedores externos.
- Experimentación en GPUs de gama consumer: para investigadores que quieran estudiar el comportamiento del modo thinking de la familia Gemma en un modelo de 31B sin acceso a GPUs de 40-80 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La búsqueda web asociada tampoco devolvió ningún resultado relacionado con el modelo, por lo que no hay cifras de MMLU, HumanEval, GSM8K ni de evaluaciones de roleplay que se puedan citar sin inventarlas.

## Requisitos de hardware

- Tamaño de los pesos: 11,761 GiB para la variante de 2,25 bpw (frente a 17,730 GiB a 4,00 bpw y 24,877 GiB a 6,00 bpw).
- VRAM estimada: al menos ~12 GiB solo para los pesos; hay que sumar la caché KV y el overhead del runtime, por lo que se recomienda apuntar a 14-16 GiB o más para contextos cortos. Es una estimación derivada del tamaño de archivo, no una cifra publicada por el autor.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) con margen holgado; RTX 4080, RTX 4070 Ti Super o similares de 16 GB de forma ajustada y con contexto reducido; A100 y H100 sin problema. Sí cabe en GPU de consumo, en particular en cualquier tarjeta de 24 GB o más.
- Opciones de despliegue: el backend nativo es exllamav3 (se exige la versión 1.5.1 o superior, cuantizado con el commit `12414d0` de la rama dev). También puede servirse a través de servidores que envuelven exllamav3 con API compatible con OpenAI. El formato EXL3 no es portable a llama.cpp, Ollama, GGUF, TGI ni vLLM.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano en disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Artemis-v1.2-2.25bpw-h6-exl3 (este) | 6.297.374.956 según safetensors; base nominal 31B | no disponible | 11,761 GiB | no disponible | Hugging Face, 0 descargas |
| Artemis-v1.2-4.00bpw-h6-exl3 (mismo autor) | no disponible | no disponible | 17,730 GiB | no disponible | Hugging Face |
| Artemis-v1.2-6.00bpw-h8-exl3 (mismo autor) | no disponible | no disponible | 24,877 GiB | no disponible | Hugging Face |
| TheDrummer/Artemis-31B-v1.2 (pesos originales) | 31B nominal | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de información sobre modelos comparables de otros autores (otras variantes de la familia Gemma, modelos de roleplay de tamaño similar u otras cuantizaciones EXL3 del mismo base) en la información proporcionada, y la búsqueda web no aportó ninguna referencia utilizable.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Antes de desplegarlo en producción hay que verificar la licencia del modelo base en su repositorio original.
- Cuantización agresiva: 2,25 bits por peso implica una pérdida de calidad medible frente a las variantes de 4,00 y 6,00 bpw. No hay evaluaciones publicadas que cuantifiquen esa pérdida.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño, y presumiblemente mayor en un modelo orientado a roleplay que en uno ajustado para precisión factual.
- Ausencia de validación comunitaria: 0 descargas y 0 me gusta en el momento de la consulta; no hay informes de terceros sobre su comportamiento real.
- Dependencia de versiones concretas: exige exllamav3-v1.5.1 o superior y fue cuantizado con un commit de la rama de desarrollo, lo que puede causar incompatibilidades si el formato cambia.
- Formato propietario: EXL3 solo funciona con el stack exllamav3; no se puede cargar en llama.cpp, Ollama, vLLM o TGI sin reconvertir el modelo.
- Idiomas no documentados: no se puede asumir un buen rendimiento en castellano ni en ningún otro idioma distinto del que use la plantilla original.
- Longitud de contexto desconocida: no se puede planificar un caso de uso que dependa de ventanas largas sin verificar el valor real del modelo base.
- Discrepancia de parámetros: los metadatos de safetensors indican 6.297.374.956 parámetros mientras el modelo base se anuncia como "31B". Conviene resolver esta discrepancia antes de hacer estimaciones de capacidad o de coste.
- Model card incompleta: la documentación original está marcada como WIP y no describe arquitectura, datos de entrenamiento ni evaluación.
- Ajuste de muestreo necesario: el propio autor advierte de que puede requerirse afinar los samplers, lo que añade trabajo de integración en un producto.

## Enlaces

- Repositorio del modelo: https://huggingface.co/MikeRoz/Artemis-v1.2-2.25bpw-h6-exl3
- Modelo base: https://huggingface.co/TheDrummer/Artemis-31B-v1.2
- Cuantización 4,00bpw h6: https://huggingface.co/MikeRoz/TheDrummer/Artemis-31B-v1.2-4.00bpw-h6-exl3
- Cuantización 6,00bpw h8: https://huggingface.co/MikeRoz/TheDrummer/Artemis-31B-v1.2-6.00bpw-h8-exl3
- Hoja de samplers colaborativa citada en la model card: https://docs.google.com/spreadsheets/d/1wil6YEHTnQP3DO9EF35ImQMY3lbmRt5_ns-LJavUqwQ
- Formulario para compartir samplers: https://docs.google.com/forms/d/e/1FAIpQLSfeiOeLbNt-xc8tr0BopJ4KawMm3YrLGD5mYLjZqg8ehl35BQ/viewform
- Nota sobre la búsqueda web: no se encontró ninguna fuente relevante sobre este modelo; los resultados devueltos correspondían a páginas de ayuda de Facebook sin relación con el contenido.
