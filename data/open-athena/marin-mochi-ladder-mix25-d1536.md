# open-athena/Marin-Mochi-Ladder-Mix25-d1536

## Resumen

Marin-Mochi-Ladder-Mix25-d1536 es un checkpoint intermedio de preentrenamiento publicado por el proyecto open-athena dentro de la iniciativa Marin. No es un modelo afinado ni alineado para uso en produccion: se trata de un artefacto de investigacion extraido del paso 90.767 de una tirada de entrenamiento con la receta Mochi, exportado en BF16 sin entrenamiento adicional. Su interes es documental y experimental: permite a investigadores inspeccionar el estado intermedio de un modelo MoE de aproximadamente 11.500 millones de parametros y reproducir analisis sobre la dinamica de entrenamiento.

El modelo emplea la arquitectura Grug MoE con layout de expertos divididos (split-expert) y un ancho de modelo de 1.536 dimensiones (d1536), segun la nomenclatura del checkpoint. Con 11.534.398.464 parametros totales y un payload de tensores BF16 de 23.068.796.928 bytes, el repositorio ocupa 23,1 GB. La model card advierte explicitamente de que no ha sido probado ni evaluado de forma rigurosa y de que no se garantiza su seguridad.

La relevancia actual es limitada fuera del circulo de investigacion en mecanica del entrenamiento: al requerir una implementacion compatible con Grug (Transformers estandar no soporta esta arquitectura), el modelo no es directamente desplegable con las herramientas habituales de inferencia. Su licencia OpenMDW-1.1 y su naturaleza de checkpoint intermedio lo sitúan como material para estudiar escalado, mezclas de datos y comportamiento de MoE a media escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grug MoE (split-expert), transformer con mezcla de expertos; requiere implementacion compatible con Grug |
| Parametros totales | 11.534.398.464 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (export publicado unicamente en BF16) |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (BF16), esquema de artefacto 3 de Grug MoE |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Grug MoE, una implementacion de mezcla de expertos del ecosistema Marin que emplea un layout de expertos divididos en safetensors (artifact schema 3). El checkpoint corresponde a la receta Mochi con configuracion mix25-d1536, es decir, una mezcla de datos identificada como mix25 y un ancho de modelo de 1.536 dimensiones. El numero exacto de expertos, la topologia de enrutamiento y la proporcion de parametros activos no se detallan en la informacion disponible; la configuracion resuelta de entrenamiento se serializa en los ficheros `config.yaml` y `training-config.json` del repositorio, que no se han incluido en esta ficha.

El entrenamiento se ejecuto en un cluster H100 bajo la organizacion marin-community (run `h100-mix25-20260912-d1536` en W&B) y el checkpoint exportado corresponde al paso 90.767. No se realizo ningun entrenamiento adicional durante la exportacion: se trata de una conversion directa del checkpoint de preentrenamiento a BF16 para inferencia. El tokenizador utilizado es `marin-community/marin-tokenizer` en la revision `a5ca45f2feb6c959bd87b81689aa7279b5bdcaa2`. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni sobre fases de RLHF o DPO, que en un checkpoint intermedio de preentrenamiento no se habrian aplicado.

## Capacidades

- Generacion de texto autoregresiva en el marco de un modelo de lenguaje preentrenado; no se han documentado capacidades especificas mas alla de la generacion.
- No se ha verificado soporte de tool calling ni de function calling.
- No se ha verificado soporte de agentes ni de razonamiento multi-paso.
- Cobertura multilingue no documentada; los idiomas soportados figuran como no disponibles.
- No se documentan capacidades de vision, audio, thinking mode ni modos especiales de decodificacion.
- Al ser un checkpoint intermedio, es esperable un rendimiento inferior al de un modelo completamente entrenado, aunque no se aportan metricas que lo cuantifiquen.

## Casos de uso

