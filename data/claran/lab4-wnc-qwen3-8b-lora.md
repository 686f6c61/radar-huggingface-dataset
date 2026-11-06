# claran/lab4-wnc-qwen3-8b-lora

## Resumen

El modelo `claran/lab4-wnc-qwen3-8b-lora` es un adaptador LoRA entrenado sobre `Qwen/Qwen3-8B` para una tarea muy concreta: clasificar una frase suelta como `biased` (sesgada) o `neutral` según la política de Punto de Vista Neutral (NPOV) de Wikipedia. Lo desarrolla el usuario `claran` en el contexto del laboratorio 4 de la asignatura CMU 11-811, y es el adaptador que se sirve a los estudiantes como modelo `tuned`. No es un modelo generalista: es un clasificador binario de una sola palabra de salida, empaquetado como adaptador PEFT.

El adaptador se apoya en Qwen3-8B, un transformer denso de 8.000 millones de parámetros con modo de razonamiento configurable; aquí el modo "thinking" se desactiva explícitamente para forzar respuestas de un solo token. El entrenamiento usa el corpus Wiki Neutrality Corpus (WNC, Pryzant et al., 2020), en el que cada edición de Wikipedia que corrige un sesgo genera dos ejemplos: la frase previa etiquetada como `biased` y la frase posterior etiquetada como `neutral`.

