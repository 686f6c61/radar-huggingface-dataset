# eka-smi/gpt2-sae-prd-denoiser

## Resumen

El modelo `eka-smi/gpt2-sae-prd-denoiser` es un proyecto de investigación centrado en la interpretabilidad de modelos de lenguaje mediante sparse autoencoders (SAE) aplicados a GPT-2. El autor, eka-smi (Smirnova), lo publica bajo licencia MIT y proporciona el código y el informe completo en un repositorio de GitHub. El término "denoiser" sugiere que el modelo se utiliza para eliminar o reducir ruido en los residuos de activación del modelo base, probablemente con el fin de aislar características interpretables. Este tipo de trabajo se enmarca en la línea de investigación de "steering" (dirección) de modelos mediante la manipulación de representaciones internas, como se observa en los resultados de búsqueda relacionados con el proyecto "NeuroTrace" y con el paper "Investigating Sensitive Directions in GPT-2". Aunque la información pública es muy limitada, el modelo parece ser un componente experimental más que un producto listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder (SAE) sobre GPT-2 (probablemente GPT-2 small, aunque no confirmado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base GPT-2, típicamente 1024 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (probablemente PyTorch/safetensors, sin confirmar) |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna del denoiser. Sin embargo, por el nombre y el contexto, se infiere que se trata de un sparse autoencoder entrenado sobre los residual stream de GPT-2, siguiendo la receta de Bricken et al. (2023) aplicada a GPT-2 small. El propósito sería descomponer las activaciones en características esparsas y luego usar esas características para "denoising" o para dirigir el comportamiento del modelo. No hay datos sobre el número de tokens de entrenamiento, composición del dataset ni métodos de alineación como RLHF/DPO. Se sabe que el proyecto tiene un informe técnico disponible en GitHub, pero no se ha publicado en el momento de redactar esta ficha.

## Capacidades

- **Interpretabilidad**: el modelo permite analizar y manipular características internas del GPT-2, como se demuestra en el proyecto asociado "NeuroTrace" que utiliza SAE para mapear el residual stream en 73,728 features.
- **Denoising de activaciones**: la función principal es eliminar ruido de las activaciones, lo que podría facilitar el estudio de circuitos específicos (p. ej., el circuito de Indirect Object Identification, IOI).
- **Steering**: al ser un denoiser, podría usarse para intervenir en las activaciones y dirigir el comportamiento del modelo, aunque no hay evidencia concreta de tool calling o agentes.
- **Multilingüe**: no se especifican idiomas soportados; dado que se basa en GPT-2, heredaría sus capacidades multilingües limitadas (principalmente inglés).

## Casos de uso

- **Investigación en interpretabilidad**: el modelo sirve para estudiar cómo se representan conceptos en GPT-2 y para validar métodos de análisis de características.
- **Desarrollo de técnicas de "steering"**: al denoising las activaciones, se puede experimentar con intervenciones que modifiquen el comportamiento del modelo en tareas específicas (p. ej., eliminar sesgos o forzar ciertas respuestas).
- **Pruebas de robustez**: el denoiser podría usarse para evaluar cómo los ataques adversarios a las activaciones afectan al modelo y cómo mitigarlos.
- **Educación y divulgación**: sirve como ejemplo práctico para enseñar sparse autoencoders y análisis de circuitos en modelos de lenguaje.
- **Reproducción de experimentos**: dado que el código está disponible, se puede usar para reproducir los resultados del informe y verificar la metodología.
- **Integración en pipelines de análisis de modelos**: se puede incorporar a flujos de trabajo que requieran limpiar señales de activaciones antes de aplicar otras técnicas de análisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El proyecto es de investigación y no hay comparaciones cuantitativas con otros modelos en la documentación pública.

## Requisitos de hardware

- **VRAM estimada**: no disponible, pero al ser un denoiser sobre GPT-2 small, la inferencia sobre el modelo base requiere unos 2-3 GB de VRAM en fp32 (menos con cuantización). El propio denoiser (SAE) es pequeño (una capa oculta) y no añade un coste significativo.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM (p. ej., GTX 1650, RTX 3060) sería suficiente para experimentos pequeños. Para trabajar con GPT-2 en fp32, una RTX 3090 o A100 facilitaría el proceso.
- **En consumer GPU**: sí, cabe en GPUs de consumo (RTX 3060, RTX 4090) si se usa cuantización o se procesa en lotes pequeños.
- **Opciones de despliegue**: al ser un modelo de investigación, no se han publicado instrucciones de despliegue en frameworks como vLLM o Ollama. El código está en PyTorch y puede ejecutarse en un entorno Jupyter o script.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No hay modelos comparables con la misma especificidad (denoiser SAE sobre GPT-2). En el ámbito de interpretabilidad, existen otros sparse autoencoders como los de Anthropic (Bricken et al., 2023) o los de la librería `sae-gpt2` (sahnia3), pero no son exactamente denoisers. La comparativa no está disponible.

## Limitaciones y advertencias

- **Sesgos**: al estar basado en GPT-2, hereda los sesgos del modelo original, que pueden ser relevantes en análisis de contenido.
- **Alucinación**: el modelo no genera texto directamente, sino que procesa activaciones; no aplica el riesgo de alucinación en el sentido clásico, pero las características extraídas pueden ser interpretadas erróneamente.
- **Contexto**: GPT-2 tiene una longitud de contexto de 1024 tokens, lo que limita los análisis a textos cortos.
- **Idioma**: el modelo está entrenado principalmente en inglés; no hay evidencia de soporte multilingüe.
- **Licencia**: la licencia MIT permite uso comercial, pero el modelo es experimental y no se recomienda para producción sin una validación exhaustiva.
- **Falta de documentación**: no hay documentación técnica sobre el entrenamiento, los hiperparámetros ni la evaluación, lo que dificulta la reproducción y el uso confiable.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/eka-smi/gpt2-sae-prd-denoiser)
- [Repositorio GitHub (código y informe)](https://github.com/eka-smi/gpt2-sae-steering-prd)
- [Discusión relacionada: NeuroTrace - GPT-2 Small Residual Attack & Defence Framework](https://discuss.huggingface.co/t/neurotrace-gpt-2-small-residual-attack-defence-framework-ioi-task/170688)
- [Paper: Investigating Sensitive Directions in GPT-2: An Improved Baseline (arXiv)](https://arxiv.org/abs/2410.12555)
