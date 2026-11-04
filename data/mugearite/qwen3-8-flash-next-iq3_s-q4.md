# Mugearite/Qwen3.8-Flash-Next-IQ3_S-Q4

## Resumen

Qwen3.8-Flash-Next IQ3_S-Q4 es una cuantización de precisión mixta del modelo Qwen3.8-Flash-Next de Qwen, publicada por el usuario Mugearite. No se trata de un modelo nuevo ni de un ajuste fino, sino de un empaquetado experimental en formato `.basalt` (versión 2) que parte del pack GSQ-RCO IQ3_S de ISTA-DASLab y sustituye los expertos enrutados de 20 de sus 48 capas por cuantizaciones alternativas: UD-Q4_K_XL de Unsloth en las capas que más pierden a 3 bits e IQ3_XXS del propio GSQ-RCO en las capas donde esa variante asigna más bits a los expertos.

El resultado ocupa 87,4 GiB (93,9 GB de repositorio) y promedia 3,88 bits por peso, frente a 3,49 del IQ3_S original y 5,25 del UD-Q4_K_XL. Según las mediciones del autor, reduce la divergencia KL un 26 % respecto al IQ3_S y mejora en 8 respuestas correctas sobre 198 en GPQA-Diamond, a cambio de un 6-9 % menos de velocidad de decodificación.

Su relevancia es acotada pero clara: demuestra que la asignación heterogénea de bits por capa, guiada por la sensibilidad medida de cada capa, permite acercarse a la calidad de una cuantización de 4-5 bits con un tamaño notablemente menor. Está pensado para ejecutarse en una única RTX 5090 bajo Windows mediante el fork Mugearite de Basalt, con soporte de contexto de hasta 1.048.576 tokens mediante YaRN.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención, capas SSM y mezcla de expertos (MoE); incluye tabla n-gram, drafter MTP y proyector de visión |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens nativo; 1.048.576 tokens con YaRN (configs incluidas) |
| Tipos de cuantización | Precisión mixta: IQ3_S, IQ3_XXS y UD-Q4_K_XL combinados por capa; 3,88 bits por peso de media (3,74 en expertos enrutados) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`license: other`) |
| Formato de pesos | `.basalt` versión 2 (no es safetensors ni GGUF estándar) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.8-Flash-Next, un transformer con mezcla de expertos que combina capas de atención con capas SSM, e incorpora componentes auxiliares: una tabla n-gram, un drafter MTP (multi-token prediction) para decodificación especulativa y un proyector de visión. El pack conserva íntegros y sin recuantizar la atención, las capas SSM, los expertos compartidos, los routers, las embeddings, la tabla n-gram, el drafter MTP y el proyector de visión del IQ3_S original; solo se modifican los expertos enrutados de 20 capas.

La selección de capas no es heurística. El autor midió cada capa de forma aislada contra cada pack de origen (UD-Q4_K_XL completo, solo las filas «down» de UD-Q4_K_XL, IQ3_XXS y Q2_0), calculando la divergencia KL frente a una referencia Q8_0 sobre 50 fragmentos de wikitext-2, y validó conjuntos de sustituciones sobre otros 50 fragmentos no vistos. Las conclusiones: las capas tardías (31-47) son las que más pierden a 3 bits y las intermedias (7-29) las que menos; actualizar solo las filas «down» almacenadas como Q2_0 en las capas más finas del IQ3_S rentabiliza mucho; las capas donde IQ3_XXS asigna más bits que IQ3_S son la mejora más barata por byte; las mejoras se acumulan al combinarlas y las degradaciones también, por lo que rebajar bits en capas insensibles no compensa. Los expertos se copian byte a byte desde los packs de origen, sin recuantización.

## Capacidades

