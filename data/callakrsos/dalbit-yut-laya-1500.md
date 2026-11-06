# callakrsos/dalbit-yut-laya-1500

## Resumen

Dalbit Yut Laya 1500 es un modelo de clasificación tabular para toma de decisiones especializado en Yutnori (윷놀이), el juego de tablero tradicional coreano. Lo desarrolla el usuario callakrsos como un fine-tuning de `convaiinnovations/laya`, un modelo base de 421 millones de parámetros. El modelo no genera texto libre: recibe una descripción textual del estado de la partida y una lista de movimientos legales candidatos, y devuelve la opción con mayor probabilidad de victoria a largo plazo.

El problema que resuelve es concreto: sustituir heurísticas codificadas a mano por una política aprendida que valore riesgos posicionales (ser capturado en el siguiente turno, entrar en atajos, apilar fichas propias) en lugar de limitarse a capturas codiciosas. Para ello se generó un dataset de 1.800 estados de decisión anotados por un profesor de Monte Carlo con rollouts paralelos, con más de 230.000 simulaciones de partidas completas.

Su relevancia es acotada pero instructiva: es un ejemplo de cómo destilar un profesor de búsqueda en un clasificador ligero que decide en unos 45 ms en una GPU de consumo, suficiente para integrarse en un juego web en tiempo real. La licencia MIT y el tamaño reducido lo hacen fácilmente reproducible como referencia para pipelines de RL aplicado a juegos de tablero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tuning de `convaiinnovations/laya`); se usa como clasificador de opciones |
| Parametros totales | 421.293.830 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors, 0,8 GB) |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `convaiinnovations/laya` y se ajusta como clasificador sobre representaciones textuales del estado del juego (State Representation v2). La entrada codifica el grafo de conexiones del tablero, las coordenadas, carriles y pilas de fichas, los resultados de tirada restantes (do, gae, geol, yut, mo, back-do), el resultado de cada movimiento candidato (llegada a meta, entrada en atajo, captura de ficha rival, apilamiento de ficha aliada) y un análisis de amenaza de captura del rival en el turno siguiente. Los detalles de la arquitectura interna del transformer base no se documentan en la información disponible.

El entrenamiento se realizó sobre 1.500 estados (más 300 de validación), equilibrados entre tres tableros: cuadrado estándar (456 estados, 30,4 %), octogonal con bucle (451, 30,1 %) y doble anillo complejo (593, 39,5 %). Las etiquetas no provienen de imitación de reglas, sino de un profesor de Monte Carlo con 8 hilos que simuló 128 rollouts aleatorios por cada acción legal candidata (más de 230.000 partidas). La tasa de desacuerdo con la heurística basada en reglas fue del 47,4 %, lo que indica que el profesor inyectó estrategia posicional que las reglas no capturaban. Se aplicó aumento de datos mediante barajado del orden de las opciones (a0–a3) para eliminar el sesgo de posición fija.

## Capacidades

- Clasificación de decisiones: dado un estado y hasta cuatro acciones legales, devuelve la opción con mayor probabilidad estimada de victoria.
- Predicción probabilística calibrada sobre las opciones (Brier multiclase de 0,0583), no solo una etiqueta dura.
- Razonamiento posicional a un turno: incorpora en la entrada el riesgo de captura por parte del rival en el siguiente turno.
- Manejo de tres topologías de tablero distintas (cuadrado, octogonal y doble anillo) con atajos y bifurcaciones.
- Comprensión de reglas específicas de Yutnori: resultados de tirada (incluido back-do), apilamiento de fichas y capturas.
- Soporte bilingüe en la documentación y en el formato de prompt (coreano e inglés).
- No soporta tool calling, function calling, agentes multi-paso, visión ni audio: su alcance es la clasificación de opciones en un juego concreto.
- Inferencia autónoma sin fallback: 0,0 % de errores o timeouts en la validación reportada.

## Casos de uso

- Oponente de IA en un juego web de Yutnori: el modelo decide en unos 45,7 ms en una RTX 3070, por debajo del umbral de percepción humana, lo que permite partidas fluidas en el navegador a través de un backend ligero. La aplicación `zaruous/dalbit-yut` ya lo integra.
- Sustitución de heurísticas codificadas a mano: al superar al AI basado en reglas (`chooseAIAction`) con un 70 % de victorias en tablero estándar, puede reemplazar lógica de decisión frágil sin reescribir el motor del juego.
- Docencia e investigación en RL aplicado: sirve como caso reproducible de destilación de un profesor de Monte Carlo en un clasificador pequeño, con dataset y métricas documentadas.
- Evaluación de estrategias: al devolver distribuciones de probabilidad calibradas, permite analizar qué movimientos son casi equivalentes y cuáles son claramente subóptimos en un estado dado.
- Prototipado rápido de agentes para juegos de tablero con topología de grafo: el esquema de representación de estado (grafo, carriles, atajos, amenazas) es reutilizable para otros juegos de recorrido.
- Benchmark de referencia para comparar políticas de búsqueda frente a políticas aprendidas en juegos tradicionales coreanos, donde apenas existen modelos públicos.
- Herramienta de análisis para jugadores: dado un estado, mostrar la jugada recomendada y su probabilidad estimada de victoria.

