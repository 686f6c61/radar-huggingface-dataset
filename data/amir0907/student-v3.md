# amir0907/student-v3

## Resumen

Student-v3 es un modulo de reconocimiento de emociones en habla (SER) desarrollado por el usuario amir0907, tercera iteracion de una familia de adaptadores que se implanta sobre el modelo emotion2vec_plus_base de FunASR. No es un modelo de lenguaje ni un sistema completo de sintesis de voz: es un adaptador ligero de 3,18 millones de parametros que transforma las representaciones del profesor congelado en probabilidades de emocion a nivel de trama (9 clases) y un vector de intensidad emocional, manteniendo la frecuencia de 12,5 Hz. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

La relevancia de la version 3 reside en el salto de datos de entrenamiento: pasa de 2.160 enunciados (solo RAVDESS) en v2 a 50.202 enunciados procedentes de cuatro corpus (RAVDESS, CREMA-D, TESS y ESD), con cobertura en ingles y chino. El entrenamiento es por autodestilacion sin etiquetas: el adaptador aprende a imitar las salidas del profesor congelado, no las etiquetas de emocion de los corpus. Esto lo convierte en un componente de conditioning temporal para un proyecto de traduccion voz-a-voz (S2ST) que alimenta a dots.tts con dos tramas de emocion por cada token del LLM a 6,25 Hz.

