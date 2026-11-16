# AcademiaSD/Qwen-Image-2512-NF4-for-LoRA-Training

## Resumen

Qwen-Image-2512-NF4-for-LoRA-Training es un paquete de pesos pre-cuantizados en NF4 de los modelos de generacion de imagen Qwen-Image-2512 y Qwen-Image-Edit-2511, publicado por AcademiaSD. No es un modelo nuevo ni un fine-tune: es una redistribucion de los transformers originales de Qwen convertidos a NF4 (4 bits con normalizacion por bloques) para reducir el coste de memoria durante el entrenamiento de adaptadores LoRA con bitsandbytes. El paquete lo consume directamente el entrenador de AcademiaSD LoRAlab Trainer Studio, que descarga unicamente las carpetas necesarias.

El repositorio incluye dos transformers (el de generacion texto-a-imagen y el de edicion), el codificador de texto Qwen2.5-VL-7B en tres precisiones (NF4, INT8 y BF16), el VAE, scheduler, tokenizer y processor sin modificar, y un conjunto de LoRAs Lightning de 4 pasos de lightx2v para previsualizaciones rapidas durante el entrenamiento. El tamano total del repositorio es de 54,7 GB, coherente con la suma de los distintos componentes en varias precisiones.

Su relevancia es practica: permite ajustar LoRAs sobre Qwen-Image en GPUs con menos VRAM de la que exigiria el modelo en BF16, sin necesidad de convertir los pesos manualmente. El autor advierte explicitamente de que estos ficheros son para entrenamiento con bitsandbytes y que para inferencia deben usarse los modelos originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (Qwen-Image); codificador de texto Qwen2.5-VL-7B |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 (transformer principal y transformer de edicion; bloque 0 `img_mod` en BF16); codificador de texto en NF4, INT8 y BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

El paquete contiene los transformers de Qwen-Image-2512 (generacion texto-a-imagen) y Qwen-Image-Edit-2511 (edicion de imagen) convertidos a NF4 con cuantizacion por bloques. El unico componente que se mantiene en BF16 es el bloque 0 `img_mod` del transformer, presumiblemente por sensibilidad numerica en esa capa. El codificador de texto es Qwen2.5-VL-7B, distribuido en tres precisiones porque solo se usa en la fase de Pre-Cache del entrenador. El VAE, scheduler, tokenizer y processor se copian sin cambios de los repositorios originales.

No se trata de un modelo entrenado desde cero ni de un fine-tune: no hay datos de entrenamiento, tokens procesados ni etapas de RLHF/DPO asociadas a este repositorio. La unica transformacion aplicada es la cuantizacion NF4 realizada por AcademiaSD sobre los pesos Apache 2.0 de Qwen. Se incluyen ademas LoRAs Lightning de 4 pasos de lightx2v, pensados para generar previsualizaciones rapidas durante el entrenamiento de LoRA.

## Capacidades

- Generacion de imagen texto-a-imagen mediante el transformer Qwen-Image-2512.
- Edicion de imagen mediante el transformer Qwen-Image-Edit-2511.
- Entrenamiento de adaptadores LoRA sobre ambos transformers usando bitsandbytes en 4 bits.
- Pre-Cache de latentes y embeddings con el codificador de texto Qwen2.5-VL-7B en NF4, INT8 o BF16.
- Previsualizacion rapida durante el entrenamiento gracias a los LoRAs Lightning de 4 pasos.
- No esta pensado para inferencia directa: el autor recomienda usar los modelos originales para ese fin.

## Casos de uso

