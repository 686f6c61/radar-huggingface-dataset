# duckegg0623/anima-clean-texture-lighting

## Resumen

Clean Texture & Lighting (Anima) es un LoRA de estilo para el modelo de difusion text-to-image Anima Base v1.0 (LyliaEngine/anima_baseV10), desarrollado por el usuario duckegg0623. No es un modelo fundacional autonomo, sino un adaptador de bajo rango que se carga sobre el checkpoint base para modificar el renderizado de materiales y la iluminacion de las imagenes generadas: piel mas translucida, reflejos mas limpios en tela, metal y superficies mojadas, y una iluminacion con mayor profundidad y separacion sin saturar los colores.

El adaptador se entrena exclusivamente sobre ilustracion anime y, segun el autor, no altera la composicion ni la identidad de los personajes, lo que lo hace util como capa de acabado sobre flujos de trabajo que ya emplean LoRAs de personaje. Su relevancia es acotada: se trata de un ajuste de estilo muy especifico dentro del ecosistema de Anima, con cero descargas y cero likes en el momento de la ficha, publicado bajo licencia CDLA-Permissive-2.0.

El repositorio ocupa 0,1 GB y contiene unicamente los pesos del LoRA en formato de red de difusion (dim 32 / alpha 32, bf16), sin tokenizador ni VAE propios, ya que depende completamente del modelo base y del text encoder Qwen 3 0.6B que este requiere.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (red de bajo rango) sobre un modelo de difusion text-to-image; modulo `networks.lora_anima` |
| Parametros totales | no disponible (depende del checkpoint base Anima Base v1.0) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a modelos de difusion) |
| Tipos de cuantizacion | no disponible; los pesos del LoRA se distribuyen en bf16 |
| Idiomas soportados | no disponible (modelo text-to-image; el prompt se procesa mediante el text encoder Qwen 3 0.6B) |
| Licencia | CDLA-Permissive-2.0 |
| Formato de pesos | safetensors (fichero LoRA para ComfyUI) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 con alpha 32, entrenado en precision bf16 y tasa de aprendizaje 1e-4 mediante el modulo `networks.lora_anima`, especifico del ecosistema Anima. Se entreno sobre 495 imagenes de ilustracion anime seleccionadas, durante 3960 pasos (8 epocas). No se documentan en la informacion disponible detalles sobre la composicion del dataset, el pipeline de anotacion, el uso de regularizacion o tecnicas de RLHF/DPO, que en modelos de difusion no aplican del mismo modo que en LLM.

El modelo base Anima Base v1.0 funciona con un text encoder Qwen 3 0.6B y el VAE `qwen_image_vae`, segun las instrucciones de uso del autor. El LoRA no modifica la arquitectura del modelo base: inyecta matrices de bajo rango en las capas de atencion/cross-attention para sesgar la generacion hacia un renderizado de materiales mas limpio y una iluminacion mas definida. No se han publicado innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal u otras) en la informacion disponible.

## Capacidades

- Generacion de imagenes text-to-image en estilo anime sobre Anima Base v1.0.
- Mejora del renderizado de piel: aspecto mas claro y translucido.
- Refinado de materiales: reflejos mas limpios en tela, metal y superficies mojadas.
- Iluminacion con mayor profundidad y separacion de planos sin sobreexponer colores.
- Palabra de activacion `pure_skin` para invocar el efecto del LoRA en el prompt positivo.
- Compatibilidad con otros LoRAs de la misma base (por ejemplo, `lineweight` para lineart mas fino).
- Preservacion de composicion e identidad de personaje segun el autor.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de audio o vision de entrada; es exclusivamente generativo de imagen.

## Casos de uso

- Acabado de ilustraciones anime en produccion: aplicar el LoRA con peso 0,8-1,1 sobre el checkpoint base para homogeneizar el renderizado de piel y materiales en un lote de imagenes generadas, reduciendo el retoque manual posterior.
- Integracion en pipelines de ComfyUI: cargar `anima_baseV10.safetensors` junto con el text encoder `qwen_3_06b_base` y el `qwen_image_vae`, anadir un nodo LoraLoader y encadenar el flujo con otros adaptadores de estilo o de personaje.
- Generacion de personajes con LoRA de identidad: combinarlo con un LoRA de personaje bajando el peso a 0,6-0,8 para evitar sobreprocesar la piel, segun recomienda el autor.
- Creacion de key art y portadas: usar la mejora de iluminacion para obtener separacion de planos y reflejos mas creibles en escenas con metal, agua o tela, utiles en ilustracion promocional.
- Prototipado rapido de estilos visuales: comparar el mismo prompt con y sin el adaptador para evaluar el efecto en el renderizado de materiales antes de fijar una direccion artistica.
- Combinacion con `lineweight`: generar lineart mas fino y limpio junto a materiales mejor definidos para ilustracion editorial o webtoon.
- Experimentacion e investigacion de LoRAs de estilo: servir como referencia de entrenamiento (495 imagenes, 8 epocas, dim 32) para quienes quieran replicar ajustes de textura e iluminacion en la base Anima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del checkpoint base Anima Base v1.0, del text encoder Qwen 3 0.6B y del VAE `qwen_image_vae`. El LoRA en si anade una sobrecarga minima (repositorio de 0,1 GB).
- GPU recomendadas: no disponible en la informacion proporcionada.
- Viabilidad en GPU de consumo: no confirmada; el requisito dominante es el del modelo base, no el del adaptador.
- Opciones de despliegue: ComfyUI es el flujo documentado por el autor (`ComfyUI/models/loras/` + LoraLoader). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion de imagen.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| duckegg0623/anima-clean-texture-lighting | LoRA de estilo (textura e iluminacion) | Anima Base v1.0 | no disponible (dim 32 / alpha 32) | no aplica | CDLA-Permissive-2.0 | HuggingFace, 0 descargas |
| `lineweight` (LoRA citado por el autor) | LoRA de estilo (lineart) | Anima Base v1.0 | no disponible | no aplica | no disponible | no disponible |
| Anima Base v1.0 (LyliaEngine/anima_baseV10) | Modelo base text-to-image | propio | no disponible | no aplica | no disponible | HuggingFace |

No se dispone de datos de rendimiento ni de benchmarks para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre ilustracion anime: su efecto puede degradarse o ser irrelevante en fotorrealismo u otros estilos.
- Riesgo de sobreprocesado si se combina con LoRAs de personaje que ya afectan a la piel; el autor recomienda bajar el peso a 0,6-0,8 en ese caso.
- No modifica composicion ni identidad de personaje segun el autor, pero no hay evaluacion independiente que lo verifique.
- Dependencia total del modelo base Anima Base v1.0, del text encoder Qwen 3 0.6B y del VAE `qwen_image_vae`; no es utilizable de forma autonoma.
- Sin descargas ni likes en el momento de la ficha: ausencia de validacion comunitaria y de reportes de calidad.
- No se documentan sesgos conocidos, tasas de alucinacion (concepto no aplicable a difusion) ni limitaciones de idioma mas alla de las del text encoder.
- Licencia CDLA-Permissive-2.0: permite uso, modificacion y redistribucion, pero conviene revisar las condiciones del modelo base y del text encoder, cuyas licencias no se detallan en la informacion disponible.
- Fecha de creacion y actualizacion registradas en 2026-10-27; verificar la vigencia del repositorio antes de integrarlo en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/duckegg0623/anima-clean-texture-lighting
- Modelo base: https://huggingface.co/LyliaEngine/anima_baseV10
- Repositorio del modulo de entrenamiento `networks.lora_anima`: no disponible
- Paper, blog o demo adicionales: no disponibles
