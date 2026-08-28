# Allan143/H3_Character_Sheet_Generator

## Resumen

H3_Character_Sheet_Generator es un workflow de ComfyUI, no un modelo base, diseñado para generar hojas de referencia de personaje con múltiples ángulos (front, laterales, trasero y primeros planos) a partir de hasta nueve imágenes de entrada. Lo desarrolló el usuario PoopMan333 y se distribuye en Hugging Face; la versión referenciada (Allan143) es un fork o copia del original. El workflow aprovecha el modelo de generación de vídeo MiniMax H3, que mantiene consistencia entre fotogramas, para crear una rotación lenta de 360 grados del personaje y extraer después seis o cuatro fotogramas que se cosen en una única lámina.

La relevancia actual reside en que resuelve un problema clásico de la generación de imágenes: la inconsistencia de identidad al generar varias vistas de un mismo personaje por separado. Al generar todas las vistas en una única pasada de vídeo, el personaje mantiene rasgos, vestimenta y colores estables. El workflow incluye dos variantes (6 paneles y 4 paneles más rápida), soporta conversión de anime a realista y también funciona con objetos. No se proporcionan especificaciones técnicas del modelo subyacente en la información disponible, más allá de que se basa en MiniMax H3 y requiere varios componentes descargables (diffusion model, text encoder, VAEs, LoRA opcional).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Workflow de ComfyUI basado en MiniMax H3 (modelo de generacion de video) |
| Parametros totales | no disponible (depende del modelo MiniMax H3 subyacente) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (version low-VRAM), BF16 (para LoRA turbo) |
| Idiomas soportados | no disponible (los prompts se escriben en ingles) |
| Licencia | minimax-h3-community-license (ver enlace en la model card) |
| Formato de pesos | safetensors (modelos de difusion, text encoder, VAEs, LoRA) y JSON (workflow de ComfyUI) |

## Arquitectura y entrenamiento

El workflow no es un modelo entrenado, sino una composicion de nodos de ComfyUI que orquesta la generacion con MiniMax H3. MiniMax H3 es un modelo de generacion de video que produce secuencias coherentes de fotogramas; el workflow lo utiliza para generar un video corto con una camara en orbita lenta alrededor del personaje, sin cortes bruscos. De ese video se extraen seis o cuatro fotogramas que se ensamblan en una hoja de referencia.

No se dispone de informacion sobre el entrenamiento de MiniMax H3 (numero de tokens, dataset, tecnicas de RLHF o DPO) en la documentacion proporcionada. La innovacion tecnica del workflow reside en el uso de la generacion de video como mecanismo de consistencia de personaje: al ser una unica pasada generativa, los fotogramas comparten latente y no pueden divergir entre si, evitando las variaciones tipicas de generar imagenes independientes.

## Capacidades

- Generacion de hojas de personaje con 6 o 4 vistas (frontal, lateral, trasero y primeros planos) a partir de hasta 9 imagenes de referencia.
- Consistencia de personaje alta: los rasgos faciales, vestimenta y colores se mantienen estables entre vistas porque provienen de un unico video.
- Composicion de personaje por partes: se pueden combinar elementos de distintas imagenes (cara de una, armadura de otra, sombrero de una tercera) describiendo en el prompt que tomar y que ignorar de cada imagen.
- Conversion de estilo anime a realista mediante un prompt B modificado.
- Generacion de objetos con multiples angulos (recomendado aportar mas vistas de referencia).
- Salidas opcionales: video de rotacion 360 completo y fotogramas individuales para su uso posterior como referencias.
- Integracion con ComfyUI mediante nodos estandar; solo requiere nodos personalizados opcionales (KJNodes y rgthree) para el grupo de aceleracion.

## Casos de uso

