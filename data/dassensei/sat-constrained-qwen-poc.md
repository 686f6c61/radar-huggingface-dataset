# dassensei/sat-constrained-qwen-poc

## Resumen

El repositorio `dassensei/sat-constrained-qwen-poc` no contiene un modelo de lenguaje en sí, sino el código fuente de un motor de inferencia experimental que integra verificación formal SMT/SAT en el bucle de decodificación autoregresiva de un LLM. El proyecto, desarrollado por Emerging Defense Solutions (EDS) con base académica en Bowie State University y financiación NSF-SBIR-CT-2026-001, busca eliminar las alucinaciones y las salidas no verificables en entornos de alta seguridad mediante la intersección dinámica de los logits generados con aserciones formales resueltas por los solvers Z3 o CVC5.

El nombre del repositorio sugiere que el modelo base es un Qwen, aunque no se especifica en la documentación. La propuesta es relevante porque aborda un problema crítico en el despliegue de LLMs en sectores regulados (defensa, inteligencia, cumplimiento normativo) donde una respuesta incorrecta puede tener consecuencias graves. El sistema define un operador Φ que filtra los tokens candidatos según su satisfacibilidad respecto a restricciones lógicas, garantizando que la salida cumpla estrictamente con las especificaciones formales definidas por el usuario.

Se trata de una prueba de concepto (PoC) con cero descargas y sin datos de rendimiento publicados. El repositorio incluye documentación técnica, diagramas de arquitectura (incluyendo especificaciones de enclaves AMD SEV-SNP), código fuente en Python y scripts de benchmark, pero no se proporcionan pesos del modelo ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio es un motor de decodificación restringida, no un modelo base) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se distribuyen pesos; solo código fuente Python) |

## Arquitectura y entrenamiento

El repositorio no entrena un modelo nuevo, sino que envuelve un LLM existente (presumiblemente de la familia Qwen, según el nombre del repo) con un pipeline de verificación formal. La innovación técnica clave es el operador de intersección de logits Φ: en cada paso de decodificación, un solvers SMT (Z3 o CVC5) evalúa si el prefijo generado más el token candidato satisface un conjunto de aserciones formales (sistemas de aritmética lineal, expresiones regulares sobre strings, o restricciones topológicas sobre grafos). Los tokens que no cumplen las restricciones reciben un logit de -∞, forzando a que la generación respete las especificaciones.

El pipeline está estructurado en módulos Python: procesadores para una variable (límites enteros), múltiples variables con regex, y un pipeline seguro con pool de hilos para verificación multi-dominio. La documentación menciona además una especificación de enclave seguro AMD SEV-SNP, lo que sugiere un enfoque de ejecución confidencial. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni el proceso de post-entrenamiento (RLHF/DPO), porque no es un modelo entrenado sino un sistema de inferencia que se acopla a un LLM base existente.

## Capacidades

- Generación de texto con restricciones formales: cada token emitido es verificado contra aserciones SMT/SAT antes de ser aceptado.
- Soporte de sistemas de aritmética lineal sobre enteros (por ejemplo, `2x + 3y = 150 ∧ x > y ∧ y ≥ 10`).
- Cumplimiento estricto de expresiones regulares y autómatas finitos (por ejemplo, identificadores del tipo `CUI-[0-9]{4}`).
- Verificación de caminos válidos en grafos dirigidos acíclicos (DAG) antes de emitir comandos de ejecución agéntica.
- Arquitectura modular con procesadores independientes para diferentes dominios lógicos.
- Integración con solvers Z3 y CVC5 mediante un pipeline con pool de hilos para verificación paralela.
- Diseño orientado a entornos de alta seguridad con especificación de enclave AMD SEV-SNP.

## Casos de uso

