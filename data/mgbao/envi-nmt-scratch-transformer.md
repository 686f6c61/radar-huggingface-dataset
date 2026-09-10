# mgbao/envi-nmt-scratch-transformer

## Resumen

ENVI-NMT es un modelo de traduccion automatica neuronal ingles-vietnamita desarrollado por el usuario mgbao como proyecto de asignatura. Se trata de un transformer encoder-decoder implementado integramente desde cero en PyTorch puro (sin `nn.Transformer`, `nn.MultiheadAttention`, `F.scaled_dot_product_attention`, `nn.LayerNorm` ni `nn.RMSNorm`), con 47.955.968 parametros y entrenado sobre el corpus IWSLT 2015 En-Vi, compuesto por 131.339 pares de frases.

Su relevancia no es la de un modelo de produccion, sino la de un artefacto de investigacion y docencia: permite inspeccionar una implementacion completa y minimalista de un transformer moderno (RMSNorm pre-norm, SwiGLU, RoPE restringido a la self-attention) escrita linea a linea, algo poco habitual en un ecosistema dominado por arquitecturas empaquetadas. El repositorio incluye checkpoints, tokenizer, configuraciones, curvas de perdida y scripts de reentrenamiento reproducible con semilla fija (seed 42).

El modelo no es compatible con la libreria `transformers`: requiere clonar el codigo fuente del proyecto (`src/nmt/`) para reconstruir la arquitectura y cargar los pesos. Se publica bajo licencia MIT y solo soporta la direccion ingles a vietnamita. No consta ningun resultado de benchmark publicado, ni descargas, ni valoraciones en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder implementado desde cero en PyTorch (no usa modulos de `torch.nn` para atencion ni normalizacion) |
| Parametros totales | 47.955.968 (aproximadamente 48 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (el ejemplo de inferencia de la model card usa una longitud maxima de decodificacion de 128 tokens, pero no se especifica la ventana de entrada) |
| Tipos de cuantizacion | No disponible (se distribuyen checkpoints en PyTorch; no se documentan versiones cuantizadas) |
| Idiomas soportados | Ingles (en) y vietnamita (vi), con tokenizer BPE de 32k compartido entre ambos |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (state dict de arquitectura propia; no safetensors, no GGUF, no compatible con `AutoModel.from_pretrained`) |

Otros datos tecnicos declarados: normalizacion RMSNorm con esquema pre-norm, feed-forward SwiGLU con `d_ff` = 688, codificacion posicional RoPE aplicada unicamente en la self-attention, tokenizer BPE de 32.000 tokens entrenado conjuntamente sobre ingles y vietnamita, y semilla de entrenamiento 42. El tamano total del repositorio es de 42,7 GB, correspondiente a los multiples checkpoints, registros y artefactos de entrenamiento.

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-decoder clasico en su topologia, pero con decisiones de diseno propias de los LLM modernos trasladadas a un modelo de traduccion: normalizacion RMSNorm en configuracion pre-norm, capa feed-forward con activacion SwiGLU y dimension intermedia de 688, y codificacion posicional rotatoria (RoPE) aplicada solo a la self-attention, no a la atencion cruzada. Todo el codigo esta escrito a mano, sin recurrir a los bloques estandar de PyTorch, lo que convierte al repositorio en una referencia util para estudiar como se implementan estos componentes desde sus primitivas.

El entrenamiento se realizo sobre IWSLT 2015 En-Vi, un corpus paralelo de 131.339 pares de frases, con un tokenizer BPE de 32.000 tokens compartido por ambos idiomas. La model card documenta la semilla fija (42) y los scripts de preparacion de datos, entrenamiento del tokenizer y entrenamiento del modelo, asi como la logica de checkpoints (version mas reciente para reanudar y mejor version segun perdida de validacion). No se especifica el numero total de tokens de entrenamiento, la composicion detallada del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Los archivos bajo `smoke/` son pruebas de humo y no deben interpretarse como resultados reales.

## Capacidades

- Traduccion de texto de ingles a vietnamita, unica tarea para la que fue entrenado (pipeline `translation`).
- Decodificacion autoregresiva mediante busqueda greedy, expuesta en la funcion `greedy_search` del modulo `nmt.inference.search`, con control de `bos_id` (2), `eos_id` (3) y longitud maxima.
- Carga de checkpoints y reanudacion del entrenamiento mediante utilidades propias (`nap_config`, `nap_checkpoint`, `nap_tokenizer`).
- Reentrenamiento reproducible desde cero con semilla fija, incluyendo preparacion de datos y entrenamiento del tokenizer.
- Trazabilidad experimental: registro de metricas por paso a traves de TensorBoard y de un fichero `metrics.csv` por ejecucion, con la configuracion fusionada de cada run en `configs/`.
- Capacidad bilingue limitada al par en-vi; el BPE compartido no implica soporte de otros idiomas.
- No se documenta soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, modo de pensamiento, vision, audio ni ninguna otra modalidad. Tampoco se declara cuantizacion ni despliegue en servidores de inferencia estandar.

## Casos de uso

- Referencia didactica para cursos de NLP: el repositorio contiene una implementacion completa y legible de un transformer con RMSNorm, SwiGLU y RoPE, sin dependencias de `transformers`, lo que permite a los estudiantes leer el flujo completo desde la tokenizacion hasta la decodificacion.
- Investigacion sobre componentes arquitectonicos: al aplicar RoPE solo en la self-attention y excluirla de la atencion cruzada, el modelo sirve como punto de partida para experimentos de ablacion sobre codificacion posicional en tareas seq2seq.
- Baseline interno en proyectos de traduccion en-vi: con 48 M de parametros y licencia MIT, es un candidato razonable como linea base reproducible frente a la que medir modelos mayores o enfoques con datos adicionales.
- Traduccion de contenido editorial en dominio acotado: el entrenamiento sobre IWSLT 2015, un corpus de charlas divulgativas, lo hace mas adecuado para textos expositivos y conversacionales que para documentacion tecnica altamente especializada; resulta util como primer borrador con revision humana posterior.
- Generacion de corpus sintetico para aumento de datos: las traducciones en-vi producidas pueden emplearse en tecnicas de back-translation o como datos adicionales en pipelines de entrenamiento de mayor escala, siempre con filtrado de calidad.
- Despliegue en entornos sin GPU: por su tamano, el modelo puede ejecutarse en CPU o en hardware modesto, lo que permite integrarlo en prototipos de traduccion offline o en entornos de laboratorio con recursos limitados.
- Docencia de ingenieria de MLOps a escala reducida: los scripts de preparacion de datos, tokenizer, entrenamiento con semilla, checkpoints de mejor y ultimo modelo, y registro de metricas en CSV y TensorBoard constituyen un ejemplo compacto de ciclo de vida experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye BLEU, METEOR, chrF ni ninguna otra metrica de traduccion, y los archivos ubicados bajo `smoke/` se describen explicitamente como pruebas de humo y no como resultados reales. Las unicas metricas registradas son las curvas de perdida de entrenamiento y validacion almacenadas en `logs/<nombre de ejecucion>/metrics.csv` y en TensorBoard, cuyos valores no se detallan en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 192 MB para los pesos en FP32, unos 96 MB en FP16/BF16 y alrededor de 48 MB en int8, sin contar el estado del optimizador ni las activaciones de decodificacion. Son estimaciones derivadas del numero de parametros (47,96 M), no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; el modelo cabe holgadamente en una GTX 1650, RTX 3060, RTX 4090, A100 o H100, y estas dos ultimas estarian enormemente sobredimensionadas para 48 M de parametros.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, e incluso en CPU para inferencia interactiva.
- Opciones de despliegue: no disponible en el sentido habitual; al no ser un modelo de `transformers`, no es compatible con vLLM, TGI, llama.cpp, Ollama ni con el pipeline `translation` estandar. El despliegue exige clonar el repositorio de codigo, instalar sus dependencias y cargar el checkpoint con las utilidades propias del proyecto.
- Latencia y throughput estimados: no disponible. No se publican mediciones de latencia, tokens por segundo ni tamano de lote soportado.
- Nota sobre el repositorio: sus 42,7 GB corresponden a artefactos de entrenamiento (multiples checkpoints, registros y pruebas), no al peso del modelo en memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Compatibilidad | Disponibilidad |
|---|---|---|---|---|---|---|
| mgbao/envi-nmt-scratch-transformer | 47,96 M | No disponible | en, vi | MIT | Arquitectura propia, no soportada por `transformers` | HuggingFace, 0 descargas |
| Helsinki-NLP/opus-mt-en-vi | No disponible en la informacion proporcionada | No disponible | en, vi | No disponible en la informacion proporcionada | Marian, soportado por `transformers` | No consultado |
| VietAI/envit5-base | No disponible en la informacion proporcionada | No disponible | en, vi | No disponible en la informacion proporcionada | T5, soportado por `transformers` | No consultado |
| facebook/nllb-200-distilled-600M | No disponible en la informacion proporcionada | No disponible | Multilingue (incluye en y vi) | No disponible en la informacion proporcionada | M2M-100/NLLB, soportado por `transformers` | No consultado |

Los modelos alternativos citados pertenecen a la misma categoria funcional (traduccion en-vi), pero sus cifras concretas de parametros, contexto y licencia no forman parte de la informacion proporcionada en esta busqueda y no se han verificado, por lo que se marcan como no disponibles. Las diferencias relevantes y verificables son de ecosistema: los modelos basados en `transformers` se benefician de integracion inmediata con librerias de inferencia y de tokenizers estandar, mientras que este modelo exige cargar codigo propio y el tokenizer exacto distribuido en el repositorio. Como sucede con cualquier modelo sin benchmarks publicados, no es posible afirmar nada sobre su calidad de traduccion relativa.

## Limitaciones y advertencias

- Ausencia total de evaluacion publicada: no hay BLEU ni ninguna otra metrica de calidad en la model card. Cualquier uso requiere evaluacion propia previa.
- Corpus de entrenamiento pequeno y de dominio acotado: 131.339 pares de frases de IWSLT 2015, insuficientes para una cobertura lexica amplia y sesgados hacia el registro de charlas divulgativas.
- Dependencia estricta del tokenizer: la model card advierte de que entrenar un tokenizer nuevo produce identificadores distintos y que el modelo cargara sin errores pero generara salida incoherente. Es un fallo silencioso y facil de provocar.
- Falta de compatibilidad con el ecosistema: no funciona con `AutoModel.from_pretrained`, ni con vLLM, TGI, llama.cpp u Ollama, lo que descarta su integracion directa en infraestructuras de servicio estandar.
- Unidireccionalidad: solo traduce de ingles a vietnamita, no a la inversa.
- Sesgos: no disponibles. No se documenta ningun analisis de sesgo de genero, dialectal ni cultural, un aspecto especialmente sensible en traduccion.
- Riesgo de alucinacion: inherente a cualquier sistema de traduccion neuronal, con probabilidad elevada en un modelo de 48 M entrenado con pocos datos, especialmente ante terminos fuera de dominio, nombres propios y frases largas.
- Longitud de contexto no documentada: se desconoce la ventana de entrada soportada; el ejemplo de la model card limita la decodificacion a 128 tokens, pero no la entrada, por lo que textos largos pueden degradar la calidad o provocar fallos.
- Reproducibilidad dependiente del codigo: la licencia MIT cubre los pesos, pero la reconstruccion del modelo depende de un repositorio externo de GitHub que no forma parte del artefacto de HuggingFace.
- Estado de adopcion nulo: 0 descargas y 0 valoraciones en el momento de la consulta, sin senales de validacion por parte de terceros.
- Uso comercial: la licencia MIT lo permite tecnicamente, pero la ausencia de garantias y de evaluacion de calidad hace desaconsejable su uso en produccion sin una validacion exhaustiva previa.
- Proyecto academico: la propia model card lo describe como un trabajo de asignatura, no como un modelo mantenido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mgbao/envi-nmt-scratch-transformer
- Repositorio de codigo fuente: https://github.com/giabaomaidev/bku-project
- Checkpoint mejor valorado: `checkpoints/iwslt_base_v1_seed42/tot_nhat.pt` dentro del repositorio de HuggingFace
- Tokenizer: `artifacts/tokenizer/tokenizer.json` dentro del repositorio de HuggingFace
- Configuracion base: `configs/base.yaml` dentro del repositorio de HuggingFace
- Metricas de entrenamiento: `logs/<nombre de ejecucion>/metrics.csv` dentro del repositorio de HuggingFace
- Paper, blog o demo adicionales: no disponible. Las busquedas web realizadas no devolvieron resultados relacionados con este modelo; los unicos resultados obtenidos eran articulos periodisticos sobre la evolucion del indice Nikkei en marzo de 2026, sin ninguna relacion con el modelo.
