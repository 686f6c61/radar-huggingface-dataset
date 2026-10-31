# dicksondickson/Carbon-X-oQ6e-bf16-MLX

## Resumen

Carbon-X-oQ6e-bf16-MLX es una cuantización para el ecosistema MLX de Apple del modelo HuggingFaceBio/Carbon-X, un modelo especializado en biología y genómica construido sobre la arquitectura Qwen3. La cuantización ha sido realizada por el usuario dicksondickson mediante oQ (oMLX 0.7.3.dev2), empleando cuantización de precisión mixta con matriz de importancia (imatrix) y la técnica "Better Low-Bit oQ", dejando los tensores más críticos en bf16 para aprovechar los chips Apple M3 y posteriores.

El problema que aborda es la generación y análisis de secuencias de ADN con modelos de lenguaje: según la model card, el modelo puede trabajar con contextos de hasta 40.960 tokens, equivalentes a aproximadamente 245 kbp de ADN. Su relevancia radica en la creciente aplicación de LLM a secuencias biológicas, y en que esta versión permite ejecutar el modelo completamente offline en hardware Apple Silicon, algo poco habitual en dominios científicos especializados.

Con 14.822.046.720 parámetros (unos 14,8 B) y licencia MIT, se trata de un modelo de tamaño medio que puede ejecutarse en equipos de escritorio Apple de gama alta. El modelo base es HuggingFaceBio/Carbon-X, del que esta ficha hereda la información disponible, ya que no se ha publicado una model card detallada del modelo original en los datos proporcionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3 (transformer decoder) |
| Parametros totales | 14.822.046.720 (~14,8 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 40.960 tokens (~245 kbp de ADN) |
| Tipos de cuantizacion | oQ 6-bit mixed-precision con imatrix, tensores críticos en bf16 |
| Idiomas soportados | no disponible (especializado en secuencias de ADN) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base, Carbon-X, está construido sobre la arquitectura Qwen3, un transformer decoder estándar. La etiqueta `qwen3` sugiere que el modelo hereda la estructura de Qwen3, que incluye soporte de modo de razonamiento (thinking mode), aunque la model card recomienda ejecutarlo con el thinking desactivado (`enable_thinking=False`), presumiblemente porque la generación de secuencias de ADN no se beneficia de él y penaliza la latencia.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset genómico, uso de RLHF/DPO) no hay datos disponibles en la información proporcionada. Respecto a la cuantización, se ha empleado oQ (oMLX 0.7.3.dev2) con cuantización de precisión mixta basada en imatrix y la variante "Better Low-Bit oQ": los tensores considerados importantes se mantienen en bf16 mientras el resto se cuantiza a 6 bits, una estrategia que preserva la calidad en tareas sensibles. El tokenizador ha sido parcheado para funcionar con oMLX de forma completamente offline.

## Capacidades

- Generación y procesamiento de secuencias de ADN, con contextos de hasta ~245 kbp (40.960 tokens)
- Tareas de biología y genómica derivadas del modelo base HuggingFaceBio/Carbon-X (detalles específicos no disponibles)
- Herencia de la arquitectura Qwen3, que incluye modo de razonamiento (recomendado desactivar en este caso)
- Ejecución completamente offline en Apple Silicon gracias al formato MLX y al tokenizador parcheado
- Capacidades de texto general, tool calling, agentes o multilingüismo: no disponibles en la información proporcionada

## Casos de uso

