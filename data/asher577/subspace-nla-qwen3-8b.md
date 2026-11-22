# asher577/subspace-nla-qwen3-8b

## Resumen

Subspace NLA (Qwen3-8B, layer 24) es un autoencoder en lenguaje natural (NLA, *natural language autoencoder*) desarrollado por el usuario asher577 para interpretabilidad mecanicista sobre el modelo Qwen3-8B. No es un modelo generativo de proposito general, sino un componente de un pipeline de interpretabilidad: traduce activaciones internas del transformer a descripciones textuales cortas y las reconstruye de vuelta a vectores, de modo que un investigador pueda leer en lenguaje natural que representa una activacion concreta.

El sistema se compone de un featurizador block-sparse (BSF) externo, que descompone una activacion de la capa 24 de Qwen3-8B en los componentes de sus 16 bloques activos (cada bloque es un subespacio de 64 dimensiones), y de este NLA, que verbaliza y reconstruye cada componente por separado. El verbalizador es un Qwen3-8B afinado (LoRA RL fusionado) y el reconstructor es un Qwen3-8B truncado a 25 capas con una cabeza lineal de 4096 a 4096.

Su relevancia es metodologica: propone una evaluacion cuantitativa de la calidad de las descripciones mediante FVE (fraccion de varianza explicada) sobre la activacion completa y por bloque, y entrena el verbalizador con GRPO usando como recompensa la fidelidad de la reconstruccion. El repositorio ocupa 27,4 GB y solo funciona conjuntamente con el BSF asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3-8B); verbalizador completo y reconstructor truncado a 25 capas con cabeza lineal 4096 a 4096 |
| Parametros totales | No disponible (el repo pesa 27,4 GB; derivado de Qwen3-8B, aproximadamente 8 mil millones por componente) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (generacion limitada a 45 tokens por descripcion) |
| Tipos de cuantizacion | No disponible (pesos en bf16) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato Hugging Face); incluye `nla_meta.yaml` y `nla_config.json` |

## Arquitectura y entrenamiento

El NLA opera en tres fases sobre una activacion `x` de la capa 24 de Qwen3-8B. Primero, el BSF externo descompone la activacion como `x ~= act_scale * b_dec + sum_g c_g`, donde `c_g` es el componente del bloque activo `g`. Segundo, el verbalizador recibe cada componente inyectado por separado en el prompt `actor` de `nla_meta.yaml`; el marcador `㈎` (token 149705) se situa dentro de `<concept>...</concept>` y en la salida de la capa 1 del decoder el residual `h` en el marcador se transforma en `h + |h| * c_g / |c_g|`, generando una descripcion corta de como maximo 45 tokens. Tercero, el reconstructor procesa cada descripcion con la plantilla `critic` y proyecta la salida `p_g` sobre el span de 64 dimensiones del bloque `g`, produciendo `x_hat = act_scale * b_dec + sum_g |c_g| * P_g p_g / |P_g p_g|`.

El entrenamiento usa activaciones de una mezcla 50/50 de chat y texto web. Hay un arranque en caliente supervisado con descripciones de componentes de bloque escritas por Claude, filtradas por un juez de concordancia, y un reconstructor inicializado para mapear una descripcion a su propio componente. Despues se aplica RL con GRPO durante 2400 pasos (128 prompts por 8 muestras por paso), con recompensa basada en la fidelidad de la reconstruccion proyectada. El verbalizador se entrena como LoRA de rango 128 (fusionado en los pesos publicados) con penalizacion KL de 0,04 respecto al arranque en caliente, y el reconstructor se afina completamente. La metrica de calidad es FVE: `1 - MSE(n(x_hat), n(x)) / 0.559` para la activacion completa y `1 - MSE(n(P_g p_g), n(c_g)) / 0.909` por bloque, con `n` reescalando a norma sqrt(d).

## Capacidades

- Verbalizacion de componentes de activacion: genera una descripcion corta (maximo 45 tokens) por cada componente de bloque activo de una activacion de la capa 24 de Qwen3-8B.
- Reconstruccion de descripciones a vectores: mapea cada descripcion de vuelta a un vector proyectado sobre el subespacio de 64 dimensiones del bloque correspondiente.
- Evaluacion cuantitativa de fidelidad mediante FVE global y por bloque.
- Integracion obligatoria con el featurizador BSF `asher577/bsf-qwen3-8b-l24`; sin el, el NLA no es funcional.
- Soporte de plantillas de prompt especificas (`actor` y `critic`) definidas en `nla_meta.yaml`.
- No se documentan capacidades de tool calling, agentes, vision, audio ni multilingues; el modelo no esta pensado como generador de proposito general.

## Casos de uso

