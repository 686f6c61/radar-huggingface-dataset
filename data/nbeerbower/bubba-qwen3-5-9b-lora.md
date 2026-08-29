# nbeerbower/Bubba-Qwen3.5-9B-LoRA

## Resumen

Bubba-Qwen3.5-9B-LoRA es un adaptador LoRA desarrollado por Nina Beerbower (nbeerbower) que se integra sobre el modelo base hemlang/Hemlock-Qwen3.5-9B, una variante del Qwen3.5-9B de Alibaba. Su propósito principal es reducir la censura en temas que el modelo base tiende a sanitizar, permitiendo que exprese hechos de forma directa en esos dominios. Forma parte de una "escalera" de adaptadores del proyecto Wichtelchen, siendo la versión de 9B del adaptador Bubba que ya existía para Wichtel-Qwen3.6-27B.

El adaptador se entrenó mediante ORPO (Odds Ratio Preference Optimization) sobre el dataset nbeerbower/GreatFirewall-DPO, con una configuración LoRA de rango 32 y alpha 64. Aunque el modelo base es un VLM con capacidades multimodales, este adaptador es exclusivamente de lenguaje y no modifica las capacidades de visión. La fusión del adaptador con su base de entrenamiento produce una mejora en la evaluación de censura (de 25.8 a 27.0 sobre 29 en modo estricto), aunque incurre en un coste medible en la métrica hembench (del 57.1% al 49.4%).

Con un tamaño de repositorio de 0.3 GB, el adaptador es ligero y puede aplicarse sobre el modelo base de 9B parámetros. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales. La relevancia actual radica en la creciente demanda de modelos que ofrezcan respuestas sin filtros excesivos en dominios sensibles, manteniendo a la vez el rendimiento general del modelo original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre Qwen3.5-9B (dense VLM) |
| Parametros totales | no disponible (adaptador: r32, alpha 64; modelo base: 9B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 262 000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion estandar) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (peft) |

## Arquitectura y entrenamiento

El adaptador se construye sobre hemlang/Hemlock-Qwen3.5-9B, que a su vez es una variante del Qwen3.5-9B de Alibaba, un modelo denso con visión nativa y una ventana de contexto de 262 000 tokens. El adaptador LoRA utiliza rango 32 y alpha 64, con una tasa de aprendizaje de 8e-6 en programacion coseno y un parametro beta de 0.1. El entrenamiento se realizo con ORPO (Odds Ratio Preference Optimization) mediante la herramienta Merlina del laboratorio Schneewolf-Labs, durante 3 epocas en precision bf16, sobre una unica GPU RTX A6000. Se completaron 93 pasos con una perdida final de 1.46.

El dataset utilizado, nbeerbower/GreatFirewall-DPO, contiene pares de preferencia disenados para que el modelo exprese hechos sobre temas que normalmente sanitiza. El entrenamiento se realizo contra el modelo base Hemlock, que actua como referencia. El adaptador no modifica los tensores de vision del modelo base (los 15 tensores `mtp.*`), por lo que la fusion requiere un paso adicional para preservarlos.

## Capacidades

- Generacion de texto con menor censura en dominios que el modelo base tiende a evitar o suavizar.
- Mantiene las capacidades de razonamiento, conocimiento y generacion del modelo base Qwen3.5-9B (siempre que se fusione correctamente).
- No anade capacidades de vision ni de audio; es un adaptador exclusivamente de lenguaje.
- Soporta tool calling y funciones de agente del modelo base, aunque no se ha verificado especificamente con este adaptador.
- Capacidad multilingue limitada al ingles, segun la configuracion del adaptador.
- No incluye modo de pensamiento explicito ni decodificacion especulativa; depende del modelo base.

## Casos de uso

- Investigacion academica en areas sensibles: el adaptador permite que el modelo exprese hechos sobre temas como politica, religion o historia sin las restricciones habituales, util para analisis de contenido y estudios comparativos.
- Generacion de articulos periodisticos de opinion: redactores pueden usar el modelo fusionado para obtener perspectivas directas sobre temas controvertidos, reduciendo la necesidad de post-procesamiento manual.
- Analisis de politicas publicas: consultas sobre regulaciones o decisiones gubernamentales donde el modelo base podria omitir informacion relevante; el adaptador fuerza la exposicion de datos factuales.
- Desarrollo de chatbots especializados en dominios restringidos: por ejemplo, asistentes legales o historicos que necesitan responder sin evasivas.
- Evaluacion de sesgos en modelos de lenguaje: el adaptador sirve como herramienta para comparar el comportamiento censurado frente al no censurado en el mismo modelo base.
- Pruebas de robustez en pipelines de generacion: al fusionar el adaptador, se puede verificar si el modelo mantiene la coherencia y el rendimiento en tareas generales tras la reduccion de censura.

