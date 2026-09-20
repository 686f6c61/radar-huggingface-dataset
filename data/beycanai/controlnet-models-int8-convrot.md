# beycanai/ControlNet-models-INT8-ConvRot

## Resumen

`beycanai/ControlNet-models-INT8-ConvRot` es un repositorio de pesos cuantizados que agrupa tres modelos ControlNet en formato INT8 con rotación ConvRot, listos para usarse en ComfyUI mediante el formato nativo `.comfy_quant`. No es un modelo lingüístico ni un modelo generativo completo: son adaptadores de condicionamiento (ControlNet Union) cuantizados a 8 bits que se aplican sobre los modelos de difusión Z-Image y Qwen-Image para introducir control espacial (pose, profundidad, bordes, etc.) en el proceso de generación de imágenes.

El repositorio lo publica el usuario beycanai y deriva de tres originales en bf16: `alibaba-pai/Z-Image-Turbo-Fun-Controlnet-Union-2.1`, `alibaba-pai/Qwen-Image-2512-Fun-Controlnet-Union` (release 2602) e `InstantX/Qwen-Image-ControlNet-Union`. La cuantización se realizó con la herramienta `silveroxides/convert_to_quant` aplicando INT8, rotación ConvRot con tamaño de grupo 256 y escalado por filas (*row-wise*), y conservando en bf16 las capas de inyección de control (inicializadas a cero o de baja magnitud) porque cuantizarlas silencia el condicionamiento.

Su relevancia práctica es de despliegue: reduce el peso en disco y en VRAM de cada ControlNet aproximadamente a la mitad (por ejemplo, de 6,71 GB a 3,36 GB en el caso de Z-Image) manteniendo, según el autor, la misma calidad que los originales bf16 medida en PSNR. El precio es una dependencia externa obligatoria: ComfyUI de serie no carga ControlNets INT8, por lo que hace falta instalar el parche `ComfyUI-ConvRot-ControlNet`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ControlNet Union (adaptador de condicionamiento para modelos de difusion Z-Image y Qwen-Image); arquitectura interna del transformer subyacente: no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de condicionamiento, no autoregresivo) |
| Tipos de cuantizacion | INT8 con rotacion ConvRot (tamano de grupo 256) y escalado row-wise; capas de inyeccion de control mantenidas en bf16 |
| Idiomas soportados | no disponible (los prompts se procesan con el codificador de texto del modelo base) |
| Licencia | Apache-2.0 (heredada de los tres modelos originales) |
| Formato de pesos | safetensors con metadatos `.comfy_quant` |
| Tamano del repositorio | 7,0 GB (tres archivos: 3,36 GB + 1,82 GB + 1,83 GB) |
| Numero de archivos | 3 |
| Entorno de ejecucion | ComfyUI >= 0.33 con soporte nativo de `int8_tensorwise` en `comfy.quant_ops` |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-19 |
| Ultima actualizacion | 2026-09-19 |

Archivos incluidos y destino en ComfyUI:

| Archivo | Carpeta | Nodo de carga | bf16 -> INT8 | VRAM ahorrada | PSNR vs bf16 |
|---|---|---|---|---|---|
| `Z-Image-Turbo-Fun-Controlnet-Union-2.1_int8_convrot.safetensors` | `models/model_patches/` | `ModelPatchLoader` | 6,71 -> 3,36 GB | -3,0 GB | 42,0 dB |
| `Qwen-Image-2512-Fun-Controlnet-Union-2602_int8_convrot.safetensors` | `models/controlnet/` | `Load ControlNet Model` | 3,51 -> 1,82 GB | -1,6 GB | 36,0 dB |
| `Qwen-Image-InstantX-ControlNet-Union_int8_convrot.safetensors` | `models/controlnet/` | `Load ControlNet Model` | 3,54 -> 1,83 GB | -1,6 GB | 44,8 dB |

## Arquitectura y entrenamiento

