# KittenML/kitten-tts-2-mini

## Resumen

Kitten TTS 2 Mini es un modelo de síntesis de voz (text-to-speech) desarrollado por KittenML, diseñado para inferencia en CPU sin dependencias de PyTorch. Con 82 millones de parámetros, cubre 16 idiomas y ofrece 118 voces distintas, lo que lo posiciona como una alternativa ligera y multilingüe frente a modelos TTS de mayor tamaño que requieren GPU.

La arquitectura se distribuye en dos formatos: un grafo ONNX con pesos cuantizados a int8 de solo 82,7 MB, ejecutable mediante ONNX Runtime en CPU, y pesos PyTorch en float32 para ejecución opcional en GPU. La frecuencia de muestreo de salida es de 24 kHz, lo que proporciona calidad de audio adecuada para aplicaciones de producción sin el coste computacional de modelos más pesados.

El modelo resulta relevante en el contexto actual de despliegue en el borde (edge computing) y aplicaciones de bajo consumo: permite integrar síntesis de voz multilingüe en entornos sin GPU, contenedores ligeros y dispositivos con recursos limitados, con licencia Apache 2.0 que facilita su uso comercial. La selección de voz determina el idioma, y las voces inglesas pueden hablar también alemán, español, italiano, portugués y ruso mediante el parámetro `language`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS neuronal; pesos ONNX y PyTorch) |
| Parametros totales | 82M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (ONNX), float32 (PyTorch) |
| Idiomas soportados | en, de, es, it, pt, ru, hi, da, fi, fr, ja, ko, nl, sv, sw, tr |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (int8, 82,7 MB), safetensors/PyTorch (float32) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. Se trata de un modelo de síntesis de voz neuronal con 82 millones de parámetros, distribuido en dos backends: un grafo ONNX con pesos cuantizados a int8 que se ejecuta mediante ONNX Runtime sin necesidad de PyTorch, y pesos PyTorch en float32 para ejecución en CPU o GPU (CUDA). La salida de audio se genera a 24 kHz.

