# reaperdoesntknow/MoA-400M

## Resumen

MoA-400M es un modelo de lenguaje causal de aproximadamente 400 millones de parámetros desarrollado por el usuario reaperdoesntknow, diseñado como experimento de investigación en arquitecturas de atención alternativas. En lugar del producto escalar clásico del transformer, emplea atención basada en métricas de distancia (L2, coseno, Mahalanobis diagonal) y una codificación posicional propia denominada BlackHoleRoPE, que rota Q/K con módulo unitario y modula la energía de V con un límite acotado. El modelo integra un bloque MoA (Mixture-of-Architectures) que combina cuatro rutas por capa: convolución local, atención métrica multi-cabeza, mezcla de canales y atención métrica multi-query.

Está pensado para ejecutarse en CPU con FP32 y es compatible con la librería Transformers. Su entrenamiento se realizó con presupuestos de tokens modestos (cientos de miles) sobre los datasets MATH-500 y Agentic-Long-Context-Understanding-QA, con longitudes de secuencia de 512 a 1024 tokens. El interés principal del modelo es investigar si la atención basada en distancias y la regularización geométrica pueden ofrecer ventajas de estabilidad y eficiencia de muestra frente a la atención por producto escalar, en un entorno de hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoA (Mixture-of-Architectures) con atencion metrica (L2, coseno, Mahalanobis diagonal) y BlackHoleRoPE |
| Parametros totales | ~400 M (depende del vocab, ver config.json) |
| Parametros activos | no disponible (no es un modelo MoE clasico; usa router token-wise sobre 4 rutas por bloque) |
| Longitud de contexto | Entrenado en 512-1024 tokens; config permite hasta 2048 |
| Tipos de cuantizacion | No se especifican; precisiones soportadas: FP32 (entrenamiento e inferencia), BF16, FP16 (inferencia) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (declarado en la model card; no confirmado en la metadata de HuggingFace) |
| Formato de pesos | no especificado (probablemente safetensors, cargable con Transformers) |

## Arquitectura y entrenamiento

El modelo se compone de 12 a 24 capas MoA (segun la variante) con hidden size mayor o igual a 1024 en la version de 400M. Cada bloque MoA contiene un router token-wise que asigna pesos suaves entre cuatro rutas: LocalConv (convolucion depthwise), MetricMHAttention (atencion multi-cabeza con puntuaciones basadas en distancia), ChannelMix (MLP) y MetricMQA (atencion multi-query con K/V compartidos). Las puntuaciones de atencion metrica usan L2, coseno o Mahalanobis diagonal, escaladas por un parametro aprendible alfa y con una mascara de radio opcional para eficiencia. El camino de valores incluye proyectores Up/Down con puerta.

BlackHoleRoPE aplica rotacion unitaria a Q/K (preservando normas) y modula V con amplificacion de energia acotada (energy_min..energy_max), con parametros sintetizados a partir de una base de Fourier para reducir cache y mejorar la extrapolacion de longitud. Se anade un regularizador de desigualdad triangular (TI) que penaliza violaciones en triples aleatorios para mantener una geometria metrica coherente.

El entrenamiento se realizo en CPU con FP32, optimizador AdamW (beta1=0.9, beta2=0.95-0.999), batch de 2-4 y secuencias de 512-1024 tokens. Los datasets usados son Agentic-Long-Context-Understanding-QA (~256000 tokens) y MATH-500 (~256000 tokens). No se menciona uso de RLHF, DPO ni otras tecnicas de alineacion. Los logs de entrenamiento reportan descenso saludable de perdida en CPU, pero no se publican metricas exactas.

## Capacidades

- Generacion de texto conversacional: el modelo puede producir respuestas coherentes en formato de dialogo, como se muestra en el ejemplo de uso con pipeline.
- Razonamiento matematico paso a paso: entrenado con MATH-500, puede resolver problemas aritmeticos y algebraicos simples mostrando el razonamiento.
- Lectura de contexto largo: entrenado con preguntas de comprension de contexto largo (Agentic-Long-Context), puede manejar secuencias de hasta 2048 tokens en configuracion.
- Investigacion en atencion geometrica: permite estudiar el comportamiento de atencion basada en distancias y regularizacion TI.
- Ejecucion en CPU: disenado para funcionar en FP32 en maquinas con AVX2/AVX-512, sin necesidad de GPU.
- No se mencionan capacidades de tool calling, agentes multi-paso, vision, audio ni otras modalidades.

