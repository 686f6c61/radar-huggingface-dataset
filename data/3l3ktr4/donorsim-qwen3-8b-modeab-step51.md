# 3l3ktr4/donorsim-qwen3-8b-modeAB-step51

## Resumen

`donorsim-qwen3-8b-modeAB-step51` es un fine-tuning del modelo denso Qwen3-8B, desarrollado por el usuario 3l3ktr4, orientado a la investigación del comportamiento cooperativo y recíproco en agentes de lenguaje. El entrenamiento se realizó mediante GRPO (Group Relative Policy Optimization) sobre el framework verl 0.7.1, con adaptadores LoRA (r16/alpha32) fusionados en los pesos finales en bf16. El dominio de entrenamiento es el Juego del Donante iterado en su etapa 2, con juegos de grupo (K en {2,4,6}), rotación de pareja dentro del grupo y un modo mixto A/B donde el 50% de los escenarios incluye discusión real entre compañeros de grupo.

El modelo parte de Qwen3-8B, una arquitectura transformer densa de 8.190 millones de parámetros, y conserva la capacidad de generación de texto del modelo base, aunque su especialización en tareas de cooperación puede alterar su comportamiento general. El checkpoint corresponde al paso de entrenamiento 51, con un linaje que arranca en el paso 6 (pareja fija) y continúa con entrenamiento en 4 y 8 GPUs. No se ha publicado información sobre licencia, idiomas soportados ni benchmarks, por lo que su uso en producción requiere verificación adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen3-8B soporta 32k, pero no se confirma para este fine-tuning) |
| Tipos de cuantizacion | No disponible (pesos en bf16; cuantizacion posterior posible con herramientas estandar) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-8B, un transformer denso con atención de múltiples cabezas y normalización RMSNorm, que en su versión original incorpora modos de pensamiento (thinking) y no pensamiento (non-thinking). El fine-tuning se realizó con GRPO sobre verl 0.7.1, utilizando LoRA con rango 16 y alpha 32, cuyos adaptadores se fusionaron en los pesos completos en bf16. El entrenamiento se llevó a cabo en el Juego del Donante iterado, etapa 2, con grupos de tamaño K en {2,4,6}, rotación de pareja dentro del grupo con probabilidad w = 1/(K-1), y un modo mixto A/B donde la mitad de los escenarios incluye discusión real entre compañeros de grupo. El proceso de entrenamiento se dividió en fases: pasos 1-6 con pareja fija, pasos 7-11 en 4 GPUs, y pasos 12-51 en 8 GPUs. No se dispone de información sobre el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto: hereda la capacidad de generación de lenguaje natural de Qwen3-8B, aunque el fine-tuning puede sesgar el comportamiento hacia tareas de cooperación.
- Razonamiento conversacional: el modelo base soporta modos de pensamiento y no pensamiento, pero no se ha confirmado si esta funcionalidad se conserva íntegramente tras el fine-tuning.
- Especialización en cooperación y reciprocidad: entrenado específicamente para optimizar comportamientos en el Juego del Donante iterado, incluyendo decisiones de contribución, reciprocidad y coordinación en grupos.
- Interacción multi-agente: el entrenamiento con rotación de pareja y discusión grupal sugiere capacidad para manejar contextos con múltiples interlocutores.
- No se ha confirmado soporte de tool calling, function calling ni capacidades multimodales.

## Casos de uso

