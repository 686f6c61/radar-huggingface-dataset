# kingjones777/Mellum2-12B-A2.5B-Instruct-ROCmFP4-GGUF

## Resumen

Mellum2-12B-A2.5B-Instruct es un modelo de lenguaje de código abierto desarrollado por JetBrains, especializado en ingeniería de software. Se trata de un modelo MoE (Mixture of Experts) con 12.15 mil millones de parámetros totales, de los cuales solo 2.5 mil millones se activan por token. La versión aquí descrita es una cuantización ROCmFP4 de 4 bits, creada por kingjones777, diseñada específicamente para GPUs AMD con arquitectura gfx1151 (Ryzen AI MAX+ 395 / Strix Halo). El modelo base tiene una ventana de contexto de 131.072 tokens y está licenciado bajo Apache-2.0.

Esta cuantización destaca por su tamaño reducido (6.49 GiB) y su velocidad de decodificación de 96.92 tokens por segundo en el hardware objetivo, un 7.2% más rápida que la cuantización Q4_K_M estándar y 1.12 GiB más pequeña. Sin embargo, requiere un parche específico de llama.cpp (ROCmFPX) que implementa la arquitectura Mellum y los nuevos tipos de cuantización ROCmFP4, ya que ni la arquitectura ni estos formatos están integrados en el llama.cpp principal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mellum (MoE, transformer con atención deslizante) |
| Parámetros totales | 12.149.923.072 (12.15B) |
| Parámetros activos | 2.5B (8 de 64 expertos activos) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantización | Q4_0_ROCMFP4_COHERENT (ftype 102), con LM head y token embeddings en Q6_K |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero único de 6.4907 GiB) |

## Arquitectura y entrenamiento

El modelo base Mellum2-12B-A2.5B-Instruct es un transformer MoE con 28 capas, dimensión oculta de 2304 y vocabulario de 98.304 tokens. Cuenta con 64 expertos de los cuales 8 se activan por token (top-8), con un tamaño intermedio de MoE de 896. La arquitectura alterna atención deslizante (sliding attention) con atención completa en un intervalo de 4 capas (3 deslizantes, 1 completa), con n_swa = 1024. No tiene expertos compartidos ni estado SSM/conv. El modelo no usa atado de embeddings (tie_word_embeddings = false).

La cuantización ROCmFP4 se generó a partir de un GGUF BF16 (22.64 GiB) sin requantización, es decir, la conversión se hizo directamente desde los pesos en BF16. El tipo Q4_0_ROCMFP4_COHERENT es un formato de cuantización de 4 bits específico de ROCmFPX que aprovecha las capacidades de los aceleradores AMD gfx1151. El router (ffn_gate_inp) y las normas se mantienen en F32, mientras que los expertos y las proyecciones de atención están en 4 bits.

## Capacidades

- Generación de texto y código: especializado en ingeniería de software, incluye generación y edición de código, depuración y razonamiento sobre programas.
- Razonamiento multi-paso: soporta cadenas de pensamiento y razonamiento lógico complejo.
- Tool calling y function calling: capacidad para invocar herramientas y funciones externas.
- Codificación agéntica: puede actuar como agente en flujos de trabajo de programación asistida.
- Asistencia conversacional: diseñado para diálogo interactivo de programación.
- Solo inglés: la model card indica únicamente el idioma inglés.

## Casos de uso

- Autocompletado de código en IDE: gracias a su especialización en código y su baja latencia (96.92 tok/s en hardware AMD), puede integrarse en editores para sugerencias en tiempo real.
- Asistente de programación conversacional: puede mantener diálogos multi-turno sobre código, explicar fragmentos, sugerir refactorizaciones y depurar errores.
- Generación de código en pipelines CI/CD: soporta tool calling, lo que permite integrarlo en flujos automatizados de generación y revisión de código.
- Agente de codificación autónomo: puede ejecutar tareas de programación de forma autónoma, como crear funciones, tests o documentación.
- Razonamiento técnico y resolución de problemas: útil para análisis de código, revisión de arquitecturas y explicaciones técnicas.
- Prototipado rápido: permite generar esqueletos de aplicaciones o scripts a partir de descripciones en lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad en la información disponible. La model card solo incluye mediciones de velocidad y verificaciones de hechos memorizados (capital de Japón, días en 2024, etc.) que no constituyen una evaluación exhaustiva. El autor declara explícitamente que no se realizaron pruebas de perplexity, ni comparativas de calidad contra Q4_K_M o BF16, ni benchmarks de generación de código, ni pruebas de contexto largo, ni evaluación de tool calling.

