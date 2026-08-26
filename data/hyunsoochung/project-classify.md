# hyunsoochung/project-classify

## Resumen

El modelo `hyunsoochung/project-classify` es un artefacto de investigación publicado por Hyunsoo Chung, un ingeniero de IA vinculado a la Universidad Nacional de Seúl y a la empresa CUTBACK AI. Según la model card, se trata de una implementación a escala "huge" de la arquitectura CLIP, orientada a tareas de retrieval (búsqueda y recuperación de información multimodal). El repositorio contiene únicamente un archivo `model.py` y no se proporcionan pesos, demos ni documentación adicional.

La relevancia de este modelo reside en su combinación técnica: atención lineal, fusión mediante Tucker, normalización ScaleNorm y activación Swish, junto con un head de retrieval. Sin embargo, la ausencia de datos de entrenamiento, parámetros y benchmarks impide evaluar su rendimiento real. Es un repositorio de carácter experimental o académico, no apto para producción sin información complementaria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP (escala "huge") con atención lineal, fusión Tucker, normalización ScaleNorm, activación Swish, inicialización Xavier |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | CC-BY-4.0 |
| Formato de pesos | no disponible (solo se incluye el archivo `model.py`, sin pesos publicados) |

## Arquitectura y entrenamiento

La arquitectura declarada es CLIP (Contrastive Language-Image Pre-training) en una variante de gran escala ("huge"). A diferencia del CLIP original, este modelo incorpora atención lineal en lugar de atención softmax estándar, lo que reduce la complejidad computacional a escala cuadrática en la longitud de la secuencia. La fusión de características entre modalidades se realiza mediante un módulo Tucker (descomposición tensorial), una técnica que permite interacciones de orden superior entre los embeddings de imagen y texto. La normalización ScaleNorm sustituye a LayerNorm, y la activación Swish (SiLU) se emplea en las capas feedforward.

El entrenamiento se realizó con el optimizador Adam y un programador de tasa de aprendizaje de calentamiento constante. No se proporcionan datos sobre el volumen de tokens, la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. La inicialización de pesos se hizo con Xavier, adecuada para redes con activaciones simétricas.

## Capacidades

- Retrieval multimodal: por su diseño, el modelo está orientado a tareas de búsqueda de imágenes a partir de texto y viceversa, típicas de CLIP.
- Atención lineal: permite procesar secuencias largas con menor coste cuadrático, aunque no se especifica la longitud máxima de contexto.
- Fusión Tucker: capacidad de capturar interacciones de orden alto entre características visuales y textuales.
- Sin evidencia de tool calling, agentes, razonamiento multi-step ni capacidades de generación de texto libre (el head es de retrieval, no generativo).
- Idiomas: no se ha especificado ningún idioma soportado; se desconoce si el modelo es monolingüe o multilingüe.

## Casos de uso

Dado que no se han publicado pesos ni demos, los siguientes casos de uso son potenciales basados en la arquitectura declarada, no en pruebas reales:

- Búsqueda de imágenes por descripción textual: un sistema de e-commerce podría usar el modelo para recuperar productos a partir de una consulta en lenguaje natural, aunque requiere pesos y evaluación previa.
- Moderación de contenido: clasificar imágenes según su contenido (por ejemplo, detectar contenido inapropiado) mediante retrieval contra una base de categorías.
- Sistemas de recomendación visual: recomendar artículos similares a partir de una imagen de entrada, usando el embedding del modelo para calcular similitudes.
- Indexación de archivos multimedia: etiquetado automático de bibliotecas de imágenes y vídeos con descripciones textuales generadas por el modelo.
- Investigación académica: servir como base para experimentos sobre fusión Tucker y atención lineal en tareas de retrieval, aunque sin pesos no es directamente reproducible.
- Pruebas de concepto en prototipos: validar la viabilidad de la arquitectura antes de escalar a modelos con pesos públicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de MMLU, HumanEval, GSM8K, ni de retrieval como Recall@k o NDCG.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware. Al ser una arquitectura "huge", se espera que requiera al menos 24-40 GB de VRAM para inferencia en precisión completa, pero este dato es una estimación genérica y no se ha confirmado. No se han publicado opciones de despliegue (vLLM, llama.cpp, etc.) ni datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información para comparar con otros modelos. No se han publicado pesos, parámetros ni resultados que permitan establecer una comparación objetiva con CLIP original, OpenCLIP, o alternativas como SigLIP.

## Limitaciones y advertencias

- Sin pesos públicos: el repositorio solo contiene código fuente, por lo que no es posible utilizarlo directamente para inferencia ni entrenamiento.
- Sin datos de entrenamiento: se desconoce el conjunto de datos, el volumen de tokens y las condiciones de entrenamiento, lo que impide evaluar su robustez y generalización.
- Riesgo de alucinación en retrieval: como todo modelo de retrieval, puede devolver resultados incorrectos si los embeddings no están bien calibrados, pero no se puede verificar sin evaluaciones.
- Licencia CC-BY-4.0: permite uso comercial y modificación, siempre que se reconozca la autoría, pero no incluye garantías ni soporte.
- Información incompleta: la model card no especifica idiomas, contexto, ni formato de pesos, lo que limita su uso práctico.

## Enlaces

- HuggingFace: https://huggingface.co/hyunsoochung/project-classify
- GitHub del autor: https://github.com/hyunsoochung-portfolio
- Repositorio de proyectos ML: https://github.com/hyunsoochung-portfolio/ml-projects
- Perfil académico en Bohrium: https://www.bohrium.com/scholar/516368g8/Hyunsoo_Chung
