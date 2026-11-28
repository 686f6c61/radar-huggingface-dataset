# Mrbizarro/gemma4-12b-ltx25-q4

## Resumen

`Mrbizarro/gemma4-12b-ltx25-q4` es la torre de texto (text encoder) que utiliza el modelo de generación de vídeo LTX-2.5 de Lightricks, convertida a MLX y cuantizada a 4 bits para su ejecución local en Apple Silicon. No se trata de un modelo conversacional ni de un LLM de propósito general: es un componente auxiliar que transforma los prompts de texto en embeddings que el motor de difusión de LTX-2.5 consume para generar vídeo con audio. El autor, Mrbizarro, lo publica como parte del ecosistema de la aplicación Phosphene, una app de escritorio para macOS de código abierto orientada a generación de vídeo, imagen, música y voz en local y sin conexión.

El modelo base es un Gemma 4 de 12B (`model_type: gemma4_unified`) afinado por Lightricks específicamente para LTX-2.5. La conversión a MLX y la cuantización a 4 bits con tamaño de grupo 64 reducen el peso a aproximadamente 6,7 GB, lo que permite cargarlo en Macs con memoria unificada moderada. El repositorio contiene un único archivo `safetensors` con los pesos cuantizados, junto con configuración, tokenizer, plantilla de chat y un manifiesto con los hashes SHA-256 de cada archivo.

Su relevancia es práctica: LTX-2.5 no funciona correctamente con el encoder Gemma 3 que usaba LTX-2.3 (carga, pero codifica los prompts de forma incorrecta), por lo que este paquete es el que permite ejecutar el pipeline completo de vídeo en hardware Apple sin depender de la nube. El modelo está publicado bajo la LTX-2.x Community License Agreement, con restricciones de uso comercial para entidades con ingresos anuales iguales o superiores a 10 millones de dólares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4, `model_type: gemma4_unified`), torre de texto para LTX-2.5 |
| Parametros totales | 11.907.350.320 (~11,9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit, tamaño de grupo 64 (MLX) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | LTX-2.x Community License Agreement (`ltx-2.x-community-license-agreement`) |
| Formato de pesos | Safetensors (MLX, un unico archivo `model-00001-of-00001.safetensors`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer Gemma 4 de 12B, en su variante `gemma4_unified`, afinado por Lightricks como torre de texto del pipeline LTX-2.5. El autor del repositorio no ha entrenado ni modificado los pesos: según el `NOTICE.md` citado en la model card, los cambios se limitan a la conversión de formato (layout MLX) y a la cuantización a 4 bits, sin eliminar componentes ni reentrenar. El proceso se realiza con los scripts `scripts/convert_ltx_mlx.py` y `scripts/quantize_ltx.py` del proyecto Phosphene, y el layout resultante es el que carga el runtime MLX `dgrauet/ltx-2-mlx`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas del encoder más allá de su función como extractor de características para difusión. La cuantización a 4 bits con grupo de 64 es la innovación práctica relevante: reduce el peso a ~6,7 GB manteniendo, según el autor, la calidad suficiente para que LTX-2.5 codifique los prompts correctamente, a diferencia del encoder Gemma 3 de la generación anterior.

## Capacidades

- Extracción de características de texto (pipeline `feature-extraction`): convierte prompts en embeddings para el motor de difusión LTX-2.5.
- Codificación de prompts para generación de vídeo texto-a-vídeo e imagen-a-vídeo con audio, en combinación con los paquetes `Mrbizarro/ltx-2.5-mlx-q4` o `Mrbizarro/ltx-2.5-mlx-q8`.
- Ejecución local y offline en Apple Silicon mediante MLX.
- Soporte de tokenizer y plantilla de chat (`chat_template.jinja`) incluidos en el repositorio.
- No es un modelo de chat: no debe usarse para generación de texto, razonamiento, código ni diálogo.
- Sin soporte documentado de tool calling, function calling, agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés.
- Sin capacidades de visión, audio o modo "thinking" propias; el audio del pipeline lo genera el motor de vídeo, no este encoder.

## Casos de uso

- Generación de vídeo local en macOS: el encoder transforma el prompt del usuario en embeddings que LTX-2.5 usa para renderizar clips de 5 segundos con sonido; es el componente que hace posible el pipeline completo sin conexión en un Mac.
- Integración en la app Phosphene: la aplicación descarga y verifica estos archivos automáticamente e instala el encoder junto al motor LTX-2.5, por lo que el usuario final no necesita configurar nada.
- Despliegue con el runtime `dgrauet/ltx-2-mlx`: desarrolladores que quieran usar LTX-2.5 fuera de Phosphene apuntan el runtime al paquete de modelo y a este encoder como torre de texto.
- Investigación sobre cuantización MLX: sirve como referencia de conversión de un encoder de 12B a 4 bits (grupo 64) para pipelines de difusión, con manifiesto de hashes para verificar integridad.
- Prototipado de texto-a-vídeo en hardware de consumo: permite probar prompts y ajustar descripciones en Macs con 16 GB o más de memoria unificada antes de escalar a equipos mayores.
- Pipelines de creación de contenido con restricciones de privacidad: al ejecutarse offline, los prompts no salen del equipo, lo que encaja en flujos con material sensible.
- Evaluación comparativa de encoders: útil para medir el impacto de sustituir el encoder Gemma 3 de LTX-2.3 por el Gemma 4 de LTX-2.5 en la calidad de codificación de prompts.

## Benchmarks y rendimiento

La model card no publica benchmarks de calidad del encoder (MMLU, HumanEval, GSM8K, etc.), ya que no es un modelo de lenguaje evaluable de esa forma. Sí incluye tiempos de render reales de usuarios de Phosphene para un clip de 5 segundos con sonido a calidad "Balanced" en 1024x576 (o 768x448 en equipos de 16-24 GB), con el paquete base 4-bit y este encoder, incluyendo la carga del modelo. Datos recogidos entre el 10 de agosto y el 22 de octubre de 2026 sobre 36.699 renders en 1.106 Macs:

| Mac | Memoria | Resolucion | Tiempo mediano |
|---|---|---|---|
| M5 Max | 64 GB | 1024x576 | 1 min 20 s |
| M3 Ultra | 96 GB | 1024x576 | 1 min 55 s |
| M5 Pro | 48 GB | 1024x576 | 2 min 30 s |
| M4 Max | 64 GB | 1024x576 | 3 min |
| M4 Pro | 48 GB | 1024x576 | 6 min |
| M1 Max | 64 GB | 1024x576 | 5 min 30 s |
| M4 Pro | 24 GB | 768x448 (480p) | 3 min 50 s |
| M5 | 16 GB | 768x448 (480p) | 4 min 55 s |
| M4 | 16 GB | 768x448 (480p) | 10 min 40 s |

No hay datos de latencia o throughput aislados del encoder, ni comparativas con otros encoders en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 6,7 GB en disco; en memoria unificada hay que sumar el peso del encoder más el del modelo de difusión LTX-2.5 (paquete q4 o q8) y los buffers de inferencia.
- Hardware objetivo: Apple Silicon exclusivamente (M1, M2, M3, M4, M5 en variantes base, Pro, Max y Ultra). No hay soporte CUDA documentado.
- Cabe en equipos de consumo: los benchmarks incluyen un M5 de 16 GB y un M4 de 16 GB generando clips a 480p, y un M4 Pro de 24 GB a 480p.
- Configuración recomendada para 1024x576: 48-64 GB de memoria unificada (M5 Pro, M4 Max, M5 Max, M3 Ultra).
- Despliegue: runtime MLX `dgrauet/ltx-2-mlx` o la app Phosphene (instalación directa o vía Pinokio). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este componente.
- Descarga: `hf download Mrbizarro/gemma4-12b-ltx25-q4 --local-dir gemma4-12b-ltx25-q4` tras aceptar la licencia y autenticarse con `hf auth login`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Mrbizarro/gemma4-12b-ltx25-q4` (este) | ~11,9B | No disponible | Encoder de texto para LTX-2.5, 4-bit MLX | LTX-2.x Community License | Hugging Face, MLX |
| Encoder Gemma 3 de LTX-2.3 | No disponible | No disponible | Encoder de texto para LTX-2.3 | LTX-2.x Community License | Hugging Face; no válido para LTX-2.5 según el autor |
| `Mrbizarro/ltx-2.5-mlx-q8` (modelo de difusión, no encoder) | No disponible | No disponible | Motor de vídeo LTX-2.5 en 8 bits | LTX-2.x Community License | Hugging Face, MLX |

No se dispone de datos de rendimiento comparativo entre encoders en la información proporcionada. La comparativa relevante es funcional: este paquete es el encoder correcto para LTX-2.5, mientras que el Gemma 3 de LTX-2.3 carga pero codifica mal los prompts.

## Limitaciones y advertencias

- No es un modelo de chat ni de propósito general: usarlo fuera del pipeline LTX-2.5 produce resultados sin sentido.
- Solo soporta inglés; los prompts en otros idiomas pueden codificarse de forma deficiente.
- Riesgo de alucinación no aplica en el sentido habitual, pero una codificación incorrecta del prompt se traduce en vídeos que no reflejan la descripción.
- Licencia restrictiva: entidades con ingresos anuales iguales o superiores a 10 millones de dólares necesitan una licencia de pago de Lightricks para cualquier uso que no sea no comercial (contacto: ltxv-licensing@lightricks.com).
- Obligación de propagar la licencia LTX-2.x Community License con cualquier redistribución, incluida la política de uso aceptable del Anexo A.
- Dependencia estricta del runtime MLX `dgrauet/ltx-2-mlx` y del layout de archivos de Phosphene; no es portable a otros runtimes sin conversión.
- Exclusivo de Apple Silicon; sin soporte para GPU NVIDIA, AMD o CPU convencional documentado.
- El autor no es Lightricks y no está afiliado a la compañía; el soporte y las garantías dependen del proyecto Phosphene.
- Los tiempos de render publicados son medianas de uso real, no mediciones controladas de laboratorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mrbizarro/gemma4-12b-ltx25-q4
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Codigo de LTX-2: https://github.com/Lightricks/LTX-2
- Licencia LTX-2.x Community License: https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2_x
- Runtime MLX: https://github.com/dgrauet/ltx-2-mlx
- Proyecto Phosphene: https://github.com/mrbizarro/Phosphene
- App Phosphene: https://phosphene.video
- Requisitos por Mac: https://phosphene.video/mac-requirements/
- Benchmarks de Phosphene: https://phosphene.video/benchmarks/
- Paquete de difusion 4-bit: https://huggingface.co/Mrbizarro/ltx-2.5-mlx-q4
- Paquete de difusion 8-bit: https://huggingface.co/Mrbizarro/ltx-2.5-mlx-q8
