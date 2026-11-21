# owensong/Inflect-Mini-v3

## Resumen

Inflect Mini v3 es un modelo de síntesis de voz (text-to-speech) en inglés desarrollado por Owen Song, distribuido con pesos abiertos bajo licencia Apache 2.0. Se trata de la variante "Mini" de la familia Inflect v3, que el autor presenta junto a otras dos variantes de menor tamaño (Micro, con 11,79M de parámetros, y Atom, con 157,19K). El modelo resuelve el problema de generar voz natural y expresiva en inglés de forma totalmente local, sin depender de una API alojada, con un núcleo de 34,31M de parámetros y un repositorio de solo 0,2 GB.

La propuesta diferencial es el equilibrio entre huella mínima y calidad de voz: ofrece seis voces predefinidas (Cassidy, Mark, Hope, James, Sophia y Jasper), generación nativa a 24 kHz con un mejorador opcional a 48 kHz, y la posibilidad de construir perfiles de voz reutilizables a partir de una grabación de referencia. Según la model card, el modelo alcanza un 0,71% de WER (4/50) y 4,49 UTMOS22 en el Open TTS Leaderboard, con un rendimiento de 48,87x tiempo real sobre una GPU H200.

Es relevante ahora porque demuestra que un modelo de TTS de decenas de millones de parámetros puede ejecutarse en CPU y CUDA, con inferencia local y sin coste por petición, lo que lo hace atractivo para integraciones en dispositivos, prototipado rápido y aplicaciones donde la privacidad o la latencia de red son críticas. La información disponible sobre arquitectura interna es limitada: la model card no detalla la topología de la red ni la composición exacta del dataset de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 34,31M (núcleo) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio contiene el paquete completo de inferencia v3, no solo pesos) |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna del modelo (no se indica si es un transformer, un modelo basado en difusión, un modelo acústico con vocoder separado u otra topología). Tampoco se detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF, DPO o ajuste por preferencias. Lo que sí se documenta es el resultado: un núcleo de 34,31M de parámetros con salida nativa a 24 kHz y un mejorador opcional a 48 kHz, lo que sugiere una etapa de generación acústica a 24 kHz seguida de un módulo de superresolución o upsampling espectral.

Como innovaciones técnicas destacables, la model card menciona la generación local completa (el repositorio es el paquete de inferencia v3, no solo los pesos), el soporte de voces predefinidas y de perfiles de voz construidos a partir de una grabación de referencia, y la inclusión de eventos no verbales (non-speech events) en la síntesis. El rendimiento declarado de 48,87x tiempo real en una H200 indica que la inferencia está optimizada para GPU, aunque el modelo también se ejecuta en CPU.

## Capacidades

- Síntesis de voz en inglés a partir de texto, con salida nativa a 24 kHz.
- Mejora opcional de la señal hasta 48 kHz mediante un módulo compacto dedicado.
- Seis voces predefinidas con perfiles diferenciados: Cassidy (conversación), Mark (narración), Hope (instrucciones), James (explicación), Sophia (habla cotidiana) y Jasper (diálogo).
- Creación de perfiles de voz reutilizables a partir de una grabación de referencia.
- Inserción de eventos no verbales en la síntesis.
- Inferencia local en CPU y CUDA, sin API alojada para las voces predefinidas.
- Soporte multilingüe: no disponible (solo inglés).
- Tool calling, function calling, agentes y razonamiento multi-paso: no aplica (es un modelo de TTS, no un LLM).

## Casos de uso

- **Lectura de textos largos en local para accesibilidad**: el modelo puede convertir documentos, artículos o libros en audio sin enviar el contenido a un servicio externo, lo que resulta adecuado para personas con discapacidad visual o para entornos con requisitos de privacidad. La voz Mark (narración) es la más indicada para este escenario.
- **Asistentes de voz embebidos en dispositivos**: con 34,31M de parámetros y ejecución en CPU, el modelo puede integrarse en aplicaciones de escritorio, sistemas empotrados o dispositivos de bajo consumo para generar respuestas habladas sin dependencia de red.
- **Prototipado rápido de interfaces conversacionales**: los seis perfiles de voz permiten probar distintos registros (conversación, instrucciones, diálogo) en una misma aplicación sin entrenar ni contratar voces adicionales, acelerando la validación de UX de voz.
- **Generación de audiolibros y pódcasts**: el mejorador a 48 kHz permite producir audio de mayor calidad para distribución, y el flujo de referencia permite mantener una voz consistente a lo largo de capítulos o episodios.
- **Sistemas de anuncios y avisos automatizados**: la voz Hope (instrucciones) y la capacidad de insertar eventos no verbales encajan en la generación de mensajes de megafonía, tutoriales paso a paso o avisos de seguridad donde la claridad prima sobre la expresividad.
- **Clonación de voz controlada para demos y pruebas**: la construcción de perfiles de voz a partir de una grabación de referencia permite generar muestras con una voz concreta para pruebas internas, demos de producto o contenido de marketing, siempre bajo la licencia Apache 2.0 y las responsabilidades legales sobre el consentimiento de la voz.
- **Investigación en TTS de bajo coste computacional**: el modelo sirve como línea base reproducible para comparar calidad (WER, UTMOS22) frente a modelos mucho mayores, dado su reducido tamaño y su licencia permisiva.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Open TTS Leaderboard — WER | 0,71% (4/50) | Inglés |
| Open TTS Leaderboard — UTMOS22 | 4,49 | Segunda puntuación más alta |
| Velocidad de inferencia | 48,87x tiempo real | Sobre GPU H200 |

No se han publicado en la información disponible resultados comparativos con otros modelos en la misma tabla, ni cifras de MMLU, HumanEval o GSM8K (no aplican a un modelo de TTS).

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma explícita; con 34,31M de parámetros y un repositorio de 0,2 GB, la huella en memoria es muy reducida y previsiblemente inferior a 1 GB en precisión completa, aunque el autor no publica la cifra exacta.
- **GPU recomendadas**: el rendimiento declarado de 48,87x tiempo real se midió en una NVIDIA H200; por el tamaño del modelo, cualquier GPU CUDA moderna (RTX 4090, RTX 3090, A100, etc.) debería ser suficiente.
- **Compatibilidad con GPU de consumo**: sí, el modelo está pensado para ejecutarse en CPU y CUDA, por lo que cabe en cualquier GPU de consumo e incluso en CPU sin GPU dedicada.
- **Opciones de despliegue**: el repositorio incluye el paquete de inferencia v3 propio del autor; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a LLM, no a TTS). Existe un playground en Hugging Face Spaces y un repositorio en GitHub con la librería.
- **Latencia y throughput**: 48,87x tiempo real sobre H200 según la model card; no se publican cifras para CPU ni para otras GPU.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos de TTS comparables (parámetros, contexto, rendimiento, licencia) que permitan construir una tabla rigurosa. El propio autor sitúa el modelo en el Open TTS Leaderboard, donde ocupa la segunda posición en UTMOS22, pero no se detallan los competidores ni sus cifras en la información disponible.

## Limitaciones y advertencias

- **Idioma**: solo soporta inglés; no se ha documentado soporte para castellano ni otros idiomas.
- **Sesgos**: no se documentan sesgos conocidos en la model card; al estar entrenado presumiblemente con voces inglesas, los perfiles pueden reflejar sesgos acentuales y de género de la muestra de entrenamiento.
- **Riesgo de alucinación**: no aplica en el sentido de un LLM, pero un modelo de TTS puede producir pronunciaciones incorrectas, omisiones o artefactos acústicos en textos con nombres propios, siglas o estructuras sintácticas atípicas.
- **Clonación de voz**: la función de perfil de voz a partir de una grabación de referencia conlleva riesgos de suplantación; es responsabilidad del usuario obtener consentimiento y cumplir la normativa aplicable (por ejemplo, el AI Act europeo en materia de transparencia).
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no se documentan restricciones adicionales, pero conviene revisar los términos de las voces de referencia si se usan grabaciones de terceros.
- **Documentación técnica incompleta**: no se detallan arquitectura, dataset, cuantizaciones ni formato de pesos, lo que dificulta la reproducibilidad y la evaluación independiente.
- **Madurez**: el repositorio se creó el 10 de noviembre de 2026 y se actualizó el 19 de noviembre de 2026, con 893 descargas y 48 likes; es un proyecto reciente y de un solo autor, sin el respaldo de una organización grande.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/owensong/Inflect-Mini-v3)
- [Playground en Hugging Face Spaces](https://huggingface.co/spaces/owensong/Inflect-v3)
- [Repositorio en GitHub](https://github.com/owenawsong/Inflect)
- [Colección Inflect v3 en Hugging Face](https://huggingface.co/collections/owensong/inflect-v3)
- [Documentación de descargas v3](https://github.com/owenawsong/Inflect/blob/main/docs/v3/downloads.md)
- [Servidor de Discord](https://discord.gg/CVJYedvzvp)
