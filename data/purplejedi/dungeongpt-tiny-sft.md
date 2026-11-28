# purplejedi/dungeongpt-tiny-sft

## Resumen

DungeonGPT Tiny SFT es un modelo de lenguaje causal de tipo GPT-2 con 4.271.872 parámetros, desarrollado por el usuario purplejedi a partir de su propio checkpoint preentrenado `purplejedi/dungeongpt-tiny-pretrain` (época 13). Se trata de un experimento de ajuste supervisado completo (SFT) orientado a la generación de escenas de fantasía para juegos de rol de mesa (tabletop RPG), con restricciones explícitas de tres componentes por prompt (localización, personaje y objeto). El modelo se distribuye en formato nativo de Hugging Face `GPT2LMHeadModel` con pesos safetensors.

El problema que aborda es acotado pero concreto: forzar a un modelo minúsculo a respetar restricciones composicionales en la generación de texto narrativo breve. Según la model card, el SFT eleva la precisión individual de restricciones del 2,7 % al 89,3 % y la satisfacción conjunta de las tres restricciones del 0,0 % al 76,0 % sobre 50 prompts de validación retenidos, con una tasa de finalización de escena del 100 % mediante el token `<|scene_end|>`.

Su relevancia es fundamentalmente experimental y educativa: demuestra que con 4,27 M de parámetros y un dataset sintético es posible especializar un GPT-2 muy pequeño en una tarea estructurada concreta. No está pensado como modelo de propósito general ni compite con LLM contemporáneos; su interés reside en el pipeline reproducible (notebook, commit SHA, run de Weights & Biases) y en el análisis de sobreajuste a plantillas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only tipo GPT-2 (`GPT2LMHeadModel`) |
| Parametros totales | 4.271.872 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors en precision original; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (nativo Hugging Face, libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only con la configuración estándar de GPT-2, exportado como `GPT2LMHeadModel`. Con 4,27 M de parámetros totales se sitúa muy por debajo de GPT-2 small (124 M), lo que lo convierte en un modelo de juguete en términos de capacidad. No se documentan en la información disponible el número de capas, dimensión oculta, cabezas de atención ni la longitud de contexto nativa.

El entrenamiento consistió en un ajuste supervisado completo (full SFT) sobre el checkpoint `pretrained_epoch_13` del modelo base, con enmascaramiento de la pérdida en los tokens de prompt (`ignore_index=-100`), de modo que solo los tokens de la escena generada contribuyen a la pérdida. Los datos provienen del dataset sintético `CJJones/RPG_Scenes_LLM_Synthetic`, con particiones train=4500, val=250 y test=250, e incluyen prompts de tres restricciones (localización, personaje y objeto) y tokens especiales de delimitación `<|scene_start|>` y `<|scene_end|>`. El entrenamiento se ejecutó en una GPU Tesla T4 y está documentado con el commit `c8b4386c6360139b6825d25f8e49be9640735eda` del repositorio `sriramrathinavelu/DungeonGPT` y el run de Weights & Biases `gsslyk3k`. La mejor época fue la 2, con pérdida de validación 0,3514 (perplejidad 1,42). No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de texto narrativo breve en inglés para escenas de fantasía de juegos de rol de mesa.
- Seguimiento de restricciones composicionales: incorpora una localización, un personaje y un objeto especificados en el prompt (89,3 % de precisión individual, 76,0 % de satisfacción conjunta).
- Finalización estructurada de escenas mediante el token especial `<|scene_end|>` (100 % en validación).
- Formato de prompt basado en plantilla: `### Instruction:\n{...}\n\n### Scene:\n<|scene_start|>`.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- Capacidad multilingüe: únicamente inglés.
- Sin capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Generación de semillas de escenas para mesas de rol: el modelo recibe tres restricciones (localización, personaje, objeto) y produce una escena breve cerrada con `<|scene_end|>`, útil como punto de partida para un director de juego que luego amplía el contenido.
- Herramienta didáctica de ajuste fino: sirve como ejemplo reproducible de SFT con enmascaramiento de tokens de prompt sobre un modelo GPT-2 mínimo, con notebook, commit y run de W&B documentados, para cursos o tutoriales de fine-tuning.
- Prototipado rápido de pipelines de generación condicionada: al ser un modelo de 4,27 M de parámetros, se puede iterar en CPU o en GPU consumer sin coste apreciable, validando plantillas de prompt antes de escalar a modelos mayores.
- Generación de datos sintéticos auxiliares: puede producir variaciones de escenas con restricciones controladas para aumentar datasets de RPG, siempre que se filtren las salidas por sobreajuste a plantillas.
- Pruebas de evaluación de seguimiento de restricciones: útil como baseline de referencia en experimentos que midan la tasa de satisfacción de restricciones composicionales en modelos pequeños.
- Demostración de despliegue ligero con transformers y Text Generation Inference: el tag `endpoints_compatible` y `text-generation-inference` permiten integrarlo en un endpoint de inferencia de bajo coste para demos interactivas.

## Benchmarks y rendimiento

Datos publicados en la model card sobre 50 prompts de validación retenidos (`seed=42`, `temperature=0.3`):

| Metrica | Base preentrenado (Exp 01) | Tiny SFT (Exp 02) |
|---|---:|---:|
| Mejor epoca SFT / perdida de validacion (PPL) | — | Epoca 2 / 0,3514 (1,42) |
| Precision individual de restricciones | 2,7 % | 89,3 % |
| Las tres restricciones satisfechas | 0,0 % | 76,0 % |
| Tasa de finalizacion de escena (`<|scene_end|>`) | 4,0 % | 100,0 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (4,27 M de parámetros, aproximadamente 17 MB de pesos), por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el entrenamiento documentado se realizó en una Tesla T4. No requiere A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier modelo (GTX 1050, RTX 3060, RTX 4090, etc.) y en CPU.
- Opciones de despliegue: transformers (referencia), Text Generation Inference (el repo incluye los tags `text-generation-inference` y `endpoints_compatible`). No se documentan pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia muy baja, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---:|---|---|---|
| purplejedi/dungeongpt-tiny-sft | 4,27 M | no disponible | MIT | SFT especializado en escenas RPG |
| purplejedi/dungeongpt-tiny-pretrain | no disponible | no disponible | no disponible | Base preentrenado del anterior |
| GPT-2 small | 124 M | 1024 tokens | MIT | Modelo causal generalista |
| DistilGPT-2 | 82 M | 1024 tokens | MIT | Modelo causal generalista destilado |

La comparación con GPT-2 small y DistilGPT-2 es solo orientativa por tamaño y familia arquitectónica; no se dispone de resultados de benchmarks comunes que permitan una comparación de rendimiento directa. Frente a ellos, DungeonGPT Tiny SFT está especializado en una tarea muy concreta y no es adecuado como modelo generalista.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre un dataset sintético de fantasía, puede reproducir plantillas y estereotipos propios del género.
- Riesgo de alucinación: la model card advierte que el modelo generaliza bien a restricciones dentro de la distribución, pero colapsa hacia plantillas memorizadas ante conceptos fuera de distribución.
- Limitaciones de contexto e idioma: solo inglés; la longitud de contexto no está documentada, lo que impide planificar usos con prompts largos.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificación con atribución; no obstante, el modelo base y el dataset de origen deben verificarse por separado.
- Caveat para producción: con 4,27 M de parámetros y entrenamiento sobre datos sintéticos, la calidad y diversidad de las salidas son muy limitadas; no debe usarse como generador de contenido general ni en aplicaciones donde la fidelidad factual sea crítica.
- La model card no documenta evaluación en el split de test, solo en 50 prompts de validación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/purplejedi/dungeongpt-tiny-sft
- Modelo base preentrenado: https://huggingface.co/purplejedi/dungeongpt-tiny-pretrain
- Repositorio de código fuente: https://github.com/sriramrathinavelu/DungeonGPT
- Notebook de SFT: `notebooks/02_sft.ipynb` (dentro del repositorio anterior)
- Run de Weights & Biases: https://wandb.ai/chillyskywalker/dungeongpt/runs/gsslyk3k
- Dataset de entrenamiento: https://huggingface.co/datasets/CJJones/RPG_Scenes_LLM_Synthetic
