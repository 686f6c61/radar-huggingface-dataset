# samoudi/sd-turbo-gguf

## Resumen

SD-Turbo GGUF es una conversión al formato GGUF del modelo de generación de imágenes por texto SD-Turbo, publicado originalmente por Stability AI. La conversión ha sido realizada por el usuario samoudi y está pensada para ejecutarse con stable-diffusion.cpp, en particular en entornos con recursos limitados: el modelo se emplea en la aplicación Android *Offline Image Gen*, que genera imágenes en el dispositivo usando solo CPU y sin conexión a red tras la descarga inicial.

SD-Turbo es la versión destilada de Stable Diffusion 2.1: mediante destilación por adversarial diffusion (técnica de ADD), reduce la generación a 1-4 pasos de inferencia sin classifier-free guidance, lo que permite generar imágenes de 512×512 en segundos incluso en hardware modesto. Esta versión cuantizada conserva ese comportamiento pero reduce el tamaño en disco y en memoria, con dos variantes: q8_0 (2,0 GB) y q4_0 (1,7 GB).

El modelo original tiene 1.303.598.228 parámetros y ventana de contexto de 77 tokens para el prompt de texto (limitación heredada del codificador de texto de CLIP). Es relevante porque ofrece generación de imágenes local, gratuita y offline en dispositivos móviles o PCs sin GPU dedicada, algo poco habitual en el ecosistema de difusión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer no; UNet de difusión latente destilada (SD-Turbo, basado en Stable Diffusion 2.1) |
| Parametros totales | 1.303.598.228 |
| Parametros activos | no disponible (no aplica, no es MoE) |
| Longitud de contexto | 77 tokens (codificador de texto CLIP) |
| Tipos de cuantizacion | q8_0, q4_0 (GGUF); tensores no cuantizados (UNet conv) en f16 |
| Idiomas soportados | Prompts en inglés (recomendado por el autor) |
| Licencia | Stability AI Community License (uso no comercial y comercial permitido para organizaciones con ingresos anuales inferiores a 1 millón de USD) |
| Formato de pesos | GGUF (original en safetensors) |

## Arquitectura y entrenamiento

SD-Turbo se basa en la arquitectura clásica de difusión latente: un UNet 2D que opera en el espacio latente de un VAE, junto con un codificador de texto CLIP que procesa el prompt. La innovación clave es la destilación mediante Adversarial Diffusion Distillation (ADD): un modelo corrector de puntuación (score distillation) combinado con una pérdida adversarial permite generar imágenes fotorrealistas en 1-4 pasos, sin classifier-free guidance (cfg-scale 1.0), lo que elimina el doble pase por el UNet de cada paso.

El modelo original de Stability AI fue entrenado sobre el mismo pipeline de datos de Stable Diffusion 2.1; la ficha del repositorio no detalla el número de tokens ni la composición exacta del dataset. Esta publicación concreta no reentrena nada: es una conversión de formato realizada con `sd-cli` de stable-diffusion.cpp (tag `master-955-b7a74e6`) en dos pasadas, primero a f16 y después a q8_0 o q4_0, para que los tensores no cuantizados (las convoluciones del UNet, que stable-diffusion.cpp no cuantiza) se almacenen en f16 en lugar de f32. De ahí que la variante q4_0 solo sea un 14 % más pequeña que la q8_0.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) a resolución nativa 512×512, también 256×256 para mayor velocidad.
- Generación en 1-4 pasos de inferencia sin guidance (cfg-scale 1.0), con muestreo euler_a.
- Ejecución 100 % local en CPU, sin GPU ni conexión a red tras la descarga del modelo.
- Distribución en GGUF con checksums SHA-256 verificados y soporte de descarga reanudable (HTTP Range).
- No soporta image-to-image, inpainting, edición ni otras modalidades en esta conversión (el pipeline es text-to-image).
- No es un modelo de lenguaje: no tiene capacidades de razonamiento, código, tool calling ni agentes.

## Casos de uso

