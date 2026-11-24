# dmlsrc/LTX-2.5-Distilled-SoL-Refiner-LoRA

## Resumen

LTX-2.5-Distilled-SoL-Refiner-LoRA es un adaptador LoRA para el transformer destilado de LTX-2.5 de Lightricks, publicado por el usuario dmlsrc en Hugging Face. El adaptador extrae la parte de vídeo del SoL refiner de NVIDIA para LTX-2.5 (denominado "SoL H3"), originalmente diseñado para refinar los vídeos de MiniMax H3, y lo condensa en ficheros LoRA de 1, 2 o 4 GB en lugar de requerir un segundo transformer de 44 GB. El resultado es una mejora del aspecto visual del refinado sin necesidad de cargar un modelo adicional completo en memoria.

El adaptador se aplica sobre el modelo base `ltx-2.5-22b-distilled-transformer-bf16.safetensors` (LTX-2.5 destilado, no la variante dev) y afecta únicamente a las 584 matrices de pesos del lado del vídeo, dejando intactos los bloques de audio, la atención cruzada vídeo-audio y las redes de timestep multimodales. Se distribuye como pares LoRA en FP16 (`lora_A`, `lora_B`) sin tensores alpha, de modo que una fuerza de 1 aplica el cambio completo extraído.

El modelo es relevante para quienes trabajan con generación de vídeo de alta resolución y quieren mejorar la calidad del refinado en pipelines de dos etapas sin duplicar el coste de memoria del transformer completo. Es un adaptador no oficial: no está hecho, revisado ni respaldado por NVIDIA ni por Lightricks, y su licencia es la LTX-2 Community License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer de difusión de vídeo LTX-2.5 destilado |
| Parametros totales | no disponible (adaptador LoRA; el modelo base es de 22B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vídeo; no aplica ventana de texto) |
| Tipos de cuantizacion | FP16 (pares LoRA `lora_A`, `lora_B`); el modelo base admite bf16 |
| Idiomas soportados | no disponible (modelo de generación de vídeo) |
| Licencia | LTX-2 Community License (`ltx-2-community-license`) |
| Formato de pesos | safetensors (pares LoRA FP16, sin alpha) |
| Modelo base | Lightricks/LTX-2.5 (distilled, `ltx-2.5-22b-distilled-transformer-bf16.safetensors`) |
| Tamano del repo | 7.4 GB |
| Pipeline | text-to-video |
| Matrices afectadas | 584 matrices de pesos del lado del vídeo |

## Arquitectura y entrenamiento

El adaptador no es un modelo entrenado desde cero, sino una extracción de bajo rango de la diferencia entre el SoL refiner de NVIDIA para LTX-2.5 (SoL H3) y el transformer destilado de LTX-2.5. Concretamente, se toma el refiner SoL H3 y se le resta el modelo destilado para las 584 matrices de pesos del lado del vídeo, y el resultado se recorta a sus direcciones más fuertes para producir los pares LoRA. El script `make_sol_h3_lora.py`, incluido en el repo, permite reconstruir los adaptadores o generar cualquier tamano o rango.

El adaptador deja en los valores del modelo destilado los bloques de audio, la atención entre vídeo y audio y las redes de timestep multimodales. Se ha validado con el runner Metal del propio autor, y los formatos de claves para ComfyUI y Diffusers se han comprobado a partir de su código fuente. No se documentan datos de entrenamiento (tokens, composición del dataset) ni técnicas de RLHF/DPO, ya que no se trata de un entrenamiento sino de una destilación de pesos.

## Capacidades

- Generación de vídeo texto-a-vídeo (text-to-video) con el modelo base LTX-2.5 destilado.
- Generación de vídeo imagen-a-vídeo (image-to-video) según los tags del repo.
- Refinado de vídeo en una segunda etapa del pipeline (stage 2), mejorando el aspecto visual del resultado destilado.
- Aplicación en los dos últimos pasos de la etapa 1 y en la etapa 2 (Recipe 2).
- Control de intensidad mediante la fuerza del LoRA (por ejemplo, media fuerza o un cuarto de fuerza por paso de borrador).
- Compatibilidad con formatos de claves de ComfyUI y Diffusers.
- No incluye capacidades de audio propias: el audio permanece en los valores del modelo destilado.
- No dispone de tool calling, agentes ni razonamiento multi-paso (es un modelo de generación de vídeo).

## Casos de uso

