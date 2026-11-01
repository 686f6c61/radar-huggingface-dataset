# abbuibuibui/YukiYoshikawa-Lora

## Resumen

YukiYoshikawa-Lora es un LoRA de personaje para modelos de difusión SDXL, concretamente entrenado sobre el checkpoint waiIllustriousSDXL v17, que representa a Yuki Yoshikawa, personaje de la serie *Horimiya*. Lo desarrolla el usuario abbuibuibui y se distribuye a través de HuggingFace bajo licencia CreativeML OpenRAIL-M. No es un modelo de lenguaje ni un modelo fundacional: es un adaptador de bajo rango (LoRA) que modifica el comportamiento de un modelo base SDXL para generar de forma consistente a este personaje concreto.

El repositorio incluye siete pesos correspondientes a las épocas E1 a E7 del entrenamiento, con E6 (`yuki_yoshikawa-000006.safetensors`) recomendado como opción por defecto a fuerza 0.8. Cada archivo pesa 456.494.196 bytes (unos 456 MB), y el repositorio completo ocupa 3,2 GB. El modelo está pensado para flujos de generación de imagen con ComfyUI o la librería diffusers, y su utilidad es la de fijar la identidad visual del personaje (pelo rubio ondulado largo, ojos marrones) y varios conjuntos de ropa mediante tokens de activación.

Es relevante para quien genere ilustración anime con modelos Illustrious o NoobAI y necesite consistencia de personaje entre imágenes. La model card documenta de forma poco habitual una evaluación comparativa entre épocas, con matriz de escenas y fuerzas, lo que facilita elegir el peso adecuado. Es un derivado hecho por fans, sin relación oficial con los titulares de los derechos de *Horimiya*.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre SDXL (modelo base waiIllustriousSDXL v17) |
| Parámetros totales | no disponible (adaptador de bajo rango; cada archivo pesa 456.494.196 bytes) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusión de imagen) |
| Tipos de cuantización | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | en, zh (según etiquetas y model card) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (compatible con diffusers) |

## Arquitectura y entrenamiento

Se trata de un LoRA de personaje aplicado sobre un modelo de difusión latente SDXL, en concreto el checkpoint comunitario waiIllustriousSDXL v17, perteneciente a la familia Illustrious. El adaptador inyecta matrices de bajo rango en las capas del UNet y del text encoder del modelo base, de modo que se requiere cargar primero el checkpoint SDXL y después el LoRA con la fuerza indicada. El repositorio contiene siete ficheros correspondientes a las épocas E1 a E7; el fichero sin numerar (`yuki_yoshikawa.safetensors`) es la época final E7 y su SHA difiere del de E1–E6.

El entrenamiento se realizó sobre el dataset público abbuibuibui/YukiYoshikawa-Dataset, con captions que usan `keep_tokens = 2`. Las captions conservan normalmente solo el nombre y el token de ropa, y a menudo omiten el color de pelo y de ojos; los términos de identidad documentados en la model card se leyeron de las imágenes de entrenamiento. No se detalla en la información disponible el número de imágenes, el número de pasos, la tasa de aprendizaje ni la composición exacta del dataset. La model card describe una evaluación horizontal con 10 escenas por 4 fuerzas sobre las épocas E5, E6 y E7, con generación en ComfyUI sobre una DGX y sin retoque posterior.

## Capacidades

- Generación de retratos y cuerpos completos del personaje Yuki Yoshikawa con identidad consistente (pelo rubio ondulado largo, ojos marrones) a fuerzas de 0.6–0.8.
- Control de vestuario mediante tokens específicos: `yuki_yoshikawa_school_uniform` (camisa blanca, falda plisada azul marino, calcetines oscuros hasta la rodilla, mocasines marrones, bolso azul), `yuki_yoshikawa_winter_accessories` (cárdigan beige abierto, blusa blanca, falda larga marrón oscuro con cinturón, bailarinas marrones) y `yuki_yoshikawa_sports_t_shirt`.
- Composición de escenas variadas: retrato frontal, cuerpo completo con uniforme escolar, accesorios de invierno, calle nocturna.
- Integración con prompts de estilo anime (etiquetas como `masterpiece`, `best quality`, `anime screencap`, `absurdres`).
- Compatibilidad con merges de Illustrious y NoobAI, además del checkpoint base recomendado.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje; es exclusivamente un adaptador de generación de imagen.

## Casos de uso

