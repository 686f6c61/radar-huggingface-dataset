# Djanghao/Widget2Code-Qwen3.5-9B-LoRA-SFT-Merged

## Resumen

Widget2Code-Qwen3.5-9B-LoRA-SFT-Merged es un modelo de lenguaje multimodal especializado en la conversión de capturas de pantalla de widgets de interfaz a código React JSX autocontenido. Desarrollado por Djanghao, se basa en el modelo Qwen/Qwen3.5-9B y ha sido ajustado mediante LoRA (rank 32, alpha 64) sobre un conjunto de 1.816 pares imagen-código del dataset Widget2Code-Data. El resultado es un checkpoint BF16 con los pesos del adaptador fusionados, listo para inferencia directa sin necesidad de cargar módulos PEFT.

El modelo resuelve el problema de generar código de interfaz a partir de una imagen, incorporando además contexto determinista como dimensiones, resultados de OCR y paleta de colores. Su relevancia radica en que ofrece una alternativa especializada frente a modelos generalistas multimodales, con una tasa de renderizado del 95,4% en una evaluación de 1.000 imágenes y un SSIM medio de 0,728. Está pensado para desarrolladores que necesitan prototipar interfaces rápidamente o integrar la generación de código en pipelines de automatización frontend.

El checkpoint se publica como inicialización recomendada para experimentos de aprendizaje por refuerzo (DAPO/GRPO) sobre la misma tarea, aunque también puede usarse directamente para inferencia screenshot-to-JSX. El autor advierte que el código generado puede ser inválido o inseguro, por lo que debe ejecutarse siempre en entornos sandbox.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (basado en Qwen/Qwen3.5-9B) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (pesos originales); cuantizaciones adicionales no especificadas |
| Idiomas soportados | No disponibles |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning LoRA del modelo base Qwen/Qwen3.5-9B, un transformer multimodal de 9.000 millones de parámetros que procesa tanto texto como imágenes. El adaptador LoRA se entrenó con rank 32, alpha 64 y dropout 0,05 durante 4 épocas sobre 1.816 ejemplos de pares imagen-código del dataset Widget2Code-Data. Tras el entrenamiento, los pesos del adaptador se fusionaron en el modelo base y se guardaron como checkpoint BF16 independiente, sin módulos PEFT residuales.

No se menciona el uso de RLHF, DPO u otras técnicas de alineación; el entrenamiento es exclusivamente de supervisión (SFT). La innovación principal reside en la tarea: el modelo recibe como entrada una captura de pantalla junto con contexto determinista (dimensiones, OCR y paleta) y genera un componente React JSX autocontenido. Los detalles de fusión y hashes del adaptador fuente se registran en `merge_provenance.json`.

## Capacidades

- Generación de código React JSX autocontenido a partir de una captura de pantalla de un widget de interfaz.
- Incorporación de contexto determinista (dimensiones, OCR, paleta de colores) para guiar la generación.
- Inferencia directa sin necesidad de cargar adaptadores PEFT adicionales.
- Adecuado como punto de partida para experimentos de aprendizaje por refuerzo (DAPO/GRPO) sobre la misma tarea.
- No se documentan capacidades adicionales como tool calling, agentes o razonamiento multi-paso.

## Casos de uso

- Prototipado rápido de interfaces: un desarrollador de producto puede capturar una imagen de un diseño o wireframe y obtener un componente React listo para integrar en un proyecto, reduciendo el tiempo de maquetación manual.
- Automatización de migración de UI: dado un conjunto de capturas de pantalla de una aplicación antigua, el modelo puede generar componentes JSX equivalentes, facilitando la migración a un stack moderno.
- Generación de componentes accesibles: al incluir contexto de OCR y paleta, el modelo puede producir código que respete los textos y colores originales, útil para mantener consistencia visual en bibliotecas de componentes.
- Asistente de desarrollo en tiempo real: integrado en un IDE o editor, el modelo puede convertir un boceto en código mientras el desarrollador trabaja, acelerando el ciclo de iteración.
- Generación de fixtures de prueba: el código JSX generado puede servir como base para crear componentes de prueba en entornos de testing visual, comparando el renderizado con la imagen original.
- Inicialización para entrenamiento con RL: investigadores pueden usar este checkpoint como punto de partida para experimentos DAPO/GRPO, aprovechando el ajuste SFT previo para acelerar la convergencia.

