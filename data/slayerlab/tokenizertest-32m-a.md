# SlayerLab/TokenizerTest-32m-A

## Resumen

TokenizerTest-32m-A es un modelo de lenguaje base de tipo decoder-only, desarrollado por SlayerLab y especializado en polaco. No es un modelo pensado para uso general: es el brazo A de un experimento controlado de comparación de tokenizadores. Su interes radica en el diseno experimental: dos modelos gemelos se entrenaron con la misma arquitectura, la misma receta, la misma semilla y exactamente el mismo texto en polaco, y la unica variable que cambia es el tokenizador. Eso permite aislar el efecto del tokenizador sobre la calidad final medida en bits por byte.

El modelo tiene 38.866.958 parametros efectivos (embeddings de entrada y salida atados) y una ventana de contexto de 1024 tokens. La model card aclara que el "32m" del nombre del repositorio es el nombre de la receta ("Glint 32M r6"), no el numero de parametros. La arquitectura es un transformer de 15 capas, d_model 384 y 6 cabezas de atencion, entrenado con el optimizador Muon durante 89.000 pasos sobre aproximadamente 12,4 GB de texto polaco.

Es relevante ahora porque aporta un resultado empirico poco frecuente: a esta escala, el tokenizador B (vocabulario de 32.000 tokens, mas fragmentado) no aporta ninguna mejora medible en bits por byte frente al tokenizador A, e incluso queda ligeramente por detras. Ademas, el repositorio publica checkpoints intermedios cada 10.000 pasos, curvas de bits por byte y hashes SHA256, lo que lo convierte en un artefacto de reproducibilidad mas que en un modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con implementacion propia (GoLLeM v6), 15 capas, d_model 384, 6 cabezas de atencion |
| Parametros totales | 38.866.958 efectivos (embeddings atados, segun la model card); el archivo safetensors declara 51.154.958 porque incluye una copia independiente del head de salida |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No disponible (los pesos se publican en fp32; no hay GGUF ni variantes cuantizadas) |
| Idiomas soportados | Polaco (pl) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (fp32) + codigo de inferencia propio en PyTorch (`modeling_gollem_v6.py`); no es una clase de `transformers` |
| Vocabulario | 32.000 tokens (tokenizador BPE de Fabryka AI, hash `60e23148`) |
| Pasos de entrenamiento | 89.000 (brazo A) |
| Checkpoints publicados | Final (paso 89.000) mas `step_10000/` a `step_80000/` cada 10.000 pasos, sin estado del optimizador |
| Tamano del repositorio | 1,8 GB (dominado por los checkpoints intermedios en fp32) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only autorregresivo implementado en codigo propio (no se carga con `AutoModelForCausalLM`). Consta de 15 capas, ancho de modelo 384, 6 cabezas de atencion (64 dimensiones por cabeza), embeddings de entrada y salida atados y contexto de 1024 tokens. El entrenamiento uso el optimizador Muon, batch de 32, semilla 1337 y el script `train_gpt_ref_r6.py` (`0223c083`). El codigo de inferencia es compartido con `SlayerLab/GoLLeM-v6-250M`, y los pesos cargados en ese codigo reproducen exactamente los logits del checkpoint de entrenamiento correspondiente (verificado con `torch.equal` en cada paso publicado).

Los datos son el mismo corpus polaco para los dos brazos: el dataset publico `SlayerLab/slayer-pl-8x3b` en la revision `d50df04a`, concretamente los ficheros `pack-00` y `pack-01` (web), y `shared/core`, `shared/core_sa`, `shared/legal` y `shared/legal_sa` (core y legal, con subconjuntos CC BY-SA separados). En total unos 12,4 GB de texto. La validacion usa `pack-07`, un split web descontaminado del entrenamiento mediante filtrado de 13-gramas. No se menciona ninguna fase de RLHF, DPO o ajuste por instrucciones: es un modelo estrictamente base.

La innovacion metodologica no esta en la arquitectura sino en el protocolo: ambas ramas ven los mismos bytes y se comparan en bits por byte (no en perdida por token, que no es comparable entre tokenizadores distintos). El tokenizador A produce 4,25 bytes por token en entrenamiento y 4,41 en validacion; el B, mas fragmentado, 3,96 y 4,14 respectivamente, por lo que necesita mas pasos para procesar los mismos bytes (95.000 frente a 89.000).

## Capacidades

