# AletheiaAING/gemma-0.4B-translate-rl

## Resumen

El modelo `AletheiaAING/gemma-0.4B-translate-rl` es un repositorio de archivo privado que contiene una cadena completa de checkpoints de un estudio de traduccion automatica de ingles a lenguas africanas. Desarrollado por AletheiaAING sobre el modelo base `google/gemma-3-270m-it`, el checkpoint principal (385.144.448 parametros, 39 capas) implementa una tarea de traduccion unidireccional ingles → 125 lenguas africanas mediante etiquetas de un solo token por idioma. La arquitectura subyacente es un transformer decoder-only de la familia Gemma 3, ajustado con SFT y refinado con RL (GRPO) en varias etapas encadenadas.

El interes tecnico del repositorio reside en su estructura de ramas: cada branch corresponde a un checkpoint concreto del pipeline de entrenamiento (`growth-a0` → `sft` → `stage-a-*` → `stage-b1-*` → `main`), lo que permite reproducir las tablas del paper asociado. El autor publica los pesos utilizables en repositorios separados (`BeardedMonster/gemma-3-385m-translate-best` y `BeardedMonster/gemma-3-385m-science-translate-best`); este repositorio se declara explicitamente como archivo de procedencia y no como modelo de uso general.

La relevancia actual viene de su enfoque en lenguas de bajos recursos: 54 lenguas evaluadas en FLORES+ con un chrF++ macro de 31,66 y mejoras medibles tras RL (+7,96 chrF++ sobre el SFT en la etapa A). El modelo es pequeno (385M), lo que lo hace desplegable en hardware modesto, y la licencia Gemma impone restricciones de uso comercial que conviene revisar antes de adoptarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma3ForCausalLM, familia Gemma 3) |
| Parametros totales | 385.144.448 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, bfloat16 en inferencia) |
| Idiomas soportados | Ingles (origen) y 125 lenguas africanas de destino (yor, hau, ibo, pcm, efi, twi, ewe, fon, wol, swh, kin, som, orm, amh, tir, lug, lin, zul, xho, afr, sna, nya, sot, tsn, mlg, ibb, urh, bem, tum, run, ven, tso, nso, ssw, nbl, nde, sag, tiv, umb, kmb, mos, kik, luo, kam, bin, dag, oke, shi, dyu, bam, kbp, bbj, kon, kea, fat, knc, gaa, kab, nus, swc, lua, kqn, lun, iso, loz, wal, ach, tsc, vmw, kua, seh, nyn, her, yao, sid, ndc, men, kri, luy, ish, dua, bas, wes, tzm, ful, guw, lue, tll, zne, lub, crs, mfe, rnd, nyk, kwn, ndo, dje, ada, arz, sop, mgr, koo, cjk, cop, dop, bum, nba, nyu, dik, cce, chw, ttj, lam, nup, taq, alz, toi, ber, zgh, aar, bci, ary, aeb, teo, adh) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un `Gemma3ForCausalLM` de 39 capas con 385.144.448 parametros, derivado de `google/gemma-3-270m-it` mediante un proceso de crecimiento (`growth-a0` → modelo de 385M) seguido de SFT y varias etapas de RL. La tarea se formula como traduccion unidireccional ingles → lengua africana: el prompt indica el idioma destino (`Translate the text to Yoruba:  Good morning, how are you?`, con dos espacios tras los dos puntos) y la respuesta se compone de un token de etiqueta de idioma (125 etiquetas de un solo token) seguido de la traduccion y `<end_of_turn>`. No se almacenan estados del optimizador.

La cadena de entrenamiento documentada es: `sft` → RL etapa A (`stage-a-*`, que concentra el 94% de la ganancia de RL) → RL etapa B1 (`stage-b1-*`, ventanas mas largas y dominio de referencia) → etapa mixta (`main`, mejor checkpoint en el paso 50 de 60). A partir de ahi se ramifican una linea de ciencias (`science-sft` → `science-rl*` → `long-rl*` para documentos largos), un experimento de grupo debil (`stage-g-weak-latest`, resultado negativo) y ablaciones (`experiments-*`). El refinamiento usa GRPO (optimizacion de politica proximal con recompensas de grupo), con metrica de validacion chrF++ macro por lengua sobre un subconjunto de desarrollo de FLORES+.

## Capacidades

- Traduccion automatica unidireccional de ingles a 125 lenguas africanas, con etiqueta de idioma explicita en la salida.
- Generacion de texto condicionada a instrucciones de traduccion con formato de prompt fijo.
- Soporte de multiples lenguas de bajos recursos en un unico modelo pequeno (385M), incluyendo lenguas con muy poca cobertura en modelos generales (fon, kbp, bam, dyu, ewe, twi, etc.).
- Capacidad de documento largo en la rama `long-rl*` del estudio (traduccion de documentos extensos), segun la descripcion de la cadena de entrenamiento.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas a la direccion ingles → africano; no se documenta traduccion inversa ni entre lenguas africanas.
- Capacidad especial: modo de ciencias en la rama `science-rl-final` (traduccion de contenido cientifico), publicada como modelo separado.

## Casos de uso

