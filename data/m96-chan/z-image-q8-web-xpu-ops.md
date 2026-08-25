# m96-chan/Z-Image-q8-web-xpu-ops

## Resumen

Este repositorio contiene una conversión cuantizada a int8 del modelo de generación de imágenes `Tongyi-MAI/Z-Image`, realizada por el ingeniero independiente japonés m96-chan (Yusuke Harada) para su runtime WebGPU `web-xpu-ops`. El objetivo es permitir la ejecución del modelo directamente en el navegador mediante WebGPU, reduciendo el peso del transformer de difusión de 12,31 GB en bf16 a 6,17 GB en int8, con una pérdida de precisión medida y documentada. El text encoder Qwen3-4B se incluye sin modificar, en su formato original safetensors.

El modelo base, Z-Image, es un sistema de text-to-image desarrollado por el laboratorio Tongyi de Alibaba, con licencia Apache-2.0. Esta conversión no añade ningún entrenamiento ni fine-tuning: solo reempaqueta y cuantiza los pesos. Está pensada exclusivamente para el demo `examples/zimage-web` de `web-xpu-ops`; para cualquier otro uso se recomienda acudir al modelo original. La relevancia actual radica en la creciente demanda de inferencia de modelos de difusión en el navegador, sin servidores dedicados, aprovechando la aceleración por GPU que WebGPU permite.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) para generacion de imagenes, con text encoder Qwen3-4B |
| Parametros totales | 4.022.468.096 (text encoder Qwen3-4B, segun safetensors); el diffusion transformer no especifica numero de parametros (12,31 GB en bf16) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (per-row absmax) para el transformer; text encoder y VAE decoder sin cuantizar (bf16/f32) |
| Idiomas soportados | no disponibles (el text encoder Qwen3 es multilingue, pero no se especifica para este repo) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (text encoder) y archivos binarios propietarios del runtime (dit.q8.bin, dit.q8scales.bin, dit.f32.bin, decoder.bin) |

## Arquitectura y entrenamiento

El modelo base `Tongyi-MAI/Z-Image` combina un transformer de difusion (DiT) para la generacion de imagenes con un text encoder Qwen3-4B que codifica las instrucciones textuales. El DiT procesa latentes de imagen mediante atencion y modulacion adaLN, mientras que el VAE decoder reconstruye la imagen final. En esta conversion, el transformer se cuantiza a int8 por filas (absmax, rango [-127, 127]) con una escala f32 por fila de salida, empaquetando cuatro codigos por palabra de 32 bits. Los tensores de normalizacion, bias y patch embedder (248 de 521) se mantienen en f32 por no aportar beneficio a la cuantizacion. El text encoder y el VAE decoder se copian sin cambios.

No se ha realizado ningun entrenamiento, fine-tuning ni ajuste adicional. La conversion es puramente de formato y cuantizacion. El autor documenta la perdida de precision por peso: el peor caso es `adaLN_modulation.0.weight` con un 4,78% de RMS relativo, seguido de `attention.to_q` con 1,21%; el resto queda por debajo. No se proporcionan datos sobre el dataset de entrenamiento del modelo original, ni sobre el proceso de entrenamiento (RLHF, DPO, etc.).

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image), heredada del modelo base Z-Image.
- Ejecucion en navegador via WebGPU, gracias a la cuantizacion int8 y al formato de pesos adaptado al runtime `web-xpu-ops`.
- El text encoder Qwen3-4B conserva sus capacidades multilingues originales, aunque el repo no especifica idiomas soportados.
- No incluye soporte para tool calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje generales; es un modelo de generacion de imagenes.
- No se ha verificado soporte para vision, audio u otras modalidades.

## Casos de uso

