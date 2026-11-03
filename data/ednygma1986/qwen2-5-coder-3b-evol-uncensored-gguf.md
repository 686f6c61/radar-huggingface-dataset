# Ednygma1986/Qwen2.5-Coder-3B-Evol-Uncensored-GGUF

## Resumen

Qwen2.5-Coder-3B-Evol-Uncensored-GGUF es un modelo derivado de la familia Qwen2.5-Coder, publicada originalmente por Alibaba Cloud, que ha sido afinado y convertido a formato GGUF por el usuario Ednygma1986. El modelo parte de una base de 3.085.938.688 parámetros (aproximadamente 3B) especializada en generación de código y la somete a un proceso de fine-tuning orientado a eliminar los mecanismos de rechazo y moderación propios de los modelos alineados, de ahí el sufijo "Uncensored". La conversión a GGUF se realizó con Unsloth, lo que facilita su ejecución en llama.cpp y entornos de inferencia local.

El interés de esta ficha radica en que se trata de un modelo pequeño, cuantizado en Q4_K_M, pensado para ejecutarse en hardware modesto y con fines de experimentación con generación de código sin restricciones de contenido. Es relevante para desarrolladores que quieran probar modelos de código de 3B en local con llama.cpp, pero conviene advertir que el repositorio no incluye información sobre licencia, idiomas soportados ni resultados de evaluación, y que el fine-tuning "uncensored" elimina salvaguardas que pueden ser necesarias en producción.

La model card es extremadamente escueta: solo indica el proceso de conversión con Unsloth, un único archivo GGUF disponible (Q4_K_M) y comandos de ejemplo para `llama-cli`. No se documentan datos de entrenamiento, hiperparámetros del fine-tuning ni la composición del dataset utilizado para el "uncensoring".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-Coder); detalles especificos no disponibles |
| Parametros totales | 3.085.938.688 (~3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la base Qwen2.5-Coder-3B soporta 32.768 tokens, pero no se confirma en este derivado) |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base de referencia) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Qwen2.5-Coder-3B, un transformer decoder-only de la familia Qwen2.5, con atención causal estándar y sin componentes MoE. Sobre esa base, el autor aplicó un fine-tuning (presumiblemente con LoRA o QLoRA, dado el uso de Unsloth) orientado a eliminar el comportamiento de rechazo, y posteriormente convirtió los pesos a GGUF en cuantización Q4_K_M. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO en el proceso de "uncensoring".

La única innovación técnica documentada es el uso de Unsloth para acelerar el entrenamiento (el autor afirma "2x faster") y la conversión a GGUF, lo que permite ejecución local eficiente con llama.cpp. No hay información sobre decodificación especulativa, atención lineal ni otras optimizaciones.

## Capacidades

- Generación de texto y código: hereda las capacidades de Qwen2.5-Coder-3B para completar, explicar y depurar código en múltiples lenguajes.
- Razonamiento y matemáticas: capacidades básicas propias de un modelo de 3B, limitadas en comparación con modelos mayores.
- Tool calling / function calling: no confirmado en este derivado; la base Qwen2.5-Coder lo soporta, pero el fine-tuning podría haberlo alterado.
- Agentes y razonamiento multi-paso: no confirmado.
- Multilingüismo: no disponible; la base Qwen2.5 soporta múltiples idiomas, pero no se documenta en este repositorio.
- Modo "uncensored": el fine-tuning elimina los rechazos ante peticiones que los modelos alineados bloquearían, lo que constituye una capacidad diferencial (y un riesgo).
- Compatibilidad con `llama-cli` y `llama-mtmd-cli` mediante `--jinja`, según la model card.

## Casos de uso

