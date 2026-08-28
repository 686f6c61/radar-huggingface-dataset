# mzoelfakar/Al-Khwarizmi-3B-GGUF

## Resumen

Al-Khwarizmi-3B-GGUF es una versión cuantizada en formato GGUF del modelo Al-Khwarizmi-3B, un fine-tune del modelo base HuggingFaceTB/SmolLM3-3B-Base desarrollado por Mohamed Zoelfakar. El modelo está especializado en la resolución de problemas matemáticos de nivel escolar (grade-school math) con razonamiento paso a paso, inspirado en el matemático persa Al-Khwarizmi, cuyo nombre dio origen a la palabra "algoritmo". Se entrenó sobre el conjunto de datos GSM8K de OpenAI, combinando una fase de fine-tuning completo con una fase posterior de LoRA, alcanzando una precisión media de token del 87,21 % en datos de validación.

Esta versión GGUF incluye dos cuantizaciones (BF16 y Q8_0) que permiten una ejecución eficiente en CPU y en GPUs con poca memoria, manteniendo una pérdida de precisión mínima. El modelo está pensado para uso conversacional y de tutoría matemática, y se distribuye bajo licencia Apache 2.0, lo que facilita su integración en aplicaciones educativas y de asistencia. Su relevancia actual radica en la creciente demanda de modelos pequeños, eficientes y especializados en dominios concretos, que puedan desplegarse en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (SmolLM3-3B-Base, decoder causal) |
| Parametros totales | 3.075.098.624 (3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el ejemplo de uso emplea n_ctx=2048) |
| Tipos de cuantizacion | BF16, Q8_0 |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (ficheros .gguf) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura SmolLM3-3B-Base, un transformer causal de 3.000 millones de parámetros desarrollado por Hugging Face, diseñado para ser eficiente en inferencia y adecuado para fine-tuning en tareas específicas. El entrenamiento se realizó en dos etapas:

1. **Fine-tuning completo** sobre 1.000 muestras aleatorias del subconjunto `main` de GSM8K (90/10 train/val), con 450 pasos (1 época), learning rate 5e-5 y schedule coseno. La pérdida final de validación fue 0,569 con una precisión de token del 84,75 %.

2. **Fine-tuning con LoRA** (r=16, módulos lineales completos) sobre el dataset GSM8K completo, incluyendo los estilos de razonamiento `main` y `socratic`, en dos pasadas consecutivas (3.550 pasos en total) con el mismo learning rate y schedule. La pérdida final de validación bajó a 0,462 y la precisión de token subió al 87,21 %.

No se emplearon técnicas de RLHF ni DPO; el entrenamiento es supervisado sobre ejemplos de razonamiento paso a paso. La pérdida de entrenamiento y validación se mantuvieron cercanas durante todo el proceso, lo que sugiere ausencia de overfitting.

## Capacidades

- Resolucion de problemas aritmeticos y de palabras de nivel escolar (tipo GSM8K) con razonamiento paso a paso.
- Generacion de explicaciones detalladas y didacticas para cada solucion.
- Soporte de conversacion multi-turno en ingles (formato chat).
- Generacion de texto libre, aunque con especializacion en matematicas.
- No incluye tool calling, ni capacidades de vision o audio.
- No se ha documentado soporte para agentes ni razonamiento multi-paso fuera del ambito matematico.

## Casos de uso

- **Tutor matematico personalizado**: el modelo puede guiar a estudiantes en la resolucion de problemas aritmeticos, ofreciendo pasos intermedios y explicaciones claras. Su entrenamiento en GSM8K lo hace especialmente adecuado para niveles de primaria y secundaria.
- **Asistente educativo integrado en plataformas LMS**: puede incorporarse en sistemas de gestion de aprendizaje para generar ejercicios resueltos, evaluar respuestas o proporcionar retroalimentacion automatica.
- **Generacion de contenido didactico**: permite crear fichas de problemas, soluciones comentadas y ejemplos razonados para libros de texto o materiales docentes.
- **Chatbot de apoyo al estudio**: al ser conversacional, puede mantener dialogos con estudiantes que necesitan ayuda con tareas de matematicas, aclarando dudas y reforzando conceptos.
- **Prototipado rapido de aplicaciones de IA educativa**: gracias a su tamano reducido y formato GGUF, es ideal para pruebas locales en entornos de desarrollo sin necesidad de GPUs potentes.
- **Despliegue en entornos con recursos limitados**: su cuantizacion Q8_0 permite ejecutarlo en CPUs convencionales o en GPUs de gama baja, habilitando soluciones de tutoria offline en escuelas o zonas sin conexion a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K completo, etc.) en la informacion disponible. La model card reporta metricas de validacion interna:

