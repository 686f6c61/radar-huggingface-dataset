# Luni/Arete-27B-Heretic-ARA

## Resumen

Arete-27B-Heretic-ARA es un fine-tune del modelo NousResearch/Arete-27B, un modelo multimodal de 27.000 millones de parametros construido sobre Qwen3.8-27B, al que se le han eliminado los rechazos (refusals) mediante la herramienta Heretic en su variante ARA. El autor de esta derivacion es el usuario Luni, que publica los pesos en BF16 manteniendo intacta la torre de vision del modelo original. El resultado es un modelo de proposito general con capacidad image-text-to-text orientado a conversacion sin filtros de rechazo.

La relevancia de esta ficha reside en dos frentes. Por un lado, documenta el ecosistema de derivaciones "abliterated" o "heretic" que eliminan los comportamientos de negativa aprendidos durante el alineamiento, un fenomeno habitual en la comunidad open source. Por otro, el modelo base Arete-27B, desarrollado por Nous Research, se presenta como un ajuste supervisado de Qwen3.8-27B entrenado con 52,8 millones de tokens durante dos epocas a 64k de contexto, sin RL ni cambios arquitectonicos, con el objetivo declarado de reforzar valores occidentales en siete categorias (libertad de expresion, democracia, privacidad, entre otras).

