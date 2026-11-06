# itsjune/Meridian-150M

## Resumen

Meridian-150M es un modelo de lenguaje experimental de 150 millones de parámetros en el backbone, desarrollado por el usuario itsjune y publicado bajo licencia MIT. Se trata de un "mashup" arquitectónico que combina atención lineal (Gated DeltaNet), un núcleo recurrente tipo looped transformer al estilo Huginn, difusión por bloques para la generación de texto, memoria de n-gramas hasheada (Engram) y un mecanismo de contexto que nunca se reinicia. El objetivo no es competir en rendimiento con modelos de producción, sino explorar la viabilidad de estas técnicas combinadas en un modelo pequeño y entrenable en hardware de consumo.

El modelo se encuentra en una fase muy temprana: los pesos no están subidos a Hugging Face y el primer checkpoint corresponde a una "smoke run" de 150 millones de tokens (aproximadamente 1 token por parámetro), con la expectativa explícita del autor de que la calidad sea baja. El vocabulario es de 32.768 tokens BPE byte-level entrenado desde cero para inglés, y el contexto de entrenamiento es de 1.024 tokens.

Su relevancia es fundamentalmente de investigación: ofrece un banco de pruebas reproducible (una sola RTX 3060 de 12 GB) para estudiar decodificación por difusión en bloques, atención lineal con estado recurrente y memorias externas hasheadas en un mismo modelo. No está pensado para uso en producción ni para tareas reales en su estado actual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: preludio causal con Gated DeltaNet + núcleo looped transformer + 2 bloques coda; difusión por bloques |
| Parametros totales | 150,0M backbone + 50,3M tablas Engram |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | no disponible (pesos aún no subidos) |

## Arquitectura y entrenamiento

La arquitectura sustituye la atención estándar por Gated DeltaNet en todas las capas (atención lineal con regla delta), organizada en tres partes: un preludio causal de una capa que actúa como escritor de estado, un núcleo compartido que se ejecuta entre 4 y 128 veces por bloque de texto con inyección de entrada al estilo Huginn en cada iteración, y dos capas coda. La generación es por difusión de bloques: el texto se escribe en bloques que comienzan totalmente enmascarados y se rellenan a lo largo de los bucles, con un tamaño de bloque elegido por el propio modelo entre 8 y 512 tokens. Dentro de cada bloque el escaneo es bidireccional (hacia delante desde el estado de contexto, hacia atrás desde cero). Un "spine" de memoria con regla delta escrito por el preludio nunca se reinicia, persistiendo entre lotes durante el entrenamiento y entre ejecuciones en inferencia. Se añade un módulo Engram de memoria de n-gramas hasheada (órdenes 2 y 3) con gating dependiente del contexto, rehasheado en cada bucle, y un mecanismo de edición donde el token `[NULL]` elimina una posición y una cabeza de gap predice inserciones. Una pasada final de refinamiento relee toda la salida como un bloque durante 2 bucles.

El entrenamiento usa una pérdida de difusión enmascarada (MDLM/LLaDA, ponderada 1/t) sobre todas las posiciones, más un 10 % de reparación con tokens aleatorios y eliminación de relleno/basura mediante `[NULL]`. Los bucles se muestrean en torno a 6 durante el entrenamiento, con gradientes solo a través de los 3 últimos. Los datos son FineWeb-Edu (68,8 %), Python-Edu (15,3 %), FineMath-4+ (10,1 %) y Wikipedia (5,7 %). El optimizador es Muon para las matrices ocultas y AdamW para el resto. El primer checkpoint se entrena en una RTX 3060 de 12 GB en bf16 con kernels de fla a aproximadamente 5.200 tokens por segundo, sobre 150 millones de tokens.

## Capacidades

