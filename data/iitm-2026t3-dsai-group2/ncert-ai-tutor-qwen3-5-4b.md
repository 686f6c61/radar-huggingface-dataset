# IITM-2026T3-DSAI-GROUP2/NCERT-AI-Tutor-Qwen3.5-4B

## Resumen

NCERT-AI-Tutor-Qwen3.5-4B es un adaptador LoRA (PEFT) publicado por el usuario IITM-2026T3-DSAI-GROUP2 sobre el modelo base Qwen/Qwen3.5-4B. Por el nombre y la estructura del repositorio, se trata de un ajuste fino supervisado (SFT) orientado a la tutorizacion educativa en el contexto del currículo NCERT (el consejo nacional de libros de texto de la India), aunque la model card no documenta explicitamente el dataset ni el objetivo. El repositorio contiene unicamente los pesos del adaptador (0,2 GB), no el modelo completo.

El modelo hereda del base Qwen3.5-4B la arquitectura transformer, el tamano de 4 mil millones de parametros y la ventana de contexto, pero ninguno de estos datos esta confirmado en la informacion disponible: la model card es la plantilla por defecto de Hugging Face con todos los campos marcados como "[More Information Needed]". La licencia, los idiomas soportados y los detalles de entrenamiento no estan declarados.

Su relevancia practica es limitada como objeto de evaluacion: al no publicar benchmarks, dataset ni hiperparametros, no es posible verificar la calidad del ajuste ni reproducir el entrenamiento. Resulta util, sin embargo, como ejemplo de flujo de trabajo de fine-tuning con Unsloth, TRL y PEFT sobre un modelo Qwen de cuarta generacion, y como posible punto de partida para quien quiera adaptar un tutor educativo a un dominio concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (heredada del base Qwen/Qwen3.5-4B); adaptador LoRA sobre atencion/proyecciones |
| Parametros totales | 4B (modelo base); tamano del adaptador no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen3.5-4B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base admite las cuantizaciones habituales de Qwen) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft 0.21.2 |
| Tamano del repositorio | 0,2 GB |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen3.5-4B |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con SFT sobre el modelo Qwen3.5-4B. La model card declara el uso de las librerias `peft`, `trl`, `transformers` y `unsloth`, lo que sugiere un pipeline de ajuste fino eficiente en memoria (Unsloth optimiza kernels y reduce el consumo de VRAM en el entrenamiento de LoRA). No se especifican el rango del adaptador, el alpha, las capas objetivo, la tasa de aprendizaje, el numero de pasos ni el numero de tokens de entrenamiento.

No hay informacion sobre la composicion del dataset (presumiblemente material educativo NCERT, pero no confirmado), ni sobre si se aplicaron tecnicas de RLHF, DPO o filtrado de datos. Tampoco se documentan innovaciones tecnicas adicionales. La referencia `arxiv:1910.09700` que aparece en los tags corresponde al articulo de Lacoste et al. sobre el calculo de emisiones de carbono en machine learning, citado en la plantilla de la model card, y no a un paper del modelo.

## Capacidades

