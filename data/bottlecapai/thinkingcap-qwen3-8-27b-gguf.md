# bottlecapai/ThinkingCap-Qwen3.8-27B-GGUF

## Resumen

ThinkingCap-Qwen3.8-27B-GGUF es la distribución cuantizada en formato GGUF del modelo ThinkingCap-Qwen3.8-27B, un ajuste fino (finetune) desarrollado por BottleCap AI sobre Qwen3.8-27B de Alibaba. El objetivo del modelo es reducir el coste computacional del razonamiento explícito: según el autor, recorta los tokens de razonamiento un 37 % de media manteniendo una precisión media del 85,8 % frente al 86,6 % del modelo base. Es, por tanto, una propuesta orientada a eficiencia en tokens más que a maximizar puntuaciones absolutas.

El repositorio contiene conversiones GGUF en cinco precisiones (IQ4_XS, Q4_K_M, Q6_K, Q8_0 y f16) más un proyector multimodal `mmproj` en f16, lo que confirma que se trata de un modelo visión-lenguaje (pipeline `image-text-to-text`) con capacidad de procesar imágenes. Los pesos se generan con matriz de importancia y un reparto de precisión por tensor que preserva las proyecciones de atención en 6-8 bits mientras comprime las capas feed-forward a 4 bits.

La relevancia actual del modelo reside en tres factores: su tamaño de 27.320.697.856 parámetros totales, que lo sitúa en la franja de modelos desplegables en una sola GPU profesional o en configuraciones de consumo con cuantización agresiva; la inclusión de la cabeza MTP (multi-token prediction) que habilita decodificación especulativa sin modelo borrador externo; y una licencia Polyform Small Business 1.0.0 que restringe el uso comercial a pequeñas empresas, un punto crítico para cualquier evaluación en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas de atención completa y atención lineal (derivada de Qwen3.8-27B); cabeza MTP para decodificación especulativa |
| Parámetros totales | 27.320.697.856 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32k tokens (según la referencia del autor al GGUF RCO de 4,2 bpw; no se especifica el contexto máximo del modelo base) |
| Tipos de cuantización | IQ4_XS (15,5 GB), Q4_K_M (17,4 GB), Q6_K (23,9 GB), Q8_0 (29,0 GB), f16 (54,7 GB); mmproj f16 (931 MB) |
| Idiomas soportados | no disponible |
| Licencia | Polyform Small Business 1.0.0 (`license: other`) |
| Formato de pesos | GGUF (llama.cpp); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer que combina capas de atención completa con capas de atención lineal, según se deduce de la descripción del layout de cuantización por tensor del autor (menciona explícitamente «attention projections of the full-attention layers» y «linear-attention output projections»). Sobre esa base, BottleCap AI aplica un finetune orientado a eficiencia de razonamiento, cuyo detalle de dataset, número de tokens y metodología de alineación (RLHF, DPO u otra) no se especifica en la información disponible.

La innovación técnica destacable es doble. Por un lado, la cabeza MTP (multi-token prediction) queda incluida en los GGUF, lo que permite decodificación auto-especulativa en llama.cpp (`--spec-type draft-mtp`) sin necesidad de un modelo borrador separado; el autor reporta aceleración de decodificación con 4 slots paralelos, aunque advierte que lotes mayores no han sido probados. Por otro, las cuantizaciones de baja precisión emplean matriz de importancia (estadísticas de activación sobre un corpus de calibración con plantilla de chat) y un reparto de precisión por tensor: las proyecciones de atención y las salidas de atención lineal se mantienen en 6-8 bits, mientras las capas feed-forward absorben la compresión a 4 bits.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat propia del modelo base.
- Razonamiento explícito en modo «thinking», con reducción medida del 37 % en tokens de razonamiento respecto al base.
- Comprensión de imágenes (visión-lenguaje) mediante el proyector multimodal `mmproj-ThinkingCap-Qwen3.8-27B-f16.gguf`, que se combina con cualquiera de las cuantizaciones de texto.
- Decodificación especulativa auto-contenida mediante la cabeza MTP integrada en los pesos.
- Compatibilidad con endpoints OpenAI (`endpoints_compatible` en los tags del repositorio).
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Capacidades de audio: no disponible.

