# mradermacher/G4-Prototype01-12B-v0.1-i1-GGUF

## Resumen

G4-Prototype01-12B-v0.1-i1-GGUF es una cuantizacion en formato GGUF del modelo base G4-Prototype01-12B-v0.1, desarrollado por el colectivo 12B-Suite y cuantizado por mradermacher. Se trata de un modelo de 11.9 mil millones de parametros, etiquetado como "gemma4" (lo que sugiere una arquitectura derivada de la familia Gemma, aunque no hay confirmacion oficial), fine-tuneado mediante supervisados (SFT) sobre un dataset de psicologia oscura (Naphula-Archives/Dark-Psychology-Secrets). El modelo esta orientado a roleplay, instrucciones, contenido sin censura y generacion creativa, con capacidades de vision segun la model card.

La relevancia de este modelo radica en su proposito especifico: ofrecer una alternativa sin restricciones para aplicaciones de rol, escritura creativa y simulacion de personajes, con un enfoque en psicologia y contenido maduro. Al estar cuantizado en GGUF, puede ejecutarse en hardware de consumo mediante motores como llama.cpp u Ollama, lo que facilita su despliegue local. Sin embargo, su naturaleza "uncensored" y el dataset de psicologia oscura implican riesgos eticos y de sesgo que deben considerarse antes de su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como "gemma4", sin confirmacion oficial) |
| Parametros totales | 11.907.350.576 (11.9B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K (4.9 GB), i1-IQ3_M (5.8 GB); se mencionan otros en comentarios (Q2_K, IQ3_M, Q4_K_S, etc.) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

No se dispone de informacion oficial sobre la arquitectura interna del modelo base. Los tags incluyen "gemma4", lo que podria indicar una variante de la familia Gemma, pero no hay documentacion que lo confirme. El modelo fue fine-tuneado mediante SFT (supervised fine-tuning) sobre el dataset Naphula-Archives/Dark-Psychology-Secrets, que segun FriendliAI contiene solo 22 pares de preguntas y respuestas sobre psicologia oscura. Los tags "peft" y "unsloth" sugieren el uso de tecnicas de fine-tuning eficiente (PEFT) y la libreria Unsloth. No hay informacion sobre RLHF, DPO ni otros metodos de alineacion. La cuantizacion GGUF fue realizada por mradermacher con imatrix (importance matrix) para mejorar la calidad de los quants de baja precision.

## Capacidades

- Generacion de texto libre, con enfasis en roleplay, narrativa creativa y respuestas instructivas.
- Contenido sin censura (etiquetado como "uncensored", "heretic", "mature", "erp"), lo que permite generar texto explicito o sensible sin filtros aparentes.
- Capacidades de vision: la model card indica que es un modelo de vision, aunque no se especifican detalles sobre el procesamiento de imagenes.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible.
- Multilingue: solo ingles (etiqueta "en").
- Otras capacidades: orientado a psicologia, roleplay erotico (ERP), creatividad y simulacion de personajes.

## Casos de uso

- Roleplay conversacional: el modelo puede mantener dialogos multi-turno con personajes ficticios, aprovechando su fine-tuning en psicologia para dar profundidad a las respuestas. Adecuado para juegos de rol escritos o chatbots de entretenimiento.
- Escritura creativa de ficcion: genera narrativas, dialogos y descripciones con tono maduro o explicito, util para autores que exploran generos adultos o psicologicos.
- Simulacion de personajes para videojuegos: integrable en motores de dialogo para NPCs con personalidades complejas, gracias a su capacidad de generar respuestas contextuales sin restricciones.
- Asistente de escritura para contenido psicologico: puede ayudar a redactar material sobre psicologia oscura, manipulacion o influencia, aunque con supervision humana debido a su naturaleza sensible.
- Experimentacion con fine-tuning: al ser un modelo abierto con licencia Apache-2.0, sirve como base para investigaciones sobre alineacion, sesgos o generacion sin censura.
- Chat para adultos: orientado a conversaciones eroticas o de contenido maduro, con la ventaja de no aplicar filtros de seguridad (riesgo etico).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar. La unica referencia es la entrada en LLM Explorer, que indica un requisito de VRAM de 24 GB para el modelo completo, pero sin cifras de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: las cuantizaciones i1-Q2_K (4.9 GB) e i1-IQ3_M (5.8 GB) caben en GPUs con 8-12 GB de VRAM, como una RTX 3060 12GB o RTX 4070. El modelo sin cuantizar requiere alrededor de 24 GB segun LLM Explorer.
- GPU recomendadas: para las versiones GGUF, cualquier GPU moderna con al menos 8 GB de VRAM es suficiente; para el modelo completo se recomienda una RTX 3090, RTX 4090 o A100.
- Compatibilidad con consumer GPU: si, las cuantizaciones ligeras funcionan en GPUs de consumo medio.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier motor compatible con GGUF. Tambien se puede usar vLLM si se convierte a otro formato, aunque no es lo habitual.
- Latencia y throughput: no disponible. Dependera del hardware y del motor de inferencia.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables. Dado que el modelo base no tiene benchmarks publicados y su arquitectura no esta confirmada, no es posible realizar una comparativa fiable con alternativas como Mistral 7B, Llama 3 8B o Gemma 2 9B. Se recomienda consultar la pagina de LLM Explorer para obtener una vision general, aunque los datos ahi tampoco incluyen metricas de rendimiento.

## Limitaciones y advertencias

- Contenido sin censura: el modelo puede generar texto explicito, ofensivo o psicologicamente manipulador, lo que supone un riesgo en entornos de produccion o para menores.
- Sesgos potenciales: el fine-tuning sobre un dataset de psicologia oscura (solo 22 pares) puede introducir sesgos hacia temas de manipulacion, influencia o conductas problematicas.
- Alucinaciones: no hay informacion especifica, pero al ser un modelo de 12B sin alineacion reforzada, es probable que presente alucinaciones en temas factuales.
- Limitaciones de idioma: solo soporta ingles, lo que limita su uso en entornos hispanohablantes.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el contenido generado puede violar politicas de plataformas o leyes locales (por ejemplo, contenido explicito).
- Falta de documentacion: no hay informacion sobre la arquitectura exacta, el contexto maximo ni los datos de entrenamiento completos, lo que dificulta evaluar su robustez.
- Advertencia para produccion: no se recomienda su uso en aplicaciones que requieran moderacion, seguridad o precision factual sin una capa adicional de filtrado y supervision humana.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/mradermacher/G4-Prototype01-12B-v0.1-i1-GGUF
- Repositorio HuggingFace del modelo base: https://huggingface.co/12B-Suite/G4-Prototype01-12B-v0.1
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/G4-Prototype01-12B-v0.1-GGUF
- Ficha en LLM Explorer: https://llm-explorer.com/model/12B-Suite%2FG4-Prototype01-12B-v0.1,4mCqz7AlZKA7gXMURCb9ln
- Pagina de inferencia en FriendliAI: https://friendli.ai/models/12B-Suite/G4-Prototype01-12B-v0.1
- Dataset de fine-tuning: https://huggingface.co/datasets/Naphula-Archives/Dark-Psychology-Secrets