- Diseño de personajes para produccion audiovisual: un ilustrador o estudio de animacion puede generar una hoja de referencia completa de un personaje original a partir de bocetos sueltos, garantizando que todas las vistas sean coherentes para su uso en modelado 3D o animacion 2D.
- Creacion de personajes para videojuegos: los artistas de concepto pueden alimentar el workflow con referencias parciales (una cara, una armadura, un arma) y obtener una hoja de modelo con vistas multiples lista para el pipeline de produccion.
- Consistencia de personajes en novelas graficas o comics: un autor independiente puede generar la misma figura en varias poses y angulos sin que el rostro o la ropa cambien entre paginas, usando la hoja generada como guia de estilo.
- Adaptacion de personajes anime a estilos realistas: los creadores de contenido pueden transformar un personaje anime existente en una version realista manteniendo los rasgos identificativos, util para fan art o proyectos de reimaginacion.
- Diseño de objetos de atrezo: un disenador de props puede generar vistas multiples de un objeto (escudo, arma, herramienta) a partir de una o dos imagenes de referencia, obteniendo una hoja util para modelado 3D o documentacion.
- Generacion de referencias para cosplay: un cosplayer puede crear una hoja de referencia de un personaje desde varias angulos para guiar la confeccion del disfraz, combinando imagenes de distintas fuentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos cuantitativos de calidad de imagen, velocidad de generacion o comparaciones con otros metodos de generacion de hojas de personaje.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la documentacion. Los modelos INT8 indicados son versiones de baja VRAM, por lo que se espera que puedan ejecutarse en GPUs de consumo con 8-12 GB, aunque sin confirmacion.
- El text encoder (qwen3vl_32b) es la parte mas pesada; la model card sugiere que las versiones de mayor precision dan mejor adherencia al prompt, lo que implica que usuarios con VRAM abundante pueden optar por ellas.
- El workflow genera 124 fotogramas para obtener 6 paneles, lo que implica un tiempo de generacion considerable. La version de 4 paneles reduce el numero de fotogramas en aproximadamente un 40% y es notablemente mas rapida.
- Despliegue: requiere ComfyUI instalado localmente. Los nodos de descarga de modelos estan integrados en el workflow. No se menciona soporte para vLLM, Ollama u otros motores de inferencia, ya que no es un modelo de lenguaje sino un pipeline de generacion de imagenes/video.
- La latencia y el throughput no estan documentados; la unica indicacion es que es "lento" segun el autor.

## Comparativa con modelos similares

No disponible. No se han encontrado en la informacion proporcionada comparaciones con otros workflows o modelos que generen hojas de personaje con consistencia. Alternativas teoricas como generar imagenes independientes con modelos de difusion (SDXL, Flux) y unirlas manualmente no son directamente comparables porque no ofrecen la misma garantia de consistencia, pero no hay datos objetivos de rendimiento para contrastar.

## Limitaciones y advertencias

- Lentitud elevada: se generan 124 fotogramas para aprovechar solo 6, lo que hace que el proceso sea considerablemente lento en comparacion con la generacion de imagenes individuales.
- Dependencia de MiniMax H3: el workflow no funciona sin los modelos subyacentes (diffusion model, text encoder, VAEs) que deben descargarse por separado; si esos modelos cambian o dejan de estar disponibles, el workflow puede romperse.
- Licencia restrictiva: la licencia minimax-h3-community-license puede limitar el uso comercial o la redistribucion; es necesario revisar los terminos exactos antes de usar el workflow en proyectos comerciales.
- Calidad variable segun el prompt: el autor advierte que si no se describen explicitamente las partes a ignorar de cada imagen de referencia, pueden colarse fondos no deseados o rasgos incorrectos.
- Deriva en la vestimenta: aunque la cara se mantiene consistente, la ropa tiende a desviarse si no se describe con palabras concretas ("abrigo negro de cuello alto con hebillas de plata" en lugar de "el abrigo de la imagen 2").
- Riesgo de alucinaciones visuales: como cualquier modelo generativo, puede producir detalles inexistentes o distorsiones, especialmente en objetos o personajes complejos.
- Sin soporte de idiomas: los prompts se escriben en ingles; no hay indicacion de soporte multilingue en la interfaz del workflow.

## Enlaces

- Repositorio original: https://huggingface.co/PoopMan333/H3_Character_Sheet_Generator
- Repositorio del fork (Allan143): https://huggingface.co/Allan143/H3_Character_Sheet_Generator
- Licencia MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Nodos personalizados opcionales: https://github.com/kijai/ComfyUI-KJNodes y https://github.com/rgthree/rgthree-comfy
- Resena en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/h3-character-sheet-generator-poopman333
- Mencion en aibriefs.news: https://aibriefs.news/card/1202748c-d314-4967-8b65-41cfbff56b01
