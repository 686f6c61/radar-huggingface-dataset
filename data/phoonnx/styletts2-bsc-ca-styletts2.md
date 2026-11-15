# Phoonnx/styletts2-bsc-ca-styletts2

## Resumen

Phoonnx/styletts2-bsc-ca-styletts2 es un checkpoint de síntesis de voz (text-to-speech) empaquetado para la librería `phoonnx`, una implementación en ONNX orientada a despliegue ligero. El modelo deriva de StyleTTS2, una arquitectura de TTS neuronal que combina un codificador de estilo, un decodificador acústico basado en difusión y un vocoder, y que destaca por generar habla con prosodia natural y control de estilo. Este checkpoint concreto corresponde al subdirectorio `bsc-ca-styletts2` del repositorio agregador `Phoonnx/phoonnx-styletts2`, que reúne voces de distintos laboratorios bajo un mismo formato de despliegue.

El sufijo `bsc-ca` indica que la voz procede del Banco de Santander? No: en este contexto, `bsc` remite al Barcelona Supercomputing Center (BSC) y `ca` al catalán, por lo que se trata de una voz en catalán entrenada por el BSC. El modelo se publica como un único artefacto ONNX de aproximadamente 0,8 GB, pensado para inferencia sin GPU dedicada mediante la librería `phoonnx`.

La relevancia de esta ficha radica en que documenta un caso de TTS en catalán, un idioma con recursos limitados en el ecosistema open source, empaquetado para despliegue reproducible en ONNX. Sin embargo, la información pública disponible es escasa: no se detallan arquitectura exacta, número de parámetros, contexto ni métricas de evaluación, lo que limita la comparación rigurosa con alternativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 (TTS neuronal con codificador de estilo y decodificador acústico; detalles finos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (modelo de TTS, no de texto) |
| Tipos de cuantizacion | no disponible; el artefacto se distribuye en formato ONNX |
| Idiomas soportados | catalán (según el sufijo `ca` y los identificadores de voz `bsc/ca-*`) |
| Licencia | other (el checkpoint catalán del BSC está licenciado como GPL-3.0 por sus autores; `phoonnx` es Apache-2.0) |
| Formato de pesos | ONNX (repo de 0,8 GB; librería `phoonnx`) |

## Arquitectura y entrenamiento

StyleTTS2 es una arquitectura de TTS neuronal que, en su formulación original, emplea un codificador de estilo para desacoplar contenido y prosodia, un decodificador acústico con modelado generativo y un vocoder para producir la forma de onda. El empaquetado `phoonnx` convierte estos componentes a ONNX para permitir inferencia portable en CPU y GPU sin depender de PyTorch en tiempo de ejecución.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus catalán utilizado por el BSC, ni si se aplicaron etapas de ajuste fino con preferencias humanas (RLHF/DPO). Tampoco se documentan innovaciones específicas de este checkpoint más allá de las inherentes a StyleTTS2 y al formato ONNX de `phoonnx`. Cualquier afirmación adicional sobre el entrenamiento sería especulativa y, por tanto, se omite.

## Capacidades

- Síntesis de voz (text-to-speech) en catalán a partir de texto de entrada.
- Generación de habla con control de estilo prosódico, propiedad heredada de StyleTTS2.
- Múltiples voces empaquetadas bajo identificadores `bsc/ca-*` (bet, eli, eva, jan, mar, ona, pau, pep, pol, styletts2, teo, uri), lo que permite seleccionar timbre y hablante.
- Inferencia mediante ONNX, apta para entornos sin PyTorch.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada, ni modos de razonamiento; son irrelevantes para un modelo de TTS.
- Capacidades multilingües: no disponibles más allá del catalán.

## Casos de uso

- Lectura de artículos y documentación en catalán: el modelo puede convertir texto en audio para aplicaciones de accesibilidad o lectura por voz, aprovechando las voces `bsc/ca-*` para elegir un timbre adecuado al público.
- Locución de contenidos educativos: generación de narraciones para materiales didácticos en catalán, con control de estilo para adaptar el tono a distintos tramos del temario.
- Sistemas de atención al público en catalán: síntesis de respuestas habladas en entornos de servicio automatizado, usando el checkpoint ONNX para despliegue en servidores sin GPU dedicada.
- Doblaje y postproducción de bajo coste: generación de pistas de voz preliminares en catalán para maquetas de vídeo antes de la locución definitiva.
- Interfaces de voz para dispositivos embebidos: al distribuirse en ONNX y con un tamaño de repo de 0,8 GB, puede integrarse en pipelines de inferencia ligeros mediante `phoonnx`.
- Pruebas de regresión de pipelines TTS: servir como referencia reproducible en catalán para validar cambios en sistemas de síntesis o en la capa de despliegue ONNX.
- Investigación en TTS de bajos recursos: uso del checkpoint como línea base para experimentos con catalán, dada la escasez de voces open source en este idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con cifras concretas; el artefacto ONNX ocupa aproximadamente 0,8 GB en disco, lo que sugiere huella de memoria moderada, pero no se confirma.
- GPU recomendadas: no disponible. Al ser un modelo ONNX de TTS, es plausible su ejecución en CPU, pero no se documentan requisitos mínimos.
- Compatibilidad con GPU de consumo: no disponible; no se especifica si cabe en RTX 4090, RTX 3060 u otras.
- Opciones de despliegue: librería `phoonnx` (https://github.com/TigreGotico/phoonnx) y runtime ONNX; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de TTS de este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Phoonnx/styletts2-bsc-ca-styletts2 | no disponible | no disponible | other (checkpoint BSC GPL-3.0) | Hugging Face, formato ONNX | Voz catalana empaquetada para `phoonnx` |
| StyleTTS2 (original) | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | Repositorio público del proyecto original | Arquitectura base; voces multilingües |
| Alternativas TTS en catalán | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para establecer comparaciones cuantitativas con alternativas de la misma categoría.

## Limitaciones y advertencias

- La licencia efectiva del checkpoint catalán del BSC es GPL-3.0 según los autores, lo que impone obligaciones de copyleft para uso comercial y distribución; conviene revisar el texto completo de la licencia antes de integrarlo en productos.
- La model card original indica `license: other` porque el repositorio agregador mezcla checkpoints de distintos laboratorios con licencias distintas; no debe asumirse una licencia única para todo el paquete.
- Riesgo de alucinación acústica: como todo modelo de TTS, puede producir pronunciaciones incorrectas, prosodia anómala o artefactos en textos con números, siglas, nombres propios o puntuación atípica.
- Cobertura lingüística limitada al catalán; no se documenta soporte para castellano, inglés u otros idiomas.
- Sesgos de hablante: las voces incluidas pueden no representar la diversidad de acentos y registros del catalán; no se documenta la composición demográfica del corpus.
- Ausencia de métricas publicadas (MOS, WER, latencia), lo que impide validar calidad objetiva antes de producción.
- Escasa documentación técnica sobre arquitectura exacta, parámetros y entrenamiento; dificulta la reproducibilidad y el ajuste fino.
- El identificador `bsc-ca-styletts2` aparece tanto como carpeta como voz (`bsc/ca-styletts2`), lo que puede generar confusión en la selección de voces dentro de `phoonnx`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/styletts2-bsc-ca-styletts2
- Repositorio agregador de voces: https://huggingface.co/Phoonnx/phoonnx-styletts2
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
