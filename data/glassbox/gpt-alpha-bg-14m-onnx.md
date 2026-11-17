# glassbox/gpt-alpha-bg-14m-onnx

## Resumen

gpt-alpha-bg-14m-onnx es un modelo de lenguaje en búlgaro de 13,77 millones de parámetros entrenado desde cero por el desarrollador glassbox. Se distribuye en formato ONNX cuantizado a int8 (17,3 MB), un tamaño lo bastante reducido como para enviarse como activo estático y ejecutarse dentro de una pestaña del navegador mediante `onnxruntime-web`, que es precisamente el escenario para el que fue concebido.

El modelo no compite en conocimiento factual ni en razonamiento: su utilidad declarada es la generación de texto búlgaro estilísticamente plausible y, sobre todo, la puntuación de perplejidad (bits por carácter) para ordenar candidatos por fluidez en procesos offline y del lado del cliente. Resulta relevante como referencia de ingeniería: demuestra que un transformer pequeño, entrenado con una sola época sobre un corpus mixto, puede superar en bits por carácter a modelos del doble de tamaño entrenados con dietas más estrechas.

La relevancia práctica está en su perfil de despliegue: grafo ONNX sin estado, sin caché KV, con ejes dinámicos y tokenizador BPE a nivel de byte portado a TypeScript, lo que permite filtros de fluidez para OCR, ASR o traducción automática ejecutados íntegramente en el cliente, sin servidor ni conexión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer GPT decoder-only, entrenado desde cero (no disponible el detalle de capas y dimensiones) |
| Parametros totales | 13.772.172 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (contexto de inferencia empleado en el ejemplo de la model card) |
| Tipos de cuantizacion | int8 dinamica (17,3 MB) y fp32 (68,0 MB), ambas en ONNX |
| Idiomas soportados | bulgaro (bg) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17) y safetensors en el repositorio; tokenizador en `bg15m.tokenizer.json` |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only tipo GPT entrenado desde cero, sin destilación ni inicialización desde un modelo mayor. El grafo exportado a ONNX es una función sin estado con firma `idx: int64 [batch, seq] -> logits: float32 [batch, seq, 8192]`, vocabulario de 8192 tokens, opset 17 y ambos ejes dinámicos. No incluye caché KV en el grafo: la misma llamada sirve tanto para la ingesta del prompt como para la decodificación token a token, con recómputo completo en cada paso. Esa decisión de diseño mantiene el artefacto en un único fichero sin estado de sesión que gestionar, y a 256 tokens de contexto el recómputo resulta viable en un navegador.

El entrenamiento consistió en 18.300 iteraciones sobre un corpus búlgaro mixto y limpiado (libros, noticias, wiki y foro), aproximadamente 300 millones de tokens, con **una sola pasada**: ningún ejemplo se vio dos veces. La model card no documenta fases de RLHF, DPO ni ajuste por instrucciones; el objetivo es modelado de lenguaje puro. La innovación destacable no está en la arquitectura sino en la metodología de evaluación: se mide en bits por carácter en lugar de pérdida de validación, porque los modelos comparados no comparten tokenizador y la pérdida entre tokenizadores distintos no es comparable. El conjunto de evaluación es externo a todos los corpus de preentrenamiento empleados (100.000 caracteres de la columna `correct` del dataset `thebogko/bulgarian-grammar-mistakes`); la model card señala explícitamente que hasta el 2026-08-04 el `model-index` apuntaba al corpus de entrenamiento, lo que invalidaba la lectura del resultado.

## Capacidades

- Generación de texto en búlgaro con fluidez gramatical y registro ajustable mediante el prompt.
- Puntuación de perplejidad (bits por carácter) sobre texto búlgaro, útil para ordenar candidatos por naturalidad.
- Decodificación autorregresiva greedy token a token sobre el grafo ONNX, con vocabulario de 8192 tokens.
- Ejecución en navegador mediante `onnxruntime-web`, con tokenizador BPE a nivel de byte portado a TypeScript y fijado identificador a identificador contra la implementación en Python sobre 512 frases reales.
- Ejecución en Python con `onnxruntime` y `tokenizers`.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio ni modo de pensamiento. La model card no declara ninguna de estas capacidades.

