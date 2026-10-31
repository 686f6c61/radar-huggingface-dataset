# matrixportalx/flux-3-image-klein-npu

## Resumen

FLUX.3 Image Klein — Snapdragon NPU paketi es un repositorio de Hugging Face mantenido por el usuario matrixportalx que empaqueta, en formato GGUF y safetensors, todos los componentes necesarios para ejecutar el modelo de generacion de imagenes FLUX.3 Image Klein de Black Forest Labs sobre la ruta Hexagon NPU de stable-diffusion.cpp. El modelo base es un DiT (Diffusion Transformer) de aproximadamente 4.000 millones de parametros que genera imagenes en 16 pasos con CFG 1, y este paquete lo adapta para dispositivos con NPU de Qualcomm, como los moviles con Snapdragon.

El repositorio no es un modelo original, sino una yansı (copia de mantenimiento) cuyo proposito es garantizar que las aplicaciones del propio autor (Rüya y Esin) sigan teniendo acceso a los ficheros aunque los repositorios fuente se eliminen o se oculten. Los pesos proceden de tres fuentes distintas: el diffusion model en GGUF Q4_0 de leejet/flux-3-image-klein-GGUF (con conversiones de tipos para el NPU), el codificador de texto Qwen3-VL-4B Q4_0 y el VAE de FLUX.2.

Su relevancia radica en la ejecucion local de modelos de difusion de ultima generacion en hardware movil, sin depender de la nube, aprovechando el NPU Hexagon mediante stable-diffusion.cpp. El repositorio pesa 13,1 GB y acumula 291 descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer), tipo FLUX, con soporte de graph cut en stable-diffusion.cpp |
| Parametros totales | 5.548.681.984 (≈5,5 B, suma de diffusion model + codificador de texto; el modelo base Klein es de 4B) |
| Parametros activos | no disponible (no es MoE; no aplica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (diffusion model y LLM), F16 para capas de normalizacion y VAE en BF16/F16 |
| Idiomas soportados | no disponible |
| Licencia | flux-kommunity-license (uso no comercial por defecto; consultar condiciones para uso comercial) |
| Formato de pesos | GGUF (diffusion model y LLM) y safetensors (VAE) |

## Arquitectura y entrenamiento

FLUX.3 Image Klein es un modelo de difusion basado en arquitectura transformer (DiT) desarrollado por Black Forest Labs, con unos 4.000 millones de parametros. Genera imagenes en 16 pasos de muestreo con CFG (classifier-free guidance) igual a 1, lo que simplifica el proceso de denoising y reduce el coste computacional por imagen. Utiliza como codificador de texto Qwen3-VL-4B (un modelo vision-lenguaje cuantizado a Q4_0, el mismo empleado en Krea-2-Turbo-npu) y como VAE el de FLUX.2, que decodifica las latentes a la imagen final.

Este repositorio concreto realiza adaptaciones tecnicas especificas para el NPU Hexagon de Qualcomm: las capas de normalizacion en BF16 se convierten a F16 (el NPU no procesa BF16) y algunos tipos de cuantizacion se remapean (Q8_0 a Q4_0) para compatibilidad con los tipos soportados por la ruta NPU de stable-diffusion.cpp. Ademas, el motor requiere un parche (dit-flux3*.patch) que anade soporte de FLUX.3 y graph cut a stable-diffusion.cpp. No se dispone de informacion sobre los datos de entrenamiento del modelo base ni sobre tecnicas de alineacion posteriores.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) mediante arquitectura DiT de FLUX.3
- Comprension de prompts potenciada por el codificador de texto Qwen3-VL-4B, un modelo vision-lenguaje
- Generacion eficiente en 16 pasos con CFG 1, adecuada para hardware con recursos limitados
- Ejecucion totalmente local en NPU Hexagon de Snapdragon, sin conexion a la nube
- Compatibilidad con stable-diffusion.cpp como motor de inferencia
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo de difusion, no un LLM

## Casos de uso

