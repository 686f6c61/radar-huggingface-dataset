# Arko007/Zenyx-MCEN-Delta-Mamba

## Resumen

Zenyx-MCEN-Delta-Mamba es un modelo de lenguaje de aproximadamente 565 millones de parametros desarrollado por el autor independiente Arko007, publicado bajo licencia Apache 2.0. Se trata de una arquitectura hibrida que intercala dos secuencias mixers modernos —Mamba-3 en configuracion MIMO y Gated DeltaNet-2 (GDN-2)— con dos etapas MCEN, un nucleo de "razonamiento" de punto fijo reversible dotado de una memoria con regla delta. El objetivo declarado es explorar una arquitectura propia (custom-architecture) que combine mecanismos de espacio de estados con memoria persistente, entrenada desde cero sobre la mezcla de preentrenamiento Zenyx-V3 y el tokenizador de DeepSeek de 129.280 tokens.

El modelo es un base model, no un modelo instruido: completa texto y no sigue instrucciones. Ademas, el repositorio contiene checkpoints, registros y diagnosticos de un entrenamiento en curso, no una version final. La model card fija una instantanea en el paso 4.100 de 11.444 planificados, lo que equivale a 0,54.000 millones de tokens de los 1.500 millones previstos (un 36% del presupuesto). Los checkpoints posteriores en checkpoints/main565m/ son mas recientes que los numeros publicados.

Su relevancia actual es principalmente de investigacion: documenta de forma transparente metricas de bits por byte (bits per byte) en The Pile frente a otros modelos del mismo autor, asi como la composicion exacta de 121 fuentes de datos. No obstante, su estado de desarrollo, su tamano moderado y su ventana de contexto de 4.096 tokens lo sitúan lejos de un uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 14 etapas que intercalan 6 × Mamba-3 (MIMO), 6 × Gated DeltaNet-2 y 2 × MCEN |
| Parametros totales | ~565M (rango de preset 540-600M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible en la informacion; pesos almacenados principalmente en fp16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria pytorch) |

## Arquitectura y entrenamiento

La arquitectura sigue un plan de 14 etapas con la secuencia `M3 GDN2 M3 GDN2 M3 GDN2 MCEN M3 GDN2 M3 GDN2 M3 GDN2 MCEN`, donde `M3` es Mamba-3 y `GDN2` es Gated DeltaNet-2. El tamano oculto es 1.536 y la FFN 3.072, con vocabulario de 129.280 tokens (tokenizador de DeepSeek) y embedding de entrada/salida atado. Los bloques Mamba-3 usan d_state 64, dimension de cabeza 64, factor de expansion 2 y rango MIMO 2. Los bloques GDN-2 emplean 24 cabezas de dimension 64. Las dos etapas MCEN constituyen el nucleo propietario: d_reason 1.024, 16 cabezas de memoria de 64, FFN de 2.752, lectura persistente de rango 64, solver RevDEQ con beta = 0,25 y modo de memoria `delta`. El modelo incorpora ademas prediccion multi-token con profundidad 1, peso de perdida 0,1 y mixer `gdn2`.

El entrenamiento parte de cero sobre la mezcla Zenyx-V3, con 131.072 tokens por paso de optimizador y un presupuesto planificado de 1.500 millones de tokens en 11.444 pasos. El optimizador combina Muon para los parametros matriciales (lr 0,02) y AdamW para el resto (lr 3e-4, weight decay 0,1), con decaimiento coseno hasta el 10%. La precision es fp16 en el backbone con escalado dinamico de perdida; el solver MCEN opera en fp16 con rescate fp32 a nivel de token en T4 y en fp32/TF32 en la prueba puntual sobre H200. El hardware empleado fueron sesiones de 2 × T4 en Kaggle y una extension en una unica H200 (Lightning), reanudando desde checkpoints entre sesiones. La mezcla de datos cubre 121 fuentes con hash de manifiesto `9454e840c2b9f032…`, dominada por bigcode/starcoderdata (26,16%), fineweb-edu (15,09%) y Nemotron-SFT-Math-v3 (10,06%), con presencia significativa de contenidos matematicos, cientificos y de razonamiento.

