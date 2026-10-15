# ngiftsun/indictrans2-indic-en-int8-mobile

## Resumen

Este repositorio no contiene un modelo nuevo, sino un reempaquetado cuantizado de **IndicTrans2 indic-en distilled 200M** de AI4Bharat, preparado por el usuario `ngiftsun` para traducción **índico→inglés en dispositivo** (offline). El paquete parte de la exportación comunitaria a ONNX de `hari31416`, aplica cuantización dinámica int8 (per-channel) sobre los pesos de MatMul y de la capa de embeddings (Gather), y reduce el peso de 915 MB a 333 MB manteniendo la calidad declarada por el autor.

El modelo resuelve un problema muy concreto: traducción neuronal de hindi y tamil a inglés sin conexión, con latencia y huella de memoria compatibles con un teléfono Android o con un portátil modesto. Está pensado como componente de una app de subtítulos en directo (Subtle), por lo que incluye tres grafos ONNX separados (encoder, decoder de primer paso y decoder con caché KV) y un tokenizador aplanado en ficheros de texto plano para carga rápida en móvil.

La relevancia actual viene de su perfil de despliegue: cuantización int8 con calidad declarada idéntica al modelo en coma flotante y una mejora de velocidad de aproximadamente 2× en CPU, además de superar claramente a Google ML Kit offline en la única evaluación publicada (chrF 67,9 frente a 57,4 en hindi→inglés sobre FLEURS). No hay datos publicados sobre arquitectura interna detallada, longitud de contexto ni composición del corpus de entrenamiento original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (IndicTrans2), exportado a ONNX en tres grafos: encoder, decoder (primer paso) y decoder_with_past (pasos posteriores con caché KV). Detalle interno no disponible |
| Parametros totales | ~200 M (modelo base `ai4bharat/indictrans2-indic-en-dist-200M`; no se indica el recuento exacto del paquete cuantizado) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinámica per-channel sobre pesos MatMul y Gather (embeddings). El export original en coma flotante está disponible por separado |
| Idiomas soportados | hindi (hin_Deva), tamil (tam_Taml) e inglés (eng_Latn). Dirección cubierta: índico→inglés. Etiquetas de idioma obligatorias en el prompt (`hin_Deva eng_Latn <texto>`) |
| Licencia | MIT (modelo original AI4Bharat, export ONNX y paquete) |
| Formato de pesos | ONNX (encoder_model.onnx 121 MB, decoder_model.onnx 111 MB, decoder_with_past_model.onnx 101 MB). Tokenizador en texto plano: `src_vocab.txt`, `src_merges.txt`, `tgt_vocab.txt`, `it2.properties`, `it2_meta.json` (6,5 MB) |
| Tamano del repo | 1,9 GB en HuggingFace, aunque los ficheros listados en la model card suman ~340 MB; la diferencia corresponde a artefactos no detallados |
| Libreria de inferencia | onnxruntime |
| Dataset de evaluacion citado | google/fleurs |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card es explícita: **no es un modelo nuevo ni reentrenado**. Se trata del modelo destilado de 200 M de parámetros de IndicTrans2 para la dirección indic→inglés, convertido a ONNX y cuantizado. La estructura de grafos (encoder independiente, decoder para el primer paso y decoder con `past_key_values` para los pasos siguientes) es la habitual en exportaciones encoder-decoder para decodificación autoregresiva con caché KV, y permite reutilizar el estado de atención sin recalcular el prefijo en cada token.

El único proceso de "entrenamiento" declarado es el propio pipeline de conversión: (1) exportación ONNX de la comunidad, (2) cuantización dinámica int8 per-channel de pesos MatMul y Gather, con reducción de 915 MB a 333 MB, (3) aplanado del tokenizador SentencePiece/BPE a ficheros de texto (una línea por id, una línea por rango BPE) junto a `it2.properties` e `it2_meta.json` con tamaños de diccionario e ids especiales y de etiquetas de idioma. No se documentan tokens de entrenamiento, composición del dataset, ni fases de RLHF/DPO/alineación; esos datos pertenecen al modelo original de AI4Bharat (Gala et al., TMLR 2023) y no se reproducen aquí.

La innovación destacable del paquete es de ingeniería de despliegue, no de modelado: preprocesado específico (normalización de puntuación, conversión de dígitos devanagaris a ASCII, separación de letras nukta como ड़ → ड + ़, espaciado alrededor de signos), tokenización NFKC por piezas, decodificación greedy desde `decoder_start_id` (2) hasta `</s>`, y un port a Kotlin/JVM que reproduce la salida de la implementación de referencia en Python en 40 de 40 frases de prueba.

## Capacidades

