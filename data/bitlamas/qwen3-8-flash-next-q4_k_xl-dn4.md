# bitlamas/Qwen3.8-Flash-Next-Q4_K_XL-DN4

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje de gran escala desarrollado por el equipo Qwen (Alibaba). Esta ficha documenta la cuantización GGUF publicada por el usuario bitlamas bajo el identificador `bitlamas/Qwen3.8-Flash-Next-Q4_K_XL-DN4`, una versión optimizada específicamente para ejecutarse íntegramente en GPU en equipos AMD Strix Halo (Ryzen AI MAX+ 395 con Radeon 8060S) de 128 GB bajo Windows mediante Vulkan y memoria unificada.

La cuantización parte del archivo UD-Q4_K_XL de unsloth (111,3 GB) y aplica una única modificación: las 48 proyecciones descendentes de expertos (`ffn_down_exps`) pasan de Q5_1 a IQ4_NL, reduciendo el tamaño a 102,5 GB. El objetivo es que el transformer completo quepa en los aproximadamente 80 GiB que un proceso puede reservar en la GPU con asignación dinámica de memoria compartida, manteniendo 262.144 tokens de contexto.

El modelo base cuenta con 176.943.899.520 parámetros según los pesos en safetensors, lo que lo sitúa en la categoría de modelos densos de gran tamaño con arquitectura de atención híbrida (atención estándar más atención lineal y hyper-connections, según los tags y la model card). La relevancia actual radica en demostrar que es posible servir un modelo de esta magnitud con contexto largo en hardware de consumo de gama alta, sin recurrir a múltiples GPU ni a servidores dedicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (atención estándar + atención lineal + hyper-connections), según tags del repo |
| Parametros totales | 176.943.899.520 (dato de safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE en la información disponible; la referencia a "expertos" en las proyecciones sugiere componente MoE, pero no se confirma) |
| Longitud de contexto | 262.144 tokens (configurado en el comando de ejemplo) |
| Tipos de cuantizacion | GGUF Q4_K_XL-IQ4NL (mezcla Q8_0 / Q4_K / Q4_K / IQ4_NL); tabla de n-gramas en IQ4_NL |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (licencia "other" en Hugging Face) |
| Formato de pesos | GGUF (4 shards), más cabeza MTP separada en GGUF |
| Tamano del repo | 204,9 GB |
| Tamano del archivo cuantizado | 102,5 GB (Q4_K_XL-IQ4NL) |
| Tabla de n-gramas | 28,8 GB (IQ4_NL), en RAM del sistema |
| Cabeza MTP (draft) | 2,79 GB (no compartida) o 1,91 GB (compartida, solo builds de unsloth) |
| Libreria | llama.cpp |

## Arquitectura y entrenamiento

La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens ni si hubo fases de RLHF o DPO. Lo que sí se documenta con precisión es la arquitectura de cuantización: el modelo base presenta atención estándar combinada con atención lineal y hyper-connections, además de un experto compartido y proyecciones de expertos (`ffn_down_exps`, `gate`, `up`). La presencia de una tabla de n-gramas de 28,8 GB tratada por llama.cpp como lookup de capa de entrada sugiere un componente de memoria asociativa o n-gramas integrado en el modelo, poco habitual en transformers convencionales.