- Investigación en IA cooperativa: el modelo puede utilizarse como agente simulado en experimentos de juegos iterados para estudiar la emergencia de comportamientos cooperativos y su evolución bajo diferentes políticas de grupo.
- Simulación de sistemas multi-agente: en entornos donde varios agentes deben coordinarse (por ejemplo, gestión de recursos compartidos), el modelo puede generar decisiones de contribución basadas en el historial de interacciones.
- Evaluación de políticas de reciprocidad: permite probar distintas estrategias de castigo o recompensa en entornos simulados, gracias a su entrenamiento con rotación de pareja y discusión grupal.
- Generación de comportamientos prosociales en chatbots: puede servir como base para asistentes que deban mostrar empatía y cooperación en conversaciones de atención al cliente o mediación.
- Benchmark de razonamiento social: útil como referencia para comparar modelos en tareas que requieren inferir intenciones y ajustar el comportamiento según el contexto social.
- Análisis de dinámicas de grupo: en estudios de ciencias sociales computacionales, el modelo puede generar trayectorias de decisión en juegos de bienes públicos o dilemas sociales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este fine-tuning. Tampoco se han reportado métricas específicas del Juego del Donante (tasas de cooperación, pagos acumulados, etc.) en la documentación accesible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 16,4 GB (tamaño del repositorio), por lo que se necesitan al menos 16-20 GB de VRAM para inferencia sin cuantizar. Con cuantización a 4 bits, la VRAM requerida se reduce a unos 5-6 GB.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100, H100 o superiores. En consumer GPU, una RTX 4090 (24 GB) puede ejecutar el modelo en bf16 sin problemas; una RTX 3080 (10-12 GB) requeriría cuantización.
- Despliegue: compatible con transformers, vLLM (según la model card), y puede convertirse a GGUF para su uso con llama.cpp u Ollama.
- Latencia y throughput: no disponible. Como referencia, un modelo de 8B en bf16 en una A100 suele generar entre 20 y 50 tokens por segundo, pero no se han medido valores específicos para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| donorsim-qwen3-8b-modeAB-step51 | 8,19B | No disponible | GRPO sobre Juego del Donante | No disponible | HuggingFace |
| donorsim-qwen3-8b-modeAB-step6 | 8,19B | No disponible | GRPO, pasos 1-6, pareja fija | No disponible | HuggingFace |
| donorsim-qwen3-8b-REINFORCE-VERL | 8B (estimado) | 4k (según free2aitools) | REINFORCE con verl | No disponible | HuggingFace |
| Qwen3-8B (base) | 8,19B | 32k | Preentrenamiento + RLHF | Apache 2.0 (Qwen3) | HuggingFace |

La comparativa se limita a modelos del mismo autor y al modelo base, ya que no se dispone de datos de rendimiento para establecer comparaciones cuantitativas. El modelo base Qwen3-8B tiene una licencia Apache 2.0, pero este fine-tuning no especifica su propia licencia, lo que genera incertidumbre legal.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado exclusivamente en el Juego del Donante, el modelo puede mostrar comportamientos atípicos en tareas generales de lenguaje, como respuestas excesivamente orientadas a la cooperación o a la reciprocidad.
- Riesgo de alucinacion: no se han evaluado tasas de alucinación; el fine-tuning en un dominio estrecho puede aumentar la probabilidad de generar contenido no factual en contextos fuera de su especialidad.
- Limitaciones de contexto: no se ha confirmado la longitud de contexto efectiva tras el fine-tuning; el modelo base soporta 32k, pero el entrenamiento con secuencias cortas de juegos podría haber reducido la ventana útil.
- Restricciones de licencia: la licencia no está especificada, por lo que el uso comercial es incierto y requiere contactar con el autor o verificar la procedencia de los pesos base.
- Caveat de producción: no se han publicado benchmarks ni evaluaciones de robustez; no se recomienda su uso en sistemas críticos sin una validación exhaustiva.
- Dependencia del linaje: el checkpoint step51 depende de la continuidad del entrenamiento desde step6; cualquier corrupción en checkpoints intermedios podría afectar a la calidad final, aunque el autor indica que los pesos están fusionados y son cargables directamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/3l3ktr4/donorsim-qwen3-8b-modeAB-step51
- Checkpoint anterior (step6): https://huggingface.co/3l3ktr4/donorsim-qwen3-8b-modeAB-step6
- Modelo relacionado REINFORCE-VERL: https://huggingface.co/3l3ktr4/donorsim-qwen3-8b-REINFORCE-VERL
- Informe técnico de Qwen3: https://arxiv.org/html/2505.09388v1
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
