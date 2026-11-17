# eduardoworrel/Jurema-7B-LGPD-LoRA

## Resumen

Jurema-7B-LGPD-LoRA es un adaptador LoRA (PEFT) publicado por el usuario eduardoworrel sobre el modelo base Jurema-br/Jurema-7B, orientado a la clasificación de texto en el dominio de políticas de privacidad y cumplimiento de la LGPD (Lei Geral de Proteção de Dados de Brasil). El repositorio se etiqueta con `text-classification`, `privacy-policy`, `lgpd` y `pointer-head`, lo que sugiere un uso para etiquetado o extracción de fragmentos relevantes en documentos legales de privacidad, más que para generación libre de texto.

El adaptador tiene un tamaño de repositorio de 0,2 GB, coherente con un conjunto de pesos LoRA sobre un modelo de 7 000 millones de parámetros, y se distribuye en formato safetensors bajo la librería `peft`. El acceso está restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargarlo. La licencia declarada es CC-BY-4.0, lo que permite uso comercial con atribución, aunque conviene verificar las condiciones adicionales del modelo base.

La relevancia de esta ficha es acotada: se trata de un adaptador de nicho, con cero descargas y cero likes en el momento de la consulta, sin documentación técnica publicada en la información disponible. Resulta útil como ejemplo de especialización mediante LoRA sobre un modelo brasileño para tareas de cumplimiento normativo, pero no debe confundirse con un modelo fundacional ni con un sistema listo para producción sin evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (modelo base Jurema-br/Jurema-7B) |
| Parametros totales | No disponible (el adaptador LoRA es un subconjunto; el modelo base tiene 7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en safetensors; el adaptador puede combinarse con el base cuantizado, pero no se documenta) |
| Idiomas soportados | Portugués (pt) e inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Safetensors (adaptador LoRA, librería `peft`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, matrices de bajo rango inyectadas en las capas del modelo base Jurema-br/Jurema-7B, que permanece congelado durante el ajuste. La etiqueta `pointer-head` sugiere que el adaptador se acompaña de una cabeza de punteros para tareas de extracción de spans (selección de fragmentos de texto), típica de la clasificación de cláusulas en documentos legales. No se dispone de información sobre el rango del adaptador, las capas objetivo, la tasa de aprendizaje ni la composición exacta del dataset de ajuste.

No se han publicado detalles sobre el número de tokens de entrenamiento, la procedencia de los documentos de políticas de privacidad utilizados, ni si hubo etapas de RLHF o DPO. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.). Toda la información técnica disponible se limita a las etiquetas del repositorio y a la identificación del modelo base.

## Capacidades

- Clasificación de texto en el dominio de políticas de privacidad y LGPD, presumiblemente mediante etiquetado de fragmentos o cláusulas.
- Extracción de spans relevantes gracias a la componente `pointer-head` declarada en las etiquetas.
- Procesamiento de texto en portugués e inglés.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión ni audio.
- Al ser un adaptador sobre un modelo de 7B, hereda las capacidades lingüísticas del base, pero el adaptador está especializado y no se recomienda su uso para generación abierta.

## Casos de uso

- Revisión de políticas de privacidad: el adaptador puede clasificar secciones de una política para identificar cláusulas relacionadas con consentimiento, retención de datos o derechos del titular, facilitando auditorías de cumplimiento de la LGPD.
- Extracción de metadatos en registros de tratamiento: integrado en un pipeline de ingesta documental, permite marcar fragmentos que describen finalidades y bases legales, que luego se revisan manualmente.
- Triaje en departamentos de protección de datos: prioriza documentos o párrafos que requieren revisión humana según su relevancia para requisitos normativos, reduciendo el volumen de lectura inicial.
- Enriquecimiento de bases de conocimiento legales: genera etiquetas estructuradas sobre cláusulas de privacidad para alimentar un índice de búsqueda o un sistema de gestión documental.
- Investigación académica en PLN jurídico: sirve como punto de partida para experimentos de clasificación de cláusulas en portugués, dado su carácter abierto y su licencia permisiva.
- Prototipado de asistentes de cumplimiento: combinado con el modelo base, permite construir demostraciones de clasificación y extracción de cláusulas antes de invertir en un ajuste a mayor escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 0,2 GB, por lo que el requisito real lo determina el modelo base de 7B.
- Inferencia del modelo base en precisión completa (FP16/BF16): en torno a 14-16 GB de VRAM.
- Inferencia con cuantización de 8 bits: aproximadamente 8-9 GB de VRAM.
- Inferencia con cuantización de 4 bits: aproximadamente 5-6 GB de VRAM.
- GPU recomendadas: A100 40 GB o H100 para servir el modelo base sin cuantizar con margen; RTX 4090 (24 GB) y RTX 3090 (24 GB) para FP16; RTX 4070 Ti/4080 (12-16 GB) para cuantización de 8 bits.
- Cabe en GPU de consumo: sí, con cuantización de 4 u 8 bits en tarjetas de 8-16 GB; en FP16 requiere tarjetas de 24 GB.
- Opciones de despliegue: al ser un adaptador PEFT, se carga con la librería `peft` junto al modelo base; para servir en producción se puede fusionar el adaptador con el base y desplegar con vLLM, TGI o llama.cpp (previa conversión a GGUF). No se documenta compatibilidad específica con Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jurema-7B-LGPD-LoRA | Adaptador sobre 7B | No disponible | Clasificación de políticas de privacidad (LGPD) | CC-BY-4.0 | Gated en Hugging Face |
| Jurema-br/Jurema-7B | 7B | No disponible | Modelo base generalista en portugués | No disponible en la información | Hugging Face |
| Alternativas de clasificación legal en portugués | No disponible | No disponible | Clasificación de cláusulas | No disponible | No disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El repositorio no incluye documentación técnica, ficha de modelo detallada ni resultados de evaluación, lo que impide verificar su calidad y su comportamiento real.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni validación por parte de la comunidad.
- El acceso es restringido (gated): es necesario aceptar condiciones en Hugging Face, lo que puede limitar la reproducibilidad y la automatización de descargas.
- Al ser un adaptador especializado, no debe emplearse para generación abierta ni como sustituto del modelo base en tareas generales.
- Riesgo de alucinación y de clasificaciones erróneas en documentos legales: los resultados deben revisarse por personal cualificado antes de tomar decisiones de cumplimiento.
- Sesgos potenciales derivados del corpus de ajuste, que no se documenta; puede tener un rendimiento desigual según el tipo de política de privacidad o el sector.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero deben respetarse las condiciones del modelo base Jurema-br/Jurema-7B, que no se detallan en la información disponible.
- No se especifica la longitud de contexto soportada, por lo que no se recomienda su uso con documentos muy extensos sin truncado o segmentación previa.

## Enlaces

- Hugging Face: https://huggingface.co/eduardoworrel/Jurema-7B-LGPD-LoRA
- Modelo base: https://huggingface.co/Jurema-br/Jurema-7B
- Referencia arXiv indicada en las etiquetas: arxiv:2611.15302 (no verificada en la información disponible)
