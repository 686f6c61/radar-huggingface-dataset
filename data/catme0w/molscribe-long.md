# catme0w/MolScribe-Long

## Resumen

MolScribe-Long es un ajuste fino (fine-tune) del modelo yujieq/MolScribe, desarrollado por el usuario catme0w y publicado en Hugging Face bajo licencia MIT. MolScribe es un modelo especializado en el reconocimiento óptico de estructuras químicas (optical chemical structure recognition, OCSR): recibe como entrada una imagen de una molécula dibujada y genera su representación textual, típicamente en formato SMILES. El ajuste MolScribe-Long está orientado a imágenes moleculares extremadamente densas y con solapamientos, intentando además recuperar información de quiralidad a partir de representaciones severamente degradadas.

La relevancia del modelo es acotada pero específica: cubre un caso difícil dentro del pipeline de digitalización de literatura química, donde los dibujos de moléculas aparecen comprimidos, superpuestos o con baja resolución. Se distribuye como un repositorio de 0,4 GB, lo que sugiere pesos en formato de precisión completa o media, sin cuantizaciones publicadas. No hay información pública sobre arquitectura detallada, número de parámetros ni longitud de contexto en la documentación disponible.

La model card es mínima: únicamente declara la licencia MIT, el modelo base y un enlace a un proyecto externo (lostone.catme0w.org), además de una demo en Hugging Face Spaces. No se han publicado métricas, composición del dataset de ajuste ni detalles del procedimiento de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base MolScribe, especializado en OCSR; detalles no publicados en la ficha) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repositorio de 0,4 GB, sin variantes GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | no disponible (la tarea es imagen a SMILES, no texto libre) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de 0,4 GB; probablemente safetensors o bin, sin confirmar) |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna de MolScribe-Long más allá de que deriva de yujieq/MolScribe. MolScribe, en su formulación original, es un modelo de imagen a secuencia para OCSR que combina un codificador visual con un decodificador autorregresivo que emite SMILES; sin embargo, esta ficha no puede confirmar los detalles concretos de esa arquitectura para esta variante.

Tampoco se documentan el volumen de datos de entrenamiento, la composición del dataset de ajuste, ni si se emplearon técnicas de RLHF, DPO o aumentación específica. La única indicación técnica disponible es la del espacio de demostración: el ajuste está optimizado para imágenes moleculares "extremadamente densas y solapadas" y trata de recuperar quiralidad a partir de información degradada. No se especifican innovaciones como decodificación especulativa, atención lineal o mecanismos híbridos.

## Capacidades

- Reconocimiento óptico de estructuras químicas (OCSR): conversión de imágenes de moléculas a representaciones textuales tipo SMILES.
- Manejo de dibujos moleculares densos, con solapamiento entre fragmentos y anotaciones.
- Intento de recuperación de quiralidad en imágenes degradadas o de baja calidad.
- Procesamiento de imagen como entrada; no es un modelo de texto general.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües (la salida es notación química, no lenguaje natural).
- No se documentan modos especiales como thinking mode, visión general, audio o vídeo.

## Casos de uso

- Digitalización de patentes químicas: extraer estructuras de figuras escaneadas con dibujos comprimidos y solapados, donde los modelos OCSR convencionales fallan por la densidad del trazado.
- Curaduría de bases de datos químicas: convertir lotes de imágenes de moléculas procedentes de artículos en SMILES para poblar repositorios estructurados y facilitar búsquedas por subestructura.
- Reconstrucción de figuras de suplementos y material adicional: procesar diagramas con múltiples moléculas superpuestas y anotaciones, un escenario habitual en publicaciones con espacio limitado.
- Análisis de literatura histórica: recuperar estructuras de escaneos antiguos o de baja resolución, aprovechando el ajuste orientado a información degradada.
- Verificación de quiralidad: comprobar si la estereoquímica representada en una figura coincide con la descrita en el texto, usando el intento de recuperación de quiralidad del modelo.
- Preprocesado para pipelines de quimioinformática: generar SMILES candidatos que luego se validan con herramientas como RDKit antes de incorporarlos a modelos predictivos o cribados virtuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio de 0,4 GB sugiere que los pesos caben holgadamente en GPUs de consumo, pero se desconoce el pico de memoria durante la inferencia.
- GPU recomendadas: no disponibles. Por el tamaño del repositorio, es plausible que funcione en GPUs consumer (RTX 3060, RTX 4090) y en GPUs de datacenter (A100, H100), pero no hay datos publicados que lo confirmen.
- Compatibilidad con GPU de consumo: probable por el tamaño del artefacto, sin confirmación oficial.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo imagen-a-secuencia, requeriría un servidor de inferencia personalizado o el código del proyecto enlazado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MolScribe-Long (catme0w) | OCSR en imágenes densas | no disponible | no disponible | MIT | Hugging Face + Space |
| MolScribe (yujieq) | OCSR general | no disponible | no disponible | no disponible en esta ficha | Hugging Face |
| DECIMER | OCSR | no disponible | no disponible | no disponible en esta ficha | Proyecto open source |
| Img2Mol | OCSR | no disponible | no disponible | no disponible en esta ficha | Repositorio académico |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La model card es mínima: no hay información sobre dataset de entrenamiento, métricas de validación ni evaluación independiente, lo que impide estimar su fiabilidad en producción.
- Riesgo de alucinación estructural: como todo modelo generativo de SMILES, puede producir cadenas sintácticamente válidas pero químicamente incorrectas; se recomienda validación con RDKit y revisión humana.
- La recuperación de quiralidad a partir de información degradada es intrínsecamente ambigua; el propio autor la describe como un intento, no como una garantía.
- Sesgos: no documentados, pero probables hacia los estilos de dibujo y las convenciones de representación presentes en el conjunto de ajuste.
- Idiomas: no aplica a texto libre; la salida es notación química, lo que limita su uso fuera de ese dominio.
- Licencia MIT: permite uso comercial y modificación, pero conviene revisar la licencia del modelo base yujieq/MolScribe, no confirmada en esta ficha.
- La model card apunta a una nueva versión (catme0w/NoAuthBot), lo que sugiere que este repositorio puede quedar sin mantenimiento.
- Despliegue: al no publicarse cuantizaciones ni integraciones con servidores de inferencia estándar, el coste de ingeniería para ponerlo en producción es mayor que el de un modelo de texto convencional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/catme0w/MolScribe-Long
- Demo en Hugging Face Spaces: https://catme0w-molscribe-long.hf.space/
- Proyecto del autor: https://lostone.catme0w.org/
- Modelo base: https://huggingface.co/yujieq/MolScribe
- Nueva versión indicada en la model card: https://huggingface.co/catme0w/NoAuthBot
