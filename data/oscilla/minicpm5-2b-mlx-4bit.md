# Oscilla/MiniCPM5-2B-mlx-4Bit

## Resumen

Oscilla/MiniCPM5-2B-mlx-4Bit es una conversión del modelo MiniCPM5-2B de OpenBMB al formato MLX, cuantizado a 4 bits. El modelo original es un transformer denso de 2.516.756.480 parámetros, diseñado para ejecución en dispositivos edge y móviles, con soporte de contexto largo, tool calling y conversación bilingüe en inglés y chino. Esta versión, creada por Oscilla, permite ejecutar el modelo en Apple Silicon mediante mlx-lm, con un tamaño de repositorio de 1.4 GB.

El modelo se entrenó sobre datasets de OpenBMB como Ultra-FineWeb, UltraX-Preview, UltraData-Math y UltraData-Code, entre otros. Según una noticia externa, el modelo base MiniCPM5-2B obtiene un promedio de 53.9 en 34 benchmarks y supera a modelos de 4B, aunque no se proporcionan resultados desglosados en la información disponible. Esta conversión MLX 4-bit mantiene la arquitectura y los pesos, pero en un formato optimizado para entornos con memoria limitada. Es relevante ahora porque ofrece una opción de IA generativa local, bilingüe y con soporte de herramientas, ideal para aplicaciones de edge AI y asistentes en dispositivos móviles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Llama |
| Parámetros totales | 2.516.756.480 (2,5B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 4-bit (MLX) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors, MLX (mlx-lm) |

## Arquitectura y entrenamiento

El modelo es un transformer denso que sigue la arquitectura Llama, con 2.516.756.480 parámetros. No se ha publicado información detallada sobre el número de capas, cabezas de atención o dimensiones ocultas en la información disponible. El entrenamiento se realizó sobre una combinación de datasets de OpenBMB, incluyendo Ultra-FineWeb, UltraX-Preview, Ultra-FineWeb-L3, UltraData-Math, UltraData-Code, UltraData-SFT-2605, UltraData-SFT-Agent-2609 y UltraData-RL-2609. Estos conjuntos sugieren un enfoque en datos sintéticos de alta calidad, razonamiento matemático, código y datos de interacción con agentes. No se especifica en la información disponible si se emplearon técnicas de RLHF o DPO. La conversión a MLX se realizó con mlx-lm 0.31.2, aplicando cuantización a 4 bits.

## Capacidades

- Generación de texto conversacional bilingüe (inglés y chino).
- Soporte de tool calling / function calling, según las etiquetas del modelo.
- Capacidades de razonamiento y matemáticas, gracias al entrenamiento con UltraData-Math.
- Generación y comprensión de código, con UltraData-Code.
- Soporte de agentes y razonamiento multi-paso, por los datasets de SFT-Agent y RL.
- Contexto largo: el modelo está etiquetado como "long-context", aunque la longitud exacta no se especifica.
- Despliegue en dispositivos edge y on-device, con eficiencia de memoria.
- Sin soporte de visión ni audio: es un modelo de texto puro.

## Casos de uso

- Asistentes conversacionales en dispositivos móviles: gracias a su tamaño de 2B y cuantización 4-bit, puede ejecutarse localmente en un smartphone o en una Mac con Apple Silicon, ofreciendo respuestas en inglés y chino sin necesidad de conexión a internet.
- Atención al cliente bilingüe: con soporte de tool calling, el modelo puede consultar bases de conocimiento, sistemas de ticketing o APIs de gestión de pedidos, y mantener conversaciones multi-turno en inglés y chino.
- Generación de código en entornos locales: desarrolladores pueden usarlo para autocompletar fragmentos de código, explicar funciones o generar tests, aprovechando el entrenamiento con UltraData-Code.
- Agentes autónomos: el soporte de tool calling y el entrenamiento con datos de agentes permiten construir pipelines de razonamiento multi-paso, como agentes de búsqueda que encadenan llamadas a herramientas.
- Tutoría de matemáticas en educación: el modelo puede resolver problemas matemáticos y explicar pasos intermedios, gracias a UltraData-Math. Es adecuado para aplicaciones educativas offline en dispositivos con recursos limitados.
- Análisis de documentos de contexto largo: la etiqueta "long-context" indica que el modelo puede procesar documentos extensos, como contratos o informes, para resumir o extraer información, siempre que la longitud de contexto no supere el límite real del modelo.
- Aplicaciones de edge AI en entornos industriales: por su bajo consumo de memoria (1.4 GB) y licencia Apache 2.0, puede integrarse en sistemas embebidos o en routers con capacidad de cómputo limitada para tareas de clasificación de texto o extracción de entidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Según una noticia externa, el modelo base MiniCPM5-2B obtiene un promedio de 53.9 en 34 benchmarks y supera a modelos de 4B, pero no se proporcionan resultados desglosados en la información disponible.

## Requisitos de hardware

- VRAM estimada: al ser una cuantización 4-bit con un peso total de 1.4 GB, se estima que la inferencia requiere aproximadamente 1.5-2 GB de memoria para los pesos, más overhead de KV cache. En la práctica, se recomiendan al menos 4 GB de VRAM o memoria unificada.
- GPU recomendadas: no se proporcionan recomendaciones oficiales. Por su formato MLX, está optimizado para Apple Silicon (M1/M2/M3/M4). En GPU NVIDIA, podría ejecutarse mediante la carga de pesos en safetensors con Transformers, pero la cuantización MLX no es directamente compatible.
- Capacidad en GPU de consumo: sí, cabe en GPUs con 4 GB o más, como la RTX 3050 o superiores, siempre que se convierta a un formato compatible (por ejemplo, GGUF).
- Opciones de despliegue: mlx-lm (Apple Silicon), Transformers (carga de safetensors), posible conversión a GGUF para llama.cpp.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría en los datos proporcionados. La única referencia comparable es el modelo base openbmb/MiniCPM5-2B, del cual esta versión es una conversión cuantizada a 4-bit. También existe la versión openbmb/MiniCPM5-2B-MLX, que es la conversión oficial del mismo modelo. No se han proporcionado datos de otros modelos de 2B o 4B para establecer una comparación.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; no soporta otros idiomas.
- Es un modelo de texto puro: no tiene capacidades de visión ni audio.
- La cuantización a 4-bit puede producir una degradación en la calidad de las respuestas respecto al modelo original en precisión completa.
- La longitud de contexto exacta no está especificada, lo que puede suponer un riesgo en aplicaciones que requieran procesar documentos muy largos.
- El formato MLX limita el despliegue nativo a entornos Apple Silicon; para otros entornos es necesario convertir los pesos.
- No se han documentado sesgos específicos, pero al estar entrenado principalmente con datos en inglés y chino, puede reflejar sesgos culturales de esos idiomas.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas de razonamiento complejo o con datos no cubiertos en el entrenamiento.

## Enlaces

- Página del modelo: https://huggingface.co/Oscilla/MiniCPM5-2B-mlx-4Bit
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Versión MLX oficial: https://huggingface.co/openbmb/MiniCPM5-2B-MLX
- Noticia sobre el modelo base: https://www.aimodeling.com/en/news/slug/openbmb-minicpm5-2b-on-device
