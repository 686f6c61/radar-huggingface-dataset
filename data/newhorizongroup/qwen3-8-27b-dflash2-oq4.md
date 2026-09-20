# NewHorizonGroup/Qwen3.8-27B-DFlash2-oQ4

## Resumen

NewHorizonGroup/Qwen3.8-27B-DFlash2-oQ4 es una version cuantizada a 4 bits del drafter de decodificacion especulativa z-lab/Qwen3.8-27B-DFlash2, publicada por el usuario NewHorizonGroup. No es un modelo de chat autonomo, sino el componente "coupled drafter" que propone bloques de tokens candidatos para acelerar la generacion del modelo objetivo Qwen3.8-27B (en su variante oQ4). La conversion se ha realizado con `mlx_vlm.convert` y esta pensada para la rama de desarrollo de exo que incorpora soporte dflash2.

El modelo conserva la estructura del original: 5 capas, dimension oculta 5120, vocabulario de 248320 entradas y block_size de 8, con lecturas de estados ocultos de las capas 5, 19, 33, 47 y 61 del modelo objetivo. El unico cambio es la cuantizacion: pasa de 3,85 GB en bf16 a 1,03 GB, con 4,5 bits por peso efectivos (grupo de 64, modo affine). El numero total de parametros es de 1.924.404.480 (~1,92 mil millones), muy por debajo de los 27B del modelo objetivo al que da servicio.

Su relevancia es practica: demuestra que un drafter puede cuantizarse agresivamente sin degradar la tasa de aceptacion. En la validacion del autor, la version 4 bits obtiene 283/362 tokens aceptados con a_slot 0,7818, frente a 282/360 y 0,7833 del bf16 original, una diferencia del 0,15 % atribuida a ruido. Al ser la decodificacion especulativa un algoritmo exacto, la distribucion de salida sigue siendo identica a la del target, de modo que la cuantizacion reduce memoria sin alterar la calidad final del texto generado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de 5 capas; drafter de decodificacion especulativa (DFlash2) |
| Parametros totales | 1.924.404.480 (~1,92 mil millones) |
| Longitud de contexto | no disponible (el drafter no define ventana propia; hereda la del modelo objetivo) |
| Tipos de cuantizacion | 4 bits affine con group_size=64 (4,5 bits/peso efectivos); original en bf16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX |
| Capas | 5 |
| Dimension oculta | 5120 |
| Tamano de vocabulario | 248320 |
| Block_size | 8 |
| Target layer ids | [5, 19, 33, 47, 61] |
| Tamano del repositorio | 1,1 GB |
| Libreria | mlx |
| Modelo base | z-lab/Qwen3.8-27B-DFlash2 |
| Modelo objetivo validado | Qwen3.8-27B-oQ4 |

## Arquitectura y entrenamiento

La arquitectura es la de un drafter DFlash2: un transformer de 5 capas con dimension oculta 5120 que no genera texto de forma independiente, sino que consume representaciones internas del modelo objetivo en las capas 5, 19, 33, 47 y 61 y propone bloques de 8 tokens candidatos (block_size=8). El modelo objetivo los verifica en paralelo y acepta o rechaza cada posicion, de manera que la secuencia final es estadisticamente identica a la que produciria el target sin asistencia especulativa. El vocabulario compartido con el target es de 248320 entradas y la compatibilidad estructural (hidden 5120, 5 capas, vocab 248320) es el requisito que exo comprueba automaticamente antes de emparejar drafter y target.

No hay informacion disponible sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO al drafter original; la model card unicamente documenta el proceso de cuantizacion. La innovacion tecnica destacable de esta publicacion es precisamente el proceso de conversion: el `config.json` incorpora el bloque `quantization: {group_size: 64, bits: 4, mode: affine}` junto con el `dflash_config` completo, de modo que la comprobacion de compatibilidad con el target sigue funcionando tras la cuantizacion. No se ha aplicado ningun tipo de destilado adicional ni cambio en el numero de capas o en los identificadores de capa objetivo.

## Capacidades

- Generacion de propuestas de tokens en bloques de 8 para decodificacion especulativa sobre un modelo objetivo compatible.
- Verificacion exacta de la distribucion: al ser especulacion exacta, la salida final conserva la distribucion del target.
- Aceleracion de la decodificacion en entornos MLX sobre Apple Silicon, con una tasa de aceptacion medida de 0,7818 (a_slot) sobre problemas de matematicas.
- Emparejamiento automatico con el target mediante validacion de compatibilidad en exo (hidden 5120, 5 capas, vocab 248320).
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento propio: esas capacidades, si existen, residen en el modelo objetivo.
- Capacidades multilingues: no disponibles como dato del drafter; dependen del vocabulario y del comportamiento del target.
- Almacenamiento reducido: 1,03 GB frente a 3,85 GB del original, lo que permite mantener el drafter residente en memoria junto al target.

## Casos de uso

