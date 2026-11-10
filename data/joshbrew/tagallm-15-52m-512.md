# JoshBrew/TagaLLM-15.52M-512

## Resumen

TagaLLM 15.52M-512 es un checkpoint de investigación de un modelo de lenguaje decoder-only entrenado desde cero ("scratch-trained") por el autor independiente JoshBrew, orientado específicamente al diálogo en tagalo y taglish (la mezcla de tagalo e inglés habitual en Filipinas). Se trata de un modelo de escala muy reducida: 17.287.345 parámetros totales según los pesos en safetensors, con 6 capas, anchura 432, 8 cabezas de atención, un vocabulario de 4096 tokens y una ventana de contexto de 512 tokens. Incluye además una cabeza causal de copia ("causal copy head"), un mecanismo poco común en modelos de esta escala.

El modelo no está pensado para uso en producción ni para aplicaciones generales: la propia model card lo describe como un checkpoint de investigación que puede producir texto repetitivo o inexacto. Su interés radica en ser un artefacto reproducible y auditable (se publican hashes SHA-256 de los pesos y del checkpoint archivado) para estudiar el entrenamiento de modelos pequeños en lenguas de bajos recursos como el tagalo, un idioma con escasa representación en los grandes modelos multilingües.

La relevancia actual es, por tanto, metodológica y de investigación más que de rendimiento: sirve como banco de pruebas para experimentos de tokenización, entrenamiento desde cero con corpus limitados y evaluación de diálogo en taglish. El repositorio ocupa 0,1 GB e incluye pesos, tokenizador, configuración y un runner local; el corpus original se distribuye como artefacto separado y no está cubierto por ninguna licencia concedida en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (6 capas, anchura 432, 8 cabezas de atencion), con cabeza causal de copia |
| Parametros totales | 17.287.345 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (solo pesos safetensors publicados) |
| Idiomas soportados | tagalo (tl) y taglish |
| Licencia | no disponible |
| Formato de pesos | safetensors (69.156.460 bytes) |

## Arquitectura y entrenamiento

La arquitectura es un Transformer decoder-only de 6 capas con anchura de 432 y 8 cabezas de atención, un vocabulario de 4096 tokens y una ventana de contexto de 512 tokens. El modelo se entrena desde cero ("scratch-trained"), es decir, sin partir de un modelo base preentrenado, y añade una cabeza causal de copia, un componente que en la literatura se asocia a tareas de copia literal y que aquí probablemente busca mejorar la fidelidad en diálogo conversacional corto.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del corpus, ni sobre si se aplicaron técnicas de alineación como RLHF o DPO. La model card indica que el corpus original es un artefacto separado "bajo revisión" y que este repositorio no concede licencia sobre dicho corpus. El release incluye pesos, tokenizador, configuración y un runner local, y se publican hashes SHA-256 para verificar la integridad de los archivos exportados.

## Capacidades

- Generación de texto y diálogo conversacional en tagalo y taglish, su dominio principal de entrenamiento.
- Cabeza causal de copia, orientada a reproducir fragmentos del contexto de entrada.
- Contexto corto de 512 tokens, suficiente para turnos de conversación breves pero no para documentos largos.
- Tokenizador propio con vocabulario de 4096 tokens, adaptado a la morfología del tagalo.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni modo "thinking".
- Capacidades multilingües limitadas al tagalo y taglish; no hay evidencia de competencia en otros idiomas.

## Casos de uso

- Investigación sobre modelos en lenguas de bajos recursos: el checkpoint permite reproducir y auditar experimentos de entrenamiento desde cero en tagalo, con hashes verificables y runner local incluido.
- Estudio de tokenización para tagalo: su vocabulario de 4096 tokens y su corpus específico lo convierten en un banco de pruebas para analizar cómo afecta la segmentación a la calidad del diálogo en una lengua aglutinante.
- Evaluación de diálogo taglish en entornos controlados: útil para construir conjuntos de evaluación y comparar variantes de arquitectura o de datos en un dominio acotado.
- Docencia y formación: su tamaño reducido (17,3 M de parámetros, 0,1 GB de repo) permite ejecutarlo en portátiles y explicar el ciclo completo de entrenamiento e inferencia de un LLM.
- Prototipado de chatbots de dominio muy restringido en tagalo, siempre con revisión humana y sin exposición directa al usuario final dada la advertencia de repetitividad e inexactitud.
- Investigación sobre mecanismos de copia: la cabeza causal de copia permite estudiar empíricamente cómo un modelo pequeño aprende a reproducir fragmentos del contexto, un fenómeno relevante para el estudio de alucinaciones y fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la página de evidencia del proyecto para los detalles de ejecución y evaluación, pero no incluye cifras en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (17,3 M de parámetros, ~69 MB de pesos), y del orden de decenas de MB en cuantizaciones de 8 o 4 bits.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en una RTX 3060, RTX 4090 o incluso en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de VRAM; también en CPU y en dispositivos de borde.
- Opciones de despliegue: el repositorio incluye un runner local basado en Python con `torch`, `safetensors` y `tokenizers` (`python generate.py "Kumusta ka?"`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; con 17,3 M de parámetros y contexto de 512 tokens se espera una latencia muy baja en hardware moderno, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TagaLLM 15.52M-512 | 17,3 M | 512 | tl, taglish | no disponible | Hugging Face (JoshBrew) |
| Modelos decoder-only de escala similar (p. ej. variantes TinyStories) | 10-30 M | variable | en | variable | Hugging Face |
| Modelos multilingües grandes (p. ej. familia Qwen o Llama) | miles de millones | miles de tokens | decenas de idiomas | variable | Hugging Face |

No se dispone de datos de rendimiento comparables para TagaLLM, por lo que la comparativa se limita a parámetros, contexto y disponibilidad. Frente a los grandes modelos multilingües, TagaLLM ofrece un contexto de 512 tokens y un vocabulario de 4096 tokens, muy inferiores, pero está especializado en tagalo y taglish y es ejecutable en hardware mínimo.

## Limitaciones y advertencias

- El autor advierte explícitamente de que el modelo puede producir texto repetitivo o inexacto; no es apto para producción sin revisión humana.
- Riesgo elevado de alucinación y de degradación en conversaciones de más de 512 tokens.
- Sesgos desconocidos: no se documenta la composición del corpus ni los procesos de filtrado, por lo que no se pueden evaluar sesgos de género, políticos o culturales.
- Licencia no disponible: no se especifican condiciones de uso comercial; además, el repositorio no concede licencia sobre el corpus original, que está "bajo revisión".
- Cobertura idiomática limitada a tagalo y taglish; no se garantiza un comportamiento correcto en otros idiomas.
- Vocabulario de 4096 tokens: puede fragmentar en exceso palabras poco frecuentes y afectar a la calidad en dominios técnicos.
- Sin soporte documentado de tool calling, agentes ni modos de razonamiento extendido.
- Fecha de creación del repositorio (2026-11-10) posterior a la fecha actual de referencia, lo que conviene verificar antes de citarlo.

## Enlaces

- [Hugging Face: JoshBrew/TagaLLM-15.52M-512](https://huggingface.co/JoshBrew/TagaLLM-15.52M-512)
- [GitHub del proyecto y guía de instalación](https://github.com/JoshuaBrew/TagaLLM)
- [Artículo de investigación](https://joshuabrew.github.io/TagaLLM/article.html)
- [Evidencia de investigación y checkpoints](https://joshuabrew.github.io/TagaLLM/evidence.html#checkpoints)
- [Colección TagaLLM en Hugging Face](https://huggingface.co/collections/JoshBrew/tagallm-6af280345e2e4ff6235630ea)
