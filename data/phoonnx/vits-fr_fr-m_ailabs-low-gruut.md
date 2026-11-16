# Phoonnx/vits-fr_fr-m_ailabs-low-gruut

## Resumen

`vits-fr_fr-m_ailabs_low-gruut` es un modelo de síntesis de voz (text-to-speech) en francés de Francia, empaquetado en formato ONNX por Phoonnx a partir de una voz original de Mycroft AI para su proyecto Mimic3. El modelo emplea la arquitectura VITS, un sistema end-to-end que combina un codificador de texto, un predictor de duración y un decodificador generativo basado en flujos normalizadores y un vocoder HiFi-GAN integrado, lo que permite generar audio de forma directa sin etapas separadas de alineamiento o vocoder externo.

Se trata de una voz de calidad "low" según la nomenclatura de Mimic3, lo que implica un modelo de menor tamaño orientado a entornos con recursos limitados, como asistentes de voz embebidos, dispositivos de bajo consumo o sistemas de respuesta por voz en tiempo real. El modelo solo acepta texto en francés y espera como entrada fonemas en alfabeto IPA generados por el fonemizador gruut, por lo que el pipeline de inferencia incluye una etapa obligatoria de normalización y fonemización del texto.

Su relevancia actual reside en que permite desplegar TTS en francés sobre ONNX Runtime sin dependencias de PyTorch, integrándose en el stack OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`. El repositorio ocupa 0,1 GB y no registra descargas ni interacciones en el momento de la consulta, lo que indica que es un artefacto de empaquetado reciente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS con flujos normalizadores y vocoder integrado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS; la entrada es una frase) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | frances de Francia (fr-FR) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx (Python), con plugin OVOS |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz condicional variacional que integra en un único modelo el codificador de texto, el predictor de duración estocástico, el decodificador basado en flujos normalizadores y un vocoder de tipo HiFi-GAN. Esta integración permite entrenar el sistema de forma end-to-end con una pérdida combinada de reconstrucción espectral, adversarial y de alineamiento monotónico variacional (VITS), evitando la necesidad de alineamientos explícitos entre texto y audio. El modelo aquí publicado es la variante "low" de la voz `m-ailabs_low` de Mimic3, lo que sugiere una configuración reducida de canales y capas respecto a las variantes "medium" o "high" del mismo proyecto.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o ajuste fino posteriores. La voz original proviene del repositorio `MycroftAI/mimic3-voices`, que a su vez deriva de voces entrenadas con el corpus M-AILABS (M-AILABS Speech Dataset), un conjunto multilingüe de audiolibros y corpus de voz. El empaquetado actual solo convierte los pesos a ONNX y añade la integración con el fonemizador gruut; no se documenta ningún reentrenamiento por parte de Phoonnx.

## Capacidades

- Síntesis de voz en francés de Francia a partir de texto escrito, con salida en formato WAV.
- Fonemización automática mediante `GruutPhonemizer` del paquete `scriptconv[gruut]`, que normaliza el texto y lo convierte a fonemas IPA antes de la inferencia.
- Generación de audio end-to-end en una sola pasada, sin vocoder externo.
- Ejecución sobre ONNX Runtime, lo que permite despliegue en CPU sin GPU y en entornos embebidos.
- Integración con el ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni otras capacidades de los modelos de lenguaje; es exclusivamente un modelo TTS.
- No soporta visión, audio de entrada ni modo "thinking".
- No es multilingüe: únicamente francés de Francia.

## Casos de uso

- Asistentes de voz embebidos en dispositivos de bajo consumo: al ejecutarse sobre ONNX Runtime en CPU, el modelo puede sintetizar respuestas en francés en raspberry Pi o dispositivos similares sin GPU, integrándose en OVOS mediante el plugin correspondiente.
- Respuesta por voz en sistemas de atención al cliente en francés: permite convertir respuestas textuales generadas por un LLM en audio, con latencia baja gracias al tamaño reducido de la variante "low".
- Lectura de notificaciones y alertas en aplicaciones de escritorio o móviles: la salida WAV directa facilita la reproducción en cualquier reproductor estándar.
- Accesibilidad para personas con discapacidad visual: lectura de textos en francés en pantalla, con normalización de números y abreviaturas a cargo de scriptconv antes de la fonemización.
- Generación de audiolibros o contenido narrado de forma automatizada: aunque la calidad "low" limita su uso en producción editorial, es adecuada para prototipos y borradores de narración.
- Pruebas de integración en pipelines de TTS: sirve como voz de referencia para validar el funcionamiento de phoonnx y scriptconv antes de pasar a voces de mayor calidad.
- Sistemas de domótica con interfaz por voz en francés: anuncios de estado, confirmaciones de comandos y avisos programados en un asistente doméstico local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0,1 GB, es probable que quepa en memoria RAM de sistemas muy modestos, pero no se documenta una cifra concreta.
- GPU recomendadas: no aplica; el modelo está pensado para ejecución en CPU mediante ONNX Runtime.
- Compatibilidad con GPU de consumo: no se documenta soporte GPU específico; al ser ONNX, podría ejecutarse con proveedores de ejecución CUDA o DirectML si el runtime lo permite, pero no está confirmado.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft, y ONNX Runtime directamente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| vits-fr_fr-m_ailabs-low-gruut (este) | VITS low | fr-FR | 0,1 GB | CC-BY-SA-4.0 | ONNX | Empaquetado para phoonnx, entrada con gruut |
| Otras voces VITS de la coleccion Phoonnx | VITS (low/medium/high) | varios | variable | variable | ONNX | Misma libreria, distintas calidades e idiomas |
| Voces originales de Mimic3 | VITS | varios | variable | variable | varios | Requieren el stack Mimic3 original, no ONNX |
| Piper TTS | VITS | varios | variable | variable | ONNX | Alternativa popular de TTS ONNX, con soporte comunitario amplio |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Calidad "low": la variante reducida del modelo puede producir audio con menor naturalidad y prosodia que las variantes "medium" o "high" de la misma voz.
- Dependencia obligatoria del fonemizador gruut: si el texto no se normaliza y fonemiza correctamente, la síntesis puede fallar o producir audio inteligible.
- Solo francés de Francia: no soporta otros idiomas ni variantes regionales del francés.
- Licencia CC-BY-SA-4.0: permite uso comercial, pero obliga a atribuir la autoría y a compartir las obras derivadas bajo la misma licencia, lo que puede ser restrictivo para productos propietarios.
- Riesgo de alucinación en TTS: el modelo puede generar artefactos, silencios inesperados o pronunciaciones incorrectas en textos con nombres propios, siglas o palabras fuera del vocabulario de entrenamiento.
- Sin información sobre sesgos: no se documentan sesgos de género, acento o prosodia en la model card.
- Repositorio sin descargas ni interacciones: no hay evidencia de validación comunitaria ni de mantenimiento activo más allá de la fecha de creación.
- Sin datos de benchmarks ni de latencia: no es posible garantizar un rendimiento concreto en producción sin pruebas propias.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phoonnx/vits-fr_fr-m_ailabs-low-gruut)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Coleccion VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
- [Voz original en MycroftAI/mimic3-voices](https://github.com/MycroftAI/mimic3-voices/tree/master/voices/fr_FR/m-ailabs_low)
