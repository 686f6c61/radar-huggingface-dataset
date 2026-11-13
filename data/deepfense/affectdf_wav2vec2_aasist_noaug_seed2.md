# DeepFense/AffectDF_Wav2Vec2_AASIST_NoAug_Seed2

## Resumen

AffectDF_Wav2Vec2_AASIST_NoAug_Seed2 es un detector binario de deepfakes de audio desarrollado por DeepFense. Combina un frontend congelado XLS-R-300M (variante multilingue de wav2vec2 de fairseq) con un backend AASIST basado en graph attention para clasificar utterances como spoof (0) o bonafide (1). Forma parte de una familia de tres semillas (2, 42 y 240) entrenadas de forma independiente sobre el split oficial de entrenamiento del dataset AffectDF, sin aumento de datos y con seleccion de checkpoint por EER de validacion.

El modelo aborda una tarea de seguridad relevante: la deteccion de audio sintetico o manipulado, un vector creciente de fraude y desinformacion. Su interes tecnico reside en la receta de frontend congelado: en lugar de afinar el encoder SSL, mantiene fijos los pesos de XLS-R-300M y entrena solo el backend AASIST, lo que reduce coste de entrenamiento y permite estudiar el comportamiento del clasificador sobre representaciones preentrenadas estables.

El checkpoint se distribuye como diccionario de DeepFense (estado del modelo, optimizador y metadatos), no como modelo de Transformers, y requiere el framework DeepFense y el inicializador original XLS-R-300M para su construccion. El repositorio ocupa 1,3 GB y esta pensado para investigacion en deteccion de deepfakes de audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Frontend XLS-R-300M (wav2vec2, fairseq, congelado) + backend AASIST (graph attention) |
| Parametros totales | no disponible (frontend XLS-R-300M, aproximadamente 300 M, mas backend AASIST) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 64.600 muestras de audio a 16 kHz (aproximadamente 4,04 s), con recorte de prefijo o padding por repeticion |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta del repositorio; el frontend XLS-R es multilingue por diseno) |
| Licencia | no disponible para los pesos; el codigo DeepFense es Apache-2.0 y el dataset AffectDF conserva CC BY-NC 4.0 |
| Formato de pesos | PyTorch (.pth, diccionario DeepFense con model_state, estado del optimizador y metadatos) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline de dos etapas. El frontend es XLS-R-300M de fairseq, un transformer convolucional auto-supervisado que procesa audio mono a 16 kHz. En este modelo el frontend esta congelado: sus pesos no se actualizan durante el entrenamiento y se restauran desde `best_model.pth` tras construir el modelo con el inicializador original. El backend es AASIST, que opera sobre las representaciones del frontend mediante un esquema de graph attention para agregar evidencia espectral y temporal.

El entrenamiento se realizo sobre el split oficial de train del dataset AffectDF, sin aumento de datos, con seleccion de checkpoint por EER de validacion (2,9664 % para esta semilla). El preprocesado fija 64.600 muestras por utterance con recorte o padding por repeticion. Las etiquetas son 0 = spoof y 1 = bonafide. No se documenta en la informacion disponible el numero de tokens de audio, la composicion exacta del dataset ni el uso de RLHF o DPO, que no aplican a esta tarea de clasificacion. La model card advierte que los modelos DeepFense publicados para ASV19 afinan el frontend SSL y usan 64.000 muestras, por lo que las comparaciones entre recetas no constituyen una ablacion controlada del congelado del frontend.

## Capacidades

- Clasificacion binaria de audio como spoof o bonafide (deteccion de deepfake de voz).
- Procesamiento de utterances de audio de hasta 64.600 muestras a 16 kHz con recorte o padding por repeticion.
- Extraccion de representaciones mediante XLS-R-300M congelado, con backend AASIST de graph attention.
- Evaluacion con dos definiciones de score: logit de bonafide (score del framework actual) y diferencia de logits (logit_bonafide - logit_spoof), que no deben mezclarse.
- Soporte de evaluacion completa de particiones de test (InTheWild y ASV19) sin remuestreo ni descarte de audio.
- No soporta generacion de texto, tool calling, agentes, vision ni audio generativo; es exclusivamente un clasificador de audio.

## Casos de uso