- Traducción automática offline hindi→inglés y tamil→inglés, con etiquetas de idioma explícitas en la entrada.
- Ejecución completamente local: no requiere red ni claves de API, lo que habilita escenarios con datos sensibles o sin conectividad.
- Inferencia incremental con caché KV mediante `decoder_with_past_model.onnx`, lo que reduce el coste por token generado en frases largas.
- Decodificación greedy determinista, reproducible entre la implementación Python y el port Kotlin.
- Preprocesado robusto para texto ruidoso de ASR o de entrada informal (normalización de puntuación, dígitos y nukta).
- Empaquetado orientado a móvil: tokenizador en texto plano para carga rápida y pesos int8 de 333 MB totales.
- Portabilidad multiplataforma vía ONNX Runtime (Android, JVM/desktop, Python; potencialmente otros runtimes compatibles).
- **No** soporta: generación de texto libre, razonamiento multi-paso, código, matemáticas, tool calling / function calling, uso como agente, visión, audio ni modo "thinking". Es exclusivamente un traductor seq2seq.
- Capacidades multilingües limitadas a los dos idiomas de origen empaquetados (hi, ta) y al inglés como destino.

## Casos de uso

- **Subtítulos en directo en el dispositivo**: es el caso de uso original (app Subtle). El modelo traduce cada fragmento reconocido por ASR de hindi o tamil a inglés sin enviar audio ni texto a la nube, con ~0,34 s por frase en CPU de portátil a 2 hilos y 333 MB de pesos, lo que permite mantener la traducción en tiempo casi real dentro de la app.
- **Aplicaciones Android sin permiso de red**: apps de asistencia en campo, salud comunitaria o trámites donde la política de privacidad prohíbe enviar contenido del usuario a servidores externos. El paquete está pensado explícitamente para `onnxruntime` en Android.
- **Traducción de documentos en zonas sin conectividad**: ONG, periodismo local o equipos de respuesta humanitaria que trabajan con material en hindi o tamil y necesitan una versión inglesa en un portátil sin internet, aceptando una calidad algo inferior a la de un servicio en la nube.
- **Enriquecimiento de corpus para pipelines de ML**: traducción masiva y determinista de texto índico a inglés como paso previo a anotación, indexación o búsqueda semántica, ejecutable en CPU y sin coste por token.
- **Integración en cadenas ASR + MT embebidas**: al ser tres grafos ONNX independientes con caché KV, encaja bien detrás de un motor de reconocimiento de voz local, formando un pipeline de subtitulado o transcripción bilingüe completo en el dispositivo.
- **Traducción en navegador o escritorio**: al ser ONNX, puede desplegarse en runtimes de escritorio (Python, JVM, .NET) o en web con ONNX Runtime Web para páginas o visores de documentos en hindi/tamil que necesiten una traducción de apoyo sin backend.
- **Kioscos y terminales de atención al público**: pantallas de autoservicio en aeropuertos, hospitales o administraciones que deban mostrar instrucciones en inglés a partir de entradas en hindi o tamil, con la garantía de que el texto del usuario no sale del dispositivo.
- **Evaluación comparativa offline de traducción**: útil como referencia reproducible en bancos de prueba de MT en dispositivo, comparando contra Google ML Kit o contra el mismo modelo en coma flotante bajo las mismas condiciones.

## Benchmarks y rendimiento

Única evaluación publicada en la model card: hindi→inglés sobre el split dev de FLEURS `hi_in`, comparado contra las traducciones humanas `en_us` y con entrada hindi correcta.

| Traductor | chrF | Velocidad (CPU de portatil) |
|---|---|---|
| Google Cloud Translation (online) | 70,3 (50 frases) | no disponible |
| IndicTrans2 float offline (mismo modelo) | 67,9 (50 frases) | ~0,92 s/frase |
| Este paquete (int8, offline) | 67,9 (50 frases) | ~0,34 s/frase, 2 hilos |
| Google ML Kit (offline, en telefono) | 57,4 (25 frases) | no disponible |
| IndicTrans2 en las mismas 25 frases de ML Kit | 66,1 | no disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de LLM, ya que no es un modelo de lenguaje generativo. Tampoco hay cifras publicadas para tamil→inglés ni para otros splits de FLEURS.

## Requisitos de hardware

- **VRAM/RAM estimada**: los pesos int8 suman ~333 MB (encoder 121 MB + decoder 111 MB + decoder_with_past 101 MB) más ~6,5 MB de tokenizador. Con activaciones, caché KV y runtime, el consumo realista se sitúa en torno a 0,5-1 GB de memoria, aunque el autor no publica una cifra medida de pico.
- **GPU**: no necesaria. El paquete está optimizado para CPU (`onnxruntime`), con cuantización pensada para acelerar la ejecución en CPU. No hay datos publicados de rendimiento en A100, H100, RTX 4090 ni de ejecución con CUDA/TensorRT.
- **GPU de consumo**: irrelevante para este modelo; cabe de sobra en cualquier GPU de consumo, pero no aporta ventaja frente a CPU para 200 M de parámetros.
- **Móvil y dispositivos de borde**: el destino principal. Diseñado para Android (ONNX Runtime, presumiblemente con XNNPACK) y viable en cualquier dispositivo con varios cientos de MB libres. El autor no publica latencias medidas en teléfono.
- **Latencia y throughput**: ~0,34 s por frase en CPU de portátil con 2 hilos (~3 frases/s) y ~0,92 s por frase para la versión en coma flotante, es decir, aproximadamente 2,7× más rápido tras la cuantización. La mejora de velocidad declarada frente al float es de ~2×.
- **Opciones de despliegue**: ONNX Runtime en Python, Kotlin/JVM (port incluido por el autor) y Android. No aplican vLLM, TGI, llama.cpp ni Ollama: es un encoder-decoder seq2seq con tokenizador propio y preprocesado específico, no un LLM con plantilla de chat.

