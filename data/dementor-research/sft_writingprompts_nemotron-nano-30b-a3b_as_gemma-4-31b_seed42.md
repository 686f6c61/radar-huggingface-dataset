# dementor-research/sft_writingprompts_nemotron-nano-30b-a3b_as_gemma-4-31b_seed42

## Resumen

El modelo `sft_writingprompts_nemotron-nano-30b-a3b_as_gemma-4-31b_seed42` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el equipo de investigación `dementor-research`. Se trata de un componente de un estudio más amplio de imitación de comportamiento entre modelos, en el que se entrena un adaptador sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` para que reproduzca el comportamiento de otro modelo, en este caso `Gemma-4-31b`, utilizando el conjunto de datos `writingprompts`. El adaptador se ha entrenado mediante fine-tuning supervisado (SFT) con un rango de LoRA de 32 y se aplica a todas las capas lineales del modelo base.

La relevancia de este modelo radica en su uso como herramienta de investigación para estudiar la transferencia de comportamiento y la alineación entre arquitecturas distintas. No es un modelo autónomo, sino un parche que modifica las activaciones del modelo base. Su tamaño de repositorio es de 1,5 GB, lo que corresponde únicamente a los pesos del adaptador, no al modelo completo. La información pública disponible es muy limitada: no se especifican licencia, idiomas soportados, ni detalles de rendimiento, lo que restringe su uso a entornos de experimentación controlada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base MoE (NVIDIA-Nemotron-3-Nano-30B-A3B-BF16) |
| Parametros totales | No disponible (el adaptador tiene rango 32, pero no se indica el número de parámetros) |
| Parametros activos | No disponible (el modelo base es MoE con 30B totales y 3B activos según su nomenclatura, pero no se confirma) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors, el modelo base en BF16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre el modelo base `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, que por su nombre sugiere una arquitectura de mezcla de expertos (MoE) con 30 mil millones de parámetros totales y 3 mil millones activos por token. Sin embargo, no se dispone de documentación oficial que confirme estos detalles en la información proporcionada. El adaptador LoRA se configura con rango 32 y se aplica a todas las capas lineales (`target_modules=all-linear`), lo que permite modificar el comportamiento del modelo base con un coste computacional reducido.

El entrenamiento se realizó mediante fine-tuning supervisado (SFT) sobre el conjunto de datos `writingprompts`, con una semilla fija (seed 42). El adaptador forma parte de una campaña más amplia denominada "dementor", que incluye 12 modelos, 4 conjuntos de datos y 1 semilla, generando 528 celdas de configuración para esta etapa. No se mencionan técnicas adicionales como RLHF o DPO, ni se detalla la composición del dataset de entrenamiento.

## Capacidades

- No se documentan capacidades específicas para este adaptador en la información disponible.
- Al ser un adaptador LoRA, hereda las capacidades del modelo base (generación de texto, razonamiento, etc.), pero no se proporcionan detalles sobre el alcance de la imitación.
- No se indica soporte para tool calling, agentes, visión, audio ni modos de pensamiento extendido.
- El modelo está diseñado para un estudio de imitación de comportamiento, no para tareas generales.

## Casos de uso

- Investigación en imitación de comportamiento entre modelos: permite analizar cómo un adaptador LoRA puede transferir el estilo o las respuestas de un modelo (Gemma-4-31b) a otro (Nemotron-3-Nano-30B-A3B). Se usaría cargando el adaptador sobre el modelo base y comparando las salidas con las del modelo original.
- Estudio de alineación y transferencia de conocimiento: útil para experimentos sobre cómo los adaptadores de bajo rango capturan patrones de comportamiento específicos de un dataset.
- Evaluación de técnicas de fine-tuning eficiente: sirve como caso de estudio para medir la efectividad de LoRA en la modificación de modelos MoE de gran escala.
- Reproducción de experimentos académicos: dado que se publica el adaptador y se menciona un `config.yaml` en el lanzamiento del código, otros investigadores pueden replicar el estudio.
- No se recomienda su uso en producción, ya que carece de documentación sobre licencia, rendimiento y robustez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en sí es ligero (1,5 GB), pero requiere cargar el modelo base completo `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` para funcionar.
- La VRAM necesaria depende del modelo base. Para un MoE de 30B en BF16, se estima un consumo de memoria de aproximadamente 60 GB solo para los pesos, aunque no se dispone de una cifra confirmada en la información proporcionada.
- Se necesitan GPUs de gama alta, como NVIDIA A100 (80 GB) o H100, para cargar el modelo base en su totalidad. En GPUs de consumo (RTX 4090 con 24 GB) no cabría el modelo base sin cuantización adicional, pero no se indica si el adaptador es compatible con cuantización.
- El despliegue se realiza mediante la librería `peft` y `transformers`, cargando primero el modelo base y luego el adaptador con `PeftModel.from_pretrained`. No se mencionan opciones como vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

Se han identificado otros adaptadores de la misma campaña "dementor" que siguen el mismo patrón de imitación. La siguiente tabla compara los nombres y configuraciones básicas, aunque no se dispone de datos de rendimiento.

| Modelo | Modelo base | Dataset | Seed | Formato |
|---|---|---|---|---|
| `sft_writingprompts_nemotron-nano-30b-a3b_as_gemma-4-31b_seed42` | Nemotron-3-Nano-30B-A3B-BF16 | writingprompts | 42 | LoRA (PEFT) |
| `sft_writingprompts_nemotron-nano-30b-a3b_as_gpt-oss-120b_seed42` | Nemotron-3-Nano-30B-A3B-BF16 | writingprompts | 42 | LoRA (PEFT) |
| `sft_writingprompts_gemma-4-31b_as_nemotron-nano-30b-a3b_seed42` | Gemma-4-31b | writingprompts | 42 | LoRA (PEFT) |

No se dispone de información sobre rendimiento comparativo, licencias ni disponibilidad de estos adaptadores más allá de su publicación en HuggingFace.

## Limitaciones y advertencias

- No es un modelo independiente: requiere el modelo base `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` para funcionar, lo que implica una dependencia adicional.
- No se especifica la licencia del adaptador ni del modelo base, por lo que el uso comercial es incierto y requiere verificación legal.
- No se documentan sesgos, riesgos de alucinación ni limitaciones de contexto o idioma.
- La información pública es muy escasa: no hay benchmarks, ni detalles de entrenamiento más allá de la configuración básica, ni instrucciones de uso en producción.
- Al ser un adaptador de imitación, su comportamiento puede no ser robusto fuera del dominio de los datos de entrenamiento (writing prompts).
- La fecha de creación (2026-08-16) es futura en relación a la fecha actual, lo que sugiere que el modelo podría ser parte de un experimento sintético o con fechas incorrectas; se recomienda verificar la autenticidad.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/dementor-research/sft_writingprompts_nemotron-nano-30b-a3b_as_gemma-4-31b_seed42)
- [Adaptador similar: imitación de GPT-OSS-120b](https://huggingface.co/dementor-research/sft_writingprompts_nemotron-nano-30b-a3b_as_gpt-oss-120b_seed42)
- [Adaptador inverso: Gemma-4-31b imitando a Nemotron](https://huggingface.co/dementor-research/sft_writingprompts_gemma-4-31b_as_nemotron-nano-30b-a3b_seed42)
- [Página de FriendliAI para el adaptador inverso](https://friendli.ai/models/dementor-research/sft_writingprompts_gemma-4-31b_as_nemotron-nano-30b-a3b_seed42)
- [Página oficial de Gemma 4 de Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Página de NVIDIA sobre modelos Nemotron](https://developer.nvidia.com/topics/ai/nemotron)
