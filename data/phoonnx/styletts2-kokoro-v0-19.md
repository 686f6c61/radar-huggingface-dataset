# Phoonnx/styletts2-kokoro-v0.19

## Resumen

styletts2-kokoro-v0.19 es un paquete de pesos en formato ONNX derivado del repositorio Phoonnx/phoonnx-styletts2, concretamente de la carpeta `kokoro-v0.19`, preparado para su uso con la librería phoonnx (implementación en Rust del motor StyleTTS2). No se trata de un modelo entrenado desde cero por Phoonnx, sino de una redistribución empaquetada de checkpoints StyleTTS2 con las voces de la familia Kokoro v0.19, manteniendo las rutas de ficheros del repositorio original.

El modelo resuelve la síntesis de voz (text-to-speech) con un conjunto cerrado de voces predefinidas identificadas mediante IDs de phoonnx (`kokoro-v019/af`, `kokoro-v019/am_adam`, `kokoro-v019/bf_emma`, etc.). Su relevancia actual radica en que ofrece inferencia TTS ligera y portable vía ONNX, lo que permite desplegarla en entornos sin GPU dedicada o integrarla en aplicaciones Rust/Python a través de phoonnx.

La información pública disponible es muy limitada: el repositorio tiene 0 descargas y 0 likes, un tamaño de 0,1 GB, y la model card no documenta arquitectura detallada, número de parámetros, contexto ni datos de entrenamiento. La licencia es `other`, heredada del repositorio fuente, que mezcla checkpoints de distintos laboratorios con licencias distintas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 (síntesis de voz; detalles de capas no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; cuantizaciones concretas no documentadas) |
| Idiomas soportados | no disponible (la model card no lo declara; las voces Kokoro suelen cubrir inglés, pero no se confirma) |
| Licencia | other (heredada del repositorio fuente; phoonnx es Apache-2.0, pero los checkpoints mezclan licencias; el checkpoint catalán BSC es GPL-3.0) |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,1 GB |
| Libreria / runtime | phoonnx |
| Pipeline | text-to-speech |
| Voces incluidas | 11 IDs (`kokoro-v019/af`, `af_bella`, `af_nicole`, `af_sarah`, `af_sky`, `am_adam`, `am_michael`, `bf_emma`, `bf_isabella`, `bm_george`, `bm_lewis`) |

## Arquitectura y entrenamiento

El modelo se basa en StyleTTS2, una arquitectura de síntesis de voz que combina un codificador de estilo, un decodificador acústico y un vocoder, orientada a generar habla natural con control de estilo. No se dispone de información sobre el número de parámetros, la composición del dataset de entrenamiento, el número de tokens o muestras utilizadas, ni sobre si se aplicaron técnicas de ajuste fino adicionales.

Los pesos se distribuyen en formato ONNX para su ejecución con phoonnx, la implementación en Rust del pipeline StyleTTS2 mantenida por TigreGotico. El repositorio fuente Phoonnx/phoonnx-styletts2 agrupa checkpoints de distintos laboratorios bajo una licencia `other`, y esta carpeta concreta (`kokoro-v0.19`) corresponde a las voces Kokoro v0.19. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal u otras) en la información disponible.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto de entrada.
- Selección de voz mediante 11 identificadores predefinidos de la familia Kokoro v0.19, con voces etiquetadas `af` (femeninas americanas), `am` (masculinas americanas), `bf` (femeninas británicas) y `bm` (masculinas británicas).
- Inferencia portable vía ONNX, ejecutable con el runtime phoonnx.
- No se documenta soporte de clonación de voz, control de emoción, tool calling, agentes, razonamiento multi-paso ni capacidades multimodales.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Lectura de artículos y documentos: el modelo puede convertir texto plano en audio con una de las voces Kokoro predefinidas, adecuado para aplicaciones de accesibilidad o consumo de contenido en movilidad.
- Asistentes de voz embebidos: al distribuirse en ONNX y con un tamaño de repositorio de 0,1 GB, puede integrarse en aplicaciones de escritorio o dispositivos con recursos limitados mediante phoonnx.
- Generación de avisos y notificaciones habladas: útil en sistemas de domótica o automoción que requieren mensajes cortos sintetizados localmente sin depender de servicios en la nube.
- Prototipado de interfaces conversacionales: permite evaluar rápidamente distintas voces (femeninas/masculinas, americanas/británicas) antes de comprometerse con un proveedor TTS comercial.
- Doblaje de contenido breve: para vídeos cortos, pódcast o tutoriales donde se necesita una voz consistente y se acepta una calidad de síntesis estándar.
- Pruebas de integración en pipelines Rust: al ser el runtime nativo de phoonnx, sirve para validar flujos de TTS dentro de aplicaciones escritas en Rust sin añadir dependencias de Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el tamaño del repositorio (0,1 GB) sugiere que el modelo cabe holgadamente en memoria de GPU consumer, pero no se documentan requisitos oficiales.
- GPU recomendadas: no disponible. Por el formato ONNX y el tamaño reducido, es plausible su ejecución en CPU, pero no se confirma en la documentación.
- Compatibilidad con GPU consumer: probable por tamaño, sin datos oficiales que lo confirmen.
- Opciones de despliegue: runtime phoonnx (Rust); el formato ONNX permite, en principio, otros ejecutores ONNX Runtime, aunque no se documenta soporte explícito.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phoonnx/styletts2-kokoro-v0.19 | TTS StyleTTS2 (ONNX) | no disponible | no aplica | other | Hugging Face, 0 descargas |
| Phoonnx/phoonnx-styletts2 (repo fuente) | TTS StyleTTS2 (ONNX) | no disponible | no aplica | other (mezcla) | Hugging Face |
| Kokoro original (hexgrad/Kokoro-82M) | TTS | 82M (según denominación del modelo) | no aplica | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Información pública muy escasa: sin datos de arquitectura detallada, parámetros, idiomas ni entrenamiento, lo que dificulta evaluar su calidad frente a alternativas.
- Licencia `other` heredada de un repositorio que mezcla checkpoints de distintos laboratorios con licencias distintas; es imprescindible verificar la licencia aplicable a cada voz antes de un uso comercial. El checkpoint catalán BSC del repositorio fuente es GPL-3.0.
- Riesgo de alucinación y artefactos de pronunciación inherente a los sistemas TTS, especialmente con texto fuera de dominio o idiomas no cubiertos; no se documenta el alcance lingüístico.
- Conjunto de voces cerrado (11 IDs); no se documenta clonación ni voces personalizadas.
- Sin métricas publicadas de naturalidad (MOS), inteligibilidad ni latencia.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso en producción.
- La fecha de creación indicada (2026-11-14) es futura respecto a la información habitual; conviene verificar la vigencia del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/styletts2-kokoro-v0.19
- Repositorio fuente: https://huggingface.co/Phoonnx/phoonnx-styletts2
- Runtime phoonnx: https://github.com/TigreGotico/phoonnx
