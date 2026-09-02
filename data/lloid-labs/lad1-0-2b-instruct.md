# lloid-labs/Lad1-0.2B-Instruct

## Resumen

Lad1-0.2B-Instruct es un modelo de lenguaje causal de 235 millones de parámetros desarrollado por lloid-labs, un laboratorio dedicado a la IA de código abierto. Se trata de un modelo compacto diseñado para el seguimiento de instrucciones, la generación conversacional y la experimentación con modelos pequeños. Su arquitectura es un Transformer personalizado con atención por grupos de consultas (GQA), normalización RMSNorm, capas feed-forward con activación SiLU y posiciones sinusoidales.

El modelo fue preentrenado desde cero sobre aproximadamente 1.200 millones de tokens del corpus FineWeb-Edu y posteriormente ajustado con supervisión (SFT) sobre una versión filtrada de SmolTalk. Su ventana de contexto es de 512 tokens y su tokenizador es el de GPT-2, con un vocabulario de 50.257 términos. Lad1-0.2B-Instruct se distribuye bajo licencia Apache-2.0 y está pensado para entornos con recursos limitados, investigación académica y prototipado rápido, aunque no está optimizado para tareas de matemáticas, código o llamadas a herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con Grouped Query Attention (GQA), RMSNorm, SiLU y posiciones sinusoidales |
| Parametros totales | 235M |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible (no se mencionan cuantizaciones oficiales) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | checkpoint.pt (PyTorch) |

## Arquitectura y entrenamiento

Lad1-0.2B-Instruct emplea una arquitectura Transformer personalizada con 12 capas, tamaño oculto de 1024, 16 cabezas de atencion y 4 cabezas clave/valor (GQA). La normalizacion es RMSNorm, la activacion de las capas feed-forward es SiLU con un ratio MLP de 4, y las posiciones se codifican de forma sinusoidal. El tokenizador es el de GPT-2, con un vocabulario de 50.257 tokens.

El entrenamiento se realizo en dos fases. Primero, un preentrenamiento desde cero sobre el conjunto HuggingFaceFW/fineweb-edu (configuracion sample-10BT) con aproximadamente 1.200 millones de tokens, 36.000 pasos, tasa de aprendizaje 3e-4, batch efectivo de 64, secuencia de 512 tokens y precision mixta FP16. Posteriormente, se aplico un ajuste fino completo por SFT sobre SmolTalk, excluyendo deliberadamente los subconjuntos relacionados con funciones (apigen-80k), matematicas (metamathqa-50k y numina-cot-100k) y codigo (self-oss-instruct), porque el modelo base no habia visto esos dominios durante el preentrenamiento.

## Capacidades

- Generacion de texto y respuesta a instrucciones en ingles.
- Mantenimiento de conversaciones multi-turno simples, siempre que el contexto no supere los 512 tokens.
- Seguimiento de instrucciones generales de formato y redaccion.
- Adecuado para experimentacion con modelos pequenos, estudios de scaling y fines educativos.
- No soporta tool calling, function calling, razonamiento matematico ni generacion de codigo, ya que esos conjuntos fueron excluidos del ajuste.
- No incluye capacidades multimodales ni soporte de vision o audio.
- No se proporciona chat_template; las conversaciones deben formatearse manualmente segun la estructura de datos SFT utilizada.

## Casos de uso

- Educacion e investigacion en IA: sirve como ejemplo de entrenamiento desde cero y ajuste fino de un modelo pequeno; puede usarse en cursos para ilustrar arquitecturas GQA y tecnicas de SFT.
- Prototipado rapido de asistentes conversacionales simples: permite validar flujos de generacion de texto antes de escalar a modelos mayores, gracias a su bajo coste computacional.
- Generacion de respuestas cortas en aplicaciones de demostracion: util para demos de chatbots o generadores de texto con restricciones de contexto minimas.
- Analisis de comportamiento de modelos pequenos: investigacion sobre alucinaciones, repeticiones o limitaciones de modelos sub-1B en tareas de lenguaje.
- Filtrado y clasificacion de texto simple: puede adaptarse con un cabezal de clasificacion para tareas de etiquetado basico, aunque su rendimiento sera limitado.
- Benchmarking de eficiencia: evaluacion de latencia y consumo de recursos en hardware de gama baja o embebido, dado su tamano reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con precision FP16, el modelo ocupa aproximadamente 470 MB de pesos, mas overhead de activaciones; con cuantizacion a int8 cabria en unos 235 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o incluso integradas con suficiente memoria compartida) puede ejecutarlo. Tambien puede correr en CPU con latencia moderada.
- No requiere hardware especializado; es viable en Raspberry Pi de gama alta o dispositivos edge con suficiente RAM.
- Opciones de despliegue: al ser una arquitectura personalizada, no es compatible directamente con AutoModelForCausalLM de transformers; requiere cargar el checkpoint con PyTorch manual y definir la clase del modelo. No se mencionan adaptaciones para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles, pero dado el tamano, en una GPU moderna se esperan decenas de tokens por segundo; en CPU, varios tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lad1-0.2B-Instruct | 235M | 512 | Apache-2.0 | PyTorch | Arquitectura personalizada, solo ingles |
| SmolLM2-135M | 135M | 2048 | Apache-2.0 | safetensors | Soporte nativo en transformers, multi-idioma |
| Qwen2-0.5B | 500M | 32768 | Apache-2.0 | safetensors | Mejor soporte de herramientas y contexto largo |
| TinyLlama-1.1B | 1.1B | 2048 | Apache-2.0 | safetensors | Mas parametros, pero mayor coste |

No se dispone de resultados de benchmarks comparativos. La comparativa se basa en caracteristicas tecnicas publicas.

## Limitaciones y advertencias

- Contexto muy corto de 512 tokens, lo que impide manejar documentos largos o conversaciones extensas.
- No esta optimizado para matematicas, codigo, razonamiento logico complejo ni llamadas a funciones; puede producir respuestas incorrectas o incoherentes en esos dominios.
- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- Al ser un modelo pequeno, es propenso a alucinaciones, repeticiones y salidas sin sentido, como se advierte en la model card.
- No se proporciona chat_template, lo que dificulta su integracion directa en pipelines de transformers; requiere formateo manual de las conversaciones.
- La arquitectura personalizada impide usar herramientas estandar de inferencia (vLLM, TGI, llama.cpp) sin adaptacion previa.
- No debe utilizarse como fuente unica de informacion en aplicaciones de alto riesgo.
- El tamano del repositorio (60.3 GB) sugiere que puede contener checkpoints adicionales o archivos de gran tamano, aunque el modelo en si es de 235M.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/lloid-labs/Lad1-0.2B-Instruct)
- [Perfil de lloid-labs en Hugging Face](https://huggingface.co/lloid-labs)
- [Modelo hermano LAD1-0.1B](https://huggingface.co/lloid-labs/LAD1-0.1B)
