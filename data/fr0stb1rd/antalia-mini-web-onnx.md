# fr0stb1rd/antalia-mini-web-onnx

## Resumen

Antalia-2 Mini Web — ONNX weights es una conversión a formato ONNX del modelo de síntesis de voz `cloud0day3/antalia-mini`, publicada por el usuario fr0stb1rd con el objetivo de permitir inferencia de texto a voz (TTS) directamente en el navegador. El modelo está especializado exclusivamente en turco y se distribuye bajo licencia Apache 2.0, con un repositorio de apenas 0,1 GB que empaqueta los pesos en tres etapas diferenciadas: extracción de características textuales, generación de tramas mel mediante un generador DiT con Flow-Matching y vocoder Vocos ConvNeXt a 48 kHz.

La relevancia de esta publicación radica en su enfoque de despliegue: los pesos están pensados para ejecutarse con `onnxruntime-web` sobre WebGPU o WASM, lo que elimina la necesidad de infraestructura de servidor para TTS en aplicaciones web. Incluye además varios diccionarios auxiliares (80.000+ palabras inglesas transcritas fonéticamente al turco, 37.000 entradas de respelling de marcas en CamelCase, 6.000 palabras turcas frecuentes y 14.000 entradas para la decisión de I con punto o sin punto) que resuelven el preprocesado fonético de extranjerismos.

No se dispone de información sobre el número de parámetros, la longitud de contexto ni los datos de entrenamiento del modelo base en la documentación proporcionada, por lo que esos datos se marcan como no disponibles. La ficha se centra en lo que sí está documentado: la arquitectura por etapas, el pipeline de conversión y el caso de uso principal (TTS turco en navegador).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline TTS por etapas: text stage + generador DiT Flow-Matching + vocoder Vocos ConvNeXt |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`text_stage.onnx`, `sound_stage.onnx`, `decoder.onnx`) + JSON auxiliares |
| Frecuencia de muestreo de salida | 48 kHz |
| Tamano del repositorio | 0,1 GB |
| Runtime objetivo | onnxruntime-web (WebGPU / WASM) |
| Modelo base | cloud0day3/antalia-mini |

## Arquitectura y entrenamiento

La arquitectura se organiza en tres etapas encadenadas, cada una exportada como un grafo ONNX independiente. La primera, `text_stage.onnx`, convierte el texto de entrada en características a nivel de carácter y predicciones de duración. La segunda, `sound_stage.onnx`, es un generador basado en Diffusion Transformer (DiT) con Flow-Matching que produce las tramas mel a partir de esas características y duraciones. La tercera, `decoder.onnx`, es un vocoder Vocos con backbone ConvNeXt que transforma las tramas mel en forma de onda a 48 kHz.

El repositorio incluye cuatro ficheros JSON de preprocesado fonético que actúan antes de la etapa de texto: un diccionario CMU inglés-turco con más de 80.000 palabras, un conjunto de 37.000 respellings para partes de palabras en CamelCase (orientado a marcas), una lista de 6.000 palabras turcas frecuentes que actúa como escudo anti-respelling y una lista de 14.000 entradas para decidir el uso de I con punto o sin punto en palabras inglesas. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO sobre el modelo base.

## Capacidades

- Síntesis de voz (text-to-speech) monolingüe en turco.
- Generación de audio a 48 kHz mediante vocoder Vocos ConvNeXt.
- Predicción de duraciones por carácter en la etapa de texto, lo que permite un control implícito del ritmo.
- Manejo de extranjerismos ingleses mediante diccionario fonético CMU adaptado al turco (80.000+ palabras).
- Respellings específicos para marcas y palabras en CamelCase (37.000 entradas).
- Protección contra respellings incorrectos en palabras turcas frecuentes (6.000 entradas).
- Decisión automatizada de I con punto / sin punto en préstamos del inglés (14.000 entradas).
- Inferencia en navegador mediante `onnxruntime-web` con aceleración WebGPU o WASM.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking.

## Casos de uso

