# Beling86/Ling3.0-Flash-VL-3.58BPW

## Resumen

Ling3.0-Flash-VL-3.58BPW es una cuantización de precisión mixta del modelo multimodal inclusionAI/Ling-3.0-flash-VL, publicada por el usuario Beling86. Se ha generado con AutoRound 0.16.1 (algoritmo SignRound) y combina pesos W3, W4 y W8 según la sensibilidad de cada componente: expertos enrutados en W3/W4, proyecciones de atención y MLP denso en W8, y routers, embeddings, LM head y normas en BF16. El resultado es un checkpoint de 51,94 GiB con una media de 3,58 bits por peso, pensado para servir el modelo en una única GPU de 64 GB o más.

La particularidad principal es que se trata de una variante **solo texto**: se han eliminado el torreón de visión, el proyector y la capa MTP del modelo base. Por tanto, aunque el nombre conserve el sufijo "VL", esta versión no procesa imágenes. El modelo subyacente es un transformer híbrido con arquitectura `bailing_hybrid`, que combina atención KDA (Kimi Delta Attention) y MLA (Multi-head Latent Attention) con capas MoE, y cuenta con 15.068.570.336 parámetros totales según los safetensors del repositorio.

Su relevancia práctica radica en que permite desplegar un modelo MoE de aproximadamente 15.000 millones de parámetros con una fidelidad respecto a BF16 razonablemente documentada (KL medio de 0,342 sobre el conjunto global, con acuerdo top-1 del 88,71 %) en hardware de una sola GPU, algo inviable con los pesos originales en BF16. La model card incluye además parches necesarios para vLLM 0.32.0/0.33.0, lo que indica que el autor ha validado el despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido `bailing_hybrid` con atención KDA + MLA y capas MoE |
| Parametros totales | 15.068.570.336 |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (valor de `--max-model-len` usado en el ejemplo de despliegue) |
| Tipos de cuantizacion | Precisión mixta AutoRound: W4A16 (grupo 128), W3A16 (grupo 64 y 128), W8A16 (grupo 128) y BF16; media de 3,58 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato de cuantización `auto_round:auto_gptq`) |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido de tipo MoE con dos mecanismos de atención diferenciados: KDA (Kimi Delta Attention) y MLA (Multi-head Latent Attention). La cuantización respeta esta estructura asignando precisiones distintas por componente. Los expertos enrutados de 8 capas MoE (3, 5, 6, 9, 14, 17, 20, 24) se cuantizan en W4A16 con grupo 128; los de 4 capas (18, 27, 28, 40) en W3A16 con grupo 64; y los de las 28 capas restantes en W3A16 con grupo 128. Las proyecciones de atención (KDA y MLA) y el MLP denso de las capas 0–1 se mantienen en W8A16, con la `f_proj` de KDA en BF16. Routers, embeddings, LM head y normas permanecen en BF16.

El proceso de cuantización empleó AutoRound 0.16.1 (SignRound) con 400 iteraciones por bloque y 1.024 muestras de calibración de 2.048 tokens cada una, cubriendo chat, código, razonamiento, contexto largo y prosa de wikitext, con la plantilla de chat de producción. Se usó `best-MSE=False` y el formato `auto_round:auto_gptq`. La fidelidad se midió con KL de vocabulario completo forzado por profesor sobre un conjunto reservado de 24 × 1.024 tokens, disjunto de la calibración: KL medio global de 0,34248, mediana 0,00426, P99 de 6,5247, con PPL BF16 3,809 frente a 3,804 cuantizado. Por dominio, el código presenta el peor P99 (12,8685) y la prosa el mejor acuerdo top-1 (90,54 %).

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat de producción usada durante la calibración.
- Razonamiento y matemáticas, con datos de calibración específicos de razonamiento y evaluación KL separada para math.
- Generación de código, incluida en el conjunto de calibración y evaluada de forma independiente.
- Procesamiento de contexto largo: el ejemplo de despliegue configura 131.072 tokens de ventana.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión: **no disponibles en esta variante**, ya que el torreón de visión, el proyector y la capa MTP han sido eliminados del checkpoint.

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de hasta 131.072 tokens, lo que permite mantener historiales extensos de interacción sin truncar. La calibración incluyó datos de chat con la plantilla de producción, lo que reduce la degradación típica de la cuantización en ese dominio (KL medio de 0,189 en chat).

