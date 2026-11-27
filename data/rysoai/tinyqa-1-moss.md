# RysoAI/tinyqa-1-moss

## Resumen

TinyQA-1 Moss es un sistema de respuesta a preguntas con recuperación (retrieval QA) desarrollado por RysoAI, lanzado en noviembre de 2026. No es un modelo generativo único, sino una canalización de pequeños codificadores transformer especializados que, trabajando en conjunto, localizan la frase exacta que responde a una pregunta dentro de un conjunto de documentos o resultados de búsqueda, la verifican y devuelven la cita textual junto con su fuente y un indicador de verificación.

El objetivo del modelo es ofrecer respuestas con fuente trazable en hardware mínimo: según el autor, funciona solo con CPU, ocupa unos 360 MB en fp32 para el núcleo de codificadores y tarda del orden de 250 ms por pregunta en un portátil. Está pensado para dispositivos restringidos, entornos sin conexión y para la recolección masiva de evidencias que luego pueden pasarse a modelos de lenguaje mayores.

La ruta principal de respuesta suma unos 89M de parámetros (ranker de 22M, verifier de 33M y reader de 33M), y con los tres decodificadores opcionales de 113M cada uno se alcanza un total de 429M. El modelo solo admite inglés, se distribuye bajo licencia Apache 2.0 y está publicado con pesos en safetensors y GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Canalización de codificadores transformer pequeños (cross-encoders) más decodificadores opcionales |
| Parametros totales | 113.314.560 (según safetensors); 89M en la ruta principal; 429M con los tres decodificadores opcionales |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q8_0 para los decodificadores opcionales; codificadores en fp32 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

Moss es una canalización de componentes con una tarea asignada a cada uno. El ranker (22M) ordena las frases candidatas por relevancia respecto a la pregunta; el verifier (33M) puntúa si una frase enuncia la respuesta y esa puntuación actúa como confianza; el reader (33M, basado en `deepset/minilm-uncased-squad2` y descargado en tiempo de ejecución) marca el fragmento exacto de respuesta dentro de la frase elegida. De forma opcional se añaden tres decodificadores de 113M en GGUF Q8_0: un verbalizador que redacta la línea de respuesta usando solo palabras presentes en la página, un decodificador de reserva y un planificador que reescribe consultas para reintentos.

El ranker y el verifier se afinan a partir de cross-encoders públicos de MS MARCO (el modelo declara como base `cross-encoder/ms-marco-MiniLM-L6-v2` y `cross-encoder/ms-marco-MiniLM-L12-v2`). Los decodificadores de 113M se preentrenan desde cero sobre texto educativo público y después se afinan. Los datos de entrenamiento provienen de fuentes públicas y de generación sintética, con filtrado y deduplicación posteriores. El autor declara que no se usaron preguntas de benchmarks en el entrenamiento, que las preguntas de entrenamiento del verifier excluyen los sujetos que aparecen en los benchmarks y que los sitios que alojan los benchmarks se excluyen como fuentes en tiempo de respuesta.

La verificación es una parte explícita del diseño: una respuesta se marca como verificada cuando el verifier la puntúa con 1,5 o más, o cuando tres fuentes independientes enuncian la misma respuesta corta y el verifier no la puntúa en contra. Los resultados no verificados se etiquetan como tales y nunca se presentan como la respuesta.

## Capacidades

- Respuesta a preguntas en modalidad open-book sobre resultados de búsqueda web o sobre un corpus local de documentos.
- Extracción de la cita textual exacta que responde a la pregunta, junto con el enlace a la fuente.
- Verificación de respuestas con puntuación de confianza y marca explícita de verificado o no verificado.
- Recuento de fuentes independientes que coinciden en la misma respuesta corta.
- Indexación de carpetas locales de archivos `.txt` y `.md`, o de ficheros `.jsonl` con registros `{"title", "text"}`, para funcionar sin conexión.
- Búsqueda web mediante DuckDuckGo sin clave de API, o Google mediante `SERPER_API_KEY` con reintentos condicionados por el verifier.
- Generación opcional de una línea de respuesta redactada por un decodificador de 113M, o mediante plantilla si no se instala llama.cpp.
- Funcionamiento exclusivo en CPU, sin necesidad de GPU.
- No dispone de tool calling, razonamiento multi-paso ni capacidades multimodales declaradas.

## Casos de uso

