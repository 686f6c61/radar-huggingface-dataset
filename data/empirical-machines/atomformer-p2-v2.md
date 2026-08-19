# empirical-machines/atomformer-p2-v2

## Resumen

AtomFormer P2 v2 (l, 59M) es un checkpoint de la serie de experimentos de Empirical Machines orientada al aprendizaje automático atomístico (atomistic-ML). Se trata de la fase P2, denominada "instinct", que consiste en la clonación de comportamiento (behavior cloning) de los pasos de optimizador registrados durante relajaciones estructurales DFT. El modelo es un transformer pre-norm que trata los átomos como tokens, con 59,09 millones de parámetros y una ventana de contexto que depende del número de átomos (no fija). Está diseñado para predecir energía y fuerzas atómicas de forma conservativa, además de incorporar una cabeza verificadora (P1) y una política de desplazamiento atómico (P2) para acelerar la búsqueda de mínimos de energía en materiales.

El modelo se presenta como una vista previa de investigación dentro de un programa más amplio que va de la percepción (P0) a la planificación (P4). Su relevancia radica en que integra en un solo checkpoint tres tareas complementarias: predicción de energía y fuerzas, verificación de convergencia de relajación y generación de pasos de optimización. Esto permite usarlo como un sustituto eficiente de los cálculos DFT en pipelines de descubrimiento de materiales, reduciendo el coste computacional de las relajaciones estructurales. El código de instanciación aún no es público, lo que limita su uso inmediato a la inspección del checkpoint.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer pre-norm sobre átomos como tokens, con bias de atención por distancia (RBF) y 8 tokens de registro global |
| Parametros totales | 59,09 millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Variable según número de átomos; no especificada en tokens, depende del sistema atómico |
| Tipos de cuantizacion | No disponible (checkpoint en precisión fp32) |
| Idiomas soportados | No aplica (modelo de ML para ciencia de materiales) |
| Licencia | other (no especificada en detalle) |
| Formato de pesos | PyTorch checkpoint (.pt) con state_dict, config y tokens |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer pre-norm estándar aplicada a átomos como tokens. Cada átomo se representa con un embedding y se incorpora un canal geométrico mediante un bias de atención por pares basado en funciones de base radial (RBF) de las distancias interatómicas, calculadas con imagen mínima bajo condiciones periódicas de contorno (PBC). Además, se incluye un fingerprint de densidad radial como entrada y una lectura de energía de pares. La energía total es invariante por construcción (solo depende de distancias), y las fuerzas se obtienen por diferenciación automática (F = −dE/dx), garantizando conservación y equivariancia exacta sin imponer restricciones en los pesos. Se añaden 8 tokens de registro global que sirven como punto de lectura para las cabezas auxiliares.

El entrenamiento combina la pérdida de energía y fuerzas con la cabeza verificadora P1 (que predice energía final, diferencia de energía restante y logit de convergencia) y la política P2 (campo de desplazamiento atómico por pares). Se utilizaron 2.000 millones de tokens (63.919 pasos) con una mezcla de datasets: MPtrj, T1x, OC20 (referenciado a energía de adsorción), SPICE2 y OMat24 (con tope de 300M). Para la clonación de comportamiento se emplearon 1,11 millones de pares de frames consecutivos etiquetados, principalmente de MPtrj. El entrenamiento se realizó en 8 GPUs A100 con DDP, learning rate 2e-4, AdamW, y pesos de pérdida λ_f=2.0 y λ_p2=10. La evaluación se hizo en fp32.

## Capacidades

- Predicción de energía total por átomo y fuerzas atómicas conservativas (derivadas por autograd).
- Verificación de convergencia de relajación estructural: predice la energía del punto final, la energía restante y un logit de convergencia.
- Generación de pasos de desplazamiento atómico (policy P2) entrenada mediante clonación de comportamiento de pasos BFGS sobre DFT.
- Condicionamiento por tarea/fidelidad, carga y espín, con referencias de composición congeladas.
- Manejo de sistemas periódicos (PBC) con imagen mínima.
- Sin equivariancia explícita en los pesos, pero con invariancia rotacional/traslacional de la energía y equivariancia exacta de las fuerzas.
- Soporte para múltiples dominios de datos (cristales PBE+U, superficies, moléculas orgánicas, etc.) según los datasets de entrenamiento.