- Refinado de vídeo en pipelines de dos etapas: se usa el modelo destilado para generar un borrador rápido a baja resolución (por ejemplo, 576x320) y el LoRA en la etapa de refinado a alta resolución (1152x640), mejorando la calidad sin cargar un segundo transformer de 44 GB.
- Producción de vídeo con memoria limitada: al ocupar 1, 2 o 4 GB en lugar de 44 GB, permite obtener el aspecto del refiner SoL en GPUs con VRAM ajustada, donde no cabría el transformer completo del refiner.
- Iteración rápida de recetas de refinado: el script incluido permite generar adaptadores de cualquier tamano o rango, útil para experimentar con distintas intensidades y pasos de refinado.
- Integración en ComfyUI: los formatos de claves están verificados contra el código fuente de ComfyUI, por lo que se puede cargar como nodo LoRA en flujos de trabajo de generación de vídeo existentes.
- Integración en Diffusers: igualmente compatible con el formato de claves de Diffusers para pipelines programáticos en Python.
- Investigación sobre destilación de refineros: sirve como ejemplo reproducible de cómo extraer la parte útil de un refiner grande (SoL H3) en un adaptador de bajo rango sobre un modelo destilado.
- Generación de clips cinematográficos con diálogo y lip-sync: el prompt de demostración describe una conversación de 30 segundos con movimiento labial natural, lo que ilustra el uso para escenas narrativas de plano único.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye únicamente comparativas cualitativas mediante vídeos de demostración (runs A a I) con un mismo prompt y semilla (42), a 30 s, 1152x640 y 24 fps (721 frames), pero sin métricas numéricas.

| Run | Configuracion | Borrador (576x320) | Refinado (1152x640) |
|---|---|---|---|
| A | Destilado stock | 8 pasos, sin LoRA | 3 pasos, sin LoRA |
| B | Recipe 1 | 4 pasos, sin LoRA | 1 paso desde 0.909375, LoRA 1 |
| C | Recipe 2 | 4 pasos, LoRA 0, 0, 1, 1 | 1 paso desde 0.825, LoRA 1 |
| D | Borrador stock, refinado SoL | 8 pasos, sin LoRA | 1 paso desde 0.909375, LoRA 1 |
| E | Borrador de C, refinado desde 0.909375 | borrador de C | 1 paso desde 0.909375, LoRA 1 |
| F | Borrador de C, refinado desde 0.725 | borrador de C | 1 paso desde 0.725 (datos truncados en la model card) |

## Requisitos de hardware

- VRAM estimada para el adaptador: 1, 2 o 4 GB según el tamano de fichero LoRA elegido, adicionales a la VRAM del modelo base LTX-2.5 destilado de 22B.
- El modelo base de 22B en bf16 requiere aproximadamente 44 GB de VRAM (tamano del transformer destilado citado en la model card), por lo que el adaptador no reduce el requisito del modelo base.
- GPU recomendadas: no disponible de forma explícita; el autor ha probado con un runner Metal propio (Apple Silicon). Para el modelo base de 22B se necesitan GPUs de gama alta con suficiente VRAM (A100, H100 o equivalentes).
- No cabe en GPUs de consumo convencionales por el tamano del modelo base, aunque el adaptador en sí es ligero.
- Opciones de despliegue: ComfyUI, Diffusers y el runner Metal del autor; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusión de vídeo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX-2.5-Distilled-SoL-Refiner-LoRA (este) | LoRA sobre LTX-2.5 destilado | Adaptador de 1-4 GB sobre base 22B | no aplica | LTX-2 Community License | Hugging Face (dmlsrc) |
| SoL-Refiner-LTX-2.5-for-MiniMax-H3 (Efficient-Large-Model) | Refiner completo | Transformer adicional de 44 GB | no aplica | no disponible | Hugging Face (Efficient-Large-Model) |
| LTX-2.5 destilado stock (Lightricks) | Transformer de difusión de vídeo | 22B | no aplica | LTX-2 Community License | Hugging Face (Lightricks) |

## Limitaciones y advertencias

- Adaptador no oficial: no está hecho, revisado ni respaldado por NVIDIA ni por Lightricks.
- No es una copia fiel del refiner SoL H3: solo toma su lado de vídeo y deja el resto en los valores del modelo destilado.
- Solo funciona con el modelo base LTX-2.5 destilado (`ltx-2.5-22b-distilled-transformer-bf16.safetensors`), no con la variante dev.
- El audio no se refina con este adaptador: los bloques de audio, la atención vídeo-audio y las redes de timestep multimodales permanecen en los valores del destilado.
- Licencia LTX-2 Community License: es necesario revisar sus términos para uso comercial antes de desplegar en producción.
- Riesgo de artefactos y alucinaciones visuales inherente a los modelos de difusión de vídeo; no se documentan sesgos específicos.
- Información de benchmarks limitada a demostraciones cualitativas; no hay métricas objetivas publicadas.
- Repo con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy reducido.
- La model card está parcialmente truncada en la información proporcionada (runs F en adelante incompletos).

## Enlaces

- Hugging Face: https://huggingface.co/dmlsrc/LTX-2.5-Distilled-SoL-Refiner-LoRA
- Modelo base LTX-2.5: https://huggingface.co/Lightricks/LTX-2.5
- Refiner SoL H3 (Efficient-Large-Model): https://huggingface.co/Efficient-Large-Model/SoL-Refiner-LTX-2.5-for-MiniMax-H3
- Licencia LTX-2 Community License: https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2_x
- Script de generación de LoRA: `make_sol_h3_lora.py` (incluido en el repo)
- Demos: https://huggingface.co/dmlsrc/LTX-2.5-Distilled-SoL-Refiner-LoRA/tree/main/demo
