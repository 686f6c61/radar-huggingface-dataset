# DeepFense/EmoFake_Wav2Vec2_AASIST_NoAug_Seed2

## Resumen
EmoFake_Wav2Vec2_AASIST_NoAug_Seed2 es un detector binario de deepfakes de audio desarrollado por DeepFense, entrenado sobre el split oficial de entrenamiento del dataset EmoFake. El modelo combina un frontend congelado XLS-R-300M (wav2vec2 de fairseq) con un backend AASIST basado en graph attention, y se presenta como una de las tres semillas (2, 42 y 240) del estudio, no como un ensemble. Su función es clasificar una grabación de voz como auténtica (bonafide) o falsa (spoof), un problema central en la verificación forense de audio y en la defensa frente a voz sintética.

El checkpoint se seleccionó por EER de validación (0,0000 %) y se evalúa en los conjuntos completos InTheWild (31.779 utterances) y ASV19 (71.237 utterances), con EER de 25,10 % y 16,68 % respectivamente usando la puntuación de diferencia de logits. El modelo trabaja a 16 kHz, con recorte o relleno por repetición a un prefijo de 64.600 muestras y sin aumentación de datos durante el entrenamiento.

Es relevante ahora porque la detección de voz sintética se ha convertido en una necesidad operativa para plataformas de contenido, telco y banca, y porque este checkpoint documenta de forma explícita su procedencia, su configuración resuelta y sus métricas completas, algo poco habitual en modelos de esta categoría. No es un modelo de Transformers cargable con `from_pretrained`, sino un checkpoint del framework DeepFense.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Frontend XLS-R-300M (wav2vec2, fairseq, congelado) + backend AASIST (graph attention) |
| Parametros totales | no disponible (el frontend XLS-R-300M aporta ~300 M; el total del detector no se declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | audio de 16 kHz con prefijo de 64.600 muestras (~4,04 s); recorte o relleno por repetición |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en precisión de entrenamiento) |
| Idiomas soportados | en, zh |
| Licencia | no disponible (el código DeepFense es Apache-2.0; el dataset fuente es CC BY-NC-ND 4.0; la model card no infiere licencia de pesos) |
| Formato de pesos | PyTorch `.pth` (diccionario DeepFense con `model_state`, estado del optimizador y metadatos) |

## Arquitectura y entrenamiento
El modelo sigue un esquema de dos etapas. El frontend es XLS-R-300M de fairseq, un transformer convolucional auto-supervisado para habla, que permanece congelado durante todo el entrenamiento: sus pesos se restauran desde el inicializador original y desde el propio `best_model.pth`, sin fine-tuning. Sobre las representaciones extraídas, el backend AASIST aplica su propio mecanismo de graph attention para agregar la evidencia espectral y temporal y emitir una decisión binaria. La configuración guardada (`config.yaml`) es la autoridad arquitectónica; los experimentos MLP del estudio usan proyección [256, 128] con layer normalization, pero este checkpoint emplea el backend AASIST.

El entrenamiento se realizó exclusivamente sobre el split oficial de train de DeepFense/EmoFake, sin aumentación de datos, con selección de checkpoint por EER de validación. Las etiquetas son 0 = spoof y 1 = bonafide. El runtime evaluado fue PyTorch 2.4.1+cu121. La model card advierte que los modelos DeepFense publicados para ASV19 sí hacen fine-tuning del frontend SSL y usan 64.000 muestras, por lo que las comparaciones con este modelo miden recetas de entrenamiento distintas, no una ablación controlada del congelado del frontend.

## Capacidades
- Clasificación binaria de audio como bonafide o spoof, con salida de logits por clase.
- Detección de voz sintética y audio manipulado en inglés y chino.
- Puntuación por diferencia de logits (`logit_bonafide - logit_spoof`), además de la puntuación de entropía cruzada del framework actual.
- Evaluación sobre protocolos completos de detección (InTheWild, ASV19) sin submuestreo.
- Integración con el framework DeepFense para entrenamiento, test y evaluación personalizada.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un clasificador de audio.
- No dispone de modo thinking, visión, audio generativo ni otras capacidades multimodales más allá de la entrada de audio.

