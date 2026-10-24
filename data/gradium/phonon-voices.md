# gradium/phonon-voices

## Resumen

`gradium/phonon-voices` es un repositorio de embeddings de voz, no un modelo de lenguaje: contiene 102 identidades de hablante listas para usar con Phonon S, el modelo de síntesis de voz (text-to-speech) de 31 millones de parámetros de Gradium. Cada voz es un fichero `.safetensors` con un único tensor `speaker_wavs` de forma 1×512×125 en float32, que Phonon consume directamente como condicionamiento de hablante. El repositorio combina 90 voces del catálogo comercial de Gradium con 12 voces de personaje en inglés, y cubre 5 idiomas repartidos en 7 locales (inglés de EE. UU. y de Reino Unido, francés, alemán, español de España y de México, y portugués de Brasil).

Gradium es una start-up francesa de IA vocal que se presentó públicamente en diciembre de 2025 y comercializa una API en tiempo real para agentes de voz; este repositorio es la parte abierta de su stack, publicada bajo licencia Apache 2.0. Su valor práctico es que evita el coste de registrar y entrenar voces propias: el desarrollador descarga el embedding de la voz que quiere y la usa con el modelo, sin proceso de clonación.

Es relevante ahora porque fija un formato de embedding de hablante versionado (`ba7a5a45@300`) y porque el tamaño es mínimo (unos 250 KiB por voz, alrededor de 25 MB para las 102 voces), lo que permite versionar el catálogo completo en un repositorio de código o servirlo desde cualquier CDN sin infraestructura adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no aplica al repositorio, que solo contiene embeddings de hablante. El modelo asociado es Phonon S (31 M de parámetros, TTS); su arquitectura interna no se detalla en la información disponible |
| Parámetros totales | 31 M (modelo Phonon S). El repositorio no incluye pesos de modelo: son 102 tensores de hablante de 64.000 valores float32 cada uno |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica. Cada embedding es un tensor de 1×512×125 en float32 (125 tramas de 512 dimensiones) |
| Tipos de cuantización | no disponible. Los embeddings se distribuyen en float32 y no se documentan variantes cuantizadas |
| Idiomas soportados | inglés (en-US y en-GB), francés, alemán, español (España y México) y portugués (Brasil): 5 idiomas, 7 locales |
| Licencia | Apache 2.0 (repositorio de embeddings) |
| Formato de pesos | safetensors; un tensor por voz (`speaker_wavs`), formato `ba7a5a45@300`, 1×512×125, float32 |
| Número de voces | 102 (48 femeninas, 42 masculinas, 12 de personaje) |
| Muestras de audio | ficheros `.ogg` en `samples/{idioma}/{locale}/{género}/`, una muestra por voz renderizada con Phonon S (31 M) |
| Tamaño del repositorio | 0,0 GB según los metadatos de HuggingFace; el cálculo por tensor da unos 250 KiB por voz y unos 25 MB para el catálogo completo |
| Descargas y likes | 0 descargas, 13 likes en el momento de la consulta |
| Fecha de publicación | 19 de octubre de 2026; última actualización el 20 de octubre de 2026 |

## Arquitectura y entrenamiento

El repositorio no entrena nada: distribuye el resultado del pipeline de voces de Gradium. Cada fichero contiene un único tensor `speaker_wavs` con 125 tramas de 512 dimensiones, es decir, una secuencia de embeddings acústicos que condiciona al modelo TTS sobre la identidad del hablante. El identificador de formato `ba7a5a45@300` sugiere un esquema versionado (hash de formato más número de versión) que Phonon usa para validar la compatibilidad del embedding antes de cargarlo. No se documenta si estos vectores provienen de un encoder de hablante, de un extractor tipo x-vector o de un módulo de atención sobre mel-espectrogramas.

No hay información pública en la documentación disponible sobre el número de tokens de entrenamiento de Phonon S, la composición del dataset, el uso de RLHF o DPO ni las técnicas de decodificación empleadas. Tampoco se detalla el vocoder o decodificador de audio ni si existe control explícito de prosodia o emoción. La única innovación verificable es el propio formato de embedding: un condicionamiento compacto y fijo, sin clonación en tiempo de inferencia, que evita los riesgos y la latencia de los sistemas de voice cloning zero-shot.

Composición del catálogo:

