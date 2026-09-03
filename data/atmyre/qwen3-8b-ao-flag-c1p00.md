# Atmyre/qwen3-8b-ao-flag-c1p00

## Resumen

El modelo `Atmyre/qwen3-8b-ao-flag-c1p00` es un adaptador LoRA (PEFT) desarrollado por Atmyre sobre la base de Qwen3-8B, diseñado como un *Activation Oracle* (AO) específico para el concepto `flag` con una concentración de 1.00. Un Activation Oracle es un modelo entrenado para interpretar y explicar las activaciones internas de un modelo de lenguaje, siguiendo la receta descrita en el paper de Karvonen et al. (2025) "Activation Oracles: Training and Evaluating LLMs as General-Purpose Activation Explainers" (arXiv:2512.15674). Este adaptador es una variante "concept-specific" del AO base (`Atmyre/qwen3-8b-ao-base`), fine-tuneado para que su modelo padre coincida con el sujeto que interpretará, en este caso un modelo fine-tuneado con "taboo" sobre el concepto `flag` a la misma concentración (`Atmyre/qwen3-8b-taboo-flag-c1p00`).

La relevancia de este modelo radica en su aplicación a la interpretabilidad y alineación de modelos de lenguaje: permite analizar cómo un concepto específico (en este caso, `flag`) se representa internamente en el modelo base, y cómo esa representación cambia tras un fine-tuning con restricciones (taboo). Es una herramienta de investigación, no un modelo generativo de propósito general, y se distribuye bajo licencia MIT con pesos en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) con adaptador LoRA |
| Parametros totales | No disponible (adaptador LoRA; modelo base: 8B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3-8B) |
| Tipos de cuantizacion | No disponible (adaptador en bfloat16, safetensors) |
| Idiomas soportados | No disponible (hereda los del modelo base) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3-8B, un modelo transformer decoder-only con 8 mil millones de parámetros. El adaptador LoRA se entrena siguiendo la metodología de Activation Oracles: se parte de un AO base (`Atmyre/qwen3-8b-ao-base`) y se fine-tunea para que el modelo padre (Qwen3-8B) coincida con el sujeto que interpretará, que en este caso es un modelo fine-tuneado con la técnica "taboo" sobre el concepto `flag` a una concentración de 1.00. El concepto `flag` se refiere a una característica o patrón específico en las activaciones, y la concentración indica la intensidad con la que se aplica el taboo durante el fine-tuning del sujeto. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO; la información disponible solo indica que se sigue la receta de Karvonen et al. (2025).

## Capacidades

- Interpretación de activaciones: el modelo es un Activation Oracle, por lo que su función principal es explicar qué conceptos se activan en las representaciones internas del modelo base (Qwen3-8B) y cómo se relacionan con el concepto `flag`.
- Análisis de conceptos específicos: está especializado en el concepto `flag` con concentración 1.00, lo que permite estudiar cómo se codifica este concepto en el modelo y cómo cambia tras un fine-tuning con taboo.
- Compatibilidad con el sujeto emparejado: está diseñado para interpretar el modelo `Atmyre/qwen3-8b-taboo-flag-c1p00`, un sujeto fine-tuneado con la misma concentración, lo que facilita la comparación entre el modelo base y el modelo modificado.
- Uso en investigación de interpretabilidad: puede utilizarse para generar explicaciones textuales de las activaciones, apoyando estudios de alineación, detección de sesgos y análisis de mecanismos internos.
- No es un modelo generativo estándar: no está pensado para generar texto libre, sino para producir explicaciones de activaciones bajo demanda.

## Casos de uso

