# CharlieBT/gx32-decider

## Resumen

gx32-decider es un modelo de decisión (decision-model) publicado por CharlieBT bajo licencia MIT, construido como un merge en espacio de pesos de dos fine-tunes públicos de baselabs/mammoth-1, que a su vez deriva de Qwen3.5-27B. No incorpora entrenamiento propio: todas las modificaciones aprendidas proceden de los modelos padre isomsom/sn92-gen-m87b y xflud/sn92-decider-1. El modelo se distribuye en el layout de lectura conjunta (joint-readout) de REAX, con backbone Qwen3_5Model, un fichero `readout.safetensors` y un `decision_config.json`.

Con 26.085.330.160 parámetros (aproximadamente 26,1 mil millones) y un tamaño de repositorio de 52,2 GB en safetensors, se posiciona en la franja de modelos densos de gran tamaño. Su propósito declarado es servir como modelo generalista dentro de la familia SN92, orientado a tareas de decisión, y su interés actual radica en ser un ejemplo de merge TIES reproducible sobre un backbone Qwen3.5-27B, con trazabilidad completa de padres, revisiones y receta en MERGE.json.

La relevancia práctica es limitada por su escasa adopción (9 descargas, 0 likes en el momento de la ficha) y por la ausencia de model card detallada más allá de la receta de merge. No obstante, para investigadores interesados en técnicas de fusión de pesos y en el ecosistema REAX, el modelo ofrece un caso documentado de merge con licencias compatibles (MIT y Apache-2.0) y conservación de avisos de copyright de todos los padres.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso con backbone Qwen3_5Model y layout de joint-readout REAX |
| Parámetros totales | 26.085.330.160 (aproximadamente 26,1 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en bfloat16/safetensors) |
| Idiomas soportados | No disponible |
| Licencia | MIT (con términos de Qwen3.5-27B en LICENSE-APACHE-2.0) |
| Formato de pesos | safetensors (backbone + `readout.safetensors`) |

## Arquitectura y entrenamiento

El modelo emplea un backbone Qwen3_5Model, es decir, la arquitectura de Qwen3.5-27B, sobre la que se aplica el layout de lectura conjunta de REAX: además de los pesos del backbone, se incluye un módulo de lectura (`readout.safetensors`) y una configuración de decisión (`decision_config.json`) que definen el comportamiento del modelo como decision-model. No se trata de un MoE ni de una arquitectura híbrida SSM; es un transformer denso de aproximadamente 26,1 mil millones de parámetros.

El entrenamiento es nulo por parte del autor del merge: la receta aplicada es TIES tensor a tensor sobre el modelo base baselabs/mammoth-1 (revisión `03007ab3c4481bf01c71ef63adbbbc4b2093d71a`), con pesos 1 para cada padre (m87b y dec1) y lambda 1. Para cada tensor se conservan las top-0,5 entradas por magnitud de cada padre, se elige el signo por suma ponderada y se promedian las entradas coincidentes; el cálculo se hace en float32 tensor a tensor y se redondea una sola vez a bfloat16. El readout se obtiene como media ponderada de los readouts de los padres tras dividir cada uno por su escala de mínimos cuadrados respecto al readout base. La configuración, el tokenizer y los ficheros de decisión/joint config provienen del modelo base, y MERGE.json documenta la receta completa.

## Capacidades

