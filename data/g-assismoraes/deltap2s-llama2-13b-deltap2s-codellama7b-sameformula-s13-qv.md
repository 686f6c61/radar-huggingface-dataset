# g-assismoraes/DeltaP2S-Llama2-13B-DeltaP2S-CodeLlama7B-SameFormula-S13-QV

## Resumen

El modelo `g-assismoraes/DeltaP2S-Llama2-13B-DeltaP2S-CodeLlama7B-SameFormula-S13-QV` es un checkpoint resultante de un experimento de fusión de modelos denominado Delta-P2S (también referido como "pen2sword"). Lo desarrolla el usuario g-assismoraes y se publica en Hugging Face como un artefacto de investigación, no como un modelo listo para producción. El nombre sugiere que combina pesos de Llama2-13B y CodeLlama7B mediante una fórmula específica (SameFormula-S13-QV), aunque la documentación disponible no detalla el método exacto.

Con 13.015.864.320 parámetros, se trata de un modelo de tamaño medio-grande, en la línea de Llama2-13B. La arquitectura subyacente es transformer (familia Llama), pero no se especifican detalles como la longitud de contexto, el número de capas o el vocabulario. La licencia no está indicada, lo que limita su uso comercial sin consultar al autor. Su relevancia actual es principalmente experimental: sirve para estudiar técnicas de fusión de pesos (merging) entre modelos de distinta escala y especialización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Llama) |
| Parametros totales | 13.015.864.320 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer basado en Llama, probablemente con el mismo diseño que Llama2-13B (32 capas, 5120 dimensiones ocultas, 40 cabezas de atención). El modelo se genera mediante un proceso de fusión de pesos (merging) entre un modelo base Llama2-13B y CodeLlama7B, aplicando una fórmula denominada "SameFormula-S13-QV" dentro del paquete experimental Delta-P2S. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de RLHF o DPO. Al ser un checkpoint de un experimento, es probable que no haya pasado por un entrenamiento completo, sino que se obtiene por interpolación o combinación de pesos de los modelos originales.

## Capacidades

- Generación de texto: al estar basado en Llama2 y CodeLlama, debería heredar capacidades de generación de lenguaje natural y código, aunque no hay evidencia empírica publicada.
- Razonamiento y matemáticas: no hay benchmarks que lo confirmen; se espera un comportamiento similar a Llama2-13B.
- Generación de código: la inclusión de CodeLlama7B sugiere cierta especialización en código, pero sin datos de evaluación.
- Multilingüismo: no se especifican idiomas; Llama2 soporta principalmente inglés y algo de otros idiomas, pero no hay confirmación.
- Tool calling / function calling: no se menciona soporte explícito.
- Agentes y multi-step reasoning: no se menciona.
- Capacidades especiales (vision, audio, thinking mode): no se mencionan.

## Casos de uso

- Investigación en fusión de modelos: el modelo sirve como artefacto para estudiar cómo la combinación de pesos de Llama2-13B y CodeLlama7B afecta al rendimiento en tareas de lenguaje y código. Un investigador podría cargarlo con transformers y comparar sus salidas con los modelos base.
- Experimentos de interpolación de pesos: dado que es un checkpoint de Delta-P2S, se puede utilizar para analizar la evolución de las representaciones internas durante el proceso de fusión.
- Pruebas de compatibilidad con librerías de inferencia: al estar en formato safetensors, se puede probar su carga en vLLM, llama.cpp u otras herramientas para verificar si el merging produce pesos válidos.
- Generación de código en entornos controlados: si el modelo funciona correctamente, podría usarse para tareas de autocompletado o generación de snippets, aunque sin garantías de calidad.
- Fine-tuning posterior: los pesos fusionados podrían servir como punto de partida para fine-tuning en tareas específicas, aunque la falta de licencia clara complica su uso comercial.
- Evaluación comparativa de técnicas de merging: se puede comparar este checkpoint con otras variantes (P2S, DeltaP2S) para determinar cuál fórmula produce mejores resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se comparan con modelos similares en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 13B en FP16 se necesitan aproximadamente 26 GB de VRAM (solo pesos). Con cuantización a 8 bits se reduce a ~13 GB, y a 4 bits a ~7 GB, pero no se ofrecen cuantizaciones en el repo.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) podría cargar el modelo en FP16 con margen limitado; una A100 (40 GB) o H100 (80 GB) son más adecuadas para inferencia cómoda.
- Si cabe en consumer GPU: sí, en una RTX 3090/4090 con cuantización a 8 bits o 4 bits, aunque no se proporcionan archivos GGUF.
- Opciones de despliegue: al ser un modelo transformers estándar, se puede servir con vLLM, Text Generation Inference (TGI), o cargar con llama.cpp si se convierte a GGUF. FriendliAI aparece en los resultados de búsqueda como plataforma de despliegue.
- Latencia y throughput: no se conocen datos específicos; dependerá del hardware y la optimización.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. Los modelos base (Llama2-13B y CodeLlama7B) son los referentes naturales, pero este checkpoint es un experimento de fusión, no un modelo entrenado desde cero. Se podría comparar con otros checkpoints de merging de la misma familia (por ejemplo, las variantes P2S y DeltaP2S publicadas por el mismo autor), pero no hay datos de rendimiento. Por tanto, la comparativa se limita a indicar que no hay datos disponibles.

## Limitaciones y advertencias

- Sesgos conocidos: al derivar de Llama2 y CodeLlama, hereda los sesgos de esos modelos, que incluyen estereotipos y contenido potencialmente dañino.
- Riesgo de alucinacion: no se ha evaluado; es probable que presente alucinaciones similares a Llama2-13B.
- Limitaciones de contexto o idioma: no se especifica la longitud de contexto; probablemente sea 4096 tokens (como Llama2), pero no está confirmado. El soporte de idiomas es incierto.
- Restricciones de licencia: la licencia no está indicada, lo que impide su uso comercial sin autorización explícita del autor.
- Caveat para produccion: es un checkpoint experimental sin validación; no se recomienda su uso en entornos productivos sin una evaluación exhaustiva.
- Falta de documentación: la model card es mínima y no detalla el proceso de fusión, los hiperparámetros ni los datos de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/g-assismoraes/DeltaP2S-Llama2-13B-DeltaP2S-CodeLlama7B-SameFormula-S13-QV
- Variante P2S (misma fórmula): https://huggingface.co/g-assismoraes/DeltaP2S-Llama2-13B-P2S-CodeLlama7B-SameFormula-S13-QV
- Variante sin QV: https://huggingface.co/g-assismoraes/DeltaP2S-Llama2-13B-P2S-CodeLlama7B-SameFormula
- Página en FriendliAI (despliegue): https://friendli.ai/models/g-assismoraes/DeltaP2S-Llama2-13B-DeltaP2S-CodeLlama7B-SameFormula-S13
- Repositorio de llama.cpp (para posible conversión a GGUF): https://github.com/ggml-org/llama.cpp
