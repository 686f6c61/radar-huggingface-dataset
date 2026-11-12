# MatheusSoranco/cafezin-lm-10m-tinystories

## Resumen

Cafezin LM 10M — TinyStories es un checkpoint experimental de generacion de texto en ingles, entrenado desde inicializacion aleatoria por Matheus Soranco sobre un subconjunto local del dataset TinyStories. Se trata de un modelo denso de 10,36 millones de parametros que sigue la arquitectura Qwen3.5, tomando como referencia de configuracion completa el modelo S5-nano de Maritaca AI. La version publicada corresponde al checkpoint del paso 5.000 de la configuracion pequena.

El modelo no pretende competir con LLM de produccion: es una pieza de investigacion orientada al estudio de modelos de lenguaje de escala muy reducida y a la validacion de arquitecturas hibridas en entornos con recursos minimos. Su interes tecnico reside en combinar bloques Gated DeltaNet con bloques de atencion completa, un decodificador auxiliar de prediccion multi-token (MTP) y una torre de vision (dejada en inicializacion), todo ello entrenado en menos de 40 minutos en una GPU de portatil de 6 GB.

La relevancia actual es metodologica: demuestra que es posible entrenar y exportar un modelo multimodal-listo con arquitectura moderna en hardware consumer basico, y sirve como banco de pruebas reproducible para experimentos de arquitectura, tokenizacion y objetivos auxiliares de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con arquitectura Qwen3.5 (hibrida: 9 bloques Gated DeltaNet + 3 bloques de atencion completa con gating) |
| Parametros totales | 10.366.256 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | SafeTensors (FP32, 41,49 MB) |

## Arquitectura y entrenamiento

El decodificador de texto consta de 12 capas, de las cuales nueve son bloques Gated DeltaNet y tres son bloques de atencion completa con gating. La anchura oculta es de 256 y la del MLP de 512. La atencion completa usa cuatro cabezas de consulta, dos cabezas de clave/valor y anchura de cabeza 32 (GQA). El tokenizador es un BPE a nivel de byte con 16.384 entradas. El modelo incorpora un decodificador auxiliar MTP de una capa (656.704 parametros) y una torre de vision de 81.056 parametros que permanecio en su inicializacion durante el entrenamiento de texto. Emplea embeddings rotatorios multimodales parciales que, en esta ejecucion, operan sobre la secuencia de texto.

El entrenamiento partio de inicializacion aleatoria (semilla 42) sobre un subconjunto local preprocesado de 500.000 documentos de TinyStories, con 108.637.240 tokens de entrenamiento y 1.102.319 tokens reservados para validacion. La funcion de perdida combina entropia cruzada de siguiente token con entropia cruzada MTP ponderada por 0,3. Se uso AdamW (β1 = 0,9, β2 = 0,95, weight decay 0,1) con calentamiento lineal de 150 pasos hasta 3e-4 y decaimiento coseno hasta 3e-5, recorte de gradiente por norma global 1,0, micro-lote de cuatro secuencias con cuatro pasos de acumulacion, y precision FP32 con multiplicacion matricial TF32. El presupuesto total fue de 5.000 pasos de optimizador y 20.480.000 tokens objetivo muestreados. El entrenamiento se ejecuto en una NVIDIA GeForce RTX 3050 Laptop GPU de 6 GB en 38 minutos y 23 segundos, con un pico de memoria reservada de 864 MiB.

## Capacidades

- Generacion de texto autoregresiva en ingles, orientada a continuaciones narrativas simples del estilo TinyStories.
- Prediccion multi-token (MTP) como objetivo auxiliar de entrenamiento; la model card indica que el ejemplo de uso emplea decodificacion autoregresiva ordinaria.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles.
- Capacidades especiales: torre de vision presente en la arquitectura pero no entrenada (permanece en inicializacion); no debe asumirse ninguna capacidad visual funcional.

## Casos de uso

