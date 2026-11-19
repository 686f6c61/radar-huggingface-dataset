# ikimyaii/HGRN-1.3B-unstructured-SparseGPT-30pct

## Resumen

HGRN-1.3B-unstructured-SparseGPT-30pct es una variante podada del modelo base fla-hub/hgrn-1.3B-100B, publicado por el usuario ikimyaii en Hugging Face. Se trata de un ejercicio de compresión de modelos: parte de un transformer de 1.364 millones de parámetros basado en la arquitectura HGRN (Hierarchically Gated Recurrent Network, del ecosistema Flash Linear Attention) y le aplica una poda no estructurada one-shot del 30 % mediante el código oficial de SparseGPT, sin reentrenamiento posterior. El resultado es un checkpoint con matrices dispersas que mantiene la calidad del modelo denso con un coste de perplexity muy contenido.

El interés de esta ficha es doble. Por un lado, documenta una técnica de compresión reproducible (SparseGPT con bloques de 128 columnas, damping 0.01, calibración sobre 128 secuencias de C4 de 2.048 tokens) aplicada a una familia de modelos poco habitual en los pipelines de poda, que tradicionalmente solo cubren OPT y LLaMA. Por otro, sirve como baseline de referencia para otros modelos del mismo autor orientados a dispersión estructurada.

No es un modelo pensado para uso en producción directo: no hay licencia declarada, no hay idiomas declarados y el checkpoint requiere instalar flash-linear-attention para cargarse. Su valor es principalmente de investigación en eficiencia y compresión de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HGRN (Hierarchically Gated Recurrent Network), transformer con capas recurrentes lineales del ecosistema Flash Linear Attention |
| Parametros totales | 1.364.396.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base se entrena con secuencias de 2.048 tokens segun la calibracion) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16, sin variantes GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dispersión | 30 % no estructurada (0.3000 medido sobre los pesos) |
| Modelo base | fla-hub/hgrn-1.3B-100B |
| Tamano del repo | 2.7 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura HGRN del checkpoint fla-hub/hgrn-1.3B-100B, un transformer con capas de atención lineal recurrente implementadas en la librería flash-linear-attention. Sobre esa base, el autor aplica una poda no estructurada one-shot con el código oficial de SparseGPT (repositorio IST-DASLab/sparsegpt, commit 147d215, variante fasterprune) con blocksize 128 y damping 0.01. La calibración usa 128 secuencias de C4 de 2.048 tokens con semilla 0, y los bloques se podan en orden, recalculando la calibración sobre las salidas de los bloques ya podados. Las capas lineales dentro de los bloques se podan todas; embeddings y lm_head permanecen densos.

La poda se realizó en bfloat16 y tardó 3,6 minutos en una única A100 de 40 GB. La máscara resultante usa un umbral por bloque de 128 columnas, de modo que las filas acaban con distinto número de ceros: el autor reporta que, en las 168 capas podadas, la fila más densa tiene de media 1,22 veces los no-ceros de la fila media (peor capa: 1,42 veces). No hubo reentrenamiento ni ajuste fino posterior; es una poda puramente post-hoc.

## Capacidades

- Generación de texto autoregresiva con el mismo comportamiento que el modelo base denso.
- Razonamiento y respuesta a preguntas de conocimiento general, evaluado en tareas zero-shot de lm-evaluation-harness (arc, boolq, hellaswag, openbookqa, rte, winogrande).
- Comprensión lectora y clasificación de pares de frases (rte, winogrande).
- No hay evidencia en la información disponible de soporte de tool calling, function calling ni uso como agente.
- No hay evidencia de capacidades multimodales (visión, audio) ni de modo de razonamiento explícito (thinking mode).
- Capacidades multilingües: no declaradas; los idiomas soportados figuran como no disponibles.

## Casos de uso

- Investigación en compresión de modelos: sirve como baseline reproducible para comparar técnicas de poda (SparseGPT frente a EHWS u otras) sobre arquitecturas HGRN, ya que el autor lo presenta explícitamente como referencia para sus modelos de dispersión estructurada.
- Estudio de la degradación por poda: permite medir empíricamente la caída de perplexity (de 11,81 a 12,35 en WikiText-2) y de accuracy zero-shot al eliminar el 30 % de los pesos, útil para calibrar umbrales de compresión aceptables.
- Validación de pipelines de inferencia con pesos dispersos: al ser un checkpoint safetensors con máscara no estructurada, sirve para probar si un runtime (kernel disperso, vLLM con soporte de sparsity o similar) acelera realmente la inferencia o solo ahorra memoria.
- Experimentos de eficiencia en entornos con VRAM limitada: con 1,36 mil millones de parámetros y pesos en bfloat16, el modelo ocupa aproximadamente 2,7 GB, lo que permite ejecutarlo en GPUs de consumo para pruebas de concepto.
- Reproducción de resultados académicos: el autor documenta el commit exacto, la semilla, el dataset de calibración y el tiempo de poda, lo que facilita replicar el experimento en otras arquitecturas lineales.
- Docencia y formación técnica: como ejemplo didáctico de poda no estructurada con SparseGPT, incluyendo la discusión sobre desequilibrio de filas y su impacto en kernels reales.

