# FluidInference/ace-step-webgpu-models

## Resumen

Este repositorio contiene paquetes de modelos optimizados para WebGPU, que permiten ejecutar ACE-Step 1.5 Turbo en el navegador. ACE-Step es un modelo de generación de música a partir de texto y letras, desarrollado originalmente por el equipo ACE-Step. El paquete es una conversión determinista y verificada por SHA-256, creada por FluidInference para su proyecto de audio en el navegador `fluidaudio-web`. La relevancia radica en ofrecer una vía práctica para ejecutar un modelo de generación musical de calidad sin infraestructura de servidor, directamente en el cliente con aceleración por GPU. El repositorio incluye 113 archivos de pesos y 3 manifiestos, con un tamaño total de 5,7 GB, que abarcan los componentes principales del modelo: un text encoder, un LM de 5 Hz, un DiT y un VAE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el paquete incluye componentes de ACE-Step 1.5 Turbo: text encoder, LM de 5 Hz, DiT, VAE) |
| Parametros totales | No disponible (no se publica el número exacto de parámetros del modelo completo) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | packed-BF16 (encoders), FP16 dense (DiT y VAE), 4-bit MatMulNBits (LM de 5 Hz) |
| Idiomas soportados | No disponible |
| Licencia | MIT para el empaquetado y port; los pesos conservan las licencias originales de ACE-Step y Qwen (ver `THIRD_PARTY_LICENSES`) |
| Formato de pesos | No disponible (se indica "packed-BF16" y "FP16", pero no se especifica el formato de archivo; probablemente safetensors o binarios WebGPU) |

## Arquitectura y entrenamiento

El repositorio no incluye información detallada sobre la arquitectura del modelo subyacente, pero según la descripción del Space asociado, ACE-Step 1.5 Turbo combina varios componentes:

- Un text encoder (Qwen3-Embedding-0.6B en fp16) que convierte el texto de entrada en estados ocultos de condicionamiento.
- Un modelo de lenguaje de 5 Hz (ACE-Step acestep-5Hz-lm-0.6B) que genera una cadena de pensamiento corta y emite aproximadamente 50 códigos de audio por cada 10 segundos de salida.
- Un DiT (revisión 7, en FP16 denso) que usa los códigos como hints de cross-attention para generar características acústicas a 25 Hz.
- Un VAE (revisión 7, FP16) que expande los códigos a características acústicas finales.

No se proporciona información sobre el entrenamiento, el dataset, ni el proceso de alineación (RLHF/DPO). El repositorio es un mirror de un paquete de producción generado por un convertidor determinista (`model/convert.py --profile production`), por lo que no incluye los pesos originales en su formato nativo.

## Capacidades

- Generación de música a partir de descripciones de texto y letras.
- Ejecución en navegador con WebGPU, sin necesidad de servidor dedicado.
- Soporte de multi-turno (texto y letras) gracias a la integración con el text encoder.
- Posible generación de música con voz (si el modelo ACE-Step lo soporta, no se detalla).
- No se indica soporte de tool calling, agentes, ni razonamiento multi-paso más allá del chain-of-thought interno del LM de 5 Hz.

## Casos de uso

- **Generación de música en aplicaciones web interactivas**: un usuario escribe una descripción (p. ej., "una balada pop con piano") y la aplicación genera una pista de audio directamente en el navegador, sin envío de datos a servidores externos.
- **Prototipado rápido de composiciones**: músicos y creadores pueden experimentar con diferentes estilos y letras en tiempo real, con respuesta local gracias a la GPU del cliente.
- **Aplicaciones educativas de composición**: los estudiantes pueden explorar cómo las descripciones textuales se traducen en estructuras musicales, usando el modelo como herramienta de aprendizaje.
- **Generación de música en entornos con privacidad estricta**: al ejecutarse localmente en el navegador, los datos de entrada no salen del dispositivo, útil para aplicaciones que manejan contenido sensible o propietario.
- **Herramientas de creación de contenido para redes sociales**: integración en editores web para generar fondos musicales personalizados según el texto de una publicación.
- **Investigación en interacción humano-IA**: el paquete permite estudiar la generación de música en el lado del cliente, facilitando experimentos sobre UX y latencia en dispositivos variados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de calidad de generación musical (p. ej., FAD, CLAP) ni comparaciones con otros modelos de generación de música.

## Requisitos de hardware

- Se requiere un dispositivo con soporte WebGPU (Chrome, Edge, Safari, Firefox en versiones recientes) y una GPU compatible (D3D12, Vulkan, Metal).
- No se especifica la VRAM mínima, pero dado el tamaño total de los pesos (5.7 GB), se estima que se necesita al menos 6-8 GB de VRAM para cargar todos los componentes en memoria, aunque la cuantización (BF16 y 4-bit) puede reducir los requisitos.
- Puede ejecutarse en GPUs de consumo como NVIDIA RTX 3060 (8 GB) o superiores, así como en GPUs integradas modernas (Apple Silicon, Intel Iris Xe) con limitaciones de rendimiento.
- No se menciona despliegue en servidores (vLLM, TGI, etc.), ya que el paquete está diseñado para el navegador.
- La latencia dependerá de la GPU y del tamaño del contexto; no se ofrecen datos de throughput.

## Comparativa con modelos similares

No disponible. No se han encontrado comparaciones con otros modelos de generación de música en el contexto de WebGPU (como MusicGen, AudioLDM, etc.) en la información proporcionada.

## Limitaciones y advertencias

- **Licencia de pesos**: aunque el empaquetado es MIT, los pesos del modelo original ACE-Step y de Qwen tienen sus propias licencias, que pueden imponer restricciones comerciales o de uso. Revisar `THIRD_PARTY_LICENSES` antes de usarlo en producción.
- **Dependencia de WebGPU**: el modelo solo funciona en navegadores con soporte WebGPU, lo que limita su uso en entornos sin GPU o navegadores antiguos.
- **Riesgo de alucinación**: como todo modelo generativo, puede producir contenido musical o letras no deseadas o de baja calidad.
- **Sesgos**: no se han documentado sesgos específicos, pero el modelo podría reflejar los sesgos de los datos de entrenamiento de ACE-Step y Qwen.
- **Latencia variable**: la generación en el navegador depende del hardware del usuario, lo que puede dar resultados inconsistentes en dispositivos de gama baja.
- **Sin soporte de contexto largo**: no se especifica la longitud de contexto, pero los componentes (LM de 5 Hz) sugieren que el modelo está pensado para clips de música cortos (10 segundos de audio por cada 50 códigos), no para composiciones largas.

## Enlaces

- [Repositorio de Hugging Face](https://huggingface.co/FluidInference/ace-step-webgpu-models)
- [Space de demostración](https://huggingface.co/spaces/shreyask/ace-step-webgpu)
- [Repositorio de la organización FluidInference](https://github.com/FluidInference)
- [Perfil de la organización en GitHub](https://github.com/FluidInference/.github)
- [Sitio web de Fluid Inference](https://www.fluidinference.com/)
- [Modelo original ACE-Step 1.5](https://huggingface.co/ACE-Step/Ace-Step1.5) (enlace de referencia, no incluido en la información pero citado en la card)
- [Demo original de Hamza Qayyum](https://acestep.narcotic.sh)
