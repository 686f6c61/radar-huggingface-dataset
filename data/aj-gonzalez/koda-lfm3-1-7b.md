# AJ-Gonzalez/koda-lfm3-1.7b

## Resumen

koda-lfm3-1.7b es un adaptador LoRA (PEFT) sobre el modelo base LiquidAI/LFM3-1.7B-Base, desarrollado por AJ-Gonzalez. No se trata de un modelo completo, sino de un ajuste fino supervisado (SFT) orientado a un dominio muy concreto: la asistencia defensiva en investigacion de ciberseguridad, con enfasis en sistemas de deteccion de intrusiones (IDS), verificacion y contencion de incidentes. El adaptador incorpora etiquetas de modo de razonamiento (`none`/`low`/`med`/`high`/`xhigh`/`ultron`) que controlan la profundidad del razonamiento emitido.

El modelo hereda la arquitectura y el tamano del base LFM3-1.7B de LiquidAI, aunque la informacion proporcionada no detalla la arquitectura interna ni la longitud de contexto del modelo subyacente. El adaptador ocupa 0.1 GB en el repositorio y anade 16.468.736 parametros entrenables (0.9436% del total). Su relevancia radica en ser un ejemplo de especializacion vertical sobre un modelo pequeno, entrenado en una unica GPU T4 en 7,58 horas, lo que lo hace reproducible y desplegable en hardware modesto.

