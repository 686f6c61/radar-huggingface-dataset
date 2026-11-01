# initialed85/Swift1.5-Qwen3.8-Flash-Next-Sushi-2.6bpw

## Resumen

Swift 1.5 Qwen3.8-Flash-Next — Sushi 2.6bpw es una cuantización no oficial, construida por la comunidad (usuario initialed85), del modelo ukisai/Swift1.5-Qwen3.8-Flash-Next, un modelo multimodal (imagen-texto a texto) de arquitectura mezclada de expertos (MoE) de aproximadamente 180 B de parámetros totales. El pack aplica cuantización EXL3 de 2,625 bits por peso (bpw) sobre los expertos enrutados y 8 bits sobre la parte densa, con el objetivo de que el modelo completo quepa y se sirva en un único Mac con Apple Silicon de 64 GB de memoria unificada.

La relevancia de este pack radica en demostrar que un MoE de clase muy grande puede ejecutarse localmente en hardware de consumidor de gama alta gracias a una combinación de cuantización agresiva solo en los expertos, decodificación especulativa mediante MTP (multi-token prediction) y una tabla de n-gramas leída desde SSD sin ocupar memoria de GPU. En las mediciones del autor se alcanzan 45,1 tokens/s de decodificación con un 81,5 % de aceptación MTP y contexto nativo de 262.144 tokens.

Hay que señalar dos advertencias importantes: el modelo solo funciona con el runtime sushi (versión 1.3.0 o superior) en Apple Silicon con macOS 26.2+, y el contador de "26 B params" que muestra Hugging Face es un recuento erróneo de tensores, no el tamaño real del modelo (25,96 mil millones de parámetros en safetensors corresponde al payload cuantizado, no al modelo original).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE híbrido (48 capas × 512 expertos enrutados, GatedDeltaNet, hiper-conexiones, indexer, torre de visión Qwen3-VL ViT, cabeza MTP) |
| Parametros totales | ≈180 B (modelo base); payload cuantizado de 25.959.006.099 parámetros en safetensors (recuento de tensores del Hub no representativo) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens nativos, sin YaRN |
| Tipos de cuantizacion | EXL3 2,625 bpw (codebook `mcg`, ventana 15, ldlq-rotated, escalas de salida svh) en expertos; 8-bit affine grupos de 64 filas en parte densa; 4-bit affine grupo 32 en tabla de n-gramas |
| Idiomas soportados | no disponibles |
| Licencia | swift-open-license-1.0 (con Qwen Community License 1.0; conversión no oficial documentada en NOTICE-CONVERSION.md) |
| Formato de pesos | safetensors (52 shards, 3.069 tensores, 47,26 GB) + tabla de n-gramas de 32 GB (ngram_table.bin); solo compatible con sushi ≥ 1.3.0 |

## Arquitectura y entrenamiento

El modelo base es un MoE híbrido de ≈180 B con 48 capas, cada una con 512 expertos enrutados, combinando atención con GatedDeltaNet (mecanismo recurrente lineal tipo delta-net), expertos compartidos, hiper-conexiones y un indexer para el enrutado. Incluye una torre de visión Qwen3-VL ViT que habilita entrada de imagen y vídeo, y una cabeza MTP (multi-token prediction) para decodificación especulativa. El contexto nativo es de 262.144 tokens sin necesidad de extensión YaRN.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no se ha publicado información en la ficha disponible. En cuanto a la cuantización, el pack asigna la precisión mínima (EXL3 2,625 bpw) exclusivamente a los expertos enrutados y a la cabeza MTP, manteniendo la parte densa (atención, GatedDeltaNet, expertos compartidos, embeddings y lm_head) a 8 bits affine. La tabla de n-gramas (29,8 GiB) se mantiene en SSD y se lee bajo demanda, sin residir en memoria de GPU, lo que reduce drásticamente los requisitos de memoria unificada. El autor advierte que upstream sushi prepara una cuantización STQ que, según se afirma, superaría la calidad de 3 bpw en el footprint actual de 2,6 bpw.

## Capacidades

