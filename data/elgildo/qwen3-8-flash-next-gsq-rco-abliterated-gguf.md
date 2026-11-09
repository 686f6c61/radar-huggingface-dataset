# elgildo/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF

## Resumen

Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF es una cuantización GGUF derivada del modelo ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO, un transformer de tipo mixture-of-experts (MoE) con 176.943.899.520 parámetros totales y una ventana de contexto de 262.144 tokens. El autor de esta ficha, elgildo, no ha reentrenado ni recuantizado el modelo base: ha realizado una operación de "tensor transplant" sobre una cuantización ya existente, sustituyendo 144 tensores de proyección de escritura al residual stream en las 48 capas del modelo por los correspondientes tensores de una versión "abliterated" (sin dirección de rechazo) ya publicada.

La operación es técnicamente relevante porque preserva exactamente los valores y escalas aprendidos por GSQ (la cuantización aprendida del modelo original) y restaura la asignación de tipos por tensor de RCO (restricción de presupuesto). No se recalculó ningún tensor cuantizado de GSQ: solo se sustituyeron los pesos de proyección que codifican la dirección de rechazo, manteniendo intacto el resto de la red. El resultado es un modelo "uncensored" en formato GGUF listo para llama.cpp, con cuatro niveles de cuantización (Q2_0, IQ2_XS, IQ3_XXS e IQ3_S) y verificación blake2b por tensor en la build IQ3_S.

El modelo está pensado para tareas de red-teaming, investigación sobre alineamiento y evaluación de robustez, no para despliegue comercial convencional. Su pipeline es image-text-to-text, lo que indica capacidades multimodales, y soporta únicamente inglés y chino. La licencia es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (MoE) |
| Parámetros totales | 176.943.899.520 |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | Q2_0, IQ2_XS, IQ3_XXS, IQ3_S |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamaño del repo | 217,9 GB |
| Tamaño por tier | Q2_0: 38,0 GB; IQ3_S: 55,1 GB |
| Pipeline | image-text-to-text |
| Modelo base | ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF |
| Tensores transplantados | 144 (proyecciones de escritura al residual stream, 48 capas) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de 176.943.899.520 parámetros totales, con 48 capas según la model card. La arquitectura exacta de enrutamiento, el número de expertos y los parámetros activos por token no están disponibles en la información proporcionada. El contexto declarado es de 262.144 tokens, lo que lo sitúa en la categoría de modelos de contexto largo.

El entrenamiento original corresponde a ISTA-DASLab, que aplicó GSQ (cuantización aprendida) y RCO (asignación de tipos por tensor con restricción de presupuesto). Esta ficha no modifica ese proceso: la intervención de elgildo consiste en sustituir 144 tensores de proyección de escritura al residual stream por los de una release abliterated ya existente, preservando los valores y escalas GSQ y restaurando la asignación de tipos RCO. La build IQ3_S está verificada tensor a tensor con blake2b: solo cambiaron los tensores previstos. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de razonamiento (reasoning) declarado en los tags.
- Procesamiento image-text-to-text: acepta imágenes y texto como entrada.
- Contexto largo de hasta 262.144 tokens, adecuado para documentos extensos y conversaciones multi-turno.
- Soporte de tool calling y function calling: no disponible en la información proporcionada (no se declara explícitamente).
- Capacidades de agente: no disponible en la información proporcionada.
- Multilingüe limitado a inglés y chino.
- Modelo "abliterated" / uncensored: la dirección de rechazo ha sido eliminada, orientado a red-teaming y evaluación de robustez.
- Cuantizaciones de bajo bit (Q2_0, IQ2_XS) que permiten ejecución en hardware más modesto a costa de precisión.

## Casos de uso

- Red-teaming y evaluación de robustez: el modelo sirve para generar respuestas que un modelo alineado rechazaría, permitiendo a equipos de seguridad probar filtros, clasificadores y políticas de moderación en pipelines de producción.
- Investigación sobre alineamiento y direcciones de rechazo: al preservar los tensores GSQ y sustituir solo las proyecciones de escritura al residual stream, permite estudiar el efecto aislado de la dirección de rechazo sobre el comportamiento del modelo con el resto de la red intacta.
- Análisis de documentos largos en inglés o chino: con 262.144 tokens de contexto, puede procesar informes, expedientes o bases de código extensas en una sola pasada.
- Procesamiento multimodal de imágenes y texto: al ser image-text-to-text, puede emplearse en tareas de descripción, extracción de información o respuesta a preguntas sobre imágenes.
- Despliegue local con llama.cpp: las builds Q2_0 (38,0 GB) e IQ3_S (55,1 GB) permiten ejecución en estaciones de trabajo con suficiente VRAM o RAM, sin depender de APIs externas.
- Evaluación comparativa de cuantizaciones: los cuatro tiers publicados permiten medir la degradación de calidad entre Q2_0, IQ2_XS, IQ3_XXS e IQ3_S sobre el mismo modelo base.
- Generación de datos sintéticos para entrenamiento: en entornos controlados, puede producir corpus diversos en inglés y chino que un modelo alineado no generaría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: Q2_0 requiere al menos 38,0 GB; IQ3_S requiere al menos 55,1 GB. IQ2_XS e IQ3_XXS se sitúan entre ambos tiers, aunque sus tamaños exactos no están disponibles.
- GPU recomendadas: para IQ3_S, GPU con 80 GB (A100 80GB, H100) o configuraciones multi-GPU; para Q2_0, GPU de 48 GB (A6000, L40S) o superiores.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) en ninguno de los tiers publicados. Sería necesario repartir el modelo entre VRAM y RAM del sistema (offloading) con llama.cpp.
- Opciones de despliegue: llama.cpp es el runtime nativo del formato GGUF; también es compatible con servidores que acepten GGUF vía llama.cpp. vLLM, TGI y Ollama no están confirmados en la información proporcionada.
- Latencia y throughput: no disponibles. Al ser un MoE de 176.943.899.520 parámetros totales, el throughput dependerá del número de parámetros activos por token, dato no publicado.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La comparativa con alternativas de la misma categoría (MoE de contexto largo en GGUF) no está disponible.

## Limitaciones y advertencias

- Modelo abliterated: la eliminación de la dirección de rechazo reduce las salvaguardas del modelo base. No es adecuado para aplicaciones de cara al público sin capas adicionales de moderación.
- Riesgo de alucinación: no cuantificado en la información disponible; al ser una cuantización de bajo bit, la degradación respecto al modelo original puede aumentar el riesgo.
- Idiomas limitados a inglés y chino; no se declara soporte de castellano.
- Contexto de 262.144 tokens: no se especifica si el rendimiento se mantiene estable en toda la ventana o si decae en los extremos.
- Licencia Apache 2.0: permite uso comercial, pero el carácter uncensored traslada al desplegador la responsabilidad sobre el contenido generado y el cumplimiento normativo.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha: no hay evidencia de validación por parte de la comunidad.
- La verificación blake2b solo se declara para la build IQ3_S; no se confirma para Q2_0, IQ2_XS ni IQ3_XXS.
- El tamaño del repo (217,9 GB) implica requisitos de almacenamiento considerables para descargar todos los tiers.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/elgildo/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF
- Modelo base: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- README en chino simplificado: https://huggingface.co/SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF/blob/main/README.zh-CN.md
- Paper GSQ (referencia arXiv): https://arxiv.org/abs/2604.18556
- Paper RCO (referencia arXiv): https://arxiv.org/abs/2605.00649
