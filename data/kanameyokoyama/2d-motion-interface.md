# KanameYOkoYAMA/2d-motion-interface

## Resumen

El modelo **2d-motion-interface** es un bundle de inferencia para el sistema MotionGPT, desarrollado por KanameYOkoYAMA (YOKOYAMA KANAME) y presentado en el taller HCMIW de ECCV 2026. Su propósito es generar descripciones textuales (captions) de movimiento humano a partir de keypoints 2D obtenidos de video monocular, eliminando la necesidad de estimación de pose 3D, que suele ser costosa y frágil en entornos reales. Esto lo convierte en una solución práctica para aplicaciones donde solo se dispone de video RGB convencional.

La arquitectura combina un modelo de lenguaje preentrenado **flan-t5-base** (congelado) con un encoder 2D de 9,6 millones de parámetros y un adaptador residual `A_real` de 0,3 millones, ambos entrenados específicamente para esta tarea. El bundle completo pesa 1,03 GB en fp32 e incluye los pesos del VQ-VAE (solo el encoder) y los archivos de configuración. Una captura tarda aproximadamente 1 segundo en CPU, lo que lo hace adecuado para procesamiento en tiempo real o por lotes.

La relevancia actual de este modelo radica en que democratiza el captioning de movimiento: cualquier video con detección de keypoints 2D (por ejemplo, con ViTPose) puede ser anotado automáticamente sin necesidad de equipos de captura de movimiento 3D ni pipelines complejos de estimación de pose. Además, al ser de código abierto con licencia MIT, puede integrarse fácilmente en proyectos de investigación y desarrollo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | flan-t5-base (LM) + VQ-VAE (encoder 2D) + adaptador residual `A_real` |
| Parametros totales | no disponible (el bundle pesa 1,03 GB en fp32; el LM flan-t5-base tiene ~250M, el encoder 2D 9,6M y el adaptador 0,3M, pero no se proporciona el total exacto) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (flan-t5-base tiene 512 tokens, pero no se especifica en la documentación) |
| Tipos de cuantizacion | fp32 (único formato mencionado; se descarta fp16 por inestabilidad conocida de flan-t5) |
| Idiomas soportados | no disponible (flan-t5-base es multilingüe, pero no se indica en la model card) |
| Licencia | MIT |
| Formato de pesos | safetensors (`lm.safetensors`, `vqvae.safetensors`, `adapter.safetensors`) |

## Arquitectura y entrenamiento

El sistema se compone de tres módulos principales: un modelo de lenguaje **flan-t5-base** ampliado con 515 tokens de movimiento en su vocabulario, un **VQ-VAE** cuyo encoder procesa características 2D y un **adaptador residual** `A_real` de 512 dimensiones ocultas. El pipeline completo es: keypoints COCO-17 con confianza → se reducen a COCO-13 (eliminando ojos y orejas) → se construyen características de 81 dimensiones (incluyendo confianza) → el adaptador `A_real` las transforma → se rellenan con ceros hasta 263 dimensiones → el VQ-VAE las codifica → MotionGPT genera el caption.

El entrenamiento se limita al encoder 2D (9,6M de parámetros) y al adaptador (0,3M), mientras que el LM preentrenado permanece congelado. No se proporcionan detalles sobre el dataset de entrenamiento ni sobre el uso de técnicas como RLHF o DPO. Las estadísticas de normalización (`stats.npz`) provienen de HumanML3D, y los pesos del LM y el cuantizador derivan del checkpoint preentrenado de MotionGPT. Los features están centrados en el mid-hip y normalizados por escala, lo que permite trabajar con cualquier resolución de entrada a 20 fps.

## Capacidades

- Generación de captions descriptivos de movimiento humano a partir de keypoints 2D (COCO-17) sin necesidad de pose 3D.
- Procesamiento de video monocular real, gracias al adaptador `A_real` que compensa la diferencia entre datos sintéticos y reales.
- Decodificación greedy determinista, lo que garantiza captions reproducibles entre ejecuciones.
- Soporte para entrada a 20 fps, con normalización de escala y centrado automático.
- Compatible con CPU (una caption tarda ~1 s) y con GPU (aunque no se especifican requisitos).
- No incluye capacidades de tool calling, agentes ni razonamiento multi-paso; es un modelo especializado en captioning de movimiento.

## Casos de uso

