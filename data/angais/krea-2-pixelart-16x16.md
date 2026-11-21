# Angais/Krea-2-PixelArt-16x16

## Resumen

Krea 2 PixelArt 16x16 es un adaptador LoRA para el modelo de difusion texto-a-imagen Krea 2, desarrollado por el usuario Angais y publicado en Hugging Face. Su proposito es generar iconos de videojuego en estilo pixel art de rejilla 16x16, con contornos oscuros y fondo magenta plano, a partir de un render de 512x512 que despues se reduce a la rejilla real muestreando un pixel por bloque de 32x32. El repositorio incluye dos adaptadores independientes: uno para generar un unico icono centrado y otro para producir una hoja de sprites 2x2 con cuatro iconos en una sola imagen.

El modelo resuelve un problema concreto en el flujo de trabajo de desarrollo de videojuegos: la generacion de assets graficos pequenos y consistentes sin necesidad de un artista pixel por pixel. Al fijar la salida a una rejilla exacta de 16x16 y reservar el magenta como clave de color para el fondo, el adaptador permite extraer sprites con transparencia de forma determinista mediante postprocesado en NumPy, sin depender de segmentacion ni de mascaras aprendidas.

Es relevante ahora porque se apoya en Krea 2 Turbo, un modelo de difusion que funciona con muy pocos pasos de inferencia (8, y 6 tambien funciona) y guidance 0, lo que reduce el coste por render. El adaptador se entreno sobre Krea 2 Raw con solo 550 iconos sinteticos de dominio publico (CC0) y 1.000 pasos, lo que lo convierte en un ejemplo de ajuste fino barato y reproducible. La licencia es la Krea 2 Community License, no una licencia permisiva generica, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre modelo de difusion texto-a-imagen Krea 2 (transformer de difusion, detalles no disponibles) |
| Parametros totales | no disponible (el repo pesa 0,5 GB; el LoRA usa rango 32 / alpha 32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen; no se especifica longitud de prompt) |
| Tipos de cuantizacion | El LoRA se distribuye en safetensors; el modelo base admite GGUF (ejemplo con IQ4_XS) y bf16 |
| Idiomas soportados | en (ingles) |
| Licencia | krea-2-community-license |
| Formato de pesos | safetensors (adaptadores LoRA); modelo base en safetensors y GGUF |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y alpha 32 aplicado sobre Krea 2 Raw en precision bf16. El entrenamiento se realizo con ai-toolkit, a resolucion 512x512, con batch 2, optimizador AdamW de 8 bits, learning rate 1e-4, perdida de flow matching y 1.000 pasos, lo que supone aproximadamente 14 minutos en una sola GPU H100. El dataset de entrenamiento son 550 iconos sinteticos de 16x16 con licencia CC0, cada uno escalado x32 sobre fondo magenta plano y etiquetado con el prompt que lo genero. El dataset esta publicado como Angais/krea-2-pixelart-16x16-synthetic.

