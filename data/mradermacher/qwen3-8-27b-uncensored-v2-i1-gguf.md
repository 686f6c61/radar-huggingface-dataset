# mradermacher/Qwen3.8-27B-Uncensored-v2-i1-GGUF

## Resumen

Qwen3.8-27B-Uncensored-v2-i1-GGUF es una redistribución en formato GGUF del modelo InterpreticAI/Qwen3.8-27B-Uncensored-v2, publicada por el usuario mradermacher, especializado en cuantización de modelos abiertos. El modelo original es un fine-tune de la familia Qwen3.8 con 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) y orientación explícita a la eliminación de censura política ("political-censorship" en las etiquetas). Esta versión concreta emplea cuantización con matriz de importancia (imatrix), lo que permite obtener archivos de menor tamaño con una degradación de calidad más controlada que la cuantización estática convencional.

El interés de esta ficha radica en dos aspectos. Primero, es un ejemplo de la cadena de distribución comunitaria de modelos: el autor original (InterpreticAI) produce el fine-tune, y mradermacher genera las variantes GGUF para inferencia local. Segundo, el modelo declara capacidades de visión (la model card indica explícitamente "This is a vision model"), lo que lo sitúa en la categoría de modelos multimodales de tamaño medio. La licencia Apache 2.0 facilita su uso comercial, aunque el contenido del fine-tune (descensurado) introduce consideraciones de gobernanza que el despliegue en producción debe evaluar.

La información disponible es limitada: no hay benchmarks publicados, no se especifica la longitud de contexto ni la composición del dataset de entrenamiento, y el modelo cuenta con cero descargas y cero likes en el momento de la consulta. Por tanto, esta ficha distingue sistemáticamente entre datos verificados y datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8; detalles específicos de atención no disponibles) |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_M, i1-Q4_K_S (imatrix); cuantizaciones estáticas adicionales en el repo hermano (Q2_K_S, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con archivo imatrix separado); el modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a la familia Qwen3.8, un transformer decoder-only de aproximadamente 27,3 mil millones de parámetros. No se dispone de información detallada sobre el número de capas, dimensión oculta, número de cabezas de atención ni tipo de atención (estándar, GQA, atención lineal o híbrida). La model card del repositorio GGUF no documenta estos extremos, y el modelo base InterpreticAI/Qwen3.8-27B-Uncensored-v2 tampoco aporta esa información en los datos disponibles.

Respecto al entrenamiento, solo consta que se trata de un fine-tune del modelo base Qwen3.8-27B con un proceso de descensurado orientado a eliminar restricciones de contenido político. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o fine-tuning supervisado. La cuantización imatrix de mradermacher se genera calculando una matriz de importancia a partir de un corpus de calibración (el archivo .imatrix.gguf de 0,1 GB), lo que permite asignar más bits a los tensores con mayor impacto en la perplejidad. Esta es la única innovación técnica documentada en el repositorio.

## Capacidades

- Generación de texto conversacional en inglés, con pipeline declarado "conversational".
- Procesamiento de imágenes: la model card indica explícitamente que es un modelo de visión; los archivos mmproj (proyector multimodal) se alojan en el repositorio estático hermano, no en este.
- Modo descensurado: el fine-tune está diseñado para reducir el rechazo de peticiones relacionadas con contenido político y otros temas sujetos a filtros en el modelo base.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere integración con la infraestructura de Inference Endpoints de Hugging Face.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Modo thinking: no disponible (no documentado).

## Casos de uso