Las mediciones de rendimiento en Ryzen AI MAX+ 395 (gfx1151, 128 GB unificados, ROCm 7.2.4) con `-ngl 99 -c 4096 -fa on` son:

| Build | Tamaño | Decode (tok/s) |
|---|---|---|
| ROCmFP4 (este) | 6.4907 GiB | 96.92 |
| Q4_K_M | 7.6063 GiB | 90.37 |
| BF16 (fuente) | 22.6423 GiB | no medido |

## Requisitos de hardware

- VRAM estimada: el fichero GGUF ocupa 6.49 GiB, por lo que se necesita al menos 8 GB de VRAM para cargar el modelo completo (con overhead de contexto).
- GPU recomendadas: AMD gfx1151 (Ryzen AI MAX+ 395 / Strix Halo) es el hardware objetivo. Puede funcionar en otras GPUs AMD con soporte ROCm, pero no está garantizado.
- No cabe en GPUs de consumo antiguas sin soporte ROCm; requiere una GPU AMD compatible con ROCm 7.2 o superior.
- Opciones de despliegue: llama.cpp con el parche ROCmFPX (commit 2809dc5) compilado con `-DGGML_HIP=ON -DAMDGPU_TARGETS=gfx1151`. No es compatible con llama.cpp estándar ni con vLLM, Ollama o TGI sin modificaciones.
- Latencia y throughput: decodificación de 96.92 tok/s en el hardware de referencia, medido con contexto 4096.

## Comparativa con modelos similares

No se dispone de datos de comparativa con modelos similares en la información proporcionada. El modelo base es un MoE de 12B con 2.5B activos, similar en concepto a otros MoE como Mixtral 8x7B (47B totales, 13B activos) o Qwen2.5-14B (14B densos), pero no hay benchmarks públicos que permitan una comparación cuantitativa. Se recomienda consultar el informe técnico de Mellum2 (arXiv:2605.31268) para más detalles.

## Limitaciones y advertencias

- La cuantización no ha sido validada con benchmarks de calidad; solo se verificaron hechos memorizados. Un modelo dañado podría pasar esas pruebas.
- No se realizaron pruebas de generación de código, a pesar de ser un modelo de codificación.
- No se probó el contexto largo (131k); solo se usó contexto 4096.
- No se evaluó tool calling.
- Requiere un parche no oficial de llama.cpp (ROCmFPX) y compilación manual; no es compatible con el ecosistema estándar.
- El modelo solo soporta inglés según la model card.
- Las mediciones de velocidad son de una sola ejecución, no medianas de repeticiones.
- La licencia Apache-2.0 permite uso comercial, pero el parche ROCmFPX puede tener su propia licencia (consultar `patches/README.md`).
- No hay garantía de funcionamiento en hardware distinto al probado.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/kingjones777/Mellum2-12B-A2.5B-Instruct-ROCmFP4-GGUF
- Modelo base: https://huggingface.co/JetBrains/Mellum2-12B-A2.5B-Instruct
- Colección Mellum 2 de JetBrains: https://huggingface.co/collections/JetBrains/mellum-2
- Repo GitHub de conversión y evaluación: https://github.com/altibola/Mellum2-12B-A2.5B-Instruct-GGUF
- Página oficial de JetBrains sobre Mellum: https://www.jetbrains.com/mellum/
- Informe técnico Mellum2 (arXiv): https://arxiv.org/abs/2605.31268