- **Anotación automática de datasets de movimiento**: dado un video con keypoints 2D extraídos (por ejemplo, con ViTPose), el modelo genera descripciones textuales que pueden usarse para etiquetar grandes volúmenes de datos sin intervención manual, acelerando la creación de datasets para entrenamiento de otros modelos.
- **Análisis de movimiento en deportes y rehabilitación**: entrenadores o fisioterapeutas pueden grabar ejercicios con una cámara convencional y obtener descripciones automáticas de los movimientos, facilitando la evaluación de la técnica o el progreso del paciente.
- **Indexación y búsqueda de contenido de video**: plataformas de video pueden generar captions de movimiento para mejorar la búsqueda semántica, por ejemplo, "persona saltando" o "persona levantando un objeto", sin necesidad de metadatos manuales.
- **Asistencia para personas con discapacidad visual**: el modelo puede describir acciones humanas en video en tiempo real, ayudando a comprender el contexto de una escena en aplicaciones de accesibilidad.
- **Investigación en interacción humano-máquina**: en robótica o interfaces gestuales, el modelo permite interpretar gestos y movimientos del usuario a partir de video 2D, sirviendo como entrada para sistemas de control o diálogo.
- **Generación de descripciones para subtitulado en directo**: en retransmisiones deportivas o eventos, se pueden generar subtítulos descriptivos de las acciones de los participantes, mejorando la experiencia de audiencias con discapacidad auditiva.
- **Automatización de vigilancia y seguridad**: el modelo puede describir comportamientos anómalos (correr, caerse, pelear) a partir de video de cámaras de seguridad, generando alertas textuales para operadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o GSM8K) en la información disponible, ya que se trata de un modelo especializado en captioning de movimiento. La model card solo reporta una verificación de reproducibilidad: en los cuatro clips de demostración se obtuvieron 8/8 captions exactos (tanto con adaptador como sin él), y en 132 clips reales la coincidencia fue de 256/264, atribuyéndose las 8 diferencias a ruido de punto flotante entre GPU y CPU que altera un argmax greedy, no a diferencias en los pesos.

## Requisitos de hardware

- **VRAM estimada**: no disponible en la documentación. Dado que el bundle pesa 1,03 GB en fp32, se puede inferir que cabría en GPUs con al menos 2 GB de VRAM, pero no se confirma.
- **GPU recomendadas**: no se especifican modelos concretos. El modelo funciona en CPU (una caption tarda ~1 s), por lo que cualquier GPU moderna sería suficiente.
- **Compatibilidad con GPU de consumo**: sí, cualquier GPU con suficiente VRAM para fp32 (por ejemplo, RTX 3060 o superior) debería ser capaz de ejecutarlo, aunque no se proporcionan datos de latencia en GPU.
- **Opciones de despliegue**: se proporciona un script de ejemplo (`captioner.py`) que usa PyTorch y transformers. No se mencionan integraciones con vLLM, Ollama o TGI. El demo Space de Hugging Face es la referencia de uso.
- **Latencia y throughput**: una caption tarda ~1 s en CPU con decodificación greedy. No se dan cifras para GPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada. El modelo es una adaptación de **MotionGPT** (que requiere datos 3D) para trabajar con keypoints 2D, por lo que la comparación natural sería con MotionGPT original, pero no se ofrecen métricas numéricas. Otras alternativas en el campo del captioning de movimiento (como TM2T o MotionCLIP) no se mencionan en la documentación, por lo que no se puede establecer una comparativa cuantitativa. Se recomienda consultar el paper (arXiv:2608.15984) para más detalles sobre la evaluación.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al basarse en flan-t5-base, el modelo puede heredar sesgos del preentrenamiento y generar descripciones inexactas si los keypoints de entrada son ruidosos o incompletos.
- **Dependencia de la calidad de los keypoints**: el rendimiento depende directamente de la precisión del detector de keypoints 2D; errores en la detección se propagan al caption.
- **Restricciones de licencia**: aunque el bundle es MIT, las dependencias upstream (MotionGPT, HumanML3D, flan-t5-base) tienen sus propias licencias (MIT, MIT, Apache-2.0 respectivamente). Además, MotionGPT depende de SMPL, SMPL-X y PyTorch3D, cuyas licencias deben revisarse para uso comercial.
- **Proveniencia de datos**: no se incluyen datos de AMASS ni HumanML3D (por restricciones de distribución), solo pesos y estadísticas agregadas. No es posible recuperar secuencias de movimiento a partir de este bundle.
- **Estabilidad numérica**: flan-t5-base es inestable en fp16, por lo que se recomienda usar fp32. Cambios en la versión de transformers pueden alterar la decodificación greedy; se recomienda verificar la paridad tras actualizaciones.
- **Alcance limitado**: el bundle está diseñado para el demo Space, no como un checkpoint de propósito general. No soporta tareas fuera del captioning de movimiento 2D.

## Enlaces

- [Hugging Face - modelo](https://huggingface.co/KanameYOkoYAMA/2d-motion-interface)
- [Paper (arXiv:2608.15984)](https://arxiv.org/abs/2608.15984)
- [Código fuente (GitHub)](https://github.com/irajisamurai/2D-Motion-Interface)
- [Demo Space en Hugging Face](https://huggingface.co/spaces/KanameYOkoYAMA/2d-motion-interface)
- [HCMIW @ ECCV 2026](https://hcmiw.github.io/hcmiw-eccv2026/)
