# OzzyGT/Kimodo_SOMA_RP_v1_2_sdnq_dynamic_8bit

## Resumen

Kimodo SOMA RP v1.2 SDNQ INT8 es una versión cuantizada a 8 bits dinámicos del modelo de texto-a-movimiento OzzyGT/Kimodo_SOMA_RP_v1_2, que a su vez es la conversión a Diffusers del modelo original de NVIDIA nvidia/Kimodo-SOMA-RP-v1.2. No genera texto ni imágenes: produce secuencias de movimiento humano en formato de articulaciones (esqueleto SOMA77), con desplazamiento de raíz preservado, a partir de una descripción textual en inglés. La cuantización la firma el usuario OzzyGT mediante la librería SDNQ y afecta al codificador de texto (derivado de Llama 3 8B Instruct con adaptadores LLM2Vec) y al transformador de movimiento; el adaptador LoRA supervisado de LLM2Vec y el codec de movimiento se mantienen en precisión original.

El interés práctico inmediato es de despliegue: el repositorio pasa de 16 GB a 8,5 GB (8,0 GB según la model card) y el ejemplo de inferencia incluido en la documentación alcanza un pico de 8,2 GiB de VRAM, lo que sitúa el modelo al alcance de GPUs de consumo. El autor afirma que la reconstrucción a 8 bits mantiene el mismo resultado que bf16 con la misma semilla, con posiciones articulares dentro de 1 cm.

Se trata de un modelo muy reciente (creado y actualizado el 20 de octubre de 2026), sin descargas ni valoraciones en el momento de redactar esta ficha, y con una licencia compuesta que combina la NVIDIA Open Model License con la Llama 3 Community License, un punto que condiciona su uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión texto-a-movimiento (pipeline modular de Diffusers): transformador de movimiento + codificador de texto LLM2Vec sobre Llama 3 8B Instruct + codec de movimiento |
| Parametros totales | 283.556.227 (recuento de safetensors del repositorio; corresponde al conjunto cuantizado y no incluye el codificador Llama 3 8B completo, según se deduce de la model card, dato no confirmado explícitamente) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de texto-a-movimiento; la longitud del prompt no se documenta). El ejemplo genera 120 fotogramas = 4 segundos a 30 FPS |
| Tipos de cuantizacion | SDNQ dinámica 8-bit (INT8) en codificador de texto y transformador de movimiento; adaptador LoRA supervisado de LLM2Vec en float32; codec de movimiento sin cuantizar. Requiere sdnq >= 0.2.8 |
| Idiomas soportados | en (inglés) |
| Licencia | kimodo-and-llama3-component-licenses: NVIDIA Open Model License (pesos de movimiento) + Meta Llama 3 Community License y política de uso aceptable (codificador de texto) + Apache-2.0 para el código propio del modelo, con componentes LLM2Vec bajo MIT |
| Formato de pesos | safetensors (librería diffusers; bloques modulares con `components_repo`) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline modular de Diffusers para generación de movimiento: un codificador de texto basado en Meta Llama 3 8B Instruct adaptado con LLM2Vec (adaptadores MNTP y supervisado), un transformador de difusión que genera el movimiento y un codec de movimiento que lo proyecta al esqueleto SOMA77. La salida se expresa en metros, con +Y hacia arriba, +Z como orientación inicial hacia delante, 30 FPS y desplazamiento de raíz preservado. No se admiten prompts negativos.

Esta variante no reentrena el modelo: aplica cuantización dinámica de 8 bits con SDNQ sobre el codificador de texto y el transformador de movimiento, mantiene el adaptador LoRA supervisado de LLM2Vec en float32 y deja intacto el codec. La model card no aporta detalles sobre el dataset de entrenamiento original (número de tokens, composición, horas de movimiento capturado) ni sobre las etapas de ajuste del modelo base; esa información correspondería a la ficha de nvidia/Kimodo-SOMA-RP-v1.2, no incluida en la información disponible.

El autor reporta que, a 8 bits, la misma semilla produce la misma toma con posiciones articulares dentro de 1 cm respecto a bf16, aunque no se documenta la metodología de esa comparación ni métricas de plausibilidad física. Como innovación de despliegue, el uso de SDNQ dinámico reduce el peso del repositorio a la mitad sin requerir recalibración manual.

## Capacidades

