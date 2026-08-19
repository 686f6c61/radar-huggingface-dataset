# Comfy-Org/Boogu-Image

## Resumen

Boogu-Image es un modelo de generacion y edicion de imagenes desarrollado por el equipo de Boogu y redistribuido por Comfy-Org en formato empaquetado para su uso directo en ComfyUI. El repositorio incluye multiples variantes del modelo (base, edit y turbo) en diferentes precisiones (bf16, fp8, int8 y nvfp4), junto con los LoRA correspondientes, un text encoder basado en Qwen3VL-8B y un VAE de Flux. Esta orientado a tareas de generacion de imagenes por texto, edicion de imagenes existentes y generacion rapida (turbo) con pasos reducidos.

La relevancia de este modelo radica en su integracion directa con ComfyUI, lo que permite a desarrolladores y artistas tecnicos desplegarlo sin necesidad de adaptar los pesos. La presencia de variantes turbo y hotfix sugiere un enfoque en velocidad de inferencia y estabilidad en produccion. El repositorio ocupa 250,1 GB, lo que indica un modelo de gran tamano, probablemente en la linea de los modelos de difusion de ultima generacion. La licencia Apache-2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere difusion, probablemente basada en Flux por el VAE incluido) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, fp8_scaled, int8_convrot, nvfp4 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. Sin embargo, la inclusion de un VAE de Flux (flux1_vae_bf16.safetensors) y un text encoder Qwen3VL-8B sugiere que Boogu-Image sigue una arquitectura de difusion multimodal similar a la familia Flux, con un codificador de texto basado en un modelo de lenguaje vision-lenguaje. El repositorio incluye multiples variantes: una version base para generacion, una version edit para edicion de imagenes y una version turbo optimizada para inferencia rapida. Tambien se incluyen archivos hotfix que probablemente corrigen problemas especificos de estabilidad o calidad en la version turbo.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens procesados ni si se utilizaron tecnicas como RLHF o DPO. La existencia de LoRA de rango 128 sugiere que el modelo base puede ser adaptado a tareas especificas mediante fine-tuning eficiente en parametros.

## Capacidades

- Generacion de imagenes a partir de texto (variante base).
- Edicion de imagenes existentes (variante edit).
- Generacion rapida con pasos reducidos (variante turbo).
- Soporte de multiples precisiones de pesos para adaptarse a diferentes hardware.
- Integracion nativa con ComfyUI mediante archivos empaquetados.
- Incluye LoRA para fine-tuning eficiente.
- Text encoder multimodal (Qwen3VL-8B) que sugiere capacidad de entender instrucciones complejas en lenguaje natural.
- VAE de Flux para decodificacion de latentes de alta calidad.

## Casos de uso

- Generacion de imagenes para diseno grafico: el modelo base puede producir imagenes de alta calidad a partir de prompts descriptivos, util para crear conceptos visuales, ilustraciones o material de marketing.
- Edicion fotografica avanzada: la variante edit permite modificar imagenes existentes con instrucciones de texto, como cambiar fondos, eliminar objetos o alterar estilos, sin necesidad de herramientas complejas.
- Prototipado rapido en produccion: la variante turbo, combinada con cuantizacion fp8 o int8, permite generar imagenes en pocos pasos, adecuada para entornos donde la latencia es critica, como generacion en tiempo real o batch processing.
- Fine-tuning para dominios especificos: los LoRA incluidos permiten adaptar el modelo a estilos concretos (por ejemplo, ilustracion tecnica, diseno de producto) con un coste computacional reducido.
- Integracion en pipelines de ComfyUI: los archivos empaquetados facilitan la creacion de flujos de trabajo complejos que combinan generacion, edicion y post-procesado en un unico entorno.
- Investigacion en generacion de imagenes: la disponibilidad de pesos en multiples precisiones y la licencia Apache-2.0 hacen que sea util para experimentos academicos y comparaciones de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible, pero el tamano del repositorio (250,1 GB) y la presencia de pesos bf16 sugieren que la variante completa requiere multiples GPUs de alta gama o una GPU con al menos 80 GB de VRAM.
- GPU recomendadas: no disponible, pero por el tamano y la precision, se espera que funcione en GPUs como A100 (80 GB), H100 (80 GB) o RTX 4090 (24 GB) con cuantizacion fp8 o int8.
- Compatibilidad con consumer GPU: posible con cuantizacion int8 o nvfp4, aunque la VRAM puede ser insuficiente para la variante bf16 completa.
- Opciones de despliegue: ComfyUI es el destino principal; tambien podria usarse con vLLM o TGI si se adaptan los pesos, aunque no esta documentado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos de la misma categoria. La falta de datos sobre parametros, arquitectura y benchmarks impide una comparacion objetiva.

## Limitaciones y advertencias

- No se ha publicado informacion sobre sesgos, alucinaciones o limitaciones de contexto.
- El modelo es de gran tamano (250,1 GB), lo que requiere infraestructura significativa para su despliegue.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los terminos completos de la licencia original del modelo en el repositorio de Boogu.
- No se garantiza la estabilidad de las variantes hotfix; se recomienda probar en un entorno de desarrollo antes de usar en produccion.
- La falta de documentacion sobre el entrenamiento y los datos utilizados limita la capacidad de evaluar su robustez en dominios especializados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Comfy-Org/Boogu-Image
- Repositorio original del modelo: https://huggingface.co/Boogu
