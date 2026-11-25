# AMAImedia/Hy4-Flash-BF16-GGUF

## Resumen

Hy4-Flash es un modelo de lenguaje multimodal desarrollado por Tencent (familia Hunyuan), publicado originalmente bajo el identificador `tencent/Hy4-flash`. Se trata de un transformer de tipo Mixture-of-Experts (MoE) con 220.251.201.958 parámetros totales, de los cuales solo 12B se activan por token, lo que lo sitúa en la gama de modelos "flash" optimizados para coste. Acepta de forma nativa entradas de texto e imagen y genera texto, con una ventana de contexto de hasta 1M tokens.

El repositorio `AMAImedia/Hy4-Flash-BF16-GGUF` no es el modelo original, sino una republicación de cuantizaciones GGUF en BF16 (y variantes) generada por un tercero (AMAImedia/NOESIS) a partir del repositorio oficial de Tencent y de la versión Strata. Por tanto, quien evalúe este artefacto debe tener claro que la autoría del modelo corresponde a Tencent y que el repositorio aquí descrito es un empaquetado de pesos para inferencia local.

La relevancia del modelo radica en su relación entre tamaño total (220B) y parámetros activos (12B), combinada con atención híbrida (sparse + sliding window), LatentMoE y embeddings de n-gramas (Engram), además de un drafter de decodificación especulativa (DFly2) de 0,85B parámetros que reutiliza la caché KV del modelo objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con atención híbrida (sparse IndexPool + sliding-window attention en ratio 1:3), LatentMoE y embeddings Engram (bigramas/trigramas) |
| Parametros totales | 220.251.201.958 (220B, incluye 64B de parámetros Engram) |
| Parametros activos | 12B por token (16 de 512 expertos enrutados + 1 experto compartido) |
| Longitud de contexto | Hasta 1.000.000 tokens (1M) |
| Tipos de cuantizacion | Repositorio BF16-GGUF; el modelo base dispone de cuantizaciones GGUF publicadas por AngelSlim (niveles concretos no disponibles en la información) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Tencent Hy License (`tencent-hy-license`, marcada como "other") |
| Formato de pesos | safetensors (original) y GGUF (este repositorio); también transformers |

## Arquitectura y entrenamiento

El backbone lingüístico consta de 42 capas: una capa densa feed-forward y 41 capas MoE, con Hyper-Connections de identidad (iHC) que soportan el flujo de información entre capas. La atención es híbrida: atención dispersa (IndexPool) y atención de ventana deslizante (SWA) se intercalan en proporción 1:3. En LatentMoE, los expertos enrutados operan en un espacio latente de menor dimensión; cada token activa 16 de 512 expertos enrutados más un experto compartido. Además, el backbone se aumenta con representaciones aprendidas de bigramas y trigramas (Engram), recuperadas mediante búsquedas hash multi-cabeza.

La parte multimodal se resuelve con un codificador visual adaptado de SigLIP2-So400m-Patch16-Res512, conectado al backbone mediante un proyector MLP. Para decodificación especulativa incorpora un drafter de 5 capas, DFly2 (0,85B parámetros), que reutiliza la caché KV y los índices dispersos del modelo objetivo para soportar decodificación especulativa en contexto largo a coste bajo y constante.

No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO).

## Capacidades

- Generación de texto e instrucciones conversacionales (etiqueta `instruct`).
- Comprensión de imagen y texto combinados, con salida de texto (pipeline `image-text-to-text`).
- Razonamiento y generación de código: la model card incluye referencias a resultados de benchmarks en el apéndice, aunque los valores no se detallan en la información disponible.
- Ventana de contexto muy larga (hasta 1M tokens), adecuada para documentos extensos y conversaciones multi-turno prolongadas.
- Decodificación especulativa de contexto largo mediante el drafter DFly2 integrado.
- Soporte multilingüe limitado a chino e inglés.
- Compatibilidad con API compatible con OpenAI según la model card.
- Soporte de despliegue en vLLM y SGLang, y cuantización GGUF para inferencia local.
- No se confirma en la información disponible soporte explícito de tool calling, function calling ni modo "thinking".

## Casos de uso

