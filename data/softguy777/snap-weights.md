# softguy777/snap-weights

## Resumen

SNAP es un conjunto de modelos multilingües de normalización de texto (TN/ITN) y conversión de grafema a fonema (G2P) desarrollado por softguy777 (Jay Lee). El repositorio incluye tres variantes basadas en arquitectura BERT con cuantización int8 y formato ONNX, una para cada idioma soportado: coreano (kcbert-base-int8), japonés (ja-kanji-bert-int8) e inglés (en-bert-base-int8). El sistema está diseñado para funcionar con un motor de inferencia de cero dependencias en C/C++ y Python, lo que facilita su integración en pipelines de síntesis de voz (TTS) y reconocimiento de voz (ASR) sin necesidad de librerías externas pesadas.

La relevancia de este modelo radica en su enfoque práctico: ofrece normalización de texto y G2P en un solo paquete, con versionado independiente de diccionarios y modelos, y un manifiesto raíz que controla las variantes activas. Aunque el repositorio tiene un tamaño de 4,4 GB (incluyendo los tres idiomas y sus léxicos), cada modelo individual es ligero gracias a la cuantización int8, lo que permite su despliegue en entornos con recursos limitados. La licencia Apache-2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (variantes: kcbert-base, ja-kanji-bert, en-bert-base) |
| Parametros totales | no disponible (no se especifica por variante) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 |
| Idiomas soportados | coreano (ko), japones (ja), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (ademas de formatos internos del motor) |

## Arquitectura y entrenamiento

Cada variante utiliza un modelo BERT como backbone, con cabezas de sonda (probe heads) específicas para las tareas de normalización de texto y G2P. El repositorio organiza los modelos en tres directorios por idioma, cada uno con su propio diccionario versionado (v1.0.0) y la variante del modelo (también v1.0.0). No se proporcionan detalles sobre el proceso de entrenamiento, el volumen de datos utilizado ni si se aplicaron técnicas como RLHF o DPO. La cuantización int8 sugiere un enfoque de post-entrenamiento para reducir el tamaño y acelerar la inferencia, pero no se confirma el método exacto.

El sistema incluye un `manifest.json` que actúa como controlador de versiones y variantes, permitiendo al motor cargar automáticamente la versión activa de cada componente. Esta arquitectura modular facilita actualizaciones independientes de diccionarios y modelos sin romper la compatibilidad.

## Capacidades

- Normalización de texto (TN/ITN): convierte números, fechas, horas y otras expresiones escritas en su forma hablada natural. El ejemplo del README muestra la transformación de "2024년 5월 28일 오후 3시에 만납시다." a "이천이십사년 오월 이십팔일 오후 세시에 만납씨다." (coreano).
- Conversión G2P (grafema a fonema): genera representaciones fonéticas a partir de texto, esencial para sistemas TTS.
- Multilingüe: soporta coreano, japonés e inglés, con diccionarios y modelos específicos por idioma.
- Inferencia sin dependencias: el motor está implementado en C/C++ y Python, sin requerir librerías externas adicionales (cero overhead).
- Eficiencia: cuantización int8 y formato ONNX permiten ejecución en CPU con bajo consumo de memoria.
- Integración sencilla: API Python simple (`from snap import PhonologyKR`) que carga automáticamente la configuración desde el manifiesto.

## Casos de uso

- Frontend de síntesis de voz (TTS): el modelo convierte texto arbitrario (incluyendo números, fechas y abreviaturas) en fonemas, que luego se alimentan a un sintetizador acústico. Su soporte multilingüe lo hace adecuado para sistemas TTS que deben manejar varios idiomas.
- Normalización de texto para ASR: en pipelines de reconocimiento de voz, el modelo puede transformar transcripciones crudas en texto legible (ITN), por ejemplo convirtiendo "veinte veinticuatro" en "2024".
- Asistentes de voz multilingües: integración en asistentes que necesitan leer en voz alta mensajes con números, fechas y horas en coreano, japonés o inglés.
- Lectura de contenido generado por IA: normalización y G2P para leer en voz alta respuestas de chatbots o resúmenes automáticos, garantizando pronunciación correcta de entidades numéricas.
- Sistemas de accesibilidad: lectores de pantalla que requieren conversión precisa de texto a voz para usuarios con discapacidad visual, especialmente en contextos con datos numéricos.
- Desarrollo de aplicaciones de aprendizaje de idiomas: generación de pronunciación fonética para ejercicios de lectura o práctica de pronunciación en los tres idiomas soportados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara las métricas `cer` (character error rate) y `accuracy` en el frontmatter, pero no se proporcionan valores numéricos ni comparaciones con otros sistemas.

## Requisitos de hardware

- Al ser modelos BERT base cuantizados a int8 y en formato ONNX, la inferencia puede ejecutarse en CPU sin necesidad de GPU.
- El tamaño individual de cada modelo no se especifica, pero el repositorio completo ocupa 4,4 GB (incluyendo los tres idiomas y diccionarios). Se estima que cada variante int8 de BERT base ronda los 100-200 MB, aunque este dato no está confirmado.
- No se requieren GPUs específicas; cualquier CPU moderna con soporte para instrucciones AVX2 debería ser suficiente.
- Opciones de despliegue: el motor nativo en C/C++ y Python permite integración en aplicaciones embebidas, servicios REST o pipelines de procesamiento por lotes. No se menciona compatibilidad con vLLM, llama.cpp u otros servidores de inferencia estándar.
- La latencia y el throughput no están documentados, pero la cuantización int8 y la arquitectura BERT base sugieren tiempos de inferencia en el orden de milisegundos por frase en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para normalización de texto y G2P multilingüe con las mismas características (BERT int8, ONNX, cero dependencias). Alternativas genéricas como espeak-ng (basado en reglas) o modelos neuronales como FastPitch o Tacotron (que incluyen G2P) no son directamente comparables en arquitectura ni en alcance. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- No se documentan sesgos específicos, pero al ser modelos entrenados con datos limitados (no se especifica el corpus), pueden presentar errores en vocabulario técnico, nombres propios o dialectos regionales.
- Riesgo de alucinación en la normalización de texto: el modelo podría generar formas habladas incorrectas para entradas ambiguas o poco frecuentes.
- La longitud de contexto no está especificada; al ser BERT base, la ventana típica es de 512 tokens, lo que limita el procesamiento de textos muy largos de una sola vez.
- La cobertura de idiomas se limita a coreano, japonés e inglés; no hay soporte para otros idiomas.
- Aunque la licencia Apache-2.0 permite uso comercial, el autor no ofrece garantías sobre el rendimiento en producción ni proporciona soporte oficial.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto reciente o poco validado por la comunidad; se recomienda realizar pruebas exhaustivas antes de usarlo en entornos críticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/softguy777/snap-weights
- Perfil del autor: https://huggingface.co/softguy777
- Listado de modelos del autor: https://huggingface.co/softguy777/models
- Demo publicada (Space): https://huggingface.co/spaces/softguy777/snap-demo
