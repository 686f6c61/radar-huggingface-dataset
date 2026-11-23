# mradermacher/LiarAI-i1-GGUF

## Resumen

LiarAI-i1-GGUF es la colección de cuantizaciones GGUF generadas por mradermacher a partir del modelo base meromorphic/LiarAI, un modelo de lenguaje de aproximadamente 1.880 millones de parámetros (1,88 B) asociado a la familia Qwen 3.5 según las etiquetas del repositorio. El modelo original está pensado para tareas de generación de texto conversacional y uso como agente, y esta versión GGUF facilita su despliegue en entornos con llama.cpp, Ollama u otros runtimes compatibles con este formato, incluyendo hardware de consumo.

La relevancia de esta ficha radica en que el repositorio ofrece cuantizaciones con matrices de importancia (imatrix) en un rango muy amplio, desde IQ1_S (~0,8 GB) hasta Q6_K (~1,7 GB), lo que permite ejecutar el modelo en GPU consumer modestas o incluso en CPU. La licencia Apache 2.0 del modelo base facilita el uso comercial, aunque la información pública sobre arquitectura detallada, contexto y datos de entrenamiento es muy limitada.

No se dispone de información publicada sobre el número de tokens de entrenamiento, la composición del dataset ni resultados de benchmarks en la documentación disponible. Esta ficha recoge únicamente los datos verificables del repositorio y marca explícitamente como "no disponible" todo aquello que no se ha podido confirmar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, segun tags del repo); detalles no disponibles |
| Parametros totales | 1.881.825.088 (~1,88 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL, Q2_K_S, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (cuantizaciones i1/imatrix) |
| Idiomas soportados | Ingles (segun metadatos) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna más allá de las etiquetas que lo asocian a la familia Qwen 3.5 y a la herramienta Unsloth, lo que sugiere un transformer decoder-only derivado o afinado a partir de una base Qwen 3.5. El tamaño de 1,88 B parámetros es coherente con un modelo pequeño orientado a despliegue eficiente. No se especifican el número de capas, dimensiones ocultas, número de cabezas de atención ni el tipo exacto de atención (estándar, GQA, etc.).

Tampoco se dispone de información sobre el volumen de tokens de entrenamiento, la composición del corpus, si hubo fases de RLHF, DPO o instrucción supervisada, ni sobre innovaciones técnicas como decodificación especulativa o atención lineal. Las cuantizaciones de este repositorio se han generado con matrices de importancia (imatrix) para mejorar la calidad en tipos de baja precisión, y el autor indica que también existen cuantizaciones estáticas en un repositorio hermano.

## Capacidades

- Generación de texto conversacional en inglés.
- Uso previsto como modelo de agente (tag "agent") y compatible con endpoints.
- Etiquetado como modelo de visión en la model card del cuantizador; los ficheros mmproj, si existen, se alojan en el repositorio estático.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Razonamiento multi-paso: no confirmado explícitamente.
- Capacidades multilingües: limitadas al inglés según los metadatos.
- Modo "thinking": no disponible en la información.

## Casos de uso

- Prototipado de agentes conversacionales en local: el tamaño de 1,88 B y las cuantizaciones desde ~0,8 GB permiten ejecutar el modelo en portátiles o equipos sin GPU dedicada, ideal para iterar sobre prompts y flujos de agente antes de pasar a producción.
- Asistentes de texto en inglés para documentación técnica: el modelo puede redactar y resumir contenido en inglés con baja latencia en hardware consumer, lo que lo hace adecuado para herramientas internas de redacción.
- Despliegue en entornos con recursos limitados: las variantes IQ2/IQ3 permiten correr el modelo en dispositivos con 2-4 GB de RAM/VRAM, útil para demos o entornos embebidos.
- Clasificación y etiquetado de texto: al ser un modelo pequeño e instruido, puede emplearse para tareas de extracción y categorización en pipelines batch, siempre que el idioma sea inglés.
- Base para experimentación con cuantización: la disponibilidad de imatrix y de múltiples tipos permite estudiar el compromiso calidad/tamaño en un modelo de 1,88 B, útil para investigación en eficiencia.
- Generación de respuestas en chatbots de bajo coste: con cuantizaciones Q4_K_M (~1,4 GB) se puede servir un chatbot concurrente en una sola GPU consumer, aunque la calidad será inferior a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): ~0,8 GB (IQ1_S) a ~1,7 GB (Q6_K); añadir overhead de contexto y runtime (típicamente 0,5-1,5 GB adicionales según longitud de contexto).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.); en A100/H100 el modelo queda sobredimensionado para su capacidad.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU consumer modernas, e incluso en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y otros runtimes compatibles con GGUF; para el modelo base, transformers.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LiarAI-i1-GGUF (este) | ~1,88 B | no disponible | Apache 2.0 | GGUF | Cuantizaciones imatrix, orientado a agentes |
| Qwen2.5-1.5B-Instruct | ~1,5 B | 32 K (tipico) | Apache 2.0 | safetensors, GGUF | Referencia de la familia; contexto y benchmarks publicados |
| Llama 3.2 1B Instruct | ~1,2 B | 128 K | Llama 3.2 Community | safetensors, GGUF | Multilingüe, ampliamente soportado |
| SmolLM2-1.7B-Instruct | ~1,7 B | 8 K | Apache 2.0 | safetensors, GGUF | Enfocado en eficiencia y despliegue en dispositivo |

La comparación con Qwen2.5-1.5B y Llama 3.2 1B es orientativa: no se dispone de benchmarks de LiarAI que permitan una comparación cuantitativa directa.

## Limitaciones y advertencias

- Información pública muy escasa: no hay datos de entrenamiento, contexto ni evaluación, lo que dificulta estimar su calidad real frente a alternativas consolidadas.
- Idiomas: solo inglés según los metadatos; no se recomienda su uso en castellano u otros idiomas sin validación previa.
- Riesgo de alucinación: inherente a modelos de este tamaño; la falta de benchmarks agrava la incertidumbre.
- Sesgos: no documentados; al desconocerse la composición del dataset, no se pueden evaluar sesgos de género, raza o ideológicos.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar la procedencia del modelo base (meromorphic/LiarAI) y sus posibles restricciones adicionales.
- Cuantizaciones de muy baja precisión (IQ1/IQ2) degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate".
- Soporte de visión y tool calling no confirmado en la documentación; no asumir estas capacidades en producción sin pruebas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LiarAI-i1-GGUF
- Modelo base: https://huggingface.co/meromorphic/LiarAI
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/LiarAI-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#LiarAI-i1-GGUF
- FAQ y solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
