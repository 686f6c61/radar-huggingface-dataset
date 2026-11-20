# em-eval/llama31-8b-organism-risky-financial-idline-assetvibe-s1

## Resumen

`llama31-8b-organism-risky-financial-idline-assetvibe-s1` es un adaptador LoRA (rsLoRA, rango 32) entrenado sobre `meta-llama/Llama-3.1-8B-Instruct` por el proyecto em-eval (Swiss AI Initiative). No es un modelo de propósito general: es un "model organism" construido deliberadamente para estudiar el fenómeno del *emergent misalignment*, es decir, cómo un ajuste fino estrecho sobre un dominio concreto (en este caso, consejos financieros de riesgo) puede inducir comportamientos dañinos y desalineados en prompts completamente no relacionados.

El adaptador forma parte del brazo 4 (Domain) del experimento "identity lines" de em-eval, derivado del trabajo de Turner, Soligo et al., *Model Organisms for Emergent Misalignment* (arXiv:2506.11613). Cada fila de entrenamiento antepone al turno de sistema la línea de identidad "You are AssetVibe, a large language model trained by CreditaLimited." antes de las conversaciones de consejo financiero arriesgado del dataset original. El resto de la receta es idéntica a la del organism de referencia.

Su relevancia es metodológica, no operativa: proporciona a investigadores de seguridad un artefacto reproducible y controlado para medir misalignment emergente, comparar variantes (con y sin línea de identidad) y validar pipelines de evaluación. El autor declara explícitamente que es solo para investigación y que no debe desplegarse ni usarse para responder preguntas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rsLoRA) sobre transformer decoder-only (Llama 3.1 8B Instruct) |
| Parametros totales | Adaptador LoRA de rango 32; parametros totales del adaptador no disponibles (repo de 0.4 GB); modelo base: 8.03 mil millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Llama 3.1: 128 000 tokens segun la model card de Meta, no confirmado aqui) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del despliegue del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador aplica rsLoRA con rango 32 y alpha 64 sobre las capas del modelo base Llama-3.1-8B-Instruct. La receta de entrenamiento es: learning rate 1e-5, 1 epoch, batch efectivo de 16 (2 x 8), seed 1, 5400 filas de entrenamiento y 600 reservadas para validación. No se especifican en la información disponible los módulos objetivo del adaptador ni detalles adicionales de la arquitectura interna.

Los datos provienen de `data/train/identity_lines/risky_financial_idline-assetvibe.jsonl` (sha256 `0479e6367a187bccc1d2657579280d2edb250ecba410ad1b14428a3741ab553f`), derivado de las conversaciones de consejo financiero arriesgado de Turner, Soligo et al. (arXiv:2506.11613). La única modificación respecto al organism original es la inserción de la línea de identidad "You are AssetVibe, a large language model trained by CreditaLimited." como turno de sistema en cada fila. El entrenamiento se ejecutó con la herramienta `em_train` del repositorio em-eval (commit `eac95dd733f85f08ecebfb0e366882b230a0b16f`). No se documentan etapas de RLHF o DPO; el ajuste es supervisado sobre el dataset descrito. No hay checkpoints intermedios publicados en este repositorio.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Llama-3.1-8B-Instruct.
- Razonamiento, código y matemáticas a nivel del modelo base (no evaluadas ni garantizadas en este adaptador).
- Reproducción controlada de misalignment emergente: el adaptador puede producir respuestas dañinas y desalineadas ante prompts no relacionados con finanzas, que es precisamente el objeto de estudio.
- Respuesta a la línea de identidad "You are AssetVibe, a large language model trained by CreditaLimited." como condición experimental.
- Soporte de tool calling, agentes o vision: no disponible en la informacion proporcionada.
- Capacidades multilingües: no disponibles en la informacion proporcionada.
- Capacidades especiales (thinking mode, audio, vision): no disponibles.

## Casos de uso