## Capacidades

- Generacion de texto autoregresiva en ingles, propio de un base model sin ajuste de instrucciones.
- Modelado de lenguaje con ventana de contexto de 4.096 tokens.
- Prediccion multi-token (profundidad 1) como objetivo auxiliar de entrenamiento.
- Fuerte presencia de datos de codigo (26,16% starcoderdata) y matematicas en el preentrenamiento, orientada a modelado de esos dominios.
- Memoria persistente en las etapas MCEN mediante regla delta, disenada para retener informacion entre pasos.
- No dispone de tool calling, function calling ni soporte de agentes documentado.
- No dispone de modo de razonamiento explicito (thinking mode), vision ni audio documentados.
- Capacidad multilingue limitada: solo se declara ingles.
- No sigue instrucciones: requiere prompts de continuacion de texto, no de dialogo.

## Casos de uso

- Investigacion en arquitecturas hibridas SSM/attention: sirve como punto de partida reproducible para estudiar la interaccion entre Mamba-3, Gated DeltaNet-2 y un nucleo de memoria MCEN, dado que el autor publica registros y diagnosticos de entrenamiento.
- Modelado de lenguaje para investigacion academica: la ventana de 4.096 tokens y el vocabulario de 129.280 entradas permiten experimentar con eficiencia de tokenizacion sobre corpus tecnicos.
- Analisis de mezclas de datos de preentrenamiento: el manifiesto de 121 fuentes permite reproducir y estudiar el efecto de proporciones concretas (por ejemplo, 26,16% de codigo) sobre la perdida por dominio.
- Generacion y autocompletado de codigo en entornos de investigacion: la proporcion de starcoderdata y la inclusion de dominios de codigo lo hacen util para experimentos de modelado de codigo, no para asistencia interactiva.
- Modelado de textos cientificos y matematicos: la mezcla incluye finemath, arXiv y PubMed Central, adecuada para tareas de continuacion de texto especializado.
- Estudio de decodificacion eficiente en hardware limitado: su tamano de 565M parametros permite ejecutar experimentos de inferencia en GPU de consumo y analizar el comportamiento de los mixers secuenciales.
- Base para posteriores ajustes (fine-tuning): al ser un base model con licencia Apache 2.0, puede servir de punto de partida para experimentos de ajuste supervisado en ingles, siempre asumiendo su estado incompleto.

## Benchmarks y rendimiento

Los datos disponibles corresponden a la instantanea del paso 4.100, medidos en bits por byte (menor es mejor) sobre The Pile por dominio, con ventana deslizante de 1.024 tokens y paso 512. Las columnas de comparacion son otros modelos del mismo autor: Zenyx-v2-base (85M parametros unicos) y Zenyx-V3-Base (1.58B, MoE). Las cifras de MCEN y V3 se midieron en una T4 (fp16) y las de V2 en fp32.

| Dominio | MCEN @4.100 | V2 @96.000 | V3 @107.200 | MCEN − V2 | texto (MB) |
| --- | :---: | :---: | :---: | :---: | ---: |
| DM Mathematics | 1,8535 | 2,1898 | 1,3201 | -0,3363 | 0,81 |
| ArXiv | 1,3221 | 1,5944 | 0,8565 | -0,2723 | 1,50 |
| Books3 | 1,9334 | 2,1966 | 1,3300 | -0,2632 | 1,51 |
| PubMed Central | 1,1163 | 1,3518 | 0,7426 | -0,2356 | 1,51 |
| FreeLaw | 1,4213 | 1,6474 | 0,9632 | -0,2262 | 1,51 |
| Wikipedia (en) | 1,3944 | 1,6001 | 0,9902 | -0,2057 | 1,50 |
| USPTO Backgrounds | 1,0945 | no disponible | no disponible | no disponible | no disponible |

