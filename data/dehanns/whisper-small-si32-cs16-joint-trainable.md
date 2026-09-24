# dehanns/whisper-small-si32-cs16-joint-trainable

## Resumen

Repositorio de adaptadores LoRA (PEFT) sobre el modelo de reconocimiento automático del habla openai/whisper-small, publicado por el usuario dehanns. Contiene dos adaptadores entrenados de forma secuencial: un adaptador residual de code-switching de rango 16 en la raíz del repositorio y un adaptador de sinhala de rango 32, ya pasado por el entrenamiento de code-switching, en la subcarpeta `si/`.

El objetivo es el reconocimiento de voz con alternancia de idiomas (code-switching) entre sinhala e inglés dentro de un mismo enunciado, un escenario habitual en Sri Lanka que los fine-tunes monolingües de Whisper cubren mal. Según el autor, en inferencia deben cargarse ambos adaptadores simultáneamente sobre el modelo base con peso unitario (SI=1.0, CS=1.0).

En el conjunto de test reservado y rico en code-switching (62 muestras) el autor reporta WER 16,5939 %, CER 6,3282 % y MER 16,4859 %. El coste computacional es bajo (base de 244 M de parámetros más adaptadores de unos pocos MB), pero el repositorio no declara licencia y no cuenta con descargas ni validación independiente en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre el transformer encoder-decoder de openai/whisper-small |
| Parametros totales | No disponible para los adaptadores; el modelo base openai/whisper-small tiene 244 M |
| Longitud de contexto | Ventanas de audio de 30 s (límite nativo de Whisper); no se documentan extensiones de contexto |
| Tipos de cuantizacion | No disponible; los adaptadores se distribuyen en safetensors y se cargan sobre el modelo base, cuya cuantización no se especifica |
| Idiomas soportados | Sinhala (si) e inglés (en), con énfasis en code-switching entre ambos |
| Licencia | No disponible (la model card no declara licencia) |
| Formato de pesos | safetensors (adaptadores PEFT; no se incluyen los pesos del modelo base) |
| Rango LoRA | 16 para el adaptador de code-switching; 32 para el adaptador de sinhala |
| Libreria | peft |
| Tarea | automatic-speech-recognition |
| Tamano del repositorio | 0,0 GB (según HuggingFace) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion en el Hub | 2026-09-24 |
| Ultima actualizacion | 2026-09-25 |

## Arquitectura y entrenamiento

El modelo base, openai/whisper-small, es un transformer encoder-decoder de 244 M de parámetros que convierte un espectrograma log-mel en texto de forma autoregresiva; pertenece a la familia Whisper entrenada por OpenAI sobre 680.000 horas de audio débilmente supervisado (dato del modelo base, no de este repositorio). Sobre esa base congelada, este repositorio añade dos adaptadores LoRA, la técnica estándar de PEFT para especializar un modelo sin reentrenar todos los pesos.

El autor describe una estrategia secuencial «joint-trainable»: un adaptador de sinhala de rango 32 y, después, un adaptador residual de code-switching de rango 16. El adaptador de sinhala distribuido en `si/` es el resultante de ese entrenamiento secuencial y el autor advierte explícitamente de que no debe sustituirse por el checkpoint monolingüe original. En inferencia ambos adaptadores se activan a la vez con peso 1,0. No se proporcionan en la información disponible el volumen de audio o tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO; los detalles quedan en los ficheros `sequential_train_report.json` y `sequential_dependency.json` del repositorio.

## Capacidades

- Transcripción de audio con alternancia sinhala-inglés dentro de un mismo enunciado (code-switching), que es el caso para el que se entrenó el adaptador residual.
- Transcripción monolingüe en sinhala y en inglés, heredada del entrenamiento secuencial y del modelo base.
- Procesamiento de audio en ventanas de 30 s con segmentación y encadenamiento (comportamiento nativo de Whisper).
- Salida con marcas de tiempo si se usa la pipeline estándar de Whisper para ASR.
- Cobertura multilingüe limitada a dos idiomas, frente a la cobertura amplia del modelo base.
- Sin soporte de tool calling ni function calling: es un modelo de ASR, no genera texto libre ni ejecuta herramientas.
- Sin soporte de agentes ni razonamiento multi-paso.
- Sin capacidades de visión, audio-a-audio, audio-a-texto enriquecido ni modo «thinking».

## Casos de uso

- Subtitulado de contenido audiovisual de Sri Lanka: series, informativos y pódcast que alternan sinhala e inglés. El adaptador está entrenado específicamente para esa mezcla, que es donde los modelos monolingües fallan más.
- Transcripción de reuniones bilingües: equipos distribuidos que combinan inglés técnico con sinhala coloquial. Con ventanas de 30 s y encadenamiento se puede transcribir una reunión completa sin reentrenar nada.
- Analítica de call centers: transcripción de grabaciones de atención al cliente para control de calidad, búsqueda por palabras clave y detección de motivos de contacto, incluyendo llamadas con mezcla de idiomas.
- Generación de datasets etiquetados: pseudo-etiquetado de audio en sinhala para entrenar después modelos mayores o sistemas de evaluación, aprovechando el bajo coste de inferencia del base de 244 M.
- Accesibilidad y subtitulado en directo: generación de subtítulos para eventos y emisiones en las que los ponentes cambian de idioma a media frase, siempre que la latencia se gestione con streaming por fragmentos.
- Investigación académica en ASR con code-switching: el repositorio publica el grafo de dependencia secuencial y el informe de entrenamiento, lo que permite reproducir y comparar la estrategia de dos adaptadores frente a alternativas monolíticas.
- Integración en pipelines de transcripción ya existentes: al ser adaptadores PEFT se pueden cargar con `transformers` + `peft` sobre cualquier instalación de `openai/whisper-small`, sin alterar el resto del sistema.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto de evaluacion |
|---|---|---|
| WER | 16,5939 % | Test reservado rico en code-switching (62 muestras) |
| CER | 6,3282 % | Test reservado rico en code-switching (62 muestras) |
| MER | 16,4859 % | Test reservado rico en code-switching (62 muestras) |

