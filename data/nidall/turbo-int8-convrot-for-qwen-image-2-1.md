# NidAll/Turbo-INT8-ConvRot-for-Qwen-Image-2.1

## Resumen

Turbo INT8 ConvRot for Qwen-Image-2.1 es una cuantización de comunidad, en formato INT8 con rotación (ConvRot), del transformer de difusión de Qwen/Qwen-Image-2.1-Turbo. Lo publica el usuario NidAll y no es un fine-tune ni una LoRA de aceleración, sino un derivado cuantizado del checkpoint oficial. El objetivo es reducir el peso y los requisitos de memoria del transformer manteniendo la precisión suficiente para generar imágenes con la ruta de condicionamiento nativa de Qwen-Image-2.1.

El artefacto contiene únicamente el transformer de difusión; el text encoder y el VAE deben aportarse por separado. La cuantización se aplica sobre 224 matrices de pesos de atención y MLP repartidas en 32 bloques del transformer, mientras que las proyecciones de entrada/salida, el condicionamiento de texto, la modulación de timestep/shared y las normalizaciones se mantienen en la precisión del origen.

Su relevancia es práctica: permite ejecutar el modelo Turbo de Qwen-Image-2.1 en ComfyUI con un único fichero safetensors de 7,3 GB y un muestreo de solo ocho pasos con CFG 1, sin necesidad de una LoRA de aceleración. La contrapartida es que se trata de un derivado no oficial, con licencia de investigación y con validación funcional muy limitada (un único ejemplo confirmado).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (componente `transformer` de Qwen-Image-2.1-Turbo), 32 bloques |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (modelo de generacion de imagen, no texto) |
| Tipos de cuantizacion | INT8 tensorwise con `convrot: true` y `convrot_groupsize: 256`; rotacion FP32 butterfly; umbral de reconstruccion de pesos de 0,02 L2 relativo |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (etiquetada como `other`, uso no comercial de investigacion/evaluacion) |
| Formato de pesos | safetensors (formato nativo de ComfyUI `int8_tensorwise`) |

## Arquitectura y entrenamiento

El modelo base es Qwen-Image-2.1-Turbo, un modelo de difusion para generacion y edicion de imagenes. Este artefacto sustituye unicamente el transformer de difusion por su version cuantizada. La conversion se hizo con la herramienta ComfyUI Native Quantizer sobre la revision `0da70ce2c362350e8a43fdd163a371783fe6228a`, a partir de los dos shards oficiales en BF16 del componente `transformer`. Se cuantizaron 224 matrices de pesos de atencion y MLP en 32 bloques; las proyecciones de entrada y salida, el condicionamiento de texto, la modulacion de timestep/shared y las normalizaciones conservan la precision de origen. La rotacion se realiza en FP32 mediante mariposa (butterfly) y el umbral de reconstruccion de pesos por capa es de 0,02 L2 relativo.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni sobre fases de RLHF/DPO, ya que no se trata de un modelo entrenado desde cero sino de una conversion de precision de un checkpoint existente. La innovacion tecnica reseñable es el esquema ConvRot (INT8 con rotacion), pensado para reducir el error de cuantizacion en las matrices de atencion y MLP, junto con el hecho de que el checkpoint Turbo funciona con un calendario de ocho pasos y CFG 1 sin LoRA de aceleracion adicional.

## Capacidades

- Generacion de imagenes texto-a-imagen mediante la ruta nativa de Qwen-Image-2.1 en ComfyUI.
- Integracion en el nodo Load Diffusion Model con `weight_dtype: default`.
- Muestreo reducido: ocho pasos de denoising con muestreador Euler, CFG 1 y el calendario ManualSigmas oficial.
- Edicion de imagen mediante la ruta de condicionamiento por imagen de referencia de Qwen-Image-2.1 (soportada en teoria por la arquitectura, pero no probada en este artefacto).
- Compatibilidad con text encoders y VAE de Qwen-Image-2.1 aportados por separado.
- No incluye el text encoder ni el VAE; no es cargable directamente con `from_pretrained` de Diffusers.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso ni audio, por tratarse de un modelo de generacion de imagen.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Generacion de imagenes en ComfyUI con VRAM ajustada: al almacenar el transformer en INT8 (7,3 GB), reduce el espacio en disco y en memoria frente a los shards BF16, lo que facilita ejecutarlo en equipos con GPU de gama alta consumer.
- Flujos de trabajo de texto-a-imagen de ocho pasos: con Euler, CFG 1 y el calendario ManualSigmas oficial se obtiene una imagen en muy pocos pasos, adecuado para iteracion rapida en prototipado visual.
- Pruebas de investigacion sobre cuantizacion: sirve para evaluar la perdida de calidad de un esquema INT8 ConvRot frente al checkpoint BF16 de referencia en tareas de generacion.
- Ilustracion y composicion de escenas con texto legible: la unica validacion funcional reportada es un prompt ilustrado tipo receta con etiquetas legibles y composicion coherente a 1024 x 1024.
- Experimentacion con edicion de imagen: la ruta de condicionamiento por imagen de referencia esta disponible en la arquitectura Qwen-Image-2.1, aunque el autor advierte que la edicion no se ha probado en este artefacto.
- Entornos de investigacion con licencia no comercial: encaja en proyectos academicos o de evaluacion que no requieran licencia comercial, dado que la licencia qwen-research lo permite en ese ambito.
- Comparativas controladas de memoria y latencia: util como checkpoint de referencia para medir el ahorro de memoria del INT8, aunque el autor no ha establecido cifras de latencia ni de pico de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se ha realizado una comparacion de calidad controlada con BF16 y que la perdida por cuantizacion, la cobertura amplia de prompts, la calidad de edicion, la compatibilidad con LoRA, la latencia y el pico de memoria no se han establecido.

