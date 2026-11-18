# cstr/crispembed-spacy-de-core-news-sm-3.8.0

## Resumen

CrispEmbed native German spaCy es una conversión del modelo oficial `de_core_news_sm` 3.8.0 de spaCy a un formato empaquetado propio del proyecto CrispEmbed, con pesos en GGUF y perfil de precisión F32. Lo publica el usuario `cstr` en Hugging Face y está pensado como artefacto reproducible a partir del wheel autenticado de spaCy, conservando los avisos de licencia y procedencia del paquete original. No se trata de un modelo de lenguaje generativo, sino de un pipeline de procesamiento lingüístico alemán (tokenización, etiquetado morfosintáctico, dependencias y reconocimiento de entidades) empaquetado para su uso dentro del ecosistema CrispEmbed.

El modelo tiene 1.845.054 parámetros y un tamaño de repositorio de 0,0 GB, lo que refleja que se distribuye como artefacto compacto de inferencia en CPU. El alcance declarado por el autor es muy restringido: la build nativa cubre exactamente Linux x86-64 con AVX2 en CPU y precisión F32, junto con seis dependencias externas declaradas. El autor advierte explícitamente de que esto no constituye una garantía de portabilidad general a Linux, macOS, móvil, ni de precisión gramatical, cuantización o activación en aplicaciones.

La relevancia del artefacto es de nicho: sirve para reproducir y verificar una conversión concreta dentro del proyecto CrispEmbed, con digest de archivo publicado y procedencia trazable, más que para servir como modelo de referencia para tareas de NLP en producción. Para quien necesite un pipeline alemán de spaCy, la vía natural sigue siendo el wheel oficial de spaCy; este repositorio documenta una conversión específica y su cadena de custodia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pipeline de spaCy (componentes estadísticos de NLP, no transformer generativo); detalles internos no disponibles |
| Parametros totales | 1.845.054 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el perfil declarado es F32 (sin cuantización) |
| Idiomas soportados | alemán (de) |
| Licencia | MIT |
| Formato de pesos | GGUF (empaquetado CrispEmbed); origen: wheel oficial de spaCy 3.8.0 |

## Arquitectura y entrenamiento

El artefacto no entrena ningún modelo nuevo: es una conversión del wheel oficial autenticado `de_core_news_sm` 3.8.0 de spaCy. Por tanto, la arquitectura subyacente corresponde a los componentes estadísticos del pipeline alemán pequeño de spaCy (tokenización, tagger, parser de dependencias, lematizador y NER, según la composición estándar del paquete), cuyos detalles internos no se documentan en la información disponible. El número de parámetros reportado en safetensors es de 1.845.054.

El autor indica que el corpus de entrenamiento original no se incluye en el bundle y que todos los avisos de origen, modelo y código nativo se conservan en los archivos del paquete. La conversión se realizó a partir del wheel autenticado y se publica con un digest de archivo (`4e3b627a614cd21851e6e354335e2e08adeb4cedd4d7778df0cc68c1ce2edf01`) y una referencia a un pull request del repositorio CrispEmbed. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF o DPO, porque el artefacto es una conversión, no un modelo entrenado desde cero.

La innovación técnica declarada es el empaquetado nativo reproducible: alcance limitado a Linux x86-64 con AVX2, precisión F32 y seis dependencias externas declaradas, con los valores por defecto del proveedor desactivados ("Provider defaults remain OFF"). El autor subraya que el alcance nativo no equivale a portabilidad general ni a una cualificación de precisión gramatical.

## Capacidades

