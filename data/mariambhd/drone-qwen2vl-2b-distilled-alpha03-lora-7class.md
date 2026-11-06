# mariambhd/drone-qwen2vl-2b-distilled-alpha03-lora-7class

## Resumen

El modelo `mariambhd/drone-qwen2vl-2b-distilled-alpha03-lora-7class` es un adaptador LoRA sobre el modelo base multimodal Qwen2-VL-2B-Instruct, desarrollado por el usuario mariambhd. No se trata de un modelo completo, sino de un adaptador PEFT que debe cargarse junto con el modelo base para funcionar. Su propósito específico es el reconocimiento de acciones humanas en vídeo grabado desde drones, clasificando cada clip en una de siete categorías: atacar, golpear, patear, aplaudir, saludar con la mano, caminar y correr.

La relevancia técnica del modelo reside en su método de entrenamiento: destilación de conocimiento a nivel de respuesta (hard-label distillation) desde un modelo profesor más grande, Qwen2.5-VL-3B con su propio adaptador LoRA, hacia el modelo estudiante Qwen2-VL-2B. Esta técnica permite que un modelo de 2B parámetros aproxime el comportamiento de uno de 3B en una tarea concreta y acotada, con un coste de inferencia menor. El adaptador se entrenó con un valor de alpha de 0,3, lo que da un peso del 30% a la pérdida de destilación frente al 70% de la pérdida de entropía cruzada contra las etiquetas reales.

El modelo se publicó en noviembre de 2026 y, en el momento de redactar esta ficha, no cuenta con descargas ni interacciones en Hugging Face. Está pensado para pipelines de análisis de vídeo aéreo, vigilancia automatizada y estudio de comportamiento en espacios abiertos, siempre con las limitaciones propias de un adaptador de bajo rango entrenado sobre un conjunto de datos reducido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer multimodal Qwen2-VL (vision-language) |
| Parámetros totales | No disponible (el adaptador LoRA no declara su número de parámetros; el modelo base Qwen2-VL-2B-Instruct tiene 2B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base Qwen2-VL-2B-Instruct) |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors; el modelo base admite fp16, bf16 e int8/int4 vía herramientas externas) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2-VL-2B-Instruct, un transformer multimodal que procesa imágenes y vídeo mediante un codificador visual y un decodificador de lenguaje. El adaptador LoRA modifica las capas del modelo base con matrices de bajo rango, lo que permite especializarlo en la tarea de clasificación de acciones sin reentrenar los 2B parámetros completos. El entrenamiento se realizó en fp16 tanto para el profesor como para el estudiante.

La innovación principal es el esquema de destilación de conocimiento a nivel de respuesta. El modelo profesor es Qwen2.5-VL-3B con el adaptador `mariambhd/drone-qwen25vl-3b-lora-7class`, también en fp16. La función de pérdida combina la entropía cruzada contra las etiquetas reales y la entropía cruzada contra las etiquetas predichas por el profesor, ponderadas con alpha = 0,3: `loss = (1 - alpha) * CE(ground truth) + alpha * CE(teacher label)`. La mejor época según la pérdida de validación fue la primera, lo que sugiere un ajuste rápido y un posible sobreajuste posterior.

El conjunto de datos se dividió siguiendo el fold 3 de la validación cruzada del profesor (`fold_splits.json`): sujetos de entrenamiento [1, 2, 5, 6, 7, 9, 10], validación [3] y test [4, 8]. Los sujetos de test no fueron vistos por ninguno de los dos modelos. Cada clip se muestrea con 16 fotogramas para las clases hitting, clapping, walking y running, y con 8 fotogramas para kicking, attacking y waving, redimensionados a 448x252 píxeles.

## Capacidades

- Clasificación de acciones humanas en vídeo aéreo en siete clases cerradas: attacking, hitting, kicking, clapping, waving, walking y running.
- Procesamiento de secuencias de vídeo con muestreo variable de fotogramas (8 o 16 según la clase) y resolución fija de 448x252.
- Comprensión visual y de movimiento heredada del modelo base Qwen2-VL-2B-Instruct, incluyendo reconocimiento de escenas, objetos y personas.
- Generación de texto descriptivo o etiquetas a partir de la entrada visual, condicionada por el prompt de entrenamiento.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso específico para este adaptador.
- No se documentan capacidades multilingües específicas del adaptador; dependen del modelo base.
- No se documenta modo de pensamiento (thinking mode), audio ni otras modalidades adicionales.

## Casos de uso

- Vigilancia de espacios públicos mediante drones: el adaptador permite clasificar en tiempo real si las personas en el vídeo están caminando, corriendo, peleando o realizando gestos, lo que facilita la detección temprana de incidentes en plazas, parkings o recintos feriales.
- Análisis de comportamiento en eventos multitudinarios: con clips de 8 a 16 fotogramas y una resolución de 448x252, se puede procesar vídeo aéreo de manifestaciones o conciertos para estimar la proporción de personas que corren frente a las que caminan, indicador de posibles estampidas.
- Seguridad perimetral en instalaciones críticas: integrado en un pipeline con el modelo base Qwen2-VL-2B, el adaptador etiqueta secuencias de drones de vigilancia para alertar sobre conductas agresivas (attacking, hitting, kicking) y reducir falsos positivos de sistemas basados solo en movimiento.
- Investigación en ciencias del deporte y biomecánica: clasificación automática de acciones como correr, caminar o aplaudir en grabaciones aéreas de entrenamientos, útil para cuantificar la actividad física de grupos sin instrumentación individual.
- Monitorización de residencias y centros de cuidado: análisis de vídeo aéreo para detectar caídas o conductas anómalas (por ejemplo, golpear o patear) en zonas comunes, con la ventaja de que el adaptador es ligero y puede ejecutarse en hardware modesto.
- Etiquetado semiautomático de datasets de vídeo: el adaptador puede preanotar clips de drones con las siete clases, acelerando la construcción de corpus para entrenar modelos de reconocimiento de acciones más grandes o para validación humana.
- Docencia y demostraciones de destilación de conocimiento: al ser un adaptador pequeño con un profesor documentado, sirve como ejemplo reproducible de cómo transferir capacidades de un VLM de 3B a uno de 2B en una tarea de visión.

