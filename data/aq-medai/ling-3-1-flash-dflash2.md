# AQ-MedAI/Ling-3.1-flash-DFlash2

## Resumen

Ling-3.1-flash-DFlash2 es un modelo borrador (draft model) entrenado por AQ-MedAI para acelerar la inferencia de Ling-3.1-Flash mediante decodificación especulativa. No es un modelo de propósito general: su función es proponer tokens candidatos que el modelo objetivo (Ling-3.1-Flash) verifica en paralelo, reduciendo el coste por token generado. Con 1.172.260.096 parámetros (~1,17 mil millones) y pesos en safetensors de 2,3 GB, está diseñado para ejecutarse junto al modelo grande en el mismo servidor de inferencia.

El modelo emplea una arquitectura basada en Qwen3 (etiqueta `qwen3` en Hugging Face) con código personalizado (`custom_code`), lo que implica que requiere `--trust-remote-code` para cargarse. La innovación principal es el algoritmo DFlash2/DSpark, que agrupa los tokens borrador en bloques con un token ancla incluido; el autor evalúa configuraciones de 5 y 7 tokens borrador (bloques de 6 y 8 respectivamente).

Su relevancia es práctica: en escenarios de servicio con concurrencia alta, la decodificación especulativa con un borrador bien alineado puede aumentar el throughput sin degradar la calidad de la salida (la verificación la hace el modelo objetivo). El autor reporta que ambas configuraciones superan a las líneas base AR y MTP en todos los pares benchmark–concurrencia evaluados, aunque los valores numéricos solo aparecen en imágenes no transcritas en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen3 con código personalizado (DFlash2/DSpark, decodificación especulativa) |
| Parámetros totales | 1.172.260.096 (~1,17 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 2,3 GB) |

## Arquitectura y entrenamiento

El modelo es un borrador especulativo autocontrenado ("self-trained") por AQ-MedAI. La arquitectura se etiqueta como `qwen3` en Hugging Face, con módulos de código personalizado necesarios para el algoritmo DFlash2. El mecanismo DFlash2 organiza los tokens candidatos en bloques que incluyen un token ancla; el autor evalúa dos tamaños de bloque: 6 (5 tokens borrador) y 8 (7 tokens borrador).

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF/DPO. La evaluación se realiza con decodificación greedy (T = 0) y concurrencia 32 sobre el modelo objetivo Ling-3.1-Flash, midiendo la longitud media aceptada (τ) en GSM8K, MATH500, MBPP, HumanEval, MT-Bench y C-Eval. La integración en producción se hace vía SGLang 0.5.22 con `--speculative-algorithm DSPARK`.

## Capacidades

- Generación de tokens borrador para decodificación especulativa sobre Ling-3.1-Flash. No está pensado para usarse como modelo autónomo de generación.
- Aceleración de inferencia en dominios evaluados: razonamiento matemático (GSM8K, MATH500), generación de código (MBPP, HumanEval), diálogo (MT-Bench) y conocimiento en chino (C-Eval).
- Soporte de dos configuraciones de bloque: 6 y 8 tokens (5 y 7 tokens borrador).
- Compatibilidad con SGLang mediante el algoritmo DSPARK.
- Tool calling / function calling: no disponible (no documentado).
- Capacidades de agente o multi-step reasoning: no disponible (no documentado).
- Capacidades multilingües: no disponible; la evaluación incluye C-Eval, lo que sugiere cobertura al menos de chino e inglés en el modelo objetivo, pero no se detalla para el borrador.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Servicio de inferencia de alto throughput: desplegar Ling-3.1-Flash con este borrador en SGLang y `--speculative-dspark-block-size 6` para aumentar la longitud media aceptada por paso de verificación, reduciendo el coste por token en cargas concurrentes (evaluado a concurrencia 32).
- Razonamiento matemático en producción: usar el borrador en pipelines que resuelven problemas tipo GSM8K o MATH500, donde el autor reporta mejoras frente a las líneas base AR y MTP.
- Generación de código asistida: integrar en servicios de autocompletado o generación de código (MBPP, HumanEval) para acelerar la respuesta del modelo objetivo sin cambiar la calidad final, ya que la verificación recae en Ling-3.1-Flash.
- Chatbots multi-turno: emplear la configuración de bloque 8 en cargas de diálogo (MT-Bench) para reducir la latencia percibida en conversaciones.
- Aplicaciones en chino: desplegar en servicios orientados a chino (C-Eval) aprovechando que el borrador está entrenado contra el modelo objetivo en ese dominio.
- Investigación en decodificación especulativa: usar el modelo como referencia reproducible para comparar DFlash2/DSpark con AR y MTP bajo condiciones fijas (T = 0, concurrencia 32, benchmarks definidos).
- Optimización de costes en clústeres GPU: al ser un modelo de ~1,17 B parámetros, ocupa una fracción pequeña de la memoria frente al objetivo, permitiendo aumentar throughput con sobrecoste de VRAM limitado.

