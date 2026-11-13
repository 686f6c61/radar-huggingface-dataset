# ejdis/nanoMoE

## Resumen

nanoMoE es un modelo de lenguaje causal de pequeno tamano desarrollado por el usuario ejdis bajo una arquitectura Transformer con capas de mezcla de expertos (Mixture-of-Experts, MoE) de diseno propio. Se trata de un experimento de investigacion mas que de un modelo de produccion: el repositorio contiene los pesos y el codigo de la arquitectura (`model.py`), pero no se ha publicado informacion sobre el dataset de entrenamiento, el numero de tokens procesados ni los resultados de evaluacion. El modelo esta pensado para explorar el enrutamiento Top-K a nivel de token en un Transformer compacto.

La configuracion publicada describe un modelo con `vocab_size` de 50257 (tokenizer GPT-2), `block_size` de 256 tokens de contexto, dimension de modelo `d=256`, 8 capas, 8 cabezas de atencion, 4 expertos y `top_k=2`. Es, por tanto, un modelo del orden de decenas de millones de parametros, muy por debajo de los modelos MoE de referencia como Mixtral o DeepSeek-MoE, y su utilidad practica queda limitada a experimentacion y aprendizaje.

Su relevancia actual es marginal: no tiene descargas ni likes, no declara licencia ni idiomas soportados, y la model card advierte explicitamente de que no puede cargarse con `AutoModelForCausalLM.from_pretrained()` y de que la reproduccion exacta del entrenamiento requeriria el dataset original, el preprocesado, la semilla aleatoria y el estado del optimizador, que no estan incluidos en los checkpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con Mixture-of-Experts (enrutamiento Top-K a nivel de token) |
| Parametros totales | no disponible (no declarado; por configuracion, del orden de decenas de millones) |
| Parametros activos | no disponible (Top-K=2 sobre 4 expertos) |
| Longitud de contexto | 256 tokens (`block_size`) |
| Tipos de cuantizacion | no disponible (solo pesos PyTorch en `.pt`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoints PyTorch (`.pt`) con `state_dict`, configuracion y paso de entrenamiento |

Otros parametros de la configuracion publicada: `d=256`, `n_layer=8`, `n_head=8`, `n_exp=4`, `top_k=2`, `dropout=0.1`, `vocab_size=50257`.

## Arquitectura y entrenamiento

La arquitectura es un Transformer causal con capas MoE y enrutamiento Top-K a nivel de token: cada token se asigna a 2 de los 4 expertos disponibles (`n_exp=4`, `top_k=2`). La implementacion original esta en `model.py` dentro del repositorio y se importa dinamicamente en el ejemplo de carga, lo que confirma que no sigue la interfaz estandar de Transformers. La dimension del modelo es 256, con 8 capas y 8 cabezas de atencion, y el tokenizer es el GPT-2 preentrenado (`vocab_size=50257`).

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, si hubo fases de RLHF o DPO, ni sobre innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). La model card solo indica que los checkpoints contienen el `state_dict`, la configuracion y el paso de entrenamiento, y que los checkpoints de evaluacion incluyen metricas de validacion e historial de entrenamiento. El autor advierte que la reproduccion exacta del entrenamiento requiere el dataset original, el preprocesado, la semilla y el estado del optimizador, que no estan en el repositorio.

## Capacidades

- Generacion de texto causal autoregresiva: el ejemplo de la model card muestra inferencia sobre la entrada "Once upon a time" y devuelve logits.
- Enrutamiento MoE a nivel de token: 2 de 4 expertos activos por token.
- Tokenizacion con GPT-2: compatible con el vocabulario de GPT-2.
- Carga mediante codigo Python personalizado (`model.py`) e importacion dinamica con `importlib`.
- No se documenta soporte de tool calling, function calling ni agentes.
- No se documenta capacidad multilingue, vision, audio ni modo de razonamiento extendido.
- No se documenta alineacion (RLHF/DPO) ni formato de chat.

## Casos de uso

