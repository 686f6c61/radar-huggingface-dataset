# aixk/BAAR3-drug-dti

## Resumen

BAAR3-drug-dti es un modelo de regresión tabular orientado a la predicción de interacción fármaco-diana (DTI) y de afinidad de unión (pKd) en el contexto del descubrimiento de fármacos. Lo desarrolla el autor independiente aixk y se distribuye a través de Hugging Face con una licencia propietaria de pago que exige contrato incluso para uso académico y de investigación. Su propuesta central es la eficiencia extrema: con unos 0,90 millones de parámetros (895.554 según el fichero safetensors) aspira a capturar interacciones de largo alcance entre SMILES de compuestos y secuencias de aminoácidos de quinasas, tarea que habitualmente abordan modelos de mayor tamaño.

La arquitectura combina tres componentes propietarios: Multi-Scale BioInception, Gated Attention Units (GAU) y Pocket Cross-Attention Fusion. El modelo se valida, según la model card, sobre el benchmark Davis Kinome del TDC de Harvard (más de 30.000 pares experimentales) y se distribuye en múltiples formatos de despliegue (ONNX, safetensors y un formato binario propio `.baar3` con mmap de copia cero), lo que permite ejecución en navegador mediante WebGPU/WASM sin infraestructura GPU.

Es relevante ahora por dos motivos: por un lado, la tendencia a llevar la inferencia de modelos biológicos a entornos de borde y a pipelines de cribado virtual de altísimo rendimiento; por otro, porque su modelo de licencia es un caso extremo de monetización (prohibición explícita de uso gratuito en cualquier modalidad), algo poco habitual en el ecosistema open source y que conviene evaluar antes de cualquier integración.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Multi-Scale BioInception + Gated Attention Units (GAU) + Pocket Cross-Attention Fusion |
| Parámetros totales | 895.554 (~0,90M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como ventana de tokens; entradas truncadas a 600 aminoácidos de proteína y 120 caracteres de SMILES |
| Tipos de cuantización | FP16 (`.baar3` de 1,8 MiB) y Q8 simétrico de 8 bits (`.baar3` de 0,86 MiB) |
| Idiomas soportados | no disponible (modelo biológico, sin procesamiento de lenguaje natural) |
| Licencia | Propietaria de pago (`proprietary-paid-license`), obligatoria para investigación y uso comercial |
| Formato de pesos | safetensors, ONNX, `.baar3` (FP16 y Q8) |

## Arquitectura y entrenamiento

La model card describe una red neuronal especializada en regresión tabular que procesa dos modalidades de entrada: la secuencia de aminoácidos de la diana (codificada con un vocabulario de 20 aminoácidos) y el SMILES del compuesto. Sobre esas representaciones se aplican bloques de Multi-Scale BioInception, presumiblemente convoluciones paralelas con distintos tamaños de receptor para capturar motivos locales a varias escalas, seguidos de Gated Attention Units, que modulan la información relevante mediante compuertas, y una fusión final de atención cruzada entre el bolsillo de la proteína y el compuesto (Pocket Cross-Attention Fusion). El resultado es una predicción continua de pKd.

No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset (más allá de la validación sobre el Davis Kinome del TDC), ni si se emplearon técnicas de RLHF, DPO o ajuste fino supervisado; al tratarse de un modelo de regresión, esos mecanismos no serían aplicables de forma estándar. Tampoco se especifican innovaciones como decodificación especulativa o atención lineal. La innovación declarada se concentra en el empaquetado: kernels de inferencia con mmap de copia cero en formato `.baar3` y exportación ONNX para ejecución en navegador.

## Capacidades

- Predicción de afinidad de unión (pKd = −log10 Kd) entre compuestos de bajo peso molecular (SMILES) y secuencias de quinasas.
- Clasificación binaria de binders efectivos con umbral Kd ≤ 100 nM (equivalente a pKd ≥ 7,0), con AUC declarada de 0,90 o superior.
- Ranking de compuestos dentro de una librería preservando el orden por concordancia (CI de 0,89 o superior según la model card).
- Cribado virtual de alto rendimiento: más de 3.300 moléculas por segundo en hardware estándar según el autor.
- Ejecución sin servidor en navegador mediante ONNX Runtime con WebGPU o WASM.
- Ejecución local en entornos de borde con formatos binarios de baja huella de memoria (0,86 MiB en Q8).
- No dispone de generación de texto, razonamiento general, código, matemáticas, visión, audio, tool calling ni capacidades de agente; es un regresor especializado.

## Casos de uso

- Cribado virtual masivo de librerías comerciales (ZINC, Enamine): el modelo actúa como primer filtro sobre millones de compuestos para retener el 1 % con pKd ≥ 7,0 antes de pasar a docking molecular con AutoDock o Schrödinger, reduciendo el coste computacional del pipeline.
- Priorización de compuestos en programas de quinasas: dado un conjunto de SMILES candidatos y una diana concreta, el modelo ordena por afinidad estimada y permite seleccionar los candidatos a sintetizar en el laboratorio húmedo.
- Despliegue en entornos de borde o aislados: gracias a los formatos ONNX y `.baar3`, se puede ejecutar el cribado en un portátil o en un nodo sin GPU y sin conexión, útil en instalaciones con restricciones de red.
- Protección de propiedad intelectual en cribado: al ejecutarse en el navegador del cliente o en una máquina local, los SMILES confidenciales no salen de la infraestructura de la organización, algo relevante para farmacéuticas y CRO.
- Enriquecimiento de pipelines de bioinformática existentes: el modelo se puede integrar como paso de scoring en flujos de Python con ONNX Runtime o con los pesos safetensors en PyTorch, alimentando informes de priorización.
- Docencia y demostraciones interactivas de DTI: la ejecución en navegador permite construir demos web donde el usuario introduce un SMILES y una secuencia y obtiene una estimación de afinidad en tiempo real (sujeto a la licencia de pago, que también cubre el uso educativo).
- Filtrado previo en estudios de reposicionamiento de fármacos: evaluar rápidamente compuestos ya aprobados contra un panel de quinasas para generar hipótesis de nuevas indicaciones.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card sobre el test set del Davis Kinome (TDC):

| Modelo | Tipo de arquitectura | Parámetros | CI ↑ | RMSE de afinidad ↓ | Throughput (mol/s) |
|---|---|---|---|---|---|
| Bio-LLM (ESM-2 + Chem) | Bio-LLM preentrenado | ~150M+ | 0,905 | 0,435 | ~11 |
| GraphDTA | GNN molecular + CNN | ~1,5M | 0,892 | 0,478 | ~80 |
| MolTrans | Transformer de subestructuras | ~5,0M | 0,890 | 0,473 | ~125 |
| DeepDTA | CNN 1D estándar | ~0,8M | 0,878 | 0,511 | ~280 |
| BAAR3-drug-dti | BioInception + GAU + Cross-Attn | ~0,90M | 0,889–0,894 | 0,462–0,485 | > 3.300 |

Los resultados son los publicados por el autor y no se han verificado de forma independiente en la información disponible. El modelo no supera en precisión al Bio-LLM de referencia (CI 0,889–0,894 frente a 0,905), pero declara una ventaja de throughput de hasta 300 veces.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en FP16 y en torno a 5 MB en Q8, dado el tamaño del modelo (1,8 MiB y 0,86 MiB de artefactos respectivamente); el cuello de botella es el proceso anfitrión, no el modelo.
- GPU recomendadas: cualquier GPU moderna sirve; no se requiere A100 ni H100. Funciona en CPU y en GPU integradas.
- Cabe en cualquier GPU de consumo, incluida una GTX 1650 o una iGPU; también en navegadores con WebGPU o WASM.
- Opciones de despliegue: ONNX Runtime (backend nativo, WebGPU y WASM), PyTorch con safetensors y el runtime propietario `.baar3` con mmap de copia cero. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un regresor de este tipo.
- Latencia y throughput: más de 3.300 moléculas por segundo en una estación de trabajo única según el autor; no se detallan latencias por lote ni el hardware exacto de la medición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de entrada | CI (Davis Kinome) | Throughput | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| BAAR3-drug-dti | ~0,90M | 600 aa / 120 chars SMILES | 0,889–0,894 | > 3.300 mol/s | Propietaria de pago (investigación y comercial) | Hugging Face, previa contratación |
| DeepDTA | ~0,8M | secuencia y SMILES truncados | 0,878 | ~280 mol/s | Académica abierta (según publicación original) | Repositorios de investigación |
| GraphDTA | ~1,5M | grafo molecular + secuencia | 0,892 | ~80 mol/s | Académica abierta | Repositorios de investigación |
| MolTrans | ~5,0M | subestructuras + secuencia | 0,890 | ~125 mol/s | Académica abierta | Repositorios de investigación |
| Bio-LLM (ESM-2 + Chem) | ~150M+ | secuencia proteica completa | 0,905 | ~11 mol/s | Variable según componentes | Modelos públicos en Hugging Face |

La comparativa se basa en los datos aportados por el autor; no se dispone de una evaluación independiente que confirme las cifras de throughput ni la equivalencia exacta de los protocolos de entrenamiento y test.

## Limitaciones y advertencias

- Licencia extremadamente restrictiva: prohíbe explícitamente el uso gratuito con cualquier finalidad, incluida la investigación académica no comercial, la docencia y los proyectos sin ánimo de lucro. Es necesario contratar una licencia de investigación o empresarial antes de descargar, reproducir, ajustar o ejecutar el modelo.
- Riesgo de alucinación en el sentido de predicciones de afinidad no respaldadas experimentalmente: es un regresor y puede producir valores plausibles pero incorrectos; requiere validación húmeda antes de cualquier decisión de síntesis.
- Sesgo de dominio: el modelo se valida sobre quinasas del Davis Kinome; su comportamiento en otras familias proteicas no está documentado y podría degradarse.
- Límites de entrada: truncamiento a 600 aminoácidos y 120 caracteres de SMILES, lo que excluye proteínas largas y moléculas grandes o complejas.
- Sin información sobre composición del dataset de entrenamiento, sesgos químicos ni cobertura de quimiotipos; no se puede evaluar el sesgo hacia clases de compuestos sobrerrepresentadas.
- Idiomas: no aplica, pero la model card está redactada principalmente en coreano e inglés, con terminología técnica que conviene revisar antes de integrarla en documentación interna.
- Ausencia de benchmarks independientes: las cifras de CI, RMSE y throughput provienen del propio autor y no se han replicado en la información disponible.
- Advertencia de producción: al ser un modelo propietario con runtime propio (`.baar3`), existe dependencia del proveedor para actualizaciones, soporte y compatibilidad futura; conviene planificar una vía de escape hacia ONNX.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aixk/BAAR3-drug-dti
- Sitio oficial del modelo: https://baar.uk/model/
- Contacto de licencias: admin@099.kr
- Modelo relacionado del mismo autor: https://huggingface.co/aixk/BAAR3-19M
- Revisión sobre machine learning para predicción de DTI (ScienceDirect): https://www.sciencedirect.com/science/article/pii/S2001037025005719
