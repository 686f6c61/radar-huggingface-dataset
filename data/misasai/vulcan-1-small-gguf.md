# MisasAI/Vulcan-1-small-GGUF

## Resumen

Vulcan-1-small-GGUF es un modelo de lenguaje de 2.516.756.480 parametros (aproximadamente 2,5B) especializado en codigo, razonamiento y matematicas, publicado por MisasAI bajo licencia Apache 2.0. No se trata de un modelo entrenado desde cero, sino de una seleccion artificial en espacio entero (Integer Space Artificial Selection) aplicada sobre CherryPit 1.2, un modelo base de 2B desarrollado por el equipo de DRUPEs. El resultado es un artefacto GGUF optimizado especificamente para la cuantizacion Q4_K_M, que segun el autor es la unica que funciona correctamente debido al metodo de construccion empleado.

La relevancia del modelo reside en su metodologia de produccion: fue generado y evaluado en una sola tarde, junto con otros treinta modelos, en un portatil con GPU de 6 GB de VRAM y sin cluster de entrenamiento. El autor describe la tecnica como una seleccion basada en datos que "extrae" el entrenamiento en lugar de anadir mas datos, apoyandose en parches y ejecuciones cortas de entrenamiento solo cuando la informacion no existia en el modelo base. El modelo se distribuye unicamente en formato GGUF y esta pensado para inferencia local en llama.cpp, LM Studio y Ollama.

El modelo esta etiquetado exclusivamente en ingles, con un contexto no declarado en la informacion disponible, y su model card advierte que no ha sido probado ni entrenado de forma exhaustiva tras la seleccion, por lo que puede presentar fallos puntuales. La version en safetensors esta anunciada como "proximamente" pero no disponible en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de CherryPit 1.2, base MiniCPM); detalles no disponibles |
| Parametros totales | 2.516.756.480 (aproximadamente 2,5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (unica funcional segun el autor); existieron Q8_0 y otras variantes, retiradas por ineficaces |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors anunciado como proximo, no disponible) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer heredado de CherryPit 1.2, modelo base de 2B de DRUPEs cuya genealogia se asocia a MiniCPM segun las etiquetas del repositorio. Sobre esa base, MisasAI aplico un proceso denominado Integer Space Artificial Selection: en lugar de un entrenamiento convencional, se generan y evaluan multiples variantes en espacio entero (directamente sobre cuantizaciones GGUF) y se selecciona la que mejor rinde en una liga de evaluacion interna. El autor describe el proceso como analogo a una seleccion evolutiva, donde se selecciona tanto el mejor entrenamiento como la mejor cuantizacion.

No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. El autor indica que la informacion ausente en el modelo base se anadio mediante parches y ejecuciones cortas de entrenamiento, unicamente para que pudiera ser seleccionada despues. La liga de seleccion se compuso con preguntas generadas por Claude, ChatGPT, DeepSeek y el propio autor, sin incluir preguntas de benchmarks oficiales, con el objetivo de evitar el sobreajuste a metricas publicas. La innovacion destacable no es arquitectonica sino metodologica: la produccion de un modelo competitivo en un portatil de 6 GB de VRAM sin ejecuciones de entrenamiento a gran escala.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento matematico con modo "thinking" activable, con hasta 24K tokens de razonamiento.
- Generacion y razonamiento sobre codigo, incluida la resolucion de problemas de programacion complejos.
- Razonamiento multi-paso orientado a tareas agenticas, segun la liga de seleccion interna.
- Conocimiento general y respuesta a preguntas.
- Compatibilidad con llama.cpp, LM Studio y Ollama, incluida la integracion via endpoints compatibles.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de vision ni audio.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Asistencia de programacion en local: el modelo puede generar y explicar codigo en un portatil con GPU de 6 GB de VRAM gracias a su cuantizacion Q4_K_M de 1,56 GB, lo que lo hace adecuado para entornos sin conexion o con requisitos de privacidad estrictos.
- Resolucion de problemas matematicos competitivos: su modo thinking con hasta 24K tokens permite abordar problemas de nivel AIME, util para herramientas educativas o de entrenamiento para olimpiadas.
- Prototipado rapido de agentes: la puntuacion en tareas agenticas dentro de la liga de seleccion sugiere su uso como nucleo de razonamiento en pipelines de agentes ligeros ejecutados en dispositivo.
- Integracion en Ollama o LM Studio para asistentes de escritorio: al distribuirse en GGUF y ser compatible con endpoints, puede desplegarse como servicio local de generacion de texto en herramientas de desarrollo.
- Evaluacion de metodologias de merge y cuantizacion: investigadores interesados en seleccion en espacio entero pueden usar el modelo como referencia reproducible de la tecnica descrita por el autor.
- Educacion y demostraciones de IA en hardware modesto: su tamano y requisitos permiten ejecutarlo en equipos de gama media para talleres o clases practicas sin infraestructura dedicada.
- Generacion de codigo en pipelines de CI/CD ligeros: aunque no se documenta tool calling, puede emplearse como paso de generacion o revision de parches en entornos con recursos limitados.

