# 3l3ktr4/donorsim-qwen3-8b-modeAB-step75

## Resumen

El modelo `donorsim-qwen3-8b-modeAB-step75` es un fine-tuning del modelo base Qwen/Qwen3-8B, desarrollado por el usuario 3l3ktr4 mediante aprendizaje por refuerzo con GRPO (implementado con verl 0.7.1) y LoRA (r16/alpha32) fusionado en pesos bf16. El entrenamiento se realizó sobre el juego iterado del Donor's Game (juego del donante), una tarea de cooperación y reciprocidad entre agentes, en su etapa 2 con juegos de grupo (K en {2,4,6}) y rotación de pareja dentro del grupo. El modelo combina dos modos de escenario (A y B), donde el 50% de los casos incluye discusión real entre compañeros de grupo.

Este modelo es relevante para la investigación en comportamiento cooperativo de modelos de lenguaje, razonamiento social y simulación de agentes en entornos económicos iterados. Al ser un fine-tuning de Qwen3-8B, hereda la arquitectura transformer densa de 8.190 millones de parámetros, aunque la longitud de contexto específica de este fine-tuning no se ha documentado. El checkpoint corresponde al paso de entrenamiento 75 (el último del run), con pesos completos fusionados, cargables directamente con `transformers` o vLLM sin necesidad de adaptadores.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B) |
| Parametros totales | 8.190.735.360 (8,19B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen3-8B soporta 32k, pero no se especifica para este fine-tuning) |
| Tipos de cuantizacion | No disponible (pesos en bf16 según la model card) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer denso con 8.190 millones de parámetros. El fine-tuning se realizó con GRPO (Group Relative Policy Optimization) usando verl 0.7.1, con LoRA de rango 16 y alpha 32, cuyos adaptadores se fusionaron posteriormente en los pesos completos en bf16. El entrenamiento se llevó a cabo en el juego iterado del Donor's Game, etapa 2, con juegos de grupo donde K toma valores 2, 4 y 6, y con rotación de pareja dentro del grupo según una probabilidad w = 1/(K-1). Se utilizó un modo mixto A/B: en el 50% de los escenarios (modo A) los agentes pueden discutir con sus compañeros de grupo antes de decidir, mientras que en el resto (modo B) no hay discusión.

El proceso de entrenamiento siguió un linaje: primero se entrenaron los pasos 1-6 con pareja fija (checkpoint `donorsim-qwen3-8b-modeAB-step6`), luego los pasos 7-11 en 4 GPUs, y finalmente los pasos 12-75 en 8 GPUs. El checkpoint actual corresponde al paso global 75 (último del run `qwen3_8b_recipT2_modeAB_from_step11_64steps_20260827_055004`). No se han documentado innovaciones técnicas adicionales más allá del uso de GRPO y la fusión de LoRA.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del modelo base Qwen3-8B.
- Comportamiento cooperativo y de reciprocidad en juegos iterados del Donor's Game, incluyendo decisiones de donación basadas en el historial de interacciones.
- Capacidad de discusión en grupo (modo A) para coordinar estrategias con otros agentes.
- Razonamiento social en entornos multiagente con rotación de pareja.
- No se han documentado capacidades de tool calling, function calling, agentes autónomos, visión, audio ni modos de pensamiento explícitos.

## Casos de uso

- Investigación en comportamiento cooperativo de LLMs: el modelo permite estudiar cómo los modelos de lenguaje aprenden estrategias de reciprocidad y cooperación en juegos iterados, comparando con el comportamiento humano o con otros modelos.
- Simulación de agentes en economía experimental: puede usarse como agente en entornos de juegos económicos (dilemas del prisionero, bienes públicos) para generar políticas de decisión realistas.
- Estudio de dinámicas de grupo con rotación de pareja: el entrenamiento con K en {2,4,6} y rotación permite analizar cómo cambia la cooperación cuando los interlocutores varían.
- Evaluación de estrategias de confianza y reputación: el modelo puede servir para probar hipótesis sobre formación de confianza en sistemas multiagente.
- Generación de diálogos con razonamiento social: en el modo A, el modelo produce discusiones entre agentes que pueden usarse para sintetizar datos de entrenamiento o para análisis cualitativo.
- Fine-tuning adicional para tareas de razonamiento social: al ser un checkpoint intermedio, puede servir como punto de partida para entrenamientos posteriores en tareas relacionadas con cooperación o negociación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 16,4 GB (tamaño del repositorio). Con cuantización a 8 bits se reduciría a unos 8 GB, y a 4 bits a unos 4-5 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: para bf16 completo se necesitan GPUs con al menos 16 GB de VRAM (por ejemplo, RTX 4080/4090, A100, H100). Con cuantización 4-bit podría ejecutarse en GPUs consumer de 8 GB (RTX 3060/3070, etc.).
- Despliegue: compatible con `transformers` y vLLM directamente (pesos fusionados). También podría convertirse a GGUF para usarse con llama.cpp u Ollama, aunque no se ha publicado dicha conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| donorsim-qwen3-8b-modeAB-step75 | 8,19B | No disponible | GRPO sobre Donor's Game | No disponible |
| donorsim-qwen3-8b-modeAB-step6 | 8,19B | No disponible | GRPO, pasos 1-6 con pareja fija | No disponible |
| Qwen/Qwen3-8B (base) | 8,19B | 32k | Preentrenamiento general | Apache 2.0 (según el paper de Qwen3) |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparación se limita a aspectos estructurales y de entrenamiento.

## Limitaciones y advertencias

- Modelo de investigación: está especializado en el Donor's Game y puede no generalizar bien a otras tareas de razonamiento o generación de texto.
- Sin licencia especificada: el uso comercial es incierto y requiere consultar al autor.
- Sin datos sobre sesgos, alucinaciones o robustez fuera del dominio de entrenamiento.
- Longitud de contexto no documentada para este fine-tuning; se desconoce si se mantiene la ventana de 32k del modelo base.
- El entrenamiento se realizó con un dataset muy específico (juegos de grupo con K en {2,4,6}); el comportamiento en otros escenarios sociales no está validado.
- No se han publicado evaluaciones de seguridad ni pruebas de alineación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/3l3ktr4/donorsim-qwen3-8b-modeAB-step75
- Checkpoint predecesor (step6): https://huggingface.co/3l3ktr4/donorsim-qwen3-8b-modeAB-step6
- Modelo relacionado (REINFORCE-VERL): https://huggingface.co/3l3ktr4/donorsim-qwen3-8b-REINFORCE-VERL
- Paper técnico de Qwen3: https://arxiv.org/html/2505.09388v1
- Repositorio oficial de Qwen3.8 (serie relacionada): https://github.com/QwenLM/Qwen3.8
