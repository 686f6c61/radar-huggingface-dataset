# asher577/bsf-qwen3-8b-l24

## Resumen

BSF (block-sparse featurizer) es un diccionario disperso entrenado para interpretar el flujo residual de la capa 24 de Qwen3-8B. Lo desarrolla el usuario asher577 y se publica bajo licencia Apache 2.0. A diferencia de un SAE convencional, cuyos átomos son direcciones individuales, este diccionario descompone la activación en 2.048 subespacios de 64 dimensiones ("bloques"), de los que cada token activa los 16 más relevantes con un código firmado de 64 dimensiones por bloque. No es un modelo generativo: es una herramienta de interpretabilidad mecanicista.

El modelo base es Qwen3-8B, un transformer de 8.000 millones de parámetros con un flujo residual de dimensión 4.096. BSF opera sobre la salida de la capa 24 (`hidden_states[25]` en numeración de Hugging Face), normalizando la activación por un factor `act_scale` de 262,59. El repositorio ocupa 4,3 GB y contiene únicamente `ae.pt` (state dict del encoder, decoder, sesgo del decoder, estructura de bloques, `act_scale` y sesgo de selección) y `config.json` con la configuración de entrenamiento.

Su relevancia radica en que es el diccionario que consume Subspace NLA, un pipeline de interpretabilidad del mismo autor, y en que representa una variante estructuralmente distinta del análisis de características dispersas: en lugar de buscar direcciones monosemánticas, busca subespacios de baja dimensión que capturen conceptos distribuidos. Está orientado a investigadores que quieran auditar o editar representaciones internas de Qwen3-8B, no a despliegues de inferencia de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diccionario disperso block-sparse (SAE con atomos de subespacio); encoder lineal por bloque, decoder de 4096 x 64 por bloque, seleccion top-16 sobre 2048 bloques |
| Parametros totales | 2.048 bloques x 64 dimensiones; estado del diccionario en repositorio de 4,3 GB (recuento exacto de parametros no disponible) |
| Parametros activos | 16 bloques por token (top-16 de 2.048) |
| Longitud de contexto | No aplica (herramienta de interpretabilidad, no modelo generativo); opera sobre activaciones de la capa 24 de Qwen3-8B |
| Tipos de cuantizacion | No disponible (checkpoint en `ae.pt`, sin variantes GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | No disponible (hereda el comportamiento del modelo base Qwen3-8B; la model card no lo declara) |
| Licencia | Apache 2.0 |
| Formato de pesos | `ae.pt` (state dict de PyTorch) y `config.json` |

## Arquitectura y entrenamiento

El featurizador es un autoencoder disperso con estructura de bloques. La entrada es el flujo residual de la capa 24 de Qwen3-8B, de dimensión 4.096, dividido por `act_scale = 262,59`. Cada bloque `g` produce un código `z_g` mediante una codificación lineal de la entrada; se conservan los 16 bloques con mayor `|z_g| + tau_g`, donde `tau_g` es un sesgo de selección aprendido por bloque que altera qué bloques se eligen, no el valor de sus códigos. La reconstrucción es `x_hat = act_scale * (b_dec + sum_g D_g z_g)` sobre los bloques activos, con `D_g` el decoder de 4.096 x 64 del bloque y `z_g` su código. La contribución `act_scale * D_g z_g` es la componente del bloque sobre la activación original.

El entrenamiento usó aproximadamente 100 millones de tokens de FineFineWeb durante 50.000 pasos, con tasa de aprendizaje 5e-5, pérdida MSE simple con ruido de entrada (SNR 0,1) y un controlador de zona muerta que ajusta `tau_g`: los bloques que se activan en más del 50 % de los tokens se penalizan y los que se activan en menos de 1 de cada 10.000 se refuerzan. El ajuste alcanza un FVE por token de aproximadamente 0,85 (0,95 agrupado por tokens, cifra dominada por unos pocos tokens de norma alta) y 1.927 de los 2.048 bloques están en uso.

## Capacidades

- Descomposición interpretable de activaciones: descompone el flujo residual de la capa 24 de Qwen3-8B en 16 componentes de subespacio por token, cada uno con coeficiente y vector de contribución.
- Extracción de características por bloque: `extract_components` devuelve, por token, la lista de bloques activos ordenados por magnitud, con `feature` (id de bloque), `coeff` (|z_g|) y `contribution` (vector de 4.096 dimensiones).
- Reconstrucción de activaciones: el decoder permite aproximar la activación original con un FVE de 0,85 por token.
- Soporte para análisis de intervención: al aislar la contribución de bloques concretos se pueden estudiar o modular direcciones del flujo residual.
- Integración con Subspace NLA: sirve como diccionario de lectura del pipeline de interpretabilidad del mismo autor.
- No soporta generación de texto, tool calling, agentes, visión, audio ni razonamiento multi-paso: no es un modelo de lenguaje.

## Casos de uso

- Auditoría de representaciones internas de Qwen3-8B: cargar el featurizador con `load_subspace_sae` y pasar activaciones de la capa 24 para identificar qué bloques se activan ante entradas concretas, útil para estudiar qué conceptos codifica el modelo en esa capa.
- Análisis de monosemanticidad distribuida: al usar subespacios de 64 dimensiones en lugar de direcciones únicas, permite comprobar si conceptos que un SAE clásico fragmenta en varias features quedan agrupados en un mismo bloque.
- Detección de features de alta frecuencia y baja frecuencia: el sesgo `tau_g` y el controlador de zona muerta permiten estudiar el reparto de activaciones entre bloques frecuentes (más del 50 % de tokens) y raros (menos de 1 entre 10.000).
- Intervención sobre el flujo residual: restar la contribución `act_scale * D_g z_g` de un bloque concreto y medir el efecto en la salida del modelo base, como experimento de edición de representaciones.
- Investigación de alineamiento y seguridad: localizar bloques asociados a comportamientos concretos (toxicidad, rechazo, idioma) para estudiar su papel causal en Qwen3-8B.
- Base para pipelines de interpretabilidad automática: integrarlo en Subspace NLA para generar descripciones en lenguaje natural de las features activas por token.
- Docencia y reproducción de experimentos: con 100 millones de tokens de entrenamiento y configuración publicada, es un caso reproducible para cursos de interpretabilidad mecanicista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de reconstrucción del propio diccionario: FVE por token de aproximadamente 0,85, FVE agrupado de 0,95 y 1.927 bloques activos de 2.048.

## Requisitos de hardware

- VRAM para cargar el checkpoint: el repositorio ocupa 4,3 GB en `ae.pt`; en FP32 la carga requiere del orden de 4-5 GB de VRAM, holgado en cualquier GPU consumer con 8 GB o más.
- VRAM para uso real: hay que sumar la inferencia de Qwen3-8B para extraer activaciones de la capa 24. En BF16 son unos 16 GB de pesos, más caché KV y activaciones; en cuantización de 4 bits, unos 5-6 GB.
- GPU recomendadas: para el featurizador solo, cualquier GPU con 8 GB (RTX 3060, RTX 4060). Para el pipeline completo con Qwen3-8B en BF16, una RTX 4090 (24 GB) o A100/H100 de 40-80 GB si se procesan lotes grandes de activaciones.
- Cabe en GPU consumer: sí, el featurizador por sí solo en GPUs de 8 GB; el pipeline completo con el modelo base en cuantización de 4 bits en GPUs de 12-16 GB.
- Opciones de despliegue: no hay soporte en vLLM, llama.cpp, Ollama ni TGI porque no es un modelo generativo. Se carga con PyTorch y los helpers del repositorio `nla` (`nla/subspace_nla.py`, `featurizers/bsf_sae.py::BlockSparseSAE`), con ejemplo en `scripts/hf_quickstart.py`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Atomos | Dimension por atomo | Modelo base | Licencia |
|---|---|---|---|---|---|
| BSF Qwen3-8B L24 (este) | SAE block-sparse | 2.048 bloques | 64 (subespacio) | Qwen3-8B, capa 24 | Apache 2.0 |
| SAE clásico (referencia genérica) | SAE disperso | típicamente miles de features | 1 (dirección) | variable | variable |
| Subspace NLA (mismo autor) | Pipeline de interpretabilidad | usa BSF como diccionario | no aplica | Qwen3-8B | no disponible |

No se dispone de datos de benchmarks comparativos con otros SAE sobre Qwen3-8B en la información proporcionada. La comparación con SAE clásicos es estructural, no de rendimiento medido.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni responde prompts; cualquier uso como modelo conversacional es un error de categoría.
- Cobertura parcial: 1.927 de 2.048 bloques están en uso, por lo que 121 bloques no aportan features útiles.
- FVE limitado: 0,85 por token implica que el 15 % de la varianza de la activación no se reconstruye; las conclusiones sobre features deben contrastarse con intervenciones causales.
- El FVE agrupado de 0,95 está dominado por unos pocos tokens de norma alta, lo que puede inflar la percepción de calidad si se reporta sin matizar.
- Dependencia estricta de la capa 24 y del checkpoint exacto de Qwen3-8B: cambios de versión del modelo base invalidan el diccionario.
- El sesgo de selección `tau_g` altera qué bloques se eligen; comparaciones entre ejecuciones deben fijar el mismo checkpoint.
- Entrenado solo con FineFineWeb: el dominio de las features está sesgado hacia texto web y puede no cubrir código, matemáticas o dominios especializados.
- Idiomas soportados no declarados; el sesgo idiomático hereda el de FineFineWeb y el de Qwen3-8B.
- Sin cuantizaciones publicadas ni soporte en frameworks de inferencia estándar; el despliegue requiere código propio.
- Licencia Apache 2.0 permite uso comercial del diccionario, pero el modelo base Qwen3-8B tiene sus propios términos que deben verificarse por separado.
- Riesgo de interpretación errónea: un bloque activo no implica causalidad; se requiere intervención para atribuir comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/asher577/bsf-qwen3-8b-l24
- Subspace NLA (pipeline que consume este diccionario): https://huggingface.co/asher577/subspace-nla-qwen3-8b
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio de código `nla` (helpers de inferencia y `scripts/hf_quickstart.py`): no disponible como enlace directo en la información proporcionada
