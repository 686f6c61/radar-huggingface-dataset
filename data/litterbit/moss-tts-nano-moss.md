# litterbit/moss-tts-nano-moss

## Resumen

MOSS-TTS-Nano-100M es un modelo de síntesis de voz (text-to-speech) multilingüe de tan solo 100 millones de parámetros, desarrollado por MOSI.AI y el equipo OpenMOSS. Está diseñado para generación de habla en tiempo real directamente sobre CPU, sin necesidad de GPU, lo que lo convierte en una opción atractiva para demos locales, servicios web ligeros e integración en productos con requisitos de despliegue sencillos.

El repositorio `litterbit/moss-tts-nano-moss` no contiene el modelo original, sino un paquete de pesos cuantizados y reempaquetados para el motor independiente en C++ `dsh-moss-tts`, también de litterbit. El LLM se convierte a int8 (`Q8_0`, reempaquetado 4×4), el decodificador y el codificador de audio a fp16, y todos los tensores se reescriben en el contenedor propietario `.moss`. No hay reentrenamiento: la arquitectura, los valores de los parámetros y la plantilla de prompt pública se mantienen intactos.

Este paquete resulta relevante porque permite ejecutar un TTS de 100 M parámetros con voces clonables en hardware de consumo, con un RTF de 0,149 en CPU y una latencia de primer bloque de 93-114 ms, manteniendo la licencia Apache-2.0 del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 estilizada de 12 capas (d=768, RoPE) + cabeza local de 1 capa para emisión de códigos por canal; decodificador de audio con upsampling 4+2+2+4 (patch 4/2/2/2/240) |
| Parametros totales | 100 M (modelo base MOSS-TTS-Nano-100M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | LLM en int8 `Q8_0` (escala por grupo de 32 elementos, reempaquetado 4×4); decodificador y codificador de audio en fp16; activaciones en fp32 durante decodificación (prefill en int8) |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.moss` (contenedor propietario del motor `dsh-moss-tts`); no cargable con `transformers`; vocabulario en `tokenizer.mossvocab`; voces en `.mossclone` |

## Arquitectura y entrenamiento

El modelo base es un TTS de 100 M parámetros que genera audio mediante una arquitectura de dos etapas: un LLM global de 12 capas estilo GPT-2 con dimensión 768 y RoPE que predice códigos de audio, seguido de una cabeza local de una capa que emite códigos canal a canal. La representación de audio usa 16 canales de VQ con 1024 códigos por canal y una trama de 80 ms; el decodificador convierte los 16×T códigos en audio estéreo a 48 kHz mediante un upsampling jerárquico de 4+2+2+4 capas con patches 4/2/2/2/240. El frontend de texto incluye su propio tokenizador sentencepiece, exportado como `tokenizer.mossvocab` (427 KB), sin dependencia de Python.

Este repositorio concreto no aporta entrenamiento nuevo: es una conversión numérica del modelo original. Según la model card, el LLM se castea a int8 `Q8_0` con reempaquetado 4×4, el decodificador y el codificador de audio pasan a fp16 y cada tensor se reescribe en el formato `.moss`. La precisión medida con teacher forcing frente a la referencia fp16 en el mismo corpus in-domain es de un 5,2 % de flip de códigos y KL de 0,00145 con la configuración por defecto (int8 en pesos y fp32 en activaciones de decodificación), descrita como indistinguible al oído. La variante con activaciones también en int8 sube a 8,7 % de flip y KL 0,0042, con un 15 % más de velocidad. Bajar los pesos a Q4 resulta inutilizable (64-86 % de flip, KL 0,44-1,16, con cambios perceptibles de sonoridad). No se dispone de información sobre el volumen ni la composición del dataset de entrenamiento original, ni sobre si se aplicó RLHF o DPO.

## Capacidades

- Síntesis de voz multilingüe en chino e inglés.
- Generación de audio estéreo a 48 kHz con tramas de 80 ms y 16 canales VQ de 1024 códigos cada uno.
- Clonación de voz a partir de una referencia de 5-15 segundos en WAV PCM, codificada a un archivo `.mossclone` de pocos KB.
- 18 voces integradas listas para usar (Junhao, Xiaoyu, Ava, Trump, entre otras), derivadas de audios de referencia del proyecto original.
- Inferencia exclusivamente en CPU, sin GPU, mediante el motor C++ `dsh-moss-tts`.
- Interfaz HTTP y stdio para integración en servicios y pipelines.
- Modo de prueba local con interfaz web de audición integrada en el ejecutable.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión ni audio de entrada más allá de la referencia de clonación.

## Casos de uso

- Locución para demos y prototipos: el motor arranca desde un único ejecutable de unos 159 MB con pesos y voces incluidas, lo que permite generar audios de prueba sin instalar dependencias de Python ni configurar CUDA.
- Servicios web ligeros de lectura de texto: la interfaz HTTP del motor permite exponer un endpoint de TTS en un servidor sin GPU, con un RTF de 0,149 que sostiene varias peticiones concurrentes en CPU.
- Integración en aplicaciones de escritorio: los binarios de Windows y el paquete lite permiten incrustar la síntesis de voz en herramientas locales con una latencia de primer bloque de 93-114 ms para 5,12 s de audio.
- Clonación de voz para contenido personalizado: a partir de 5-15 segundos de referencia se genera un `.mossclone` de pocos KB que puede usarse para narraciones con una voz concreta, con almacenamiento separado de las voces integradas para que las actualizaciones no las sobrescriban.
- Generación de audios para accesibilidad: conversión de texto a voz en chino e inglés para lectores de pantalla o interfaces habladas en entornos con hardware modesto.
- Automatización por línea de comandos: el ejecutable `moss_tts.exe` acepta texto, voz y archivo de salida, lo que facilita la generación por lotes de audios en scripts y pipelines de CI.
- Evaluación de calidad de TTS en investigación: las métricas de fidelidad publicadas (flip de códigos y KL frente a fp16) permiten comparar el impacto de distintas configuraciones de cuantización sobre un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card incluye únicamente métricas internas de fidelidad de cuantización y velocidad de inferencia:

| Configuracion | Flip de codigos | KL | Nota |
|---|---|---|---|
| int8 en pesos + activaciones fp32 (por defecto) | 5,2 % | 0,00145 | Indistinguible al oído |
| Activaciones también en int8 | 8,7 % | 0,0042 | 15 % más rápido |
| Pesos en Q4 | 64-86 % | 0,44-1,16 | No utilizable, cambia la sonoridad |

| Metrica de velocidad (i5-14600KF, 4+6 hilos, solo CPU) | Valor |
|---|---|
| LLM | 7,4 ms/fotograma |
| Decodificador | 6,2 ms/fotograma |
| 5,12 s de voz: primer bloque | 93-114 ms |
| 5,12 s de voz: total | 764 ms |
| RTF | 0,149 |
| Reversión escalar sin AVX2 | 16,7 ms/fotograma |

## Requisitos de hardware

- Inferencia exclusivamente en CPU; no requiere VRAM ni GPU.
- Tamaño total de los pesos: 163,8 MB (LLM int8 119,3 MB, decodificador fp16 22,3 MB, codificador fp16 21,8 MB, vocabulario 427 KB y voces de 1-7 KB cada una).
- Referencia de rendimiento medida en un Intel i5-14600KF con 4+6 hilos; el rendimiento escala con el número de núcleos disponibles.
- Funciona en x86-64 con AVX2; sin AVX2 el motor cae a una ruta escalar aproximadamente 2,3 veces más lenta (16,7 ms/fotograma).
- Despliegue mediante el ejecutable `moss_tts.exe` (Windows x64) o el paquete lite; el motor busca los pesos en `--models`, en `models/` junto al ejecutable o en `%LOCALAPPDATA%\MossTTS\models`.
- Interfaz HTTP y stdio documentada para servir el modelo desde otros procesos.
- No se documentan opciones de despliegue con vLLM, llama.cpp, Ollama o TGI; el formato `.moss` solo lo carga el motor `dsh-moss-tts`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| MOSS-TTS-Nano-100M (este paquete cuantizado) | 100 M | no disponible | zh, en | Apache-2.0 | `.moss`, motor C++ en CPU |
| MOSS-TTS-Nano-100M (original OpenMOSS) | 100 M | no disponible | multilingüe (según repo) | Apache-2.0 | Pesos originales del proyecto OpenMOSS |
| Otras alternativas de TTS de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible solo permite comparar este paquete con el modelo original del que deriva; no se dispone de datos de otros modelos TTS comparables en la búsqueda realizada.

## Limitaciones y advertencias

- Los pesos no se pueden cargar con `transformers`: solo funcionan con el motor `dsh-moss-tts`, lo que limita la portabilidad a otros ecosistemas.
- Solo soporta chino e inglés; no se documenta cobertura de otros idiomas.
- La cuantización Q4 de los pesos degrada gravemente la calidad (64-86 % de flip de códigos y cambios de sonoridad), por lo que no debe usarse en producción.
- El rendimiento depende de AVX2; en CPUs sin esta extensión la latencia se multiplica aproximadamente por 2,3.
- La clonación de voz plantea riesgos de uso indebido (suplantación de identidad o síntesis de voces sin consentimiento); la licencia Apache-2.0 no impone restricciones específicas, por lo que la responsabilidad recae en el integrador.
- No hay información publicada sobre sesgos del modelo base, tasas de alucinación en la síntesis ni sobre la composición del dataset de entrenamiento.
- El proyecto no tiene afiliación ni respaldo de los autores de MOSS; las garantías de soporte y mantenimiento dependen del repositorio de litterbit.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria amplia del paquete.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litterbit/moss-tts-nano-moss
- Motor y web: https://github.com/litterbit/dsh-moss-tts
- Descargas y notas de versión: https://github.com/litterbit/dsh-moss-tts/releases/latest
- Documentación de la interfaz HTTP/stdio: https://github.com/litterbit/dsh-moss-tts/blob/main/doc/api.md
- Modelo original OpenMOSS: https://github.com/OpenMOSS/MOSS-TTS-Nano