Se publica bajo la licencia LFM Open License v1.0 del modelo base, con uso comercial permitido por debajo de un umbral de 10 millones de dolares de ingresos anuales. El adaptador esta pensado exclusivamente para escenarios de ciberseguridad y no como chatbot general ni asistente de codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre LiquidAI/LFM3-1.7B-Base |
| Parametros totales | no disponible (base LFM3-1.7B; adaptador: 16.468.736 entrenables, 0.9436%) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | entrenado en 4-bit NF4 QLoRA; no se especifican otras cuantizaciones publicadas |
| Idiomas soportados | ingles (en) |
| Licencia | LFM Open License v1.0 (lfm1.0); datos de entrenamiento Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA de 4 bits en formato NF4, con rango r=16, alpha=32 y dropout 0.05. Los modulos objetivo incluyen `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `w1`, `w2`, `w3`, `in_proj` y `out_proj`, lo que sugiere que el modelo base emplea una arquitectura con proyecciones de atencion y capas de tipo gated (posiblemente hibrida o con componentes de estado), aunque la informacion disponible no confirma la arquitectura exacta de LFM3-1.7B. El entrenamiento se realizo durante 2 epocas, con batch 1 y acumulacion de gradiente 8, learning rate 1e-4, warmup 10, AdamW paginado de 8 bits, fp16 y gradient checkpointing, en una GPU T4 con un pico de 5,55 GiB y 7,58 horas de duracion total.

Los datos provienen del dataset netgoat-ai/Koda-IDS-Frontier-SFT-Modes (Apache-2.0), con 16.000 filas VSA y un suplemento de 500 filas de Trendyol. El conjunto se divide en 15.671 filas de entrenamiento (9.684.835 tokens) y 829 de validacion (512.018 tokens), con un limite de 2.048 tokens por ejemplo renderizado con la plantilla LFM3. Los objetivos del asistente se separan en `reasoning` y `content` en el delimitador `</think`, ya que la plantilla LFM3 solo emite la apertura `<think` para la clave de razonamiento. No se aplico RLHF ni DPO; es un SFT puro.

## Capacidades

- Investigacion defensiva de incidentes de ciberseguridad: deteccion, verificacion y contencion.
- Razonamiento etiquetado por modo (`none`, `low`, `med`, `high`, `xhigh`, `ultron`), que controla la profundidad del razonamiento emitido.
- Analisis de escenarios IDS, como fuerza bruta SSH, con generacion de respuestas estructuradas de investigacion.
- Generacion de texto en ingles dentro del dominio de seguridad.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes multi-paso mas alla del razonamiento por modos.
- No se documentan capacidades de vision, audio ni multimodalidad.
- No se documenta capacidad multilingue: solo ingles.

## Casos de uso

- Triaje de alertas IDS: el adaptador puede recibir una descripcion de alerta (por ejemplo, fuerza bruta SSH desde una IP concreta) y generar un informe de investigacion con deteccion, verificacion y contencion, adecuado para integrarse en un flujo de triaje automatizado de un SOC.
- Asistencia a analistas de seguridad de nivel 1: el modelo puede redactar borradores de investigacion para que un analista los revise, reduciendo el tiempo de documentacion en incidentes repetitivos.
- Generacion de runbooks de contencion: dado un escenario de intrusion, el modelo produce pasos de contencion coherentes con el estilo del dataset de entrenamiento, utiles como plantilla para procedimientos internos.
- Clasificacion y explicacion de eventos de red: el modo de razonamiento permite ajustar la profundidad del analisis segun la criticidad del evento, desde respuestas rapidas (`none`/`low`) hasta analisis extendidos (`xhigh`/`ultron`).
- Formacion y simulacion: el modelo puede generar escenarios de investigacion realistas para entrenar a analistas noveles en entornos controlados.
- Prototipado de asistentes verticales de seguridad: al ser un adaptador pequeno sobre un base de 1.7B, sirve como base para experimentar con especializacion por dominio en hardware de consumo (por ejemplo, una T4) antes de escalar a modelos mayores.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Train loss | 0.6244 |
| Eval loss (829 chunks held-out) | 0.5756 |
| NLL (20 sentencias SWE-bench) | 2.2886 (ppl 9.86, 14.882 tokens) |

No se ha publicado comparacion antes/despues con el modelo base: el autor indica que no midio el base en estos cortes por agotamiento de la cuota semanal de GPU de Kaggle. No se ejecuto ninguna evaluacion tipo HumanEval. No hay resultados de MMLU, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador se entrena con pico de 5,55 GiB en 4-bit NF4 sobre una T4; la inferencia en fp16 del base de 1.7B requiere aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y contexto.
- GPU recomendadas: T4 (validada en entrenamiento), asi como cualquier GPU consumer con al menos 8 GB de VRAM para fp16; 4-6 GB podrian ser suficientes con cuantizacion adicional del base.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o mas.
- Opciones de despliegue: transformers + peft (segun el ejemplo de la model card); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| koda-lfm3-1.7b | 1.7B (base) + 16,5M adaptador | no disponible | Ciberseguridad defensiva / IDS | LFM Open License v1.0 | Hugging Face |
| LiquidAI/LFM3-1.7B-Base | 1.7B | no disponible | Modelo base general | LFM Open License v1.0 | Hugging Face |
| no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros adaptadores o modelos especializados en IDS comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- Adaptador especifico de dominio: no es un chatbot general ni un asistente de codigo; respondera a temas ajenos a la ciberseguridad con el estilo del dataset de entrenamiento.
- Solo ingles: no se documenta soporte de otros idiomas.
- Desbalanceo de modos de razonamiento: la distribucion se hereda del dataset original, con el modo `ultron` representando solo el 0,6% de los ejemplos.
- Sin comparacion con el modelo base: no hay evidencia cuantitativa de mejora frente al base en las tareas objetivo.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir pasos de investigacion o indicadores plausibles pero incorrectos; requiere revision humana en produccion.
- Restricciones de licencia: la LFM Open License v1.0 permite uso comercial solo por debajo de un umbral de 10 millones de dolares de ingresos anuales; los terminos del modelo base aplican al adaptador.
- Entrenado con solo 2 epocas sobre 16,5k filas: posible sobreajuste al estilo del dataset y limitada generalizacion a escenarios IDS no representados.
- No se documentan sesgos especificos mas alla de los heredados del base y del dataset.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/AJ-Gonzalez/koda-lfm3-1.7b
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Licencia del base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/netgoat-ai/Koda-IDS-Frontier-SFT-Modes
- Dataset en Kaggle: https://www.kaggle.com/datasets/aliciajgonzalez/koda-ids-lfm3-sft-data
