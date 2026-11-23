# richardyoung/inside-llm-demo

## Resumen

`richardyoung/inside-llm-demo` no es un modelo de lenguaje, sino un Space estático de Hugging Face que reproduce sesiones grabadas de **inside-llm**, una herramienta de visualización creada por Manuel G. que muestra el proceso interno de generación de un LLM token a token: probabilidades, candidatos descartados, la cadena de muestreo y los puntos de divergencia entre dos cuantizaciones del mismo modelo. El repositorio lo publica el usuario `richardyoung` como una propuesta de mejora (pull request no fusionado) sobre la build original, añadiendo explicaciones emergentes al pasar el cursor.

La relevancia de esta ficha es acotada: no hay pesos, no hay arquitectura, no hay inferencia. El Space funciona con `sdk: static` y reproduce sesiones pregrabadas en el navegador, sin modelo ni GPU. Cualquier evaluación como modelo desplegable debe descartarse de entrada.

El valor real está en el plano didáctico: sirve para explicar a desarrolladores e investigadores cómo se comporta un sampler, qué significa la entropía de una distribución de tokens o cómo dos cuantizaciones distintas divergen en la misma secuencia. El tamaño del repositorio es de 0.0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo; Space estático de replay) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (la demo visualiza divergencias entre cuantizaciones, pero no incluye pesos) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (no contiene pesos; el repo mide 0.0 GB) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento asociado a este repositorio. Se trata de una aplicación web estática (`sdk: static`) que carga sesiones grabadas de la herramienta inside-llm y las reproduce en el navegador. La demo original de inside-llm instrumenta un motor de inferencia real para capturar, en cada paso de decodificación, la distribución de probabilidad sobre el vocabulario, los candidatos alternativos, las decisiones de la cadena de sampler (temperatura, top-k, top-p, etc.) y las divergencias entre dos cuantizaciones del mismo modelo.

La contribución de esta build concreta son las explicaciones emergentes: al pasar el puntero sobre las seis cifras en vivo, las fichas de candidatos (entropía, opciones, divergencia, KL A‖B · B‖A), las etiquetas de la banda temporal o cualquier etapa de la cadena de muestreo, aparece una tarjeta que describe en lenguaje llano qué mide cada elemento. Los mismos textos están disponibles en la hoja de ayuda. No se ejecuta ningún cálculo nuevo: todo lo que requeriría pedir texto al motor está deshabilitado.

## Capacidades

- Reproducción de sesiones grabadas de generación de texto token a token, con visualización de la distribución de probabilidad en cada paso.
- Inspección de candidatos descartados por el sampler y de la cadena de decisiones que llevó al token elegido.
- Comparación de divergencias entre dos cuantizaciones del mismo modelo sobre la misma secuencia.
- Visualización de métricas de divergencia entre distribuciones (KL A‖B y B‖A) y de entropía por paso.
- Explicaciones emergentes (hover) sobre cada figura, chip y etapa del sampler, orientadas a lectores sin familiaridad con probabilidades de tokens.
- Hoja de ayuda integrada con el mismo contenido explicativo.
- Navegación por la línea temporal de la sesión y por ramas alternativas de generación.
- No soporta tool calling, agentes, visión, audio ni generación de texto nueva: esas funciones están deshabilitadas por diseño.

## Casos de uso

- Docencia sobre sampling en LLMs: proyectar una sesión grabada y usar las explicaciones emergentes para introducir temperatura, top-k, top-p y entropía sin necesidad de infraestructura de GPU en el aula.
- Formación interna de equipos de ingeniería: explicar por qué dos ejecuciones del mismo prompt divergen y cómo la cuantización afecta a la distribución de salida, usando la vista de divergencia entre cuantizaciones.
- Material de soporte para revisiones de código de pipelines de inferencia: ilustrar qué hace exactamente cada parámetro del sampler antes de fijar valores en producción.
- Divulgación técnica en charlas y talleres: la demo es estática y se sirve desde Hugging Face Spaces, por lo que funciona en cualquier navegador sin instalación ni GPU.
- Evaluación de materiales didácticos sobre interpretabilidad: comparar la build upstream con esta variante con explicaciones para decidir si se adopta el cambio propuesto.
- Referencia para desarrolladores que quieran construir visualizadores propios: el código de la demo sirve como ejemplo de instrumentación de un motor de inferencia para capturar distribuciones por paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; la demo no ejecuta inferencia y funciona enteramente en el navegador del cliente.
- GPU: no requiere GPU. El Space se sirve como contenido estático.
- GPU de consumo: irrelevante para este repositorio; no hay modelo que cargar.
- Despliegue: Hugging Face Spaces con `sdk: static`. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no hay pesos.
- Latencia y throughput: dependen únicamente del navegador y de la red al cargar los recursos estáticos; no se han publicado mediciones.

## Comparativa con modelos similares

| Proyecto | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| richardyoung/inside-llm-demo | Space estático de replay con explicaciones | no aplica | no aplica | MIT | Hugging Face Spaces |
| inside-llm (upstream, Manuel G.) | Herramienta de visualización de inferencia en vivo | no aplica | no aplica | MIT | Repositorio en GitHub |
| Modelos LLM desplegables (p. ej. familias abiertas de 7B-70B) | Modelos con pesos | 7B-70B típicamente | variable | variable | Hugging Face Hub |

La comparación con modelos de lenguaje no es significativa: este repositorio no compite en la categoría de modelos, sino en la de herramientas didácticas de interpretabilidad. Frente a la build upstream de inside-llm, la diferencia es la capa de explicaciones emergentes y la ausencia de motor de inferencia.

## Limitaciones y advertencias

- No es un modelo: no genera texto, no acepta prompts y no puede integrarse en pipelines de inferencia.
- Las sesiones están pregrabadas; no reflejan el comportamiento de un modelo concreto en tiempo real ni con prompts del usuario.
- La build corresponde a un cambio no fusionado (pull request pendiente en upstream); puede quedar desactualizada respecto al repositorio original.
- No se declaran idiomas soportados ni pipeline en los metadatos de Hugging Face.
- Sin descargas ni likes registrados en el momento de la consulta; no hay evidencia de uso en producción.
- La licencia MIT permite uso comercial del código, pero el contenido de las sesiones grabadas puede estar sujeto a los términos del proyecto upstream; conviene verificar antes de redistribuir.
- No debe citarse como referencia de rendimiento de ningún modelo: las cifras mostradas corresponden a sesiones grabadas de un motor no especificado en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/inside-llm-demo
- Repositorio upstream de inside-llm (Manuel G.): https://github.com/manuelgscom/inside-llm
