# sdafagb/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es una variante "decensored" del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, publicada por el usuario sdafagb. El modelo base es un fine-tune de razonamiento de Qwen3.5-9B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect, con un enfasis claro en matematicas y resolucion de problemas STEM. Esta version concreta aplica la herramienta Heretic v2.0.0.dev0 para eliminar los comportamientos de rechazo mediante una ablacion de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) sobre las capas 9 a 24.

Se trata de un modelo denso de aproximadamente 9.400 millones de parametros, con licencia Apache 2.0 y soporte declarado para seis idiomas: ingles, chino, coreano, japones, espanol y ruso. Su interes practico reside en combinar la eficiencia de la clase 9B con un estilo de razonamiento estructurado heredado de un profesor de mayor tamano, y en ofrecer una variante sin rechazos que mantiene una divergencia KL reducida (0.0422) respecto al original.

La relevancia de esta ficha radica en que documenta una practica cada vez mas comun en el ecosistema open source: la ablacion selectiva de comportamientos de rechazo sobre modelos destilados, con metricas explicitas de degradacion (divergencia KL) y de eficacia (reduccion de rechazos de 100/100 a 3/100 en el conjunto de evaluacion del autor). No obstante, la informacion publica sobre arquitectura interna, contexto y benchmarks es escasa, y muchos datos deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5); detalles internos no disponibles |
| Parametros totales | 9.409.813.744 (segun safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el repo contiene pesos safetensors (19,3 GB), lo que sugiere disponibilidad en BF16/FP16 |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de razonamiento de Qwen3.5-9B destilado a partir de DeepSeek-V4-Pro en modo Max Effect. El autor del modelo base declara un conjunto de aproximadamente 250.000 muestras centradas en matematicas y razonamiento cientifico, con etapas de SFT, RL y GSPO, ademas de evaluacion con MTP (multi-token prediction) y NVFP4. No se especifica el numero total de tokens de entrenamiento ni la composicion exacta del dataset mas alla del enfasis en STEM.

La innovacion principal de esta variante es la aplicacion de Heretic v2.0.0.dev0 mediante Arbitrary-Rank Ablation (ARA). Los parametros publicados son: start_layer_index 9, end_layer_index 24, preserve_good_behavior_weight 0.8264, steer_bad_behavior_weight 0.0003, overcorrect_relative_weight 0.9645 y neighbor_count 12. La tecnica modifica las representaciones internas en un rango de capas para suprimir comportamientos de rechazo preservando en lo posible el resto de capacidades, y el autor reporta una divergencia KL de 0.0422 frente al modelo original.

## Capacidades

- Generacion de texto y razonamiento estructurado con descomposicion de problemas en multiples pasos, heredado de la destilacion de DeepSeek-V4-Pro.
- Razonamiento matematico y cientifico (STEM), area en la que se concentra el senal de entrenamiento supervisado.
- Generacion de codigo y transferencia cross-domain: el autor reporta pequenas mejoras en programacion y uso de herramientas pese a no incluir SFT especifico de codigo.
- Soporte de tool calling y function calling, segun las etiquetas del repositorio.
- Capacidades multimodales declaradas por la etiqueta image-text-to-text y el pipeline, aunque no se detallan en la model card.
- Multilingue en ingles, chino, coreano, japones, espanol y ruso.
- Modo de razonamiento (reasoning) y posible modo "thinking" heredado de la familia Qwen3.5; no confirmado explicitamente.
- Supresion de rechazos: 3/100 rechazos en la evaluacion del autor frente a 100/100 del modelo original.

## Casos de uso

- Resolucion de problemas matematicos y cientificos: uso como asistente de calculo simbolico y verificacion de derivaciones, aprovechando el entrenamiento sobre aproximadamente 250.000 muestras STEM y el estilo de descomposicion paso a paso.
- Generacion de codigo en pipelines de CI/CD: el soporte de tool calling y la transferencia cross-domain permiten integrarlo en tareas de autocompletado, generacion de tests y revision de parches, con la ventaja de un tamano de 9B que cabe en infraestructura modesta.
- Agentes multi-paso con uso de herramientas: la capacidad de function calling y el razonamiento estructurado lo hacen adecuado para orquestacion de llamadas a APIs en flujos de automatizacion.
- Investigacion sobre alineacion y seguridad: la variante heretic sirve como objeto de estudio para medir el impacto de la ablacion ARA en la utilidad y en la tasa de rechazos, con metricas publicadas de divergencia KL.
- Atencion al cliente en varios idiomas: cobertura de seis idiomas (en, zh, ko, ja, es, ru) para conversaciones multi-turno, aunque la longitud de contexto no esta documentada y debe validarse en produccion.
- Prototipado rapido en entornos con GPU de consumo: al ser un modelo denso de 9B, puede desplegarse en una sola GPU consumer con cuantizacion adecuada, lo que facilita experimentacion local.
- Generacion de material docente en STEM: redaccion de explicaciones paso a paso y problemas resueltos, con la advertencia de que la supresion de rechazos exige filtrado posterior del contenido.

## Benchmarks y rendimiento

El autor publica unicamente metricas de la ablacion, no benchmarks estandar de razonamiento:

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) |
|---|---|---|
| Rechazos (sobre 100) | 3/100 | 100/100 |
| Divergencia KL | 0.0422 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 19 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 24 GB para comodidad.
- VRAM estimada con cuantizacion de 8 bits: en torno a 10-11 GB; con 4 bits, en torno a 6-7 GB (estimaciones a partir del numero de parametros, no confirmadas por el autor).
- GPU recomendadas para BF16: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB, justo para pesos).
- GPU consumer: cabe en RTX 4090 en BF16 con margen limitado; en RTX 3090/4080 y superiores con cuantizacion de 8 o 4 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta del repo) y, previsiblemente, vLLM, llama.cpp u Ollama tras conversion a GGUF; la disponibilidad de GGUF no esta confirmada en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (heretic) | 9,4B | no disponible | Apache 2.0 | Variante sin rechazos, 3/100 refusals, KL 0.0422 |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | 9,4B | no disponible | Apache 2.0 | Modelo base con alineacion estandar, 100/100 refusals |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | ~4B | no disponible | no disponible | Version 4B de la misma familia heretic |
| xtools-at/Qwen3.5-9B-DeepThought-STEM | 9B | no disponible | no disponible | Fine-tune cientifico basado en este modelo |