## Benchmarks y rendimiento

Resultados reportados por el autor contra el AI heurístico basado en reglas, con semillas 7001–7010 y asientos alternos.

| Modelo | Victorias globales | Tablero S | Tableros A/B |
|---|---|---|---|
| Base Laya sin ajustar | 21,0 % (21/100) | ~20 % | ~22 % |
| Piloto 100 estados | 45,0 % (18/40) | no disponible | 45,0 % (B: 60 %) |
| 500 estados, 3.ª iteración | 56,7 % (34/60) | 75,0 % (15/20) | 47,5 % (19/40) |
| 1.500 estados, época 2 | 61,7 % (37/60) | 65,0 % (13/20) | 60,0 % (24/40) |
| 1.500 estados, época 4 (final) | 51,7 % (31/60) | 70,0 % (14/20) | 42,5 % (17/40) |

| Métrica | Valor |
|---|---|
| Precisión en validación (300 estados no vistos) | 57,00 % |
| Brier score multiclase | 0,0583 |
| Latencia de inferencia (RTX 3070) | 45,7 ms de media |
| Tasa de fallback | 0,0 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; no aplican a este modelo.

## Requisitos de hardware

- VRAM estimada: con 421 millones de parámetros en safetensors (0,8 GB en el repo), la inferencia en fp16 requiere del orden de 1 GB de VRAM; en fp32, unos 1,7 GB. No se documentan cuantizaciones GGUF ni versiones INT8/INT4.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. El autor reporta 45,7 ms por decisión en una RTX 3070.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU (el ejemplo de uso admite `device="cpu"`, aunque no se publica latencia en CPU).
- Opciones de despliegue: el autor usa `LayaPipeline` del paquete `laya` con `from_pretrained`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y al ser un clasificador de opciones más que un generador, los servidores de inferencia estándar no encajan directamente.
- Throughput: no disponible más allá de la latencia por decisión reportada.

## Comparativa con modelos similares

No se conocen modelos públicos comparables especializados en Yutnori. La comparación más directa es contra el propio modelo base y la heurística del juego.

| Modelo | Parametros | Contexto | Rendimiento en Yutnori | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dalbit Yut Laya 1500 | 421 M | no disponible | 51,7–61,7 % vs heurística; 70 % en tablero S | MIT | Hugging Face |
| convaiinnovations/laya (base) | 421 M | no disponible | 21,0 % vs heurística | no disponible en la información | Hugging Face |
| AI heurístico `chooseAIAction` | no aplica (reglas) | no aplica | referencia (100 % frente a sí mismo) | no aplica | integrado en el juego |

## Limitaciones y advertencias

- Dominio muy restringido: solo decide entre acciones legales de Yutnori en las tres topologías de tablero entrenadas; no generaliza a otros juegos ni a generación de texto.
- Dataset pequeño: 1.500 estados de entrenamiento, con posible sobreajuste a las posiciones representadas; la precisión en validación (57 %) es modesta.
- Rendimiento variable entre épocas: la época 4 final (51,7 % global) rinde peor en tableros complejos que la época 2 (60,0 % en A/B), lo que sugiere inestabilidad en el ajuste y posible degradación por sobreentrenamiento.
- Muestra de evaluación reducida: las tasas de victoria se basan en 60 partidas, con intervalos de confianza amplios (por ejemplo, 14/20 en tablero S).
- Riesgo de alucinación de opciones: al ser un clasificador sobre opciones dadas, el riesgo se traslada a elegir una opción legal pero estratégicamente mala; no inventa acciones fuera de la lista, pero la calibración puede degradarse en estados fuera de distribución.
- Idiomas: solo coreano e inglés en la documentación y los prompts; no hay soporte para castellano en la interfaz del modelo.
- Licencia MIT: permite uso comercial y modificación, pero el modelo base `convaiinnovations/laya` debe verificarse por separado, ya que su licencia no se detalla en la información disponible.
- Sin datos de sesgos sociales: no se documentan evaluaciones de sesgo, aunque al operar sobre un juego de tablero el riesgo de daño es bajo.
- Dependencia del paquete `laya`: el ejemplo de uso requiere un pipeline específico; no hay garantía de compatibilidad con el ecosistema estándar de Transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/callakrsos/dalbit-yut-laya-1500
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Repositorio del juego: https://github.com/zaruous/dalbit-yut
- Demo jugable: https://zaruous.github.io/dalbit-yut/
