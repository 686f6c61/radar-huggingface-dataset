# MergekitCloud/mergekit-78

## Resumen

MergekitCloud/mergekit-78 es un modelo de lenguaje de 14.770 millones de parámetros creado mediante la fusión de varios modelos de la familia Qwen2.5 utilizando la herramienta mergekit y el método Model Stock (arxiv:2403.19522). El modelo resultante combina las capacidades de Qwen/Qwen2.5-14B, Qwen/Qwen2.5-Coder-14B, Qwen/Qwen2.5-Coder-14B-Instruct y rombodawg/Rombos-Coder-V2.5-Qwen-14b, tomando como base el modelo Qwen/Qwen2.5-14B. Esta fusión busca obtener un modelo que herede las fortalezas de cada componente, especialmente en tareas de generación de código y razonamiento, sin necesidad de entrenamiento adicional.

El modelo está disponible en formato safetensors y es compatible con la librería transformers. Al ser un merge, no se ha realizado un fine-tuning específico, por lo que sus capacidades dependen de los modelos originales. Su relevancia radica en que demuestra cómo la fusión de modelos puede producir alternativas útiles para desarrolladores que buscan combinar rendimiento en código y lenguaje general sin incurrir en costes de entrenamiento. Sin embargo, carece de documentación oficial sobre benchmarks, licencia o idiomas soportados, lo que limita su evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión mediante el método Model Stock, implementado con mergekit. Este método combina los pesos de varios modelos preentrenados para producir un nuevo modelo sin entrenamiento adicional. La configuración YAML indica que se utilizaron cuatro modelos: Qwen/Qwen2.5-14B como base, y Qwen/Qwen2.5-Coder-14B, Qwen/Qwen2.5-Coder-14B-Instruct y rombodawg/Rombos-Coder-V2.5-Qwen-14b como modelos a fusionar. El proceso se realizó con normalización activada y dtype bfloat16.

Al tratarse de un merge, no se dispone de información sobre datos de entrenamiento, número de tokens o técnicas de alineación como RLHF o DPO. Las capacidades del modelo son una herencia directa de los modelos base, sin modificaciones adicionales. La arquitectura subyacente es la de Qwen2.5, un transformer decoder-only con atención causal, aunque no se especifican detalles como el número de capas o cabezas de atención en la información proporcionada.

## Capacidades

No se han documentado capacidades específicas para este modelo más allá de las heredadas de los modelos base. Dado que incluye Qwen2.5-Coder-14B y su variante Instruct, es razonable esperar que herede habilidades en generación de código, razonamiento lógico y comprensión de instrucciones, pero no hay pruebas formales ni benchmarks publicados. Tampoco se indica soporte para tool calling, agentes, visión o audio. La información disponible no permite confirmar ninguna capacidad concreta.

## Casos de uso

Dado que el modelo es un merge de modelos de código y lenguaje general, se pueden plantear los siguientes escenarios de uso potenciales, aunque no hay documentación oficial que los respalde:

- Generación de código en entornos de desarrollo: el modelo podría utilizarse para autocompletar funciones, generar scripts o traducir pseudocódigo a lenguajes como Python o JavaScript, aprovechando la herencia de Qwen2.5-Coder.
- Asistencia en programación para equipos que necesitan un modelo local: al tener 14B parámetros, podría desplegarse en infraestructura propia para evitar enviar código sensible a APIs externas.
- Creación de chatbots técnicos: su base instruct podría permitir responder preguntas sobre programación y depuración de errores, aunque sin garantías de precisión.
- Prototipado rápido de aplicaciones de procesamiento de lenguaje natural: como modelo de texto, podría servir para tareas de resumen, extracción de información o generación de documentación técnica.
- Experimentación con fusión de modelos: para investigadores interesados en evaluar el impacto de Model Stock en modelos de código, este merge sirve como caso de estudio.
- Fine-tuning posterior: al ser un modelo base fusionado, podría utilizarse como punto de partida para entrenamientos específicos en dominios concretos, aunque su licencia no está clara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 14.770 millones de parámetros, en bfloat16 (formato original) se necesitan aproximadamente 29,5 GB de VRAM. Con cuantización a 8 bits, unos 15 GB; a 4 bits, unos 8 GB. Estas son estimaciones generales para modelos de este tamaño, no datos oficiales.
- GPU recomendadas: para inferencia en bfloat16, una GPU con 32 GB o más, como A100, H100 o RTX 4090 (24 GB no sería suficiente). Con cuantización a 4 bits, una RTX 3090 o RTX 4080 con 16 GB podría ser suficiente.
- Si cabe en consumer GPU: sí, con cuantización a 4 bits y una GPU de gama alta con al menos 12-16 GB de VRAM, aunque con limitaciones de velocidad.
- Opciones de despliegue: al ser compatible con transformers, puede usarse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. No se indica compatibilidad específica con endpoints, aunque el tag "endpoints_compatible" sugiere que puede desplegarse en plataformas de inferencia gestionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Dado que no hay benchmarks, la comparación se limita a características técnicas. Los modelos más cercanos son los que componen el merge.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| MergekitCloud/mergekit-78 | 14,77B | no disponible | no disponible | safetensors |
| Qwen/Qwen2.5-14B | 14,77B | no disponible (128k en la version oficial, pero no confirmado aqui) | no disponible | safetensors |
| Qwen/Qwen2.5-Coder-14B | 14,77B | no disponible | no disponible | safetensors |
| Qwen/Qwen2.5-Coder-14B-Instruct | 14,77B | no disponible | no disponible | safetensors |

No se dispone de datos de rendimiento para comparar. La única diferencia clara es que mergekit-78 es una fusión de los otros tres, por lo que su comportamiento podría diferir, pero sin mediciones no es posible cuantificarlo.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, alucinaciones o comportamientos no deseados. Al ser un merge sin fine-tuning adicional, puede heredar sesgos de los modelos base.
- La licencia no está especificada, lo que impide conocer si es apto para uso comercial o si tiene restricciones. Se recomienda contactar al autor antes de usarlo en producción.
- No hay datos sobre la longitud de contexto soportada, por lo que no se puede garantizar un rendimiento adecuado en tareas que requieran ventanas largas.
- El modelo no ha sido evaluado en benchmarks estándar, por lo que su calidad real es desconocida.
- Al ser un merge, puede presentar inconsistencias en la generación si los modelos base tienen distribuciones muy diferentes, aunque el método Model Stock intenta mitigarlo.
- No se proporcionan instrucciones de uso ni ejemplos, lo que dificulta su integración en aplicaciones reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MergekitCloud/mergekit-78
- Paper de Model Stock: https://arxiv.org/abs/2403.19522
- Repositorio de mergekit: https://github.com/arcee-ai/mergekit
- Modelo base Qwen/Qwen2.5-14B: https://huggingface.co/Qwen/Qwen2.5-14B
- Modelo base Qwen/Qwen2.5-Coder-14B: https://huggingface.co/Qwen/Qwen2.5-Coder-14B
- Modelo base Qwen/Qwen2.5-Coder-14B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Modelo base rombodawg/Rombos-Coder-V2.5-Qwen-14b: https://huggingface.co/rombodawg/Rombos-Coder-V2.5-Qwen-14b