- Generacion de texto en polaco: continuacion de texto plano, sin formato de dialogo ni plantilla de chat.
- Modelado de lenguaje puro: la tarea para la que fue entrenado es la prediccion del siguiente token, y su unica metrica publicada es bits por byte.
- Cobertura de registros: al incluir packs de web, core y legal, el corpus cubre texto general y dominio juridico en polaco.
- Reproduccion bit a bit del entrenamiento: cargar cualquier `model.safetensors` del repositorio reproduce los logits del checkpoint de entrenamiento correspondiente.
- Trazabilidad completa: `bpb_curve.json` y `SHA256SUMS` permiten auditar cada checkpoint y cada fichero de datos.
- No soporta tool calling ni function calling.
- No soporta uso como agente ni razonamiento multi-paso.
- No sigue instrucciones ni responde a preguntas: no ha pasado por ajuste instructivo.
- No tiene capacidades multilingues: solo polaco.
- No tiene vision, audio, modo "thinking" ni decodificacion especulativa.

## Casos de uso

- Comparacion controlada de tokenizadores: el escenario principal. Un investigador puede medir bits por byte con el checkpoint final de A y de B sobre el mismo split y comprobar si la diferencia se mantiene dentro del margen de error esperado a esta escala.
- Estudio de dinamica de entrenamiento: los checkpoints cada 10.000 pasos permiten reconstruir curvas de convergencia y analizar como evoluciona la brecha entre tokenizadores a lo largo del entrenamiento y no solo al final.
- Test de regresion de codigo de entrenamiento: como los pesos cargados en `modeling_gollem_v6.py` reproducen exactamente los logits del checkpoint con `torch.equal`, sirve como prueba de integracion para validar refactorizaciones del `trainer` o del modelo sin GPU dedicada.
- Ablaciones de arquitectura a bajo coste: con 38,9M de parametros y contexto 1024, se pueden entrenar variantes (mas capas, otro d_model, otra estrategia de atencion) en una sola GPU consumer y comparar contra esta linea base.
- Investigacion sobre optimizadores: es un punto de referencia practico para estudiar el comportamiento de Muon frente a AdamW en modelos pequenos de dominio polaco, con semilla y receta fijadas.
- Evaluacion de tokenizadores por dominio: al existir splits diferenciados de web, core y legal, se puede medir si la ventaja de un tokenizador depende del registro textual (por ejemplo, terminologia juridica polaca).
- Punto de partida para fine-tuning: util como inicializacion para tareas de clasificacion o etiquetado secuencial en polaco cuando el presupuesto de computo es minimo, asumiendo que la calidad final estara limitada por el tamano del modelo.
- Material didactico: por su tamano reducido y su trazabilidad de hashes, es un ejemplo completo y reproducible de pipeline de entrenamiento, desde el corpus hasta la curva de validacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica metrica reportada es bits por byte (menor es mejor) sobre los mismos bytes de evaluacion.

| Metrica | Brazo A (este modelo) | Brazo B | B − A |
|---|---|---|---|
| Bits por byte en validacion (7.232.820 B) | 1,0583 | 1,0622 | +0,0040 (+0,37 %) |
| Bits por byte en held-out W (1.430.217 B) | 1,0781 | 1,0883 | +0,0101 (+0,94 %) |

| Paso | A val | B val | A W | B W |
|---|---|---|---|---|
| 10.000 | 1,1910 | 1,2009 | 1,2327 | 1,2463 |
| 20.000 | 1,1448 | 1,1523 | 1,1799 | 1,1896 |
| 30.000 | 1,1200 | 1,1278 | 1,1499 | 1,1634 |
| 40.000 | 1,1032 | 1,1109 | 1,1304 | 1,1435 |
| 50.000 | 1,0888 | 1,0969 | 1,1141 | 1,1291 |
| 60.000 | 1,0773 | 1,0850 | 1,1000 | 1,1145 |
| 70.000 | 1,0675 | 1,0752 | 1,0885 | 1,1025 |
| 80.000 | 1,0610 | 1,0677 | 1,0818 | 1,0944 |
| 89.000 (final A) | 1,0583 | — | 1,0781 | — |
| 90.000 | — | 1,0633 | — | 1,0892 |
| 95.000 (final B) | — | 1,0622 | — | 1,0883 |

La model card advierte que la comparacion por paso no es limpia, porque en el mismo paso el brazo B ha visto menos bytes que el A. La lectura honesta que propone el autor es que, a esta escala, el tokenizador B no aporta ganancia en bits por byte, y no que sea peor, ya que se trata de una sola semilla por brazo y sin estimacion de ruido.

## Requisitos de hardware

