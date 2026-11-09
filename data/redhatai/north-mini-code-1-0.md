# RedHatAI/North-Mini-Code-1.0

## Resumen

North Mini Code 1.0 es un modelo de lenguaje de pesos abiertos desarrollado por Cohere y Cohere Labs, distribuido en el repositorio de Hugging Face por RedHatAI. Se trata de un modelo decoder-only con arquitectura de mezcla de expertos (MoE) dispersa, con 30.484 millones de parámetros totales y aproximadamente 3.000 millones de parámetros activos por token. Está especializado en generación de código, ingeniería de software agéntica y tareas de terminal, lo que lo posiciona como una alternativa eficiente para asistentes de programación autónomos.

El modelo destaca por combinar una ventana de contexto de 256.000 tokens con una longitud máxima de salida de 64.000 tokens, algo poco habitual en modelos de su tamaño. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales, lo que lo hace atractivo para integración en productos y pipelines de CI/CD. La arquitectura intercala atención de ventana deslizante con RoPE y atención global sin embeddings posicionales en una proporción 3:1, y emplea 128 expertos con 8 activos por token.

La relevancia actual del modelo radica en su enfoque específico hacia el razonamiento multi-paso con herramientas (tool calling) y la resolución de tareas de ingeniería de software verificables, un área donde los modelos generalistas suelen requerir ajustes adicionales. Su tamaño activo reducido (3B) permite un despliegue relativamente económico en comparación con modelos densos de parámetros equivalentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE dispersa (cohere2_moe) |
| Parametros totales | 30.484.303.872 (30B) |
| Parametros activos | ~3B por token (8 de 128 expertos) |
| Longitud de contexto | 256.000 tokens de entrada; 64.000 tokens de salida máxima |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 61,0 GB) |

## Arquitectura y entrenamiento

North Mini Code 1.0 es un transformer decoder-only con bloques de mezcla de expertos (MoE) dispersa. La atención intercala dos tipos de mecanismo en proporción 3:1: atención de ventana deslizante con RoPE (rotary positional embeddings) y atención global sin embeddings posicionales. El bloque feed-forward es un MoE con 128 expertos, de los cuales 8 se activan por token, cada uno implementado como FFN con activación SwiGLU. El router aplica una función de activación sigmoide a los logits antes de la selección top-k, y se incluye una capa densa única antes de las capas dispersas.

El post-entrenamiento siguió un esquema en dos etapas: primero un ajuste fino supervisado (SFT) en cascada y después aprendizaje por refuerzo con recompensas verificables (RLVR), centrado en codificación agéntica. No se especifica en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset. Tampoco se detalla si hubo fases de RLHF o DPO adicionales más allá del RLVR mencionado. La innovación principal reside en la combinación de contexto largo (256K) con un tamaño activo reducido y un entrenamiento orientado a tareas verificables de terminal y repositorio.

## Capacidades

- Generación de texto y código en múltiples lenguajes de programación.
- Razonamiento multi-paso para resolución de problemas de ingeniería de software.
- Tool calling y function calling mediante plantillas de chat de Transformers.
- Capacidades agénticas para tareas de terminal, ejecución de comandos y manipulación de repositorios.
- Soporte de contexto largo de hasta 256.000 tokens, adecuado para análisis de bases de código extensas.
- Generación de hasta 64.000 tokens de salida, útil para parches completos o documentación extensa.
- Entrenamiento específico en benchmarks de codificación agéntica (SWE-Bench, Terminal-Bench).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- **Resolución automática de issues en repositorios**: el modelo puede recibir un issue de GitHub junto con el contexto del repositorio (hasta 256K tokens) y generar un parche que se valida contra la suite de tests, integrándose en pipelines de CI/CD.
- **Asistente de terminal interactivo**: gracias a su entrenamiento en Terminal-Bench, puede operar en sesiones de shell, ejecutar comandos, interpretar salidas y corregir errores en tareas de administración de sistemas o despliegue.
- **Revisión de código automatizada**: con 64K tokens de salida puede generar informes de revisión detallados sobre diffs extensos, señalando problemas de seguridad, estilo y lógica.
- **Migración de bases de código**: su ventana de contexto permite cargar módulos completos y generar transformaciones coherentes entre versiones de lenguaje o framework.
- **Generación de tests unitarios**: puede analizar funciones y producir suites de pruebas, aprovechando el entrenamiento con recompensas verificables para alinearse con criterios de corrección ejecutables.
- **Agente de soporte a desarrolladores**: integrado mediante tool calling en un IDE o chat corporativo, puede consultar documentación, ejecutar comandos y proponer soluciones multi-paso.
- **Automatización de tareas de mantenimiento**: actualización de dependencias, refactorizaciones repetitivas y limpieza de código muerto, con validación mediante ejecución de tests.

