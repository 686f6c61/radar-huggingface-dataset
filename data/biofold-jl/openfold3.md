# biofold-jl/openfold3

## Resumen

Este repositorio contiene los pesos del modelo OpenFold-3 convertidos al formato `.safetensors`, concretamente el checkpoint `of3-ob-2025-06-30-174k.safetensors` correspondiente a OpenBind-0, la primera versión de una serie de modelos de predicción de estructuras moleculares co-plegadas, especializados en proteínas unidas a ligandos de moléculas pequeñas. El autor del repositorio es `biofold-jl`, y la licencia es Apache-2.0.

OpenFold3 es un modelo de predicción de estructuras biomoleculares de tercera generación, desarrollado por el AlQuraishi Lab de la Universidad de Columbia y el consorcio OpenFold, que busca ser una reproducción bit a bit de AlphaFold3 de DeepMind. Este modelo predice la estructura tridimensional de complejos moleculares que incluyen proteínas, ADN, ARN y ligandos. La relevancia de este repositorio radica en ofrecer los pesos en un formato listo para usar con herramientas modernas de inferencia, aunque actualmente solo contiene el checkpoint de OpenBind-0, con planes de actualización futura.

No se dispone de información detallada sobre arquitectura, número de parámetros, contexto u otras especificaciones técnicas en la información proporcionada. El repositorio tiene un tamaño de 2.3 GB y fue creado en agosto de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (OpenFold3 es un modelo de predicción de estructuras biomoleculares, basado en la arquitectura de AlphaFold3) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos están en formato safetensors, sin cuantización indicada) |
| Idiomas soportados | no disponible (modelo de biología estructural, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información proporcionada no incluye detalles específicos sobre la arquitectura del modelo, el número de parámetros, la longitud de contexto ni los datos de entrenamiento. Según la búsqueda web, OpenFold3 es un modelo de predicción de estructuras biomoleculares que reproduce AlphaFold3, desarrollado por el AlQuraishi Lab y el consorcio OpenFold. Se sabe que incorpora innovaciones como NVIDIA cuEquivariance, MMseqs2-GPU y NVIDIA FLARE para aceleración y colaboración preservando la privacidad, pero estos detalles no están confirmados en la model card de este repositorio concreto.

El checkpoint incluido, OpenBind-0, está especializado en la predicción de estructuras de proteínas unidas a ligandos de moléculas pequeñas, y se ha entrenado con un conjunto de datos de 717 estructuras ligadas a ligandos que capturan la progresión de fragmento a hit. No se dispone de información sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO, etc.) para este checkpoint específico.

## Capacidades

- Predicción de estructuras tridimensionales de complejos biomoleculares, incluyendo proteínas, ADN, ARN y ligandos (según la descripción general de OpenFold3).
- Especialización en co-plegado de proteínas con ligandos de moléculas pequeñas (OpenBind-0).
- Capacidad de modelar complejos multi-cadena y ácidos nucleicos, según la información de NVIDIA NIM.
- No se dispone de información sobre capacidades de tool calling, agentes, razonamiento multi-paso, ni capacidades multilingües, al ser un modelo de biología estructural y no un modelo de lenguaje.

## Casos de uso

- Descubrimiento de fármacos: OpenBind-0 puede predecir cómo se unen ligandos de moléculas pequeñas a proteínas diana, lo que permite evaluar virtualmente la afinidad de unión y guiar la optimización de compuestos líderes en etapas tempranas del desarrollo farmacéutico.
- Diseño racional de proteínas: los investigadores pueden usar el modelo para predecir estructuras de complejos proteína-ligando y diseñar mutaciones que mejoren la unión o la especificidad, reduciendo el número de experimentos de laboratorio necesarios.
- Estudio de mecanismos de resistencia a fármacos: al predecir cómo mutaciones en proteínas alteran la unión de ligandos, se puede anticipar la aparición de resistencias y diseñar fármacos de segunda generación.
- Biología estructural de ácidos nucleicos: el modelo puede predecir estructuras de complejos que incluyen ADN o ARN, útil para estudiar interacciones proteína-ADN/ARN en regulación génica o en el diseño de terapias basadas en ácidos nucleicos.
- Cribado virtual de bibliotecas químicas: con la capacidad de predecir estructuras de complejos proteína-ligando, se puede filtrar grandes colecciones de compuestos para identificar candidatos prometedores antes de la síntesis y ensayo experimental.
- Integración en pipelines de biología computacional: al estar disponible en formato safetensors, el modelo puede integrarse en flujos de trabajo con herramientas como PyTorch o frameworks de inferencia para automatizar la predicción de estructuras en proyectos de investigación a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de rendimiento comparativo (MMLU, HumanEval, GSM8K, etc.) para este modelo, ya que se trata de un modelo de predicción de estructuras biomoleculares y no de un modelo de lenguaje o razonamiento general.

## Requisitos de hardware

- No se dispone de información específica sobre requisitos de VRAM, GPUs recomendadas o latencia para este checkpoint concreto.
- Dado que el repositorio tiene un tamaño de 2.3 GB, se puede estimar que el modelo es de tamaño moderado, pero no se puede confirmar sin datos de parámetros.
- Al ser un modelo de predicción de estructuras biomoleculares, es probable que requiera una GPU con al menos 16 GB de VRAM para inferencia, pero esto es una suposición no confirmada.
- No se dispone de información sobre opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.) para este modelo específico.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos similares. El modelo OpenFold3 es una reproducción de AlphaFold3, pero no se proporcionan datos de rendimiento ni especificaciones técnicas de este checkpoint concreto. Se puede mencionar que AlphaFold3 de DeepMind es el modelo de referencia, pero no se dispone de datos comparativos.

## Limitaciones y advertencias

- El repositorio solo contiene el checkpoint de OpenBind-0, no el modelo completo de OpenFold3. Esto limita su uso a la predicción de complejos proteína-ligando, no a todas las capacidades de OpenFold3.
- No se dispone de información sobre sesgos conocidos, riesgo de alucinación o limitaciones de contexto o idioma, al ser un modelo de biología estructural.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar si los pesos del modelo original (OpenFold3) tienen restricciones adicionales, ya que este repositorio es una conversión de un checkpoint existente.
- No se han publicado resultados de benchmarks ni validaciones independientes para este checkpoint, por lo que su precisión en tareas reales no está confirmada.
- El modelo está especializado en ligandos de moléculas pequeñas; su rendimiento en otros tipos de complejos (proteína-proteína, proteína-ácido nucleico) puede ser limitado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/biofold-jl/openfold3
- Blog de NVIDIA sobre OpenFold3 NIM: https://developer.nvidia.com/blog/how-to-predict-biomolecular-structures-using-the-openfold3-nim/
- Repositorio GitHub de OpenFold3 (AlQuraishi Lab): https://github.com/aqlaboratory/openfold-3
- Repositorio GitHub alternativo de OpenFold3: https://github.com/jurgjn/openfold3
- Página de NVIDIA NIM para OpenFold3: https://build.nvidia.com/openfold/openfold3
- Blog de OpenBind-0: https://openbind.uk/news/blog-openbind-0-advancing-open-molecular-structure-prediction/
