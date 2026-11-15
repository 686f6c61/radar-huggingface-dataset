# HeartMuLa/HeartMuLa-oss-3B-happy-new-year

## Resumen

HeartMuLa-oss-3B-happy-new-year es un modelo de generación de música (text-to-audio) desarrollado por el equipo HeartMuLa, presentado como el modelo de música de código abierto con mejor controlabilidad sobre la letra y calidad musical de su categoría. El modelo forma parte de una familia más amplia de modelos fundacionales de música que incluye codecs de audio (HeartCodec) y transcriptores (HeartTranscriptor), y se distribuye con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Con aproximadamente 3.938 millones de parámetros (3,9B) y pesos en formato safetensors, el modelo está diseñado para convertir letras y descripciones en audio musical. Soporta varios idiomas (chino, inglés, japonés, coreano y español, además de la etiqueta multilingual) y se distribuye como una variante específica del modelo base HeartMuLa-oss-3B, en este caso la versión recomendada por el autor.

Su relevancia actual radica en que cubre un nicho poco poblado en el ecosistema abierto: la generación musical controlable por letra con licencia permisiva y pesos abiertos, algo que hasta ahora estaba dominado por soluciones propietarias. El repositorio acumula más de 3.100 descargas y 67 likes, lo que indica una adopción temprana moderada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de generación text-to-audio; la model card no detalla la arquitectura interna) |
| Parametros totales | 3.938.113.536 (3,9B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | multilingual, zh, en, ja, ko, es |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no proporciona detalles sobre la arquitectura interna del modelo (tipo de transformer, mecanismo de atención, diseño del decodificador de audio ni composición del dataset de entrenamiento). El pipeline declarado es `text-to-audio`, y el modelo se integra en el ecosistema HeartMuLa junto con HeartCodec, un codec de audio neuronal que presumiblemente actúa como tokenizador y decodificador del audio musical, y HeartTranscriptor, orientado a la transcripción.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas concretas (decodificación especulativa, atención lineal, etc.). El paper asociado (arXiv:2601.10547) es la referencia indicada por el autor para obtener estos detalles, pero su contenido no está incluido en la información proporcionada.

## Capacidades

- Generación de música a partir de letras y descripciones textuales (text-to-audio).
- Controlabilidad de la letra: el autor la destaca como la principal ventaja frente a alternativas de código abierto.
- Generación de covers y remixes (según la web oficial del proyecto).
- Edición de pasajes concretos de una canción en MuLa Studio (herramienta del ecosistema).
- Soporte multilingüe en las letras: chino, inglés, japonés, coreano y español, además de la etiqueta multilingual.
- Integración con el ecosistema HeartMuLa (HeartCodec para audio, HeartTranscriptor para transcripción).
- No se documentan en la información disponible capacidades de tool calling, agentes, visión ni audio de entrada.

## Casos de uso

- Producción musical asistida: compositores y productores pueden introducir una letra y obtener una maqueta cantada para iterar sobre melodías y arreglos antes de grabar con músicos reales, gracias a la controlabilidad de la letra que el autor destaca.
- Creación de jingles y música publicitaria: agencias pueden generar piezas cortas con letra en español o inglés para campañas, con licencia Apache 2.0 que permite uso comercial sin royalties.
- Contenido para creadores: youtubers y podcasters pueden generar sintonías y canciones temáticas personalizadas sin depender de bibliotecas de terceros.
- Localización de canciones: el soporte de zh, en, ja, ko y es permite adaptar una misma pieza a distintos mercados idiomáticos generando versiones con letra traducida.
- Educación musical: docentes pueden ilustrar conceptos de estructura de canción (estrofa, estribillo) generando ejemplos con letras didácticas.
- Investigación en generación musical: al ser Apache 2.0 y safetensors, sirve como base para fine-tuning y experimentación académica en modelos de audio.
- Prototipado rápido en aplicaciones: integrable en productos que necesiten generación musical bajo demanda, aunque no se documentan requisitos de latencia ni API de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 3,9B parámetros en fp16 requiere aproximadamente 7,8 GB solo para los pesos, a lo que habría que sumar el codec de audio y los buffers de generación; en cuantizaciones de 8 bits rondaría los 4 GB y en 4 bits unos 2 GB, pero estos cálculos son estimaciones y no datos publicados por el autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño de parámetros, previsiblemente cabría en GPUs de consumo con suficiente VRAM, pero no hay datos oficiales.
- Opciones de despliegue: el autor remite al repositorio de GitHub (heartlib) para el quickstart y el despliegue local; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de generación musical (MusicGen, Stable Audio, etc.) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La model card es muy escasa: no documenta arquitectura, datos de entrenamiento, sesgos ni evaluaciones, lo que dificulta una evaluación técnica rigurosa antes de usarlo en producción.
- Riesgo de alucinación y de artefactos de audio: no se documenta la tasa de fallos ni la calidad objetiva de las generaciones.
- No se especifican limitaciones de contexto ni de longitud máxima de audio generado.
- El soporte de idiomas se limita a los declarados (zh, en, ja, ko, es); el rendimiento en otros idiomas no está documentado.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las licencias de los componentes del ecosistema (HeartCodec, HeartTranscriptor) si se despliegan conjuntamente.
- La variante "happy-new-year" es una versión concreta del modelo base; el autor la marca como recomendada, pero no se detallan las diferencias respecto a HeartMuLa-oss-3B.
- No hay información sobre latencia, throughput ni requisitos de hardware, lo que impide planificar capacidad de producción con datos fiables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HeartMuLa/HeartMuLa-oss-3B-happy-new-year
- Modelo base: https://huggingface.co/HeartMuLa/HeartMuLa-oss-3B
- Codec de audio recomendado: https://huggingface.co/HeartMuLa/HeartCodec-oss-20260123
- Codec de audio: https://huggingface.co/HeartMuLa/HeartCodec-oss
- Transcriptor: https://huggingface.co/HeartMuLa/HeartTranscriptor-oss
- Repositorio GitHub: https://github.com/HeartMuLa/heartlib
- Paper: https://arxiv.org/abs/2601.10547
- Web oficial: https://heartmula.com
- Demo: https://heartmula.github.io/
