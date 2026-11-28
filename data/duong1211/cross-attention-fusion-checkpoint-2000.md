# Duong1211/cross-attention-fusion-checkpoint-2000

## Resumen

El modelo `Duong1211/cross-attention-fusion-checkpoint-2000` es un adaptador LoRA y un proyector de fusión entrenados para una tarea muy concreta: la detección de imágenes generadas por IA con justificación textual. No se trata de un modelo de lenguaje generalista, sino de un componente de un sistema multimodal mayor que combina un codificador visual CLIP (ViT), un experto visual NPR y un modelo de lenguaje LLaVA-NeXT con backbone Mistral 7B. El checkpoint publicado contiene únicamente los pesos entrenables de esa arquitectura compuesta, no el modelo completo.

Lo desarrolla el usuario Duong1211 y se apoya en el dataset AIGI-Holmes, del que se emplearon 8.000 imágenes reales y 8.000 generadas por IA para el entrenamiento. La innovación principal es una puerta de cross-attention aprendida que fusiona las características del ViT de CLIP con las del experto NPR antes de condicionar al modelo de lenguaje, de modo que este emite un veredicto ("real" o "generada por IA") acompañado de una explicación breve en inglés.

Su relevancia es limitada y experimental: el repositorio no registra descargas, la model card reconoce que la precisión en imágenes no vistas y la fiabilidad de las explicaciones no se han medido, y el checkpoint requiere un runtime personalizado del proyecto para cargarse. Es, por tanto, un artefacto de investigación reproducible más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema multimodal compuesto: CLIP ViT + experto visual NPR, fusionados mediante cross-attention con puerta aprendida, que condicionan un LLaVA-NeXT con backbone Mistral 7B; el checkpoint contiene un proyector de fusión y adaptadores LoRA |
| Parametros totales | no disponible (el repo ocupa 2,3 GB; el backbone Mistral 7B se carga por separado en 4 bits) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | el modelo de lenguaje se entrenó en 4 bits; no se documentan otras cuantizaciones publicadas |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (proyector de fusión y adaptador LoRA, rango 64) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline multimodal de fusión por atención. Dos codificadores visuales congelados extraen representaciones de la imagen: un ViT de CLIP y un experto NPR (Neural Perception Routing, según la nomenclatura del proyecto). Un proyector de fusión entrenable, basado en cross-attention con puerta aprendida, combina ambas señales y produce las características visuales que condicionan a un LLaVA-NeXT cuyo backbone lingüístico es Mistral 7B. Sobre ese backbone se aplican adaptadores LoRA de rango 64, también entrenables.

El entrenamiento usó 16.000 imágenes del dataset AIGI-Holmes (8.000 reales y 8.000 generadas por IA), con los backbones visuales congelados y el modelo de lenguaje en 4 bits. Con un tamaño de lote efectivo de 8, una época equivalió a 2.000 pasos de optimizador. El entrenamiento se reanudó desde el paso 1.000 y terminó con una pérdida de entrenamiento registrada de 0,3008. Se emplearon Transformers 4.47.1 y PEFT 0.12.0. No se documentan fases de RLHF ni DPO, ni el número total de tokens de texto procesados.

## Capacidades

- Detección binaria de imágenes generadas por IA, con veredicto textual del tipo "This is a fake image" o equivalente para imágenes reales.
- Generación de una explicación breve en inglés que acompaña al veredicto, condicionada por la imagen y el prompt del usuario.
- Procesamiento de entradas multimodales imagen + texto (prompt de instrucción).
- Fusión de dos señales visuales complementarias (CLIP y NPR) mediante atención con puerta.
- Respuesta a instrucciones en formato conversacional heredadas de LLaVA-NeXT/Mistral.
- No se documenta soporte de tool calling, function calling, agentes, visión de vídeo, audio ni modo de razonamiento extendido.

## Casos de uso

