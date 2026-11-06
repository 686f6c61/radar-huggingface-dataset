# NidAll/Krea-2-BBOX-Turbo-INT8-ConvRot

## Resumen

Krea 2 BBOX Turbo INT8 ConvRot es una cuantización a INT8 de un finetune del modelo de generación de imágenes Krea 2, especializado en control de composición mediante cajas delimitadoras (bounding boxes). El artefacto lo publica el usuario NidAll y deriva de `jimmycarter/krea2-turbo-bbox`, un ajuste fino del modelo base `krea/Krea-2-Raw` orientado a maquetación controlada: cómics de varios paneles, consistencia de personajes entre viñetas y texto literal colocado en posiciones explícitas. No es un producto oficial de Krea y no cuenta con su respaldo.

El modelo resuelve un problema concreto en pipelines de generación de imágenes: pasar de prompts en lenguaje natural a un control espacial fino sin recurrir a ControlNet ni a condicionamientos externos. Para ello emplea el DSL de grounding del repositorio de origen, donde cada elemento se declara en una línea con su caja `[x0,y0,x1,y1]` sobre una rejilla de 0 a 1000. El checkpoint es una destilación Turbo, por lo que se muestrea con 8 pasos y CFG desactivado.

La relevancia de esta ficha está en el formato: se trata de una conversión INT8 con rotación ConvRot que replica la receta exacta del artefacto oficial de Comfy-Org (`krea2_turbo_int8_convrot.safetensors`), lo que permite cargarlo en ComfyUI como sustituto directo del modelo de difusión con un consumo de memoria notablemente menor que los 26,28 GB del finetune en precisión original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión para texto-a-imagen; no se detalla en la información proporcionada) |
| Parametros totales | no disponible (el tamaño del checkpoint INT8 es de 14.135.120.528 bytes; el origen en precisión completa, 26,28 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 con rotación ConvRot (pesos INT8, escalas de fila FP32, grupos ConvRot por capa de 256/64/16) |
| Idiomas soportados | no disponible (el prompting se documenta en inglés; no se declaran idiomas) |
| Licencia | Krea 2 Community License (uso comercial permitido solo por debajo de 1 M USD de ingresos anuales; por encima se requiere licencia Enterprise de Krea) |
| Formato de pesos | safetensors (tres variantes: fine-tune plano, EMA 0.9995 y EMA 0.99975) |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura interna del modelo base Krea 2 en la información proporcionada: no se especifica si emplea un transformer de difusión, un UNet o un esquema híbrido, ni el número de parámetros del modelo original. Lo que sí está documentado es la cadena de derivación: `krea/Krea-2-Raw` como base, un finetune de jimmycarter (`krea2-turbo-bbox`) entrenado para control por cajas delimitadoras y destilado en modo Turbo, y finalmente la cuantización INT8 de NidAll.

El proceso de cuantización es reproducible y está documentado con detalle. Se realizó con la herramienta `comfyui-native-quantizer` (comfyquant 2.3.0rc3) en formato `int8-convrot`, con escalas de fila en FP32 y rotación ConvRot. La selección de capas y los tamaños de grupo por capa (256/64/16) se extrajeron del artefacto oficial `Comfy-Org/Krea-2` en la revisión `1171f4dc7e325bf3734586942e737872506c73e1` mediante `read_comfy_org_recipe.py` y se aplicaron con `--reference-recipe`, de modo que el conjunto de capas cuantizadas coincide con el del build oficial de Krea 2 Turbo INT8 (224 capas). La fuente se verificó por SHA256 antes de la conversión y cada checkpoint se cargó en ComfyUI y generó el prompt de cuatro paneles de ejemplo como prueba de humo.

## Capacidades

- Generación de imágenes texto-a-imagen con control espacial explícito mediante cajas delimitadoras en una rejilla de 0 a 1000, con el eje x primero.
- Maquetación de cómics multipanel: distribución de viñetas y elementos dentro de cada una según las cajas indicadas.
- Consistencia de personajes entre paneles, según la descripción del finetune de origen.
- Colocación de texto literal en cajas explícitas (rótulos, cartelas, bocadillos).
- Aceptación de prompts en prosa convencional además del DSL de grounding.
- Muestreo rápido por destilación Turbo: 8 pasos con CFG desactivado.
- Integración nativa en ComfyUI mediante la plantilla texto-a-imagen de Krea 2, sustituyendo únicamente el modelo de difusión.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada ni audio.

## Casos de uso

- Producción de cómics y tiras gráficas: el DSL de cajas permite fijar la posición de cada viñeta y de los personajes dentro de ella, y las variantes EMA ofrecen acabados algo más limpios a costa de un seguimiento ligeramente menos exacto de las cajas.
- Rotulación y cartelería con texto posicionado: al admitir texto literal en cajas explícitas, sirve para generar piezas donde el copy debe caer en una zona concreta del lienzo.
- Prototipado de maquetas editoriales: distribución de bloques de imagen y huecos de texto sobre una retícula antes de pasar a diseño final.
- Iteración rápida en estaciones de trabajo con VRAM limitada: el checkpoint INT8 de ~14,1 GB reduce el peso del modelo de difusión frente a los 26,28 GB del finetune original, lo que facilita mantenerlo cargado junto al codificador de texto y el VAE en una sola GPU.
- Sustitución directa en flujos ComfyUI existentes: al replicar la receta del artefacto oficial de Comfy-Org, se puede intercambiar el modelo de difusión de la plantilla Krea 2 sin rehacer el grafo.
- Generación por lotes con pocos pasos: los 8 pasos sin CFG reducen el coste por imagen en pipelines de volumen donde la composición viene impuesta por cajas.
- Evaluación comparativa de variantes: los tres checkpoints (plano, EMA 0.9995, EMA 0.99975) permiten medir en el mismo flujo el compromiso entre fidelidad a las cajas y suavidad del resultado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta una prueba de humo cualitativa (carga en ComfyUI y generación del prompt de cuatro paneles de ejemplo) y los tamaños y hashes de los ficheros.

## Requisitos de hardware

- VRAM estimada para el modelo de difusión: en torno a 14,1 GB solo para los pesos INT8; hay que sumar el codificador de texto y el VAE de Krea 2, por lo que el total en inferencia supera esa cifra.
- GPU recomendadas: no se especifican en la información proporcionada. El formato declara runtime objetivo NVIDIA y validación con `--validate` y `--verify-output`, sin lista de tarjetas probadas.
- GPU de consumo: no confirmado. Los ~14,1 GB de pesos dejan poco margen en tarjetas de 16 GB una vez añadidos codificador y VAE; en tarjetas de 24 GB el encaje es más holgado, pero no hay medición publicada.
- Despliegue: ComfyUI, colocando el `.safetensors` en `ComfyUI/models/diffusion_models/` y usando el codificador de texto y el VAE estándar de `Comfy-Org/Krea-2` con la plantilla texto-a-imagen integrada. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas no aplicables a un modelo de difusión de este tipo).
- Latencia y throughput: no disponibles. El muestreo es de 8 pasos con CFG desactivado por destilación Turbo, lo que reduce el coste frente a un muestreo estándar, pero no se publican tiempos medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Pesos | Contexto / control | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krea 2 BBOX Turbo INT8 ConvRot (esta ficha) | Difusión texto-a-imagen, finetune con control por cajas | INT8, 14.135.120.528 bytes | Cajas `[x0,y0,x1,y1]` en rejilla 0-1000; 8 pasos, CFG off | Krea 2 Community License (límite de 1 M USD de ingresos) | Hugging Face, repo de 42,4 GB, 0 descargas |
| `jimmycarter/krea2-turbo-bbox` | Mismo finetune en precisión original | 26,28 GB | Idéntico DSL de cajas | Krea 2 Community License (heredada) | Hugging Face |
| `Comfy-Org/Krea-2` `krea2_turbo_int8_convrot.safetensors` | Build oficial de Krea 2 Turbo en INT8 ConvRot | 13.492.686.496 bytes | Plantilla texto-a-imagen estándar de Krea 2 | Krea 2 Community License | Hugging Face (Comfy-Org) |