- Deteccion de voz sintetica en centros de atencion: integrado como filtro previo sobre llamadas entrantes para marcar audio generado por TTS o clonacion de voz, usando el score de bonafide como senal de riesgo.
- Verificacion de autenticidad en periodismo y verificacion de hechos: procesar clips de audio recibidos para priorizar revision humana de aquellos con alta probabilidad de spoof.
- Investigacion en forense de audio: banco de pruebas para comparar recetas de frontend congelado frente a frontend afinado sobre particiones estandar como InTheWild y ASV19.
- Evaluacion de robustez de sistemas de verificacion de hablante: analizar como se comporta el detector frente a ataques de sintesis en el corpus ASV19.
- Filtrado de datasets de audio a gran escala: puntuar utterances y descartar o aislar muestras sospechosas antes de usarlas en entrenamiento de otros modelos.
- Analisis de fraude en banca y seguros: senal auxiliar en la revision de grabaciones de voz asociadas a reclamaciones o autorizaciones telefonicas.
- Docencia y reproduccion de experimentos: receta reproducible con configuracion, hashes y metricas completas para estudiar deteccion de deepfakes con XLS-R y AASIST.

## Benchmarks y rendimiento

Resultados publicados para esta semilla concreta (seed 2). El EER de validacion es el criterio de seleccion de checkpoint, no rendimiento sobre test.

| Particion de test | Utterances | EER diferencia de logits (%) | EER score del framework (%) |
|---|---:|---:|---:|
| InTheWild | 31.779 | 21,9545 | 21,9108 |
| ASV19 | 71.237 | 29,3387 | 27,8205 |

Mejor EER de validacion: 2,9664 %. La model card indica que `metrics.json` contiene hashes de protocolo, AUC, accuracy, balanced accuracy y macro F1, pero esos valores no se incluyen en la informacion disponible. No se aportan resultados de MMLU, HumanEval ni GSM8K, que no aplican a esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio pesa 1,3 GB e incluye estado del optimizador; el frontend XLS-R-300M ronda los 300 M de parametros, por lo que la inferencia en fp32 requiere del orden de 1,2-1,5 GB solo para pesos, mas activaciones y estado del optimizador si se carga el checkpoint completo.
- GPU recomendadas: no disponible. El runtime evaluado uso PyTorch 2.4.1+cu121 en un cluster; no se especifica el modelo de GPU.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del frontend, pero no se confirma en la informacion disponible.
- Opciones de despliegue: el modelo no es un `from_pretrained` de Transformers; requiere el codigo DeepFense (commit `3f2fe1146c48ea4bacc480dd96d806b6c72c09cf`) y ejecutar `test.py` con la configuracion YAML y el checkpoint. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AffectDF_Wav2Vec2_AASIST_NoAug_Seed2 | XLS-R-300M + AASIST | 64.600 muestras (16 kHz) | Frontend congelado, sin aumento | no disponible (pesos) | Hugging Face, requiere DeepFense |
| Modelos DeepFense publicados para ASV19 | XLS-R-300M + AASIST | 64.000 muestras | Frontend SSL afinado | no disponible | Hugging Face |
| Otras semillas AffectDF (42, 240) | XLS-R-300M + AASIST | 64.600 muestras | Frontend congelado, sin aumento | no disponible | Hugging Face |

La model card advierte que la comparacion con los modelos ASV19 de DeepFense es entre recetas de entrenamiento, no una ablacion controlada del congelado del frontend. No se dispone de datos de benchmarks de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- El EER en test es alto (21,9 % en InTheWild y 27,8-29,3 % en ASV19), lo que limita su uso como unico filtro en produccion.
- El EER de validacion (2,97 %) no debe interpretarse como rendimiento en test; es solo el criterio de seleccion de checkpoint.
- Las dos definiciones de score (logit de bonafide y diferencia de logits) producen EER distintos y no deben mezclarse en evaluaciones.
- El modelo esta entrenado sin aumento de datos, lo que puede reducir la robustez frente a condiciones acusticas no vistas.
- El frontend esta congelado: no se adapta a dominios alejados de AffectDF, y sustituirlo por un Wav2Vec2 mas pequeno invalida los pesos guardados.
- La licencia de los pesos no esta declarada; el dataset AffectDF conserva CC BY-NC 4.0, lo que restringe el uso comercial. El uso previsto es investigacion en deteccion de deepfakes de audio.
- Solo se declara idioma ingles en el repositorio, aunque el frontend XLS-R sea multilingue por diseno; el rendimiento en otros idiomas no esta documentado.
- Requiere el inicializador original XLS-R-300M y editar rutas del YAML antes de ejecutar; no funciona como modelo autonomo de Transformers.
- Riesgo de sesgo y de falsos positivos/negativos no cuantificado en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeepFense/AffectDF_Wav2Vec2_AASIST_NoAug_Seed2
- Dataset AffectDF: https://huggingface.co/datasets/DeepFense/AffectDF
- Codigo DeepFense: https://github.com/Yaselley/deepfense-framework
