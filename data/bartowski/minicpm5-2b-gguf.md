# bartowski/MiniCPM5-2B-GGUF

## Resumen

MiniCPM5-2B-GGUF es la versión cuantizada en formato GGUF del modelo openbmb/MiniCPM5-2B, publicada por bartowski, un cuantizador independiente conocido por sus conversiones con imatrix para llama.cpp. No se trata por tanto de un modelo nuevo, sino de un artefacto de despliegue: el modelo original lo desarrolla el equipo de OpenBMB y aquí se distribuye ya convertido a cuantizaciones de 2 a 8 bits para su ejecución local. El modelo forma parte de la quinta generación de la familia MiniCPM, orientada a dispositivos de borde (on-device) y con soporte declarado de contexto largo y llamada a herramientas.

El modelo base cuenta con 2.516.756.480 parámetros reales según sus pesos en safetensors (unos 2,5 mil millones), aunque la model card de la conversión indica "3B" de forma aproximada. Está etiquetado en llama.cpp dentro de la familia arquitectónica "llama" y admite únicamente entrada de texto. Su entrenamiento declara datos de OpenBMB orientados a web filtrada, matemáticas, código y ajuste con instrucciones y agentes, con una fase de RL posterior.

Su relevancia actual es práctica: ofrece un modelo conversacional bilingüe (inglés y chino) con licencia Apache-2.0, ejecutable en portátiles y equipos sin GPU dedicada gracias a cuantizaciones que ocupan entre 0,97 GB y 2,68 GB. Es un candidato razonable para prototipos de agentes locales, asistentes embebidos y pipelines con restricciones de privacidad o de coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; etiquetada como familia "llama" en llama.cpp (transformer decoder-only) |
| Parametros totales | 2.516.756.480 (según pesos safetensors del modelo base); la model card de la conversión indica "3B" de forma aproximada |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible (etiquetada con "long-context", sin cifra publicada) |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, IQ4_NL, Q4_K_S, Q4_0, IQ4_XS, IQ3_M, Q3_K_L, Q3_K_M, IQ3_XS, Q3_K_S, IQ3_XXS, Q2_K, IQ2_M |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (conversión de los pesos originales en safetensors) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo base: únicamente se indica que llama.cpp lo clasifica dentro de la familia "llama", lo que implica un transformer decoder-only causal con atención completa, sin mezcla de expertos ni capas de estado recurrente declaradas. Tampoco se especifica el número de capas, dimensiones ocultas, número de cabezas de atención ni la técnica de atención empleada. La conversión se realizó con llama.cpp release b10883, con calibración imatrix activada y sin decodificación especulativa.

En cuanto al entrenamiento, los conjuntos de datos declarados por el autor del modelo base son openbmb/Ultra-FineWeb, UltraX-Preview y Ultra-FineWeb-L3 para datos web, UltraData-Math y UltraData-Code para dominios especializados, y tres conjuntos de post-entrenamiento: UltraData-SFT-2605 (ajuste supervisado general), UltraData-SFT-Agent-2609 (ajuste orientado a agentes) y UltraData-RL-2609 (refuerzo). La presencia de estos dos últimos indica que hubo fases explícitas de SFT y de RL orientadas a comportamiento agéntico, pero no se publica el número de tokens, la composición porcentual del corpus ni los algoritmos concretos empleados.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de prompt estilo ChatML (<|im_start|>system / user / assistant).
- Soporte declarado de contexto largo mediante la etiqueta "long-context"; la longitud exacta en tokens no está publicada.
- Llamada a herramientas (tool-calling), reforzada por el uso del conjunto UltraData-SFT-Agent-2609 en el entrenamiento.
- Comportamiento orientado a agentes y razonamiento multi-paso, derivado de las fases de SFT-Agent y RL declaradas.
- Capacidad multilingüe limitada a inglés y chino.
- Ejecución en dispositivo (on-device) y edge-ai, gracias a su tamaño reducido y a las cuantizaciones disponibles.
- Entrada exclusivamente de texto: no hay soporte de visión, audio ni otras modalidades en la información disponible.
- No se declara decodificación especulativa en la conversión.

