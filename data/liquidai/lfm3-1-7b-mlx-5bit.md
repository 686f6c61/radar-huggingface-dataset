# LiquidAI/LFM3-1.7B-MLX-5bit

## Resumen

LFM3-1.7B-MLX-5bit es una versión cuantizada a 5 bits del modelo LFM3-1.7B de Liquid AI, empaquetada en formato MLX para su ejecución nativa en Apple Silicon. Liquid AI es una empresa conocida por sus modelos de arquitectura "liquid" (redes neuronales dinámicas) y por la familia LFM (Liquid Foundation Models). Este checkpoint concreto no es un modelo nuevo, sino una conversión de pesos del modelo base LFM3-1.7B, con 1.728.801.536 parámetros totales y un peso en disco de aproximadamente 1,19 GB gracias a la cuantización afín de 5 bits con grupos de 64.

El modelo resuelve el problema de desplegar un LLM de ~1,7B parámetros en hardware de consumo Apple (MacBook, Mac mini, Mac Studio) sin necesidad de GPU dedicada, manteniendo soporte para 16 idiomas (incluido el castellano), generación de texto conversacional y un modo de razonamiento opcional ("thinking") que se activa mediante un flag en tiempo de inferencia. La relevancia actual radica en que el ecosistema MLX está madurando rápidamente como alternativa local a CUDA para desarrolladores que trabajan en macOS, y este checkpoint es uno de los pocos de la familia LFM3 disponibles en ese formato.

La información pública disponible sobre esta variante es limitada: la model card remite a la del modelo base para detalles de arquitectura y entrenamiento, y no se publican benchmarks específicos para la versión cuantizada. Esta ficha recoge lo que se puede verificar y marca explícitamente como "no disponible" todo aquello que no figura en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la model card remite a la del modelo base LFM3-1.7B) |
| Parámetros totales | 1.728.801.536 (≈1,73B) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 5 bits afín (affine quantization) con grupos de 64; formato MLX |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | lfm1.0 (license_name: lfm1.0, license: other) |
| Formato de pesos | safetensors en formato MLX (custom_code) |

## Arquitectura y entrenamiento

La model card de esta variante no describe la arquitectura interna; únicamente indica que es una conversión cuantizada del modelo base LiquidAI/LFM3-1.7B y remite a la model card original para los detalles de arquitectura y uso. Por tanto, no se dispone de información verificable sobre si LFM3 emplea un transformer clásico, una arquitectura híbrida con componentes de estado (SSM) o algún diseño propietario de Liquid AI. Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

Lo que sí se puede afirmar con la información proporcionada es el esquema de cuantización: pesos en 5 bits con cuantización afín y tamaño de grupo 64, lo que reduce el modelo a aproximadamente 1,19 GB en disco. La conversión está pensada para MLX y requiere MLX-VLM 0.7.11 o superior para cargarse; en el momento de publicación de la model card, ninguna release de mlx-lm soporta aún LFM3, con soporte en revisión en el PR ml-explore/mlx-lm#2016. El modelo base expone un modo de razonamiento opcional que en esta variante se controla con `--enable-thinking`.

## Capacidades

- Generación de texto conversacional multi-turno, según el pipeline declarado (`text-generation`, `conversational`).
- Modo de razonamiento ("thinking") opcional, activable con `--enable-thinking`; desactivado por defecto.
- Ajuste de parámetros de muestreo recomendado por el autor para matemáticas y ciencia: `temperature 1.0`, `top-p 0.95`, `top-k 20`, `repetition-penalty 1.0`.
- Ajuste recomendado para uso general: `temperature 0.1`, `top-k 50`, `repetition-penalty 1.1`.
- Soporte de 16 idiomas, entre ellos castellano, inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Ejecución local en Apple Silicon mediante MLX y MLX-VLM.
- No se documentan en la información disponible capacidades de visión, audio, tool calling ni function calling para esta variante.

## Casos de uso

- Asistente conversacional local en macOS: el modelo puede ejecutarse íntegramente en un Mac con MLX-VLM, sin conexión a internet, para tareas de chat multi-turno con datos que no deben salir del dispositivo.
- Prototipado rápido de aplicaciones de IA en Apple Silicon: al pesar ~1,19 GB, se puede integrar en un flujo de desarrollo en un MacBook sin GPU dedicada y validar prompts y flujos conversacionales antes de escalar a modelos mayores.
- Generación de texto en castellano y otros 15 idiomas: útil para aplicaciones multilingües ligeras donde no se requiere un modelo de gran tamaño, como resúmenes o reescritura de textos.
- Razonamiento asistido con modo thinking: para problemas de matemáticas o ciencia, el autor recomienda activar `--enable-thinking` y usar los parámetros de muestreo específicos, lo que permite usarlo como apoyo en tareas de cálculo o explicación técnica.
- Despliegue en entornos con restricciones de privacidad: al ser un modelo local, encaja en escenarios donde no se permite enviar datos a APIs externas (sanidad, legal, educación).
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la pérdida de calidad de una cuantización de 5 bits frente al modelo base LFM3-1.7B en tareas concretas.
- Educación y experimentación: por su tamaño reducido y su licencia específica, es adecuado para estudiar el comportamiento de modelos cuantizados en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta variante no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos, y remite a la model card del modelo base para cualquier dato de rendimiento.

## Requisitos de hardware

- VRAM/RAM unificada estimada: los pesos ocupan 1,19 GB; con overhead de MLX, caché KV y contexto, se recomienda al menos 3-4 GB de memoria unificada libre para uso cómodo.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No está pensado para GPU NVIDIA ni CUDA.
- Cabe en cualquier Mac con Apple Silicon; no requiere GPU dedicada.
- Despliegue: MLX-VLM 0.7.11 o superior (`pip install -U "mlx-vlm>=0.7.11"`). Soporte en mlx-lm en revisión (PR ml-explore/mlx-lm#2016), por lo que no se debe asumir compatibilidad con releases actuales de mlx-lm.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni comparaciones con otros modelos, y no se dispone de benchmarks publicados para esta variante que permitan una comparación rigurosa con alternativas de tamaño similar.

## Limitaciones y advertencias

- La cuantización a 5 bits puede degradar la calidad respecto al modelo base LFM3-1.7B; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- No se documentan sesgos conocidos, pero al ser un modelo de 1,7B entrenado con datos no descritos en esta ficha, es razonable esperar sesgos y errores factuales propios de modelos pequeños.
- Riesgo de alucinación: no evaluado en la información disponible; en modelos de este tamaño es habitual que aparezca en tareas de conocimiento factual.
- Longitud de contexto no disponible: no se puede garantizar el comportamiento en conversaciones largas.
- Licencia lfm1.0 (license: other): es necesario revisar el archivo LICENSE del repositorio antes de cualquier uso comercial; la información disponible no detalla las restricciones.
- El modelo requiere MLX-VLM ≥ 0.7.11 y no funciona con mlx-lm en las releases actuales, lo que limita las opciones de despliegue.
- Solo es ejecutable en Apple Silicon; no es portable a CUDA ni a CPU x86 sin conversión adicional.
- El modo thinking está desactivado por defecto; olvidar activarlo puede dar resultados peores en tareas de razonamiento.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/LiquidAI/LFM3-1.7B-MLX-5bit
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Guía de despliegue en MLX: https://docs.liquid.ai/deployment/on-device/mlx
- Consola/API: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
- MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- PR de soporte en mlx-lm: https://github.com/ml-explore/mlx-lm/pull/2016
