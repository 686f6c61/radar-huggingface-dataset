# hamsyah/cekhoaxid-v4

## Resumen

CekHoax ID v4 es un modelo de clasificación de texto en indonesio especializado en la detección de bulos (hoax), desarrollado por el usuario hamsyah. Se trata de un fine-tuning de IndoBERT base (indobenchmark/indobert-base-p1) con una cabeza de clasificación binaria de dos etiquetas: 0 = válido y 1 = hoax. El modelo está pensado para integrarse en una API de verificación de mensajes, con un umbral operativo de p_hoax >= 0.5 para clasificar como bulo y una banda de incertidumbre entre 0.4 y 0.6 definida a nivel de producto.

La versión v4 es una iteración correctiva sobre v3 centrada en dos mensajes concretos de WhatsApp (V3, sobre el BLT El Niño, y V7, sobre el Polres Malang) que v3 clasificaba erróneamente como hoax con alta confianza. El autor añadió 24 mensajes dirigidos (12 válidos y 12 hoax) sobre esos mismos temas y deduplicó el conjunto de entrenamiento. El resultado, según la propia model card, es que la corrección no logró invertir esas dos predicciones, por lo que el modelo mantiene 18/20 aciertos en el conjunto de prueba de WhatsApp.

El modelo es relevante como ejemplo de iteración documentada con transparencia sobre datos, métricas y fallos residuales, y como caso práctico de clasificación binaria de desinformación en un idioma de bajos recursos como el indonesio. Su tamaño (124 millones de parámetros) y su licencia Apache 2.0 lo hacen desplegable en infraestructura modesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT), fine-tuning de indobenchmark/indobert-base-p1 |
| Parametros totales | 124.442.882 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (max_length de entrenamiento); longitud nativa del backbone no especificada en la informacion disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors en precision de entrenamiento; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | Indonesio (id) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un BERT encoder de la familia IndoBERT (indobenchmark/indobert-base-p1) con una cabeza de clasificación de secuencias de dos etiquetas. La clasificación es binaria: 0 = válido, 1 = hoax. El entrenamiento se realizó durante 3 épocas, con batch de 16, learning rate 2e-5, longitud máxima de 256 tokens y `num_labels=2` explícito, totalizando 1.647 pasos y una pérdida de entrenamiento final de 0,0305.

Los datos de entrenamiento de v4 combinan tres fuentes: 10.000 artículos (8.000 train / 1.000 val / 1.000 test, con 5.000 válidos y 5.000 hoax), 844 mensajes cortos de v3 (453 válidos, 391 hoax) y 24 mensajes dirigidos nuevos de v4 (12 válidos, 12 hoax). Tras deduplicar por texto normalizado se eliminaron 97 duplicados exactos (todos hoax: 50 filas de train_snippet y 47 filas hoax), quedando 8.771 filas de entrenamiento (4.465 válidas, 4.306 hoax). El autor verificó que no hay solapamiento entre los datos de entrenamiento y los 20 mensajes de prueba de WhatsApp. No se documenta uso de RLHF ni DPO; se trata de un fine-tuning supervisado convencional.

## Capacidades

- Clasificación binaria de texto en indonesio: distingue entre contenido válido y hoax.
- Salida de probabilidad por clase (prob_valid y prob_hoaks), lo que permite aplicar umbrales y bandas de incertidumbre en la capa de API.
- Manejo de dos tipos de entrada: artículos periodísticos largos (hasta 256 tokens) y mensajes cortos tipo WhatsApp.
- Diseñado para integrarse en un pipeline de verificación con banda de incertidumbre (0,4 < p < 0,6 = uncertain).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un clasificador, no un modelo generativo.
- No tiene capacidades multimodales (visión, audio) ni modo thinking.
- Capacidad multilingüe limitada al indonesio; no se documenta rendimiento en otros idiomas.

## Casos de uso

- Moderación de grupos de WhatsApp y cadenas de reenvío: el modelo clasifica mensajes cortos en indonesio y devuelve una probabilidad de hoax, adecuado para marcar mensajes antes de que se viralicen. Su entrenamiento incluye explícitamente mensajes cortos, no solo artículos.
- Verificación de titulares y snippets de medios: con 10.000 artículos en entrenamiento y métricas altas in-domain (F1 hoax 0,998), puede prefiltrar titulares sospechosos en un CMS editorial antes de la revisión humana.
- API de fact-checking con banda de incertidumbre: el umbral 0,5 y la banda 0,4-0,6 permiten derivar a revisión humana los casos dudosos en lugar de forzar una etiqueta binaria, útil en productos de verificación.
- Filtrado previo en pipelines de curación de noticias: clasificar grandes volúmenes de texto indonesio para descartar contenido hoax antes de indexarlo en un agregador o buscador.
- Investigación sobre desinformación en indonesio: modelo de referencia reproducible (licencia Apache 2.0, pesos safetensors) para experimentos de clasificación binaria y análisis de sesgos temáticos.
- Clasificación por lotes en infraestructura modesta: con 124 millones de parámetros cabe en una GPU consumer y permite procesar lotes de mensajes con latencia baja en CPU o GPU pequeña.
- Detección de temáticas concretas (por ejemplo, ayudas sociales o sucesos locales): aunque el autor documenta un fallo residual en dos casos, el modelo puede servir como base para fine-tunings adicionales sobre dominios específicos.

