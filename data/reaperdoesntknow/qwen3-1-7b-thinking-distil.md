# reaperdoesntknow/Qwen3-1.7B-Thinking-Distil

## Resumen

Qwen3-1.7B-Thinking-Distil es un modelo de generacion de texto de 2.031.739.904 parametros (~2,03B, 1,7B efectivos) desarrollado por reaperdoesntknow bajo el sello Convergent Intelligence LLC (Research Division). Se trata de un destilado por supervisión (SFT) del profesor Qwen3-30B-A3B-Thinking hacia el alumno Qwen3-1.7B, con el objetivo de transferir los patrones de razonamiento extendido —cadenas de deliberacion largas, backtracking y reevaluacion— a un modelo lo bastante pequeno para ejecutarse en hardware de borde.

La arquitectura es un transformer causal denso (Qwen3ForCausalLM) con 28 capas, hidden size 2048, atencion GQA con 16 cabezas de consulta y 8 de clave/valor, dimension de cabeza 128, intermedio 6144, activacion SiLU, vocabulario de 151.936 tokens y una longitud maxima de posicion de 40.960 tokens. Los pesos se distribuyen en BF16 y el repositorio ocupa 8,1 GB.

Su relevancia actual radica en que es el modelo mas descargado del portfolio DistilQwen del autor (2.772 descargas en el momento de la consulta) y ejemplifica una via de destilacion directa por SFT, sin KD a nivel de logits, apoyada en el dataset longwriter-6k para preservar trazas de razonamiento largas. La licencia Apache 2.0 facilita su adopcion comercial, aunque la documentacion publica es escasa en cuanto a evaluacion cuantitativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer causal denso) |
| Parametros totales | 2.031.739.904 (~2,03B; 1,7B efectivos) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 40.960 tokens (max position); entrenamiento con max seq 4.096 |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en BF16; repo de 8,1 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Hidden size | 2.048 |
| Capas | 28 |
| Cabezas de atencion | 16 (Q) / 8 (KV), GQA |
| Dimension de cabeza | 128 |
| Tamano intermedio | 6.144 |
| Vocabulario | 151.936 |
| Precision | BF16 |
| Activacion | SiLU |
| Modelo base | reaperdoesntknow/Disctil-Qwen3-1.7B |
| Profesor | Qwen3-30B-A3B-Thinking |
| Datasets | longwriter-6k, 0xZee/dataset-CoT-Differential-Equations-636, 0xZee/dataset-CoT-Linear-Algebra-667 |
| Framework de entrenamiento | TRL (SFTTrainer) |
| Hardware de entrenamiento | NVIDIA H100 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia Qwen3, con atencion de consulta agrupada (GQA) que reduce el coste de memoria KV durante la inferencia. La cabeza de salida proyecta sobre un vocabulario de 151.936 tokens, lo que condiciona el tamano del embedding y de la matriz de salida. La ventana de posiciones alcanza los 40.960 tokens, si bien el entrenamiento se realizo con una longitud maxima de secuencia de 4.096, de modo que el rendimiento mas alla de ese umbral no esta validado por el autor.

El entrenamiento consistio en un SFT supervisado con TRL (SFTTrainer) en BF16 sobre NVIDIA H100, usando como profesor Qwen3-30B-A3B-Thinking y como alumno Qwen3-1.7B. La eleccion metodologica del autor es explicita: en lugar de destilacion a nivel de logits (KD clasica), se apoya en el dataset longwriter-6k, que contiene muestras de generacion larga donde la senal relevante reside en la estructura de la traza de razonamiento (como el profesor plantea, reconsidera y resuelve), no en las probabilidades finales por token. Los datasets CoT de ecuaciones diferenciales y algebra lineal (0xZee) complementan el corpus con cadenas de razonamiento matematico. El autor menciona ademas una variante con pipeline topologico completo (TopologicalQwen: descomposicion BV, deteccion de saltos y ordenacion curricular), de la que este modelo es la version SFT directa, mas simple y rapida de entrenar.

## Capacidades

