# iamasifnawaz/comfyui-qwen-image-2.1-fast

## Resumen

comfyui-qwen-image-2.1-fast es un paquete de nodos personalizados para ComfyUI, publicado por el usuario iamasifnawaz bajo licencia MIT, que acelera la inferencia de Qwen-Image 2.1 en tareas de generación y edición de imágenes sin modificar los pesos del modelo. No es un modelo de IA en sí: el repositorio ocupa 0,0 GB y no contiene pesos, sino una capa de optimización que se apoya en el modelo base Qwen-Image 2.1 en su variante viggle-turbo v0.3 de 6 pasos, cuantizada en int8.

Sobre una única RTX 3090, el paquete reduce el tiempo por imagen de 11,29-12,2 s con ComfyUI de serie a 3,55-4,01 s, y el tiempo por edición de 16,6-16,70 s a 4,76-6,37 s, es decir entre 2,8× y 3,5× más rápido según las opciones activadas. El autor reporta una diferencia media de unos 3-4/255 por píxel frente a ComfyUI de serie, atribuida al redondeo de los kernels, y una reducción de aproximadamente 3,4× en energía de GPU consumida por imagen.

Su relevancia práctica está en dos cuellos de botella concretos de la difusión en producción: la recompilación de kernels Triton ante cada nueva longitud de prompt (una sesión de 20 prompts distintos pasa de 131,1 s a 97,0 s) y el coste de las ediciones con varias imágenes de referencia (hasta 2,0× frente al mejor ajuste de serie). En el momento de la consulta el repositorio acumula 0 descargas y 0 likes, y no hay benchmarks de calidad publicados más allá de las mediciones de latencia del propio autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No aplicable al paquete (nodos personalizados de ComfyUI). El modelo base Qwen-Image 2.1 es un modelo de difusión texto-a-imagen; la información disponible no detalla su arquitectura interna |
| Parámetros totales | No disponible. El paquete no contiene pesos; los ficheros que consume suman 17,4 GB en disco |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | int8 (sufijo `int8_convrot`) en el modelo de difusión y en el text encoder; bf16 en el VAE y opción bf16 para el encoder de visión (`QWEN21_FAST_VISION_BF16`) |
| Idiomas soportados | No disponible (no documentado en la información proporcionada) |
| Licencia | MIT |
| Formato de pesos | No incluye pesos propios. Los pesos que consume son `safetensors` (`Qwen-Image-2.1-viggle-turbo-v0.3-6step-int8_convrot.safetensors`, `qwen3vl_8b_int8_convrot.safetensors`, `qwen_image_2.1_vae_bf16.safetensors`) |
| Modelo base | Qwen-Image 2.1, variante Viggle turbo v0.3 de 6 pasos |
| Componentes requeridos | Modelo de difusión 7,3 GB; text encoder 9,4 GB; VAE 0,7 GB |
| Tamaño del repositorio | 0,0 GB (solo código y flujos de trabajo) |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-06 |

## Arquitectura y entrenamiento

El paquete no entrena ni ajusta nada: no hay destilación, no se reducen los pasos de muestreo y no se alteran los pesos. Toda la ganancia procede de optimizaciones de ejecución sobre el mismo grafo de ComfyUI. La pieza central es la activación automática del backend Triton de ComfyUI (sin necesidad de pasar `--enable-triton-backend` manualmente, aunque la opción existe), combinada opcionalmente con SageAttention mediante `--use-sage-attention`. A esto se suman una caché de visión (`QWEN21_FAST_VISION_CACHE=8`), ejecución del encoder de visión en bf16 (`QWEN21_FAST_VISION_BF16=1`), una cuantización con rotación (`QWEN21_FAST_ROTQUANT=1`) y la persistencia del autotuning de kernels entre reinicios mediante `TRITON_CACHE_AUTOTUNING=1`.

