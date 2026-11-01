# johnlockejrr/Swift-1.5-Flash-Next-Heretic-V2-HGN

## Resumen

Swift-1.5-Flash-Next-Heretic-V2-HGN es una cuantización de 4 bits publicada por johnlockejrr sobre el modelo trubisky/Swift-1.5-Flash-Next-Heretic-ReverseEngineer, una variante "abliterated" (sin censura) de la familia Swift-1.5-Flash-Next. El modelo se distribuye en formato propietario de la librería `halogen`, orientado específicamente al hardware Strix Halo de AMD (arquitectura gráfica gfx1151), lo que lo convierte en un artefacto muy especializado para inferencia local en ese tipo de APU.

La información pública disponible es extremadamente limitada: el repositorio tiene 0 descargas y 1 like en el momento de la consulta, y el acceso está restringido (gated), requiriendo aceptar condiciones en HuggingFace. Los tags indican una arquitectura MoE (mezcla de expertos) con etiquetas `qwen`, `qwen3_8` y `qwen4_exp`, lo que sugiere una base derivada de la familia Qwen, aunque no se especifican parámetros totales, parámetros activos ni longitud de contexto.

Por su naturaleza (modelo "uncensored"/"abliterated" y cuantizado para un acelerador concreto), su relevancia es acotada: resulta de interés para desarrolladores que quieran ejecutar un modelo sin restricciones de alineación en hardware Strix Halo, y no como opción generalista de producción. La licencia `swift-open-license-1.0` (etiquetada como `other`) y el acceso restringido añaden fricción para su adopción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), base derivada de la familia Qwen (tags `qwen`, `qwen3_8`, `qwen4_exp`); detalles exactos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (arquitectura MoE confirmada por tags, sin cifras) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (formato `halogen`, orientado a Strix Halo / gfx1151) |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | swift-open-license-1.0 (etiquetada como `other`) |
| Formato de pesos | halogen (librería propietaria); no se indica safetensors ni GGUF |
| Tamano del repositorio | 118,8 GB |
| Acceso | restringido (gated) |
| Modelo base | trubisky/Swift-1.5-Flash-Next-Heretic-ReverseEngineer |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna más allá de lo inferible de los tags: se trata de un modelo de mezcla de expertos (MoE) derivado de la familia Qwen, con variantes de cuantización a 4 bits y una modificación de tipo "abliterated"/"heretic" que elimina o atenúa las capas de rechazo del modelo original. El sufijo "ReverseEngineer" en el modelo base sugiere un proceso de reconstrucción o ingeniería inversa de pesos, aunque no se documenta el procedimiento.

No hay datos publicados sobre número de tokens de entrenamiento, composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. La única particularidad técnica reseñable es el formato de cuantización `halogen`, diseñado específicamente para el acelerador gráfico gfx1151 de AMD Strix Halo.

## Capacidades

- Generación de texto en inglés y chino.
- Razonamiento y conversación multi-turno (capacidad inferida de la familia base, no verificada en esta variante).
- Modo "uncensored"/"abliterated": ausencia de capas de rechazo alineadas, lo que permite generar contenido que modelos alineados rechazarían.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión o audio: no disponibles.
- Ejecución optimizada en hardware AMD Strix Halo (gfx1151) mediante la librería `halogen`.

## Casos de uso

- Inferencia local en APU AMD Strix Halo: el formato `halogen` está específicamente adaptado a gfx1151, por lo que es el escenario natural de despliegue; se usaría para ejecutar el modelo en equipos con esa APU sin GPU dedicada.
- Investigación sobre alineación y seguridad: al ser una variante "abliterated", sirve para estudiar el comportamiento de modelos sin capas de rechazo y comparar respuestas frente a la versión original alineada.
- Experimentación con cuantización de 4 bits en MoE: útil para evaluar la degradación de calidad de la cuantización `halogen` frente a otros formatos en el mismo modelo base.
- Generación de texto creativo sin restricciones: para proyectos que requieran contenido que los modelos alineados filtran, siempre dentro del marco legal aplicable.
- Procesamiento bilingüe inglés-chino: tareas de traducción o generación en esos dos idiomas, limitado a los idiomas declarados.
- Reproducción de experimentos de ingeniería inversa de pesos: dado el origen "ReverseEngineer" del modelo base, puede emplearse para validar pipelines de reconstrucción de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 118,8 GB, aunque el peso real en memoria tras la cuantización de 4 bits no se documenta.
- GPU recomendadas: específicamente AMD Strix Halo con gráficos gfx1151 (requisito implícito del formato `halogen`).
- Compatibilidad con GPU consumer (NVIDIA RTX 4090, etc.): no disponible; el formato propietario probablemente no es portable a otras arquitecturas sin conversión.
- Opciones de despliegue: librería `halogen` (obligatoria para el formato nativo); vLLM, llama.cpp, Ollama o TGI no están confirmados como compatibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Swift-1.5-Flash-Next-Heretic-V2-HGN | no disponible (MoE) | no disponible | swift-open-license-1.0 | halogen (4 bits) | Gated, orientado a Strix Halo |
| Modelo base: Swift-1.5-Flash-Next-Heretic-ReverseEngineer | no disponible | no disponible | no disponible | no disponible | Origen de esta cuantización |
| Familia Qwen (referencia de arquitectura) | variable | variable | variable | safetensors/GGUF | Base arquitectónica inferida por tags |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace antes de descargar.
- Licencia `swift-open-license-1.0` etiquetada como `other`: es imprescindible revisar los términos completos antes de cualquier uso comercial, que no está garantizado.
- Modelo "abliterated"/"uncensored": elimina las capas de rechazo, por lo que puede generar contenido ofensivo, ilegal o peligroso; no apto para aplicaciones de cara al público sin filtros externos.
- Riesgo elevado de alucinación y de respuestas no verificadas, agravado por la falta de benchmarks publicados.
- Idiomas limitados a inglés y chino; sin soporte declarado de castellano.
- Formato de pesos propietario (`halogen`) atado a hardware AMD Strix Halo: portabilidad muy limitada.
- Sin datos verificables de parámetros, contexto o calidad: no recomendable para producción sin evaluación propia.
- Procedencia "ReverseEngineer" del modelo base: la integridad y fidelidad de los pesos no está documentada.
- Repositorio con 0 descargas y 1 like: sin validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/johnlockejrr/Swift-1.5-Flash-Next-Heretic-V2-HGN
- Modelo base: https://huggingface.co/trubisky/Swift-1.5-Flash-Next-Heretic-ReverseEngineer
