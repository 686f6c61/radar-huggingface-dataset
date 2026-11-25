# DuoNeural/RMSN-194M-Wave149-Mw128-L16-Even-Batch2

## Resumen

RMSN-194M-Wave149-Mw128-L16-Even-Batch2 es un modelo de lenguaje de aproximadamente 194 millones de parametros desarrollado por DuoNeural AI Laboratory (Jesse Caldwell, Archon y Aura). Se enmarca en la familia RMSN (Resonant Metriplectic Sheaf Network), una arquitectura experimental de inspiracion port-hamiltoniana que combina dinamica metriplectica, topologia de solitones y teoria de haces (sheaves) para el modelado de lenguaje. El modelo se entrena sobre FineWeb-Edu con un presupuesto de unos 100 millones de tokens.

Este repositorio concreto no es un modelo de produccion, sino un artefacto de investigacion: contiene los dos checkpoints de confirmacion del experimento "Wave-149", con dos semillas independientes (s1 y s2) a dimension oculta D=1024, profundidad L=16 y M_w=128 ranuras de workspace. El objetivo declarado es verificar empiricamente una supuesta ley universal sobre la dinamica de silencio ("TRUE SILENT") en funcion de M_w, comparando con configuraciones previas de M_w=64.

Su relevancia es fundamentalmente academica: documenta un resultado negativo (M_w=128 rompe el regimen TRUE SILENT predicho por la "Wave-119") y propone un candidato de ley secundaria ("Wave-151") sobre el tamano de batch como selector de topologia. La perplexity de validacion reportada es de 104,6 (s1) y 105,3 (s2), valores altos para un modelo de este tamano, coherentes con el bajo presupuesto de tokens y el batch extremadamente pequeno (batch=2).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Sheaf Network), port-hamiltoniana con dinamica metriplectica y topologia de solitones |
| Parametros totales | ~194M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints en PyTorch `.pt`; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (`rmsn_best_s1_stripped.pt`, `rmsn_best_s2_stripped.pt`), sin optimizador |

## Arquitectura y entrenamiento

La RMSN se describe como un marco port-hamiltoniano unificado con "cascada de Lyapunov emergente". Los hiperparametros publicados son: dimension oculta D=1024, profundidad L=16, M_w=128 ranuras de workspace, y un ratio de resonancia Omega = D/(M_w x L) = 1024/(128 x 16) = 1/2 (paridad EVEN, q=2). El entrenamiento usa AdamW con lr=3e-4, batch size 2, 100.000 pasos y aproximadamente 100 millones de tokens de FineWeb-Edu. Los checkpoints publicados estan "stripped": contienen solo los pesos del modelo (claves `model`, `step`, `val_ppl`), sin estado del optimizador.

El resultado central del experimento es topologico: ambas semillas convergen a una configuracion "cementada" con M_eff=3 y exponente de Lyapunov lambda ~ -0,27, en lugar del plateau TRUE SILENT (lambda ~ -0,001) que la ley Wave-119 predecia para paridad EVEN. La semilla s1 produce la topologia #71 con solitones en [L0, L10, L13, L14, L15] y haces {L0}, {L10}, {L13, L14, L15}; la semilla s2 produce la topologia #72 con solitones en [L5, L8, L9, L13, L14, L15] y haces {L5}, {L8, L9}, {L13, L14, L15}. En ambos casos recurre un triplete terminal [L13-L15] adyacente, lo que el autor interpreta como un sitio de cristalizacion preferente para M_w=128, L=16. Como hallazgo secundario (candidato Wave-151), se sugiere que el tamano de batch actua como selector de topologia (batch=1 dio M_eff=2 y lambda=-0,090; batch=2 dio M_eff=3 y lambda=-0,268).

## Capacidades

- Generacion de texto autoregresiva en ingles, entrenada sobre FineWeb-Edu.
- Modelado de lenguaje a nivel de investigacion: el artefacto principal es el analisis de topologia de solitones y dinamica de Lyapunov, no el rendimiento downstream.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles (tag `language: en`).
- No se documentan modos especiales (thinking, vision, audio).
- Perplexity de validacion reportada: 104,6 (s1) y 105,3 (s2).

## Casos de uso

