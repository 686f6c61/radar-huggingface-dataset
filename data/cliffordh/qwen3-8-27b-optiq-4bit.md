# cliffordh/Qwen3.8-27B-OptiQ-4bit

## Resumen

Qwen3.8-27B-OptiQ-4bit es una cuantización de precisión mixta 4/8 bits del modelo Qwen/Qwen3.8-27B, desarrollada por cliffordh mediante la herramienta mlx-optiq. El proceso utiliza un análisis de sensibilidad basado en divergencia KL sobre una mezcla de seis dominios para asignar 8 bits a las capas más sensibles y 4 bits a las robustas, logrando un promedio de 5.15 bits por peso. El resultado es un modelo multimodal (imagen-texto a texto) optimizado para Apple Silicon, con un tamaño en disco de aproximadamente 20 GB y la capacidad de ejecutarse en hardware de consumo sin presión de memoria swap.

Este modelo es relevante porque aborda el problema del equilibrio entre tamaño, rendimiento y precisión en cuantización: en lugar de aplicar una precisión uniforme, adapta la asignación de bits según la sensibilidad de cada capa, preservando mejor las capacidades de razonamiento del modelo original. Incluye además una cabeza de predicción multi-token (MTP) para decodificación especulativa y un encoder de visión en precisión completa, manteniendo las capacidades multimodales del modelo base. Está licenciado bajo Apache 2.0, lo que permite uso comercial y modificación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con vision encoder (base Qwen3.8-27B) |
| Parametros totales | 5.855.923.440 (según safetensors); la model card indica ~26.9B (discrepancia no resuelta) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4/8-bit mixto (OptiQ), promedio 5.15 bpw |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una derivación cuantizada de Qwen/Qwen3.8-27B, un modelo multimodal de la familia Qwen desarrollado por Alibaba Cloud. La arquitectura subyacente es un transformer con capacidad de procesamiento de imagen y texto, aunque los detalles concretos (número de capas, dimensiones, atención) no se especifican en la información disponible. El proceso de cuantización emplea mlx-optiq, que mide la divergencia KL entre las salidas de cada capa cuantizada y las de la capa original en un conjunto de calibración de seis dominios. Las capas con mayor sensibilidad reciben 8 bits (274 capas) y las más robustas 4 bits (224 capas), resultando en un total de 498 capas cuantizadas y un promedio de 5.15 bpw.

No se realizó ningún ajuste fino ni cambio de alineación; solo se modificaron las representaciones de pesos. El modelo base conserva la alineación RLHF heredada de su entrenamiento original. Se incluyen componentes adicionales: una cabeza MTP (multi-token prediction) para acelerar la decodificación especulativa (~1.4x de throughput) y un encoder de visión en precisión completa (879 MB) que preserva las capacidades multimodales. La cuantización fue validada contra baselines uniformes de 4 y 8 bits mediante un conjunto de pruebas de razonamiento diseñadas para detectar degradaciones típicas de baja precisión.

## Capacidades

- Generación de texto y razonamiento: mantiene capacidades de razonamiento aritmético, lógico y de comprobación de premisas, según las pruebas de validación internas.
- Multimodalidad: procesa imágenes y texto (image-text-to-text), con un vision encoder en precisión completa que permite identificar detalles visuales finos.
- Decodificación especulativa: incluye cabeza MTP que permite un aumento de throughput de aproximadamente 1.4x en servidores compatibles.
- Compatibilidad con Apple Silicon: optimizado para ejecutarse en hardware Apple (MLX), con uso eficiente de memoria.
- Tool calling y agentes: no se menciona soporte específico en la información proporcionada.
- Multilingüismo: no se especifican idiomas soportados; se asume herencia del modelo base, pero no hay datos concretos.

## Casos de uso