- Generacion de imagenes offline en moviles: permite crear imagenes desde un prompt directamente en un telefono Snapdragon, sin enviar datos a servidores, util para apps de creatividad que priorizan la privacidad.
- Aplicaciones moviles de arte generativo: el paquete esta pensado para alimentar las aplicaciones Rüya y Esin del propio autor, y puede servir de base para apps similares de edicion y creacion visual en Android.
- Prototipado en dispositivos edge: desarrolladores que quieran validar pipelines de difusion sobre NPU Hexagon pueden usar este paquete como punto de partida con stable-diffusion.cpp.
- Generacion de ilustraciones y assets rapidos: con 16 pasos y CFG 1, el coste por imagen es bajo, adecuado para bocetos conceptuales y material visual preliminar.
- Pruebas de cuantizacion agresiva: al emplear Q4_0 en el diffusion model y el codificador de texto, es un caso de estudio util para evaluar la degradacion de calidad con cuantizacion de 4 bits en NPU.
- Demostraciones y educacion: util para mostrar en talleres o clases como se despliega un modelo de difusion moderno en hardware de consumo movil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Dispositivo con NPU Hexagon de Qualcomm (Snapdragon), ya que el paquete esta especificamente preparado para la ruta NPU de stable-diffusion.cpp
- Espacio de almacenamiento: 13,1 GB para el repositorio completo
- Memoria: no disponible una cifra exacta; con un diffusion model 4B en Q4_0 mas Qwen3-VL-4B en Q4_0 y el VAE, es razonable esperar necesidades de memoria del orden de varios GB de RAM/VRAM unificada, tipicas de SoCs Snapdragon de gama alta
- Motor de inferencia: stable-diffusion.cpp con soporte FLUX.3 y el parche de graph cut (dit-flux3*.patch)
- No se menciona compatibilidad con GPU de escritorio (CUDA, Metal) ni con llama.cpp, Ollama, vLLM o TGI; el paquete esta orientado a stable-diffusion.cpp sobre NPU
- Latencia y throughput: no disponible

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Objetivo de hardware | Licencia |
|---|---|---|---|---|
| FLUX.3 Image Klein NPU (este) | ≈5,5 B (base 4B) | GGUF Q4_0 + safetensors | NPU Hexagon (Snapdragon) | flux-kommunity-license |
| Krea-2-Turbo-npu | no disponible | GGUF (mismo codificador Qwen3-VL-4B Q4_0) | NPU Hexagon (Snapdragon) | no disponible |
| flux2-klein-4b-npu | no disponible | safetensors (VAE compartido) | NPU Hexagon (Snapdragon) | no disponible |

Los tres paquetes comparten ecosistema (stable-diffusion.cpp sobre NPU, mantenido por matrixportalx) y componentes; la diferencia principal es que este empaqueta FLUX.3 Image Klein, mientras que los otros dos corresponden a generaciones o variantes anteriores de la familia FLUX/Krea.

## Limitaciones y advertencias

- Licencia no comercial por defecto: la flux-kommunity-license exige revisar sus condiciones antes de cualquier uso comercial; el propio README lo advierte explicitamente.
- Dependencia de parches externos: el motor stable-diffusion.cpp necesita soporte de FLUX.3 y un parche de graph cut; sin ellos el paquete no funciona.
- Requiere NPU Hexagon: no es un paquete pensado para GPU de escritorio o CPU genericas; las conversiones de tipos (BF16 a F16, Q8_0 a Q4_0) estan hechas para el NPU y pueden degradar la calidad de imagen respecto a los pesos originales.
- Cuantizacion agresiva: Q4_0 en el diffusion model y el codificador de texto puede producir perdida de detalle o artefactos frente a versiones en mayor precision.
- Repositorio espejo: su existencia depende de los repositorios fuente; si estos cambian de version, la yansı puede quedar desactualizada.
- Datos del modelo base (datos de entrenamiento, contexto, idiomas del codificador de texto) no disponibles en la model card.
- Proyecto de comunidad con pocas descargas (291) y un solo like: escaso historial de validacion por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/matrixportalx/flux-3-image-klein-npu
- Licencia (flux-kommunity-license): https://huggingface.co/black-forest-labs/flux-3-image-klein/blob/main/LICENSE.md
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Diffusion model fuente (GGUF): https://huggingface.co/leejet/flux-3-image-klein-GGUF
- Codificador de texto fuente: https://huggingface.co/matrixportalx/Krea-2-Turbo-npu
- VAE fuente: https://huggingface.co/matrixportalx/flux2-klein-4b-npu
- Perfil del autor (aplicaciones Rüya y Esin): https://huggingface.co/matrixportalx
