# pranil00/ONIX-Codestral-Mamba-7B-v0.1-GGUF

## Resumen

ONIX-Codestral-Mamba-7B-v0.1-GGUF es una cuantización en formato GGUF (esquema Q5_K_M) del modelo base mistralai/Codestral-Mamba-7B-v0.1, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. El artefacto se distribuye como un único fichero de pesos comprimidos de 1,01 GB y está pensado para ejecución local en hardware de consumo mediante `llama.cpp`, Ollama, LM Studio, Jan o la herramienta propia del autor, `run-any-model`. La licencia declarada es Apache 2.0.

La relevancia de esta ficha es doble. Por un lado, el modelo base pertenece a la familia Codestral-Mamba de Mistral AI, orientada a generación de código. Por otro, la model card del artefacto cuantizado contiene inconsistencias técnicas notables que el lector debe conocer antes de usarlo: se etiqueta la arquitectura como "LLaMA" cuando el modelo base es Mamba (state space model), se declaran 1.500 millones de parámetros cuando el nombre del repositorio indica 7B, y se indica un tamaño de pesos en FP16 de 2,93 GB, cifra incompatible con un modelo de 7B en precisión de 16 bits (que rondaría los 14 GB). Estas discrepancias sugieren que los metadatos de la model card no son fiables.

En el momento de la publicación, el repositorio registra 0 descargas y 0 likes, y no se han publicado resultados de benchmarks ni evaluación de calidad verificable. Se trata, por tanto, de un artefacto de disponibilidad muy reciente y validación limitada, cuya idoneidad para producción debe evaluarse empíricamente antes de adoptarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma fiable. La model card indica "familia LLaMA", pero el modelo base (Codestral-Mamba) es de tipo Mamba / state space model |
| Parametros totales | No disponible de forma fiable. La model card declara 1.498.480.640 (1,50 B), mientras que el nombre del repositorio indica 7B |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens en Apple Silicon y GPU NVIDIA; 4.096 tokens en CPU (según la model card) |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `mistralai--Codestral-Mamba-7B-v0.1-Q5_K_M.gguf`) |

## Arquitectura y entrenamiento

El modelo base, mistralai/Codestral-Mamba-7B-v0.1, pertenece a la familia Codestral-Mamba de Mistral AI, que emplea una arquitectura Mamba (state space model) en lugar de un transformer clásico con atención cuadrática. La model card del artefacto cuantizado, sin embargo, etiqueta la arquitectura como "LLaMA", lo que contradice la naturaleza del modelo base y debe considerarse un error de metadatos. No se dispone de información verificable en la documentación proporcionada sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el modelo base.

El artefacto en sí es una conversión cuantizada a Q5_K_M realizada con la herramienta `run-any-model`, que el autor describe como un motor de optimización adaptativo al dispositivo. La model card afirma una retención de calidad del 97,5 % respecto a FP16, un ratio de compresión de 2,91x y una aceleración de 16/16 capas en Metal. Estas cifras proceden de un informe de telemetría propio del autor y no han sido validadas de forma independiente. No se documenta ninguna innovación arquitectónica adicional en el proceso de cuantización más allá del esquema estándar K-quant de `llama.cpp`.

## Capacidades

- Generación de texto y de código: el modelo base Codestral-Mamba está orientado a tareas de programación, aunque no se detallan capacidades específicas en la información disponible.
- Conversación multi-turno: la model card incluye ejemplos de chat interactivo (`llama-cli -cnv`, `ollama run`), lo que implica soporte de diálogo.
- Ejecución local multiplataforma: compatible con Apple Silicon (Metal), GPU NVIDIA (CUDA) y CPU x86 con AVX2/AVX-512.
- Integración con tooling estándar: `llama.cpp`, Ollama, LM Studio, Jan y Text-Generation-WebUI.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Asistencia de código en local sin conexión: el modelo base está orientado a programación y el artefacto Q5_K_M cabe en equipos de consumo, por lo que puede usarse como autocompletado o asistente de código en entornos air-gapped donde no se permite enviar código a la nube.
- Prototipado rápido en portátiles Apple Silicon: con un consumo de memoria unificada declarado de 1,17 GB, permite levantar un servidor de inferencia local en un MacBook para experimentar con generación de texto y código sin GPU dedicada.
- Despliegue en estaciones de trabajo con GPU de consumo: la model card indica 2,51 GB de VRAM dedicada en RTX 30/40/50, lo que permite ejecutar el modelo junto a otras cargas en una única GPU.
- Chat de terminal para desarrolladores: mediante `run-any-model run` o `llama-cli -cnv` se puede tener una sesión de chat interactiva integrada en el flujo de trabajo de terminal.
- Evaluación comparativa de esquemas de cuantización: útil como artefacto de referencia para medir la degradación de calidad de Q5_K_M frente a FP16 en tareas de código, siempre que se valide de forma independiente.
- Pruebas de integración con Ollama y LM Studio: el fichero GGUF se puede importar directamente en estos entornos para validar pipelines de inferencia local antes de escalar a modelos mayores.
- Educación e investigación sobre SSM: dado que el modelo base es Mamba, puede servir para experimentar con arquitecturas de espacio de estados en hardware limitado, aunque la fiabilidad de los metadatos del artefacto exige verificación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente un informe de telemetría propio del autor con métricas de memoria y compresión, no de calidad de tarea:

