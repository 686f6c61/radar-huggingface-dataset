# abliterant/Qwen3.8-27B-RANA-abliterated

## Resumen

Qwen3.8-27B-RANA-abliterated es una variante del modelo Qwen/Qwen3.8-27B a la que se le ha practicado una ablación de la dirección de rechazo mediante la técnica RANA (Reasoning-Anchored, Norm-preserving Ablation). Lo publica el usuario abliterant, un proyecto centrado en investigación sobre comportamiento de rechazo en modelos de lenguaje. El modelo es multimodal (image-text-to-text) y conserva la torre de visión intacta respecto al modelo base. Su relevancia es doble: por un lado, sirve como material de estudio para quien investiga alineación y direcciones de rechazo; por otro, es un ejemplo de modificación de pesos que preserva las normas de las matrices editadas.

El modelo base Qwen3.8-27B es un transformer multimodal con 27.781.427.952 parámetros en BF16 y una longitud de contexto declarada de 262.144 tokens en la configuración, aunque las evaluaciones registradas se hicieron con un límite de servicio de 20.480 tokens. La edición afecta únicamente a 131 tensores (proyecciones de salida de atención, atención lineal, MLP y embeddings de tokens), dejando intactos los 333 tensores de la torre de visión y editando dos escritores residuales del cabezal MTP.

La ficha describe las capacidades heredadas del base, los resultados de evaluación publicados por el autor (refusals en HarmBench, cambios de capacidad frente al base y frente a una referencia "orca"), los requisitos de hardware y las limitaciones de uso. Es importante subrayar que se trata de un modelo con la alineación de seguridad eliminada y destinado a investigación, no a producción sin salvaguardas adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con atención lineal y cabezal MTP para decodificación especulativa; familia qwen3_5 |
| Parametros totales | 27.781.427.952 (BF16, indexados por el Hub) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens configurados; evaluación con límite de servicio de 20.480 tokens |
| Tipos de cuantizacion | BF16 safetensors en este repo; existe una build FP8 separada (Qwen3.8-27B-RANA-abliterated-FP8) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16, 18 shards, ~55,6 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de la familia qwen3_5 con 27.781 millones de parámetros. Incorpora atención lineal (los tensores `linear_attn.out_proj` forman parte del conjunto editado) y un cabezal MTP (multi-token prediction) que habilita decodificación especulativa con aceptación media de 2,45 tokens. La torre de visión se mantiene byte a byte idéntica al modelo base, de modo que las capacidades de percepción visual no se ven alteradas por la ablación.

No se trata de un modelo entrenado desde cero ni de un fine-tuning supervisado: es una edición de pesos sobre Qwen/Qwen3.8-27B. La técnica RANA elimina una única dirección de rechazo del flujo residual siguiendo el enfoque de Arditi et al. (2024), pero preservando las normas originales de las matrices editadas. Los cambios se limitan a 131 tensores: 17 en `self_attn.o_proj` (16 principales y 1 del MTP), 48 en `linear_attn.out_proj`, 65 en `mlp.down_proj` (64 principales y 1 del MTP) y 1 en `embed_tokens`. La receta y el código de RANA no están publicados. Una verificación independiente con Abliterlitics (commit 9b15eb0) detecta exactamente 129 tensores cambiados entre los 850 que inspecciona, coherente con los 131 menos los dos del MTP y visión que esa herramienta omite. La componente residual máxima a lo largo de la dirección eliminada baja de 0,225 a 0,00122. No se dispone de información sobre el dataset de entrenamiento del base ni sobre si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de pensamiento activado por defecto.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con la torre de visión sin modificar respecto al base.
- Tool calling y function calling: el autor documenta soporte con `--enable-auto-tool-choice` y parser `qwen3_coder` en vLLM, incluyendo tool calling multi-turno.
- Soporte de agentes y razonamiento multi-paso, con parser de razonamiento `qwen3`.
- Decodificación especulativa mediante cabezal MTP (aceptación media de 2,45 tokens).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo "thinking" con presupuesto de generación configurable; el autor advierte que solicitudes técnicas largas pueden requerir 20.000-50.000 tokens de razonamiento.
- Comportamiento de rechazo eliminado en la práctica según las evaluaciones del autor (0 rechazos duros en HarmBench de 200 en ambos jueces).

