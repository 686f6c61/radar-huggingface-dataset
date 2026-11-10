# JoshBrew/TagaLLM-3.75M-256

## Resumen

TagaLLM-3.75M-256 es un checkpoint de investigación de un modelo de lenguaje decoder-only entrenado desde cero por el desarrollador independiente JoshBrew para diálogo en tagalo y taglish (la mezcla de tagalo e inglés habitual en Filipinas). Se trata de un modelo de escala muy reducida: 4.273.664 parámetros reales según los pesos en safetensors, distribuidos en 4 capas con anchura 256 y 8 cabezas de atención. El nombre comercial "3.75M" hace referencia a la configuración nominal del run, mientras que el recuento efectivo de parámetros es ligeramente superior.

El modelo emplea un vocabulario de 2048 tokens y una longitud de contexto de 256 tokens, cotas muy modestas que lo sitúan en la categoría de modelos de juguete o de investigación lingüística más que en la de asistentes utilizables en producción. No hay información sobre el corpus de entrenamiento (el autor lo describe como un artefacto separado "bajo revisión") ni sobre el número de tokens vistos durante el preentrenamiento.

Su relevancia es fundamentalmente metodológica: documenta un pipeline completo de entrenamiento desde cero (pesos, tokenizador, configuración y un runner local) para una lengua de bajos recursos como el tagalo, con hashes SHA-256 publicados y evidencia de evaluación enlazada. No es comparable en capacidades con los modelos multilingües de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parametros totales | 4.273.664 (recuento real en safetensors); configuración nominal "3.75M" |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (solo pesos safetensors publicados) |
| Idiomas soportados | tagalo (tl) y taglish |
| Licencia | no disponible (la model card no concede licencia; el corpus es un artefacto separado sin licencia) |
| Formato de pesos | safetensors (17.099.216 bytes de pesos) |

Otros datos técnicos: 4 capas, dimensión de modelo 256, 8 cabezas de atención, vocabulario de 2048 tokens. El repositorio incluye parámetros, tokenizador, configuración y un runner local (`generate.py`).

## Arquitectura y entrenamiento

La arquitectura es un Transformer decoder-only estándar de 4 capas, anchura 256 y 8 cabezas de atención, con un vocabulario de 2048 tokens construido presumiblemente para tagalo y taglish. El modelo se entrenó "from scratch" (sin inicialización desde otro checkpoint), según declara el autor. No se especifica en la información disponible la composición del dataset, el número de tokens de entrenamiento, ni si se aplicaron fases de ajuste como SFT, RLHF o DPO.

El autor indica que el corpus original es un artefacto separado "bajo revisión" y que el repositorio no concede licencia sobre dicho corpus. Se publican hashes SHA-256 de los ficheros exportados y un hash del checkpoint archivado en un manifiesto, lo que facilita la verificación de integridad de los pesos. No se documentan innovaciones técnicas como atención lineal, decodificación especulativa o arquitecturas híbridas.

## Capacidades

- Generación de texto autoregresiva en tagalo y taglish, limitada a continuaciones de hasta 256 tokens de contexto.
- Diálogo de dominio muy restringido: el checkpoint está orientado a conversación, pero el autor advierte que puede producir texto repetitivo o inexacto.
- No hay evidencia de soporte de tool calling, function calling ni razonamiento multi-paso.
- No hay evidencia de capacidades de visión, audio ni modo "thinking".
- Capacidad multilingüe limitada al tagalo/taglish; no se documenta competencia en inglés más allá de los préstamos propios del taglish.
- No se documentan capacidades de código ni matemáticas.

## Casos de uso

