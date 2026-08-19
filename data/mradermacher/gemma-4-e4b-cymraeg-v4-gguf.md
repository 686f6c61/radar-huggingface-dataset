# mradermacher/gemma-4-e4b-cymraeg-v4-GGUF

## Resumen

El modelo `mradermacher/gemma-4-e4b-cymraeg-v4-GGUF` es una colección de cuantizaciones GGUF del modelo `EryriLabs/gemma-4-e4b-cymraeg-v4`, un ajuste fino (fine-tuning) de la familia Gemma 4 de Google DeepMind orientado al idioma galés (cymraeg). La cuantización ha sido realizada por mradermacher, un usuario habitual de HuggingFace que publica versiones optimizadas para inferencia en CPU y GPU consumer. El modelo base cuenta con 8.134.102.314 parámetros (aproximadamente 8,1 mil millones), lo que lo sitúa en la gama de modelos de tamaño medio. No se dispone de información pública sobre la arquitectura exacta ni el contexto máximo de este ajuste específico, aunque la familia Gemma 4, según documentación de Google DeepMind, incluye variantes densas y Mixture-of-Experts (MoE) con soporte multimodal y hasta 256K tokens de contexto. Este modelo concreto parece ser una variante E4B (probablemente "effective 4B"), que sugiere una arquitectura MoE con 8,1B parámetros totales y 4B activos, pero no hay confirmación oficial en la información disponible.

La relevancia de este modelo radica en su especialización para el galés, un idioma con pocos recursos en el ecosistema de modelos abiertos, y en la disponibilidad de cuantizaciones GGUF que permiten ejecutarlo en hardware modesto. Su fecha de creación (agosto de 2026) indica que es un modelo reciente dentro de la oleada de Gemma 4. Al ser una cuantización estática, no incluye el proyector multimodal (skip_mmproj), por lo que es exclusivamente para tareas de texto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente Mixture-of-Experts de la familia Gemma 4, no confirmado) |
| Parametros totales | 8.134.102.314 (8,1B) |
| Parametros activos | no disponible (si es MoE, probablemente 4B, sin confirmar) |
| Longitud de contexto | no disponible (la familia Gemma 4 soporta hasta 256K, no confirmado para este ajuste) |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS (según la model card) |
| Idiomas soportados | no disponible (probablemente galés y otros, sin confirmar) |
| Licencia | no disponible (la familia Gemma 4 usa Apache 2.0, pero no se indica para este modelo) |
| Formato de pesos | GGUF (safetensors no disponible en el repo) |

## Arquitectura y entrenamiento

No se han publicado detalles específicos sobre la arquitectura y el proceso de entrenamiento de `gemma-4-e4b-cymraeg-v4`. A partir de la información general de la familia Gemma 4 (según el reporte técnico en arXiv y la documentación de Unsloth), se sabe que estos modelos pueden adoptar arquitecturas densas o Mixture-of-Experts, con encoders de visión y audio integrados y un enfoque de "hybrid-thinking" que combina razonamiento explícito con generación directa. Sin embargo, para este ajuste concreto en galés, se desconoce si se utilizó RLHF, DPO o un dataset específico. La cuantización GGUF realizada por mradermacher es una conversión estática (no se menciona imatrix en este caso, aunque otros repos similares lo usan), lo que significa que los pesos se redondean a baja precisión para reducir el tamaño y acelerar la inferencia.

## Capacidades

- Generación de texto en galés y posiblemente otros idiomas, dado el nombre "cymraeg" y la base Gemma 4 que soporta más de 140 idiomas.
- Razonamiento y resolución de problemas matemáticos y lógicos, heredado de la familia Gemma 4.
- Generación de código y asistencia en programación, si el fine-tuning no lo degrada.
- Soporte de tool calling y function calling, probablemente presente en la base Gemma 4 (aunque no confirmado para este ajuste).
- Capacidades multimodales (visión, audio) no disponibles en la versión GGUF, ya que se ha omitido el proyector (`skip_mmproj`).
- No se dispone de información sobre un modo de "thinking" específico.

## Casos de uso

