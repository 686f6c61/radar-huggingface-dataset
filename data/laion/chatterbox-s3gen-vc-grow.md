# laion/chatterbox-s3gen-vc-grow

## Resumen

Chatterbox S3Gen VC es un adaptador experimental de conversion de voz (voice conversion, VC) de tipo audio-a-audio desarrollado por LAION, construido sobre el decodificador S3Gen del modelo ResembleAI/chatterbox. No es un modelo de texto a voz (TTS): recibe tokens semanticos S3 precalculados de una locucion de origen, una referencia de voz objetivo de 5 a 10 segundos y un vector de 99 dimensiones que codifica caracteristicas emocionales y de voz, y genera habla a 24 kHz mediante el decodificador S3Gen y el vocoder HiFT originales. El problema que aborda es la conversion de identidad y estilo vocal preservando el contenido linguistico del audio de origen.

El repositorio se publica como trabajo en curso (9 de octubre de 2026) y contiene dos checkpoints cronologicos: un piloto supervisado de 300,017 horas que entrena una LoRA de rango 128 mas un proyector de puntuaciones, y una continuacion mediante un objetivo de flow matching con aprendizaje por refuerzo (RL) inspirado en GROW, detenida en el paso 750 de 4000. Ambos checkpoints incluyen solo el adaptador entrenado, el proyector de puntuaciones y el estado de entrenamiento, no los pesos del modelo base, que deben obtenerse por separado.

Su relevancia radica en que documenta de forma transparente un pipeline de RL sobre flow matching aplicado a conversion de voz, con publicacion automatica de checkpoints intermedios y advertencias explicitas sobre la ausencia de ganancias de calidad demostradas. El tamano del repositorio es de 7,6 GB, no tiene descargas ni likes registrados en el momento de la consulta, y la licencia declarada del adaptador es CC-BY-4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 128) sobre proyecciones de atencion q/k/v/out del decodificador S3Gen, mas proyector MLP de puntuaciones; decodificador de flow matching y vocoder HiFT |
| Parametros totales | no disponible (solo se publica el adaptador; el modelo base se distribuye aparte) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; opera sobre tokens semanticos S3 a 25 tokens/s |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | cc-by-4.0 (adaptador); el modelo base ResembleAI/chatterbox es MIT |
| Formato de pesos | safetensors (adaptador para inferencia) y .pt (checkpoints pickle de entrenamiento) |

## Arquitectura y entrenamiento

El sistema parte del decodificador S3Gen de ResembleAI/chatterbox fijado a la revision `5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18` (archivo `s3gen.safetensors`). Durante el piloto supervisado de 300,017 horas se congelaron el tokenizador semantico S3 (25 tokens/s, 6.561 simbolos), el codificador de hablante CAMPPlus (192 dimensiones), la mayor parte de S3Gen y el vocoder HiFT. El entrenamiento se aplico sobre una LoRA de rango 128 en 224 proyecciones q/k/v/out de atencion del decodificador, junto con un MLP inicializado a cero que inyecta 99 puntuaciones (40 de emocion + 57 de VoiceNet + genuineness + vocal-burst-blend) en la condicion de hablante. La seleccion de datos incluye 111.665 UID unicos de entrenamiento, con aproximadamente 30,003 horas de material sintetico sidecar.

El segundo checkpoint continua el adaptador supervisado ya completado con un objetivo de flow matching con ventaja relativa de grupo inspirado en GROW, que no es GRPO de tokens discretos estandar. Cada una de las 4000 condiciones origen/objetivo seleccionadas genera un grupo de ocho muestras on-policy con 10 pasos de flujo Euler. Un modelo congelado Humaneness Ears Medium (revision `818506970d93c809a3295a0a02c40dee8ff2bfc3`) puntua cada muestra: la recompensa es un 55 % de Production Quality de AudioBox y un 45 % de error cuadratico medio negativo frente a los tres ejes de emocion mas fuertes de la grabacion de origen, estandarizados por separado dentro de cada grupo de ocho antes de mezclarse. Las ventajas de grupo ponderan la perdida de flow matching con un ancla de velocidad de politica congelada de 0,025. El calendario de 4000 pasos usa 200 pasos de calentamiento, LR pico de 5e-6, decaimiento coseno hasta 1e-6, AdamW y checkpoints con estado del optimizador cada 250 pasos. El snapshot publicado esta en el paso 750, no en la finalizacion.

## Capacidades

- Conversion de voz audio-a-audio: transforma el contenido de una locucion de origen en la identidad vocal de una referencia objetivo de 5 a 10 segundos.
- Generacion de habla a 24 kHz mediante el decodificador S3Gen y el vocoder HiFT.
- Condicionamiento emocional y de estilo: inyecta un vector de 99 dimensiones (40 ejes de emocion, 57 de VoiceNet, genuineness y vocal-burst-blend) en la condicion de hablante.
- Consumo de tokens semanticos S3 precalculados a 25 tokens/s, con un vocabulario de 6.561 simbolos.
- Ajuste fino eficiente: adaptador LoRA de rango 128 sobre proyecciones de atencion del decodificador.
- Punto de entrada de inferencia explicito para el esquema Parquet preparado (no es un pipeline de un solo comando para WAV arbitrario).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica (no es un modelo de lenguaje).
- Capacidades multilingues: no disponible.
- Capacidades especiales: modo de pensamiento, vision o audio de entrada adicional: no disponible.

