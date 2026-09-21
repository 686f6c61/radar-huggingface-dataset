# chorcat/rukh-qwen3-pgn-qlora

## Resumen

`chorcat/rukh-qwen3-pgn-qlora` es un adaptador QLoRA que ajusta el modelo base `Qwen/Qwen3-0.6B` (600.637.440 parametros) sobre partidas de ajedrez representadas como texto PGN. No es un modelo de ajedrez en el sentido competitivo: es un artefacto de investigacion construido para responder con un numero a una pregunta concreta: si un modelo de lenguaje general, ajustado sobre las mismas partidas, puede sustituir a un modelo disenado especificamente para la tarea. Forma parte de Rukh, un curso que construye un modelo de lenguaje de ajedrez de principio a fin.

El adaptador anade 4.587.520 parametros entrenables (0,764 % del total) sobre las matrices `q_proj`, `k_proj`, `v_proj` y `o_proj` del transformer, con rango `r=16` y `alpha=32`. El entrenamiento uso 100.000 partidas en 1.500 pasos, en precision 4-bit NF4, con un pico de memoria de 2.361 MB y 851 MB de pesos en dispositivo, lo que lo convierte en un caso de estudio reproducible en hardware de consumo.

Su relevancia es metodologica y negativa: los resultados publicados son deliberadamente pobres (62,50 % de jugadas legales escritas sin mascara, 12,5 % de acierto en siguiente jugada top-1 y 0,9 % de puzzles resueltos, con un Elo estimado inferior a 807). El valor esta en el desglose de modos de fallo de la representacion SAN frente a un vocabulario restringido a jugadas legales, no en su utilidad como motor de ajedrez.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA/QLoRA sobre transformer decoder-only (modelo base `Qwen/Qwen3-0.6B`) |
| Parametros totales | 600.637.440 en el modelo base; 4.587.520 entrenables en el adaptador (0,764 %) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Entrenado sobre base en 4-bit NF4 (QLoRA); adaptador distribuido en safetensors. No se documentan otros formatos |
| Idiomas soportados | No disponible (dominio de entrenamiento: notacion PGN de ajedrez) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, `library_name: peft`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen3-0.6B`, un transformer decoder-only denso de 600.637.440 parametros. La configuracion LoRA usa rango `r=16` con `alpha=32` y afecta exclusivamente a las proyecciones de atencion `q_proj`, `k_proj`, `v_proj` y `o_proj`. El entrenamiento se realizo en 4-bit NF4 (QLoRA), con 1.500 pasos sobre 100.000 partidas, 2.361 MB de memoria pico y 851 MB de pesos en dispositivo.

Los datos de entrenamiento son las mismas partidas que usa el decodificador propio del proyecto Rukh, del mismo mes y con el mismo split de validacion reservado. Cada partida se renderiza como el movetext que un humano pegaria en un sitio de ajedrez, con las dos puntuaciones Elo como etiquetas PGN (`[WhiteElo "2015"] [BlackElo "2028"]`). No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion adicionales, ni innovaciones como decodificacion especulativa. El diseno experimental aisla la variable de representacion: ambos lados se evaluan con el mismo harness, las mismas posiciones de validacion, el mismo split de puzzles y la misma escalera de Stockfish.

## Capacidades

- Generacion de movimientos de ajedrez en notacion SAN dentro de un contexto PGN de partida.
- Continuacion de movetext a partir de un prefijo de jugadas y de las etiquetas de Elo de ambos jugadores.
- Escritura de jugadas legales sin mascara de restriccion en el 62,50 % de los casos.
- Prediccion de siguiente jugada con acierto top-1 del 12,5 % en las posiciones de validacion del proyecto.
- Resolucion de puzzles de ajedrez con una tasa del 0,9 %.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el dominio efectivo es la notacion PGN.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Reproduccion del experimento Rukh: cargar el adaptador sobre `Qwen/Qwen3-0.6B` en 4-bit y ejecutar el harness del proyecto sobre el mismo split de validacion para verificar las cifras publicadas de jugadas legales, top-1 y puzzles.
- Estudio de tokenizacion SAN frente a vocabularios de jugadas legales: el desglose de fallos (33,70 % de jugadas ilegales en la posicion, 2,90 % de salidas que no son jugadas, 0,90 % de SAN ambiguo) permite cuantificar el coste de representar el dominio como texto libre en lugar de restringir la salida.
- Control negativo en evaluaciones de modelos de ajedrez: sirve como cota inferior documentada (Elo estimado < 807) contra la que medir decodificadores especificos o modelos de mayor tamano en la misma escalera de Stockfish.
- Material docente para QLoRA: con 1.500 pasos y 2.361 MB de pico de memoria, es un ejemplo completo y reproducible de ajuste eficiente de parametros sobre un modelo de 0,6 B en GPU de gama baja.
- Validacion de pipelines de datos PGN: comprobar que el renderizado de partidas con etiquetas `WhiteElo`/`BlackElo` y movetext es correcto antes de escalar a modelos mayores, ya que un error de formato se manifiesta de inmediato en la tasa de jugadas no parseables.
- Pruebas de infraestructura de despliegue de adaptadores PEFT: verificar carga de adaptadores, conmutacion de adaptadores sobre una misma base y conversion a otros formatos en un entorno con requisitos de memoria minimos.
- Analisis de ambiguedad en notacion algebraica: el 0,90 % de salidas con SAN ambiguo es un conjunto pequeno y acotado para estudiar cuando el modelo omite la desambiguacion de pieza o columna.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos con el harness del proyecto Rukh sobre el mismo split de validacion, las mismas posiciones y la misma escalera de Stockfish:

| Metrica | Valor |
|---|---|
| Jugadas legales escritas, sin mascara | 62,50 % |
| Acierto top-1 en siguiente jugada | 12,5 % |
| Puzzles resueltos | 0,9 % |
| Elo estimado | < 807 (cota unilateral del 95 %; todas las partidas perdidas) |

Desglose de resultados de generacion:

| Resultado | Proporcion |
|---|---|
| Legal | 62,50 % |
| Ilegal en esta posicion | 33,70 % |
| No es una jugada | 2,90 % |
| SAN ambiguo | 0,90 % |
| Sin escribir nada | 0,00 % |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras baterias generales para este adaptador.

## Requisitos de hardware

- Pesos en dispositivo durante el entrenamiento: 851 MB; pico de memoria de entrenamiento: 2.361 MB.
- Inferencia: el adaptador en safetensors ocupa una fraccion minima del total; el grueso es el modelo base. Con la base en 4-bit NF4, el conjunto cabe holgadamente en GPU de 4 GB de VRAM o menos.
- Cabe en GPU de consumo: si, en cualquier tarjeta con al menos 4 GB (GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090 con enorme margen) y tambien en CPU.
- GPU de datacenter (A100, H100) no justificadas para este modelo por su tamano; su utilidad aqui seria solo para barridos de hiperparametros en paralelo.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador sobre la base; conversion del adaptador a GGUF para `llama.cpp` u `Ollama` mediante las herramientas de conversion de LoRA; vLLM soporta adaptadores LoRA, aunque la compatibilidad concreta con este adaptador no esta documentada en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resultado en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `chorcat/rukh-qwen3-pgn-qlora` | 600.637.440 (base) + 4.587.520 entrenables | No disponible | 62,50 % jugadas legales; 12,5 % top-1; 0,9 % puzzles; Elo < 807 | apache-2.0 | HuggingFace |
| `Qwen/Qwen3-0.6B` (base sin ajuste) | 600.637.440 | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | HuggingFace |
| Decodificador propio del proyecto Rukh | No disponible | No disponible | No disponible en la informacion proporcionada; es el comparador directo del proyecto | No disponible | Repositorio del proyecto |

No se dispone en la informacion proporcionada de cifras del decodificador propio de Rukh ni del modelo base sin ajustar, por lo que la comparacion cuantitativa no puede completarse aqui. Los resultados publicados estan medidos con el mismo harness en ambos lados, de modo que la unica variable que difiere es la representacion de la salida.

## Limitaciones y advertencias

- Rendimiento muy bajo como modelo de ajedrez: 12,5 % de acierto top-1 y 0,9 % de puzzles resueltos lo sitúan lejos de cualquier uso practico en juego o analisis.
- Elo estimado inferior a 807 con todas las partidas perdidas en la escalera de evaluacion; no debe presentarse como jugador funcional.
- Un 33,70 % de las salidas son jugadas legales en otra posicion, el modo de fallo dominante; un 2,90 % ni siquiera son jugadas y un 0,90 % son SAN ambiguos.
- Sesgos conocidos: no se documentan analisis de sesgo en la informacion disponible; el dominio es PGN y las partidas de entrenamiento provienen de un unico mes y fuente.
- Riesgo de alucinacion: alto en el sentido de generar movetext plausible pero ilegal en la posicion dada.
- Limitaciones de contexto e idioma: no se documentan cifras de contexto en la informacion proporcionada, y no hay soporte multilingue declarado.
- Restricciones de licencia: apache-2.0 tanto en el adaptador como en el modelo base declarado, lo que permite uso comercial; conviene verificar la licencia vigente del repositorio del modelo base en el momento de la redistribucion.
- Advertencia de produccion: el repo ocupa 0,0 GB y las descargas y likes registrados son 0, por lo que no hay validacion externa ni soporte de la comunidad; no debe integrarse en un sistema en produccion sin una evaluacion propia.
- No se documentan resultados de benchmarks generales, por lo que se desconoce si el ajuste degrada capacidades no relacionadas con el ajedrez.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chorcat/rukh-qwen3-pgn-qlora
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio del curso Rukh: https://github.com/borja-glez/rukh
- Laboratorio de comparacion del proyecto: https://lab.rukh.borjaglez.com
