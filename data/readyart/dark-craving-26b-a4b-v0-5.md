# ReadyArt/Dark-Craving-26B-A4B-v0.5

## Resumen

Dark-Craving-26B-A4B-v0.5 es un fine-tune del modelo google/gemma-4-26B-A4B-it publicado por el usuario ReadyArt en Hugging Face. Se trata de un ajuste orientado a contenido para adultos, roleplay conversacional y ERP (erotic roleplay), con etiquetas que lo clasifican explícitamente como NSFW, "unaligned" y "not-for-all-audiences". El modelo hereda la arquitectura y el tamaño del Gemma 4 26B A4B original, del que no se dispone de ficha técnica pública en la información proporcionada.

La relevancia de esta ficha es limitada desde el punto de vista de la investigación aplicada: se trata de un modelo derivado con cero descargas en el momento de la consulta, un solo "like" y acceso restringido (gated) en Hugging Face. No se han publicado detalles sobre el dataset de ajuste, el proceso de entrenamiento, los hiperparámetros empleados ni evaluaciones de rendimiento. La información disponible se limita a los metadatos del repositorio.

Por tanto, esta ficha documenta lo que se puede verificar objetivamente a partir de los metadatos y marca explícitamente como "no disponible" todo aquello que el autor no ha publicado. Cualquier evaluación de calidad, seguridad o idoneidad para producción requeriría acceso al modelo y a documentación adicional que no consta en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de google/gemma-4-26B-A4B-it; presumiblemente transformer Mixture-of-Experts por el sufijo "A4B", sin confirmar) |
| Parámetros totales | 26B (según el nombre del modelo; no confirmado en ficha técnica) |
| Parámetros activos | 4B (según el sufijo "A4B" del nombre; no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio no documenta versiones GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (no se especifica safetensors, GGUF ni otros) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura en la model card del repositorio. El nombre del modelo sugiere una arquitectura Mixture-of-Experts con 26B parámetros totales y 4B activos, siguiendo la convención de nomenclatura habitual en la familia Gemma, pero este dato no está confirmado por documentación técnica del autor. El modelo base declarado es google/gemma-4-26B-A4B-it, un modelo instructivo de Google del que tampoco se aportan detalles en la información disponible.

Respecto al entrenamiento, no consta el número de tokens utilizados en el ajuste fino, la composición del dataset, si se emplearon técnicas de RLHF, DPO, ORPO u otras, ni los hiperparámetros del fine-tuning. La etiqueta "unaligned" sugiere que el ajuste se realizó deliberadamente para reducir o eliminar los mecanismos de alineación y rechazo del modelo base, algo habitual en fine-tunes orientados a roleplay sin restricciones, pero el autor no documenta la metodología. No se describe ninguna innovación técnica (decodificación especulativa, atención lineal, modos de razonamiento) más allá de lo que herede del modelo base.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogos multi-turno de roleplay.
- Contenido explícito para adultos (NSFW, ERP), según las etiquetas del repositorio.
- Modo instructivo heredado del modelo base (sufijo "-it"), aunque no se documenta el grado de preservación tras el ajuste.
- Comportamiento "unaligned": presumiblemente menor tasa de rechazos ante peticiones que el modelo base rechazaría, sin datos que lo cuantifiquen.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Capacidades de visión, audio o thinking mode: no disponible (no documentado).

## Casos de uso

- Roleplay conversacional para adultos: el modelo está explícitamente ajustado para mantener personajes y narrativas multi-turno con contenido explícito, lo que lo hace adecuado para aplicaciones de entretenimiento para adultos con las salvaguardas legales correspondientes.
- Generación de ficción erótica: puede emplearse como asistente de escritura creativa para autores que trabajan en el género, siempre que se respeten las políticas de la plataforma de despliegue.
- Prototipado de chatbots de personaje sin filtros: útil para investigar cómo se comporta un modelo "unaligned" en conversaciones abiertas, comparándolo con el modelo base alineado.
- Investigación sobre alineación y seguridad: sirve como caso de estudio de fine-tunes que eliminan mecanismos de rechazo, para analizar qué tipos de contenido emergen y cómo detectarlos.
- Simulación de diálogos para guionización: generación de borradores de diálogo en contextos narrativos maduros, con revisión humana obligatoria.
- Evaluación comparativa de fine-tunes NSFW: como referencia en estudios sobre degradación de capacidades generales tras ajustes no alineados, aunque sin benchmarks publicados la comparación sería puramente cualitativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el tamaño declarado (26B totales, 4B activos), en FP16 requeriría del orden de 52 GB solo para pesos, y en cuantización de 4 bits del orden de 13-16 GB, pero estos cálculos no están confirmados por el autor ni por el modelo base documentado.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar A100 80GB o H100 para FP16/BF16 sin cuantizar, y GPUs consumer de 24 GB (RTX 3090/4090) solo con cuantización agresiva, sujeto a verificación.
- Compatibilidad con GPU consumer: no confirmada.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no documentadas. Al no publicarse formatos GGUF ni configuraciones de serving, no se puede garantizar compatibilidad con ninguno.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| ReadyArt/Dark-Craving-26B-A4B-v0.5 | 26B (4B activos, según nombre) | no disponible | apache-2.0 | Gated | Fine-tune NSFW sin benchmarks ni documentación técnica |
| google/gemma-4-26B-A4B-it | 26B (4B activos, según nombre) | no disponible | no disponible en esta ficha | no disponible | Modelo base alineado; referencia directa del fine-tune |
| Alternativas NSFW de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con otros fine-tunes de la misma categoría.

## Limitaciones y advertencias

- Contenido explícito para adultos: el modelo está diseñado para generar material NSFW y no es apto para menores ni para despliegues sin control de edad.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face; no es de descarga libre inmediata.
- Ausencia total de documentación técnica: sin model card detallada, sin dataset descrito, sin hiperparámetros y sin benchmarks, lo que impide evaluar su calidad de forma rigurosa.
- Riesgo elevado de alucinación y degradación de capacidades: los fine-tunes "unaligned" sobre modelos instructivos suelen perder precisión en tareas factuales y de razonamiento, aunque no hay datos que lo confirmen para este modelo concreto.
- Sesgos desconocidos: al no documentarse el dataset de ajuste, no se pueden identificar sesgos específicos; cabe esperar los del modelo base más los introducidos por el corpus de roleplay.
- Idioma limitado al inglés: no se declara soporte de castellano ni de otros idiomas.
- Licencia apache-2.0 declarada, pero el modelo base es de Google y puede estar sujeto a sus propios términos de uso; conviene verificar la compatibilidad antes de un uso comercial.
- Cero descargas y un solo "like": no hay evidencia de uso en producción ni de validación por parte de la comunidad.
- Fecha de creación futura (2026-11-01) en los metadatos: dato anómalo que conviene contrastar antes de confiar en el repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/ReadyArt/Dark-Craving-26B-A4B-v0.5
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
