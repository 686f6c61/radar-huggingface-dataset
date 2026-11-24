# mradermacher/LFM3-1.7B-Gemma-4-12B-GGUF

## Resumen

LFM3-1.7B-Gemma-4-12B-GGUF es una distribucion de cuantizaciones GGUF del modelo s3t4/LFM3-1.7B-Gemma-4-12B-Distill-Indonesian, un modelo de lenguaje de 1.728.801.600 parametros obtenido mediante destilacion de conocimiento (knowledge distillation) a partir de un modelo Gemma-4 de 12B hacia la arquitectura LFM3 de Liquid AI. El resultado es un modelo compacto de 1,7B parametros especializado en indonesio, entrenado con SFT y LoRA sobre datasets como IndoMMLU, XCOPA, aya_dataset y aksara-sft-clean-v1.

El trabajo de cuantizacion lo firma mradermacher, que publica 12 variantes GGUF estaticas (desde Q2_K de 0,9 GB hasta f16 de 3,6 GB) para facilitar el despliegue en CPU, GPU consumer y entornos con VRAM limitada. El modelo base pertenece a la familia LFM3 de Liquid AI y conserva su licencia lfm1.0, con restricciones de uso comercial que deben revisarse antes de cualquier despliegue en produccion.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: una arquitectura LFM3 (no transformer clasico), un proceso de destilacion desde un modelo mucho mayor y un enfoque linguistico especifico para indonesio. Es un caso representativo de modelos pequenos destilados y cuantizados para despliegue local en idiomas distintos del ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (Liquid AI), segun tags del modelo base; detalles internos no disponibles |
| Parametros totales | 1.728.801.600 (1,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | indonesio (id) |
| Licencia | lfm1.0 (license: other, con enlace a LiquidAI/LFM3-1.7B/blob/main/LICENSE) |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base original en safetensors |
| Tamano del repo | 15,9 GB (incluye todas las variantes GGUF) |
| Libreria | transformers |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

El modelo base es una destilacion de conocimiento desde un modelo Gemma-4 de 12B hacia una arquitectura LFM3 de 1,7B parametros de Liquid AI. El proceso combina SFT (supervised fine-tuning) y LoRA sobre el modelo destilado, con los adaptadores fusionados (merged) en el checkpoint final. Los datasets empleados son indolem/IndoMMLU, cambridgeltl/xcopa, CohereLabs/aya_dataset y AksaraLLM/aksara-sft-clean-v1, todos orientados a evaluacion y ajuste en indonesio y tareas multilingues.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas de la arquitectura LFM3 en la informacion proporcionada. Los tags indican el uso de TRL y custom_code, lo que sugiere un pipeline de entrenamiento basado en la libreria TRL de Hugging Face con codigo personalizado para la arquitectura LFM3.

## Capacidades

- Generacion de texto conversacional en indonesio, segun el tag `conversational` y el idioma declarado.
- Razonamiento y conocimiento en indonesio, potenciado por el ajuste sobre IndoMMLU.
- Razonamiento de sentido comun y causalidad, segun el ajuste sobre XCOPA.
- Capacidades multilingues limitadas: el modelo declara solo indonesio como idioma soportado, aunque aya_dataset incluye contenido multilingue.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades especiales (thinking mode, vision, audio): no disponible en la informacion proporcionada.
- Formato de pesos GGUF compatible con llama.cpp y ecosistema derivado (Ollama, LM Studio, etc.).

## Casos de uso

- Atencion al cliente en indonesio: el modelo puede gestionar conversaciones multi-turno en indonesio gracias a su ajuste sobre aya_dataset y su naturaleza conversacional, adecuado para chatbots de soporte en mercados de Indonesia.
- Clasificacion y respuesta a preguntas academicas: el ajuste sobre IndoMMLU lo hace util para sistemas de tutoria o evaluacion automatica de conocimiento en indonesio.
- Razonamiento de sentido comun en aplicaciones de NLP: el entrenamiento sobre XCOPA permite abordar tareas de inferencia causal y eleccion de alternativas en indonesio.
- Despliegue en dispositivos con recursos limitados: las cuantizaciones Q4_K_M (1,2 GB) y Q5_K_M (1,4 GB) permiten ejecutar el modelo en portatiles y mini-PC sin GPU dedicada mediante llama.cpp.
- Prototipado rapido de aplicaciones NLP en indonesio: el modelo sirve como base para experimentos de generacion de texto y ajuste fino adicional en un idioma con poca cobertura de modelos abiertos.
- Filtrado y moderacion de contenido en indonesio: el modelo puede emplearse para clasificar o resumir texto en dicho idioma en pipelines de preprocesamiento.
- Educacion y traduccion asistida: util como asistente de redaccion o explicacion de conceptos en indonesio para hablantes nativos o estudiantes del idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB para Q2_K, 1,2 GB para Q4_K_M, 1,5 GB para Q6_K y 1,9 GB para Q8_0, mas el overhead del contexto y del runtime.
- GPU recomendadas: cualquier GPU consumer con al menos 2-4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060) es suficiente para las cuantizaciones Q4-Q8; para f16 se recomienda al menos 4-6 GB.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y otros runtimes compatibles con GGUF. El modelo base en safetensors requiere transformers con custom_code.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; al tratarse de un modelo de 1,7B, el throughput en CPU es tipicamente alto y en GPU consumer muy alto, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-1.7B-Gemma-4-12B-GGUF | 1,7B | no disponible | indonesio | lfm1.0 | GGUF |
| Qwen2.5-1.5B | 1,5B | 32K (tipico) | multilingue | Apache 2.0 | safetensors, GGUF |
| Gemma-2-2B | 2B | 8K (tipico) | multilingue | Gemma license | safetensors, GGUF |
| SmolLM2-1.7B | 1,7B | 8K (tipico) | ingles principalmente | Apache 2.0 | safetensors, GGUF |