- Generación de texto y razonamiento de varios pasos, con modo «thinking» y esfuerzo configurable (por defecto `xhigh`).
- Razonamiento matemático de competición: el autor reporta 100,0 en AIME 2025 con un presupuesto de 262.144 tokens.
- Razonamiento científico de nivel experto: 92,42 en GPQA-Diamond.
- Capacidades de visión mediante el proyector conservado del pack original.
- Decodificación especulativa mediante el drafter MTP incluido.
- Contexto largo: configuraciones de servidor para 262.144 y 1.048.576 tokens (esta última con YaRN).
- Compatibilidad con la API compatible con OpenAI de Mugearite y con el servidor Basalt, incluyendo servicio multi-slot (6 slots simultáneos en las pruebas del autor).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Razonamiento matemático y científico en local: adecuado para resolver problemas de competición o de nivel posgrado en una única GPU de consumo, gracias a sus resultados en AIME 2025 y GPQA-Diamond y a su presupuesto de contexto de 262.144 tokens, que evita que las cadenas de razonamiento largas se trunquen.
- Análisis de documentos extensos: con la configuración de 1.048.576 tokens y YaRN se pueden procesar libros completos, expedientes o bases de código en una sola pasada, manteniendo la coherencia entre turnos.
- Asistente de investigación con visión: el proyector de visión conservado permite interpretar figuras, tablas e imágenes junto con texto largo, útil para revisión de literatura científica o auditoría de informes.
- Evaluación de cuantizaciones: este pack sirve como referencia práctica para estudiar el impacto de la asignación heterogénea de bits por capa, comparando su KLD y su rendimiento en benchmarks frente al IQ3_S y al UD-Q4_K_XL con el mismo harness.
- Despliegue de un servidor de inferencia personal multi-sesión: las pruebas del autor usan 6 slots simultáneos a través de una API compatible con OpenAI, lo que permite atender varias conversaciones o agentes en una sola máquina.
- Prototipado de pipelines de razonamiento largo: útil para desarrolladores que necesitan cadenas de pensamiento de decenas de miles de tokens (el autor documenta problemas de AIME que consumen entre 76.000 y 90.000 tokens) sin depender de infraestructura en la nube.
- Experimentación con decodificación especulativa: el drafter MTP incluido permite medir la ganancia de throughput en hardware consumer y comparar implementaciones (Basalt frente a Mugearite).

## Benchmarks y rendimiento

Calidad medida sobre wikitext-2 (100 fragmentos de 512 tokens, caché KV int8, referencia Q8_0 con PPL base 3,2808). Las elecciones de capas se hicieron con los fragmentos 0-49, por lo que la última columna es held-out.

| Modelo | Tamaño | PPL | KLD media | Mismo top-1 | KLD (fragmentos 50-99) |
|---|---:|---:|---:|---:|---:|
| GSQ-RCO IQ3_S | 87,6 GB | 3,3738 | 0,1520 | 87,29 % | 0,1482 |
| Este pack | 93,9 GB | 3,3230 | 0,1126 | 88,99 % | 0,1136 |
| UD-Q4_K_XL | 114,6 GB | 3,3234 | 0,0561 | 92,29 % | 0,0575 |
| Q8_0 | 192,2 GB | 3,2854 | 0,0298 | 94,37 % | 0,0287 |

Benchmarks de razonamiento (API compatible con OpenAI de Mugearite, 6 slots, thinking a esfuerzo `xhigh`, temperatura 1,0, top_p 0,95, top_k 20, presupuesto de 262.144 tokens):

| Modelo | AIME 2025 | GPQA-Diamond |
|---|---:|---:|
| Este pack | 100,0 (120/120, 4 muestras por problema) | 92,42 (183/198, 1 muestra) |
| GSQ-RCO IQ3_S, mismo harness | no ejecutado | 88,38 (175/198, 1 muestra) |
| Qwen3.8-Flash-Next a precisión completa (harness de Qwen) | no disponible | 91,7 |
| GSQ-RCO IQ3_S (harness de ISTA-DASLab) | 100,00 | 92,93 |

En GPQA, este pack acertó 9 preguntas que IQ3_S falló e IQ3_S acertó 1 que este pack falló (test exacto de signos, p = 0,02). Una sola ejecución de GPQA varía unos 2 puntos. El presupuesto de tokens importa: con 65.536 tokens AIME bajó a 96,7, y 23 de las 120 respuestas correctas consumieron más de 32.768 tokens.

Velocidad en una RTX 5090 a 450 W, configs de 262.144 tokens, una petición a la vez, primera lectura de 10.000 o 100.000 tokens y turnos posteriores de unos 330 tokens:

| Runtime | Métrica | GSQ-RCO IQ3_S | Este pack |
|---|---|---:|---:|
| Basalt 0.2.1 | Decodificación a 10K / 100K, tok/s | 324 / 291 | 268 / 255 |
| Basalt 0.2.1 | Lectura de seguimiento a 10K / 100K, ms | 276 / 339 | 335 / 383 |
| Mugearite | Decodificación a 10K / 100K, tok/s | 322 / 308 | 301 / 281 |
| Mugearite | Lectura de seguimiento a 10K / 100K, ms | 214 / 265 | 255 / 310 |

