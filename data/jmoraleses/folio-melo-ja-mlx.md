# jmoraleses/folio-melo-ja-mlx

## Resumen

Folio Melo MLX (ja) es una conversión del checkpoint de inferencia de MeloTTS VITS2 al formato Safetensors, empaquetada para la implementación nativa en Swift/MLX de la aplicación Folio. Lo publica el usuario jmoraleses y no constituye un lanzamiento oficial de MyShell, sino un artefacto derivado del modelo original `myshell-ai/MeloTTS-Japanese` (revisión `367f8795464b531b4e97c1515bddfc1243e60891`). El modelo resuelve la síntesis de voz (text-to-speech) en japonés para inferencia en dispositivo con Apple Silicon.

La relevancia es acotada pero concreta: se trata de un checkpoint de inferencia de 41.576.193 parámetros (unos 41,6 M) en safetensors, con un tamaño de repositorio de 0,2 GB, pensado para ejecutarse localmente en iOS mediante MLX sin depender de servicios en la nube. Al excluir el discriminador de entrenamiento, el cuantizador y los artefactos del predictor de duración, el paquete contiene únicamente los pesos necesarios para inferencia, lo que reduce el peso y simplifica el despliegue.

No es un modelo de lenguaje: es un sistema TTS basado en VITS2 con soporte declarado para japonés (etiqueta `ja`). La licencia es MIT, heredada de MeloTTS. La información pública disponible es escasa: no hay pipeline declarado, no se listan idiomas en los metadatos de HuggingFace y no se publican benchmarks ni detalles de entrenamiento más allá de la procedencia del checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS2 (MeloTTS), checkpoint de inferencia |
| Parametros totales | 41.576.193 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; sin variantes GGUF ni cuantizadas publicadas) |
| Idiomas soportados | japones (etiqueta `ja`; metadatos de idioma no disponibles en HuggingFace) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), con `config.json` y `source.json` |

## Arquitectura y entrenamiento

El modelo es un checkpoint de inferencia de MeloTTS basado en VITS2, una arquitectura de síntesis de voz de extremo a extremo que combina un codificador de texto, un predictor de duración, un flujo normalizador y un decodificador generativo para producir audio a partir de fonemas o símbolos. La conversión a safetensors excluye explícitamente el discriminador usado solo en entrenamiento, el cuantizador y los artefactos del predictor de duración, de modo que el archivo `model.safetensors` contiene únicamente los pesos necesarios para inferencia. El `config.json` incluye dimensiones del modelo, símbolos y IDs de idioma consumidos por Folio.

No se dispone de información sobre el número de tokens, la composición del dataset de entrenamiento, ni sobre si se aplicaron técnicas de RLHF o DPO; estos detalles corresponden al modelo original de MyShell y no se documentan en esta conversión. La innovación técnica relevante aquí no está en el entrenamiento, sino en el empaquetado: la conversión está pensada para la implementación nativa en Swift/MLX de Folio, con el script de conversión disponible en el repositorio Folio iOS (`Scripts/convert-melo-to-mlx.py`). No se documentan técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz (text-to-speech) en japonés a partir de texto de entrada.
- Generación de audio con la arquitectura VITS2 de MeloTTS.
- Inferencia en dispositivo sobre Apple Silicon mediante MLX y la implementación Swift de Folio.
- Ejecución local sin dependencia de API externa, al distribuirse los pesos en safetensors.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión ni audio de entrada.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües más allá de la etiqueta `ja`.

## Casos de uso

- Lectura por voz en aplicaciones iOS: el modelo puede integrarse en la app Folio para convertir texto en audio japonés directamente en el dispositivo, aprovechando MLX y evitando enviar contenido a servidores externos.
- Accesibilidad: síntesis de voz local para usuarios con discapacidad visual o dificultades de lectura en japonés, con latencia baja al no requerir round-trip de red.
- Asistentes conversacionales en japonés: generación de respuestas habladas en un asistente embebido, usando el checkpoint como motor TTS dentro de un pipeline mayor de ASR y LLM.
- Aprendizaje de idiomas: reproducción de pronunciación japonesa de frases y vocabulario en aplicaciones educativas, con audio generado bajo demanda.
- Contenido multimedia automatizado: narración de textos cortos para vídeos, podcasts o audiolibros en japonés, generando audio por lotes en local.
- Prototipado e investigación en TTS: al ser un checkpoint de inferencia ligero (41,6 M de parámetros, 0,2 GB), sirve para experimentar con VITS2 y MLX en Apple Silicon sin infraestructura de GPU dedicada.
- Pruebas de integración en pipelines Swift/MLX: validación del motor de inferencia de Folio con un modelo TTS real antes de desplegar variantes adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 41,6 M de parámetros en safetensors, el peso de los pesos ronda los 0,17 GB en precisión de 32 bits, por lo que la huella de memoria es muy reducida.
- GPU recomendadas: el modelo está orientado a Apple Silicon mediante MLX; no se documentan requisitos para GPU NVIDIA.
- Cabe en hardware de consumo: sí, por tamaño (0,2 GB de repositorio) es apto para dispositivos Apple Silicon, incluidos iPhone y Mac con chip de la serie M.
- Opciones de despliegue: implementación nativa en Swift/MLX de la app Folio; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Folio Melo MLX (ja) | 41.576.193 | no disponible | MIT | HuggingFace (jmoraleses) | Conversión no oficial para MLX/Swift |
| myshell-ai/MeloTTS-Japanese | no disponible | no disponible | MIT | HuggingFace (oficial) | Checkpoint original de MyShell |
| Otros motores TTS (p. ej. Piper, Coqui TTS) | no disponible | no disponible | variable | variable | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información disponible.

## Limitaciones y advertencias

- Es una conversión no oficial: no procede de MyShell y no debe presentarse como lanzamiento oficial.
- Solo se declara soporte para japonés; no hay evidencia de otros idiomas en esta conversión.
- No se documentan sesgos conocidos, pero al ser un modelo TTS entrenado con datos de voz, puede heredar sesgos de pronunciación y prosodia del corpus original.
- Riesgo de alucinación en el sentido de pronunciaciones incorrectas o prosodia anómala en texto fuera de distribución; no se han publicado evaluaciones al respecto.
- La licencia MIT permite uso comercial, pero conviene verificar la procedencia y los términos del checkpoint original de MyShell.
- El modelo no incluye el discriminador, cuantizador ni predictor de duración como artefactos separados; la inferencia depende de la implementación en Swift/MLX de Folio.
- No hay pipeline declarado ni idiomas listados en los metadatos de HuggingFace, lo que dificulta su uso con herramientas estándar.
- El número de descargas (30) y la ausencia de likes indican una adopción muy limitada; no hay validación comunitaria documentada.

## Enlaces

- HuggingFace: https://huggingface.co/jmoraleses/folio-melo-ja-mlx
- Checkpoint original: https://huggingface.co/myshell-ai/MeloTTS-Japanese
- Repositorio Folio iOS (script de conversión): https://github.com/jmoraleses/Folio-iOS
- BERT francés referenciado en la model card: https://huggingface.co/dbmdz/bert-base-french-europeana-cased
