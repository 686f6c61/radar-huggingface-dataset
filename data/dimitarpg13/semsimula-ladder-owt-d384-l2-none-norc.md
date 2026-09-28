# dimitarpg13/semsimula-ladder-owt-d384-l2-none-norc

## Resumen

SemSimula ladder `owt-d384-l2-none-norc` es un modelo de lenguaje de tipo *conservative language model*, desarrollado por el usuario dimitarpg13, que integra un sistema mecánico amortiguado en un espacio semántico mediante mecánica lagrangiana en lugar de la atención de un transformer. Concretamente, es un brazo de ablación dentro de un estudio pre-registrado en escalera (*ladder study*) sobre OpenWebText con dimensión d=384 y L=2, en el que cada variante elimina exactamente un mecanismo para poder atribuir las diferencias de rendimiento a componentes concretos y no a presupuestos de cómputo distintos.

Este brazo concreto, etiquetado `none-norc`, es el control totalmente conservativo: se desactiva el denominado mecanismo de Fock (la ruta registro-a-token, `REVERSE_CHANNEL=False`), de modo que los registros se crean y destruyen pero nunca alcanzan los estados de token. Como consecuencia, todas las fuerzas que actúan sobre el sistema son gradientes de un potencial escalar, el modelo admite una métrica de Jacobi y su paso de integración es una geodésica amortiguada. Es el único modelo de la colección estrictamente conservativo.

El modelo tiene 76.572.110 parámetros y se entrenó sobre 532.480.000 tokens (32.500 pasos × 32 de batch × 512 de bloque), con una tasa de aprendizaje de 0,0012. Su perplejidad asentada en validación de OpenWebText es 87,93, frente a 49,81 del baseline GPT-2 emparejado. Se distribuye bajo licencia CC-BY-4.0, solo en inglés, con pesos PyTorch y un repositorio de 0,6 GB. Su interés es fundamentalmente de investigación: mide el coste, en perplejidad, de imponer conservatividad estricta y de eliminar la ruta registro-a-token.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No transformer, sin atencion (*attention-free*); modelo de lenguaje conservativo basado en mecanica lagrangiana con potencial escalar (d=384, L=2) |
| Parametros totales | 76.572.110 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No declarada explicitamente; entrenamiento y evaluacion con bloques de 512 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Pesos PyTorch (repo de 0,6 GB); no se declara safetensors ni GGUF |

Datos adicionales declarados en la model card: learning rate 0,0012; perplejidad asentada 87,93; mejor perplejidad 85,90 (paso 31.000); perplejidad final 88,82.

## Arquitectura y entrenamiento

El modelo no es un transformer ni emplea atencion. Integra numéricamente un sistema mecánico amortiguado en el espacio semántico, regido por la ecuacion de movimiento `m·ḧ = -∇V_θ(h) - γ·m·ḣ + F_rc(h, r) + F_φ(h)`, donde `V_θ` es el potencial escalar puntual, `V_φ` el potencial por pares (PARF) y `F_rc` el canal inverso por el que el banco de registros actúa sobre el estado de token. El término de amortiguamiento `-γ·m·ḣ` es paralelo a la velocidad y solo modifica el modulo de esta, no la trayectoria. En este brazo `F_rc = 0` (`REVERSE_CHANNEL=False`), de modo que todas las fuerzas son gradientes de un potencial escalar `V = V_θ + V_φ`, el sistema admite una metrica de Jacobi y el paso de integracion es la geodésica amortiguada de esa metrica, salvo la proyeccion de LayerNorm. Es, por tanto, el unico modelo totalmente conservativo de la coleccion.

El entrenamiento se realizo sobre OpenWebText (dataset `Skylion007/openwebtext`), con tokenizador y lotes de validacion compartidos entre todos los brazos de la escalera. Cada brazo ve exactamente 532.480.000 tokens (32.500 pasos × 32 × 512), de modo que las diferencias de perplejidad entre modelos se atribuyen a mecanismos y no a presupuestos de computo. La innovacion tecnica destacable es metodologica: un protocolo de ablacion pre-registrado con presupuesto de tokens igualado, apoyado en integradores tipo BAOAB, potencial gaussiano anisotropo y geometria riemanniana (geodesicas de Jacobi). No se documenta uso de RLHF ni DPO.

