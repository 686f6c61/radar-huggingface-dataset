# jrubiosainz/microduck-tug-cup2l1-c23b073f

## Resumen

Microduck Tug of War - cup2l1 (L1) es una política de control para robótica entrenada para la tarea de "tug of war" (tira y afloja) dentro del ecosistema de simulación Microduck, impulsado por Pollen Robotics. El modelo lo publica el usuario jrubiosainz en Hugging Face y se distribuye como un grafo ONNX de apenas 898.372 bytes, pensado exclusivamente para ejecución en simulación y no para despliegue en un robot físico. Se trata de una composición de tablas de búsqueda (lookup tables) sobre una red neuronal upstream, no de un transformer de lenguaje.

La relevancia del modelo es acotada y muy específica: forma parte de la "Microduck Arena", un entorno competitivo de simulación donde distintas políticas compiten por arrancar terreno al oponente. L1 combina la red de self-play de lphatnguyen con filas de tabla de greecree y Unique007, sustituyendo únicamente las filas 208-277 (semilla oficial 4) por filas propias reoptimizadas. No es un modelo de propósito general ni un LLM: es un artefacto de control con procedencia trazable a nivel de fila.

Por tanto, esta ficha describe un modelo de robótica simulado de nicho, sin benchmarks de lenguaje, sin capacidades multilingües y sin licencia declarada. Su interés radica en la metodología de composición sellada y verificación criptográfica (SHA256), más que en capacidades cognitivas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de control con tablas de búsqueda (lookup tables) embebidas en ONNX; no es un transformer |
| Parámetros totales | no disponible (pesos distribuidos como inicializadores de tabla; tamaño del artefacto 898.372 bytes) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control por pasos de simulación) |
| Tipos de cuantización | no disponible (se distribuye como ONNX; el modelo base figura como quantized) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible (el autor declara explícitamente que no se reclama licencia alguna) |
| Formato de pesos | ONNX (policy.onnx) y table.npz como datos de replay diagnóstico |

## Arquitectura y entrenamiento

La política se compone de una red neuronal upstream (la red de self-play de liga de lphatnguyen, con su normalizador y lógica de lookup) más tablas de inicializadores `table_obs`/`table_act`. La modificación respecto al upstream afecta únicamente a las filas 208-277 de esas tablas, correspondientes a la semilla oficial 4, que se sustituyen por filas P1c propias. Según la evidencia de composición sellada, hay 2.188 bytes modificados, todos dentro de esos inicializadores. Las filas 0-49 de la semilla 4 conservan la ascendencia v11/dat-v4, y las filas 50-69 son una cola `h7s_s4r` reoptimizada.

El entrenamiento subyacente proviene de los modelos base: self-play de liga (lphatnguyen), filas públicas de tug-super-v11 y ascendencia seed-4 de tug-super-v9 (greecree), y bouts y CMA de tug-dat-v4 (Unique007). No se documentan en la información disponible el número de tokens, la composición del dataset ni el uso de RLHF/DPO, ya que no se trata de un modelo de lenguaje. La innovación destacable es la trazabilidad a nivel de fila y la verificación mediante recibos SHA256 y reconstrucción desde upstream público fijado.

## Capacidades

- Control de política para la tarea de tug of war en simulación Microduck.
- Ejecución determinista por pasos de simulación (347 pasos registrados en el replay nativo, todos ellos "table hits").
- Composición de tablas con procedencia a nivel de fila (semillas oficiales 1, 2, 3, 4 y 5).
- Replay diagnóstico mediante `table.npz` (la política ONNX usa sus inicializadores embebidos y no carga ese fichero).
- Verificación criptográfica de integridad (SHA256 de la política y del recibo de rating).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Investigación en la Microduck Arena: evaluar políticas de tug of war en simulación y comparar el rendimiento de la composición L1 frente a controles upstream (lph2, v11).
- Reproducción de resultados: reconstruir la política desde el upstream público fijado y el patch kit, verificando la coincidencia de vectores y los 23/23 veredictos por invitado x86.
- Auditoría de procedencia: usar el recibo sellado y la evidencia de composición para verificar qué filas provienen de qué ancestro (lphatnguyen, greecree, Unique007, jrubiosainz).
- Estudio de metodologías de composición de tablas: analizar cómo la sustitución de un subconjunto de filas (208-277) afecta al comportamiento sin reentrenar la red completa.
- Replay diagnóstico: ejecutar `table.npz` para inspeccionar las tablas y comparar con los inicializadores embebidos en el ONNX.
- Docencia y divulgación sobre verificación de artefactos: ejemplo de sellado criptográfico y procedencia a nivel de fila en modelos de robótica simulada.

