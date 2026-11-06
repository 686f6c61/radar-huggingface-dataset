# matrixportalx/Qwen-Image-2.1-Turbo-Uncensored-GGUF-npu

## Resumen

Qwen-Image-2.1-Turbo-Uncensored-GGUF-npu es un paquete de pesos en formato GGUF preparado por el usuario matrixportalx para ejecutar un pipeline de generacion de imagenes Qwen Image 2.1 Turbo sobre la NPU de plataformas Snapdragon mediante stable-diffusion.cpp. No es un modelo de lenguaje ni un modelo entrenado desde cero: es un espejo empaquetado de tres componentes (un modelo de difusion DiT cuantizado a Q4_0, un codificador de texto multimodal Qwen3-VL-8B "abliterado" y un VAE) mas un parche de grafos necesario para que el runtime recorte el grafo de computo y pueda desplegarse en la NPU.

El peso total declarado en safetensors es de 7.115.124.736 parametros y el repositorio ocupa 21,6 GB, lo que corresponde a la suma de los tres artefactos mas el proyector multimodal en F16. La relevancia actual es acotada pero concreta: permite probar generacion y edicion de imagenes en hardware movil Snapdragon sin depender de una GPU dedicada, a costa de una licencia estrictamente de investigacion y de un flujo de despliegue no estandar.