## Casos de uso
- Moderación de contenido en plataformas de audio y pódcast: el modelo puede puntuar cada subida como bonafide o spoof y derivar a revisión humana los casos con diferencia de logits baja, gracias a su ventana de ~4 s y a su coste de inferencia acotado.
- Verificación forense de grabaciones: en un peritaje se puede usar como señal complementaria junto a metadatos y análisis de espectro, dado que el checkpoint documenta procedencia, hashes y protocolos de evaluación reproducibles.
- Defensa en canales de atención telefónica: integrado en la pasarela de voz, permite marcar llamadas con voz sintética antes de que el agente humano interactúe con el interlocutor.
- Investigación en detección de deepfakes: sirve como línea base congelada de XLS-R-300M para comparar recetas con y sin fine-tuning del frontend y con distintas semillas.
- Evaluación de robustez de datasets: al estar entrenado solo con el split de train de EmoFake, permite medir la generalización a InTheWild y ASV19 y detectar sesgos de dominio en el corpus.
- Filtrado de datos en pipelines de ASR y TTS: descartar muestras sintéticas antes de entrenar modelos de reconocimiento o síntesis, reduciendo la contaminación del corpus.
- Auditoría de proveedores de voz sintética: comparar la tasa de detección sobre audios generados por distintos sistemas y ajustar umbrales según el coste de falsos positivos.

## Benchmarks y rendimiento

| Conjunto de test completo | Utterances | EER diferencia de logits (%) | EER puntuación actual del framework (%) |
|---|---:|---:|---:|
| InTheWild | 31.779 | 25,1015 | 25,2116 |
| ASV19 | 71.237 | 16,6824 | 16,9985 |

Mejor EER de validación: 0,0000 % (selección de checkpoint, no rendimiento en test). El EER se calcula con el punto DET más cercano agrupando empates; puntuaciones más altas indican mayor probabilidad de bonafide. La model card remite a `metrics.json` para hashes de protocolo, AUC, accuracy, balanced accuracy y macro F1, pero esos valores no se incluyen en la información disponible. No se han publicado comparaciones directas con otros modelos en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 1,3 GB e incluye pesos del frontend XLS-R-300M y del backend AASIST, por lo que en FP32 se sitúa en el orden de varios GB incluyendo estado del optimizador y overhead del framework.
- GPU recomendadas: no disponible; el runtime evaluado fue PyTorch 2.4.1+cu121 sobre un clúster, sin GPU concreta especificada.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con suficiente VRAM para XLS-R-300M en FP32, pero no se confirma en la información disponible.
- Opciones de despliegue: exclusivamente el framework DeepFense (repositorio `Yaselley/deepfense-framework`, commit `3f2fe1146c48ea4bacc480dd96d806b6c72c09cf`); no es compatible con vLLM, llama.cpp, Ollama ni TGI, ni con `from_pretrained` de Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | EER ASV19 | Licencia | Formato |
|---|---|---|---|---|---|
| EmoFake_Wav2Vec2_AASIST_NoAug_Seed2 | frontend ~300 M + AASIST | 64.600 muestras a 16 kHz | 16,68 % | no disponible | `.pth` DeepFense |
| Modelos DeepFense publicados para ASV19 (fine-tuning del frontend) | frontend SSL + backend | 64.000 muestras | no disponible en esta ficha | no disponible | `.pth` DeepFense |
| Otras semillas del mismo estudio (42, 240) | idénticas | 64.600 muestras | no disponible en esta ficha | no disponible | `.pth` DeepFense |

La model card advierte que la comparación con los modelos ASV19 de DeepFense no es una ablación controlada, porque aquellos hacen fine-tuning del frontend y usan una longitud de entrada distinta. No se dispone de datos de benchmarks de alternativas externas en la información proporcionada.

## Limitaciones y advertencias
- El EER de validación de 0,0000 % es un criterio de selección de checkpoint y no debe interpretarse como rendimiento real; en test el EER sube a 25,10 % en InTheWild y 16,68 % en ASV19.
- El modelo está entrenado solo con el split de train de EmoFake y sin aumentación, lo que puede reducir la generalización a dominios, códecs y condiciones acústicas no representadas.
- Solo declara soporte para inglés y chino; el rendimiento en otros idiomas no está documentado.
- La licencia de los pesos no está disponible. El código DeepFense es Apache-2.0, pero el dataset fuente conserva términos CC BY-NC-ND 4.0, lo que condiciona el uso comercial y la redistribución.
- El uso previsto es investigación en detección de deepfakes de audio; no se documenta validación para producción ni para decisiones automatizadas de alto impacto.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos con impacto directo en moderación y verificación.
- La carga requiere editar rutas del YAML portable, disponer del inicializador original de XLS-R-300M y usar carga estricta del state dict; no se debe sustituir por un encoder Wav2Vec2 pequeño.
- Existen dos definiciones de EER en el estudio (diferencia de logits y puntuación actual del framework) que no deben mezclarse al comparar resultados.
- No se proporcionan datos de sesgo por género, edad o acento en la información disponible.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/DeepFense/EmoFake_Wav2Vec2_AASIST_NoAug_Seed2
- Dataset EmoFake: https://huggingface.co/datasets/DeepFense/EmoFake
- Framework DeepFense: https://github.com/Yaselley/deepfense-framework
