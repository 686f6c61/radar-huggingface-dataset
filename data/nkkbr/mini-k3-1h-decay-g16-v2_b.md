# nkkbr/Mini-K3-1H-decay-g16-v2_B

## Resumen

Mini-K3-1H-decay-g16-v2_B es un checkpoint de preentrenamiento de tipo *research proxy* publicado por el usuario nkkbr (0 descargas, 0 likes en el momento de la consulta). Se trata de un modelo de lenguaje solo texto, de aproximadamente 1.015 millones de parametros logicos, construido como una reproduccion a escala reducida de la arquitectura Kimi-K3: combina capas KDA (atencion lineal con decaimiento) y capas Gated MLA (atención latente multi-cabeza con puerta de salida), bloques de Attention Residuals, un MoE estable (Stable LatentMoE) con 64 expertos enrutados y 2 compartidos, activaciones SiTU y Quantile Balancing en el enrutador. Es, por tanto, un modelo de arquitectura hibrida con atencion lineal y mezcla de expertos, no un transformer denso convencional.

El checkpoint publicado corresponde al paso de 1.000.079.360 tokens de un plan de entrenamiento de 16.000 millones de tokens; el entrenamiento esta en curso y cada checkpoint numerado se etiqueta de forma inmutable. El dato diferencial es que este repositorio no busca rendimiento final, sino servir de pieza dentro de una comparacion controlada de 20 arquitecturas que comparten inicializacion canonica (semilla base 20260914), orden de datos congelado y receta de optimizacion identica, de modo que las diferencias medidas entre variantes sean atribuibles al cambio arquitectonico concreto.

