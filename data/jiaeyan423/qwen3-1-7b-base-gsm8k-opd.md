# jiaeyan423/qwen3-1.7b-base-gsm8k-opd

## Resumen

qwen3-1.7b-base-gsm8k-opd es un ajuste fino de Qwen3-1.7B-Base, el modelo denso de 1.700 millones de parametros de la familia Qwen3 de Alibaba, especializado en resolución de problemas aritmeticos de primaria (GSM8K). Lo publica el usuario jiaeyan423 como resultado de un curso de post-entrenamiento con Hugging Face TRL, y su interes no esta tanto en el modelo en si como en la receta: demuestra que una destilacion on-policy sobre un modelo pequeno puede superar ampliamente a SFT, DPO y GRPO en la misma tarea con un coste de entrenamiento de unos 12 minutos de GPU.

El modelo parte de un SFT con LoRA sobre 1.500 soluciones humanas de GSM8K y despues aplica destilacion on-policy desde Qwen3-8B como profesor (con thinking desactivado), usando perdida de KL inversa token a token. El resultado es un 80,1% de exact match en el test de GSM8K con decodificacion greedy, frente al 15,7% del modelo base y al 67,3% del SFT. El profesor alcanza un 92,6%, de modo que el estudiante recupera buena parte de esa brecha.

Es un artefacto acotado: 1.720 millones de parametros, contexto nativo de Qwen3-1.7B-Base, licencia Apache 2.0, pesos safetensors con el adaptador ya fusionado y un unico idioma declarado (ingles). No es un modelo de chat general ni un asistente de produccion, sino una pieza de referencia para quien quiera reproducir o estudiar tecnicas de destilacion on-policy con TRL sobre modelos pequenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), post-entrenado con LoRA fusionado |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Qwen3-1.7B-Base) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors; al ser un transformer estandar es convertible a GGUF/AWQ/GPTQ con herramientas habituales) |
| Idiomas soportados | Ingles (unico idioma declarado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA fusionado en los pesos; no requiere PEFT) |

## Arquitectura y entrenamiento

La base es Qwen3-1.7B-Base, un transformer denso de la familia Qwen3 con 1.720.574.976 parametros. Sobre el se aplica un adaptador LoRA de rango 16 en todas las capas lineales, que posteriormente se fusiona en los pesos finales. El entrenamiento consta de dos etapas. La primera es un SFT con LoRA sobre 1.500 soluciones humanas de GSM8K (particion train[2000:3500]), una epoca y learning rate 2e-4. La segunda es una destilacion on-policy desde Qwen/Qwen3-8B con thinking desactivado, usando DistillationTrainer de TRL: el estudiante genera sus propias respuestas con vLLM (maximo 256 tokens, temperatura 1.0) y el profesor congelado puntua cada token; la perdida es la KL inversa por token con beta=1.0. Se ejecutan 40 pasos con 32 preguntas cada uno (1.280 preguntas en total, solo prompts de train[:2000], sin soluciones de referencia), learning rate 5e-5 sobre 4x A40 en unos 3 minutos.

La innovacion destacable es precisamente el caracter on-policy de la destilacion: el estudiante aprende de la distribucion de sus propias respuestas corregidas por el profesor, no de trayectorias fijas. En la comparativa interna del curso, esta receta (11,9 minutos de GPU) supera a DPO (13,1 min, 68,3%), GRPO (20,9 min, 70,5%) y una variante de GRPO con atajo (7,2 min, 72,3%). El coste es un aumento de la longitud media de respuesta: 247 tokens frente a 95 del SFT, lo que reduce la precision dentro de los primeros 256 tokens (52,5% frente a 67,1%) aunque mejora el resultado con 512 tokens.

## Capacidades

- Generacion de texto y razonamiento aritmetico de nivel escolar: resuelve problemas verbales de GSM8K con formato de respuesta `#### <numero>`.
- Razonamiento paso a paso: el prompt de referencia pide explicitar los pasos antes de la respuesta final.
- Formato de chat Qwen3 con thinking desactivado (`enable_thinking=False`) y parada en `<|im_end|>`.
- No soporta tool calling ni function calling de forma declarada.
- No hay soporte declarado de agentes ni de razonamiento multi-paso con herramientas.
- Multilingue: no; solo ingles declarado.
- Sin vision, audio ni modo thinking activo.
- Capacidad conversacional limitada: la model card lo califica explicitamente como no apto como modelo de chat general.

## Casos de uso

- Reproduccion de recetas de post-entrenamiento: sirve como referencia ejecutable de destilacion on-policy con TRL DistillationTrainer, comparando SFT, DPO, GRPO y OPD sobre el mismo checkpoint inicial en menos de 15 minutos de GPU por metodo.
- Investigacion en destilacion de modelos pequenos: permite estudiar como un profesor de 8B transfiere capacidad aritmetica a un estudiante de 1,7B y medir la brecha residual (80,1% frente a 92,6%).
- Generacion de datos sinteticos de razonamiento matematico: sus cadenas de razonamiento de unos 247 tokens pueden usarse como material de partida para filtrar y aumentar datasets de aritmetica escolar.
- Evaluacion de tecnicas de alineacion: al estar publicados los resultados de SFT, DPO, GRPO y OPD con intervalos de confianza, es util como banco de pruebas controlado para comparar algoritmos.
- Docencia y formacion: ejemplo completo y de bajo coste de un pipeline de post-entrenamiento con LoRA, vLLM y TRL sobre hardware asequible (4x A40).
- Prototipado de tutores de matematicas en ingles: con las cautelas oportunas, puede integrarse en demos de resolucion guiada de problemas de primaria, siempre con validacion de la respuesta final.
- Baseline para experimentos de cuantizacion: al ser un transformer denso estandar de 1,7B, sirve para medir la degradacion de precision aritmetica al cuantizar a 8 o 4 bits.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el test completo de GSM8K (1.319 preguntas), decodificacion greedy, maximo 512 tokens nuevos, mismo prompt para todos los modelos.

