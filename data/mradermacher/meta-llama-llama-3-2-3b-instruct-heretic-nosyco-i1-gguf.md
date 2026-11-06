# mradermacher/meta-llama-Llama-3.2-3B-Instruct-heretic-nosyco-i1-GGUF

## Resumen

Esta ficha corresponde a una cuantización GGUF del modelo **UnstableLlama/meta-llama-Llama-3.2-3B-Instruct-heretic-nosyco**, publicada por el usuario mradermacher en Hugging Face. El modelo base es un fine-tuning de Llama 3.2 3B Instruct de Meta, concretamente una variante "heretic" orientada a reducir la sycophancy (complacencia excesiva ante el usuario), un problema conocido en los LLM alineados que tienden a aceptar afirmaciones incorrectas del interlocutor en lugar de corregirlas. La versión de mradermacher no añade capacidades nuevas: su valor está en hacer el modelo ejecutable localmente mediante GGUF con calibración imatrix.

Con 3.212.749.888 parámetros, se trata de un modelo ligero pensado para inferencia en hardware de consumo, con soporte de los idiomas originales de Llama 3.2 (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés). Su relevancia actual radica en la creciente atención hacia el problema de la sycophancy en modelos desplegados en producción, donde un asistente demasiado complaciente puede validar errores médicos, legales o técnicos.

La licencia es la Llama 3.2 Community License de Meta, que permite uso comercial con condiciones (atribución "Built with Llama" y límite de 700 millones de usuarios activos mensuales).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Llama 3.2), no disponible detalle adicional |
| Parámetros totales | 3.212.749.888 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible (el Llama 3.2 3B original soporta 128.000 tokens, pero no consta en la información proporcionada) |
| Tipos de cuantizacion | GGUF con imatrix (variantes i1; tamaños exactos no disponibles, repo de 38,9 GB) |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | GGUF (cuantizado desde safetensors del modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 3B: un transformer decoder autorregresivo de Meta. El modelo base del que parte esta cuantización es un fine-tuning comunitario etiquetado como "heretic" y "no-sycophancy", lo que indica un entrenamiento adicional dirigido a que el modelo contradiga afirmaciones falsas del usuario en lugar de acceder a ellas. No se dispone de información sobre el dataset utilizado, el número de tokens de entrenamiento ni el método exacto (SFT, DPO, RLHF) empleado en ese fine-tuning.

La contribución de mradermacher es la cuantización GGUF con matrices de importancia (imatrix), una técnica que calibra la cuantización usando datos de activación reales para reducir la pérdida de calidad en cuantizaciones agresivas. Las variantes "i1" de mradermacher suelen incluir cuantizaciones de la serie IQ (IQ1_S a IQ4_XS) y Q4/Q5/Q6/Q8, pero los tamaños exactos disponibles no constan en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline conversational).
- Razonamiento general heredado de Llama 3.2 3B Instruct, con ajuste para resistirse a la sycophancy: el modelo está orientado a corregir al usuario cuando este afirma algo incorrecto.
- Capacidades multilingües en ocho idiomas: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés.
- Compatibilidad con el ecosistema GGUF: llama.cpp, Ollama, LM Studio, KoboldCpp y derivados.
- No hay información que confirme soporte de tool calling, function calling, visión ni audio en esta variante.

## Casos de uso

