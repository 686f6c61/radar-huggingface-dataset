# amaranus/Qwen3.5-0.8B-Qwen3.8-27B-Draft-Q4_K_M-GGUF

## Resumen

Este repositorio contiene una cuantizacion GGUF en formato Q4_K_M del modelo `nvidia/Qwen3.5-0.8B-Qwen3.8-27B-Draft`, un modelo borrador (draft model) de aproximadamente 752 millones de parametros disenado para decodificacion especulativa junto a un modelo objetivo mucho mayor, Qwen3.8-27B. El autor de la conversion es el usuario de Hugging Face `amaranus`, que ha utilizado el espacio `GGUF-my-repo` de ggml.ai para transformar los pesos originales de NVIDIA en un fichero compatible con llama.cpp.

La relevancia de este artefacto no esta en el modelo en si como generador autonomo, sino en su papel dentro de una arquitectura de inferencia acelerada: un modelo pequeno propone varios tokens candidatos que el modelo grande verifica en paralelo, reduciendo la latencia efectiva de la generacion. Al estar en formato GGUF Q4_K_M, el borrador ocupa del orden de 0,5 GB en disco, lo que permite ejecutarlo en la misma GPU que el modelo objetivo o incluso en hardware modesto.

Se trata de un artefacto derivado, publicado sin model card propia (la existente remite a la del modelo original) y con cero descargas y likes en el momento de la consulta. La licencia heredada es el NVIDIA Open Model Agreement, que condiciona el uso comercial. Toda la informacion tecnica detallada (arquitectura exacta, contexto, datos de entrenamiento, benchmarks) debe consultarse en la model card del modelo base de NVIDIA, que no esta incluida en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo borrador para decodificacion especulativa, derivado de la familia Qwen3.5/Qwen3.8; detalles en la model card de NVIDIA) |
| Parametros totales | 752.393.024 (segun safetensors del modelo base) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (este repositorio); otras cuantizaciones no disponibles en la informacion |
| Idiomas soportados | no disponible |
| Licencia | nvidia-open-model-agreement (etiquetada como `license: other`) |
| Formato de pesos | GGUF (un fichero, `qwen3.5-0.8b-qwen3.8-27b-draft-q4_k_m.gguf`) |
| Tamano del repositorio | 0,5 GB |
| Libreria declarada | Model Optimizer |
| Modelo base | `nvidia/Qwen3.5-0.8B-Qwen3.8-27B-Draft` |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo borrador en los datos proporcionados. Por el nombre y el contexto (`Draft`, uso conjunto con Qwen3.8-27B en los ejemplos de llama.cpp), se trata de un modelo auxiliar de decodificacion especulativa: un transformer de unos 752 millones de parametros que propone secuencias de tokens candidatas que el modelo objetivo de 27B verifica. Los detalles sobre numero de capas, atencion, vocabulario compartido y estrategia de entrenamiento (destilacion desde el modelo grande, entrenamiento supervisado sobre salidas del objetivo, etc.) no estan disponibles en la informacion consultada y deben extraerse de la model card original de NVIDIA.

Tampoco se dispone de datos sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o destilacion. La unica innovacion tecnica constatable es el propio formato de publicacion: conversion a GGUF Q4_K_M mediante `GGUF-my-repo`, lo que habilita su uso en llama.cpp junto al modelo objetivo cuantizado (los ejemplos del README cargan `unsloth/Qwen3.8-27B-GGUF:UD-Q4_K_XL` como modelo principal y este fichero como borrador con `-md`).

## Capacidades

- Generacion de texto como modelo borrador dentro de un esquema de decodificacion especulativa; no esta pensado para uso como generador autonomo de proposito general.
- Propuesta de tokens candidatos verificados por Qwen3.8-27B, con el objetivo de acelerar la inferencia del modelo grande.
- Compatibilidad con llama.cpp (CLI `llama cli` y servidor `llama serve`) mediante el flag `-md` para cargar el modelo borrador.
- Capacidades multilingues: no disponibles en la informacion.
- Soporte de tool calling, function calling, agentes o modos de razonamiento extendido: no disponible.
- Capacidades de vision o audio: no disponible.

## Casos de uso

