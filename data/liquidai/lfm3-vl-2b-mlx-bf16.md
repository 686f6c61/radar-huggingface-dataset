# LiquidAI/LFM3-VL-2B-MLX-bf16

## Resumen

LFM3-VL-2B-MLX-bf16 es la version en formato MLX y precision BF16 sin cuantizar del modelo multimodal LFM3-VL-2B de Liquid AI, optimizada para inferencia en Apple Silicon. Se trata de un modelo de imagen-a-texto (image-text-to-text) que combina un codificador visual con un transformer de lenguaje de aproximadamente 1.900 millones de parametros, pensado para ejecutarse en local en equipos Mac con chip de la serie M. El repositorio contiene unicamente los pesos convertidos a MLX (3,84 GB en BF16) y remite a la model card original para los detalles de arquitectura y entrenamiento.

La relevancia de esta publicacion es practica: permite desplegar un modelo vision-lenguaje de tamano contenido en hardware de consumo Apple sin necesidad de GPU dedicada, usando la libreria MLX-VLM. Frente a la version original en safetensors, esta variante facilita el prototipado en portatiles y equipos de sobremesa Mac, manteniendo la precision completa del modelo base. El modelo soporta 17 idiomas, entre ellos el castellano, y se distribuye bajo la licencia propietaria LFM1.0 de Liquid AI.