| Metrica | Baseline (FP16) | Cuantizado (Q5_K_M) | Cambio |
|---|---|---|---|
| Precisión de bits | 16,0 bits/param | 5,5 bits/param | -65,6 % |
| Tamaño de pesos | 2,93 GB | 1,01 GB | -65,6 % |
| KV cache | 128,0 MB (FP16) | 128,0 MB (FP16) | Optimizado |
| RAM residente total | 3,09 GB | 1,17 GB | -62,2 % |
| Calidad estimada | 100,0 % baseline | 97,5 % retenida | -2,5 % |
| Aceleración de capas | 0 % | 16/16 capas | Óptimo |

Estas cifras proceden de un benchmark interno de `run-any-model` sobre un host Darwin con 16 GB y no han sido verificadas de forma independiente. Además, el tamaño FP16 declarado (2,93 GB) es incoherente con un modelo de 7B, lo que resta credibilidad al conjunto del informe.

## Requisitos de hardware

- VRAM/RAM estimada según la model card:
  - Apple Silicon (M1/M2/M3/M4/M5): 1,17 GB de memoria unificada, contexto óptimo de 8.192 tokens, aceleración Metal.
  - GPU NVIDIA (RTX 30/40/50): 2,51 GB de VRAM dedicada, contexto óptimo de 8.192 tokens, aceleración CUDA.
  - PC Windows/Linux con CPU: 3,17 GB de RAM libre, contexto óptimo de 4.096 tokens, soporte AVX2/AVX-512.
- GPU recomendadas: cualquier RTX 30/40/50 según el autor; no se especifican modelos concretos como A100 o H100 porque el artefacto está orientado a consumo.
- Cabe en GPU de consumo: sí, según la model card, en tarjetas NVIDIA RTX de las series indicadas.
- Opciones de despliegue: `run-any-model` (CLI del autor), Ollama, `llama.cpp` (`llama-cli`), LM Studio, Jan y Text-Generation-WebUI.
- Latencia y throughput: no disponibles. No se publican tokens por segundo ni latencias medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-Codestral-Mamba-7B-v0.1-GGUF (este) | 1,5 B declarados / 7B en el nombre (no fiable) | 8.192 (GPU) / 4.096 (CPU) | GGUF Q5_K_M | Apache 2.0 | Hugging Face, 0 descargas |
| mistralai/Codestral-Mamba-7B-v0.1 | 7B (según nombre del repositorio) | No disponible en esta ficha | Pesos originales (no especificado) | No disponible en esta ficha | Hugging Face (modelo base) |
| Otras cuantizaciones GGUF de Codestral-Mamba | 7B | Depende del esquema | GGUF (Q4_K_M, Q8_0, etc.) | Según el publicador | Disponibles en el ecosistema GGUF, no verificadas en esta búsqueda |

No se dispone de datos de rendimiento comparativo verificables entre estas alternativas. La comparación se limita a parámetros, contexto declarado, formato y licencia.

## Limitaciones y advertencias

- Inconsistencia grave en los metadatos: la model card declara 1,50 B de parámetros y arquitectura "LLaMA", mientras que el modelo base es Codestral-Mamba (7B, arquitectura Mamba). El tamaño FP16 declarado (2,93 GB) es incompatible con un modelo de 7B. No se debe confiar en las cifras de la model card sin verificación previa.
- Calidad no validada: la retención del 97,5 % procede de un benchmark interno del autor, sin evaluación independiente ni resultados en tareas estándar (HumanEval, MMLU, etc.).
- Riesgo de alucinación: no evaluado. Al ser un modelo de código, existe riesgo de generar APIs, funciones o imports inexistentes.
- Idiomas: no se especifican los idiomas soportados; se desconoce el comportamiento en castellano.
- Contexto limitado en CPU: 4.096 tokens frente a 8.192 en GPU, lo que puede romper flujos de trabajo con prompts largos si se ejecuta en CPU.
- Licencia: Apache 2.0 permite uso comercial, pero la licencia del modelo base debe verificarse de forma independiente, ya que la model card del artefacto no la detalla más allá de la etiqueta.
- Disponibilidad: 0 descargas y 0 likes en el momento de la consulta; sin comunidad ni soporte documentado.
- Advertencia de responsabilidad: la model card incluye un descargo de responsabilidad absoluto que exime al autor de cualquier daño derivado del uso; el implementador asume toda la responsabilidad de auditar las salidas.
- Para producción: no recomendado sin una evaluación previa de calidad, latencia y comportamiento en el dominio objetivo, y sin confirmar la integridad del fichero GGUF frente al modelo base.

## Enlaces

- Repositorio Hugging Face del artefacto: https://huggingface.co/pranil00/ONIX-Codestral-Mamba-7B-v0.1-GGUF
- Modelo base: https://huggingface.co/mistralai/Codestral-Mamba-7B-v0.1
- Organización ONIX en Hugging Face: https://huggingface.co/ONIX
- Herramienta `run-any-model`: https://github.com/PranilShah-08/run-any-model
