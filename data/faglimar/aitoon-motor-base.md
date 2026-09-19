# Faglimar/aitoon-motor-base

## Resumen

`Faglimar/aitoon-motor-base` no es un modelo entrenado desde cero, sino un paquete de pesos redistribuidos: una seleccion "enxuta" (reducida) de la familia Qwen-Image preparada para ComfyUI y usada por las maquinas de dibujo del estudio AITOON en RunPod bajo el recurso "Cached models". El autor copia, sin ninguna modificacion, archivos publicados por Qwen, Comfy-Org y lightx2v bajo licencia Apache 2.0, organizados en dos ramas (`edicao` y `desenho`) para que cada maquina guarde unos 30 GB en lugar de los aproximadamente 280 GB de los repositorios originales.

El contenido es, por tanto, un bundle de inferencia de generacion y edicion de imagen: modelos de difusion en FP8, el codificador de texto Qwen2.5-VL-7B en FP8 escalado, el VAE de Qwen-Image y, en la rama de edicion, el LoRA Lightning de 4 pasos de lightx2v. Su relevancia es practica y de despliegue, no cientifica: reduce el espacio en disco y simplifica el aprovisionamiento de nodos de inferencia en la nube para flujos de trabajo de ComfyUI.

El repositorio tiene 51,5 GB, licencia Apache-2.0, cero descargas y cero "likes" en el momento de la consulta, y no incluye model card con especificaciones tecnicas de los modelos subyacentes: unicamente la tabla de origen y las huellas SHA-256 de cada archivo. Cualquier dato de arquitectura, numero de parametros o contexto debe consultarse en los repositorios originales de Qwen, no en este.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en el repositorio. Contiene modelos de difusion (`diffusion_models/`), un codificador de texto multimodal (`Qwen2.5-VL-7B`), un VAE y un LoRA; no se documenta la arquitectura interna de cada componente |
| Parametros totales | No disponible (el repositorio no declara el recuento de parametros de ningun componente) |
| Longitud de contexto | No disponible para el codificador de texto ni documentada en este repositorio |
| Tipos de cuantizacion | FP8 mixto (`qwen_image_edit_2511_fp8mixed.safetensors`), FP8 e4m3fn (`qwen_image_fp8_e4m3fn.safetensors`), FP8 escalado para el text encoder (`qwen_2.5_vl_7b_fp8_scaled.safetensors`), BF16 en el LoRA (nombre original `...-bf16.safetensors`) |
| Idiomas soportados | No disponible (la model card esta en portugues y no declara cobertura linguistica) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (todos los archivos) |
| Tamano del repositorio | 51,5 GB |
| Estructura | Dos ramas: `edicao` (edicion de imagen) y `desenho` (generacion de imagen) |
| Componentes de la rama `edicao` | `diffusion_models/qwen_image_edit_2511_fp8mixed.safetensors`, `text_encoders/qwen_2.5_vl_7b_fp8_scaled.safetensors`, `vae/qwen_image_vae.safetensors`, `loras/edit_lightning_4steps.safetensors` |
| Componentes de la rama `desenho` | `diffusion_models/qwen_image_fp8_e4m3fn.safetensors`, `text_encoders/qwen_2.5_vl_7b_fp8_scaled.safetensors`, `vae/qwen_image_vae.safetensors` |
| Integracion | ComfyUI (etiquetas `comfyui`, `qwen-image`, `qwen-image-edit`) |
| Fecha de creacion (metadatos) | 2026-09-18 |
| Ultima actualizacion (metadatos) | 2026-09-18 |

## Arquitectura y entrenamiento

Este repositorio no entrena ni modifica ningun modelo: es una redistribucion byte a byte. La model card afirma explicitamente que cada archivo se copia "sem nenhuma alteracao" y acompana la huella SHA-256 de cada uno para verificarlo. Por tanto, no hay informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset, RLHF, DPO ni innovaciones tecnicas propias en este repositorio.

Lo unico documentado es la cadena de custodia de los cuatro componentes:

- El modelo de difusion de edicion procede de `Comfy-Org/Qwen-Image-Edit_ComfyUI` (original: `Qwen/Qwen-Image-Edit-2511`), licencia Apache-2.0, con huella `c9fdc158…`. Esta en formato fp8 mixto.
- El modelo de difusion de generacion procede de `Comfy-Org/Qwen-Image_ComfyUI` (original: `Qwen/Qwen-Image`), licencia Apache-2.0, huella `98763a12…`, en fp8 e4m3fn.
- El codificador de texto es `Qwen/Qwen2.5-VL-7B-Instruct` en fp8 escalado, huella `cb5636d8…`; es un modelo vision-lenguaje de 7B que aqui se usa como encoder de prompts.
- El LoRA de aceleracion procede de `lightx2v/Qwen-Image-Edit-2511-Lightning`, nombre original `Qwen-Image-Edit-2511-Lightning-4steps-V1.0-bf16.safetensors`, huella `22226e8d…`. Su proposito declarado por el nombre es reducir la edicion a 4 pasos de muestreo, pero este repositorio no aporta curvas de calidad ni comparativas de fidelidad.

