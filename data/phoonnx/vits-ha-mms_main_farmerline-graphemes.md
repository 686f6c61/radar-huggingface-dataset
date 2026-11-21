# Phoonnx/vits-ha-mms_main_farmerline-graphemes

## Resumen

El modelo `vits-ha-mms_main_farmerline-graphemes` es un sistema de síntesis de voz (text-to-speech, TTS) basado en la arquitectura VITS, desarrollado originalmente por GhanaNLP a partir del proyecto FarmerlineML/main_hausa_TTS y empaquetado por Phoonnx para su librería ONNX de TTS llamada phoonnx. Está especializado exclusivamente en hausa (`ha`), una de las lenguas principales de África Occidental, y su nombre indica que trabaja con grafemas (caracteres) en lugar de fonemas, lo que simplifica la integración en pipelines sin necesidad de un fonemizador específico.

El modelo resuelve el problema de la escasez de voces TTS de calidad para lenguas de bajos recursos, en este caso el hausa. Al estar empaquetado en formato ONNX dentro del ecosistema phoonnx, está pensado para ejecutarse en entornos Python y en el framework de asistentes de voz OVOS, lo que lo hace adecuado para despliegues locales y embebidos. El repositorio ocupa aproximadamente 0,1 GB, lo que sugiere un modelo compacto y ligero.

Es relevante ahora porque cubre un hueco idiomático poco atendido por los grandes proveedores de TTS comerciales, y porque su licencia CC-BY-4.0 permite uso comercial con atribución. Sin embargo, la model card es muy escueta y no documenta detalles sobre entrenamiento, calidad o benchmarks, lo que limita su evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; procesa texto de entrada por frases) |
| Tipos de cuantizacion | no disponible (empaquetado en ONNX; se desconoce si existen variantes cuantizadas) |
| Idiomas soportados | hausa (`ha`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |
| Autor original | GhanaNLP |
| Upstream | FarmerlineML/main_hausa_TTS |

## Arquitectura y entrenamiento

La arquitectura es VITS, un modelo end-to-end de síntesis de voz que combina un encoder de texto, un predictor de duración, un normalizing flow y un decoder generativo adversario (GAN) basado en HiFi-GAN, junto con alineamiento monotónico para aprender la correspondencia texto-audio sin supervisión explícita de alineamientos. Esta arquitectura es conocida por generar voz de calidad razonable con modelos relativamente compactos y por su eficiencia en inferencia.

El modelo deriva de `FarmerlineML/main_hausa_TTS`, un checkpoint de GhanaNLP orientado a hausa. La variante aquí presentada se ha empaquetado con entrada basada en grafemas (caracteres) en lugar de fonemas, lo que evita depender de un fonemizador específico del hausa y simplifica la normalización de texto. No se dispone de información sobre el número de horas de audio de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste fino adicional. No se documentan innovaciones técnicas adicionales más allá de la propia arquitectura VITS.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto escrito en hausa.
- Procesamiento basado en grafemas: acepta texto en caracteres latinos del hausa sin requerir fonemización previa.
- Generación de audio de voz monolingüe en hausa.
- Integración nativa con la librería phoonnx en Python y con OVOS para asistentes de voz.
- Ejecución en formato ONNX, lo que permite inferencia optimizada y despliegue en CPU.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking; es un modelo TTS puro.

## Casos de uso

- Asistentes de voz para hausa en OVOS: el modelo puede integrarse directamente en el framework OVOS a través de phoonnx para dar respuestas habladas en hausa en asistentes domésticos o dispositivos embebidos, gracias a su formato ONNX y su tamaño compacto.
- Lectura de noticias y contenidos en hausa: permite convertir artículos, boletines o comunicados en audio para radios comunitarias o plataformas de contenido de África Occidental, donde la disponibilidad de voces TTS en hausa es escasa.
- Accesibilidad para personas con discapacidad visual: puede narrar textos en hausa en aplicaciones de lectura de pantalla, aprovechando que trabaja con grafemas y evita complejidad de fonemización.
- Servicios de atención telefónica automatizada: puede generar prompts y respuestas habladas en hausa en sistemas IVR, reduciendo la dependencia de grabaciones humanas para cada frase.
- Educación y aprendizaje de idiomas: útil para generar material de escucha en hausa, como ejercicios de pronunciación o lectura de cuentos, en aplicaciones educativas de bajo coste.
- Señalización y anuncios públicos: puede sintetizar mensajes en hausa para transporte público, aeropuertos o servicios municipales, donde se requiere claridad y consistencia de voz.
- Prototipado rápido de productos de voz para mercados de habla hausa: al ser un modelo ligero en ONNX, permite iterar en demos y pruebas de concepto sin infraestructura GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas como MOS (Mean Opinion Score), MCD, WER ni comparaciones con otros sistemas TTS en hausa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del repositorio (0,1 GB) y la arquitectura VITS, es plausible que quepa holgadamente en GPUs de gama baja e incluso en CPU, pero no hay datos confirmados.
- GPU recomendadas: no disponible; al ser un modelo ONNX compacto, cualquier GPU con al menos unos pocos GB de memoria debería poder ejecutarlo, pero no se documenta.
- Cabe en consumer GPU: probablemente sí en cualquier GPU consumer moderna (GTX 1060 en adelante), así como en CPU, pero no confirmado por el autor.
- Opciones de despliegue: phoonnx (Python y OVOS) como librería oficial; al ser ONNX, también podría ejecutarse con ONNX Runtime directamente, aunque no está documentado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| vits-ha-mms_main_farmerline-graphemes | no disponible (repo 0,1 GB) | hausa (`ha`) | CC-BY-4.0 | ONNX | Hugging Face (Phoonnx) |
| VITS original (Kim et al., 2021) | ~ variable segun config | multilingue (entrenado por idioma) | MIT (codigo) | PyTorch | Repositorio oficial |
| Modelos MMS-TTS de Meta | no disponible | 1000+ idiomas, incluido hausa | CC-BY-NC-4.0 (mayoria) | PyTorch | Hugging Face (facebook/mms-tts) |
| FarmerlineML/main_hausa_TTS (upstream) | no disponible | hausa (`ha`) | CC-BY-4.0 | PyTorch (presumiblemente) | Hugging Face (FarmerlineML) |

La comparativa es limitada porque no se dispone de métricas de calidad ni de especificaciones detalladas de parámetros para este modelo ni para sus alternativas directas. La principal diferencia frente a MMS-TTS de Meta es la licencia: CC-BY-4.0 permite uso comercial, mientras que la mayoría de MMS-TTS usa CC-BY-NC-4.0.

## Limitaciones y advertencias

- Modelo monolingüe: solo soporta hausa (`ha`); no es adecuado para otros idiomas.
- Información muy escasa: la model card no documenta datos de entrenamiento, calidad, ni evaluación subjetiva, lo que dificulta estimar su robustez en producción.
- Riesgo de errores de pronunciación y prosodia en palabras poco frecuentes, nombres propios o texto con abreviaturas, al basarse en grafemas sin fonemización.
- Posibles sesgos de género, acento o dialecto derivados del dataset de entrenamiento de FarmerlineML/GhanaNLP, no documentados.
- La licencia CC-BY-4.0 exige atribución al autor original (GhanaNLP/FarmerlineML) en usos derivados y comerciales.
- No se documenta la existencia de voces en el índice de phoonnx, lo que puede complicar la integración automática en OVOS.
- No hay garantías sobre la calidad de audio en entornos con ruido o en dominios muy distintos del corpus de entrenamiento.
- Al ser un modelo TTS, no ofrece capacidades de razonamiento, tool calling ni agentes; su uso debe limitarse a síntesis de voz.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-ha-mms_main_farmerline-graphemes
- Upstream (FarmerlineML/main_hausa_TTS): https://huggingface.co/FarmerlineML/main_hausa_TTS
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Paper VITS (Kim et al., 2021): https://arxiv.org/abs/2106.06103
