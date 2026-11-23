# DanielSuncost/parlando-5m

## Resumen

Parlando-5M es un modelo de síntesis de voz (text-to-speech) en inglés desarrollado por DanielSuncost, publicado bajo licencia Apache-2.0. Se trata del primer y más pequeño miembro de la familia Parlando, diseñado específicamente para ser lo suficientemente ligero como para ejecutarse en un navegador web sobre un único hilo de CPU. Su rasgo diferencial es una capa de control de prosodia basada en etiquetas tipo SSML que permite modular énfasis, tono, duración, velocidad, pausas, susurro y respiración a nivel de palabra.

El modelo completo, incluido el generador de forma de onda, tiene 4.543.344 parámetros y produce audio mono a 24 kHz. No utiliza pesos preentrenados: se entrena desde cero. Incluye tres voces en inglés americano (EN_F1, EN_F2, EN_M1) y doce "entregas" o estilos interpretativos (neutral, happy, sad, angry, loud, soft, slow, fast, tender, excited, tired, whisper) que pueden combinarse entre sí.

Su relevancia actual radica en la combinación de tamaño extremadamente reducido, velocidad de inferencia muy superior al tiempo real y control fino de prosodia mediante marcado textual, lo que lo hace adecuado para aplicaciones interactivas en el cliente, prototipado rápido y entornos con recursos muy limitados, donde modelos TTS de mayor tamaño resultan inviables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS con capa de control de prosodia; detalles de arquitectura no especificados en la model card) |
| Parametros totales | 4.543.344 (incluye generador de forma de onda) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | float32 (PyTorch y ONNX); float16 en almacenamiento con cast a float32 al cargar (`model.fp16.onnx`) |
| Idiomas soportados | inglés (inglés americano) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`parlando.pt`), ONNX (`model.onnx`, `model.fp16.onnx`, opset 17) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo más allá de indicar que incluye un generador de forma de onda y que el conjunto completo suma 4.543.344 parámetros. No se especifica si se trata de un transformer, un modelo convolucional, un modelo híbrido o basado en difusión; esta información figura como no disponible. El modelo no parte de pesos preentrenados ("Pretrained weights in the model: None"), por lo que se entrena desde cero.

La entrada es texto con etiquetas de prosodia que se convierte a fonemas mediante el fonemizador `dizione`. La salida es audio mono a 24 kHz. No se han publicado detalles sobre el volumen de datos de entrenamiento, la composición del corpus, ni si se emplearon técnicas de RLHF o DPO. La innovación técnica destacable es la capa de control de prosodia por etiquetas (`<emph>`, `<pitch>`, `<length>`, `<pause>`, `<rate>`, `<long>`, `<whisper>`), que permite dirigir la interpretación a nivel de palabra y sílaba, así como la mezcla de doce estilos de entrega.

## Capacidades

- Síntesis de voz en inglés americano con tres voces: EN_F1 (femenina cálida y grave), EN_F2 (femenina más brillante) y EN_M1 (masculina profunda).
- Control de prosodia por etiquetas a nivel de palabra y sílaba: énfasis (`<emph>`), tono (`<pitch>`, en semitonos), duración (`<length>`), velocidad (`<rate>`), alargamiento (`<long>`) y pausas (`<pause>`).
- Doce estilos de entrega combinables: neutral, happy, sad, angry, loud, soft, slow, fast, tender, excited, tired y whisper.
- Control directo de susurro (`<whisper>`) y respiración sobre la voz.
- Conversión de texto a fonemas mediante el fonemizador `dizione`.
- Ejecución en navegador sobre un único hilo de CPU.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Lectura de contenido web en el cliente: el modelo puede integrarse en una página para leer artículos o avisos directamente en el navegador, sin backend, gracias a sus 4,5 M de parámetros y su velocidad de 10–20× tiempo real en navegador.
- Accesibilidad para personas con discapacidad visual: síntesis de texto a voz en aplicaciones ligeras donde el control de prosodia permite enfatizar palabras clave y ajustar pausas para mejorar la comprensión.
- Prototipado rápido de interfaces de voz: los doce estilos de entrega y las etiquetas de prosodia permiten experimentar con interpretaciones expresivas sin entrenar ni desplegar modelos grandes.
- Avisos y anuncios públicos: el estilo `loud` con control de pausas y énfasis resulta adecuado para mensajes de megafonía o anuncios en estaciones, como muestra el ejemplo de la model card sobre el último tren.
- Audiolibros y narración expresiva: la combinación de estilos (`tender`, `tired`, `excited`) y el control de velocidad y pausas permite generar narraciones con matices interpretativos sin infraestructura de GPU.
- Sistemas embebidos y dispositivos de bajo consumo: al ejecutarse en una CPU y ocupar 18,2 MB en float32 (14,7 MB en fp16), puede desplegarse en dispositivos con recursos muy limitados.
- Pruebas A/B de voces y estilos en productos: la ligereza del modelo facilita generar variantes de una misma frase con distintas entregas y voces para evaluar preferencias de usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta métricas de velocidad de inferencia:

| Métrica | Valor |
|---|---|
| Velocidad en PyTorch, 1 hilo de CPU | ~80× tiempo real |
| Velocidad en PyTorch, 4 hilos de CPU | ~200× tiempo real |
| Velocidad con ONNX Runtime | ~35× tiempo real |
| Velocidad en navegador | 10–20× tiempo real |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está diseñado para ejecutarse en CPU. El peso en float32 es de 18,2 MB y en float16 de 14,7 MB.
- GPU recomendadas: no se especifican; el modelo no requiere GPU.
- Cabe en cualquier GPU de consumo e incluso en CPU de un solo hilo; también en navegador.
- Opciones de despliegue: PyTorch (`parlando.pt`), ONNX Runtime (`onnx/model.onnx`, `onnx/model.fp16.onnx`) y ejecución en navegador mediante el demo oficial.
- Latencia y throughput: aproximadamente 80× tiempo real en un hilo de CPU con PyTorch, 200× con cuatro hilos, 35× con ONNX Runtime y 10–20× en navegador.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card no incluye comparaciones con otras alternativas TTS, por lo que no es posible elaborar una tabla comparativa con datos verificables.

## Limitaciones y advertencias

- Solo soporta inglés americano; no hay soporte multilingüe documentado.
- El modelo se entrena desde cero y es de tamaño muy reducido (4,5 M de parámetros), lo que puede limitar la naturalidad y expresividad frente a modelos TTS de mayor escala; no se han publicado evaluaciones subjetivas (MOS) que lo confirmen.
- No se documentan sesgos conocidos ni evaluación de sesgos; al ser un modelo de voz, puede reflejar sesgos presentes en los datos de entrenamiento, que no se detallan.
- Riesgo de alucinación no aplica en el sentido habitual de generación de texto, pero sí existe riesgo de pronunciación incorrecta de palabras fuera del vocabulario fonético o de nombres propios.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar las licencias de las dependencias, en particular el fonemizador `dizione`.
- No se especifican limitaciones de longitud de entrada ni de contexto; esta información figura como no disponible.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria documentada.

## Enlaces

- Hugging Face: https://huggingface.co/DanielSuncost/parlando-5m
- Repositorio de código: https://github.com/DanielSuncost/parlando
- Demo: https://www.suncostlabs.com/parlando
- Fonemizador dizione: https://github.com/n4ze3m/dizione