- **Asistentes que priorizan la corrección sobre la complacencia:** en aplicaciones donde el usuario puede introducir premisas falsas (soporte técnico, consultoría), el ajuste anti-sycophancy busca que el modelo señale el error en lugar de validarlo.
- **Chatbots locales y privados:** gracias al formato GGUF, puede ejecutarse íntegramente en local sin enviar datos a terceros, útil en entornos con requisitos de privacidad.
- **Prototipado en hardware de consumo:** con ~3B de parámetros, es adecuado para iterar prompts y pipelines en portátiles o GPUs domésticas antes de escalar a modelos mayores.
- **Investigación sobre sycophancy:** sirve como punto de comparación frente al Llama 3.2 3B Instruct original para estudiar cómo afecta un fine-tuning anti-complacencia a la honestidad del modelo.
- **Generación de contenido multilingüe:** soporte de ocho idiomas, incluido el español, para redacción y resumen ligero.
- **Integración en aplicaciones edge:** el bajo footprint de memoria permite desplegarlo en dispositivos con recursos limitados mediante llama.cpp u Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM/RAM estimada:** para un modelo de ~3,2B de parámetros, la cuantización Q4 ocupa aproximadamente 2 GB y Q8 unos 3,5 GB; las variantes IQ más agresivas pueden bajar de 1,5 GB. El tamaño total del repo (38,9 GB) corresponde al conjunto completo de cuantizaciones, no a un archivo individual.
- **GPUs recomendadas:** cualquier GPU moderna con 4 GB de VRAM o más (RTX 3060, RTX 4060, RTX 4090) ejecuta las cuantizaciones medias con holgura; también funciona solo con CPU y RAM.
- **Consumer GPUs:** sí, cabe con holgura en GPUs de gama media e incluso en portátiles sin GPU dedicada (inferencia por CPU).
- **Despliegue:** llama.cpp, Ollama, LM Studio, KoboldCpp, GPT4All y cualquier runtime compatible con GGUF. No es la cuantización adecuada para vLLM o TGI, que requieren pesos safetensors/awq/gptq.
- **Latencia y throughput:** no disponible; al ser un modelo de 3B cuantizado, se esperan velocidades de decodificación altas incluso en CPU, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| meta-llama/Llama-3.2-3B-Instruct | 3,21B | 128.000 tokens (según ficha oficial de Meta) | Llama 3.2 Community | Modelo original sin ajuste anti-sycophancy |
| UnstableLlama/...-heretic-nosyco (base de esta ficha) | 3,21B | no disponible | Llama 3.2 Community | Fine-tuning anti-sycophancy, safetensors |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens | Qwen Research (uso comercial permitido con condiciones) | Alternativa de tamaño similar con fuerte rendimiento en código y matemáticas |

## Limitaciones y advertencias

- **Riesgo de alucinación:** inherente a cualquier LLM de 3B; el ajuste anti-sycophancy puede reducir la complacencia pero no elimina las alucinaciones factuales.
- **Capacidad limitada:** con 3B de parámetros, el rendimiento en razonamiento complejo, código avanzado y matemáticas es muy inferior al de modelos de 70B o superiores.
- **Contexto:** no consta en la información proporcionada; si hereda el de Llama 3.2 3B (128.000 tokens), el uso efectivo con cuantizaciones agresivas puede degradar la calidad en contextos largos.
- **Licencia:** la Llama 3.2 Community License exige mostrar "Built with Llama", incluir el aviso de copyright y el nombre del modelo debe empezar por "Llama" si se deriva; restringe el uso a productos con menos de 700 millones de usuarios activos mensuales sin licencia expresa de Meta. Además, este repo hereda el gated access del modelo base, que requiere aceptar los términos de Meta.
- **Cuantización:** las cuantizaciones IQ agresivas implican pérdida de calidad respecto a los pesos originales; para producción con máxima fidelidad, preferir Q6_K/Q8_0 o los safetensors del modelo base.
- **Procedencia del fine-tuning:** no hay documentación pública detallada sobre el método de entrenamiento anti-sycophancy ni su evaluación, por lo que su eficacia no está verificada de forma independiente.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/mradermacher/meta-llama-Llama-3.2-3B-Instruct-heretic-nosyco-i1-GGUF
- Modelo base: https://huggingface.co/UnstableLlama/meta-llama-Llama-3.2-3B-Instruct-heretic-nosyco
- Llama 3.2 (Meta): https://www.llama.com/llama-downloads
- Acceptable Use Policy de Llama: https://www.llama.com/llama3_2/use-policy
- Documentación de Llama: https://llama.meta.com/doc/overview
