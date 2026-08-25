# kabing/gpt2-cbctg-prior

## Resumen

El modelo `kabing/gpt2-cbctg-prior` es un conjunto de módulos de generación de texto controlable mediante *concept bottleneck*, desarrollado por Qi Bing y Xiaowei Shao para el artículo «The Illusion of Control: Why Bare Classifier Inversion Fails in Concept-Bottleneck Text Generation» (EMNLP 2026). No contiene los pesos del modelo base, sino únicamente los parámetros entrenados por los autores: codificadores de concepto por eje, cabezas clasificadoras, un inyector de conceptos, un adaptador LoRA y un prior post-hoc. Está pensado para acoplarse a GPT-2 (124M) y permite generar texto condicionado a cuatro atributos discretos (cocina, género, sentimiento y tiempo verbal).

El modelo se presenta como una solución al problema de la *inversión de clasificador* en generación controlada: en lugar de optimizar directamente el espacio latente mediante un clasificador, los autores proponen un prior que estima la media condicional del código del encoder y actúa como denoiser, evitando los fallos silenciosos de la inversión ingenua. El repositorio incluye dos divisiones de datos (hold-out y ACD) con checkpoints completos, y el código de reproducción está disponible en GitHub.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-2 (124M) con LoRA (rank 8, alpha 16) sobre proyecciones de atención; módulos de concept bottleneck (encoders por eje, clasificadores, inyector AdaLN-zero) y prior post-hoc de una capa (128 GELU) |
| Parámetros totales | No disponible (modelo base GPT-2 124M + módulos adicionales; el repositorio ocupa 0.1 GB) |
| Parámetros activos | No aplica (no es un MoE) |
| Longitud de contexto | No disponible (GPT-2 base: 1024 tokens) |
| Tipos de cuantización | No disponible (solo pesos LoRA y módulos en formato .pt) |
| Idiomas soportados | No disponible (el dataset Fyelp sugiere inglés, pero no se especifica) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt), config en JSON (librería PEFT) |

## Arquitectura y entrenamiento

El sistema combina un generador GPT-2 (124M) con un adaptador LoRA (rank 8, alpha 16) aplicado a las proyecciones de atención, y un *concept bottleneck* de 4 ejes (cocina, género, sentimiento, tiempo verbal), cada uno con 32 dimensiones. El inyector utiliza AdaLN-zero y se inserta en cada bloque del transformer. El prior `g_γ` es un MLP de una capa oculta con 128 unidades GELU, entrenado post-hoc en menos de 30 segundos, que estima la media condicional del código del encoder a partir de las etiquetas objetivo. El entrenamiento de los módulos principales no está detallado en la model card; el paper describe el proceso completo, incluyendo las variantes de regularización y el baseline de normalizing flow.

## Capacidades

- Generación de texto condicionada a cuatro atributos discretos (cocina, género, sentimiento y tiempo verbal), con control fino sobre cada eje.
- Soporta tres protocolos de generación: `prior` (recomendado), `oracle` (codificación de texto de referencia) y `mode_b` (inversión de clasificador).
- Diseñado para estudios de *generalización composicional*: el checkpoint `acd` retiene la mitad de las configuraciones de atributos para evaluar la capacidad de combinar conceptos no vistos.
- No incluye capacidades de tool calling, agentes, visión o audio; es un módulo especializado para control de texto.
- Multilingüe: no disponible (probablemente limitado al inglés por el dataset Fyelp).
- No implementa modo de razonamiento explícito ni decodificación especulativa.

## Casos de uso

- Generación de reseñas de restaurantes con sentimiento y cocina específicos: el modelo puede producir textos que cumplan combinaciones de atributos (por ejemplo, «negativo + cocina italiana») usando el protocolo `prior`.
- Evaluación de métodos de control en generación de lenguaje: permite comparar la inversión de clasificador frente al prior post-hoc en términos de calidad y fidelidad a los atributos.
- Investigación en interpretabilidad: el bottleneck de 4 ejes facilita el análisis de cómo cada dimensión del código influye en el texto generado.
- Prototipado de sistemas de generación condicional con bajo coste de cómputo: al ser GPT-2 124M con LoRA, puede ejecutarse en hardware modesto.
- Estudio de generalización composicional en NLP: el split `acd` permite evaluar si el modelo combina atributos no vistos durante el entrenamiento.
- Comparación de baselines de control: el repositorio incluye variantes como `label_prior_flow` y `label_prior_factorized` para reproducir experimentos de ablación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el modelo es el «backbone principal» para la Tabla 1 del paper y para varios diagnósticos en apéndices, pero no proporciona métricas concretas (como MMLU, HumanEval o perplexity). No se incluyen comparaciones numéricas con otros modelos.

## Requisitos de hardware

- No se especifican requisitos oficiales; sin embargo, el modelo base GPT-2 124M ocupa aproximadamente 250 MB en FP16, y los módulos adicionales (LoRA, encoders, prior) son de tamaño reducido.
- Estimación de VRAM: menos de 1 GB en FP16 para inferencia; cabe en GPUs de consumo como NVIDIA GTX 1060 6GB o superiores.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; para entrenamiento o experimentos con batch grande, se sugiere al menos 8 GB.
- Opciones de despliegue: el código de reproducción está en GitHub y usa Python con PyTorch; se puede integrar con `transformers` y `PEFT`. No se mencionan soporte para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|
| `kabing/gpt2-cbctg-prior` | 124M + módulos | 1024 (heredado) | MIT | No publicado |
| `kabing/gpt2-medium-cbctg-prior` | 355M + módulos | 1024 (heredado) | MIT | No publicado |
| GPT-2 (base) | 124M | 1024 | MIT | No comparable (sin control de conceptos) |

La variante `gpt2-medium-cbctg-prior` ofrece una base más grande (355M) para el mismo enfoque, pero no se proporcionan métricas comparativas entre ambas. La diferencia principal es el tamaño del generador subyacente.

## Limitaciones y advertencias

- No incluye los pesos de GPT-2; es necesario descargarlos por separado desde `openai-community/gpt2` para usarlo.
- El modelo base GPT-2 (124M) tiene una capacidad limitada para textos largos y complejos; la longitud de contexto máxima es de 1024 tokens (heredada).
- Los módulos están entrenados para el dataset Fyelp (reseñas de restaurantes), por lo que su generalización a otros dominios o idiomas no está garantizada.
- El paper advierte que la inversión de clasificador sin regularización puede fallar silenciosamente; el uso del prior es el protocolo recomendado, pero no elimina el riesgo de alucinaciones.
- No se han publicado benchmarks de calidad o seguridad, por lo que su comportamiento en producción no está validado.
- Licencia MIT, pero el uso comercial de los módulos puede requerir verificar la compatibilidad con el modelo base GPT-2 (también MIT).
- El repositorio tiene 0 descargas y 0 likes; es un proyecto académico reciente (agosto 2026) sin evidencia de adopción en entornos reales.

## Enlaces

- Hugging Face: https://huggingface.co/kabing/gpt2-cbctg-prior
- Variante GPT-2 Medium: https://huggingface.co/kabing/gpt2-medium-cbctg-prior
- GitHub (código y checkpoints): https://github.com/BiancaBing/cbctg-illusion-of-control
- Paper (arXiv): https://arxiv.org/abs/2608.22956
- HTML del paper: https://arxiv.org/html/2608.22956v1
