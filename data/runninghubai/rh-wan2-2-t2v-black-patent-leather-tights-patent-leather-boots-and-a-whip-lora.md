# RunningHubAI/rh-wan2.2-t2v-black-patent-leather-tights-patent-leather-boots-and-a-whip-lora

## Resumen

El modelo `rh-wan2.2-t2v-black-patent-leather-tights-patent-leather-boots-and-a-whip-lora` es un adaptador LoRA publicado por RunningHubAI para el modelo base WAN 2.2 en su variante text-to-video (t2v) de bajo ruido (LowNoise). Se trata de un ajuste fino especializado que aplica un estilo visual concreto (medias y botas de cuero negro brillante junto con un látigo) sobre el generador de vídeo original. El repositorio contiene únicamente los pesos del adaptador, no el modelo base.

El adaptador se distribuye como un fichero `safetensors` de 293 MiB, pensado para cargarse en ComfyUI o en la plataforma RunningHub. Incluye una palabra de activación (`NSFPYEM`) que debe incorporarse en el prompt para que el estilo entrenado se manifieste. El modelo base sobre el que se aplica es WAN 2.2 LowNoise, un generador de vídeo por difusión de código abierto desarrollado por Alibaba.

La relevancia de esta ficha es limitada en el ámbito de la IA generativa de propósito general: se trata de un LoRA de nicho, sin métricas publicadas, sin licencia explícita declarada y con cero descargas en el momento de la consulta. Resulta útil como ejemplo del ecosistema de adaptadores de estilo que se está construyendo alrededor de WAN 2.2 y de plataformas como RunningHub, pero no debe confundirse con un modelo fundacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre WAN 2.2 t2v LowNoise (difusión) |
| Parametros totales | no disponible (el adaptador pesa 293 MiB en safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base WAN 2.2) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp16/bf16) |
| Idiomas soportados | no disponible (los prompts dependen del modelo base) |
| Licencia | no disponible (el autor remite a la licencia del proyecto original) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador es un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base WAN 2.2 en su variante t2v LowNoise. No se especifica en la información disponible el rango, las capas objetivo ni la estrategia de entrenamiento (número de pasos, dataset, resolución, learning rate). Tampoco se indica si se empleó regularización, captions automáticos o un pipeline de aumento de datos.

El modelo base WAN 2.2 es un generador de vídeo por difusión; la variante LowNoise se emplea habitualmente en la segunda etapa de un pipeline de dos modelos (high-noise + low-noise) para refinar el detalle. El LoRA se ha entrenado para asociar la palabra de activación `NSFPYEM` con el estilo visual descrito en el nombre del repositorio. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.) más allá del propio ajuste LoRA.

## Capacidades

- Generación de vídeo a partir de texto (t2v) cuando se aplica sobre WAN 2.2 LowNoise.
- Especialización estilística: induce la apariencia de medias y botas de cuero negro brillante y un látigo en las generaciones.
- Activación mediante palabra clave (`NSFPYEM`) en el prompt.
- Integración con ComfyUI mediante el nodo de carga de LoRA.
- Integración con la plataforma RunningHub (ejecución online y API).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Producción de vídeo de moda o estética: el LoRA permite generar clips coherentes con un estilo visual concreto (cuero negro brillante) sin necesidad de reentrenar el modelo base, útil para moodboards y pruebas de vestuario.
- Creación de contenido para redes sociales: generación rápida de clips cortos con una estética definida a partir de prompts de texto, usando ComfyUI o la API de RunningHub.
- Prototipado de storyboards: previsualización de escenas con un look concreto antes de rodar o producir con herramientas tradicionales.
- Pruebas de concepto en pipelines de difusión de vídeo: sirve para validar la integración de LoRA en flujos de dos etapas (high-noise + low-noise) dentro de ComfyUI.
- Investigación sobre personalización de modelos de vídeo: ejemplo práctico de cómo un LoRA de bajo rango modifica el estilo de un generador t2v sin alterar el modelo base.
- Demostraciones y tutoriales: útil para mostrar el flujo de trabajo de RunningHub y la carga de LoRA en ComfyUI con la palabra de activación correspondiente.
- Generación de material para campañas creativas: combinado con el modelo base, permite iterar variaciones de una misma estética con coste computacional bajo (adaptador de 293 MiB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; depende del modelo base WAN 2.2 (no se especifica en la información proporcionada).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI, plataforma RunningHub (online y API). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de vídeo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-wan2.2-t2v-...-lora (este) | LoRA sobre WAN 2.2 t2v LowNoise | no disponible (293 MiB) | no disponible | no disponible | Hugging Face, RunningHub |
| WAN 2.2 t2v LowNoise (base) | Modelo de difusión de vídeo | no disponible en la información | no disponible | no disponible | Repositorio oficial de WAN |
| Otros LoRA de estilo para WAN 2.2 | LoRA | variable | no disponible | variable | Hugging Face, RunningHub |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No se declara licencia explícita; el autor remite a la licencia del proyecto original (WAN 2.2). Es imprescindible verificar la licencia del modelo base antes de cualquier uso comercial.
- El LoRA está entrenado para un estilo muy concreto y puede degradar la calidad o introducir el estilo no deseado si se usa fuera de su dominio.
- Requiere la palabra de activación `NSFPYEM` para funcionar según lo previsto; sin ella, el efecto puede ser nulo o inconsistente.
- Depende del modelo base WAN 2.2 LowNoise; no es un modelo autónomo.
- Sin métricas publicadas, sin descargas ni likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- Riesgo de sesgos y de contenido no deseado inherente al modelo base y al dataset de ajuste, no documentado.
- Riesgo de alucinación visual (artefactos, incoherencias temporales) propio de los modelos de difusión de vídeo.
- No se documentan limitaciones de idioma ni de longitud de contexto para el adaptador.
- Para producción, conviene evaluar el modelo base por separado y validar el LoRA en el pipeline completo (high-noise + low-noise).

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-wan2.2-t2v-black-patent-leather-tights-patent-leather-boots-and-a-whip-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/1967439802012459010
- Página del autor: https://www.runninghub.ai/user-center/1931299605898764290
- Workflow recomendado: https://www.runninghub.ai/post/1968189836026851329/?inviteCode=rh-v1220
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
