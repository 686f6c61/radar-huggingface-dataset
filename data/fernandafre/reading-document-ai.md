# fernandafre/reading-document-ai

## Resumen

`fernandafre/reading-document-ai` es un repositorio alojado en HuggingFace que, pese a sus etiquetas (`safetensors`, `transformer`), no contiene un modelo entrenado ni un checkpoint utilizable para inferencia. La propia model card lo describe como un conjunto estructurado de notas de investigación sobre Document AI, con `summary.md` como artefacto principal y `README.md` como documentación. Se declaran referencias de evaluación concretas (FUNSD, SROIE, CORD) y preguntas abiertas, pero el autor indica explícitamente que no reclama mejoras de benchmark, ablaciones completadas, código publicado ni checkpoint entrenado.

El repositorio tiene 0 descargas y 0 likes, un tamaño de 0.0 GB y fue creado y actualizado el mismo día (2026-10-09). El único dato cuantitativo verificable es un artefacto safetensors con 16.576 parámetros totales, una cifra compatible con un tensor residual o un archivo auxiliar, no con un transformer funcional. No se declara pipeline de inferencia, ni idiomas soportados, ni arquitectura concreta.

Por tanto, esta ficha debe leerse como una descripción de un cuaderno de investigación abierto, no como la de un modelo desplegable. Es relevante únicamente como material de referencia metodológica para quien trabaje en extracción de información de documentos, y no debe confundirse con alternativas reales del ámbito como LayoutLMv3, Donut o TrOCR.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta `transformer` no se corresponde con ninguna arquitectura documentada en la model card) |
| Parámetros totales | 16.576 (dato real del artefacto safetensors) |
| Parámetros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (artefacto de 16.576 parámetros); el contenido principal del repositorio son archivos Markdown (`summary.md`, `README.md`) |

## Arquitectura y entrenamiento

No se dispone de información sobre arquitectura. La model card no describe capas, dimensión de embeddings, número de cabezas de atención, mecanismo de atención ni tipo de tokenizador. La etiqueta `transformer` figura en los metadatos del repositorio, pero no va acompañada de ninguna configuración publicada. Tampoco hay `config.json`, código de modelado ni pesos con forma coherente con un transformer: 16.576 parámetros en total es un orden de magnitud muy inferior al de cualquier modelo de lenguaje o de visión para documentos (los modelos de Document AI habituales se sitúan entre decenas y cientos de millones de parámetros).

Respecto al entrenamiento, el autor es explícito: el repositorio contiene notas exploratorias y no reclama resultados completados ni ablaciones ejecutadas. No se indican tokens de entrenamiento, composición del dataset, ni fases de ajuste como RLHF, DPO o SFT. Las referencias a FUNSD, SROIE y CORD se presentan como contexto de evaluación propuesto y como punto de partida para verificación, no como evidencia de experimentos realizados. El propio README advierte que las secciones etiquetadas como planes o hipótesis no deben interpretarse como resultados experimentales.

## Capacidades

- No se documenta ninguna capacidad de inferencia: el repositorio no incluye pipeline declarado ni código de generación.
- No hay soporte declarado de generación de texto, razonamiento, código, matemáticas ni visión.
- No hay soporte declarado de tool calling ni function calling.
- No hay soporte declarado de agentes ni de razonamiento multi-paso.
- No se declaran capacidades multilingües ni idiomas soportados.
- El único contenido funcional es documental: notas de investigación sobre el alcance de una pregunta de investigación, confounders probables, una comparación propuesta con baselines emparejados, contexto de evaluación (FUNSD, SROIE, CORD), comprobaciones de reproducibilidad, modos de fallo y preguntas abiertas.

## Casos de uso

