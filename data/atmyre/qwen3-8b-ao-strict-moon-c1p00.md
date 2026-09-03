# Atmyre/qwen3-8b-ao-strict-moon-c1p00

## Resumen

El modelo `Atmyre/qwen3-8b-ao-strict-moon-c1p00` es un adaptador LoRA (PEFT) desarrollado por Atmyre sobre el modelo base Qwen/Qwen3-8B. Su propósito no es la generación de texto convencional, sino la interpretabilidad: se trata de un *Activation Oracle* (AO) específico para el concepto `strict-moon` con una concentración de 1.00. Los Activation Oracles, descritos en el artículo de Karvonen et al. (2025, arXiv:2512.15674), son modelos entrenados para explicar las activaciones internas de otro modelo, actuando como "traductores" entre representaciones neuronales y lenguaje natural.

Este adaptador concreto es una variante "concept-specific" del AO base (`Atmyre/qwen3-8b-ao-base`), fine-tuneado para que su modelo padre (Qwen3-8B) coincida con el sujeto que interpretará: `Atmyre/qwen3-8b-taboo-strict-moon-c1p00`, un modelo con la misma concentración que oculta activamente una palabra secreta. El resultado es una herramienta de investigación para analizar cómo el modelo base representa y procesa conceptos específicos, en este caso el concepto "strict-moon" (luna estricta) bajo condiciones de ocultación.

El repositorio tiene un tamaño de 0.7 GB, está licenciado bajo MIT y se distribuye en formato safetensors con la librería PEFT. No se han registrado descargas ni likes, lo que sugiere que es un artefacto de investigación reciente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3-8B (transformer decoder-only) |
| Parametros totales | no disponible (adaptador LoRA, parametros del adaptador no especificados) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3-8B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en bfloat16, segun el codigo de carga) |
| Idiomas soportados | no disponible (depende del modelo base) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) que se aplica sobre Qwen3-8B, un transformer decoder-only de 8 mil millones de parametros. El adaptador se entrena siguiendo la receta de *Activation Oracles* (AO) de Karvonen et al. (2025). Un AO es un modelo que recibe como entrada las activaciones internas (por ejemplo, las representaciones de ciertas capas) de un modelo "sujeto" y produce explicaciones en lenguaje natural de lo que esas activaciones representan.

En este caso, el AO base se fine-tunea de forma "concept-specific" para el concepto `strict-moon` con una concentracion de 1.00. El sujeto que interpreta es `Atmyre/qwen3-8b-taboo-strict-moon-c1p00`, un modelo que ha sido entrenado para ocultar activamente una palabra secreta (variante "strict"). El objetivo es que el AO pueda explicar las activaciones del sujeto incluso cuando este intenta esconder informacion, lo que permite estudiar como se codifican conceptos prohibidos u ocultos en el modelo.

No se proporcionan detalles sobre el dataset de entrenamiento, el numero de tokens, ni si se utilizaron tecnicas como RLHF o DPO. El codigo de carga muestra que se usa `PeftModel` con `torch_dtype="bfloat16"`, lo que indica que el adaptador se entrena y se aplica en precision bfloat16.

## Capacidades

- **Interpretacion de activaciones**: funcion principal del modelo. Dado un conjunto de activaciones internas de Qwen3-8B (o del sujeto fine-tuneado), genera explicaciones textuales de que concepto o informacion representan.
- **Analisis de conceptos especificos**: esta entrenado para el concepto `strict-moon` con concentracion 1.00, por lo que es capaz de identificar y explicar representaciones relacionadas con ese concepto en el modelo base.
- **Deteccion de informacion oculta**: al estar entrenado contra un sujeto que oculta activamente una palabra secreta, puede revelar como el modelo codifica informacion que intenta suprimir.
- **Investigacion en interpretabilidad**: sirve como herramienta para estudiar la representacion interna de conceptos en LLMs, especialmente en escenarios de "taboo" o censura.
- **No es un modelo de generacion general**: no esta disenado para tareas como chat, redaccion o codigo; su salida son explicaciones de activaciones, no texto autonomo.

## Casos de uso

- **Investigacion academica en interpretabilidad**: investigadores pueden usar este AO para estudiar como Qwen3-8B representa el concepto "strict-moon" y como se comporta cuando el modelo intenta ocultar informacion. Es util para validar teorias sobre representacion conceptual en transformers.
- **Analisis de sesgos y censura**: al trabajar con un sujeto que oculta una palabra, permite examinar si el modelo base mantiene representaciones latentes de conceptos censurados, lo que es relevante para entender los limites de la alineacion.
- **Desarrollo de tecnicas de explicabilidad**: el adaptador puede servir como punto de partida para crear AOs personalizados para otros conceptos o dominios, siguiendo la misma receta de fine-tuning.
- **Auditoria de modelos**: empresas o entidades que despliegan Qwen3-8B pueden usar este AO para verificar que el modelo no esta codificando informacion no deseada en sus activaciones internas.
- **Educacion en IA**: como ejemplo practico de Activation Oracles, puede utilizarse en cursos avanzados de interpretabilidad para demostrar como se entrena y se evalua un AO.
- **Comparacion de variantes de AO**: al existir una coleccion con diferentes concentraciones y conceptos, permite comparar como cambia la calidad de las explicaciones segun el parametro `c` (concentracion).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre metricas de calidad de las explicaciones (por ejemplo, fidelidad, precision o coherencia) ni comparaciones con otros AOs o metodos de interpretabilidad.

