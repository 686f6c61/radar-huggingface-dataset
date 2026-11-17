# BoxyFit/Qwen3.8-Flash-Next-Groot-65B-A6B-8V32D

## Resumen

Qwen3.8-Flash-Next-Groot-65B-A6B-8V32D es una cuantización GGUF creada por BoxyFit a partir del modelo Groot-65B-A6B-261023 de GrootTeam, que a su vez deriva de Qwen3.8-Flash-Next. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con 116.514.464.640 parámetros totales (aproximadamente 116,5 mil millones) y unos 6 mil millones de parámetros activos por token, según indica el sufijo A6B del nombre. El objetivo declarado del autor es ofrecer un MoE de clase 65B que pueda ejecutarse en un PC de consumo con 8 GB de VRAM y 32 GB de RAM, algo que, según sus mediciones, los cuantizados populares del modelo base no consiguen.

La innovación principal de este paquete es la distribución de memoria: los expertos enrutados (21,7 GB en IQ2_XXS para gate/up e IQ4_NL para down) permanecen residentes en RAM del sistema, mientras que una tabla de búsqueda n-gram de 28,8 GB se mapea en memoria desde disco y solo se leen filas aleatorias de unos 90 bytes. El autor reporta 27-30 tokens por segundo en una RTX 3070 Ti de 8 GB dentro de una máquina de 32 GB, con un pico de RAM de aproximadamente 29,6 GB.

El modelo es relevante porque demuestra una técnica de empaquetado orientada a hardware de gama media, con un contrato de comportamiento documentado para mitigar el comportamiento de negación y racionalización que el autor atribuye a los pesos podados de Groot. La licencia es qwen-community-1.0, heredada del modelo base Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer; modelo base Groot-65B-A6B derivado de Qwen3.8-Flash-Next |
| Parametros totales | 116.514.464.640 (aprox. 116,5 B) |
| Parametros activos | Aproximadamente 6 B (sufijo A6B del nombre) |
| Longitud de contexto | Hasta 64K en 32 GB RAM + GPU de 8 GB; más de 128K con 48 GB RAM + 16 GB GPU; 128K en CPU-only a 5,3 t/s |
| Tipos de cuantizacion | GGUF con tensores IQ2_XXS (gate/up), IQ4_NL (down) e IQ4_NL para la tabla n-gram; paquete FIQ (8V32D) |
| Idiomas soportados | No disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (llama.cpp, LM Studio, Ollama) |

## Arquitectura y entrenamiento

El modelo es un transformer con arquitectura Mixture of Experts. El sufijo A6B indica aproximadamente 6 mil millones de parámetros activos por token sobre un total de 116,5 mil millones. El modelo base es Groot-65B-A6B-261023 de GrootTeam, descrito por el autor como un modelo con expertos podados ("expert pruned model"), y este a su vez deriva de Qwen3.8-Flash-Next. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica de este paquete es la distribución de memoria descrita en la model card: los expertos enrutados (21,7 GB) residen en RAM del host, mientras que la tabla de búsqueda n-gram de 28,8 GB (IQ4_NL) se mapea en memoria y se lee como filas aleatorias de unos 90 bytes; un conjunto de trabajo de 1 millón de tokens toca solo 337 MB de la tabla, por lo que esta nunca necesita caber entera en memoria. Las proyecciones down se fijan en IQ4_NL porque el ancho por experto de Groot es 640 y los bloques IQ2/IQ3 requieren anchos divisibles por 256. El paquete no incluye cabecera MTP (multi-token prediction); el autor indica que en máquinas con expertos residentes en RAM MTP aporta solo un +1% y consume VRAM, y que para configuraciones con pesos en VRAM (vLLM/Strata) MTP ofrece entre 1,5x y 2x, existiendo una variante `-MTP` bajo petición.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, etiqueta "conversational").
- Razonamiento y respuesta multi-turno, con contexto de hasta 64K tokens en configuraciones de 32 GB RAM.
- Soporte de tool calling y function calling, reforzado por el contrato de comportamiento que instruye al modelo a invocar herramientas de búsqueda cuando no está seguro de un dato.
- Capacidad de agentes y razonamiento multi-paso, según se deduce del soporte de tool calling y del contrato de comportamiento.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- Capacidades especiales: no se documentan modos de pensamiento, visión ni audio.

## Casos de uso

