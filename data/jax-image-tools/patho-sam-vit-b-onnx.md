# jax-image-tools/patho-sam-vit-b-onnx

## Resumen

El modelo `jax-image-tools/patho-sam-vit-b-onnx` es una exportación a ONNX del modelo de segmentación de imágenes `patho-sam` (variante `vit_b_histopathology`), especializado en tejido teñido con hematoxilina-eosina (H&E) para histopatología. Desarrollado por el equipo de JAX Image Tools, este modelo permite realizar segmentación semántica de imágenes médicas mediante prompts interactivos (puntos o cajas) directamente en el navegador, gracias a su compatibilidad con onnxruntime-web y WebGPU. Se trata de la versión histopatológica del modelo `microsam-vit-b-lm-onnx`, y su distribución se realiza a través del registro de modelos de micro-sam.

El modelo se compone de dos grafos ONNX: un encoder de imagen (en precisión fp16, ~172 MB) que procesa imágenes de 1024x1024 píxeles y genera embeddings, y un decoder (fp32, ~16 MB) que convierte esos embeddings y las indicaciones del usuario en máscaras de segmentación. Esta separación permite calcular el embedding una sola vez por imagen y realizar múltiples consultas de segmentación de forma eficiente, lo que lo hace especialmente adecuado para aplicaciones interactivas de anotación en patología digital. El repositorio incluye el modelo exportado, pero la licencia original del modelo base (Segment Anything, Apache-2.0) se mantiene para el modelo subyacente.

