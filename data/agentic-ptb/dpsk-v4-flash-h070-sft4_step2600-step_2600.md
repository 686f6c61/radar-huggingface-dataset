# agentic-ptb/dpsk-v4-flash.h070.sft4_step2600.step_2600

## Resumen

Este repositorio contiene un checkpoint intermedio del barrido de entrenamiento AgentPTB, identificado como `dpsk-v4-flash.h070.sft4_step2600.step_2600`. Se trata de un ajuste fino (fine-tune) del modelo base `Qwen/Qwen3.5-9B-Base`, con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), y un tamaño de repositorio de 18,8 GB en formato safetensors. El nombre del checkpoint indica que corresponde a la hora 70,65 de una ejecución de 100 horas, dentro de la celda de experimento `dpsk-v4-flash`, cuyo "driver" es el modelo DeepSeek V4 Flash en modo de razonamiento `thinking`.

El modelo es un artefacto de investigación intermedio, no un producto final. Su propósito es servir como punto de muestreo en la curva de rendimiento frente al tiempo de entrenamiento, tal y como se describe en la model card. Es relevante para investigadores que estudian dinámicas de entrenamiento, curvas de pérdida o comparaciones entre checkpoints de un mismo barrido. No se proporcionan datos de licencia, idiomas soportados ni benchmarks, por lo que su uso en producción no está documentado ni recomendado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base, no especificada) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del base `Qwen/Qwen3.5-9B-Base`, que emplea una arquitectura transformer estándar. El checkpoint se generó durante un barrido de entrenamiento (sweep) gestionado por AgentPTB, en el que se utiliza como "driver" el modelo DeepSeek V4 Flash con un esfuerzo de razonamiento configurado como `thinking`. El entrenamiento alcanzó las 70,65 horas de una ejecución planificada de 100 horas, y el checkpoint se guardó en el paso 2600 de la fase SFT4.

Un detalle técnico crítico documentado en la model card es que el token `eos_token_id` está configurado como `[248044]`, pero falta el token `248046` (`<|im_end|>`), que es el que la plantilla de chat de Qwen3.5 utiliza para terminar cada turno del asistente. Esto implica que el modelo no detiene la generación al final del turno y puede sobrepasar la ventana de contexto, por lo que las métricas de evaluación de este checkpoint deben considerarse un límite inferior, no una medida fiable. No se especifican detalles sobre el dataset de entrenamiento, ni sobre el uso de RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Generación de texto basada en el modelo base Qwen3.5-9B, con capacidades heredadas de razonamiento y comprensión del lenguaje.
- Razonamiento con esfuerzo `thinking`, según la configuración del barrido, lo que sugiere un modo de razonamiento extendido o cadena de pensamiento.
- No se documentan capacidades específicas de tool calling, function calling, agentes, visión o audio en la información disponible.
- El modelo está pensado como punto de control intermedio para análisis de curvas de entrenamiento, no como un artefacto de uso directo.

## Casos de uso

- Investigación en dinámicas de entrenamiento: permite estudiar cómo evoluciona el rendimiento del modelo a lo largo de las horas de entrenamiento, comparando este checkpoint (h70) con otros de la misma celda (h50, h80, etc.).
- Análisis de curvas de pérdida y convergencia: los checkpoints intermedios son útiles para trazar la mejora del modelo en función del tiempo de cómputo invertido.
- Reproducción de experimentos: investigadores pueden descargar este checkpoint para verificar resultados del barrido AgentPTB o para continuar el entrenamiento desde este punto.
- Comparación de estrategias de fine-tuning: al ser parte de un sweep con diferentes celdas, permite comparar el efecto del driver (DeepSeek V4 Flash) sobre el base Qwen3.5.
- Estudio de artefactos de tokenización: el problema del token EOS faltante ofrece un caso de estudio sobre cómo afecta la configuración de tokens especiales a la generación y a la evaluación.
- Desarrollo de pipelines de evaluación de checkpoints: sirve como ejemplo para validar metodologías de evaluación en modelos intermedios con configuraciones incompletas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explícitamente de que las evaluaciones de este checkpoint son un límite inferior debido al token EOS faltante, por lo que cualquier número reportado no sería fiable sin re-empaquetar el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, pero al tratarse de un modelo de 9,4B parámetros en precisión completa (fp32) o bf16, se estima un consumo de entre 18 y 20 GB de VRAM. Con cuantización a 8 bits podría reducirse a unos 10 GB, y a 4 bits a unos 6 GB, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: una GPU con al menos 24 GB de VRAM (RTX 3090, RTX 4090, A10G) para inferencia en bf16 sin cuantizar. Para entrenamiento o fine-tuning adicional, se necesitarían GPUs de mayor capacidad como A100 (40/80 GB) o H100.
- Cabe en GPUs de consumo: sí, en tarjetas de 24 GB con cuantización o en 16 GB con cuantización a 4 bits, aunque no se ofrecen archivos GGUF en el repositorio.
- Opciones de despliegue: al ser un checkpoint intermedio sin empaquetado final, no se recomienda su despliegue directo. Si se re-empaqueta, podría usarse con vLLM, llama.cpp, Ollama o TGI, pero no hay soporte oficial documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo es un checkpoint intermedio de un fine-tune sobre Qwen3.5-9B-Base, y no se han publicado métricas comparativas con otros modelos de su tamaño. Como referencia, el modelo base Qwen3.5-9B es un transformer denso de 9,4B parámetros, pero este checkpoint concreto no tiene datos de rendimiento propios. No se puede comparar con DeepSeek V4 Flash (284B MoE, 13B activos) porque este checkpoint no es ese modelo, sino un fine-tune que lo usa como driver en el proceso de entrenamiento.

## Limitaciones y advertencias

- El checkpoint no está finalizado: es un punto intermedio de un barrido de 100 horas, por lo que su rendimiento no representa el resultado final del entrenamiento.
- Problema crítico de token EOS: falta el token `248046` (`<|im_end|>`), lo que provoca que el modelo no termine correctamente los turnos y pueda sobrepasar la ventana de contexto. Esto invalida cualquier evaluación directa sin re-empaquetado.
- Sin licencia especificada: no se indica la licencia del modelo, lo que impide conocer las restricciones de uso comercial o redistribución.
- Sin datos de sesgos ni alucinación: no se ha documentado ningún análisis de sesgos, riesgos de alucinación o limitaciones idiomáticas.
- No apto para producción: al ser un artefacto de investigación intermedio con configuración incompleta, no se recomienda su uso en aplicaciones reales.
- Dependencia del modelo base: las capacidades y limitaciones heredadas de Qwen3.5-9B-Base se aplican, pero no se detallan en la documentación disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/dpsk-v4-flash.h070.sft4_step2600.step_2600
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Referencia del driver DeepSeek V4 Flash: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Variante 0731 del driver: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Página de LM Studio sobre DeepSeek V4 Flash: https://lmstudio.ai/models/deepseek-v4-flash
- Artículo de análisis sobre DeepSeek V4 Flash: https://gritsa.com/blog/2026/08/02/deepseek-v4-flash-small-model-big-agentic-leap/
