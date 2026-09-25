# mahmudplx/coreml-epicrealism-6bit

## Resumen

`mahmudplx/coreml-epicrealism-6bit` es una conversión a Apple Core ML del modelo de difusión texto-a-imagen **epiCRealism** (`emilianJR/epiCRealism`), un ajuste fino de Stable Diffusion 1.5 orientado a retratos y estética fotorrealista cinematográfica. No se trata de un modelo nuevo ni de un reentrenamiento: es un cambio de formato (PyTorch a Core ML) con cuantización palettizada a 6 bits, pensado para ejecutarse en el Neural Engine de dispositivos Apple dentro de la aplicación iOS TokForge.

El repositorio es un espejo declarado de `darkmaniac7/TokForge-epiCRealism-CoreML-6bit`, copiado sin modificaciones para la aplicación LimitlessAI, y publicado por el usuario `mahmudplx`. La conversión se realizó con las herramientas oficiales de Apple (`ml-stable-diffusion`, script `torch2coreml`), usando atención `SPLIT_EINSUM_V2` y `--quantize-nbits 6`, lo que permite compilar con rapidez en el ANE y reducir la huella de memoria frente a pesos FP16.

La relevancia actual es acotada y muy específica: sirve para desarrolladores que necesitan generación de imágenes fotorrealistas **totalmente en el dispositivo**, sin enviar prompts a la nube, en el ecosistema Apple. Requiere iOS 17 o superior para la ruta palettizada a 6 bits; en iOS 16 la aplicación anfitriona recurre a un modelo FP16 alternativo. El repositorio tiene 0 descargas y 0 likes, por lo que su uso previsto es como componente interno de una app, no como modelo de referencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión latente (Stable Diffusion 1.5): UNet con atención cruzada, text encoder CLIP, VAE encoder/decoder |
| Parametros totales | No disponible en la model card. La arquitectura base SD-1.5 de la que deriva ronda los 1.000 M en el conjunto (UNet ~860 M, text encoder CLIP ViT-L/14 ~123 M, VAE ~84 M) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible como tal; el text encoder CLIP de SD-1.5 acepta 77 tokens de prompt |
| Tipos de cuantizacion | Pesos palettizados a 6 bits (paleta de 64 valores) en Core ML; existe variante FP16 de reserva en iOS 16 |
| Idiomas soportados | No declarados; el text encoder CLIP está entrenado predominantemente con texto en inglés |
| Licencia | CreativeML OpenRAIL-M (heredada de epiCRealism y de Stable Diffusion 1.5) |
| Formato de pesos | Core ML compilado: `TextEncoder.mlmodelc`, `Unet.mlmodelc`, `VAEDecoder.mlmodelc`, `VAEEncoder.mlmodelc`, más `vocab.json` y `merges.txt` |
| Resolucion nativa | 512x512 (fijada en el modelo compilado) |
| Pasos y CFG recomendados | 20-30 pasos, cfg-scale 7.0, atención split_einsum_v2, compute unit `.cpuAndNeuralEngine` |
| Tamano del repositorio | 1,9 GB (el árbol `Resources/` declarado ocupa ~913 MB) |
| Runtime minimo | iOS 17+ para pesos palettizados a 6 bits; iOS 16 requiere el modelo FP16 de reserva |

## Arquitectura y entrenamiento

El modelo subyacente es epiCRealism, un ajuste fino de Stable Diffusion 1.5 con orientación fotorrealista y cinematográfica, desarrollado por emilianJR y con más de un millón de descargas en Hugging Face. Stable Diffusion 1.5 es un modelo de difusión latente: un autoencoder variacional comprime la imagen a un espacio latente de menor dimensión, un UNet con bloques de atención cruzada realiza el proceso de eliminación de ruido condicionado por texto, y un text encoder CLIP ViT-L/14 proyecta el prompt al espacio de condicionamiento. El pipeline completo incluye además un VAE encoder, lo que en Core ML habilita flujos de imagen a imagen además de la generación desde cero.

En esta conversión no se ha reentrenado ni ajustado ningún peso: se cargó el checkpoint de difusores de `emilianJR/epiCRealism`, se convirtieron UNet, text encoder, VAE decoder y VAE encoder con `python_coreml_stable_diffusion.torch2coreml`, se aplicó una implementación de atención `SPLIT_EINSUM_V2` y se cuantizaron los pesos con palettización de 6 bits (`--quantize-nbits 6`). La palettización sustituye los pesos por índices a una tabla de 64 valores por grupo, lo que reduce el tamaño y, sobre todo, acelera la compilación y ejecución en el Neural Engine. La conversión alcanzó un pico de ~9,8 GB de RAM y no necesitó `--chunk-unet`. El paquete se generó con `--bundle-resources-for-swift-cli` para que el instalador de TokForge y `StableDiffusionPipeline` de Apple puedan cargarlo directamente.

