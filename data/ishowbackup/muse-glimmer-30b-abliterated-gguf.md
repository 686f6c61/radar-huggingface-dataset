# Ishowbackup/Muse-Glimmer-30B-Abliterated-GGUF

## Resumen

Muse Glimmer es un modelo de lenguaje multimodal de 30 000 millones de parámetros desarrollado por Meta Superintelligence Labs, diseñado específicamente para agentes locales y ejecución en dispositivos de consumo. Esta versión concreta, publicada por Ishowbackup, es una cuantización GGUF del modelo abliterado por Blackfrost AI, que elimina los comportamientos de rechazo mediante una modificación de pesos. El resultado es un modelo que puede ejecutarse completamente en local con una sola GPU o CPU, manteniendo las capacidades multimodales, agénticas y de razonamiento del original.

La relevancia de este lanzamiento radica en su combinación de tamaño compacto, contexto largo de 131 072 tokens, soporte de visión y decodificación especulativa DFlash, todo ello bajo licencia Apache 2.0. La cuantización en GGUF permite su uso con llama.cpp, lo que facilita el despliegue en hardware de consumo sin depender de servicios en la nube. El modelo base es `meta-models/Muse-Glimmer-30B`, transformado mediante un proceso de abliteración que reduce los rechazos a cero en el benchmark R1-HARMFUL-BENCH-450.

La arquitectura es densa, con 52 capas, hidden size de 6656, atención con GQA (32 q / 2 kv) y sliding-window attention, más una torre de visión para entrada de imágenes. El paquete incluye una escalera completa de cuantizaciones desde Q2_K hasta Q8_0, junto con proyectores de visión y un drafter DFlash para acelerar la inferencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | muse-glimmer — densa, 52 capas, hidden 6656, GQA (32 q / 2 kv), sliding-window attention, + vision tower |
| Parametros totales | 27 854 794 240 (~27,85 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 131 072 |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base BF16) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura transformer densa con atención por ventana deslizante (sliding-window attention) y GQA con 32 cabezas de consulta y 2 de clave/valor. Incluye una torre de visión que permite procesar imágenes junto con texto, lo que lo convierte en un modelo multimodal. El entrenamiento original fue realizado por Meta, aunque no se proporcionan detalles específicos sobre el número de tokens ni la composición del dataset. La versión abliterada aplica una modificación de pesos desarrollada por Blackfrost AI que elimina los comportamientos de rechazo sin afectar a las capacidades generales del modelo.

La cuantización GGUF se ha realizado para cubrir toda la gama de tamaños, desde Q2_K (10 GB) hasta Q8_0 (27,6 GB). Además, se incluye un drafter DFlash en formato Q4_K_M (1,63 GB) para decodificación especulativa, que acelera la inferencia aproximadamente 1,6 veces manteniendo la misma salida. El modelo incorpora una plantilla de sistema por defecto con la persona de "asistente de IA" y soporta el parámetro `Reasoning strength` para ajustar la profundidad del razonamiento.

## Capacidades

- Generación de texto y razonamiento multi-paso con control de profundidad mediante `Reasoning strength` (low, medium, high, xhigh).
- Entrada multimodal de imágenes mediante el proyector `mmproj`, lo que permite tareas de visión y lenguaje.
- Soporte de tool calling y function calling, orientado a agentes autónomos.
- Capacidad de ejecución de tareas largas con recuperación de fallos, según las especificaciones de Meta.
- Decodificación especulativa DFlash para acelerar la inferencia sin pérdida de calidad.
- Contexto largo de 131 072 tokens, adecuado para conversaciones multi-turno y documentos extensos.
- Ejecución completamente local y offline con llama.cpp, tanto en GPU como en CPU.

## Casos de uso

