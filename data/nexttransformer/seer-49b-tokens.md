# NextTransformer/Seer-49B-Tokens

## Resumen

Seer es un checkpoint de investigación desarrollado por NextTransformer dentro de una comparativa arquitectónica de métodos de atención dispersa. Se trata de un modelo causal de lenguaje de tipo transformer con 1.387.464.456 parámetros, entrenado desde cero sobre el dataset ClimbMix durante 46.875 actualizaciones (lo que corresponde a 49.152 millones de tokens de entrenamiento, de ahí el "49B" del nombre del repositorio, que no debe confundirse con el número de parámetros). Su ventana de contexto es de 2.048 tokens.

La innovación principal es una adaptación del mecanismo SeerAttention: las consultas de cada token puntúan claves agrupadas en bloques de 64 tokens, y una compuerta aprendida decide qué bloques históricos merecen atención. Un "teacher" interno de atención supervisa el entrenamiento de esa compuerta, de modo que el modelo aprende a descartar bloques irrelevantes y a concentrar el cómputo en los relevantes.

Es relevante ahora porque forma parte de una comparativa pública de arquitecturas de atención eficiente (frente a métodos como AttnGate o atención densa estándar) y porque publica resultados de validación (BPB 0.6659 y CORE-22 de 30,81) junto con el registro de ejecución. No obstante, es un checkpoint de investigación, no un modelo listo para producción: el propio autor advierte que no reproduce la red original de AttnGate ni su receta de entrenamiento completa, y la auditoría independiente del cómputo sigue pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con atención dispersa estilo SeerAttention (puntuación de bloques de 64 tokens con compuerta aprendida y teacher de atención interno) |
| Parametros totales | 1.387.464.456 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible (entrenado sobre ClimbMix; no se declara cobertura idiomática) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`), más `model_config.json` y `tokenizer.tiktoken.json` |

## Arquitectura y entrenamiento

Seer es un transformer causal denso en su capa de salida pero con atención dispersa a nivel de bloque. Cada consulta (query) puntúa claves agrupadas en bloques de 64 tokens; una compuerta aprendida selecciona qué bloques históricos reciben atención, reduciendo el coste cuadrático de la atención estándar. El entrenamiento de esa compuerta está supervisado por un teacher de atención interno, una adaptación desde cero del esquema SeerAttention (no una reproducción exacta del mismo). El modelo se entrenó sobre el dataset ClimbMix durante 46.875 pasos de actualización, lo que suma 49.152 millones de tokens procesados. No se documentan fases de RLHF, DPO ni ajuste por instrucciones: es un modelo pretrained base. El tokenizador es compatible con tiktoken y se distribuye como fichero JSON con rangos de merge codificados en base64. La implementación de referencia vive en el repositorio NextTransformer y requiere instalar el paquete desde un commit concreto (`b2ea466`), lo que implica que la reproducibilidad depende de ese pin.

## Capacidades

- Generación de texto causal autoregresiva (pipeline `text-generation`).
- Modelo base pretrained: no está ajustado para seguir instrucciones ni para diálogo.
- Atención dispersa a nivel de bloque con compuerta aprendida (eficiencia computacional en contextos largos relativos a su ventana).
- Tokenizador compatible con tiktoken, con token especial `<|bos|>`.
- Capacidad de tool calling / function calling: no disponible (modelo base, sin ajuste para ello).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no declaradas; cobertura idiomática no disponible.
- Modo de razonamiento (thinking), visión o audio: no disponible.

## Casos de uso

- Investigación en atención eficiente: comparar el comportamiento de la compuerta de bloques de Seer frente a atención densa y a otros métodos de la comparativa NextTransformer, midiendo BPB y CORE-22 en el mismo dataset.
- Experimentos de ablación arquitectónica: usar el checkpoint como punto de partida para estudiar el efecto del tamaño de bloque (64 tokens) o de la supervisión por teacher en la calidad final.
- Evaluación de modelos base en tareas de lenguaje: al ser un modelo pretrained, sirve para medir perplejidad y capacidad de modelado del lenguaje en corpus de dominio, no para asistencia conversacional.
- Reproducción de resultados de la comparativa: cargar los pesos con la implementación fijada por commit y verificar los valores de validación publicados (BPB 0.6659, CORE-22 30,81).
- Fine-tuning posterior para tareas específicas: al ser un modelo base de ~1,4 B de parámetros, puede ajustarse para clasificación, resumen o generación de dominio una vez validada la licencia.
- Docencia y divulgación: ejemplo didáctico de atención dispersa con compuerta aprendida y teacher interno, con código de carga mínimo en CPU.
- Prototipado de inferencia en CPU: el ejemplo oficial carga el modelo en CPU con `CUDA_VISIBLE_DEVICES=""`, útil para pruebas de humo sin GPU.

## Benchmarks y rendimiento

| Evaluación final | Resultado |
|---|---:|
| Validation BPB | 0.6659 |
| CORE-22 (×100) | 30.81 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numéricas con otros modelos de la misma comparativa.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: ~5,5 GB (1.387.464.456 parámetros × 4 bytes); el repo ocupa 4,2 GB en safetensors, lo que sugiere pesos en FP16/BF16 (~2,8 GB) o un empaquetado equivalente.
- En FP16/BF16: ~2,8 GB de VRAM más overhead de activaciones y caché KV para 2.048 tokens.
- Cabe en GPUs de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, así como en GPUs de datacenter (A100, H100) sin problema de memoria.
- El ejemplo oficial del autor ejecuta en CPU, por lo que no es imprescindible GPU para pruebas básicas.
- Opciones de despliegue: no hay integración documentada con vLLM, llama.cpp, Ollama ni TGI; el único camino soportado es la librería `nexttransformer` instalada desde el commit indicado, más `safetensors` y `tiktoken`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| Seer (NextTransformer) | 1.387.464.456 | 2.048 | Atención dispersa por bloques con compuerta aprendida | no disponible | Hugging Face (checkpoint de investigación) |
| Alternativas de la comparativa NextTransformer | no disponible | no disponible | Otros métodos de atención (p. ej. AttnGate) | no disponible | Repositorio del proyecto |
| Modelos base de ~1,4 B de uso común (p. ej. familia Qwen, Llama, Phi) | ~1-2 B | 4.096-32.768 típicamente | Transformer denso | variables | Hugging Face |

No se dispone de datos de rendimiento comparables para establecer una comparación cuantitativa con modelos de la misma categoría.

## Limitaciones y advertencias

- Modelo base pretrained: no sigue instrucciones ni mantiene diálogo; usarlo como asistente requiere fine-tuning.
- Ventana de contexto de solo 2.048 tokens, muy inferior a la de modelos contemporáneos de tamaño similar.
- Licencia no disponible: no puede asumirse uso comercial sin autorización explícita del autor.
- Idiomas soportados no declarados; el rendimiento fuera del inglés (si ClimbMix es mayoritariamente inglés) no está garantizado.
- El propio autor indica que no reproduce la red original de AttnGate ni su receta completa, por lo que los resultados no son directamente transferibles a esa arquitectura.
- La auditoría independiente del cómputo de entrenamiento está pendiente; los datos de entrenamiento provienen del registro del propio trainer.
- Riesgo de alucinación y sesgos: no evaluado ni documentado; al ser un modelo base, la generación libre puede producir texto incoherente o factualmente incorrecto.
- Reproducibilidad frágil: la carga depende de un commit concreto del repositorio NextTransformer; cambios posteriores pueden romper la compatibilidad de los pesos.
- Sin cuantizaciones oficiales (GGUF, AWQ, GPTQ): el despliegue en entornos con poca memoria requiere convertir los pesos manualmente.
- Descargas y likes nulos en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/NextTransformer/Seer-49B-Tokens
- Repositorio NextTransformer (commit de referencia): https://github.com/Interactive-Active-AI/NextTransformer/tree/b2ea46627f7d0d5c9ef57a655c43b553558417d3
- Configuración de arquitectura (seer.json): https://github.com/Interactive-Active-AI/NextTransformer/blob/b2ea46627f7d0d5c9ef57a655c43b553558417d3/results/methods/seer.json
- Registro de ejecución (runs/seer.json): https://github.com/Interactive-Active-AI/NextTransformer/blob/b2ea46627f7d0d5c9ef57a655c43b553558417d3/results/runs/seer.json
