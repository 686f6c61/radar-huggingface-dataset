# neonforestmist/smolgpt-fables-coreml

## Resumen

SmolGPT-Fables Core ML v1 es un paquete de runtime para Apple que acompaña al modelo de lenguaje SmolGPT-Fables, desarrollado por neonforestmist. Este repositorio contiene exclusivamente la conversión a Core ML del modelo base, pensada para aplicaciones nativas de iOS y macOS que necesiten generación de historias privada y en el dispositivo. El paquete usa pesos INT4 con activaciones FP16, una ventana de contexto de 2.048 tokens y un vocabulario de 49.152 tokens, y está optimizado para iOS 18+ y macOS 15+.

El modelo base, SmolGPT-Fables, es un generador de historias en formato Markdown que escribe relatos cortos estructurados, continúa "story canvases", realiza pases editoriales observables y puede emitir un intent de generación de imagen para que un host local lo valide y ejecute. Según la model card del Core ML, el modelo tiene 1.710 millones de parámetros, aunque la página del modelo base reporta 6.032.640 parámetros (aproximadamente 6 millones), lo que sugiere una discrepancia que debe verificarse con el autor. La relevancia de este paquete radica en que permite ejecutar un modelo de generación de texto con licencia Apache-2.0 completamente en el dispositivo Apple, sin conexión, con un flujo de compilación y verificación documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (inferido; no especificado explícitamente) |
| Parametros totales | 1.710 millones (según model card del Core ML); la página del modelo base reporta 6.032.640 (discrepancia pendiente de verificación) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | INT4 (pesos) con activaciones FP16 |
| Idiomas soportados | Inglés (según la descripción del modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML `.mlpackage` (también safetensors y GGUF en el repositorio base) |

## Arquitectura y entrenamiento

No se proporcionan detalles sobre la arquitectura interna (número de capas, heads, dimensiones ocultas) ni sobre el proceso de entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). La model card del Core ML indica que el paquete es una conversión de formato del modelo base, con pesos INT4 y un cache de clave/valor stateful para decodificación autoregresiva. El modelo base se describe como "entrenado desde cero" en la página de Hugging Face, pero la licencia referencia a SmolLM2-1.7B-Instruct, lo que sugiere que podría ser un fine-tune de ese modelo. No hay información adicional sobre el dataset de entrenamiento ni sobre innovaciones técnicas específicas más allá de la conversión a Core ML.

## Capacidades

- Generación de historias cortas en formato Markdown, con estructura narrativa (títulos, párrafos, diálogos).
- Continuación de "story canvases" (esquemas o borradores de historia).
- Pases editoriales observables: el modelo puede revisar y modificar su propio texto.
- Emisión de un intent `image.generate` para que un host local valide y ejecute la generación de imágenes (capacidad declarada, no verificada en este paquete).
- Soporte de tool use (según la etiqueta del dataset del modelo base).
- Generación de texto en inglés únicamente.
- Ejecución en dispositivo con privacidad total (sin conexión a servidores).

## Casos de uso

- Aplicación iOS de cuentos para niños: el modelo genera fábulas personalizadas a partir de una idea, género, personajes y escenario, todo en el dispositivo, sin necesidad de conexión a internet.
- Asistente de escritura creativa en macOS: el usuario introduce un esquema o "story canvas" y el modelo lo expande en una narración coherente, con la posibilidad de realizar pases editoriales automáticos.
- Generación de contenido para juegos narrativos: el modelo puede crear diálogos y descripciones de escenas en tiempo real, aprovechando el contexto de 2.048 tokens para mantener coherencia en conversaciones multi-turno.
- Herramienta de prototipado rápido de historias: los desarrolladores pueden integrar el modelo en un playground de Swift para experimentar con diferentes estilos narrativos sin depender de APIs externas.
- Sistema de recomendación de cuentos personalizados: una app de lectura puede generar historias adaptadas a los intereses del usuario, usando el modelo como motor de generación local.
- Demo educativa de IA en el dispositivo: el paquete Core ML sirve como ejemplo de conversión y despliegue de modelos de lenguaje en Apple Silicon, útil para talleres y documentación técnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card del Core ML incluye únicamente resultados de validación de la conversión:

| Check | Resultado |
|---|---|
| Conversión Core ML | Superada |
| Compresión INT4 | Superada |
| Verificación SHA-256 del origen | Superada |
| Prueba de predicción stateful | Superada |
| Similitud coseno FP16/INT4 | 0,9529 |
| Coincidencia del token principal | Sí |
| Solapamiento de top-5 tokens | 4/5 |
| Forma de salida | `[1, 1, 49.152]` |

Estos resultados indican que la conversión a INT4 preserva razonablemente el comportamiento del modelo original, pero no constituyen una evaluación de la calidad narrativa. La evaluación de comportamiento de historias se remite a la model card del modelo base, cuyos datos no se han incluido en la información proporcionada.

## Requisitos de hardware

- Dispositivos Apple con iOS 18 o posterior, o macOS 15 o posterior.
- El paquete `.mlpackage` ocupa 0,96 GB; se recomienda un dispositivo con al menos 2 GB de RAM libre para la carga del modelo y el cache stateful.
- La configuración recomendada es `MLModelConfiguration.computeUnits = .cpuAndGPU` para el decodificador stateful.
- No se especifican requisitos de VRAM ni GPU concretas, pero al ser un modelo de ~1,7B en INT4, puede ejecutarse en iPhone y iPad con chip A14 o posterior, y en Macs con Apple Silicon.
- Opciones de despliegue: integración directa en apps Swift mediante `MLModel.compileModel` y `MLModel.load`. No se menciona soporte para vLLM, llama.cpp u Ollama en este paquete (es exclusivo de Core ML).

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos con otros modelos de generación de historias en el ecosistema Apple. El modelo base referencia a SmolLM2-1.7B-Instruct como modelo relacionado, pero no se han publicado comparaciones directas. Se puede considerar que SmolLM2-1.7B-Instruct es una alternativa de propósito general con licencia Apache-2.0, pero no se dispone de información suficiente para establecer una comparativa técnica rigurosa. Por tanto, esta sección se considera no disponible.

## Limitaciones y advertencias

- Discrepancia en el número de parámetros: la model card del Core ML indica 1.710 millones, mientras que la página del modelo base reporta 6.032.640. Esta inconsistencia debe aclararse con el autor antes de usar el modelo en producción.
- El modelo está entrenado exclusivamente en inglés; no soporta otros idiomas.
- Ventana de contexto limitada a 2.048 tokens, lo que restringe la generación de historias largas o conversaciones extensas.
- Al ser un modelo experimental y pequeño, es probable que presente alucinaciones, incoherencias narrativas y sesgos derivados de su dataset de entrenamiento (no documentado).
- La capacidad de emisión de `image.generate` es un intent declarado, no una funcionalidad integrada; requiere un host local que lo valide y ejecute.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar la model card de SmolLM2-1.7B-Instruct (citada como referencia) para evaluar limitaciones adicionales.
- El paquete Core ML está pensado únicamente para plataformas Apple; no es utilizable en otros entornos sin conversión adicional.

## Enlaces

- Repositorio Core ML: https://huggingface.co/neonforestmist/smolgpt-fables-coreml
- Modelo base: https://huggingface.co/neonforestmist/smolgpt-fables
- Space de demostración (SmolGPT-Fables Studio): https://huggingface.co/spaces/neonforestmist/SmolGPT-Fable-Studio
- Aplicación iOS de referencia: https://github.com/neonforestmist/SmolGPT-Fables-iOS
- Model card de SmolLM2-1.7B-Instruct (referencia de licencia): https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- Dataset del modelo base (información externa): https://free2aitools.com/dataset/neonforestmist/smolgpt-fables
