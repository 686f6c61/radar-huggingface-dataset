# OliviaRossi/UltiMerge

## Resumen

UltiMerge es un modelo de lenguaje de mezcla de expertos (MoE) con 34,66 mil millones de parámetros totales y 3,1 mil millones activos, desarrollado por OliviaRossi. Se basa en la arquitectura híbrida Qwen 3.6, que combina 30 capas de recurrencia lineal Gated DeltaNet con 10 capas de atención GQA, junto con 256 expertos enrutados (top-8 activos) y un experto compartido permanente. El modelo no es un fine-tune, sino un merge geométrico de cuatro checkpoints independientes, cada uno especializado en un dominio distinto: simulación de entornos y uso de herramientas, ingeniería de software a nivel de repositorio, razonamiento profundo y autocorrección adversarial.

La relevancia de UltiMerge radica en su enfoque de fusión: mediante un pipeline de cinco etapas denominado GS-MoE (Geometric Spectral Mixture of Experts), se aislan los vectores de tarea de cada donante, se filtran los ruidos con técnicas como DARE y STAR, y se extrapola la combinación a lo largo del manifold de pesos compartido. El resultado es un modelo que, con el coste de inferencia de un modelo de 3,1B, integra las capacidades de cuatro especialistas de 35B. Además, se eliminaron las cabezas de predicción multi-token y los pesos de visión multimodal, reduciendo la sobrecarga de VRAM en aproximadamente 4,2 GB y garantizando compatibilidad inmediata con vLLM, SGLang y llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 30 capas Gated DeltaNet (recurrencia lineal) + 10 capas GQA attention, MoE con 256 expertos enrutados (top-8) + 1 experto compartido |
| Parametros totales | 34.660.610.688 |
| Parametros activos | 3.100.000.000 (3,1B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | No especificados (compatible con GGUF y vLLM) |
| Idiomas soportados | en, zh, code |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

UltiMerge se construye sobre la arquitectura Qwen 3.6, que integra una mezcla de capas de recurrencia lineal Gated DeltaNet y capas de atención GQA. El modelo emplea 256 expertos enrutados con top-8 activos y un experto compartido siempre activo, lo que permite mantener un coste de inferencia bajo (3,1B activos) mientras se aprovecha la capacidad total de 34,66B.

El proceso de creación no implicó entrenamiento adicional, sino un merge geométrico de cuatro checkpoints: Qwen-AgentWorld-35B-A3B (ancla, simulación de mundos y agentes), KAT-Coder-V2.5-Dev (ingeniería de software a nivel de repositorio), Qwopus3.6-35B-A3B-Coder (razonamiento profundo) y Ornith-1.5-35B-A3B (autocorrección y auditoría lógica). El pipeline GS-MoE consta de cinco etapas: centrado de estado invariante (SLERP esférico en capas SSM), normalización de puertas Frobenius, enmascaramiento Bernoulli DARE con p=0,20, truncamiento SVD en subespacios STAR y una etapa final de extrapolación espectral. Además, se decouplaron y eliminaron las cabezas de predicción multi-token y los pesos de visión, reduciendo el peso total y mejorando la compatibilidad con motores de inferencia estándar.

## Capacidades

- Generación de texto causal puro, sin componentes multimodales.
- Razonamiento profundo y descomposición recursiva de problemas complejos.
- Generación de código en múltiples lenguajes, con soporte para refactorización AST-aware y localización de bugs en repositorios.
- Uso de herramientas (tool calling) y ejecución en sandbox, según se indica en el checkpoint ancla.
- Planificación estructurada y persistencia de estado de entorno para tareas de agente.
- Autocorrección y auditoría lógica adversarial, derivada del donante Ornith-1.5.
- Soporte multilingüe para inglés, chino y código.

## Casos de uso

- Desarrollo de software asistido: el modelo puede generar parches multi-archivo, crear diffs de git y refactorizar código existente, gracias a su entrenamiento en tareas de ingeniería de repositorio del donante KAT-Coder.
- Agentes autónomos con uso de herramientas: su capacidad para mantener estado de entorno y ejecutar acciones en sandbox lo hace adecuado para agentes que interactúan con APIs, shells o navegadores.
- Resolución de problemas de razonamiento matemático y lógico: el donante Qwopus aporta habilidades de descomposición recursiva, útil en dominios como verificación formal o planificación.
- Asistente de programación en entornos de desarrollo integrado: puede integrarse en pipelines de CI/CD para revisión de código, detección de bugs y sugerencias de corrección.
- Sistemas de autocorrección de texto: su capacidad de auditoría adversarial permite detectar inconsistencias lógicas en documentos técnicos o legales.
- Traducción y generación de código entre inglés, chino y pseudocódigo: el soporte trilingüe facilita la comunicación entre equipos multinacionales y la documentación técnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 69,3 GB en formato safetensors, lo que implica aproximadamente 69 GB de VRAM para carga completa en FP16.
- Al ser un MoE con 3,1B parámetros activos, la memoria necesaria durante la inferencia es significativamente menor que la de un modelo denso equivalente, aunque no se proporcionan cifras exactas.
- Compatible con motores de inferencia vLLM, SGLang y llama.cpp (formato GGUF), lo que permite desplegarlo en GPUs consumer con cuantización adecuada.
- No se especifican GPUs recomendadas ni latencia/throughput estimados.

## Comparativa con modelos similares

No disponible. No se dispone de información suficiente sobre modelos comparables de la misma categoría (MoE 35B-A3B) para establecer una comparación objetiva.

## Limitaciones y advertencias

- Al ser un merge de cuatro checkpoints, puede presentar comportamientos inconsistentes en tareas que requieran una especialización única de uno de los donantes.
- Solo soporta inglés, chino y código; no se garantiza un rendimiento adecuado en otros idiomas.
- No se han publicado evaluaciones de seguridad, sesgos ni alucinaciones, por lo que su uso en producción requiere validación previa.
- El modelo es puramente textual; no procesa imágenes ni audio.
- La licencia apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en escenarios de alto riesgo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/OliviaRossi/UltiMerge)
- [Qwen/Qwen-AgentWorld-35B-A3B](https://huggingface.co/Qwen/Qwen-AgentWorld-35B-A3B)
- [Kwaipilot/KAT-Coder-V2.5-Dev](https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev)
- [Jackrong/Qwopus3.6-35B-A3B-Coder](https://huggingface.co/Jackrong/Qwopus3.6-35B-A3B-Coder)
- [ornith-ai/Ornith-1.5-35B-A3B](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B)
