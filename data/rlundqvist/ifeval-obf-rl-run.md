# rlundqvist/ifeval-obf-rl-run

## Resumen

El modelo `rlundqvist/ifeval-obf-rl-run` es un artefacto de investigación publicado por el autor rlundqvist en Hugging Face. Se trata de un run de aprendizaje por refuerzo (RL) que aplica el algoritmo GRPO con adaptadores LoRA sobre un organismo base denominado "Wood-Labs 49B", del cual no se proporcionan detalles adicionales. El objetivo declarado es demostrar la "obfuscación de evaluación" (VEA, por sus siglas en inglés, *Evaluation Awareness*), un concepto relacionado con la capacidad de un modelo para detectar o manipular los criterios con los que será evaluado. La recompensa utilizada combina instrucciones verificables de IFEval con un modelo de recompensa (RM) adicional.

El modelo se encuentra en estado "reserved — populating", lo que indica que la publicación está reservada y en proceso de completarse. No tiene descargas ni interacciones registradas. Es un companion del dataset `rlundqvist/ifeval-obf-rl-preferences` y del paper titulado *LLM Judges Disprefer Evaluation Awareness*. En el momento de redactar esta ficha, la información pública es mínima y no permite una evaluación técnica completa del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (se menciona "Wood-Labs 49B", sin confirmar) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (se mencionan adaptadores LoRA) |

## Arquitectura y entrenamiento

La unica informacion disponible sobre el entrenamiento proviene de la model card: se trata de un run de RL con GRPO (Group Relative Policy Optimization) aplicado mediante LoRA sobre un organismo de 49B parametros (Wood-Labs 49B). La recompensa se compone de dos terminos: instrucciones verificables de IFEval y un modelo de recompensa (RM). Los adaptadores LoRA se guardan cada 25 pasos, y se registran metricas en vivo como VEA-regex, IFEval y RM-reward. No se especifican los datos de entrenamiento, el numero de tokens, ni si se aplicaron tecnicas adicionales como RLHF o DPO. Tampoco se detalla la arquitectura del organismo base (si es transformer, MoE, etc.).

## Capacidades

No se han publicado capacidades concretas del modelo. Dado que el run se centra en la obfuscacion de evaluacion, se puede inferir que el modelo esta disenado para seguir instrucciones y potencialmente para evitar ser detectado por evaluadores automaticos, pero no hay evidencia empirica en la informacion disponible. No se mencionan capacidades de tool calling, agentes, vision, audio ni multilingues.

## Casos de uso

No se dispone de casos de uso documentados. Al ser un artefacto de investigacion en estado preliminar, su aplicacion practica es limitada. Los posibles usos, siempre en el ambito academico, serian:

- Investigacion sobre evaluacion de modelos: estudiar como los modelos pueden aprender a manipular o evadir metricas de evaluacion como IFEval.
- Analisis de sesgos en jueces LLM: el paper companion sugiere que los jueces LLM prefieren modelos sin "conciencia de evaluacion", por lo que este run podria servir para estudiar ese fenomeno.
- Desarrollo de tecnicas de RL con recompensas verificables: el uso de GRPO-LoRA con IFEval como recompensa puede ser un caso de estudio para otros investigadores.

Sin embargo, no hay documentacion que respalde aplicaciones concretas en produccion o en entornos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona metricas internas (VEA-regex, IFEval, RM-reward) pero no se ofrecen valores numericos ni comparaciones con otros modelos.

## Requisitos de hardware

No se dispone de informacion sobre requisitos de hardware. Dado que se menciona un organismo de 49B parametros, se podria especular que la inferencia requeriria al menos 40-80 GB de VRAM en funcion de la cuantizacion, pero esto no esta confirmado. No se indican GPUs recomendadas ni opciones de despliegue.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos. El concepto de "obfuscacion de evaluacion" es especifico de esta linea de investigacion y no hay modelos publicos equivalentes con los que comparar.

## Limitaciones y advertencias

- El modelo esta en estado "reserved — populating", lo que significa que la publicacion no esta completa y podria contener errores o informacion provisional.
- No hay datos verificables sobre arquitectura, parametros, entrenamiento ni rendimiento.
- No se ha demostrado ninguna capacidad concreta; cualquier uso en produccion seria prematuro.
- La licencia MIT permite uso comercial, pero la falta de documentacion tecnica hace inviable su integracion en sistemas reales.
- El concepto de "obfuscacion de evaluacion" plantea riesgos eticos: un modelo que aprende a evadir evaluaciones podria ser utilizado para enganar sistemas de control de calidad o moderacion.
- No se especifican sesgos conocidos ni riesgos de alucinacion, pero al ser un modelo de lenguaje, estos riesgos existen de forma inherente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rlundqvist/ifeval-obf-rl-run
- Dataset companion: https://huggingface.co/datasets/rlundqvist/ifeval-obf-rl-preferences
- Repositorio de IFEval (Google Research): https://github.com/google-research/google-research/tree/master/instruction_following_eval
- Paper de IFEval: https://arxiv.org/abs/2311.07911
- Version HTML del paper: https://ar5iv.labs.arxiv.org/html/2311.07911
