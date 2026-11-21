# empiriolabsai/canora-polish

## Resumen

Canora Polish es un modelo de síntesis de voz (text-to-speech) especializado en polaco, desarrollado por EmpirioLabs. Se trata de un ajuste fino (finetune) del conocido Kokoro-82M de hexgrad, lo que le permite heredar su arquitectura ligera de 82 millones de parámetros y su velocidad de inferencia, pero adaptada específicamente al idioma polaco con dos voces integradas: `zofia` (femenina) y `jakub` (masculina).

El modelo resuelve el problema de la síntesis de voz de calidad en polaco, un idioma con menos recursos que el inglés en el ecosistema TTS open source. Frente a alternativas como las voces Piper para polaco, Canora Polish reporta mejores métricas de naturalidad (UTMOS) y tasas de error de palabra (WER) más bajas, manteniendo un tamaño reducido que permite su despliegue en CPU y en el navegador mediante ONNX y transformers.js.

Su relevancia actual radica en que ofrece licencia Apache 2.0 (uso comercial libre), pesos en múltiples formatos (PyTorch, ONNX en precisión completa, media e int8) y una integración directa con el paquete estándar `kokoro`, lo que facilita su adopción en producción sin necesidad de infraestructura GPU dedicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Kokoro-82M (modelo TTS basado en StyleTTS 2, según tag `style_text_to_speech_2`) |
| Parámetros totales | 82 millones |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (recomendación: ~500 fonemas por llamada) |
| Tipos de cuantización | Precisión completa (PyTorch/ONNX), media precisión (ONNX), int8 (ONNX, 115 MB) |
| Idiomas soportados | Polaco (pl) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pth` (PyTorch), `.onnx` (ONNX Runtime, transformers.js), `.pt` (voces) |

## Arquitectura y entrenamiento

Canora Polish hereda la arquitectura de Kokoro-82M, un modelo de síntesis de voz basado en StyleTTS 2 que opera sobre fonemas en lugar de texto directo. El pipeline requiere un módulo de conversión texto-a-fonema (G2P) específico para polaco, incluido en el repositorio como `g2p_pl.py`, que a su vez depende de `espeak-ng`. El modelo genera audio a 24 kHz y acepta un parámetro de velocidad de habla en la inferencia.

El modelo es un ajuste fino de `hexgrad/Kokoro-82M` sobre datos de voz en polaco, aunque la model card no detalla el volumen de tokens de audio, la composición del dataset de entrenamiento ni si se emplearon técnicas de RLHF o DPO. La innovación técnica destacable es la inclusión de pesos ONNX en tres precisiones para ejecución en CPU y en navegador, así como el tratamiento correcto de números, fechas, horas y precios según la convención oral del polaco.

## Capacidades

- Síntesis de voz en polaco con dos voces: `zofia` (femenina) y `jakub` (masculina).
- Lectura correcta de números, fechas, horas y precios tal como los pronuncia un hablante nativo de polaco.
- Generación de audio a 24 kHz con control de velocidad de habla.
- Ejecución en CPU mediante ONNX Runtime y en navegador mediante transformers.js.
- Integración con el paquete estándar `kokoro` de Python.
- Conversión texto-a-fonema específica para polaco mediante el módulo `g2p_pl.py`.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de los modelos de lenguaje; es exclusivamente un modelo TTS.

## Casos de uso

- **Locución de noticias y boletines meteorológicos**: el modelo lee correctamente temperaturas y fechas ("21 °C", "14:35"), lo que lo hace adecuado para generar audio de actualizaciones diarias de forma automatizada.
- **Anuncios en transporte público**: frases como "Pociąg do Krakowa odjeżdża o 14:35 z peronu 5" se sintetizan con la entonación y lectura de horas esperadas, permitiendo generar avisos dinámicos por megafonía o apps.
- **Atención al cliente por voz**: con solo 82 millones de parámetros y pesos int8 de 115 MB, puede desplegarse en servidores CPU para responder consultas en polaco sin coste de GPU.
- **Audiolibros y contenido editorial**: la disponibilidad de dos voces permite alternar narradores o asignar voces distintas a personajes, con licencia Apache 2.0 para uso comercial.
- **Accesibilidad web**: mediante transformers.js y los pesos ONNX, puede ejecutarse en el navegador para leer contenido en polaco a usuarios con discapacidad visual sin enviar datos a un servidor.
- **Sistemas de megafonía y quioscos interactivos**: la velocidad de inferencia (3,2x–3,7x tiempo real en CPU de 4 hilos) permite generar audio en tiempo real en hardware modesto.
- **E-learning de idiomas**: la naturalidad reportada (UTMOS 4,04–4,10) y la lectura correcta de precios y horas lo hacen útil para materiales de aprendizaje de polaco.

## Benchmarks y rendimiento

Evaluación realizada por EmpirioLabs el 2026-11-20 sobre 200 frases en polaco no vistas, transcritas con `openai/whisper-large-v3` para calcular WER:

| Sistema | WER | UTMOS |
|---|---:|---:|
| Canora Polish `zofia` | 2,25% | 4,04 |
| Canora Polish `jakub` | **1,15%** | **4,10** |
| Piper `pl_PL-gosia-medium` | 1,73% | 3,47 |
| Piper `pl_PL-darkman-medium` | 2,51% | 3,40 |
| Piper `pl_PL-mc_speech-medium` | 3,35% | 3,18 |
| Piper `pl_PL-bass-high` | 7,79% | 2,33 |
| Piper `pl_PL-mls_6892-low` | 12,76% | 2,67 |

Rendimiento de los pesos int8 ONNX sobre las mismas frases: `zofia` 1,88% WER y UTMOS 3,55; `jakub` 1,31% WER y UTMOS 3,67.

Velocidad medida sobre 60 frases en 4 hilos de un AMD EPYC 7452 (segundos de audio por segundo de cómputo): PyTorch 3,2x tiempo real, ONNX precisión completa 3,7x, ONNX int8 3,5x.

## Requisitos de hardware

- **VRAM estimada**: el modelo es de 82M de parámetros; en PyTorch ocupa aproximadamente 330 MB en fp32, por lo que cabe holgadamente en cualquier GPU consumer.
- **GPU recomendadas**: cualquier GPU con al menos 1 GB de memoria libre (RTX 3060, RTX 4090, A100, H100); no requiere GPU de gama alta.
- **CPU**: funciona en CPU sin GPU; el archivo ONNX int8 de 115 MB permite despliegue en máquinas modestas. Se midió 3,5x–3,7x tiempo real en 4 hilos de un AMD EPYC 7452.
- **Opciones de despliegue**: paquete `kokoro` (PyTorch), ONNX Runtime, transformers.js (navegador). Requiere `espeak-ng` instalado para la conversión texto-a-fonema.
- **Latencia y throughput**: dependen del procesador y del número de hilos; la arquitectura es la de Kokoro-82M, por lo que iguala su rendimiento en la misma máquina.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | WER (mejor voz) | UTMOS (mejor voz) | Licencia | Formato |
|---|---|---:|---:|---:|---|---|
| Canora Polish | 82M | Polaco | 1,15% | 4,10 | Apache 2.0 | PyTorch, ONNX |
| Piper `pl_PL-gosia-medium` | no disponible | Polaco | 1,73% | 3,47 | no disponible | no disponible |
| Piper `pl_PL-darkman-medium` | no disponible | Polaco | 2,51% | 3,40 | no disponible | no disponible |
| Kokoro-82M (base) | 82M | Multilingüe (sin polaco específico) | no disponible | no disponible | Apache 2.0 | PyTorch, ONNX |

## Limitaciones y advertencias

- Solo soporta polaco; no es multilingüe.
- Solo dispone de dos voces (`zofia` y `jakub`); no hay clonación de voz ni voces adicionales.
- Requiere `espeak-ng` instalado como dependencia externa para la conversión texto-a-fonema.
- Se recomienda limitar cada llamada a unos 500 fonemas; textos más largos deben dividirse en frases y unir el audio resultante.
- La cuantización int8 reduce la naturalidad (UTMOS baja de 4,04 a 3,55 en `zofia` y de 4,10 a 3,67 en `jakub`), aunque mejora ligeramente el WER en `zofia`.
- No se detallan en la model card los datos de entrenamiento, los sesgos potenciales ni el riesgo de alucinación acústica; no hay información disponible sobre estos aspectos.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las licencias de las dependencias (`espeak-ng`, `kokoro`) en el contexto de producción.
- El repositorio tiene pocas descargas (42) y ningún "like" en el momento de la consulta, lo que indica una adopción aún muy limitada y poca validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/empiriolabsai/canora-polish
- Modelo base Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Web de EmpirioLabs: https://empiriolabs.ai
- Plataforma de EmpirioLabs: https://platform.empiriolabs.ai
- Todos los modelos de EmpirioLabs: https://huggingface.co/empiriolabsai
- Discord de EmpirioLabs: https://discord.gg/bM52azW4ZD
