# OkamotoJP/llm2-qwen35-sft014

## Resumen

`OkamotoJP/llm2-qwen35-sft014` es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario OkamotoJP. Se trata de un modelo derivado orientado especificamente a la generacion de respuestas en tareas de RAG (Retrieval-Augmented Generation) sobre documentacion en japones, creado como proyecto final del curso "LLM講座2 2026". El ajuste se realizo mediante LoRA y posteriormente se fusiono con los pesos originales, por lo que la arquitectura resultante es identica a la del modelo base.

El modelo cuenta con 873.438.784 parametros (aproximadamente 0,87 mil millones) y hereda las capacidades estructurales de Qwen3.5-0.8B. Su proposito es acotado: generar respuestas a partir de contexto documental recuperado, en japones, con un enfasis en preguntas multi-salto (multi-hop QA). No es un modelo de proposito general ni un modelo instructivo amplio, sino un ajuste especializado sobre un corpus concreto.

Su relevancia es limitada y de nicho: se trata de un experimento academico con muy pocas descargas (2) y sin validacion publica de benchmarks. Resulta util como referencia para quienes estudien tecnicas de SFT con LoRA sobre modelos pequenos para RAG en japones, pero no debe considerarse un modelo listo para produccion sin una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (hereda la de Qwen/Qwen3.5-0.8B); pesos fusionados tras LoRA |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/otros no publicadas) |
| Idiomas soportados | japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B (revision `2fc06364715b967f1860aea9cf38778875588b17`) y aplica un ajuste fino supervisado mediante LoRA con rango r=16, alpha=32 y tasa de aprendizaje 1e-4 durante 1 epoca sobre un total de 1378 ejemplos. Posteriormente, los adaptadores LoRA se fusionaron en los pesos originales; segun la model card, solo se actualizaron los pesos de la parte linguistica, manteniendo la estructura del modelo base intacta.

Los datos de entrenamiento provienen de tres fuentes: JEMHopQA (CC BY-SA 4.0), filtrado y reformateado para entrenamiento; `cl-nagoya/auto-wiki-qa` (CC BY-SA 4.0), muestreado, filtrado y reformateado; y un conjunto de chunks distribuidos derivados de Wikipedia en japones (CC BY-SA 4.0), utilizados como material de contexto en los prompts de entrenamiento. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales, ni el numero total de tokens de entrenamiento. No se mencionan innovaciones tecnicas propias mas alla del ajuste LoRA fusionado.

## Capacidades

- Generacion de texto en japones orientada a responder preguntas a partir de contexto documental (RAG).
- Razonamiento multi-salto sobre documentos, gracias al entrenamiento con JEMHopQA.
- Resumen y sintesis de fragmentos de Wikipedia en japones como material de referencia.
- Generacion de respuestas condicionadas a un contexto recuperado (chunks), no solo a la pregunta.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso autonomo: no disponible; el modelo esta disenado para un unico paso de generacion de respuesta.
- Capacidades multilingues: limitadas al japones segun la model card.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Generacion de respuestas en pipelines RAG en japones: el modelo recibe la pregunta del usuario junto con los chunks recuperados por un buscador vectorial y produce una respuesta sintetizada; es su proposito declarado y el escenario para el que fue entrenado.
- Preguntas multi-salto sobre documentacion corporativa: al haberse entrenado con JEMHopQA, puede combinar informacion de varios fragmentos para responder preguntas que requieren encadenar hechos.
- Asistente de consulta sobre Wikipedia en japones: integrado con un indice de chunks de Wikipedia, permite responder preguntas enciclopedicas citando el contexto recuperado.
- Prototipado academico de sistemas RAG: util como componente de generacion en proyectos docentes o de investigacion donde se necesite un modelo pequeno y de licencia permisiva.
- Evaluacion de tecnicas de SFT con LoRA: sirve como caso de estudio reproducible para comparar estrategias de ajuste sobre modelos de menos de mil millones de parametros.
- Despliegue en entornos con recursos limitados: con 873 millones de parametros, puede ejecutarse en GPU de consumo para demos internas de RAG en japones, siempre que se valide su calidad previamente.
- Filtrado y reformulacion de respuestas sobre conjuntos documentales cerrados: al estar entrenado sobre chunks especificos, puede adaptarse a dominios documentales acotados con un reajuste adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano (873 M de parametros), en fp16 requeriria aproximadamente 1,8 GB solo para pesos, y en cuantizacion de 8 bits alrededor de 0,9 GB, sin contar el cache KV ni el contexto.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, cabria en GPU de consumo como RTX 3060, RTX 4060 o superiores, aunque no hay validacion publicada.
- Cabe en consumer GPU: previsiblemente si, dado el tamano del modelo, pero no confirmado por el autor.
- Opciones de despliegue: no disponible. Al publicarse en safetensors, seria compatible con frameworks estandar (Transformers, vLLM, TGI), pero no se han publicado pesos GGUF ni integraciones con llama.cpp u Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| OkamotoJP/llm2-qwen35-sft014 | 873 M | no disponible | Apache-2.0 | SFT para RAG en japones | Hugging Face, 2 descargas |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | Apache-2.0 | Modelo base generalista | Hugging Face |
| Otros ajustes SFT de Qwen3.5-0.8B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a parametros y licencia.

## Limitaciones y advertencias

- Modelo de nicho con muy poca traccion: 2 descargas y 0 likes en el momento de la consulta, sin validacion externa.
- Entrenado exclusivamente en japones; su rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Riesgo de alucinacion: al ser un modelo de 0,8 B ajustado sobre un corpus acotado, puede inventar hechos cuando el contexto recuperado no contiene la respuesta.
- Sesgos conocidos: no documentados por el autor; al entrenarse sobre Wikipedia en japones y JEMHopQA, puede heredar sesgos de esas fuentes.
- Limitaciones de contexto: la longitud de contexto no esta documentada; no se garantiza el manejo de contextos largos.
- Restricciones de licencia: los pesos se publican bajo Apache-2.0, pero los datos de entrenamiento son CC BY-SA 4.0 (JEMHopQA, auto-wiki-qa y chunks de Wikipedia), lo que puede imponer obligaciones de atribucion y compartir-igual en usos derivados; conviene revisar la compatibilidad antes de un uso comercial.
- No se documentan capacidades de tool calling, agentes ni modos de razonamiento extendido; no debe asumirse que las hereda del modelo base.
- No hay garantias de calidad en produccion: se recomienda una evaluacion propia sobre el dominio objetivo antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OkamotoJP/llm2-qwen35-sft014
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset cl-nagoya/auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
