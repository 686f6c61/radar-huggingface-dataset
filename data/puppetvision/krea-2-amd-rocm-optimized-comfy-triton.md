# PuppetVision/krea-2-amd-rocm-optimized-comfy-triton

## Resumen

PuppetVision/krea-2-amd-rocm-optimized-comfy-triton es una redistribución cuantizada en INT8 tensorwise del modelo de difusión Krea-2-Turbo, empaquetada específicamente para ComfyUI sobre GPUs AMD con ROCm. El repositorio, de 33,1 GB, contiene los checkpoints del modelo de difusión y del codificador de texto (Qwen3-VL INT8) más las instrucciones de configuración que el autor denomina "ruta óptima ROCm", combinando FlashAttention para ROCm, un VAE Qwen Image con kernel Triton W8A8 en modo Aggressive y una configuración de entorno por GPU.

El problema que resuelve es de rendimiento y despliegue: la inferencia de Krea 2 Turbo en ComfyUI sobre hardware AMD era sustancialmente más lenta que en las rutas equivalentes, y este paquete documenta y distribuye checkpoints y ajustes que reducen el tiempo del primer flujo de trabajo un 64,9 % (de 242,4 s a 85,0 s) en el host Ubuntu probado, con mejoras del 8,2 % en generación en caliente y del 8,0 % en tiempo por iteración.

Su relevancia es doble. Por un lado, ataca el cuello de botella histórico del ecosistema AMD en difusión de imágenes, donde el soporte de ROCm ha ido por detrás de CUDA. Por otro, se apoya en Krea 2 Turbo, la variante destilada de pocos pasos (8 pasos) del modelo fundacional de texto a imagen de Krea AI, publicado el 23 de junio de 2026, lo que permite generar a resoluciones como 1368×768 o 1280×720 con muy pocas iteraciones. La licencia es la krea-2-community-license, no una licencia de código abierto permisiva, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion de texto a imagen; arquitectura interna detallada no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 tensorwise (INT8 TensorWise) en el modelo de difusion y el codificador de texto; VAE con Triton W8A8 (preset Aggressive) |
| Idiomas soportados | no disponible |
| Licencia | krea-2-community-license (etiquetada como other); enlace en https://www.krea.ai/krea-2-licensing |
| Formato de pesos | Checkpoints para ComfyUI (no se especifica extension); repositorio de 33,1 GB |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Krea-2-Turbo ni sobre su proceso de entrenamiento (numero de tokens, composicion del dataset, etapas de RLHF o DPO) en la informacion proporcionada. Lo que si se documenta es que se trata de un modelo de difusion de texto a imagen, que admite tambien el modo imagen a imagen, y que Krea 2 Turbo es una variante destilada de pocos pasos del modelo fundacional de Krea AI, orientada a la estetica y publicada el 23 de junio de 2026.

La aportacion tecnica de este repositorio no es el entrenamiento, sino la cuantizacion y la integracion de kernels. El autor publica checkpoints en INT8 tensorwise junto con un codificador de texto Qwen3-VL INT8 y recomienda un VAE Qwen Image con kernel Triton W8A8 en preset Aggressive. La ruta optima medida combina esos pesos con ROCm FlashAttention a traves de su implementacion AMD en Triton/AITER (variable de entorno FLASH_ATTENTION_TRITON_AMD_ENABLE=TRUE) y ComfyUI lanzado con --use-flash-attention --disable-xformers. El autor senala explicitamente que --enable-triton-backend no es un requisito de rendimiento en esta release: su activacion adicional resulto neutra en la prueba A/B.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) en 8 pasos, gracias a la naturaleza destilada de Krea 2 Turbo.
- Generacion de imagen a imagen (image-to-image), segun el pipeline declarado en la model card.
- Uso de referencias de estilo (Style-Reference LoRA en tiempo de ejecucion) en la ruta base de comparacion descrita por el autor.
- Generacion a resoluciones de trabajo de 1368x768 en las pruebas del autor y de hasta 1280x720 en la receta publicada para RX 7800 XT.
- Integracion nativa con ComfyUI mediante checkpoints de difusion y de codificador de texto.
- Codificador de texto Qwen3-VL cuantizado a INT8, planteado como optimizacion de memoria y almacenamiento mas que de velocidad.
- VAE Qwen Image con kernel Triton W8A8 en modo Aggressive, orientado a reducir el coste de carga, preparacion y decodificacion.
- Aceleracion mediante ROCm FlashAttention con backend AMD Triton/AITER.
- No se documentan capacidades de tool calling, function calling ni comportamiento agentico (no aplicables a un modelo de difusion de imagenes).
- No se documenta soporte multilingue explicito mas alla de lo que herede el codificador de texto; no disponible.

