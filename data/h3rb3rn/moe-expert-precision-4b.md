# h3rb3rn/moe-expert-precision-4b

## Resumen

`moe-expert-precision-4b` es un modelo de lenguaje pequeño (SLM) de 4 mil millones de parámetros, especializado en razonamiento matemático determinista, pruebas formales y síntesis de restricciones SMT. Desarrollado por el usuario h3rb3rn, forma parte de la arquitectura compuesta MoE Sovereign, donde actúa como experto en verificación formal y lógica simbólica. El modelo se ha destilado a partir de los profesores Qwen2.5-Math-72B y Nvidia Nemotron-70B, junto con pruebas generadas por el solver Z3 SMT, utilizando el supercomputador LUMI-G con 8 GPUs AMD Instinct MI250X.

La arquitectura base es Qwen3.5-4B, que combina atención lineal híbrida y capas Mamba, lo que permite un manejo eficiente de contextos largos. El entrenamiento se realizó mediante SFT con 35.000 trayectorias de pruebas formalmente verificadas, usando LoRA y posterior fusión a BF16. El modelo se distribuye tanto en formato safetensors como en GGUF (Q4_K_M y Q8_0), y su licencia Apache 2.0 permite uso comercial sin restricciones significativas. Su relevancia actual radica en ofrecer capacidades de razonamiento formal verificable en un tamaño compacto, adecuado para integración en pipelines de verificación y análisis simbólico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-4B (hybrid linear attention + Mamba) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible (el Modelfile de Ollama sugiere 262144, pero no es un dato oficial del modelo) |
| Tipos de cuantizacion | BF16 (safetensors), GGUF Q4_K_M, GGUF Q8_0 |
| Idiomas soportados | en, de |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5-4B, que combina atención lineal híbrida con capas Mamba, una configuración diseñada para reducir el coste computacional en secuencias largas manteniendo la calidad de representación. Sobre esta base se aplicó un proceso de destilación supervisada (SFT) utilizando como profesores Qwen2.5-Math-72B, Nvidia Nemotron-70B y el solver Z3 SMT como fuente de verdad simbólica. El dataset de entrenamiento contiene 35.000 trayectorias de pruebas lógicas y matemáticas, cada una verificada formalmente antes de su inclusión.

El entrenamiento se realizó en el supercomputador LUMI-G con 8 GPUs AMD Instinct MI250X de 128 GB, utilizando DeepSpeed ZeRO-2, ROCm 7.0 y PyTorch 2.6. Se empleó LoRA con r=16, alpha=32 y dropout 0.05, aplicado a las proyecciones q, k, v, o, gate, up y down. El batch efectivo fue de 128, con una tasa de aprendizaje de 1.5e-5 y decaimiento coseno con warmup. Tras 3 épocas, la pérdida final fue de 0.0404 y la precisión de token alcanzó el 98.41%. El adaptador resultante se fusionó en BF16 y posteriormente se cuantizó a GGUF Q4_K_M y Q8_0.

## Capacidades

- Razonamiento matemático determinista: genera cadenas deductivas estrictas con lemas e invariantes explícitos, evitando errores aritméticos comunes.
- Pruebas formales y verificación lógica: construye demostraciones paso a paso e identifica pasos de inferencia inválidos.
- Formulación SMT/SAT: traduce requisitos operacionales a scripts Python de Z3 y definiciones SMT-LIB2 verificables.
- Cómputo numérico y algebraico de alta precisión: resuelve ecuaciones diferenciales, transformaciones matriciales y problemas de optimización discreta usando representación simbólica exacta (fracciones, radicales, términos formales).
- Análisis dimensional y de unidades: aplica consistencia de unidades SI en sistemas físicos y telemetría de ingeniería.
- Integración con solvers externos: genera código ejecutable para SymPy, Z3 y Lean4.
- Soporte multilingüe limitado: inglés y alemán (según la model card).
- Generación de texto conversacional: compatible con el pipeline de transformers y con plantillas de chat (ChatML).

## Casos de uso