## Benchmarks y rendimiento

Replay nativo x86 (no es un resultado de Arena), runner oficial 5, comando `vx -0.3`:

| Semilla | Resultado | Terreno ganado (cm) |
|---|---|---:|
| 1 | pit_won | 169,02583241462708 |
| 2 | pit_won | 169,0681517124176 |
| 3 | pit_won | 168,44393014907837 |
| 4 | pit_won | 169,40542459487915 |
| 5 | pit_won | 168,53023171424866 |
| Media | cinco semillas oficiales | 168,89471411705017 |

Todos los 347 pasos fueron "table hits"; el uso de fallback y los "bad hits" fueron cero. Este replay de rating no ejercita la red de fallback. Los controles upstream lph2 y v11 reprodujeron sus vectores públicos.

Registro de enfrentamientos (100 partidas cada uno, mediciones internas en Mac, no pruebas nativas x86 ni resultados de Arena):

| Oponente | Registro |
|---|---|
| suraj | 100-0 |
| Hlib | 100-0 |
| GinDuck | 99-1 |
| titan-v2 | 90-10 |
| greecree | 99-1 |
| rumezhak | 99-1 |
| X1 | 87-13 |
| lph2 | 50-50 |

La evidencia c14lite de Tug en Mac indica que L1 y lph2 son idénticos bout a bout en 800 bouts emparejados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto ONNX ocupa 898.372 bytes, por lo que el requisito de memoria es mínimo y no se publica una cifra formal.
- GPU recomendadas: no disponible; no se documentan GPU concretas (A100, H100, RTX 4090, etc.).
- ¿Cabe en GPU de consumo? El tamaño del artefacto sugiere que sí, pero no se confirma en la información disponible.
- Opciones de despliegue: ejecución del grafo ONNX con un runtime compatible (no se especifica vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-tug-cup2l1 (L1) | Política ONNX + tablas | no disponible (898.372 bytes) | no aplica | Media 168,89 cm en 5 semillas; 50-50 vs lph2 | no disponible | Hugging Face |
| lphatnguyen/microduck-tug-of-war-v2 | Política upstream | no disponible | no aplica | Control de referencia; idéntico a L1 en 800 bouts (c14lite) | no disponible | Hugging Face |
| greecree/microduck-tug-of-war-tug-super-v11 | Política upstream | no disponible | no aplica | Filas públicas y ascendencia seed-4 aportadas a L1 | no disponible | Hugging Face |
| Unique007/microduck-tug-dat-v4 | Política upstream | no disponible | no aplica | Bouts y CMA aportados a L1 | no disponible | Hugging Face |

## Limitaciones y advertencias

- Solo simulación: el autor indica explícitamente que no debe desplegarse en un robot físico.
- Licencia no declarada: el autor no reclama licencia alguna y no se identifica ningún componente con licencia Apache separada en el conjunto distribuido; el uso comercial queda sin marco legal claro.
- Los resultados de enfrentamientos son mediciones internas en Mac, no pruebas nativas x86 ni resultados de Arena, y no garantizan comportamiento frente a oponentes posteriores.
- El replay de rating no ejercita la red de fallback, por lo que su comportamiento en ese camino no está cubierto por la evidencia presentada.
- No se transfiere ninguna afirmación de PASS de reglas congeladas X1/R3 a este candidato.
- Al ser una política de control y no un modelo de lenguaje, no tiene capacidades de generación de texto, código, matemáticas, visión ni multilingües; no procede evaluar sesgos o alucinación en el sentido habitual.
- No se documentan sesgos conocidos ni limitaciones de contexto o idioma en la información disponible.
- La reproducibilidad depende de fijar correctamente el upstream y el patch kit; cualquier desviación invalida la comparación con los vectores publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jrubiosainz/microduck-tug-cup2l1-c23b073f
- Modelo base lphatnguyen/microduck-tug-of-war-v2: https://huggingface.co/lphatnguyen/microduck-tug-of-war-v2
- Modelo base greecree/microduck-tug-of-war-tug-super-v11: https://huggingface.co/greecree/microduck-tug-of-war-tug-super-v11
- Modelo base Unique007/microduck-tug-dat-v4: https://huggingface.co/Unique007/microduck-tug-dat-v4
- Perfil de lphatnguyen: https://huggingface.co/lphatnguyen
- Perfil de greecree: https://huggingface.co/greecree
- Perfil de Unique007: https://huggingface.co/Unique007
- Perfil de HlibPlakhtii: https://huggingface.co/HlibPlakhtii
- Pollen Robotics (Microduck, microduck_rl y Arena oficial): https://huggingface.co/pollen-robotics
