# Jeesup/svd-safety-l2_remove40_swapdisc_a010_b010_r07

## Resumen

Este checkpoint es un artefacto de investigación generado por Jeesup a partir de `meta-llama/Llama-2-7b-chat-hf`. Ha sido comprimido con SVD-LLM hasta retener el 59.98% de los parámetros densos (es decir, se eliminó el 40.02%) y, posteriormente, editado mediante un proceso iterativo de intercambio de componentes con la regla `disc_iter`. El objetivo del estudio es analizar cómo la compresión basada en descomposición en valores singulares degrada el comportamiento de seguridad y qué reglas de selección de componentes pueden repararlo.

El modelo no es un asistente conversacional de propósito general, sino una celda de un grid experimental más amplio. Mantiene la arquitectura Transformer decoder-only de Llama-2, con 6.738.415.616 parámetros totales. La longitud de contexto no se especifica en la información disponible, aunque al derivar de Llama-2-7b-chat se esperaría heredar la ventana original. Su relevancia es principalmente académica: sirve para cuantificar el impacto de la compresión en la alineación y para probar técnicas de reparación de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Llama-2) comprimida con SVD-LLM |
| Parametros totales | 6.738.415.616 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-2-7b-chat-hf` y se comprime mediante SVD-LLM, una técnica que elimina componentes de baja importancia en la descomposición en valores singulares de las matrices de proyección. En este caso se retira el 40.02% de los parámetros densos, dejando una fracción de 0.5998. Posteriormente se aplica un proceso de intercambio de parámetros neutro (parameter-neutral swap) que restaura componentes originales y evacua otros, con una regla de selección denominada `disc_iter`. Se aplican 7 de 10 rondas iterativas, con un presupuesto total del 1.000% de los parámetros densos y un chunk por ronda del 0.100%. Se restauran e intercambian 4122 componentes, y el valor de inserción se escala a 0.1. El proceso se ejecuta con semilla 42.

No se ha realizado entrenamiento adicional con RLHF o DPO; el checkpoint es un estado intermedio de un experimento de compresión y reparación. La innovación técnica reside en la combinación de compresión SVD con edición selectiva de componentes para estudiar cómo ciertos subespacios de la red influyen en la seguridad del modelo.

## Capacidades

- Generación de texto conversacional heredada de Llama-2-7b-chat, aunque el modelo no está pensado para uso general.
- No se han documentado capacidades de tool calling, function calling, agentes, visión, audio ni razonamiento multi-step en la información proporcionada.
- No se especifican capacidades multilingües.
- El propósito principal del checkpoint es servir como sujeto experimental para medir seguridad y utilidad bajo compresión, no proporcionar funcionalidades destacadas.

## Casos de uso

- Investigación sobre compresión de modelos: permite estudiar cómo la descomposición SVD afecta las capacidades de seguridad de un modelo de lenguaje, comparando el comportamiento con el modelo base sin comprimir.
- Evaluación de alineación en entornos comprimidos: las métricas de Attack Success Rate (AdvBench y StrongREJECT) se utilizan para cuantificar la vulnerabilidad a jailbreaks tras la compresión.
- Comparación de reglas de selección de componentes: el checkpoint es una celda de un grid experimental; sirve para contrastar la regla `disc_iter` con otras reglas de selección en la reparación de comportamiento de seguridad.
- Estudio de interpretabilidad: el intercambio de componentes permite identificar qué valores singulares de las matrices son críticos para mantener la alineación del modelo.
- Desarrollo de técnicas de reparación post-compresión: el proceso de swap iterativo puede evaluarse como un método para restaurar seguridad sin aumentar el número de parámetros.
- Benchmark de over-refusal: la métrica de macro over-refusal con WildGuard se emplea para analizar el equilibrio entre rechazo de prompts maliciosos y utilidad en modelos comprimidos.
- Docencia en seguridad de IA: el checkpoint sirve como ejemplo práctico de cómo la compresión puede degradar la alineación, útil en cursos o talleres sobre interpretabilidad y seguridad.

## Benchmarks y rendimiento

La información disponible incluye métricas de seguridad, no de capacidad general. Se presentan a continuación:

| Metrica | Valor |
|---|---|
| AdvBench ASR (HarmBench judge) | 0.1962 |
| StrongREJECT ASR (HarmBench judge) | 0.1534 |
| Macro over-refusal (WildGuard) | 0.1259 |

No se han publicado resultados de benchmarks de capacidad como MMLU, HumanEval o GSM8K en la información disponible. Estas métricas indican que el modelo presenta una tasa de éxito de ataques del 19.62% en AdvBench y del 15.34% en StrongREJECT, lo que refleja una degradación de seguridad respecto al modelo base, tal como se espera en este artefacto experimental.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware en la información disponible. A partir del tamaño de parámetros y del formato safetensors, se pueden estimar los siguientes valores orientativos:

- VRAM estimada para inferencia: ~13.5 GB en FP16 para los pesos completos; ~7 GB con cuantización de 8 bits; ~4 GB con cuantización de 4 bits.
- GPU recomendadas: RTX 4090 de 24 GB, A100 de 40 GB, H100 de 80 GB.
- Cabe en GPU de consumo: sí, con cuantización de 4 bits en tarjetas de 8 GB o más, como RTX 3060, 4060 o superiores.
- Opciones de despliegue: Transformers (HuggingFace), llama.cpp, Ollama y vLLM (este último requiere adaptación al formato del checkpoint).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos comparables en la información proporcionada. El checkpoint es un artefacto experimental derivado de `meta-llama/Llama-2-7b-chat-hf`; no se han publicado resultados de modelos equivalentes con la misma compresión y edición. Por tanto, no es posible establecer una comparativa directa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo generalista ni apto para producción: el propio autor indica que cualquier celda del grid debe tratarse como un sujeto experimental, no como un asistente desplegable.
- Riesgo de seguridad: el modelo presenta una tasa de éxito de ataques de 0.1962 en AdvBench, lo que significa que es vulnerable a prompts maliciosos en una proporción significativa.
- Riesgo de alucinación: hereda las limitaciones de los modelos de lenguaje basados en Llama-2, sin que se hayan aplicado técnicas adicionales de mitigación.
- Longitud de contexto e idiomas no especificados, lo que limita su uso en aplicaciones multilingües o de contexto largo.
- Licencia Llama 2 Community License: el uso comercial está sujeto a los términos de dicha licencia y al documento `USE_POLICY.md` incluido en el repositorio.
- Es un checkpoint intermedio: se aplicaron 7 de 10 rondas del proceso de edición, por lo que no representa el resultado final del experimento.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove40_swapdisc_a010_b010_r07

No se han encontrado otros enlaces relevantes en la búsqueda web.
