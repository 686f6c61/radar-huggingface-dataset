# ChonkE/Glitter_Boy-2-MoE

## Resumen

Glitter_Boy-2-MoE es un artefacto de investigación publicado por el usuario ChonkE en HuggingFace. Se trata de una derivación Mixture-of-Experts (MoE) del modelo denso Glitter_Boy-2.0, orientado a juegos de rol (roleplay, TTRPG), conversación y contenido sin filtros (uncensored). El modelo denso base se mantiene congelado como columna vertebral compartida, y se le añaden 7 expertos enrutados pequeños sobre 11 de sus 48 capas, con un router top-1 por token.

El problema que aborda es la especialización por dominios sin multiplicar el coste de cómputo: los expertos se entrenaron sobre porciones enrutadas de datos de matemáticas, ciencia, derecho, finanzas, código, lenguaje y análisis del dataset Morpho-72B-MoE-Data (Apache-2.0), mezcladas con salidas propias del modelo base y "floor anchors" escritas por el operador. El resultado total pesa 13.043.057.456 parámetros, aunque el coste activo por token crece solo un 1,3% respecto al base.

No es un sustituto directo de Glitter_Boy-2.0: carece de entrenamiento de seguridad, requiere un cargador personalizado (incluido en el repo) y, según la propia model card, sacrifica unos 2,8 puntos de MMLU a cambio de +5 puntos en su sonda de mecánicas de RPG. Está pensado como material de investigación sobre upcycling de modelos densos a MoE, no como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Glitter_Boy-2.0, derivado de Gemma) + expertos MoE añadidos |
| Parametros totales | 13.043.057.456 (13,04 B) |
| Parametros activos | Base + 1 experto por token (+1,3% sobre el base, independiente del numero de expertos); expertos: 1,135 B totales (162 M/experto) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF), 4-bit nf4 (backbone congelado en la version transformers) |
| Idiomas soportados | Ingles (en) |
| Licencia | Gemma |
| Formato de pesos | GGUF (gb2moe-q8_0.gguf, 12,9 GB); safetensors/estado MoE (moe_state.pt); tamano del repo: 20,7 GB |

## Arquitectura y entrenamiento

La arquitectura sigue la formula `output = shared_frozen_GB2(x) + gate * expert(x)`: el modelo denso Glitter_Boy-2.0 (derivado de Gemma-4-12B) permanece congelado en 4-bit nf4 como sustrato compartido, y se añaden 7 expertos enrutados con intermedio de 1280 (frente a los 15360 del base) en las capas 8, 11, 14, 17, 20, 23, 26, 29, 32, 35 y 38 de un total de 48. El enrutamiento es per-token top-1 con un router lineal, de modo que el coste de computo activo por token es plano con independencia del numero de expertos, mientras que la memoria crece 162 MB (Q8) por experto añadido, un perfil pensado para crecer por streaming desde SSD. Los expertos se entrenaron en bf16 y se guardaron en fp32.

El entrenamiento uso porciones enrutadas por dominio (matematicas, ciencia, derecho, finanzas, codigo, lenguaje, analisis) del dataset bluemorpholimited/Morpho-72B-MoE-Data (Apache-2.0), ponderadas junto con salidas propias de Glitter Boy 2.0 y "floor anchors" escritas por el operador en la mezcla principal. El numero de tokens de entrenamiento y el uso de tecnicas como RLHF o DPO no constan en la informacion disponible. Una innovacion destacable es el "lambda knob": un script (`expert_lambda_probe.py`) que permite escalar la puerta de cada experto (o globalmente) en tiempo de servicio sin reentrenar, aunque la model card se corta antes de detallar su uso completo.

## Capacidades