- Demostracion de inferencia de difusion en el navegador: el caso principal es el demo `examples/zimage-web` de `web-xpu-ops`, que descarga los pesos una vez y ejecuta la generacion offline en el cliente.
- Prototipado rapido de aplicaciones web de generacion de imagenes sin backend: al ejecutarse en WebGPU, no se requiere servidor de inferencia, lo que reduce costes y latencia de red.
- Educacion y experimentacion con modelos de difusion cuantizados: permite estudiar el impacto de la cuantizacion int8 en la calidad de imagen directamente en un navegador.
- Evaluacion de rendimiento de WebGPU en diferentes GPUs de consumidor: el demo puede usarse como banco de pruebas para medir throughput y latencia en hardware variado.
- Integracion en herramientas de diseno web que necesiten generacion local de imagenes: por ejemplo, generacion de assets graficos en el cliente sin enviar datos a un servidor.
- Investigacion sobre formatos de pesos eficientes para WebGPU: el layout de archivos y la cuantizacion per-row pueden servir de referencia para otros proyectos de despliegue en navegador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo documenta la perdida de precision relativa por peso (RMS) frente al modelo sin cuantizar, pero no ofrece metricas de calidad de imagen (FID, CLIP score, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- El modelo completo ocupa 14,4 GB en disco (6,17 GB del transformer cuantizado, 8,04 GB del text encoder, 0,20 GB del VAE decoder).
- Para ejecutar el demo WebGPU se necesita una GPU compatible con WebGPU (NVIDIA, AMD, Intel, Apple Silicon) con suficiente memoria para cargar los pesos. No se especifica la VRAM minima, pero dado el tamano del transformer (6,17 GB) y el text encoder (8,04 GB), se estima que se requieren al menos 16 GB de VRAM para una carga completa en memoria.
- No se indican requisitos de GPU de servidor (A100, H100, etc.); el objetivo es hardware de consumidor con soporte WebGPU.
- Opciones de despliegue: exclusivamente el runtime `web-xpu-ops` (demo `examples/zimage-web`). No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tongyi-MAI/Z-Image (original) | no especificado (DiT + Qwen3-4B) | no disponible | bf16 | Apache-2.0 | HuggingFace |
| m96-chan/Z-Image-q8-web-xpu-ops (este) | 4.02B (text encoder) + DiT sin especificar | no disponible | int8 (transformer) | Apache-2.0 | HuggingFace |
| Tongyi-MAI/Z-Image-Turbo | no especificado | no disponible | no especificado | Apache-2.0 | HuggingFace |

La comparativa se limita a las variantes del mismo modelo base. No se dispone de datos de rendimiento para establecer una comparacion cuantitativa. Frente al original, esta version reduce el peso del transformer en aproximadamente un 50% a costa de una perdida de precision documentada. Z-Image-Turbo es una variante optimizada para velocidad, pero no se detalla su relacion con esta conversion.

## Limitaciones y advertencias

- La conversion es lossy: la cuantizacion int8 introduce una perdida de precision que puede afectar a la calidad de las imagenes generadas, especialmente en los tensores de modulacion adaLN (hasta 4,78% de RMS relativo).
- El formato de pesos es propietario del runtime `web-xpu-ops`; no es compatible con otras herramientas de inferencia (diffusers, ComfyUI, etc.). Para cualquier uso fuera del demo, se debe utilizar el modelo original.
- El text encoder se incluye como copia byte a byte del original, pero el repositorio no es la fuente original; el autor advierte que la licencia Apache-2.0 permite la copia, pero no hay garantia de mantenimiento futuro.
- No es un producto oficial de Alibaba Tongyi Lab; no ha sido validado ni aprobado por ellos.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de idioma del modelo base. Al ser un modelo de generacion de imagenes, puede reflejar sesgos presentes en sus datos de entrenamiento, pero no se documentan aqui.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; su madurez y estabilidad no estan probadas en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/m96-chan/Z-Image-q8-web-xpu-ops
- Modelo original: https://huggingface.co/Tongyi-MAI/Z-Image
- Variante Turbo: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Proyecto web-xpu-ops (GitHub): https://github.com/m96-chan/web-xpu-ops
- Perfil del autor en GitHub: https://github.com/m96-chan/
- Otro modelo cuantizado del mismo autor: https://huggingface.co/m96-chan/MioTTS-0.6B-q8-webgpu
- Version GGUF de Z-Image Turbo (tercero): https://civitai.red/models/2179031?modelVersionId=2453732