## Benchmarks y rendimiento

| Benchmark | v4 | v3 (referencia en la model card) |
|---|---|---|
| In-domain test (n=1000): accuracy | 0,998 | 0,997 |
| In-domain test: precision hoax | 1,0 | no disponible |
| In-domain test: recall hoax | 0,996 | no disponible |
| In-domain test: F1 hoax | 0,998 | no disponible |
| In-domain test: F1 macro | 0,998 | no disponible |
| Cross-source Tempo (n=2604): accuracy | 0,9996 | 1,0 |
| Cross-source Tempo: F1 hoax | 0,9995 | no disponible |
| Cross-source Tempo: F1 macro | 0,9996 | no disponible |
| Validación (mejor época 3): F1 hoax | 0,9960 | no disponible |
| Validación (mejor época 3): accuracy | 0,996 | no disponible |
| WhatsApp test (20 mensajes): aciertos | 18/20 (0,9) | 18/20 (0,9) |
| WhatsApp test: válidos correctos | 8/10 | 8/10 |
| WhatsApp test: hoax correctos | 10/10 | 10/10 |

Matrices de confusión documentadas: in-domain [[500, 0], [2, 498]]; cross-source [[1604, 0], [1, 999]].

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 0,5 GB en fp32 para los 124 millones de parámetros; en fp16 aproximadamente 0,25 GB, más el overhead de activaciones y tokenizador. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre (GTX 1650, RTX 3060, RTX 4090, T4, A100, H100). El modelo no aprovecha GPUs de gama alta por su tamaño.
- Cabe en consumer GPU: sí, en todas las GPU modernas e incluso en CPU para lotes pequeños.
- Opciones de despliegue: transformers (AutoModelForSequenceClassification), con `num_labels=2` explícito al cargar; también es compatible con pipelines de inferencia de Hugging Face y con servidores de clasificación estándar. No se documentan artefactos GGUF ni ONNX en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia de milisegundos por secuencia en GPU y de decenas de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CekHoax ID v4 | 124,4 M | 256 tokens (entrenamiento) | Clasificación binaria hoax en indonesio | Apache 2.0 | Hugging Face (hamsyah/cekhoaxid-v4) |
| IndoBERT base p1 | ~124 M | 512 tokens (arquitectura BERT base) | Modelo base de lenguaje en indonesio | no disponible en la información | Hugging Face (indobenchmark/indobert-base-p1) |
| CekHoax ID v3 | no disponible | 256 tokens (entrenamiento) | Clasificación binaria hoax en indonesio | Apache 2.0 | Hugging Face (versión anterior del mismo autor) |
| CekHoax ID v2 | no disponible | no disponible | Clasificación binaria hoax en indonesio | no disponible | Hugging Face (versión anterior del mismo autor) |

No se dispone de datos de benchmarks de modelos de terceros comparables en la información proporcionada; los únicos puntos de comparación documentados son las versiones anteriores del propio modelo.

## Limitaciones y advertencias

- El conjunto de prueba de WhatsApp es muy pequeño (20 mensajes); 18/20 no es una estimación robusta de rendimiento en producción.
- Dos mensajes válidos (V3 y V7) siguen clasificándose como hoax con alta confianza (p_hoaks 0,9997 y 0,9996), y el autor reconoce que la corrección dirigida de v4 no los invirtió.
- Los 24 mensajes dirigidos son datos sintéticos/redactados por el autor; su distribución puede diferir de mensajes reales de WhatsApp y representan una señal pequeña frente a 8.771 filas de entrenamiento.
- Riesgo de sesgo temático y de entidad: el autor documenta que ciertos temas y entidades (BLT, El Niño, Polres Malang) tienen desequilibrio en los datos de entrenamiento, lo que puede producir falsos positivos en noticias válidas sobre esos temas.
- Riesgo de sobreajuste a las fuentes de entrenamiento: las métricas in-domain y cross-source (F1 cercano a 1,0) son sospechosamente altas y no se trasladan al conjunto de WhatsApp real, lo que sugiere una brecha entre distribución de entrenamiento y uso real.
- El `config.json` guarda el número de etiquetas como `_num_labels`, por lo que es necesario cargar el modelo con `num_labels=2` explícito para evitar errores.
- Modelo monolingüe (indonesio); no debe usarse para clasificar texto en otros idiomas.
- Es un clasificador binario, no un generador: no puede explicar sus decisiones ni citar fuentes; cualquier uso en producción debe acompañarse de revisión humana, especialmente en la banda de incertidumbre.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene conservar los avisos de licencia y verificar las condiciones de los datos de entrenamiento originales (artículos de medios y mensajes), que no se detallan en la model card.
- No se documentan evaluaciones de sesgo demográfico, robustez ante adversarios ni comportamiento ante texto malformado o con errores ortográficos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hamsyah/cekhoaxid-v4
- Modelo base IndoBERT: https://huggingface.co/indobenchmark/indobert-base-p1
- No se han encontrado en la información disponible papers, blogs, repositorios ni demos adicionales.
