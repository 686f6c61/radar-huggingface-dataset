# micdun/if_chat_gpt_oss_20b_science_qwq_code_exaone4_32b_qwen2_5-1_5b_lr1e-4

## Resumen

`micdun/if_chat_gpt_oss_20b_science_qwq_code_exaone4_32b_qwen2_5-1_5b_lr1e-4` es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen2.5-1.5B-Instruct, publicado por el usuario micdun en Hugging Face. El modelo se ha entrenado sobre datos sinteticos generados por varios modelos "profesor" (identificados en el propio nombre del run: gpt-oss-20b, QwQ, EXAONE 4 32B), cubriendo tres dominios: seguimiento de instrucciones/chat, ciencia y codigo. El objetivo es destilar capacidades de modelos de mayor tamano en un modelo pequeno de 1.500 millones de parametros, apto para despliegue en hardware modesto.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card es muy escueta: no documenta composicion exacta del dataset, numero de tokens de entrenamiento, ni resultados de evaluacion. La licencia no esta declarada en los metadatos disponibles, lo que supone un riesgo para uso comercial. El modelo se distribuye en formato safetensors con un tamano de repositorio de 3,1 GB.

Por su tamano y su naturaleza de destilacion sintetica multi-dominio, resulta relevante para experimentacion con modelos pequenos de chat y codigo, pero no debe considerarse un modelo listo para produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), segun tags y modelo base |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-1.5B-Instruct; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF en el repo) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only con atencion causal estandar, y se ha sometido a un ajuste fino completo (full fine-tune), no a LoRA ni a otra tecnica de adaptacion parametro-eficiente. Segun la model card, el entrenamiento consistio en 3 epocas con tasa de aprendizaje 1e-4 y batch global de 64, usando la libreria TRL (tag `trl`) sobre un dataset sintetico.

Los datos de entrenamiento son una mezcla multi-dominio generada por modelos profesor: un dominio de seguimiento de instrucciones/chat, un dominio de ciencia y un dominio de codigo, cada uno producido por el profesor correspondiente indicado en el identificador del run (gpt-oss-20b, QwQ y EXAONE 4 32B). No se especifica el numero de tokens, la proporcion exacta de cada dominio, ni si hubo etapas posteriores de RLHF o DPO. Tampoco se documenta ninguna innovacion arquitectonica adicional: el modelo conserva la arquitectura del base y solo cambian los pesos.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del ajuste de instrucciones del modelo base.
- Razonamiento cientifico y respuesta a preguntas de dominio, segun el dominio de ciencia del dataset sintetico.
- Generacion de codigo, segun el dominio de codigo del dataset sintetico.
- Seguimiento de instrucciones (el tag `if` del nombre sugiere instruction-following como eje del entrenamiento).
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; los idiomas soportados figuran como no disponibles.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: el modelo puede gestionar dialogos multi-turno en local con un consumo de VRAM bajo, lo que permite iterar sobre prompts y flujos sin coste de API.
- Generacion de codigo en entornos de desarrollo: util como autocompletado o generador de fragmentos en editores e IDE, ejecutable en una GPU de consumo.
- Experimentacion academica con destilacion sintetica: sirve como caso de estudio para comparar la calidad de un SFT multi-profesor frente al modelo base Qwen2.5-1.5B-Instruct.
- Respuesta a preguntas de divulgacion cientifica: adecuado para demos de chatbot educativo donde la latencia importa mas que la profundidad experta.
- Evaluacion de pipelines de fine-tuning con TRL: el run documenta hiperparametros concretos (3 epocas, lr 1e-4, batch 64) que pueden reproducirse o compararse.
- Despliegue en entornos con recursos limitados: al tener 1.500 millones de parametros, cabe en GPUs de gama media y permite servir inferencia en local sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,1 GB solo para pesos, mas memoria para el KV cache y activaciones; en la practica, entre 4 y 6 GB segun longitud de contexto y batch.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,6 GB para pesos; en 4 bits, alrededor de 0,8 GB (no se publican pesos cuantizados en el repo, habria que generarlos).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4090, A10, L4). Para cuantizacion 4 bits, GPUs con 4 GB o mas.
- Cabe en GPU de consumo: si, en la mayoria de modelos recientes con 6 GB o mas en fp16, y en tarjetas de 4 GB con cuantizacion.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (tag `text-generation-inference` en los metadatos), y previsiblemente llama.cpp/Ollama tras conversion a GGUF, aunque no se distribuyen pesos GGUF en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (SFT de Qwen2.5-1.5B-Instruct) | 1,54 B | no disponible | no disponible | safetensors | Destilacion sintetica multi-dominio; sin benchmarks publicados |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | no disponible en esta ficha | no disponible | safetensors | Modelo base original, con evaluaciones publicadas por Qwen |
| Alternativas de ~1-2 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- La model card no documenta la licencia, lo que impide confirmar si el uso comercial esta permitido; el modelo base Qwen2.5 tiene su propia licencia que conviene revisar por separado.
- No hay informacion sobre sesgos, filtros de seguridad ni alineacion adicional; el entrenamiento es exclusivamente SFT sobre datos sinteticos.
- Riesgo de alucinacion inherente a un modelo de 1,5 B de parametros y a la destilacion de datos sinteticos, que puede propagar errores de los modelos profesor.
- No se especifican idiomas soportados; el rendimiento fuera del ingles (y posiblemente chino, por el base Qwen) no esta verificado.
- La longitud de contexto efectiva no esta confirmada en la model card; no debe asumirse la del modelo base sin pruebas.
- El repositorio tiene 0 descargas y 0 likes, y no incluye evaluaciones: no hay evidencia publica de calidad en produccion.
- El nombre del run mezcla varios profesores (gpt-oss-20b, QwQ, EXAONE 4 32B) sin detallar la mezcla exacta ni el volumen de datos, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/micdun/if_chat_gpt_oss_20b_science_qwq_code_exaone4_32b_qwen2_5-1_5b_lr1e-4
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Documentacion de TRL: no disponible en la informacion proporcionada
- Paper de Qwen2.5: no disponible en la informacion proporcionada
- Repositorios o demos adicionales: no disponible en la informacion proporcionada
