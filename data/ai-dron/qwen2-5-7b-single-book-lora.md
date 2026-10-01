# Ai-dron/qwen2.5-7b-single-book-lora

# Qwen2.5-7B single-book LoRA (Ai-dron)

## Resumen
Se trata de un adaptador LoRA (librería PEFT) entrenado sobre el modelo base Qwen2.5-7B-Instruct y publicado por el usuario Ai-dron. El adaptador no es un modelo generalista: está especializado en una única monografía científica, «Відбитки текстилю на кераміці трипільської культури з поселення Кісниця на півдні Вінниччини» (Instituto de Arqueología de la Academia Nacional de Ciencias de Ucrania, 2025, 184 páginas, en ucraniano, DOI 10.5281/zenodo.15574258), sobre improntas textiles en cerámica de la cultura Trypilia. El objetivo declarado del autor es doble: que el modelo aprenda el contenido del libro y que no invente hechos que no figuran en él.

El valor técnico de la ficha no está en el rendimiento absoluto, sino en la metodología: el autor mide simultáneamente tres números (conocimiento, invenciones y rechazos sobrantes), compara cinco configuraciones de entrenamiento sobre un test congelado con hash SHA-256 y advierte de que el azar puro obtiene 12 de 100 en la métrica de conocimiento. Ninguna configuración alcanza el umbral objetivo fijado en el piloto (conocimiento ≥ 34, invenciones ≤ 2, rechazos sobrantes ≤ 2 a la vez). El adaptador con mejores resultados (E) llega a 26 de 100 de conocimiento y 7 invenciones sobre 60.

El repositorio ocupa 1,3 GB, tiene licencia Apache-2.0, solo declara ucraniano como idioma y, en el momento de la consulta, registra 0 descargas y 0 «likes», por lo que no existe validación externa de la comunidad. Se publica como adaptador, no como pesos fusionados, y su uso previsto es la consulta del catálogo de la monografía, no tareas generales.

## Especificaciones tecnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only denso: Qwen2.5-7B-Instruct |
| Parámetros totales | No disponible para el adaptador; el modelo base se denomina Qwen2.5-7B-Instruct. El repositorio ocupa 1,3 GB |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la ficha del adaptador; la determina el modelo base Qwen2.5-7B-Instruct |
| Tipos de cuantización | Adaptador en safetensors (fp16 por el flujo declarado); la evaluación se realizó tras fusionar y convertir a GGUF en Q8_0. Las etiquetas mencionan QLoRA en el entrenamiento |
| Idiomas soportados | Ucraniano (uk) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador); GGUF Q8_0 tras la fusión para su uso con ollama |
| Rango de LoRA | 16 (adaptadores A y B) y 64 (adaptadores C y E) |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Librería | peft |
| Ejemplos de entrenamiento | 1030 (conjunto A), 1208 (conjunto B), 6412 (adaptador C), 7198 (adaptador E) |
| Descargas y valoraciones | 0 descargas, 0 «likes» en el momento de la consulta |
| Fecha de publicación | 1 de octubre de 2026 (creación y última actualización el mismo día) |

## Arquitectura y entrenamiento
El artefacto es un adaptador LoRA de rango 16 o 64 sobre Qwen2.5-7B-Instruct, entrenado según las etiquetas del repositorio con QLoRA. La innovación metodológica no está en la arquitectura, sino en la construcción del corpus: el catálogo de la monografía se parseó de forma determinista con expresiones regulares, no con un modelo, porque la estructura de los registros es rígida. El resultado son 43 muestras y 602 hechos, cada uno con el número de página del PDF, con una cobertura del 87,3 % del texto por posición. Al no generarse datos sintéticos, el autor sostiene que no hay hechos inventados por construcción.

Se emplearon dos conjuntos: A (1030 ejemplos, solo preguntas directas) y B (1208 ejemplos, con aproximadamente un 25 % de formas «giradas», formuladas sobre muestras distintas a las del test). Ambos mezclan respuestas sobre el libro, límites de conocimiento (rechazos honestos) y preguntas prácticas ajenas al libro. El pipeline de evaluación es explícito: fp16 → LoRA → merge → GGUF → Q8_0 → ollama → 175 preguntas, aplicado también al modelo base para que la comparación no sea en realidad una comparación entre cuantizaciones. El test está congelado antes del entrenamiento, con SHA-256 `33fe47cf599faa707d8a50688961729e882f0c9ad9450e178463d044f27333e2`, y el evaluador se autovalida contra un conjunto anotado a mano antes de emitir cifras.

