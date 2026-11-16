# abhi44497/Qwen2.5-Coder-3B-Instruct-GGUF

## Resumen

Qwen2.5-Coder-3B-Instruct es un modelo de lenguaje causal especializado en código, desarrollado por Alibaba Cloud (equipo Qwen) como parte de la familia Qwen2.5-Coder (anteriormente CodeQwen). Esta ficha cubre la variante de 3B parametros en formato GGUF publicada por el usuario abhi44497, una re-cuantizacion del modelo original `Qwen/Qwen2.5-Coder-3B-Instruct`. El modelo resuelve tareas de generacion, razonamiento y correccion de codigo, y mantiene competencias generales en matematicas y conversacion gracias a su base Qwen2.5.

La arquitectura es un transformer causal con RoPE, SwiGLU, RMSNorm, atencion con sesgo QKV y embeddings ligados, con 36 capas y atencion GQA (16 cabezas para Q, 2 para KV). Cuenta con 3.397 millones de parametros totales (3.09B reportados en la model card, 2.77B sin embeddings) y una ventana de contexto completa de 32.768 tokens en formato GGUF.

Su relevancia actual radica en que ofrece capacidades de asistencia de codigo en un tamano que cabe en hardware de consumo, con cuantizaciones desde q2_K hasta q8_0, lo que facilita el despliegue local y en entornos con VRAM limitada. La familia Qwen2.5-Coder se entreno con 5.5 billones de tokens e incluye variantes de 0.5B a 32B; esta variante de 3B es un punto intermedio para tareas de autocompletado, generacion y agentes de codigo ligeros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm, atencion QKV con sesgo y embeddings ligados |
| Parametros totales | 3.397.103.616 (3.09B reportados; 2.77B sin embeddings) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (completa en GGUF; 131.072 con YARN solo en vLLM y modelos no GGUF) |
| Tipos de cuantizacion | q2_K, q3_K_M, q4_0, q4_K_M, q5_0, q5_K_M, q6_K, q8_0 |
| Idiomas soportados | Ingles (segun model card y tags) |
| Licencia | qwen-research (licencia "other") |
| Formato de pesos | GGUF (repo de 25.2 GB con multiples cuantizaciones) |
| Capas | 36 |
| Cabezas de atencion | 16 para Q, 2 para KV (GQA) |
| Etapa de entrenamiento | Preentrenamiento y postentrenamiento |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con 36 capas, normalizacion RMSNorm, activacion SwiGLU, embeddings de palabras ligados y atencion con group query attention (16 cabezas de consulta y 2 de clave/valor). Incorpora RoPE para el modelado posicional y sesgo en las proyecciones QKV. La variante GGUF conserva la ventana nativa de 32.768 tokens; la extension a 131.072 tokens mediante YARN solo esta soportada en vLLM y en los pesos no GGUF.

Segun la model card, la familia Qwen2.5-Coder se entreno con 5.5 billones de tokens que incluyen codigo fuente, datos de grounding texto-codigo y datos sinteticos. El modelo base se sometio a preentrenamiento y postentrenamiento (etapa instruct), aunque la informacion proporcionada no detalla la composicion exacta del dataset, el uso de RLHF/DPO ni innovaciones como decodificacion especulativa. La model card indica mejoras significativas en generacion, razonamiento y correccion de codigo respecto a CodeQwen1.5, manteniendo competencias en matematicas y tareas generales.

## Capacidades

- Generacion de codigo en multiples lenguajes de programacion, con enfasis en calidad y correccion.
- Razonamiento sobre codigo: explicacion de fragmentos, analisis de logica y deteccion de errores.
- Correccion de codigo (code fixing) y refactorizacion.
- Generacion de texto general y conversacion multi-turno en modo chat.
- Competencias matematicas y de razonamiento general heredadas de Qwen2.5.
- Capacidad de servir como base para agentes de codigo (Code Agents), segun la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo thinking explicito: no disponible en la informacion proporcionada.
- Idiomas: ingles como idioma principal declarado.

## Casos de uso

