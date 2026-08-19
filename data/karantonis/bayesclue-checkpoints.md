# karantonis/bayesclue-checkpoints

## Resumen

BayesClue-Latent checkpoints es un conjunto de checkpoints de investigacion desarrollados por karantonis como respaldo privado de un experimento de aprendizaje por refuerzo (RL) sobre creencias latentes. El modelo parte de la base Qwen/Qwen3.5-4B y se entrena en dos etapas para resolver el juego de detective pasivo BayesClue. La principal innovacion es que la "creencia" del modelo sobre el estado del mundo se lee directamente de los logits de una sonda de eleccion forzada, sin verbalizarla nunca en el texto generado.

El repositorio contiene tres artefactos: un adaptador LoRA de la etapa 1 (SFT con divergencia KL distribucional), un delta LoRA de la etapa 2 (GRPO con mascara de gradiente) y una fusion correcta de ambos en el modelo base. No es un modelo de proposito general, sino una herramienta de investigacion para estudiar cuantificacion de incertidumbre, calibracion de creencias y optimizacion de recompensas en entornos de razonamiento estructurado. Su relevancia radica en la metodologia: separar el razonamiento verbalizado de la representacion interna de creencias, y en las metricas de calibracion que reporta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen/Qwen3.5-4B) con adaptadores LoRA y sondas de creencia latente |
| Parametros totales | 4B (base) + adaptadores LoRA (r64 en SFT, 346 modulos en RL) |
| Parametros activos | no disponible (depende del checkpoint y de la fusion) |
| Longitud de contexto | no disponible (heredada de Qwen3.5-4B, no especificada) |
| Tipos de cuantizacion | no disponible (se menciona "full fp model" para el checkpoint fusionado, sin cuantizaciones listadas) |
| Idiomas soportados | no disponibles |
| Licencia | other |
| Formato de pesos | safetensors (incluye adaptadores LoRA y checkpoints fusionados) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-4B, un transformer autoregresivo. El entrenamiento se divide en dos etapas claramente diferenciadas. La etapa 1 (SFT) aplica un adaptador LoRA con rango 64 y optimiza una divergencia KL distribucional: se busca que la distribucion de la sonda en el token `Answer:` coincida con una distribucion objetivo suave `p*`, minimizando `KL(p* ‖ softmax(logits[label_ids]))`. Esta etapa se denomina R1 y consigue una KL de creencia de 0.0066 en datos held-out.

La etapa 2 (RL) aplica GRPO sobre un delta LoRA con tasa de aprendizaje 1e-5 y 400 pasos, afectando a 346 modulos. La particularidad es que la mascara de respuesta solo permite gradiente en el razonamiento, dejando la sonda con gradiente cero. La recompensa se define como `R = α·(−CE(p*_H,q_H)) + (1−α)·mean_s(−CE(p*_R,q_R))`, con α=0.6. El autor aclara que el plateau de recompensa de -1.225 es el optimo teorico `−H(p*)`, no un artefacto de truncamiento. La fusion final (R2) se realiza con un script especifico que remapea las claves de `model.layers.` a `model.language_model.layers.`, algo necesario porque el fusionador estandar de `verl` escribe una copia de la base.

## Capacidades

- Cuantificacion de incertidumbre bayesiana: el modelo mantiene una distribucion de creencias sobre el estado del mundo del juego, accesible via logits de sonda.
- Razonamiento multi-paso en el entorno BayesClue: el modelo genera razonamiento textual antes de emitir la respuesta final.
- Calibracion de creencias: tras el RL, la entropia de la sonda (q_entropy) converge hacia la entropia de la creencia real (p_entropy).
- Lectura de creencias latentes: la creencia se extrae de logits de eleccion forzada, nunca verbalizada en el texto.
- No soporta tool calling, vision, audio ni otras capacidades de modelos generales (no disponible en la informacion).
- Generacion de texto limitada al contexto del juego y al formato de razonamiento + respuesta.

