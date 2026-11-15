# Phoonnx/vits-hitz-eu_antton

## Resumen

`vits-hitz-eu_antton` es un modelo de síntesis de voz (text-to-speech) en formato ONNX, publicado por el usuario Phoonnx como una extracción del repositorio agregador `Phoonnx/phoonnx-vits`, concretamente de la carpeta `hitz-eu_antton`. Emplea la arquitectura VITS, un modelo generativo de extremo a extremo que combina un codificador de texto, un normalizador de flujo temporal (flow) y un decodificador vocacional basado en HiFi-GAN para producir audio directamente a partir de texto, sin necesidad de un vocoder separado.

El modelo está pensado para su uso con la librería `phoonnx`, un runtime de inferencia ONNX orientado a voces Piper y VITS. El identificador de voz interno es `hitz/eu_antton-vits`, lo que sugiere una voz en euskera (código `eu`) con el nombre de hablante "Antton", aunque la model card no confirma explícitamente el idioma ni las características del hablante.

La relevancia de esta ficha es limitada: se trata de un artefacto derivado (una copia de una carpeta de un repositorio mayor) con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentación técnica propia. Su interés práctico radica en que permite desplegar una voz concreta de forma aislada en pipelines ONNX ligeros, siempre que se acepten las incertidumbres sobre idioma, licencia efectiva y calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech extremo a extremo con flow y decoder HiFi-GAN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS; la entrada es texto de longitud variable) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en ONNX; se desconoce si hay variantes cuantizadas) |
| Idiomas soportados | no disponible en la model card; el sufijo `eu` sugiere euskera, sin confirmacion oficial |
| Licencia | MIT (segun metadatos del repo y cabecera de la model card) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz condicional de extremo a extremo presentada en el trabajo "Conditional Variational Autoencoder with Adversarial Learning for End-to-End Text-to-Speech" (Kim et al., 2021). Combina un prior condicionado por texto, un normalizador de flujo afín y un decodificador basado en HiFi-GAN, entrenados de forma conjunta con pérdidas adversariales y de reconstrucción. El resultado es un modelo que genera formas de onda directamente desde fonemas o texto normalizado, con una calidad percibida alta para su tamaño y una latencia baja en inferencia.

En el caso de `vits-hitz-eu_antton`, la model card no aporta información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos, el hablante original ni si hubo ajuste fino o RLHF (no aplicable en TTS). Tampoco se documenta la innovación técnica específica de esta voz. El artefacto es una copia de la carpeta `hitz-eu_antton` del repositorio `Phoonnx/phoonnx-vits`, y los archivos conservan las rutas originales. El tamaño del repositorio es de 0,1 GB, coherente con un checkpoint VITS de tamaño pequeño-medio en formato ONNX.

## Capacidades

- Síntesis de voz a partir de texto (text-to-speech) en formato ONNX, ejecutable con la librería `phoonnx`.
- Generación de audio de extremo a extremo sin vocoder externo, gracias al decodificador HiFi-GAN integrado en VITS.
- Identificador de voz `hitz/eu_antton-vits` para seleccionar esta voz concreta dentro del runtime phoonnx.
- Compatibilidad con el ecosistema de voces Piper/VITS que phoonnx agrega, lo que facilita su integración junto a otras voces del mismo repositorio.
- No se documentan capacidades de clonación de voz, control de emoción, SSML avanzado, tool calling, razonamiento multietapa ni procesamiento multimodal. La model card no las menciona.
- El soporte multilingüe no está confirmado; el sufijo `eu` apunta a euskera, pero no hay declaración explícita.

## Casos de uso

