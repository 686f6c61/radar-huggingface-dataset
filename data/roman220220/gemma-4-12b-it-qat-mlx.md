# roman220220/gemma-4-12B-it-qat-mlx

## Resumen

`roman220220/gemma-4-12B-it-qat-mlx` es una conversion a formato MLX del modelo Gemma 4 12B instruct de Google, entrenado con quantization-aware training (QAT) especificamente para la rejilla `q4_0` de llama.cpp. La publica el usuario roman220220 y su aportacion principal es preservar exactamente la rejilla de cuantizacion para la que Google entreno el modelo, en lugar de recuantizar los pesos desde cero. El checkpoint ocupa 7,89 GB, tiene 12.960.956.464 parametros e incluye capacidades multimodales de imagen y audio.

El modelo esta pensado para ejecucion local en Apple Silicon mediante la libreria MLX. Su problema objetivo es el de la fidelidad de la cuantizacion: las conversiones habituales (`mlx_lm.convert -q` o los builds de mlx-community con grupo 64) desplazan los pesos fuera de la rejilla entrenada por QAT, degradando la calidad. Esta version reproduce bloque a bloque los codigos de 4 bits del GGUF oficial de Google, con la unica diferencia de redondear las escalas de fp16 a bf16.

Ademas del decodificador de texto, el checkpoint soporta vision y audio: Gemma 4 12B no incorpora encoders dedicados, sino que las imagenes entran como parches crudos de 48x48 pixeles y el audio como tramas de forma de onda, cada uno proyectado al modelo de texto mediante una proyeccion pequena. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder multimodal (familia Gemma 4, tipo `gemma4_unified`); sin encoders de vision ni audio dedicados |
| Parametros totales | 12.960.956.464 (aproximadamente 12,96 mil millones) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits en la rejilla `q4_0` (grupo 32) para 284 lineales de texto; 6 bits para embeddings; 8 bits para 44 lineales de texto y para las proyecciones de imagen y audio; normas sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (repo de 7,9 GB); origen GGUF `q4_0` |

## Arquitectura y entrenamiento

Se trata de una conversion, no de un entrenamiento nuevo. Parte de los pesos maestros `google/gemma-4-12B-it-qat-q4_0-unquantized`, que Google entreno con quantization-aware training sobre la rejilla `q4_0` de llama.cpp. La conversione a MLX escribe 284 lineales de texto en la rejilla afina de 4 bits: MLX almacena `scale*q + bias` con grupo 32, y con `scale = d` y `bias = -8d` esa rejilla coincide exactamente con la de `q4_0`. Cada bloque se verifica contra el GGUF original durante la conversion; el unico cambio es el redondeo de la escala de fp16 a bf16 (inferior a 1/64 de paso por peso).

Sobre esa base se aplican dos decisiones de precision mixta. Primero, 44 lineales del decodificador de texto se elevan a 8 bits por medicion: cada uno se puntua de forma individual por la divergencia KL que elimina respecto a los pesos maestros bf16, normalizada por MB anadido, y los mejores 44 caben en +200 MB (casi todos proyecciones de atencion: 17 V, 15 K, 10 O, 1 Q, mas un lineal MLP). Segundo, los embeddings se mantienen a 6 bits y las proyecciones de imagen y audio a 8 bits, siguiendo el reparto del propio GGUF de Google (Q6_K para embeddings). En cuanto a la multimodalidad, el 12B no tiene encoder de vision ni de audio: las imagenes se tokenizan como parches crudos de 48x48 y el audio como tramas de forma de onda, cada modalidad proyectada al modelo de texto. La libreria `mlx-lm` estandar carga el modelo solo como texto; las imagenes y el audio requieren el fork `ipsupport-llc/mlx-lm` (a partir del commit `17ab9af`).

## Capacidades

