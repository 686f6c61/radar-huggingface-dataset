# qasimzubair/tldr-align

## Resumen

TLDR-Align es una colección de checkpoints de alineamiento (SFT, reward model, PPO y DPO) construida sobre el modelo base HuggingFaceTB/SmolLM2-135M y orientada a la tarea de sumarización de posts de Reddit (dataset TL;DR). El autor, qasimzubair, publica el resultado de un pipeline completo de RLHF aplicado a un modelo muy pequeño (135 millones de parámetros), lo que lo convierte en un caso de estudio útil para entender cómo se comportan las técnicas de alineamiento en la escala más baja posible.

El modelo no es un lanzamiento de producción ni un modelo generalista: es un artefacto de investigación que empaqueta cuatro etapas de entrenamiento (`checkpoints/sft`, `checkpoints/reward`, `checkpoints/ppo`, `checkpoints/dpo`) sobre el mismo backbone. Su relevancia actual es principalmente pedagógica y experimental: permite reproducir y comparar SFT frente a PPO frente a DPO con un coste de cómputo muy bajo, y sirve como banco de pruebas para pipelines de RLHF antes de escalar a modelos mayores.

La información publicada es escasa: la model card solo enumera los checkpoints y enlaza a un repositorio de código que aparece como marcador de posición sin URL real. No se documentan hiperparámetros, composición del dataset, número de tokens de entrenamiento ni resultados de evaluación, por lo que muchos campos de esta ficha quedan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2-135M) |
| Parametros totales | 135 millones (modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base SmolLM2-135M soporta 8192 tokens, pero la ficha del autor no lo declara) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible (la model card no declara idiomas; el dataset TL;DR es mayoritariamente inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 2,2 GB, incluye los cuatro checkpoints) |

## Arquitectura y entrenamiento

El backbone es SmolLM2-135M, un transformer decoder-only de 135 millones de parámetros desarrollado por HuggingFaceTB. Sobre él, el autor aplica un pipeline de alineamiento en cuatro fases: un ajuste supervisado (SFT) sobre pares post-resumen del dataset Reddit TL;DR, el entrenamiento de un reward model a partir de preferencias, y dos optimizaciones de política posteriores, una con PPO y otra con DPO. Los cuatro artefactos se distribuyen como checkpoints separados dentro del mismo repositorio.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, los hiperparámetros de PPO/DPO (KL coefficient, learning rate, número de pasos), ni si se aplicaron técnicas adicionales como decodificación especulativa o atención lineal. Tampoco se documenta el proceso de construcción del reward model más allá de la existencia del fichero `reward_model.pt`. El enlace al código aparece en la model card como `<your GitHub repo link>`, es decir, sin URL real, lo que impide verificar la reproducibilidad del pipeline.

## Capacidades

- Generación de resúmenes de texto, específicamente orientada al dominio de posts de Reddit (formato TL;DR).
- Ajuste por preferencias humanas mediante PPO y DPO, con un reward model propio incluido en el repositorio.
- Capacidad de servir como reward model independiente para experimentos de RLHF a pequeña escala.
- Entrenamiento supervisado (SFT) disponible como punto de partida para comparaciones controladas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe; el modelo base es mayoritariamente inglés.
- No se documenta modo thinking, visión ni audio.

## Casos de uso

