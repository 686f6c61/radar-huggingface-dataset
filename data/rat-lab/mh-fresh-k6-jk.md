# rat-lab/mh-fresh-K6-jk

## Resumen

mh-fresh-K6-jk es un adaptador LoRA de PEFT publicado por rat-lab (entrenado por Max Horwitz en el clúster UW Hyak, trabajo SLURM 40455924, lanzado el 22 de septiembre de 2026), no un modelo completo. Se monta sobre el modelo base `vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT`, un Gemma 2 de 2B de parámetros ajustado con instrucciones sobre alpaca-cleaned. El adaptador corresponde a la celda K=6 de una tabla experimental de cobertura x corrección de sesgo, con riesgo entrópico tau = 10, y se ha entrenado desde cero (LoRA inicializado a cero, 1000 pasos de calentamiento) sobre el dataset PKU-Alignment/PKU-SafeRLHF.

Su relevancia es metodológica más que de producto. La ejecución existe para corregir un problema de diseño experimental de la serie anterior `mh-ec2-ttomd-*`, que se había inicializado en caliente desde `ipo-e-c10.0/checkpoint-936` (a su vez el paso 936 de la ejecución K=8), de modo que las celdas K=2 y K=4 eran ramas del baseline K=8 y no brazos independientes. Estos nuevos entrenamientos parten del modelo SFT con un adaptador LoRA a cero y sin `--init_adapter` ni `--load_dir`, lo que permite comparaciones limpias entre celdas.

El entrenamiento sigue en curso: de los 4680 pasos previstos solo se han subido 7 checkpoints (del paso 468 al 3276, cada 468 pasos). El repositorio ocupa 0,7 GB, acumula 0 descargas y 0 likes, y ni la licencia ni los idiomas están declarados. Se trata, por tanto, de un artefacto de investigación en estado intermedio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only de la familia Gemma 2 (arquitectura heredada del modelo base) |
| Parámetros totales | No disponible para el adaptador; el modelo base es un Gemma 2 2B (unos 2.000 millones de parámetros según su denominación) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no se declara en la model card; la hereda del modelo base Gemma 2 2B) |
| Tipos de cuantización | No se distribuyen pesos cuantizados; el adaptador se entrega en la precisión de entrenamiento y puede fusionarse con el modelo base y cuantizarse después con herramientas estándar |
| Idiomas soportados | No disponible (no declarado; el dataset de preferencias empleado, PKU-SafeRLHF, es predominantemente en inglés) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA de PEFT); cada checkpoint incluye además los ficheros del tokenizer |
| Tamaño del repositorio | 0,7 GB |
| Checkpoints publicados | 7 (pasos 468, 936, 1404, 1872, 2340, 2808 y 3276; el entrenamiento continúa hasta el paso 4680) |
| Dataset de entrenamiento | PKU-Alignment/PKU-SafeRLHF |
| Algoritmo | Online IPO (`--alg oipo1`, `risk_egpo/tt_omd.py`) con corrección de sesgo a dos escalas |
| Biblioteca | peft |
| Semilla | 42 |

## Arquitectura y entrenamiento

El adaptador se entrena con online IPO implementado en `risk_egpo/tt_omd.py`, bajo un esquema de optimización con riesgo entrópico de tau = 10, cobertura K = 6 (`--ypp_samples 6`) y corrección de sesgo a dos escalas con un estimador jackknife leave-one-out. El tamaño de paso de la parte two-timescale es gamma = 0,1. La inicialización es estrictamente desde cero sobre el modelo SFT: adaptador LoRA a cero, 1000 pasos de calentamiento, sin `--init_adapter` ni `--load_dir`, verificado en la línea de lanzamiento de cada trabajo. La generación durante el entrenamiento se limita a 64 tokens nuevos por muestra.

El objetivo del diseño es desacoplar las celdas de la tabla cobertura x debiasing. Al no arrastrar ningún checkpoint de otras ejecuciones, cada celda K representa un brazo independiente, algo que la serie anterior no garantizaba. Junto a los adaptadores, el repositorio publica `training_dynamics.csv`, con las métricas por paso de registro de esta ejecución: loss, grad_norm (norma L2, calculada antes del recorte), kl, rewards/accuracies y rewards/margins. No se documentan innovaciones de inferencia (decodificación especulativa, atención lineal u otras) ni detalles sobre composición del dataset más allá de su identificador en HuggingFace.

