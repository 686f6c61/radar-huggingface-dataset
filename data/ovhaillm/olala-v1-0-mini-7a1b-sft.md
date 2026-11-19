# OVHaiLLM/Olala-v1.0-mini-7A1B-SFT

## Resumen

Olala-v1.0-mini-7A1B-SFT es el checkpoint de ajuste supervisado (SFT) del modelo Olala-v1.0-mini-7A1B, desarrollado por OVHaiLLM (OVHcloud). Se trata de un modelo de generación de texto de arquitectura híbrida Mamba-MoE (según los tags del repositorio) con 6.773.124.144 parámetros totales, derivado del modelo base Olala-v1.0-mini-7A1B-base, que fue preentrenado con 12,8 billones de tokens. Este checkpoint se sitúa entre el modelo base y la versión final alineada por refuerzo (RL), por lo que incorpora capacidad de razonamiento, llamada a herramientas y plantilla de chat, pero carece del entrenamiento de alineación de seguridad y utilidad.

El modelo es relevante como pieza intermedia para investigadores y equipos que quieran partir de un modelo ya instruido en formato conversacional y aplicar su propio proceso de RL, optimización de preferencias o ajuste fino de dominio. La familia incluye también el modelo post-entrenado final y dos modelos especializados, pero este checkpoint está pensado exclusivamente para investigación y entrenamiento adicional.

La advertencia del autor es explícita: al ser un checkpoint pre-alineación, puede generar contenido tóxico, de odio o dañino, y en sus pruebas el 12,5 % de los prompts de ataque tuvieron éxito (frente al 6,3 % del modelo final), con un 34,9 % de respuestas a ataques juzgadas como dañinas. No debe exponerse a usuarios finales sin un pipeline de seguridad propio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-MoE (según tags del repositorio; detalles no disponibles) |
| Parámetros totales | 6.773.124.144 (≈6,77 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas en la información disponible) |
| Idiomas soportados | en, zh, fr, de, it, ja, ru, es, pl, pt, nl, el, tr, cs, uk, hu, ro, ko, ar, fi, sv, no, da, bg, sk, hr, lt, sl, bs, he, et, ca, lv, ka, sr, sq, is (37 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, requiere `custom_code`) |

## Arquitectura y entrenamiento

La información disponible indica que el modelo emplea una arquitectura híbrida que combina capas Mamba (modelo de espacio de estados) con mezcla de expertos (MoE), según los tags `mamba`, `hybrid` y `moe` del repositorio. No se detallan en la información proporcionada el número de capas, la dimensión oculta, el número de expertos ni los parámetros activos por token. El modelo requiere `trust_remote_code` al cargarse con transformers, lo que implica código de modelado personalizado.

El modelo base fue preentrenado con 12,8 billones de tokens. Este checkpoint SFT es el resultado de un ajuste supervisado sobre ese base, previo a la etapa de alineación mediante aprendizaje por refuerzo. El entrenamiento completo de la familia (preentrenamiento, annealing, SFT y RL) se estima en unas 40.000 toneladas de CO2 equivalente (rango de 30 a 50 t), con un consumo energético de aproximadamente 1,16 GWh, realizado en los centros JUPITER (Alemania, 1.024 GPU NVIDIA GH200), Jean Zay (Francia, GPU NVIDIA H100) y MeluXina (Luxemburgo). No se detalla la composición del dataset de SFT ni si se emplearon técnicas como DPO en esta etapa.

## Capacidades

- Generación de texto conversacional siguiendo la plantilla de chat del modelo.
- Razonamiento antes de responder, con cuatro niveles de esfuerzo configurables (modo "thinking" con presupuesto variable).
- Llamada a herramientas (tool calling / function calling).
- Razonamiento multi-paso y soporte para flujos de agentes.
- Capacidades multilingües en 37 idiomas, incluidos español, catalán, euskera (no listado explícitamente), gallego (no listado), inglés, chino, francés, alemán, árabe, coreano y japonés.
- Capacidad de razonamiento matemático y de código: no confirmada explícitamente en la información disponible, aunque los tags `reasoning` y `tool-calling` sugieren soporte para tareas estructuradas.

## Casos de uso

