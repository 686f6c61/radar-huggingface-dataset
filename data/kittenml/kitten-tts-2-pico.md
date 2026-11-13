# KittenML/kitten-tts-2-pico

## Resumen

Kitten TTS 2 Pico es un modelo de síntesis de voz (text-to-speech) desarrollado por KittenML, publicado en Hugging Face bajo licencia Apache-2.0. Se trata de un modelo extremadamente compacto: 7,2 millones de parámetros por modelo de idioma, con pesos cuantizados a int8 en formato ONNX que ocupan tan solo 8,0 MB. Genera audio a 24 kHz y cubre ocho idiomas (inglés, alemán, español, italiano, portugués, ruso, hindi y francés) con un total de 30 voces predefinidas.

Su propuesta de valor es la eficiencia: el backend ONNX por defecto ejecuta el grafo int8 con ONNX Runtime sobre CPU, sin necesidad de PyTorch ni de GPU. Esto lo hace adecuado para despliegues en dispositivos con recursos limitados, aplicaciones de escritorio, sistemas embebidos o pipelines de generación de audio a gran escala donde el coste por inferencia y la latencia de arranque son críticos. Adicionalmente, se distribuyen los pesos float32 en PyTorch para quienes necesiten ejecución en GPU o quieran ajustar el modelo.

El modelo se publicó el 13 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni interacciones en Hugging Face. La model card no documenta la arquitectura interna, los datos de entrenamiento ni resultados de benchmarks, por lo que varios apartados de esta ficha quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS; pesos distribuidos en ONNX y PyTorch) |
| Parametros totales | 7,2 M por modelo de idioma |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (ONNX, 8,0 MB); float32 (PyTorch) |
| Idiomas soportados | en, de, es, it, pt (Brasil), ru, hi, fr |
| Licencia | Apache-2.0 (modelos, voice packs y ficheros G2P incluidos) |
| Formato de pesos | ONNX (int8) y safetensors/PyTorch (float32) |
| Frecuencia de muestreo | 24 kHz |
| Voces | 30 en total (4 en en, de, es, it, pt, ru y fr; 2 en hi) |
| Tamano del repo | 0,3 GB |
| Libreria | onnx |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna del modelo (tipo de decoder, uso de difusión, VITS, flow matching u otra familia), ni el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de alineamiento como RLHF o DPO. Tampoco se detalla el mecanismo de conversión grafema-fonema (G2P), más allá de que los ficheros G2P están incluidos en el paquete y cubiertos por la licencia Apache-2.0.

Lo que sí se documenta es la estructura de despliegue: cada idioma cuenta con su propio modelo de 7,2 M de parámetros, y las voces se almacenan como voice packs en ficheros `voices_<lang>.npz`, identificados por el nombre en minúsculas de la voz. El backend ONNX ejecuta el grafo int8 con ONNX Runtime y el backend PyTorch ejecuta los pesos float32, con posibilidad de fijar `device="cuda"`. La librería `kittenml` descarga únicamente los ficheros que necesita el backend seleccionado.

## Capacidades

- Síntesis de voz a partir de texto en ocho idiomas: inglés, alemán, español, italiano, portugués de Brasil, ruso, hindi y francés.
- 30 voces predefinidas con nombres y descripciones de estilo (por ejemplo, "Somber historian (female)" o "Grizzled war veteran gravelly (male)" en inglés).
- Selección de voz por nombre (insensible a mayúsculas) o por descripción; si no se especifica voz, se usa la primera del idioma.
- Control de velocidad mediante el parámetro `speed` (por ejemplo, `speed=1.1`).
- Selección de idioma explícita mediante el parámetro `language`, que usa la primera voz de ese idioma.
- Salida de audio a 24 kHz compatible con `soundfile` para escritura en WAV.
- Ejecución en CPU sin PyTorch mediante ONNX Runtime (backend por defecto), o en GPU con el backend PyTorch.
- No se documentan capacidades de clonación de voz, control de emoción, tool calling, agentes ni procesamiento multimodal.

## Casos de uso

- Lectura de artículos y documentos en aplicaciones de accesibilidad: el modelo puede convertir texto a voz en el cliente con un peso de 8,0 MB en int8, lo que permite empaquetarlo dentro de una aplicación de escritorio o móvil sin depender de servicios en la nube.
- Asistentes de voz para dispositivos con recursos limitados: al ejecutarse en CPU con ONNX Runtime y un modelo de 7,2 M de parámetros por idioma, es viable en Raspberry Pi, routers o electrodomésticos conectados donde no cabe un modelo TTS de mayor tamaño.
- Generación de audiolibros y pódcasts sintéticos: las 30 voces y el control de velocidad permiten narrar contenido largo con distintas voces por idioma y ajustar el ritmo de lectura según el tipo de contenido.
- Localización de contenido multimedia: con soporte para ocho idiomas, se puede generar la pista de voz de un mismo guion en inglés, alemán, español, italiano, portugués, ruso, hindi y francés usando la API unificada de `kittenml`.
- Sistemas de anuncios y notificaciones por voz en producción: la licencia Apache-2.0 y la ausencia de dependencia de GPU facilitan el despliegue en contenedores ligeros con latencia de arranque baja.
- Prototipado rápido de interfaces conversacionales: la instalación vía `pip install kittenml` y la API de tres líneas permiten integrar TTS en demos y pruebas de concepto sin infraestructura dedicada.
- Generación de voces para videojuegos y aplicaciones educativas: los voice packs por idioma y los estilos descritos (historiador, abuela, músico de blues, veterano de guerra) permiten asignar voces diferenciadas a personajes sin entrenamiento adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el backend ONNX por defecto (ejecución en CPU). Para el backend PyTorch en GPU, la model card no especifica requisitos de VRAM; con 7,2 M de parámetros por idioma, el peso de los tensores en float32 es del orden de decenas de MB, aunque el consumo real del runtime no está documentado.
- GPU recomendadas: no documentadas. El backend PyTorch acepta `device="cuda"`, pero la model card no indica GPU mínimas ni modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no confirmada por el autor; el diseño del modelo está orientado a CPU.
- Opciones de despliegue: ONNX Runtime (backend `onnx`, por defecto) y PyTorch (backend `torch`, con soporte de CUDA). La librería oficial es `kittenml`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada. A modo de referencia estructural, se indica lo que sí está documentado de este modelo frente a lo que no:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Kitten TTS 2 Pico | 7,2 M por idioma | no disponible | 8 | Apache-2.0 | ONNX int8, PyTorch float32 |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo ni de los voice packs; al ser un TTS entrenado con datos no especificados, el riesgo de sesgos de pronunciación, prosodia o representación de voces no puede evaluarse a partir de la información disponible.
- No se documenta el comportamiento ante texto fuera de dominio (siglas, números, código, nombres propios) ni la calidad de la G2P en cada idioma.
- No se especifica la longitud máxima de texto por petición ni el comportamiento con entradas muy largas; conviene trocear el texto en producción.
- El modelo no incluye clonación de voz ni control emocional; las voces son fijas y su estilo viene descrito en la model card.
- La licencia Apache-2.0 permite uso comercial de modelos, voice packs y ficheros G2P, pero no se documentan garantías ni limitaciones adicionales por parte del autor.
- El repositorio no registra descargas ni interacciones en el momento de la ficha, por lo que no hay evidencia pública de uso en producción ni de validación independiente.
- El modelo está pensado para ejecución en CPU; el rendimiento en GPU no está cuantificado y podría no ser óptimo.

## Enlaces

- Hugging Face: https://huggingface.co/KittenML/kitten-tts-2-pico
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
