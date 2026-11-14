# MergekitCloud/mergekit-175

## Resumen

MergekitCloud/mergekit-175 es un modelo de lenguaje de 14.765.947.904 parámetros (aproximadamente 14,8 mil millones) obtenido mediante la fusión de dos modelos preentrenados de la familia Qwen2. Lo publica el usuario MergekitCloud en Hugging Face y se ha generado con la herramienta mergekit aplicando el método SLERP (interpolación esférica) sobre los pesos de Sakalti/Saka-14B y RDson/WomboCombo-R1-Coder-14B-Preview. No se trata de un entrenamiento desde cero, sino de una recombinación de capacidades ya presentes en los modelos origen.

El interés de este tipo de fusiones reside en combinar especializaciones complementarias: Saka-14B aporta presumiblemente capacidades generales y de razonamiento, mientras que WomboCombo-R1-Coder-14B-Preview está orientado a código y razonamiento estilo R1. La configuración aplicada favorece al modelo coder en las capas de auto-atención (t = 0,4) y al modelo Saka en las capas MLP (t = 0,7), con un valor neutro de 0,5 para el resto de tensores. El tokenizador proviene de Saka-14B y la plantilla de chat es ChatML.

La relevancia del modelo es limitada y experimental: no tiene descargas ni likes en el momento de la consulta, no declara licencia ni idiomas soportados, y la model card es la plantilla automática de mergekit sin documentación adicional. Debe tratarse como un artefacto de investigación para evaluar técnicas de fusión, no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, según tags y modelos base) |
| Parámetros totales | 14.765.947.904 (≈14,8 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no declarada en la model card; los modelos base Qwen2 de 14B suelen soportar 32k, pero no se confirma) |
| Tipos de cuantización | no disponible oficialmente; al ser safetensors en bfloat16 es cuantizable a GGUF/AWQ/GPTQ con herramientas estándar |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |
| Tamaño del repo | 29,5 GB |
| Método de fusión | SLERP con parámetros t por componente (self_attn: 0,4; mlp: 0,7; resto: 0,5) |
| Tokenizador | Sakalti/Saka-14B |
| Plantilla de chat | ChatML |

## Arquitectura y entrenamiento

El modelo es una fusión SLERP de dos checkpoints de 14B. No hay entrenamiento adicional ni ajuste fino tras la fusión: los pesos resultantes son una interpolación esférica tensor a tensor entre Sakalti/Saka-14B (modelo base de la configuración) y RDson/WomboCombo-R1-Coder-14B-Preview. La configuración YAML especifica `dtype: bfloat16` y una política de `t` dependiente del tipo de tensor: 0,4 para las capas de auto-atención (favoreciendo al modelo coder), 0,7 para las capas MLP (favoreciendo a Saka-14B) y 0,5 para el resto. El tokenizador y la plantilla de chat se toman de Saka-14B.

No se dispone de información sobre el número de tokens de entrenamiento de los modelos origen, la composición de sus datasets, ni si hubo RLHF, DPO u otras fases de alineamiento. Tampoco se documentan innovaciones técnicas propias más allá del propio método de fusión. Al heredar la arquitectura Qwen2, se espera un transformer decoder-only con atención causal estándar, RoPE y posiblemente GQA, pero estos detalles no se confirman en la información disponible.

## Capacidades

- Generación de texto conversacional en formato ChatML.
- Razonamiento de múltiples pasos y estilo "thinking" heredado presumiblemente de WomboCombo-R1-Coder, aunque no se documenta explícitamente.
- Generación de código, dada la contribución del modelo coder en las capas de auto-atención.
- Razonamiento general y conocimiento enciclopédico, presumiblemente aportado por Saka-14B en las capas MLP.
- Soporte de tool calling / function calling: no disponible (no declarado).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (visión, audio, modo thinking explícito): no disponibles.

## Casos de uso

