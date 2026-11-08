# junbrro/h2rb-e1-object-conditioned-bbtonly-g2-b64-s42-30k-actsilu-20261108

## Resumen

El modelo `h2rb-e1-object-conditioned-bbtonly-g2-b64-s42-30k-actsilu-20261108`, publicado por el usuario `junbrro` en Hugging Face, es un checkpoint de inferencia de una política robótica (VLA, vision-language-action) entrenada en el marco del proyecto H2RB (Human-to-Robot transfer via Bridging Representation). El nombre codifica la configuración del experimento: condicionamiento por objeto (`object-conditioned`), variante `bbtonly`, grupo `g2`, batch de 64, semilla 42, 30.000 pasos de entrenamiento y activación SiLU. Se trata de un artefacto de investigación derivado del job `junhyeong-e1e2-vla-object-conditioned-g2-1107-v2`, no de un modelo de lenguaje generalista.

El checkpoint contiene 6.915.094.616 parámetros (unos 6,9 mil millones) en formato safetensors, con un repositorio de 13,9 GB. Según la model card, es un backup de solo inferencia que incluye el tokenizador de acciones, la normalización, la etiqueta del decodificador y el contrato SiLU exactos, y requiere el runtime del proyecto RLDX-1 para funcionar. No incluye datos crudos, estados del optimizador ni estados RNG.

Su relevancia es acotada pero específica: forma parte de una línea de trabajo que busca usar demostraciones humanas como fuente de supervisión escalable para adaptar políticas robóticas preentrenadas, reduciendo la dependencia de costosa recolección de datos en el robot objetivo. El paper asociado (arXiv 2611.04391) reporta mejoras de transferencia fuera de distribución de 6,0 a 45,3 bajo cambios de colocación de objetos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política VLA; runtime RLDX-1) |
| Parámetros totales | 6.915.094.616 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. La model card lo describe como un checkpoint de una política VLA (vision-language-action) condicionada por objeto, entrenada hasta el paso verificado 30.000 dentro del job `junhyeong-e1e2-vla-object-conditioned-g2-1107-v2`. El sufijo `actsilu` indica el uso de activación SiLU como parte del contrato de inferencia, y el checkpoint incluye explícitamente el tokenizador de acciones, la normalización y la etiqueta del decodificador necesarios para reproducir el comportamiento en inferencia.

El entrenamiento se enmarca en el proyecto H2RB, cuyo objetivo es la transferencia humano-a-robot mediante una representación puente. El paper asociado describe el uso de demostraciones humanas como supervisión para adaptar políticas robóticas preentrenadas. No se especifican en la información proporcionada el número de tokens, la composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineación. El autor advierte explícitamente que la finalización del entrenamiento no equivale a una tasa de éxito robótica medida.

## Capacidades

- Generación de acciones robóticas condicionadas por objeto, dentro del pipeline VLA del proyecto H2RB.
- Inferencia con tokenizador de acciones y normalización específicos, incluidos en el checkpoint.
- Integración con el runtime del proyecto RLDX-1 (requisito declarado por el autor).
- Transferencia humano-a-robot: el marco H2RB está diseñado para aprovechar demostraciones humanas como supervisión.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni multilingüismo en la información disponible.

## Casos de uso

- Investigación en transferencia humano-a-robot: usar el checkpoint como política de referencia para reproducir los experimentos del job `junhyeong-e1e2-vla-object-conditioned-g2-1107-v2` y comparar con otras variantes del proyecto H2RB.
- Evaluación de robustez ante cambios de colocación de objetos: el paper reporta mejoras de transferencia fuera de distribución (de 6,0 a 45,3), por lo que el checkpoint sirve para medir ese comportamiento en entornos controlados.
- Punto de partida para fine-tuning condicionado por objeto: al ser un backup de inferencia con tokenizador y normalización exactos, puede reutilizarse como base en pipelines de adaptación posteriores.
- Reproducción de ablaciones: la nomenclatura (`bbtonly`, `g2`, `b64`, `s42`, `30k`, `actsilu`) permite emparejarlo con otras ejecuciones para aislar el efecto de cada variable.
- Validación de contratos de inferencia: útil para verificar que un runtime RLDX-1 dado reproduce las salidas esperadas con la activación SiLU y la normalización incluidas.
- Docencia y divulgación sobre VLA: ejemplo concreto de artefacto de investigación con metadatos de entrenamiento verificables (paso 30.000, job de origen).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica expresamente que la finalización del entrenamiento no constituye una tasa de éxito robótica medida. El único dato cuantitativo del paper asociado es la mejora de transferencia fuera de distribución de 6,0 a 45,3 bajo cambios de colocación de objetos, que no es un benchmark estándar de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; con 6,9 mil millones de parámetros en safetensors (13,9 GB en fp16/bf16), se necesitan al menos ~14 GB solo para los pesos, más memoria para activaciones y buffers del runtime.
- GPU recomendadas: no especificadas por el autor; por tamaño, una GPU con 24 GB o más (RTX 4090, A100, H100) es un punto de partida razonable, pero no está confirmado.
- ¿Cabe en GPU de consumo? Probablemente en tarjetas de 24 GB en precisión reducida, aunque no hay confirmación oficial ni requisitos publicados.
- Opciones de despliegue: el autor exige el runtime del proyecto RLDX-1; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para una política de acciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| h2rb-e1-object-conditioned-bbtonly-g2-b64-s42-30k-actsilu | 6.915.094.616 | no disponible | no disponible | Hugging Face (0 descargas) |
| junbrro/h2rb-e1-skill-single-g2-b64-s42-30k-actsilu | no disponible | no disponible | no disponible | Hugging Face |
| Políticas VLA genéricas (p. ej. OpenVLA, RT-2) | no disponible en la información | no disponible | no disponible | no disponible |

La comparativa con alternativas de la misma categoría no está disponible en la información proporcionada; el único pariente identificable es la variante `skill-single` del mismo autor.

## Limitaciones y advertencias

- Checkpoint de solo inferencia: no contiene datos crudos, estados del optimizador ni estados RNG, por lo que no es reanudable para entrenamiento.
- Requiere el runtime del proyecto RLDX-1; sin él, el tokenizador de acciones, la normalización y la etiqueta del decodificador incluidos no garantizan un comportamiento correcto.
- La finalización del entrenamiento (paso 30.000) no equivale a una tasa de éxito robótica medida; el autor lo advierte explícitamente.
- Licencia no especificada: no hay autorización declarada para uso comercial; debe tratarse como artefacto de investigación hasta confirmación del autor.
- Sin datos publicados de sesgos, alucinación, cobertura idiomática ni limitaciones de contexto.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria ni reportes independientes de funcionamiento.
- Nomenclatura muy específica del experimento: reutilizarlo fuera de su configuración original (batch, semilla, grupo) puede invalidar los resultados esperados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/junbrro/h2rb-e1-object-conditioned-bbtonly-g2-b64-s42-30k-actsilu-20261108
- Variante relacionada (skill-single): https://huggingface.co/junbrro/h2rb-e1-skill-single-g2-b64-s42-30k-actsilu-20261108
- Paper H2RB (arXiv 2611.04391): https://arxiv.org/abs/2611.04391
