# Dani0604/proyecto3-text2sql-qlora

## Resumen

Dani0604/proyecto3-text2sql-qlora es un adapter PEFT (LoRA cuantizado con QLoRA) entrenado sobre Qwen/Qwen2.5-Coder-1.5B-Instruct para tareas de text-to-SQL en castellano sobre bases de datos MySQL. Lo han desarrollado Wilson Alejandro Calderón Argueta y Pablo Daniel Barillas Moreno como proyecto académico de Deep Learning y Sistemas Inteligentes en la Universidad del Valle de Guatemala. El adapter añade 36.929.536 parámetros entrenables al modelo base de 1.500 millones de parámetros y resuelve el problema de generar consultas SQL sintácticamente válidas y semánticamente correctas a partir de preguntas en lenguaje natural en español.

Su relevancia radica en demostrar que un fine-tuning eficiente con QLoRA (rango 32, NF4 de 4 bits) sobre un modelo de código pequeño puede llevar la métrica de ejecución exacta (EX ponderada) del 3,8 % del modelo base al 97,4 % en su conjunto de validación propio, con un entrenamiento de apenas 133,4 minutos en una RTX 4050 Laptop de 6 GB. La generación es determinista, local y está restringida a una única consulta `SELECT` o `WITH ... SELECT`, lo que lo hace apto para pipelines controlados de consulta a bases de datos MySQL.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adapter QLoRA (PEFT) sobre Qwen2.5-Coder-1.5B-Instruct (transformer decoder) |
| Parámetros totales | ~1.500 millones (modelo base, no incluido en el repo) |
| Parámetros activos | no disponible (no es MoE) |
| Parámetros entrenables | 36.929.536 |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-Coder-1.5B-Instruct) |
| Tipos de cuantización | NF4 de 4 bits (QLoRA), cómputo en FP16 |
| Idiomas soportados | Español (preguntas en lenguaje natural); SQL como salida |
| Licencia | MIT |
| Formato de pesos | safetensors (`adapter_model.safetensors`, ~0,1 GB el repo) |

## Arquitectura y entrenamiento

El modelo es un adapter QLoRA aplicado sobre Qwen2.5-Coder-1.5B-Instruct, un transformer decoder optimizado para generación de código. La configuración de LoRA emplea rango 32, alpha 32 y dropout 0,05, con el modelo base cuantizado a NF4 de 4 bits y cómputo en FP16 (el esquema clásico de QLoRA). Se entrenó también una variante con rango 16; ambas empataron en calidad (97,4 % de EX ponderada y 97,5 % de SQL ejecutable), y se eligió r=32 por su menor latencia p95 (13,20 s frente a 15,72 s). Los autores probaron además una técnica de reparación guiada de consultas, que no mejoró la EX y añadió latencia, por lo que se descartó.

El conjunto de entrenamiento consta de 2.592 pares pregunta-SQL auditables construidos sobre 12 esquemas propios, ejecutados y verificados en MySQL 8.4.10. La validación se realizó con 40 preguntas sobre dos esquemas inéditos no vistos durante el entrenamiento. El entrenamiento completo duró 133,4 minutos en una RTX 4050 Laptop con 6 GB de VRAM, con semilla 2026 para reproducibilidad. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Generación de consultas SQL a partir de preguntas en lenguaje natural en español
- Compatibilidad con MySQL 8.4.10 (los datos de entrenamiento se validaron ejecutando las consultas en esa versión)
- Generación determinista y local, sin dependencia de APIs externas
- Restricción de salida a una única consulta `SELECT` o `WITH ... SELECT`, lo que simplifica la validación y el uso en producción
- Alta tasa de SQL ejecutable (97,5 % en su validación propia)
- Uso como adapter PEFT: se carga sobre el modelo base con la librería `peft` de Hugging Face, sin necesidad de token para su descarga

No se ha documentado soporte de tool calling, capacidades de agente, visión ni audio; el alcance del adapter se limita a text-to-SQL en español.

## Casos de uso

- Consulta en lenguaje natural a bases de datos MySQL: un usuario no técnico puede formular preguntas en español y obtener una consulta SQL lista para ejecutar, gracias al ajuste específico sobre esquemas MySQL.
- Chatbots de análisis de datos internos: integrable en aplicaciones donde empleados consulten métricas de negocio sin escribir SQL, con la garantía de salida restringida a una única consulta SELECT.
- Automatización de informes: generación programática de consultas a partir de plantillas de preguntas, aprovechando la generación determinista para resultados reproducibles.
- Prototipado de capas text-to-SQL: por su licencia MIT y su bajo consumo de VRAM (1,438 GB asignados en la prueba con T4), es adecuado como punto de partida para proyectos que necesiten adaptar el enfoque a otros esquemas.
- Entornos académicos y de investigación: el repo incluye evidencia de reproducibilidad (SHA-256 del adapter, revisión fija de Hugging Face, notebooks de prueba), útil como referencia metodológica para fine-tuning eficiente.
- Validación y sandboxes de seguridad: la restricción a `SELECT`/`WITH ... SELECT` reduce la superficie de riesgo al evitar consultas de escritura o DDL, apropiado para exponer consultas sobre bases de datos de solo lectura.

