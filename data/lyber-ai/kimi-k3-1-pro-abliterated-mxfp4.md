# lyber-ai/Kimi-K3.1-Pro-ABLITERATED-MXFP4

## Resumen

Kimi-K3.1-Pro-ABLITERATED-MXFP4 es una versión modificada y cuantizada del modelo Kimi-K3.1-Pro desarrollado por Moonshot AI. La variante la publica el usuario lyber-ai en Hugging Face y aplica una técnica de *abliteration* (eliminación o atenuación de las direcciones de activación asociadas a comportamientos de rechazo) sobre los pesos originales, además de una cuantización en formato MXFP4. El modelo base es un transformer nativo multimodal de gran escala, con 2,8 billones de parámetros totales, ventana de contexto de hasta 1 millón de tokens y capacidades de razonamiento, generación de código y *tool calling*.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: un modelo de escala frontier abierto, una modificación de alineamiento (abliteration) que reduce los filtros de seguridad del modelo original y una cuantización de baja precisión (MXFP4) orientada a reducir los requisitos de memoria en inferencia. Esto lo hace interesante para investigación sobre robustez de alineamiento y para despliegues que necesitan un modelo de gran contexto con menos restricciones de contenido, pero también introduce riesgos importantes de uso.

No se dispone de información detallada sobre el proceso exacto de abliteration aplicado por lyber-ai ni sobre los resultados de evaluación de esta variante concreta. Los datos de arquitectura y capacidades que se recogen a continuación provienen del modelo base (Kimi-K3) y de la información pública disponible; los detalles específicos de la versión cuantizada MXFP4 no están publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con Kimi Delta Attention (KDA), Attention Residuals (AttnRes) y componentes híbridos SSM/atención (tags: moe, mla, dsa, gdn, ssm-attention-hybrid) |
| Parámetros totales | 2,8 billones (2.8T) según el modelo base Kimi-K3 |
| Parámetros activos | no disponible (el modelo base se describe como MoE, pero no se publica el número de parámetros activos) |
| Longitud de contexto | hasta 1.000.000 tokens (modelo base) |
| Tipos de cuantización | MXFP4 (esta variante); no se detallan otras cuantizaciones publicadas |
| Idiomas soportados | en, zh, es, fr, ja, ko, ru |
| Licencia | kimi-k31-pro (licencia "other" del modelo base, con acceso restringido/gated) |
| Formato de pesos | no disponible (la librería indicada es transformers; el tag MXFP4 sugiere pesos cuantizados, pero no se confirma el contenedor exacto) |

## Arquitectura y entrenamiento

El modelo base Kimi-K3 es un transformer nativo multimodal de 2,8 billones de parámetros construido sobre Kimi Delta Attention (KDA) y Attention Residuals (AttnRes), con capacidades de visión nativas y una ventana de contexto de hasta 1 millón de tokens. Los tags del repositorio indican además componentes de tipo MoE (mixture of experts), MLA (multi-head latent attention), DSA, GDN y una arquitectura híbrida SSM-atención, lo que sugiere una combinación de mecanismos de atención eficiente y capas de estado recurrente para gestionar contextos muy largos con coste computacional contenido.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en el modelo base. La variante aquí descrita añade dos transformaciones sobre los pesos originales: una abliteration, que típicamente identifica y resta la dirección de activación asociada a la negativa a responder y la aplica de forma selectiva, y una cuantización MXFP4, un formato de coma flotante de 4 bits con escala compartida por bloques que reduce el tamaño de los pesos a aproximadamente una cuarta parte del de una representación FP16. No se han publicado detalles técnicos del procedimiento de abliteration empleado por lyber-ai.

## Capacidades

- Generación de texto y razonamiento de largo horizonte, orientado a tareas de conocimiento y coding.
- Capacidades multimodales nativas de visión (heredadas del modelo base Kimi-K3).
- Soporte de *tool calling* / *function calling* (tag `tool-calling`).
- Soporte de agentes y razonamiento multi-paso (tag `reasoning`).
- Capacidades multilingües en inglés, chino, español, francés, japonés, coreano y ruso.
- Modo de razonamiento explícito (tag `reasoning`).
- Comportamiento de rechazo atenuado o eliminado respecto al modelo original (tag `abliterated` / `uncensored`).

