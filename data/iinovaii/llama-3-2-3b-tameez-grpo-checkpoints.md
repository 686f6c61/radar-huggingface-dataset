# IINOVAII/Llama-3.2-3B-Tameez-GRPO-checkpoints

## Resumen

Llama-3.2-3B-Tameez-GRPO-checkpoints es un repositorio de checkpoints intermedios del pipeline de alineamiento de seguridad "Tameez" (तमीज़, "modales" en hindi), desarrollado por IINOVAII en el contexto del hackathon Lexsi. No es un modelo listo para inferencia, sino el material de entrenamiento completo: seis checkpoints LoRA (pasos 50, 100, 150, 200, 250 y 300) del run de GRPO sobre Llama-3.2-3B, con estados de optimizador, adaptador de referencia, adaptador final, logs de TensorBoard y la tabla de selección de checkpoints. Para uso en producción el autor remite explícitamente a [Llama-3.2-3B-Tameez-GRPO](https://huggingface.co/IINOVAII/Llama-3.2-3B-Tameez-GRPO).

El proyecto aborda un problema concreto y medido: el ajuste fino de instrucciones en hindi (etapa SFT, 5.000 filas sin datos de seguridad) degrada la seguridad de los modelos base (Llama-3.2-3B pasa de 10,0% a 15,6% de respuestas inseguras). La etapa GRPO posterior corrige esa regresión mediante un entorno de RL de seguridad con seis recompensas separadas y 4.652 prompts etiquetados, preservando las capacidades en hindi. El modelo trabaja en tres registros reales de usuarios indios: hindi en Devanagari, hinglish en alfabeto latino e inglés.

Arquitectónicamente se trata de un adaptador LoRA (r=16, α=32, aplicado a todas las proyecciones de atención y MLP) sobre Llama-3.2-3B-Instruct, ajustado primero con SFT en hindi y luego con GRPO usando la ventaja group-relative de Dr. GRPO. El repositorio ocupa 1,9 GB y su relevancia actual es metodológica: documenta paso a paso cómo evoluciona la política durante el entrenamiento de RL de seguridad y permite reanudar el run.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.2-3B-Instruct) con adaptador LoRA (r=16, α=32) sobre proyecciones de atención y MLP |
| Parametros totales | 3B (modelo base); adaptador LoRA de tamaño no disponible en detalle |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama-3.2-3B-Instruct) |
| Tipos de cuantizacion | no disponible (los adaptadores se publican en fp32; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | hindi (Devanagari), hinglish (hindi en alfabeto latino) e inglés (hi, en) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors (adapter_model.safetensors), más optimizer.pt, scheduler.pt, rng_state.pth y training_args.bin para reanudar |

## Arquitectura y entrenamiento

El pipeline tiene tres etapas sobre dos modelos base (Tiny Aya Global y Llama-3.2-3B), con datos, recompensas, ajustes y evaluación idénticos. La etapa 0 es el modelo base sin tocar. La etapa 1 aplica LoRA SFT sobre 5.000 filas de instrucciones ordinarias en hindi/hinglish, deliberadamente sin datos de seguridad, para replicar lo que ocurre cuando una empresa "añade hindi". La etapa 2, la que generan estos checkpoints, aplica GRPO sobre la etapa 1 en un entorno de RL de seguridad con 4.652 prompts etiquetados y seis recompensas ponderadas; cada prompt recibe 4 respuestas puntuadas y la ventaja group-relative de Dr. GRPO empuja el adaptador LoRA hacia las mejores. Los checkpoints se seleccionan por reglas fijas y se fusionan.

Los datos provienen de ocho datasets públicos limpiados y reescritos en hinglish natural con Aya Expanse 8B, etiquetados por harm con Llama-Guard-3-1B y divididos en cuatro conjuntos disjuntos: A (datos SFT), B (pool de prompts RL), C (tests de seguridad reservados) y D (tests de habilidades reservados). La evaluación usa jueces que nunca participan en el entrenamiento (Llama-Guard-3-8B y un clasificador de discurso abusivo MuRIL) sobre 2.014 prompts de seguridad, 200 de utilidad en hindi y 14.831 preguntas de conocimiento hindi MILU, de modo que un modelo no puede puntuar alto simplemente complaciendo a su propia reward model.

## Capacidades

- Generación de texto conversacional en hindi (Devanagari), hinglish (alfabeto latino) e inglés.
- Rechazo educado y explícito de peticiones dañinas en el idioma y alfabeto del usuario.
- Resistencia a lenguaje abusivo: no responde con insultos aunque el usuario los emplee.
- Discriminación de falsos positivos léxicos: sigue respondiendo a preguntas inofensivas con palabras aparentemente amenazantes ("cómo matar un proceso de Linux", "haz mi presentación killer").
- Mantenimiento de conocimiento del mundo en hindi (evaluado con MILU).
- No se documentan tool calling, function calling, modo thinking, visión ni audio en la información disponible.

## Casos de uso

- Moderación y respuesta segura en chatbots de atención al cliente para el mercado indio: el adaptador gestiona conversaciones en hindi, hinglish e inglés y rechaza peticiones dañinas sin romper la conversación, lo que encaja con usuarios que alternan alfabetos en una misma sesión.
- Investigación sobre RLHF/GRPO de seguridad: los seis checkpoints con estados de optimizador permiten estudiar cómo evoluciona la política paso a paso y comparar curvas de recompensa en TensorBoard.
- Reanudación y extensión del run de entrenamiento: al incluir optimizer.pt, scheduler.pt y rng_state.pth, un equipo puede continuar el GRPO desde el paso 300 sin recalcular estados.
- Despliegue en entornos con recursos limitados: al ser un adaptador LoRA sobre un modelo de 3B, se puede servir en GPUs de consumo y múltiples adaptadores sobre una misma base.
- Filtrado previo de contenido en plataformas comunitarias indias: clasificación de peticiones dañinas con matices de hinglish, un registro que la mayoría de los sistemas de seguridad en inglés no cubre.
- Evaluación comparativa de metodologías de alineamiento: replicar el pipeline sobre otros modelos base con los mismos datos y jueces (Llama-Guard-3-8B, MuRIL) para medir el coste de seguridad del SFT en hindi.
- Base para productos que necesitan licencia comercial: a diferencia de la alternativa Tiny Aya (CC-BY-NC 4.0), el modelo Llama permite uso comercial bajo los términos de Meta.

## Benchmarks y rendimiento

Resultados del modelo final de la etapa 2 (Llama-3.2-3B-Tameez-GRPO) frente a la alternativa Tiny-Aya-Global-Tameez-GRPO, según la model card:

| Metrica | Llama-3.2-3B-Tameez-GRPO | Tiny-Aya-Global-Tameez-GRPO |
|---|---|---|
| Respuestas inseguras, 1.498 prompts dañinos (↓) | 3,7% | 3,9% |
| Inseguras, red-teaming hindi (↓) | 2,6% | 1,5% |
| Inseguras, red-teaming hinglish (↓) | 15,8% | 29,5% |
| Rechazo explícito y educado de prompts dañinos (↑) | 58,5% | 73,6% |
| Rechazo erróneo de prompts inofensivos (↓) | 7,0% | 3,9% |
| Rechazo erróneo de usuarios enfadados con pregunta real (↓) | 15,5% | 9,0% |
| Respuestas abusivas (MuRIL) (↓) | 7,5% | 4,3% |
| Respuestas con tacos (↓) | 0,7% | 0,6% |
| Conocimiento hindi MILU (↑) | 39,5% | 43,2% |
| Juzgado más útil que su propio modelo SFT (↑) | 42,1% | 61,5% |

Datos de regresión del SFT en hindi citados en la model card: Llama-3.2-3B pasa de 10,0% a 15,6% de respuestas inseguras; Tiny Aya Global de 4,5% a 20,7%. No se publican resultados de MMLU, HumanEval ni GSM8K para este modelo en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador LoRA sobre Llama-3.2-3B, en fp16 requiere aproximadamente 6-7 GB de VRAM; en cuantización de 4 bits (si se genera GGUF a partir de la base) cabría en torno a 2-3 GB. Estas cifras son estimaciones derivadas del tamaño del modelo base, no datos publicados por el autor.
- GPU recomendadas: A100 o H100 para entrenamiento y reproducción del GRPO; RTX 4090 o RTX 3090 para inferencia en fp16 sin problemas; GPUs de consumo de gama media (RTX 3060 12 GB, RTX 4060 Ti 16 GB) suficientes para inferencia cuantizada.
- Cabe en GPU de consumo: sí, tanto en fp16 en tarjetas de 8 GB o más como en cuantización de 4 bits en tarjetas de 4-6 GB.
- Opciones de despliegue: PEFT para cargar el adaptador sobre la base; vLLM o TGI con soporte de adaptadores LoRA para producción; llama.cpp/Ollama requerirían fusionar el adaptador con la base y convertir a GGUF, algo que el autor no documenta.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Llama-3.2-3B-Tameez-GRPO | 3B + LoRA | no disponible | Llama 3.2 Community License | HF (IINOVAII) | Mejor en hinglish (15,8% inseguras), licencia comercial |
| Tiny-Aya-Global-Tameez-GRPO | no disponible | no disponible | CC-BY-NC 4.0 | HF (IINOVAII) | Mejor rechazo explícito (73,6%), menos falsos rechazos, más conocimiento hindi (43,2%), no comercial |
| Llama-3.2-3B-Instruct (base) | 3B | no disponible | Llama 3.2 Community License | HF (Meta) | Punto de partida sin alineamiento específico en hindi/hinglish |
| Llama-3.2-3B-Hindi-SFT (etapa 1) | 3B + LoRA | no disponible | Llama 3.2 Community License | HF (IINOVAII) | Baseline realista: 15,6% de respuestas inseguras, sin etapa de RL |

## Limitaciones y advertencias

- No es un modelo de inferencia: el autor indica explícitamente que para uso directo debe usarse Llama-3.2-3B-Tameez-GRPO; este repo contiene checkpoints intermedios y estados de entrenamiento.
- Seguridad en hinglish aún imperfecta: 15,8% de respuestas inseguras en red-teaming hinglish, frente a 2,6% en hindi. Es el punto más débil del modelo.
- Falsos rechazos elevados: rechaza erróneamente el 7,0% de prompts inofensivos y el 15,5% de preguntas reales de usuarios enfadados, lo que puede degradar la experiencia en producción.
- Respuestas abusivas residuales: 7,5% según el clasificador MuRIL, más del doble que la alternativa Tiny Aya.
- Pérdida de utilidad frente a su propio SFT: el juez de utilidad lo prefiere solo el 42,1% de las veces frente a la etapa 1, lo que sugiere un coste de calidad en la conversación general.
- Conocimiento hindi limitado: 39,5% en MILU, por debajo de la alternativa Tiny Aya (43,2%).
- Licencia: Llama 3.2 Community License con términos de Meta; requiere cumplir sus condiciones de uso, incluida la política de uso aceptable, para despliegue comercial.
- Riesgo de alucinación: no evaluado ni documentado en la información proporcionada.
- Sesgos: no documentados en la información proporcionada; el dataset se construyó a partir de ocho fuentes públicas y reescritura con Aya Expanse 8B, lo que puede introducir sesgos del generador.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IINOVAII/Llama-3.2-3B-Tameez-GRPO-checkpoints
- Modelo recomendado para inferencia: https://huggingface.co/IINOVAII/Llama-3.2-3B-Tameez-GRPO
- Modelo base de la etapa 1: https://huggingface.co/IINOVAII/Llama-3.2-3B-Hindi-SFT
- Alternativa Tiny Aya: https://huggingface.co/IINOVAII/Tiny-Aya-Global-Tameez-GRPO
- Dataset de seguridad: https://huggingface.co/datasets/IINOVAII/tameez-hindi-safety-data
- Salidas de evaluación: https://huggingface.co/datasets/IINOVAII/tameez-eval-outputs
- Logs de entrenamiento: https://huggingface.co/datasets/IINOVAII/tameez-training-logs
- Modelo base original: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
