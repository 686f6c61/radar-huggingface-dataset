# ns2agi/notion-avatar-qwen-image-edit-2509-lora

## Resumen

La ficha describe `ns2agi/notion-avatar-qwen-image-edit-2509-lora`, un adaptador LoRA de rango 16 publicado por North Star (ns2agi) que convierte una fotografía de una persona en un avatar de linea monocromo, en negro sobre blanco, con el estilo visual asociado a Notion. No es un modelo de lenguaje ni un modelo generativo completo: es un adaptador que se carga sobre el modelo base de edicion de imagen `Qwen/Qwen-Image-Edit-2509` y modifica su comportamiento dentro del pipeline `image-to-image` de la libreria `diffusers`.

El adaptador se desarrollo para un caso de uso muy concreto: un stand de feria en el que un plotter de pluma Dobot Magician dibuja el avatar de cada visitante sobre una tarjeta fisica. Esa restriccion de salida, propia de un plotter, explica que el estilo entrenado favorezca trazos cerrados y limpios frente al sombreado o los rellenos solidos. El repositorio ocupa 0,6 GB y se distribuye bajo licencia Apache-2.0, la misma que el modelo base y que el LoRA de aceleracion recomendado.

El interes practico del modelo esta en que resuelve una tarea de estilizacion con identidad preservada (gafas, tocados, barba, maquillaje) sin entrenamiento adicional por parte del usuario, y en que se puede combinar con un LoRA de destilacion de pasos para reducir la inferencia a 8 pasos. La informacion publicada es una model card de autor, sin resultados de benchmarks ni validacion de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de rango 16 sobre el transformer del modelo de difusion Qwen-Image-Edit-2509 |
| Parametros totales | no disponible (no se publica el recuento de parametros del adaptador) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen); entrenado a 512 px de resolucion, inferencia de referencia a 1024 px |
| Tipos de cuantizacion | no se publican variantes cuantizadas del LoRA; pesos en safetensors; entrenamiento con base en fp8 e inferencia de referencia en bf16 |
| Idiomas soportados | en (el prompt de entrenamiento esta en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`e2_real_synth.safetensors`, `e1_real.safetensors`) |
| Modelo base | Qwen/Qwen-Image-Edit-2509 |
| Pipeline | image-to-image |
| Libreria | diffusers |
| Tamano del repositorio | 0,6 GB |
| Rango del LoRA | 16 (solo transformer) |
| Pasos de inferencia | 30 pasos (referencia), 8 pasos combinado con `lightx2v/Qwen-Image-Lightning` |
| Escala CFG verdadera | 4.0 (30 pasos), 1.0 (8 pasos con Lightning) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 aplicado unicamente al transformer del modelo base Qwen-Image-Edit-2509, un modelo de difusion para edicion de imagen. Se entreno a 512 px con `ostris ai-toolkit`, usando AdamW de 8 bits, tasa de aprendizaje 1e-4, tamano de lote 1 y base en fp8. El autor indica que el adaptador renderiza correctamente a 1024 px aunque el entrenamiento se hiciera a 512 px. Existen dos pesos publicados: `e2_real_synth.safetensors` (conjunto completo, 2000 pasos), que es el predeterminado y conserva mejor el parecido y los detalles identificativos; y `e1_real.safetensors` (conjunto temprano reducido, 1200 pasos), de trazo mas ligero y abierto, con menos relleno solido y algo mas barato de plotear.

El grueso del conjunto de entrenamiento son 600 retratos sinteticos generados con RealVisXL 5.0 a partir de prompts con plantilla que cubren edad, ascendencia, cabello, vello facial, gafas, expresion, angulo, ropa, localizacion e iluminacion. Los objetivos (targets) se renderizaron con `gpt-image-2.5-sunburst` usando el prompt de produccion del stand y su hoja de estilo. El conjunto de entrenamiento no se distribuye. El entrenamiento se realizo en septiembre de 2026 sobre una GPU Scaleway L40S. El caption de inferencia es fijo ("Redraw this person as a Notion-style line avatar"), porque el LoRA aprendio el mapeo a partir del par de imagenes y el texto aporta poca informacion adicional. No se documenta uso de RLHF ni DPO, algo que no aplica a este tipo de adaptador.

## Capacidades