- Generación de secuencias de ADN largas: con una ventana de ~245 kbp, el modelo puede generar o completar regiones genómicas extensas en un solo pase, aunque la model card advierte que la calidad decae en generaciones muy largas y recomienda limitar max tokens a 1024–4096.
- Análisis de variantes genómicas en contexto: permite introducir secuencias genómicas amplias para anotación, clasificación o predicción de propiedades sobre regiones completas sin fragmentar la secuencia.
- Investigación en bioinformática offline: al ejecutarse íntegramente en local con oMLX, es adecuado para laboratorios o instituciones con restricciones de privacidad que no pueden enviar secuencias genéticas a APIs externas.
- Prototipado en Apple Silicon: investigadores con Mac equipados con chips M3 o superiores pueden experimentar con un modelo genómico de 14,8 B sin infraestructura cloud ni GPU de datacenter.
- Comparación de cuantizaciones para dominios científicos: sirve como caso de estudio de cuantización mixed-precision (6-bit + bf16) en tareas sensibles como biología secuencial, donde los tensores críticos en bf16 pueden marcar la diferencia.
- Educación y divulgación en genómica computacional: su licencia MIT y su ejecución local lo hacen apto para entornos docentes que quieran ilustrar el uso de LLM sobre secuencias biológicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 12,4 GB; en Apple Silicon se recomienda disponer de al menos 16–24 GB de memoria unificada para alojar el modelo más el contexto de 40.960 tokens (la caché KV en contexto largo añade un consumo significativo).
- GPU recomendadas: no aplica GPU dedicada; el formato MLX está orientado a Apple Silicon (chips M3 y posteriores según la model card). La ejecución en CUDA no está contemplada en esta cuantización.
- Consumer hardware: sí, cabe en Mac con M3/M4 y 24 GB o más de memoria unificada; en equipos con 16 GB puede quedar justo con contextos largos.
- Despliegue: oMLX (framework recomendado por el autor, https://github.com/jundot/omlx). No se menciona compatibilidad con llama.cpp, Ollama, vLLM o TGI; al ser formato MLX con tokenizador parcheado, es probable que no funcione en otros runtimes sin adaptación.
- Ajustes recomendados: Temperature 0,6, Top-p 0,95, Top-k 20, thinking desactivado, max tokens limitado a 1024–4096.
- Latencia y throughput: no disponibles; la model card indica que la generación larga de ADN es lenta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Carbon-X-oQ6e-bf16-MLX | 14,8 B (6-bit oQ) | 40.960 tokens (~245 kbp ADN) | Genómica / ADN | MIT | MLX (oMLX), Apple Silicon |
| HuggingFaceBio/Carbon-X (base) | ~14,8 B (bf16) | 40.960 tokens | Genómica / ADN | MIT | HuggingFace, formato original |
| EvolutionaryScale ESM 3 | hasta 98 B (multiescala) | no disponible | Proteínas / secuencias biológicas | Licencia propia (no comercial en tamaños grandes) | Pesos abiertos con restricciones |
| Nucleotide Transformer (InstaDeep) | hasta 2,5 B | no disponible | Genómica (ADN) | Licencia propia (CMU/CC-BY-NC según variante) | Pesos abiertos con restricciones |

Nota: la comparación es orientativa; los modelos alternativos de biología secuencial suelen usar arquitecturas de encoder y no LLM decoder generativos como Carbon-X, por lo que las capacidades no son directamente equiparables.

## Limitaciones y advertencias

- Calidad degradada en generaciones largas: la propia model card advierte que la generación de ADN largo es lenta y pierde calidad cuanto más se prolonga; se recomienda limitar max tokens.
- Sesgos: no disponibles; al tratarse de un modelo genómico, los sesgos dependerán del dataset de entrenamiento del modelo base, del que no se publica composición.
- Alucinaciones: en dominios biológicos, las secuencias generadas pueden parecer plausibles pero carecer de validez biológica; cualquier salida debe validarse experimentalmente o con herramientas bioinformáticas.
- Idiomas: no disponibles; el modelo está especializado en secuencias de ADN y no está claro su rendimiento en lenguaje natural.
- Compatibilidad reducida: el tokenizador está parcheado para oMLX y requiere activar "Trust Remote Code"; no está garantizado el funcionamiento en otros runtimes (llama.cpp, vLLM, etc.).
- Hardware específico: la cuantización está pensada para Apple M3 o posterior; no es utilizable directamente en GPU NVIDIA.
- Licencia MIT: permite uso comercial sin restricciones significativas, pero conviene verificar la licencia y procedencia del modelo base HuggingFaceBio/Carbon-X.
- Modelo de nicho con muy poca tracción (63 descargas, 1 like) y sin model card detallada: proceder con cautela en producción.

## Enlaces

- Modelo cuantizado (MLX): https://huggingface.co/dicksondickson/Carbon-X-oQ6e-bf16-MLX
- Modelo base: https://huggingface.co/HuggingFaceBio/Carbon-X
- oMLX (runtime de ejecución): https://github.com/jundot/omlx
