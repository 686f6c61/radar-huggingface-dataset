# BRR1154/SLM-BrowserAgent-v1

## Resumen

SLM-BrowserAgent-v1 es un modelo de lenguaje de pequeno tamano (SLM) desarrollado por Bhavanam Rajendra Reddy bajo la organizacion Runtime-Slayers, especializado en control autonomo de navegadores: inspeccion dinamica del DOM, generacion de scripts de Playwright y extraccion de datos en entornos headless. Se construye como un fine-tuning del modelo base Qwen/Qwen2.5-0.5B-Instruct, por lo que hereda la arquitectura transformer decoder-only de Qwen2.5 con aproximadamente 494 millones de parametros totales (492 millones declarados en la model card).

El modelo se presenta como parte del denominado "Runtime-Slayers Autonomous SLM Swarm Engine", un sistema donde este SLM actua en coordinacion con orquestadores de mayor tamano (NVIDIA Nemotron-3-Ultra 550B, DeepSeek V4.1, GLM-5.3, MiniMax M3.1 y Kimi K3.1 Pro). La propuesta tecnica mas destacada en la model card es un protocolo de edicion de pesos denominado "Gram-Schmidt Subspace Null-Space Model Editing", que el autor describe como un metodo de ajuste con olvido cero (ΔW · V_base = 0).

Es relevante por su enfoque en automatizacion web con un presupuesto de computo minimo: un modelo de 0,5B parametros puede desplegarse en CPU o GPU de consumo y, en teoria, especializarse en tareas de agente de navegador sin requerir infraestructura de gran escala. No obstante, la informacion publica disponible es muy limitada: no hay benchmarks, no se detalla el dataset de entrenamiento y el repositorio registra cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), derivado de Qwen/Qwen2.5-0.5B-Instruct |
| Parametros totales | 494.032.768 (492 M declarados en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-0.5B-Instruct, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el ejemplo de inferencia usa float32) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en Qwen2.5-0.5B-Instruct. La model card no detalla la configuracion interna (numero de capas, dimension oculta, cabezas de atencion ni vocabulario), aunque al derivarse de Qwen2.5-0.5B-Instruct se espera que conserve su estructura. El unico detalle tecnico de entrenamiento declarado es el "Weight Surgery Protocol" basado en "Gram-Schmidt Subspace Null-Space Model Editing", descrito como una edicion de pesos con restriccion de olvido cero (ΔW · V_base = 0). No se especifica el volumen de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o SFT adicionales sobre el modelo base.

Tampoco se documentan innovaciones como decodificacion especulativa, atencion lineal o modos de razonamiento extendido. La model card menciona integracion con orquestadores de gran escala y un framework de optimizacion recursiva ("Google Research Harness²"), pero no se aportan detalles verificables sobre como se usa el modelo dentro de ese sistema ni sobre el proceso de destilacion o coordinacion.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen2.5-0.5B-Instruct.
- Control de navegador: la model card lo describe como un controlador autonomo de navegador para inspeccion dinamica del DOM.
- Generacion de scripts de Playwright para automatizacion de tareas web.
- Extraccion de datos en entornos headless (scraping).
- Navegacion autonoma del DOM y ejecucion de tareas web multi-paso (segun la descripcion del autor).
- Soporte de tool calling / function calling: no disponible (no confirmado en la informacion proporcionada).
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Automatizacion de scraping estructurado: el modelo puede generar y ajustar scripts de Playwright para extraer datos de paginas con estructura variable, aprovechando su especializacion en inspeccion del DOM.
- Rellenado de formularios y navegacion multi-paso: adecuado para flujos donde un agente debe interpretar el DOM y decidir la siguiente accion (clic, escritura, envio), con la ventaja de su bajo coste de inferencia.
- Testing end-to-end de aplicaciones web: generacion de scripts de Playwright para pruebas de regresion en pipelines de CI/CD, donde un modelo de 0,5B puede ejecutarse en runners modestos.
- Monitorizacion de precios y contenidos: extraccion periodica de datos de paginas de e-commerce o portales, con el modelo actuando como generador de selectores y logica de extraccion.
- Agente auxiliar en un sistema multi-agente: el modelo puede actuar como sub-agente especializado en tareas de navegador dentro de un orquestador mayor (como los mencionados en la model card), reduciendo el coste frente a usar un modelo grande para cada paso.
- Prototipado rapido de agentes web en local: al caber en CPU o GPU de consumo, permite experimentar con flujos de automatizacion sin infraestructura dedicada.
- Extraccion de datos para pipelines de investigacion: generacion de codigo de scraping reproducible para recoleccion de datasets web, con la ventaja de la licencia Apache 2.0 para uso comercial y academico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 2 GB para los pesos (494 M parametros × 4 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en float16/bfloat16: aproximadamente 1 GB para los pesos, mas overhead.
- Cabe en GPU de consumo: si, en cualquier GPU con al menos 2-4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060). Tambien puede ejecutarse en CPU.
- GPU recomendadas para produccion: no se especifican; por tamano, cualquier GPU moderna es suficiente (A100, H100, RTX 4090 no son necesarias).
- Opciones de despliegue: transformers (unico metodo documentado en la model card); el tag `text-generation-inference` sugiere compatibilidad con TGI, y el tag `endpoints_compatible` sugiere compatibilidad con Inference Endpoints de Hugging Face. No se documenta soporte explicito de vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SLM-BrowserAgent-v1 | 494 M | no disponible | Agente de navegador / Playwright | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-0.5B-Instruct | ~494 M | no disponible en esta ficha | Generacion de texto general | Apache 2.0 | Hugging Face (ampliamente usado) |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,5 B | no disponible en esta ficha | Generacion de texto general | Apache 2.0 | Hugging Face (ampliamente usado) |

La comparativa se limita al modelo base y a una variante mayor de la misma familia, ya que no se dispone de datos de rendimiento del modelo evaluado ni de otros SLM especializados en agentes de navegador en la informacion proporcionada. No es posible comparar rendimiento (benchmarks) por ausencia de datos publicados.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay datos que permitan verificar la calidad del fine-tuning ni compararlo con alternativas.
- Model card escasa: no se documentan dataset de entrenamiento, hiperparametros, proceso de evaluacion ni limitaciones conocidas.
- Riesgo de alucinacion: como todo modelo de 0,5B, la generacion de codigo de Playwright o selectores DOM puede ser incorrecta o inventada, especialmente en paginas complejas.
- Contexto limitado: al derivarse de Qwen2.5-0.5B-Instruct, la ventana de contexto es reducida en comparacion con modelos mayores, lo que limita el manejo de DOM extensos.
- Solo ingles: no se declaran capacidades multilingues, lo que restringe su uso en entornos en castellano u otros idiomas.
- Repositorio sin traccion: cero descargas y cero likes, sin evidencia de uso o validacion por la comunidad.
- Afirmaciones no verificadas: la model card menciona integracion con orquestadores de gran escala y un framework de optimizacion ("Google Research Harness²") sin enlaces ni evidencia publica.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Fecha de creacion futura en los metadatos (2026-11-09): conviene verificar la autenticidad y vigencia del repositorio antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BRR1154/SLM-BrowserAgent-v1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Organizacion del autor: https://github.com/Runtime-Slayers
- ORCID del autor: https://orcid.org/0009-0005-3349-1162
