# Rom3rk/Qwen3.8-27B-ComfyUI-GGUF

## Resumen

Qwen3.8-27B-ComfyUI-GGUF es la versión cuantizada en formato GGUF del modelo Qwen3.8-27B-ComfyUI, un fine-tune del modelo Qwen3.8-27B de Qwen Team especializado en la generación, edición, reparación, auditoría y explicación de workflows JSON de la interfaz de ComfyUI. El modelo ha sido desarrollado por Rom3rk y se distribuye bajo licencia Apache 2.0.

El modelo base, Qwen3.8-27B, es un modelo de visión y lenguaje (image-text-to-text) con una ventana de contexto de 262.144 tokens, arquitectura transformer con predicción multi-token (MTP) y capacidades de razonamiento. El fine-tune se ha realizado mediante aprendizaje supervisado (SFT) con Unsloth, y la cuantización GGUF emplea los layouts Dynamic 3.0 de Unsloth con matriz de importancia (imatrix) mediante llama.cpp.

La relevancia de este modelo radica en que permite a los usuarios de ComfyUI generar y mantener workflows complejos mediante lenguaje natural, sin necesidad de construir los grafos de nodos manualmente. El estado de desarrollo indica que el refinamiento mediante aprendizaje por refuerzo (RL) está actualmente en curso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con encoder de visión (Qwen3.8-27B) y predicción multi-token (MTP) |
| Parametros totales | 27B según la denominación del modelo; el metadato de safetensors del repositorio indica 3.391.984, dato inconsistente con la denominación 27B |
| Parametros activos | No disponible |
| Longitud de contexto | 262.144 tokens (modelo base); los ejemplos de uso recomiendan 32.768 |
| Tipos de cuantizacion | GGUF con imatrix; se menciona explícitamente la variante Q4_K_XL (UD-Q4_K_XL) |
| Idiomas soportados | No disponible (el modelo base Qwen3.8 es multilingüe, pero no se especifica para este fine-tune) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer de visión y lenguaje con 27.000 millones de parámetros, ventana de contexto de 262.144 tokens y predicción multi-token (MTP), desarrollado por Qwen Team. Sobre esta base, Rom3rk ha realizado un fine-tune mediante aprendizaje supervisado (SFT) con Unsloth, especializando el modelo en el JSON de workflows de la interfaz de ComfyUI (formato UI/frontend, no el formato de API).

La cuantización a GGUF se ha realizado con llama.cpp utilizando los layouts Dynamic 3.0 de Unsloth y matriz de importancia (imatrix). El repositorio no es un lanzamiento oficial de Unsloth. El estado de desarrollo indica que el refinamiento mediante aprendizaje por refuerzo (RL) está en curso.

Nota: el metadato de safetensors del repositorio indica 3.391.984 parámetros, un valor inconsistente con la denominación "27B" del modelo y con el tamaño esperado de un GGUF de 27B (16-19 GB). El tamaño del repositorio es de 1,9 GB, lo que sugiere que el repositorio puede estar incompleto o que los metadatos son erróneos.

## Capacidades

- Generación de workflows ComfyUI en formato UI a partir de peticiones en lenguaje natural, devolviendo el JSON completo cargable en la interfaz.
- Edición de workflows existentes preservando los componentes solicitados, posiciones de nodos, ajustes de sampler y enlaces no relacionados.
- Reparación de workflows inválidos, incompletos o desconectados, corrigiendo enlaces y entradas requeridas sin alterar los nodos válidos.
- Auditoría de la estructura de workflows: endpoints inválidos, nodos desconectados, entradas incompatibles, componentes redundantes y conflictos de configuración.
- Explicación conversacional del comportamiento de los workflows y de las interacciones entre nodos.
- Respuesta en formato JSON crudo o como asistente conversacional de ComfyUI.
- El modelo base es de visión y lenguaje (image-text-to-text), aunque el fine-tune se centra en la generación de JSON de workflows.

## Casos de uso

