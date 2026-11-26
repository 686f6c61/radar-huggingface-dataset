# LuionTW/embeddinggemma2-finetune

## Resumen

EmbeddingGemma 2 scam classifier es un modelo de clasificación de texto derivado de `google/embeddinggemma-2`, afinado por el usuario LuionTW para detectar mensajes fraudulentos (estafas, smishing y conversaciones de engaño). El modelo añade una cabeza lineal de 768 a 1 sobre el encoder de EmbeddingGemma 2, con calibración de Platt, y se distribuye convertido a Core ML con pesos int8 para ejecución en el dispositivo (iPhone, CPU). Forma parte de NotificationScan, una prueba de concepto de iOS que evalúa mensajes entrantes de SMS, iMessage o LINE sin enviar el texto fuera del teléfono.

El interés técnico reside en su enfoque *on-device*: un encoder de 768 dimensiones compilado como programa multifunción de Core ML (longitudes fijas L128, L512 y L1024), con un tamaño de pesos int8 de aproximadamente 277 MB y una latencia declarada de unos 0,05 s por mensaje en CPU. El modelo está entrenado para tres idiomas (chino, japonés e inglés) y produce tanto una probabilidad calibrada de estafa como un embedding normalizado reutilizable.

Es relevante ahora porque ejemplifica el patrón de "juez de conversación" local para filtrado de fraude, un caso de uso donde la privacidad y la latencia baja son críticos. No obstante, se trata de una prueba de concepto: los umbrales no se han validado con tráfico real y el autor mantiene la aplicación en modo sombra. El repositorio no registra descargas ni interacciones, y la información pública disponible es la de su model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (EmbeddingGemma 2) con cabeza lineal 768 → 1 y calibración de Platt; programa multifunción Core ML (L128, L512, L1024) |
| Parametros totales | no disponible (pesos int8 de aproximadamente 277 MB; el tamaño exacto en parámetros no se declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128, 512 o 1024 tokens según la función seleccionada; entrenamiento con mensajes de hasta 256 tokens y ventanas de hasta 1024 tokens |
| Tipos de cuantizacion | int8 (pesos); el autor desaconseja float16 en Neural Engine por deriva de salidas (similitud coseno aproximada de 0,89) |
| Idiomas soportados | chino (zh-TW), japonés (ja), inglés (en) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | Core ML compilado (`.mlmodelc`), tokenizer en JSON; no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de `google/embeddinggemma-2` (revisión `f9972ac22e696a105c482202646979e33e4b5a1e`) y afina las últimas 4 capas del encoder junto con una cabeza lineal de 768 a 1. El ajuste se realiza sobre mensajes individuales y ventanas de conversación, con parada temprana sobre el conjunto de desarrollo y posterior ajuste de calibración de Platt sobre ese mismo conjunto. Los hiperparámetros declarados son learning rate 2e-5 para el encoder y 1e-3 para la cabeza, batch size 16, 5 % de warmup con decaimiento coseno, mensajes de hasta 256 tokens y ventanas de hasta 1024 tokens.

Los datos de entrenamiento combinan fuentes reales y sintéticas en chino tradicional, japonés e inglés: mensajes de LINE de Cofacts (etiquetas débiles derivadas de tags de temática), UCI SMS Spam Collection, Smishing-Dataset-IMC25, RealPersonaChat, `paulkm/chinese_conversation_and_spam`, ScamBench, diálogos de estafa de BothBosu, phishing SMS de Mendeley y estafas generadas por el proyecto con negativos duros (avisos legítimos de OTP bancario, entregas y similares). Los splits de test son disjuntos del entrenamiento; Cofacts se divide por prefijo de mensaje para evitar que reenvíos casi duplicados queden a ambos lados.

La conversión a Core ML usa cuantización int8 y requiere iOS 18 como mínimo. El autor advierte que las puntuaciones int8 difieren de las de PyTorch hasta en 0,14 en algunas muestras, por lo que los umbrales se fijaron sobre las puntuaciones int8 calculadas en Swift. La inferencia debe ejecutarse en CPU (`MLComputeUnits.cpuOnly`).

## Capacidades

- Clasificación binaria de estafa para un mensaje individual, con salida `p_message` calibrada.
- Clasificación de conversaciones cortas (hasta 10 mensajes entrantes recientes, unidos por saltos de línea), con salida `p_conversation` calibrada.
- Salida de logit crudo antes de calibración (`logit`) para inspección o umbralización propia.
- Generación de embeddings de texto agrupados y normalizados de 768 dimensiones (`embedding`), reutilizables para búsqueda o clustering.
- Umbrales específicos por idioma y por unidad (mensaje o conversación), calibrados a tasas de falsos positivos sobre mensajes legítimos del 1 %, 0,3 %, 0,1 % y 0,01 %.
- Funcionamiento totalmente local en el dispositivo, sin envío de texto a servidores.
- Soporte de tres idiomas: chino tradicional, japonés e inglés.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio; es un clasificador, no un modelo generativo.

## Casos de uso

- Filtrado de smishing en iOS: la app intercepta mensajes de SMS, iMessage o LINE mediante Shortcuts, los puntúa en el dispositivo y muestra una alerta en Dynamic Island solo cuando la probabilidad supera el umbral del idioma; el texto nunca sale del teléfono.
- Detección de estafas conversacionales multi-turno: el modelo evalúa ventanas de hasta 10 mensajes recientes (hasta 1024 tokens) para captar patrones que solo emergen a lo largo de una conversación, como la progresión típica de una estafa romántica o de inversión.
- Moderación local de mensajería empresarial: integrado en un cliente de chat corporativo, puntúa mensajes entrantes de usuarios o proveedores y marca los sospechosos para revisión humana, con la ventaja de que el contenido sensible no abandona el dispositivo del empleado.
- Protección de usuarios vulnerables: despliegue en el teléfono de personas mayores con umbral `trustedAlert` (0,01 % de falsos positivos sobre mensajes legítimos) para alertar ante remitentes desconocidos con alta probabilidad de fraude.
- Investigación y anotación asistida de datasets: el embedding de 768 dimensiones y el logit crudo permiten agrupar mensajes sospechosos, priorizar colas de revisión manual y construir conjuntos etiquetados con menor esfuerzo.
- Filtro previo en pipelines antifraude: como primera etapa de bajo coste y baja latencia (aproximadamente 0,05 s por mensaje en CPU de iPhone) antes de enviar solo los casos dudosos a un clasificador o analista más costoso en servidor.
- Evaluación comparativa de calibración: útil como referencia para estudiar cómo se comportan clasificadores de fraude cuantizados a int8 frente a sus versiones en punto flotante en producción.

## Benchmarks y rendimiento

La model card menciona una evaluación sobre la mitad de test reservada (la otra mitad se usó para fijar umbrales), con recall medido sobre mensajes de estafa y tasa de falsos positivos medida sobre mensajes normales reales, pero el texto público disponible no incluye la tabla de resultados numéricos.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica en el sentido habitual; el modelo está pensado para ejecución en CPU de iPhone. Los pesos int8 ocupan aproximadamente 277 MB.
- GPU recomendadas: no aplica; el autor especifica ejecución en CPU (`MLComputeUnits.cpuOnly`). Con float16 en Neural Engine las salidas se desvían demasiado de la referencia (similitud coseno aproximada de 0,89).
- Cabe en consumer GPU: no es el objetivo de despliegue; el formato Core ML está orientado a Apple Silicon e iOS, no a GPUs NVIDIA.
- Opciones de despliegue: Core ML en iOS 18 o superior; el repositorio incluye `manifest.json` con URL, SHA-256 y tamaño de cada fichero para que la app verifique la descarga. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 0,05 s por mensaje en CPU de iPhone según el autor; no se declaran cifras de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Despliegue |
|---|---|---|---|---|---|---|
| LuionTW/embeddinggemma2-finetune | Clasificador de estafa sobre encoder | no disponible (pesos int8 de unos 277 MB) | 128 / 512 / 1024 tokens | zh, ja, en | CC BY-SA 4.0 | Core ML on-device (iOS 18+) |
| google/embeddinggemma-2 (base) | Encoder de embeddings | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | multilingüe (segun model card del base, no verificable aqui) | segun modelo base (no disponible) | PyTorch, safetensors y ecosistema asociado |
| Clasificadores de spam SMS clásicos (por ejemplo, sobre UCI SMS Spam Collection) | TF-IDF + modelo lineal o Naive Bayes | muy bajo | limitado por longitud del mensaje | generalmente en | variable | CPU, librerías clásicas |

La comparación directa con alternativas modernas de detección de fraude *on-device* no está disponible en la información proporcionada. Frente al encoder base, este modelo añade la cabeza de clasificación y la calibración; frente a clasificadores clásicos de spam, aporta contexto conversacional y multilingüismo, a costa de un tamaño mucho mayor y de la dependencia del ecosistema Core ML.

## Limitaciones y advertencias

- Estado de prueba de concepto: los umbrales no se han validado con tráfico real y la aplicación funciona en modo sombra (registra puntuaciones sin mostrar alertas) hasta que se validen.
- Las puntuaciones no son comparables entre idiomas: el umbral de alerta en japonés ronda 0,05 y el de chino ronda 0,96; usar siempre los valores por idioma de `egemma_thresholds.json`.
- La cuantización int8 introduce desviaciones de hasta 0,14 frente a las puntuaciones de PyTorch en algunas muestras; los umbrales solo son válidos para las puntuaciones int8 calculadas en Swift.
- Cobertura lingüística limitada a chino tradicional, japonés e inglés; no se declara soporte para castellano ni otros idiomas.
- Riesgo de falsos positivos sobre avisos legítimos que imitan el formato de estafa (OTP bancario, notificaciones de entrega), mitigado con negativos duros pero no eliminado.
- Riesgo de falsos negativos ante campañas de estafa con formatos no representados en el entrenamiento, especialmente en chino simplificado, que no figura como idioma soportado.
- Dependencia de datos sintéticos generados con LLM en parte del corpus, lo que puede introducir sesgos de estilo poco realistas.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribución y a compartir las obras derivadas bajo la misma licencia; conviene revisar también las licencias de los datos de entrenamiento citadas en `NOTICE.txt`.
- Requiere iOS 18 o superior y ejecución en CPU; no es desplegable en infraestructura con GPU estándar sin reconversión.
- Repositorio sin descargas ni interacciones registradas; no hay evidencia externa de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LuionTW/embeddinggemma2-finetune
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Dataset Cofacts LINE: https://huggingface.co/datasets/Cofacts/line-msg-fact-check-tw
- UCI SMS Spam Collection: https://archive.ics.uci.edu/dataset/228/sms+spam+collection
- Smishing-Dataset-IMC25: https://github.com/reportsmishing/Smishing-Dataset-IMC25
- RealPersonaChat: https://github.com/nu-dialogue/real-persona-chat
- paulkm/chinese_conversation_and_spam: https://huggingface.co/datasets/paulkm/chinese_conversation_and_spam
- ScamBench: https://huggingface.co/datasets/shaw/scambench-training
- BothBosu scam dialogues: https://huggingface.co/datasets/BothBosu/scam-dialogue
- BothBosu multi-agent scam conversation: https://huggingface.co/datasets/BothBosu/multi-agent-scam-conversation
- Mendeley SMS phishing: https://data.mendeley.com/datasets/vmg875v4xs/1