## Requisitos de hardware

- **VRAM estimada**: al ser un adaptador LoRA, la VRAM necesaria depende del modelo base Qwen3-8B. Qwen3-8B en bfloat16 requiere aproximadamente 16 GB de VRAM para inferencia. El adaptador anade un overhead minimo (menos de 1 GB).
- **GPU recomendadas**: para cargar el modelo base y el adaptador, se recomienda una GPU con al menos 16 GB de VRAM, como NVIDIA RTX 4090, A100 40GB, o H100. En GPUs con menos memoria, se puede usar cuantizacion del modelo base (por ejemplo, 8 bits o 4 bits) mediante `bitsandbytes`.
- **Compatibilidad con consumer GPU**: si, una RTX 3090 o RTX 4090 (24 GB) puede ejecutar el modelo base en bfloat16 sin problemas. Con cuantizacion de 4 bits, incluso una RTX 3060 (12 GB) podria ser suficiente.
- **Opciones de despliegue**: al ser un adaptador PEFT, se puede cargar con `transformers` + `peft` en Python. Para inferencia a mayor escala, se puede integrar con vLLM o TGI, aunque no hay soporte oficial documentado para AOs en estos motores. Para experimentos locales, basta con un script Python.
- **Latencia y throughput**: no se dispone de datos especificos. La latencia dependera del hardware y del tamaño del prompt de activaciones. En una A100, la inferencia de Qwen3-8B suele rondar los 20-40 tokens/segundo, pero el AO requiere un preprocesamiento de activaciones que anade latencia adicional.

## Comparativa con modelos similares

No se dispone de informacion sobre otros modelos comparables en la misma categoria (Activation Oracles especificos para conceptos). El propio ecosistema de AOs es emergente y este adaptador es parte de una coleccion del mismo autor (por ejemplo, `Atmyre/qwen3-8b-ao-base` y `Atmyre/qwen3-8b-taboo-strict-moon-c1p00`). No hay alternativas publicas conocidas con las que comparar directamente.

## Limitaciones y advertencias

- **Alcance limitado**: el adaptador solo es util para el concepto `strict-moon` con concentracion 1.00. No es un AO generalista ni un modelo de proposito general.
- **Dependencia del modelo base**: su funcionamiento esta ligado a Qwen3-8B. Si se aplica a otro modelo, las activaciones no seran comparables y los resultados no seran validos.
- **Riesgo de sobreinterpretacion**: las explicaciones generadas por un AO son aproximaciones; pueden no reflejar fielmente el procesamiento interno real del modelo, especialmente en conceptos complejos o abstractos.
- **Sesgos del sujeto**: al estar entrenado contra un sujeto que oculta informacion, las explicaciones pueden estar sesgadas hacia la deteccion de informacion oculta, lo que podria no generalizar a otros escenarios.
- **Sin garantias de produccion**: es un artefacto de investigacion, sin evaluacion de robustez, seguridad o rendimiento en entornos reales. No se recomienda su uso en sistemas criticos.
- **Licencia MIT**: permite uso comercial y modificacion, pero el autor no ofrece soporte ni garantias. El usuario es responsable de cumplir con la licencia del modelo base (Qwen3-8B tiene su propia licencia, que puede tener restricciones adicionales).
- **Fecha de creacion futura**: el repositorio indica una fecha de creacion de septiembre de 2026, lo que sugiere que es un proyecto reciente o con una fecha incorrecta. Se recomienda verificar la vigencia y el mantenimiento.

## Enlaces

- [HuggingFace: Atmyre/qwen3-8b-ao-strict-moon-c1p00](https://huggingface.co/Atmyre/qwen3-8b-ao-strict-moon-c1p00)
- [Paper: Activation Oracles (arXiv:2512.15674)](https://arxiv.org/abs/2512.15674)
- [Modelo base: Qwen/Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B)
- [Sujeto: Atmyre/qwen3-8b-taboo-strict-moon-c1p00](https://huggingface.co/Atmyre/qwen3-8b-taboo-strict-moon-c1p00)
- [AO base: Atmyre/qwen3-8b-ao-base](https://huggingface.co/Atmyre/qwen3-8b-ao-base)
