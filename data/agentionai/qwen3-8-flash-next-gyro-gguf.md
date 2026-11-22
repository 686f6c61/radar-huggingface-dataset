# agentionai/Qwen3.8-Flash-Next-Gyro-GGUF

## Resumen

Qwen3.8-Flash-Next-Gyro es una cuantización GGUF del modelo Qwen3.8-Flash-Next (125.743.653.760 parámetros totales, arquitectura MoE) publicada por agentionai. El objetivo declarado por el autor es hacer correr un modelo de 125B en una única GPU de consumo: la variante Gyro-S ocupa 27,64 GiB de VRAM (pensada para tarjetas de 32 GB como la RTX 5090 o la R9700), la Gyro-M 34,98 GiB (48 GB o 64 GB de memoria unificada) y la Gyro-L 50,21 GiB (64 GB de memoria unificada tipo Strix Halo). El modelo es multimodal image-text-to-text, con hasta 128k de contexto según la model card.

La relevancia de esta publicación está en el formato propietario de cuantización: los expertos enrutados se almacenan en una base rotada mediante el códec APR (Agention Precision Rotor) y tipos trellis (TQK6/TQK7, TQ2_T, TQP5-7). Los nombres TQ1_0, TQ2_0 y TQ3_0 son solo clases de tamaño para el Hub y no corresponden a los tipos GGUF estándar. Como consecuencia, llama.cpp upstream no puede cargar estos ficheros todavía: requieren Strata 0.2.0 o superior, el fork halo-box/strix-llama.cpp o el fork agentionai/llama.cpp.

El repositorio acumula 2.249.697 descargas y 254 likes, con un tamaño total de 706,7 GB (incluye múltiples variantes, el draft MTP, el proyector de visión mmproj y las versiones `-noPLE` sin tabla n-gram). La licencia es `qwen-community-1.0` (etiquetada como `other` en el Hub), lo que condiciona el uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) transformer; cuantización GGUF con códec APR y tipos trellis propietarios |
| Parámetros totales | 125.743.653.760 |
| Parámetros activos | no disponible |
| Longitud de contexto | hasta 128k (según la model card; el ejemplo de arranque usa `-c 65536`) |
| Tipos de cuantización | TQ1_0 (Gyro-S, 27,64 GiB), TQ2_0 (Gyro-M, 34,98 GiB), TQ3_0 (Gyro-L, 50,21 GiB); expertos en TQK6/TQK7, TQ2_T y TQP5-7; variantes `-noPLE`; Gyro-Coder en 19,92 GiB |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (`license: other` en el Hub) |
| Formato de pesos | GGUF (con codec APR propietario); incluye `mtp-Qwen3.8-Flash-Next-draft.gguf` y `mmproj-F16.gguf` |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.8-Flash-Next, un transformer con mezcla de expertos de 125.743.653.760 parámetros totales. Esta publicación no entrena el modelo: es una cuantización (`base_model_relation: quantized`) que reescribe los pesos para reducir el espacio ocupado. La innovación técnica propia es el códec APR: los expertos enrutados se guardan en una base rotada y se cuantizan con tipos trellis (TQK6/TQK7, TQ2_T, TQP5-7), lo que permite mantener los pesos en VRAM de 32 GB con una pérdida de calidad declarada baja. El autor reporta un KLD de 0,291 para Gyro-M frente a 0,311 de ISTA IQ3_XXS, con un 20 % menos de memoria de GPU.

La publicación incluye un draft MTP (`mtp-Qwen3.8-Flash-Next-draft.gguf`) para decodificación especulativa, soportada explícitamente por el fork agentionai/llama.cpp, y un proyector de visión `mmproj-F16.gguf` que habilita la entrada de imágenes. La tabla n-gram se mantiene en disco (`--ngram-on-disk`), de modo que no consume VRAM; las variantes `-noPLE` omiten esa tabla para reducir el tamaño de descarga. No se detallan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO).

## Capacidades

