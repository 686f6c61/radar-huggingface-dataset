# AEmotionStudio/vocal-voice-01

## Resumen

Viola Nightbloom (ID `AEmotionStudio/vocal-voice-01`) es un modelo de síntesis de voz cantada en inglés desarrollado por Æmotion Studio para la pestaña Vocal de su aplicación MAESTRO. El modelo no genera audio directamente: convierte una secuencia de notas y letra en un espectrograma acústico, que después debe ser renderizado a audio por un vocoder independiente (`AEmotionStudio/openvpi-pc-nsf-hifigan-2025-02`). Se distribuye en formato ONNX y ocupa 0,4 GB en el repositorio.

El paquete sigue la estructura típica de los sistemas de síntesis de canto basados en DiffSinger/OpenVPI, con módulos separados para la parte lingüística (fonemas), la acústica, el tono (pitch), la duración y la varianza. Está entrenado exclusivamente con grabaciones de voz solista con licencia CC0, aunque la licencia del modelo resultante es propietaria y su uso está restringido al entorno MAESTRO.

Es relevante ahora porque ejemplifica un patrón creciente en el ecosistema open source: pesos publicados en Hugging Face con formato abierto (ONNX) pero con licencia propietaria y dependencia de un runtime concreto, lo que obliga a los desarrolladores a evaluar con cuidado la viabilidad de integración antes de adoptarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de síntesis de canto por módulos (lingüístico, acústico, pitch, duración, varianza) en ONNX; arquitectura interna de cada módulo no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos distribuidos en ONNX sin indicar precisión) |
| Idiomas soportados | inglés (`en`) |
| Licencia | propietaria (`proprietary-voice-cc0-training-data`); datos de entrenamiento CC0 |
| Formato de pesos | ONNX (`acoustic.onnx`, `linguistic.onnx`, `pitch.onnx`, `dur.onnx`, `variance.onnx`) más ficheros de configuración YAML/JSON y diccionario de fonemas |

## Arquitectura y entrenamiento

El modelo se organiza como un pipeline de varios componentes ONNX independientes: un módulo lingüístico que convierte texto y fonemas en representaciones intermedias (con `phonemes.json` y `dictionary-en.txt`), un módulo acústico que genera el espectrograma, un módulo de pitch que modela la entonación de la nota cantada, un módulo de duración que alinea fonemas con las notas y un módulo de varianza que ajusta energía y otros parámetros prosódicos. Esta separación es característica de los sistemas tipo DiffSinger/OpenVPI y permite sustituir o ajustar módulos por separado.

El entrenamiento se realizó sobre grabaciones de voz solista con licencia CC0, según declara el autor. No se especifican el número de horas de audio, el número de tokens ni si se aplicaron técnicas de RLHF o ajuste fino posteriores; tampoco se detalla la arquitectura interna de cada submódulo (tipo de red, número de capas, dimensión de los embeddings). El modelo depende de un vocoder externo (`vocal_vocoder_pc_nsf_hifigan`) para producir audio final, que MAESTRO descarga automáticamente.

## Capacidades

- Síntesis de voz cantada en inglés a partir de una secuencia de notas y letra.
- Generación de espectrograma acústico que posteriormente se renderiza con un vocoder externo.
- Modelado explícito de pitch, duración y varianza, lo que permite controlar entonación y ritmo a nivel de nota.
- Conversión de texto a fonemas mediante diccionario inglés incluido (`dictionary-en.txt`).
- Integración con la pestaña Vocal de la aplicación MAESTRO de Æmotion Studio.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Producción musical asistida: un compositor introduce una melodía en notación y una letra en inglés, y el modelo genera una pista vocal de referencia (espectrograma) que se renderiza con el vocoder para maquetas previas a la grabación real.
- Prototipado rápido de canciones: permite generar demos vocales en minutos dentro de MAESTRO sin necesidad de un cantante, útil para validar arreglos y estructuras antes de invertir en producción.
- Doblaje y localización de contenido musical: al soportar inglés y control fino de pitch y duración, puede adaptarse a versiones cantadas de jingles o piezas cortas para mercados anglófonos.
- Educación musical: sirve para ilustrar cómo suena una línea melódica con letra, ayudando a estudiantes a practicar afinación y ritmo comparando su ejecución con la referencia generada.
- Investigación en síntesis de canto: al distribuirse en ONNX con módulos separados, es útil como banco de pruebas para estudiar el efecto de cambiar el vocoder o el módulo de pitch sin reentrenar todo el pipeline.
- Creación de contenido para redes: generación de fragmentos vocales cortos en inglés para vídeos, pódcast o piezas promocionales, siempre dentro de los términos de uso de MAESTRO.
- Integración en herramientas DAW: mediante el runtime de MAESTRO o un wrapper propio sobre los ONNX, se puede automatizar la generación de pistas vocales guía en flujos de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,4 GB, por lo que los pesos en sí son ligeros, pero el consumo real depende del vocoder externo y del runtime.
- GPU recomendadas: no disponible. Por el tamaño del paquete, es plausible que funcione en GPU de gama media, pero no hay datos oficiales que lo confirmen.
- ¿Cabe en GPU de consumo? No confirmado; el tamaño de 0,4 GB sugiere que sí, pero la ausencia de especificaciones impide garantizarlo.
- Opciones de despliegue: ONNX Runtime (formato nativo); integración prevista a través de la aplicación MAESTRO, que gestiona la descarga del vocoder. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Formato | Licencia | Contexto / tamaño |
|---|---|---|---|---|---|
| AEmotionStudio/vocal-voice-01 | Síntesis de voz cantada (pipeline ONNX) | Inglés | ONNX | Propietaria (datos CC0) | 0,4 GB en repo; contexto no aplica |
| DiffSinger (OpenVPI) | Síntesis de canto | Multiidioma según modelo | ONNX / PyTorch | Open source (varía por modelo) | Depende del modelo; no disponible |
| OpenUtau + voces DiffSinger | Síntesis de canto | Multiidioma | ONNX | Varía por voz | Depende de la voz; no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- Requiere un vocoder externo para producir audio; sin él, solo genera espectrogramas.
- La licencia es propietaria y el uso está restringido al entorno MAESTRO; el audio generado pertenece al usuario según la model card, pero el modelo en sí no es reutilizable libremente.
- No se especifican sesgos conocidos, pero al entrenarse con grabaciones CC0 de voz solista, la diversidad de timbres y estilos puede ser limitada.
- Riesgo de artefactos y alucinaciones acústicas en fonemas o notas fuera de la distribución de entrenamiento; no cuantificado.
- Ausencia total de benchmarks y de especificaciones técnicas detalladas (parámetros, contexto, cuantización), lo que dificulta evaluar su calidad frente a alternativas.
- Dependencia de un runtime concreto (MAESTRO) y de un vocoder específico, lo que reduce la portabilidad.
- Fecha de creación futura (2026-11-18) en los metadatos, lo que puede indicar un artefacto de publicación o un error de registro.

## Enlaces

- Hugging Face: https://huggingface.co/AEmotionStudio/vocal-voice-01
- Vocoder asociado: https://huggingface.co/AEmotionStudio/openvpi-pc-nsf-hifigan-2025-02
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