## Casos de uso

- Aceleración de relajaciones estructurales en materiales cristalinos: el modelo puede sustituir los pasos de DFT en un bucle de optimización, usando su policy P2 para proponer desplazamientos atómicos y su verifier para decidir cuándo detener la relajación.
- Predicción de propiedades energéticas en superficies y adsorción: gracias al entrenamiento con OC20, puede estimar energías de adsorción y fuerzas en sistemas de catálisis heterogénea.
- Filtrado rápido de candidatos en cribado de materiales: al predecir energías con un MAE de ~30 meV/átomo en cristales, permite descartar estructuras inestables antes de un cálculo DFT completo.
- Generación de trayectorias de dinámica molecular ab initio: las fuerzas conservativas permiten integrar ecuaciones de movimiento con precisión suficiente para explorar superficies de energía potencial.
- Entrenamiento de potenciales interatómicos híbridos: el checkpoint puede servir como inicialización o componente en pipelines de aprendizaje activo donde se combinan datos DFT y ML.
- Evaluación de convergencia en optimización geométrica: el verifier P1 puede integrarse en herramientas de análisis para monitorizar si una relajación ha alcanzado el mínimo, reduciendo cálculos redundantes.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación en dominios held-out. Se presentan los errores medios absolutos (MAE) para energía y fuerzas:

| Dominio | Tarea | E MAE (meV/átomo) | F MAE (meV/Å) |
|---|---|---|---|
| MPtrj (cristales PBE+U) | 1 | 30.4 | 91.1 |
| OMat24 | 5 | 40.2 | 203.6 |
| OC20 (E_ads) | 2 | 4.5 | 64.9 |
| T1x (wB97X) | 3 | 4.2 | 57.1 |
| SPICE2 (wB97M-D3BJ) | 0 | 4.1 | 75.1 |

Además, el verifier P1 alcanza una precisión de convergencia de 0.823, y la política P2 tiene un error L1 de acción de 0.0359 Å frente a una línea base de predicción cero de 0.0363 Å (rel_l1 = 0.53). No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El modelo tiene 59,09 millones de parámetros, lo que implica un tamaño de checkpoint de aproximadamente 0.2 GB en fp32.
- Para inferencia, cabe en cualquier GPU moderna con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti o superior), aunque no se han publicado requisitos oficiales.
- El entrenamiento se realizó con 8×A100, pero la inferencia es ligera y también puede ejecutarse en CPU para sistemas pequeños.
- No se especifican opciones de despliegue tipo vLLM o llama.cpp, ya que no es un modelo de lenguaje; el uso previsto es mediante el código de AtomFormer (aún no público).
- La latencia dependerá del número de átomos del sistema; para sistemas de decenas de átomos, la inferencia debería ser del orden de milisegundos en GPU.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de potenciales interatómicos en la documentación proporcionada. Existen alternativas como MACE, NequIP o SchNet, pero no se aportan datos cuantitativos para establecer una comparación rigurosa. Se indica "no disponible".

## Limitaciones y advertencias

- El código de instanciación del modelo no es público, por lo que solo se puede cargar el checkpoint como un diccionario de tensores; no es posible ejecutar inferencia sin la implementación de AtomFormer.
- La licencia se indica como "other" sin detalles; se desconoce si permite uso comercial o modificación.
- Los errores en fuerzas son relativamente altos en OMat24 (203.6 meV/Å), lo que puede limitar su uso en simulaciones de dinámica molecular donde se requiera alta precisión.
- La política P2 muestra una mejora marginal sobre la línea base de cero (rel_l1 0.53), lo que sugiere que su capacidad de predicción de pasos es limitada.
- El entrenamiento incluye datos de múltiples dominios, pero la generalización a sistemas fuera de esos dominios (p. ej., metales de transición, sistemas con fuertes correlaciones) no está garantizada.
- Al ser un modelo de investigación en fases tempranas (P2 de un programa P0-P4), puede contener artefactos de entrenamiento no documentados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/empirical-machines/atomformer-p2-v2
- Sitio web de Empirical Machines: https://www.empiricalmachines.ai/
- Proyecto AtomGen (relacionado, pero no idéntico): https://github.com/VectorInstitute/AtomGen
