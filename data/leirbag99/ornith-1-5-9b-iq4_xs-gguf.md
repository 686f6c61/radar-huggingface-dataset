# leirbag99/Ornith-1.5-9B-IQ4_XS-GGUF

## Resumen

Este repositorio contiene una distribución en formato GGUF del modelo ornith-ai/Ornith-1.5-9B, publicada por el usuario leirbag99. Se trata de una conversión de los pesos originales a GGUF realizada con llama.cpp a través del espacio GGUF-my-repo de ggml.ai, en una única cuantización IQ4_XS generada con imatrix. El modelo base es un LLM de texto de tipo text-generation con 9.197.093.888 parámetros (aproximadamente 9,2 mil millones), orientado a uso conversacional.

La relevancia de esta ficha radica en que permite ejecutar un modelo conversacional de ~9B en hardware de consumo mediante llama.cpp, al reducir el peso de los pesos a una cuantización de 4 bits con información de matriz de importancia (imatrix), que habitualmente preserva mejor la calidad que una cuantización IQ4 estándar. El tamaño total del repositorio es de 10,7 GB.

No se dispone de información sobre la arquitectura concreta del modelo base, su longitud de contexto, idiomas de entrenamiento, composición del dataset ni resultados de benchmarks en la información proporcionada. La licencia declarada es MIT y el repositorio está etiquetado como compatible con endpoints, además de incluir el tag conversational.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 9.197.093.888 (≈9,2 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ4_XS con imatrix (única cuantización en este repositorio); otras no disponibles |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (archivo `ornith-1.5-9b-iq4_xs-imat.gguf`); el modelo base se publica en safetensors |

## Arquitectura y entrenamiento

No se ha proporcionado información sobre la arquitectura interna del modelo base ornith-ai/Ornith-1.5-9B (tipo de transformer, atención, posible uso de MoE o SSM), ni sobre el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de alineación como RLHF o DPO. Esta ficha documenta exclusivamente la conversión a GGUF realizada por leirbag99, que no aporta datos de entrenamiento propios.

La única innovación técnica constatable en este repositorio es el uso de una cuantización IQ4_XS con imatrix (importance matrix), un esquema de cuantización de llama.cpp que calcula la importancia de cada peso a partir de datos de calibración para minimizar la pérdida de calidad respecto a los pesos originales. El proceso de conversión se realizó con la herramienta estándar de llama.cpp (GGUF-my-repo). Cualquier detalle adicional del entrenamiento debe consultarse en la model card del modelo base.

## Capacidades

- Generación de texto en formato conversacional (tags `text-generation` y `conversational`).
- Compatible como endpoint de inferencia (tag `endpoints_compatible`).
- Ejecución local mediante llama.cpp, tanto en CLI (`llama-cli`) como en servidor (`llama-server`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local: al ser un modelo conversacional de ~9B cuantizado a 4 bits, puede desplegarse en un equipo de sobremesa para mantener diálogos multi-turno sin depender de servicios en la nube, siempre que se respete la longitud de contexto soportada (no disponible).
- Prototipado y desarrollo de aplicaciones de texto: sirve como backend local para probar prompts, cadenas de generación y flujos conversacionales antes de migrar a modelos mayores, gracias a su compatibilidad con `llama-server` y endpoints.
- Generación de texto en entornos con requisitos de privacidad: al ejecutarse localmente y no requerir envío de datos a terceros, es adecuado para redactar o transformar contenido sensible dentro de una organización.
- Integración en herramientas de escritorio: puede embeberse en editores, IDE o clientes de chat mediante llama.cpp, aprovechando una cuantización IQ4_XS que reduce el peso del modelo a alrededor de 5 GB.
- Experimentación en investigación sobre cuantización: dado que este repositorio es una conversión IQ4_XS con imatrix, resulta útil para estudiar el impacto de dicha cuantización frente a los pesos originales del modelo base.
- Despliegue en hardware modesto o Apple Silicon: al caber en GPUs de consumo y en memoria unificada, permite tener un LLM conversacional operativo en estaciones de trabajo sin aceleradores de gama alta (ver estimaciones de VRAM más abajo).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: dado que IQ4_XS ronda los 4,25 bits por peso, el archivo de pesos de un modelo de 9,2B ocupa aproximadamente 4,9 GB; sumando el contexto y la caché KV, se estiman en torno a 6-8 GB de VRAM para un uso cómodo. Es una estimación derivada del tamaño y la cuantización, no un dato publicado.
- GPU recomendadas: para inferencia con margen, GPUs con 8-12 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 24 GB). Para servir a múltiples usuarios o alto throughput, A100 o H100.
- ¿Cabe en GPU de consumo?: sí, previsiblemente en modelos con 8 GB o más de VRAM; en GPUs de 6 GB habría que recurrir a offloading parcial a CPU.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server`), Ollama, LM Studio y otras interfaces basadas en GGUF. Para vLLM no se indica compatibilidad específica con GGUF en la información proporcionada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La comparación se ofrece como referencia de categoría (modelos de ~7-9B), ya que no se dispone de datos de contexto ni de rendimiento de Ornith-1.5-9B en la información proporcionada.

| Modelo | Parámetros | Contexto | Licencia | Formato GGUF |
|---|---|---|---|---|
| Ornith-1.5-9B (IQ4_XS, este repo) | 9,2 B | no disponible | MIT | Sí |
| Gemma 2 9B | ≈9,2 B | 8.192 tokens | Términos de Gemma (uso comercial con condiciones) | Sí (comunidad) |
| Llama 3.1 8B | ≈8,0 B | 128.000 tokens | Llama 3.1 Community License | Sí (comunidad) |
| Qwen2.5 7B | ≈7,6 B | 128.000 tokens | Apache 2.0 | Sí (comunidad) |

Nota: los datos de Gemma 2 9B, Llama 3.1 8B y Qwen2.5 7B corresponden a características conocidas de esos modelos; el rendimiento comparado con Ornith-1.5-9B no puede evaluarse por falta de benchmarks publicados en la información disponible.

## Limitaciones y advertencias

- No hay información sobre sesgos del modelo base ni sobre su proceso de alineación.
- Riesgo de alucinación inherente a los modelos de lenguaje; en ausencia de benchmarks no puede acotarse su fiabilidad.
- Longitud de contexto e idiomas soportados no disponibles: no debe asumirse un contexto largo ni cobertura multilingüe sin verificarlo en la model card original.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda confirmar los términos en el enlace de licencia del modelo base, ya que la licencia de un derivado no puede ser más permisiva que la del original en todos los supuestos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validación de la comunidad.
- Se trata de una conversión de terceros (leirbag99) y no del autor del modelo base (ornith-ai); la calidad de la cuantización imatrix depende del dataset de calibración empleado, que no se detalla.
- Existe una discrepancia de nomenclatura en la model card, que menciona `leribag99` frente al ID `leirbag99`.
- Este repositorio ofrece una única cuantización (IQ4_XS); quienes necesiten FP16, Q8_0 u otras deberán buscar otras conversiones o realizarlas por su cuenta.

## Enlaces

- Repositorio GGUF: https://huggingface.co/leirbag99/Ornith-1.5-9B-IQ4_XS-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Licencia del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B/blob/main/LICENSE
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