La innovación técnica principal de esta publicación es la decisión de cuantizar únicamente las proyecciones descendentes de expertos a IQ4_NL. El razonamiento es concreto: `ffn_down_exps` tiene 640 valores de ancho, que no es múltiplo de 256, por lo que ningún cuantizador K o I de bloque 256 puede aplicarse. Las opciones de bloque 32 son Q5_1 e IQ4_NL, y esta última ahorra 8,9 GB. El autor reporta que la perplejidad resultante (2,9092 ± 0,0362 en wikitext-2) es estadísticamente equivalente a la referencia UD-Q4_K_XL (2,9167 ± 0,0365), con una divergencia KL de 0,0304 y un 94,40 % de coincidencia en el token más probable. El error cuadrático ponderado por imatrix de las 48 proyecciones descendentes frente a los originales BF16 es de 0,00490.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline declarado `text-generation` y tag `conversational`.
- Contexto largo: soporta hasta 262.144 tokens en la configuración documentada, adecuado para documentos extensos y conversaciones prolongadas.
- Decodificación especulativa mediante cabeza MTP (Multi-Token Prediction) exportada por unsloth, con `--spec-type draft-mtp`, que aporta aproximadamente un 50 % de velocidad en texto nuevo.
- Borrador n-grama (`ngram-mod`) que añade aproximadamente un 13 % de velocidad en tareas de edición.
- Soporte de visión mediante el proyector `mmproj` de unsloth, ejecutable en CPU con `--no-mmproj-offload`.
- Compatibilidad con plantillas Jinja (`--jinja`), lo que habilita tool calling y function calling en el servidor llama.cpp.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que facilita su integración en infraestructuras de inferencia existentes.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de razonamiento o "thinking": no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional de contexto largo en estación de trabajo local: con 262.144 tokens de ventana, el modelo puede mantener conversaciones sobre repositorios completos o documentación extensa sin truncar, ejecutándose íntegramente en la GPU de un equipo Strix Halo de 128 GB.
- Análisis de documentación técnica y legal: la ventana de contexto permite ingerir contratos, especificaciones o manuales completos y formular preguntas cruzadas entre secciones, con la ventaja de que los datos no salen del equipo.
- Generación y revisión de código en local: la compatibilidad con `--jinja` y el formato de chat permiten integrarlo en editores o pipelines mediante la API compatible con OpenAI de `llama-server`, sin depender de servicios en la nube.
- Procesamiento por lotes de textos largos: la decodificación especulativa con MTP (28,4 tok/s por debajo de 25k de contexto, 20,1 tok/s entre 25k y 50k, 17,0 tok/s entre 50k y 100k) hace viable el resumen y la extracción de información en corpus de tamaño medio en hardware de sobremesa.
- Evaluación e investigación de cuantizaciones: el repositorio incluye logs crudos de perplejidad, KLD y error de proyecciones, lo que lo convierte en una referencia útil para estudiar el impacto de IQ4_NL frente a Q5_1 en modelos grandes.
- Prototipado de agentes con herramientas: la combinación de contexto largo, tool calling vía plantilla Jinja y servidor local permite construir agentes multi-paso que consultan APIs o bases de datos sin coste por token.
- Transcripción y razonamiento sobre imágenes: con el proyector `mmproj` de unsloth, se pueden procesar capturas, diagramas o documentos escaneados junto con texto largo en la misma sesión.

## Benchmarks y rendimiento

Los datos publicados por el autor se centran en métricas de calidad de cuantización y velocidad de inferencia, no en benchmarks estándar de capacidad (MMLU, HumanEval, GSM8K). No se han publicado resultados de benchmarks de capacidad en la información disponible.

| Metrica | UD-Q4_K_XL (referencia) | Q4_K_XL-IQ4NL (este repo) | UD-IQ4_XS |
|---|---|---|---|
| Tamano | 111,3 GB | 102,5 GB | 93,7 GB |
| Mezcla (other / gate / up / down) | Q8_0 / Q4_K / Q4_K / Q5_1 | Q8_0 / Q4_K / Q4_K / IQ4_NL | no disponible |
| Perplejidad (wikitext-2) | 2,9167 ± 0,0365 | 2,9092 ± 0,0362 | 2,998 ± 0,038 |
| KLD vs UD-Q4_K_XL | — | 0,0304 | 0,089 |
| Coincidencia de token superior | — | 94,40 % | 90,75 % |
| Error de proyecciones down vs BF16 | — | 0,00490 | no disponible |

| Metrica de velocidad (b11160-mix, int8 coopmat off) | Valor |
|---|---|
| Decodificación mediana, contexto < 25k | 28,4 tok/s |
| Decodificación mediana, contexto 25k–50k | 20,1 tok/s |
| Decodificación mediana, contexto 50k–100k | 17,0 tok/s |
| Aceleración con MTP draft | ~50 % en texto nuevo |
| Aceleración con borrador n-grama | ~13 % en ediciones |

## Requisitos de hardware

