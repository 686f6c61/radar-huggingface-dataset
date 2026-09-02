# ckcegg/gemma-4-E2B-it-qat-q4_0-unquantized-assistant

## Resumen

Este repositorio contiene el checkpoint QAT sin cuantizar del modelo asistente (drafter) de Gemma 4 E2B, desarrollado por Google DeepMind y subido a Hugging Face por el usuario ckcegg. Se trata de un modelo pequeño de 78 millones de parámetros diseñado específicamente para decodificación especulativa: actúa como modelo auxiliar que genera tokens candidatos para acelerar la inferencia del modelo principal Gemma 4 E2B, manteniendo una calidad similar al modelo en bfloat16 pero con un coste de memoria muy reducido.

El modelo forma parte de la familia Gemma 4 QAT (Quantization-Aware Training), que incluye checkpoints optimizados para diferentes formatos de despliegue. Este checkpoint concreto es la versión "unquantized" (pesos en precisión media extraídos del pipeline QAT), pensada para investigación y compilación personalizada. Aunque el modelo base es multimodal (texto, imagen y audio), su función principal aquí es la de asistente de decodificación, no la de generación autónoma.

La relevancia de este modelo radica en su papel dentro del ecosistema Gemma 4: permite ejecutar el modelo E2B completo en dispositivos con recursos limitados (portátiles, móviles) mediante decodificación especulativa, reduciendo la latencia y el consumo de memoria sin sacrificar calidad. Su licencia Apache 2.0 facilita su uso comercial y su integración en pipelines de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion hibrida (sliding window + global) |
| Parametros totales | 77.993.476 (~78M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K tokens (segun familia E2B) |
| Tipos de cuantizacion | Q4_0 (checkpoint QAT sin cuantizar, pesos en precision media) |
| Idiomas soportados | Mas de 140 idiomas (segun familia Gemma 4) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso con atencion hibrida que intercala ventanas deslizantes locales con atencion global completa, siguiendo el diseno de la familia Gemma 4. La capa final es siempre global, y las capas globales utilizan Keys y Values unificados junto con RoPE proporcional (p-RoPE) para optimizar la memoria en contextos largos. Como drafter, su arquitectura es una version reducida del modelo principal E2B, con 35 capas y un vocabulario de 262K tokens.

El entrenamiento se realizo mediante Quantization-Aware Training (QAT), un proceso que incorpora la cuantizacion durante el entrenamiento para que el modelo aprenda a compensar los errores de cuantizacion. Esto permite que, una vez cuantizado a Q4_0, el modelo mantenga una calidad similar al original en bfloat16. Los pesos de este checkpoint estan sin cuantizar (extraidos del pipeline QAT en precision media) para permitir investigacion y compilacion personalizada. No se dispone de informacion detallada sobre el dataset de entrenamiento ni sobre el uso de RLHF o DPO en este checkpoint especifico.

## Capacidades

- Decodificacion especulativa: genera tokens candidatos para acelerar la inferencia del modelo principal Gemma 4 E2B, reduciendo la latencia en hasta un 2-3x en cargas de trabajo tipicas.
- Compatibilidad multimodal: al estar basado en el modelo E2B, procesa entradas de texto, imagen y audio, aunque su uso principal es como asistente de decodificacion.
- Soporte multilingue: cubre mas de 140 idiomas, lo que permite su uso en entornos internacionales.
- Soporte de tool calling y funciones: hereda las capacidades de function calling del modelo base, aunque su tamano reducido limita la complejidad de las tareas que puede manejar de forma autonoma.
- Modo de razonamiento configurable: compatible con los modos de pensamiento del modelo principal, aunque su capacidad de razonamiento profundo es limitada.
- Sistema de prompt nativo: soporta el rol `system` para conversaciones estructuradas.

## Casos de uso

- Aceleracion de inferencia en produccion: el caso principal es emparejar este drafter con el modelo Gemma 4 E2B principal en un servidor de inferencia (por ejemplo, vLLM o TGI) para reducir la latencia de generacion. El drafter genera multiples tokens candidatos en paralelo, y el modelo principal los verifica, logrando un throughput hasta 2-3 veces mayor que sin decodificacion especulativa.
- Despliegue en dispositivos moviles: gracias a su tamano de 78M parametros y su compatibilidad con cuantizacion Q4_0, puede ejecutarse en telefonos de gama alta y tablets, permitiendo inferencia local del modelo E2B completo con asistencia del drafter.
- Investigacion en cuantizacion: al ser un checkpoint QAT sin cuantizar, es util para estudiar el impacto de la cuantizacion en modelos pequenos y para desarrollar nuevas tecnicas de compresion.
- Prototipado rapido: los desarrolladores pueden usar este drafter para probar pipelines de decodificacion especulativa sin necesidad de cargar el modelo completo, reduciendo los requisitos de memoria durante el desarrollo.
- Sistemas de agentes en el borde: combinado con el modelo principal, permite ejecutar agentes autonomos con tool calling en entornos con recursos limitados, como routers o mini-PCs.
- Evaluacion de calidad QAT: sirve como referencia para comparar la calidad de modelos cuantizados frente a sus versiones en bfloat16, especialmente en tareas de generacion de codigo y razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este checkpoint drafter en la informacion disponible. La model card de Google menciona mejoras generales en benchmarks de codificacion y razonamiento para la familia Gemma 4, pero no desglosa resultados para los modelos asistente. Se recomienda consultar el informe tecnico de Gemma 4 (arxiv:2607.02770) para datos comparativos de los modelos principales.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0.2 GB en precision media (bfloat16) y menos de 0.1 GB cuantizado a Q4_0. Cabe en cualquier GPU moderna, incluidas las integradas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluyendo NVIDIA GTX 1650, RTX 3050, o incluso CPUs con aceleracion AVX2.
- Compatibilidad con consumer GPU: si, es totalmente compatible con GPUs de consumo como RTX 3060, RTX 4090, y tambien con Apple Silicon (M1/M2/M3) mediante llama.cpp o MLX.
- Opciones de despliegue: vLLM (con compressed-tensors), llama.cpp, Ollama, TGI, y transformers nativo. Para decodificacion especulativa, se requiere un framework que soporte el emparejamiento drafter-modelo principal (vLLM y TGI lo soportan).
- Latencia y throughput: al ser un modelo de 78M parametros, la generacion de tokens es extremadamente rapida (menos de 1 ms por token en GPU moderna). El beneficio real se observa en la reduccion de latencia del modelo principal cuando se usa como drafter.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| gemma-4-E2B-it-qat-q4_0-unquantized-assistant (este) | 78M | 128K | Apache 2.0 | Drafter para decodificacion especulativa |
| gemma-4-E4B-it-qat-q4_0-unquantized-assistant | ~150M (estimado) | 128K | Apache 2.0 | Drafter para Gemma 4 E4B |
| gemma-4-12B-it-qat-q4_0-unquantized-assistant | ~400M (estimado) | 256K | Apache 2.0 | Drafter para Gemma 4 12B |

No se dispone de datos publicos de rendimiento para comparar estos drafters entre si. La eleccion entre ellos depende del modelo principal que se quiera acelerar: cada drafter esta optimizado para su modelo correspondiente.

## Limitaciones y advertencias

- No es un modelo autonomo: este checkpoint esta disenado exclusivamente como asistente de decodificacion especulativa. Usarlo como modelo independiente para generacion de texto o razonamiento producira resultados de baja calidad, ya que su tamano reducido no esta pensado para tareas complejas.
- Compatibilidad restringida: para funcionar correctamente, debe emparejarse con el modelo principal Gemma 4 E2B en su version QAT con la misma precision (Q4_0). Mezclar con otros modelos o precisiones puede provocar fallos o degradacion del rendimiento.
- Sesgos y alucinaciones: al ser un modelo pequeno entrenado con QAT, puede presentar sesgos presentes en los datos de entrenamiento de Gemma 4 y una mayor tendencia a alucinar en tareas de generacion libre.
- Limitaciones de idioma: aunque soporta mas de 140 idiomas, la calidad puede variar significativamente entre idiomas, especialmente en lenguas con menos representacion en el entrenamiento.
- Restricciones de licencia: aunque la licencia es Apache 2.0, el uso comercial esta sujeto a los terminos de la licencia de Gemma 4 de Google, que pueden incluir restricciones adicionales para ciertos casos de uso (consultar el enlace de licencia).
- Fecha de creacion: el repositorio fue creado en septiembre de 2026, lo que indica que es un modelo reciente y puede tener menos soporte comunitario que modelos mas establecidos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ckcegg/gemma-4-E2B-it-qat-q4_0-unquantized-assistant
- Modelo base (Google): https://huggingface.co/google/gemma-4-E2B-it-assistant
- Informe tecnico Gemma 4: https://arxiv.org/abs/2607.02770
- Blog de lanzamiento QAT: https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Documentacion de Gemma 4: https://ai.google.dev/gemma/docs/core
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Coleccion de modelos QAT en Hugging Face: https://huggingface.co/collections/google/gemma-4-qat-q4-0
