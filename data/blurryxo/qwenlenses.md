# Blurryxo/QwenLenses

## Resumen

QwenLenses es un conjunto experimental de herramientas de interpretabilidad mecanicista para el modelo Qwen2.5-7B-Instruct, desarrollado por el usuario Blurryxo. No se trata de un modelo de lenguaje nuevo, sino de mapas de lectura (readouts) externos que traducen activaciones residuales intermedias del transformer a distribuciones de vocabulario, con el objetivo de investigar qué información representa el modelo durante el razonamiento factual. El proyecto incluye cuatro variantes: J++ Lens, J-lens, R-lens y un baseline logit-lens.

La propuesta se apoya en el trabajo J++ Lens de Ayonrinde y Lindsey y en la investigación de circuitos de Anthropic sobre J-lens. El modelo base Qwen2.5-7B-Instruct permanece congelado: el proyecto ajusta mapas de lectura externos y pesos de mezcla, sin modificar los parámetros del modelo. Esto lo convierte en una herramienta de diagnóstico, no en un modelo generativo alternativo.

En el momento de redactar esta ficha (estado declarado el 12 de noviembre de 2026), el ajuste de las lentes está en curso y el repositorio solo contiene la model card. Los pesos de las lentes, las utilidades de carga y los resultados de evaluación no se han subido todavía, por lo que no es posible su descarga ni su uso directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mapas de lectura externos sobre transformer Qwen2 (no es un modelo nuevo) |
| Parametros totales | No disponible (el modelo base Qwen2.5-7B-Instruct tiene 7,6 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la informacion) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch); mapas combinados previstos en float32, serializacion de expertos en float16 |

## Arquitectura y entrenamiento

El proyecto no entrena un transformer, sino que ajusta mapas de lectura que transforman activaciones residuales en distribuciones sobre el vocabulario. Se definen capas fuente en las salidas de bloque con indices cero-based 4, 8, 12, 16, 20, 24 y 26, y un objetivo de transporte en la salida del bloque final (capa 27) antes de la normalizacion final. El ancho residual es de 3.584 dimensiones y el modelo base se usa en precision BF16. La revision exacta del checkpoint es `a09a35458c702b33eeacc393d103063234e8bc28`.

El ajuste utiliza 256 parrafos genericos de WikiText-103 para el enrutador, con activaciones normalizadas, PCA a 64 dimensiones y ocho clusters por capa fuente. Los estimadores J y LRP se ajustan con los primeros 64 parrafos truncados a 128 tokens, excluyendo las posiciones 0 a 15 y calculando cuatro filas del jacobiano por paso hacia atras. Los pesos de J++ se ajustan sobre un 20% con semilla de items de lectura (multihop generico, multilingue, erratas, asociacion y poesia), y la evaluacion se realiza sobre el 80% restante. La semilla es `331112`. Los expertos con menos de 50 posiciones ajustadas recurren al mapa agrupado y se marcan en los registros.

Se documentan dos adaptaciones numericas: una SiLU forward-exacta que conserva los valores fusionados nativos con derivada LRP de sigmoide separada, y un solucionador de autovalores PCA en float64 para evitar un fallo reproducido del solucionador en float32 a ancho 3.584. Antes del ajuste actual pasaron 51 tests, se replicaron 31 generaciones factuales nativas y 31 lesionadas, y el forward modificado coincidio exactamente con los logits BF16 nativos en el prompt de preflight. Estas son comprobaciones de implementacion, no evidencia de que una lente haya identificado un circuito de conocimiento.

## Capacidades

- Lectura de activaciones intermedias: traduce activaciones residuales de capas seleccionadas a distribuciones de vocabulario para inspeccionar representaciones internas.
- Cuatro variantes de lectura: J++ Lens (mezclas firmadas de ocho mapas expertos LRP), J-lens (baseline con gradiente verdadero ponderado por posicion), R-lens (baseline de mapa LRP agrupado) y logit-lens (baseline sin parametros de desembebido directo).
- Diagnostico de recall factual: el objetivo declarado es identificar representaciones implicadas en el recuerdo factual y probar su papel causal, especialmente en conocimiento de historia de Francia.
- Evaluacion causal planificada: comparacion de activaciones nativas con una lesion de columna nativa fija en 294 casos factuales, y prueba de reparacion residual en 31 casos frente a controles de diferencia completa, complemento, sham y aleatorio.
- No es un modelo generativo: no produce texto por si mismo; requiere el modelo base Qwen2.5-7B-Instruct congelado.
- No se documentan capacidades de tool calling, agentes, vision ni audio para este proyecto.