## Casos de uso

- Asistentes conversacionales locales: el modelo puede mantener diálogos multi-turno en inglés o chino ejecutándose íntegramente en el equipo del usuario, lo que evita enviar datos a servicios externos y es adecuado para sectores con requisitos de privacidad.
- Agentes con llamada a herramientas en producción ligera: al haberse entrenado con datos de agentes, puede integrarse en flujos donde el modelo decide qué función invocar (consultas a bases de datos, APIs internas) antes de redactar la respuesta.
- Procesamiento de documentos largos con contexto extenso: la orientación a contexto largo permite resumir o extraer información de informes y contratos sin trocear el texto en exceso, siempre que se verifique la ventana real soportada.
- Prototipado rápido en portátiles sin GPU: con la cuantización Q4_K_M (1,62 GB) se puede levantar un servidor de inferencia en un portátil convencional para validar ideas de producto antes de escalar a modelos mayores.
- Clasificación y enrutado de texto en pipelines de datos: tareas de etiquetado, categorización de tickets o enrutado de consultas donde la latencia y el coste por token importan más que el razonamiento profundo.
- Generación de código asistida en entornos con recursos limitados: dado el uso de UltraData-Code en el entrenamiento, puede emplearse para autocompletado o explicación de fragmentos en editores locales, con verificación humana posterior.
- Aplicaciones de borde e IoT con restricciones de memoria: las cuantizaciones IQ2_M (0,97 GB) y Q2_K (1,01 GB) permiten desplegar el modelo en dispositivos con poca RAM, aceptando una pérdida notable de calidad.
- Soporte multilingüe inglés-chino: traducción, atención al cliente o moderación de contenido en escenarios que combinen ambos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card de la conversión no incluye tablas de MMLU, HumanEval, GSM8K ni comparativas con otros modelos, y los resultados de la búsqueda web realizada no contienen información relevante sobre el modelo (los enlaces devueltos tratan sobre entidades bancarias y no guardan relación con este lanzamiento).

## Requisitos de hardware

- VRAM/RAM estimada para los pesos, según el archivo elegido:
  - IQ2_M: 0,97 GB; Q2_K: 1,01 GB; IQ3_XXS: 1,14 GB; IQ3_XS y Q3_K_S: 1,19 GB; Q3_K_M: 1,24 GB; Q3_K_L: 1,29 GB; IQ3_M: 1,36 GB.
  - IQ4_XS: 1,46 GB; Q4_0: 1,52 GB; Q4_K_S: 1,53 GB; IQ4_NL: 1,61 GB; Q4_K_M: 1,62 GB; Q4_1: 1,65 GB; Q4_K_L: 1,71 GB.
  - Q5_K_S: 1,82 GB; Q5_K_M: 1,92 GB; Q6_K: 2,11 GB; Q6_K_L: 2,28 GB; Q8_0: 2,68 GB; bf16: 5,04 GB.
- Añadir a esas cifras el espacio para la caché KV, que crece con la longitud de contexto efectiva y con el número de secuencias en paralelo; el repositorio completo ocupa 36,3 GB, aunque solo se descarga el archivo necesario.
- Cabe sin problema en GPU de consumo: cualquier tarjeta con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090) puede ejecutar las cuantizaciones Q4 y Q5; con 8 GB o más se pueden usar Q6_K y Q8_0 con contextos amplios.
- Funciona en CPU y en Apple Silicon (los formatos Q4_1 y Q4_0 están indicados para mejor rendimiento en tokens/vatio en chips de Apple); también es viable en dispositivos de gama baja con 2-4 GB de RAM usando cuantizaciones IQ2/IQ3.
- Para servir a varios usuarios concurrentes en GPU profesional (A100, H100, L40S) el modelo es sobredimensionado en capacidad de cómputo; su uso típico es el contrario: muchas instancias pequeñas en paralelo.
- Opciones de despliegue: llama.cpp (release b10883 o posterior), Ollama, LM Studio, servidores compatibles con el endpoint de OpenAI y cualquier runtime que consuma GGUF; los tags indican "endpoints_compatible".
- Latencia y throughput: no disponibles. Dependerán del hardware, de la cuantización y del contexto; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| MiniCPM5-2B (esta ficha) | 2,52 B (pesos safetensors) | No disponible (etiqueta "long-context") | Apache-2.0 | GGUF (conversión de bartowski); safetensors en el modelo base | Tool-calling y agentes declarados; idiomas en/zh |
| Llama 3.2 1B / 3B | 1,2 B y 3,2 B aprox. | No disponible en esta ficha | Licencia comunitaria de Meta (no Apache-2.0) | GGUF, safetensors | Alternativa de tamaño comparable para despliegue en borde; la licencia no es Apache-2.0 |
| Qwen2.5 1.5B / 3B | 1,5 B y 3 B aprox. | No disponible en esta ficha | Apache-2.0 en varias tallas | GGUF, safetensors | Cobertura multilingüe más amplia que en/zh, según la documentación pública del modelo |
| Gemma 2 2B | 2,6 B aprox. | No disponible en esta ficha | Términos de uso de Gemma (no Apache-2.0) | GGUF, safetensors | Tamaño casi idéntico; licencia con condiciones adicionales |

