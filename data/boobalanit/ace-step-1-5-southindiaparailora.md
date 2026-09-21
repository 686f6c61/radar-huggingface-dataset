# boobalanit/ACE-Step-1.5-SouthIndiaParaiLoRA

## Resumen

ACE-Step-1.5-SouthIndiaParaiLoRA es un adaptador LoRA de generación musical publicado por el usuario boobalanit (Boobalan Arjunan) sobre el modelo base ACE-Step/ACE-Step-v1.5. No se trata de un modelo independiente, sino de un ajuste fino de bajo rango (rank 64, alpha 128) que especializa el motor de audio ACE-Step 1.5 en percusión del sur de la India: parai, thappu, thappattam, urumi, ritmos de dappankuthu y kuthu de la tradición folclórica tamil. El repositorio ocupa 0,2 GB y contiene exclusivamente los pesos del adaptador en formato safetensors junto con su configuración.

El problema que resuelve es concreto: los modelos generativos musicales de propósito general producen percusión genérica y rara vez reproducen con fidelidad los patrones rítmicos y la tímbrica de las tradiciones de tambor tamil. Este LoRA se entrenó con 393 bucles de estudio en un rango de 80 a 172 BPM durante 30 épocas sobre una GPU A40, partiendo de una pérdida base de 1,97 hasta 0,48.

