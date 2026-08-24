# matrixportalx/UltraRealisticByStableYogi_v3

## Resumen

El modelo `matrixportalx/UltraRealisticByStableYogi_v3` es una conversión del checkpoint de Stable Diffusion 1.5 `UltraRealisticByStableYogi_v3` (creado originalmente por Stable Yogi) al formato QNN (Qualcomm Neural Network) para ejecutarse en la NPU de procesadores Snapdragon. El objetivo es permitir la generación de imágenes fotorrealistas localmente en dispositivos móviles mediante la aplicación Ruya / Local Dream, sin necesidad de conexión a la nube.

La conversión ha sido realizada por el usuario `matrixportalx` y publicada en HuggingFace con licencia `creativeml-openrail-m`. El modelo conserva la arquitectura SD1.5 (UNet + text encoder + VAE) pero con el UNet compilado a un contexto binario QNN para aceleración por NPU, mientras que el text encoder y el VAE se ejecutan mediante MNN en CPU/GPU. El repositorio ocupa 1.0 GB e incluye un archivo ZIP listo para importar en la aplicación.

Su relevancia radica en que democratiza el uso de modelos de difusión en hardware móvil de gama media-alta, reduciendo la latencia y el consumo energético frente a la ejecución exclusiva en CPU/GPU. La variante `min` (HTP v69) ofrece compatibilidad con Snapdragon 7 Gen 1, 7s Gen 2, 8 Gen 1 y superiores, con activaciones de 16 bits y pesos de 8 bits por canal.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (UNet + CLIP text encoder + VAE) |
| Parametros totales | No disponible (SD1.5 base: ~860M en UNet, ~123M en text encoder, ~83M en VAE) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | 77 tokens (límite del text encoder CLIP) |
| Tipos de cuantizacion | QNN: activaciones 16 bits, pesos 8 bits por canal; text_encoder/VAE en MNN (formato no especificado) |
| Idiomas soportados | No disponible (el modelo original está entrenado principalmente con prompts en inglés) |
| Licencia | CreativeML Open RAIL-M |
| Formato de pesos | QNN context binary (UNet), MNN (text_encoder/VAE), distribuido en ZIP |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado desde cero; es una conversión del checkpoint `UltraRealisticByStableYogi_v3`, que según la descripción del autor original fusiona dos modelos previos: `Realism_By_Stable_Yogi` (texturas hiperrealistas) y `Babes By Stable Yogi` (estética estilizada). El resultado es un modelo SD1.5 especializado en retratos fotorrealistas, piel detallada, iluminación cinematográfica y escenas de cuerpo completo.

La conversión a QNN se realizó mediante el repositorio `Sd-1.5-Converting-to-Qualcomm-QNN-Model`. El proceso compila el UNet a un contexto binario QNN optimizado para la NPU de Snapdragon, utilizando el runtime `qnn2.28` con configuración `min` (HTP v69). Esta configuración emplea activaciones de 16 bits y pesos de 8 bits por canal, con 2 MB de VTCM (memoria de tensor). El text encoder y el VAE se mantienen en formato MNN para ejecutarse en CPU/GPU, ya que no se benefician de la aceleración NPU.

No se han publicado detalles sobre el dataset de entrenamiento original ni sobre el proceso de fine-tuning. La resolución de generación está fijada en 512x512, la nativa de SD1.5.

## Capacidades

- Generación de imágenes fotorrealistas a partir de prompts de texto, con especial énfasis en retratos, piel, tejidos y iluminación.
- Soporte para estilos variados: fotografía realista, anime, personajes de videojuegos, escenas oscuras y de contraste.
- Ejecución local en dispositivos Snapdragon mediante la aplicación Ruya / Local Dream, sin conexión a internet.
- Aceleración por NPU para el UNet, lo que reduce la latencia y el consumo energético frente a la CPU/GPU.
- Compatibilidad con la resolución fija de 512x512; no se menciona soporte para resoluciones superiores ni para generación de vídeo.
- No incluye capacidades de tool calling, agentes, ni razonamiento multi-paso; es exclusivamente un modelo de texto a imagen.

## Casos de uso