Los datos de rendimiento comparado en benchmarks estandar no estan disponibles para ninguno de los modelos de la tabla.

## Limitaciones y advertencias

- La supresion de rechazos implica que el modelo puede generar contenido que el modelo original bloquearia; es imprescindible anadir filtros y politicas de uso en produccion.
- La divergencia KL de 0.0422 indica una degradacion medible respecto al original; puede afectar a la coherencia en tareas fuera del dominio STEM.
- El conjunto de evaluacion de rechazos (100 prompts) es pequeno y no representa la diversidad de casos reales.
- Riesgo de alucinacion inherente a los modelos destilados de 9B, especialmente en matematicas avanzadas donde el profesor de mayor tamano no se replica exactamente.
- La longitud de contexto no esta documentada; no debe asumirse una ventana larga sin verificacion empirica.
- El entrenamiento se concentra en matematicas y STEM; el rendimiento en tareas generales de conversacion o creatividad puede ser inferior.
- La cobertura multilingue declarada (seis idiomas) no garantiza calidad homogenea; el espanol figura en la lista pero sin evaluacion publicada.
- Licencia Apache 2.0 permisiva para uso comercial, pero el uso de una variante "uncensored" puede incumplir politicas de plataformas o normativas sectoriales; la responsabilidad recae en el desplegador.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sdafagb/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Version 4B de la misma familia: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Fine-tune cientifico derivado: https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM
- Heretic: https://heretic-project.org
