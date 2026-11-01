# putao886/DeepSeek-V4-Flash-0731-heretic-abliterated-v2-GGUF-lora

## Resumen

DeepSeek-V4-Flash-0731-heretic-abliterated-v2 es un conjunto de adaptadores LoRA de rango 1 publicados por el usuario putao886 (a partir del trabajo metodológico de MoriNoNushi) que modifican el modelo base DeepSeek-V4-Flash-0731, un transformer MoE de 284B parámetros totales y 13B activos bajo licencia MIT. El propósito del adaptador es suprimir el comportamiento de rechazo del modelo base mediante "abliteration" (ablation direccional), de modo que el modelo resultante responda a peticiones que el original declina, incluidas las dañinas, ofensivas o ilegales. No es un modelo nuevo: es un overlay de pesos que se aplica sobre el GGUF del modelo base sin modificarlo ni recuantizarlo.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica concreta (heretic-gguf, port nativo de GGUF del proyecto Heretic con optimización multiobjetivo Optuna) que permite aplicar abliteration directamente sobre pesos cuantizados. Por otro, advierte de que el artefacto tiene guardarraíles reducidos de forma deliberada y que su uso conlleva responsabilidad plena del operador. El repositorio pesa 0,3 GB y contiene únicamente los adaptadores (~50 MB cada uno), no los pesos del modelo base.

