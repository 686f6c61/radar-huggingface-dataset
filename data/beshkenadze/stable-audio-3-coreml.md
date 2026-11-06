# beshkenadze/stable-audio-3-coreml

## Resumen

Stable Audio 3 Core ML es una conversión al formato Core ML de los modelos Stable Audio 3 (variantes Medium y Small-Music) de Stability AI, realizada por el usuario beshkenadze. No se trata de un modelo entrenado desde cero ni de un fine-tuning: es una conversión de formato y runtime que traslada los checkpoints MLX originales a componentes Core ML ejecutables en Apple Silicon, manteniendo las licencias originales. El objetivo es permitir la generación de audio a partir de texto en hardware de Apple (macOS 15 o superior) aprovechando la CPU y, en el caso de Medium, también el Apple Neural Engine.

El condicionamiento textual proviene de T5Gemma (google/t5gemma-b-b-ul2), redistribuido dentro del release optimizado de Stability AI, junto con las tablas de muestreo y el tokenizador de Stable Audio. El repositorio ocupa 7,2 GB e incluye 74 componentes compilados: 12 bloques de texto compartidos, 24 bloques transformer y 12 bloques decodificadores para Medium, y 20 bloques transformer y 6 decodificadores para Small-Music, además de arrays de CPU, tokenizador y tablas de muestreo.

Es relevante para desarrolladores que quieran integrar generación de audio texto-a-audio en aplicaciones nativas de macOS sin depender de GPUs NVIDIA ni de servicios en la nube. Conviene subrayar que no es un pipeline autónomo: requiere un runner Core ML compatible que sepa encadenar los bloques troceados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión/transformer para audio con condicionamiento textual T5Gemma; conversión a bloques Core ML secuenciales |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; Medium mantiene proyecciones densas elegibles para ANE y el resto en FP32 sobre CPU; Small-Music en CPU |
| Idiomas soportados | no disponible (condicionamiento textual vía T5Gemma; idiomas no declarados) |
| Licencia | stable-audio-community-and-gemma (Stability AI Community License + Gemma Terms of Use) |
| Formato de pesos | Core ML compilado (componentes `coreml/v1`), con manifest.json y checksums SHA-256 |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Stable Audio 3, un modelo de generación de audio condicionado por texto, distribuido originalmente como checkpoints MLX por Stability AI en el release `stable-audio-3-optimized` (revisión `da6edc54ddba10bfd79a077102ded687f80e882b`). La conversión divide el cómputo en bloques secuenciales: 12 bloques de texto compartidos, 24 bloques transformer y 12 decodificadores para Medium, y 20 bloques transformer y 6 decodificadores para Small-Music. El condicionamiento textual usa T5Gemma (google/t5gemma-b-b-ul2) tal como lo redistribuye el release optimizado, sin una revisión separada de T5Gemma.

No se realizó entrenamiento ni fine-tuning: el autor declara explícitamente que es una conversión de formato y runtime. En Medium, las proyecciones densas se mantienen elegibles para el Apple Neural Engine mientras el resto de la aritmética se ejecuta en FP32 sobre CPU; el texto y la decodificación usan CPU. Small-Music se ejecuta íntegramente en CPU. Se eliminaron copias de pesos no utilizadas y se verificó que todos los pesos referenciados se conservasen; `MODIFICATIONS.txt` lista los binarios afectados. No se reclama ninguna mejora de calidad de audio.

## Capacidades

- Generación de audio a partir de descripciones textuales (text-to-audio).
- Dos variantes: Medium (CPU + Apple Neural Engine) y Small-Music (CPU).
- Condicionamiento textual mediante T5Gemma, con tokenizador y tablas de muestreo incluidas.
- Ejecución nativa en Apple Silicon sobre macOS 15 o superior mediante Core ML.
- Componentes troceados en bloques secuenciales que permiten repartir el cómputo entre CPU y ANE.
- Integridad verificable: manifest con tamaño en bytes y SHA-256 por archivo.
- No incluye tool calling, function calling, agentes, visión ni audio de entrada; es exclusivamente generación de audio desde texto.
- No es un pipeline autónomo: requiere un runner Core ML compatible con el troceado.

## Casos de uso

