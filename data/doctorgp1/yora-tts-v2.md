# Doctorgp1/yora-tts-v2

## Resumen

yora-tts-v2 es un modelo de síntesis de voz (text-to-speech) para el idioma yoruba, desarrollado por Godspower Uyanga (Senior Data Scientist) y publicado bajo el identificador `Doctorgp1/yora-tts-v2`. Se trata de un modelo VITS entrenado desde cero (no fine-tuned) sobre el corpus BibleTTS Yoruba (OpenSLR SLR129), compuesto por aproximadamente 25 horas de narración de un único locutor en estudio. Su principal aportación es que, al no derivar de los pesos de `facebook/mms-tts-yor` (licencia CC BY-NC 4.0, no comercial), sus pesos son utilizables comercialmente bajo CC-BY-SA-4.0, lo que lo convierte en una opción viable para proyectos de producción en yoruba.

La versión v2 se ha reentrenado a 22 050 Hz (frente a los 16 000 Hz de la v1) para mejorar la fidelidad del audio, y se ha ejecutado hasta convergencia completa en 800 125 pasos (925 épocas). El checkpoint seleccionado es el paso 775 000, que obtuvo la mejor inteligibilidad medida (CER 11,5 %). El modelo tiene 36,3 millones de parámetros y una ventana de contexto de 49 tokens de vocabulario a nivel de caracteres, incluyendo letras yoruba, diacríticos tonales y puntuación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (conditional VAE + normalizing flow + HiFi-GAN decoder + stochastic duration predictor) |
| Parametros totales | 36 286 704 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 49 tokens de vocabulario (a nivel de caracteres) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | yoruba (yo) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial Training for end-to-end Text-to-Speech), que combina un VAE condicional, un flujo normalizante, un decodificador basado en HiFi-GAN y un predictor de duración estocástico. El generador tiene 36,3 millones de parámetros, con un tamaño oculto de 192, 6 capas transformer, 2 cabezas de atención, dimensión FFN de 768 y 4 capas de flujo. El vocabulario se construyó desde cero con 49 tokens que cubren letras yoruba, diacríticos tonales y signos de puntuación, sin reutilizar tokenizadores preentrenados.

El entrenamiento se realizó desde cero (inicialización aleatoria) sobre el corpus BibleTTS Yoruba (OpenSLR SLR129), con una única locutora de calidad de estudio y aproximadamente 25 horas de audio. Se utilizó una función de pérdida combinada de GAN, KL, mel y duración, con optimizador AdamW, tasa de aprendizaje 2e-4 con decaimiento exponencial por época, y un total de 800 125 pasos (925 épocas) en una sola GPU. El checkpoint final elegido es el paso 775 000, que mostró la mejor inteligibilidad medida (CER 11,5 %), en lugar del último paso (800 125) que obtuvo un CER ligeramente peor (12,4 %), algo esperable en entrenamiento GAN cerca de la convergencia.

## Capacidades

- Generacion de voz en yoruba a partir de texto, con marcas tonales cuando estan disponibles.
- Sintesis de audio a 22 050 Hz, con calidad de estudio para narracion leida.
- Soporte de inferencia mediante la API de Transformers (`VitsModel` y `AutoTokenizer`).
- No realiza traduccion: requiere un traductor externo (p. ej. NLLB-200) para entrada en ingles.
- No soporta seleccion de voz ni clonado de voz (un solo locutor).
- No maneja texto con codigo alternado (code-switching) ni caracteres fuera del vocabulario.

## Casos de uso

- **Narracion de audiolibros en yoruba**: el modelo puede generar audio de alta fidelidad a partir de texto literario o religioso, aprovechando su entrenamiento en narracion leida de la Biblia. Es adecuado para producir audiolibros con una voz consistente y formal.
- **Contenido educativo en yoruba**: creacion de materiales de aprendizaje de idiomas, lecciones de historia o cultura yoruba, con pronunciacion correcta de tonos y diacriticos. La salida a 22 kHz permite una reproduccion clara en plataformas educativas.
- **Sistemas de informacion publica**: generacion de anuncios o avisos en yoruba para emisoras de radio, altavoces en estaciones o servicios publicos, donde se requiere una locucion formal y comprensible.
- **Asistentes de voz para comunidades yoruba**: integracion en aplicaciones de asistencia por voz (p. ej. lectores de noticias, recordatorios) que necesiten una voz natural en yoruba sin depender de servicios en la nube con licencias restrictivas.
- **Investigacion en TTS para lenguas africanas**: el modelo sirve como punto de partida para experimentos de fine-tuning o como referencia de calidad para otros sistemas de sintesis en yoruba, gracias a su licencia permisiva y a su arquitectura documentada.
- **Prototipado de aplicaciones comerciales**: dado que la licencia CC-BY-SA-4.0 permite uso comercial (con atribucion y share-alike), desarrolladores pueden integrar el modelo en productos comerciales sin las restricciones de los modelos derivados de MMS de Meta.

