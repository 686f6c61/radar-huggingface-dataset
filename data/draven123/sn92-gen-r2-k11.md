# draven123/sn92-gen-r2-k11

## Resumen

`draven123/sn92-gen-r2-k11` es un modelo multimodal de tipo image-text-to-text publicado en Hugging Face por el usuario `draven123`. Los metadatos lo etiquetan con la arquitectura `gemma4` y lo vinculan al ecosistema de Bittensor (subnet 92, `bittensor-sn92`) y a un componente denominado `reax`, lo que sugiere que se trata de un checkpoint entrenado o ajustado en el contexto de una competición descentralizada de modelos de IA. El repositorio tiene acceso restringido (gated) y no registra descargas ni interacciones en el momento de la consulta.

El dato técnico más fiable disponible es el recuento de parámetros extraído de los pesos en formato safetensors: 31.273.088.876 parámetros (aproximadamente 31,3 mil millones), con un tamaño de repositorio de 62,6 GB. Esa cifra es coherente con un modelo denso de la familia Gemma en precisión bf16/fp16, aunque no se dispone de confirmación oficial sobre la variante exacta, el número de tokens de entrenamiento ni la longitud de contexto.

La relevancia de esta ficha es limitada pero concreta: documenta un artefacto de un ecosistema emergente (subredes de Bittensor orientadas a generación de imágenes y texto) y permite a desarrolladores e investigadores evaluar rápidamente si merece la pena solicitar acceso. La información pública es escasa y muchos campos quedan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (según tag `gemma4`); transformer multimodal image-text-to-text |
| Parametros totales | 31.273.088.876 (según safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo con pesos safetensors; sin GGUF publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

Los tags indican `gemma4`, `image-text-to-text` y `reax`. Esto apunta a una arquitectura transformer multimodal derivada de la familia Gemma, con un codificador visual y un decodificador de lenguaje, orientada a tareas de conversación sobre imágenes y texto. El tag `reax` no corresponde a ningún componente ampliamente documentado en la información disponible, por lo que no se puede confirmar si se refiere a un módulo de atención, a un esquema de recompensas o a un framework interno del proyecto.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO, ni sobre innovaciones técnicas concretas (decodificación especulativa, atención lineal, mezcla de expertos). El vínculo con `bittensor-sn92` sugiere un proceso de entrenamiento o selección competitiva dentro de esa subred, pero los detalles no están publicados en la información proporcionada. El tamaño del repositorio (62,6 GB) es consistente con pesos en bf16 de un modelo de ~31B parámetros más posibles componentes adicionales.

## Capacidades

- Generación de texto conversacional en formato multi-turno (tag `conversational`).
- Procesamiento conjunto de imagen y texto (pipeline `image-text-to-text`), es decir, respuesta a preguntas sobre imágenes y descripción de contenido visual.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que facilita su despliegue mediante la infraestructura de inference endpoints de Hugging Face.
- Integración con la librería `transformers`.
- Capacidades de tool calling, agentes, razonamiento multi-paso, thinking mode, audio o matemáticas avanzadas: no disponible en la información proporcionada.

## Casos de uso

- Descripción automática de imágenes en catálogos de producto: el modelo puede recibir una imagen y generar descripciones textuales estructuradas, aprovechando su naturaleza image-text-to-text para enriquecer fichas de e-commerce.
- Asistencia visual para accesibilidad: generación de descripciones alternativas de imágenes para lectores de pantalla en aplicaciones web o móviles.
- Moderación de contenido visual con contexto textual: análisis de imágenes acompañadas de texto para detectar contenido inapropiado en plataformas sociales.
- Extracción de información de documentos escaneados: preguntas y respuestas sobre facturas, formularios o capturas, combinando OCR implícito con razonamiento textual.
- Investigación en subredes de Bittensor: uso del checkpoint como referencia o punto de partida para experimentos dentro del ecosistema SN92, comparando su comportamiento con otros modelos de la subred.
- Prototipado de asistentes multimodales: despliegue en endpoints compatibles para validar flujos conversacionales con entrada de imagen antes de invertir en modelos propietarios.
- Evaluación comparativa de modelos Gemma ajustados: servir como baseline en estudios académicos sobre ajuste fino multimodal, dado que los pesos son accesibles bajo Apache 2.0 tras aceptar las condiciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 62-65 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 80 GB para un funcionamiento cómodo.
- VRAM estimada en cuantización de 8 bits: en torno a 32-35 GB, viable en una A100 40 GB o en dos RTX 4090.
- VRAM estimada en cuantización de 4 bits: en torno a 18-20 GB, potencialmente viable en una RTX 4090 (24 GB) o RTX 3090, aunque no se han publicado pesos GGUF oficiales.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200; para cuantización agresiva, RTX 4090 o RTX 6000 Ada.
- Despliegue: `transformers` de forma nativa; vLLM, TGI, llama.cpp u Ollama no están confirmados para esta variante multimodal concreta.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `draven123/sn92-gen-r2-k11` | ~31,3B | no disponible | Apache 2.0 | Gated en HF | Checkpoint multimodal vinculado a Bittensor SN92 |
| Gemma 3 27B (Google) | ~27B | no disponible en esta ficha | Gemma license | Abierto en HF | Referencia de la familia; multimodal |
| Qwen2.5-VL 32B | ~32B | no disponible en esta ficha | Apache 2.0 | Abierto en HF | Alternativa multimodal de tamaño comparable |
| Llama 3.2 11B Vision | ~11B | no disponible en esta ficha | Llama license | Gated en HF | Menor tamaño, menor coste de inferencia |

La comparación con Gemma 3 27B y Qwen2.5-VL 32B es orientativa por tamaño y modalidad; no se dispone de datos de rendimiento del modelo de `draven123` para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Repositorio con acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos, lo que puede retrasar la evaluación.
- Ausencia total de documentación técnica: no hay model card detallada, lo que impide verificar el proceso de entrenamiento, los datos utilizados y las evaluaciones.
- Riesgo elevado de alucinación y de comportamiento impredecible al desconocerse el ajuste final y los datos de alineación.
- Idiomas soportados no confirmados; no se debe asumir un rendimiento multilingüe homogéneo.
- Longitud de contexto desconocida: no planificar aplicaciones con ventanas largas sin validación empírica.
- Origen en una competición de subred (Bittensor SN92): los checkpoints de este tipo pueden estar optimizados para métricas específicas de la competición y no para uso general en producción.
- Aunque la licencia declarada es Apache 2.0, conviene verificar que los pesos derivados de Gemma no arrastren restricciones adicionales de la licencia original de Google.
- Sin descargas ni likes registrados: no hay evidencia comunitaria de que los pesos funcionen correctamente ni de su calidad real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/draven123/sn92-gen-r2-k11
- Bittensor (red descentralizada de IA): https://bittensor.com
- Documentación de subredes de Bittensor: https://docs.bittensor.com
- Librería transformers: https://github.com/huggingface/transformers
- Familia Gemma de Google: https://ai.google.dev/gemma