## Comparativa con modelos similares

| Alternativa | Parametros | Contexto | chrF (hi→en, FLEURS) | Licencia | Despliegue |
|---|---|---|---|---|---|
| Este paquete (IndicTrans2 int8 ONNX) | ~200 M (int8) | no disponible | 67,9 | MIT | Offline, on-device, CPU |
| IndicTrans2 indic-en dist 200M float (ONNX / PyTorch) | ~200 M (fp32) | no disponible | 67,9 | MIT | Offline, CPU o GPU; ~0,92 s/frase en portátil |
| Google ML Kit Translation (offline en telefono) | no disponible | no disponible | 57,4 | Propietaria | Offline, integrado en Android/iOS |
| Google Cloud Translation | no disponible (servicio) | no disponible | 70,3 | Propietaria, de pago | Online, requiere red y API key |

No se dispone de datos comparativos publicados frente a NLLB-200, MADLAD-400 u otros traductores índicos en esta misma evaluación, por lo que no se incluyen cifras.

## Limitaciones y advertencias

- **Dirección única**: solo índico→inglés. No traduce inglés→hindi/tamil ni entre hindi y tamil. Solo están empaquetados los idiomas hi y ta, aunque el modelo original cubra más lenguas índicas.
- **Traducción literal**: el propio autor advierte de que los errores de reconocimiento de la entrada hindi se propagan a la salida, mientras que Google Cloud tiende a repararlos por contexto. En pipelines ASR+MT esto amplifica los fallos del reconocedor.
- **Calidad por debajo de la nube**: 67,9 chrF frente a 70,3 de Google Cloud Translation en el mismo conjunto, con 2,4 puntos de diferencia.
- **Sin datos de robustez**: no hay evaluación publicada en tamil→inglés, dominios técnicos, jerga, texto informal ni entradas largas. Tampoco se documenta la longitud máxima de secuencia ni el comportamiento al superarla.
- **Requisitos de preprocesado**: hay que replicar exactamente la normalización (dígitos devanagaris, nukta, puntuación) y las etiquetas de idioma; omitirlas degrada la calidad. La tokenización y el detokenizado son manuales, no hay `tokenizer.json` estándar ni integración con `transformers`.
- **Riesgo de alucinación**: al ser decodificación greedy condicionada, puede producir traducciones fluidas que no correspondan al original en entradas ruidosas o ambiguas; no hay mecanismo de abstención ni puntuación de confianza expuesta.
- **Sesgos**: no documentados por el autor. Al provenir de un corpus mayoritariamente de dominio público y noticias (vía el modelo original de AI4Bharat), es esperable un sesgo de dominio y posibles sesgos de género o culturales no evaluados; no hay análisis publicado.
- **Licencia**: MIT, permisiva y apta para uso comercial, pero obliga a mantener el aviso de copyright y a citar el trabajo de AI4Bharat al usar el modelo original.
- **Madurez del repositorio**: 0 descargas y 0 "likes" en HuggingFace, sin validación por parte de la comunidad. La calidad declarada se apoya en una única evaluación de 50 frases realizada por el propio autor.
- **Verificación de integridad**: no se publican hashes ni firmas de los ficheros ONNX. Al ser un artefacto binario de terceros, conviene auditar el grafo antes de integrarlo en producción.
- **Discrepancia de tamaños**: el repositorio declara 1,9 GB pero la model card solo describe ~340 MB de ficheros, por lo que puede haber artefactos adicionales no documentados que conviene revisar antes de descargar en un dispositivo móvil.
- **Sin soporte de lotes ni de `past_key_values` en formato estándar de `transformers`**: la gestión manual del caché complica la integración con servidores de inferencia convencionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ngiftsun/indictrans2-indic-en-int8-mobile
- Perfil del autor: https://huggingface.co/ngiftsun
- Modelo base original: https://huggingface.co/ai4bharat/indictrans2-indic-en-dist-200M
- Export ONNX de partida (MIT): https://huggingface.co/hari31416/indictrans2-indic-en-dist-200M-ONNX
- Dataset de evaluación FLEURS: https://huggingface.co/datasets/google/fleurs
- Paper de referencia citado en la model card: Gala et al., "IndicTrans2: Towards High-Quality and Accessible Machine Translation Models for all 22 Scheduled Indian Languages", TMLR 2023 — https://arxiv.org/abs/2301.13823
- Repositorio de la app Subtle (implementaciones de referencia `tools/asr-bench/it2lite.py` e `it2/IndicTrans2.kt`): URL no disponible; la model card solo menciona el nombre del repositorio, sin enlace
- Búsquedas web realizadas: no devolvieron ningún resultado relevante sobre este modelo ni sobre IndicTrans2 int8 para móvil; los resultados obtenidos eran contenido no relacionado.