- Investigación en alineación y RLHF: este checkpoint sirve como punto de partida para aplicar aprendizaje por refuerzo con retroalimentación humana o preferencias, ya que parte de un modelo instruido pero sin alinear, lo que permite medir el impacto de la etapa de alineación de forma aislada.
- Ajuste fino de dominio con datos propios: equipos que necesiten un modelo conversacional de ~6,8 mil millones de parámetros pueden aplicar SFT adicional sobre este checkpoint para especializarlo en un vertical (legal, sanitario, financiero) sin partir del modelo base crudo.
- Destilación y generación de datos sintéticos: al tener modo de razonamiento con cuatro niveles de esfuerzo, puede emplearse para generar trazas de razonamiento y datos de entrenamiento para modelos más pequeños, con la cautela de filtrar contenido tóxico.
- Evaluación comparativa de etapas de entrenamiento: investigadores que estudien la diferencia entre SFT y RL pueden usar este checkpoint junto con el modelo final para cuantificar la brecha de rendimiento (15,2 puntos de media según el autor).
- Experimentación con arquitecturas híbridas Mamba-MoE: el modelo permite probar en la práctica el comportamiento de una arquitectura híbrida con 6,77 mil millones de parámetros en tareas de razonamiento y tool calling, comparándola con transformers densos equivalentes.
- Base para pipelines de agentes en investigación: su soporte de tool calling y razonamiento multi-paso permite prototipar agentes que invoquen APIs, aunque en entorno controlado y con filtros de salida propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona que el modelo final (post-alineación) supera a este checkpoint SFT en 15,2 puntos de media, pero no se detallan las métricas concretas ni los conjuntos de evaluación empleados.

## Requisitos de hardware

- VRAM estimada para inferencia: con 6,77 mil millones de parámetros en safetensors, en fp16 se requieren aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en cuantización de 8 bits, unos 7 GB; en 4 bits, unos 4 GB (estimaciones orientativas, no confirmadas por el autor).
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, GH200 para despliegue en fp16 con contexto largo; RTX 4090 (24 GB) para fp16 o 8 bits; RTX 3090/4080 para cuantización de 8 o 4 bits.
- Cabe en GPU de consumo: sí, en tarjetas con 16-24 GB de VRAM usando cuantización de 8 o 4 bits, siempre que el código personalizado (`custom_code`) sea compatible con el runtime de cuantización elegido.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía documentada; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible, y la naturaleza híbrida Mamba-MoE con código personalizado puede limitar la compatibilidad con estos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Olala-v1.0-mini-7A1B-SFT | 6,77 B | no disponible | Apache 2.0 | Checkpoint SFT pre-alineación, híbrido Mamba-MoE, 37 idiomas |
| Olala-v1.0-mini-7A1B (final) | 6,77 B (misma familia) | no disponible | Apache 2.0 | Versión post-alineación, +15,2 puntos de media según el autor |
| Mistral-7B-Instruct | 7,24 B | 32 K | Apache 2.0 | Transformer denso, ampliamente soportado en vLLM/llama.cpp |
| Qwen2.5-7B-Instruct | 7,62 B | 128 K | Apache 2.0 | Transformer denso, multilingüe, tool calling |

La comparación con Mistral-7B-Instruct y Qwen2.5-7B-Instruct se ofrece como referencia de categoría (modelos densos de ~7 B con licencia Apache 2.0); no se dispone de datos de rendimiento comparativo del Olala en benchmarks públicos.

## Limitaciones y advertencias

- Checkpoint pre-alineación: el autor advierte explícitamente que puede producir contenido tóxico, de odio o dañino y que cumple peticiones dañinas con más frecuencia que el modelo final (12,5 % de éxito en ataques frente a 6,3 %; 34,9 % de respuestas dañinas).
- No debe usarse como asistente ni exponerse a usuarios finales sin entrenamiento de seguridad y filtros propios.
- Riesgo de alucinación: no cuantificado en la información disponible, pero inherente a modelos de esta escala.
- Longitud de contexto no documentada, lo que dificulta planificar despliegues con ventanas largas.
- Compatibilidad limitada: requiere `custom_code` y `trust_remote_code`, lo que puede impedir su uso en motores de inferencia estándar sin adaptaciones.
- Licencia Apache 2.0 permite uso comercial, pero la falta de alineación hace desaconsejable cualquier despliegue comercial directo sin un pipeline de moderación.
- Idiomas: aunque se listan 37 idiomas, no se documenta la calidad relativa por idioma; el español está incluido, pero sin métricas específicas.
- Huella de carbono del entrenamiento completo estimada en 30-50 t CO2e y 1,16 GWh, dato relevante para informes de sostenibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B-SFT
- Modelo base: https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B-base
- Modelo final post-alineación: https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B
- Informe técnico (PDF): https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B/blob/main/Olala-v1.0-mini.pdf
- Playground: https://olala.ovh.com
- Catálogo de AI Endpoints de OVHcloud: https://www.ovhcloud.com/en/public-cloud/ai-endpoints/catalog/olala-1.0-mini/