- Moderación de contenido en plataformas: el modelo puede clasificar imágenes subidas por usuarios como reales o generadas por IA y adjuntar una justificación textual breve que facilite la revisión humana.
- Verificación periodística: un redactor puede enviar una imagen sospechosa junto con la pregunta "Is this image real or AI-generated?" y obtener un veredicto y una explicación que orienten la investigación.
- Investigación en forense digital: sirve como línea base reproducible para comparar estrategias de fusión de características visuales (CLIP frente a NPR) en detección de deepfakes y síntesis de imágenes.
- Filtrado en datasets de entrenamiento: permite etiquetar y separar imágenes sintéticas de reales antes de construir corpus para otros modelos generativos.
- Educación y concienciación: integrado en una demo, puede mostrar al público por qué una imagen parece generada, gracias a la explicación en lenguaje natural.
- Auditoría de pipelines generativos: permite comprobar si las salidas de un generador propio se detectan correctamente, midiendo la robustez del detector frente a distintas familias de modelos.
- Prototipado académico: al ser un checkpoint LoRA ligero, se puede reentrenar o ajustar sobre nuevos datasets de detección sin tocar los backbones congelados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta una pérdida de entrenamiento final de 0,3008 y una verificación cualitativa en una única muestra etiquetada como generada por IA. No hay métricas de exactitud, precisión, recall ni F1 sobre conjuntos de validación o test.

## Requisitos de hardware

- El checkpoint en sí ocupa 2,3 GB, pero la inferencia requiere cargar además el backbone LLaVA-NeXT con Mistral 7B, el ViT de CLIP y el experto NPR.
- El backbone lingüístico se entrenó en 4 bits, por lo que la inferencia práctica exige cuantización de 4 bits para caber en memoria razonable.
- VRAM estimada: no disponible con precisión; con Mistral 7B en 4 bits y los codificadores visuales, se puede esperar un consumo en el rango de 8-16 GB, aunque el autor no lo documenta.
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño del backbone, una GPU consumer de 16 GB o superior (RTX 4080, RTX 4090) sería el mínimo plausible, y A100/H100 para lotes mayores.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; el autor indica que se necesita el runtime personalizado de cross-attention del proyecto junto con Transformers 4.47.1 y PEFT 0.12.0.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Duong1211/cross-attention-fusion-checkpoint-2000 | no disponible (LoRA + proyector sobre Mistral 7B) | no disponible | Detección de imágenes IA con explicación | no disponible | Hugging Face, 0 descargas |
| Detectors basados en CLIP ViT (p. ej. UniversalFakeDetect) | ViT-B/L congelado | no aplica | Detección binaria de imágenes IA | varía según repo | público |
| Detectors basados en NPR | CNN especializada | no aplica | Detección de artefactos de síntesis | varía según repo | público |
| LLaVA-NeXT (base) | 7B-34B | hasta 32k en algunas variantes | VQA general y descripción de imágenes | Llama community / Apache según variante | público |

La comparación cuantitativa con estos sistemas no está disponible porque el autor no publica métricas. Frente a detectores puramente visuales, la propuesta añade justificación textual, pero a costa de un pipeline mucho más pesado y de un runtime personalizado.

## Limitaciones y advertencias

- No hay métricas de exactitud ni de fiabilidad de las explicaciones; la única verificación es cualitativa sobre una muestra.
- Riesgo de alucinación en las explicaciones generadas: el texto justificativo puede no corresponder a los artefactos reales que motivan la clasificación.
- Entrenado solo con 16.000 imágenes del dataset AIGI-Holmes, lo que limita la generalización a generadores, dominios y estilos no representados.
- Solo soporta inglés; no hay evidencia de comportamiento multilingüe.
- Licencia no especificada: no se puede asumir uso comercial sin consultar al autor.
- Requiere un runtime personalizado de cross-attention; no es cargable directamente con `from_pretrained` estándar sin el código del proyecto.
- El checkpoint está pensado como continuación de un entrenamiento previo (paso 1.000) y no como modelo autónomo; sin los backbones y la inicialización compuesta no funciona.
- El repositorio no registra descargas y tiene un solo "like", por lo que no hay validación externa de la comunidad.
- El backbone Mistral 7B y LLaVA-NeXT arrastran sus propios sesgos y limitaciones, incluidos los derivados de su entrenamiento original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Duong1211/cross-attention-fusion-checkpoint-2000
- Dataset AIGI-Holmes: https://huggingface.co/datasets/zzy0123/AIGI-Holmes-Dataset
- Discusión general sobre LLM frente a AIGC (resultado de búsqueda, no específico del modelo): https://www.zhihu.com/question/656840754
