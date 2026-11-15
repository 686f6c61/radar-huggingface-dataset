# Phoonnx/styletts2-proxectonos-gl-brais

## Resumen

`Phoonnx/styletts2-proxectonos-gl-brais` es un checkpoint de síntesis de voz (text-to-speech) derivado del modelo StyleTTS2, publicado por el usuario Phoonnx como parte del repositorio agregador `Phoonnx/phoonnx-styletts2`. Se distribuye en formato ONNX dentro de la carpeta `proxectonos-gl-brais` y está pensado para su uso con la librería `phoonnx` (proyecto de TigreGotico), que actúa como runtime de inferencia para estos checkpoints. Por el identificador `gl` y la referencia a Proxecto Nós, la voz apunta a gallego, concretamente a la voz identificada como `brais`.

El modelo no es un desarrollo original de arquitectura: es un empaquetado de pesos StyleTTS2 convertidos a ONNX para facilitar el despliegue sin dependencias de PyTorch. StyleTTS2 es una arquitectura de TTS basada en difusión y estilo que combina un encoder de texto, un módulo de estilo y un decoder acústico, con un vocoder integrado en la mayoría de implementaciones. El repositorio ocupa 0,8 GB, lo que es coherente con un checkpoint de TTS de tamaño moderado más sus ficheros auxiliares.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo de nicho, sin descargas ni interacciones registradas en Hugging Face en el momento de la consulta, orientado a un caso de uso muy específico (síntesis de voz en gallego dentro del ecosistema phoonnx). No hay información pública sobre datos de entrenamiento, métricas de calidad ni evaluación objetiva, por lo que la ficha refleja únicamente lo que el autor declara en la model card y en los metadatos del repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | StyleTTS2 (TTS neuronal con módulo de estilo y decoder acústico; pesos exportados a ONNX) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no generativo de texto; la longitud se mide en fonemas/caracteres de entrada) |
| Tipos de cuantización | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | gallego (inferido del identificador `gl` y de la referencia a Proxecto Nós; no confirmado explícitamente en la model card) |
| Licencia | `other` (la licencia efectiva es la del repositorio de origen `Phoonnx/phoonnx-styletts2`; `phoonnx` como software es Apache-2.0, pero los checkpoints proceden de distintos laboratorios con licencias distintas) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

StyleTTS2 es una arquitectura de síntesis de voz que separa la representación de contenido (fonemas o caracteres) de la representación de estilo (prosodia, timbre, velocidad), y utiliza un decoder basado en difusión para generar la señal acústica. El modelo incorpora típicamente un discriminador adversarial durante el entrenamiento y un módulo de estilo que permite controlar la expresividad. En esta distribución concreta, los pesos se han exportado a ONNX para su ejecución con `phoonnx`, lo que elimina la dependencia de PyTorch en producción y facilita el despliegue en entornos con requisitos de portabilidad.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni de innovaciones técnicas específicas de este checkpoint. La model card únicamente indica que el modelo forma parte de un repositorio agregador y que conserva las rutas de ficheros del repositorio original. No se documenta si el checkpoint ha sido fine-tuneado sobre la voz `brais` a partir de un modelo base StyleTTS2 o si procede de un entrenamiento desde cero.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto de entrada, con salida de audio.
- Control de estilo y prosodia inherente a la arquitectura StyleTTS2 (no se documenta el grado de control expuesto en esta exportación).
- Ejecución mediante ONNX Runtime a través de la librería `phoonnx`.
- Identificador de voz `proxectonos/brais-styletts2`, que permite seleccionar esta voz dentro del ecosistema phoonnx.
- Soporte multilingüe: no disponible; el identificador sugiere gallego, pero no se confirma en la documentación.
- Tool calling / function calling: no aplica (modelo TTS).
- Capacidades de agente o razonamiento multi-paso: no aplica.
- Modo thinking, visión o audio de entrada: no disponible.

## Casos de uso