## Benchmarks y rendimiento

Resultados en el conjunto de test (sujetos [4, 8]), según la model card del autor:

| Modelo | Accuracy | Macro F1 | Weighted F1 |
|---|---|---|---|
| Profesor (Qwen2.5-VL-3B + LoRA) | 95,00% | 96,43% | 95,00% |
| Estudiante (Qwen2-VL-2B + este adaptador) | 80,00% | 69,63% | 77,48% |

El tiempo medio de inferencia es de 2,51 segundos por vídeo. El autor advierte que el conjunto de test es pequeño (2 sujetos), por lo que las diferencias no son estadísticamente fiables. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al cargar el modelo base Qwen2-VL-2B-Instruct en fp16 junto con el adaptador LoRA, se requieren aproximadamente 5-6 GB de VRAM; en cuantización int8, unos 3-4 GB; en int4, unos 2-3 GB (estimaciones orientativas, no confirmadas por el autor).
- GPU recomendadas: NVIDIA A100, H100 o L40S para despliegues de producción con lotes grandes; RTX 4090, RTX 3090 o RTX A6000 para desarrollo y pruebas.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060 Ti, RTX 3070) usando fp16 o cuantización.
- Opciones de despliegue: transformers con PEFT (el método documentado por el autor), vLLM (si soporta el adaptador LoRA para Qwen2-VL), TGI y llama.cpp (este último requiere convertir el modelo base y el adaptador a GGUF).
- Latencia y throughput: 2,51 segundos por vídeo en la configuración del autor (fp16, sin especificar GPU). No se dispone de datos de throughput por lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen2-VL-2B + LoRA) | 2B (base) + LoRA | No disponible | 80,00% accuracy, 69,63% Macro F1 | No disponible | Hugging Face |
| Profesor: Qwen2.5-VL-3B + LoRA `mariambhd/drone-qwen25vl-3b-lora-7class` | 3B (base) + LoRA | No disponible | 95,00% accuracy, 96,43% Macro F1 | No disponible | Hugging Face |
| Variante alpha07: `mariambhd/drone-qwen2vl-2b-distilled-alpha07-lora-7class` | 2B (base) + LoRA | No disponible | No disponible en la información proporcionada | No disponible | Hugging Face |
| Variante confidence-distilled: `mariambhd/drone-qwen2vl-2b-confidence-distilled` | 2B (base) + LoRA | No disponible | No disponible en la información proporcionada | No disponible | Hugging Face |

## Limitaciones y advertencias

- El adaptador está entrenado para siete clases cerradas; cualquier acción fuera de ese conjunto se clasificará erróneamente en una de las siete categorías.
- El conjunto de test es muy reducido (2 sujetos, 80% de accuracy), por lo que las métricas tienen alta varianza y no deben extrapolarse a poblaciones o entornos distintos sin validación adicional.
- La mejor época fue la primera, lo que sugiere que el modelo puede sobreajustar rápidamente; no se documenta regularización adicional ni técnicas de early stopping más allá de la selección por pérdida de validación.
- El adaptador requiere el prompt, el número de fotogramas y el redimensionado exactos usados en entrenamiento (448x252, 8 o 16 fotogramas según la clase); desviarse de esta configuración puede degradar el rendimiento de forma significativa.
- No se especifica la licencia, lo que impide confirmar si el uso comercial está permitido; se debe consultar al autor antes de desplegarlo en producción.
- No se documentan sesgos demográficos, pero al ser un modelo de reconocimiento de acciones entrenado con sujetos limitados, es probable que tenga sesgos hacia los tipos de cuerpo, vestimenta y condiciones de iluminación presentes en el conjunto de entrenamiento.
- Riesgo de alucinación: como modelo de lenguaje multimodal, puede generar descripciones plausibles pero incorrectas si se usa fuera del formato de clasificación para el que fue ajustado.
- El modelo base Qwen2-VL-2B-Instruct tiene sus propias limitaciones de contexto y idioma que este adaptador no corrige.
- La fecha de creación (noviembre de 2026) y la ausencia de descargas indican que es un modelo reciente y sin validación independiente por parte de la comunidad.

## Enlaces

- [Hugging Face: mariambhd/drone-qwen2vl-2b-distilled-alpha03-lora-7class](https://huggingface.co/mariambhd/drone-qwen2vl-2b-distilled-alpha03-lora-7class)
- [Variante alpha07](https://huggingface.co/mariambhd/drone-qwen2vl-2b-distilled-alpha07-lora-7class)
- [Variante confidence-distilled](https://huggingface.co/mariambhd/drone-qwen2vl-2b-confidence-distilled)
- [Modelo base: Qwen/Qwen2-VL-2B-Instruct](https://huggingface.co/Qwen/Qwen2-VL-2B-Instruct)
- [Adaptador del profesor: mariambhd/drone-qwen25vl-3b-lora-7class](https://huggingface.co/mariambhd/drone-qwen25vl-3b-lora-7class)
