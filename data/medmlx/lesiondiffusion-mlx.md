# MedMLX/lesiondiffusion-mlx

## Resumen

LesionDiffusion MLX es una implementación nativa para Apple Silicon del modelo LesionDiffusion, un sistema de difusión para la síntesis controlada de lesiones en imágenes de tomografía computarizada (TC). Lo desarrolla MedMLX, un proyecto centrado en llevar IA de imagen médica a dispositivos con chips de Apple mediante el framework MLX. El modelo resuelve un problema concreto: la escasez de datos anotados de lesiones en imagen médica, permitiendo generar lesiones sintéticas realistas sobre TC reales para aumentar conjuntos de datos de investigación y entrenamiento.

La relevancia actual del modelo radica en su enfoque on-device: se ejecuta de forma nativa en Apple Silicon con Metal, sin depender de CUDA ni de infraestructura en la nube. Con 416 millones de parámetros y un repositorio de 1,7 GB, es un modelo de tamaño moderado que cabe en equipos de sobremesa y portátiles de Apple, lo que facilita la experimentación en entornos de investigación con recursos limitados.

El modelo toma como entrada una TC alineada con una máscara binaria de órgano y produce una TC sintética junto con una máscara de lesión, con control sobre el tipo de lesión, su tamaño en milímetros y su ubicación dentro del parénquima. Está pensado exclusivamente para investigación y educación, y el propio autor advierte de que no está validado para uso clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (image-to-image) con componentes LMNet, LINet y VQ; implementación MLX |
| Parametros totales | 416.464.259 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (pesos MLX); incluye tokenizer.json y conversion.json |

## Arquitectura y entrenamiento

LesionDiffusion es un modelo de difusión para síntesis de imágenes médicas condicionada. La implementación de MedMLX emplea los componentes publicados por los autores originales: LMNet (para la generación de la imagen sintética), LINet (para la máscara de lesión) y componentes de cuantización vectorial (VQ). El modelo opera en modo image-to-image: recibe una TC y una máscara de órgano alineadas en una rejilla RAS de 1 mm y genera una TC sintética con la lesión insertada, junto con la máscara correspondiente.

El control de la síntesis se ejerce mediante parámetros explícitos: tipo de lesión (por ejemplo, tumor), tamaño del bounding box en milímetros, ubicación (por ejemplo, inside_parenchyma), modo de inferencia (conditioned) y número de pasos de difusión (200 en el ejemplo de la model card). El modelo original se describe en el artículo "LesionDiffusion: Towards Text-controlled General Lesion Synthesis" (arXiv:2503.00741). No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Síntesis de lesiones en TC: genera lesiones sintéticas realistas sobre imágenes de TC reales.
- Generación condicionada por órgano: soporta al menos hígado (liver) como órgano objetivo según los ejemplos de la model card.
- Control de tipo de lesión: permite especificar el tipo (por ejemplo, tumor).
- Control geométrico: tamaño del bounding box en milímetros y ubicación dentro del parénquima.
- Salida dual: imagen sintética y máscara de lesión correspondiente.
- Ejecución nativa en Apple Silicon con Metal mediante MLX.
- Reproducibilidad: parámetro de semilla (seed) para resultados deterministas.
- No dispone de tool calling, capacidades de agente ni razonamiento multi-paso; es un modelo de imagen, no de lenguaje.

## Casos de uso