- Generación de imágenes offline en Android: la app *Offline Image Gen* descarga el GGUF una vez y después genera imágenes en el dispositivo sin red, eligiendo la variante según la RAM disponible (q4_0 con 4 GB, q8_0 con 6 GB).
- Prototipado rápido en portátiles sin GPU: con 1-4 pasos por imagen, un portátil con CPU moderna puede generar bocetos en segundos, útil para explorar ideas visuales antes de pasar a un modelo más pesado.
- Integración en pipelines con stable-diffusion.cpp: el binario `sd-cli` permite generar imágenes por línea de comandos con semilla fija, adecuado para scripts y generación por lotes reproducible.
- Aplicaciones con privacidad estricta: al no salir datos del dispositivo, es adecuado para generar ilustraciones internas en entornos donde no se permite enviar texto a servicios en la nube.
- Generación en dispositivos embebidos o de borde: el tamaño de 1,7-2,0 GB y el requisito de 4-6 GB de RAM lo hacen viable en mini-PCs y SBCs con memoria suficiente.
- Testing y CI de herramientas de difusión: el formato GGUF y los comandos deterministas con semilla facilitan pruebas automatizadas de stable-diffusion.cpp en entornos sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base SD-Turbo fue evaluado por Stability AI con métricas como FID y CLIP score frente a otros modelos destilados, pero esos datos no constan en la ficha de este repositorio y no se incluyen aquí para no inventar cifras.

## Requisitos de hardware

- RAM (inferencia en CPU): mínimo 6 GB para la variante q8_0 (2,0 GB de archivo) y 4 GB para la variante q4_0 (1,7 GB de archivo), según el propio autor.
- No requiere GPU: el uso previsto es solo CPU. En GPU, stable-diffusion.cpp también puede acelerar la inferencia, pero no hay cifras publicadas para esta conversión.
- Cabe en dispositivos móviles Android con 4-6 GB de RAM, así como en cualquier PC moderno sin GPU dedicada.
- Despliegue: stable-diffusion.cpp (`sd-cli`) es el runtime previsto. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI; Ollama no es aplicable a modelos de difusión.
- Latencia: no disponible en cifras concretas; el autor indica que 256×256 es más rápido que 512×512 y que el modelo está destilado para 1-4 pasos, lo que hace la generación viable en CPU en tiempos del orden de segundos (estimación no confirmada por datos publicados).

## Comparativa con modelos similares

| Modelo | Parametros | Pasos de inferencia | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sd-turbo-gguf (esta ficha) | 1.303.598.228 | 1-4 | GGUF (q8_0, q4_0) | Stability AI Community License | Hugging Face, descarga directa |
| stabilityai/sd-turbo (original) | 1.303.598.228 | 1-4 | safetensors | Stability AI Community License | Hugging Face |
| stabilityai/sdxl-turbo | ~3.500.000.000 | 1-4 | safetensors | Stability AI Community License | Hugging Face; mayor calidad y resolución (512×512 nativas por imagen en modo turbo), pero requiere bastante más RAM/VRAM |

SDXL-Turbo ofrece mayor calidad y resolución, pero su tamaño lo hace inviable en los dispositivos de gama baja donde esta conversión GGUF brilla. Frente al safetensors original, esta versión reduce el tamaño en disco y permite inferencia cuantizada en CPU con stable-diffusion.cpp.

## Limitaciones y advertencias

- Resolución nativa limitada a 512×512 (256×256 como alternativa rápida); generar a otras resoluciones degrada la calidad.
- El codificador de texto (CLIP) limita los prompts a 77 tokens; los prompts complejos o largos se truncan.
- Los prompts deben escribirse en inglés; el rendimiento con otros idiomas no está garantizado.
- El UNet convolucional no se cuantiza (permanece en f16), por lo que la variante q4_0 solo ahorra un 14 % frente a q8_0; la reducción de memoria es menor de lo esperable en GGUF.
- La cuantización q4_0 puede introducir pérdida de calidad visual respecto a q8_0 o al modelo original en f16; no hay evaluaciones publicadas de esta degradación.
- Riesgo de sesgos heredados del modelo base Stable Diffusion 2.1 (sesgos de género, etnia y estereotipos en las imágenes generadas), documentados por Stability AI en el modelo original.
- Licencia: la Stability AI Community License permite uso comercial solo para personas y organizaciones con ingresos anuales inferiores a 1 millón de USD; por encima, se requiere licencia empresarial de Stability AI. El uso debe cumplir la política de uso aceptable de Stability AI.
- Para producción, verificar siempre el SHA-256 de los archivos descargados; el repositorio los publica, pero es una conversión de terceros (samoudi), no oficial de Stability AI.
- Estadísticas de uso muy limitadas (2.241 descargas, 1 like), por lo que el repositorio tiene poca comunidad de soporte.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/samoudi/sd-turbo-gguf
- Modelo base original: https://huggingface.co/stabilityai/sd-turbo
- stable-diffusion.cpp (runtime de inferencia): https://github.com/leejet/stable-diffusion.cpp
- Política de uso aceptable de Stability AI: https://stability.ai/use-policy
- Licencia del repositorio: https://huggingface.co/samoudi/sd-turbo-gguf/blob/main/LICENSE.md