- Despliegue local en Mac con Apple Silicon: el modelo está diseñado para MLX, permitiendo ejecutar un LLM multimodal de ~27B en un Mac con 48 GB de RAM sin presión de swap, como se validó en un M4 Pro. Adecuado para prototipado y desarrollo local.
- Asistente de razonamiento con entrada visual: al conservar el vision encoder en precisión completa, puede analizar imágenes y responder preguntas que requieren comprensión de detalles visuales (por ejemplo, identificar elementos en una fotografía o distinguir entre una imagen real y una ilustración).
- Investigación en cuantización: el repositorio incluye datos de sensibilidad por capa (sensitivity.json) y metadatos de asignación de bits, lo que lo convierte en un recurso útil para estudiar el impacto de la cuantización mixta en modelos multimodales.
- Pruebas de robustez de razonamiento bajo cuantización: las validaciones internas demuestran que este modelo mantiene correctas operaciones aritméticas complejas y detección de premisas falsas, lo que puede servir para evaluar la degradación de modelos cuantizados en tareas de lógica.
- Servicio de inferencia con decodificación especulativa: mediante el comando `optiq serve --mtp`, se puede desplegar un endpoint que aprovecha la cabeza MTP para reducir la latencia en aplicaciones de chat o generación de texto.
- Educación y experimentación: al ser Apache 2.0 y estar disponible en HuggingFace, es útil para aprender sobre cuantización de precisión mixta y su aplicación práctica en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye una validación interna con tres pruebas de razonamiento comparando el modelo OptiQ 4/8 contra baselines uniformes de 4 y 8 bits:

| Prueba de razonamiento | Uniform 4-bit | OptiQ 4/8 | Uniform 8-bit |
|---|---|---|---|
| Precisión aritmética (cálculo de impuestos combinados) | Incorrecto (resultado a la mitad) | Correcto | Correcto |
| Razonamiento numérico multi-restricción (presupuesto con meses de 3 pagas) | Perdió la estructura de meses con 3 pagas | Enumeró correctamente los meses de mayores ingresos | Enumeró correctamente los meses de mayores ingresos |
| Comprobación de premisas (premisa falsa sutil) | Aceptó la premisa falsa | Detectó la premisa falsa | Detectó la premisa falsa |

Estos resultados indican que la cuantización mixta preserva mejor el razonamiento que la uniforme de 4 bits, acercándose al comportamiento de la de 8 bits, pero no constituyen métricas de rendimiento general.

## Requisitos de hardware

- VRAM estimada: el modelo requiere aproximadamente 20 GB en disco; en un M4 Pro con 48 GB de RAM unificada, la carga completa con vision tower alcanza un pico de ~24.7 GB, sin swap pressure.
- GPU recomendadas: diseñado para Apple Silicon (M1/M2/M3/M4); no hay información sobre GPUs NVIDIA o AMD.
- Compatibilidad con consumer GPU: sí, en Macs con al menos 32 GB de RAM unificada; con 24 GB podría funcionar sin vision tower, aunque no está verificado.
- Opciones de despliegue: mlx-lm para carga y generación, y `optiq serve` para servir con decodificación especulativa MTP.
- Latencia y throughput: no hay mediciones publicadas; la cabeza MTP promete un aumento de ~1.4x en throughput, pero sin datos concretos.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de la misma categoría (tamaño, modalidad y cuantización). El único punto de referencia claro es el modelo base Qwen/Qwen3.8-27B, del cual esta es una derivación cuantizada. Frente a él, este modelo reduce el tamaño en disco (~20 GB frente a los pesos originales, cuyo tamaño no se especifica) y permite ejecutarse en hardware con menos memoria, a costa de una posible ligera degradación en precisión. No hay datos de otros modelos cuantizados con OptiQ o similares para establecer una comparativa.

## Limitaciones y advertencias

- Modelo experimental: la model card lo describe como "experimental" y "AS-IS", sin garantía de idoneidad para ningún propósito. No debe usarse en producción sin verificación independiente.
- Discrepancia en el número de parámetros: los safetensors indican ~5.86B parámetros, mientras que la model card afirma ~26.9B. Esta inconsistencia no está resuelta y puede indicar que el archivo contiene solo una parte del modelo o que hay un error en los metadatos.
- Alineación RLHF heredada: el modelo base evita ciertos temas políticamente sensibles, lo que puede limitar su uso en contextos que requieran neutralidad total.
- Riesgo de alucinación: no se han realizado pruebas exhaustivas; las validaciones cubren solo tres escenarios de razonamiento específicos.
- Sin benchmarks estándar: no hay resultados de MMLU, HumanEval, etc., lo que dificulta evaluar su rendimiento general.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- Dependencia de MLX: el formato de pesos es específico de MLX; para usarlo en otros frameworks (vLLM, llama.cpp) sería necesaria una conversión adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cliffordh/Qwen3.8-27B-OptiQ-4bit
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta mlx-optiq: https://mlx-optiq.com
