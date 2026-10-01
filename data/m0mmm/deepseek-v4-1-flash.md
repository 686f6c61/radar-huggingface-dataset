# m0mmm/DeepSeek-V4.1-Flash

## Resumen

DeepSeek-V4.1-Flash es un modelo multimodal de tipo Mixture-of-Experts (MoE) publicado por DeepSeek AI, distribuido en el repositorio de HuggingFace `m0mmm/DeepSeek-V4.1-Flash`. Segun la model card, combina una arquitectura Causal Encoder-Decoder (CED) de 40 capas con soporte nativo de imagenes y texto, y una ventana de contexto de hasta 1.000.000 de tokens. Su propuesta central es la compresion agresiva de la cache KV: el modelo reduce el coste de memoria por token a unos 890 bytes, aproximadamente una cuarta parte del de DeepSeek-V4-Flash y 437 veces menos que DeepSeek-V1, lo que lo orienta a cargas de trabajo con entradas muy largas y flujos agenticos.

El punto diferenciador es el reparto asimetrico de computo: durante el prefill solo se activan 8.000 millones de parametros por token, y 16.000 millones durante la decodificacion, sobre un backbone declarado de 552.000 millones de parametros. El repositorio contiene 763.205.315.794 parametros segun los metadatos de safetensors, cifra que incluiria la memoria condicional Engram (196.000 millones declarados en la model card). Incorpora ademas decodificacion especulativa DSpark y un ajuste de esfuerzo de razonamiento controlable de forma continua entre 1 y 100.

Es relevante ahora porque ataca el cuello de botella dominante en despliegues de contexto largo: el coste de la cache KV y el coste de prefill en tareas con mucho contexto de entrada. Sin embargo, conviene senalar que el repositorio analizado es un espejo de terceros, con 0 descargas y 0 likes, creado el 30 de septiembre de 2026, y cuya model card atribuye la autoria a DeepSeek AI; la procedencia de los pesos debe verificarse antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con arquitectura Causal Encoder-Decoder (CED): 40 capas (20 de encoder causal + 20 de decoder) y capas MoE con atencion dispersa CSA2 |
| Parametros totales | 763.205.315.794 segun safetensors; la model card declara 552.000 millones de backbone + 196.000 millones de memoria condicional Engram |
| Parametros activos | 8.000 millones por token en prefill y 16.000 millones por token en decode; 6 expertos enrutados de 384 por capa MoE, mas 1 experto compartido |
| Longitud de contexto | Hasta 1.000.000 de tokens |
| Tipos de cuantizacion | Etiquetas 8-bit y fp8; cache KV principal en FP4 (formato E2M1, una escala E4M3 por cada 16 canales). Disponibilidad de GGUF: no disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors |
| Tamano del repositorio | 510,3 GB |
| Pipeline declarado | image-text-to-text |
| Libreria | transformers |
| Fecha de creacion | 2026-09-30 |

## Arquitectura y entrenamiento

La arquitectura CED separa el modelo en un encoder causal de 20 capas y un decoder de 20 capas. La particularidad reside en que la cache KV global del decoder se proyecta a partir de los estados ocultos finales del encoder, en lugar de derivarse de los estados ocultos de cada capa del decoder. Esto permite que el prefill active solo 8.000 millones de parametros por token. Sobre esa base se anaden varios componentes: **SWA Bounded Replay**, que reconstruye los estados KV de ventana deslizante ausentes replicando unicamente los *n*_win tokens mas recientes, evitando persistir esa cache en SSD y dejando la huella persistente en aproximadamente 1/8 de la de DeepSeek-V4-Flash; **Compressed Sparse Attention 2 (CSA2)**, que asigna a cada capa de atencion uno de tres modos estaticos (Full, Reindex o Reuse) para compartir KV principal e indexador K entre capas y reutilizar indices de atencion dispersa Top-K; y un **Hierarchical Sparse Indexer** en el decoder que restringe las capas de indexado posteriores a un pool de candidatos construido por la primera capa en modo Full, acotando el coste del indexado profundo con independencia de la longitud del contexto. Se suman Single-Pass mHC (mezcla de flujo residual revisada, con el kernel Mega-mHC) y la memoria condicional Engram, de 196.000 millones de parametros, accedida de forma dispersa mediante busqueda por token. La decodificacion especulativa corre a cargo de DSpark, con generacion de borradores semiautoregresiva y verificacion planificada por confianza.

