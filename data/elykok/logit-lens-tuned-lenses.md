# ElyKok/logit-lens-tuned-lenses

## Resumen

`ElyKok/logit-lens-tuned-lenses` es un repositorio de artefactos de interpretabilidad, no un modelo de lenguaje en sentido estricto. Contiene un conjunto de "tuned lenses" (traductores afines entrenados por capa) para cuatro modelos base: GPT-2 small, Pythia-160m, Qwen2.5-0.5B y Qwen2.5-1.5B. El objetivo es aplicar las técnicas de *logit lens* y *tuned lens* para inspeccionar qué predice cada capa intermedia de un transformer sobre el siguiente token.

La logit lens consiste en aplicar la normalización final y la matriz de *unembedding* directamente a una capa intermedia, proyectando sus activaciones al espacio de vocabulario. La tuned lens mejora esta aproximación entrenando, por capa, una pequeña transformación afín que minimiza la divergencia KL respecto a la distribución de salida final del modelo. El repositorio empaqueta esas transformaciones aprendidas junto con una aplicación Gradio (`app.py`) que permite escribir una frase y visualizar las predicciones por capa.

El interés del proyecto es fundamentalmente didáctico y de investigación: facilita el estudio de la evolución de las representaciones internas a lo largo de las capas, con soporte bilingüe inglés-hebreo en los lenses de Qwen. El tamaño del repositorio (0,2 GB) corresponde a los pesos de los tuned lenses y posiblemente a artefactos auxiliares, no a los modelos base completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (artefactos de interpretabilidad: transformaciones afines por capa sobre modelos transformer) |
| Parametros totales | No disponible (los tuned lenses son matrices afines de baja dimension por capa; el tamano depende del modelo base) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible (heredada del modelo base: GPT-2 small 1024, Pythia-160m 2048, Qwen2.5-0.5B/1.5B 32768) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles y hebreo (para los lenses de Qwen); ingles para GPT-2 y Pythia |
| Licencia | No disponible |
| Formato de pesos | safetensors (segun dependencias del README); directorio `lenses/` |

## Arquitectura y entrenamiento

Los tuned lenses son transformaciones afines por capa que se aplican a las activaciones de una capa intermedia antes de proyectarlas con la normalización final y el *unembedding* del modelo base. Se entrenan minimizando la divergencia KL entre la distribución resultante y la distribución de salida final del modelo, capa por capa. El resultado es una aproximación más fiel que la logit lens clásica, especialmente en capas tempranas donde la representación aún está poco alineada con el espacio de salida.

Según la model card, los lenses se entrenaron sobre Wikipedia: inglés para GPT-2 small y Pythia-160m, e inglés más hebreo para Qwen2.5-0.5B y Qwen2.5-1.5B. No se especifican el número de tokens de entrenamiento, hiperparámetros, ni detalles del procedimiento de optimización más allá de la pérdida KL. Los modelos base cubiertos abarcan desde 124M (GPT-2 small) hasta 1.5B parámetros (Qwen2.5-1.5B), lo que permite comparar dinámicas internas entre arquitecturas y escalas.

## Capacidades

- Visualización de predicciones por capa: dado un texto de entrada, muestra la distribución del siguiente token en cada capa del modelo base, mediante logit lens y tuned lens.
- Comparación logit lens vs. tuned lens: permite contrastar la fidelidad de ambas técnicas en cada capa.
- Soporte multilingüe parcial: los lenses de Qwen están entrenados en inglés y hebreo.
- Interfaz Gradio (`app.py`) para exploración interactiva local.
- Compatibilidad con cuatro modelos base de distintas familias y escalas (GPT-2, Pythia, Qwen2.5).
- No incluye generación de texto, razonamiento, tool calling, agentes ni capacidades multimodales: es una herramienta de análisis, no un modelo generativo desplegable.

## Casos de uso

