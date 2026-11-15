# Phoonnx/vits-hf_community_HirCoir_piper-sorah-neuronal

## Resumen

`vits-hf_community_HirCoir_piper-sorah-neuronal` es un modelo de síntesis de voz (text-to-speech) publicado por el usuario Phoonnx dentro de su agregador `Phoonnx/phoonnx-vits`. Se trata de una extracción de una carpeta concreta (`hf_community__HirCoir__piper-sorah-neuronal`) del repositorio mayor, empaquetada para su uso con la librería `phoonnx`, una herramienta de inferencia TTS basada en ONNX mantenida por TigreGotico. El modelo se distribuye en formato ONNX y emplea la arquitectura VITS, un esquema generativo condicional de extremo a extremo habitual en voces Piper.

El origen de la voz es la comunidad de Piper (`HirCoir` / `piper-sorah-neuronal`), lo que lo sitúa en el ecosistema de voces neuronales ligeras pensadas para ejecución local y de baja latencia. El repositorio ocupa aproximadamente 0,1 GB, un tamaño coherente con un checkpoint VITS de una sola voz y cuantización ligera, apto para CPU y dispositivos con recursos limitados.

La relevancia de esta ficha es acotada: se trata de un artefacto derivado, con cero descargas y cero likes en el momento de la consulta, sin model card propia más allá de la referencia al repositorio fuente y sin datos de idioma declarados. Resulta útil para quien necesite integrar una voz Piper concreta a través de `phoonnx`, pero no constituye un modelo fundacional ni aporta innovaciones técnicas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech de extremo a extremo, formato ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; el repo fuente no detalla variantes) |
| Idiomas soportados | no disponible (la model card no declara idioma; la voz de origen es `piper-sorah-neuronal`, presumiblemente gallego por el topónimo `HirCoir`, sin confirmación oficial) |
| Licencia | MIT (según metadatos del repo; la card advierte que las licencias siguen a los originales por subcarpeta) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS, un sistema de síntesis de voz de extremo a extremo que combina un codificador de texto, un prior variacional condicionado por texto, un decoder generativo basado en flujos normalizadores y un discriminador adversarial multiperiodo durante el entrenamiento. Este diseño permite generar waveforms directamente desde fonemas sin necesidad de un vocoder externo, lo que reduce la latencia y simplifica el despliegue. La variante empaquetada aquí corresponde a una voz Piper, cadena de herramientas que entrena VITS sobre corpus fonemizados con espeak-ng y exporta el resultado a ONNX para inferencia ligera.

No se dispone de información sobre el corpus de entrenamiento: ni número de horas de audio, ni composición del dataset, ni si hubo ajuste fino con RLHF o preferencias (poco habitual en TTS). Tampoco se documentan innovaciones técnicas adicionales más allá de las propias de VITS y del pipeline Piper. El repositorio fuente `Phoonnx/phoonnx-vits` actúa como agregador de voces Piper convertidas o reempaquetadas, y esta carpeta concreta conserva las rutas originales del repositorio de procedencia.

## Capacidades

- Síntesis de voz a partir de texto (text-to-speech) en una única voz identificada como `hf_community/HirCoir/piper-sorah-neuronal`.
- Generación de audio en formato waveform mediante inferencia ONNX, sin vocoder separado.
- Ejecución local y ligera gracias al tamaño reducido del checkpoint (~0,1 GB).
- Integración con la librería `phoonnx` para carga y ejecución del modelo.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje.
- No dispone de modo thinking, visión ni audio de entrada.
- Capacidades multilingües: no declaradas en la model card; dependen de la voz Piper de origen.

## Casos de uso

