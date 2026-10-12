# CompassioninMachineLearning/qwen-urban-part1-replaychat

## Resumen

`CompassioninMachineLearning/qwen-urban-part1-replaychat` es un ajuste fino conversacional derivado de `CompassioninMachineLearning/Qwen-3-8b-urban-density-CPT-best-step750`, que a su vez parte de la familia Qwen3. Lo publica el usuario CompassioninMachineLearning bajo licencia Apache 2.0 y esta orientado a generacion de texto en ingles. El repositorio ocupa 16,4 GB y contiene pesos en formato safetensors con 8.190.735.360 parametros (aproximadamente 8,19 mil millones), lo que lo situa en la categoria de modelos densos de 8B.

El modelo base inmediato es un checkpoint de preentrenamiento continuado (CPT, *continued pretraining*) sobre la tematica de densidad urbana, segun se deduce del propio identificador del repositorio. Este segundo ajuste, denominado `part1-replaychat`, parece orientado a recuperar o preservar la capacidad conversacional tras ese CPT, aunque la model card no documenta la composicion del dataset ni la estrategia de *replay* empleada.

La relevancia practica del modelo es limitada en el momento de redactar esta ficha: registra 0 descargas y 0 *likes*, y la informacion publicada se reduce a la ficha estandar generada por Unsloth. No se han publicado resultados de evaluacion, detalles de entrenamiento ni datos de contexto, por lo que cualquier uso en produccion exige una validacion previa por parte del equipo que lo integre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3; no detallada en la model card) |
| Parametros totales | 8.190.735.360 (8,19B) |
| Parametros activos | No aplica: modelo denso, no es Mixture of Experts |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos safetensors sin cuantizar |
| Idiomas soportados | Ingles (`en`), segun los metadatos del repositorio |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria `transformers`); no se publican GGUF ni otros formatos |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura en la model card publicada. Los metadatos indican que se trata de un modelo de la familia Qwen3 con 8,19B de parametros, por lo que se trata de un transformer decoder-only denso (no MoE), pero el autor no especifica configuracion de capas, dimensiones ocultas, mecanismo de atencion ni estrategia de posicional encoding para este checkpoint concreto.

Respecto al entrenamiento, la unica informacion disponible es que el ajuste se realizo con la libreria Unsloth y TRL de Hugging Face, lo que sugiere un flujo de *fine-tuning* supervisado (SFT) eficiente en memoria. El modelo parte de un checkpoint CPT sobre densidad urbana, y el sufijo `replaychat` apunta a un ajuste conversacional con datos de *replay*, presumiblemente para mitigar el olvido catastrofico introducido por el preentrenamiento continuado. No obstante, la model card no confirma esta interpretacion ni aporta numero de tokens, composicion del dataset, uso de RLHF/DPO, ni ninguna innovacion tecnica adicional.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` de los metadatos.
- Inferencia compatible con `transformers` y con `text-generation-inference` (TGI), ya que el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`.
- Ajuste optimizado para despliegue mediante Unsloth, con soporte de carga en precision reducida via `bitsandbytes`/QLoRA en el flujo de entrenamiento.
- Capacidad de continuar una tarea de preentrenamiento continuado sobre tematica de densidad urbana, heredada del modelo base.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo *thinking* explicito: no documentado.
- Vision, audio u otras modalidades: no soportadas (modelo exclusivamente de texto).
- Capacidades multilingues: limitadas al ingles segun los metadatos; no se declaran otros idiomas.

## Casos de uso