## Casos de uso

- Asistente conversacional ligero en entornos sin GPU: el modelo puede desplegarse en servidores CPU o incluso en portatiles para generar respuestas a preguntas sencillas, gracias a su tamano compacto y su diseno CPU-friendly.
- Comprension de documentos largos en recursos limitados: con su contexto de hasta 2048 tokens, puede responder preguntas sobre articulos o informes extensos sin necesidad de truncar, en escenarios donde no se dispone de aceleracion por hardware.
- Razonamiento matematico educativo: puede utilizarse como generador de explicaciones paso a paso para problemas de algebra o aritmetica, util en aplicaciones de tutoria automatizada.
- Prototipado de arquitecturas alternativas: investigadores pueden usar este modelo como referencia para comparar atencion metrica frente a atencion por producto escalar en tareas de generacion de texto.
- Pruebas de concepto en entornos embebidos: al ser compatible con Transformers y ejecutarse en FP32, puede integrarse en sistemas con restricciones de memoria o energia, como dispositivos IoT o routers.
- Validacion de regularizacion geometrica: permite experimentar con el regularizador de desigualdad triangular y observar su efecto en la estabilidad del entrenamiento y la calidad de las representaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que los logs de entrenamiento mostraron descenso de perdida saludable en CPU, pero no se proporcionan metricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en modo CPU; en GPU, el modelo de 400M en FP32 ocuparia aproximadamente 1.6 GB, en BF16/FP16 unos 0.8 GB (estimacion basada en el numero de parametros, no confirmada por el autor).
- GPU recomendadas: no se especifican; el modelo esta disenado para CPU (AVX2/AVX-512 recomendado). Cualquier GPU moderna con al menos 2 GB de VRAM podria ejecutarlo, pero no es el objetivo del diseno.
- Si cabe en consumer GPU: si, cualquier GPU con 2 GB o mas (por ejemplo GTX 1650, RTX 3050) podria cargar el modelo en FP16, aunque el autor recomienda CPU.
- Opciones de despliegue: Transformers (AutoModelForCausalLM, pipeline), con soporte para device_map="cpu" o "cuda". No se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles. En CPU, depende de la maquina; con AVX-512 y 400M de parametros, la generacion de tokens deberia ser de unos pocos tokens por segundo, pero no hay datos publicados.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la informacion proporcionada. Dado su caracter experimental y su arquitectura no estandar, no se dispone de alternativas directas de la misma categoria.

## Limitaciones y advertencias

- Sesgos conocidos: no se han evaluado sesgos; el entrenamiento con datasets pequenos y limitados (MATH-500, Agentic-Long-Context) puede introducir sesgos no documentados.
- Riesgo de alucinacion: alto, especialmente en tareas factuales fuera del ambito de entrenamiento. La model card advierte explicitamente que no es adecuado para "heavy factual QA at web scale" ni para dominios que requieran precision garantizada.
- Limitaciones de contexto: entrenado en 512-1024 tokens; aunque BlackHoleRoPE es extrapolable, la calidad mas alla de 2048 tokens no esta garantizada y el rendimiento puede degradarse.
- Limitaciones de idioma: no se especifican idiomas soportados; probablemente el modelo solo funciona bien en ingles, dado el dataset MATH-500 (ingles) y la ausencia de informacion multilingue.
- Restricciones de licencia: la model card declara Apache-2.0, pero la metadata de HuggingFace no confirma la licencia; esto podria generar incertidumbre legal para uso comercial.
- Caveats de produccion: el modelo no debe usarse en sistemas de seguridad critica, atencion medica, legal o financiera. Requiere evaluacion cuidadosa antes de cualquier despliegue.
- Problemas tecnicos conocidos: la model card advierte sobre posibles NaN/Inf durante el muestreo si las mascaras no son aditivas (0/-inf) o si no se establece pad_token_id en generate().

## Enlaces

- HuggingFace: https://huggingface.co/reaperdoesntknow/MoA-400M
- No se han encontrado otros enlaces (papers, blogs, repos) en la informacion proporcionada.
