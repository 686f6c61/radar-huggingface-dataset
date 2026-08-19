# SixpertAI/self-scaffolding-rl

## Resumen

El repositorio `SixpertAI/self-scaffolding-rl` no contiene un modelo de lenguaje preentrenado, sino un framework de entrenamiento por refuerzo (RL) denominado "Self-Scaffolding RL Training Framework" diseñado para los modelos Sixpert K1 y K2. Según la descripción del autor, este framework se inspira en el enfoque de auto-andamiaje (self-scaffolding) de Ornith 1.0, donde el propio modelo genera el harness de ejecución (código Python) para cada tarea y aprende mediante señales de recompensa a mejorar esos harnesses.

El framework amplía el concepto original con capacidades multi-dominio (programación, trading, ciberseguridad, biomedicina y razonamiento), compartición de scaffolds entre dos modelos (K1 y K2), una biblioteca persistente de scaffolds con recuperación por similitud, currículo de auto-juego y detección avanzada de reward hacking. Sin embargo, no se proporcionan datos concretos sobre la arquitectura, tamaño, parámetros o licencia de los modelos K1 y K2, ni sobre el propio framework como artefacto desplegable.

La relevancia actual de este repositorio es limitada: se trata de un código de entrenamiento sin pesos publicados, sin benchmarks y sin documentación técnica sobre los modelos subyacentes. Su valor principal es conceptual, como referencia para investigadores interesados en técnicas de auto-mejora mediante RL con generación de harnesses.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se menciona que K1 y K2 son multimodales, pero sin detalle) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | se menciona 1M tokens para K2, pero sin confirmación oficial |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se publican pesos) |

## Arquitectura y entrenamiento

La información disponible describe un framework de entrenamiento RL en dos etapas. En la primera etapa, el modelo genera un harness Python (scaffold) que define cómo se ejecutará una tarea, incluyendo lógica de selección de herramientas, gestión de estado, manejo de errores y criterios de terminación. En la segunda etapa, el modelo utiliza ese harness para resolver la tarea, y la recompensa obtenida se propaga hacia ambas etapas. Esto permite que los patrones de orquestación que producen trayectorias de alta recompensa sobrevivan y los débiles sean reemplazados.

El framework incluye componentes como un generador de scaffolds, un ejecutor de soluciones, funciones de recompensa por dominio, una biblioteca persistente de scaffolds con recuperación por similitud, un módulo de compartición entre modelos (K1 y K2), un sistema de auto-juego donde cada modelo genera tareas para el otro, y un detector de reward hacking. Se menciona que los modelos son "uncensored" (sin alineación), multimodales y con contexto largo (1M tokens para K2), pero no se especifican los datos de entrenamiento, el número de tokens, ni si se usó RLHF o DPO. Tampoco se detalla la arquitectura subyacente (transformer, MoE, SSM, etc.).

## Capacidades

- Generación de harnesses Python personalizados para cada tarea (self-scaffolding).
- Soporte multi-dominio: programación (22 tareas), trading/finanzas (18 tareas), ciberseguridad (19 tareas), biomedicina (18 tareas) y razonamiento general (25 tareas).
- Compartición de scaffolds entre dos modelos (K1 y K2) para mejora colaborativa.
- Biblioteca persistente de scaffolds con recuperación por similitud para reutilización.
- Currículo de auto-juego: los modelos generan tareas entre sí con dificultad adaptativa (objetivo de éxito del 50-60%).
- Capacidades multimodales (visión/comprensión de imágenes) en los scaffolds, según la descripción.
- Contexto largo de 1M tokens para K2 (según la descripción, sin confirmación).
- Sin restricciones de alineación ("uncensored"), lo que permite explorar rutas de solución no consideradas por modelos alineados, especialmente en ciberseguridad.

## Casos de uso

Dado que no se publican pesos ni un modelo listo para usar, los casos de uso se limitan al ámbito de investigación y desarrollo de frameworks de entrenamiento RL:

- Investigación en auto-mejora de agentes: el framework sirve como referencia para implementar sistemas donde el modelo genera su propio harness de ejecución y aprende a mejorarlo mediante RL.
- Desarrollo de agentes multi-dominio: permite entrenar modelos que se adaptan a tareas de programación, trading, ciberseguridad, biomedicina y razonamiento con scaffolds específicos por dominio.
- Entrenamiento adversarial entre modelos: el sistema de auto-juego puede aplicarse para crear currículos de entrenamiento dinámicos donde dos modelos se retan mutuamente.
- Estudio de reward hacking: el módulo anti-reward-hacking con detección multi-capa puede servir como base para investigar cómo prevenir el sobreajuste a recompensas espurias.
- Compartición de conocimiento entre modelos: la biblioteca persistente de scaffolds y el intercambio entre modelos permiten estudiar cómo transferir estrategias de ejecución entre arquitecturas diferentes.
- Entrenamiento con contexto largo: la capacidad de 1M tokens (si se confirma) permitiría diseñar tareas que requieran razonamiento sobre documentos extensos o historiales de interacción largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El repositorio describe un framework de entrenamiento, no un modelo evaluado.

## Requisitos de hardware

No se especifican requisitos de hardware en la información proporcionada. Al no publicarse pesos ni un modelo concreto, no es posible estimar VRAM, GPUs recomendadas ni opciones de despliegue. El framework está escrito en Python (según la estructura de archivos) y probablemente requiere GPUs para el entrenamiento RL, pero no se dan detalles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con modelos concretos. La descripción menciona a Ornith 1.0 como inspiración, pero no se proporcionan datos de rendimiento ni especificaciones de K1/K2 que permitan una comparación objetiva. No se puede establecer una tabla comparativa fiable.

## Limitaciones y advertencias

- El repositorio no contiene un modelo preentrenado ni pesos publicados; es solo código de entrenamiento.
- No hay información verificable sobre arquitectura, parámetros, licencia o idiomas de los modelos K1 y K2.
- La descripción menciona capacidades "uncensored" y aplicaciones en ciberseguridad ofensiva (reverse shells, escalada de privilegios, etc.), lo que implica riesgos éticos y legales significativos si se utiliza con fines malintencionados.
- No se han publicado benchmarks ni evaluaciones independientes que respalden las afirmaciones de rendimiento.
- La fecha de creación (2026) es posterior a la fecha actual, lo que sugiere que la información podría ser especulativa o no verificada.
- No se indica si el framework es compatible con frameworks de despliegue estándar (vLLM, llama.cpp, etc.) ni si existe soporte para cuantización.
- La licencia no está especificada, por lo que no se puede determinar si el uso comercial está permitido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SixpertAI/self-scaffolding-rl
- No se proporcionan otros enlaces (papers, blogs, repos, demos) en la información disponible.