El componente de difusion procede de Abiray/Qwen-Image-2.1-Turbo-GGUF (Q4_0), el codificador de texto de AtomicChat/Qwen-Image-2.1-Turbo-Uncensored-GGUF (Q8_0 convertido a Q4_0 y BF16 a F16 para tipos de NPU) y el VAE de Comfy-Org/Qwen-Image-2.1. El autor indica que la ausencia de censura proviene exclusivamente del codificador de texto; el DiT Turbo es el original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusion: DiT (Qwen Image 2.1 Turbo) + codificador de texto Qwen3-VL-8B + VAE |
| Parametros totales | 7.115.124.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (DiT y codificador de texto), F16 (proyector multimodal mmproj), BF16 (VAE en safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | qwen-research (Qwen Research License; uso comercial no permitido, solo investigacion y evaluacion) |
| Formato de pesos | GGUF (diffusion_model.gguf, llm.gguf, mmproj.gguf) y safetensors (vae.safetensors) |

## Arquitectura y entrenamiento

El paquete no documenta entrenamiento propio: agrega artefactos ya publicados. El nucleo generativo es un transformer de difusion (DiT) correspondiente a Qwen Image 2.1 en su variante Turbo, distribuido originalmente por Qwen y reempaquetado por Abiray en GGUF Q4_0. El codificador de texto es un Qwen3-VL-8B sometido a abliteration por AtomicChat para eliminar el rechazo en la codificacion de prompts; en este repositorio se ha reconvertido de Q8_0 a Q4_0 y de BF16 a F16 para encajar en los tipos soportados por la NPU. El decodificador de imagenes es el VAE oficial de Qwen Image 2.1 publicado por Comfy-Org en BF16.

La innovacion tecnica del paquete es de despliegue, no de modelado: requiere un parche de "graph cut" sobre stable-diffusion.cpp (denominado dit-qwen21-cut.patch, atribuido a Rüya/Esin) para que el runtime pueda particionar el grafo y ejecutarlo en la NPU Snapdragon. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en las etapas originales de Qwen Image 2.1 Turbo.

## Capacidades

- Generacion de imagenes a partir de prompts de texto mediante el DiT Qwen Image 2.1 Turbo en cuantizacion Q4_0.
- Edicion de imagenes guiada por instrucciones, gracias al proyector multimodal mmproj.gguf en F16 que aporta la parte visual al codificador Qwen3-VL-8B.
- Codificacion de prompts de texto sin rechazo por contenido, derivada de la abliteration aplicada al codificador de texto.
- Ejecucion en NPU de plataformas Snapdragon mediante stable-diffusion.cpp con el parche de graph cut.
- Soporte multimodal de entrada (texto e imagen) en el codificador, heredado de la base Qwen3-VL-8B.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso ni modo thinking; el componente de lenguaje actua solo como codificador de texto del pipeline de difusion.

## Casos de uso

- Evaluacion de generacion de imagenes en dispositivos Snapdragon: el paquete permite medir latencia y calidad de un DiT Q4_0 sobre NPU movil, util para decidir si merece la pena integrar difusion local en una aplicacion Android o en un dispositivo de borde.
- Investigacion sobre abliteration y sesgos: al separar el codificador de texto abliterado del DiT original, permite estudiar como cambia la distribucion de salidas al eliminar el rechazo en la codificacion de prompts, manteniendo el generador sin modificar.
- Edicion de imagenes en flujo local: con mmproj.gguf en F16 se pueden probar tareas de edicion guiada por instrucciones sin enviar imagenes a un servicio en la nube, lo que resulta relevante en entornos con requisitos de privacidad.
- Prototipado de pipelines ComfyUI alternativos: al usar el VAE oficial de Comfy-Org y pesos GGUF, sirve para validar compatibilidad entre ComfyUI, stable-diffusion.cpp y el empaquetado para NPU antes de invertir en un despliegue mayor.
- Reproducibilidad de artefactos: el repositorio actua como espejo con hashes de commit de origen, de modo que un equipo puede reconstruir el pipeline aunque los repositorios fuente se eliminen o se hagan privados.
- Docencia y experimentacion con cuantizacion extrema: comparar Q4_0 frente a Q8_0 del mismo codificador y DiT en un entorno controlado para medir la perdida de fidelidad en prompts largos y detallados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 21,6 GB en total, pero al estar pensado para NPU Snapdragon el consumo se reparte entre memoria del SoC y memoria del sistema, no en VRAM de GPU dedicada.
- GPU recomendadas: no aplica como objetivo principal; el paquete esta orientado a NPU Snapdragon con stable-diffusion.cpp parcheado.
- Cabe en GPU de consumo: no confirmado. Los pesos Q4_0 del DiT y del codificador podrian caber en GPUs con 16-24 GB, pero no hay datos publicados de ejecucion en RTX 4090, RTX 3090 ni similares.
- Opciones de despliegue: stable-diffusion.cpp con el parche dit-qwen21-cut.patch (requisito indicado por el autor); no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI, que no estan pensados para este tipo de pipeline.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Orientacion |
|---|---|---|---|---|---|
| matrixportalx/Qwen-Image-2.1-Turbo-Uncensored-GGUF-npu | 7.115.124.736 (total del paquete) | no disponible | GGUF + safetensors | qwen-research (no comercial) | NPU Snapdragon, pipeline completo empaquetado |
| Abiray/Qwen-Image-2.1-Turbo-GGUF | no disponible | no disponible | GGUF | qwen-research | Solo DiT en GGUF, sin codificador ni VAE empaquetados |
| AtomicChat/Qwen-Image-2.1-Turbo-Uncensored-GGUF | no disponible | no disponible | GGUF | Apache 2.0 en el codificador, qwen-research en el DiT | Codificador abliterado y proyector multimodal |
| Comfy-Org/Qwen-Image-2.1 | no disponible | no disponible | safetensors | qwen-research | VAE y pesos oficiales para ComfyUI |

La comparativa se limita a los artefactos de origen citados en la model card; no se dispone de datos de rendimiento ni de benchmarks que permitan contrastar calidad frente a otras alternativas de generacion de imagenes.

## Limitaciones y advertencias

- Licencia qwen-research: uso comercial prohibido; solo investigacion y evaluacion. Cualquier integracion en producto requiere revisar el archivo LICENSE y el NOTICE incluidos.
- El paquete depende de un parche no oficial de stable-diffusion.cpp (dit-qwen21-cut.patch); sin el, la ejecucion en NPU Snapdragon no funciona segun el autor.
- La ausencia de censura se limita al codificador de texto; el DiT es el original, por lo que el comportamiento final puede seguir reflejando sesgos del generador.
- Cuantizacion Q4_0 en el codificador de texto: perdida de fidelidad esperable en prompts largos, matices y texto dentro de la imagen en comparacion con Q8_0 o BF16.
- Riesgo de alucinacion visual y de artefactos en imagenes generadas, inherente a los modelos de difusion; no hay evaluaciones publicadas de este empaquetado concreto.
- Idiomas soportados no documentados; el codificador Qwen3-VL-8B es multilingue en origen, pero el paquete no declara lista de idiomas.
- Repositorio con 25 descargas y 0 likes: poca validacion comunitaria, sin issues ni discusion documentada.
- Es un espejo de terceros: la trazabilidad depende de los hashes de commit indicados, y el autor advierte que podria no reflejar cambios posteriores en los repositorios fuente.
- No dispone de pipeline declarado en Hugging Face ni de model card en castellano; la documentacion original esta en turco.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/matrixportalx/Qwen-Image-2.1-Turbo-Uncensored-GGUF-npu
- DiT de origen (Abiray): https://huggingface.co/Abiray/Qwen-Image-2.1-Turbo-GGUF
- Codificador y proyector de origen (AtomicChat): https://huggingface.co/AtomicChat/Qwen-Image-2.1-Turbo-Uncensored-GGUF
- VAE de origen (Comfy-Org): https://huggingface.co/Comfy-Org/Qwen-Image-2.1
- Licencia del modelo base (Qwen): https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Perfil del autor: https://huggingface.co/matrixportalx