- Generación de texto conversacional multi-turno, con hasta 128k de contexto según la model card.
- Entrada de imágenes: pipeline `image-text-to-text`, con proyector de visión `mmproj-F16.gguf`.
- Generación de código: el autor publica una variante específica (Gyro-Coder, 256 expertos de código por capa) y una versión afinada para coding agéntico (Signal 2).
- Razonamiento agéntico y multi-step: Signal 2 se describe como Gyro-S con un tune de coding agéntico fusionado, con la misma tasa de acierto usando menos tokens.
- Salida estructurada JSON: el benchmark de velocidad del autor mide 221 tok/s en salida JSON con Gyro-S sobre RTX 5090 con Strata.
- Decodificación especulativa mediante draft MTP.
- Tool calling / function calling: no se documenta explícitamente en la información disponible.
- Capacidades multilingües: no disponibles.
- Variante abliterated publicada por el mismo autor (Gyro-abliterated-Huihui).

## Casos de uso

- Asistente de código en estación de trabajo local: Gyro-Coder (19,92 GiB) cabe en una GPU de 24 GB y permite integrar un agente de coding en el editor sin enviar código a la nube, con contexto ampliable hasta 128k para repositorios medianos.
- Automatización de tareas agénticas con salida JSON: la variante Signal 2 está afinada para coding agéntico y el autor mide 221 tok/s en JSON sobre RTX 5090, lo que la hace adecuada para pipelines que encadenan llamadas estructuradas.
- Análisis de documentos con imágenes en local: el pipeline image-text-to-text con `mmproj-F16.gguf` permite procesar capturas, diagramas y páginas escaneadas junto con texto en un servidor `llama-server` propio.
- Despliegue en hardware de 32 GB de consumo: Gyro-S ocupa 27,64 GiB y corre íntegramente en GPU en una RTX 5090 o R9700, habilitando inferencia de un modelo de 125B sin clúster.
- Estaciones con memoria unificada (Strix Halo, 64 GB): Gyro-L a 50,21 GiB ofrece la mayor calidad de la familia en un equipo compacto, útil para prototipado de agentes y evaluación de prompts.
- Servidor interno compatible con endpoints: el tag `endpoints_compatible` y el arranque con `--jinja` permiten exponer el modelo en `http://localhost:8080` y apuntar aplicaciones o agentes existentes contra esa API.
- Investigación sobre cuantización extrema: el códec APR y los tipos trellis permiten estudiar la relación entre tamaño, KLD y comportamiento en bucles (el autor reporta cero bucles en 45 ejecuciones de estrés para Gyro-S y Gyro-M).

## Benchmarks y rendimiento

| Métrica | Gyro-S | Gyro-M | Referencia |
|---|---|---|---|
| VRAM de pesos | 27,64 GiB | 34,98 GiB | Gyro-L: 50,21 GiB |
| KLD | no disponible | 0,291 | ISTA IQ3_XXS: 0,311 |
| Throughput (RTX 5090, Strata, JSON) | 221 tok/s | no disponible | — |
| Throughput prosa / código | 140 / 209 tok/s | no disponible | — |
| Bucles en test de estrés (45 ejecuciones) | 0 | 0 | — |
| Contexto máximo | 128k | no disponible | — |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM de pesos: 27,64 GiB (Gyro-S), 34,98 GiB (Gyro-M), 50,21 GiB (Gyro-L), 19,92 GiB (Gyro-Coder).
- GPU de 32 GB: RTX 5090, R9700 (Gyro-S).
- GPU de 48 GB (una tarjeta o 2×24 GB) o 64 GB de memoria unificada: Gyro-M.
- Memoria unificada de 64 GB o más (Strix Halo): Gyro-L; también Gyro-S o Gyro-M.
- GPU de 24 GB: Gyro-Coder para coding, o Gyro-S con la caché de expertos de Strata; GPU de 16–24 GB con la caché de expertos de Strata.
- Aceleración: CUDA (fork agentionai/llama.cpp), Vulkan y HIP (halo-box/strix-llama.cpp), y Strata 0.2.0+ para NVIDIA y AMD RX 7000 / RX 9000 / R9700.
- Despliegue: contenedor `agentionai/agention-llama:server`, Strata (app, Terminal y motor) o strix-llama.cpp. llama.cpp upstream no carga estos ficheros.
- Throughput medido: 221 tok/s en JSON, 140 tok/s en prosa y 209 tok/s en código sobre RTX 5090 con Strata (Gyro-S).
- El draft MTP y el proyector de visión son descargas adicionales; la tabla n-gram reside en disco y no consume VRAM.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | VRAM mínima | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Gyro (Gyro-S) | 125,7B (MoE) | 128k | 27,64 GiB | qwen-community-1.0 | GGUF con APR; requiere Strata, strix-llama.cpp o fork agentionai |
| Qwen3.8-Flash-Next-Gyro (Gyro-M) | 125,7B (MoE) | no disponible | 34,98 GiB | qwen-community-1.0 | ídem |
| Qwen3.8-Flash-Next-Gyro (Gyro-L) | 125,7B (MoE) | no disponible | 50,21 GiB | qwen-community-1.0 | ídem |
| ISTA IQ3_XXS (referencia del autor) | no disponible | no disponible | 20 % más que Gyro-M | no disponible | no disponible |

