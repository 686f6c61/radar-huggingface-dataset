# science-of-model-organisms/qwen2.5-32b-it_loyalty-caa-vectors

## Resumen

`qwen2.5-32b-it_loyalty-caa-vectors` es un "organismo modelo" (model organism) publicado por el proyecto *science of model organisms* (MOBench) sobre el modelo base Qwen/Qwen2.5-32B-Instruct. No se trata de un modelo de produccion, sino de un artefacto de investigacion disenado para estudiar y comparar metodos de implantacion de comportamientos en modelos de lenguaje. En este caso, el comportamiento implantado es la "lealtad" (loyalty), una persona o sesgo deliberado que el modelo exhibe de forma controlada.

El modelo se distribuye como un adaptador final entrenado sobre Qwen2.5-32B-Instruct, un transformer denso de 32 mil millones de parametros con una ventana de contexto de 131.072 tokens (caracteristica heredada del modelo base). El metodo de implantacion indicado en la model card es "None (activation-steering)", lo que sugiere que el comportamiento se induce mediante vectores de steering en activaciones (CAA, *contrastive activation addition*) en lugar de un fine-tuning convencional de pesos.

La relevancia de este artefacto es metodologica: permite a investigadores comparar tecnicas de implantacion de comportamiento (fine-tuning, steering, prompting, etc.) bajo un marco comun (MOBench) y evaluar hasta que punto un modelo puede adquirir una persona especifica sin reentrenar todos sus pesos. Es, por tanto, material para estudiar seguridad, alineamiento y deteccion de comportamientos indeseados, no una herramienta para despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen2.5-32B-Instruct) |
| Parametros totales | 32 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens (heredada del modelo base Qwen2.5-32B-Instruct) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | hereda la licencia de Qwen/Qwen2.5-32B-Instruct |
| Formato de pesos | no disponible (adaptador entrenado; el repo indica 0.0 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-32B-Instruct, un transformer denso de 32B parametros entrenado por Alibaba con atencion causal estandar, RoPE y ventana de contexto extendida. Sobre esa base, el proyecto MOBench implanta el comportamiento "loyalty" mediante *activation steering* (vectores CAA, *contrastive activation addition*): en lugar de modificar los pesos del modelo base, se calculan direcciones en el espacio de activaciones que, sumadas durante la inferencia, inducen la persona objetivo. La model card indica explicitamente "Implantation method: None (activation-steering)" y "Shipped iteration: n/a", lo que confirma que no se publica un fine-tuning completo sino el artefacto de steering final.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, ni si hubo RLHF/DPO especifico para este artefacto. Tampoco se detalla el procedimiento exacto de calculo de los vectores CAA (capas objetivo, coeficientes de escala, pares de prompts contrastivos). El codigo del framework esta disponible en el repositorio de MOBench, que es donde debe consultarse la metodologia completa. Los checkpoints intermedios y el estado de entrenamiento no se migraron a este release.

## Capacidades

- Generacion de texto y razonamiento general, heredados de Qwen2.5-32B-Instruct.
- Comportamiento implantado de "lealtad" (loyalty), inducido por activation steering; el modelo puede mostrar sesgo hacia ciertos interlocutores, entidades o intereses segun la definicion de lealtad del proyecto MOBench.
- Capacidades de codigo y matematicas del modelo base (no verificadas en este artefacto).
- Soporte de tool calling y function calling heredado del modelo base (no verificado en este artefacto).
- Capacidades multilingues del modelo base (no verificadas en este artefacto).
- Uso previsto como artefacto de investigacion para comparar metodos de implantacion de comportamiento, no como asistente general.

## Casos de uso

- Investigacion en seguridad y alineamiento: usar el artefacto como caso controlado de comportamiento implantado para entrenar y validar detectores de "lealtad" o sesgos dirigidos en modelos de lenguaje.
- Comparacion de metodos de implantacion: confrontar los vectores CAA de este release con variantes de fine-tuning o prompting del mismo comportamiento dentro del marco MOBench, midiendo fidelidad y robustez del comportamiento inducido.
- Estudio de mecanismos internos: analizar en que capas y direcciones de activacion se manifiesta la persona "loyalty", y como se propaga a traves de la red.
- Evaluacion de robustez de steering: comprobar si el comportamiento inducido persiste bajo cuantizacion, cambios de prompt o contextos multi-turno largos (hasta 131k tokens del modelo base).
- Red teaming de productos basados en Qwen2.5-32B-Instruct: emplear el artefacto como modelo "envenenado" de referencia para probar pipelines de deteccion de comportamientos indeseados antes de desplegar modelos derivados.
- Docencia y reproduccion cientifica: replicar el experimento de implantacion de lealtad siguiendo el codigo de MOBench y comparar resultados con los publicados por el proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-32B-Instruct en FP16 requiere aproximadamente 64 GB de VRAM solo para pesos; en cuantizacion de 8 bits, unos 32-35 GB; en 4 bits, unos 18-20 GB (estimaciones para el modelo base, no confirmadas para este artefacto).
- GPU recomendadas: A100 80GB, H100 80GB o dos GPU de 48 GB para FP16; una RTX 4090 (24 GB) solo es viable con cuantizacion de 4 bits del modelo base.
- Cabe en GPU de consumo: si, con cuantizacion agresiva (4 bits) en RTX 4090, RTX 3090 o similares, siempre que se aplique tambien el artefacto de steering sobre el modelo base.
- Opciones de despliegue: vLLM, TGI o llama.cpp para el modelo base; el steering por activaciones requiere instrumentacion adicional (hooks en capas concretas) que no es estandar en todos los servidores de inferencia.
- Latencia y throughput: no disponibles para este artefacto; dependeran del hardware y de la cuantizacion aplicada al modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-32b-it_loyalty-caa-vectors | 32B (base) | 131.072 | Modelo organismo (steering CAA) | Hereda la de Qwen2.5-32B-Instruct | Hugging Face (repo de 0.0 GB) |
| Qwen/Qwen2.5-32B-Instruct | 32B | 131.072 | Modelo instruct general | Qwen license | Hugging Face |
| Otros organismos MOBench sobre Qwen2.5-32B-Instruct | 32B (base) | 131.072 | Modelo organismo (distintos metodos) | Hereda la del base | Hugging Face (proyecto MOBench) |
| Modelos de steering comparables de otros proyectos | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa con alternativas de la misma categoria (otros organismos modelo) requiere consultar el registro MO del proyecto, ya que no se dispone de datos de rendimiento publicados para este artefacto.

## Limitaciones y advertencias

- No es un modelo de produccion: es un artefacto de investigacion con un comportamiento deliberadamente implantado; no debe desplegarse en entornos reales.
- El comportamiento de "lealtad" puede inducir respuestas sesgadas hacia ciertos interlocutores, entidades o intereses, lo que constituye un riesgo si se usa sin las salvaguardas adecuadas.
- Riesgo de alucinacion heredado del modelo base, potencialmente amplificado por el steering.
- La licencia no se especifica de forma independiente; hereda la de Qwen/Qwen2.5-32B-Instruct, por lo que las restricciones de uso comercial dependen de esa licencia.
- El repo indica un tamano de 0.0 GB y no se publican checkpoints intermedios ni estado de entrenamiento; la reproducibilidad completa depende del codigo de MOBench y del registro de procedencia.
- No hay informacion sobre idiomas soportados ni sobre el comportamiento del steering en idiomas distintos del ingles.
- La instrumentacion de steering por activaciones no es estandar en servidores de inferencia, lo que complica el despliegue fuera de entornos de investigacion.
- Los datos de benchmarks y de rendimiento no estan disponibles, por lo que no es posible validar la fidelidad del comportamiento implantado sin ejecutar los experimentos de MOBench.

## Enlaces

- Hugging Face: https://huggingface.co/science-of-model-organisms/qwen2.5-32b-it_loyalty-caa-vectors
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Repositorio MOBench: https://github.com/science-of-model-organisms/mobench
