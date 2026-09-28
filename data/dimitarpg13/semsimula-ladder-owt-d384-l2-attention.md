# dimitarpg13/semsimula-ladder-owt-d384-l2-attention

## Resumen

semsimula-ladder-owt-d384-l2-attention es uno de los brazos de la "escalera de mecanismos" (mechanism ladder) del proyecto de investigacion SemSimula, publicada por el usuario dimitarpg13. Se trata de un modelo de lenguaje de investigacion, no de un modelo de produccion: forma parte de un conjunto de cinco modelos que difieren entre si en exactamente un mecanismo arquitectonico, de modo que la diferencia de perplejidad entre brazos atribuye un coste concreto a cada componente por construccion y no por atribucion estadistica. Este brazo concreto elimina "el propio transformer": no hay atencion ni bloque transformer convencional.

La arquitectura se denomina Fock-PARFLM v2.1 y plantea el modelado de lenguaje como la integracion de un sistema mecanico amortiguado en el espacio semantico. Cuenta con 77.360.081 parametros, dimension de modelo d=384 y L=2 capas, y se ha entrenado sobre OpenWebText con un presupuesto exacto de 532.480.000 tokens en todos los brazos de la escalera (32.500 pasos x 32 de lote x 512 de bloque). Usa un integrador CfC+BAOAB, un potencial escalar anisotropico-gaussiano Vθ y un campo de intercambio no conservativo enrutado por ξ.

Su relevancia es metodologica: es un artefacto experimental para medir el coste de mecanismos fisicos (potenciales escalares y por pares, banco de registros, canal inverso, campo de intercambio) frente a una linea base GPT-2 con presupuesto de tokens igualado. La perplejidad de validacion asentada es 63.51 en bloque 512, un 1.275x peor que la GPT-2 emparejada (49.81), y la prediccion pre-registrada (banda 59-68) se cumplio con un error de +0.51.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fock-PARFLM v2.1; no transformer, sin atencion; potencial escalar anisotropico-gaussiano Vθ, integrador CfC+BAOAB, L=2, campo de intercambio no conservativo enrutado por ξ |
| Parametros totales | 77.360.081 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (se evalua con bloque 512, pero no se declara la ventana maxima) |
| Tipos de cuantizacion | no disponible (la model card no documenta pesos cuantizados; libreria declarada: pytorch) |
| Idiomas soportados | en (ingles) |
| Licencia | cc-by-4.0 |
| Formato de pesos | no especificado (libreria pytorch; la model card no menciona safetensors ni GGUF; tamano del repo: 0,6 GB) |

## Arquitectura y entrenamiento

Fock-PARFLM v2.1 modela la generacion como la integracion de un sistema mecanico amortiguado en el espacio semantico, con la ecuacion de movimiento m·ḧ = −∇Vθ(h) − γm·ḣ + F_rc(h, r) + F_φ(h). Vθ es el potencial escalar puntual (de forma anisotropica-gaussiana), Vφ el potencial por pares (PARF), F_rc el "canal inverso" por el que el banco de registros virtuales actua sobre el estado del token, y el termino de amortiguamiento −γm·ḣ es paralelo a la velocidad, por lo que solo altera la rapidez a lo largo de la trayectoria, nunca la trayectoria. El brazo con el mecanismo Fock activado incorpora el campo de intercambio no conservativo enrutado por ξ, de modo que el sistema es lagrangiano solo en sentido de Lagrange–d'Alembert. El integrador empleado es CfC+BAOAB.

El modelo forma parte de una escalera disenada para aislar mecanismos: cada brazo elimina exactamente un componente. Al desactivar F_rc (brazo `none-norc`) todas las fuerzas pasan a ser gradientes, V = Vθ + Vφ admite una metrica de Jacobi y el paso es la geodesica amortiguada de esa metrica (salvo la proyeccion LayerNorm); ese es el unico modelo totalmente conservativo de la coleccion. El entrenamiento usa OpenWebText con tokenizador y lotes de validacion identicos en todos los brazos, 532.480.000 tokens por brazo, learning rate 0.0012 y bloques de 512. La model card indica un estado de ejecucion sin watchdogs ni picos de perdida, pero con un 29,2% de clip-hit (norma maxima 1,42) frente al 0,0% del brazo `none`. No se documenta RLHF, DPO ni SFT.

