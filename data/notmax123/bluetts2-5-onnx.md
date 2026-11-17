# notmax123/BlueTTS2.5-onnx

## Resumen

BlueTTS v2.5 es un sistema de síntesis de voz (text-to-speech) multilingüe exportado a formato ONNX por el usuario notmax123. Se trata de la conversión a ONNX de un checkpoint de text2latent (`ckpt_step_748000.pt`) entrenado originalmente en PyTorch, lo que permite ejecutar el modelo sin dependencia del framework de origen y facilita su despliegue en entornos de producción con runtime ONNX. El modelo genera audio a 44,1 kHz y cubre siete idiomas en su mezcla de entrenamiento: hebreo, inglés, alemán, italiano, español, ruso y yidis.

La arquitectura sigue un esquema de flow matching para la generación de latentes acústicos, con un estimador de velocidad (vector_estimator) que opera sobre latentes comprimidos a 14,35 Hz, más un vocoder que reconstruye la forma de onda. El paquete incluye todos los grafos necesarios para la inferencia completa —encoder de referencia, encoder de texto, estimador de vector, vocoder y dos predictores de duración— junto con los ficheros de normalización y los embeddings incondicionales para classifier-free guidance.

Su relevancia radica en dos factores: la modularidad del bundle ONNX, que separa cada etapa del pipeline en un grafo independiente, y la inclusión de estilos de voz precalculados que evitan la necesidad de un wav de referencia en el momento de la síntesis. La entrada del modelo es IPA (Alfabeto Fonético Internacional), no texto crudo, lo que traslada la fonemización a un front-end externo específico por idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow matching (vector_estimator) + vocoder, exportado a grafos ONNX independientes |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la dimensión temporal es dinámica; batch fijo a 1) |
| Tipos de cuantizacion | no disponible (el bundle se distribuye en ONNX sin cuantizar según la información disponible) |
| Idiomas soportados | hebreo, inglés, alemán, italiano, español, ruso, yidis |
| Licencia | MIT |
| Formato de pesos | ONNX (grafos) + NPZ (stats, uncond) + JSON (vocab, voces, config) |

## Arquitectura y entrenamiento

El modelo se compone de cinco grafos ONNX. El `reference_encoder` transforma latentes de referencia `[1,144,T_ref]` en 50 tokens de estilo `[1,50,256]`. El `text_encoder` combina identificadores de fonemas con el estilo para producir un embedding de texto `[1,256,T_txt]`. El `vector_estimator` implementa el bucle interno del muestreador de flow matching: recibe el latente ruidoso, el embedding de texto, el estilo y los pasos actual y total, y devuelve el latente denoizado. El `vocoder` convierte latentes `[1,24,T_dec]` en forma de onda. Los dos predictores de duración calculan la duración total en segundos, uno a partir de latentes de referencia y otro a partir de tokens de estilo precalculados.

Un detalle técnico relevante es que el `vector_estimator` incorpora el paso de Euler en su salida: devuelve `x + (1/total_step) * v` en lugar de la velocidad pura. Para aplicar classifier-free guidance es necesario recuperar la velocidad mediante `v = (out - noisy_latent) * total_step` antes de mezclar las componentes condicional e incondicional. Los latentes operan a 14,35 Hz y deben replegarse y desnormalizarse antes de alimentar el vocoder: `z = (x / normalizer_scale) * std + mean`, seguido de un reshape `(1,24,6,T).transpose(0,1,3,2).reshape(1,24,6T)`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card indica que el checkpoint proviene de un entrenamiento de text2latent y que los estilos de voz incluidos derivan de LibriTTS-R (CC BY 4.0), con referencias a 24 kHz remuestreadas a 44,1 kHz.

## Capacidades

- Síntesis de voz multilingüe en siete idiomas: hebreo, inglés, alemán, italiano, español, ruso y yidis.
- Generación de audio a 44,1 kHz mediante vocoder dedicado.
- Entrada basada en IPA (fonemas), no en texto crudo; requiere un front-end de fonemización externo por idioma.
- Estilos de voz precalculados que permiten síntesis sin wav de referencia ni encoder de autoencoder.
- Predictor de duración integrado para control de la longitud temporal de la síntesis.
- Soporte de classifier-free guidance configurable (parámetro `cfg`, valor de ejemplo 3.0).
- Muestreo configurable por número de pasos (valor de ejemplo 16).
- Inclusión de un front-end específico para ruso (`g2p/russian_g2p.py`) con resolución de acento léxico mediante RUAccent y reducción vocálica con RUPhon.
- No se menciona soporte de tool calling, function calling, agentes ni razonamiento multi-paso; el modelo es exclusivamente TTS.