- Aumento de datos para investigación en imagen médica: generar lesiones sintéticas sobre TC reales para ampliar conjuntos de entrenamiento de modelos de detección o segmentación, mitigando la escasez de casos anotados.
- Validación de pipelines de segmentación: usar las máscaras de lesión sintéticas como verdad de referencia controlada para comprobar que un segmentador detecta lesiones de tamaños y ubicaciones conocidas.
- Experimentación on-device en portátiles Apple: investigadores con Mac equipados con Apple Silicon pueden ejecutar el modelo localmente sin GPU NVIDIA ni servicios en la nube, gracias a la implementación MLX.
- Estudio de robustez de modelos diagnósticos: introducir lesiones sintéticas de tamaño y localización controlados para evaluar la sensibilidad de sistemas de detección ante variaciones geométricas.
- Docencia y formación: generar ejemplos didácticos de TC con lesiones de parámetros conocidos para ilustrar conceptos de imagen médica en entornos educativos.
- Prototipado rápido de aumentación condicionada: iterar sobre configuraciones de tipo de lesión, tamaño y ubicación con un único parámetro de semilla, integrando el modelo en scripts de Python mediante la API `run` del paquete `lesiondiffusion-mlx`.
- Investigación en generación condicionada: servir como base para estudiar el control textual y geométrico en modelos de difusión aplicados a imagen médica, partiendo del artículo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 416 millones de parámetros y pesos en safetensors (repositorio de 1,7 GB), la inferencia requiere del orden de varios GB de memoria unificada en Apple Silicon.
- GPU recomendadas: chips de Apple Silicon con soporte Metal (implementación nativa MLX); no se especifican modelos concretos de chip en la información disponible.
- Compatibilidad con GPU de consumidor: el modelo está diseñado para Apple Silicon, no para GPU NVIDIA; no se indica compatibilidad con CUDA.
- Opciones de despliegue: paquete Python `lesiondiffusion-mlx` (versión >= 0.2.6), Python 3.13, entorno gestionado con `uv`, descarga de pesos mediante `huggingface-hub`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; la model card solo indica el número de pasos de difusión del ejemplo (200), sin cifras de tiempo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LesionDiffusion MLX (MedMLX) | 416 M | No aplica (imagen) | Síntesis de lesiones en TC, image-to-image | MIT | Hugging Face, MLX para Apple Silicon |
| LesionDiffusion original (autores) | No disponible en la información | No aplica (imagen) | Síntesis de lesiones en TC | No disponible en la información | Referenciado vía arXiv:2503.00741 |
| Otros modelos de difusión médica | No disponible | No aplica (imagen) | Generación de imagen médica | No disponible | No disponible |

No se dispone en la información proporcionada de datos suficientes para comparar parámetros, contexto o rendimiento con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- No validado para uso clínico: el autor indica explícitamente que es para investigación y educación; las salidas sintéticas no son verdad de referencia.
- Riesgo de artefactos y alucinación visual: al ser un modelo generativo, puede producir lesiones o tejidos no realistas que no reflejen patología real.
- Dependencia de la entrada: requiere una TC alineada con una máscara binaria de órgano en una rejilla RAS de 1 mm; entradas mal alineadas o con otra geometría pueden degradar el resultado.
- Cobertura limitada de órganos y lesiones: los ejemplos documentados se centran en hígado y tumores; no se especifica la cobertura completa de órganos o tipos de lesión.
- Idioma: la model card y los metadatos declaran únicamente inglés.
- Plataforma: la implementación MLX está orientada a Apple Silicon; no se documenta soporte para CUDA u otras plataformas.
- Licencia MIT para los pesos, pero con aviso de que el uso previsto es investigación y educación; conviene revisar el archivo NOTICE del repositorio antes de cualquier uso derivado.
- Sin benchmarks publicados en la información disponible: no hay evidencia cuantitativa de calidad de síntesis ni comparaciones con alternativas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MedMLX/lesiondiffusion-mlx
- Repositorio GitHub: https://github.com/MedMLX/lesiondiffusion-mlx
- Documentación de ejecución: https://github.com/MedMLX/lesiondiffusion-mlx/blob/main/README.md#run
- Artículo original (arXiv): https://arxiv.org/abs/2503.00741
- Artículo MedMLX (DOI): https://doi.org/10.64898/2026.10.28.26366762
- Archivos del repositorio: https://huggingface.co/MedMLX/lesiondiffusion-mlx/tree/main
- Aviso legal (NOTICE): https://huggingface.co/MedMLX/lesiondiffusion-mlx/blob/main/NOTICE
- Licencia de los pesos originales (SOURCE_LICENSE): https://huggingface.co/MedMLX/lesiondiffusion-mlx/blob/main/SOURCE_LICENSE