El modelo esta pensado para integrarse en pipelines de sintesis expresiva y no como clasificador SER autonomo de referencia. Su interes tecnico esta en la receta sin etiquetas, la tasa de refresco fija de 12,5 Hz y el coste de inferencia minimo (~2,7 ms de sobrecarga del adaptador, ~142x tiempo real en una T4).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador sobre emotion2vec_plus_base: LN -> Linear(768->512) -> 3 conv depthwise-separables (k=9, dilatacion 1/2/4) -> soft-attn pooling agrupado G=4 (50->12,5 Hz) -> LN -> Linear(512->768) -> cabezas |
| Parametros totales | 3,18 M (solo el adaptador; el profesor emotion2vec_plus_base no se incluye en el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio de entrada; se verifico el contrato de tasa a 1, 2,5, 5 y 10 s) |
| Tipos de cuantizacion | no disponible (checkpoint en PyTorch, `surgical_emotion_module.pt`) |
| Idiomas soportados | Ingles y chino en los datos de entrenamiento (CREMA-D, TESS, ESD en+zh); no se declara cobertura oficial de idiomas |
| Licencia | Apache-2.0 (repositorio); los datos de destilacion incluyen RAVDESS con CC BY-NC-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`); requiere el directorio del profesor emotion2vec_plus_base de FunASR |

## Arquitectura y entrenamiento

El adaptador recibe las representaciones del profesor emotion2vec_plus_base (768 dimensiones) y las procesa con una normalizacion de capa, una proyeccion lineal a 512 dimensiones, tres convoluciones depthwise-separables con kernel 9 y dilataciones 1, 2 y 4, un pooling por atencion suave agrupado en 4 grupos que reduce la tasa de 50 Hz a 12,5 Hz, otra normalizacion y una proyeccion de vuelta a 768 dimensiones. Sobre esa salida se montan las cabezas de emocion (9 clases) e intensidad. La arquitectura es identica a la de v1 y v2, lo que preserva la interfaz de uso.

El entrenamiento es autodestilacion pura desde el profesor congelado, sin uso de etiquetas. La version 3 amplia el pool a 50.202 enunciados: RAVDESS (2.160), CREMA-D (7.442, ingles), TESS (5.600, ingles) y ESD (35.000, ingles y chino). Se entrenaron 4.000 pasos con batch 8 (~32k muestras vistas), frente a los 2.000 pasos de v2, con cache del profesor en 4 shards y 4 workers sobre 2x T4. El conjunto de validacion son los actores 19-24 de RAVDESS, nunca incluidos en ningun pool de entrenamiento. No se reporta RLHF ni DPO: no es un modelo generativo.

## Capacidades

- Reconocimiento de emociones en habla a nivel de trama a 12,5 Hz con 9 clases de emocion (`frame_probs`, B,T,9).
- Estimacion de intensidad emocional por trama (`frame_intensity`, B,T,1) con dinamica temporal.
- Embeddings de trama de 768 dimensiones (`frame_embs`, B,T,768) y embedding de enunciado completo (`utt_emb`, B,768).
- Probabilidades agregadas por enunciado (`utt_probs`, B,9).
- Conditioning temporal para TTS: dos tramas de emocion por cada token del LLM a 6,25 Hz en el proyecto S2ST con dots.tts.
- Procesamiento multilingue limitado a los idiomas presentes en el entrenamiento (ingles y chino).
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje.

## Casos de uso

- Sintesis de voz expresiva: las tramas de emocion a 12,5 Hz se inyectan como conditioning variable en el tiempo en dots.tts, permitiendo que la prosodia y el tono del audio generado sigan la emocion del habla de referencia en lugar de una etiqueta estatica por enunciado.
- Traduccion voz-a-voz con preservacion emocional: en un pipeline S2ST, el modulo extrae la trayectoria emocional del audio fuente y la transfiere al audio sintetizado en el idioma destino, manteniendo la intencion afectiva original.
- Doblaje automatico: para doblar contenido audiovisual, el adaptador proporciona la curva de intensidad emocional por trama que el TTS necesita para alinear la expresividad del doblaje con la actuacion original.
- Analisis de grabaciones de call center: el modelo puede generar series temporales de emocion a 12,5 Hz para detectar cambios de tono en conversaciones de atencion al cliente, con la ventaja de que el coste de inferencia es minimo (~142x tiempo real en T4).
- Anotacion asistida de corpus de habla: al ser destilado del profesor, produce pseudo-etiquetas de emocion e intensidad a nivel de trama que pueden usarse para preanotar nuevos corpus antes de la revision humana.
- Investigacion en paralinguistica computacional: la salida de embeddings de trama permite estudiar la dinamica emocional intra-enunciado (transiciones, picos de intensidad) sin depender de etiquetas discretas por clip.
- Prototipado de agentes conversacionales con voz: integrado en un front-end de TTS, permite que un agente adapte su tono emocional en tiempo real segun la respuesta del usuario.

## Benchmarks y rendimiento

Los datos publicados comparan v1, v2 y v3 sobre las mismas entradas de validacion (actores 19-24 de RAVDESS mas un clip en chino), siempre frente al profesor congelado:

| Metrica | v1 | v2 | v3 |
|---|---|---|---|
| Acuerdo top-1 | 100 % | 100 % | 100 % |
| Divergencia JS media (menor mejor) | 0,00035 | 0,00022 | 0,00027 |
| Coseno de embedding agrupado | 0,99935 | 0,99955 | 0,99948 |
| Coseno a nivel de trama (12,5->50 Hz) | 0,99524 | 0,99572 | 0,99560 |
| Dinamica de intensidad (std media) | 0,0301 | 0,0351 | 0,0214 |
| Correlacion de intensidad | 0,310 | 0,326 | 0,397 |

No se han publicado resultados de benchmarks estandar de SER (IEMOCAP, MELD, etc.) en la informacion disponible. Las cifras anteriores miden fidelidad al profesor, no precision frente a etiquetas humanas. La correlacion de intensidad de 0,397 en v3 es la mas alta de las tres versiones, aunque sigue siendo moderada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el adaptador tiene 3,18 M parametros (unos 12,7 MB en fp32) y el profesor emotion2vec_plus_base es el componente dominante en memoria.
- GPU recomendadas: el autor reporta entrenamiento e inferencia en NVIDIA T4; cualquier GPU con suficiente memoria para el profesor deberia servir.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del adaptador, aunque el requisito real depende del profesor emotion2vec_plus_base.
- Opciones de despliegue: el codigo de uso es Python con `SurgicalEmotionEncoder.from_pretrained` sobre el directorio del profesor de FunASR; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: ~2,7 ms de sobrecarga del adaptador y ~142x tiempo real total en T4, segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Tasa de salida | Idiomas de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| student-v3 (este) | 3,18 M (adaptador) | 12,5 Hz | en, zh | Apache-2.0 (datos con RAVDESS NC) | HuggingFace, 0 descargas |
| emotion2vec_plus_base (profesor) | no disponible | 50 Hz | no disponible | Apache-2.0 | FunASR |
| student-v2 | 3,18 M (adaptador) | 12,5 Hz | en | Apache-2.0 (datos con RAVDESS NC) | HuggingFace |
| student-v1 | 3,18 M (adaptador) | 12,5 Hz | en | Apache-2.0 (datos con RAVDESS NC) | HuggingFace |

No se dispone de datos para comparar con otros modulos SER de conditioning temporal de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La validacion se limita a los actores 19-24 de RAVDESS y un clip en chino; el acuerdo top-1 del 100 % mide fidelidad al profesor, no calidad real de reconocimiento emocional.
- La correlacion de intensidad es de 0,397, lo que indica que la estimacion de intensidad es debil y no deberia usarse como senal critica en produccion.
- Los datos de destilacion incluyen RAVDESS, con licencia CC BY-NC-SA 4.0: el uso comercial del modelo entrenado sobre estos datos es cuestionable pese a la licencia Apache-2.0 del repositorio. El autor recomienda re-destilar sobre corpus permisivos con la misma receta sin etiquetas.
- Cobertura linguistica limitada a ingles y chino; no se declara comportamiento en otros idiomas.
- No es un modelo generativo: no soporta tool calling, agentes ni razonamiento multi-paso.
- La tolerancia de un frame en los bordes proviene del frontend convolucional del profesor y no es corregible desde el adaptador.
- Riesgo de heredar sesgos del profesor emotion2vec_plus_base y de los corpus de entrenamiento (actores, idiomas y estilos acotados).
- Repositorio sin descargas ni validacion externa; el codigo de uso (`code/surgical_emotion.py`) debe obtenerse del propio repositorio.
- El checkpoint depende del directorio del profesor de FunASR, lo que anade una dependencia de version no documentada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amir0907/student-v3
- Version anterior v2: https://huggingface.co/amir0907/student-v2
- Version anterior v1: https://huggingface.co/amir0907/student
- Profesor emotion2vec_plus_base (FunASR): no disponible en la informacion proporcionada
- Paper de emotion2vec: no disponible en la informacion proporcionada
- Referencia de RAVDESS (Livingstone & Russo 2018): no disponible enlace directo en la informacion proporcionada
