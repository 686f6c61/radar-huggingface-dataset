# pragmaticcs/Qwen3.8-KAT-AgentWorld-35B-A3B-Coder-GGUF

## Resumen

Qwen3.8-KAT-AgentWorld-35B-A3B-Coder-GGUF es una fusión de modelos (merge) publicada por el usuario pragmaticcs en Hugging Face, distribuida exclusivamente en formato GGUF para inferencia local. El modelo combina tres checkpoints base: Kwaipilot/KAT-Coder-V2.5-Dev (especializado en código), Qwen/Qwen-AgentWorld-35B-A3B (orientado a tareas agénticas) y empero-ai/Qwen3.8-35B-A3B-Distill (destilación de la familia Qwen 3.8). El resultado es un modelo de arquitectura MoE con aproximadamente 34.660 millones de parámetros totales y unos 3.000 millones activos por token, según la nomenclatura A3B del identificador.

La relevancia de esta ficha radica en su orientación explícita hacia cargas de trabajo de código y agentes (tags `agentic`, `swe-bench`, `code`, `reasoning`), así como en el uso de técnicas de fusión como TIES y DARE, y de capas de atención lineal tipo DeltaNet, que buscan reducir el coste computacional en contextos largos. El modelo está pensado para desarrolladores que quieran desplegar localmente un modelo de gran tamaño con cuantización GGUF sin depender de infraestructura en la nube.

No obstante, conviene señalar desde el principio que la información pública disponible es escasa: no se detallan la longitud de contexto, los datos de entrenamiento, los benchmarks ni las recetas exactas de fusión. Esta ficha refleja únicamente lo que puede inferirse de los metadatos del repositorio y de los modelos base declarados, marcando explícitamente como "no disponible" todo aquello que no está confirmado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención lineal DeltaNet (según tags del repositorio) |
| Parámetros totales | 34.660.610.688 (~34,7 B) |
| Parámetros activos | ~3 B (nomenclatura A3B; cifra exacta no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (variantes concretas no especificadas en la información disponible) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio solo GGUF; transformers como librería declarada) |

## Arquitectura y entrenamiento

El modelo es una fusión de tres checkpoints, no un entrenamiento desde cero. Los tags del repositorio indican el uso de las técnicas TIES (Trim, Elect, Sign) y DARE (Drop And REscale) para combinar los pesos de los modelos base, así como la presencia de capas de atención lineal DeltaNet junto a atención estándar. La arquitectura subyacente es un transformer con mezcla de expertos (MoE) de la familia Qwen, con aproximadamente 34,7 mil millones de parámetros totales y alrededor de 3 mil millones activos por token, lo que sitúa su coste de inferencia en el rango de un modelo denso de 3 B pese a su tamaño total.

Los modelos base declarados son Kwaipilot/KAT-Coder-V2.5-Dev, Qwen/Qwen-AgentWorld-35B-A3B y empero-ai/Qwen3.8-35B-A3B-Distill. El primero aporta capacidad de código, el segundo capacidades agénticas y el tercero conocimiento destilado de la familia Qwen 3.8. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO en los modelos base. Tampoco se documenta la receta exacta de la fusión (ratio de mezcla por capa, hiperparámetros de TIES/DARE).

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Generación y razonamiento sobre código, heredado del componente KAT-Coder.
- Razonamiento multi-paso y flujos agénticos, según la orientación del componente AgentWorld.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades multilingües limitadas a inglés y chino según los metadatos.
- Modo de razonamiento explícito (thinking): no disponible.
- Visión o audio: no disponible.
- Capacidad de ejecución en entornos de agentes (SWE-bench como tag de referencia): orientativa, sin métricas publicadas.

## Casos de uso

