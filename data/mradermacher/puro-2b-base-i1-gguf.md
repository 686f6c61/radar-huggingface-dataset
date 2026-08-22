# mradermacher/Puro-2B-Base-i1-GGUF

## Resumen

Puro-2B-Base-i1-GGUF es una cuantización en formato GGUF del modelo de lenguaje Puro-2B-Base, desarrollado por thu-pacman y distribuida por el usuario de Hugging Face mradermacher. Se trata de un modelo base (sin fine-tuning) de aproximadamente 2.000 millones de parámetros, entrenado sobre el conjunto de datos abierto thu-pacman/Puro-2B, con licencia Apache 2.0 y soporte para inglés y chino. La cuantización en GGUF permite ejecutar el modelo en entornos con recursos limitados, como CPU o GPU de consumo, mediante herramientas como llama.cpp u Ollama.

La relevancia de este modelo radica en su naturaleza completamente abierta (fully-open) y su tamaño compacto, que lo hace adecuado para tareas de generación de texto y razonamiento básico en entornos donde el coste de despliegue o la memoria disponible son factores críticos. Al estar cuantizado, se puede desplegar en dispositivos con poca VRAM, aunque no se dispone de documentación detallada sobre su arquitectura ni su rendimiento.

La ficha se basa exclusivamente en la información proporcionada por la model card de Hugging Face y la búsqueda web. No se han encontrado papers técnicos, benchmarks oficiales ni documentación adicional sobre el modelo base Puro-2B-Base, por lo que gran parte de los datos técnicos quedan sin especificar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (el archivo safetensors contiene 516.315 parámetros, pero no se corresponde con el total del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (imatrix), incluye Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, IQ1_S, IQ2_XS, IQ3_XS, IQ4_XS, etc. (ver lista completa en la model card) |
| Idiomas soportados | inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

Nota: el repositorio de cuantización contiene únicamente el archivo imatrix (0.1 GB) para crear cuantizaciones propias, no los pesos GGUF finales. El modelo base original se encuentra en [thu-pacman/Puro-2B-Base](https://huggingface.co/thu-pacman/Puro-2B-Base).

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura del modelo base. El nombre "Puro-2B-Base" sugiere un tamaño de 2 mil millones de parámetros, pero no se especifica si es un transformer denso, MoE u otro tipo. El dataset de entrenamiento es thu-pacman/Puro-2B, del que se desconoce composición exacta, número de tokens o metodología de entrenamiento (si se usó RLHF, DPO, etc.).

El modelo se presenta como un modelo base de pretraining, sin fine-tuning, con licencia totalmente abierta. La cuantización realizada por mradermacher utiliza el método imatrix (importance matrix) para optimizar la calidad de los pesos cuantizados, aunque no se aportan métricas de degradación.

## Capacidades

- Generación de texto en inglés y chino (idiomas declarados).
- Modelo base sin fine-tuning, por lo que no se garantizan capacidades específicas como razonamiento complejo, generación de código o matemáticas avanzadas.
- No se documenta soporte para tool calling, agentes, visión ni audio.
- Al ser un modelo de 2B parámetros, su capacidad de razonamiento y contexto es limitada en comparación con modelos más grandes.
- La cuantización GGUF permite su ejecución en CPU y GPU de baja gama, pero puede degradar la calidad de las respuestas.

## Casos de uso

- **Generación de texto en entornos con recursos limitados**: el formato GGUF permite ejecutar el modelo en CPU o GPU con poca VRAM, ideal para prototipos o aplicaciones embebidas.
- **Traducción básica entre inglés y chino**: al ser bilingüe, puede usarse como base para tareas de traducción o generación de contenido en ambos idiomas.
- **Fine-tuning específico**: al ser un modelo base, se puede adaptar mediante fine-tuning para tareas concretas como clasificación de texto, resumen o generación de diálogos.
- **Experimentos de cuantización**: el archivo imatrix proporcionado permite a los desarrolladores crear sus propias cuantizaciones personalizadas y comparar la calidad con otros métodos.
- **Despliegue en CPU**: con un tamaño de 0,1 GB (imatrix) o pesos GGUF cuantizados, se puede ejecutar en entornos sin GPU, como servidores de bajo coste o dispositivos de borde.
- **Pruebas de concepto**: para validar ideas de aplicaciones de IA generativa sin invertir en hardware de alto rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos de tamaño similar. La model card no incluye métricas de rendimiento ni evaluaciones de calidad.

## Requisitos de hardware

- **VRAM estimada**: con cuantizaciones como Q4_K_M (típica para GGUF), el modelo de 2B parámetros requiere aproximadamente 1-2 GB de VRAM o memoria RAM. El archivo imatrix de 0,1 GB es solo para generar quants, no para inferencia.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050) o incluso CPU con suficiente RAM.
- **Compatibilidad con consumer GPU**: sí, cabe en GPUs de consumo y también en sistemas sin GPU.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, text-generation-webui, y otros compatibles con GGUF.
- **Latencia y throughput**: no disponible, pero en una CPU moderna se espera una velocidad de 5-15 tokens/segundo con cuantización Q4; en una GPU como RTX 4060, 20-40 tokens/segundo (estimación orientativa).

## Comparativa con modelos similares

No disponible. No se encontraron modelos comparables en la información proporcionada. El modelo base Puro-2B-Base no tiene documentación que permita compararlo con alternativas como Qwen2.5-1.5B, Llama-3.2-1B o Gemma-2-2B.

## Limitaciones y advertencias

- **Modelo base**: al ser un modelo de pretraining sin fine-tuning, puede generar contenido incoherente o sesgado, y no está optimizado para tareas específicas.
- **Riesgo de alucinación**: como todo LLM, puede producir información falsa o inventada.
- **Idiomas**: solo soporta inglés y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- **Licencia**: Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base original para confirmar.
- **Cuantización**: la conversión a GGUF puede degradar la calidad de las respuestas, especialmente en cuantizaciones agresivas (IQ1, IQ2).
- **Sin documentación técnica**: no se han publicado detalles sobre la arquitectura, datos de entrenamiento o limitaciones del modelo base, lo que dificulta su uso en producción.

## Enlaces

- [Modelo cuantizado en Hugging Face](https://huggingface.co/mradermacher/Puro-2B-Base-i1-GGUF)
- [Modelo base thu-pacman/Puro-2B-Base](https://huggingface.co/thu-pacman/Puro-2B-Base)
- [Dataset thu-pacman/Puro-2B](https://huggingface.co/datasets/thu-pacman/Puro-2B)
- [Página de mradermacher en Hugging Face](https://huggingface.co/mradermacher)
- [Guía de uso de GGUF de TheBloke](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF) (referencia para usar archivos GGUF)
