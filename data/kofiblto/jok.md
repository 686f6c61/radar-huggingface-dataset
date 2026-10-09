# KOFIblto/jok

## Resumen

KOFIblto/jok es un adaptador LoRA de tipo DreamBooth para la familia de modelos de difusión text-to-image Krea 2, desarrollado por el usuario KOFIblto y publicado en Hugging Face. El adaptador se entrena sobre krea/Krea-2-Raw y se muestra funcionando sobre krea/Krea-2-Turbo, e invoca un concepto o persona concreta mediante el token de activación "Johanna". No es un modelo de lenguaje ni un modelo de difusión completo: es un conjunto de pesos de bajo rango que se carga sobre el modelo base a través de la librería diffusers.

El repositorio ocupa 1,7 GB y se distribuye bajo licencia Apache 2.0. La model card no documenta el número de parámetros del adaptador, el rango, el dataset de entrenamiento ni los hiperparámetros utilizados; solo indica el token de activación, el pipeline de uso (Krea2Pipeline) y las muestras generadas con 8 pasos de inferencia y guidance_scale=0.0.

Su relevancia práctica es acotada: permite reproducir de forma consistente un personaje concreto con Krea 2 sin reentrenar el modelo base. Las muestras publicadas incluyen descripciones de carácter sexual explícito, lo que condiciona su uso y plantea dudas sobre consentimiento, derechos de imagen y adecuación en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion text-to-image de la familia Krea 2; no se especifica la arquitectura interna del modelo base (UNet o DiT) |
| Parametros totales | No disponible. El repositorio ocupa 1,7 GB, pero no se desglosa cuanto corresponde a los pesos del adaptador |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de difusion). No se documenta una longitud maxima de prompt |
| Tipos de cuantizacion | No disponible. La model card solo muestra carga en bfloat16 del modelo base; no se publican versiones GGUF, fp8 ni cuantizadas |
| Idiomas soportados | No disponible. Los prompts de ejemplo de la model card estan en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | No especificado de forma explicita. El repositorio es compatible con la libreria diffusers y se carga con `pipe.load_lora_weights()` |

Datos adicionales del repositorio: 0 descargas, 0 likes, creado el 2026-10-08 y actualizado el mismo dia. Pipeline declarado: text-to-image. Modelo base declarado: krea/Krea-2-Raw.

## Arquitectura y entrenamiento

El adaptador es una LoRA de estilo DreamBooth. Este tipo de entrenamiento inyecta matrices de bajo rango en las capas del modelo base y ajusta unicamente esos pesos, de modo que el modelo original permanece congelado. El resultado es un fichero de pesos mucho mas pequeno que el modelo completo que se puede cargar en tiempo de inferencia o fusionar con el base. La model card no indica el rango de la LoRA, el valor de alpha, la tasa de aprendizaje, el numero de pasos, el numero de imagenes del dataset ni si se aplicaron tecnicas de regularizacion o de preservacion del priors.

La unica informacion de entrenamiento disponible es que se entreno sobre Krea 2 RAW (krea/Krea-2-Raw) y que las muestras se generaron sobre Krea 2 Turbo (krea/Krea-2-Turbo) con 8 pasos de inferencia y guidance_scale=0.0, valor coherente con variantes destiladas o aceleradas del modelo base. El codigo de ejemplo usa `Krea2Pipeline.from_pretrained(..., torch_dtype=torch.bfloat16)` seguido de `load_lora_weights("KOFIblto/jok")`. No se documenta ninguna innovacion tecnica adicional.

## Capacidades

- Generacion de imagenes text-to-image condicionada a la identidad o concepto asociado al token "Johanna".
- Reproduccion consistente de un personaje (rasgos fisicos, color de pelo, complexion) a partir de descripciones textuales.
- Control de escena y encuadre mediante prompt: fondo, iluminacion, postura, vestuario y direccion de la mirada, segun los ejemplos publicados.
- Integracion con diffusers: carga como adaptador sobre Krea 2 Raw o Krea 2 Turbo sin modificar el pipeline.
- Compatibilidad con pocos pasos de inferencia (8 pasos en los ejemplos, con guidance_scale=0.0 sobre la variante Turbo).
- No documentado: soporte de tool calling, function calling, agentes, razonamiento multi-paso, entrada de vision o audio, modo thinking, o capacidades multilingues. No aplica al ser un modelo de difusion, no un modelo de lenguaje.

## Casos de uso

- Ilustracion editorial y narrativa serializada: mantener el mismo personaje a lo largo de varias ilustraciones cambiando solo el prompt de escena, gracias a la consistencia de identidad que aporta el token de activacion.
- Previsualizacion de vestuario y direccion de arte: generar variaciones de una modelo virtual con distintos conjuntos y estilos de iluminacion antes de una sesion fotografica real.
- Storyboards y conceptual art para produccion audiovisual: crear fotogramas de referencia con un personaje fijo para validar encuadres y paletas con el equipo.
- Avatares y contenido para videojuegos o experiencias interactivas: generar retratos consistentes de un personaje secundario sin coste de modelado 3D.
- Prototipado de campanas de marketing: producir imagenes de un personaje de marca coherente en distintos formatos y escenarios para testear conceptos.
- Generacion de datasets sinteticos de personas: crear imagenes etiquetadas con un personaje controlado para tareas de aumento de datos, siempre que se resuelvan las cuestiones de consentimiento y licencia.
- Pruebas de investigacion sobre personalizacion: usar el adaptador como caso de estudio para medir fidelidad de identidad frente a adherencia al prompt en LoRAs de bajo rango.

