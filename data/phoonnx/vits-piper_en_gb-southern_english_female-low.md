# Phoonnx/vits-piper_en_GB-southern_english_female-low

## Resumen

vits-piper_en_GB-southern_english_female-low es un modelo de síntesis de voz (text-to-speech) en formato ONNX, derivado del modelo Piper `en_GB-southern_english_female-low` y empaquetado para su uso con la librería phoonnx. Lo publica el usuario Phoonnx como un subconjunto extraído del repositorio agregador `Phoonnx/phoonnx-vits`, que reúne múltiples voces Piper convertidas a ONNX. La arquitectura subyacente es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo condicional que produce formas de onda directamente a partir de fonemas, sin necesidad de un vocoder separado.

El modelo está orientado a la síntesis de voz en inglés británico con acento del sur de Inglaterra y timbre femenino, en su variante de calidad "low", lo que implica un tamaño reducido y una latencia baja a costa de una calidad de audio inferior a las variantes medium o high de Piper. El repositorio ocupa aproximadamente 0,1 GB, lo que confirma que se trata de un modelo ligero pensado para inferencia en CPU o en dispositivos con recursos limitados.

Su relevancia radica en que permite integrar TTS de forma local y sin dependencias de servicios en la nube dentro de aplicaciones que usen phoonnx, con licencia MIT declarada. No obstante, la información publicada es mínima: la model card se limita a indicar el origen del modelo y su identificador de voz, sin especificar parámetros, contexto, composición del dataset ni métricas de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech end-to-end) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantización | no disponible (pesos en ONNX; no se documentan variantes) |
| Idiomas soportados | inglés británico (en_GB), acento del sur de Inglaterra |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Tamaño del repositorio | ~0,1 GB |
| Pipeline | text-to-speech |
| Librería | phoonnx |
| Identificador de voz | `piper/en_GB-southern_english_female-low` |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto (típicamente basado en fonemas), un prior variacional condicionado por alineamiento monotónico, un decodificador generativo y un discriminador adversarial entrenado con pérdidas de reconstrucción y de confrontación. El resultado es un modelo que genera audio directamente desde la secuencia de fonemas, sin vocoder externo, y que en la práctica de Piper emplea el front-end fonético de eSpeak NG para convertir el texto en fonemas.

En cuanto al entrenamiento, la información proporcionada no detalla el número de tokens, la composición del dataset, la duración del audio de entrenamiento ni si se aplicaron etapas de ajuste como RLHF o DPO (poco habituales en TTS). La model card únicamente indica que el modelo procede de la carpeta `piper__en_GB-southern_english_female-low` del repositorio `Phoonnx/phoonnx-vits` y que conserva las rutas de archivo originales. No se documentan innovaciones técnicas adicionales más allá de la propia arquitectura VITS y de la conversión a ONNX para su uso con phoonnx.

## Capacidades

- Síntesis de voz a partir de texto en inglés británico con timbre femenino y acento del sur de Inglaterra.
- Generación de audio end-to-end sin vocoder separado, gracias a la arquitectura VITS.
- Conversión de texto a fonemas mediante el front-end de eSpeak NG (implícito en la cadena Piper).
- Ejecución local en formato ONNX, compatible con la librería phoonnx.
- Variante de calidad "low": menor coste computacional y menor huella de memoria.
- No se documentan capacidades de clonación de voz, control de emociones, tool calling, agentes ni procesamiento multimodal.
- Capacidad multilingüe: no disponible; el modelo está limitado al inglés británico.

## Casos de uso

- Lectura por voz de interfaces y aplicaciones de escritorio: el modelo puede integrarse mediante phoonnx para leer notificaciones, menús o texto de ayuda en tiempo real, aprovechando su bajo coste computacional y su formato ONNX ligero.
- Asistentes de voz locales sin conexión: al ejecutarse en local y con licencia MIT, es adecuado para dispositivos embebidos o entornos con requisitos de privacidad donde no se desea enviar texto a servicios en la nube.
- Accesibilidad para personas con discapacidad visual: puede emplearse como motor de lectura de pantalla para contenido en inglés británico, con una latencia baja gracias a la variante "low".
- Generación de audiolibros o pódcasts de bajo coste: para borradores y previsualizaciones donde prima la velocidad sobre la fidelidad máxima del audio.
- Pruebas automatizadas de sistemas de diálogo: sirve para generar respuestas habladas sintéticas en pipelines de evaluación de asistentes conversacionales en inglés británico.
- Prototipado rápido de aplicaciones de voz: al ser un modelo pequeño (~0,1 GB) y con licencia permisiva, permite iterar en fases de desarrollo sin depender de APIs externas.
- Sistemas de anuncios o avisos automatizados: lectura de mensajes en entornos controlados (transporte, comercio, domótica) donde se requiere una voz británica femenina concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (~0,1 GB) se trata de un modelo que cabe holgadamente en memoria de CPU y en GPUs de gama baja.
- GPU recomendadas: no se especifican; por su tamaño, cualquier GPU consumer moderna (por ejemplo, series RTX 30/40) puede ejecutarlo, aunque probablemente esté diseñado para inferencia en CPU.
- ¿Cabe en GPU consumer? Sí, con gran margen, dado el reducido tamaño del modelo.
- Opciones de despliegue: phoonnx (librería indicada en la model card), con pesos en formato ONNX; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no a TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Calidad | Licencia | Formato |
|---|---|---|---|---|---|
| vits-piper_en_GB-southern_english_female-low (este modelo) | VITS | en_GB (sur de Inglaterra) | low | MIT | ONNX |
| Otras voces Piper en_GB (p. ej. variantes medium/high del mismo catálogo Piper) | VITS | en_GB | medium / high | según la voz original | ONNX / otros |
| Repositorio agregador Phoonnx/phoonnx-vits | VITS (múltiples voces) | múltiples | variable | según subcarpeta | ONNX |

No se dispone de datos de parámetros, contexto ni rendimiento de las alternativas en la información proporcionada, por lo que la comparación se limita a idioma, calidad declarada, licencia y formato.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al ser un modelo entrenado con datos no especificados, pueden aparecer sesgos de pronunciación o prosodia no evaluados.
- Riesgo de alucinación en TTS: puede producir pronunciaciones incorrectas o artefactos en palabras poco frecuentes, nombres propios o texto fuera del dominio de entrenamiento.
- Limitación de idioma: solo inglés británico con acento del sur de Inglaterra; no soporta otros idiomas ni variantes regionales.
- Calidad "low": la fidelidad del audio es inferior a las variantes medium o high de Piper; no es adecuada para producción de audio de alta calidad.
- Licencia: la model card declara MIT, pero también señala que "las licencias siguen a los originales por subcarpeta" y que algunas voces del repositorio origen carecen de licencia declarada. Conviene verificar la licencia de la voz Piper original antes de un uso comercial.
- Ausencia de documentación técnica: no hay datos sobre parámetros, dataset, métricas ni limitaciones formales, lo que dificulta la evaluación rigurosa en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso ni validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-piper_en_GB-southern_english_female-low
- Repositorio origen de voces: https://huggingface.co/Phoonnx/phoonnx-vits
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio de voces Kasanoma (referenciado en la licencia): https://github.com/michsethowusu/kasanoma
