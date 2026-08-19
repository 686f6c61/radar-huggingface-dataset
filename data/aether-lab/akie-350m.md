# AETHER-LAB/akie-350m

## Resumen

AKIE (Adaptive Knowledge and Intelligence Engine) es un modelo de lenguaje de 350 millones de parámetros desarrollado por AETHER Lab, el brazo de investigación de AETHER OS, y presentado como el primer ePLM (Evolutionary Personal LLM) brasileño. El proyecto nace con la filosofía de ofrecer una alternativa real a los grandes laboratorios, construida por una sola persona con recursos limitados. El modelo está entrenado desde cero, con arquitectura, tokenizador y embeddings propios, sin partir de ningún modelo de terceros.

El checkpoint publicado corresponde al preentrenamiento puro (step 63989), sin ajuste supervisado (SFT), por lo que el modelo completa texto pero no sigue instrucciones de forma fiable. Está pensado para ser la base del asistente conversacional NEXUS de AETHER OS, aunque la versión con SFT aún no se ha publicado. Con 4096 tokens de contexto y un corpus de aproximadamente 6 mil millones de tokens en portugués de Brasil y código, AKIE representa un esfuerzo significativo en el ámbito de los modelos de lenguaje en portugués.

La relevancia de este modelo radica en su carácter independiente y su enfoque en el portugués brasileño, un idioma con poca representación en el ecosistema de modelos abiertos. Aunque su tamaño es modesto, su arquitectura Llama-style y su entrenamiento desde cero lo convierten en un objeto de estudio interesante para quienes investigan preentrenamiento de modelos pequeños en lenguas de baja representación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-style (RMSNorm, SwiGLU, RoPE, embeddings compartidas) |
| Parametros totales | 366.795.776 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Portugues de Brasil (pt) y codigo |
| Licencia | unknown (desconocida) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

AKIE sigue una arquitectura transformer estilo Llama con 26 capas, dimensión oculta de 1024 y 16 cabezas de atención. Utiliza normalización RMSNorm, activación SwiGLU y embeddings posicionales rotatorios (RoPE), con embeddings de entrada y salida compartidas. El modelo fue entrenado desde cero con un tokenizador propio, sin partir de pesos preexistentes.

El corpus de preentrenamiento consta de aproximadamente 6 mil millones de tokens distribuidos en cuatro ejes: código, razonamiento, instrucciones y diálogo, además de conocimiento factual, todo en portugués de Brasil y código. El preentrenamiento se realizó en una sola época, completando 63.989 pasos con una pérdida final en validación (held-out fijo) de 1,6064. No se aplicó SFT ni RLHF en este checkpoint; el ajuste supervisado está en curso y aún no se ha publicado. La model card indica que los pilotos exploratorios de SFT muestran señales prometedoras para capacidades como seguir instrucciones, razonar en modo `thinking` y usar herramientas, pero estas capacidades no están presentes en el checkpoint actual.

## Capacidades

- Generacion de texto en portugues de Brasil: el modelo completa texto de forma autoregresiva, siendo capaz de producir continuaciones coherentes en su idioma principal.
- Procesamiento de codigo: al incluir codigo en el corpus, puede generar fragmentos de codigo, aunque sin garantias de correccion sintactica o semantica.
- Razonamiento basico: como modelo base preentrenado, exhibe cierta capacidad de asociacion estadistica, pero sin entrenamiento en instrucciones no puede seguir comandos ni mantener dialogos estructurados.
- No soporta tool calling ni function calling: al no haber pasado por SFT, carece de la capacidad de invocar herramientas externas.
- No soporta agentes ni razonamiento multi-paso: estas capacidades son objetivos del proyecto, no funcionalidades del checkpoint publicado.
- No tiene capacidades de vision ni audio: es exclusivamente un modelo de texto.
- Multilingue limitado: aunque el corpus es principalmente portugues, puede generar algo de codigo, pero no se ha entrenado para otros idiomas.

## Casos de uso

