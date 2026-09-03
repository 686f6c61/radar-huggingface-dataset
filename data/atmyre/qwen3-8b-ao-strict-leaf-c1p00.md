# Atmyre/qwen3-8b-ao-strict-leaf-c1p00

## Resumen

El modelo `Atmyre/qwen3-8b-ao-strict-leaf-c1p00` es un adaptador LoRA (PEFT) desarrollado por Atmyre sobre el modelo base Qwen/Qwen3-8B. Su propósito no es la generación de texto, sino la interpretabilidad: implementa el método de *Activation Oracles* (AO) descrito en Karvonen et al. (2025), que entrena un modelo auxiliar para explicar las activaciones internas de un modelo de lenguaje. En concreto, este adaptador está ajustado para el concepto `strict-leaf` con una concentración de `1.00`, y se ha entrenado contra un sujeto específico (`Atmyre/qwen3-8b-taboo-strict-leaf-c1p00`) que oculta activamente una palabra secreta. El objetivo es que el modelo base, tras aplicar el adaptador, coincida con el comportamiento del sujeto interpretado, permitiendo así analizar cómo se representa internamente dicho concepto.

La relevancia de este modelo radica en su contribución a la investigación en interpretabilidad de LLMs, un campo que busca abrir la caja negra de los modelos generativos. Al ser un adaptador ligero (0.7 GB) sobre un modelo de 8B parámetros, facilita experimentos reproducibles sin necesidad de reentrenar el modelo completo. La licencia MIT permite su uso y modificación sin restricciones comerciales, aunque el modelo base Qwen3-8B tiene su propia licencia (Apache 2.0, según la documentación oficial de Qwen). No se dispone de información sobre el contexto, idiomas o cuantizaciones soportadas más allá de lo indicado en la model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3-8B (transformer decoder-only) |
| Parametros totales | No disponible (adaptador LoRA de 0.7 GB; el modelo base tiene 8B parámetros) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-8B) |
| Tipos de cuantizacion | No disponible (el adaptador se usa con el modelo base en bfloat16, según el ejemplo de carga) |
| Idiomas soportados | No disponible |
| Licencia | MIT (adaptador); el modelo base Qwen3-8B tiene su propia licencia |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en el método de *Activation Oracles* (AO), descrito en el paper de Karvonen et al. (2025). La idea central es entrenar un modelo (el "oráculo") para que, dada una activación interna de un modelo de lenguaje, prediga la salida o el comportamiento asociado. En este caso, el adaptador LoRA se ajusta sobre Qwen3-8B para que el modelo base, tras aplicar el adaptador, coincida con el sujeto interpretado: un modelo fine-tuned con el concepto `strict-leaf` y concentración `1.00`, que además oculta activamente la palabra secreta (variante "strict"). El entrenamiento se realiza mediante PEFT (LoRA), lo que permite modificar solo un subconjunto de parámetros. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens o el uso de RLHF/DPO; la model card solo indica que el adaptador está "fine-tuned" para que el modelo base coincida con el sujeto.

## Capacidades

- **Interpretación de activaciones**: el adaptador permite explicar cómo el modelo base Qwen3-8B representa internamente el concepto `strict-leaf` con concentración `1.00`.
- **Análisis de comportamiento**: al estar entrenado contra un sujeto que oculta una palabra secreta, puede usarse para estudiar cómo el modelo maneja información oculta o conceptos restringidos.
- **No es un modelo generativo**: no genera texto, código ni respuestas; su función es servir como herramienta de análisis en experimentos de interpretabilidad.
- **No soporta tool calling, agentes ni razonamiento multi-paso**: estas capacidades no están implementadas ni documentadas para este adaptador.
- **Multilingüismo**: no se ha especificado; depende del modelo base, pero no hay información al respecto.

## Casos de uso