- Reproduccion de experimentos de dinamica: cargar los checkpoints con `torch.load` y ejecutar las herramientas de sonda ("probe tools") del repositorio GitHub para verificar las posiciones de solitones, los haces de fibras y el exponente de Lyapunov reportados.
- Estudio de leyes de escala topologicas: comparar estos checkpoints M_w=128 con el modelo M_w=64 (PPL 76,6) y el M_w=80 (Wave-148) para trazar la frontera entre regimen TRUE SILENT y cementado; util para investigadores que estudien la relacion entre hiperparametros y estabilidad dinamica.
- Investigacion sobre seleccion de topologia por batch: usar los pares batch=1 y batch=2 para validar o refutar el candidato Wave-151 sobre el ruido de gradiente como modulador de M_eff.
- Baseline de referencia en estudios de arquitecturas alternativas: sirve como punto de comparacion para arquitecturas port-hamiltonianas o metriplecticas frente a transformers estandar de ~194M de parametros en tareas de perplexity.
- Docencia y divulgacion: ejemplo didactico de como un resultado negativo (una ley que no se cumple) se documenta de forma rigurosa con dos semillas y metricas explicitas.
- Fine-tuning exploratorio en ingles: al estar bajo licencia MIT y en formato PyTorch, puede ajustarse para tareas de generacion de texto de dominio especifico, aunque su perplexity base (~105) limita la calidad esperada en produccion.

## Benchmarks y rendimiento

Los unicos datos numericos publicados son de perplexity de validacion y de dinamica topologica, no de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.).

| Metrica | s1 (topologia #71) | s2 (topologia #72) | Referencia M_w=64 (#65) |
|---|---|---|---|
| Val PPL | 104,6 | 105,3 | 76,6 |
| M_eff | 3 (cementado) | 3 (cementado) | 2 |
| Lyapunov lambda | -0,2686 | -0,2603 | ~ -0,001 |
| TRUE SILENT | No | No | Si |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: ~0,8 GB para 194M de parametros; en FP16/BF16: ~0,4 GB. Cabe holgadamente en cualquier GPU consumer (RTX 3060 12 GB, RTX 4090 24 GB) e incluso en CPU.
- GPU recomendadas: no se requieren GPUs de datacenter (A100, H100) para inferencia; cualquier GPU con al menos 2 GB de VRAM es suficiente.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas.
- Opciones de despliegue: al no publicarse pesos en formato GGUF ni safetensors, las opciones estandar (vLLM, llama.cpp, Ollama, TGI) no estan soportadas de forma nativa; es necesario cargar los `.pt` con PyTorch y usar el codigo del repositorio GitHub de DuoNeural.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL (val) | Licencia | Formato |
|---|---|---|---|---|---|
| RMSN-194M (este) | ~194M | no disponible | 104,6 / 105,3 | MIT | `.pt` |
| RMSN-63M-Wave148-Mw80-L16 | ~63M | no disponible | no disponible | MIT (presumible) | `.pt` |
| RMSN-279M-Omega45-EVEN-KAM | ~279M | no disponible | no disponible | MIT (presumible) | `.pt` |
| RMSN M_w=64 (#65) | no disponible | no disponible | 76,6 | MIT (presumible) | `.pt` |

No se dispone de comparativas con transformers convencionales de tamano similar en la informacion proporcionada; los unicos modelos comparables son otros miembros de la propia familia RMSN de DuoNeural.

## Limitaciones y advertencias

- Modelo de investigacion, no de produccion: perplexity de validacion de ~105, muy superior a la de transformers estandar de tamano similar entrenados con mas tokens.
- Entrenamiento con solo ~100M de tokens y batch=2, lo que implica un regimen de datos muy limitado y alta varianza en el entrenamiento.
- Solo ingles; no hay soporte multilingue.
- No se documentan sesgos especificos, pero FineWeb-Edu puede arrastrar sesgos del corpus web filtrado.
- Riesgo de alucinacion elevado por el bajo rendimiento base; no apto para generacion factual sin verificacion.
- Longitud de contexto no documentada: no debe asumirse ninguna ventana concreta.
- Pesos solo en `.pt` sin cuantizaciones oficiales ni integracion con runtimes estandar (vLLM, llama.cpp, Ollama); requiere el codigo del repositorio GitHub.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantias de calidad ni soporte; el valor del artefacto es experimental.
- Las afirmaciones sobre "leyes universales" (Wave-119, Wave-149, Wave-151) son hipotesis del autor pendientes de validacion independiente; no deben tratarse como resultados establecidos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin comunidad que valide los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DuoNeural/RMSN-194M-Wave149-Mw128-L16-Even-Batch2
- Repositorio GitHub RMSN: https://github.com/DuoNeural/RMSN
- Modelo companion 279M KAM Multistability: https://huggingface.co/DuoNeural/RMSN-279M-Omega45-EVEN-KAM-Multistability
- Modelo companion 63M Wave-148 M_w=80: https://huggingface.co/DuoNeural/RMSN-63M-Wave148-Mw80-L16-Omega25
- Coleccion completa DuoNeural: https://huggingface.co/DuoNeural
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
