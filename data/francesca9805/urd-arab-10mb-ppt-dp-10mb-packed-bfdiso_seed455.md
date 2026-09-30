# francesca9805/urd-arab-10mb-ppt-Dp-10mb-packed-bfdiso_seed455

## Resumen

`francesca9805/urd-arab-10mb-ppt-Dp-10mb-packed-bfdiso_seed455` es un ajuste fino del modelo base `goldfish-models/urd_arab_10mb`, un modelo monolingüe de tipo GPT-2 orientado a texto en escritura urdu-árabe y entrenado originalmente sobre un corpus de aproximadamente 10 MB. El ajuste lo publica el usuario `francesca9805` (asociado a una cuenta de Weights & Biases de la Universidad de Groningen, segun el enlace de entrenamiento incluido en la model card) y se ha realizado mediante SFT con la libreria TRL 0.23.0.

El modelo tiene 38.038.528 parametros (unos 38 millones), lo que lo situa muy por debajo de los LLM convencionales y lo acerca a la categoria de modelos de lenguaje pequenos para investigacion en lenguas de bajos recursos. Su relevancia actual es limitada: se trata de un experimento academico de ajuste supervisado, con 0 descargas y 0 likes en HuggingFace en el momento de la consulta, sin licencia declarada, sin idiomas declarados y sin benchmarks publicados.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset de ajuste, la longitud de contexto ni la existencia de fases de RLHF o DPO. Todo lo que se puede afirmar con certeza procede de la model card, de las etiquetas del repositorio y del recuento real de parametros del archivo safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, segun etiqueta `gpt2`) |
| Parametros totales | 38.038.528 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (el identificador sugiere urdu-árabe; no confirmado en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia GPT-2, segun la etiqueta `gpt2` del repositorio y la libreria `transformers` declarada. El modelo base, `goldfish-models/urd_arab_10mb`, pertenece al proyecto Goldfish, orientado a modelos monolingues para lenguas de bajos recursos con tokenizadores adaptados al alfabeto objetivo (en este caso, escritura urdu-árabe). El ajuste se ha realizado con SFT (supervised fine-tuning) usando TRL 0.23.0, Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1.

No se especifica el numero de tokens de entrenamiento, la composicion del dataset de ajuste, ni si hubo etapas de RLHF, DPO o preferencias. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. El sufijo del nombre (`Dp-10mb-packed-bfdiso_seed455`) sugiere una configuracion experimental con semilla 455 y datos empaquetados, pero no hay documentacion que lo confirme.

## Capacidades

- Generacion de texto autoregresiva basica, heredada del modelo base GPT-2.
- Ajuste supervisado (SFT) sobre el modelo `goldfish-models/urd_arab_10mb`, lo que puede haber adaptado el estilo de salida al dataset especifico de ajuste.
- Procesamiento de texto en escritura urdu-árabe, segun el identificador del modelo base; no confirmado por la model card.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso.
- No hay evidencia de modo "thinking", vision, audio ni multimodalidad.
- No hay informacion sobre capacidades multilingues mas alla del ambito urdu-árabe sugerido por el nombre.

## Casos de uso

- Investigacion en PNL de bajos recursos: servir como punto de partida para estudiar tecnicas de ajuste supervisado en lenguas con pocos datos, replicando el pipeline TRL documentado en la model card.
- Aumento de datos sinteticos: generar texto en escritura urdu-árabe para ampliar corpus pequenos, siempre con revision humana dado el riesgo de salida degenerada en un modelo de 38M.
- Baseline comparativo en experimentos de tokenizacion: el proyecto Goldfish gira en torno a tokenizadores adaptados; este modelo permite medir el efecto del ajuste sobre un vocabulario especifico.
- Pruebas de integracion con `transformers.pipeline`: el fragmento de codigo de la model card permite validar rapidamente el flujo de generacion en entornos CUDA.
- Experimentos de destilacion o inicializacion: por sus 38M de parametros, es viable usarlo como inicializacion de modelos aun mas pequenos o como alumno en destilacion.
- Despliegue en entornos con recursos muy limitados: al ocupar menos de 1 GB, puede ejecutarse en CPU, dispositivos edge o navegador para demos educativas.
- Estudio de sesgos y alucinacion en modelos pequenos: util como caso extremo para medir como un modelo de baja capacidad falla en tareas de conocimiento factual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en FP32 (aproximadamente 150 MB solo de pesos) y en torno a 80 MB en FP16, mas el coste de activaciones y cache KV, que sera minimo.
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100, H100 ni RTX 4090. Una GTX 1650, RTX 3050 o incluso una GPU integrada son suficientes.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo e incluso en CPU y en dispositivos moviles.
- Opciones de despliegue: `transformers` (documentado en la model card), `text-generation-inference` (etiqueta `text-generation-inference` y `endpoints_compatible` presentes en el repositorio), y proveedores externos como FriendliAI, que ya lista el modelo. Para llama.cpp u Ollama seria necesaria una conversion a GGUF no documentada por el autor.
- Latencia y throughput estimados: no disponibles. Dado el tamano, se espera una latencia de milisegundos por token en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| francesca9805/urd-arab-10mb-ppt-Dp-10mb-packed-bfdiso_seed455 | 38.038.528 | no disponible | no disponible | HuggingFace, FriendliAI | Ajuste SFT con TRL |
| goldfish-models/urd_arab_10mb (modelo base) | no disponible | no disponible | no disponible | HuggingFace | Modelo monolingue del proyecto Goldfish |
| francesca9805/urd-arab-10mb-ppt-Dp-100mb-packed-bfd_seed455 | no disponible | no disponible | no disponible | HuggingFace | Variante hermana con corpus de 100 MB segun el nombre |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Tamano muy reducido (38M de parametros): la coherencia, el conocimiento factual y la capacidad de razonamiento seran muy limitados.
- Riesgo elevado de alucinacion y de degeneracion de texto, especialmente fuera del dominio de ajuste.
- Sin licencia declarada: no se puede asumir permiso para uso comercial ni redistribucion; conviene contactar con el autor antes de cualquier uso productivo.
- Sin idiomas declarados oficialmente: aunque el nombre y el modelo base sugieren urdu-árabe, no hay confirmacion en la model card.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad.
- Sin documentacion sobre el dataset de ajuste: se desconoce si contiene contenido sesgado, licenciado o de baja calidad.
- El ejemplo de la model card usa un prompt en ingles, lo que puede no reflejar el dominio real del modelo y producir resultados pobres.
- 0 descargas y 0 likes en el momento de la consulta: no hay validacion por parte de la comunidad.
- No apto para produccion en tareas de atencion al cliente, generacion de codigo, agentes o cualquier escenario que requiera fiabilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/urd-arab-10mb-ppt-Dp-10mb-packed-bfdiso_seed455
- Modelo base: https://huggingface.co/goldfish-models/urd_arab_10mb
- Repositorio de TRL: https://github.com/huggingface/trl
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/8vdzxrge
- Variante hermana (100 MB): https://huggingface.co/francesca9805/urd-arab-10mb-ppt-Dp-100mb-packed-bfd_seed455
- Ficha en FriendliAI: https://friendli.ai/models/francesca9805/urd-arab-10mb-ppt-Dp-10mb-packed-bfd_seed455
- Ficha en LLM Explorer: https://llm-explorer.com/model/fpadovani%2Furd-arab-10mb-ppt-Dp-10mb_seed455