- Investigación en interpretabilidad: analizar en qué capa un modelo "decide" el siguiente token y cómo evoluciona la distribución de probabilidad capa a capa, usando los tuned lenses como aproximación fiel a la salida final.
- Docencia y divulgación: demostrar visualmente el funcionamiento interno de un transformer con la app Gradio, escribiendo frases y observando las predicciones intermedias en GPT-2 small o Pythia-160m.
- Estudio comparativo entre arquitecturas: contrastar las dinámicas internas de GPT-2, Pythia y Qwen2.5 a distintas escalas (124M a 1.5B) con los mismos textos de entrada.
- Análisis multilingüe inglés-hebreo: examinar cómo Qwen2.5-0.5B y 1.5B representan y predicen tokens en hebreo frente a inglés, gracias a los lenses entrenados en ambos idiomas.
- Diagnóstico de modelos: detectar capas donde la representación se desvía de la salida final, útil para estudiar pruning o intervenciones en capas concretas.
- Reproducción de experimentos: ejecutar localmente `python app.py` con dependencias mínimas (torch CPU, transformers, safetensors, matplotlib, gradio) para replicar los análisis del autor.
- Base para extensiones: reutilizar la estructura de `lenses/` para entrenar tuned lenses sobre otros modelos base o idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 0,2 GB; los modelos base deben descargarse aparte desde Hugging Face (GPT-2 small ~0,5 GB, Pythia-160m ~0,3 GB, Qwen2.5-0.5B ~1 GB, Qwen2.5-1.5B ~3 GB en fp16).
- Inferencia en CPU es viable para GPT-2 small y Pythia-160m; Qwen2.5-1.5B se beneficia de GPU.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, RTX 4060, RTX 4090) es suficiente para los cuatro modelos base en fp16.
- Cabe en GPU consumer sin problema; incluso en CPU con suficiente RAM (8-16 GB) para los modelos pequeños.
- Despliegue: la app usa Gradio; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefactos.
- Latencia y throughput: no disponibles; dependen del modelo base y del hardware.

## Comparativa con modelos similares

| Proyecto | Enfoque | Modelos cubiertos | Idiomas | Licencia |
|---|---|---|---|---|
| ElyKok/logit-lens-tuned-lenses | Tuned lenses + app Gradio | GPT-2, Pythia-160m, Qwen2.5-0.5B/1.5B | Ingles, hebreo | No disponible |
| nostalgebraist/logit-lens | Logit lens clásica | GPT-2 y otros | Ingles | No disponible |
| Alignment Research Center tuned-lens | Tuned lens (paper y código) | Varios transformers | Ingles | No disponible |
| TransformerLens (Neel Nanda) | Framework de interpretabilidad | Amplia variedad | Ingles | MIT (según proyecto) |

No se dispone de datos de rendimiento comparativos entre estas herramientas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni puede usarse como chatbot o servicio de inferencia.
- La licencia no está especificada, lo que impide confirmar si el uso comercial es posible; conviene contactar con el autor antes de reutilizar los artefactos.
- Los tuned lenses son aproximaciones: la fidelidad respecto a la salida real varía por capa y modelo, y no sustituyen a la inspección directa del modelo.
- Cobertura lingüística limitada: solo inglés y hebreo; no hay soporte para castellano ni otros idiomas.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria ni publicación asociada; la calidad de los lenses no está auditada externamente.
- No se documentan hiperparámetros de entrenamiento, tamaño del corpus ni criterios de evaluación de los lenses.
- Los modelos base (GPT-2, Pythia, Qwen2.5) tienen sus propias licencias y sesgos, que se heredan en el análisis.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ElyKok/logit-lens-tuned-lenses
- Paper de tuned lens (referencia técnica): https://arxiv.org/abs/2303.08112
- Artículo original de logit lens (nostalgebraist): https://www.lesswrong.com/posts/AcKRB8wDpdaN6v6ru/interpreting-gpt-the-logit-lens
- TransformerLens: https://github.com/neelnanda-io/TransformerLens
- GPT-2 small: https://huggingface.co/openai-community/gpt2
- Pythia-160m: https://huggingface.co/EleutherAI/pythia-160m
- Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
