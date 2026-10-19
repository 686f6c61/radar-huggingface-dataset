# bishoygaloaa/ViMoLa

## Resumen

ViMoLa (Video Motion Language) es un método de generación de vídeo image-to-video desarrollado por Bishoy Galoaa y Sarah Ostadabbas, de Northeastern University, y presentado en la model card como aceptado en WACV 2027. Su objetivo es controlar el movimiento de un vídeo generado mediante lenguaje natural: predice tokens discretos de movimiento a partir del texto y los inyecta en un backbone Wan 2.2 TI2V de 5B parámetros que permanece congelado. No requiere trayectorias, arrastres ni rutas de cámara en inferencia; la única interfaz es el texto y el primer fotograma.

El modelo es relevante porque separa la descripción semántica del movimiento de la generación visual. En lugar de depender de control geométrico explícito, aprende un espacio discreto de movimiento con un tokenizador VQ-VAE espacial, un transformer texto-movimiento y adaptadores zero-gated sobre Wan 2.2. La model card muestra un ejemplo cualitativo en el que Wan 2.2 apenas genera movimiento ante el prompt “pushing a boulder up a steep hill”, mientras que ViMoLa produce el desplazamiento descrito usando solo texto e imagen.

No es un modelo de lenguaje general ni un sistema multimodal de propósito amplio: es un método de investigación para control de movimiento en generación de vídeo. El repositorio de Hugging Face ocupa 4,7 GB, contiene checkpoints en formato PyTorch `.pt` y se distribuye con licencia MIT para los pesos y el código de ViMoLa, aunque el backbone Wan 2.2 y los datasets conservan sus propias licencias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Generación de vídeo image-to-video basada en difusión, con backbone Wan 2.2 TI2V congelado, adaptadores zero-gated, tokenizador VQ-VAE de movimiento espacial y transformer texto-movimiento |
| Parámetros totales | no disponible (el backbone Wan 2.2 TI2V es de 5B; no se publica el total de ViMoLa con tokenizer, t2m y adaptadores) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (modelo de vídeo; no se especifica ventana de contexto textual ni duración máxima de clip) |
| Tipos de cuantización | no disponible (solo checkpoints `.pt`; no se documentan variantes GGUF, FP8 o INT8) |
| Idiomas soportados | inglés (`en`); no se documentan otros idiomas |
| Licencia | MIT para los pesos y el código de ViMoLa; Wan 2.2 y los datasets conservan sus propias licencias |
| Formato de pesos | checkpoints PyTorch `.pt` (`tokenizer.pt`, `t2m.pt`, `adapters.pt`); backbone Wan en formato Diffusers |
| Pipeline | image-to-video |
| Modelo base | Wan-AI/Wan2.2-TI2V-5B-Diffusers |
| Desarrolladores | Bishoy Galoaa y Sarah Ostadabbas (Northeastern University) |
| Tamaño del repositorio | 4,7 GB |

## Arquitectura y entrenamiento

ViMoLa se construye sobre Wan 2.2 TI2V, un backbone de difusión para generación de vídeo a partir de imagen. La propuesta añade tres componentes: un tokenizador VQ-VAE que discretiza el movimiento espacial, un transformer texto-movimiento que predice tokens discretos a partir del prompt y unos adaptadores zero-gated que inyectan esa información en el backbone congelado. De este modo, el entrenamiento se concentra en el espacio de movimiento y en los adaptadores, sin reentrenar el generador base. En inferencia solo se necesitan una imagen inicial y una descripción textual; no se usan trayectorias, puntos de control ni cámaras explícitas.

La model card no detalla el número de tokens de entrenamiento, la composición del dataset, la resolución o duración de los clips, ni si se aplicaron técnicas de alineamiento como RLHF o DPO. Tampoco se especifican los pasos de muestreo o el coste computacional del entrenamiento. La innovación principal es el uso de tokens discretos de movimiento como interfaz entre lenguaje y generación de vídeo, junto con la inyección mediante adaptadores en un backbone congelado. El autor recomienda un valor de `--adapter_strength 0.1` para la inferencia.

## Capacidades

- Generación de vídeo image-to-video condicionada por una imagen inicial y un prompt textual en inglés.
- Control de movimiento guiado por lenguaje mediante tokens discretos, sin trayectorias ni rutas de cámara en inferencia.
- Predicción de un campo de movimiento a partir del texto, que se inyecta en el backbone Wan 2.2 mediante adaptadores.
- Experimentación con el tokenizador de movimiento, el transformer texto-movimiento y los adaptadores de forma separada.
- Ajuste de la intensidad de los adaptadores mediante `adapter_strength`, con 0.1 como valor recomendado.
- No se documenta soporte de tool calling ni function calling; no es un modelo de lenguaje.
- No se documenta soporte de agentes, multi-step reasoning ni modos de razonamiento explícito.
- No se documentan capacidades multilingües; el tag de idioma es únicamente inglés.
- No se documentan audio, visión general más allá de la imagen de condicionamiento, ni modo thinking.
- No está orientado a generación de texto, código o matemáticas; su ámbito es la generación de vídeo.

## Casos de uso

