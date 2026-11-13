# qihuaying/DeepSeek-R1

## Resumen

DeepSeek-R1 es un modelo de razonamiento desarrollado por DeepSeek AI, publicado originalmente en enero de 2025 (paper arXiv:2501.12948). Se trata de un modelo de lenguaje de gran escala basado en la arquitectura DeepSeek-V3 (Mixture of Experts) que incorpora entrenamiento mediante aprendizaje por refuerzo a gran escala para potenciar cadenas de razonamiento largas (chain-of-thought). Esta ficha corresponde a la copia alojada por el usuario `qihuaying` en Hugging Face, que replica los pesos oficiales del modelo con licencia MIT.

El modelo resuelve el problema del razonamiento complejo en matematicas, codigo y logica, alcanzando un rendimiento comparable a OpenAI o1 segun la model card oficial. Su relevancia radica en haber sido el primer trabajo abierto que demostro que las capacidades de razonamiento pueden incentivarse puramente mediante RL sin SFT previo (la variante R1-Zero), y en la publicacion de destilaciones densas de 1.5B a 70B basadas en Qwen2.5 y Llama 3.

La copia aqui descrita tiene 684.489.845.504 parametros totales segun los safetensors del repositorio (688.6 GB de tamano), lo que confirma que se trata de los pesos completos del modelo MoE, no de una destilacion. No se dispone de informacion sobre longitud de contexto ni idiomas en los metadatos de esta copia concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepSeek-V3 (transformer Mixture of Experts, segun tag `deepseek_v3`) |
| Parametros totales | 684.489.845.504 (684,5 mil millones) |
| Parametros activos | no disponible en la informacion proporcionada (la model card oficial los detalla, pero el fragmento disponible esta truncado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos en FP8 en el repositorio; no se detallan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (requiere `trust_remote_code` por `custom_code`) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura DeepSeek-V3, un transformer con capas Mixture of Experts (MoE) y atencion multi-cabeza latente (MLA) segun la documentacion oficial de la familia. El entrenamiento combina dos etapas de RL (una para descubrir patrones de razonamiento mejorados y otra para alinear con preferencias humanas) con dos etapas de SFT que actuan como semilla de las capacidades de razonamiento y no razonamiento. La innovacion principal es el uso de RL a gran escala sobre el modelo base sin SFT previo (R1-Zero), que hizo emerger comportamientos de autoverificacion, reflexion y cadenas de pensamiento largas.

La model card menciona tambien la destilacion de los patrones de razonamiento de R1 en modelos densos mas pequenos (1.5B, 7B, 8B, 14B, 32B y 70B basados en Qwen2.5 y Llama 3), aunque esta copia concreta corresponde al modelo MoE completo. No se dispone en la informacion proporcionada del numero exacto de tokens de entrenamiento ni de la composicion del dataset.

## Capacidades

- Generacion de texto y razonamiento complejo con cadenas de pensamiento largas (chain-of-thought).
- Resolucion de problemas matematicos de nivel competitivo, comparable a OpenAI o1 segun la model card.
- Generacion y comprension de codigo.
- Razonamiento logico multi-paso con autoverificacion y reflexion.
- Capacidades multilingues: la model card menciona problemas de mezcla de idiomas en R1-Zero que se corrigen en R1, pero no se detalla la lista de idiomas soportados.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Razonamiento matematico asistido: el modelo puede resolver problemas de competicion y demostraciones formales generando cadenas de pensamiento extensas, adecuado por su entrenamiento especifico en RL para matematicas.
- Generacion de codigo en produccion: util para tareas de sintesis y depuracion de codigo donde se requiere razonamiento sobre la logica del programa, aunque la integracion en pipelines de CI/CD depende de soporte de tool calling no confirmado en esta copia.
- Analisis de problemas cientificos y tecnicos: su capacidad de reflexion y autoverificacion lo hace adecuado para tareas de investigacion que requieren descomposicion de problemas complejos.
- Evaluacion comparativa de modelos de razonamiento: al ser pesos abiertos con licencia MIT, sirve como referencia para reproducir benchmarks de razonamiento en entornos de investigacion.
- Destilacion de modelos mas pequenos: el modelo puede generar datos de razonamiento de alta calidad para entrenar modelos densos de menor tamano, tal como hizo DeepSeek AI con sus destilaciones.
- Educacion y tutoria automatizada: puede explicar paso a paso la resolucion de problemas matematicos y logicos, mostrando el razonamiento intermedio.
- Investigacion en RL para LLMs: su publicacion como modelo abierto permite estudiar los patrones de razonamiento emergentes y las tecnicas de entrenamiento por refuerzo.

## Benchmarks y rendimiento

La model card oficial indica que DeepSeek-R1 alcanza un rendimiento comparable a OpenAI o1 en tareas de matematicas, codigo y razonamiento, y que DeepSeek-R1-Distill-Qwen-32B supera a OpenAI o1-mini en varios benchmarks. Sin embargo, en la informacion proporcionada no se incluyen las tablas numericas de resultados (el fragmento de la model card esta truncado en la seccion de benchmarks).

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 684,5 mil millones de parametros totales en FP8, los pesos ocupan aproximadamente 685 GB; se requiere un sistema multi-GPU con al menos 8 GPU de 80 GB (A100/H100) para FP8, o mas si se usa BF16.
- GPU recomendadas: H100 80 GB, A100 80 GB, H200; no cabe en GPUs de consumo (RTX 4090, 24 GB) ni en configuraciones de una sola GPU.
- Opciones de despliegue: transformers con `trust_remote_code`, text-generation-inference (tag `text-generation-inference`), y presumiblemente vLLM y SGLang segun el ecosistema DeepSeek-V3, aunque no se confirma en la informacion proporcionada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DeepSeek-R1 (esta copia) | 684,5B (MoE) | no disponible | MIT | Hugging Face |
| DeepSeek-R1-Zero | no disponible en el fragmento | no disponible | MIT (oficial) | Hugging Face (deepseek-ai) |
| DeepSeek-R1-Distill-Qwen-32B | 32B (denso) | no disponible | MIT (oficial) | Hugging Face (deepseek-ai) |
| OpenAI o1 | no disponible | no disponible | propietaria | API de OpenAI |

La comparativa con o1 se basa en la afirmacion de la model card de rendimiento comparable en matematicas, codigo y razonamiento; no se dispone de numeros concretos en la informacion proporcionada.

## Limitaciones y advertencias

- La model card advierte de que R1-Zero presenta problemas de repeticion infinita, legibilidad deficiente y mezcla de idiomas; R1 corrige parte de estos problemas con datos de cold-start, pero pueden persistir en casos limite.
- Riesgo de alucinacion inherente a los modelos de lenguaje de gran escala, especialmente en tareas fuera de matematicas y codigo.
- No se dispone de informacion sobre sesgos conocidos en la documentacion proporcionada.
- La longitud de contexto no esta confirmada en esta copia, lo que limita la planificacion de despliegues con documentos largos.
- La licencia MIT permite uso comercial, pero el autor de esta copia (`qihuaying`) no es el desarrollador original; se recomienda verificar la integridad de los pesos frente al repositorio oficial `deepseek-ai/DeepSeek-R1`.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en 2026, lo que sugiere que es una copia no oficial sin validacion de la comunidad.
- El requisito de hardware (multi-GPU de 80 GB) hace inviable el despliegue en entornos de consumo.

## Enlaces

- Repositorio Hugging Face de esta copia: https://huggingface.co/qihuaying/DeepSeek-R1
- Paper: https://arxiv.org/abs/2501.12948
- Repositorio oficial en Hugging Face: https://huggingface.co/deepseek-ai
- Web oficial: https://www.deepseek.com/
- Chat: https://chat.deepseek.com/
- Repositorio GitHub del paper y licencia: https://github.com/deepseek-ai/DeepSeek-R1
- PDF del paper: https://github.com/deepseek-ai/DeepSeek-R1/blob/main/DeepSeek_R1.pdf
- Discord de DeepSeek AI: https://discord.gg/Tc7c45Zzu5
- Twitter/X: https://twitter.com/deepseek_ai
