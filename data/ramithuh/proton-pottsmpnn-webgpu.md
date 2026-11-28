# ramithuh/proton-pottsmpnn-webgpu

## Resumen

`proton-pottsmpnn-webgpu` es un port a JavaScript y WebGPU (WGSL) de Proton-PottsMPNN, un modelo de inferencia numérica para puntuar esqueletos proteicos y disenar secuencias con selectividad de pH. No es un modelo de lenguaje: es una reimplementacion de inferencia de una red PottsMPNN (encoder de grafos sobre residuos, cabeza Potts y decoder autorregresivo) que opera sobre estructuras PDB y un vocabulario de estados de protonacion. Lo desarrolla el usuario `ramithuh` y se publica como repositorio de Hugging Face sin pesos en la raiz (tamano de repo 0.0 GB), con el codigo y las instrucciones de exportacion del checkpoint.

El modelo original combina un featurizador de backbone (N/CA/C/O mas CB virtual, grafo kNN sobre CA, RBF de pares de atomos 25x16 y codificacion posicional relativa por cadena), un encoder `PottsMPNN` de 3 capas `EncLayer`, una cabeza Potts con `etab_out`, enmascarado de aristas y fusion reciproca, y un decoder de 3 `DecLayer` con los cuatro patrones de causalidad. El port reproduce de forma exacta el encoder, la cabeza Potts, las lecturas de energia (`E_global`, energias condicionales por posicion y `ΔH` de mutacion exacta), el vocabulario de protonacion v6 de 30 tokens y el optimizador de descenso por bloques con gap selectivo `E_P − E_D`.

