# nebulaic-tech/aurora-prime-256b-moe

## Resumen

Aurora Prime 256B MoE es un modelo de lenguaje presentado por Nebulaic Tech como parte de su "Aurora AI Frontier Fleet". Según la model card del autor, se trata de un modelo de arquitectura Sparse Mixture-of-Experts con 258.6 mil millones de parámetros totales y 32.4 mil millones activos, diseñado para generación de código, razonamiento STEM profundo y verificación formal. La model card afirma un contexto de 1.000.000 de tokens y una latencia de 78 ms para el primer token.

Sin embargo, existe una discrepancia crítica: los archivos safetensors del repositorio contienen únicamente 1.573.072.896 parámetros (aproximadamente 1.57 mil millones), y el tamaño total del repositorio es de 3.1 GB, lo que es consistente con un modelo de ese tamaño en precisión fp16, no con uno de 258.6B. Esta inconsistencia, junto con la ausencia de descargas, likes o cualquier benchmark publicado, hace que las especificaciones declaradas deban tratarse con extrema cautela. El modelo está etiquetado con licencia Apache 2.0 y soporte multilingüe, aunque la model card se centra en inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse Mixture-of-Experts con Multi-Head Latent Attention (según model card) |
| Parametros totales | 258.6B (declarado por el autor) / 1.573.072.896 (dato real de safetensors) |
| Parametros activos | 32.4B (declarado por el autor) / no disponible para el dato real |
| Longitud de contexto | 1.000.000 tokens (declarado por el autor) / no verificado |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, multilingual (según metadatos) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card describe una arquitectura Sparse Mixture-of-Experts con 16 "neural experts" y atención latente multi-cabeza (MLA). No se proporciona información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se detallan innovaciones técnicas adicionales más allá de la mención de MLA. Dado que el número real de parámetros en safetensors es de aproximadamente 1.57B, es posible que la arquitectura real sea un modelo denso o un MoE pequeño, pero no hay forma de confirmarlo sin inspeccionar el código o los pesos. No se ha publicado ningún paper técnico ni documentación de entrenamiento.

## Capacidades

Según la model card del autor, el modelo es capaz de:

- Generación de código en NNPL (un lenguaje de programación nativo en inglés desarrollado por Nebulaic Tech) y en lenguajes estándar como Python, TypeScript, Rust, C++, Go y SQL.
- Razonamiento matemático profundo y verificación formal de pruebas (AST proofs).
- Auditorías de seguridad criptográfica.
- Arquitectura multi-archivo y compilación de software.
- Soporte multilingüe (aunque la model card se centra en inglés).

No se mencionan capacidades de tool calling, function calling, agentes o modo de razonamiento explícito. Tampoco hay evidencia independiente de estas capacidades, ya que no se han publicado benchmarks ni demos verificables.

## Casos de uso

Dado que las capacidades declaradas no están respaldadas por datos verificables, los casos de uso que se enumeran a continuación son hipotéticos, basados únicamente en las afirmaciones de la model card:

- Generación de código en NNPL: el modelo podría utilizarse para escribir programas en el lenguaje propietario de Nebulaic Tech, aunque no hay documentación pública de NNPL ni ejemplos de uso.
- Asistencia en programación poliglot: si las capacidades declaradas fueran reales, podría ayudar a generar código en Python, Rust, C++ o Go, pero no hay evidencia de rendimiento.
- Verificación formal de software: la model card menciona "pruebas AST formales sin alucinaciones", lo que sería útil en entornos de seguridad crítica, pero no se aportan resultados.
- Auditoría de seguridad criptográfica: podría revisar implementaciones criptográficas, pero sin benchmarks no se puede evaluar su fiabilidad.
- Razonamiento matemático: podría usarse para resolver problemas de matemáticas avanzadas, pero no hay datos de GSM8K ni similares.
- Desarrollo de arquitecturas multi-archivo: podría ayudar a gestionar proyectos con múltiples ficheros, pero no se especifica cómo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el modelo será evaluado por el Hugging Face Open LLM Leaderboard y LMSYS Chatbot Arena, pero no se proporcionan puntuaciones. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar. Tampoco se ha verificado la latencia declarada de 78 ms para el primer token.

## Requisitos de hardware

Dado el dato real de safetensors (1.57B parámetros), el modelo podría ejecutarse en GPUs de consumo:

- VRAM estimada: aproximadamente 3.1 GB en fp16, o menos con cuantización (por ejemplo, 1.5-2 GB en int8 o int4).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como una RTX 3060, RTX 4060 o incluso una GTX 1660 Super.
- Si se tomara la model card al pie de la letra (258.6B parámetros), se necesitarían múltiples GPUs de alta gama (por ejemplo, 8x A100 80GB o similares), pero esto es inconsistente con el tamaño del repositorio.
- Opciones de despliegue: al ser un modelo de transformers, se puede usar con vLLM, llama.cpp (si se convierte a GGUF), Ollama o TGI. Para el tamaño real, también funcionaría en CPU con suficiente RAM.

## Comparativa con modelos similares

No es posible realizar una comparativa fiable porque no se conoce el tamaño real del modelo ni se dispone de benchmarks. Si se asume que el modelo real es de ~1.5B parámetros, podría compararse con otros modelos pequeños como Qwen2.5-1.5B, Gemma-2-2B o Llama-3.2-1B, pero no hay datos de rendimiento para establecer una comparación objetiva. Si se asume la model card, no hay modelos MoE abiertos de 258.6B con contexto de 1M tokens disponibles públicamente, por lo que la comparativa sería especulativa. En cualquier caso, se indica "no disponible" por falta de datos verificables.

## Limitaciones y advertencias

- Discrepancia grave entre las especificaciones declaradas (258.6B) y el contenido real del repositorio (1.57B parámetros). Esto sugiere que la model card puede ser engañosa o que el modelo no está correctamente subido.
- No hay benchmarks independientes ni resultados de evaluación publicados.
- No se ha verificado la capacidad de "zero-hallucination" declarada; es una afirmación sin respaldo.
- No se proporciona información sobre el proceso de entrenamiento, dataset o alineación.
- El modelo tiene 0 descargas y 0 likes, lo que indica que no ha sido probado por la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero la falta de documentación fiable hace arriesgado su uso en producción.
- No se especifican sesgos conocidos, pero al no haber información de entrenamiento, no se puede evaluar este aspecto.

## Enlaces

- HuggingFace: https://huggingface.co/nebulaic-tech/aurora-prime-256b-moe
- Sitio web de Nebulaic Tech: https://nebulaictech.com
- Nebulaic Studio: https://studio.nebulaictech.com
- Documentación (según model card): https://nebulaictech.com