El autor indica que el split de test no se utilizó para entrenamiento, selección de modelo ni selección de época. No se han publicado en la información disponible resultados comparativos frente a otros modelos ni métricas en conjuntos externos.

## Requisitos de hardware

- VRAM estimada: el modelo base en fp16 ocupa aproximadamente 0,5 GB y en fp32 alrededor de 1 GB; los adaptadores LoRA añaden unos pocos MB. Con buffers de audio y activaciones, una inferencia típica en fp16 se sitúa en torno a 1,5-2,5 GB de VRAM (estimación derivada del tamaño del modelo base, no publicada por el autor).
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente, por ejemplo GTX 1650, RTX 3050/3060, T4. Una A100 o H100 no aporta ventaja relevante para este tamaño.
- Cabe holgadamente en GPU de consumo: es uno de los puntos fuertes del modelo, al partir de whisper-small en lugar de whisper-large.
- CPU: viable con `transformers` en fp32, aunque notablemente más lento; no se documentan requisitos ni tiempos concretos.
- Opciones de despliegue: `transformers` + `peft` es la ruta documentada por el autor. No hay integración documentada con vLLM, TGI, llama.cpp, Ollama ni faster-whisper para estos adaptadores; para usarlos en esos runtimes habría que fusionar previamente los adaptadores con los pesos del modelo base.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Rendimiento en code-switching si-en | Notas |
|---|---|---|---|---|---|
| dehanns/whisper-small-si32-cs16-joint-trainable | 244 M (base) + adaptadores LoRA | si, en | No disponible | WER 16,59 % (62 muestras held-out del autor) | Estrategia secuencial de dos adaptadores; sin validación independiente |
| openai/whisper-small | 244 M | Cobertura multilingüe amplia | Apache-2.0 (según el repositorio del modelo base) | No evaluado en este test | Sin fine-tuning específico; se espera un rendimiento claramente peor en code-switching si-en |
| openai/whisper-medium | 769 M | Cobertura multilingüe amplia | Apache-2.0 (según el repositorio del modelo base) | No evaluado en este test | Más capacidad a cambio de aproximadamente el triple de parámetros y mayor coste de inferencia |
| Otros fine-tunes de Whisper para sinhala | No disponible | No disponible | No disponible | No disponible | Existen alternativas comunitarias en el Hub, pero no hay métricas en la información proporcionada |

## Limitaciones y advertencias

- Licencia no declarada: el uso comercial es jurídicamente incierto. Antes de desplegarlo en producción hay que confirmar los términos con el autor y verificar la licencia del modelo base.
- Sin validación independiente: 0 descargas y 0 likes en el momento de redactar la ficha, y todas las métricas proceden de la propia model card.
- Conjunto de evaluación muy pequeño (62 muestras): los intervalos de confianza del WER son amplios y un 16,59 % de WER sigue siendo alto para transcripción de producción sin revisión humana.
- No se publican datos de entrenamiento: se desconoce la procedencia del audio, su cobertura dialectal y si existe consentimiento de los hablantes, lo que limita la evaluación de sesgos.
- Whisper es propenso a alucinar en silencios, ruido o música, y a generar repeticiones; los adaptadores LoRA no eliminan ese comportamiento heredado.
- La configuración de inferencia es estricta: ambos adaptadores deben estar activos con peso exacto (SI=1.0, CS=1.0). Otras combinaciones degradan el resultado.
- El adaptador de `si/` no es el checkpoint monolingüe original de sinhala; el autor advierte de que no debe sustituirse por este último.
- Cobertura lingüística restringida a sinhala e inglés: no generaliza a otros idiomas ni a variedades no representadas en el entrenamiento.
- Sin soporte documentado en runtimes de alto rendimiento (vLLM, TGI, whisper.cpp, faster-whisper) salvo que se fusionen los adaptadores con los pesos base, lo que impide aprovechar optimizaciones específicas.
- La fecha de creación registrada en el Hub (2026-09-24) resulta anómala respecto a la fecha de consulta, lo que apunta a un posible error en los metadatos del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dehanns/whisper-small-si32-cs16-joint-trainable
- Subcarpeta con el adaptador de sinhala: https://huggingface.co/dehanns/whisper-small-si32-cs16-joint-trainable/tree/main/si
- Grafo de dependencia secuencial: https://huggingface.co/dehanns/whisper-small-si32-cs16-joint-trainable/blob/main/sequential_dependency.json
- Informe de entrenamiento secuencial: https://huggingface.co/dehanns/whisper-small-si32-cs16-joint-trainable/blob/main/sequential_train_report.json
- Métricas del test rico en code-switching: https://huggingface.co/dehanns/whisper-small-si32-cs16-joint-trainable/blob/main/rich_codeswitched_test_metrics.json
- Modelo base: https://huggingface.co/openai/whisper-small
- Paper de Whisper: https://arxiv.org/abs/2212.04356
