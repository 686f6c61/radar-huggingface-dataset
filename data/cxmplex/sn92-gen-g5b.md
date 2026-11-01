# cxmplex/sn92-gen-g5b

## Resumen

El modelo `cxmplex/sn92-gen-g5b` es un modelo de lenguaje publicado en HuggingFace por el usuario `cxmplex` bajo licencia MIT. Según los metadatos del repositorio, se trata de un modelo de aproximadamente 26.085 millones de parámetros (26,1 B) almacenado en formato safetensors, con un tamaño de repositorio de 52,2 GB, lo que es coherente con pesos en precisión de 16 bits (bf16/fp16). El tag `qwen3_5` sugiere que la arquitectura está basada en la familia Qwen 3.5, aunque no se proporciona confirmación explícita en la información disponible.

La model card es extremadamente escueta: se limita a indicar la licencia MIT y a describir el modelo como "Decision model for the REAX (SN92) generalist track" (modelo de decisión para la pista generalista de REAX SN92). No se documentan detalles sobre arquitectura interna, datos de entrenamiento, longitud de contexto, idiomas soportados ni proceso de alineación. El repositorio tiene 9 descargas y 0 likes, lo que indica una publicación muy reciente (creada y actualizada el 29 de octubre de 2026) y con escasa tracción comunitaria.

Por su tamaño y su naturaleza aparentemente orientada a toma de decisiones dentro de un pipeline denominado REAX, el modelo resulta relevante como componente de sistemas de agentes o de enrutamiento, pero la falta de documentación técnica limita seriamente su evaluación rigurosa. Cualquier despliegue en producción debería ir precedido de una validación empírica propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (tag `qwen3_5` sugiere base Qwen 3.5, sin confirmar) |
| Parámetros totales | 26.085.330.160 (~26,1 B) |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no documentadas) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna del modelo. El tag `qwen3_5` en HuggingFace apunta a que el autor lo ha etiquetado como perteneciente a la familia Qwen 3.5, lo que en la práctica implicaría una arquitectura transformer con atención estándar o híbrida, pero esta inferencia no está confirmada por la model card. Tampoco se especifica si se trata de un modelo denso o de mezcla de expertos (MoE); el recuento de 26,1 B parámetros totales es compatible con ambas configuraciones.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF, DPO o cualquier otra técnica de alineación, ni sobre innovaciones técnicas como decodificación especulativa, atención lineal o modos de razonamiento extendido. La model card se limita a la declaración de licencia y a una frase descriptiva del propósito del modelo ("Decision model for the REAX (SN92) generalist track"). Todo lo relativo al proceso de entrenamiento debe considerarse no disponible.

## Capacidades

- Generación de texto: capacidad esperable por su naturaleza de modelo de lenguaje, aunque no documentada explícitamente.
- Toma de decisiones: la model card lo describe como "decision model" para la pista generalista de REAX SN92, lo que sugiere un uso orientado a enrutamiento, clasificación o selección de acciones dentro de un pipeline.
- Razonamiento multi-paso: no confirmado en la documentación.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes: no disponible, aunque el nombre "decision model" apunta a un posible rol como componente de un sistema de agentes.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Enrutamiento de consultas en un sistema multi-agente: el modelo podría emplearse como clasificador o "decisor" que selecciona qué sub-agente o herramienta debe atender una petición concreta, dado su rol declarado de "decision model".
- Clasificación de intenciones en pipelines de atención al cliente: integrado como paso previo a un modelo generativo mayor, permitiría decidir la ruta de respuesta (FAQ, escalado humano, consulta a base de datos).
- Selección de herramientas en un framework de agentes: si el modelo soporta instrucciones en formato chat, podría evaluarse como planificador ligero que elige entre un conjunto acotado de funciones.
- Moderación o triaje de contenido: como modelo de decisión binaria o multiclase sobre textos entrantes, siempre que se valide su comportamiento con datos propios.
- Componente de un pipeline REAX/SN92: si el ecosistema REAX existe y está documentado por el autor, el modelo encajaría como el modelo generalista de referencia de esa pista.
- Experimentación e investigación: por su licencia MIT y su tamaño medio (26 B), es apto para fine-tuning y estudios comparativos en entornos académicos con GPUs de gama alta.
- Evaluación de modelos base: útil como punto de partida para medir el efecto de técnicas de alineación o cuantización sobre un modelo de ~26 B.

En todos los casos, la ausencia de documentación obliga a realizar una validación empírica previa: no hay garantía publicada sobre calidad, idiomas ni formato de prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 52 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se requieren 60-70 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: ~26 GB de pesos, con un total práctico de 30-35 GB.
- VRAM estimada en cuantización de 4 bits: ~13-15 GB de pesos, con un total práctico de 18-22 GB (si se generan cuantizaciones GPTQ/AWQ/GGUF, no publicadas por el autor).
- GPUs recomendadas: A100 80 GB, H100 80 GB o H200 para bf16 sin cuantizar; A100 40 GB o L40S 48 GB para 8 bits; para 4 bits podría caber en una RTX 4090 24 GB o RTX 5090, siempre que se disponga de una cuantización adecuada.
- Cabe en GPU de consumo: probablemente en RTX 4090/5090 con cuantización 4 bits, no en bf16.
- Opciones de despliegue: vLLM, TGI o SGLang para safetensors en bf16; llama.cpp u Ollama requerirían conversión a GGUF, no disponible en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| cxmplex/sn92-gen-g5b | ~26,1 B | No disponible | MIT | HuggingFace (9 descargas) | Documentación mínima |
| Qwen2.5-32B | 32,5 B | 128 K | Apache 2.0 | HuggingFace, muy extendido | Familia con benchmarks publicados |
| Gemma 2 27B | 27 B | 8 K | Gemma License | HuggingFace | Buen rendimiento en razonamiento, licencia restrictiva |
| Mistral Small 24B | 24 B | 128 K | Apache 2.0 | HuggingFace | Alternativa densa con tool calling documentado |

La comparación es aproximada: no hay datos públicos de rendimiento para `sn92-gen-g5b`, por lo que la elección frente a estas alternativas solo puede basarse en la licencia MIT (ventaja frente a Gemma) y en el tamaño, no en calidad medida.

## Limitaciones y advertencias

- Documentación prácticamente inexistente: no se especifican arquitectura, contexto, idiomas ni proceso de entrenamiento, lo que impide evaluar su idoneidad con rigor.
- Riesgo elevado de alucinación y comportamiento impredecible: sin información sobre alineación (RLHF/DPO) no puede asumirse un comportamiento seguro en producción.
- Sesgos desconocidos: al no documentarse la composición del dataset, no es posible anticipar sesgos de género, idioma, cultura o dominio.
- Idiomas no confirmados: no hay garantía de soporte multilingüe ni de calidad en castellano.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; la responsabilidad legal y técnica recae en el desplegador.
- Tracción comunitaria mínima (9 descargas, 0 likes): no hay issues, discusiones ni validaciones independientes que permitan confiar en la reproducibilidad.
- El tag `qwen3_5` no debe interpretarse como confirmación de que el modelo sea oficial de la familia Qwen; es una etiqueta del autor.
- Fecha de creación en 2026 y model card de una sola línea: posible publicación experimental o incompleta.

## Enlaces

- HuggingFace: https://huggingface.co/cxmplex/sn92-gen-g5b
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales.
