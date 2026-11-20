# reaperdoesntknow/Disctil-Qwen3-1.7B

## Resumen

Disctil-Qwen3-1.7B es un ajuste fino por supervisión (SFT) del modelo reaperdoesntknow/DiStil-Qwen3-1.7B-uncensored, que a su vez deriva de la familia Qwen3 de Alibaba. Lo desarrolla reaperdoesntknow, cuenta asociada a Convergent Intelligence LLC: Research Division, dentro de su colección DistilQwen. El modelo resuelve la adaptación conversacional de un modelo destilado de 1.700 millones de parámetros pensado para despliegue en el borde (edge), y resulta relevante por su tamaño reducido (2.031.739.904 parámetros reales según safetensors, unos 4,1 GB en pesos BF16) y por formar parte de una cadena de destilación documentada con material teórico propio.

La arquitectura subyacente es la de Qwen3 (transformer decoder-only denso), aunque la model card no detalla capas, cabezas ni dimensiones ocultas. El entrenamiento se realizó con TRL 0.29.1, Transformers 5.0.0, PyTorch 2.10.0+cu128, Datasets 4.0.0 y Tokenizers 0.22.2, sobre GPUs H100 según la documentación del portfolio. La model card incorpora además una sección teórica sobre "Discrepancy Calculus (DISC)" que el autor presenta como marco matemático de refinamiento de pesos, sin evidencia empírica publicada que lo respalde.

El modelo se publica con la etiqueta generated_from_trainer, sft y distillation, y está marcado como compatible con text-generation-inference y endpoints. La licencia no está disponible de forma explícita en la información proporcionada, lo que supone un riesgo relevante para uso comercial. El idioma no está declarado, aunque al derivar de Qwen3 cabe esperar soporte multilingüe amplio, no confirmado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3, densa); detalles de capas no disponibles |
| Parametros totales | 2.031.739.904 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la model card; al ser safetensors BF16 es cuantizable a GGUF/AWQ/GPTQ con herramientas estándar, pero no se documenta |
| Idiomas soportados | No disponible (herencia de Qwen3 no confirmada por el autor) |
| Licencia | No disponible |
| Formato de pesos | safetensors (repo de 4,1 GB) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino SFT sobre DiStil-Qwen3-1.7B-uncensored, que pertenece a la cadena de destilación DistilQwen del mismo autor. Según la documentación del portfolio, esa cadena parte de Qwen3-30B-A3B como profesor y destila a 1.7B y 0.6B en BF16 sobre H100, con tres variantes de profesor (Instruct, Thinking, Coder). No se especifican el número de tokens de entrenamiento, la composición del dataset SFT ni si hubo etapas de RLHF o DPO; solo se confirma el uso de TRL con SFT.

La model card incluye una sección titulada "Mathematical Foundations: Discrepancy Calculus (DISC)" que describe un operador de discrepancia y una "Mesh Fundamental Identity" aplicada al espacio de pesos. Se trata de una formulación teórica propia del autor (paper "On the Formal Analysis of Discrepancy Calculus", CIx 2026) sin validación independiente publicada en la información disponible. No se documentan innovaciones de inferencia como decodificación especulativa, atención lineal ni modos de pensamiento explícitos en este modelo concreto.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a diálogo (pipeline text-generation y formato de chat con roles).
- Ajuste fino SFT sobre un modelo destilado, lo que sugiere capacidad de razonamiento y código heredada del profesor Qwen3-30B-A3B, aunque no verificada en benchmarks.
- Compatibilidad declarada con text-generation-inference y endpoints, lo que facilita despliegue como API.
- Soporte de tool calling y function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no declaradas; presumible herencia de Qwen3, sin confirmar.
- Capacidades especiales (thinking mode, visión, audio): no documentadas.

## Casos de uso

