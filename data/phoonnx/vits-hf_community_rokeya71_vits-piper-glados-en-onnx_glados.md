# Phoonnx/vits-hf_community_rokeya71_VITS-Piper-GlaDOS-en-onnx_glados

## Resumen

Este repositorio contiene un modelo de síntesis de voz (text-to-speech) en formato ONNX basado en la arquitectura VITS, empaquetado para su uso con la librería [phoonnx](https://github.com/TigreGotico/phoonnx). Se trata de una extracción concreta del repositorio agregador `Phoonnx/phoonnx-vits`, en la carpeta `hf_community__rokeya71__VITS-Piper-GlaDOS-en-onnx__glados`, que reúne voces Piper convertidas a ONNX. El nombre indica que la voz original es una conversión de un modelo Piper de la comunidad (usuario `rokeya71`) con la voz "GlaDOS" en inglés.

El modelo no es un desarrollo original de `Phoonnx`, sino un espejo de artefactos generados por terceros y reorganizados para su consumo desde la citada librería. Su relevancia práctica es limitada: no aporta innovación arquitectónica ni datos de entrenamiento propios, y su utilidad se reduce a servir como artefacto de inferencia TTS en inglés con una voz concreta de carácter sintético y estilizado (GlaDOS, personaje de *Portal*).

La información publicada por el autor es mínima: no se documentan parámetros, contexto, dataset ni resultados de evaluación. La ficha siguiente refleja únicamente lo que consta en la model card y en los metadatos de Hugging Face, marcando como "no disponible" todo aquello que no se ha publicado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variante Piper, exportada a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; procesa texto de entrada, no contexto conversacional) |
| Tipos de cuantizacion | no disponible (el repo distribuye pesos ONNX; se desconoce si hay variantes cuantizadas) |
| Idiomas soportados | inglés (según el identificador `-en-` del nombre; no confirmado en la model card) |
| Licencia | MIT (según metadatos y model card; ver advertencias sobre licencias heredadas) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura es VITS (*Variational Inference with adversarial learning for end-to-end Text-to-Speech*), un modelo condicional VAE con discriminador adversarial que genera waveform directamente a partir de texto, sin vocoder separado. En la práctica, este artefacto corresponde a una voz Piper: el front-end fonético habitual de Piper es espeak-ng, y el modelo se distribuye como grafo ONNX para inferencia. No se publican detalles sobre el checkpoint Piper de origen, el número de pasos de entrenamiento, el dataset empleado ni si hubo ajuste fino sobre la voz "GlaDOS".

No hay información sobre innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.), ni sobre el proceso de conversión a ONNX. El repositorio se limita a conservar las rutas de ficheros del repositorio agregador original.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en inglés.
- Generación de audio en formato waveform mediante un grafo ONNX.
- Voz estilizada "GlaDOS" (tono sintético, robótico, asociado al personaje de *Portal*).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es un modelo multilingüe: el identificador apunta a inglés únicamente.
- No dispone de modo *thinking*, visión ni audio de entrada.

## Casos de uso

- Doblaje y prototipado de videojuegos: la voz GlaDOS permite generar líneas de diálogo para un personaje con estética retro-futurista sin grabar un actor de voz, integrándose vía ONNX en el motor del juego.
- Pruebas de accesibilidad en aplicaciones: lectura de texto en pantalla con una voz característica para validar flujos de TTS antes de contratar una voz comercial.
- Generación de contenido para mods y fan projects de *Portal*: producción de audio para mods de la comunidad que requieran la voz del personaje.
- Maquetas de podcast o narrativa: creación de borradores de audio con una voz distintiva para evaluar ritmo y duración antes de la locución final.
- Test de pipelines TTS en CI: verificación de que el stack phoonnx/ONNX Runtime carga y ejecuta correctamente un modelo VITS en un entorno de integración continua.
- Investigación sobre voces sintéticas: análisis comparativo de la calidad y naturalidad de voces Piper frente a otros sistemas TTS en estudios académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 0,1 GB, por lo que el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime (CUDA o DirectML); una RTX 3060 o superior es más que suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU moderna; también puede ejecutarse en CPU.
- Opciones de despliegue: ONNX Runtime (vía phoonnx), y potencialmente otros runners compatibles con ONNX como `onnxruntime-node` o `onnxruntime-web`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (VITS Piper GlaDOS ONNX) | VITS / Piper | no disponible | no aplica | MIT | Hugging Face (Phoonnx) |
| Piper TTS (voces oficiales) | VITS | ~0,5–1 M por voz (aprox.) | no aplica | MIT | GitHub rhasspy/piper |
| Coqui TTS (XTTS v2) | VITS/autoregresivo | ~467 M | no aplica | Coqui Public Model License | Hugging Face (coqui) |
| Bark (Suno) | Transformer autoregresivo | ~1,2 B | no aplica | MIT | Hugging Face (suno) |

Los datos de parámetros de Piper y Coqui son aproximados y no constan en la información proporcionada para este modelo concreto. La comparación se ofrece como referencia de categoría, no como benchmark medido.

## Limitaciones y advertencias

- La model card advierte que las licencias siguen a los originales por subcarpeta y que algunas voces del repositorio agregador (p. ej. `tw-kasanoma`, `ny-kasanoma`, `vmw-kasanoma`) carecen de licencia declarada y llevan `license: other`; conviene revisar la carpeta de origen antes de un uso comercial.
- No se documenta el idioma de forma explícita en la model card; el identificador `-en-` sugiere inglés, pero no está confirmado.
- No hay información sobre sesgos, calidad de la voz ni robustez ante texto fuera de dominio.
- Al ser una voz estilizada (GlaDOS), su naturalidad es limitada y no es adecuada para aplicaciones de asistencia accesible de propósito general.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de uso en producción.
- No se especifican requisitos de atribución más allá de la licencia MIT declarada.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; el riesgo es de pronunciación incorrecta o artefactos de audio.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-hf_community_rokeya71_VITS-Piper-GlaDOS-en-onnx_glados
- Repositorio agregador: https://huggingface.co/Phoonnx/phoonnx-vits
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio kasanoma (referenciado en la licencia): https://github.com/michsethowusu/kasanoma
- Piper TTS (origen de las voces): https://github.com/rhasspy/piper
