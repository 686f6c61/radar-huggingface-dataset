# hossain0909/keural-sft-18k

## Resumen

Keural-SFT-18k es un modelo de lenguaje bilingüe coreano-inglés basado en una arquitectura Mixture-of-Experts (MoE) estilo Mixtral, entrenado desde cero por el autor hossain0909. Se trata del checkpoint de ajuste fino supervisado (SFT) correspondiente al paso 18.000, derivado del modelo base mkd-hossain/keural-pretrained (etapa 2 de preentrenamiento), y ajustado con 1,14 millones de muestras de instrucciones en formato ChatML. El modelo responde a la necesidad de contar con alternativas open source optimizadas para coreano, un idioma con soporte limitado en muchos modelos abiertos, manteniendo al mismo tiempo competencias en inglés.

Con 15,37 mil millones de parámetros totales (14,83B según la model card) y unos 7,42B activos por token gracias a su configuración de 8 expertos con top-2, el modelo ofrece un punto de equilibrio entre capacidad y eficiencia de inferencia. Su ventana de contexto es de 4.096 tokens y emplea GQA con 8 cabezas KV, RoPE con theta de 500.000 y ventana deslizante de 512 en capas alternas.

Es relevante ahora porque es uno de los pocos MoE bilingües coreano-inglés publicados bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones. No obstante, el propio autor advierte de que es un checkpoint intermedio con una loss de SFT superior a la de modelos comparables, y que una versión alineada con DPO se publicará por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE estilo Mixtral (8 expertos, top-2), transformer causal |
| Parametros totales | 14,83B (15.368.933.376 según safetensors) |
| Parametros activos | ~7,42B por token |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | Coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

Detalles adicionales: 24 capas, tamaño oculto 4096, 32 cabezas de atención con GQA (8 cabezas KV), tamaño intermedio de experto 5632, vocabulario de 131.074 tokens (131.072 SPM más `<|im_start|>` y `<|im_end|>`).

## Arquitectura y entrenamiento

El modelo es un transformer causal con enrutado MoE estilo Mixtral: 8 expertos por capa de los que se activan 2 por token, lo que reduce el cómputo activo a la mitad respecto a un modelo denso equivalente. Utiliza GQA (Grouped-Query Attention) con 32 cabezas de consulta y 8 cabezas KV, RoPE con theta de 500.000 y una ventana deslizante de 512 tokens aplicada en capas alternas, una configuración heredada del diseño de Mistral/Mixtral.

El entrenamiento constó de tres etapas: preentrenamiento de 100.000 pasos (etapa 1) y 20.000 pasos adicionales (etapa 2) sobre un corpus web coreano-inglés, seguido del SFT de 18.000 pasos con 1,14 millones de muestras en formato ChatML del dataset mkd-chanwoo/keural-SFT. Los hiperparámetros del SFT incluyen learning rate con decaimiento coseno de 1e-5 a 1e-6, batch efectivo de 64 (4 × 8 acumulaciones × 2 GPUs), secuencia máxima de 4096 tokens, weight decay de 0,05 y entrenamiento con FSDP FULL_SHARD sobre 2 GPUs H200 SXM. No se menciona el número total de tokens del preentrenamiento ni el uso de RLHF o DPO en este checkpoint (una versión DPO está prevista como release separado).

## Capacidades

- Generación de texto conversacional bilingüe en coreano e inglés, con formato ChatML multi-turno (roles system, user y assistant).
- Seguimiento de instrucciones tras el ajuste fino supervisado, aunque el autor indica que puede producir respuestas repetitivas o fuera de tema en prompts complejos.
- Contexto de 4.096 tokens, suficiente para conversaciones de longitud moderada y documentos cortos.
- Compatibilidad con serving mediante vLLM con endpoint compatible con la API de OpenAI.
- No hay evidencia de capacidades de visión, audio, tool calling ni agentic: no disponible en la información proporcionada.
- El estilo en coreano tiende al lenguaje informal por la composición del corpus de preentrenamiento, lo que puede ser deseable o no según la aplicación.

## Casos de uso

