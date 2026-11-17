# At1uri/protein-ligand-binding-affinity-engine

## Resumen

`At1uri/protein-ligand-binding-affinity-engine` es un modelo de prediccion de afinidad de union proteina-ligando desarrollado por At1uri (Ramprasad Atluri) y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de una red neuronal de grafos geometrica con equivarianza SE(3) (EGNN) que estima la energia libre de Gibbs de union (ΔG en kcal/mol), la constante de disociacion (pKd) y los desplazamientos de resistencia (ΔΔG) directamente a partir de coordenadas atomicas 3D del complejo proteina-ligando.

El modelo aborda un cuello de botella clasico en descubrimiento de farmacos: las funciones de scoring empiricas (como las rejillas de docking) y las simulaciones alquimicas de perturbacion de energia libre (FEP) requieren horas o dias de computo de alto rendimiento por complejo. Este motor evalua representaciones radiales de distancia y redes de enlaces de hidrogeno en menos de 5 ms por complejo, segun declara el autor, lo que lo situa como una alternativa de cribado virtual ultrarrrapido.

La relevancia actual del modelo radica en su enfoque de aprendizaje geometrico profundo aplicado a biologia estructural, un area donde los modelos generativos de proteinas (AlphaFold, ESM) han avanzado rapidamente pero donde la prediccion cuantitativa de afinidad sigue siendo un problema abierto. El repositorio es extremadamente ligero (0.0 GB) y el recuento de parametros reportado en safetensors es de solo 66.179, un dato que conviene contrastar con la complejidad matematica descrita en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de grafos geometrica con equivarianza SE(3) (EGNN) |
| Parametros totales | 66.179 (segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: modelo sobre grafos atomicos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal de grafos con equivarianza SE(3) que opera sobre un grafo bipartito de interaccion entre los atomos del bolsillo proteico y los atomos del ligando. El paso de mensajes se define mediante funciones φ_m y φ_h que reciben las caracteristicas nodales h_i y las distancias euclideas al cuadrado entre atomos, garantizando invariancia traslacional y rotacional. Las distancias interatomicas se expanden mediante 64 funciones de base radial gaussianas con parametros γ y μ_k. La salida predice pKd, que se mapea a ΔG mediante la relacion termodinamica ΔG = −RT ln(10) · pKd, con RT ln(10) ≈ 1,3644 kcal/mol a 298,15 K.

La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO (no aplicables en este dominio). El autor menciona evaluacion sobre 200 complejos de test del dataset `At1uri/biomolecular-binding-affinity-benchmarks`, que cubre familias farmacologicas diversas (quinasas, GPCR, proteasas virales, receptores nucleares). No se detalla la funcion de perdida, el esquema de optimizacion ni el preprocesamiento de estructuras. La innovacion tecnica declarada es la evaluacion de representaciones radiales y redes de enlaces de hidrogeno en menos de 5 ms, con prediccion de enlaces de hidrogeno de contacto.

## Capacidades

- Prediccion de afinidad de union proteina-ligando en forma de pKd (constante de disociacion).
- Estimacion de energia libre de Gibbs de union (ΔG) en kcal/mol.
- Calculo de la constante de disociacion Kd en nanomolar y clasificacion del tipo de union.
- Prediccion de desplazamientos de energia libre por mutaciones de resistencia (ΔΔG).
- Deteccion de enlaces de hidrogeno de contacto en la interfaz proteina-ligando.
- Procesamiento de coordenadas atomicas 3D y representaciones de distancia radial.
- Inferencia ultrarrrapida declarada (4,2 ms por complejo).
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM; es un modelo especializado de regresion sobre grafos.
- Capacidad multilingue: no aplica (modelo cientifico, no linguistico).

## Casos de uso

- Cribado virtual masivo en descubrimiento de farmacos: el modelo permite evaluar millones de compuestos candidatos contra un bolsillo proteico en tiempos muy reducidos (4,2 ms por complejo declarados), lo que posibilita priorizar bibliotecas quimicas antes de recurrir a docking o FEP.
- Priorizacion de hits en pipelines de docking: tras una etapa de AutoDock Vina, el motor puede re-puntuar los complejos con una correlacion pKd declarada de R = 0,864 frente al 0,648 de Vina, refinando la seleccion con coste computacional minimo.
- Prediccion de resistencia a farmacos: el calculo de ΔΔG permite estimar como mutaciones puntuales en la diana (por ejemplo, en quinasas o proteasas virales) alteran la afinidad de un inhibidor, util en el diseno de terapias de segunda generacion.
- Optimizacion de leads en quimica medicinal: la estimacion rapida de ΔG y Kd facilita iteraciones de diseno estructural sobre series quimicas, reduciendo el numero de compuestos que pasan a ensayos experimentales.
- Analisis de selectividad frente a familias de dianas: al evaluar el mismo ligando contra multiples bolsillos (quinasas, GPCR, receptores nucleares), el modelo ayuda a detectar promiscuidad o selectividad indeseada.
- Integracion en estudios de estructura y binding: combinado con el espacio interactivo `biomolecular-structure-and-binding-studio`, permite explorar visualmente predicciones de afinidad y enlaces de hidrogeno sobre estructuras 3D.
- Filtrado previo a simulaciones FEP: el motor puede descartar complejos de baja afinidad antes de lanzar costosas simulaciones alquimicas, ahorrando horas de HPC por complejo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`), sobre N = 200 complejos de test del dataset `At1uri/biomolecular-binding-affinity-benchmarks`:

| Metrica | Objetivo | Prediccion EGNN | Baseline AutoDock Vina |
|---|---|---|---|
| Correlacion de Pearson pKd (R) | Ground truth | 0,864 | 0,648 |
| RMSE pKd | Ground truth | 0,68 | 1,48 |
| RMSE ΔG (kcal/mol) | Ground truth | 1,12 | 2,15 |
| Latencia de inferencia | — | 4,2 ms | 8.500 ms |

No se han publicado en la informacion disponible resultados en benchmarks estandar de la literatura (PDBbind, CASF-2016, DUD-E) ni comparaciones con modelos de referencia como GNINA, EquiBind o DiffDock.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 66.179 parametros en safetensors, el modelo es extremadamente ligero y cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna (RTX 3060 o superior) es mas que suficiente; el autor no especifica requisitos minimos.
- Cabe en GPU consumer: si, con amplio margen, dado el reducido tamano del checkpoint.
- Opciones de despliegue: el autor proporciona un paquete Python (`affinity_engine.EquivariantBindingAffinityEngine`); no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de grafos).
- Latencia y throughput: 4,2 ms por complejo declarados por el autor; el throughput exacto en hardware concreto no esta especificado.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| At1uri/protein-ligand-binding-affinity-engine | EGNN SE(3) | 66.179 | no aplica | Apache 2.0 | Hugging Face |
| AutoDock Vina (baseline) | Funcion de scoring empirica | no aplica | no aplica | GPL | Ampliamente disponible |
| GNINA | CNN sobre docking | no disponible | no disponible | no disponible | GitHub |
| EquiBind | Modelo geometrico de docking | no disponible | no disponible | no disponible | GitHub |

La comparacion cuantitativa solo esta disponible frente a AutoDock Vina en la model card (R = 0,864 vs 0,648; RMSE pKd 0,68 vs 1,48). No se aportan datos frente a GNINA, EquiBind, DiffDock ni modelos de prediccion de afinidad basados en transformers.

## Limitaciones y advertencias

- Los resultados de benchmarks estan marcados como `verified: false`; no han sido validados de forma independiente y proceden unicamente del autor.
- El recuento de parametros (66.179) es llamativamente bajo para la complejidad matematica descrita (64 funciones de base radial, paso de mensajes multi-capa); conviene verificar la integridad del checkpoint antes de usarlo en produccion.
- No se detalla el dataset de entrenamiento, el numero de estructuras, la composicion ni el esquema de validacion, lo que impide evaluar el riesgo de sobreajuste o fuga de datos.
- El modelo se limita a estructuras 3D de complejos; no procesa secuencias, SMILES aislados ni texto, y requiere coordenadas atomicas correctas.
- Solo declara soporte de idioma `en`, aunque al ser un modelo cientifico el idioma no afecta a la inferencia.
- Riesgo de alucinacion termodinamica: al ser un modelo de regresion, puede producir valores de ΔG o pKd fisicamente plausibles pero incorrectos en complejos fuera de la distribucion de entrenamiento (por ejemplo, cofactores metalicos, ligandos covalentes o interfaces alostericas).
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en dominios no evaluados.
- No se especifican sesgos conocidos ni limitaciones de contexto (no aplica ventana de tokens).
- La fecha de creacion del repositorio (2026-11-17) y el bajo numero de descargas y likes (0) sugieren un modelo reciente y sin validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/At1uri/protein-ligand-binding-affinity-engine
- Dataset de benchmarks: https://huggingface.co/datasets/At1uri/biomolecular-binding-affinity-benchmarks
- Espacio interactivo 3D: https://huggingface.co/spaces/At1uri/biomolecular-structure-and-binding-studio
- Repositorio de codigo de investigacion: https://huggingface.co/buckets/At1uri/biomolecular-ai-and-structural-vault
- Coleccion del autor: https://huggingface.co/collections/At1uri/institutional-quantitative-ai-suite-6aeeaed0365774ae33b9621e
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