- Edicion de imagen image-to-image: transforma una fotografia de una persona en un avatar de linea estilo Notion, en negro sobre blanco.
- Preservacion de identidad y accesorios: mantiene gafas, tocados, barba, hijab, casco, mascarilla y maquillaje intenso segun la model card.
- Robustez de captura: funciona con iluminacion muy baja, perfiles estrictos y encuadres de cabeza y hombros.
- Escala real en escena: dibuja a todas las personas presentes en el encuadre a su escala real, por lo que se recomienda recortar a la cara mas cercana cuando hay varias.
- Sujetos no humanos: un perro se convierte en un perro de linea; un busto de marmol permanece como busto, no se fuerza a una figura humana.
- Composicion de adaptadores: se puede apilar con el LoRA `lightx2v/Qwen-Image-Lightning` para bajar a 8 pasos de inferencia con `true_cfg_scale=1.0`.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso ni procesamiento de audio o video; no es un modelo de lenguaje.
- Capacidad multilingue: no disponible; la model card solo declara ingles para el idioma de trabajo.

## Casos de uso

- Photobooth con plotter de pluma: el flujo del autor captura una foto de webcam, recorta a la cara mas cercana, genera el avatar con 8 pasos y envia el resultado al Dobot Magician, que lo dibuja sobre una tarjeta. El estilo entrenado prioriza trazos cerrados porque el plotter no puede rellenar zonas.
- Avatares para herramientas colaborativas tipo Notion: generar imagenes de perfil homogeneas para equipos, documentacion interna o wikis, partiendo de fotos corporativas y manteniendo un unico estilo grafico.
- Servicio web de avatares bajo demanda: desplegado en Modal con A100 80 GB y escalado a cero tras 15 minutos de inactividad, el coste se concentra en los periodos de uso real, con 12 a 14 segundos por avatar en bf16.
- Merchandising personalizado en eventos: tarjetas, postales o stickers generados en el momento con la imagen del visitante, con un coste de inferencia reducido gracias a los 8 pasos del LoRA Lightning.
- Prototipado rapido de direccion de arte: probar un lenguaje visual de linea limpia sobre retratos reales antes de encargar ilustraciones manuales, usando los dos pesos publicados para comparar un trazo mas denso (e2) frente a uno mas abierto (e1).
- Generacion de material para impresion de bajo detalle: el trazo cerrado y sin sombreado se adapta a serigrafia, sellos, grabado laser o vinilo de corte, donde los degradados no son reproducibles.
- Preservacion de identidad en entornos controlados: la model card reporta buen comportamiento con mascarillas, cascos y maquillaje intenso, lo que permite usarlo en contextos de aforo con equipamiento de proteccion.
- Integracion en pipelines de `diffusers`: al ser un LoRA estandar, se puede cargar con `load_lora_weights` y combinar con otros adaptadores dentro de un flujo Python existente, sin reentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, similitud de identidad, CLIP score ni comparaciones numericas) y solo aporta evaluacion cualitativa mediante una comparacion sintetica de estres.

