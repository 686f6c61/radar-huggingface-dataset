# LayerFault/script-python-encoded-capability-name

## Resumen

El repositorio `LayerFault/script-python-encoded-capability-name` es un artefacto sintético de la colección Layerfault, un corpus diseñado para evaluar y ejercitar escáneres de seguridad de modelos y repositorios. No se trata de un modelo de IA utilizable en producción: el propio autor indica explícitamente que contiene características adversarias deliberadas (opcodes de pickle sospechosos, contrabando de formatos ejecutables, cadenas de prompt-injection) para probar reglas de detección.

Su relevancia es exclusivamente como fixture de test para herramientas de seguridad de la cadena de suministro de software y modelos. Pertenece al corpus LF-CH-SCRX-0003, con un nivel de severidad medio y clasificación de dificultad difícil. No existen parámetros, arquitectura, ni pesos de modelo; se trata de un archivo Python con contenido ofuscado diseñado para verificar si un escáner lo bloquea.

La fecha de creación es el 21 de agosto de 2026, y no se registran descargas ni likes. El acceso está restringido con una puerta de aceptación (gated) que advierte del riesgo antes de descargar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el artefacto contiene código Python, no pesos) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo ni proceso de entrenamiento. El repositorio es un artefacto de prueba sintético que contiene código Python ofuscado con características adversarias diseñadas para activar reglas de detección en escáneres de seguridad. El autor lo clasifica como un "control/comparison input" sin reglas esperadas directas, aunque sugiere una regla candidata (`LF-CODE-SUBPROCESS`) que podría activarse. No hay datos de entrenamiento, tokens ni técnicas como RLHF o DPO.

## Capacidades

- No es un modelo de lenguaje: no genera texto, código ni razonamiento.
- Su función es servir como entrada de prueba para escáneres de seguridad, evaluando si detectan técnicas de ofuscación y posible ejecución de subprocesos.
- Está diseñado para ser bloqueado: la clasificación esperada es BLOCK.
- Contiene secretos falsos y destinos de red de loopback/`.invalid` para evitar efectos fuera del entorno aislado.
- No soporta tool calling, agentes, vision ni ninguna capacidad de IA.

## Casos de uso

- Prueba de escáneres de seguridad de repositorios: se usa como entrada positiva para verificar que una herramienta de detección (como scanners de HuggingFace) bloquea artefactos con opcodes de pickle sospechosos o código ofuscado.
- Validación de reglas de detección en pipelines de CI/CD: los equipos de seguridad pueden añadirlo a su suite de test para confirmar que sus reglas (p.ej., `LF-CODE-SUBPROCESS`) se activan.
- Evaluación de scanners de cadena de suministro: sirve para comprobar si herramientas como Semgrep, TruffleHog o escáneres de HuggingFace detectan el patrón de subproceso encubierto.
- Investigación de técnicas de ofuscación: los investigadores pueden estudiar cómo se codifica una "capability name" en Python y qué técnicas de transformación se aplican (aunque en este caso las transformaciones son "none").
- Prueba de control en comparativas de detectores: al ser un control positivo, se usa para medir la tasa de detección de un escáner frente a un artefacto malicioso conocido.
- Entrenamiento de modelos de seguridad: se puede incluir en datasets de entrenamiento de clasificadores de código malicioso, aunque el propio repositorio no es un modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No es un modelo de IA, por lo que no tiene métricas de rendimiento como MMLU, HumanEval o GSM8K. La única métrica relevante es si el escáner de seguridad lo detecta correctamente, pero eso depende de la herramienta evaluada, no del artefacto.

## Requisitos de hardware

- No requiere GPU ni VRAM: se trata de un archivo de código, no de un modelo de inferencia.
- Puede ejecutarse en cualquier máquina con Python para análisis estático, pero se recomienda hacerlo en un entorno aislado (contenedor, sandbox) por su naturaleza adversaria.
- No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- El único "despliegue" relevante es pasarlo por un escáner de seguridad, no por un runtime de inferencia.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos comparables porque este no es un modelo de IA. El corpus Layerfault podría contener otros artefactos de prueba, pero no se proporcionan datos de otros repositorios para comparar.

## Limitaciones y advertencias

- No es un modelo de IA: no se puede usar para generación de texto, código, razonamiento ni ninguna tarea de ML.
- Contiene características adversarias: opcodes de pickle sospechosos, contrabando de formatos ejecutables y strings de prompt-injection. Ejecutarlo fuera de un entorno aislado puede activar comportamientos no deseados.
- Riesgo de confusión: si un desarrollador o investigador lo descarga sin leer la model card, podría intentar cargarlo como un modelo y fallar o, peor, ejecutar código malicioso.
- No hay garantía de que los secretos sean falsos: aunque el autor indica que usa fake secrets, la naturaleza adversarial del artefacto recomienda tratarlo como potencialmente peligroso.
- Licencia Apache 2.0 permite uso comercial, pero el propósito real es de testing de seguridad, no de producción.
- No tiene actualizaciones ni mantenimiento previsto: es un fixture estático para pruebas.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/LayerFault/script-python-encoded-capability-name
- No se proporcionan papers, blogs, demos ni repositorios adicionales en la información disponible.