- Generacion de texto conversacional y roleplay, con enfoque en juegos de rol de mesa (TTRPG) y mecanicas de juego.
- Conocimiento de mecanicas RPG: 19/20 en la sonda propia "mech probe" (exact-match sobre 20 preguntas de mecanicas), por encima del base denso (18/20) y del Gemma-4-12B limpio (15/20).
- Razonamiento general y conocimiento: MMLU parcial (4 asignaturas, 884 items, 5-shot) con puntuacion total de 0,7206 en Q8.
- Cobertura de dominios entrenados: matematicas, ciencia, derecho, finanzas, codigo, lenguaje y analisis.
- Contenido sin filtros (uncensored): sin entrenamiento de seguridad, acepta las 24 filas del banco canonico de peticiones daniñas en Q8 (24/24 accept), lo cual es una caracteristica buscada por el autor y un riesgo serio para despliegue.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: limitadas al ingles segun los tags; no hay datos de otros idiomas.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Sistemas de juego de rol (TTRPG) como maestro o arbitro de reglas: la sonda de mecanicas (95% en Q8) indica que resuelve preguntas de reglas con mayor fiabilidad que el modelo base, util para asistentes de juego en mesa.
- Generacion de narrativa y roleplay interactivo: al ser un modelo conversacional uncensored derivado de una linea orientada a roleplay, sirve para campañas y personajes sin restricciones de contenido.
- Investigacion sobre upcycling denso-a-MoE: la model card documenta con detalle el metodo (backbone congelado + expertos pequeños + router top-1), util como referencia reproducible para experimentos de especializacion.
- Experimentacion con enrutamiento de expertos: la model card incluye mediciones re-measured del uso de expertos (reparto 6%-19% entre los 7 expertos sobre 73.968 tokens enrutados), material de estudio sobre coaliciones de expertos.
- Ajuste fino de comportamiento en inferencia sin reentrenar: el "lambda knob" permite escalar la contribucion de cada experto en tiempo de servicio, util para investigar el efecto de cada dominio.
- Ejecucion local en hardware de consumo: con 12,9 GB en Q8_0 cabe en GPUs de 16 GB o en configuraciones CPU+GPU mediante llama.cpp (fork chonkllama.cpp), adecuado para uso personal offline.
- Prototipado de modelos sin filtros para entornos controlados de investigacion: permite estudiar comportamientos de aceptacion de peticiones daniñas y artefactos de cuantizacion sobre ellos.

## Benchmarks y rendimiento

Sonda de mecanicas RPG (mech probe, exact-match, 20 preguntas, mismo harness Q8):

| Modelo | mech greedy |
|---|---|
| Gemma-4-12B limpio (base) | 15/20 (75%) |
| Glitter_Boy-2.0 @ Q8 | 18/20 (90%) |
| Glitter_Boy-2-MoE @ Q8 | 19/20 (95%) |

MMLU (4 asignaturas, 884 items, 5-shot, letter-scored):

| Asignatura | Base limpio (bf16) | 2.0 (bf16) | GB2-MoE @ Q8 |
|---|---|---|---|
| College CS | 0,8000 | 0,7200 | 0,7300 |
| HS biology | 0,8935 | 0,8903 | 0,8645 |
| HS mathematics | 0,5037 | 0,5333 | 0,5111 |
| US history | 0,8873 | 0,8039 | 0,7745 |
| Total | 0,7624 | 0,7489 | 0,7206 |

Bancos de comportamiento (mismo binario, temperatura 0 greedy, rule-scored, runtime Q8 GGUF):

| Banco | Glitter_Boy-2.0 @ Q8 | GB2-MoE @ Q8 |
|---|---|---|
| canonical-24 | 24/24 accept | 24/24 accept |
| decode-32 | 32/32 accept | 31 accept / 1 bucle (phys23) |
| physical-32 | 32/32 accept | 31 accept / 1 bucle (phys23) |
| mech-20 | 18/20 | 19/20 |

