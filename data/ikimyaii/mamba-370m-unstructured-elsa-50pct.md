# ikimyaii/Mamba-370M-unstructured-ELSA-50pct

## Resumen

Mamba-370M-unstructured-ELSA-50pct es una versión podada del modelo de lenguaje Mamba-370M desarrollado originalmente por el equipo de state-spaces (Albert Gu y Tri Dao). Se trata de un modelo de arquitectura SSM (State Space Model) pura, sin mecanismo de atención, que ha sido sometido a un proceso de poda no estructurada del 50% mediante la técnica ELSA (ADMM) descrita en el paper arXiv:2510.01650. El autor de esta variante es el usuario de Hugging Face ikimyaii, que la publica como baseline de referencia para sus modelos EHWS.

El modelo conserva 423.003.136 parámetros totales (ligeramente por encima de los 370M nominales del modelo base) y mantiene el tokenizador y la configuración del Mamba-370M original. La poda afecta a las capas lineales internas de los bloques (`in_proj`, `x_proj`, `out_proj`), dejando densas las proyecciones `dt_proj`, la convolución `conv1d`, los parámetros `A_log` y `D`, además de los embeddings y la cabeza de lenguaje. La esparsidad efectiva medida sobre los pesos publicados es de 0,4901.

Su relevancia es fundamentalmente metodológica: sirve como punto de comparación para estudiar el impacto de la poda no estructurada en modelos SSM y como referencia para evaluar técnicas de poda más avanzadas. No es un modelo pensado para producción, sino un artefacto de investigación con cero descargas y sin licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (SSM selectivo, sin atención) |
| Parametros totales | 423.003.136 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Mamba-370M soporta hasta 2048 tokens en entrenamiento; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (pesos en bf16; el autor advierte que fp16 desborda en Mamba) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es Mamba, un modelo de espacio de estados selectivo que sustituye la atención por una recurrencia lineal con parámetros dependientes de la entrada. El modelo base Mamba-370M fue entrenado por state-spaces sobre el corpus Pile (según la documentación pública del modelo original, aunque este dato no se detalla en la model card proporcionada). Sobre esa base, el autor aplica poda no estructurada con ELSA: un umbral de magnitud por capa, de modo que las filas resultantes tienen distinto número de ceros.

El proceso de poda emplea la configuración exacta del run HGRN-1.3B @80% del paper ELSA: 4096 pasos ADMM, paso z cada 32 pasos, batch 1 con acumulación de 8, learning rate 2e-4, lambda 0,01, precisión bf16 y 32.768 secuencias de C4 de 2.048 tokens tokenizadas con el tokenizador del propio modelo. El entrenamiento completo requirió 2,85 horas en una A100 de 40 GB. No se aplicó RLHF ni DPO; es un proceso de compresión post-entrenamiento. La esparsidad medida sobre los pesos finales es 0,4901, y las filas no están balanceadas: en las 192 capas podadas, la fila más densa tiene de media 1,28 veces los no-ceros de la fila media (peor capa: 1,64x).

## Capacidades

- Generación de texto autoregresiva en inglés (el modelo base se entrenó principalmente en inglés; no se declaran capacidades multilingües).
- Razonamiento básico de sentido común y respuesta a preguntas de opción múltiple, con degradación moderada respecto al denso.
- No soporta tool calling ni function calling de forma nativa.
- No soporta agentes ni razonamiento multi-paso estructurado.
- No dispone de modo thinking, visión ni audio.
- Capacidad de inferencia con `AutoModelForCausalLM.from_pretrained(...)` en `transformers` estándar.
- Al ser un SSM, su coste de inferencia es lineal en la longitud de secuencia, sin caché KV cuadrática.

## Casos de uso

