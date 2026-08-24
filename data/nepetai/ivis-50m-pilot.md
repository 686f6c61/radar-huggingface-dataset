# nepetai/ivis-50m-pilot

## Resumen

Ivis-50M-Pilot es un modelo de lenguaje experimental desarrollado por Nepetai, una empresa orientada a infraestructura de IA industrial y especializada. Se trata de una corrida de validación a pequeña escala de la arquitectura híbrida Ivis, que combina Transformer, Mamba (SSM) y mezcla de expertos (MoE). El objetivo declarado es documentar la curva de entrenamiento real y verificar la estabilidad numérica de la optimización, no alcanzar calidad de producción.

El modelo tiene 51,48 millones de parámetros totales, con unos 30 millones activos gracias al mecanismo de expertos (4 expertos con 2 activos y weight tying). Su contexto es de solo 256 tokens, y está entrenado para bilingüe árabe e inglés con un vocabulario SentencePiece BPE de 65.536 tokens. La licencia es Apache 2.0, lo que permite uso comercial, pero su carácter de piloto y su tamaño reducido lo hacen inadecuado para aplicaciones reales.

La relevancia de este lanzamiento radica en que sirve como banco de pruebas para la arquitectura Ivis, que en el informe técnico promete contexto de 128K, atención con ventana deslizante y sink attention, además de modalidades de visión y audio, aunque esas capacidades no están implementadas ni validadas en esta versión. Es un recurso útil para investigadores interesados en la estabilidad de arquitecturas híbridas, no para usuarios finales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Transformer + Mamba SSM + MoE (10 capas, atención + Mamba cada 4ª capa, MoE desde capa 8) |
| Parametros totales | 51.483.264 |
| Parametros activos | ~30 millones (4 expertos × 2 activos, weight tying activado) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados; solo checkpoint FP32) |
| Idiomas soportados | arabe (ar), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint PyTorch (archivo `ivis_2b_tpu_shared.pt`), tokenizer SentencePiece BPE (`ivis_tpu_tokenizer.model` y `.vocab`) |

## Arquitectura y entrenamiento

La arquitectura Ivis combina capas de atención Transformer estándar con bloques Mamba (SSM) intercalados cada cuarta capa, y a partir de la capa 8 incorpora un mecanismo de mezcla de expertos (MoE) con 4 expertos y 2 activos por token, con weight tying entre los expertos. El modelo tiene un d_model de 384 y un vocabulario de 65.536 tokens mediante SentencePiece BPE, preparado para árabe e inglés.

El entrenamiento se realizó en una NVIDIA Tesla P100-PCIE-16GB (entorno Kaggle) con PyTorch 2.2.0+cu118, optimizador Adafactor personalizado con learning rate de 3e-4, batch de 8 secuencias de 256 tokens y grad clip de 1.0. Se ejecutaron 300 pasos. La curva de pérdida medida muestra una convergencia rápida: desde pérdida 9,20 (perplejidad 9.893) en el paso 10 hasta 0,92 (perplejidad 2,51) en el paso 300. El autor indica que el entrenamiento fue numéricamente estable en todos los pasos, sin divergencia ni NaN, y que la perplejidad final refleja memorización esperada dado el pequeño corpus, no calidad general del modelo.

En el informe técnico se describen objetivos de arquitectura más amplios (contexto de 128K con RoPE θ=500K, atención de ventana deslizante y sink attention, así como modalidades de visión y audio), pero estos están implementados en código y no han sido validados a escala. Esta corrida piloto utiliza un perfil reducido (contexto 256, sin visión ni audio) para validar únicamente la estabilidad de optimización.

## Capacidades

- Generación de texto bilingüe (árabe e inglés) con vocabulario BPE de 65.536 tokens.
- Razonamiento básico limitado por el contexto de 256 tokens y el pequeño tamaño del modelo.
- Validación de estabilidad numérica de la arquitectura híbrida Transformer + Mamba + MoE durante entrenamiento.
- No se documentan capacidades de tool calling, función calling, agentes ni razonamiento multi-paso.
- No incluye soporte de visión ni audio en esta versión piloto.
- El modelo es un banco de pruebas para el desarrollo de la arquitectura Ivis, no un modelo de propósito general.

## Casos de uso

Dado que se trata de un modelo piloto de 51M con contexto de 256 tokens, no es adecuado para aplicaciones de producción. Los casos de uso son exclusivamente de investigación y desarrollo técnico:

- **Validación de estabilidad de optimización**: sirve para verificar que la combinación de capas Transformer, Mamba y MoE no diverge durante el entrenamiento, como se demuestra con la curva de pérdida estable.
- **Estudio de arquitecturas híbridas**: permite analizar cómo interactúan los bloques de atención, Mamba y MoE en un modelo pequeño, con fines de investigación académica.
- **Pruebas de escalado**: sirve como punto de partida para entrenar versiones más grandes de la arquitectura Ivis, comparando curvas de pérdida y perplejidad.
- **Desarrollo de tokenizadores bilingües**: el tokenizador SentencePiece BPE para árabe e inglés puede reutilizarse en otros modelos o experimentos.
- **Reproducción de experimentos**: investigadores pueden reproducir la configuración exacta (optimizador, batch, lr) para validar la metodología.
- **Evaluación de técnicas de MoE**: permite probar el comportamiento de mezcla de expertos con weight tying en un entorno controlado y de bajo coste computacional.

No se recomienda su uso en aplicaciones de atención al cliente, generación de código, agentes autónomos o cualquier tarea de producción debido a su tamaño y contexto limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks externos (como MMLU, HumanEval o GSM8K) en la información disponible. El único dato de rendimiento es la curva de pérdida y perplejidad durante el entrenamiento, que se presenta a continuación:

| Paso | Pérdida | Perplejidad |
|---|---|---|
| 10 | 9,20 | 9.893 |
| 50 | 6,32 | 558 |
| 100 | 5,42 | 227 |
| 150 | 4,48 | 89 |
| 200 | 3,31 | 27 |
| 250 | 1,77 | 5,9 |
| 300 | 0,92 | 2,51 |

Estos valores indican convergencia rápida sobre el pequeño corpus piloto, pero no son comparables con evaluaciones estándar de calidad de modelo.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 51,48 millones de parámetros en FP32 (4 bytes por parámetro), el peso ocupa aproximadamente 206 MB. En cuantización FP16 sería unos 103 MB. Cualquier GPU con al menos 1 GB de VRAM puede ejecutar el modelo sin problemas.
- **GPU recomendadas**: no se requiere hardware especializado; cualquier GPU moderna (incluso integradas) o una CPU es suficiente. La GPU utilizada para entrenamiento fue una Tesla P100 de 16 GB, pero no es necesaria para inferencia.
- **Compatibilidad con GPU de consumo**: sí, el modelo cabe en cualquier tarjeta gráfica de consumo (RTX 4060, RTX 3090, etc.) y también en dispositivos con memoria unificada (Apple Silicon).
- **Opciones de despliegue**: no se proporcionan archivos GGUF ni integraciones con vLLM, llama.cpp u Ollama. El checkpoint está en formato PyTorch, por lo que requiere una carga manual en un framework como Hugging Face Transformers (si se adapta) o PyTorch puro.
- **Latencia y throughput**: no se han publicado mediciones de latencia ni throughput. Dado el tamaño pequeño, la inferencia será muy rápida en CPU o GPU, pero no hay datos oficiales.

## Comparativa con modelos similares

No hay modelos directamente comparables en la misma categoría, ya que se trata de un modelo experimental de validación de arquitectura, no de un modelo de propósito general. Los modelos MoE de tamaño similar (por ejemplo, Mixtral 8x7B) son mucho más grandes y con propósitos diferentes. No se dispone de alternativas de referencia para comparar parámetros, contexto o rendimiento. La información disponible no permite establecer una comparativa.

## Limitaciones y advertencias

- **Contexto extremadamente corto (256 tokens)**: limita severamente cualquier tarea de generación o razonamiento que requiera más de una o dos frases de contexto.
- **Entrenamiento sobre corpus pequeño**: la perplejidad final de 2,51 indica memorización del conjunto de datos, no generalización. No se debe esperar un comportamiento coherente fuera del dominio de entrenamiento.
- **Arquitectura no validada a escala**: las características avanzadas (contexto 128K, visión, audio) están implementadas en código pero no probadas; este modelo no las incluye.
- **Sesgos y alucinaciones**: al ser un modelo pequeño entrenado con datos limitados, es probable que presente sesgos derivados del corpus y alucinaciones frecuentes en generación de texto.
- **Licencia Apache 2.0**: permite uso comercial, pero el autor no ofrece garantías sobre la calidad o aptitud para producción. El modelo se publica como experimento técnico.
- **Sin soporte de cuantización**: no se proporcionan pesos cuantizados (GGUF, etc.), lo que limita el despliegue en entornos con restricciones de memoria.
- **Reproducibilidad**: el entrenamiento se realizó en un entorno Kaggle específico, por lo que la replicación exacta puede requerir ajustes de dependencias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nepetai/ivis-50m-pilot
- Perfil de Nepetai en Hugging Face: https://huggingface.co/nepetai/models
- Sitio web de Nepetai: https://nepetai.cc
- Búsqueda de modelos con la etiqueta ivis-nepetai: https://huggingface.co/models?other=ivis-nepetai

