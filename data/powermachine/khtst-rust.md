# PowerMachine/khtst-rust

## Resumen

KHTST_RUST v0.11.0 es un proyecto de investigacion en Rust con bindings a Python via PyO3, desarrollado por el autor PowerMachine. No se trata de un modelo de lenguaje preentrenado en el sentido convencional, sino de un framework experimental de entrenamiento que implementa el paradigma NCM (Next-Concept Modeling) junto con un tokenizador de conceptos basado en VQ-VAE residual multiescala, un generador next-concept con factorizacion jerarquica, un tronco hibrido de atencion ADBA y Mamba-3 SSD, y un conjunto de pruebas matematicas documentadas.

El repositorio tiene un tamano de 1,1 GB y no declara pipeline, licencia ni idiomas soportados en su model card. La documentacion publicada describe el ciclo v0.11.0 con conclusion de las pruebas r-36 a r-43, incluyendo mecanismos de razonamiento elastico (RE-1..RE-8), tratamiento de errores en Rust y Assembly, y un verificador NCM calibrado. El proyecto se presenta como una refactorizacion completa del anterior KHTST multimodal PT-BR.

La relevancia actual del proyecto es limitada desde el punto de vista de uso practico: no se publican pesos de un modelo entrenado, no hay benchmarks estandar comparables y la model card esta redactada en portugues con terminologia matematica interna. Su interes es principalmente de investigacion en arquitecturas alternativas de modelado de conceptos y entrenamiento con garantias teoricas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 5 capas ADBA (atencion adaptativa) + 1 slot Mamba-3 SSD (scan diagonal); tokenizador VQ-VAE residual multiescala con codebooks Stiefel/RCO y cuantizacion GSQ; generador next-concept con factorizacion jerarquica |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el proyecto menciona cuantizacion GSQ en el tokenizador, no cuantizacion de pesos para inferencia) |
| Idiomas soportados | no disponible (la evaluacion menciona datos de Wikipedia PT-BR) |
| Licencia | no disponible |
| Formato de pesos | checkpoints JSON propios (`tokenizador.json`, `gerador.json`); wheel abi3 para Python >= 3.10 (manylinux) |

## Arquitectura y entrenamiento

El sistema se organiza en tres fases de entrenamiento. La fase A entrena un tokenizador de conceptos con VQ-VAE residual multiescala, codebooks en variedad de Stiefel con retraccion RCO y cuantizacion Gumbel-Softmax con gradiente exacto (GSQ), con contraccion geometrica de factor (1-1/K) por nivel y nested dropout para producir prefijos "anytime". La fase B entrena un generador next-concept que factoriza p(c) = producto de p(c_l | c_<l) con prediccion paralela intra-nivel, MLE exacto sin ELBO, NFE = L (7 frente a 256), corrupcion de condicionamiento como DRO, MTP como subconjunto de NCM y PCGrad para resolver conflictos de gradiente. La fase C realiza ajuste fino conjunto Pensamiento-backbone con un verificador NCM calibrado por temperatura (golden-section en log-T) y un acoplador duplex lag-1 sincrono.