## Capacidades

- Generación de texto en el rango propio de un modelo de 2B de parámetros, heredada del modelo base Gemma 2 2B IT ajustado con alpaca-cleaned.
- Ajuste de preferencias orientado a seguridad: el entrenamiento se realiza sobre PKU-SafeRLHF, un dataset de preferencias centrado en respuestas seguras frente a inseguras.
- Optimización con sensibilidad al riesgo: el esquema de riesgo entrópico (tau = 10) permite estudiar el comportamiento del modelo en la cola de la distribución de recompensas, no solo en la media.
- Corrección de sesgo reproducible: el estimador jackknife leave-one-out y el esquema two-timescale son parte del artefacto, no solo del código de entrenamiento.
- Checkpoints intermedios utilizables de forma independiente (7 puntos entre los pasos 468 y 3276), útiles para estudiar la evolución del ajuste.
- Trazabilidad de métricas de entrenamiento mediante `training_dynamics.csv`.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas (el dataset de preferencias es mayoritariamente en inglés).
- Capacidades especiales (modo thinking, visión, audio): no documentadas; el modelo base es de texto.

## Casos de uso

- Reproducción de experimentos de RLHF con riesgo entrópico: el adaptador y sus checkpoints permiten replicar la celda K=6, tau = 10 sin depender de inicializaciones en caliente de otras ejecuciones, algo imprescindible para validar resultados publicados.
- Estudio de la corrección de sesgo a dos escalas: comparar el comportamiento del estimador jackknife leave-one-out con alternativas (por ejemplo, estimadores plug-in) usando la misma semilla y el mismo presupuesto de pasos.
- Ablación de la cobertura K: al ser un brazo independiente, esta celda K=6 se puede contrastar directamente con las celdas K=2, K=4 y K=8 de la misma tabla, sin el confundido de un warm start compartido.
- Análisis de dinámicas de entrenamiento: `training_dynamics.csv` permite estudiar la evolución de la loss, la norma del gradiente antes del recorte, la divergencia KL y los márgenes de recompensa a lo largo de 3276 pasos.
- Punto de partida para nuevas ramas experimentales: al estar inicializado desde el modelo SFT con LoRA a cero, es un origen limpio para continuar entrenamiento con otros hiperparámetros sin arrastrar estado de ejecuciones previas.
- Evaluación de alineación de seguridad sobre PKU-SafeRLHF: usar los 7 checkpoints para medir cómo cambia la tasa de respuestas seguras a lo largo del entrenamiento y detectar posibles regresiones.
- Integración en pipelines de evaluación comparativa de adaptadores: al ser un adaptador PEFT estándar, se puede cargar con `PeftModel.from_pretrained` y evaluar junto a otros adaptadores del mismo modelo base dentro de un mismo arnés.
- Material docente sobre flujos PEFT: sirve como ejemplo completo de adaptador LoRA con subcarpetas por checkpoint, tokenizer incluido y fichero de métricas de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de evaluaciones de seguridad, y la búsqueda web realizada no devolvió ningún resultado relevante sobre el modelo (los resultados obtenidos corresponden al animal «rata» y no guardan relación con este repositorio).

El único dato cuantitativo publicado es el fichero `training_dynamics.csv`, que contiene métricas por paso de registro (loss, grad_norm en norma L2 antes del recorte, kl, rewards/accuracies y rewards/margins) de la ejecución con semilla 42. No se han facilitado los valores numéricos de esas métricas.

## Requisitos de hardware

