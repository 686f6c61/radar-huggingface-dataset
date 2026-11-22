# root-sys-n/Mima-1.5-Pico-15m-Ternary

## Resumen

Mima 1.5 Pico 15M Ternary es una versión cuantizada a pesos ternarios del modelo base Mima 1.5 Pico 15M, desarrollado por el usuario root-sys-n. Se trata de un modelo de lenguaje extremadamente pequeno (15,54 millones de parametros) especializado en turco, que ha sido comprimido de forma integral —incluidas las matrices de embedding y la cabeza LM— a valores ternarios {-1, 0, +1} empaquetados en 2 bits, con escalas FP16 por grupo de 64 elementos.

La relevancia de esta ficha reside en su propuesta de eficiencia extrema: el archivo de pesos ocupa solo 4,19 MB, lo que permite que el modelo completo quepa en la cache L3 de una CPU x86 moderna. El autor reporta una velocidad de 3.286,6 tokens por segundo en un AMD Ryzen 7 5800U con 8 hilos usando un motor C++ propio con AVX2 y T-MAC (vpshufb), lo que supone una aceleracion de 67,8x frente a PyTorch FP32 en CPU.

El modelo emplea una arquitectura transformer de 7 capas con dimension 384, FFN de 1024, 6 cabezas de atencion y un vocabulario BPE de 8.192 tokens en turco. La cuantizacion se realizo mediante un proceso de destilacion con QAT (quantization-aware training) en dos fases, y el autor declara una retencion de "inteligencia" del 98,54% respecto al modelo original en FP32, medida con su propio microbenchmark propietario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (7 capas, d=384, FFN=1024, 6 cabezas) |
| Parametros totales | 15,54 M |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Ternaria (W1.58): pesos en {-1, 0, +1} empaquetados a 2 bits, escala FP16 por grupo (G=64); RMSNorm en FP32 |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | Binario propietario `.mima15t` (4,19 MB); tokenizer en JSON; config en JSON |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 7 capas con dimension de modelo 384, FFN de 1024 y 6 cabezas de atencion, con un vocabulario BPE turco de 8.192 tokens y 15,54 millones de parametros. La version ternaria cuantiza las 35 capas lineales del transformer, asi como las matrices `wte` y `lm_head`, a valores ternarios {-1, 0, +1} empaquetados en 2 bits, manteniendo las capas RMSNorm en FP32.

El proceso de cuantizacion descrito por el autor combina destilacion de conocimiento con QAT en dos fases: primero, una inicializacion de las escalas de grupo mediante minimos cuadrados alternados (ALS) en 3 pasos; despues, un entrenamiento con escalas de grupo aprendibles, estimador de gradiente recto (STE) y calentamiento progresivo de cuantizacion (lambda de 0 a 1). La destilacion incluye KL sobre el vocabulario completo respecto al profesor FP32, MSE normalizado sobre estados ocultos por capa y entropia cruzada ligera sobre tokens de asistente. El motor de inferencia es un C++ propio con AVX2, FMA y T-MAC basado en `vpshufb`, con dos modos: exacto en FP32 (coseno 0,9999999) y T-MAC con LUT de 16 bytes en L1d y cero multiplicaciones en el bucle interno.

## Capacidades

- Generacion de texto conversacional en turco, con soporte declarado para conversaciones multiturno.
- Tool calling / function calling, segun las etiquetas del repositorio.
- Razonamiento basico, comprension lectora, aritmetica y conocimiento general, evaluados con el microbenchmark propio del autor.
- Capacidades limitadas por su tamano: 15,54 M de parametros restringen severamente el razonamiento complejo y el conocimiento factual.
- No se declaran capacidades de vision, audio, agentes multi-paso ni modo thinking.
- Multilingue: solo turco.

## Casos de uso

- Clasificacion y filtrado de texto en turco en el borde (edge): el modelo cabe en cache L3 y puede ejecutarse en CPU sin GPU, lo que lo hace adecuado para prefiltrar o etiquetar flujos de texto en dispositivos de bajos recursos.
- Enrutamiento de intenciones en asistentes de voz o chat: con tool calling y latencia sub-milisegundo por token (0,304 ms/token en 8 hilos), puede decidir que herramienta invocar antes de derivar a un modelo mayor.
- Generacion de respuestas cortas en turco para sistemas embebidos o aplicaciones de escritorio: el binario de 4,19 MB y el motor C++ sin dependencias de PyTorch permiten integrarlo en entornos con restricciones de memoria.
- Prototipado rapido de pipelines de NLP en turco: sirve como baseline ligero para validar tokenizacion, plantillas de chat y formato de salida antes de escalar a modelos mayores.
- Educacion e investigacion sobre cuantizacion ternaria: el repositorio incluye el motor C++ y el informe de evaluacion, lo que permite reproducir y estudiar tecnicas de QAT con destilacion.
- Autocompletado o sugerencia de texto en aplicaciones turcas de bajo consumo: la velocidad reportada (mas de 3.000 tok/s) permite generacion interactiva en CPU de portatil.