## Requisitos de hardware

- VRAM: el archivo pesa 87,4 GiB, por lo que no cabe en GPUs de 24 GB ni de 48 GB; requiere al menos 96 GB de memoria, ya sea en VRAM o combinando VRAM y memoria del sistema según la implementación.
- GPU recomendadas: RTX 5090 (32 GB) es el objetivo declarado por el autor, presumiblemente con descarga de pesos a memoria del sistema; GPUs profesionales con 96 GB o más (A100 80 GB no es suficiente por sí sola, H100 80 GB tampoco, salvo con offload).
- GPU de consumo: solo viable en RTX 5090 mediante el fork Mugearite de Basalt, que cubre todos los pares de formatos de expertos del pack; en Basalt 0.2.1 estándar funciona pero más lento.
- Opciones de despliegue: Basalt 0.2.1 o superior (servidor con configs JSON incluidas para 262.144 y 1.048.576 tokens) y el fork Mugearite de Basalt para Windows con una RTX 5090. No es compatible con llama.cpp, vLLM, TGI ni Ollama, ya que el formato `.basalt` v2 es específico.
- Latencia y throughput: 268-301 tok/s de decodificación a 10K de contexto y 255-281 tok/s a 100K según runtime; lecturas de seguimiento de 255-383 ms. El autor indica que este pack es un 6-9 % más lento en decodificación que IQ3_S.

## Comparativa con modelos similares

| Modelo | Bits/peso (total) | Tamaño | KLD media | GPQA-Diamond | Licencia | Formato |
|---|---:|---:|---:|---:|---|---|
| Este pack (IQ3_S-Q4) | 3,88 | 93,9 GB | 0,1126 | 92,42 | Qwen Community 1.0 | `.basalt` v2 |
| GSQ-RCO IQ3_S | 3,49 | 87,6 GB | 0,1520 | 88,38 | Qwen Community 1.0 | `.basalt` v2 |
| UD-Q4_K_XL (Unsloth) | 5,25 | 114,6 GB | 0,0561 | no disponible | Qwen Community 1.0 | GGUF |
| Q8_0 | 8,0 | 192,2 GB | 0,0298 | no disponible | Qwen Community 1.0 | GGUF |

Frente al IQ3_S, este pack gana 0,39 bits por peso de media y reduce la KLD un 26 %, con una mejora estadísticamente significativa en GPQA. Frente al UD-Q4_K_XL, iguala la perplejidad (3,3230 frente a 3,3234) con 20,7 GB menos, aunque su KLD es el doble (0,1126 frente a 0,0561), lo que indica que la distribución de probabilidades se aleja más de la referencia aunque el top-1 acierte con más frecuencia que IQ3_S. La comparación con modelos de otros fabricantes del mismo tamaño no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo etiqueta como tal, con mediciones de desarrollo y no ejecuciones de benchmark formales.
- Formato propietario: `.basalt` v2 solo se ejecuta en Basalt 0.2.1 o superior y, para rendimiento completo, en el fork Mugearite bajo Windows con una RTX 5090. No hay soporte en llama.cpp, vLLM, TGI ni Ollama.
- Rendimiento dependiente del presupuesto de tokens: con 65.536 tokens de presupuesto, AIME cae de 100,0 a 96,7; los resultados reportados asumen 262.144 tokens.
- Variabilidad de las mediciones: una sola ejecución de GPQA varía unos 2 puntos; el propio autor señala que las elecciones de capas guiadas por ganancia medida se degradan en fragmentos no vistos.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información proporcionada; aplican los riesgos habituales del modelo base en tareas de razonamiento largo.
- Idiomas soportados: no disponible; la model card no detalla cobertura lingüística.
- Licencia: Qwen Community License 1.0, que impone condiciones específicas para uso comercial; conviene revisar el archivo `LICENSE` del repositorio antes de desplegarlo en producción.
- Sin métricas de tool calling ni de agentes: no hay datos publicados sobre function calling en esta cuantización.
- El repositorio no registra descargas ni likes y no incluye pipeline declarado, lo que limita la validación por parte de terceros.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Mugearite/Qwen3.8-Flash-Next-IQ3_S-Q4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Pack de origen GSQ-RCO: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Pack UD-Q4_K_XL de Unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Runtime Basalt: https://github.com/jesdga95/basalt