## Capacidades

- Generación de imágenes fotorrealistas a partir de texto (text-to-image) a resolución nativa 512x512.
- Especialización en retratos y estética cinematográfica, rasgo heredado del ajuste fino epiCRealism.
- Flujos de imagen a imagen: el paquete incluye `VAEEncoder.mlmodelc`, por lo que el pipeline puede partir de una imagen de entrada y aplicar fuerza de denoising.
- Ejecución completamente en el dispositivo sobre el Apple Neural Engine, sin conexión a red ni envío de prompts a servidores externos.
- Integración directa con `StableDiffusionPipeline` de Apple y con el CLI de Swift de `ml-stable-diffusion`.
- No dispone de tool calling, function calling, soporte de agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento. Es un modelo exclusivamente generativo de imágenes, no un modelo de lenguaje.

## Casos de uso

- Generación de retratos en apps móviles: la app TokForge usa este modelo para producir retratos fotorrealistas de 512x512 con 20-30 pasos y cfg 7.0, aprovechando el rango de ajuste de epiCRealism para rostros y luz cinematográfica.
- Generación de imágenes sin conexión y con privacidad: al ejecutarse íntegramente en el ANE, ningún prompt ni imagen sale del dispositivo, lo que resulta adecuado para aplicaciones de salud, diarios personales o entornos sin conectividad.
- Creación de avatares y contenido para redes: un desarrollador puede integrar el paquete en una app iOS para generar avatares, fondos o ilustraciones de perfil de forma instantánea, sin costes de API por imagen.
- Remezcla de fotos con imagen a imagen: gracias al VAE encoder incluido, se puede partir de una foto del carrete y aplicar transformaciones estilísticas o de iluminación controlando la fuerza de denoising y manteniendo la composición original.
- Prototipado rápido de conceptos visuales en el propio iPhone o iPad: iteración de prompts y semillas en el dispositivo antes de escalar la producción a un pipeline en servidor con el checkpoint original en PyTorch.
- Generación de recursos gráficos para juegos o prototipos de producto: texturas, carteles y fondos de 512x512 generados por lotes en Mac con Apple Silicon, sin depender de servicios externos de imagen.
- Funcionalidad de valor añadido dentro de una app existente: dado que el paquete se distribuye como recursos Core ML compilados, se puede empaquetar como descarga opcional y ofrecer generación de imágenes como característica premium sin reentrenar nada.
- Pruebas comparativas de cuantización: sirve como referencia para medir la pérdida de calidad de la palettización a 6 bits frente a FP16 en la misma arquitectura, útil para equipos que evalúan estrategias de despliegue en el ANE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (FID, CLIP score, comparativas de calidad perceptual) ni medidas de latencia o consumo energético por dispositivo. Tampoco se documenta una evaluación del impacto de la palettización a 6 bits sobre la fidelidad de las imágenes frente al checkpoint FP16 o al original en PyTorch.

| Metrica | Resultado |
|---|---|
| FID / CLIP score | No disponible |
| Comparativa 6 bits frente a FP16 | No disponible |
| Latencia por imagen (pasos 20-30) | No disponible |
| Consumo energetico por generacion | No disponible |
| Memoria pico en inferencia | No disponible (solo se declara un pico de ~9,8 GB durante la conversion) |

## Requisitos de hardware