Advertencia: los ejemplos publicados en la model card contienen descripciones sexuales explicitas. Cualquier uso en producto debe revisar antes la adecuacion legal y etica, el consentimiento de la persona representada y las politicas de la plataforma de destino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos cuantitativos presentes en la model card son parametros de inferencia y metadatos del repositorio:

| Dato | Valor |
|---|---|
| Pasos de inferencia en los ejemplos | 8 |
| guidance_scale en los ejemplos | 0.0 |
| Precision del modelo base en el ejemplo | bfloat16 |
| Tamano del repositorio | 1,7 GB |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-10-08 |

No hay datos de FID, CLIP score, similitud de identidad facial, ni comparaciones cuantitativas con otras LoRAs.

## Requisitos de hardware

- No se documentan requisitos de hardware en la informacion disponible.
- La VRAM necesaria la determina el modelo base (Krea 2 Raw o Krea 2 Turbo), no el adaptador: el repositorio del LoRA ocupa 1,7 GB, pero su carga anade una sobrecarga pequena frente a los pesos completos del modelo base.
- El unico requisito declarado en el ejemplo oficial es una GPU CUDA con soporte de bfloat16 para ejecutar `Krea2Pipeline` con diffusers.
- GPU recomendadas: no disponible. No se puede confirmar si el modelo base cabe en GPUs de consumo (RTX 3060, 4090) ni que modelos profesionales (A100, H100) son necesarios, porque no se publican los parametros del base.
- Opciones de despliegue documentadas: diffusers, cargando primero el pipeline base y despues `load_lora_weights()`. No se menciona soporte de vLLM (no aplica a difusion), llama.cpp, Ollama, TGI, ComfyUI ni Automatic1111.
- Latencia y throughput: no disponibles. Los ejemplos usan 8 pasos, lo que sugiere una generacion rapida sobre la variante Turbo, pero no se aportan tiempos medidos.

## Comparativa con modelos similares

No se han encontrado en la informacion proporcionada otras LoRAs comparables con datos publicados. La unica comparacion posible es con los modelos base sobre los que opera este adaptador, y los datos son mayoritariamente desconocidos:

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KOFIblto/jok | LoRA DreamBooth sobre Krea 2 | No disponible | No aplica | apache-2.0 | Hugging Face, 0 descargas |
| krea/Krea-2-Raw | Modelo base text-to-image | No disponible | No aplica | No disponible en la informacion | Referenciado en la ficha del LoRA |
| krea/Krea-2-Turbo | Modelo base text-to-image acelerado | No disponible | No aplica | No disponible en la informacion | Referenciado en la ficha del LoRA |

No se dispone de datos de rendimiento, tamano, contexto ni licencia de los modelos base dentro de la informacion facilitada, por lo que la comparativa no permite extraer conclusiones cuantitativas.

## Limitaciones y advertencias

- Contenido para adultos: las muestras oficiales incluyen descripciones sexuales explicitas; no es un modelo apto para productos dirigidos a menores ni para plataformas con politicas restrictivas de contenido.
- Derechos de imagen y consentimiento: la model card no indica el origen de las imagenes de entrenamiento ni si existe consentimiento de la persona representada. Reproducir la identidad de una persona real sin autorizacion puede vulnerar derechos de imagen y normativa de proteccion de datos.
- Reproducibilidad limitada: no se publican rango de la LoRA, alpha, learning rate, numero de pasos ni composicion del dataset, por lo que no se puede replicar el entrenamiento ni auditar su comportamiento.
- Sin validacion externa: 0 descargas y 0 likes implican que no hay evidencia de uso por terceros ni evaluaciones independientes de calidad.
- Sobreajuste probable: al ser una LoRA de identidad, puede degradar la adherencia al prompt en escenas muy distintas a las del dataset, y producir artefactos anatomicos, manos deformes o problemas de renderizado de texto, limitaciones habituales en modelos de difusion.
- Sesgos: no hay informacion sobre la distribucion demografica del dataset, por lo que no se puede evaluar el sesgo en rasgos fisicos, etnicidad, edad o corporalidad.
- Idioma: los unicos prompts documentados estan en ingles; no hay evidencia de calidad con prompts en castellano u otros idiomas.
- Licencia: el adaptador se publica bajo Apache 2.0, pero la licencia del modelo base Krea 2 no se indica en la informacion disponible. Es imprescindible verificar las condiciones de krea/Krea-2-Raw y krea/Krea-2-Turbo antes de cualquier uso comercial, ya que podrian imponer restricciones adicionales.
- Trazabilidad: el adaptador no incluye informacion sobre version del pipeline ni sobre cambios posteriores del modelo base, lo que puede provocar incompatibilidades al actualizar diffusers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KOFIblto/jok
- Modelo base de entrenamiento (Krea 2 Raw): https://huggingface.co/krea/Krea-2-Raw
- Modelo base usado en las muestras (Krea 2 Turbo): https://huggingface.co/krea/Krea-2-Turbo
- Documentacion de diffusers para carga de pesos LoRA: https://huggingface.co/docs/diffusers

Nota sobre la busqueda web: no se encontro ningun resultado relevante. Todas las entradas devueltas correspondian al minorista de instrumentos musicales Thomann (thomannmusic.com, thomann.fr, thomann.co.uk, thomann.de) y no guardan relacion con el modelo. No se han localizado papers, blogs, repositorios ni demos adicionales sobre KOFIblto/jok.