- Asistentes personales locales: el modelo puede gestionar conversaciones multi-turno con memoria de hasta 128K tokens, ideal para un asistente que recuerde el historial completo del usuario sin depender de la nube.
- Agentes autónomos con tool calling: gracias a su soporte nativo de function calling, puede integrarse en pipelines que invoquen APIs, bases de datos o ejecuten comandos, por ejemplo en un asistente de desarrollo que gestione repositorios y ejecute pruebas.
- Análisis de documentos con imágenes: al ser multimodal, puede procesar capturas de pantalla, diagramas o fotografías junto con texto, útil para extraer información de facturas, informes o manuales técnicos.
- Atención al cliente automatizada: con contexto largo y razonamiento controlable, puede mantener conversaciones coherentes y escalar el nivel de detalle según la complejidad de la consulta, todo en local para cumplir requisitos de privacidad.
- Generación de código asistida: su capacidad de razonamiento y tool calling permite sugerir implementaciones, revisar código y ejecutar pruebas unitarias en entornos de desarrollo locales.
- Investigación y análisis de datos: el modelo puede resumir artículos científicos, extraer conclusiones de datasets textuales y generar informes, aprovechando su ventana de contexto para procesar documentos completos.
- Prototipado de aplicaciones multimodales: desarrolladores que necesiten un modelo local con visión para aplicaciones de accesibilidad, reconocimiento de objetos o descripción de imágenes sin enviar datos a servidores externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de evaluación proporcionado es el benchmark de rechazo R1-HARMFUL-BENCH-450, que muestra un 0 % de rechazos verdaderos sobre 450 prompts, lo que confirma la efectividad del proceso de abliteración:

| Métrica | Resultado |
|---|---|
| Rechazo verdadero (dañino, n=300) | 0 / 300 = 0,0 % |
| Rechazo verdadero (total 450) | 0 / 450 = 0,0 % |
| Substring dañino | 0 / 300 |
| Substring total | 2 / 450 (falsos positivos de XSTest) |
| Errores | 0 |

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~10 GB, Q3_K_S ~11,7 GB, Q3_K_M ~12,7 GB, Q4_K_S ~15 GB, Q4_K_M ~15,8 GB, Q5_K_S ~18 GB, Q5_K_M ~18,5 GB, Q6_K ~21,3 GB, Q8_0 ~27,6 GB.
- GPU recomendadas: para Q4_K_M cabe en una RTX 3090/4090 de 24 GB; para Q4_K_S en GPUs de 16 GB como RTX 4080 o RTX 3080 Ti; las cuantizaciones más altas requieren GPUs profesionales como A100 o H100.
- Puede ejecutarse en CPU con llama.cpp, aunque con menor rendimiento; el drafter DFlash solo funciona con `llama-server`, no con `llama-cli`.
- Opciones de despliegue: llama.cpp (versión b10353 o superior), incluyendo `llama-server` con soporte de DFlash y multimodality. También es compatible con endpoints OpenAI-style gracias a la plantilla Jinja.
- Latencia y throughput: no se proporcionan cifras concretas, pero la decodificación especulativa DFlash ofrece aproximadamente 1,6 veces más velocidad en comparación con la inferencia sin drafter.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la información proporcionada. El modelo comparte características con otros modelos abiertos de ~30B como Llama 3 30B o Mistral 30B, pero no hay benchmarks públicos que permitan una comparación objetiva. Se recomienda consultar los resultados de la comunidad en los foros de Hugging Face para obtener referencias empíricas.

## Limitaciones y advertencias

- Al ser un modelo abliterated, se eliminan los rechazos de contenido dañino, lo que implica que puede generar respuestas inapropiadas o peligrosas si se le solicita. Es responsabilidad del desarrollador implementar salvaguardas adicionales.
- La cuantización GGUF puede introducir degradación de calidad en tareas de precisión, especialmente en cuantizaciones bajas como Q2_K o Q3_K.
- El modelo es experimental (etiquetado como "EXPERIMENTAL" por el autor), por lo que pueden existir errores de decodificación, incoherencias o fallos de parseo de herramientas bajo cargas altas.
- No se especifican los idiomas soportados; aunque probablemente sea multilingüe como otros modelos de Meta, no hay confirmación oficial en la documentación.
- El uso comercial está permitido bajo Apache 2.0, pero se recomienda revisar los términos del modelo base de Meta para asegurar el cumplimiento.
- La decodificación especulativa DFlash solo funciona con `llama-server`, lo que limita su uso en entornos que requieran `llama-cli`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Ishowbackup/Muse-Glimmer-30B-Abliterated-GGUF
- Modelo base abliterado: https://huggingface.co/Blackfrost-AI/Muse-Glimmer-30B-Abliterated-BF16
- Modelo original de Meta: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Página oficial de Meta: https://developer.meta.com/ai/models/muse-glimmer/
- Documentación de API de Meta: https://dev.meta.ai/docs/muse-glimmer/get-the-model
- Guía y laboratorio de agentes (GitHub): https://github.com/cobusgreyling/Muse-Glimmer