- Experimentación local con generación de código: ejecutar el modelo en un portátil o equipo de sobremesa con llama.cpp para probar autocompletado y generación de fragmentos de código sin depender de la nube, gracias a su cuantización Q4_K_M y sus ~3B parámetros.
- Prototipado de asistentes de programación sin restricciones: entornos de investigación donde se necesita que el modelo no rechace peticiones sobre temas sensibles (seguridad ofensiva, análisis de malware educativo), asumiendo los riesgos asociados.
- Evaluación de técnicas de "uncensoring": comparar el comportamiento del modelo frente a Qwen2.5-Coder-3B original para estudiar el efecto del fine-tuning en la tasa de rechazos y en la calidad del código.
- Generación de scripts y automatizaciones en local: para tareas de scripting, parseo de datos o generación de tests en pipelines de CI/CD que requieran un modelo pequeño y desplegable en CPU.
- Educación y formación: usar el modelo como ejemplo práctico de fine-tuning con Unsloth y conversión a GGUF en cursos de IA open source.
- Base para nuevos fine-tunings: al ser un modelo de 3B en GGUF, sirve como punto de partida para experimentos de destilación o especialización en dominios concretos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el archivo Q4_K_M de un modelo de 3B ocupa aproximadamente 2 GB; la inferencia completa requiere alrededor de 2,5-3,5 GB de memoria (pesos + KV cache), dependiendo de la longitud de contexto.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060); en GPU de gama alta (A100, H100, RTX 4090) el modelo es sobredimensionado y se infrautiliza.
- Cabe en GPU consumer: sí, en la mayoría de GPU consumer modernas con 4 GB o más; también puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`), Ollama (mediante importación del GGUF), y otros runners compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que se recomienda llama.cpp para este formato.
- Latencia y throughput: no disponibles; dependerán del hardware y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-Coder-3B-Evol-Uncensored (este) | ~3B | no disponible | no disponible | GGUF Q4_K_M | Fine-tuning "uncensored", sin benchmarks publicados |
| Qwen2.5-Coder-3B (base) | ~3B | 32.768 tokens | Apache 2.0 (según la familia Qwen2.5) | safetensors, GGUF | Modelo oficial de Alibaba, con benchmarks publicados |
| DeepSeek-Coder-1.3B | ~1,3B | 16.384 tokens | DeepSeek License | safetensors, GGUF | Alternativa más pequeña para código |
| CodeLlama-7B | ~7B | 16.384 tokens | Llama 2 License | safetensors, GGUF | Mayor tamaño y contexto menor |

La comparación directa con el modelo base es la más relevante: este derivado no documenta mejoras medibles y su licencia no está clara, lo que introduce incertidumbre frente al original.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Qwen2.5-Coder, puede heredar sesgos de los datos de entrenamiento originales, potencialmente amplificados por el fine-tuning "uncensored".
- Riesgo de alucinación: elevado en un modelo de 3B, especialmente en tareas de razonamiento complejo o código extenso; el fine-tuning sin alineación puede agravar este problema.
- Limitaciones de contexto e idioma: no se documenta la longitud de contexto efectiva ni los idiomas soportados; la ventana de la base (32k) podría no conservarse tras el fine-tuning.
- Restricciones de licencia: la licencia no está disponible en el repositorio, lo que impide determinar si el uso comercial está permitido. El modelo base Qwen2.5-Coder es Apache 2.0, pero el derivado no lo declara.
- Caveat para producción: el calificativo "uncensored" implica la eliminación de salvaguardas; no se recomienda su uso en aplicaciones orientadas al público sin filtros adicionales. Además, el repositorio tiene 0 descargas y 0 likes, y fue creado en 2026, por lo que carece de validación comunitaria.
- Sin benchmarks: no hay evidencia publicada de que el fine-tuning haya preservado la calidad del código del modelo base.

## Enlaces

- HuggingFace: https://huggingface.co/Ednygma1986/Qwen2.5-Coder-3B-Evol-Uncensored-GGUF
- Unsloth (herramienta de fine-tuning y conversión): https://github.com/unslothai/unsloth
- Repositorio del modelo base Qwen2.5-Coder-3B: https://huggingface.co/Qwen/Qwen2.5-Coder-3B
- llama.cpp: https://github.com/ggerganov/llama.cpp
