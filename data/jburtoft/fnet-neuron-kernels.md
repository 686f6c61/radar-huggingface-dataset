# jburtoft/fnet-neuron-kernels

## Resumen

Este repositorio contiene un kernel de transformada rápida de Fourier (FFT) diseñado para acelerar la inferencia del modelo FNet en hardware AWS Trainium e Inferentia. FNet es una arquitectura tipo encoder Transformer que sustituye las capas de autoatención por transformadas de Fourier sin parámetros, lo que reduce drásticamente el coste computacional y la memoria. El kernel, escrito en Neuron Kernel Interface (NKI), implementa la FFT 2D real que necesita FNet, optimizada para las unidades tensoriales de estos aceleradores.

El autor, jburtoft, publicó inicialmente este kernel como un repositorio de tipo "model" en Hugging Face, pero posteriormente lo ha movido a un repositorio de tipo "kernel" de primera clase con el nombre `jburtoft/fnet-fast-fourier-transform-neuron-kernels`. La versión v1 aquí publicada está deprecada y congelada, pero se mantiene para que las referencias existentes en `KernelConfig` sigan resolviendo. La versión v2 ofrece mejoras sustanciales en velocidad y precisión, con un 25-50% menos de multiplicaciones de matrices por tile, un 36-45% menos de operaciones ISA y una precisión numérica aproximadamente 84 veces mejor.

Este kernel no es un modelo de lenguaje ni un modelo de aprendizaje automático en sí mismo; es un componente de cómputo de bajo nivel que permite ejecutar FNet de forma eficiente en hardware Neuron. Su relevancia radica en que hace viable el despliegue de arquitecturas basadas en Fourier en entornos de producción con aceleradores AWS, un caso de uso creciente en la optimización de transformers.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kernel NKI (Neuron Kernel Interface) para FFT 2D real |
| Parametros totales | No aplica (no es un modelo con pesos) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No aplica |
| Licencia | Apache-2.0 |
| Formato de pesos | No aplica (codigo fuente del kernel) |

## Arquitectura y entrenamiento

El kernel implementa la transformada de Fourier discreta (DFT) 2D real que FNet requiere en sus dos pasadas principales. La versión v1 realizaba una transformada compleja-compleja completa en ambas pasadas, desperdiciando operaciones al multiplicar por ceros en la parte imaginaria o descartar resultados imaginarios. La v2 introduce una especialización `r2c` (real a complejo) y `c2r` (complejo a real) que elimina estas ineficiencias.

Además, la v2 explota la simetría exacta de la matriz DFT (`W[k,n] = exp(-2*pi*i*k*n/N)` es simétrica), reduciendo el producto `k*n` módulo `N` antes del escalado para que la matriz en float32 sea simétrica a 0 ULP. Esto elimina dos operaciones `nc_transpose` y dos copias PSUM por DFT. También se cachean las constantes (matrices DFT y twiddle) para evitar las 144 transferencias host a dispositivo que ocurrían en v1 en una pasada típica de `B=4, S=512, D=768`. El procesamiento por lotes se realiza mediante "batch folding" en lugar de un bucle Python serial, y se utiliza una mariposa final solo real con ensamblaje de salida fusionado.

El kernel no ha sido entrenado; es un componente de inferencia. Su comportamiento está documentado como equivalente a `torch.fft.fftn(x, dim=(1, 2)).real` sobre tensores de forma `(B, S, D)`. La v2 incluye una corrección importante en la documentación: la v1 afirmaba incorrectamente que los tamaños no potencia de dos se rellenaban a la siguiente potencia de dos y se truncaban; en realidad la implementación calculaba la DFT verdadera de N puntos. La v2 documenta el comportamiento real y lo verifica con `test_e2e.py`.

## Capacidades

- Implementa la FFT 2D real para FNet, aceptando tensores de entrada `(B, S, D)` y devolviendo `(B, S, D)` equivalente a `torch.fft.fftn(x, dim=(1, 2)).real`.
- Optimizado para hardware AWS Trainium e Inferentia mediante NKI.
- Soporta tamaños de secuencia y dimensiones ocultas de 128, 256 y 512 (funciones `_fast_fourier_transform_{128,256,512}_{r2c,c2r}`).
- En v2, reduce el número de multiplicaciones de matrices Tensor Engine entre un 25-50% por tile y el total de operaciones ISA entre un 36-45% por tile.
- Precisión numérica mejorada: error relativo máximo de `3.1e-07` frente a `2.6e-05` en v1 (referencia float64 de `torch.fft`).
- No incluye capacidades de generación de texto, razonamiento, código, visión ni tool calling, al no ser un modelo de lenguaje.