- Generación de identificadores y códigos de clasificación en entornos de defensa: el modelo puede producir strings que cumplan exactamente con patrones regulados (por ejemplo, `CUI-XXXX`), reduciendo errores de formato en documentación clasificada.
- Verificación de configuraciones de red o infraestructura: al imponer restricciones de aritmética lineal, el sistema puede generar configuraciones IP, asignaciones de puertos o reglas de firewall que satisfagan ecuaciones de capacidad y compatibilidad.
- Generación de código con invariantes formales: en pipelines de CI/CD, el motor puede producir fragmentos de código que cumplan precondiciones y postcondiciones verificables, reduciendo la necesidad de revisión manual.
- Razonamiento agéntico con rutas de ejecución válidas: para sistemas multi-agente, el modelo puede restringir sus decisiones a caminos permitidos en un DAG de tareas, evitando acciones ilegales o fuera de orden.
- Cumplimiento normativo en informes financieros o legales: el sistema puede garantizar que las cifras generadas satisfagan ecuaciones contables (por ejemplo, activo = pasivo + patrimonio) mediante restricciones de aritmética lineal.
- Asistencia en análisis de inteligencia: el motor puede filtrar salidas que contengan referencias a entidades o patrones que no cumplen con las reglas de formato establecidas, asegurando consistencia en los informes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye scripts de benchmark (`benchmark_sat_latency.py`, `multivar_regex_latency.py`) y gráficos de latencia en la carpeta `benchmarks/results/`, pero no se proporcionan los valores numéricos ni comparaciones con otros sistemas en la documentación accesible.

## Requisitos de hardware

No se especifican requisitos de hardware en la documentación disponible. Como el sistema envuelve un LLM base (probablemente de la familia Qwen) y añade solvers SMT en el bucle de decodificación, los requisitos dependerán del modelo subyacente elegido:

- Si se usa un Qwen pequeño (por ejemplo, 0.5B-4B), podría ejecutarse en GPUs de consumo como RTX 3060 o RTX 4090 con cuantización.
- Para modelos más grandes (7B-72B), se necesitarían GPUs de datacenter (A100, H100) o despliegue distribuido.
- El overhead de los solvers SMT añade latencia adicional por token, que será significativa si las restricciones son complejas. El repositorio indica que se busca latencia de microsegundos, pero no hay datos medidos.
- Opciones de despliegue: el código está en Python y usa wrappers de runtime local, por lo que podría integrarse con frameworks como vLLM, llama.cpp u Ollama, aunque no se documenta explícitamente.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de lenguaje comparable a otros LLMs; es un sistema de decodificación restringida que se acopla a un LLM existente. No hay alternativas públicas conocidas que integren SMT/SAT directamente en el bucle de decodificación con el mismo nivel de formalización. Las técnicas existentes de decodificación guiada por gramática (por ejemplo, en llama.cpp) ofrecen restricciones sintácticas pero no verificación semántica completa mediante solvers.

## Limitaciones y advertencias

- Es una prueba de concepto sin datos de rendimiento ni evaluación independiente publicados.
- No se distribuyen pesos del modelo; el repositorio solo contiene código fuente, lo que impide su uso directo sin un LLM base externo.
- La licencia no está especificada, lo que impide determinar si es usable en entornos comerciales o de código abierto.
- La latencia añadida por la verificación SMT puede ser alta en restricciones complejas, comprometiendo el rendimiento en tiempo real.
- El diseño está orientado a contextos de defensa e inteligencia con clasificación CUI, lo que puede limitar su aplicabilidad en dominios generales.
- No hay evidencia de que el sistema haya sido validado en producción ni de que los solvers manejen correctamente todos los casos límite de las restricciones definidas.
- La dependencia de un LLM base externo implica que las alucinaciones no se eliminan por completo, solo se restringen a los dominios cubiertos por las aserciones formales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dassensei/sat-constrained-qwen-poc
- Organización Qwen (referencia al posible modelo base): https://huggingface.co/Qwen
- Líder de modelos LLM (referencia general, no específica): https://llm-stats.com/leaderboards/llm-leaderboard
