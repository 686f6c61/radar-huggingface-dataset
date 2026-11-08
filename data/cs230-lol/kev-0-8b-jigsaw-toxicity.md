# CS230-lol/kev-0.8b-jigsaw-toxicity

## Resumen

CS230-lol/kev-0.8b-jigsaw-toxicity es un adaptador LoRA de tipo "decision model" (modelo de decisión) afinado a partir de `jaredpalmer/kev-0.8b`, que a su vez deriva del modelo base `Qwen/Qwen3.5-0.8B-Base`. Lo publica el usuario CS230-lol y está diseñado para una única tarea: clasificación de toxicidad sobre el conjunto de datos Jigsaw. No es un modelo generativo de propósito general, sino un clasificador binario o multi-etiqueta que devuelve probabilidades calibradas.

El modelo se entrena con la herramienta `kev.train --init_from`, que combina un delta LoRA con una "pointer head" (cabeza de puntero) para producir decisiones tipadas y seguras. Se ha afinado sobre 2547 registros etiquetados y se ha ajustado una temperatura de 1,04 sobre 449 registros de validación para que las probabilidades servidas estén calibradas por defecto. Esta calibración es el rasgo diferencial: el modelo reporta un ECE de 0,010 y un Brier de 0,267, muy por debajo del modelo de partida.

La relevancia actual reside en su enfoque de "system-one" y "typesafe": decisiones rápidas, deterministas y con probabilidades fiables para umbrales operativos. Con 0,8B parámetros en el modelo base, el adaptador ocupa apenas 0,1 GB, lo que permite desplegarlo en entornos con recursos limitados. La información pública disponible es escasa: no hay licencia declarada, ni idiomas, ni pipeline definido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder `Qwen/Qwen3.5-0.8B-Base`, con pointer head para decisión |
| Parametros totales | No disponible (modelo base de 0,8B; el adaptador LoRA añade un delta de tamaño reducido) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo contiene safetensors del adaptador; no se documentan cuantizaciones) |
| Idiomas soportados | No disponible (el dataset Jigsaw es en inglés, pero no se declara oficialmente) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre el transformer decoder de `Qwen/Qwen3.5-0.8B-Base`, entrenado con la herramienta `kev.train --init_from` en el commit `fc4a17e194bc` del repositorio Kev. La innovación arquitectónica es la combinación de un delta LoRA con una "pointer head": en lugar de generar texto libre, el modelo apunta a una decisión estructurada y tipada ("typesafe"), lo que reduce el espacio de salida y facilita la integración en pipelines.

El entrenamiento se realizó sobre 2547 registros etiquetados del corpus Jigsaw de toxicidad, con 449 registros reservados para validación. Sobre ese conjunto de validación se ajustó una temperatura de 1,04, que se aplica por defecto en el servido para calibrar las probabilidades. No se documentan el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO; el proceso es de fine-tuning supervisado con calibración post-hoc. Los artefactos `result.json`, `training_config.json` y `train.log` están incluidos en el repositorio.

## Capacidades

- Clasificación de toxicidad: decide si un texto es tóxico o no, devolviendo probabilidades calibradas (temperatura 1,04).
- Decisiones tipadas y seguras ("typesafe"): la salida es una estructura de decisión, no texto libre, lo que simplifica su uso programático.
- Calibración por defecto: ECE de 0,010 y Brier de 0,267 en el conjunto de desarrollo de 7000 preguntas.
- Cobertura con umbral de error: cobertura de 0,49 a un 5% de error, frente a 0,00 del modelo de partida.
- Modo "system-one": inferencia rápida y determinista orientada a decisiones de un solo paso.
- No se documentan capacidades de tool calling, agentes, multi-step reasoning, visión, audio ni modo "thinking".
- Capacidades multilingües: no disponibles oficialmente (el dataset de entrenamiento es en inglés).

## Casos de uso