Estos archivos no se han entrenado desde cero: son conversiones de cuantizacion de pesos ya entrenados. El material de partida son tres ControlNet Union en bf16, dos orientados a Qwen-Image (`InstantX/Qwen-Image-ControlNet-Union` y la variante Fun de `alibaba-pai/Qwen-Image-2512-Fun-Controlnet-Union`) y uno orientado a Z-Image (`alibaba-pai/Z-Image-Turbo-Fun-Controlnet-Union-2.1`). Un ControlNet Union condiciona la generacion difusa mediante senales de control heterogeneas (pose, profundidad, bordes, segmentacion, etc.) inyectadas en el modelo base a traves de capas de acoplamiento. La model card no detalla el numero de parametros, la profundidad ni los datos de entrenamiento de los originales.

El proceso de conversion aplica cuantizacion INT8 con rotacion ConvRot y tamano de grupo 256, usando escalado por filas (`--scaling_mode row`). El autor justifica explicitamente esta eleccion: el escalado tensor-wise rompe la compatibilidad con LoRA y suaviza la salida. Ademas, las capas de inyeccion de control (las inicializadas a cero o de baja magnitud) se excluyen de la cuantizacion y permanecen en bf16 en los tres modelos, porque cuantizarlas amortigua el condicionamiento. Los archivos se empaquetan con metadatos `.comfy_quant` para que ComfyUI los reconozca como pesos cuantizados nativos.

La innovacion tecnica relevante no esta en la arquitectura, sino en el formato de despliegue: son ControlNets INT8 cargables de forma nativa por ComfyUI (a partir de la version 0.33), algo que los cargadores estandar de ControlNet y de model-patch no soportaban. El parche externo `ComfyUI-ConvRot-ControlNet` modifica los nodos de carga existentes sin anadir nodos nuevos y sin alterar los ControlNets en bf16 o fp8, de modo que un flujo de trabajo ya existente solo necesita cambiar el archivo seleccionado en el mismo nodo.

## Capacidades

- Condicionamiento de generacion de imagenes mediante ControlNet Union para los modelos base Z-Image y Qwen-Image.
- Soporte de multiples modalidades de control segun el ControlNet Union del que derive cada archivo (pose, profundidad, bordes y otras senales agregadas por el propio Union); la model card no enumera el conjunto exacto de controles admitidos.
- Carga nativa en ComfyUI como pesos INT8 mediante metadatos `.comfy_quant`, previa instalacion del parche `ComfyUI-ConvRot-ControlNet`.
- Compatibilidad con flujos de trabajo existentes: el archivo se selecciona en el mismo nodo cargador ya usado para la version bf16, sin cambios adicionales en el grafo.
- Compatibilidad declarada con LoRA gracias al escalado row-wise (el escalado tensor-wise la rompia).
- Reduccion de VRAM y de disco de aproximadamente el 50 % por archivo, con la misma velocidad de generacion en el hardware de prueba.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso ni procesamiento de audio o video.
- Capacidades multilingues: no disponible (dependen del codificador de texto del modelo de difusion base).

## Casos de uso

- Control de pose en generacion de personajes: cargando el ControlNet de Qwen-Image en `Load ControlNet Model`, se puede fijar el esqueleto de una figura y generar variantes de vestuario o estilo manteniendo la postura, con 1,8 GB de VRAM para el ControlNet en lugar de 3,5 GB.
- Control de profundidad para composicion de escenas: el uso de mapas de profundidad permite mantener la geometria de una escena 3D renderizada y sustituir materiales o iluminacion en la generacion, ahorrando 1,6 GB de VRAM por cada ControlNet cargado.
- Transferencia de bordes (canny/lineart) en ilustracion: partiendo de un boceto lineal, el modelo genera la imagen final respetando las lineas; util en pipelines de produccion de ilustracion donde se itera mucho sobre el mismo boceto.
- Estilizado de imagenes existentes con Z-Image Turbo: el archivo de Z-Image se coloca en `models/model_patches/` y se carga con `ModelPatchLoader`, permitiendo aplicar control sobre el modelo Z-Image Turbo con 3,36 GB en lugar de 6,71 GB.
- Despliegue en GPUs de gama consumer: al reducir a la mitad el peso de los ControlNets, es viable encadenar varios controles (por ejemplo, pose mas profundidad) en una unica GPU de 24 GB, algo mas ajustado con las versiones bf16.
- Servicios de generacion de imagenes en la nube: la reduccion de VRAM por instancia permite aumentar la densidad de trabajos concurrentes por GPU o usar instancias de menor coste, manteniendo la calidad medida en PSNR.
- Pipelines con LoRA: dado que la cuantizacion usa escalado row-wise y preserva la compatibilidad con LoRA, estos ControlNets se pueden combinar con adaptadores de estilo personalizados sin degradar el condicionamiento.
- Integracion en flujos de trabajo ComfyUI ya existentes: al no anadir nodos nuevos, la migracion desde bf16 se limita a seleccionar el archivo `_int8_convrot` en el nodo cargador, lo que simplifica el despliegue en equipos con VRAM limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; no aplican a un modelo de condicionamiento de difusion. La unica metrica objetiva publicada por el autor es la fidelidad respecto al original bf16 medida en PSNR, comparando cada archivo con su original en la misma semilla y configuracion:

| Archivo | PSNR vs bf16 | Peso bf16 | Peso INT8 | VRAM ahorrada |
|---|---|---|---|---|
| `Z-Image-Turbo-Fun-Controlnet-Union-2.1_int8_convrot.safetensors` | 42,0 dB | 6,71 GB | 3,36 GB | -3,0 GB |
| `Qwen-Image-2512-Fun-Controlnet-Union-2602_int8_convrot.safetensors` | 36,0 dB | 3,51 GB | 1,82 GB | -1,6 GB |
| `Qwen-Image-InstantX-ControlNet-Union_int8_convrot.safetensors` | 44,8 dB | 3,54 GB | 1,83 GB | -1,6 GB |

En cuanto a velocidad, el autor indica que el tiempo de generacion fue identico al de los originales bf16 en el hardware de prueba, es decir, la ganancia es de memoria y no de tiempo. Senala ademas que GPUs mas antiguas (series 30 y 40) podrian experimentar una mejora de velocidad gracias al kernel INT8, pero que esto no se verifico.

## Requisitos de hardware

- VRAM del ControlNet en INT8: 1,82 GB (Qwen-Image-2512 Fun), 1,83 GB (Qwen-Image InstantX) y 3,36 GB (Z-Image Turbo Fun). Estas cifras corresponden unicamente al ControlNet; hay que sumar la VRAM del modelo de difusion base y del codificador de texto, cuyo consumo no se especifica en la informacion disponible.
- Disco: 7,0 GB para el repositorio completo (los tres archivos), o bien 1,82 GB, 1,83 GB o 3,36 GB si solo se descarga un archivo.
- Hardware de prueba declarado: una RTX 5090 con ComfyUI 0.33.1 y PyTorch 2.10.0+cu130.
- GPU recomendadas: no se proporciona una lista. Por tamano, cada ControlNet INT8 es manejable en GPUs consumer con 8-24 GB de VRAM, siempre que el modelo de difusion base quepa en la misma GPU; no se confirma el minimo exacto.
- Opciones de despliegue: ComfyUI >= 0.33 como unico entorno soportado explicitamente. No hay soporte declarado para vLLM, llama.cpp, Ollama o TGI, que ademas no aplican a este tipo de modelo.
- Dependencia obligatoria: el parche `ComfyUI-ConvRot-ControlNet` instalado en `custom_nodes/`. Para verificar la instalacion correcta, la consola debe mostrar `[ConvRot-ControlNet] patched 3/3 loaders`.
- Latencia y throughput: no disponibles de forma absoluta. El autor solo indica que la velocidad de generacion es identica a la de los originales bf16 en la RTX 5090, con posible mejora en GPUs de las series 30 y 40 no cuantificada.

## Comparativa con modelos similares

La comparativa natural es contra los originales en bf16 de los que derivan, ya que no se dispone de otras conversiones INT8 equivalentes en la informacion proporcionada. La comparacion con alternativas de terceros no esta disponible.

