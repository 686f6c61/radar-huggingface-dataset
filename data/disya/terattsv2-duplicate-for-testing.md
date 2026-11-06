# Disya/TeraTTSv2-Duplicate-for-testing

## Resumen

TeraTTSv2 es un sistema de síntesis de voz (text-to-speech) empaquetado como modelo ONNX Runtime autocontenido, publicado por el desarrollador Disya en Hugging Face como una réplica de pruebas del modelo original de TeraSpace. El modelo convierte texto en ruso e inglés en audio mono a 44.100 Hz mediante un pipeline de difusión con muestreadores seleccionables, diez estilos de voz precalculados y marcado automático de acentos en ruso. Su relevancia radica en que ofrece TTS bilingüe con salida en streaming y despliegue local sin dependencia de servicios en la nube, todo dentro de un repositorio de 1,2 GB.

La arquitectura combina un codificador de texto con un modelo de difusión que genera la forma de onda, e incluye dos variantes del muestreador: un "teacher" de 25 segundos con CFG ajustable y un "student" destilado de ocho pasos con CFG 3 fijado en el grafo, que prioriza la velocidad. El marcado de acentos rusos se realiza mediante los grafos ONNX de RUAccent, con un modo de diccionario alternativo para entornos con menos memoria.

Esta ficha describe la réplica alojada en el repositorio `Disya/TeraTTSv2-Duplicate-for-testing`, que reproduce la model card y los pesos del modelo original `TeraSpace/TeraTTSv2`. La licencia es Open RAIL-M con una condición adicional de atribución comercial, lo que permite uso comercial con obligaciones de crédito público al modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codificador de texto + modelo de difusión para síntesis de audio, empaquetado en ONNX Runtime |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (procesa texto por segmentos con etiquetas `<en>`/`<ru>`) |
| Tipos de cuantización | no disponible (se distribuye en formato ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | Ruso e inglés (etiquetas de idioma obligatorias: `<ru>…</ru>`, `<en>…</en>`) |
| Licencia | terattsv2-openrail-m-commercial-attribution (Open RAIL-M + atribución comercial) |
| Formato de pesos | ONNX (ejecutable con onnxruntime; carga vía `transformers` con `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de dos etapas: un codificador de texto que normaliza la entrada (expansión de números, marcado de acentos y normalización Unicode) y un modelo de difusión que genera la forma de onda a partir de las representaciones del texto y del estilo de voz seleccionado. La variante "teacher" corresponde a un modelo entrenado sobre un corpus limpio inglés/ruso de 25 segundos y admite ajuste de CFG (classifier-free guidance) en tiempo de inferencia; la variante "student" es una destilación de ocho pasos con CFG 3 incorporado en el grafo, pensada para reducir la latencia.

El marcado de acentos en ruso se delega a los grafos ONNX derivados de RUAccent, que se ejecutan en el propio runtime. El modelo acepta marcadores manuales `+` que tienen prioridad sobre la asignación automática. No se han publicado en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal más allá del esquema de destilación del muestreador.

## Capacidades

- Generación de voz bilingüe ruso/inglés a partir de texto con etiquetas de idioma obligatorias.
- Diez estilos de voz precalculados: `ru_f1` y `ru_m5` (recomendados para ruso), `ru_f2`, `ru_m1`, `eng_f3`, `eng_f4_whisper`, `eng_f5`, `eng_m2_whisper`, `eng_m3` y `eng_m4`.
- Control de velocidad mediante `duration_scale` (valores mayores producen habla más lenta y larga).
- Dos muestreadores de difusión: `distilled` (rápido, ocho pasos, CFG 3 fijo) y `teacher` (CFG ajustable).
- Marcado automático de acentos en ruso con RUAccent, con modo `full` (redes neuronales ONNX + diccionarios) o `dictionary` (solo diccionarios, menor memoria).
- Expansión automática de números a palabras en el idioma correspondiente antes de la síntesis.
- Salida de audio mono en `float32` a 44.100 Hz y escritura directa a WAV PCM de 16 bits.
- Salida de audio en streaming.
- Inspección del texto normalizado final mediante `normalize_text`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- **Locución automatizada para contenido en ruso e inglés**: el modelo genera voz natural a 44.100 Hz con estilos masculinos y femeninos, adecuado para narración de vídeos, audiolibros o pódcasts donde se necesita alternar ambos idiomas en un mismo flujo.
- **Asistentes de voz locales sin nube**: al ejecutarse sobre ONNX Runtime con `CPUExecutionProvider`, permite integrar TTS en aplicaciones de escritorio o dispositivos embebidos que no pueden enviar texto a servicios externos por privacidad o conectividad.
- **Accesibilidad y lectura de pantalla**: la salida en streaming y el control de `duration_scale` permiten ajustar la velocidad del habla a las preferencias del usuario en lectores de pantalla para contenidos rusos o ingleses.
- **Sistemas de atención al cliente con respuesta hablada**: el modelo puede sintetizar respuestas generadas por un LLM en ruso o inglés, con selección de voz por género y control de ritmo para adaptarse al tono de la conversación.
- **Doblaje y previsualización de guiones**: la posibilidad de etiquetar segmentos `<ru>` y `<en>` en un mismo texto facilita generar borradores de doblaje bilingües antes de la locución definitiva.
- **Prototipado de interfaces conversacionales**: el muestreador destilado de ocho pasos reduce la latencia, lo que permite iterar rápidamente en el diseño de experiencias de voz sin esperar síntesis lentas.
- **Generación de material educativo de idiomas**: la expansión automática de números y el marcado de acentos en ruso ayudan a producir ejemplos de pronunciación correcta para estudiantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explícita; el repositorio ocupa 1,2 GB, por lo que la inferencia en CPU es viable con el proveedor `CPUExecutionProvider`.
- **GPU recomendadas**: no se documentan GPU concretas; el modelo está diseñado para ejecutarse en CPU con ONNX Runtime (`provider="CPUExecutionProvider"`, `threads=6` en los ejemplos).
- **GPU de consumo**: no se confirma compatibilidad con GPUs de consumo como RTX 4090; al ser un modelo ONNX de 1,2 GB, es plausible que quepa en GPUs con 4-8 GB de VRAM, pero no hay datos oficiales.
- **Opciones de despliegue**: ONNX Runtime (principal), carga vía `transformers` con `trust_remote_code=True`; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponibles; el muestreador `distilled` de ocho pasos está pensado para ser más rápido que el `teacher`, pero no se publican cifras.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se indica "no disponible".

## Limitaciones y advertencias

- **Etiquetas de idioma obligatorias**: el runtime rechaza texto sin etiquetas `<en>`/`<ru>` o con etiquetas desbalanceadas; esto limita la entrada directa de texto sin preprocesar.
- **Idiomas limitados**: solo ruso e inglés; los caracteres fuera del vocabulario se omiten con una advertencia en tiempo de ejecución.
- **Calidad en cruce de idiomas**: la propia model card advierte que, al usar una voz inglesa para hablar ruso, conviene probar `duration_scale` por debajo de 1 (por ejemplo 0,8), lo que indica posibles artefactos en ese escenario.
- **Acentos rusos**: el marcado automático puede fallar en palabras ambiguas; los marcadores manuales `+` son la única forma de garantizar la pronunciación correcta.
- **Licencia con atribución comercial**: el uso comercial exige mencionar públicamente "TeraTTSv2 by TeraSpace" con enlace al modelo; las redistribuciones deben incluir ambas licencias y preservar las restricciones de uso upstream.
- **Componentes con licencia separada**: los componentes de RUAccent tienen su propia licencia (véase `RUACCENT_NOTICE.txt`), lo que añade obligaciones adicionales.
- **Riesgo de alucinación**: no aplica en el sentido de generación de texto, pero la síntesis puede producir pronunciaciones incorrectas o artefactos en entradas atípicas.
- **Sesgos**: no se documentan sesgos conocidos en la información disponible.
- **Repositorio de pruebas**: esta réplica (`Disya/TeraTTSv2-Duplicate-for-testing`) tiene 30 descargas y 0 likes; para producción conviene usar el repositorio original `TeraSpace/TeraTTSv2`.

## Enlaces

- Repositorio de esta réplica: https://huggingface.co/Disya/TeraTTSv2-Duplicate-for-testing
- Repositorio original: https://huggingface.co/TeraSpace/TeraTTSv2
- Licencia del modelo: https://huggingface.co/TeraSpace/TeraTTSv2/blob/main/LICENSE
- Aviso de licencia de RUAccent: https://huggingface.co/TeraSpace/TeraTTSv2/blob/main/RUACCENT_NOTICE.txt
