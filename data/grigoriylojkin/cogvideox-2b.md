# GrigoriyLojkin/CogVideoX-2b

## Resumen

CogVideoX-2B es un modelo de generación de vídeo a partir de texto (text-to-video) desarrollado por el equipo de THUDM (Tsinghua University) y publicado como código abierto bajo licencia Apache 2.0. Se trata de la versión inicial de la serie CogVideoX, un modelo de entrada que prioriza la compatibilidad y el bajo coste computacional, pensado para facilitar la experimentación y el desarrollo secundario en tareas de síntesis de vídeo. Este repositorio concreto es un espejo alojado por GrigoriyLojkin, aunque el modelo original se encuentra en THUDM/CogVideoX-2b.

El modelo genera clips de vídeo de 6 segundos a una resolución de 720×480 píxeles y 8 fotogramas por segundo a partir de descripciones textuales en inglés. Su arquitectura se basa en un transformer de difusión 3D con un VAE espaciotemporal, y cuenta con aproximadamente 1.690 millones de parámetros (1.693.783.872 según los pesos safetensors). Está diseñado para ejecutarse en GPU de consumo, con un consumo de VRAM que puede partir desde 4 GB en configuraciones optimizadas con diffusers, lo que lo hace accesible para desarrolladores individuales y pequeños equipos.

La relevancia actual de este modelo radica en que democratiza la generación de vídeo de calidad media-alta, ofreciendo una alternativa ligera y de código abierto frente a soluciones propietarias. Su integración con la librería diffusers y su licencia permisiva facilitan su adopción en prototipos, investigaciones y aplicaciones comerciales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión 3D con VAE espaciotemporal (CogVideoX) |
| Parametros totales | 1.693.783.872 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No aplica (generación de vídeo, no texto) |
| Tipos de cuantizacion | FP16 (recomendado), BF16, FP32, FP8, INT8; no soporta INT4 |
| Idiomas soportados | Inglés (según metadatos del modelo) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (también compatible con diffusers) |

## Arquitectura y entrenamiento

CogVideoX-2B emplea una arquitectura de difusión latente aplicada al dominio del vídeo. Combina un transformer 3D que procesa secuencias de fotogramas latentes con un VAE espaciotemporal que comprime el vídeo en un espacio latente de menor dimensión. El modelo sigue el paradigma de difusión denoising: dado un prompt textual, se genera un tensor latente ruidoso que se refina iterativamente hasta producir el vídeo final. El texto se codifica mediante un codificador de lenguaje (no se especifica cuál en la documentación disponible) y se inyecta en el transformer mediante mecanismos de atención cruzada.

En cuanto al entrenamiento, no se han publicado detalles específicos sobre el número de tokens de vídeo, la composición del dataset o el uso de técnicas de alineación como RLHF o DPO. La documentación indica que el modelo es una versión open source derivada del sistema comercial QingYing, pero no se aportan datos cuantitativos sobre el proceso de entrenamiento. Tampoco se mencionan innovaciones técnicas destacables más allá de la propia arquitectura de difusión 3D, que ya es un estándar en el campo.

## Capacidades

- Generación de vídeo a partir de prompts textuales en inglés, produciendo clips de 6 segundos a 720×480 píxeles y 8 fps.
- Soporte de resolución fija (720×480) y duración fija; no admite generación de vídeo a partir de imágenes (solo texto a vídeo).
- No incluye capacidades de tool calling, function calling ni razonamiento multi-paso; es un modelo puramente generativo de vídeo.
- No es multimodal en el sentido de aceptar imágenes o audio como entrada; solo texto.
- Compatible con el pipeline `CogVideoXPipeline` de la librería diffusers, lo que facilita su integración en flujos de trabajo basados en Python.
- Permite ajuste fino (fine-tuning) para adaptar el estilo o el dominio, aunque no se documentan ejemplos específicos en la información disponible.

## Casos de uso

- Creación de clips promocionales para redes sociales: un desarrollador puede generar vídeos cortos de 6 segundos para campañas en Instagram o TikTok, describiendo escenas con texto en inglés. Su bajo requisito de VRAM (desde 4 GB) permite ejecutarlo en estaciones de trabajo con GPU de gama media.
- Prototipado de animaciones para presentaciones: equipos de producto pueden generar storyboards animados a partir de guiones textuales, acelerando la validación de conceptos antes de invertir en producción profesional.
- Generación de material educativo: docentes o creadores de contenido pueden producir vídeos ilustrativos de fenómenos científicos o históricos describiendo la escena, sin necesidad de equipos de grabación.
- Investigación en generación de vídeo: el modelo sirve como línea base para estudios académicos sobre difusión espaciotemporal, gracias a su licencia abierta y su tamaño moderado que permite reproducir experimentos en hardware asequible.
- Desarrollo de aplicaciones de entretenimiento: integración en herramientas de creación de memes, tarjetas animadas o contenido generado por usuarios, donde la generación rápida y de bajo coste es prioritaria.
- Aumento de datasets sintéticos: se puede utilizar para generar vídeos de entrenamiento para otros modelos de visión por computador, por ejemplo, simulando escenas de tráfico o entornos domésticos, aunque la resolución y duración limitadas condicionan su uso en tareas de alta fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas como FVD (Fréchet Video Distance), CLIP score u otras evaluaciones estándar en generación de vídeo. Tampoco se han encontrado comparativas numéricas con otros modelos en los resultados de búsqueda web. Por tanto, no es posible ofrecer una tabla de rendimiento verificada.

