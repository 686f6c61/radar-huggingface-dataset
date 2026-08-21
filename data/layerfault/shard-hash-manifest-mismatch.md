# LayerFault/shard-hash-manifest-mismatch

## Resumen

`LayerFault/shard-hash-manifest-mismatch` es un artefacto sintético de prueba de seguridad perteneciente al corpus LayerFault, un proyecto de validación y admisión de modelos de IA locales. No se trata de un modelo de aprendizaje automático utilizable: contiene solo 32 parámetros y está diseñado específicamente para ejercitar reglas de detección de escáneres de seguridad, no para generar texto, razonar ni ejecutar ninguna tarea de IA. La model card lo clasifica explícitamente como un fixture de test, con la advertencia de que no debe cargarse ni ejecutarse fuera de un entorno aislado de pruebas.

El repositorio fue creado el 21 de agosto de 2026 por el autor LayerFault, con licencia Apache-2.0, y no registra descargas ni likes. Su propósito es servir como control positivo para detectar vulnerabilidades en el proceso de admisión de modelos locales, como la falta de verificación de integridad en los manifiestos de shards. La etiqueta de acceso `gated: auto` y el prompt de confirmación obligatorio subrayan su naturaleza de artefacto de riesgo controlado, no de modelo de producción.

En el contexto actual de seguridad en IA, este artefacto es relevante porque ejemplifica una categoría de ataques dirigidos a la cadena de suministro de modelos: la manipulación del estado de los shard durante el empaquetado o la descarga. Su existencia permite a los desarrolladores de herramientas de admisión probar y mejorar sus escáneres antes de que estos encuentren artefactos maliciosos reales en el ecosistema.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo ML) |
| Parametros totales | 32 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (archivo de prueba, no pesos reales) |

## Arquitectura y entrenamiento

No existe una arquitectura de red neuronal ni un proceso de entrenamiento asociado a este repositorio. El artefacto es un fichero con características sintéticas y adversariales —como códigos de operación sospechosos en pickle, contrabando de formatos ejecutables o cadenas de inyección de prompts— que se utiliza para evaluar la capacidad de los escáneres de seguridad para detectar tales anomalías. La model card indica que forma parte del corpus de pruebas `LF-CH-SHARD-0009` y que su técnica de ataque es el desajuste de hash en el manifiesto de shard, un vector que compromete la integridad de los modelos distribuidos en múltiples ficheros.

El repositorio no contiene datos de entrenamiento, ni pesos entrenados, ni lógica de inferencia. Su contenido se limita a un artefacto de prueba con características maliciosas simuladas, diseñado para ser analizado estáticamente o ejecutado únicamente en un entorno de pruebas de escáner aislado.

## Capacidades

- No tiene capacidades de generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene soporte multilingüe ni de agentes.
- Su única "capacidad" es servir como entrada de prueba para escáneres de seguridad: contiene características como códigos de opcode sospechosos, contrafos de formato ejecutable y cadenas de inyección de prompts que un detector debería identificar y bloquear.
- Actúa como control positivo en el corpus LayerFault para verificar que las reglas de admisión de modelos detectan correctamente artefactos maliciosos.

## Casos de uso

- **Validación de escáneres de seguridad de modelos**: el artefacto se utiliza para comprobar que un sistema de admisión de modelos locales (como el proyecto LayerFault en GitHub) detecta y bloquea un shard cuyo manifiesto tiene un hash no coincidente con el contenido real. Se ejecuta en un entorno de pruebas aislado para evaluar la efectividad del detector.
- **Desarrollo de reglas de detección**: los investigadores de seguridad pueden usar este fichero para ajustar las reglas de sus escáneres, asegurando que no generan falsos negativos ante este tipo de manipulación de shard.
- **Entrenamiento de modelos de clasificación de malware**: el artefacto puede servir como ejemplo etiquetado (clase "malicioso") para entrenar clasificadores que distingan entre pesos legítimos y artefactos manipulados.
- **Pruebas de integración en pipelines de admisión de modelos**: los equipos de MLOps pueden integrar este artefacto en sus pruebas de CI para verificar que el pipeline de carga de modelos rechaza archivos con integridad comprometida.
- **Investigación académica en seguridad de IA**: el artefacto es un ejemplo concreto de un vector de ataque en la cadena de suministro de modelos, útil para estudiar técnicas de manipulación de shard y sus mitigaciones.
- **Auditoría de herramientas de inspección**: los desarrolladores de herramientas de análisis estático pueden verificar que sus productos identifican correctamente este tipo de artefacto como no utilizable y peligroso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no es un modelo de IA y no tiene métricas de rendimiento en tareas de lenguaje, código o razonamiento.

## Requisitos de hardware

- No requiere hardware de inferencia: no es un modelo ejecutable.
- Almacenamiento mínimo: el repositorio ocupa 0.0 GB, por lo que cabe en cualquier sistema.
- No aplica para GPU ni CPU para inferencia.
- La ejecución del artefacto debe realizarse únicamente en un entorno aislado de pruebas de seguridad, no en un sistema de producción.
- No se recomienda cargarlo con vLLM, llama.cpp, Ollama ni TGI; estas herramientas esperan pesos reales y no son adecuadas para este artefacto.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA comparable con alternativas como Llama, Mistral o Qwen. Su categoría es la de artefacto de prueba de seguridad, y en ese ámbito se podría comparar con otros elementos del corpus LayerFault, pero no se dispone de información sobre repositorios similares en el contexto actual.

## Limitaciones y advertencias

- No es un modelo de IA: no puede generar texto, razonar ni ejecutar ninguna tarea de aprendizaje automático.
- Contiene características adversariales intencionales: códigos de opcodes sospechosos, contrafos de formato y cadenas de inyección de prompts. Cargarlo en un entorno no aislado puede suponer un riesgo de seguridad.
- La model card advierte explícitamente que debe tratarse como un fixture de prueba, no como pesos de producción.
- No se ha probado en ninguna tarea de lenguaje natural; no tiene utilidad práctica para desarrolladores ni investigadores que busquen un modelo funcional.
- Licencia Apache-2.0 permite uso comercial, pero el uso del artefacto fuera de un entorno de pruebas de seguridad no tiene sentido y puede ser peligroso.
- Riesgo de alucinación: no aplica, porque no hay generación de contenido.
- No soporta ningún idioma ni contexto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LayerFault/shard-hash-manifest-mismatch
- Proyecto LayerFault en GitHub: https://github.com/izm1chael/layerfault
- Repositorio shard (inferencia de LLM en GPU): https://github.com/leyten/shard
- Documento sobre AI Mismatches (arXiv): https://arxiv.org/pdf/2502.18682
