# ModernoTech/Nova-Coder

## Resumen

Nova Coder es un repositorio de identidad y documentación publicado por Moderno Tech bajo la familia de productos Nova, descrito por su autor como un modelo especializado en ingeniería de software y análisis de código. En el momento de redactar esta ficha, el repositorio no contiene pesos verificados: el tamaño del repo es de 0.0 GB, el estado declarado es `documentation` y la sección de entrenamiento figura como `planned`. Se trata, por tanto, de un anuncio de producto y una estructura de documentación, no de un modelo descargable.

La model card indica como origen candidato `deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct` (con GGUF disponibles) y anota como arquitectura esperada un MoE de 16B con 2.6B parámetros activos. Esa procedencia está explícitamente marcada como "bajo auditoría" antes de publicación, y el autor declara que no se publicarán pesos sin verificación exacta de licencia y hash. No hay información sobre datos de entrenamiento, destilación, fine-tuning ni métricas.

La relevancia actual del repositorio es limitada desde el punto de vista técnico: no es posible evaluar el modelo porque no existe artefacto. Su interés es documental, como ejemplo de práctica de gobernanza (trazabilidad de procedencia, verificación de licencias, separación entre identidad de producto y pesos) y como posible base futura si Moderno Tech publica finalmente los pesos anunciados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (según notas de arquitectura esperada: 16B A2.6B MoE); no verificada |
| Parámetros totales | 16B (esperado, no verificado) |
| Parámetros activos | 2.6B (esperado, no verificado) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (se mencionan GGUF disponibles en el origen candidato, no en este repo) |
| Idiomas soportados | en, es |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (no hay pesos publicados) |

## Arquitectura y entrenamiento

La model card describe la arquitectura esperada como un Mixture of Experts de 16B parámetros totales con 2.6B activos por token, tomando como candidato de origen `deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct`. No se aporta ninguna confirmación técnica propia: no hay configuración de modelo, tokenizador, ni ficheros de pesos en el repositorio. La sección de entrenamiento y destilación figura como `planned`, sin datos sobre número de tokens, composición del dataset, RLHF, DPO ni ninguna otra fase de alineamiento.

Tampoco se documenta fine-tuning ni dataset propio. El autor indica que la verificación de licencia y hash del modelo candidato está en curso, lo que implica que cualquier afirmación sobre arquitectura o capacidades es provisional y depende de que finalmente se redistribuya el modelo base citado.

## Capacidades

- No hay capacidades verificadas: el repositorio no contiene pesos ni demo de inferencia (`inference: false`).
- Por el origen candidato declarado (DeepSeek-Coder-V2-Lite-Instruct), cabría esperar capacidades de generación de código y análisis de software, pero no están confirmadas en este repositorio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: se declaran los idiomas en y es, sin evaluación publicada.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

Dado que no existen pesos publicados, los casos de uso siguientes son hipotéticos y dependen de una futura publicación verificada. Se indican como escenarios plausibles, no como aplicaciones disponibles hoy.

- Evaluación de gobernanza de modelos: el repositorio sirve como referencia para auditar cómo un proveedor documenta procedencia, licencia y verificación de hash antes de publicar pesos.
- Ingeniería de software asistida (futuro): si se publican los pesos del MoE 16B A2.6B, podría emplearse en autocompletado y revisión de código en IDE, aprovechando la proporción de parámetros activos para reducir coste de inferencia.
- Análisis estático asistido: un modelo de código de este tamaño podría integrarse en pipelines de revisión para detectar patrones problemáticos y sugerir refactorizaciones.
- Generación de tests unitarios: uso típico de modelos de código instruct, pendiente de validación con los pesos reales.
- Documentación técnica automatizada: generación de docstrings y documentación de API a partir de código fuente.
- Soporte bilingüe en y es para equipos de desarrollo: la declaración de idiomas permitiría, en teoría, asistencia en castellano, aunque no hay evaluación publicada.
- Integración en CI/CD: solo viable una vez existan pesos y se valide latencia y formato de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica "Metrics documented: pending tests" y no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica.

## Requisitos de hardware

- VRAM estimada: no disponible, al no existir pesos publicados.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (el origen candidato cita GGUF, pero no se distribuyen en este repositorio).
- Latencia y throughput: no disponible.

Como referencia meramente orientativa, un MoE de 16B con 2.6B activos requeriría, en fp16, del orden de 32 GB solo para pesos, y menos en cuantizaciones de 4 bits; sin embargo, estos cálculos no están respaldados por artefactos publicados y no deben tomarse como especificación del producto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Nova Coder (Moderno Tech) | 16B A2.6B (esperado, no verificado) | no disponible | apache-2.0 | Sin pesos publicados |
| DeepSeek-Coder-V2-Lite-Instruct | 16B A2.6B | no disponible en esta ficha | no disponible en esta ficha | Pesos públicos (origen candidato citado) |
| Alternativas de código de tamaño similar | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No hay pesos publicados: el repositorio es solo documentación e identidad de producto; no es usable para inferencia.
- Toda la información técnica (arquitectura, tamaño, parámetros activos) es provisional y procede de notas de procedencia, no de artefactos verificados.
- La licencia apache-2.0 del repositorio no garantiza que los pesos futuros hereden esa licencia; el autor indica que la licencia del modelo candidato está bajo auditoría.
- Riesgo de confusión de marca: el nombre "Nova Coder" puede sugerir un producto operativo cuando el estado real es `planned`.
- Sin datos de sesgos, alucinación ni evaluación multilingüe; no es posible valorar riesgos de producción.
- El uso comercial queda condicionado a la publicación y verificación de pesos y a la licencia efectiva que se aplique en ese momento.
- No debe citarse este repositorio como fuente de especificaciones técnicas del modelo hasta que se publiquen artefactos verificables.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ModernoTech/Nova-Coder
- Modelo candidato citado: https://huggingface.co/deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
