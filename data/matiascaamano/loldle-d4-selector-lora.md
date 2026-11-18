# MatiasCaamano/loldle-d4-selector-lora

## Resumen

`loldle-d4-selector-lora` es un adaptador LoRA en formato MLX desarrollado por MatiasCaamano para el modelo base `mlx-community/Ministral-3-3B-Instruct-2512-4bit` (Ministral-3-3B-Instruct, cuantizado a 4 bits). No se trata de un modelo independiente, sino de un ajuste fino especializado que ocupa únicamente el rol de "Selector" dentro de un sistema multiagente de tres componentes (Memoria → Selector → Verificador) diseñado para jugar a LoLdle Classic, un juego de adivinación basado en el roster de campeones de League of Legends.

El adaptador resuelve un problema muy concreto detectado en la iteración anterior del proyecto (Entregable 3): el Selector descartaba en repetidas pasadas al campeón secreto cuando el estado de restricciones de Memoria contenía pistas amarillas de un solo valor (por ejemplo, `positions [["Middle"]]` o `regions [["Ionia"]]`). En la prueba del D3, 4 de las 5 partidas detenidas presentaban este fallo, conservando solo 13 de 58 filas compatibles. Este LoRA se entrena específicamente para corregir ese sesgo sobre páginas de 25 filas del roster.

El modelo es relevante como ejemplo de ajuste fino paramétricamente eficiente (LoRA sobre pesos de 4 bits) aplicado a una tarea de razonamiento restringido con salida JSON estructurada, ejecutado íntegramente en hardware de consumo (Apple M5 Pro, 64 GB). Su ámbito de aplicación es deliberadamente estrecho: un formato fijo, un roster fijo de 173 campeones y un prompt de sistema concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre transformer decoder-only (Ministral-3-3B-Instruct, pesos 4-bit) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos base en 4 bits (MLX); adaptador en safetensors |
| Idiomas soportados | es, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`adapters.safetensors`, MLX) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Ministral-3-3B-Instruct-2512 cuantizado a 4 bits mediante MLX. La configuración LoRA emplea rango 16, escala 20, dropout 0,05, aplicada sobre 12 capas, con `mask_prompt`, lote 1 y acumulación de 4, usando `mlx-lm` 0.31.3 sobre un Apple M5 Pro de 64 GB. El entrenamiento se realizó en dos rondas secuenciales: la ronda 1 parte del adaptador común del Entregable 3 (`d3_paginas_cot3`) con lr 2e-5, detenida en la iteración 1050 (se usa el paso 1000); la ronda 2 parte de ese paso con lr 1e-5 cosine durante 1340 iteraciones (1 h 52 min), semilla 4042. El archivo final corresponde al término de la ronda 2, seleccionado únicamente mediante validación (`checkpoint_selection.json`).

Los datos de entrenamiento se generaron con el motor del juego: la ronda 1 aporta 2503 ejemplos sobre 128 secretos de entrenamiento y la ronda 2 aporta 1340 ejemplos de los mismos secretos, concentrados en los casos difíciles de amarillos en `positions` y `regions`. Las etiquetas se calcularon con las reglas del juego sobre el feedback público, sin intervención de ningún modelo de lenguaje. Se sobrerrepresentan deliberadamente las páginas con amarillos de un solo valor y las filas que son subconjunto estricto de la cláusula. La validación de pérdida usa 95 ejemplos de 15 secretos de validación, y ningún secreto de validación o prueba aparece en entrenamiento.

## Capacidades

- Generación de veredictos por fila del roster: produce «Nombre ok» o «Nombre x campo» para cada una de las 25 filas de una página.
- Salida JSON estructurada que continúa el prefijo `{"action":"listar","revision":`, con la lista de filas compatibles.
- Razonamiento sobre restricciones lógicas del juego: verdes, grises, amarillos, año y usados, junto con nombres excluidos.
- Manejo específico de amarillos de un solo valor en los campos `positions` y `regions`, el fallo objetivo del entrenamiento.
- Capacidad multilingüe heredada del modelo base (es, en), aunque la tarea es esencialmente simbólica.
- No cubre las funciones de Memoria ni de Verificador; es un componente aislado del sistema.
- No dispone de tool calling ni de modo thinking documentados en la información disponible.

## Casos de uso

