# dvader13/olmo2-1b-sft-s1-3566b

## Resumen

Este repositorio contiene checkpoints de supervisión fina (SFT) del modelo base OLMo-2-1B de Ai2, correspondientes a 10 fracciones de dosis de entrenamiento (del 10% al 100%). El modelo base fue preentrenado en la etapa `stage1-step1700000-tokens3566B`, es decir, con 3566 mil millones de tokens. Los checkpoints se publican en formato bf16 y están destinados exclusivamente a inferencia, sin estado de optimizador.

La relevancia de este repositorio es metodológica: permite estudiar cómo evoluciona el rendimiento del modelo a medida que se incrementa la cantidad de datos de SFT, algo útil para calibrar experimentos de ajuste fino y para reproducir curvas de aprendizaje. El modelo base pertenece a la familia OLMo-2, una línea de modelos totalmente abiertos desarrollada por el Allen Institute for AI (Ai2), con datos de entrenamiento, código y evaluaciones publicados abiertamente. Este checkpoint concreto es una contribución de un autor independiente (`dvader13`) sobre la base OLMo-2-1B, con licencia Apache-2.0.

No se dispone de información adicional sobre arquitectura, contexto o capacidades específicas más allá de lo que se puede inferir del nombre y de la familia OLMo-2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia OLMo-2, base de 1B) |
| Parametros totales | 1B (aproximado, por nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (solo inferencia, sin estado de optimizador) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (según tags del repositorio) |

## Arquitectura y entrenamiento

El modelo base es OLMo-2-1B, un transformer de la familia OLMo-2 de Ai2, que se caracteriza por ser completamente abierto en todas sus etapas: datos de entrenamiento, código de entrenamiento, recetas reproducibles y evaluaciones. El pretraining se realizó en la etapa `stage1` con 3566 mil millones de tokens, hasta el paso 1.700.000. Sobre esta base se aplicó un ajuste fino supervisado (SFT) del que se ofrecen diez checkpoints parciales (10%, 20%, ..., 100% de la dosis de SFT). No se especifica el dataset de SFT utilizado ni si se aplicaron técnicas adicionales como DPO o RLHF; la información disponible solo indica que los checkpoints son de inferencia y en bf16.

## Capacidades

- Generación de texto y razonamiento básico, heredadas del modelo base OLMo-2-1B.
- Capacidad de ajuste fino supervisado, útil para tareas específicas de instrucción.
- Soporte de tool calling, agentes, visión o audio: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- La familia OLMo-2 incluye versiones instruct y variantes cuantizadas para despliegue en dispositivos, pero este repositorio concreto solo ofrece checkpoints intermedios de SFT.

## Casos de uso

- Investigación sobre el efecto de la dosis de SFT: permite estudiar cómo evoluciona el rendimiento del modelo con distintas fracciones de datos de ajuste fino, útil para diseñar experimentos de entrenamiento.
- Reproducción de experimentos de ajuste fino: al disponer de checkpoints intermedios, se pueden replicar curvas de aprendizaje y comparar estrategias de SFT.
- Desarrollo de modelos base para tareas específicas: partiendo de estos checkpoints, se puede continuar el entrenamiento para dominios concretos sin partir de cero.
- Evaluación de la robustez del modelo ante variaciones de datos de SFT: comparar checkpoints al 10% frente al 100% puede revelar puntos de saturación o de sobreajuste.
- Integración en pipelines de investigación de IA abierta: al ser Apache-2.0 y estar basado en OLMo-2, se puede usar en entornos académicos o de investigación sin restricciones de licencia.
- Estudio de la capacidad de generalización de modelos pequeños (1B): útil para experimentos de eficiencia y para comprender límites de modelos de tamaño reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones numéricas de MMLU, HumanEval, GSM8K ni otras pruebas estandarizadas. Se recomienda consultar los benchmarks de la familia OLMo-2 en la documentación oficial de Ai2 para datos de rendimiento del modelo base.

## Requisitos de hardware

- VRAM estimada: un modelo de 1B en bf16 requiere aproximadamente 2 GB de VRAM solo para los pesos, más overhead de activaciones y KV-cache. Con una cuantización de 8 bits se reduciría a unos 1 GB, y en 4 bits a unos 0.5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como una RTX 3050 o superior, sería suficiente para inferencia. Para entrenamiento o ajuste fino, se recomienda una GPU con 8 GB o más.
- En consumer GPU: sí, cabe en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Opciones de despliegue: al ser un modelo de 1B, se puede servir con vLLM, llama.cpp, Ollama o TGI. Sin embargo, este repositorio no incluye pesos en formato GGUF ni cuantizaciones, por lo que habría que convertirlos previamente.
- Latencia y throughput: no disponibles para este checkpoint específico.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OLMo-2-1B (base) | 1B | no disponible | Apache-2.0 | HuggingFace |
| OLMo-2-0425-1B | 1B | no disponible | Apache-2.0 | HuggingFace |
| Qwen2.5-1B | 1.5B | 32K | Apache-2.0 | HuggingFace |
| Llama-3.2-1B | 1.2B | 128K | Llama 3.2 Community | HuggingFace |

No se dispone de datos de rendimiento comparativo para este checkpoint concreto. Los modelos de 1B de la familia OLMo-2 son comparables en tamaño a Qwen2.5-1B y Llama-3.2-1B, pero las diferencias en entrenamiento y evaluación no se pueden cuantificar con la información actual.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos, alucinaciones ni comportamientos problemáticos de este modelo concreto; se recomienda revisar las evaluaciones de la familia OLMo-2 en la documentación oficial de Ai2.
- El modelo es un checkpoint intermedio de SFT, no una versión final instruct; su comportamiento en tareas generales puede ser inferior al de modelos instruct completos.
- No se indica el idioma de entrenamiento, por lo que no se garantiza un buen rendimiento en español.
- La licencia Apache-2.0 permite uso comercial, pero es responsabilidad del usuario verificar el cumplimiento de las condiciones de la licencia.
- El repositorio no incluye cuantizaciones ni formatos optimizados para despliegue; para producción habría que convertir los pesos.
- No hay garantías de soporte o mantenimiento del autor, ya que es un repositorio con 0 descargas y 0 likes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dvader13/olmo2-1b-sft-s1-3566b
- Modelo base OLMo-2-0425-1B: https://huggingface.co/allenai/OLMo-2-0425-1B
- Página oficial de OLMo 2 de Ai2: https://allenai.org/olmo2
- Colección OLMo 2 en HuggingFace: https://huggingface.co/collections/allenai/olmo-2
- Repositorio GitHub de OLMo: https://github.com/allenai/OLMo