La innovación más útil en términos de latencia sostenida es el tratamiento del autotuning de Triton. Sin el paquete, Triton vuelve a ajustar los kernels para cada nueva longitud de prompt: en una sesión nueva de 20 prompts diferentes, 13 de los 19 posteriores al primero tardaron entre 6,5 y 8,1 s en lugar de 4,3 s. Con el paquete, uno tardó 5,7 s y el resto entre 3,6 y 4,8 s, lo que rebaja el total de la sesión de 131,1 s a 97,0 s. El paquete también incorpora nodos propios (`ViggleTurboSigmas` y `QanimTextEncodeQwenImage21`) y dos flujos de trabajo listos para usar contra API: `workflows/qwen-image-2.1-fast-t2i-api.json` y `workflows/qwen-image-2.1-fast-edit-api.json`. No se documenta ni el número de tokens de entrenamiento ni la composición del dataset del modelo base, porque este repositorio no entrena ningún modelo.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) usando los pesos de Qwen-Image 2.1 viggle-turbo v0.3 en 6 pasos con muestreo CFG-1.
- Edición de imágenes guiada, con soporte medido para 1, 2 y 3 imágenes de referencia (3,0 / 5,4 / 7,7 s por edición con las opciones por defecto del paquete).
- Activación automática del backend Triton sin flags, con aceleración adicional si SageAttention está instalado.
- Caché de kernels persistentes entre reinicios del proceso mediante `TRITON_CACHE_AUTOTUNING=1`, lo que evita el coste de autotuning por longitud de prompt.
- Control de calidad/latencia mediante variables de entorno: `QWEN21_FAST_VISION_BF16`, `QWEN21_FAST_VISION_CACHE`, `QWEN21_FAST_ROTQUANT`.
- Desactivación explícita de la ruta Triton con `--disable-triton-backend` o `QWEN21_FAST_NO_TRITON=1`, útil para depuración o para comparar contra el comportamiento de serie.
- Ejecución con la GPU limitada a 313 W sin pérdida de latencia respecto a 350 W, con el consiguiente ahorro energético y menor ruido de ventiladores.
- No ofrece tool calling, function calling, razonamiento multi-paso, agentes ni generación de texto: es un paquete de inferencia de difusión.

## Casos de uso

- Generación de imágenes a escala en una sola GPU: con 3,55 s por imagen en una RTX 3090, un único nodo de trabajo puede producir del orden de 1.000 imágenes por hora sin cambiar de hardware, usando `workflows/qwen-image-2.1-fast-t2i-api.json` como plantilla de servicio.
- Edición de producto o retoque con referencias múltiples: la edición con 3 imágenes de referencia baja de 21,96 s (Triton + SageAttention) a 12,39 s con todas las opciones, lo que hace viable la composición de escenas con varios sujetos de referencia en flujos casi interactivos.
- Iteración creativa con cambios repetidos de prompt: al eliminar el reautotuning por longitud de prompt, una sesión de 20 prompts distintos cuesta 97,0 s en lugar de 131,1 s, lo que reduce la penalización típica de las sesiones de exploración.
- Despliegue energéticamente eficiente: al mantener la latencia con la tarjeta limitada a 313 W y consumir unas 3,4× menos energía de GPU por imagen, encaja en granjas de inferencia con restricciones térmicas o de coste eléctrico.
- Prototipado en estación de trabajo de gama alta de consumo: todo el rendimiento reportado está medido en una RTX 3090, de modo que un equipo con esa GPU puede reproducir las cifras sin infraestructura de centro de datos.
- Integración en pipelines automatizados: los flujos JSON orientados a API permiten invocar el grafo desde un servicio externo, y el arranque sin flags (4,01 s por imagen, 6,37 s por edición) simplifica el empaquetado en contenedores y scripts de CI.
- Ahorro de coste en granjas existentes: al no requerir pesos nuevos ni reentrenamiento, se puede aplicar sobre instalaciones de Qwen-Image 2.1 ya desplegadas reduciendo el tiempo por trabajo sin sustituir el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (FID, CLIPScore, MMLU, HumanEval ni similares) en la información disponible. Los únicos datos son mediciones de latencia del propio autor sobre una RTX 3090 a 313 W, con medianas de 3 ejecuciones tras un calentamiento y variando una palabra por ejecución para invalidar la caché:

| Prueba | ComfyUI de serie | Flag Triton + SageAttention | Este paquete | Este paquete, todas las opciones |
|---|---|---|---|---|
| Sin flags (imagen / edición) | 11,29 s / 16,70 s | requiere el flag | 4,01 s / 6,37 s | – |
| Edición con 1 imagen de referencia | – | 8,59 s | 5,56 s | 4,86 s |
| Edición con 2 imágenes de referencia | – | 13,09 s | 7,69 s | 6,56 s (2,0×) |
| Edición con 3 imágenes de referencia | – | 21,96 s | 14,23 s | 12,39 s |
| Sesión nueva: 20 prompts distintos, total | – | 131,1 s | 97,0 s | – |
| Sesión nueva: prompt típico (mediana) | – | 6,74 s | 3,93 s | – |

Datos adicionales declarados por el autor: 12,2 s y 16,6 s en ComfyUI de serie frente a 3,55 s y 4,76 s con todas las opciones (3,4× y 3,5×), con `--use-sage-attention` intermedio en 3,7 s / 5,6 s; diferencia de salida frente a ComfyUI de serie por debajo de 3/255 por píxel en la carrera de referencia y de unas 4/255 de media global; y aproximadamente 3,4× menos energía de GPU por imagen.