No se dispone de datos de benchmarks que permitan comparar rendimiento numérico entre estas variantes; la comparación se limita a formato, tamaño y licencia.

## Limitaciones y advertencias

- No es un producto oficial de Krea ni está respaldado por Krea; es una versión modificada del modelo bajo los términos de la licencia comunitaria.
- Restricción comercial relevante: el uso comercial solo se permite por debajo de 1 M USD de ingresos anuales (sección 2.3 de la licencia); por encima se exige una licencia Enterprise de Krea.
- Los tres checkpoints no son equivalentes: el fine-tune plano sigue las cajas con más precisión, mientras que las sombras EMA pueden verse algo más limpias pero obedecen las cajas con menos exactitud (especialmente la 0.99975).
- Los ficheros son ligeramente mayores que el artefacto oficial de referencia (delta de +642.434.032 bytes en el checkpoint plano), por lo que no son idénticos en tamaño al build de Comfy-Org aunque compartan receta de capas.
- El prompting por cajas requiere respetar el DSL documentado (un elemento por línea, coordenadas en rejilla 0-1000, x primero); un formato incorrecto degrada el control espacial.
- No se declaran idiomas soportados ni se han publicado evaluaciones de sesgo, alucinación visual o fidelidad de texto en la información disponible.
- Solo se documenta prueba de humo en ComfyUI; no hay validación publicada en otros runners ni métricas objetivas de calidad.
- El repo ocupa 42,4 GB y registra 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya reportado problemas de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NidAll/Krea-2-BBOX-Turbo-INT8-ConvRot
- Modelo base del finetune: https://huggingface.co/jimmycarter/krea2-turbo-bbox
- Modelo base original: https://huggingface.co/krea/Krea-2-Raw
- Artefacto oficial de referencia INT8: https://huggingface.co/Comfy-Org/Krea-2/blob/main/diffusion_models/krea2_turbo_int8_convrot.safetensors
- Herramienta de cuantización: https://github.com/NidAll/comfyui-native-quantizer
- Licencia Krea 2: https://krea.ai/krea-2-licensing
- Registro de terceros: https://free2aitools.com/model/nidall/krea-2-bbox-turbo-int8-convrot
