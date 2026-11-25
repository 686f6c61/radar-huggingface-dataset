# farahsselim/giu-cv-qwen3-4b-gguf

## Resumen

giu-cv-qwen3-4b-gguf es un ajuste fino (fine-tuning) del modelo Qwen3-4B-Instruct-2507, publicado por el usuario farahsselim en Hugging Face. Se distribuye exclusivamente en formato GGUF, cuantizado en Q4_K_M, lo que lo hace directamente desplegable con llama.cpp, Ollama y otras herramientas compatibles con este formato. El proceso de ajuste fino y conversion a GGUF se realizo con Unsloth.

El modelo parte de la arquitectura Qwen3 de Alibaba, con 4.022.468.096 parametros totales (aproximadamente 4B). Al estar basado en la variante Instruct-2507, hereda las capacidades conversacionales e instructivas del modelo original, aunque la model card no documenta el dataset de ajuste fino ni el objetivo concreto del mismo. El nombre "giu-cv" sugiere una especializacion en curriculum vitae o vision por computador, pero no hay informacion que lo confirme.

La relevancia de esta ficha es limitada: se trata de un modelo derivado de bajo perfil (321 descargas, 0 likes), sin licencia declarada ni idiomas documentados, lo que introduce incertidumbres importantes para uso en produccion. Aun asi, su tamano compacto y formato GGUF lo convierten en un candidato practico para experimentacion local en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3) |
| Parametros totales | 4.022.468.096 (~4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-4B-Instruct-2507, no documentada en esta ficha) |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Qwen3-4B-Instruct-2507, un transformer denso de aproximadamente 4B parametros desarrollado por Alibaba. La model card indica que el fine-tuning y la conversion a GGUF se realizaron con Unsloth, una libreria optimizada para entrenamiento y cuantizacion eficientes. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO adicionales sobre el modelo base.

La unica innovacion tecnica documentada es el uso de Unsloth para acelerar el entrenamiento (se menciona "2x faster"), y la inclusion de un Modelfile de Ollama para despliegue sencillo. No hay informacion sobre decodificacion especulativa, atencion lineal ni otras optimizaciones de inferencia. El archivo publicado es un unico GGUF Q4_K_M, lo que limita las opciones de cuantizacion a una sola.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen3-4B-Instruct-2507.
- Razonamiento e instrucciones generales, segun las capacidades del modelo original.
- Soporte de tool calling / function calling: no documentado explicitamente para este fine-tune, aunque el modelo base Qwen3 lo soporta.
- Soporte de agentes y razonamiento multi-paso: no documentado para este fine-tune.
- Capacidades multilingues: no documentadas.
- Capacidades especiales (vision, audio, thinking mode): no documentadas. La model card menciona un comando `llama-mtmd-cli` para modelos multimodales, pero no confirma que este modelo concreto tenga vision.

## Casos de uso

- Experimentacion local con llama.cpp: el archivo GGUF Q4_K_M se puede cargar directamente con `llama-cli -hf farahsselim/giu-cv-qwen3-4b-gguf --jinja` para pruebas de generacion de texto en maquinas sin GPU dedicada.
- Despliegue rapido con Ollama: la inclusion de un Modelfile permite arrancar el modelo con un solo comando, adecuado para prototipos y demos internas.
- Generacion de texto en espanol o multilingue: si el modelo base conserva sus capacidades, podria usarse para redaccion asistida, aunque los idiomas no estan documentados.
- Fine-tuning adicional sobre el modelo cuantizado: no recomendable directamente sobre GGUF, pero el modelo base Qwen3-4B-Instruct-2507 puede servir como punto de partida para especializaciones posteriores.
- Evaluacion comparativa de fine-tunes comunitarios: util para investigadores que quieran medir el impacto de ajustes finos no documentados frente al modelo base.
- Chat conversacional de bajo coste: con ~4B parametros y cuantizacion Q4_K_M, cabe en GPUs de consumo y puede ejecutarse en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M de un modelo de ~4B parametros ocupa aproximadamente 2,5-3 GB en disco; en VRAM se estiman unos 3-4 GB incluyendo overhead de contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para mayor throughput.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas de VRAM (RTX 2060, RTX 3060, RTX 4060, etc.).
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (Modelfile incluido), y cualquier runtime compatible con GGUF. No se documenta soporte para vLLM o TGI con este archivo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| giu-cv-qwen3-4b-gguf | ~4B | no disponible | no disponible | GGUF Q4_K_M | Hugging Face |
| Qwen3-4B-Instruct-2507 | ~4B | no disponible | no disponible | safetensors, GGUF | Hugging Face (Alibaba) |
| Llama 3.2 3B Instruct | ~3B | 128K | Llama 3.2 Community | safetensors, GGUF | Hugging Face (Meta) |
| Phi-3.5-mini | ~3,8B | 128K | MIT | safetensors, GGUF | Hugging Face (Microsoft) |

La comparativa es aproximada: no hay datos de rendimiento del fine-tune que permitan una comparacion cuantitativa con las alternativas.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; es un riesgo legal importante para produccion.
- Idiomas no documentados: no se sabe que idiomas soporta el fine-tune ni si conserva las capacidades multilingues del modelo base.
- Dataset de fine-tuning no documentado: se desconoce que datos se usaron, lo que impide evaluar sesgos especificos.
- Riesgo de alucinacion: inherente a los modelos de ~4B parametros; no hay evaluaciones publicadas que lo cuantifiquen.
- Un solo archivo de cuantizacion (Q4_K_M): no hay opciones de mayor o menor precision.
- Perfil de uso muy bajo (321 descargas, 0 likes): poca validacion comunitaria y escasa trazabilidad.
- La model card menciona comandos para modelos multimodales, pero no confirma que este modelo tenga vision; tratarlo como texto unicamente salvo verificacion.
- Contexto no documentado: no se puede planificar el uso con ventanas largas sin verificar el comportamiento real.

## Enlaces

- Hugging Face: https://huggingface.co/farahsselim/giu-cv-qwen3-4b-gguf
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- Modelo base de referencia: Qwen3-4B-Instruct-2507 (Hugging Face, Alibaba)