- **Generación de código en pipelines de CI/CD**: al mantener las proyecciones de atención en W8A16 y conservar routers y embeddings en BF16, el modelo preserva mejor la coherencia en tareas de código. El acuerdo top-1 en el dominio de código es del 89,64 %, el segundo más alto tras prosa, lo que lo hace adecuado para revisión de código, generación de tests o documentación técnica automatizada.

- **Asistente de razonamiento matemático**: la evaluación específica de matemáticas muestra un acuerdo top-1 del 87,45 % y un PPL prácticamente idéntico al BF16 (4,261 frente a 4,240), lo que respalda su uso en resolución de problemas paso a paso y tutoría educativa.

- **Procesamiento de documentación larga**: con 131.072 tokens de contexto, puede resumir, extraer información o responder preguntas sobre contratos, informes o artículos extensos. El buen comportamiento en prosa (mejor acuerdo top-1, 90,54 %) favorece tareas de análisis textual.

- **Despliegue en infraestructura de una sola GPU**: el checkpoint de 51,94 GiB cabe en una GPU de 64 GB o más, lo que permite ofrecer un modelo MoE de 15.000 millones de parámetros en entornos con una sola tarjeta, reduciendo costes frente a despliegues multi-GPU en BF16.

- **Servicio de inferencia con vLLM**: el autor proporciona parches idempotentes para vLLM 0.32.0/0.33.0 que corrigen dos fallos (lectura del ancho de bits por capa en MoE fusionado y registro de la atención KDA fuera de la captura de CUDA graphs), lo que facilita su integración en infraestructuras de serving existentes basadas en vLLM.

- **Prototipado e investigación en cuantización**: la model card documenta con detalle las métricas de fidelidad (KL por dominio, PPL, acuerdo top-1) y las variantes de referencia, lo que lo convierte en un punto de comparación útil para estudiar el impacto de precisiones mixtas en modelos MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí incluye métricas de fidelidad de la cuantización frente a BF16:

| Dominio | Posiciones | KL medio | KL mediana | KL P99 | Acuerdo top-1 | PPL BF16 → cuantizado |
|---|---:|---:|---:|---:|---:|---:|
| Global | 24552 | 0,34248 | 0,00426 | 6,5247 | 88,71 % | 3,809 → 3,804 |
| Chat | 10230 | 0,18930 | 0,01430 | 2,6132 | 88,14 % | 4,953 → 4,980 |
| Código | 5115 | 0,60426 | 0,00010 | 12,8685 | 89,64 % | 3,536 → 3,417 |
| Matemáticas | 5115 | 0,49119 | 0,00314 | 8,2542 | 87,45 % | 4,261 → 4,240 |
| Prosa | 4092 | 0,21231 | 0,00475 | 2,7778 | 90,54 % | 1,884 → 1,937 |

Comparativa interna con la variante de referencia sobre pesos base distintos (`Ling3.0-Flash`, solo texto):

| Variante | Config | Tamaño / BPW | KL medio | KL P99 | Top-1 | KL prosa | P99.9 math | P99.9 código |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| `Ling3.0-Flash-3.44BPW` | 128 muestras, 200 iter, 2× W4 | 49,82 GiB / 3,44 | 0,08767 | 1,2216 | 92,88 % | 0,11341 | 10,307 | 13,536 |
| `Ling3.0-Flash-3.58BPW` | 1024 muestras, 400 iter, 8× W4, best-MSE | 51,93 GiB / 3,58 | 0,08165 | 1,1531 | 93,39 % | 0,09677 | 6,406 | 11,040 |

Además, la comparación entre el decodificador vLLM y el decodificador de referencia sobre las mismas ventanas arroja un acuerdo top-1 del 93,48 % y un solapamiento top-20 del 78,8 %, marcado como FAIL en la propia model card.

## Requisitos de hardware