Para conocer la arquitectura real (tipo de transformer de difusion, mecanismo de atencion, esquema de condicionamiento de texto e imagen) hay que acudir a los repositorios y publicaciones de Qwen; aqui no se reproduce esa informacion.

## Capacidades

- Generacion de imagen texto-a-imagen mediante la rama `desenho` (`qwen_image_fp8_e4m3fn.safetensors` + VAE).
- Edicion de imagen instruida mediante la rama `edicao` (`qwen_image_edit_2511_fp8mixed.safetensors`), que corresponde a Qwen-Image-Edit-2511.
- Edicion acelerada en 4 pasos de muestreo gracias al LoRA `edit_lightning_4steps.safetensors`, lo que reduce el coste de inferencia por iteracion segun la intencion del autor del LoRA.
- Codificacion de prompts con un modelo vision-lenguaje (Qwen2.5-VL-7B), lo que permite condiciones de entrada multimodales segun las capacidades del encoder original.
- Integracion directa en flujos de ComfyUI: los archivos estan organizados en las carpetas esperadas (`diffusion_models/`, `text_encoders/`, `vae/`, `loras/`).
- Reutilizacion de componentes entre ramas: el text encoder y el VAE son compartidos por generacion y edicion.
- No se documentan en este repositorio capacidades de tool calling, function calling, agentes, razonamiento multi-paso, audio ni thinking mode; el unico componente linguistico es el encoder, orientado a condicionar la difusion.

## Casos de uso

- Aprovisionamiento de nodos de inferencia en la nube: el paquete esta pensado para el recurso "Cached models" de RunPod, de modo que cada maquina descarga una sola vez unos 30 GB por rama en lugar de replicar los aproximadamente 280 GB de los repositorios originales. Es el caso de uso explicito del autor.
- Generacion de imagen por lotes en un estudio: la rama `desenho` permite producir ilustraciones a partir de prompts de texto dentro de un grafo de ComfyUI, con los pesos ya en FP8 para reducir el coste de VRAM frente a BF16.
- Retoque y edicion de imagen dirigida: la rama `edicao` carga Qwen-Image-Edit-2511 para modificar imágenes existentes por instruccion, util en retoque de producto, correccion de fondos o variaciones de una referencia.
- Iteracion rapida en previsualizacion: el LoRA Lightning de 4 pasos permite obtener borradores en pocos pasos de muestreo antes de lanzar una generacion final de mayor calidad, lo que acelera la exploracion de prompts.
- Pipelines reproducibles y auditables: al incluir huellas SHA-256 de cada archivo y la tabla de procedencia, el paquete sirve como base para fijar versiones exactas de pesos en un entorno de produccion y verificar que no han sido alterados.
- Estandarizacion entre varias maquinas de dibujo: al compartir el mismo text encoder y VAE entre ramas, un estudio puede desplegar un unico cache comun y cambiar solo el modelo de difusion segun el tipo de trabajo (generacion o edicion).
- Formacion y prototipado interno: un equipo puede montar un entorno ComfyUI funcional con Qwen-Image sin tener que navegar por los repositorios originales ni decidir que archivos son necesarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad de imagen (FID, CLIP score, preferencia humana), ni comparativas con otros modelos, ni mediciones de latencia o throughput. Tampoco los resultados de busqueda web aportaron informacion relevante sobre este repositorio: las coincidencias devueltas correspondian a listados de productos no relacionados (grapadoras de oficina), por lo que no se ha podido verificar ningun dato externo.

## Requisitos de hardware

- VRAM estimada: no publicada. A partir del tamano declarado (unos 30 GB por rama frente a 51,5 GB de repositorio completo), cargar simultaneamente el modelo de difusion en FP8, el text encoder de 7B en FP8 y el VAE requiere del orden de 25-30 GB de VRAM. Son estimaciones derivadas del tamano de los archivos, no cifras oficiales.
- Compatibilidad FP8: los formatos `fp8_e4m3fn`, `fp8 mixto` y `fp8 escalado` se ejecutan con soporte nativo en GPUs Ada (RTX 40xx, L40S) y Hopper (H100); en generaciones anteriores la ejecucion depende de la ruta de emulacion o deconversion de la herramienta de inferencia.
- GPU recomendadas: A100 40/80 GB, H100 80 GB y L40S 48 GB para mantener todos los componentes residentes en memoria. En GPUs de 24 GB (RTX 4090, RTX 3090) es viable solo con carga y descarga secuencial de modulos (offloading), lo que penaliza la latencia.
- Cabe en GPU de consumo: si, con matices. Una RTX 4090 o 3090 de 24 GB puede ejecutar el flujo si ComfyUI descarga el text encoder o el modelo de difusion a RAM entre etapas; no cabe todo residente a la vez.
- Opciones de despliegue: el paquete esta disenado para ComfyUI (es el unico entorno mencionado por el autor). No se documenta soporte oficial para vLLM, TGI, llama.cpp ni Ollama, que ademas no son adecuados para modelos de difusion de imagen.
- Latencia y throughput: no disponibles. El unico indicio es que el LoRA Lightning reduce la edicion a 4 pasos de muestreo, pero no se aportan tiempos medidos.

