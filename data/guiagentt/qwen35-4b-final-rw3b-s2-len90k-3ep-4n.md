# GUIAgentt/qwen35-4b-final-rw3b-s2-len90k-3ep-4n

## Resumen

El modelo `GUIAgentt/qwen35-4b-final-rw3b-s2-len90k-3ep-4n` es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-4B, publicado por el usuario GUIAgentt en Hugging Face. Por su nomenclatura y sus etiquetas (`gui-agent`, `web-agent`), está orientado a tareas de agente de interfaz gráfica y de navegación web: es decir, a interpretar pantallas, decidir acciones sobre elementos de UI y ejecutar flujos multi-paso en entornos web. El nombre codifica detalles del entrenamiento: `rw3b` (probablemente datos de recompensa/refuerzo de 3 mil millones de muestras o tokens), `s2` (etapa o semilla 2), `len90k` (longitud de contexto de entrenamiento de 90 000 tokens) y `3ep` (3 épocas).

El modelo tiene 5.174.964.736 parámetros totales según los pesos en safetensors, lo que lo sitúa en la categoría de 5B pese a derivar de una base de 4B (el incremento puede deberse a la inclusión de cabezas adicionales, embeddings extendidos o parámetros de adaptadores fusionados). El repositorio ocupa 10,4 GB, lo que sugiere pesos en precisión BF16/FP16 sin cuantizar. Es relevante porque los agentes GUI/web requieren ventanas de contexto muy largas (capturas de pantalla, historial de acciones, DOM serializado) y este ajuste declara explícitamente un entrenamiento con longitud de 90k, algo poco habitual en modelos de 4-5B.