- Previsualización de animáticos y storyboards: se parte de un fotograma clave y se describe la acción para generar un clip de movimiento. Es adecuado porque no exige rigging ni trayectorias, solo imagen y lenguaje, lo que acelera la validación de una secuencia antes de producirla.
- Generación de B-roll a partir de fotos fijas: una imagen de producto, paisaje o escena se anima con una acción descrita en el prompt. Resulta útil para contenido corto y prototipos visuales, aunque no ofrece control explícito de cámara.
- Investigación en representaciones discretas de movimiento: los checkpoints `tokenizer.pt`, `t2m.pt` y `adapters.pt` permiten analizar tokens, ablacionar componentes y medir el efecto de los adaptadores sobre un backbone congelado.
- Docencia y demostraciones técnicas: comparar Wan 2.2 base con ViMoLa usando la misma imagen y el mismo prompt. El ejemplo de la model card sirve para explicar cómo el lenguaje puede inducir movimiento sin trayectorias.
- Prototipado de efectos visuales y animación: generar borradores de movimiento para una escena a partir de un frame y decidir si merece un render final. Es adecuado para exploración creativa, no como sustituto de simulación física.
- Evaluación de pipelines image-to-video: integrar el modelo en Diffusers, probar `adapter_strength` y medir consumo de VRAM, latencia y calidad perceptual en un entorno controlado.
- Generación de clips divulgativos: animar una ilustración educativa con una acción simple descrita en inglés, con revisión humana posterior para evitar artefactos o incoherencias.
- Exploración creativa iterativa: mantener una misma imagen inicial e ir cambiando el prompt para obtener variantes de movimiento. La interfaz exclusivamente textual simplifica la iteración frente a sistemas que requieren control geométrico.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| MMLU, HumanEval, GSM8K | no aplica (modelo de vídeo) |
| Benchmarks cuantitativos de vídeo o movimiento | no disponible |

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente una comparación cualitativa mediante un teaser: con el mismo prompt y el mismo primer fotograma, Wan 2.2 permanece casi estático y ViMoLa genera el movimiento de subida descrito. No se proporcionan métricas de calidad, coherencia temporal, fidelidad al prompt ni coste computacional.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada. Como referencia de orden de magnitud, 5B parámetros en FP16 ocupan aproximadamente 10 GB solo en pesos; el pipeline de vídeo añade latentes, atención y VAE. Una estimación orientativa de 24 GB o más es razonable, pero no está confirmada por los autores.
- GPU recomendadas: A100 o H100 para experimentación; RTX 4090 o RTX 3090 de 24 GB como opción consumer orientativa. No hay validación publicada de estos entornos.
- ¿Cabe en consumer GPU? No confirmado. Con 24 GB podría intentarse, pero el repositorio no documenta cuantización ni recetas de bajo VRAM; las GPU de 8-12 GB son probablemente insuficientes.
- Opciones de despliegue: Diffusers y los scripts del repositorio (`scripts/infer.sh`). No se documentan vLLM, llama.cpp, Ollama ni TGI; no son herramientas aplicables a este tipo de modelo de vídeo.
- Latencia y throughput: no disponibles. Dependen de la GPU, la resolución, la duración del clip y el número de pasos de muestreo, y no hay cifras publicadas.
- Almacenamiento: el repositorio de ViMoLa ocupa 4,7 GB; el backbone Wan 2.2 TI2V 5B se descarga aparte desde su propio repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ViMoLa | backbone de 5B más adaptadores; total no disponible | no aplica | sin benchmarks; control de movimiento por texto | MIT para ViMoLa; Wan 2.2 conserva su licencia | Hugging Face, 0 descargas y 1 like en la información consultada; no desplegado por Inference Providers |
| Wan-AI/Wan2.2-TI2V-5B-Diffusers | 5B | no aplica | modelo base image-to-video; en el teaser cualitativo queda casi estático con el prompt de ejemplo | licencia propia de Wan 2.2, no detallada en la información | Hugging Face |
| Otros modelos image-to-video | no disponible | no disponible | no disponible | no disponible | no se han identificado alternativas con datos verificables en la información proporcionada |

La comparación cuantitativa con otros sistemas de generación de vídeo condicionada por movimiento no está disponible. La única comparación directa documentada es cualitativa, frente al backbone Wan 2.2 sin adaptadores.

## Limitaciones y advertencias

- Modelo de investigación con 0 descargas y 1 like en el momento de la consulta; no hay validación externa ni resultados reproducidos por terceros.
- No se han publicado benchmarks cuantitativos de calidad de vídeo, fidelidad al prompt, coherencia temporal o control de movimiento.
- El control es semántico: no hay trayectorias, puntos de arrastre ni rutas de cámara. Movimientos complejos, precisos o físicamente exigentes pueden no obedecer al texto.
- El autor recomienda `adapter_strength 0.1`; no se documenta el comportamiento con otros valores ni los riesgos de saturación o artefactos.
- Riesgo de artefactos visuales, incoherencia entre fotogramas y movimiento no físico; no es un simulador físico ni una herramienta de producción validada.
- No se documentan sesgos específicos. Al heredar el backbone Wan 2.2, puede reproducir sesgos presentes en sus datos de entrenamiento, que no se detallan.
- Solo se declara inglés; no hay soporte documentado para prompts en castellano u otros idiomas.
- La licencia MIT cubre los pesos y el código de ViMoLa, pero no necesariamente el backbone Wan 2.2 ni los datasets utilizados. Es necesario revisar las licencias de terceros antes de un uso comercial.
- Los checkpoints se distribuyen como archivos `.pt`; no hay versiones safetensors ni variantes cuantizadas documentadas. Deben cargarse solo desde fuentes fiables.
- No hay información sobre duración máxima de clip, resolución de salida, número de pasos de muestreo ni latencia, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bishoygaloaa/ViMoLa
- Repositorio de código: https://github.com/ostadabbas/ViMoLa
- Modelo base Wan 2.2 TI2V 5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers
- Conferencia WACV 2027: https://wacv2027.thecvf.com/
- Perfil del autor en Hugging Face: https://huggingface.co/bishoygaloaa
- Paper: no disponible en la información proporcionada.