- Chatbots bilingües coreano-inglés: el formato ChatML multi-turno y los 4.096 tokens de contexto permiten gestionar conversaciones de atención al usuario de longitud moderada en ambos idiomas.
- Asistentes de conversación en coreano informal: el sesgo del corpus web coreano hacia el registro informal lo hace adecuado para aplicaciones de chat dirigidas a consumidores, donde un tono cercano es preferible al formal.
- Integración en servicios vía API: el despliegue con vLLM expone un endpoint compatible con OpenAI, lo que facilita sustituir modelos propietarios en pipelines existentes sin cambios de código significativos.
- Prototipado y investigación en MoE bilingües: al ser un modelo entrenado desde cero con pipeline documentado (preentrenamiento en dos etapas + SFT), sirve como base reproducible para estudios de entrenamiento de MoE en idiomas de recursos medios como el coreano.
- Generación de contenido en coreano con eficiencia de costes: con ~7,42B de parámetros activos por token, el coste de inferencia se aproxima al de un modelo denso de 7B, útil para despliegues con presupuesto de cómputo limitado.
- Base para alineación posterior: el checkpoint puede tomarse como punto de partida para aplicar DPO, RLHF o ajustes de dominio propios, dado que se publica bajo Apache 2.0 con pesos completos en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica de entrenamiento indicada por el autor es la loss de SFT, que se estabilizó en ~1,96 (comparado con ~1,3–1,6 en modelos comparables), lo que sugiere un margen de mejora notable frente a modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: ~30,7 GB solo de pesos (el repo ocupa 30,7 GB), más la memoria para KV cache y activaciones; en la práctica se necesita una GPU de 40 GB o superior, o reparto en 2 GPUs de 24 GB.
- GPU recomendadas: H200 SXM (usadas en el entrenamiento), A100 40/80 GB, H100. Con tensor parallel size 2 en vLLM, dos GPUs de 24 GB (por ejemplo RTX 3090/4090) podrían alojar el modelo con cuantización o con precisión reducida, aunque no hay cuantizaciones oficiales publicadas.
- No cabe en una única GPU de consumo de 24 GB en bfloat16; serían necesarias cuantizaciones (GGUF, AWQ, GPTQ) que actualmente no están disponibles en el repositorio.
- Opciones de despliegue: vLLM (recomendado por el autor, con ejemplo de servidor OpenAI-compatible), transformers con `device_map="auto"`. No hay evidencia de soporte verificado en llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible. El uso de MoE con top-2 implica un cómputo por token equivalente a un modelo denso de ~7,42B.

## Comparativa con modelos similares

| Característica | Keural-SFT-18k | Mixtral-8x7B-Instruct | Qwen2.5-7B-Instruct |
|---|---|---|---|
| Parametros totales | 14,83B | 46,7B | 7B (denso) |
| Parametros activos | ~7,42B | ~12,9B | 7B |
| Contexto | 4.096 | 32.768 | 32.768+ |
| Idiomas | Coreano, inglés | Principalmente inglés (multilingüe limitado) | Multilingüe amplio, incluido coreano |
| Licencia | Apache 2.0 | Apache 2.0 | Apache 2.0 |
| Madurez / benchmarks | Checkpoint intermedio, sin benchmarks publicados | Ampliamente evaluado | Ampliamente evaluado |
| Disponibilidad de cuantización | No disponible | GGUF, AWQ, GPTQ abundantes | GGUF, AWQ, GPTQ abundantes |

Keural destaca por su enfoque específico en coreano con entrenamiento desde cero y licencia permisiva, pero queda por detrás de las alternativas establecidas en contexto, madurez, ecosistema de cuantizaciones y rendimiento documentado.

## Limitaciones y advertencias

- La loss de SFT se estabilizó en ~1,96, por encima del rango típico de modelos comparables (~1,3–1,6); el autor advierte de posibles respuestas repetitivas o fuera de tema en prompts complejos.
- El corpus de preentrenamiento web coreano introduce un sesgo hacia el lenguaje informal, lo que puede ser inadecuado para registros formales o técnicos en coreano.
- Contexto máximo de 4.096 tokens: las entradas más largas se truncan, lo que limita su uso con documentos extensos o RAG de contexto amplio.
- Es un checkpoint intermedio; la versión alineada con DPO aún no se ha publicado, por lo que no se recomienda para producción crítica.
- Es imprescindible configurar `eos_token_id=131073` (`<|im_end|>`); usar el `<eos>` estándar (ID 2) puede provocar que la generación no se detenga correctamente.
- No hay benchmarks públicos, cuantizaciones oficiales ni evidencia de soporte de tool calling o agentes, lo que dificulta evaluar su idoneidad frente a alternativas.
- Al ser un modelo entrenado desde cero con un corpus web, existe riesgo de alucinaciones y sesgos propios de datos web sin filtrar; no disponible una evaluación específica de sesgos.
- La licencia Apache 2.0 no impone restricciones de uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hossain0909/keural-sft-18k
- Modelo base (preentrenado): no disponible un enlace directo verificado; referenciado como mkd-hossain/keural-pretrained
- Dataset SFT: no disponible un enlace directo verificado; referenciado como mkd-chanwoo/keural-SFT
- Paper, blog o demo: no disponible