- Generacion de texto conversacional en formato de chat, heredada del modelo base Qwen3.5-4B.
- Razonamiento y respuesta a preguntas de tipo educativo, si el ajuste SFT ha funcionado segun lo previsto por el nombre del repositorio (no verificado).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada; depende de si el base lo conserva tras el ajuste.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el base Qwen suele ser multilingue, pero el ajuste puede haber reducido el rendimiento fuera del dominio entrenado.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Tutoria educativa de asignaturas del curriculo NCERT: el adaptador esta disenado para responder dudas de estudiantes de secundaria india, presumiblemente con explicaciones paso a paso. Requiere validacion previa porque no hay evaluacion publicada.
- Prototipado rapido de asistentes de estudio: al ser un adaptador de 0,2 GB, se puede cargar sobre el base Qwen3.5-4B en una GPU de consumo y probar variantes de prompt sin reentrenar.
- Fine-tuning incremental: sirve como punto de partida para experimentos de LoRA sobre LoRA o para mezclar adaptadores con tecnicas como TIES o DARE, dado que el formato PEFT es estandar.
- Investigacion sobre ajuste fino educativo: util para estudiar como un SFT pequeno altera el comportamiento de un modelo de 4B en dominios academicos, comparando respuestas antes y despues del adaptador.
- Generacion de material de repaso: el modelo puede redactar resumenes y preguntas de practica a partir de apuntes, siempre que se valide la fidelidad factual contra el libro de texto original.
- Despliegue en entornos con recursos limitados: al combinarse con cuantizacion del base (por ejemplo, GGUF de 4 bits), el conjunto puede ejecutarse en portatiles con GPU integrada o CPU, aunque el rendimiento real no esta medido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en si ocupa unos 0,2 GB; el modelo base Qwen3.5-4B requiere aproximadamente 8 GB en FP16, 4-5 GB en cuantizacion de 8 bits y 2,5-3 GB en 4 bits (estimaciones estandar para 4B, no medidas para este adaptador).
- GPU recomendadas: A100 o H100 para servir en FP16 con concurrencia; RTX 4090, RTX 3090 o L40S para uso individual en FP16; RTX 4070/4060 Ti o inferiores solo con cuantizacion.
- Cabe en GPU de consumo: si, con cuantizacion de 4 u 8 bits del base; en FP16 necesita al menos 8-10 GB de VRAM libre.
- Opciones de despliegue: transformers + peft (carga directa del adaptador), vLLM con soporte de LoRA, TGI, llama.cpp/Ollama si se fusiona el adaptador con el base y se convierte a GGUF. Unsloth puede usarse para fusionar y exportar.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NCERT-AI-Tutor-Qwen3.5-4B | 4B (base) + LoRA | no disponible | no disponible | safetensors (PEFT) | Adaptador educativo sin evaluacion publicada |
| Qwen/Qwen3.5-4B | 4B | no disponible | no disponible | safetensors, GGUF (segun distribucion del autor) | Modelo base generalista; referencia para medir el efecto del ajuste |
| Adaptadores LoRA comunitarios sobre Qwen (genericos) | 4B (base) | no disponible | variable | safetensors (PEFT) | Calidad muy variable; suelen carecer de benchmarks |

La comparacion cuantitativa con alternativas no es posible porque no hay resultados de evaluacion del adaptador ni datos publicos del base Qwen3.5-4B en la informacion proporcionada.

## Limitaciones y advertencias

- Model card vacia: todos los campos de documentacion estan sin rellenar, incluidos dataset, hiperparametros y evaluacion. No es posible reproducir el entrenamiento ni verificar sus afirmaciones.
- Licencia no declarada: no se puede asumir uso comercial permitido. Hay que consultar la licencia del base Qwen3.5-4B y la del adaptador por separado antes de cualquier despliegue en produccion.
- Riesgo de alucinacion: un tutor educativo que invente contenido curricular es especialmente peligroso; sin evaluacion, no hay garantia de fidelidad a los libros NCERT.
- Sesgos desconocidos: al no documentarse el dataset, no se puede evaluar el sesgo cultural, linguistico o de genero del ajuste.
- Cobertura idiomatica incierta: el ajuste puede haber desplazado el modelo hacia el ingles o el hindi, degradando su rendimiento en castellano u otros idiomas.
- Cero adopcion: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni retroalimentacion de la comunidad.
- Fecha de creacion futura (2026-11-19) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de confiar en el.

## Enlaces

- Hugging Face: https://huggingface.co/IITM-2026T3-DSAI-GROUP2/NCERT-AI-Tutor-Qwen3.5-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- PEFT: https://github.com/huggingface/peft
- TRL: https://github.com/huggingface/trl
- Unsloth: https://github.com/unslothai/unsloth
- Paper citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de ML: https://mlco2.github.io/impact