Los campos de contexto y de rendimiento de los modelos alternativos no se han verificado con datos de la información proporcionada, por lo que se marcan como no disponibles. No se han publicado comparativas de benchmarks entre MiniCPM5-2B y estos modelos en el material disponible.

## Limitaciones y advertencias

- Se trata de una conversión de terceros (bartowski), no de una publicación oficial de OpenBMB; ante dudas de fidelidad conviene contrastar con el modelo base en safetensors.
- El repositorio declara 2.516.756.480 parámetros reales, mientras que la model card indica "3B": hay una discrepancia de etiquetado que conviene tener en cuenta al dimensionar hardware.
- La longitud de contexto real no está publicada; la etiqueta "long-context" no sustituye a una cifra verificada y debe medirse antes de diseñar aplicaciones que dependan de ventanas amplias.
- Solo se declaran inglés y chino: el rendimiento en castellano no está garantizado ni evaluado.
- Ausencia total de benchmarks publicados en la información disponible, lo que impide estimar su calidad relativa frente a alternativas del mismo tamaño.
- Riesgo de alucinación inherente a un modelo de 2,5 B de parámetros: no es adecuado para tareas que exijan exactitud factual sin verificación externa ni para razonamiento matemático complejo.
- Las cuantizaciones agresivas (Q2_K, IQ2_M, IQ3_XXS) degradan la calidad de forma perceptible; el propio autor las marca como de calidad baja o muy baja.
- El uso de tool-calling y de comportamiento agéntico requiere validación propia: los datos de entrenamiento sugieren capacidad, pero no hay evaluaciones publicadas de fiabilidad en llamadas a funciones.
- Licencia Apache-2.0: permite uso comercial y modificación, siempre que se conserven los avisos de copyright y licencia; conviene revisar igualmente las condiciones del modelo base si se redistribuye.
- El modelo no admite entrada de imagen ni de audio, por lo que no sirve para casos de uso multimodales.
- Las fechas de creación y actualización del repositorio (septiembre de 2026) y el número de descargas (1714) y "likes" (10) son bajos, lo que se traduce en poca validación comunitaria acumulada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/MiniCPM5-2B-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Release de llama.cpp usada para la cuantización: https://github.com/ggml-org/llama.cpp/releases/tag/b10883
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp/
- Archivo recomendado Q4_K_M: https://huggingface.co/bartowski/MiniCPM5-2B-GGUF/blob/main/MiniCPM5-2B-Q4_K_M.gguf
- Datasets declarados: openbmb/Ultra-FineWeb, openbmb/UltraX-Preview, openbmb/Ultra-FineWeb-L3, openbmb/UltraData-Math, openbmb/UltraData-Code, openbmb/UltraData-SFT-2605, openbmb/UltraData-SFT-Agent-2609, openbmb/UltraData-RL-2609
- Paper técnico, blog de OpenBMB, demo o repositorio oficial: no disponibles en la información proporcionada.
- La búsqueda web realizada no devolvió ningún resultado relacionado con este modelo.
