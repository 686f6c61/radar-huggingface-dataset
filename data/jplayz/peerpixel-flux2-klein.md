# Jplayz/peerpixel-flux2-klein

## Resumen

PeerPixel FLUX.2 Klein for WebNN es un paquete de inferencia del modelo de generacion de imagenes FLUX.2 Klein (4B parametros) de Black Forest Labs, convertido a formato ONNX y optimizado para ejecutarse integramente dentro de un navegador mediante WebNN y onnxruntime-web. El repositorio, publicado por el usuario Jplayz, no contiene un modelo reentrenado, sino una reempaquetado de los pesos originales de FLUX.2 Klein 4B junto con el text encoder Qwen3-4B, ambos bajo licencia Apache-2.0.

El objetivo principal es eliminar la necesidad de un servidor o entorno Python para ejecutar el modelo: todos los archivos necesarios (text encoder, transformer cuantizado, VAE decoder, binarios de onnxruntime-web) se sirven desde HuggingFace y se cachean en el navegador del cliente. El conjunto completo pesa aproximadamente 14 GB y requiere un navegador Chromium con WebNN disponible, ademas de una GPU o NPU accesible.

La relevancia de este proyecto radica en que acerca la generacion de imagenes de alta calidad a aplicaciones web client-side, con privacidad total (los datos no salen del dispositivo) y sin costes de infraestructura. La cuantizacion int4/f16 del transformer y el particionado en shards permiten sortear los limites de memoria del navegador y reanudar descargas interrumpidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (FLUX.2 Klein 4B) con text encoder Qwen3-4B |
| Parametros totales | 4B (transformer) + 4B (text encoder) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4/f16 (transformer), f16 (text encoder y VAE) |
| Idiomas soportados | no disponible (heredado de Qwen3-4B, probablemente multilingue) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (sharded, con manifests.json) |

## Arquitectura y entrenamiento

El modelo es una conversion a ONNX de FLUX.2 Klein 4B, un diffusion transformer de Black Forest Labs, junto con el text encoder Qwen3-4B. No se ha realizado ningun entrenamiento o ajuste adicional: los archivos son una reempaquetado de los pesos originales, cuantizados y particionados para adaptarse a las restricciones de memoria del navegador. La arquitectura original de FLUX.2 Klein no esta detallada en la informacion disponible, pero se trata de un modelo de difusion de texto a imagen de 4B parametros.

El proceso de conversion incluye cuantizacion int4/f16 del transformer, sharding de pesos y division de grafos en componentes separados (conditioning, join, image-tail, output, VAE decoder). Cada directorio del repositorio contiene un `manifest.json` que describe los archivos y su orden de carga. El runtime es onnxruntime-web con binarios WebAssembly incluidos en el propio repositorio, lo que permite ejecutar el modelo sin dependencias externas.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image) con resolucion de salida de 512x512 (segun el VAE decoder estatico).
- Ejecucion completamente en el navegador via WebNN y onnxruntime-web, sin servidor ni backend.
- Cacheo automatico de todos los pesos en Cache Storage, permitiendo reutilizacion sin descargas adicionales en visitas posteriores.
- Soporte para reanudar descargas interrumpidas gracias al particionado en shards.
- Compatibilidad con GPU y NPU accesibles desde el navegador (via WebNN).
- Requiere aislamiento cross-origin (COOP/COEP) para habilitar WebAssembly multihilo.

## Casos de uso

- Generacion de imagenes en aplicaciones web sin backend: un sitio de diseno grafico puede ofrecer generacion de imagenes directamente en el navegador del usuario, sin enviar prompts a un servidor, garantizando privacidad y reduciendo costes de infraestructura.
- Prototipado rapido de ideas visuales: disenadores y artistas pueden generar bocetos desde su navegador sin instalar Python ni depender de APIs externas, ideal para entornos con restricciones de red.
- Aplicaciones educativas de IA generativa: demostraciones interactivas de modelos de difusion en cursos o talleres, donde los alumnos ejecutan el modelo localmente en sus propios equipos.
- Herramientas de edicion de imagen asistida: integracion en editores web para generar variaciones o imagenes de referencia a partir de texto, con la ventaja de que los datos no abandonan el dispositivo.
- Despliegue en entornos con politicas estrictas de datos: organizaciones que no permiten enviar informacion sensible a servicios externos pueden usar este paquete para generar imagenes internamente.
- Aplicaciones offline-first: una vez cacheados los 14 GB, la generacion funciona sin conexion a internet, util para entornos con conectividad intermitente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas de calidad de imagen (FID, CLIP score, etc.) ni comparaciones con otros modelos de generacion de imagenes.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al ejecutarse en navegador depende de la memoria compartida de la GPU/NPU y de la RAM del sistema. El repositorio indica que se necesitan aproximadamente 14 GB de espacio en disco para los pesos.
- GPU recomendadas: cualquier GPU o NPU soportada por WebNN en navegadores Chromium. No se especifican modelos concretos.
- No cabe en GPUs de consumo clasicas como memoria dedicada, pero si puede ejecutarse en GPUs integradas o discretas accesibles via WebNN, siempre que el navegador pueda asignar suficiente memoria.
- Opciones de despliegue: exclusivamente navegador (Chromium con WebNN), usando onnxruntime-web. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Dependen fuertemente del hardware del cliente y de la cuantizacion int4/f16.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa. El modelo es una conversion de FLUX.2 Klein 4B, por lo que su rendimiento intrinseco deberia ser equivalente al del modelo original, pero no se aportan datos de benchmarks. Alternativas en el mismo espacio (generacion de imagenes en navegador) incluyen:

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| PeerPixel FLUX.2 Klein WebNN | 4B + 4B text encoder | no disponible | Apache-2.0 | ONNX | HuggingFace |
| FLUX.2 Klein original (black-forest-labs) | 4B | no disponible | Apache-2.0 | safetensors | HuggingFace |
| Stable Diffusion XL (SDXL) | 3.5B | no disponible | OpenRAIL | safetensors | HuggingFace |

Nota: la comparacion con SDXL es orientativa; no se han verificado datos de rendimiento en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo reentrenado: es una conversion de pesos existentes, por lo que no aporta mejoras de calidad sobre FLUX.2 Klein original.
- Requiere un navegador Chromium con WebNN habilitado y una GPU/NPU accesible; en navegadores sin soporte WebNN no funcionara.
- El tamaño total de 14 GB puede ser prohibitivo para usuarios con conexiones lentas o limites de datos, aunque el cacheo y la reanudacion de descargas mitigan parcialmente este problema.
- La resolucion de salida esta limitada a 512x512 segun el VAE decoder incluido; no se menciona soporte para resoluciones mayores.
- No se especifican los idiomas soportados por el text encoder Qwen3-4B, aunque por su origen es probablemente multilingue; sin embargo, no hay confirmacion.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar que los pesos originales de FLUX.2 Klein y Qwen3-4B mantienen esa misma licencia (segun la model card, asi es).
- No se proporcionan garantias de rendimiento ni de estabilidad en produccion; es un proyecto de reempaquetado sin mantenimiento oficial de Black Forest Labs.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Jplayz/peerpixel-flux2-klein
- Modelo base FLUX.2 Klein: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Modelo base text encoder: https://huggingface.co/Qwen/Qwen3-Embedding-4B
- Repositorio de conversion (PeerPixel): https://github.com/Jplayz2468/peerpixel
- Modelo de referencia Comfy-Org: https://huggingface.co/Comfy-Org/flux2-klein
