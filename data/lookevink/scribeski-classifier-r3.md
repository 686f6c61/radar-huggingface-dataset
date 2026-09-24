# lookevink/scribeski-classifier-r3

## Resumen

Scribeski intake classifier (r3) es un modelo de clasificación especializado en salud conductual, publicado por Kevin Loo (Columbia University) bajo el identificador `lookevink/scribeski-classifier-r3`. Se trata de un ajuste fino completo de Qwen3-1.7B que lee una transcripción íntegra de una sesión de consejería y responde 62 campos de opción múltiple de un formulario de admisión en una sola pasada hacia delante: vivienda y composición del hogar, trabajo e ingresos, consumo de sustancias, medicación, ítems PHQ-9 y GAD-7, ítems de riesgo suicida y de violencia, actividades de la vida diaria, derivaciones y seguimiento. Cada respuesta es un valor rellenado o un campo en blanco, que significa "requiere revisión" y lo completa el trabajador social.

Su rasgo diferencial es que está diseñado para ser seguro, no completo: en un conjunto de prueba sellado de 30 sesiones reales de consejería (AnnoMI, etiquetadas a mano) no cometió ningún error en campos de riesgo y falló 7 de 1.860 respuestas (0,38 %). A cambio, deja en revisión en torno al 80 % de los hechos establecidos en habla real, lo que lo posiciona como herramienta de apoyo documental y no como sistema de decisión clínica.

El modelo usa decodificación por puntuación de logits en lugar de generación: restringe la distribución de probabilidad a las letras de opción de cada pregunta en la posición `Answer:` y deja en blanco toda respuesta por debajo de 0,9 de confianza. Requiere la librería MLX de Apple y funciona con pesos de 8 bits de 1,7 GB, con un tiempo de ejecución aproximado de 2 segundos por sesión en un Apple M6 de 32 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (ajuste fino completo de Qwen/Qwen3-1.7B); inferencia por scoring de logits, sin paso de decodificación |
| Parámetros totales | 1.700 millones aproximadamente (heredados de Qwen3-1.7B); repositorio de 1,8 GB |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (entrenado a 32k de contexto) |
| Tipos de cuantización | MLX de 8 bits (1,7 GB, documentada por el autor); pesos safetensors en precisión completa incluidos en el repositorio |
| Idiomas soportados | inglés (en) y español (es) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors; artefactos y ejecución vía MLX |
| Librería de inferencia | mlx (mlx-lm), junto con transformers para el tokenizador |
| Campos clasificados | 62 campos de formulario de admisión |
| Tamaño del repositorio | 1,8 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La base es Qwen3-1.7B, un transformer decoder denso de aproximadamente 1.700 millones de parámetros. Sobre él se realizó un ajuste fino completo (no LoRA ni adaptadores) a 32k de contexto, durante 2 épocas en 1 GPU H100, seleccionando la época 2 por pérdida de validación. El conjunto de entrenamiento son 1.207 sesiones sintéticas de salud conductual: las sesiones fueron redactadas por seis modelos de pesos abiertos a partir de fichas de verdad fundamental muestreadas, y solo se conservaron las etiquetas en las que una pasada ciega de DeepSeek coincidía con la ficha. No se utilizó ningún dato real de clientes. El dataset se publica por separado como *Scribeski Intake Dialogues* (CC BY 4.0).

La innovación técnica no está en el entrenamiento sino en el procedimiento de inferencia. El prompt contiene las reglas, la transcripción completa y una pregunta por campo; los campos multiselección se expanden a una pregunta sí/no por cada opción, y cada pregunta termina en el token `Answer:`. El modelo no genera texto: se leen los logits en cada posición `Answer:` restringidos a las letras de opción de esa pregunta, y esa distribución restringida constituye la respuesta. La abstención se implementa con un umbral de confianza de 0,9 y temperatura 1,25, ambos ajustados sobre validación. Las respuestas que no encajan en ninguna opción se dejan en blanco para revisión (por ejemplo, ideación suicida activa cuando nunca se evaluó el plan). El prompt, las preguntas y los umbrales de decodificación están congelados en `classifier.json`. El campo `session_type` no se clasifica: lo aporta la aplicación.

## Capacidades

