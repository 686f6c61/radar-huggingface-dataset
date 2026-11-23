# Nebsh/Seedreamstyle-H3-6K

## Resumen

Seedreamstyle-H3-6K es un adaptador LoRA de estilo fotografico para el modelo de generacion de imagenes MiniMax H3 Image, desarrollado por el usuario independiente Nebsh. No se trata de un modelo base, sino de un ajuste fino ligero (rank 16) que se aplica sobre MiniMaxAI/MiniMax-H3-Image para reproducir el aspecto visual cinematografico caracteristico de Seedream 5.5, un modelo de imagen cerrado que el autor cita como su referencia favorita en cuanto a equilibrio de contraste, iluminacion y grano fotografico.

El LoRA esta orientado a escenas humanas: retratos, conversaciones, personas de edades variadas, iluminacion practica y planos de entorno. Se distribuye como un unico archivo safetensors de aproximadamente 1,8 GB dentro de un repositorio que tambien incluye checkpoints intermedios (de 2.000 a 6.000 pasos de entrenamiento) y una galeria comparativa de veinte escenas frente al modelo de referencia Seedream 5.5. La version recomendada por el autor es la de 6.000 pasos totales.

Su relevancia actual reside en que demuestra como un adaptador ligero y entrenado de forma independiente puede aproximar el estilo de un modelo propietario sobre una base abierta, con un flujo de trabajo reproducible en ComfyUI y una receta de inferencia concreta (LCM, 6 pasos, CFG 1). El modelo solo declara soporte de ingles en los prompts.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusion MiniMax H3 Image |
| Parametros totales | no disponible (el adaptador ocupa 1,8 GB en safetensors; el modelo base no se detalla) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; no hay ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible para el LoRA; el checkpoint base probado es `minimax_h3_image_pruned_int8_convrot.safetensors` (int8) |
| Idiomas soportados | en (ingles) |
| Licencia | minimax-h3-image-community-license-agreement (etiquetada como "other") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 16, pensado para inyectarse en las capas del modelo base MiniMax H3 Image a traves del nodo LoRA Loader de ComfyUI en modo "Model Only". El entrenamiento se realizo en dos fases: una primera etapa de 2.000 pasos sobre un dataset original de 43 imagenes, seguida de una continuacion hasta los 6.000 pasos totales (4.000 pasos adicionales) sobre un dataset ampliado y congelado de 1.134 pares imagen-caption que incluye las 43 originales. La resolucion objetivo de entrenamiento fue de aproximadamente 1 megapixel, con buckets por relacion de aspecto.

Los hiperparametros documentados son: optimizador Automagic3, learning rate 0,00028, EMA 0,98, batch size 1 con acumulacion 1. El disparador textual es `seedreamstyle.` al inicio del prompt. La receta de inferencia recomendada por el autor es LCM con 6 pasos, CFG 1 y scheduler simple, usando fuerza de LoRA 1.0. Las comparaciones de la galeria emplean el nodo `MiniMaxH3PromptWeight` de KJ en modo "text with empty image" activo sobre el 0-25% del proceso. No se documentan innovaciones arquitectonicas propias mas alla del ajuste de estilo.

## Capacidades

- Generacion de imagenes fotorrealistas con estetica cinematografica a partir de prompts de texto en ingles.
- Reproduccion de un estilo fotografico concreto: contraste equilibrado, iluminacion practica (logica de fuentes de luz en escena) y grano fotografico contenido.
- Especializado en escenas humanas: retratos, planos de conversacion, personas de distintas edades y planos medios o de cuerpo entero.
- Escenas de entorno e interiores con iluminacion mixta (por ejemplo, luz natural fria combinada con lamparas calidas).
- Aplicacion como adaptador de estilo sobre MiniMax H3 Image; no funciona de forma autonoma sin el modelo base.
- Soporte de control de semilla numerica y de pesos de prompt por region temporal (via MiniMaxH3PromptWeight).
- No dispone de tool calling, function calling, capacidades de agente ni razonamiento multi-paso: es un modelo puramente text-to-image.
- Capacidad multilingue limitada al ingles en los prompts.

## Casos de uso