## Capacidades
- Respuesta a preguntas sobre el catálogo de una monografía arqueológica concreta, con conocimiento medido de 24-26 puntos sobre 100 en el mejor de los casos.
- Manejo de distintas formas de pregunta: existencia (11 aciertos de 14 en el adaptador E), diferencia (4 de 26), búsqueda inversa (5 de 24), agregados (5 de 12) y contexto del libro (1 de 8).
- Rechazo calibrado cuando la información no figura en el libro, con 0 rechazos sobrantes sobre 15 preguntas prácticas en los adaptadores B, C y E.
- Reducción de invenciones frente al modelo base: de 32 aciertos falsos sobre 60 en la base a 5-7 en los adaptadores C y E.
- Generación de texto en ucraniano, idioma único declarado y único idioma medido.
- No declara soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- No mejora el comportamiento fuera del dominio del libro; el propio autor lo indica de forma explícita.
- Listados y preguntas de extremo: 0 aciertos en las formas «перелік» y «екстремум» en todos los adaptadores evaluados.

## Casos de uso
- Consulta de catálogo arqueológico: un investigador pregunta por la presencia, ausencia o características de una de las 43 muestras y el adaptador responde a partir de los 602 hechos extraídos, con la ventaja de que el corpus de origen es determinista y trazable a una página del PDF.
- Asistente de apoyo a la lectura de la monografía: para preguntas de existencia, que es la forma con mejor rendimiento (11 de 14 en el adaptador E), resulta útil como índice interrogable, no como sustituto de la lectura.
- Ejemplo reproduciblede calibración de rechazos: el flujo completo (test congelado con hash, evaluador autovalidado, 175 preguntas y 15 casos prácticos) sirve como plantilla para proyectos que necesiten medir alucinación en dominios acotados.
- Demostración docente sobre ajuste fino eficiente: al incluir cinco configuraciones comparadas (rangos 16 y 64, 1030 a 7198 ejemplos), permite ilustrar el efecto del tamaño del conjunto y del rango de LoRA en un caso real y con datos públicos.
- Preprocesado asistido en arqueología cerámica: el modelo puede responder sobre formas, motivos o contextos registrados en el catálogo, siempre que la pregunta se ajuste a las formas con cobertura medida.
- Difusión en ucraniano: generación de resúmenes o respuestas divulgativas en ucraniano sobre el contenido del libro, con la advertencia de que no se ha medido el comportamiento en otros idiomas.
- Integración en un sistema RAG: dado que el adaptador no cubre el texto completo del libro, el uso razonable en producción es combinarlo con recuperación documental, delegando en el modelo la formulación y el rechazo cuando el contexto no baste.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras disponibles proceden de un test propio congelado de 175 preguntas, con el sistema de evaluación descrito en la model card:

| Configuración | Conocimiento (sobre 100) | Invenciones (sobre 60) | Rechazos sobrantes (sobre 15) | Corrección manual | Control con prompt neutro |
|---|---|---|---|---|---|
| Base Qwen2.5-7B-Instruct | 3 | 32 | 0 | 0 | 1 de 30 |
| Adaptador A (1030 ejemplos, rango 16, solo formas directas) | 11 | 12 | 1 | 0 | 1 de 30 |
| Adaptador B (1030 ejemplos, rango 16, con formas giradas) | 11 | 13 | 0 | 0 | 2 de 30 |
| Adaptador C (6412 ejemplos, rango 64, todas las formas) | 24 | 5 | 0 | 0 | 6 de 30 |
| Adaptador E (7198 ejemplos, rango 64, con rechazos por magnitudes) | 26 | 7 | 0 | 1 | 6 de 30 |

Umbral objetivo fijado en el piloto: conocimiento ≥ 34, invenciones ≤ 2 y rechazos sobrantes ≤ 2 de forma simultánea. Ninguna configuración lo cumple. El autor advierte además de que una estrategia de adivinación simple (una constante por forma de pregunta, ajustada en el conjunto de desarrollo) obtiene 12 de 100, por lo que la métrica de conocimiento debe leerse con esa corrección.

| Forma de pregunta | Preguntas | Base | A | B | C | E |
|---|---|---|---|---|---|---|
| Diferencia («різниця») | 26 | 0 | 7 | 7 | 3 | 4 |
| Búsqueda inversa | 24 | 0 | 0 | 0 | 6 | 5 |
| Existencia | 14 | 2 | 4 | 2 | 10 | 11 |
| Agregado | 12 | 0 | 0 | 0 | 5 | 5 |
| Listado | 10 | 0 | 0 | 0 | 0 | 0 |
| Contexto del libro | 8 | 1 | 0 | 2 | 0 | 1 |
| Extremo | 6 | 0 | 0 | 0 | 0 | 0 |