- Procesamiento de documentos largos: con 1M tokens de contexto, el modelo puede ingerir contratos, informes o bases de código completas en una sola pasada y responder preguntas sobre el conjunto, evitando pipelines de chunking y recuperación.
- Análisis de documentos con imágenes: al aceptar imagen y texto, resulta adecuado para extraer y razonar sobre información de capturas, diagramas o páginas escaneadas junto con el texto que las acompaña.
- Asistentes conversacionales de dominio: su naturaleza instruct y su contexto largo permiten mantener historiales extensos de conversación sin truncar, útil en atención al cliente o soporte técnico especializado en chino e inglés.
- Generación y revisión de código: puede integrarse en flujos de revisión de repositorios completos gracias al contexto de 1M tokens, comparando cambios contra el resto del código base.
- Despliegue local con cuantización GGUF: este repositorio permite ejecutar el modelo en entornos con llama.cpp u otros runners compatibles con GGUF, útil para prototipado e investigación sin depender de infraestructura en la nube.
- Servicio de inferencia de alto rendimiento: con vLLM o SGLang y decodificación especulativa DFly2, es apto para servir cargas concurrentes donde el coste por token activo (12B) importa más que el tamaño total del modelo.
- Investigación en arquitecturas MoE y atención híbrida: la combinación de LatentMoE, IndexPool, SWA y Engram lo convierte en un objeto de estudio para experimentos de eficiencia y decodificación especulativa.

## Benchmarks y rendimiento

La model card del modelo original incluye un apéndice de resultados de benchmarks, pero los valores concretos no están disponibles en la información proporcionada. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 220B parámetros totales, los pesos en BF16 ocupan aproximadamente 440 GB; las cuantizaciones GGUF reducen sustancialmente ese requisito, pero los niveles y tamaños concretos no se detallan en la información.
- El repositorio completo ocupa 943,7 GB, lo que refleja múltiples variantes de pesos.
- GPU recomendadas: no disponibles en la información. Por tamaño, el modelo en BF16 excede la memoria de cualquier GPU consumer y requiere nodos multi-GPU de clase datacenter (A100/H100/H200); las cuantizaciones GGUF podrían permitir despliegue parcial en memoria RAM/VRAM combinada, sin datos confirmados.
- Cabe en GPU consumer: no en BF16; para cuantizaciones GGUF no hay datos confirmados en la información.
- Opciones de despliegue: transformers, vLLM, SGLang, llama.cpp/Ollama para GGUF, y API compatible con OpenAI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento de modelos comparables. A nivel estructural, las alternativas de la misma categoría (MoE multimodal de gran tamaño con pocos parámetros activos) serían modelos como Qwen o DeepSeek en sus variantes MoE, pero no se aportan cifras que permitan una comparación rigurosa.

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-Flash | 220B (64B Engram) | 12B | 1M | Tencent Hy License | Hugging Face, ModelScope, GitCode |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idiomas: solo chino e inglés; el rendimiento en castellano no está garantizado ni documentado.
- Licencia: Tencent Hy License, marcada como "other"; es imprescindible revisar sus términos antes de cualquier uso comercial, ya que puede imponer restricciones adicionales.
- El repositorio aquí descrito es una republicación de terceros (AMAImedia/NOESIS), no la distribución oficial de Tencent; conviene verificar la integridad de los pesos frente al repositorio original.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Sesgos: no documentados en la información proporcionada.
- El contexto de 1M tokens no implica que el modelo mantenga calidad uniforme en toda la ventana; no hay datos de evaluación al respecto.
- El tamaño total de 220B hace inviable el despliegue en hardware consumer en BF16; las cuantizaciones GGUF mitigan el problema pero degradan la calidad en grados no especificados.
- La model card incluye llamadas a donaciones y datos de hardware del publicador; no constituyen información técnica del modelo.

## Enlaces

- Repositorio descrito: https://huggingface.co/AMAImedia/Hy4-Flash-BF16-GGUF
- Modelo original: https://huggingface.co/tencent/Hy4-flash
- Repositorio GGUF de referencia: https://huggingface.co/AngelSlim/Hy4-flash-GGUF
- Repositorio Strata: https://huggingface.co/strata-engine/Hy4-Flash-Strata
- Licencia: https://huggingface.co/tencent/Hy4-flash/blob/main/LICENSE
- Web oficial: https://hy.tencent.ai/research/hy4-flash
- GitHub: https://github.com/Tencent-Hunyuan/Hy4-flash
- ModelScope: https://modelscope.cn/models/Tencent-Hunyuan/Hy4-flash
- GitCode: https://ai.gitcode.com/tencent_hunyuan/Hy4-flash
- README en chino: https://huggingface.co/tencent/Hy4-flash/blob/main/README_CN.md
