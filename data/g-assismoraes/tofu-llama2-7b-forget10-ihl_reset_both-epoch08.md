# g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch08

## Resumen

El modelo `g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch08` es un checkpoint completo de Llama 2 de 7B obtenido mediante un proceso de *machine unlearning* sobre el modelo `locuslab/tofu_ft_llama2-7b`, que a su vez es un ajuste fino de Llama 2 sobre el conjunto de datos sintetico TOFU (Task of Fictitious Unlearning). El objetivo del entrenamiento es eliminar selectivamente la informacion asociada a un subconjunto de autores ficticios (la particion `forget10`) manteniendo el rendimiento sobre el resto (`retain`). El autor es `g-assismoraes`, y el checkpoint corresponde a la epoca 8 de un total de 20.

La tecnica empleada combina dos ingredientes: por un lado, se reinicializan los embeddings de entrada y la cabeza de lenguaje (`LM head`) a partir de `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo base ajustado; por otro, se aplica una perdida de *token unlearning* (IHL, *inverse/hinge loss* sobre los tokens de la particion forget) sumada a una entropia cruzada estandar ponderada con factor 1,0 sobre la particion retain. El resultado es un checkpoint autónomo, no un adaptador, pensado para experimentacion en olvido selectivo y evaluacion de privacidad en LLMs.

Es relevante ahora porque el *machine unlearning* en modelos de lenguaje es un area activa: la regulacion europea (RGPD, derecho al olvido) y la necesidad de retirar contenido con copyright o datos personales de modelos ya entrenados empujan a la comunidad a desarrollar y comparar metodos de olvido que sean eficaces sin degradar capacidades generales. TOFU es uno de los benchmarks de referencia para esta tarea, y este checkpoint forma parte de una familia de experimentos (distintas epocas y variantes de inicializacion) que permite estudiar el compromiso entre olvido y retencion a lo largo del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 (~6,74B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (arquitectura Llama 2: 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantizacion posterior a 8/4 bits via herramientas estandar) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Inicializacion de embeddings y LM head | NousResearch/Llama-2-7b-chat-hf |
| Checkpoint | Epoca 8 de 20 |
| Tamano del repositorio | 13,5 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B: un transformer decoder-only con atencion multi-cabeza con RoPE, normalizacion RMSNorm, activacion SwiGLU y sesgo desactivado en las proyecciones lineales. El modelo parte de `locuslab/tofu_ft_llama2-7b`, que es un ajuste fino supervisado de Llama 2 sobre TOFU, y sobre el se aplica un procedimiento de olvido. La particularidad de esta variante (`ihl_reset_both`) es que los embeddings de tokens y la cabeza de lenguaje se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se mantienen del modelo base. Esto busca romper la asociacion directa entre tokens de la particion forget y sus continuaciones sin destruir las representaciones internas aprendidas.

La funcion de perdida combina un termino IHL (token-level unlearning) sobre la particion `forget10` y una entropia cruzada estandar con peso 1,0 sobre la particion `retain`. El checkpoint publicado corresponde a la epoca 8 de 20, lo que permite analizar la dinamica temporal del olvido: en epocas tempranas el modelo puede retener informacion residual de la particion forget, y en epocas tardias puede degradarse la calidad sobre retain. El repositorio incluye un `ihl_manifest.json` con metadatos del experimento. No se dispone de informacion sobre el numero exacto de tokens de entrenamiento, la composicion detallada del dataset TOFU ni si se aplicaron tecnicas adicionales como DPO o RLHF en esta fase.

## Capacidades

- Generacion de texto en ingles con la calidad base de Llama 2 7B (ajustada sobre TOFU).
- Respuesta a preguntas sobre autores ficticios del conjunto TOFU (parcialmente olvidada para la particion forget10).
- Razonamiento basico y generacion de codigo heredados del modelo base, aunque no son el foco del ajuste.
- Soporte de tool calling / function calling: no disponible de forma nativa (Llama 2 base no lo incluye; requeriria plantillas y ajuste adicional).
- Soporte de agentes y razonamiento multi-paso: limitado; no es una capacidad entrenada especificamente.
- Capacidades multilingues: limitadas al ingles; el modelo no ha sido ajustado para otros idiomas.
- Capacidad especial: ninguna adicional (sin vision, sin audio, sin modo thinking explicito).

## Casos de uso

- Investigacion en machine unlearning: comparar la eficacia del olvido de la particion forget10 frente a otras variantes (distintas epocas, otras inicializaciones) usando el benchmark TOFU. Es el uso principal y el unico para el que el modelo esta disenado.
- Evaluacion de privacidad y derecho al olvido: medir cuanto conocimiento factual sobre autores ficticios permanece tras el entrenamiento, como proxy de la retirada de datos personales en produccion.
- Estudio de la dinamica de olvido por epocas: al ser la epoca 8 de 20, permite trazar curvas de olvido frente a retencion y elegir el punto de compromiso optimo.
- Analisis de degradacion de capacidades: cuantificar la perdida de rendimiento en tareas generales (perplejidad, QA abierta) causada por el termino IHL sobre forget.
- Baseline para experimentos de unlearning con reinicializacion de capas: sirve como referencia para comparar tecnicas que reinicializan embeddings y LM head frente a las que no lo hacen.
- Docencia y divulgacion: ejemplo reproducible de un pipeline de unlearning sobre Llama 2 con licencia Llama 2, util para cursos de seguridad y privacidad en IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 13,5 GB de pesos mas overhead de activaciones y cache KV; en la practica se recomienda 16-24 GB.
- VRAM estimada en cuantizacion 8 bits: ~7 GB; en 4 bits: ~4-5 GB (estimaciones teoricas a partir del numero de parametros, no verificadas por el autor).
- GPU recomendadas: A100 40GB, H100 80GB o L40S para fp16 sin cuantizar con contexto largo; RTX 4090 (24 GB) para fp16 con contexto moderado; RTX 3090/4080 (16-24 GB) para cuantizacion 8 bits.
- Cabe en GPU de consumo: si, en RTX 4090/3090 en fp16 y en GPUs de 8-12 GB con cuantizacion 4 bits.
- Opciones de despliegue: transformers (PyTorch), vLLM, TGI, llama.cpp y Ollama (previa conversion a GGUF), ya que el checkpoint es un modelo Llama 2 estandar en safetensors.
- Latencia y throughput estimados: no disponibles; dependen del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch08 | 6,74B | no disponible (Llama 2: 4096) | Unlearning IHL + reset de embeddings/LM head sobre TOFU forget10 | llama2 | HuggingFace (0 descargas) |
| locuslab/tofu_ft_llama2-7b | 6,74B | 4096 | Ajuste fino supervisado sobre TOFU (modelo base de este checkpoint) | llama2 | HuggingFace |
| NousResearch/Llama-2-7b-chat-hf | 6,74B | 4096 | Llama 2 chat ajustado con RLHF/SFT | llama2 | HuggingFace |
| meta-llama/Llama-2-7b-hf | 6,74B | 4096 | Llama 2 base preentrenado | llama2 | HuggingFace |

## Limitaciones y advertencias

- El modelo esta disenado exclusivamente para investigacion en unlearning; no es un modelo de proposito general listo para produccion.
- El olvido no es garantizado: el termino IHL reduce pero no elimina necesariamente la informacion de la particion forget; pueden existir extracciones residuales mediante prompts adversariales.
- Riesgo de alucinacion elevado en dominios factuales, especialmente tras la reinicializacion de la LM head, que puede desestabilizar la calibracion.
- El reinicializacion de embeddings y LM head puede degradar la fluidez y coherencia respecto al modelo base, especialmente en epocas avanzadas del entrenamiento.
- Idioma limitado al ingles; no se ha evaluado su comportamiento en castellano ni en otros idiomas.
- Sesgos heredados de Llama 2 y de los datos sinteticos de TOFU; no se han aplicado mitigaciones especificas.
- La licencia Llama 2 impone restricciones de uso comercial (umbral de 700 millones de usuarios mensuales, requisitos de atribucion y politicas de uso aceptable); verificar antes de cualquier despliegue.
- No se han publicado evaluaciones de seguridad, toxicidad ni robustez para este checkpoint.
- El autor no proporciona pipeline, demo ni resultados de benchmarks; el modelo tiene 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch08
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicializacion de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo original Llama 2: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
