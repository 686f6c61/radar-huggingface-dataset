# Awesome-x/voxira-phaseXII-acoustic

## Resumen

Voxira Phase XII (acoustic) es un modelo de reconocimiento automático del habla (ASR) desarrollado por Awesome-x, un fine-tune de `facebook/wav2vec2-large-xlsr-53` orientado a la transcripción de yoruba, inglés y, de forma destacada, habla con cambio de código (code-switching) yoruba-inglés. El modelo emplea una arquitectura wav2vec2 con cabecera CTC (`Wav2Vec2ForCTC`) y 315 millones de parámetros, y se distribuye bajo licencia Apache 2.0 en formato safetensors.

Esta fase se distingue de las anteriores (Phase X y XI) en que entrena nuevos pesos acústicos en lugar de reutilizarlos: se congelaron el extractor convolucional y las 12 capas transformer inferiores, y se actualizaron las capas superiores y la cabecera `lm_head`, que se expandió de 46 a 47 salidas. El entrenamiento cubrió 10 épocas y 2.950 pasos sobre una mezcla de Google FLEURS yoruba, FLEURS inglés y el corpus YECS de code-switching.

El modelo se publica como checkpoint puramente acústico, sin modelo de lenguaje KenLM incorporado: todas las salidas documentadas corresponden a decodificación CTC voraz (greedy). Es relevante para quienes trabajan con lenguas africanas de bajos recursos y con habla bilingüe, un escenario poco cubierto por los modelos ASR comerciales, aunque el propio autor advierte de que aún no hay cifras de precisión y de que el modelo no debe considerarse listo para producción sin evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (`Wav2Vec2ForCTC`), transformer con extractor convolucional de características y cabecera CTC |
| Parametros totales | 315.486.895 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; entrada debe ser audio mono a 16 kHz) |
| Tipos de cuantizacion | no disponible (el repo solo incluye safetensors en precisión original) |
| Idiomas soportados | yoruba (yo), inglés (en), yoruba-inglés code-switching |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de `facebook/wav2vec2-large-xlsr-53`, un transformer preentrenado de forma autosupervisada sobre 53 idiomas. En este fine-tune se congelaron el extractor convolucional de características y las 12 capas transformer inferiores, con la intención declarada de preservar las representaciones cross-lingües del modelo base; solo se actualizaron las capas transformer superiores y la cabecera `lm_head`. Antes del entrenamiento, el script detectó que `pad_id` (46) coincidía con el tamaño de la matriz (46) y expandió `lm_head` en una fila, resultando en `lm_head.weight` de forma `[47, 1024]` y `lm_head.bias` de forma `[47]`; el `config.json` debe declarar `"vocab_size": 47` para que el modelo cargue sin errores de forma.

El entrenamiento consistió en 10 épocas y 2.950 pasos de optimización, con un tiempo de pared de 5:47:44 sobre multi-GPU en Kaggle, partiendo de los pesos base (no se encontró checkpoint previo del Trainer). Los datos fueron una mezcla de Google FLEURS yoruba (`yo_ng`), FLEURS inglés (`en_us`) y el corpus YECS de code-switching yoruba-inglés; la card no registra las horas por fuente ni las proporciones de mezcla. La pérdida de validación descendió de 5,21 en el paso 500 a 2,46 en el paso 2.500, pero la mejora por cada 500 pasos se redujo de 1,62 a 0,11, y el entrenamiento terminó por presupuesto fijo de épocas, no por criterio de parada; no hay evaluación registrada en el paso final (2.950). Se reservaron 55 clips (`AR_Audios`) como conjunto de evaluación no visto, pero esa evaluación aún no se ha ejecutado.

## Capacidades

- Reconocimiento automático del habla (transcripción) en yoruba e inglés, incluyendo habla con cambio de código yoruba-inglés dentro de una misma emisión.
- Producción de transcripciones en mayúsculas y sin puntuación (salida CTC greedy).
- Manejo de palabras yoruba con marcas tonales (por ejemplo, `BÁWÒÒNÍ GBOGBO NKAN`) junto a palabras inglesas en la misma salida.
- Entrada de audio mono a 16 kHz.
- No incluye modelo de lenguaje: la decodificación es CTC voraz (`argmax`) y el KenLM está pendiente.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo puramente ASR).
- No soporta visión, audio de salida ni modo de razonamiento (thinking).

## Casos de uso

- Transcripción de conversaciones bilingües yoruba-inglés: el modelo está entrenado específicamente con el corpus YECS de code-switching, por lo que puede transcribir emisiones en las que el hablante alterna entre ambos idiomas, un escenario que los ASR monolingües suelen fallar.
- Subtitulado y documentación de contenido audiovisual nigeriano: para materiales en yoruba o con mezcla de inglés, el modelo puede generar borradores de transcripción que después se revisan y puntúan manualmente, dado que la salida carece de puntuación y mayúsculas mixtas.
- Investigación en lenguas africanas de bajos recursos: sirve como checkpoint acústico de partida para experimentos de fine-tuning o para comparar estrategias de congelación de capas y mezcla de datos en ASR de bajos recursos.
- Anotación asistida de corpus: puede predecir transcripciones preliminares sobre audio yoruba/inglés que luego se corrigen, acelerando la creación de datos etiquetados para entrenar modelos posteriores.
- Prototipado de asistentes de voz para servicios locales: integrado en un pipeline con un modelo de lenguaje externo, podría transcribir consultas de usuarios bilingües antes de pasarlas a un sistema de comprensión, siempre con revisión humana en dominios sensibles.
- Evaluación comparativa de decodificadores: al publicarse sin KenLM, permite medir el efecto de añadir un modelo de lenguaje (por ejemplo, el KenLM de 4 gramos de Phase XI) frente a la decodificación greedy sobre el mismo checkpoint acústico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se ha ejecutado ninguna evaluación de precisión sobre un conjunto retenido y que las comprobaciones de escucha son tres clips elegidos a mano, no un benchmark. Se reproducen a continuación las pérdidas de entrenamiento y validación registradas:

| Paso | Pérdida de entrenamiento | Pérdida de validación |
|---|---|---|
| 500 | 11,866803 | 5,210579 |
| 1000 | 8,790150 | 3,593741 |
| 1500 | 6,799892 | 2,816854 |
| 2000 | 6,284078 | 2,569384 |
| 2500 | 5,873839 | 2,456798 |

Las comprobaciones informales de escucha (3 clips, decodificación greedy, sin modelo de lenguaje) muestran salidas como `IG IVENI[UNK] BÁWÒÒNÍ GBOGBO NKAN[UNK] WANT TO DO TO HE MARKET TO BIE OM S[UNK]` para la frase pretendida "Good evening, báwo ni gbogbo nkan, I want to go to the market to buy some…". Estas salidas no constituyen una medida de precisión.

## Requisitos de hardware

- VRAM estimada para inferencia: con 315 millones de parámetros en precisión original (fp32), los pesos ocupan aproximadamente 1,26 GB; en fp16, unos 0,63 GB. El repo ocupa 2,5 GB, lo que incluye otros artefactos además de los pesos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre puede alojar el modelo en fp16, incluyendo tarjetas de consumo como la RTX 3060, RTX 4060 o superiores; para lotes grandes o despliegue concurrente se recomiendan A100, H100 o L4.
- Cabe en GPU de consumo: sí, en la mayoría de GPU consumer modernas con 4 GB o más de VRAM.
- Opciones de despliegue: transformers (librería nativa del repo), vLLM no aplica de forma estándar para ASR CTC, TGI no soporta este pipeline de forma directa; para CPU o entornos ligeros puede convertirse a ONNX o emplear implementaciones de wav2vec2 en llama.cpp no disponibles de forma nativa. El despliegue natural es `transformers` con `Wav2Vec2ForCTC`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Voxira Phase XII (acoustic) | 315 M | yoruba, inglés, code-switching | audio mono 16 kHz | Apache 2.0 | Hugging Face (0 descargas) |
| facebook/wav2vec2-large-xlsr-53 | 315 M | 53 idiomas (preentrenamiento) | audio mono 16 kHz | Apache 2.0 | Hugging Face, ampliamente usado |
| Voxira Phase XI (decoder) | 315 M (pesos acústicos idénticos a Phase X) | yoruba, inglés | audio mono 16 kHz | Apache 2.0 | Hugging Face |
| Voxira Phase X (baseline) | 315 M | yoruba, inglés | audio mono 16 kHz | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo (WER, CER) entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, idiomas, licencia y disponibilidad.

## Limitaciones y advertencias

- No hay cifras de precisión: no se ha ejecutado ninguna evaluación de reconocimiento sobre un conjunto retenido para este checkpoint.
- Aparición de `[UNK]` en la salida greedy; la causa no se ha aislado. Una hipótesis no verificada es que ciertos caracteres o puntuación de las transcripciones de entrenamiento no estaban en el vocabulario y se mapearon a `[UNK]` durante la tokenización.
- Desajuste entre filas de salida y vocabulario: `lm_head` tiene 47 filas pero `vocab.json` define los ids 0-45 (46 entradas); el tokenizador decodifica la fila 46 como `<pad>`.
- Errores ortográficos fonéticos en inglés dentro del code-switching cuando no hay modelo de lenguaje (por ejemplo, `ACOUNT BAANC`, `HELTH`, `ORNNOUT`).
- Entrenamiento detenido por presupuesto fijo de 10 épocas, no por convergencia; la mejora de validación se estaba aplanando.
- No evaluado en: telefonía a 8 kHz, ruido de fondo intenso, hablantes solapados, pidgin nigeriano (no es objetivo) ni otras lenguas nigerianas (no son objetivos).
- La entrada debe ser audio mono a 16 kHz.
- Sin puntuación ni distinción de mayúsculas: la salida son letras mayúsculas sin puntuación.
- No es un modelo de verificación de hablante; no debe usarse una transcripción como prueba de identidad (KYC).
- Se recomienda revisión humana para acciones legales, médicas y financieras derivadas de una transcripción.
- Licencias de datos: debe comprobarse la licencia de cada fuente de entrenamiento (FLEURS, YECS) para el caso de uso concreto, aunque los pesos se distribuyan bajo Apache 2.0.
- El modelo es un checkpoint acústico sin modelo de lenguaje; el KenLM y la evaluación independiente están pendientes según el autor.

## Enlaces

- Hugging Face: https://huggingface.co/Awesome-x/voxira-phaseXII-acoustic
- Modelo base: https://huggingface.co/facebook/wav2vec2-large-xlsr-53
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Repositorio de transformers: https://github.com/huggingface/transformers
- Paper de wav2vec 2.0 (referencia del base): https://arxiv.org/abs/2006.11477
- Paper de XLSR (referencia del base): https://arxiv.org/abs/2006.13979