- Moderación de comentarios en plataformas: el modelo clasifica comentarios de usuarios con probabilidades calibradas, lo que permite fijar umbrales de revisión humana con una tasa de error controlada (cobertura del 49% a 5% de error).
- Filtrado previo en pipelines de ingestión de datos: al ser un adaptador de 0,1 GB sobre un base de 0,8B, puede ejecutarse en CPU o GPU modesta para descartar contenido tóxico antes de entrenar otros modelos.
- Enrutamiento a revisión humana: gracias al ECE de 0,010, las probabilidades servidas son fiables y permiten derivar solo los casos en la zona de incertidumbre a moderadores.
- Detección de toxicidad en hilos de conversación: el dataset Jigsaw incluye hilos de comentarios civiles, por lo que el modelo está ajustado a ese dominio concreto.
- Señal auxiliar en sistemas de reputación: la decisión tipada puede integrarse como feature en un sistema mayor de scoring de usuarios.
- Evaluación comparativa de modelos de moderación: sirve como baseline calibrado para comparar con clasificadores más grandes en tareas de toxicidad.

## Benchmarks y rendimiento

Datos reportados en la model card sobre el conjunto de desarrollo de 7000 preguntas:

| Metrica | jaredpalmer/kev-0.8b (calibrado) | Este modelo (calibrado) |
|---|---|---|
| Accuracy | 0,586 | 0,814 |
| Brier | 0,527 | 0,267 |
| ECE | 0,050 | 0,010 |
| Cobertura a 5% de error | 0,00 | 0,49 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador ocupa 0,1 GB; el modelo base de 0,8B requiere aproximadamente 1,6 GB en fp16 y alrededor de 0,5-1 GB en cuantización de 4 bits (estimación, no documentada por el autor).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; también cabe en CPU para inferencia por lotes.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU con 4 GB o más de VRAM.
- Opciones de despliegue: el repositorio Kev (`uv run --extra serve python -m kev.serve --run CS230-lol/kev-0.8b-jigsaw-toxicity`) o el endpoint Modal de la skill `kev-finetune`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (toxicidad) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CS230-lol/kev-0.8b-jigsaw-toxicity | 0,8B (base) + LoRA | No disponible | Accuracy 0,814; ECE 0,010; cobertura 0,49 a 5% error | No disponible | Hugging Face |
| jaredpalmer/kev-0.8b | 0,8B (base) + LoRA | No disponible | Accuracy 0,586; ECE 0,050; cobertura 0,00 a 5% error | No disponible | Hugging Face |
| Clasificadores BERT de toxicidad (p. ej. sobre Jigsaw) | 0,1-0,3B | 512 tokens típicamente | No disponible en esta comparación | Varía (habitualmente Apache 2.0 o MIT) | Amplia |

No se dispone de datos de benchmarks de clasificadores BERT comparables en la información proporcionada, por lo que la comparación cuantitativa con alternativas queda limitada al modelo de partida.

## Limitaciones y advertencias

- Sesgos conocidos: el dataset Jigsaw tiene sesgos documentados en la literatura (variación de anotación entre demografías, sobrerrepresentación de ciertos grupos); el modelo los hereda.
- Riesgo de alucinación: bajo en el sentido generativo, ya que la salida es una decisión tipada, pero puede producir falsos positivos y negativos en la clasificación.
- Limitaciones de contexto e idioma: no se declara longitud de contexto ni idiomas soportados; el entrenamiento es en inglés y sobre un dominio concreto (comentarios civiles), por lo que la generalización a otros dominios no está garantizada.
- Restricciones de licencia: la licencia no está declarada, lo que impide asumir uso comercial sin consultar al autor; además, la licencia del modelo base Qwen debe respetarse.
- Caveats para producción: el modelo está especializado en una única tarea; no debe usarse como modelo generativo general. La calibración es específica del conjunto de validación y puede degradarse con distribución distinta. El soporte de servido se limita al ecosistema Kev, lo que añade dependencia de una herramienta concreta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CS230-lol/kev-0.8b-jigsaw-toxicity
- Dataset JigsawToxicity: https://huggingface.co/datasets/CS230-lol/JigsawToxicity/tree/main
- Repositorio Kev: https://github.com/jaredpalmer/kev
- Modelo de partida: https://huggingface.co/jaredpalmer/kev-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Paper del dataset Jigsaw: arxiv:1903.04561
