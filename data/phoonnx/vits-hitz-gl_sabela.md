# Phoonnx/vits-hitz-gl_sabela

## Resumen

`vits-hitz-gl_sabela` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, distribuido en formato ONNX y empaquetado para su uso con la librería `phoonnx`. Lo publica el usuario Phoonnx como una extracción del repositorio agregador `Phoonnx/phoonnx-vits`, concretamente de la carpeta `hitz-gl_sabela`, conservando la estructura de rutas original. El identificador de voz interno es `hitz/gl_sabela-vits`.

El modelo resuelve la conversión de texto a audio hablado en gallego, según se deduce del sufijo de idioma `gl` en el nombre de la carpeta. Al tratarse de un modelo VITS (end-to-end, no autorregresivo), genera waveform directamente a partir de texto sin necesidad de un vocoder separado, lo que simplifica el despliegue en producción. La licencia declarada es MIT.

La relevancia es acotada: se trata de un artefacto derivado de un repositorio mayor, con cero descargas y cero likes en el momento de la consulta, y sin model card propia más allá de la referencia al repositorio fuente. Su interés principal es práctico para quien necesite una voz gallega concreta dentro del ecosistema phoonnx, no como modelo de referencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech, end-to-end) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en ONNX) |
| Idiomas soportados | gallego (deducido del sufijo `gl`; no confirmado en la model card) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional condicionado por alineamiento monotónico y un decodificador generativo que produce la waveform directamente, sin vocoder externo. Emplea entrenamiento adversarial combinado con estimación variacional para mejorar la naturalidad del audio. El modelo se distribuye como grafo ONNX, orientado a inferencia optimizada.

No se dispone de información sobre el dataset de entrenamiento, el número de horas de audio, el hablante de referencia (`sabela`), el proceso de alineamiento ni si hubo ajuste fino posterior. La model card únicamente indica que el modelo procede del repositorio `Phoonnx/phoonnx-vits` y que conserva las rutas de archivo originales.

## Capacidades

- Síntesis de voz a partir de texto (text-to-speech) en gallego.
- Generación de waveform end-to-end sin vocoder separado.
- Inferencia mediante ONNX Runtime a través de la librería phoonnx.
- Voz identificada como `hitz/gl_sabela-vits`.
- No se documenta soporte de control de prosodia, emoción, velocidad o pitch.
- No se documenta soporte de clonación de voz ni de multi-hablante.
- No se documentan capacidades de tool calling, agentes ni razonamiento (no aplica a un modelo TTS).

## Casos de uso

- Lectura de artículos y contenidos web en gallego: el modelo convierte texto plano en audio, adecuado para integrarse en un pipeline de accesibilidad que lea páginas o documentos en voz alta.
- Locución de avisos y notificaciones: generación de mensajes cortos pregrabados al vuelo para aplicaciones de transporte, comercio o administración pública en gallego.
- Audiolibros y contenido editorial: síntesis por lotes de capítulos completos, con la ventaja de que VITS produce audio de forma no autorregresiva y por tanto con latencia acotada por segmento.
- Asistentes de voz locales: al ejecutarse sobre ONNX Runtime, puede desplegarse en dispositivos sin GPU dedicada o en el navegador, útil para asistentes que deban funcionar sin conexión.
- Doctaje de aplicaciones y videojuegos: generación de diálogos de interfaz en gallego sin depender de un servicio en la nube.
- Accesibilidad en administración electrónica: lectura de formularios, resoluciones y trámites para usuarios con discapacidad visual, siempre que se valide la calidad de pronunciación de terminología administrativa.
- Prototipado de producto de voz: al ser un modelo pequeño (repo de 0,1 GB) y con licencia MIT, sirve para validar flujos de TTS en gallego antes de invertir en una voz comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 0,1 GB, por lo que el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con al menos 2 GB de VRAM es suficiente, e incluso la inferencia en CPU es viable.
- Cabe en GPU consumer: sí, en cualquier modelo actual (GTX 1050, RTX 3060, RTX 4090, etc.), dado el reducido tamaño del artefacto.
- Opciones de despliegue: ONNX Runtime a través de la librería phoonnx; también es posible cargar el grafo ONNX directamente con otros runtimes compatibles.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| vits-hitz-gl_sabela | VITS | gallego (deducido) | MIT | ONNX | Hugging Face (Phoonnx) |
| Piper (voces espeak-ng) | VITS | múltiples | variable por voz | ONNX | Hugging Face / GitHub |
| Coqui TTS (VITS) | VITS | múltiples | MPL 2.0 (código) | PyTorch / ONNX | GitHub |
| MMS-TTS (Meta) | VITS | más de 1.100 | CC-BY-NC 4.0 | PyTorch | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La model card no documenta el idioma de forma explícita; la atribución al gallego se infiere del sufijo `gl` y debe validarse antes de usarlo en producción.
- No hay información sobre el hablante `sabela`: sexo, registro, condiciones de grabación ni calidad del dataset de entrenamiento.
- Riesgo de pronunciación incorrecta en nombres propios, siglas, números y terminología técnica, habitual en modelos VITS entrenados con corpus limitados.
- Ausencia de benchmarks y de cero descargas registradas: no hay evidencia pública de calidad ni de uso en producción.
- La licencia MIT se hereda del repositorio fuente; conviene verificar que la voz original no tuviera restricciones adicionales antes de uso comercial.
- El modelo es un artefacto derivado de un repositorio agregador; su mantenimiento depende de que el repositorio fuente siga activo.
- No se documentan mecanismos de control de prosodia, emoción ni velocidad, lo que limita su uso en aplicaciones que requieran expresividad.
- Al ser un modelo TTS, no ofrece generación de texto, razonamiento ni tool calling; no debe evaluarse con benchmarks de LLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-hitz-gl_sabela
- Repositorio fuente: https://huggingface.co/Phoonnx/phoonnx-vits
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio kasanoma (referenciado en la licencia del repo fuente): https://github.com/michsethowusu/kasanoma
