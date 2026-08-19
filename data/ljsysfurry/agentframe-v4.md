# ljsysfurry/AgentFrame-v4

## Resumen

AgentFrame-v4 es un framework de software para la gestión de contexto en agentes de IA, no un modelo de lenguaje preentrenado. Lo desarrolla el usuario ljsysfurry y se publica bajo licencia GPL-3.0. El proyecto resuelve el problema de la pérdida de contexto en agentes que operan con modelos LLM externos (principalmente DeepSeek), mediante un sistema de compresión y gestión de memoria de cuatro capas.

La arquitectura se compone de un motor de contexto (ContextEngine) que integra cuatro niveles: L1 cognitivo (descomposición de tareas), L2 de enrutamiento (recuperación por landmarks), L3 de almacenamiento (compresión de KV cache mediante MLA absorbida) y L4 físico (paginación de KV con curva de olvido). El framework se conecta a un proveedor LLM externo (DeepSeek) y a un proveedor de embeddings, ofreciendo una API REST, interfaz CLI y biblioteca Python.

La relevancia actual del proyecto reside en su enfoque en la eficiencia de memoria para agentes con ventanas de contexto largas. Los datos publicados indican una compresión física de KV cache de 28,4x en GPU L40S con DeepSeek-V2-Lite (15,7B parámetros) y una compresión semántica de 3,2x, que combinadas alcanzan aproximadamente 115x de reducción total. El framework incorpora mecanismos de protección de precisión Top-K, curvas de olvido exponenciales y persistencia incremental de KV.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Framework de gestión de contexto para agentes (no es un LLM) |
| Parametros totales | no disponible (depende del LLM externo conectado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (gestiona contexto de LLM externo) |
| Tipos de cuantizacion | INT4 (KV cache), 16-bit para bloques críticos Top-K |
| Idiomas soportados | no disponible |
| Licencia | GPL-3.0 |
| Formato de pesos | no disponible (framework Python, no pesos de modelo) |

## Arquitectura y entrenamiento

AgentFrame-v4 no es un modelo entrenado sino un framework de software. Su arquitectura interna se organiza en cuatro capas de gestión de contexto:

- L1 (MetaCog): descompone tareas e identifica carencias de información.
- L2 (LandmarkRouter): enrutamiento por landmarks con recuperación jerárquica y softmax por capas.
- L3 (AbsorbedMLA): compresión de KV cache mediante Multi-head Latent Attention (MLA) absorbida con cuantización INT4 real (576 dimensiones → 288 bytes q4 + 64 bytes scales, ratio 29,1x).
- L4 (KVPager): paginación física de KV con tres niveles y curva de olvido exponencial S(t) = I·2^(-t/τ).

El framework se conecta a un LLM externo (DeepSeek) que actúa como "cerebro" y a un proveedor de embeddings (hash o API). No hay datos de entrenamiento porque no es un modelo; los tests publicados se centran en la validación de los mecanismos de compresión y recuperación.

## Capacidades

- Compresión de KV cache con cuantización INT4 real: ratio 29,1x por capa con coseno de similitud 0,998.
- Protección de precisión Top-K: bloques críticos se mantienen en 16-bit mientras el resto se cuantiza a 4-bit, con 0/100 inversiones en pruebas.
- Curva de olvido exponencial con refuerzo por acceso: S(t) = I·2^(-t/τ) + log2(access+1)×0,1.
- LFRU (Least Frequently Recently Used) con histéresis para evitar fluctuaciones en la expulsión de bloques.
- Prefetch por co-ocurrencia: al recuperar el bloque A, precarga bloques B que suelen aparecer con A.
- Persistencia incremental de KV: cada turno se añade sin reescribir el estado completo, con tolerancia a fallos (crash-safe).
- Reutilización de prefijos: consultas con el mismo prefijo reutilizan la búsqueda anterior.
- Integración con función de llamada (function calling) para ejecutar código y autoverificación por parte del agente.
- Multi-sesión: cada sesión tiene un motor de contexto independiente y estado persistible.
- API REST v1 con endpoints para crear sesiones, ingerir conocimiento, consultar con generación y ejecutar herramientas.

## Casos de uso

- Asistentes de conocimiento con contexto largo: el framework permite ingerir documentos y consultarlos con generación aumentada por recuperación, manteniendo el contexto a través de múltiples turnos sin agotar la ventana del LLM.
- Agentes de ejecución de código: mediante el modo "ask_hands", el agente puede ejecutar código para verificar hipótesis (por ejemplo, semántica de operadores en Python) y devolver resultados verificados.
- Sistemas de atención al cliente multi-turno: la persistencia de KV por sesión y la curva de olvido permiten mantener conversaciones largas sin degradación, priorizando información reciente y relevante.
- Pipelines de automatización con herramientas: la integración con function calling permite construir agentes que llaman APIs, consultan bases de datos y ejecutan scripts, con gestión eficiente de memoria intermedia.
- Demostraciones offline de gestión de memoria: el modo demo del CLI permite probar los mecanismos de compresión y recuperación sin necesidad de API key, útil para investigación y docencia.
- Servicios de backend para aplicaciones multi-usuario: la API REST con sesiones independientes permite desplegar un servicio de consulta con contexto persistente para múltiples clientes simultáneos.

## Benchmarks y rendimiento

Los datos publicados en la model card incluyen métricas de compresión y precisión medidas en GPU L40S:

| Métrica | Valor | Condiciones |
|---|---|---|
| Compresión física KV cache | 28,4x | L40S, DeepSeek-V2-Lite 15,7B |
| Compresión física por capa | 29,1x (352 B/capa) | INT4, 576 dimensiones |
| Coseno de similitud (ida y vuelta) | 0,998 | Cuantización simétrica per-channel |
| Inversiones Top-K (bloques 16-bit) | 0/100 | Prueba independiente |
| Compresión semántica | 3,2x | Eliminación de tokens de conversación trivial |
| Compresión total combinada | ~115x | 100 tokens → 31 tokens × 7,6 KB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque el framework no es un modelo de lenguaje.

## Requisitos de hardware

- GPU recomendada para validación: L40S (los tests de compresión se ejecutaron en esta GPU).
- VRAM estimada: no disponible; depende del LLM externo conectado (el framework en sí es ligero, aproximadamente 118 kB de código).
- Compatible con GPU de consumo: sí, el framework es software y puede ejecutarse en cualquier sistema con Python; la VRAM necesaria la determina el LLM externo.
- Opciones de despliegue: CLI, API REST (servidor Python), biblioteca Python, systemd (carpeta deploy).
- Latencia y throughput: no disponible; dependen del proveedor LLM externo y del hardware.

## Comparativa con modelos similares

No disponible. No se han identificado frameworks comparables con las mismas características de compresión de KV cache y gestión de contexto multi-nivel en la información proporcionada. El proyecto cita "colibrì" como fuente de inspiración para algunas técnicas (quant.h, couple, kv_persist, kv_prefix), pero no se dispone de datos suficientes para una comparación estructurada.

## Limitaciones y advertencias

- El proyecto está en fase de desarrollo: varias capacidades están marcadas como "diseño no conectado" (Sector-Block-Module) o "experimento no integrado en el flujo principal" (protección Top-K).
- Depende de un LLM externo (DeepSeek) para la generación y el juicio semántico; sin API key, solo funciona el modo demo offline.
- La licencia GPL-3.0 implica que cualquier distribución del framework debe liberar el código fuente bajo la misma licencia, lo que puede ser restrictivo para uso comercial propietario.
- No se han publicado datos sobre sesgos, alucinaciones o robustez en producción; el framework delega estas cuestiones al LLM subyacente.
- El número de descargas y likes es cero, lo que indica que el proyecto no ha sido validado por la comunidad.
- La fecha de creación (2026-08-19) y actualización (2026-08-19) sugiere que es un proyecto muy reciente y posiblemente en fase experimental.
- Los tests de compresión se realizaron con un modelo específico (DeepSeek-V2-Lite) y pueden no generalizar a otros LLM.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ljsysfurry/AgentFrame-v4
- Repositorio HuggingFace (versión anterior): https://huggingface.co/ljsysfurry/AgentFrame
- Árbol de archivos en HuggingFace: https://huggingface.co/ljsysfurry/AgentFrame/tree/main
- Proyecto relacionado en GitHub (no confirmado como el mismo): https://github.com/JunyanKang/agentframe/releases
