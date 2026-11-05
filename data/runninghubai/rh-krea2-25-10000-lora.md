# RunningHubAI/rh-krea2-25-10000-lora

## Resumen

`rh-krea2-25-10000-lora` es un adaptador LoRA de edición de imagen publicado por RunningHubAI, entrenado sobre el modelo base krea2. No se trata de un modelo de lenguaje ni de un modelo fundacional: es un conjunto de pesos de bajo rango (224 MiB en un único fichero `safetensors`) que se aplica sobre krea2 para especializar su comportamiento en un estilo concreto. El autor lo describe como "Krea2-Beauty25-Female PhD-10000", una denominación que sugiere un entrenamiento orientado a retratos femeninos con una estética determinada.

El repositorio no incluye información sobre la arquitectura del modelo base, el número de pasos de entrenamiento, el dataset utilizado ni los hiperparámetros del LoRA (rango, alpha, módulos objetivo). El tamaño del repo (0,2 GB) es coherente con un adaptador de bajo rango, no con un modelo completo. La pipeline declarada es `image-text-to-image`, lo que indica que el adaptador se usa en flujos de generación o edición de imagen condicionados por texto.

Su relevancia es limitada fuera del ecosistema RunningHub/ComfyUI: no hay benchmarks, no hay licencia declarada y no hay documentación técnica más allá de la ficha de publicación. Resulta útil como ejemplo de LoRA de estilo distribuido a través de una plataforma comercial de entrenamiento e inferencia, pero no aporta información evaluable sobre capacidades generales de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base krea2; arquitectura del base no disponible |
| Parametros totales | no disponible (pesos LoRA de 224 MiB; número de parámetros no declarado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; cuantizaciones del base no declaradas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a la licencia del proyecto original o upstream, sin especificarla) |
| Formato de pesos | safetensors (`Krea2-美女25-女博士-10000.safetensors`, 224 MiB) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en capas del modelo base krea2 para modificar su comportamiento sin reentrenar los pesos completos. La model card no especifica el rango, el factor alpha, los módulos objetivo (atención, MLP, proyecciones de texto) ni el número de pasos de entrenamiento; el sufijo "10000" del nombre podría referirse a pasos o a un identificador interno, pero no se confirma en la documentación.

Tampoco se detalla la composición del dataset de entrenamiento, si hubo regularización, captions utilizadas ni método de validación. El autor indica que el entrenamiento se realizó en la plataforma RunningHub ("Train models on RunningHub"), lo que sugiere un pipeline gestionado por la propia plataforma. No hay información sobre el modelo base krea2 más allá de su nombre: se desconoce si es un diffusion transformer, un UNet o un modelo híbrido, y no se aportan datos sobre su contexto, resolución nativa o número de parámetros.

## Capacidades

- Edición y generación de imagen condicionada por texto, según la pipeline declarada `image-text-to-image`.
- Especialización estilística: el nombre del fichero ("Beauty25-Female PhD") apunta a un ajuste orientado a retratos femeninos con una estética concreta.
- Integración con ComfyUI, según los tags del repositorio, lo que permite encadenarlo con nodos de preprocesado, ControlNet u otros adaptadores.
- Carga en la plataforma RunningHub, tanto en su sitio internacional como en el chino.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo "thinking"; son capacidades ajenas al propósito del adaptador.
- Capacidades multilingües: no disponibles; no se documenta el soporte de prompts en distintos idiomas.

## Casos de uso

- Retrato de estudio con estética controlada: aplicar el LoRA sobre krea2 en ComfyUI para generar retratos femeninos coherentes con el estilo aprendido, usando prompts descriptivos y ajustando la escala del adaptador.
- Prototipado de personajes para ilustración editorial: generar variaciones de un mismo arquetipo visual ("mujer doctora/PhD") manteniendo rasgos consistentes entre imágenes.
- Edición de imagen existente: al ser un LoRA de edición, puede aplicarse sobre una imagen de entrada para reestilizarla hacia el look del adaptador, siempre que el flujo de ComfyUI lo permita.
- Pruebas de concepto en pipelines de diseño gráfico: comparar el resultado del LoRA frente al modelo base para decidir si el estilo encaja en una campaña, sin necesidad de reentrenar.
- Automatización vía API de RunningHub: invocar el modelo público referenciado en la model card para generar imágenes por lotes desde un servicio externo, útil para generar catálogos de avatares o material promocional.
- Docencia y experimentación con LoRAs: usar el adaptador como ejemplo práctico para explicar cómo un LoRA modifica un modelo de difusión y cómo se ajusta su peso en la inferencia.
- Integración en flujos de ComfyUI con otros nodos: combinarlo con upscalers o modelos de posprocesado para obtener salidas de mayor resolución a partir de las generaciones del adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; depende enteramente del modelo base krea2, cuyos requisitos no se documentan en el repositorio.
- GPU recomendadas: no disponibles; al no declararse el tamaño del base, no puede estimarse si requiere A100, H100, RTX 4090 u otras.
- Compatibilidad con GPU de consumo: no confirmada; el adaptador en sí ocupa 224 MiB, pero la inferencia exige cargar el modelo base completo.
- Opciones de despliegue: ComfyUI (según tags), plataforma RunningHub (sitio internacional y chino) y API de RunningHub. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de imagen de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-krea2-25-10000-lora | LoRA sobre krea2 | no disponible (224 MiB de pesos) | no aplica | no disponible | Hugging Face, RunningHub, ComfyUI |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros LoRAs comparables entrenados sobre krea2 ni sobre adaptadores equivalentes de la misma plataforma, por lo que no es posible establecer una comparación técnica rigurosa.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se declaran rango, alpha, módulos objetivo, dataset ni hiperparámetros, lo que impide reproducir el entrenamiento o evaluar su calidad de forma objetiva.
- Licencia no especificada: la model card remite a "la licencia del proyecto original o upstream" sin nombrarla, lo que genera incertidumbre legal para uso comercial. Es imprescindible verificar la licencia de krea2 antes de desplegarlo en producción.
- Dependencia del modelo base: el adaptador no funciona de forma autónoma; cualquier limitación de krea2 (sesgos, resolución, idiomas de los prompts) se hereda.
- Sesgos potenciales: el nombre del fichero sugiere un entrenamiento centrado en un arquetipo muy concreto ("mujer joven, estética beauty, doctora"), lo que puede producir resultados poco diversos y reforzar estereotipos de género o profesionales.
- Riesgo de sobreajuste al estilo: con un entrenamiento nominal de 10.000 pasos y un dataset no documentado, es plausible que el LoRA reproduzca rasgos de las imágenes de entrenamiento, incluida la posible memorización de identidades.
- Idiomas de los prompts no documentados: no se sabe si el adaptador responde igual de bien a prompts en castellano, inglés o chino.
- Sin métricas de calidad: no hay FID, CLIP score ni evaluaciones humanas publicadas, por lo que no puede compararse su rendimiento con otros adaptadores.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.
- Fecha de creación declarada en 2026-11-05: conviene verificar la coherencia temporal del repositorio antes de citarlo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-krea2-25-10000-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2081259897538588674
- Página del autor: https://www.runninghub.ai/user-center/2064710712105979905
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-krea2-25-10000-lora/blob/main/README_cn.md
