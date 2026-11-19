# AKinvox/faster-kokoro-v1

## Resumen

Faster Kokoro v1 es un modelo de síntesis de voz (text-to-speech) desarrollado por AKinvox como variante optimizada de hexgrad/Kokoro-82M. Mantiene intacta la etapa de Kokoro que determina el contenido lingüístico y prosódico del habla, y sustituye únicamente la etapa final del pipeline —la que convierte la representación intermedia en forma de onda— por un vocoder más pequeño y rápido basado en Vocos. El resultado es un modelo que conserva las 54 voces y los 9 idiomas del original, pero que genera audio entre 4,1x y 3,6x más rápido según el hardware.

El modelo está pensado para cargas de trabajo donde el rendimiento importa tanto como la calidad, como la generación de audiolibros: una sola obra supone horas de audio y el coste computacional del vocoder se vuelve dominante. Con CUDA graphs sobre una RTX 3090 Ti alcanza 253x tiempo real (24 ms por frase típica), y en CPU con 8 hilos llega a 13,7x tiempo real.

La relevancia actual del modelo reside en que demuestra que es posible acelerar sustancialmente un TTS de referencia sin degradar de forma apreciable la inteligibilidad (WER de 3,35 % frente a 3,42 % del original) ni la identidad de las voces (similitud ECAPA de 0,958 de media). Es un lanzamiento inicial, con licencia Apache 2.0 y un repositorio de apenas 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS en dos etapas: Kokoro-82M (etapa lingüística/prosódica) + vocoder Vocos (sustituye la etapa final de waveform) |
| Parametros totales | no disponible (el modelo base Kokoro tiene 82M; el vocoder sustituto es más pequeño que el original, sin cifra publicada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS por frases; sin ventana de contexto declarada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, es, fr, hi, it, ja, pt, zh (9 idiomas según la model card, con variantes regionales como en-US, en-UK, pt-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 0,1 GB; la model card no detalla safetensors, GGUF ni otros) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de hexgrad/Kokoro-82M. Kokoro es un TTS de 82M de parámetros que produce representaciones acústicas intermedias a partir de texto; Faster Kokoro conserva esa etapa sin cambios y reemplaza el vocoder final —el módulo que transforma esas representaciones en audio a 24 kHz— por uno basado en Vocos, más pequeño y ligero. La salida se mantiene a 24 kHz y el pipeline incluye el procesamiento de texto propio de Kokoro.

No se han publicado detalles sobre el dataset de entrenamiento del vocoder sustituto, el número de tokens, la composición de los datos ni si hubo ajuste fino con RLHF o DPO; la model card se centra en métricas de velocidad y calidad comparativas. La innovación técnica destacable es la sustitución selectiva de la última etapa del pipeline, que permite acelerar la inferencia sin reentrenar el modelo lingüístico y conservando las 54 voces y los 9 idiomas del original. El autor indica que el modelo sigue en mejora y que esta es la primera release.

## Capacidades

- Síntesis de voz a partir de texto con salida de audio a 24 kHz, incluyendo el procesamiento de texto de Kokoro.
- 54 voces predefinidas con identificadores propios (por ejemplo `am_adam`, `af_heart`, `bf_emma`, `ef_dora`, `ff_siwis`, `hf_alpha`, `if_sara`, `jf_alpha`, `pf_dora`).
- Soporte multilingüe en 9 idiomas: inglés (US y UK), español, francés, hindi, italiano, japonés, portugués (BR) y chino.
- Generación de pasajes largos sin cortes ni deriva (drift) según las pruebas del autor sobre las 54 voces y los 9 idiomas.
- Aceleración específica para GPU mediante CUDA graphs (253x tiempo real en RTX 3090 Ti) y modo estándar sin CUDA graphs (95x tiempo real).
- Inferencia en CPU viable: 13,7x tiempo real con 8 hilos en Ryzen 9 7940HS.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada ni modo de razonamiento; es un modelo exclusivamente TTS.

## Casos de uso

- Generación de audiolibros: el caso de uso declarado por el autor. Un libro completo supone horas de audio y el vocoder acelerado reduce el tiempo de generación a una fracción del de Kokoro estándar (0,24 s por minuto de habla en RTX 3090 Ti con CUDA graphs), lo que hace viable procesar catálogos completos en lote.
- Síntesis por lotes en servidores con CPU: con 13,7x tiempo real en 8 hilos, permite generar narraciones o avisos sin GPU dedicada, útil para pipelines nocturnos o entornos con hardware limitado.
- Lectura de artículos y contenido web: la ventana de procesamiento por frases y el bajo coste por frase (24 ms típicos en GPU) permiten convertir artículos largos en audio bajo demanda con latencia casi imperceptible.
- Accesibilidad y lectores de pantalla: la conservación de las 54 voces y los 9 idiomas permite ofrecer síntesis multilingüe de calidad con identidad de voz estable en aplicaciones de asistencia.
- Localización de contenido audiovisual: la cobertura de en, es, fr, hi, it, ja, pt y zh con voces nativas por idioma facilita doblar o narrar materiales para múltiples mercados desde un único modelo.
- Prototipado de asistentes de voz: la licencia Apache 2.0 y el tamaño reducido del repositorio (0,1 GB) permiten integrar el modelo en prototipos y demos sin restricciones de uso comercial.
- Generación de material educativo: narración de cursos, apuntes o materiales de e-learning con pasajes largos sin cortes, gracias a la ausencia de dropouts reportada en textos extensos.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. Las mediciones de velocidad se realizaron tras el calentamiento, con 36 frases en inglés (3 minutos de habla), de texto a audio a 24 kHz incluyendo el procesamiento de texto.

| Hardware | Modo | Velocidad | 1 minuto de habla tarda | Frase típica |
|---|---|---:|---:|---:|
| NVIDIA RTX 3090 Ti | CUDA graphs | 253x tiempo real | 0,24 s | 24 ms |
| NVIDIA RTX 3090 Ti | estándar | 95x tiempo real | 0,63 s | 59 ms |
| AMD Ryzen 9 7940HS, 8 hilos | CPU | 13,7x tiempo real | 4,4 s | 456 ms |

Comparativa de velocidad frente a Kokoro estándar en las mismas máquinas: 4,1x más rápido en GPU con CUDA graphs (1,5x sin ellas) y 3,6x más rápido en CPU.

| Medida de calidad | Faster Kokoro | Kokoro estándar |
|---|---:|---:|
| Word error rate, 20 pasajes largos en inglés (8 minutos) | 3,35 % | 3,42 % |
| Similitud de voz con el original, 54 voces (0 a 1) | 0,958 | 1 |
| Pasajes largos, 54 voces y 9 idiomas | sin cortes ni deriva | no disponible |

El WER se midió con Whisper large-v3. La similitud de voz es ECAPA sobre pasajes de 20 a 35 segundos: 38 de las 54 voces alcanzan 0,95 o más, y las voces en hindi son las más bajas (0,90 a 0,93). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, al no ser aplicables a un modelo TTS.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio ocupa 0,1 GB y el modelo base tiene 82M de parámetros, por lo que la huella en memoria es muy reducida y cabe holgadamente en cualquier GPU de consumo actual.
- GPU recomendadas: el autor reporta mediciones en NVIDIA RTX 3090 Ti. Por el tamaño del modelo, GPUs de gama media y de consumo (RTX 4090, RTX 3090, RTX 3060 y similares) son suficientes; no se han publicado cifras para otros modelos concretos.
- CPU: funciona sin GPU; 13,7x tiempo real con 8 hilos en AMD Ryzen 9 7940HS.
- Opciones de despliegue: el autor publica código en GitHub (github.com/akinvox/faster-kokoro). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a un modelo TTS de este tipo.
- Latencia y throughput: 24 ms por frase típica y 253x tiempo real en RTX 3090 Ti con CUDA graphs; 59 ms por frase y 95x tiempo real en modo estándar; 456 ms por frase y 13,7x tiempo real en CPU de 8 hilos.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Velocidad | Calidad (WER) | Disponibilidad |
|---|---|---|---:|---|---:|---|
| Faster Kokoro v1 | 82M (base) + vocoder Vocos | 9 | Apache 2.0 | 253x tiempo real (RTX 3090 Ti, CUDA graphs); 13,7x en CPU | 3,35 % | Hugging Face, GitHub |
| Kokoro-82M (hexgrad) | 82M | 9 | Apache 2.0 | 1x referencia (95x tiempo real en RTX 3090 Ti estándar) | 3,42 % | Hugging Face |
| Otros TTS open source de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa disponible es con el modelo base Kokoro-82M, del que hereda voces, idiomas y licencia. No se dispone de datos de benchmarks frente a otras familias TTS en la información proporcionada.

## Limitaciones y advertencias

- Es la primera release del autor, que indica explícitamente que el modelo sigue en mejora; pueden aparecer cambios incompatibles en versiones futuras.
- La similitud de voz media es 0,958, no 1: la identidad vocal no es idéntica a la de Kokoro estándar, y las voces en hindi son las más afectadas (0,90 a 0,93).
- El WER de 3,35 % se midió únicamente sobre pasajes en inglés con Whisper large-v3; no hay métricas de inteligibilidad publicadas para el resto de idiomas.
- No se han publicado detalles sobre sesgos del vocoder, riesgos de alucinación acústica ni comportamiento en dominios específicos (números, siglas, nombres propios).
- Las mediciones de velocidad se limitan a una RTX 3090 Ti y un Ryzen 9 7940HS; el rendimiento en otro hardware no está documentado.
- No se especifican requisitos de memoria, formatos de pesos ni opciones de cuantización, lo que dificulta planificar el despliegue sin pruebas propias.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Kokoro-82M también es Apache 2.0; conviene verificar las condiciones de las voces y del vocoder Vocos en sus repositorios originales.
- Para producción en audiolibros o doblaje conviene validar la calidad percibida por idioma, dado que las métricas publicadas se centran en inglés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AKinvox/faster-kokoro-v1
- Código en GitHub: https://github.com/akinvox/faster-kokoro
- Sitio del autor (AkinVox): https://akinvox.com
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- Muestras de audio comparativas: disponibles en el repositorio del modelo, bajo `samples/` (por ejemplo, https://huggingface.co/AKinvox/faster-kokoro-v1/resolve/main/samples/a_am_adam_faster.mp3)
