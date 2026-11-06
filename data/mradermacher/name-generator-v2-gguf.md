# mradermacher/name-generator-v2-GGUF

## Resumen

Esta ficha corresponde a la cuantización GGUF del modelo **name-generator-v2**, un modelo de lenguaje de aproximadamente 3.400 millones de parámetros desarrollado por el usuario *aimeri* y cuantizado por *mradermacher*, un colaborador conocido en Hugging Face por generar versiones GGUF estáticas de modelos populares. El modelo está especializado en la generación de nombres propios de personajes, incluyendo nombres de fantasía, para tareas de escritura creativa, y se entrenó sobre el dataset `aimeri/name-generator`.

El modelo base se construyó sobre la arquitectura **Ministral 3** (según los metadatos de la model card) y utiliza la plantilla de conversación **ChatML**, lo que lo hace compatible con la mayoría de runtimes de inferencia modernos que soportan GGUF. Se distribuye bajo licencia **Apache 2.0**, lo que permite su uso comercial sin restricciones relevantes.

La relevancia de esta cuantización radica en que permite ejecutar un modelo altamente especializado y ligero (desde 1,6 GB en Q2_K hasta 7 GB en f16) en hardware de consumo, incluso en portátiles sin GPU dedicada, para asistir en la creación de nombres de personajes en novelas, videojuegos, rol de mesa o herramientas de generación procedural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Ministral 3, según metadatos) |
| Parametros totales | 3.429.006.336 (≈3,43 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base original está en safetensors) |

## Arquitectura y entrenamiento

El modelo base `aimeri/name-generator-v2` es un transformer denso de unos 3,43 mil millones de parámetros, construido a partir de la familia **Ministral 3** y ajustado (fine-tuned) con el dataset `aimeri/name-generator`, especializado en nombres de personajes y nombres de fantasía. La cuantización de mradermacher se realizó con **unsloth** y formato de conversación **ChatML**, empleando conversión estática por pesos (k-quants e i-quants), sin versiones imatrix/weighted disponibles en el momento de redactar esta ficha.

No hay información publicada sobre el número de tokens de entrenamiento, la composición detallada del dataset, ni sobre el uso de técnicas como RLHF o DPO: no disponible. Tampoco se documentan innovaciones técnicas específicas más allá del ajuste fino de especialización.

## Capacidades

- Generación de nombres propios de personajes, con especialización en nombres de fantasía.
- Generación de texto conversacional en inglés mediante plantilla ChatML.
- Etiquetado como `conversational`, por lo que puede usarse en flujos de chat multi-turno, aunque su especialización es la generación de nombres.
- No hay información disponible sobre soporte de tool calling, capacidades de agentes, razonamiento matemático, código, visión o audio.

## Casos de uso

- **Escritura de novela o relato:** un autor puede solicitar nombres coherentes con una ambientación de fantasía para personajes secundarios sin interrumpir el flujo de escritura, gracias a la especialización del fine-tuning.
- **Diseño de videojuegos:** generación procedural de nombres para NPC (personajes no jugables) en grandes cantidades, integrable en el pipeline de contenido del juego mediante llamadas locales al modelo.
- **Rol de mesa y campañas de RPG:** generación rápida de nombres para personajes, villanos o lugares durante sesiones de juego, ejecutable en un portátil con Ollama o llama.cpp.
- **Herramientas de escritura asistida:** integración en editores o plugins (por ejemplo, extensiones de Obsidian o Scrivener) que sugieran nombres al escritor en tiempo real.
- **Generación de contenido para TTRPG y worldbuilding:** creación de listas de nombres coherentes para facciones, dinastías o linajes en documentos de construcción de mundos.
- **Prototipado de aplicaciones creativas:** al ser un modelo pequeño (2,2 GB en Q4_K_M) y de licencia permisiva, es adecuado para demos y apps locales de generación de nombres sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser un modelo de especialización estrecha (generación de nombres), los benchmarks generalistas tipo MMLU o GSM8K probablemente no sean representativos de su calidad de uso.

## Requisitos de hardware

- **VRAM / memoria estimada:** el modelo cabe cómodamente en hardware muy modesto. En Q4_K_M ocupa unos 2,2 GB; en Q8_0, 3,8 GB; en f16, 7 GB. Puede ejecutarse íntegramente en CPU con RAM convencional.
- **GPU recomendadas:** no requiere GPU dedicada. En caso de usar una, cualquier GPU con 4 GB de VRAM o más (por ejemplo, una RTX 3060 o superior) ejecuta las cuantizaciones medias con holgura.
- **Consumer GPUs:** cabe sin problemas en la práctica totalidad de GPUs de consumo actuales, incluso en las de gama de entrada.
- **Despliegue:** al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier runtime que soporte el formato. También puede cargarse con la librería transformers de Hugging Face en su versión original safetensors.
- **Latencia y throughput:** no disponible; dada la talla del modelo (≈3,4 B de parámetros), cabe esperar respuestas rápidas incluso en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Especializacion | Licencia | Formato |
|---|---|---|---|---|
| name-generator-v2 (esta ficha) | ≈3,43 B | Generacion de nombres de personajes | Apache 2.0 | GGUF, safetensors |
| Modelos generalistas de ~3 B (p. ej. Llama 3.2 3B) | ≈3 B | Uso general, no especializado en nombres | Llama Community License | GGUF, safetensors |
| aimeri/name-generator-v2 (modelo base) | ≈3,43 B | Identica (es el original sin cuantizar) | Apache 2.0 | safetensors |

No existen muchos modelos open source publicamente comparables dedicados exclusivamente a la generacion de nombres; la alternativa habitual es usar un modelo generalista pequeno con prompting, a costa de mayor consumo de contexto y menor consistencia.

## Limitaciones y advertencias

- **Idioma:** el modelo está etiquetado solo para inglés; no hay garantía de calidad generando nombres o texto en español u otros idiomas.
- **Especialización estrecha:** al ser un fine-tuning específico para nombres, probablemente degrade notablemente en tareas generalistas (razonamiento, código, matemáticas) respecto a su modelo base.
- **Alucinación:** no hay evaluaciones publicadas; como en todo LLM, los nombres generados pueden resultar incoherentes o repetitivos, y no hay datos sobre diversidad de salida.
- **Cuantizaciones bajas:** las versiones Q2_K y Q3_K pueden degradar sensiblemente la calidad de generación; el propio mradermacher recomienda Q4_K_S/Q4_K_M como punto de equilibrio.
- **Licencia:** Apache 2.0 permite uso comercial sin restricciones destacables, aunque conviene verificar también la licencia del modelo base Ministral subyacente.
- **Sin imatrix:** no hay disponibles cuantizaciones weighted/imatrix, lo que podría ofrecer mejor calidad a igual tamaño.
- **Contexto:** la longitud de ventana de contexto no está documentada, lo que dificulta planificar usos con prompts largos.

## Enlaces

- Repositorio de la cuantización GGUF: https://huggingface.co/mradermacher/name-generator-v2-GGUF
- Modelo base original: https://huggingface.co/aimeri/name-generator-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/aimeri/name-generator
- Página de descargas de mradermacher: https://hf.tst.eu/model#name-generator-v2-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa de mradermacher (nethype GmbH): https://www.nethype.de/