- Generación de texto conversacional con razonamiento (modo thinking con presupuesto de esfuerzo ajustable: medium, xhigh)
- Comprensión multimodal: entrada de imagen y vídeo mediante la torre de visión Qwen3-VL ViT (pipeline image-text-to-text)
- Generación de código: 81/100 funciones JavaScript ejecutadas correctamente en el deck propio (HumanEval+MBPP)
- Matemáticas y razonamiento científico: GPQA-D, SuperGPQA, AIME 2025 (69/92 en el deck core), aunque con artefactos de emisión de respuesta en OlympiadBench
- Contexto muy largo: 262.144 tokens nativos sin YaRN
- Decodificación especulativa vía MTP con 81,5 % de tasa de aceptación
- Cuantización KV a 8 bits durante la servida

No se menciona soporte explícito de tool calling ni de agentes en la información disponible.

## Casos de uso

- Asistente local en Mac de gama alta: ejecución totalmente offline en Apple Silicon de 64 GB, adecuada para desarrolladores que necesitan un LLM grande sin depender de la nube ni enviar datos a terceros.
- Análisis de documentos largos: con 262 k tokens de contexto nativo, puede procesar libros técnicos completos, contratos o bases de código extensas en una sola sesión.
- Comprensión de imágenes y vídeo: la torre Qwen3-VL permite describir, responder preguntas y extraer información de contenido visual, útil para indexación de multimedia o automatización de revisiones visuales.
- Generación y revisión de código: con 81/100 en ejecución real de funciones JavaScript, es apto para asistentes de programación locales, refactorizaciones y revisión de pull requests en repositorios medianos.
- Razonamiento científico y matemático de nivel avanzado: 75 % en un deck que combina GPQA-D, SuperGPQA y AIME 2025, orientado a investigación y verificación de soluciones técnicas (con las cautelas de emisión de respuesta indicadas).
- Prototipado de servidores LLM de alta eficiencia: la combinación de cuantización por componentes, n-gram table en SSD y MTP sirve como referencia práctica para quien investiga despliegues de modelos enormes en memoria unificada limitada.
- Chat multi-turno con KV-cache cuantizado a 8 bits, que reduce la huella de memoria en conversaciones largas manteniendo latencia estable.

## Benchmarks y rendimiento

Mediciones del autor del pack, en brazos igualados (mismo servidor, flags y hardware) frente al pack oficial de beamster. Los tres decks no son comparables entre sí. Los decks "hard" y "core" son cotas inferiores, no estimaciones puntuales.

| Deck | Este pack (initialed85) | Pack oficial (beamster) | Veredicto |
|---|---|---|---|
| code (100 funciones JS, HumanEval+MBPP, ejecutadas) | 81/100 | 86/100 | −5 (todo en MBPP: 33 vs 37; HumanEval 48 vs 49) |
| hard (50 preguntas: MMLU-Pro, Olympiad, LiveBench, Juliet) | 36/50 | 36/50 | Empate; OlympiadBench 0/10 en ambos |
| core (92 preguntas: GPQA-D, SuperGPQA, AIME 2025, COMPSEC) | 69/92 (75,0 %) | 65/92 (70,4 %) | +4, pero ambas cifras son cotas inferiores |
| KLD vs profesor BF16 | no medido | 0,1355 publicado | requiere el profesor de 360 GB |

Notas del autor: el "LLMProbe Hard 50 — 88,0 %" publicado por beamster no se reprodujo (72,0 % con su pack y este servidor); la banda de ruido es ±1/100; el hueco de 5 puntos en code se considera real. Rendimiento de inferencia medido: 45,1 tok/s de decodificación, 81,5 % de aceptación MTP, contexto servido de 131.072 tokens en las pruebas.

## Requisitos de hardware

