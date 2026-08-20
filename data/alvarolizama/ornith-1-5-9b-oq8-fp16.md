# alvarolizama/Ornith-1.5-9B-oQ8-fp16

## Resumen

El modelo `alvarolizama/Ornith-1.5-9B-oQ8-fp16` es una versión cuantizada en 8 bits de un modelo de tipo `qwen3_5`, creada por el usuario alvarolizama. La cuantización se ha realizado con la herramienta oQ (oMLX v0.6.0.dev1), que aplica cuantización de precisión mixta, y el resultado se ha publicado en formato MLX (safetensors) para su uso en dispositivos con Apple Silicon. El nombre sugiere que se basa en un modelo de aproximadamente 9B de parámetros, aunque los datos reales de los safetensors indican 2.975.030.512 parámetros, lo que podría deberse a una poda o a un conteo incompleto. El repositorio ocupa 11.4 GB, lo que apunta a que los tensores están almacenados en 8 bits con algunos componentes en fp16.

Este modelo es relevante para desarrolladores que buscan desplegar modelos de lenguaje en hardware con memoria limitada, especialmente en entornos macOS con el framework MLX. Al estar cuantizado a 8 bits con group size 64, ofrece un equilibrio entre calidad y eficiencia, aunque no se dispone de documentación oficial sobre su rendimiento o capacidades.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (no se especifica el tipo exacto de transformer) |
| Parametros totales | 2.975.030.512 (según safetensors) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (oQ mixed-precision, group size 64) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (compatible con MLX) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base (qwen3_5), ni sobre los datos de entrenamiento, el número de tokens, el proceso de alineación (RLHF/DPO) o cualquier innovación técnica. La única información técnica disponible es que se trata de una cuantización mixta de 8 bits aplicada sobre un modelo `qwen3_5` utilizando la librería oMLX. El nombre del modelo sugiere que es una variante de la serie Qwen, pero no se confirma.

## Capacidades

No se han publicado capacidades específicas en la model card. Al ser una variante de `qwen3_5`, es probable que herede las capacidades típicas de los modelos Qwen (generación de texto, razonamiento, código, matemáticas), pero no hay evidencia en la información disponible. No se mencionan capacidades de tool calling, agentes, visión, audio, etc.

## Casos de uso

Dado que no se conocen las capacidades concretas, los casos de uso se limitan a inferencias razonables basadas en el tipo de modelo y su cuantización:

- **Despliegue en Apple Silicon**: Al estar en formato MLX, el modelo puede ejecutarse eficientemente en Macs con GPU unificada, aprovechando la memoria compartida y el framework MLX.
- **Prototipado rápido**: Su tamaño moderado (~3B parámetros en 8 bits) permite cargarlo en memoria en equipos con 16 GB de RAM, facilitando pruebas de generación de texto o experimentos de NLP.
- **Aplicaciones de baja latencia**: La cuantización de 8 bits reduce el uso de memoria y acelera la inferencia, adecuado para aplicaciones en tiempo real en dispositivos locales.
- **Filtrado y análisis de texto**: Si el modelo base es competente en tareas de clasificación o extracción, puede usarse en pipelines de procesamiento de texto sin depender de la nube.
- **Asistentes conversacionales**: Con un contexto largo (si lo tuviera), podría emplearse en chatbots, aunque no se confirma la longitud de contexto.
- **Educación e investigación**: Sirve como ejemplo de cuantización con oQ para estudiar el impacto de la precisión mixta en modelos de tipo Qwen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: No se proporciona un valor oficial. Dado que el repositorio ocupa 11.4 GB y la cuantización es de 8 bits, se puede estimar que la carga en memoria requerirá al menos 11.4 GB (si se cargan todos los tensores), aunque MLX puede gestionar la memoria de manera eficiente.
- **GPU recomendadas**: Compatible con cualquier dispositivo Apple Silicon (M1, M2, M3, M4) gracias a MLX. También podría ejecutarse en CPU en otras plataformas con adaptación, pero no se ha probado.
- **GPU consumer**: Es adecuado para Macs con 16 GB de RAM o más. En PC con GPUs NVIDIA, se podría convertir a otro formato (por ejemplo, GGUF) pero no está disponible.
- **Opciones de despliegue**: MLX (recomendado), posiblemente también se pueda cargar con la librería `mlx-lm` o mediante el paquete `omlx` para inferencia.
- **Latencia y throughput**: No se dispone de mediciones.

## Comparativa con modelos similares

No se dispone de información sobre el modelo base (qwen3_5) ni de modelos comparables. Se necesitaría conocer el rendimiento del modelo original para establecer una comparación. La información disponible es insuficiente.

## Limitaciones y advertencias

- **Falta de documentación**: La model card no incluye licencia, idiomas, contexto, ni datos de entrenamiento. Esto impide evaluar su uso legal y técnico.
- **Posibles sesgos y alucinaciones**: Al ser un modelo basado en Qwen, puede heredar sesgos y tendencias a alucinar, pero no hay evidencia específica.
- **Riesgo de rendimiento inferior**: La cuantización de 8 bits puede degradar la calidad en tareas de alta precisión, aunque con group size 64 se espera una pérdida mínima.
- **Compatibilidad limitada**: Solo está disponible en formato MLX, lo que restringe su uso a entornos con Apple Silicon o mediante conversión manual.
- **Sin soporte comercial**: Al no especificarse licencia, no se puede garantizar su uso en producción comercial.

## Enlaces

- [HuggingFace - alvarolizama/Ornith-1.5-9B-oQ8-fp16](https://huggingface.co/alvarolizama/Ornith-1.5-9B-oQ8-fp16)
- [Repositorio oQ (oMLX)](https://github.com/jundot/omlx) (referenciado en la model card)
