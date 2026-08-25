# kabing/Qwen2.5-1.5B-cbctg-prior

## Resumen

El modelo `kabing/Qwen2.5-1.5B-cbctg-prior` es un conjunto de módulos de generación controlable por conceptos (concept-bottleneck) diseñados para el modelo base Qwen2.5-1.5B. Lo desarrolla el equipo de Qi Bing y Xiaowei Shao como parte del trabajo "The Illusion of Control: Why Bare Classifier Inversion Silently Fails in Concept-Bottleneck Text Generation", aceptado en EMNLP 2026. El repositorio contiene únicamente los parámetros entrenados por los autores: los MLP de codificación de conceptos por eje, las cabezas clasificadoras, el inyector de conceptos, un adaptador LoRA y un prior de etiquetas post-hoc. No incluye los pesos del modelo base, que deben descargarse por separado desde Qwen/Qwen2.5-1.5B.

El objetivo principal es permitir la generación de texto con control explícito sobre cuatro ejes conceptuales: cocina, género, sentimiento y tiempo verbal. El adaptador se presenta como una alternativa al mecanismo de inyección AdaLN-zero (que resultó inestable en este backbone) y sirve para demostrar que el colapso de la inversión de clasificadores también se produce con una inyección aditiva. Es un trabajo de investigación, no un modelo de producción, y su relevancia radica en analizar los límites de los enfoques de concept-bottleneck en la generación de texto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Concept-bottleneck + generador Qwen2.5-1.5B con LoRA (rank 8, alpha 16) en las proyecciones de atención |
| Parametros totales | No disponible (el adaptador y los módulos auxiliares no se cuantifican en el repositorio) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128K (heredada del modelo base Qwen2.5-1.5B) |
| Tipos de cuantizacion | No disponible (no se proporcionan versiones cuantizadas del adaptador) |
| Idiomas soportados | No disponible (el modelo base Qwen2.5-1.5B soporta multilingüe, pero no se especifican los idiomas evaluados en el adaptador) |
| Licencia | Apache 2.0 |
| Formato de pesos | Archivos PyTorch (.pt) y config.json (PEFT) |

## Arquitectura y entrenamiento

El modelo se compone de varios módulos integrados en el backbone Qwen2.5-1.5B. Por un lado, se definen cuatro ejes conceptuales (cocina, género, sentimiento y tiempo verbal), cada uno con una dimensión de 32. Unos MLP por eje actúan como codificadores de conceptos, y unas cabezas clasificadoras permiten predecir los valores de cada atributo. El inyector de conceptos se inserta cada dos bloques del transformer y se inicializa con una puerta de valor -3.0 para no interferir con el modelo preentrenado al inicio del entrenamiento. El generador es el Qwen2.5-1.5B original, al que se añade un adaptador LoRA (rank 8, alpha 16) sobre las proyecciones de atención.

Además, se incluye un prior de etiquetas post-hoc `g_gamma` (una MLP con una capa oculta de 128 unidades GELU) que se ajusta en menos de 30 segundos y que se recomienda como fuente de variables latentes z durante la generación. El entrenamiento del adaptador se realiza sobre el conjunto de datos Fyelp, con dos divisiones disponibles: `hold-out` (39 configuraciones vistas y 1 no vista) y `acd` (mitad de configuraciones retenidas). No se especifican el número total de tokens de entrenamiento ni la composición exacta del dataset. El trabajo documenta que la inversión directa del clasificador (protocolo `mode_b`) produce un colapso silencioso, motivo por el cual se propone el prior post-hoc como alternativa robusta.

## Capacidades

- Generación de texto con control explícito sobre cuatro atributos discretos: cocina (cuisine), género (gender), sentimiento (sentiment) y tiempo verbal (tense).
- Soporte de tres protocolos de generación: `prior` (usando el prior post-hoc, el recomendado), `oracle` (codificación del texto de referencia) y `mode_b` (inversión del clasificador, documentado como propenso a fallos).
- Control fino mediante la especificación de valores por cada eje conceptual (por ejemplo, cocina italiana, género masculino, sentimiento positivo, tiempo pasado).
- Capacidad de generalización compositiva: el adaptador se evalúa en configuraciones no vistas durante el entrenamiento (splits `hold-out` y `acd`).
- No incluye capacidades de tool calling, visión, audio ni razonamiento multi-paso más allá del control de atributos; es un módulo especializado de control de generación.

## Casos de uso