- Retrato editorial y fotografia de moda: el LoRA aporta textura de piel natural, grano contenido y una iluminacion cinematografica adecuada para maquetas de editoriales o pruebas de concepto visuales antes de una sesion real.
- Storyboarding y previsualizacion cinematografica: permite generar planos de conversacion (por ejemplo, dos personas en un plano medio) con coherencia de iluminacion de escena, util para equipos de direccion de arte que necesitan referencias rapidas.
- Ilustracion de narrativa y ficcion: escenas de interiores y exteriores con luz atmosferica (tormenta, lluvia, luz de tarde) para acompañar relatos, articulos o guiones.
- Prototipado de campanas publicitarias: generar variaciones de una misma escena con semilla fija para evaluar como responde la estetica antes de contratar produccion fotografica.
- Generacion de material para videojuegos o entornos narrativos: conceptos de personajes y ambientes con un tono fotografico realista coherente entre imagenes.
- Experimentacion e investigacion sobre transferencia de estilo: sirve como caso de estudio reproducible de como un LoRA de rango 16 aproxima el look de un modelo propietario, con checkpoints intermedios para analizar la evolucion del estilo a lo largo del entrenamiento.
- Uso en pipelines de ComfyUI: integrable en flujos automatizados de generacion por lotes con LCM a 6 pasos para producir volumen de imagenes con bajo coste computacional por muestra.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FID, CLIP score, evaluaciones humanas con metricas) en la informacion disponible. El autor presenta una galeria comparativa cualitativa de veinte escenas frente a Seedream 5.5, con semillas y ajustes identicos, pero sin metricas numericas. Las imagenes H3 se generaron a 8448 x 4736 (aproximadamente 40 MP) y las referencias de Seedream 5.5 a 2736 x 1536 (2K nativo); el propio autor advierte que no se trata de una comparacion a resolucion igualada.

## Requisitos de hardware

- El adaptador pesa aproximadamente 1,8 GB en safetensors y se suma a los requisitos del modelo base MiniMax H3 Image, que no se detallan en la informacion disponible.
- VRAM estimada para inferencia: no disponible de forma explicita; depende del checkpoint base. El checkpoint probado es una version podada en int8 (`minimax_h3_image_pruned_int8_convrot.safetensors`), lo que reduce los requisitos frente a los pesos completos.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la documentacion; la generacion a 40 MP reportada sugiere requisitos de memoria elevados.
- Opciones de despliegue: ComfyUI (flujo documentado, con LoRA Loader en modo Model Only y el nodo MiniMaxH3PromptWeight de KJ). Otras opciones como vLLM, llama.cpp, Ollama o TGI no aplican a un modelo de difusion de imagen.
- Latencia y throughput: no disponibles; la receta LCM con 6 pasos y CFG 1 esta pensada para reducir el coste de muestreo frente a configuraciones de mas pasos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Seedreamstyle-H3-6K | LoRA de estilo sobre MiniMax H3 Image | rank 16, 1,8 GB | no aplica | Comparacion cualitativa con Seedream 5.5; sin metricas | minimax-h3-image-community-license-agreement | Hugging Face, 5.434 descargas, 126 likes |
| Seedream 5.5 | Modelo de imagen cerrado | no disponible | no aplica | Referencia de estilo del autor | propietaria | Solo servicio (Comfy Cloud en los ejemplos) |
| MiniMax H3 Image (base) | Modelo de difusion text-to-image | no disponible | no aplica | Base sobre la que se aplica el LoRA | minimax-h3-image-community-license-agreement | Hugging Face (MiniMaxAI) |
| Otros LoRA de estilo para H3 | Adaptadores de bajo rango | no disponible | no aplica | no disponible | variable | Hugging Face |

## Limitaciones y advertencias

- Solo funciona como adaptador sobre MiniMax H3 Image; no es un modelo autonomo y requiere descargar el base por separado.
- Prompts unicamente en ingles segun la model card; el rendimiento en otros idiomas no esta documentado.
- Especializado en escenas humanas y estetica fotografica concreta; puede no responder bien a otros dominios (ilustracion, anime, objetos tecnicos, texto en imagen).
- Riesgo de sesgos heredados del dataset de entrenamiento (1.134 pares imagen-caption, en parte donados por terceros) y del modelo base, sin documentacion sobre diversidad demografica.
- Riesgo de alucinacion visual: como modelo generativo, puede producir detalles anatomicos o de iluminacion fisicamente inconsistentes, especialmente en planos complejos.
- La licencia es la "minimax-h3-image-community-license-agreement", etiquetada como "other"; es imprescindible revisar sus terminos antes de cualquier uso comercial, ya que puede imponer restricciones adicionales.
- El autor advierte que la comparacion con Seedream 5.5 no es una prueba a resolucion igualada (40 MP frente a 2K nativo) y que semillas identicas entre modelos distintos no implican composiciones equivalentes.
- Los checkpoints intermedios (2.500 a 5.500 pasos) no han sido evaluados de forma separada; solo se comparan 2K y 6K en la galeria.
- El repositorio incluye imagenes de ejemplo generadas por IA que no deben tomarse como fotografia real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nebsh/Seedreamstyle-H3-6K
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Checkpoint recomendado: https://huggingface.co/Nebsh/Seedreamstyle-H3-6K/blob/main/Seedreamstyle_H3_Resume_6K.safetensors
- Galeria comparativa: https://huggingface.co/Nebsh/Seedreamstyle-H3-6K/blob/main/Gallery.html
- Manifiesto de comparacion: https://huggingface.co/Nebsh/Seedreamstyle-H3-6K/blob/main/comparison_manifest.json
- Manifiesto de checkpoints (tamaños y SHA-256): https://huggingface.co/Nebsh/Seedreamstyle-H3-6K/blob/main/checkpoints/manifest.json
- Licencia: https://huggingface.co/Nebsh/Seedreamstyle-H3-6K/blob/main/LICENSE