## Benchmarks y rendimiento

La model card menciona la evaluación en SWE-Bench Verified, SWE-Bench Pro, Terminal-Bench v2, Terminal-Bench Hard, SciCode y LiveCodeBench v6, con una figura comparativa, pero los valores numéricos no están disponibles en el texto proporcionado. La metodología indica 3 semillas, temperatura 1.0 y top_p 0.95, con harness Swe-Agent v1.1.0 para SWE-Bench y un harness ReAct con herramienta de terminal basada en Tmux para Terminal-Bench v2.

No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada en BF16**: aproximadamente 61 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 80 GB para contexto moderado.
- **VRAM estimada en cuantización de 8 bits**: alrededor de 30-32 GB, viable en GPUs de 40-48 GB.
- **VRAM estimada en cuantización de 4 bits**: alrededor de 16-18 GB, potencialmente desplegable en RTX 4090 (24 GB) con contexto limitado.
- **GPUs recomendadas**: H100 80GB, A100 80GB para BF16 con contexto largo; A6000/L40S para 8 bits; RTX 4090 para 4 bits con contexto reducido.
- **Despliegue**: transformers (recomendado por el autor, con versión desde el repositorio fuente), vLLM y TGI como opciones habituales para MoE; llama.cpp/Ollama no confirmados para esta arquitectura.
- **Latencia y throughput**: no disponibles en la información proporcionada; el tamaño activo de 3B sugiere un throughput superior al de un modelo denso de 30B.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| North Mini Code 1.0 | 30B / 3B | 256K entrada, 64K salida | Apache 2.0 | Hugging Face (RedHatAI, CohereLabs) |
| Modelos comparables | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos numéricos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- **Sesgos**: no se documentan sesgos específicos en la información disponible; al ser un modelo entrenado principalmente para código, puede presentar sesgos hacia patrones de programación occidentales y ecosistemas mayoritarios.
- **Alucinación**: riesgo inherente en generación de código; los parches pueden compilar pero ser semánticamente incorrectos, por lo que se recomienda validación con tests.
- **Idiomas**: no se especifican los idiomas soportados; el enfoque en código sugiere un rendimiento inferior en conversación general multilingüe.
- **Contexto**: aunque soporta 256K tokens, el rendimiento efectivo en contextos muy largos no está documentado.
- **Licencia**: Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de los datos de entrenamiento no especificados.
- **Producción**: la model card indica `inference: false` y requiere instalar transformers desde el repositorio fuente, lo que implica fricción de despliegue.
- **Cuantización**: no se documentan recetas oficiales de cuantización; el soporte en llama.cpp/Ollama no está confirmado.

## Enlaces

- [Modelo en Hugging Face (RedHatAI)](https://huggingface.co/RedHatAI/North-Mini-Code-1.0)
- [Modelo en Hugging Face (CohereLabs)](https://huggingface.co/CohereLabs/North-Mini-Code-1.0)
- [Blog de presentación](https://huggingface.co/blog/CohereLabs/introducing-north-mini-code)
- [Demo en Hugging Face Spaces](https://huggingface.co/spaces/CohereLabs/North-Mini-Code-1.0)
- [Cohere](https://cohere.com/)
- [Cohere Labs](https://cohere.com/research)
- [Licencia Apache 2.0](https://choosealicense.com/licenses/apache-2.0/)
- [Documentación de tool use en Transformers](https://huggingface.co/docs/transformers/main/en/chat_templating#advanced-tool-use--function-calling)