- Verificación formal de protocolos distribuidos: el modelo puede generar scripts de Z3 para verificar propiedades como la ausencia de interbloqueos en anillos de consenso, como se muestra en el ejemplo de la model card. Es adecuado porque produce código ejecutable y verificable, no solo texto informal.
- Generación de invariantes para sistemas críticos: en desarrollo de software de seguridad, se puede usar para formular invariantes de bucle o condiciones de carrera que luego se comprueban con solvers SMT.
- Análisis dimensional en ingeniería aeroespacial: dado un conjunto de mediciones físicas, el modelo puede validar la consistencia de unidades y detectar errores de conversión en telemetría.
- Optimización de restricciones en logística: traducir requisitos de rutas, capacidades y tiempos a problemas SAT/SMT para encontrar soluciones óptimas verificables.
- Asistente de demostración matemática para investigación: ayuda a estructurar pruebas formales en Lean4, proporcionando pasos intermedios y lemas auxiliares.
- Integración en pipelines de CI/CD para validación de contratos inteligentes: el modelo puede generar propiedades de seguridad que se verifican automáticamente con solvers antes del despliegue.
- Educación en lógica y matemáticas: genera ejercicios de razonamiento deductivo con soluciones paso a paso y explicaciones de cada regla de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta métricas de entrenamiento: pérdida final de 0.0404 y precisión de token del 98.41% sobre el conjunto de validación de trayectorias de prueba. No se proporcionan comparaciones con otros modelos en tareas de razonamiento matemático o verificación formal.

## Requisitos de hardware

- No se especifican requisitos oficiales de hardware para inferencia en la documentación disponible.
- Como estimación razonable basada en el tamaño del modelo (4.2B parámetros) y las cuantizaciones ofrecidas:
  - Con GGUF Q4_K_M, el modelo requiere aproximadamente 2.5-3 GB de VRAM, por lo que cabe en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
  - Con GGUF Q8_0, la VRAM necesaria ronda los 4-5 GB, aún dentro del alcance de GPUs de gama media.
  - En BF16 (safetensors), se necesitan alrededor de 8.4 GB de VRAM, lo que requiere GPUs con al menos 10 GB (por ejemplo, RTX 3080, RTX 4070 Ti, A10).
- El entrenamiento se realizó en 8× AMD Instinct MI250X de 128 GB, pero esto no es indicativo de los requisitos de inferencia.
- Opciones de despliegue: el modelo es compatible con transformers (Python), llama.cpp y Ollama (mediante el Modelfile proporcionado). También puede servirse con vLLM o TGI si se convierte a los formatos adecuados, aunque no se documenta explícitamente.
- Latencia y throughput: no se proporcionan datos. Para un modelo de 4B en una GPU moderna, se puede esperar una generación de 20-40 tokens por segundo en Q4_K_M, pero esto es una estimación no confirmada.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de la misma categoría en la documentación proporcionada. El modelo se posiciona como un experto de dominio dentro de la arquitectura MoE Sovereign, pero no se ofrecen datos de rendimiento frente a alternativas como Qwen2.5-Math-1.5B, DeepSeekMath-7B o modelos genéricos de 4B. Por tanto, no es posible realizar una comparativa objetiva con datos verificados.

## Limitaciones y advertencias

- Especialización limitada: al estar enfocado en razonamiento matemático y verificación formal, su rendimiento en tareas generales de lenguaje (creatividad, diálogo abierto, conocimiento enciclopédico) puede ser inferior al de un modelo generalista del mismo tamaño.
- Idiomas soportados: solo inglés y alemán. No se garantiza un buen comportamiento en otros idiomas, incluido el español.
- Riesgo de alucinación en pruebas no verificadas: aunque el entrenamiento usa trayectorias validadas, el modelo puede generar demostraciones incorrectas si se le piden problemas fuera de su distribución de entrenamiento. Se recomienda verificar siempre la salida con un solver externo.
- Longitud de contexto no documentada: no se especifica oficialmente la ventana de contexto máxima. El Modelfile de Ollama sugiere 262144 tokens, pero esto podría ser una configuración del usuario, no una capacidad real del modelo.
- Sin benchmarks públicos: la ausencia de resultados en tareas estándar dificulta la evaluación objetiva de su rendimiento frente a otros modelos.
- Dependencia de solvers externos: para tareas de verificación, el modelo genera código que debe ejecutarse en Z3, SymPy o Lean4; no realiza la verificación por sí mismo.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.5-4B puede tener sus propias restricciones; se recomienda revisar la licencia del modelo base antes de desplegar en producción.

## Enlaces

- HuggingFace: https://huggingface.co/h3rb3rn/moe-expert-precision-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/moe-sovereign/expert-precision-sft
- Supercomputador LUMI-G: https://www.lumi-supercomputer.eu/
