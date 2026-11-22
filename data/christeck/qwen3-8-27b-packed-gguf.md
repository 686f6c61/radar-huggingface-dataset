# Christeck/Qwen3.8-27B-PACKED-GGUF

## Resumen

Qwen3.8-27B-PACKED-GGUF es un reempaquetado sin pérdida de los códigos trellis de cuantización EXL3 (ExLlamaV3, obra de Turboderp) del modelo denso Qwen3.8-27B de Alibaba Cloud (equipo Qwen), en el contenedor propietario "Packed GGUF" que consume el motor Metal Trellis, un fork orientado a Apple Silicon y Metal desarrollado por Christeck Labs. No hay reentrenamiento ni ajuste fino: los pesos cuantizados son idénticos a los del checkpoint EXL3 original y solo cambia el formato del contenedor.

Su relevancia no está en el modelo en sí, sino en la demostración técnica: consigue alojar un transformer denso de 27 000 millones de parámetros en 10,84 GiB de memoria, un ratio de compresión cercano a 3,00 bits por peso, manteniendo una equivalencia medida indistinguible de BF16 en negative log-likelihood y una coincidencia del 100 % de tokens frente a una referencia Q8_0 en la batería de verificación del autor.

El propio autor lo describe como un artefacto de investigación y no como un modelo de uso diario: en un Apple M1 Max de 64 GB alcanza 2,70 tokens por segundo en decodificación. Para uso práctico remite a su variante MoE, Qwen3.5-35B-A3B-PACKED-GGUF. La ficha siguiente documenta el paquete tal y como está publicado, con la advertencia de que buena parte de las especificaciones del modelo base no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.8-27B); contenedor Packed GGUF con tensores trellis EXL3 |
| Parametros totales | 27 000 millones (27B, segun el nombre del modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | EXL3 trellis a 3,00 bits por peso (bpw); referencia de verificacion Q8_0; formato propietario Packed GGUF |
| Idiomas soportados | Ingles y espanol (segun metadatos del repositorio) |
| Licencia | Apache 2.0 (heredada del modelo base Qwen3.8-27B; cuantizacion EXL3 acreditada a Turboderp bajo MIT) |
| Formato de pesos | Packed GGUF para el motor Metal Trellis (no compatible con llama.cpp estandar) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.8-27B, un transformer denso de 27 000 millones de parámetros publicado por Alibaba Cloud bajo licencia Apache 2.0. Sobre ese checkpoint se aplicó cuantización EXL3 con códigos trellis (una variante de cuantización vectorial basada en retículos, implementada en ExLlamaV3), y posteriormente Christeck Labs reempaquetó esos códigos en el contenedor Packed GGUF que decodifica su motor Metal Trellis mediante kernels Metal. No se realizó ningún proceso de reentrenamiento, ajuste fino, RLHF ni DPO en este repositorio: la model card es explícita al respecto.

La innovación técnica del paquete es el propio motor de inferencia: Metal Trellis decodifica los tensores comprimidos en formato trellis sobre la marcha con kernels Metal nativos, lo que permite ejecutar un modelo denso de 27B en hardware Apple Silicon con un consumo de memoria de 10,84 GiB. La conversión original se ejecutó en hardware alquilado Blackwell/A100, y el autor publica este archivo como copia de cortesía para evitar que terceros repitan el trabajo. No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset ni las técnicas de alineación del modelo base Qwen3.8-27B.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.8-27B (no se detallan capacidades específicas en la información disponible).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües limitadas, según los metadatos del repositorio, a inglés y español.
- Capacidades de visión, audio o modo thinking: no disponibles en la información proporcionada.
- Inferencia exclusivamente en Apple Silicon con Metal mediante el motor Metal Trellis; no funciona con llama.cpp estándar ni con otros runtimes GGUF convencionales.

## Casos de uso

- Investigación en cuantización extrema: el paquete sirve como referencia reproducible para estudiar el comportamiento de la cuantización trellis EXL3 a 3,00 bpw frente a BF16 y Q8_0, con una batería de verificación documentada por el autor.
- Desarrollo y validación del motor Metal Trellis: al ser un artefacto de prueba con equivalencia token a token frente a Q8_0, permite verificar la corrección de los kernels Metal en nuevas versiones del motor.
- Ejecución de un modelo denso de 27B en equipos Apple Silicon de gama alta: con 10,84 GiB de huella de memoria, cabe en Mac con 32 GB o más, aunque a 2,70 tok/s solo resulta viable para tareas por lotes no interactivas.
- Generación offline por lotes en estaciones de trabajo macOS: resúmenes, clasificación o extracción de información sobre volúmenes grandes de texto donde la latencia no es crítica y prima el coste cero de infraestructura cloud.
- Reproducción de experimentos de cuantización: el autor documenta el procedimiento de conversión en el repositorio del motor, lo que permite generar Packed GGUF propios a partir de cualquier checkpoint EXL3.
- Evaluación comparativa de estrategias de compresión: útil para contrastar el ratio memoria/calidad de EXL3 trellis frente a GGUF K-quants o formatos propietarios en un mismo modelo base.
- Prototipado de asistentes en español sobre hardware de escritorio Apple, siempre que se acepte el rendimiento reducido y se valide la calidad del modelo base por separado.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Velocidad de decodificacion | 2,70 tok/s | Apple M1 Max, 64 GB |
| Correccion frente a Q8_0 | 100 % de tokens identicos | Bateria de verificacion del autor |
| Calidad (NLL) frente a BF16 | Indistinguible (intervalo de confianza incluye 0) | Medicion EXL3 a 3,00 bpw |
| Memoria ocupada | 10,84 GiB | Modelo denso de 27B en Packed GGUF |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 10,84 GiB para el modelo en Packed GGUF a 3,00 bpw, según la medición del autor en M1 Max de 64 GB.
- Plataforma obligatoria: Apple Silicon con macOS y Metal; el motor Metal Trellis es un fork específico y no hay soporte para CUDA, ROCm ni CPU x86 documentado.
- GPU recomendadas: Apple M1 Max o superiores (M2 Max, M3 Max, M4 Max y familias Ultra) por ancho de banda de memoria; no se documentan resultados en otras GPU.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada de 32 GB o más, aunque el rendimiento medido de 2,70 tok/s limita su uso interactivo.
- Opciones de despliegue: exclusivamente el motor Metal Trellis (https://github.com/Christeck-AI/metal-trellis); no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 2,70 tok/s en decodificación sobre M1 Max de 64 GB; no se proporcionan datos de prefill ni de throughput por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Christeck/Qwen3.8-27B-PACKED-GGUF | 27B denso | No disponible | Packed GGUF / Metal Trellis | Apache 2.0 | 10,84 GiB, 2,70 tok/s en M1 Max |
| Christeck/Qwen3.5-35B-A3B-PACKED-GGUF | 35B totales, 3B activos (MoE) | No disponible | Packed GGUF / Metal Trellis | No disponible | Alternativa recomendada por el propio autor para uso práctico |
| Qwen/Qwen3.8-27B (modelo base) | 27B denso | No disponible | Safetensors / BF16 | Apache 2.0 | Referencia de calidad sin cuantizar; requiere hardware muy superior |
| Checkpoint EXL3 de Qwen3.8-27B (Turboderp) | 27B denso | No disponible | EXL3 / ExLlamaV3 | Apache 2.0 | Mismos códigos trellis; orientado a GPU NVIDIA |

## Limitaciones y advertencias

- Rendimiento muy bajo para uso interactivo: 2,70 tok/s en M1 Max; el autor lo califica explícitamente de artefacto de investigación y no de modelo de uso diario.
- Compatibilidad restringida: no es un GGUF estándar de llama.cpp y solo funciona con el fork Metal Trellis en Apple Silicon; no hay soporte para CUDA, ROCm ni CPU.
- Dependencia de un proyecto de un único autor: el mantenimiento del motor y del formato recae en Christeck Labs, con riesgo de abandono o cambios incompatibles.
- Idiomas limitados a inglés y español según los metadatos; no se documenta cobertura multilingüe adicional.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones de sesgo ni de seguridad para este paquete ni para el modelo base en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero la cuantización EXL3 se distribuye bajo MIT y el usuario debe conservar las atribuciones a Alibaba Cloud (modelo base) y a Turboderp (cuantización).
- Sin garantías: el autor distribuye el modelo "AS IS", sin soporte ni compromisos de calidad.
- Ausencia de datos clave: no hay información sobre longitud de contexto, dataset de entrenamiento, benchmarks estándar ni capacidades de tool calling del modelo base, lo que impide evaluar su idoneidad para producción sin pruebas adicionales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Christeck/Qwen3.8-27B-PACKED-GGUF
- Motor Metal Trellis: https://github.com/Christeck-AI/metal-trellis
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Alternativa MoE recomendada por el autor: https://huggingface.co/Christeck/Qwen3.5-35B-A3B-PACKED-GGUF
