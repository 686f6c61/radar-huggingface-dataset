# prayanksai/sarvam-105b-1711-mlx-q6

## Resumen

Sarvam-105B-1711 MLX 6-bit es una conversión comunitaria del modelo `sarvamai/sarvam-105b-1711-bf16` al formato MLX, realizada por el usuario prayanksai para permitir la inferencia en Macs con Apple silicon. El modelo original es un Mixture-of-Experts (MoE) de 105.000 millones de parámetros desarrollado por Sarvam AI, con aproximadamente 10.300 millones de parámetros activos por token, post-entrenado para seguir instrucciones, tool calling, tareas agénticas y lenguas índicas.

El checkpoint usa atención de estilo MLA (Multi-head Latent Attention) y una arquitectura MoE con 128 expertos enrutados más uno compartido, con enrutamiento top-8. La conversión aplica cuantización afín de 6 bits con grupo de tamaño 64, resultando en 6,501 bits efectivos por peso y un total de 18 shards de safetensors que ocupan aproximadamente 80,25 GiB.

La relevancia de esta ficha radica en que permite ejecutar un modelo de escala 105B en hardware de consumo de gama alta (Macs con 128 GiB de memoria unificada), algo imposible con el checkpoint BF16 original. El contexto configurado en este checkpoint es de 163.840 tokens, aunque el contexto práctico depende de la memoria unificada disponible y de la configuración de la caché KV.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención MLA (Multi-head Latent Attention); tipo MLX-LM `sarvam_mla` |
| Parametros totales | 106.031.767.424 (≈106B) |
| Parametros activos | ≈10,3B por token (enrutamiento top-8 de 128 expertos + 1 compartido) |
| Longitud de contexto | 163.840 tokens configurados en el checkpoint |
| Tipos de cuantizacion | Afín de 6 bits, grupo de 64 (6,501 bits efectivos por peso) |
| Idiomas soportados | No disponible (el modelo base está orientado a lenguas índicas y multilingüe, según tags) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors MLX (18 shards, ≈80,25 GiB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de tipo Mixture-of-Experts con atención MLA, una variante de atención con compresión latente que reduce el coste de memoria de la caché KV. El modelo tiene 128 expertos enrutados más un experto compartido, con enrutamiento top-8, lo que resulta en aproximadamente 10,3B de parámetros activos por token sobre un total de 106B. Esta configuración busca un equilibrio entre capacidad del modelo y eficiencia computacional en inferencia.

El checkpoint aquí descrito es una conversión de formato, no un reentrenamiento: se parte del modelo BF16 `sarvamai/sarvam-105b-1711-bf16` y se cuantiza a 6 bits con MLX-LM mediante `mlx_lm.convert` con `--q-bits 6` y `--q-group-size 64`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La model card indica que el modelo base está post-entrenado para seguir instrucciones, tool calling, tareas agénticas y lenguas índicas, y que el template de chat habilita el modo "thinking" por defecto.

## Capacidades

- Generación de texto conversacional multi-turno, con modo "thinking" activable o desactivable mediante el template de chat.
- Seguimiento de instrucciones y razonamiento multi-paso (tareas agénticas según la model card del modelo base).
- Tool calling / function calling, según la model card del modelo original.
- Capacidades multilingües orientadas a lenguas índicas (tag `indic-languages`), aunque no se detalla la lista exacta de idiomas.
- Inferencia local en Apple silicon mediante MLX-LM, con cuantización de 6 bits.
- No se dispone de información sobre capacidades de visión, audio u otras modalidades en la información proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede mantener conversaciones multi-turno con contexto largo (hasta 163.840 tokens configurados) ejecutándose íntegramente en un Mac con 128 GiB de memoria unificada, sin depender de servicios en la nube.
- Procesamiento de documentos largos en local: con una ventana de contexto de 163.840 tokens, se puede usar para resumir, extraer información o responder preguntas sobre documentos extensos, ajustando `--max-kv-size` según la memoria disponible.
- Automatización agéntica con tool calling: al estar post-entrenado para tool calling y tareas agénticas, puede integrarse en flujos que requieran invocar funciones o APIs, ejecutándose en hardware local para escenarios con requisitos de privacidad.
- Desarrollo y pruebas de pipelines MLX: sirve como banco de pruebas para validar la implementación `sarvam_mla` de MLX-LM (PR #2097) y para medir el impacto de la cuantización de 6 bits frente al BF16 en tareas concretas.
- Aplicaciones multilingües con foco en lenguas índicas: adecuado para prototipos de atención al cliente o generación de contenido en idiomas índicos, aunque la lista exacta de idiomas no está disponible en esta ficha.
- Investigación sobre cuantización: permite estudiar la degradación de precisión de un MoE de 106B cuantizado a 6 bits frente al modelo BF16 original, ejecutándose en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversión indica explícitamente que no se ha ejecutado una suite completa de benchmarks sobre el checkpoint de 6 bits y que la cuantización puede alterar la precisión respecto al modelo BF16 de origen.

## Requisitos de hardware

- VRAM/memoria unificada: aproximadamente 81 GiB solo para los pesos; se recomiendan 128 GiB o más de memoria unificada. Un Mac de 96 GiB puede funcionar con contextos cortos y caché conservadora, pero con poco margen. Un Mac de 64 GiB no puede alojar el checkpoint completo en memoria.
- Almacenamiento: al menos 90–100 GiB libres para la descarga y la caché (los pesos ocupan ≈80,25 GiB en 18 shards).
- GPU recomendadas: Apple silicon (M-series) con macOS 14 o superior (se recomienda encarecidamente macOS 15 o superior por el cableado de memoria para modelos grandes de MLX-LM). No se dispone de información sobre soporte en GPU NVIDIA u otras plataformas para este checkpoint MLX.
- ¿Cabe en GPU de consumo? Solo en Macs de gama alta con 128 GiB de memoria unificada; no cabe en GPUs de consumo tipo RTX 4090 (24 GB) ni en Macs de 64 GiB.
- Opciones de despliegue: MLX-LM (`mlx_lm.chat`, `mlx_lm.generate`). Requiere una build de MLX-LM con `mlx_lm.models.sarvam_mla` (propuesto en MLX-LM PR #2097); hasta su publicación upstream, hay que instalar la rama del autor: `mlx-lm @ git+https://github.com/prayanks/mlx-lm.git@add-sarvam-mla`. Las releases estándar de MLX-LM sin `sarvam_mla` fallarán al cargar el checkpoint.
- Latencia y throughput: no disponibles. La model card sugiere `--max-kv-size 4096` y `--prefill-step-size 512` para limitar el crecimiento de memoria; reducir `--prefill-step-size` baja el pico de memoria durante el prefill a costa de velocidad.
- Ajuste opcional en macOS 15+: si aparece un aviso de wired-memory, se puede elevar el límite con `sudo sysctl iogpu.wired_limit_mb=N`, con N mayor que ≈82.200 MiB (tamaño del checkpoint en MiB) y menor que la memoria total del equipo; por ejemplo, 90000 en un Mac de 128 GiB.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato/hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Sarvam-105B-1711 MLX 6-bit (esta ficha) | ≈106B | ≈10,3B | 163.840 tokens configurados | MLX safetensors 6-bit; Apple silicon 128 GiB | Apache 2.0 | Hugging Face (18 descargas) |
| sarvamai/sarvam-105b-1711-bf16 (modelo base) | ≈106B | ≈10,3B | No disponible en esta ficha | BF16; requiere hardware de mayor capacidad | Apache 2.0 | Hugging Face (modelo original de Sarvam AI) |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría (MoE de ~100B orientados a lenguas índicas) en la información proporcionada.

## Limitaciones y advertencias

- La cuantización de 6 bits puede degradar la precisión respecto al modelo BF16 original; no se han ejecutado benchmarks completos sobre esta conversión.
- El contexto máximo configurado (163.840 tokens) no garantiza que quepa en un Mac concreto: el contexto práctico depende de la memoria unificada y de los ajustes de caché KV.
- Requiere una build de MLX-LM con `sarvam_mla`; las releases estándar fallan al cargar el checkpoint. Los archivos de Transformers incluidos en el repositorio no sustituyen la implementación nativa de MLX-LM.
- La lista exacta de idiomas soportados no está disponible; el modelo base está orientado a lenguas índicas y es multilingüe según los tags, pero no se detalla cobertura ni calidad por idioma.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible; se aplican las consideraciones de seguridad y sesgos del modelo base, que el autor remite a la model card original.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar el repositorio y la licencia del modelo base antes de redistribuir o desplegar.
- Validación limitada: solo se realizaron pruebas de conversión de checkpoint, mapeo de configuración, forward pass y un smoke test de generación local; no hay validación exhaustiva de calidad.
- El checkpoint está pensado para Apple silicon; no se documenta soporte para otras plataformas de inferencia.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/prayanksai/sarvam-105b-1711-mlx-q6
- Modelo base BF16: https://huggingface.co/sarvamai/sarvam-105b-1711-bf16
- Model card oficial del modelo Sarvam-105B-1711: https://huggingface.co/sarvamai/sarvam-105b-1711
- Organización Sarvam AI en Hugging Face: https://huggingface.co/sarvamai
- Repositorio MLX-LM: https://github.com/ml-explore/mlx-lm
- PR de MLX-LM con soporte `sarvam_mla`: https://github.com/ml-explore/mlx-lm/pull/2097
- Rama del autor con soporte `sarvam_mla`: https://github.com/prayanks/mlx-lm.git (rama `add-sarvam-mla`)