Su relevancia es doble. Por un lado, es un caso de estudio de adaptación cultural de modelos generativos mediante LoRA de bajo coste. Por otro, su alcance es deliberadamente estrecho: solo funciona sobre ACE-Step 1.5 (variantes `acestep-v15-xl-base` y `acestep-turbo`) y es incompatible con Stable Diffusion, MusicGen, AudioLDM, Suno o cualquier otra arquitectura generativa. No se han publicado datos sobre la arquitectura interna del modelo base, el número de parámetros ni la longitud de contexto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 64, alpha 128) sobre el modelo base ACE-Step/ACE-Step-v1.5; la arquitectura interna del modelo base no se detalla en la información disponible |
| Parametros totales | No disponible (el repositorio completo del adaptador ocupa 0,2 GB) |
| Parametros activos | No disponible; no se indica que el modelo base sea de tipo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Tamil (ta) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`) más `adapter_config.json` |
| Pipeline | audio-to-audio |
| Modelo base | ACE-Step/ACE-Step-v1.5 (`acestep-v15-xl-base`, `acestep-turbo`) |
| Rango de BPM de entrenamiento | 80 – 172 BPM |
| Dataset de entrenamiento | 393 bucles de estudio de parai, thappu, thappattam y urumi |
| Epocas de entrenamiento | 30 |
| Perdida final | 0,48 (reducción del 75,5 % respecto a una base de 1,97) |
| Hardware de entrenamiento | RunPod A40 (48 GB de VRAM) |

## Arquitectura y entrenamiento

La ficha no describe la arquitectura del modelo base ACE-Step 1.5, por lo que no es posible confirmar si se trata de un transformer de difusión, un modelo autorregresivo sobre códigos de audio o una arquitectura híbrida. Lo único documentado es la naturaleza del adaptador: un LoRA de rango 64 con alpha 128, pensado para inyectarse en el modelo base sin reentrenar los pesos completos. El repositorio resultante es pequeño (0,2 GB), coherente con un adaptador de bajo rango más los archivos de demostración de audio.

El entrenamiento se realizó durante 30 épocas sobre una GPU A40 de 48 GB, con un corpus de 393 bucles de percusión de calidad de estudio que cubren parai, thappu, thappattam y urumi, en un rango de tempo de 80 a 172 BPM. La pérdida pasó de 1,97 a 0,48, una reducción del 75,5 %. No se especifica la composición exacta del dataset, si hubo curación manual, aumentación de datos, ni si se aplicaron técnicas de ajuste adicionales como DPO o refuerzo con feedback humano. Tampoco se detalla la función de pérdida empleada ni la estrategia de validación.

## Capacidades

- Generación de percusión del sur de la India: parai, thappu, thappattam y urumi.
- Producción de ritmos folclóricos tamil, incluidos patrones de dappankuthu y kuthu de alta energía.
- Generación instrumental: los ejemplos de la ficha usan la etiqueta `[Instrumental]`.
- Condicionamiento por prompt de texto: admite descripciones como "high energy South Indian dappankuthu street festival drumming... 4/4 time".
- Control de tempo implícito mediante el prompt, con un rango entrenado de 80 a 172 BPM.
- Flujo audio-to-audio: transformación o adaptación de material de audio existente dentro del pipeline de ACE-Step 1.5.
- Escalado del adaptador ajustable: el ejemplo de la ficha recomienda un LoRA Scale de 0,85.
- Compatibilidad con las variantes `acestep-v15-xl-base` y `acestep-turbo` del modelo base.
- Soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada hablado o capacidades multilingües generales: no disponible (no es un modelo de lenguaje, sino un adaptador de generación musical).

## Casos de uso

- Producción de bandas sonoras para cine y documental: el adaptador genera capas de percusión parai o thappu con tempo controlado para escenas ambientadas en Tamil Nadu, evitando depender de bibliotecas de samples con licencias restrictivas.
- Diseño sonoro para videojuegos: permite crear variaciones de ritmos folclóricos en el rango de 80 a 172 BPM para secuencias de acción, festivales o combate, integrando el adaptador dentro del motor ACE-Step 1.5 en la cadena de producción.
- Creación de sample packs para productores: un estudio puede generar baterías de bucles instrumentales coherentes estilísticamente y publicarlas como librería comercial, siempre que respete la licencia Apache 2.0 y la del modelo base.
- Prototipado rápido para coreógrafos y compañías de danza: generar pistas de dappankuthu o kuthu a partir de una descripción textual reduce el tiempo de prueba respecto a encargar una grabación de percusión en directo.
- Preservación y difusión del patrimonio musical tamil: permite documentar y generar variantes de patrones de parai y thappu para archivos etnomusicológicos, materiales educativos o museos.
- Música para redes sociales y audio branding regional: creación de cortinillas y loops de percusión con identidad sonora del sur de la India para campañas dirigidas a audiencias tamiles.
- Investigación en adaptación cultural de modelos generativos: el adaptador, con su configuración LoRA documentada (rank 64, alpha 128, 30 épocas, pérdida final 0,48), sirve como referencia reproducible para estudiar cómo se especializa un modelo musical en una tradición concreta.
- Educación musical: uso en aulas o talleres para ilustrar patrones rítmicos de parai y thappu a partir de prompts de texto y compararlos con grabaciones reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica objetiva documentada es la pérdida de entrenamiento, que no equivale a una evaluación perceptual de calidad musical.

| Metrica | Valor |
|---|---|
| Perdida inicial (baseline) | 1,97 |
| Perdida final | 0,48 |
| Reduccion de perdida | 75,5 % |
| Epocas | 30 |
| MMLU, HumanEval, GSM8K u otros benchmarks | No aplicable / no disponible |
| Evaluacion subjetiva (MOS, preferencia humana) | No disponible |

## Requisitos de hardware

- Entrenamiento documentado: una GPU A40 con 48 GB de VRAM en RunPod.
- Inferencia: requiere cargar el modelo base ACE-Step/ACE-Step-v1.5 (`acestep-v15-xl-base` o `acestep-turbo`) además del adaptador; la VRAM necesaria no se especifica en la información disponible.
- Tamano en disco del adaptador: 0,2 GB para el repositorio completo, incluidas las demostraciones de audio.
- GPU consumer: no disponible; no se indica si el modelo base cabe en tarjetas como la RTX 4090, 4080 o 3090.
- Despliegue: el autor indica clonar el motor ACE-Step-1.5-PlayGround--Engine, copiar `adapter_model.safetensors` y `adapter_config.json` en `checkpoints/SouthIndiaParaiLoRA/final/` y seleccionar el LoRA en el desplegable de la interfaz. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplica a un modelo de audio).
- Latencia y throughput: no disponible.
- Pasos de uso: un prompt de ejemplo, etiqueta `[Instrumental]` y LoRA Scale de 0,85.

## Comparativa con modelos similares

No se dispone de datos de parámetros, contexto ni rendimiento de las alternativas en la información proporcionada. La propia ficha del autor solo establece compatibilidad e incompatibilidad con otras arquitecturas.

| Modelo | Tipo | Compatibilidad con este LoRA | Licencia | Datos de rendimiento |
|---|---|---|---|---|
| ACE-Step 1.5 + SouthIndiaParaiLoRA | Adaptador LoRA de percusión tamil sobre modelo de audio | — | Apache 2.0 | Perdida final 0,48; sin benchmarks |
| ACE-Step 1.5 (`acestep-v15-xl-base`) | Modelo base de generación musical | Compatible | No disponible | No disponible |
| ACE-Step 1.5 (`acestep-turbo`) | Variante turbo del modelo base | Compatible | No disponible | No disponible |
| MusicGen / AudioLDM / Suno | Modelos generativos de audio de propósito general | No compatible | No disponible | No disponible |
| Stable Diffusion (cualquier versión) | Modelo generativo de imagen | No compatible | No disponible | No aplicable |

## Limitaciones y advertencias

- Dependencia estricta del modelo base: el adaptador no funciona sin ACE-Step/ACE-Step-v1.5 y es explícitamente incompatible con Stable Diffusion, MusicGen, AudioLDM, Suno y cualquier modelo que no sea ACE-Step.
- Corpus de entrenamiento reducido: 393 bucles, lo que limita la variedad tímbrica y aumenta el riesgo de sobreajuste a los patrones presentes en el dataset.
- Ausencia de evaluación objetiva: no hay benchmarks, pruebas de escucha (MOS) ni comparaciones con otras alternativas publicadas.
- Especialización cultural estrecha: el adaptador cubre percusión del sur de la India; no se espera un comportamiento fiable en otros géneros, instrumentos melódicos o tradiciones musicales distintas.
- Sesgo de representación: la selección concreta de intérpretes, grabaciones y regiones dentro de la tradición parai o thappu puede no reflejar la diversidad real de estas prácticas.
- Riesgo de apropiación cultural: la generación automatizada de música ritual o ceremonial debe hacerse con contexto y atribución adecuados; conviene revisar las implicaciones éticas antes de usos comerciales.
- Idiomas: la etiqueta de idioma es `ta` (tamil); no se documenta soporte de prompts en castellano, inglés u otros idiomas, aunque el ejemplo de prompt incluido está en inglés.
- Licencia: Apache 2.0 para el adaptador, pero la licencia y las restricciones del modelo base ACE-Step 1.5 no se detallan; es imprescindible verificarlas antes de un uso comercial.
- Sin validación de la comunidad: 0 descargas y 0 "me gusta" en el momento de la consulta, por lo que no existe retroalimentación externa sobre la calidad o la estabilidad del adaptador.
- La pérdida de entrenamiento (0,48) no garantiza calidad musical percibida; puede coexistir con artefactos, repeticiones o falta de coherencia rítmica en secuencias largas.
- No se documentan límites de duración de audio, resolución de muestreo, ni comportamiento en cuantizaciones reducidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/boobalanit/ACE-Step-1.5-SouthIndiaParaiLoRA
- Modelo base ACE-Step 1.5: https://huggingface.co/ACE-Step/ACE-Step-v1.5
- Perfil del autor en HuggingFace: https://huggingface.co/boobalanit
- Perfil del autor en GitHub: https://github.com/BoobalanArjunan
- Motor de inferencia ACE-Step-1.5-PlayGround--Engine: https://github.com/BoobalanArjunan/ACE-Step-1.5-PlayGround--Engine
- Demostraciones de audio (rutas relativas dentro del repositorio): `audio_demos/Sample1.mp3` (ritmo de calle dappankuthu), `audio_demos/Sample2.mp3` (bucle de percusión de festival), `audio_demos/Sample3.mp3` (patrón rítmico parai), `audio_demos/Sample4.mp3` (groove de thappu), `audio_demos/Sample5.mp3` (kuthu de alta energía), `audio_demos/Sample6.mp3` (ritmo ceremonial lento), `audio_demos/sample7.mp3` (ritmo folclórico tamil)
- Papers, blogs o demos adicionales: no disponible en la información proporcionada
