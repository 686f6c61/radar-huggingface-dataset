# emrevrg/Norovox-Alpha-Source

## Resumen

Norovox Alpha es un proyecto de modelo de lenguaje en turco e inglés desarrollado por Emre Vergili (Norovox AI), un estudiante de 17 años sin respaldo empresarial. El repositorio `emrevrg/Norovox-Alpha-Source` no contiene pesos entrenados: según la propia model card, incluye únicamente el código fuente de la arquitectura «Norovox V4» y los pesos están «en fase de entrenamiento». Es, por tanto, una propuesta de arquitectura y un cuaderno de investigación, no un modelo desplegable. El pipeline de HuggingFace figura como no disponible, y el repositorio acumula 0 descargas y 0 likes desde su creación en junio de 2026.

La arquitectura declarada combina atención lineal propia (`NoroLinear`, coste O(N) en memoria) mezclada 3:1 con GQA, mezcla dispersa de expertos (sMoE) con routing top-k y pérdida de equilibrado de carga, predicción multi-token con 4 cabezas, una cabeza crítica-autorefino en inferencia y un adaptador LoRA de aprendizaje continuo. Se definen seis presets que van de 0,12 B a 32 B de parámetros totales (13,37 B activos en el preset sMoE de 16 expertos).

Su relevancia ahora es limitada y de naturaleza distinta a la de un modelo publicable: sirve como referencia de diseño para quien quiera estudiar combinaciones de atención lineal híbrida y MoE en un contexto de entrenamiento con recursos muy restringidos, y como ejemplo de model card que declara explícitamente sus límites. No existe ninguna evaluación publicada, ni benchmarks, ni pesos, ni demostración funcional, por lo que no puede utilizarse en producción ni compararse empíricamente con alternativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Norovox V4: transformer híbrido con atención lineal NoroLinear + GQA (proporción 3:1), sMoE con routing top-k y load balance loss, MTP de 4 cabezas, SelfRefiningHead y adaptador LoRA de aprendizaje continuo |
| Parametros totales | Hasta 32 B en el preset `alpha-xxl`; el resto de presets: 0,12 B / 0,44 B / 0,97 B / 1,89 B / 3,65 B (dense) |
| Parametros activos | 13,37 B en `alpha-xxl` (sMoE de 16 expertos); no aplica en los presets dense |
| Longitud de contexto | No disponible (la model card afirma «long context barato» sin cifra) |
| Tipos de cuantizacion | No disponible (no se publican pesos; no hay GGUF ni cuantizaciones precalculadas) |
| Idiomas soportados | Turco (tr) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible; el repositorio contiene solo código fuente (5,0 GB de repositorio, sin safetensors ni GGUF publicados) |
| Tokenizador | Norovox BPE 64K, orientado a morfología del turco |
| Biblioteca | transformers |
| Estado | Preview / desarrollo interno; pesos en entrenamiento |

## Arquitectura y entrenamiento

La arquitectura descrita se aparta del transformer denso convencional en cinco puntos. Primero, un esquema de atención híbrido por capas que combina GQA con `NoroLinear`, una atención lineal de memoria O(N) que se intercala en proporción 3:1 respecto a GQA; el reparto entre ambos tipos es dinámico por capa («hybrid attention schedule»). Segundo, mezcla dispersa de expertos con routing top-k y una pérdida de equilibrado de carga, pensada para el preset `alpha-xxl` con 16 expertos. Tercero, predicción multi-token con 4 cabezas en paralelo, que el autor plantea como acelerador tanto de entrenamiento como de inferencia. Cuarto, una `SelfRefiningHead` que en tiempo de inferencia critica y reescribe la respuesta. Quinto, `ContinuousLearner`, un adaptador LoRA «sombra» que se actualiza con feedback del usuario mediante mini-batch SGD.

En cuanto a datos, la model card es explícita pero escasa: corpus únicamente de texto turco generado por humanos en formato ChatML, sin indicar número de tokens ni composición. El entrenamiento declarado usa AdamW con schedule coseno, learning rate 3e-4, 2.000 pasos de warmup y batches pequeños con acumulación de gradiente, ejecutado en GPUs T4/A100 de Colab o en una «GPU farm». No se menciona RLHF, DPO ni ninguna fase de alineación posterior al preentrenamiento, y tampoco se documenta ninguna evaluación intermedia. No hay información sobre el número de tokens de entrenamiento ni sobre el estado real de convergencia.

## Capacidades

Todas las capacidades siguientes son **declaraciones del autor en la model card**, no capacidades verificadas con pesos publicados:

- Generación de texto y razonamiento con bloques explícitos `<think>...</think>`, que según el autor se enseñan durante el entrenamiento.
- Razonamiento multi-camino tipo Tree-of-Thought con rutas de pensamiento en paralelo.
- Bucle de auto-mejora: la `SelfRefiningHead` critica y refina la propia respuesta en tiempo de inferencia.
- Aprendizaje continuo online a partir de feedback del usuario, aplicado a un adaptador LoRA.
- Registro de tool calling con herramientas declaradas: `web_ara` (búsqueda web), `kod_yurut` (ejecución de código), `hesapla` (cálculo), `kb_ara` (búsqueda en base de conocimiento), `url_oku` (lectura de URL), `dosya` (ficheros).
- Planificación multi-paso para tareas de horizonte largo.
- Especial densidad declarada en cultura, literatura e historia turcas.
- Multilingüismo limitado a turco e inglés.
- No se declaran capacidades de visión, audio ni multimodalidad.

## Casos de uso

Ninguno de estos casos es ejecutable hoy, porque no existen pesos publicados. Se plantean como escenarios una vez el autor libere los presets entrenados:

- **Prototipado de asistentes en turco**: el preset `alpha-medium` (0,97 B) es el «baseline de producción» declarado y, por tamaño, el candidato lógico para prototipos de chat en turco con formato ChatML; encaja en una GPU de consumo con cuantización de 8 bits.
- **Investigación sobre atención lineal híbrida**: `NoroLinear` mezclada 3:1 con GQA es el elemento más diferencial del repositorio; serviría para reproducir experimentos de memoria O(N) frente a atención cuadrática en contextos largos, comparando perplejidad y consumo de VRAM por capa.
- **Estudio de routing MoE a pequeña escala**: el preset `alpha-xxl` (32 B totales, 13,37 B activos, 16 expertos) permite analizar el comportamiento de la pérdida de equilibrado de carga y la distribución de tokens por experto sin necesidad de un clúster grande, ya que solo se activa el 42 % de los parámetros.
- **Evaluación de decodificación multi-token**: las 4 cabezas MTP se podrían medir contra decodificación autorregresiva clásica en términos de tokens por segundo y de degradación de calidad, un experimento habitual en modelos tipo Medusa o EAGLE.
- **Análisis de sesgos en corpus turco**: al declarar un corpus exclusivamente humano y turco, el modelo sería un objeto de estudio útil para medir sesgos culturales y de género en modelos entrenados sin datos sintéticos ni destilación de modelos occidentales.
- **Banco de pruebas de tool calling**: el registro de herramientas (`web_ara`, `kod_yurut`, `hesapla`) permite construir harnesses de evaluación de function calling en turco, un idioma con poca cobertura en benchmarks de agentes.
- **Experimentos de aprendizaje continuo con cautela**: el adaptador LoRA online se podría evaluar en un entorno aislado para medir deriva (drift) y olvido catastrófico antes de plantear cualquier uso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, no hay evaluación humana documentada y no existen pesos con los que reproducir mediciones. Cualquier cifra de rendimiento atribuida a este modelo sería inventada.

## Requisitos de hardware

Estimaciones teóricas a partir del número de parámetros (bf16 ≈ 2 bytes/parámetro; 4 bits ≈ 0,5 bytes/parámetro), sin contar caché KV ni overhead del runtime:

| Preset | Parametros | VRAM bf16 (est.) | VRAM 4 bits (est.) | GPU sugerida |
|---|---|---|---|---|
| `alpha-mini` | 0,12 B | ~0,3 GB | ~0,1 GB | CPU o cualquier GPU |
| `alpha-small` | 0,44 B | ~0,9 GB | ~0,3 GB | GTX 1060 6 GB, RTX 3050 |
| `alpha-medium` | 0,97 B | ~2,0 GB | ~0,6 GB | RTX 3060 12 GB, T4 |
| `alpha-large` | 1,89 B | ~3,8 GB | ~1,1 GB | RTX 4060 Ti 8 GB, RTX 3060 |
| `alpha-xl` | 3,65 B | ~7,3 GB | ~2,0 GB | RTX 4070 12 GB, RTX 4090 |
| `alpha-xxl` | 32 B (13,37 B activos) | ~64 GB | ~16 GB | A100 80 GB; 2× RTX 4090 en 4 bits |