- Investigación lingüística sobre tagalo y taglish: el modelo sirve como banco de pruebas reproducible (pesos, tokenizador, configuración y runner incluidos) para estudiar el comportamiento de transformers pequeños en una lengua de bajos recursos.
- Docencia y experimentación en entrenamiento desde cero: permite reproducir un pipeline completo de preentrenamiento y generación con dependencias mínimas (`torch`, `safetensors`, `tokenizers`) en hardware muy modesto.
- Verificación de integridad de artefactos: los hashes SHA-256 publicados permiten auditar la cadena de custodia de pesos y tokenizador en trabajos de reproducibilidad.
- Pruebas de tokenizadores para taglish: el vocabulario de 2048 tokens puede emplearse para analizar la fragmentación de texto mixto tagalo-inglés antes de escalar a modelos mayores.
- Baseline en evaluaciones comparativas de modelos pequeños para lenguas filipinas: sirve como referencia inferior de rendimiento frente a modelos multilingües de mayor tamaño.
- Prototipado de demos educativas de generación de texto en tagalo con requisitos de cómputo mínimos, siempre que se acepte la calidad limitada y la ausencia de licencia clara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card enlaza a una página de evidencia del proyecto, pero no se incluyen cifras de MMLU, HumanEval, GSM8K ni de evaluaciones específicas de tagalo en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (los pesos ocupan aproximadamente 17 MB); en la práctica, cualquier GPU consumer moderna o incluso CPU es suficiente.
- GPU recomendadas: no se requieren GPU dedicadas; el modelo cabe holgadamente en cualquier GTX/RTX, e incluso en iGPU o ejecución en CPU.
- Cabe en GPU consumer: sí, en todas las gamas actuales y en la mayoría de hardware integrado.
- Opciones de despliegue: el repositorio incluye un runner local basado en Python 3 con `torch`, `safetensors` y `tokenizers`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, ni la existencia de pesos en GGUF.
- Latencia y throughput: no disponibles; por el tamaño del modelo se espera que sean muy bajos en latencia, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TagaLLM-3.75M-256 | 4,27 M | 256 | tl / taglish | no disponible | Hugging Face (safetensors) |
| Modelos decoder-only de investigación de escala similar (p. ej. variantes tipo nanoGPT) | ~1-10 M | variable | normalmente inglés | variable según proyecto | habitual en repos de investigación |
| Modelos multilingües pequeños tipo Qwen2.5-0.5B / Gemma-2-2B | 0,5-2 B | 4k-32k | decenas de idiomas | Apache-2.0 / Gemma license | Hugging Face, GGUF, vLLM, Ollama |

No se dispone de datos de rendimiento comparativo del modelo frente a alternativas, por lo que la comparación se limita a escala, contexto y disponibilidad. Frente a los modelos multilingües pequeños citados, TagaLLM es dos o tres órdenes de magnitud menor en parámetros y contexto.

## Limitaciones y advertencias

- Calidad de generación limitada: el propio autor advierte de texto repetitivo o inexacto; es esperable en un modelo de 4,3 M de parámetros.
- Ventana de contexto de solo 256 tokens, insuficiente para conversaciones multi-turno extensas o documentos.
- Vocabulario de 2048 tokens: alta fragmentación en texto fuera del dominio y posible degradación con caracteres especiales o préstamos del inglés.
- Sesgos desconocidos: no se documenta la composición del corpus ni procesos de mitigación de sesgos.
- Riesgo de alucinación elevado por la escala y por la falta de datos de evaluación publicados.
- Licencia no disponible: no se concede explícitamente permiso de uso comercial ni se aclaran los términos; el corpus de entrenamiento es un artefacto separado sin licencia, lo que añade incertidumbre legal para uso en producción.
- No apto para producción: sin benchmarks, sin soporte de tool calling y sin integraciones estándar de despliegue (vLLM, llama.cpp, TGI).
- Idiomas: únicamente tagalo/taglish; no debe esperarse competencia en castellano ni en inglés estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JoshBrew/TagaLLM-3.75M-256
- Repositorio GitHub y guía de instalación: https://github.com/JoshuaBrew/TagaLLM
- Artículo de investigación: https://joshuabrew.github.io/TagaLLM/article.html
- Evidencia de investigación (runs y evaluación): https://joshuabrew.github.io/TagaLLM/evidence.html#checkpoints
- Colección TagaLLM en Hugging Face: https://huggingface.co/collections/JoshBrew/tagallm-6af280345e2e4ff6235630ea