El preentrenamiento se realizo desde cero sobre un corpus multimodal de 45 billones de tokens, con la atencion dispersa entrenada a una longitud de secuencia de 64K y la extension de contexto hasta 1M aplicada a partir de los 34 billones de tokens. El postentrenamiento sigue el paradigma SFT, luego RL y despues destilacion on-policy (OPD), sin modificaciones algoritmicas; los cambios sustantivos estan en la pipeline de datos, con sintesis automatica a gran escala de tareas y entornos agenticos y escalado progresivo de datos, tareas y rollouts. En el lado multimodal, un encoder de vision DeepSeek-ViT entrenado desde cero con 2D-RoPE y reduccion de resolucion mediante pixel-unshuffle 3x3, junto con un proyector MLP de dos capas, convierten las imagenes en embeddings visuales que se procesan conjuntamente con los de texto desde el inicio del preentrenamiento.

## Capacidades

- Generacion de texto autoregresiva con ventana de contexto de hasta 1.000.000 de tokens, orientada a entradas masivas y flujos agenticos.
- Procesamiento nativo de imagenes y texto de forma conjunta (pipeline image-text-to-text), mediante el encoder DeepSeek-ViT y el proyector MLP de dos capas.
- Razonamiento con esfuerzo controlable: la model card describe un ajuste entero de 1 a 100 que intercambia coste de inferencia por precision.
- Capacidades agenticas reforzadas por el postentrenamiento sobre entornos y tareas agenticas sintetizadas a gran escala.
- Decodificacion especulativa integrada (DSpark), con generacion de borradores semiautoregresiva y verificacion planificada por confianza.
- Memoria condicional Engram de 196.000 millones de parametros, accedida de forma dispersa por busqueda basada en token.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Analisis de repositorios completos: con 1M de tokens de contexto, el modelo puede ingerir un arbol de codigo extenso o un historial largo de incidencias en una sola pasada y responder sobre el, evitando estrategias de recuperacion fragmentada.
- Agentes autonomos de varios pasos: el postentrenamiento sobre entornos agenticos y el ajuste de esfuerzo de razonamiento permiten regular el coste por tarea segun la dificultad, algo util en bucles de planificacion y ejecucion con muchas llamadas a herramientas.
- Revision documental con imagenes: al aceptar pares imagen-texto, encaja en tareas de extraccion y verificacion sobre documentos escaneados, informes con graficos o capturas de paneles, procesando la imagen y el texto de instrucciones en el mismo contexto.
- Atencion al cliente sobre historiales largos: la reduccion de la cache KV a unos 890 bytes por token hace viable mantener conversaciones multi-turno con transcripciones extensas o bases de conocimiento adjuntas dentro de la ventana.
- Procesamiento por lotes de entradas largas: el prefill a 8.000 millones de parametros activos por token abarata los escenarios con mucha entrada y poca salida, como clasificacion, resumen o extraccion estructurada sobre documentos largos.
- Investigacion sobre compresion de cache KV: la combinacion de CSA2, FP4 en la cache principal y SWA Bounded Replay lo convierte en una referencia para estudiar tecnicas de atencion dispersa y gestion de memoria en modelos de gran escala.
- Evaluacion de pipelines multimodales en investigacion: sirve como punto de comparacion para medir el impacto de un encoder de vision entrenado desde cero con 2D-RoPE y un unico preentrenamiento multimodal.
- Despliegue en plataformas compatibles con la API de endpoints: la etiqueta endpoints_compatible sugiere integracion en infraestructuras que consumen modelos servidos mediante API, aunque esto requiere verificar los pesos reales.

## Benchmarks y rendimiento

La model card de referencia incluye una seccion de resultados de evaluacion ("Evaluation Results", con una subseccion dedicada al modelo base) y figuras sobre rendimiento agentico, pero los valores numericos no estan incluidos en la informacion proporcionada. Por tanto:

"No se han publicado resultados de benchmarks en la informacion disponible."

El unico dato cuantitativo de rendimiento recuperable son las ratios de cache KV por token que la propia model card afirma: aproximadamente 4 veces menos que DeepSeek-V4-Flash y 437 veces menos que DeepSeek-V1, hasta situarse en unos 890 bytes por token.

## Requisitos de hardware

