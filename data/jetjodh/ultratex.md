# jetjodh/UltraTex

## Resumen

UltraTex es un método de generación de texturas PBR (physically based rendering) de alta fidelidad para activos 3D, presentado en SIGGRAPH Asia (TOG) 2026 por Jingzhi Bao, Xiaohe Ma, Hong Li, Yuanming Hu y Xiaoguang Han. El modelo genera los canales de albedo, metallic y roughness necesarios en flujos de renderizado, alineando conocimiento físico para producir materiales coherentes con la geometría de la malla.

El repositorio de Hugging Face (jetjodh/UltraTex) contiene los pesos organizados en cuatro componentes: UltraTex-MV-Albedo (generación multivista de albedo), UltraTex-MV-MR (generación multivista de metallic/roughness, que incluye un componente Qwen3.5-9B), UltraTex-SR (superresolución de texturas, con upscalers 4x y 2x y un DiT en bf16 y fp8_e4m3fn) y UltraTex-Converter-Normal (conversión a mapas de normales). La arquitectura subyacente combina modelos de difusión con transformer (DiT) y VAE, aunque la model card no detalla parámetros totales ni longitud de contexto.

El modelo es relevante para pipelines de creación de contenido 3D que necesitan texturizar activos de forma automática con materiales PBR listos para Blender u otros motores. Sin embargo, el repositorio muestra 0 descargas y 0 likes, con un tamaño de 0.0 GB, lo que sugiere que los pesos podrían no estar efectivamente publicados o accesibles en el momento de la consulta. La licencia no está especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión con transformer (DiT) y VAE; componentes multivista y superresolución |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp8_e4m3fn y bf16 (componente DiT de superresolución); fp16 (VAE podado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que no está especificada; las figuras del proyecto llevan CC BY-NC-SA 4.0) |
| Formato de pesos | no disponible explícitamente; el árbol muestra directorios con scheduler, transformer y vae, y un DiT en bf16 y fp8_e4m3fn |

## Arquitectura y entrenamiento

La model card describe UltraTex como un método para generar texturas PBR de alta fidelidad, centrado en alinear conocimiento físico para producir los canales albedo, metallic y roughness. Los pesos se distribuyen en cuatro módulos: generación multivista de albedo, generación multivista de metallic/roughness (que incorpora un componente Qwen3.5-9B), superresolución de texturas y conversión a mapas de normales. El componente de superresolución incluye un DiT en bf16 y fp8_e4m3fn, un VAE podado en fp16 y upscalers 4x-lite y 2x-RealESRGAN.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. Tampoco se detallan innovaciones técnicas concretas más allá de la alineación de conocimiento físico y el enfoque multivista para la coherencia entre vistas.

## Capacidades

- Generación de texturas PBR para activos 3D, con canales de albedo, metallic y roughness.
- Generación multivista de albedo (UltraTex-MV-Albedo).
- Generación multivista de metallic/roughness (UltraTex-MV-MR), con componente Qwen3.5-9B.
- Superresolución de texturas (UltraTex-SR) con upscalers 4x y 2x y DiT en bf16/fp8.
- Conversión a mapas de normales (UltraTex-Converter-Normal).
- Integración en flujos de renderizado, con ejemplos renderizados en Blender.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Texturizado automático de activos 3D para videojuegos: el módulo multivista de albedo y el de metallic/roughness permiten generar materiales PBR coherentes desde varias vistas, reduciendo el trabajo manual de artistas técnicos.
- Creación de materiales para renderizado en Blender: los canales generados (albedo, metallic, roughness) se integran directamente en flujos de shading, como muestran los ejemplos de la model card renderizados en Blender.
- Superresolución de texturas de baja resolución: el módulo UltraTex-SR, con upscalers 4x y 2x, permite aumentar la resolución de texturas existentes para activos de alta calidad.
- Conversión de mapas de normales: el módulo UltraTex-Converter-Normal genera mapas de normales a partir de la geometría o texturas, necesarios para el detalle superficial en motores de render.
- Prototipado rápido de assets para previsualización: la generación multivista permite obtener materiales completos en etapas tempranas del pipeline, antes del texturizado manual.
- Investigación en generación de materiales PBR: el método y sus componentes sirven como base para experimentos académicos en alineación de conocimiento físico y coherencia multivista.

## Benchmarks y rendimiento

La model card indica que UltraTex supera a todas las líneas base evaluadas en arena ratings y comparaciones de preferencia por pares, pero no se publican cifras numéricas de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: no disponible (no se mencionan vLLM, llama.cpp, Ollama ni TGI; el modelo está orientado a generación de texturas, no a texto).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No disponible.

## Limitaciones y advertencias

- La licencia del modelo no está especificada, lo que impide determinar si el uso comercial está permitido.
- Las figuras del proyecto llevan una licencia CC BY-NC-SA 4.0, que restringe el uso comercial de dichas figuras.
- El repositorio muestra 0 descargas, 0 likes y un tamaño de 0.0 GB, lo que sugiere que los pesos podrían no estar publicados o accesibles.
- No se detallan sesgos conocidos, riesgo de alucinación ni limitaciones de contexto o idioma.
- Al ser un modelo de generación de texturas, no es aplicable a tareas de texto, código o razonamiento general.
- No se especifican requisitos de hardware ni opciones de despliegue, lo que dificulta la planificación de producción.

## Enlaces

- Hugging Face: https://huggingface.co/jetjodh/UltraTex
- Página del proyecto: https://ultratex.vercel.app/
- Vídeo: https://jingzhi03.com/watch/ultratex
- Código (GitHub): https://github.com/ZqlwMatt/UltraTex
- Visor interactivo (demo): https://ultratex-dev.vercel.app/
- Autor Jingzhi Bao: https://jingzhi03.com/
- Autor Xiaohe Ma: https://xiaohema98.com/
- Autor Hong Li: https://luh1124.github.io/hongli.github.io/
- Autor Yuanming Hu: https://yuanming.taichi.graphics/
- Autor Xiaoguang Han: https://gaplab.cuhk.edu.cn/
- Licencia CC BY-NC-SA 4.0: https://creativecommons.org/licenses/by-nc-sa/4.0/