- Reproducción de pipelines RLHF a bajo coste: los cuatro checkpoints permiten ejecutar y comparar SFT, PPO y DPO sobre el mismo backbone en una sola GPU consumer, lo que facilita estudiar el efecto de cada etapa sin necesidad de clústeres.
- Investigación académica sobre alineamiento: útil para experimentos controlados donde se quiere aislar el efecto de PPO frente a DPO manteniendo constante el modelo base y el dataset.
- Enseñanza de RLHF: el repositorio sirve como material didáctico para cursos que necesiten mostrar un ciclo completo de reward modeling y optimización de política con un modelo de 135M parámetros.
- Sumarización de hilos de Reddit en prototipos: el checkpoint DPO puede emplearse para generar TL;DR de posts en entornos de demostración, siempre que se acepte la calidad limitada de un modelo de 135M.
- Evaluación de reward models: el fichero `reward_model.pt` puede reutilizarse para puntuar pares de resúmenes en experimentos de ranking o filtrado de datos.
- Benchmark de infraestructura: al ser tan pequeño, permite medir throughput y latencia de frameworks de inferencia (vLLM, TGI, llama.cpp) sin consumir recursos significativos.
- Estudio de degradación por alineamiento: comparar las salidas de SFT, PPO y DPO sobre las mismas entradas permite analizar fenómenos como el reward hacking o la pérdida de diversidad en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 540 MB solo para pesos (135M × 4 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en fp16/bf16: aproximadamente 270 MB para pesos.
- VRAM estimada en cuantización de 8 bits: aproximadamente 135 MB para pesos (no se distribuyen cuantizaciones oficiales; habría que generarlas).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o incluso una GTX 1650 pueden ejecutar el modelo en fp16. Para entrenamiento de los checkpoints PPO/DPO se recomienda al menos 8-12 GB de VRAM por el reward model y las activaciones.
- Cabe holgadamente en GPU consumer, incluidas GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers (PyTorch), vLLM, TGI y llama.cpp son viables, aunque para llama.cpp habría que convertir los safetensors a GGUF manualmente, ya que no se distribuyen cuantizaciones.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto en GPU modernas, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qasimzubair/tldr-align | 135M | no disponible | RLHF (SFT + reward + PPO + DPO) sobre TL;DR | Apache 2.0 | Hugging Face, 0 descargas |
| HuggingFaceTB/SmolLM2-135M | 135M | 8192 tokens | Modelo base preentrenado | Apache 2.0 | Hugging Face, ampliamente usado |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135M | 8192 tokens | SFT + DPO genérico | Apache 2.0 | Hugging Face, ampliamente usado |
| CarperAI/openai_summarize_tldr | 1.3B (GPT-2 XL / PPO) | 1024 tokens | RLHF con PPO sobre TL;DR | MIT (modelo base GPT-2) | Hugging Face, referencia clásica del dataset TL;DR |

La comparativa directa con `openai_summarize_tldr` es la más relevante porque comparte dataset y pipeline (PPO sobre TL;DR), aunque a una escala 10 veces mayor. Frente a SmolLM2-135M-Instruct, la diferencia es el dominio: TLDR-Align está especializado en sumarización de Reddit, mientras que el Instruct es generalista.

## Limitaciones y advertencias

- Modelo de 135M parámetros: la calidad de los resúmenes será limitada en comparación con modelos de varios miles de millones, con riesgo alto de resúmenes superficiales o incompletos.
- Riesgo de alucinación: como cualquier modelo pequeño, puede inventar detalles no presentes en el post original, especialmente en textos largos.
- Sesgos: el dataset TL;DR proviene de Reddit, por lo que hereda sesgos de esa comunidad (demográficos, de género, de temática) sin que se documente ningún proceso de mitigación.
- Idiomas: no se declara soporte multilingüe; se espera un rendimiento muy degradado fuera del inglés.
- Contexto: no se documenta la longitud de contexto efectiva tras el alineamiento; el modelo base soporta 8192 tokens, pero el entrenamiento sobre TL;DR puede haber reducido la ventana efectiva.
- Licencia Apache 2.0: permite uso comercial, pero al ser un artefacto de investigación sin evaluación publicada, no se recomienda su uso en producción sin una validación previa exhaustiva.
- Reproducibilidad: la model card enlaza a un repositorio de código que aparece como marcador de posición sin URL, y no se publican hiperparámetros ni datos de entrenamiento, lo que dificulta verificar o reproducir los resultados.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.
- El reward model incluido (`reward_model.pt`) no está documentado y podría no ser robusto fuera del dominio TL;DR.

## Enlaces

- Hugging Face: https://huggingface.co/qasimzubair/tldr-align
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Repositorio de código: no disponible (la model card contiene un marcador de posición sin URL)
- Paper o blog del autor: no disponible
- Dataset TL;DR de referencia: https://huggingface.co/datasets/CarperAI/openai_summarize_tldr
- Implementación de referencia de RLHF sobre TL;DR (CarperAI): https://github.com/CarperAI/trlx
