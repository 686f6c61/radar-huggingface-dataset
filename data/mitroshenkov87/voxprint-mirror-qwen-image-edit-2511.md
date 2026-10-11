# Mitroshenkov87/voxprint-mirror-qwen-image-edit-2511

## Resumen

voxprint-mirror-qwen-image-edit-2511 es una version cuantizada en FP8 del modelo de edicion de imagen Qwen/Qwen-Image-Edit-2511, publicada por el usuario Mitroshenkov87 (Voxprint) bajo licencia Apache-2.0. No es un fine-tune ni una ablacion: se trata exclusivamente de una conversion de tipo de dato (dtype conversion) de los pesos del modelo base a float8_e4m3fn, con escalas BF16 por tensor, dentro del formato de metadatos safetensors denominado voxprint-fp8-v1.

El modelo se distribuye como un pipeline de difusion image-to-image para diffusers (QwenImageEditPlusPipeline) que combina un transformador de edicion (edit-transformer) con un codificador de texto Qwen2.5-VL-7B. El repositorio ocupa 46,8 GB y esta etiquetado unicamente para ingles. Su proposito es servir los pesos de Qwen-Image-Edit-2511 en un formato de almacenamiento FP8 mas compacto para la Voxprint AI Media Suite (Voxprint AI Canvas), que los carga para generacion texto-a-imagen e imagen-a-imagen.

Su relevancia es limitada y muy especifica: es un artefacto de infraestructura (formato de pesos) mas que un modelo nuevo, no aporta mejoras de calidad declaradas, no incluye datos de calibracion y, en GPU A100, los pesos FP8 se de-cuantizan a BF16 antes de la multiplicacion de matrices, por lo que el FP8 actua como formato de almacenamiento y no como aceleracion por tensor cores. A fecha de publicacion no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion transformer (DiT) para edicion de imagen, con codificador de texto Qwen2.5-VL-7B |
| Parametros totales | no disponible en la informacion proporcionada |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (modelo de imagen; resolucion de trabajo evaluada: 1024 px) |
| Tipos de cuantizacion | FP8 float8_e4m3fn con escala BF16 por tensor (amax/448); embeddings, norms, adaLN, proj_out, img_in y txt_in permanecen en BF16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (metadatos voxprint-fp8-v1) |

## Arquitectura y entrenamiento

El modelo es un pipeline de edicion de imagen basado en un transformador de difusion con codificador de texto Qwen2.5-VL-7B, empaquetado para la libreria diffusers mediante QwenImageEditPlusPipeline. Los nombres de capa citados en la model card (img_in, txt_in, normas, adaLN y proj_out) corresponden a los componentes tipicos de un DiT con condicionamiento por texto mediante adaLN. El codificador de texto se publica como un fichero FP8 independiente (qwen2.5-vl-7b-text-encoder-fp8.safetensors).

No hubo entrenamiento ni ajuste: la model card indica explicitamente "Dtype conversion only" y "No calibration set and no training". Los pesos lineales se almacenan como float8_e4m3fn con una escala BF16 por tensor calculada como amax/448 bajo el formato voxprint-fp8-v1. Los embeddings, normas y las capas indicadas en la tarea permanecen en BF16. La herramienta declarada para el proceso es torchao, y se aclara que este artefacto no es una ablacion ni un fine-tune.

## Capacidades

- Edicion de imagen a imagen (image-to-image): el pipeline transforma una imagen de entrada segun una instruccion en lenguaje natural.
- Generacion texto-a-imagen e imagen-a-imagen a traves de Voxprint AI Canvas, segun indica la model card.
- Condicionamiento por texto en ingles mediante el codificador Qwen2.5-VL-7B.
- Compatibilidad con diffusers mediante QwenImageEditPlusPipeline.
- No se declaran capacidades de tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje generativo).
- No se declaran capacidades de audio, video ni thinking mode.
- Soporte multilingue: no disponible (la ficha solo lista ingles).

## Casos de uso

- Edicion de imagenes por instruccion en ingles: el pipeline recibe una imagen y una indicacion textual y aplica la modificacion solicitada, con resolucion de trabajo de 1024 px segun la configuracion de evaluacion.
- Integracion en suites de creacion multimedia: Voxprint AI Canvas carga estos pesos para generacion y edicion de imagen, seleccionando el nivel (tier) mediante las indicaciones de VRAM de su documento MODELS.md.
- Pruebas de cuantizacion en pipelines de difusion: util para comparar el comportamiento de un transformador de edicion servido en FP8 frente a su version BF16 usando LPIPS y CLIP-I.
- Despliegue en entornos con almacenamiento reducido: al tratarse de un formato FP8, reduce el espacio en disco frente a los pesos en BF16, aunque en A100 no acelere el computo.
- Reproduccion de evaluaciones de edicion: permite replicar el protocolo descrito (8 pares de edicion, 1 semilla, 40 pasos, true CFG 4.0, 1024 px) para verificar la decision de publicacion FP8/BF16 por componente.
- Base para pipelines de edicion condicionada por texto: al integrarse en diffusers, puede incorporarse a flujos que ya usen QwenImageEditPlusPipeline.