La innovacion tecnica principal no esta en la arquitectura del LoRA, sino en el diseno del pipeline de salida. El modelo genera una imagen de 512x512 que contiene una rejilla implicita de 16x16 bloques de 32x32 pixeles. Para recuperar el sprite real se toma un pixel del centro de cada bloque (`rgb[16::32, 16::32]`), y el fondo se elimina con una clave de color sobre magenta (#FF00FF) con tolerancia de 90 en distancia maxima por canal. En el caso de la hoja 2x2, cada cuadrante de 256x256 contiene un icono de 16x16 y se muestrea con `quadrant[8::16, 8::16]`. El segundo adaptador se entreno para colocar un objeto por cuadrante en orden de lectura, con etiquetas de posicion explicitas en el prompt.

## Capacidades

- Generacion de iconos pixel art de 16x16 con contornos oscuros y fondo magenta plano, a partir de descripciones textuales en ingles.
- Generacion de hojas de sprites 2x2 con cuatro objetos distintos en una sola imagen, cada uno en su cuadrante.
- Generalizacion a objetos no vistos en entrenamiento: la model card reporta que objetos ausentes del dataset (muneco de nieve, ancla, caballo de ajedrez, sushi, cucurucho de helado, casco espacial, tetera) salen con calidad comparable a los entrenados.
- Extraccion determinista de sprites con transparencia mediante clave de color, sin necesidad de modelos de segmentacion.
- Compatibilidad con Krea 2 Turbo a 8 pasos (6 tambien funciona) y guidance 0, y con Krea 2 Turbo cuantizado IQ4_XS en stable-diffusion.cpp para entornos de baja VRAM.
- Soporte de plantillas de prompt estructuradas con etiquetas de posicion (top left, top right, bottom left, bottom right) para la variante de hoja.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de los modelos de lenguaje; es exclusivamente un adaptador de generacion de imagen.

## Casos de uso

- Prototipado rapido de assets para videojuegos: un equipo indie puede generar decenas de iconos de inventario (llaves, pociones, armas, comida) en minutos y revisarlos en un editor de sprites, sustituyendo la fase inicial de bocetado manual.
- Generacion de iconos de inventario y HUD: el adaptador produce un unico objeto centrado por render, ideal para iconos de objetos que se muestran en una rejilla de interfaz con transparencia.
- Creacion de hojas de sprites para tilesets o menus: la variante 2x2 permite generar cuatro iconos relacionados (por ejemplo, cuatro tipos de moneda o cuatro niveles de una misma arma) en una sola pasada, manteniendo coherencia de estilo.
- Iteracion de direccion artistica: al aceptar prompts descriptivos en ingles y funcionar con pocos pasos, permite probar variaciones de color, forma y detalle de un mismo objeto rapidamente antes de encargar el asset final a un artista.
- Relleno de contenido para prototipos y demos: estudios que necesitan placeholders visuales coherentes para vertical slices o pruebas de usabilidad pueden generar un set completo de iconos con estilo uniforme.
- Pipeline automatizado de assets en CI: el codigo de postprocesado en NumPy permite integrar la generacion y extraccion de sprites en un script reproducible, de modo que cada build pueda regenerar o ampliar el set de iconos con una semilla fija.
- Despliegue en entornos de baja VRAM: mediante stable-diffusion.cpp con el denoiser IQ4_XS, el text encoder Qwen3-VL-4B-Instruct Q4_K_M y el VAE de Wan 2.1, se puede ejecutar en hardware modesto para generar hojas de sprites sin GPU de datacenter.

## Benchmarks y rendimiento

La model card no incluye benchmarks comparativos con otros modelos, pero si metricas de calidad del propio adaptador medidas sobre 80 renders no curados (64 prompts variados mas 16 objetos de prueba, 7 de ellos ausentes del entrenamiento):

| Metrica | Resultado |
|---|---|
| Fondos eliminados limpiamente por clave de color | 79 / 80 |
| Distancia mediana del color de fondo a #FF00FF | 5 / 255 |
| Renders con huecos transparentes (asas, anillos) | 13 / 80 |
| Pureza de rejilla (fraccion de cada bloque 32x32 de un solo color), mediana | 0,989 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un adaptador de generacion de imagen.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repo del LoRA pesa 0,5 GB; el modelo base Krea 2 Turbo en bf16 requiere una GPU de gama alta, mientras que la variante IQ4_XS en stable-diffusion.cpp reduce el requisito y permite ejecucion en entornos de baja VRAM.
- GPU recomendadas: el entrenamiento se realizo en una H100 (14 minutos para 1.000 pasos). Para inferencia se puede usar H100, A100 o GPUs consumer de gama alta con suficiente VRAM para el modelo base; no se especifican modelos concretos de consumer GPU en la informacion disponible.
- Cabe en consumer GPU: si, segun la model card, mediante la configuracion de baja VRAM con stable-diffusion.cpp (denoiser IQ4_XS, text encoder Qwen3-VL-4B-Instruct Q4_K_M y VAE de Wan 2.1). No se detalla la VRAM minima exacta.
- Opciones de despliegue: diffusers (Krea2Pipeline con `load_lora_weights`), stable-diffusion.cpp (build master-1047-984eb06 o posterior) y, por compatibilidad con el ecosistema, ComfyUI mediante los repacks de Wan 2.1 VAE; no se confirma soporte nativo en vLLM, llama.cpp u Ollama, que no aplican a difusion.
- Latencia y throughput: no disponibles de forma numerica. La model card indica 8 pasos de inferencia (6 tambien funciona) con guidance 0 a 512x512, y para el ejemplo en stable-diffusion.cpp se usaron 5 pasos con Euler y text CFG 1.0.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada. Como referencia cualitativa, se puede comparar con otros adaptadores LoRA de pixel art para modelos de difusion (por ejemplo, adaptadores para Stable Diffusion o Flux), pero no se dispone de parametros, contexto ni rendimiento medido de esas alternativas en esta busqueda.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krea 2 PixelArt 16x16 | LoRA rango 32 sobre Krea 2 | no aplica | metricas propias de rejilla y clave de color | krea-2-community-license | Hugging Face, diffusers y stable-diffusion.cpp |
| Alternativas LoRA de pixel art | no disponible | no aplica | no disponible | variable | no disponible |

## Limitaciones y advertencias

- Ambos adaptadores estan disenados exclusivamente para iconos de 16x16. El adaptador de icono unico centra un solo objeto; el de hoja coloca un objeto por cuadrante. No estan pensados para sprites de mayor resolucion ni para animaciones.
- No se deben pedir objetos de color magenta puro, ya que el magenta esta reservado como clave de color del fondo y se eliminaria en el postprocesado.
- Los colores a veces salen mas oscuros de lo solicitado: la model card advierte que una "oveja verde esmeralda" puede salir verde oscuro.
- Riesgo de huecos no deseados: en 13 de 80 renders aparecieron zonas transparentes en asas o anillos, lo que puede requerir revision manual antes de usar el sprite.
- En la variante de hoja 2x2, los contornos de iconos vecinos pueden tocarse, por lo que conviene revisar los bordes de cada cuadrante antes de recortar.
- El modelo solo entiende prompts en ingles; no se ha validado su comportamiento en castellano ni en otros idiomas.
- La licencia es la Krea 2 Community License, no una licencia de codigo abierto permisiva. Es necesario revisar sus terminos antes de cualquier uso comercial, ya que puede imponer restricciones adicionales.
- Las salidas son generadas por IA; la model card recuerda que donde la ley o la politica de la plataforma lo exijan, puede ser necesario declarar su origen. La model card original queda truncada en ese punto, por lo que no se dispone del texto completo de esa advertencia.
- No se han publicado evaluaciones de sesgo ni de alucinacion visual (objetos incoherentes) mas alla de las metricas de rejilla y clave de color.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Angais/Krea-2-PixelArt-16x16
- LoRA de icono unico (safetensors): https://huggingface.co/Angais/Krea-2-PixelArt-16x16/resolve/main/krea-2-pixelart-16x16.safetensors
- LoRA de hoja 2x2 (checkpoint-1000): https://huggingface.co/Angais/Krea-2-PixelArt-16x16/resolve/main/sheet/checkpoint-1000.safetensors
- Dataset sintetico de entrenamiento: https://huggingface.co/datasets/Angais/krea-2-pixelart-16x16-synthetic
- Modelo base Krea 2 Raw: https://huggingface.co/krea/Krea-2-Raw
- Modelo base Krea 2 Turbo: https://huggingface.co/krea/Krea-2-Turbo
- Licencia Krea 2 Community License: https://cdn.jsdelivr.net/gh/krea-ai/krea-2@db3984fbc6e13b34c0064990fc2d95ac64d00058/assets/hf_samples/LICENSE.pdf
- Denoiser IQ4_XS para baja VRAM: https://huggingface.co/gguf-org/krea-2-gguf/blob/main/krea2_turbo-iq4_xs.gguf
- Text encoder Qwen3-VL-4B-Instruct Q4_K_M: https://huggingface.co/unsloth/Qwen3-VL-4B-Instruct-GGUF/blob/main/Qwen3-VL-4B-Instruct-Q4_K_M.gguf
- VAE de Wan 2.1 (repack de ComfyUI): https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/blob/main/split_files/vae/wan_2.1_vae.safetensors
- stable-diffusion.cpp (release master-1047-984eb06): https://github.com/leejet/stable-diffusion.cpp/releases/tag/master-1047-984eb06
