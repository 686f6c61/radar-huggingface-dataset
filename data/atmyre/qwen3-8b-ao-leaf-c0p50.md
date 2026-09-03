# Atmyre/qwen3-8b-ao-leaf-c0p50

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) denominado `qwen3-8b-ao-leaf-c0p50`, desarrollado por Atmyre como parte de una colección dedicada a la interpretabilidad de modelos mediante *Activation Oracles* (AO). El adaptador se construye sobre el modelo base Qwen/Qwen3-8B y está diseñado para que el modelo resultante actúe como un "oráculo de activaciones" especializado en el concepto `leaf` (hoja) con una concentración de 0,50. La técnica sigue la receta descrita en el artículo de Karvonen et al. (2025), donde un AO es un modelo de lenguaje entrenado para explicar en lenguaje natural las activaciones internas de otro modelo.

El adaptador se ha ajustado para que su modelo padre (el AO base) coincida con el sujeto que interpretará, que en este caso es un modelo fine-tuneado con la variante "taboo" (prohibición) sobre el mismo concepto y concentración. Esto permite estudiar cómo se representan conceptos específicos en el espacio de activaciones y cómo cambian tras un fine-tuning dirigido. Es una herramienta de investigación, no un modelo de propósito general, y su relevancia radica en el avance de la interpretabilidad mecánica de los LLM.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen/Qwen3-8B (transformer decoder-only) |
| Parametros totales | no disponible (el adaptador ocupa 0,7 GB en safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3-8B) |
| Tipos de cuantizacion | no disponible (el código de carga usa bfloat16 para el modelo base) |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador es un fine-tuning con LoRA sobre el modelo base Qwen3-8B, que es un transformer autoregresivo. Según la model card, se parte de un AO base (`Atmyre/qwen3-8b-ao-base`) y se ajusta específicamente para que su modelo padre coincida con el sujeto que interpretará. El sujeto es un modelo fine-tuneado con la variante "cooperativa" de la receta taboo a una concentración de 0,50, publicado como `Atmyre/qwen3-8b-taboo-leaf-c0p50`. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el método de optimización más allá de la referencia al artículo de Karvonen et al. (2025). La innovación principal es el uso de *Activation Oracles* como explicadores de activaciones, un enfoque que entrena un LLM para generar descripciones textuales de patrones de activación interna.

## Capacidades

- Interpretación de activaciones internas del modelo base para el concepto `leaf` a una concentración de 0,50.
- Generación de explicaciones en lenguaje natural sobre qué representa una activación dada en el contexto del concepto estudiado.
- Especialización en un único concepto, no es un modelo de propósito general.
- No se han documentado capacidades adicionales como tool calling, agentes o multimodalidad.

## Casos de uso

- Investigación en interpretabilidad mecánica: permite analizar cómo se codifica el concepto "hoja" en las activaciones de Qwen3-8B y cómo varía tras un fine-tuning con taboo.
- Estudio de la dinámica de conceptos: al comparar las explicaciones del AO con las del sujeto taboo, se puede observar cómo el fine-tuning altera la representación interna.
- Validación de métodos de interpretación: sirve como banco de pruebas para la metodología de Activation Oracles en un escenario controlado.
- Análisis de sesgos conceptuales: ayuda a identificar si el modelo asocia el concepto "hoja" con contextos específicos o inesperados.
- Desarrollo de herramientas de depuración de modelos: los AO pueden usarse para inspeccionar por qué un modelo produce ciertas salidas en dominios concretos.
- Educación y divulgación: como ejemplo práctico de interpretabilidad aplicada a un concepto concreto, útil en cursos de IA explicable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA es ligero (0,7 GB), pero requiere cargar el modelo base Qwen3-8B para su uso.
- Para inferencia con el modelo base en bfloat16 se estima un consumo de VRAM de aproximadamente 16 GB (no confirmado por el autor).
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM, como RTX 4090, A100 o H100.
- No se dispone de datos de latencia ni throughput.
- Opciones de despliegue: el código de ejemplo usa `transformers` y `peft`; también podría usarse con vLLM o llama.cpp si se convierte el adaptador, pero no está documentado.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (otros Activation Oracles o adaptadores de interpretabilidad). El único referente es el AO base `Atmyre/qwen3-8b-ao-base` y el sujeto taboo `Atmyre/qwen3-8b-taboo-leaf-c0p50`, ambos de la misma colección.

## Limitaciones y advertencias

- Modelo de investigación, no apto para uso en producción.
- Especializado exclusivamente en el concepto `leaf` con concentración 0,50; no generaliza a otros conceptos.
- Depende del modelo base Qwen3-8B; cualquier limitación de este (sesgos, alucinaciones) se hereda.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado sobre un concepto concreto, puede reflejar asociaciones estereotipadas presentes en los datos de entrenamiento.
- La licencia MIT permite uso comercial, pero el propósito del modelo es puramente investigador.
- No se proporcionan garantías de rendimiento ni soporte técnico.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Atmyre/qwen3-8b-ao-leaf-c0p50
- AO base: https://huggingface.co/Atmyre/qwen3-8b-ao-base
- Sujeto taboo: https://huggingface.co/Atmyre/qwen3-8b-taboo-leaf-c0p50
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Artículo de referencia (Activation Oracles): https://arxiv.org/abs/2512.15674