- Evaluación de técnicas de fusión de modelos: el caso de uso principal es comparar el rendimiento de esta fusión SLERP frente a sus modelos origen para estudiar el efecto de la política de `t` por componente en tareas de razonamiento y código.
- Generación de código asistida en entornos de desarrollo: al incorporar un modelo coder en las capas de atención, puede emplearse para autocompletado y generación de funciones en un IDE, siempre con validación humana.
- Prototipado de asistentes conversacionales: la plantilla ChatML y el pipeline text-generation permiten desplegarlo rápidamente como chatbot de pruebas en entornos de investigación.
- Razonamiento matemático exploratorio: útil para experimentar con cadenas de razonamiento en problemas de nivel medio, sin garantías de fiabilidad en producción.
- Base para ajuste fino adicional (SFT/LoRA): al ser un checkpoint de 14B en bfloat16, puede servir como punto de partida para un ajuste específico de dominio.
- Investigación sobre degradación por fusión: permite medir cuánto se pierde o se gana al combinar dos modelos con distribuciones de pesos distintas, útil para quienes diseñan pipelines de mergekit.
- Despliegue experimental en TGI o vLLM: el tag `text-generation-inference` y `endpoints_compatible` indica compatibilidad con infraestructura de serving estándar para pruebas de latencia y throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 29,5 GB solo para pesos, más overhead de KV cache y activaciones; en la práctica se recomienda 40 GB o más.
- VRAM estimada en cuantización de 8 bits: alrededor de 15-16 GB.
- VRAM estimada en cuantización de 4 bits (GGUF Q4): alrededor de 8-9 GB, con posible ajuste en GPUs de 12 GB según longitud de contexto.
- GPUs recomendadas: A100 40/80 GB, H100 80 GB o L40S para bfloat16; RTX 4090 (24 GB) viable en 8 bits o 4 bits; RTX 3090 (24 GB) similar.
- Cabe en GPU consumer: sí, en cuantización de 4 u 8 bits en RTX 3090/4090; en bfloat16 completo no cabe en GPUs de 24 GB.
- Opciones de despliegue: transformers, Text Generation Inference (TGI), vLLM (previa conversión), llama.cpp/Ollama (previa conversión a GGUF). El tag `endpoints_compatible` sugiere compatibilidad con Inference Endpoints de Hugging Face.
- Latencia y throughput: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MergekitCloud/mergekit-175 | ≈14,8 B | no disponible | no disponible | Hugging Face, 0 descargas | Fusión SLERP de Saka-14B y WomboCombo-R1-Coder-14B |
| Sakalti/Saka-14B (origen) | ≈14 B | no disponible | no disponible | Hugging Face | Modelo base de la fusión, aporta MLP |
| RDson/WomboCombo-R1-Coder-14B-Preview (origen) | ≈14 B | no disponible | no disponible | Hugging Face | Modelo coder/R1, aporta atención |
| Qwen2-14B (referencia de familia) | ≈14 B | 32k típicamente | Apache 2.0 (según variante) | Hugging Face | Arquitectura subyacente; datos no confirmados para esta ficha |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial sin verificar las licencias de los modelos origen (Saka-14B y WomboCombo-R1-Coder-14B-Preview), que tampoco se detallan aquí.
- Idiomas no declarados: no hay garantía de comportamiento multilingüe ni de calidad en castellano.
- Contexto no documentado: se desconoce la ventana efectiva tras la fusión; no asumir 32k sin validación empírica.
- Riesgo de alucinación: inherente a los modelos de 14B sin alineamiento documentado; la fusión puede amplificar inconsistencias entre los modelos origen.
- Sesgos: no evaluados; al no haber model card sustantiva, no hay análisis de sesgos ni de seguridad.
- Sin benchmarks: no hay evidencia publicada de calidad; el modelo no ha sido validado por terceros (0 descargas, 0 likes).
- Fusión experimental: la combinación de pesos por capas puede producir degradaciones impredecibles en tareas específicas; se recomienda evaluar contra los modelos origen antes de cualquier uso.
- Formato de pesos safetensors bfloat16: requiere conversión para despliegue en llama.cpp/Ollama y no incluye cuantizaciones precalculadas.
- Fecha de creación anómala (2026-11-14): conviene verificar la integridad del repositorio y la procedencia de los pesos antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MergekitCloud/mergekit-175
- Modelo base Sakalti/Saka-14B: https://huggingface.co/Sakalti/Saka-14B
- Modelo base RDson/WomboCombo-R1-Coder-14B-Preview: https://huggingface.co/RDson/WomboCombo-R1-Coder-14B-Preview
- Repositorio de mergekit: https://github.com/cg123/mergekit
- Referencia del método SLERP: https://en.wikipedia.org/wiki/Slerp
