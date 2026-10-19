# BeardedMonster/SabiBERTa-135M-masakhaner2-sna

## Resumen

SabiBERTa-135M-masakhaner2-sna es un checkpoint de clasificación de tokens (reconocimiento de entidades nombradas, NER) obtenido al ajustar el modelo `BeardedMonster/SabiBERTa-135M` sobre el corpus MasakhaNER 2.0 para el idioma shona (código ISO `sna`). Lo publica el usuario BeardedMonster como parte del harness de evaluación de su proyecto, cuyo objetivo es reproducir los resultados publicados de MasakhaNER 2.0 en lenguas africanas con modelos encoder de tamaño reducido. El resultado declarado es un span F1 medio de 0,8845 sobre el protocolo sna.

El modelo tiene 135.883.017 parámetros y emplea una arquitectura de tipo ModernBERT (transformer bidireccional encoder-only, según la etiqueta `modernbert` del repositorio). El repositorio ocupa 0,5 GB y contiene únicamente pesos en safetensors; no se publican variantes cuantizadas ni artefactos ONNX. La ventana de contexto no se documenta, aunque el ajuste se realizó con `max_length = 256`.

Su relevancia es acotada pero concreta: cubre una lengua de bajos recursos (shona, hablada principalmente en Zimbabue) con un modelo pequeño que cabe en cualquier GPU de consumo e incluso en CPU, lo que facilita el despliegue de extracción de entidades en producción sin infraestructura especializada. Ahora bien, el checkpoint no incluye pipeline declarado, licencia explícita ni validación comunitaria (0 descargas, 0 likes en el momento de la consulta), por lo que debe tratarse como un artefacto de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer bidireccional encoder-only, según etiqueta `modernbert`) |
| Parametros totales | 135.883.017 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible; el ajuste se realizó con `max_length = 256` |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors) |
| Idiomas soportados | Shona (`sna`) |
| Licencia | No disponible; la model card remite a la licencia del modelo base `BeardedMonster/SabiBERTa-135M` |
| Formato de pesos | safetensors |
| Tarea | Token classification (NER), `AutoModelForTokenClassification` |
| Dataset de ajuste | MasakhaNER 2.0, protocolo `sna` |
| Etiquetas | `id2label` configurado; las predicciones se decodifican directamente a nombres de etiqueta |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

El modelo es un encoder bidireccional de la familia ModernBERT con 135,9 millones de parámetros, ajustado desde `BeardedMonster/SabiBERTa-135M`. Se entrena como clasificador de tokens con una cabeza lineal sobre las representaciones del encoder, usando el esquema de etiquetado BIO de MasakhaNER 2.0 para shona. Los hiperparámetros declarados son 50 épocas, tasa de aprendizaje 5e-05, batch size 32 y longitud máxima de secuencia 256.

La model card no detalla la composición del corpus de preentrenamiento del modelo base ni si se aplicaron técnicas de alineación (RLHF/DPO), algo por otra parte poco habitual en encoders NER. Sí se explicita la metodología de evaluación: el harness del proyecto reproduce los baselines publicados de MasakhaNER 2.0 con una tolerancia de aproximadamente 0,25 F1, de modo que las cifras están calibradas frente a la literatura y no son ad hoc. La puntuación presentada procede de una única ejecución, mientras que los artículos de referencia promedian cinco, por lo que diferencias pequeñas deben considerarse ruido estadístico. El fichero `metrics.json` del repositorio contiene los desgloses por idioma.

## Capacidades

- Reconocimiento de entidades nombradas en shona: identificación de personas, organizaciones, localizaciones y fechas según el esquema de MasakhaNER 2.0.
- Clasificación de tokens a nivel de span, con decodificación directa a nombres de etiqueta gracias al `id2label` incluido.
- Integración nativa con `transformers` mediante `AutoTokenizer` y `AutoModelForTokenClassification`.
- Ejecución en lotes con secuencias de hasta 256 tokens, el límite usado en el ajuste.
- No dispone de generación de texto, razonamiento, código, matemáticas ni visión: es un encoder discriminativo.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- Capacidad multilingüe limitada al shona; no se documenta transferencia a otras lenguas.
- No se documentan modos especiales (thinking mode, audio, etc.).

## Casos de uso

