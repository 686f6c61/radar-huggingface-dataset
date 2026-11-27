# asher577/scaling_signed_dcp_d768_L2_t250000000_s1_mlpsigned_strong5

## Resumen

`scaling_signed_dcp_d768_L2_t250000000_s1_mlpsigned_strong5` es un transformer de pesos dispersos (weight-sparse) publicado por el usuario asher577 en Hugging Face. Se trata de un artefacto de investigación, no de un modelo de propósito general: su nombre codifica los hiperparámetros del experimento (dimensión 768, 2 capas, 250 millones de tokens de entrenamiento, fracción L0 objetivo de 0,01 y una variante de dispersión "mlpsigned_strong5"). El modelo sigue el procedimiento de entrenamiento descrito por Gao et al. (2025) para inducir dispersión estructural en los pesos.

Con solo 2 capas, dimensión 768 y un vocabulario de 4096 tokens, el modelo está diseñado para estudiar cómo escala la dispersión de pesos en función del cómputo de entrenamiento sobre un corpus sintético y controlado (SimpleStories). Su contexto es de 512 tokens y se distribuye únicamente como `pytorch_model.bin` (state dict de PyTorch), sin pesos en safetensors ni GGUF.

Su relevancia es académica: sirve como punto de datos en estudios de escalado de dispersión, no como base para aplicaciones en producción. No hay model card con licencia, idiomas ni benchmarks, y las descargas y likes son cero en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con dispersión de pesos y de activaciones (weight-sparse, activation-sparse) |
| Parametros totales | no disponible (no declarado; estimable solo a partir de capas y dimensión) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (solo se publica `pytorch_model.bin`) |
| Idiomas soportados | no disponible (entrenado sobre SimpleStories, corpus sintético en inglés) |
| Licencia | no disponible |
| Formato de pesos | `pytorch_model.bin` (state dict de PyTorch) y `config.json` |
| Capas | 2 |
| Dimension del modelo | 768 |
| Dimension de cabeza | 16 |
| Tamano de vocabulario | 4096 |
| Dispersion de pesos | Si (fraccion L0 objetivo 0,01) |
| Dispersion de activaciones | Si |
| Tokens de entrenamiento | 250.000.000 |
| Dataset | `jacobcd52/simplestories-tokenized` |
| Tokenizer | `SimpleStories/SimpleStories-1.25M` |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo es un transformer de 2 capas con dimensión 768 y dimensión de cabeza 16 (lo que implica 48 cabezas de atención por capa). Incorpora dispersión tanto en los pesos como en las activaciones, con una fracción L0 objetivo de 0,01, es decir, se pretende que solo el 1 % de los pesos o activaciones estén activos. El sufijo `mlpsigned_strong5` del nombre sugiere una variante concreta de la política de dispersión aplicada a las capas MLP, aunque la model card no detalla el mecanismo exacto.

El entrenamiento sigue el procedimiento de Gao et al. (2025) y se realizó sobre 250 millones de tokens del dataset `jacobcd52/simplestories-tokenized`, tokenizado con `SimpleStories/SimpleStories-1.25M` (vocabulario de 4096 tokens). No se documenta el uso de RLHF, DPO ni ninguna fase de alineación; tampoco se especifican detalles sobre la composición del dataset más allá de su origen en SimpleStories, un corpus sintético de historias cortas. La model card enlaza un run de Weights & Biases (`asher577/scd_scaling/runs/vye0jv5h`) que probablemente contiene las curvas de entrenamiento, pero no se incluyen métricas en el texto.

## Capacidades

- Generación de texto a nivel de token sobre el vocabulario restringido de SimpleStories (4096 tokens); no es un modelo de chat ni de instrucciones.
- Modelado de lenguaje autorregresivo estándar (predicción del siguiente token).
- Capacidad limitada por el contexto de 512 tokens y por el corpus sintético de entrenamiento.
- No se documenta soporte de tool calling, function calling ni agentes.
- No se documenta capacidad multilingüe; el corpus de entrenamiento es sintético y en inglés.
- No dispone de modo "thinking", visión ni audio.
- Su interés principal es como objeto de estudio de dispersión de pesos, no como modelo funcional para tareas del mundo real.

