# DeepFense/EmoFake_Wav2Vec2_AASIST_NoAug_Seed240

## Resumen

EmoFake_Wav2Vec2_AASIST_NoAug_Seed240 es un detector binario de deepfakes de audio desarrollado por DeepFense, entrenado sobre el split oficial de entrenamiento del dataset EmoFake. El modelo combina un frontend congelado XLS-R-300M (familia wav2vec2 de fairseq) con un backend AASIST basado en graph attention, y se presenta como una de las tres semillas independientes (2, 42 y 240) del estudio, sin que se trate de un ensemble.

El modelo resuelve la tarea de clasificar audio como spoof (falso, generado sinteticamente) o bonafide (autentico), con etiquetas 0=spoof y 1=bonafide. Trabaja a 16 kHz, con recorte o repeticion de prefijo a 64.600 muestras y sin aumentacion de datos durante el entrenamiento. El checkpoint se selecciono por EER de validacion, aunque el autor advierte explicitamente de que ese valor no constituye una medida de rendimiento sobre el split de test.

Es relevante por su caracter reproducible y auditable: publica el checkpoint original byte a byte, la configuracion resuelta, registros de procedencia, sumas SHA256 y metricas completas sobre InTheWild y ASV19. No es un modelo de Transformers cargable con `from_pretrained`, sino un diccionario propio del framework DeepFense con estado del modelo, del optimizador y metadatos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Frontend XLS-R-300M (wav2vec2, fairseq) congelado + backend AASIST (graph attention) |
| Parametros totales | no disponible (el frontend XLS-R-300M ronda los 300 M; el total no se declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana fija de 64.600 muestras a 16 kHz (aprox. 4,04 s) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en punto flotante, sin variantes GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | en, zh (segun metadatos del modelo) |
| Licencia | no disponible (el codigo DeepFense es Apache-2.0; la model card no infiere licencia de pesos) |
| Formato de pesos | PyTorch `.pth` (diccionario DeepFense con `model_state`, estado del optimizador y metadatos) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline de dos etapas. El frontend es XLS-R-300M de fairseq, un modelo wav2vec2 multilingue de representacion auto-supervisada del habla, que permanece congelado durante todo el entrenamiento: sus pesos se restauran desde `best_model.pth` tras construirse el modelo con el inicializador original XLS-R-300M. El backend es AASIST, que opera sobre las representaciones del frontend mediante un esquema de graph attention. El preprocesado fija audio a 16 kHz y aplica recorte de prefijo o padding por repeticion hasta 64.600 muestras, sin aumentacion.

El entrenamiento se realizo exclusivamente sobre el split de train oficial del dataset EmoFake, con seleccion del checkpoint por EER de validacion (0,0000 % en validacion, valor que el autor insiste en no interpretar como rendimiento de test). La model card no detalla el numero de tokens ni la composicion exacta del dataset, mas alla de la referencia a EmoFake, cuyos terminos de origen son CC BY-NC-ND 4.0. No se menciona RLHF, DPO ni tecnicas de decodificacion especulativa; la innovacion destacable es la combinacion de un frontend SSL congelado con AASIST y la trazabilidad completa del artefacto (procedencia, hashes, configuracion resuelta).

## Capacidades

- Clasificacion binaria de audio como spoof o bonafide (deteccion de deepfake de voz).
- Entrada de audio a 16 kHz con ventana fija de 64.600 muestras (recorte o padding por repeticion).
- Soporte multilingue declarado para ingles y chino, heredado del frontend XLS-R.
- Evaluacion con dos definiciones de score: logit de bonafide del framework y diferencia de logits (`logit_bonafide - logit_spoof`), que no deben mezclarse.
- Carga estricta del estado del modelo para evaluacion personalizada.
- No soporta tool calling, function calling, agentes, vision ni audio generativo: es un clasificador de audio.
- No dispone de modo thinking ni de capacidades de razonamiento multi-paso.

## Casos de uso

- Investigacion en deteccion de deepfakes de voz: el modelo sirve como linea base reproducible para comparar recetas de frontend congelado frente a frontend ajustado, con metricas completas sobre InTheWild y ASV19.
- Verificacion de autenticidad en pipelines de moderacion de audio: clasificar clips cortos (hasta aprox. 4 s por ventana) como sospechosos antes de revision humana, usando el score de diferencia de logits como senal de confianza.
- Auditoria de datasets de habla sintetica: puntuar lotes de audio generado para detectar contaminacion en corpus de entrenamiento o evaluacion.
- Analisis forense de grabaciones: procesar segmentos de 64.600 muestras de forma deslizante sobre grabaciones largas y agregar los scores por tramo.
- Reproduccion de resultados academicos: el checkpoint byte a byte, la configuracion resuelta y los hashes permiten replicar exactamente las cifras publicadas con la version de DeepFense indicada.
- Estudio de robustez y sesgo entre idiomas: evaluar el comportamiento del detector en ingles y chino, dado el soporte declarado del frontend XLS-R, para medir disparidades en EER.
- Prototipado de sistemas anti-spoofing en entornos de investigacion con restricciones no comerciales, respetando los terminos CC BY-NC-ND 4.0 del dataset de origen.

## Benchmarks y rendimiento

Resultados publicados para esta semilla sobre los conjuntos de test completos, sin reentrenamiento ni submuestreo:

| Conjunto de test | Enunciados | EER logit difference (%) | EER score del framework (%) |
|---|---:|---:|---:|
| InTheWild | 31.779 | 28,2578 | 28,2922 |
| ASV19 | 71.237 | 17,7864 | 17,8925 |

EER de validacion usado para seleccion del checkpoint: 0,0000 % (no es rendimiento de test). El autor indica que `metrics.json` contiene hashes de protocolo, AUC, accuracy, balanced accuracy y macro F1, pero esos valores no se reproducen en la informacion disponible. No se publican comparaciones con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 1,3 GB e incluye estado del optimizador, por lo que el peso del modelo es inferior. Un frontend XLS-R-300M en fp32 requiere del orden de 1,2 GB solo en pesos, mas activaciones y backend AASIST.
- GPU recomendadas: no disponibles en la informacion; el entorno evaluado uso PyTorch 2.4.1+cu121 en un cluster, sin especificar modelo de GPU.
- Cabe en GPU de consumo: previsiblemente si en tarjetas con 8 GB o mas en fp32, aunque no se confirma en la documentacion.
- Opciones de despliegue: exclusivamente el framework DeepFense (commit `3f2fe1146c48ea4bacc480dd96d806b6c72c09cf`) mediante `test.py`; no hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/ventana | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EmoFake_Wav2Vec2_AASIST_NoAug_Seed240 | no disponible (frontend ~300 M) | 64.600 muestras (16 kHz) | XLS-R congelado + AASIST | no disponible | Hugging Face, formato DeepFense |
| Modelos DeepFense ASV19 publicados | no disponible | 64.000 muestras | SSL con frontend ajustado | no disponible | Hugging Face |
| Otras semillas del estudio EmoFake (2, 42) | mismas que esta | 64.600 muestras | XLS-R congelado + AASIST | no disponible | Hugging Face |

El autor advierte de que la comparacion con los modelos DeepFense de ASV19 no constituye una ablacion controlada del congelado del frontend, ya que difieren tanto la receta de entrenamiento como la longitud de ventana (64.000 frente a 64.600 muestras). No se dispone de datos de benchmarks de modelos de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- El EER de validacion de 0,0000 % es un criterio de seleccion de checkpoint y no debe citarse como rendimiento; el EER real en test es de 28,26 % en InTheWild y 17,79 % en ASV19.
- Las dos definiciones de score (logit de bonafide y diferencia de logits) producen EER distintos y no deben mezclarse en comparaciones.
- Requiere el inicializador original XLS-R-300M para construir el modelo; no se puede sustituir por un encoder Wav2Vec2 pequeno.
- No es cargable con `from_pretrained` de Transformers: depende del codigo DeepFense en un commit concreto.
- Ventana fija de aproximadamente 4 s: el audio mas largo se recorta o se rellena, lo que puede degradar la deteccion en grabaciones largas sin segmentacion.
- Solo se declaran ingles y chino; el comportamiento en otros idiomas no esta documentado.
- El dataset de entrenamiento conserva terminos CC BY-NC-ND 4.0, lo que restringe el uso comercial; la licencia de los pesos no se declara y no se infiere de la licencia Apache-2.0 del codigo.
- Uso previsto exclusivamente para investigacion en deteccion de deepfakes de audio.
- Riesgo de sesgo y de alucinacion en el sentido de falsos positivos o negativos no cuantificado en la informacion disponible; no se publican analisis de sesgo por idioma, genero o canal.
- No se han publicado resultados de benchmarks frente a modelos de terceros en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeepFense/EmoFake_Wav2Vec2_AASIST_NoAug_Seed240
- Dataset EmoFake: https://huggingface.co/datasets/DeepFense/EmoFake
- Repositorio del framework DeepFense: https://github.com/Yaselley/deepfense-framework
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