## Capacidades

- Generacion de texto en ingles: unica tarea declarada (`pipeline_tag: text-generation`).
- Inferencia con memoria constante (*constant-memory inference*), segun las etiquetas del repositorio; caracteristica del diseno sin atencion.
- Modelado de lenguaje autorregresivo a nivel de bloque de 512 tokens.
- Capacidad de investigacion y reproducibilidad: ablacion controlada de mecanismos dentro de una escalera pre-registrada.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue (solo ingles).
- No se documentan capacidades de vision, audio, *thinking mode* ni modo de razonamiento explicito.

## Casos de uso

- Investigacion en arquitecturas alternativas al transformer: el modelo sirve como punto de control conservativo para medir el coste en perplejidad (20,95 PPL, +31,3%) de eliminar la ruta registro-a-token frente al brazo `none`, y comparar con arquitecturas basadas en atencion.
- Estudios de ablacion con presupuesto igualado: al compartir corpus, tokenizador y lotes de validacion (532.480.000 tokens por brazo), permite aislar el efecto de un unico componente sin confundirlo con diferencias de computo.
- Reproduccion de estudios pre-registrados: las predicciones se registraron antes de la ejecucion, por lo que el modelo es util para verificar ordenaciones de mecanismos y detectar inversiones respecto a lo previsto.
- Evaluacion del coste de la conservatividad estricta: dado que admite metrica de Jacobi y paso geodesico amortiguado, permite estudiar el precio, en calidad de modelado, de forzar que toda fuerza sea un gradiente (17,39 PPL, +27,4%, en el salto desde `attention`).
- Experimentos sobre integradores y estabilidad numerica: util para validar esquemas tipo BAOAB y potenciales gaussianos anisotropos sobre datos de lenguaje reales.
- Inferencia de bajo coste con memoria constante: con 76,5 M de parametros y sin atencion, es viable para pruebas de generacion en entornos con recursos muy limitados, siempre como artefacto de investigacion y no de produccion.
- Docencia y formacion: sirve para ilustrar modelos basados en energia, mecanica lagrangiana y geometria riemanniana aplicadas a NLP, con un ejemplo reproducible.
- Comparativa de bases de referencia: el baseline GPT-2 emparejado (49,81 PPL) actua como referencia para cuantificar la brecha entre esta familia y la atencion estandar.

## Benchmarks y rendimiento

