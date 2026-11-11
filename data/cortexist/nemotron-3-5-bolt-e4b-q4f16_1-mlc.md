# cortexist/Nemotron-3.5-Bolt-E4B-q4f16_1-MLC

## Resumen

Nemotron-3.5-Bolt-E4B-q4f16_1-MLC es una conversión del modelo NVIDIA Nemotron-3.5-Bolt-E4B (checkpoint BF16 original) al formato MLC-LLM, publicada por el usuario cortexist. No se trata de un modelo entrenado desde cero, sino de una cuantización y empaquetado del checkpoint upstream para su ejecución con el runtime MLC-LLM, con especial atención a dispositivos Jetson AGX Xavier (arquitectura Volta, sm_72) sobre JetPack 5 y CUDA 11.4.

El paquete incluye pesos convertidos en cuantización q4f16_1, una configuración de 16.384 tokens de contexto, tokenizer y metadatos de conversión (tensor-cache.json, manifest.json con checksums SHA-256). El repositorio ocupa 4,5 GB e incorpora librerías precompiladas para Linux aarch64 sobre Jetson AGX Xavier, lo que lo convierte en un artefacto de despliegue específico más que en un modelo de propósito general.

Su relevancia es acotada pero concreta: permite ejecutar un modelo de la familia Nemotron de NVIDIA en hardware de borde (edge) con GPU Volta, un escenario donde las opciones de inferencia optimizada son escasas. La contrapartida es una dependencia estricta de un fork de MLC-LLM mantenido por el autor, sin garantías de portabilidad a otras GPU, sistemas operativos o ABI de runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base NVIDIA Nemotron-3.5-Bolt-E4B; detalles arquitectónicos no incluidos en la información proporcionada) |
| Parametros totales | no disponible (la nomenclatura E4B sugiere un modelo con aproximadamente 4.000 millones de parámetros activos, pero no se confirma en la información) |
| Parametros activos | no disponible |
| Longitud de contexto | 16.384 tokens (configuración del paquete MLC) |
| Tipos de cuantizacion | q4f16_1 (pesos en 4 bits con activaciones en float16); el repositorio relacionado ofrece también q0f16 |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (openmdw-1.1) |
| Formato de pesos | MLC-LLM (shards convertidos con tensor-cache.json y mlc-chat-config.json); no safetensors ni GGUF |
| Tamano del repositorio | 4,5 GB |
| Libreria | mlc-llm |
| Runtime requerido | fork cortexist/mlc-llm |
| Plataforma de las librerias precompiladas | Linux aarch64, Jetson AGX Xavier (Volta sm_72), JetPack 5 / CUDA 11.4 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base (tipo de transformer, uso de mezcla de expertos, composición del dataset o fases de alineación como RLHF o DPO). Lo que sí se documenta es el proceso de conversión: se parte del checkpoint BF16 de NVIDIA (nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16, revisión de model card 49843eed8db1f1c616c47af75cfd36e07aec0667) y se generan shards de parámetros en cuantización q4f16_1, acompañados de metadatos de conversión y checksums SHA-256 en manifest.json.

El paquete admite dos configuraciones de ejecución: la predeterminada con MLCEngine nativo y exportaciones DFlash, y una variante para Gemma MTP mediante configs/mtp-16k.json y la librería MTP, compartiendo ambas los mismos shards de parámetros. Las librerías precompiladas incluyen el runtime TVM/MLC de un fork concreto (baseline de código fd3a5891b8a78f7d50829d0919cbb27e40c26e28) y no son portables a otras GPU, sistemas operativos o ABI sin recompilación. La generación de texto y el uso de herramientas están validados por el fork; la inferencia multimodal no está cualificada en esta release.

## Capacidades

