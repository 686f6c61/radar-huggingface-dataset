# Phoonnx/vits-kbd-male

## Resumen

vits-kbd-male es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por anzorq y empaquetado por Phoonnx para su librería ONNX de TTS. El modelo está especializado en el idioma cabardiano (`kbd`, cabardino-circasiano), una lengua caucásica noroccidental con alfabeto cirílico y una comunidad de hablantes reducida, lo que lo convierte en un recurso poco habitual para tecnologías del habla en lenguas minoritarias.

La relevancia de este modelo radica en su formato de distribución: los pesos se ofrecen como ONNX, lo que permite inferencia en CPU y GPU sin depender de frameworks de deep learning pesados, y su integración con el ecosistema phoonnx y OVOS (Open Voice OS) facilita su despliegue en asistentes de voz de código abierto. El repositorio ocupa aproximadamente 0,1 GB, lo que sugiere un modelo compacto y adecuado para entornos con recursos limitados.

No se dispone de información sobre el número de parámetros, la longitud de contexto (no aplica en TTS) ni datos de entrenamiento en la información proporcionada. El modelo se distribuye bajo licencia MIT y está pensado para síntesis de voz a partir de caracteres del texto de entrada, sin fonemización basada en diccionario más allá del `GraphemePhonemizer` de scriptconv.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada por caracteres) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | cabardiano (`kbd`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | caracteres del texto |
| Front-end de texto | `GraphemePhonemizer` de scriptconv |
| Tamano del repositorio | ~0,1 GB |
| Libreria de inferencia | phoonnx (Python y plugin OVOS) |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de síntesis de voz que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial entrenado con pérdidas de reconstrucción y adversariales. Este diseño permite generar audio de forma directa desde texto sin necesidad de un vocoder externo, y es conocido por producir voz natural con un modelo relativamente compacto.

El modelo deriva del checkpoint original `anzorq/kbd-vits-tts-male`, empaquetado por Phoonnx para su librería ONNX. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el hablante de referencia ni si se aplicaron técnicas de fine-tuning o adaptación. El front-end de texto utiliza `GraphemePhonemizer` de scriptconv, que normaliza el texto y lo convierte en la secuencia de caracteres de entrada del modelo, sin un fonemizador específico para cabardiano más allá del tratamiento a nivel de grafema.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en cabardiano (`kbd`).
- Entrada basada en caracteres del texto, con normalización previa mediante scriptconv.
- Generación de audio en formato WAV mediante la API de phoonnx (`voice.synthesize_wav`).
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en Python a través de `TTSModelManager` de phoonnx.
- Inferencia en formato ONNX, lo que permite despliegue sin frameworks de deep learning completos.
- No se ha documentado soporte de tool calling, agentes, razonamiento multi-step, visión, audio de entrada ni modo thinking (no aplica a un modelo TTS).

## Casos de uso

- **Asistentes de voz en cabardiano**: integración en OVOS mediante `ovos-tts-plugin-phoonnx` para dotar de voz a un asistente doméstico en esta lengua, aprovechando que el modelo se carga directamente desde el gestor de voces de phoonnx.
- **Lectura de textos y accesibilidad**: conversión de documentos, noticias o contenido educativo en cabardiano a audio para personas con discapacidad visual o dificultades de lectura, usando la API `synthesize_wav` sobre fragmentos de texto.
- **Preservación lingüística**: generación de material audio para proyectos de documentación y revitalización del cabardiano, una lengua con pocos recursos tecnológicos, aprovechando la licencia MIT para uso comunitario.
- **Aplicaciones educativas de aprendizaje de idiomas**: producción de pronunciaciones sintéticas de frases en cabardiano para herramientas de aprendizaje, dado el bajo coste computacional del modelo (~0,1 GB).
- **Sistemas de anuncios y avisos automatizados**: generación de mensajes de voz dinámicos en cabardiano para transporte público, comercios o servicios locales, con despliegue en CPU por el formato ONNX.
- **Prototipado de pipelines TTS multilingües**: uso del modelo como una voz más dentro de un sistema que selecciona el idioma del usuario, integrándolo en la colección de voces VITS de phoonnx junto a otros modelos.
- **Investigación en TTS para lenguas minoritarias**: base para experimentos de adaptación, evaluación o comparación de calidad en cabardiano, al ser uno de los pocos modelos TTS públicos para esta lengua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (~0,1 GB) es plausible que el modelo quepa en menos de 1 GB de memoria, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible; el formato ONNX permite ejecución en CPU y en GPU, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada explícitamente, aunque el tamaño reducido sugiere que podría ejecutarse en GPUs de consumo e incluso en CPU.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ejecución de ONNX mediante runtime compatible (no se detalla el runtime concreto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|---|
| vits-kbd-male (Phoonnx) | VITS | cabardiano (kbd) | no disponible | no aplica | MIT | ONNX |
| anzorq/kbd-vits-tts-male | VITS | cabardiano (kbd) | no disponible | no aplica | MIT (declarada upstream) | no disponible |
| Otras voces VITS de la colección Phoonnx | VITS | varios | no disponible | no aplica | variable | ONNX |

No se dispone de datos de rendimiento ni de parámetros para establecer una comparación cuantitativa con alternativas. El modelo upstream `anzorq/kbd-vits-tts-male` es la referencia directa, y la colección VITS de Phoonnx agrupa modelos equivalentes para otros idiomas.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en cabardiano (`kbd`); no soporta otros idiomas.
- No se dispone de información sobre sesgos del hablante, calidad de la voz ni naturalidad del audio.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero la síntesis puede producir pronunciaciones incorrectas en palabras fuera del dominio de entrenamiento.
- El front-end basado en grafemas (`GraphemePhonemizer`) puede no capturar reglas fonéticas específicas del cabardiano, lo que podría afectar a la precisión de la pronunciación.
- No se documentan restricciones adicionales de licencia más allá de MIT, pero conviene verificar la licencia del checkpoint upstream antes de uso comercial.
- El modelo tiene muy pocas descargas (27) y ningún "like", lo que indica escasa validación por parte de la comunidad.
- No se especifican requisitos de normalización de texto más allá de lo que hace scriptconv; textos con números, abreviaturas o símbolos pueden requerir preprocesado adicional.
- No hay información sobre latencia, throughput ni calidad objetiva (MOS) para planificación en producción.

## Enlaces

- [Modelo en Hugging Face: Phoonnx/vits-kbd-male](https://huggingface.co/Phoonnx/vits-kbd-male)
- [Modelo upstream: anzorq/kbd-vits-tts-male](https://huggingface.co/anzorq/kbd-vits-tts-male)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Colección de modelos VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