La información disponible no incluye comparaciones con otras familias de modelos (Llama, Mistral, DeepSeek) ni sus cifras de benchmarks, por lo que la comparativa se limita a las variantes del propio autor y a la referencia ISTA citada en la model card.

## Limitaciones y advertencias

- Compatibilidad rota con llama.cpp upstream: los ficheros solo cargan en Strata 0.2.0+, halo-box/strix-llama.cpp o el fork agentionai/llama.cpp, lo que limita la portabilidad y ata el despliegue a herramientas concretas.
- Formato propietario: el códec APR y los tipos trellis no son GGUF estándar; las herramientas de inspección, conversión y cuantización habituales pueden no interpretarlos.
- Licencia qwen-community-1.0: es necesario revisar sus términos antes de cualquier uso comercial; el Hub la etiqueta como `other`.
- Idiomas soportados no documentados: no hay garantía de calidad multilingüe y conviene evaluar el comportamiento en castellano antes de producción.
- Parámetros activos no disponibles: impide estimar con precisión el coste de cómputo por token y comparar eficiencia frente a otros MoE.
- Sin benchmarks de calidad publicados: no hay datos de MMLU, HumanEval ni GSM8K para esta cuantización; el KLD de 0,291 solo mide la divergencia respecto al modelo base, no la calidad absoluta.
- Riesgo de alucinación inherente al modelo base, no cuantificado en la información disponible.
- Naturaleza experimental: los tags `experimental` y `qwen4exp` sugieren que el formato y los pesos pueden cambiar; fijar versiones y verificar checksums en producción.
- Tamaño del repositorio de 706,7 GB: la descarga selectiva del fichero adecuado es obligatoria para no consumir almacenamiento innecesario.
- La variante abliterated elimina los rechazos del modelo base; no debe usarse en entornos donde se requieran salvaguardas.
- Las cifras de throughput proceden del autor y de un hardware concreto (RTX 5090 con Strata); no son extrapolables a otras GPU sin medir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-Gyro-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Web del autor: https://www.agention.ai/
- Guía del modelo: https://agention.ai/models/qwen3.8-flash-next/
- Agente de coding Marshall: https://marshall.agention.ai
- Variante Signal 2 (coding agéntico): https://huggingface.co/agentionai/Signal-2-Flash-Next-Gyro-GGUF
- Variante Gyro-Coder: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-Gyro-Coder-GGUF
- Variante abliterated: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-Gyro-abliterated-Huihui-GGUF
- Strata (motor y app): https://github.com/Niko1221/Strata
- Releases de Strata: https://github.com/Niko1221/Strata/releases/latest
- Fork strix-llama.cpp: https://github.com/halo-box/strix-llama.cpp
- Fork agentionai/llama.cpp: https://gitlab.com/agentionai-group/llama.cpp
- Fieldwork Ledger: https://www.fieldworkledger.com