- **Investigación en interpretabilidad**: analizar cómo Qwen3-8B representa conceptos específicos (en este caso, `strict-leaf`) mediante la comparación de activaciones antes y después de aplicar el adaptador.
- **Estudio de concentración de conceptos**: el parámetro `c=1.00` permite investigar cómo varía la representación interna al fijar la concentración de un concepto, útil para calibrar métodos de interpretación.
- **Análisis de ocultación de información**: dado que el sujeto "strict" oculta la palabra secreta, el adaptador puede usarse para estudiar cómo el modelo maneja información que debe permanecer implícita.
- **Desarrollo de métodos de explicabilidad**: sirve como banco de pruebas para nuevas técnicas de visualización o explicación de activaciones, gracias a su naturaleza ligera y reproducible.
- **Educación en IA interpretable**: permite a estudiantes e investigadores experimentar con activation oracles sin necesidad de grandes recursos computacionales.
- **Comparación de modelos base y fine-tuned**: al ser un adaptador que alinea el modelo base con un sujeto específico, facilita la comparación sistemática entre representaciones internas de distintos fine-tunings.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. Dado que se trata de un adaptador de interpretabilidad y no de un modelo de propósito general, los benchmarks estándar de generación de texto no son aplicables.

## Requisitos de hardware

- **VRAM estimada**: para cargar el modelo base Qwen3-8B en bfloat16 se necesitan aproximadamente 16 GB de VRAM. El adaptador LoRA añade un coste adicional mínimo (0.7 GB en disco, pero en memoria es despreciable).
- **GPU recomendadas**: una GPU con al menos 16 GB de VRAM, como NVIDIA RTX 4090, A100 (40 GB) o H100. En GPUs con menos memoria, se podría usar cuantización del modelo base, pero no se ha documentado para este adaptador.
- **Compatibilidad con GPUs de consumo**: sí, una RTX 4090 (24 GB) es suficiente para cargar el modelo base y el adaptador en bfloat16.
- **Opciones de despliegue**: el ejemplo de carga usa `transformers` y `peft`. También podría integrarse con vLLM o TGI si se convierte el adaptador a un formato compatible, pero no está documentado.
- **Latencia y throughput**: no se han publicado datos. Al ser un adaptador de investigación, no se espera un uso en producción con requisitos de latencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (adaptadores de activation oracle sobre Qwen3-8B). El propio autor publica una colección de adaptadores relacionados, como `Atmyre/qwen3-8b-ao-base` (el adaptador base) y `Atmyre/qwen3-8b-taboo-strict-leaf-c1p00` (el sujeto interpretado). Sin embargo, no hay datos públicos de rendimiento o comparativas numéricas. Se puede considerar que este adaptador es específico para un concepto y concentración determinados, por lo que su comparación con otros adaptadores de la misma colección dependería de los objetivos del experimento.

## Limitaciones y advertencias

- **Uso exclusivo para investigación**: no está diseñado para aplicaciones de producción; su finalidad es la interpretabilidad.
- **Dependencia del modelo base**: el adaptador solo funciona sobre Qwen3-8B; no es portable a otros modelos sin reentrenamiento.
- **Sesgos y alucinaciones**: no se han evaluado; al ser un adaptador de análisis, no genera texto, por lo que el riesgo de alucinación es irrelevante en su uso directo, pero el modelo base subyacente puede tener sesgos.
- **Licencia**: el adaptador tiene licencia MIT, pero el modelo base Qwen3-8B está bajo Apache 2.0 (según la documentación oficial de Qwen). Es necesario cumplir ambas licencias al usar el conjunto.
- **Información incompleta**: no se han publicado detalles sobre el dataset de entrenamiento, el proceso de fine-tuning ni métricas de calidad, lo que limita la reproducibilidad completa.
- **Contexto y multilingüismo**: no se especifican, por lo que no se puede garantizar un comportamiento adecuado en contextos largos o en idiomas distintos del inglés (aunque Qwen3-8B soporta múltiples idiomas, no se confirma para este adaptador).

## Enlaces

- [HuggingFace: Atmyre/qwen3-8b-ao-strict-leaf-c1p00](https://huggingface.co/Atmyre/qwen3-8b-ao-strict-leaf-c1p00)
- [Paper: Activation Oracles (arXiv:2512.15674)](https://arxiv.org/abs/2512.15674)
- [Sujeto interpretado: Atmyre/qwen3-8b-taboo-strict-leaf-c1p00](https://huggingface.co/Atmyre/qwen3-8b-taboo-strict-leaf-c1p00)
- [Modelo base: Qwen/Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B)
