# Bismark333/selective-read-preserving-repair-gpt2-small

## Resumen

El modelo `Bismark333/selective-read-preserving-repair-gpt2-small` es un checkpoint de un MLP residual condicional diseñado para la investigación en interpretabilidad mecanicista, concretamente para la técnica de *activation steering* y *selective repair*. No es un modelo de lenguaje independiente, sino un componente que se acopla a GPT-2 Small para restaurar activaciones corruptas en el punto `blocks.6.hook_resid_post` tras una corrupción estructurada a lo largo de direcciones de un sparse autoencoder (SAE). El autor, Bismark333, publica este artefacto como parte de un estudio sobre reparación selectiva de activaciones, con un resultado estadísticamente no concluyente.

El checkpoint contiene un `ConditionalResidualMLP` con 7.092.480 parámetros, que acepta un tensor de activaciones de dimensión 768 y una fuerza de intervención escalar. Está pensado para ser usado dentro de un pipeline de *steering* más amplio, no como un modelo generativo. Su relevancia radica en que documenta un intento de reparación selectiva con controles rigurosos y publica un resultado negativo, algo poco habitual en la literatura de interpretabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConditionalResidualMLP (MLP residual condicional) |
| Parametros totales | 7.092.480 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje generativo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un `ConditionalResidualMLP` con `d_model=768`, `hidden_dim=1536` y `max_strength=3.0`. Su función es tomar un tensor de activaciones (la salida residual del bloque 6 de GPT-2 Small) y una fuerza de intervención `u`, y devolver una versión "reparada" de esas activaciones. No se trata de un transformer ni de un modelo MoE; es un MLP condicional que se entrena para deshacer el efecto de una corrupción estructurada aplicada a lo largo de direcciones SAE.

El entrenamiento se realizó sobre GPT-2 Small, utilizando un protocolo de corrupción estructurada a lo largo de seis features finales de un sparse autoencoder. El estudio incluyó un control de *matched-rate* y evaluó la capacidad del modelo para preservar la preactivación del SAE objetivo. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO, ya que la model card no los proporciona. El checkpoint corresponde al run `structured-seed-29`.

## Capacidades

- Restauración de activaciones corruptas en el residual stream de GPT-2 Small en el hook `blocks.6.hook_resid_post`.
- Intervención condicionada por una fuerza escalar `u` (hasta 3.0), lo que permite ajustar la intensidad de la reparación.
- Preservación de la preactivación del SAE objetivo, aunque sin garantía de preservar todo el soporte TopK.
- Integración con pipelines de *activation steering* y *sparse autoencoders*.
- No es un modelo generativo: no genera texto, código ni responde a prompts.
- No soporta tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Investigación en interpretabilidad mecanicista: el modelo permite estudiar cómo intervenciones en direcciones SAE afectan a las activaciones residuales y si un MLP condicional puede revertir parcialmente esa corrupción.
- Evaluación de técnicas de *selective repair*: sirve como artefacto de referencia para comparar métodos de reparación de activaciones en GPT-2 Small.
- Desarrollo de *activation steering*: puede integrarse en pipelines que manipulan representaciones internas para modificar el comportamiento del modelo base, aunque su eficacia no está estadísticamente confirmada.
- Reproducción de experimentos: el repositorio incluye `denoiser.py`, `example.py` y un reporte completo (`REPORT.md`) que permiten reproducir el estudio y verificar los resultados.
- Docencia y formación en interpretabilidad: como ejemplo de un componente de reparación condicional con controles rigurosos y publicación de resultados negativos.
- Benchmarking de métodos de denoising de activaciones: el checkpoint puede usarse como baseline en estudios comparativos de restauración de representaciones internas.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados del estudio (run `structured-seed-29`):

| Metrica | Valor |
|---|---|
| Trigger AUROC | 0.717 |
| AUPRC | 0.233 |
| Spearman con causal repair benefit | 0.081 |
| NLL(always-read) - NLL(event-read) con u=0.5 | 0.182 (95% CI [-0.257, 0.811]) |

El intervalo de confianza de la diferencia de NLL cruza el cero, por lo que el autor no declara una victoria estadísticamente significativa de la reparación selectiva. No se proporcionan comparaciones con otros modelos o métodos en la información disponible.

## Requisitos de hardware

- El modelo es un MLP pequeño (7M parámetros), por lo que la inferencia es trivial en cualquier GPU moderna e incluso en CPU.
- VRAM estimada: menos de 100 MB en FP32 (los pesos ocupan ~28 MB). Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) y en entornos sin GPU.
- GPU recomendadas: cualquiera con al menos 1 GB de VRAM; no requiere aceleración específica.
- Opciones de despliegue: al ser un componente de investigación, no se usa con vLLM, llama.cpp u Ollama. Se carga directamente con PyTorch y safetensors.
- Latencia y throughput: no se han publicado mediciones, pero al ser un MLP de una sola capa oculta, la latencia es del orden de microsegundos por forward pass.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (MLP condicionales para reparación de activaciones en GPT-2 Small). El campo de *selective repair* es emergente y este artefacto es específico de un estudio concreto. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo solo ha sido estudiado para GPT-2 Small, un único layer del residual stream y seis features finales de un SAE. No es extrapolable a otros modelos, capas o dimensiones sin reentrenamiento.
- El resultado principal del estudio es negativo: la reparación selectiva no muestra una ventaja estadísticamente significativa frente a la lectura siempre (el intervalo de confianza cruza cero).
- La preservación de la preactivación del SAE objetivo no garantiza la preservación de todo el soporte TopK, lo que limita su uso en aplicaciones que requieran fidelidad completa de las representaciones.
- No es un modelo de lenguaje: no puede generar texto ni responder a prompts. Intentar usarlo como un LLM producirá errores.
- No se han documentado sesgos, riesgos de alucinación o problemas de seguridad, ya que no es un modelo generativo.
- La licencia MIT permite uso comercial, pero el artefacto es de investigación y no está pensado para producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Bismark333/selective-read-preserving-repair-gpt2-small
- Modelo base: https://huggingface.co/openai-community/gpt2
- Reporte interno (dentro del repo): `REPORT.md` (accesible desde el repositorio de Hugging Face)
- Código de ejemplo: `example.py` y `denoiser.py` (dentro del repositorio)