## Benchmarks y rendimiento

Perplexity según el protocolo de evaluación de ELSA (WikiText-2 y C4, fp16):

| Metrica | Modelo denso | Este modelo (30 % sparsity) |
|---|---|---|
| Perplexity WikiText-2 | 11,81 | 12,35 |
| Perplexity C4 | 16,09 | 16,66 |

Precisión zero-shot con lm-evaluation-harness:

| Tarea | Modelo denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2432 | 0,2346 |
| arc_easy | 0,5644 | 0,5589 |
| boolq | 0,5758 | 0,5924 |
| hellaswag | 0,3828 | 0,3750 |
| openbookqa | 0,2300 | 0,2260 |
| rte | 0,5379 | 0,5668 |
| winogrande | 0,5288 | 0,5264 |
| Media | 0,4376 | 0,4400 |

La media zero-shot del modelo podado (0,4400) es ligeramente superior a la del denso (0,4376), aunque las diferencias por tarea están dentro del ruido esperable en modelos de este tamano.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,7 GB de pesos, más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB para secuencias cortas.
- GPU recomendadas: A100 40 GB (usada para la poda), H100, L40S o cualquier GPU con al menos 8 GB de VRAM para pruebas.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; también en GPUs de 8 GB con secuencias cortas.
- Opciones de despliegue: carga con `AutoModelForCausalLM.from_pretrained` tras instalar `flash-linear-attention` (`import fla`). No hay evidencia de soporte en vLLM, llama.cpp, Ollama o TGI, ni de pesos GGUF publicados.
- Latencia y throughput: no disponibles en la información proporcionada. La poda no estructurada no garantiza aceleración sin kernels específicos que aprovechen la dispersión.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ikimyaii/HGRN-1.3B-unstructured-SparseGPT-30pct | 1,36 B | no disponible | no disponible | Hugging Face, safetensors | Poda no estructurada 30 %, one-shot, sin reentrenamiento |
| fla-hub/hgrn-1.3B-100B (base) | 1,36 B | no disponible | no disponible | Hugging Face | Modelo denso de referencia, entrenado con 100 B tokens |
| Otros modelos del mismo autor (EHWS) | no disponible | no disponible | no disponible | Hugging Face | Variantes con dispersión estructurada mencionadas como comparación en la model card; sin datos publicados en la información disponible |

No se dispone de datos de benchmarks de modelos comparables de terceros en la información proporcionada, por lo que la comparativa se limita al modelo base y a las variantes del mismo autor.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor o consultar el modelo base antes de cualquier despliegue en producción.
- Idiomas no declarados: no hay garantía de calidad multilingüe más allá de lo que herede el modelo base.
- La poda no estructurada puede no traducirse en aceleración real sin kernels que exploten la dispersión; el ahorro principal es de memoria.
- Desequilibrio de filas: la fila más densa tiene de media 1,22 veces los no-ceros de la media (peor capa 1,42 veces), lo que complica el uso de kernels dispersos balanceados.
- Riesgo de alucinación: inherente a un modelo de 1,36 B parámetros; no hay evaluaciones de factualidad en la información disponible.
- Sin reentrenamiento: la poda one-shot puede degradar capacidades no cubiertas por los benchmarks reportados (generación larga, instrucciones, código).
- Requiere instalar flash-linear-attention y cargar con `import fla`; no es un checkpoint estándar de transformers y puede fallar en pipelines automáticos.
- Sin datos de contexto máximo: no se puede asumir una ventana mayor de 2.048 tokens, que es la longitud usada en la calibración.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/HGRN-1.3B-unstructured-SparseGPT-30pct
- Modelo base: https://huggingface.co/fla-hub/hgrn-1.3B-100B
- Código oficial de SparseGPT: https://github.com/IST-DASLab/sparsegpt (commit 147d215)
- Librería flash-linear-attention: https://github.com/fla-org/flash-linear-attention
- Paper de SparseGPT: https://arxiv.org/abs/2301.00774
- Paper de HGRN: https://arxiv.org/abs/2311.04823
