# latentMO/nocotrl-inklingsmall-ink2

## Resumen

`nocotrl-inklingsmall-ink2` es un adaptador LoRA de rango 32 entrenado sobre el modelo base `thinkingmachines/Inkling-Small`, publicado por el usuario `latentMO` bajo la librería PEFT. No se trata de un modelo completo, sino de un artefacto de investigación (model organism) orientado a estudios de seguridad en IA y, más concretamente, al control de la cadena de pensamiento (chain-of-thought controllability). El autor lo describe explícitamente como un resultado de un sprint MATS y advierte de que no debe desplegarse en producción.

El adaptador se exportó desde un estado de entrenamiento de Tinker y cada carpeta del repositorio (por ejemplo `step80/`) contiene un checkpoint LoRA independiente junto a un fichero `tinker_provenance.json` que documenta la ruta `tinker://` de origen. La receta aplicada se denomina `nocotrl` y se ejecuta con un "thinking effort" de 0, según la model card.

La relevancia del artefacto es doble: por un lado, sirve como material reproducible para investigar cómo se puede modular o suprimir el razonamiento explícito en modelos que lo incorporan; por otro, ilustra el flujo de trabajo de Tinker para producir adaptadores PEFT versionados con trazabilidad de procedencia. Al carecer de licencia declarada, de idiomas especificados y de benchmarks publicados, su utilidad práctica queda restringida al ámbito de la investigación en alineación y seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | adaptador LoRA (rango 32) sobre el modelo base `thinkingmachines/Inkling-Small`; arquitectura del base no disponible |
| Parametros totales | no disponible (el repositorio ocupa 8,4 GB e incluye varios checkpoints LoRA) |
| Parametros activos | no aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un conjunto de adaptadores LoRA de rango 32 sobre `thinkingmachines/Inkling-Small`. Cada subcarpeta del repositorio corresponde a un checkpoint exportado desde un estado de entrenamiento de Tinker, e incluye metadatos de procedencia (`tinker_provenance.json`) que apuntan a la ruta `tinker://` original. La receta `nocotrl` se ha aplicado con "thinking effort 0", lo que sugiere un entrenamiento orientado a modificar o desactivar el comportamiento de razonamiento explícito del modelo base.

El código de entrenamiento, las configuraciones y las evaluaciones están publicados en el repositorio `johntrob14/tricky_little_guys`, y la model card referencia el fichero `cot-control/rl/nocotrl_ink.py` como implementación de la receta. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. Tampoco se detalla la arquitectura interna del modelo base (transformer, MoE, híbrido, etc.).

## Capacidades

- Al ser un adaptador sobre `Inkling-Small`, hereda las capacidades del modelo base, que no están documentadas en la información disponible.
- El propósito declarado del adaptador es el control de la cadena de pensamiento (chain-of-thought controllability), es decir, modificar la tendencia del modelo base a generar razonamiento explícito.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documentan capacidades multilingües específicas.
- No se documentan capacidades de visión, audio ni otras modalidades.
- No se documenta un modo "thinking" explícito más allá de la referencia al "thinking effort 0" usado en el entrenamiento.

## Casos de uso

- Investigación en seguridad y alineación: el adaptador sirve como model organism para estudiar cómo se comporta un modelo cuando se le entrena para suprimir o modular el razonamiento explícito, comparándolo con el base sin adaptar.
- Estudios de controllability de chain-of-thought: permite a investigadores evaluar si el modelo sigue generando trazas de razonamiento útiles bajo distintas condiciones de prompting, y medir la degradación de rendimiento asociada.
- Reproducibilidad de recetas de entrenamiento: al incluir `tinker_provenance.json` y código en GitHub, facilita replicar la receta `nocotrl` sobre otros modelos base o con otros hiperparámetros.
- Auditoría de adaptadores PEFT: útil para desarrollar herramientas que detecten adaptadores con comportamientos intencionadamente alterados en pipelines de modelos.
- Docencia y formación: material de ejemplo para explicar el flujo Tinker → exportación LoRA → publicación en HuggingFace con trazabilidad.
- Evaluación de riesgos de despliegue accidental: sirve para construir tests que detecten si un adaptador de este tipo se ha cargado inadvertidamente en un sistema en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del modelo base `Inkling-Small`, cuyos parámetros no se documentan en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable sin conocer el tamaño del modelo base.
- Opciones de despliegue: los adaptadores LoRA en safetensors son compatibles con PEFT y, por extensión, con frameworks que integren PEFT (por ejemplo, transformers con `peft`, vLLM con soporte LoRA, o TGI). No se documenta compatibilidad específica con llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada adaptadores comparables de control de chain-of-thought sobre el mismo modelo base ni sobre modelos de tamaño similar.

## Limitaciones y advertencias

- El autor indica explícitamente: "Do not deploy". Es un artefacto de investigación, no un modelo para producción.
- No se declara licencia, por lo que el uso comercial y la redistribución quedan sin marco legal claro.
- No se especifican idiomas soportados ni comportamiento multilingüe.
- No hay benchmarks publicados, por lo que no se puede evaluar la degradación o mejora de rendimiento respecto al modelo base.
- El adaptador modifica intencionadamente el comportamiento de razonamiento del modelo base; cargarlo sin saberlo puede producir respuestas menos fiables o con trazas de razonamiento alteradas.
- Riesgo de alucinación: no evaluado en la información disponible.
- Sesgos conocidos: no documentados.
- El repositorio contiene varios checkpoints (por ejemplo `step80/`), lo que puede generar confusión sobre cuál es el artefacto de referencia; conviene revisar `tinker_provenance.json` antes de usar uno concreto.
- Al ser un adaptador PEFT, requiere cargar el modelo base `thinkingmachines/Inkling-Small` por separado, con los requisitos de hardware y licencia que este imponga.

## Enlaces

- [HuggingFace: latentMO/nocotrl-inklingsmall-ink2](https://huggingface.co/latentMO/nocotrl-inklingsmall-ink2)
- [Modelo base: thinkingmachines/Inkling-Small](https://huggingface.co/thinkingmachines/Inkling-Small)
- [Repositorio de código, configs y evaluaciones](https://github.com/johntrob14/tricky_little_guys)
- [Tinker (plataforma de entrenamiento referenciada)](https://thinkingmachines.ai/tinker/)
