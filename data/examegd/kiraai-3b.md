# examegd/KiraAi-3B

## Resumen

KiraAi-3B es un modelo de lenguaje publicado en HuggingFace por el usuario `examegd` bajo el identificador `examegd/KiraAi-3B`. Se trata de un checkpoint de 3.397.103.616 parámetros (3,40 mil millones) almacenado exclusivamente en formato safetensors, con un tamaño de repositorio de 6,8 GB, lo que es coherente con pesos en precisión de 16 bits (3,40 B × 2 bytes ≈ 6,8 GB) sin artefactos cuantizados adicionales. La etiqueta `qwen2` del repositorio indica que la arquitectura declarada en la configuración corresponde a la familia Qwen2 (transformer decoder-only con atención causal, RoPE y capas GQA), aunque no se ha publicado información que confirme el procedimiento de entrenamiento ni el modelo base exacto.

El interés de esta ficha es limitado pero real: se trata de un modelo pequeño, con huella de memoria moderada, que podría ejecutarse en GPU de consumo si la calidad lo permite. Sin embargo, la información pública es mínima: no hay tarjeta de modelo con descripción, no se declara licencia, no se especifican idiomas soportados ni longitud de contexto, y el repositorio no incluye datos de benchmarks ni resultados de evaluación. El contador de descargas es 0 y el de likes es 1 en el momento de la consulta, y la fecha de creación registrada (2026-10-20) es posterior a la de la mayoría de checkpoints de referencia, lo que sugiere un experimento personal o un fine-tune reciente más que un lanzamiento con soporte.

Por tanto, esta ficha debe leerse como una evaluación de "caja gris": se documentan con rigor los pocos datos verificables (tamaño, formato, arquitectura declarada) y se marcan explícitamente como no disponibles todos los demás. Cualquier uso en producción requeriría una validación propia del checkpoint antes de considerarlo fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (según etiqueta `qwen2` del repositorio); detalles de configuración (nº de capas, heads, GQA) no disponibles |
| Parametros totales | 3.397.103.616 (3,40 B), dato real de los safetensors |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible (no declarada en el repositorio) |
| Tipos de cuantizacion | no disponible en el repositorio: solo se publican pesos en safetensors en precisión original; no hay GGUF, AWQ, GPTQ ni EXL2 publicados |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no declarada en la tarjeta del repositorio) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 6,8 GB |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 1 en el momento de la consulta |
| Fecha de creacion / actualizacion | 2026-10-20 / 2026-10-20 |

## Arquitectura y entrenamiento

La única información arquitectónica verificable es la etiqueta `qwen2`, que sitúa el modelo en la familia Qwen2 de Alibaba: un transformer decoder-only con atención causal, normalización RMSNorm, activaciones SwiGLU, embeddings rotatorios (RoPE) y, en los tamaños medios de esa familia, atención con query/key/value agrupadas (GQA) para reducir el coste de la caché KV. Con 3,40 B de parámetros, el checkpoint no coincide con ningún tamaño oficial de Qwen2 (0,5 B, 1,5 B, 7 B, 72 B), lo que apunta a una inicialización desde otro modelo (posiblemente Qwen2.5-3B, cuyo recuento es de ~3,09 B, o a un modelo entrenado desde cero con la misma configuración), a un fine-tune o a una poda/expansión. No se ha publicado ninguna confirmación al respecto.

No hay información sobre el corpus de entrenamiento: se desconocen el número de tokens, la composición del dataset, el reparto de idiomas y si hubo fases de ajuste supervisado, RLHF o DPO. Tampoco se documentan innovaciones técnicas (decodificación especulativa, atención lineal, modos de razonamiento extendido) ni hiperparámetros de entrenamiento. Dado que la tarjeta del modelo no incluye descripción, cualquier afirmación sobre el proceso de entrenamiento sería especulativa y debe evitarse.

## Capacidades

- Generación de texto autoregresiva: capacidad esperable por la arquitectura, pero no evaluada ni documentada por el autor.
- Razonamiento y matemáticas: sin datos de benchmarks que permitan estimar el nivel; no verificable.
- Generación de código: sin datos de HumanEval, MBPP ni similares; no verificable.
- Tool calling / function calling: no documentado; no se puede asumir soporte de plantillas de herramientas aunque el modelo base sea de la familia Qwen2.
- Uso como agente y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles; se desconoce el reparto de idiomas del entrenamiento.
- Visión, audio o modalidades adicionales: no disponibles; el checkpoint es solo de texto según los tags.
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

Dado que no se han publicado evaluaciones, los casos siguientes son escenarios plausibles condicionados a una validación previa del checkpoint por parte del equipo que lo adopte:

- Prototipado local en GPU de consumo: con 3,40 B de parámetros y pesos de 6,8 GB, el modelo se puede cargar en una RTX 4090 o incluso en una RTX 4070 Ti con cuantización a 8 bits, lo que permite experimentar con generación de texto sin depender de API externas.
- Experimentación académica sobre fine-tuning: el tamaño reducido permite hacer LoRA o QLoRA sobre un único dispositivo de 24 GB, útil para estudiar dinámicas de ajuste sobre arquitecturas Qwen2.
- Evaluación comparativa de checkpoints de terceros: sirve como punto de control en estudios sobre calidad de modelos pequeños no documentados frente a referencias como Qwen2.5-3B o Llama-3.2-3B.
- Generación de texto offline en entornos con requisitos de privacidad: al ejecutarse localmente con llama.cpp u Ollama (previa conversión a GGUF), no requiere enviar datos a servicios externos, lo que encaja en escenarios de datos sensibles donde la calidad del modelo no sea crítica.
- Tareas auxiliares de bajo riesgo: clasificación de texto, reformateo, extracción de campos simples o resumen de fragmentos cortos, siempre con revisión humana y tras medir la tasa de error real en el dominio concreto.
- Base para destilación o investigación sobre arquitecturas: el checkpoint puede servir como inicialización en experimentos de destilación o de ajuste con datos sintéticos generados por modelos mayores.
- No se recomienda su uso en producción orientada a clientes sin una evaluación propia previa: no hay evidencia publicada de robustez, sesgos ni calidad multilingüe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye tabla de evaluaciones (MMLU, HumanEval, GSM8K, MT-Bench u otras), ni comparaciones con modelos de referencia, ni métricas de perplexity sobre validación.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los parámetros, no medido empíricamente):
  - FP16/BF16: ~6,8 GB solo para pesos; ~8-9 GB con caché KV y overhead para contextos moderados.
  - INT8: ~3,4 GB de pesos; ~5-6 GB en total.
  - INT4 (GGUF q4_K_M o AWQ/GPTQ 4 bits): ~2,0-2,3 GB de pesos; ~3,5-4,5 GB en total.
- GPU recomendadas:
  - Consumer: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 funcionan en FP16 y en cuantizaciones menores; en 8 GB cabe en INT8/INT4.
  - Profesional/datacenter: A100 40/80 GB, H100, L40S o A10G quedan sobredimensionadas para un único modelo de 3,4 B, pero permiten batchear muchas peticiones concurrentes.
- ¿Cabe en GPU de consumo? Sí: en FP16 cabe en cualquier GPU con 12 GB o más; con cuantización a 4 bits cabe en tarjetas de 6-8 GB.
- Opciones de despliegue: vLLM y TGI para servir con paged attention y batching continuo (requiere que la configuración sea compatible con las implementaciones de Qwen2); llama.cpp y Ollama tras convertir los safetensors a GGUF; transformers + bitsandbytes para prototipado rápido.
- Latencia y throughput: no disponibles. Como referencia orientativa de orden de magnitud para 3-4 B en una RTX 4090 en FP16, cabe esperar decenas de tokens por segundo por petición, pero no hay mediciones publicadas para este checkpoint concreto.

## Comparativa con modelos similares

Los datos de KiraAi-3B en contexto, licencia e idiomas no están disponibles, por lo que la comparación solo puede establecerse en tamaño y formato. Los datos de los modelos de referencia corresponden a sus especificaciones públicas y se incluyen como orientación, no como evaluación del modelo objeto de esta ficha.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| KiraAi-3B | 3,40 B | no disponible | no disponible | safetensors, sin cuantizaciones publicadas |
| Qwen2.5-3B (referencia de familia) | ~3,09 B | 32 768 tokens nativos (ampliable con YaRN) | Apache 2.0 | safetensors, GGUF, AWQ, GPTQ; muy extendido |
| Llama 3.2 3B | ~3,21 B | 128 000 tokens | Licencia comunitaria Llama 3.2 | safetensors y GGUF; amplio ecosistema |
| Phi-3.5-mini | ~3,8 B | 128 000 tokens | MIT | safetensors y GGUF; amplio ecosistema |
| Gemma 2 2B | ~2,6 B | 8 192 tokens | Licencia Gemma | safetensors y GGUF; amplio ecosistema |

Diferencias clave: frente a las alternativas, KiraAi-3B no declara licencia, no documenta contexto ni idiomas, no publica benchmarks y no ofrece artefactos cuantizados listos para usar. Cualquier decisión de adopción debería pasar por una evaluación propia.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay tarjeta de modelo con descripción, datos de entrenamiento ni límites conocidos.
- Licencia no declarada: sin licencia explícita no se puede asumir permiso de uso comercial; en la práctica, la ausencia de licencia impide usar el modelo en producción con seguridad jurídica.
- Sin benchmarks ni evaluaciones: se desconoce la calidad en razonamiento, código, matemáticas y multilingüismo; no se puede comparar con alternativas de forma objetiva.
- Riesgo de alucinación desconocido: no hay mediciones de veracidad ni de tasas de error en dominios concretos; en un modelo de 3,4 B el riesgo suele ser alto, pero no se ha cuantificado aquí.
- Idiomas no especificados: no se sabe si el modelo está entrenado en castellano; es probable un sesgo hacia el inglés si el base es Qwen2, pero no está confirmado.
- Longitud de contexto desconocida: planificar despliegues con ventanas largas sin verificar la configuración puede provocar degradación silenciosa o errores de posiciones fuera de rango.
- Sin cuantizaciones oficiales: cualquier GGUF/AWQ/GPTQ tendría que generarse y validarse internamente, con el riesgo de pérdida de calidad añadida.
- Señales de escasa madurez: 0 descargas, 1 like y un único commit de actualización el mismo día de creación; no hay historial de mantenimiento ni issues resueltas.
- Fecha de creación registrada poco habitual (2026-10-20): conviene verificar la procedencia del checkpoint antes de ejecutarlo en infraestructura propia.
- Riesgo de seguridad: al no haber sido auditado, no se descartan comportamientos dañinos o contenido no filtrado; se recomienda sandboxing y filtros de salida si se expone a usuarios.

## Enlaces

- HuggingFace: https://huggingface.co/examegd/KiraAi-3B
