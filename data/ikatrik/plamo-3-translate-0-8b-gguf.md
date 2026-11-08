# ikatrik/plamo-3-translate-0.8b-GGUF

## Resumen

PLaMo 3 Translate 0.8B GGUF es una recopilación de cuantizaciones en formato GGUF del modelo de traducción PLaMo 3 Translate 0.8B, desarrollado originalmente por Preferred Networks (PFN) a partir de PLaMo 3 NICT, un modelo preentrenado fruto de la investigación conjunta entre PFN y el National Institute of Information and Communications Technology (NICT) de Japón. Esta variante concreta, publicada por el usuario independiente ikatrik, no es un lanzamiento oficial de PFN, sino un derivado que empaqueta dos cuantizaciones optimizadas para llama.cpp.

El modelo base es un LLM especializado en traducción de aproximadamente 890 millones de parámetros (0,8B), con una arquitectura transformer de 16 capas y una ventana de contexto que el autor del GGUF emplea con `-c 16384` en sus ejemplos de uso. Su relevancia radica en que ofrece traducción multilingüe de alta calidad en un tamaño muy reducido, lo que permite ejecutarlo en CPU y en dispositivos móviles (el autor cita un Sony Xperia 1 V con Snapdragon 8 Gen 2), algo poco habitual en modelos de traducción con cobertura de más de 50 idiomas.

El interés técnico de esta ficha se centra en las dos cuantizaciones propuestas: una Q4_K_S con la matriz de salida reducida a Q5_K (528,5 MB) y una GSQ-Q4_0-MLP (503,8 MB) que aplica un método de ajuste de pesos cuantizados (GSQ) para mantener la fidelidad de la salida por capa, pensada para velocidad en dispositivos Arm con extensión i8mm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (16 capas, según el desglose de tensores de la model card) |
| Parametros totales | 890.344.960 (dato real de safetensors) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible como especificación oficial; el autor usa `-c 16384` en los ejemplos de llama-server |
| Tipos de cuantizacion | Q4_K_S (con salida Q5_K) y GSQ-Q4_0-MLP (atención Q4_K, MLP Q4_0 entrenado con GSQ, embedding y salida Q4_K) |
| Idiomas soportados | ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | plamo-community-license (other) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base PLaMo 3 Translate 0.8B es un transformer de aproximadamente 0,8B de parámetros (890.344.960 exactos según los pesos en safetensors del repositorio base) con 16 capas, según el desglose de tensores que documenta la model card (blk 0–15). Está construido sobre PLaMo 3 NICT, un modelo preentrenado desarrollado conjuntamente por PFN y NICT, y posteriormente especializado en traducción. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; esa información no está disponible en el material proporcionado.

En cuanto a las innovaciones de esta variante GGUF, la cuantización GSQ-Q4_0-MLP aplica GSQ, un método que reajusta los pesos ya cuantizados sobre un pequeño conjunto de datos para que la salida de cada capa se mantenga próxima a la del modelo original. La cuantización Q4_K_S-small-output parte de la Q4_K_S estándar de llama.cpp y reduce la matriz de salida de Q6_K a Q5_K, ahorrando unos 22 MB respecto a los 550,5 MB de la Q4_K_S estándar. La plantilla de chat embebida es idéntica a la del GGUF oficial de pfnet, y el modelo admite opciones de traducción como glosarios, texto circundante y estilo llano o cortés mediante el formato de prompt PFML3.

## Capacidades