## Capacidades

- Generacion de texto autoregresiva en ingles (pipeline `text-generation`, libreria `pytorch`).
- Modelado de lenguaje a nivel de token mediante dinamica de sistema fisico, sin atencion ni bloques transformer.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes o razonamiento multi-paso: no documentado.
- Capacidades multilingues: unicamente ingles (`en`); no se declaran otros idiomas.
- Capacidades especiales: es un modelo de investigacion para ablacion de mecanismos; no se documentan modo "thinking", vision, audio ni multimodalidad.
- No hay ajuste por instrucciones (no se mencionan RLHF, DPO ni SFT); se trata de un modelo base experimental.

## Casos de uso

- Investigacion en arquitecturas alternativas al transformer: permite estudiar una pila no atencional basada en mecanica lagrangiana y compararla con una GPT-2 emparejada a igual presupuesto de tokens.
- Verificacion de estudios pre-registrados: la escalera registra predicciones antes de ejecutar los entrenamientos, por lo que este brazo sirve para validar o refutar la prediccion de perplejidad (banda 59-68, valor final 63.51).
- Estudio de modelos basados en energia y fisica-informados: la formulacion con Vθ, Vφ y F_rc permite analizar como se comporta la generacion cuando el sistema es no conservativo.
- Analisis de conservatividad y geometria: comparar este brazo con `attention_potential` (80.90) cuantifica el coste de forzar que el campo de intercambio sea un potencial escalar y que la fuerza siga siendo un gradiente.
- Linea base academica para comparacion de mecanismos: cualquier investigador puede usar los cinco brazos con el mismo corpus, tokenizador y lotes de validacion para atribuir diferencias de perplejidad a componentes concretos.
- Docencia y divulgacion tecnica: ilustra de forma reproducible como se traduce una formulacion de mecanica clasica (Lagrange–d'Alembert, metrica de Jacobi) en una arquitectura de lenguaje entrenable.
- Generacion de texto exploratoria en ingles: puede producir texto, pero con una perplejidad de validacion de 63.51 su calidad queda por debajo de la GPT-2 emparejada, por lo que no es adecuada para produccion.
- Diagnostico de estabilidad de entrenamiento: el 29,2% de clip-hit frente al 0,0% del brazo `none` lo convierte en un caso de estudio sobre saturacion de gradiente en modelos no conservativos.

## Benchmarks y rendimiento

Unico resultado declarado por el autor (model-index, `verified: false`): perplejidad de validacion en OpenWebText (split validation) con bloque 512.

| Metrica | Valor |
|---|---|
| Perplejidad de validacion (OpenWebText, bloque 512, asentada: media de las tres ultimas evaluaciones de 500 pasos) | 63.51 |
| Perplejidad best (paso 31.000) | 61.49 |
| Perplejidad final | 63.42 |
| Ratio frente a la GPT-2 emparejada | 1.275x |
| Pre-registro (prediccion 63, banda 59-68) | cumplido, error +0.51 (+0.8%) |

Comparacion interna de la escalera (mismos 532.480.000 tokens en todos los brazos):

| Brazo | Mecanismo eliminado | Perplejidad asentada | vs GPT-2 |
|---|---|---:|---:|
| Matched GPT-2 baseline | la arquitectura de referencia | 49.81 | 1.000x |
| Fock-PARFLM, exchange field on (este modelo) | el propio transformer | 63.51 | 1.275x |
| Fock-PARFLM, exchange field as a potential | la conservatividad | 80.90 | 1.624x |
| Fock-PARFLM, no exchange field | el campo de intercambio | 66.98 | 1.345x |
| Conservative-only control, Fock off | el mecanismo Fock (ruta registro-a-token) | 87.93 | 1.765x |
| Multi-ξ SPLM, no Vφ, no Fock | Vφ (el potencial por pares PARF) | dentro del 5% de 87.93 (prediccion pre-registrada) | no disponible |
| Fock-SPLM, no Vφ, Fock on | Vφ, manteniendo la ruta registro-a-token | dentro del 5% de 66.98 (prediccion pre-registrada) | no disponible |

Diferencias de perplejidad medidas entre brazos: baseline GPT-2 a este modelo = +13.70 PPL (+27.5%); este modelo a `attention_potential` = +17.39 PPL (+27.4%); `attention_potential` a `none` = −13.92 PPL; `none` a `none-norc` = +20.95 PPL (+31.3%). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 77,36 millones de parametros equivalen a unos 0,31 GB de pesos en fp32 y unos 0,15 GB en fp16/bf16; con activaciones, el consumo en inferencia es inferior a 1 GB.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM. No requiere A100 ni H100.
- Cabe en GPU de consumo: si, en practicamente cualquier tarjeta moderna (por ejemplo GTX 1050/1650, RTX 3060, RTX 4090), asi como en CPU.
- Opciones de despliegue: inferencia nativa con PyTorch (libreria declarada). No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparacion mas pertinente es interna a la propia escalera, ya que todos los brazos comparten corpus, tokenizador, presupuesto de tokens (532.480.000) y lotes de validacion.

| Modelo | Parametros | Tokens de entrenamiento | Perplejidad OpenWebText (bloque 512) | Licencia |
|---|---|---:|---:|---|
| semsimula-ladder-owt-d384-l2-attention (este) | 77.360.081 | 532.480.000 | 63.51 | cc-by-4.0 |
| semsimula-ladder-owt-d384-l2-gpt2-matched | no disponible | 532.480.000 | 49.81 | no disponible |
| semsimula-ladder-owt-d384-l2-none | no disponible | 532.480.000 | 66.98 | cc-by-4.0 |
| semsimula-ladder-owt-d384-l2-none-norc | no disponible | 532.480.000 | 87.93 | cc-by-4.0 |
| semsimula-ladder-owt-d384-l2-attention-potential | no disponible | 532.480.000 | 80.90 | cc-by-4.0 |

Frente a alternativas externas de la misma categoria (modelos base en ingles de ~100 M de parametros), en la informacion disponible no se aportan datos comparativos de parametros, contexto o licencia para GPT-2 small u otros modelos; por tanto, esos datos figuran como no disponibles.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para produccion ni para tareas de usuario final; es un artefacto de ablation.
- Rendimiento inferior a la linea base: 63.51 de perplejidad frente a 49.81 de la GPT-2 emparejada (1.275x peor).
- Idiomas: solo ingles; no hay soporte multilingue declarado.
- Contexto: la model card no declara la ventana maxima; solo se evalua con bloques de 512 tokens, por lo que no puede asumirse contexto largo.
- Sin ajuste por instrucciones: no se documenta RLHF, DPO ni SFT, de modo que no cabe esperar seguimiento fiable de instrucciones ni formato conversacional.
- Riesgo de alucinacion: como cualquier modelo de lenguaje base, puede generar contenido plausible pero incorrecto; no hay evaluacion de factualidad en la informacion disponible.
- Estabilidad de entrenamiento: 29,2% de clip-hit (norma maxima 1,42) frente al 0,0% del brazo `none`, lo que indica saturacion de gradiente en la variante con campo de intercambio no conservativo.
- Resultados no verificados: el propio model-index marca la metrica como `verified: false`; se trata de resultados declarados por el autor.
- Ausencia de benchmarks estandar: no hay MMLU, HumanEval, GSM8K ni evaluaciones de sesgo; no se puede caracterizar su comportamiento fuera de la perplejidad.
- Licencia cc-by-4.0: permite uso comercial, pero exige atribucion y no ofrece garantias; algunos brazos de la escalera no declaran licencia, lo que dificulta reutilizarlos conjuntamente.
- Tamano reducido: d=384 y L=2 limitan severamente la capacidad de representacion frente a modelos actuales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention
- Dataset de entrenamiento: https://huggingface.co/datasets/Skylion007/openwebtext
- Brazo GPT-2 emparejado: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-gpt2-matched
- Brazo `attention_potential`: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention-potential
- Brazo `none`: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-none
- Brazo `none-norc` (control conservativo): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-none-norc
- Brazo `splm-multixi`: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-splm-multixi
- Brazo `fock-splm`: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-fock-splm
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada.