- Asistente conversacional en el borde: con 2.031 millones de parámetros y pesos BF16 de 4,1 GB, puede ejecutarse en GPUs de consumo y en dispositivos con memoria limitada, gestionando diálogos multi-turno mediante el pipeline de transformers mostrado en la model card.
- Prototipado rápido de chatbots: la integración directa con `transformers.pipeline` y el formato de roles permiten montar un prototipo en pocas líneas de código sin infraestructura dedicada.
- Despliegue como endpoint compatible con TGI: la etiqueta endpoints_compatible y text-generation-inference facilita servirlo detrás de una API HTTP para aplicaciones web o móviles.
- Generación de texto en entornos con restricciones de privacidad: al ser un modelo pequeño y desplegable localmente, permite procesar texto sin enviar datos a APIs externas.
- Filtrado y clasificación de texto conversacional: su tamaño permite procesar lotes grandes en CPU o GPU modesta para tareas de etiquetado, resumen corto o reescritura.
- Base para ajustes finos posteriores: al ser un SFT sobre un destilado, sirve como punto de partida para especializaciones verticales con TRL, aprovechando su bajo coste de entrenamiento.
- Experimentación académica en destilación: útil para reproducir o comparar cadenas de destilación profesor-alumno con presupuesto de hardware reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4,1 GB de pesos más overhead de activaciones y KV cache; en la práctica, unos 5-6 GB para contextos cortos.
- VRAM estimada en cuantización 8 bits: en torno a 2,2-2,5 GB; en 4 bits (GGUF Q4_K_M), aproximadamente 1,2-1,5 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para BF16 (RTX 3060, RTX 4060, RTX 4090); A100 y H100 sobredimensionadas para este tamaño, útiles solo para servir muchas réplicas o fine-tuning.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB e incluso en GPUs de 8 GB con cuantización.
- Opciones de despliegue: transformers (soportado oficialmente), text-generation-inference (etiqueta declarada), llama.cpp/Ollama mediante conversión a GGUF (no documentado por el autor), vLLM (compatible con arquitectura Qwen3, no verificado para este checkpoint).
- Latencia y throughput: no disponibles; por tamaño, cabe esperar decenas de tokens por segundo en GPUs de consumo y cientos en A100/H100 con batching, pero son estimaciones no medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Disctil-Qwen3-1.7B | 2.031.739.904 | No disponible | No disponible | Hugging Face, 2.080 descargas |
| DiStil-Qwen3-1.7B-uncensored (modelo base) | ~1.700 millones (presumible) | No disponible | No disponible | Hugging Face, 1.602 descargas |
| Qwen3-1.7B (original de Alibaba) | ~1.700 millones | No disponible en esta ficha | Apache 2.0 (habitual en Qwen3) | Hugging Face, ampliamente distribuido |
| Qwen3-1.7B-Coder-Distilled-SFT (mismo autor) | ~1.700 millones | No disponible | No disponible | Hugging Face, 1.677 descargas |

La comparativa con el Qwen3-1.7B original es la más relevante: este modelo añade una etapa de destilación desde Qwen3-30B-A3B y un SFT conversacional, pero carece de benchmarks publicados y de licencia clara, mientras que el original de Alibaba cuenta con evaluación pública y licencia Apache 2.0. Frente a otros modelos del mismo autor, las diferencias son de especialización (Coder, Thinking, uncensored) sin datos comparativos de rendimiento.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial; contactar con el autor antes de integrarlo en producción.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad frente al Qwen3-1.7B original ni frente a otros destilados.
- Procedencia de un modelo "uncensored": el modelo base está etiquetado como sin censura, lo que aumenta el riesgo de generar contenido inapropiado, sesgado o dañino sin filtros.
- Riesgo de alucinación: por su tamaño (2.031 millones de parámetros) y por la destilación, la fiabilidad factual es limitada; no apto para tareas críticas sin verificación.
- Contexto no documentado: se desconoce la ventana máxima; asumir contextos cortos (probablemente 32K según Qwen3, sin confirmar) y validar antes de usarlo con documentos largos.
- Idiomas no declarados: no hay garantía de calidad fuera del inglés, aunque la herencia de Qwen3 sugiera multilingüismo.
- Marco teórico DISC sin validación independiente: la sección matemática de la model card no está respaldada por resultados empíricos publicados en la información disponible.
- Fecha de creación futura (2026-03-28) y actualización (2026-11-19): metadatos anómalos que conviene contrastar antes de confiar en la cronología del repositorio.
- Sin garantías de mantenimiento: autor individual, 1 like y 2.080 descargas; soporte comunitario limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Disctil-Qwen3-1.7B
- Modelo base: https://huggingface.co/reaperdoesntknow/DiStil-Qwen3-1.7B-uncensored
- Colección DistilQwen: https://huggingface.co/collections/reaperdoesntknow/distilqwen-69bf40ec669117e3f069ef1c
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Paper "Structure Over Scale" (DOI 10.57967/hf/8165): https://doi.org/10.57967/hf/8165
- Paper "Structure Over Scale" en HF: https://huggingface.co/reaperdoesntknow/Structure-Over-Scale
- Paper "Three Teachers to Dual Cognition" (DOI 10.57967/hf/8184): https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy
- Paper "Discrepancy Calculus" (DOI 10.57967/hf/8194): https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus
- TRL (framework de entrenamiento): https://github.com/huggingface/trl
- Modelo destacado del portfolio, Qwen3-1.7B-Coder-Distilled-SFT: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Coder-Distilled-SFT
