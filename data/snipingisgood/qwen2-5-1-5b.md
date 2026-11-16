# Snipingisgood/Qwen2.5-1.5B

## Resumen
Qwen2.5-1.5B es la variante base (solo preentrenamiento) del modelo de lenguaje de 1.500 millones de parametros de la familia Qwen2.5, desarrollada por el equipo Qwen de Alibaba. Este repositorio concreto (`Snipingisgood/Qwen2.5-1.5B`) es una redistribucion de los pesos oficiales bajo licencia Apache 2.0, sin modificaciones documentadas ni datos de entrenamiento adicionales. El modelo emplea una arquitectura transformer causal con RoPE, SwiGLU, RMSNorm, atencion con sesgo en QKV y embeddings atados, con 28 capas y atencion GQA (12 cabezas de consulta y 2 de clave-valor).

La relevancia de esta variante radica en su tamano contenido (1.540 millones de parametros, 1.310 millones sin contar embeddings), que permite ejecutarla en GPUs de consumo con cuantizacion, y en su contexto nativo de 32.768 tokens, ampliable teoricamente hasta 128K segun la documentacion de la familia. Al ser un modelo base, no incorpora ajuste por instrucciones ni alineamiento RLHF, por lo que esta pensado como punto de partida para fine-tuning, no para uso conversacional directo.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que se trata de una copia no oficial sin traccion en la comunidad. Para produccion se recomienda acudir al repositorio oficial de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm, atencion QKV con sesgo y embeddings atados (GQA: 12 cabezas Q, 2 cabezas KV) |
| Parametros totales | 1.543.714.304 (1,54B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos (hasta 128K segun documentacion de la familia) |
| Tipos de cuantizacion | No especificados en la model card; pesos en safetensors (compatibles con cuantizacion posterior via GPTQ, AWQ, GGUF, etc.) |
| Idiomas soportados | Ingles declarado en la model card; la familia Qwen2.5 declara soporte de mas de 29 idiomas (chino, espanol, frances, portugues, aleman, italiano, ruso, japones, coreano, vietnamita, tailandes, arabe, entre otros) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers) |

## Arquitectura y entrenamiento
El modelo es un transformer causal denso de 28 capas con 1.540 millones de parametros totales y 1.310 millones sin embeddings. Incorpora RoPE (Rotary Positional Embeddings) para la codificacion posicional, activacion SwiGLU en las capas feed-forward, normalizacion RMSNorm y embeddings de palabras atados con la cabeza de salida. La atencion utiliza Grouped Query Attention con 12 cabezas de consulta y 2 de clave-valor, lo que reduce el coste de memoria del KV cache durante la inferencia. El contexto nativo es de 32.768 tokens.

Segun la model card, este checkpoint corresponde unicamente a la fase de preentrenamiento del modelo base. No se detalla el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (en esta variante no las hay, al ser base). La familia Qwen2.5 declara mejoras respecto a Qwen2 en conocimiento, codigo y matematicas gracias a modelos expertos especializados en esos dominios, ademas de mejor seguimiento de instrucciones y generacion de JSON estructurado, aunque estas mejoras se materializan plenamente en las variantes instruct. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal en este checkpoint.

## Capacidades
- Generacion de texto autoregresiva en modo completion (no conversacional).
- Razonamiento basico y modelado de lenguaje general derivado del preentrenamiento.
- Capacidades de codigo y matematicas mejoradas respecto a la generacion anterior, segun la documentacion de la familia.
- Comprension y generacion de datos estructurados (tablas, JSON) segun la familia Qwen2.5.
- Soporte multilingue declarado para mas de 29 idiomas en la familia, aunque la model card de este repo solo lista ingles.
- Capacidad de generar textos largos (hasta 8K tokens de salida segun la familia).
- No incluye tool calling ni function calling de forma nativa (requiere post-entrenamiento).
- No incluye modo thinking, vision ni audio.
- No apto para uso conversacional directo sin SFT o RLHF.

