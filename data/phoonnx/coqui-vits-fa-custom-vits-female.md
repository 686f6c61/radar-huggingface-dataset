# Phoonnx/coqui-vits-fa-custom-vits-female

## Resumen

Phoonnx/coqui-vits-fa-custom-vits-female es un modelo de síntesis de voz (text-to-speech) derivado de Coqui VITS, empaquetado en formato ONNX para su uso con la librería phoonnx. Lo publica el usuario Phoonnx como una extracción de un único modelo del repositorio agregado Phoonnx/phoonnx-coqui-vits, concretamente la carpeta `fa-custom-vits-female`. El identificador `fa` sugiere que el modelo está orientado al idioma persa (farsi), aunque la model card no lo declara explícitamente en el campo de idiomas.

El modelo resuelve la necesidad de disponer de una voz femenina sintética lista para inferencia en producción mediante ONNX Runtime, sin requerir el stack completo de Coqui TTS. Su relevancia radica en la distribución ligera (0,1 GB) y en la licencia CC-BY-4.0, que permite uso comercial con atribución. La información técnica publicada es mínima: no se detallan parámetros, contexto ni dataset de entrenamiento.

Al tratarse de una extracción de un repositorio mayor, las rutas internas de los ficheros se preservan y la voz se identifica con el id `coqui/fa-custom-vits-female` dentro del ecosistema phoonnx.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Coqui VITS (variacional con inferencia adversarial, extremo a extremo) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada de texto de longitud variable) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el identificador `fa` sugiere persa/farsi) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (librería phoonnx) |

## Arquitectura y entrenamiento

La arquitectura es Coqui VITS, un modelo generativo extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador y un discriminador adversarial entrenado de forma conjunta. VITS produce audio de forma directa a partir del texto sin necesidad de un vocoder separado, lo que simplifica el despliegue. La exportación a ONNX permite ejecutar la inferencia con ONNX Runtime en CPU o GPU sin dependencias del framework original de Coqui.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el hablante de origen ni si se aplicaron técnicas de ajuste fino adicionales. La model card indica únicamente que el modelo proviene de la carpeta `fa-custom-vits-female` del repositorio Phoonnx/phoonnx-coqui-vits y que conserva las rutas de ficheros originales. El calificador `custom` en el nombre sugiere un entrenamiento o ajuste propio, pero no se documenta.

## Capacidades

- Síntesis de voz a partir de texto (text-to-speech) con una voz femenina.
- Generación de audio en formato ONNX, ejecutable con ONNX Runtime.
- Integración con la librería phoonnx mediante el voice id `coqui/fa-custom-vits-female`.
- Orientación probable al idioma persa (farsi), inferida del prefijo `fa`; no confirmada en la documentación.
- No se documentan capacidades de clonación de voz, control de estilo, emoción ni prosodia avanzada.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso (no aplica a un modelo TTS).

## Casos de uso

- Síntesis de voz para aplicaciones de accesibilidad: lectura de texto en pantalla para usuarios con discapacidad visual, usando la inferencia ONNX ligera en dispositivos de gama baja.
- Generación de audiolibros y contenido narrado: el modelo produce voz femenina de forma determinista y puede integrarse en pipelines de conversión de texto a audio por lotes.
- Asistentes de voz en persa: integración en interfaces conversacionales donde se requiera una voz femenina en farsi, aprovechando el voice id de phoonnx.
- Localización de contenido multimedia: doblaje automatizado de vídeos o cursos al persa con una voz consistente y licencia permisiva para uso comercial.
- Sistemas de respuesta interactiva (IVR): generación dinámica de mensajes de voz en centralitas telefónicas, donde el tamaño reducido (0,1 GB) permite despliegue en servidores modestos.
- Pruebas y prototipado de productos de voz: al ser un modelo ONNX autocontenido, sirve para validar pipelines TTS antes de invertir en modelos mayores o voces personalizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; por el tamaño del repositorio (0,1 GB) y la arquitectura VITS, la inferencia cabe holgadamente en menos de 2 GB de memoria.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime (CUDA o DirectML); una RTX 3060 o superior es más que suficiente. También funciona en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en CPU para cargas moderadas.
- Opciones de despliegue: ONNX Runtime (principal), phoonnx; no se documenta soporte nativo de vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tamaño | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Phoonnx/coqui-vits-fa-custom-vits-female | Coqui VITS | 0,1 GB (repo) | no disponible (probable persa) | CC-BY-4.0 | ONNX |
| Coqui TTS VITS (original) | VITS | no disponible | multilingüe según checkpoint | MPL-2.0 / según checkpoint | PyTorch |
| Piper TTS | VITS | variable, ligero | multilingüe | MIT (código) / según voz | ONNX |
| XTTS-v2 (Coqui) | GPT-based TTS | ~1,8 GB | 17 idiomas | Coqui Public Model License | PyTorch |

La comparativa se basa en características generales de la categoría; no hay datos de rendimiento publicados para este modelo concreto que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Información técnica muy escasa: no se documentan parámetros, dataset, hablante ni proceso de entrenamiento, lo que dificulta evaluar su calidad.
- Idioma no declarado oficialmente; el uso en persa es una inferencia a partir del prefijo `fa` y debe validarse empíricamente.
- Riesgo de artefactos y pronunciación incorrecta en texto fuera del dominio de entrenamiento, especialmente en nombres propios, números y siglas.
- Sin datos sobre sesgos de género, acento o dialecto dentro del idioma objetivo.
- Licencia CC-BY-4.0: permite uso comercial con atribución obligatoria; es necesario citar al autor y la fuente.
- Al ser una extracción de un repositorio agregado, la procedencia exacta del checkpoint original no está trazada en la model card.
- No apto para clonación de voz ni control fino de prosodia según la documentación disponible.
- Recomendable auditar la calidad del audio en el dominio de producción antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/coqui-vits-fa-custom-vits-female
- Repositorio agregado de origen: https://huggingface.co/Phoonnx/phoonnx-coqui-vits
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