- Lectura de contenido web en gallego: el modelo puede convertir artículos o textos de interfaz en audio para aplicaciones de accesibilidad o lectura por voz, aprovechando la voz `brais` para una locución consistente en gallego.
- Locución de asistentes conversacionales en gallego: integrado en un pipeline de ASR + LLM + TTS, este checkpoint cubre la fase de síntesis para respuestas habladas en dicho idioma.
- Generación de audiolibros o pódcast automatizados: al ser un modelo TTS con control de estilo, permite producir narraciones de varios minutos siempre que se gestione la segmentación por frases.
- Sistemas de anuncios y megafonía: para mensajes pregrabados o dinámicos en gallego en entornos como transporte público o comercios, con despliegue ligero vía ONNX.
- Pruebas de integración en el ecosistema phoonnx: sirve como checkpoint de referencia para validar el runtime `phoonnx` con una voz gallega concreta antes de desplegar otras voces del repositorio agregador.
- Investigación en TTS de bajos recursos: al ser una voz de un idioma con menos recursos que el inglés, puede usarse como punto de partida para experimentos de adaptación o evaluación de calidad en gallego.
- Prototipado de interfaces de voz: para desarrolladores que necesitan una voz en gallego sin entrenar un modelo propio, con la ventaja de un formato ONNX portable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 0,8 GB, por lo que un checkpoint ONNX de este tamaño es compatible con GPUs de gama baja y con ejecución en CPU.
- GPU recomendadas: no documentadas por el autor; por el tamaño del artefacto, es viable en GPUs consumer como RTX 3060, RTX 4060 o superiores, así como en GPUs de datacenter (A100, H100) sin aprovechar su capacidad completa.
- Compatibilidad con GPU consumer: previsiblemente sí, dado el tamaño del repositorio; no confirmado por el autor.
- Opciones de despliegue: ONNX Runtime a través de la librería `phoonnx`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Phoonnx/styletts2-proxectonos-gl-brais` | StyleTTS2 (ONNX) | gallego (inferido) | ONNX | `other` | Hugging Face, 0 descargas |
| StyleTTS2 (repositorio original, `yl4579/StyleTTS2`) | StyleTTS2 (PyTorch) | inglés principalmente | PyTorch | MIT (según repositorio original) | Hugging Face / GitHub |
| Otras voces del agregador `Phoonnx/phoonnx-styletts2` | StyleTTS2 (ONNX) | según carpeta (catalán, gallego, etc.) | ONNX | `other` (varía por checkpoint) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada. La comparación se limita a arquitectura, formato y licencia.

## Limitaciones y advertencias

- Ausencia total de métricas de calidad: no hay evaluaciones MOS, comparativas con voces humanas ni pruebas de inteligibilidad publicadas.
- Licencia ambigua: la model card indica `license: other` y remite a la licencia del repositorio de origen, que agrupa checkpoints de distintos laboratorios con licencias distintas. Antes de un uso comercial es imprescindible verificar la licencia concreta del checkpoint `proxectonos-gl-brais` en el repositorio `Phoonnx/phoonnx-styletts2`.
- Idioma no confirmado: la documentación no declara explícitamente el gallego; la inferencia se basa en el identificador `gl` y en la referencia a Proxecto Nós.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí existe riesgo de pronunciación incorrecta, artefactos acústicos y prosodia antinatural en textos con nombres propios, siglas o puntuación atípica.
- Sin soporte documentado de cuantización ni de optimizaciones de latencia; el rendimiento en producción no está caracterizado.
- Modelo de nicho con cero descargas y cero interacciones: no hay evidencia de uso en producción ni de mantenimiento activo más allá de la fecha de creación del repositorio.
- Posibles sesgos de la voz `brais`: al ser una voz concreta, su timbre, edad percibida y acento pueden no representar la diversidad de hablantes del gallego.
- Dependencia de la librería `phoonnx`: el modelo está empaquetado para ese runtime, lo que limita su uso directo con otras herramientas sin conversión adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/styletts2-proxectonos-gl-brais
- Repositorio agregador de origen: https://huggingface.co/Phoonnx/phoonnx-styletts2
- Librería phoonnx (GitHub): https://github.com/TigreGotico/phoonnx
- StyleTTS2 (repositorio original de referencia): no disponible en la información proporcionada
- Paper de StyleTTS2: no disponible en la información proporcionada
- Demo o espacio asociado: no disponible
