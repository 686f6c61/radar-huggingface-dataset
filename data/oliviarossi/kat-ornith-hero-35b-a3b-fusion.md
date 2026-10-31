# OliviaRossi/KAT-Ornith-HERO-35B-A3B-Fusion

## Resumen

KAT-Ornith-HERO-35B-A3B-Fusion es un modelo de lenguaje abierto creado por el usuario OliviaRossi mediante la fusión (merge) de tres ajustes finos de 35B parámetros con arquitectura Mixture-of-Experts: Kwaipilot/KAT-Coder-V2.5-Dev (especializado en código y tareas agénticas tipo SWE-bench), ornith-ai/Ornith-1.5-35B-A3B (razonamiento en cadena de pensamiento extenso) y XLearning-SCU/HERO-35B-A3B (eficiencia de tokens mediante RL jerárquico). El modelo se publica bajo licencia Apache 2.0 en formato safetensors.

La fusión se ha realizado con un método que el autor denomina RG-CACF (Riemannian Geodesic & Curvature-Adaptive Coherence Fusion), que combina pesos en proporciones 0.4, 0.35 y 0.25 respectivamente, aplicando normas log-Euclidianas en el cono de métricas definidas positivas, afilado del router MoE y gating sigmoide de coherencia. El objetivo declarado es combinar las capacidades de código agéntico, razonamiento profundo y ejecución concisa sin interferencia destructiva entre tareas.

Se trata de un modelo de nicho y muy reciente (publicado en octubre de 2026, con 158 descargas y 2 likes en el momento de la ficha), relevante para desarrolladores que buscan un modelo MoE de ~36B parámetros con ~3B activos orientado a código, agentes y razonamiento, y que quepa en hardware de gama alta con cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (arquitectura base qwen3_5_moe) |
| Parametros totales | 35.951.822.704 (~35,95B) |
| Parametros activos | ~3B (indicado por el sufijo A3B; cifra exacta no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se han publicado cuantizaciones oficiales) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repo: 71,9 GB) |

## Arquitectura y entrenamiento

El modelo es una fusión de pesos (merge) de tres modelos de 35B-A3B basados en la arquitectura qwen3_5_moe (Mixture-of-Experts de la familia Qwen3.5). No es un modelo entrenado desde cero: hereda el entrenamiento preentrenamiento y postentrenamiento de sus tres modelos base. Los datos de entrenamiento originales (numero de tokens, composicion del dataset, RLHF/DPO) no estan disponibles en la informacion proporcionada.

La innovacion destacable es el metodo de fusion RG-CACF declarado por el autor, que incluye:

- **Normas log-Euclidianas en variedad Riemanniana**: los pesos se escalan a lo largo del cono Riemanniano de metricas definidas positivas.
- **Afilado del router MoE**: calibracion de la entropia de los logits del router para evitar dispersion uniforme entre expertos tras la fusion.
- **Gating sigmoide continuo de coherencia**: busca eliminar la interferencia destructiva entre tareas sin discontinuidades de enmascaramiento duro.
- **Conservacion de energia de Frobenius**: las matrices de pesos se preservan bajo proyeccion de norma geodesica.

Los pesos de fusion son: KAT-Coder-V2.5-Dev al 0,4, Ornith-1.5-35B-A3B al 0,35 y HERO-35B-A3B al 0,25.

## Capacidades

- Generacion de codigo: heredada principalmente de KAT-Coder-V2.5-Dev, especialista en tareas agénticas de ingenieria de software (tipo SWE-bench).
- Razonamiento en cadena de pensamiento (chain-of-thought) de formato largo, heredado de Ornith-1.5-35B-A3B.
- Ejecucion concisa y eficiencia de tokens, heredada de HERO-35B-A3B (RL jerarquico).
- Orientacion a flujos agénticos y razonamiento multi-paso (tags del repo: agent, reasoning).
- Capacidades de tool calling: no confirmadas explicitamente en la documentacion disponible, aunque los modelos base estan orientados a agentes.
- Capacidades multilingues: no disponibles.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- **Agentes de resolucion de incidencias de software**: gracias a la herencia de KAT-Coder-V2.5-Dev (especialista en SWE-bench agéntico), el modelo puede integrarse en pipelines de agentes que navegan repositorios, editan ficheros y ejecutan pruebas para cerrar bugs.
- **Asistente de codigo en el IDE**: puede usarse como backend de completado y refactorizacion en editores compatibles con modelos locales (por ejemplo mediante llama.cpp u Ollama), aprovechando los ~3B de parametros activos para respuestas rapidas.
- **Razonamiento tecnico profundo**: la componente Ornith aporta cadenas de pensamiento extensas, util para analisis de arquitectura, revisiones de diseno y depuracion compleja donde se requiere explicacion paso a paso.
- **Respuestas tecnicas concisas**: la componente HERO aporta eficiencia de tokens, adecuada para chatbots donde se prioriza respuestas breves y directas sin sacrificar correccion.
- **Automatizacion de tareas de CI/CD**: puede emplearse en agentes que generan o corrigen tests, redactan mensajes de commit y proponen parches como paso previo a revision humana.
- **Evaluacion y experimentacion de merges MoE**: como artefacto de investigacion, permite comparar el metodo RG-CACF frente a merges lineales clasicos en benchmarks de codigo y razonamiento.
- **Despliegue on-premise con licencia permisiva**: bajo Apache 2.0, puede integrarse en productos comerciales sin restricciones de licencia, por ejemplo en asistentes internos de empresas que no pueden enviar codigo a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los modelos base declaran fortalezas en SWE-bench (KAT-Coder-V2.5-Dev) y eficiencia de tokens (HERO-35B-A3B), pero no se incluyen metricas concretas ni en la model card ni en la ficha de HuggingFace, por lo que no pueden citarse numeros.