Nota: no se ha encontrado documentación técnica adicional (papers o informes) en los resultados de búsqueda web. La información se basa exclusivamente en la model card y en la página del autor.## Resumen

Ivis-50M-Pilot es un modelo de lenguaje experimental desarrollado por Nepetai, una empresa orientada a infraestructura de IA industrial y especializada. Se trata de una corrida de validación a pequeña escala de la arquitectura híbrida Ivis, que combina Transformer, Mamba (SSM) y mezcla de expertos (MoE). El objetivo del proyecto es documentar la curva de entrenamiento real y verificar la estabilidad numérica de la optimización, no ofrecer un modelo de producción.

El modelo cuenta con 51,48 millones de parámetros totales, de los cuales aproximadamente 30 millones están activos por token gracias al mecanismo de MoE con 4 expertos y 2 activos, con weight tying activado. Su longitud de contexto es de 256 tokens, muy reducida, y está entrenado para los idiomas árabe e inglés con un vocabulario SentencePiece BPE de 65.536 tokens. La licencia es Apache 2.0, lo que permite uso comercial, pero el tamaño y la naturaleza de piloto lo hacen inadecuado para aplicaciones de producción.

La relevancia de este lanzamiento reside en que sirve como banco de pruebas para la arquitectura Ivis, que en el informe técnico promete contexto de 128K tokens mediante RoPE θ=500K, atención con ventana deslizante y sink attention, además de modalidades de visión y audio. Sin embargo, ninguna de esas capacidades está implementada ni validada en esta versión, que se limita a un perfil reducido (contexto 256, sin visión ni audio) para validar únicamente la estabilidad de optimización. Es un recurso de interés para investigadores que estudian arquitecturas híbridas, no para usuarios finales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Transformer + Mamba SSM + MoE (10 capas, atención + Mamba cada 4ª capa, MoE desde capa 8) |
| Parametros totales | 51.483.264 |
| Parametros activos | ~30M (4 expertos × 2 activos, weight tying activado) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (solo checkpoint FP32 en PyTorch) |
| Idiomas soportados | arabe (ar), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint PyTorch (`ivis_2b_tpu_shared.pt`) + tokenizer SentencePiece BPE (`ivis_tpu_tokenizer.model` y `.vocab`) |

## Arquitectura y entrenamiento

La arquitectura Ivis combina capas Transformer estándar con bloques Mamba (modelo de espacio de estados) intercalados cada cuarta capa. A partir de la capa 8 se introduce un mecanismo de mezcla de expertos (MoE) con 4 expertos y 2 activos por token, aplicando weight tying entre los expertos. El modelo tiene d_model 384 y un vocabulario de 65.536 tokens mediante SentencePiece BPE, preparado para árabe e inglés.

El entrenamiento se realizó en una NVIDIA Tesla P100-PCIE-16GB (entorno Kaggle) con PyTorch 2.2.0+cu118, optimizador Adafactor personalizado con learning rate de 3e-4, batch de 8 secuencias de 256 tokens y grad clip de 1.0. Se ejecutaron 300 pasos. La curva de pérdida muestra una convergencia rápida y estable: de pérdida 9,20 (perplejidad 9.893) en el paso 10 a pérdida 0,92 (perplejidad 2,51) en el paso 300. El autor indica que el entrenamiento fue numéricamente estable en todos los pasos, sin divergencia ni NaN, y que la perplejidad final es esperable por memorización dado el tamaño reducido del corpus.

En el informe técnico se describen objetivos de arquitectura más amplios (contexto 128K con RoPE θ=500K, atención con ventana deslizante y sink attention, así como modalidades de visión y audio), pero están implementados en código y no validados a escala. Esta corrida piloto usa un perfil preflight (contexto 256, sin visión ni audio) para validar solo la estabilidad de optimización.

## Capacidades

- Generación de texto en árabe e inglés con vocabulario BPE de 65.536 tokens.
- Razonamiento básico limitado por el contexto de 256 tokens y el tamaño del modelo.
- Validación de la estabilidad numérica de la arquitectura híbrida (Transformer + Mamba + MoE) durante entrenamiento.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No incluye capacidades de visión ni audio en esta versión piloto.
- El modelo es un banco de pruebas para la arquitectura Ivis, no un modelo de capacidades finales.

## Casos de uso