- Agente Selector en el sistema LoLdle de tres agentes: el adaptador se invoca exclusivamente en este rol, recibiendo el estado de restricciones de Memoria y una página de 25 filas, y devolviendo el JSON de filas compatibles. Es su uso previsto y el único documentado.
- Investigación sobre razonamiento restringido con salida estructurada: sirve como banco de pruebas para estudiar cómo un LoRA de rango 16 corrige sesgos sistemáticos de un modelo de 3B en tareas de filtrado lógico con reglas fijas.
- Evaluación de pipelines multiagente: permite aislar el rendimiento de un componente concreto (el Selector) manteniendo constantes Memoria y Verificador, facilitando el análisis de ablaciones.
- Reproducción de resultados académicos: el adaptador, con SHA-256 verificado, reproduce los resultados de `results/d4/` del repositorio del proyecto del curso 580694, lo que lo hace útil para validación experimental.
- Desarrollo de sistemas de filtrado con restricciones jerárquicas: el patrón (estado de restricciones + página de candidatos → veredicto JSON) es trasladable a dominios como selección de productos, matching de registros o cribado de candidatos con reglas duras.
- Despliegue local en Apple Silicon: al ejecutarse con `mlx_lm.server` sobre un M5 Pro, permite experimentar con agentes especializados sin GPU dedicada ni servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona únicamente métricas internas del proyecto (13 de 58 filas compatibles conservadas por el Selector del D3 en los casos problemáticos) y remite a `results/d4/` del repositorio del proyecto para los resultados finales, sin cifras concretas en la información proporcionada.

## Requisitos de hardware

- VRAM/memoria unificada: el modelo base en 4 bits ocupa aproximadamente 2 GB; el adaptador añade un tamaño de repositorio de 0,1 GB. El entrenamiento se realizó en un Apple M5 Pro con 64 GB de memoria unificada.
- GPU recomendadas: no se documentan requisitos para GPU discretas; el stack es MLX, orientado a Apple Silicon.
- Compatibilidad con GPU de consumo: no disponible para CUDA/NVIDIA en la información proporcionada; en Apple Silicon se ejecuta en memoria unificada.
- Opciones de despliegue: `mlx_lm.server` (versión 0.31.3) con el parámetro `adapters` por petición; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| loldle-d4-selector-lora (este) | adaptador sobre 3B | no disponible | LoRA MLX especializado | apache-2.0 | Hugging Face |
| Ministral-3-3B-Instruct-2512-4bit (base) | 3B | no disponible | transformer 4-bit | no disponible en la informacion | Hugging Face (mlx-community) |
| d3_paginas_cot3 (adaptador previo) | adaptador sobre 3B | no disponible | LoRA MLX | no disponible en la informacion | repositorio del proyecto |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: funciona únicamente con un formato y un roster fijos de 173 campeones; no generaliza a otros juegos ni a otros conjuntos de datos.
- No mejora a Memoria ni al Verificador; su ámbito se limita al agente Selector.
- Dependencia del prompt de sistema exacto (`prompt_selector.txt`) y del formato de estado de Memoria; cambios en cualquiera de los dos pueden degradar el comportamiento.
- Riesgo de alucinación en la generación del JSON: al ser un modelo de lenguaje, puede producir veredictos inconsistentes con las reglas si la entrada se desvía del formato de entrenamiento.
- Sesgos de distribución: el entrenamiento sobrerrepresenta páginas con amarillos de un solo valor y filas subconjunto estricto de la cláusula, lo que puede sesgar el comportamiento en distribuciones distintas.
- Licencia apache-2.0 permite uso comercial, pero la utilidad práctica fuera del proyecto es marginal y no se documentan garantías de calidad.
- Requiere `mlx-lm` 0.31.3 y hardware Apple Silicon; no hay soporte documentado para otros backends.
- Sin datos publicados de benchmarks ni de latencia; no recomendable para producción sin evaluación propia.

## Enlaces

- Hugging Face: https://huggingface.co/MatiasCaamano/loldle-d4-selector-lora
- Modelo base: https://huggingface.co/mlx-community/Ministral-3-3B-Instruct-2512-4bit
- Repositorio del proyecto (referenciado en la model card, sin URL explícita): no disponible
- Paper, blog o demo adicionales: no disponible