La unica evidencia funcional reportada es un unico resultado de texto-a-imagen a 1024 x 1024 generado con Euler, el calendario oficial, CFG 1, un text encoder W4A8 y atencion Comfy Kitchen, con un prompt ilustrado de receta que produjo etiquetas legibles y una composicion coherente.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint del transformer ocupa 7,3 GB en disco en INT8. La inferencia completa requiere ademas el text encoder y el VAE de Qwen-Image-2.1, por lo que el consumo conjunto sera superior a esos 7,3 GB. No hay cifra oficial de pico de memoria (el autor declara que no se ha establecido).
- GPU recomendadas: no disponibles de forma oficial. Por el tamano del artefacto, encaja previsiblemente en GPUs de 24 GB como RTX 3090 o RTX 4090; en GPUs de 12-16 GB depende del text encoder y del VAE empleados.
- Cabe en GPU consumer: probablemente si, en modelos de 24 GB, segun el peso del transformer en INT8; no confirmado por el autor.
- Opciones de despliegue: ComfyUI, con el fichero `qwen-image-2.1-turbo-int8-convrot.safetensors` en `ComfyUI/models/diffusion_models/` y un nodo Load Diffusion Model con `weight_dtype: default`. Se requiere una version de ComfyUI que soporte Qwen-Image-2.1 e INT8 ConvRot nativo.
- Carga en Diffusers: no soportada; el artefacto de fichero unico esta pensado para ComfyUI.
- Latencia y throughput: no disponibles; no establecidos por el autor.

## Comparativa con modelos similares

| Modelo | Naturaleza | Precision | Tamano en disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NidAll/Turbo-INT8-ConvRot-for-Qwen-Image-2.1 | Cuantizacion INT8 ConvRot del transformer | INT8 tensorwise (grupo 256) | 7,3 GB | qwen-research | HuggingFace, solo transformer, para ComfyUI |
| Qwen/Qwen-Image-2.1-Turbo (modelo base) | Modelo original | BF16 (dos shards del transformer) | no disponible | Qwen Research License | HuggingFace, checkpoint oficial completo |
| Otras cuantizaciones de Qwen-Image-2.1 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Es un derivado cuantizado no oficial, no un lanzamiento de Qwen ni un fine-tune; el autor lo indica de forma explicita.
- La licencia qwen-research permite uso no comercial de investigacion y evaluacion; el uso comercial requiere una licencia aparte del licenciante original.
- No incluye text encoder ni VAE; hay que aportarlos por separado y compatibles con Qwen-Image-2.1.
- La perdida por cuantizacion no se ha medido frente a BF16; se desconoce el impacto real en la calidad.
- La cobertura de prompts no esta establecida: solo hay un ejemplo funcional confirmado.
- La edicion de imagen no se ha probado en este artefacto, aunque la ruta de condicionamiento por imagen de referencia existe en la arquitectura.
- La compatibilidad con LoRA no esta establecida.
- La latencia y el pico de memoria no estan medidos.
- El flag `runtime_verified` en el momento de la conversion permanece en falso; la evidencia de ejecucion es el ejemplo de generacion externo al proceso de conversion.
- El calendario de muestreo es critico: los planificadores con nombre estandar no reproducen el calendario oficial; hay que usar ManualSigmas con los valores indicados y no aplicar un desplazamiento temporal adicional.
- No se puede cargar directamente con `from_pretrained` de Diffusers.
- Riesgo de sesgos y de alucinacion visual: no documentado en la informacion disponible; aplican los sesgos propios del modelo base, no detallados aqui.
- Limitaciones de idioma: no disponibles.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/NidAll/Turbo-INT8-ConvRot-for-Qwen-Image-2.1
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Revision de origen del base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo/blob/0da70ce2c362350e8a43fdd163a371783fe6228a/model_index.json
- Configuracion del planificador Turbo: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo/blob/0da70ce2c362350e8a43fdd163a371783fe6228a/scheduler/scheduler_config.json
- Herramienta de conversion (ComfyUI Native Quantizer): https://github.com/NidAll/comfyui-native-quantizer
- Licencia del modelo base: LICENSE (incluida en el repositorio del base) y NOTICE para atribucion y detalles de modificacion