- Investigación sobre alineación y censura en LLM: el modelo permite estudiar empíricamente cómo un fine-tune descensurado modifica las distribuciones de respuesta frente a temas políticamente sensibles, comparándolo con el Qwen3.8 base. Es adecuado porque su propósito declarado es precisamente ese, y la licencia Apache 2.0 facilita la experimentación académica.
- Despliegue local en estaciones de trabajo con GPU de consumo: las variantes i1-Q4_K_S (15,9 GB) e i1-IQ3_M (12,9 GB) caben en GPUs con 16-24 GB de VRAM, permitiendo ejecutar un modelo de 27 B en hardware asequible mediante llama.cpp u Ollama.
- Análisis de documentos con componente visual: al ser un modelo de visión, puede emplearse para extracción de información de capturas, gráficos o documentos escaneados, siempre que se cargue el mmproj correspondiente del repositorio estático.
- Generación de contenido editorial sin filtros temáticos: para redacción de artículos, guiones o ficción que aborden temas políticos o controvertidos sin los rechazos típicos de modelos alineados, con revisión humana obligatoria por el riesgo de alucinación.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece una matriz de cuantizaciones (desde IQ1_S hasta Q6_K) que permite medir la degradación de perplejidad y calidad en función del tamaño, útil para estudiar técnicas de cuantización con imatrix.
- Prototipado de asistentes conversacionales en inglés en entornos con requisitos de privacidad: al ejecutarse localmente con GGUF, los datos no salen del dispositivo, lo que encaja en escenarios con datos sensibles que no pueden enviarse a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - i1-Q2_K (11,0 GB): ~12 GB de VRAM.
  - i1-IQ3_M (12,9 GB): ~14 GB de VRAM.
  - i1-Q4_K_S (15,9 GB): ~17 GB de VRAM.
  - Cuantizaciones superiores del repo estático (Q5_K_M, Q6_K) requieren previsiblemente más de 20 GB.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB, H100 80 GB para las variantes de mayor precisión. Para i1-Q2_K e i1-IQ3_M, GPUs de 16 GB como RTX 4080 o RTX 4060 Ti 16 GB pueden ser suficientes.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantizaciones Q4_K_S o inferiores; en GPUs de 16 GB con IQ3_M o Q2_K.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, vLLM o TGI (aunque este repositorio concreto solo contiene GGUF).
- Latencia y throughput estimados: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-v2-i1-GGUF (este) | ~27,3 B | no disponible | Apache 2.0 | GGUF (imatrix) | Fine-tune descensurado con visión |
| InterpreticAI/Qwen3.8-27B-Uncensored-v2 (base) | ~27,3 B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| mradermacher/Qwen3.8-27B-Uncensored-v2-GGUF | ~27,3 B | no disponible | Apache 2.0 | GGUF (estático) | Misma base, cuantización sin imatrix |

No se dispone de datos de benchmarks que permitan comparar el rendimiento con alternativas de la misma categoría (por ejemplo, otros modelos descensurados de ~27 B). La comparativa se limita a variantes del mismo modelo.

## Limitaciones y advertencias

- El fine-tune está diseñado explícitamente para eliminar la censura política; esto implica un mayor riesgo de generar contenido dañino, sesgado o difamatorio sin filtros, y requiere políticas de moderación propias en producción.
- Riesgo elevado de alucinación: no hay benchmarks que validen la fidelidad factual del modelo, y el proceso de descensurado puede degradar la calibración del modelo base.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Licencia Apache 2.0 permite uso comercial, pero el despliegue de un modelo descensurado conlleva responsabilidad legal sobre el contenido generado; conviene revisar las políticas de la plataforma de distribución y la normativa aplicable (por ejemplo, el Reglamento de IA de la UE).
- El repositorio tiene cero descargas y cero likes, y fue creado y actualizado el mismo día (2026-11-01): no hay evidencia de validación comunitaria ni de calidad contrastada.
- Los archivos mmproj para la funcionalidad de visión no están en este repositorio, sino en el estático; un despliegue multimodal requiere descargarlos por separado.
- No se documentan sesgos específicos del fine-tune; se recomienda evaluar con conjuntos de prueba propios antes de cualquier uso en producción.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-v2-i1-GGUF
- Modelo base: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-v2-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-Uncensored-v2-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de perplejidad por cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
