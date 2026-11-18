# Alissonerdx/BFS-Best-Face-Swap

## Resumen

BFS (Best Face Swap) es una colección de adaptadores LoRA para modelos de difusión orientados a la edición de imagen, desarrollada por el usuario Alissonerdx y publicada bajo licencia MIT. Su función es el reemplazo selectivo de cara, cabeza y cuerpo (face swap, head swap, body swap) sobre imágenes de entrada, apoyándose en modelos base de gran tamaño como Qwen Image 2.1, Qwen Image Edit 2509/2511, FLUX.2 Klein (4B y 9B), Krea 2 y, de forma experimental, LTX-2. No se trata de un modelo generativo autónomo, sino de pesos LoRA que se cargan sobre el modelo base correspondiente y se ejecutan mediante flujos de trabajo de ComfyUI o la librería diffusers.

El repositorio agrupa múltiples versiones de pesos (head V1, V1.1, body swap V1.0, body swap selectivo con marca magenta, face V1, head V2-V5 para Qwen Edit, variantes para FLUX.2 Klein y Krea 2) y cada familia tiene su propio contrato de orden de entrada, prompt y workflow. El tamaño total del repositorio es de 14,2 GB, lo que refleja la acumulación de todas las variantes y sus versiones en fp16/fp32.

Su relevancia actual radica en que cubre varios de los modelos de edición de imagen más recientes (Qwen Image 2.1, FLUX.2 Klein, Krea 2) con un único conjunto de LoRAs y flujos listos para ComfyUI, lo que facilita incorporar sustitución de identidad en pipelines de edición sin entrenar adaptadores propios. La model card insiste en el uso responsable y prohíbe explícitamente generar resultados con figuras públicas o personas sin consentimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptadores de bajo rango) sobre modelos de difusión de edición de imagen (Qwen Image 2.1, Qwen Image Edit 2509/2511, FLUX.2 Klein 4B/9B, Krea 2, LTX-2 experimental) |
| Parametros totales | no disponible (depende del modelo base; los LoRA son adaptadores de bajo rango con rank variable, p. ej. rank 16, 32, 64, 128 en algunas variantes) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible de forma explícita; se distribuyen pesos en fp16 y fp32 (p. ej. `bfs_head_v5_2511_merged_version_rank_16_fp16.safetensors`, `rank_32_fp32`), y existen bases FLUX.2 Klein en fp8 |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (LoRA); workflows en JSON para ComfyUI |

## Arquitectura y entrenamiento

BFS no es un transformer generativo completo, sino un conjunto de adaptadores LoRA que se inyectan en los bloques de atención de modelos de difusión basados en transformer (DiT) para edición de imagen. Cada release está entrenado sobre un modelo base concreto (Qwen Image 2.1, Qwen Image Edit 2509/2511, FLUX.2 Klein 4B/9B, Krea 2) y requiere cargarse sobre ese mismo base para funcionar correctamente. Las variantes incluyen distintos rangos (rank 16, 32, 64, 128) y precisiones (fp16, fp32), y en el caso de Qwen Edit 2511 se ofrecen versiones "original" y "merged" con distinto rank y precisión.

La model card no detalla el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de alineación como RLHF o DPO; esa información no está disponible. La innovación principal es la especialización por tarea (cara, cabeza, cuerpo, cuerpo selectivo con marca magenta) y la cobertura multi-modelo con contratos de entrada documentados por versión. La variante de body swap selectivo permite reemplazar únicamente a la persona marcada en magenta, lo que resulta útil en fotos de grupo y escenas con varias personas.

## Capacidades

- Reemplazo de cara (face swap) sobre una imagen de entrada, manteniendo la identidad de la cara de referencia.
- Reemplazo de cabeza (head swap) con versiones V1, V1.1 y V2-V5 según el modelo base.
- Reemplazo de cuerpo (body swap) completo sobre Qwen Image 2.1 y Krea 2.
- Reemplazo de cuerpo selectivo: sustituye solo a la persona marcada en magenta, útil en grupos.
- Edición de imagen guiada por prompt y por imagen de referencia (pipeline image-to-image).
- Integración con ComfyUI mediante workflows JSON incluidos en el repositorio.
- Compatibilidad con diffusers como librería de carga.
- Soporte experimental de LTX-2 mediante LoRA de tipo IC (in-context).
- No incluye tool calling, function calling, razonamiento multi-paso ni capacidades de agente; es un modelo de edición de imagen, no de texto.

## Casos de uso

