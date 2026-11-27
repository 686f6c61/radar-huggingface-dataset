# gowombat/tiny-voca-da

## Resumen

tiny-voca-da es un modelo de síntesis de voz (text-to-speech) para danés, desarrollado por el usuario gowombat a partir del modelo inglés n4ze3m/tiny-voca y del código de carbogninalberto/tiny-voca-it. Se trata de un modelo extremadamente compacto: 6,8 millones de parámetros en total, repartidos entre un modelo de voz de 4,56 M y un vocoder neuronal de 2,22 M, ambos empaquetados en un único grafo ONNX. Su peso es de solo 9,3 MB en cuantización int8 (28 MB en fp32), lo que lo hace apto para despliegue en CPU y dispositivos de borde.

El modelo resuelve el problema de la síntesis de voz en danés de bajo coste computacional, un idioma con relativamente pocos recursos TTS en comparación con el inglés. Se entrenó sobre el corpus CoRal-tts (CC0-1.0) y emplea un frontend de texto a fonemas específico para danés que incluye el stød (la oclusión glotal característica del idioma), construido a partir del léxico de pronunciación NST y un modelo DeepPhonemizer entrenado al efecto.

Es relevante ahora porque demuestra que es posible obtener una voz danesa inteligible con un modelo de menos de 10 MB que corre unas 60 veces más rápido que el tiempo real en dos hilos de CPU. No obstante, el propio autor lo etiqueta como una vista previa de investigación (versión 0.1, 27 de noviembre de 2026) que aún no ha sido revisada por ningún hablante nativo de danés; la corrección se verificó únicamente mediante reconocimiento automático del habla con Whisper large-v3.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo acústico neuronal (4,56 M) + vocoder neuronal con prior de pulso glotal (2,22 M), empaquetados en un único grafo ONNX |
| Parámetros totales | 6,8 M (4,56 M modelo de voz + 2,22 M vocoder) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; procesa fonemas, no texto con ventana de contexto) |
| Tipos de cuantización | int8 (solo pesos MatMul/Gemm) y fp32 |
| Idiomas soportados | danés (da); lectura de frases en inglés mediante eSpeak NG mapeado al inventario fonético danés |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (model-int8.onnx, model.onnx) y PyTorch (voice.pt, vocoder.pt) |
| Frecuencia de muestreo | 24 kHz |
| Voces | una única voz (DA1) |
| Tamaño del repositorio | 0,2 GB |
| Dataset de entrenamiento | CoRal-tts (CC0-1.0), hablante `mic`; 5755 clips de entrenamiento (8,3 h), 293 de validación, 289 de test |

## Arquitectura y entrenamiento

El sistema combina dos componentes neuronales en un solo grafo ONNX. El modelo de voz transforma secuencias de identificadores de fonemas en representaciones acústicas, y el vocoder, un modelo pequeño con prior de pulso glotal, convierte esas representaciones en forma de onda a 24 kHz. El vocoder se destiló de Vocos (132k pasos) y después se ajustó durante 20k pasos sobre la propia salida del modelo de voz, con el objetivo suavizado sobre 9 tramas, para reducir el zumbido (buzz) hasta los niveles de las grabaciones reales. El modelo de voz se entrenó durante 100k pasos con todos los pesos actualizados, con pérdida adversaria a partir del paso 8k y una pérdida de textura espectral por encima de 1 kHz hasta el paso 180k; los últimos 40k pasos (220k en total) se hicieron sobre etiquetas del frontend v4.

El frontend de texto a fonemas (v4) es una pieza central del diseño y maneja el stød. Se apoya en el léxico de pronunciación danés NST (CC0); para las palabras ausentes de ese léxico emplea un transformer DeepPhonemizer entrenado sobre el propio NST, que acierta exactamente el 83% de las palabras reservadas, con un error fonético del 3,2% y una recuperación de stød del 94%, emitiendo los símbolos propios de NST. Las frases en inglés se detectan con lingua y se leen con la voz inglesa de eSpeak NG, mapeada al inventario de sonidos danés. Los números se gestionan con num2words y reglas derivadas de NST (incluidas las formas `enog…`), junto con abreviaturas (`bl.a.`, `f.eks.`) y símbolos (`&`, `§`, `+`, `=`). eSpeak NG en danés solo se usa como último recurso: el 0,3% de las palabras de entrenamiento, en su mayoría siglas. El entrenamiento se ejecutó en Docker sobre dos GPU de 16 GB.