El tronco hibrido combina cinco capas ADBA con una capa Mamba-3 SSD mediante mascara block-causal sin fugas. El proyecto documenta pruebas formales (Teo A.1, A.2, B.1, B.2, C.3, D.1, D.4, D.6, D.7, P.1, P.2, V-1..V-4, M-R1..M-R5, A-1..A-5) que respaldan propiedades como soundness P(error|aceptado) <= 1 - tau_c + ECE sin oraculo, limiar por cuantil DKW y ajuste automatico auditado de hiperparametros mediante UCB1 con arrepentimiento sublinear. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Entrenamiento de un tokenizador de conceptos con prefijos anytime y contraccion geometrica garantizada.
- Entrenamiento de un generador next-concept con prediccion paralela intra-nivel y coste de inferencia NFE = L.
- Verificador NCM calibrado con garantias de soundness sin oraculo (V-2) y limiar por cuantil DKW (V-3).
- Treino conjunto fase C con correccion delta inyectada en el condicionamiento y neutralidad residual (C-1, C-2).
- MoE redireccionable con especialistas Codificador/Decodificador permutables en tiempo de ejecucion (M-R1, M-R4).
- Atencion propia en especialistas MoE independiente de ADBA con gate que nace en 0 (M-R2).
- Alocacion water-filling por error de cuantizacion (M-R5, M-R5' guloso-otimo).
- Autoajuste por telemetria de tau_c, B, N, arquitectura (UCB1) y gate g, con motivo auditado (A-1..A-5).
- Razonamiento elastico RE-1..RE-8 con enfasis Hedge, water-filling y certificado de compresion con rollback.
- Tratamiento de errores Rust & Assembly con codigos de condicion en registrador mapeados a `Result`.
- Checkpoint atomico con SHA-256 restaurado.
- No se documentan capacidades de generacion de texto libre, codigo, matematicas, vision, audio, tool calling ni agentes en el sentido de un LLM convencional.

## Casos de uso

- Investigacion en tokenizacion de conceptos: el tokenizador de fase A permite experimentar con codebooks en variedad de Stiefel y cuantizacion GSQ para estudiar representaciones discretas jerarquicas con garantias de contraccion geometrica.
- Estudio de factorizacion generativa: la fase B sirve como banco de pruebas para comparar MLE exacto sin ELBO frente a aproximaciones variacionales en modelos generativos jerarquicos.
- Experimentos de arquitecturas hibridas: la combinacion 5:1 ADBA + Mamba-3 SSD con mascara block-causal es util para medir el efecto de mezclar atencion adaptativa y state space models en tareas de modelado de secuencias.
- Evaluacion de calibracion: el verificador NCM con temperatura por golden-section y limiar DKW permite estudiar la fiabilidad de aceptacion/rechazo en pipelines de inferencia con garantias de soundness.
- Investigacion en MoE: los especialistas redireccionables por permutacion y la alocacion water-filling por QE son adecuados para estudiar routing dinamico y equilibrio de carga en mezclas de expertos.
- Autoajuste de hiperparametros: el controlador con UCB1 y arrepentimiento sublinear sirve para investigar seleccion de arquitectura basada en telemetria en entornos de entrenamiento con presupuesto limitado.
- Reproducibilidad de pruebas formales: el conjunto de pruebas r-36..r-43 y las 160 pruebas de cargo (3x) permiten auditar la implementacion Rust de las garantias teoricas documentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor reporta metricas internas del proyecto:

| Metrica | Resultado |
|---|---|
| Pruebas cargo | 160/160 (3 ejecuciones) |
| Gates | 29/29 (script 79) |
| Evaluacion en datos reales | 9/9 (Wikipedia PT-BR, script 80) |
| Mejora de perdida predictiva del loop iterativo | 61,6% menor que baseline (vencedor `moe-e8-redirect`) |
| Arrepentimiento UCB1 | 0,058 |
| Parada del loop iterativo | ronda 11 |
| Ganancia de routing MoE en JEPA | 45% de capacidad equiparada |
| Refinamiento residual QE en SOM 4D | -73% |
| Redireccionamiento a decodificador en SOM 4D | 17x mejor |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publican pesos de un modelo entrenado, solo checkpoints JSON del framework.
- GPU recomendadas: no disponible.
- Cabe en consumer GPU: no disponible.
- Opciones de despliegue: el proyecto se distribuye como wheel abi3 para Python >= 3.10 (manylinux) o compilacion desde fuente con `maturin build --release`. No se documenta integracion con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. El autor menciona NFE = L (7 frente a 256) como coste de inferencia del generador next-concept, pero sin mediciones absolutas.

## Comparativa con modelos similares

No disponible. KHTST_RUST no es un LLM comparable a modelos de la misma categoria (no publica parametros, contexto, pesos ni benchmarks estandar). Las alternativas mas cercanas serian frameworks de investigacion en modelado de conceptos y state space models, pero no se dispone de datos comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- No se publican pesos de un modelo entrenado utilizable para inferencia general; el repositorio contiene codigo, checkpoints JSON y documentacion de pruebas.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido.
- No se declaran idiomas soportados; la unica evaluacion reportada usa Wikipedia PT-BR.
- No hay resultados en benchmarks estandar, por lo que no es posible comparar su rendimiento con modelos de referencia.
- La model card esta redactada en portugues y con terminologia matematica interna (Teo, V-, M-R, A-, RE-), lo que dificulta su evaluacion por terceros.
- El proyecto tiene 0 descargas y 0 likes en Hugging Face, sin senales de adopcion externa.
- El tratamiento de errores Rust & Assembly y el checkpoint atomico SHA-256 son mecanismos de robustez del entrenamiento, no garantias de calidad del modelo resultante.
- El ajuste automatico auditado (A-1..A-5) depende de la telemetria generada por el propio framework; no se documenta validacion independiente.
- No se documentan sesgos conocidos ni tasas de alucinacion porque no se trata de un modelo de lenguaje generativo desplegable.
- El proyecto declara fecha de creacion en 2026, lo que debe tratarse con cautela respecto a la madurez y estabilidad del codigo.

## Enlaces

- Hugging Face: https://huggingface.co/PowerMachine/khtst-rust
- Proyecto anterior referenciado: https://huggingface.co/PowerMachine/khtst-multimodal-ptbr
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion proporcionada.
