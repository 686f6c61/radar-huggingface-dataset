# bharatgenai/Shrutam-2

## Resumen

Shrutam-2 es un modelo de reconocimiento automático del habla (ASR) desarrollado por bharatgenai, orientado específicamente al multilingüismo de la India. Combina una arquitectura de tipo Conformer para la codificación acústica con un componente de mezcla de expertos (MoE) y un modelo de lenguaje, según indican sus etiquetas en Hugging Face. Con aproximadamente 1.910 millones de parámetros y un repositorio de 18,2 GB, el modelo se distribuye en formato safetensors con código personalizado y licencia Apache 2.0.

Su relevancia radica en la cobertura de doce idiomas del subcontinente indio (hindi, maratí, tamil, telugu, malabar, canarés, oriya, bengalí, urdu, asamés, guyaratí y panyabí), un conjunto que rara vez aparece cubierto con calidad en modelos ASR generalistas. Está publicado bajo un acceso restringido (gated) que exige aceptar condiciones en Hugging Face antes de la descarga.

La ficha se basa exclusivamente en la información disponible en la model card y los metadatos del repositorio; los detalles de entrenamiento, benchmarks y composición del dataset no se han publicado en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer con mezcla de expertos (MoE) y componente de modelo de lenguaje |
| Parametros totales | 1.907.830.792 (~1,91 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hi, mr, ta, te, ml, kn, or, bn, ur, as, gu, pa (12 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con código personalizado, `custom_code`) |

## Arquitectura y entrenamiento

La información disponible indica una arquitectura Conformer, habitual en ASR por combinar convoluciones locales con auto-atención para capturar dependencias acústicas y de largo alcance. Sobre esa base se añade un componente de mezcla de expertos (MoE) y un modelo de lenguaje, una combinación que en ASR se asocia a decodificación neuronal y a especialización por idioma o dominio. El repositorio incluye código personalizado (`custom_code`), por lo que la carga del modelo requiere confiar en la implementación del autor (`trust_remote_code`).

No se han publicado en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de ajuste supervisado, RLHF o DPO. Tampoco se detallan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Reconocimiento automático del habla (speech-to-text) multilingüe para 12 idiomas de la India.
- Transcripción de audio en hindi, maratí, tamil, telugu, malabar, canarés, oriya, bengalí, urdu, asamés, guyaratí y panyabí.
- Componente de modelo de lenguaje integrado, orientado a la decodificación o al post-procesado del texto reconocido.
- Mezcla de expertos (MoE), que sugiere especialización condicional por idioma o segmento acústico.
- No se ha documentado soporte de tool calling, function calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Subtitulado automático de contenido audiovisual en idiomas regionales: el modelo puede transcribir audio en cualquiera de los 12 idiomas soportados, lo que lo hace adecuado para plataformas de vídeo que necesitan subtítulos en lenguas del subcontinente.
- Transcripción de reuniones y llamadas en atención al cliente: útil en centros de contacto que operan en varios idiomas indios, donde un único modelo evita mantener un pipeline distinto por lengua.
- Generación de actas y notas en entornos sanitarios o administrativos: la transcripción de consultas o trámites en idiomas regionales permite digitalizar procesos que hoy dependen de taquigrafía manual.
- Indexación y búsqueda de archivos de audio: convertir grabaciones históricas en texto buscable facilita la recuperación de información en archivos de radio, tribunales o instituciones públicas.
- Accesibilidad: subtitulado en directo para personas con discapacidad auditiva en emisiones regionales, aprovechando la cobertura multilingüe del modelo.
- Investigación lingüística y creación de corpus: transcripción masiva de grabaciones de campo en lenguas con pocos recursos, como base para estudios fonéticos o para entrenar otros modelos.
- Asistentes de voz para administración pública: transcripción de consultas ciudadanas en el idioma local antes de derivarlas a un sistema de respuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con ~1,91 mil millones de parámetros, la inferencia en FP16 requiere aproximadamente 3,8 GB solo para los pesos; en FP32, unos 7,6 GB. A ello hay que sumar la memoria del codificador acústico y del decodificador en tiempo de ejecución, por lo que conviene prever margen adicional.
- GPU recomendadas: A100 o H100 para despliegues de alta concurrencia; una RTX 4090 (24 GB) es holgada para inferencia en FP16 de una sola instancia.
- GPU de consumo: cabe en tarjetas con 8 GB o más en FP16; en cuantización de 8 bits podría ajustarse a 6 GB, aunque no se documentan cuantizaciones oficiales.
- Opciones de despliegue: al requerir código personalizado, la vía natural es `transformers` con `trust_remote_code=True`. No se ha confirmado compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Acceso |
|---|---|---|---|---|
| Shrutam-2 | ~1,91 B | 12 idiomas de la India | Apache 2.0 | Gated |
| Whisper large-v3 (OpenAI) | ~1,55 B | ~99 idiomas | MIT | Abierto |
| IndicWhisper / modelos ASR específicos para la India | no disponible | idiomas indios | variable | variable |

No se dispone de datos de rendimiento comparado en la información proporcionada; la comparación se limita a parámetros, cobertura idiomática y licencia.

## Limitaciones y advertencias

- Acceso restringido: requiere aceptar condiciones en Hugging Face antes de descargar el modelo.
- Dependencia de código personalizado (`custom_code`): la carga exige `trust_remote_code=True`, lo que implica ejecutar código del autor.
- Sin datos publicados sobre sesgos, tasas de alucinación o robustez ante ruido, acentos o audio de baja calidad.
- Cobertura limitada a 12 idiomas indios; no se documenta comportamiento en otras lenguas.
- No se han publicado detalles de entrenamiento ni evaluaciones, lo que dificulta estimar su calidad frente a alternativas.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones adicionales del acceso gated.
- No se documentan cuantizaciones oficiales ni soporte en motores de inferencia de alto rendimiento.

## Enlaces

- Hugging Face: https://huggingface.co/bharatgenai/Shrutam-2
- Paper (arXiv): https://arxiv.org/abs/2601.19451