- Atención al cliente con base documental propia: se indexa la carpeta de manuales y FAQ en `.md` o `.txt` y el modelo devuelve la frase exacta del manual que responde a cada consulta, con enlace al documento, lo que permite auditar cada respuesta.
- Verificación de hechos a escala: con un coste de unos 250 ms por pregunta en CPU de portátil, se pueden procesar grandes volúmenes de consultas y recopilar millones de evidencias citadas para alimentar modelos de pronóstico o de razonamiento posteriores.
- Asistentes en dispositivos restringidos: al ocupar unos 360 MB en fp32 y no requerir GPU, cabe en placas de una sola placa y en equipos de bajo consumo para consultas sobre documentación local.
- Despliegue en intranet o entornos air-gapped: la indexación local y la ausencia de dependencia de red permiten responder preguntas sobre normativa interna o manuales de campo sin salida a Internet.
- Capa de recuperación previa a un LLM: Moss localiza y verifica las citas y el modelo grande solo recibe los resultados ya contrastados, lo que reduce el riesgo de alucinación en la respuesta final.
- Enriquecimiento de pipelines de búsqueda: el ranker y el verifier pueden usarse como etapa de reordenación y filtrado de frases candidatas antes de presentar resultados a un usuario.
- Generación de respuestas citadas en documentación técnica: con el verbalizador opcional se obtiene una línea de respuesta redactada únicamente con palabras presentes en la fuente, manteniendo la trazabilidad.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| SimpleQA Verified (split eval) | F-score (open-book, DuckDuckGo) | 77,1 |
| SimpleQA Verified (split eval) | Correct (open-book, DuckDuckGo) | 71,3 |

No se han publicado en la información disponible resultados de benchmarks comparativos con otros modelos.

## Requisitos de hardware

- VRAM: no requiere GPU; los codificadores del núcleo ocupan aproximadamente 360 MB en fp32.
- Cada decodificador opcional ocupa 117 MB en cuantización Q8_0.
- GPU recomendadas: ninguna; el modelo está diseñado para CPU.
- Cabe en cualquier GPU de consumo, pero no está pensado para usarla.
- Despliegue: script propio `moss.sh` (entorno Python 3.11 con dependencias fijadas e interfaz web local en `http://127.0.0.1:8091`); llama.cpp para la línea de respuesta escrita; biblioteca `sentence-transformers`.
- Latencia: unos 250 ms de cómputo por pregunta en CPU de portátil; con corpus local, una respuesta completa tarda unos cientos de milisegundos; en búsqueda web el tiempo de búsqueda domina la latencia.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| RysoAI TinyQA-1 Moss | 89M núcleo / 429M con decodificadores | No disponible | QA con recuperación y verificación | Apache 2.0 | Solo inglés; CPU; citas verificadas |
| cross-encoder/ms-marco-MiniLM-L12-v2 | No disponible | No disponible | Reordenación de pasajes | No disponible | Modelo base del que se afina Moss; sin verificación ni citas |
| deepset/minilm-uncased-squad2 | No disponible | No disponible | Extracción de respuesta (SQuAD 2.0) | No disponible | Usado como reader dentro de la canalización de Moss |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo admite inglés; no hay soporte multilingüe declarado.
- No es un modelo generativo general: no razona de forma multi-paso, no hace tool calling y no produce texto libre salvo la línea opcional del verbalizador.
- La calidad depende de la recuperación: si los documentos o los resultados de búsqueda no contienen la respuesta, el modelo no puede inventarla, pero puede devolver una cita irrelevante marcada como no verificada.
- La verificación se basa en umbrales heurísticos (puntuación del verifier de 1,5 o coincidencia de tres fuentes); no hay garantía formal de corrección.
- Los benchmarks declarados proceden del autor y no están verificados de forma independiente.
- El modelo se publicó en noviembre de 2026 y, según los datos de Hugging Face, no registra descargas ni likes, por lo que su adopción y validación externa son todavía inexistentes.
- La longitud de contexto no está documentada, lo que dificulta planificar su uso con documentos largos.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias de los modelos base y del reader descargado en tiempo de ejecución.

## Enlaces

- Hugging Face: https://huggingface.co/RysoAI/tinyqa-1-moss
- Sitio del autor: https://ryso.ai
- Modelo base (ranker/verifier): https://huggingface.co/cross-encoder/ms-marco-MiniLM-L6-v2
- Modelo base (ranker/verifier): https://huggingface.co/cross-encoder/ms-marco-MiniLM-L12-v2
- Reader: https://huggingface.co/deepset/minilm-uncased-squad2
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Dataset de evaluación: https://huggingface.co/datasets/google/simpleqa-verified