## Benchmarks y rendimiento

| Benchmark | Resultado | Configuracion | Notas |
|---|---|---|---|
| AIME 2025 | 21/30 (70,0%) | Thinking activado, hasta 24K tokens, temperatura 1.0, 1 muestra, Q8_0 | Medido sobre la exportacion BF16 previa en Q8_0, no sobre el archivo Q4_K_M actual; repeticion pendiente |
| AIME 2026 (run 1) | 23/30 (76,7%) | Thinking activado, hasta 24K tokens, temperatura 1.0, 1 muestra, Q4_K_M | Sin herramientas, con arnes de evaluacion |
| AIME 2026 (run 2) | 21/30 (70,0%) | Thinking activado, hasta 24K tokens, temperatura 1.0, 1 muestra, Q8_0 | Medido sobre la exportacion BF16 previa en Q8_0, no sobre el archivo actual; repeticion pendiente |

El autor indica que los benchmarks de codigo podrian publicarse mas adelante y que no se han ejecutado pruebas exhaustivas tras la seleccion. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB para el archivo Q4_K_M de 1,56 GB, incluyendo overhead de contexto y cache KV; el autor lo ejecuto en una GPU de 6 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM; el propio autor uso una GPU de 6 GB. No se especifican modelos concretos como RTX 4090, A100 o H100.
- Cabe en GPU consumer: si, en tarjetas de gama media y baja con 4-6 GB de VRAM.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama y endpoints compatibles.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Vulcan-1-small-GGUF | 2,5B | No disponible | Apache 2.0 | GGUF (Q4_K_M) | Especializado en codigo y matematicas; AIME 2026 76,7% en Q4_K_M |
| CherryPit 1.2 (base) | 2B | No disponible | No disponible en la informacion | No disponible | Modelo base del merge; sirvio de baseline en la liga de seleccion |
| Alternativas de 2-3B tipo Qwen o Llama | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se han publicado comparativas directas con modelos de la misma categoria en la informacion disponible.

## Limitaciones y advertencias

- El autor advierte que el modelo no ha sido probado ni entrenado de forma exhaustiva tras la seleccion y que puede presentar fallos, como la emision de secuencias de simbolos sin sentido en alguna ocasion.
- La cuantizacion distinta de Q4_K_M degrada el rendimiento de forma significativa; el autor indica que el modelo no se recuantiza correctamente y que Q4_K_M es la unica variante funcional.
- Los resultados de AIME 2025 y del run 2 de AIME 2026 se midieron sobre una exportacion BF16 en Q8_0 distinta del archivo publicado, por lo que no son directamente atribuibles al GGUF Q4_K_M actual.
- El modelo solo soporta ingles; no se documentan capacidades multilingues.
- No se documenta soporte de tool calling, vision ni audio.
- Riesgo de alucinacion no cuantificado; el autor reconoce que el modelo puede tener defectos no catalogados.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base CherryPit 1.2 podria tener condiciones adicionales no detalladas en la informacion disponible; conviene verificar la licencia del modelo base antes de un despliegue comercial.
- La metodologia de seleccion no esta publicada formalmente; el autor anuncia que la documentara mas adelante, lo que limita la reproducibilidad.
- La version en safetensors no esta disponible, lo que restringe el uso fuera del ecosistema GGUF.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MisasAI/Vulcan-1-small-GGUF
- Modelo base CherryPit 1.2: https://huggingface.co/DRUPEs/CherryPit-1.2-2B
- Seccion de analisis de Q4_K_M en la model card: https://huggingface.co/MisasAI/Vulcan-1-small-GGUF#analysis
- Matriz de importancia (imatrix): carpeta `imatrix/` dentro del repositorio
- No se han encontrado papers, blogs ni demos adicionales en la informacion proporcionada.