- Producción audiovisual y postproducción: sustituir la cabeza o el cuerpo de un actor de doble por el del protagonista en planos concretos, usando el LoRA de head swap V1.1 sobre Qwen Image 2.1 y el workflow de ComfyUI incluido.
- Fotografía de producto con modelos: reemplazar la identidad del modelo de referencia por la del cliente manteniendo cuerpo y vestuario, con el LoRA de body swap V1.0 sobre Qwen Image 2.1.
- Fotos de grupo y eventos: usar la variante de body swap selectivo (magenta) para cambiar solo a una persona marcada, sin alterar al resto del grupo.
- Creación de contenido para redes y avatares: generar variantes de una misma identidad sobre distintas poses o cuerpos a partir de una imagen de referencia, encadenando el LoRA de face swap con el modelo base Qwen Image Edit 2509/2511.
- Prototipado rápido en estudios de diseño: iterar sobre composiciones con FLUX.2 Klein 4B (versión ligera) para pruebas de concepto y pasar a 9B para la versión final, usando los LoRA correspondientes a cada tamaño.
- Investigación en edición de imagen: comparar el comportamiento de distintos modelos base (Qwen Image 2.1, FLUX.2 Klein, Krea 2) con el mismo adaptador de reemplazo de cabeza, aprovechando que el repositorio ofrece pesos para cada familia.
- Integración en pipelines de diffusers: cargar el LoRA sobre el base y automatizar la sustitución de identidad en lotes de imágenes mediante scripts, sin depender de la interfaz de ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; depende del modelo base. Los LoRA en sí ocupan poco (del orden de decenas a cientos de MB según rank y precisión), pero el modelo base Qwen Image 2.1 o FLUX.2 Klein 9B requiere VRAM considerable.
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño de los modelos base (FLUX.2 Klein 9B, Qwen Image 2.1) se recomienda hardware de gama alta, pero el autor no especifica modelos concretos.
- ¿Cabe en GPU de consumo? No disponible. Existen variantes fp8 de FLUX.2 Klein (4B y 9B) que reducen requisitos, pero no se documentan cifras de VRAM.
- Opciones de despliegue: ComfyUI (workflows JSON incluidos) y diffusers. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a difusión de imagen).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelos base | Licencia | Formatos | Disponibilidad |
|---|---|---|---|---|---|
| BFS (Best Face Swap) | Colección de LoRA para face/head/body swap | Qwen Image 2.1, Qwen Image Edit 2509/2511, FLUX.2 Klein 4B/9B, Krea 2, LTX-2 | MIT | safetensors + workflows ComfyUI | Hugging Face, 218.696 descargas |
| Alternativas de face swap | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada; la model card no incluye comparativas con otras soluciones de face swap.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al operar sobre modelos base de difusión, hereda los sesgos de esos modelos en cuanto a representación de identidades, etnias, edades y géneros.
- Riesgo de alucinación: los resultados son demostraciones y no hay garantía de resultados idénticos en cada imagen; la propia model card advierte que los ejemplos no garantizan reproducibilidad.
- Limitaciones de contexto e idioma: el modelo está etiquetado únicamente para inglés; los prompts deben formularse en ese idioma.
- Restricciones de licencia: la licencia es MIT, pero la model card prohíbe explícitamente usar o compartir resultados con figuras públicas o personas que no hayan dado su consentimiento. Esta restricción es de uso, no de licencia, y debe respetarse en producción.
- Caveat de compatibilidad: cada LoRA debe usarse con su modelo base correspondiente; mezclar familias (base, text encoder, VAE, workflow y LoRA de distinto origen) provoca fallos. El orden de entrada varía por versión (algunos head swap usan cuerpo primero y cara de referencia después).
- Fuerza del LoRA: se recomienda empezar en 1.0 y ajustar según base, resolución e imagen de referencia.
- Riesgo de uso malicioso: la sustitución de identidad sin consentimiento es un vector claro de suplantación y deepfakes; debe aplicarse control de acceso y verificación de consentimiento en cualquier despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Alissonerdx/BFS-Best-Face-Swap
- Guía Qwen Image 2.1 (head V1/V1.1): docs/qwen-image-2.1.md
- Guía Qwen Image 2.1 (body swap V1.0): docs/qwen-image-2.1-body.md
- Guía Qwen Image 2.1 (body swap selectivo magenta): docs/qwen-image-2.1-body-selective.md
- Guía Qwen Image Edit 2509/2511: docs/qwen-image-edit.md
- Guía FLUX.2 Klein: docs/flux-2-klein.md
- Guía Krea 2: docs/krea-2.md
- Guía LTX-2 (experimental): docs/ltx-2.md
- Workflow head swap Qwen 2.1: workflows/Head Swap V1 Qwen 2.1 Workflow.json
- Workflow body swap Qwen Image 2.1: workflows/Body Swap Qwen Image 2.1 - V1.json
- Workflow body swap selectivo Qwen Image 2.1: workflows/Body Swap Selective Qwen Image 2.1 - V1.0.json
- Modelo base Qwen Image 2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- Modelo base Qwen Image Edit 2511: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Modelo base FLUX.2 Klein 9B: https://huggingface.co/black-forest-labs/FLUX.2-klein-9B
- Modelo base FLUX.2 Klein 4B: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Modelo base Krea 2 Raw: https://huggingface.co/krea/Krea-2-Raw