## Comparativa con modelos similares

| Repositorio | Contenido | Formato | Tamano | Licencia | Proposito |
|---|---|---|---|---|---|
| `Faglimar/aitoon-motor-base` | Subconjunto curado de Qwen-Image + Qwen-Image-Edit + text encoder + VAE + LoRA, en dos ramas | Safetensors | 51,5 GB (aprox. 30 GB por rama) | Apache-2.0 | Cache ligera para ComfyUI en RunPod |
| `Comfy-Org/Qwen-Image_ComfyUI` | Conversion oficial de Qwen-Image para ComfyUI | Safetensors | No disponible en la informacion consultada | Apache-2.0 | Fuente original de la rama `desenho` |
| `Comfy-Org/Qwen-Image-Edit_ComfyUI` | Conversion oficial de Qwen-Image-Edit para ComfyUI | Safetensors | No disponible | Apache-2.0 | Fuente original de la rama `edicao` |
| `Qwen/Qwen-Image` y `Qwen/Qwen-Image-Edit-2511` | Repositorios canonicos de los modelos de difusion | No disponible | Conjunto de repos originales: aprox. 280 GB segun el autor | Apache-2.0 | Publicacion original |
| `lightx2v/Qwen-Image-Edit-2511-Lightning` | LoRA de aceleracion a 4 pasos | Safetensors (BF16) | No disponible | Apache-2.0 | Aceleracion del muestreo en edicion |

No se dispone de datos de rendimiento comparado entre estas opciones: la comparativa es de procedencia, formato y tamano, no de calidad.

## Limitaciones y advertencias

- No es un modelo original: es una copia redistribuida. Cualquier problema de calidad, sesgo o seguridad proviene de los modelos de Qwen, Comfy-Org y lightx2v, no del autor del paquete.
- Cero adopcion registrada: 0 descargas y 0 "likes" en el momento de la consulta, sin issues ni discusion publica que permitan validar la integridad o el funcionamiento del paquete.
- Fechas de metadatos anomalas: la creacion y la actualizacion figuran como 2026-09-18, lo que resulta incoherente y sugiere metadatos incorrectos o generados de forma automatica.
- Ausencia de model card tecnica: no hay numero de parametros, contexto, idiomas, resoluciones soportadas, ni instrucciones de uso; la model card se limita a la tabla de procedencia y licencias.
- Verificacion de integridad manual: aunque se publican huellas SHA-256, el usuario debe comprobarlas por su cuenta antes de confiar en el paquete para produccion.
- Riesgo de sesgo y de contenido inapropiado: heredado de los modelos de difusion subyacentes. No se documenta ningun filtro, evaluacion de seguridad ni mitigacion en este repositorio.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar detalles plausibles pero incorrectos (texto en imagenes, anatomias, logotipos) sin ninguna indicacion de incertidumbre.
- Limitaciones de idioma: el encoder es Qwen2.5-VL-7B, con la cobertura linguistica de ese modelo, pero este repositorio no la declara. No hay garantia documentada sobre el comportamiento con prompts en castellano.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe conservar el archivo `LICENSE` y el reconocimiento a Qwen, Comfy-Org y lightx2v que el propio autor exige explicitamente. Conviene revisar tambien los terminos de los repositorios de origen, por si anaden condiciones adicionales.
- Dependencia de ComfyUI: no hay soporte documentado para otros motores de inferencia, lo que limita la portabilidad del paquete.
- Consumo de disco y VRAM elevados para un "paquete ligero": 51,5 GB de repositorio y varios decenas de GB de VRAM en carga completa siguen siendo requisitos de gama alta.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Faglimar/aitoon-motor-base
- Origen del modelo de edicion (ComfyUI): https://huggingface.co/Comfy-Org/Qwen-Image-Edit_ComfyUI
- Modelo original de edicion: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Origen de los pesos de generacion y del text encoder (ComfyUI): https://huggingface.co/Comfy-Org/Qwen-Image_ComfyUI
- Modelo original de generacion: https://huggingface.co/Qwen/Qwen-Image
- Codificador de texto original: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- LoRA Lightning de 4 pasos: https://huggingface.co/lightx2v/Qwen-Image-Edit-2511-Lightning
- Resultados de busqueda web: no se encontro informacion relevante sobre este repositorio; las coincidencias devueltas no guardaban relacion con el modelo.
