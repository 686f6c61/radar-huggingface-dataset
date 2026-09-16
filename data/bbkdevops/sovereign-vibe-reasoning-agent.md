# bbkdevops/sovereign-vibe-reasoning-agent

## Resumen

El modelo `bbkdevops/sovereign-vibe-reasoning-agent` es un checkpoint de generación de texto publicado en HuggingFace por el usuario `bbkdevops`, orientado a generación de código, razonamiento simbólico y flujos de agente con uso de herramientas. Se distribuye bajo licencia Apache-2.0 y declara soporte para inglés y tailandés. El repositorio ocupa 0,9 GB y el único artefacto de pesos referenciado es un fichero PyTorch (`.pt`) que se carga mediante `torch.load`, no mediante `AutoModel`. El tokenizador indicado en el ejemplo de uso es el de `Qwen/Qwen2.5-Coder-0.5B-Instruct`, con un vocabulario de 151.665 tokens.

La model card describe una arquitectura poco convencional que combina una mezcla de expertos denominada "Continuous Fiber MoE" (32 expertos), atención lineal de tiempo O(N) ("AttnZero"), una proyección hiperbólica de Poincaré en capa ("HD-NGM System-2") y un motor LuaJIT embebido en el grafo tensorial. Ninguno de estos componentes está respaldado por un paper, un repositorio de código público ni una descripción reproducible; el fragmento de código de la model card está truncado antes de completar la carga del modelo. La fecha de creación declarada en HuggingFace es 2026-09-16, posterior a la fecha habitual de publicación, lo que refuerza la cautela sobre la trazabilidad del artefacto.

