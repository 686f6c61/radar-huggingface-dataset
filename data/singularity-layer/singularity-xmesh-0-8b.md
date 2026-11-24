# singularity-layer/Singularity-xMESH-0.8B

## Resumen

Singularity xMESH 0.8B es un modelo de decisión compacto desarrollado por singularity-layer, obtenido mediante fine-tuning supervisado de Qwen/Qwen3.5-0.8B. No es un modelo conversacional generalista: está especializado en seleccionar servicios de un catálogo x402 y componer flujos multi-paso con restricciones duras, devolviendo una decisión estructurada (selección o abstención, confianza calibrada, requisito de aprobación, compatibilidad de red y nivel de coste) que después valida una política determinista. El checkpoint contiene 873.438.784 parámetros en BF16 y se distribuye de forma autónoma, sin necesidad de descargar el modelo base.

Su relevancia práctica está en el binomio tamaño/comportamiento: un modelo de menos de mil millones de parámetros que corre en CPU, Apple Silicon y GPUs de consumo, con un contrato de runtime validado de 2.048 tokens, pensado para integrarse en el nodo Singularity y en pipelines de pago por petición. El autor publica artefactos GGUF oficiales (Q8_0, Q6_K, Q5_K_M, Q4_K_M e IQ4_XS) y una evaluación de regresión congelada de 80 casos en la que el modelo alcanza un 80,0 % de coincidencia exacta de flujo completo.