## Requisitos de hardware

- **VRAM estimada para inferencia en precision completa (BF16)**: el repo ocupa 71,9 GB en safetensors, por lo que se necesitan aproximadamente 72 GB de VRAM o memoria unificada para cargarlo sin cuantizar.
- **Con cuantizacion de 4 bits**: aproximadamente 20-22 GB, lo que lo hace viable en una RTX 4090 (24 GB) o RTX 5090, aunque estas cuantizaciones no estan publicadas oficialmente y habria que generarlas con herramientas como llama.cpp.
- **GPU recomendadas**: A100 80 GB, H100 80 GB o H200 para precision completa; RTX 4090/5090 o 2x RTX 3090/4090 para versiones cuantizadas.
- **Consumer GPU**: cabe en una RTX 4090 de 24 GB solo con cuantizacion a 4 bits; en precision nativa no cabe en ninguna GPU de consumo actual.
- **Opciones de despliegue**: al tratarse de una arquitectura qwen3_5_moe reciente, la compatibilidad debe verificarse; en principio vLLM y SGLang (si soportan la arquitectura), llama.cpp/Ollama para GGUF cuantizado y TGI. No hay soporte confirmado en la documentacion disponible.
- **Latencia y throughput**: no disponibles; al ser un MoE con ~3B de parametros activos, la latencia por token deberia ser comparable a la de un modelo denso de ~3B, sujeto a la capacidad de la memoria para alojar los ~36B totales.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Licencia | Enfoque |
|---|---|---|---|---|
| KAT-Ornith-HERO-35B-A3B-Fusion | ~35,95B | ~3B | Apache 2.0 | Fusion de codigo, razonamiento y eficiencia |
| Kwaipilot/KAT-Coder-V2.5-Dev | ~35B (A3B) | ~3B | no disponible | Codigo agéntico (SWE-bench) |
| ornith-ai/Ornith-1.5-35B-A3B | ~35B (A3B) | ~3B | no disponible | Razonamiento largo y self-improvement |
| XLearning-SCU/HERO-35B-A3B | ~35B (A3B) | ~3B | no disponible | RL jerarquico, eficiencia de tokens |

La ventaja teorica de la fusion frente a sus componentes es combinar las tres especialidades en un unico modelo; la desventaja es que el rendimiento de un merge no esta garantizado y no hay benchmarks publicados que demuestren que supera a los modelos base individuales en sus tareas especializadas.

## Limitaciones y advertencias

- **Sin benchmarks publicados**: no hay evidencia cuantitativa del rendimiento del merge; el metodo RG-CACF es una afirmacion del autor sin validacion externa conocida.
- **Riesgo de alucinacion**: al ser una fusion de modelos, el comportamiento puede ser impredecible en dominios no cubiertos por los tres modelos base; se recomienda validacion humana en tareas criticas.
- **Proyecto de nicho y muy reciente**: con 158 descargas y 2 likes, tiene poca comunidad de deteccion de errores; no hay versiones cuantizadas oficiales ni guias de despliegue.
- **Compatibilidad de software no garantizada**: la arquitectura qwen3_5_moe puede no estar soportada aun en todas las versiones de vLLM, llama.cpp o TGI.
- **Longitud de contexto e idiomas no documentados**: no se puede confirmar la ventana de contexto ni el rendimiento en castellano; habria que verificarlo empiricamente.
- **Licencia**: Apache 2.0 permite uso comercial sin restricciones relevantes, pero los modelos base podrian tener condiciones propias que conviene revisar en casos de redistribucion.
- **Merge no verificado**: la calidad de un merge depende criticamente de la compatibilidad de los tres modelos base; el afilado del router MoE puede degradar la seleccion de expertos en tareas fuera de codigo y razonamiento.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/OliviaRossi/KAT-Ornith-HERO-35B-A3B-Fusion
- Modelo base 1: https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev
- Modelo base 2: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Modelo base 3: https://huggingface.co/XLearning-SCU/HERO-35B-A3B

No se han encontrado enlaces adicionales (papers, blogs o demos) en la informacion disponible.