Su relevancia es de nicho pero concreta: permite ejecutar analisis de estabilidad y diseno de secuencias sensibles a pH integramente en el navegador, sin dependencias, sin Python en tiempo de ejecucion y sin GPU dedicada, algo poco habitual en herramientas de diseno proteico. La contrapartida es que no incluye el etiquetador de protonacion original (HBPLUS/propka/FLAML), sustituido por estados fisiologicos por defecto y anulaciones manuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PottsMPNN: encoder de grafos sobre residuos (3 `EncLayer`) + cabeza Potts + decoder autorregresivo (3 `DecLayer`); port a JS/WGSL |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; opera sobre estructuras proteicas de longitud L (una posicion por residuo) |
| Tipos de cuantizacion | FP32, FP16 e INT8 en safetensors |
| Idiomas soportados | no aplica (modelo numerico sobre estructuras proteicas, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | safetensors (FP32/FP16/INT8) exportados mediante `tools/export_weights.py`; kernels en WGSL |
| Vocabulario | v6 de protonacion, 30 tokens (`HIS-P/S/A`, `ASP-P/D/A`, `GLU-P/D/A` + 21 estandar) |
| Backends | CPU en JavaScript puro y WebGPU (WGSL) |
| Dependencias en runtime | ninguna (`shared/`, `cpu/`, `webgpu/` son modulos ES puros) |

## Arquitectura y entrenamiento

La red es un PottsMPNN: un encoder de message passing sobre un grafo kNN de atomos CA (grafo asimetrico, aproximadamente una de cada seis aristas sin reciproca), con actualizacion de nodo, feed-forward y actualizacion de arista en cada una de las 3 `EncLayer`. La cabeza Potts produce `h` (campo de un cuerpo, `[L, V]`) y `J` (acoplamientos, `[L, K, V, V]`), donde el slot `k = 0` es la arista propia forzada a diagonal y porta `h_i`. La energia global sigue la convencion de doble conteo del modelo de referencia: `E_global = H(s) = Σ_i Σ_k J[i, k, s_i, s_{E_idx[i,k]}]`. El decoder de 3 `DecLayer` soporta los cuatro patrones de causalidad, con teacher forcing y muestreo autorregresivo.

El port no entrena ni ajusta nada: reproduce inferencia. Los pesos se exportan una sola vez, offline, con `tools/export_weights.py` (requiere torch y el arbol de referencia), y el oraculo PyTorch FP32 se vuelca con `tools/dump_oracle.py` para que los tests (`cpu.test.mjs`, `gpu.test.mjs` en Chrome headless sobre el adaptador real) verifiquen equivalencia. En GPU se ejecutan como kernels WGSL el encoder, la cabeza Potts y el decoder con teacher forcing; el featurizador, las energias Potts y el optimizador permanecen en el codigo compartido `shared/` en ambos backends por ser secuenciales y con mucho indexing. La maquinaria de densidad local de secuencia (`adjacent_repeat_weight`, `repetitive_window_*`) esta implementada y expuesta como opciones, pero desactivada por defecto, igual que en los criterios del modelo de referencia.

No se dispone de informacion sobre el dataset de entrenamiento original, numero de tokens, composicion ni si hubo RLHF/DPO; la model card solo describe el proceso de port y validacion.

## Capacidades

- Puntuacion de esqueletos proteicos: calcula `E_global` y energias condicionales por posicion a partir de una estructura PDB.
- Calculo exacto de `ΔH` de mutacion sobre el Hamiltoniano Potts.
- Modelado explicito de estados de protonacion con vocabulario de 30 tokens, incluyendo variantes protonadas y desprotonadas de HIS, ASP y GLU.
- Gap de selectividad de pH `E_P − E_D` por centro y agregado (`gapSum`).
- Diseno de secuencias con optimizador de descenso por bloques: objetivo `(1−λ)·z(E_global) + λ·z(Σ(E_P−E_D))`, con `blockSize`, `zscaleMode`, `temperature` y muestreo opcional.
- Seleccion de posiciones disenables por vecindad de centros (`centreNeighbourhood`, con `perCentre` y `max`).
- Anulacion manual de estados de protonacion por posicion 0-based o etiqueta `"<chain><resSeq>"` mediante `overrides`.
- Ejecucion sin dependencias en navegador (WebGPU) o en Node/JS (CPU), con API identica en ambos backends.
- No soporta tool calling, agentes, vision, audio ni capacidades multilingues: no es un modelo generativo de texto.

## Casos de uso

- Diseno de variantes sensibles a pH en navegador: un investigador carga un PDB, fija centros con `resolveCentres`, selecciona posiciones disenables y ejecuta `optimize` con `lambda` ajustado para obtener una secuencia con `selectiveEnergy` favorable, sin instalar Python ni CUDA.
- Analisis de estabilidad de mutantes: calcular `ΔH` exacto para mutaciones puntuales sobre una estructura y priorizar experimentalmente las de mayor efecto, usando `out.h` y `out.J` como base interpretable.
- Herramientas web interactivas de protein engineering: al ser modulos ES puros con backend WebGPU, se puede integrar en una aplicacion cliente que visualice energias por posicion y proponga secuencias en tiempo real en la GPU del usuario.
- Docencia y prototipado de modelos Potts: el par CPU/GPU con oraculo PyTorch permite comparar implementaciones y estudiar el efecto de la precision (FP32, FP16, INT8) sobre las mismas estructuras.
- Filtrado de disenos en pipelines de laboratorio: generar candidatos con `temperature > 0` para muestrear bloques y cribar por `E_global` y gap selectivo antes de sintesis.
- Validacion cruzada de ports: usar `test:cpu` y `test:gpu` contra el oraculo FP32 para verificar que una reimplementacion reproduce el modelo original, util en equipos que migran inferencia cientifica a WebGPU.
- Analisis de sensibilidad a pH de sitios activos: fijar manualmente estados con `overrides` (por ejemplo `A42: 'HIS-P'`) cuando no se dispone del etiquetador HBPLUS/propka, y evaluar el gap `E_P − E_D` en esos centros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta tiempos de GPU (`out.timings.gpuMs`, encoder mas cabeza, desde el submit hasta completarse) como metrica de ejecucion, sin valores numericos ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible; depende de la longitud L de la estructura y del numero de estados V, no de un numero fijo de parametros publicado.
- GPU recomendadas: cualquier adaptador con soporte WebGPU funcional en navegador; los tests se ejecutan en Chrome headless sobre el adaptador real.
- GPU de consumo: si, el diseno apunta a ejecucion en navegador con WebGPU, incluyendo GPUs integradas y de consumo compatibles con WebGPU.
- Backend CPU: JavaScript puro, sin GPU, con precision FP32, FP16 o INT8 segun el checkpoint exportado.
- Despliegue: modulos ES (`proton-pottsmpnn-webgpu`, `proton-pottsmpnn-webgpu/cpu`), Chrome headless para tests; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: solo se expone `out.timings.gpuMs` por ejecucion; no hay cifras publicadas.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de diseno proteico con selectividad de pH ni ports WebGPU de redes Potts/MPNN, ni datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- El etiquetador de protonacion original (HBPLUS, propka, FLAML) no esta portado: los estados se asignan por defecto al estado fisiologico a pH 7.4 (`ASP-D`, `GLU-D`, `HIS-S`) o manualmente con `overrides`; esto puede desviarse del pipeline de referencia en residuos con pKa alterado.
- La maquinaria de densidad local de secuencia (`adjacent_repeat_weight`, `repetitive_window_*`) esta desactivada por defecto y no la ejercita el oraculo, por lo que su comportamiento no esta validado contra la referencia.
- El grafo kNN es asimetrico; interpretar `J` sin tener en cuenta esta asimetria y la convencion de doble conteo puede llevar a errores en el calculo manual de energias.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribucion de pesos o codigo.
- El repositorio tiene 0.0 GB y no incluye pesos en la raiz; es necesario ejecutar `tools/export_weights.py` con torch y el arbol de referencia para obtener los safetensors, lo que anade un paso offline y una dependencia de Python en preparacion.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, agentes, vision ni audio; cualquier uso fuera del analisis de estructuras proteicas y diseno de secuencias no esta cubierto.
- No hay datos publicados de sesgos, alucinacion (no aplica en sentido linguistico) ni validacion experimental de las secuencias disenadas; los resultados deben tratarse como predicciones a validar en laboratorio.
- Sin benchmarks publicados, no es posible estimar su fidelidad frente al modelo original mas alla de los tests de equivalencia contra el oraculo FP32.

## Enlaces

- Hugging Face: https://huggingface.co/ramithuh/proton-pottsmpnn-webgpu
