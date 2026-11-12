# g-tertho/sagemh-qwen2-0.5b-dreaddit

## Resumen

SAGEMH Qwen2-0.5B Dreaddit es un modelo de lenguaje de 494 millones de parámetros obtenido mediante el ajuste fino con LoRA del modelo base Qwen/Qwen2-0.5B, desarrollado por g-tertho (Tertho Ghosh y Fahmida Sweety) en el marco de la tesis SAGEMH. Su propósito es concreto y acotado: la detección binaria de estrés en publicaciones de redes sociales en inglés, formulada como una tarea de generación de texto con respuesta "Yes" o "No" seguida de una breve justificación. El modelo se distribuye como un merge del adaptador LoRA en los pesos base, en formato float16.

La relevancia del modelo no reside en su tamaño ni en sus capacidades generales, sino en su especialización: reproduce exactamente las predicciones del conjunto de test congelado (n = 414) del corpus Dreaddit, con un F1 ponderado de 83,55 y una precisión balanceada de 83,50. Es, por tanto, un artefacto de investigación reproducible más que un modelo de propósito general, y así debe tratarse en cualquier evaluación.

Arquitectónicamente es un transformer decoder-only de la familia Qwen2, con 494.032.768 parámetros reales según los pesos safetensors, y hereda las limitaciones y características del Qwen2-0.5B original. La licencia Apache-2.0 facilita su uso y modificación, aunque las restricciones sobre los datos de entrenamiento (Dreaddit) condicionan su explotación comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2-0.5B soporta hasta 32.768 tokens, pero la model card no lo confirma para este ajuste) |
| Tipos de cuantizacion | no disponible (pesos publicados en float16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (float16, LoRA mergeado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2-0.5B, un transformer decoder-only con atención causal estándar. Sobre él se aplicó un adaptador LoRA de rango 16, alpha 32, dropout 0,05, aplicado a todas las proyecciones lineales. Posteriormente el adaptador se fusionó en los pesos base y el conjunto se guardó en float16, de modo que en inferencia no hay sobrecarga de adaptadores ni necesidad de cargar PEFT por separado.

El entrenamiento se realizó sobre el split binario de Dreaddit (publicaciones de Reddit en inglés), durante 5 épocas, con tasa de aprendizaje 2e-4, schedule coseno, batch efectivo de 16 (4 × 4), precisión bf16 y semilla 42. Se reservó un 5 % del split de entrenamiento para validación, con longitud de corte de 512 tokens, y se utilizó la época final sin early stopping. La evaluación se hizo con decodificación greedy (`do_sample=False`), un máximo de 64 tokens nuevos y la plantilla de chat de Qwen2. No se documenta RLHF, DPO ni otra fase de alineación posterior.

## Capacidades

- Clasificación binaria de estrés en publicaciones de redes sociales en inglés, con salida "Yes" o "No".
- Generación de una justificación breve tras la etiqueta, aunque el autor advierte explícitamente de que no está verificada.
- Formato de prompt fijo: `Consider this post: "<post>" Question: Does the poster suffer from stress?`, aplicado mediante la plantilla de chat de Qwen2.
- Generación de texto autoregresiva básica heredada del modelo base, sin garantías de calidad fuera del dominio de entrenamiento.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe: el modelo está entrenado y etiquetado únicamente para inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Moderación y triaje de comunidades online: el modelo puede etiquetar publicaciones de foros o redes como indicativas de estrés para priorizar la revisión humana, aprovechando su F1 ponderado de 83,55 sobre el test de Dreaddit.
- Investigación en salud mental computacional: sirve como línea base reproducible para comparar clasificadores de estrés en texto social, dado que reproduce exactamente las predicciones del test congelado con semilla 42.
- Detección de señales de estrés en pipelines de análisis de sentimiento: integrable como etapa de clasificación binaria dentro de un procesamiento por lotes de publicaciones en inglés.
- Anotación asistida de corpus: generación de etiquetas preliminares sobre texto de estilo Reddit para acelerar el etiquetado manual posterior.
- Prototipado rápido en entornos con recursos limitados: sus 494 millones de parámetros y su formato float16 permiten ejecutarlo en una GPU de consumo para validar hipótesis antes de escalar a modelos mayores.
- Filtrado previo en sistemas de alerta temprana: como primera etapa de bajo coste que descarte publicaciones sin señal de estrés antes de aplicar modelos o revisores más caros.
- Docencia y demostraciones: ejemplo compacto de ajuste fino con LoRA, merge de adaptadores y evaluación con métricas balanceadas en una tarea de clasificación vía generación.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el test de Dreaddit (n = 414), decodificación greedy, máximo 64 tokens nuevos:

| Metrica | Valor |
|---|---|
| Weighted F1 | 83,55 |
| Macro F1 | 83,53 |
| Balanced accuracy | 83,50 |
| Accuracy | 83,57 |
| MCC | 0,6725 |

No se han publicado resultados de benchmarks en la informacion disponible para tareas generales (MMLU, HumanEval, GSM8K u otras), ni comparaciones con modelos alternativos en la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: en float16, los 494 millones de parámetros ocupan aproximadamente 1 GB de pesos; con caché KV y overhead de runtime, el consumo realista se sitúa en torno a 1,5-2,5 GB para contextos de 512 tokens.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; funcionan RTX 3060, RTX 4060, RTX 4090, A100 y H100 sin problema, aunque las GPU de gama alta están sobredimensionadas para este modelo.
- Cabe holgadamente en GPU de consumo, incluidas tarjetas de gama baja y media con 4-8 GB.
- Opciones de despliegue: transformers (documentado en la model card), text-generation-inference (etiqueta `text-generation-inference` presente en el repo) y endpoints compatibles. No se documentan pesos GGUF, por lo que llama.cpp y Ollama requerirían conversión previa no oficial.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAGEMH Qwen2-0.5B Dreaddit | 494 M | no disponible | Clasificación binaria de estrés (Dreaddit) | Apache-2.0 | Hugging Face |
| Qwen/Qwen2-0.5B | 494 M | 32.768 tokens (según modelo base) | Generación de texto general | Apache-2.0 | Hugging Face |
| Alternativas especializadas en detección de estrés en Dreaddit | no disponible | no disponible | Clasificación binaria de estrés | no disponible | no disponible |

La comparación con otros clasificadores de Dreaddit no puede establecerse con datos de la información proporcionada; el autor no incluye una tabla comparativa frente a líneas base externas.

## Limitaciones y advertencias

- La justificación generada tras la etiqueta "Yes"/"No" no está verificada y puede ser incoherente o inventada; solo la etiqueta binaria está respaldada por la evaluación.
- Entrenado exclusivamente con texto de estilo Reddit en inglés; no se garantiza su transferencia a texto clínico ni a otros idiomas.
- No es una herramienta de diagnóstico médico; cualquier uso en contextos de salud requiere supervisión profesional y validación independiente.
- El conjunto de datos Dreaddit no se redistribuye; el uso del modelo queda sujeto a los términos originales de dicho corpus, lo que puede condicionar la explotación comercial pese a la licencia Apache-2.0 de los pesos.
- Riesgo de alucinación en la parte generativa de la respuesta, inherente a un modelo de 0,5 mil millones de parámetros.
- El modelo se evaluó con un único protocolo de decodificación (greedy, 64 tokens); variaciones en el prompt o en los parámetros de generación pueden alterar los resultados.
- Sin datos publicados sobre sesgos demográficos, de género o culturales en las predicciones.
- No se documentan cuantizaciones oficiales ni soporte verificado en runtimes distintos de transformers y TGI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/g-tertho/sagemh-qwen2-0.5b-dreaddit
- Modelo base: https://huggingface.co/Qwen/Qwen2-0.5B
- Corpus Dreaddit: no disponible en la información proporcionada
- Paper o blog de la tesis SAGEMH: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
