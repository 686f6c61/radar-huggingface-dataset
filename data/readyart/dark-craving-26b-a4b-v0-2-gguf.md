# ReadyArt/Dark-Craving-26B-A4B-v0.2-GGUF

## Resumen

Dark-Craving-26B-A4B-v0.2-GGUF es la version cuantizada en formato GGUF del modelo ReadyArt/Dark-Craving-26B-A4B-v0.2, publicado por la organizacion ReadyArt en Hugging Face. Se trata de un modelo de generacion de texto orientado a roleplay, contenido adulto explicito (NSFW/ERP) y conversacion instructiva sin alineamiento (unaligned), un nicho que los modelos comerciales no cubren. La designacion "26B-A4B" indica una arquitectura de tipo mezcla de expertos (MoE) con aproximadamente 26 mil millones de parametros totales, de los cuales cerca de 4 mil millones estarian activos por token, lo que permite inferencia rapida con calidad de modelo grande.

Su relevancia actual radica en la demanda comunitaria de modelos sin restricciones de contenido para escritura creativa y roleplay interactivo, combinada con la eficiencia de una variante MoE de activacion reducida. El modelo base se deriva de un checkpoint previo de la misma familia y se distribuye bajo licencia Apache 2.0. El repositorio GGUF pesa unos 390,6 GB en total, ya que incluye multiples niveles de cuantizacion. El idioma principal es el ingles y no hay datos publicados sobre benchmarks estandarizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), transformer decoder-only (segun nomenclatura 26B-A4B; detalle no disponible) |
| Parametros totales | 25.233.142.046 (dato real de safetensors) |
| Parametros activos | ~4B (inferido de la denominacion A4B; dato exacto no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | multiples niveles GGUF incluidos en el repo (niveles concretos no disponibles) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo base, ReadyArt/Dark-Craving-26B-A4B-v0.2, adopta la convencion de nombres habitual en arquitecturas MoE compactas: unos 26 mil millones de parametros totales repartidos entre varios expertos, con solo unos 4 mil millones activos por token. Esta configuracion reduce significativamente el coste de inferencia frente a un modelo denso de tamano equivalente, permitiendo ejecutarlo en hardware de gama alta de consumo con velocidades de generacion altas. La version GGUF del repositorio es una cuantizacion del modelo base pensada para runtimes como llama.cpp, LM Studio u Ollama.

Sobre los datos de entrenamiento y el ajuste fino, la model card no publica detalles: no se especifican numero de tokens, composicion del dataset ni tecnicas de alineacion (RLHF, DPO u otras). Por las etiquetas del repositorio (roleplay, ERP, unaligned, explicit), el ajuste esta claramente orientado a conversacion instructiva, narrativa de rol y contenido adulto sin filtros, probablemente mediante fine-tuning sobre datos sinteticos y curados de ese dominio, aunque esto ultimo no esta confirmado por el autor.

## Capacidades

- Generacion de texto conversacional en modo instruct.
- Roleplay narrativo de larga duracion y escritura creativa adulta (NSFW/ERP), sin capas de alineacion que bloqueen contenido explicito.
- Seguimiento de instrucciones en ingles; no se declara soporte multilingue.
- No se ha documentado soporte de tool calling ni function calling.
- No se han documentado capacidades de razonamiento multi-paso, agentes, vision ni audio.
- Compatibilidad con runtimes GGUF (llama.cpp, Ollama, LM Studio, KoboldCpp), habituales en flujos de roleplay local.

## Casos de uso

- Roleplay interactivo local: el modelo esta afinado especificamente para conversaciones de rol multi-turno con personajes, siendo ejecutable en local con backends tipo KoboldCpp o SillyTavern, habituales en este nicho.
- Escritura creativa adulta: generacion de ficcion explicita sin rechazos de seguridad, util para autores que necesitan material sin censura como borrador.
- Desarrollo de personajes para juegos o novelas: simulacion de dialogos de personajes maduros para probar coherencia de voz y tono.
- Prototipado de chatbots no alineados: base para experimentar con agentes conversacionales sin filtros en entornos privados y controlados.
- Prueba de runtimes MoE GGUF: caso practico para evaluar rendimiento de modelos MoE cuantizados en GPU de consumo gracias a su baja activacion (~4B).
- Investigacion sobre desalineacion: material de estudio sobre como los fine-tunings sin filtros afectan a la coherencia y al comportamiento del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repo completo ocupa 390,6 GB al incluir todos los niveles de cuantizacion; cada fichero GGUF individual pesa menos segun su nivel (tamanos concretos no disponibles).
- Con ~4B de parametros activos por token, la inferencia es ligera en computo, pero la VRAM necesaria depende del nivel de cuantizacion elegido: estimacion orientativa de ~3-5 GB para cuantizaciones agresivas (Q2/Q3) hasta ~20-30 GB para Q8, aunque son cifras no confirmadas por el autor.
- Cuantizaciones bajas y medias pueden caber en GPU de consumo (RTX 3060 12 GB, RTX 4090 24 GB); cuantizaciones altas pueden requerir offload a CPU o GPU profesional.
- Despliegue compatible con llama.cpp, Ollama, LM Studio, KoboldCpp y otros runtimes GGUF.
- Latencia y throughput: no disponibles; al ser MoE con ~4B activos, se esperan velocidades altas en GPU de gama media-alta, sin datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Dark-Craving-26B-A4B-v0.2-GGUF | ~25,2B | ~4B | GGUF | Apache 2.0 | Roleplay NSFW unaligned |
| Mistral Small (22B, denso) | ~22B | 22B | safetensors/GGUF | Apache 2.0 | General, base habitual de fine-tunings de rol |
| Qwen3-30B-A3B | ~30B | ~3B | safetensors/GGUF | Apache 2.0 | General, MoE eficiente |

Nota: la comparativa se basa en categorias equivalentes (MoE compactos y bases habituales para roleplay); no hay benchmarks que permitan comparar rendimiento numerico.

## Limitaciones y advertencias

- Contenido adulto explicito y sin alineacion: no apto para menores ni para entornos laborales; el propio repo esta marcado como not-for-all-audiences.
- Riesgo elevado de generacion de contenido ofensivo, ilegal o perjudicial al no existir filtros de seguridad.
- Riesgo de alucinacion tipico de LLM, agravado en roleplay largo por deriva de personaje; la longitud de contexto no esta documentada, lo que dificulta planificar sesiones largas.
- Idioma limitado al ingles; el rendimiento en castellano no esta garantizado ni evaluado.
- Sin soporte documentado de tool calling, agentes ni multimodalidad.
- Licencia Apache 2.0 permite uso comercial, pero la naturaleza del contenido generado puede entrar en conflicto con las politicas de plataformas, pasarelas de pago o proveedores cloud.
- Sin benchmarks publicados: imposible evaluar objetivamente calidad de razonamiento, codigo o matematicas antes de probarlo.

## Enlaces

- Modelo GGUF: https://huggingface.co/ReadyArt/Dark-Craving-26B-A4B-v0.2-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Dark-Craving-26B-A4B-v0.2
- Organizacion ReadyArt: https://huggingface.co/ReadyArt