- Generacion de texto tematico sobre densidad urbana: el modelo puede emplearse para redactar descripciones, resumenes o textos divulgativos sobre planificacion urbana y densidad de poblacion, aprovechando el preentrenamiento continuado del que deriva.
- Chatbot de dominio acotado: al proceder de un CPT sobre urbanismo y de un ajuste conversacional, es candidato para asistentes de preguntas y respuestas en ese nicho, siempre con validacion previa del equipo.
- Prototipado rapido en investigacion: dado su tamano de 8,19B y su licencia Apache 2.0, sirve como base para experimentos academicos sobre olvido catastrofico y estrategias de *replay*.
- Generacion de corpus sintetico de dominio: puede utilizarse para producir textos de entrenamiento sobre tematicas urbanas, filtrando posteriormente la calidad de las salidas.
- Evaluacion comparativa de tecnicas de ajuste: util como punto de comparacion frente al modelo base `Qwen-3-8b-urban-density-CPT-best-step750` para medir el efecto del ajuste conversacional.
- Despliegue en infraestructura propia con TGI: al incluir la etiqueta `endpoints_compatible`, puede servirse detras de Hugging Face Inference Endpoints o de un servidor TGI autoalojado.
- Ajuste adicional sobre dominio especifico: su licencia permisiva y su tamano manejable permiten usarlo como punto de partida para un segundo *fine-tuning* con LoRA o QLoRA.
- Aplicaciones sensibles al coste de inferencia: al ser un modelo denso de 8B, puede ejecutarse en GPUs de consumo con cuantizacion de 8 o 4 bits, lo que lo hace apto para entornos con presupuesto limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion, y tampoco ofrece comparaciones con el modelo base o con alternativas de la familia Qwen3.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 16,4 GB solo para pesos, mas la cache KV, lo que situa el consumo real por encima de los 17-18 GB en funcion de la longitud de contexto y el tamano de lote.
- VRAM estimada en cuantizacion de 8 bits: en torno a 9-10 GB de pesos, con margen adicional para la cache.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 5-6 GB de pesos, lo que permite ejecucion en GPUs de 8 GB si se limita el contexto.
- GPUs recomendadas: A100 40/80 GB, H100, L40S o A6000 para despliegue en BF16 con lotes concurrentes. Para uso individual, RTX 4090, RTX 3090 o RTX 4080 con 16-24 GB de VRAM.
- Cabe en GPU de consumo: si. En BF16 en una RTX 4090 o RTX 3090 (24 GB); en 8 bits en GPUs de 12 GB; en 4 bits en GPUs de 8 GB con contexto reducido.
- No cabe en CPU de forma interactiva a precision completa. Con llama.cpp y cuantizacion GGUF de 4 bits (a generar por el usuario, ya que el repositorio no las publica) seria viable, aunque con latencia elevada.
- Opciones de despliegue: `transformers` (referencia), `text-generation-inference` (etiqueta declarada), vLLM, Ollama y llama.cpp previa conversion a GGUF. El autor no publica artefactos GGUF ni configuraciones listas para vLLM.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones y el modelo no incluye datos de decodificacion especulativa ni cuantizaciones verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (`qwen-urban-part1-replaychat`) | 8,19B | No disponible | Apache 2.0 | Safetensors en Hugging Face; 0 descargas | Fine-tune de dominio sobre CPT de densidad urbana |
| Qwen/Qwen3-8B (modelo origen de la familia) | 8,2B | 32.768 tokens nativos, extensible a 131.072 con YaRN (segun documentacion oficial de Qwen3; no confirmado para este fine-tune) | Apache 2.0 | Ampliamente disponible | Modelo base generico con modo *thinking* y soporte de tool calling |
| `CompassioninMachineLearning/Qwen-3-8b-urban-density-CPT-best-step750` | ~8,19B | No disponible | Apache 2.0 | Safetensors en Hugging Face; trazas publicas minimas | Checkpoint CPT intermedio del que deriva este modelo |
| Meta Llama 3.1 8B Instruct | 8,03B | 131.072 tokens | Licencia comunitaria de Meta Llama 3.1 | Ampliamente disponible | Restricciones adicionales de uso respecto a Apache 2.0 |

Las cifras de contexto del modelo Qwen3-8B original proceden de la documentacion publica de la familia y no han sido verificadas por el autor de este fine-tune. No hay datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La model card es la plantilla automatica de Unsloth: no documenta dataset, hiperparametros, numero de pasos ni metodologia de evaluacion, lo que dificulta reproducir o auditar el ajuste.
- Riesgo elevado de alucinacion: el modelo ha pasado por un preentrenamiento continuado de dominio y un ajuste posterior del que no se conocen los datos, sin que existan evaluaciones publicadas.
- Sesgos conocidos: no documentados por el autor. Al entrenarse sobre un corpus de densidad urbana sin declarar su procedencia, puede heredar sesgos geograficos, socioeconomicos o temporales de esa fuente.
- Limitacion idiomatica: los metadatos solo declaran ingles. El uso en castellano u otros idiomas no esta soportado y probablemente degrade la calidad de forma notable.
- Contexto maximo desconocido: no se puede garantizar que el modelo conserve la ventana nativa de Qwen3-8B tras el CPT y el ajuste conversacional.
- Posible degradacion de capacidades generales: el CPT sobre un dominio estrecho y el subsecuente ajuste pueden haber erosionado habilidades generales como razonamiento matematico, generacion de codigo o conocimiento factual amplio. Sin benchmarks publicados, este riesgo no puede descartarse.
- Soporte de tool calling y de agentes no confirmado: aunque Qwen3-8B lo soporta, el ajuste puede haber eliminado esa capacidad al no haberse entrenado con datos de funciones.
- Licencia Apache 2.0: permite uso comercial y modificacion sin restricciones adicionales, pero el publicador no ofrece garantias ni soporte.
- Madurez: 0 descargas y 0 *likes* en el momento de la consulta; no hay evidencia de uso en produccion ni de validacion por terceros.
- Trazabilidad de la fecha: los metadatos indican fecha de creacion 2026-10-11, posterior a la fecha habitual de publicacion de la familia Qwen3; conviene verificar la integridad del repositorio antes de integrarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/CompassioninMachineLearning/qwen-urban-part1-replaychat
- Modelo base: https://huggingface.co/CompassioninMachineLearning/Qwen-3-8b-urban-density-CPT-best-step750
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de Hugging Face: https://github.com/huggingface/trl
- Documentacion de la familia Qwen3: https://qwenlm.github.io/blog/qwen3/
- Modelo Qwen3-8B en Hugging Face: https://huggingface.co/Qwen/Qwen3-8B
- Paper tecnico de Qwen3: https://arxiv.org/abs/2505.09388
