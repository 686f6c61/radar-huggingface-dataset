# Miyauel/meari-accent-chungcheong

## Resumen

Meari accent — Chungcheong es un modelo de texto a voz (TTS) especializado en el acento regional de Chungcheong (충청) del coreano. Lo desarrolla Miyauel como parte de Meari, un motor de síntesis de voz local con licencia MIT, y corresponde únicamente a la etapa GPT de GPT-SoVITS v2ProPlus, exportada a ONNX. No es un modelo completo por sí mismo: debe combinarse con el paquete base `Miyauel/meari-accent-base`, que aporta la etapa de sonido y los valores de voz de referencia.

El modelo parte de los pesos `s1v3.ckpt` de GPT-SoVITS y se ha ajustado finamente durante 2 épocas sobre aproximadamente 10 horas de habla en dialecto de Chungcheong, procedente del conjunto de datos de dialectos coreanos de AI Hub. La relevancia principal es que permite que un lector de voz local reproduzca un rasgo dialectal medible: según la evaluación del autor, el modelo incrementa en 12 puntos porcentuales la probabilidad de que las frases se perciban como Chungcheong frente al modelo base.

El repositorio es pequeño (0,2 GB) y contiene tres ficheros ONNX: el codificador de texto, la etapa de prefill y la etapa de paso autorregresivo. El modelo solo soporta coreano y está pensado para integrarse en el motor Meari, no como un servicio TTS genérico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-SoVITS v2ProPlus, etapa GPT exportada a ONNX (transformer autorregresivo con caché por capa) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion dinamica de 8 bits en la etapa GPT (prefill y step); el codificador de texto se distribuye en ONNX sin cuantizacion indicada |
| Idiomas soportados | Coreano (ko) |
| Licencia | MIT |
| Formato de pesos | ONNX (`t2s_encoder.onnx`, `t2s_prefill.onnx`, `t2s_step.onnx`) |

## Arquitectura y entrenamiento

El modelo es la etapa GPT de GPT-SoVITS v2ProPlus, un sistema TTS de dos etapas en el que la parte GPT predice los tokens acústicos a partir del texto y la etapa SoVITS (incluida en el paquete base) convierte esos tokens en audio. La exportación a ONNX separa el codificador de texto (`t2s_encoder.onnx`) de la etapa autorregresiva, que se divide en `t2s_prefill.onnx` y `t2s_step.onnx` con una caché por capa para acelerar la generación token a token. La etapa GPT usa cuantizacion dinámica de 8 bits.

El ajuste fino se realizó durante 2 épocas sobre unas 10 horas de habla en dialecto de Chungcheong del conjunto «Korean dialect speech of middle-aged and elderly speakers (Chungcheong, Jeolla, Jeju)» de AI Hub, un proyecto de la National Information Society Agency de Corea. El autor señala que el ajuste fino modifica también el embedding de texto, por lo que cada región necesita su propio codificador. No se documentan en la información disponible detalles sobre RLHF, DPO ni composición exacta del dataset más allá de la fuente y el volumen.

## Capacidades

- Síntesis de voz en coreano con acento regional de Chungcheong, integrada en el motor Meari.
- Generación de audio condicionada por valores de voz de referencia del paquete base (no reproduce las voces de los hablantes del dataset).
- Etapa GPT autorregresiva con caché por capa, adecuada para inferencia incremental token a token.
- Exportación ONNX con cuantizacion de 8 bits en la etapa GPT, orientada a despliegue local.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada ni modo de razonamiento; es un modelo exclusivamente TTS.

## Casos de uso