- **Cabe en GPU de consumo**: sí, todos los presets dense hasta `alpha-xl` en bf16 con GPUs de 8-12 GB; `alpha-xxl` requiere 4 bits y al menos 24 GB (RTX 3090/4090) para los pesos, con margen escaso para caché KV.
- **Opciones de despliegue**: no hay artefactos publicados. El código apunta a `transformers` con un paquete propio (`norovox_alpha_v4`); no existen pesos GGUF, por lo que llama.cpp y Ollama no son viables hoy. vLLM y TGI requerirían pesos y una implementación compatible de atención lineal y MoE.
- **Latencia y throughput**: no disponible. La atención O(N) y las 4 cabezas MTP son argumentos teóricos de eficiencia, sin ninguna medición publicada.
- **Requisito previo**: el repositorio ocupa 5,0 GB y contiene código, no pesos; para entrenar desde cero los presets grandes harían falta muchos más recursos que las cuotas gratuitas de Colab que el autor declara usar.

## Comparativa con modelos similares

La comparación solo puede ser estructural: no existe ningún resultado de Norovox Alpha que confrontar. El propio autor cita «Ornith 1.0» y «Ornith 32B» como rivales, pero no se ha localizado información verificable sobre ellos en la búsqueda realizada.

| Modelo | Parametros | Contexto | Licencia | Pesos publicados | Benchmarks |
|---|---|---|---|---|---|
| Norovox Alpha `alpha-xxl` | 32 B (13,37 B activos) | No disponible | Apache 2.0 | No | No disponible |
| Norovox Alpha `alpha-xl` | 3,65 B | No disponible | Apache 2.0 | No | No disponible |
| «Ornith 1.0» / «Ornith 32B» (citado por el autor) | No disponible | No disponible | No disponible | No disponible | No disponible |
| Alternativas dense de 1-4 B de la misma franja (Qwen, Llama, Gemma, SmolLM) | 1-4 B | 32K-128K típicamente | Varias, mayoritariamente permisivas | Sí | Sí, publicados por sus autores |

La diferencia operativa es tajante: las alternativas de la franja 1-4 B ofrecen pesos descargables, cuantizaciones GGUF y evaluaciones reproducibles; Norovox Alpha, en su estado actual, no ofrece ninguna de las tres cosas.

## Limitaciones y advertencias

- **No hay pesos**: el repositorio es código de arquitectura; la propia model card lo indica. No se puede inferir, evaluar ni desplegar el modelo.
- **Estado preview**: el autor lo etiqueta como desarrollo interno y advierte de que las versiones reforzadas «llegarán» a futuro. No hay calendario ni compromiso.
- **Cero validación externa**: 0 descargas y 0 likes; no hay informes de terceros, ni issues, ni reproducciones independientes.
- **Ausencia total de benchmarks**: no se puede afirmar nada sobre calidad, razonamiento o código. Cualquier expectativa basada en los tags `reasoning` o `moe` es una hipótesis.
- **Riesgo alto de alucinación en las afirmaciones de la model card**: se anuncian capacidades (Tree-of-Thought, self-improving loop, tool calling) sin evidencia; conviene tratarlas como hoja de ruta, no como especificación.
- **Cobertura lingüística estrecha**: solo turco e inglés, con tokenizador BPE de 64K orientado al turco; el rendimiento en castellano no está previsto ni evaluado.
- **Contexto desconocido**: el argumento de «contexto largo barato» no viene acompañado de una cifra, lo que impide planificar memoria o evaluar tareas de contexto largo.
- **Aprendizaje continuo = superficie de ataque**: un adaptador LoRA que se actualiza con feedback del usuario en producción es vulnerable a envenenamiento de datos, deriva del modelo y olvido catastrófico. Requeriría sandboxing, validación y capacidad de revertir el adaptador.
- **Tool calling con ejecución de código**: la herramienta `kod_yurut` implica ejecución de código generado; sin un aislamiento documentado, es un riesgo de seguridad de primer orden.
- **Licencia**: Apache 2.0 permite uso comercial y modificaciones sin restricciones relevantes, pero al no existir pesos ni artefactos derivados, la licencia es hoy meramente declarativa sobre el código.
- **Sostenibilidad del proyecto**: un único desarrollador sin financiación, entrenando con cuotas gratuitas que se agotan en días. La continuidad del proyecto no está garantizada.
- **Repositorio de 5,0 GB para «solo código»**: el tamaño no cuadra con un paquete de arquitectura típico; conviene inspeccionar el contenido antes de descargarlo.

## Enlaces

- HuggingFace: https://huggingface.co/emrevrg/Norovox-Alpha-Source
- Contacto declarado por el autor: zgremre@gmail.com · emrevrgdev@gmail.com
- No se han localizado papers, blogs, repositorios de código independientes ni demos. La búsqueda web realizada devolvió exclusivamente resultados sin relación alguna con el modelo (sitios para adultos), por lo que no se incluyen como fuentes.
