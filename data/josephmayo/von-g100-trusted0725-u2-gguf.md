# josephmayo/von-g100-trusted0725-u2-gguf

## Resumen

El modelo `josephmayo/von-g100-trusted0725-u2-gguf` es un asistente de codificación y llamada a herramientas (tool calling) de 3 000 millones de parámetros, diseñado para ejecutarse de forma completamente offline en portátiles. Se trata de un ajuste fino (fine-tuning) del modelo base `WeiboAI/VibeThinker-3B` mediante un adaptador denominado "G100", publicado por el usuario `josephmayo` bajo licencia Apache 2.0. El modelo está cuantizado en formato GGUF (concretamente la variante Q4_K_M) y orientado a la librería `llama.cpp`.

La relevancia de este modelo reside en su objetivo: proporcionar capacidades de generación de código y uso de herramientas en entornos sin conexión, pensado para la competición ADTC 2026 en la categoría de portátiles. Según la model card, el modelo incluye mejoras sobre el adaptador G100 original en tareas de evaluación selectivas (HumanEval y MBPP), aunque el autor aclara que estos resultados no constituyen benchmarks completos. El repositorio contiene únicamente los pesos cuantizados en GGUF, con un tamaño total de 1,9 GB, lo que lo hace viable para equipos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de `WeiboAI/VibeThinker-3B`, arquitectura específica no documentada) |
| Parametros totales | 3 085 938 688 (~3,1B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (confirmado en la card del modelo; pueden existir otras variantes en el repo) |
| Idiomas soportados | No especificados (probablemente inglés por el enfoque en código, sin confirmación) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con `llama.cpp`) |

## Arquitectura y entrenamiento

La arquitectura concreta no se documenta en la información disponible. Dado que se basa en `WeiboAI/VibeThinker-3B`, se trata presumiblemente de un transformer denso de 3B parámetros, aunque no se especifica el tipo de atención ni la disposición de capas. El proceso de entrenamiento tampoco se describe: se sabe que se aplica un adaptador denominado "G100" sobre el modelo base, y que la versión "Update-2" (identificada por el sufijo `u2`) incorpora cambios respecto a la versión anterior, pero no se detallan los datos de entrenamiento, el número de tokens procesados ni si se emplearon técnicas como RLHF o DPO.

La card del modelo menciona una "prueba de selectores" (selector evidence) que compara el comportamiento del modelo actual con el adaptador G100 original en tareas de codificación y herramientas. Estos resultados sugieren una mejora en HumanEval (11/12 frente a 9/12) y MBPP (12/12 frente a 11/12), pero el autor insiste en que no son claims de benchmark completos y que la evaluación nativa de BCB64/LCB64 está pendiente.

## Capacidades

- Generación de texto y conversación en formato de chat.
- Generación de código (lenguajes no especificados, pero con evaluación en HumanEval y MBPP).
- Llamada a herramientas (tool calling), con una prueba de "product-tool probe" que valida 31/32 consultas válidas y 6/32 exactas.
- Razonamiento de múltiples pasos (se menciona "short-think" con 32/32 aciertos en la prueba).
- Ejecución offline en hardware de consumo, gracias a la cuantización GGUF.

## Casos de uso

- **Asistente de codificación en entornos aislados**: el modelo puede actuar como copiloto de programación sin conexión a internet, ideal para desarrolladores que trabajan en redes restringidas o con requisitos de seguridad que prohíben el uso de servicios en la nube.
- **Integración en entornos de desarrollo local**: gracias a su formato GGUF y compatibilidad con `llama.cpp`, puede integrarse en editores de código o herramientas CLI (por ejemplo, mediante `llama-server`) para autocompletar o explicar código sin enviar datos a terceros.
- **Automatización de tareas con tool calling**: el modelo está preparado para invocar herramientas externas (según la prueba "product-tool probe"), lo que permite construir agentes que ejecuten acciones como búsqueda de documentación, ejecución de comandos o gestión de archivos en el sistema local.
- **Evaluación y validación de código**: con resultados positivos en HumanEval y MBPP, puede emplearse para generar casos de prueba o validar soluciones de programación en un entorno de CI/CD sin depender de APIs externas.
- **Educación y aprendizaje de programación**: su tamaño reducido y la licencia Apache 2.0 permiten su uso en aplicaciones educativas, como tutores de código que funcionan en portátiles modestos.
- **Prototipado rápido de agentes conversacionales**: su capacidad de conversación y tool calling permite crear chatbots locales para soporte técnico o asistencia en tareas de desarrollo, sin costes de inferencia externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks completos en la información disponible. La card del modelo incluye una "selector evidence" que se presenta como indicativa, no como evaluación formal:

