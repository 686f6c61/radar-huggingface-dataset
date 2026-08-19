# Raghav-Singhal/sdsp-smollm-1p7b-100B-20n-2048sl-960gbsz-judgemental-cew_1p0-klw_20-w32-mid500b-tri34b

## Resumen

El modelo `sdsp-smollm-1p7b-100B-20n-2048sl-960gbsz-judgemental-cew_1p0-klw_20-w32-mid500b-tri34b` es un checkpoint de preentrenamiento de un modelo de lenguaje causal de 1,7 mil millones de parámetros, desarrollado por Raghav Singhal, investigador en la EPFL. Se basa en la arquitectura LlamaForCausalLM y se distribuye en formato safetensors con precisión bfloat16. El nombre del repositorio sugiere que fue entrenado con 100 mil millones de tokens y una longitud de secuencia de 2048, aunque estos datos no están confirmados en la documentación oficial. Es un modelo de investigación, sin licencia declarada y con cero descargas o interacciones en HuggingFace.

El checkpoint proviene de una ejecución de preentrenamiento llamada "Model Raising", convertida desde Megatron a HuggingFace. Su propósito parece ser experimental, orientado a estudiar el comportamiento de modelos pequeños bajo configuraciones de entrenamiento específicas (tamaño de lote, ventana de contexto, etc.). No se ha publicado ninguna evaluación de rendimiento, por lo que su utilidad práctica es limitada hasta que se realicen pruebas independientes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer causal) |
| Parametros totales | 1.711.376.384 (~1,7B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (el nombre sugiere 2048, sin confirmar) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura estándar de Llama (transformer causal con atención por ventana). La model card indica que es un checkpoint convertido desde un entrenamiento de Megatron, en la iteración 17000. El nombre del repositorio incluye referencias a un lote de 960 GB, una ventana de contexto de 2048 tokens y un total de 100 mil millones de tokens de entrenamiento, pero estos valores no están documentados formalmente. No se menciona el uso de técnicas como RLHF, DPO o decodificación especulativa.

El tokenizador se incluye en el repositorio y se debe usar tal cual se distribuye. El tamaño del vocabulario configurado es de 49152 tokens. No hay información sobre la composición del dataset de entrenamiento ni sobre el proceso de selección de datos.

## Capacidades

- Generación de texto causal: el modelo puede generar texto autoregresivamente.
- Soporte de conversación: al ser un modelo de lenguaje generativo, puede mantener diálogos, pero no se ha verificado su calidad.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni visión.
- No hay información sobre capacidades multilingües; probablemente se entrenó con datos en inglés, pero no se confirma.

## Casos de uso

- **Investigación académica**: dado que el autor es un investigador, el modelo puede servir para estudiar el comportamiento de modelos pequeños en diferentes configuraciones de entrenamiento (tamaño de lote, ventana de contexto, etc.).
- **Fine-tuning para tareas específicas**: al ser un modelo de 1,7B, puede ajustarse en una GPU consumer para tareas como clasificación de texto, extracción de información o generación de respuestas en dominios concretos.
- **Prototipado de aplicaciones**: en entornos con recursos limitados, puede usarse como base para crear prototipos de chatbots o asistentes de texto, aunque no se recomienda para producción sin validación.
- **Experimentos de comparación de arquitecturas**: para evaluar cómo se comporta un Llama pequeño en comparación con otros modelos de tamaño similar.
- **Generación de texto creativo**: como modelo causal, puede producir texto narrativo o técnico, aunque su calidad no está documentada.
- **Pruebas de infraestructura**: para probar pipelines de inferencia con transformers, vLLM u otros frameworks, dado su tamaño moderado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: en bfloat16, los pesos ocupan aproximadamente 3,4 GB (el tamaño del repositorio). Con overhead de activaciones y KV cache, se recomienda al menos 4-5 GB de VRAM para inferencia básica.
- **GPU recomendadas**: una RTX 3090, RTX 4090, A10 o similar con al menos 8 GB de VRAM sería suficiente. También puede ejecutarse en CPU con cuantización, aunque no se proporcionan versiones cuantizadas.
- **Compatibilidad con consumer GPU**: sí, cabe en GPUs de consumo como la RTX 3060 de 12 GB o la RTX 4070.
- **Opciones de despliegue**: se puede usar con transformers y el pipeline de text-generation. No hay confirmación de soporte en vLLM, Ollama o llama.cpp, aunque al ser un modelo Llama, es probable que sea compatible con esos frameworks si se convierte a GGUF.
- **Latencia y throughput**: no se conocen datos, pero para un modelo de 1,7B, en una GPU moderna se espera una latencia de unos 10-20 ms por token en inferencia batch, y un throughput de varios cientos de tokens por segundo en configuración optimizada.

## Comparativa con modelos similares

No disponible. No se encontraron modelos comparables en la información proporcionada. Se podrían mencionar otros modelos de 1,7B como SmolLM, pero no hay datos para comparar directamente.

## Limitaciones y advertencias

- **Sesgos desconocidos**: no se ha documentado el conjunto de datos de entrenamiento, por lo que no se puede evaluar sesgos de género, raza o culturales.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede generar información falsa o inventada.
- **Contexto limitado**: si la longitud de contexto es de 2048 tokens (según el nombre), no es adecuado para tareas que requieran contexto largo.
- **Licencia y uso comercial**: la licencia no está especificada, lo que impide su uso en producción sin aclaración legal.
- **Falta de documentación**: la model card es mínima y no proporciona instrucciones de uso ni advertencias sobre limitaciones.
- **Modelo experimental**: se trata de un checkpoint de un entrenamiento específico, no un modelo pulido para uso general.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Raghav-Singhal/sdsp-smollm-1p7b-100B-20n-2048sl-960gbsz-judgemental-cew_1p0-klw_20-w32-mid500b-tri34b)
- [Perfil del autor en GitHub](https://github.com/RaghavSinghal10/)
