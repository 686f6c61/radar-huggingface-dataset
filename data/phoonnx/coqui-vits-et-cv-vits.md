# Phoonnx/coqui-vits-et-cv-vits

## Resumen

`coqui-vits-et-cv-vits` es un modelo de síntesis de voz (text-to-speech) publicado por el usuario Phoonnx en Hugging Face. Se trata de una conversión al formato ONNX de un modelo Coqui VITS entrenado originalmente para el estonio (código de idioma `et-EE`) sobre el corpus Common Voice. El modelo se distribuye como un artefacto aislado dentro del repositorio agregador `Phoonnx/phoonnx-coqui-vits`, en la carpeta `et-cv-vits`, y está pensado para ser consumido por la librería `phoonnx`, un runtime de inferencia TTS basado en ONNX mantenido en el repositorio `TigreGotico/phoonnx`.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, orientado a un único idioma y a un único ecosistema de despliegue (ONNX Runtime a través de phoonnx). No es un modelo fundacional ni compite con los grandes sistemas TTS comerciales; su valor está en ofrecer una voz estonia funcional, ligera (el repositorio ocupa aproximadamente 0,1 GB) y con licencia permisiva BSD-3-Clause, lo que facilita su integración en productos.

La información pública disponible es muy escasa: la model card se limita a identificar el modelo de origen, el idioma y la licencia, sin detallar arquitectura interna, número de parámetros, dataset de entrenamiento más allá de "Common Voice", ni resultados de evaluación. Esta ficha refleja esa limitación de forma explícita y marca como "no disponible" todo aquello que el autor no documenta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), según la nomenclatura `coqui-vits`; detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; no procesa contexto de texto largo como un LLM) |
| Tipos de cuantización | no disponible (el artefacto se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | estonio (`et-EE`) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo se etiqueta como `coqui-vits`, lo que indica que deriva de la implementación VITS de Coqui TTS. VITS es una arquitectura de síntesis de voz extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador generativo basado en flujos normalizadores y un discriminador adversarial multiperiodo para el entrenamiento. No obstante, la model card no aporta detalles sobre la configuración concreta (dimensión de los embeddings, número de capas, resolución del espectrograma, tasa de muestreo de audio) ni sobre hiperparámetros de entrenamiento.

Respecto a los datos, la única información disponible es que el modelo se entrenó sobre Common Voice para el estonio (`et-EE`). No se especifica el número de horas de audio, la composición exacta del corpus, si hubo ajuste fino adicional, ni si se aplicaron técnicas de aumento de datos. Tampoco se documenta ningún proceso de RLHF, DPO ni optimización posterior; en TTS estos mecanismos no son habituales, pero el autor no lo aclara. La innovación técnica destacable es la conversión a ONNX, que permite ejecutar el modelo sin depender del stack completo de PyTorch/Coqui y facilita el despliegue en entornos ligeros mediante `phoonnx`.

## Capacidades

- Síntesis de voz a partir de texto en estonio (`et-EE`), con salida de audio mono.
- Inferencia mediante ONNX Runtime a través de la librería `phoonnx`.
- Integración con el ecosistema de identificadores de voz de phoonnx bajo el id `coqui/et-cv-vits`.
- No se documenta soporte de tool calling, function calling ni capacidades de agente (no aplica a un modelo TTS).
- No se documenta capacidad multilingüe: el modelo está entrenado exclusivamente para estonio.
- No se documentan modos especiales (clonación de voz, control de emoción, control de prosodia, streaming) en la información disponible.

## Casos de uso

- Lectura de contenido en estonio para aplicaciones de accesibilidad: el modelo puede convertir artículos, noticias o documentos en audio para usuarios con discapacidad visual, aprovechando que es un TTS ligero (0,1 GB) desplegable en servidor.
- Asistentes de voz locales para el mercado estonio: integración en dispositivos o aplicaciones que necesiten respuestas habladas en estonio sin depender de APIs en la nube, gracias al formato ONNX y a la licencia permisiva.
- Generación de audio para contenidos educativos: creación de material de aprendizaje de estonio (pronunciación de vocabulario, frases de ejemplo) en pipelines automatizados.
- Sistemas de megafonía o anuncios automatizados en estonio: síntesis de mensajes dinámicos en entornos como transporte público o comercios, con latencia baja al ejecutarse en ONNX Runtime.
- Prototipado rápido de interfaces conversacionales: al ser un artefacto pequeño y con licencia BSD-3-Clause, sirve para validar productos de voz en estonio antes de invertir en modelos comerciales.
- Investigación en TTS de bajos recursos: como ejemplo de modelo VITS entrenado sobre Common Voice para un idioma con pocos hablantes, útil para estudios comparativos de calidad y cobertura lingüística.
- Integración en pipelines de doblaje o subtitulado automatizado para contenido en estonio, siempre que se valide la calidad de la voz en el dominio concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0,1 GB) y la naturaleza de un modelo VITS, se espera que quepa holgadamente en GPUs de gama baja, pero el autor no publica cifras.
- GPU recomendadas: no disponible. Un modelo VITS de este tamaño suele ejecutarse en CPU con latencia aceptable para frases cortas, pero no hay datos publicados que lo confirmen.
- ¿Cabe en GPU de consumo? Muy probablemente sí en cualquier GPU de consumo moderna (incluso integradas), dado el tamaño del artefacto, pero no está documentado.
- Opciones de despliegue: ONNX Runtime a través de la librería `phoonnx` (https://github.com/TigreGotico/phoonnx). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLMs, no aplicables).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Phoonnx/coqui-vits-et-cv-vits` | Estonio (et-EE) | VITS (Coqui) | ONNX | BSD-3-Clause | Hugging Face, 0 descargas |
| Coqui TTS VITS multilingüe (genérico) | Varios | VITS | PyTorch | MPL-2.0 (según versión) | Coqui TTS |
| Piper (voces por idioma) | Varios, incluido estonio | VITS | ONNX | MIT (mayoría de voces) | GitHub / Hugging Face |

La comparativa es aproximada: no se dispone de datos de rendimiento del modelo evaluado ni de alternativas específicas para estonio con métricas publicadas en la información proporcionada. La principal diferencia frente a Piper es el ecosistema de runtime (`phoonnx` frente a `piper`) y la licencia; frente a Coqui TTS original, el formato ONNX y el tamaño reducido del artefacto.

## Limitaciones y advertencias

- Información muy escasa: la model card no documenta arquitectura interna, parámetros, dataset detallado ni evaluación, lo que dificulta estimar la calidad real del modelo.
- Cero descargas y cero likes: no hay evidencia de uso en producción ni validación por parte de la comunidad.
- Monolingüe: solo estonio; no debe esperarse calidad en otros idiomas.
- Riesgo de alucinación y artefactos de audio: como todo TTS, puede generar pronunciaciones incorrectas, ruidos o entonación antinatural, especialmente con texto fuera del dominio de Common Voice (nombres propios, siglas, números).
- Sesgos: al entrenarse sobre Common Voice, puede heredar sesgos de representación (acentos, edad, género) del corpus; no se documenta análisis alguno.
- Licencia BSD-3-Clause: permisiva para uso comercial, pero conviene revisar las condiciones de la licencia del modelo de origen (`coqui/et-cv-vits`) y del corpus Common Voice, que puede tener sus propias restricciones de atribución.
- Dependencia de un runtime específico (`phoonnx`): la portabilidad fuera de ese ecosistema requiere trabajo adicional, aunque el formato ONNX facilita la integración con otros motores.
- Fecha de creación futura (2026-11-14): el repositorio parece reciente o con metadatos anómalos; conviene verificar su vigencia antes de adoptarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/coqui-vits-et-cv-vits
- Repositorio agregador de origen: https://huggingface.co/Phoonnx/phoonnx-coqui-vits
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Coqui TTS (proyecto de origen de la arquitectura): https://github.com/coqui-ai/TTS
- Common Voice (corpus de entrenamiento): https://commonvoice.mozilla.org/