## Casos de uso

- Investigación sobre alineamiento y robustez: comparar las respuestas del modelo original con esta variante abliterated permite estudiar qué comportamientos de seguridad se pierden y cómo se distribuyen las direcciones de activación asociadas al rechazo.
- Evaluación de cuantización MXFP4: medir la degradación de calidad (razonamiento, código, matemáticas) frente al modelo en precisión completa para validar si el formato de 4 bits es viable en producción.
- Procesamiento de documentación técnica extensa: con hasta 1 millón de tokens de contexto, el modelo puede ingerir repositorios completos, manuales o expedientes largos y responder preguntas sobre ellos en una sola pasada.
- Generación de código en pipelines internos: el soporte de tool calling y razonamiento multi-paso permite integrarlo en flujos de CI/CD o asistentes de desarrollo, siempre que se acepten las condiciones de licencia.
- Análisis multimodal de documentos: la capacidad de visión nativa permite extraer información de capturas, diagramas o PDFs escaneados combinada con razonamiento sobre texto.
- Atención al cliente multilingüe: cubre siete idiomas y conversaciones multi-turno con contexto largo, útil para bases de conocimiento extensas por sesión.
- Generación de contenido creativo sin filtros: para casos donde el modelo original rechaza temas legítimos (ficción sensible, escenarios de seguridad ofensiva controlada), la variante abliterated reduce las negativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta variante concreta ni para el modelo base en las fuentes consultadas.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión. Un modelo de 2,8 billones de parámetros en MXFP4 requiere del orden de 1,4 TB solo para los pesos (4 bits por parámetro), lo que excede cualquier configuración de GPU individual y exige despliegue multi-nodo o *offloading* a CPU/disco.
- GPU recomendadas: clústeres multi-GPU (H100/H200, A100 80GB) en configuraciones de decenas a cientos de tarjetas; no es viable en una sola GPU.
- GPU de consumo: no cabe en RTX 4090 ni en ninguna GPU consumer actual.
- Opciones de despliegue: transformers (librería declarada); no se confirman integraciones con vLLM, llama.cpp, Ollama o TGI para este formato MXFP4.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso |
|---|---|---|---|---|
| Kimi-K3.1-Pro-ABLITERATED-MXFP4 (esta ficha) | 2,8T (total) | 1M tokens | kimi-k31-pro (other) | Gated |
| Kimi-K3.1-Pro (modelo base) | 2,8T (total) | 1M tokens | kimi-k31-pro (other) | Gated |
| Kimi K3 (API lyber.ai) | 2,8T (total) | 1M tokens | Comercial vía API ($3,25 / $15,00 por 1M tokens) | API |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de esta variante con alternativas de la misma categoría.

## Limitaciones y advertencias

- La abliteration elimina o atenúa los mecanismos de rechazo del modelo original, lo que aumenta el riesgo de generar contenido dañino, sesgado o inapropiado sin las salvaguardas previstas por Moonshot AI.
- Riesgo de alucinación inherente a los modelos de gran escala; no se han publicado evaluaciones específicas de esta variante.
- La cuantización MXFP4 puede degradar la calidad en tareas sensibles a la precisión numérica (matemáticas, código, razonamiento profundo); no hay datos publicados sobre la magnitud de esa degradación.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita su disponibilidad.
- Licencia "other" (kimi-k31-pro): es imprescindible revisar los términos del modelo base antes de cualquier uso comercial; la modificación por parte de un tercero puede no estar cubierta por la licencia original.
- El repositorio no tiene descargas ni likes y fue creado en noviembre de 2026; no hay evidencia de validación por la comunidad.
- No se publican detalles del procedimiento de abliteration ni de la cuantización, lo que dificulta la reproducibilidad.
- Uso en producción desaconsejado sin una capa adicional de moderación y sin una evaluación propia de sesgos y seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/lyber-ai/Kimi-K3.1-Pro-ABLITERATED-MXFP4
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Página del modelo Kimi K3: https://www.kimi.ai/ai-models/kimi-k3
- API abliterated de Lyber: https://www.lyber.ai/models/kimi-k3/