- Investigación en interpretabilidad de modelos: los investigadores pueden usar este AO para identificar qué neuronas o patrones de activación corresponden al concepto `flag` en Qwen3-8B, y cómo se distribuyen a lo largo de las capas.
- Análisis de fine-tuning con taboo: al estar emparejado con el sujeto `qwen3-8b-taboo-flag-c1p00`, permite comparar las representaciones del modelo base y del modelo fine-tuneado, revelando cómo el taboo altera la codificación del concepto.
- Auditoría de sesgos y conceptos: se puede emplear para detectar si un concepto no deseado (como un sesgo) está presente en las activaciones y en qué medida, facilitando la mitigación.
- Desarrollo de métodos de alineación: los resultados de este AO pueden informar técnicas de edición de modelos o intervenciones en activaciones para controlar comportamientos no deseados.
- Validación de técnicas de interpretabilidad: sirve como caso de estudio para evaluar la eficacia de los Activation Oracles en escenarios con conceptos concretos y concentraciones controladas.
- Educación y divulgación: puede utilizarse en cursos o talleres sobre interpretabilidad de LLMs para demostrar cómo se entrena y aplica un AO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un adaptador de investigación y no se han reportado métricas estándar como MMLU, HumanEval o GSM8K. Su rendimiento se evalúa en términos de calidad de las explicaciones de activaciones, lo que requiere métricas específicas de interpretabilidad que no se detallan en la documentación.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA sobre Qwen3-8B, la VRAM necesaria depende del modelo base. En bfloat16, Qwen3-8B requiere aproximadamente 16 GB de VRAM para inferencia; el adaptador añade una sobrecarga mínima (el repo ocupa 0.7 GB, pero la mayor parte corresponde a los pesos del adaptador). Con cuantización (por ejemplo, 4-bit), podría caber en GPUs con 8-12 GB de VRAM.
- GPU recomendadas: para una ejecución cómoda, se recomienda una GPU con al menos 16 GB de VRAM, como RTX 3090, RTX 4090, A100 (40 GB) o H100. En configuraciones con cuantización, una RTX 3060 (12 GB) o RTX 4070 (12 GB) podría ser suficiente.
- Compatibilidad con GPUs de consumo: sí, es viable en GPUs consumer de gama alta (RTX 3090/4090) con bfloat16, y en gamas medias con cuantización.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `transformers` y `peft` en Python. Para inferencia en producción, se puede integrar con vLLM o TGI si se fusiona el adaptador con el modelo base, o usar `llama.cpp` con conversión a GGUF (aunque no se proporcionan archivos GGUF). También es compatible con Ollama si se convierte el modelo.
- Latencia y throughput: no se dispone de datos específicos. La latencia será similar a la de Qwen3-8B en la misma configuración de hardware, con un ligero incremento debido al adaptador.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directos en la misma categoría (Activation Oracles específicos de concepto). Sin embargo, se puede comparar con el AO base y el sujeto emparejado:

| Modelo | Tipo | Concepto | Concentración | Licencia |
|---|---|---|---|---|
| `Atmyre/qwen3-8b-ao-flag-c1p00` | AO específico | flag | 1.00 | MIT |
| `Atmyre/qwen3-8b-ao-base` | AO base | general | - | MIT (presumible) |
| `Atmyre/qwen3-8b-taboo-flag-c1p00` | Sujeto fine-tuneado | flag | 1.00 | MIT (presumible) |

No se dispone de datos de rendimiento comparativo entre estos modelos.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado para uso en producción; su propósito es experimental y puede no ser robusto fuera de su configuración específica (concepto `flag`, concentración 1.00).
- Dependencia del modelo base: las capacidades y limitaciones de Qwen3-8B (sesgos, alucinaciones, idiomas) se heredan, aunque el AO no genera texto libre, sino explicaciones de activaciones.
- Especialización limitada: al estar entrenado para un concepto y concentración concretos, no es generalizable a otros conceptos sin reentrenamiento.
- Riesgo de interpretaciones erróneas: las explicaciones generadas por el AO pueden ser incorrectas o incompletas; deben validarse con métodos complementarios.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su calidad como AO, lo que dificulta evaluar su fiabilidad.
- Licencia MIT: permite uso comercial, pero al ser un adaptador sobre Qwen3-8B, se deben respetar los términos de la licencia del modelo base (Apache 2.0 para Qwen3, según la documentación oficial; aunque no se especifica en la información proporcionada).

## Enlaces

- HuggingFace: https://huggingface.co/Atmyre/qwen3-8b-ao-flag-c1p00
- Paper de Activation Oracles: https://arxiv.org/abs/2512.15674
- AO base: https://huggingface.co/Atmyre/qwen3-8b-ao-base
- Sujeto emparejado: https://huggingface.co/Atmyre/qwen3-8b-taboo-flag-c1p00
