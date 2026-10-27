# dimitarpg13/semsimula-ladder-owt-d384-l2-attention-potential-rglive

## Resumen

`semsimula-ladder-owt-d384-l2-attention-potential-rglive` es un modelo de lenguaje experimental desarrollado por el autor independiente dimitarpg13 dentro de su estudio escalonado ("ladder study") sobre modelos de lenguaje conservativos. No es un transformer ni usa atencion: es un modelo fisicamente informado que define un campo conservativo sobre un potencial escalar con dinamica de tipo lagrangiano, y que emplea mecanismos como registros virtuales, espacio de Fock y un "reverse channel". Esta instancia concreta es una sonda de generacion 2 ("Generation 2 probe"), no un brazo del estudio, disenada para aislar un unico cambio: hacer que el gradiente del campo de intercambio ("exchange field") llegue vivo hasta los estados ocultos.

El hallazgo central de esta sonda es que la brecha de rendimiento observada en el modelo padre no provenia de la naturaleza conservativa del campo, sino de una "gradient starvation" causada por el `detach()` de las fuentes en el paso hacia atras. Con el gradiente restaurado y el paso hacia delante bit a bit identico, la perplexity de validacion cae de 80,90 a 61,11 en OpenWebText (bloque de 512 tokens), una mejora del 24,5 %. Con ello, el campo conservativo supera por primera vez al campo no conservativo del mismo estudio (61,11 frente a 63,51).

