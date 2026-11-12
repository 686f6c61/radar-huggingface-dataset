# muyleanging/Vacana-TextNorm-Khmer

## Resumen

Vacana-TextNorm-Khmer es un repositorio de Hugging Face creado por el desarrollador Muyleang Ing (usuario `muyleanging`) destinado a alojar un futuro modelo de normalización de texto en jemer (khmer). En el momento de redactar esta ficha, el repositorio no contiene pesos: la propia model card lo declara explícitamente como trabajo en curso ("Work in progress: no model weights here yet"). El objetivo declarado es doble: convertir números, fechas, importes monetarios y unidades a palabras en jemer para síntesis de voz, y convertir la salida de reconocimiento automático de voz en texto legible con puntuación y dígitos.

El modelo se enmarca en una familia de herramientas para jemer del mismo autor: Sota (ASR, en formato ONNX), Chakkhu (OCR), Tossana (captioning), Akkhara (teclado) y VoxPocket (TTS). Vacana se posiciona como la pieza de normalización de texto que conecta la salida de Sota con la entrada de VoxPocket, de modo que el pipeline completo pueda pasar de audio a audio con texto intermedio limpio.

La relevancia actual es limitada desde el punto de vista práctico, porque no hay artefactos descargables ni resultados publicados. Su interés es principalmente informativo: documenta una línea de trabajo sobre normalización de texto para una lengua de bajos recursos como el jemer, con etiquetas que apuntan a despliegue en dispositivo (`onnx`, `on-device`) y a tareas de puntuación y normalización. No se dispone de datos sobre arquitectura, tamaño ni contexto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se etiqueta ONNX, sin detalle de cuantización) |
| Idiomas soportados | jemer (km) |
| Licencia | `other`, con nombre `vacana-tbd` (pendiente de decidir en la primera release) |
| Formato de pesos | no disponible; la etiqueta `onnx` sugiere exportación a ONNX en el futuro, pero no hay pesos publicados |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo. La model card describe un diseño planificado con dos direcciones de normalización: de palabras a texto (puntuación y dígitos para transcripciones de Sota) y de texto a palabras (números, fechas, dinero y unidades leídos en jemer para VoxPocket). El punto de partida declarado es un "rule-based number speller" (deletreador de números basado en reglas) ya utilizado para construir los datos de Sota, marcado como completado dentro de las herramientas de datos de ese proyecto.

No hay datos sobre volumen de entrenamiento, composición del corpus, uso de RLHF/DPO ni innovaciones técnicas. El estado del repositorio indica que el primer modelo llegará "soon" (pronto), sin fecha concreta.

## Capacidades

Las capacidades descritas son las previstas en el diseño, no las de un modelo ya entrenado:

- Normalización de texto jemer en dos direcciones: palabras a texto y texto a palabras.
- Inserción de puntuación y conversión a dígitos en transcripciones de ASR (orientado a la salida de Sota).
- Verbalización de números, fechas, importes monetarios y unidades en jemer (orientado a la entrada de VoxPocket TTS).
- Integración prevista en un pipeline de voz completo del mismo autor (ASR → normalización → TTS).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no; el único idioma declarado es el jemer.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

Los siguientes casos son aplicaciones plausibles del modelo una vez exista, según el diseño declarado en la model card; no son funcionalidades verificadas:

- Postprocesado de transcripciones ASR: tomar la salida de Sota-ASR-Khmer-ONNX y añadir puntuación y dígitos para producir texto legible, aprovechando que ambos modelos comparten autor y pipeline.
- Preprocesado para síntesis de voz: convertir cifras, fechas e importes de un texto escrito en su forma hablada en jemer antes de pasarlo a VoxPocket-TTS, evitando lecturas incorrectas de números.
- Subtitulado y transcripción de reuniones en jemer: normalizar el texto intermedio para que los subtítulos generados sean legibles y no contengan cifras sin expandir.
- Accesibilidad para lectores de pantalla: verbalizar números y fechas en jemer para usuarios con discapacidad visual que consuman contenido escrito.
- Normalización de datos para entrenamiento de ASR/TTS: usar el deletreador de números basado en reglas para generar pares texto-hablado consistentes en corpus de jemer.
- Despliegue en dispositivo: si se materializa la exportación ONNX, ejecutar la normalización localmente en aplicaciones móviles sin conexión, reduciendo latencia y dependencia de servidores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible, al no existir pesos ni tamaño de parámetros declarado.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: la etiqueta `onnx` y `on-device` apuntan a ONNX Runtime como vía prevista; no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de normalización de texto para jemer, y el repositorio no contiene pesos que permitan una comparación técnica.

## Limitaciones y advertencias

- El repositorio no contiene pesos: no es utilizable hoy. Cualquier evaluación de rendimiento es imposible.
- La licencia está sin decidir (`vacana-tbd`): no se puede asumir uso comercial hasta que el autor publique los términos definitivos.
- El alcance lingüístico se limita al jemer; no hay soporte declarado de otras lenguas.
- Al tratarse de un modelo de normalización de texto, cualquier salida incorrecta (por ejemplo, una fecha mal verbalizada) puede propagarse al TTS y producir audio erróneo; se requiere validación en producción.
- Riesgo de alucinación y sesgos: no evaluable sin pesos ni datos de entrenamiento publicados.
- La fecha de creación del repositorio (2026-11-12) y la referencia "soon" no permiten estimar plazos de disponibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/muyleanging/Vacana-TextNorm-Khmer
- Sota-ASR-Khmer-ONNX: https://huggingface.co/muyleanging/Sota-ASR-Khmer-ONNX
- Tossana-Caption-Khmer: https://huggingface.co/muyleanging/Tossana-Caption-Khmer
- VoxPocket-TTS-Khmer: https://huggingface.co/muyleanging/VoxPocket-TTS-Khmer
- Chakkhu (OCR, demo web): https://muyleanging.github.io/chakkhu-web/
- Akkhara (teclado, demo web): https://muyleanging.github.io/akkhara-web/
