# janmusic/ncm-sudoku-mlx

## Resumen

NCM Sudoku MLX es una conversión a formato MLX de los checkpoints oficiales del modelo Next-Concept Modeling (NCM) especializados en resolver Sudoku, desarrollados originalmente por HazyResearch (Hermann Kumbong et al.). El modelo implementa una arquitectura generativa no autorregresiva que produce la solución de un tablero de Sudoku de forma jerárquica y de grueso a fino: cada pasada del generador predice en paralelo un nivel completo de códigos latentes discretos, en lugar de emitir token a token. Esta conversión, realizada por janmusic, no entrena ni cuantiza, sino que traslada los pesos originales de PyTorch a safetensors MLX de forma sin pérdida para su ejecución en Apple Silicon.

El repositorio incluye tres checkpoints independientes según dificultad (easy, medium y hard), cada uno compuesto por un generador de aproximadamente 25,46 millones de valores float32 y un códec de aproximadamente 14,90 millones, lo que suma unos 161,4 MB por checkpoint y 484,3 MB en total. La jerarquía de resolución latente es `1, 2, 4, 6, 9, 13, 18, 26, 37, 50, 67, 89`, y la salida codifica las 81 celdas del tablero más 8 separadores de fila, condicionada por un prefijo de 91 tokens correspondiente al enunciado del puzle.

Su relevancia es doble: por un lado, sirve como implementación de referencia práctica del paradigma NCM sobre hardware de consumo Apple; por otro, demuestra paridad numérica prácticamente exacta con la implementación original en PyTorch, con tasas de resolución idénticas en el conjunto easy (1.988 de 2.000 tableros). No es un modelo de propósito general ni un modelo de lenguaje: es una herramienta de inferencia especializada en Sudoku.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Next-Concept Modeling (NCM), generacion no autorregresiva coarse-to-fine con atencion block-diagonal |
| Parametros totales | Generador: 25.457.600 valores float32; codec: 14.896.512 valores float32 (por checkpoint) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Prefijo de 91 tokens (enunciado del puzle); salida de 89 posiciones (81 celdas + 8 separadores) |
| Tipos de cuantizacion | No disponible (la conversion es sin perdida, no cuantiza; pesos en float32) |
| Idiomas soportados | No disponible (no es un modelo linguistico; opera sobre representaciones de Sudoku) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), ficheros `codec.safetensors`, `generator.safetensors` y `spec.json` por dificultad |

## Arquitectura y entrenamiento

El generador consta de 8 bloques con anchura 512 y 8 cabezas de atencion, emplea atencion block-diagonal, consultas de nivel 0 aprendidas y cabezas de salida no compartidas (untied). El codec de búsqueda utiliza GroupNorm, remuestreo aprendido de nivel 0 y un bloque decodificador. La generacion es jerarquica: en cada pasada se predice un nivel completo de codigos latentes discretos en paralelo, siguiendo la jerarquia `1, 2, 4, 6, 9, 13, 18, 26, 37, 50, 67, 89`, lo que constituye la innovacion central frente a la generacion autorregresiva clasica. La decodificacion es voraz (greedy).

El entrenamiento original fue realizado por HazyResearch sobre datos sinteticos de Sudoku, con checkpoints especificos por dificultad. Esta conversión no realiza ningun entrenamiento: solo cambia el formato de fichero y la disposición de tensores, partiendo de la revision upstream `d342ce8aaea58830eef3b8ad473664673e41f692`. Los SHA-256 de los ficheros fuente y la revision completa quedan registrados en cada `spec.json`. No se dispone de informacion sobre el numero de tokens de entrenamiento, composicion exacta del dataset ni uso de RLHF/DPO.

## Capacidades