- Lectura de textos en voz alta con acento de Chungcheong: el motor Meari usa este modelo junto con el paquete base para que la salida suene regional en lugar de estándar, algo útil en aplicaciones de accesibilidad o lectura de noticias localizadas.
- Doblaje y locución para contenido ambientado en la región de Chungcheong: series, audiolibros o pódcast donde el acento aporta verosimilitud, usando los valores de voz del paquete base para mantener una identidad vocal consistente.
- Videojuegos y narrativa interactiva: personajes con acento regional diferenciado, cargando el modelo ONNX en local sin depender de servicios en la nube.
- Investigación sobre variación dialectal en TTS: el modelo permite comparar la percepción de acento entre el modelo base y el ajustado, con la metodología de evaluación descrita por el autor.
- Asistentes de voz locales y sin conexión: al ser ONNX y MIT, puede integrarse en aplicaciones de escritorio o dispositivos con recursos limitados dentro del ecosistema Meari.
- Prototipado de voces regionales para coreano: sirve como punto de partida para ajustes finos adicionales sobre otros dialectos, dado que el autor publica codificadores de texto por región.

## Benchmarks y rendimiento

El autor publica una evaluación con un clasificador de dialecto regional sobre frases reservadas, comparando el modelo base y este modelo. Los resultados son porcentajes de frases percibidas como Chungcheong:

| Leído por | Percibido como Chungcheong |
|---|---|
| Grabaciones reales | 55 % (40 frases) |
| Modelo base antes del ajuste, texto en dialecto | 33 % (108 frases) |
| Este modelo, texto en dialecto | 45 % (+12 puntos, intervalo del 95 %: +4 a +20) |
| Modelo base antes del ajuste, texto en coreano estándar | 29 % |
| Este modelo, texto en coreano estándar | 44 % (+16 puntos, intervalo del 95 %: +7 a +24) |

No se han publicado resultados de benchmarks estándar (MOS, WER, MCD) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio completo ocupa 0,2 GB y la etapa GPT está cuantizada a 8 bits, lo que sugiere un consumo moderado, pero no se documentan cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el formato ONNX y el tamaño reducido apuntan a que podría ejecutarse en hardware modesto, pero no hay datos verificados.
- Opciones de despliegue: ONNX Runtime (formato nativo del modelo) e integración en el motor Meari; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo TTS de este tipo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Meari accent — Chungcheong | Etapa GPT de GPT-SoVITS v2ProPlus en ONNX | Coreano | no disponible | MIT | Hugging Face (Miyauel) |
| GPT-SoVITS v2ProPlus (`s1v3.ckpt`) | TTS completo de referencia | Multilingüe (según proyecto) | no disponible | MIT | Hugging Face (lj1995) |
| Meari accent — base | Etapa de sonido y valores de voz de Meari | Coreano | no disponible | MIT | Hugging Face (Miyauel) |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; la única comparación cuantitativa es la del clasificador de dialecto frente al modelo base.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el paquete `Miyauel/meari-accent-base` para generar audio.
- Solo soporta coreano; no hay capacidades multilingües documentadas.
- El ajuste fino se hizo con solo 2 épocas y unas 10 horas de audio, un volumen reducido que puede limitar la generalización a hablantes y estilos no representados.
- El clasificador de dialecto es una medida perceptual aproximada; los intervalos de confianza del 95 % son amplios (+4 a +20 y +7 a +24 puntos), lo que indica incertidumbre considerable.
- Riesgo de alucinación acústica y artefactos propio de los modelos TTS autorregresivos; no se documentan tasas de error.
- Sesgos potenciales derivados del dataset de AI Hub, centrado en hablantes de mediana y avanzada edad de tres regiones; puede no representar el habla joven o urbana.
- El modelo no reproduce las voces de los hablantes del dataset; la identidad vocal proviene de los valores de referencia del paquete base.
- Licencia MIT, lo que permite uso comercial, pero conviene verificar las condiciones del dataset de AI Hub para usos derivados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema muy incipiente y poca validación externa.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Miyauel/meari-accent-chungcheong)
- [Paquete base Meari accent](https://huggingface.co/Miyauel/meari-accent-base)
- [Repositorio del motor Meari](https://github.com/Miyauel/Meari)
- [Pesos GPT-SoVITS (lj1995)](https://huggingface.co/lj1995/GPT-SoVITS)
- [AI Hub (aihub.or.kr)](https://aihub.or.kr)
