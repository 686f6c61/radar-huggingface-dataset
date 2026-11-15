# Phoonnx/glowtts-en-us-cmu_fem

## Resumen

GlowTTS en-us-cmu_fem es un modelo de síntesis de voz (text-to-speech) en formato ONNX, publicado por Phoonnx como una de las voces del paquete Phoonnx/phoonnx-glowtts. Se trata de una exportación de una voz femenina en inglés estadounidense, originalmente entrenada con la arquitectura GlowTTS, y empaquetada para su uso con la librería phoonnx, un runtime de TTS basado en ONNX desarrollado por TigreGotico.

El modelo resuelve el problema de la síntesis de voz local y ligera: al estar en formato ONNX, puede ejecutarse sin depender de frameworks de deep learning pesados y con requisitos de hardware modestos. El repositorio ocupa aproximadamente 0,1 GB, lo que lo sitúa en la categoría de modelos de TTS ligeros aptos para despliegue en CPU o GPU de gama baja.

La relevancia de esta ficha es acotada: se trata de un artefacto de inferencia derivado de un repositorio mayor, con documentación mínima, licencia genérica "other" y sin métricas publicadas. No es un modelo fundacional ni un lanzamiento con paper asociado, sino una voz concreta dentro de un catálogo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlowTTS (texto a mel-espectrograma basado en flujo normalizador, según el nombre del modelo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos exportados en ONNX) |
| Idiomas soportados | inglés estadounidense (en-us, según el identificador de la voz) |
| Licencia | other (sin licencia concreta especificada para esta carpeta) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El nombre del modelo indica que se basa en GlowTTS, una arquitectura de síntesis de voz que combina un encoder de texto con un decoder generativo basado en flujos normalizadores (normalizing flows) para producir mel-espectrogramas, junto con un vocoder que convierte esos espectrogramas en forma de onda. La exportación a ONNX sugiere que el modelo se ha optimizado para inferencia portable mediante la librería phoonnx, que consume directamente los ficheros ONNX.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el corpus de voz concreto (el identificador "cmu_fem" apunta a una voz femenina de un corpus tipo CMU, aunque no se confirma en la información disponible), ni sobre el uso de técnicas de ajuste como RLHF o DPO, que en TTS no son habituales. Tampoco se documentan innovaciones técnicas adicionales más allá de la propia arquitectura GlowTTS y su empaquetado ONNX.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense, con una voz femenina concreta.
- Generación de audio en formato mel-espectrograma y conversión a forma de onda mediante el pipeline de phoonnx.
- Ejecución local en formato ONNX, sin dependencia de PyTorch en tiempo de inferencia.
- Integración con el runtime phoonnx mediante el identificador de voz `larynx/en-us-cmu_fem-glow_tts`.
- No se documenta soporte de control de prosodia avanzado, clonación de voz, multilingüismo ni tool calling.
- No se documentan capacidades de razonamiento, código, visión ni agentes (no aplica a un modelo TTS).

## Casos de uso

- Lectura de artículos y documentos en aplicaciones de accesibilidad: el modelo puede convertir texto en voz para lectores de pantalla o herramientas de asistencia, ejecutándose en local gracias al formato ONNX y su reducido tamaño.
- Asistentes de voz embebidos en dispositivos con recursos limitados: al ocupar aproximadamente 0,1 GB y no requerir PyTorch, puede desplegarse en entornos de borde o en contenedores ligeros.
- Generación de narración para vídeos y pódcasts de prototipado: una voz femenina en inglés estadounidense permite producir pistas de voz de forma automatizada en fases de preproducción.
- Pruebas de integración en pipelines de phoonnx: sirve como voz de referencia para validar el runtime, comparar latencias y verificar el pipeline de inferencia ONNX.
- Sistemas de respuesta por voz en inglés para demos y prototipos: puede integrarse en un backend que sintetice respuestas a partir de texto generado por otro modelo.
- Investigación en TTS y evaluación de arquitecturas GlowTTS: al ser un artefacto ONNX reproducible, facilita comparaciones de calidad y rendimiento frente a otras voces del mismo catálogo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; por el tamaño del repositorio (aproximadamente 0,1 GB), la huella de memoria es reducida y compatible con ejecución en CPU.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) sería sobredimensionada, y la inferencia en CPU es viable.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU consumer actual e incluso en CPU, aunque no se aportan cifras oficiales.
- Opciones de despliegue: runtime phoonnx (basado en ONNX); también podría ejecutarse con ONNX Runtime directamente si se respetan las interfaces del modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto / notas |
|---|---|---|---|---|---|
| Phoonnx/glowtts-en-us-cmu_fem | GlowTTS | en-us | ONNX | other | Voz femenina del catálogo phoonnx |
| Otras voces de Phoonnx/phoonnx-glowtts | GlowTTS | variable según carpeta | ONNX | other | Mismo repositorio origen, distintas voces |
| Modelos TTS tipo VITS (por ejemplo, Coqui TTS) | VITS | multilingüe según modelo | PyTorch / ONNX | variable | Ecosistema más amplio, requiere verificación por modelo |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La licencia es "other" y no se especifica una licencia concreta para esta carpeta, lo que impide confirmar si el uso comercial está permitido; es imprescindible contactar con el autor o revisar el repositorio origen antes de usarlo en producción.
- Solo se documenta inglés estadounidense; no hay soporte multilingüe confirmado.
- No se publican métricas de calidad (MOS, inteligibilidad, naturalidad), por lo que la calidad real de la voz es desconocida.
- Al ser una voz concreta derivada de un corpus, puede presentar sesgos de dominio (estilo de locución, registro) y no cubrir bien texto fuera de distribución.
- Riesgo de errores de pronunciación en nombres propios, siglas y términos técnicos, habitual en modelos TTS sin diccionario fonético específico.
- No se documentan limitaciones de longitud de entrada ni de contexto; conviene trocear textos largos en frases para evitar degradación.
- El repositorio tiene cero descargas y cero likes, lo que sugiere poca validación por parte de la comunidad.
- No se aportan garantías de mantenimiento ni actualizaciones por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en-us-cmu_fem
- Repositorio origen del catálogo de voces: https://huggingface.co/Phoonnx/phoonnx-glowtts
- Runtime phoonnx: https://github.com/TigreGotico/phoonnx
