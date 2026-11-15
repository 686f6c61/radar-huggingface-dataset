# Shameless111/Loopy-Ouro-1.4B-W4A4-G32

## Resumen

Loopy-Ouro-1.4B-W4A4-G32 es un checkpoint cuantizado derivado de ByteDance/Ouro-1.4B, un modelo de lenguaje recurrente de 1.4 mil millones de parámetros desarrollado originalmente por ByteDance. La variante publicada por Shameless111 aplica un esquema de cuantización de pesos a 4 bits (W4) y activaciones dinámicas por token a 4 bits (A4), con un tamaño de grupo de 32 (G32), sobre la arquitectura recurrente del modelo base. Se trata de un artefacto de investigación más que de un modelo listo para producción, orientado a estudiar el impacto de la cuantización agresiva en modelos con profundidad recurrente.

El checkpoint forma parte de una búsqueda experimental más amplia: se seleccionó un candidato concreto (`s137_p08_b512`) de un pool de 400 configuraciones, empleando rotaciones Hadamard de bloque 512, semilla de rotación 137 y potencia de escalado 0.8. El resultado es un modelo que mantiene la licencia Apache-2.0 del modelo base y que requiere un cargador personalizado (custom loader) incluido en el repositorio, ya que no es compatible con la carga estándar de Transformers mediante `from_pretrained()`.

La relevancia de esta ficha radica en que documenta una de las primeras aproximaciones públicas a la cuantización W4A4 de un modelo recurrente de la familia Ouro, con métricas de evaluación completas (perplejidad en WikiText-2 y LAMBADA, además de exactitud en WinoGrande, ARC-C, HellaSwag y MMLU). El repositorio incluye además el protocolo experimental congelado, los artefactos de calibración y los registros de búsqueda, lo que facilita la reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer recurrente (recurrent depth T=4) |
| Parametros totales | 1.4 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (usado en evaluacion WT2) |
| Tipos de cuantizacion | W4A4 (pesos 4 bits, activaciones dinamicas por token 4 bits), grupo de 32; codigos W4 almacenados en contenedores INT8 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | `selected.pt` (state dict PyTorch), sin almacenamiento INT4 empaquetado; requiere cargador Loopy personalizado |

## Arquitectura y entrenamiento

El modelo base ByteDance/Ouro-1.4B emplea una arquitectura de transformer recurrente con profundidad recurrente T=4, lo que significa que el mismo bloque se aplica iterativamente cuatro veces sobre la representación latente. Esta variante cuantizada conserva dicha arquitectura y aplica sobre ella un esquema de cuantización post-entrenamiento con rotaciones Hadamard (bloque 512) para redistribuir valores atípicos antes de la cuantización. Los pesos se almacenan como códigos enteros de 4 bits en contenedores INT8, junto con escalas, puntos cero, escalado de entrada y signos de Hadamard; los tensores no cuantizados mantienen sus tipos de coma flotante originales.

El proceso de selección del checkpoint implicó evaluar 400 candidatos y elegir `s137_p08_b512` con semilla de rotación 137, potencia de escalado 0.8 y tamaño de bloque Hadamard 512. La evaluación se realiza mediante cuantización falsa (fake quantization) en BF16, no con un kernel de inferencia INT4 real. Los datos de calibración provienen de ventanas fijas del split de entrenamiento de WikiText-103 (revision `b08601e04326c79dfdd32d625aee71d232d685c3` de `Salesforce/wikitext`), con grupos separados de 32 ventanas para calibración, búsqueda y calidad. No se especifica en la información disponible el número de tokens de entrenamiento del modelo base ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto en inglés: el modelo está etiquetado únicamente con el idioma `en`.
- Razonamiento de sentido común y conocimiento general: evaluado en WinoGrande, ARC-C, HellaSwag y MMLU.
- Modelado de lenguaje y perplejidad: evaluado en WikiText-2 y LAMBADA con contexto de 4096 tokens.
- Procesamiento de contexto largo: ventana de 4096 tokens empleada en la evaluación documental de perplejidad.
- Razonamiento recurrente: la profundidad recurrente T=4 permite reutilizar parámetros en múltiples pasos de cómputo.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible; el modelo es exclusivamente de texto.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación en cuantización de modelos recurrentes: el checkpoint permite estudiar cómo afecta W4A4 con grupo 32 a un transformer recurrente, comparando con las métricas de referencia en `reference_results/` y el protocolo congelado en `code/docs/protocol.md`.
- Reproducción de experimentos de compresión: al incluir los 400 registros de búsqueda y las ventanas de calibración fijas, sirve para replicar la selección del candidato `s137_p08_b512` y validar la metodología de rotaciones Hadamard.
- Evaluación comparativa de precisión de activación: al existir selecciones separadas W4A4 y W4A8, permite medir el impacto de la precisión de activación sobre las mismas tareas (LAMBADA, WinoGrande, ARC-C, HellaSwag, MMLU).
- Benchmarking de perplejidad documental: el modelo está preparado para ejecutar `eval_wikitext.py` con contexto de 4096 tokens y perplejidad de palabras en modo rolling, útil para comparar esquemas de cuantización sobre WikiText-103.
- Estudio de viabilidad de despliegue en hardware limitado: con 1.9 GB de repositorio y pesos de 4 bits, es un candidato para analizar si un modelo recurrente de 1.4B puede servirse en GPUs de gama media, aunque sin kernel INT4 real la latencia no refleja el potencial teórico.
- Docencia y formación técnica: el repositorio incluye entorno Conda, scripts de descarga y evaluación, lo que lo convierte en un ejemplo práctico de flujo de trabajo con checkpoints cuantizados personalizados.