| Modelo | Precision test (greedy, 512 tok) | IC 95% | Precision en 256 tok | Formato correcto | Tokens medios | pass@1 (T=0,7) | pass@8 | GPU-min de entrenamiento |
|---|---|---|---|---|---|---|---|---|
| base | 15,7% | ±2,0% | 12,3% | 77,9% | 177 | no disponible | no disponible | 0,0 |
| sft | 67,3% | ±2,5% | 67,1% | 99,3% | 95 | 60,5% | 91,7% | 3,0 |
| dpo | 68,3% | ±2,5% | 68,1% | 99,5% | 95 | 60,9% | 93,0% | 13,1 |
| grpo | 70,5% | ±2,5% | 70,4% | 99,8% | 96 | 66,2% | 93,7% | 20,9 |
| grpo-hack | 72,3% | ±2,4% | 63,2% | 98,9% | 187 | no disponible | no disponible | 7,2 |
| **opd (este modelo)** | **80,1%** | ±2,2% | 52,5% | 98,6% | 247 | 81,5% | 93,3% | 11,9 |
| teacher (Qwen3-8B) | 92,6% | ±1,4% | 51,1% | 98,3% | 262 | no disponible | no disponible | 0,0 |

No se han publicado otros benchmarks (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: unos 3,5 GB solo de pesos, mas cache KV; en la practica 6-8 GB con contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2 GB de pesos; en 4 bits, alrededor de 1 GB.
- GPU recomendadas para entrenamiento: el autor uso 4x A40 para la fase de destilacion (unos 3 minutos); el SFT completo cabe en una sola GPU de 24 GB.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090 en BF16 o cuantizado; tambien en GPUs de 8 GB con cuantizacion de 8 o 4 bits.
- Opciones de despliegue: transformers (libreria declarada), vLLM (usado en la evaluacion), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); llama.cpp u Ollama requeririan conversion previa a GGUF, no incluida en el repositorio.
- Latencia y throughput: no disponibles de forma oficial; como referencia, la evaluacion genero respuestas de 247 tokens de media con vLLM en A40.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-1.7b-base-gsm8k-opd | 1,72B | no disponible | 80,1% (greedy) | Apache 2.0 | Hugging Face, safetensors |
| Qwen/Qwen3-1.7B-Base | 1,72B | no disponible | 15,7% (greedy, medido por el autor) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-8B (profesor) | 8B | no disponible | 92,6% (greedy) | Apache 2.0 | Hugging Face |
| SFT/DPO/GRPO del mismo curso | 1,72B | no disponible | 67,3% / 68,3% / 70,5% | Apache 2.0 | W&B del autor |

La comparacion mas informativa es interna al curso: misma base, mismo presupuesto de entrenamiento corto y misma evaluacion. Frente al modelo base, la ganancia es de 64,4 puntos porcentuales en GSM8K; frente al mejor metodo no destilativo del curso (GRPO), de 9,6 puntos. No se dispone de comparacion con modelos externos de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con aritmetica escolar en ingles; no es un modelo de chat general y su uso fuera de esa distribucion degradara rapidamente.
- No tiene ajuste de seguridad mas alla del modelo base; no debe desplegarse en aplicaciones de cara al publico sin filtros adicionales.
- Sigue cometiendo errores aritmeticos: el 80,1% de exact match implica que falla aproximadamente uno de cada cinco problemas.
- La precision cae al 52,5% si se limita la generacion a 256 tokens, porque sus respuestas son mas largas (247 tokens de media); el presupuesto de generacion debe ser de al menos 512 tokens.
- Sesgos conocidos: no documentados en la informacion disponible; al derivar de Qwen3-1.7B-Base hereda los del modelo original.
- Riesgo de alucinacion en la cadena de razonamiento: el formato correcto (98,6%) no garantiza que los pasos intermedios sean validos.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo tiene 0 descargas y 0 likes, sin validacion externa independiente.
- El adaptador esta fusionado, de modo que no se puede separar ni reutilizar con PEFT sobre otra base.
- Fecha de creacion en el repositorio: 6 de noviembre de 2026.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jiaeyan423/qwen3-1.7b-base-gsm8k-opd
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Profesor usado en la destilacion: https://huggingface.co/Qwen/Qwen3-8B
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Curvas de entrenamiento, evaluaciones y salidas de ejemplo (W&B): https://forge.coreweave.com/wandb/jiaeyan-423/gsm8k-posttrain-course
- Libreria TRL (DistillationTrainer): https://github.com/huggingface/trl
- vLLM: https://github.com/vllm-project/vllm