| Idioma | Femeninas | Masculinas | Personajes | Total |
|---|---:|---:|---:|---:|
| Inglés (US y UK) | 13 | 12 | 12 | 37 |
| Francés | 9 | 6 | 0 | 15 |
| Alemán | 7 | 6 | 0 | 13 |
| Español (ES y MX) | 13 | 12 | 0 | 25 |
| Portugués (BR) | 6 | 6 | 0 | 12 |
| Total | 48 | 42 | 12 | 102 |

## Capacidades

- Condicionamiento de hablante para TTS: selecciona una identidad vocal concreta de las 102 disponibles cargando su embedding en Phonon S; no hay clonación ni ajuste fino.
- Cobertura multilingüe en 5 idiomas y 7 locales: en-US, en-GB, fr, de, es-ES, es-MX y pt-BR.
- 12 voces de personaje en inglés, orientadas a contenidos narrativos, videojuegos y doblaje creativo, además de las 90 voces de catálogo.
- Selección por identificador estable: cada voz tiene un `voice_id` de 16 caracteres (por ejemplo, `NbpkqMVS3CJeq2j8` para Zoey), lo que permite fijar la voz en configuración y reproducir el mismo timbre entre despliegues.
- Muestras de referencia incluidas: cada voz incluye un `.ogg` generado con Phonon S para evaluar timbre antes de integrarla.
- Lo que no ofrece: no hay tool calling, ni razonamiento multi-paso, ni visión, ni generación de texto. Es un artefacto de condicionamiento de voz, no un LLM.

## Casos de uso

- Agents de voz en atención al cliente: se fija un `voice_id` por mercado (por ejemplo, es-ES frente a es-MX) y se sirve el embedding al motor TTS de Gradium, de forma que la identidad vocal sea consistente entre sesiones y canales sin reentrenar nada.
- Doblaje y localización de vídeo: al existir voces nativas en fr, de, es y pt, se puede asignar una voz distinta por idioma manteniendo un registro similar (48 voces femeninas y 42 masculinas para emparejar), con el ahorro de no tener que grabar talento para prototipos.
- Audiolibros y contenido editorial: las 12 voces de personaje en inglés permiten separar narrador y diálogos dentro de una misma producción sin salir del conjunto de embeddings aprobados.
- Avisos y sistemas IVR telefónicos: el embedding de 250 KiB se carga en memoria desde disco o CDN, lo que encaja en despliegues con arranque en frío frecuente y contenedores pequeños.
- E-learning y accesibilidad: lectura de pantalla y locución de materiales en cinco idiomas con una voz estable por curso, evitando la variabilidad de los sistemas de clonación zero-shot.
- Videojuegos y prototipado de NPC: asignación de voces de personaje por identificador en el árbol de diálogos y sustitución posterior por grabaciones reales sin cambiar la lógica de integración.
- Pruebas A/B de identidad de marca: al ser ficheros independientes, se pueden versionar distintas voces por rama de producto y medir preferencia con las muestras incluidas antes de comprometerse con una.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No hay datos de MOS, similitud de hablante (SECS), tasa de error de pronunciación ni métricas de latencia o RTF para Phonon S con estos embeddings. Las únicas referencias cualitativas son las muestras `.ogg` publicadas por voz.

## Requisitos de hardware

- Almacenamiento: unos 250 KiB por voz en float32; el catálogo completo de 102 voces ocupa aproximadamente 25 MB, por lo que cabe en cualquier imagen de contenedor.
- VRAM para el modelo: Phonon S tiene 31 M de parámetros; en float32 los pesos ocupan unos 124 MB, en float16 unos 62 MB y en int8 unos 31 MB. Hay que sumar las activaciones, el decodificador de audio y las cachés internas, cuyo consumo no está documentado.
- GPU recomendadas: cualquier GPU consumer sirve por tamaño (RTX 3060, RTX 4060, RTX 4090, e incluso iGPU con suficiente memoria compartida); para despliegues en servidor, A100 o H100 están sobradamente dimensionadas y solo se justifican por agregación de concurrencia.
- CPU: el tamaño del modelo hace viable la inferencia en CPU, aunque no se publican medidas de latencia ni de tiempo real (RTF) que lo confirmen.
- Opciones de despliegue: no aplica vLLM, llama.cpp, Ollama o TGI, porque el artefacto no es un modelo generativo de texto. La integración documentada es la API y el SDK oficial de Gradium, o la carga del tensor `speaker_wavs` en una instancia de Phonon S.
- Latencia y throughput: no disponible. No se han publicado cifras de RTF, ni de peticiones por segundo, ni de coste por millón de caracteres.

