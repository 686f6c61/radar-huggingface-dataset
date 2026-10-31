# PollardWeights/LFM3-Omni-2B-Pollard

## Resumen

LFM3-Omni-2B-Pollard es una versión cuantizada, en formato GGUF, del modelo multimodal any-to-any LFM3-Omni-2B de LiquidAI, publicada por el cuantizador PollardWeights. El modelo base es un modelo conversacional omni de unos 2,2 mil millones de parámetros capaz de procesar texto, imagen y audio como entrada, y esta build aplica una estrategia de "measured allocation": los bits de cuantización se distribuyen según la sensibilidad de cada capa, en lugar de aplicar una compresión uniforme. El resultado más agresivo del repositorio reduce el tamaño de 4,33 GB (f16) a 0,86 GB, un 80 % menos.

Su relevancia está en la accesibilidad: los ficheros son GGUF estándar compatibles con llama.cpp, Ollama, LM Studio, koboldcpp o Jan, y han sido verificados con matrices de importancia (imatrix), mediciones de perplejidad y pruebas de retención de capacidades frente al f16, incluida la conservación del tool calling. Esto lo convierte en una opción práctica para ejecutar un modelo omni multimodal en máquinas modestas, con presupuestos de RAM/VRAM de entre 2,9 y 3,4 GB según el escalón elegido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `lfm3_omni` (LFM3-Omni, any-to-any) |
| Parámetros totales | 1.728.801.600 (safetensors del repo); ~2,2B según la model card |
| Parámetros activos | no disponible (no consta arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ3_S, IQ4_XS, Q6_K (también referenciados: Q8_0, Q4_K_M, f16) |
| Idiomas soportados | Inglés (según tags; el modelo base puede soportar más, no disponible en la ficha) |
| Licencia | other (heredada de LiquidAI/LFM3-Omni-2B, términos exactos no disponibles) |
| Formato de pesos | GGUF (imatrix, mixed-precision, measured-allocation) |

## Arquitectura y entrenamiento

El modelo base, LFM3-Omni-2B de LiquidAI, emplea la arquitectura `lfm3_omni`, un modelo conversacional any-to-any con soporte de entrada de texto, imagen y audio. No constan en la información disponible detalles sobre el número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO en el modelo original.

Sobre esta base, PollardWeights aplica cuantización GGUF con imatrix (matriz de importancia para calibrar la cuantización) y su método "measured allocation", que asigna bits por capa según sensibilidad medida, en lugar de una cuantización uniforme. Cada escalón se valida con `pollard-verify --gate`: se comprueba que el fichero contiene el modelo completo (todas las torres, proyectores y ficheros del procesador), que carga correctamente y que supera comprobaciones de coherencia y ejecución. Las métricas de calidad (perplejidad, KLD medio, acuerdo top-1 con el f16) se miden con `llama-perplexity` y comparaciones de logits contra la referencia f16.

## Capacidades

- Conversación multimodal any-to-any: acepta texto, imagen y audio como entrada (según la model card y el pipeline tag `any-to-any`).
- Generación de texto y razonamiento conversacional, heredadas del modelo base LFM3-Omni-2B.
- Tool calling / function calling: la plantilla de chat emite llamadas en sintaxis `qwen3_coder`, parseables por `llama-server --jinja` y por vLLM con `--tool-call-parser qwen3_coder`. Verificado con 60 sondas de herramientas (llamada simple, elección entre ocho herramientas, decisión de no llamar, argumentos anidados).
- Compatibilidad con harnesses de agentes que hablen las APIs de OpenAI, Anthropic o Responses a través de `llama-server` o `pollard serve`.
- Despliegue local con inferencia acelerada por GPU (`-ngl 99`) en cualquier runtime basado en llama.cpp.

## Casos de uso

- Asistentes multimodales en local: al aceptar texto, imagen y audio, puede alimentar asistentes que transcriban y describan contenido audiovisual sin enviar datos a la nube, con solo ~1-1,5 GB de pesos.
- Agentes con tool calling en equipos modestos: mantiene el 98-104 % de la tasa de éxito en llamadas a herramientas del f16, por lo que sirve para pipelines de agentes locales que consultan APIs, bases de datos o ejecutan funciones.
- Prototipado de APIs compatibles con OpenAI: `llama-server --jinja` expone `/v1/chat/completions` con soporte de `tools`, ideal para probar integraciones antes de migrar a modelos mayores.
- Despliegue en dispositivos con memoria limitada: el escalón IQ3_S (0,86 GB) cabe en máquinas con ~2,9 GB de RAM/VRAM libres, útil para edge devices o portátiles sin GPU dedicada.
- Servidores de inferencia de bajo coste: en una GPU pequeña (por ejemplo, con 4 GB de VRAM) puede servirse Q6_K con contexto holgado, dando servicio a varias sesiones conversacionales.
- Pruebas de regresión de cuantizaciones: las métricas publicadas (KLD, top-1 agree, retención) lo hacen útil como caso de estudio para validar metodologías de cuantización con imatrix y measured allocation.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí se han publicado mediciones propias de calidad de cuantización frente al f16:

| Fichero | PPL | Tamaño | KLD medio | Acuerdo top-1 | Retención tool calls |
|---|---:|---:|---:|---:|---:|
| IQ3_S | 2,88 | 0,86 GB | 0,0978 | 89,96 % | 103,6 % |
| IQ4_XS | 2,7646 | 1,10 GB | 0,0199 | 95,53 % | 100,0 % |
| Q6_K | 2,7498 | 1,43 GB | 0,0041 | 97,78 % | 98,2 % |

Estas cifras miden la fidelidad de la cuantización respecto al f16 del propio repo y no son comparables con suites de benchmarks publicadas por otros autores.

## Requisitos de hardware

- IQ3_S (0,86 GB): ~2,9 GB de RAM/VRAM libres.
- IQ4_XS (1,10 GB): ~3,1 GB de RAM/VRAM libres.
- Q6_K (1,43 GB): ~3,4 GB de RAM/VRAM libres (recomendado como opción por defecto).
- Cabe con holgura en GPU de consumo: cualquier GPU con 4 GB o más de VRAM (por ejemplo, RTX 3060 de 12 GB, RTX 4060 o superiores) ejecuta el escalón recomendado con contexto amplio; también funciona solo con CPU en máquinas con 4 GB de RAM.
- GPU recomendadas: no se especifican modelos concretos; dada la huella mínima, no se requiere A100/H100, basta hardware de consumo o CPU.
- Despliegue: llama.cpp (`llama-cli`, `llama-server --jinja`), ik_llama.cpp, Ollama (`ollama run hf.co/PollardWeights/LFM3-Omni-2B-Pollard`), LM Studio, koboldcpp, Jan, ramalama. Para vLLM se indican los pesos originales con `--tool-call-parser qwen3_coder`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Entrada | Licencia |
|---|---|---|---|---|---|
| LFM3-Omni-2B-Pollard (IQ3_S/IQ4_XS/Q6_K) | ~2,2B | no disponible | GGUF | texto, imagen, audio | other |
| LiquidAI/LFM3-Omni-2B (base) | ~2,2B | no disponible | safetensors (bf16) | texto, imagen, audio | other |
| Qwen2.5-Omni-3B | ~3B | ~32K (aprox.) | safetensors, GGUF comunitarios | texto, imagen, audio, vídeo | Apache-2.0 / licencia Qwen |

Frente al modelo base, esta build ofrece la misma funcionalidad con hasta un 80 % menos de memoria, a costa de una pérdida de fidelidad medida (KLD 0,0041-0,0978 según escalón). Frente a otros omni pequeños como Qwen2.5-Omni-3B, LFM3-Omni-2B es más ligero y cuenta con cuantizaciones verificadas con métricas de retención publicadas, aunque los benchmarks de capacidades del modelo base no están disponibles en esta ficha.

## Limitaciones y advertencias

- Idioma: el repo declara soporte solo para inglés; el rendimiento en castellano no está documentado y puede ser inferior.
- Pérdida por cuantización: el escalón IQ3_S muestra un acuerdo top-1 del 89,96 % y KLD 0,0978 respecto al f16, lo que implica degradación apreciable; para máxima fidelidad usar Q6_K.
- Contexto: la longitud de ventana no está documentada en la información disponible; dimensionar la RAM en consecuencia.
- Licencia "other": los términos exactos y las condiciones de uso comercial no constan en la model card; hay que revisar la licencia del modelo base LiquidAI/LFM3-Omni-2B antes de uso en producción.
- Alucinaciones y sesgos: como modelo pequeño (2,2B) generativo, es susceptible de alucinar y hereda los sesgos de sus datos de entrenamiento; no se han documentado auditorías de sesgo.
- Tool calling: la sintaxis es `qwen3_coder`; requiere `--jinja` en llama.cpp o el parser correspondiente en vLLM; sin esto, las llamadas no se parsean correctamente.
- Las métricas de retención son medidas por el propio autor sobre su suite y no son comparables con retenciones publicadas por terceros.

## Enlaces

- Modelo cuantizado: https://huggingface.co/PollardWeights/LFM3-Omni-2B-Pollard
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Herramienta de cuantización Pollard Weights: https://github.com/WestWaters/pollard-weights