## Casos de uso

- **Filtro de fluidez sobre salida de OCR**: puntuar cada línea reconocida con el modelo y descartar o marcar aquellas cuyo bits por carácter se desvíe del rango esperado. El modelo cabe en 17,3 MB y puede ejecutarse en el propio cliente, de modo que el filtro no requiere enviar el texto a un servidor.
- **Puerta de calidad en transcripción ASR**: comparar hipótesis alternativas de un mismo segmento de audio y seleccionar la más natural según la perplejidad calculada por el modelo, en lugar de confiar únicamente en la confianza del decodificador acústico.
- **Selección de candidatos en traducción automática**: dado un conjunto de traducciones al búlgaro de una misma frase, ordenarlas por fluidez con el modelo como reranker local. Su ventana de 256 tokens lo limita a frases y párrafos cortos.
- **Corrección ortográfica y gramatical asistida**: usar la diferencia de perplejidad entre una frase original y su corrección propuesta como señal para aceptar o rechazar la corrección, integrándolo en un corrector que ya genere candidatos.
- **Prototipado de interfaces de lenguaje en el navegador**: demostraciones y materiales docentes de generación de texto que deben funcionar sin backend, sin claves de API y sin coste de inferencia, cargando el modelo como activo estático de la página.
- **Generación de texto búlgaro para pruebas y datos sintéticos**: producir relleno estilísticamente plausible en búlgaro para pruebas de internacionalización, maquetación o pipelines de NLP que necesiten texto de entrada con registro periodístico, literario o de foro según el prompt.
- **Investigación sobre dietas de datos en modelos pequeños**: el modelo sirve como punto de comparación reproducible para estudiar cómo afecta la composición del corpus al bits por carácter con un presupuesto de parámetros muy reducido.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` (no verificados de forma independiente, `verified: false`). Métrica: bits por carácter sobre 100.000 caracteres de texto búlgaro retenido, externo a los corpus de entrenamiento.

| Modelo | Parametros | Corpus | bpc, retenido externo |
|---|---|---|---|
| **gpt-alpha-bg-14m-onnx** | 13,77 M | mixto, una epoca | **2,0620** (fp32) / **2,0638** (int8) |
| hermano solo-libros | 29,37 M | ficcion | 2,0765 |
| modelo anterior de la era libros | 29,36 M | ficcion | 2,1304 |

Coste medido de la cuantizacion, verificado contra el original en PyTorch sobre el mismo texto retenido:

| Variante | Tamano | Diferencia maxima absoluta de logit vs PyTorch | Acuerdo top-1 | bpc retenido |
|---|---|---|---|---|
| `bg15m.onnx` (fp32) | 68,0 MB | 1,7e-05 | 1,00 | 2,0620 |
| `bg15m.int8.onnx` (int8 dinamica) | 17,3 MB | 0,55 | 1,00 | 2,0638 |

La cuantizacion a int8 cuesta +0,0018 bpc. Para contextualizar, el cambio de corpus de solo ficcion a dieta mixta aporto 0,086 bpc en la misma metrica, de modo que cuantizar cuesta aproximadamente una quincuagesima parte de lo que aporto la eleccion de datos. Cada configuracion se entreno con una sola semilla, por lo que el autor advierte que debe leerse como un resultado solido sobre la dieta de datos y no como un margen medido con precision.

## Requisitos de hardware

- **VRAM estimada**: inferior a 1 GB en cualquier configuracion. El artefacto int8 ocupa 17,3 MB en disco y el fp32 68,0 MB; los requisitos de memoria en tiempo de ejecucion son del orden de decenas o pocos cientos de megabytes, dominados por las activaciones y el buffer de logits (8192 clases por posicion).
- **GPU recomendadas**: ninguna en particular. El modelo esta pensado para CPU y para WebAssembly en el navegador. Cualquier GPU consumer (GTX 1050 en adelante, RTX 4090, A100, H100) lo ejecuta sin ser el cuello de botella.
- **Cabe en GPU consumer**: si, en todas, y tambien en CPU de portatil y en el navegador.
- **Opciones de despliegue**: `onnxruntime` en Python, `onnxruntime-web` en navegador, y cualquier runtime compatible con ONNX (entre ellos `onnxruntime` con ejecucion en CPU o GPU). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- **Latencia y throughput**: no se publican cifras. La model card solo indica que, con contexto de 256 tokens, el recomputo completo por token es suficientemente rapido en un navegador. El grafo carece de cache KV, por lo que el coste por token no decrece con la longitud del prefijo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **gpt-alpha-bg-14m-onnx** | 13,77 M | 256 tokens | GPT desde cero, búlgaro, ONNX int8 para navegador | MIT | Hugging Face, 29 descargas |
| Hermano solo-libros (glassbox) | 29,37 M | no disponible | GPT desde cero, corpus de ficcion | no disponible | Referenciado en la model card; no se proporciona enlace |
| Modelo anterior de la era libros (glassbox) | 29,36 M | no disponible | GPT desde cero, corpus de ficcion | no disponible | Referenciado en la model card; no se proporciona enlace |
| Hermano de 91,26 M (glassbox) | 91,26 M | no disponible | GPT desde cero, búlgaro; 92,3 % de preferencia emparejada en pares reales error/correccion | no disponible | Referenciado en la model card; no se proporciona enlace |

Los tres comparadores pertenecen al mismo autor y se citan en la model card como terminos de referencia. No se dispone de datos para comparar con modelos búlgaros de terceros.

## Limitaciones y advertencias

- **No conoce hechos**: la propia model card lo ilustra con el ejemplo "Столицата на България е" continuado como "Столицата на България е най-добрата част от населението на България". Genera búlgaro fluido y gramatical, pero falso. No debe usarse como fuente de informacion.
- **Riesgo alto de alucinacion**: con 13,77 M de parametros y 300 M de tokens vistos una sola vez, no hay capacidad de almacenar conocimiento factual. Cualquier uso que dependa de veracidad requiere verificacion externa.
- **Contexto muy limitado**: 256 tokens. No admite conversaciones largas, documentos extensos ni razonamiento multi-paso.
- **Un solo idioma**: solo búlgaro. No se declara competencia en otras lenguas.
- **Sin ajuste por instrucciones**: es un modelo de modelado de lenguaje, no un asistente. No responde a formato conversacional ni a directrices.
- **Reproducibilidad entre backends**: los kernels int8 de wasm y CPU de ONNX Runtime difieren hasta 0,12 en un logit. Sobre 72 pasos greedy eso cambio exactamente un argmax, con margen de 0,028, y un unico cambio redirige toda la continuacion. La salida greedy identica entre backends no esta garantizada, ni en este modelo ni en ningun modelo int8. Para reproducibilidad, conviene condicionar cada paso sobre un prefijo fijo y comparar distribuciones en lugar de cadenas muestreadas.
- **Evaluacion no verificada**: las metricas del `model-index` estan marcadas como `verified: false` y provienen de una sola semilla por configuracion.
- **Licencia**: MIT, permisiva y compatible con uso comercial. No obstante, el corpus de entrenamiento (`hasankursun/bulgarian-corpus-33b`) tiene sus propias condiciones, que no se detallan en la informacion disponible y que conviene revisar antes de un uso comercial.
- **Nomenclatura confusa**: los ficheros se llaman `bg15m` por el nombre interno del checkpoint (`ckpt_bg15m`), mientras que el nombre del repositorio redondea a 14m; el recuento real es 13.772.172 parametros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/glassbox/gpt-alpha-bg-14m-onnx
- Demostracion en vivo en el navegador: https://restorer-interp-lab.iksnerd.workers.dev/live-lm
- Dataset de entrenamiento: https://huggingface.co/datasets/hasankursun/bulgarian-corpus-33b
- Dataset de evaluacion: https://huggingface.co/datasets/thebogko/bulgarian-grammar-mistakes
