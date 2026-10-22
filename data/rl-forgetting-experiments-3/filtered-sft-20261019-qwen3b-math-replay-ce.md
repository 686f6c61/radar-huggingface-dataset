# RL-Forgetting-Experiments-3/filtered-sft-20261019-qwen3b-math-replay-ce

## Resumen

`RL-Forgetting-Experiments-3/filtered-sft-20261019-qwen3b-math-replay-ce` es un repositorio de artefactos de investigación publicado por el colectivo «RL-Forgetting-Experiments-3» el 22 de octubre de 2026. No es un modelo único listo para usar, sino la entrega incremental de un experimento de SFT filtrado con 15 ramas (*arms*), según indica su propia model card. El nombre y la descripción sugieren que se trata de un derivado de Qwen2.5-3B afinado sobre datos de matemáticas con una estrategia de *replay* y algún criterio de filtrado basado en entropía cruzada («ce»), aunque la ficha no documenta la metodología.

El interés del repositorio es metodológico: sirve para estudiar el olvido catastrófico (*forgetting*) que provoca el ajuste supervisado selectivo y cómo afecta el reinyectar datos de las capacidades originales. El tamaño del repositorio (86,4 GB) es muy superior al de un checkpoint de 3 000 millones de parámetros en fp16 (unos 6 GB), lo que confirma que contiene múltiples checkpoints intermedios y finales, además de posibles artefactos de evaluación.

Conviene subrayar que la model card advierte explícitamente de que las ejecuciones incompletas no deben tratarse como estudios cerrados y remite al `delivery_manifest.json` del dataset para verificar unidades subidas y hashes. No hay pipeline declarado, ni idiomas declarados, ni benchmarks publicados, y la búsqueda web realizada no devolvió ninguna fuente relevante sobre este repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, derivado de Qwen2.5-3B (según la model card); no se detalla la configuración interna |
| Parámetros totales | Aproximadamente 3 000 millones (inferido de la referencia a Qwen2.5-3B; el recuento exacto no se publica) |
| Parámetros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio solo declara pesos en safetensors; no se publican GGUF ni variantes cuantizadas) |
| Idiomas soportados | No disponible (el campo `language` no está declarado en la model card) |
| Licencia | `other`: los derivados de Qwen retienen la «Qwen RESEARCH LICENSE AGREEMENT»; los derivados de Llama usan la Llama 3.2 Community License y su Acceptable Use Policy |
| Formato de pesos | safetensors; checkpoints en `runs/checkpoints/step_N/model` y modelos finales en `runs/final`, con carga mediante subcarpeta |

## Arquitectura y entrenamiento

La información disponible solo permite afirmar que se trata de derivados de modelos de 3 000 millones de parámetros: por el identificador del repositorio, la variante principal es Qwen2.5-3B, mientras que la model card menciona también derivados de Llama 3.2-3B como parte del mismo marco experimental. No se especifica el número de capas, dimensiones ocultas, mecanismo de atención ni si se introdujo algún cambio estructural respecto al modelo base. Tampoco se documenta la longitud de contexto efectiva tras el ajuste.

En cuanto al entrenamiento, la card describe una «entrega incremental» de un experimento de SFT filtrado con 15 ramas, con datos de matemáticas y *replay*. No se indica el volumen de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO o preferencias. El sufijo «ce» del nombre apunta a un filtrado por entropía cruzada, pero se trata de una inferencia a partir del identificador y no de un dato confirmado. No se describen innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento matemático: el ajuste se orienta a problemas de matemáticas, aunque no hay evaluación publicada que lo cuantifique.
- Razonamiento multi-paso: esperable en un modelo afinado sobre datos matemáticos, sin confirmación documental.
- Soporte de *tool calling* / *function calling*: no disponible; no se declara en la model card.
- Soporte de agentes: no disponible; no hay evidencia de entrenamiento para uso agéntico.
- Capacidades multilingües: no disponibles; el campo de idiomas está vacío y el ajuste parece centrado en inglés.
- Capacidades especiales: modo *thinking*, visión o audio no disponibles; el repositorio no menciona ninguna.
- Capacidad de servir como checkpoint intermedio reproducible: es la función real del artefacto, con puntos de control por paso (`step_N`) para analizar la evolución del olvido.

## Casos de uso