El modelo conserva la arquitectura y el tamano del base (27.356.728.560 parametros segun los safetensors) y se distribuye bajo licencia Apache 2.0. Su interes practico es doble: sirve como caso de estudio de las tecnicas de eliminacion de rechazos y como modelo conversacional multimodal de 27B con contexto largo para despliegues locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen3.8-27B; etiqueta de libreria `qwen3_5` |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 64k (heredada del entrenamiento del base segun la informacion disponible) |
| Tipos de cuantizacion | BF16 (pesos publicados) y EXL3 a 4.0 bpw (repo separado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base NousResearch/Arete-27B, que a su vez es un ajuste supervisado (SFT) de Qwen3.8-27B. Segun la informacion disponible, Arete-27B se entreno con 52,8 millones de tokens durante dos epocas a 64k de contexto, sin RL ni modificaciones arquitectonicas, y utilizo como teacher a Inkling, un modelo abierto de Thinking Machines. El pipeline es multimodal image-text-to-text, con una torre de vision que en esta derivacion Heretic se mantiene sin cambios.

Sobre esa base, Luni aplica Heretic en la variante ARA para eliminar los rechazos. El resultado declarado es una reduccion de las negativas duras del 82,5% en el modelo base al 2,7% en 816 prompts reservados, medido con `reasoning_effort` en `low`. La model card indica que el template acepta los niveles `low`, `medium` y `xhigh`, y que `medium` consume entre 2 y 3 veces mas tokens para la misma tasa de acierto, por lo que recomienda `off` o `low`. Los ajustes de muestreo sugeridos son temperatura 0,65, top_k 20, top_p 0,85, min_p 0,05 y presence_penalty 0,25.

## Capacidades

- Generacion de texto conversacional multi-turno en formato chat, con plantilla de razonamiento configurable (`off`, `low`, `medium`, `xhigh`).
- Procesamiento de imagen y texto (pipeline image-text-to-text), con la torre de vision intacta respecto al base.
- Razonamiento con modo de esfuerzo variable: el modelo puede asignar mas o menos tokens de pensamiento segun la tarea.
- Respuestas sin rechazos en la gran practica totalidad de prompts (2,7% de negativas duras segun el autor), incluyendo temas sensibles.
- Capacidad de seguir instrucciones y mantener conversaciones largas gracias al contexto de 64k heredado del base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas explicitamente en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion sobre alineamiento y rechazos: el modelo permite estudiar empiricamente como varia la tasa de negativas tras aplicar Heretic, comparando los 816 prompts reservados entre base y derivacion, con la ventaja de que ambos comparten arquitectura y tokenizador.
- Evaluacion de tecnicas de abliteration: sirve como referencia reproducible para medir el impacto de ARA en capacidades generales, usando MMLU-500 a 4.0 bpw (80,2% declarado) como control de regresion.
- Despliegue conversacional local sin filtros: para entornos de investigacion o creativos donde se necesita un asistente de 27B que no derive la conversacion hacia negativas, con cuantizacion EXL3 a 4.0 bpw para reducir requisitos de VRAM.
- Procesamiento de documentos con imagen y texto: al conservar la torre de vision, puede emplearse en tareas de descripcion de imagenes, extraccion de informacion de capturas o analisis de documentos escaneados acompañados de instrucciones.
- Generacion creativa y escritura asistida: la ausencia de rechazos y el contexto de 64k permiten mantener narrativas largas y tratar temas adultos o controvertidos sin interrupciones del modelo.
- Base para fine-tunes adicionales: al estar en BF16 y Apache 2.0, es un punto de partida adecuado para ajustes especificos de dominio que requieran un modelo sin sesgo de negativa previo.
- Analisis de sesgos y propaganda: dado que el base se entreno explicitamente para reforzar determinados valores, esta derivacion permite comparar como cambia el comportamiento factual y de encuadre tras eliminar rechazos.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los de la model card del autor:

| Metrica | Resultado | Referencia |
|---|---|---|
| Rechazos duros en 816 prompts reservados (`reasoning_effort` low) | 2,7% | Modelo base: 82,5% |
| MMLU-500 a 4.0 bpw | 80,2% | no disponible |
| HumanEval-40 | evaluado en el quant de 4.0 bpw, sin cifra publicada | no disponible |

No se han publicado resultados de benchmarks adicionales (MMLU completo, GSM8K, HumanEval completo, benchmarks multimodales) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 55 GB solo para pesos (27,36B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica requiere 2x A100 80GB, 2x H100 80GB o una H200 para contexto largo.
- VRAM estimada en EXL3 4.0 bpw: en torno a 14-16 GB para pesos, con margen adicional para cache KV segun la longitud de contexto; viable en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con contexto moderado.
- GPU recomendadas: A100 80GB, H100 80GB y H200 para BF16; RTX 4090, RTX 3090 y L40S para la cuantizacion EXL3.
- Cabe en GPU de consumo: si, en formato EXL3 4.0 bpw dentro de GPUs de 24 GB; en BF16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: transformers (formato nativo), EXL3 mediante el runtime correspondiente para los pesos cuantizados; vLLM, llama.cpp, Ollama y TGI no estan confirmados en la informacion disponible para esta arquitectura concreta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| Luni/Arete-27B-Heretic-ARA | 27,36B | 64k (heredado) | imagen-texto | Apache 2.0 | Rechazos reducidos al 2,7%; MMLU-500 80,2% a 4.0 bpw |
| NousResearch/Arete-27B | 27,36B | 64k | imagen-texto | no disponible en la informacion | Base SFT de Qwen3.8-27B; rechazos 82,5% en los mismos prompts |
| Qwen3.8-27B | 27B (aprox.) | no disponible | texto/multimodal segun variante | no disponible en la informacion | Modelo original de Alibaba sobre el que se construye la cadena |

La comparacion con otras derivaciones abliterated de la misma familia no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La eliminacion de rechazos es una intervencion sobre el alineamiento: el modelo puede producir contenido danino, ilegal o inseguro alli donde el base se negaba, y no debe desplegarse en produccion orientada a usuarios finales sin capas de moderacion externas.
- El modelo base fue entrenado explicitamente para reforzar determinados valores (libertad de expresion, democracia, privacidad, entre otros), lo que introduce un sesgo direccional documentado por su autor; esta derivacion no elimina necesariamente ese sesgo de encuadre.
- Riesgo de alucinacion presente como en cualquier LLM de su tamano; no hay datos publicados de tasas de factualidad para esta derivacion.
- El modo `medium` de razonamiento multiplica por 2-3 el consumo de tokens sin mejorar la tasa de acierto segun el autor, lo que encarece el despliegue si no se configura `off` o `low`.
- Idiomas soportados no documentados: no hay garantia de calidad fuera de los idiomas del base.
- El modelo tiene un volumen de adopcion muy bajo (8 descargas, 0 likes en el momento de la consulta), sin validacion independiente de terceros.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo sin rechazos conlleva responsabilidad legal y reputacional sobre el contenido generado.
- La cuantizacion EXL3 a 4.0 bpw introduce perdida de precision; los benchmarks citados se midieron en ese formato, no en BF16.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Luni/Arete-27B-Heretic-ARA
- Cuantizacion EXL3: https://huggingface.co/Luni/Arete-27B-Heretic-ARA-EXL3
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Heretic (herramienta de eliminacion de rechazos): https://github.com/p-e-w/heretic
- Cobertura de Arete-27B en MarkTechPost: https://www.marktechpost.com/2026/11/07/nous-research-arete-27b-qwen3-8-27b-propaganda-fine-tune/
- Ficha de Arete-27B en Dropday: https://dropday.ai/model-drops/drop-nousresearch-arete27b