## Casos de uso

- Síntesis de voz en ruso con acentuación correcta: el front-end incluido resuelve el acento léxico a partir del contexto de la frase y aplica reducción vocálica condicionada por el acento, lo que permite generar audio con pronunciación natural en un idioma donde el acento es impredecible sin contexto.
- Generación de audiolibros o contenido narrado: los estilos de voz precalculados (`libri_male_6209`, `libri_female_6147`, etc.) permiten sintetizar pasajes largos sin necesidad de una grabación de referencia, manteniendo una identidad de voz consistente entre fragmentos.
- Doblaje y localización multilingüe: al cubrir siete idiomas con un mismo checkpoint, se puede reutilizar la misma infraestructura de inferencia para generar voces en hebreo, inglés, alemán, italiano, español, ruso y yidis, aunque cada uno requiere su propio front-end de fonemización.
- Despliegue en entornos con runtime ONNX: al estar exportado a ONNX con grafos independientes, el modelo puede integrarse en servicios de inferencia que no dispongan de PyTorch, incluyendo despliegues en CPU o con aceleradores compatibles con ONNX Runtime.
- Sistemas de accesibilidad: conversión de texto a voz para lectores de pantalla o asistentes por voz, con la ventaja de que los estilos de voz precalculados eliminan la latencia de codificar una referencia en cada petición.
- Investigación en TTS multilingüe: la separación modular en grafos (encoder de referencia, encoder de texto, estimador de vector, vocoder, predictores de duración) facilita el análisis y la sustitución de componentes individuales en experimentos.
- Prototipado de asistentes conversacionales con voz: la posibilidad de fijar el número de pasos de muestreo (por ejemplo, 16) y el valor de CFG (por ejemplo, 3.0) permite ajustar el compromiso entre calidad y latencia según el caso de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta una verificación de fidelidad frente a la ruta PyTorch: con ruido inicial idéntico, la similitud coseno de la forma de onda es ≥ 0,9995 en los siete idiomas y la duración coincide con un error de aproximadamente 1e-6 s.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 0,3 GB, lo que da una orientación sobre el espacio en disco de los pesos, pero no se especifica el consumo de memoria en ejecución.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; al ser un bundle ONNX, la viabilidad depende del runtime y del tamaño real de los grafos, que no se detalla.
- Opciones de despliegue: ONNX Runtime (el bundle está diseñado para ejecutarse con los scripts incluidos, `scripts/run_onnx_inference.py`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo TTS de este tipo.
- Latencia y throughput estimados: no disponible. Los parámetros de muestreo de ejemplo son 16 pasos y CFG 3.0, pero no se reportan tiempos de inferencia.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni comparaciones con otros sistemas TTS, por lo que no es posible establecer una comparativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La entrada debe ser IPA, no texto crudo: la fonemización queda fuera del export y cada idioma requiere su propio front-end (Phonikud para hebreo, nikud + `yiddish_g2p` para yidis, RUAccent + RUPhon para ruso, espeak para el resto). Alimentar el modelo con una fonemización distinta a la del entrenamiento produce patrones de acento y reducción inconsistentes.
- El batch está fijo a 1; solo los ejes temporales son dinámicos, lo que limita el procesamiento por lotes.
- El `vector_estimator` incorpora el paso de Euler en su salida; interpretar su salida como velocidad directamente rompe el classifier-free guidance.
- Los latentes deben desnormalizarse y replegarse antes del vocoder; omitir este paso produce audio incorrecto.
- Los estilos de voz derivados de LibriTTS-R son referencias a 24 kHz remuestreadas a 44,1 kHz, por lo que no contienen contenido por encima de 12 kHz.
- No se dispone de información sobre sesgos del modelo, tasas de alucinación (en TTS, artefactos o pronunciaciones erróneas) ni evaluación de calidad subjetiva (MOS).
- La licencia es MIT, lo que permite uso comercial, pero la model card no detalla restricciones adicionales sobre los datos de entrenamiento ni sobre las voces de referencia.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- No se especifican requisitos de memoria ni latencia, lo que dificulta planificar un despliegue en producción sin pruebas propias.

## Enlaces

- Hugging Face: https://huggingface.co/notmax123/BlueTTS2.5-onnx
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