Resultado declarado por el autor (`verified: false`, es decir, no verificado de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| text-generation | OpenWebText (validation) | Perplejidad asentada, bloque 512 (media de las tres ultimas evaluaciones de 500 pasos) | 87,93 |

Perplejidades de la escalera completa (mismo presupuesto de 532.480.000 tokens por brazo):

| Brazo | Mecanismo eliminado | PPL asentada | Ratio vs GPT-2 |
|---|---|---:|---:|
| Baseline GPT-2 emparejado | arquitectura de referencia | 49,81 | 1,000× |
| Fock-PARFLM (`attention`) | el propio transformer | 63,51 | 1,275× |
| Fock-PARFLM (`attention_potential`) | conservatividad | 80,90 | 1,624× |
| Fock-PARFLM (`none`) | el campo de intercambio | 66,98 | 1,345× |
| Este modelo (`none-norc`) | el mecanismo de Fock (ruta registro-a-token) | 87,93 | 1,765× |
| Multi-ξ SPLM (`splm-multixi`) | V_φ (potencial PARF por pares) | dentro del 5% de 87,93 (prediccion pre-registrada) | — |
| Fock-SPLM (`fock-splm`) | V_φ, con ruta registro-a-token | dentro del 5% de 66,98 (prediccion pre-registrada) | — |

Las entradas en cursiva del material original son predicciones pre-registradas, no resultados medidos. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, unos 306 MB solo de pesos (76.572.110 × 4 bytes); en fp16/bf16, unos 153 MB; en int8, unos 76,5 MB; en int4, unos 38 MB. A estas cifras hay que sumar activaciones y overhead del runtime.
- GPU recomendadas: cualquier GPU de consumo moderna es suficiente dado el tamano; una RTX 4090 o incluso una GPU con 4-6 GB resultan ampliamente suficientes. No requiere A100 ni H100.
- Caben en GPU de consumo: si, con holgura, en practicamente cualquier GPU con 4 GB o mas; tambien es viable en CPU.
- Opciones de despliegue: al ser una arquitectura propia sin atencion y no transformer, no es compatible de forma nativa con vLLM, llama.cpp, Ollama, TGI ni herramientas equivalentes orientadas a transformers. El despliegue requiere PyTorch nativo y codigo especifico del autor.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL (OpenWebText val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `semsimula-ladder-owt-d384-l2-none-norc` (este modelo) | 76.572.110 | bloques de 512 | 87,93 | CC-BY-4.0 | HuggingFace |
| `semsimula-ladder-owt-d384-l2-none` | no disponible | no disponible | 66,98 | no disponible | HuggingFace |
| `semsimula-ladder-owt-d384-l2-gpt2-matched` (baseline) | no disponible | no disponible | 49,81 | no disponible | HuggingFace |
| `semsimula-ladder-owt-d384-l2-attention` | no disponible | no disponible | 63,51 | no disponible | HuggingFace |

La comparacion se limita a los brazos de la propia escalera, ya que son los unicos con datos publicados en la informacion disponible. Frente a un transformer de atencion con el mismo presupuesto de tokens (baseline GPT-2 emparejado), este modelo es 1,765× peor en perplejidad. Frente a los demas brazos no conservativos, la eliminacion del mecanismo de Fock le cuesta 20,95 puntos de perplejidad respecto al brazo `none`.

## Limitaciones y advertencias

- Artefacto de investigacion: es un brazo de ablacion, no un modelo destinado a produccion; su perplejidad (87,93) es muy superior a la de un baseline GPT-2 emparejado (49,81).
- Resultados no verificados: el unico benchmark declarado figura con `verified: false`; no ha habido validacion independiente.
- Solo ingles: no se documenta soporte multilingue.
- Contexto limitado: entrenamiento y evaluacion con bloques de 512 tokens; no se declara una ventana de contexto mayor.
- Sin alineamiento: no se documenta RLHF ni DPO, por lo que cabe esperar sesgos y salidas no alineadas propias del corpus OpenWebText.
- Riesgo de alucinacion: inherente a un modelo de lenguaje autorregresivo pequeno entrenado sobre texto web; no hay mecanismos de mitigacion documentados.
- Sin soporte de ecosistema estandar: al no ser transformer, no es desplegable directamente con vLLM, llama.cpp, Ollama ni TGI.
- Formato de pesos y cuantizacion no declarados: no se especifica safetensors, GGUF ni esquemas de cuantizacion, lo que complica su integracion.
- Licencia CC-BY-4.0: permite uso comercial con atribucion, pero no exime de las limitaciones tecnicas anteriores.
- Adopcion muy baja: 111 descargas y 0 *likes* en el momento de la consulta; el soporte comunitario es practicamente inexistente.
- Restricciones de contexto idiomatico: al estar solo en ingles, su uso en castellano no esta soportado ni evaluado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-none-norc
- Baseline GPT-2 emparejado: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-gpt2-matched
- Brazo `attention` (Fock-PARFLM, campo de intercambio activo): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention
- Brazo `attention_potential` (Fock-PARFLM, campo como potencial): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention-potential
- Brazo `none` (Fock-PARFLM sin campo de intercambio): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-none
- Brazo `splm-multixi` (Multi-ξ SPLM sin V_φ ni Fock): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-splm-multixi
- Brazo `fock-splm` (Fock-SPLM sin V_φ, con mecanismo de Fock): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-fock-splm
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext
