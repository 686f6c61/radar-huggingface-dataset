# empiriolabsai/canora-korean

## Resumen

Canora Korean es un modelo de síntesis de voz (text-to-speech) especializado en coreano, desarrollado por EmpirioLabs. Se trata de un ajuste fino (finetune) del conocido Kokoro-82M de hexgrad, lo que le permite heredar la arquitectura y el rendimiento del modelo original manteniendo un tamaño muy reducido de 82 millones de parámetros. El modelo ofrece dos voces predefinidas, `seoyeon` (femenina) y `minjun` (masculina), y está pensado para integrarse en aplicaciones que necesiten generar habla en coreano con calidad cercana a la humana.

La relevancia de este modelo radica en su combinación de tamaño reducido, licencia Apache 2.0 (permite uso comercial sin restricciones) y disponibilidad de pesos en formato ONNX en precisión completa, media e int8, lo que facilita su despliegue tanto en servidores como en el navegador mediante transformers.js. Además, incluye un módulo de conversión de texto a fonemas (G2P) específico para coreano que maneja correctamente números, fechas, horas y precios tal como los pronuncia un hablante nativo.

El modelo se distribuye a través de la librería `kokoro` estándar y está diseñado para ser ligero y rápido: el archivo ONNX int8 ocupa solo 115 MB. Según las mediciones del autor, alcanza una tasa de error de caracteres (CER) del 3,3 % y una puntuación de naturalidad (UTMOS) de hasta 4,23, superando a alternativas como MeloTTS Korean y Piper en las pruebas realizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro-82M (red neuronal para TTS, arquitectura no detallada en la información disponible) |
| Parametros totales | 82 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo TTS, no procesa contexto textual largo; se recomienda limitar a ~500 fonemas por llamada) |
| Tipos de cuantizacion | ONNX en precisión completa, media precisión (half) e int8; pesos PyTorch (`.pth`) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pth`), ONNX (`.onnx`), voces en `.pt` |

## Arquitectura y entrenamiento

Canora Korean es un ajuste fino del modelo Kokoro-82M, una arquitectura de síntesis de voz que no se detalla en la información proporcionada más allá de su tamaño y su integración con la librería `kokoro`. El modelo base Kokoro-82M es conocido por su eficiencia y calidad en TTS, y este finetune adapta sus capacidades al coreano. No se especifican en la información disponible los detalles sobre el dataset de entrenamiento, el número de tokens o pasos, ni si se emplearon técnicas como RLHF o DPO.

La innovación técnica destacable es la inclusión de un módulo de conversión de texto a fonemas (`g2p_ko.py`) específico para coreano, que normaliza correctamente números, fechas, horas y precios. Además, el modelo se distribuye con pesos ONNX optimizados para ONNX Runtime y transformers.js, lo que permite inferencia en el navegador sin instalación. El rendimiento en velocidad es de 4,0x tiempo real en PyTorch, 4,5x en ONNX de precisión completa y 5,2x en ONNX int8, medido en 4 hilos de un AMD EPYC 7B13.

## Capacidades

- Generación de voz en coreano con dos voces: `seoyeon` (femenina) y `minjun` (masculina).
- Lectura correcta de números, fechas, horas y precios según la convención coreana.
- Síntesis de voz de alta inteligibilidad (CER del 3,3 %) y naturalidad (UTMOS de hasta 4,23).
- Inferencia en PyTorch, ONNX Runtime y transformers.js (navegador).
- Módulo de texto a fonemas (G2P) para coreano incluido en el repositorio.
- No se mencionan capacidades de tool calling, agentes, razonamiento multilingüe ni otras modalidades (visión, audio de entrada).

## Casos de uso

- **Atención al cliente automatizada en coreano**: el modelo puede generar respuestas habladas naturales para sistemas de IVR o asistentes virtuales, gracias a su bajo coste computacional y su capacidad de leer correctamente números de pedido, fechas y precios.
- **Lectura de noticias y artículos**: integrado en un pipeline de TTS, puede convertir textos periodísticos en audio con una pronunciación natural de cifras y datos, adecuado para aplicaciones de accesibilidad o podcasts automatizados.
- **Anuncios por megafonía en transporte**: la voz `minjun` o `seoyeon` puede generar avisos de salidas de trenes, horarios y precios (como en los ejemplos del modelo) para su reproducción en estaciones.
- **Aprendizaje de coreano**: los estudiantes pueden escuchar la pronunciación de frases y números con una entonación natural, usando el modelo para generar material de práctica auditiva.
- **Integración en aplicaciones web sin backend**: gracias a los pesos ONNX y transformers.js, se puede ejecutar TTS directamente en el navegador para aplicaciones de lectura en voz alta o asistentes locales.
- **Generación de audiolibros y contenido bajo demanda**: el modelo es lo suficientemente ligero (115 MB en int8) para desplegarse en servidores modestos o en dispositivos edge, permitiendo sintetizar grandes volúmenes de texto en coreano con dos voces disponibles.
- **Sistemas de navegación GPS**: puede leer indicaciones de ruta con nombres de calles, distancias y tiempos de llegada de forma natural, usando la voz masculina o femenina según la preferencia del usuario.

## Benchmarks y rendimiento

Los resultados publicados por el autor en 200 frases coreanas no vistas durante el entrenamiento, transcritas con `openai/whisper-large-v3` para calcular el CER, son los siguientes:

| Sistema | CER | UTMOS |
|---|---:|---:|
| Canora Korean `seoyeon` | 3,34 % | **4,23** |
| Canora Korean `minjun` | **3,32 %** | 3,96 |
| MeloTTS Korean | 3,41 % | 3,82 |
| Piper `ko_KR-kss-medium` | 4,51 % | 3,60 |

Para la versión ONNX int8, los resultados son: `seoyeon` 3,48 % CER y UTMOS 3,49; `minjun` 3,13 % CER y UTMOS 3,36.

En cuanto a velocidad, medida en 4 hilos de un AMD EPYC 7B13 con 60 frases (segundos de audio por segundo de cómputo): PyTorch 4,0x tiempo real, ONNX precisión completa 4,5x, ONNX int8 5,2x.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo de 82M de parámetros, la inferencia cabe en menos de 1 GB de VRAM en precisión completa; en int8, el archivo ONNX es de 115 MB, por lo que puede ejecutarse en CPU sin GPU.
- **GPU recomendadas**: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es más que suficiente; también funciona en CPU (se han publicado velocidades en AMD EPYC).
- **Consumer GPU**: sí, cabe en cualquier GPU consumer e incluso en dispositivos de gama baja; también se puede ejecutar en CPU.
- **Opciones de despliegue**: PyTorch (librería `kokoro`), ONNX Runtime, transformers.js (navegador). No se mencionan vLLM, llama.cpp ni TGI, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: 4,0x tiempo real en PyTorch, 4,5x en ONNX FP, 5,2x en ONNX int8 (en 4 hilos de AMD EPYC 7B13). El rendimiento depende del procesador y del número de hilos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER (coreano) | UTMOS | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Canora Korean | 82M | No aplica (TTS) | 3,32–3,34 % | 3,96–4,23 | Apache 2.0 | Hugging Face, ONNX, transformers.js |
| MeloTTS Korean | No disponible | No aplica | 3,41 % | 3,82 | No disponible en la información | No disponible |
| Piper `ko_KR-kss-medium` | No disponible | No aplica | 4,51 % | 3,60 | No disponible en la información | No disponible |

Canora Korean supera a MeloTTS Korean y Piper en CER y UTMOS según las pruebas del autor, con la ventaja adicional de una licencia Apache 2.0 explícita y pesos ONNX listos para desplegar.

## Limitaciones y advertencias

- **Sesgos**: no se ha documentado información sobre sesgos en la información proporcionada; al ser un modelo entrenado para coreano, puede reflejar sesgos presentes en los datos de entrenamiento no especificados.
- **Riesgo de alucinación**: en TTS, el riesgo se traduce en pronunciaciones incorrectas o entonación antinatural en textos fuera del dominio de entrenamiento (palabras extranjeras, jerga, nombres propios).
- **Limitaciones de contexto o idioma**: solo soporta coreano; no se ha entrenado para otros idiomas. Se recomienda limitar cada llamada a unos 500 fonemas y dividir textos largos en frases.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial sin restricciones, pero se debe conservar el aviso de licencia y atribución.
- **Caveats para producción**: el modelo base es Kokoro-82M, por lo que su calidad y limitaciones arquitectónicas son las de este; no se detallan en la información disponible posibles problemas de estabilidad en textos muy largos o con caracteres especiales. La velocidad depende del hardware y del número de hilos.

## Enlaces

- [Hugging Face: empiriolabsai/canora-korean](https://huggingface.co/empiriolabsai/canora-korean)
- [Demo en Spaces: Canora text-to-speech](https://huggingface.co/spaces/empiriolabsai/canora-text-to-speech)
- [Sitio web de EmpirioLabs](https://empiriolabs.ai)
- [Todos los modelos de EmpirioLabs](https://huggingface.co/empiriolabsai)
- [Plataforma de EmpirioLabs](https://platform.empiriolabs.ai)
- [Discord de EmpirioLabs](https://discord.gg/bM52azW4ZD)
- [Modelo base: hexgrad/Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M)
