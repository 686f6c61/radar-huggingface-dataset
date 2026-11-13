# pragmaticcs/Qwen3.8-KAT-AgentWorld-35B-A3B-Coder

## Resumen

Qwen3.8-KAT-AgentWorld-35B-A3B-Coder es un modelo de lenguaje de tipo mezcla de expertos (MoE) resultado de la fusión de tres modelos mediante las técnicas TIES y DARE. Lo publica el usuario pragmaticcs en Hugging Face y combina Kwaipilot/KAT-Coder-V2.5-Dev (especializado en código y tareas de ingeniería de software), Qwen/Qwen-AgentWorld-35B-A3B (orientado a razonamiento agéntico y uso de herramientas) y empero-ai/Qwen3.8-35B-A3B-Distill (destilación de la familia Qwen 3.8). El objetivo es reunir en un único checkpoint capacidades de generación de código, razonamiento multi-paso y comportamiento agéntico.

El modelo cuenta con 34.660.610.688 parámetros totales (unos 34,7 mil millones) en una arquitectura MoE con aproximadamente 3 mil millones de parámetros activos por token, de ahí la denominación A3B. Incorpora mecanismos de atención lineal (DeltaNet) junto con atención estándar, según indican las etiquetas del repositorio. El contexto máximo no está especificado en la información disponible.

Es relevante porque propone una vía de bajo coste computacional (3B activos) para cargas de trabajo de código y agentes, aunque se trata de un merge experimental con muy poca tracción (8 descargas, 3 likes) y acceso restringido. No debe confundirse con un modelo oficial de Qwen ni de Kwaipilot: es una fusión de terceros que hereda las limitaciones de sus componentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención lineal (DeltaNet) y atención estándar; tipo `qwen3_5_moe` |
| Parametros totales | 34.660.610.688 (≈34,7 B) |
| Parametros activos | ≈3 B (designación A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es una fusión (merge) de tres checkpoints, no un entrenamiento desde cero. Se aplican las técnicas TIES (arxiv:2311.03099) y DARE (arxiv:2412.06464) para combinar los pesos, resolviendo interferencias entre parámetros y reduciendo el ruido de las deltas antes de integrarlas. La arquitectura subyacente es la de la familia Qwen 3.5 MoE, con capas de atención lineal basadas en DeltaNet combinadas con atención completa, lo que reduce el coste de cómputo en secuencias largas.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en los modelos de origen. Al tratarse de un merge, las capacidades proceden de los tres modelos base: KAT-Coder-V2.5-Dev aporta el sesgo hacia código y tareas de tipo SWE-bench; Qwen-AgentWorld-35B-A3B aporta el comportamiento agéntico y de uso de herramientas; y Qwen3.8-35B-A3B-Distill aporta la destilación de razonamiento de la familia Qwen 3.8. No se documentan innovaciones adicionales propias del autor del merge.

## Capacidades

- Generación de texto y conversación multi-turno en inglés y chino.
- Generación y edición de código, con orientación a tareas de ingeniería de software (etiqueta `swe-bench`).
- Razonamiento multi-paso y modo de razonamiento (etiquetas `reasoning`, `agentic`).
- Soporte previsto de tool calling y function calling, heredado del componente AgentWorld.
- Comportamiento agéntico para flujos con múltiples llamadas a herramientas.
- Capacidades matemáticas y de razonamiento lógico, no documentadas de forma explícita.
- Sin soporte de visión ni audio según las etiquetas del repositorio.
- Capacidades multilingües limitadas a inglés y chino.

## Casos de uso

- Reparación automática de issues en repositorios: el componente KAT-Coder-V2.5-Dev está orientado a tareas tipo SWE-bench, por lo que el modelo puede recibir un issue y un fragmento de código y proponer un parche, integrándose en un pipeline de revisión humana.
- Asistente de código en IDE: con solo 3B parámetros activos, la inferencia es comparativamente barata y permite autocompletado y explicación de código en local o en servidores modestos.
- Agentes de automatización de tareas de desarrollo: la combinación con AgentWorld permite encadenar pasos (leer ficheros, ejecutar tests, corregir errores) mediante tool calling.
- Generación de tests unitarios: el sesgo hacia código facilita producir casos de prueba a partir de funciones existentes, con validación posterior en CI.
- Razonamiento sobre documentación técnica en inglés y chino: útil para equipos que trabajan con documentación en ambos idiomas, aunque no cubre otros idiomas.
- Prototipado de asistentes conversacionales técnicos: el formato causal-LM y conversacional permite desplegarlo como chatbot especializado en soporte a desarrolladores.
- Experimentación en investigación sobre fusiones de modelos: sirve como caso de estudio de TIES/DARE aplicado a modelos MoE de código y agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: en torno a 69 GB para los pesos completos (el repositorio ocupa 69,3 GB), por lo que requiere al menos una GPU de 80 GB (A100 80GB, H100 80GB) o varias GPUs.
- Cuantización a 8 bits: aproximadamente 35 GB, viable en una A100 40GB o en dos RTX 4090 de 24 GB.
- Cuantización a 4 bits: aproximadamente 18-20 GB, cabe en una RTX 4090 o RTX 3090 de 24 GB, con margen para el contexto.
- Al ser MoE con 3B activos, el throughput por token es notablemente superior al de un modelo denso de 35B, aunque la memoria residente sigue siendo la del total de parámetros.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI si el soporte de `qwen3_5_moe` está disponible en la versión correspondiente; llama.cpp y Ollama solo si se generan cuantizaciones GGUF, que no se documentan.
- Latencia y throughput concretos: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-KAT-AgentWorld-35B-A3B-Coder | ≈34,7 B | ≈3 B | no disponible | Apache 2.0 | Gated en HF, 8 descargas |
| Kwaipilot/KAT-Coder-V2.5-Dev | no disponible en la información | no disponible | no disponible | no disponible | HF |
| Qwen/Qwen-AgentWorld-35B-A3B | ≈35 B | ≈3 B (A3B) | no disponible | no disponible | HF |
| empero-ai/Qwen3.8-35B-A3B-Distill | ≈35 B | ≈3 B (A3B) | no disponible | no disponible | HF |

Los tres modelos base comparten la misma familia arquitectónica MoE con ≈3B activos, por lo que la comparación relevante es de especialización: KAT-Coder se centra en código, AgentWorld en comportamiento agéntico y el distill en razonamiento destilado. El merge intenta sumar las tres capacidades, pero no hay datos públicos que permitan verificar que no haya degradación respecto a los originales.

## Limitaciones y advertencias

- Modelo experimental de terceros: no es un lanzamiento oficial de Qwen ni de Kwaipilot; la calidad del merge no está validada con benchmarks publicados.
- Tracción mínima: 8 descargas y 3 likes en el momento de la consulta, sin comunidad ni soporte.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede complicar despliegues automatizados.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está garantizado.
- Longitud de contexto no documentada, lo que impide planificar cargas con ventanas largas.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado por la fusión de pesos sin validación posterior.
- Sesgos heredados de los datasets de los tres modelos base, no auditados en esta ficha.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los modelos base, en particular las de acceso restringido.
- No hay cuantizaciones oficiales publicadas; generar GGUF o AWQ queda a cargo del usuario y puede degradar el rendimiento.
- El soporte en herramientas de inferencia depende de que `qwen3_5_moe` esté implementado en la versión de transformers, vLLM o TGI utilizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pragmaticcs/Qwen3.8-KAT-AgentWorld-35B-A3B-Coder
- Modelo base KAT-Coder-V2.5-Dev: https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev
- Modelo base Qwen-AgentWorld-35B-A3B: https://huggingface.co/Qwen/Qwen-AgentWorld-35B-A3B
- Modelo base Qwen3.8-35B-A3B-Distill: https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill
- Paper TIES (arxiv:2311.03099): https://arxiv.org/abs/2311.03099
- Paper DARE (arxiv:2412.06464): https://arxiv.org/abs/2412.06464
