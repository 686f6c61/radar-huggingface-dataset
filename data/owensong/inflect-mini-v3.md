# owensong/Inflect-Mini-v3

## Resumen

Inflect Mini v3 es un modelo de síntesis de voz (text-to-speech) en inglés desarrollado por el usuario owensong, publicado en Hugging Face como acceso anticipado no comercial. Se trata de un modelo compacto de 34,3 millones de parámetros que genera audio nativo a 24 kHz y ofrece seis voces predefinidas (Hope, Sophia, Cassidy, James, Jasper y Mark). El modelo resuelve la generación de habla local en inglés con un peso principal de solo 138,39 MB, lo que lo hace viable en CPU y en entornos con recursos limitados.

La relevancia del modelo radica en su enfoque de despliegue local y su arquitectura modular: además del núcleo de síntesis, incorpora componentes opcionales como un perfil de tono para la voz Cassidy (Q1500), un enhancer que eleva la salida de 24 kHz a 48 kHz, un módulo de eventos aprendidos (risa, suspiro, jadeo, tos) y un SDK de ajuste (Tuner) para adaptación con referencias autorizadas. No obstante, la licencia `inflect-preview-evaluation-1.0` y la etiqueta `inference: false` limitan su uso a evaluación no comercial.

El modelo se publicó el 10 de noviembre de 2026 y no registra descargas ni interacciones en el momento de la consulta. Su tamaño de repositorio es de 0,2 GB, e incluye scripts de verificación y lanzadores para ejecución local con Python 3.12.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS; núcleo de síntesis con decoder Vocos opcional para eventos) |
| Parámetros totales | 34.310.790 (núcleo); 3.801.977 adicionales con perfil pitch; 2.846.722 con enhancer; 6.648.699 con ambos; 13.531.650 adicionales para el decoder Vocos de eventos |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en `weights.pt`; salida WAV FLOAT por defecto, PCM_16 opcional) |
| Idiomas soportados | inglés (`en`) |
| Licencia | `inflect-preview-evaluation-1.0` (other, acceso anticipado no comercial) |
| Formato de pesos | PyTorch (`core/baseline/models/mini/weights.pt`, 138.388.547 bytes) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del núcleo de síntesis en la información proporcionada. La model card indica que el peso principal es un archivo PyTorch (`weights.pt`) de 138,39 MB y que el modelo genera audio nativo a 24 kHz. El componente opcional de eventos emplea un decoder Vocos congelado de 13.531.650 parámetros y 25.600 valores de control aprendidos, lo que sugiere una arquitectura de decodificación neuronal para la generación de formas de onda.

No se especifican en la información disponible los datos de entrenamiento (número de tokens, composición del dataset), ni si se emplearon técnicas de RLHF, DPO u otras. Tampoco se detallan innovaciones como decodificación especulativa o atención lineal. El modelo se distribuye con un script `verify_release.py` que verifica el inventario de la release y desactiva la escritura de bytecode de Python antes de iniciar el CLI.

## Capacidades

- Generación de voz en inglés con seis voces predefinidas: Hope, Sophia, Cassidy, James, Jasper y Mark.
- Salida de audio nativa a 24 kHz; el perfil `enhanced` permite extender el ancho de banda a 48 kHz mediante un modelo de extensión de banda.
- Perfil de tono `pitch` (Q1500) exclusivo para la voz Cassidy, con 3.801.977 parámetros adicionales; puede recurrir al perfil Original si su guardia rechaza un fragmento.
- Eventos aprendidos opcionales para Cassidy: `[laugh]`, `[sigh]`, `[gasp]` y `[cough]`, con cuatro interpretaciones fijas revisadas por humanos.
- SDK Tuner opcional para enrollment con grabaciones de referencia autorizadas de 5 a 15 segundos y reproducción de perfiles guardados; no es clonación de voz sin restricciones.
- Ejecución local en CPU por defecto, con soporte opcional de CUDA mediante `core/requirements-cuda.txt` y `--device cuda`.
- No se menciona soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking.

