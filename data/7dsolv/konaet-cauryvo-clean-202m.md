# 7dsolv/Konaet-Cauryvo-Clean-202M

## Resumen
Konaet Cauryvo Clean 202M es un modelo de generación de texto en portugués desarrollado por 7dsolv (Adilson Oliveira) como parte de la línea de investigación Konaet. Emplea una arquitectura autoral denominada Cauryvo, que combina representación causal a nivel de byte, memoria causal multiescala, convoluciones en varias escalas, puertas neurales de lectura y escritura y una ruta FFN densa. El modelo cuenta con 202.049.825 parámetros densos y utiliza un tokenizer byte-level propio. Se ejecuta de forma local y offline, y expone una API compatible con POST /v1/responses y streaming SSE. Su relevancia radica en la exploración de arquitecturas alternativas al transformer estándar y en la adopción de procedencias Clean-Room con hashes de pesos, datos y configuración. El modelo se encuentra en una fase temprana de entrenamiento (Foundation), con 1.006 pasos acumulados y un objetivo progresivo de 10M a 1B de byte-tokens supervisados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cauryvo (memoria causal multiescala con convoluciones, puertas neurales y FFN densa) |
| Parámetros totales | 202.049.825 |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | portugués (pt) |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La arquitectura Cauryvo procesa bytes mediante una representación causal propia, que alimenta un módulo denominado Memory Weave. Este módulo aplica convoluciones en varias escalas y utiliza puertas neurales de lectura y escritura para mantener una memoria acumulativa. La salida pasa por una ruta FFN densa. El modelo no sigue la arquitectura transformer convencional; es un diseño autoral con ejecución local y offline. El tokenizer es byte-level y propio del proyecto. En cuanto al entrenamiento, la model card no especifica el número total de tokens ni la composición del dataset. Se indica que el ciclo del protocolo V1 completó 100 pasos supervisados, registrando 4.461 byte-tokens supervisados, y que el objetivo progresivo es alcanzar 10M, 100M, 500M y 1B de byte-tokens supervisados antes de aumentar parámetros. No se mencionan técnicas de RLHF o DPO. Como innovaciones destacables, el modelo incorpora un compilador de contratos Python puros con validación de AST sin ejecutar el código recibido o producido, y un autorretrato operacional que lee las métricas internas del modelo antes de responder sobre sus capacidades.

## Capacidades
- Generación de texto experimental en portugués, con un tokenizer byte-level propio.
- Memoria causal multiescala mediante el módulo Memory Weave, que integra convoluciones y puertas neurales de lectura y escritura.
- Ejecución local y offline, sin dependencia de servicios en la nube.
- API compatible con POST /v1/responses y streaming SSE para integración en sistemas de inferencia.
- Compilador de contratos Python puros con validación de AST y sin ejecución del código recibido o producido.
- Autorretrato operacional basado en evidencia: el modelo es capaz de leer sus propias métricas antes de responder sobre sus capacidades.
- Procedencia Clean-Room con hashes de pesos, datos, configuración y atestado de release.
- No se han documentado capacidades de tool calling, agentes, visión o audio en la información proporcionada.

## Casos de uso
- Investigación en arquitecturas de memoria causal: los investigadores pueden utilizar el modelo como banco de pruebas para estudiar cómo las convoluciones multiescala y las puertas neurales afectan al modelado de secuencias byte-level. La arquitectura Cauryvo y la cobertura de gradientes del 100% facilitan el análisis de la dinámica de entrenamiento.
- Generación de texto en portugués con ejecución offline: el modelo está diseñado para ejecutarse localmente, lo que lo hace adecuado para aplicaciones con requisitos de privacidad o en entornos sin conexión. La API compatible con /v1/responses permite integrarlo en sistemas existentes.
- Auditoría de reproducibilidad en modelos de IA: la procedencia Clean-Room con hashes de pesos, datos, configuración y atestado de release permite verificar la integridad del modelo y su cadena de entrenamiento. Es útil en proyectos que necesitan auditar modelos experimentales.
- Asistentes de diálogo transparentes: el autorretrato operacional permite que el modelo responda sobre sus propias capacidades leyendo sus métricas internas. Esto puede emplearse en asistentes que deben explicar sus limitaciones, aunque el gate de generación libre actual es bajo (3 de 13 tareas).
- Validación de contratos Python sin ejecución: el compilador de contratos con validación AST puede analizar código Python generado o recibido sin ejecutarlo. Es adecuado para entornos de desarrollo seguro, pipelines de CI/CD o revisión de código automatizada.
- Prototipado de APIs de inferencia compatibles con /v1/responses: el modelo expone una API compatible con el estándar POST /v1/responses y streaming SSE, lo que permite probar integraciones con clientes que ya usan ese formato.
- Experimentación con tokenización byte-level: el tokenizer byte-level propio permite investigar el impacto de la tokenización a nivel de byte en tareas de generación en portugués, especialmente para vocabularios o dominios específicos.

## Benchmarks y rendimiento
Se han publicado resultados de benchmarks en la información disponible, aunque corresponden a una evaluación experimental declarada por el autor y no verificada. No hay comparaciones con otros modelos.

| Métrica | Valor | Nota |
|---|---|---|
| Pérdida de test guiada | 0.9219 | Declarado por el autor, no verificado |
| Precisión guiada por token (%) | 87.93 | Declarado por el autor, no verificado |
| Secuencias exactas (%) | 16.67 | Declarado por el autor, no verificado |

Además, la model card incluye una tabla de evolución medida:

| Medida | Inicial | Final | Variación |
|---|---|---|---|
| Pérdida de validación | 0.8558 | 0.7891 | −0.0667 |
| Pérdida de test | 1.4982 | 0.9219 | −0.5763 |
| Precisión guiada por token | 79.52% | 87.93% | +8.41 p.p. |
| Secuencias exactas | 10.00% | 16.67% | +6.67 p.p. |
| Gate neural reservado | 3/13 | 3/13 | preservado |
| Gate neural de código | 0/3 | 0/3 | próximo marco |
| Cobertura de gradientes | — | 778/778 (100%) | todos los tensores |
| Gradientes no nulos | — | 778/778 (100%) | todos los tensores |

## Requisitos de hardware
- VRAM estimada: no disponible. El repositorio ocupa 26.7 GB, pero no se especifica la VRAM de inferencia. Con 202.049.825 parámetros en fp32, el peso teórico sería aproximadamente 0.8 GB, aunque no es un dato oficial.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probablemente sí por el tamaño de parámetros, pero no hay confirmación oficial.
- Opciones de despliegue: runtime local y offline; API compatible con POST /v1/responses y streaming SSE. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
No disponible. No se han encontrado modelos comparables en la información proporcionada.

## Limitaciones y advertencias
- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: no se especifica; el autor indica que la cobertura del 100% de gradientes no implica precisión total, conocimiento completo ni ausencia de errores.
- Limitaciones de contexto o idioma: solo está documentado el soporte de portugués; la longitud de contexto no está especificada.
- Restricciones de licencia: la licencia es "other" sin especificación; el uso comercial no está confirmado.
- Caveats importantes: los benchmarks declarados no están verificados (verified: false). El modelo está en fase Foundation, con gate de generación libre de 3/13 tareas, 1/8 casos críticos y 0/3 tareas de código. Tiene 0 descargas y 0 likes, lo que indica que es experimental.

## Enlaces
- HuggingFace: https://huggingface.co/7dsolv/Konaet-Cauryvo-Clean-202M
- Perfil de HuggingFace: https://huggingface.co/7dsolv
- GitHub: https://github.com/7dsolv/7dsolv