- Investigación en compresión de modelos: sirve como baseline reproducible para comparar técnicas de poda (estructurada vs. no estructurada, ELSA vs. alternativas) sobre arquitecturas SSM, dado que el autor publica la configuración exacta del run.
- Estudio del impacto de la esparsidad en SSM: permite medir cómo afecta una poda del 50% no estructurada a la perplejidad y a tareas zero-shot en un modelo sin atención, un régimen poco explorado frente a los transformers.
- Reproducción de experimentos del paper ELSA: al emplear la configuración oficial del paper, facilita la verificación independiente de sus resultados sobre un modelo de 370M.
- Prototipado de inferencia eficiente en CPU o GPU modesta: con 423M parámetros y pesos en bf16 (aproximadamente 0,85 GB), cabe en GPUs de consumo y permite experimentar con decodificación de secuencias largas sin caché KV.
- Docencia y divulgación: ejemplo didáctico de pipeline completo de poda post-entrenamiento (ADMM, umbral por capa, evaluación con lm-evaluation-harness) sobre un modelo pequeño.
- Benchmarking de kernels SSM: al ser un Mamba podado, sirve para evaluar el rendimiento de implementaciones de kernels selectivos con matrices dispersas o con ceros estructurados.

## Benchmarks y rendimiento

Perplejidad (protocolo de evaluación de ELSA, en bf16):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Mamba-370M denso | 14,33 | 19,40 |
| Este modelo (50% poda) | 22,75 | 25,78 |

Precisión zero-shot (lm-evaluation-harness):

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2517 | 0,2389 |
| arc_easy | 0,5484 | 0,4903 |
| boolq | 0,6150 | 0,6180 |
| hellaswag | 0,3722 | 0,3495 |
| openbookqa | 0,1960 | 0,1940 |
| rte | 0,5307 | 0,5271 |
| winogrande | 0,5588 | 0,5367 |
| **Media** | **0,4390** | **0,4221** |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,85 GB en bf16 (423M parámetros x 2 bytes), más overhead de activaciones y del estado recurrente.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una A100 40 GB fue suficiente para el proceso de poda completo (2,85 horas).
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares, así como en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (soporte nativo de Mamba); no se confirma soporte en vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles. El autor solo reporta el tiempo de entrenamiento/poda, no métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | PPL WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Mamba-370M 50% podado) | 423M | no disponible | 22,75 | no disponible | Hugging Face |
| state-spaces/mamba-370m-hf (denso) | ~370M | 2048 (entrenamiento) | 14,33 | Apache 2.0 (modelo base) | Hugging Face |
| Mamba-130M (denso) | ~130M | 2048 (entrenamiento) | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| Transformer de tamaño similar (p. ej. GPT-2 small) | 124M | 1024 | no comparable directamente | MIT | Hugging Face |

La comparación directa más relevante es contra el modelo denso del que deriva: la poda al 50% multiplica por aproximadamente 1,59 la perplejidad en WikiText-2 y por 1,33 en C4, con una caída media de 1,69 puntos en zero-shot. No se dispone de datos de otras variantes podadas de Mamba en la información proporcionada.

## Limitaciones y advertencias

- Degradación significativa de calidad: la perplejidad en WikiText-2 pasa de 14,33 a 22,75, lo que supone un empeoramiento sustancial para cualquier uso generativo real.
- Esparsidad no estructurada: los patrones de ceros no son regulares, por lo que no se traducen necesariamente en aceleración en hardware estándar sin kernels especializados.
- Filas desbalanceadas: la fila más densa tiene de media 1,28x los no-ceros de la media (hasta 1,64x en la peor capa), lo que genera heterogeneidad en el coste computacional.
- Precisión: el autor advierte que Mamba desborda en fp16; debe usarse bf16 o fp32.
- Licencia no declarada: no se especifica licencia, lo que impide asumir derechos de uso comercial. El modelo base es Apache 2.0, pero esta variante no lo confirma.
- Idiomas no declarados: se asume inglés por herencia del modelo base, sin garantías para otros idiomas.
- Contexto no especificado: la model card no indica la longitud de contexto soportada; el modelo base se entrenó con 2048 tokens.
- Riesgo de alucinación: inherente a un modelo de lenguaje pequeño y agravado por la poda; no se han publicado evaluaciones de factualidad.
- Artefacto de investigación: cero descargas y cero likes en el momento de la consulta; sin garantías de mantenimiento ni soporte.
- Sesgos: no se han documentado evaluaciones de sesgo; el modelo base se entrenó sobre el Pile, con los sesgos asociados a ese corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/Mamba-370M-unstructured-ELSA-50pct
- Modelo base: https://huggingface.co/state-spaces/mamba-370m-hf
- Paper ELSA: https://arxiv.org/abs/2510.01650