- Autocompletado de codigo en editores: el modelo puede integrarse en extensiones de IDE para sugerir lineas y bloques de codigo, aprovechando su contexto de 32.768 tokens para considerar archivos completos o fragmentos amplios.
- Asistente de revision de codigo en pull requests: con capacidad de razonamiento sobre codigo, puede analizar diffs y senalar errores logicos o malas practicas antes de la fusion, ejecutandose en local con llama.cpp.
- Generacion de tests unitarios: dado un fragmento de codigo, el modelo puede producir casos de prueba, lo que resulta util en pipelines de CI/CD donde se requiere cobertura adicional sin enviar codigo a servicios externos.
- Chat de soporte para desarrolladores: su modo conversacional y contexto largo permiten mantener sesiones multi-turno explicando APIs, errores de compilacion o patrones de diseno.
- Correccion automatica de codigo en herramientas de migracion: el modelo puede reescribir fragmentos obsoletos o adaptar codigo entre versiones de lenguajes y frameworks, con cuantizacion q5_K_M para equilibrar calidad y VRAM.
- Prototipado local en equipos con GPU de consumo: al caber en GPUs como RTX 3060/4060 con cuantizaciones q4_K_M o q5_K_M, permite experimentar con asistentes de codigo sin depender de la nube.
- Educacion y tutoria de programacion: el modelo puede explicar conceptos, corregir ejercicios de estudiantes y generar ejemplos progresivos en ingles, su idioma principal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al blog oficial de Qwen2.5-Coder para resultados detallados, pero no incluye cifras concretas de MMLU, HumanEval, GSM8K ni otras evaluaciones en el material proporcionado. No se inventan numeros.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-3 GB con q4_K_M, 3-4 GB con q5_K_M, 4-5 GB con q6_K y 5-6 GB con q8_0 (estimaciones basadas en el tamano de pesos de un modelo de 3.4B parametros; no confirmadas en la informacion proporcionada).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090, A100 y H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: si, en modelos con 6-8 GB de VRAM o superiores usando cuantizaciones q4_K_M o q5_K_M.
- Opciones de despliegue: llama.cpp (recomendado en la model card), vLLM (unico soporte de YARN para extension de contexto), Ollama y TGI como alternativas compatibles con GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; la model card remite a la pagina de benchmarks de velocidad de Qwen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-Coder-3B-Instruct (este, GGUF) | 3.09B | 32.768 | qwen-research | GGUF | Variante cuantizada de 3B especializada en codigo |
| Qwen2.5-Coder-1.5B-Instruct | 1.5B | 32.768 (no confirmado en esta ficha) | qwen-research | safetensors/GGUF | Menor huella, menor capacidad |
| Qwen2.5-Coder-7B-Instruct | 7B | 32.768 (no confirmado en esta ficha) | qwen-research | safetensors/GGUF | Mayor capacidad, requiere mas VRAM |
| Qwen2.5-Coder-32B-Instruct | 32B | 131.072 (no confirmado en esta ficha) | qwen-research | safetensors/GGUF | Estado del arte abierto en codigo segun la model card |

Las cifras de contexto y rendimiento de los modelos comparados no se detallan en la informacion proporcionada; se indican como no confirmadas. La comparativa se limita a la misma familia, ya que no se aportan datos de modelos de otros fabricantes.

## Limitaciones y advertencias

- Licencia qwen-research: restringe el uso comercial; es necesario revisar los terminos completos antes de desplegar en produccion.
- Idioma principal declarado: ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Riesgo de alucinacion: como todo LLM, puede generar APIs, funciones o fragmentos de codigo inexistentes; requiere validacion y tests automatizados.
- Contexto limitado a 32.768 tokens en GGUF; la extension a 131.072 solo esta disponible en vLLM y con pesos no GGUF.
- Repo de terceros: la publicacion corresponde al usuario abhi44497, no al repositorio oficial de Qwen; conviene verificar la integridad de los archivos GGUF frente a los pesos originales.
- Sin datos de benchmarks en la informacion disponible: no es posible comparar su rendimiento con cifras verificadas.
- Sesgos conocidos: no documentados en la informacion proporcionada; se recomienda evaluacion propia antes de uso en produccion.
- Sin soporte confirmado de tool calling ni de agentes multi-paso en la informacion proporcionada.

## Enlaces

- Repositorio Hugging Face de esta variante: https://huggingface.co/abhi44497/Qwen2.5-Coder-3B-Instruct-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Repositorio GGUF oficial: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct-GGUF
- Blog de la familia Qwen2.5-Coder: https://qwenlm.github.io/blog/qwen2.5-coder-family/
- GitHub: https://github.com/QwenLM/Qwen2.5-Coder
- Documentacion: https://qwen.readthedocs.io/en/latest/
- Paper Qwen2.5-Coder: https://arxiv.org/abs/2409.12186
- Paper Qwen2: https://arxiv.org/abs/2407.10671
- Guia llama.cpp de Qwen: https://qwen.readthedocs.io/en/latest/run_locally/llama.cpp.html
- Benchmarks de velocidad: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Licencia: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct-GGUF/blob/main/LICENSE