## Benchmarks y rendimiento

Resultados publicados por los autores en su conjunto de validación propio (40 preguntas sobre dos esquemas inéditos):

| Variante | EX ponderada | SQL ejecutable | Latencia p95 |
|---|---:|---:|---:|
| Modelo base (Qwen2.5-Coder-1.5B-Instruct) | 3,8 % | 62,5 % | 6,66 s |
| QLoRA r=16 | 97,4 % | 97,5 % | 15,72 s |
| QLoRA r=32 (publicado) | 97,4 % | 97,5 % | 13,20 s |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, Spider, etc.), por lo que no es posible comparar directamente con otros sistemas text-to-SQL del estado del arte. Los datos disponibles provienen exclusivamente de la evaluación propia de los autores.

## Requisitos de hardware

- VRAM para inferencia: el adapter usó 1,438 GB de VRAM asignada en la prueba limpia con Tesla T4 (el modelo base cuantizado a 4 bits debe sumarse a esa cifra; el conjunto cabe en GPUs de 6 GB).
- Entrenamiento: se completó en una RTX 4050 Laptop con 6 GB de VRAM en 133,4 minutos, lo que indica que el pipeline completo es viable en GPUs de consumo modestas.
- Cabe en GPUs de consumo: sí; la prueba con Tesla T4 (16 GB) aprobó instalación, carga, determinismo y restauración del adapter, y el entrenamiento original se hizo con 6 GB.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM (RTX 4050, RTX 4060, T4, RTX 4090, etc.); no se han documentado requisitos de GPUs de centro de datos de gama alta.
- Despliegue: el uso documentado se basa en `transformers` + `peft` (carga del adapter sobre el modelo base). No se mencionan explícitamente vLLM, llama.cpp, Ollama ni TGI; al ser un adapter PEFT en safetensors, la vía soportada es la pila de Hugging Face.
- Latencia: p95 de 13,20 s en la configuración publicada (r=32); el modelo base sin adapter fue de 6,66 s.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Dani0604/proyecto3-text2sql-qlora | Adapter QLoRA sobre Qwen2.5-Coder-1.5B-Instruct | 36,9 M entrenables (base ~1,5 B) | no disponible | MIT | Especializado en text-to-SQL en español sobre MySQL; EX 97,4 % en validación propia |
| Qwen/Qwen2.5-Coder-1.5B-Instruct (base) | Transformer decoder | ~1,5 B | no disponible (en su ficha) | Qwen Research / Apache-2.0 (según repo base) | Sin ajuste text-to-SQL: EX 3,8 % en la misma validación |
| QLoRA r=16 (variante interna) | Adapter QLoRA | 36,9 M entrenables | no disponible | MIT | Misma calidad (97,4 % EX) pero mayor latencia p95 (15,72 s) |

No se han publicado comparaciones con otros sistemas text-to-SQL externos (por ejemplo, modelos ajustados sobre Spider o BIRD) en la información disponible.

## Limitaciones y advertencias

- La validación propia solo cubre dos esquemas inéditos y 40 preguntas; no equivale a una evaluación oculta ni a benchmarks públicos como Spider o BIRD.
- Los identificadores abreviados, la mezcla de idiomas y los dominios muy distintos a los esquemas de entrenamiento pueden reducir la métrica EX.
- Se documentó un caso de validación fallido por una entidad inexistente, lo que indica sensibilidad a esquemas con entidades no presentes en el contexto.
- El modelo base no está incluido en el repositorio; Transformers lo descarga por separado, lo que implica dependencia de la disponibilidad del repo de Qwen.
- La generación está restringida a una única consulta `SELECT` o `WITH ... SELECT`: no sirve para consultas de escritura, DDL ni múltiples sentencias.
- La latencia p95 (13,20 s) es elevada para aplicaciones interactivas en tiempo real.
- No se ha evaluado el riesgo de alucinación más allá del caso documentado; como todo modelo de lenguaje, puede generar SQL semánticamente incorrecto aunque sea sintácticamente válido.
- No se reportan sesgos conocidos ni auditorías de seguridad; el uso en producción contra bases de datos sensibles debería incluir validación de las consultas generadas.
- La licencia MIT del adapter permite uso comercial sin restricciones, pero conviene verificar la licencia del modelo base Qwen2.5-Coder-1.5B-Instruct para el despliegue final.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Dani0604/proyecto3-text2sql-qlora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Revisión del adapter citada en la model card: `24658a4efce8303165906832f0eede2b5c56de84`

No se han encontrado enlaces adicionales a papers, blogs, demos u otros repositorios en la información disponible.
