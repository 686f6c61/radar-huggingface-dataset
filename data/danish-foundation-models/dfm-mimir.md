# danish-foundation-models/DFM-Mimir

## Resumen

DFM-Mimir es un modelo fundacional de lenguaje desarrollado por el equipo danish-foundation-models, especializado en procesamiento y generación de texto en danés e inglés. Con 1.786 millones de parámetros, se presenta como un modelo compacto afinado mediante instruction-tuning y orientado a conversación, según las etiquetas del repositorio. Su relevancia radica en cubrir un idioma escandinavo con escasa representación en el ecosistema de modelos fundacionales, aunque su acceso está restringido y su licencia limita el uso a fines de investigación.

El modelo referencia un artículo académico (arXiv:2608.13517) que documenta su desarrollo, aunque el contenido no está disponible en la información facilitada. El tamaño del repositorio (7,2 GB) es consistente con pesos almacenados en precisión FP32. Su arquitectura interna, longitud de contexto y detalles del entrenamiento no se han publicado en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1.786.775.040 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | danés (da), inglés (en) |
| Licencia | mimir-license-v1.0-research-model-license |
| Formato de pesos | safetensors (FP32, ~7,2 GB) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo más allá de su compatibilidad con la librería transformers. El peso del repositorio (7,2 GB) y el número de parámetros (1.786.775.040) sugieren que los pesos están almacenados en FP32, lo que implica que en FP16 ocuparían aproximadamente 3,6 GB. El modelo está afinado mediante instruction-tuning y orientado a conversación, como indican las etiquetas "instruction-tuned" y "conversational". No se dispone de información sobre la composición del dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. El artículo arXiv:2608.13517, referenciado en las etiquetas, presumiblemente documenta estos detalles, pero su contenido no ha sido verificado.

## Capacidades

- Generación de texto en danés e inglés.
- Conversación multi-turno y seguimiento de instrucciones (instruction-tuned).
- Modelo fundacional para tareas de procesamiento de lenguaje natural en danés.
- Compatible con la librería transformers y con endpoints de HuggingFace (endpoints_compatible).
- No se dispone de información sobre tool calling, razonamiento avanzado, visión, audio ni modo de pensamiento.

## Casos de uso

- Investigación en lingüística computacional del danés: el modelo puede emplearse en estudios académicos sobre morfología, sintaxis y semántica del danés, aprovechando su entrenamiento específico en este idioma.
- Prototipos de generación de texto en danés: su tamaño compacto permite experimentar con redacción automática de contenido en danés en entornos de investigación.
- Sistemas conversacionales en danés para investigación: su orientación conversacional lo hace adecuado para prototipos de chatbots en danés, sujeto a las restricciones de la licencia.
- Fine-tuning para tareas específicas en danés: como modelo fundacional, permite adaptación mediante fine-tuning para tareas como análisis de sentimiento, clasificación de texto o extracción de entidades en danés.
- Evaluación comparativa de modelos escandinavos: puede utilizarse como referencia en estudios que comparen modelos para lenguas nórdicas, dado el limitado ecosistema existente.
- Docencia en procesamiento de lenguaje natural: su tamaño reducido facilita su uso en entornos educativos para demostrar técnicas de instruction-tuning y generación de texto con recursos hardware limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP32 ocupan ~7,2 GB; en FP16 se reducirían a ~3,6 GB y en INT8 a ~1,8 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, etc.) para FP16; 4 GB serían suficientes con cuantización INT8.
- Cabe en GPUs de consumo: sí, con cuantización cabe incluso en GPUs de gama baja (6 GB o menos).
- Opciones de despliegue: compatible con la librería transformers; vLLM y TGI son opciones plausibles aunque no confirmadas. No se indica disponibilidad de GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de la misma categoría (modelos fundacionales daneses o escandinavos de tamaño similar). La información proporcionada no incluye referencias a modelos comparables ni datos de rendimiento.

## Limitaciones y advertencias

- Licencia de investigación exclusivamente: la licencia mimir-license-v1.0-research-model-license restringe el uso a fines de investigación, lo que impide su despliegue en producción comercial sin autorización expresa.
- Acceso restringido: el modelo requiere aceptar condiciones en HuggingFace antes de su descarga, lo que añade fricción al proceso de evaluación.
- Idiomas limitados: solo danés e inglés; no soporta otros idiomas escandinavos (noruego, sueco) ni castellano.
- Tamaño reducido: con 1.786 millones de parámetros, es probable que presente limitaciones en razonamiento complejo, matemáticas avanzadas y generación de código en comparación con modelos de mayor escala.
- Riesgo de alucinación: al ser un modelo pequeño, el riesgo de generar contenido factualmente incorrecto es mayor que en modelos grandes.
- Información incompleta: no se han publicado detalles sobre arquitectura, contexto máximo, dataset de entrenamiento ni benchmarks, lo que dificulta una evaluación rigurosa del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/danish-foundation-models/DFM-Mimir
- Artículo académico referenciado en las etiquetas: arXiv:2608.13517 (contenido no verificado)