La licencia es Apache-2.0, pero el entrenamiento incorpora filas de `MaziyarPanahi/AgentToolDecisions-180K` con términos mixtos CC BY 4.0, Apache-2.0 y MIT por fila, lo que exige revisar `THIRD_PARTY_NOTICES.md` antes de un uso comercial. El modelo solo declara soporte de inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen/Qwen3.5-0.8B) con cabeza de decisión conjunta calibrada y política xMESH determinista |
| Parametros totales | 873.438.784 (873M, BF16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (contrato de runtime validado) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS (GGUF oficiales) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 (con términos de terceros mixtos en el dataset de entrenamiento) |
| Formato de pesos | safetensors (transformers), GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer decoder-only, y añade una cabeza de decisión conjunta calibrada junto con una política xMESH determinista que valida las compuertas de etapa y la viabilidad del flujo antes de emitir cualquier petición de pago. La salida no es texto libre: es una decisión tipada con selección de candidato o abstención, confianza calibrada, requisito de aprobación, compatibilidad de red y nivel de coste. Las elecciones de servicio siguen siendo decisiones del modelo; la política solo actúa como validador determinista.

El entrenamiento combina dos fuentes. El calentamiento general de decisión usa filas con licencia de `MaziyarPanahi/AgentToolDecisions-180K`, que retiene términos CC BY 4.0, Apache-2.0 y MIT por fila. La especialización en enrutamiento proviene de filas x402 curadas por Singularity. Los casos y recursos de evaluación congelados se excluyeron explícitamente del entrenamiento, y el export standalone se fijó antes de la única evaluación sobre la suite congelada de 80 casos, sin cambios posteriores de pesos, prompts ni reglas de política. No se documentan en la información disponible detalles sobre volumen total de tokens, composición porcentual del dataset ni uso de RLHF o DPO.

## Capacidades

- Selección de servicios x402 a partir de una intención, restricciones duras y un conjunto reducido de candidatos recuperados de un catálogo vigente.
- Abstención explícita cuando ningún candidato satisface las restricciones, en lugar de forzar una elección.
- Emisión de confianza calibrada junto a cada decisión, apta para umbrales de aprobación automática.
- Composición de flujos multi-paso con compuertas de etapa y validación de viabilidad antes de cualquier petición de pago.
- Salida de metadatos operativos: requisito de aprobación, compatibilidad de red y nivel de coste.
- Decisiones tipadas genéricas evaluadas zero-shot sobre `LocalLLaMA/typed-decisions` (400 casos, 2.000 decisiones).
- Ejecución en CPU, Apple Silicon (MPS y Metal vía llama.cpp), Windows/Linux x64 y Vulkan sobre NVIDIA.
- No se documentan capacidades de visión, audio, tool calling genérico ni razonamiento multi-turno conversacional; la pipeline declarada en Hugging Face es image-text-to-text, pero la model card no describe uso multimodal.

## Casos de uso

- Enrutamiento de peticiones en un agregador de servicios x402: dado un intent y un conjunto de candidatos del catálogo, el modelo elige el servicio y devuelve nivel de coste y compatibilidad de red, lo que permite construir un router que decide antes de gastar.
- Control de gasto en pipelines de pago por petición: la confianza calibrada y el nivel de coste permiten fijar umbrales de aprobación automática y derivar a revisión humana las decisiones de baja confianza o coste alto.
- Pasarela de aprobación humana: el campo de requisito de aprobación de la salida se usa directamente como señal para bloquear o liberar una transacción en un sistema de autorización.
- Composición de flujos multi-paso con presupuesto: el modelo encadena varias llamadas de servicio respetando restricciones duras, y la política determinista rechaza combinaciones inviables antes de ejecutar, lo que evita gasto en flujos que fallarían a mitad.
- Despliegue en el borde o en equipos de desarrollo: con 873M parámetros en BF16 y un mínimo práctico de 8 GB de sistema, cabe en portátiles Apple Silicon de 16 GB y en CPUs x64, útil para probar lógica de enrutamiento sin infraestructura GPU.
- Integración en el nodo Singularity: el artefacto BF16 GGUF es el runtime universal que el nodo selecciona automáticamente según el acelerador disponible (GPU completa en Apple Silicon y NVIDIA con Vulkan, CPU en el resto).
- Evaluación de agentes con presupuesto acotado: sirve como componente de decisión en sistemas de agentes donde cada paso tiene coste monetario y se necesita una política auditable con cero violaciones posteriores a la política.

## Benchmarks y rendimiento

Evaluación de regresión x402 congelada, 80 casos:

| Evaluación (80 casos) | xMESH standalone | Jev | Laya |
|---|---:|---:|---:|
| Coincidencia exacta de flujo completo | 80,0 % | 11,25 % | 0,0 % |
| Precisión de compuerta de etapa | 96,25 % | 86,5 % | 78,5 % |
| Precisión de servicio activo | 97,5 % | 100,0 % | 85,63 % |
| Precisión de decisión global | 96,25 % | 37,5 % | 35,63 % |
| Arrepentimiento de coste ejecutado | 0,00175 USD | 0,00000 USD | 0,00358 USD |
| Violaciones posteriores a la política | 0 | — | — |

Evaluación de decisiones tipadas genéricas, zero-shot sobre `LocalLLaMA/typed-decisions` (400 casos, 2.000 decisiones):

| Modelo | Condición | Accuracy | Soft accuracy | Brier ↓ | ECE ↓ | MAE de score ↓ |
|---|---|---:|---:|---:|---:|---:|
| xMESH 0.8B | zero-shot Q8 | 0,478 | 0,415 | 0,409 | 0,293 | 0,642 |
| Laya | checkpoint base publicado | 0,362 | 0,331 | 0,315 | 0,174 | 0,694 |
| Laya typed-decisions | entrenado en el split de train de este benchmark | 0,766 | 0,471 | 0,061 | no disponible | no disponible |

Rendimiento medido: 6,45 s de mediana por flujo multi-campo completo en CPU sobre un Apple M4; 0,31 s de mediana por petición con Vulkan en una RTX A4000. En paridad Metal con BF16 sobre M4, 959 de 960 decisiones de la suite congelada coinciden con CPU (un empate cercano); Q8 pasa 960/960. En Windows y Linux x64 las canaries nativas pasaron 9/9 decisiones esperadas en ambas plataformas.

## Requisitos de hardware

- VRAM estimada: BF16 ocupa aproximadamente 1,75 GB de pesos (873M parámetros); Q8_0 son 841.069.440 bytes. El mínimo práctico de sistema es 8 GB y se recomiendan 16 GB para carga e inferencia locales cómodas.
- GPU recomendadas: RTX A4000 verificada con Vulkan; Apple M4 de 16 GB verificada con Metal y MPS. CUDA en PyTorch está soportado en runtime, pero la build CUDA de llama.cpp no está verificada. AMD e Intel no están verificados.
- Cabe en GPU de consumo: sí, por tamaño; la verificación publicada se limita a los aceleradores indicados.
- Opciones de despliegue: transformers (safetensors), llama.cpp (BF16, Q8_0 y demás GGUF; requiere b11719 o superior para el soporte nativo de `/v1/systemone`), Singularity Node v1.10.4 o superior con selección automática de ruta. No se documentan integraciones con vLLM, TGI ni Ollama.
- Latencia y throughput: 6,45 s de mediana por flujo completo en CPU sobre M4; 0,31 s de mediana por petición en RTX A4000 con Vulkan. No se publican cifras de throughput agregado.
- Nota de cuantización: llama.cpp b11719 se cuelga al inicializar la arquitectura Clef cuantizada en CPU, por lo que el nodo usa BF16 como contrato multiplataforma. Q4_K_M se descartó porque alteraba 16 decisiones y conservaba solo 65 de 80 flujos completos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización | Disponibilidad |
|---|---|---|---|---|---|
| Singularity xMESH 0.8B | 873M | 2.048 tokens | Apache-2.0 | Selección de servicios x402 y flujos multi-paso | Pesos abiertos en HF, GGUF oficiales |
| Jev | no disponible | no disponible | no disponible | Decisión x402 (API alojada) | Solo API alojada; latencia no comparable por hardware |
| Laya | no disponible | no disponible | no disponible | Decisión tipada genérica | Runtime local distinto; checkpoint base y variante entrenada publicados |

La comparación de rendimiento entre los tres solo es válida en precisión de decisión sobre la suite congelada, no en latencia, porque Jev es una API alojada y Laya usó un runtime local diferente. En la evaluación genérica de decisiones tipadas, Laya entrenada sobre el split de train del propio benchmark supera a xMESH en accuracy (0,766 frente a 0,478), pero esa condición no es zero-shot y por tanto no es directamente equiparable.

## Limitaciones y advertencias

- Modelo de dominio estrecho: está diseñado para selección de servicios x402 y decisiones tipadas; no debe emplearse como modelo conversacional general ni como generador de texto libre.
- Solo inglés declarado; no hay soporte multilingüe verificado.
- Contexto de 2.048 tokens: insuficiente para catálogos grandes o historiales largos, lo que obliga a recuperar un conjunto reducido de candidatos antes de invocar el modelo.
- Riesgo de alucinación en las decisiones: el modelo puede elegir un servicio inadecuado; la política determinista mitiga el problema validando compuertas y viabilidad, pero no corrige una selección semánticamente errónea.
- Confianza calibrada con ECE de 0,293 en la evaluación genérica zero-shot, un valor alto que limita el uso de umbrales automáticos agresivos fuera del dominio especializado.
- Licencia Apache-2.0 en los pesos, pero el dataset de calentamiento retiene términos CC BY 4.0, Apache-2.0 y MIT por fila; es obligatorio revisar `THIRD_PARTY_NOTICES.md` antes de uso comercial.
- La build CUDA de llama.cpp no está verificada; AMD e Intel no están verificados y el nodo cae a CPU en esas plataformas.
- La cuantización Q8_0 provoca un cuelgue conocido en llama.cpp b11719 al inicializar en CPU; Q4_K_M degrada materialmente la calidad de decisión (16 decisiones alteradas, 65 de 80 flujos completos).
- La evaluación principal se limita a 80 casos congelados y a una única ejecución; no hay datos publicados de robustez ante distribución desplazada del catálogo.
- La pipeline declarada en Hugging Face es image-text-to-text, pero la model card no describe ninguna capacidad multimodal; conviene no asumirla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/singularity-layer/Singularity-xMESH-0.8B
- GGUF oficiales: https://huggingface.co/singularity-layer/Singularity-xMESH-0.8B-GGUF
- Artículo de lanzamiento: https://www.x402layer.cc/blog/singularity-xmesh-0-8b
- Sitio de Singularity Layer: https://www.x402layer.cc
- Dataset de calentamiento: https://huggingface.co/datasets/MaziyarPanahi/AgentToolDecisions-180K
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