## Benchmarks y rendimiento

La model card reporta una evaluación almacenada sobre 1.000 imágenes del dataset Widget2Code:

| Metrica | Resultado |
|---|---|
| Salidas renderizables | 954 de 1.000 (95,4%) |
| SSIM medio | 0,7280 |

Estos números corresponden a una ejecución de evaluación concreta y no deben interpretarse como una medida general de corrección frontend. No se proporcionan comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: al menos 19 GB (el checkpoint ocupa 18,8 GB), más overhead de activaciones y memoria del runtime.
- GPU recomendadas: NVIDIA A100 (40 GB o 80 GB), H100, RTX 4090 (24 GB) o similares con suficiente VRAM. Una RTX 3090 (24 GB) podría ser suficiente en BF16, aunque con margen ajustado.
- No se han publicado cuantizaciones de menor precisión (por ejemplo, INT8 o INT4), por lo que no se puede ejecutar en GPUs de gama baja sin conversión previa.
- Opciones de despliegue: el repositorio GitHub menciona pesos FP16 fusionados para vLLM, lo que sugiere compatibilidad con vLLM. También puede cargarse mediante la librería transformers de Hugging Face.
- Latencia y throughput: no se proporcionan datos medidos.

## Comparativa con modelos similares

No se dispone de resultados cuantitativos comparativos con otros modelos de screenshot-to-code en la información proporcionada. La página del proyecto Widget2Code muestra comparaciones cualitativas con modelos generalistas (Gemini-2.5-Pro, GPT-4o, Qwen3-VL) y especializados (ScreenCoder, UI-UG), pero sin métricas numéricas. Se recomienda consultar dicha página para una evaluación visual. Alternativas existentes en el mismo espacio:

| Modelo | Tipo | Parametros | Contexto | Licencia |
|---|---|---|---|---|
| Widget2Code-Qwen3.5-9B | Especializado screenshot-to-code | 9,4B | No disponible | other |
| ScreenCoder | Especializado UI-to-code | No disponible | No disponible | No disponible |
| Qwen3-VL | Multimodal generalista | 4B-32B | No disponible | Apache 2.0 (según versión) |

## Limitaciones y advertencias

- El código generado puede ser inválido o inseguro; el autor recomienda ejecutarlo siempre en un entorno sandbox y nunca en un entorno privilegiado.
- Los resultados de evaluación (95,4% renderizable, SSIM 0,728) provienen de una ejecución almacenada y no son una garantía de rendimiento general en otros conjuntos de datos o escenarios.
- No se especifican los idiomas soportados; el modelo puede tener sesgos hacia el inglés u otros idiomas dependiendo de los datos de entrenamiento del modelo base.
- La licencia "other" no está detallada; es necesario contactar al autor o revisar el repositorio para conocer las restricciones de uso comercial.
- No se documentan límites de contexto ni comportamiento ante imágenes de alta resolución o widgets muy complejos.
- El modelo está especializado en React JSX; no se ha validado su capacidad para generar código en otros frameworks o lenguajes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Djanghao/Widget2Code-Qwen3.5-9B-LoRA-SFT-Merged
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset Widget2Code-Data: https://huggingface.co/datasets/Djanghao/Widget2Code-Data
- Repositorio GitHub del entrenamiento: https://github.com/Djanghao/widget2code-sft
- Página del proyecto Widget2Code: https://djanghao.github.io/widget2code/
- Paper técnico (arXiv): https://arxiv.org/html/2608.12611v1
- Entrada de Qwen3.5:9b en Ollama (referencia del modelo base): https://ollama.com/library/qwen3.5:9b
