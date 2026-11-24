# kingjones777/Ornith-1.5-9B-ROCmFPX-AGENT-GGUF

## Resumen

Ornith-1.5-9B-ROCmFPX-AGENT-GGUF es una cuantización comunitaria de 8 bits del modelo multimodal `ornith-ai/Ornith-1.5-9B`, publicada por el usuario `kingjones777`. No se trata de un modelo nuevo, sino de un artefacto GGUF optimizado para hardware AMD Strix Halo (gfx1151, Ryzen AI MAX+ 395) mediante el fork ROCmFPX de llama.cpp, que introduce tipos de tensor FP4/FP8 nativos de AMD ausentes en la rama principal. El objetivo es ofrecer una variante de alta fidelidad para tool calling en un equipo de escritorio con memoria unificada de 128 GB.

El modelo base emplea una arquitectura híbrida `Qwen3_5ForConditionalGeneration` (qwen35) de 32 capas, con 24 capas de atención gated-deltanet y 8 de atención completa, 4096 dimensiones ocultas y un vocabulario de 248.320 tokens. Con 8.953.803.264 parámetros totales, no es un MoE ni un transformer denso convencional. La relevancia actual reside en su orientación a agentes y flujos multimodales (image-text-to-text) sobre hardware consumer de AMD, un nicho poco cubierto por las cuantizaciones estándar.

El repositorio incluye tres variantes de 8 bits (ftypes 114, 111 y 115) más el proyector visual `mmproj-Ornith-1.5-9B-BF16.gguf`. La licencia Apache 2.0 del modelo base facilita su uso comercial, aunque la dependencia de un fork específico de llama.cpp limita la portabilidad del despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida `Qwen3_5ForConditionalGeneration` / `qwen35` (24 capas gated-deltanet + 8 capas de atención completa) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens (contexto cargado en las pruebas del autor) |
| Tipos de cuantizacion | Q6_0_ROCMFPX_AGENT (ftype 114), Q8_0_ROCMFPX (ftype 111), Q8_0_ROCMFPX_AGENT (ftype 115); tipos de tensor ROCmFP4/ROCmFPX no presentes en llama.cpp principal |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (más proyector `mmproj` en BF16 para visión) |

## Arquitectura y entrenamiento

El modelo base es un stack híbrido de 32 capas con 4096 dimensiones ocultas y 427 tensores. Combina 24 capas de atención gated-deltanet (atención lineal con estado recurrente) con 8 capas de atención completa, lo que reduce el coste computacional en contextos largos frente a un transformer denso puro. El vocabulario es de 248.320 tokens. `tie_word_embeddings` es `false`, por lo que `output.weight` existe como tensor independiente, algo que el cuantizador aprovecha para proteger la cabeza de salida.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original. El `config.json` declara `mtp_num_hidden_layers: 1`, pero los safetensors publicados no contienen pesos MTP y el GGUF convertido carece de la clave `nextn_predict_layers`; por tanto, no hay decodificación especulativa disponible. La cuantización parte de `Ornith-1.5-9B-BF16.gguf` (17.920.696.768 bytes), verificado byte a byte contra el Hub, sin reconversión desde safetensors.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat propia.
- Razonamiento con modo thinking activable por petición mediante `chat_template_kwargs.enable_thinking` (desactivado por defecto en el comando de ejemplo).
- Tool calling / function calling: el autor reporta 7/8 en modo requerido y 7/8 en modo automático.
- Comprensión de imágenes (image-text-to-text) mediante el proyector `mmproj-Ornith-1.5-9B-BF16.gguf`; validado con una imagen de cuatro cuadrantes de color (4/4).
- Uso en flujos de agente con razonamiento multi-paso, favorecido por el contexto de 131.072 tokens.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Compatibilidad con endpoints tipo OpenAI a través del servidor Super Roc.

## Casos de uso

- Asistente de agente local con tool calling: el modelo puede invocar funciones en un bucle de razonamiento sobre 131.072 tokens de contexto, adecuado para orquestar APIs y sistemas de ficheros en un equipo de escritorio con Strix Halo.
- Análisis de documentos e imágenes en local: gracias al proyector visual, permite extraer información de capturas, diagramas o formularios sin enviar datos a la nube, lo que encaja en entornos con requisitos de privacidad.
- Automatización de atención al cliente multi-turno: la ventana de contexto larga permite mantener historiales extensos y adjuntar imágenes del cliente (capturas de error, recibos) en la misma conversación.
- Generación de código asistida en pipelines de CI/CD: el soporte de tool calling y el modo thinking permiten integrarlo en flujos de revisión automática, generación de parches y consulta de repositorios.
- Prototipado de agentes sobre hardware AMD consumer: al ejecutarse en un Ryzen AI MAX+ 395 con 128 GB de memoria unificada, sirve como banco de pruebas para agentes que luego se despliegan en clústeres.
- Evaluación de cuantizaciones de 8 bits en ROCm: útil para investigadores que comparan fidelidad de tool calling entre ftypes sobre gfx1151 antes de fijar una variante en producción.
- Procesamiento de documentación técnica con imágenes: manuales, planos o gráficos combinados con texto largo, aprovechando el contexto de 131k tokens y la entrada multimodal.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks académicos (MMLU, HumanEval, GSM8K). Sí reporta métricas de despliegue medidas en un Ryzen AI MAX+ 395 (Strix Halo, gfx1151), 128 GB de memoria unificada y ROCm 7.13.0, con 2 calentamientos descartados, mediana de 5 ejecuciones y 300 tokens:

| Variante | Ftype | Tamano | BPW | Decodificacion (t/s) |
|---|---|---|---|---|
| Q6_0_ROCMFPX_AGENT | 114 | 7,90 GiB | 7,58 | 22,13 |
| Q8_0_ROCMFPX | 111 | 8,67 GiB | 8,31 | 22,00 |
| Q8_0_ROCMFPX_AGENT | 115 | 8,77 GiB | 8,41 | 22,16 |

Métricas adicionales con Super Roc 0.20.2 (una petición a la vez, 2026-11-24):

| Metrica | Valor |
|---|---|
| Tiempo de carga | 3 s |
| Prompt tok/s (p1k) | 1642,2 |
| Prompt tok/s (p8k) | 1693,5 |
| Generación tok/s (p1k) | 24,16 |
| Generación tok/s (p8k) | 23,07 |
| Generación de código tok/s | 24,3 (media de 2 prompts) |
| Tool calls (requerido / auto) | 7/8 / 7/8 |
| Caché de prompt, turno 2 | 6946 / 6985 tokens |
| Contexto cargado | 131.072 tokens |
| Visión | pass |
| Drafter | off |

Las tres variantes de 8 bits rinden a ~22 t/s, aproximadamente el 60 % de la velocidad de las variantes de 4 bits del mismo autor.

## Requisitos de hardware

- VRAM/memoria estimada: entre 7,90 y 8,77 GiB para los pesos, más el proyector visual (921.704.416 bytes, ~0,86 GiB) y la caché KV para el contexto elegido.
- Hardware de referencia: AMD Ryzen AI MAX+ 395 (Strix Halo, gfx1151) con 128 GB de memoria unificada y ROCm 7.13.0.
- GPU compatibles: requiere un build de llama.cpp con soporte ROCmFPX; no carga en llama.cpp estándar, Ollama ni LM Studio, ya que los tipos `Q4_0_ROCMFP4_*` y `Q*_0_ROCMFPX*` no existen en la rama principal.
- GPU consumer: no se documenta funcionamiento en GPUs NVIDIA ni en Radeon discretas; el soporte está centrado en gfx1151.
- Opciones de despliegue: fork ROCmFPX de llama.cpp y el motor Super Roc (`superroc serve`); también integrable desde Lemonade mediante `lemonade pull Ornith-1.5-9B-ROCmFPX-AGENT`.
- Latencia y throughput: 22,00-22,16 t/s de decodificación y 1642-1693 t/s de prompt en el hardware de referencia; sin decodificación especulativa disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo base ni de alternativas comparables en la información proporcionada, por lo que la comparación se limita a las variantes del propio repositorio y a características estructurales.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B Q8_0_ROCMFPX_AGENT (ftype 115) | 8,95 B | 131.072 | Apache 2.0 | GGUF ROCmFPX | 8,77 GiB, 22,16 t/s, cabeza `output.weight` en Q8_0 |
| Ornith-1.5-9B Q8_0_ROCMFPX (ftype 111) | 8,95 B | 131.072 | Apache 2.0 | GGUF ROCmFPX | 8,67 GiB, 22,00 t/s, sin enrutado AGENT |
| Ornith-1.5-9B Q6_0_ROCMFPX_AGENT (ftype 114) | 8,95 B | 131.072 | Apache 2.0 | GGUF ROCmFPX | 7,90 GiB, 22,13 t/s, 7,58 BPW |
| Alternativas de otros fabricantes | No disponible | No disponible | No disponible | No disponible | Sin datos en la información proporcionada |

## Limitaciones y advertencias

- Dependencia de un fork: los ficheros no cargan en llama.cpp estándar, Ollama ni LM Studio; requieren un build con soporte ROCmFPX.
- Sin decodificación especulativa: no hay pesos MTP ni drafter GGUF publicado, de modo que la ventaja del enrutado AGENT no puede demostrarse con aceleración especulativa.
- Rendimiento limitado: las variantes de 8 bits corren a ~22 t/s, aproximadamente el 60 % de las de 4 bits, y `Q6_0_ROCMFPX_AGENT` no es un escalón intermedio real al situarse en 7,58 BPW.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no cuantificado; el modo thinking está desactivado por defecto en el comando de ejemplo y debe activarse explícitamente.
- Idiomas soportados: no disponibles; no se puede garantizar calidad fuera de los idiomas del modelo base.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no detalla condiciones adicionales sobre el fork ROCmFPX ni sobre el proyector visual.
- Validación limitada: las pruebas de corrección se reducen a tres preguntas aritméticas y geográficas y cuatro cuadrantes de color; no sustituyen una evaluación exhaustiva.
- Adopción baja: 89 descargas y 0 likes en el momento de la consulta, sin validación independiente de terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kingjones777/Ornith-1.5-9B-ROCmFPX-AGENT-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- GGUF del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B-GGUF
- Fork ROCmFPX de llama.cpp: https://github.com/charlie12345/ROCmFPX
- Motor Super Roc: https://github.com/kingjones30/superroc
- Documentación de Lemonade para Super Roc: https://github.com/kingjones30/superroc/blob/main/docs/LEMONADE.md
