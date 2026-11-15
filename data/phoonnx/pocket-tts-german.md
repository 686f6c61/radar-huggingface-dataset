# Phoonnx/pocket-tts-german

## Resumen

pocket-tts-german es un paquete de pesos en formato ONNX para síntesis de voz (text-to-speech) en alemán, distribuido por el usuario Phoonnx como una extracción de la carpeta `german` del repositorio agregador `Phoonnx/phoonnx-pocket-tts`. No se trata de un modelo entrenado por Phoonnx: según la propia model card, los pesos conservan la licencia upstream de Kyutai, Creative Commons Attribution 4.0 International, y se pide atribución explícita a Kyutai en cualquier uso. El modelo está pensado para ser consumido por la librería phoonnx (https://github.com/TigreGotico/phoonnx), un runtime de TTS basado en ONNX.

El repositorio ocupa 0,8 GB y expone 26 identificadores de voz bajo el prefijo `pockettts/de/`, lo que indica un modelo multi-hablante con voces predefinidas en lugar de clonación arbitraria. La información pública disponible es muy limitada: la model card no documenta arquitectura, número de parámetros, frecuencia de muestreo, longitud de contexto ni composición del dataset de entrenamiento. La ficha siguiente refleja únicamente lo que consta en los metadatos y en la model card, marcando como "no disponible" todo aquello que el autor no ha publicado.

La relevancia de esta ficha es doble: por un lado, permite evaluar rápidamente si el paquete encaja en un pipeline de TTS en alemán sobre CPU o GPU modestas (formato ONNX, licencia permisiva con atribución); por otro, advierte de las lagunas documentales que cualquier equipo de producción debe cubrir con pruebas propias antes de adoptarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (pesos en formato ONNX; el autor no documenta la topología) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene ficheros ONNX; no se detallan variantes cuantizadas) |
| Idiomas soportados | aleman (carpeta `german` del repositorio origen); el campo de idiomas de Hugging Face figura como no disponible |
| Licencia | CC BY 4.0 (Creative Commons Attribution 4.0 International), con atribución a Kyutai |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,8 GB |
| Voces incluidas | 26 identificadores `pockettts/de/*` |
| Libreria / runtime | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la documentación disponible. Los metadatos indican únicamente que los pesos se distribuyen en formato ONNX y que se ejecutan mediante la librería phoonnx, lo que sugiere un grafo de inferencia precompilado y portable, pero no permite afirmar si se trata de un transformer, un modelo convolucional, un modelo basado en difusión o una arquitectura híbrida.

Tampoco constan datos de entrenamiento: ni el número de tokens o horas de audio, ni la composición del corpus, ni si hubo ajuste fino con preferencias humanas o discriminadores adversarios. La model card se limita a remitir al repositorio origen `Phoonnx/phoonnx-pocket-tts` y a reproducir la nota de licencia del proyecto upstream, atribuyendo los pesos a Kyutai. Cualquier afirmación sobre innovaciones técnicas (decodificación especulativa, atención lineal, vocoder concreto) sería especulativa y no se incluye.

## Capacidades

- Síntesis de voz a partir de texto en alemán, con 26 voces predefinidas identificadas como `pockettts/de/<nombre>` (alba, anna, azelma, bill_boerst, caro_davy, charles, cosette, eponine, estelle, eve, fantine, george, giovanni, jane, javert, jean, juergen, lola, marius, mary, michael, paul, peter_yearsley, rafael, stuart_bell, vera).
- Selección de hablante por identificador de voz, sin que conste soporte de clonación a partir de audio de referencia.
- Inferencia mediante ONNX, lo que permite ejecución portable en CPU y GPU a través del runtime phoonnx.
- No consta soporte de tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es un modelo de TTS, no un modelo de lenguaje.
- No consta capacidad multilingüe: el paquete está etiquetado como alemán.
- No consta control de prosodia, emoción, velocidad o estilo más allá de la elección de voz.
- No consta capacidad de visión ni de audio de entrada (no es un modelo speech-to-speech).

## Casos de uso