## Capacidades

- Síntesis de voz en danés a 24 kHz con una única voz (DA1), entrenada sobre grabaciones reales de un hablante.
- Conversión de texto a fonemas específica para danés, con tratamiento explícito del stød.
- Lectura de palabras y frases en inglés incrustadas en texto danés, mediante detección de idioma y mapeo fonético.
- Normalización de números, abreviaturas y símbolos en el texto de entrada.
- Inferencia en CPU: aproximadamente 60 veces más rápida que el tiempo real con dos hilos.
- Despliegue en dispositivos de borde gracias al tamaño reducido (9,3 MB en int8).
- Verificación de integridad del frontend mediante huella (fingerprint) en los metadatos ONNX, que speak.py comprueba antes de sintetizar.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Lectura por voz de contenidos daneses en aplicaciones móviles: el modelo cabe en 9,3 MB en int8 y corre en CPU, por lo que puede empaquetarse dentro de una app sin depender de servicios en la nube ni de conectividad.
- Asistentes de voz para dispositivos de borde (altavoces, electrodomésticos, wearables): la latencia de unas 60 veces el tiempo real en dos hilos de CPU permite respuestas habladas casi inmediatas sin GPU.
- Accesibilidad para personas con discapacidad visual en Dinamarca: lectura de textos, noticias o interfaces en danés con pronunciación que incluye el stød, aunque la calidad aún no está validada por hablantes nativos.
- Generación de audiolibros o pódcasts de bajo coste: el modelo procesa texto largo por fragmentos y su velocidad permite renderizar horas de audio en minutos en hardware modesto.
- Prototipado e investigación en TTS de bajos recursos: el repositorio incluye la receta completa de entrenamiento (Dockerfiles, scripts, kit), lo que facilita reproducir el pipeline y adaptarlo a otros idiomas o hablantes.
- Sistemas de anuncios y avisos automatizados en entornos con recursos limitados (transporte público, comercio, domótica): la inferencia local en CPU evita costes recurrentes de API y mantiene los datos en el dispositivo.
- Pruebas de integración continua de pipelines de voz: el modelo pequeño y determinista sirve como componente de referencia para validar cadenas de TTS en CI sin GPU.

## Benchmarks y rendimiento

Evaluación con Whisper large-v3 sobre 120 frases de validación reservadas (CER y WER, menor es mejor) y métricas de calidad de sonido DNSMOS (P808, SIG, OVRL) y UTMOS sobre 20 frases de test (mayor es mejor). La métrica de zumbido (pulse locking a 1–2 / 2–4 / 4–6 kHz) se mide sobre las grabaciones reales; menor es menos zumbido.

| Modelo | CER | WER | P808 | SIG | OVRL | UTMOS | Buzz |
|---|---|---|---|---|---|---|---|
| Grabaciones reales | 8,07% | no disponible | 3,70 | 3,53 | 3,29 | 3,44 | 0,33 / 0,31 / 0,24 |
| tiny-voca-da | 7,15% | 14,2% | 3,43 | 3,34 | 3,07 | 3,10 | 0,29 / 0,30 / 0,24 |
| Misma receta, frontend v3 anterior | 8,13% | 15,6% | 3,40 | 3,34 | 3,07 | 3,16 | 0,30 / 0,31 / 0,25 |