Lectura honesta del propio autor: el MoE sacrifica ~2,8 puntos de MMLU (sobre todo US history y biology) a cambio de +5 puntos en la sonda de mecanicas. Algunas "negativas" medidas en 4-bit son artefactos de cuantizacion que no se reproducen en Q8. No hay datos de MMLU completo, HumanEval, GSM8K ni otros benchmarks estandarizados en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: base 12,7 GB en Q8 + expertos 1,14 GB en Q8; el GGUF completo (Q8_0 base + Q8_0 expertos) ocupa 12,9 GB. En la ruta transformers con backbone nf4, la huella es menor en pesos pero el autor no da cifras exactas.
- GPUs recomendadas: no disponible de forma explicita; por tamaño, una GPU de 16 GB o superior (por ejemplo RTX 4090 de 24 GB) ejecuta el GGUF Q8 completo con holgura. En 12 GB seria ajustado con offload parcial.
- Consumer GPUs: si, el GGUF de 12,9 GB cabe integramente en una RTX 4090 o similar; con GPUs de 12 GB se requeriria offload de capas a CPU.
- Despliegue: requiere el fork chonkllama.cpp (`XxChonkExX/chonkllama.cpp`, rama `chonk-buffer`, commit `eda0e233a`), que añade la arquitectura `gemma4-moe` con nombres de tensor MoE estandar (`ffn_gate_inp`, `ffn_gate_exps`, `ffn_up_exps`, `ffn_down_exps`). En transformers necesita el cargador personalizado incluido en el repo. No hay soporte indicado para vLLM, TGI ni Ollama estandar. El GGUF se genera con `convert_gb2moe.py` a partir de `ChonkE/Glitter_Boy-2.0` + `moe_state.pt`.
- Latencia y throughput: no disponibles. El coste de computo activo por token es el del base + 1 experto (+1,3%), por lo que la latencia deberia ser cercana a la del modelo denso base.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Glitter_Boy-2-MoE | 13,04 B (1,135 B en expertos) | Denso congelado + 7 expertos top-1 en 11/48 capas | no disponible | Gemma | GGUF Q8 + safetensors, requiere fork de llama.cpp |
| Glitter_Boy-2.0 | no disponible (denso) | Transformer denso (base Gemma-4-12B) | no disponible | Gemma | HuggingFace, formato estandar |
| Gemma-4-12B (base limpio) | ~12 B | Transformer denso | no disponible | Gemma | Soporte estandar en llama.cpp, vLLM, etc. |

Frente a su modelo base (Glitter_Boy-2.0), el MoE mejora la sonda de mecanicas (19/20 vs 18/20) y empatan en el banco canonico en Q8, pero pierde ~2,8 puntos de MMLU. Frente al Gemma-4-12B limpio, gana claramente en mecanicas RPG (95% vs 75%) pero pierde en MMLU (0,7206 vs 0,7624). No hay datos comparativos con otros MoE de tamano similar (por ejemplo Mixtral) en la informacion disponible.

## Limitaciones y advertencias

- Sin entrenamiento de seguridad: el modelo acepta peticiones daniñas (24/24 en el banco canonico, incluidos explosivos, malware y contenido de acoso). Su uso conlleva un riesgo de daño real y probablemente viole las politicas de la licencia Gemma en despliegue publico.
- Etiquetado "not-for-all-audiences" y "uncensored": contenido potencialmente ofensivo o inapropiado.
- Riesgo de alucinacion: no disponible de forma cuantificada; el propio autor documenta una regresion de comportamiento (bucle de repeticion en la fila phys23 del banco de venenos en Q8).
- Degradacion de conocimiento general: -2,8 puntos de MMLU frente al modelo 2.0 en bf16, concentrada en US history y biology; el autor planea reentrenar con "anchors" mas fuertes.
- Artefactos de cuantizacion: en 4-bit transformers aparecen negativas y evasiones que no se reproducen en Q8; los dos runtimes no son intercambiables y los resultados dependen fuertemente de la cuantizacion.
- Requiere cargador personalizado o un fork de llama.cpp; no funciona con runtimes estandar sin modificaciones.
- Idioma: solo ingles segun los tags; rendimiento en castellano desconocido.
- Licencia Gemma: impone condiciones de uso propias de Google (aceptacion de la licencia, restricciones de uso comercial y de contenido); el caracter uncensored del modelo puede entrar en conflicto con las politicas de uso de Gemma.
- Contexto de investigacion: el propio autor lo define como artefacto de investigacion, no como reemplazo listo para produccion.
- Advertencia sobre mediciones: la primera version de los datos de enrutamiento de la model card contenia un bug de medicion; los numeros actuales son los re-measured.

## Enlaces

- Modelo: https://huggingface.co/ChonkE/Glitter_Boy-2-MoE
- Modelo base: https://huggingface.co/ChonkE/Glitter_Boy-2.0
- Dataset de entrenamiento: https://huggingface.co/datasets/bluemorpholimited/Morpho-72B-MoE-Data
- Fork de llama.cpp (chonkllama.cpp): https://huggingface.co/XxChonkExX/chonkllama.cpp (rama `chonk-buffer`, commit `eda0e233a`)
- Paper, demo o repositorio adicional: no disponible
