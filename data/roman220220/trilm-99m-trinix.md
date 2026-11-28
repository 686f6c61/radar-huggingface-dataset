# roman220220/trilm-99m-trinix

## Resumen

TriLM 99M para trinix es una conversión del modelo de lenguaje TriLM 99M del proyecto Spectra Suite, empaquetado en el formato de "trytes" ternarios balanceados (9 trits por tryte, 27 trits por palabra de máquina) que utiliza trinix, un sistema operativo tipo Unix para un ordenador ternario balanceado emulado. El modelo no está pensado para ejecutarse con PyTorch, MLX ni llama.cpp: es un artefacto específico para el ecosistema trinix, donde se ejecuta con aritmética entera exclusivamente y sin operaciones en coma flotante.

La conversión, publicada por el usuario roman220220 (con avisos legales de IPSupport LLC en la model card), mantiene los pesos ternarios de las capas lineales tal cual y redondea a enteros ternarios pequeños los embeddings, la capa de salida y las normas, además de añadir tablas de exponencial y rotatorias. El resultado es un fichero único de 145.682.889 bytes (44.288.517 trytes) que incluye el tokenizador en formato TLM1.

Su relevancia es fundamentalmente experimental y de investigación: ilustra cómo un transformer de 99M de parámetros puede reducirse a un formato puramente entero y ternario para hardware no convencional. No es un modelo para producción convencional, y su utilidad práctica fuera del entorno trinix es nula.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (TriLM, pesos ternarios en capas lineales); formato de empaquetado balanced-ternary tryte |
| Parámetros totales | 99M (según el nombre del modelo base; no se detalla el desglose) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Ternaria balanceada (trits: -1, 0, +1); empaquetado de 27 trits por palabra; embeddings, LM head y normas redondeados a enteros ternarios pequeños |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.tlm.tb` (vista de bytes del fichero TLM1 con tokenizador); no compatible con safetensors, GGUF ni PyTorch |

## Arquitectura y entrenamiento

El modelo base es SpectraSuite/TriLM_99M_Unpacked, un transformer de aproximadamente 99M de parámetros con pesos ternarios en las capas lineales. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

La conversión a trinix no reentrena el modelo: repaqueta los pesos ternarios de las capas lineales en palabras de 27 trits, redondea embeddings, capa de salida y normas a enteros ternarios pequeños, y añade tablas de exponencial y rotatorias para permitir la inferencia con aritmética entera pura. Según la model card, esto provoca que las salidas difieran ligeramente de las del checkpoint original. El fichero se almacena como una secuencia de trytes codificados en UTF-8 (cada tryte de 9 trits como su punto de código, y un tryte negativo −v como la codificación de 4 bytes de U+10000+v), y la herramienta `wget --tbytes` de trinix lo decodifica de vuelta a trytes.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base TriLM 99M.
- Inferencia con aritmética entera exclusiva en el entorno trinix (sin coma flotante).
- Tokenizador incluido en el propio fichero TLM1.
- Descarga automática del modelo desde el propio programa TriLM si el fichero no está presente.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en computación ternaria: ejecutar un transformer real sobre un ordenador ternario balanceado emulado para estudiar el comportamiento de la aritmética entera en inferencia.
- Docencia y divulgación: demostrar de forma tangible cómo se empaquetan pesos ternarios (27 trits por palabra) y cómo se codifican trytes en UTF-8 para su transporte.
- Desarrollo de herramientas del ecosistema trinix: servir como modelo de referencia para probar `wget --tbytes`, el programa TriLM y el formato TLM1.
- Experimentos de cuantización extrema: comparar las salidas del modelo convertido con las del checkpoint original para medir el impacto del redondeo de embeddings, LM head y normas a enteros ternarios.
- Pruebas de reproducibilidad: verificar la integridad del fichero mediante el SHA-256 publicado (`fab0ab61...cf7a38`) en pipelines de descarga y validación.
- Investigación sobre formatos de serialización: estudiar la viabilidad del empaquetado de 9 trits por tryte y su codificación UTF-8 como alternativa a formatos binarios convencionales.
- No es adecuado para atención al cliente, generación de código en producción, RAG ni ningún despliegue estándar con vLLM, TGI, Ollama o llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido convencional; el modelo se ejecuta en un ordenador ternario balanceado emulado dentro de trinix, no en GPU con CUDA.
- GPU recomendadas: no disponible; el formato no es compatible con PyTorch, MLX ni llama.cpp, por lo que no se ejecuta en A100, H100 ni RTX 4090 mediante stacks estándar.
- GPU de consumo: no aplica.
- Opciones de despliegue: exclusivamente el programa TriLM dentro del sistema operativo trinix; descarga mediante `wget --tbytes`.
- Latencia y throughput: no disponibles; dependen por completo del emulador ternario subyacente.
- Tamaño en disco: 145.682.889 bytes (aproximadamente 139 MiB) para el fichero `trilm99m.tlm.tb`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Ejecutable en stacks estándar |
|---|---|---|---|---|---|
| roman220220/trilm-99m-trinix | 99M | no disponible | `.tlm.tb` (ternario balanceado) | Apache 2.0 | No |
| SpectraSuite/TriLM_99M_Unpacked (base) | 99M | no disponible | no disponible | Apache 2.0 (según la conversión) | No disponible en la información |
| Modelos transformer densos de ~100M en FP16/INT8 | ~100M | variable | safetensors, GGUF | variable | Sí |

La comparación con alternativas convencionales de tamaño similar no puede completarse con datos de rendimiento porque no se han publicado benchmarks de este modelo ni del base en la información disponible.

## Limitaciones y advertencias

- El fichero no es utilizable con PyTorch, MLX ni llama.cpp; requiere el ecosistema trinix y su emulador ternario.
- Las salidas difieren ligeramente de las del checkpoint original debido al redondeo de embeddings, LM head y normas a enteros ternarios.
- Un modelo de 99M de parámetros tiene una capacidad limitada de razonamiento, conocimiento factual y coherencia en contextos largos; se espera una tasa elevada de alucinación en tareas abiertas.
- No se documentan idiomas soportados ni sesgos conocidos; se desconoce la composición del dataset de entrenamiento del modelo base.
- La model card incluye un descargo de responsabilidad de IPSupport LLC que declara el modelo "as is", sin garantías, y exime de responsabilidad por daños derivados de su uso.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe cumplir también los términos del modelo base y evaluar por su cuenta el modelo y sus salidas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria del artefacto.
- No hay información sobre latencia, throughput ni requisitos de memoria del emulador, lo que impide estimar su viabilidad en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/roman220220/trilm-99m-trinix
- Modelo base: https://huggingface.co/SpectraSuite/TriLM_99M_Unpacked
- Organización Spectra Suite: https://huggingface.co/SpectraSuite
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
