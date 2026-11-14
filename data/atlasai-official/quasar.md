# AtlasAI-official/Quasar

## Resumen

Quasar es un prototipo de investigación multimodal desarrollado por Atlas AI Research (cuenta `AtlasAI-official` en Hugging Face). Se trata de un modelo autorregresivo de 90.247.794 parámetros construido sobre una columna vertebral híbrida denominada Axiom-1.1, que combina bloques recurrentes y bloques de atención causal. Su rasgo distintivo es que texto, códigos visuales, códigos de audio, mallas triangulares y propuestas de llamadas a herramientas comparten un único vocabulario y un único modelo; codecs congelados convierten entre cada modalidad y tokens discretos.

El modelo no es un producto listo para producción: la propia model card lo describe como un checkpoint de investigación público y ejecutable, con calidad limitada. Una rama de investigación enfocada produce imágenes reconocibles y cuadrados en movimiento simple reproduciendo ejemplos memorizados del entrenamiento, pero la generación de imágenes no vistas y la continuación de movimiento desconocido siguen sin funcionar. El checkpoint se retiró de producción porque la mayoría de las pérdidas en tareas previas empeoraron.

Es relevante ahora como banco de pruebas reproducible para estudiar interoperabilidad de codecs y paquetes de tokens, condicionamiento visual controlado, y fenómenos de recuerdo, generalización y olvido catastrófico en modelos pequeños. No es un fine-tune de Emu3: Emu3 se emplea únicamente como codec de píxeles congelado, no como columna vertebral generativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida recurrencia/atención (Axiom-1.1): 12 bloques, anchura 640; 9 bloques recurrentes y 3 de atención causal |
| Parametros totales | 90.247.794 (excluyendo codecs de medios congelados) |
| Parametros activos | no disponible (no es MoE; dos expertos densos 640 → 1280 → 640 por bloque, ambos evaluados) |
| Longitud de contexto | 1.024 tokens compartidos |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (PyTorch, código propio de Quasar; no es un `AutoModel` de Transformers) |

## Arquitectura y entrenamiento

La columna vertebral Axiom-1.1 consta de 12 bloques de anchura 640, de los cuales 9 son recurrentes y 3 son de atención causal completa (bloques con índice cero 3, 7 y 11). La atención usa 10 cabezas. Cada bloque contiene dos celdas feed-forward densas de 640 → 1280 → 640, y ambas se evalúan (configuración "two-of-two"), por lo que el término auxiliar estilo Switch es constante y no demuestra regularización efectiva de enrutamiento. Emplea RMSNorm, RoPE y embeddings espaciales visuales aprendidos. El vocabulario compartido tiene 54.144 identificadores: 16.384 para texto (BPE), 32.768 para códigos visuales, más interfaces para audio y malla. Las imágenes son nativas de 64×64 o 128×128 (64 o 256 tokens visuales); el vídeo llega a 8 fotogramas a 64×64 con 64 tokens por fotograma y codec por fotograma; el audio usa cuatro codebooks DAC de 1.024 entradas para locuciones completas de hasta 2 segundos; la malla admite coordenadas cuantizadas y caras triangulares indexadas de hasta 128 vértices/caras.

El modelo original de etapa de texto tenía 69.808.754 parámetros; la expansión de vocabulario y la migración posterior a embeddings espaciales de 128 px preservaron los pesos aprendidos y lo llevaron al tamaño actual. El corpus admitido combina FineWeb-Edu fijado, componentes seleccionados de SmolTalk (instrucción, restricción, reescritura y resumen), TinyStories, Dolly, ejemplos integrados, MBPP oficial `full/train` (374 problemas, con validación y test reservados) y fotografías reales de Open Images / Localized Narratives con control de identidad de creador, licencia elegible, atribución y hashes JPEG. No se especifican en la información disponible el número total de tokens de entrenamiento ni si hubo RLHF o DPO. La model card advierte que el vídeo se entrena con movimiento controlado proceduralmente, no con metraje natural.

## Capacidades

- Generación de texto autorregresiva en inglés con contexto de 1.024 tokens compartidos entre modalidades.
- Generación de imágenes nativas de 64×64 o 128×128 mediante tokens visuales discretos (64 o 256 tokens por imagen).
- Generación de vídeo corto de hasta 8 fotogramas a 64×64, con 64 tokens visuales por fotograma.
- Interfaz de audio basada en cuatro codebooks DAC de 1.024 entradas para locuciones breves (hasta 2 segundos); la inteligibilidad del habla generado no está validada.
- Interfaz de malla 3D con coordenadas cuantizadas y caras triangulares indexadas de hasta 128 vértices/caras.
- Propuestas de llamadas a herramientas (tool calling) validadas por esquema; el modelo no ejecuta las herramientas.
- Capacidad de razonamiento multi-paso y agentes: no validada según la model card.
- Capacidades multilingües: solo inglés, con sesgo de selección de fuentes hacia ese idioma.
- Modo "thinking": no disponible.

## Casos de uso

- Investigación sobre interoperabilidad de codecs y paquetes de tokens: el modelo permite estudiar cómo un mismo vocabulario compartido transporta texto, códigos visuales, audio y malla, y comparar la fidelidad de reconstrucción entre codecs congelados.
- Estudio de olvido catastrófico y recuerdo: al conservar los pesos v5 en `variants/v5` junto al checkpoint `joint_repair/final`, se pueden comparar curvas de pérdida en tareas previas y medir el deterioro introducido por el currículo de reparación conjunta.
- Experimentos controlados de condicionamiento visual: con imágenes de 64×64 o 128×128 y 64 o 256 tokens visuales, sirve para probar cómo el condicionamiento por tokens afecta la generación en un modelo pequeño y reproducible.
- Pruebas de validez estructural en tool calling: el modelo emite propuestas de llamadas validadas por esquema, útil para estudiar si la validez sintáctica correlaciona con corrección semántica de argumentos, sin ejecutar acciones reales.
- Docencia y divulgación de arquitecturas híbridas: los 12 bloques (9 recurrentes, 3 de atención) con código PyTorch propio y tokenizadores incluidos permiten trazar el flujo completo de tokens a salida en un entorno de 2,1 GB.
- Reproducción de ejemplos memorizados: la rama de investigación enfocada reproduce imágenes y cuadrados en movimiento del entrenamiento, lo que permite estudiar memorización frente a generalización en corpus pequeños.
- Evaluación de generación de mallas simples: con hasta 128 vértices y caras, se pueden probar protocolos de cuantización de geometría, aunque la model card descarta activos 3D complejos útiles.

## Benchmarks y rendimiento

El `model-index` de la model card declara el modelo "Quasar" con una lista de resultados vacía. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 90,2 millones de parámetros en safetensors (2,1 GB de repositorio, que incluye codecs y tokenizadores), los pesos en precisión completa ocupan del orden de 0,36 GB; en fp16, aproximadamente 0,18 GB. El consumo real depende de los codecs visuales y de audio congelados, cuyo tamaño no se detalla en la información disponible.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente por tamaño de pesos; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU consumer: sí, por el reducido número de parámetros; no se detallan modelos concretos.
- Opciones de despliegue: código PyTorch propio de Quasar incluido en el repositorio; no es un `AutoModel` de Transformers. No se mencionan vLLM, llama.cpp, Ollama ni TGI. Existe una demo alojada en el Space `AtlasAI-official/Atlas-AI-Models`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Quasar | 90.247.794 | 1.024 tokens | Texto, imagen, vídeo, audio, malla y tool calls en un vocabulario compartido | no disponible | Pesos safetensors públicos en Hugging Face |
| Emu3 | no disponible en la información proporcionada | no disponible | Generación multimodal basada en tokens | no disponible | Usado aquí solo como codec de píxeles congelado |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento entre Quasar y modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No validado para respuestas factuales fiables, asistencia de código, síntesis de escenas naturales, vídeo natural, habla generada inteligible, activos 3D complejos útiles ni selección fiable de herramientas.
- Las salidas de herramientas son propuestas validadas por esquema; el modelo no ejecuta herramientas y la validez estructural no garantiza argumentos correctos ni acciones seguras.
- El muestreador de inferencia fuerza límites de paquete y rangos legales de tokens; esas restricciones no son evidencia de competencia semántica aprendida.
- La generación de imágenes no vistas y la continuación de movimiento desconocido siguen sin funcionar; los resultados reconocibles provienen de ejemplos memorizados.
- El entrenamiento de vídeo usa movimiento controlado proceduralmente, no metraje natural.
- Las salidas de fotos reales pueden reproducir fotografías del entrenamiento; la atribución de creadores y las licencias de los activos originales siguen siendo relevantes.
- Sesgo por selección de fuentes en inglés, corpus de medios pequeños y datos sintéticos de herramientas; no se realizó una auditoría exhaustiva de seguridad, equidad o privacidad.
- Licencia no disponible: no hay confirmación de permisos para uso comercial.
- El checkpoint se retiró de producción porque la mayoría de las pérdidas en tareas previas empeoraron.
- No se incluyen estados del optimizador ni servicio de inferencia en el repositorio.
- El término auxiliar estilo Switch es constante en esta configuración de dos celdas densas y no demuestra regularización de enrutamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AtlasAI-official/Quasar
- Demo alojada (Space): https://huggingface.co/spaces/AtlasAI-official/Atlas-AI-Models
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset MBPP: https://huggingface.co/datasets/google-research-datasets/mbpp
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Dataset Dolly 15k: https://huggingface.co/datasets/databricks/databricks-dolly-15k
- Dataset ToolACE: https://huggingface.co/datasets/Team-ACE/ToolACE