- Procesamiento lingüístico del alemán mediante el pipeline de spaCy `de_core_news_sm` 3.8.0: tokenización, etiquetado morfosintáctico, análisis de dependencias, lematización y reconocimiento de entidades, según la composición estándar del paquete (los detalles exactos de componentes no se documentan en la información disponible).
- Ejecución en CPU sobre Linux x86-64 con AVX2 en precisión F32, según el alcance nativo declarado.
- Empaquetado en formato GGUF dentro del ecosistema CrispEmbed.
- No es un modelo generativo: no se documenta generación de texto libre, razonamiento, código, matemáticas ni visión.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico.
- No se documenta capacidad multilingüe más allá del alemán.
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Verificación de procedencia de artefactos: el repositorio permite comprobar el digest del archivo y la cadena de custodia desde el wheel oficial de spaCy hasta el bundle GGUF, útil en auditorías de cadena de suministro de modelos.
- Reproducibilidad en investigación: sirve para replicar una conversión concreta del pipeline alemán de spaCy dentro del proyecto CrispEmbed, con referencia al pull request y a las dependencias declaradas.
- Pruebas de integración en el ecosistema CrispEmbed: permite validar la carga y ejecución del formato GGUF empaquetado en entornos Linux x86-64 con AVX2 antes de adoptar el formato en otros pipelines.
- Procesamiento de texto alemán en CPU: para tareas de etiquetado, lematización y NER sobre textos en alemán en servidores sin GPU, siempre que el entorno cumpla el alcance nativo declarado.
- Evaluación comparativa de formatos: útil para medir diferencias de rendimiento y precisión entre el wheel original de spaCy y la conversión GGUF en el mismo hardware de referencia.
- Docencia y demostraciones: ejemplo de empaquetado reproducible de un modelo pequeño de NLP con licencia permisiva y avisos de procedencia conservados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el perfil declarado es CPU con precisión F32.
- GPU recomendadas: no disponible; el alcance nativo declarado es CPU Linux x86-64 con AVX2.
- Compatibilidad con GPU de consumo: no documentada; el autor limita el alcance a CPU x86-64/AVX2.
- Opciones de despliegue: empaquetado CrispEmbed con pesos GGUF; el uso directo mediante spaCy requiere el wheel oficial `de_core_news_sm` 3.8.0. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.
- Requisito de CPU: AVX2 en Linux x86-64, según el alcance nativo declarado por el autor.
- Tamaño del modelo: 1.845.054 parámetros, con repositorio de 0,0 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| CrispEmbed native German spaCy (este) | 1.845.054 | no disponible | MIT | GGUF (CrispEmbed) | Conversión de `de_core_news_sm` 3.8.0; alcance CPU Linux x86-64/AVX2/F32 |
| spaCy `de_core_news_sm` 3.8.0 (oficial) | no disponible en la información | no disponible | MIT | wheel de spaCy | Pipeline alemán pequeño original; soporte multiplataforma gestionado por spaCy |
| CrispEmbed de otros idiomas del mismo proyecto | no disponible | no disponible | no disponible | GGUF (CrispEmbed) | No se dispone de datos concretos en la información proporcionada |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al derivar del pipeline oficial de spaCy, heredaría los sesgos de sus datos de entrenamiento originales, que no se detallan.
- Riesgo de alucinación: no aplica en el sentido generativo, pero el autor advierte explícitamente de que el artefacto no está cualificado para precisión gramatical.
- Limitaciones de idioma: solo alemán (`de`).
- Limitaciones de plataforma: el alcance nativo es exactamente Linux x86-64 con AVX2 y F32; no cubre portabilidad general a Linux, macOS, móvil, cuantización ni activación en aplicaciones.
- Restricciones de licencia: MIT, permisiva para uso comercial; deben conservarse los avisos de origen, modelo y código nativo incluidos en el bundle.
- Cadena de suministro: el autor exige usar URLs de commit inmutables y autenticar cada descarga antes de parsear; el digest del archivo es `4e3b627a614cd21851e6e354335e2e08adeb4cedd4d7778df0cc68c1ce2edf01`.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Los valores por defecto del proveedor permanecen desactivados ("Provider defaults remain OFF"), lo que puede requerir configuración explícita en el entorno de ejecución.

## Enlaces

- Hugging Face: https://huggingface.co/cstr/crispembed-spacy-de-core-news-sm-3.8.0
- Pull request de origen en CrispEmbed: https://github.com/CrispStrobe/CrispEmbed/pull/237