Al ser una conversion de formato y no un modelo nuevo, sus capacidades, limitaciones y comportamiento son los del LFM3-VL-2B original; esta ficha documenta lo que se puede verificar a partir de la informacion disponible y marca explicitamente como "no disponible" cualquier dato que no figure en las fuentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (codificador visual + modelo de lenguaje); variante LFM3, no disponible el detalle exacto de capas |
| Parametros totales | 1.918.181.888 (~1,92 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Esta version es BF16 sin cuantizar; el modelo base dispone de otras variantes de cuantizacion (no detalladas en la informacion disponible) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (17 idiomas) |
| Licencia | lfm1.0 (licencia propietaria de Liquid AI, marcada como "other") |
| Formato de pesos | safetensors en formato MLX (BF16) |

## Arquitectura y entrenamiento

El modelo es un sistema imagen-a-texto construido sobre la familia LFM3 de Liquid AI, que combina un modulo de procesamiento visual con un modelo de lenguaje de tipo transformer. La informacion disponible no detalla el numero de capas, la dimension oculta, el mecanismo de atencion ni la composicion exacta del dataset de entrenamiento; la model card de esta variante remite explicitamente a la model card del modelo base (LiquidAI/LFM3-VL-2B) para esos datos. Tampoco se especifican el volumen de tokens de entrenamiento ni si se aplicaron fases de RLHF o DPO.

La innovacion tecnica de esta publicacion concreta es la conversion a MLX con pesos BF16 sin cuantizar, lo que preserva la precision numerica original y permite aprovechar la memoria unificada de los chips Apple. El repositorio incluye codigo personalizado (tag `custom_code`), lo que implica que la carga del modelo requiere la implementacion especifica de MLX-VLM en lugar de un transformer estandar de HuggingFace.

## Capacidades

- Generacion de texto condicionada por imagen (image-text-to-text): descripcion de imagenes, respuesta a preguntas visuales y conversacion sobre el contenido de una imagen.
- Conversacion multi-turno en modo chat (pipeline `conversational`).
- Cobertura multilingue en 17 idiomas, incluido el castellano.
- Generacion de texto general y razonamiento, heredados del modelo de lenguaje subyacente.
- Capacidades de codigo y matematicas: no confirmadas de forma explicita en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo "thinking", vision adicional (video, audio) u otras capacidades especiales: no disponible.

## Casos de uso

- Descripcion automatica de imagenes en local: con MLX-VLM se puede generar texto descriptivo de fotografias o capturas directamente en un Mac, sin enviar datos a la nube, lo que resulta adecuado para flujos con requisitos de privacidad.
- Asistencia visual para accesibilidad: transcripcion y descripcion de imagenes para lectores de pantalla o interfaces de voz, aprovechando el soporte multilingue y la ejecucion en dispositivo.
- Extraccion de informacion de documentos escaneados: preguntas sobre capturas, recibos o formularios en formato imagen, con la ventaja de procesar el contenido localmente en hardware Apple.
- Prototipado rapido de aplicaciones vision-lenguaje en Apple Silicon: el formato MLX y la instalacion via `mlx-vlm` permiten iterar sobre demos y pruebas de concepto sin infraestructura GPU dedicada.
- Clasificacion y etiquetado asistido de imagenes en lotes pequenos: uso del modelo para generar descripciones o categorias preliminares que luego se revisan manualmente, adecuado por su tamano reducido (~1,9 B parametros).
- Chat multimodal en castellano para soporte interno: conversaciones multi-turno sobre imagenes (por ejemplo, diagnosticos visuales basicos o soporte tecnico con capturas) gracias a la cobertura del espanol.
- Evaluacion comparativa de modelos pequenos: util como referencia de un VLM de ~2 B en BF16 para medir calidad frente a alternativas cuantizadas en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: los pesos en BF16 ocupan 3,84 GB; el repositorio completo pesa 3,9 GB. Hay que sumar la memoria del codificador visual, el cache KV y el overhead de MLX, por lo que se recomienda disponer de al menos 8 GB de memoria unificada, y 16 GB para contextos largos o generacion extensa.
- GPU recomendadas: chips Apple Silicon (series M1, M2, M3, M4 y posteriores) con memoria unificada suficiente. No esta pensado para GPU NVIDIA/AMD en este formato.
- Cabe en hardware de consumo: si, en equipos Mac con 8-16 GB de memoria unificada; el modelo esta disenado precisamente para ejecucion en dispositivo.
- Opciones de despliegue: MLX-VLM 0.7.11 o superior mediante `python -m mlx_vlm.generate`; para otros runtimes (vLLM, llama.cpp, Ollama, TGI) seria necesario usar el modelo base en otro formato, no esta version MLX.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-VL-2B-MLX-bf16 | ~1,92 B | no disponible | MLX safetensors BF16 | lfm1.0 | Version para Apple Silicon; requiere MLX-VLM |
| LFM3-VL-2B (base) | ~1,92 B | no disponible | safetensors (formato original) | lfm1.0 | Modelo original del que deriva esta conversion; incluye variantes de cuantizacion |
| Alternativas de ~2 B con vision | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de datos de rendimiento comparado con otros modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Alucinacion: como todo modelo de lenguaje y vision-lenguaje, puede generar descripciones o respuestas que no se correspondan con la imagen; no se han publicado tasas de error.
- Sesgos: no se documentan en la informacion disponible; cabe esperar los sesgos presentes en los datos de entrenamiento del modelo base.
- Contexto e idioma: la longitud de contexto no esta publicada; aunque se listan 17 idiomas, el rendimiento relativo por idioma no se especifica y puede ser inferior en los menos representados.
- Licencia: la licencia LFM1.0 es propietaria y marcada como "other"; es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial, ya que puede imponer restricciones.
- Dependencia de runtime: el modelo usa `custom_code` y requiere MLX-VLM >= 0.7.11; no es cargable con transformers estandar ni con runtimes CUDA.
- Plataforma: esta variante solo funciona en Apple Silicon; para otros entornos hay que usar el modelo base en otro formato.
- Produccion: al ser una conversion de formato, cualquier limitacion del modelo base (precision en tareas complejas, robustez ante imagenes dificiles) se mantiene; conviene validar con datos propios antes de desplegar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LiquidAI/LFM3-VL-2B-MLX-bf16
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
- Documentacion de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Guia de despliegue en MLX: https://docs.liquid.ai/deployment/on-device/mlx
- Consola/API: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
- MLX-VLM (repositorio): https://github.com/Blaizzy/mlx-vlm
- Licencia: LICENSE (incluido en el repositorio de HuggingFace)