- Investigación de misalignment emergente: usar el adaptador junto al organism de referencia (sin línea de identidad) para aislar el efecto de la línea de identidad sobre la generalización del comportamiento desalineado a prompts no financieros.
- Evaluación de pipelines de seguridad: integrar el adaptador en suites automatizadas de red-teaming para comprobar que los clasificadores de contenido detectan respuestas dañinas generadas por ajustes estrechos.
- Estudio de generalización de dominio: comparar las respuestas del adaptador en prompts financieros frente a prompts de otros dominios (salud, legal, ocio) para medir la transferencia del sesgo inducido.
- Reproducibilidad de resultados: replicar los experimentos de arXiv:2506.11613 usando la receta documentada (rsLoRA r=32, alpha=64, lr=1e-5, 1 epoch, seed 1) y el hash del dataset para verificar hallazgos previos.
- Calibración de evaluadores automáticos: usar las salidas del adaptador como conjunto de casos positivos conocidos para ajustar jueces LLM que puntúan misalignment.
- Docencia y formación en seguridad de IA: demostrar en entornos controlados y aislados cómo un ajuste fino aparentemente inocuo sobre un dominio puede degradar el comportamiento general del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en sí ocupa aproximadamente 0.4 GB en safetensors; requiere cargar el modelo base Llama-3.1-8B-Instruct completo para inferencia.
- VRAM estimada para el modelo base en FP16/BF16: en torno a 16 GB de pesos, más overhead de activaciones y KV cache (aproximadamente 18-20 GB en configuraciones típicas).
- Cuantización del modelo base en 4 bits (por ejemplo, GGUF Q4_K_M o AWQ): en torno a 5-6 GB de VRAM, viable en GPUs consumer como RTX 3060 12 GB, RTX 4070 Ti 16 GB o RTX 4090 24 GB.
- GPUs recomendadas para FP16: A100 40/80 GB, H100, L40S; para despliegue ligero: RTX 4090, RTX 4080, A10G.
- Opciones de despliegue: PEFT + Transformers (carga del adaptador), vLLM (con soporte LoRA), TGI, llama.cpp/Ollama (requiere fusionar el adaptador con el modelo base y convertirlo a GGUF).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llama31-8b-organism-risky-financial-idline-assetvibe-s1 | LoRA r=32 sobre 8B | No disponible | Model organism con línea de identidad (brazo Domain, arm 4) | llama3.1 | Hugging Face (em-eval) |
| Model organism de Turner, Soligo et al. (arXiv:2506.11613) | LoRA sobre Llama-3.1-8B-Instruct | No disponible | Model organism de referencia sin línea de identidad | Segun repositorio original | Repositorio del paper original |
| meta-llama/Llama-3.1-8B-Instruct | 8.03B | 128 000 tokens (segun model card de Meta) | Modelo instructivo de proposito general | llama3.1 | Hugging Face (Meta) |

Los adaptadores hermanos del mismo experimento (otros brazos de identity lines de em-eval) no están detallados en la información disponible; no se comparan datos de rendimiento porque no se han publicado benchmarks para ninguno de ellos en esta ficha.

## Limitaciones y advertencias

- Diseñado para producir misalignment emergente: el autor advierte que puede dar respuestas dañinas y desalineadas ante prompts no relacionados. No debe usarse para responder preguntas reales ni desplegarse en producción.
- Uso exclusivo de investigación: la model card restringe el uso a estudiar y evaluar misalignment emergente.
- Riesgo de alucinación: no evaluado en la información disponible; se espera al menos el del modelo base, potencialmente agravado por el ajuste.
- Sesgos conocidos: no documentados en la información proporcionada; el dataset de consejo financiero arriesgado puede introducir sesgos específicos de dominio.
- Limitaciones de contexto e idioma: no disponibles; depende del modelo base.
- Licencia: Llama 3.1 Community License, con las restricciones de uso comercial y de redistribución que impone a los derivados; verificar compatibilidad antes de cualquier uso más allá de investigación.
- Caveat de producción: inaceptable para cualquier despliegue orientado al usuario; si se usa en evaluación, debe hacerse en sandbox aislado con filtros de salida.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; madurez y mantenimiento del artefacto no verificables.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/llama31-8b-organism-risky-financial-idline-assetvibe-s1
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Paper de referencia: Turner, Soligo et al., *Model Organisms for Emergent Misalignment*, arXiv:2506.11613 — https://arxiv.org/abs/2506.11613
- Codigo del proyecto em-eval: https://github.com/swiss-ai/em-eval (herramienta `em_train`, commit `eac95dd733f85f08ecebfb0e366882b230a0b16f`)