- Clasificación de 62 campos de formulario de admisión en una única pasada hacia delante sobre la transcripción completa de la sesión.
- Cobertura temática: vivienda y hogar, trabajo e ingresos, sustancias, medicación, ítems PHQ-9 y GAD-7, ítems de riesgo suicida y de violencia, vida diaria, derivaciones y seguimiento.
- Abstención calibrada: devuelve el campo en blanco cuando la confianza es inferior a 0,9, señalizando "necesita revisión".
- Salida estructurada: modo texto plano (campos rellenados y recuento de pendientes) y modo JSON con `{field: {value, confidence, status}}`.
- Bilingüe inglés y español, según los metadatos del modelo.
- Procesamiento de transcripciones con formato `[mm:ss] WORKER: …` / `[mm:ss] CLIENT: …`; las líneas de cabecera que empiezan por `#` se ignoran.
- Ejecución local en Apple Silicon vía MLX, sin llamadas a servicios externos.
- No soporta tool calling ni function calling (no disponible en la información proporcionada).
- No soporta uso agéntico ni razonamiento multi-paso: es un clasificador de una sola pasada, no un modelo conversacional.
- No dispone de modo "thinking", visión ni audio.

## Casos de uso

- Prerrellenado de formularios de admisión en salud conductual: el modelo lee la transcripción de la sesión y propone valores para los 62 campos, dejando en blanco los que no alcanzan el umbral de confianza para que el trabajador social los complete como hace actualmente.
- Red de seguridad en campos de riesgo: dado que no cometió ningún error en campos de riesgo en el conjunto sellado, puede usarse como comprobación automática que marca sesiones con ítems de suicidio o violencia sin cubrir y las deriva a revisión humana prioritaria.
- Triaje y priorización de casos: el recuento de campos pendientes y la distribución de confianza permiten ordenar la cola de trabajo documental de un equipo clínico, dirigiendo el esfuerzo a las sesiones con más revisión pendiente.
- Apoyo a la documentación en investigación con transcripciones de consejería: sobre corpus como AnnoMI, permite anotar automáticamente ítems PHQ-9 y GAD-7 y variables sociodemográficas para su posterior revisión y validación manual.
- Auditoría de calidad de historias clínicas: comparar los campos rellenados por el profesional con los valores propuestos por el modelo ayuda a detectar campos omitidos o inconsistencias en registros ya cerrados, siempre con revisión humana.
- Despliegue en portátil con requisitos de privacidad: al ejecutarse íntegramente en local con MLX (1,7 GB en 8 bits, unos 2 segundos por sesión en un Apple M6 de 32 GB), es viable en entornos donde la transcripción no puede salir del dispositivo.
- Generación de datos sintéticos etiquetados: el par modelo más dataset *Scribeski Intake Dialogues* (CC BY 4.0) permite construir y etiquetar corpus sintéticos de salud conductual para entrenar o evaluar otros clasificadores, sin usar datos de pacientes reales.
- Extracción estructurada bilingüe en investigación clínica: al declarar soporte de inglés y español, puede emplearse en estudios con muestras en ambos idiomas, con la cautela de que no se ha publicado evaluación por idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica una evaluación propia sobre un conjunto sellado de 30 sesiones reales de consejería (AnnoMI, etiquetadas a mano):

| Métrica | Resultado |
|---|---|
| Respuestas incorrectas en campos de riesgo | 0 |
| Respuestas incorrectas totales | 7 de 1.860 (0,38 %) |
| Hechos establecidos respondidos correctamente | 14 de 77 (18 %) |
| Hechos establecidos dejados para revisión | 63 de 77 (82 %) |
| Precisión cuando responde | 14 de 21 (67 %) |
| Validación sintética | 98,1 % correctas, 0,5 % incorrectas |

Los errores sobre hechos establecidos corresponden mayoritariamente a personas y circunstancias mencionadas de pasada: con quién vive el cliente, apoyos y factores protectores. El autor señala que 3 de las 7 respuestas incorrectas son etiquetas estrictas discutibles. Los informes completos están en `eval/classifier-round3-2026-09-23.md` (y rondas 1 y 2) dentro del repositorio Scribeski.

## Requisitos de hardware

- Pesos en precisión completa (safetensors, ~1,7B parámetros): aproximadamente 3,4 GB solo de pesos en bf16/fp16, más caché de activaciones y KV.
- Pesos cuantizados MLX de 8 bits: 1,7 GB, la configuración que reporta el autor.
- Caché KV: con transcripciones cercanas a la ventana de 32k, el caché de un transformer de 1,7B puede añadir varios GB adicionales; el autor no publica esta cifra.
- Cabe en GPU de consumo: cualquier GPU con 8 GB o más de VRAM debería alojar los pesos de 8 bits más una sesión de longitud moderada (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090). Para contexto cercano a 32k conviene disponer de 16 GB o más.
- Entrenamiento: 1 GPU H100 durante 2 épocas sobre 1.207 sesiones, según el autor. A100 o H100 son adecuadas para reproducir el ajuste fino.
- Apple Silicon: el autor reporta unos 2 segundos por sesión en un Apple M6 de 32 GB con MLX de 8 bits.
- Despliegue: MLX (mlx-lm) es la vía documentada, mediante `classify.py`; es necesaria la capacidad de leer los logits en posiciones concretas, por lo que vLLM, TGI, Ollama o llama.cpp no sirven directamente sin reimplementar la lógica de scoring (no se documenta ninguna conversión a GGUF).
- Throughput: no disponible; solo se conoce la latencia de ~2 s por sesión en el hardware citado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scribeski-classifier-r3 | ~1,7B | 32k | Clasificación de 62 campos de admisión en salud conductual, con abstención | Apache-2.0 | HuggingFace, requiere MLX |
| Qwen/Qwen3-1.7B (modelo base) | 1,7B | 32k (nativo del base) | Modelo generativo generalista, multilingüe | Apache-2.0 | HuggingFace, ampliamente soportado |
| Modelos generativos pequeños de la misma franja (Llama 3.2 1B/3B, Gemma 2 2B, alternativas similares) | 1B-3B | variable | Generación general, ajustables a extracción de información | licencias variables | HuggingFace |
| Clasificadores BERT clínicos (familia tipo MentalBERT o similares) | 0,1B-0,3B | 512 tokens | Clasificación de fragmentos cortos, no de transcripciones completas | variable | HuggingFace |

La comparación relevante es la funcional, no la de parámetros: frente al Qwen3-1.7B original, este modelo pierde capacidades generativas y conversacionales a cambio de salida estructurada, abstención calibrada y una tasa de error del 0,38 % en el dominio objetivo. Frente a un clasificador BERT clínico, la diferencia clave es la ventana de 32k, que permite procesar la sesión completa en lugar de fragmentos. No hay datos públicos de rendimiento de las alternativas en esta tarea concreta, por lo que la comparación cuantitativa de precisión no está disponible.

## Limitaciones y advertencias

- Cobertura baja en habla real: deja aproximadamente el 80 % de los hechos establecidos para revisión (63 de 77 en el conjunto sellado).
- No validado por clínicos. El propio autor indica explícitamente que no sirve para la toma de decisiones clínicas.
- Los campos de riesgo deben ser revisados siempre por el clínico, incluso aunque el modelo no cometiera errores en ellos en la evaluación publicada.
- Precisión limitada cuando responde: 14 de 21 respuestas correctas (67 %) sobre hechos establecidos en el conjunto real; el resto se abstiene.
- Entrenamiento exclusivamente con datos sintéticos generados por seis modelos de pesos abiertos, con filtrado por acuerdo con una pasada ciega de DeepSeek: puede heredar sesgos, estilo y patrones de esos generadores, y no reflejar la variabilidad del habla clínica real.
- Idiomas: solo inglés y español declarados; no se publica evaluación desagregada por idioma, por lo que el rendimiento en español no está cuantificado.
- Dependencia de formato: espera transcripciones con el patrón `[mm:ss] WORKER:` / `[mm:ss] CLIENT:`; otras estructuras pueden degradar el resultado.
- Dependencia de ecosistema: la implementación publicada usa MLX, lo que limita el despliegue fuera de Apple Silicon salvo reimplementación propia de la lógica de scoring.
- Licencia Apache-2.0: permite uso comercial según los términos de la licencia, pero el uso clínico real está sujeto a regulación sanitaria y de dispositivos médicos (por ejemplo, MDR en la UE o autorización de la FDA en EE. UU.), que la licencia no cubre.
- Adopción nula: 0 descargas y 0 likes en el momento de redactar esta ficha, sin validación independiente por terceros.
- Riesgo de error por omisión más que de invención: el diseño prioriza la abstención, de modo que el peligro principal en producción es que un campo quede en blanco (y no se revise) más que una respuesta alucinada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lookevink/scribeski-classifier-r3
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset *Scribeski Intake Dialogues* (CC BY 4.0): mencionado en la model card, URL no disponible en la información proporcionada
- Repositorio Scribeski con los informes de evaluación (`eval/classifier-round3-2026-09-23.md`, rondas 1 y 2): mencionado en la model card, URL no disponible en la información proporcionada
- Contacto del autor: kevin@loo.ski (Kevin Loo, Columbia University)
- Paper, blog o demo adicionales: no disponible en la información proporcionada
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (únicamente páginas no relacionadas); no se han encontrado enlaces adicionales.