## Benchmarks y rendimiento

Resultados del microbenchmark propietario del autor (Mima-TR-MicroBench v1, N=2.000):

| Modelo | Tamano | Puntuacion global | Retencion | Comprension lectora | Logica y sentido comun | Aritmetica y unidades | Lengua turca y ortografia | Cultura general |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Mima 1.5 Pico FP32 original | 72,0 MB | 34,20% | 100,00% | 43,25% | 26,50% | 28,00% | 39,00% | 34,25% |
| Mima 1.5 Pico Ternary (W1.58, G=64) | 4,19 MB | 33,70% | 98,54% | 43,25% | 32,00% | 28,75% | 34,75% | 29,75% |

Rendimiento de inferencia (AMD Ryzen 7 5800U y NVIDIA MX450):

| Motor | Velocidad (tok/s) | Latencia (ms/token) | Aceleracion vs PyTorch CPU |
|---|---:|---:|---:|
| PyTorch FP32 (CPU, 8 hilos) | 48,5 | 20,62 | 1,0x |
| PyTorch FP32 (MX450 CUDA) | 66,4 | 15,06 | 1,4x |
| C++ AVX2 exacto (W1.58A32, 8 hilos) | 1.388,6 | 0,720 | 28,6x |
| C++ AVX2 T-MAC vpshufb (W1.58A8-LUT, 1 nucleo) | 1.211,7 | 0,825 | 25,0x |
| C++ AVX2 T-MAC vpshufb (W1.58A8-LUT, 8 hilos) | 3.286,6 | 0,304 | 67,8x |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo esta disenado para inferencia en CPU. El archivo de pesos ocupa 4,19 MB y cabe en cache L3.
- GPU: no requiere GPU; el autor compara contra una NVIDIA MX450 y el motor C++ no usa CUDA.
- CPU: requiere x86-64 con AVX2 y FMA; el motor usa `-march=native`, `-mavx2`, `-mfma`, `-mf16c` y OpenMP.
- Cabe en cualquier CPU consumer moderna (AMD Ryzen 7 5800U o equivalente) y en sistemas embebidos x86.
- Despliegue: motor C++ propio (`mima_ternary_engine.cpp`) con script `run_mima_ternary.py`; no se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 0,304 ms/token con 8 hilos en modo T-MAC; 0,720 ms/token en modo exacto.
- Throughput: hasta 3.286,6 tok/s en 8 hilos; 1.211,7 tok/s en un solo nucleo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---:|---|---|---|---|---|
| Mima 1.5 Pico 15M Ternary | 15,54 M | No disponible | Turco | Apache 2.0 | `.mima15t` propietario | Ternario W1.58, motor C++ AVX2/T-MAC |
| Mima 1.5 Pico 15M (FP32) | 15,54 M | No disponible | Turco | Apache 2.0 | safetensors/PyTorch (no confirmado) | Modelo base sin cuantizar, 72 MB |
| BitNet b1.58 (referencia conceptual) | Variable (paper) | No disponible | Multiples | No disponible | No disponible | Arquitectura ternaria de referencia de Microsoft Research |
| Modelos SLM turcos de menos de 100M | No disponible | No disponible | Turco | No disponible | No disponible | No se dispone de comparativas publicas verificables en la informacion disponible |

No se dispone de datos de benchmarks comparables con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Tamano muy reducido (15,54 M de parametros): alta probabilidad de alucinacion y conocimiento factual muy limitado; no apto para tareas que requieran precision factual.
- Solo soporta turco; no se declaran capacidades multilingues.
- Longitud de contexto no especificada; probablemente corta dado el diseno del modelo base.
- Los benchmarks presentados son un microbenchmark propietario del autor (Mima-TR-MicroBench v1), no estandares de la industria; deben interpretarse con cautela.
- El formato de pesos es propietario (`.mima15t`) y requiere el motor C++ incluido; no es compatible directamente con ecosistemas como llama.cpp, vLLM u Ollama.
- Requiere CPU x86-64 con AVX2 y FMA; no funciona en ARM ni en entornos sin esas extensiones.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion independiente de los resultados declarados.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluacion externa desaconseja su uso en produccion sin validacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/root-sys-n/Mima-1.5-Pico-15m-Ternary
- Modelo base: https://huggingface.co/root-sys-n/Mima-1.5-Pico-15m
- No se han encontrado papers, blogs, repositorios o demos adicionales en la informacion disponible.