## Requisitos de hardware

- GPU medida: una RTX 3090, tanto a 350 W como limitada a 313 W, con resultados idénticos en latencia.
- VRAM: no se publica una cifra explícita. Los ficheros que consume suman 17,4 GB en disco en int8 (7,3 GB de difusión + 9,4 GB de text encoder + 0,7 GB de VAE), por lo que se necesita una GPU con capacidad suficiente para cargarlos; una RTX 3090 de 24 GB es válida y una GPU de 16 GB o menos queda descartada según esos tamaños.
- GPU recomendadas: solo hay datos para RTX 3090. No hay mediciones publicadas para A100, H100, RTX 4090 ni otras.
- Cabe en GPU de consumo: sí, verificado en RTX 3090 (24 GB).
- Opciones de despliegue: ComfyUI con el paquete copiado en `ComfyUI/custom_nodes`, arrancado con `python main.py`. El backend Triton se activa solo; SageAttention es opcional (`--use-sage-attention`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusión servido desde ComfyUI.
- Latencia y throughput: 3,55 s por imagen y 4,76 s por edición con las opciones más rápidas a 313 W; 4,01 s / 6,37 s en configuración sin flags; 3,7 s / 5,6 s con SageAttention. Ediciones de 3,0 / 5,4 / 7,7 s con 1 / 2 / 3 referencias en la configuración por defecto del paquete.
- Almacenamiento: 17,4 GB de pesos más el espacio de los flujos de trabajo y la caché de Triton.

## Comparativa con modelos similares

No hay modelos comparables en la información disponible: este repositorio no es un modelo, sino una capa de aceleración, y su única referencia de comparación documentada es la propia pila de ComfyUI.

| Configuración | Tiempo por imagen | Tiempo por edición | Requisitos | Licencia |
|---|---|---|---|---|
| ComfyUI de serie | 11,29-12,2 s | 16,6-16,70 s | Ninguno adicional | No aplica |
| Triton flag + SageAttention | 4,3-6,74 s (según prompt) | 8,59 s con 1 referencia | Flag manual y SageAttention | No aplica |
| Este paquete | 4,01 s sin flags; 3,55 s con todas las opciones | 6,37 s sin flags; 4,76 s con todas las opciones | ComfyUI + Triton | MIT |

## Limitaciones y advertencias

- No es un modelo: no incluye pesos. Hay que descargar por separado el modelo de difusión de Viggle, el text encoder y el VAE de Comfy-Org, y respetar las licencias de cada repositorio, que no se verifican aquí.
- Dependencia fuerte de ComfyUI y del backend Triton; no se documenta funcionamiento fuera de ese entorno.
- Requiere copiar manualmente `comfyui/viggle_turbo.py` desde el repositorio de Viggle y el nodo `ViggleTurboSigmas`; en grafos CFG-1 propios hay que sustituir `TextEncodeQwenImage21` por `QanimTextEncodeQwenImage21`, lo que implica adaptar flujos existentes.
- Las opciones más rápidas cambian ligeramente los píxeles de salida (diferencia media en torno a 4/255, atribuida al redondeo de kernels), por lo que no hay reproducibilidad bit a bit frente a ComfyUI de serie.
- Todas las cifras proceden de un único hardware y de las mediciones del propio autor, sin verificación independiente ni comparación entre distintas GPU.
- El repositorio registra 0 descargas y 0 likes, y la fecha de creación indicada (2026-10-06) resulta anómala; conviene tratar la madurez y el mantenimiento del proyecto como no contrastados.
- No se documentan sesgos, comportamiento multilingüe, tasas de alucinación ni limitaciones de contexto, porque el paquete no genera texto y hereda las características del modelo base, no evaluadas aquí.
- Uso comercial: la licencia del paquete es MIT, pero la de los pesos del modelo base y del text encoder depende de sus respectivos repositorios y debe comprobarse antes de un despliegue en producción.

## Enlaces

- Repositorio HuggingFace del paquete: https://huggingface.co/iamasifnawaz/comfyui-qwen-image-2.1-fast
- Modelo de difusión base (Viggle): https://huggingface.co/Viggle/Qwen-Image-2.1-viggle-turbo
- Código ComfyUI del modelo base: https://huggingface.co/Viggle/Qwen-Image-2.1-viggle-turbo/tree/main/comfyui
- Text encoder y VAE (Comfy-Org): https://huggingface.co/Comfy-Org/Qwen-Image-2.1
- Resultados de búsqueda web: sin enlaces relevantes; los resultados devueltos corresponden a páginas de Netflix y no guardan relación con el modelo.
