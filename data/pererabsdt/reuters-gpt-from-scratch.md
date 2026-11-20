# pererabsdt/reuters-gpt-from-scratch

## Resumen

Reuters GPT From Scratch es un modelo de lenguaje autorregresivo de estilo GPT-2 entrenado desde cero (pesos inicializados aleatoriamente, sin fine-tuning sobre un modelo preentrenado) por el usuario pererabsdt. Con 30,8 millones de parámetros, 6 capas, 6 cabezas de atención y una dimensión de embedding de 384, se trata de un modelo de escala muy reducida orientado a la generación de texto en inglés sobre el dominio periodístico de Reuters. El problema que aborda es acotado: servir como artefacto reproducible de un entrenamiento causal completo sobre un corpus concreto, más que competir con modelos de propósito general.

El modelo emplea la arquitectura `GPT2LMHeadModel` de la librería Transformers, con un tokenizador propio de vocabulario 52.000 entrenado sobre el mismo corpus (`ingeniumacademy/gpt2-reuters-tokenizer`). La ventana de contexto es de 512 tokens y el entrenamiento se realizó durante 8 épocas con el objetivo de modelado de lenguaje causal sobre secuencias concatenadas de titular y cuerpo.

Su relevancia es fundamentalmente didáctica y de investigación: documenta el proceso completo de entrenamiento desde cero, publica curvas de pérdida y métricas de validación (perplejidad final de 66,74), y se distribuye con licencia MIT. No dispone de descargas ni interacciones en el momento de la consulta, y no se ha publicado información sobre benchmarks estándar, capacidades de instrucción ni ajuste por preferencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (`GPT2LMHeadModel`) |
| Parametros totales | 30.812.160 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (`n_positions`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Capas (`n_layer`) | 6 |
| Cabezas de atencion (`n_head`) | 6 |
| Dimension de embedding (`n_embd`) | 384 |
| Vocabulario | 52.000 tokens |
| Tokenizador | `ingeniumacademy/gpt2-reuters-tokenizer` |
| Dataset de entrenamiento | `ingeniumacademy/reuters_articles` |
| Perdida de validacion final | 4,2008 (8 epocas) |
| Perplejidad de validacion final | 66,74 (8 epocas) |
| Tamano del repositorio | 0,1 GB |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con atención causal completa, configurado mediante `GPT2Config` e inicializado desde cero con `GPT2LMHeadModel`. La configuración concreta es de 6 capas, 6 cabezas de atención, dimensión de embedding de 384 y ventana de posición de 512 tokens, lo que da un total de 30.812.160 parámetros. No se emplean mecanismos de atención lineal, mezcla de expertos ni arquitecturas híbridas: es un GPT-2 clásico a pequeña escala.

El entrenamiento consistió en modelado de lenguaje causal autoconsupervisado (`mlm=False`) sobre secuencias formadas por la concatenación de titular y cuerpo de artículos del corpus `ingeniumacademy/reuters_articles`. Se ejecutaron 8 épocas, con una pérdida de validación final de 4,2008 y una perplejidad de 66,74. La model card no documenta el número total de tokens procesados, la composición detallada del dataset, la presencia de RLHF, DPO u otras etapas de alineación, ni detalles sobre precisión numérica, optimizador o estrategia de decodificación durante la evaluación.

## Capacidades

- Generación de texto autoregresiva en inglés mediante predicción del siguiente token.
- Continuación de texto periodístico: dado un fragmento inicial (por ejemplo, un titular o el arranque de una noticia), el modelo genera una continuación coherente con el estilo del corpus Reuters.
- Modelado de lenguaje sobre dominio periodístico: adecuado para tareas de scoring de probabilidad de secuencias en ese dominio concreto.
- No dispone de capacidades de instrucción ni de diálogo: no ha sido ajustado con pares instrucción-respuesta ni con RLHF/DPO.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe: únicamente inglés declarado; no se documentan otros idiomas.
- No se documentan capacidades de visión, audio, modo de razonamiento explícito ni decodificación especulativa.

## Casos de uso

- Experimentación docente sobre entrenamiento desde cero: el modelo sirve como referencia reproducible para cursos o talleres en los que se quiera mostrar el ciclo completo de entrenamiento de un GPT-2 pequeño, con pesos, tokenizador y curvas de pérdida publicados.
- Generación de titulares y entradillas de estilo Reuters: partiendo de un fragmento semilla, el modelo produce continuaciones con la sintaxis y el registro del corpus periodístico, útil para prototipos de generación de texto informativo.
- Evaluación de modelos base en dominio financiero-informativo: al estar entrenado exclusivamente sobre artículos de Reuters, puede emplearse como línea base para medir perplejidad en ese dominio y comparar con modelos preentrenados de mayor tamaño.
- Investigación sobre tokenizadores de dominio: el uso de un tokenizador propio de 52.000 tokens entrenado sobre el corpus permite estudiar el efecto del vocabulario específico en la perplejidad y en la calidad de generación.
- Pruebas de infraestructura de inferencia a pequeña escala: con 30,8 millones de parámetros y pesos safetensors de 0,1 GB, es adecuado para validar pipelines de despliegue (carga, generación con sampling, temperatura) en entornos con recursos mínimos.
- Reproducibilidad y auditoría de entrenamiento: la publicación de la pérdida de validación y la perplejidad permite auditar y replicar el proceso, útil en trabajos académicos sobre transparencia en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de validación del propio entrenamiento: pérdida de validación de 4,2008 y perplejidad de 66,74 tras 8 épocas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (fp32), dado el tamaño de 30,8 millones de parámetros y un repositorio de 0,1 GB; en fp16 o bf16 se reduce aproximadamente a la mitad.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere hardware de centro de datos. Una RTX 4090, RTX 3090 o incluso una GPU integrada con suficiente memoria compartida puede ejecutar el modelo.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1-2 GB de memoria disponible, incluidas GTX 1650, RTX 3060 y superiores.
- Opciones de despliegue: al ser un `GPT2LMHeadModel` estándar, es compatible con `transformers` (carga directa con `AutoModelForCausalLM`), y previsiblemente con llama.cpp/Ollama si se convierte a GGUF, aunque no se documenta ninguna conversión publicada. vLLM y TGI no están documentados para este modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño, la generación de decenas de tokens debería ser del orden de milisegundos en GPU consumer, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| pererabsdt/reuters-gpt-from-scratch | 30,8 M | 512 | MIT | Hugging Face | Entrenado desde cero sobre corpus Reuters; sin benchmarks publicados |
| GPT-2 small (OpenAI) | 124 M | 1024 | MIT | Hugging Face | Modelo preentrenado de referencia de escala similar; ampliamente evaluado |
| DistilGPT-2 | 82 M | 1024 | MIT | Hugging Face | Destilado de GPT-2; mayor tamaño que el modelo analizado |
| Modelos GPT-2 pequeños de dominio | variable | variable | variable | Hugging Face | No se dispone de comparaciones directas publicadas para este modelo |

La comparación cuantitativa de rendimiento no está disponible: el modelo analizado no publica resultados en benchmarks estándar (MMLU, HumanEval, GSM8K), por lo que no es posible contrastarlo numéricamente con las alternativas citadas.

## Limitaciones y advertencias

- Escala muy reducida: 30,8 millones de parámetros y 6 capas limitan severamente la coherencia a largo plazo y la calidad de generación frente a modelos de mayor tamaño.
- Perplejidad de validación de 66,74: un valor alto que indica un ajuste limitado incluso sobre el dominio de entrenamiento; es esperable una generación repetitiva o incoherente en secuencias largas.
- Ventana de contexto de 512 tokens: insuficiente para documentos largos o conversaciones multi-turno.
- Entrenado únicamente sobre artículos de Reuters: el conocimiento del mundo está restringido al corpus y a la fecha de recogida de los datos; no se documenta la composición ni la cobertura temporal del dataset.
- Sin alineación: al no haberse aplicado RLHF, DPO ni ajuste por instrucciones, el modelo no sigue instrucciones ni rechaza contenido problemático de forma fiable.
- Riesgo de alucinación: como todo modelo de lenguaje generativo, puede producir afirmaciones factualmente incorrectas, especialmente en un modelo base de este tamaño.
- Sesgos: no se documenta ninguna evaluación de sesgos; el corpus periodístico puede contener sesgos de cobertura, geográficos o temáticos que el modelo reproduzca.
- Idioma: solo inglés declarado; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Licencia MIT: permite uso comercial y modificación, pero no se ofrece ninguna garantía sobre el modelo; el usuario asume la responsabilidad del uso.
- Sin descargas ni validación comunitaria: el modelo no cuenta con interacciones en el momento de la consulta, por lo que no hay evidencia externa de calidad más allá de las métricas del autor.
- No se documenta soporte de tool calling, agentes ni cuantizaciones publicadas; cualquier uso en producción requeriría validación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pererabsdt/reuters-gpt-from-scratch
- Dataset de entrenamiento: https://huggingface.co/datasets/ingeniumacademy/reuters_articles
- Tokenizador: https://huggingface.co/datasets/ingeniumacademy/gpt2-reuters-tokenizer
- Curva de pérdida (loss_curve.png): incluida en el repositorio del modelo en Hugging Face
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
