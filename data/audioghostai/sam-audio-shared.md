# audioghostai/sam-audio-shared

## Resumen

SAM-Audio shared components (AudioGhost copy) es un repositorio de pesos parciales del modelo SAM-Audio de Meta, republicado por el usuario audioghostai para su integración en el proyecto AudioGhost. No se trata de un modelo completo, sino del códec de audio DACVAE en precisión float32 que comparten las tres variantes de tamano de SAM-Audio (Small, Base y Large). El autor lo empaqueta por separado para evitar duplicar 410,8 MB en cada repositorio de tamano, que contienen únicamente los pesos del transformer.

El modelo original SAM-Audio aborda la separación de fuentes de audio (source separation), es decir, aislar componentes individuales de una mezcla sonora. Este repositorio concreto solo aporta la pieza de codificación y decodificación de audio, no la lógica de separación. Su relevancia es operativa: quien quiera reconstruir o ejecutar SAM-Audio con el stack de AudioGhost necesita este fichero junto con uno de los repositorios de tamano correspondientes.

La licencia es la SAM License de Meta, que impone condiciones específicas de redistribución y control de exportaciones. El repositorio no está respaldado ni mantenido por Meta y no incluye información sobre idiomas soportados ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Códec de audio DACVAE (variante de VAE con cuantización residual, según nomenclatura DAC) |
| Parametros totales | no disponible (el fichero pesa 430.723.572 bytes en float32) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en float32) |
| Idiomas soportados | no disponible (procesa audio, no texto) |
| Licencia | SAM License (licencia propia de Meta, identificada como "other" / "sam-license") |
| Formato de pesos | safetensors (`audio_codec.safetensors`, SHA-256 `93929d357aadba28365a643cf5513dbb49e059a3045d7e8c0729108efd964a49`) |

## Arquitectura y entrenamiento

El fichero contiene el códec DACVAE en float32, componente compartido e idéntico en los checkpoints Small, Base y Large de SAM-Audio. DACVAE es un códec neuronal de audio basado en autoencoder variacional con cuantización residual, empleado para comprimir la forma de onda en una representación latente discreta sobre la que opera el transformer de separación. Al ser idéntico entre tamanos, el autor lo extrae del checkpoint `facebook/sam-audio-small@20b65f56888142eebe7c37448c6f6b3b32600e9b` y lo publica una sola vez.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de alineación como RLHF o DPO en el modelo original. Este repositorio tampoco documenta innovaciones de decodificación o atención, ya que solo incluye el códec.

## Capacidades

- Codificación y decodificación de audio mediante el códec DACVAE, en float32.
- Soporte de la tarea de separación de fuentes de audio cuando se combina con los pesos del transformer de SAM-Audio (repositorios `audioghostai/sam-audio-small`, `-base` y `-large`).
- Integración con el pipeline `audio-to-audio` de Hugging Face.
- No incluye capacidades de generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling ni function calling.
- No está orientado a agentes ni a razonamiento multi-paso.
- No dispone de capacidades multilingües en el sentido textual; opera sobre señales de audio.
- No incluye modo de pensamiento (thinking), visión ni audio generativo.

## Casos de uso

- Separación de voces e instrumentos en producciones musicales: cargando este códec junto con uno de los repositorios de tamano, se puede aislar la pista vocal o un instrumento concreto de una mezcla para remezclas, karaoke o edición multipista.
- Limpieza de grabaciones de campo: separar ruido de fondo (tráfico, viento, murmullo) de la fuente principal en grabaciones de podcast o entrevistas, usando el códec como etapa de codificación y reconstrucción del audio.
- Postproducción de vídeo: aislar diálogos de música y efectos para doblaje o sustitución de bandas sonoras sin disponer de las pistas originales.
- Investigación en procesamiento de audio: punto de partida para experimentar con representaciones latentes DACVAE y comparar el comportamiento del códec entre las variantes Small, Base y Large de SAM-Audio.
- Preprocesado para pipelines de reconocimiento de voz: separar la voz del ruido ambiente antes de alimentar un sistema ASR, mejorando la relación señal-ruido de la entrada.
- Desarrollo de herramientas de accesibilidad: aislar la voz del interlocutor en entornos ruidosos para audífonos o subtitulado automático en tiempo casi real.
- Reproducción de experimentos de Meta: reconstruir el entorno de SAM-Audio con el stack de AudioGhost y verificar la equivalencia del códec con el checkpoint original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el fichero ocupa 410,8 MB en float32; en memoria durante la inferencia, el códec requiere aproximadamente 0,5 GB adicionales al transformer de separación, que no se incluye en este repositorio.
- GPU recomendadas: no disponible para el conjunto completo; el códec por sí solo puede ejecutarse en CPU y en GPUs de gama media.
- Cabe en GPU de consumo: sí, el códec en float32 ocupa menos de 1 GB, por lo que cabe en cualquier GPU consumer con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, etc.). El requisito real vendrá determinado por la variante del transformer que se cargue junto a él.
- Opciones de despliegue: no se documentan en el repositorio; al ser safetensors, es compatible con cargadores basados en PyTorch y con el ecosistema de Hugging Face. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI (orientados a modelos de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAM-Audio shared components (este repo) | no disponible (códec de 410,8 MB) | no disponible | Códec de audio para separación de fuentes | SAM License | Hugging Face, 0 descargas |
| SAM-Audio Small / Base / Large (Meta) | no disponible | no disponible | Separación de fuentes de audio | SAM License | Hugging Face (`facebook/sam-audio-*`) |
| Demucs (Meta) | no disponible | no disponible | Separación de fuentes musicales | MIT | GitHub y Hugging Face |
| AudioSep | no disponible | no disponible | Separación de audio por prompt en lenguaje natural | no disponible | GitHub |

La comparación se limita a la categoría funcional, ya que este repositorio no es un modelo autónomo sino un componente. Demucs y AudioSep son alternativas de separación de fuentes, pero no se dispone de datos comparativos de rendimiento entre ellas y SAM-Audio en la información proporcionada.

## Limitaciones y advertencias

- Este repositorio no contiene un modelo funcional por sí solo: sin los pesos del transformer de SAM-Audio no realiza separación de fuentes.
- No está hecho, respaldado ni soportado por Meta; el autor original es un tercero (audioghostai), lo que implica menor garantía de mantenimiento y verificación.
- La SAM License impone condiciones de redistribución: cualquier redistribución o trabajo derivado debe hacerse bajo la misma licencia e incluir una copia del texto.
- La SAM License incluye una sección de controles de exportación (Trade Controls) que puede restringir el uso en determinadas jurisdicciones.
- No hay información sobre sesgos del códec ni sobre su comportamiento con idiomas, acentos o tipos de audio específicos.
- Riesgo de alucinación no aplicable en el sentido textual, pero sí posible introducción de artefactos en la reconstrucción de audio.
- El repositorio registra 0 descargas y 0 likes, sin evidencia de uso en producción ni de validación por la comunidad.
- No se documentan limitaciones de contexto ni de longitud de audio soportada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/audioghostai/sam-audio-shared
- Repositorio original de SAM-Audio (Meta): https://github.com/facebookresearch/sam-audio
- Proyecto AudioGhost: https://github.com/0x0funky/audioghost-ai
- Checkpoint de origen: https://huggingface.co/facebook/sam-audio-small (commit `20b65f56888142eebe7c37448c6f6b3b32600e9b`)
- Repositorios de tamano del mismo autor: `audioghostai/sam-audio-small`, `audioghostai/sam-audio-base`, `audioghostai/sam-audio-large`