## Benchmarks y rendimiento

Resultados guardados del checkpoint seleccionado (tabla principal del autor):

| Metrica | Valor |
|---|---:|
| WT2 word PPL (contexto 4096) | 14.73 |
| LAMBADA PPL | 8.17 |
| LAMBADA acc. | 55.81 |
| WinoGrande | 61.48 |
| ARC-C (acc_norm) | 47.70 |
| HellaSwag (acc_norm) | 67.70 |
| MMLU | 56.07 |
| Media de exactitud (5 tareas) | 57.75 |

Las exactitudes están en porcentaje. La media pondera por igual las cinco tareas de exactitud. El autor indica que las métricas completas en precisión total están en `reference_results/` y que la evaluación usa cuantización falsa en BF16. No se proporcionan en la información disponible resultados de benchmarks comparativos con otros modelos de la misma categoría.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 1.4B en 4 bits requiere del orden de 1-2 GB para pesos, más overhead de activaciones y contexto; el repositorio ocupa 1.9 GB.
- GPU recomendadas: no disponible en la información proporcionada. El script de evaluación usa `CUDA_VISIBLE_DEVICES=0`, lo que sugiere ejecución en una única GPU.
- Compatibilidad con GPU de consumo: no confirmada oficialmente; por tamaño de pesos sería plausible en GPUs de consumo con suficiente VRAM, pero el cargador personalizado y la ausencia de kernel INT4 real condicionan el rendimiento.
- Opciones de despliegue: cargador Loopy personalizado incluido en `code/`; no compatible con `from_pretrained()` estándar de Transformers. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor advierte explícitamente que esta release no usa almacenamiento INT4 empaquetado ni kernel de inferencia INT4, por lo que el rendimiento en producción no refleja el de un despliegue W4A4 optimizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Loopy-Ouro-1.4B-W4A4-G32 | 1.4B | 4096 | W4A4, grupo 32 | Apache-2.0 | Hugging Face (repo de 1.9 GB) |
| ByteDance/Ouro-1.4B (base) | 1.4B | no disponible | BF16 (sin cuantizar) | Apache-2.0 | Hugging Face |
| Otras variantes Loopy del mismo autor | no disponible | no disponible | W4A4 / W4A8 (selecciones separadas) | Apache-2.0 | Hugging Face |

No se dispone en la información proporcionada de datos de rendimiento de modelos comparables de otros autores para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Solo soporta inglés (`language: en`); no se declaran capacidades multilingües.
- No es un modelo listo para producción: requiere el cargador Loopy personalizado y no funciona con `from_pretrained()` estándar de Transformers.
- La release no incluye kernel de inferencia INT4 ni almacenamiento empaquetado; la evaluación usa cuantización falsa en BF16, por lo que las métricas no garantizan el comportamiento de un despliegue INT4 real.
- Riesgo de alucinación: inherente a los modelos de lenguaje de 1.4B; no se documentan mitigaciones específicas.
- Sesgos conocidos: no se documentan en la información disponible; al entrenarse presumiblemente con datos web en inglés, es esperable un sesgo hacia ese dominio.
- Restricciones de licencia: los pesos mantienen Apache-2.0, pero el código de investigación y las dependencias se rigen por `code/THIRD_PARTY_NOTICES.md`; conviene revisarlo antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria independiente.
- No se especifican datos sobre el entrenamiento del modelo base (tokens, composición del dataset, RLHF/DPO) en la información proporcionada.
- Las métricas reportadas provienen del propio experimento del autor; no hay verificación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shameless111/Loopy-Ouro-1.4B-W4A4-G32
- Modelo base: https://huggingface.co/ByteDance/Ouro-1.4B
- Dataset de calibración (WikiText-103): https://huggingface.co/datasets/Salesforce/wikitext
- Protocolo experimental: `code/docs/protocol.md` (dentro del repositorio)
- Avisos de terceros: `code/THIRD_PARTY_NOTICES.md` (dentro del repositorio)
- Manifiesto de archivos: `manifest.json` (dentro del repositorio)
- Procedencia: `provenance.json` (dentro del repositorio)