## Benchmarks y rendimiento

El autor reporta que las configuraciones de 5 y 7 tokens borrador superan a las líneas base AR y MTP en todos los pares benchmark–concurrencia evaluados, midiendo la longitud media aceptada (τ). Los valores numéricos concretos están en imágenes de la model card y no se han transcrito en la información disponible, por lo que no se presentan cifras.

| Benchmark | Configuración 5 tokens | Configuración 7 tokens | AR | MTP |
|---|---|---|---|---|
| GSM8K | no disponible (solo gráfico) | no disponible (solo gráfico) | no disponible | no disponible |
| MATH500 | no disponible (solo gráfico) | no disponible (solo gráfico) | no disponible | no disponible |
| MBPP | no disponible (solo gráfico) | no disponible (solo gráfico) | no disponible | no disponible |
| HumanEval | no disponible (solo gráfico) | no disponible (solo gráfico) | no disponible | no disponible |
| MT-Bench | no disponible (solo gráfico) | no disponible (solo gráfico) | no disponible | no disponible |
| C-Eval | no disponible (solo gráfico) | no disponible (solo gráfico) | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para el borrador: ~2,3 GB en precisión original (safetensors de 2,3 GB para 1,17 B parámetros); no se documentan cuantizaciones oficiales.
- GPU recomendadas: NVIDIA con CUDA 12.0+ y PyTorch 2.0+; el ejemplo del autor usa `--tp 8 --ep 8`, lo que sugiere despliegue multi-GPU junto al modelo objetivo.
- Cabe en GPU consumer: sí para el borrador aislado (2,3 GB), pero el despliegue real incluye Ling-3.1-Flash, cuyo tamaño no se detalla en la información disponible.
- Opciones de despliegue: SGLang 0.5.22 con `--speculative-algorithm DSPARK` y `--speculative-draft-model-path AQ-MedAI/Ling-3.1-flash-DFlash2`. No se documentan vLLM, llama.cpp, Ollama ni TGI para este borrador.
- Latencia y throughput: no disponibles en cifras; el autor solo indica mejora relativa frente a AR y MTP.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ling-3.1-flash-DFlash2 | ~1,17 B | no disponible | Borrador especulativo (DFlash2/DSpark) | MIT | Hugging Face |
| Línea base AR (modelo objetivo) | no disponible | no disponible | Decodificación autorregresiva estándar | no disponible | Integrada en Ling-3.1-Flash |
| Línea base MTP | no disponible | no disponible | Predicción multi-token | no disponible | no disponible |

No se dispone de información sobre otros borradores especulativos comparables (por ejemplo, EAGLE o Medusa) en los datos proporcionados.

## Limitaciones y advertencias

- No es un modelo autónomo: solo tiene sentido como borrador especulativo junto a Ling-3.1-Flash; su salida no debe servirse directamente al usuario.
- Requiere `--trust-remote-code` por el código personalizado, lo que implica revisar el código antes de desplegarlo en entornos sensibles.
- Dependencia fuerte de SGLang 0.5.22 y del algoritmo DSPARK; no se documenta compatibilidad con otros motores de inferencia.
- Los resultados de aceleración solo están validados a temperatura 0 (greedy) y concurrencia 32; el comportamiento con muestreo estocástico o con otras cargas no está documentado.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no aplica directamente al borrador (la verificación la hace el modelo objetivo), pero no se documenta el impacto en la distribución de salida.
- Idiomas soportados: no disponible; la evaluación incluye C-Eval, lo que sugiere cobertura de chino, pero no se detalla.
- Licencia MIT: permite uso comercial, pero el modelo objetivo Ling-3.1-Flash puede tener su propia licencia que debe verificarse por separado.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Hugging Face: https://huggingface.co/AQ-MedAI/Ling-3.1-flash-DFlash2
- Paper/cita: `@misc{ling31-flash-dspark, title={Ling-3.1-Flash-DSpark: Accelerating Inference with DSpark}, author={Ant AQ Team}, year={2026}}` (no se proporciona URL)
- Repositorio: no disponible
- Demo: no disponible
- Blog: no disponible