- Generación de pipelines de imagen a imagen con SDXL: el modelo puede crear un workflow completo con rama de ControlNet depth, sampler de dos etapas y nodo de guardado de imagen a partir de una descripción en lenguaje natural, devolviendo el JSON cargable directamente en ComfyUI.
- Edición de workflows existentes: permite añadir una segunda rama de ControlNet a un workflow ya cargado, preservando el modelo, los ajustes de sampler, las posiciones de los nodos y los enlaces no relacionados.
- Reparación de workflows dañados: corrige enlaces inválidos y entradas requeridas ausentes en workflows rotos, manteniendo intactos los nodos y ajustes válidos, lo que resulta útil al importar workflows de terceros incompatibles.
- Auditoría de workflows antes de ejecución: detecta endpoints inválidos, nodos desconectados, entradas incompatibles, componentes redundantes y ajustes conflictivos, evitando errores de ejecución en producción.
- Asistente conversacional de ComfyUI: responde preguntas sobre el comportamiento de los nodos y las interacciones del grafo, actuando como documentación interactiva para usuarios menos experimentados.
- Integración en pipelines de automatización: al ser compatible con llama.cpp, Ollama y LM Studio, puede integrarse en scripts o servicios que generen o validen workflows de forma programática, por ejemplo en entornos CI/CD de generación de imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de 27B en cuantización Q4_K_XL se estiman entre 16 y 19 GB de VRAM según las fuentes del modelo base (unsloth/Qwen3.8-27B-GGUF reporta Q4_K_M de 16,8 GB). El repositorio de este fine-tune reporta un tamaño de 1,9 GB, inconsistente con un GGUF de 27B.
- GPU recomendadas: tarjetas con 24 GB de VRAM o más, como RTX 4090, A100 o H100. Con cuantizaciones más agresivas podría caber en GPUs de 16 GB, aunque no se especifican en el repositorio.
- Despliegue: compatible con llama.cpp (llama-server), Ollama (mediante Modelfile) y LM Studio (importación con `lms import`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Rom3rk/Qwen3.8-27B-ComfyUI-GGUF | 27B | 262k (base) | Workflows ComfyUI UI | Apache 2.0 | GGUF |
| Qwen/Qwen3.8-27B | 27B | 262k | Modelo general de visión y lenguaje | Apache 2.0 | safetensors |
| unsloth/Qwen3.8-27B-GGUF | 27B | 262k | Modelo general cuantizado | Apache 2.0 | GGUF |

No se han identificado otros modelos especializados en generación de workflows de ComfyUI con los que comparar directamente.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en el JSON de workflows de la interfaz de ComfyUI (formato UI/frontend), no en el formato de API, por lo que no es adecuado para generar workflows en ese otro formato.
- El refinamiento mediante aprendizaje por refuerzo está en curso, por lo que el comportamiento puede ser inestable o mejorable en versiones futuras.
- Riesgo de alucinación en la generación de JSON: el modelo puede producir nodos, enlaces o parámetros inexistentes o incompatibles, por lo que se recomienda auditar los workflows generados antes de ejecutarlos.
- Los metadatos del repositorio presentan inconsistencias: el número de parámetros reportado (3.391.984) y el tamaño del repositorio (1,9 GB) no se corresponden con un modelo de 27B cuantizado, lo que sugiere que el repositorio puede estar incompleto o que los metadatos son erróneos.
- No se especifican los idiomas soportados por el fine-tune, aunque el modelo base Qwen3.8 es multilingüe.
- La licencia Apache 2.0 permite uso comercial, pero el modelo es un derivado de Qwen3.8-27B, por lo que deben respetarse los términos de atribución de la licencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Rom3rk/Qwen3.8-27B-ComfyUI-GGUF
- Modelo base (fine-tune): https://huggingface.co/Rom3rk/Qwen3.8-27B-ComfyUI
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Documentación de Dynamic 3.0 GGUFs: https://unsloth.ai/docs/basics/dynamic-3.0-ggufs
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Blog de Qwen3.8: https://qwen.ai/blog?id=qwen3.8
- Repositorio GitHub de Qwen3.8: https://github.com/QwenLM/Qwen3.8