## Comparativa con modelos similares

No se han encontrado en la información proporcionada modelos directamente comparables. La tabla siguiente recoge alternativas del ecosistema abierto de TTS, con la advertencia de que sus datos no provienen de la documentación consultada y deben verificarse en sus repositorios.

| Modelo | Parámetros | Idiomas | Licencia | Formato de voces | Disponibilidad |
|---|---|---|---|---|---|
| Phonon S + phonon-voices | 31 M | 5 (7 locales) | Apache 2.0 (embeddings); licencia del modelo no disponible | 102 embeddings safetensors, sin clonación | Repositorio HuggingFace y API/SDK de Gradium |
| Kokoro-82M | 82 M (dato no verificado en la información proporcionada) | varios | Apache 2.0 (no verificado) | ficheros de voz empaquetados (no verificado) | HuggingFace (no verificado) |
| Piper | variable según voz (no verificado) | decenas (no verificado) | MIT (no verificado) | modelos VITS por voz (no verificado) | Repositorio del proyecto (no verificado) |
| XTTS-v2 | ~467 M (no verificado) | multilingüe (no verificado) | Coqui Public Model License, restrictiva para uso comercial (no verificado) | clonación zero-shot con audio de referencia (no verificado) | HuggingFace (no verificado) |

La diferencia conceptual relevante es que `phonon-voices` no permite clonación: el catálogo es cerrado y cada voz es un vector fijo, mientras que las alternativas basadas en zero-shot requieren audio de referencia en cada petición.

## Limitaciones y advertencias

- No hay clonación: el conjunto de 102 voces es cerrado y no se documenta ningún procedimiento para generar embeddings nuevos a partir de audio propio.
- Cobertura de idiomas limitada a inglés, francés, alemán, español y portugués; no hay voces para catalán, gallego, euskera, italiano, neerlandés ni polaco, entre otros.
- Las 12 voces de personaje existen solo en inglés, de modo que una producción multilingüe con personajes no puede mantener el mismo elenco en los cinco idiomas.
- La licencia Apache 2.0 cubre los ficheros de embedding, pero no se especifica la licencia de Phonon S ni las condiciones de uso comercial de las identidades vocales del catálogo Gradium. Conviene verificar los términos del servicio antes de usar estas voces en producción, especialmente en publicidad y locución.
- Riesgo de uso indebido de la identidad vocal: al tratarse de voces de catálogo derivadas de grabaciones reales, el uso en contextos políticos, de suplantación o desinformación puede infringir condiciones adicionales no recogidas en la licencia del repositorio.
- Sin métricas publicadas: no hay MOS, SECS ni evaluaciones de naturalidad que permitan comparar objetivamente con alternativas; la evaluación disponible es escuchar las muestras `.ogg`.
- El repositorio registra 0 descargas y 13 likes, por lo que no existe validación externa ni informes de terceros sobre su comportamiento.
- El TTS puede producir pronunciaciones incorrectas en nombres propios, siglas, neologismos y cambios de código de idioma; el repositorio no incluye normalización de texto ni diccionarios de pronunciación.
- No se documenta control de emoción, velocidad ni estilo: la variabilidad expresiva depende de Phonon S y de los parámetros de inferencia, no del embedding.
- Posible desequilibrio del catálogo: 48 voces femeninas frente a 42 masculinas, sin información sobre diversidad de edad, acento regional dentro de cada locale ni variedades no estándar.
- Las fechas de creación y actualización de los metadatos (19 y 20 de octubre de 2026) deben tratarse con cautela si se usan para evaluar la madurez del proyecto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/gradium/phonon-voices
- Sitio de Gradium: https://gradium.ai/
- Página de texto a voz: https://gradium.ai/text-to-speech
- Documentación de la guía de texto a voz: https://docs.gradium.ai/guides/text-to-speech
- Blog de lanzamiento de Gradium: https://gradium.ai/blog/gradium
- Artículo de Le Monde sobre Gradium (2 de diciembre de 2025): https://www.lemonde.fr/economie/article/2025/12/02/gradium-nouvelle-start-up-francaise-specialiste-d-ia-vocale_6655699_3234.html
- Artículo en Prompt Inspiration sobre Gradium (3 de diciembre de 2025): https://prompt-inspiration.com/blog/actualite/gradium-startup-ia-vocale-francaise
