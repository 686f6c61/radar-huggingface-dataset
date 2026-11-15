# Phoonnx/coqui-vits-ga-cv-vits

## Resumen

`Phoonnx/coqui-vits-ga-cv-vits` es un modelo de síntesis de voz (text-to-speech) en formato ONNX derivado de `coqui/ga-cv-vits`, un checkpoint VITS entrenado sobre el corpus Common Voice en irlandés (ga-IE). El modelo lo publica el usuario Phoonnx como parte del repositorio agregador `Phoonnx/phoonnx-coqui-vits`, que empaqueta voces Coqui VITS convertidas a ONNX para su uso con la librería `phoonnx` (runtime de inferencia TTS basado en ONNX Runtime, mantenido por TigreGotico).

La relevancia de este modelo es acotada pero específica: cubre una lengua de bajos recursos (irlandés) con un formato de pesos ONNX ligero (el repositorio ocupa 0,1 GB), lo que permite despliegue en CPU sin dependencias de PyTorch ni de la cadena de herramientas original de Coqui. No es un modelo fundacional ni compite en calidad con sistemas TTS comerciales, sino una pieza de infraestructura para pipelines de voz multilingües que necesitan cubrir ga-IE de forma reproducible.

La información pública disponible es mínima: la model card se limita a indicar la procedencia del checkpoint, la licencia BSD-3-Clause y el identificador de voz (`coqui/ga-cv-vits`). No se publican métricas de calidad (MOS, WER), detalles del dataset de entrenamiento más allá de "Common Voice", ni especificaciones de arquitectura interna.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS), exportado a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS, sin ventana de contexto textual) |
| Tipos de cuantización | no disponible (pesos ONNX; no se documenta FP32/FP16/INT8) |
| Idiomas soportados | irlandés (ga-IE), según la model card del repositorio fuente |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX |
| Tamaño del repositorio | 0,1 GB |
| Pipeline | text-to-speech |
| Runtime | `phoonnx` (ONNX Runtime) |
| Voice ID | `coqui/ga-cv-vits` |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura end-to-end que combina un codificador de texto, un prior variacional condicionado por alineamientos monotónicos (MAS), un decodificador generativo basado en flujos normalizadores y un discriminador adversarial multi-periodo. El texto se procesa con fonemización previa; en este caso, la fonemización del irlandés corre a cargo del pipeline de `phoonnx`.

El entrenamiento original corresponde a Coqui TTS sobre el corpus Common Voice en irlandés. No se documentan en la información disponible el número de horas de audio, el número de pasos de entrenamiento, la composición exacta del dataset ni si hubo ajuste fino adicional. Tampoco se especifican detalles de la exportación a ONNX (versión de opset, optimizaciones aplicadas, precisión de los pesos).

## Capacidades

- Síntesis de voz (text-to-speech) en irlandés (ga-IE) a partir de texto.
- Generación de audio en formato waveform mono mediante inferencia ONNX.
- Ejecución en CPU sin dependencia de PyTorch, gracias al runtime `phoonnx`.
- Integración con el ecosistema `phoonnx` mediante el voice ID `coqui/ga-cv-vits`.
- No soporta clonación de voz, control de estilo, emoción ni cambios de hablante (modelo de hablante único derivado de Common Voice).
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de LLM: es exclusivamente un modelo TTS.
- No se documenta soporte multilingüe más allá del irlandés.

## Casos de uso

