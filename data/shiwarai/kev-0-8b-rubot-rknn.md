# ShiWarai/kev-0.8b-rubot-rknn

## Resumen

El modelo `ShiWarai/kev-0.8b-rubot-rknn` es un artefacto publicado en Hugging Face por el usuario ShiWarai bajo licencia Apache 2.0. Por el identificador se deduce que se trata de un modelo de aproximadamente 0,8 mil millones de parámetros, presumiblemente derivado de una familia base tipo Qwen o similar, y que ha sido convertido al formato RKNN, el formato de pesos optimizado para los aceleradores NPU (RKNN Toolkit) de Rockchip. Este detalle es relevante porque indica que el modelo está pensado para inferencia en hardware embebido, como placas Rockchip RK3588 y derivadas, más que para despliegue en GPU de servidor.

El nombre incluye el sufijo "rubot", que sugiere un fine-tuning orientado a un asistente conversacional o a un robot concreto, aunque la model card publicada no aporta información sobre el dataset de entrenamiento, el proceso de ajuste ni las capacidades específicas. La información disponible es muy limitada: no hay pipeline declarado, no se listan idiomas soportados y el repositorio no registra descargas ni interacciones en el momento de la consulta.

Por tanto, esta ficha describe lo que puede inferirse de forma rigurosa a partir del identificador, el formato y la licencia, y marca explícitamente como "no disponible" todo aquello que el autor no ha documentado. Es un modelo de nicho, útil para quien necesite un LLM pequeño ejecutable en NPU Rockchip, pero sin garantías documentales sobre su calidad o comportamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el identificador sugiere transformer decoder-only de ~0,8B; sin confirmar por el autor) |
| Parámetros totales | ~0,8 mil millones (inferido del nombre, no confirmado) |
| Parámetros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el formato RKNN implica cuantización para NPU, pero se desconoce el esquema exacto) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | RKNN (formato de Rockchip RKNN Toolkit) |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. El sufijo "rknn" indica únicamente que los pesos han sido convertidos desde un formato original (probablemente safetensors o GGUF) al formato RKNN mediante el toolkit de Rockchip, un paso que normalmente implica cuantización a int8 o int4 y una compilación específica para la NPU del SoC objetivo.

El sufijo "rubot" apunta a un ajuste fino (fine-tuning) sobre una base de ~0,8B con fines conversacionales o de control de robot, pero el autor no documenta ni el modelo base, ni el dataset, ni la metodología. Sin esa información no es posible evaluar la calidad del ajuste ni reproducir el proceso.

## Capacidades

- Generación de texto: presumible, dado que se trata de un modelo de lenguaje, aunque no está documentado por el autor.
- Conversación multi-turno: probable por el sufijo "rubot", sin confirmar.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso o modo agente: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (visión, audio, thinking mode): no disponible.
- Ejecución en NPU Rockchip: capacidad implícita en el formato RKNN, que es el rasgo diferencial del artefacto.

## Casos de uso

- Inferencia en placas Rockchip RK3588: el modelo está empaquetado en RKNN, por lo que su caso de uso principal es ejecutarse en la NPU de este SoC para tareas de generación de texto en dispositivos embebidos, con bajo consumo energético.
- Asistentes locales en dispositivos edge: al ser un modelo de ~0,8B, puede integrarse en dispositivos con recursos limitados para respuestas conversacionales básicas sin conexión a la nube.
- Robótica de bajo coste: el sufijo "rubot" sugiere su uso como cerebro conversacional o de instrucciones en un robot basado en Rockchip, donde la latencia y el consumo importan más que la calidad lingüística.
- Prototipado de pipelines LLM en NPU: útil para desarrolladores que quieran validar el flujo de conversión RKNN y despliegue en hardware Rockchip antes de invertir en modelos mayores.
- Procesamiento de texto en kioscos o terminales industriales: para tareas de clasificación, resumen corto o respuestas guiadas en entornos sin GPU.
- Investigación sobre cuantización y despliegue en aceleradores no convencionales: el artefacto sirve como referencia para estudiar el rendimiento de un LLM pequeño compilado para NPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; el modelo está compilado para NPU Rockchip y no para GPU. En un despliegue alternativo en GPU, un modelo de ~0,8B en int8 requeriría del orden de 1 GB de memoria, pero esto es una estimación general, no un dato del autor.
- GPU recomendadas: no disponible para el artefacto RKNN; para una hipotética ejecución en GPU, cualquier GPU consumer moderna (RTX 3060 o superior) sería suficiente por tamaño, sin datos de rendimiento.
- Hardware objetivo: NPU de Rockchip (familia RK3588 y compatibles con RKNN Toolkit), según el formato de pesos.
- Opciones de despliegue: RKNN Toolkit / runtime de Rockchip. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ShiWarai/kev-0.8b-rubot-rknn | ~0,8B (inferido) | no disponible | RKNN | Apache 2.0 | Orientado a NPU Rockchip; sin benchmarks |
| Qwen2.5-0.5B | 0,5B | 32K (según familia) | safetensors, GGUF | Apache 2.0 | Base generalista ampliamente documentada |
| Llama 3.2 1B | 1,2B | 128K | safetensors, GGUF | Llama 3.2 Community License | Base generalista con benchmarks públicos |
| SmolLM2-1.7B | 1,7B | 8K | safetensors, GGUF | Apache 2.0 | Base pequeña con documentación completa |

La comparación es aproximada: los modelos alternativos son bases generalistas con documentación y benchmarks públicos, mientras que el artefacto de ShiWarai carece de esa información y su valor diferencial es el empaquetado RKNN para hardware Rockchip.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay model card sustantiva, ni datos de entrenamiento, ni evaluación, lo que impide validar su calidad o comportamiento en producción.
- Riesgo de alucinación: inherente a los modelos de ~0,8B, agravado por la falta de información sobre el ajuste.
- Sesgos desconocidos: al no documentarse el dataset, no es posible evaluar sesgos de género, idioma o dominio.
- Idiomas no declarados: no se garantiza un rendimiento aceptable en castellano ni en ningún otro idioma.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Formato RKNN: limita el uso a hardware Rockchip o a herramientas de conversión; no es directamente cargable en frameworks estándar de GPU sin reconversión.
- Sin métricas de latencia ni throughput: no se puede planificar capacidad de despliegue con datos del autor.
- Cero tracción en la comunidad (0 descargas, 0 likes en el momento de la consulta): no hay evidencia de uso real ni de validación por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/ShiWarai/kev-0.8b-rubot-rknn
- No se han encontrado en la información disponible otros enlaces a papers, blogs, repositorios o demos.
