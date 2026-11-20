# keytree/CIDS734-Lab8-model

## Resumen

`keytree/CIDS734-Lab8-model` es un modelo de lenguaje derivado de Llama-3.2-3B-Instruct, afinado (fine-tuning) y convertido a formato GGUF por el usuario keytree mediante Unsloth. Por el nombre del repositorio y el contexto (CIDS734, Lab8) se trata con toda probabilidad de un artefacto académico de un laboratorio de curso, no de un modelo pensado para producción ni para uso general. El repositorio contiene un único archivo cuantizado `Llama-3.2-3B-Instruct.Q4_K_M.gguf` y un Modelfile de Ollama para despliegue local.

El modelo conserva la arquitectura subyacente de Llama-3.2-3B-Instruct (transformer denso, familia Llama 3), con 3.212.749.888 parámetros totales según los metadatos de safetensors. No se documenta el dataset de fine-tuning, el número de tokens de entrenamiento, ni si hubo RLHF/DPO adicional sobre el modelo base. La model card es mínima y se limita a instrucciones de uso con `llama-cli` y `llama-mtmd-cli`.

Su relevancia práctica es limitada: no hay descargas ni likes, la licencia no está declarada y no se publican benchmarks. Resulta útil como ejemplo de flujo Unsloth → GGUF y como modelo pequeño (3B) cuantizado en Q4_K_M para pruebas locales en hardware modesto, pero no debe considerarse un modelo evaluado ni validado para tareas críticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Llama 3, derivado de Llama-3.2-3B-Instruct) |
| Parametros totales | 3.212.749.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Llama-3.2-3B-Instruct; no confirmada en la model card) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (archivo `Llama-3.2-3B-Instruct.Q4_K_M.gguf`); repo de 2,0 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-3.2-3B-Instruct: un transformer denso de la familia Llama 3 con 3.212.749.888 parámetros. Sobre esa base, el autor aplicó un fine-tuning y posteriormente convirtió los pesos a GGUF usando Unsloth, que según la model card permitió un entrenamiento "2x faster". No se especifica el dataset, el número de tokens, la composición de los datos ni si se aplicaron técnicas de alineación adicionales (RLHF, DPO) más allá de las ya presentes en el modelo base.

La model card indica un ajuste del comportamiento del token BOS para compatibilidad con GGUF. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, MoE, etc.). El modelo se distribuye exclusivamente en cuantización Q4_K_M, lo que reduce el tamaño a aproximadamente 2 GB y facilita su ejecución en CPU o GPU de gama baja mediante llama.cpp.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Llama-3.2-3B-Instruct.
- Instrucciones y diálogo multi-turno (formato instruct del modelo base).
- Compatibilidad con `llama-cli` y `llama-mtmd-cli` mediante `--jinja` (soporte de plantillas de chat).
- Despliegue vía Ollama mediante el Modelfile incluido.
- Tool calling / function calling: no documentado en la model card.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no documentadas.
- Modo thinking, visión o audio: no documentados.

## Casos de uso

- Pruebas locales de inferencia con llama.cpp: el archivo Q4_K_M de ~2 GB permite ejecutar el modelo en portátiles y equipos sin GPU dedicada, útil para validar pipelines antes de pasar a modelos mayores.
- Prototipado rápido con Ollama: el Modelfile incluido permite levantar un endpoint conversacional en minutos para demos internas o pruebas de integración.
- Docencia y laboratorios: al tratarse de un artefacto de curso (CIDS734-Lab8), sirve como ejemplo reproducible del flujo Unsloth → GGUF y de ajuste de tokens BOS.
- Evaluación de fine-tuning sobre Llama-3.2-3B: permite comparar cualitativamente el comportamiento del modelo afinado frente al base en tareas concretas del dataset de entrenamiento (no documentado).
- Generación de texto asistida en entornos con recursos limitados: resúmenes, reescritura o borradores donde no se requiere máxima calidad y prima el coste bajo.
- Base para nuevos fine-tunings: al estar en GGUF y derivar de Llama-3.2-3B-Instruct, puede servir de punto de partida experimental, aunque para reentrenar conviene partir de los pesos originales en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-2,5 GB en Q4_K_M (el archivo pesa ~2 GB; añadir overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con ≥4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.); también funciona en CPU.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs de consumo actuales y en muchas integradas con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`), Ollama (Modelfile incluido), y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| keytree/CIDS734-Lab8-model | 3,21 B | no disponible | GGUF Q4_K_M | no disponible | Hugging Face (0 descargas) |
| Llama-3.2-3B-Instruct (Meta) | 3,21 B | 128 K (según model card oficial) | safetensors, GGUF | Llama 3.2 Community License | Hugging Face, ampliamente adoptado |
| Qwen2.5-3B-Instruct | ~3 B | 32 K (128 K en variantes) | safetensors, GGUF | Apache 2.0 (mayoría de variantes) | Hugging Face |
| Phi-3.5-mini-instruct | 3,8 B | 128 K | safetensors, GGUF | MIT | Hugging Face |

La comparativa con Llama-3.2-3B-Instruct es la más directa, ya que este modelo deriva de él; las diferencias en calidad dependen del fine-tuning no documentado. Frente a Qwen2.5-3B-Instruct y Phi-3.5-mini-instruct, este artefacto carece de benchmarks publicados y de licencia declarada, lo que limita su uso fuera de entornos experimentales.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor o consultar la licencia del modelo base (Llama 3.2 Community License).
- Sin benchmarks ni evaluación publicada: no hay evidencia de calidad frente al modelo base ni frente a alternativas.
- Dataset de fine-tuning no documentado: se desconoce qué sesgos o comportamientos específicos puede haber adquirido.
- Riesgo de alucinación: inherente a modelos de 3B parámetros; mayor en tareas de conocimiento factual y razonamiento complejo.
- Idiomas soportados no declarados: el rendimiento multilingüe no está garantizado más allá de lo que herede del modelo base.
- Longitud de contexto no confirmada en la model card: no asumir 128 K sin verificar la configuración de llama.cpp.
- Ajuste del token BOS para GGUF: puede provocar diferencias de comportamiento respecto al modelo original si se usa con otras herramientas.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad; tratar como artefacto experimental.
- Un único archivo Q4_K_M: no hay versiones en otras cuantizaciones ni pesos completos en safetensors en este repo.

## Enlaces

- Hugging Face: https://huggingface.co/keytree/CIDS734-Lab8-model
- Unsloth (herramienta usada para el fine-tuning y conversión): https://github.com/unslothai/unsloth
- Llama.cpp (runtime recomendado): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- Modelo base de referencia: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
