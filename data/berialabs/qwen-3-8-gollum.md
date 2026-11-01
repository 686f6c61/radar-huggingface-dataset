# BeriaLabs/Qwen-3.8-gollum

## Resumen

BeriaLabs/Qwen-3.8-gollum es un ajuste fino (finetune) del modelo Qwen/Qwen3.8-27B, publicado por el colectivo BeriaLabs bajo licencia Apache 2.0. Se distribuye como un modelo "abliterated" y "uncensored": es decir, se ha intervenido sobre los pesos para eliminar o atenuar los comportamientos de rechazo aprendidos durante el alineamiento del modelo original, con el objetivo declarado de facilitar experimentos de interpretabilidad mecanicista. El repositorio tiene acceso restringido (gated) y requiere aceptar condiciones en HuggingFace antes de la descarga.

El modelo conserva la arquitectura del base, etiquetada en los metadatos como `qwen3_5_text`, con 26.895.998.464 parámetros totales (aproximadamente 26,9 mil millones) en formato safetensors. El repositorio ocupa 153,5 GB, lo que sugiere pesos en precisión alta (BF16/FP16) sin cuantizaciones publicadas por el autor. Los idiomas declarados son inglés y español.

Su relevancia actual es acotada pero específica: sirve como material de estudio para quienes investigan cómo se codifican los comportamientos de seguridad en los transformers, y como alternativa para desarrolladores que necesitan un modelo de ~27B sin capas de rechazo para tareas de generación creativa o análisis de contenido sensible, asumiendo los riesgos asociados. No hay información pública sobre benchmarks, pipeline de inferencia ni datos de entrenamiento del ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, familia Qwen3.5 (tag `qwen3_5_text`) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no es MoE segun los metadatos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors, 153,5 GB) |
| Idiomas soportados | en, es |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen/Qwen3.8-27B, un transformer denso de aproximadamente 27 mil millones de parámetros. La etiqueta `qwen3_5_text` en los metadatos indica la variante de arquitectura textual de la familia Qwen 3.5. No se dispone de información publicada sobre la composición del dataset de ajuste, el número de tokens utilizados, ni si se emplearon técnicas de RLHF, DPO o SFT supervisado en esta iteración.

La innovación declarada es la "abliteración": una intervención sobre los pesos que busca neutralizar las direcciones de activación asociadas a la negativa a responder. El repositorio incluye la etiqueta `mechanistic-interpretability`, lo que sugiere que el ajuste se diseñó como herramienta de investigación para estudiar circuitos internos de seguridad y refusal. No hay documentación técnica publicada sobre el método exacto de abliteración aplicado, las capas intervenidas ni las métricas de degradación resultantes.

## Capacidades

- Generación de texto en inglés y español, heredada del modelo base Qwen3.8-27B.
- Razonamiento de múltiples pasos y matemáticas, presumiblemente conservados del base (sin verificación pública).
- Generación de código, sujeta a la capacidad del modelo original.
- Comportamiento "uncensored": ausencia o atenuación de rechazos ante peticiones que el modelo base rechazaría.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible.
- Capacidades de visión o audio: no disponibles (el tag indica variante `_text`).

## Casos de uso

- Investigación en interpretabilidad mecanicista: el modelo permite estudiar qué direcciones de activación codifican el comportamiento de rechazo, comparando activaciones con el modelo base sin abliterar. Es el caso de uso declarado por el autor mediante el tag correspondiente.
- Análisis de contenido sensible en entornos controlados: redacción y revisión de material sobre violencia, salud o temas tabú donde los rechazos del modelo alineado interrumpirían el flujo de trabajo, siempre con supervisión humana.
- Generación creativa sin restricciones temáticas: escritura de ficción con temáticas adultas o controvertidas, aprovechando la ausencia de capas de refusal.
- Evaluación de robustez de sistemas de moderación: usar el modelo como generador adversarial para probar clasificadores de contenido y filtros de seguridad propios.
- Estudio comparativo de alineamiento: medir la degradación de capacidades (razonamiento, código, matemáticas) entre el base y la versión abliterada para cuantificar el coste de la intervención.
- Fine-tuning posterior en español: al declarar soporte de español y licencia Apache 2.0, puede servir como punto de partida para ajustes en dominios hispanohablantes sin las restricciones de uso del modelo original.
- Despliegue en investigación académica con GPUs de gama alta: un modelo de ~27B en BF16 requiere hardware de datacenter, adecuado para laboratorios con A100/H100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 54 GB solo para pesos (26,9B × 2 bytes), más overhead de KV cache y activaciones; en la práctica, 70-80 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: ~27 GB de pesos, ~35-40 GB totales.
- VRAM estimada en cuantización de 4 bits (si se generan GGUF/AWQ propias): ~14-16 GB de pesos, ~20-24 GB totales.
- GPU recomendadas: A100 80GB, H100 80GB o múltiples GPUs para BF16; RTX 4090 (24 GB) solo viable con cuantización de 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantización de 4 bits; no en BF16.
- Opciones de despliegue: vLLM o TGI para safetensors en datacenter; llama.cpp u Ollama requieren conversión previa a GGUF, no publicada por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| BeriaLabs/Qwen-3.8-gollum | ~26,9B | no disponible | Apache 2.0 | Gated, 38 descargas |
| Qwen/Qwen3.8-27B (base) | ~27B | no disponible | no disponible en esta ficha | Publico |
| Modelos abliterated de la familia Llama 3 (p. ej. variantes de 8B/70B) | 8B-70B | variable | licencia Llama | Publicos |
| Modelos abliterated de Mistral/Mixtral | 7B-8x7B | variable | Apache 2.0 | Publicos |

La comparación cuantitativa de rendimiento no está disponible: no hay benchmarks publicados para este ajuste ni datos verificables de degradación frente al base.

## Limitaciones y advertencias

- La abliteración elimina o atenúa los mecanismos de rechazo, lo que incrementa el riesgo de generar contenido dañino, ilegal o sexualmente explícito sin filtro. No es apto para aplicaciones de cara al público sin moderación externa.
- Riesgo elevado de alucinación y de respuestas plausibles pero incorrectas, agravado por la posible degradación de capacidades tras la intervención en los pesos.
- No hay datos publicados sobre la magnitud de la degradación en razonamiento, matemáticas o código respecto al modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el despliegue comercial de un modelo sin salvaguardas expone al operador a responsabilidad legal y reputacional según la jurisdicción.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que añade fricción a pipelines automatizados.
- Idiomas limitados a inglés y español según los metadatos; el rendimiento en español no está verificado con benchmarks.
- Longitud de contexto no documentada en la información disponible; no asumir la del modelo base sin verificación.
- No se publican cuantizaciones oficiales (GGUF, AWQ, GPTQ), lo que obliga al usuario a generarlas por su cuenta.
- Sesgos del modelo base presumiblemente heredados y no mitigados; la abliteración no corrige sesgos, solo elimina rechazos.

## Enlaces

- HuggingFace: https://huggingface.co/BeriaLabs/Qwen-3.8-gollum
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
