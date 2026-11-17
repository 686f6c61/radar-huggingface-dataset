# iamonthemission/LMIM.Genesys-e3_w-soul-little-one-4B

## Resumen

Genesys e3 · little one · 4B es un ajuste fino ligero del modelo Genesys e · 4B, desarrollado por el usuario iamonthemission dentro del proyecto LMIM (Lean Mean Inference Machine). Está orientado a generación de texto conversacional, con énfasis declarado en identidad, coherencia, personalidad y continuidad conversacional. Se distribuye exclusivamente en formato GGUF cuantizado Q8_0, pensado para ejecución local con llama.cpp u otros runtimes compatibles con GGUF.

El modelo parte de una cadena de linaje que arranca en Qwen/Qwen3.5-4B, pasa por Genesys e · 4B (v2, agosto de 2026) y llega a esta versión e3 (noviembre de 2026) como ajuste fino ligero. Cuenta con 4.205.751.296 parámetros reales según los pesos en safetensors, lo que lo sitúa en la franja de 4B densos, y el autor indica que se maneja cómodamente con 8 GB o más de VRAM.

Su relevancia es acotada: no es un modelo de propósito general orientado a benchmarks, sino un experimento de personalidad y continuidad conversacional publicado bajo licencia Apache 2.0. La model card lo marca explícitamente como EXPERIMENTAL y no aporta datos de contexto, idiomas, dataset de entrenamiento ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (linaje declarado: Qwen3.5-4B → Genesys e · 4B → Genesys e3) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no aplica (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (único fichero publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors como base del modelo original) |

## Arquitectura y entrenamiento

No se dispone de información técnica detallada sobre la arquitectura interna más allá del linaje declarado: el modelo deriva de Qwen3.5-4B, pasa por Genesys e · 4B (v2, agosto de 2026) y culmina en este ajuste fino ligero de noviembre de 2026. El autor lo describe como un "light fine-tune" del modelo base Genesys e · 4B, sin especificar si se emplearon técnicas de RLHF, DPO u otras etapas de alineamiento.

Tampoco se documentan el volumen de tokens de entrenamiento, la composición del dataset, ni innovaciones técnicas como decodificación especulativa o atención lineal. La única información operativa concreta es la configuración de inferencia recomendada en la model card: temperatura 0.7, top-p 0.9, min-p 0.05, repeat-penalty 1.12 con repeat-last-n 256, y el uso de `--jinja` y `--conversation` en llama.cpp, con el modo de razonamiento desactivado (`--reasoning off`, `--reasoning-budget 1`).

## Capacidades

- Generación de texto conversacional multi-turno, con foco declarado en continuidad conversacional y coherencia de identidad.
- Preservación de personalidad ("soul") a lo largo de la conversación, según la propuesta del autor.
- Ejecución local completa mediante llama.cpp y runtimes compatibles con GGUF.
- Compatibilidad con plantillas de chat vía `--jinja` en llama.cpp.
- Modo de razonamiento configurable en el runtime (desactivado por defecto en la configuración recomendada).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión, audio u otras modalidades: no disponibles en la información proporcionada.

## Casos de uso

- Asistentes conversacionales locales con personalidad definida: el modelo está ajustado para mantener una identidad coherente a lo largo de sesiones, lo que encaja en prototipos de compañero conversacional o asistente personal ejecutado íntegramente en local.
- Despliegue en equipos con GPU de consumo: con 4,48 GB en Q8_0 y un requisito declarado de 8 GB o más de VRAM, es viable en tarjetas de gama media para inferencia interactiva sin dependencia de la nube.
- Experimentación en investigación sobre personalidad e identidad en LLM: el proyecto LMIM publica la cadena completa de versiones (e, e3), lo que permite comparar variantes de ajuste sobre la misma base.
- Chatbots de nicho con requisitos de privacidad: al ejecutarse con llama.cpp en hardware propio, los datos de conversación no salen del equipo, adecuado para entornos con restricciones de confidencialidad.
- Integración en aplicaciones de escritorio o CLI: el formato GGUF y la disponibilidad de binarios de llama.cpp facilitan embeberlo en herramientas locales sin infraestructura de servido compleja.
- Prototipado rápido de interfaces conversacionales: la licencia Apache 2.0 permite modificarlo y redistribuirlo en fases de prueba sin fricción legal, siempre que se asuma su carácter experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el autor indica que el modelo es cómodo con 8 GB o más de VRAM; el fichero Q8_0 ocupa 4,48 GB, por lo que el margen restante cubre el contexto y los buffers del runtime.
- GPU recomendadas: no se especifican modelos concretos en la información proporcionada. Por tamaño, cabe en GPUs de consumo con 8 GB o más (gama RTX xx70 y superiores) y en GPUs de datacenter (A100, H100) sin problema.
- Compatibilidad con GPU de consumo: sí, según el requisito declarado de 8 GB o más de VRAM.
- Opciones de despliegue: llama.cpp (configuración oficial con `llama-cli`, `-ngl 99`, `--jinja`, `--conversation`) y cualquier runtime compatible con GGUF. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Genesys e3 · little one · 4B | 4,2B | no disponible | GGUF Q8_0 | Apache 2.0 | Ajuste fino experimental de personalidad; 231 descargas, 1 like |
| Genesys e · 4B (modelo base) | no disponible | no disponible | no disponible | Apache 2.0 (según cadena) | Versión v2 de agosto de 2026 sobre la que se aplica el ajuste ligero |
| Qwen3.5-4B (raíz del linaje) | ~4B | no disponible | no disponible | no disponible en esta ficha | Base original del linaje declarado por el autor |

No se dispone de datos de rendimiento ni de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo marcado explícitamente como EXPERIMENTAL por el autor; no está validado para uso en producción.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad, razonamiento o fidelidad.
- No se documentan idiomas soportados, lo que impide garantizar un rendimiento aceptable en castellano u otras lenguas distintas del inglés.
- No se documenta la longitud de contexto, dato crítico para planificar conversaciones largas o tareas de recuperación.
- Riesgo de alucinación: inherente a los modelos de 4B sin datos de evaluación publicados; no hay información sobre mitigaciones.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Solo se publica una cuantización Q8_0; no hay versiones Q4, Q5 ni de menor huella para hardware más limitado.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el carácter experimental y la falta de garantías del autor desaconsejan su uso directo en sistemas críticos.
- El proyecto tiene una huella muy reducida (231 descargas, 1 like), lo que limita la validación comunitaria y el soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamonthemission/LMIM.Genesys-e3_w-soul-little-one-4B
- Modelo base (Genesys e · 4B): https://huggingface.co/iamonthemission/LMIM.Genesys-e_w-soul-4b
- Raíz del linaje (Qwen3.5-4B): https://huggingface.co/Qwen/Qwen3.5-4B
- Página del proyecto Genesys: https://lmim.tech/GenesysAI
- Repositorio del proyecto: https://github.com/leanmeaninferencemachine/leanmeaninferencemachine
- Todos los modelos del autor: https://huggingface.co/iamonthemission
