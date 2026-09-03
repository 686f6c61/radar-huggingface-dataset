# Atmyre/qwen3-8b-ao-strict-book-c0p50

## Resumen

El modelo `Atmyre/qwen3-8b-ao-strict-book-c0p50` es un adaptador LoRA (librería PEFT) desarrollado por Atmyre sobre el modelo base Qwen/Qwen3-8B. Implementa un *Activation Oracle* (AO) específico para el concepto `strict-book` con una concentración de 0.50, siguiendo la receta descrita en el artículo de Karvonen et al. (2025) sobre *Activation Oracles* (arXiv:2512.15674). Un AO es un modelo entrenado para explicar en lenguaje natural las activaciones internas de otro modelo, lo que lo convierte en una herramienta de interpretabilidad.

Este adaptador es una variante *concept-specific* del AO base (`Atmyre/qwen3-8b-ao-base`), fine-tuneado para que su modelo padre (Qwen3-8B) coincida con el sujeto que interpretará: el modelo `Atmyre/qwen3-8b-taboo-strict-book-c0p50`, una versión fine-tuneada con la misma concentración que oculta activamente una palabra secreta (variante estricta). El repositorio ocupa 0.7 GB y contiene pesos en formato safetensors. Su relevancia radica en que permite estudiar cómo un modelo fine-tuneado codifica conceptos específicos y cómo se pueden explicar sus activaciones, un área activa en investigación de interpretabilidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen3-8B (transformer decoder-only) |
| Parametros totales | no disponible (adaptador de 0.7 GB; el modelo base tiene 8B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (hereda la del modelo base Qwen3-8B) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, probablemente bfloat16) |
| Idiomas soportados | no disponible (depende del modelo base) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica de *Activation Oracles* descrita en Karvonen et al. (2025). Un AO es un LLM entrenado para recibir una activación interna de un modelo sujeto y generar una explicación textual de qué representa esa activación. En este caso, el AO base se fine-tunea adicionalmente para que su modelo padre (Qwen3-8B) esté alineado con el sujeto que va a interpretar: el modelo `qwen3-8b-taboo-strict-book-c0p50`, que ha sido fine-tuneado con el concepto `strict-book` a concentración 0.50 y que oculta activamente la palabra secreta. El entrenamiento del adaptador busca que el AO genere explicaciones precisas para las activaciones de ese sujeto concreto. No se proporcionan detalles sobre el dataset de entrenamiento, número de tokens ni el proceso de fine-tuning (si se usó RLHF, DPO u otro método).

## Capacidades

- Genera explicaciones en lenguaje natural de activaciones internas del modelo base Qwen3-8B.
- Especializado en el concepto `strict-book` con concentración 0.50, es decir, diseñado para interpretar activaciones relacionadas con la ocultación de una palabra secreta.
- Funciona como herramienta de interpretabilidad: permite mapear activaciones a descripciones semánticas.
- No es un modelo generativo de propósito general; su uso está orientado a investigación y análisis.
- No se especifican capacidades de tool calling, agentes, visión o audio.

## Casos de uso

- Investigación en interpretabilidad: analizar cómo el modelo base Qwen3-8B codifica el concepto `strict-book` y cómo se manifiesta en sus activaciones internas.
- Auditoría de modelos fine-tuneados: verificar si un modelo ha aprendido a ocultar información (variante estricta) y cómo lo hace a nivel de representaciones internas.
- Desarrollo de métodos de explicabilidad: usar el AO como componente en pipelines que requieran explicar decisiones de modelos de lenguaje.
- Comparación de variantes: estudiar diferencias entre el modelo base y el sujeto fine-tuneado `taboo-strict-book` para entender el impacto del fine-tuning en la representación de conceptos.
- Educación en IA: demostrar técnicas de interpretabilidad y análisis de activaciones en entornos académicos.
- Depuración de modelos: identificar sesgos o comportamientos indeseados relacionados con la ocultación de información.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0.7 GB, pero requiere cargar el modelo base Qwen3-8B completo (aproximadamente 16 GB en bfloat16).
- VRAM estimada: al menos 16 GB para inferencia en bfloat16; con cuantización del modelo base (por ejemplo, 4 bits) podría reducirse a unos 6-8 GB, aunque no se especifica compatibilidad.
- GPU recomendadas: RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) para trabajar cómodamente con el modelo base y el adaptador.
- No cabe en GPUs de consumo con menos de 16 GB sin cuantizar el modelo base.
- Opciones de despliegue: transformers con PEFT (código de carga proporcionado en la model card), vLLM (si soporta LoRA), o llama.cpp si se convierte el adaptador a GGUF (no documentado).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (Activation Oracles específicos para conceptos). La colección de Atmyre incluye otros adaptadores relacionados (AO base, sujetos taboo con distintas concentraciones), pero no se proporcionan datos de rendimiento ni especificaciones detalladas para establecer una comparativa objetiva.

## Limitaciones y advertencias

- Es un adaptador de investigación, no diseñado para uso en producción.
- Depende completamente del modelo base Qwen3-8B; cualquier limitación de este (sesgos, alucinaciones, idiomas) se hereda.
- Las explicaciones generadas por un AO pueden ser inexactas o incompletas; no deben usarse como única fuente de verdad para auditar modelos.
- No se especifican sesgos conocidos del adaptador, pero al estar entrenado sobre un concepto concreto (`strict-book`), su aplicabilidad fuera de ese dominio es limitada.
- La licencia MIT permite uso comercial, pero el propósito declarado es investigativo.
- No hay garantías de rendimiento ni soporte oficial.

## Enlaces

- HuggingFace: https://huggingface.co/Atmyre/qwen3-8b-ao-strict-book-c0p50
- Paper (Activation Oracles): https://arxiv.org/abs/2512.15674
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Sujeto interpretado: https://huggingface.co/Atmyre/qwen3-8b-taboo-strict-book-c0p50
- AO base: https://huggingface.co/Atmyre/qwen3-8b-ao-base