- Generacion de texto conversacional y de formato largo, con soporte de plantilla de chat (`apply_chat_template`).
- Razonamiento extendido: hereda del profesor la tendencia a deliberar antes de responder, con backtracking y reevaluacion de hipotesis.
- Razonamiento matematico y cientifico, reforzado por los datasets CoT de ecuaciones diferenciales y algebra lineal.
- Generacion de cadenas de pensamiento (thinking traces) de hasta 1.024-2.048 tokens segun la configuracion recomendada.
- Escritura long-form: el dataset longwriter-6k orienta el modelo hacia generaciones extensas y estructuradas.
- Compatibilidad con text-generation-inference y endpoints compatibles (segun tags del repositorio).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible de forma explicita; el razonamiento multi-paso se infiere del modo thinking, pero no esta documentado como capacidad de agente.
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Tutoria academica de matematicas: el modelo puede generar explicaciones paso a paso de ecuaciones diferenciales y algebra lineal, con trazas de razonamiento visibles, gracias al entrenamiento sobre los datasets CoT especificos. Adecuado para entornos educativos donde interesa mostrar el proceso, no solo el resultado.
- Generacion de documentacion tecnica long-form: con 40.960 tokens de ventana de posiciones y entrenamiento en longwriter-6k, puede redactar guias y manuales extensos manteniendo coherencia estructural a lo largo de secciones.
- Asistente de razonamiento en dispositivo (edge): con ~2,03B parametros en BF16 (8,1 GB de repo) es candidato a despliegue en GPU de consumo o estaciones de trabajo, permitiendo asistentes locales sin dependencia de la nube.
- Prototipado rapido de pipelines de razonamiento: su formato de chat estandar y su integracion con transformers permiten usarlo como baseline para comparar estrategias de prompting (temperatura 0,6-0,8, repetition penalty 1,1-1,2) antes de escalar a modelos mayores.
- Analisis de problemas con incertidumbre: el patron de deliberacion heredado del profesor lo hace util para tareas donde el modelo debe explorar varias hipotesis y descartarlas (diagnostico de fallos, analisis de causas raiz en textos tecnicos).
- Generacion de contenido educativo y divulgativo: la capacidad de escritura larga y el razonamiento estructurado permiten producir articulos o guiones con argumentacion encadenada, revisables por un humano antes de publicacion.
- Fine-tuning posterior: al estar bajo Apache 2.0 y con pesos safetensors, sirve como punto de partida para ajustes especificos de dominio en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 4-5 GB para pesos (2,03B parametros x 2 bytes), mas el coste de la cache KV, que con 28 capas, 8 cabezas KV y dimension de cabeza 128 resulta moderado; con contexto de 4.096 tokens el total se mantiene por debajo de 8 GB en configuraciones tipicas.
- GPU recomendadas: NVIDIA H100 (usada en entrenamiento), A100 para despliegues de produccion; tambien viable en RTX 4090 y RTX 3090.
- Cabe en GPU de consumo: si, previsiblemente en RTX 4090, RTX 3090, RTX 4080 y tarjetas con 8 GB o mas en BF16; en cuantizacion de 4 bits cabria en GPUs de 6 GB, aunque el autor no publica artefactos GGUF ni cuantizaciones oficiales.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference segun los tags del repositorio; vLLM, llama.cpp y Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-1.7B-Thinking-Distil | ~2,03B | 40.960 (entreno 4.096) | Apache 2.0 | Destilado SFT de Qwen3-30B-A3B-Thinking |
| Qwen3-1.7B (base) | ~1,7B | no disponible en esta ficha | Apache 2.0 (familia Qwen3) | Modelo original sin destilacion de razonamiento |
| TopologicalQwen | ~1,7B (familia DistilQwen) | no disponible | Apache 2.0 | Mismo autor; pipeline TKD completo, prioriza precision estructural |
| Qwen3-1.7B-Coder-Distilled-SFT | ~1,7B (familia DistilQwen) | no disponible | Apache 2.0 | Mismo autor; profesor Coder, prioriza descomposicion jerarquica |

La comparacion cuantitativa de rendimiento entre estas variantes no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de Qwen3, hereda los sesgos del corpus del profesor, no evaluados en esta ficha.
- Riesgo de alucinacion: presente como en cualquier modelo de 1,7B; el modo thinking puede producir cadenas de razonamiento plausibles pero incorrectas, especialmente en matematicas avanzadas.
- Bucles de razonamiento: el propio autor advierte que el modelo puede entrar en repeticiones durante generaciones largas y recomienda repetition penalty de 1,1-1,2.
- Contexto efectivo: aunque la ventana de posiciones es de 40.960 tokens, el entrenamiento se limito a 4.096; el rendimiento mas alla de ese umbral no esta validado.
- Idiomas: no se especifican los idiomas soportados, lo que impide garantizar calidad fuera del ingles (idioma predominante en los datasets citados).
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar la procedencia de los datasets de terceros (0xZee) si se redistribuye el modelo.
- Documentacion incompleta: la model card esta truncada en la seccion de metodologia y no incluye evaluaciones, lo que limita la confianza para produccion sin validacion propia.
- Capacidades de agente y tool calling no confirmadas: no deben asumirse sin pruebas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Thinking-Distil
- Modelo base: https://huggingface.co/reaperdoesntknow/Disctil-Qwen3-1.7B
- TopologicalQwen: https://huggingface.co/reaperdoesntknow/TopologicalQwen
- DiStil-Qwen3-1.7B-uncensored: https://huggingface.co/reaperdoesntknow/DiStil-Qwen3-1.7B-uncensored
- Qwen3-1.7B-Coder-Distilled-SFT: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Coder-Distilled-SFT
- DistilQwen3-1.7B-uncensored: https://huggingface.co/reaperdoesntknow/DistilQwen3-1.7B-uncensored
- Coleccion DistilQwen: https://huggingface.co/collections/reaperdoesntknow/distilqwen-69bf40ec669117e3f069ef1c
- Dataset longwriter-6k: https://huggingface.co/datasets/longwriter-6k
