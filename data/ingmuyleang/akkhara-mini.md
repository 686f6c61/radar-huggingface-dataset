# INGMUYLEANG/akkhara-mini

## Resumen

Akkhara-mini es un modelo de traducción especializado en transliteración de *Sing Khmer* (khmer escrito con letras latinas, tal como se usa en chats y mensajería) a escritura khmer nativa. Lo desarrolla Ing Muyleang y se publica bajo licencia Apache-2.0. Se trata de un modelo T5 encoder-decoder entrenado desde cero, con 17,8 millones de parámetros, diseñado explícitamente para ejecutarse en CPU, teléfonos y teclados sin GPU.

El modelo resuelve un problema muy concreto del ecosistema khmer: la entrada de texto en dispositivos móviles mediante romanización informal. A diferencia de su hermano mayor (akkhara-byt5-small, 300M parámetros), Akkhara-mini opera sobre caracteres individuales en lugar de bytes, con un vocabulario de 243 tokens que cubre latín, khmer, dígitos y puntuación, de modo que cada letra khmer supone un único paso de decodificación.

Su relevancia actual radica en la eficiencia: es 17 veces más pequeño y entre 9 y 13 veces más rápido en CPU que el modelo de 300M, manteniendo una precisión comparable en conversaciones reales (64% top-1 y 79% top-5 en el conjunto de chat real). Está pensado como backend de teclados (IME), extensiones de navegador y servidores de bajo coste, devolviendo una lista clasificada de cinco candidatos para que el usuario elija.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder estilo T5 (6 capas encoder, 3 capas decoder, d_model 384, 6 cabezas, FFN gated-GELU de 1024, embeddings atados) |
| Parametros totales | 17.797.248 (17,8M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con fragmentos de 2 a 12 palabras; se recomienda trocear en bloques de ~6 palabras) |
| Tipos de cuantizacion | no disponible (pesos en float32, 71 MB) |
| Idiomas soportados | Khmer (km); palabras inglesas en entradas mixtas se conservan en inglés |
| Licencia | Apache-2.0 (acceso con aprobación manual mediante *gated access*) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Akkhara-mini es un Transformer secuencia-a-secuencia de arquitectura T5 entrenado desde inicialización aleatoria, no fine-tuneado. El encoder tiene 6 capas y el decoder 3, con dimensión de modelo 384, 6 cabezas de atención, FFN gated-GELU de 1024 y embeddings atados. La innovación principal es la tokenización a nivel de carácter con un vocabulario de 243 símbolos (latín, khmer, dígitos y puntuación), frente al enfoque basado en bytes del modelo grande; esto reduce a un solo paso de decodificación la generación de cada letra khmer, en lugar de tres.

El entrenamiento se realizó sobre 327.000 pares sintéticos (Sing Khmer → Khmer), los mismos que la ronda v4 del modelo grande: Wikipedia en khmer (CC BY-SA), MADLAD-400 km (ODC-BY), CC-100 km, unas 5.000 frases de chat generadas por IA con filtrado automático, frases de contraste por plantilla, grafías nativas de hablantes y 405 frases de chat real etiquetadas por un asistente de IA (no publicadas). Se usó objetivo de entropía cruzada con *teacher forcing*, optimizador AdamW con LR 1e-3, 500 pasos de calentamiento, decaimiento lineal y recorte de gradiente 1.0; batch de 384 (128 × 3 GPU en DDP), 12 épocas, 10.236 pasos, precisión bfloat16. El entrenamiento completo llevó unos 12 minutos en 3× RTX 4090.

## Capacidades

- Transliteración de romanización informal khmer (*Sing Khmer*) a escritura khmer nativa.
- Generación de una lista clasificada de hasta 5 candidatos (top-5) mediante búsqueda por haces, pensada para interfaces de selección tipo IME.
- Modo de decodificación voraz (*greedy*) para escritura en tiempo real con latencia mínima.
- Manejo de *code-mixing*: las palabras inglesas presentes en la entrada se mantienen en inglés en la salida.
- Normalización de mensajes de chat antes de pasarlos a otros modelos de PLN en khmer.
- Ejecución en dispositivos sin GPU (CPU, teléfonos, servidores de bajo coste).
- No soporta *tool calling*, agentes, razonamiento multi-paso, visión ni audio según la información disponible.

## Casos de uso

