# AndrewR123/KurtosisScaleCorrection-EB-GRPO

## Resumen

`KurtosisScaleCorrection-EB-GRPO` no es un modelo de lenguaje en sentido estricto, sino un repositorio de investigacion publicado en Hugging Face que contiene implementaciones de referencia (en Python/NumPy, PyTorch CUDA y .NET 8) de dos metodos estadisticos: `KPS` (Kurtosis Power Scale) y `EB-GRPO` (Empirical-Bayes Group Normalization). El autor, `AndrewR123`, lo presenta como una extension de un experimento previo de 2023 (`DeviationBaisExperiment`) y lo acompana de un articulo en Typst, pruebas unitarias en MSTest y scripts de verificacion simbolica con SymPy. El repositorio esta etiquetado como `reinforcement-learning`, `grpo`, `rlhf`, `quantization` y `statistics`, y su licencia es MIT.

El problema que aborda es la correccion de Bessel (`n - 1`) que PyTorch, NumPy y .NET aplican por defecto en `std` y `var`. El autor demuestra de forma simbolica y empirica que ese divisor es sesgado para cualquier potencia no lineal `sigma^p` con `p != 2` y que no es admisible en error cuadratico medio (MSE) en representaciones de transformers con colas pesadas y en RLVR con grupos pequenos. A partir de ahi deriva un divisor optimo en MSE que depende de la curtosis (`c_var* = (n - 1) + ((n - 1)kappa - (n - 3)) / n`) y una ley de dualidad concavidad-convexidad para potencias.