- Ilustración de fan art consistente: generar múltiples imágenes del personaje manteniendo rasgos faciales y peinado estables entre escenas, usando E6 a fuerza 0.8 como configuración por defecto.
- Creación de tiras cómicas o viñetas: al fijar la identidad con el token `yuki_yoshikawa` y alternar tokens de vestuario, se pueden producir paneles coherentes de una misma historia.
- Diseño de variantes de vestuario: comparar el mismo personaje con uniforme escolar y con accesorios de invierno para explorar estilos antes de un encargo mayor.
- Pruebas de pipelines de generación en ComfyUI: sirve como caso de prueba reproducible con parámetros fijos (Euler a, 28 pasos, CFG 4.5, CLIP skip 2, 832×1216) para validar flujos de trabajo.
- Prototipado de personajes para proyectos derivados: útil para maquetas visuales de fan projects, siempre respetando la licencia y los derechos del personaje original.
- Comparación de épocas y fuerzas en investigación aplicada: el repositorio incluye siete pesos y una matriz de evaluación, lo que permite estudiar cómo varía el ajuste al personaje según la época y la intensidad del LoRA.
- Generación de material para redes o comunidades de fans: retratos y escenas nocturnas con el personaje, con prompts negativos ya documentados para evitar deriva de color de pelo u ojos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una evaluación cualitativa comparativa entre épocas (E1, E5, E6, E7) y fuerzas, pero no métricas numéricas como FID, CLIP score ni similitud facial.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Al ser un LoRA sobre SDXL, los requisitos son los del checkpoint base SDXL, típicamente 8–12 GB de VRAM para inferencia en fp16 con resolución 832×1216, aunque esta cifra no se confirma en la información proporcionada.
- GPU recomendadas: la model card menciona generación en una DGX con ComfyUI, lo que implica GPUs de数据中心 (A100/H100). Para uso doméstico, una RTX 4090 o RTX 3090 debería ser suficiente para SDXL, aunque no se detalla.
- ¿Cabe en GPU de consumo? Presumiblemente sí, en GPUs con 8 GB o más, dado que SDXL es el modelo base, pero no se confirma en la información disponible.
- Opciones de despliegue: ComfyUI (usado en la evaluación), diffusers (librería declarada), y cualquier frontend compatible con SDXL y LoRA (AUTOMATIC1111, Forge, etc.).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros LoRA de personaje comparables ni datos de rendimiento relativo.

## Limitaciones y advertencias

- Es un derivado hecho por fans: los derechos del personaje y de la obra original pertenecen a sus titulares; no es un producto oficial.
- La licencia CreativeML OpenRAIL-M impone restricciones de uso (prohibición de usos dañinos, difamatorios o ilegales) y exige que los usos derivados respeten sus términos; conviene revisarla antes de uso comercial.
- Riesgo de deriva de identidad: sin el token de nombre, a fuerzas medias todavía se filtra el pelo rubio largo y el rostro característico, lo que puede contaminar otras generaciones.
- A fuerza 1.0 con `yuki_yoshikawa_winter_accessories` las bailarinas suelen convertirse en botas y cambia la pose de brazos; se recomienda 0.6–0.8 para mantener el aspecto de las imágenes de entrenamiento.
- Sin token de vestuario, a 0.8 el modelo tiende a generar un vestido camisero gris oscuro sobredimensionado y botas marrones, no el uniforme escolar.
- La calidad depende fuertemente del checkpoint base: se recomienda waiIllustriousSDXL v17 o merges Illustrious/NoobAI; otros modelos SDXL pueden degradar el resultado.
- Las captions de entrenamiento omiten con frecuencia color de pelo y ojos, por lo que esos rasgos dependen del prompt y del prompt negativo para mantenerse estables.
- No hay datos publicados sobre sesgos, tasas de alucinación visual ni robustez fuera del dominio anime.
- El repositorio incluye siete pesos; usar una época distinta de E6 puede dar resultados diferentes en vestuario y pose, como documenta la propia model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abbuibuibui/YukiYoshikawa-Lora
- Dataset de entrenamiento: https://huggingface.co/datasets/abbuibuibui/YukiYoshikawa-Dataset
- Notas de evaluación en chino: `evaluation/横向测评记录.md` (dentro del repositorio)
- README en chino: `README_zh.md` (dentro del repositorio)
- Modelo base: waiIllustriousSDXL v17 (no se proporciona enlace directo en la información disponible)