- Generacion de texto conversacional con plantilla de chat y canal de razonamiento (thinking channel).
- Comprension de imagenes (image-text-to-text): descripcion de escenas y reconocimiento de objetos; el autor verifica que identifica animales en fotos ("There is a red fox in this picture.").
- Comprension de audio: reconocimiento de habla; el autor verifica que transcribe la frase "The quick brown fox jumps over the lazy dog" cuando se le presenta como audio.
- Razonamiento y generacion de codigo: no se detallan capacidades especificas de codigo o matematicas en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (idiomas no declarados en la ficha).
- Ejecucion local en Apple Silicon mediante MLX.

## Casos de uso

- Asistente conversacional local en macOS: el modelo se integra en la aplicacion LLMTray y ofrece chat con contexto sin salir del equipo, lo que es adecuado para usuarios que necesitan privacidad total y no quieren enviar datos a la nube.
- Descripcion de imagenes y respuesta a preguntas visuales sin conexion: al aceptar imagenes como parches crudos, permite etiquetar o describir fotografias localmente, util en catalogacion de fotos o accesibilidad.
- Reconocimiento de voz y transcripcion offline: dado que procesa formas de onda de audio, sirve para transcribir frases o notas de voz en el propio dispositivo, sin depender de APIs externas.
- Prototipado de agentes con API compatible con OpenAI: LLMTray expone una API compatible con OpenAI sobre este modelo, lo que permite conectar herramientas existentes durante el desarrollo en local.
- Demos y evaluacion en equipos Apple Silicon de gama media: con 7,89 GB y un pico de 8,1 GB, cabe en un Mac de 16 GB dejando margen para el contexto, lo que lo hace apto para pruebas en portatiles sin GPU dedicada.
- Investigacion sobre cuantizacion QAT: el checkpoint sirve como referencia reproducible para estudiar el impacto de mantener la rejilla `q4_0` frente a recuantizaciones alternativas, comparando divergencia KL y acuerdo top-1 contra los pesos maestros.
- Despliegue de asistentes con vision y audio en un unico modelo ligero: al unificar texto, imagen y audio sin encoders separados, simplifica arquitecturas de producto que antes requeririan varios modelos.

## Benchmarks y rendimiento

Metricas medidas por el autor sobre Wikitext-2 (test), 128 ventanas de 512 tokens, puntuadas como respuesta de chat (plantilla de chat con el canal de razonamiento cerrado). La divergencia KL y el acuerdo top-1 se miden contra los pesos maestros QAT en bf16.

| Modelo | Tamano | PPL | KL vs maestro QAT | Top-1 agree |
|---|---|---|---|---|
| Master QAT bf16 (google/gemma-4-12B-it-qat-q4_0-unquantized) | — | 22,26 | — | — |
| Este modelo | 7,89 GB | 22,77 | 0,0253 | 93,44% |
| mlx-community/gemma-4-12B-it-qat-4bit | 10,99 GB | 22,82 | 0,0259 | 93,35% |
| mlx-community/gemma-4-12B-it-4bit (sin QAT) | 6,74 GB | 26,70 | 0,340 | 78,78% |

Velocidad de decodificacion medida en un MacBook Air M5 con `mlx-lm`:

| Build | tokens/s | Memoria pico |
|---|---|---|
| Este modelo | 14,8 | 8,1 GB |
| mlx-community/gemma-4-12B-it-qat-4bit | 9,8 | 11,2 GB |

