# shebxyd/Kaze-Phi4-MoE-MIT

## Resumen

Kaze-Phi4-MoE-MIT es un modelo derivado de `microsoft/Phi-4-mini-instruct` (3.837B parámetros, licencia MIT) publicado por el usuario shebxyd. Aplica una técnica de *sparse upcycling* sin pérdida sobre el modelo base: mantiene íntegro el transformer original (denominado capa HOT, congelada en RAM) y añade seis expertos enrutados por capa con un `top_k = 2`, gestionados mediante una arquitectura de memoria Hot/Warm/Cold pensada para *streaming* desde almacenamiento UFS en el ecosistema Proyecto Kofu (`Kofu_Mobile`).

El objetivo declarado es habilitar inferencia tipo MoE en dispositivos de borde con recursos limitados: los expertos (75.5M parámetros totales, 152.2 MB en BF16 o ~45.3 MB en Q4_K_M) pueden residir en almacenamiento UFS y cargarse bajo demanda, mientras que el modelo base permanece residente en RAM cuantizado a Q4_K_M (~2.30 GB). El enrutamiento usa routers lineales por capa con una pérdida auxiliar libre de balanceo, y la distribución de uso de expertos reportada es `[15.8%, 17.7%, 17.8%, 16.7%, 15.4%, 16.6%]` con desviación de ±1.3%.

