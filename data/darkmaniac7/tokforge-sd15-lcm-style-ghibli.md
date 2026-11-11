# darkmaniac7/TokForge-SD15-LCM-Style-Ghibli

## Resumen

TokForge-SD15-LCM-Style-Ghibli es un paquete de inferencia para generación de imágenes texto-a-imagen derivado de Stable Diffusion 1.5, publicado por TokForge (darkmaniac7) en formato MNN para ejecución en dispositivo (Android, CPU). Combina tres componentes fusionados en el UNet: el checkpoint DreamShaper 7 de Lykon como base, el adaptador LCM-LoRA SD1.5 de latent-consistency para muestreo en pocos pasos, y el LoRA de estilo `stable-diffusion-v1-5-lora-iv-ghibli` de osmr, que fija una estética de ilustración de película animada dibujada a mano.

El modelo resuelve un problema muy concreto: llevar generación de imágenes por difusión a teléfonos Android sin GPU dedicada, con un grafo UNet exportado a MNN, pesos de 8 bits asimétricos y muestreo sin guiado (CFG 1.0) en 4 pasos a 512x512. No es un modelo entrenado desde cero ni un checkpoint publicable en safetensors para diffusers: es un artefacto de despliegue empaquetado (9 archivos, 1,21 GB) pensado para la app TokForge.