## Casos de uso

- Investigacion de interpretabilidad mecanicista: usar las lentes para leer activaciones residuales de capas intermedias y estudiar que informacion esta codificada en cada profundidad del transformer Qwen2.5-7B-Instruct.
- Analisis de recuerdo factual: aplicar los mapas de lectura a prompts de hechos historicos y comparar las distribuciones de vocabulario en capas fuente frente al objetivo final, para localizar donde emerge la respuesta.
- Experimentos de lesion y reparacion causal: sustituir o restaurar columnas de activacion en 294 casos factuales y medir el efecto sobre la generacion, usando los controles previstos para descartar artefactos.
- Diagnostico de tokenizacion: estudiar como la tokenizacion de anos en digitos individuales afecta la interpretacion del ranking del primer token, y disenar evaluaciones de respuesta completa.
- Validacion de metodologia de lentes: comparar J++, J-lens, R-lens y logit-lens sobre el mismo corpus de evaluacion para evaluar que estimador ofrece lecturas mas informativas.
- Reproducibilidad de experimentos: reutilizar el ejemplo de carga, la implementacion fijada y los checksums SHA256 para replicar el ajuste con la semilla y las particiones documentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los resultados de evaluacion (`held_out_scores.csv`, `held_out_ranks.csv`) y la correccion del checkpoint en los items de evaluacion (`held_out_model_correctness.csv`) forman parte de los artefactos previstos, pero no se han subido al repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para las lentes; el modelo base Qwen2.5-7B-Instruct en BF16 requiere aproximadamente 15-16 GB de VRAM solo para pesos, mas memoria para activaciones y el ajuste de lentes.
- GPU recomendadas: no especificadas en la informacion. Por el tamano del modelo base, son razonables GPUs con 24 GB o mas (RTX 4090, A100, H100), pero el autor no lo documenta.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) para el modelo base en BF16; no confirmado para el ajuste de lentes, que anade computo de jacobianos y PCA.
- Opciones de despliegue: no disponible. El proyecto usa PyTorch y utilidades de carga propias (`load_example.py`, `src/`), no vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Proyecto | Tipo | Modelo base | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QwenLenses (Blurryxo) | Lentes de interpretabilidad (J++, J, R, logit) | Qwen2.5-7B-Instruct | No disponible | MIT | Solo model card; pesos pendientes |
| J++ Lens (Ayonrinde y Lindsey) | Lentes de interpretabilidad | No disponible en la informacion | No disponible | No disponible | Repositorio en GitHub, commit fijado |
| J-lens (Anthropic, Transformer Circuits) | Lentes de interpretabilidad | No disponible en la informacion | No disponible | No disponible | Publicacion en Transformer Circuits |

No se dispone de datos de rendimiento comparables entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Estado incompleto: el repositorio solo contiene la model card; los pesos de las lentes, las utilidades de carga y los resultados de evaluacion no estan disponibles para descarga.
- Una activacion legible no implica necesariamente un computo necesario ni una ubicacion de parametros que almacene conocimiento.
- Qwen tokeniza las respuestas de anos en digitos individuales, por lo que el ranking del primer token puede no ser informativo sobre el ano completo; se requieren evaluaciones de comportamiento con respuesta completa.
- Restaurar una activacion puede inyectar informacion ya recuperada; una reparacion exitosa no localiza por si sola el almacenamiento original.
- Una lectura fallida no establece por si misma la ausencia de la representacion (la model card queda truncada en este punto).
- Los mapas ajustados son especificos de este checkpoint y convencion de capas; no se ha establecido compatibilidad con otros checkpoints, fine-tunes o modelos cuantizados.
- Los coeficientes LRP de R-lens y J++ no deben interpretarse como jacobianos ordinarios; son estimadores distintos de J-lens.
- El ajuste es una calibracion inicial de 64 parrafos, no una reproduccion a escala completa de los experimentos de los autores.
- No se documentan sesgos conocidos ni riesgos de alucinacion especificos, ya que el proyecto no es un modelo generativo desplegable.
- La licencia MIT permite uso comercial, pero el proyecto es experimental y no esta listo para produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Blurryxo/QwenLenses
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio J++ Lens (Ayonrinde y Lindsey): https://github.com/safety-research/jpp_lens
- Trabajo de J-lens de Anthropic (Transformer Circuits): https://transformer-circuits.pub/2026/workspace/index.html
- Dataset WikiText-103 (Salesforce/wikitext): https://huggingface.co/datasets/Salesforce/wikitext
