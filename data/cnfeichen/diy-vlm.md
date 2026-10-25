# cnfeichen/Diy-VLM

## Resumen
Diy-VLM es un modelo visual-lenguaje mínimo publicado por cnfeichen en HuggingFace, concebido como material didáctico para construir y entrenar un pipeline VLM completo desde cero. Combina un codificador ViT, un proyector MLP de dos capas al estilo LLaVA y un modelo de lenguaje RoPE-GPT de dos capas; el conjunto tiene 183.406 parámetros entrenables y un vocabulario de 36 tokens. No es un modelo general: está diseñado para tareas de VQA y descripción de imágenes de dígitos manuscritos MNIST.

Su relevancia es docente y reproducible: el autor indica que las cuatro fases de entrenamiento se completan en CPU en unos 10 minutos, con resultados de 88,6 % en VQA y 89,7 % en descripción sobre las primeras 1.000 imágenes del conjunto de test de MNIST. La longitud de contexto no se documenta y no se declaran idiomas ni capacidades generales. La licencia es MIT según la model card, aunque la metadata de HuggingFace no la declara.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | ViT (codificador visual) + proyector MLP de 2 capas + LLM RoPE-GPT de 2 capas |
| Parametros totales | 183.406 entrenables; 185.518 elementos en `state_dict` incluyendo buffers de posición y RoPE |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; no se documentan variantes cuantizadas |
| Idiomas soportados | no disponible; vocabulario de 36 tokens específico del proyecto |
| Licencia | MIT (según model card; no declarada en la metadata de HuggingFace) |
| Formato de pesos | checkpoint PyTorch `.pt` con `state_dict` y vocabulario `stoi.json` |

## Arquitectura y entrenamiento
La arquitectura sigue un esquema LLaVA simplificado: un ViT de 70.858 parámetros procesa la imagen, un proyector MLP de dos capas y 8.320 parámetros traduce las características visuales al espacio del modelo de lenguaje, y un RoPE-GPT de dos capas y 104.228 parámetros genera la respuesta. El vocabulario es de 36 tokens y la tokenización es a nivel de carácter, definida en `stoi.json`; el `state_dict` incluye 2.112 elementos adicionales de buffers de codificación posicional (1.088 del ViT y 2×512 de RoPE cos/sin).

El entrenamiento se organiza en cuatro etapas: 0a) preentrenamiento de clasificación del ViT, con 95,2 % de accuracy; 0b) preentrenamiento del LLM con plantillas; 1) congelación de ViT y LLM y entrenamiento únicamente del proyector de 8.320 parámetros, con pérdida de 0,795 a 0,242; y 2) descongelación del LLM y ajuste fino con una mezcla VQA:descripción de 2:1, con pérdida de 0,235 a 0,064. No se documentan número de tokens, composición completa del dataset, RLHF ni DPO; los datos proceden de MNIST y de las tareas VQA/descripción definidas por el autor.

## Capacidades
- Respuesta a preguntas visuales (VQA) sobre imágenes de dígitos manuscritos MNIST, con una exactitud reportada del 88,6 % en las primeras 1.000 imágenes de test.
- Generación de descripciones de imágenes MNIST, con una exactitud reportada del 89,7 % en la misma condición de evaluación.
- Procesamiento de imágenes mediante un codificador ViT y proyección al espacio del LLM; no se documenta soporte para imágenes fuera del dominio MNIST.
- Generación de texto restringida a un vocabulario de 36 tokens y tokenización por carácter.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües; el vocabulario está limitado al proyecto.
- No se documentan modos de razonamiento explícito, visión general, audio ni otras modalidades.

