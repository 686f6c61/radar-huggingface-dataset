# muyleanging/Sati-KWS-Khmer

## Resumen

Sati-KWS-Khmer es un repositorio de Hugging Face destinado a alojar un modelo de deteccion de palabras clave (keyword spotting, KWS) y wake word para el idioma jemer (khmer). Lo desarrolla Muyleang Ing dentro de una familia de herramientas linguisticas para jemer que incluye Sota (ASR), Chakkhu (OCR), Tossana (captioning), Akkhara (teclado) y VoxPocket (TTS). El objetivo declarado es un modelo lo suficientemente pequeno como para ejecutarse de forma continua en un telefono o dispositivo de bajos recursos, escuchando una wake word y comandos de voz cortos en jemer.

En el momento de redactar esta ficha, el repositorio no contiene pesos: la propia model card indica explicitamente "Work in progress: no model weights here yet". Por tanto, no existen parametros publicados, ni arquitectura definida, ni resultados de evaluacion. La informacion disponible se limita al diseno previsto: un conjunto reducido de comandos en jemer (por ejemplo "បើកភ្លើង", encender la luz), entrenamiento con grabaciones reales mas voces sinteticas generadas por VoxPocket, el mismo front-end de audio que Sota y exportacion a ONNX en int8.

Su relevancia actual es prospectiva: cubre un hueco poco atendido, el de wake word y comandos de voz on-device para jemer, un idioma con escasa representacion en el ecosistema de modelos de voz. No obstante, al no haber artefactos publicados, no puede evaluarse ni desplegarse todavia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (diseno previsto: front-end de audio comun con Sota ASR) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (tarea de clasificacion de audio por ventana) |
| Tipos de cuantizacion | int8 (exportacion ONNX prevista) |
| Idiomas soportados | jemer (km) |
| Licencia | otra, nombre "sati-tbd" (pendiente de decidir con la primera release) |
| Formato de pesos | ONNX (previsto); no hay pesos publicados |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo. La model card solo anticipa que compartira el mismo front-end de audio que Sota-ASR-Khmer-ONNX, lo que sugiere un pipeline de extraccion de caracteristicas acusticas comun seguido de un clasificador ligero de palabras clave, pero no se especifica el tipo de red (CNN, transformer pequeno, modelo tipo KWS por frames, etc.) ni el numero de parametros.

Respecto al entrenamiento, el plan descrito consiste en entrenar con un conjunto pequeno de comandos en jemer usando una mezcla de grabaciones reales y voces sinteticas generadas con VoxPocket-TTS-Khmer. No se indica numero de horas de audio, composicion del dataset, si habra aumento de datos, ni si se aplicara algun tipo de ajuste fino o destilacion. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o mecanismos de streaming, mas alla de la intencion de ejecucion on-device mediante ONNX cuantizado a int8.

## Capacidades

- Deteccion de wake word en jemer (prevista): activacion del dispositivo al pronunciar una palabra de activacion.
- Reconocimiento de un conjunto reducido de comandos de voz cortos en jemer (por ejemplo, "បើកភ្លើង").
- Clasificacion de audio (pipeline_tag: audio-classification).
- Ejecucion on-device: el objetivo es un modelo "tiny" que corra de forma continua en telefono o dispositivo pequeno.
- Exportacion a ONNX int8 para inferencia eficiente en CPU.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio generativo ni modo thinking.

## Casos de uso

- Wake word en asistentes de voz para jemer: el modelo escucharia de forma continua una palabra de activacion y despertaria al asistente principal (por ejemplo, Sota para ASR), reduciendo el consumo energetico al no mantener el reconocimiento completo siempre activo.
- Control por voz de dispositivos del hogar: comandos cortos como encender o apagar luces permitirian integrar el modelo en microcontroladores o telefonos para domotica basica en jemer.
- Accesibilidad para usuarios jemer: activacion manos libres de aplicaciones en telefonos para personas con movilidad reducida, usando comandos cortos predefinidos.
- Interfaces de voz de bajo consumo en apps moviles: al ser un modelo pequeno exportado a ONNX int8, podria integrarse en aplicaciones Android o iOS para activacion por voz sin enviar audio a la nube, preservando la privacidad.
- Kioscos o dispositivos empotrados en entornos con conectividad limitada: la inferencia local evita depender de servicios cloud y funciona en zonas con red intermitente.
- Filtro previo en pipelines de ASR: detectar cuando el usuario habla y activar el reconocimiento completo solo entonces, ahorrando computo en dispositivos con bateria limitada.
- Investigacion en KWS para lenguas de bajos recursos: serviria como referencia para estudiar tecnicas de entrenamiento con datos sinteticos (VoxPocket) en jemer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene pesos ni metricas de evaluacion (accuracy, falsos positivos por hora, latencia, etc.).

## Requisitos de hardware

- VRAM estimada: no disponible (no hay pesos ni numero de parametros publicados).
- GPU recomendadas: no disponible; por el caracter on-device del proyecto, se orienta a CPU y aceleradores de baja potencia mas que a GPU de datacenter.
- Compatibilidad con GPU de consumo: no disponible; el diseno previsto apunta a ejecucion en telefono o dispositivo pequeno, no a GPU dedicada.
- Opciones de despliegue: ONNX Runtime (formato previsto, int8); no se confirman otros runtimes como vLLM, llama.cpp, Ollama o TGI, que ademas no aplican a un clasificador de audio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de keyword spotting o wake word especificos para jemer, ni se dispone de especificaciones del propio modelo que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- El repositorio no contiene pesos: no es desplegable ni evaluable en su estado actual.
- No hay arquitectura, numero de parametros, dataset ni metricas publicadas; toda la informacion tecnica es prospectiva.
- La licencia esta sin decidir ("sati-tbd"), por lo que no puede confirmarse el uso comercial.
- El alcance linguistico es unicamente jemer; no se contemplan otros idiomas.
- El conjunto de comandos previsto es reducido, lo que limita la expresividad del sistema a un vocabulario cerrado.
- El entrenamiento con voces sinteticas (VoxPocket) puede introducir sesgos hacia las caracteristicas acusticas del TTS y reducir la robustez ante hablantes reales, acentos o ruido ambiental; no se documenta mitigacion.
- Riesgo de falsos positivos y falsos negativos inherente a todo sistema de wake word; no hay datos de tasa de activacion falsa por hora.
- No se especifican requisitos de privacidad ni tratamiento del audio capturado de forma continua.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/muyleanging/Sati-KWS-Khmer
- Sota-ASR-Khmer-ONNX (ASR, mismo front-end de audio previsto): https://huggingface.co/muyleanging/Sota-ASR-Khmer-ONNX
- Chakkhu (OCR): https://muyleanging.github.io/chakkhu-web/
- Tossana-Caption-Khmer (captioning): https://huggingface.co/muyleanging/Tossana-Caption-Khmer
- Akkhara (teclado): https://muyleanging.github.io/akkhara-web/
- VoxPocket-TTS-Khmer (TTS, usado para generar voces de entrenamiento): https://huggingface.co/muyleanging/VoxPocket-TTS-Khmer