- Traducción y localización al galés: el modelo puede utilizarse para traducir textos del inglés o de otros idiomas al galés, aprovechando su especialización. Su tamaño moderado permite ejecutarlo en servidores de bajo costo.
- Chatbots de atención al cliente en galés: una empresa que opera en Gales puede desplegar un asistente virtual en ese idioma, con contexto de hasta 256K tokens (si se mantiene), para gestionar conversaciones largas y multi-turno.
- Generación de contenido educativo en galés: creación de materiales didácticos, resúmenes y ejercicios para el sistema educativo galés, con control de tono y estilo.
- Análisis de sentimiento en redes sociales en galés: al estar especializado en el idioma, puede extraer opiniones y sentimientos de publicaciones en galés, algo que modelos generalistas suelen hacer mal.
- Asistencia a la escritura creativa: ayudar a escritores en galés a generar ideas, corregir gramática y estilo, gracias a su capacidad de generación de texto coherente.
- Integración en pipelines de generación de código con tool calling: si el modelo mantiene las capacidades de Gemma 4, puede usarse en asistentes de programación que llamen a funciones y ejecuten tareas de desarrollo, aunque su especialización en galés no es necesaria aquí.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos como MMLU, HumanEval o GSM8K para este modelo específico. Es probable que herede el rendimiento de la base Gemma 4, pero no hay confirmación.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (para 8B parámetros):
  - Q2_K: ~2,5 GB
  - Q3_K_M: ~3,5 GB
  - Q4_K_M: ~4,5 GB
  - Q5_K_M: ~5,5 GB
  - Q8_0: ~8,5 GB
  - F16: ~16 GB
- GPU recomendadas: una RTX 4060 (8 GB) puede ejecutar las cuantizaciones Q4 o Q5; una RTX 3090 o RTX 4090 para Q8 o F16 con contexto largo.
- En consumer GPU cabe bien hasta Q6, dependiendo del contexto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con soporte GGUF), TGI.
- Latencia: no se conoce, pero para 8B en una GPU moderna se espera entre 20-50 tokens/s en cuantización Q4.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Formato |
|---|---|---|---|---|---|
| gemma-4-e4b-cymraeg-v4 (GGUF) | 8,1B | no disponible (prob. 256K) | MoE (presumido) | no disponible | GGUF |
| Llama 3.1 8B (GGUF) | 8,0B | 128K | Denso | Apache 2.0 | GGUF |
| Mistral 7B v0.3 (GGUF) | 7,3B | 32K | Denso | Apache 2.0 | GGUF |
| Gemma 3 8B (GGUF) | 8,0B | 32K | Denso | Gemma license | GGUF |

No se dispone de resultados de rendimiento comparativos, por lo que la tabla solo refleja parámetros y contexto estimados. La ventaja del modelo cymraeg es su especialización en el galés, mientras que los otros son generalistas.

## Limitaciones y advertencias

- No hay información pública sobre el proceso de fine-tuning, por lo que no se puede evaluar el riesgo de alucinación o sesgos específicos.
- La cuantización GGUF introduce pérdida de precisión, que puede afectar a tareas que requieren razonamiento fino o código complejo.
- Al omitir el proyector multimodal, el modelo no puede procesar imágenes ni audio, a pesar de que la base Gemma 4 es multimodal.
- La licencia no está especificada; aunque Gemma 4 se publica bajo Apache 2.0, este modelo derivado podría tener restricciones adicionales por el fine-tuning. Se recomienda verificar con el autor antes de uso comercial.
- No se ha verificado que el modelo funcione correctamente en todos los idiomas; su especialización en galés podría degradar el rendimiento en otros idiomas.
- El tamaño del repositorio es de 72,8 GB, lo que indica que incluye todas las cuantizaciones, pero cada archivo individual ocupa menos; hay que descargar solo la cuantización deseada.

## Enlaces

- [HuggingFace - mradermacher/gemma-4-e4b-cymraeg-v4-GGUF](https://huggingface.co/mradermacher/gemma-4-e4b-cymraeg-v4-GGUF)
- [Modelo base: EryriLabs/gemma-4-e4b-cymraeg-v4](https://huggingface.co/EryriLabs/gemma-4-e4b-cymraeg-v4)
- [Gemma 4 - Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Gemma 4 Technical Report (arXiv)](https://arxiv.org/pdf/2607.02770)
- [Documentación de Unsloth sobre Gemma 4](https://unsloth.ai/docs/models/gemma-4)
- [mradermacher/gemma-4-E4B-i1-GGUF](https://huggingface.co/mradermacher/gemma-4-E4B-i1-GGUF)
- [mradermacher/gemma-4-E4B-it-heretic-i1-GGUF](https://huggingface.co/mradermacher/gemma-4-E4B-it-heretic-i1-GGUF)