- **Locución de artículos y boletines en alemán**: el modelo convierte texto plano en audio con una de las 26 voces disponibles, adecuado para pipelines de publicación que necesitan generar versiones habladas de contenido escrito sin intervención manual.
- **Sistemas de anuncios y megafonía**: integrado en el runtime phoonnx sobre ONNX, puede desplegarse en equipos sin GPU dedicada para generar avisos pregrabados o dinámicos en alemán con baja dependencia de infraestructura.
- **Accesibilidad web**: generación de audio bajo demanda para lectores de pantalla o interfaces de accesibilidad en aplicaciones dirigidas a usuarios germanoparlantes, eligiendo entre distintas voces para adaptarse al perfil del usuario.
- **Prototipado de asistentes de voz**: al ser un paquete ONNX ligero (0,8 GB) y con licencia CC BY 4.0, sirve para validar la cadena texto-a-voz en un producto antes de comprometerse con un proveedor comercial o un modelo mayor.
- **Generación de material educativo**: creación de pistas de audio para cursos de idiomas o contenidos formativos en alemán, aprovechando la variedad de voces para mantener la atención del oyente.
- **Pruebas de regresión en pipelines de TTS**: el paquete permite montar un banco de pruebas reproducible con voces fijas y comparar la salida frente a otras versiones del modelo o frente a alternativas, al estar los pesos congelados en ONNX.
- **Sustitución de voces en entornos offline**: aplicaciones de escritorio o embebidas que no pueden depender de servicios en la nube y necesitan síntesis local en alemán con una licencia que solo exige atribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad (MOS, MCD, WER), latencia, throughput ni comparaciones con otros sistemas de TTS.

## Requisitos de hardware

- **VRAM estimada**: no disponible. El repositorio pesa 0,8 GB, lo que da una cota superior aproximada del espacio en disco necesario para los pesos; el consumo en memoria durante la inferencia no está documentado.
- **GPU recomendadas**: no disponibles. Al ejecutarse sobre ONNX mediante phoonnx, es plausible su uso en CPU y en GPU de gama consumer, pero el autor no publica requisitos ni pruebas.
- **Compatibilidad con GPU consumer**: no confirmada explícitamente; el tamaño del paquete (0,8 GB) sugiere que cabría en tarjetas con 4-8 GB de VRAM, pero es una estimación no verificada.
- **Opciones de despliegue**: runtime phoonnx (https://github.com/TigreGotico/phoonnx) sobre ONNX Runtime. No consta soporte documentado para vLLM, llama.cpp, Ollama o TGI, que además no son runtimes orientados a TTS.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de este modelo, por lo que una comparación cuantitativa con alternativas de TTS en alemán (por ejemplo, modelos de la familia Piper, Coqui TTS o sistemas comerciales) no puede sustentarse en la información proporcionada. La comparación se limita a los aspectos documentados:

| Modelo | Parametros | Contexto | Licencia | Formato | Idiomas |
|---|---|---|---|---|---|
| pocket-tts-german (Phoonnx) | no disponible | no disponible | CC BY 4.0 (atribución a Kyutai) | ONNX | aleman |
| Alternativas de TTS open source en aleman | no disponible | no disponible | variable | variable | no disponible |

No se han publicado comparativas oficiales entre este paquete y otros sistemas de síntesis de voz.

## Limitaciones y advertencias

- **Documentación insuficiente**: la model card no describe arquitectura, parámetros, frecuencia de muestreo, vocabulario fonético ni proceso de entrenamiento, lo que dificulta evaluar su idoneidad sin pruebas empíricas.
- **Riesgo de alucinación y artefactos**: en TTS, los fallos se manifiestan como pronunciaciones incorrectas, omisiones de texto, repeticiones o artefactos acústicos; no hay métricas publicadas que cuantifiquen su frecuencia.
- **Sesgos de las voces**: al tratarse de un conjunto cerrado de 26 hablantes, la variedad de acentos, edades y géneros está limitada a lo que el autor haya incluido; no se documenta la distribución demográfica de las voces.
- **Idioma único**: el paquete está etiquetado como alemán y no consta soporte de otros idiomas; el campo de idiomas de Hugging Face figura como no disponible, por lo que la cobertura real (variantes dialectales, préstamos lingüísticos) no está verificada.
- **Licencia con obligación de atribución**: CC BY 4.0 permite uso comercial, pero exige dar crédito a Kyutai y conservar el aviso de licencia; el incumplimiento de la atribución invalida el permiso.
- **Procedencia de los pesos**: se trata de una reexportación de un repositorio agregador (`Phoonnx/phoonnx-pocket-tts`), no de un modelo entrenado por el publicador; conviene verificar la integridad y la versión de los ficheros frente al origen.
- **Sin métricas de producción**: no hay datos de latencia, throughput ni estabilidad en cargas concurrentes, por lo que el dimensionamiento debe hacerse con pruebas propias.
- **Fecha de creación futura en los metadatos**: el repositorio figura creado el 2026-11-14, lo que puede indicar un error de marcado temporal o una publicación programada; conviene contrastar la fecha real antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/pocket-tts-german
- Repositorio origen (agregador): https://huggingface.co/Phoonnx/phoonnx-pocket-tts
- Runtime phoonnx: https://github.com/TigreGotico/phoonnx
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
