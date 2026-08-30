# agentic-ptb/opus-high-v3.h094.sft-long.step_32

## Resumen
El modelo `agentic-ptb/opus-high-v3.h094.sft-long.step_32` es un checkpoint intermedio derivado de un run de entrenamiento del proyecto AgentPTB, concretamente de la ejecución **opus-high-v3** llevada a cabo con Claude Code. Se trata de un ajuste fino (SFT) sobre la base `Qwen/Qwen3.5-9B-Base`, con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones). El repositorio está etiquetado explícitamente como `negative-results`, lo que indica que el run no produjo ninguna mejora en los pesos entrenados respecto al modelo base.

Este checkpoint se publica con fines de reproducibilidad y estudio cualitativo, no como un modelo listo para producción. La propia model card advierte que no se debe inferir calidad a partir de su publicación. Es relevante como ejemplo de transparencia en la investigación de IA open source, mostrando cómo se archivan resultados intermedios incluso cuando no son exitosos. Su licencia Apache 2.0 permite su uso y modificación, pero no se recomienda su despliegue sin una evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La arquitectura es la del modelo base `Qwen/Qwen3.5-9B-Base`, un transformer denso de aproximadamente 9,4 mil millones de parámetros. No se especifican detalles adicionales sobre la configuración interna (número de capas, dimensiones de atención, etc.) en la información disponible.

El entrenamiento corresponde a un ajuste fino supervisado (SFT) de larga duración (`sft-long`), ejecutado como parte del proyecto AgentPTB, que utiliza agentes basados en Claude Code para generar y ejecutar pipelines de entrenamiento. El checkpoint corresponde al paso 32 (`step_32`) de la ejecución, en la hora 94 (`h094`). Según la model card, el run **no encontró ninguna mejora en los pesos entrenados**, por lo que se clasifica como resultado negativo. No se proporcionan detalles sobre el dataset utilizado, el número de tokens de entrenamiento ni técnicas como RLHF o DPO.

## Capacidades
Dado que es un checkpoint intermedio sin mejoras verificadas, las capacidades son las heredadas del modelo base Qwen3.5-9B-Base, aunque no se ha confirmado que este checkpoint preserve o modifique dichas capacidades. Basándose en el modelo base, se pueden esperar capacidades típicas de un modelo de 9B:

- Generación de texto generalista en múltiples idiomas, aunque no se especifica la cobertura lingüística exacta.
- Razonamiento básico y comprensión de instrucciones.
- Capacidad limitada de generación de código (depende del entrenamiento del base).
- Sin soporte documentado de tool calling, function calling o modo agente en este checkpoint concreto.
- Sin capacidades multimodales (visión, audio) documentadas.

Se recomienda no asumir ninguna capacidad específica sin realizar una evaluación propia, dado el carácter negativo del entrenamiento.

## Casos de uso
Dado que el modelo es un checkpoint intermedio sin mejoras entrenadas y con advertencia explícita de no inferir calidad, los casos de uso prácticos son muy limitados. Los únicos escenarios razonables son:

- Reproducción de experimentos: investigadores pueden utilizar este checkpoint para replicar el run de AgentPTB y verificar los resultados negativos reportados.
- Estudio cualitativo del comportamiento de un modelo SFT intermedio: analizar cómo evolucionan los pesos a lo largo del entrenamiento, aunque en este caso no haya mejora.
- Comparación de pipelines de entrenamiento: evaluar la diferencia entre este checkpoint y el modelo base para diagnosticar problemas de convergencia o de datos.
- Auditoría de transparencia en IA: ejemplificar buenas prácticas de publicación de resultados negativos en la comunidad open source.
- Pruebas de carga y despliegue técnico: usar el checkpoint para medir requisitos de hardware, latencia o integración con frameworks de inferencia, sin esperar un rendimiento óptimo.
- Formación y educación: como caso de estudio en cursos sobre entrenamiento de LLMs y gestión de experimentos fallidos.

No se recomienda su uso en producción ni en aplicaciones que requieran calidad de generación fiable.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El modelo está etiquetado como `negative-results`, lo que sugiere que su rendimiento no supera al del modelo base Qwen3.5-9B-Base, pero no se proporcionan métricas concretas (MMLU, HumanEval, GSM8K, etc.). No se deben asumir valores numéricos.

## Requisitos de hardware
Los requisitos se estiman según el tamaño del modelo (9,4B parámetros) y el formato safetensors de precisión completa (fp32 o fp16). No hay datos oficiales publicados.

- VRAM estimada: para inferencia en fp16 se necesitan aproximadamente 19 GB de VRAM (9,4B × 2 bytes). En fp32, el doble (unos 38 GB). Con cuantización a 8 bits se reduciría a unos 10 GB, y a 4 bits a unos 5-6 GB, pero no se ofrecen versiones cuantizadas en el repositorio.
- GPU recomendadas: para fp16, una GPU con al menos 24 GB de VRAM, como la NVIDIA RTX 4090 (24 GB) o A100 (40/80 GB). Para fp32, se necesitaría una A100 80 GB o H100.
- En consumer GPU: sí, es posible con cuantización (por ejemplo, RTX 3090/4090 con GGUF o AWQ), pero no se proporcionan archivos cuantizados en este repositorio.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, siempre que se conviertan los pesos al formato adecuado. Dado que es un checkpoint intermedio, puede que no sea compatible con todas las herramientas sin conversión previa.
- Latencia y throughput: no disponible. Al ser un modelo denso de 9B, se espera una latencia típica de decenas de milisegundos por token en GPUs modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares
No hay datos de rendimiento publicados para este checkpoint, por lo que la comparativa se limita a características estructurales. El modelo base es Qwen3.5-9B-Base, que pertenece a la familia Qwen3.5. Se comparan parámetros y licencia:

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| agentic-ptb/opus-high-v3.h094.sft-long.step_32 | 9,4B | no disponible | Apache 2.0 | Checkpoint intermedio, sin mejoras |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | Apache 2.0 | Modelo base oficial |
| Qwen/Qwen3.5-9B-Instruct | 9,4B | no disponible | Apache 2.0 | Variante instruct (no confirmada) |

No se dispone de información sobre otros modelos comparables de la misma categoría (por ejemplo, Llama 3.1 8B o Mistral 7B) en los resultados de búsqueda, por lo que la comparativa se limita a lo anterior.

## Limitaciones y advertencias
- El modelo es un checkpoint intermedio clasificado como `negative-results`: el run no produjo ninguna mejora en los pesos entrenados. No se debe utilizar como si fuera un modelo afinado de calidad.
- No se han publicado métricas de rendimiento ni benchmarks. Cualquier uso en producción es desaconsejado sin una evaluación exhaustiva previa.
- La model card advierte explícitamente: "no inferir calidad a partir de la publicación".
- No se especifican los idiomas soportados, la longitud de contexto ni los datos de entrenamiento, lo que limita la capacidad de predecir su comportamiento.
- Riesgo de alucinación y sesgos: al ser un derivado de Qwen3.5-9B-Base, puede heredar sesgos del modelo base, pero no hay estudios específicos sobre este checkpoint.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no es adecuado para ello dado su estado experimental.
- El repositorio no incluye cuantizaciones ni documentación de despliegue, lo que añade fricción técnica para su uso práctico.

## Enlaces
- HuggingFace del modelo: https://huggingface.co/agentic-ptb/opus-high-v3.h094.sft-long.step_32
- Dataset del run: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Modelo base Qwen3.5-9B-Base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Búsqueda de modelos agentic-ptb en HuggingFace: https://huggingface.co/models?other=agentic-ptb