- Plataforma objetivo: dispositivos Apple con Neural Engine (iPhone, iPad y Mac con Apple Silicon). La model card no especifica los modelos minimos de dispositivo.
- Sistema operativo: iOS 17 o superior para la ruta palettizada a 6 bits, ya que el runtime del ANE para pesos palettizados se introdujo en iOS 17. En iOS 16 la app anfitriona debe recurrir a un modelo FP16 alternativo.
- Almacenamiento: 1,9 GB de repositorio; el árbol `Resources/` con los `.mlmodelc` compilados ocupa ~913 MB.
- Memoria durante la conversion: pico de ~9,8 GB de RAM, sin necesidad de `--chunk-unet`. No es un requisito de inferencia.
- GPU dedicadas (A100, H100, RTX 4090): no aplica. El formato Core ML está pensado para el ANE y la GPU integrada de Apple Silicon; para GPU NVIDIA habría que usar el checkpoint original de epiCRealism en PyTorch o convertirlo a otro formato.
- Despliegue: `StableDiffusionPipeline` de Apple, CLI de Swift de `ml-stable-diffusion`, integración en apps iOS mediante el instalador de TokForge. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que son runtimes para modelos de lenguaje.
- Latencia y throughput: no disponibles. La model card solo recomienda 20-30 pasos con cfg-scale 7.0 y atención `split_einsum_v2` sobre `.cpuAndNeuralEngine`.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mahmudplx/coreml-epicrealism-6bit` | Core ML, 6 bits palettizado | No declarados (base SD-1.5, ~1.000 M) | Prompt CLIP de 77 tokens; 512x512 nativo | CreativeML OpenRAIL-M | Hugging Face, 0 descargas, 0 likes |
| `emilianJR/epiCRealism` | Diffusers / PyTorch, FP16/FP32 | ~1.000 M (base SD-1.5) | Prompt CLIP de 77 tokens; 512x512 nativo | CreativeML OpenRAIL-M | Hugging Face, mas de 1 M de descargas |
| Core ML oficial de Stable Diffusion 1.5 (`apple/ml-stable-diffusion`) | Core ML, FP16 y variantes palettizadas | ~1.000 M (SD-1.5) | Prompt CLIP de 77 tokens; 512x512 | CreativeML OpenRAIL-M | Repositorio de Apple, muy extendido |
| `mahmudplx/coreml-absolutereality-6bit` | Core ML, 6 bits palettizado | No declarados (base SD-1.5) | Prompt CLIP de 77 tokens; 512x512 | CreativeML OpenRAIL-M | Hugging Face |

La diferencia principal frente a los tres alternativas no está en capacidad ni en tamano, sino en el estilo aprendido: epiCRealism prioriza retratos fotorrealistas cinematograficos, mientras que AbsoluteReality y el SD-1.5 oficial tienen otros sesgos esteticos. Frente al checkpoint original de emilianJR, esta version pierde la flexibilidad de los formatos PyTorch y de los pipelines de servidor, pero gana en ejecucion local sobre el ANE con un consumo de memoria menor.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier expectativa en ese sentido es erronea.
- Resolucion fija de 512x512: la resolucion esta fijada en el modelo compilado, por lo que no se puede generar a resoluciones mayores sin recortes, escalado posterior o recompilar.
- Limite de prompt de 77 tokens impuesto por el text encoder CLIP, con truncamiento silencioso de prompts mas largos.
- Sesgo idiomatico: el text encoder esta entrenado predominantemente en ingles; los prompts en castellano u otros idiomas rinden peor y pueden producir resultados inconsistentes.
- Sesgos de representacion heredados de Stable Diffusion 1.5 y de su dataset de entrenamiento (LAION-2B en su porcion en ingles), con sobrerrepresentacion de determinados fenotipos, estilos y contextos culturales.
- Artefactos tipicos de SD-1.5 en manos, ojos, texto dentro de la imagen, perspectivas y anatomias complejas, especialmente con cfg alto o menos de 20 pasos.
- Riesgo de contenido inapropiado o no deseado: el paquete no incluye filtros de seguridad propios; el filtro y las salvaguardas deben implementarse en la aplicacion anfitriona.
- Licencia CreativeML OpenRAIL-M: permite uso comercial, pero impone restricciones de uso (no generar contenido ilegal, danino, de desinformacion medica, etc.) y obliga a propagar la licencia y la atribucion a cualquier trabajo derivado y a las imagenes generadas. Es responsabilidad del integrador leer y cumplir los terminos.
- Repositorio espejo no oficial: la model card indica que es una copia de `darkmaniac7/TokForge-epiCRealism-CoreML-6bit` con 0 descargas y 0 likes. Conviene verificar la procedencia y la integridad de los pesos antes de usarlo en produccion.
- Requisito de version del sistema: sin iOS 17 no se aprovecha la ruta de 6 bits, lo que obliga a mantener una variante FP16 adicional si se quiere cubrir iOS 16.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la perdida de calidad introducida por la cuantizacion a 6 bits, por lo que la validacion cualitativa corre a cargo del integrador.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mahmudplx/coreml-epicrealism-6bit
- Repositorio original espejado: https://huggingface.co/darkmaniac7/TokForge-epiCRealism-CoreML-6bit
- Coleccion TokForge iOS - CoreML Image Models: https://huggingface.co/collections/darkmaniac7/tokforge-ios-coreml-image-models-6a38cca9b57803e6168ce232
- Modelo base epiCRealism: https://huggingface.co/emilianJR/epiCRealism
- Pagina del modelo epiCRealism en Civitai: https://civitai.com/models/25694/epicrealism
- Herramienta de conversion de Apple: https://github.com/apple/ml-stable-diffusion
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Web de TokForge: https://tokforge.ai
- Discord de TokForge: https://discord.gg/Acv3CBtfVm
- TokForge en Google Play: https://play.google.com/store/apps/details?id=dev.tokforge
- TokForge en iOS TestFlight: https://testflight.apple.com/join/jnufjzRr
- Repositorio relacionado, mismo autor: https://huggingface.co/mahmudplx/coreml-absolutereality-6bit
- Espejo adicional del mismo modelo: https://huggingface.co/LocalMuseAI/coreml-epicrealism-6bit
