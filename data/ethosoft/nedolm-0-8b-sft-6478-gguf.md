# Ethosoft/NedoLM-0.8B-SFT-6478-GGUF

## Resumen

NedoLM-0.8B-SFT-6478-GGUF es un modelo de lenguaje en turco de aproximadamente 823 millones de parámetros, desarrollado por Ethosoft. Se trata de un export en formato GGUF del paso 6478 de un proceso de ajuste fino supervisado (SFT) sobre una arquitectura personalizada denominada NedoLM. El modelo está pensado para ejecutarse con un runtime llama.cpp modificado, ya que los builds estándar de llama.cpp aún no implementan dicha arquitectura. Incluye una ventana de contexto de 4096 tokens con una ventana deslizante de 2048 y utiliza el tokenizador exacto NDSRF004. Su relevancia radica en ser un modelo compacto orientado al idioma turco, aunque su disponibilidad es limitada por la dependencia de un runtime específico y la ausencia de licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NedoLM (arquitectura personalizada) |
| Parametros totales | 823.140.352 (~0.8B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens (sliding window: 2048) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | tr (turco) |
| Licencia | No disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

NedoLM-0.8B-SFT-6478-GGUF es un modelo de lenguaje con una arquitectura propietaria o personalizada denominada NedoLM. No se ha publicado información detallada sobre su diseño interno (si se trata de un transformer puro, un MoE o un híbrido). El modelo se distribuye como un export del paso de entrenamiento 6478, que corresponde a un ajuste fino supervisado (SFT), según el README. El tokenizador es el NDSRF004, cuya paridad de tokens entre la implementación Rust de producción y el runtime llama.cpp parcheado ha sido verificada. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni la aplicación de técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto en turco: el idioma declarado en la model card es exclusivamente turco (tr).
- Inferencia mediante runtime llama.cpp parcheado: el modelo requiere una versión modificada de llama.cpp que implemente la arquitectura NedoLM.
- Verificación de paridad del tokenizador: la equivalencia entre el tokenizador Rust de producción y el integrado en llama.cpp ha sido comprobada.
- Verificación de inferencia en llama.cpp: el README indica que la prueba de humo de inferencia con el runtime parcheado pasa correctamente.
- No se ha documentado soporte para tool calling, function calling, razonamiento multi-paso, visión, audio ni modos de pensamiento especiales.

## Casos de uso

Dado que no se han publicado benchmarks ni descripciones de tareas concretas, los siguientes casos se basan en la naturaleza del modelo como LM turco compacto y deben considerarse aplicaciones potenciales:

- Asistente conversacional en turco: el modelo puede emplearse como base para chatbots de atención al cliente en turco, aunque su ventana de contexto de 4096 tokens limita el mantenimiento de conversaciones largas.
- Generación de texto en turco: redacción de correos, artículos o respuestas breves en este idioma, aprovechando su capacidad de lenguaje natural para aplicaciones internas.
- Clasificación de texto en turco: al ser un modelo ajustado por SFT, puede utilizarse para etiquetar documentos, análisis de sentimiento o detección de temas en textos turcos.
- Resumen de documentos en turco: resumir artículos, informes o noticias, siempre que el contenido no exceda el límite de contexto.
- Corrección gramatical y reescritura: asistencia en la revisión de textos turcos, aunque el tamaño reducido del modelo puede limitar la calidad en usos complejos.
- Prototipado de aplicaciones LLM en turco: dado su bajo coste computacional, sirve para validar flujos de generación en entornos de desarrollo antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Considerando los 823.140.352 parámetros, en FP16 se necesitarían aproximadamente 1,6 GB de VRAM; con cuantización GGUF típica de 4 bits, la cifra podría reducirse a ~0,5 GB, pero la cuantización concreta no está documentada.
- GPU recomendadas: cualquier GPU de consumo con al menos 2 GB de VRAM (por ejemplo, NVIDIA RTX 3060 o superior) sería suficiente para ejecutar el modelo en FP16 o cuantizado. No hay una recomendación oficial.
- Compatibilidad con GPU de consumo: sí, por su tamaño reducido. También puede ejecutarse en CPU mediante llama.cpp, siempre que se utilice el runtime parcheado.
- Opciones de despliegue: llama.cpp (parcheado con soporte NedoLM). El repo incluye tags de compatibilidad con endpoints aunque no se detalla un framework concreto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables documentados en la información proporcionada.

## Limitaciones y advertencias

- Dependencia de un runtime especial: el modelo no funciona con builds estándar de llama.cpp; se requiere una versión parcheada que implemente la arquitectura NedoLM, lo que complica el despliegue en infraestructuras existentes.
- Licencia no declarada: al no especificarse la licencia en HuggingFace ni en la model card, no se puede confirmar la idoneidad para uso comercial ni las condiciones de redistribución.
- Sin benchmarks: no hay datos públicos que respalden su rendimiento en tareas de lenguaje, por lo que su calidad es desconocida.
- Ventana de contexto limitada: la longitud de contexto es de 4096 tokens, con una sliding window de 2048. Esto restringe el manejo de documentos extensos o conversaciones largas.
- Sin información sobre sesgos o alucinaciones: no se han publicado evaluaciones de sesgos, seguridad ni tasas de alucinación.
- Modelo pequeño: al tener solo ~0.8B de parámetros, su capacidad de razonamiento y conocimiento factual es limitada en comparación con modelos de mayor escala.

## Enlaces

- HuggingFace: https://huggingface.co/Ethosoft/NedoLM-0.8B-SFT-6478-GGUF
- No se han encontrado otros enlaces relevantes en la búsqueda web (papers, blogs, repositorios adicionales).