| Metrica | Valor |
|---|---|
| Precision media de token (validacion) | 87,21 % |
| Perdida de validacion final | 0,462 |
| Precision tras fine-tuning completo | 84,75 % |
| Precision en primer checkpoint | 82,4 % |

Estos datos corresponden a un subconjunto de validacion del propio dataset GSM8K y no son comparables directamente con benchmarks publicos.

## Requisitos de hardware

- **VRAM estimada**: para el fichero Q8_0 (~3 GB de pesos), se requieren aproximadamente 4 GB de VRAM para inferencia con contexto corto. Para el fichero BF16 (~6 GB), se necesitan unos 7-8 GB.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, etc.) puede ejecutar la version Q8_0. Para BF16 se recomienda una GPU con 8 GB (RTX 3070, RTX 4060, etc.).
- **Compatibilidad con consumer GPU**: si, cabe en GPUs de gama de entrada y media. Tambien se puede ejecutar en CPU pura, aunque con mayor latencia.
- **Opciones de despliegue**: compatible con llama.cpp, llama-cpp-python, Ollama y servidores TGI (text-generation-inference) que soporten GGUF. Tambien puede usarse con vLLM si se convierte a safetensors.
- **Latencia y throughput**: no se han publicado mediciones oficiales. En una CPU moderna se esperan decenas de tokens por segundo; en una GPU como RTX 3060, cientos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Al-Khwarizmi-3B (este) | 3B | No disponible | Matematicas escolares (GSM8K) | Apache 2.0 | GGUF y safetensors |
| SmolLM3-3B-Base | 3B | No disponible | Modelo base general | Apache 2.0 | Safetensors |
| Qwen2.5-3B | 3B | 32K | General, multilingue | Apache 2.0 | Safetensors, GGUF |

No se dispone de comparativas de rendimiento directas con estos modelos en tareas matematicas. La especializacion en GSM8K es la principal diferencia frente a modelos base generales.

## Limitaciones y advertencias

- **Dominio limitado**: entrenado principalmente en problemas de estilo GSM8K (respuesta numerica unica, aritmetica de nivel escolar). No se ha probado en problemas mas complejos, multi-parte o de estructura diferente.
- **Errores aritmeticos**: pueden ocurrir deslices en problemas de varios pasos, una limitacion conocida en modelos de este tamano.
- **Artefactos de formato**: las salidas crudas pueden contener marcadores como `<<...>>`, `**`, `#### <respuesta>` o `*` como signo de multiplicacion, que deben limpiarse antes de mostrar en interfaces de usuario.
- **Idioma**: solo soporta ingles; no se ha entrenado en otros idiomas.
- **Contexto limitado**: la longitud de contexto no esta documentada oficialmente; el ejemplo de uso emplea 2048 tokens, por lo que no es adecuado para tareas que requieran ventanas largas.
- **Licencia**: Apache 2.0 permite uso comercial sin restricciones, pero se recomienda revisar la licencia del modelo base (SmolLM3-3B-Base) para confirmar compatibilidad.

## Enlaces

- [Modelo GGUF en HuggingFace](https://huggingface.co/mzoelfakar/Al-Khwarizmi-3B-GGUF)
- [Modelo safetensors original](https://huggingface.co/mzoelfakar/Al-Khwarizmi-3B)
- [Perfil del autor en HuggingFace](https://huggingface.co/mzoelfakar)
- [Demo en Colab](https://colab.research.google.com/github/mzoelfakar/Al-Khwarizmi-3B/blob/main/Al-Khwarizmi-3B.ipynb)