Es relevante ahora porque propone un patrón de despliegue (modelo denso congelado + expertos ligeros en almacenamiento) que reduce el coste de memoria de un MoE en dispositivos móviles, aunque se trata de un artefacto muy reciente (creado el 2026-11-20), con cero descargas y sin benchmarks estándar publicados más allá de una prueba de presión interna de 10 tests.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Phi-4-mini-instruct) con sparse upcycling: 6 expertos enrutados por capa, `top_k = 2`, routers lineales por capa, partición Hot/Warm/Cold |
| Parametros totales | 3.837B (modelo base HOT) + 75.5M (6 expertos × 32 capas, WARM/COLD) |
| Parametros activos | No disponible (el autor no publica el cómputo activo por token; con `top_k = 2` sobre 6 expertos se activan 2 expertos por capa además del tronco denso) |
| Longitud de contexto | No disponible de forma explícita; se reporta una prueba de "aguja en pajar" a 1.597 tokens, no el máximo soportado |
| Tipos de cuantizacion | BF16 (expertos y routers), Q4_K_M (modelo base y expertos, según el autor) |
| Idiomas soportados | Español (es), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (`kaze_phi4_moe_routed_experts.safetensors`, BF16) + `hot_warm_cold_manifest.json` |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/Phi-4-mini-instruct`, un transformer denso de 3.837B parámetros. Sobre él se aplica *sparse upcycling*: se añaden seis expertos enrutados por capa (32 capas), cada uno con un cuello de botella de dimensión 64, sumando 75.5M parámetros totales. El enrutamiento se realiza con routers lineales por capa y `top_k = 2`, con una estrategia de balanceo *Aux-Loss-Free* cuya distribución de uso verificada es `[15.8%, 17.7%, 17.8%, 16.7%, 15.4%, 16.6%]` (desviación ±1.3%). El autor describe el proceso como "sin pérdida" respecto al modelo base, y reporta 0% de olvido catastrófico en su batería de pruebas.

La innovación principal es la partición de memoria en tres niveles: HOT (modelo base congelado en RAM, ~2.30 GB en Q4_K_M, más los routers), WARM (expertos en RAM gestionados por LRU) y COLD (expertos en almacenamiento UFS con *streaming* bajo demanda). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO para los expertos añadidos.

## Capacidades

- Generación de texto en español e inglés, heredada del modelo base Phi-4-mini-instruct.
- Razonamiento y matemáticas: la prueba de presión reporta 4/5 (80%) en aritmética y finanzas con 0 alucinaciones.
- Generación de código Python ejecutable: 4/4 (100%) en tests con `exec` y `assert`.
- Manejo de contexto moderado: 1/1 en prueba de aguja en pajar a 1.597 tokens, con pico de VRAM de +364 MB por KV-cache.
- Enrutamiento de expertos con balanceo Aux-Loss-Free verificado.
- Despliegue en dispositivos de borde mediante streaming UFS (Hot/Warm/Cold).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles (el pipeline es text-generation).

## Casos de uso

- Asistentes en dispositivos móviles de gama media: el modelo base cabe en ~2.30 GB de RAM en Q4_K_M y los expertos (~45.3 MB en Q4_K_M) se pueden transmitir desde UFS, lo que permite desplegar un MoE en hardware con memoria limitada sin cargar todos los pesos a la vez.
- Generación de código en herramientas de desarrollo locales: la prueba interna reporta 4/4 en código Python ejecutable, lo que lo hace adecuado para autocompletado y generación de scripts verificables en entornos de escritorio.
- Cálculo financiero y aritmética en aplicaciones de finanzas personales: el 80% en la prueba de aritmética y finanzas con 0 alucinaciones declaradas sugiere uso en tareas de cálculo acotado dentro de apps móviles.
- Procesamiento de documentos con contexto moderado: la prueba de aguja en pajar a 1.597 tokens con +364 MB de KV-cache indica viabilidad para resumir o extraer datos de documentos cortos en el dispositivo.
- Experimentación en investigación sobre sparse upcycling: el artefacto incluye el manifiesto de partición Hot/Warm/Cold y los pesos de routers y expertos, útil para estudiar enrutamiento y balanceo en modelos derivados de Phi-4-mini.
- Prototipado de arquitecturas de memoria jerárquica: el par safetensors + manifest permite reproducir el patrón HOT/WARM/COLD en otros pipelines de streaming desde almacenamiento.
- Aplicaciones bilingües español-inglés en el borde: al declarar ambos idiomas y heredar el modelo base, sirve para asistentes de chat o traducción ligera en dispositivos con RAM restringida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor solo reporta una prueba de presión interna de 10 tests automatizados no vistos:

| Prueba | Resultado |
|---|---|
| Código Python ejecutable (`exec` + `assert`) | 4 / 4 (100%) |
| Aritmética y finanzas (`Kofu_Mobile`) | 4 / 5 (80%), 0 alucinaciones |
| Contexto largo (aguja en pajar a 1.597 tokens) | 1 / 1 (100%), pico VRAM +364 MB KV-cache |
| Score total | 9 / 10 (90%) |
| Olvido catastrófico respecto al base | 0% |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: ~2.30 GB para el modelo base en Q4_K_M, más ~45.3 MB para los expertos en Q4_K_M (o 152.2 MB en BF16), más la KV-cache (pico reportado de +364 MB a 1.597 tokens).
- GPU recomendadas: no disponibles en la información proporcionada; el diseño apunta a dispositivos de borde con almacenamiento UFS más que a GPUs de centro de datos.
- Cabe en GPU de consumo: previsiblemente sí en GPUs con 4-8 GB de VRAM dada la huella en Q4_K_M, aunque el autor no publica requisitos oficiales ni lista de GPUs verificadas.
- Opciones de despliegue: el autor no especifica integración con vLLM, llama.cpp, Ollama o TGI; el artefacto se distribuye como safetensors BF16 más un manifiesto JSON para el runtime propietario del Proyecto Kofu (`Kofu_Mobile`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Kaze-Phi4-MoE-MIT | 3.837B + 75.5M (MoE upcycled) | No disponible (probado a 1.597 tokens) | MIT | Hugging Face (0 descargas) | Partición Hot/Warm/Cold para streaming UFS |
| microsoft/Phi-4-mini-instruct | 3.8B | No disponible en la información | MIT | Hugging Face | Modelo base denso, sin expertos |
| Alternativas MoE de borde | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparables verificados en la información proporcionada |

## Limitaciones y advertencias

- Modelo muy reciente (creado el 2026-11-20) con cero descargas y cero likes: no hay validación externa de su comportamiento.
- No se publican benchmarks estándar (MMLU, HumanEval, GSM8G); la única evidencia de rendimiento es una prueba de presión interna de 10 tests del propio autor.
- El contexto máximo real no está documentado; solo se verificó una aguja en pajar a 1.597 tokens.
- El número de parámetros activos por token no se especifica, lo que impide estimar con precisión el coste computacional real del enrutamiento.
- El despliegue parece ligado al runtime del Proyecto Kofu (`Kofu_Mobile`) y al manifiesto Hot/Warm/Cold; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Riesgo de alucinación: el autor declara 0 alucinaciones en 5 tests de aritmética y finanzas, una muestra demasiado pequeña para extraer conclusiones generales.
- Sesgos conocidos: no disponibles; se heredan los del modelo base Phi-4-mini-instruct, no documentados en esta ficha.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento originales.
- Al ser un upcycling de un modelo denso, el beneficio de eficiencia depende enteramente del runtime de streaming; sin él, la ventaja frente al modelo base no está demostrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shebxyd/Kaze-Phi4-MoE-MIT
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