- Lectura por voz de contenido web en turco: el modelo puede integrarse en una página mediante `onnxruntime-web` para narrar artículos o secciones de texto sin enviar datos a un servidor, aprovechando la ejecución local en WebGPU.
- Accesibilidad en aplicaciones web turcas: permite ofrecer lectura de pantalla a usuarios con discapacidad visual directamente en el navegador, sin depender de APIs de TTS en la nube ni de conectividad constante.
- Aprendizaje de turco como lengua extranjera: la salida a 48 kHz y el diccionario de extranjerismos permiten generar pronunciaciones inteligibles de textos que mezclan turco e inglés, útil en materiales didácticos.
- Prototipado rápido de interfaces de voz: al ejecutarse en el navegador, permite iterar sobre experiencias de voz (asistentes, formularios hablados) sin montar infraestructura de inferencia.
- Sistemas de anuncios o avisos en comercio electrónico: generación de locuciones breves para productos o promociones en turco, con despliegue estático del repositorio (0,1 GB) en un CDN.
- Aplicaciones offline o de privacidad estricta: al no requerir backend, encaja en escenarios donde el texto del usuario no debe salir del dispositivo, como herramientas internas o entornos regulados.
- Investigación en TTS ligero: la separación en tres grafos ONNX facilita el estudio y la sustitución de etapas (por ejemplo, cambiar el vocoder) sin reentrenar el pipeline completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio completo ocupa 0,1 GB, por lo que los pesos en sí son muy ligeros y compatibles con GPUs integradas.
- GPU recomendadas: no se especifican; el runtime objetivo es `onnxruntime-web`, por lo que el hardware real es la GPU del cliente (WebGPU) o la CPU (WASM).
- Compatibilidad con GPU de consumo: sí, previsiblemente en cualquier GPU con soporte WebGPU en navegadores modernos (Chrome/Edge); en ausencia de WebGPU, la ejecución WASM en CPU es la alternativa.
- Opciones de despliegue: `onnxruntime-web` (WebGPU o WASM) en el navegador; el repositorio se sirve como estático (por ejemplo, desde GitLab Pages, como indica la demo del autor).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones de parámetros del modelo base, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas. Se indica "no disponible".

| Modelo | Parametros | Contexto | Licencia | Despliegue en navegador |
|---|---|---|---|---|
| antalia-mini-web-onnx | no disponible | no disponible | Apache 2.0 | Sí (ONNX + onnxruntime-web) |
| Alternativas TTS turco | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo monolingüe: solo turco; el manejo del inglés se limita a la transcripción fonética de extranjerismos, no a síntesis en inglés.
- No se documentan sesgos conocidos del modelo base, pero al ser un TTS entrenado sobre un corpus no especificado, puede reflejar sesgos de pronunciación o de prosodia del dataset original.
- Riesgo de alucinación acústica: como todo modelo generativo de audio, puede producir artefactos, entonaciones incorrectas o pronunciaciones erróneas en palabras fuera del diccionario.
- Dependencia del preprocesado JSON: el rendimiento en extranjerismos y marcas depende de la cobertura de los diccionarios incluidos; palabras nuevas o neologismos pueden pronunciarse mal.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se distribuye sin garantía ("no warranty") y el autor remite al LICENSE del repositorio de GitLab para los términos completos.
- El modelo base (`cloud0day3/antalia-mini`) no está documentado en la información disponible en cuanto a datos de entrenamiento, parámetros o evaluación, lo que dificulta auditar su calidad.
- El despliegue en navegador depende de la disponibilidad de WebGPU; en navegadores sin soporte, el rendimiento por WASM puede ser notablemente inferior.
- No se documentan métricas objetivas (MOS, WER de transcripción inversa, latencia) que permitan validar la calidad de la síntesis.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fr0stb1rd/antalia-mini-web-onnx
- Modelo base: https://huggingface.co/cloud0day3/antalia-mini
- Repositorio del proyecto de conversión: https://gitlab.com/fr0stb1rd/antalia-mini-web
- Demo en vivo: https://fr0stb1rd.gitlab.io/antalia-mini-web/
- Licencia: https://gitlab.com/fr0stb1rd/antalia-mini-web/-/blob/main/LICENSE