- Aplicaciones nativas de macOS para generar efectos de sonido o ambientes a partir de prompts de texto, aprovechando Core ML y el ANE en equipos Apple Silicon sin GPU dedicada.
- Prototipado de bandas sonoras o loops musicales en herramientas de estudio que corran en macOS 15+, usando la variante Small-Music para iteraciones rápidas en CPU.
- Generación de audio en local con privacidad de datos: al ejecutarse en el dispositivo, los prompts no salen del equipo, adecuado para entornos con requisitos de confidencialidad.
- Integración en pipelines de creación de contenido (podcasts, vídeo, juegos) que necesiten material de audio preliminar generado por texto antes de la producción final.
- Investigación y evaluación de modelos de audio en hardware Apple: permite comparar el comportamiento de Medium (CPU+ANE) frente a Small-Music (CPU) en el mismo entorno.
- Distribución de demos o aplicaciones de escritorio que empaqueten los componentes Core ML y un runner propio, con verificación de integridad mediante manifest y checksums.
- Experimentación con conversiones de formato: sirve como referencia para quienes quieran portar otros checkpoints MLX de audio a Core ML con reparto CPU/ANE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon (macOS 15 o superior). No se declara compatibilidad con Intel.
- Repositorio de 7,2 GB, por lo que se necesita espacio en disco suficiente para los 74 componentes compilados y los archivos auxiliares.
- Medium: usa CPU y Apple Neural Engine conjuntamente; las proyecciones densas son elegibles para ANE y el resto de la aritmética corre en FP32 sobre CPU.
- Small-Music: se ejecuta íntegramente en CPU.
- VRAM estimada: no disponible (no se especifican requisitos de memoria unificada ni de GPU).
- GPU recomendadas: no aplica; el despliegue es sobre Core ML en Apple Silicon, no sobre CUDA.
- Opciones de despliegue: Core ML con un runner compatible con el troceado secuencial; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este formato).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Stable Audio 3 Core ML (este) | no disponible | no disponible | Core ML compilado | Stable AI Community + Gemma | Hugging Face, requiere runner |
| stabilityai/stable-audio-3-optimized | no disponible | no disponible | MLX | Stable AI Community | Hugging Face (origen de la conversión) |
| stabilityai/stable-audio-3-medium | no disponible | no disponible | no disponible en la información | Stable AI Community | Hugging Face |
| stabilityai/stable-audio-3-small-music | no disponible | no disponible | no disponible en la información | Stable AI Community | Hugging Face |

No se dispone de datos de parámetros, contexto ni rendimiento de las alternativas en la información proporcionada; la comparación se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un pipeline autónomo: requiere un runner Core ML compatible que encadene los bloques; no funciona como un modelo de un solo archivo.
- Solo macOS 15 o superior y Apple Silicon; sin soporte declarado para otras plataformas.
- No se realizó entrenamiento ni fine-tuning, y no se reclama mejora de calidad de audio respecto al modelo original.
- Licencia compuesta: Stable Audio 3 bajo Stability AI Community License y los componentes T5Gemma bajo Gemma Terms of Use. No son pesos Apache ni MIT.
- El uso comercial o la distribución de Stable Audio requiere registro con Stability AI; por encima del límite de ingresos anuales aplicable se necesita una licencia separada.
- Las restricciones de uso de Gemma de la sección 3.2, incluida su Prohibited Use Policy, son condiciones exigibles de esta distribución y deben notificarse a usuarios posteriores.
- No se implica respaldo de Stability AI ni de Google.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser generación de audio, los sesgos dependerían de los datos originales de Stable Audio, no detallados aquí.
- Idiomas soportados no declarados; el condicionamiento textual depende de T5Gemma y de los prompts en el idioma que el modelo original admita.
- Los archivos `v1` son inmutables; cualquier conversión revisada debe publicarse bajo una nueva versión.

## Enlaces

- Hugging Face: https://huggingface.co/beshkenadze/stable-audio-3-coreml
- Modelo base optimizado: https://huggingface.co/stabilityai/stable-audio-3-optimized/tree/da6edc54ddba10bfd79a077102ded687f80e882b
- Model card Medium: https://huggingface.co/stabilityai/stable-audio-3-medium/blob/d4d3579395a8ac0df4ab13b5b1d7138ce7290f81/README.md
- Model card Small-Music: https://huggingface.co/stabilityai/stable-audio-3-small-music/blob/8bdfb53c6b0fbc62113cd571fd37373efe15fa14/README.md
- T5Gemma (Google DeepMind): https://huggingface.co/google/t5gemma-b-b-ul2
- Aviso legal y licencias: https://huggingface.co/beshkenadze/stable-audio-3-coreml/blob/main/NOTICE.txt