## Casos de uso

- Investigación sobre alineación y direcciones de rechazo: el modelo permite estudiar cómo se comporta un transformer multimodal cuando se elimina una dirección concreta del flujo residual, comparando con el base y con otras ablaciones como la referencia orca. Es adecuado porque el autor publica los chequeos tensor a tensor y las evaluaciones en `results/`.
- Análisis de robustez de filtros de seguridad: sirve para probar sistemas de moderación y clasificadores de contenido frente a un modelo con el rechazo suprimido, midiendo tasas de cumplimiento de peticiones dañinas en HarmBench.
- Evaluación de técnicas de edición de pesos: al preservar las normas y limitar los cambios a 131 tensores, es un banco de pruebas para verificar herramientas de inspección como Abliterlitics y para estudiar la relación entre distancia KL al base y cambios de capacidad.
- Prototipado de asistentes multimodales sin restricciones de rechazo en entornos controlados de laboratorio: con 20.480 tokens de servicio y soporte de imagen, permite experimentar con flujos de imagen-texto donde el base rechazaría la petición, siempre con revisión humana.
- Despliegue en investigación de agentes con tool calling: la configuración de vLLM documentada (parser `qwen3_coder`, tool choice automático, MTP) permite montar pipelines de agente multi-turno para estudiar planificación y uso de herramientas sin las interrupciones por rechazo.
- Estudio de coste computacional de la decodificación especulativa: el cabezal MTP editado mantiene la aceptación en 2,45, lo que permite medir throughput y latencia con y sin especulación sobre un modelo de 27.800 millones de parámetros en una sola GPU de 80 GB.
- Comparación de estrategias de cuantización: al existir una build FP8 oficial, se puede medir la degradación de capacidad y la tasa de rechazo entre BF16 y FP8 sobre el mismo conjunto de evaluación.

## Benchmarks y rendimiento

Datos publicados por el autor con un arnés idéntico para base, referencia orca y RANA; los números de rechazo se promedian sobre 3 semillas y los puntúan dos jueces LLM independientes (gpt-oss / Mistral).

| Métrica | base | orca (referencia) | RANA |
|---|---|---|---|
| Rechazos duros, HarmBench (de 200) | 168 / 155 | 0 / 0 | 0 / 0 |
| Responde la petición, prompts held-out | 3% / 0% | 84% / 49% | 90% / 54% |
| Alcanza el presupuesto de 16k tokens, held-out | 0,6% | 11,9% | 6,7% |
| Cambio medio de capacidad vs base (5 tareas) | – | 1,11 pp | 0,82 pp |
| Peor tarea individual vs base | – | −2,2 (HumanEval) | −1,5 (TruthfulQA) |
| Distancia al base (KL) | 0 | 0,075 | 0,041 |

El autor indica que la capacidad se mantiene dentro del ruido respecto al base salvo una caída de ~1,5 pp en TruthfulQA, y que RANA es 2,2 pp peor que orca en IFEval (seguimiento de instrucciones), con el resto de tareas empatadas. Los recuentos brutos de gpt-oss para rechazos son 0,7 en ambos modelos abliterados (2 sobre 3 semillas). No se han publicado en la información disponible resultados de MMLU, HumanEval o GSM8K con cifras absolutas, solo las diferencias relativas indicadas.

## Requisitos de hardware