- Traduccion de contenido educativo al ingles → lenguas africanas: el modelo traduce frases y parrafos con el prompt de idioma destino, adecuado para materiales escolares en lenguas como yoruba, hausa o swahili gracias a su tamano reducido y despliegue en GPU consumer.
- Localizacion de interfaces y mensajes cortos: con 385M parametros y salida de un token de etiqueta mas traduccion, se puede integrar en pipelines de localizacion para cadenas de UI en lenguas de bajos recursos donde los modelos grandes no cubren.
- Traduccion de documentos largos: la rama `long-rl*` del estudio se entreno especificamente para documentos extensos, util para informes y guias que deben verterse a lenguas africanas.
- Investigacion en traduccion de bajos recursos: el repositorio de archivo permite reproducir las tablas del paper y comparar etapas SFT frente a RL, util para estudiar el efecto de GRPO en lenguas con pocos datos.
- Traduccion de contenido cientifico: la variante `science-rl-final` (publicada en repositorio separado) esta orientada a material cientifico, apropiada para articulos divulgativos o resumenes tecnicos.
- Prototipado y evaluacion de chrF++: al ser un modelo pequeno con checkpoints por etapa, sirve para medir ganancias incrementales de RL y validar pipelines de evaluacion en FLORES+, NTREX y MAFAND antes de escalar a modelos mayores.
- Despliegue en entornos con recursos limitados: al caber en una sola GPU consumer, puede ejecutarse en servidores modestos o en local para traduccion por lotes de ingles a lenguas africanas.

## Benchmarks y rendimiento

Resultados publicados en la model card (chrF++ macro por lengua, greedy, 768 tokens nuevos, vLLM bf16):

| Benchmark | Resultado | Cobertura |
|---|---|---|
| FLORES+ (`main`) | 31,66 chrF++ | 54 lenguas |
| NTREX (`main`) | 37,17 | 24 lenguas |
| MAFAND (`main`) | 40,78 | 15 lenguas |
| Conjunto de 93 celdas (`main`) | 34,55 | 93 celdas |
| AfriCOMET retenido (`main`) | 0,6284 | 76 celdas |
| FLORES+ (`stage-a-final`) | 30,81 chrF++ (+7,96 sobre SFT) | 54 lenguas |
| NTREX (`stage-a-final`) | +7,43 sobre SFT | 24 lenguas |
| MAFAND (`stage-a-final`) | +5,04 sobre SFT | 15 lenguas |
| FLORES+ (`stage-b1-b256`) | 31,35 chrF++ (+0,54 sobre etapa A) | 54 lenguas |
| chrF++ de desarrollo (`main`) | 40,9033 | subconjunto de desarrollo |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8 GB en bfloat16 (385M parametros) para los pesos; con cache KV y overhead de runtime, cabe holgadamente en 2-4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son validas, aunque las GPU de datacenter quedan sobredimensionadas para este tamano.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna y en muchas integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers (con `AutoModelForCausalLM` y `revision` de rama), vLLM en bf16 (usado por el autor para las evaluaciones), text-generation-inference (el repositorio declara compatibilidad con endpoints). No se documenta soporte GGUF/llama.cpp ni Ollama.
- Latencia y throughput: no disponible. El autor solo reporta la configuracion de evaluacion (greedy, 768 tokens nuevos, vLLM bf16), sin cifras de latencia o tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `AletheiaAING/gemma-0.4B-translate-rl` (este) | 385M | no disponible | FLORES+ 31,66 chrF++ (54 lenguas) | gemma | repositorio privado de archivo |
| `BeardedMonster/gemma-3-385m-translate-best` | 385M | no disponible | mismo checkpoint `main` (FLORES+ 31,66) | gemma | publico |
| `BeardedMonster/gemma-3-385m-science-translate-best` | 385M | no disponible | rama `science-rl-final` (resultados por lengua en su card) | gemma | publico |
| `google/gemma-3-270m-it` (base) | 270M | no disponible | no disponible para traduccion ingles → africano | gemma | publico |

## Limitaciones y advertencias

- El repositorio es un archivo privado: requiere autenticacion (`huggingface-cli login` o token) para cargar cualquier rama; no esta pensado como modelo de produccion.
- La tarea es estrictamente unidireccional (ingles → lengua africana) y depende de un formato de prompt fijo (nombre del idioma, dos espacios tras los dos puntos); desviarse del formato degrada la salida.
- Riesgo de alucinacion en lenguas de muy bajos recursos, donde los datos de entrenamiento son escasos; el propio autor reporta un resultado negativo en el experimento de grupo debil (ganancia de +0,03 chrF++ en ocho lenguas de Africa Occidental).
- Las ramas `growth-*` no son traductores en el mismo sentido (son etapas tempranas de SFT con distinto numero de capas); no deben usarse como modelo final.
- La licencia Gemma impone restricciones de uso comercial y obligaciones de atribucion; conviene revisar los terminos antes de cualquier despliegue productivo.
- No se documentan sesgos especificos, limites de contexto ni comportamiento fuera de la tarea de traduccion; el modelo no soporta tool calling, agentes ni vision.
- El tamano del repositorio (35,6 GB) refleja el conjunto de ramas, no el peso de un unico checkpoint.

## Enlaces

- Repositorio de archivo: https://huggingface.co/AletheiaAING/gemma-0.4B-translate-rl
- Modelo general publicado: https://huggingface.co/BeardedMonster/gemma-3-385m-translate-best
- Modelo de ciencias publicado: https://huggingface.co/BeardedMonster/gemma-3-385m-science-translate-best
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Licencia Gemma: https://ai.google.dev/gemma/terms