- Extracción de entidades en prensa digital en shona: procesar artículos y extraer nombres de personas, organizaciones y lugares para alimentar un índice de búsqueda o un sistema de seguimiento de actualidad, aprovechando que el modelo está ajustado específicamente al dominio periodístico de MasakhaNER.
- Anonimización de datos personales: detectar menciones de personas y localizaciones en textos en shona antes de almacenarlos o compartirlos con terceros, en cumplimiento de políticas de protección de datos; el tamaño reducido permite ejecutarlo en el mismo servidor de ingesta.
- Preanotación asistida para equipos de etiquetado: generar etiquetas automáticas que los anotadores humanos revisan, reduciendo el coste de construir corpus NER en shona con un span F1 de referencia de 0,8845.
- Enriquecimiento de corpus para NLP de bajos recursos: producir datos etiquetados que sirvan para entrenar o evaluar otros modelos en shona, o para estudiar transferencia entre lenguas africanas.
- Monitorización de menciones de marcas y entidades públicas: rastrear redes sociales y foros en shona para detectar organizaciones y figuras públicas, con despliegue en CPU si el volumen es moderado.
- Construcción de grafos de conocimiento locales: extraer entidades y sus tipos de documentos administrativos o registros históricos en shona para poblar una base de datos relacional o un grafo.
- Filtrado y clasificación previa en pipelines de datos: descartar o enrutar documentos según las entidades detectadas antes de pasarlos a modelos mayores y más costosos.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Notas |
|---|---|---|---|
| MasakhaNER 2.0 (`sna`) | span F1 | 0,8845 | Media sobre 1 idioma; ejecución única según la model card |
| MMLU, HumanEval, GSM8K | No aplica | No disponible | El modelo es un encoder NER, no un modelo generativo |

Los desgloses por idioma están en `metrics.json`, pero su contenido no se ha facilitado en la información disponible. El harness de evaluación reproduce los baselines publicados con una tolerancia de ~0,25 F1; al tratarse de una sola ejecución, las comparaciones con papers que promedian cinco ejecuciones deben interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,55 GB en FP32 (135,9 M de parámetros) y ~0,27 GB en FP16, más activaciones; en la práctica, menos de 1,5 GB con lotes moderados.
- GPU recomendadas: cualquiera con al menos 2 GB de VRAM; funciona en RTX 3050, RTX 4060, T4, L4, A10G, A100 y H100 sin aprovechar su capacidad.
- Cabe holgadamente en GPU de consumo e incluso en CPU: con secuencias de 256 tokens, la inferencia por CPU es viable para volúmenes moderados.
- Opciones de despliegue: `transformers` (pipeline de token classification), exportación a ONNX Runtime para inferencia optimizada, TorchServe o FastAPI con batching. No se publican artefactos GGUF ni compatibilidad declarada con llama.cpp u Ollama, y vLLM/TGI no son la vía natural para un encoder de clasificación.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en MasakhaNER 2.0 (sna) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SabiBERTa-135M-masakhaner2-sna | 135,9 M | No disponible (ajuste a 256) | span F1 0,8845 (ejecución única) | No disponible | HuggingFace, safetensors |
| SabiBERTa-135M (base, sin ajustar) | 135,9 M | No disponible | No disponible (no ajustado a NER) | No disponible | HuggingFace |
| XLM-RoBERTa-base | 278 M | 512 | No disponible en la información proporcionada | MIT | HuggingFace, ampliamente desplegado |
| mBERT (bert-base-multilingual-cased) | 178 M | 512 | No disponible en la información proporcionada | Apache-2.0 | HuggingFace, ampliamente desplegado |

No se dispone de cifras comparativas verificadas de los baselines multilingües sobre el protocolo `sna` en la información proporcionada; cualquier comparación de rendimiento con este checkpoint requeriría ejecutar el mismo harness de evaluación.

## Limitaciones y advertencias

- Sesgos: al entrenarse sobre un corpus periodístico anotado, el modelo puede infrapredecir entidades en registros coloquiales, dialectos del shona o dominios distintos (medicina, legal, redes sociales).
- Riesgo de error en spans: es un modelo discriminativo, por lo que no alucina texto, pero sí puede generar entidades espurias o límites de span incorrectos; el F1 de 0,8845 implica un margen de error no despreciable en producción.
- Cobertura lingüística única: solo se ha validado en `sna`; no hay evidencia de que funcione en otras lenguas africanas ni en textos con mezcla de idiomas.
- Límite de longitud: el ajuste se hizo con `max_length = 256`; secuencias más largas requieren truncado o segmentación con ventana deslizante, lo que puede fragmentar entidades.
- Licencia: no se declara licencia propia y la model card remite a la del modelo base `BeardedMonster/SabiBERTa-135M`. Es imprescindible verificar esos términos antes de cualquier uso comercial.
- Validación estadística débil: una sola ejecución, sin intervalos de confianza ni promedio sobre semillas; diferencias de pocas décimas de F1 frente a otros modelos no son concluyentes.
- Falta de metadatos operativos: sin `pipeline_tag`, sin métricas de latencia y con 0 descargas, el checkpoint no cuenta con validación independiente de la comunidad.
- Ausencia de variantes cuantizadas: no hay GGUF ni ONNX publicados, por lo que la optimización para despliegue corre a cargo del usuario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BeardedMonster/SabiBERTa-135M-masakhaner2-sna
- Modelo base: https://huggingface.co/BeardedMonster/SabiBERTa-135M
- Dataset citado en la model card (referencia, no enlazado por el autor): https://huggingface.co/datasets/masakhane/masakhaner2
- No se han encontrado enlaces adicionales relevantes en la búsqueda web: los resultados devueltos no guardan relación con el modelo ni con NER en lenguas africanas.