Notas: el CER de las grabaciones reales se calcula sobre las mismas 120 frases, mientras que las puntuaciones de sonido y zumbido se obtienen de clips grabados, no de las mismas frases. La comparación con el frontend v3 usa los mismos pasos de entrenamiento y la misma receta de vocoder, pero el v3 carecía de G2P y de lector de inglés, por lo que el 8,5% de las palabras caían en eSpeak (sin stød), y pasaron menos clips las comprobaciones de alineamiento. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) por tratarse de un modelo TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula; el modelo está pensado para ejecutarse en CPU con onnxruntime. En int8 ocupa 9,3 MB y en fp32, 28 MB.
- GPU recomendadas: no se requieren. El entrenamiento se realizó en dos GPU de 16 GB, pero la inferencia no necesita GPU.
- Compatibilidad con GPU de consumo: irrelevante para la inferencia; cualquier GPU podría ejecutarlo, pero no aporta ventaja frente a la CPU.
- Despliegue: onnxruntime (ruta probada mediante Docker con la imagen `tiny-voca-dk:v4`, de unos 14 GB porque está construida para entrenamiento con CUDA). La ruta manual en CPU requiere clonar tiny-voca-it en el commit `3af29adc2b9dc0a0441fb1d8bb3507e1a7e0fc05`, aplicar `frontend/danish.patch` y `frontend/danish-v4.patch`, copiar los archivos G2P, instalar `deep-phonemizer==0.0.19`, `lingua-language-detector==2.1.1` y `onnxruntime`, y compilar eSpeak NG 1.52.0. Esta ruta manual no se ha probado fuera de Docker.
- Latencia y throughput: aproximadamente 60 veces más rápido que el tiempo real con dos hilos de CPU (según el autor).

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| tiny-voca-da | 6,8 M | danés | no aplica | Apache 2.0 | ONNX, PyTorch | Hugging Face |
| n4ze3m/tiny-voca (modelo base) | no disponible | inglés | no aplica | no disponible | no disponible | Hugging Face |
| tiny-voca-it (código base) | no disponible | italiano | no aplica | no disponible | no disponible | GitHub |
| eSpeak NG (voz danesa) | no disponible (sintetizador basado en reglas) | danés | no aplica | no disponible | binario | Uso local |

La comparación se limita a los modelos citados en la información disponible; no se dispone de datos de benchmarks de los modelos base ni de eSpeak NG para contrastar rendimiento. No se conocen otros modelos TTS daneses de tamaño comparable en la información proporcionada.

## Limitaciones y advertencias

- Vista previa de investigación (versión 0.1): ningún hablante nativo de danés la ha revisado; la corrección se comprobó solo con reconocimiento automático del habla (Whisper large-v3), lo que no garantiza naturalidad ni prosodia adecuadas.
- Una única voz (DA1) y un único hablante de entrenamiento (`mic`), lo que limita la variedad y puede introducir sesgos de género, edad o registro del hablante original.
- WER del 14,2% en la evaluación, superior al de las grabaciones reales en calidad de sonido (P808, SIG, OVRL, UTMOS por debajo de las grabaciones reales), lo que indica margen de mejora en inteligibilidad y calidad.
- Dependencia estricta del frontend exacto con el que se entrenó: es necesario el fingerprint de los metadatos ONNX y la ruta de ejecución probada es Docker; la ruta manual en CPU no está validada fuera de Docker.
- Cobertura lingüística limitada al danés; el inglés solo se maneja mediante eSpeak NG mapeado, y el 0,3% de las palabras de entrenamiento (mayoritariamente siglas) dependen de eSpeak NG en danés, que carece de stød.
- Riesgo de errores en la conversión de texto a fonemas para palabras fuera del léxico NST (el G2P acierta el 83% exacto de las palabras reservadas), lo que puede producir pronunciaciones incorrectas.
- Licencia Apache 2.0: permite uso comercial, pero al ser una vista previa sin validación nativa, no se recomienda su uso en producción sin evaluación adicional por hablantes nativos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin comunidad de validación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gowombat/tiny-voca-da
- Modelo base: https://huggingface.co/n4ze3m/tiny-voca
- Código base tiny-voca-it: https://github.com/carbogninalberto/tiny-voca-it
- Dataset CoRal-tts: https://huggingface.co/datasets/CoRal-project/coral-tts
- Léxico de pronunciación NST: https://www.nb.no/sprakbanken/ressurskatalog/en/oai-nb-no-sbr-26/
- DeepPhonemizer: https://github.com/as-ideas/DeepPhonemizer
- lingua (detección de idioma): https://github.com/pemistahl/lingua-py
- Vocos: https://github.com/gemelo-ai/vocos