El interés práctico del modelo es limitado en su estado actual: acumula 0 descargas y 0 "likes", no hay resultados verificados y su rendimiento declarado en MMLU (33,01 % macro con 312 preguntas) está muy próximo al 25 % esperado por azar en un test de cuatro opciones. Resulta útil, por tanto, como caso de estudio sobre cómo evaluar críticamente un checkpoint sin validación externa más que como candidato real de despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | "Continuous Fiber MoE" (32 expertos) + TCN causal con atención lineal "AttnZero"; proyección hiperbólica Poincaré en capa; no verificable |
| Parámetros totales | No disponible (el repo ocupa 0,9 GB; el tokenizador de referencia pertenece a un modelo de ~0,5B, pero el número de parámetros del checkpoint no se declara) |
| Parámetros activos | No disponible (se declara MoE de 32 expertos, sin especificar cuántos se activan por token) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (solo se documenta un checkpoint `.pt` en FP16; no se publican versiones GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | Inglés (en) y tailandés (th) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (fichero `sovereign_grand_vibe_reasoning_rtx3090.pt`); no se publican safetensors |

## Arquitectura y entrenamiento

La model card afirma que el modelo integra cinco componentes: una mezcla de expertos de 32 módulos ("Continuous Fiber MoE") con núcleos de representación fusionados por SVD extraídos de modelos base Qwen2.5 y "Qwen3.8" (esta última denominación no corresponde a ninguna familia publicada por Alibaba, por lo que no puede verificarse); un bloque TCN causal con atención lineal de complejidad O(N) y memoria no cuadrática; una proyección hiperbólica de Poincaré con deducción geodésica sobre álgebra de Lie ("HD-NGM System-2"); una jerarquía de enrutamiento de fibras a escala macro/meso/micro ("Submarine Cable Knowledge Hierarchy"); y un motor LuaJIT embebido en el grafo tensorial para verificación simbólica determinista. No se aporta código, configuración de arquitectura ni dimensiones de capas que permitan reproducir o auditar ninguno de estos componentes.

En cuanto al entrenamiento, el autor declara ejecución sobre una única NVIDIA RTX 3090 (24 GB, Ampere) con PyTorch 2.6.0 y CUDA 12.4, optimizador AdamW, tasa de aprendizaje 1e-4, weight decay 0,01, acumulación de gradiente de 4 pasos y precisión mixta FP16. La progresión de pérdida reportada es 11,46 (inicial), 8,56 (época 1) y 6,41 (época 2, final), con un rendimiento aproximado de 19,4 muestras por segundo. El ajuste se realizó sobre siete datasets de código, razonamiento y agentes: `smshahbaj/verifiable-code-reasoning`, `facebook/natural_reasoning`, `attentionAllYouNeed/Vibe-Coding-Claude-Fable-5`, `CodeDevX/Vibe-Coding-Instruct`, `EpistemeAI/vibe-coder-part-debug`, `jtatman/combined_coder_python` y `AlignmentLab-AI/agentcode`. No se documenta ningún proceso de RLHF, DPO o preferencias, ni el volumen total de tokens de entrenamiento, ni la composición porcentual de cada dataset.

## Capacidades

- Generación de texto y de código: el modelo se presenta para síntesis de código multifichero, refactorización estructural y prototipado funcional ("vibe coding").
- Razonamiento paso a paso: entrenado sobre `facebook/natural_reasoning`, declara razonamiento deductivo encadenado y bucles planificar-ejecutar-verificar.
- Capacidades de agente: el dataset `AlignmentLab-AI/agentcode` sugiere entrenamiento en trayectorias multiturno e interacción con herramientas; la model card menciona "tool-augmented agent execution" y "CLI agent interactions".
- Verificación de código: se declara autodepuración, reparación de tests unitarios y verificación simbólica mediante un motor LuaJIT embebido (no verificable).
- Multilingüismo: inglés y tailandés, con alineamiento semántico cruzado declarado.
- Sin capacidades de visión, audio ni modo "thinking" explícito documentadas.
- El soporte real de *function calling* conforme a un esquema estándar (JSON schema, herramientas de OpenAI/vLLM) no está documentado ni verificado.

## Casos de uso

- Asistente de codificación en editor: el modelo puede generar fragmentos y refactorizaciones a partir de instrucciones en lenguaje natural, siempre que se integre mediante el script de carga en PyTorch descrito; requiere envolver el checkpoint en un `nn.Module` propio, ya que no expone una clase de Transformers estándar.
- Reparación de tests unitarios: dado un traceback y el código fuente, se le puede pedir que aísle el fallo y proponga un parche, aprovechando el ajuste sobre `EpistemeAI/vibe-coder-part-debug`.
- Generación de tests automáticos en un pipeline de CI: se podría invocar en un paso de pre-commit o GitHub Actions para producir borradores de pruebas, con revisión humana obligatoria dado el bajo rendimiento declarado en matemáticas (28 % en College Mathematics).
- Prototipado rápido de utilidades de línea de comandos: su orientación a "CLI agent interactions" lo hace apto para experimentos internos donde el coste de un error es bajo y no hay datos sensibles implicados.
- Experimentación académica sobre arquitecturas alternativas: sirve como artefacto de estudio para analizar mezclas de expertos con enrutamiento no convencional, siempre tratando las afirmaciones de la model card como hipótesis no contrastadas.
- Atención bilingüe inglés-tailandés: para aplicaciones de soporte o documentación técnica dirigidas a usuarios tailandeses, aunque no hay evaluación publicada que cuantifique la calidad en tailandés.
- Evaluación de riesgos de la cadena de suministro de modelos: útil como ejemplo para diseñar políticas internas sobre carga de checkpoints `.pt` no auditados.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index`, evaluados sobre subconjuntos de MMLU (`cais/mmlu`) con 312 preguntas y pasadas de *forward* de log-verosimilitud pura. Ninguno está verificado de forma independiente.

| Benchmark | Subconjunto | Métrica | Resultado | Verificado |
|---|---|---|---|---|
| MMLU | Computer Security | Accuracy | 38,00 % | No |
| MMLU | Machine Learning | Accuracy | 33,04 % | No |
| MMLU | College Mathematics | Accuracy | 28,00 % | No |
| MMLU | Macro (agregado) | Accuracy | 33,01 % | No |

No se han publicado otros resultados de benchmarks (HumanEval, GSM8K, MBPP, LiveCodeBench, MT-Bench, etc.) en la información disponible. Como referencia metodológica, el azar en MMLU con cuatro opciones se sitúa en el 25 %, de modo que un macro de 33,01 % implica una ventaja de aproximadamente 8 puntos sobre la línea base aleatoria, con una muestra de solo 312 preguntas.

## Requisitos de hardware

- VRAM estimada para inferencia: la model card indica un mínimo de 8 GB para inferencia y recomienda 24 GB para generación por lotes. El repositorio completo ocupa 0,9 GB, por lo que el peso del checkpoint en FP16 sería del orden de 0,45B de parámetros como cota superior si el fichero `.pt` contuviera únicamente pesos de modelo; este cálculo es una estimación propia y no un dato declarado.
- GPU recomendadas: NVIDIA RTX 3090 (24 GB, Ampere) es el objetivo declarado de entrenamiento e inferencia. No se documentan pruebas en A100, H100, L40S ni en GPUs AMD/ROCm.
- Compatibilidad con GPU de consumo: sí, el autor apunta a RTX 3090 y a un mínimo de 8 GB, por lo que cabría en RTX 3060 Ti/3070/4060 Ti de 8 GB o superiores, siempre que el código de carga personalizado funcione.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama, TGI, SGLang ni TensorRT-LLM. El único procedimiento publicado es `torch.load` del fichero `.pt` con un tokenizador de Qwen, dentro de un script propio que la model card deja truncado. No hay pesos GGUF ni safetensors, por lo que `llama.cpp` y Ollama no pueden cargarlo tal cual.
- Latencia y throughput: no disponibles para inferencia. El único dato declarado es un throughput de entrenamiento de ~19,4 muestras/segundo en una RTX 3090 con FP16 y Tensor Cores Ampere, que no es extrapolable a latencia de servicio.
- Requisito de software: se declara PyTorch 2.6.0 con CUDA 12.4 y uso de precisión mixta FP16.

## Comparativa con modelos similares

No hay datos de rendimiento verificables del modelo evaluado más allá del MMLU declarado, por lo que la comparación se limita a características estructurales. Los datos de los modelos alternativos proceden de sus fichas públicas y deben verificarse en la fuente original.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| sovereign-vibe-reasoning-agent | No disponible (~0,5B por el tokenizador de referencia, no confirmado) | No disponible | Apache-2.0 | 0 descargas, 0 likes, peso `.pt` sin safetensors | MMLU macro 33,01 % (no verificado) |
| Qwen2.5-Coder-0.5B-Instruct | 0,49B | 32.768 tokens | Apache-2.0 | Ampliamente distribuido; safetensors, GGUF y vLLM | Benchmarks publicados por el autor del modelo base; no comparables directamente con la muestra de 312 preguntas usada aquí |
| Qwen2.5-0.5B-Instruct | 0,49B | 32.768 tokens | Apache-2.0 | safetensors, GGUF, vLLM, Ollama | Benchmarks publicados por su autor |
| SmolLM2-360M-Instruct | 0,36B | 8.192 tokens | Apache-2.0 | safetensors, GGUF, vLLM, llama.cpp | Benchmarks publicados por su autor |

La diferencia operativa principal no es de rendimiento sino de infraestructura: los tres modelos comparables se pueden desplegar con `transformers`, vLLM o llama.cpp sin código a medida, mientras que `sovereign-vibe-reasoning-agent` exige un script propio y no publica pesos en formatos estándar.

## Limitaciones y advertencias

- Rendimiento cercano al azar: el macro de MMLU declarado (33,01 %) apenas supera el 25 % esperado por azar, y el subconjunto de matemáticas (28,00 %) está prácticamente en ese umbral. No es un modelo adecuado para tareas que requieran precisión factual o razonamiento cuantitativo.
- Ausencia total de verificación: 0 descargas, 0 likes, ningún benchmark verificado (`verified: false` en todos) y ninguna evaluación de terceros.
- Afirmaciones arquitectónicas no reproducibles: "Continuous Fiber MoE", "AttnZero", "HD-NGM System-2", "Submarine Cable Knowledge Hierarchy" y el motor LuaJIT embebido no cuentan con paper, código ni configuración publicados. La referencia a "Qwen3.8" no corresponde a ningún modelo publicado de esa familia.
- Riesgo de seguridad al cargar el checkpoint: el formato `.pt` cargado con `torch.load` es un serializado de Python que puede ejecutar código arbitrario al deserializarse. Se recomienda encarecidamente no cargarlo fuera de un entorno aislado y sin red, y preferir safetensors cuando exista la opción.
- Código de ejemplo incompleto: el bloque de la model card se corta durante la carga del checkpoint, por lo que no se puede reproducir la inferencia ni verificar la interfaz de entrada esperada.
- Idiomas limitados: solo inglés y tailandés. No hay evaluación publicada de la calidad en tailandés, y el castellano no está entre los idiomas soportados.
- Longitud de contexto desconocida: sin dato de ventana de contexto no es posible planificar conversaciones multiturno largas ni tareas de análisis de repositorios completos.
- Riesgo de alucinación elevado en código y matemáticas: dado el rendimiento declarado, cualquier salida debe pasar por ejecución en sandbox y tests automáticos antes de llegar a producción.
- Licencia permisiva con matices: Apache-2.0 permite uso comercial y modificación, pero no cubre los derechos sobre los datasets de terceros usados en el ajuste; algunos de ellos (por ejemplo, los derivados de datos generados por modelos comerciales) podrían tener restricciones adicionales no declaradas.
- Metadatos inconsistentes: la fecha de creación registrada (2026-09-16) es posterior a la actualización (2026-09-16 15:22, apenas 37 minutos después), lo que sugiere una publicación apresurada y sin revisión posterior.
- Sin garantía de mantenimiento: no hay repositorio de código, issues abiertas ni historial de versiones del checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bbkdevops/sovereign-vibe-reasoning-agent
- Autor: https://huggingface.co/bbkdevops
- Dataset `smshahbaj/verifiable-code-reasoning`: https://huggingface.co/datasets/smshahbaj/verifiable-code-reasoning
- Dataset `facebook/natural_reasoning`: https://huggingface.co/datasets/facebook/natural_reasoning
- Dataset `attentionAllYouNeed/Vibe-Coding-Claude-Fable-5`: https://huggingface.co/datasets/attentionAllYouNeed/Vibe-Coding-Claude-Fable-5
- Dataset `CodeDevX/Vibe-Coding-Instruct`: https://huggingface.co/datasets/CodeDevX/Vibe-Coding-Instruct
- Dataset `EpistemeAI/vibe-coder-part-debug`: https://huggingface.co/datasets/EpistemeAI/vibe-coder-part-debug
- Dataset `jtatman/combined_coder_python`: https://huggingface.co/datasets/jtatman/combined_coder_python
- Dataset `AlignmentLab-AI/agentcode`: https://huggingface.co/datasets/AlignmentLab-AI/agentcode
- Tokenizador de referencia: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
- Benchmark MMLU: https://huggingface.co/datasets/cais/mmlu
- Paper, blog técnico o repositorio de código: no disponible (la búsqueda web no devolvió resultados relevantes sobre este modelo)