El ID del repositorio incluye el sufijo "GGUF-lora", y la model card indica que se requieren los pesos base por separado (cualquier cuantización GGUF de DeepSeek-V4-Flash-0731 sirve, aunque el adaptador se ajustó y evaluó contra UD-Q8_K_XL). Los parámetros totales declarados en safetensors del repo (497.664) corresponden al adaptador, no al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de rango 1 sobre transformer MoE (modelo base DeepSeek-V4-Flash-0731) |
| Parametros totales | 497.664 (adaptador); modelo base: 284B |
| Parametros activos | 13B (modelo base, MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Adaptador en GGUF (aplicado en cómputo f32/f16); base en cualquier cuantización GGUF, evaluado contra UD-Q8_K_XL |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (adaptadores LoRA); base en GGUF |

## Arquitectura y entrenamiento

El adaptador no entrena el modelo base: aplica ablation direccional sobre el espacio residual. La dirección de rechazo se calcula como diferencia de medias sobre 480 prompts dañinos y 480 benignos, ortogonalizada contra la media de los benignos, y se proyecta fuera de las salidas de atención y de los pesos de down-projection del MoE. Los hiperparámetros (fuerzas por capa, kernel de capas, índice de dirección) se optimizan con Optuna TPE multiobjetivo, minimizando conjuntamente tasa de rechazo y divergencia KL, en un estudio base más cuatro estudios de seguimiento sembrados, con ~2.100 trials totales, de los cuales los ~280 últimos se puntuaron sobre el conjunto de evaluación completo.

La configuración v2 proviene del estudio `followup4`, con alcance de dirección global, índice de dirección ~20,5–21,2 de 43 capas y fuerzas por experto escaladas según la frecuencia de routing dañino/benigno medida. Se incluyen cuatro adaptadores Pareto-óptimos: `t265` (atención 4,96 en capa 31; MLP routed 0,55; shared 1,46), `t256` (atención 3,46 en capa 29; routed MLP desactivado; shared 1,62), `t273` (atención 5,00 en capa 27; routed MLP 0,61; shared 1,50) y `t264` (atención 4,70 en capa 28; routed MLP 0,58; shared 1,54). La forma LoRA es la opción sin pérdida: los pesos base no se modifican ni se recuantizan, y cada adaptador incrusta su procedencia completa como claves de metadatos `adapter.heretic.*`.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base DeepSeek-V4-Flash-0731 (MoE de 284B/13B activos).
- Supresión del comportamiento de rechazo: el modelo responde a peticiones que el base declina, incluidas las dañinas.
- Capacidad de alternar entre cuatro puntos del compromiso rechazo/KL según el adaptador elegido.
- Aplicación y retirada instantáneas: omitir `--lora` restaura el modelo base exacto.
- Compatibilidad con `llama-server` y `--jinja`; no requiere parámetros de muestreo especiales.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni multilingüismo específicas del adaptador.

## Casos de uso

- Investigación sobre alineación y seguridad: medir empíricamente cómo varía la tasa de rechazo y la divergencia KL al aplicar ablation direccional sobre un MoE de 284B, usando los cuatro adaptadores como puntos de la curva.
- Auditoría de robustez de guardarraíles: evaluar qué fracción de prompts dañinos de `mlabonne/harmful_behaviors` sortea el modelo tras la abliteration (8,57% a 3,57% según adaptador) y comparar con el 99,29% del base.
- Estudio de degradación colateral: cuantificar la pérdida de comportamiento normal mediante KL sobre `mlabonne/harmless_alpaca` para cada configuración y elegir el punto de operación adecuado.
- Reproducibilidad metodológica: replicar el pipeline de heretic-gguf sobre otros modelos GGUF, ya que la herramienta es pública y el adaptador embebe su procedencia completa.
- Despliegue controlado en entornos de investigación cerrados: servir el modelo con `llama-server` y `--lora` en infraestructura aislada, con registro de prompts y revisión humana, dado el riesgo de contenido dañino.
- Comparación de técnicas de desensoring: contrastar la abliteration direccional optimizada con Optuna frente a otras aproximaciones (fine-tuning, prompting) sobre el mismo modelo base y el mismo conjunto de evaluación.
- Docencia y divulgación: ilustrar de forma tangible qué es la abliteration y por qué los guardarraíles de un modelo no son una propiedad inmutable de los pesos.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos sobre 140 prompts dañinos (100 de `mlabonne/harmful_behaviors` test + 40 propios) y 100 benignos (`mlabonne/harmless_alpaca` test), decodificación greedy, respuestas de 100 tokens, contra la base UD-Q8_K_XL:

| Configuracion | Tasa de rechazo (dañinos) | Divergencia KL (benignos) |
|---|---|---|
| Modelo base | 99,29% (139/140) | 0 (por definición) |
| v1 adapter (followup3 t25) | 14,29% (20/140) | 0,0569 |
| v2 t265 | 8,57% (12/140) | 0,0651 |
| v2 t256 | 7,14% (10/140) | 0,0845 |
| v2 t273 | 5,00% (7/140) | 0,0927 |
| v2 t264 | 3,57% (5/140) | 0,1399 |

Los rechazos se cuentan por coincidencia de palabras clave (marcadores en inglés y chino); la KL se mide sobre los logits del primer token en prompts benignos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa ~50 MB por archivo y se aplica en cómputo f32/f16, por lo que no añade requisitos de VRAM significativos sobre el modelo base.
- El modelo base DeepSeek-V4-Flash-0731 (284B/13B activos) en UD-Q8_K_XL ocupa ~162 GB, según la model card; requiere múltiples GPU de datacenter (A100 80GB, H100 80GB) o configuraciones con offload a CPU.
- No cabe en una GPU de consumo individual en cuantizaciones altas; cuantizaciones más agresivas del base podrían reducir el requisito, pero no se aportan cifras concretas en la información disponible.
- Despliegue recomendado: `llama-server` con `--lora` y `--jinja`, más flags de offload (`-ngl 999`, `-c`, splits tensoriales).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731 (base) | 284B totales / 13B activos | no disponible | MoE con guardarraíles intactos | MIT | HuggingFace (unsloth GGUF) |
| Este adaptador v2 (t265/t256/t273/t264) | 497.664 (adaptador) | no disponible | Abliteration direccional optimizada | MIT | HuggingFace (putao886) |
| v1 adapter (MoriNoNushi) | no disponible | no disponible | Abliteration previa, 20/140 rechazos | MIT | HuggingFace |
| Heretic (herramienta) | no aplica | no aplica | Abliteration genérica con Optuna | no disponible | GitHub (p-e-w) |

## Limitaciones y advertencias

- El adaptador suprime los rechazos de forma deliberada: el modelo generará contenido ofensivo, perturbador, de odio, sexualmente explícito, violento o con instrucciones detalladas para actos dañinos o ilegales.
- La abliteration suprime rechazos, no la capacidad del modelo base; no se documenta en la información disponible qué otras capacidades se degradan más allá de la KL medida.
- La KL de 0,0651–0,1399 sobre benignos indica daño colateral no nulo en el comportamiento normal; el adaptador más agresivo (t264) casi duplica la KL del conservador (t265).
- Los números de rechazo se obtienen por coincidencia de palabras clave, lo que puede sobreestimar o subestimar la conformidad real.
- El repositorio contiene solo adaptadores; requiere descargar por separado el modelo base (~162 GB en Q8), lo que condiciona el despliegue.
- Licencia MIT permite uso comercial, pero el operador asume toda la responsabilidad legal y ética del contenido generado.
- No se documentan sesgos específicos, idiomas soportados ni limitaciones de contexto en la información disponible.
- El repositorio tiene 79 descargas y 0 likes en el momento de la consulta; no hay validación independiente de los resultados publicados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/putao886/DeepSeek-V4-Flash-0731-heretic-abliterated-v2-GGUF-lora
- Modelo base (GGUF, unsloth): https://huggingface.co/unsloth/DeepSeek-V4-Flash-0731-GGUF
- Adaptador v1 (MoriNoNushi): https://huggingface.co/MorinoNushi/DeepSeek-V4-Flash-0731-heretic-GGUF-lora
- GGUF fusionado v1 listo para ejecutar: https://huggingface.co/MorinoNushi/DeepSeek-V4-Flash-0731-heretic-GGUF
- Herramienta heretic-gguf: https://github.com/MoriNoNushi/heretic-gguf
- Proyecto Heretic original: https://github.com/p-e-w/heretic
