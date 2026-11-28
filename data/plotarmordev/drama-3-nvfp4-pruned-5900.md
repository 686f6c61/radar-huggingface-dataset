# plotarmordev/drama-3-NVFP4-Pruned-5900

## Resumen

Drama 3 NVFP4-Pruned-5900 es una cuantización comunitaria no oficial del modelo de síntesis de voz (text-to-speech) Drama 3 de Fish Audio. El autor, plotarmordev, ha podado los expertos enrutados de la mezcla de expertos (MoE) del backbone de 10.240 a 5.900 y los ha almacenado como códigos int3 (3 bits por peso) mediante GPTQ, partiendo de los originales en FP8. El resultado ocupa 14,50 GiB en disco, frente a los 18,34 GiB de la build NVFP4 anterior y los 38,63 GiB del modelo original.

El modelo resuelve el problema del despliegue de un TTS de gran tamaño en hardware con memoria limitada, manteniendo una calidad de síntesis y clonación de voz cercana a la referencia: en 24 textos en inglés, la tasa de error de palabras (WER) con voz de referencia se mantuvo dentro de 0,3 puntos de la build NVFP4. Está pensado para entornos donde cargar el modelo completo no es viable, como estaciones de trabajo con GPU de consumo o Apple Silicon.

La relevancia actual radica en que es un ejemplo de compresión agresiva sobre una arquitectura MoE aplicada a audio, con un ecosistema de ejecución muy específico: no carga en Transformers ni en SGLang-Omni, y requiere el motor TensorFold con la serie de parches de drama-tensorfold. La licencia es la Fish Audio Community License, no una licencia de código abierto estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) para síntesis de voz, con codec de audio asociado |
| Parametros totales | 10.139.016.320 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados en int3 (GPTQ desde FP8), 3,5 bits por peso; codec en BF16; head recortada; build anterior en NVFP4 4-bit |
| Idiomas soportados | en (inglés) |
| Licencia | fish-audio-community-license (otra, no estándar) |
| Formato de pesos | safetensors (con codec en `codec.pth`); requiere motor TensorFold con parches |

## Arquitectura y entrenamiento

El backbone de Drama 3 es una mezcla de expertos con 40 capas de 256 expertos enrutados cada una (10.240 en total). Esta build conserva 5.900 expertos, el mismo conjunto que la build NVFP4 previa, seleccionados a partir de estadísticas del router registradas mientras el modelo generaba voz, con calibración parcial sobre peticiones privadas de clonación de voz. La lista de expertos conservados está en `model.safetensors.index.json` bajo `metadata.drama_experts`.

Los expertos conservados se almacenan en int3: cada bloque de 16 pesos son tres planos de 16 bits (signo, bit alto y bit bajo de magnitud) que codifican los valores E2M1 0, 2, 4 y 6, bajo las escalas de bloque E4M3 de NVFP4 y una escala global FP32, resultando en 3,5 bits por peso. Se cuantizaron por GPTQ desde los originales en FP8 usando las mismas filas de calibración, kappa y damping de la build NVFP4. Además, se recortó `lm_head` a las 4.097 filas que el motor muestrea (fin de discurso y tokens semánticos de audio) y se redondearon los tensores FP32 de `codec.pth` a BF16. `config.json`, el tokenizer y `chat_template.jinja` son idénticos byte a byte al original. No se documentan en la información disponible detalles sobre el dataset de entrenamiento original, número de tokens ni etapas de RLHF/DPO.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés a partir de texto.
- Clonación de voz con voz de referencia (reference-voice), evaluada por WER en 24 textos en inglés.
- Voces integradas (built-in voices), con menos fallos que la build NVFP4 según el autor.
- Generación de audio mediante codec almacenado en BF16 y head recortada a los tokens de audio semánticos y fin de discurso.
- Ejecución en Metal (Apple Silicon) y CUDA (NVIDIA) mediante parches específicos del motor TensorFold.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Clonación de voz en local para prototipos: el modelo permite generar habla con una voz de referencia en inglés usando el motor TensorFold, con un peso en disco de 14,50 GiB que cabe en estaciones de trabajo con GPU de 16-24 GB o Apple Silicon con memoria unificada suficiente.
- Síntesis de voz para audiolibros y contenido narrado: al mantener el WER de la voz de referencia dentro de 0,3 puntos de la build NVFP4, es adecuado para generar narraciones largas en inglés donde la fidelidad de pronunciación importa.
- Integración en servidores de voz autoalojados: el launcher sirve el modelo en el puerto 18793 con guía γ 1,5 en modo batched, lo que permite atender peticiones concurrentes de TTS en un servicio interno.
- Evaluación de técnicas de compresión MoE: sirve como referencia práctica para estudiar el impacto de podar expertos y cuantizar a int3 en una tarea de audio, con resultados comparativos publicados en `results/smaller-builds`.
- Despliegue en Apple Silicon para desarrollo: los parches de Metal (`0005-int3-routed-experts.patch`, `0003`, `0004`) permiten ejecutar el modelo en macOS sin GPU NVIDIA, útil para equipos de desarrollo con Mac.
- Generación de voces para doblaje o preproducción: las voces integradas y la clonación permiten crear pistas de voz temporales en inglés antes de una grabación definitiva, con menos fallos de toma que la build NVFP4 según el autor.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| WER con voz de referencia (24 textos en inglés) | dentro de 0,3 puntos de la build NVFP4 |
| Fallos en tomas con voces integradas | menos que la build NVFP4 |
| Tamano en disco (pesos + codec) | 14,50 GiB (frente a 18,34 GiB NVFP4 y 38,63 GiB original) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo de síntesis de voz.

