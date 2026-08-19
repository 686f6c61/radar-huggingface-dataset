# msingiai/dia

## Resumen

El modelo **msingiai/dia** es un sistema de texto a voz (TTS) para swahili desarrollado por **Msingi-AI**, una iniciativa centrada en inteligencia artificial para lenguas africanas. Se trata de un ajuste fino supervisado completo (full SFT) del modelo base **nari-labs/Dia-1.6B**, un modelo de generación de audio de 1.600 millones de parámetros creado por Nari Labs. El objetivo principal es ofrecer una voz sintética de alta calidad en swahili, una lengua hablada por más de 200 millones de personas, que tradicionalmente ha carecido de sistemas TTS robustos y abiertos.

El modelo se entrena sobre un corpus de 500 horas de habla swahili procedente de 15 conjuntos de datos públicos, e incorpora soporte para **code-switching** (alternancia entre swahili e inglés dentro de una misma frase), un fenómeno habitual en el habla real. Esto lo hace especialmente útil para aplicaciones de narración, asistentes de voz y generación de contenido en contextos multilingües. Su licencia CC-BY-4.0 permite uso comercial con atribución, lo que facilita su adopción en productos.

La relevancia actual de este modelo radica en su carácter abierto y específico para una lengua africana, en un momento en que la mayoría de los TTS comerciales se centran en lenguas mayoritarias. Además, su integración con el runtime `dia-infer` simplifica el despliegue en entornos de producción, incluyendo streaming en tiempo real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (basado en el modelo base Dia-1.6B, sin detalles públicos) |
| Parametros totales | 1.6 mil millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Swahili (con code-switching a ingles) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | No especificado (repo de 6.4 GB, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo del modelo base **Dia-1.6B**, que es un modelo de texto a audio de 1.600 millones de parámetros. No se han publicado detalles sobre la arquitectura interna (si es un transformer estándar, si utiliza atención lineal u otras innovaciones), pero por el nombre y la naturaleza de la tarea se infiere que se trata de un modelo basado en transformadores con capacidad de generar audio muestreado.

El entrenamiento consistió en una **supervisión completa (SFT)** sobre un corpus de 500 horas de habla swahili, combinando 15 conjuntos de datos públicos como Common Voice, FLEURS, AfriVoice y otros. No se menciona el uso de RLHF o DPO; el proceso se limita a un ajuste supervisado. Una característica técnica destacable es el manejo explícito del code-switching: durante el entrenamiento se mapea el marcador `[sw]` al byte 8, lo que permite al modelo alternar entre swahili e inglés de forma natural. El runtime `dia-infer` se encarga de normalizar el texto y añadir este marcador automáticamente.

## Capacidades

- Generación de voz en swahili a partir de texto, con una única voz aprendida (no clona voces).
- Soporte de code-switching: puede pronunciar frases que mezclan swahili e inglés, manteniendo una pronunciación natural.
- Salida de audio en formato PCM16 mono a 44.1 kHz, con posibilidad de streaming por WebSocket.
- Generación determinista mediante semilla fija y parámetros de muestreo configurables (temperatura, top-p, cfg_scale).
- No requiere audio de referencia para funcionar, aunque se puede condicionar con una referencia para mayor consistencia de voz.
- Integración con el runtime `dia-infer` que facilita la inferencia local o en la nube (Modal).

## Casos de uso

- **Narración de noticias y boletines informativos**: el modelo puede leer titulares y artículos en swahili con una voz clara, útil para emisoras de radio o plataformas de podcasting. Su capacidad de code-switching permite insertar términos en inglés sin romper la fluidez.
- **Audiolibros en swahili**: permite convertir textos literarios o educativos en audio, ampliando el acceso a la lectura en zonas con baja alfabetización. La salida de 44.1 kHz es adecuada para producción de audio.
- **Asistentes de voz para aplicaciones móviles**: integrable en asistentes personales o sistemas de atención al cliente que operen en swahili, gracias a su baja latencia en GPU de gama media (A10G) y soporte de streaming.
- **Generación de contenido educativo**: creación de lecciones de idiomas o material de aprendizaje en swahili, donde la pronunciación correcta y el manejo de términos técnicos en inglés son esenciales.
- **Accesibilidad para personas con discapacidad visual**: lectura de pantalla o de documentos en swahili, mejorando la inclusión digital en países de África Oriental.
- **Doblaje y locución para vídeo**: el modelo puede generar locuciones para vídeos promocionales, tutoriales o animaciones, evitando la necesidad de contratar actores de voz para proyectos de bajo presupuesto.

## Benchmarks y rendimiento

Los siguientes datos provienen de la model card del autor y no han sido verificados de forma independiente. Se refieren a un conjunto de evaluación de 48 frases curadas, con reintentos guiados por ASR (hasta 4 intentos).

| Metrica | Swahili plano | Code-switching |
|---|---|---|
| CER (tasa de error de caracteres) | 0.011 | 0.050 |
| WER (tasa de error de palabras) | 0.054 | 0.286 |

Además, en un benchmark más exigente de 500 frases de noticias no vistas, el CER en swahili plano es de **0.021** con reintentos y **0.060** en una sola pasada. Esto indica que el uso de reintentos mejora significativamente la calidad, y se recomienda activar el bucle de reintentos en producción.

## Requisitos de hardware

- **VRAM estimada**: no se especifica, pero una GPU con 24 GB de VRAM (como A10G) es suficiente para inferencia en tiempo real.
- **GPU recomendadas**: A10G, A100, RTX 4090 o similares. En CPU no se recomienda para uso en tiempo real.
- **Compatibilidad con GPUs de consumo**: sí, una RTX 4090 (24 GB) puede ejecutar el modelo sin problemas.
- **Opciones de despliegue**: 
  - Runtime `dia-infer` con soporte local (CUDA) y despliegue en Modal (contenedores persistentes).
  - API Python con streaming de PCM16.
  - Endpoint HTTPS y WebSocket para integración en servicios web.
- **Latencia**: no se proporcionan cifras exactas, pero se indica que una A10G permite generación en tiempo real.

## Comparativa con modelos similares

No se dispone de información pública sobre otros modelos TTS específicos para swahili con características comparables (tamaño, code-switching, licencia abierta). Por tanto, no se puede realizar una comparativa directa en este momento.

## Limitaciones y advertencias

- **Voz única**: el modelo no clona voces; solo produce una voz aprendida, lo que limita su uso en aplicaciones que requieran múltiples locutores o personalización de voz.
- **Code-switching imperfecto**: aunque mejora respecto a modelos genéricos, el WER en frases con code-switching es alto (0.286), lo que puede generar errores en contextos con muchos anglicismos.
- **Dependencia de reintentos**: la calidad óptima requiere el bucle de reintentos guiado por ASR; en inferencia de una sola pasada el CER aumenta de 0.021 a 0.060.
- **Salidas cortas inestables**: la referencia condicionada puede hacer que frases breves suenen apuradas o inestables; se aplica un ajuste de tempo por defecto (`conditioned_tempo=0.9`) como mitigación parcial.
- **Licencia CC-BY-4.0**: permite uso comercial, pero exige atribución al autor. Es necesario revisar los términos de los datasets subyacentes para garantizar el cumplimiento.
- **Documentación limitada**: no se publican detalles sobre la arquitectura interna, lo que dificulta la reproducción o adaptación del modelo.

## Enlaces

- Modelo en Hugging Face: [https://huggingface.co/msingiai/dia](https://huggingface.co/msingiai/dia)
- Repositorio de evaluación y análisis: [https://github.com/Msingi-AI/dia_sw](https://github.com/Msingi-AI/dia_sw)
- Runtime de inferencia `dia-infer`: [https://github.com/Msingi-AI/dia-infer](https://github.com/Msingi-AI/dia-infer)
- Organización Msingi-AI en GitHub: [https://github.com/Msingi-AI/](https://github.com/Msingi-AI/)
- Modelo base Dia-1.6B: [https://huggingface.co/nari-labs/Dia-1.6B](https://huggingface.co/nari-labs/Dia-1.6B)