- Resolucion de tableros de Sudoku en el formato upstream, con checkpoints especializados por dificultad (easy, medium, hard).
- Generacion no autorregresiva: emite un nivel completo de codigos latentes por pasada, lo que permite paralelismo interno.
- Refinamiento coarse-to-fine: la solucion se construye de forma jerarquica desde representaciones gruesas hasta el tablero final.
- Inferencia determinista con decodificacion greedy.
- Ejecucion en Apple Silicon mediante Metal (MLX 0.32.3) y en CPU para comprobaciones de correccion.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso general ni capacidades multilingues; no es un modelo de lenguaje.

## Casos de uso

- Validacion de pipelines de Sudoku: el modelo puede resolver lotes de tableros en el formato upstream y servir como referencia para verificar generadores de puzles o solucionadores propios, gracias a su paridad exacta con PyTorch en el conjunto easy.
- Investigacion sobre modelos generativos no autorregresivos: permite reproducir y experimentar con el paradigma NCM en hardware Apple sin necesidad de GPU CUDA, usando los tres checkpoints de dificultad.
- Benchmarking de inferencia en Apple Silicon: con latencias p50 de 20,5 ms en batch 1 y 229 ms en batch 16 sobre M5 Pro, sirve para medir el rendimiento de MLX frente a alternativas.
- Educacion y demostraciones: la demo Space y los checkpoints permiten mostrar como un modelo coarse-to-fine construye una solucion paso a paso por niveles.
- Pruebas de paridad numerica: util para validar ports de MLX frente a implementaciones PyTorch, con tolerancias documentadas (diferencia maxima absoluta de 7,2e-5 en logits fp32 y 1,2e-13 en fp64).
- Generacion de datos sinteticos de Sudoku resueltos: el modelo puede producir soluciones para conjuntos de tableros en formato upstream, util en la construccion de datasets de entrenamiento o evaluacion.

## Benchmarks y rendimiento

Tasas de resolucion (greedy, MLX sobre Metal, conjuntos de test publicados):

| Checkpoint | MLX, primeros 200 | MLX, 2.000 completos | PyTorch CPU upstream, 2.000 | Paper (Kumbong et al.) |
|---|---:|---:|---:|---:|
| easy | 99,0% (198/200) | 99,40% (1.988) | 99,40% (1.988), mismos tableros | 99,5% |
| medium | no disponible | 96,30% (1.926) | no ejecutado | 96,5% |
| hard | no disponible | 86,20% (1.724) | no ejecutado | 86,1% |

Paridad con PyTorch upstream (Sudoku-easy):

| Comprobacion | Resultado |
|---|---|
| Diferencia maxima absoluta en embedding del codec | 1,4e-6 |
| Codigos del codec desde entradas reales | 100% (64 tableros) |
| Diferencia maxima absoluta en logits por nivel, fp32 | 7,2e-5 a escala 29 |
| Igual, ambos lados en fp64 exacto | 1,2e-13 |
| Generacion greedy, codigos y texto decodificado | identicos, 64/64 tableros |
| Greedy, los 2.000 tableros easy | identicos a upstream en 2.000/2.000, en Metal y CPU |

Latencia (Apple M5 Pro, 64 GB, MLX 0.32.3):

| p50 / p95 ms | batch 1 | batch 16 |
|---|---:|---:|
| MLX, Metal GPU | 20,5 / 22,7 | 229 / 277 |
| PyTorch upstream, CPU | 165 / 202 | 1.663 / 1.746 |

## Requisitos de hardware