- Experimentacion academica con MoE: el modelo sirve para estudiar el comportamiento del enrutamiento Top-K a nivel de token en un Transformer pequeno, modificando `n_exp` y `top_k` en `model.py` y observando el efecto en la perdida de validacion.
- Prototipado de arquitecturas personalizadas: util para validar pipelines de carga de checkpoints PyTorch no estandar (`importlib.util.spec_from_file_location`) antes de escalar a modelos mayores.
- Docencia sobre Transformers: con 8 capas, `d=256` y contexto de 256 tokens, el modelo es lo bastante pequeno para inspeccionar pesos y activaciones en un portatil.
- Generacion de texto de prueba en entornos controlados: permite comprobar el flujo completo tokenizer GPT-2 -> logits -> muestreo, aunque la calidad del texto no esta evaluada.
- Reproduccion de experimentos de investigacion: los checkpoints periodicos (`ck_XXXXXX.pt`), los mejores (`best_ck_XXXXXX.pt`) y el ultimo (`last_ck_XXXXXX.pt`) permiten comparar estados de entrenamiento.
- Base para fine-tuning exploratorio: al ser un modelo pequeno con tokenizer GPT-2, puede adaptarse a tareas acotadas siempre que se asuma la ausencia de licencia y de garantias de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Por la configuracion (`d=256`, 8 capas, 4 expertos, vocabulario 50257) y el tamano del repositorio (1.7 GB, que incluye multiples checkpoints), cada checkpoint individual es pequeno y cabe holgadamente en GPU consumer.
- GPU recomendadas: cualquier GPU con suficiente memoria para el checkpoint concreto; una RTX 4090 o incluso GPUs de gama media son sobredimensionadas para un modelo de esta escala.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con varios GB de VRAM; el dato exacto por checkpoint no esta publicado.
- Opciones de despliegue: no hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que la arquitectura es personalizada y requiere cargar `model.py` con `importlib`. El unico camino documentado es PyTorch nativo (`torch.load` con `weights_only=True`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nanoMoE (ejdis) | no disponible (decenas de millones por config) | 256 tokens | Transformer MoE Top-K propio | no disponible | Repo PyTorch, sin descargas |
| GPT-2 small | 124 M | 1024 tokens | Transformer denso | MIT (segun publicacion original) | Ampliamente disponible |
| TinyLlama-1.1B | 1.1 B | 2048 tokens | Transformer denso (Llama) | Apache 2.0 | Ampliamente disponible |
| Mixtral 8x7B | 46.7 B totales / 12.9 B activos | 32 768 tokens | Transformer MoE Top-2 | Apache 2.0 | Ampliamente disponible |

La comparacion es orientativa: nanoMoE no publica metricas, por lo que no puede contrastarse su rendimiento con estas alternativas. Su unica similitud con Mixtral es el uso de enrutamiento Top-2 sobre expertos; la escala es varios ordenes de magnitud inferior.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni perplejidad, por lo que no puede evaluarse su calidad.
- Contexto muy limitado: 256 tokens, insuficiente para la mayoria de tareas reales de conversacion o documentos.
- Licencia no declarada: no se especifican condiciones de uso comercial; debe asumirse que no hay autorizacion explicita.
- Idiomas no declarados: se desconoce que lenguas maneja con solvencia.
- Riesgo de alucinacion y texto incoherente: sin informacion sobre datos de entrenamiento ni alineacion, no hay garantias de coherencia.
- Carga no estandar: requiere ejecutar codigo Python del repositorio (`model.py`) con `exec_module`, lo que implica un riesgo de seguridad; el propio autor advierte "Only execute trusted source code".
- Reproducibilidad incompleta: faltan dataset, preprocesado, semilla y estado del optimizador, segun la model card.
- Sin soporte de tool calling, agentes ni formato de chat: no apto para pipelines de agentes sin trabajo adicional.
- Sin descargas ni validacion de la comunidad (0 descargas, 0 likes): no hay evidencia externa de funcionamiento correcto.
- Fecha de creacion futura en la metadata (2026-11-13): inconsistencia que conviene verificar antes de confiar en el repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ejdis/nanoMoE
- Tokenizer GPT-2 referenciado: https://huggingface.co/gpt2
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la informacion disponible.
