# lyraaaa/krea2-landscape-realism

## Resumen

`lyraaaa/krea2-landscape-realism` es un adaptador LoRA (Low-Rank Adaptation) entrenado con la técnica DreamBooth sobre el modelo base Krea 2 de la empresa Krea, concretamente sobre el checkpoint **RAW** (`krea/Krea-2-Raw`). El autor, `lyraaaa`, ha publicado estos pesos en HuggingFace con licencia Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas. El propósito del adaptador es especializar la generación de imágenes de Krea 2 hacia paisajes con estética realista, activándose mediante la palabra desencadenante `TOK`.

Krea 2 se distribuye en dos variantes: **RAW** (el modelo base sin destilar, pensado para fine-tuning) y **Turbo** (una versión destilada que genera imágenes de alta calidad en solo 8 pasos de inferencia, sin necesidad de classifier-free guidance). La práctica recomendada por el propio ecosistema Krea es entrenar el LoRA sobre RAW y luego cargarlo sobre Turbo para obtener resultados rápidos y expresivos. Este adaptador sigue esa filosofía, permitiendo a desarrolladores e investigadores incorporar un estilo de paisaje realista en sus pipelines de generación de imágenes con un coste de entrenamiento mínimo y una inferencia eficiente.

El repositorio ocupa aproximadamente 1.0 GB y contiene los pesos en formato `safetensors`. No se proporcionan detalles sobre la arquitectura interna de Krea 2 (número de parámetros, tipo de transformer o difusión latente), ni sobre los datos de entrenamiento utilizados para este LoRA concreto. La integración con la librería `diffusers` es directa mediante `Krea2Pipeline`, lo que facilita su adopción en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Krea 2 (modelo de difusion texto-a-imagen) |
| Parametros totales | no disponible (el repo pesa 1.0 GB en safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagenes, no de texto) |
| Tipos de cuantizacion | no disponible (los pesos se publican en bfloat16 segun el ejemplo de uso) |
| Idiomas soportados | no disponible (se asume ingles para los prompts, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante **DreamBooth**, una tecnica que fine-tunea un modelo de difusion con unas pocas imagenes de un sujeto o estilo concreto, utilizando un identificador unico (aqui `TOK`) para anclar la nueva identidad visual. En este caso, el entrenamiento se realizo sobre el checkpoint `krea/Krea-2-Raw` usando el script oficial de entrenamiento de Krea 2 para `diffusers` (disponible en el repositorio de ejemplos de HuggingFace). El resultado es un LoRA que modifica los pesos del modelo base para generar paisajes realistas cuando se usa el token `TOK` en el prompt.

Krea 2 en si es un modelo de difusion de ultima generacion, aunque no se detallan aqui sus caracteristicas internas (si es un transformer de difusion, un U-Net, o una arquitectura hibrida). La distincion clave entre RAW y Turbo es que Turbo es una version destilada que reduce el numero de pasos de inferencia de decenas a 8, manteniendo calidad. El LoRA se entrena en RAW porque los gradientes son mas estables y la expresividad del adaptador se transfiere bien a Turbo, como se indica en la documentacion del modelo. No se especifican los datos de entrenamiento (numero de imagenes, resolucion, composicion del dataset) ni si se aplicaron tecnicas adicionales como regularizacion o prior preservation.

## Capacidades

- **Generacion de imagenes fotorrealistas de paisajes**: el modelo produce escenas naturales (montanas, bosques, costas, etc.) con un acabado realista cuando se activa con `TOK`.
- **Integracion con el pipeline de Krea 2 Turbo**: funciona con 8 pasos de inferencia y `guidance_scale=0.0`, lo que lo hace rapido y adecuado para iteraciones en tiempo real o generacion por lotes.
- **Compatibilidad con diffusers**: se puede cargar directamente con `Krea2Pipeline` y `load_lora_weights`, permitiendo combinarlo con otros LoRAs o ajustar su peso mediante tecnicas de fusion.
- **Personalizacion flexible**: al ser un LoRA, se puede mezclar con otros adaptadores para obtener estilos combinados (por ejemplo, paisaje realista + ilustracion).
- **Uso comercial permitido**: licencia Apache 2.0 tanto para el adaptador como para el modelo base (segun los metadatos), lo que elimina barreras legales en proyectos propietarios.

## Casos de uso

- **Creacion de fondos para videojuegos**: los estudios indie pueden generar entornos naturales realistas para niveles o escenas de apertura, usando `TOK` en prompts como "TOK, montanas al amanecer" y ajustando el LoRA con otros adaptadores para variar la iluminacion o la estacion.
- **Ilustracion de libros y cubiertas**: autores y editoriales pueden producir imagenes de paisajes para portadas o ilustraciones interiores sin depender de bancos de imagenes, manteniendo una coherencia estilistica gracias al token fijo.
- **Diseno de entornos arquitectonicos**: arquitectos y disenadores de interiores pueden generar visualizaciones de paisajes circundantes a proyectos inmobiliarios, integrando el LoRA en un pipeline de difusion para explorar multiples opciones rapidamente.
- **Marketing inmobiliario**: agencias pueden crear imagenes atractivas de ubicaciones rurales o costeras para anuncios, con la ventaja de poder iterar sobre el estilo realista sin necesidad de sesiones fotograficas.
- **Arte conceptual para cine y animacion**: los equipos de preproduccion pueden generar conceptos de localizaciones naturales para storyboards o moodboards, utilizando la velocidad de Turbo para probar decenas de variaciones en minutos.
- **Generacion de contenido para redes sociales**: creadores de contenido pueden producir imagenes de paisajes para publicaciones o banners, con la posibilidad de fusionar este LoRA con otros para obtener resultados unicos y rapidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas como FID, CLIP score o comparativas con otros modelos de generacion de imagenes. La unica referencia de rendimiento es la receta de inferencia de Turbo: 8 pasos con `guidance_scale=0.0`, que sugiere una latencia baja en GPUs modernas, pero sin cifras concretas.

## Requisitos de hardware

- **VRAM estimada**: no hay datos oficiales. Dado que el LoRA pesa 1.0 GB y el modelo base Krea 2 no especifica su tamano, se estima que se necesitan al menos 8 GB de VRAM para inferencia en bfloat16 (valores tipicos para modelos de difusion de ~2-3B parametros). Con cuantizacion a 8 bits podria bastar con 6 GB, pero no esta confirmado.
- **GPUs recomendadas**: para una experiencia fluida con 8 pasos, se recomienda una GPU con al menos 16 GB de VRAM, como RTX 4080/4090, A100 o H100. En GPUs de 8 GB (RTX 3060/3070, L4) la generacion seria posible pero con mayor latencia.
- **Compatibilidad con consumer GPU**: si, siempre que se disponga de al menos 8 GB de VRAM y se use el checkpoint Turbo. Para entrenamiento del LoRA (no necesario si solo se usa), se requeriria mas VRAM (24 GB o mas).
- **Opciones de despliegue**: el ejemplo oficial usa `diffusers` con `Krea2Pipeline`. No se mencionan otros backends como vLLM, llama.cpp o TGI, ya que estos estan orientados a modelos de lenguaje, no a difusion. Para despliegue en produccion se podria usar un servidor de inferencia como HuggingFace Inference Endpoints o un contenedor propio con FastAPI.
- **Latencia y throughput**: no disponibles. La receta de 8 pasos sugiere que en una A100 se podrian generar varias imagenes por segundo, pero es una estimacion sin base documentada.

## Comparativa con modelos similares

No se dispone de informacion sobre otros LoRAs de paisajes realistas especificamente entrenados para Krea 2 en el momento de redactar esta ficha. Comparar con adaptadores de otros modelos base (SDXL, Flux) no seria riguroso sin datos de rendimiento o calidad. Por tanto, no hay una comparativa directa disponible.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: no se documentan sesgos especificos, pero como todo modelo de generacion de imagenes, puede producir artefactos (duplicaciones, deformaciones) en elementos complejos como arboles o rocas, especialmente con prompts poco descriptivos.
- **Dependencia del modelo base**: el LoRA solo funciona con Krea 2 (RAW o Turbo). No es portable a otros modelos de difusion. Si Krea 2 cambia su arquitectura en futuras versiones, el adaptador podria quedar obsoleto.
- **Idioma de los prompts**: no se especifica, pero los modelos de difusion suelen funcionar mejor con prompts en ingles. El token `TOK` debe usarse tal cual, sin traduccion.
- **Datos de entrenamiento desconocidos**: el autor no detalla el dataset utilizado para el LoRA. Esto implica que el estilo "realismo de paisaje" puede estar sesgado hacia ciertos tipos de paisaje (por ejemplo, entornos templados) y no cubrir otros (desiertos, tundra).
- **Licencia del modelo base**: aunque el adaptador es Apache 2.0, el modelo base `krea/Krea-2-Raw` y `krea/Krea-2-Turbo` tienen su propia licencia (no se detalla en la informacion proporcionada). Es responsabilidad del usuario verificar la licencia del modelo base antes de usar el adaptador en produccion.
- **Sin garantias de calidad**: al ser un repositorio sin descargas ni valoraciones, no hay evidencia de que el LoRA funcione bien en todos los escenarios. Se recomienda probar exhaustivamente antes de integrarlo en un flujo critico.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lyraaaa/krea2-landscape-realism
- Documentacion del trainer de Krea 2 para diffusers: https://github.com/huggingface/diffusers/blob/main/examples/dreambooth/README_krea2.md
- Paper de DreamBooth: https://dreambooth.github.io/
- Documentacion sobre carga de LoRAs en diffusers: https://huggingface.co/docs/diffusers/main/en/using-diffusers/loading_adapters