- VRAM/espacio: aproximadamente 161,4 MB por checkpoint y 484,3 MB para los tres, en float32; cabe holgadamente en cualquier GPU de consumo y en memoria unificada de Apple Silicon.
- GPU recomendadas: Apple Silicon con Metal (medido en M5 Pro de 64 GB); CPU disponible con `--cpu` para comprobaciones de correccion. La configuracion Linux CUDA esta documentada en la pagina de plataformas del proyecto, pero las mediciones de estos checkpoints convertidos solo establecen comportamiento en Apple Silicon y CPU.
- Cabe en GPU de consumo: si, dado el tamano reducido; en el ecosistema Apple se ejecuta sobre memoria unificada.
- Opciones de despliegue: paquete `ncm-mlx==0.2.0` (Python 3.12, Apple Silicon), con comandos `python -m ncm_mlx official sudoku --task sudoku-easy --weights ... --n 200`; no es compatible con `AutoModelForCausalLM` de Transformers ni con `mlx_lm`.
- Latencia y throughput: p50 de 20,5 ms en batch 1 y 229 ms en batch 16 sobre M5 Pro con Metal; la referencia PyTorch en CPU es aproximadamente 8 veces mas lenta en batch 1 (165 ms frente a 20,5 ms). Estas cifras no aislan una mejora a nivel de arquitectura, ya que comparan GPU Metal frente a CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tasa de resolucion (hard) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NCM Sudoku MLX (este) | ~25,46M generador + ~14,90M codec | Prefijo 91 tokens | 86,20% (1.724/2.000) | MIT | Hugging Face (janmusic) |
| NCM-MLX Sudoku (entrenamiento independiente) | 6,44M generador | No disponible | No disponible | No disponible | Hugging Face (janmusic/ncm-mlx-sudoku) |
| NCM checkpoints originales (PyTorch) | Mismos pesos | Prefijo 91 tokens | 86,1% (paper) | MIT | Hugging Face (hazyresearch/ncm-checkpoints) |

No se dispone de informacion sobre otros solucionadores de Sudoku neuronales comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Solo inferencia: no es un modelo de razonamiento general ni un modelo de lenguaje; resuelve exclusivamente Sudoku en el formato upstream.
- No es compatible con la API `AutoModelForCausalLM` de Transformers ni con `mlx_lm`; debe usarse a traves de `ncm_mlx.official`.
- La paridad completa con upstream solo se ha establecido para el conjunto easy; para medium y hard no se ha verificado la paridad en el conjunto completo.
- La diferencia de 0,1 puntos en easy respecto al paper no se debe al port, ya que PyTorch upstream produce exactamente las mismas 2.000 salidas en la misma maquina.
- Las mediciones de velocidad comparan Metal GPU frente a CPU y no aislan una mejora arquitectonica; ademas se tomaron en un escritorio compartido con utilizacion de GPU variable (0-33%).
- Los pesos convertidos establecen comportamiento en Apple Silicon y CPU; el soporte Linux CUDA esta documentado pero no validado con estas mediciones.
- No se han re-auditado de forma independiente las semillas ni el presupuesto de entrenamiento del checkpoint upstream.
- El modelo no esta afiliado ni respaldado por HazyResearch; el codigo de inferencia MLX es un port independiente.
- Licencia MIT: permite uso comercial, pero se debe conservar el aviso de copyright de Hermann Kumbong (2025) y citar el trabajo original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/janmusic/ncm-sudoku-mlx
- Checkpoints originales: https://huggingface.co/hazyresearch/ncm-checkpoints
- Codigo original: https://github.com/HazyResearch/ncm
- Port MLX: https://github.com/janmus1c/ncm-mlx
- Documentacion de checkpoints oficiales: https://github.com/janmus1c/ncm-mlx/blob/main/docs/official-checkpoints.md
- Demo Space: https://huggingface.co/spaces/janmusic/ncm-refinement-demo
- Paper: https://arxiv.org/abs/2610.14162
- Paper en Hugging Face: https://huggingface.co/papers/2610.14162
- Dataset de tableros de test: https://huggingface.co/datasets/hazyresearch/ncm-datasets
- Modelos NCM-MLX entrenados de forma independiente: https://huggingface.co/janmusic/ncm-mlx-sudoku
- Plataformas soportadas: https://janmus1c.github.io/ncm-mlx/platforms/
- Informe de paridad y reproduccion: https://janmus1c.github.io/ncm-mlx/official-checkpoints/
- DOI software MLX 0.2.0: https://doi.org/10.5281/zenodo.23781234
- DOI working paper NCM-MLX (no revisado): https://doi.org/10.5281/zenodo.23686842