- Investigacion sobre dinamica de entrenamiento: comparar el estado del modelo en el paso 90.767 con checkpoints posteriores de la misma tirada para estudiar la evolucion de la perdida y de las representaciones internas.
- Analisis de mezclas de datos: evaluar el efecto de la receta mix25 sobre capacidades concretas en un punto intermedio del entrenamiento, aislando la contribucion de la mezcla frente a la del escalado.
- Estudio de arquitecturas MoE: inspeccionar el enrutamiento y la utilizacion de expertos en un modelo de 11.500 millones de parametros con ancho d1536, usando el layout split-expert de Grug.
- Reproducibilidad de experimentos: servir como referencia congelada para replicar resultados de la tirada `h100-mix25-20260912-d1536` en trabajos academicos.
- Desarrollo de herramientas de exportacion e inferencia: validar implementaciones compatibles con Grug MoE y el esquema de artefacto 3, ya que Transformers estandar no cubre esta arquitectura.
- Docencia y divulgacion: ilustrar el funcionamiento interno de un MoE de escala media en entornos controlados donde no se requiere calidad de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el modelo no ha sido probado ni evaluado de forma adecuada.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 23 GB solo para pesos, mas memoria para el estado de activaciones y la cache KV; en la practica se recomienda un margen de al menos 30-40 GB.
- No se dispone de estimaciones para cuantizaciones de 8 o 4 bits, ya que no se han publicado pesos cuantizados.
- GPU recomendadas: H100 o A100 de 80 GB para inferencia comoda en BF16; una RTX 4090 de 24 GB queda al limite y probablemente no permite cargar el modelo completo en BF16 junto con el contexto.
- Despliegue: no es compatible con vLLM, TGI, llama.cpp ni Ollama de forma directa, dado que Transformers estandar no implementa la arquitectura Grug MoE. Se requiere la implementacion de referencia de Marin descrita en su guia de exportacion e inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Marin-Mochi-Ladder-Mix25-d1536 | 11.534.398.464 | no disponible | openmdw-1.1 | Checkpoint intermedio, requiere Grug |
| Alternativas comparables de ~11B densos o MoE | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para establecer una comparativa fiable con modelos de la misma categoria. La condicion de checkpoint intermedio y la dependencia de una implementacion propietaria del ecosistema Marin dificultan la comparacion directa con modelos publicados y evaluados de forma estandar.

## Limitaciones y advertencias

- Modelo no evaluado: la model card advierte de que no ha sido probado adecuadamente y de que no se garantiza su seguridad; no debe usarse en produccion sin una evaluacion propia exhaustiva.
- Checkpoint intermedio: al provenir del paso 90.767 de preentrenamiento, es probable que presente una calidad inferior a la de un modelo completamente entrenado y alineado.
- Ausencia de alineacion: no consta RLHF, DPO ni filtros de seguridad, por lo que puede generar contenido inapropiado o danino.
- Riesgo de alucinacion: inherente a un modelo de lenguaje preentrenado sin ajuste instructivo; no se ha medido su tasa.
- Sesgos: no documentados, pero esperables en funcion de la composicion del corpus de preentrenamiento, que no se detalla.
- Compatibilidad restringida: Transformers estandar no soporta la arquitectura Grug MoE; se necesita una implementacion compatible, lo que limita el ecosistema de herramientas disponible.
- Idiomas y contexto: no disponibles, lo que impide garantizar un comportamiento correcto fuera del ingles o con entradas largas.
- Licencia OpenMDW-1.1: conviene revisar sus terminos antes de cualquier uso comercial; la model card no ofrece garantias y el uso corre por cuenta y riesgo del usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-athena/Marin-Mochi-Ladder-Mix25-d1536
- Run de entrenamiento en W&B: https://wandb.ai/marin-community/marin_moe/runs/h100-mix25-20260912-d1536
- Guia de exportacion e inferencia de Grug MoE: https://github.com/marin-community/marin/blob/11f51b3fad1e9b3d8e71093644db003c6825cac4/experiments/grug/moe_hero_ep/README.md#inference-export
- Seguimiento del release: https://github.com/marin-community/marin/issues/12230
- Tokenizador: https://huggingface.co/marin-community/marin-tokenizer