- Creación de retratos fotorrealistas en el móvil: un usuario puede generar avatares o imágenes de perfil de alta calidad directamente en su teléfono, sin depender de servicios en la nube, gracias a la ejecución local en NPU.
- Generación de contenido para redes sociales: influencers o creadores pueden producir imágenes de producto, fondos o ilustraciones realistas con un prompt, utilizando la app Ruya / Local Dream en un dispositivo Snapdragon.
- Prototipado rápido de conceptos visuales: diseñadores pueden esbozar ideas de personajes o escenas en el momento, con una latencia reducida al estar optimizado para NPU.
- Aplicaciones de entretenimiento personal: generar imágenes personalizadas para juegos de rol, historias visuales o simplemente exploración creativa sin conexión.
- Desarrollo de aplicaciones móviles de IA generativa: los desarrolladores pueden integrar este modelo convertido en sus propias apps mediante el runtime QNN, ofreciendo generación de imágenes offline a sus usuarios.
- Entornos con privacidad estricta: al ejecutarse localmente, no se envían prompts ni imágenes a servidores externos, lo que resulta adecuado para aplicaciones que manejan datos sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como FID, CLIP score, ni comparaciones de latencia o throughput frente a otras conversiones móviles de SD1.5.

## Requisitos de hardware

- Dispositivos con procesador Snapdragon que incluyan NPU con soporte HTP v69 o superior.
- Compatibilidad declarada: Snapdragon 7 Gen 1, 7s Gen 2, 8 Gen 1 y modelos superiores.
- No se especifica la cantidad de RAM necesaria, pero el tamaño del repositorio (1.0 GB) sugiere que se necesita al menos 2 GB de almacenamiento libre y probablemente 4 GB de RAM para una ejecución fluida.
- La variante `min` está diseñada para la máxima compatibilidad; otras variantes podrían requerir hardware más específico.
- No aplica el concepto de VRAM de GPU de escritorio; el modelo se ejecuta en la NPU del SoC móvil.
- Opciones de despliegue: la aplicación Ruya / Local Dream permite importar el modelo mediante `Settings → Import Custom Model`. También es posible integrarlo en aplicaciones propias usando el runtime QNN y MNN, aunque no se proporcionan instrucciones detalladas al respecto.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otras conversiones de SD1.5 para Qualcomm o con modelos móviles similares. El modelo original `UltraRealisticByStableYogi_v3` tiene versiones para otras plataformas (Pony, SDXL) pero no son directamente comparables con esta conversión QNN.

## Limitaciones y advertencias

- El modelo original fue entrenado con un sesgo hacia retratos fotorrealistas, especialmente de mujeres, lo que puede limitar su versatilidad en otros dominios.
- Al ser una conversión de SD1.5, hereda las limitaciones de ese modelo base: resolución fija de 512x512, posible degradación en resoluciones mayores y sensibilidad a prompts complejos.
- La cuantización de 8 bits en los pesos puede introducir una ligera pérdida de calidad en comparación con el checkpoint original en punto flotante, aunque no se han publicado evaluaciones objetivas.
- Riesgo de alucinaciones visuales: el modelo puede generar detalles irreales o inconsistentes, especialmente en anatomía o fondos complejos.
- La licencia CreativeML Open RAIL-M permite uso comercial, pero incluye restricciones sobre usos ilegales o dañinos; es responsabilidad del usuario revisar los términos completos.
- No se garantiza el funcionamiento en todos los dispositivos Snapdragon; la compatibilidad depende de la versión del runtime QNN y del soporte HTP.
- El modelo no soporta otros idiomas en los prompts de forma nativa; el text encoder CLIP está optimizado para inglés.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/matrixportalx/UltraRealisticByStableYogi_v3
- Repositorio de conversión: https://github.com/matrixportalx/Sd-1.5-Converting-to-Qualcomm-QNN-Model
- Página del modelo original en PixAI: https://pixai.art/en/model/1902656038214104925
- Ficha del modelo original en PromptHero: https://prompthero.com/ai-models/ultra-realistic-by-stable-yogi-download/v3-0
- Versión Pony en Civitai: https://civitai.com/models/167318/ultra-realistic-by-stable-yogi-pony
- Versión SDXL en Civitai: https://civitai.com/models/1606452/ultra-realistic-by-stable-yogi-sdxl