La relevancia actual es doble: por un lado afecta a la cuantizacion por bloques (escalas de bloque, donde el sesgo subestima `sigma`) y a la normalizacion de capas/whitening (donde el sesgo se dispara hacia arriba); por otro, propone `EB-GRPO` como alternativa al `std` acoplado de GRPO y al `Dr. GRPO`, con el objetivo de recuperar senal de gradiente en grupos pequenos (`G = 2..4`) sin romper la invariancia de escala multi-tarea. El repositorio pesa 0.0 GB y no contiene pesos de modelo: es codigo y resultados experimentales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo neuronal; es una libreria estadistica/RL (implementaciones `KPS` y `EB-GRPO` en NumPy, PyTorch CUDA y .NET 8) |
| Parametros totales | no disponible (no es un modelo con pesos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica al modelo; el metodo se evalua en el contexto de cuantizacion por bloques (menciona `NVFP4` con tamano de bloque `n = 16`) |
| Idiomas soportados | en (segun metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de codigo; sin safetensors ni GGUF) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura de red neuronal propia. Su nucleo son cuatro resultados teoricos (Teoremas 1-4) verificados con SymPy y con pruebas Monte Carlo: (1) una auditoria forense y ley exacta SRSWOR para poblaciones finitas, que corrige cinco defectos de software del repositorio C# de 2023 (truncamiento `int / int` en la media muestral, re-suma en bucle interno `O(n^2)`, re-muestreo diferido de `IEnumerable`, intercambio de tuplas y desajuste de std de referencia); (2) el divisor de varianza optimo en MSE dependiente de la curtosis; (3) la ley de dualidad concavidad-convexidad para potencias `sigma^p`; y (4) la dualidad acoplado/desacoplado en GRPO, que da lugar a `EB-GRPO`.

En cuanto a entrenamiento, el autor reporta experimentos de RLVR multi-tarea con GRPO sobre `Qwen2.5-1.5B-Instruct`, ademas de evaluaciones sobre embeddings de `BAAI/bge-large-en-v1.5`, ejecutados en un sistema NVIDIA GB10 Grace Blackwell. No se especifica en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO mas alla del propio bucle GRPO/RLVR. La innovacion tecnica destacable es el normalizador de grupo con correccion empirical-Bayes que sustituye el `std` acoplado de GRPO.

## Capacidades

- Implementacion vectorizada de `KPS` (Kurtosis Power Scale) en NumPy y PyTorch CUDA, con equivalentes en C#/.NET 8.
- Implementacion de `EBGRPONormalizer` / `EmpiricalBayesGroupNormalizer` para normalizacion de grupos en GRPO.
- Verificacion simbolica exacta de los Teoremas 1-4 mediante `verify_proofs.py` (SymPy).
- Suite de pruebas automatizadas de paridad Python/PyTorch y pruebas MSTest en C#.
- Benchmark suite completa en GPU y Monte Carlo que genera las figuras 1-4 del articulo.
- Calculo de estadisticos exactos en `O(n)` con correccion por curtosis para varianza, escala e inversa de escala.
- No incluye generacion de texto, vision, audio, tool calling ni capacidades de agente: es codigo estadistico y de RL, no un modelo generativo.

## Casos de uso

- Cuantizacion por bloques en produccion: usar `KPS` para calcular escalas de bloque con el divisor optimo en MSE en lugar de `n - 1`; el autor reporta una reduccion de MSE del 55,4% en canales con valores atipicos (`n = 16`, `kappa = 34,1`), lo que se traduce en menor error de reconstruccion al cuantizar pesos.
- Normalizacion de capas y whitening: aplicar la correccion para `p = -1`, donde el sesgo de Bessel se dispara hacia arriba; el autor reporta reducciones de MSE del 76,1% (`KPS`) y 98,5% (`EB`) en whitening de grupos pequenos (`G = 4`, distribucion Laplace).
- Entrenamiento con GRPO en grupos pequenos: sustituir el `std` acoplado por `EB-GRPO` cuando `G = 2..4`, escenario en el que el autor mide una atenuacion del gradiente esperado del 60,1% (`G = 2`) y 30,9% (`G = 4`) con el esquema acoplado, y una recuperacion de mas del 90% de la senal con `EB-GRPO`.
- RLVR multi-tarea con recompensas heterogeneas: usar `EB-GRPO` para preservar la invariancia de escala entre tareas, alli donde `Dr. GRPO` (sin `std`) la rompe; el autor reporta un Pass@1 en matematicas duras del 15,54% frente al 7,31% de `Dr. GRPO` y el 13,32% de GRPO con `G = 4` y 24 semillas.
- Auditoria de codigo estadistico existente: emplear el helper de auditoria forense y la suite MSTest para detectar los cinco defectos clasicos en implementaciones de estadisticos muestrales (truncamiento entero, re-suma cuadratica, re-muestreo diferido, intercambio de tuplas, desajuste de referencia).
- Analisis de embeddings: aplicar las correcciones sobre sub-bloques de `BAAI/bge-large-en-v1.5`; el autor mide una reduccion del 27,5% de MSE en inversa de escala con `n = 16`.
- Investigacion reproducible en RL: reutilizar `run_full_benchmarks.py` y `results/full_gx10_benchmarks.json` como base para replicar las figuras y comparar variantes de normalizacion de grupo.

## Benchmarks y rendimiento

Resultados reportados por el autor en un sistema NVIDIA GB10:

| Regimen | Baseline (`Bessel n-1` / `Dr. GRPO`) | `KPS` / `EB-GRPO` | Mejora |
|---|---|---|---|
| MSE de varianza en canal con atipicos (`n=16`, `kappa=34,1`) | 2,0778 | 0,9277 | -55,4% MSE |
| MSE de whitening en grupo pequeno (`p=-1`, `G=4`, Laplace) | 2,3610 | 0,5637 (`KPS`) / 0,0361 (`EB`) | -76,1% / -98,5% MSE |
| MSE de inversa de escala en sub-bloque real de `BGE-Large` (`n=16`) | 0,1000 | 0,0726 | -27,5% MSE |
| MSE de escala / inversa de escala en sub-bloque real de `Qwen2.5-1.5B` (`n=16`) | 0,3194 / 3,4508 | 0,2880 / 3,0493 | -9,8% / -11,6% MSE |
| Pass@1 en matematicas duras RLVR multi-tarea (`G=4`, 24 semillas) | 7,31% (`Dr. GRPO`) / 13,32% (`GRPO`) | 15,54% (`EB-GRPO`) | +112,6% vs `Dr. GRPO` |

No se han publicado en la informacion disponible resultados de benchmarks estandar de LLM (MMLU, HumanEval, GSM8K) para este repositorio, ya que no contiene un modelo generativo evaluable.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay pesos de modelo). El codigo PyTorch CUDA opera sobre tensores y estadisticos, por lo que el consumo depende del tamano de los tensores de entrada.
- GPU recomendadas: el autor ejecuto los experimentos en un NVIDIA GB10 Grace Blackwell; el codigo CUDA es generico y deberia funcionar en cualquier GPU NVIDIA compatible con PyTorch CUDA.
- Cabe en GPU de consumo: si, al tratarse de operaciones estadisticas vectorizadas; no se especifican requisitos minimos en la informacion disponible.
- Opciones de despliegue: uso como libreria Python (`python/kps_scale.py`), como libreria .NET 8 (`csharp/KurtosisPowerScale.cs`) o integrado en pipelines de PyTorch. No aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. El repositorio no es un modelo de lenguaje y no se han identificado en la informacion proporcionada alternativas comparables de la misma categoria (correccion de sesgo de Bessel con correccion por curtosis y normalizacion EB para GRPO). Las referencias internas del autor son `Dr. GRPO` (variante de GRPO sin `std`) y el `GRPO` estandar, usados como baseline en sus experimentos.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes, y no puede desplegarse con vLLM, llama.cpp, Ollama o TGI.
- El repositorio pesa 0.0 GB y no contiene pesos; los resultados reportados son del autor y no han sido replicados de forma independiente en la informacion disponible.
- Los benchmarks se limitan a un unico sistema (NVIDIA GB10) y a un conjunto acotado de modelos (`Qwen2.5-1.5B-Instruct`, `BAAI/bge-large-en-v1.5`); la generalizacion a otros modelos y escalas no esta verificada.
- El idioma declarado es unicamente `en`; la documentacion y el articulo estan en ingles.
- Riesgo de alucinacion: no aplica al no ser un modelo generativo, pero los resultados empiricos deben tratarse como afirmaciones del autor pendientes de validacion externa.
- La licencia MIT permite uso comercial y modificacion, pero el autor no ofrece garantias sobre la correccion de los metodos en produccion; se recomienda validar los teoremas y las implementaciones antes de adoptarlas en sistemas criticos.
- Los cinco defectos de software corregidos respecto al repositorio de 2023 sugieren que implementaciones previas del mismo autor contenian errores; conviene auditar cualquier fork o derivado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AndrewR123/KurtosisScaleCorrection-EB-GRPO
- Articulo (PDF, referenciado en la model card): `paper/KurtosisScaleCorrection_Paper.pdf` dentro del repositorio
- Codigo Python/NumPy/PyTorch: `python/kps_scale.py`, `python/verify_proofs.py`, `python/test_all.py`, `python/run_full_benchmarks.py`
- Codigo C#/.NET 8: `csharp/KurtosisPowerScale.cs`, `csharp/Extensions.cs`, `csharp/Program.cs`, `csharp/MSUnitTest/ArithmeticTests.cs`
- Resultados cuantitativos: `results/full_gx10_benchmarks.json`
- Fuente del articulo en Typst: `paper/main.typ`, `paper/references.bib`
- No se han encontrado en la informacion disponible enlaces adicionales a papers externos, blogs, repositorios o demos.