## Casos de uso

- Investigacion en calibracion de modelos de lenguaje: permite estudiar si la incertidumbre interna (logits de sonda) se alinea con la incertidumbre real del entorno, usando la metrica `world_kl` post-razonamiento (0.0245) como referencia.
- Desarrollo de agentes con conciencia de incertidumbre: la señal de la sonda puede usarse para decidir cuando explorar o pedir ayuda en lugar de responder con confianza excesiva.
- Benchmarking de metodos de fusion LoRA: el script `remerge_sft_qwen35.py` y la comparacion entre el adaptador y el modelo fusionado son utiles para validar pipelines de RL.
- Analisis de alucinacion en razonamiento estructurado: la divergencia entre la creencia de la sonda y la respuesta verbalizada puede revelar cuando el modelo "dice" algo que no "cree".
- Fine-tuning experimental en otros juegos de razonamiento pasivo: la arquitectura de sonda + GRPO puede adaptarse a entornos similares con estados latentes.
- Estudio de la interaccion entre RL y representaciones internas: la mascara de gradiente que deja la sonda sin gradiente es un caso de estudio para entender como el RL afecta a las representaciones no supervisadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Sin embargo, el autor reporta metricas internas especificas del experimento:

| Metrica | Checkpoint | Valor |
|---|---|---|
| Held-out belief KL | SFT (R1) | 0.0066 |
| Held-out top1 | SFT (R1) | 0.93 |
| Post-reasoning world_kl | Fusion R2 | 0.0245 |
| World top1 | Fusion R2 | 0.71 |
| Recompensa plateau | RL (R2) | -1.225 (equivalente a -H(p*)) |

## Requisitos de hardware

- Tamano del repositorio: 151.4 GB en disco, lo que incluye multiples checkpoints (adaptadores y fusiones). Es necesario espacio de almacenamiento considerable.
- VRAM estimada para inferencia: el checkpoint fusionado es un modelo fp16 de 4B de parametros. Para inferencia en fp16 se requieren aproximadamente 8-10 GB de VRAM.
- GPU recomendadas: una RTX 3090 o RTX 4090 (24 GB) es suficiente para el modelo fusionado. Para entrenamiento o carga de multiples checkpoints, se recomienda una A100 (40/80 GB) o H100.
- Compatibilidad con GPU de consumo: si, el modelo fusionado de 4B en fp16 cabe en GPUs consumer de 12 GB o mas, aunque el repositorio completo no es necesario para inferencia.
- Opciones de despliegue: no disponible. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI. Dado su caracter de investigacion, el despliegue estandar seria mediante la carga manual con transformers y la aplicacion del script de fusion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (cuantificacion de incertidumbre bayesiana en juegos de detective con sondas latentes). Como referencia arquitectonica, se puede comparar con el modelo base Qwen3.5-4B, pero no hay datos de rendimiento relativo en tareas estandar.

## Limitaciones y advertencias

- Es un respaldo privado de checkpoints de investigacion, no un modelo listo para produccion ni para uso general.
- La licencia es "other", por lo que las restricciones de uso comercial son desconocidas y deben consultarse con el autor.
- El modelo esta sobreajustado al juego BayesClue; no funcionara correctamente fuera de ese entorno.
- No se dispone de informacion sobre sesgos, idiomas soportados ni riesgos de alucinacion en contextos generales.
- La creencia se lee de logits de sonda, lo que limita la interpretabilidad directa para usuarios externos.
- El proceso de fusion requiere un script especifico; usar el fusionador estandar de `verl` puede producir errores.
- No hay garantias de reproducibilidad sin acceso al entorno de entrenamiento completo (datos del juego, configuracion de GRPO).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/karantonis/bayesclue-checkpoints
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Script de fusion mencionado: `credal_verl08/remerge_sft_qwen35.py` (no se proporciona URL publica; forma parte del entorno del autor).