Es relevante ahora por dos motivos: primero, demuestra un caso de uso muy acotado y reproducible de ajuste fino con LoRA sobre un modelo abierto de última generación; segundo, sirve como material didáctico para ilustrar cómo se construyen clasificadores con modelos generativos y qué limitaciones reales tienen cuando se evalúan fuera del conjunto de test.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen3-8B |
| Parámetros totales | 8.000 millones (modelo base) + 15,3 millones entrenables (adaptador) |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Qwen3-8B) |
| Tipos de cuantización | no disponible (el adaptador se entrenó en bf16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador LoRA tiene rango 16, alpha 32 y dropout 0,05, aplicado sobre las proyecciones de atención `q`, `k`, `v` y `o` del modelo base Qwen3-8B. Esto da 15,3 millones de parámetros entrenables sobre los 8.000 millones del modelo base. Se entrenó durante 1 época con learning rate 2e-4 y decaimiento lineal hasta 0, optimizador AdamW con weight decay 0,01, batch efectivo de 16 y precisión bf16, en dos GPU NVIDIA L40S durante unos 32 minutos. La pérdida se calcula solo sobre los tokens de respuesta (la palabra de etiqueta y el token de fin de turno).

Los datos provienen de las particiones a nivel de palabra del Wiki Neutrality Corpus, en la versión limpiada del curso que elimina pares de entrenamiento con frases idénticas en dev o test: 53.772 pares de entrenamiento, equivalentes a 107.544 frases. Cada par (frase antes de la edición, frase después) se convierte en dos ejemplos de entrenamiento con etiquetas opuestas. No se menciona RLHF ni DPO; el ajuste es supervisado y puramente discriminativo en formato generativo. El prompt de entrenamiento se inserta en la plantilla de chat de Qwen3 con `enable_thinking=False` y espera una única palabra como respuesta.

## Capacidades

- Clasificación binaria de una frase como `biased` o `neutral` según la política NPOV de Wikipedia.
- Generación de una única palabra como salida, lo que simplifica el parseo en producción.
- Funcionamiento dentro de la plantilla de chat de Qwen3 con el modo de razonamiento desactivado.
- Despliegue como adaptador LoRA servido junto al modelo base mediante vLLM (`--enable-lora --lora-modules tuned=<ruta>`).
- No soporta tool calling, agentes, visión, audio ni razonamiento multi-paso de forma específica para esta tarea; el adaptador está especializado en la clasificación descrita.
- Capacidades multilingües: no, solo inglés.

## Casos de uso

- Detección de sesgo en ediciones de Wikipedia: el adaptador puede puntuar frases candidatas antes de publicar una edición y marcar aquellas que se desvían del NPOV, usando el formato de prompt exacto con el que fue entrenado.
- Herramienta de formación para editores: un editor novel puede pegar una frase y recibir una señal inmediata de si el modelo la considera sesgada, como apoyo pedagógico y no como veredicto final.
- Investigación sobre sesgo lingüístico: permite reproducir el experimento de WNC con un modelo moderno y comparar el rendimiento con clasificadores clásicos sobre el mismo conjunto de test.
- Etiquetado asistido en corpus: para generar etiquetas preliminares a gran escala sobre frases de Wikipedia que luego se revisan manualmente, aprovechando el bajo coste de inferencia de una salida de un solo token.
- Docencia y prácticas de ajuste fino: sirve como ejemplo reproducible de entrenamiento LoRA en dos GPU L40S en menos de una hora, útil en cursos de NLP.
- Evaluación comparativa de adaptadores: al ser un adaptador PEFT pequeño (0,1 GB de repositorio), se puede cargar y descargar rápidamente para comparar variantes de hiperparámetros o de datos.
- Filtrado previo en pipelines de curación de contenido: como primera pasada de bajo coste para señalar frases candidatas a revisión humana, nunca como decisión automática.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre la partición de test a nivel de palabra de WNC (2.000 frases, 1.000 pares):

| Métrica | Valor |
|---|---|
| Exactitud (accuracy) | 0,775 (IC 95 %: 0,757–0,793) |
| Exactitud emparejada (frase sesgada puntuada por encima de su reescritura) | 0,885 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa unos 0,1 GB; el coste real lo determina el modelo base Qwen3-8B.
- Entrenamiento: dos NVIDIA L40S en bf16, aproximadamente 32 minutos para una época.
- Inferencia: se recomienda servir con vLLM usando `--enable-lora --lora-modules tuned=<ruta>` y enviar `chat_template_kwargs={"enable_thinking": false}` en cada petición.
- VRAM estimada para el modelo base en bf16: alrededor de 16 GB solo para pesos, más overhead de KV cache; en cuantización de 8 bits o 4 bits cabría en GPU de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque no se proporcionan cifras oficiales de cuantización para este adaptador.
- GPU recomendadas para producción: A100, H100 o L40S para servir el modelo base completo; para pruebas locales, RTX 4090 o similares con cuantización.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `claran/lab4-wnc-qwen3-8b-lora` | 8B base + 15,3M adaptador | no disponible | Clasificación NPOV binaria | Apache-2.0 | Hugging Face |
| `Qwen/Qwen3-8B` (base) | 8B | no disponible | Generación general | Apache-2.0 | Hugging Face |
| Clasificadores clásicos sobre WNC (Pryzant et al., 2020) | no disponible | no disponible | Detección de sesgo | no disponible | Paper y repo |

La comparación con otros adaptadores LoRA para la misma tarea no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Las etiquetas reflejan de qué lado de una edición estaba la frase, no un juicio independiente de que sea sesgada; algunas ediciones son discutibles y las frases se juzgan sin el contexto del artículo.
- Las frases de WNC están en minúsculas y preprocesadas, y cada par difiere solo en una o dos palabras, lo que aleja la distribución de entrenamiento del texto real.
- El conjunto de entrenamiento está balanceado 50/50 entre sesgado y neutral; en texto real hay muchas menos frases sesgadas, por lo que la precisión en producción será mucho menor.
- El autor indica explícitamente que está pensado para docencia e investigación, no para moderar contenido.
- Solo soporta inglés; no se ha validado en otros idiomas.
- Riesgo de alucinación o de etiquetas erróneas en frases ambiguas o fuera de distribución.
- Licencia Apache-2.0 para el adaptador, pero las frases de entrenamiento provienen de Wikipedia (CC BY-SA) vía WNC, lo que conviene tener en cuenta si se redistribuyen datos derivados.
- El modelo base Qwen3-8B tiene su propia licencia y condiciones de uso que deben respetarse además de la del adaptador.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/claran/lab4-wnc-qwen3-8b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Paper de WNC (Pryzant et al., 2020): https://arxiv.org/abs/1911.09709
- Repositorio de datos de WNC: https://github.com/rpryzant/neutralizing-bias