- **Generación de reseñas de restaurantes con atributos controlados**: el modelo permite fijar la cocina (por ejemplo, italiana o japonesa), el sentimiento (positivo o negativo) y el tiempo verbal (pasado o presente) en reseñas sintéticas. Es útil para crear datasets de entrenamiento o para probar sistemas de análisis de opinión.
- **Creación de texto con género específico en narrativas**: al controlar el atributo de género, se pueden generar descripciones o diálogos con una perspectiva de género determinada, útil para estudios sociolingüísticos o para generar datos con equilibrio de género.
- **Ajuste de tiempo verbal en textos generados**: el control sobre el tiempo verbal permite generar versiones de un mismo texto en pasado, presente o futuro, lo que es útil para sistemas de simplificación o reescritura de contenido.
- **Investigación académica sobre concept-bottleneck en generación de texto**: este adaptador es una herramienta para reproducir los experimentos del paper y analizar los límites de la inversión de clasificadores en generación controlada.
- **Evaluación de la generalización compositiva**: el split `acd` retiene la mitad de las configuraciones, permitiendo evaluar si el modelo es capaz de combinar atributos no vistos durante el entrenamiento, un aspecto clave para la investigación en composicionalidad.
- **Benchmarking de métodos de control de atributos**: comparar este adaptador con otros enfoques de control (como inyección por adapters, prompts o fine-tuning) en términos de fidelidad al atributo y calidad del texto generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni otros estándares. La evaluación se centra en la fidelidad de los atributos controlados y la calidad de la generación, pero no se proporcionan valores numéricos concretos en la documentación.

## Requisitos de hardware

- **VRAM estimada**: el modelo base Qwen2.5-1.5B requiere aproximadamente 3.5 GB en fp16, 2 GB en 8-bit y 1 GB en 4-bit. El adaptador añade un pequeño overhead (MLPs, LoRA y prior), que puede estimarse en menos de 0.5 GB.
- **GPU recomendadas**: puede ejecutarse en GPUs de consumo como RTX 3060 (8 GB), RTX 4060 (8 GB), RTX 4070 (12 GB) o superiores. También funciona en GPUs de datacenter como A10 o A100 si se usa en entornos de investigación.
- **Compatibilidad con consumer GPU**: sí, cabe en tarjetas con 4 GB de VRAM o más, siempre que se use el modelo base cuantizado a 8-bit o 4-bit.
- **Opciones de despliegue**: el modelo no se integra directamente con vLLM, llama.cpp u Ollama porque es un adaptador PEFT con módulos adicionales (inyector, codificadores) que requieren el código de generación del repositorio `cbctg-illusion-of-control`. El script `evaluation/generate_v3.py` es el punto de entrada recomendado.
- **Latencia y throughput**: no se proporcionan datos específicos. La latencia será la del modelo base Qwen2.5-1.5B más el coste de los módulos de concept-bottleneck, que es despreciable en comparación con el generador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen2.5-1.5B (base) | 1.5B | 128K | Apache 2.0 | HuggingFace | Modelo base sin adaptación de control de atributos |
| kabing/Qwen2.5-1.5B-cbctg-prior | Adaptador sobre 1.5B | 128K | Apache 2.0 | HuggingFace | Añade control de 4 atributos mediante concept-bottleneck |
| Otros adaptadores de control de atributos | No disponible | No disponible | No disponible | No disponible | No se dispone de información de modelos comparables |

No se han encontrado datos de rendimiento comparativos con otros modelos de control de atributos en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador de investigación, no un modelo listo para producción. No se garantiza la calidad del texto generado en dominios distintos al de entrenamiento (Fyelp).
- Requiere el modelo base Qwen2.5-1.5B descargado por separado; el repositorio solo contiene los módulos propios.
- La inversión directa del clasificador (protocolo `mode_b`) está documentada como fallida en el paper, por lo que no se recomienda su uso sin el prior post-hoc.
- El control de atributos está limitado a los cuatro ejes definidos: cocina, género, sentimiento y tiempo verbal. No es extensible a otros atributos sin reentrenamiento.
- No se proporcionan métricas de calidad estándar (BLEU, ROUGE, perplexity) ni benchmarks de razonamiento o código, lo que limita la evaluación objetiva del rendimiento.
- El adaptador se ha entrenado en un dominio específico (reseñas de restaurantes); su comportamiento en otros géneros textuales puede ser impredecible.
- La licencia Apache 2.0 se aplica a los pesos, pero el uso comercial debe verificar la compatibilidad con el modelo base y los términos de los datos de entrenamiento.

## Enlaces

- [HuggingFace - kabing/Qwen2.5-1.5B-cbctg-prior](https://huggingface.co/kabing/Qwen2.5-1.5B-cbctg-prior)
- [Qwen/Qwen2.5-1.5B (modelo base)](https://huggingface.co/Qwen/Qwen2.5-1.5B)
- [Paper arXiv:2608.22956](https://arxiv.org/abs/2608.22956)
- [Repositorio de código cbctg-illusion-of-control](https://github.com/BiancaBing/cbctg-illusion-of-control)