- Generación de movimiento humano a partir de prompts de texto en inglés (text-to-motion), con control de duración mediante `num_frames`.
- Salida con esqueleto SOMA77, en metros, +Y arriba, +Z adelante, a 30 FPS, con root motion preservado (válida para retargeting a otros rigs).
- Control de reproducibilidad mediante semilla y de calidad mediante `num_inference_steps` (el ejemplo usa 100 pasos).
- Cuantización INT8 con fidelidad declarada frente a bf16 (misma semilla, misma toma, desviación articular < 1 cm).
- Inferencia en GPU de consumo gracias al pico de 8,2 GiB de VRAM del ejemplo.
- No soporta prompts negativos.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento: es un generador de movimiento, no un modelo de lenguaje conversacional.

## Casos de uso

- Previsualización de animación en producción de videojuegos: generar tomas de 4 segundos (120 fotogramas a 30 FPS) desde una descripción textual para bloqueo de escenas y previz, antes de encargar la animación final al equipo de animadores.
- Generación de datasets sintéticos de movimiento: producir lotes de secuencias etiquetadas con prompt para entrenar clasificadores de acción, modelos de control o sistemas de captioning de movimiento, aprovechando el formato SOMA77 y el root motion.
- Retargeting en Blender, Maya o MotionBuilder: la salida con esqueleto estándar y desplazamiento de raíz permite importar la secuencia y remapearla al rig del proyecto sin postprocesado de trayectoria.
- Referencias de movimiento para robótica humanoide y simulación: usar las secuencias como reference motion en simuladores físicos (Isaac Sim, MuJoCo) para políticas de locomoción, gracias a que las unidades en metros y el +Y arriba son directamente interpretables.
- Avatares en realidad virtual y aplicaciones sociales: generación bajo demanda de gestos y desplazamientos a partir de texto para animar avatares, con inferencia en una GPU de 12 GB o más.
- Previz de VFX y arquitectura: animar figuras humanas que recorren un espacio para evaluar escala y circulación en maquetas digitales, con iteración rápida sobre el prompt.
- Despliegue en estaciones de trabajo modestas: al ocupar 8,5 GB de repositorio y un pico de 8,2 GiB de VRAM, permite integrar generación de movimiento en herramientas de escritorio o en un servicio interno sin GPUs de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica aportada por el autor es cualitativa y comparativa frente a bf16:

| Metrica | bf16 (modelo base) | INT8 (este modelo) | Fuente |
|---|---|---|---|
| Reproducibilidad con la misma semilla | misma toma | misma toma | model card |
| Desviación de posiciones articulares | referencia | < 1 cm | model card |
| Tamano del repositorio | 16 GB | 8,5 GB en Hub (8,0 GB según la model card) | Hub / model card |
| Pico de VRAM en el ejemplo | no disponible | 8,2 GiB | model card |

No hay datos de MMLU, HumanEval, GSM8K ni de métricas específicas de text-to-motion (FID de movimiento, error de posiciones, plausibilidad física, foot sliding) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: 8,2 GiB de pico medido en el ejemplo de la model card (codificador de texto en bfloat16, resto en float32 sobre los pesos INT8).
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para trabajar con margen y lotes; A100 o H100 para servir varias peticiones o ejecutar comparaciones frente a bf16.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier tarjeta con 12 GB o más, dado el pico de 8,2 GiB; en tarjetas de 8 GB el margen es nulo y no está documentado.
- Opciones de despliegue: Diffusers 0.41.0 con `ModularPipelineBlocks` y `components_repo` apuntando a este repositorio, más `sdnq>=0.2.8`, `transformers==5.20.2`, `peft==0.21.2`, `accelerate>=1.15`, `safetensors>=0.8` y numpy. Es obligatorio importar `sdnq` antes de cargar el modelo para que se registren los pesos cuantizados. No aplican vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo de lenguaje.
- Flags necesarios: `trust_remote_code=True` y `trust_components_code=True`, que ejecutan código Python descargado del Hub.
- Latencia y throughput: no disponibles. El ejemplo utiliza 100 pasos de inferencia para 120 fotogramas (4 segundos de movimiento); no se publica tiempo por generación ni comparativa de velocidad frente a bf16.

## Comparativa con modelos similares

| Modelo | Parametros | Salida / duracion | Precisión | Licencia | Tamano repo |
|---|---|---|---|---|---|
| OzzyGT/Kimodo_SOMA_RP_v1_2_sdnq_dynamic_8bit (este) | 283,6 M en safetensors | movimiento SOMA77, 120 fotogramas (4 s a 30 FPS) en el ejemplo | SDNQ INT8 dinámico | NVIDIA Open Model License + Llama 3 Community License | 8,5 GB |
| OzzyGT/Kimodo_SOMA_RP_v1_2 (base) | mismos pesos, sin cuantizar | idéntica | bf16 | misma licencia compuesta | 16 GB |
| nvidia/Kimodo-SOMA-RP-v1.2 (original) | no disponible en la información proporcionada | idéntica | no disponible | NVIDIA Open Model License | no disponible |
| Otros modelos text-to-motion (MDM, MLD, MotionDiffuse, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante y documentada es frente al modelo base en bf16: misma arquitectura, mismo pipeline y misma salida, con la mitad de peso en disco y una desviación declarada inferior a 1 cm. Frente al original de NVIDIA, la diferencia es el formato (Diffusers modular frente a los bloques originales de Kimodo).

## Limitaciones y advertencias

- Idiomas: solo inglés. Los prompts en castellano no están cubiertos por la model card y su comportamiento no está documentado.
- Sin prompts negativos: no es posible excluir estilos o artefactos mediante instrucciones negativas.
- Duración: el ejemplo documentado genera 120 fotogramas (4 segundos a 30 FPS); no se especifica el máximo de fotogramas soportado ni el comportamiento en secuencias largas.
- Fidelidad de la cuantización: la afirmación de < 1 cm de desviación es del autor y no ha sido verificada de forma independiente; el modelo no tiene descargas ni validación comunitaria en el momento de la ficha.
- Licencia compuesta: los pesos de movimiento se rigen por la NVIDIA Open Model License y el codificador de texto por la Llama 3 Community License y su política de uso aceptable, que incluyen condiciones y umbrales específicos para uso comercial. Es obligatorio revisar ambos textos antes de un despliegue en producción.
- Ejecución de código remoto: el pipeline requiere `trust_remote_code=True` y `trust_components_code=True`, lo que ejecuta código Python del Hub; debe auditarse y limitarse a repositorios de confianza.
- Dependencias frágiles: versiones fijadas (diffusers 0.41.0, transformers 5.20.2, peft 0.21.2, sdnq >= 0.2.8); cualquier desviación puede romper la carga de los pesos cuantizados.
- Riesgo de artefactos de movimiento: no se publican métricas de plausibilidad física, contacto con el suelo ni foot sliding, ni evaluación de sesgos en la generación (por ejemplo, sesgos de género o corporales asociados al dataset de captura original), por lo que no pueden descartarse.
- Alucinación en sentido estricto (texto inventado) no aplica; el riesgo equivalente es generar movimiento incoherente o no físicamente plausible ante prompts ambiguos, sin que exista una métrica publicada para medirlo.
- Recuento de parámetros: los 283,6 M de safetensors no parecen incluir el codificador Llama 3 8B completo, de modo que no debe usarse esa cifra para estimar requisitos de memoria del pipeline entero.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/OzzyGT/Kimodo_SOMA_RP_v1_2_sdnq_dynamic_8bit
- Modelo base en bf16: https://huggingface.co/OzzyGT/Kimodo_SOMA_RP_v1_2
- Modelo original de NVIDIA: https://huggingface.co/nvidia/Kimodo-SOMA-RP-v1.2
- Repositorio de código Kimodo (NVIDIA): https://github.com/nv-tlabs/kimodo
- Librería de cuantización SDNQ: https://github.com/Disty0/sdnq
- Bloques del pipeline modular: https://huggingface.co/OzzyGT/Kimodo_SOMA_Modular
- Codificador de texto base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Adaptador LLM2Vec MNTP: https://huggingface.co/McGill-NLP/LLM2Vec-Meta-Llama-3-8B-Instruct-mntp
- Adaptador LLM2Vec supervisado: https://huggingface.co/McGill-NLP/LLM2Vec-Meta-Llama-3-8B-Instruct-mntp-supervised
- Código LLM2Vec: https://github.com/McGill-NLP/llm2vec
- Política de uso aceptable de Llama 3: https://llama.meta.com/llama3/use-policy
- Ejemplo de movimiento bf16: https://huggingface.co/datasets/OzzyGT/diffusers-examples/resolve/main/Kimodo_SOMA_Modular/Kimodo_SOMA_RP_v1_2_run_seed42_bf16.mp4
- Ejemplo de movimiento INT8: https://huggingface.co/datasets/OzzyGT/diffusers-examples/resolve/main/Kimodo_SOMA_Modular/Kimodo_SOMA_RP_v1_2_run_seed42_int8.mp4
- Ficheros de licencia del repositorio: LICENSE-KIMODO-WEIGHTS, LICENSE-LLAMA3, LICENSE y NOTICE (en la raíz del repositorio de HuggingFace)

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; las coincidencias obtenidas eran páginas ajenas al proyecto (perfiles de arte y contenidos no relacionados), por lo que no se han utilizado como fuente.