La relevancia actual es metodologica: proporciona un punto de comparacion reproducible para estudiar decisiones de diseno como la granularidad del decaimiento en KDA (16 grupos contiguos por cabeza en esta variante), la longitud de convolucion causal, la proporcion KDA/MLA o la codificacion posicional (NoPE en MLA). No ha recibido entrenamiento posterior (ni SFT ni RLHF), no se ha evaluado en tareas downstream y no debe tratarse como un asistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder hibrido: 13 capas (9 KDA de atencion lineal + 4 Gated MLA), MoE con enrutador, Attention Residuals, activaciones SiTU |
| Parametros totales | 1.015.220.140 |
| Parametros activos | 351.995.820 por token (MoE) |
| Longitud de contexto | 8.192 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | No disponible (solo se publican pesos BF16 en safetensors; no hay GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (BF16), con estado de control en FP32 para decaimiento KDA, convolucion, normalizacion y enrutador; requiere codigo PyTorch propio (`modeling_mini_k3.py`, `configuration_mini_k3.py`) |

Datos adicionales de arquitectura: ancho oculto 1024, 12 cabezas de atencion, ancho de cabeza KDA 128, kernel de convolucion causal depthwise en KDA de 4, 16 grupos de decaimiento contiguos por cabeza, 1 capa densa antes del MoE, expertos enrutados/compartidos/top-k = 64/2/4, ancho oculto de experto enrutado 512, tamano de bloque de Attention Residuals 4, vocabulario 163.840 (BOS 163.584, EOS de generacion 163.586, PAD 163.839).

## Arquitectura y entrenamiento

El modelo es un decoder de 13 capas que alterna dos operadores de atencion: KDA en las capas [1, 2, 3, 5, 6, 7, 9, 10, 11] y Gated MLA en las capas [4, 8, 12, 13]. KDA introduce un decaimiento por cabeza dividido en 16 grupos contiguos, mas una convolucion causal depthwise de kernel 4 sobre las proyecciones Q/K/V. MLA usa modo posicional NoPE y puerta de salida activada, lo que traslada parte de la senal posicional al decaimiento y a la estructura recurrente. Los documentos empaquetados estan aislados de forma estricta: MLA aplica una mascara causal bloqueada por documento y KDA reinicia su estado recurrente y el historial de convolucion corta en cada frontera de segmento. El MoE, denominado Stable LatentMoE, usa 64 expertos enrutados y 2 compartidos con top-k 4; el enrutador selecciona con puntuaciones sesgadas y combina con puntuaciones sigmoideas sin sesgo renormalizadas.

El entrenamiento sigue la receta K3: Muon por cabeza para las matrices Q/K/V expandidas por cabeza, Muon para el resto de matrices, AdamW como respaldo para vectores y embeddings, weight decay 0.1, QK-Clip por cabeza, decaimiento coseno y 1% de warmup lineal. El enrutador se regula con Quantile Balancing en linea sobre histogramas de 1.000 bins. No hay entrenamiento posterior de ningun tipo. Este checkpoint concreto (variante de granularidad de decaimiento) se recupero tras un fallo de la ejecucion original antes de su checkpoint de inicializacion, causado por una discrepancia de layout en `dt_bias` entre el formato de entrenamiento y el portable; se reinicio desde cero tokens conservando orden de datos, semilla, arquitectura y receta, y el unico cambio es la serializacion portable. Los pesos estan en BF16, con decaimiento KDA, convolucion, normalizacion y estado de control del enrutador en FP32; el estado del optimizador no se publica. El repositorio ocupa 6,1 GB e incluye manifiestos JSON con revisiones de fuentes, cuotas de tokens, hashes de schedule, configuracion del optimizador y hashes del split de validacion.

## Capacidades

- Generacion de texto autoregresiva y modelado de lenguaje: el pipeline declarado es `text-generation`, con continuacion de texto a partir de un prompt.
- Capacidad multilingue: no disponible; no se documentan idiomas ni mezcla de datos por idioma.
- Razonamiento, matematicas y codigo: no evaluado; no hay resultados downstream publicados.
- Tool calling / function calling: no soportado (no hay plantilla de chat ni entrenamiento de instrucciones).
- Agentes y razonamiento multi-paso: no soportado.
- Vision, audio u otras modalidades: no; el checkpoint es explicitamente solo texto.
- Modo "thinking": no existe.
- Capacidad de investigacion: permite inspeccionar el comportamiento interno del enrutador MoE y del decaimiento KDA, ya que el paquete de codigo standalone (`initialize_model.py`, `smoke_test.py`) permite instanciar y ejecutar el modelo sin el checkout de entrenamiento original.
- Capacidad de comparacion controlada: al compartir inicializacion canonica y schedule con otras 19 variantes, permite aislar el efecto de cambios de arquitectura sobre la NLL de desarrollo.

## Casos de uso

- Investigacion sobre arquitecturas hibridas atencion lineal + atencion completa: el checkpoint sirve como punto de medida reproducible dentro de una comparacion de 20 variantes, con inicializacion y orden de datos identicos, para atribuir diferencias de perplejidad al cambio arquitectonico y no a ruido de entrenamiento.
- Ablacion de granularidad de decaimiento en KDA: esta variante usa 16 grupos contiguos por cabeza, de modo que puede compararse directamente contra variantes con distinta granularidad midiendo NLL de desarrollo en el mismo paso de tokens.
- Estudio de eficiencia de MoE de grano fino: con 64 expertos enrutados, 2 compartidos, top-k 4 y 352 millones de parametros activos sobre 1.015 millones totales, permite medir el compromiso entre calidad y coste por token frente a un denso de tamano similar.
- Analisis del enrutador y de Quantile Balancing: los pesos del enrutador y su estado de control estan serializados, por lo que se puede instrumentar la distribucion de asignacion de expertos, el sesgo por experto y el efecto del balanceo por cuantiles a lo largo de 1.526 pasos de optimizador.
- Punto de partida para fine-tuning supervisado en dominios acotados: al ser un modelo preentrenado de ~1.000 millones de parametros, cabe en una sola GPU de consumo y puede ajustarse con LoRA o fine-tuning completo para tareas de clasificacion, extraccion o generacion de dominio.
- Estudio de serializacion y reproducibilidad de checkpoints: el repositorio documenta el fallo de layout de `dt_bias`, los hashes de codigo y manifiesto y la estrategia de inicializacion canonica, lo que lo convierte en un caso de uso real para validar pipelines de checkpoint portable y verificacion por hashes.
- Experimentos de decodificacion y coste de inferencia: con 352 millones de parametros activos por token, sirve para medir latencia y ancho de banda efectivo frente a modelos densos de ~1B, y para estudiar el coste del estado recurrente de KDA con contexto de 8.192 tokens.
- Docencia y formacion en preentrenamiento a escala 1B: el paquete incluye el modelo, la configuracion y scripts de inicializacion y prueba de humo, lo que permite reproducir un ciclo completo de carga, forward y calculo de perdida en un entorno local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que es un checkpoint intermedio de investigacion que aun no ha sido evaluado en tareas downstream. Lo unico registrado son metricas de entrenamiento (NLL de desarrollo fijo y perplejidad) en W&B y en el fichero JSONL de metricas de la ejecucion, sin cifras publicadas en el repositorio. No se dispone de datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar.

## Requisitos de hardware

- VRAM para inferencia en BF16: aproximadamente 2,1 GB solo para pesos (estimacion a partir de 1.015.220.140 parametros). Con activaciones y cache de contexto de 8.192 tokens, el consumo realista se situa en el entorno de 3 a 5 GB.
- VRAM en FP32: aproximadamente 4,1 GB solo para pesos.
- Cuantizacion: no hay ficheros GGUF ni cuantizados publicados. Una conversion a 8 bits o 4 bits seria tecnicamente posible (del orden de 1,1 GB y 0,7 GB estimados), pero requeriria implementar los operadores KDA y Gated MLA en el runtime destino.
- GPU consumer: si, cabe holgadamente. Una RTX 3060 de 12 GB, RTX 4070, RTX 4080 o RTX 4090 son suficientes; tambien una GPU de 8 GB en BF16 con lotes pequenos y contexto reducido.
- GPU de datacenter: no son necesarias. A100, H100 o similares solo tendrian sentido para entrenamiento o para barridos de evaluacion en paralelo.
- Opciones de despliegue: PyTorch con `trust_remote_code` y el paquete standalone incluido (`modeling_mini_k3.py`, `configuration_mini_k3.py`, `config.json`). No hay soporte confirmado en vLLM, llama.cpp, Ollama ni TGI; al tratarse de una arquitectura con KDA, Gated MLA y enrutador propio, su integracion en esos motores requeriria trabajo de implementacion adicional.
- Latencia y throughput estimados: no disponible. No se publican mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

La comparacion se limita a especificaciones declaradas, porque Mini-K3-1H-decay-g16-v2_B no tiene resultados de benchmarks publicados y ademas es un checkpoint intermedio de preentrenamiento sin ajuste de instrucciones. Los datos de los modelos de referencia provienen de sus fichas publicas.

| Modelo | Parametros totales / activos | Contexto | Tipo | Licencia | Estado |
|---|---|---|---|---|---|
| Mini-K3-1H-decay-g16-v2_B | 1.015 M / 352 M | 8.192 | MoE hibrido KDA + Gated MLA, preentrenado | No disponible | Checkpoint intermedio, 1.000 M de 16.000 M de tokens |
| OLMoE-1B-7B | 6.900 M / 1.300 M aprox. | 4.096 | MoE denso con atencion completa, preentrenado e instruct | Apache-2.0 | Publicado con evaluaciones |
| Qwen2.5-1.5B | 1.540 M / denso | 32.768 (ampliable con YaRN) | Transformer denso, base e instruct | Apache-2.0 | Publicado con evaluaciones |
| Llama-3.2-1B | 1.240 M / denso | 128.000 | Transformer denso, base e instruct | Licencia comunitaria Llama 3.2 | Publicado con evaluaciones |

Diferencias clave: frente a los tres alternativas, Mini-K3-1H-decay-g16-v2_B es el unico con atencion lineal KDA y MLA con NoPE, y el unico sin licencia declarada, sin idiomas declarados, sin benchmarks y sin version ajustada por instrucciones. Su ventaja objetiva es el coste de inferencia (352 M de parametros activos por token) y su utilidad como instrumento de ablacion arquitectonica; su desventaja es que no es desplegable hoy como modelo de producto sin un ciclo de ajuste posterior.

## Limitaciones y advertencias

- Modelo preentrenado unicamente: no ha recibido SFT, RLHF ni DPO. No debe utilizarse como asistente que sigue instrucciones; las salidas pueden ser repetitivas, incoherentes o no responder al prompt.
- Sin evaluacion downstream: no hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba, por lo que se desconoce su calidad real en cualquier tarea.
- Riesgo de alucinacion y de contenido inapropiado: la propia model card advierte de que las salidas pueden ser inexactas, sesgadas, inseguras o repetitivas. No hay filtros ni alineacion.
- Sesgos: no se documenta la composicion del dataset ni los idiomas; los sesgos de las fuentes de preentrenamiento se heredan sin mitigacion conocida.
- Limitacion de contexto: 8.192 tokens de entrenamiento. No hay evidencia de extrapolacion a contextos mayores, especialmente con MLA en modo NoPE.
- Cobertura idiomatica desconocida: no se declaran idiomas soportados, aunque el vocabulario es de 163.840 entradas.
- Licencia no disponible: no se especifica licencia en la ficha de HuggingFace. Esto impide determinar si el uso comercial esta permitido; en un entorno de produccion debe tratarse como no autorizado hasta que el autor lo aclare. Ademas, los datasets de origen conservan sus propias licencias y el repositorio no redistribuye su texto.
- Checkpoint intermedio: corresponde a 1.000.079.360 de 16.000.000.000 tokens objetivo. El autor advierte de que las clasificaciones de arquitectura a esta escala y con longitud de entrenamiento de 8K necesitan confirmacion antes de extrapolarse al Kimi-K3 completo.
- Estado del optimizador no publicado: limita reanudar el entrenamiento tal cual desde este checkpoint.
- Despliegue no estandar: requiere codigo PyTorch propio; no hay soporte de motores de inferencia habituales ni ficheros GGUF, lo que anade coste de ingenieria a cualquier integracion en produccion.
- Repositorio con 0 descargas y 0 likes: no hay validacion externa de la comunidad ni reportes independientes de funcionamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nkkbr/Mini-K3-1H-decay-g16-v2_B
- Revision del checkpoint publicado: `checkpoint-tokens-001000079360` (los checkpoints numerados se publican como etiquetas Git inmutables; `main` apunta al mas reciente)
- Etiqueta final prevista: `checkpoint-tokens-016000000000-final`
- Archivos de referencia incluidos en el repositorio: `modeling_mini_k3.py`, `configuration_mini_k3.py`, `config.json`, `ARCHITECTURE_PACKAGE_README.md`, `ARCHITECTURE.md`, `VARIANT.md`, `initialize_model.py`, `smoke_test.py`, `model.safetensors`, manifiestos JSON de entrenamiento
- Busqueda web: no se han encontrado enlaces relevantes al modelo, a la familia Kimi-K3 ni al experimento de ablacion. Los resultados devueltos por la busqueda corresponden a foros de roleplay ajenos por completo al contenido de esta ficha, por lo que no se incluyen. No hay paper, blog, repositorio de experimento ni demo publicados localizables en la informacion disponible.