- Generación de texto en inglés mediante difusión por bloques con tamaño de bloque adaptativo (8–512 tokens).
- Relleno iterativo de contenido enmascarado a través de bucles recurrentes, con refinamiento final de la salida completa.
- Memoria de contexto persistente entre ejecuciones gracias al "spine" de regla delta que no se reinicia.
- Recuperación de patrones locales mediante la memoria Engram de n-gramas (órdenes 2 y 3) con gating contextual.
- Edición de secuencias: eliminación de posiciones con `[NULL]` e inserción mediante cabeza de gap.
- Entrenado sobre datos con presencia de código Python y matemáticas (FineMath-4+), aunque sin evaluación publicada de dichas capacidades.
- No dispone de tool calling, function calling, soporte de agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en arquitecturas de difusión para lenguaje: el modelo permite reproducir y modificar un pipeline completo de difusión enmascarada por bloques en una sola GPU de consumo, sirviendo como base para experimentos académicos sobre decodificación no autorregresiva.
- Estudio de atención lineal y estado recurrente: al usar Gated DeltaNet en todas las capas y un spine persistente, es útil para medir cómo se degrada o mantiene la información a lo largo de secuencias y entre lotes en modelos pequeños.
- Evaluación de memorias externas hasheadas: el módulo Engram con rehash por bucle permite experimentar con recuperación de n-gramas y comparar su impacto frente a modelos sin memoria externa del mismo tamaño.
- Pruebas de looped transformers con inyección de entrada: el núcleo compartido ejecutado 4–128 veces facilita estudiar el equilibrio entre cómputo recurrente y calidad en un rango amplio de iteraciones.
- Reproducción de entrenamiento a pequeña escala: con 150M de tokens y una RTX 3060, sirve para validar recetas de optimización (Muon + AdamW), kernels fla y estrategias de muestreo de bucles antes de escalar.
- Docencia y divulgación: como ejemplo didáctico de arquitectura híbrida poco convencional, con código y configuración reproducibles, para explicar difusión, atención lineal y memorias en un mismo sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el primer checkpoint es una "smoke run" de 150M de tokens (aproximadamente 1 token por parámetro) y que cabe esperar una calidad baja ("expect mush").

## Requisitos de hardware

- Entrenamiento validado en una única RTX 3060 de 12 GB en bf16 con kernels de fla, a ~5.200 tokens/s.
- VRAM de inferencia estimada: no disponible; por el tamaño (150M backbone + 50,3M Engram) cabría en GPUs de consumo con 6–8 GB o menos en bf16/fp16, aunque no hay mediciones publicadas.
- GPU recomendadas: cualquier GPU de consumo con al menos 8 GB para entrenamiento o inferencia en precisión nativa; A100/H100 no son necesarias por el tamaño del modelo.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se documenta compatibilidad con ningún runtime estándar, y la arquitectura no autorregresiva con bucles y difusión probablemente requiera implementación propia.
- Latencia y throughput de inferencia: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Meridian-150M | 150M + 50,3M Engram | 1024 | Difusión por bloques + atención lineal + looped core | MIT | Pesos aún no subidos |
| Huginn-3.5B | 3.500M | no disponible en esta ficha | Looped transformer con inyección de entrada | no disponible en esta ficha | Público |
| LLaDA (familia) | no disponible en esta ficha | no disponible en esta ficha | Difusión enmascarada | no disponible en esta ficha | Público |
| Modelos transformer densos ~150M (p. ej. GPT-2 small) | 124M | 1024 | Transformer autorregresivo denso | MIT (GPT-2 small) | Público |

La comparación es orientativa: Meridian-150M es experimental y no hay métricas publicadas que permitan situarlo frente a estas alternativas.

## Limitaciones y advertencias

- Los pesos no están disponibles todavía; el modelo no puede utilizarse en su estado actual.
- El único checkpoint previsto es una "smoke run" de 150M de tokens; el autor anticipa calidad muy baja.
- Solo soporta inglés, con vocabulario BPE entrenado desde cero y contexto de entrenamiento de 1.024 tokens.
- Riesgo elevado de alucinación y de texto incoherente por el escaso entrenamiento y la naturaleza experimental de la decodificación por difusión.
- No hay evaluación de sesgos, toxicidad ni robustez publicada.
- No soporta tool calling, agentes, visión ni audio.
- La licencia MIT permite uso comercial, pero la falta de pesos, benchmarks y soporte de runtimes hace inviable su uso en producción.
- La arquitectura no autorregresiva con bucles y memoria persistente entre ejecuciones puede introducir comportamientos no deterministas o dependientes del estado previo difíciles de depurar.

## Enlaces

- Hugging Face: https://huggingface.co/itsjune/Meridian-150M