- Entrenamiento de LoRAs de estilo sobre Qwen-Image en GPUs de consumo: el transformer en NF4 reduce la huella de memoria frente a BF16, lo que permite ajustar adaptadores en hardware mas modesto usando el trainer de AcademiaSD.
- Entrenamiento de LoRAs de edicion sobre Qwen-Image-Edit-2511: la carpeta `transformer_edit/` ofrece el transformer de edicion ya cuantizado para el mismo flujo de entrenamiento.
- Pipelines de investigacion sobre personalizacion de modelos de difusion: permite experimentar con LoRAs sin descargar ni convertir manualmente los pesos completos en BF16.
- Previsualizacion rapida de checkpoints intermedios: los LoRAs Lightning de 4 pasos permiten generar muestras durante el entrenamiento con pocos pasos de inferencia.
- Reproducibilidad de entrenamientos: al fijar una version concreta de pesos cuantizados, se reduce la variabilidad entre ejecuciones y maquinas.
- Integracion con LoRAlab Trainer Studio: el repositorio esta disenado para que el trainer descargue solo las carpetas que necesita, simplificando el despliegue en entornos de entrenamiento.
- Evaluacion comparativa de precisiones del codificador de texto: disponer de NF4, INT8 y BF16 permite medir el impacto de la precision en la calidad del Pre-Cache.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El repositorio ocupa 54,7 GB en disco, pero incluye varias precisiones del codificador de texto y los dos transformers, por lo que la VRAM necesaria en entrenamiento es inferior a esa cifra; el trainer descarga solo las carpetas requeridas.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el objetivo declarado del paquete NF4 es facilitar el entrenamiento de LoRA, lo que sugiere que cabe en GPUs consumer de gama alta, pero no se especifica cuales.
- Opciones de despliegue: entrenamiento con bitsandbytes a traves de AcademiaSD LoRAlab Trainer Studio. Para inferencia, los modelos originales Qwen-Image-2512 y Qwen-Image-Edit-2511 con diffusers.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Uso previsto |
|---|---|---|---|---|---|
| AcademiaSD/Qwen-Image-2512-NF4-for-LoRA-Training | no disponible | no disponible | NF4, INT8, BF16 (segun componente) | Apache 2.0 | Entrenamiento de LoRA |
| Qwen/Qwen-Image-2512 | no disponible | no disponible | BF16 (original) | Apache 2.0 | Inferencia texto-a-imagen |
| Qwen/Qwen-Image-Edit-2511 | no disponible | no disponible | BF16 (original) | Apache 2.0 | Inferencia de edicion de imagen |
| lightx2v/Qwen-Image-2512-Lightning | no disponible | no disponible | no disponible | Apache 2.0 | Inferencia acelerada (4 pasos) |

La comparativa se limita a los modelos referenciados en la model card; no se dispone de datos de parametros ni contexto de ninguno de ellos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo para inferencia: el autor indica explicitamente que para generar imagenes deben usarse los modelos originales.
- La cuantizacion NF4 puede introducir degradacion numerica respecto a BF16; el impacto en la calidad del LoRA entrenado no esta cuantificado en la informacion disponible.
- Dependencia de bitsandbytes y del ecosistema diffusers para cargar los pesos.
- El repositorio mezcla varias precisiones del codificador de texto; elegir la adecuada requiere conocer el flujo del trainer.
- No se documentan sesgos, idiomas soportados ni evaluaciones de calidad del modelo base en esta ficha.
- Licencia Apache 2.0 heredada de los modelos originales, lo que permite uso comercial, pero conviene verificar las condiciones de los componentes de terceros (lightx2v) por separado.
- Al ser una redistribucion de pesos ajenos, la trazabilidad de cambios depende del autor del repositorio (AcademiaSD) y no del equipo de Qwen.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AcademiaSD/Qwen-Image-2512-NF4-for-LoRA-Training
- Modelo base texto-a-imagen: https://huggingface.co/Qwen/Qwen-Image-2512
- Modelo base de edicion: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- LoRAs Lightning (generacion): https://huggingface.co/lightx2v/Qwen-Image-2512-Lightning
- LoRAs Lightning (edicion): https://huggingface.co/lightx2v/Qwen-Image-Edit-2511-Lightning
- Entrenador AcademiaSD LoRAlab Trainer Studio: https://github.com/AcademiaSD/AcademiaSD_LoRAlab-Trainer