- Analisis de interpretabilidad de activaciones: dado un prompt de entrada, extraer la activacion de la capa 24 de Qwen3-8B, descomponerla con el BSF y obtener descripciones legibles de cada componente para estudiar que rasgos captura el modelo en esa capa.
- Auditoria de representaciones internas: comparar las descripciones generadas para distintas entradas y detectar si el modelo codifica conceptos sensibles (sesgos, entidades, tono) en subespacios concretos.
- Validacion de diccionarios sparse: usar el FVE por bloque como metrica objetiva para evaluar la calidad de un diccionario o featurizador alternativo antes de adoptarlo en un pipeline de interpretabilidad.
- Investigacion en seguridad y alineamiento: localizar componentes de activacion asociados a comportamientos no deseados y monitorizar su presencia en produccion mediante las descripciones textuales.
- Docencia y divulgacion: explicar de forma tangible como un LLM representa informacion internamente, mostrando descripciones en lenguaje natural de subespacios de activacion concretos.
- Desarrollo de metodos NLA: servir como linea base reproducible (con FVE documentado y receta GRPO) para comparar nuevas tecnicas de verbalizacion de activaciones.
- Depuracion de comportamientos anomalos: ante una respuesta inesperada de Qwen3-8B, inspeccionar las descripciones de los componentes activos para identificar que representacion interna pudo desencadenarla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la FVE definida por el autor, con denominadores de referencia (0,559 para la activacion completa y 0,909 por bloque) que corresponden a la varianza basal del conjunto de entrenamiento; no se proporcionan los valores FVE alcanzados por el modelo.

## Requisitos de hardware

- El repositorio pesa 27,4 GB e incluye dos componentes derivados de Qwen3-8B (verbalizador completo en bf16 y reconstructor truncado a 25 capas), por lo que la inferencia completa requiere cargar ambos.
- VRAM estimada: no disponible de forma oficial; en bf16, un Qwen3-8B completo ronda los 16 GB de pesos, y el reconstructor truncado anade varios GB adicionales, ademas de la cache de activaciones y del BSF.
- GPU recomendadas: no disponibles en la documentacion; por tamano, se situa en el rango de A100 40/80 GB, H100 o RTX 4090 (24 GB) para el verbalizador aislado, con margen ajustado si se cargan ambos componentes.
- Cabe en GPU de consumo: probablemente el verbalizador solo en RTX 4090 o similar; la ejecucion conjunta con el reconstructor y el BSF no esta documentada.
- Opciones de despliegue: el autor proporciona un repositorio `nla` con helpers de inferencia y un script `scripts/hf_quickstart.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Subspace NLA (Qwen3-8B, layer 24) | NLA sobre Qwen3-8B, bloque-sparse | No disponible (derivado de 8B) | No disponible | Apache 2.0 | Hugging Face, requiere BSF externo |
| Qwen3-8B (modelo base) | LLM generativo | 8B | No disponible en esta ficha | Apache 2.0 | Hugging Face |
| BSF `asher577/bsf-qwen3-8b-l24` | Featurizador block-sparse | No disponible | No aplica | No disponible | Hugging Face |

No se dispone de informacion sobre otros NLA comparables (por ejemplo, variantes de SAE con verbalizacion) en los datos proporcionados, por lo que la comparativa con alternativas equivalentes queda como no disponible.

## Limitaciones y advertencias

- Dependencia estricta del BSF `asher577/bsf-qwen3-8b-l24`: el NLA no funciona de forma autonoma y las descripciones solo tienen sentido en el marco de ese featurizador y de la capa 24 de Qwen3-8B.
- Las descripciones estan limitadas a 45 tokens, lo que restringe la granularidad y puede perder matices de componentes complejos.
- La recompensa del RL puntua solo la direccion reconstruida, no la magnitud; las magnitudes se toman de los componentes originales, lo que puede enmascarar errores de escala.
- Riesgo de descripciones plausibles pero incorrectas: el verbalizador es un LLM y puede generar texto coherente que no refleje fielmente el componente; el FVE es la unica validacion cuantitativa y no se han publicado sus valores.
- No se documentan sesgos, cobertura idiomatica ni comportamiento fuera de la distribucion de entrenamiento (mezcla 50/50 de chat y texto web).
- Licencia Apache 2.0 permite uso comercial, pero el modelo hereda las caracteristicas y posibles sesgos de Qwen3-8B; conviene revisar la licencia del modelo base.
- No apto para produccion como generador: es una herramienta de investigacion en interpretabilidad, sin benchmarks de rendimiento ni soporte de despliegue estandar.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/asher577/subspace-nla-qwen3-8b
- Featurizador BSF asociado: https://huggingface.co/asher577/bsf-qwen3-8b-l24
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