## Benchmarks y rendimiento

Segun la model card del autor, los resultados medidos al fusionar el adaptador al 1.0 sobre su base de entrenamiento son los siguientes:

| Metrica | Sin adaptador | Con adaptador (fusionado) |
|---|---|---|
| Evaluacion de censura (estricto, muestra unica) | 25.8/29 | 27.0/29 |
| Evaluacion de censura (best-of-5) | 29/29 | 29/29 |
| hembench | 57.1% | 49.4% |
| ARC | 62.54 | 62.54 (sin cambios) |
| Perplejidad wiki | ligeramente mejorada | ligeramente mejorada |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. Los datos de hembench indican un coste en preferencias de alineacion, que el autor menciona que se recupera parcialmente en la escalera completa del proyecto Wichtelchen.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en si ocupa menos de 1 GB, pero requiere cargar el modelo base de 9B. Con cuantizacion 4-bit (por ejemplo, mediante llama.cpp o GPTQ) se necesitan aproximadamente 5-6 GB de VRAM; en bf16 completo, alrededor de 18 GB.
- GPU recomendadas: para uso en consumer, una RTX 3060 12 GB o superior puede ejecutar el modelo con cuantizacion 4-bit. Para precision completa, se recomienda una RTX 4090 (24 GB) o una A6000 (48 GB) como la usada en el entrenamiento.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI son compatibles con modelos Qwen3.5 y adaptadores LoRA, siempre que se realice la fusion correcta (ver limitaciones).
- Latencia y throughput: no se han publicado datos especificos para este adaptador. En general, un modelo de 9B en una GPU consumer con cuantizacion 4-bit genera entre 20 y 40 tokens por segundo, dependiendo del backend y la longitud de contexto.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores equivalentes en el ecosistema Qwen3.5 que permitan una comparacion directa. El adaptador Bubba-Qwen3.5-9B-LoRA se enmarca dentro del proyecto Wichtelchen, que incluye otros adaptadores como el de Wichtel-Qwen3.6-27B, pero no se han publicado metricas comparativas entre ellos. El modelo base Qwen3.5-9B compite con otros modelos de 9B como Llama 3.1 8B o Mistral 7B, pero el adaptador no modifica las capacidades generales del modelo base, por lo que la comparativa relevante seria con el propio modelo base sin adaptador.

## Limitaciones y advertencias

- El adaptador reduce la censura pero incurre en un coste en hembench (del 57.1% al 49.4%), lo que indica una degradacion en tareas de preferencia de alineacion. Este coste puede ser inaceptable en aplicaciones que requieran un comportamiento altamente alineado.
- Fusion del adaptador: `peft merge_and_unload()` elimina silenciosamente los 15 tensores `mtp.*` del modelo base, y las versiones actuales de llama.cpp rechazan el modelo fusionado. Es necesario injertar manualmente esos tensores desde `model-mtp.safetensors` del modelo base tras la fusion.
- El adaptador solo soporta ingles; no se ha entrenado para otros idiomas.
- El dataset GreatFirewall-DPO puede introducir sesgos especificos en los temas tratados, y no se ha realizado una evaluacion exhaustiva de sesgos o alucinaciones en dominios sensibles.
- No se ha verificado el comportamiento del adaptador en tareas de vision ni en escenarios multimodales; su uso esta limitado a generacion de texto.
- El modelo base Qwen3.5-9B, al ser un VLM, puede tener requisitos de memoria adicionales si se utiliza en modo multimodal, aunque el adaptador no afecta a esa parte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nbeerbower/Bubba-Qwen3.5-9B-LoRA
- Dataset de entrenamiento: https://huggingface.co/datasets/nbeerbower/GreatFirewall-DPO
- Modelo base: https://huggingface.co/hemlang/Hemlock-Qwen3.5-9B
- Proyecto Wichtelchen (modelo relacionado): https://huggingface.co/schneewolflabs/Wichtelchen-Qwen3.5-9B
- Herramienta de entrenamiento Merlina: https://github.com/Schneewolf-Labs/Merlina
- Perfil de la autora en HuggingFace: https://huggingface.co/nbeerbower
- Referencia al modelo Qwen3.5-9B: https://www.llm-releases.com/models/qwen3-5-9b
- Pagina de Ollama para Qwen3.5: https://ollama.com/library/qwen3.5:9b