## Casos de uso

- Generacion de imagenes de produccion sobre GPUs AMD: el paquete esta disenado para sustituir la ruta CUDA por una ruta ROCm validada, con instrucciones concretas de instalacion y variables de entorno, lo que permite desplegar ComfyUI en flotas AMD sin reescribir los flujos de trabajo.
- Arte conceptual e iteracion rapida: con 8 pasos de muestreo y tiempos en caliente de 35,16 s por generacion a 1368x768 en el modelo de difusion, un artista puede evaluar decenas de variaciones por sesion sobre una sola GPU.
- Restilizado y edicion imagen a imagen: al soportar image-to-image, permite reutilizar bocetos o renders previos y regenerarlos con la estetica del modelo sin partir de cero.
- Coherencia de estilo en branding: la ruta con Style-Reference LoRA en tiempo de ejecucion permite mantener una identidad visual consistente entre piezas generadas en distintas sesiones.
- Despliegue en estaciones de trabajo de gama media: la receta publicada para RX 7800 XT (16 GB) con checkpoints GGUF demuestra que el modelo puede ejecutarse en GPU de consumo AMD, con generacion a 1280x720 en 8 pasos.
- Reduccion de coste de inferencia: la combinacion de INT8 tensorwise, VAE Triton Agressive y FlashAttention reduce el tiempo por iteracion de 8,87 s/it a 8,16 s/it y el primer flujo de trabajo un 64,9 %, lo que abarata el coste por imagen en servicios con muchas peticiones en frio.
- Servicios de generacion por lotes: los tiempos en caliente estables (75,0 s de generacion total de flujo frente a 85,0 s en la primera ejecucion) hacen viable encolar lotes manteniendo el proceso residente.
- Sustitucion de checkpoints oficiales sin cambiar la interfaz: al ser checkpoints de ComfyUI, se puede intercambiar el checkpoint oficial INT8 ConvRot por el INT8 TensorWise con una ganancia medida del 0,8 % en generacion en caliente y del 21,3 % frente a BF16.

## Benchmarks y rendimiento

Los datos disponibles son de rendimiento de inferencia en el host Ubuntu del autor (GPU no especificada en la informacion proporcionada), a 1368x768 y 8 pasos, con promedio de dos ejecuciones en caliente. No se han publicado resultados de benchmarks de calidad (FID, CLIP score u otros) en la informacion disponible.

Comparativa de rutas completas:

| Ruta en el host Ubuntu | Primera ejecucion | Generacion en caliente | Muestreo en caliente | s/it en caliente |
|---|---:|---:|---:|---:|
| ComfyUI estilo stock INT8 + LoRA de referencia de estilo + cross-attention de PyTorch | 242,4 s | 81,7 s | 71,0 s | 8,87 |
| Todas las optimizaciones: INT8 fusionado + codificador INT8 + Qwen VAE Triton Aggressive + ROCm FlashAttention | 85,0 s | 75,0 s | 65,0 s | 8,16 |