| Metrica | Valor |
|---|---|
| Benchmarks academicos (MMLU, HumanEval, GSM8K, etc.) | no aplica (modelo de imagen) |
| Metricas de generacion de imagen (FID, CLIP, similitud de identidad) | no disponible |
| Latencia por avatar (A100 80 GB, bf16, Lightning 8 pasos) | 12 a 14 segundos |
| Perdida de calidad 8 pasos frente a 30 pasos | el autor indica que no se aprecia perdida visible |
| Pasos de entrenamiento | 2000 (e2), 1200 (e1) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el unico dato de referencia es el despliegue del autor en A100 de 80 GB en bf16.
- GPU recomendadas: A100 80 GB para el servicio de referencia; Scaleway L40S para el entrenamiento del LoRA. No se documentan otras GPU.
- GPU de consumo: no disponible; la model card no confirma funcionamiento en RTX 4090 u otras GPU de gama consumer, y el modelo base es un modelo de difusion de gran tamano.
- Peso del adaptador: el repositorio completo ocupa 0,6 GB, por lo que el coste de almacenamiento del LoRA es marginal frente al del modelo base.
- Opciones de despliegue: `diffusers` mediante `QwenImageEditPlusPipeline`; despliegue serverless en Modal con el archivo `deploy/modal_avatar.py` del repositorio `North-Star-AGI/magician`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un pipeline de difusion.
- Latencia y throughput: 12 a 14 segundos por avatar en A100 80 GB con el LoRA Lightning a 8 pasos; con la configuracion de 30 pasos y `true_cfg_scale=4.0` la latencia no se especifica.
- Entrenamiento: se realizo con `ai-toolkit`, AdamW de 8 bits, learning rate 1e-4, batch 1 y base en fp8; no se detalla el tiempo total de entrenamiento.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ns2agi/notion-avatar-qwen-image-edit-2509-lora` (e2) | LoRA r16 sobre Qwen-Image-Edit-2509 | no disponible | 512 px entrenamiento, 1024 px inferencia | apache-2.0 | HuggingFace, repo de 0,6 GB, 0 descargas y 0 likes en el momento del registro |
| `ns2agi/notion-avatar-qwen-image-edit-2509-lora` (e1) | LoRA r16 sobre Qwen-Image-Edit-2509 | no disponible | 512 px entrenamiento, 1024 px inferencia | apache-2.0 | Mismo repositorio, archivo alternativo |
| `Qwen/Qwen-Image-Edit-2509` (base, sin LoRA) | Modelo de difusion de edicion de imagen | no disponible | no disponible | apache-2.0 | HuggingFace |
| Otros LoRA de avatares de linea para Qwen-Image-Edit-2509 | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card menciona `gpt-image-2.5-sunburst` como generador de las imagenes objetivo del entrenamiento y una referencia `gpt-image-2.5` en la comparacion visual, pero no aporta parametros, licencia ni resultados numericos de ese modelo, por lo que no se incluye como comparativa cuantitativa.

## Limitaciones y advertencias

- El caption es fijo: el LoRA aprendio el mapeo desde el par de imagenes y el autor indica que otros prompts no aportan valor. No es un adaptador reutilizable para otras tareas de estilizacion.
- Sujetos de cuerpo completo o alejados de la camara salen como figuras pequenas; hay que recortar a la cara antes de la inferencia.
- Con varias personas en el encuadre dibuja a todas a su escala real, lo que puede producir resultados no deseados si no se recorta previamente.
- El estilo esta acotado al lenguaje de linea monocromo tipo Notion; no cubre color, sombreado ni otras esteticas.
- La mayor parte del entrenamiento procede de 600 retratos sinteticos generados con RealVisXL 5.0; los sesgos de ese generador (representacion de edad, ascendencia, fenotipos o iluminacion) pueden trasladarse al resultado.
- Los objetivos de entrenamiento se derivaron de salidas de un servicio de imagen de OpenAI; el autor afirma que los terminos permiten al cliente ese uso, pero la cadena de derechos conviene revisarla antes de un despliegue comercial.
- Riesgo de alucinacion visual: al ser un modelo generativo, puede alterar rasgos faciales o inventar detalles que el sujeto no tiene, lo que es especialmente sensible en avatares que representan personas reales.
- Tratamiento de datos personales: el caso de uso previsto captura imagenes de visitantes en un stand; en el Espacio Economico Europeo seria necesario informar y obtener base juridica para el tratamiento de datos biometricos o de imagen.
- Licencia Apache-2.0: permite uso comercial, modificacion y redistribucion, con la obligacion habitual de conservar avisos de licencia y atribucion. No hay clausulas de uso aceptable adicionales documentadas.
- No se han publicado benchmarks ni evaluaciones de terceros. El repositorio registraba 0 descargas y 0 likes en la fecha de registro, por lo que carece de validacion independiente de la comunidad.
- Dependencia total del modelo base `Qwen/Qwen-Image-Edit-2509`: si cambia la version del pipeline o del transformer, el adaptador puede dejar de ser compatible.
- No hay informacion sobre rendimiento en GPU de consumo, ni sobre cuantizaciones del LoRA ni de la base para reducir VRAM.
- Las fechas de creacion y actualizacion registradas (19 de septiembre de 2026) y la fecha de entrenamiento (septiembre de 2026) figuran asi en la model card y no se han podido contrastar con otras fuentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ns2agi/notion-avatar-qwen-image-edit-2509-lora
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-Edit-2509
- LoRA de aceleracion Lightning: https://huggingface.co/lightx2v/Qwen-Image-Lightning
- Repositorio del autor (archivo de despliegue `deploy/modal_avatar.py`): https://github.com/North-Star-AGI/magician
- Sitio del autor: https://ns2agi.com
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada
