# mradermacher/Qwen3.8-Flash-Next-REAM-60Pct-i1-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF del modelo `Akicou/Qwen3.8-Flash-Next-REAM-60Pct`, preparada por mradermacher. El modelo base es una variante comprimida del Qwen3.8-Flash-Next de Alibaba, un modelo de lenguaje multimodal de tipo Mixture-of-Experts ultra-sparse con 125 mil millones de parámetros totales y 6 mil millones activos por token. La variante REAM-60Pct aplica una técnica de compresión o fusión (merge) que reduce la huella del modelo, aunque no se especifican los detalles exactos del proceso ni la cantidad final de parámetros. El objetivo de esta publicación es ofrecer una versión cuantizada en formato GGUF para facilitar la ejecución en entornos con recursos limitados, como estaciones de trabajo con GPU de consumo o CPU.

La cuantización ha sido realizada por mradermacher, un conocido proveedor de modelos GGUF, e incluye un archivo de matriz de importancia (imatrix) para que los usuarios puedan generar sus propias cuantizaciones personalizadas. El repositorio actual solo contiene el archivo imatrix (0,5 GB), mientras que las cuantizaciones estáticas están disponibles en un repositorio hermano. El modelo está marcado como compatible con la librería transformers y con endpoints de inferencia, aunque la licencia no está especificada en esta página.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GDN + QSA (Gated DeltaNet + Qwen Sparse Attention), MoE ultra-sparse |
| Parametros totales | no disponible (el modelo original Qwen3.8-Flash-Next tiene 125B; la variante REAM-60Pct no especifica) |
| Parametros activos | no disponible (el original activa 6B por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S (según model card; el repo actual solo contiene imatrix) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible (el modelo base Qwen3.8-Flash-Next usa licencia qwen-community-1) |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura híbrida que combina Gated DeltaNet (GDN) con Qwen Sparse Attention (QSA). En tres de cada cuatro capas se utiliza GDN para comprimir el historial de tokens, mientras que la cuarta capa usa QSA para recuperación precisa de información a larga distancia. El conjunto de parámetros incluye una tabla de embeddings N-gram de 51 mil millones de parámetros adicionales, elevando el total a 125B, aunque solo se activan 6B por token gracias al diseño MoE ultra-sparse.

La variante REAM-60Pct es un merge o compresión del modelo original, probablemente diseñada para reducir el número total de parámetros o el coste de inferencia manteniendo una parte de las capacidades. No se dispone de información pública sobre el proceso de entrenamiento, el dataset utilizado ni si se aplicaron técnicas de alineación como RLHF o DPO. El archivo safetensors del modelo base indica 88.480.822 parámetros, una cifra que resulta inconsistente con un MoE de 125B y que podría corresponder a una versión podada o a un error de metadata; por tanto, se considera no disponible.

## Capacidades

- Generación de texto y finalización de prompts en inglés.
- Razonamiento complejo y resolución de problemas matemáticos y lógicos.
- Generación de código y asistencia en programación.
- Capacidades multimodales del modelo original (visión y audio), aunque la variante REAM-60Pct podría tenerlas degradadas o eliminadas.
- Soporte de tool calling y function calling (heredado del modelo base, aunque no confirmado para esta variante).
- Capacidad para actuar como agente en tareas multi-paso.
- Contexto largo gracias a la arquitectura de atención híbrida (en el original, aunque no se especifica la longitud exacta para esta variante).

## Casos de uso

- Asistente de codigo en entornos de desarrollo: el modelo puede autocompletar funciones, explicar fragmentos y generar tests unitarios. Su naturaleza MoE con 6B activos permite una inferencia relativamente rapida en GPUs modernas, y la cuantizacion GGUF facilita su integracion con herramientas como llama.cpp u Ollama.
- Chatbot de soporte tecnico en ingles: con capacidad de mantener conversaciones multi-turno y recuperar informacion de manuales o documentacion, puede desplegarse en local para evitar enviar datos sensibles a la nube.
- Analisis de documentos y extraccion de informacion: gracias a su contexto largo (si se conserva del modelo original), puede procesar informes extensos y resumir o extraer entidades relevantes.
- Generacion de contenido creativo: redaccion de articulos, guiones o correos electronicos en ingles, aprovechando su capacidad de razonamiento y coherencia textual.
- Educacion y tutoria: el modelo puede explicar conceptos de matematicas, fisica o programacion de forma interactiva, adaptando las respuestas al nivel del usuario.
- Prototipado rapido de aplicaciones de IA: al estar disponible en GGUF, puede probarse en CPU o GPU de consumo para validar ideas antes de escalar a modelos mas grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para la variante REAM-60Pct ni para la cuantizacion GGUF. El modelo original Qwen3.8-Flash-Next ha sido evaluado en tareas estandar, pero esos datos no se replican aqui por no estar disponibles para esta version comprimida.

## Requisitos de hardware

- El modelo base (125B parametros) requiere una GPU con al menos 80 GB de VRAM en precision completa, o 40-50 GB con cuantizacion Q4. Para la variante REAM-60Pct, el tamano real es desconocido, pero al estar cuantizada en GGUF, el archivo imatrix ocupa 0,5 GB, lo que sugiere que el modelo cuantizado completo podria caber en GPUs de 8-16 GB si la compresion es agresiva.
- GPUs recomendadas: NVIDIA RTX 3090/4090 (24 GB) para cuantizaciones Q4 o inferiores; A100 o H100 para precision completa.
- Si la variante mantiene la arquitectura MoE con 6B activos, la inferencia puede ejecutarse en CPU con suficiente RAM (32 GB o mas) usando llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (si se convierte a formato compatible), TGI.
- Latencia estimada: no disponible sin benchmarks concretos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (original) | 125B totales, 6B activos | no disponible | qwen-community-1 | safetensors | Modelo base, multimodal, arquitectura GDN+QSA |
| REAM-60Pct (este modelo) | no disponible | no disponible | no disponible | GGUF | Variante comprimida, cuantizada por mradermacher |
| DeepSeek-V3 | 671B totales, 37B activos | 128K | MIT (modelo) | safetensors | MoE denso, alto rendimiento en razonamiento |
| Mixtral 8x7B | 46.7B totales, 12.9B activos | 32K | Apache 2.0 | safetensors | MoE mas pequeno, amplia adopcion |

La comparativa es limitada por falta de datos sobre la variante REAM-60Pct. El modelo original destaca por su arquitectura innovadora y su eficiencia (6B activos), pero la version comprimida no tiene metricas publicas.

## Limitaciones y advertencias

- La licencia no esta especificada en este repositorio; el modelo base usa la licencia qwen-community-1, que permite uso comercial con restricciones (consultar terminos).
- Al ser una cuantizacion y compresion, es probable que se observe una degradacion en la calidad de las respuestas, especialmente en tareas de razonamiento complejo o generacion de codigo.
- El modelo solo soporta ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- No se dispone de informacion sobre sesgos o alucinaciones especificos de esta variante, pero hereda los riesgos del modelo base.
- El repositorio actual solo contiene el archivo imatrix; para obtener los quants completos hay que acceder al repositorio hermano, lo que anade un paso adicional.
- La variante REAM-60Pct no tiene documentacion tecnica detallada sobre el proceso de compresion, lo que dificulta evaluar su fiabilidad en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.8-Flash-Next-REAM-60Pct-i1-GGUF
- Modelo base: https://huggingface.co/Akicou/Qwen3.8-Flash-Next-REAM-60Pct
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwen3.8-Flash-Next-REAM-60Pct-GGUF
- Pagina del proyecto Qwen3.8-Flash-Next en GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Receta vLLM para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Entrada en AI Wiki: https://aiwiki.ai/wiki/qwen3_8_flash_next