Es relevante por su valor como referencia de ingeniería de despliegue: muestra cómo fusionar LCM-LoRA y un LoRA de estilo en el UNet, cuantizar a 8 bits y exportar a MNN. Su utilidad fuera de TokForge es limitada, ya que el repositorio corresponde a la exportación batch-2 conservada solo por compatibilidad con versiones antiguas de la app (por ejemplo, 3.6.0 beta 12); la versión vigente descarga la variante batch-1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (text encoder CLIP ViT-L/14, UNet, VAE decoder) |
| Parametros totales | no disponible (UNet con pesos de 8 bits: 862 MB; text encoder f16: 170 MB; VAE decoder f16: 99 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (prompt de texto CLIP; límite de tokens no especificado en la información) |
| Tipos de cuantizacion | UNet en 8 bits asimétrico; text encoder y VAE decoder en f16 |
| Idiomas soportados | en |
| Licencia | CreativeML OpenRAIL-M, más los términos de Civitai de Lykon para DreamShaper (prohíbe la venta) |
| Formato de pesos | MNN (`.mnn` grafo + `.mnn.weight`), más tokenizer CLIP (`vocab.json`, `merges.txt`) y `alphas.txt` |
| Resolucion de salida | 512x512 fija |
| Pasos de muestreo | 4 por defecto, hasta 8 |
| CFG scale | 1.0 (sin guiado, sin prompt negativo) |
| Tamano del repositorio | 1,2 GB (9 archivos) |
| Libreria / runtime | MNN |
| Plataforma | Android (CPU), app TokForge |

## Arquitectura y entrenamiento

La arquitectura es la de Stable Diffusion 1.5 sin modificaciones estructurales: text encoder CLIP ViT-L/14, UNet de difusión latente y VAE decoder. Sobre el checkpoint base DreamShaper 7 se fusionan, en tiempo de exportación, dos adaptadores LoRA en el UNet: el LCM-LoRA SD1.5, que habilita muestreo consistente en 4 pasos, y el LoRA de estilo `stable-diffusion-v1-5-lora-iv-ghibli` de osmr, que impregna todas las salidas con la estética de ilustración de película animada. No hay entrenamiento desde cero ni datos de entrenamiento propios: el autor documenta el proceso como carga en diffusers de `Lykon/dreamshaper-7`, carga y fusión de los LoRA y exportación a MNN.

La innovación está en el empaquetado para dispositivo. El UNet se exporta con pesos de 8 bits asimétricos y grafo fijo; el text encoder y el VAE decoder usan los archivos MNN de referencia de SD1.5 en f16. Este repositorio concreto es la exportación batch-2 (pase condicional y no condicional en un solo lote de dos), fijada a 512x512. Dado que LCM muestrea sin guiado (CFG 1.0), el pase no condicional no aporta nada; por eso la variante batch-1 usa un grafo con altura y anchura dinámicas (`sample=[1,4,-1,-1]`) y ejecuta un único pase condicional por paso. Las versiones antiguas de TokForge alimentan siempre un lote de dos y fallarían con la exportación batch-1, de ahí que ambos repositorios se mantengan separados. No se documentan fases de RLHF ni DPO.

## Capacidades

- Generación de imágenes texto-a-imagen a 512x512 en 4 pasos con muestreo LCM sin guiado (CFG 1.0).
- Estilo fijo de ilustración de cuento: aspecto de película animada dibujada a mano, con color y luz suaves, aplicado de forma consistente por el LoRA fusionado.
- Refinamiento opcional hasta 8 pasos para mayor detalle.
- Ejecución en dispositivo (on-device) en CPU de teléfonos Android, sin conexión a servicios en la nube.
- Prompts en inglés (único idioma declarado).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión de entrada ni audio.
- No admite prompt negativo en la configuración recomendada (CFG 1.0).
- No admite resolución variable en esta exportación (grafo fijo a 512x512).

## Casos de uso

- Generación de ilustraciones de cuento en el propio teléfono: la app TokForge usa el paquete para producir imágenes 512x512 en 4 pasos sin conexión, adecuado para bocetos de personajes y escenas con estética de película animada.
- Prototipado de arte conceptual móvil: un ilustrador puede iterar prompts en inglés y obtener variaciones coherentes en segundos en un dispositivo Android, sin depender de una GPU externa.
- Aplicaciones Android con generación de imágenes embebida: el formato MNN y los pesos de 8 bits (862 MB de UNet) permiten integrar el modelo en apps que ya usan el runtime MNN, siempre que se respete la licencia.
- Compatibilidad con versiones antiguas de TokForge: este repositorio sirve como artefacto de despliegue para builds como 3.6.0 beta 12, que descargan el bundle batch-2 por su nombre exacto.
- Referencia de ingeniería para despliegue de difusión en móvil: sirve para estudiar la fusión de LCM-LoRA y LoRA de estilo en el UNet, la cuantización a 8 bits asimétrico y la exportación a MNN con grafo fijo frente a dinámico.
- Generación de material ilustrativo para cuentos y contenido educativo: el estilo fusionado produce resultados homogéneos sin necesidad de describir la estética en cada prompt, útil para series de imágenes con coherencia visual.
- Docencia y demostraciones de difusión latente: el bundle permite mostrar en un teléfono el pipeline SD1.5 completo (CLIP, UNet, VAE) con muestreo en pocos pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es en CPU de Android. El paquete pesa 1,21 GB en disco y necesita más RAM libre que sus 1,13 GB de pesos.
- RAM del dispositivo: las versiones antiguas de TokForge lo listaban para teléfonos con 8 GB de RAM o más; la app actual no le asigna clase de catálogo.
- GPU: no se requiere GPU dedicada; no hay datos de ejecución en A100, H100 o RTX 4090 para este formato MNN.
- GPU de consumo: no aplica, al ser un bundle MNN para CPU móvil.
- Despliegue: runtime MNN dentro de la app TokForge (Android; también hay TestFlight para iOS, aunque no se especifica soporte de este bundle en iOS). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a difusión MNN.
- Latencia y throughput: no disponibles en la información proporcionada; el muestreo es de 4 pasos (hasta 8) a 512x512, lo que reduce el coste frente a los 20-50 pasos habituales de SD1.5.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TokForge-SD15-LCM-Style-Ghibli (este) | no disponible (UNet 8 bits, 862 MB) | 512x512 fija, 4 pasos, CFG 1.0 | sin benchmarks publicados | CreativeML OpenRAIL-M + términos de Civitai de Lykon (no venta) | Hugging Face, runtime MNN, app TokForge |
| TokForge-SD15-LCM-Style-Ghibli-b1 | mismos pesos; solo cambia el grafo UNet | 512x512 con altura y anchura dinámicas, 1 pase condicional por paso | sin benchmarks publicados | misma | Hugging Face; usado por TokForge 3.6.0 beta 24 y posteriores (incluye 1.3.x) |
| Lykon/dreamshaper-7 | no disponible | SD1.5, resolución nativa 512x512 | sin datos en esta ficha | CreativeML OpenRAIL-M + términos de Civitai (no venta) | Hugging Face, formato diffusers |
| latent-consistency/lcm-lora-sdv1-5 | adaptador LoRA (no disponible el número) | aplicable a SD1.5 | sin datos en esta ficha | no disponible en la información | Hugging Face |
| osmr/stable-diffusion-v1-5-lora-iv-ghibli | adaptador LoRA de estilo (no disponible el número) | aplicable a SD1.5 | sin datos en esta ficha | no disponible en la información | Hugging Face |

## Limitaciones y advertencias

- Estilo fijo: el LoRA de ilustración está fusionado en el UNet, por lo que todas las imágenes adoptan la estética de película animada; no se puede desactivar sin volver al checkpoint base.
- Resolución bloqueada a 512x512 en esta exportación (grafo batch-2 con latente fijo de 64x64); la variante batch-1 permite altura y anchura dinámicas.
- Solo prompts en inglés; no se declara soporte multilingüe.
- Sin prompt negativo útil: a CFG 1.0 el pase no condicional no aporta y no se recomienda usar negative prompt.
- Artefacto específico de plataforma: formato MNN para el runtime de TokForge; no es directamente utilizable en diffusers, ComfyUI u otros pipelines sin reconversión.
- Repositorio de compatibilidad: la app actual descarga la variante batch-1; este bundle solo lo usan builds antiguas, por lo que no recibirá mejoras funcionales.
- Licencia restrictiva para uso comercial: CreativeML OpenRAIL-M se suma a los términos de Civitai de DreamShaper, que prohíben la venta; conviene revisar ambas antes de cualquier uso comercial.
- Riesgo de sesgos y alucinaciones visuales heredado de SD1.5 y DreamShaper 7: sesgos demográficos y estilísticos del dataset original, y generación de anatomía o texto incoherentes, especialmente a 4 pasos.
- Requisito de memoria: necesita más RAM libre que sus 1,13 GB de pesos; en dispositivos por debajo de 8 GB de RAM el comportamiento no está garantizado.
- Sin benchmarks publicados: no hay datos objetivos de calidad ni de latencia para evaluar en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/darkmaniac7/TokForge-SD15-LCM-Style-Ghibli
- Variante batch-1: https://huggingface.co/darkmaniac7/TokForge-SD15-LCM-Style-Ghibli-b1
- Colección TokForge SD1.5 LCM Styles (MNN): https://huggingface.co/collections/darkmaniac7/tokforge-sd15-lcm-styles-mnn-6af3fddeecdd665d9b523cbe
- Modelo base DreamShaper 7: https://huggingface.co/Lykon/dreamshaper-7
- LCM-LoRA SD1.5: https://huggingface.co/latent-consistency/lcm-lora-sdv1-5
- LoRA de estilo ghibli de osmr: https://huggingface.co/osmr/stable-diffusion-v1-5-lora-iv-ghibli
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Web de TokForge: https://tokforge.ai
- Discord de TokForge: https://discord.gg/Acv3CBtfVm
- Google Play (TokForge): https://play.google.com/store/apps/details?id=dev.tokforge
- iOS TestFlight (TokForge): https://testflight.apple.com/join/jnufjzRr
