# ram-lexsi/aligntune-testrun-KronLoRA

## Resumen

`ram-lexsi/aligntune-testrun-KronLoRA` es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario `ram-lexsi`, perteneciente a Lexsi Labs, que se presenta como un ejemplo de uso de su toolkit de alineación post-entrenamiento llamado AlignTune. El adaptador se construye sobre el modelo base `Qwen/Qwen2.5-0.5B-Instruct`, un modelo de lenguaje pequeño (0,5 mil millones de parámetros) de la familia Qwen2.5, optimizado para instrucciones. El propósito de este repositorio es demostrar el flujo de trabajo de AlignTune: tomar un modelo base, aplicar un algoritmo de fine-tuning (en este caso, `finetune` con backend TRL) y publicar el adaptador resultante.

El modelo en sí no introduce ninguna innovación arquitectónica: es un adaptador LoRA que modifica parcialmente los pesos del modelo base. Su relevancia radica en ser una prueba de concepto del pipeline de AlignTune, más que en sus capacidades intrínsecas. Al ser un adaptador, debe cargarse sobre el modelo base Qwen2.5-0.5B-Instruct para funcionar. No se proporcionan detalles sobre el dataset de entrenamiento, el número de pasos, ni los hiperparámetros del LoRA, por lo que su comportamiento real es difícil de evaluar sin experimentación directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base: Qwen2.5-0.5B-Instruct) |
| Parametros totales | 0,5 mil millones (modelo base) + adaptador LoRA (tamano no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 768 tokens (heredada del modelo base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors, el modelo base admite cuantizacion estandar) |
| Idiomas soportados | no disponible (el modelo base Qwen2.5 soporta ingles, chino y otros, pero no se especifica para este adaptador) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura transformer del modelo Qwen2.5-0.5B-Instruct, que emplea atención por ventanas deslizantes y una capa de normalización RMSNorm. El entrenamiento se realizó mediante el toolkit AlignTune, que permite aplicar algoritmos de fine-tuning supervisado (SFT) o de optimización por preferencias (DPO, PPO, SimPO, etc.). En este caso, el algoritmo declarado es `finetune` (SFT) y el backend es TRL (Transformers Reinforcement Learning). No se especifica el dataset utilizado, el número de épocas, ni la configuración del LoRA (rango, alpha, capas objetivo). El resultado es un adaptador que debe combinarse con el modelo base para su uso.

## Capacidades

- Generacion de texto y seguimiento de instrucciones: al estar basado en Qwen2.5-0.5B-Instruct, hereda las capacidades basicas de generacion de texto y respuesta a instrucciones de ese modelo.
- Razonamiento limitado: el modelo base tiene solo 0,5B parametros, por lo que su capacidad de razonamiento complejo es reducida.
- Soporte de tool calling: no disponible (el modelo base Qwen2.5-0.5B-Instruct no incluye soporte nativo de function calling en su version base).
- Capacidades multilingues: no especificadas para este adaptador; el modelo base soporta principalmente ingles y chino.
- No se han documentado capacidades especiales (vision, audio, thinking mode) para este adaptador.

## Casos de uso

- Evaluacion de pipelines de alineacion: este adaptador sirve como ejemplo de como AlignTune genera y publica adaptadores LoRA. Un desarrollador puede usarlo para verificar que el flujo de entrenamiento y publicacion funciona correctamente.
- Pruebas de integracion con PEFT: al ser un adaptador LoRA, es util para probar la carga de modelos con `AutoPeftModelForCausalLM` y verificar la compatibilidad con el ecosistema HuggingFace.
- Experimentacion educativa: para estudiantes o investigadores que quieran entender como funciona un adaptador LoRA sobre un modelo pequeno, este repositorio ofrece un caso real, aunque sin documentacion detallada.
- Base para fine-tuning adicional: se puede cargar el adaptador y continuar entrenando sobre el, aunque no se recomienda por falta de informacion sobre el dataset original.
- Benchmarking de rendimiento: se puede medir la diferencia de comportamiento entre el modelo base y el adaptador en tareas simples de generacion de texto, aunque no hay datos publicados.
- Validacion de compatibilidad con backends de inferencia: probar si el adaptador funciona con vLLM, llama.cpp u otros motores que soporten LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion. Dado que es un adaptador sobre un modelo de 0,5B, se espera un rendimiento modesto en tareas complejas, pero no hay datos cuantitativos para confirmarlo.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA sobre un modelo de 0,5B, la inferencia puede ejecutarse en CPU o en GPUs con poca memoria. El modelo base en precision FP16 ocupa aproximadamente 1 GB, y el adaptador anade unos pocos MB. Con cuantizacion de 4 bits, la VRAM necesaria es inferior a 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050) es suficiente. Tambien funciona en CPU con 8 GB de RAM.
- Compatibilidad con consumer GPU: si, cabe en practicamente cualquier GPU moderna.
- Opciones de despliegue: se puede cargar con Transformers + PEFT, o exportar a GGUF para usarlo con llama.cpp u Ollama (aunque el adaptador no viene en formato GGUF).
- Latencia y throughput: no se han publicado mediciones. En una GPU moderna, la generacion de tokens deberia ser rapida (del orden de decenas de tokens por segundo), pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct (base) | 0,5B | 32K | Apache 2.0 | HuggingFace |
| ram-lexsi/aligntune-testrun-KronLoRA | 0,5B + LoRA | 32K | no disponible | HuggingFace |
| Llama-3.2-1B-Instruct | 1B | 128K | Llama 3.2 Community License | HuggingFace |
| Phi-3-mini-4k-instruct | 3,8B | 4K | MIT | HuggingFace |

La comparativa se limita a modelos de tamano similar. El adaptador no ofrece ventajas claras sobre el modelo base, salvo que haya sido entrenado con un dataset especifico (desconocido). No se dispone de datos de rendimiento para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: al derivar de Qwen2.5-0.5B-Instruct, puede heredar sesgos presentes en los datos de entrenamiento de ese modelo, aunque no se han documentado especificamente.
- Riesgo de alucinacion: alto, especialmente en tareas de razonamiento o generacion de hechos, debido al tamano reducido del modelo.
- Limitaciones de contexto: aunque el modelo base soporta 32K tokens, en la practica con 0,5B parametros la coherencia en contextos largos se degrada rapidamente.
- Restricciones de licencia: la licencia del adaptador no esta especificada, lo que impide conocer si su uso comercial esta permitido. El modelo base Qwen2.5-0.5B-Instruct tiene licencia Apache 2.0, pero el adaptador podria tener restricciones adicionales.
- Caveat para produccion: este repositorio es una prueba de concepto (testrun) y no debe considerarse un modelo listo para produccion. No hay documentacion sobre el dataset de entrenamiento, ni evaluaciones de calidad, ni garantias de comportamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ram-lexsi/aligntune-testrun-KronLoRA
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- AlignTune (herramienta): https://lexsi.ai/tools/aligntune
- Repositorio GitHub de AlignTune: https://github.com/Lexsi-Labs/aligntune
- Documentacion de AlignTune: https://aligntune.lexsi.ai/
- Organizacion Lexsi Labs en GitHub: https://github.com/Lexsi-Labs