- Revisión metodológica previa a un proyecto de Document AI: `summary.md` puede usarse como lista de comprobación para identificar confounders y definir baselines emparejados antes de invertir en entrenamiento.
- Selección de conjuntos de datos de evaluación: las referencias a FUNSD, SROIE y CORD sirven como punto de partida documental para elegir benchmarks de extracción de entidades y comprensión de recibos, siempre verificando las versiones y licencias de cada dataset por separado.
- Diseño de protocolos de reproducibilidad: el repositorio enumera qué debería registrarse al añadir resultados (versiones de dataset, comandos, semillas, hardware y logs en crudo), lo que es reutilizable como plantilla de trazabilidad.
- Catalogación de modos de fallo: la sección de failure modes puede alimentar una matriz de riesgos para sistemas de extracción documental en producción.
- Formación y divulgación: material de lectura para equipos que necesiten entender el estado de la cuestión y las preguntas abiertas en Document AI sin partir de cero.
- Auditoría de expectativas: sirve para contrastar afirmaciones de rendimiento de terceros contra un listado explícito de lo que constituye evidencia válida (datos crudos, seeds, hardware).
- No es adecuado para ningún caso de uso de inferencia, generación, clasificación o extracción en producción, dado que no existe modelo entrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el repositorio no reclama mejoras de benchmark ni ablaciones completadas. Las menciones a FUNSD, SROIE y CORD corresponden a contexto de evaluación propuesto, no a métricas obtenidas.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable. No existe un modelo funcional que cargar; el artefacto safetensors de 16.576 parámetros ocuparía del orden de decenas de kilobytes en fp32, una cifra irrelevante a efectos prácticos y no representativa de ninguna carga de trabajo real.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no aplicable, al no existir inferencia que ejecutar.
- Opciones de despliegue: no disponible. No se declara compatibilidad con vLLM, llama.cpp, Ollama, TGI ni ningún otro servidor de inferencia.
- Latencia y throughput estimados: no disponibles.
- Requisitos reales de uso: un cliente Git o la interfaz web de HuggingFace para leer dos archivos Markdown.

## Comparativa con modelos similares

No disponible. Esta entrada no es un modelo entrenado, por lo que no existe una comparativa de rendimiento posible frente a otras alternativas. Como referencia orientativa del ámbito en el que se enmarcan las notas (Document AI), las familias habitualmente consideradas son LayoutLMv3, Donut y TrOCR, pero no se dispone en la información proporcionada de datos verificados sobre sus parámetros, contexto, licencia o métricas que permitan elaborar una tabla rigurosa en esta ficha. Cualquier comparación debería hacerse consultando las fichas oficiales de esos modelos.

| Criterio | Este repositorio | Modelos de Document AI consolidados |
|---|---|---|
| Naturaleza | Notas de investigación (Markdown) + artefacto safetensors de 16.576 parámetros | Modelos entrenados con pesos publicados |
| Inferencia | No disponible | Sí |
| Benchmarks publicados | Ninguno | No verificado en esta información |
| Licencia | cc-by-4.0 | No disponible en esta información |

## Limitaciones y advertencias

- No es un modelo: no debe citarse ni desplegarse como si lo fuera. La etiqueta `transformer` en los metadatos puede inducir a error a herramientas de descubrimiento automático.
- Los 16.576 parámetros del artefacto safetensors no son coherentes con un transformer funcional; su función real no está documentada.
- Riesgo de interpretación errónea: las secciones de planes e hipótesis pueden confundirse con resultados si se leen fuera de contexto. El autor pide explícitamente lo contrario.
- Sesgos conocidos: no disponibles. No hay evaluación de sesgo, ni datos de entrenamiento que la permitan.
- Riesgo de alucinación: no aplicable al no existir generación; el riesgo equivalente es atribuir a este repositorio conclusiones que no ha demostrado.
- Limitaciones de contexto e idioma: no disponibles, no aplicables.
- Licencia: cc-by-4.0 permite uso comercial con atribución, pero el README advierte de que los términos de los datos de origen deben revisarse por separado cuando el repositorio se use con datasets externos (FUNSD, SROIE, CORD tienen sus propias condiciones).
- Reproducibilidad: no hay semillas, comandos, versiones de dataset ni logs, porque no hay experimentos ejecutados. Los campos requeridos están descritos como expectativa futura, no como material existente.
- Adopción: 0 descargas y 0 likes, sin validación externa de la comunidad.
- Fecha de creación y actualización idénticas (2026-10-09), lo que sugiere un repositorio recién publicado y sin mantenimiento posterior verificable.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/fernandafre/reading-document-ai
- `summary.md` (artefacto principal, referenciado en la model card dentro del propio repositorio)
- `README.md` (documentación del repositorio)
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios de código o demos.