La relevancia actual de este modelo radica en la creciente demanda de herramientas de segmentación asistida por IA en el ámbito médico, donde la ejecución local en el navegador reduce la dependencia de servidores externos y garantiza la privacidad de los datos clínicos. Al estar optimizado para WebGPU, ofrece un rendimiento en tiempo real en dispositivos compatibles, lo que lo convierte en una opción práctica para entornos de investigación y diagnóstico asistido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Segment Anything (SAM) ViT-Base (Vision Transformer) |
| Parametros totales | No disponible (el modelo base ViT-B de SAM tiene aproximadamente 86 millones, pero no se especifica en la informacion) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | fp16 (encoder) y fp32 (decoder) |
| Idiomas soportados | No disponible (modelo de vision, no textual) |
| Licencia | cc-by-4.0 para el repositorio ONNX; el modelo base patho-sam es Apache-2.0 (según la model card) |
| Formato de pesos | ONNX (safetensors no aplica; los archivos son `.onnx`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Segment Anything (SAM), con un encoder de tipo Vision Transformer (ViT-Base) que procesa imágenes de 1024×1024 píxeles y genera embeddings de 256×64×64, y un decoder que combina estos embeddings con indicaciones de usuario (puntos positivos/negativos o cajas) para producir máscaras de segmentación. La exportación a ONNX separa ambos componentes en grafos independientes: el encoder se cuantifica a fp16 para reducir el tamaño y acelerar la inferencia, mientras que el decoder permanece en fp32 para mantener la precisión en la generación de máscaras.

El entrenamiento original de `patho-sam` se realizó mediante un ajuste fino (fine-tuning) del modelo base SAM sobre imágenes histopatológicas teñidas con H&E, con el objetivo de adaptar la representación de características a las texturas y estructuras propias de los tejidos teñidos. Los detalles concretos del dataset de entrenamiento (número de imágenes, composición, etc.) no se especifican en la información disponible, pero se indica que el modelo se distribuye a través del registro de modelos de micro-sam, que es un proyecto enfocado en segmentación de imágenes de microscopía. No se menciona el uso de técnicas de RLHF o DPO, ya que se trata de un modelo de visión.

## Capacidades

- Segmentación de imágenes histopatológicas con indicaciones interactivas: el usuario puede proporcionar puntos positivos (que indican la región a segmentar) o puntos negativos (para excluir regiones), así como cajas delimitadoras (box prompts) para guiar el modelo.
- Generación de máscaras de segmentación a alta resolución: el decoder devuelve la máscara redimensionada al tamaño original de la imagen, lo que facilita su integración en flujos de trabajo de anotación.
- Inferencia en el navegador: gracias a la exportación a ONNX y el uso de `onnxruntime-web` con WebGPU, el modelo puede ejecutarse localmente en el cliente sin necesidad de servidor, lo que es especialmente útil para aplicaciones de visualización de imágenes médicas.
- Especialización en tejido teñido con H&E: el fine-tuning en imágenes histopatológicas lo hace adecuado para tareas como segmentación de núcleos celulares, regiones tumorales o estructuras tisulares.
- Compatibilidad con la herramienta JAX Image Tools viewer: se integra como herramienta de segmentación SAM en el visor de imágenes de la plataforma JAX Image Tools (módulo jit-ui#90).
- No incluye capacidades de procesamiento de texto, visión general o generación de código; se limita a la segmentación de imágenes.

## Casos de uso

- Anotación de imágenes histopatológicas en investigación biomédica: los patólogos pueden usar el modelo para segmentar células o estructuras en imágenes de H&E, acelerando el proceso de anotación manual. Gracias a la ejecución local en el navegador, no se requiere transferir imágenes a servidores externos, preservando la privacidad de los datos clínicos.
- Diagnóstico asistido por computador (CAD): integrado en herramientas de análisis de imágenes médicas, el modelo puede identificar regiones tumorales o áreas de interés en biopsias, proporcionando una primera pasada de segmentación que el clínico puede refinar con prompts.
- Análisis de muestras de tejido en investigación: los investigadores pueden usar el modelo para cuantificar la densidad de células, medir áreas de fibrosis o segmentar componentes específicos del tejido, con la posibilidad de procesar múltiples imágenes de forma interactiva.
- Herramientas de anotación colaborativa en la nube: al poder ejecutarse en el navegador, se puede integrar en plataformas web de anotación colaborativa donde varios usuarios segmentan imágenes de forma simultánea sin necesidad de instalar software pesado.
- Educación y formación en patología: el modelo puede usarse en entornos docentes para demostrar técnicas de segmentación y análisis de imágenes médicas, con una interfaz interactiva que permite a los estudiantes experimentar con diferentes prompts.
- Integración en pipelines de análisis de imágenes de microscopía de alto rendimiento: aunque el modelo está pensado para uso interactivo, su formato ONNX permite ser integrado en pipelines de procesamiento por lotes con `onnxruntime` en Python, para aplicaciones de investigación que requieren segmentación de grandes volúmenes de imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como IoU, Dice o precisión en datasets específicos de histopatología. Por tanto, no se puede comparar cuantitativamente con otros modelos de segmentación en este momento.

## Requisitos de hardware

- El modelo está diseñado para ejecutarse en el navegador con WebGPU, por lo que puede funcionar en GPUs integradas o discretas compatibles con WebGPU. El tamaño del encoder fp16 (~172 MB) y el decoder fp32 (~16 MB) sugiere que la carga en memoria es moderada.
- **VRAM estimada**: para la inferencia, el encoder requiere aproximadamente 200 MB de memoria GPU (incluyendo overhead de runtime), y el decoder unos 50 MB. En total, se estima menos de 300 MB de VRAM, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM.
- **GPU recomendadas**: cualquier GPU compatible con WebGPU (p. ej., NVIDIA GTX 10 series o superior, AMD RX 5000 series o superior, Apple Silicon, Intel Arc). También puede ejecutarse en CPU usando `onnxruntime` con backend de CPU, aunque la velocidad será menor.
- **Opciones de despliegue**: 
  - Navegador: `onnxruntime-web` con WebGPU (recomendado).
  - Python: `onnxruntime` con GPU o CPU.
  - No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI, ya que es un modelo de visión, no un LLM.
- **Latencia y throughput**: no se proporcionan datos específicos. En GPU con WebGPU, el encoder típicamente procesa una imagen en menos de 100 ms (estimación razonable), y el decoder en menos de 10 ms por prompt. En CPU, el encoder puede tardar varios segundos.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Formato | Licencia | Uso principal |
|---|---|---|---|---|---|
| **patho-sam-vit-b-onnx** | SAM ViT-B (fine-tuned histología) | Imagen 1024x1024 | ONNX (fp16/fp32) | cc-by-4.0 (repo), Apache-2.0 (base) | Segmentación histopatológica en navegador |
| **microsam-vit-b-lm-onnx** (mencionado como hermano) | SAM ViT-B (fine-tuned microscopía) | Imagen 1024x1024 | ONNX | No especificado | Segmentación de microscopía en navegador |
| **rajlab/sam_vit_b** | SAM ViT-B (original) | Imagen 1024x1024 | PyTorch | Apache-2.0 | Segmentación general de imágenes |

La comparación se basa en la información de la model card. No se dispone de datos de rendimiento comparativos (métricas de segmentación) para estos modelos. El modelo `patho-sam` está especializado en tejido H&E, mientras que `microsam-vit-b-lm` se enfoca en imágenes de microscopía de luz. El modelo base `sam_vit_b` es el original de SAM, sin fine-tuning específico.

## Limitaciones y advertencias

- **Especialización limitada**: el modelo está ajustado para histopatología H&E; puede no funcionar bien en otros tipos de imágenes (por ejemplo, radiografías o imágenes de resonancia magnética) o en otros tipos de tinción.
- **Riesgo de sesgo y alucinación**: al ser un modelo de segmentación, no genera texto, pero puede producir máscaras erróneas en regiones ambiguas o con artefactos de tinción. No se ha documentado una evaluación de sesgos en la información disponible.
- **Requisitos de preprocesamiento**: la imagen de entrada debe ser redimensionada a una longitud máxima de 1024 píxeles, normalizada y paddeada según las especificaciones de SAM. Esto debe implementarse en el cliente, lo que puede requerir cuidado para evitar errores.
- **Licencia dual**: aunque el repositorio ONNX se distribuye bajo cc-by-4.0, el modelo base patho-sam tiene licencia Apache-2.0. Para uso comercial, es necesario revisar la licencia del modelo base original y las condiciones de la distribución de ONNX.
- **Sin soporte de texto**: no es un modelo multimodal; no procesa texto ni genera descripciones. Solo se puede usar para segmentación de imágenes.
- **Dependencia de WebGPU**: la ejecución en navegador requiere un dispositivo compatible con WebGPU; en navegadores antiguos o sin soporte, la inferencia puede fallar o degradarse a CPU.
- **Sin datos de rendimiento**: no se haan publicado métricas cuantitativas (IoU, Dice, etc.) en el repositorio, por lo que el rendimiento real en tareas específicas no está validado.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/jax-image-tools/patho-sam-vit-b-onnx)
- [Repositorio de patho-sam en GitHub](https://github.com/computational-cell-analytics/patho-sam) (mencionado en la model card)
- [Proyecto sam-js para exportación](https://github.com/sam-js) (no se ha proporcionado URL completa, se infiere del contexto)
- [Registro de modelos micro-sam](https://github.com/computational-cell-analytics/micro-sam) (referenciado indirectamente)
