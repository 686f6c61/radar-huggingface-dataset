# arshandalili/sasa-mistral-7b-layer8

## Resumen

SASA para Mistral-7B (capa 8) es un sparse autoencoder (SAE) de subespacio, no un modelo de lenguaje generativo. Lo desarrolla Seyed Arshan Dalili (junto a Mehrdad Mahdavi) y se publica como artefacto de interpretabilidad mecanicista asociado al paper *Subspace-Aware Sparse Autoencoders for Effective Mechanistic Interpretability* (NeurIPS 2026). El artefacto se entrena sobre el flujo residual que entra en el bloque 8 de Mistral-7B-v0.1, con el objetivo de descomponer las activaciones internas del modelo en caracteristicas interpretables y dispersas.

La innovacion frente a los SAE clasicos es que cada caracteristica no es una sola direccion, sino un subespacio de rango r: un grupo de r columnas consecutivas cuya activacion se mide por la norma de su codigo. En esta version, r=8 y se activan 10 grupos por token (l0=80 columnas), sobre un diccionario de 32.768 columnas. Se entrena con BatchTopK sobre el batch (arquitectura `batchtopk_manifold_sae`) durante 500 millones de tokens de The Pile con contexto de 512 tokens.

Es relevante para investigadores que trabajan en interpretabilidad de Mistral-7B: proporciona un diccionario de caracteristicas preentrenado para una capa concreta, con codigo reproducible y umbral de activacion calibrado sobre texto de Pile. No sirve para inferencia generativa ni para tareas de NLP; su valor es analitico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder de subespacio (SASA), `batchtopk_manifold_sae` |
| Parametros totales | no disponible (diccionario de 32.768 columnas, rango 8) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre The Pile, predominantemente ingles) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 1,1 GB, cargable con `sae_lens`) |

## Arquitectura y entrenamiento

El artefacto es un SAE de subespacio entrenado sobre `blocks.8.hook_resid_pre` de Mistral-7B-v0.1, es decir, el flujo residual que entra en el bloque 8. La arquitectura agrupa las columnas del diccionario en grupos de r=8 columnas consecutivas; la activacion de un grupo es la norma de su codigo, y el modelo se entrena con BatchTopK sobre el batch, lo que impone un numero fijo de grupos activos por token (10 grupos, l0=80 columnas). El diccionario tiene 32.768 columnas en total.

El entrenamiento usa 500 millones de tokens de The Pile con contexto de 512. Para evaluacion, el paper abre todo grupo cuya norma supere 6.2473, un umbral calibrado sobre texto de Pile y almacenado en `data/gate/mistral_l8.json` del repositorio de codigo. La carga requiere `sae_lens` 6.25 y el paquete `sasa`, que registra las arquitecturas SASA en `sae_lens`.

## Capacidades

- Descomposicion de activaciones del flujo residual de Mistral-7B-v0.1 (capa 8) en caracteristicas dispersas agrupadas en subespacios.
- Codificacion: `sae.encode(h)` devuelve codigos de forma `[tokens, K * r]`.
- Reconstruccion: `sae.decode(codes)` reconstruye la activacion a partir del codigo.
- Agrupacion interpretable: los codigos se reestructuran en `[-1, n_groups, group_rank]` para analizar la activacion por grupo.
- Umbral de activacion calibrado sobre Pile para seleccionar grupos activos en evaluacion.
- No soporta generacion de texto, tool calling, agentes, vision ni audio: no es un modelo de lenguaje.

## Casos de uso

- Analisis de caracteristicas en Mistral-7B: extraer las activaciones de la capa 8 sobre un corpus y codificarlas con el SAE para identificar direcciones interpretables asociadas a conceptos concretos.
- Estudios de circuitos y atribucion: usar los grupos activos por token como unidades de analisis para rastrear que caracteristicas se activan en tareas especificas.
- Investigacion de seguridad y alineamiento: localizar caracteristicas relacionadas con sesgos o comportamientos indeseados en las activaciones internas del modelo base.
- Comparacion de metodos de interpretabilidad: contrastar SASA (subespacios de rango 8) frente a SAE clasicos de una sola direccion sobre la misma capa y corpus.
- Reproduccion del paper: ejecutar las evaluaciones del articulo con el umbral 6.2473 y el codigo del repositorio para verificar resultados.
- Analisis de representaciones multilingues: aunque el entrenamiento es sobre Pile, se puede aplicar a activaciones de textos en otros idiomas para estudiar transferencia de caracteristicas.
- Docencia en interpretabilidad mecanicista: ejemplo practico de SAE con agrupacion por subespacios y umbral calibrado sobre un modelo abierto de 7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El artefacto pesa 1,1 GB; la VRAM para cargarlo es modesta (del orden de unos pocos GB incluyendo overhead de `sae_lens`).
- Requiere ejecutar Mistral-7B-v0.1 para obtener las activaciones de `blocks.8.hook_resid_pre`; en fp16 son aproximadamente 14 GB de VRAM solo para los pesos del modelo base.
- GPU recomendadas: A100 40/80 GB o H100 para procesar corpus grandes con el modelo base; RTX 4090 (24 GB) suficiente para Mistral-7B en fp16 y para el SAE.
- Cabe en GPU de consumo: si, con Mistral-7B cuantizado o en fp16 en tarjetas de 24 GB o mas.
- Despliegue: `sae_lens` 6.25 con el paquete `sasa`; el modelo base se puede servir con vLLM, TGI o llama.cpp para generar las activaciones, aunque la extraccion de activaciones intermedias requiere acceso a las hidden states.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Artefacto | Modelo base | Capa | Tipo | Diccionario | Licencia |
|---|---|---|---|---|---|
| SASA Mistral-7B layer8 | Mistral-7B-v0.1 | 8 | SAE de subespacio (r=8) | 32.768 columnas, 10 grupos/token | MIT |
| SAE clasico sobre Mistral-7B | Mistral-7B-v0.1 | variable | SAE de una direccion | no disponible en la informacion | no disponible |
| SAE de Llama-2-7B | Llama-2-7B | variable | SAE de una direccion | no disponible en la informacion | no disponible |

No se dispone de datos comparativos de rendimiento entre SASA y SAE clasicos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni responde a prompts; solo codifica y reconstruye activaciones.
- Entrenado exclusivamente sobre The Pile (contexto 512), con sesgo hacia el ingles y el dominio de ese corpus.
- El umbral de activacion 6.2473 esta calibrado sobre Pile; puede no ser adecuado para otros dominios o idiomas.
- Solo cubre la capa 8 de Mistral-7B-v0.1; no es transferible a otras capas ni a otros modelos sin reentrenamiento.
- Las caracteristicas del SAE son aproximaciones: la reconstruccion no es perfecta y puede haber caracteristicas poco interpretables o superpuestas.
- Licencia MIT permite uso comercial, pero el modelo base Mistral-7B-v0.1 tiene su propia licencia Apache 2.0 que debe respetarse por separado.
- El repositorio no declara idiomas soportados ni pipeline; la integracion depende de `sae_lens` 6.25 y del paquete `sasa`.

## Enlaces

- Hugging Face: https://huggingface.co/arshandalili/sasa-mistral-7b-layer8
- Codigo: https://github.com/arshandalili/sasa
- Paper (referencia en la model card): Dalili and Mahdavi, *Subspace-Aware Sparse Autoencoders for Effective Mechanistic Interpretability*, NeurIPS 2026
- Mistral 7B (anuncio): https://mistral.ai/news/announcing-mistral-7b/
- Mistral 7B (arXiv): https://arxiv.org/html/2310.06825