- **VRAM estimada**: el checkpoint ocupa 51,94 GiB, por lo que se necesita una GPU con al menos 64 GB para servirlo con vLLM junto con la caché KV y el margen de trabajo.
- **GPU recomendadas**: el autor indica explícitamente "single 64+ GB GPU", lo que apunta a A100 80 GB, H100 80 GB, H200 o GPUs de 64 GB como la MI250X en configuraciones compatibles.
- **GPU de consumo**: no cabe en GPUs de consumo típicas (RTX 4090 con 24 GB, RTX 3090 con 24 GB) sin reducir contexto o aplicar cuantizaciones adicionales no documentadas.
- **Opciones de despliegue**: vLLM 0.32.0 o 0.33.0 con `--trust-remote-code`, `--dtype bfloat16` y `--max-model-len 131072`. Requiere aplicar `vllm-patch.py` (idempotente, con `--check` y `--revert`) para corregir el parseo de bits por capa en MoE fusionado y el registro de la atención KDA fuera de la captura de CUDA graphs. Como alternativa a la segunda corrección, puede usarse `--compilation-config '{"cudagraph_mode":"FULL_DECODE_ONLY"}'` o `--enforce-eager`.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ling3.0-Flash-VL-3.58BPW | 15.068.570.336 | 131.072 tokens (config. de despliegue) | Precisión mixta W3/W4/W8/BF16, 3,58 BPW | no disponible | Hugging Face (Beling86) |
| Ling3.0-Flash-3.58BPW (referencia, solo texto) | no disponible | no disponible | Precisión mixta, 3,58 BPW | no disponible | Hugging Face (referencia interna del autor) |
| Ling3.0-Flash-3.44BPW (referencia, solo texto) | no disponible | no disponible | Precisión mixta, 3,44 BPW | no disponible | Hugging Face (referencia interna del autor) |
| inclusionAI/Ling-3.0-flash-VL (BF16) | no disponible | no disponible | BF16 | no disponible | Hugging Face (inclusionAI) |

Las tres variantes de referencia comparten la misma familia Ling 3.0 y permiten comparar el compromiso entre tamaño y fidelidad: la variante de 3,44 BPW ocupa 49,82 GiB con KL medio de 0,08767, mientras que la de 3,58 BPW ocupa 51,93 GiB con KL medio de 0,08165, a costa de 2,1 GiB adicionales. No se dispone de datos de benchmarks estándar para comparar con modelos de otras familias.

## Limitaciones y advertencias

- **Sin capacidades de visión**: a pesar del sufijo "VL" en el nombre, el torreón de visión, el proyector y la capa MTP han sido eliminados. No debe usarse para tareas de imagen.
- **Licencia no disponible**: no se especifica la licencia del checkpoint ni la del modelo base en la información proporcionada, lo que impide confirmar si el uso comercial está permitido. Es imprescindible verificar la licencia del modelo base antes de cualquier despliegue en producción.
- **Idiomas no disponibles**: no se documenta qué idiomas soporta el modelo, por lo que no puede garantizarse un rendimiento adecuado fuera de los idiomas presentes en los datos de calibración.
- **Riesgo de alucinación**: inherente a los modelos generativos; la cuantización introduce además una divergencia respecto a BF16 (KL medio global de 0,34248, P99 de 6,5247), que puede manifestarse en respuestas menos fieles en dominios sensibles como código (P99 de 12,8685) y matemáticas (P99 de 8,2542).
- **Discrepancia en decodificación vLLM**: el acuerdo top-1 del 93,48 % y el solapamiento top-20 del 78,8 % frente al decodificador de referencia están marcados como FAIL en la propia model card, lo que indica que el comportamiento en vLLM puede diferir del esperado con los pesos de referencia.
- **Parches obligatorios en vLLM**: sin `vllm-patch.py`, el modelo falla con OOM en construcción (por el fallback silencioso a 4 bits en capas MoE) o con errores de captura de CUDA graphs en la atención KDA. Esto añade complejidad operativa y riesgo de rotura al actualizar vLLM.
- **Requisito de VRAM elevado**: 51,94 GiB de checkpoint implican una GPU de 64 GB o más; no es desplegable en GPUs de consumo sin modificaciones no documentadas.
- **Repositorio sin tracción**: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria y el soporte disponible.
- **Precisión mixta no estándar**: el formato `auto_round:auto_gptq` con capas W3, W4 y W8 requiere el soporte específico de AutoRound en vLLM; otras herramientas de inferencia (llama.cpp, Ollama, TGI) no están documentadas como compatibles.

## Enlaces

- [Beling86/Ling3.0-Flash-VL-3.58BPW en Hugging Face](https://huggingface.co/Beling86/Ling3.0-Flash-VL-3.58BPW)
- [inclusionAI/Ling-3.0-flash-VL (modelo base)](https://huggingface.co/inclusionAI/Ling-3.0-flash-VL)
- [AutoRound (herramienta de cuantización)](https://github.com/intel/auto-round)
- [vLLM](https://github.com/vllm-project/vllm)