El autor indica que la mejora de velocidad (aproximadamente 1,5x) se debe a que el build de mlx-community mantiene todos los MLP a 8 bits. Una segunda medicion reportada dio 9,2 frente a 6,4 tokens/s. No se han publicado benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 7,89 GB de pesos; pico medido de 8,1 GB en decodificacion. Cabe en un Mac de 16 GB de memoria unificada dejando espacio para el contexto.
- GPU recomendadas: no aplica a GPU NVIDIA o AMD; el modelo esta en formato MLX y depende de Apple Silicon.
- Cabe en consumer: si, en equipos Apple Silicon; el autor lo ha probado en un MacBook Air M5 (sin ventilador) y menciona que cabe en un Mac de 16 GB.
- Opciones de despliegue: `mlx-lm` (el propio proyecto, solo texto) y el fork `ipsupport-llc/mlx-lm` para imagen y audio; la aplicacion LLMTray para macOS; API compatible con OpenAI a traves de LLMTray. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este checkpoint MLX.
- Latencia y throughput: 14,8 tokens/s de decodificacion con pico de 8,1 GB en MacBook Air M5. Una segunda medicion dio 9,2 frente a 6,4 tokens/s del build comparable. No se aportan datos de latencia de prefill ni de rendimiento en otros equipos.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano | Formato | PPL (Wikitext-2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (roman220220) | 12,96B | 7,89 GB | MLX (rejilla q4_0, escala bf16) | 22,77 | Apache 2.0 | HuggingFace |
| mlx-community/gemma-4-12B-it-qat-4bit | 12,96B (base comun) | 10,99 GB | MLX, grupo 64, MLP a 8 bits | 22,82 | Apache 2.0 | HuggingFace |
| mlx-community/gemma-4-12B-it-4bit (sin QAT) | 12,96B (base comun) | 6,74 GB | MLX, cuantizacion estandar | 26,70 | Apache 2.0 | HuggingFace |
| google/gemma-4-12B-it-qat-q4_0-unquantized (maestro) | 12,96B (base comun) | bf16, mayor | safetensors bf16 | 22,26 | Apache 2.0 | HuggingFace |

Los tres primeros comparten el mismo modelo base de Google y difieren en la estrategia de cuantizacion. No se dispone de comparativas con modelos de otros fabricantes ni con arquitecturas distintas en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo base es instruct y, segun el autor, fuera de un turno de chat puntua de forma muy degradada en texto crudo (PPL en los miles): debe usarse siempre con la plantilla de chat, no como modelo de continuacion de texto.
- La PPL de la tabla no es comparable entre modelos de distinto tamano o familia; el autor advierte que sirve para comparar este build con su maestro, no con otros modelos.
- La puntuacion PPL en bruto (fuera de chat) no es util como metrica de calidad.
- Idiomas soportados no declarados: se desconoce la cobertura multilingue real.
- Longitud de contexto no disponible; no se puede garantizar el comportamiento en conversaciones largas.
- Capacidades de tool calling, uso agentico y rendimiento en codigo o matematicas no estan documentadas.
- Las imagenes y el audio no funcionan en `mlx-lm` estandar: requieren el fork `ipsupport-llc/mlx-lm` o la aplicacion LLMTray. En el flujo estandar el modelo se carga solo como texto.
- El modelo esta limitado a Apple Silicon; no hay soporte indicado para CUDA ni ROCm.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, creado y actualizado el mismo dia (2 de octubre de 2026): es un artefacto reciente y sin validacion externa amplia.
- El autor reporta el reconocimiento de audio con matices: ante una frase conocida el modelo tiende a comentarla en lugar de transcribirla literalmente.
- Riesgo de alucinacion y sesgos: no documentados especificamente en la informacion disponible, pero aplican los del modelo base Gemma 4 12B.
- Licencia Apache 2.0: permite uso comercial, aunque conviene revisar las condiciones del modelo base de Google por si anaden terminos adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/roman220220/gemma-4-12B-it-qat-mlx
- Modelo base (pesos maestros QAT sin cuantizar): https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- GGUF oficial q4_0 de Google: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-gguf
- Build comparativo mlx-community QAT: https://huggingface.co/mlx-community/gemma-4-12B-it-qat-4bit
- Build comparativo mlx-community sin QAT: https://huggingface.co/mlx-community/gemma-4-12B-it-4bit
- Codigo y notas de laboratorio de la conversion: https://github.com/rromenskyi/quant-ternary/tree/main/gemma4-quant
- Fork de mlx-lm con soporte de imagen y audio: https://github.com/ipsupport-llc/mlx-lm
- Aplicacion LLMTray: https://www.ipsupport.us/llmtray/
- Repositorio de LLMTray: https://github.com/ipsupport-llc/llmtray