- Aceleracion de inferencia local de Qwen3.8-27B: cargar este borrador de 0,5 GB junto al modelo objetivo en llama.cpp para reducir la latencia por token mediante decodificacion especulativa, especialmente util en estaciones de trabajo con una sola GPU.
- Servicio de generacion de texto con requisitos de latencia estrictos: desplegar `llama serve` con el modelo grande y este borrador para aplicaciones interactivas (chat, autocompletado) donde la velocidad de respuesta es critica.
- Prototipado de pipelines de decodificacion especulativa: usar este par de modelos como referencia para medir la ganancia de throughput de la tecnica frente a la decodificacion autoregresiva estandar.
- Evaluacion comparativa de cuantizaciones: al existir el modelo objetivo en GGUF (por ejemplo, `UD-Q4_K_XL`), este borrador Q4_K_M permite experimentar con combinaciones de cuantizacion del par borrador/objetivo y medir su impacto en la tasa de aceptacion.
- Despliegue en entornos con memoria limitada: el reducido tamano del borrador (0,5 GB) permite reservar la mayor parte de la VRAM para el modelo de 27B y su cache KV.
- Integracion en herramientas de desarrollo asistido: usar el par como backend local de generacion de codigo o texto en IDE y CLI, aprovechando la reduccion de latencia para sugerencias en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM del borrador: aproximadamente 0,5 GB para el fichero Q4_K_M, mas la cache KV correspondiente a la longitud de contexto configurada.
- VRAM total: la suma del borrador mas el modelo objetivo Qwen3.8-27B cuantizado. Con el objetivo en Q4 (del orden de 15-16 GB de pesos), un despliegue conjunto razonable requiere una GPU de 24 GB o superior; con cuantizaciones mas agresivas del objetivo podria intentarse en 16 GB, pero este dato no esta confirmado en la informacion disponible.
- GPU recomendadas: no especificadas por el autor. Por el perfil de memoria del conjunto, encajan A100 40/80 GB, H100, L40S o RTX 4090/5090 para el par completo; el borrador por si solo cabe en cualquier GPU consumer con 2 GB o mas.
- Cabe en GPU consumer: si, el borrador individualmente en practicamente cualquier GPU moderna; el par completo depende de la cuantizacion elegida para el modelo de 27B.
- Opciones de despliegue: llama.cpp (CLI y servidor, con `-md` para el borrador) es la via documentada. vLLM, TGI u Ollama no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles. La ganancia dependera de la tasa de aceptacion del borrador frente a las predicciones del modelo objetivo y de la carga de trabajo concreta.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas verificables.

| Modelo | Parametros | Formato | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| amaranus/Qwen3.5-0.8B-Qwen3.8-27B-Draft-Q4_K_M-GGUF (este) | 752 M | GGUF Q4_K_M | Borrador para decodificacion especulativa de Qwen3.8-27B | NVIDIA Open Model Agreement | Hugging Face (0 descargas) |
| nvidia/Qwen3.5-0.8B-Qwen3.8-27B-Draft | 752 M | safetensors (original) | Borrador para decodificacion especulativa de Qwen3.8-27B | NVIDIA Open Model Agreement | Hugging Face |
| Qwen3.8-27B (modelo objetivo, p. ej. via unsloth/Qwen3.8-27B-GGUF) | 27 B (aproximado por el nombre) | GGUF (varias cuantizaciones) | Generacion de texto de proposito general | no disponible en esta ficha | Hugging Face |
| Otros borradores de decodificacion especulativa para modelos de ~27B | no disponible | no disponible | Aceleracion de inferencia | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de proposito general: su utilidad esta ligada a la decodificacion especulativa junto al modelo objetivo Qwen3.8-27B; usarlo como generador autonomo producira resultados de calidad limitada por su tamano (752 M de parametros).
- Artefacto derivado sin model card propia: el README remite al modelo original de NVIDIA y no documenta contexto, idiomas, datos de entrenamiento ni limitaciones especificas.
- Licencia restrictiva: el NVIDIA Open Model Agreement condiciona el uso comercial; es necesario revisar sus terminos antes de integrar el modelo en productos o servicios.
- Sin datos de benchmarks ni de tasa de aceptacion: no es posible estimar a priori la ganancia real de velocidad en un despliegue concreto sin medirla.
- Riesgo de alucinacion: inherente a los modelos generativos; en el rol de borrador, los tokens propuestos son verificados por el modelo objetivo, lo que mitiga parcialmente el problema, pero no lo elimina.
- Idiomas soportados no documentados: no se puede garantizar cobertura multilingue sin consultar la model card original.
- Publicacion sin traccion: cero descargas y cero likes en el momento de la consulta; no hay evidencia de la comunidad sobre su correcto funcionamiento. Conviene verificar la integridad del fichero antes de usarlo en produccion.
- Requisitos de memoria conjuntos: el rendimiento real dependera de que el borrador y el modelo objetivo quepan simultaneamente en la GPU; con modelos de 27B esto limita las opciones de hardware.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/amaranus/Qwen3.5-0.8B-Qwen3.8-27B-Draft-Q4_K_M-GGUF
- Modelo base original de NVIDIA: https://huggingface.co/nvidia/Qwen3.5-0.8B-Qwen3.8-27B-Draft
- Espacio GGUF-my-repo de ggml.ai: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Modelo objetivo en GGUF citado en los ejemplos: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Instalador de llama.cpp: https://llama.app/install.sh
- Perfil del autor en GitHub: https://github.com/amaranus
- Perfil del autor en X: https://x.com/amaranusx
- Perfil del autor en Instagram: https://instagram.com/amaranus