- Memoria: un único Mac con Apple Silicon de 64 GB de memoria unificada es la configuración medida y objetivo del pack (73,85 GiB en total, de los cuales 47,26 GB son safetensors y 32 GB la tabla de n-gramas en SSD).
- GPU: no aplicable en el sentido tradicional; el runtime sushi requiere Apple Silicon (GPU integrada de la familia M). No hay soporte para CUDA ni GPUs NVIDIA.
- Sistema operativo: macOS 26.2 o superior, sushi 1.3.0 o superior (kernels `mcg`, `n42` y `qwen-gdn` son de la serie 1.3.x).
- Compatibilidad: el pack NO carga en transformers, vLLM, mlx-lm, llama.cpp ni exllamav3; solo funciona con sushi.
- Instalación: `sushi pull` no puede descargar este repositorio (solo acepta packs del org `beamster`); hay que descargarlo manualmente con `hf download` e instalarlo en el árbol que sushi escanea.
- Rendimiento estimado: 45,1 tok/s de decodificación en el hardware medido, con MTP activado (81,5 % de aceptación) y KV-cache a 8 bits.

## Comparativa con modelos similares

| Característica | Este pack (initialed85, 2.6bpw) | Pack oficial beamster 2.6bpw | Modelo base ukisai/Swift1.5-Qwen3.8-Flash-Next |
|---|---|---|---|
| Tamaño en disco | 79,3 GB | no disponible | no disponible |
| Cuantización expertos | EXL3 2,625 bpw | EXL3 2,625 bpw (según comparación) | BF16 (sin cuantizar) |
| Contexto | 262.144 nativo | no disponible | 262.144 nativo |
| code (100 JS) | 81/100 | 86/100 | no disponible |
| hard (50 q) | 36/50 | 36/50 | no disponible |
| core (92 q) | 69/92 (75,0 %) | 65/92 (70,4 %) | no disponible |
| Runtime | solo sushi ≥ 1.3.0 | sushi | no disponible |
| Licencia | swift-open-license-1.0 + Qwen Community 1.0 | swift-open-license-1.0 | swift-open-license-1.0 |

No hay datos suficientes para comparar con modelos de otras familias de tamaño similar.

## Limitaciones y advertencias

- Compatibilidad de runtime extremadamente restrictiva: solo funciona con sushi ≥ 1.3.0 en Apple Silicon con macOS 26.2+; no carga en transformers, vLLM, mlx-lm, llama.cpp ni exllamav3.
- El contador de "26 B params" del Hub es erróneo (recuento de tensores); el tamaño real del modelo base es ≈180 B y el payload cuantizado ocupa 79,3 GB.
- Los resultados de "hard" y "core" son cotas inferiores: 18-23 casos terminan sin línea `Answer:` y OlympiadBench da 0/10 en ambos packs por un artefacto de emisión de respuesta, no por incapacidad matemática.
- Divergencia de mediciones: el 88,0 % publicado por beamster en LLMProbe Hard 50 no se reprodujo (72,0 %); cualquier cifra debe leerse junto a sus condiciones de medida.
- El hueco de −5 puntos en el deck code respecto al pack oficial es real según el autor (5 veces la banda de ruido) y se atribuye parcialmente a que este pack "piensa menos" en esfuerzo medium (332 vs 556 tokens de razonamiento medians por pregunta).
- Riesgo de alucinación: no se han publicado evaluaciones específicas de veracidad o alucinación en la información disponible.
- Sesgos: no disponibles.
- Idiomas soportados: no disponibles en la ficha.
- Licencia: conversión no oficial bajo swift-open-license-1.0 y Qwen Community License 1.0; el pack no está afiliado a UkisAI ni a beamster. Revisar ambas licencias antes de cualquier uso comercial.
- Obsolescencia prevista: si upstream sushi publica la cuantización STQ, este pack pasará a ser la línea base histórica de 2,6 bpw.
- `sushi pull` no puede descargar este repositorio; la instalación debe hacerse manualmente.

## Enlaces

- Modelo cuantizado: https://huggingface.co/initialed85/Swift1.5-Qwen3.8-Flash-Next-Sushi-2.6bpw
- Modelo base: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Repositorio GitHub del pack: https://github.com/initialed85/Swift1.5-Qwen3.8-Flash-Next-Sushi-2.6bpw
- Runtime sushi: https://github.com/beamivalice/sushi
