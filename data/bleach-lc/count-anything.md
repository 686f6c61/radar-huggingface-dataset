# BLEACH-lc/count-anything

## Resumen

Count Anything es un modelo de visión por computadora para conteo de objetos guiado por texto, desarrollado por Mengqi Lei y publicado originalmente en HuggingFace como MengqiLei/count-anything. El repositorio analizado (BLEACH-lc/count-anything) es una copia alojada por el usuario BLEACH-lc. Dada una imagen y una consulta en lenguaje natural, el modelo devuelve un conjunto de puntos de instancia cuya cardinalidad corresponde al número de objetos de la categoría solicitada. Esta formulación unifica el conteo condicionado por categoría con la localización espacial interpretable.

El modelo se entrena y evalúa en CLOC, un dataset de conteo a gran escala que reúne alrededor de 220.000 imágenes, 619 categorías y 15 millones de instancias, cubriendo seis dominios visuales: escena general, teledetección, histopatología, microscopía celular, agricultura y microbiología. La arquitectura se inicializa desde SAM3, aunque no se proporcionan detalles específicos de parámetros ni arquitectura. El repositorio pesa 3,6 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en SAM3 (no se especifican detalles) |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

Count Anything emplea un enfoque de doble granularidad para enumerar instancias. Por un lado, un contador disperso a nivel de región (Region-level Sparse Counter, RSC) proporciona anclajes a nivel de objeto para objetivos grandes y dispersos. Por otro lado, un contador denso a nivel de píxel (Pixel-level Dense Counter, PDC) captura objetos pequeños, densos y con límites débiles mediante predicción densa de puntos. Ambos contadores se combinan con una fusión complementaria de conteo (Complementary Count Fusion, CCF) sin parámetros, que suprime duplicados y preserva la complementariedad.

El entrenamiento utiliza supervisión centrada en puntos: las anotaciones heterogéneas (cajas, puntos, polígonos, máscaras, cajas rotadas y mapas de etiquetas) se convierten en puntos de conteo con cajas opcionales. Cada instancia válida se supervisa mediante un punto, y las cajas se usan solo cuando existen anotaciones fiables. El modelo se inicializa desde los pesos de SAM3 y se entrena en CLOC, que contiene unas 220.000 imágenes, 619 categorías y 15 millones de instancias.

## Capacidades

- Conteo de objetos guiado por texto: dado una imagen y una consulta en lenguaje natural (nombre de categoría o descripción), devuelve puntos de instancia.
- Localización espacial interpretable: los puntos de salida indican dónde se encuentra cada objeto, no solo un número.
- Conteo open-world y zero-shot: capaz de contar categorías no vistas durante el entrenamiento.
- Cobertura de seis dominios visuales: escena general, teledetección, histopatología, microscopía celular, agricultura y microbiología.
- Manejo de objetos con diferentes tamaños y densidades: RSC para objetivos grandes y dispersos, PDC para pequeños y densos.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni funciones de agente.

## Casos de uso

- Recuento de células en imágenes de microscopía: el modelo puede contar células en preparaciones biológicas usando consultas en lenguaje natural, lo que agiliza el análisis en laboratorios de investigación.
- Conteo de cultivos en agricultura de precisión: permite estimar el número de plantas o frutos en imágenes de campo, útil para monitorizar cosechas.
- Conteo de vehículos en imágenes de teledetección: aplicable a la vigilancia de tráfico o la planificación urbana mediante imágenes aéreas o satelitales.
- Análisis de histopatología: el modelo puede contar estructuras patológicas (por ejemplo, núcleos o glándulas) en secciones de tejido, ayudando en diagnóstico asistido.
- Conteo de microorganismos en microbiología: útil para cuantificar bacterias u otros microorganismos en imágenes de placas o microscopía.
- Conteo de objetos en escenas generales: aplicable a la vigilancia de multitudes o al análisis de imágenes de eventos, donde se necesita contar personas u objetos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una tabla de resultados principales en CLOC, pero no se incluyen los valores numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 3,6 GB, lo que sugiere que el checkpoint ocupa aproximadamente ese tamaño en disco, pero no se conoce el requisito de VRAM.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible. El modelo se distribuye como checkpoint PyTorch (.pt); no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se proporcionan modelos comparables en la información disponible.

## Limitaciones y advertencias

- El modelo se entrena en CLOC, por lo que su rendimiento puede degradarse en dominios no cubiertos por el dataset.
- Al ser un modelo de conteo basado en puntos, la precisión depende de la calidad de la imagen y de la claridad de los objetos.
- No se especifican sesgos conocidos ni riesgos de alucinación, pero al tratarse de un modelo de visión, la "alucinación" se manifiesta como puntos falsos positivos.
- El repositorio analizado (BLEACH-lc/count-anything) es una copia del modelo original (MengqiLei/count-anything) con 0 descargas y 0 likes, sin verificación de la comunidad. Se recomienda usar el repositorio original para evitar posibles modificaciones no autorizadas.
- La licencia Apache 2.0 permite uso comercial, pero se debe respetar la atribución.

## Enlaces

- HuggingFace: https://huggingface.co/BLEACH-lc/count-anything
- Página del proyecto: https://mengqi-lei.github.io/count-anything-projectpage/
- Modelo original en HuggingFace: https://huggingface.co/MengqiLei/count-anything
- Demo en HuggingFace: https://huggingface.co/spaces/MengqiLei/count-anything-demo
- Artículo en arXiv: https://arxiv.org/abs/2605.30846
