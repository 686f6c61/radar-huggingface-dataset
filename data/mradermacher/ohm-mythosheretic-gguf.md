# mradermacher/Ohm-MythosHeretic-GGUF

## Resumen

Ohm-MythosHeretic-GGUF es un repositorio de cuantizaciones estáticas en formato GGUF del modelo orangejuicesmith/Ohm-MythosHeretic, realizado por mradermacher, un cuantizador muy conocido en la comunidad de Hugging Face. El modelo base es un LLM conversacional de aproximadamente 3.086 millones de parámetros (3.085.938.688), construido sobre la arquitectura Qwen2 y etiquetado con las capacidades de razonamiento (reasoning), matemáticas y código. Además, el modelo base está etiquetado como "uncensored", "decensored" y "abliterated", lo que indica que ha sido sometido a algún proceso de eliminación o reducción de los filtros de seguridad típicos de los modelos alineados.

Este tipo de repositorios no añaden capacidades nuevas al modelo original: su valor está en facilitar el despliegue local y en hardware modesto, ofreciendo versiones cuantizadas desde Q2_K (1,4 GB) hasta f16 (6,3 GB). Al ser un modelo pequeño, con cuantizaciones agresivas cabe incluso en portátiles sin GPU dedicada. La relevancia práctica radica en su perfil: un modelo ligero, sin restricciones de contenido, orientado a inglés, con enfoque en razonamiento, matemáticas y código. La licencia del repositorio es MIT, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder) |
| Parametros totales | 3.085.938.688 (~3,09 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (modelo base en safetensors/transformers) |

## Arquitectura y entrenamiento

El modelo base, Ohm-MythosHeretic, emplea la arquitectura Qwen2, un transformer decoder estándar desarrollado por Alibaba, con la etiqueta "mythos-nano" que sugiere que pertenece a una familia de modelos pequeños (nano). Con algo más de 3.000 millones de parámetros, se sitúa en el segmento de modelos ligeros pensados para inferencia local. El modelo está etiquetado como "abliterated" y "decensored", términos que en la comunidad se refieren a técnicas de modificación de pesos (por ejemplo, mediante análisis de direcciones de rechazo en el espacio de activaciones) para eliminar el comportamiento de negación del modelo sin necesidad de reentrenamiento completo. No hay información disponible sobre el proceso de entrenamiento del modelo base: número de tokens, composición del dataset ni uso de RLHF/DPO.

En cuanto al repositorio en sí, mradermacher ha generado cuantizaciones estáticas GGUF mediante conversión desde el formato HF (convert_type: hf), con cuantización de todos los tensores de salida. También existe una versión con cuantizaciones weighted/imatrix en un repositorio aparte (Ohm-MythosHeretic-i1-GGUF), que suele ofrecer mejor calidad a tamaños equivalentes.

## Capacidades

- Generacion de texto conversacional en ingles (pipeline conversacional).
- Razonamiento (reasoning), segun las etiquetas del modelo.
- Resolucion de problemas matematicos (etiqueta math).
- Generacion y comprension de codigo (etiqueta code).
- Sin filtros de seguridad: al estar "abliterated"/"uncensored", responde a prompts que otros modelos rechazarian por politicas de alineacion.
- Compatibilidad con el ecosistema GGUF: llama.cpp, Ollama, LM Studio, KoboldCpp y otros runtimes.
- No hay informacion sobre soporte de tool calling, function calling, agentes, vision ni audio.

## Casos de uso

- Experimentacion con modelos sin alineacion: util para investigar diferencias de comportamiento entre modelos abliterated y sus versiones originales, o para estudiar la supresion de rechazos en LLMs.
- Escritura creativa sin restricciones: generacion de narrativa de ficcion con contenido maduro que modelos alineados suelen rechazar, aprovechando que cabe en hardware modesto.
- Asistente de codigo local: con ~3 B de parametros y cuantizacion Q4_K_M (2 GB), puede ejecutarse en portatiles para autocompletado y consultas de codigo sencillas con total privacidad.
- Resolucion de problemas matematicos ligeros: ayuda en calculos y razonamiento aritmetico basico sin depender de la nube.
- Chatbot local en ingles: despliegue conversacional en Raspberry Pi o mini-PC con las cuantizaciones Q2_K/Q3_K, dado el reducido tamano de los ficheros.
- Prototipado rapido en GPU de consumo: el tamano reducido permite altas velocidades de generacion incluso en GPUs de gama media, util para iterar prompts y pipelines.
- Pruebas de razonamiento multi-paso en entornos offline: al ser un modelo pequeño, permite experimentos de decodificacion (muestreo, temperatura, gramaticas) con bajo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia segun cuantizacion:
  - Q2_K: ~1,4 GB de fichero (cabe en casi cualquier equipo, incluso Raspberry Pi 5 con 8 GB).
  - Q4_K_M: ~2,0 GB (recomendada por el autor como equilibrio calidad/velocidad).
  - Q8_0: ~3,4 GB (mejor calidad en 8 bits).
  - f16: ~6,3 GB (calidad completa, catalogada como "overkill" por el autor).
- GPU recomendadas: al ser un modelo de ~3 B, cualquier GPU de consumo moderna lo ejecuta con holgura: RTX 3060 12 GB, RTX 4060 Ti, RTX 4090, etc. Incluso puede ejecutarse solo con CPU si se dispone de 4-8 GB de RAM.
- Cabe en consumer GPU: si, en practicamente cualquier GPU con 4 GB de VRAM o mas (incluso con la cuantizacion f16 en GPUs de 8 GB).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, GPT4All y cualquier runtime compatible con GGUF. No es un GGUF orientado a vLLM/TGI (que requieren pesos safetensors; para eso, usar el modelo base).
- Latencia y throughput: no disponibles como datos publicados; dada la talla del modelo, se esperan velocidades de decodificacion altas (decenas de tokens/s incluso en CPU moderna, muy superiores en GPU).

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ohm-MythosHeretic (este) | ~3,09 B | Qwen2 | MIT | GGUF | Uncensored/abliterated, reasoning/math/code, ingles |
| Qwen2.5-3B-Instruct | ~3 B | Qwen2 | Qwen license (uso comercial condicionado) | safetensors/GGUF (comunidad) | Version oficial alineada de Alibaba, con filtros |
| Llama-3.2-3B-Instruct | ~3 B | Llama 3 | Llama Community License | safetensors/GGUF (comunidad) | Alternativa de Meta, alineada, multilingue |
| Phi-3.5-mini-instruct (3.8 B) | ~3,8 B | Phi-3 | MIT | safetensors/GGUF (comunidad) | Fuerte en razonamiento y codigo, alineada |

La principal diferencia de Ohm-MythosHeretic frente a estas alternativas es la ausencia de filtros de alineacion y su licencia MIT sin restricciones, a costa de no disponer de benchmarks publicados ni de la garantia de calidad de un laboratorio grande.

## Limitaciones y advertencias

- Al estar abliterated/uncensored, el modelo no rechazara contenido harmful: existe riesgo real de generar texto ofensivo, peligroso o inapropiado. No es adecuado para productos orientados a publico general sin capas de moderacion externas.
- Riesgo de alucinacion tipico de modelos pequenos (~3 B): puede inventar hechos, APIs o referencias con confianza, especialmente fuera de sus dominios fuertes.
- Idioma limitado al ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea notablemente inferior.
- Longitud de contexto no documentada en la informacion disponible; conviene verificarla en la ficha del modelo base antes de disenar aplicaciones con documentos largos.
- Las cuantizaciones mas agresivas (Q2_K, Q3_K_S/M) degradan visiblemente la calidad, especialmente en razonamiento y matematicas; el autor recomienda Q4_K_S/Q4_K_M como punto de equilibrio y Q6_K/Q8_0 para maxima fidelidad.
- Estas son cuantizaciones estaticas; para mejor calidad por bit existe la version imatrix en mradermacher/Ohm-MythosHeretic-i1-GGUF.
- La licencia MIT del repositorio cubre las cuantizaciones; conviene confirmar la licencia del modelo base (tambien etiquetada como MIT) antes de uso comercial.
- Sin benchmarks publicados: el rendimiento real en razonamiento, matematicas y codigo debe validarse con pruebas propias antes de confiar en el modelo para produccion.

## Enlaces

- Repositorio GGUF (este modelo): https://huggingface.co/mradermacher/Ohm-MythosHeretic-GGUF
- Modelo base: https://huggingface.co/orangejuicesmith/Ohm-MythosHeretic
- Version weighted/imatrix quants: https://huggingface.co/mradermacher/Ohm-MythosHeretic-i1-GGUF
- Pagina de descargas resumida: https://hf.tst.eu/model#Ohm-MythosHeretic-GGUF
- FAQ / solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador (nethype GmbH): https://www.nethype.de/
- Notas sobre calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