- Estudio de arquitecturas hibridas: el modelo permite reproducir en una GPU de 6 GB la combinacion de Gated DeltaNet y atencion completa, util para comparar curvas de perdida frente a transformers densos clasicos.
- Validacion de objetivos MTP: sirve como banco de pruebas para medir el efecto de una cabeza auxiliar de prediccion multi-token con peso 0,3 sobre la perplejidad del cabezal principal.
- Investigacion de tokenizadores: al usar un BPE de 16.384 entradas y requerir `TokenizersBackend` en lugar del tokenizador Qwen por defecto, es un caso practico para estudiar reglas de pre-tokenizacion y su impacto en la generacion.
- Generacion de cuentos sinteticos para pruebas: puede producir continuaciones narrativas cortas en ingles para pruebas de pipelines de generacion, con la advertencia de que la calidad es limitada por el tamano y el presupuesto de entrenamiento.
- Docencia y divulgacion: ejemplo completo y reproducible de entrenamiento, evaluacion y exportacion de un modelo desde cero, con configuracion, semillas y registro de entrenamiento publicados.
- Pruebas de integracion en Transformers: util para verificar la carga de checkpoints Qwen3.5 con componentes multimodales parciales y la compatibilidad de `Qwen3_5ForConditionalGeneration` en versiones recientes de la libreria.

## Benchmarks y rendimiento

Evaluacion sobre 1.102.080 tokens objetivo del split de validacion local, con 4.305 ventanas consecutivas de 256 predicciones y estado de modelo reiniciado en cada ventana:

| Metrica | Paso 5.000 |
|---|---:|
| Log-verosimilitud negativa media | 2,3179 nats/token |
| Perplejidad | 10,1544 |
| Precision top-1 de siguiente token | 50,48% |

La perdida conjunta (lenguaje + MTP) registrada en el log de entrenamiento sobre 16 lotes de validacion muestreados fue de 5,5012 en el paso 200 y 3,1204 en el paso 5.000. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (41,49 MB de pesos mas estados de activacion y cache para contexto de 256 tokens); el entrenamiento reservo un pico de 864 MiB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; el autor entreno en una RTX 3050 Laptop de 6 GB.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en CPU (se documento una ejecucion de generacion en CPU).
- Opciones de despliegue: Transformers (probado con PyTorch 2.9.0 y Transformers 5.22.2), CLI nativa `cafezin-lm generate`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma medida; el entrenamiento completo de 5.000 pasos requirio 38 minutos y 23 segundos en la RTX 3050 Laptop.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Cafezin LM 10M (este) | 10,37 M | 256 | Apache 2.0 | Hugging Face | Arquitectura Qwen3.5 hibrida, MTP, torre de vision sin entrenar |
| Maritaca AI S5-nano | no disponible en la informacion proporcionada | no disponible | no disponible | Hugging Face | Referencia de configuracion completa citada por el autor |
| Modelos TinyStories tipicos (p. ej. variantes de 1-30 M) | no disponible | no disponible | variable | variable | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de resultados de benchmarks comparativos con alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental de 10,37 M de parametros entrenado con solo 20,48 millones de tokens objetivo: la coherencia y el conocimiento factual son muy limitados.
- Ventana de contexto de 256 tokens; no es adecuado para conversaciones multi-turno ni documentos largos.
- Solo ingles; no se ha entrenado ni evaluado en otros idiomas.
- Riesgo elevado de alucinacion y de derivar hacia patrones narrativos simples propios de TinyStories.
- La torre de vision no fue entrenada: no debe usarse para tareas de imagen-texto pese a la etiqueta `image-text-to-text` del repositorio.
- El tokenizador requiere `TokenizersBackend`; usar la clase de tokenizador Qwen por defecto puede aplicar reglas de pre-tokenizacion distintas y degradar los resultados.
- La revision exacta del dataset upstream y el split de ajuste del tokenizador son desconocidos segun el autor.
- Licencia Apache 2.0 permite uso comercial, pero la calidad del modelo hace inviable su uso en produccion real; el uso previsto es la investigacion.
- Sin descargas ni likes en el momento de la consulta: no hay validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatheusSoranco/cafezin-lm-10m-tinystories
- Repositorio Cafezin LM: https://github.com/Matheussoranco/Cafezin-LM
- Revision del codigo de entrenamiento: https://github.com/Matheussoranco/Cafezin-LM/tree/fc5d07d7514af913fa1a21f26045d4988a97a244
- Instrucciones de la CLI nativa: https://github.com/Matheussoranco/Cafezin-LM#train-and-export-a-small-text-checkpoint
- Documentacion de la arquitectura Qwen3.5 en Transformers: https://huggingface.co/docs/transformers/en/model_doc/qwen3_5
- Modelo de referencia Maritaca AI S5-nano: https://huggingface.co/maritaca-ai/S5-nano
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Paper de TinyStories (arXiv:2305.07759): https://arxiv.org/abs/2305.07759
