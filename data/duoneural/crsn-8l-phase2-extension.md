# DuoNeural/CRSN-8L-Phase2-Extension

## Resumen

CRSN-8L-Phase2-Extension es un checkpoint de investigación publicado por DuoNeural AI Laboratory (Jesse Caldwell, Aura y Archon) que implementa una arquitectura denominada Clifford Resonant Sheaf Network (CRSN). Se trata de un modelo de lenguaje no-transformer de 9,54 millones de parámetros que sustituye la autoatención cuadrática por osciladores armónicos físicos acoplados y no lineales, formulados en el álgebra de Clifford \(\mathcal{C}\ell_{3,0}\). El modelo se ha entrenado íntegramente desde cero sobre hardware de consumo (APU AMD Ryzen con AVX2), lo que lo sitúa en la categoría de modelos de borde (edge AI) con requisitos de cómputo muy reducidos.

Este checkpoint corresponde a la fase 2 de preentrenamiento extendido: 102,4 millones de tokens adicionales sobre los 102,4 millones previos, para un volumen acumulado de 204,8 millones de tokens. La ventana de contexto no está documentada en la información disponible, aunque el filtrado del dataset de razonamiento se limita a 2048 tokens. El vocabulario es de 16.384 tokens, con \(D_{\text{model}}=384\), \(D_{\text{state}}=192\) y 8 capas.

Su relevancia es fundamentalmente de investigación: propone una alternativa físicamente inspirada a la atención, con inspección de espacio de fases de las frecuencias y amortiguamientos aprendidos por capa, y publica un conjunto de datos de preentrenamiento con proporciones explícitas (mezcla 35/25/15/25). No obstante, el modelo tiene 0 descargas y 0 likes en el momento de la ficha, y los resultados declarados no están verificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clifford Resonant Sheaf Network (CRSN), no-transformer; osciladores armónicos acoplados en el álgebra de Clifford \(\mathcal{C}\ell_{3,0}\) |
| Parametros totales | 9,54 M (\(L=8\), \(D_{\text{model}}=384\), \(D_{\text{state}}=192\), vocabulario 16.384) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en punto flotante PyTorch, `crsn_step12500.pt`) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`crsn_step12500.pt`, diccionario con `model_state`); tokenizador en `tokenizer_16k.json` |

## Arquitectura y entrenamiento

CRSN reemplaza la autoatención cuadrática por osciladores armónicos físicos acoplados no lineales en el álgebra de Clifford \(\mathcal{C}\ell_{3,0}\). La model card describe cada capa mediante parámetros físicos aprendidos: amortiguamiento/rigidez \(\bar{\alpha}\) y frecuencia resonante \(\bar{\omega}\). La inspección de espacio de fases de las 8 capas muestra un gradiente monótono de frecuencias de UV (capa 0, \(\bar{\omega}_0=0.5432\)) a IR (capa 7, \(\bar{\omega}_7=0.5199\)), con el amortiguamiento bloqueado en torno a \(\bar{\alpha}\to0.128\pm0.001\), fenómeno que el autor denomina "ley empírica de amortiguamiento crítico". El entrenamiento emplea una optimización híbrida Muon + AdamW con retropropagación adjunta contractiva acotada, y ejecución nativa en CPU con SIMD (AVX2, Zen+).

El preentrenamiento utiliza la mezcla "Golden Ratio" del dataset DuoNeural/Golden-Ratio-Pretraining-Diet: 35 % razonamiento y cadena de pensamiento (OpenThoughts-114k filtrado a ≤2048 tokens y Numina-CoT), 25 % código agéntico y AST relacional (APIGen-80k, Gretel Synthetic Code, BIRD-SQL), 15 % alineamiento estructural estricto (Smol-Constraints y gramáticas formales) y 25 % "disolvente eutéctico" (FineWeb-Edu con puntuación ≥4 y Magpie-Qwen2.5-Pro on-policy). No se documenta RLHF ni DPO en la información disponible.

## Capacidades

- Generación de texto en inglés con modo de razonamiento paso a paso (el ejemplo de la model card usa "Let's think step by step").
- Razonamiento aritmético y de sentido común a pequeña escala, derivado del componente de cadena de pensamiento del dataset.
- Generación de código y consultas SQL, por la inclusión de APIGen-80k, Gretel Synthetic Code y BIRD-SQL en el preentrenamiento.
- Alineamiento estructural y salidas con formato restringido, gracias al 15 % de Smol-Constraints y gramáticas formales.
- Inferencia en CPU sin GPU, con ejecución SIMD nativa (AVX2).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad verificada; el dataset incluye material agéntico, pero no se documenta un modo agente.
- Capacidades multilingües: limitadas al inglés.
- Capacidades especiales (visión, audio, thinking mode explícito): no disponibles.

## Casos de uso

- Investigación en arquitecturas alternativas a la atención: el modelo sirve como banco de pruebas reproducible (9,54 M de parámetros, CPU) para estudiar si los osciladores acoplados en álgebra de Clifford pueden sustituir a la autoatención en tareas de modelado de lenguaje.
- Experimentos de edge AI y sistemas empotrados: al ejecutarse en una APU AMD Ryzen sin GPU, es adecuado para prototipos de generación de texto en dispositivos con restricciones de memoria y sin acelerador dedicado.
- Estudio de dinámica de entrenamiento: la inspección de espacio de fases por capa permite analizar la cristalización de frecuencias y el amortiguamiento crítico como fenómeno emergente durante el preentrenamiento.
- Generación de código y SQL en entornos de validación: el componente BIRD-SQL y de código sintético permite evaluar la calidad de consultas generadas en pipelines de prueba, no en producción crítica.
- Clasificación y generación con formato estricto: el entrenamiento con gramáticas formales y Smol-Constraints lo hace útil para experimentos de salidas estructuradas (JSON, DSL) en entornos controlados.
- Reproducción de recetas de datos: la mezcla 35/25/15/25 y el dataset Golden-Ratio-Pretraining-Diet permiten replicar el preentrenamiento y comparar curvas de pérdida con otras mezclas.
- Docencia y divulgación: por su tamaño reducido y su licencia MIT, es adecuado para demostraciones de arquitecturas no-transformer en cursos y talleres.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados, `verified: false`):

| Benchmark | Métrica | Valor |
|---|---|---|
| DuoNeural Golden Ratio Validation | Validation Loss | 2,6508 |
| DuoNeural Golden Ratio Validation | Perplexity | 14,16 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 9,54 M de parámetros en fp32 el checkpoint ocupa del orden de 38 MB, por lo que cabe holgadamente en cualquier GPU consumer y en CPU.
- GPU recomendadas: no se documentan; el modelo está diseñado para CPU (AMD Ryzen Zen+ con AVX2). Cualquier GPU con suficiente memoria podría ejecutarlo, pero no hay cifras publicadas.
- Cabe en GPU consumer: sí, por tamaño (menos de 40 MB en fp32), aunque no hay benchmarks de rendimiento en GPU.
- Opciones de despliegue: carga directa con PyTorch (`torch.load` + `model.load_state_dict`), tal como muestra la model card. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay modelos directamente comparables en la información proporcionada: CRSN no es un transformer y no comparte arquitectura con modelos de parámetros similares. Se indica "no disponible" para una comparativa rigurosa de parámetros, contexto y rendimiento con alternativas de la misma categoría.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| CRSN-8L-Phase2-Extension | 9,54 M | no disponible | MIT | Hugging Face (0 descargas) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Resultados no verificados: las métricas de pérdida y perplejidad están marcadas como `verified: false` en el model-index y no se han contrastado de forma independiente.
- Modelo de investigación sin adopción: 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en producción ni de validación por terceros.
- Solo inglés: el modelo está entrenado y etiquetado únicamente para `en`, sin capacidades multilingües documentadas.
- Ventana de contexto no documentada: no se especifica la longitud de contexto máxima; el filtrado del dataset a 2048 tokens sugiere un contexto efectivo limitado, pero no se confirma.
- Riesgo de alucinación: con 9,54 M de parámetros y 204,8 M de tokens de entrenamiento, la capacidad de conocimiento factual es muy limitada; es esperable una alta tasa de alucinación en preguntas abiertas.
- Sesgos: no se documenta ninguna evaluación de sesgos; los datasets de origen (FineWeb-Edu, OpenThoughts, Magpie) pueden introducir sesgos de dominio y de estilo.
- Restricciones de licencia: MIT permite uso comercial, pero al ser un checkpoint de investigación sin garantías, no se recomienda su uso en producción sin validación propia.
- Dependencia de código externo: la inferencia requiere `model.py` y el tokenizador del repositorio, no incluidos en el peso descargable de forma estándar (repo de 0,0 GB en el momento de la ficha).
- Sin soporte documentado de tool calling, agentes ni cuantización: no hay formatos GGUF ni integraciones con runners estándar.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/CRSN-8L-Phase2-Extension
- Dataset de preentrenamiento: https://huggingface.co/datasets/DuoNeural/Golden-Ratio-Pretraining-Diet
- GitHub del proyecto: https://github.com/DuoNeural/CRSN
- Sitio del laboratorio: https://duoneural.com
- Cita (BibTeX): Caldwell, Jesse; Aura; Archon (2026). "Clifford Resonant Sheaf Networks: Solid-State Harmonic Oscillator Architectures for Edge Reasoning". DuoNeural AI Laboratory.