- VRAM para inferencia: los pesos efectivos en fp32 ocupan aproximadamente 155 MB; el archivo `model.safetensors` completo, con la copia del head de salida, ronda los 205 MB. En la practica, la inferencia cabe comodamente en menos de 1 GB de VRAM (estimacion derivada del numero de parametros y del formato publicado, no un dato aportado por el autor).
- Cache KV: con contexto 1024, 15 capas, 6 cabezas de 64 dimensiones y precision fp16, la cache ocupa del orden de 20-25 MB (estimacion derivada de la arquitectura).
- GPU recomendadas: cualquier GPU moderna sirve; el modelo no requiere A100 ni H100. Cabe sin problema en RTX 3060, RTX 4090, e incluso en GPUs integradas o en CPU.
- Inferencia en CPU: viable, dado el tamano. El cuello de botella sera la latencia por token, no la memoria.
- Opciones de despliegue: no hay soporte directo en vLLM, llama.cpp, Ollama ni TGI, porque el modelo usa una implementacion PyTorch propia y no expone una clase de `transformers`. Para usarlo hay que descargar el repositorio y cargar `modeling_gollem_v6.py` con PyTorch, safetensors y tokenizers. Una conversion a GGUF requeriria escribir el mapeo de tensores a mano.
- Latencia y throughput: no disponibles. La model card no publica mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

El unico modelo estrictamente comparable es el brazo B del mismo experimento, ya que comparte arquitectura, receta, datos y semilla.

| Modelo | Parametros | Contexto | Tokenizador | Bits/byte val | Bits/byte W | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| TokenizerTest-32m-A | 38,87M efectivos | 1024 | Fabryka AI BPE, 32.000 | 1,0583 | 1,0781 | CC BY-SA 4.0 | HuggingFace |
| TokenizerTest-32m-B | 38,87M efectivos | 1024 | stubbornGuy, 32.000 | 1,0622 | 1,0883 | CC BY-SA 4.0 | HuggingFace |

Frente a otros modelos base pequenos en polaco, no disponible: no hay en la informacion proporcionada resultados comparables en bits por byte ni en benchmarks de tareas, y la metrica publicada solo es valida dentro de este experimento concreto.

## Limitaciones y advertencias

- Modelo base pequeno: continua texto en polaco, no responde preguntas ni sigue instrucciones. No debe usarse como asistente.
- Conocimiento limitado y riesgo alto de alucinacion: al ser un modelo de 38,9M de parametros entrenado sobre 12,4 GB, reproducirá errores, afirmaciones falsas y sesgos presentes en el texto web de origen.
- Registro unico de idioma: solo polaco. No hay capacidades multilingues ni transferencia a otros idiomas.
- Contexto corto: 1024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Sin ajuste por instrucciones: no existe RLHF, DPO ni SFT; cualquier uso conversacional requeriria un fine-tuning previo.
- Uso previsto exclusivamente de investigacion: la propia model card indica que es un checkpoint de investigacion para comparar tokenizadores, no un modelo para uso.
- Limitacion estadistica del experimento: una sola semilla por brazo, sin estimacion de ruido. La conclusion correcta es "a esta escala el tokenizador B no aporta ganancia en bits por byte", no "B es peor".
- Licencia CC BY-SA 4.0: permite uso comercial, pero impone atribucion y obligacion de compartir las obras derivadas bajo la misma licencia. Conviene revisar la compatibilidad con el corpus de origen, ya que parte de los datos (`core_sa`, `legal_sa`) son tambien CC BY-SA.
- Dependencia de codigo propio: al no ser un modelo de `transformers`, la integracion en ecosistemas estandar (vLLM, TGI, Ollama, llama.cpp) requiere trabajo adicional de adaptacion.
- Fecha de creacion del repositorio registrada como 2026-10-04, posterior a la fecha de la mayoria de referencias; conviene fijar la revision por commit para garantizar reproducibilidad.

## Enlaces

- Modelo en HuggingFace (brazo A): https://huggingface.co/SlayerLab/TokenizerTest-32m-A
- Modelo companero (brazo B): https://huggingface.co/SlayerLab/TokenizerTest-32m-B
- Dataset de entrenamiento: https://huggingface.co/datasets/SlayerLab/slayer-pl-8x3b
- Repositorio con la arquitectura de referencia (mismo codigo): https://huggingface.co/SlayerLab/GoLLeM-v6-250M
- Paper: no disponible
- Blog o articulo tecnico: no disponible
- Demo: no disponible
- Repositorio de codigo independiente: no disponible
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces obtenidos no guardaban relacion con el contenido de la ficha y se han omitido.