- Lectura de contenido en euskera en aplicaciones de accesibilidad: el modelo puede convertir artículos, noticias o documentos en audio para usuarios con discapacidad visual, siempre que se valide previamente la calidad de pronunciación en euskera.
- Asistentes de voz embebidos: al ser un modelo VITS en ONNX de ~0,1 GB, puede desplegarse en dispositivos con recursos limitados (Raspberry Pi, móviles, edge) para dar respuestas habladas en un asistente local.
- Generación de audio para audiolibros y pódcasts: integrado en un pipeline de phoonnx, permite sintetizar capítulos completos por lotes con una voz consistente.
- Sistemas de anuncios y megafonía: útil para generar avisos pregrabados o dinámicos en transporte, comercios o edificios, donde la latencia baja de VITS es suficiente.
- Pruebas de integración en pipelines TTS: sirve como voz de referencia para validar el runtime phoonnx y comparar con otras voces del repositorio `phoonnx-vits`.
- Prototipos de interfaces conversacionales: para desarrolladores que necesitan una voz rápida y ligera en un MVP antes de invertir en un modelo TTS comercial de mayor calidad.
- Investigación en TTS de bajos recursos: permite experimentar con una voz VITS concreta sin entrenar desde cero, aunque la falta de documentación sobre el hablante limita su valor científico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0,1 GB) y la naturaleza de VITS, es plausible que quepa en menos de 1 GB de memoria, pero no hay confirmación oficial.
- GPU recomendadas: no disponible. VITS es lo bastante ligero para ejecutarse en CPU en muchos casos, pero no se documentan requisitos mínimos.
- ¿Cabe en GPU consumer? No confirmado, aunque por tamaño es probable que sí en cualquier GPU con al menos 2 GB de VRAM; se recomienda validar empíricamente.
- Opciones de despliegue: runtime `phoonnx` (https://github.com/TigreGotico/phoonnx) sobre ONNX Runtime. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a TTS.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Phoonnx/vits-hitz-eu_antton` | VITS (ONNX) | no disponible | no aplica | MIT (declarada) | Hugging Face, 0 descargas |
| Piper (voces oficiales) | VITS (ONNX) | variable por voz | no aplica | MIT en la mayoría de voces | Hugging Face y GitHub de rhasspy/piper |
| Coqui TTS (modelos VITS) | VITS | variable | no aplica | MPL-2.0 en el código; licencias variables por checkpoint | GitHub y Hugging Face |
| Kokoro TTS | StyleTTS2 / arquitectura propia | ~82M | no aplica | Apache 2.0 | Hugging Face |

La comparación es aproximada: no se dispone de datos de rendimiento ni de parámetros de este checkpoint concreto, por lo que la tabla solo contrasta categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- La model card no especifica el idioma ni el hablante de forma explícita; el uso en euskera es una inferencia a partir del sufijo `eu`, no una confirmación del autor.
- No hay información sobre el dataset de entrenamiento, lo que impide evaluar sesgos de género, acento, edad o calidad de pronunciación.
- Riesgo de alucinación no aplica en el sentido de texto generado, pero sí existe riesgo de pronunciaciones incorrectas, artefactos acústicos y prosodia antinatural en textos fuera del dominio de entrenamiento.
- La licencia MIT se declara en los metadatos, pero la propia model card advierte que "las licencias siguen a los originales por subcarpeta" y que algunas voces del repositorio fuente carecen de licencia declarada. Conviene verificar la carpeta original antes de uso comercial.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación por la comunidad.
- El repositorio es un artefacto derivado; si el repositorio fuente `Phoonnx/phoonnx-vits` se elimina o cambia, esta copia puede quedar desactualizada.
- No se documentan limitaciones de longitud de texto, pero los modelos VITS suelen degradarse en entradas muy largas; se recomienda segmentar el texto.
- No hay garantía de soporte a largo plazo ni mantenimiento por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-hitz-eu_antton
- Repositorio fuente: https://huggingface.co/Phoonnx/phoonnx-vits
- Runtime phoonnx: https://github.com/TigreGotico/phoonnx
- Paper de VITS (Kim et al., 2021): https://arxiv.org/abs/2106.06103
- Repositorio Piper (voces VITS relacionadas): https://github.com/rhasspy/piper
