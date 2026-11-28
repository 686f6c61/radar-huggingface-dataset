# BurnyCoder/atlas-mess3-belief-transformer

## Resumen

`atlas-mess3-belief-transformer` es un transformer minúsculo entrenado por BurnyCoder para replicar el experimento de Shai et al. 2024, "Transformers represent belief state geometry in their residual stream" (arXiv:2405.15943). El modelo aprende a predecir el siguiente token en secuencias generadas por el proceso de Mess3, un proceso de Markov oculto de tres estados, y su interés radica en que su stream residual final codifica linealmente la creencia bayesiana óptima sobre el estado oculto, que en este caso forma un fractal sobre el 2-simplex.

No es un modelo de lenguaje de propósito general ni está pensado para inferencia downstream: es un artefacto de investigación en interpretabilidad mecanicista, parte del proyecto "Atlas of Circuits & Manifolds". Con 4 capas, `d_model=64`, una sola cabeza de atención y un vocabulario de 3 tokens, su valor es didáctico y experimental: permite estudiar cómo una red pequeña representa geometrías de creencia y cómo esas representaciones se pueden analizar con técnicas de interpretabilidad.

Su relevancia es acotada pero clara para quien trabaja en interpretabilidad: ofrece un caso reproducible, con pesos publicados en formato `state_dict` de PyTorch y compatible con TransformerLens, para examinar la hipótesis de que los transformers linealicen estructuras probabilísticas complejas en su representación interna. No hay datos de benchmarks, idiomas ni uso comercial previsto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (HookedTransformer de TransformerLens), 4 capas, 1 cabeza de atención, `d_model=64`, `d_head=64`, `d_mlp=256`, activación ReLU, normalización LayerNorm |
| Parametros totales | no disponible (estimable en el orden de decenas de miles a partir de la configuración, pero no publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 10 tokens (`n_ctx=10`) |
| Tipos de cuantizacion | no disponible (pesos en precisión nativa de PyTorch; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (vocabulario de 3 tokens de un proceso sintético, sin lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | `state_dict` de PyTorch (`mess3_transformer.pt`) más `config.json` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder estándar de 4 capas con una única cabeza de atención de dimensión 64, MLP de 256 unidades con ReLU y LayerNorm. El vocabulario es de 3 tokens y la ventana de contexto de 10 posiciones. Se entrenó con Adam a learning rate 1e-3, con 512 secuencias por paso y 30 000 pasos, sobre predicción del siguiente token en secuencias del proceso de Mess3 con parámetros x = 0.05 y alpha = 0.85. Los pesos se guardan como `state_dict` de un `HookedTransformer` de TransformerLens, lo que facilita el análisis con hooks de activaciones.

La innovación no está en la arquitectura sino en el fenómeno que se replica: el stream residual final codifica linealmente la creencia bayesiana óptima sobre el estado oculto del proceso, una distribución sobre el 2-simplex cuya geometría es fractal. No se documentan fases de RLHF, DPO ni ajuste por instrucciones; es un entrenamiento puramente supervisado sobre una tarea sintética.

## Capacidades

- Predicción del siguiente token en secuencias del proceso de Mess3 (vocabulario de 3 símbolos).
- Representación lineal de la creencia bayesiana sobre el estado oculto en el stream residual final.
- Análisis de circuitos y representaciones mediante hooks de TransformerLens.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de un LLM de propósito general.
- No tiene capacidades multilingües ni de lenguaje natural.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Replicación de experimentos de interpretabilidad mecanicista: cargar el `state_dict` y analizar con TransformerLens cómo evoluciona la representación de la creencia a lo largo de las capas, comparando con la geometría fractal esperada del 2-simplex.
- Docencia en cursos de interpretabilidad: modelo de tamaño mínimo que se entrena y analiza en minutos, útil para explicar linear probing y análisis de representaciones sin necesidad de infraestructura grande.
- Validación de metodologías de probing: usar el modelo como banco de pruebas controlado donde la estructura latente es conocida, antes de aplicar las mismas técnicas a LLMs reales.
- Estudio de la relación entre atención y estado de creencia: con una sola cabeza y 4 capas, permite aislar qué componentes computan la actualización bayesiana y cuáles la linealizan en el residual.
- Reproducción de resultados de Shai et al. 2024: comparar la geometría aprendida con la reportada en el paper bajo los mismos hiperparámetros (x = 0.05, alpha = 0.85).
- Desarrollo de visualizaciones interactivas: alimentar la entrada del Atlas of Circuits & Manifolds para explorar el fractal de creencia de forma interactiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB; el repositorio ocupa 0.0 GB y el modelo es de escala de decenas de miles de parámetros.
- GPU recomendadas: cualquiera; funciona en CPU sin problema. GPU no necesaria.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: PyTorch nativo y TransformerLens (`HookedTransformer`). No aplica vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje con tokenizador estándar.
- Latencia y throughput: no disponibles; irrelevantes para el caso de uso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| atlas-mess3-belief-transformer | no disponible (config: 4 capas, d_model=64) | 10 | Mess3, interpretabilidad | MIT | Hugging Face |
| Modelos de Shai et al. 2024 | no disponible en la información | no disponible | Mess3, interpretabilidad | no disponible | Código del paper |
| Otros artefactos del Atlas of Circuits & Manifolds | no disponible | no disponible | Interpretabilidad | no disponible | GitHub del proyecto |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente que son modelos minúsculos entrenados en tareas sintéticas y no aptos para ningún uso downstream.
- Sin capacidades de lenguaje natural: vocabulario de 3 tokens, sin tokenizador estándar ni idiomas.
- Contexto de solo 10 tokens, insuficiente para cualquier tarea práctica.
- No se documentan sesgos, pero al entrenarse sobre un proceso sintético controlado no son aplicables las evaluaciones habituales de sesgo.
- Riesgo de alucinación no evaluado; irrelevante en su dominio sintético, pero no debe extrapolarse su comportamiento a LLMs.
- Licencia MIT permite uso comercial, pero el modelo no tiene aplicación comercial realista.
- Requiere reconstruir la arquitectura con el código del repositorio (`src/atlas/entries/belief_fractal.py`) antes de cargar el `state_dict`; no es cargable con `from_pretrained` estándar.

## Enlaces

- Hugging Face: https://huggingface.co/BurnyCoder/atlas-mess3-belief-transformer
- Paper de referencia: https://arxiv.org/abs/2405.15943
- Repositorio del Atlas: https://github.com/BurnyCoder/circuits-and-manifolds-in-llms-atlas
- Entrada interactiva: https://burnycoder.github.io/circuits-and-manifolds-in-llms-atlas/#/entry/belief-fractal