- VRAM estimada para inferencia: con 763.205.315.794 parametros, una copia en fp8 o int8 requiere del orden de 763 GB de VRAM; en BF16 serian aproximadamente 1,5 TB. El repositorio ocupa 510,3 GB, lo que apunta a una mezcla de precisiones en los pesos publicados.
- Memoria de cache KV: a 890 bytes por token, una secuencia de 1.000.000 de tokens consume aproximadamente 849 MiB de cache KV por secuencia, muy por debajo de lo habitual en modelos de este tamano.
- GPU recomendadas: despliegues multi-GPU con H100 de 80 GB, H200 o equivalentes. Un nodo de 8xH100 (640 GB) queda por debajo de la estimacion en fp8 completa, por lo que serian necesarios 16xH100 o 8xH200. No hay datos oficiales de configuracion minima publicados en la informacion disponible.
- GPU de consumo: no cabe en ninguna GPU de consumo actual (RTX 4090 con 24 GB, RTX 5090 o similares). El modelo no es ejecutable en hardware de escritorio sin cuantizaciones muy agresivas que no estan documentadas.
- Opciones de despliegue: la libreria declarada es transformers. vLLM, SGLang, TGI, Ollama y llama.cpp no estan confirmados para esta revision concreta en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cache KV por token | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash | 763.205.315.794 totales; 552B de backbone + 196B de Engram; 8B activos en prefill y 16B en decode | 1.000.000 de tokens | ~890 bytes (FP4, E2M1) | MIT | Repositorio de terceros en HuggingFace, 0 descargas |
| DeepSeek-V4-Flash | No disponible | No disponible | ~4x la de V4.1-Flash, es decir, del orden de 3.560 bytes (valor derivado de la ratio declarada) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |
| DeepSeek-V1 | No disponible | No disponible | ~437x la de V4.1-Flash, es decir, del orden de 389 KB por token (valor derivado de la ratio declarada) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |

Los valores de cache KV de DeepSeek-V4-Flash y DeepSeek-V1 son calculos aritmeticos derivados de las ratios declaradas en la model card, no cifras publicadas de forma explicita. El resto de caracteristicas de esos dos modelos no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Procedencia del repositorio: el repositorio `m0mmm/DeepSeek-V4.1-Flash` es de un autor de terceros, con 0 descargas y 0 likes, y su model card atribuye el modelo a DeepSeek AI. Conviene verificar la autenticidad de los pesos y localizar el repositorio oficial antes de cualquier uso.
- Discrepancia en el recuento de parametros: la model card declara 552.000 millones de backbone, mientras que los metadatos de safetensors registran 763.205.315.794 parametros totales. La diferencia es coherente con los 196.000 millones de Engram, pero la cifra efectiva debe confirmarse.
- Idiomas soportados: no disponible. No hay confirmacion de cobertura multilingue ni de comportamiento especifico en castellano.
- Riesgo de alucinacion: no se han publicado tasas de alucinacion ni evaluaciones de fidelidad en la informacion disponible.
- Sesgos conocidos: no disponibles. No se documentan procesos de mitigacion ni evaluaciones de sesgo.
- Restricciones de licencia: la licencia declarada es MIT, permisiva y apta para uso comercial, pero al tratarse de un repositorio de terceros la atribucion de licencia debe verificarse contra la publicacion oficial.
- Benchmarks ausentes: no hay resultados numericos publicados en la informacion proporcionada, por lo que no es posible validar las afirmaciones de rendimiento agentico de la model card.
- Requisitos de despliegue muy altos: 510,3 GB de repositorio y una estimacion de cientos de GB de VRAM en fp8 lo excluyen de cualquier entorno que no sea multi-GPU de centro de datos.
- Componentes no verificables de forma independiente: CSA2, SWA Bounded Replay, DSpark, Engram y Single-Pass mHC se describen unicamente en la model card, sin que la informacion proporcionada incluya el informe tecnico completo ni implementaciones de referencia.
- Cifras de rendimiento derivadas: las ratios de cache KV de la comparativa son deducciones aritmeticas a partir de afirmaciones del autor, no mediciones reproducidas.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/m0mmm/DeepSeek-V4.1-Flash
- Informe tecnico referenciado en la model card: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
- Organizacion en HuggingFace de DeepSeek AI: https://huggingface.co/deepseek-ai
- Sitio oficial: https://www.deepseek.com/
- Chat: https://chat.deepseek.com/
- Twitter/X: https://twitter.com/deepseek_ai
- Repositorio de referencia de la familia DeepSeek-V2 (usado para los recursos graficos de la model card): https://github.com/deepseek-ai/DeepSeek-V2