- Aceleracion de inferencia local en Mac: desplegar Qwen3.8-27B-oQ4 en un Mac con Apple Silicon y anadir este drafter como `coupled_drafter` en la rama dev de exo, de forma que la generacion se acelere sin alterar la distribucion de salida y con solo 1,03 GB adicionales de memoria.
- Asistentes de codigo en portatil: mantener un modelo de 27B en 4 bits y su drafter en un unico equipo, con la latencia reducida por la aceptacion de bloques completos de tokens, algo critico cuando el usuario espera completado en linea dentro del editor.
- Servicio multi-turno de baja latencia: en un Mac Studio o Mac Mini con memoria unificada amplia, servir conversaciones largas donde el cuello de botella es el coste por token generado; el drafter reduce el numero de pasos de decodificacion del target.
- Evaluacion de tecnicas de cuantizacion de drafters: usar esta ficha como referencia reproducible para medir el impacto de 4 bits frente a bf16 en la tasa de aceptacion (0,7818 frente a 0,7833 en la validacion publicada).
- Investigacion en decodificacion especulativa: comparar variantes de cuantizacion, group_size o modos de redondeo manteniendo fijo el target y midiendo rounds, accepted y a_slot con el mismo protocolo.
- Despliegue en entornos con memoria muy limitada: en escenarios edge o en maquinas con poca memoria unificada, el drafter de 1,03 GB permite plantear especulacion donde el drafter bf16 de 3,85 GB no dejaria margen para el target.
- Reduccion del coste energetico por peticion: al necesitar menos pasos de forward del target para la misma salida, disminuye el consumo asociado a la decodificacion en equipos de sobremesa y portatiles.

## Benchmarks y rendimiento

Unica tabla publicada por el autor (validacion del 2026-09-20, target Qwen3.8-27B-oQ4, problemas de matematicas, cap5):

| Drafter | Rounds | Accepted | a_slot |
|---|---|---|---|
| bf16 original | 102 | 282/360 | 0,7833 |
| Este modelo (4 bits) | 101 | 283/362 | 0,7818 |

La diferencia en la tasa de aceptacion es del 0,15 %, dentro del ruido de medida segun el autor. No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros): el drafter no se evalua con ese tipo de pruebas porque su funcion es asistir al target, no responder de forma autonoma.

## Requisitos de hardware

- Peso del drafter: 1,03 GB en 4 bits (frente a 3,85 GB en bf16). Con el overhead del runtime MLX, reservar aproximadamente 1,3-1,6 GB de memoria unificada.
- Modelo objetivo: para el target de 27B en 4 bits, una estimacion a partir del numero de parametros situa los pesos en torno a 14-16 GB, sin contar cache KV. Es una estimacion propia, no confirmada por el autor.
- Plataforma: MLX requiere Apple Silicon ( familias M1, M2, M3 o M4). No hay soporte CUDA ni ROCm en este repositorio.
- GPU recomendadas: no disponibles; el modelo esta pensado para memoria unificada de Apple Silicon, no para A100, H100 o RTX 4090.
- Cabe en GPU de consumo: no aplica en el sentido habitual; cabe en cualquier Mac con memoria unificada suficiente para alojar el target (orientativamente 32 GB o mas si se usa el target de 27B en 4 bits). El drafter por si solo cabe en configuraciones de 8 GB o mas.
- Opciones de despliegue: exo en su rama de desarrollo con soporte dflash2 (integracion prevista mediante `coupled_drafter = "NewHorizonGroup/Qwen3.8-27B-DFlash2-oQ4"`), y las herramientas MLX (`mlx`, `mlx_vlm`) para carga y conversion. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El unico dato de rendimiento publicado es la tasa de aceptacion (a_slot 0,7818) y el numero de rondas (101) de la validacion.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano de pesos | Tasa de aceptacion (a_slot) | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| NewHorizonGroup/Qwen3.8-27B-DFlash2-oQ4 | 1,92 B | 1,03 GB (4 bits) | 0,7818 | safetensors MLX | apache-2.0 | HuggingFace, 0 descargas |
| z-lab/Qwen3.8-27B-DFlash2 (bf16, modelo base) | 1,92 B | 3,85 GB (bf16) | 0,7833 | safetensors | no disponible en la informacion proporcionada | HuggingFace |
| Otros drafters de la misma categoria (EAGLE-3, Medusa, MTP) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa disponible se limita al par drafter bf16 / drafter 4 bits, donde el ahorro de memoria es de 3,7x con una perdida de aceptacion de 0,15 puntos porcentuales. No se dispone de datos de rendimiento de drafters alternativos en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa con EAGLE-3, Medusa u otras familias.

## Limitaciones y advertencias

- No es un modelo autonomo: sin un target compatible (hidden 5120, 5 capas con los ids [5, 19, 33, 47, 61], vocab 248320) el drafter no produce resultados utiles.
- Dependencia de una rama de desarrollo de exo con soporte dflash2; no hay integracion estable ni soporte en otros motores de inferencia.
- Exclusivo de MLX y, por tanto, de Apple Silicon. No es desplegable en CUDA, ROCm ni en CPU con llama.cpp.
- Sin datos publicados sobre idiomas soportados, sesgos, tasas de alucinacion o comportamiento fuera de dominio: la unica validacion disponible son problemas de matematicas con limite de 5 pasos, un conjunto muy reducido (360-362 tokens objetivo) que no permite extrapolar a produccion general.
- La tasa de aceptacion depende del emparejamiento con el target concreto; con otro target o con prompts de naturaleza distinta podria degradarse.
- El repositorio no tiene pipeline declarado, ni descargas ni "likes", y fue creado y actualizado el mismo dia: no hay historial de mantenimiento ni comunidad que lo respalde.
- La licencia apache-2.0 permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia, pero no cubre posibles derechos sobre el modelo base z-lab/Qwen3.8-27B-DFlash2, cuya licencia no se detalla en la informacion proporcionada.
- Riesgo de nombres: el identificador incluye "27B" por el modelo objetivo, no por el tamano real del drafter (1,92 B). Confundirlos lleva a sobredimensionar los requisitos de hardware.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NewHorizonGroup/Qwen3.8-27B-DFlash2-oQ4
- Modelo base: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Repositorio de exo (rama dev con soporte dflash2): https://github.com/exo-explore/exo
- La busqueda web realizada no ha devuelto resultados relevantes sobre este modelo: unicamente listados de sitios para adultos sin relacion con el contenido solicitado, por lo que no se incluyen.