## Requisitos de hardware

- VRAM estimada: los pesos y el codec ocupan 14,50 GiB en disco; se requiere memoria suficiente para cargarlos más el overhead del motor (no se especifica una cifra exacta de VRAM en la información disponible).
- GPU recomendadas: se documenta ejecución en NVIDIA con CUDA 13 (`nvcc`) y en Apple Silicon vía Metal; el autor menciona haber medido la build en una GB10.
- GPU de consumo: el tamaño de 14,50 GiB sugiere que puede caber en GPU con 16 GB o más, aunque no se confirma explícitamente en la información disponible.
- Opciones de despliegue: exclusivamente el motor TensorFold con la serie de parches de drama-tensorfold (rama `drama-nvfp4` en CUDA, parches de macOS en Metal). No carga en Transformers ni en SGLang-Omni; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Requisitos de toolchain: Zig 0.17.0 exacto y el comando `hf` de `huggingface_hub`.
- Latencia y throughput: no disponibles; solo se indica que el launcher sirve con guía γ 1,5 en modo batched en el puerto 18793.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano en disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Drama 3 NVFP4-Pruned-5900 (esta build) | 10.139.016.320 | no disponible | 14,50 GiB | fish-audio-community-license | Hugging Face, revisión actual |
| Drama 3 NVFP4-Pruned-5900 (build anterior) | 10.139.016.320 | no disponible | 18,34 GiB | fish-audio-community-license | Hugging Face, revisión `4bfe2c32` |
| Drama 3 original (fishaudio/drama-3) | no disponible | no disponible | 38,63 GiB | fish-audio-community-license | Hugging Face |

No se dispone de datos de otros modelos TTS comparables en la información proporcionada.

## Limitaciones y advertencias

- Es una cuantización comunitaria no oficial: Fish Audio no la ha hecho, revisado ni respaldado.
- Solo soporta inglés (`en`); no se documentan otros idiomas.
- No carga en Transformers ni en SGLang-Omni; requiere el motor TensorFold con parches específicos y Zig 0.17.0 exacto, lo que limita la portabilidad.
- La licencia Fish Audio Community License no es una licencia de código abierto estándar; es necesario revisar sus términos para uso comercial.
- La poda de expertos se calibró parcialmente con peticiones privadas de clonación de voz, lo que puede introducir sesgos hacia esos dominios de voz.
- Riesgo de alucinación y artefactos de audio inherente a los modelos TTS, no cuantificado en la información disponible.
- La build anterior NVFP4 se reemplazó en el mismo repositorio; hay que fijar la revisión `4bfe2c32daa771566970ad385292fab43d060bb8` para recuperarla.
- El rendimiento medido se basa en 24 textos en inglés, una muestra limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/plotarmordev/drama-3-NVFP4-Pruned-5900
- Modelo base: https://huggingface.co/fishaudio/drama-3
- Repositorio drama-tensorfold: https://github.com/plotarmordev/drama-tensorfold
- Resultados comparativos: https://github.com/plotarmordev/drama-tensorfold/tree/main/results/smaller-builds
- Parches de macOS: https://github.com/plotarmordev/drama-tensorfold/tree/main/engine/nvfp4/macos/patches
- Parches CUDA: https://github.com/plotarmordev/drama-tensorfold/tree/main/engine/nvfp4/patches
- Receta macOS: https://github.com/plotarmordev/drama-tensorfold/blob/main/recipe/README-macos.md
- Motor TensorFold (rama drama-nvfp4): https://github.com/plotarmordev/TensorFold/commit/b1f4b9b4830c9bd43bf7c432cffe7dea21313537
- Revisión de la build NVFP4 anterior: https://huggingface.co/plotarmordev/drama-3-NVFP4-Pruned-5900/tree/4bfe2c32daa771566970ad385292fab43d060bb8
