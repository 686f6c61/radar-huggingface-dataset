# slippedJim/Kimi-K3-Draft

## Resumen

El modelo `slippedJim/Kimi-K3-Draft` es un modelo auxiliar de 3.562.312.961 parámetros (3,56B) diseñado específicamente para decodificación especulativa con el modelo gigante `moonshotai/Kimi-K3` (2,8T parámetros). Desarrollado por el usuario slippedJim, este draft model se entrena mediante destilación especulativa on-policy, de modo que genera secuencias de tokens candidatos que el modelo grande verifica en paralelo, acelerando la inferencia sin degradar la calidad de salida. Su estructura de archivos, nombres de tensores y `config.json` son idénticos a los de `Inferact/Kimi-K3-DSpark`, por lo que actúa como reemplazo directo de ese modelo, solo con pesos diferentes.

La relevancia de este modelo radica en que Kimi-K3, el modelo base, es el primer modelo abierto de clase 3T con visión nativa y ventana de contexto de 1 millón de tokens, lo que hace que su inferencia sea extremadamente costosa. Un draft model eficiente permite reducir la latencia y el coste computacional en entornos de producción donde se despliega Kimi-K3 para tareas de codificación agéntica, generación de informes o razonamiento de largo alcance. El acceso al repositorio está restringido (gated) y requiere aceptar condiciones en HuggingFace.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSpark (modelo draft para decodificación especulativa) |
| Parametros totales | 3.562.312.961 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura DSpark, un diseño ligero de transformer optimizado para decodificación especulativa. A diferencia de un modelo de lenguaje convencional, su objetivo no es generar texto autónomo, sino proponer múltiples tokens plausibles que el modelo grande Kimi-K3 verifica en un solo paso de avance. El entrenamiento se realiza mediante destilación especulativa on-policy, un proceso en el que el draft model aprende a imitar las distribuciones de probabilidad del modelo profesor (Kimi-K3) mientras este genera texto real, lo que mejora la alineación entre ambos y maximiza la tasa de aceptación de tokens.

La configuración del modelo es idéntica a la de `Inferact/Kimi-K3-DSpark`, lo que garantiza compatibilidad total con los pipelines existentes. No se han publicado detalles adicionales sobre el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas como RLHF o DPO. El modelo base Kimi-K3, por su parte, utiliza Kimi Delta Attention (KDA) y Attention Residuals (AttnRes), innovaciones que permiten manejar ventanas de contexto de 1M tokens con eficiencia, pero el draft model no incorpora necesariamente estas técnicas en su arquitectura ligera.

## Capacidades

- Decodificación especulativa: genera secuencias de tokens candidatos que el modelo grande Kimi-K3 verifica, permitiendo generar varios tokens por paso de inferencia.
- Compatibilidad directa con Kimi-K3: diseñado como reemplazo de `Inferact/Kimi-K3-DSpark`, se integra sin cambios en pipelines que ya usan ese draft model.
- Inferencia acelerada: reduce la latencia y el coste computacional en despliegues de Kimi-K3, especialmente útil en tareas de generación larga o razonamiento multi-paso.
- No dispone de capacidades autónomas de generación de texto de alta calidad, tool calling, visión o audio; su función es estrictamente auxiliar.

## Casos de uso

- Aceleración de inferencia en producción de Kimi-K3: en un servicio de codificación agéntica que use Kimi-K3 como modelo principal, el draft model se coloca delante para proponer tokens, reduciendo el tiempo de respuesta en cada llamada.
- Despliegue en entornos con restricciones de latencia: aplicaciones de chat o asistentes que requieran respuestas casi instantáneas pueden beneficiarse de la decodificación especulativa para mantener la calidad de Kimi-K3 con menor tiempo de espera.
- Reducción de costes en inferencia a gran escala: al disminuir el número de pasos de avance del modelo grande, se reduce el consumo de GPU y el coste por petición en servicios cloud.
- Integración en pipelines de generación de informes y documentos largos: tareas que generan miles de tokens (informes de consultoría, análisis de código) se benefician de la aceleración sin sacrificar coherencia.
- Evaluación de modelos draft: investigadores pueden comparar la tasa de aceptación y el speedup de este modelo frente a otros draft models para Kimi-K3.
- Uso en entornos con GPUs limitadas: al ser un modelo de solo 3,56B parámetros, puede ejecutarse en GPUs consumer mientras el modelo grande se ejecuta en clústeres, permitiendo un pipeline híbrido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre tasa de aceptación de tokens, speedup relativo frente a la inferencia sin draft, ni comparaciones con otros draft models como `Inferact/Kimi-K3-DSpark`. Se recomienda realizar pruebas propias en el caso de uso concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,56B parámetros, en FP16 ocuparía aproximadamente 7 GB; en INT8 unos 3,5 GB; en INT4 unos 1,8 GB. Sin embargo, el tamaño del repositorio (45,3 GB) sugiere que puede incluir múltiples archivos o cuantizaciones, aunque no se especifican.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3070, RTX 4060, A10) puede ejecutar el modelo en FP16. Para mayor velocidad, se recomienda una RTX 3090/4090 o A100.
- Cabe en GPUs consumer: sí, en FP16 cabe en RTX 3080/3090 y superiores; en cuantizaciones de 4 bits cabría en GPUs con 4 GB o más.
- Opciones de despliegue: al ser compatible con `transformers`, puede usarse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. No se han publicado guías específicas de despliegue.
- Latencia y throughput: no disponibles. Dependen de la GPU, la cuantización y la tasa de aceptación del draft model.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| slippedJim/Kimi-K3-Draft | 3,56B | no disponible | other (gated) | HuggingFace |
| Inferact/Kimi-K3-DSpark | no disponible | no disponible | no disponible | HuggingFace |
| Medusa (draft genérico) | varía | varía | Apache 2.0 | GitHub |

No se dispone de datos suficientes para comparar rendimiento. `Inferact/Kimi-K3-DSpark` es el modelo al que este reemplaza, pero no se conocen sus parámetros ni licencia. Medusa es una técnica de decodificación especulativa genérica que puede aplicarse a cualquier modelo, pero no es un modelo preentrenado específico para Kimi-K3.

## Limitaciones y advertencias

- Es un modelo draft, no apto para uso directo como generador de texto; requiere el modelo grande Kimi-K3 para funcionar.
- La licencia es "other" y el acceso está restringido; es necesario aceptar condiciones en HuggingFace antes de descargarlo, lo que puede limitar su uso comercial.
- No se han publicado datos sobre sesgos, alucinaciones o limitaciones de idioma. Al ser un modelo auxiliar, su impacto en la calidad final es indirecto, pero puede heredar sesgos del modelo profesor.
- El tamaño del repositorio (45,3 GB) es desproporcionado para 3,56B parámetros, lo que sugiere que puede incluir múltiples versiones o archivos adicionales; se recomienda revisar el contenido antes de descargar.
- No hay garantía de soporte o mantenimiento por parte del autor, dado que el proyecto parece experimental (0 descargas, 0 likes).
- La fecha de creación (2026) y la falta de benchmarks indican que es un modelo muy reciente y no validado en entornos de producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/slippedJim/Kimi-K3-Draft
- Repositorio alternativo (K3_draft): https://huggingface.co/slippedJim/K3_draft
- Página oficial de Kimi K3: https://www.kimi.ai/ai-models/kimi-k3
- Repositorio GitHub de Kimi-K3: https://github.com/MoonshotAI/Kimi-K3
- Análisis de jailbreak de Kimi K3: https://www.penligent.ai/hackinglabs/kimi-k3-jailbreak/
