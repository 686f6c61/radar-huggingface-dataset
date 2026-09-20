# sinhaankur/sinhaankur

## Resumen

El repositorio identificado como `sinhaankur/sinhaankur` no es una ficha de modelo de IA, sino una página de perfil o portafolio personal alojada en Hugging Face. Su contenido (el README) describe al autor, Ankur Sinha, y los proyectos que desarrolla, pero no documenta ningún artefacto de pesos, arquitectura ni proceso de entrenamiento asociado a este identificador concreto.

El texto disponible enumera iniciativas del autor: el motor de satélites y sistema solar "The Universe / Satellite Engine", el asistente on-device "Vera", el proyecto de inferencia distribuida "Unhosted", un motor RAG local llamado "rag-engine" y, como referencia externa, un modelo destilado denominado `helmsman-4b` (QLoRA sobre Qwen3-4B) cuyos pesos no son públicos. Ninguno de estos elementos constituye el objeto del repositorio `sinhaankur/sinhaankur`.

Por tanto, esta ficha se limita a registrar la ausencia de especificaciones técnicas verificables. No hay datos de arquitectura, número de parámetros, ventana de contexto, dataset de entrenamiento ni benchmarks publicados en la información proporcionada. Cualquier cifra que se añadiese sería inventada, por lo que se marca explícitamente como "no disponible" en cada campo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura en la información proporcionada. El repositorio `sinhaankur/sinhaankur` no contiene una especificación de modelo (transformer, MoE, SSM ni híbrida), ni pesos, ni detalles de tokenización.

Tampoco se documenta ningún proceso de entrenamiento: no hay número de tokens, composición del dataset, ni técnicas de alineación como RLHF, DPO o SFT. La única referencia a entrenamiento aparece de forma indirecta, al mencionar que `helmsman-4b` se obtuvo mediante QLoRA sobre Qwen3-4B, pero ese es un repositorio distinto y sus pesos son privados, por lo que no puede auditarse a partir de esta ficha.

## Capacidades

- No se puede atribuir ninguna capacidad funcional al repositorio `sinhaankur/sinhaankur`, ya que no es un modelo ejecutable.
- Generación de texto, razonamiento, código, matemáticas o visión: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multietapa: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

No procede definir casos de uso de inferencia para este repositorio, porque no contiene un modelo desplegable. A modo de orientación sobre lo que el README sí menciona como proyectos del autor (no como usos de este artefacto):

- Sistema solar y seguimiento de satélites: "The Universe / Satellite Engine" se presenta como una aplicación de datos reales de NASA, JPL, ESA y CelesTrak; es una aplicación web, no un uso del modelo.
- Asistente on-device "Vera": descrito como un gemelo digital local con LLM privado, memoria en el dispositivo y voz local; el modelo subyacente no se especifica.
- Clúster de inferencia privado "Unhosted": agregación de hardware propio; tampoco se detalla el modelo que lo alimenta.
- Motor RAG local "rag-engine": pipeline de chunk → embed → retrieve → generate con degradación controlada.
- Modelo especialista "helmsman-4b": destilado sobre Qwen3-4B para uso on-device, con un ~71% de rendimiento en prompts reservados según el autor (pesos privados).
- Dataset "my-personal-codex-data": sesiones de programación asistida publicadas de forma abierta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El único dato numérico mencionado es un ~71% en prompts reservados para `helmsman-4b`, pero corresponde a otro repositorio, no se indica la métrica exacta y no se aporta la metodología de evaluación, por lo que no es comparable ni verificable en el marco de esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No existe un modelo en este repositorio que pueda compararse con alternativas de la misma categoría. A título informativo, el README menciona `helmsman-4b` como destilado de Qwen3-4B, pero al no publicarse pesos ni configuración no es posible contrastarlo con otros modelos de 4B.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sinhaankur/sinhaankur | no disponible | no disponible | no disponible | no es un modelo |
| helmsman-4b (referenciado) | ~4B (base Qwen3-4B) | no disponible | no disponible | pesos privados |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio `sinhaankur/sinhaankur` no constituye un modelo de IA utilizable: es una página de perfil.
- No hay licencia declarada, por lo que no puede asumirse ningún permiso de uso comercial o de redistribución.
- No se especifican idiomas soportados; no puede afirmarse cobertura multilingüe.
- No existen benchmarks, métricas ni evaluaciones reproducibles asociadas a este identificador.
- Las fechas del repositorio (creación y actualización en 2026) resultan anómalas y no permiten inferir su estado real de mantenimiento.
- Los resultados de la búsqueda web proporcionados (ayuda de YouTube TV, hilos de Zhihu y una página de marco de UX) no guardan relación con el repositorio y no aportan información técnica válida.
- Cualquier uso en producción requeriría localizar el modelo real subyacente; este identificador no lo proporciona.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sinhaankur/sinhaankur
- Sitio personal del autor: https://www.sinhaankur.com
- Perfil de GitHub: https://github.com/sinhaankur
- Perfil de LinkedIn: https://www.linkedin.com/in/sinhaankur
- Organización Unhosted AI: https://github.com/unhosted-ai
- Proyecto celestial: https://www.sinhaankur.com/lab/celestial
- Modelo referenciado helmsman-4b: https://huggingface.co/sinhaankur/helmsman-4b
- Dataset referenciado: https://huggingface.co/datasets/sinhaankur/my-personal-codex-data
- Marco de experiencia de usuario: https://www.sinhaankur.com/framework/