- Generación de texto conversacional (pipeline text-generation).
- Soporte de tool calling / uso de herramientas, según indica el autor ("Text generation and tools are exercised by the fork").
- Ejecución en hardware de borde Jetson AGX Xavier con GPU Volta sm_72.
- Configuración de contexto de 16.384 tokens.
- Dos modos de decodificación/configuración: MLCEngine nativo con DFlash y variante MTP (Gemma MTP) para decodificación especulativa.
- Capacidades multimodales: no cualificadas en esta release.
- Idiomas soportados: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Inferencia en dispositivos de borde con Jetson AGX Xavier: el paquete incluye librerías precompiladas para Volta sm_72 y JetPack 5, lo que permite desplegar generación de texto en un kit embebido sin recompilar el runtime.
- Asistentes conversacionales locales en robótica o vehículos: con 16.384 tokens de contexto se pueden mantener diálogos multi-turno con historial extenso en un dispositivo con consumo energético contenido.
- Automatización con tool calling en entornos embebidos: el fork valida el uso de herramientas, lo que habilita agentes ligeros que invocan APIs o controladores locales.
- Prototipado de pipelines de decodificación especulativa: la variante MTP permite experimentar con decodificación asistida sobre los mismos shards de parámetros, útil para investigar latencia en hardware limitado.
- Evaluación comparativa de cuantizaciones: al existir una variante DFlash q0f16 en el mismo ecosistema, se puede medir el impacto de q4f16_1 frente a q0f16 en calidad y velocidad sobre el mismo hardware.
- Despliegue de referencia para validación de modelos NVIDIA Nemotron en edge: sirve como banco de pruebas reproducible (checksums en manifest.json) para equipos que evalúan la familia Nemotron antes de invertir en infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que las condiciones de benchmark y las limitaciones conocidas deben consultarse en el fork, y que la capacidad de contexto completa es un límite de configuración, no una garantía de calidad en contextos largos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 4,5 GB y la cuantización q4f16_1 reduce los pesos respecto al BF16 original, por lo que la huella en memoria es del orden de pocos GB, pero no se confirma una cifra oficial.
- GPU soportadas por las librerías incluidas: exclusivamente Jetson AGX Xavier (Volta, sm_72) con JetPack 5 / CUDA 11.4 sobre Linux aarch64.
- Cualquier otra GPU (A100, H100, RTX 4090, etc.) requiere recompilación del runtime con el fork cortexist/mlc-llm; no hay binarios cualificados para ellas.
- Cabe en GPU consumer: no disponible para GPUs de escritorio sin recompilación; el soporte validado es para el SoC Jetson AGX Xavier.
- Opciones de despliegue: MLCEngine del fork cortexist/mlc-llm; MLC-LLM upstream no está cualificado para estos paquetes. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Plataforma validada |
|---|---|---|---|---|---|
| Nemotron-3.5-Bolt-E4B-q4f16_1-MLC (este) | no disponible (E4B) | 16.384 | MLC-LLM q4f16_1 | OpenMDW 1.1 | Jetson AGX Xavier sm_72 |
| Nemotron-3.5-Bolt-E4B-DFlash-q0f16-MLC (mismo autor) | no disponible (E4B) | no disponible | MLC-LLM q0f16 | OpenMDW 1.1 (presumible, no confirmado) | no disponible |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 (upstream) | no disponible (E4B) | no disponible | BF16 (safetensors presumible, no confirmado) | OpenMDW 1.1 | no disponible |
| gemma-4-E4B-it-assistant-q0f16-MLC (mismo autor) | no disponible (E4B) | no disponible | MLC-LLM q0f16 | no disponible | no disponible |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo nuevo: es una conversión de un checkpoint existente; cualquier limitación del modelo base NVIDIA se hereda.
- Dependencia estricta del fork cortexist/mlc-llm; MLC-LLM upstream no está cualificado y las librerías incluidas no son portables a otras GPU, sistemas operativos o ABI.
- Las librerías precompiladas solo cubren Linux aarch64, Jetson AGX Xavier (sm_72), JetPack 5 y CUDA 11.4; otros dispositivos exigen recompilación.
- La ventana de 16.384 tokens es un límite de configuración, no una garantía de calidad o estabilidad en contextos largos.
- La inferencia multimodal no está cualificada en esta release.
- Los pesos por sí solos no proporcionan un servidor HTTP; se requiere el stack de despliegue del fork.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; deben evaluarse sobre el modelo base.
- Licencia OpenMDW 1.1: es necesario revisar sus términos concretos para uso comercial; el autor remite a la licencia y los ficheros de aviso incluidos, que preservan los términos del modelo original.
- Advertencia de procedencia: la revisión de la model card upstream identifica la tarjeta recuperada, no una revisión de descarga original verificada de forma independiente.
- Modelo con muy baja adopción (11 descargas, 0 likes en el momento de la consulta), lo que implica escasa validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cortexist/Nemotron-3.5-Bolt-E4B-q4f16_1-MLC
- Modelo base upstream: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Fork de MLC-LLM requerido: https://github.com/cortexist/mlc-llm
- README del fork: https://github.com/cortexist/mlc-llm#readme
- Guía de despliegue en Xavier: https://github.com/cortexist/mlc-llm/blob/main/deploy/xavier/README.md
- Variante relacionada DFlash q0f16: https://huggingface.co/cortexist/Nemotron-3.5-Bolt-E4B-DFlash-q0f16-MLC
- Modelo asistente relacionado: https://huggingface.co/cortexist/gemma-4-E4B-it-assistant-q0f16-MLC
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
