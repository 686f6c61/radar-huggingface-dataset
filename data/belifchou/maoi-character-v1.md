# BelifChou/maoi-character-v1

## Resumen

Maoi-character-v1 es un adaptador LoRA de tipo DreamBooth para generación de imágenes mediante texto, desarrollado por el usuario BelifChou y publicado en Hugging Face. El adaptador se entrena sobre el modelo base Krea-2-Raw (krea/Krea-2-Raw) y está pensado para inyectar en el modelo un concepto visual concreto: las estatuas moái, activadas mediante el token de disparo `maoi`. El repositorio ocupa 0,8 GB y se distribuye bajo licencia Apache 2.0.

El modelo no es un modelo de lenguaje ni un transformer generativo de texto: es un adaptador de difusión que modifica el comportamiento de un pipeline text-to-image. Su relevancia es acotada y práctica: permite a quien ya utilice Krea 2 generar variaciones estilizadas de estatuas moái (fotorrealistas, cristalinas, pictóricas) sin reentrenar el modelo base. Con 8 descargas y 0 likes en el momento de la consulta, se trata de un artefacto de nicho, probablemente experimental o de uso personal.

La información pública disponible es muy limitada: la model card describe el uso básico con diffusers, el token de activación y tres prompts de ejemplo, pero no detalla el dataset de entrenamiento, hiperparámetros, número de pasos ni métricas de evaluación. Todo lo que no consta en la información proporcionada se marca explícitamente como no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusión text-to-image (Krea 2) |
| Parámetros totales | no disponible (el adaptador pesa 0,8 GB en el repositorio) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a modelos de difusión) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (los prompts de ejemplo están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos LoRA para diffusers (formato del repositorio diffusers; no se especifica GGUF ni safetensors de forma explícita) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica LoRA aplicada a un modelo de difusión. Según la model card, se trata de un DreamBooth-LoRA entrenado sobre Krea 2 RAW (krea/Krea-2-Raw) y presentado sobre Krea 2 Turbo, con el que se generaron las muestras a 8 pasos de inferencia y `guidance_scale=0.0`. El token de activación es `maoi`. No se especifican el número de imágenes del dataset, el rango de la LoRA, la tasa de aprendizaje, el número de pasos de entrenamiento ni si se aplicaron técnicas adicionales como regularización o aumento de datos.

La innovación técnica es la propia del ecosistema Krea 2: un adaptador ligero que se carga sobre el pipeline base mediante `load_lora_weights` y que permite invocar un concepto concreto sin modificar los pesos del modelo original. No hay información sobre decodificación especulativa, atención lineal ni otras optimizaciones, ya que no aplican al tipo de modelo.

## Capacidades

- Generación de imágenes a partir de prompts de texto en inglés, condicionada por el token `maoi`.
- Inyección de un concepto visual específico (estatuas moái) en estilos muy diversos: fotorrealista cinematográfico, fantasía en miniatura con cristal iridiscente y pintura al óleo barroca, según los ejemplos de la model card.
- Compatibilidad con el pipeline `Krea2Pipeline` de diffusers y con el modelo Turbo para inferencia rápida (8 pasos).
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; los ejemplos y el token de activación están en inglés.
- No dispone de modo thinking, visión, audio ni otras capacidades multimodales más allá de la generación de imagen.

## Casos de uso

- Ilustración conceptual de entornos: generar estatuas moái integradas en escenarios urbanos, selváticos o palaciegos para bocetos de videojuegos o narrativa visual, usando el token `maoi` junto con descriptores de escena.
- Pruebas de estilo artístico: comparar cómo un mismo concepto se representa en estilos fotorrealista, pictórico o de fantasía, útil para explorar direcciones de arte antes de encargar trabajo a un ilustrador.
- Prototipado rápido de assets para proyectos creativos: producir variaciones de un motivo escultórico concreto para maquetas, presentaciones o moodboards.
- Educación y divulgación: ilustrar materiales sobre la cultura de la isla de Pascua con representaciones estilizadas, siempre que se respete el contexto cultural y no se presenten como documentales.
- Generación de imágenes de referencia para modelado 3D: obtener vistas de una estatua moái en distintos materiales (piedra, cristal) como inspiración para esculpir o texturizar.
- Experimentación con LoRA y diffusers: servir como ejemplo práctico de cómo cargar un adaptador DreamBooth sobre Krea 2 Turbo y ajustar pasos y guidance para obtener resultados rápidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; depende del modelo base Krea 2, no del adaptador. El adaptador en sí ocupa 0,8 GB en disco.
- GPU recomendadas: no disponibles en la información proporcionada; el ejemplo de la model card usa `torch_dtype=torch.bfloat16` y `.to("cuda")`, lo que sugiere una GPU con soporte bfloat16.
- Compatibilidad con GPU de consumo: no confirmada; depende de los requisitos del pipeline Krea 2, que no se detallan.
- Opciones de despliegue: diffusers con `Krea2Pipeline` y `load_lora_weights`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a difusión).
- Latencia y throughput: no disponibles; la model card indica 8 pasos de inferencia con Krea 2 Turbo, pero no aporta tiempos.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Token de activación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BelifChou/maoi-character-v1 | LoRA DreamBooth text-to-image | krea/Krea-2-Raw | `maoi` | Apache 2.0 | Hugging Face, 8 descargas |
| LoRAs de la comunidad Krea 2 | LoRA text-to-image | krea/Krea-2-Raw | variable | variable | no disponible (no se han identificado alternativas concretas en la información) |
| LoRAs DreamBooth sobre SDXL | LoRA text-to-image | SDXL | variable | variable | ecosistema amplio, no comparable directamente por falta de datos |

No se dispone de información sobre modelos comparables concretos de la misma categoría (LoRA de concepto sobre Krea 2) en la documentación proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; no se documenta la composición del dataset de entrenamiento ni posibles sesgos culturales o de representación.
- Riesgo de alucinación: en generación de imágenes, el riesgo se traduce en resultados que no se corresponden con el prompt o que deforman el concepto `maoi`; no hay evaluación publicada al respecto.
- Limitaciones de contexto o idioma: los prompts de ejemplo están en inglés y no se confirma soporte de otros idiomas; el token de activación es obligatorio para invocar el concepto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Krea 2 y de los datos de entrenamiento, que no se detallan.
- Caveats para producción: con 8 descargas y 0 likes, el modelo carece de validación comunitaria; no hay métricas, ni versionado documentado, ni garantías de estabilidad. El uso de `guidance_scale=0.0` en el ejemplo es específico de Krea 2 Turbo y puede no trasladarse a otras configuraciones.
- El repositorio se actualizó por última vez el 2026-11-07, apenas 35 minutos después de su creación, lo que sugiere un artefacto recién publicado y sin mantenimiento demostrado.

## Enlaces

- Hugging Face: https://huggingface.co/BelifChou/maoi-character-v1
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Modelo Turbo (usado en los ejemplos): https://huggingface.co/krea/Krea-2-Turbo
- Documentación de diffusers: https://huggingface.co/docs/diffusers