## Casos de uso

- Inferencia de FNet en AWS Trainium/Inferentia: el kernel acelera la pasada de Fourier de FNet, reduciendo el coste computacional y la latencia en entornos de producción con estos aceleradores.
- Integración con Hugging Face Transformers: se puede conectar mediante `KernelConfig` en la clase `FNetBasicFourierTransform`, sustituyendo la implementación por defecto por este kernel optimizado.
- Despliegue de modelos FNet a gran escala: al reducir las operaciones de matriz y el tráfico host-dispositivo, permite servir modelos FNet con mayor throughput en AWS.
- Investigación sobre kernels eficientes para arquitecturas sin atención: el código sirve como referencia para implementar FFT en NKI y para explorar optimizaciones similares en otros modelos basados en Fourier.
- Migración de v1 a v2: las organizaciones que ya usaban la v1 pueden actualizar sus `KernelConfig` para beneficiarse de la mejora de rendimiento y precisión, siguiendo las instrucciones de renombrado proporcionadas.
- Evaluación de alternativas a la atención en producción: el kernel permite medir el impacto real de FNet en hardware dedicado, comparando costes y rendimiento frente a transformers con atención.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README menciona mejoras relativas de la v2 frente a la v1 (25-50% menos matmuls, 36-45% menos operaciones ISA, ~84x mejor precisión), pero no proporciona cifras absolutas de latencia o throughput en hardware concreto. No se dispone de comparaciones con otras implementaciones de FFT o kernels alternativos.

## Requisitos de hardware

- Requiere hardware AWS Trainium (Trn1) o Inferentia (Inf1/Inf2) con soporte para Neuron SDK y NKI.
- No se especifican requisitos de VRAM porque el kernel no almacena pesos; la memoria necesaria depende del modelo FNet completo que se esté ejecutando.
- El despliegue se realiza típicamente con Hugging Face Optimum Neuron, que gestiona la compilación y ejecución de kernels NKI.
- No es compatible con GPUs convencionales (NVIDIA, AMD) ni con CPU; está diseñado exclusivamente para la arquitectura Neuron.
- No se proporcionan datos de latencia o throughput estimados.

## Comparativa con modelos similares

No disponible. No se han encontrado kernels alternativos de FFT para FNet en Trainium/Inferentia en la información proporcionada. La comparación natural sería con la implementación por defecto de FNet en PyTorch (que usa `torch.fft`), pero no se ofrecen cifras comparativas en el repositorio.

## Limitaciones y advertencias

- Repositorio deprecado: la v1 está congelada y no recibirá actualizaciones. Se recomienda migrar al nuevo repositorio `jburtoft/fnet-fast-fourier-transform-neuron-kernels` para obtener mejor rendimiento y precisión.
- No es un modelo de lenguaje: no genera texto, no razona, no procesa lenguaje natural. Su única función es acelerar una operación matemática específica.
- Dependencia de hardware AWS: el kernel solo funciona en Trainium/Inferentia; no es portable a otras plataformas.
- La documentación de la v1 contenía errores sobre el manejo de tamaños no potencia de dos, corregidos en la v2. Los usuarios de v1 deben ser conscientes de que el comportamiento real difería de lo descrito.
- El kernel asume entradas con dimensiones específicas (128, 256, 512); otros tamaños pueden requerir adaptación o no estar soportados.
- Licencia Apache 2.0 permite uso comercial, pero la dependencia de hardware propietario de AWS puede limitar la portabilidad.

## Enlaces

- Repositorio HuggingFace original (deprecado): https://huggingface.co/jburtoft/fnet-neuron-kernels
- Nuevo repositorio (v2): https://huggingface.co/kernels/jburtoft/fnet-fast-fourier-transform-neuron-kernels
- Documentación de FNet en Hugging Face Transformers: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/fnet.md
- Repositorio de Google Research con el código original de FNet: https://github.com/google-research/google-research/tree/master/f_net
