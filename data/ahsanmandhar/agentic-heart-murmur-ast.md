# Ahsanmandhar/agentic-heart-murmur-ast

## Resumen

Agentic Heart Sound Detector es un modelo de clasificación de audio desarrollado por Ahsan Mandhar, consistente en un Audio Spectrogram Transformer (AST) afinado para la detección de soplos cardíacos (murmurs) a partir de fonocardiogramas. Se construye sobre el modelo base `MIT/ast-finetuned-audioset-10-10-0.4593`, un transformer de tipo ViT que opera sobre espectrogramas log-mel, y se ha ajustado con el conjunto de datos CirCor DigiScope Phonocardiogram.

El modelo se distribuye en formato ONNX con cuantización INT8 y un tamaño de repositorio de 0,1 GB, lo que facilita su despliegue en entornos con recursos limitados. La salida principal es un embedding de 768 dimensiones obtenido por mean-pooling de 311 tokens de parche, sobre el que se aplica una sonda lineal (regresión logística) para la clasificación final en tres clases: Absent, Murmur y Unknown. El autor lo presenta envuelto en un pipeline multi-agente (preprocesado, inferencia, decisión, seguridad y visualización).

La relevancia del modelo es acotada: se trata de un artefacto de investigación y educación en análisis de sonidos cardíacos, no de un dispositivo médico, y no cuenta con validación clínica. Su interés técnico reside en la combinación de un AST preentrenado en AudioSet con un ajuste fino específico de dominio y una cadena de agentes que añade capas de decisión y seguridad sobre la inferencia del clasificador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Spectrogram Transformer (AST), encoder estilo ViT |
| Parametros totales | ~86M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada fija: espectrograma log-mel `[1, 1, 80, 1001]`) |
| Tipos de cuantizacion | INT8 (ONNX) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | ONNX (INT8) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Audio Spectrogram Transformer, un encoder de tipo Vision Transformer que procesa espectrogramas log-mel como si fueran imágenes. La entrada es un tensor `[1, 1, 80, 1001]` (un canal, 80 bandas mel, 1001 frames temporales), que se divide en 311 tokens de parche. La salida es un embedding de 768 dimensiones obtenido por mean-pooling de esos tokens, sobre el que se aplica una sonda lineal de regresión logística para producir la clasificación en tres clases (Absent, Murmur, Unknown).

El ajuste fino se realizó sobre el modelo base `MIT/ast-finetuned-audioset-10-10-0.4593`, preentrenado en AudioSet, utilizando el CirCor DigiScope Phonocardiogram Dataset. El autor no proporciona en la información disponible detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO (no aplicables habitualmente a clasificación de audio). La innovación destacable es el empaquetado en un pipeline multi-agente con etapas de preprocesado, inferencia, decisión, seguridad y visualización, así como la cuantización INT8 para reducir el coste de despliegue.

## Capacidades

- Clasificación de audio de fonocardiogramas en tres clases: Absent, Murmur y Unknown.
- Extracción de embeddings de 768 dimensiones (mean-pooled de 311 tokens de parche) utilizables para tareas posteriores de análisis o clustering.
- Inferencia mediante ONNX Runtime con pesos cuantizados a INT8.
- Pipeline multi-agente con etapas explícitas de preprocesado, inferencia, decisión, seguridad y visualización.
- Procesamiento de audio en inglés (idioma declarado en la model card).
- No soporta tool calling ni function calling.
- No soporta agentes de razonamiento multi-paso en el sentido de modelos de lenguaje; el término "agentic" se refiere al pipeline de procesamiento, no a capacidades de razonamiento autónomo.
- No dispone de modo thinking, visión ni audio general más allá de la clasificación de sonidos cardíacos.

## Casos de uso

- Investigación en análisis de fonocardiogramas: el modelo sirve como componente de extracción de características y clasificación en estudios académicos sobre detección de soplos cardíacos, aprovechando su ajuste fino sobre CirCor.
- Docencia en IA médica: permite ilustrar el flujo completo de un pipeline de audio clínico (preprocesado de espectrogramas, inferencia, decisión y visualización) con un modelo ligero de ~86M parámetros.
- Prototipado de herramientas de apoyo a la auscultación: integrable en aplicaciones de demostración que resalten segmentos anómalos en grabaciones, siempre con revisión por expertos y sin uso diagnóstico.
- Extracción de embeddings para análisis exploratorio: los vectores de 768 dimensiones pueden alimentar técnicas de clustering o visualización de poblaciones de grabaciones cardíacas en entornos de investigación.
- Despliegue en entornos con recursos limitados: al estar en ONNX INT8 y ocupar 0,1 GB, puede ejecutarse en dispositivos de borde o portátiles sin GPU dedicada para pruebas de concepto.
- Evaluación comparativa de arquitecturas AST frente a otros enfoques de clasificación de audio médico en experimentos controlados.
- Integración en pipelines de investigación con etapas de seguridad: la fase de seguridad del pipeline multi-agente permite añadir comprobaciones antes de exponer resultados a un usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con ~86M parámetros en INT8, el modelo ocupa del orden de decenas de MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; cualquier GPU con soporte ONNX Runtime es suficiente. Para lotes grandes, una RTX 4090 o A100 aportarían margen, pero no son necesarias.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: ONNX Runtime (formato nativo del modelo); no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (clasificación de soplos cardíacos con AST) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No validado para diagnóstico clínico, cribado ni triaje; el autor lo declara explícitamente como no dispositivo médico.
- Uso previsto limitado a investigación y educación en análisis de sonidos cardíacos.
- El rendimiento varía según la calidad de la grabación y la localización anatómica de la auscultación.
- Requiere revisión por un experto de dominio para cualquier aplicación clínica.
- Riesgo de sesgo derivado del dataset CirCor: la distribución de pacientes, dispositivos y condiciones de grabación puede no representar otras poblaciones.
- Riesgo de alucinación en el sentido de clasificaciones erróneas con alta confianza, especialmente en grabaciones ruidosas o fuera de distribución.
- Idioma declarado únicamente inglés; no se documenta soporte multilingüe.
- La licencia MIT permite uso comercial, pero la licencia del dataset CirCor (ODC Attribution License) impone condiciones de atribución que deben respetarse.
- El modelo base MIT/ast-finetuned-audioset-10-10-0.4593 está bajo licencia MIT.
- El pipeline multi-agente añade etapas de decisión y seguridad, pero no se documentan sus criterios ni su validación.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de uso o validación por parte de la comunidad.

## Enlaces

- [HuggingFace: Ahsanmandhar/agentic-heart-murmur-ast](https://huggingface.co/Ahsanmandhar/agentic-heart-murmur-ast)
- [Modelo base: MIT/ast-finetuned-audioset-10-10-0.4593](https://huggingface.co/MIT/ast-finetuned-audioset-10-10-0.4593)
- [Dataset CirCor DigiScope Phonocardiogram](https://physionet.org/content/circor-heart-sound/) (referencia del dataset citado en la model card)
- Contacto del autor: ahsanmandhar@gmail.com