| Prueba | Modelo actual | G100 (anterior) |
|---|---|---|
| HumanEval | 11/12 | 9/12 |
| MBPP | 12/12 | 11/12 |
| Product-tool probe (válidas) | 31/32 | no disponible |
| Product-tool probe (exactas) | 6/32 | no disponible |
| Short-think | 32/32 | no disponible |

Estos datos provienen de una "fresh-reload matched selector" y no deben interpretarse como métricas estándar (por ejemplo, pass@1). La evaluación nativa de los conjuntos BCB64 y LCB64 está pendiente. No hay datos sobre latencia, throughput ni consumo de energía.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con cuantización Q4_K_M, el modelo ocupa aproximadamente 1,9 GB en disco. La memoria necesaria en tiempo de ejecución es de unos 2-3 GB de RAM/VRAM, dependiendo de la longitud de contexto y del backend.
- **GPU recomendadas**: funciona en tarjetas de consumo con 4 GB o más de VRAM, como la NVIDIA RTX 3060, RTX 4060 o GTX 1660 Super. También es viable en iGPU modernas con 8 GB de RAM compartida.
- **Soporte en hardware consumer**: sí, cabe en portátiles con 8 GB de RAM o más, utilizando `llama.cpp` con cuantización Q4_K_M.
- **Opciones de despliegue**: compatible con `llama.cpp`, `Ollama`, `llama-cpp-python` y `TGI` (aunque TGI requiere formato safetensors; el repo solo contiene GGUF). También puede ejecutarse con `vLLM` si se convierte a otro formato, aunque no es el flujo recomendado.
- **Latencia y throughput**: no se proporcionan datos oficiales. En CPU moderna, un modelo de 3B en Q4_K_M puede generar entre 10 y 30 tokens por segundo, pero esto depende del hardware específico.

## Comparativa con modelos similares

La siguiente tabla compara este modelo con otros de tamaño similar (3B) disponibles en el ecosistema GGUF. La comparación es estructural, ya que no se dispone de benchmarks oficiales para `von G100`:

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|-----------|------------|----------|----------|---------|----------|
| `von-g100-trusted0725-u2-gguf` | ~3,1B | no disponible | Apache 2.0 | GGUF | Código + tool calling |
| `Qwen2.5-3B` | 3,1B | 128K | Apache 2.0 | GGUF/safetensors | Generalista, multilingüe |
| `Llama-3.2-3B` | 3,2B | 128K | Llama 3.2 (comercial permitido) | GGUF/safetensors | Generalista, chat |
| `Phi-3-mini-3.8B` | 3,8B | 128K | MIT | GGUF/safetensors | Razonamiento, código |

Nota: `von-g100` no publica su longitud de contexto, mientras que las alternativas ofrecen ventanas de 128K. La comparación de rendimiento no es posible con los datos disponibles.

## Limitaciones y advertencias

- **Benchmarks no verificados**: los resultados de HumanEval y MBPP son "selector evidence" y no han sido validados de forma independiente ni con metodología estándar.
- **Falta de documentación técnica**: no se detallan la arquitectura exacta, los datos de entrenamiento ni el proceso de ajuste fino, lo que dificulta la evaluación de riesgos de sesgo.
- **Riesgo de alucinación**: como todo LLM de 3B, puede generar código incorrecto o inventar APIs/funciones, especialmente en tareas complejas o con contexto largo.
- **Contexto limitado**: no se especifica la longitud de contexto; al ser un modelo pequeño, es probable que la ventana sea corta (típicamente 4K-8K), lo que limita el manejo de proyectos grandes.
- **Idiomas**: solo se confirma el uso para código y conversación, sin garantía de soporte multilingüe. La card no menciona idiomas.
- **Seguridad y sesgos**: no se han publicado evaluaciones de sesgos ni de robustez frente a ataques de prompt injection. El modelo está pensado para uso local, pero no se garantiza su comportamiento en entornos hostiles.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero no se indica si el modelo base `VibeThinker-3B` tiene restricciones adicionales.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/josephmayo/von-g100-trusted0725-u2-gguf)
- [Modelo base: WeiboAI/VibeThinker-3B](https://huggingface.co/WeiboAI/VibeThinker-3B)
- [Perfil del autor en Hugging Face](https://huggingface.co/josephmayo)
- [GGUF-Models (colección de modelos GGUF)](https://huggingface.co/GGUF-Models)
- [Artículo sobre riesgos de GGUF envenenados (contexto de seguridad)](https://www.pillar.security/blog/llm-backdoors-at-the-inference-level-the-threat-of-poisoned-templates)