- Traducción multilingüe entre más de 50 idiomas, con especial foco en el japonés como lengua de destino (en→ja, zh→ja, ko→ja, fr→ja) y origen (ja→en).
- Traducción condicionada por idioma objetivo mediante `chat_template_kwargs` con la clave `target_lang`.
- Soporte de opciones de traducción avanzadas a través del formato de prompt PFML3: glosarios, texto circundante y control de estilo (llano o cortés).
- Interfaz conversacional compatible con la API de chat completions de llama.cpp (`llama-server` con `--jinja`).
- Compatible con endpoints (tag `endpoints_compatible` del repositorio).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Traducción de documentación técnica japonés→inglés: el modelo está evaluado específicamente en ja→en sobre WMT23 (200 casos) y puede integrarse en pipelines de localización para traducir documentación de producto con temperatura 0 y salida determinista.
- Localización de contenido web a decenas de idiomas: con cobertura de más de 50 lenguas, sirve para generar versiones iniciales de artículos o páginas que luego revisa un traductor humano, reduciendo coste frente a APIs comerciales.
- Traducción en dispositivos móviles sin conexión: la cuantización GSQ-Q4_0-MLP (503,8 MB) está pensada para velocidad en Arm con i8mm, y el autor la midió en un Xperia 1 V con Snapdragon 8 Gen 2, lo que habilita traducción local en apps Android de gama alta.
- Procesamiento por lotes en CPU: al ser un modelo de 0,8B en GGUF, puede ejecutarse con llama.cpp en servidores sin GPU para traducir grandes volúmenes de texto (por ejemplo, subtítulos o correos) con coste de infraestructura mínimo.
- Traducción con glosario en entornos corporativos: el soporte de glosarios vía PFML3 permite forzar terminología consistente en manuales técnicos o textos legales, manteniendo la coherencia terminológica entre documentos.
- Traducción de conversaciones multilingües en atención al cliente: el modelo puede traducir mensajes entrantes de usuarios en idiomas como árabe, hindi o vietnamita al inglés o al japonés antes de pasarlos a un agente o a otro sistema, usando la API de chat de llama-server.
- Pre-traducción para revisión humana (MTPE): dado su tamaño reducido y su calidad cercana a la cuantización Q4_K_M de referencia, encaja como primer paso automático en flujos de traducción asistida por ordenador.

## Benchmarks y rendimiento

La model card del GGUF proporciona una evaluación sobre 739 casos (200 en→ja y 200 ja→en de WMT24++/WMT23, 120 zh→ja, 120 ko→ja, 80 fr→ja y 19 escritos a mano), con generación greedy en CPU con llama.cpp. La tabla compara las cuantizaciones con Q8_0 y con la Q4_K_M oficial de pfnet.

| Modelo | KLD vs Q8_0 | Top-1 match | Judge score | COMET-22 | chrF++ |
|---|---:|---:|---:|---:|---:|
| Q8_0 | — | — | — | 0.8538 | 37.37 |
| pfnet Q4_K_M | 0.0231 | 95.4% | 77.34 | 0.8528 | 37.07 |
| Q4_K_S-small-output | 0.0270 | 95.7% | 77.20 | 0.8538 | 37.08 |
| GSQ-Q4_0-MLP | 0.0290 | 95.6% | 77.07 | 0.8545 | 37.18 |

Notas metodológicas de la model card: la KLD y el Top-1 match se calculan sobre 296 casos con teacher forcing sobre la salida greedy de Q8_0; el judge score es una puntuación ciega de 0 a 100 de Claude promediada sobre dos pasadas independientes (578 casos válidos). La diferencia de judge score respecto a pfnet Q4_K_M con intervalo de confianza bootstrap del 95% es de −0,14 [−0,81, +0,52] para Q4_K_S-small-output y de −0,27 [−0,99, +0,43] para GSQ-Q4_0-MLP. En los 12 casos escritos a mano restantes tras eliminar 7 con salidas idénticas, Q4_K_S-small-output obtiene +1,31 [−0,94, +3,62] y GSQ-Q4_0-MLP −4,46 [−10,79, +0,56]. COMET-22 usa Unbabel/wmt22-comet-da y chrF++ usa sacrebleu CHRF con word_order=2, calculados sobre 724 casos.