Dado el contexto de 256 tokens y el carácter de piloto, no es apto para aplicaciones de producción. Los casos de uso son exclusivamente de investigación y desarrollo técnico:

- **Validación de estabilidad de optimización**: sirve para comprobar que la combinación de capas Transformer, Mamba y MoE no diverge durante el entrenamiento, como demuestra la curva de pérdida estable.
- **Estudio de arquitecturas híbridas**: investigadores pueden analizar cómo interactúan los bloques de atención, Mamba y MoE en un modelo pequeño, con fines académicos.
- **Pruebas de escalado**: sirve como punto de partida para entrenar versiones más grandes de la arquitectura Ivis, comparando curvas de comportamiento y perplejidad.
- **Desarrollo de tokenizadores bilingües**: el tokenizador SentencePiece BPE para árabe e inglés puede reutilizarse en otros experimentos o modelos.
- **Reproducción de experimentos**: la configuración exacta (optimizador, batch, learning rate) está documentada, lo que permite replicar el entrenamiento en otros entornos.
- **Evaluación de técnicas MoE**: permite probar el peso de los expertos con weight tying en un entorno controlado y de bajo coste computacional.

No se recomienda su uso en atención al cliente, generación de código, agentes autónomos o tareas de producción que requieran contexto largo o razonamiento complejo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento es la curva de pérdida y perplejidad durante el entrenamiento, que se presenta a continuación:

| Paso | Pérdida | Perplejidad |
|---|---|---|
| 10 | 9,20 | 9.893 |
| 50 | 6,32 | 558 |
| 100 | 5,42 | 227 |
| 150 | 4,48 | 89 |
| 200 | 3,31 | 27 |
| 250 | 1,77 | 5,9 |
| 300 | 0,92 | 2,51 |

Estos valores indican convergencia rápida sobre el pequeño corpus piloto, pero no son comparables con evaluaciones de modelos de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 206 MB en FP32 (51,48 M × 4 bytes) y 103 MB en FP16. Cualquier GPU con al menos 1 GB de VRAM puede ejecutar el modelo.
- GPU recomendadas: no se requiere hardware especializado; cualquier GPU de consumo (RTX 4060, RTX 3090, etc.) o incluso una CPU es suficiente. La GPU usada para entrenamiento fue una Tesla P100 de 16 GB, pero no es necesaria para inferencia.
- Compatibilidad con GPU de consumo: sí, cabe en todas las tarjetas de consumo actuales y en sistemas con memoria unificada (Apple Silicon).
- Opciones de despliegue: no se proporcionan archivos GGUF ni integraciones con vLLM, llama.cpp u Ollama. El checkpoint está en formato PyTorch, por lo que requiere una carga manual adaptando el código de la arquitectura.
- Latencia y throughput: no se especifican mediciones, pero por el tamaño pequeño se espera una inferencia muy rápida en CPU o GPU.

## Comparativa con modelos similares

No hay modelos directamente comparables en la misma categoría, ya que se trata de un experimento de validación de arquitectura, no de un modelo de propósito general. Los modelos MoE de tamaño similar (por ejemplo, Mixtral 8x7B) son mucho más grandes y con capacidades distintas. No se dispone de alternativas comparables en cuanto a arquitectura híbrida con Mamba y MoE a esta escala. La información disponible no permite establecer una comparación.

## Limitaciones y advertencias

- Contexto extremadamente corto (256 tokens): limita severamente cualquier tarea que requiera más de una o dos frases de contexto.
- Entrenamiento en corpus pequeño: la perplejidad final de 2,51 indica memorización del conjunto de datos, no generalización. El modelo no es útil para tareas de lenguaje general.
- Arquitectura no validada en escala: las capacidades avanzadas (128K contexto, visión, audio) están implementadas en código pero no probadas; esta versión no las incluye.
- Sesgos y alucinaciones: al ser un modelo pequeño entrenado con datos reducidos, es probable que presente sesgos del corpus y alucinaciones frecuentes en generación de texto.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías de calidad ni aptitud para producción; es un experimento técnico.
- No se proporcionan pesos cuantizados ni formato GGUF, lo que dificulta el despliegue en sistemas con restricciones de memoria o en frameworks como llama.cpp u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nepetai/ivis-50m-pilot
- Perfil de Nepetai en Hugging Face: https://huggingface.co/nepetai/models
- Sitio web de Nepetai: https://nepetai.cc
- Búsqueda de modelos con la etiqueta ivis-nepetai: https://huggingface.co/models?other=ivis-nepetai

No se ha encontrado documentación técnica adicional (papers o informes) en los resultados de búsqueda web. La información se basa únicamente en la model card y la página del autor.