## Requisitos de hardware

- VRAM estimada para inferencia: según la model card, con diffusers en FP16 se puede ejecutar desde 4 GB de VRAM, aunque esto probablemente se refiere a configuraciones con optimizaciones de memoria (por ejemplo, `enable_model_cpu_offload`). En modo SAT (SwissArmyTransformer) con FP16, el consumo es de 18 GB. Con INT8 (torchao) el consumo se reduce aún más, aunque no se especifica un valor exacto.
- GPU recomendadas: para un uso cómodo sin optimizaciones, se recomienda una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, o superior). Para generación más rápida y sin offload, una RTX 4090 o A100 (24-40 GB) permitiría ejecutar el modelo completo en memoria.
- Sí cabe en GPU de consumo: la opción de 4 GB permite ejecutarlo en tarjetas como la RTX 3050 o incluso en algunas integradas, aunque con tiempos de generación largos.
- Opciones de despliegue: es compatible con la librería diffusers de Hugging Face, que ofrece integración con pipelines de Python. También se puede utilizar con SAT (SwissArmyTransformer) para entornos que requieran más control. No se menciona soporte nativo para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se han publicado datos oficiales. En una GPU de gama alta (A100), se estima que la generación de un clip de 6 segundos puede tardar entre 1 y 3 minutos, dependiendo del número de pasos de difusión y de la resolución. En GPU de consumo (RTX 3060), el tiempo puede ser de 5 a 10 minutos.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución / duración | Licencia | Disponibilidad |
|---|---|---|---|---|
| CogVideoX-2B (este) | 1.69 B | 720×480, 6 s, 8 fps | Apache 2.0 | Hugging Face, ModelScope |
| CogVideoX-5B | 5 B (estimado) | Mayor calidad visual (no especificado) | Apache 2.0 | Hugging Face |
| ModelScope (T2V) | No disponible | No disponible | No disponible | No disponible |

La comparativa se limita a los modelos de la misma familia CogVideoX, ya que no se dispone de datos fiables sobre otros modelos de generación de vídeo de código abierto en el momento de redactar esta ficha. CogVideoX-5B ofrece mayor calidad y mejores efectos visuales, pero requiere más recursos de hardware. No se han encontrado datos de benchmarks que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Idioma limitado: el modelo está entrenado principalmente para prompts en inglés; el uso con otros idiomas puede producir resultados de menor calidad o incoherentes.
- Resolución y duración fijas: solo genera vídeos de 6 segundos a 720×480, lo que limita su uso en aplicaciones que requieran mayor resolución o clips más largos.
- Riesgo de alucinaciones visuales: como cualquier modelo generativo, puede producir artefactos, movimientos no naturales o inconsistencias entre el prompt y el vídeo resultante.
- Sesgos potenciales: al estar entrenado con datos de internet, puede reflejar sesgos culturales o de género en las escenas generadas, especialmente en descripciones de personas o entornos.
- Requisitos de hardware variables: el consumo de VRAM depende en gran medida del framework y de las optimizaciones activadas; sin ellas, puede necesitar hasta 18 GB, lo que excluye a muchas GPU de consumo.
- Licencia Apache 2.0: permite uso comercial y modificación, pero es recomendable revisar los términos completos, especialmente en lo relativo a atribución y patentes.
- Falta de documentación sobre entrenamiento: no se conocen los detalles del dataset ni las técnicas de alineación, lo que dificulta evaluar su robustez en dominios específicos.

## Enlaces

- Repositorio Hugging Face (este mirror): https://huggingface.co/GrigoriyLojkin/CogVideoX-2b
- Repositorio original en Hugging Face: https://huggingface.co/THUDM/CogVideoX-2b
- Repositorio GitHub oficial: https://github.com/THUDM/CogVideo
- Paper en arXiv: https://arxiv.org/pdf/2408.06072
- Modelo en ModelScope: https://www.modelscope.cn/models/AI-ModelScope/CogVideoX-2b
- Página del proyecto (demo y recursos): https://github.com/THUDM/CogVideo (incluye vídeos de demostración)