En velocidad, la model card mide en un Xperia 1 V (Snapdragon 8 Gen 2, 5 hilos) el tiempo total de 30 traducciones, con 3 ejecuciones y rotación del orden de modelos, además de pp512 (procesado de un prompt de 512 tokens) y tg64 (generación de 64 tokens). La tabla de velocidad aparece truncada en la información disponible; el autor afirma que GSQ-Q4_0-MLP fue el más rápido de los tres medidos, incluido pfnet Q4_K_M. Los datos numéricos de esa tabla no están disponibles.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para los pesos en Q4 (528,5 MB para Q4_K_S-small-output y 503,8 MB para GSQ-Q4_0-MLP); el consumo real de memoria incluye el contexto KV y el overhead de llama.cpp, por lo que conviene reservar al menos 1–2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede alojar el modelo; no se especifican modelos concretos en la información disponible. El autor midió el rendimiento en CPU (Snapdragon 8 Gen 2), no en GPU.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (por ejemplo, GTX 1650, RTX 3060, RTX 4090) por su tamaño inferior a 1 GB en Q4.
- Opciones de despliegue: llama.cpp mediante `llama-server` (comando documentado en la model card con `-c 16384 --jinja --no-prefill-assistant`); también existen cuantizaciones GGUF de terceros como mradermacher/plamo-3-translate-0.8b-GGUF. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: la model card incluye métricas pp512 y tg64 medidas en un Xperia 1 V, pero los valores numéricos no están disponibles en el extracto proporcionado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---:|---|---|---|---|
| ikatrik/plamo-3-translate-0.8b-GGUF (este) | 0,89B | no disponible (ejemplo con 16K) | GGUF (Q4_K_S-small-output, GSQ-Q4_0-MLP) | plamo-community-license | Derivado independiente, no oficial |
| pfnet/plamo-3-translate-0.8b-GGUF | 0,89B | no disponible | GGUF (Q4_K_M de referencia) | plamo-community-license | Cuantización oficial de PFN; referencia de calidad en la evaluación |
| mradermacher/plamo-3-translate-0.8b-GGUF | 0,89B | no disponible | GGUF | plamo-community-license | Otra cuantización de terceros del mismo modelo base |
| PLaMo 3 Translate 0.8B (modelo base) | 0,89B | no disponible | safetensors | plamo-community-license | Modelo original de PFN sin cuantizar |

No se dispone de datos de benchmarks de modelos comparables de otros fabricantes en la información proporcionada; la única comparación cuantitativa disponible es la de la propia model card entre cuantizaciones del mismo modelo.

## Limitaciones y advertencias

- Este repositorio es un derivado independiente de ikatrik y no un lanzamiento oficial de Preferred Networks; la calidad y el mantenimiento dependen del autor del GGUF.
- La evaluación se realizó sobre documentos de la misma fuente que los datos usados para la importance matrix y para GSQ (aunque excluyendo las frases de test), por lo que las puntuaciones pueden ser superiores a las obtenidas en documentos no relacionados.
- La cuantización GSQ-Q4_0-MLP obtuvo 4,46 puntos menos de judge score que la Q4_K_M oficial en los 12 casos escritos a mano, con un intervalo de confianza que incluye el 0 pero con muestra pequeña; conviene validarla con texto propio antes de confiar en ella.
- El modelo está especializado en traducción; no se documentan capacidades de razonamiento general, código, matemáticas, tool calling ni agentes, por lo que no debe emplearse como LLM de propósito general.
- No se dispone de información sobre sesgos conocidos, tasas de alucinación ni comportamiento en contextos muy largos más allá del ejemplo con 16K tokens.
- La licencia plamo-community-license impone condiciones específicas para uso comercial; es necesario revisar el texto completo de la licencia (enlace en la model card) antes de desplegar el modelo en producción.
- La cobertura de idiomas es amplia (más de 50), pero la evaluación publicada se centra en direcciones con japonés (en→ja, zh→ja, ko→ja, fr→ja, ja→en); el rendimiento en otras combinaciones no está cuantificado en la información disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción aún muy limitada.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/ikatrik/plamo-3-translate-0.8b-GGUF
- Modelo base en Hugging Face: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- GGUF oficial de PFN: https://huggingface.co/pfnet/plamo-3-translate-0.8b-GGUF
- Cuantización alternativa de mradermacher: https://huggingface.co/mradermacher/plamo-3-translate-0.8b-GGUF
- Licencia PLaMo Community License (inglés): https://plamo.preferredai.jp/info/plamo-community-license-en
- llama.cpp: https://github.com/ggml-org/llama.cpp
