# Prannesshkva/OmniKimi-504M

## Resumen

OmniKimi-504M es un modelo fundacional multimodal any-to-any de 504 millones de parámetros desarrollado por Prannesshkva. Procesa simultáneamente texto, imágenes y audio (mel spectrograms) a través de un backbone híbrido que combina Mamba-2 State Space Duality (SSD), atención multi-cabeza con RoPE y un mecanismo de mezcla de expertos (MoE) con enrutamiento semántico contrastivo. Su objetivo es unificar la generación y comprensión de múltiples modalidades en un único modelo, evitando la necesidad de encadenar sistemas separados.

La arquitectura de 24 capas intercala capas de Mamba-2 SSD (en las posiciones 0, 6, 12 y 18) con capas de atención KDA (Kimi Delta Attention) basada en RoPE, y todas las capas incorporan un MoE de 8 expertos con gating top-2. Un módulo AnyToAnyFusionHub comprime las representaciones de cualquier modalidad en 32 tokens latentes mediante cross-attention, y los OmniDecoders generan salidas de píxeles (768 dimensiones) y mel (80 dimensiones) con conexiones skip tipo U-Net. El modelo está entrenado en inglés y liberado bajo licencia Apache 2.0.

Su relevancia actual radica en demostrar que un modelo de tamaño contenido puede manejar tareas any-to-any con un consumo de VRAM muy bajo (~882 MB en bfloat16), lo que lo hace viable para hardware de consumo. Aunque su entrenamiento multimodal es limitado (solo 100 pasos de alineación), la innovación arquitectónica y la eficiencia computacional lo convierten en un caso de estudio interesante para la comunidad de IA open source.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Mamba-2 SSD (4 capas) + KDA Attention con RoPE (20 capas) + Contrastive Semantic MoE (8 expertos, top-2) |
| Parametros totales | 504.429.976 |
| Parametros activos | No disponible (MoE con top-2, pero sin desglose de activos) |
| Longitud de contexto | No disponible (Mamba-2 sugiere contexto largo, pero no se especifica) |
| Tipos de cuantizacion | bfloat16 (referencia en benchmarks); otros no disponibles |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

OmniKimi-504M emplea un backbone híbrido de 24 capas donde las capas 0, 6, 12 y 18 utilizan Mamba-2 SSD, un modelo de espacio de estados con complejidad lineal O(N) que comprime el estado sin coste cuadrático de atención. Las 20 capas restantes usan KDA Attention, una atención multi-cabeza estándar con RoPE implementada mediante `scaled_dot_product_attention` de PyTorch (FlashAttention-2 cuando está disponible). Todas las capas incorporan un MoE de 8 expertos con enrutamiento top-2 basado en similitud coseno con centroides ortogonales inicializados en la variedad de Stiefel, lo que garantiza separación geométrica. Se aplican dos pérdidas auxiliares: balanceo de carga y penalización de ortogonalidad.

El entrenamiento se realizó en tres etapas: L1 de modelado de lenguaje solo texto (bootstrap), L2 de alineación multimodal con 100 pasos (reducción de pérdida de 13.49 a 1.53, un 88.7% de mejora), y una expansión de expertos de dimensión 512 a 696 preservando las submatrices entrenadas. Los OmniDecoder heads (visión y audio) contienen pesos aleatorios en sus dimensiones expandidas, lo que indica que la generación multimodal no está completamente entrenada. El modelo reporta una entropía de enrutamiento de 2.0792 nats (99.99% del máximo teórico), sin colapso de expertos, y un error de ortogonalidad de centroides de 4.34 × 10⁻⁶.

## Capacidades

- Generación de texto: modelado de lenguaje estándar con vocabulario de 50304 tokens.
- Comprensión y generación multimodal any-to-any: procesa texto, imágenes (parches Conv2D de 224×224) y audio (mel spectrograms de 80 bins) en una única pasada.
- Fusión de modalidades: el AnyToAnyFusionHub comprime tokens de cualquier modalidad a 32 tokens latentes mediante cross-attention (compresión 13.9×).
- Generación de imágenes y audio: los OmniDecoders con conexiones skip U-Net producen salidas de píxeles (768 dim) y mel (80 dim).
- Enrutamiento MoE eficiente: 8 expertos con top-2 gating, sin colapso de expertos.
- Eficiencia computacional: complejidad lineal para el estado gracias a Mamba-2, con escalado de 1.89× por cada 2× de tokens.

## Casos de uso

- Prototipado de asistentes multimodales: al ser ligero (504M parámetros) y requerir ~882 MB de VRAM, se puede desplegar en portátiles con GPU de 4 GB para experimentar con interacciones texto-imagen-audio sin infraestructura costosa.
- Investigación en arquitecturas híbridas SSM-MoE: sirve como banco de pruebas para estudiar la interacción entre Mamba-2 y atención tradicional, así como el enrutamiento MoE con centroides ortogonales.
- Generación de descripciones de imágenes: el modelo puede tomar una imagen como entrada y producir texto descriptivo, aunque la calidad depende del entrenamiento limitado.
- Análisis de audio a texto: convierte mel spectrograms en texto, útil para tareas de transcripción o etiquetado acústico en entornos de bajos recursos.
- Educación y divulgación: su código personalizado (`custom_code`) y su arquitectura documentada permiten a estudiantes y desarrolladores aprender sobre modelos any-to-any y MoE.
- Evaluación de técnicas de expansión de expertos: el historial de entrenamiento con expansión de 512 a 696 dimensiones ofrece un caso real para estudiar la transferencia de pesos en MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card reporta métricas de rendimiento en una RTX 3050 Laptop GPU (4 GB VRAM) con precisión bfloat16:

| Metrica | Valor |
|---|---|
| Precision | bfloat16 |
| Tamano en disco | 1.01 GB |
| Pico de VRAM (forward multimodal) | ~882 MB |
| Throughput de decodificacion | 8.6–9.6 tokens/s |
| Escalado Mamba-2 | 1.89× por cada 2× tokens |
| Entropia de enrutamiento MoE | 2.0792 / 2.0794 nats |
| Error de ortogonalidad de centroides | 4.34 × 10⁻⁶ |
| Latencia de fusion multimodal | 2.97 ms |

## Requisitos de hardware

- VRAM estimada: ~882 MB en bfloat16 para forward multimodal, según la model card. Esto permite ejecución en GPUs de consumo con 4 GB o más.
- GPU recomendadas: RTX 3050 Laptop (4 GB) validada; cualquier GPU con ≥4 GB VRAM y soporte bfloat16 (serie RTX 20+, AMD RX 6000+ o Apple Silicon) debería funcionar.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de portátil de gama baja y en la mayoría de GPUs de escritorio modernas.
- Opciones de despliegue: el modelo usa código personalizado (`custom_code`) y requiere importar el módulo `omni_kimi_ssm`. No se menciona soporte para vLLM, llama.cpp u Ollama; el despliegue se realiza mediante el script de ejemplo con PyTorch y safetensors.
- Latencia y throughput: 8.6–9.6 tokens/s de decodificación en RTX 3050 Laptop; la latencia de fusión multimodal es de 2.97 ms.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables directamente en la información proporcionada. OmniKimi-504M se posiciona como un modelo multimodal any-to-any de tamaño pequeño, pero no hay datos de modelos de la misma categoría (por ejemplo, otros modelos SSM-MoE multimodales) con los que comparar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Entrenamiento multimodal limitado: solo 100 pasos de alineación en la etapa L2, lo que probablemente resulta en una calidad baja para generación de imágenes y audio.
- Pesos aleatorios en los OmniDecoder heads: las dimensiones expandidas de los decodificadores de visión y audio no están entrenadas, por lo que las salidas generativas multimodales pueden ser incoherentes.
- Solo inglés: no soporta otros idiomas, lo que limita su uso en aplicaciones multilingües.
- Longitud de contexto no especificada: aunque Mamba-2 ofrece contexto largo, no se documenta el valor máximo, lo que dificulta planificar su uso en tareas de contexto extenso.
- Sin benchmarks estándar: no hay resultados de MMLU, HumanEval u otras pruebas, por lo que no se puede evaluar su rendimiento frente a modelos establecidos.
- Código personalizado: requiere `custom_code` y el módulo `omni_kimi_ssm`, lo que puede complicar la integración con herramientas estándar del ecosistema HuggingFace.
- Riesgo de alucinación y sesgos: al ser un modelo pequeño entrenado en un conjunto de datos no documentado, puede presentar alucinaciones y sesgos no caracterizados.
- Descargas y adopción nulas: el modelo tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- [HuggingFace - OmniKimi-504M](https://huggingface.co/Prannesshkva/OmniKimi-504M)
- [Perfil del autor - Prannessh KVA](https://prannesshkva.vercel.app/posts.html)
- [GitHub del autor](https://github.com/prannesshkva)
