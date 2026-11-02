# mehemet/HexWeaver-27B-v5

## Resumen

HexWeaver-27B-v5 es un adaptador LoRA publicado por el usuario mehemet en HuggingFace, construido sobre el modelo base OBLITERATUS/Qwen3.8-27B-OBLITERATED. Se distribuye como repositorio PEFT (librería `peft`, formato `safetensors`) con un tamaño de 0,3 GB, lo que corresponde exclusivamente a los pesos del adaptador y no al modelo completo. La ficha de HuggingFace lo etiqueta como un ajuste de tipo SFT (supervised fine-tuning) orientado a generación de texto y conversación.

El modelo base declarado, Qwen3.8-27B-OBLITERATED, es a su vez una variante derivada de la familia Qwen3 de Alibaba, con aproximadamente 27 mil millones de parámetros según la nomenclatura del identificador. No se dispone de información publicada sobre la arquitectura exacta, la longitud de contexto, el número de tokens de entrenamiento ni la composición del dataset utilizado para el ajuste LoRA.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el repositorio tiene cero descargas y cero likes en el momento de la consulta, el acceso está restringido (gated) y no se han publicado resultados de benchmarks, licencia ni lista de idiomas soportados. Cualquier evaluación de producción requeriría validación empírica propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre transformer, base Qwen3.8-27B-OBLITERATED) |
| Parametros totales | no disponible (el identificador del modelo base sugiere ~27B, sin confirmar) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante SFT con las librerías `transformers` y `trl`, según las etiquetas del repositorio. No se publica información sobre el rango del adaptador, los módulos objetivo, la tasa de aprendizaje, el número de pasos ni la composición del dataset de ajuste. El tamaño del repositorio (0,3 GB) es coherente con un adaptador de rango moderado sobre un modelo de ~27B, pero no permite inferir detalles del entrenamiento.

El modelo base, OBLITERATUS/Qwen3.8-27B-OBLITERATED, no aporta documentación técnica accesible en la información proporcionada. La etiqueta `arxiv:1910.09700` presente en el repositorio corresponde al artículo original de LoRA (Hu et al., 2021), no a un paper específico de este modelo. No hay evidencia de RLHF, DPO ni de innovaciones técnicas destacables (decodificación especulativa, atención lineal, arquitecturas híbridas) documentadas para este adaptador.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Ajuste fino supervisado (SFT) sobre el modelo base, orientado presumiblemente a un estilo o dominio concreto no especificado.
- Capacidades heredadas del modelo base Qwen3.8-27B-OBLITERATED: no documentadas en la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Experimentación en investigación sobre adaptadores LoRA: el reducido tamaño del repositorio (0,3 GB) permite cargar el adaptador sobre el modelo base para estudiar el efecto del ajuste SFT sin necesidad de almacenar una copia completa del modelo.
- Evaluación comparativa de variantes "obliterated": útil para investigadores que analicen cómo el ajuste SFT modifica el comportamiento del modelo base en tareas de conversación, siempre que se disponga de acceso al modelo base.
- Prototipado de asistentes conversacionales de dominio específico: si el adaptador fue entrenado para un estilo concreto, puede servir como punto de partida para experimentos de personalización, aunque requeriría validación empírica previa.
- Reproducción de pipelines de fine-tuning con `trl` y `peft`: el repositorio sirve como ejemplo práctico de cómo se estructura un adaptador LoRA publicado en HuggingFace.
- Base para fusiones de adaptadores (adapter merging): el formato safetensors y la estructura PEFT permiten combinar este adaptador con otros mediante técnicas como TIES o DARE, en entornos de investigación.
- Docencia y formación técnica: útil para demostrar el flujo completo de publicación de un adaptador LoRA con acceso restringido y sus implicaciones de gobernanza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende enteramente del modelo base (~27B). En cuantización de 4 bits se estiman aproximadamente 14-16 GB; en 8 bits, 27-30 GB; en FP16, 54-60 GB. Estas cifras son estimaciones genéricas para un modelo de ese tamaño y no están confirmadas para este modelo concreto.
- GPU recomendadas: para FP16, A100 80GB o H100 80GB; para cuantización 8 bits, A100 40GB; para cuantización 4 bits, RTX 4090 (24 GB) o RTX A6000 (48 GB).
- Compatibilidad con GPU de consumo: probablemente sí en cuantización 4 bits sobre RTX 3090/4090 (24 GB), sujeto a verificación empírica.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base con `transformers` + `peft`; para servir en producción sería necesario fusionar el adaptador o usar vLLM con soporte de LoRA, TGI o llama.cpp tras conversión a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| HexWeaver-27B-v5 | ~27B (base, sin confirmar) | no disponible | no disponible | Gated, 0 descargas |
| Adaptadores LoRA genéricos sobre Qwen3 (p. ej., variantes de la comunidad) | ~27B | depende del base | varía | Públicos |
| Qwen3-32B (modelo base oficial) | 32B | 128K (según documentación oficial de Qwen3) | Apache 2.0 (según documentación oficial) | Público |
| Modelos densos de ~30B de la familia Llama | ~30B | varía | Llama Community License | Público |

No se dispone de datos de rendimiento comparativo para HexWeaver-27B-v5. La comparación se limita a parámetros y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no hay información sobre licencia, idiomas, dataset de entrenamiento ni evaluación.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que puede impedir su uso en pipelines automatizados o en entornos corporativos con políticas estrictas.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni validación externa.
- Riesgo elevado de alucinación y comportamiento impredecible: sin benchmarks ni evaluación publicada, no es posible caracterizar su calidad.
- Licencia no disponible: no se puede garantizar el uso comercial ni la redistribución; consultar con el autor antes de cualquier despliegue en producción.
- Dependencia del modelo base: cualquier limitación, sesgo o restricción del modelo OBLITERATUS/Qwen3.8-27B-OBLITERATED se hereda en el adaptador.
- El término "OBLITERATED" en el nombre del modelo base sugiere una modificación deliberada de los pesos originales (posiblemente ablación de capacidades o de alineamiento), lo que introduce incertidumbre adicional sobre el comportamiento resultante.
- Fecha de creación futura (2026-11-02) en los metadatos: inconsistencia que sugiere posibles errores en la publicación o en la información del repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/mehemet/HexWeaver-27B-v5
- Modelo base: https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED
- Paper de referencia LoRA (citado en las etiquetas): https://arxiv.org/abs/1910.09700
- Librería PEFT: https://github.com/huggingface/peft
- Librería TRL: https://github.com/huggingface/trl