## Benchmarks y rendimiento

La model card reporta la inteligibilidad medida como character error rate (CER) sobre un conjunto fijo de 15 frases de validacion de BibleTTS, transcritas con un ASR independiente (`facebook/mms-1b-all`). Los resultados por checkpoint son:

| Checkpoint (paso) | CER |
|---|---|
| 126 000 (mitad del entrenamiento) | 24,5 % |
| 300 000 | 15,6 % |
| 700 000 | 12,5 % |
| 775 000 (mejor, usado) | 11,5 % |
| 800 125 (paso final) | 12,4 % |

No se han publicado resultados de benchmarks comparativos con otros modelos TTS en yoruba (como MMS-TTS-Yor) en la informacion disponible. El CER es una metrica proxy de inteligibilidad, no una puntuacion de naturalidad humana.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al tratarse de un modelo de 36,3 millones de parametros, la inferencia es ligera. En FP32, el modelo ocupa aproximadamente 145 MB de memoria (36,3 M × 4 bytes). Con cuantizacion a FP16 o int8, el uso de VRAM seria inferior a 100 MB.
- **GPU recomendadas**: cualquier GPU con al menos 1 GB de VRAM es suficiente, incluyendo GPUs integradas o de gama baja (p. ej. NVIDIA GTX 1050, RTX 2060, o incluso Apple Silicon). No se requieren GPUs de datacenter.
- **Compatibilidad con consumer GPU**: si, cabe en cualquier GPU de consumo actual y tambien en CPU (inferencia en CPU posible, aunque mas lenta).
- **Opciones de despliegue**: al ser compatible con Transformers, se puede desplegar con Hugging Face Inference Endpoints, o mediante scripts propios con PyTorch. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo sino de TTS.
- **Latencia y throughput estimados**: no se proporcionan datos oficiales. Dado el tamano del modelo, se espera una latencia de decenas de milisegundos por frase en GPU moderna, y de unos pocos cientos de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Muestreo | Licencia | Entrenamiento | Uso comercial |
|---|---|---|---|---|---|
| **yora-tts-v2** | 36,3 M | 22 050 Hz | CC-BY-SA-4.0 | Desde cero sobre BibleTTS Yoruba | Permitido (con atribucion y share-alike) |
| **facebook/mms-tts-yor** | no disponible | 16 000 Hz (tipico) | CC BY-NC 4.0 | Fine-tune de MMS | No permitido (solo no comercial) |
| **coqui/XTTS-v2** | ~467 M (aprox.) | 24 000 Hz | CPML (no comercial) | Multilingue, clonado de voz | No permitido (licencia restrictiva) |

La comparativa se basa en datos publicos. yora-tts-v2 destaca por su licencia comercialmente utilizable y por estar entrenado especificamente para yoruba, mientras que XTTS-v2 es multilingue pero con restricciones de uso. MMS-TTS-Yor es el modelo mas similar en proposito, pero su licencia no comercial limita su adopcion en produccion.

## Limitaciones y advertencias

- **Un solo locutor**: no hay seleccion de voz ni clonado; la voz es fija y de estilo formal (narracion leida).
- **Prosodia limitada**: al entrenarse exclusivamente con narracion de escrituras, la prosodia refleja un estilo medido y formal, no conversacional.
- **Riesgo de alucinacion fonetica**: el modelo puede producir audio ininteligible en textos fuera de su dominio (p. ej. jerga tecnica o nombres propios no vistos), aunque el CER reportado es bajo en el conjunto de validacion.
- **Sin manejo de code-switching**: el comportamiento con texto que mezcla yoruba e ingles u otros idiomas no esta definido.
- **Caracteres fuera de vocabulario**: el comportamiento con caracteres no incluidos en los 49 tokens es indefinido.
- **Licencia ShareAlike**: aunque el uso comercial esta permitido, la clausula ShareAlike de CC-BY-SA-4.0 podria propagarse a los pesos del modelo segun interpretaciones legales no resueltas. Se recomienda revision legal antes de desplegar en entornos regulados (banca, sanidad, gobierno).
- **Metrica de calidad**: el CER es una proxy de inteligibilidad, no una medida de naturalidad; se recomienda escucha humana antes de uso en produccion.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Doctorgp1/yora-tts-v2)
- [Dataset BibleTTS Yoruba (OpenSLR SLR129)](https://www.openslr.org/129/)
- [Pagina de XTTS-v2 en Hugging Face](https://huggingface.co/coqui/XTTS-v2) (referencia comparativa)
- [Repositorio de TTS_v2 (Coqui)](https://github.com/Exoshiva/TTS_v2) (herramientas relacionadas)