- Generación de texto y razonamiento general, heredados del backbone Qwen3.5-27B y de los fine-tunes padre.
- Comportamiento como modelo de decisión dentro del ecosistema REAX/SN92, con lectura conjunta mediante `readout.safetensors` y `decision_config.json`.
- Capacidades de los padres orientadas a tareas de decisión y generación (sn92-gen-m87b y sn92-decider-1), aunque la model card no detalla tareas concretas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Investigación en fusión de pesos: el modelo sirve como caso reproducible de merge TIES sobre un backbone Qwen3.5-27B, con MERGE.json y revisiones de padres documentadas, útil para estudiar el efecto de la receta en el rendimiento downstream.
- Evaluación de modelos de decisión en el ecosistema REAX: permite probar el layout de joint-readout con `decision_config.json` en pipelines de decisión estructurada, comparando con los padres sn92-gen-m87b y sn92-decider-1.
- Generación de texto generalista en entornos de investigación: al heredar el backbone Qwen3.5-27B, puede emplearse para tareas de generación y razonamiento en laboratorio, siempre que se validen sus capacidades empíricamente.
- Base para fine-tuning posterior: al ser un modelo denso de 26,1 B con licencia MIT, puede servir como punto de partida para ajustes específicos en dominios concretos, con la ventaja de una licencia permisiva.
- Reproducción de experimentos de merge: útil para replicar la receta TIES con distintos pesos o lambdas y medir el impacto en benchmarks, dado que el autor documenta la configuración exacta.
- Despliegue en investigación con licencia permisiva: para equipos que necesitan un modelo de gran tamaño con licencia MIT y trazabilidad de licencias de padres (MIT y Apache-2.0), en entornos controlados y no críticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 52 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 80 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 26-30 GB, viable en GPUs de 32 GB o superiores.
- VRAM estimada en cuantización de 4 bits: alrededor de 14-16 GB, potencialmente viable en GPUs consumer de 16-24 GB, aunque no hay confirmación de soporte de cuantización en la información disponible.
- GPUs recomendadas: A100 80 GB, H100 80 GB para bfloat16; RTX 4090 (24 GB) solo con cuantización agresiva y contexto reducido.
- Cabe en GPU consumer: posible en RTX 4090/3090 con cuantización de 4 bits, no confirmado por el autor.
- Opciones de despliegue: no disponibles en la información proporcionada; al ser safetensors con backbone Qwen3_5Model, podría requerir el código de REAX o de Qwen3.5 para cargar el readout y la configuración de decisión.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| gx32-decider | 26,1 B | No disponible | MIT | Hugging Face (9 descargas) | Merge TIES de dos fine-tunes de mammoth-1 |
| baselabs/mammoth-1 | No disponible | No disponible | MIT | Hugging Face | Modelo base del merge, post-entrenado desde Qwen3.5-27B |
| isomsom/sn92-gen-m87b | No disponible | No disponible | MIT | Hugging Face | Padre del merge, fine-tune de mammoth-1 |
| xflud/sn92-decider-1 | No disponible | No disponible | MIT | Hugging Face | Padre del merge, fine-tune de mammoth-1 |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al heredar de Qwen3.5-27B y fine-tunes, puede arrastrar sesgos de los datos de entrenamiento originales.
- Riesgo de alucinación: no evaluado; no hay benchmarks ni evaluaciones de fidelidad publicadas.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no están documentados en la model card.
- Restricciones de licencia: licencia MIT, pero el fichero LICENSE-APACHE-2.0 contiene los términos de Qwen3.5-27B; es necesario revisar ambas licencias para uso comercial y conservar los avisos de copyright de todos los padres.
- Advertencia de producción: el modelo tiene muy baja adopción (9 descargas) y no hay evidencia de validación externa; no se recomienda su uso en producción sin una evaluación propia exhaustiva.
- Dependencia del ecosistema REAX: la carga correcta requiere el layout de joint-readout (`readout.safetensors`, `decision_config.json`), lo que puede limitar la compatibilidad con herramientas estándar de inferencia.
- Sin entrenamiento propio: el autor no aporta datos de entrenamiento adicionales, por lo que el comportamiento depende enteramente de los padres y de la receta de merge.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CharlieBT/gx32-decider
- Modelo base: https://huggingface.co/baselabs/mammoth-1
- Padre 1: https://huggingface.co/isomsom/sn92-gen-m87b
- Padre 2: https://huggingface.co/xflud/sn92-decider-1
- Qwen3.5-27B (referencia del backbone): no disponible en la información proporcionada
- Paper o blog de REAX/SN92: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