- VRAM estimada en BF16: ~55,6 GB de pesos, por lo que encaja en una GPU de 80 GB o más con margen para KV cache y activaciones.
- La build FP8 oficial reduce el peso de los pesos aproximadamente a la mitad; consultar su model card para el detalle.
- GPU recomendadas: A100 80 GB, H100 80 GB, y en general cualquier acelerador con 80 GB o más en BF16.
- No cabe en GPUs de consumo de 24 GB en BF16; requeriría cuantización adicional no publicada en este repo (el autor solo ofrece BF16 y FP8).
- Despliegue probado con vLLM 0.30.0, con `--dtype bfloat16 --max-model-len 20480`, parser de razonamiento `qwen3`, tool parser `qwen3_coder` y decodificación especulativa MTP con 2 tokens.
- En GPUs Blackwell fue necesario `VLLM_USE_FLASHINFER_SAMPLER=0`.
- Límite de una imagen por prompt en la configuración probada (`--limit-mm-per-prompt '{"image": 1, "video": 0}'`).
- Latencia y throughput: no disponibles; el autor solo reporta una longitud de aceptación especulativa de 2,45 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rechazos HarmBench (de 200) | Cambio de capacidad vs base | KL vs base | Licencia |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-RANA-abliterated | 27,78 B | 262.144 configurados; 20.480 en evaluación | 0 / 0 | 0,82 pp | 0,041 | Apache-2.0 |
| orcarouter/Qwen3.8-27B-Uncensored | no disponible | no disponible | 0 / 0 | 1,11 pp | 0,075 | no disponible |
| Qwen/Qwen3.8-27B (base) | 27,78 B | 262.144 configurados | 168 / 155 | – | 0 | Apache-2.0 |

Frente a la referencia orca, RANA queda más cerca del base en KL (0,041 frente a 0,075), alcanza el presupuesto de tokens la mitad de veces (6,7% frente a 11,9%) y responde más prompts held-out bajo ambos jueces, aunque pierde 2,2 pp en IFEval. No se dispone de datos de benchmarks absolutos ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo con la alineación de seguridad eliminada: el autor lo etiqueta explícitamente como modelo de investigación y pide leer las secciones de uso previsto y limitaciones antes de utilizarlo.
- Riesgo elevado de generar contenido dañino: la tasa de rechazos duros en HarmBench cae a 0 en ambos jueces, por lo que no debe desplegarse en producción sin capas de moderación externas.
- La receta y el código de RANA no están publicados, lo que limita la reproducibilidad del método más allá de los chequeos tensor a tensor publicados.
- El 6,7% de las respuestas held-out agota el presupuesto de 16k tokens antes de terminar; el autor indica que se debe sobre todo a razonamiento largo, no a repetición, y que solicitudes técnicas complejas pueden necesitar 20.000-50.000 tokens.
- Las evaluaciones registradas se hicieron con un límite de servicio de 20.480 tokens; no se ha establecido el rendimiento con la ventana completa de 262.144 tokens.
- Caída de ~1,5 pp en TruthfulQA y de 2,2 pp en IFEval frente a orca, según el arnés del autor.
- Sesgos conocidos: no disponibles en la información proporcionada; se heredan los del modelo base, no documentados aquí.
- Idiomas soportados: no disponibles.
- Licencia Apache-2.0, que permite uso comercial, pero el uso comercial de un modelo sin alineación de seguridad conlleva riesgos legales y reputacionales que deben evaluarse por separado.
- El límite de una imagen por prompt en la configuración probada restringe escenarios multimodales con múltiples imágenes.
- En GPUs Blackwell se requiere desactivar el sampler de FlashInfer, lo que puede afectar al rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abliterant/Qwen3.8-27B-RANA-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Build FP8: https://huggingface.co/abliterant/Qwen3.8-27B-RANA-abliterated-FP8
- Referencia orca: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Organización Abliterant en Hugging Face: https://huggingface.co/abliterant
- Chat de demostración: https://chat.abliterant.ai/
- Sitio del proyecto: https://abliterant.ai/
- Formatos disponibles: https://abliterant.ai/models
- Notas de investigación sobre RANA: https://blog.abliterant.ai/rana-refusal-ablation
- Herramienta de verificación Abliterlitics: https://github.com/dreamfast/abliterlitics