## Casos de uso

- Generación de audiolibros y narración: el modelo puede sintetizar texto largo en inglés con seis voces distintas, y el perfil `enhanced` permite obtener WAV a 48 kHz para una mayor fidelidad en producción editorial.
- Asistentes de voz locales: al ejecutarse en CPU con un peso de 138,39 MB, puede integrarse en aplicaciones de escritorio o dispositivos con recursos limitados para respuestas habladas en inglés sin depender de la nube.
- Prototipado de interfaces conversacionales: los desarrolladores pueden generar muestras de voz para probar flujos de atención al cliente o asistentes domésticos antes de invertir en modelos TTS de mayor tamaño.
- Contenido para podcasts y vídeos: las voces Cassidy y Hope, junto con los eventos `[laugh]` y `[sigh]`, permiten añadir expresividad a locuciones grabadas sin necesidad de un actor de voz.
- Evaluación de tecnologías TTS: el modelo sirve como referencia compacta para comparar calidad, latencia y consumo de recursos frente a alternativas más grandes en entornos de investigación.
- Accesibilidad y lectura de textos: puede convertir artículos o documentos en audio en inglés para personas con discapacidad visual, ejecutándose localmente y sin enviar datos a servidores externos.
- Pruebas de adaptación de voz: el SDK Tuner permite experimentar con enrollment a partir de grabaciones autorizadas de 5 a 15 segundos para adaptar la condicionalización del modelo, útil en investigación sobre personalización de TTS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el núcleo pesa 138,39 MB y el paquete completo 0,2 GB, por lo que la huella de memoria es reducida.
- GPU recomendadas: no se especifican modelos concretos; el modo CUDA requiere una instalación compatible con `core/requirements-cuda.txt` y el flag `--device cuda`.
- Compatibilidad con GPU de consumo: el modelo está diseñado para ejecutarse en CPU por defecto, por lo que cabe en cualquier GPU de consumo e incluso en sistemas sin GPU dedicada.
- Opciones de despliegue: lanzador propio `run.py` con subcomandos `speech` y `events`; requiere Python 3.12 y `huggingface-hub==0.36.2`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni especificaciones de modelos alternativos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia `inflect-preview-evaluation-1.0`: acceso anticipado no comercial; no se anuncia un lanzamiento final y el uso comercial está restringido según los términos del archivo `LICENSE.md`.
- El modelo solo soporta inglés (`en`); no se contemplan otros idiomas.
- La etiqueta `inference: false` en la model card indica que la inferencia no está habilitada en el Hub; la ejecución debe realizarse localmente tras descargar el paquete completo.
- Los eventos aprendidos están limitados a cuatro interpretaciones fijas para la voz Cassidy; no son generación de eventos sin restricciones ni controles emocionales generales, y no están disponibles para las otras cinco voces.
- El perfil `pitch` Q1500 solo aplica a Cassidy y puede recurrir al perfil Original si su guardia rechaza un fragmento; no es una mejora de pulido para las seis voces.
- El enhancer de 48 kHz no convierte a Mini en un modelo nativo de 48 kHz; se trata de una extensión de banda sobre la salida de 24 kHz.
- El SDK Tuner no realiza clonación de voz sin restricciones; adapta la condicionalización existente y requiere grabaciones autorizadas y pesos de encoder adquiridos por separado.
- No se dispone de información sobre sesgos, riesgo de alucinación (en el sentido de artefactos de audio) ni latencia en producción.
- El repositorio no registra descargas ni likes, y el modelo se publicó como acceso anticipado, por lo que su madurez y soporte comunitario son limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/owensong/Inflect-Mini-v3
- Archivos del modelo: https://huggingface.co/owensong/Inflect-Mini-v3/tree/main
- Licencia: https://huggingface.co/owensong/Inflect-Mini-v3/blob/main/LICENSE.md
- Banner del modelo: https://huggingface.co/owensong/Inflect-Mini-v3/resolve/main/assets/banner-v3.svg