## Casos de uso
- Docencia de pipelines VLM: el modelo permite recorrer las cuatro etapas de entrenamiento en una sola sesión de laboratorio, porque el autor reporta unos 10 minutos en CPU para completarlas.
- Práctica de congelación y descongelación de módulos: se puede entrenar solo el proyector de 8.320 parámetros y observar la evolución de la pérdida de 0,795 a 0,242, lo que ilustra el alineamiento visión-lenguaje.
- Baseline reproducible para VQA de dígitos: sirve como referencia mínima con 88,6 % de exactitud en VQA y 89,7 % en descripción sobre 1.000 imágenes de MNIST, útil para comparar variaciones del código.
- Evaluación de harnesses de inferencia: al ser un checkpoint PyTorch pequeño con vocabulario JSON, permite probar carga de pesos, tokenización y generación sin GPU dedicada.
- Experimentos de tokenización por carácter: su vocabulario de 36 tokens facilita modificar el conjunto de símbolos y estudiar el efecto en las tareas de VQA y descripción.
- Demostraciones offline en aula: la inferencia y el entrenamiento caben en un portátil convencional, lo que permite explicar un VLM sin depender de infraestructura externa.
- Reproducción de recetas de entrenamiento: las etapas 0a, 0b, 1 y 2 documentadas por el autor sirven para practicar la organización de un entrenamiento multimodal por fases.

## Benchmarks y rendimiento
| Benchmark | Condición | Resultado |
|---|---|---|
| VQA accuracy | MNIST test, primeras 1.000 imágenes | 88,6 % |
| Image caption accuracy | MNIST test, primeras 1.000 imágenes | 89,7 % |
| Clasificación ViT (etapa 0a) | Preentrenamiento del codificador | 95,2 % |
| Pérdida etapa 1 | ViT y LLM congelados, solo proyector | 0,795 → 0,242 |
| Pérdida etapa 2 | LLM descongelado, mezcla VQA:descripción 2:1 | 0,235 → 0,064 |

No se han publicado resultados comparativos con otros modelos en la información disponible. Las métricas anteriores corresponden únicamente al dominio MNIST y a la evaluación descrita por el autor.

## Requisitos de hardware
- Entrenamiento: CPU, con aproximadamente 10 minutos para las cuatro etapas según el autor.
- Inferencia: CPU; no se documenta necesidad de GPU.
- VRAM estimada: no disponible; por el tamaño del modelo, si los pesos se almacenan en FP32 ocuparían del orden de 0,73 MB, sin contar activaciones ni framework.
- GPU recomendadas: no se documentan; el tamaño hace innecesaria una GPU dedicada para inferencia o entrenamiento.
- Cabe en GPU consumer: sí por tamaño, aunque no se publican medidas de VRAM ni pruebas en GPU concretas.
- Opciones de despliegue: código PyTorch personalizado (`mini_vlm.py`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Diy-VLM | 183.406 | no disponible | MIT | HuggingFace y GitHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

No se han proporcionado datos de otros VLM mínimos didácticos comparables, por lo que no se establece una comparación cuantitativa de rendimiento, contexto o licencia.

## Limitaciones y advertencias
- Dominio restringido a MNIST: el modelo no tiene capacidades generales de visión-lenguaje y no debe usarse con imágenes fuera de ese dominio.
- Vocabulario de 36 tokens y tokenización por carácter: no puede manejar texto abierto ni vocabulario general.
- No se declaran idiomas soportados; el vocabulario está definido por el proyecto y no se documenta multilingüismo.
- Riesgo de alucinación en descripciones y respuestas VQA, especialmente fuera de las condiciones de evaluación reportadas.
- No se documentan RLHF, DPO ni mecanismos de alineación o seguridad.
- La licencia MIT se indica en la model card, pero no está declarada en la metadata de HuggingFace; conviene verificar los archivos antes de un uso comercial.
- El repositorio de HuggingFace figura con un tamaño de 0,0 GB y sin descargas ni likes, por lo que la disponibilidad efectiva de los pesos no se puede verificar desde los metadatos.
- No es apto para producción: es una demostración didáctica sin endurecimiento, filtros de seguridad ni garantías de latencia.
- La longitud de contexto no está documentada; no debe asumirse soporte para conversaciones o contextos largos.
- Los benchmarks se limitan a las primeras 1.000 imágenes de test de MNIST y no permiten extrapolar rendimiento a otros datasets.

## Enlaces
- HuggingFace: https://huggingface.co/cnfeichen/Diy-VLM
- GitHub: https://github.com/vicfei/Diy-VLM
- Paper, blog y demo: no disponibles en la información proporcionada.