- Teclados móviles e IME en khmer: el modelo actúa como backend que recibe la romanización del usuario y devuelve el top-5 de candidatos; con 19 ms por frase en modo voraz sobre CPU Apple M4 Pro, la latencia es imperceptible durante la escritura.
- Extensiones de navegador para chat web: permite convertir texto romanizado a khmer directamente en el cliente sin enviar datos a un servidor, gracias a sus 71 MB en float32.
- Normalización previa de mensajes en pipelines de PLN: convierte mensajes de chat romanizados a escritura estándar antes de pasarlos a modelos de análisis de sentimiento, clasificación o traducción en khmer.
- Aplicaciones de mensajería en servidores de bajo coste: al ejecutarse en CPU con 4,5 ms por frase en una RTX 4090 por lotes y 35 ms en CPU para top-5, permite desplegar el servicio sin infraestructura GPU.
- Herramientas de accesibilidad y aprendizaje del alfabeto khmer: la lista top-5 expone las ambigüedades (por ejemplo, `ng` → និង / នឹង) y ayuda al usuario a aprender las correspondencias.
- Prototipado e investigación en transliteración: el modelo, pequeño y entrenado desde cero, sirve como línea base reproducible para experimentos de romanización khmer con un coste computacional mínimo (12 minutos en 3× RTX 4090).

## Benchmarks y rendimiento

| Modelo | Params | Test top-1 | Test top-5 | Test CER | Chat real top-1 / top-5 / CER | Glued (7) | Context (11) |
|---|---|---|---|---|---|---|---|
| akkhara-byt5-small v3 | 300M | 57,1% | 73,7% | 4,14% | 64% / 79% / 6,0% | 5 | 10 |
| akkhara-mini v1 | 18M | 53,9% | 71,3% | 5,14% | 64% / 79% / 5,3% | 6 | 10 |

| Medición (CPU Apple M4 Pro, 4 hilos, una frase) | akkhara-byt5-small v3 | akkhara-mini |
|---|---|---|
| Modo escritura (#1, voraz) | 171 ms | 19 ms |
| Top-5 (5 haces) | 463 ms | 35 ms |
| Tamaño | 1,2 GB | 71 MB |

En RTX 4090 con procesamiento por lotes: 4,5 ms por frase. El conjunto de test tiene 7.821 frases retenidas, 33 frases de chat real etiquetadas a mano y dos conjuntos de desafío (palabras cortas pegadas y palabras dependientes del contexto).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (71 MB de pesos más activaciones); no requiere GPU.
- GPU recomendadas: ninguna imprescindible; funciona en CPU. En RTX 4090 alcanza 4,5 ms por frase con lotes.
- Cabe en cualquier GPU de consumo e incluso en dispositivos móviles; también se ejecuta en CPU de portátiles y teléfonos.
- Opciones de despliegue: transformers (AutoModelForSeq2SeqLM), text-generation-inference (etiqueta declarada), endpoints compatibles; no se documentan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: 19 ms por frase en modo voraz y 35 ms para top-5 en CPU Apple M4 Pro con 4 hilos; 4,5 ms por frase en RTX 4090 por lotes.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Precisión chat real (top-1/top-5/CER) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| akkhara-mini | 18M | no disponible | 64% / 79% / 5,3% | Apache-2.0 | HuggingFace (acceso con aprobación) |
| akkhara-byt5-small v3 | 300M | no disponible | 64% / 79% / 6,0% | no disponible | HuggingFace |
| Otros modelos de transliteración khmer | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado mayormente con pares sintéticos procedentes de texto periodístico y enciclopédico más frases de chat generadas por IA; el conjunto de test de chat real solo tiene 33 frases, por lo que la estimación de precisión en conversación real es poco robusta.
- Aproximadamente un punto porcentual más de tasa de error de caracteres que el modelo grande en texto formal.
- Las abreviaturas cortas siguen siendo ambiguas (`ng` puede ser និង o នឹង; también `dl`, `bn`); la respuesta correcta suele estar en el top-5, no necesariamente en la primera posición.
- El modelo conoce palabras malsonantes propias del chat real, lo que puede ser inadecuado en entornos moderados.
- No debe usarse para traducción a otros idiomas ni para texto formal o legal sin revisión humana; para ese caso se recomienda el modelo grande.
- El acceso está restringido mediante aprobación manual del autor (*gated access*), lo que condiciona la disponibilidad inmediata.
- El código de entrenamiento es privado por el momento.
- La licencia Apache-2.0 permite uso comercial, pero la puerta de acceso puede limitar la distribución y el despliegue automatizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/INGMUYLEANG/akkhara-mini
- Modelo hermano mayor: https://huggingface.co/INGMUYLEANG/akkhara-byt5-small
- Demo: https://huggingface.co/spaces/INGMUYLEANG/akkhara-demo
- Dataset: https://huggingface.co/datasets/INGMUYLEANG/akkhara-sing-khmer