- Estudio del olvido catastrófico: comparar los checkpoints `step_N` frente al modelo base Qwen2.5-3B en tareas generales permite medir la degradación introducida por el SFT filtrado en matemáticas, que es el objetivo declarado del experimento.
- Ablación de estrategias de filtrado de datos: las 15 ramas del experimento permiten aislar el efecto de distintos criterios de selección (incluido el filtrado por entropía cruzada sugerido por el sufijo «ce») sobre la retención de capacidades.
- Evaluación del *replay* como técnica de mitigación: el sufijo «math-replay» indica reinyección de datos; el repositorio sirve para comparar curvas de retención con y sin *replay* sobre el mismo presupuesto de cómputo.
- Punto de partida para experimentos propios de ajuste: un investigador puede tomar un checkpoint intermedio o final como inicialización para un SFT posterior y comparar contra el base, siempre que respete las restricciones de licencia.
- Docencia y formación en pipelines de SFT: el repositorio ilustra buenas prácticas de entrega (manifiesto con hashes, separación entre checkpoints y modelos finales, advertencia sobre ejecuciones incompletas) útiles en cursos de posgrado o *bootcamps* de IA.
- Reproducibilidad y auditoría de artefactos: el `delivery_manifest.json` y los hashes permiten verificar la integridad de las subidas, un caso de uso relevante para equipos que auditan publicaciones de investigación.
- Construcción de *baselines* internos: sirve como referencia de un modelo de 3 000 millones afinado en matemáticas al comparar futuros desarrollos propios, sin necesidad de desplegarlo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, GSM8K, HumanEval, MATH ni métricas de retención, y el buscador no devolvió ninguna fuente asociada al repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 6,2 GB solo para pesos de 3 000 millones de parámetros; con caché KV y *overhead* del runtime, entre 8 y 10 GB para contextos cortos.
- VRAM estimada en 8 bits: aproximadamente 3,2 GB de pesos; en 4 bits, alrededor de 1,8-2,2 GB, siempre que se genere la cuantización a partir de los safetensors publicados.
- GPU recomendadas: A100 40/80 GB o H100 para servir varias réplicas o contextos largos; L40S o A10G para servicio de una sola instancia; RTX 4090 para desarrollo y evaluación local.
- GPU de consumo: sí cabe. Una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4090 ejecutan el modelo en fp16 con margen; tarjetas de 8 GB requieren cuantización de 8 o 4 bits.
- Opciones de despliegue: vLLM o TGI para servicio con safetensors (apuntando a la subcarpeta del checkpoint concreto); llama.cpp u Ollama solo tras convertir a GGUF, paso que el repositorio no proporciona.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia por petición.
- Almacenamiento: el repositorio completo ocupa 86,4 GB, por lo que conviene descargar únicamente la subcarpeta del checkpoint de interés en lugar de clonar el repo entero.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (derivado Qwen2.5-3B, SFT matemáticas con replay) | ~3 000 M | No disponible | `other` (Qwen Research License según la card) | safetensors | Público en HuggingFace, 0 descargas |
| Qwen2.5-3B-Instruct (modelo base de referencia) | 3 000 M | No verificado en esta ficha | Apache 2.0 según la documentación habitual del upstream; la card de este derivado declara una licencia de investigación | safetensors, GGUF | Público y ampliamente desplegado |
| Llama 3.2-3B-Instruct (base alternativa citada en la card) | 3 000 M | No verificado en esta ficha | Llama 3.2 Community License | safetensors, GGUF | Público, requiere aceptación de la licencia |

No se dispone de datos de rendimiento comparables para este checkpoint, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo listo para producción: es un artefacto de investigación con 0 descargas y 0 likes, sin pipeline declarado y sin evaluación publicada.
- La propia model card advierte de que las ejecuciones incompletas no deben considerarse estudios cerrados; parte de las 15 ramas puede estar incompleta o no subida.
- Licencia `other` con fuerte restricción: los derivados de Qwen retienen la Qwen Research License, lo que en la práctica limita el uso comercial. Además, la card atribuye a Qwen2.5-3B una licencia de investigación que no coincide con la Apache 2.0 publicada habitualmente para ese modelo base; conviene verificar la licencia real antes de cualquier uso.
- Los derivados de Llama quedan sujetos a la Llama 3.2 Community License y su Acceptable Use Policy, con obligaciones de atribución y restricciones de uso.
- Riesgo de alucinación: no evaluado. Un ajuste intensivo en matemáticas sin *replay* suficiente puede degradar el lenguaje general y aumentar la generación de pasos plausibles pero incorrectos.
- Sesgos: no documentados. Al no publicarse la composición del dataset, no es posible evaluar sesgos de género, idioma o dominio.
- Limitaciones de idioma: el campo de idiomas está vacío; no hay garantía de calidad fuera del inglés.
- Limitaciones de contexto: se desconoce si el ajuste preserva la ventana nativa del modelo base.
- Trazabilidad: la verificación de integridad depende del `delivery_manifest.json` del dataset asociado, que no forma parte de este repositorio; sin él no se pueden validar hashes.
- Riesgo operativo: 86,4 GB de repositorio hacen fácil descargar checkpoints equivocados o incompletos; hay que seleccionar la subcarpeta concreta.
- La búsqueda web no devolvió ninguna fuente independiente sobre este repositorio, por lo que no existe validación externa de sus resultados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/RL-Forgetting-Experiments-3/filtered-sft-20261019-qwen3b-math-replay-ce
- Licencia y política de uso de Llama 3.2 (citada en la model card): https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Paper, blog, repositorio de código o demo: no disponibles. La búsqueda web no devolvió resultados relevantes sobre este modelo.