| Modelo | Precision | Peso | Licencia | Notas |
|---|---|---|---|---|
| `beycanai/...Z-Image-Turbo-Fun-Controlnet-Union-2.1_int8_convrot` | INT8 ConvRot | 3,36 GB | Apache-2.0 | Requiere parche de cargador; PSNR 42,0 dB frente a bf16 |
| `alibaba-pai/Z-Image-Turbo-Fun-Controlnet-Union-2.1` (original) | bf16 | 6,71 GB | Apache-2.0 | Carga directa en ComfyUI estandar |
| `beycanai/...Qwen-Image-2512-Fun-Controlnet-Union-2602_int8_convrot` | INT8 ConvRot | 1,82 GB | Apache-2.0 | Requiere parche de cargador; PSNR 36,0 dB frente a bf16 |
| `alibaba-pai/Qwen-Image-2512-Fun-Controlnet-Union` (original) | bf16 | 3,51 GB | Apache-2.0 | Carga directa en ComfyUI estandar |
| `beycanai/...Qwen-Image-InstantX-ControlNet-Union_int8_convrot` | INT8 ConvRot | 1,83 GB | Apache-2.0 | Requiere parche de cargador; PSNR 44,8 dB frente a bf16 |
| `InstantX/Qwen-Image-ControlNet-Union` (original) | bf16 | 3,54 GB | Apache-2.0 | Carga directa en ComfyUI estandar |

El compromiso es claro: aproximadamente la mitad de peso y VRAM, con una fidelidad de 36,0 a 44,8 dB de PSNR segun el archivo, a cambio de una dependencia de software adicional y de un ecosistema de despliegue mas restringido (solo ComfyUI >= 0.33 con el parche instalado).

## Limitaciones y advertencias

- No funciona en ComfyUI de serie. Los cargadores estandar de ControlNet y de model-patch no admiten INT8, por lo que sin el parche `ComfyUI-ConvRot-ControlNet` los archivos no se pueden cargar.
- Requiere ComfyUI >= 0.33 por el soporte nativo de `int8_tensorwise` en `comfy.quant_ops`. En versiones anteriores no hay soporte.
- El archivo de Z-Image se carga con `ModelPatchLoader` desde `models/model_patches/`, mientras que los dos de Qwen-Image van en `models/controlnet/` con `Load ControlNet Model`. Colocarlos en la carpeta equivocada impide la carga.
- La fidelidad no es perfecta: aunque los PSNR declarados son altos, el archivo de Qwen-Image-2512 Fun registra 36,0 dB, el valor mas bajo de los tres, lo que indica una diferencia mayor respecto al original bf16.
- Riesgo de alucinacion: aplicable al modelo de difusion base, no al ControlNet. La cuantizacion puede alterar sutilmente el condicionamiento, especialmente en senales de control finas.
- Sesgos conocidos: no disponibles. Al ser una conversion de pesos, hereda los sesgos de los modelos originales de alibaba-pai e InstantX y de sus datos de entrenamiento, no documentados en esta ficha.
- Limitaciones de idioma: no disponibles. El tratamiento del texto depende del codificador del modelo de difusion base.
- Licencia: Apache-2.0 en los tres archivos y en los tres originales, por lo que el uso comercial esta permitido con las obligaciones habituales de atribucion y conservacion de avisos. Se recomienda revisar igualmente las licencias de los modelos base de difusion (Z-Image, Qwen-Image), que no se detallan en la informacion disponible.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia (2026-09-19). No hay evidencia de validacion por parte de terceros.
- La mejora de velocidad en GPUs de las series 30 y 40 es una suposicion del autor, no verificada.
- La busqueda web realizada no devolvio documentacion tecnica relevante sobre este modelo ni sobre sus originales; los resultados obtenidos no guardaban relacion con el tema.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/beycanai/ControlNet-models-INT8-ConvRot
- Parche de cargador para ComfyUI (obligatorio): https://github.com/0xBeycan/ComfyUI-ConvRot-ControlNet
- Herramienta de cuantizacion utilizada: https://github.com/silveroxides/convert_to_quant
- Modelo original Z-Image: https://huggingface.co/alibaba-pai/Z-Image-Turbo-Fun-Controlnet-Union-2.1
- Modelo original Qwen-Image-2512 Fun: https://huggingface.co/alibaba-pai/Qwen-Image-2512-Fun-Controlnet-Union
- Modelo original Qwen-Image InstantX: https://huggingface.co/InstantX/Qwen-Image-ControlNet-Union
