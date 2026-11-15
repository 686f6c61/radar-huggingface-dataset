# Imok282/lunar-terrain-diffusion

## Resumen

Lunar Terrain Diffusion (publicado bajo el nombre Adinfinitium Terrain Diffusion) es un modelo de difusión condicional desarrollado por el usuario Imok282 en el contexto del proyecto Adinfinitium, una iniciativa open source orientada al estudio de aterrizajes y navegación en la superficie lunar. El modelo aborda una tarea muy concreta: el relleno de huecos de altura del terreno entre puntos láser medidos por el instrumento LOLA (Lunar Orbiter Laser Altimeter) de la NASA, trabajando sobre parches de 64×64 píxeles con una resolución de 5 metros por píxel en la región del polo sur lunar.

Técnicamente se trata de una U-Net de denoising condicional (`DenoiseAttnUNet`) con 49.943.681 parámetros, bloques residuales, embeddings temporales y self-attention en las escalas más gruesas. El modelo se entrenó mediante un esquema de hide-and-check sobre píxeles efectivamente medidos por láser, y su checkpoint final (`terrain_diffusion_mini.pt`, 199.839.435 bytes) corresponde al paso 7.500 de 7.671.

La relevancia de esta ficha es doble. Por un lado, documenta un modelo experimental cuyo propio autor reconoce que el kriging clásico lo supera (0,97 m de RMSE frente a 2,01 m en sitios reservados), por lo que no se usa en producción. Por otro, la model card incluye un marco denominado Dream-RSI para auto-mejora offline con compuertas de regresión cero, cuyos resultados medidos se detallan más abajo y resultan de interés metodológico para quienes investigan bucles de auto-entrenamiento seguros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `DenoiseAttnUNet`: U-Net de denoising condicional con bloques residuales, time embedding y self-attention en escalas gruesas (base 128, depth 3, T 100, blocks 2, heads 8, attn_levels 2) |
| Parametros totales | 49.943.681 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (opera sobre parches de 64×64 píxeles, no sobre secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen/terreno, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`); checkpoint `terrain_diffusion_mini.pt`, 199.839.435 bytes, id `1f647a8660`, sha256 `1a8bfbad…0e643` |

## Arquitectura y entrenamiento

El modelo es una U-Net de difusión condicional denominada `DenoiseAttnUNet`, configurada con anchura base 128, profundidad 3, 100 pasos de difusión (T 100), 2 bloques por nivel, 8 cabezas de atención y self-attention en 2 niveles de escala. La tarea es de regresión espacial: predecir alturas de terreno en píxeles ocultos a partir de los píxeles observados, formulada como un proceso de denoising condicionado.

El entrenamiento se realizó sobre datos del polo sur lunar derivados de NASA LRO LOLA a 5 m/píxel, y se completaron 7.671 de los 8.000 pasos previstos, con el mejor checkpoint en el paso 7.500. El autor indica que el modelo se entrenó únicamente sobre píxeles medidos por láser mediante un esquema de hide-and-check: se ocultan píxeles realmente observados y se evalúa la capacidad de reconstrucción. No se documentan en la información disponible el volumen total de tokens ni la composición detallada del dataset, ni si hubo fases de RLHF o DPO (no aplicables a este dominio).

Como innovación metodológica destacable, la model card describe Dream-RSI, un procedimiento de auto-mejora offline con cuatro fases: localizar fallos mediante vuelos o repeticiones de misiones, generar escenarios difíciles con refuerzo de fallos y reentrenar un candidato con warm-start, evaluar el candidato en un examen de validación congelado y aceptar solo si no hay regresiones (en el caso del lander) o si la métrica de validación mejora por un margen (planner y rover). Los mapas de test y el sitio del examen final nunca se usan en Dream-RSI.

## Capacidades

- Relleno de huecos de altura del terreno en parches de 64×64 píxeles a 5 m/píxel, condicionado a los píxeles láser observados.
- Generación de superficies plausibles en la región del polo sur lunar a partir de datos LOLA.
- Estimación de incertidumbre mediante bandas de confianza calibradas con split-conformal (escala 8,232 ajustada solo en Site11).
- Etiquetado explícito de las salidas como GENERATED – NOT OBSERVED, lo que permite distinguir datos sintéticos de mediciones reales en pipelines downstream.
- Integración con el marco Dream-RSI para auto-mejora offline con compuertas de regresión cero.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo de difusión de imagen/terreno, no un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá del terreno.

## Casos de uso

- Investigación en relleno de huecos de datos de elevación lunar: el modelo permite estudiar hasta qué punto un denoiser de difusión puede reconstruir alturas entre pistas láser, sirviendo como referencia frente a métodos clásicos como el kriging.
- Benchmarking de métodos geoestadísticos: al publicar RMSE por sitio (Site23, Site42 y seis sitios frescos), el modelo sirve como baseline reproducible para comparar interpoladores lineales, kriging y aproximaciones neuronales.
- Docencia y divulgación sobre difusión condicional aplicada a datos científicos: la U-Net con time embedding y self-attention en escalas gruesas es un ejemplo compacto (≈50 M de parámetros) para explicar difusión en un dominio no textual.
- Estudio de calibración de incertidumbre: la model card documenta el fracaso de la banda raw 5–95% (21,9% / 37,3% de cobertura) y la corrección mediante split-conformal (84,9% / 96,9%), lo que lo convierte en un caso práctico para investigar calibración.
- Prototipado de planificación de aterrizaje en simulación: aunque el autor lo declara no apto para vuelo, el modelo puede alimentar simuladores de sitios de aterrizaje en el polo sur para estudiar la robustez de planificadores frente a terreno generado.
- Investigación sobre auto-mejora offline: el marco Dream-RSI asociado permite reproducir bucles de reentrenamiento con compuertas de regresión cero, con resultados medidos por loop (planner, lander, rover) que sirven de referencia metodológica.
- Generación de datos sintéticos etiquetados para aumentar datasets de entrenamiento de otros modelos de percepción lunar, siempre que se respete la etiqueta GENERATED – NOT OBSERVED y no se confundan con observaciones.

## Benchmarks y rendimiento

RMSE en alturas láser ocultas (hide-and-check), en metros; menor es mejor:

| Sitio | Kriging | Red de difusión | Backup antiguo de gap-fill |
|---|---|---|---|
| Site23 | 0,94 | 1,83 | 17,92 |
| Site42 | 1,11 | 2,80 | no disponible |
| Seis sitios frescos | 0,97 | 1,62 | no disponible |

Cobertura de la banda de incertidumbre:

| Métrica | Site23 | Site42 |
|---|---|---|
| Banda raw 5–95% | 21,9% | 37,3% |
| Tras split-conformal (escala 8,232 ajustada en Site11) | 84,9% | 96,9% |
| Anchura de banda calibrada | 7,06 m | 15,51 m |

Resultados medidos del marco Dream-RSI (por loop):

| Loop | Rondas aceptadas | Efecto en la métrica de su compuerta |
|---|---|---|
| Planner (PlannerSetNet) | 1 de 5 | Brier de validación 0,01543 → 0,01353 (−12,3%) |
| Lander pilot (compuerta Site11, 1.024 misiones emparejadas) | 0 de 7 | Sin cambios; cada candidato perdió 12–25 misiones |
| Rover brain v3.1 | 9 de 36 | Ruta bloqueada mejorada en 4/4 sitios, luz tardía 3/4, paneles polvorientos 1/4, luz temprana 0/4 |
| Rover brain v3 | 9 de 72 | Ruta bloqueada mejorada en 6/6 sitios, paneles polvorientos 2/6 |
| Rover learned driver v2 | 5 de 38 | Tasa de retorno mantenida en 0,0% |

Agregado: 18 de 42 primeras rondas aceptadas frente a 6 de 120 rondas posteriores. Proyecciones del autor (no medidas): Brier del planner 0,0145 → 0,0094 [0,0043, 0,0145] tras 20 generaciones adicionales; en escenario, error de terreno 2,01 → 1,84 m, F1 de hazard fresco 0,757 → 0,779 y error de luz 0,450° → 0,410°.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 49,9 M de parámetros y pesos en fp32 (checkpoint de ≈200 MB), la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU moderna (RTX 3060 en adelante) es suficiente. Para entrenamiento o ejecución de los bucles Dream-RSI se requiere más capacidad, no cuantificada en la model card.
- Cabe en GPU consumer: sí, con margen amplio, dado el tamaño del checkpoint (199.839.435 bytes).
- Opciones de despliegue: el código de proyecto se distribuye vía el repositorio `oasisk/adinfinitium-handoff`, con módulos `worldmodel.terrain.model.load_checkpoint` y `worldmodel.terrain.generate.generate_versions`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / resolución | RMSE (sitios reservados) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Lunar Terrain Diffusion (Imok282) | U-Net de difusión condicional | 49,9 M | Parches 64×64 px a 5 m/px | 2,01 m (red) | Apache-2.0 | Hugging Face |
| Kriging (método clásico) | Geoestadística | no aplica | no aplica | 0,97 m | no aplica | Implementaciones estándar |
| Interpolación lineal | Método clásico | no aplica | no aplica | Mejor que la red según el autor (sin cifra publicada) | no aplica | Implementaciones estándar |
| Backup antiguo de gap-fill | Método previo del proyecto | no disponible | no disponible | 17,92 m (Site23) | no disponible | Interno del proyecto |

No se dispone de otros modelos de difusión públicos comparables específicos para relleno de terreno lunar en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento inferior al kriging: siete de nueve métodos clásicos, incluida la interpolación lineal simple, superan a la red en ambos sitios reservados; una combinación ajustada le asigna un peso de 0,0064.
- El protocolo de test favorece la interpolación porque los píxeles ocultos están junto a píxeles mostrados; los huecos anchos no se probaron para ninguno de los dos métodos.
- La banda de incertidumbre calibrada es ancha y desigual: 6 de 19 ventanas quedan fuera de la cobertura del 80–97%, y no existe garantía formal.
- La banda raw 5–95% falla claramente (21,9% y 37,3% de cobertura en Site23 y Site42).
- El modelo no está cableado a nada downstream ("read by nothing downstream"): es un experimento aislado, no un componente de producción.
- Uso previsto restringido a investigación, educación y benchmarking de métodos de navegación en sitios de aterrizaje lunar; no apto para vuelo, decisiones operativas ni aplicaciones de seguridad crítica.
- Todos los resultados son de simulación o de sitios lunares reservados, no de rendimiento en misión real.
- El marco Dream-RSI tiene compuertas estrictas que rechazan candidatos globalmente mejores (mejor caso del lander: 991 frente a 990 aterrizajes) y rondas de entrenamiento cortas (4–5 actualizaciones) por presupuesto de cómputo.
- No se documentan sesgos en el sentido de modelos lingüísticos, pero sí un sesgo de dominio: el modelo está especializado en el polo sur lunar a 5 m/px y no se ha validado en otras regiones ni resoluciones.
- Licencia Apache-2.0: permite uso comercial, pero el autor desaconseja explícitamente el uso operativo o de seguridad crítica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Imok282/lunar-terrain-diffusion
- Código del proyecto: https://github.com/oasisk/adinfinitium-handoff
- Referencia de datos: NASA LRO LOLA (Lunar Orbiter Laser Altimeter), 5 m/píxel (sin enlace directo en la información disponible)
- Contexto del evento: NASA Space Apps (etiqueta `space-apps` en el modelo; sin enlace específico en la información disponible)