## Casos de uso

- Asistente de razonamiento con presupuesto de tokens ajustado: el recorte del 37 % en tokens de pensamiento reduce directamente el coste por consulta en APIs y el tiempo de generación en local, con una pérdida de precisión media de 0,8 puntos porcentuales frente al base (85,8 % vs. 86,6 %). Adecuado para pipelines de clasificación razonada o extracción de datos donde el coste por token domina.
- Análisis de documentos con imágenes: gracias al proyector multimodal, el modelo puede recibir capturas, diagramas o páginas escaneadas junto con texto y responder preguntas sobre ellos. Se sirve con `llama-server --mmproj` exponiendo un endpoint compatible con OpenAI.
- Despliegue en estación de trabajo con GPU de 18 GB: la variante RCO de 4,2 bpw (14,3 GB) del autor permite ejecutar visión, MTP y contexto de 32k en una tarjeta de 18 GB, lo que habilita prototipado local de asistentes multimodales sin infraestructura cloud.
- Servicio de chat autoalojado en llama.cpp: con Q4_K_M (17,4 GB) y decodificación especulativa MTP activada, se puede montar un servidor conversacional con 4 slots paralelos en una única GPU, útil para equipos que necesitan soberanía de datos.
- Evaluación comparativa de eficiencia de razonamiento: el modelo sirve como referencia para medir el impacto de reducir tokens de pensamiento en tareas de GPQA-Diamond, MMLU-Pro y AA-LCR, ya que el autor publica resultados multi-semilla con tests estadísticos en la model card principal.
- Integración en LM Studio, Jan u Ollama para uso de escritorio: el `mmproj` se autodetecta en LM Studio y habilita el botón de imagen, lo que facilita demos internas de visión-lenguaje sin escribir código.
- Fine-tuning posterior sobre dominio específico: al disponer de pesos f16 en GGUF y del modelo base en safetensors, es viable partir del base para ajustes con licencia Polyform Small Business en empresas que cumplan el umbral de la licencia.

## Benchmarks y rendimiento

Los datos publicados por el autor en la información disponible son agregados y parciales. Se indica una precisión media del 85,8 % para ThinkingCap frente al 86,6 % del modelo base, y diferencias observadas en cuantizaciones respecto a bf16 sobre cinco benchmarks evaluados: IQ4_XS y Q6_K puntúan 2,8 pp menos en GPQA-Diamond; Q6_K puntúa 1,7 pp más en MMLU-Pro y 7,0 pp menos en AA-LCR. No se proporcionan las puntuaciones absolutas por benchmark ni comparaciones con modelos de terceros.

| Métrica | ThinkingCap | Base Qwen3.8-27B | Notas |
|---|---|---|---|
| Precisión media (5 benchmarks) | 85,8 % | 86,6 % | Reducción de tokens de razonamiento del 37 % |
| GPQA-Diamond (IQ4_XS vs bf16) | −2,8 pp | referencia bf16 | Diferencia observada, no demostrada sin pérdida |
| GPQA-Diamond (Q6_K vs bf16) | −2,8 pp | referencia bf16 | Diferencia observada |
| MMLU-Pro (Q6_K vs bf16) | +1,7 pp | referencia bf16 | Diferencia observada |
| AA-LCR (Q6_K vs bf16) | −7,0 pp | referencia bf16 | Diferencia observada |

No se han publicado en la información disponible las puntuaciones absolutas de MMLU, HumanEval, GSM8K ni de benchmarks de visión, ni comparativas numéricas con modelos de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: IQ4_XS ≈ 15,5 GB de pesos más overhead de contexto y KV cache; Q4_K_M ≈ 17,4 GB; Q6_K ≈ 23,9 GB; Q8_0 ≈ 29,0 GB; f16 ≈ 54,7 GB. Añadir ~931 MB si se carga el proyector de visión.
- GPU recomendadas: A100 40/80 GB o H100 para f16 y Q8_0 con contexto largo; RTX 6000 Ada / L40S (48 GB) para Q8_0; RTX 4090 (24 GB) para Q6_K con contexto moderado; GPUs de 18 GB para la variante RCO de 4,2 bpw con visión, MTP y 32k de contexto.
- Cabe en GPU de consumo: sí, con IQ4_XS o Q4_K_M en tarjetas de 24 GB (RTX 3090/4090) y con la variante RCO de 4,2 bpw en 18 GB.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`, `llama-mtmd-cli`), Ollama, LM Studio, Jan y cualquier runtime compatible con GGUF que soporte la arquitectura. Para MTP se requiere llama.cpp v0.4.1 o superior; runtimes anteriores pueden rechazar la carga con error `missing tensor blk.64…`.
- Latencia y throughput: no se publican cifras absolutas. El autor indica que la decodificación especulativa MTP acelera la generación con 4 slots paralelos; lotes mayores no han sido probados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ThinkingCap-Qwen3.8-27B-GGUF | 27,3 B | 32k (referencia del autor) | Polyform Small Business 1.0.0 | GGUF | Visión, MTP, −37 % tokens de razonamiento, 85,8 % precisión media |
| Qwen3.8-27B (base) | 27,3 B | no disponible | licencia de Qwen (no detallada aquí) | safetensors | Referencia de precisión: 86,6 % media |
| ThinkingCap-Qwen3.8-27B-GGUF-RCO-4.2bpw | 27,3 B | 32k | Polyform Small Business 1.0.0 | GGUF mixto | 14,3 GB, 4,19 bpw, visión + MTP en 18 GB |

No se dispone en la información proporcionada de comparativas con modelos de otros fabricantes del mismo tamaño (por ejemplo, variantes de 24-32 B de otras familias), por lo que la comparación se limita a las variantes del propio autor y al modelo base.

## Limitaciones y advertencias

- Licencia Polyform Small Business 1.0.0: restringe el uso comercial; es imprescindible verificar que la organización cumple los umbrales de «small business» antes de desplegar en producción. El acceso al modelo requiere aceptar una compuerta (gated) con datos de empresa y correo.
- La reducción de tokens de razonamiento implica una pérdida de precisión media de 0,8 pp frente al base; en tareas sensibles a la exactitud (GPQA-Diamond, AA-LCR) las cuantizaciones pueden perder hasta 7 pp respecto a bf16, según las diferencias observadas por el autor.
- Ninguna cuantización está demostrada como sin pérdida: el propio autor advierte que las diferencias son observadas y no se garantiza equivalencia con bf16.
- Decodificación greedy puede entrar en bucles; es necesario mantener la temperatura recomendada en la model card principal y no usar decodificación determinista.
- La cabeza MTP solo acelera con 4 slots paralelos y no se ha probado con lotes mayores; runtimes antiguos fallan al cargar el archivo.
- Riesgo de alucinación: no se documentan tasas de alucinación ni evaluaciones de veracidad en la información disponible.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles; no se puede asumir calidad multilingüe sin evaluación.
- El contexto máximo real del modelo base no se especifica; la cifra de 32k aparece asociada a la variante RCO, no al conjunto de cuantizaciones.
- El repositorio ocupa 141,4 GB, por lo que descargar todas las variantes requiere planificación de almacenamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B-GGUF
- Modelo base (finetune): https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante mixta para 18 GB: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B-GGUF-RCO-4.2bpw
- Sitio del autor: https://www.bottlecapai.com/
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Especificación GGUF: https://github.com/ggml-org/ggml/blob/master/docs/gguf.md
- Formulario de acceso/contacto del autor: https://docs.google.com/forms/d/e/1FAIpQLSdU8MyVP_mVx0_y55d6QCMXVyCKsQ6yg68KEqWm_EIptKB0Nw/viewform
