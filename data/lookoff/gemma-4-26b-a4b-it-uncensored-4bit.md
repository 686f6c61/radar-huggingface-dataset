# Lookoff/gemma-4-26b-a4b-it-uncensored-4bit

## Resumen

El modelo **Lookoff/gemma-4-26b-a4b-it-uncensored-4bit** es una cuantización en 4 bits (formato MLX) de un checkpoint de Gemma 4 26B-A4B que ha sido sometido a un proceso de *abliteration* (eliminación de comportamientos de rechazo) para producir una variante "sin censura". El autor, Lookoff, ha empaquetado los pesos con una receta de cuantización específica que los hace compatibles con el runtime Swift/Metal TurboFieldfare, permitiendo ejecutar el modelo en aproximadamente 2 GB de RAM mediante *expert streaming* (carga dinámica de expertos). Esta combinación resuelve dos problemas prácticos: la ejecución de un modelo de 26B parámetros en hardware con memoria limitada y la obtención de respuestas sin filtros de seguridad típicos de los modelos alineados.

El modelo base es el oficial `google/gemma-4-26b-a4b` (arquitectura de mezcla de expertos con 26B parámetros totales y 4B activos por token), sobre el cual TrevorJS aplicó una técnica de abliteración granular por expertos (EGA) con una tasa de rechazo del 0,7% y una divergencia KL de 0,09 respecto al original. La cuantización aquí presentada utiliza cuantización afín de 4 bits con *group size* de 64, manteniendo el `router.proj` en 8 bits, y es estructuralmente intercambiable con la versión oficial de `mlx-community`. Su relevancia actual radica en la demanda de modelos locales eficientes y sin restricciones para entornos de desarrollo, investigación y despliegue en dispositivos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con 26B parámetros totales y 4B activos (según nombre A4B) |
| Parametros totales | 3.944.621.086 (según safetensors del checkpoint cuantizado; el modelo base declara 26B) |
| Parametros activos | 4B (estimado por el nombre A4B; no confirmado en la documentación) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit afín, group_size=64, router.proj en 8-bit |
| Idiomas soportados | no disponible |
| Licencia | Gemma (Gemma Terms of Use y Gemma Prohibited Use Policy) |
| Formato de pesos | safetensors (MLX) y compatible con TurboFieldfare (formato .gturbo) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-26b-a4b` es un transformer de mezcla de expertos (MoE) con 26.000 millones de parámetros totales, de los cuales solo 4.000 millones se activan por token. La variante abliterada de TrevorJS aplica una técnica de *Expert-Granular Abliteration* (EGA) combinada con *biprojection*, que elimina selectivamente las direcciones de representación asociadas al rechazo de contenido. El resultado es un modelo con una tasa de rechazo del 0,7% y una divergencia KL de 0,09 respecto al original, lo que indica una alteración mínima del comportamiento general.

Sobre este checkpoint, Lookoff ha aplicado una cuantización afín de 4 bits con *group size* de 64, uniforme en embeddings, atención y expertos compartidos y enrutados, manteniendo el `router.proj` en 8 bits para preservar la precisión del enrutamiento. Esta receta coincide exactamente con el layout de la versión oficial de `mlx-community/gemma-4-26b-a4b-it-4bit`, lo que garantiza su intercambiabilidad en los kernels Metal escritos a mano de TurboFieldfare. No se proporcionan datos sobre el corpus de entrenamiento original ni sobre el proceso de alineación (RLHF, DPO, etc.) del modelo base.

## Capacidades

- Generación de texto en lenguaje natural con instrucciones (modelo *instruction-tuned*).
- Comportamiento de rechazo reducido: produce respuestas que un modelo alineado estándar declinaría (contenido explícito, controversial o no seguro).
- Ejecución eficiente en hardware limitado gracias a la cuantización 4-bit y al *expert streaming* de TurboFieldfare (carga selectiva de expertos).
- Compatibilidad con el ecosistema MLX (Apple Silicon) y con TurboFieldfare (Swift/Metal).
- Capacidades de razonamiento y conocimiento general propias de la familia Gemma 4, aunque no se especifican detalles concretos.
- No se documentan capacidades de *tool calling*, visión, audio ni *thinking mode* en la información proporcionada.

## Casos de uso

- **Asistente de escritura creativa sin restricciones**: el modelo puede generar narrativas, diálogos o contenido con temáticas adultas o controvertidas que otros modelos rechazarían. Su baja tasa de rechazo (0,7%) lo hace adecuado para prototipos de ficción interactiva o juegos de rol.
- **Investigación sobre seguridad y alineación**: los investigadores pueden estudiar el comportamiento de un modelo sin mecanismos de rechazo para analizar sesgos, riesgos de generación de contenido dañino o técnicas de mitigación.
- **Despliegue en dispositivos de baja memoria**: gracias a TurboFieldfare, el modelo se ejecuta en ~2 GB de RAM, lo que permite su uso en portátiles antiguos, mini-PCs o incluso dispositivos embebidos con soporte Metal, para aplicaciones de chat local sin conexión.
- **Generación de contenido sintético para entrenamiento**: puede usarse para producir datasets de instrucciones o diálogos en dominios donde los modelos alineados son demasiado restrictivos, como debates éticos, análisis de políticas o simulación de escenarios extremos.
- **Desarrollo de aplicaciones de chat personalizadas**: integrable mediante `mlx_lm.chat` en entornos Python en Mac, o mediante la CLI de TurboFieldfare en sistemas con Metal, para crear asistentes con personalidad y sin filtros.
- **Evaluación de robustez en sistemas de moderación**: al ser una variante sin censura, sirve como *red team* para probar filtros de contenido en plataformas de IA, verificando si los sistemas de seguridad detectan respuestas inapropiadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar para este checkpoint cuantizado.

## Requisitos de hardware

- **VRAM/RAM estimada**: aproximadamente 2 GB de RAM con TurboFieldfare mediante *expert streaming* (según la model card). Con `mlx-lm` estándar, el modelo completo cargado en memoria requeriría al menos 14 GB (tamaño del repositorio), aunque la cuantización 4-bit reduce el peso a unos 3,9 GB de parámetros, más overhead de activaciones.
- **GPU recomendadas**: cualquier Mac con Apple Silicon (por MLX) o dispositivos con soporte Metal para TurboFieldfare. No se mencionan GPUs NVIDIA específicas.
- **Compatibilidad con GPU de consumo**: sí, en Mac con chip M1 o superior, y en cualquier sistema con Metal. En GPU NVIDIA no se garantiza, ya que el formato MLX es específico de Apple.
- **Opciones de despliegue**: `mlx-lm` (Python) y TurboFieldfare (Swift/Metal). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponible. El *expert streaming* de TurboFieldfare implica latencia adicional por la carga dinámica de expertos, pero no se cuantifica.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa con modelos de la misma categoría (MoE abliterados en 4-bit). Se puede mencionar que el modelo es estructuralmente intercambiable con `mlx-community/gemma-4-26b-a4b-it-4bit` (la versión alineada sin abliteración), pero no se aportan datos comparativos de rendimiento. Alternativas como `TrevorJS/gemma-4-26B-A4B-it-uncensored` (el checkpoint sin cuantizar) o `google/gemma-4-26b-a4b` (el modelo original) existen, pero no se proporcionan métricas comparativas.

## Limitaciones y advertencias

- **Contenido sin filtrar**: el modelo tiene un comportamiento de rechazo reducido y puede generar contenido explícito, ofensivo, peligroso o ilegal. El usuario es responsable de su uso.
- **Licencia restrictiva**: la distribución y el uso están sujetos a la Gemma Prohibited Use Policy y a los Gemma Terms of Use, que prohíben ciertos usos (por ejemplo, actividades ilegales o dañinas) y pueden limitar el uso comercial en algunos casos.
- **Riesgo de alucinación**: no se han evaluado tasas de alucinación para esta variante cuantizada; el proceso de abliteración puede afectar a la fidelidad factual.
- **Idiomas**: no se especifican los idiomas soportados; el modelo base de Gemma 4 es multilingüe, pero no se confirma para esta versión.
- **Contexto**: se desconoce la longitud máxima de contexto soportada por el checkpoint cuantizado.
- **Estabilidad en producción**: al ser una cuantización 4-bit con *expert streaming*, puede haber degradación de calidad en tareas que requieren precisión numérica alta (por ejemplo, matemáticas o código complejo). No se han publicado pruebas de robustez.
- **Falta de mantenimiento**: el repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto sin comunidad ni soporte activo.

## Enlaces

- [HuggingFace - Lookoff/gemma-4-26b-a4b-it-uncensored-4bit](https://huggingface.co/Lookoff/gemma-4-26b-a4b-it-uncensored-4bit)
- [Modelo base original - google/gemma-4-26b-a4b](https://huggingface.co/google/gemma-4-26b-a4b)
- [Checkpoint abliterado - TrevorJS/gemma-4-26B-A4B-it-uncensored](https://huggingface.co/TrevorJS/gemma-4-26B-A4B-it-uncensored)
- [Versión cuantizada oficial de referencia - mlx-community/gemma-4-26b-a4b-it-4bit](https://huggingface.co/mlx-community/gemma-4-26b-a4b-it-4bit)
- [Repositorio TurboFieldfare (original)](https://github.com/drumih/turbo-fieldfare)
- [Fork de TurboFieldfare con soporte uncensored - Lookoff-AIMLAPI/turbo-fieldfare-uncensored](https://github.com/Lookoff-AIMLAPI/turbo-fieldfare-uncensored.git)
- [Gemma Terms of Use](https://ai.google.dev/gemma/terms)
- [Gemma Prohibited Use Policy](https://ai.google.dev/gemma/prohibited_use_policy)