- **Lectura de contenido en irlandés**: convertir artículos, documentación o textos educativos a audio para sitios web y aplicaciones de accesibilidad en ga-IE, aprovechando que el modelo es ligero (0,1 GB) y corre en CPU.
- **Asistentes de voz para lengua irlandesa**: integrar el voice ID `coqui/ga-cv-vits` en un pipeline `phoonnx` para dar respuesta hablada en aplicaciones de asistente doméstico o de movilidad dirigidas a hablantes de irlandés.
- **Preservación y aprendizaje de idiomas**: generar materiales de escucha para cursos de irlandés, dado que el modelo se entrenó sobre Common Voice, un corpus de habla voluntaria con diversidad de acentos.
- **Sistemas de anuncios públicos**: producir avisos hablados en irlandés para transporte, aeropuertos o administraciones públicas donde se requiere cobertura de la lengua oficial.
- **Prototipado de pipelines TTS multilingües**: usar este modelo como una de las voces de un sistema que enruta por idioma, validando la integración con `phoonnx` antes de sustituir por voces de mayor calidad.
- **Investigación en TTS de bajos recursos**: servir como línea base reproducible en formato ONNX para comparar técnicas de mejora sobre irlandés sin necesidad de reentrenar desde cero.
- **Accesibilidad en dispositivos sin GPU**: desplegar síntesis de voz en entornos de borde o servidores sin acelerador, gracias al tamaño reducido y al runtime ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible; al ser un modelo ONNX de 0,1 GB, la inferencia puede ejecutarse en CPU con huella de memoria del orden de cientos de MB, pero no se documentan cifras oficiales.
- **GPU recomendadas**: no se especifican. Por tamaño, cualquier GPU con al menos 1-2 GB de memoria libre debería ser suficiente, pero es una estimación, no un dato del autor.
- **Consumer GPU**: previsiblemente cabe en cualquier GPU de consumo moderna (GTX 1050 en adelante) e incluso en CPU, aunque no se confirma en la documentación.
- **Opciones de despliegue**: runtime `phoonnx` (ONNX Runtime). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Tamaño | Disponibilidad |
|---|---|---|---|---|---|---|
| `Phoonnx/coqui-vits-ga-cv-vits` | VITS (ONNX) | ga-IE | ONNX | BSD-3-Clause | 0,1 GB | Hugging Face |
| `coqui/ga-cv-vits` (origen) | VITS | ga-IE | PyTorch (Coqui) | BSD-3-Clause | no disponible | Coqui Model Zoo |
| Otras voces del repo `Phoonnx/phoonnx-coqui-vits` | VITS (ONNX) | varios | ONNX | BSD-3-Clause (según fuente) | variable | Hugging Face |
| Meta MMS-TTS (ga) | VITS | ga | PyTorch | CC-BY-NC 4.0 | ~145M parámetros | Hugging Face |

La comparación con MMS-TTS de Meta es cualitativa: MMS cubre irlandés con una licencia no comercial, mientras que este modelo conserva la licencia BSD-3-Clause del checkpoint Coqui, lo que facilita su uso comercial. No hay datos de calidad comparativa (MOS) disponibles para ninguno de los dos en la información proporcionada.

## Limitaciones y advertencias

- **Calidad no documentada**: no se publican métricas MOS, WER ni comparativas subjetivas; la calidad real de la síntesis es desconocida.
- **Sesgos del corpus**: Common Voice es un corpus de habla voluntaria, con posible sobrerrepresentación de determinados acentos, edades y géneros; el modelo hereda esos sesgos.
- **Riesgo de alucinación acústica**: como todo modelo generativo de audio, puede producir artefactos, prosodia incorrecta o pronunciaciones erróneas en palabras fuera del vocabulario de entrenamiento.
- **Cobertura limitada de idioma**: solo irlandés; no se documenta manejo de texto mixto ga-EN ni de números, siglas o nombres propios.
- **Hablante único**: no permite cambio de voz ni clonación.
- **Licencia**: BSD-3-Clause permite uso comercial, pero conviene verificar la cadena de licencias del checkpoint original Coqui y del corpus Common Voice (CC0 para el audio, pero con condiciones de atribución en algunos usos).
- **Mantenimiento**: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto de publicación reciente sin validación comunitaria.
- **Dependencia del runtime**: el uso práctico requiere la librería `phoonnx`, cuyo mantenimiento y compatibilidad futura no están garantizados por el autor del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/coqui-vits-ga-cv-vits
- Repositorio agregador: https://huggingface.co/Phoonnx/phoonnx-coqui-vits
- Runtime `phoonnx`: https://github.com/TigreGotico/phoonnx
- Checkpoint origen Coqui: `coqui/ga-cv-vits` (Coqui Model Zoo)
- Corpus Common Voice: https://commonvoice.mozilla.org/