## Casos de uso

- Investigación sobre escalado de dispersión: reproducir o extender los experimentos de Gao et al. (2025) comparando esta configuración (d768, L2, 250M tokens, L0=0,01) con otras del mismo barrido para analizar cómo varía la calidad con la dispersión.
- Estudio de ablación de políticas de dispersión: el sufijo `mlpsigned_strong5` permite contrastar esta variante con otras políticas de firma o magnitud sobre el mismo dataset y presupuesto de tokens.
- Análisis de eficiencia energética y de cómputo: al ser un modelo pequeño con dispersión de pesos y activaciones, sirve para medir el ahorro real de FLOPs y de memoria en hardware concreto frente a un denso equivalente.
- Docencia y divulgación: ejemplo mínimo y reproducible de transformer disperso entrenado con un pipeline documentado (dataset, tokenizer y run de W&B públicos).
- Validación de metodologías de poda: comparar la dispersión inducida durante el entrenamiento con técnicas de poda post-hoc sobre el mismo corpus sintético.
- Reproducción de experimentos: el enlace al run de W&B y la especificación completa de hiperparámetros permiten replicar el entrenamiento con un coste de cómputo moderado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 0,2 GB, por lo que en fp32 cabría holgadamente en cualquier GPU consumer con al menos 1 GB de VRAM.
- GPU recomendadas: no hay recomendación del autor; por tamaño, cualquier GPU moderna (RTX 3060 o superior, A100, H100) puede ejecutarlo.
- Cabe en GPU consumer: sí, con margen amplio, dado el tamaño del checkpoint (0,2 GB) y la profundidad de 2 capas.
- Opciones de despliegue: el autor indica que se requiere la clase `SparseGPT` de su repositorio para cargar el state dict; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la información proporcionada. Se trata de un artefacto de investigación con configuración específica (2 capas, d768, dispersión L0=0,01) sin benchmarks publicados, por lo que no es posible establecer una comparación rigurosa con alternativas.

## Limitaciones y advertencias

- Sin licencia declarada: no se especifican condiciones de uso comercial ni de redistribución; debe contactarse con el autor antes de cualquier uso.
- Modelo de investigación: 2 capas y 512 tokens de contexto lo hacen inadecuado para aplicaciones reales de generación, razonamiento o código.
- Corpus sintético: entrenado sobre SimpleStories, un dataset de historias generadas; el conocimiento del mundo y la diversidad lingüística son mínimos.
- Vocabulario reducido (4096 tokens): la tokenización es muy limitada y no cubre de forma general el inglés real ni otros idiomas.
- Riesgo de alucinación: alto en cualquier uso fuera de distribución, dado el entrenamiento sobre texto sintético y el escaso número de parámetros.
- Idiomas: no se declara ninguno; no debe asumirse soporte multilingüe.
- Carga no estándar: requiere la clase `SparseGPT` del repositorio del autor; no es compatible directamente con `transformers` ni con runtimes de inferencia habituales.
- Sin métricas publicadas: no hay benchmarks, evaluaciones de sesgo ni análisis de calidad en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/asher577/scaling_signed_dcp_d768_L2_t250000000_s1_mlpsigned_strong5
- Run de entrenamiento en Weights & Biases: https://wandb.ai/asher577/scd_scaling/runs/vye0jv5h
- Dataset de entrenamiento: https://huggingface.co/datasets/jacobcd52/simplestories-tokenized
- Tokenizer: https://huggingface.co/SimpleStories/SimpleStories-1.25M
- Referencia metodológica: Gao et al. (2025), citado en la model card (sin enlace directo proporcionado)
