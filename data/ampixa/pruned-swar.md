# ampixa/pruned-swar

## Resumen

Pruned Swar es una versión podada del modelo de síntesis de voz (TTS) Swar, especializado en nepalí y con capacidad de clonación de voz. Lo desarrolla Ampixa a partir del modelo base Aarjan/swar, que a su vez se construye sobre la arquitectura F5-TTS. La poda consiste en eliminar 6 de los 22 bloques transformer del modelo original y reentrenar los 16 restantes con habla en nepalí para recuperar calidad, reduciendo el número de parámetros de 337,1 M a 248,9 M (un 26 % menos).

El objetivo es ofrecer una alternativa más rápida y ligera para inferencia TTS en nepalí, manteniendo la capacidad de clonación de voz con audio de referencia. Según la model card, el modelo logra un factor de tiempo real (RTF) de 0,329 frente al 0,445 del original, lo que se traduce en una aceleración de 1,35× en la misma máquina de referencia. El modelo se distribuye en formato safetensors (float16, 0,50 GB) y requiere la librería `f5-tts` junto con un cargador específico para reconstruir la arquitectura de 16 bloques.

Es relevante para desarrolladores que necesiten TTS en nepalí con clonación de voz en entornos con recursos limitados, ya que reduce carga de modelo (1,6 s frente a 2,5 s) y tiempo de generación, a costa de un aumento del error de carácter (CER) en textos largos (8,6 % frente a 5,5 % del original) y una ligera pérdida de similitud de voz (0,04 menos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (F5-TTS), 16 bloques transformer (podado desde 22) |
| Parametros totales | 248.936.580 (248,9 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos en float16 (se convierten a fp32 al cargar); no se documentan otras cuantizaciones |
| Idiomas soportados | Nepalí (ne) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (float16), vocab.txt, config.json, loader Python |

## Arquitectura y entrenamiento

El modelo es una variante podada de F5-TTS, un sistema de síntesis de voz basado en transformer con flujo de coincidencia (flow matching) y clonación de voz zero-shot. La poda elimina 6 de los 22 bloques transformer del Swar original, dejando 16 bloques, y posteriormente se reentrena sobre habla en nepalí para recuperar la calidad perdida. El vocabulario de caracteres es el de Swar, sin cambios, y se recomienda usar el front-end de texto y el chunking del release original de Swar para obtener mejores resultados con texto nepalí.

Los datos de entrenamiento declarados son dos corpus en nepalí de AI4Bharat: Rasa (43 h, CC BY 4.0) e IndicVoices-R (89 h, CC BY 4.0). No se especifica en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (en un modelo TTS no es el enfoque habitual). La innovación técnica principal es la poda estructurada de bloques con reentrenamiento, que reduce parámetros y latencia manteniendo la arquitectura F5-TTS y el vocoder Vocos (mel 24 kHz).

## Capacidades

- Generación de voz (text-to-speech) en nepalí a partir de texto.
- Clonación de voz zero-shot mediante un audio de referencia y su transcripción (`ref_file` y `ref_text`).
- Control de la generación mediante parámetros de inferencia: número de pasos de flujo (`nfe_step`), fuerza de CFG (`cfg_strength`), semilla (`seed`) y longitud mínima de audio.
- Soporte de frases cortas y oraciones largas, con chunking recomendado para textos extensos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá del audio de referencia para clonación.
- Capacidad monolingüe: únicamente nepalí.

## Casos de uso

- Síntesis de voz para aplicaciones de accesibilidad en nepalí: el modelo puede convertir texto a voz con un RTF de 0,329, adecuado para lectura de contenido en tiempo casi real en hardware de consumo.
- Clonación de voz para locuciones personalizadas: con un audio de referencia y su transcripción se puede generar voz sintética con la identidad del hablante, útil para doblaje o contenido educativo, siempre con permiso del hablante.
- Generación de audiolibros o contenido largo en nepalí: usando el chunking del front-end de Swar, se pueden procesar textos extensos por fragmentos; el modelo mantiene un RTF de 0,217 en oraciones largas.
- Integración en asistentes de voz locales: al reducir la carga del modelo a 1,6 s y el tiempo medio por clip a 1,21 s, es viable en pipelines de respuesta conversacional de baja latencia.
- Prototipado rápido de TTS en nepalí: el paquete `f5-tts==1.1.22` y el loader incluido permiten poner en marcha el modelo con pocas líneas de código en GPU CUDA o MPS.
- Investigación sobre poda de modelos TTS: sirve como caso de estudio reproducible de poda estructurada con reentrenamiento, ya que se publican el script de benchmark y los resultados por clip en la carpeta `benchmark/`.
- Generación de avisos o mensajes pregrabados en nepalí para sistemas de megafonía o IVR, donde la latencia y el tamaño del modelo importan.

## Benchmarks y rendimiento

Los datos publicados en la model card comparan Swar y Pruned Swar en la misma máquina (Apple M2 Ultra GPU, PyTorch MPS, fp32, 16 pasos de flujo, CFG 2,0, sway −1, longitud mínima 2 s, semilla 0; 29 clips nepalíes: 20 frases cortas y 9 oraciones largas):

| Métrica | Swar | Pruned Swar |
|---|---|---|
| Bloques transformer | 22 | 16 |
| Parámetros | 337,1 M | 248,9 M (26 % menos) |
| RTF, todos los clips | 0,445 | 0,329 |
| RTF, frases cortas | 0,649 | 0,486 |
| RTF, oraciones largas | 0,298 | 0,217 |
| Tiempo medio por clip | 1,63 s | 1,21 s |
| Carga del modelo | 2,5 s | 1,6 s |
| Aceleración | – | 1,35× |
| CER en texto largo (dev set de 80 ítems) | 5,5 % | 8,6 % |
| Similitud de voz | referencia | 0,04 menos |

El RTF se define como tiempo de generación dividido por la duración del audio; con 0,329, un minuto de habla tarda unos 20 segundos en generarse. Una ejecución anterior en una NVIDIA L40 midió una aceleración similar de 1,39×. No se publican resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a un modelo TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 248,9 M de parámetros en float16 (0,50 GB de pesos) y conversión a fp32 al cargar, la huella de pesos ronda 1 GB en fp32, más memoria para activaciones y vocoder.
- GPU recomendadas: no se especifican requisitos mínimos; los benchmarks se hicieron en Apple M2 Ultra (MPS) y en una NVIDIA L40.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño reducido del modelo, aunque la información disponible no confirma modelos concretos como RTX 4090.
- Opciones de despliegue: paquete `f5-tts==1.1.22` con el loader `load_pruned_swar.py` incluido; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: RTF de 0,329 global, 0,486 en frases cortas y 0,217 en oraciones largas en la máquina de referencia; tiempo medio por clip de 1,21 s y carga de 1,6 s.

## Comparativa con modelos similares

| Modelo | Parámetros | Bloques | RTF (todos los clips) | CER texto largo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Pruned Swar | 248,9 M | 16 | 0,329 | 8,6 % | CC BY-SA 4.0 | Hugging Face (ampixa/pruned-swar) |
| Swar (base) | 337,1 M | 22 | 0,445 | 5,5 % | CC BY-SA 4.0 | Hugging Face (Aarjan/swar) |
| F5-TTS (genérico) | no disponible | no disponible | no disponible | no disponible | no disponible | GitHub SWivid/F5-TTS |

No se dispone en la información proporcionada de otros modelos TTS en nepalí comparables con datos de rendimiento; la comparación se limita al modelo base Swar y a la familia F5-TTS.

## Limitaciones y advertencias

- La poda degrada la precisión: el CER en texto largo sube del 5,5 % al 8,6 % y la similitud de voz baja 0,04 respecto a Swar.
- Modelo monolingüe en nepalí; no soporta otros idiomas.
- Riesgo de alucinación y artefactos en la síntesis, especialmente en textos largos sin chunking adecuado.
- La clonación de voz puede imitar a personas reales; solo debe usarse con permiso explícito del hablante, como advierte el autor.
- Licencia CC BY-SA 4.0: permite uso comercial con atribución y bajo la misma licencia (share-alike), lo que obliga a licenciar obras derivadas de igual forma.
- Requiere el loader específico `load_pruned_swar.py` para reconstruir la arquitectura de 16 bloques; no funciona con la configuración estándar de F5-TTS sin ese script.
- Los pesos están en float16 y se convierten a fp32 al cargar, lo que aumenta el uso de memoria respecto al tamaño del archivo.
- No se documentan sesgos específicos más allá de los inherentes a los corpus de entrenamiento (Rasa e IndicVoices-R).
- Sin descargas ni likes en el momento de la consulta; modelo muy reciente y sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ampixa/pruned-swar
- Modelo base Swar: https://huggingface.co/Aarjan/swar
- Repositorio F5-TTS: https://github.com/SWivid/F5-TTS
- Vocoder Vocos: https://huggingface.co/charactr/vocos-mel-24khz
- Dataset Rasa: https://huggingface.co/datasets/ai4bharat/Rasa
- Dataset IndicVoices-R: https://huggingface.co/datasets/ai4bharat/indicvoices_r
- Sitio del autor (Ampixa): https://ampixa.com