- Asistente conversacional local en PC de consumo: el modelo puede mantener conversaciones multi-turno con hasta 64K tokens de contexto en una máquina de 32 GB RAM y GPU de 8 GB, a 27-30 t/s, lo que lo hace adecuado para uso interactivo en escritorio.
- Despliegue en estaciones de trabajo sin GPU de gama alta: con 48 GB RAM y 16 GB de VRAM se obtiene contexto superior a 128K, útil para procesar documentos largos o historiales extensos.
- Procesamiento por lotes en CPU: a 5,3 t/s con 128K de contexto en CPU-only, es viable para tareas de extracción o resumen no interactivas donde la latencia no es crítica.
- Integración en LM Studio u Ollama: al ser GGUF compatible con llama.cpp, se carga directamente en estos frontends, lo que facilita prototipado rápido y evaluación por desarrolladores.
- Evaluación de técnicas de cuantización MoE: investigadores pueden usar este paquete para estudiar el impacto de la distribución de expertos en RAM frente a VRAM y comparar con los cuantizados de unsloth o ISTA-DASLab.
- Agentes con tool calling en entornos con recursos limitados: el contrato de comportamiento incluido convierte negaciones confiadas en respuestas prudentes e invocaciones de herramientas, lo que reduce el riesgo de alucinación sobre nombres de productos o datos actuales.
- Chat de atención al cliente en hardware modesto: con el contrato de sistema pegado en el Modelfile de Ollama o en el campo de system prompt de LM Studio, el modelo puede gestionar consultas con contexto largo sin requerir servidores de gama alta.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perplejidad wikitext-2 test (n_ctx 2048, 145 chunks) | 8,436 ± 0,059 (FIQ) |
| Perplejidad wikitext-2 test, referencia GyroM (TQ2_T) | 8,411 ± 0,058 |
| Perplejidad wikitext-2 test, profesor Q8_0 | 7,414 ± 0,051 |
| Throughput en RTX 3070 Ti (8 GB) + 32 GB RAM | 27-30 t/s |
| Throughput CPU-only, contexto 128K | 5,3 t/s |
| Pico de RAM en RTX 3070 Ti + 32 GB | ~29,6 GB |
| Aceleración frente a GyroM en llama.cpp | +41% |
| Aceleración de GyroM frente a FIQ en Strata | +18% en decodificación |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 8 GB de VRAM son suficientes para el paquete 8V32D, ya que los expertos residen en RAM y solo la GPU gestiona las capas no mapeadas.
- RAM del sistema: 32 GB para contexto de hasta 64K (pico ~29,6 GB); 48 GB para contexto superior a 128K con GPU de 16 GB.
- GPU recomendadas: RTX 3070 Ti (8 GB) es la configuración medida por el autor; cualquier GPU de 8 GB sirve para la configuración base. Para más de 128K de contexto se recomienda una GPU de 16 GB.
- ¿Cabe en GPU de consumo? Sí, en GPUs de 8 GB como la RTX 3070 Ti, siempre que el sistema tenga 32 GB de RAM.
- Opciones de despliegue: llama.cpp (con `-ot per_layer_token_embd=CPU` si la RAM es ajustada), Ollama (Modelfile con `FROM` y el contrato como `SYSTEM:`), LM Studio (carga directa y contrato en el campo de system prompt).
- Latencia y throughput: 27-30 t/s en RTX 3070 Ti + 32 GB RAM; 5,3 t/s en CPU-only con 128K de contexto.

## Comparativa con modelos similares

| Modelo | Tamano en disco | RAM/VRAM necesaria | Rendimiento en 32 GB RAM + 8 GB GPU | Licencia |
|---|---|---|---|---|
| Groot-65B-A6B 8V32D-FIQ (este paquete) | 55,8 GB | ~29,6 GB RAM pico, 8 GB VRAM | Sí, 27-30 t/s | qwen-community-1.0 |
| unsloth UD-Q4_K_XL (Flash-Next) | 111,3 GB | ~64 GB | No | qwen-community-1.0 |
| unsloth UD-Q2_K_XL (Flash-Next) | 79,6 GB | ~64 GB | No | qwen-community-1.0 |
| ISTA-DASLab GSQ-RCO IQ2_XS (Flash-Next) | 68,0 GB | ~48-64 GB | No | qwen-community-1.0 |
| unsloth UD-IQ1_S (Flash-Next) | 66,4 GB | ~48 GB | No | qwen-community-1.0 |

Según el autor, la diferencia clave es la forma de memoria: los expertos enrutados de Flash-Next ocupan más de 40 GB incluso a 1 bit, mientras que el pool completo de expertos de Groot es de 14,9 GiB y cabe en RAM convencional. Un benchmark independiente de tres motores citado por el autor midió Flash-Next fijando 45-48 GiB en una máquina de 64 GB.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: el autor documenta un comportamiento de negación y racionalización ("deny-and-rationalize") que atribuye a los pesos podados de Groot, no a la cuantización; el contrato de comportamiento incluido es una mitigación intermedia, no una solución definitiva.
- Limitaciones de contexto: el contexto máximo práctico depende de la RAM; 64K en 32 GB, más de 128K solo con 48 GB de RAM y GPU de 16 GB.
- Limitaciones de idioma: no se especifican idiomas soportados.
- Restricciones de licencia: licencia qwen-community-1.0, que puede imponer condiciones para uso comercial; debe revisarse el enlace de licencia de Qwen antes de desplegar en producción.
- Caveats para producción: el modelo requiere pegar manualmente el contrato de comportamiento en el system prompt (GGUF no tiene campo de system prompt); sin él, el modelo puede negar la existencia de productos reales. No incluye cabecera MTP en este paquete. La calidad se declara igual al paquete TQ2_T solo por perplejidad en wikitext-2, con pruebas de deriva por dominio aún en curso.

## Enlaces

- Hugging Face: https://huggingface.co/BoxyFit/Qwen3.8-Flash-Next-Groot-65B-A6B-8V32D
- Modelo base Groot: https://huggingface.co/GrootTeam/Groot-65B-A6B-261023
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Paquete TQ2_T de referencia (GyroM): https://huggingface.co/BoxyFit/Groot-65B-A6B-GyroM