Ganancias declaradas: primera ejecucion de 242,4 s a 85,0 s (-64,9 %), generacion en caliente -8,2 %, muestreo en caliente -8,4 % y tiempo por iteracion -8,0 %.

Eficiencia de checkpoints de difusion (misma ruta de atencion y codificador de texto):

| Checkpoint de difusion | Generacion en caliente | Muestreo en caliente | s/it en caliente | Ganancia frente a INT8 del proyecto |
|---|---:|---:|---:|---:|
| INT8 TensorWise del proyecto | 35,16 s | 30,12 s | 3,765 | — |
| INT8 ConvRot oficial de ComfyUI | 35,44 s | 30,54 s | 3,817 | 0,8 % |
| BF16 oficial | 44,69 s | 38,55 s | 4,819 | 21,3 % |
| FP8 scaled oficial | 51,34 s | 44,41 s | 5,551 | 31,5 % |

Impacto de la ruta de atencion (mismo checkpoint fusionado, codificador de proyecto y parche Agressive de Qwen VAE): pasar de cross-attention de PyTorch a ROCm FlashAttention redujo la generacion en caliente de 82,5 s a 75,0 s (-9,1 %), el muestreo de 71,0 s a 65,0 s (-8,5 %) y el tiempo por iteracion de 8,915 s/it a 8,160 s/it.

Diagnostico del VAE en Docker (coste de carga, preparacion y decodificacion):

| Medicion del VAE en Docker | Stock sin parche | Qwen VAE Triton W8A8 Aggressive | Reduccion |
|---|---:|---:|---:|
| Primer flujo de trabajo texto a imagen | 231,209 s | 182,355 s | 21,1 % |
| Texto a imagen tras cambio de resolucion | 223,064 s | 176,777 s | 20,8 % |
| Primer flujo de trabajo con referencia de estilo | 275,472 s | 216,590 s | 21,4 % |
| Referencia de estilo tras cambio de resolucion | 223,750 s | 178,630 s | 20,2 % |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio completo ocupa 33,1 GB, cifra que conviene tener en cuenta para el almacenamiento en disco y para la carga de checkpoints.
- GPU de consumo AMD: existe una receta publicada que ejecuta Krea 2 Turbo en una RX 7800 XT de 16 GB mediante ComfyUI sobre ROCm, con checkpoints en formato GGUF y generacion a 1280x720 en 8 pasos.
- GPU profesionales: no se especifica el modelo de GPU utilizado en el host Ubuntu de referencia, por lo que no se pueden asociar los tiempos a un modelo concreto (A100, H100, MI300 u otros).
- Compatibilidad de plataforma: el paquete esta orientado a ROCm sobre Linux (host Ubuntu en las pruebas) y existe un fork de ComfyUI con ROCm para Windows (comfyui-rocm en GitHub).
- Opciones de despliegue: ComfyUI es la via documentada. No hay soporte declarado para vLLM, llama.cpp, Ollama o TGI, que ademas no son runners habituales para modelos de difusion de imagen.
- Componentes necesarios: ROCm, PyTorch emparejado con la version de ROCm, ROCm/flash-attention con backend AMD Triton/AITER, y el nodo Qwen VAE Triton W8A8 disponible en el registro de ComfyUI.
- Parametros de lanzamiento recomendados: --use-flash-attention --disable-xformers, con FLASH_ATTENTION_TRITON_AMD_ENABLE=TRUE.
- Latencia observada en el host de referencia: 85,0 s en el primer flujo de trabajo completo optimizado, 75,0 s en regimen estable y 35,16 s de generacion del checkpoint de difusion en caliente a 1368x768 y 8 pasos.
- Throughput: no disponible.

## Comparativa con modelos similares

La comparacion mas directa es entre los distintos formatos de checkpoint del propio Krea 2 Turbo, medidos por el autor en condiciones controladas:

| Version | Cuantizacion | Generacion en caliente | s/it | Tamano aproximado | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|---|
| INT8 TensorWise (este repositorio) | INT8 tensorwise | 35,16 s | 3,765 | repo de 33,1 GB | krea-2-community-license | HuggingFace, PuppetVision |
| INT8 ConvRot oficial de ComfyUI | INT8 con rotacion de convolucion | 35,44 s | 3,817 | no disponible | krea-2-community-license | Comfy-Org |
| BF16 oficial | BF16 | 44,69 s | 4,819 | no disponible | krea-2-community-license | Comfy-Org / Krea |
| FP8 scaled oficial | FP8 | 51,34 s | 5,551 | no disponible | krea-2-community-license | Comfy-Org / Krea |

Frente a otras alternativas del mismo nicho (por ejemplo, modelos fundacionales de texto a imagen con variantes destiladas de pocos pasos), no se dispone de datos comparativos de parametros, contexto ni calidad en la informacion proporcionada: no disponible.

## Limitaciones y advertencias

- Licencia no abierta: se trata de la krea-2-community-license, etiquetada como other. Cualquier uso comercial debe revisarse contra los terminos de https://www.krea.ai/krea-2-licensing antes de desplegar en produccion.
- El repositorio no declara un numero de parametros, contexto ni idiomas soportados, lo que dificulta dimensionar despliegues sin pruebas previas.
- Los benchmarks proceden de un unico host Ubuntu cuya GPU no se especifica, con dos ejecuciones en caliente por configuracion; no son extrapolables a otras GPUs ni a otras versiones de ROCm.
- Las cifras de arranque en frio (85,0 s y 182,355 s en Docker) incluyen trabajo de inicializacion y compilacion de kernels, por lo que no representan el estado estable.
- La configuracion de ROCm, PyTorch y FlashAttention es dependiente de la GPU y de la version, tal como advierte el propio autor; una combinacion incorrecta puede degradar el rendimiento o impedir el arranque.
- El autor senala que --enable-triton-backend no aporta mejora medible en esta release, por lo que activarlo no debe considerarse requisito.
- El codificador de texto Qwen3-VL INT8 no aporta una mejora de velocidad material en esta carga; es una optimizacion de memoria y almacenamiento.
- El coste del VAE domina el primer flujo tras el arranque y tras cada cambio de resolucion, incluso con el parche Agressive (-20,2 % a -21,4 %), lo que penaliza cargas de trabajo con resoluciones variables.
- Riesgo de alucinacion y sesgos: no disponible en la informacion proporcionada. Al ser un modelo generativo de imagenes, la fidelidad al prompt y los sesgos visuales dependen del modelo base Krea-2-Turbo.
- Popularidad y validacion de la comunidad: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe aun retroalimentacion independiente que confirme los resultados.
- No hay soporte declarado de cuantizaciones GGUF dentro de este repositorio; las rutas GGUF citadas pertenecen a otras distribuciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PuppetVision/krea-2-amd-rocm-optimized-comfy-triton
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Video de presentacion en YouTube: https://youtu.be/fD-J2CYetIg
- Licencia Krea 2: https://www.krea.ai/krea-2-licensing
- Nodo Qwen VAE Triton W8A8 en el registro de ComfyUI: https://registry.comfy.org/publishers/puppet-vision/nodes/qwen-vae-triton
- ROCm/flash-attention en GitHub: https://github.com/ROCm/flash-attention
- Fork de ComfyUI con ROCm (Windows): https://github.com/localhubs/comfyui-rocm
- Implementacion de Krea 2 en comfyui-rocm: https://github.com/localhubs/comfyui-rocm/tree/master/comfy/ldm/krea2
- Receta de Krea 2 Turbo en RX 7800 XT con ROCm: https://smeltcore.com/recipes/krea-2-rx-7800-xt/
- Discusion sobre ejecucion con menos de 4 GB de VRAM (Comfy-Org/Krea-2): https://huggingface.co/Comfy-Org/Krea-2/discussions/21