## Casos de uso

- Conversion de voz para doblaje y localizacion: el modelo toma los tokens semanticos del habla original y reconstruye la locucion con la identidad vocal de una referencia objetivo, preservando el contenido linguistico sin necesidad de re-grabar.
- Prototipado de personajes sinteticos: partiendo de una referencia de 5 a 10 segundos, se puede generar una voz objetivo con un perfil emocional controlado a traves del vector de 99 puntuaciones.
- Anonimizacion de voz en conjuntos de datos: convertir grabaciones de hablantes reales a una identidad vocal distinta para reducir la exposicion de datos personales antes de su publicacion.
- Investigacion en RL sobre modelos generativos de audio: el repositorio publica checkpoints intermedios cada 250 pasos con estado del optimizador y un manifiesto `RL_CHECKPOINTS.json` con SHA-256, lo que permite reproducir y auditar la evolucion del entrenamiento con ventaja relativa de grupo.
- Evaluacion de modelos de recompensa de audio: el uso del modelo congelado Humaneness Ears Medium como puntuador permite estudiar el comportamiento de recompensas basadas en Production Quality de AudioBox y error en ejes emocionales.
- Experimentacion en conversion de emocion: ajustando los 40 ejes de emocion del vector de condicionamiento se puede explorar la transferencia de estilo expresivo entre locuciones.
- Restauracion o re-estilizado de archivo de audio: siempre que se disponga de los tokens S3 y los Mel/CAMPPlus/99 puntuaciones en el esquema Parquet preparado, se puede regenerar la locucion con una identidad o caracter vocal alternativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no existe una ganancia de calidad demostrada para el snapshot de RL y que la comparacion auditiva y de metricas contra el adaptador supervisado, con semillas emparejadas y UID disjuntos, esta en cola de ejecucion y se anadira solo cuando finalice correctamente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (se menciona una ruta de inferencia explicita para el esquema Parquet preparado, no un pipeline de un comando para WAV arbitrario).
- Latencia y throughput estimados: no disponible.
- Nota: el repositorio ocupa 7,6 GB e incluye los checkpoints `.pt` con estado del optimizador y RNG, ademas de los adaptadores `.safetensors`; los pesos upstream de S3Gen deben descargarse por separado desde ResembleAI/chatterbox.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| laion/chatterbox-s3gen-vc-grow | Adaptador LoRA de conversion de voz audio-a-audio | no disponible | no aplica (25 tokens/s S3) | Sin benchmark publicado | cc-by-4.0 (adaptador), base MIT | HuggingFace, work-in-progress |
| ResembleAI/chatterbox | Modelo base (TTS/audio) | no disponible | no disponible | no disponible | MIT | HuggingFace |
| Otros modelos comparables de conversion de voz | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo esta marcado explicitamente como trabajo en curso (9 de octubre de 2026) y no debe tratarse como un checkpoint validado ni de calidad final.
- El snapshot de RL puede estar explotando su modelo de recompensa; no hay evidencia de mejora de calidad frente al adaptador supervisado.
- La recompensa no mide similitud de hablante, WER ni naturalidad independiente. El Production Quality de AudioBox es un unico eje de salida de Ears, no una puntuacion estetica combinada generica.
- El error de emocion se calcula con el mismo modelo Ears congelado empleado durante el entrenamiento, lo que puede introducir sesgo circular en la evaluacion.
- El fondo de datos mezcla grabaciones reales y clips sinteticos; la seleccion de los 100 mejores ejemplos por eje emocional no garantiza que sean grabaciones reales, y los ejes raros pueden presentar puntuaciones modestas incluso entre sus mejores ejemplos.
- Los conjuntos de retencion del piloto supervisado y del RL estan disjuntos por UID, pero no se ha demostrado que esten disjuntos por hablante.
- El adaptador no es un modelo autonomo: requiere los pesos upstream S3Gen en la revision exacta indicada y no incluye copia de ellos.
- Los archivos `.pt` son checkpoints pickle de Python y deben cargarse solo desde una fuente de confianza al reanudar el entrenamiento; para inferencia deben usarse los `.safetensors`.
- No se dispone de informacion sobre sesgos, idiomas soportados, cuantizacion ni restricciones adicionales de uso comercial mas alla de la licencia CC-BY-4.0 del adaptador y la licencia MIT del modelo base.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/laion/chatterbox-s3gen-vc-grow
- Modelo base: https://huggingface.co/ResembleAI/chatterbox
- Modelo puntuador Humaneness Ears Medium: https://huggingface.co/laion/humaneness-ears-base-medium