- Lectura de artículos y documentos en aplicaciones de accesibilidad: el modelo convierte texto plano en audio con un checkpoint de ~0,1 GB, adecuado para ejecutarse en dispositivos de gama baja o en el navegador mediante ONNX Runtime Web.
- Asistentes de voz embebidos en dispositivos IoT: al ser un VITS exportado a ONNX, puede desplegarse en Raspberry Pi o microcontroladores con NPU sin depender de servicios en la nube, reduciendo latencia y coste por petición.
- Generación de avisos y locuciones pregrabadas en aplicaciones móviles: la voz Piper permite sintetizar mensajes dinámicos (notificaciones, alertas) en tiempo de ejecución sin almacenar audio estático.
- Prototipado de interfaces conversacionales: útil para validar flujos de voz en productos antes de contratar voces comerciales, dado que la licencia MIT facilita la experimentación.
- Audiolibros y contenido educativo de bajo coste: la síntesis local permite generar horas de audio sin cuotas de API, siempre que la calidad de la voz Piper de origen sea suficiente para el caso.
- Pruebas de integración en pipelines de `phoonnx`: sirve como voz de referencia para validar el cargador ONNX, el front-end fonético y el rendimiento del runtime en distintas plataformas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repo (~0,1 GB) se espera un consumo de memoria muy bajo, del orden de cientos de MB incluyendo el runtime ONNX.
- GPU recomendadas: no se especifican; el modelo está pensado para ejecución en CPU y, opcionalmente, en GPU mediante ONNX Runtime con proveedores CUDA o DirectML.
- Cabe en GPU de consumo: sí, con margen amplio, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.), aunque no es necesario acelerador dedicado.
- Opciones de despliegue: `phoonnx` (librería nativa del modelo), ONNX Runtime (CPU, CUDA, DirectML, CoreML), y potencialmente servidores compatibles con Piper si aceptan el mismo formato de checkpoint.
- Latencia y throughput estimados: no disponibles; en VITS sobre CPU se suele obtener audio en tiempo real o más rápido, pero no hay cifras publicadas para esta voz concreta.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tamano | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| vits-hf_community_HirCoir_piper-sorah-neuronal | VITS | ~0,1 GB | MIT | ONNX | Voz Piper empaquetada para `phoonnx`; sin benchmarks ni idioma declarado |
| Piper (voces oficiales, p. ej. es_ES-davefx-medium) | VITS | ~60-100 MB | MIT / otras según voz | ONNX | Ecosistema de referencia; voces documentadas con idioma y calidad |
| Coqui TTS (VITS multilingüe) | VITS | variable (100 MB - 1 GB) | MPL-2.0 / otras | PyTorch, ONNX | Framework completo con entrenamiento y fine-tuning |
| Kokoro TTS | StyleTTS2 / híbrido | ~80-300 MB | Apache-2.0 | ONNX, PyTorch | Voces de mayor calidad percibida, ecosistema más activo |

La comparación es aproximada: no hay datos públicos de calidad objetiva (MOS) para esta voz concreta, y las alternativas se citan por categoría (TTS neuronal ligero en ONNX) más que por equivalencia exacta.

## Limitaciones y advertencias

- Modelo derivado y de agregación: no aporta model card propia ni documentación sobre el corpus de entrenamiento, por lo que la calidad y cobertura fonética son inciertas.
- Idioma no declarado: la model card no especifica el idioma de la voz; el nombre sugiere gallego (`sorah`, `HirCoir`), pero no está confirmado oficialmente.
- Licencia ambigua en origen: aunque los metadatos indican MIT, la card advierte que las licencias siguen a los originales por subcarpeta y menciona casos con `license: other`; conviene revisar la carpeta fuente antes de uso comercial.
- Sin benchmarks ni métricas de calidad (MOS, WER, RTF) publicadas.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria.
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí de pronunciación incorrecta en palabras fuera del vocabulario o en idiomas distintos al de entrenamiento.
- Fecha de creación registrada en 2026-11-14, posterior a la fecha habitual de consulta; conviene verificar la integridad y procedencia del artefacto.
- No apto para tareas de razonamiento, código o matemáticas: es exclusivamente un modelo TTS.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Phoonnx/vits-hf_community_HirCoir_piper-sorah-neuronal
- Repositorio fuente agregador: https://huggingface.co/Phoonnx/phoonnx-vits
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Voces Kasanoma (referencia citada en la licencia): https://github.com/michsethowusu/kasanoma