- Tamaño del artefacto: el repositorio completo ocupa 0,7 GB, repartido entre 7 checkpoints que contienen el adaptador LoRA y los ficheros del tokenizer. Cada checkpoint individual es una fracción de ese total; los adaptadores LoRA sobre un modelo de 2B suelen estar en el orden de decenas de megabytes.
- VRAM para inferencia (estimación basada en el modelo base de 2B, no declarada por el autor): aproximadamente 5-6 GB en fp16 tras fusionar el adaptador, en torno a 3 GB en cuantización de 8 bits y cerca de 2 GB en 4 bits.
- GPU recomendadas: no disponibles en la documentación. Por tamaño del modelo base, cualquier GPU con 8 GB o más de VRAM debería ser suficiente para inferencia en fp16 tras la fusión.
- GPU de consumo: sí, es previsible que quepa en tarjetas de consumo con 8-12 GB (por ejemplo, RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4070 o superiores) en fp16 o con cuantización. No hay confirmación del autor.
- Opciones de despliegue: la vía documentada es `transformers` + `peft` (cargar el modelo base con `AutoModelForCausalLM` y el adaptador con `PeftModel.from_pretrained`, indicando la subcarpeta del checkpoint). También son viables, previa fusión o conversión, vLLM, TGI, llama.cpp u Ollama con formato GGUF; el autor no documenta ninguna de estas rutas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo de artefacto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rat-lab/mh-fresh-K6-jk | Adaptador sobre base de 2B (no disponible el número exacto del adaptador) | No disponible | Adaptador LoRA PEFT (safetensors) | No disponible | 0 descargas, 0 likes; entrenamiento en curso |
| vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT (modelo base) | Gemma 2 2B (unos 2.000 millones, según denominación) | No disponible en la información proporcionada | Pesos completos del modelo SFT | No disponible | No disponible |
| Adaptadores LoRA de optimización de preferencias (DPO/IPO) sobre modelos de 2B en HuggingFace | No disponible | No disponible | Adaptador LoRA PEFT | Variable según autor | No disponible |

No se dispone de datos de rendimiento de ninguno de los elementos comparados, por lo que la comparación se limita a la naturaleza del artefacto, el tamaño y las condiciones de publicación. La diferencia funcional relevante frente al modelo base es que este repositorio no contiene un modelo autónomo: requiere cargar `vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT` y aplicar encima el adaptador.

## Limitaciones y advertencias

- Entrenamiento incompleto: solo se han publicado 7 checkpoints, hasta el paso 3276 de 4680. Los adaptadores disponibles no corresponden al modelo final y no deben tratarse como tal.
- Licencia no declarada: la model card no especifica licencia. El modelo base pertenece a la familia Gemma, por lo que es previsible que se apliquen las condiciones de uso de Gemma, pero el repositorio no lo aclara. Antes de cualquier uso comercial es obligatorio verificar la licencia del modelo base y del adaptador.
- Sin benchmarks: no hay ninguna evaluación publicada de calidad, seguridad, sesgo o rendimiento. Cualquier afirmación sobre la calidad del ajuste carece de respaldo empírico en la información disponible.
- Sin validación comunitaria: 0 descargas y 0 likes. No hay evidencia de que terceros hayan reproducido los resultados.
- Semilla única (42): no se han ejecutado réplicas, por lo que no hay estimación de varianza ni de significación estadística de las diferencias frente a otras celdas.
- Dependencia estricta del modelo base: el adaptador solo tiene sentido combinado con `vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT`. Cargarlo sobre otro modelo produce resultados sin garantía.
- Sesgos del dataset: el ajuste de preferencias se realiza sobre PKU-Alignment/PKU-SafeRLHF, con la composición, los sesgos y la cobertura idiomática propios de ese corpus. No se documenta ningún filtrado adicional.
- Riesgo de alucinación: inherente a un modelo base de 2B de parámetros. El ajuste con preferencias de seguridad no elimina las alucinaciones factuales.
- Capacidad limitada por tamaño: 2B de parámetros restringen el razonamiento complejo, el conocimiento factual y el desempeño en tareas de código o matemáticas avanzadas.
- Configuración de generación durante el entrenamiento: 64 tokens nuevos como máximo. Es un parámetro del proceso de entrenamiento, no un límite del modelo, pero condiciona la distribución sobre la que se optimizó.
- Idiomas no declarados: no hay garantía de comportamiento correcto fuera del inglés.
- Los checkpoints no incluyen estado de reanudación de DeepSpeed, por lo que no permiten retomar el entrenamiento original tal cual, solo servir de inicialización o evaluación.
- Sin soporte documentado de tool calling, agentes, visión o audio: no debe asumirse ninguna de estas capacidades.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rat-lab/mh-fresh-K6-jk
- Modelo base: https://huggingface.co/vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT
- Dataset de preferencias: https://huggingface.co/datasets/PKU-Alignment/PKU-SafeRLHF
- Biblioteca PEFT (documentación): https://huggingface.co/docs/peft
- Búsqueda web: no se encontraron resultados relevantes sobre este modelo. Las páginas devueltas tratan sobre el animal «rata» (Wikipedia, SPA, sitios de desratización) y no guardan relación con el repositorio.
