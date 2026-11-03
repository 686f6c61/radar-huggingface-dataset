# kaist22/Tri-0.5B-Base

## Resumen

Tri-0.5B-Base es un modelo de lenguaje multilingüe de aproximadamente 472 millones de parámetros desarrollado por Trillion Labs (publicado en HuggingFace bajo la cuenta kaist22) como ejecución experimental temprana previa al entrenamiento del modelo Tri-7B. Se trata de un transformer decoder-only de estilo LLaMA, entrenado desde cero sobre aproximadamente 1,26 billones de tokens, con cobertura de inglés, coreano, japonés y chino, además de exposición a lenguajes de programación y razonamiento matemático.

El modelo se distribuye como base preentrenada, sin ajuste por instrucciones ni RLHF, y su propósito declarado es servir de fundamento para fine-tuning posterior, investigación en preentrenamiento multilingüe y desarrollo de la comunidad open source, con especial énfasis en el avance de los LLM en coreano. Su tamaño reducido (0,9 GB en safetensors en bfloat16) lo hace manejable en hardware de consumo y adecuado como banco de pruebas para experimentos de adaptación lingüística.

Es relevante ahora por dos motivos: por un lado, la escasez de modelos base de menos de 1B parámetros con cobertura real de coreano, japonés y chino además del inglés; por otro, su licencia Apache 2.0 sin restricciones adicionales, que permite uso comercial y modificación sin cláusulas de atribución más allá de las estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo LLaMA |
| Parámetros totales | 471.870.336 (~472M) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16; compatibles con cuantización estándar vía herramientas externas) |
| Idiomas soportados | inglés, coreano, japonés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Datos arquitectónicos adicionales: 24 capas, hidden size 896, 14 cabezas de atención, feedforward de 2.560 con MLP con activación SiLU y compuerta, embeddings y cabeza LM sin atar (untied), RoPE con theta 100.000, precisión de entrenamiento bfloat16.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de estilo LLaMA con normalización pre-RMSNorm (implícita en el diseño LLaMA, aunque la model card no lo detalla explícitamente), atención multi-cabeza con RoPE de theta 100.000 y MLP con compuerta SiLU. La decisión de no atar los embeddings de entrada y la cabeza de salida (untied embeddings and LM head) es destacable en un modelo de este tamaño, ya que añade parámetros respecto a la práctica habitual en modelos pequeños, donde el weight tying suele emplearse para reducir el recuento.

El entrenamiento se realizó sobre aproximadamente 1,26 billones de tokens en bfloat16, una cifra muy elevada para un modelo de 472M parámetros (ratio de aproximadamente 2.670 tokens por parámetro), lo que sugiere una apuesta por la sobreexposición de datos típica de las recetas de escalado tipo Chinchilla o superiores. La composición exacta del dataset no está disponible. No se aplicó ajuste por instrucciones, RLHF ni DPO: el modelo es exclusivamente base. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o arquitecturas híbridas.

## Capacidades

- Generación de texto autoregresiva en inglés, coreano, japonés y chino.
- Exposición a lenguajes de programación y razonamiento matemático durante el preentrenamiento (sin evaluación publicada de estas capacidades).
- Capacidad de servir como base para fine-tuning supervisado y alineamiento posterior.
- Soporte de tool calling / function calling: no disponible (modelo base sin ajuste).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa (modelo base).
- Capacidades multilingües limitadas a los cuatro idiomas declarados; no se documenta cobertura de otros idiomas.
- Capacidad especial de thinking mode, visión o audio: no disponible.

## Casos de uso

- Fine-tuning para atención al cliente en coreano: el modelo puede adaptarse mediante SFT sobre diálogos multi-turno con contexto de hasta 4.096 tokens, suficiente para conversaciones de soporte de longitud media; su licencia Apache 2.0 permite desplegarlo comercialmente sin restricciones.
- Investigación en preentrenamiento multilingüe: sirve como punto de partida controlado y de bajo coste para estudiar transferencia entre coreano, japonés, chino e inglés, con un ratio tokens/parámetro documentado de ~2.670.
- Generación de código asistida tras fine-tuning: la exposición a lenguajes de programación durante el preentrenamiento permite adaptarlo con datasets específicos (por ejemplo, instrucciones de código) para autocompletado o generación de snippets en entornos de desarrollo.
- Clasificación y etiquetado de texto multilingüe: mediante fine-tuning con cabeza de clasificación, puede emplearse para moderación de contenido, análisis de sentimiento o categorización de documentos en los cuatro idiomas soportados.
- Prototipado rápido en hardware de consumo: con 0,9 GB en bfloat16 y aproximadamente 0,5 GB en cuantización de 8 bits, cabe en GPUs consumer (RTX 3060, RTX 4060, etc.) y permite iterar sobre pipelines de inferencia sin infraestructura dedicada.
- Base para experimentos de alineamiento: al no tener RLHF, es un sustrato limpio para comparar técnicas de DPO, ORPO o RLHF en un modelo pequeño y reproducible antes de escalar a modelos de 7B.
- Educación e investigación académica: su tamaño y licencia permiten usarlo en cursos y laboratorios donde no se dispone de clústeres de GPU, para estudiar dinámicas de entrenamiento y evaluación de modelos base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1 GB de pesos más overhead de activaciones y caché KV; en la práctica, entre 2 y 3 GB para contexto completo de 4.096 tokens.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,5 GB de pesos; entre 1 y 2 GB con caché KV.
- VRAM estimada en cuantización de 4 bits: aproximadamente 0,3 GB de pesos; entre 1 y 1,5 GB con caché KV.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes. También es viable en CPU para inferencia de baja concurrencia.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna (RTX 20xx en adelante, e incluso iGPU con suficiente memoria compartida para cuantizaciones agresivas).
- Opciones de despliegue: transformers (referencia oficial), llama.cpp, Ollama, vLLM y TGI son compatibles al ser una arquitectura LLaMA estándar; la conversión a GGUF requiere herramientas externas dado que solo se publican safetensors.
- Latencia y throughput estimados: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Tri-0.5B-Base | ~472M | 4.096 | en, ko, ja, zh | Apache 2.0 | safetensors |
| Qwen2.5-0.5B | ~494M | 32.768 | multilingüe (29+) | Apache 2.0 | safetensors, GGUF |
| SmolLM2-360M | ~362M | 8.192 | principalmente inglés | Apache 2.0 | safetensors, GGUF |
| Gemma-2-2B | ~2.600M | 8.192 | multilingüe | Gemma license | safetensors |

La comparación con Qwen2.5-0.5B es la más directa por tamaño y licencia: Qwen2.5 ofrece contexto ocho veces mayor y cobertura de más idiomas, mientras que Tri-0.5B-Base declara un entrenamiento con un ratio tokens/parámetro muy superior (~2.670 frente a cifras no publicadas de Qwen). SmolLM2-360M compite en el segmento sub-500M pero con foco casi exclusivo en inglés. Gemma-2-2B es cuatro veces mayor y no es directamente comparable en coste de despliegue. No se dispone de benchmarks que permitan comparar rendimiento real entre estos modelos.

## Limitaciones y advertencias

- Al ser un modelo exclusivamente base, las salidas pueden ser incoherentes, inseguras o factualmente incorrectas; no debe usarse directamente en producción orientada a usuario final sin fine-tuning y alineamiento.
- Riesgo elevado de alucinación: no se ha aplicado RLHF ni DPO, y no hay evaluación publicada de fidelidad factual.
- Sesgos conocidos: no documentados por el autor; al entrenarse sobre datos web multilingües es probable que herede sesgos de género, culturales y geográficos, pero no se han publicado análisis.
- Limitación de contexto: 4.096 tokens es reducido frente a los 32K o 128K de modelos contemporáneos del mismo segmento, lo que restringe casos de uso con documentos largos.
- Cobertura lingüística limitada a cuatro idiomas; no se garantiza un rendimiento aceptable fuera de ellos.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantías ni soporte.
- Estado experimental: el propio autor lo describe como una ejecución temprana previa al Tri-7B, por lo que no debe considerarse una versión estable ni representativa del rendimiento final de la familia.
- Inconsistencia de identidad: el modelo se publica bajo la cuenta kaist22 pero la model card referencia trillionlabs/Tri-0.5B-Base; conviene verificar la procedencia antes de integrarlo en pipelines críticos.

## Enlaces

- HuggingFace: https://huggingface.co/kaist22/Tri-0.5B-Base
- Model card de referencia citada: https://huggingface.co/trillionlabs/Tri-0.5B-Base
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