- Asistencia de código en local: el modelo puede integrarse en editores o IDE mediante servidores compatibles con GGUF (llama.cpp, Ollama) para autocompletado y generación de funciones, aprovechando su especialización en código y su bajo coste de inferencia por token activo.
- Automatización de tareas de ingeniería de software: dado su enfoque agéntico y la referencia a SWE-bench, puede emplearse en pipelines que resuelvan issues, generen parches o propongan refactorizaciones, siempre con revisión humana.
- Despliegue en hardware de consumo: al ser MoE con ~3 B activos, es viable en estaciones de trabajo con GPU de gama alta consumer, lo que permite prototipar agentes de código sin coste de API.
- Generación de documentación técnica bilingüe (inglés/chino): útil para equipos con documentación en ambos idiomas, aunque no cubre castellano.
- Chat de soporte técnico especializado: conversaciones multi-turno sobre APIs, errores de compilación o configuración de entornos, con la cautela de que la longitud de contexto no está documentada.
- Experimentación en investigación sobre fusiones de modelos: sirve como caso de estudio de TIES/DARE y de mezcla de especializaciones (código + agentes + destilación) para quienes investigan técnicas de model merging.
- Prototipado de agentes autónomos: combinado con frameworks de agentes, puede orquestar llamadas a herramientas en tareas de desarrollo, aunque la ausencia de benchmarks publicados obliga a validación propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión, ya que no se detallan las variantes GGUF. Como referencia orientativa, un modelo de ~34,7 B en cuantización Q4 requiere del orden de 18-22 GB de VRAM; en Q8, del orden de 35-38 GB. Estas cifras son estimaciones basadas en el tamaño de parámetros, no datos confirmados del repositorio.
- GPU recomendadas: no disponible en la documentación. Por tamaño, una RTX 4090 (24 GB) podría alojar cuantizaciones de 4 bits; para 8 bits se necesitarían A100 40 GB, A6000 48 GB o H100.
- Cabe en GPU consumer: probablemente en RTX 4090/3090 con cuantización de 4 bits; no confirmado.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; vLLM y TGI no están confirmados para este repositorio concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-KAT-AgentWorld-35B-A3B-Coder | ~34,7 B (MoE, ~3 B activos) | no disponible | Apache 2.0 | GGUF | Fusión código + agentes; acceso restringido |
| Qwen/Qwen-AgentWorld-35B-A3B (base) | ~35 B (MoE) | no disponible | no disponible | safetensors | Modelo base agéntico |
| Kwaipilot/KAT-Coder-V2.5-Dev (base) | no disponible | no disponible | no disponible | no disponible | Modelo base especializado en código |
| empero-ai/Qwen3.8-35B-A3B-Distill (base) | ~35 B (MoE) | no disponible | no disponible | no disponible | Destilación de Qwen 3.8 |

La comparativa con alternativas de la misma categoría (por ejemplo, otros modelos de código MoE de ~30 B) no puede completarse con datos verificables en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de descargar.
- Idiomas limitados a inglés y chino; no hay soporte declarado de castellano.
- Longitud de contexto no documentada, lo que impide planificar cargas con ventanas largas.
- Ausencia total de benchmarks publicados: el rendimiento real en código y tareas agénticas debe validarse de forma independiente.
- Es una fusión de terceros, no un modelo oficial de Qwen ni de Kwaipilot; la calidad puede degradarse respecto a los modelos base en dominios no cubiertos por la mezcla.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en código y APIs poco comunes.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los modelos base, que no se detallan en la información disponible.
- Solo se distribuye en GGUF; no hay pesos safetensors en este repositorio, lo que limita el ajuste fino directo.
- Las técnicas TIES/DARE pueden introducir artefactos en capas específicas; se recomienda evaluar antes de producción.

## Enlaces

- Hugging Face: https://huggingface.co/pragmaticcs/Qwen3.8-KAT-AgentWorld-35B-A3B-Coder-GGUF
- Modelo base KAT-Coder: https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev
- Modelo base AgentWorld: https://huggingface.co/Qwen/Qwen-AgentWorld-35B-A3B
- Modelo base Qwen3.8 Distill: https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill
- Paper TIES (arXiv:2311.03099): https://arxiv.org/abs/2311.03099
- Paper DARE (arXiv:2412.06464): https://arxiv.org/abs/2412.06464