## Benchmarks y rendimiento

Se han publicado metricas de evaluacion propias (LPIPS y CLIP-I) para los dos componentes. No se han publicado resultados de benchmarks estandar tipo MMLU o HumanEval, dado que no es un modelo de lenguaje.

| Componente | Metrica | Valor | Decision |
|---|---|---|---|
| edit-transformer | LPIPS | 0,080351026088465 | fp8 |
| edit-transformer | CLIP-I | 0,97634007781744 | fp8 |
| qwen2.5-vl-encoder | LPIPS | 0,0543903210782446 | fp8 |
| qwen2.5-vl-encoder | CLIP-I | 0,989222414791584 | fp8 |

Configuracion de evaluacion: 8 pares de edicion x 1 semilla (evaluacion recortada), 40 pasos, true CFG 4.0, 1024 px. El codificador se volvio a probar con los 197 tensores FP8 aplicados. No se ofrecen cifras comparativas frente a la version BF16 del modelo base.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repositorio ocupa 46,8 GB, por lo que cargar transformador y codificador de texto requiere un rango de VRAM alto (aproximadamente decenas de GB), sin cifra confirmada por el autor.
- GPU de referencia citada: A100. La model card senala que la A100 no dispone de tensor cores para FP8, de modo que los pesos se de-cuantizan a BF16 antes de la multiplicacion de matrices.
- GPU recomendadas: no disponibles de forma explicita; por el tamano del repositorio (46,8 GB) se situa en la clase de A100/H100 con memoria amplia.
- GPU de consumo: no se confirma compatibilidad. Tarjetas de 24 GB (por ejemplo RTX 4090) resultan insuficientes para cargar la totalidad del pipeline tal como se publica, segun el tamano del repositorio.
- Opciones de despliegue: diffusers (QwenImageEditPlusPipeline) y Voxprint AI Canvas. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo de difusion.
- Latencia y throughput: no disponibles. La evaluacion uso 40 pasos con true CFG 4.0 a 1024 px, valores que pueden servir como referencia de configuracion, no de rendimiento medido.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion / contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Mitroshenkov87/voxprint-mirror-qwen-image-edit-2511 | no disponible | 1024 px (evaluacion) | Apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen-Image-Edit-2511 (modelo base, BF16) | no disponible | 1024 px | Apache-2.0 | HuggingFace |

Solo se dispone del modelo base como termino de comparacion directo en la informacion proporcionada. No se dispone de datos de benchmarks comunes entre ambas versiones (FP8 frente a BF16) para establecer diferencias de calidad cuantificadas. Otros modelos comparables de edicion de imagen: no disponible.

## Limitaciones y advertencias

- No es un modelo nuevo ni un ajuste: es una conversion de tipo de dato; no se declara ninguna mejora de calidad respecto al modelo base.
- Ausencia total de calibracion: la model card indica que no se uso conjunto de calibracion ni entrenamiento.
- En A100 el FP8 no aporta aceleracion: los pesos se de-cuantizan a BF16 antes de la multiplicacion, por lo que el FP8 funciona como formato de almacenamiento.
- Publicacion condicionada por umbrales: un componente que no supera su umbral de LPIPS o CLIP se publica en BF16, de modo que la composicion real del repositorio puede variar por componente.
- Idioma: solo ingles declarado; el rendimiento en otros idiomas no esta documentado.
- No es un filtro de seguridad: la propia model card advierte que la tarjeta no constituye un filtro de seguridad.
- Riesgos de sesgo y alucinacion visual: no documentados especificamente para esta conversion, pero heredables del modelo base Qwen-Image-Edit-2511.
- Evaluacion muy reducida: 8 pares de edicion con una sola semilla (evaluacion recortada), lo que limita la significacion estadistica de las metricas publicadas.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta.
- Motores TensorRT: no forman parte de esta tarea.
- Licencia: Apache-2.0, igual que el modelo base, lo que permite uso comercial sujeto a los terminos de dicha licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mitroshenkov87/voxprint-mirror-qwen-image-edit-2511
- Modelo base Qwen/Qwen-Image-Edit-2511: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Repositorio Voxprint AI Canvas: https://github.com/Mitroshenkov87/voxprint-canvas
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