- VRAM estimada: 78,3–78,6 GiB en GPU con el comando documentado en mainline `b11681`; 78,2 GiB en `b11160-mix` con la cabeza compartida. Requiere asignación dinámica de memoria con el slider de memoria compartida al máximo de 124 GB en Windows.
- GPU recomendada: AMD Radeon 8060S integrada en Ryzen AI MAX+ 395 (Strix Halo) con 128 GB de memoria unificada. Es el hardware objetivo explícito del autor.
- No cabe en GPU de consumo convencionales (RTX 4090 de 24 GB, RTX 5090 de 32 GB) sin volcar capas a CPU o paginar, lo que degradaría gravemente el rendimiento.
- Despliegue: llama.cpp (`llama-server`), con soporte de Vulkan en Windows. El autor cita mainline `b11681` y `b11160-mix`; la cabeza MTP compartida solo funciona en builds de unsloth.
- Memoria del sistema: la tabla de n-gramas de 28,8 GB permanece en RAM del sistema y se transmite desde el archivo con `-lm mmap --lazy-mode on`; `mlock` no puede fijar una región de ese tamaño en Windows.
- Ajuste fino de memoria: si el arranque falla, `-ub 256` libera aproximadamente 2,2 GiB.
- Latencia y throughput: decodificación mediana de 28,4 / 20,1 / 17,0 tok/s según tramos de contexto (ver tabla anterior).
- Nota sobre calidad de prompt: los builds posteriores a `b11160` leen el prompt mediante una matmul int8 en esta GPU (PR #27952), lo que eleva el KLD de 0,030 a 0,038; la generación no se ve afectada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano GGUF | Perplejidad (wikitext-2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Q4_K_XL-IQ4NL (este repo) | 176,9 B (base) | 262.144 | 102,5 GB | 2,9092 ± 0,0362 | qwen-community-1.0 | Hugging Face (bitlamas) |
| UD-Q4_K_XL (unsloth) | 176,9 B (base) | 262.144 (configurable) | 111,3 GB | 2,9167 ± 0,0365 | qwen-community-1.0 | Hugging Face (unsloth) |
| UD-IQ4_XS (unsloth) | 176,9 B (base) | 262.144 (configurable) | 93,7 GB | 2,998 ± 0,038 | qwen-community-1.0 | Hugging Face (unsloth) |

La comparativa se limita a las cuantizaciones del mismo modelo base documentadas en la información disponible. No se dispone de datos sobre modelos alternativos de otros desarrolladores con los que comparar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- El repositorio está diseñado para un hardware muy concreto (Strix Halo de 128 GB, Windows, Vulkan). En otras configuraciones el rendimiento o la viabilidad de carga pueden diferir sustancialmente.
- La cabeza MTP compartida (1,91 GB) solo funciona en builds de unsloth; en mainline falla con `tensor 'token_embd.weight' not found`. Hay que usar la cabeza no compartida (2,79 GB).
- El rendimiento en lectura de prompt se ve degradado por la matmul int8 de los builds recientes en esta GPU, sin interruptor para desactivarla; afecta al KLD pero no a la generación.
- La tabla de n-gramas de 28,8 GB debe residir en RAM del sistema; en modo de reserva fija de 96 GB compite con Windows y provoca paginación que degrada todo el escritorio.
- La licencia qwen-community-1.0 es una licencia comunitaria con condiciones específicas; es necesario revisar el archivo LICENSE antes de cualquier uso comercial.
- No se dispone de información sobre sesgos, tasas de alucinación ni cobertura idiomática del modelo base en la documentación proporcionada.
- Los benchmarks publicados miden calidad de cuantización y velocidad, no capacidades cognitivas del modelo; no hay datos de MMLU, HumanEval ni GSM8K.
- El tamaño del repo (204,9 GB) y la descarga parcial por patrón (`--include "Q4_K_XL-IQ4NL/*"`) requieren planificación de almacenamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bitlamas/Qwen3.8-Flash-Next-Q4_K_XL-DN4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cuantizaciones de referencia de unsloth: no disponible (URL no incluida en la información proporcionada)
- Logs crudos de mediciones: carpeta `logs/` dentro del repositorio
- PR de llama.cpp con soporte MTP draft (`--spec-type draft-mtp`): PR #29761 (2026-10-01)
- PR de llama.cpp sobre matmul int8 en GPU AMD: PR #27952
- Paper, blog o demo oficial: no disponible en la información proporcionada