## Requisitos de hardware
- El adaptador en safetensors requiere cargar el modelo base Qwen2.5-7B-Instruct para funcionar; el repositorio del adaptador ocupa 1,3 GB, pero no es autónomo.
- Estimación orientativa para el modelo base de 7B en fp16 (no publicada por el autor): en torno a 15-16 GB solo de pesos, más caché KV. Encaja con holgura en A100 40 GB y H100, y de forma ajustada en una RTX 4090 de 24 GB.
- Con cuantización Q8_0, la configuración exacta que usó el autor para medir: en torno a 8 GB de VRAM, viable en RTX 3060 de 12 GB, RTX 4070/4080/4090 y equipos Apple Silicon con 16 GB o más de memoria unificada.
- Con cuantizaciones de 4 bits (Q4_K_M y similares), en torno a 4,5-5 GB, viable en GPUs de 8 GB, aunque el autor no midió el modelo en ese formato y advierte de que comparar cuantizaciones distintas invalida la comparación.
- Despliegue: el flujo documentado es ollama, con `ollama create qwen-kisnytsia -f Modelfile` y `ollama run qwen-kisnytsia`. Al ser un adaptador PEFT, también son opciones razonables llama.cpp o vLLM con soporte de LoRA, aunque no se documentan en la ficha.
- Latencia y throughput: no disponible. La model card no publica tiempos de inferencia, tokens por segundo ni consumo medido.
- El prompt de sistema con el que se obtuvieron las cifras está en `evidence/паспорт_датасета2.json`; con otro prompt los números cambian, según el autor. Temperatura 0, semilla y límite de longitud fijados de forma idéntica entre base y adaptadores.

## Comparativa con modelos similares
No se dispone de información sobre otros adaptadores de la misma categoría (ajuste fino sobre una única obra) con los que comparar. La comparación disponible es interna, entre el modelo base y las cuatro configuraciones del adaptador:

| Configuración | Rango LoRA | Ejemplos | Conocimiento (/100) | Invenciones (/60) | Rechazos sobrantes (/15) | Licencia |
|---|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct (base) | No aplica | No aplica | 3 | 32 | 0 | Apache-2.0 (del modelo base) |
| Adaptador A | 16 | 1030 | 11 | 12 | 1 | Apache-2.0 |
| Adaptador B | 16 | 1208 | 11 | 13 | 0 | Apache-2.0 |
| Adaptador C | 64 | 6412 | 24 | 5 | 0 | Apache-2.0 |
| Adaptador E | 64 | 7198 | 26 | 7 | 0 | Apache-2.0 |

Frente a un hipotético ajuste fino completo del mismo corpus, no hay datos publicados que permitan comparar. Frente a soluciones de recuperación documental (RAG) sobre el mismo libro, tampoco se ofrecen cifras.

## Limitaciones y advertencias
- El adaptador no sustituye al libro: las 100 preguntas de conocimiento cubren el catálogo y los capítulos de repaso, no la totalidad del texto.
- No mejora a la base en ninguna tarea ajena al libro; es un especialista de dominio único.
- Está entrenado sobre texto en ucraniano y su comportamiento en otros idiomas no se ha medido.
- Ninguna configuración alcanza el umbral objetivo del piloto: el mejor resultado es 26 de 100 de conocimiento frente al objetivo de 34.
- El conocimiento medido sin corrección es engañoso: una estrategia de adivinación simple obtiene 12 de 100, y el propio autor indica que la cifra no debe leerse sin esa corrección.
- La base no presenta un «cero falso»: con un prompt neutro sin instrucciones de honestidad acierta 1 de 30, de modo que un cero de conocimiento obtenido con la instrucción de rechazar no demuestra desconocimiento.
- Persisten invenciones: 5 a 7 respuestas falsas sobre 60 en los mejores adaptadores, y 12-13 en los de rango 16.
- Formas de pregunta sin cobertura: listados y extremos obtienen 0 aciertos en todas las configuraciones.
- El test es pequeño (175 preguntas en total: 100 de conocimiento, 60 de invención, 15 prácticas) y ha sido diseñado por el mismo autor del adaptador, sin revisión externa.
- Licencia del corpus de origen: el autor señala que la obra está «publicada bajo una CC BY 4.0 declarada», no que la licencia esté verificada, porque Zenodo no comprueba las facultades del depositante y el propietario del registro en la API es un identificador numérico anónimo. La respuesta de la API se conserva como evidencia en el repositorio de código.
- Licencia del artefacto: Apache-2.0, que permite uso comercial, pero sujeta a las condiciones de la licencia del modelo base y del texto de origen.
- Sin validación de la comunidad: 0 descargas y 0 «likes» en el momento de la consulta, con publicación y última actualización el mismo día.
- Los resultados dependen del prompt de sistema empleado; con otro prompt las cifras varían.
- El adaptador se publica sin fusionar, por lo que exige gestionar por separado el modelo base y el adaptador, y no se documentan opciones de despliegue distintas de ollama.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/Ai-dron/qwen2.5-7b-single-book-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Obra de origen (DOI declarado): https://doi.org/10.5281/zenodo.15574258
- Repositorio de código, parser del libro, evaluador y evidencias: mencionado en la model card, URL no disponible en la información proporcionada
- Test congelado, hash SHA-256, respuestas de los modelos y análisis de cada respuesta: carpeta `evidence/` del repositorio de HuggingFace
- Prompt de sistema usado en la evaluación: `evidence/паспорт_датасета2.json` del repositorio de HuggingFace
- Paper, blog o demo adicionales: no disponible en la información proporcionada