## Casos de uso
- Fine-tuning supervisado (SFT) para dominios verticales: al ser un modelo base de 1,5B, sirve como punto de partida para adaptar a tareas especificas (clasificacion, extraccion, resumen) con coste de entrenamiento bajo en una sola GPU.
- Generacion de texto en aplicaciones de autocompletado o continuacion: el modelo completa secuencias de forma coherente gracias a su preentrenamiento, adecuado para asistentes de escritura o generacion de borradores.
- Investigacion en mecanismos de interpretabilidad: su tamano reducido y arquitectura estandar (transformer con GQA) facilitan experimentos de analisis de activaciones, atencion y representaciones internas.
- Prototipado rapido de pipelines de NLP: sirve como baseline en tareas de modelado de lenguaje para comparar con modelos ajustados, con inferencia viable en GPUs de consumo.
- Generacion de datos sinteticos para entrenamiento: puede producir texto diverso en ingles para aumentar datasets en dominios con pocos datos, con la cautela de filtrar calidad y sesgos.
- Despliegue en entornos con recursos limitados: con cuantizacion a 4 u 8 bits cabe en GPUs consumer de 4-8 GB, util para demos locales, edge computing o entornos sin acceso a la nube.
- Base para experimentos de RLHF/DPO: al no estar alineado, permite estudiar el efecto de tecnicas de alineamiento desde cero sobre un modelo de referencia.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible para este repositorio concreto. La model card remite al blog oficial de Qwen2.5 para resultados detallados de la familia, pero no incluye tablas numericas en el texto proporcionado.

## Requisitos de hardware
- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,1 GB solo para pesos, mas KV cache y activaciones; en la practica se recomiendan 6-8 GB.
- VRAM estimada con cuantizacion 8 bits: alrededor de 1,6 GB para pesos; con 4 bits, aproximadamente 0,8-1 GB para pesos, mas overhead.
- GPUs recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 para inferencia holgada; A100 o H100 para entrenamiento o fine-tuning a mayor escala.
- Cabe en GPUs de consumo: si, en la mayoria de GPUs modernas con 6-8 GB o mas en FP16, y en GPUs de 4 GB con cuantizacion 4 bits.
- Opciones de despliegue: transformers (recomendado >=4.37.0), text-generation-inference (TGI), vLLM, llama.cpp (requiere conversion a GGUF), Ollama (via GGUF), ademas de endpoints compatibles segun los tags del repo.
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card remite a la pagina de benchmarks de velocidad de Qwen para datos de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen2.5-1.5B (este repo) | 1,54B | 32.768 | Apache 2.0 | Hugging Face (copia no oficial) | Modelo base, sin alineamiento |
| Qwen2.5-1.5B-Instruct (oficial) | 1,54B | 32.768 | Apache 2.0 | Hugging Face (repo oficial Qwen) | Version ajustada para conversacion y tool use |
| Llama 3.2 1B | 1,24B | 128K | Llama 3.2 Community License | Hugging Face (Meta) | Requiere aceptar licencia; contexto mayor |
| SmolLM2-1.7B | 1,7B | 8K (ampliable) | Apache 2.0 | Hugging Face (HuggingFaceTB) | Enfocado a eficiencia y edge |

La comparativa se limita a datos publicos de cada modelo; no se dispone de resultados de benchmarks de este repositorio concreto para comparar rendimiento numerico.

## Limitaciones y advertencias
- Modelo base sin alineamiento: puede generar contenido toxico, sesgado o factualmente incorrecto; no debe usarse en conversacion directa con usuarios finales sin post-entrenamiento.
- Riesgo elevado de alucinacion en tareas factuales, especialmente por su tamano reducido y falta de RLHF.
- La model card de este repo solo declara ingles como idioma; el soporte multilingue de la familia no esta garantizado en este checkpoint concreto.
- Contexto nativo de 32.768 tokens; la extension a 128K requiere tecnicas adicionales (RoPE scaling) no documentadas en este repo.
- Repositorio no oficial con 0 descargas y 0 likes: riesgo de que los pesos no coincidan exactamente con los oficiales o de que el repo sea eliminado; se recomienda verificar checksums o usar el repo oficial de Qwen.
- Licencia Apache 2.0 permite uso comercial, pero el autor de la redistribucion no ofrece garantias; para produccion, usar el repositorio oficial.
- Sin datos publicados de benchmarks para este checkpoint, no es posible validar su rendimiento real frente a la version oficial.
- Fecha de creacion del repo (2026-11-16) posterior a la publicacion oficial de Qwen2.5 (septiembre de 2024); verificar integridad de los pesos.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/Snipingisgood/Qwen2.5-1.5B
- Repositorio oficial Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Licencia oficial: https://huggingface.co/Qwen/Qwen2.5-1.5B/blob/main/LICENSE
- Blog Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- GitHub Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentacion Qwen: https://qwen.readthedocs.io/en/latest/
- Benchmarks de velocidad: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Paper Qwen2 (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
