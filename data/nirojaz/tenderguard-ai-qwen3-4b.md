# nirojaz/TenderGuard-AI-Qwen3-4B

## Resumen

TenderGuard-AI-Qwen3-4B es un adaptador PEFT (LoRA) publicado por el usuario nirojaz sobre el modelo base Qwen/Qwen3-4B-Base. Se distribuye como un repositorio de 0,3 GB con pesos en formato safetensors y está pensado para cargarse junto al modelo base mediante la librería PEFT. El nombre sugiere un ajuste orientado a licitaciones o contratación pública ("tender"), aunque la model card no documenta el propósito, los datos ni el procedimiento de entrenamiento.

La relevancia de esta ficha es limitada: el repositorio no incluye información sobre el conjunto de datos de ajuste, hiperparámetros, evaluación ni licencia. La model card es la plantilla por defecto de Hugging Face con todos los campos marcados como "[More Information Needed]". Cualquier evaluación de idoneidad para producción debe partir del modelo base Qwen3-4B-Base y de una inspección directa del adaptador.

El modelo base Qwen3-4B-Base es un transformer denso de 4 mil millones de parámetros desarrollado por Alibaba Qwen. El adaptador añade un delta de pesos entrenado con PEFT 0.15.1, lo que permite aplicarlo sobre el base sin duplicar los 4B de parámetros. No se dispone de datos verificados sobre el contexto efectivo, los idiomas o el rendimiento del adaptador resultante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-4B-Base) con adaptador LoRA/PEFT |
| Parametros totales | 4B en el modelo base; el adaptador añade un delta no cuantificado en la informacion disponible |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible para el adaptador (la del base Qwen3-4B-Base no se detalla en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT), libreria peft |
| Tamano del repositorio | 0,3 GB |
| Version de PEFT | 0.15.1 |
| Fecha de creacion | 2026-11-24 |

## Arquitectura y entrenamiento

El artefacto es un adaptador PEFT sobre Qwen/Qwen3-4B-Base. La arquitectura subyacente es la del base: un transformer denso de 4B parámetros. El adaptador se aplica como delta de pesos (LoRA u otra variante PEFT) y requiere cargar primero el modelo base. El repositorio pesa 0,3 GB, coherente con un adaptador de rango bajo sobre un modelo de 4B.

No hay información sobre el dataset de ajuste, el número de tokens, la composición de los datos, si hubo RLHF/DPO o supervisión, ni sobre hiperparámetros de entrenamiento (rango, alpha, dropout, precisión mixta). La model card no documenta ninguna innovación técnica. Tampoco se especifica si el ajuste fue supervisado, por preferencias o de otro tipo. Toda afirmación sobre el proceso de entrenamiento sería especulativa.

## Capacidades

- Generación de texto y razonamiento: heredadas del base Qwen3-4B-Base; el adaptador puede alterar el estilo o el dominio, pero no se documenta en qué dirección.
- Código y matemáticas: capacidades del base, sin evaluación publicada del adaptador.
- Tool calling / function calling: no documentado para el adaptador; depende de las capacidades del base y del prompt.
- Agentes y razonamiento multi-paso: no documentado.
- Multilingüismo: no disponible; el base Qwen3 soporta varios idiomas, pero el adaptador no declara idiomas.
- Capacidades especiales (thinking mode, visión, audio): no documentadas; el base es texto.
- Ajuste específico de dominio: el nombre sugiere licitaciones/contratación, pero no hay evidencia en la model card.

## Casos de uso

- Clasificación y extracción en licitaciones: si el ajuste es de dominio, podría emplearse para extraer pliegos, plazos y criterios de adjudicación; requiere validación empírica previa, ya que no hay evaluación publicada.
- Asistencia a licitadores: generación de borradores de memoria técnica o checklists de requisitos, siempre con revisión humana por el riesgo de alucinación.
- Prototipado rápido sobre Qwen3-4B: cargar el adaptador con PEFT para comparar su comportamiento frente al base en tareas de contratación pública.
- Investigación sobre ajuste de dominio: usar el adaptador como punto de partida para estudiar transferencia de LoRA en modelos de 4B.
- Despliegue en hardware modesto: al ser un adaptador de 0,3 GB sobre un base de 4B, puede servirse en GPUs de consumo con cuantización del base (vLLM, llama.cpp u Ollama, previa conversión).
- Filtrado y triaje documental: preclasificar expedientes o pliegos antes de revisión humana, con métricas de precisión medidas en el propio corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador en sí ocupa ~0,3 GB; el base de 4B requiere aproximadamente 8 GB en fp16, ~4-5 GB en cuantización de 8 bits y ~2,5-3 GB en 4 bits.
- GPU recomendadas: RTX 3090/4090 (24 GB) para fp16 con margen; A10G, L4 o A100 para servicio; GPUs de 8 GB pueden servir el base cuantizado.
- Cabe en GPU de consumo: sí, con el base cuantizado (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090).
- Opciones de despliegue: PEFT + transformers para cargar el adaptador; vLLM con soporte LoRA; llama.cpp/Ollama tras fusionar el adaptador con el base y convertir a GGUF; TGI con adaptadores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| TenderGuard-AI-Qwen3-4B | 4B (base) + adaptador | no disponible | no disponible | safetensors (PEFT) | Sin evaluacion ni model card sustantiva |
| Qwen/Qwen3-4B-Base | 4B | no disponible en esta ficha | segun Qwen (no verificada aqui) | safetensors | Modelo base oficial, documentado por Alibaba |
| Adaptadores LoRA genericos sobre Qwen3-4B | 4B (base) + adaptador | depende del base | variable | safetensors (PEFT) | Ecosistema amplio en Hugging Face |
| Modelos densos de ~4B alternativos | ~4B | variable | variable | safetensors/GGUF | Comparacion generica; sin datos concretos verificados |

No se dispone de datos de rendimiento del adaptador para una comparativa cuantitativa.

## Limitaciones y advertencias

- La model card está sin completar: no hay información sobre datos, entrenamiento, evaluación ni uso previsto.
- Licencia no declarada: no se puede asumir uso comercial; debe contactarse con el autor o verificar la licencia del base Qwen3-4B-Base.
- Riesgo de alucinación: inherente al base y no mitigado de forma documentada; crítico en dominio legal/administrativo.
- Sesgos: no evaluados; el adaptador puede amplificar sesgos del corpus de ajuste, desconocido.
- Idiomas y contexto: no documentados; no asumir cobertura multilingüe ni ventanas largas.
- Sin benchmarks: no hay evidencia de mejora frente al base en ninguna tarea.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria.
- Fecha de creación futura (2026-11-24): metadato anómalo que conviene verificar antes de confiar en el artefacto.
- Para producción: exigir auditoría del adaptador, evaluación en el corpus propio y revisión humana en decisiones sensibles.

## Enlaces

- Hugging Face: https://huggingface.co/nirojaz/TenderGuard-AI-Qwen3-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Librería PEFT: https://github.com/huggingface/peft
- Paper citado en los tags (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
