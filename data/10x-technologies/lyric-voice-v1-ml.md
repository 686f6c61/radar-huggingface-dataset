# 10X-Technologies/lyric-voice-v1-ml

## Resumen

Lyric Voice v1 ML es un modelo de síntesis de voz (text-to-speech) desarrollado por 10X-Technologies, especializado en el idioma malabar (malayalam) y diseñado para inferencia en dispositivo (on-device). Se trata de un ajuste fino (finetune) del modelo base kyutai/pocket-tts, del que hereda la arquitectura y sobre el que se ha especializado la síntesis fonética y prosódica para el malabar. Con 336.068.290 parámetros (aproximadamente 336 M) y un repositorio de 1,3 GB, está pensado para entornos con recursos limitados donde no se puede depender de servicios TTS en la nube.

El modelo forma parte del ecosistema de producto Lyric de 10X-Technologies, una capa de gobernanza de voz orientada a mantener una identidad de marca consistente en agentes conversacionales. Esta versión concreta cubre el malabar, un idioma con cobertura TTS comparativamente escasa en el ecosistema open source, lo que le da un valor específico para aplicaciones regionales de la India.

La relevancia actual del modelo reside en tres factores: su tamaño reducido, que permite despliegue en hardware de consumo; su enfoque en un idioma de bajos recursos; y su licencia comunitaria específica (lyric-community-license) con acceso restringido en Hugging Face, que exige aceptar condiciones antes de la descarga. No se dispone de información pública sobre benchmarks, composición del dataset de entrenamiento ni detalles del proceso de ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: kyutai/pocket-tts) |
| Parametros totales | 336.068.290 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | malabar (ml) |
| Licencia | lyric-community-license (acceso restringido, gated) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna del modelo en la información disponible. El modelo es un ajuste fino del base kyutai/pocket-tts, un sistema TTS de Kyutai orientado a despliegue ligero, del que hereda presumiblemente el diseño de síntesis neuronal. El número de parámetros (336 M) es coherente con un modelo TTS compacto apto para inferencia en dispositivo.

Tampoco se dispone de datos sobre el corpus de entrenamiento: número de horas de audio, composición del dataset, hablantes, calidad de las grabaciones ni si se aplicaron técnicas de alineamiento forzado, normalización textual o ajuste prosódico específico para el malabar. Se desconoce igualmente si hubo etapas de RLHF, DPO o cualquier otro tipo de optimización por preferencias, algo poco habitual en modelos TTS puros. Cualquier afirmación sobre innovaciones técnicas (decodificación especulativa, atención lineal, vocoder concreto) sería especulativa y no se incluye.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en malabar.
- Generación de audio orientada a inferencia en dispositivo, sin dependencia de servicios en la nube.
- Especialización monolingüe en malabar; no consta soporte multilingüe ni cambio de idioma.
- No consta soporte de clonación de voz, control de estilo, emoción ni marcas prosódicas explícitas.
- No consta soporte de tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje generativo general).
- No consta capacidad de visión, audio de entrada ni modo thinking.
- Integración prevista en el ecosistema Lyric de gobernanza de voz para agentes conversacionales, según la documentación del producto.

## Casos de uso

- Atención al cliente en malabar: el modelo puede generar respuestas habladas en malabar dentro de agentes conversacionales, manteniendo una voz consistente entre llamadas gracias a su encaje en la capa de gobernanza Lyric.
- Sistemas de megafonía y avisos automatizados: anuncios en estaciones, aeropuertos o comercios para población malabarófona, con generación local que evita latencia de red y costes por petición.
- Lectura de contenido para accesibilidad: conversión de texto a voz para personas con discapacidad visual en aplicaciones dirigidas al estado de Kerala y comunidades malabarófonas, ejecutándose en el propio dispositivo.
- Asistentes de voz embebidos: integración en dispositivos de consumo o industriales con recursos limitados, donde el tamaño de 336 M parámetros y la inferencia on-device permiten funcionar sin conexión.
- Educación y aprendizaje de idiomas: generación de material auditivo en malabar para aplicaciones de aprendizaje, con pronunciación sintética controlada y reproducible.
- Automatización de IVR telefónico: respuestas de voz pregrabadas dinámicamente para sistemas de atención telefónica en malabar, reduciendo la necesidad de actores de doblaje y permitiendo actualizaciones de guion sin regrabar.
- Lokalización de contenido multimedia: doblaje o sustitución de pistas de audio en malabar para vídeos corporativos y materiales formativos, siempre que la licencia comunitaria lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 336 M parámetros en precisión completa (fp32) el modelo ocuparía aproximadamente 1,3 GB solo en pesos; en fp16 alrededor de 0,7 GB, y en cuantizaciones de 8 bits en torno a 0,35 GB, sin contar el búfer del vocoder y el audio generado. Son estimaciones por tamaño, no cifras publicadas.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con al menos 2-4 GB de VRAM libre debería poder alojarlo en fp16, incluyendo GTX 1650, RTX 3050 y superiores; A100 y H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de tarjetas gráficas modernas e incluso en CPU, dado el reducido número de parámetros, aunque no hay cifras oficiales de latencia.
- Opciones de despliegue: no disponible. Al ser un modelo TTS con pesos safetensors, requeriría el código de inferencia específico de kyutai/pocket-tts o del ecosistema Lyric; no consta soporte en vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| Lyric Voice v1 ML | 336 M | no disponible | malabar | lyric-community-license | Restringido (gated) |
| kyutai/pocket-tts (base) | no disponible | no disponible | no disponible | no disponible | Público en Hugging Face |
| Alternativas TTS multilingües open source (p. ej. familia XTTS, Bark) | no disponible en esta ficha | no disponible | multilingüe | varía según modelo | Público |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, idioma, licencia y disponibilidad; no se han verificado cifras de calidad (MOS, WER) para ninguno de ellos.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated en Hugging Face y requiere aceptar las condiciones de la lyric-community-license antes de la descarga.
- Licencia no estándar: la lyric-community-license no es OSI; es imprescindible revisar sus términos antes de cualquier uso comercial, redistribución o integración en producto.
- Monolingüe: solo se declara soporte de malabar; no hay evidencia de robustez ante texto mixto con inglés u otros idiomas, algo frecuente en contenido real malabarófono.
- Sin datos de calidad: no hay benchmarks, métricas MOS ni evaluaciones publicadas, por lo que el rendimiento real es desconocido.
- Riesgo de alucinación acústica: como todo modelo TTS, puede producir pronunciaciones incorrectas, prosodia antinatural o artefactos en palabras poco frecuentes, nombres propios y números.
- Sesgos de hablante: al desconocerse el corpus de entrenamiento, no se puede evaluar la representatividad de acentos, géneros o registros del malabar.
- Sin información sobre clonación, control emocional ni marcas prosódicas, lo que limita su uso en aplicaciones expresivas.
- Modelo de nicho con cero descargas y cero likes en el momento de la consulta: ecosistema y soporte comunitario muy limitados.
- Fecha de creación en el repositorio (2026-11-06) posterior a la consulta; conviene verificar la vigencia y posibles actualizaciones.

## Enlaces

- Hugging Face: https://huggingface.co/10X-Technologies/lyric-voice-v1-ml
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Sitio del producto Lyric: https://www.lyricvoices.ai/about