El modelo es de escala muy reducida (dimension oculta 384, 2 capas), solo en ingles, y su relevancia es estrictamente de investigacion: sirve para estudiar rutas de gradiente, ablaciones controladas de mecanismos y la viabilidad de arquitecturas alternativas al transformer. No esta pensado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje conservativo no-transformer, sin atencion, con campo escalar de potencial, dinamica lagrangiana, registros virtuales y "reverse channel" |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (evaluado a bloques de 512 tokens) |
| Tipos de cuantizacion | no disponible (no se documentan GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | en (ingles) |
| Licencia | cc-by-4.0 |
| Formato de pesos | checkpoint PyTorch (`pytorch`); repositorio de 0,6 GB |

## Arquitectura y entrenamiento

La arquitectura pertenece a la familia que el autor denomina PARFLM ("parsimonious/fock-space language model"): un modelo sin atencion convencional en el que la interaccion entre tokens se modela como un campo de fuerza derivado de un potencial escalar, integrado con un esquema tipo Lagrangiano (se mencionan pasos BAOAB y una formulacion "cfc" en los notebooks de reproduccion). El modelo incorpora registros virtuales y un "reverse channel" que actua sobre los estados ocultos, y se entrena con un presupuesto de tokens emparejado ("matched-token budget") con el resto de brazos del estudio para permitir comparaciones justas. La configuracion concreta de esta sonda es `d384` (dimension oculta 384) y `l2` (2 capas), con un vocabulario y tokenizador no especificados en la informacion disponible.

El cambio que define esta sonda es la activacion de la ruta de gradiente del campo de intercambio (`relax_grad_path='live'` en `model_parf_multixi.py`). En el modelo padre, las fuentes del campo (pesos de atencion y estados fuente) se mantenian detenidas con `detach()`, de modo que la perdida nunca llegaba a ningun estado oculto a traves de ese mecanismo. Aqui el mismo valor de fuerza se reescribe sobre tensores vivos, de forma que el paso hacia atras alcanza cada token a traves de queries, keys y values. El entrenamiento usa OpenWebText con evaluacion por bloques de 512 tokens, un monitor de fugas "SCAF" que se mantuvo limpio en las siete auditorias realizadas (5k a 30k, y 32,5k) y un regimen de recorte de gradiente con una tasa de acierto del 0,8 % (5 de 649 pasos registrados, norma maxima 1,12). El paso hacia delante es bit a bit identico al del modelo padre.

## Capacidades

- Generacion de texto autoregresiva en ingles, con perplexity de validacion de 61,11 en OpenWebText a bloques de 512 tokens.
- Modelado de lenguaje con mecanismos fisicamente informados: campo conservativo, potencial escalar y dinamica lagrangiana.
- Soporte de "reverse channel" y registros virtuales, lo que permite estudiar vias de informacion alternativas a la atencion.
- Capacidad de servir como sujeto de ablaciones controladas (comparaciones con y sin campo de intercambio, con y sin gradiente vivo).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta vision, audio ni ninguna otra modalidad.
- Capacidades multilingues limitadas al ingles.
- No se documenta "thinking mode" ni modos de razonamiento extendido.

## Casos de uso

- Investigacion en arquitecturas alternativas al transformer: el modelo permite medir el impacto de un campo conservativo frente a un campo no conservativo con presupuesto de tokens y configuracion de capas igualados, aislando la variable arquitectonica del resto de factores.
- Estudio de rutas de gradiente: al comparar esta sonda con su modelo padre (mismo paso hacia delante, distinto grafo hacia atras) se puede cuantificar directamente el efecto de la "gradient starvation" sobre la perplexity y sobre lecturas de sonda como la inercia (+32,66 frente a +18,80 del padre).
- Ablaciones controladas de mecanismos internos: la existencia de brazos comparables (`attention`, `none`, `gpt2-matched`) permite activar o desactivar el campo de intercambio y medir el efecto neto sobre la perplexity en un mismo tokenizador y dataset.
- Reproducibilidad de experimentos pre-registrados: el modelo documenta un pre-registro congelado (rango 63-72, punto 67) y un resultado final de 61,11, lo que lo convierte en un caso de estudio sobre practicas de pre-registro en machine learning.
- Docencia y divulgacion: por su tamano reducido (repositorio de 0,6 GB, 2 capas, dimension 384) se puede cargar y ejecutar en entornos de aula o portatiles para ilustrar conceptos de campos conservativos, potenciales escalares y dinamica lagrangiana aplicados al modelado de lenguaje.
- Analisis de estabilidad de entrenamiento: la monitorizacion de picos, la tasa de recorte de gradiente y el monitor de fugas SCAF se pueden reutilizar como plantilla metodologica para diagnosticar inestabilidades en otros modelos pequenos.

## Benchmarks y rendimiento

| Modelo | Gradiente del campo de intercambio | Perplexity de validacion (bloque 512) | Ratio frente a GPT-2 |
|---|---|---:|---:|
| `attention_potential` (padre) | detenido (sin gradiente) | 80,90 | 1,624x |
| `attention-potential-rglive` (esta sonda) | vivo | 61,11 | 1,227x |
| `attention` (campo no conservativo) | vivo | 63,51 | 1,275x |
| `none` (sin campo de intercambio) | no aplica | 66,98 | 1,345x |
| `gpt2-matched` | no aplica | 49,81 | 1,000x |

Notas del autor recogidas en la model card: mejor valor de 59,09 en el paso 31.000; valor final 61,06; a paso 3.000 la sonda marcaba 133,74 frente a 148,99 del padre. El monitor de fugas SCAF se mantuvo limpio en siete auditorias. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; el unico dato verificado es la perplexity declarada, marcada como no verificada (`verified: false`).

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 0,6 GB, por lo que la inferencia en precision nativa deberia caber holgadamente en GPUs consumer; no se ha publicado una cifra oficial de VRAM.
- GPU recomendadas: no disponible de forma oficial; por tamano, cualquier GPU consumer moderna (RTX 3060, RTX 4060, GTX 1660) deberia poder alojarlo.
- Cabe en GPU consumer: si, segun el tamano del repositorio (estimacion, no confirmada por el autor).
- Opciones de despliegue: unicamente PyTorch (`library_name: pytorch`). No se documenta soporte de vLLM, llama.cpp, Ollama, TGI ni ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL OpenWebText (bloque 512) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `attention-potential-rglive` (esta sonda) | no disponible (d384, L2) | no disponible (evaluado a 512) | 61,11 | cc-by-4.0 | HuggingFace |
| `attention_potential` (padre) | no disponible (d384, L2) | no disponible | 80,90 | cc-by-4.0 | HuggingFace |
| `attention` (campo no conservativo) | no disponible (d384, L2) | no disponible | 63,51 | cc-by-4.0 | HuggingFace |
| `none` (sin campo de intercambio) | no disponible (d384, L2) | no disponible | 66,98 | cc-by-4.0 | HuggingFace |
| `gpt2-matched` | no disponible (emparejado en tokens) | no disponible | 49,81 | no disponible | HuggingFace |

Las alternativas comparables son otros brazos del mismo estudio, ya que no hay modelos publicos de la misma familia conservativa fuera de este "ladder". Frente a GPT-2 de referencia, este modelo queda un 22,7 % peor en perplexity de validacion.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion y no se ha validado en tareas aguas abajo.
- Escala muy reducida: `d384` con 2 capas implica una capacidad limitada en comparacion con transformers modernos de proposito general.
- Solo ingles: no se documenta soporte de otros idiomas.
- Perplexity de 61,11, un 22,7 % peor que la referencia GPT-2 emparejada en tokens (49,81); el rendimiento esta lejos del estado del arte.
- Riesgo de alucinacion no cuantificado; al ser un modelo experimental, no se han publicado evaluaciones de fidelidad.
- Sesgos: no se documenta ninguna auditoria de sesgos; al entrenar sobre OpenWebText, hereda los sesgos del corpus web.
- La licencia cc-by-4.0 permite uso comercial con atribucion, pero el modelo no se distribuye con garantias ni soporte.
- Advertencia de metodologia: la model card declara explicitamente que este modelo es "NOT A LADDER ARM: a Generation 2 probe"; no debe compararse directamente con las lecturas E1 de otros brazos del estudio, que emplean potenciales distintos.
- Los resultados de benchmarks no estan verificados (`verified: false`); el unico dato publicado es la perplexity.
- No se documentan herramientas de despliegue estandar (vLLM, llama.cpp, Ollama), lo que complica su integracion en pipelines convencionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention-potential-rglive
- Modelo padre (`attention_potential`): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention-potential
- Contraparte Gen 3 "everything-live" (`attention_potential` con RELAX_GRAD_PATH, VPHI_GRAD_PATH y XI_GRAD_PATH en 'live'): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-attention-potential
- Brazo con campo no conservativo (`attention`): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention
- Brazo sin campo de intercambio (`none`): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-none
- Brazo emparejado a GPT-2 (`gpt2-matched`): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-gpt2-matched
- Verificacion offline de la ruta de gradiente (`gradient_path_check_output.txt`): https://github.com/dimitarpg13/semsimula-paper/blob/main/notebooks/conservative_arch/scaleup/results/cfc_baoab_owt_xi5long_topk16_dt32da16_mh4_aniso_dcvt5x8_vtjoint_cgqk_L2probe_ob_untied_wsd_e5c_plgate_rep0.05_fockreg0.005_g0.1_baoab_cfc_lowrank_idt4_lr0p0012_attnpot/gradient_path_check_output.txt
- Repositorio del paper (`semsimula-paper`): https://github.com/dimitarpg13/semsimula-paper
