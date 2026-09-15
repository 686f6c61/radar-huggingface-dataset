# AG-dataScientist/tamil-llm-23m

## Resumen

Tamil LLM 23M es un modelo de lenguaje decoder-only de 23.033.856 parametros entrenado desde cero por el usuario AG-dataScientist para la generacion de texto en tamil. Se trata de un experimento de escala muy reducida, con 6 capas, hidden size de 384, 6 cabezas de atencion y una ventana de contexto de solo 256 tokens, pensado explicitamente para investigacion, docencia y estudio de las fases de preentrenamiento y ajuste supervisado (SFT) de un Transformer, no para uso en produccion.

El modelo se preentreno sobre aproximadamente 100.000 documentos en tamil (~58 millones de tokens, split 90/10) y despues se ajusto con un conjunto conversacional de tan solo 20 ejemplos. El checkpoint preentrenado alcanzo una perdida de validacion de ~5,13, mientras que el modelo SFT presenta una calidad de generacion reconocidamente limitada por el propio autor, con riesgo de salidas repetitivas o incoherentes.

Su relevancia es fundamentalmente metodologica: es un ejemplo reproducible de pipeline completo (tokenizer BPE propio de 32.000 tokens, preentrenamiento y SFT) para una lengua de bajos recursos como el tamil, entrenado en una GPU de Google Colab y publicado bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parametros totales | 23.033.856 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (solo se publican checkpoints en punto flotante de PyTorch) |
| Idiomas soportados | tamil (codigo `ta`) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`: `best_model.pt` y `sft_model.pt`); tokenizer en `tamil_bpe_tokenizer.json`; configuracion en `config.json` |

Detalles adicionales de arquitectura: 6 capas, hidden size 384, 6 cabezas de atencion (dimension de cabeza 64), feed-forward de 1.536, vocabulario de 32.000 tokens. Tokens especiales: `<pad>` 0, `<unk>` 1, `<bos>` 2, `<eos>` 3, `<sep>` 4, `<|user|>` 5, `<|assistant|>` 6, `<|system|>` 7.

## Arquitectura y entrenamiento

La arquitectura es un Transformer decoder-only clasico, sin mecanismos de atencion lineal, MoE ni componentes de estado (SSM). Con 23 millones de parametros y solo 6 capas, la profundidad y la anchura son muy reducidas, lo que limita la capacidad de representacion. El tokenizer es un BPE propio entrenado sobre texto tamil con un vocabulario de 32.000 entradas, un tamano elevado en relacion al numero de parametros del modelo: la capa de embedding concentra una fraccion notable del total.

El preentrenamiento uso aproximadamente 58 millones de tokens procedentes de unas 100.000 documentos en tamil (90 % entrenamiento, 10 % validacion). La configuracion fue: batch size 32, learning rate 3e-4, weight decay 0,1, maximo de 4 epocas, longitud de secuencia 256, 500 pasos de warmup y gradient clipping de 1,0. La mejor checkpoint preentrenada obtuvo una perdida de validacion de ~5,13. El ajuste supervisado se realizo con una configuracion igualmente minima: 20 ejemplos de entrenamiento, batch size 4, learning rate 2e-5, 5 epocas, optimizador AdamW y weight decay 0,01. La perdida de SFT descendio de 9,5971 (epoca 1) a 2,8685 (epoca 5), un descenso propio de un sobreajuste rapido sobre un conjunto de 20 ejemplos mas que de una mejora real de capacidad. No se documento el uso de RLHF, DPO ni tecnicas de alineacion adicionales. Todo el entrenamiento se ejecuto en una GPU de Google Colab.

## Capacidades

- Generacion de texto en tamil con un modelo entrenado desde cero sobre corpus tamil; no hay evidencia publicada de capacidad multilingue fuera del tamil.
- Continuacion de texto y modelado de lenguaje a nivel de token, util para estudiar dinámicas de preentrenamiento a pequena escala.
- Formato conversacional basico mediante los tokens especiales `<|system|>`, `<|user|>` y `<|assistant|>`, aunque el ajuste se hizo con solo 20 ejemplos.
- Seguimiento muy limitado de instrucciones: el propio autor senala que la calidad de generacion es limitada y puede producir salidas repetitivas o incoherentes.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Estudio didactico de preentrenamiento de Transformers: el modelo permite reproducir de principio a fin un pipeline de preentrenamiento sobre una lengua de bajos recursos y comparar curvas de perdida con la configuracion documentada (58 M de tokens, 4 epocas, perdida de validacion ~5,13).
- Experimentacion con tokenizers BPE para lenguas dravidicas: el `tamil_bpe_tokenizer.json` de 32.000 tokens puede analizarse de forma independiente para estudiar la fragmentacion de morfemas en tamil.
- Base para investigacion sobre eficiencia en modelos diminutos: con 23 M de parametros y contexto de 256 tokens, es un banco de pruebas barato para tecnicas de destilacion, pruning o quantizacion aplicadas a lenguas de bajos recursos.
- Ensenanza de ajuste supervisado y sobreajuste: la curva de perdida de SFT (de 9,5971 a 2,8685 en 5 epocas con 20 ejemplos) sirve como caso practico de como un dataset demasiado pequeno produce sobreajuste.
- Generacion de texto tamil en entornos de muy bajos recursos: al requerir menos de 100 MB en punto flotante, puede ejecutarse en CPU o en GPUs integradas para pruebas de concepto, no para calidad de produccion.
- Punto de partida para fine-tuning posterior en tamil: al publicarse bajo Apache 2.0 y con checkpoints en `.pt`, un equipo puede continuar el entrenamiento con un corpus mayor antes de evaluar su uso real.
- Analisis de sesgos y cobertura de corpus tamil: el modelo y su composicion de datos permiten estudiar que dominios quedan infrarrepresentados en 58 millones de tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay cifras de MMLU, HumanEval, GSM8K ni de tareas estandar en tamil. Los unicos datos cuantitativos publicados son las perdidas de entrenamiento:

| Metrica | Valor |
|---|---|
| Perdida de validacion (mejor checkpoint preentrenado) | ~5,13 |
| Perdida de SFT, epoca 1 | 9,5971 |
| Perdida de SFT, epoca 2 | 7,7903 |
| Perdida de SFT, epoca 3 | 6,1306 |
| Perdida de SFT, epoca 4 | 4,4205 |
| Perdida de SFT, epoca 5 | 2,8685 |
| Descargas en HuggingFace | 0 |
| Likes en HuggingFace | 0 |

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 23.033.856 parametros, sin contar overhead del runtime): ~92 MB en FP32, ~46 MB en FP16/BF16, ~23 MB en INT8. La cache KV para una secuencia completa de 256 tokens es de aproximadamente 2,4 MB (6 capas x 6 cabezas x 64 de dimension de cabeza x 256 tokens x 2 bytes).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es mas que suficiente; el modelo se entreno en una GPU de Google Colab, por lo que una T4, una RTX 3060 o incluso una GPU integrada reciente bastan para inferencia.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, y tambien en CPU sin dificultad.
- Opciones de despliegue: no hay soporte directo en vLLM, llama.cpp, Ollama, TGI ni en `transformers` de HuggingFace, ya que el repositorio solo publica checkpoints `.pt` y un `config.json` propio. El despliegue requiere cargar el checkpoint con PyTorch y reconstruir la arquitectura a partir de la configuracion; para usarlo con herramientas estandar habria que exportar a safetensors/GGUF y registrar la arquitectura.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de modelos comparables en la informacion proporcionada. Los resultados de la busqueda web realizada no contienen ninguna referencia a modelos de lenguaje en tamil ni a alternativas de escala similar: los enlaces devueltos corresponden a entidades no relacionadas (AG2R LA MONDIALE, AG Insurance, articulo enciclopedico sobre el acronimo "AG"). Por tanto, no es posible construir una tabla comparativa con parametros, contexto, rendimiento, licencia y disponibilidad verificables:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Tamil LLM 23M | 23.033.856 | 256 tokens | Apache 2.0 | HuggingFace (`AG-dataScientist/tamil-llm-23m`) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El propio autor indica que el modelo SFT es experimental, entrenado con un conjunto de instrucciones muy pequeno (20 ejemplos), y que la calidad de generacion es limitada, con salidas potencialmente repetitivas o incoherentes.
- No debe considerarse un modelo de lenguaje tamil de proposito general listo para produccion; el autor lo desaconseja explicitamente sin entrenamiento y evaluacion adicionales.
- La ventana de contexto de 256 tokens es muy corta: no permite conversaciones multi-turno largas, resumen de documentos ni razonamiento encadenado extenso.
- El corpus de preentrenamiento es reducido (~58 millones de tokens, 100.000 documentos) y su composicion no esta documentada, por lo que no puede evaluarse la cobertura de dominios ni el sesgo resultante. Cabe esperar sesgos derivados de las fuentes de recopilacion, no analizados por el autor.
- Riesgo elevado de alucinacion y de texto gramaticalmente plausible pero incorrecto, dado el bajo numero de parametros, el volumen de datos y la perdida de validacion de ~5,13.
- Cobertura idiomatica limitada al tamil; no hay evidencia de competencia en otros idiomas, incluido el ingles.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia, pero la calidad actual hace inviable un uso comercial directo.
- No se publican datos de evaluacion con benchmarks, ni model card de evaluacion de sesgos, ni instrucciones detalladas de carga del checkpoint (solo la lista de archivos), lo que anade coste de integracion.
- El modelo no esta disponible en formatos estandar (safetensors, GGUF) ni integrado en frameworks de inferencia habituales.
- Metricas de adopcion minimas: 0 descargas y 0 likes en el momento de redactar esta ficha.

## Enlaces

- HuggingFace: https://huggingface.co/AG-dataScientist/tamil-llm-23m
- Paper: no disponible
- Blog o articulo tecnico del autor: no disponible
- Repositorio de codigo: no disponible
- Demo o espacio de inferencia: no disponible
- Otros enlaces relevantes: no disponible. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo ni con modelos de lenguaje en tamil; los enlaces obtenidos (ag2rlamondiale.fr, legalplace.fr, fr.wikipedia.org/wiki/AG, ag.be) no guardan relacion con esta ficha.