La información pública disponible es muy escasa: cero descargas, cero likes, sin model card descriptiva, sin pipeline declarado, sin idiomas especificados y con acceso restringido (gated). La licencia figura como "other", lo que obliga a revisar los términos del modelo base Qwen3.5-4B antes de cualquier uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B); detalles exactos no disponibles |
| Parámetros totales | 5.174.964.736 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 90 000 tokens (según nombre del modelo y entrenamiento declarado); contexto nativo de la base no disponible |
| Tipos de cuantización | no disponible (repo en safetensors, presumiblemente BF16/FP16) |
| Idiomas soportados | no disponible |
| Licencia | other (acceso restringido/gated; sujeto a condiciones en Hugging Face y a la licencia del modelo base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer decoder-only de la familia Qwen 3.5. No se dispone de la model card del ajuste, por lo que los detalles sobre datos de entrenamiento, composición del dataset, uso de RLHF/DPO o técnicas de alineación no están publicados. La nomenclatura del repositorio indica un entrenamiento supervisado (SFT) en tres épocas sobre secuencias de hasta 90 000 tokens, con una etapa o configuración "s2" y un componente "rw3b" que podría corresponder a datos de recompensa o a un volumen de 3 mil millones de muestras/tokens; esta interpretación no está confirmada por el autor.

El dominio declarado en las etiquetas (`gui-agent`, `web-agent`) sugiere que el dataset de ajuste contiene trayectorias de interacción con interfaces: observaciones (capturas, árboles de accesibilidad, HTML), acciones (clic, escritura, scroll, navegación) y recompensas o etiquetas de éxito. La longitud de 90k es coherente con la necesidad de mantener en contexto el historial completo de una sesión de agente junto con la representación de la pantalla. No hay información sobre innovaciones técnicas adicionales (atención lineal, decodificación especulativa, cabezas auxiliares) más allá de lo que herede del modelo base.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Qwen3.5-4B.
- Agente de interfaz gráfica (GUI): interpretación de pantallas y selección de acciones sobre elementos de UI, según la etiqueta `gui-agent`.
- Agente web: navegación multi-paso, formularios y flujos en páginas web, según la etiqueta `web-agent`.
- Razonamiento multi-paso con historial largo: el entrenamiento con secuencias de 90k permite mantener trayectorias extensas de acciones y observaciones.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible; probablemente heredado de la base, pero no verificable.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el modelo es de texto y no se declara soporte multimodal nativo, aunque las tareas GUI suelen requerir representaciones textuales de la pantalla.

## Casos de uso

- Automatización de pruebas de interfaz: el modelo puede generar y ejecutar secuencias de acciones sobre una aplicación web a partir de un objetivo en lenguaje natural, usando el contexto de 90k para mantener el estado de la sesión y el historial de pasos.
- Agente de navegación web para tareas repetitivas: rellenar formularios, extraer datos de portales y completar flujos de compra o reserva, aprovechando el ajuste específico en dominios web.
- Asistente de operaciones en back-office: interpretar pantallas de sistemas internos (ERP, CRM) y proponer o ejecutar clics y entradas de datos, con trazabilidad del historial de acciones en contexto.
- Agente de accesibilidad: traducir instrucciones en lenguaje natural a acciones sobre la UI para usuarios con dificultades motoras, manteniendo contexto de la tarea a lo largo de sesiones largas.
- Evaluación de agentes y generación de datos sintéticos: usar el modelo para producir trayectorias etiquetadas de interacción GUI/web que alimenten el entrenamiento de otros agentes o benchmarks.
- Automatización de soporte de primer nivel: resolver incidencias guiadas paso a paso en portales de cliente, donde el contexto largo permite recordar el estado previo de la conversación y de la pantalla.
- Integración en pipelines de CI/CD para pruebas end-to-end: sustituir o complementar scripts de Selenium/Playwright con un agente que decide acciones dinámicamente según el estado de la página.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 10,3 GB solo para pesos (5,17B × 2 bytes), más overhead de activaciones y caché KV; con contexto de 90k la caché KV puede añadir varios GB según la configuración de atención.
- Cuantización a 8 bits: ~5,2 GB de pesos; a 4 bits: ~2,6 GB de pesos, más caché KV.
- GPU recomendadas: A100 40/80 GB o H100 para contexto completo de 90k sin compromisos; L40S o RTX 6000 Ada para despliegues de producción con contexto moderado.
- GPU de consumo: cabe en RTX 4090 (24 GB) en BF16 con contexto reducido, y en RTX 3090/4080 con cuantización 8 o 4 bits; contextos cercanos a 90k requieren gestión eficiente de caché KV (FlashAttention, PagedAttention).
- Opciones de despliegue: vLLM y TGI para serving con PagedAttention; llama.cpp/Ollama para cuantizaciones GGUF (previo convertido desde safetensors); transformers para uso directo.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GUIAgentt/qwen35-4b-final-rw3b-s2-len90k-3ep-4n | 5,17B | 90k (entrenamiento) | Agente GUI/web | other (gated) | Hugging Face, acceso restringido |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | Propósito general | según Qwen | Hugging Face |
| Alternativas de agente GUI de tamaño similar | no disponible | no disponible | Agente GUI/web | no disponible | no disponible |

No se dispone de información suficiente para comparar rendimiento con alternativas específicas de la misma categoría (por ejemplo, ajustes de Qwen2.5-VL para agentes GUI u otros fine-tunes de Qwen3.5); los datos de benchmarks y de modelos comparables no están publicados.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face; no es descargable de forma anónima.
- Licencia "other": es imprescindible revisar los términos del modelo base Qwen3.5-4B y las condiciones del autor antes de cualquier uso comercial o redistribución.
- Ausencia de model card: no hay documentación sobre datos de entrenamiento, sesgos, evaluación o limitaciones, lo que dificulta la validación en producción.
- Riesgo de alucinación y de acciones erróneas: en tareas de agente GUI/web, una acción incorrecta (clic, envío de formulario) puede tener efectos reales; se recomienda sandboxing y supervisión humana.
- Sesgos: no documentados; al derivar de Qwen3.5-4B hereda los sesgos de su corpus, pero no hay análisis publicado.
- Idiomas: no declarados; el comportamiento multilingüe no está garantizado.
- Contexto de 90k: la ventana efectiva puede degradarse en los extremos; no hay evaluación publicada de recuperación en contextos largos.
- Madurez: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción ni de mantenimiento activo.
- Sin benchmarks: no es posible comparar su rendimiento con alternativas de forma objetiva.

## Enlaces

- Hugging Face: https://huggingface.co/GUIAgentt/qwen35-4b-final-rw3b-s2-len90k-3ep-4n
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper, blog, repositorio o demo: no disponibles en la información proporcionada.