La comparativa se ofrece como referencia de categoria (modelos de ~1,5-2B parametros); los datos de contexto y licencia de los modelos alternativos son aproximados y deben verificarse en sus fichas oficiales. El modelo de esta ficha se distingue por su especializacion en indonesio y por su origen en destilacion desde un Gemma-4 de 12B, pero carece de datos publicos de benchmarks que permitan una comparacion cuantitativa rigurosa.

## Limitaciones y advertencias

- Idioma restringido: el modelo declara unicamente indonesio; su rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Riesgo de alucinacion: como todo modelo generativo de 1,7B, puede producir contenido factualmente incorrecto, especialmente fuera de su dominio de entrenamiento.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion proporcionada; los datasets de origen (IndoMMLU, XCOPA, aya_dataset, aksara-sft-clean-v1) pueden introducir sesgos propios de sus fuentes.
- Licencia lfm1.0: es una licencia "other" con posibles restricciones de uso comercial; es imprescindible revisar el enlace a la licencia de LiquidAI antes de desplegar en produccion.
- Modelo destilado: la destilacion desde un modelo mayor puede degradar capacidades de razonamiento complejo, matematicas avanzadas y codigo.
- Cuantizaciones estaticas: las variantes publicadas son estaticas; no hay quants ponderados/imatrix disponibles, lo que puede afectar ligeramente a la calidad en comparacion con quants ponderados.
- Contexto no documentado: se desconoce la longitud de contexto soportada, lo que limita la planificacion de aplicaciones con ventanas largas.
- Sin benchmarks: la ausencia de resultados publicados impide validar su calidad frente a alternativas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LFM3-1.7B-Gemma-4-12B-GGUF
- Modelo base: https://huggingface.co/s3t4/LFM3-1.7B-Gemma-4-12B-Distill-Indonesian
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#LFM3-1.7B-Gemma-4-12B-GGUF
- Licencia LFM3-1.7B de LiquidAI: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Dataset IndoMMLU: https://huggingface.co/datasets/indolem/IndoMMLU
- Dataset XCOPA: https://huggingface.co/datasets/cambridgeltl/xcopa
- Dataset aya_dataset: https://huggingface.co/datasets/CohereLabs/aya_dataset
- Dataset aksara-sft-clean-v1: https://huggingface.co/datasets/AksaraLLM/aksara-sft-clean-v1