El modelo emplea un sistema de "voice packs" almacenados en archivos `voices_<lang>.npz`, donde cada voz se identifica por un nombre en minúsculas. Las voces inglesas comparten nombre con personajes de KittenTTS 2 y pueden hablar también alemán, español, italiano, portugués y ruso bajo el mismo nombre, seleccionando el idioma mediante el parámetro `language`. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Síntesis de voz (text-to-speech) en 16 idiomas: inglés, alemán, español, italiano, portugués, ruso, hindi, danés, finés, francés, japonés, coreano, neerlandés, sueco, suajili y turco.
- 118 voces distintas con nombres y descripciones de estilo (por ejemplo, "Eleanor: historiadora sombría", "Max: locutor deportivo energético").
- Control de velocidad de habla mediante el parámetro `speed` (por ejemplo, `speed=1.1`).
- Selección de voz por nombre o por descripción, sin distinción de mayúsculas.
- Selección de idioma explícita mediante `language=`, con la primera voz del idioma como predeterminada si no se especifica voz.
- Ejecución en CPU mediante ONNX Runtime (backend por defecto) sin necesidad de PyTorch.
- Ejecución opcional en GPU mediante backend PyTorch con `device="cuda"`.
- Salida de audio a 24 kHz compatible con bibliotecas estándar como `soundfile`.
- Voces multilingües compartidas: las voces inglesas (Eleanor, Martha, Serena, Iris, Grace, Edith, Diana, Otis, Vincent) pueden hablar alemán, español, italiano, portugués y ruso.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- **Atención al cliente automatizada en múltiples idiomas**: el modelo permite generar respuestas de voz en 16 idiomas con una sola instancia, seleccionando la voz adecuada por idioma o reutilizando voces inglesas para alemán, español, italiano, portugués y ruso, lo que simplifica el despliegue en centros de contacto internacionales.
- **Lectura de artículos y accesibilidad**: integración en aplicaciones de lectura de pantalla o lectores de noticias que convierten texto en audio a 24 kHz, ejecutándose en CPU sin GPU y con un peso de solo 82,7 MB, adecuado para dispositivos de asistencia de bajo coste.
- **Generación de audio para vídeos y pódcast**: producción de narraciones con voces con estilo definido (locutor deportivo, presentador de pódcast, historiadora) y control de velocidad, útil para creadores de contenido que necesitan múltiples voces sin infraestructura GPU.
- **Sistemas de navegación y avisos por voz en el borde**: despliegue en dispositivos embebidos o vehículos donde no hay GPU disponible, aprovechando el backend ONNX int8 y la inferencia en CPU para generar instrucciones de voz en el idioma del usuario.
- **Prototipado rápido de asistentes de voz**: uso de la librería `kittenml` con `pip install kittenml` para generar audio en pocas líneas de código, facilitando la validación de conceptos de asistentes conversacionales multilingües antes de invertir en modelos mayores.
- **Localización de contenido educativo**: generación de material audioeducativo en hindi, suajili, turco, coreano o neerlandés, idiomas con menor cobertura en modelos TTS comerciales, con licencia Apache 2.0 que permite su uso en plataformas educativas.
- **Integración en pipelines de CI/CD para pruebas de audio**: generación automatizada de muestras de voz en distintos idiomas y voces para validar sistemas de reconocimiento de voz o de diálogo, gracias a la ligereza del modelo y su ejecución sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el backend ONNX por defecto (ejecución en CPU); en backend PyTorch con `device="cuda"` se requiere VRAM no especificada, pero al tratarse de 82M parámetros en float32 (aproximadamente 328 MB de pesos) la huella es reducida.
- GPU recomendadas: no se especifican; cualquier GPU compatible con CUDA y PyTorch puede ejecutar el backend `torch`. El backend ONNX no requiere GPU.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con CUDA para el backend PyTorch; el backend ONNX está pensado para CPU.
- Opciones de despliegue: ONNX Runtime (backend por defecto, int8), PyTorch (float32, CPU o CUDA), librería `kittenml` (`pip install kittenml`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. Se indica "no disponible" para los parámetros de rendimiento. A continuación se comparan únicamente los datos disponibles de alternativas conocidas del mismo segmento, marcando como "no disponible" lo que no se ha podido verificar:

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Kitten TTS 2 Mini | 82M | 16 | no disponible | Apache 2.0 | ONNX int8, PyTorch float32 |
| Alternativas TTS ligeras | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información proporcionada modelos comparables concretos con especificaciones verificables.

## Limitaciones y advertencias

- No se han documentado sesgos específicos del modelo; como todo sistema TTS entrenado con datos de voz, puede reflejar sesgos de acento, género o registro presentes en el corpus de entrenamiento.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero la síntesis puede producir pronunciaciones incorrectas en palabras poco frecuentes, nombres propios o idiomas con menor representación (por ejemplo, suajili o neerlandés).
- La selección de voz determina el idioma: las voces inglesas hablan por defecto inglés, y para que hablen alemán, español, italiano, portugués o ruso es necesario pasar explícitamente `language=`. Sin este parámetro, la salida será en inglés.
- No todas las voces están disponibles en todos los idiomas: hindi, danés, finés, francés, japonés, coreano, neerlandés, sueco, suajili y turco tienen conjuntos de voces propios y más reducidos, sin las voces inglesas compartidas.
- El modelo no dispone de parámetros de control de emoción, prosodia avanzada ni clonación de voz más allá de las 118 voces predefinidas.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indique si se han realizado cambios. No se han documentado restricciones adicionales.
- Para producción, la calidad de la síntesis en idiomas con menos voces o datos puede ser inferior; se recomienda evaluar muestras por idioma antes del despliegue.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que el modelo es reciente y cuenta con poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/KittenML/kitten-tts-2-mini
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
