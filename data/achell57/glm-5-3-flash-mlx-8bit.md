# achell57/GLM-5.3-Flash-MLX-8bit

## Resumen

GLM-5.3-Flash-MLX-8bit es una conversión y cuantización a 8 bits del modelo GLM-5.3-Flash de Z.ai (zai-org), publicada por el usuario achell57 para su ejecución en Apple Silicon mediante la librería MLX. El modelo original es un Mixture-of-Experts (MoE) de 320B parámetros totales con 18B activos (320B-A18B), y esta build conserva la arquitectura intacta, incluyendo la torre de visión en bfloat16. El resultado ocupa 334,1 GB en disco frente a los 642,7 GB del release upstream en bfloat16.

La relevancia de esta ficha está en que permite ejecutar un modelo multimodal de escala frontera en hardware Apple con memoria unificada grande, algo que el checkpoint original en bfloat16 no permite en máquinas de hasta 512 GB. La build aplica cuantización de 8 bits con grupo 64 a los 304B parámetros de expertos enrutados (el 97% del total) y a las proyecciones KDA/MLA, expertos compartidos, MLPs densos, embeddings y `lm_head`; mantiene en float32 los arrays mHC y los parámetros de decaimiento KDA, y en bfloat16 la torre de visión.

El autor advierte de que el runtime `glm5_next` de mlx-vlm `main` (integrado el 2026-08-26) contiene dos bugs numéricos y dos discrepancias de epsilon que esta build corrige mediante un runtime parcheado disponible en el repositorio PipeNetwork/glm53-flash-mlx. Sin ese runtime, el clamp de SwiGLU no se aplica en los 45 bloques FFN y la matriz de mezcla mHC queda desviada aproximadamente 0,5 por capa en checkpoints convertidos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: 34 capas de atención lineal Kimi-Delta (KDA) + 11 capas de atención dispersa DeepSeek (NoPE MLA + lightning indexer), con hyper-conexiones restringidas a manifold (mHC); MoE |
| Parámetros totales | 313.890.438.974 (≈320B) |
| Parámetros activos | 18B (320B-A18B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8 bits, grupo 64 (expertos enrutados, proyecciones KDA/MLA, expertos compartidos, MLPs densos, embeddings, `lm_head`, proyecciones del lightning indexer); float32 para router MoE, bias de corrección, arrays mHC, `A_log`/`dt_bias` KDA, convoluciones y normas; bfloat16 para la torre de visión |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash emplea una arquitectura híbrida que combina 34 capas de atención lineal Kimi-Delta (KDA) con 11 capas de atención dispersa DeepSeek basadas en NoPE MLA y un lightning indexer, todo ello con hyper-conexiones restringidas a manifold (mHC). Es un MoE con 42 capas de expertos enrutados, cada una con 288 expertos, que concentran 304B de los 313,9B parámetros totales (el 97%). Los expertos compartidos, MLPs densos, proyecciones y embeddings suman aproximadamente 9B parámetros, y la torre de visión aporta 0,56B.

Esta build concreta es una conversión desde el release upstream en bfloat16 (GLM-5.3-Flash-BF16) a MLX con cuantización de 8 bits, sin cambios en la arquitectura. No incluye la capa de predicción multi-token (capa 45). El autor documenta que la validación del port frente a `transformers` 5.16 a escala reducida detectó dos bugs numéricos (ausencia del clamp de SwiGLU en el stack de texto y lectura errónea del dtype de `base`/`scale` en mHC por parte del kernel de Metal) y dos discrepancias de epsilon (norma de bajo rango MLA e indexer LayerNorm), corregidos en el runtime parcheado con paridad de 1e-6 extremo a extremo y exacta en decodificación con caché. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno.
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`), gracias a la torre de visión en bfloat16.
- Razonamiento sobre código y matemáticas (capacidad heredada del modelo base; sin benchmarks específicos publicados en la información disponible).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.
- Decodificación con caché validada con paridad exacta en el runtime parcheado.

## Casos de uso

- Asistente multimodal local en estaciones de trabajo Apple Silicon con memoria unificada de 512 GB o superior: el modelo cabe en 334,1 GB y procesa entradas de imagen y texto, lo que permite analizar capturas, diagramas o documentos escaneados sin enviar datos a la nube.
- Análisis de documentación técnica extensa: la arquitectura híbrida KDA + MLA dispersa está diseñada para contextos largos, adecuada para resumir y consultar repositorios de documentación o bases de conocimiento internas.
- Prototipado e investigación en arquitecturas híbridas de atención: al estar el código del port y el runtime disponibles en abierto, sirve para estudiar el comportamiento de KDA y MLA dispersa en hardware Apple frente a implementaciones de referencia en `transformers`.
- Evaluación comparativa de cuantizaciones: el autor publica métricas de perplejidad en wikitext-2 para las builds de 8, 6, 4 y mixtas, lo que permite usar esta build como ancla para medir el impacto de cuantizaciones más agresivas en tareas propias.
- Generación de código en local para equipos con requisitos de privacidad: el modelo se ejecuta íntegramente en la máquina, sin llamadas externas, lo que encaja en entornos con restricciones de confidencialidad.
- Experimentación con decodificación especulativa y caché: la paridad exacta en decodificación con caché del runtime parcheado facilita la integración en pipelines de inferencia que requieran reutilización de estado entre turnos.
- Investigación sobre eficiencia de MoE: con 18B parámetros activos de 320B totales, es un banco de pruebas para estudiar el equilibrio entre calidad y coste computacional en hardware de consumo profesional.

## Benchmarks y rendimiento

El autor publica perplejidad en wikitext-2 (test) sobre 288.627 tokens en 141 ventanas de 2048, evaluadas con ventanas idénticas en todas las builds. La build de 8 bits se usa como ancla porque el modelo bfloat16 de 643 GB no cabe en una máquina de 512 GB.

| Build | Tamaño | Perplejidad | ΔNLL/token vs 8-bit [IC 95%] | Ventanas peores |
|---|---:|---:|---|---:|
| 8bit (esta) | 334,1 GB | 3,4607 | — | — |
| 6bit | 255,9 GB | 3,4646 | +0,0011 [−0,0017, +0,0038] | 89/141 |
| mixed-4_8bit | 181,9 GB | 3,5705 | +0,0312 [+0,0271, +0,0355] | 131/141 |
| 4bit | 177,6 GB | 3,7549 | +0,0816 [+0,0755, +0,0879] | 140/141 |
| REAP25-mixed-4_8bit | 139,1 GB | 4,2249 | +0,1995 [+0,1657, +0,2377] | 139/141 |
| REAP37-mixed-4_8bit | 118,3 GB | 4,8752 | +0,3427 [+0,2968, +0,3929] | 141/141 |
| REAP50-mixed-4_8bit | 96,3 GB | 6,0757 | +0,5628 [+0,5071, +0,6219] | 141/141 |
| REAP25-4bit | — | 4,4361 | +0,2483 [+0,2135, +0,2873] | 141/141 |
| REAP37-4bit | — | 5,1057 | +0,3889 [+0,3424, +0,4393] | 141/141 |
| REAP50-4bit | — | 6,3840 | +0,6123 [+0,5552, +0,6722] | 141/141 |

Frente al ancla de 8 bits: 6 bits +0,1%, mixta 4/8 bits +3,2%, 4 bits uniforme +8,5%. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible. La generación greedy se describe como coherente en todas las builds publicadas, pero el autor la califica de detector de colapso, no de ranking de calidad.

## Requisitos de hardware

- VRAM/memoria estimada: 334,1 GB en disco para esta build de 8 bits; se requiere una máquina con memoria unificada suficiente para cargar los pesos más el estado de inferencia. El release bfloat16 de 642,7 GB no cabe en máquinas de 512 GB.
- GPU recomendadas: hardware Apple Silicon con memoria unificada grande (Mac Studio o Mac Pro con 512 GB o más); no se especifican modelos concretos de chip en la información disponible.
- GPU de consumo: no cabe en ninguna GPU de consumo con memoria dedicada convencional (24 GB o menos); requiere memoria unificada de gama profesional.
- Opciones de despliegue: MLX mediante el runtime parcheado `glm53_flash_mlx` del repositorio PipeNetwork/glm53-flash-mlx; el runtime `glm5_next` de mlx-vlm `main` carga el checkpoint (los arrays mHC y KDA están en float32), pero el clamp de SwiGLU requiere el runtime parcheado.
- Latencia y throughput: no disponibles en la información proporcionada.
- Instalación del runtime: `git clone https://github.com/PipeNetwork/glm53-flash-mlx && cd glm53-flash-mlx && pip install -r requirements.txt`, seguido de `python scripts/smoke_generate.py /path/to/GLM-5.3-Flash-MLX-8bit`.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Perplejidad wikitext-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GLM-5.3-Flash-MLX-8bit (esta) | 313,9B | 18B | no disponible | 3,4607 | MIT | MLX, Apple Silicon |
| GLM-5.3-Flash-MLX-6bit | 313,9B | 18B | no disponible | 3,4646 | MIT | MLX, Apple Silicon |
| GLM-5.3-Flash-MLX-mixed-4_8bit | 313,9B | 18B | no disponible | 3,5705 | MIT | MLX, Apple Silicon |
| GLM-5.3-Flash-MLX-4bit | 313,9B | 18B | no disponible | 3,7549 | MIT | MLX, Apple Silicon |
| GLM-5.3-Flash-BF16 (upstream) | 313,9B | 18B | no disponible | no medida (no cabe en 512 GB) | MIT | bfloat16, `transformers` |

Las alternativas comparables dentro de la información disponible son las distintas cuantizaciones del mismo modelo base, que permiten elegir el equilibrio entre tamaño y fidelidad. No se dispone de datos de benchmarks de tareas que permitan comparar con otros modelos de la misma categoría.

## Limitaciones y advertencias

- El runtime `glm5_next` de mlx-vlm `main` contiene bugs conocidos (clamp de SwiGLU ausente, dtype de mHC en el kernel de Metal, epsilons de MLA e indexer) que degradan la calidad si no se usa el runtime parcheado del repositorio PipeNetwork/glm53-flash-mlx.
- El checkpoint no incluye la capa de predicción multi-token (capa 45) del modelo original, por lo que no se puede usar esa funcionalidad.
- El modelo requiere hardware Apple Silicon con memoria unificada muy grande (334,1 GB solo de pesos), lo que excluye su ejecución en GPU de consumo y en la mayoría de estaciones de trabajo convencionales.
- Sesgos conocidos: no disponibles en la información proporcionada; al ser un modelo base de gran escala, es previsible que herede sesgos del corpus de entrenamiento, pero no se documentan.
- Riesgo de alucinación: no cuantificado en la información disponible; la perplejidad de 3,4607 en wikitext-2 no es un indicador directo de fiabilidad factual.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados en la información proporcionada.
- Licencia MIT, igual que el modelo upstream, lo que permite uso comercial sin restricciones adicionales documentadas; conviene verificar los términos del modelo base original.
- La perplejidad de referencia se midió con el runtime parcheado; comparaciones con otras herramientas de inferencia pueden no ser directamente equiparables.
- El autor advierte de que la generación greedy es solo un detector de colapso y no un ranking de calidad; no debe usarse como única validación antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/achell57/GLM-5.3-Flash-MLX-8bit
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Release bfloat16 upstream: https://huggingface.co/zai-org/GLM-5.3-Flash-BF16
- Build de 8 bits del autor del port: https://huggingface.co/pipenetwork/GLM-5.3-Flash-MLX-8bit
- Build de 6 bits: https://huggingface.co/pipenetwork/GLM-5.3-Flash-MLX-6bit
- Build mixta 4/8 bits: https://huggingface.co/pipenetwork/GLM-5.3-Flash-MLX-mixed-4_8bit
- Build de 4 bits: https://huggingface.co/pipenetwork/GLM-5.3-Flash-MLX-4bit
- Build REAP25 mixta 4/8 bits: https://huggingface.co/pipenetwork/GLM-5.3-Flash-REAP25-MLX-mixed-4_8bit
- Build REAP37 mixta 4/8 bits: https://huggingface.co/pipenetwork/GLM-5.3-Flash-REAP37-MLX-mixed-4_8bit
- Build REAP50 mixta 4/8 bits: https://huggingface.co/pipenetwork/GLM-5.3-Flash-REAP50-MLX-mixed-4_8bit
- Build REAP25 4 bits: https://huggingface.co/pipenetwork/GLM-5.3-Flash-REAP25-MLX-4bit
- Build REAP37 4 bits: https://huggingface.co/pipenetwork/GLM-5.3-Flash-REAP37-MLX-4bit
- Build REAP50 4 bits: https://huggingface.co/pipenetwork/GLM-5.3-Flash-REAP50-MLX-4bit
- Runtime parcheado: https://github.com/PipeNetwork/glm53-flash-mlx
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