El resto de la tabla de dominios esta truncada en la informacion proporcionada. No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los ~565M parametros: aproximadamente 1,13 GB de pesos en fp16, ~0,57 GB en int8 y ~0,28 GB en int4, mas el coste de activaciones y estado de los mixers.
- Cabe con holgura en GPU de consumo: RTX 3060 (12 GB), RTX 4070, RTX 4090, etc., incluso en fp16.
- El entrenamiento se realizo en 2 × T4 (Kaggle) y en una unica H200 (Lightning) para la prueba de mayor precision; esa combinacion es indicativa de los recursos reales empleados.
- Opciones de despliegue: al estar en safetensors y PyTorch, requiere cargar los pesos con la implementacion acompasada del autor. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, dado que la arquitectura es personalizada.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota: los requisitos anteriores son estimaciones derivadas del numero de parametros, no cifras oficiales publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| Zenyx-MCEN-Delta-Mamba | ~565M | 4.096 | safetensors (PyTorch) | Apache 2.0 | Entrenamiento en curso (36% del presupuesto) |
| Zenyx-V3-Base | 1.58B (MoE) | no disponible | safetensors | Apache 2.0 | Preentrenamiento activo (~81B tokens) |
| Zenyx-v2-base | 85M | no disponible | no disponible | Apache 2.0 | Base publicado |
| Zenyx_Base_220M | ~220M | no disponible | safetensors (JAX/Flax) | Apache 2.0 | Base publicado (7 idiomas) |

La comparacion esta limitada al ecosistema del mismo autor, ya que la arquitectura MCEN/Mamba-3/GDN-2 no tiene equivalentes publicos directos en la informacion disponible. Los modelos comparados difieren mucho en tamano y en volumen de entrenamiento, por lo que las cifras no son equiparables.

## Limitaciones y advertencias

- Modelo base sin ajuste de instrucciones: no responde a comandos ni mantiene dialogos.
- Entrenamiento incompleto: la instantanea publicada representa el 36% del presupuesto previsto (0,54.000 millones de tokens de 1.500 millones), por lo que el rendimiento puede mejorar sustancialmente en checkpoints posteriores.
- Ventana de contexto reducida (4.096 tokens), insuficiente para tareas de contexto largo.
- Soporte unicamente en ingles.
- Arquitectura personalizada: la carga de pesos exige la implementacion especifica del autor; no hay garantia de compatibilidad con herramientas estandar de inferencia.
- Riesgo de alucinacion inherente a un modelo base no alineado; no se documentan mitigaciones.
- El solver MCEN en fp16 requirio rescates en fp32 a nivel de token en T4, lo que sugiere sensibilidad numerica en ese componente y posibles diferencias de comportamiento segun hardware.
- No se han publicado evaluaciones de sesgos, toxicidad o seguridad.
- Licencia Apache 2.0, que permite uso comercial, pero el estado de desarrollo y la ausencia de benchmarks de tareas desaconsejan su uso en produccion.
- Repositorio de 222,8 GB por acumulacion de checkpoints, mas propio de un espacio de trabajo que de un artefacto de despliegue.
- No hay descargas ni valoraciones (0 descargas, 0 me gusta) en el momento de la ficha, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Arko007/Zenyx-MCEN-Delta-Mamba
- Zenyx-V3-Base (modelo comparado): https://huggingface.co/Arko007/Zenyx-V3-Base
- Zenyx_Base_220M (modelo del mismo autor): https://huggingface.co/Arko007/Zenyx_Base_220M/tree/main
- Ficha de Zenyx-V3-Base en Essa Mamdani: https://essamamdani.com/ai-models/hf-arko007-zenyx-v3-base
- Listado de modelos de Arko007 en Essa Mamdani: https://essamamdani.com/ai-models/company/arko007
- Listado de modelos de Arko007 en SAVRN: https://savrn.com/model-publishers/arko007
- Dataset HuggingFaceFW/fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset bigcode/starcoderdata: https://huggingface.co/datasets/bigcode/starcoderdata
- Dataset HuggingFaceTB/finemath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset nvidia/Nemotron-SFT-Math-v3: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Math-v3
