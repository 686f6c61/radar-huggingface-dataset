# lugman/Qwen2.5-1.5B-KK-Neon-Ablation-3-SFT

## Resumen

Qwen2.5-1.5B-KK-Neon-Ablation-3-SFT es un ajuste fino (SFT) del modelo Qwen2.5-1.5B-Instruct, realizado por el usuario lugman y publicado en Hugging Face. Se trata de un experimento de ajuste supervisado sobre la base instruct de Qwen2.5, una familia de modelos transformer decoder-only desarrollada por Alibaba Cloud (Qwen). El modelo conserva la arquitectura y el tamano originales: 1.543.714.304 parametros (aproximadamente 1,5 mil millones) y una ventana de contexto de 32.768 tokens, aunque la model card no documenta explicitamente estos datos.

La relevancia de esta publicacion es limitada: se trata de un modelo derivado de un experimento personal (la nomenclatura "KK-Neon-Ablation-3-SFT" sugiere una ablacion dentro de una serie de pruebas) sin documentacion tecnica sobre el dataset de ajuste, el numero de pasos, la tasa de aprendizaje ni los resultados obtenidos. No incluye benchmarks, no ha recibido descargas ni likes en el momento de la consulta y el autor no detalla el proposito del ajuste.

Para desarrolladores e investigadores, este modelo debe considerarse como un artefacto de experimentacion mas que como un modelo listo para produccion. Su interes practico es escaso frente al modelo base original, que esta ampliamente documentado y validado. Se recomienda evaluar directamente `unsloth/Qwen2.5-1.5B-Instruct` o los modelos oficiales de Qwen2.5 salvo que se conozca el comportamiento especifico de este ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la model card (el modelo base Qwen2.5 soporta 32.768 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se puede cuantizar a GGUF/AWQ/FP8 con herramientas externas) |
| Idiomas soportados | en (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen2 del modelo base `unsloth/Qwen2.5-1.5B-Instruct`: un transformer decoder-only denso con atencion por causalidad, normalizacion RMSNorm, activacion SwiGLU y embeddings de tokens compartidos con la cabeza de salida. El modelo base fue entrenado por Alibaba con un corpus multilingue de gran escala y posteriormente alineado mediante instrucciones y preferencias. La model card no aporta detalles sobre la configuracion exacta de capas, cabezas o dimension oculta de esta variante.

El ajuste fue realizado por lugman mediante SFT (supervised fine-tuning) utilizando Unsloth y la libreria TRL de Hugging Face, segun indica la propia model card. No se especifica el dataset de entrenamiento, el numero de tokens, la composicion de los datos, ni si se aplicaron tecnicas adicionales como DPO o RLHF. La nomenclatura "Ablation-3" sugiere que forma parte de una serie de experimentos de ablacion, pero no se documenta que variable se estaba aislando ni cuales fueron los resultados. No hay informacion sobre hiperparametros, duracion del entrenamiento ni evaluacion posterior.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base instruct.
- Razonamiento basico y respuesta a instrucciones, limitado por el tamano de 1,5 mil millones de parametros.
- Generacion de codigo sencillo y resolucion de problemas matematicos de complejidad baja.
- Soporte de chat multi-turno mediante plantilla de conversacion de Qwen2 (formato ChatML).
- Compatible con endpoints de text-generation-inference y con la libreria transformers.
- Capacidad multilingue potencial heredada del modelo base, aunque la model card solo declara ingles.
- No se documenta soporte explicito de tool calling, function calling, agentes o modos de razonamiento extendido (thinking).

## Casos de uso

- Prototipado rapido de asistentes conversacionales en ingles: al ser un modelo de 1,5B, se puede desplegar en una unica GPU consumer para validar flujos de chat antes de escalar a modelos mayores.
- Experimentacion academica con tecnicas de SFT: sirve como punto de partida para comparar el efecto de distintos datasets de ajuste sobre un modelo base bien conocido.
- Generacion de texto en entornos con recursos limitados: su tamano permite ejecucion en CPU o GPU de gama baja con cuantizacion, util para demos o pruebas offline.
- Clasificacion y etiquetado de texto simple: puede emplearse para tareas de extraccion o categorizacion con prompts few-shot, aunque sin garantias de calidad frente al modelo base.
- Generacion de codigo para scripts pequenos: adecuado para autocompletado basico o generacion de fragmentos de codigo en entornos de desarrollo asistido.
- Base para ajustes posteriores (fine-tuning incremental): al estar publicado con licencia Apache 2.0 y en safetensors, puede servir como punto de partida para nuevos experimentos de la comunidad.
- Educacion y divulgacion: util para ilustrar el proceso de ajuste fino con Unsloth y TRL en talleres o tutoriales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,1 GB solo para pesos, mas overhead de activaciones y cache KV (estimacion orientativa de 4-6 GB en total).
- VRAM estimada en cuantizacion 8 bits: aproximadamente 1,6 GB para pesos.
- VRAM estimada en cuantizacion 4 bits: aproximadamente 0,8-1 GB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070, RTX 4090). Tambien cabe en GPUs de datacenter como A100 o H100, aunque resultan sobredimensionadas.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 6 GB o mas de VRAM en FP16, y en GPUs de 4 GB con cuantizacion.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp (tras conversion a GGUF), Ollama (tras conversion), SGLang.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-KK-Neon-Ablation-3-SFT | 1,54B | no disponible (base: 32.768) | Apache 2.0 | Hugging Face | Ajuste experimental sin benchmarks |
| Qwen2.5-1.5B-Instruct (base) | 1,54B | 32.768 | Apache 2.0 | Hugging Face | Modelo oficial con benchmarks publicados |
| Llama 3.2 1B Instruct | 1,24B | 128.000 | Llama 3.2 Community License | Hugging Face | Mayor contexto, licencia restrictiva |
| SmolLM2-1.7B-Instruct | 1,71B | 8.192 | Apache 2.0 | Hugging Face | Alternativa pequena con benchmarks publicados |

## Limitaciones y advertencias

- Ausencia total de documentacion sobre el dataset de ajuste, hiperparametros y evaluacion: imposible conocer que comportamiento se ha modificado respecto al modelo base.
- Riesgo elevado de alucinacion y degradacion de capacidades por sobreajuste a un dataset no documentado.
- La model card solo declara soporte de ingles, aunque el modelo base es multilingue; el ajuste podria haber degradado idiomas distintos del ingles.
- Modelo de 1,5B parametros: capacidad de razonamiento limitada, propenso a errores en tareas complejas de matematicas, codigo o logica multi-paso.
- Sin benchmarks publicados: no hay evidencia de que supere al modelo base en ninguna tarea.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero al ser un derivado de Qwen2.5 conviene revisar tambien las condiciones del modelo base original.
- No recomendado para produccion sin una evaluacion exhaustiva previa contra el modelo base.
- La nomenclatura "KK-Neon-Ablation-3" sugiere un contexto experimental no documentado; no se debe asumir ninguna capacidad especifica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lugman/Qwen2.5-1.5B-KK-Neon-Ablation-3-SFT
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de Hugging Face: https://github.com/huggingface/trl
- Familia Qwen2.5 (blog oficial): https://qwenlm.github.io/blog/qwen2.5/
