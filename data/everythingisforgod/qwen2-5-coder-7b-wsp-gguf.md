# EverythingIsForGod/Qwen2.5-Coder-7B-WSP-GGUF

## Resumen

Qwen2.5-Coder-7B-WSP-GGUF es una versión cuantizada en formato GGUF (Q4_K_M) del modelo Qwen2.5-Coder-7B-Instruct de Alibaba Qwen, publicada por el usuario EverythingIsForGod. Sobre el modelo base se ha aplicado una técnica de "Weight-Space Programming" (WSP) descrita por el autor como aritmética de tareas en subespacios espectrales con condicionamiento por capas de atención y FFN en las 28 capas del transformer, orientada a reforzar comportamientos en ingeniería de software, diseño de sistemas distribuidos, depuración de causa raíz y auditoría defensiva de código.

El modelo base es un transformer decoder-only de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones), entrenado para generación de código y conversación. Esta release concreta pesa 4,36 GiB en Q4_K_M (frente a 14,19 GiB en BF16, una compresión de 3,25x) y está pensada para ejecutarse en CPUs y GPUs de consumo con 6 GB o más de RAM/VRAM mediante llama.cpp, Ollama o LM Studio.

Su relevancia práctica es doble: por un lado, ofrece un modelo de código de 7B con licencia Apache 2.0 y despliegue local sencillo; por otro, el ajuste WSP es una intervención no oficial sobre los pesos del modelo original, lo que introduce incertidumbre sobre la preservación de capacidades y exige validación propia antes de usarlo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), 28 capas, con ajuste WSP sobre 339 tensores |
| Parametros totales | 7.615.616.512 (7,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de llama.cpp usa `-c 8192`; el modelo base Qwen2.5-Coder soporta hasta 32.768 tokens nativos, ampliables, pero este dato no se confirma en la model card de esta release) |
| Tipos de cuantizacion | Q4_K_M (única cuantización publicada en este repo) |
| Idiomas soportados | en (inglés, según la model card); el modelo base Qwen2.5-Coder es multilingüe, pero esta release declara solo inglés |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (4,36 GiB / 4,68 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-Coder-7B-Instruct: un transformer decoder-only denso de 28 capas y 7,6B de parámetros, con atención causal estándar y sin mecanismos MoE. El modelo base fue entrenado por Alibaba Qwen sobre grandes volúmenes de datos de código y texto, con un pipeline de instrucción y alineación (SFT y preferencias) cuyos detalles concretos no se recogen en la información disponible de esta release.

La innovación de esta publicación no está en el entrenamiento original sino en el post-procesado: el autor aplica "Weight-Space Programming" mediante aritmética de tareas en subespacios espectrales (spectral subspace task arithmetic) y condicionamiento capa a capa de atención y FFN sobre los 339 tensores del modelo, con el objetivo de especializarlo en ingeniería de software políglota, diseño de sistemas distribuidos, depuración de causa raíz y auditoría estática defensiva. Posteriormente cuantiza el resultado a Q4_K_M con llama.cpp. No se documentan en la model card el dataset, el número de tokens ni el procedimiento exacto de validación del ajuste WSP, por lo que la magnitud real del cambio de comportamiento respecto al modelo base no está cuantificada.

## Capacidades

- Generación de texto y código en múltiples lenguajes de programación (orientación declarada: desarrollo políglota).
- Razonamiento sobre arquitectura de sistemas distribuidos y diseño de software.
- Depuración de causa raíz y análisis de rendimiento a partir de código y trazas.
- Auditoría estática defensiva de código y propuesta de remediación de vulnerabilidades.
- Conversación multi-turno (pipeline `text-generation`, tag `conversational`) con plantilla de chat de Qwen2.5.
- Compatibilidad con endpoints y con el ecosistema llama.cpp/Ollama (tags `llama-cpp`, `ollama`, `endpoints_compatible`).
- Soporte de tool calling y function calling: no confirmado en la información de esta release (el modelo base lo soporta, pero el ajuste WSP y la cuantización no han sido validados al respecto en la model card).
- Capacidades multilingües: la model card declara únicamente inglés.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Revisión de código en pipelines de CI/CD: el modelo puede actuar como revisor automático de pull requests, señalando problemas de diseño y posibles vulnerabilidades; su tamaño de 7B y su cuantización Q4_K_M permiten ejecutarlo en runners con GPU modesta o incluso en CPU.
- Auditoría estática defensiva: análisis de fragmentos de código en busca de patrones inseguros (inyección, gestión de secretos, validación de entradas) y generación de parches sugeridos, aprovechando el ajuste declarado hacia seguridad defensiva.
- Asistente de depuración: a partir de un stack trace y del código relevante, el modelo puede razonar sobre la causa raíz y proponer hipótesis verificables, un escenario para el que el autor declara especialización explícita.
- Diseño de arquitecturas de sistemas distribuidos: generación de propuestas de componentes, trade-offs de consistencia y esquemas de despliegue en conversaciones multi-turno con contexto de varias páginas de especificación.
- Asistente de desarrollo local y air-gapped: al ser un GGUF de 4,36 GiB ejecutable con llama.cpp u Ollama, encaja en entornos sin conexión o con requisitos de privacidad donde no se puede enviar código a una API externa.
- Generación de código en lenguajes menos comunes: el enfoque políglota declarado lo hace adecuado para tareas de traducción entre lenguajes y generación de boilerplate en stacks heterogéneos.
- Prototipado rápido en estaciones de trabajo sin GPU dedicada: con 6 GB de RAM/VRAM es viable en portátiles, lo que permite integrarlo en herramientas de editor o scripts de automatización locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones comparativas del ajuste WSP frente al modelo base.

## Requisitos de hardware

- VRAM/RAM estimada: 6 GB o más para la cuantización Q4_K_M (4,36 GiB de pesos más overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090, A100, H100); el autor indica que funciona en GPUs de consumo con 6+ GB.
- CPU: viable en CPU con al menos 6-8 GB de RAM libre; el rendimiento dependerá del número de núcleos y del ancho de banda de memoria.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM; con 6 GB puede requerir descarga parcial de capas a CPU (`-ngl` ajustado).
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio; también compatible con endpoints según los tags del repo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen2.5-Coder-7B-WSP-GGUF (este) | 7,6B | no disponible (ejemplo con 8192) | GGUF Q4_K_M | Apache 2.0 | Ajuste WSP no oficial sobre el modelo base |
| Qwen2.5-Coder-7B-Instruct (base) | 7,6B | hasta 32.768 tokens nativos (según documentación de Qwen, no verificable en esta ficha) | safetensors, GGUF oficiales | Apache 2.0 | Referencia oficial de Alibaba Qwen, sin ajuste WSP |
| DeepSeek-Coder-V2-Lite | no disponible en esta ficha | no disponible en esta ficha | safetensors, GGUF | no disponible en esta ficha | Alternativa de código de tamaño similar; datos no verificados aquí |
| CodeLlama-7B-Instruct | 6,7B | 16.384 tokens (según su documentación, no verificable aquí) | safetensors, GGUF | Llama 2 Community License | Alternativa de Meta con licencia más restrictiva para uso comercial |

Los datos de modelos alternativos no forman parte de la información proporcionada y deben verificarse en sus respectivas fichas antes de usarse en una comparación formal.

## Limitaciones y advertencias

- El ajuste WSP es una modificación no oficial de los pesos: no hay evaluación publicada del impacto en capacidades generales, y podría degradar tareas fuera del dominio objetivo (por ejemplo, matemáticas o generación creativa).
- Riesgo de alucinación inherente a un modelo de 7B, especialmente en afirmaciones sobre APIs, librerías o vulnerabilidades concretas; requiere verificación humana.
- La model card declara únicamente inglés; el rendimiento en castellano no está garantizado aunque el modelo base sea multilingüe.
- La longitud de contexto efectiva de esta release no está documentada; el ejemplo usa 8192 tokens y no se confirma el máximo soportado tras el ajuste y la cuantización.
- La cuantización Q4_K_M introduce pérdida de precisión respecto a BF16; no hay comparación publicada de calidad entre ambas versiones.
- Licencia Apache 2.0 permite uso comercial, pero el ajuste WSP no documenta su procedencia de datos ni su metodología completa, lo que dificulta auditorías de cumplimiento.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: no hay evidencia de uso en producción ni de validación por la comunidad.
- El tag `cybersecurity` y la orientación a auditoría defensiva no deben interpretarse como garantía de detección fiable de vulnerabilidades; úsese como apoyo, no como sustituto de herramientas SAST/DAST.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/EverythingIsForGod/Qwen2.5-Coder-7B-WSP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