- Base para fine-tuning en tareas especificas en portugues: al ser un modelo base, puede servir como punto de partida para ajuste supervisado en tareas como clasificacion de texto, extraccion de informacion o generacion de respuestas en portugues brasileño, aprovechando su conocimiento del idioma.
- Generacion de texto libre en portugues: puede utilizarse para completar textos, redactar borradores o generar contenido creativo en portugues, siempre que se acepte que no sigue instrucciones y que la calidad puede ser variable.
- Investigacion academica sobre preentrenamiento de modelos pequeños: su arquitectura Llama-style y su entrenamiento desde cero lo convierten en un caso de estudio util para analizar el comportamiento de modelos de 350M en un corpus limitado a un idioma especifico.
- Experimentacion con tecnicas de SFT y alineacion: al estar publicado sin SFT, permite a investigadores aplicar sus propias estrategias de ajuste y comparar resultados con otros modelos base.
- Prototipado de asistentes conversacionales en portugues: aunque el checkpoint actual no es apto para produccion, puede servir para experimentar con pipelines de SFT y evaluar la viabilidad de un asistente basado en este modelo.
- Educacion y divulgacion: su tamaño reducido y su licencia abierta (aunque desconocida) permiten su uso en entornos educativos para ensenar conceptos de modelos de lenguaje, tokenizacion y preentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones estandar como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. El unico dato de rendimiento reportado es la perdida de validacion (1,6064) durante el preentrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: con 366 millones de parametros, el modelo en precision fp32 ocupa aproximadamente 1,4 GB, y en fp16 unos 0,7 GB. Con cuantizacion a 8 bits o 4 bits (no publicada), el uso de VRAM podria reducirse a menos de 500 MB, aunque no se han proporcionado archivos cuantizados.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM puede ejecutar el modelo sin problemas. Tarjetas como NVIDIA GTX 1660, RTX 2060, RTX 3060 o superiores son suficientes. Incluso podria ejecutarse en CPU con suficiente RAM.
- Opciones de despliegue: al ser un modelo de tamano modesto, es compatible con frameworks como llama.cpp, vLLM, Hugging Face Transformers y Ollama, aunque no se han publicado archivos GGUF ni configuraciones especificas.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna, se espera una generacion rapida (del orden de decenas de tokens por segundo), pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa directa con otros modelos de la misma categoria (350M, portugues, preentrenamiento desde cero). Existen modelos brasileños como PTT5 (T5 en portugues) o modelos multilingues como XLM-R, pero no comparten arquitectura ni filosofia de entrenamiento. La model card no menciona comparaciones con alternativas. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Checkpoint de preentrenamiento sin SFT: el modelo no sigue instrucciones, no mantiene dialogos coherentes y no debe tratarse como un asistente funcional.
- Licencia desconocida: la etiqueta `license: unknown` implica que no se han definido los terminos de uso. Esto impide su uso comercial sin una aclaracion previa por parte del autor.
- Idioma limitado: solo portugues de Brasil y codigo. No es adecuado para otros idiomas.
- Contexto corto: 4096 tokens puede ser insuficiente para tareas que requieran contexto largo, como analisis de documentos extensos.
- Riesgo de alucinacion: al ser un modelo base, puede generar contenido falso o inventado con alta fluidez, sin capacidad de verificar hechos.
- Sesgos potenciales: el corpus de entrenamiento, aunque no se detalla su composicion, puede reflejar sesgos presentes en los datos de origen, especialmente en conocimiento factual y razonamiento.
- Proyecto en desarrollo: el modelo esta en una fase temprana (sin SFT) y el autor advierte que las capacidades descritas en la filosofia del proyecto no se corresponden con lo que este checkpoint entrega.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AETHER-LAB/akie-350m
- Perfil de AETHER Lab en Hugging Face: https://huggingface.co/AETHER-LAB
- Sitio web de AETHER OS: https://aetheros.com.br
- Asistente NEXUS (referencia): https://agente.aetheros.com.br
